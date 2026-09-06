import path from "node:path";

import { canonicalJson } from "./canonical-json.mjs";
import { normalizeRepoRelativePath } from "./identity.mjs";
import {
  inspectTaskState,
  verifyAuthorization,
  verifyMutationLease,
} from "./task-authorization.mjs";
import {
  atomicReplaceJson,
  fail,
  isPlainObject,
  pathState,
  readJson,
  semanticIdentity,
  withExclusiveLock,
  writeImmutableJson,
} from "./state-domain.mjs";

const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;
const PORTABLE_VALUE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/u;
const LINEAGE_KINDS = new Set(["ACTIVE_PROGRESSION", "ADVISORY", "PARALLEL"]);
const LOCATOR_KINDS = new Set(["STATE_RELATIVE", "REPOSITORY_RELATIVE", "EVIDENCE_ID"]);
const REQUIRED_FORBIDDEN_ACTIONS = Object.freeze(["COMMIT", "MUTATE_SOURCES", "PUSH", "STAGE"]);

const ROOT_SCHEMA = "CIC_PROGRESSION_ROOT_V1";
const ROOT_IDENTITY_SCHEMA = "CIC-PROGRESSION-ROOT-V1";
const CONSTRUCTED_SCHEMA = "CIC_PROGRESSION_CONSTRUCTED_V1";
const CONSTRUCTED_IDENTITY_SCHEMA = "CIC-PROGRESSION-CONSTRUCTED-V1";
const PROMOTION_SCHEMA = "CIC_PROGRESSION_PROMOTION_V1";
const PROMOTION_IDENTITY_SCHEMA = "CIC-PROGRESSION-PROMOTION-V1";
const LOCATOR_SCHEMA = "CIC_PROGRESSION_ACTIVE_LOCATOR_V1";
const LOCATOR_IDENTITY_SCHEMA = "CIC-PROGRESSION-ACTIVE-LOCATOR-V1";

const CURRENTNESS_CODES = new Set([
  "AUTHORIZATION_STALE",
  "CONTEXT_GENERATION_RACE",
  "REPOSITORY_PREREQUISITE_BLOCKED",
  "REQUIRED_MATERIAL_READ_FAILED",
  "SOURCE_GENERATION_PREREQUISITE_BLOCKED",
  "TASK_CHECKPOINT_STALE",
  "WORKSPACE_NOT_QUIESCENT",
]);

function progressionError(code, message = code) {
  fail(code, message);
}

function mapAuthorityError(error) {
  if (typeof error?.code === "string" && error.code.startsWith("PROGRESSION_")) throw error;
  if (CURRENTNESS_CODES.has(error?.code)) {
    progressionError("PROGRESSION_CURRENTNESS_STALE", error.message);
  }
  if (
    typeof error?.code === "string" &&
    (error.code.startsWith("AUTHORIZATION_") ||
      error.code.startsWith("MUTATION_LEASE_") ||
      error.code === "CONTEXT_EXPANSION_REQUIRED" ||
      error.code === "STATE_STORE_BINDING_MISMATCH" ||
      error.code === "WORKTREE_BINDING_MISMATCH")
  ) {
    progressionError("PROGRESSION_AUTHORITY_INVALID", error.message);
  }
  throw error;
}

async function authenticate(input, requiredAction) {
  try {
    return await verifyAuthorization({ ...input, requiredAction });
  } catch (error) {
    mapAuthorityError(error);
  }
}

async function authenticateLease(verified, leaseIdentity) {
  try {
    return await verifyMutationLease(verified, leaseIdentity);
  } catch (error) {
    mapAuthorityError(error);
  }
}

function requireExactKeys(value, expected, code = "PROGRESSION_ROOT_INVALID") {
  if (
    !isPlainObject(value) ||
    Object.keys(value).sort().join("\0") !== [...expected].sort().join("\0")
  ) {
    progressionError(code);
  }
  return value;
}

function requireIdentity(value, code = "PROGRESSION_ROOT_INVALID") {
  if (typeof value !== "string" || !IDENTITY_PATTERN.test(value)) progressionError(code);
  return value;
}

function requireNullableIdentity(value, code = "PROGRESSION_ROOT_INVALID") {
  if (value !== null) requireIdentity(value, code);
  return value;
}

function requireGeneration(value, code = "PROGRESSION_GENERATION_MISMATCH") {
  if (!Number.isSafeInteger(value) || value < 1) progressionError(code);
  return value;
}

function stableIdentityList(values) {
  if (!Array.isArray(values) || values.length === 0) progressionError("PROGRESSION_ROOT_INVALID");
  const result = [...new Set(values)].sort();
  if (result.length !== values.length) progressionError("PROGRESSION_ROOT_INVALID");
  for (const value of result) requireIdentity(value);
  return result;
}

function stablePortableList(values) {
  if (!Array.isArray(values)) progressionError("PROGRESSION_ROOT_INVALID");
  const result = [...new Set(values)].sort();
  if (result.length !== values.length) progressionError("PROGRESSION_ROOT_INVALID");
  for (const value of result) {
    if (typeof value !== "string" || !PORTABLE_VALUE_PATTERN.test(value)) {
      progressionError("PROGRESSION_ROOT_INVALID");
    }
  }
  return result;
}

function boundedText(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 4096 ||
    value !== value.trim() ||
    value.includes("\0") ||
    value.includes("\r")
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  return value;
}

function normalizeLocator(locator) {
  requireExactKeys(locator, ["kind", "value"]);
  if (!LOCATOR_KINDS.has(locator.kind) || typeof locator.value !== "string") {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  let value;
  if (locator.kind === "EVIDENCE_ID") {
    if (!PORTABLE_VALUE_PATTERN.test(locator.value)) progressionError("PROGRESSION_ROOT_INVALID");
    value = locator.value;
  } else {
    try {
      value = normalizeRepoRelativePath(locator.value);
    } catch {
      progressionError("PROGRESSION_ROOT_INVALID");
    }
    if (value !== locator.value || value.length > 1024) {
      progressionError("PROGRESSION_ROOT_INVALID");
    }
  }
  return { kind: locator.kind, value };
}

function normalizeReference(value, role) {
  requireExactKeys(value, ["role", "identity", "locator"]);
  if (value.role !== role) progressionError("PROGRESSION_ROOT_INVALID");
  return {
    role,
    identity: requireIdentity(value.identity),
    locator: normalizeLocator(value.locator),
  };
}

function normalizeBootstrap(value) {
  requireExactKeys(value, ["disposition", "evidenceIdentities", "nextAction", "forbiddenActions"]);
  if (value.disposition !== "PASS" && value.disposition !== "BLOCKED") {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  const forbiddenActions = stablePortableList(value.forbiddenActions);
  if (REQUIRED_FORBIDDEN_ACTIONS.some((action) => !forbiddenActions.includes(action))) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  return {
    disposition: value.disposition,
    evidenceIdentities: stableIdentityList(value.evidenceIdentities),
    nextAction: boundedText(value.nextAction),
    forbiddenActions,
  };
}

function normalizeLineageInput(value, verified) {
  if (!isPlainObject(value)) progressionError("PROGRESSION_ROOT_INVALID");
  const keys = Object.keys(value).sort().join("\0");
  if (
    keys !== ["kind", "lineageIdentity"].sort().join("\0") &&
    keys !== ["kind", "lineageIdentity", "ownerDesignationIdentity"].sort().join("\0")
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  if (!LINEAGE_KINDS.has(value.kind)) progressionError("PROGRESSION_ROOT_INVALID");
  if (
    value.ownerDesignationIdentity !== undefined &&
    value.ownerDesignationIdentity !== verified.ownerDecision.ownerDecisionIdentity
  ) {
    progressionError("PROGRESSION_AUTHORITY_INVALID");
  }
  return {
    kind: value.kind,
    lineageIdentity: requireIdentity(value.lineageIdentity),
    ownerDesignationIdentity: verified.ownerDecision.ownerDecisionIdentity,
  };
}

function normalizeStoredLineage(value) {
  requireExactKeys(value, ["kind", "lineageIdentity", "ownerDesignationIdentity"]);
  if (!LINEAGE_KINDS.has(value.kind)) progressionError("PROGRESSION_ROOT_INVALID");
  return {
    kind: value.kind,
    lineageIdentity: requireIdentity(value.lineageIdentity),
    ownerDesignationIdentity: requireIdentity(value.ownerDesignationIdentity),
  };
}

function progressionPaths(verified) {
  const root = path.join(verified.domain.stateRoot, "progression-root");
  return {
    stateRoot: verified.domain.stateRoot,
    root,
    roots: path.join(root, "roots"),
    constructed: path.join(root, "lifecycle", "constructed"),
    promotions: path.join(root, "promotions"),
    locator: path.join(root, "active.json"),
    lock: path.join(root, "active.lock"),
    authorizationLock: verified.paths.authorizationLock,
  };
}

async function readOptional(filePath, code, stateRoot) {
  const state = await pathState(filePath, stateRoot);
  if (state.state === "ABSENT_PROVEN") return null;
  if (state.state !== "PRESENT" || !state.stats.isFile() || state.stats.isSymbolicLink()) {
    progressionError(code);
  }
  try {
    return await readJson(filePath, code, stateRoot);
  } catch (error) {
    if (error?.code === code) throw error;
    progressionError(code, error?.message);
  }
}

function currentBindings(verified) {
  return {
    repositoryIdentity: verified.domain.repositoryIdentity,
    repositorySnapshotIdentity: verified.currentTruth.repository.snapshotFingerprint,
    sourceGenerationIdentity: verified.currentTruth.sourceGeneration.fingerprint,
    taskIdentity: verified.domain.taskIdentity,
    taskContractIdentity: verified.authorization.taskContractIdentity,
    authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
    contextGenerationIdentity: verified.currentTruth.context.contextGenerationIdentity,
    checkpointRecordIdentity: verified.checkpoint.record.checkpointRecordIdentity,
    effectivePolicyIdentity: verified.currentTruth.effectivePolicy.effectivePolicyIdentity,
    portableWorktreeIdentity: verified.domain.portableWorktreeIdentity,
    portableStateDomainIdentity: verified.domain.portableStateDomainIdentity,
  };
}

const BINDING_FIELDS = Object.freeze([
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "sourceGenerationIdentity",
  "taskIdentity",
  "taskContractIdentity",
  "authorizationHeadIdentity",
  "authorizationIdentity",
  "currentTruthIdentity",
  "contextGenerationIdentity",
  "checkpointRecordIdentity",
  "effectivePolicyIdentity",
  "portableWorktreeIdentity",
  "portableStateDomainIdentity",
]);

function normalizeBindings(value) {
  requireExactKeys(value, BINDING_FIELDS);
  const result = {};
  for (const field of BINDING_FIELDS) result[field] = requireIdentity(value[field]);
  return result;
}

function assertCurrentBindings(root, verified) {
  const expected = currentBindings(verified);
  const authorityFields = [
    "taskIdentity",
    "taskContractIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "checkpointRecordIdentity",
    "portableWorktreeIdentity",
    "portableStateDomainIdentity",
  ];
  if (authorityFields.some((field) => root.bindings[field] !== expected[field])) {
    progressionError("PROGRESSION_AUTHORITY_INVALID");
  }
  const currentnessFields = BINDING_FIELDS.filter((field) => !authorityFields.includes(field));
  if (currentnessFields.some((field) => root.bindings[field] !== expected[field])) {
    progressionError("PROGRESSION_CURRENTNESS_STALE");
  }
}

function assertRootRecord(record, addressedIdentity) {
  requireExactKeys(record, [
    "schemaVersion",
    "generation",
    "parentRootIdentity",
    "lineage",
    "bindings",
    "currentControl",
    "sessionWorkstream",
    "bootstrap",
    "rootIdentity",
  ]);
  if (record.schemaVersion !== ROOT_SCHEMA || record.rootIdentity !== addressedIdentity) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  requireIdentity(record.rootIdentity);
  requireGeneration(record.generation, "PROGRESSION_ROOT_INVALID");
  requireNullableIdentity(record.parentRootIdentity);
  const lineage = normalizeStoredLineage(record.lineage);
  const bindings = normalizeBindings(record.bindings);
  const currentControl = normalizeReference(record.currentControl, "CURRENT_CONTROL");
  const sessionWorkstream = normalizeReference(record.sessionWorkstream, "SESSION_WORKSTREAM");
  const bootstrap = normalizeBootstrap(record.bootstrap);
  if (
    currentControl.identity === sessionWorkstream.identity ||
    canonicalJson(currentControl.locator) === canonicalJson(sessionWorkstream.locator)
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  if (
    (record.generation === 1) !== (record.parentRootIdentity === null) ||
    (record.parentRootIdentity !== null && record.generation < 2)
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  const body = {
    schemaVersion: ROOT_SCHEMA,
    generation: record.generation,
    parentRootIdentity: record.parentRootIdentity,
    lineage,
    bindings,
    currentControl,
    sessionWorkstream,
    bootstrap,
  };
  if (
    canonicalJson({ ...body, rootIdentity: record.rootIdentity }) !== canonicalJson(record) ||
    semanticIdentity(ROOT_IDENTITY_SCHEMA, body) !== addressedIdentity
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  return record;
}

function constructedRecord(root) {
  const body = {
    schemaVersion: CONSTRUCTED_SCHEMA,
    state: "CONSTRUCTED",
    rootIdentity: root.rootIdentity,
    generation: root.generation,
    parentRootIdentity: root.parentRootIdentity,
    lineageIdentity: root.lineage.lineageIdentity,
    authorizationHeadIdentity: root.bindings.authorizationHeadIdentity,
    authorizationIdentity: root.bindings.authorizationIdentity,
    currentTruthIdentity: root.bindings.currentTruthIdentity,
  };
  return {
    ...body,
    lifecycleRecordIdentity: semanticIdentity(CONSTRUCTED_IDENTITY_SCHEMA, body),
  };
}

function assertConstructedRecord(record, root) {
  const expected = constructedRecord(root);
  requireExactKeys(record, Object.keys(expected));
  if (canonicalJson(record) !== canonicalJson(expected)) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  return record;
}

async function loadIntrinsicRoot(paths, rootIdentity) {
  requireIdentity(rootIdentity);
  const root = assertRootRecord(
    await readJson(
      path.join(paths.roots, `${rootIdentity}.json`),
      "PROGRESSION_ROOT_INVALID",
      paths.stateRoot,
    ),
    rootIdentity,
  );
  const lifecycle = assertConstructedRecord(
    await readJson(
      path.join(paths.constructed, `${rootIdentity}.json`),
      "PROGRESSION_ROOT_INVALID",
      paths.stateRoot,
    ),
    root,
  );
  if (root.parentRootIdentity !== null) {
    const parent = assertRootRecord(
      await readJson(
        path.join(paths.roots, `${root.parentRootIdentity}.json`),
        "PROGRESSION_ROOT_INVALID",
        paths.stateRoot,
      ),
      root.parentRootIdentity,
    );
    if (root.generation !== parent.generation + 1) {
      progressionError("PROGRESSION_GENERATION_MISMATCH");
    }
  }
  return { root, lifecycle };
}

function promotionRecord(root, predecessorLocator, predecessorLocatorIdentity, verified) {
  const body = {
    schemaVersion: PROMOTION_SCHEMA,
    rootIdentity: root.rootIdentity,
    generation: root.generation,
    parentRootIdentity: root.parentRootIdentity,
    lineageIdentity: root.lineage.lineageIdentity,
    expectedActiveRootIdentity: predecessorLocator?.rootIdentity ?? null,
    expectedParentRootIdentity: root.parentRootIdentity,
    expectedGeneration: root.generation,
    predecessorRootIdentity: predecessorLocator?.rootIdentity ?? null,
    predecessorLocatorIdentity,
    authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
  };
  return { ...body, promotionIdentity: semanticIdentity(PROMOTION_IDENTITY_SCHEMA, body) };
}

function assertPromotionRecord(record, addressedIdentity) {
  requireExactKeys(record, [
    "schemaVersion",
    "rootIdentity",
    "generation",
    "parentRootIdentity",
    "lineageIdentity",
    "expectedActiveRootIdentity",
    "expectedParentRootIdentity",
    "expectedGeneration",
    "predecessorRootIdentity",
    "predecessorLocatorIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "currentTruthIdentity",
    "promotionIdentity",
  ]);
  const body = { ...record };
  delete body.promotionIdentity;
  if (
    record.schemaVersion !== PROMOTION_SCHEMA ||
    record.promotionIdentity !== addressedIdentity ||
    semanticIdentity(PROMOTION_IDENTITY_SCHEMA, body) !== addressedIdentity
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  for (const field of [
    "rootIdentity",
    "lineageIdentity",
    "authorizationHeadIdentity",
    "authorizationIdentity",
    "currentTruthIdentity",
    "promotionIdentity",
  ]) {
    requireIdentity(record[field]);
  }
  requireGeneration(record.generation, "PROGRESSION_ROOT_INVALID");
  requireGeneration(record.expectedGeneration, "PROGRESSION_ROOT_INVALID");
  requireNullableIdentity(record.parentRootIdentity);
  requireNullableIdentity(record.expectedActiveRootIdentity);
  requireNullableIdentity(record.expectedParentRootIdentity);
  requireNullableIdentity(record.predecessorRootIdentity);
  requireNullableIdentity(record.predecessorLocatorIdentity);
  return record;
}

function locatorFor(root, promotion) {
  return {
    schemaVersion: LOCATOR_SCHEMA,
    rootIdentity: root.rootIdentity,
    promotionIdentity: promotion.promotionIdentity,
    generation: root.generation,
    parentRootIdentity: root.parentRootIdentity,
    lineageIdentity: root.lineage.lineageIdentity,
    authorizationHeadIdentity: promotion.authorizationHeadIdentity,
  };
}

export function progressionLocatorIdentity(locator) {
  if (locator === null) return null;
  return semanticIdentity(LOCATOR_IDENTITY_SCHEMA, locator);
}

async function assertActiveLocator(paths, locator) {
  requireExactKeys(locator, [
    "schemaVersion",
    "rootIdentity",
    "promotionIdentity",
    "generation",
    "parentRootIdentity",
    "lineageIdentity",
    "authorizationHeadIdentity",
  ]);
  if (locator.schemaVersion !== LOCATOR_SCHEMA) progressionError("PROGRESSION_ROOT_INVALID");
  for (const field of [
    "rootIdentity",
    "promotionIdentity",
    "lineageIdentity",
    "authorizationHeadIdentity",
  ]) {
    requireIdentity(locator[field]);
  }
  requireGeneration(locator.generation, "PROGRESSION_ROOT_INVALID");
  requireNullableIdentity(locator.parentRootIdentity);
  const loaded = await loadIntrinsicRoot(paths, locator.rootIdentity);
  const promotion = assertPromotionRecord(
    await readJson(
      path.join(paths.promotions, `${locator.promotionIdentity}.json`),
      "PROGRESSION_ROOT_INVALID",
      paths.stateRoot,
    ),
    locator.promotionIdentity,
  );
  if (
    locator.rootIdentity !== loaded.root.rootIdentity ||
    locator.generation !== loaded.root.generation ||
    locator.parentRootIdentity !== loaded.root.parentRootIdentity ||
    locator.lineageIdentity !== loaded.root.lineage.lineageIdentity ||
    locator.authorizationHeadIdentity !== promotion.authorizationHeadIdentity ||
    promotion.rootIdentity !== loaded.root.rootIdentity ||
    promotion.generation !== loaded.root.generation ||
    promotion.parentRootIdentity !== loaded.root.parentRootIdentity ||
    promotion.lineageIdentity !== loaded.root.lineage.lineageIdentity ||
    promotion.expectedActiveRootIdentity !== promotion.predecessorRootIdentity ||
    promotion.expectedParentRootIdentity !== loaded.root.parentRootIdentity ||
    promotion.expectedGeneration !== loaded.root.generation ||
    promotion.predecessorRootIdentity !== loaded.root.parentRootIdentity ||
    promotion.authorizationHeadIdentity !== loaded.root.bindings.authorizationHeadIdentity ||
    promotion.authorizationIdentity !== loaded.root.bindings.authorizationIdentity ||
    promotion.currentTruthIdentity !== loaded.root.bindings.currentTruthIdentity
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  return { ...loaded, promotion };
}

function expectation(input) {
  const expectedActiveRootIdentity = input.expectedActiveRootIdentity ?? null;
  const expectedParentRootIdentity = input.expectedParentRootIdentity ?? null;
  try {
    requireNullableIdentity(expectedActiveRootIdentity, "PROGRESSION_EXPECTATION_MISMATCH");
    requireNullableIdentity(expectedParentRootIdentity, "PROGRESSION_EXPECTATION_MISMATCH");
    requireGeneration(input.expectedGeneration, "PROGRESSION_EXPECTATION_MISMATCH");
  } catch (error) {
    if (error?.code === "PROGRESSION_EXPECTATION_MISMATCH") throw error;
    progressionError("PROGRESSION_EXPECTATION_MISMATCH");
  }
  return {
    expectedActiveRootIdentity,
    expectedParentRootIdentity,
    expectedGeneration: input.expectedGeneration,
  };
}

export async function constructProgressionRoot(input) {
  const verified = await authenticate(input, "GENERATE_NON_ACTIVE");
  const paths = progressionPaths(verified);
  const generation = requireGeneration(input.generation);
  const parentRootIdentity = input.parentRootIdentity ?? null;
  requireNullableIdentity(parentRootIdentity);
  const lineage = normalizeLineageInput(input.lineage, verified);
  const currentControl = normalizeReference(input.currentControl, "CURRENT_CONTROL");
  const sessionWorkstream = normalizeReference(input.sessionWorkstream, "SESSION_WORKSTREAM");
  if (
    currentControl.identity === sessionWorkstream.identity ||
    canonicalJson(currentControl.locator) === canonicalJson(sessionWorkstream.locator)
  ) {
    progressionError("PROGRESSION_ROOT_INVALID");
  }
  const bootstrap = normalizeBootstrap(input.bootstrap);
  if ((generation === 1) !== (parentRootIdentity === null)) {
    progressionError("PROGRESSION_GENERATION_MISMATCH");
  }
  if (parentRootIdentity !== null) {
    const parent = await loadIntrinsicRoot(paths, parentRootIdentity);
    if (generation !== parent.root.generation + 1) {
      progressionError("PROGRESSION_GENERATION_MISMATCH");
    }
  }
  const body = {
    schemaVersion: ROOT_SCHEMA,
    generation,
    parentRootIdentity,
    lineage,
    bindings: currentBindings(verified),
    currentControl,
    sessionWorkstream,
    bootstrap,
  };
  const rootIdentity = semanticIdentity(ROOT_IDENTITY_SCHEMA, body);
  const root = { ...body, rootIdentity };
  const lifecycle = constructedRecord(root);
  await writeImmutableJson(
    path.join(paths.roots, `${rootIdentity}.json`),
    root,
    "PROGRESSION_ROOT_INVALID",
    paths.stateRoot,
  );
  await writeImmutableJson(
    path.join(paths.constructed, `${rootIdentity}.json`),
    lifecycle,
    "PROGRESSION_ROOT_INVALID",
    paths.stateRoot,
  );
  return { rootIdentity, root, lifecycle, active: false };
}

export async function verifyProgressionRoot(input) {
  const verified = await authenticate(input, "VERIFY");
  const paths = progressionPaths(verified);
  const loaded = await loadIntrinsicRoot(paths, requireIdentity(input.rootIdentity));
  assertCurrentBindings(loaded.root, verified);
  return {
    status: "VERIFIED",
    usable: true,
    rootIdentity: loaded.root.rootIdentity,
    root: loaded.root,
    lifecycle: loaded.lifecycle,
  };
}

export async function inspectActiveProgression(input) {
  const verified = await authenticate(input, "VERIFY");
  const paths = progressionPaths(verified);
  let locator;
  try {
    locator = await readOptional(paths.locator, "PROGRESSION_ROOT_INVALID", paths.stateRoot);
    if (locator === null) {
      return { status: "ABSENT_PROVEN", usable: false, locator: null, locatorIdentity: null };
    }
    const loaded = await assertActiveLocator(paths, locator);
    if (loaded.root.lineage.kind !== "ACTIVE_PROGRESSION") {
      return {
        status: "BLOCKED",
        usable: false,
        locator,
        locatorIdentity: progressionLocatorIdentity(locator),
        finding: "PROGRESSION_LINEAGE_NOT_ACTIVE",
      };
    }
    try {
      assertCurrentBindings(loaded.root, verified);
    } catch (error) {
      if (
        error?.code === "PROGRESSION_CURRENTNESS_STALE" ||
        error?.code === "PROGRESSION_AUTHORITY_INVALID"
      ) {
        return {
          status: "HISTORICAL",
          usable: false,
          locator,
          locatorIdentity: progressionLocatorIdentity(locator),
          root: loaded.root,
          promotion: loaded.promotion,
          finding: error.code,
        };
      }
      throw error;
    }
    return {
      status: "ACTIVE",
      usable: true,
      locator,
      locatorIdentity: progressionLocatorIdentity(locator),
      root: loaded.root,
      promotion: loaded.promotion,
    };
  } catch (error) {
    if (error?.code === "PROGRESSION_ROOT_INVALID") {
      return {
        status: "BLOCKED",
        usable: false,
        locator: locator ?? null,
        locatorIdentity: null,
        finding: error.code,
      };
    }
    throw error;
  }
}

export async function promoteProgressionRoot(input) {
  const verified = await authenticate(input, "GOVERNED_CONTENT_WRITE");
  const expected = expectation(input);
  const paths = progressionPaths(verified);
  const candidate = await loadIntrinsicRoot(paths, requireIdentity(input.rootIdentity));
  assertCurrentBindings(candidate.root, verified);
  if (candidate.root.lineage.kind !== "ACTIVE_PROGRESSION") {
    progressionError("PROGRESSION_LINEAGE_NOT_ACTIVE");
  }
  await authenticateLease(verified, input.leaseIdentity);
  let result;
  await withExclusiveLock(
    paths.authorizationLock,
    "PROGRESSION_EXPECTATION_MISMATCH",
    async () => {
      let taskState;
      try {
        taskState = await inspectTaskState(input.domainInput);
      } catch (error) {
        mapAuthorityError(error);
      }
      if (
        taskState.head.state !== "ACTIVE" ||
        taskState.head.authorizationHeadIdentity !== verified.head.authorizationHeadIdentity ||
        taskState.head.currentAuthorizationIdentity !== verified.authorization.authorizationIdentity
      ) {
        progressionError("PROGRESSION_AUTHORITY_INVALID");
      }
      await authenticateLease(verified, input.leaseIdentity);
      await withExclusiveLock(
        paths.lock,
        "PROGRESSION_EXPECTATION_MISMATCH",
        async () => {
          const locator = await readOptional(
            paths.locator,
            "PROGRESSION_ROOT_INVALID",
            paths.stateRoot,
          );
          let predecessor = null;
          if (locator !== null) predecessor = await assertActiveLocator(paths, locator);
          const observedRootIdentity = locator?.rootIdentity ?? null;
          if (observedRootIdentity !== expected.expectedActiveRootIdentity) {
            progressionError("PROGRESSION_ACTIVE_ROOT_MISMATCH");
          }
          if (candidate.root.parentRootIdentity !== expected.expectedParentRootIdentity) {
            progressionError("PROGRESSION_PARENT_MISMATCH");
          }
          if (expected.expectedParentRootIdentity !== expected.expectedActiveRootIdentity) {
            progressionError("PROGRESSION_PARENT_MISMATCH");
          }
          if (candidate.root.generation !== expected.expectedGeneration) {
            progressionError("PROGRESSION_GENERATION_MISMATCH");
          }
          if (locator === null) {
            if (
              expected.expectedGeneration !== 1 ||
              candidate.root.generation !== 1 ||
              candidate.root.parentRootIdentity !== null
            ) {
              progressionError("PROGRESSION_GENERATION_MISMATCH");
            }
          } else {
            if (
              expected.expectedGeneration !== locator.generation + 1 ||
              candidate.root.parentRootIdentity !== locator.rootIdentity
            ) {
              progressionError("PROGRESSION_GENERATION_MISMATCH");
            }
            if (
              candidate.root.lineage.lineageIdentity !== predecessor.root.lineage.lineageIdentity
            ) {
              progressionError("PROGRESSION_LINEAGE_NOT_ACTIVE");
            }
          }
          const reloaded = await loadIntrinsicRoot(paths, candidate.root.rootIdentity);
          assertCurrentBindings(reloaded.root, verified);
          const predecessorLocatorIdentity = progressionLocatorIdentity(locator);
          const promotion = promotionRecord(
            reloaded.root,
            locator,
            predecessorLocatorIdentity,
            verified,
          );
          await writeImmutableJson(
            path.join(paths.promotions, `${promotion.promotionIdentity}.json`),
            promotion,
            "PROGRESSION_ROOT_INVALID",
            paths.stateRoot,
          );
          const nextLocator = locatorFor(reloaded.root, promotion);
          await atomicReplaceJson(paths.locator, nextLocator, paths.stateRoot);
          result = {
            status: "ACTIVE",
            rootIdentity: reloaded.root.rootIdentity,
            root: reloaded.root,
            promotion,
            locator: nextLocator,
            locatorIdentity: progressionLocatorIdentity(nextLocator),
            previousRootIdentity: observedRootIdentity,
          };
        },
        paths.stateRoot,
      );
    },
    paths.stateRoot,
  );
  return result;
}
