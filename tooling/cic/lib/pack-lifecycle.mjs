import path from "node:path";
import { TextEncoder } from "node:util";

import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import {
  effectiveCheckpoint,
  inspectTaskState,
  verifyAuthorization,
  verifyMutationLease,
} from "./task-authorization.mjs";
import {
  atomicReplaceJson,
  fail,
  isIdentity,
  isPlainObject,
  pathState,
  readJson,
  requireIdentity,
  requirePlainObject,
  semanticIdentity,
  withExclusiveLock,
  writeImmutableJson,
} from "./state-domain.mjs";

const COMPANION_ROLES = Object.freeze([
  "TASK_CONTRACT",
  "OWNER_DECISION",
  "TASK_AUTHORIZATION",
  "WORKING_SET_CHECKPOINT",
  "CONTEXT_COMPILATION",
  "SOURCE_GENERATION_PROOF",
  "REPOSITORY_IDENTITY_PROOF",
]);

const textEncoder = new TextEncoder();

export function assertPackRoleFloor(roles) {
  if (
    !Array.isArray(roles) ||
    new Set(roles).size !== roles.length ||
    canonicalJson(roles) !== canonicalJson(COMPANION_ROLES)
  ) {
    fail("PACK_INCOMPLETE");
  }
  return [...COMPANION_ROLES];
}

function packPaths(domain) {
  return {
    stateRoot: domain.stateRoot,
    root: domain.packStoreRoot,
    objects: path.join(domain.packStoreRoot, "objects"),
    manifests: path.join(domain.packStoreRoot, "manifests"),
    generated: path.join(domain.packStoreRoot, "lifecycle", "generated"),
    verified: path.join(domain.packStoreRoot, "lifecycle", "verified"),
    active: path.join(domain.packStoreRoot, "lifecycle", "active"),
    superseded: path.join(domain.packStoreRoot, "lifecycle", "superseded"),
    invalid: path.join(domain.packStoreRoot, "lifecycle", "invalid"),
    locator: path.join(domain.packStoreRoot, "active.json"),
    lock: path.join(domain.packStoreRoot, "active.lock"),
    authorizationLock: path.join(domain.taskStateRoot, "authorization", "head.lock"),
  };
}

function locatorIdentity(locator) {
  return locator === null ? null : semanticIdentity("CIC-PACK-ACTIVE-LOCATOR-V1", locator);
}

async function readOptional(filePath, code, stateRoot) {
  const state = await pathState(filePath, stateRoot);
  if (state.state === "ABSENT_PROVEN") return null;
  if (state.state !== "PRESENT" || !state.stats.isFile() || state.stats.isSymbolicLink())
    fail(code);
  return readJson(filePath, code, stateRoot);
}

function exactJsonBytes(value) {
  return textEncoder.encode(`${canonicalJson(value)}\n`);
}

const LIFECYCLE_SCHEMA_VERSION = "CIC_PACK_LIFECYCLE_RECORD_V2";
const LIFECYCLE_IDENTITY_SCHEMA = "CIC-PACK-LIFECYCLE-RECORD-V2";
const LIFECYCLE_FIELDS = Object.freeze({
  GENERATED: Object.freeze([
    "packIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "generation",
    "parentPackIdentity",
  ]),
  VERIFIED: Object.freeze([
    "packIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "generation",
    "parentPackIdentity",
    "verificationIdentity",
  ]),
  ACTIVE: Object.freeze([
    "packIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "generation",
    "parentPackIdentity",
    "verificationIdentity",
    "predecessorLocatorIdentity",
    "activationIdentity",
  ]),
  SUPERSEDED: Object.freeze([
    "packIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "generation",
    "parentPackIdentity",
    "successorPackIdentity",
    "successorAuthorizationHeadIdentity",
    "successorAuthorizationIdentity",
    "successorGeneration",
    "successorParentPackIdentity",
    "predecessorLocatorIdentity",
  ]),
  INVALID: Object.freeze([
    "packIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "invalidatedLocatorIdentity",
    "reason",
  ]),
});

function lifecycleRecord(state, fields) {
  const expectedFields = LIFECYCLE_FIELDS[state];
  if (expectedFields === undefined) fail("PACK_STATE_TRANSITION_INVALID");
  requireExactKeys(fields, expectedFields, "PACK_STATE_TRANSITION_INVALID");
  const body = { schemaVersion: LIFECYCLE_SCHEMA_VERSION, state, ...fields };
  return {
    ...body,
    lifecycleRecordIdentity: semanticIdentity(LIFECYCLE_IDENTITY_SCHEMA, body),
  };
}

function assertLifecycleRecord(record, state) {
  const fields = LIFECYCLE_FIELDS[state];
  if (fields === undefined) fail("PACK_STATE_TRANSITION_INVALID");
  requireExactKeys(
    record,
    ["schemaVersion", "state", ...fields, "lifecycleRecordIdentity"],
    "PACK_STATE_TRANSITION_INVALID",
  );
  const body = { ...record };
  delete body.lifecycleRecordIdentity;
  if (
    record.schemaVersion !== LIFECYCLE_SCHEMA_VERSION ||
    record.state !== state ||
    !isIdentity(record.lifecycleRecordIdentity) ||
    semanticIdentity(LIFECYCLE_IDENTITY_SCHEMA, body) !== record.lifecycleRecordIdentity ||
    !isIdentity(record.packIdentity) ||
    !isIdentity(record.authorizationHeadIdentity) ||
    !isIdentity(record.authorizationIdentity)
  ) {
    fail("PACK_STATE_TRANSITION_INVALID");
  }
  if (fields.includes("generation")) {
    if (!Number.isSafeInteger(record.generation) || record.generation < 1) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
    if (record.parentPackIdentity !== null && !isIdentity(record.parentPackIdentity)) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
  }
  for (const identityField of [
    "verificationIdentity",
    "activationIdentity",
    "successorPackIdentity",
    "successorAuthorizationHeadIdentity",
    "successorAuthorizationIdentity",
    "invalidatedLocatorIdentity",
  ]) {
    if (fields.includes(identityField) && !isIdentity(record[identityField])) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
  }
  if (fields.includes("successorGeneration")) {
    if (!Number.isSafeInteger(record.successorGeneration) || record.successorGeneration < 1) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
    if (
      record.successorParentPackIdentity !== null &&
      !isIdentity(record.successorParentPackIdentity)
    ) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
    if (!isIdentity(record.predecessorLocatorIdentity)) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
  }
  if (state === "ACTIVE") {
    if (
      record.predecessorLocatorIdentity !== null &&
      !isIdentity(record.predecessorLocatorIdentity)
    ) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
    if (
      semanticIdentity("CIC-PACK-ACTIVATION-V2", {
        packIdentity: record.packIdentity,
        authorizationHeadIdentity: record.authorizationHeadIdentity,
        authorizationIdentity: record.authorizationIdentity,
        generation: record.generation,
        parentPackIdentity: record.parentPackIdentity,
        verificationIdentity: record.verificationIdentity,
        predecessorLocatorIdentity: record.predecessorLocatorIdentity,
      }) !== record.activationIdentity
    ) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
  }
  if (state === "INVALID" && record.reason !== "PACK_IDENTITY_MISMATCH") {
    fail("PACK_STATE_TRANSITION_INVALID");
  }
  return record;
}

function assertLifecycleExpected(record, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (canonicalJson(record[key]) !== canonicalJson(value)) {
      fail("PACK_STATE_TRANSITION_INVALID");
    }
  }
  return record;
}

async function readLifecycleRecord(paths, state, packIdentity, { required = false } = {}) {
  const directory = paths[state.toLowerCase()];
  if (typeof directory !== "string") fail("PACK_STATE_TRANSITION_INVALID");
  const directoryState = await pathState(directory, paths.stateRoot);
  if (directoryState.state === "ABSENT_PROVEN") {
    if (required) fail("PACK_STATE_TRANSITION_INVALID");
    return null;
  }
  if (directoryState.state !== "PRESENT" || directoryState.stats.isSymbolicLink()) {
    fail("PACK_STATE_TRANSITION_INVALID");
  }
  if (!directoryState.stats.isDirectory()) {
    if (required) fail("PACK_STATE_TRANSITION_INVALID");
    return null;
  }
  const record = await readOptional(
    path.join(directory, `${packIdentity}.json`),
    "PACK_STATE_TRANSITION_INVALID",
    paths.stateRoot,
  );
  if (record === null) {
    if (required) fail("PACK_STATE_TRANSITION_INVALID");
    return null;
  }
  return assertLifecycleRecord(record, state);
}

async function terminalLifecycle(paths, packIdentity) {
  const [superseded, invalid] = await Promise.all([
    readLifecycleRecord(paths, "SUPERSEDED", packIdentity),
    readLifecycleRecord(paths, "INVALID", packIdentity),
  ]);
  if (superseded !== null && invalid !== null) fail("PACK_STATE_TRANSITION_INVALID");
  return { superseded, invalid };
}

function roleArtifact(role, verified, checkpoint) {
  switch (role) {
    case "TASK_CONTRACT":
      return verified.taskContract;
    case "OWNER_DECISION":
      return verified.ownerDecision;
    case "TASK_AUTHORIZATION":
      return verified.authorization;
    case "WORKING_SET_CHECKPOINT":
      return { record: checkpoint.record, content: checkpoint.content };
    case "CONTEXT_COMPILATION":
      return {
        currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
        contextCompilation: verified.currentTruth.contextCompilation,
      };
    case "SOURCE_GENERATION_PROOF":
      return verified.currentTruth.sourceGeneration;
    case "REPOSITORY_IDENTITY_PROOF":
      return {
        repository: verified.currentTruth.repository,
        capabilities: verified.currentTruth.capabilities,
      };
    default:
      fail("PACK_INCOMPLETE");
  }
}

function buildAuthenticCompanions(verified, checkpoint) {
  return COMPANION_ROLES.map((role) => {
    const artifact = roleArtifact(role, verified, checkpoint);
    const artifactIdentity = semanticIdentity(`CIC-I4-PACK-ARTIFACT-${role}-V1`, artifact);
    const body = {
      schemaVersion: "CIC_PACK_COMPANION_V2",
      role,
      schemaGeneration: verified.currentTruth.effectivePolicy.schemaFloor,
      policyGeneration: verified.currentTruth.effectivePolicy.policyFloor,
      taskIdentity: verified.domain.taskIdentity,
      taskContractIdentity: verified.authorization.taskContractIdentity,
      portableWorktreeIdentity: verified.domain.portableWorktreeIdentity,
      portableStateDomainIdentity: verified.domain.portableStateDomainIdentity,
      authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
      authorizationIdentity: verified.authorization.authorizationIdentity,
      currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
      checkpointRecordIdentity: checkpoint.record.checkpointRecordIdentity,
      artifactIdentity,
      artifact,
    };
    const companionIdentity = semanticIdentity("CIC-PACK-COMPANION-V2", body);
    const companion = {
      ...body,
      companionIdentity,
      locator: `objects/${companionIdentity}.json`,
    };
    const bytes = exactJsonBytes(companion);
    return {
      ...companion,
      manifestMetadata: {
        role,
        locator: companion.locator,
        bytes: bytes.byteLength,
        sha256: sha256Hex(bytes),
        companionIdentity,
        artifactIdentity,
        schemaGeneration: body.schemaGeneration,
        policyGeneration: body.policyGeneration,
      },
    };
  });
}

function assertPolicy(declared, effective) {
  requirePlainObject(declared, "declared policy");
  if (
    declared.schemaVersion !== effective.schemaVersion ||
    declared.schemaFloor !== effective.schemaFloor ||
    declared.policyFloor !== effective.policyFloor ||
    canonicalJson(declared.requiredRoles) !== canonicalJson(effective.requiredRoles) ||
    declared.effectivePolicyIdentity !== effective.effectivePolicyIdentity
  ) {
    fail("PACK_SCHEMA_POLICY_FLOOR_MISMATCH");
  }
}

export async function generatePack(input) {
  const verified = await verifyAuthorization({ ...input, requiredAction: "GENERATE_NON_ACTIVE" });
  const checkpoint = verified.checkpoint;
  if (input.declaredPolicy !== undefined) {
    fail("PACK_SCHEMA_POLICY_FLOOR_MISMATCH");
  }
  if (input.companions !== undefined) fail("PACK_MANIFEST_MISMATCH");
  const companions = buildAuthenticCompanions(verified, checkpoint);
  const requiredRoles = verified.currentTruth.effectivePolicy.requiredRoles;
  assertPackRoleFloor(requiredRoles);
  if (!Number.isSafeInteger(input.generation) || input.generation < 1) {
    fail("PACK_GENERATION_MISMATCH");
  }
  const parentPackIdentity = input.parentPackIdentity ?? null;
  if (parentPackIdentity !== null) requireIdentity(parentPackIdentity, "parent pack identity");
  const manifestBody = {
    schemaVersion: "CIC_PACK_MANIFEST_V1",
    taskIdentity: verified.domain.taskIdentity,
    taskContractIdentity: verified.authorization.taskContractIdentity,
    portableWorktreeIdentity: verified.domain.portableWorktreeIdentity,
    portableStateDomainIdentity: verified.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: verified.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: verified.domain.localWorktreeBindingIdentity,
    authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
    contextGenerationIdentity: verified.currentTruth.context.contextGenerationIdentity,
    checkpointRecordIdentity: checkpoint.record.checkpointRecordIdentity,
    effectivePolicyIdentity: verified.currentTruth.effectivePolicy.effectivePolicyIdentity,
    schemaFloor: verified.currentTruth.effectivePolicy.schemaFloor,
    policyFloor: verified.currentTruth.effectivePolicy.policyFloor,
    requiredRoles,
    generation: input.generation,
    parentPackIdentity,
    companions: companions.map(({ manifestMetadata }) => manifestMetadata),
  };
  const packIdentity = semanticIdentity("CIC-PACK-MANIFEST-V1", manifestBody);
  const manifest = { ...manifestBody, packIdentity };
  const paths = packPaths(verified.domain);
  for (const companion of companions) {
    const storedCompanion = { ...companion };
    delete storedCompanion.manifestMetadata;
    await writeImmutableJson(
      path.join(paths.objects, `${companion.companionIdentity}.json`),
      storedCompanion,
      "PACK_MANIFEST_MISMATCH",
      paths.stateRoot,
    );
  }
  await writeImmutableJson(
    path.join(paths.manifests, `${packIdentity}.json`),
    manifest,
    "PACK_MANIFEST_MISMATCH",
    paths.stateRoot,
  );
  const generated = lifecycleRecord("GENERATED", {
    packIdentity,
    authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    generation: manifest.generation,
    parentPackIdentity: manifest.parentPackIdentity,
  });
  await writeImmutableJson(
    path.join(paths.generated, `${packIdentity}.json`),
    generated,
    "PACK_STATE_TRANSITION_INVALID",
    paths.stateRoot,
  );
  return {
    packIdentity,
    manifest,
    companions: companions.map((companion) => {
      const stored = { ...companion };
      delete stored.manifestMetadata;
      return stored;
    }),
    lifecycle: generated,
    active: false,
  };
}

function requireExactKeys(value, expectedKeys, code) {
  if (
    !isPlainObject(value) ||
    Object.keys(value).sort().join("\0") !== [...expectedKeys].sort().join("\0")
  ) {
    fail(code);
  }
}

async function verifyIntrinsicPackMaterial(paths, packIdentity) {
  const manifest = await readJson(
    path.join(paths.manifests, `${packIdentity}.json`),
    "PACK_IDENTITY_MISMATCH",
    paths.stateRoot,
  );
  if (!isIdentity(manifest.packIdentity) || manifest.packIdentity !== packIdentity) {
    fail("PACK_IDENTITY_MISMATCH");
  }
  const body = { ...manifest };
  delete body.packIdentity;
  requireExactKeys(
    manifest,
    [
      "schemaVersion",
      "taskIdentity",
      "taskContractIdentity",
      "portableWorktreeIdentity",
      "portableStateDomainIdentity",
      "localStateStoreBindingIdentity",
      "localWorktreeBindingIdentity",
      "authorizationHeadIdentity",
      "authorizationIdentity",
      "currentTruthIdentity",
      "contextGenerationIdentity",
      "checkpointRecordIdentity",
      "effectivePolicyIdentity",
      "schemaFloor",
      "policyFloor",
      "requiredRoles",
      "generation",
      "parentPackIdentity",
      "companions",
      "packIdentity",
    ],
    "PACK_IDENTITY_MISMATCH",
  );
  if (semanticIdentity("CIC-PACK-MANIFEST-V1", body) !== packIdentity) {
    fail("PACK_IDENTITY_MISMATCH");
  }
  if (
    manifest.schemaVersion !== "CIC_PACK_MANIFEST_V1" ||
    !isIdentity(manifest.taskIdentity) ||
    !isIdentity(manifest.taskContractIdentity) ||
    !isIdentity(manifest.portableWorktreeIdentity) ||
    !isIdentity(manifest.portableStateDomainIdentity) ||
    !isIdentity(manifest.localStateStoreBindingIdentity) ||
    !isIdentity(manifest.localWorktreeBindingIdentity) ||
    !isIdentity(manifest.authorizationHeadIdentity) ||
    !isIdentity(manifest.authorizationIdentity) ||
    !isIdentity(manifest.currentTruthIdentity) ||
    !isIdentity(manifest.contextGenerationIdentity) ||
    !isIdentity(manifest.checkpointRecordIdentity) ||
    !isIdentity(manifest.effectivePolicyIdentity) ||
    !Number.isSafeInteger(manifest.schemaFloor) ||
    manifest.schemaFloor < 1 ||
    !Number.isSafeInteger(manifest.policyFloor) ||
    manifest.policyFloor < 1 ||
    !Number.isSafeInteger(manifest.generation) ||
    manifest.generation < 1 ||
    (manifest.parentPackIdentity !== null && !isIdentity(manifest.parentPackIdentity)) ||
    !Array.isArray(manifest.companions)
  ) {
    fail("PACK_IDENTITY_MISMATCH");
  }
  if (
    !Array.isArray(manifest.requiredRoles) ||
    manifest.companions.some((entry) => !isPlainObject(entry)) ||
    canonicalJson(manifest.requiredRoles) !== canonicalJson(COMPANION_ROLES) ||
    canonicalJson(manifest.companions.map((entry) => entry.role)) !== canonicalJson(COMPANION_ROLES)
  ) {
    fail("PACK_IDENTITY_MISMATCH");
  }
  const intrinsicPolicyBody = {
    schemaVersion: "CIC_I4_POLICY_V1",
    schemaFloor: manifest.schemaFloor,
    policyFloor: manifest.policyFloor,
    requiredRoles: manifest.requiredRoles,
  };
  if (
    semanticIdentity("CIC-I4-EFFECTIVE-POLICY-V1", intrinsicPolicyBody) !==
    manifest.effectivePolicyIdentity
  ) {
    fail("PACK_IDENTITY_MISMATCH");
  }
  for (const entry of manifest.companions) {
    requireExactKeys(
      entry,
      [
        "role",
        "locator",
        "bytes",
        "sha256",
        "companionIdentity",
        "artifactIdentity",
        "schemaGeneration",
        "policyGeneration",
      ],
      "PACK_IDENTITY_MISMATCH",
    );
    if (!isIdentity(entry.companionIdentity) || !isIdentity(entry.artifactIdentity)) {
      fail("PACK_IDENTITY_MISMATCH");
    }
    const companion = await readJson(
      path.join(paths.objects, `${entry.companionIdentity}.json`),
      "PACK_IDENTITY_MISMATCH",
      paths.stateRoot,
    );
    requireExactKeys(
      companion,
      [
        "schemaVersion",
        "role",
        "schemaGeneration",
        "policyGeneration",
        "taskIdentity",
        "taskContractIdentity",
        "portableWorktreeIdentity",
        "portableStateDomainIdentity",
        "authorizationHeadIdentity",
        "authorizationIdentity",
        "currentTruthIdentity",
        "checkpointRecordIdentity",
        "artifactIdentity",
        "artifact",
        "companionIdentity",
        "locator",
      ],
      "PACK_IDENTITY_MISMATCH",
    );
    const companionBody = { ...companion };
    delete companionBody.companionIdentity;
    delete companionBody.locator;
    const actualBytes = exactJsonBytes(companion);
    if (
      companion.schemaVersion !== "CIC_PACK_COMPANION_V2" ||
      companion.companionIdentity !== entry.companionIdentity ||
      companion.role !== entry.role ||
      companion.locator !== entry.locator ||
      entry.locator !== `objects/${entry.companionIdentity}.json` ||
      entry.bytes !== actualBytes.byteLength ||
      entry.sha256 !== sha256Hex(actualBytes) ||
      entry.artifactIdentity !== companion.artifactIdentity ||
      entry.schemaGeneration !== companion.schemaGeneration ||
      entry.policyGeneration !== companion.policyGeneration ||
      companion.schemaGeneration !== manifest.schemaFloor ||
      companion.policyGeneration !== manifest.policyFloor ||
      companion.taskIdentity !== manifest.taskIdentity ||
      companion.taskContractIdentity !== manifest.taskContractIdentity ||
      companion.portableWorktreeIdentity !== manifest.portableWorktreeIdentity ||
      companion.portableStateDomainIdentity !== manifest.portableStateDomainIdentity ||
      companion.authorizationHeadIdentity !== manifest.authorizationHeadIdentity ||
      companion.authorizationIdentity !== manifest.authorizationIdentity ||
      companion.currentTruthIdentity !== manifest.currentTruthIdentity ||
      companion.checkpointRecordIdentity !== manifest.checkpointRecordIdentity ||
      semanticIdentity(`CIC-I4-PACK-ARTIFACT-${entry.role}-V1`, companion.artifact) !==
        companion.artifactIdentity
    ) {
      fail("PACK_IDENTITY_MISMATCH");
    }
    if (semanticIdentity("CIC-PACK-COMPANION-V2", companionBody) !== entry.companionIdentity) {
      fail("PACK_IDENTITY_MISMATCH");
    }
  }
  return manifest;
}

async function verifyCurrentPackMaterial(paths, packIdentity, verified) {
  const manifest = await verifyIntrinsicPackMaterial(paths, packIdentity);
  const expectedCompanions = buildAuthenticCompanions(verified, verified.checkpoint);
  for (const entry of manifest.companions) {
    const expected = expectedCompanions.find((candidate) => candidate.role === entry.role);
    if (expected === undefined) fail("PACK_IDENTITY_MISMATCH");
    const expectedStored = { ...expected };
    delete expectedStored.manifestMetadata;
    const companion = await readJson(
      path.join(paths.objects, `${entry.companionIdentity}.json`),
      "PACK_IDENTITY_MISMATCH",
      paths.stateRoot,
    );
    if (canonicalJson(companion) !== canonicalJson(expectedStored)) {
      fail("PACK_IDENTITY_MISMATCH");
    }
  }
  return manifest;
}

export async function verifyPack(input, { persist = true } = {}) {
  requireIdentity(input.packIdentity, "pack identity");
  const verified = await verifyAuthorization({ ...input, requiredAction: "VERIFY" });
  const paths = packPaths(verified.domain);
  const terminal = await terminalLifecycle(paths, input.packIdentity);
  if (terminal.superseded !== null || terminal.invalid !== null) {
    fail("PACK_STATE_TRANSITION_INVALID");
  }
  const manifest = await verifyCurrentPackMaterial(paths, input.packIdentity, verified);
  const generated = assertLifecycleExpected(
    await readLifecycleRecord(paths, "GENERATED", input.packIdentity, { required: true }),
    {
      packIdentity: input.packIdentity,
      authorizationHeadIdentity: manifest.authorizationHeadIdentity,
      authorizationIdentity: manifest.authorizationIdentity,
      generation: manifest.generation,
      parentPackIdentity: manifest.parentPackIdentity,
    },
  );
  if (
    manifest.authorizationHeadIdentity !== verified.head.authorizationHeadIdentity ||
    manifest.authorizationIdentity !== verified.authorization.authorizationIdentity ||
    manifest.taskContractIdentity !== verified.authorization.taskContractIdentity ||
    manifest.localWorktreeBindingIdentity !== verified.domain.localWorktreeBindingIdentity
  ) {
    fail("AUTHORIZATION_SUPERSEDED");
  }
  assertPolicy(
    {
      schemaVersion: verified.currentTruth.effectivePolicy.schemaVersion,
      schemaFloor: manifest.schemaFloor,
      policyFloor: manifest.policyFloor,
      requiredRoles: manifest.requiredRoles,
      effectivePolicyIdentity: manifest.effectivePolicyIdentity,
    },
    verified.currentTruth.effectivePolicy,
  );
  const checkpoint = await effectiveCheckpoint(verified);
  if (manifest.checkpointRecordIdentity !== checkpoint.record.checkpointRecordIdentity) {
    fail("PACK_GENERATION_MISMATCH");
  }
  const verificationIdentity = semanticIdentity("CIC-PACK-VERIFICATION-V1", manifest);
  const record = lifecycleRecord("VERIFIED", {
    packIdentity: input.packIdentity,
    authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    generation: manifest.generation,
    parentPackIdentity: manifest.parentPackIdentity,
    verificationIdentity,
  });
  if (persist) {
    await writeImmutableJson(
      path.join(paths.verified, `${input.packIdentity}.json`),
      record,
      "PACK_STATE_TRANSITION_INVALID",
      paths.stateRoot,
    );
  }
  return { verified, paths, manifest, generated, lifecycle: record };
}

export async function activatePack(input) {
  const outer = await verifyPack(input);
  if (!outer.verified.authorization.actions.includes("ACTIVATE_PACK")) {
    fail("AUTHORIZATION_ACTION_DENIED");
  }
  await verifyMutationLease(outer.verified, input.leaseIdentity);
  let result;
  await withExclusiveLock(
    outer.paths.authorizationLock,
    "AUTHORIZATION_CAS_CONFLICT",
    async () => {
      await withExclusiveLock(
        outer.paths.lock,
        "PACK_ACTIVATION_CAS_CONFLICT",
        async () => {
          const innerState = await inspectTaskState(input.domainInput);
          if (
            innerState.head.authorizationHeadIdentity !==
              outer.verified.head.authorizationHeadIdentity ||
            innerState.head.state !== "ACTIVE"
          ) {
            fail("AUTHORIZATION_STALE");
          }
          const oldLocator = await readOptional(
            outer.paths.locator,
            "PACK_MANIFEST_MISMATCH",
            outer.paths.stateRoot,
          );
          const observedLocatorIdentity = locatorIdentity(oldLocator);
          if ((input.expectedLocatorIdentity ?? null) !== observedLocatorIdentity) {
            fail("PACK_ACTIVATION_CAS_CONFLICT");
          }
          const candidateTerminal = await terminalLifecycle(outer.paths, input.packIdentity);
          if (candidateTerminal.superseded !== null || candidateTerminal.invalid !== null) {
            fail("PACK_STATE_TRANSITION_INVALID");
          }
          const verifiedLifecycle = assertLifecycleExpected(
            await readLifecycleRecord(outer.paths, "VERIFIED", input.packIdentity, {
              required: true,
            }),
            {
              packIdentity: input.packIdentity,
              authorizationHeadIdentity: innerState.head.authorizationHeadIdentity,
              authorizationIdentity: outer.verified.authorization.authorizationIdentity,
              generation: outer.manifest.generation,
              parentPackIdentity: outer.manifest.parentPackIdentity,
              verificationIdentity: semanticIdentity("CIC-PACK-VERIFICATION-V1", outer.manifest),
            },
          );
          let oldManifest = null;
          let superseded = null;
          if (oldLocator?.packIdentity !== null && oldLocator?.packIdentity !== undefined) {
            oldManifest = await verifyIntrinsicPackMaterial(outer.paths, oldLocator.packIdentity);
            const oldTerminal = await terminalLifecycle(outer.paths, oldLocator.packIdentity);
            if (oldTerminal.invalid !== null) fail("PACK_STATE_TRANSITION_INVALID");
            assertLifecycleExpected(
              await readLifecycleRecord(outer.paths, "ACTIVE", oldLocator.packIdentity, {
                required: true,
              }),
              {
                packIdentity: oldLocator.packIdentity,
                authorizationHeadIdentity: oldManifest.authorizationHeadIdentity,
                authorizationIdentity: oldManifest.authorizationIdentity,
                generation: oldManifest.generation,
                parentPackIdentity: oldManifest.parentPackIdentity,
                verificationIdentity: semanticIdentity("CIC-PACK-VERIFICATION-V1", oldManifest),
              },
            );
            if (
              outer.manifest.parentPackIdentity !== oldLocator.packIdentity ||
              outer.manifest.generation !== oldManifest.generation + 1
            ) {
              fail("PACK_GENERATION_MISMATCH");
            }
            superseded = lifecycleRecord("SUPERSEDED", {
              packIdentity: oldLocator.packIdentity,
              authorizationHeadIdentity: oldManifest.authorizationHeadIdentity,
              authorizationIdentity: oldManifest.authorizationIdentity,
              generation: oldManifest.generation,
              parentPackIdentity: oldManifest.parentPackIdentity,
              successorPackIdentity: input.packIdentity,
              successorAuthorizationHeadIdentity: innerState.head.authorizationHeadIdentity,
              successorAuthorizationIdentity: outer.verified.authorization.authorizationIdentity,
              successorGeneration: outer.manifest.generation,
              successorParentPackIdentity: outer.manifest.parentPackIdentity,
              predecessorLocatorIdentity: observedLocatorIdentity,
            });
            if (oldTerminal.superseded !== null) {
              assertLifecycleExpected(oldTerminal.superseded, superseded);
            }
          } else if (
            outer.manifest.parentPackIdentity !== null ||
            outer.manifest.generation !== 1
          ) {
            fail("PACK_GENERATION_MISMATCH");
          }
          await verifyCurrentPackMaterial(outer.paths, input.packIdentity, outer.verified);
          const active = lifecycleRecord("ACTIVE", {
            packIdentity: input.packIdentity,
            authorizationHeadIdentity: innerState.head.authorizationHeadIdentity,
            authorizationIdentity: outer.verified.authorization.authorizationIdentity,
            generation: outer.manifest.generation,
            parentPackIdentity: outer.manifest.parentPackIdentity,
            verificationIdentity: verifiedLifecycle.verificationIdentity,
            predecessorLocatorIdentity: observedLocatorIdentity,
            activationIdentity: semanticIdentity("CIC-PACK-ACTIVATION-V2", {
              packIdentity: input.packIdentity,
              authorizationHeadIdentity: innerState.head.authorizationHeadIdentity,
              authorizationIdentity: outer.verified.authorization.authorizationIdentity,
              generation: outer.manifest.generation,
              parentPackIdentity: outer.manifest.parentPackIdentity,
              verificationIdentity: verifiedLifecycle.verificationIdentity,
              predecessorLocatorIdentity: observedLocatorIdentity,
            }),
          });
          await writeImmutableJson(
            path.join(outer.paths.active, `${input.packIdentity}.json`),
            active,
            "PACK_STATE_TRANSITION_INVALID",
            outer.paths.stateRoot,
          );
          if (superseded !== null) {
            await writeImmutableJson(
              path.join(outer.paths.superseded, `${superseded.packIdentity}.json`),
              superseded,
              "PACK_STATE_TRANSITION_INVALID",
              outer.paths.stateRoot,
            );
          }
          const locator = {
            schemaVersion: "CIC_PACK_ACTIVE_LOCATOR_V1",
            packIdentity: input.packIdentity,
            authorizationHeadIdentity: innerState.head.authorizationHeadIdentity,
          };
          await atomicReplaceJson(outer.paths.locator, locator, outer.paths.stateRoot);
          result = {
            active,
            locator,
            locatorIdentity: locatorIdentity(locator),
            previous: oldManifest,
            superseded,
          };
        },
        outer.paths.stateRoot,
      );
    },
    outer.paths.stateRoot,
  );
  return result;
}

export async function inspectPack(input) {
  const verified = await verifyAuthorization(input);
  const paths = packPaths(verified.domain);
  const locator = await readOptional(paths.locator, "PACK_MANIFEST_MISMATCH", paths.stateRoot);
  if (locator === null || locator.packIdentity === null) {
    return { status: "ABSENT_PROVEN", usable: false, locator: null };
  }
  if (
    !isPlainObject(locator) ||
    locator.schemaVersion !== "CIC_PACK_ACTIVE_LOCATOR_V1" ||
    !isIdentity(locator.packIdentity) ||
    !isIdentity(locator.authorizationHeadIdentity)
  ) {
    return { status: "BLOCKED", usable: false, locator, finding: "PACK_MANIFEST_MISMATCH" };
  }
  let terminal;
  try {
    terminal = await terminalLifecycle(paths, locator.packIdentity);
  } catch (error) {
    if (error?.code === "PACK_STATE_TRANSITION_INVALID") {
      return { status: "BLOCKED", usable: false, locator, finding: error.code };
    }
    throw error;
  }
  if (terminal.invalid !== null) {
    return {
      status: "INVALID",
      usable: false,
      locator,
      lifecycle: terminal.invalid,
    };
  }
  if (terminal.superseded !== null) {
    return {
      status: "SUPERSEDED",
      usable: false,
      locator,
      lifecycle: terminal.superseded,
    };
  }
  let manifest;
  try {
    manifest = await verifyIntrinsicPackMaterial(paths, locator.packIdentity);
  } catch (error) {
    if (error?.code === "PACK_IDENTITY_MISMATCH") {
      return { status: "BLOCKED", usable: false, locator, finding: "PACK_IDENTITY_MISMATCH" };
    }
    throw error;
  }
  const epochCurrent =
    verified.head.state === "ACTIVE" &&
    locator.authorizationHeadIdentity === verified.head.authorizationHeadIdentity &&
    manifest.authorizationHeadIdentity === verified.head.authorizationHeadIdentity;
  if (epochCurrent) {
    try {
      await verifyCurrentPackMaterial(paths, locator.packIdentity, verified);
      const verificationIdentity = semanticIdentity("CIC-PACK-VERIFICATION-V1", manifest);
      assertLifecycleExpected(
        await readLifecycleRecord(paths, "GENERATED", locator.packIdentity, { required: true }),
        {
          packIdentity: locator.packIdentity,
          authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
          authorizationIdentity: verified.authorization.authorizationIdentity,
          generation: manifest.generation,
          parentPackIdentity: manifest.parentPackIdentity,
        },
      );
      assertLifecycleExpected(
        await readLifecycleRecord(paths, "VERIFIED", locator.packIdentity, { required: true }),
        {
          packIdentity: locator.packIdentity,
          authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
          authorizationIdentity: verified.authorization.authorizationIdentity,
          generation: manifest.generation,
          parentPackIdentity: manifest.parentPackIdentity,
          verificationIdentity,
        },
      );
      assertLifecycleExpected(
        await readLifecycleRecord(paths, "ACTIVE", locator.packIdentity, { required: true }),
        {
          packIdentity: locator.packIdentity,
          authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
          authorizationIdentity: verified.authorization.authorizationIdentity,
          generation: manifest.generation,
          parentPackIdentity: manifest.parentPackIdentity,
          verificationIdentity,
        },
      );
    } catch (error) {
      if (
        error?.code === "PACK_IDENTITY_MISMATCH" ||
        error?.code === "PACK_STATE_TRANSITION_INVALID"
      ) {
        return { status: "BLOCKED", usable: false, locator, finding: error.code };
      }
      throw error;
    }
  }
  return {
    status: epochCurrent ? "ACTIVE" : "HISTORICAL",
    usable: epochCurrent,
    locator,
    manifest,
  };
}

export async function invalidatePack(input) {
  const verified = await verifyAuthorization({ ...input, requiredAction: "VERIFY" });
  if (!verified.authorization.actions.includes("INVALIDATE_PACK")) {
    fail("AUTHORIZATION_ACTION_DENIED");
  }
  const paths = packPaths(verified.domain);
  const locator = await readJson(paths.locator, "PACK_INVALIDATION_CAS_CONFLICT", paths.stateRoot);
  const expected = input.expectedLocatorIdentity;
  if (locatorIdentity(locator) !== expected || locator.packIdentity !== input.packIdentity) {
    fail("PACK_INVALIDATION_CAS_CONFLICT");
  }
  const terminal = await terminalLifecycle(paths, input.packIdentity);
  if (terminal.superseded !== null || terminal.invalid !== null) {
    fail("PACK_STATE_TRANSITION_INVALID");
  }
  let tampered = false;
  try {
    await verifyIntrinsicPackMaterial(paths, input.packIdentity);
  } catch (error) {
    if (error?.code === "PACK_IDENTITY_MISMATCH") tampered = true;
    else throw error;
  }
  if (!tampered) fail("PACK_STATE_TRANSITION_INVALID");
  await withExclusiveLock(
    paths.authorizationLock,
    "AUTHORIZATION_CAS_CONFLICT",
    async () => {
      await withExclusiveLock(
        paths.lock,
        "PACK_INVALIDATION_CAS_CONFLICT",
        async () => {
          const inner = await inspectTaskState(input.domainInput);
          if (inner.head.authorizationHeadIdentity !== verified.head.authorizationHeadIdentity) {
            fail("AUTHORIZATION_STALE");
          }
          const innerLocator = await readJson(
            paths.locator,
            "PACK_INVALIDATION_CAS_CONFLICT",
            paths.stateRoot,
          );
          if (
            locatorIdentity(innerLocator) !== expected ||
            innerLocator.packIdentity !== input.packIdentity
          ) {
            fail("PACK_INVALIDATION_CAS_CONFLICT");
          }
          const innerTerminal = await terminalLifecycle(paths, input.packIdentity);
          if (innerTerminal.superseded !== null || innerTerminal.invalid !== null) {
            fail("PACK_STATE_TRANSITION_INVALID");
          }
          let stillTampered = false;
          try {
            await verifyIntrinsicPackMaterial(paths, input.packIdentity);
          } catch (error) {
            if (error?.code === "PACK_IDENTITY_MISMATCH") stillTampered = true;
            else throw error;
          }
          if (!stillTampered) fail("PACK_INVALIDATION_CAS_CONFLICT");
          const invalid = lifecycleRecord("INVALID", {
            packIdentity: input.packIdentity,
            authorizationHeadIdentity: inner.head.authorizationHeadIdentity,
            authorizationIdentity: verified.authorization.authorizationIdentity,
            invalidatedLocatorIdentity: expected,
            reason: "PACK_IDENTITY_MISMATCH",
          });
          try {
            await writeImmutableJson(
              path.join(paths.invalid, `${input.packIdentity}.json`),
              invalid,
              "PACK_INVALIDATION_PERSIST_FAILED",
              paths.stateRoot,
            );
            await atomicReplaceJson(
              paths.locator,
              {
                schemaVersion: "CIC_PACK_ACTIVE_LOCATOR_V1",
                packIdentity: null,
                authorizationHeadIdentity: inner.head.authorizationHeadIdentity,
              },
              paths.stateRoot,
            );
          } catch (error) {
            if (error?.code?.startsWith("PACK_")) throw error;
            fail("PACK_INVALIDATION_PERSIST_FAILED");
          }
        },
        paths.stateRoot,
      );
    },
    paths.stateRoot,
  );
  return { status: "INVALID", packIdentity: input.packIdentity };
}
