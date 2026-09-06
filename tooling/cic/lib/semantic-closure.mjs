/* global structuredClone */

import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { TextDecoder } from "node:util";

import { canonicalJson } from "./canonical-json.mjs";
import { isPortableContextIdentifier } from "./context-provider.mjs";
import { buildSemanticEvidence } from "./semantic-evidence.mjs";
import { deriveSemanticFastClosure } from "./semantic-fast-closure.mjs";
import {
  authorityClaimIdentity,
  bindSemanticProviderRegistration,
  buildSemanticProviderProjection,
  defineSemanticProviderRegistration,
} from "./semantic-provider.mjs";
import {
  buildSemanticProjectionSet,
  verifySemanticProjectionSet,
} from "./semantic-projection-set.mjs";
import {
  bindSemanticOwnerRegistration,
  buildSemanticRegistry,
  defineSemanticOwnerRegistration,
} from "./semantic-registry.mjs";
import { deriveSemanticShadowClosure } from "./semantic-shadow-closure.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./identity.mjs";
import { verifyAuthorization } from "./task-authorization.mjs";

const REQUEST_SCHEMA = "CIC_SEMANTIC_CLOSURE_REQUEST_V1";
const DECLARATION_SCHEMA = "CIC_SEMANTIC_DECLARATION_V1";
const NEGATIVE_WITNESS_MATERIAL_SCHEMA = "CIC_SEMANTIC_NEGATIVE_WITNESS_MATERIAL_V1";
const RESULT_SCHEMA = "CIC_SEMANTIC_CLOSURE_RESULT_V1";
const WITNESS_SCHEMA = "CIC_SEMANTIC_CLOSURE_WITNESS_V1";
const WITNESS_IDENTITY_SCHEMA = "CIC_I5_C_SEMANTIC_CLOSURE_WITNESS_V1";
const AUTHORITY_SCOPE = "READ_ONLY_SEMANTIC_COMPLETENESS";
const IDENTITY = /^[0-9A-F]{64}$/u;
const CONTENT_IDENTITY = /^(?:[0-9a-f]{40}|[0-9A-F]{64})$/u;
const WITNESS_INVALID = "SEMANTIC_CLOSURE_WITNESS_INVALID";
const LIMITS = Object.freeze({
  declarationBytes: 512 * 1024,
  negativeWitnessBytes: 16 * 1024,
  owners: 128,
  providers: 128,
  capabilities: 128,
  records: 1024,
  dependencies: 256,
  dependencyEdges: 8192,
  evidence: 4096,
  requestedRoots: 128,
});

const PASS_WITNESS_KEYS = Object.freeze([
  "absentProven",
  "authorityScope",
  "authorizationHeadGeneration",
  "authorizationHeadIdentity",
  "authorizationIdentity",
  "authorizationState",
  "authorizedSemanticOwnerSet",
  "closureMembers",
  "closureWitnessIdentity",
  "comparisonIdentity",
  "consultedOwnerIdentities",
  "consultedProviderIdentities",
  "contextGenerationIdentity",
  "currentTruthIdentity",
  "effectiveCheckpointContentIdentity",
  "effectiveCheckpointRecordIdentity",
  "fastWitnessIdentity",
  "findings",
  "followedDependencyEdges",
  "mutationAuthorization",
  "normalizedFastComparisonIdentity",
  "normalizedShadowComparisonIdentity",
  "ownerProviderConflicts",
  "projectionSetIdentity",
  "registryIdentity",
  "repositoryHeadCommit",
  "repositoryHeadTree",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "requestedRoots",
  "schemaVersion",
  "semanticDeclarationBytes",
  "semanticDeclarationMaterialIdentity",
  "semanticDeclarationSha256",
  "shadowWitnessIdentity",
  "sourceGenerationFingerprint",
  "status",
  "taskContractIdentity",
  "taskIdentity",
  "taskMaterialFingerprint",
  "unknownKeys",
  "unresolvedKeys",
]);

const MATERIAL_COMPARISON_FIELDS = Object.freeze([
  "status",
  "authorityState",
  "projectionSetIdentity",
  "requestedRoots",
  "closureMembers",
  "absentProven",
  "unknownKeys",
  "unresolvedKeys",
  "ownerProviderConflicts",
  "consultedOwnerIdentities",
  "consultedProviderIdentities",
  "followedDependencyEdges",
  "findings",
]);

function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function fail(code) {
  const error = new TypeError(code);
  error.code = code;
  throw error;
}

function plain(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, keys, code) {
  if (!plain(value)) fail(code);
  if (canonicalJson(Object.keys(value).sort(compare)) !== canonicalJson([...keys].sort(compare))) {
    fail(code);
  }
}

function identity(value, code = "SEMANTIC_CLOSURE_INPUT_INVALID") {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function portable(value, code = "SEMANTIC_CLOSURE_INPUT_INVALID") {
  if (!isPortableContextIdentifier(value)) fail(code);
  return value;
}

function boundedArray(value, maximum, code = "SEMANTIC_CLOSURE_INPUT_INVALID") {
  if (!Array.isArray(value) || value.length > maximum) fail(code);
  return value;
}

function uniquePortable(
  value,
  maximum,
  code = "SEMANTIC_CLOSURE_INPUT_INVALID",
  allowEmpty = true,
) {
  const result = boundedArray(value, maximum, code)
    .map((entry) => portable(entry, code))
    .sort(compare);
  if ((!allowEmpty && result.length === 0) || new Set(result).size !== result.length) fail(code);
  return result;
}

function floor(value) {
  if (!Number.isSafeInteger(value) || value < 1) fail("SEMANTIC_DECLARATION_INVALID");
  return value;
}

function semanticIdentity(schema, body) {
  return sha256Hex(`${schema.replaceAll("_", "-")}\n${canonicalJson(body)}\n`);
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

function pathIsInScope(candidate, scope) {
  return scope.some((entry) => candidate === entry || candidate.startsWith(`${entry}/`));
}

function normalizeInvocation(input) {
  exactKeys(
    input,
    [
      "authorizationIdentity",
      "currentTruthRequest",
      "domainInput",
      "expectedAuthorizationHeadIdentity",
      "schemaVersion",
      "semanticDeclaration",
    ],
    "SEMANTIC_CLOSURE_REQUEST_INVALID",
  );
  if (input.schemaVersion !== REQUEST_SCHEMA || !plain(input.currentTruthRequest)) {
    fail("SEMANTIC_CLOSURE_REQUEST_INVALID");
  }
  exactKeys(input.semanticDeclaration, ["id", "path"], "SEMANTIC_CLOSURE_REQUEST_INVALID");
  let domainInput;
  let currentTruthRequest;
  try {
    domainInput = structuredClone(input.domainInput);
    currentTruthRequest = structuredClone(input.currentTruthRequest);
  } catch {
    fail("SEMANTIC_CLOSURE_REQUEST_INVALID");
  }
  return deepFreeze({
    schemaVersion: REQUEST_SCHEMA,
    domainInput,
    authorizationIdentity: identity(
      input.authorizationIdentity,
      "SEMANTIC_CLOSURE_REQUEST_INVALID",
    ),
    expectedAuthorizationHeadIdentity: identity(
      input.expectedAuthorizationHeadIdentity,
      "SEMANTIC_CLOSURE_REQUEST_INVALID",
    ),
    currentTruthRequest,
    semanticDeclaration: {
      id: portable(input.semanticDeclaration.id, "SEMANTIC_CLOSURE_REQUEST_INVALID"),
      path: normalizeRepoRelativePath(input.semanticDeclaration.path),
    },
  });
}

function normalizeOwner(raw) {
  exactKeys(
    raw,
    ["ownerId", "policyFloor", "schemaFloor", "semanticKinds"],
    "SEMANTIC_DECLARATION_INVALID",
  );
  return {
    ownerId: portable(raw.ownerId, "SEMANTIC_DECLARATION_INVALID"),
    semanticKinds: uniquePortable(
      raw.semanticKinds,
      LIMITS.capabilities,
      "SEMANTIC_DECLARATION_INVALID",
      false,
    ),
    schemaFloor: floor(raw.schemaFloor),
    policyFloor: floor(raw.policyFloor),
  };
}

function normalizeRecord(raw) {
  exactKeys(
    raw,
    [
      "absenceQueryClass",
      "dependencies",
      "materialId",
      "negativeWitnessMaterialId",
      "payload",
      "presenceState",
      "semanticKey",
      "semanticKind",
    ],
    "SEMANTIC_DECLARATION_INVALID",
  );
  if (!["PRESENT", "ABSENT_PROVEN", "UNKNOWN"].includes(raw.presenceState)) {
    fail("SEMANTIC_DECLARATION_INVALID");
  }
  const materialId =
    raw.materialId === null ? null : portable(raw.materialId, "SEMANTIC_DECLARATION_INVALID");
  const absenceQueryClass =
    raw.absenceQueryClass === null
      ? null
      : portable(raw.absenceQueryClass, "SEMANTIC_DECLARATION_INVALID");
  const negativeWitnessMaterialId =
    raw.negativeWitnessMaterialId === null
      ? null
      : portable(raw.negativeWitnessMaterialId, "SEMANTIC_DECLARATION_INVALID");
  if (
    (raw.presenceState === "PRESENT" &&
      (materialId === null ||
        negativeWitnessMaterialId !== null ||
        absenceQueryClass !== null ||
        raw.payload === null)) ||
    (raw.presenceState === "ABSENT_PROVEN" &&
      (materialId !== null || absenceQueryClass === null || raw.payload !== null)) ||
    (raw.presenceState === "UNKNOWN" &&
      (materialId !== null ||
        negativeWitnessMaterialId !== null ||
        absenceQueryClass !== null ||
        raw.payload !== null))
  ) {
    fail("SEMANTIC_DECLARATION_INVALID");
  }
  return {
    semanticKey: portable(raw.semanticKey, "SEMANTIC_DECLARATION_INVALID"),
    semanticKind: portable(raw.semanticKind, "SEMANTIC_DECLARATION_INVALID"),
    presenceState: raw.presenceState,
    materialId,
    negativeWitnessMaterialId,
    dependencies: uniquePortable(
      raw.dependencies,
      LIMITS.dependencies,
      "SEMANTIC_DECLARATION_INVALID",
    ),
    payload: raw.payload,
    absenceQueryClass,
  };
}

function normalizeCapability(raw) {
  exactKeys(raw, ["capability", "records"], "SEMANTIC_DECLARATION_INVALID");
  const records = boundedArray(raw.records, LIMITS.records, "SEMANTIC_DECLARATION_INVALID")
    .map(normalizeRecord)
    .sort((left, right) => compare(left.semanticKey, right.semanticKey));
  if (
    records.length === 0 ||
    new Set(records.map(({ semanticKey }) => semanticKey)).size !== records.length
  ) {
    fail("SEMANTIC_DECLARATION_INVALID");
  }
  return {
    capability: portable(raw.capability, "SEMANTIC_DECLARATION_INVALID"),
    records,
  };
}

function normalizeProvider(raw) {
  exactKeys(
    raw,
    [
      "capabilityRecords",
      "capabilities",
      "ownerId",
      "policyFloor",
      "providerId",
      "providerVersion",
      "schemaFloor",
      "semanticKinds",
    ],
    "SEMANTIC_DECLARATION_INVALID",
  );
  const capabilities = uniquePortable(
    raw.capabilities,
    LIMITS.capabilities,
    "SEMANTIC_DECLARATION_INVALID",
    false,
  );
  const capabilityRecords = boundedArray(
    raw.capabilityRecords,
    LIMITS.capabilities,
    "SEMANTIC_DECLARATION_INVALID",
  )
    .map(normalizeCapability)
    .sort((left, right) => compare(left.capability, right.capability));
  if (
    capabilityRecords.length === 0 ||
    new Set(capabilityRecords.map(({ capability }) => capability)).size !==
      capabilityRecords.length ||
    capabilityRecords.some(({ capability }) => !capabilities.includes(capability))
  ) {
    fail("SEMANTIC_DECLARATION_INVALID");
  }
  return {
    providerId: portable(raw.providerId, "SEMANTIC_DECLARATION_INVALID"),
    providerVersion: portable(raw.providerVersion, "SEMANTIC_DECLARATION_INVALID"),
    ownerId: portable(raw.ownerId, "SEMANTIC_DECLARATION_INVALID"),
    capabilities,
    semanticKinds: uniquePortable(
      raw.semanticKinds,
      LIMITS.capabilities,
      "SEMANTIC_DECLARATION_INVALID",
      false,
    ),
    schemaFloor: floor(raw.schemaFloor),
    policyFloor: floor(raw.policyFloor),
    capabilityRecords,
  };
}

export function parseSemanticDeclaration(value) {
  exactKeys(
    value,
    ["owners", "policyFloor", "providers", "requestedRoots", "schemaFloor", "schemaVersion"],
    "SEMANTIC_DECLARATION_INVALID",
  );
  if (value.schemaVersion !== DECLARATION_SCHEMA) fail("SEMANTIC_DECLARATION_INVALID");
  const owners = boundedArray(value.owners, LIMITS.owners, "SEMANTIC_DECLARATION_INVALID")
    .map(normalizeOwner)
    .sort((left, right) => compare(left.ownerId, right.ownerId));
  const providers = boundedArray(value.providers, LIMITS.providers, "SEMANTIC_DECLARATION_INVALID")
    .map(normalizeProvider)
    .sort((left, right) => compare(left.providerId, right.providerId));
  if (
    owners.length === 0 ||
    providers.length === 0 ||
    new Set(owners.map(({ ownerId }) => ownerId)).size !== owners.length ||
    new Set(providers.map(({ providerId }) => providerId)).size !== providers.length ||
    providers.some(({ ownerId }) => !owners.some((owner) => owner.ownerId === ownerId))
  ) {
    fail("SEMANTIC_DECLARATION_INVALID");
  }
  const body = {
    schemaVersion: DECLARATION_SCHEMA,
    schemaFloor: floor(value.schemaFloor),
    policyFloor: floor(value.policyFloor),
    requestedRoots: uniquePortable(
      value.requestedRoots,
      LIMITS.requestedRoots,
      "SEMANTIC_DECLARATION_INVALID",
      false,
    ),
    owners,
    providers,
  };
  return deepFreeze(body);
}

function materialFacts(currentTruth) {
  const tiers = currentTruth?.contextCompilation?.tiers;
  if (!plain(tiers) || !Array.isArray(tiers.tier1) || !Array.isArray(tiers.tier2)) {
    fail("SEMANTIC_PHYSICAL_MATERIAL_UNAVAILABLE");
  }
  const facts = [...tiers.tier1, ...tiers.tier2].map((fact) => ({
    id: portable(fact.id, "SEMANTIC_PHYSICAL_MATERIAL_UNAVAILABLE"),
    path: normalizeRepoRelativePath(fact.path),
    bytes: fact.bytes,
    sha256: identity(fact.sha256, "SEMANTIC_PHYSICAL_MATERIAL_UNAVAILABLE"),
    generationIdentity: identity(fact.generationIdentity, "SEMANTIC_PHYSICAL_MATERIAL_UNAVAILABLE"),
  }));
  if (
    new Set(facts.map(({ id }) => id)).size !== facts.length ||
    facts.some(({ bytes }) => !Number.isSafeInteger(bytes) || bytes < 0)
  ) {
    fail("SEMANTIC_PHYSICAL_MATERIAL_UNAVAILABLE");
  }
  return facts;
}

async function readBoundedPhysicalFile(
  rootInput,
  relativePath,
  failureCode = "SEMANTIC_DECLARATION_READ_FAILED",
) {
  const normalized = normalizeRepoRelativePath(relativePath);
  const root = await realpath(rootInput);
  const candidate = path.resolve(root, ...normalized.split("/"));
  if (!isInside(root, candidate)) fail(failureCode);
  const candidateMetadata = await lstat(candidate);
  if (candidateMetadata.isSymbolicLink() || !candidateMetadata.isFile()) {
    fail(failureCode);
  }
  const resolved = await realpath(candidate);
  const metadata = await lstat(resolved);
  if (!isInside(root, resolved) || !metadata.isFile() || metadata.isSymbolicLink()) {
    fail(failureCode);
  }
  return { normalized, bytes: new Uint8Array(await readFile(resolved)) };
}

async function authenticateDeclaration(verified, selector) {
  const scope = verified.authorization.scope.map((entry) => normalizeRepoRelativePath(entry));
  if (!pathIsInScope(selector.path, scope)) fail("SEMANTIC_DECLARATION_OUTSIDE_AUTHORIZATION");
  const facts = materialFacts(verified.currentTruth);
  const matches = facts.filter(
    ({ id, path: materialPath }) => id === selector.id && materialPath === selector.path,
  );
  if (matches.length !== 1) fail("SEMANTIC_DECLARATION_NOT_CURRENT_TASK_MATERIAL");
  const fact = matches[0];
  const observed = await readBoundedPhysicalFile(verified.domain.worktreeRoot, selector.path);
  if (
    observed.bytes.byteLength !== fact.bytes ||
    sha256Hex(observed.bytes) !== fact.sha256 ||
    observed.bytes.byteLength > LIMITS.declarationBytes
  ) {
    fail("SEMANTIC_DECLARATION_IDENTITY_MISMATCH");
  }
  let value;
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(observed.bytes);
    value = JSON.parse(text);
  } catch {
    fail("SEMANTIC_DECLARATION_INVALID_UTF8_OR_JSON");
  }
  return {
    selector,
    fact,
    declaration: parseSemanticDeclaration(value),
    materialIdentity: fact.generationIdentity,
    bytes: fact.bytes,
    sha256: fact.sha256,
  };
}

function authorityClaimFrom(verified) {
  const body = {
    schemaVersion: "CIC_I5_AUTHORITY_CLAIM_V1",
    authorityState: "UNPROVEN",
    authorizationIdentity: verified.authorization.authorizationIdentity,
    currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
    taskContractIdentity: verified.authorization.taskContractIdentity,
    authorizedSemanticOwnerSet: [...verified.authorization.semanticOwners].sort(compare),
  };
  return { ...body, authorityClaimIdentity: authorityClaimIdentity(body) };
}

function projectionBindings(verified) {
  return {
    authorityIdentity: verified.authorization.authorizationIdentity,
    sourceGenerationFingerprint: verified.currentTruth.sourceGeneration.fingerprint,
    repositoryIdentity: verified.currentTruth.repository.repositoryIdentity,
    repositorySnapshotIdentity: verified.currentTruth.repository.snapshotFingerprint,
    taskIdentity: verified.authorization.taskIdentity,
    taskContractIdentity: verified.authorization.taskContractIdentity,
    contextGenerationIdentity: verified.currentTruth.context.contextGenerationIdentity,
    taskMaterialFingerprint: verified.currentTruth.context.taskMaterialFingerprint,
  };
}

function negativeWitnessScopeIdentity({ provider, record, fact, verified }) {
  return semanticIdentity("CIC_I5_C_ABSENCE_SCOPE_V1", {
    authorizedPathSet: [...verified.authorization.scope].sort(compare),
    taskContractIdentity: verified.authorization.taskContractIdentity,
    providerIdentity: provider.providerIdentity,
    semanticKey: record.semanticKey,
    semanticKind: record.semanticKind,
    queryClass: record.absenceQueryClass,
    negativeWitnessMaterialId: fact.id,
    negativeWitnessMaterialPath: fact.path,
  });
}

function parseNegativeWitnessMaterial(value) {
  exactKeys(
    value,
    [
      "providerId",
      "queryClass",
      "result",
      "schemaVersion",
      "scopeIdentity",
      "semanticKey",
      "semanticKind",
    ],
    "SEMANTIC_NEGATIVE_WITNESS_INVALID",
  );
  if (
    value.schemaVersion !== NEGATIVE_WITNESS_MATERIAL_SCHEMA ||
    value.result !== "ABSENT_PROVEN"
  ) {
    fail("SEMANTIC_NEGATIVE_WITNESS_INVALID");
  }
  return {
    schemaVersion: NEGATIVE_WITNESS_MATERIAL_SCHEMA,
    result: "ABSENT_PROVEN",
    providerId: portable(value.providerId, "SEMANTIC_NEGATIVE_WITNESS_INVALID"),
    semanticKey: portable(value.semanticKey, "SEMANTIC_NEGATIVE_WITNESS_INVALID"),
    semanticKind: portable(value.semanticKind, "SEMANTIC_NEGATIVE_WITNESS_INVALID"),
    queryClass: portable(value.queryClass, "SEMANTIC_NEGATIVE_WITNESS_INVALID"),
    scopeIdentity: identity(value.scopeIdentity, "SEMANTIC_NEGATIVE_WITNESS_INVALID"),
  };
}

async function authenticateNegativeWitnessMaterial({
  provider,
  record,
  factById,
  scope,
  verified,
  physicalDeclaration,
  consumedWitnessMaterialIds,
}) {
  const witnessMaterialId = record.negativeWitnessMaterialId;
  if (witnessMaterialId === null) fail("SEMANTIC_ABSENCE_PHYSICAL_PROOF_UNAVAILABLE");
  if (consumedWitnessMaterialIds.has(witnessMaterialId)) {
    fail("SEMANTIC_NEGATIVE_WITNESS_REPLAY");
  }
  const fact = factById.get(witnessMaterialId);
  if (
    fact === undefined ||
    !pathIsInScope(fact.path, scope) ||
    fact.id === physicalDeclaration.selector.id ||
    fact.path === physicalDeclaration.selector.path
  ) {
    fail("SEMANTIC_ABSENCE_PHYSICAL_PROOF_UNAVAILABLE");
  }
  const observed = await readBoundedPhysicalFile(
    verified.domain.worktreeRoot,
    fact.path,
    "SEMANTIC_ABSENCE_PHYSICAL_PROOF_UNAVAILABLE",
  );
  const observedSha256 = sha256Hex(observed.bytes);
  if (observed.bytes.byteLength !== fact.bytes || observedSha256 !== fact.sha256) {
    fail("SEMANTIC_NEGATIVE_WITNESS_IDENTITY_MISMATCH");
  }
  if (observed.bytes.byteLength > LIMITS.negativeWitnessBytes) {
    fail("SEMANTIC_NEGATIVE_WITNESS_INVALID");
  }
  let value;
  try {
    value = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(observed.bytes));
  } catch {
    fail("SEMANTIC_NEGATIVE_WITNESS_INVALID");
  }
  const witness = parseNegativeWitnessMaterial(value);
  const expectedScopeIdentity = negativeWitnessScopeIdentity({
    provider,
    record,
    fact,
    verified,
  });
  if (
    witness.providerId !== provider.providerId ||
    witness.semanticKey !== record.semanticKey ||
    witness.semanticKind !== record.semanticKind ||
    witness.queryClass !== record.absenceQueryClass ||
    witness.scopeIdentity !== expectedScopeIdentity
  ) {
    fail("SEMANTIC_NEGATIVE_WITNESS_BINDING_MISMATCH");
  }
  consumedWitnessMaterialIds.add(witnessMaterialId);
  return {
    materialIdentity: fact.sha256,
    absenceWitness: {
      result: "ABSENT_PROVEN",
      providerIdentity: provider.providerIdentity,
      indexIdentity: fact.sha256,
      queryClass: record.absenceQueryClass,
      scopeIdentity: expectedScopeIdentity,
      generationIdentity: fact.generationIdentity,
    },
  };
}

function providerInputIdentity({ provider, capability, verified, declaration }) {
  return semanticIdentity("CIC_I5_C_PROVIDER_INPUT_V1", {
    providerIdentity: provider.providerIdentity,
    providerBindingIdentity: provider.providerBindingIdentity,
    capability,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
    sourceGenerationFingerprint: verified.currentTruth.sourceGeneration.fingerprint,
    repositoryIdentity: verified.currentTruth.repository.repositoryIdentity,
    repositorySnapshotIdentity: verified.currentTruth.repository.snapshotFingerprint,
    taskContractIdentity: verified.authorization.taskContractIdentity,
    contextGenerationIdentity: verified.currentTruth.context.contextGenerationIdentity,
    taskMaterialFingerprint: verified.currentTruth.context.taskMaterialFingerprint,
    semanticDeclarationMaterialIdentity: declaration.materialIdentity,
  });
}

async function structuralInputs(verified, physicalDeclaration) {
  const declaration = physicalDeclaration.declaration;
  const authorityClaim = authorityClaimFrom(verified);
  const ownerRows = declaration.owners.map((owner) => ({
    declaration: owner,
    raw: defineSemanticOwnerRegistration(owner),
  }));
  const ownerById = new Map(ownerRows.map((row) => [row.declaration.ownerId, row]));
  const boundOwners = ownerRows.map(({ raw }) =>
    bindSemanticOwnerRegistration(raw, authorityClaim),
  );
  const providerRows = declaration.providers.map((providerDeclaration) => {
    const owner = ownerById.get(providerDeclaration.ownerId);
    const raw = defineSemanticProviderRegistration({
      providerId: providerDeclaration.providerId,
      providerVersion: providerDeclaration.providerVersion,
      ownerIdentity: owner.raw.ownerIdentity,
      capabilities: providerDeclaration.capabilities,
      semanticKinds: providerDeclaration.semanticKinds,
      schemaFloor: providerDeclaration.schemaFloor,
      policyFloor: providerDeclaration.policyFloor,
    });
    return {
      declaration: providerDeclaration,
      bound: bindSemanticProviderRegistration(raw, authorityClaim),
    };
  });
  const boundProviders = providerRows.map(({ bound }) => bound);
  const registry = buildSemanticRegistry({
    authorityClaim,
    owners: boundOwners,
    providers: boundProviders,
    evidence: [],
    requiredSchemaFloor: declaration.schemaFloor,
    requiredPolicyFloor: declaration.policyFloor,
  });
  const registryBlockers = registry.findings.filter(
    ({ code }) => code !== "PHYSICAL_AUTHORITY_INTEGRATION_REQUIRED",
  );
  if (registryBlockers.length !== 0) fail(registryBlockers[0].code);

  const facts = materialFacts(verified.currentTruth);
  const factById = new Map(facts.map((fact) => [fact.id, fact]));
  const scope = verified.authorization.scope.map((entry) => normalizeRepoRelativePath(entry));
  const consumedWitnessMaterialIds = new Set();
  const projections = [];
  const evidence = [];
  for (const { declaration: providerDeclaration, bound } of providerRows) {
    for (const capabilityDeclaration of providerDeclaration.capabilityRecords) {
      const inputIdentity = providerInputIdentity({
        provider: bound,
        capability: capabilityDeclaration.capability,
        verified,
        declaration: physicalDeclaration,
      });
      const records = [];
      for (const record of capabilityDeclaration.records) {
        const fact = record.materialId === null ? null : factById.get(record.materialId);
        if (
          record.presenceState === "PRESENT" &&
          (fact === undefined || !pathIsInScope(fact.path, scope))
        ) {
          fail("SEMANTIC_MATERIAL_CURRENTNESS_UNPROVEN");
        }
        const physicalAbsence =
          record.presenceState === "ABSENT_PROVEN"
            ? await authenticateNegativeWitnessMaterial({
                provider: bound,
                record,
                factById,
                scope,
                verified,
                physicalDeclaration,
                consumedWitnessMaterialIds,
              })
            : null;
        records.push({
          semanticKey: record.semanticKey,
          semanticKind: record.semanticKind,
          presenceState: record.presenceState,
          materialIdentity: physicalAbsence?.materialIdentity ?? fact?.sha256 ?? null,
          dependencies: record.dependencies,
          payload: record.payload,
          absenceWitness: physicalAbsence?.absenceWitness ?? null,
        });
      }
      const projection = buildSemanticProviderProjection({
        provider: bound,
        inputIdentity,
        capability: capabilityDeclaration.capability,
        records,
      });
      projections.push(projection);
      for (const record of projection.records) {
        evidence.push(
          buildSemanticEvidence({
            projection: record,
            evidenceKind: "I5C_PHYSICAL_SEMANTIC_OBSERVATION",
            bindings: projectionBindings(verified),
            supportingEvidenceIdentities: [],
          }),
        );
      }
    }
  }
  const projectionSet = buildSemanticProjectionSet({
    requestedRoots: declaration.requestedRoots,
    bindings: projectionBindings(verified),
    providers: boundProviders,
    projectionSets: projections,
    evidence,
  });
  verifySemanticProjectionSet(projectionSet);
  if (projectionSet.status !== "UNPROVEN" || projectionSet.authorityState !== "UNPROVEN") {
    fail("SEMANTIC_PROJECTION_AUTHORITY_ESCALATION");
  }
  return { registry, projectionSet };
}

function normalizedArray(value, objects = false) {
  if (!Array.isArray(value)) return [];
  const copies = value.map((entry) => (objects ? structuredClone(entry) : entry));
  copies.sort((left, right) =>
    compare(objects ? canonicalJson(left) : left, objects ? canonicalJson(right) : right),
  );
  return copies;
}

function witnessContentIdentity(value) {
  if (typeof value !== "string" || !CONTENT_IDENTITY.test(value)) fail(WITNESS_INVALID);
  return value;
}

function witnessNumber(value, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    fail(WITNESS_INVALID);
  }
  return value;
}

function witnessIdentityList(value, maximum, allowEmpty = true) {
  const result = boundedArray(value, maximum, WITNESS_INVALID)
    .map((entry) => identity(entry, WITNESS_INVALID))
    .sort(compare);
  if ((!allowEmpty && result.length === 0) || new Set(result).size !== result.length) {
    fail(WITNESS_INVALID);
  }
  return result;
}

function normalizeWitnessEdge(value) {
  exactKeys(
    value,
    [
      "edgeIdentity",
      "originEvidenceIdentities",
      "originOwnerIdentity",
      "originProjectionIdentity",
      "originProviderBindingIdentity",
      "originProviderIdentity",
      "originProviderInputIdentity",
      "originSupportingEvidenceIdentities",
      "sourceSemanticKey",
      "targetSemanticKey",
    ],
    WITNESS_INVALID,
  );
  const body = {
    sourceSemanticKey: portable(value.sourceSemanticKey, WITNESS_INVALID),
    targetSemanticKey: portable(value.targetSemanticKey, WITNESS_INVALID),
    originOwnerIdentity: identity(value.originOwnerIdentity, WITNESS_INVALID),
    originProviderIdentity: identity(value.originProviderIdentity, WITNESS_INVALID),
    originProviderBindingIdentity: identity(value.originProviderBindingIdentity, WITNESS_INVALID),
    originProviderInputIdentity: identity(value.originProviderInputIdentity, WITNESS_INVALID),
    originProjectionIdentity: identity(value.originProjectionIdentity, WITNESS_INVALID),
    originEvidenceIdentities: witnessIdentityList(value.originEvidenceIdentities, LIMITS.evidence),
    originSupportingEvidenceIdentities: witnessIdentityList(
      value.originSupportingEvidenceIdentities,
      LIMITS.evidence,
    ),
  };
  const edgeIdentity = identity(value.edgeIdentity, WITNESS_INVALID);
  if (edgeIdentity !== semanticIdentity("CIC_SEMANTIC_DEPENDENCY_EDGE_V1", body)) {
    fail(WITNESS_INVALID);
  }
  return { ...body, edgeIdentity };
}

function normalizeWitnessEdges(value) {
  const edges = boundedArray(value, LIMITS.dependencyEdges, WITNESS_INVALID)
    .map(normalizeWitnessEdge)
    .sort((left, right) => compare(canonicalJson(left), canonicalJson(right)));
  if (new Set(edges.map(({ edgeIdentity }) => edgeIdentity)).size !== edges.length) {
    fail(WITNESS_INVALID);
  }
  return edges;
}

function normalizeWitnessFindings(value) {
  const findings = boundedArray(value, LIMITS.dependencyEdges, WITNESS_INVALID)
    .map((entry) => {
      exactKeys(entry, ["code", "semanticKey"], WITNESS_INVALID);
      return {
        code: portable(entry.code, WITNESS_INVALID),
        semanticKey:
          entry.semanticKey === null ? null : portable(entry.semanticKey, WITNESS_INVALID),
      };
    })
    .sort((left, right) => compare(canonicalJson(left), canonicalJson(right)));
  if (new Set(findings.map((entry) => canonicalJson(entry))).size !== findings.length) {
    fail(WITNESS_INVALID);
  }
  return findings;
}

function normalizePassWitness(record) {
  exactKeys(record, PASS_WITNESS_KEYS, WITNESS_INVALID);
  if (
    record.schemaVersion !== WITNESS_SCHEMA ||
    record.status !== "PASS" ||
    record.authorityScope !== AUTHORITY_SCOPE ||
    record.authorizationState !== "ACTIVE" ||
    record.mutationAuthorization !== false
  ) {
    fail(WITNESS_INVALID);
  }
  const body = {
    schemaVersion: WITNESS_SCHEMA,
    status: "PASS",
    authorityScope: AUTHORITY_SCOPE,
    sourceGenerationFingerprint: identity(record.sourceGenerationFingerprint, WITNESS_INVALID),
    repositoryIdentity: identity(record.repositoryIdentity, WITNESS_INVALID),
    repositorySnapshotIdentity: identity(record.repositorySnapshotIdentity, WITNESS_INVALID),
    repositoryHeadCommit: witnessContentIdentity(record.repositoryHeadCommit),
    repositoryHeadTree: witnessContentIdentity(record.repositoryHeadTree),
    taskIdentity: identity(record.taskIdentity, WITNESS_INVALID),
    taskContractIdentity: identity(record.taskContractIdentity, WITNESS_INVALID),
    authorizationIdentity: identity(record.authorizationIdentity, WITNESS_INVALID),
    authorizationHeadIdentity: identity(record.authorizationHeadIdentity, WITNESS_INVALID),
    authorizationHeadGeneration: witnessNumber(record.authorizationHeadGeneration, 1),
    authorizationState: "ACTIVE",
    currentTruthIdentity: identity(record.currentTruthIdentity, WITNESS_INVALID),
    contextGenerationIdentity: identity(record.contextGenerationIdentity, WITNESS_INVALID),
    taskMaterialFingerprint: identity(record.taskMaterialFingerprint, WITNESS_INVALID),
    effectiveCheckpointRecordIdentity: identity(
      record.effectiveCheckpointRecordIdentity,
      WITNESS_INVALID,
    ),
    effectiveCheckpointContentIdentity: identity(
      record.effectiveCheckpointContentIdentity,
      WITNESS_INVALID,
    ),
    authorizedSemanticOwnerSet: witnessIdentityList(
      record.authorizedSemanticOwnerSet,
      LIMITS.owners,
      false,
    ),
    semanticDeclarationMaterialIdentity: identity(
      record.semanticDeclarationMaterialIdentity,
      WITNESS_INVALID,
    ),
    semanticDeclarationBytes: witnessNumber(
      record.semanticDeclarationBytes,
      0,
      LIMITS.declarationBytes,
    ),
    semanticDeclarationSha256: identity(record.semanticDeclarationSha256, WITNESS_INVALID),
    registryIdentity: identity(record.registryIdentity, WITNESS_INVALID),
    projectionSetIdentity: identity(record.projectionSetIdentity, WITNESS_INVALID),
    normalizedFastComparisonIdentity: identity(
      record.normalizedFastComparisonIdentity,
      WITNESS_INVALID,
    ),
    normalizedShadowComparisonIdentity: identity(
      record.normalizedShadowComparisonIdentity,
      WITNESS_INVALID,
    ),
    fastWitnessIdentity: identity(record.fastWitnessIdentity, WITNESS_INVALID),
    shadowWitnessIdentity: identity(record.shadowWitnessIdentity, WITNESS_INVALID),
    comparisonIdentity: identity(record.comparisonIdentity, WITNESS_INVALID),
    requestedRoots: uniquePortable(
      record.requestedRoots,
      LIMITS.requestedRoots,
      WITNESS_INVALID,
      false,
    ),
    closureMembers: uniquePortable(record.closureMembers, LIMITS.records, WITNESS_INVALID),
    absentProven: uniquePortable(record.absentProven, LIMITS.records, WITNESS_INVALID),
    unknownKeys: uniquePortable(record.unknownKeys, LIMITS.records, WITNESS_INVALID),
    unresolvedKeys: uniquePortable(record.unresolvedKeys, LIMITS.records, WITNESS_INVALID),
    ownerProviderConflicts: uniquePortable(
      record.ownerProviderConflicts,
      LIMITS.records,
      WITNESS_INVALID,
    ),
    consultedOwnerIdentities: witnessIdentityList(record.consultedOwnerIdentities, LIMITS.owners),
    consultedProviderIdentities: witnessIdentityList(
      record.consultedProviderIdentities,
      LIMITS.providers,
    ),
    followedDependencyEdges: normalizeWitnessEdges(record.followedDependencyEdges),
    findings: normalizeWitnessFindings(record.findings),
    mutationAuthorization: false,
  };
  if (
    body.unknownKeys.length !== 0 ||
    body.unresolvedKeys.length !== 0 ||
    body.ownerProviderConflicts.length !== 0 ||
    body.findings.length !== 0
  ) {
    fail(WITNESS_INVALID);
  }
  const presentKeys = new Set([...body.closureMembers, ...body.absentProven]);
  if (
    presentKeys.size !== body.closureMembers.length + body.absentProven.length ||
    body.requestedRoots.some((semanticKey) => !presentKeys.has(semanticKey)) ||
    body.consultedOwnerIdentities.some(
      (ownerIdentity) => !body.authorizedSemanticOwnerSet.includes(ownerIdentity),
    ) ||
    body.followedDependencyEdges.some(
      (edge) =>
        !body.closureMembers.includes(edge.sourceSemanticKey) ||
        !presentKeys.has(edge.targetSemanticKey) ||
        !body.consultedOwnerIdentities.includes(edge.originOwnerIdentity) ||
        !body.consultedProviderIdentities.includes(edge.originProviderIdentity),
    )
  ) {
    fail(WITNESS_INVALID);
  }
  const closureWitnessIdentity = identity(record.closureWitnessIdentity, WITNESS_INVALID);
  if (closureWitnessIdentity !== semanticIdentity(WITNESS_IDENTITY_SCHEMA, body)) {
    fail(WITNESS_INVALID);
  }
  return deepFreeze({ ...body, closureWitnessIdentity });
}

export function verifySemanticClosureWitness(record) {
  try {
    return normalizePassWitness(record);
  } catch {
    fail(WITNESS_INVALID);
  }
}

function normalizeSemanticClosureWitness(witness) {
  if (!plain(witness)) fail("SEMANTIC_CLOSURE_WITNESS_INVALID");
  if (MATERIAL_COMPARISON_FIELDS.some((field) => !Object.hasOwn(witness, field))) {
    fail("SEMANTIC_CLOSURE_WITNESS_INVALID");
  }
  const normalized = {
    status: witness.status,
    authorityState: witness.authorityState,
    projectionSetIdentity: witness.projectionSetIdentity,
    requestedRoots: normalizedArray(witness.requestedRoots),
    closureMembers: normalizedArray(witness.closureMembers),
    absentProven: normalizedArray(witness.absentProven),
    unknownKeys: normalizedArray(witness.unknownKeys),
    unresolvedKeys: normalizedArray(witness.unresolvedKeys),
    ownerProviderConflicts: normalizedArray(witness.ownerProviderConflicts),
    consultedOwnerIdentities: normalizedArray(witness.consultedOwnerIdentities),
    consultedProviderIdentities: normalizedArray(witness.consultedProviderIdentities),
    followedDependencyEdges: normalizedArray(witness.followedDependencyEdges, true),
    findings: normalizedArray(witness.findings, true),
  };
  if (MATERIAL_COMPARISON_FIELDS.some((field) => normalized[field] === undefined)) {
    fail("SEMANTIC_CLOSURE_WITNESS_INVALID");
  }
  return deepFreeze(normalized);
}

export function compareSemanticClosureWitnesses(fastWitness, shadowWitness) {
  const fast = normalizeSemanticClosureWitness(fastWitness);
  const shadow = normalizeSemanticClosureWitness(shadowWitness);
  const fastIdentity = semanticIdentity("CIC_I5_C_NORMALIZED_FAST_COMPARISON_V1", fast);
  const shadowIdentity = semanticIdentity("CIC_I5_C_NORMALIZED_SHADOW_COMPARISON_V1", shadow);
  const agreement = canonicalJson(fast) === canonicalJson(shadow);
  const complete =
    agreement &&
    fast.status === "COMPLETE" &&
    shadow.status === "COMPLETE" &&
    fast.authorityState === "UNPROVEN" &&
    fast.unknownKeys.length === 0 &&
    fast.unresolvedKeys.length === 0 &&
    fast.ownerProviderConflicts.length === 0 &&
    fast.findings.length === 0;
  const body = {
    status: agreement ? (complete ? "AGREED_COMPLETE" : "AGREED_BLOCKED") : "CLOSURE_DISAGREEMENT",
    normalizedFastComparisonIdentity: fastIdentity,
    normalizedShadowComparisonIdentity: shadowIdentity,
    materialFields: [...MATERIAL_COMPARISON_FIELDS],
  };
  return deepFreeze({
    ...body,
    comparisonIdentity: semanticIdentity("CIC_I5_C_FAST_SHADOW_COMPARISON_V1", body),
    normalizedFast: fast,
    normalizedShadow: shadow,
  });
}

export function physicalBindingSnapshot(verified, declaration) {
  const checkpoint = verified.checkpointContent;
  return deepFreeze({
    authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
    authorizationHeadGeneration: verified.head.generation,
    authorizationState: verified.head.state,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
    sourceGenerationFingerprint: verified.currentTruth.sourceGeneration.fingerprint,
    repositoryIdentity: verified.currentTruth.repository.repositoryIdentity,
    repositorySnapshotIdentity: verified.currentTruth.repository.snapshotFingerprint,
    repositoryHeadCommit: verified.currentTruth.repository.head.commit,
    repositoryHeadTree: verified.currentTruth.repository.head.tree,
    taskIdentity: verified.authorization.taskIdentity,
    taskContractIdentity: verified.authorization.taskContractIdentity,
    contextGenerationIdentity: verified.currentTruth.context.contextGenerationIdentity,
    taskMaterialFingerprint: verified.currentTruth.context.taskMaterialFingerprint,
    effectiveCheckpointRecordIdentity: verified.checkpoint.record.checkpointRecordIdentity,
    effectiveCheckpointContentIdentity: checkpoint.checkpointContentIdentity,
    authorizedSemanticOwnerSet: [...verified.authorization.semanticOwners].sort(compare),
    semanticDeclarationMaterialIdentity: declaration.materialIdentity,
    semanticDeclarationBytes: declaration.bytes,
    semanticDeclarationSha256: declaration.sha256,
  });
}

export function comparePhysicalCurrentness(initial, final) {
  return canonicalJson(initial) === canonicalJson(final)
    ? { status: "STABLE", reasonCode: null }
    : { status: "BLOCKED", reasonCode: "PHYSICAL_CURRENTNESS_MOVED" };
}

function blockedResult(code, details = null) {
  const body = {
    schemaVersion: RESULT_SCHEMA,
    status: "BLOCKED",
    authorityScope: AUTHORITY_SCOPE,
    reasonCode: code,
    details,
    mutationAuthorization: false,
  };
  return deepFreeze({
    ...body,
    resultIdentity: semanticIdentity("CIC_I5_C_SEMANTIC_CLOSURE_RESULT_V1", body),
  });
}

function passWitness({ verified, declaration, structural, fast, shadow, comparison }) {
  const physical = physicalBindingSnapshot(verified, declaration);
  const body = {
    schemaVersion: WITNESS_SCHEMA,
    status: "PASS",
    authorityScope: AUTHORITY_SCOPE,
    sourceGenerationFingerprint: physical.sourceGenerationFingerprint,
    repositoryIdentity: physical.repositoryIdentity,
    repositorySnapshotIdentity: physical.repositorySnapshotIdentity,
    repositoryHeadCommit: physical.repositoryHeadCommit,
    repositoryHeadTree: physical.repositoryHeadTree,
    taskIdentity: physical.taskIdentity,
    taskContractIdentity: physical.taskContractIdentity,
    authorizationIdentity: physical.authorizationIdentity,
    authorizationHeadIdentity: physical.authorizationHeadIdentity,
    authorizationHeadGeneration: physical.authorizationHeadGeneration,
    authorizationState: physical.authorizationState,
    currentTruthIdentity: physical.currentTruthIdentity,
    contextGenerationIdentity: physical.contextGenerationIdentity,
    taskMaterialFingerprint: physical.taskMaterialFingerprint,
    effectiveCheckpointRecordIdentity: physical.effectiveCheckpointRecordIdentity,
    effectiveCheckpointContentIdentity: physical.effectiveCheckpointContentIdentity,
    authorizedSemanticOwnerSet: physical.authorizedSemanticOwnerSet,
    semanticDeclarationMaterialIdentity: physical.semanticDeclarationMaterialIdentity,
    semanticDeclarationBytes: physical.semanticDeclarationBytes,
    semanticDeclarationSha256: physical.semanticDeclarationSha256,
    registryIdentity: structural.registry.registryIdentity,
    projectionSetIdentity: structural.projectionSet.projectionSetIdentity,
    normalizedFastComparisonIdentity: comparison.normalizedFastComparisonIdentity,
    normalizedShadowComparisonIdentity: comparison.normalizedShadowComparisonIdentity,
    fastWitnessIdentity: fast.witnessIdentity,
    shadowWitnessIdentity: shadow.witnessIdentity,
    comparisonIdentity: comparison.comparisonIdentity,
    requestedRoots: comparison.normalizedFast.requestedRoots,
    closureMembers: comparison.normalizedFast.closureMembers,
    absentProven: comparison.normalizedFast.absentProven,
    unknownKeys: comparison.normalizedFast.unknownKeys,
    unresolvedKeys: comparison.normalizedFast.unresolvedKeys,
    ownerProviderConflicts: comparison.normalizedFast.ownerProviderConflicts,
    consultedOwnerIdentities: comparison.normalizedFast.consultedOwnerIdentities,
    consultedProviderIdentities: comparison.normalizedFast.consultedProviderIdentities,
    followedDependencyEdges: comparison.normalizedFast.followedDependencyEdges,
    findings: comparison.normalizedFast.findings,
    mutationAuthorization: false,
  };
  return deepFreeze({
    ...body,
    closureWitnessIdentity: semanticIdentity("CIC_I5_C_SEMANTIC_CLOSURE_WITNESS_V1", body),
  });
}

export async function verifySemanticClosure(input) {
  try {
    const request = normalizeInvocation(input);
    const authorizationRequest = {
      domainInput: request.domainInput,
      authorizationIdentity: request.authorizationIdentity,
      expectedAuthorizationHeadIdentity: request.expectedAuthorizationHeadIdentity,
      requiredAction: "VERIFY",
      currentTruthRequest: request.currentTruthRequest,
    };
    const initial = await verifyAuthorization(authorizationRequest);
    const initialDeclaration = await authenticateDeclaration(initial, request.semanticDeclaration);
    const initialPhysical = physicalBindingSnapshot(initial, initialDeclaration);
    const structural = await structuralInputs(initial, initialDeclaration);
    const fast = deriveSemanticFastClosure(structural.projectionSet);
    const shadow = deriveSemanticShadowClosure(structural.projectionSet);
    const comparison = compareSemanticClosureWitnesses(fast, shadow);
    if (comparison.status !== "AGREED_COMPLETE") {
      return blockedResult(comparison.status, {
        comparisonIdentity: comparison.comparisonIdentity,
        fastWitnessIdentity: fast.witnessIdentity,
        shadowWitnessIdentity: shadow.witnessIdentity,
        absentProven: comparison.normalizedFast.absentProven,
        unknownKeys: comparison.normalizedFast.unknownKeys,
        unresolvedKeys: comparison.normalizedFast.unresolvedKeys,
        findings: comparison.normalizedFast.findings,
      });
    }
    let final;
    let finalDeclaration;
    try {
      final = await verifyAuthorization(authorizationRequest);
      finalDeclaration = await authenticateDeclaration(final, request.semanticDeclaration);
    } catch {
      return blockedResult("PHYSICAL_CURRENTNESS_MOVED");
    }
    const finalPhysical = physicalBindingSnapshot(final, finalDeclaration);
    if (comparePhysicalCurrentness(initialPhysical, finalPhysical).status !== "STABLE") {
      return blockedResult("PHYSICAL_CURRENTNESS_MOVED");
    }
    return passWitness({
      verified: final,
      declaration: finalDeclaration,
      structural,
      fast,
      shadow,
      comparison,
    });
  } catch (error) {
    return blockedResult(error?.code ?? "SEMANTIC_CLOSURE_BLOCKED");
  }
}

export function serializeSemanticClosureResult(result) {
  return `${canonicalJson(result)}\n`;
}
