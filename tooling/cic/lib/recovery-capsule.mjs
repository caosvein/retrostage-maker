import { lstat, readFile } from "node:fs/promises";
import process from "node:process";
import { TextEncoder } from "node:util";

import { canonicalJson } from "./canonical-json.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./identity.mjs";
import { inspectActiveProgression, progressionLocatorIdentity } from "./progression-root.mjs";
import {
  fail,
  inspectBoundedWorktreePath,
  isIdentity,
  isPlainObject,
  requireIdentity,
  requirePlainObject,
  requirePortableId,
  semanticIdentity,
  stableUnique,
} from "./state-domain.mjs";

const RECOVERY_CAPSULE_SCHEMA = "CIC_RECOVERY_CAPSULE_V1";
const RECOVERY_EVIDENCE_POINTER_SCHEMA = "CIC_RECOVERY_EVIDENCE_POINTER_V1";
const RECOVERY_EMBEDDED_MATERIAL_SCHEMA = "CIC_RECOVERY_EMBEDDED_MATERIAL_V1";
export const RECOVERY_MAX_EMBEDDED_ITEM_BYTES = 16 * 1024;
const RECOVERY_MAX_EMBEDDED_TOTAL_BYTES = 64 * 1024;
const RECOVERY_POINTER_ONLY_CLASSES = Object.freeze(["BINARY", "BUILD", "LARGE", "MEDIA"]);
const RECOVERY_FORBIDDEN_AUTHORITY_ACTIONS = Object.freeze([
  "COMMIT",
  "MUTATE_SOURCES",
  "PUSH",
  "STAGE",
]);

const EVIDENCE_CLASSES = new Set([...RECOVERY_POINTER_ONLY_CLASSES, "OTHER", "PATCH", "TEXT"]);
const RETENTION_CLASSES = new Set([
  "ACTIVE_PROTECTED",
  "ARCHIVE_RETAINED",
  "CLOSURE_PROTECTED",
  "REBUILDABLE",
]);
const EMBEDDED_KINDS = new Set(["UNIFIED_PATCH", "UTF8_TEXT"]);
const PORTABLE_VALUE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/u;
const CHAT_HISTORY_TOKENS = new Set([
  "chat",
  "conversation",
  "history",
  "message",
  "messages",
  "prompt",
  "transcript",
  "turn",
  "turns",
]);
const textEncoder = new TextEncoder();
let evidenceVerificationBarrierForTest = null;

export function installRecoveryEvidenceVerificationBarrierForTest(barrier) {
  if (
    process.env.VITEST !== "true" ||
    typeof barrier !== "function" ||
    evidenceVerificationBarrierForTest !== null
  ) {
    fail("PROGRESSION_AUTHORITY_INVALID", "recovery evidence test barrier is unavailable");
  }
  evidenceVerificationBarrierForTest = barrier;
  return function removeRecoveryEvidenceVerificationBarrierForTest() {
    if (evidenceVerificationBarrierForTest === barrier) {
      evidenceVerificationBarrierForTest = null;
    }
  };
}

function exactKeys(value, keys, code = "PROGRESSION_ROOT_INVALID") {
  requirePlainObject(value, "recovery record");
  if (Object.keys(value).sort().join("\0") !== [...keys].sort().join("\0")) fail(code);
}

function rejectChatHistoryFields(value, ancestors = new Set()) {
  if (value === null || typeof value !== "object") return;
  if (ancestors.has(value)) fail("PROGRESSION_ROOT_INVALID");
  ancestors.add(value);
  try {
    for (const [key, child] of Object.entries(value)) {
      const normalized = key.toLowerCase().replaceAll(/[^a-z0-9]/gu, "");
      const tokens = key
        .replaceAll(/([a-z0-9])([A-Z])/gu, "$1_$2")
        .toLowerCase()
        .split(/[^a-z0-9]+/gu)
        .filter(Boolean);
      if (
        tokens.some((token) => CHAT_HISTORY_TOKENS.has(token)) ||
        normalized.includes("rawchat") ||
        normalized.includes("priorchat") ||
        normalized.includes("chathistory") ||
        normalized.includes("chatlog") ||
        normalized.includes("conversation") ||
        normalized.includes("transcript") ||
        normalized === "messages" ||
        normalized === "prompt" ||
        normalized === "turns"
      ) {
        fail("PROGRESSION_ROOT_INVALID", "raw chat/history fields are forbidden");
      }
      rejectChatHistoryFields(child, ancestors);
    }
  } finally {
    ancestors.delete(value);
  }
}

function collisionKey(value) {
  return value.normalize("NFC").toLowerCase();
}

function requireNoCollisions(values) {
  const keys = values.map(collisionKey);
  if (new Set(keys).size !== keys.length) fail("CONTEXT_IDENTITY_COLLISION");
}

function portablePath(value, label) {
  let normalized;
  try {
    normalized = normalizeRepoRelativePath(value);
  } catch {
    fail("PROGRESSION_ROOT_INVALID", `${label} must be a portable relative path`);
  }
  if (normalized.length > 1024 || normalized.normalize("NFC") !== normalized) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  return normalized;
}

function normalizeLocator(value, allowedKinds, label) {
  exactKeys(value, ["kind", "value"]);
  if (!allowedKinds.has(value.kind)) fail("PROGRESSION_ROOT_INVALID");
  let locatorValue;
  if (value.kind === "EVIDENCE_ID") {
    if (typeof value.value !== "string" || !PORTABLE_VALUE_PATTERN.test(value.value)) {
      fail("PROGRESSION_ROOT_INVALID", `${label} value must be portable`);
    }
    locatorValue = value.value;
  } else {
    locatorValue = portablePath(value.value, `${label} value`);
  }
  return { kind: value.kind, value: locatorValue };
}

function normalizeControl(value, role) {
  exactKeys(value, ["role", "identity", "locator"]);
  if (value.role !== role) fail("PROGRESSION_ROOT_INVALID");
  return {
    role,
    identity: requireIdentity(value.identity, `${role} identity`),
    locator: normalizeLocator(
      value.locator,
      new Set(["EVIDENCE_ID", "REPOSITORY_RELATIVE", "STATE_RELATIVE"]),
      `${role} locator`,
    ),
  };
}

const BINDING_KEYS = Object.freeze([
  "authorizationHeadIdentity",
  "authorizationIdentity",
  "checkpointRecordIdentity",
  "contextGenerationIdentity",
  "currentTruthIdentity",
  "effectivePolicyIdentity",
  "portableStateDomainIdentity",
  "portableWorktreeIdentity",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "sourceGenerationIdentity",
  "taskContractIdentity",
  "taskIdentity",
]);

function normalizeBindings(value) {
  exactKeys(value, BINDING_KEYS);
  return Object.fromEntries(
    BINDING_KEYS.map((key) => [key, requireIdentity(value[key], `${key} binding`)]),
  );
}

function normalizeLineage(value) {
  exactKeys(value, ["kind", "lineageIdentity", "ownerDesignationIdentity"]);
  if (value.kind !== "ACTIVE_PROGRESSION") fail("PROGRESSION_LINEAGE_NOT_ACTIVE");
  return {
    kind: value.kind,
    lineageIdentity: requireIdentity(value.lineageIdentity, "lineage identity"),
    ownerDesignationIdentity: requireIdentity(
      value.ownerDesignationIdentity,
      "owner designation identity",
    ),
  };
}

function containsMachineLocalPath(value) {
  return (
    /(?:^|[^A-Za-z0-9+.-])[A-Za-z]:[\\/]/u.test(value) ||
    value.startsWith("\\\\") ||
    /(?:^|[\s:=@(-])\/(?:home|Users|tmp|var\/tmp)\//u.test(value)
  );
}

function boundedText(value, label, maximumBytes = 4096) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value !== value.trim() ||
    value.includes("\0") ||
    value.includes("\r") ||
    containsMachineLocalPath(value)
  ) {
    fail("PROGRESSION_ROOT_INVALID", `${label} must be non-empty text`);
  }
  if (textEncoder.encode(value).byteLength > maximumBytes) fail("PROGRESSION_ROOT_INVALID");
  return value;
}

function normalizeBootstrap(value) {
  exactKeys(value, ["disposition", "evidenceIdentities", "forbiddenActions", "nextAction"]);
  if (value.disposition !== "PASS" && value.disposition !== "BLOCKED") {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const evidenceIdentities = stableUnique(
    value.evidenceIdentities,
    "bootstrap evidence identities",
  ).map((identity) => requireIdentity(identity, "bootstrap evidence identity"));
  const forbiddenActions = stableUnique(value.forbiddenActions, "forbidden actions").map((action) =>
    requirePortableId(action, "forbidden action"),
  );
  if (RECOVERY_FORBIDDEN_AUTHORITY_ACTIONS.some((action) => !forbiddenActions.includes(action))) {
    fail("PROGRESSION_ROOT_INVALID", "recovery must forbid publication and Source mutation");
  }
  return {
    disposition: value.disposition,
    evidenceIdentities,
    nextAction: boundedText(value.nextAction, "next action"),
    forbiddenActions,
  };
}

function normalizeWorkstreamChanges(value) {
  exactKeys(value, ["state", "paths"]);
  if (value.state !== "CLEAN" && value.state !== "CHANGED") fail("PROGRESSION_ROOT_INVALID");
  if (!Array.isArray(value.paths)) fail("PROGRESSION_ROOT_INVALID");
  const paths = [...value.paths].map((entry) => portablePath(entry, "changed path")).sort();
  requireNoCollisions(paths);
  if (
    new Set(paths).size !== paths.length ||
    (value.state === "CLEAN" && paths.length !== 0) ||
    (value.state === "CHANGED" && paths.length === 0)
  ) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  return { state: value.state, paths };
}

function evidencePointerBody(input, availability) {
  if (!isPlainObject(input)) fail("PROGRESSION_ROOT_INVALID");
  if (!EVIDENCE_CLASSES.has(input.classification)) fail("PROGRESSION_ROOT_INVALID");
  if (!RETENTION_CLASSES.has(input.retentionClass)) fail("PROGRESSION_ROOT_INVALID");
  if (availability === "REQUIRED" && input.retentionClass === "REBUILDABLE") {
    fail("PROGRESSION_ROOT_INVALID", "required recovery evidence must be retained");
  }
  if (input.availability !== undefined && input.availability !== availability) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  if (!Number.isSafeInteger(input.bytes) || input.bytes < 0) fail("PROGRESSION_ROOT_INVALID");
  return {
    schemaVersion: RECOVERY_EVIDENCE_POINTER_SCHEMA,
    evidenceIdentity: requireIdentity(input.evidenceIdentity, "evidence identity"),
    sha256: requireIdentity(input.sha256, "evidence SHA-256"),
    bytes: input.bytes,
    classification: input.classification,
    retentionClass: input.retentionClass,
    availability,
    locator: normalizeLocator(
      input.locator,
      new Set(["EVIDENCE_ROOT_RELATIVE"]),
      "evidence locator",
    ),
  };
}

function defineEvidencePointer(input, availability) {
  const body = evidencePointerBody(input, availability);
  if (input.schemaVersion !== undefined && input.schemaVersion !== body.schemaVersion) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const pointerIdentity = semanticIdentity("CIC-RECOVERY-EVIDENCE-POINTER-V1", body);
  if (input.pointerIdentity !== undefined && input.pointerIdentity !== pointerIdentity) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const allowed = [...Object.keys(body), "pointerIdentity"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) fail("PROGRESSION_ROOT_INVALID");
  return { ...body, pointerIdentity };
}

function verifyEvidencePointer(input, availability) {
  exactKeys(input, [
    "schemaVersion",
    "evidenceIdentity",
    "sha256",
    "bytes",
    "classification",
    "retentionClass",
    "availability",
    "locator",
    "pointerIdentity",
  ]);
  return defineEvidencePointer(input, availability);
}

function normalizeEvidencePointers(values, availability, verifying = false) {
  if (!Array.isArray(values)) fail("PROGRESSION_ROOT_INVALID");
  const pointers = values
    .map((entry) =>
      verifying
        ? verifyEvidencePointer(entry, availability)
        : defineEvidencePointer(entry, availability),
    )
    .sort((left, right) => left.evidenceIdentity.localeCompare(right.evidenceIdentity));
  requireNoCollisions(pointers.map((pointer) => pointer.evidenceIdentity));
  requireNoCollisions(pointers.map((pointer) => pointer.locator.value));
  if (new Set(pointers.map((pointer) => pointer.evidenceIdentity)).size !== pointers.length) {
    fail("CONTEXT_IDENTITY_COLLISION");
  }
  return pointers;
}

function embeddedMaterialBody(input) {
  if (!isPlainObject(input) || !EMBEDDED_KINDS.has(input.kind)) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  if (
    typeof input.text !== "string" ||
    input.text.includes("\0") ||
    input.text.includes("\r") ||
    containsMachineLocalPath(input.text)
  ) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const bytes = textEncoder.encode(input.text);
  if (bytes.byteLength > RECOVERY_MAX_EMBEDDED_ITEM_BYTES) {
    fail("PROGRESSION_ROOT_INVALID", "embedded recovery material exceeds item limit");
  }
  return {
    schemaVersion: RECOVERY_EMBEDDED_MATERIAL_SCHEMA,
    kind: input.kind,
    authority: "NON_AUTHORITY",
    bytes: bytes.byteLength,
    sha256: sha256Hex(bytes),
    text: input.text,
  };
}

function defineEmbeddedMaterial(input) {
  const body = embeddedMaterialBody(input);
  if (
    (input.schemaVersion !== undefined && input.schemaVersion !== body.schemaVersion) ||
    (input.authority !== undefined && input.authority !== body.authority) ||
    (input.bytes !== undefined && input.bytes !== body.bytes) ||
    (input.sha256 !== undefined && input.sha256 !== body.sha256)
  ) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const materialIdentity = semanticIdentity("CIC-RECOVERY-EMBEDDED-MATERIAL-V1", body);
  if (input.materialIdentity !== undefined && input.materialIdentity !== materialIdentity) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const allowed = [...Object.keys(body), "materialIdentity"];
  if (Object.keys(input).some((key) => !allowed.includes(key))) fail("PROGRESSION_ROOT_INVALID");
  return { ...body, materialIdentity };
}

function verifyEmbeddedMaterial(input) {
  exactKeys(input, [
    "schemaVersion",
    "kind",
    "authority",
    "bytes",
    "sha256",
    "text",
    "materialIdentity",
  ]);
  return defineEmbeddedMaterial(input);
}

function normalizeEmbeddedMaterials(values, verifying = false) {
  if (!Array.isArray(values)) fail("PROGRESSION_ROOT_INVALID");
  const materials = values
    .map((entry) => (verifying ? verifyEmbeddedMaterial(entry) : defineEmbeddedMaterial(entry)))
    .sort((left, right) => left.materialIdentity.localeCompare(right.materialIdentity));
  const identities = materials.map((entry) => entry.materialIdentity);
  if (new Set(identities).size !== identities.length) fail("CONTEXT_IDENTITY_COLLISION");
  if (
    materials.reduce((total, material) => total + material.bytes, 0) >
    RECOVERY_MAX_EMBEDDED_TOTAL_BYTES
  ) {
    fail("PROGRESSION_ROOT_INVALID", "embedded recovery material exceeds aggregate limit");
  }
  return materials;
}

function activeRootSnapshot(active) {
  if (
    !isPlainObject(active) ||
    active.status !== "ACTIVE" ||
    active.usable !== true ||
    !isPlainObject(active.root) ||
    !isPlainObject(active.locator)
  ) {
    fail("PROGRESSION_RECOVERY_STALE");
  }
  const root = active.root;
  const locatorIdentity = active.locatorIdentity ?? progressionLocatorIdentity(active.locator);
  return {
    rootIdentity: requireIdentity(root.rootIdentity, "active root identity"),
    locatorIdentity: requireIdentity(locatorIdentity, "active locator identity"),
    generation: root.generation,
    parentRootIdentity: root.parentRootIdentity,
    lineage: normalizeLineage(root.lineage),
  };
}

function normalizeActiveRoot(value) {
  exactKeys(value, [
    "rootIdentity",
    "locatorIdentity",
    "generation",
    "parentRootIdentity",
    "lineage",
  ]);
  if (!Number.isSafeInteger(value.generation) || value.generation < 1) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  if (value.parentRootIdentity !== null) {
    requireIdentity(value.parentRootIdentity, "parent root identity");
  }
  return {
    rootIdentity: requireIdentity(value.rootIdentity, "active root identity"),
    locatorIdentity: requireIdentity(value.locatorIdentity, "active locator identity"),
    generation: value.generation,
    parentRootIdentity: value.parentRootIdentity,
    lineage: normalizeLineage(value.lineage),
  };
}

function capsuleBodyFromActive(active, input) {
  const root = active.root;
  const activeRoot = activeRootSnapshot(active);
  const currentControl = normalizeControl(root.currentControl, "CURRENT_CONTROL");
  const sessionWorkstream = normalizeControl(root.sessionWorkstream, "SESSION_WORKSTREAM");
  if (
    currentControl.identity === sessionWorkstream.identity ||
    canonicalJson(currentControl.locator) === canonicalJson(sessionWorkstream.locator)
  ) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const bootstrap = normalizeBootstrap(root.bootstrap);
  const acceptedEvidencePointers = normalizeEvidencePointers(
    input.acceptedEvidencePointers ?? [],
    "REQUIRED",
  );
  const staleEvidencePointers = normalizeEvidencePointers(
    input.staleEvidencePointers ?? [],
    "REFERENCE_ONLY",
  );
  const acceptedIds = new Set(acceptedEvidencePointers.map((entry) => entry.evidenceIdentity));
  if (bootstrap.evidenceIdentities.some((identity) => !acceptedIds.has(identity))) {
    fail("REQUIRED_OBJECT_UNAVAILABLE");
  }
  const allIds = [
    ...acceptedEvidencePointers.map((entry) => entry.evidenceIdentity),
    ...staleEvidencePointers.map((entry) => entry.evidenceIdentity),
  ];
  requireNoCollisions(allIds);
  if (new Set(allIds).size !== allIds.length) fail("CONTEXT_IDENTITY_COLLISION");
  return {
    schemaVersion: RECOVERY_CAPSULE_SCHEMA,
    activeRoot,
    bindings: normalizeBindings(root.bindings),
    currentControl,
    sessionWorkstream,
    bootstrap,
    workstreamChanges: normalizeWorkstreamChanges(
      input.workstreamChanges ?? { state: "CLEAN", paths: [] },
    ),
    acceptedEvidencePointers,
    staleEvidencePointers,
    embeddedMaterials: normalizeEmbeddedMaterials(input.embeddedMaterials ?? []),
    authorityGrants: [],
  };
}

function verifyCapsuleIntrinsic(capsule) {
  rejectChatHistoryFields(capsule);
  exactKeys(capsule, [
    "schemaVersion",
    "activeRoot",
    "bindings",
    "currentControl",
    "sessionWorkstream",
    "bootstrap",
    "workstreamChanges",
    "acceptedEvidencePointers",
    "staleEvidencePointers",
    "embeddedMaterials",
    "authorityGrants",
    "capsuleIdentity",
  ]);
  if (capsule.schemaVersion !== RECOVERY_CAPSULE_SCHEMA) fail("PROGRESSION_ROOT_INVALID");
  if (!Array.isArray(capsule.authorityGrants) || capsule.authorityGrants.length !== 0) {
    fail("PROGRESSION_AUTHORITY_INVALID");
  }
  const body = {
    schemaVersion: RECOVERY_CAPSULE_SCHEMA,
    activeRoot: normalizeActiveRoot(capsule.activeRoot),
    bindings: normalizeBindings(capsule.bindings),
    currentControl: normalizeControl(capsule.currentControl, "CURRENT_CONTROL"),
    sessionWorkstream: normalizeControl(capsule.sessionWorkstream, "SESSION_WORKSTREAM"),
    bootstrap: normalizeBootstrap(capsule.bootstrap),
    workstreamChanges: normalizeWorkstreamChanges(capsule.workstreamChanges),
    acceptedEvidencePointers: normalizeEvidencePointers(
      capsule.acceptedEvidencePointers,
      "REQUIRED",
      true,
    ),
    staleEvidencePointers: normalizeEvidencePointers(
      capsule.staleEvidencePointers,
      "REFERENCE_ONLY",
      true,
    ),
    embeddedMaterials: normalizeEmbeddedMaterials(capsule.embeddedMaterials, true),
    authorityGrants: [],
  };
  if (
    body.currentControl.identity === body.sessionWorkstream.identity ||
    canonicalJson(body.currentControl.locator) === canonicalJson(body.sessionWorkstream.locator)
  ) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  const acceptedIds = body.acceptedEvidencePointers.map((entry) => entry.evidenceIdentity);
  const staleIds = body.staleEvidencePointers.map((entry) => entry.evidenceIdentity);
  requireNoCollisions([...acceptedIds, ...staleIds]);
  if (new Set([...acceptedIds, ...staleIds]).size !== acceptedIds.length + staleIds.length) {
    fail("CONTEXT_IDENTITY_COLLISION");
  }
  if (body.bootstrap.evidenceIdentities.some((identity) => !acceptedIds.includes(identity))) {
    fail("REQUIRED_OBJECT_UNAVAILABLE");
  }
  const capsuleIdentity = semanticIdentity("CIC-RECOVERY-CAPSULE-V1", body);
  if (!isIdentity(capsule.capsuleIdentity) || capsule.capsuleIdentity !== capsuleIdentity) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  if (canonicalJson(capsule) !== canonicalJson({ ...body, capsuleIdentity })) {
    fail("PROGRESSION_ROOT_INVALID");
  }
  return { ...body, capsuleIdentity };
}

async function verifyRequiredPointer(pointer, evidenceRoot) {
  if (typeof evidenceRoot !== "string" || evidenceRoot.length === 0) {
    fail("REQUIRED_OBJECT_UNAVAILABLE");
  }
  let bounded;
  try {
    bounded = await inspectBoundedWorktreePath(evidenceRoot, pointer.locator.value, {
      allowMissingLeaf: false,
      code: "REQUIRED_OBJECT_UNAVAILABLE",
    });
    const stats = await lstat(bounded.target);
    if (!stats.isFile() || stats.isSymbolicLink()) fail("REQUIRED_OBJECT_UNAVAILABLE");
    const bytes = new Uint8Array(await readFile(bounded.target));
    if (bytes.byteLength !== pointer.bytes || sha256Hex(bytes) !== pointer.sha256) {
      fail("REQUIRED_OBJECT_UNAVAILABLE");
    }
    const barrier = evidenceVerificationBarrierForTest;
    if (barrier !== null) {
      evidenceVerificationBarrierForTest = null;
      await barrier(Object.freeze({ evidenceIdentity: pointer.evidenceIdentity }));
    }
  } catch (error) {
    if (error?.code === "REQUIRED_OBJECT_UNAVAILABLE") throw error;
    fail("REQUIRED_OBJECT_UNAVAILABLE");
  }
  return pointer.evidenceIdentity;
}

function progressionInput(input) {
  requirePlainObject(input, "recovery operation input");
  return {
    domainInput: input.domainInput,
    authorizationIdentity: input.authorizationIdentity,
    currentTruthRequest: input.currentTruthRequest,
  };
}

async function inspectCurrentProgression(input) {
  try {
    return await inspectActiveProgression(progressionInput(input));
  } catch (error) {
    if (
      typeof error?.code === "string" &&
      (error.code.startsWith("AUTHORIZATION_") || error.code.startsWith("MUTATION_LEASE_"))
    ) {
      fail("PROGRESSION_AUTHORITY_INVALID");
    }
    if (
      typeof error?.code === "string" &&
      (error.code.includes("CURRENTNESS") ||
        error.code.includes("STALE") ||
        error.code.startsWith("SOURCE_GENERATION_") ||
        error.code.startsWith("REPOSITORY_") ||
        error.code === "CONTEXT_GENERATION_RACE")
    ) {
      fail("PROGRESSION_RECOVERY_STALE");
    }
    throw error;
  }
}

function assertCoherentProgressionObservations(start, end) {
  activeRootSnapshot(start);
  activeRootSnapshot(end);
  if (canonicalJson(start) !== canonicalJson(end)) {
    fail("PROGRESSION_RECOVERY_STALE");
  }
}

export async function createRecoveryCapsule(input) {
  requirePlainObject(input, "recovery capsule input");
  rejectChatHistoryFields(input);
  const before = await inspectCurrentProgression(input);
  const snapshot = activeRootSnapshot(before);
  if (
    input.expectedActiveRootIdentity !== undefined &&
    input.expectedActiveRootIdentity !== snapshot.rootIdentity
  ) {
    fail("PROGRESSION_ACTIVE_ROOT_MISMATCH");
  }
  const body = capsuleBodyFromActive(before, input);
  const capsule = {
    ...body,
    capsuleIdentity: semanticIdentity("CIC-RECOVERY-CAPSULE-V1", body),
  };
  await verifyRecoveryCapsule(capsule, { evidenceRoot: input.evidenceRoot });
  const after = await inspectCurrentProgression(input);
  assertCoherentProgressionObservations(before, after);
  return capsule;
}

export async function verifyRecoveryCapsule(capsule, { evidenceRoot } = {}) {
  const verified = verifyCapsuleIntrinsic(capsule);
  const checkedEvidenceIdentities = [];
  for (const pointer of verified.acceptedEvidencePointers) {
    checkedEvidenceIdentities.push(await verifyRequiredPointer(pointer, evidenceRoot));
  }
  return {
    capsule: verified,
    availability: {
      status: "PASS",
      checkedEvidenceIdentities,
      staleReferenceOnlyIdentities: verified.staleEvidencePointers.map(
        (entry) => entry.evidenceIdentity,
      ),
    },
  };
}

export async function recoverCurrent(input) {
  requirePlainObject(input, "recover-current input");
  rejectChatHistoryFields(input);
  const before = await inspectCurrentProgression(input);
  const verification = await verifyRecoveryCapsule(input.capsule, {
    evidenceRoot: input.evidenceRoot,
  });
  const after = await inspectCurrentProgression(input);
  assertCoherentProgressionObservations(before, after);
  const capsule = verification.capsule;
  const currentSnapshot = activeRootSnapshot(after);
  if (
    canonicalJson(capsule.activeRoot) !== canonicalJson(currentSnapshot) ||
    canonicalJson(capsule.bindings) !== canonicalJson(normalizeBindings(after.root.bindings)) ||
    canonicalJson(capsule.currentControl) !==
      canonicalJson(normalizeControl(after.root.currentControl, "CURRENT_CONTROL")) ||
    canonicalJson(capsule.sessionWorkstream) !==
      canonicalJson(normalizeControl(after.root.sessionWorkstream, "SESSION_WORKSTREAM")) ||
    canonicalJson(capsule.bootstrap) !== canonicalJson(normalizeBootstrap(after.root.bootstrap))
  ) {
    fail("PROGRESSION_RECOVERY_STALE");
  }
  return {
    schemaVersion: "CIC_RECOVERY_RESULT_V1",
    status: capsule.bootstrap.disposition,
    current: true,
    capsuleIdentity: capsule.capsuleIdentity,
    activeRootIdentity: capsule.activeRoot.rootIdentity,
    currentControl: capsule.currentControl,
    sessionWorkstream: capsule.sessionWorkstream,
    bootstrapDisposition: capsule.bootstrap.disposition,
    workstreamChanges: capsule.workstreamChanges,
    acceptedEvidencePointers: capsule.acceptedEvidencePointers,
    staleEvidencePointers: capsule.staleEvidencePointers,
    nextAction: capsule.bootstrap.nextAction,
    forbiddenActions: capsule.bootstrap.forbiddenActions,
    authorityGrants: [],
  };
}
