import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { canonicalJson } from "./canonical-json.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./context-closure.mjs";
import { compileContext, computeTaskMaterialFingerprint } from "./context-compiler.mjs";
import { observeContextProviders } from "./context-provider.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./identity.mjs";
import { verifyRepositoryIdentity } from "./repository-identity.mjs";
import { verifySourceGeneration } from "./source-generation.mjs";
import {
  fail,
  inspectBoundedWorktreePath,
  isPlainObject,
  requireIdentity,
  requirePlainObject,
  requirePortableId,
  readJson,
  reverifyStateDomain,
  semanticIdentity,
} from "./state-domain.mjs";

export const I4_BASE_CONTEXT_PROVIDERS = Object.freeze([]);
export const I4_BASE_POLICY = Object.freeze({
  schemaVersion: "CIC_I4_POLICY_V1",
  schemaFloor: 1,
  policyFloor: 1,
  requiredRoles: Object.freeze([
    "TASK_CONTRACT",
    "OWNER_DECISION",
    "TASK_AUTHORIZATION",
    "WORKING_SET_CHECKPOINT",
    "CONTEXT_COMPILATION",
    "SOURCE_GENERATION_PROOF",
    "REPOSITORY_IDENTITY_PROOF",
  ]),
});

const MIRROR_CURRENTNESS_SCHEMA_VERSION = "CIC_MIRROR_CURRENTNESS_V1";

const MIRROR_CURRENTNESS_AUTHORITY = Object.freeze({
  factAuthority: "DERIVED_NON_AUTHORITATIVE",
  mutationAuthorization: false,
  mirrorWriteAuthorization: false,
  sourceWriteAuthorization: false,
  publicationAuthorization: false,
  ownerAuthorization: false,
  targetedPruning: "OFF",
});

const MIRROR_STATES = new Set([
  "CURRENT",
  "UNAVAILABLE",
  "STALE",
  "DIVERGENT",
  "PARTIAL",
  "LOCATOR_MISMATCH",
]);

const SENSITIVE_MIRROR_KEYS = new Set([
  "url",
  "uri",
  "locator",
  "rawlocator",
  "credential",
  "credentials",
  "token",
  "accesstoken",
  "refreshtoken",
  "apikey",
  "password",
  "cookie",
  "cookies",
  "authorization",
  "authorizationheader",
  "secret",
  "secretvalue",
  "content",
  "contents",
]);

function mirrorCurrentnessFail(code = "MIRROR_CURRENTNESS_INVALID") {
  fail(code);
}

function requireExactKeys(value, keys) {
  requirePlainObject(value, "mirror-currentness object");
  if (Object.keys(value).sort().join("\0") !== [...keys].sort().join("\0")) {
    mirrorCurrentnessFail();
  }
}

function rejectMirrorSecretsOrExecutables(value, ancestors = new Set()) {
  if (typeof value === "function" || typeof value === "symbol" || typeof value === "bigint") {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_INJECTION_REJECTED");
  }
  if (typeof value === "string") {
    if (/(?:[a-z][a-z0-9+.-]*:\/\/|^file:|^[a-z]:[\\/]|^\\\\|^\/|\bbearer\s+)/iu.test(value)) {
      mirrorCurrentnessFail("MIRROR_CURRENTNESS_SENSITIVE_VALUE_REJECTED");
    }
    return;
  }
  if (value === null || typeof value !== "object") return;
  if (ancestors.has(value)) mirrorCurrentnessFail("MIRROR_CURRENTNESS_INJECTION_REJECTED");
  ancestors.add(value);
  try {
    for (const [key, entry] of Object.entries(value)) {
      const normalizedKey = key.replaceAll(/[^a-z0-9]/giu, "").toLowerCase();
      if (SENSITIVE_MIRROR_KEYS.has(normalizedKey)) {
        mirrorCurrentnessFail("MIRROR_CURRENTNESS_SENSITIVE_FIELD_REJECTED");
      }
      rejectMirrorSecretsOrExecutables(entry, ancestors);
    }
  } finally {
    ancestors.delete(value);
  }
}

function requireByteCount(value) {
  if (!Number.isSafeInteger(value) || value < 0) mirrorCurrentnessFail();
  return value;
}

function normalizeMirrorFile(raw) {
  requireExactKeys(raw, ["path", "bytes", "sha256"]);
  return {
    path: normalizeRepoRelativePath(raw.path),
    bytes: requireByteCount(raw.bytes),
    sha256: requireIdentity(raw.sha256, "mirror file SHA-256"),
  };
}

function normalizeMirrorFiles(files, { allowEmpty = true } = {}) {
  if (!Array.isArray(files) || (!allowEmpty && files.length === 0)) mirrorCurrentnessFail();
  const normalized = files
    .map(normalizeMirrorFile)
    .sort((left, right) => left.path.localeCompare(right.path));
  if (new Set(normalized.map(({ path: filePath }) => filePath)).size !== normalized.length) {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_DUPLICATE_FILE");
  }
  return normalized;
}

function normalizeGovernedMirrors(mirrors) {
  if (!Array.isArray(mirrors) || mirrors.length === 0) mirrorCurrentnessFail();
  const normalized = mirrors
    .map((mirror) => {
      requireExactKeys(mirror, ["mirrorId", "locatorIdentity"]);
      return {
        mirrorId: requirePortableId(mirror.mirrorId, "mirror id"),
        locatorIdentity: requireIdentity(mirror.locatorIdentity, "mirror locator identity"),
      };
    })
    .sort((left, right) => left.mirrorId.localeCompare(right.mirrorId));
  if (new Set(normalized.map(({ mirrorId }) => mirrorId)).size !== normalized.length) {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_DUPLICATE_MIRROR");
  }
  return normalized;
}

function normalizeMirrorObservation(raw) {
  requireExactKeys(raw, [
    "mirrorId",
    "locatorIdentity",
    "availability",
    "observedGenerationFingerprint",
    "files",
  ]);
  if (!new Set(["AVAILABLE", "UNAVAILABLE"]).has(raw.availability)) {
    mirrorCurrentnessFail();
  }
  const observedGenerationFingerprint =
    raw.observedGenerationFingerprint === null
      ? null
      : requireIdentity(raw.observedGenerationFingerprint, "observed Source generation");
  if (raw.availability === "AVAILABLE" && observedGenerationFingerprint === null) {
    mirrorCurrentnessFail();
  }
  return {
    mirrorId: requirePortableId(raw.mirrorId, "observed mirror id"),
    locatorIdentity: requireIdentity(raw.locatorIdentity, "observed locator identity"),
    availability: raw.availability,
    observedGenerationFingerprint,
    files: normalizeMirrorFiles(raw.files),
  };
}

function classifyMirror(governedMirror, observation, expectedGeneration, governedFiles) {
  if (observation === null || observation.availability === "UNAVAILABLE") {
    return { state: "UNAVAILABLE", reasonCodes: ["MIRROR_UNAVAILABLE"] };
  }
  if (observation.locatorIdentity !== governedMirror.locatorIdentity) {
    return { state: "LOCATOR_MISMATCH", reasonCodes: ["MIRROR_LOCATOR_MISMATCH"] };
  }
  if (observation.observedGenerationFingerprint !== expectedGeneration) {
    return { state: "STALE", reasonCodes: ["MIRROR_GENERATION_STALE"] };
  }
  const expectedPaths = governedFiles.map(({ path: filePath }) => filePath);
  const observedPaths = observation.files.map(({ path: filePath }) => filePath);
  if (canonicalJson(expectedPaths) !== canonicalJson(observedPaths)) {
    return { state: "PARTIAL", reasonCodes: ["MIRROR_FILE_SET_PARTIAL"] };
  }
  if (
    observation.files.some((file, index) => {
      const expected = governedFiles[index];
      return file.bytes !== expected.bytes || file.sha256 !== expected.sha256;
    })
  ) {
    return { state: "DIVERGENT", reasonCodes: ["MIRROR_FILE_DIVERGENT"] };
  }
  return { state: "CURRENT", reasonCodes: [] };
}

function buildMirrorResult(governedMirror, observation, expectedGeneration, governedFiles) {
  const facts =
    observation === null
      ? {
          mirrorId: governedMirror.mirrorId,
          locatorIdentity: null,
          availability: "UNAVAILABLE",
          observedGenerationFingerprint: null,
          files: [],
        }
      : observation;
  const classification = classifyMirror(
    governedMirror,
    observation,
    expectedGeneration,
    governedFiles,
  );
  const observationIdentity = semanticIdentity("CIC-MIRROR-OBSERVATION-V1", facts);
  return { ...facts, ...classification, observationIdentity };
}

function mirrorReportBody(bindings, governedSourceFiles, governedMirrors, mirrors) {
  const reasonCodes = [
    ...new Set(mirrors.flatMap(({ reasonCodes: mirrorReasons }) => mirrorReasons)),
  ].sort();
  return {
    schemaVersion: MIRROR_CURRENTNESS_SCHEMA_VERSION,
    ...MIRROR_CURRENTNESS_AUTHORITY,
    bindings,
    governedSourceFiles,
    governedMirrors,
    mirrors,
    disposition: mirrors.every(({ state }) => state === "CURRENT") ? "CONVERGED" : "BLOCKED",
    reasonCodes,
  };
}

function normalizeMirrorReportEntry(raw) {
  requireExactKeys(raw, [
    "mirrorId",
    "locatorIdentity",
    "availability",
    "observedGenerationFingerprint",
    "files",
    "state",
    "reasonCodes",
    "observationIdentity",
  ]);
  if (!MIRROR_STATES.has(raw.state) || !Array.isArray(raw.reasonCodes)) {
    mirrorCurrentnessFail();
  }
  const facts = {
    mirrorId: requirePortableId(raw.mirrorId, "report mirror id"),
    locatorIdentity:
      raw.locatorIdentity === null
        ? null
        : requireIdentity(raw.locatorIdentity, "report locator identity"),
    availability: raw.availability,
    observedGenerationFingerprint:
      raw.observedGenerationFingerprint === null
        ? null
        : requireIdentity(raw.observedGenerationFingerprint, "report Source generation"),
    files: normalizeMirrorFiles(raw.files),
  };
  if (!new Set(["AVAILABLE", "UNAVAILABLE"]).has(facts.availability)) {
    mirrorCurrentnessFail();
  }
  if (
    raw.observationIdentity !== semanticIdentity("CIC-MIRROR-OBSERVATION-V1", facts) ||
    raw.reasonCodes.some((code) => typeof code !== "string")
  ) {
    mirrorCurrentnessFail();
  }
  return {
    ...facts,
    state: raw.state,
    reasonCodes: [...raw.reasonCodes],
    observationIdentity: raw.observationIdentity,
  };
}

export function createMirrorCurrentnessReport(input) {
  rejectMirrorSecretsOrExecutables(input);
  requireExactKeys(input, [
    "currentTruthIdentity",
    "sourceGenerationFingerprint",
    "sourceManifestIdentity",
    "governedSourceFiles",
    "governedMirrors",
    "mirrorObservations",
  ]);
  const currentTruthIdentity = requireIdentity(
    input.currentTruthIdentity,
    "current-truth identity",
  );
  const sourceGenerationFingerprint = requireIdentity(
    input.sourceGenerationFingerprint,
    "Source generation",
  );
  const sourceManifestIdentity = requireIdentity(
    input.sourceManifestIdentity,
    "SOURCE-MANIFEST identity",
  );
  const governedSourceFiles = normalizeMirrorFiles(input.governedSourceFiles, {
    allowEmpty: false,
  });
  const governedMirrors = normalizeGovernedMirrors(input.governedMirrors);
  if (!Array.isArray(input.mirrorObservations)) mirrorCurrentnessFail();
  const observations = input.mirrorObservations.map(normalizeMirrorObservation);
  if (new Set(observations.map(({ mirrorId }) => mirrorId)).size !== observations.length) {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_DUPLICATE_MIRROR");
  }
  const governedIds = new Set(governedMirrors.map(({ mirrorId }) => mirrorId));
  if (observations.some(({ mirrorId }) => !governedIds.has(mirrorId))) {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_UNKNOWN_MIRROR");
  }
  const observationById = new Map(
    observations.map((observation) => [observation.mirrorId, observation]),
  );
  const bindings = {
    currentTruthIdentity,
    sourceGenerationFingerprint,
    sourceManifestIdentity,
    governedSourceFileCatalogIdentity: semanticIdentity(
      "CIC-GOVERNED-SOURCE-FILE-CATALOG-V1",
      governedSourceFiles,
    ),
    governedMirrorSetIdentity: semanticIdentity("CIC-GOVERNED-MIRROR-SET-V1", governedMirrors),
  };
  const mirrors = governedMirrors.map((governedMirror) =>
    buildMirrorResult(
      governedMirror,
      observationById.get(governedMirror.mirrorId) ?? null,
      sourceGenerationFingerprint,
      governedSourceFiles,
    ),
  );
  const body = mirrorReportBody(bindings, governedSourceFiles, governedMirrors, mirrors);
  return {
    ...body,
    reportIdentity: semanticIdentity("CIC-MIRROR-CURRENTNESS-REPORT-V1", body),
  };
}

export function verifyMirrorCurrentnessReport(report, expected) {
  rejectMirrorSecretsOrExecutables(report);
  rejectMirrorSecretsOrExecutables(expected);
  requireExactKeys(report, [
    "schemaVersion",
    "factAuthority",
    "mutationAuthorization",
    "mirrorWriteAuthorization",
    "sourceWriteAuthorization",
    "publicationAuthorization",
    "ownerAuthorization",
    "targetedPruning",
    "bindings",
    "governedSourceFiles",
    "governedMirrors",
    "mirrors",
    "disposition",
    "reasonCodes",
    "reportIdentity",
  ]);
  requireExactKeys(expected, [
    "currentTruthIdentity",
    "sourceGenerationFingerprint",
    "sourceManifestIdentity",
    "governedSourceFiles",
    "governedMirrors",
  ]);
  if (
    report.schemaVersion !== MIRROR_CURRENTNESS_SCHEMA_VERSION ||
    Object.entries(MIRROR_CURRENTNESS_AUTHORITY).some(([key, value]) => report[key] !== value) ||
    !new Set(["CONVERGED", "BLOCKED"]).has(report.disposition) ||
    !Array.isArray(report.reasonCodes) ||
    !Array.isArray(report.mirrors)
  ) {
    mirrorCurrentnessFail();
  }
  const governedSourceFiles = normalizeMirrorFiles(expected.governedSourceFiles, {
    allowEmpty: false,
  });
  const governedMirrors = normalizeGovernedMirrors(expected.governedMirrors);
  const expectedBindings = {
    currentTruthIdentity: requireIdentity(expected.currentTruthIdentity, "expected current truth"),
    sourceGenerationFingerprint: requireIdentity(
      expected.sourceGenerationFingerprint,
      "expected Source generation",
    ),
    sourceManifestIdentity: requireIdentity(
      expected.sourceManifestIdentity,
      "expected SOURCE-MANIFEST",
    ),
    governedSourceFileCatalogIdentity: semanticIdentity(
      "CIC-GOVERNED-SOURCE-FILE-CATALOG-V1",
      governedSourceFiles,
    ),
    governedMirrorSetIdentity: semanticIdentity("CIC-GOVERNED-MIRROR-SET-V1", governedMirrors),
  };
  if (
    canonicalJson(report.bindings) !== canonicalJson(expectedBindings) ||
    canonicalJson(report.governedSourceFiles) !== canonicalJson(governedSourceFiles) ||
    canonicalJson(report.governedMirrors) !== canonicalJson(governedMirrors) ||
    report.mirrors.length !== governedMirrors.length
  ) {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_BINDING_STALE");
  }
  const normalizedEntries = report.mirrors.map(normalizeMirrorReportEntry);
  const reportById = new Map(normalizedEntries.map((entry) => [entry.mirrorId, entry]));
  if (reportById.size !== normalizedEntries.length) {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_DUPLICATE_MIRROR");
  }
  const mirrors = governedMirrors.map((governedMirror) => {
    const supplied = reportById.get(governedMirror.mirrorId);
    if (supplied === undefined) mirrorCurrentnessFail();
    const facts = {
      mirrorId: supplied.mirrorId,
      locatorIdentity: supplied.locatorIdentity,
      availability: supplied.availability,
      observedGenerationFingerprint: supplied.observedGenerationFingerprint,
      files: supplied.files,
    };
    const observation = supplied.locatorIdentity === null ? null : facts;
    return buildMirrorResult(
      governedMirror,
      observation,
      expectedBindings.sourceGenerationFingerprint,
      governedSourceFiles,
    );
  });
  const body = mirrorReportBody(expectedBindings, governedSourceFiles, governedMirrors, mirrors);
  const suppliedBody = { ...report };
  delete suppliedBody.reportIdentity;
  if (
    canonicalJson(suppliedBody) !== canonicalJson(body) ||
    report.reportIdentity !== semanticIdentity("CIC-MIRROR-CURRENTNESS-REPORT-V1", body)
  ) {
    mirrorCurrentnessFail("MIRROR_CURRENTNESS_SEMANTIC_MISMATCH");
  }
  return Object.freeze({
    status: "PASS",
    disposition: body.disposition,
    reportIdentity: report.reportIdentity,
  });
}

const FORBIDDEN_CALLER_KEYS = new Set([
  "capabilities",
  "contextCompilation",
  "currentTruth",
  "dimensions",
  "observeGeneration",
  "observeProviders",
  "providerCallback",
  "providerCallbacks",
  "providerObservation",
  "providerObservations",
  "providerRegistry",
  "providerResult",
  "providerResults",
  "requiredDimensions",
  "repositoryObservation",
  "sourceObservation",
]);

const I4_TEST_GENERATION_PHASE = "AFTER_GEN_START_OBSERVATION";
let i4TestGenerationPhaseBarrier = null;

export function installI4GenerationPhaseBarrierForTest() {
  if (process.env.VITEST !== "true") {
    throw new Error("CIC_I4_TEST_GENERATION_BARRIER_UNAVAILABLE");
  }
  if (i4TestGenerationPhaseBarrier !== null) {
    throw new Error("CIC_I4_TEST_GENERATION_BARRIER_ALREADY_INSTALLED");
  }

  let markReached;
  let releaseBarrier;
  const reached = new Promise((resolve) => {
    markReached = resolve;
  });
  const released = new Promise((resolve) => {
    releaseBarrier = resolve;
  });
  const barrier = {
    consumed: false,
    markReached,
    phase: I4_TEST_GENERATION_PHASE,
    reached,
    releaseBarrier,
    released,
    releasedOnce: false,
  };
  i4TestGenerationPhaseBarrier = barrier;

  return Object.freeze({
    phase: barrier.phase,
    reached: barrier.reached,
    release() {
      if (
        i4TestGenerationPhaseBarrier !== barrier ||
        barrier.consumed !== true ||
        barrier.releasedOnce
      ) {
        throw new Error("CIC_I4_TEST_GENERATION_BARRIER_RELEASE_INVALID");
      }
      barrier.releasedOnce = true;
      barrier.releaseBarrier();
    },
    clear() {
      if (i4TestGenerationPhaseBarrier === barrier) {
        i4TestGenerationPhaseBarrier = null;
      }
      if (!barrier.releasedOnce) {
        barrier.releasedOnce = true;
        barrier.releaseBarrier();
      }
    },
  });
}

async function crossI4TestGenerationPhaseBarrier(phase) {
  const barrier = i4TestGenerationPhaseBarrier;
  if (barrier === null) return;
  if (
    process.env.VITEST !== "true" ||
    phase !== "GEN_START" ||
    barrier.phase !== I4_TEST_GENERATION_PHASE ||
    barrier.consumed
  ) {
    throw new Error("CIC_I4_TEST_GENERATION_BARRIER_CONSUMPTION_INVALID");
  }
  barrier.consumed = true;
  barrier.markReached();
  await barrier.released;
}

function rejectExecutableOrAuthorityInjection(value, ancestors = new Set()) {
  if (typeof value === "function" || typeof value === "symbol") fail("AUTHORIZATION_INVALID");
  if (value === null || typeof value !== "object") return;
  if (ancestors.has(value)) fail("AUTHORIZATION_INVALID");
  ancestors.add(value);
  try {
    for (const [key, entry] of Object.entries(value)) {
      if (FORBIDDEN_CALLER_KEYS.has(key)) fail("AUTHORIZATION_INVALID");
      rejectExecutableOrAuthorityInjection(entry, ancestors);
    }
  } finally {
    ancestors.delete(value);
  }
}

function normalizePolicy(extension) {
  if (extension !== undefined && extension !== null) {
    fail("PACK_SCHEMA_POLICY_FLOOR_MISMATCH");
  }
  const body = { ...I4_BASE_POLICY, requiredRoles: [...I4_BASE_POLICY.requiredRoles] };
  return { ...body, effectivePolicyIdentity: semanticIdentity("CIC-I4-EFFECTIVE-POLICY-V1", body) };
}

async function readPhysicalMaterials(materials, worktreeRoot) {
  if (!Array.isArray(materials)) fail("AUTHORIZATION_INVALID");
  const root = await realpath(worktreeRoot);
  const observed = [];
  for (const raw of materials) {
    requirePlainObject(raw, "task material");
    const materialPath = normalizeRepoRelativePath(raw.path);
    const bounded = await inspectBoundedWorktreePath(root, materialPath, {
      code: "REQUIRED_MATERIAL_READ_FAILED",
    });
    const resolved = bounded.target;
    const stats = await lstat(resolved);
    if (!stats.isFile() || stats.isSymbolicLink()) fail("REQUIRED_MATERIAL_READ_FAILED");
    const bytes = await readFile(resolved);
    observed.push({
      id: requirePortableId(raw.id, "material id"),
      path: materialPath,
      content: bytes,
      bytes: bytes.byteLength,
      sha256: sha256Hex(bytes),
      pointer: { kind: "REPOSITORY_PATH", path: materialPath },
    });
  }
  const sorted = observed.sort((left, right) => {
    const leftFact = canonicalJson({
      id: left.id,
      path: left.path,
      bytes: left.bytes,
      sha256: left.sha256,
    });
    const rightFact = canonicalJson({
      id: right.id,
      path: right.path,
      bytes: right.bytes,
      sha256: right.sha256,
    });
    return leftFact < rightFact ? -1 : leftFact > rightFact ? 1 : 0;
  });
  if (sorted.length === 0) return sorted;

  const generationIdentity = semanticIdentity("CIC-I4-MATERIAL-SET-GENERATION-V1", {
    materials: sorted.map(({ id, path: materialPath, bytes, sha256 }) => ({
      id,
      path: materialPath,
      bytes,
      sha256,
    })),
  });
  return sorted.map((material) => ({ ...material, generationIdentity }));
}

function normalizeProviderRequests(requests) {
  if (requests === undefined) return [];
  if (!Array.isArray(requests)) fail("PROVIDER_REQUEST_INVALID");
  return requests.map((request) => {
    requirePlainObject(request, "provider request");
    if (Object.hasOwn(request, "inputIdentity")) fail("PROVIDER_REQUEST_INVALID");
    return {
      requestId: requirePortableId(request.requestId, "provider request id"),
      providerId: requirePortableId(request.providerId, "provider id"),
      capability: requirePortableId(request.capability, "provider capability"),
      query: isPlainObject(request.query) ? request.query : {},
    };
  });
}

function portableRepositoryFacts(repository) {
  return {
    status: repository.status,
    repositoryIdentity: repository.repository.repositoryIdentity,
    snapshotFingerprint: repository.snapshotFingerprint,
    head: repository.head,
    view: repository.view,
    worktree: {
      clean: repository.worktree.clean,
      mutationSafety: repository.worktree.mutationSafety,
      staged: repository.worktree.staged,
      unstaged: repository.worktree.unstaged,
      untracked: repository.worktree.untracked,
      operations: repository.worktree.operations,
    },
  };
}

function taskContractBody(record) {
  return {
    schemaVersion: record.schemaVersion,
    taskIdentity: record.taskIdentity,
    taskName: record.taskName,
    repositoryIdentity: record.repositoryIdentity,
    portableWorktreeIdentity: record.portableWorktreeIdentity,
    scope: record.scope,
    owners: record.owners,
    semanticOwners: record.semanticOwners,
    contextIntent: record.contextIntent,
  };
}

async function loadTaskContract(domain, taskContractIdentity) {
  requireIdentity(taskContractIdentity, "task-contract identity");
  const record = await readJson(
    path.join(domain.taskStateRoot, "task-contracts", `${taskContractIdentity}.json`),
    "AUTHORIZATION_INVALID",
    domain.stateRoot,
  );
  const exactKeys = [
    ...Object.keys(taskContractBody(record)),
    "taskContractIdentity",
    "portableStateDomainIdentity",
    "localWorktreeBindingIdentity",
    "localStateStoreBindingIdentity",
  ];
  if (
    Object.keys(record).sort().join("\0") !== exactKeys.sort().join("\0") ||
    record.schemaVersion !== "CIC_TASK_CONTRACT_V2" ||
    record.taskContractIdentity !== taskContractIdentity ||
    semanticIdentity("CIC-TASK-CONTRACT-V2", taskContractBody(record)) !== taskContractIdentity ||
    record.taskIdentity !== domain.taskIdentity ||
    record.repositoryIdentity !== domain.repositoryIdentity ||
    record.portableWorktreeIdentity !== domain.portableWorktreeIdentity ||
    record.portableStateDomainIdentity !== domain.portableStateDomainIdentity ||
    record.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    record.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity
  ) {
    fail("AUTHORIZATION_INVALID");
  }
  const intentBody = {
    schemaVersion: record.contextIntent.schemaVersion,
    reviewed: record.contextIntent.reviewed,
    dimensions: record.contextIntent.dimensions,
  };
  if (
    semanticIdentity("CIC-TASK-CONTEXT-INTENT-V1", intentBody) !==
    record.contextIntent.contextIntentIdentity
  ) {
    fail("CONTEXT_PREREQUISITE_BLOCKED");
  }
  return record;
}

function sameGeneration(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

export function assertPhysicalGenerationStable(generationStart, generationEnd) {
  requirePlainObject(generationStart, "GEN_START observation");
  requirePlainObject(generationEnd, "GEN_END observation");
  if (!sameGeneration(generationStart, generationEnd)) fail("CONTEXT_GENERATION_RACE");
}

async function observePhysicalGeneration(input, domain, contextRequest) {
  const observedDomain = await reverifyStateDomain({
    repositoryRoot: domain.repositoryRoot,
    worktreeRoot: domain.worktreeRoot,
    stateRoot: domain.stateRoot,
    repositoryIdentity: domain.repositoryIdentity,
    taskIdentity: domain.taskIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
  });
  if (
    observedDomain.portableStateDomainIdentity !== domain.portableStateDomainIdentity ||
    observedDomain.localWorktreeBindingIdentity !== domain.localWorktreeBindingIdentity ||
    observedDomain.localStateStoreBindingIdentity !== domain.localStateStoreBindingIdentity
  ) {
    fail("STATE_STORE_BINDING_MISMATCH");
  }
  const [sourceGeneration, repository, physicalMaterials] = await Promise.all([
    verifySourceGeneration(observedDomain.worktreeRoot),
    verifyRepositoryIdentity(observedDomain.worktreeRoot),
    readPhysicalMaterials(input.materials ?? [], observedDomain.worktreeRoot),
  ]);
  if (sourceGeneration.status !== "PASS") fail("SOURCE_GENERATION_PREREQUISITE_BLOCKED");
  if (
    repository.status !== "PASS" ||
    repository.repository.repositoryIdentity !== domain.repositoryIdentity ||
    repository.view.complete !== true ||
    repository.view.shallow !== false ||
    repository.capabilities.status !== "PASS"
  ) {
    fail("REPOSITORY_PREREQUISITE_BLOCKED");
  }
  const taskMaterialFingerprint = computeTaskMaterialFingerprint(
    { ...contextRequest, materials: physicalMaterials },
    physicalMaterials,
  );
  return {
    domain: observedDomain,
    sourceGeneration,
    repository,
    physicalMaterials,
    generation: {
      authorityIdentity: input.authorityIdentity,
      sourceGenerationFingerprint: sourceGeneration.generationFingerprint,
      repositoryIdentity: repository.repository.repositoryIdentity,
      repositorySnapshotIdentity: repository.snapshotFingerprint,
      capabilityFingerprint: repository.capabilities.capabilityFingerprint,
      taskMaterialFingerprint,
      localWorktreeBindingIdentity: observedDomain.localWorktreeBindingIdentity,
      localStateStoreBindingIdentity: observedDomain.localStateStoreBindingIdentity,
      movement: "STABLE",
    },
  };
}

export async function observeCurrentTruth(input) {
  requirePlainObject(input, "current-truth request");
  rejectExecutableOrAuthorityInjection(input);
  requireIdentity(input.authorityIdentity, "authority identity");
  requireIdentity(input.taskIdentity, "task identity");
  requireIdentity(input.portableWorktreeIdentity, "portable worktree identity");
  const domain = await reverifyStateDomain({
    repositoryRoot: input.repositoryRoot,
    worktreeRoot: input.worktreeRoot,
    stateRoot: input.stateRoot,
    repositoryIdentity: input.repositoryIdentity,
    taskIdentity: input.taskIdentity,
    portableWorktreeIdentity: input.portableWorktreeIdentity,
  });
  const taskContract = await loadTaskContract(domain, input.taskContractIdentity);
  const providerRequests = normalizeProviderRequests(input.providerRequests);
  const effectivePolicy = normalizePolicy(input.policyExtension);
  const contextRequest = {
    authority: { identity: input.authorityIdentity },
    task: { identity: input.taskIdentity },
    requiredDimensions: REQUIRED_CONTEXT_DIMENSIONS,
    dimensions: taskContract.contextIntent.dimensions,
    materials: [],
  };
  const initial = await observePhysicalGeneration(input, domain, contextRequest);
  contextRequest.materials = initial.physicalMaterials;
  contextRequest.prerequisites = {
    sourceGeneration: {
      status: "PASS",
      fingerprint: initial.sourceGeneration.generationFingerprint,
    },
    repository: {
      status: "PASS",
      repositoryIdentity: initial.repository.repository.repositoryIdentity,
      snapshotFingerprint: initial.repository.snapshotFingerprint,
      view: {
        complete: initial.repository.view.complete,
        shallow: initial.repository.view.shallow,
      },
    },
    capabilities: {
      status: initial.repository.capabilities.status,
      requiredStatus: initial.repository.capabilities.missing.length === 0 ? "PASS" : "BLOCKED",
      capabilityFingerprint: initial.repository.capabilities.capabilityFingerprint,
    },
  };
  const phaseObservations = [];
  const contextCompilation = await compileContext(contextRequest, {
    readMaterials: async () => initial.physicalMaterials,
    observeGeneration: async (phase) => {
      const observed = await observePhysicalGeneration(input, domain, contextRequest);
      phaseObservations.push({ phase, observed });
      if (phase === "GEN_START" && i4TestGenerationPhaseBarrier !== null) {
        await crossI4TestGenerationPhaseBarrier(phase);
      }
      return observed.generation;
    },
    observeProviders: async ({ inputIdentity }) =>
      observeContextProviders({
        providers: I4_BASE_CONTEXT_PROVIDERS,
        requests: providerRequests.map((request) => ({ ...request, inputIdentity })),
      }),
  });
  if (phaseObservations.length >= 1) {
    assertPhysicalGenerationStable(initial.generation, phaseObservations[0].observed.generation);
  }
  if (phaseObservations.length >= 2) {
    assertPhysicalGenerationStable(
      phaseObservations[0].observed.generation,
      phaseObservations[1].observed.generation,
    );
  }
  if (contextCompilation.status !== "VERIFIED" || contextCompilation.active !== false) {
    if (
      contextCompilation.findings?.some((finding) =>
        new Set(["CONTEXT_GENERATION_RACE", "WORKSPACE_NOT_QUIESCENT"]).has(finding.code),
      )
    ) {
      fail("CONTEXT_GENERATION_RACE");
    }
    fail(
      providerRequests.length === 0 ? "CONTEXT_PREREQUISITE_BLOCKED" : "REQUIRED_PROVIDER_MISSING",
    );
  }
  if (phaseObservations.length !== 2) fail("CONTEXT_GENERATION_RACE");
  if (phaseObservations[0].phase !== "GEN_START" || phaseObservations[1].phase !== "GEN_END") {
    fail("CONTEXT_GENERATION_RACE");
  }
  const body = {
    schemaVersion: "CIC_I4_CURRENT_TRUTH_V1",
    sourceGeneration: {
      status: initial.sourceGeneration.status,
      fingerprint: initial.sourceGeneration.generationFingerprint,
    },
    repository: portableRepositoryFacts(initial.repository),
    capabilities: {
      status: initial.repository.capabilities.status,
      fingerprint: initial.repository.capabilities.capabilityFingerprint,
      required: initial.repository.capabilities.required,
      available: initial.repository.capabilities.available,
    },
    context: {
      status: contextCompilation.status,
      active: contextCompilation.active,
      contextGenerationIdentity: contextCompilation.contextGenerationIdentity,
      taskMaterialFingerprint: contextCompilation.tiers.tier0.taskMaterialFingerprint,
      closureFingerprint: contextCompilation.closure.closureFingerprint,
    },
    effectivePolicy,
    authorityIdentity: input.authorityIdentity,
    taskIdentity: input.taskIdentity,
    taskContractIdentity: taskContract.taskContractIdentity,
    contextIntentIdentity: taskContract.contextIntent.contextIntentIdentity,
    portableWorktreeIdentity: input.portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
  };
  return {
    ...body,
    currentTruthIdentity: semanticIdentity("CIC-I4-CURRENT-TRUTH-V1", body),
    domain,
    contextCompilation,
  };
}

export function serializeCurrentTruth(result) {
  const portable = { ...result };
  delete portable.domain;
  delete portable.contextCompilation;
  return `${canonicalJson(portable)}\n`;
}
