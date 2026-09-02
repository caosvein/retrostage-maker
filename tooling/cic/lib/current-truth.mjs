import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";

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
