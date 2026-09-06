import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import { verifyAdaptiveValidationPlan } from "./adaptive-validation-plan.mjs";

export const ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA = "CIC_ADAPTIVE_VALIDATION_ATTEMPT_V1";
export const ADAPTIVE_VALIDATION_REPLAY_SCHEMA = "CIC_ADAPTIVE_VALIDATION_REPLAY_V1";
export const ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_SCHEMA =
  "CIC_ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_V1";
export const ADAPTIVE_VALIDATION_REUSE_EVIDENCE_SCHEMA =
  "CIC_ADAPTIVE_VALIDATION_REUSE_EVIDENCE_V1";
export const ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA =
  "CIC_ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_V1";
export const ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA = "CIC_ADAPTIVE_VALIDATION_EVIDENCE_V1";
export const ADAPTIVE_VALIDATION_CURRENT_FACTS_SCHEMA = "CIC_ADAPTIVE_VALIDATION_CURRENT_FACTS_V1";
export const ADAPTIVE_VALIDATION_STALENESS_SCHEMA = "CIC_ADAPTIVE_VALIDATION_STALENESS_V1";
export const ADAPTIVE_VALIDATION_RESULTS = Object.freeze(["PASS", "FAIL", "BLOCKED"]);
export const ADAPTIVE_VALIDATION_STALENESS_DISPOSITIONS = Object.freeze([
  "CURRENT",
  "TEST_RESULT_STALE",
  "INVALID_EVIDENCE",
]);

const PLAN_CONTENT_SCHEMA = "CIC_ADAPTIVE_VALIDATION_PLAN_CONTENT_V1";
const MATERIAL_SCHEMA = "CIC_ADAPTIVE_VALIDATION_MATERIAL_V1";
const SEED_SCHEMA = "CIC_ADAPTIVE_VALIDATION_SEED_V1";
const IDENTITY = /^[0-9A-F]{64}$/u;
const CONTENT_IDENTITY = /^(?:[0-9a-f]{40}|[0-9A-F]{64})$/u;
const PORTABLE_ID = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,255}$/u;
const REASON_CODE = /^[A-Z][A-Z0-9_]{0,127}$/u;
const RESULTS = new Set(ADAPTIVE_VALIDATION_RESULTS);
const EXECUTION_KINDS = new Set(["EXAMPLE", "GENERATED_PROPERTY"]);
const CAPABILITY_STATES = new Set(["AVAILABLE", "UNAVAILABLE", "UNKNOWN"]);
const TARGET_KINDS = new Set(["SCENARIO", "MANDATORY_GATE"]);

class AdaptiveValidationEvidenceError extends TypeError {
  constructor(code) {
    super(code);
    this.name = "AdaptiveValidationEvidenceError";
    this.code = code;
  }
}

function fail(code) {
  throw new AdaptiveValidationEvidenceError(code);
}

function compare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function plain(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, keys, code) {
  if (!plain(value)) fail(code);
  const actual = Object.keys(value).sort(compare);
  const expected = [...keys].sort(compare);
  if (canonicalJson(actual) !== canonicalJson(expected)) fail(code);
}

function identity(value, code = "ADAPTIVE_VALIDATION_EVIDENCE_INVALID") {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function nullableIdentity(value, code = "ADAPTIVE_VALIDATION_EVIDENCE_INVALID") {
  return value === null ? null : identity(value, code);
}

function contentIdentity(value, code = "ADAPTIVE_VALIDATION_EVIDENCE_INVALID") {
  if (typeof value !== "string" || !CONTENT_IDENTITY.test(value)) fail(code);
  return value;
}

function portableId(value, code = "ADAPTIVE_VALIDATION_EVIDENCE_INVALID") {
  if (typeof value !== "string" || !PORTABLE_ID.test(value)) fail(code);
  return value;
}

function seed(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > 256 ||
    /[\u0000-\u001F\u007F]/u.test(value)
  ) {
    fail("ADAPTIVE_VALIDATION_REPLAY_INVALID");
  }
  return value;
}

function boolean(value, code = "ADAPTIVE_VALIDATION_EVIDENCE_INVALID") {
  if (typeof value !== "boolean") fail(code);
  return value;
}

function positiveInteger(value, code = "ADAPTIVE_VALIDATION_EVIDENCE_INVALID") {
  if (!Number.isSafeInteger(value) || value < 1) fail(code);
  return value;
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function recordIdentity(schema, body) {
  return sha256Hex(schema + "\n" + canonicalJson(body) + "\n");
}

function canonicalEqual(left, right) {
  return canonicalJson(left) === canonicalJson(right);
}

function reasonCodes(value, allowEmpty = true) {
  if (!Array.isArray(value)) fail("ADAPTIVE_VALIDATION_REASON_CODES_INVALID");
  const normalized = value.map((entry) => {
    if (typeof entry !== "string" || !REASON_CODE.test(entry)) {
      fail("ADAPTIVE_VALIDATION_REASON_CODES_INVALID");
    }
    return entry;
  });
  if (new Set(normalized).size !== normalized.length || (!allowEmpty && normalized.length === 0)) {
    fail("ADAPTIVE_VALIDATION_REASON_CODES_INVALID");
  }
  return normalized.sort(compare);
}

function identityArray(value, code) {
  if (!Array.isArray(value)) fail(code);
  const normalized = value.map((entry) => identity(entry, code)).sort(compare);
  if (new Set(normalized).size !== normalized.length) fail(code);
  return normalized;
}

function verifiedPlan(value) {
  try {
    return verifyAdaptiveValidationPlan(value);
  } catch {
    fail("ADAPTIVE_VALIDATION_PLAN_INVALID");
  }
}

export function adaptiveValidationPlanContentIdentity(plan) {
  return recordIdentity(PLAN_CONTENT_SCHEMA, verifiedPlan(plan));
}

const PLAN_BINDING_KEYS = Object.freeze([
  "authorizationIdentity",
  "capabilityIdentity",
  "catalogGenerationIdentity",
  "catalogIdentity",
  "contextClosureIdentity",
  "contextGenerationIdentity",
  "currentTruthIdentity",
  "environmentIdentity",
  "physicalImpactIdentity",
  "planContentIdentity",
  "planIdentity",
  "repositoryHeadCommit",
  "repositoryHeadTree",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "workingSetIdentity",
  "riskClass",
  "riskIdentity",
  "semanticImpactIdentity",
  "semanticClosureWitnessIdentity",
  "sourceAnchorIdentities",
  "sourceGenerationFingerprint",
  "sourceManifestIdentity",
  "taskContractIdentity",
  "taskIdentity",
  "taskMaterialFingerprint",
]);

function bindingsFromPlan(plan) {
  return {
    authorizationIdentity: identity(
      plan.authorizationIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    capabilityIdentity: identity(
      plan.capabilityIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    catalogGenerationIdentity: identity(
      plan.catalogGenerationIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    catalogIdentity: identity(plan.catalogIdentity, "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID"),
    contextClosureIdentity: identity(
      plan.contextClosureIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    contextGenerationIdentity: identity(
      plan.contextGenerationIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    currentTruthIdentity: identity(
      plan.currentTruthIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    environmentIdentity: identity(
      plan.environmentIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    physicalImpactIdentity: identity(
      plan.physicalImpactIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    planContentIdentity: recordIdentity(PLAN_CONTENT_SCHEMA, plan),
    planIdentity: identity(plan.planIdentity, "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID"),
    repositoryHeadCommit: contentIdentity(
      plan.repositoryHeadCommit,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    repositoryHeadTree: contentIdentity(
      plan.repositoryHeadTree,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    repositoryIdentity: identity(
      plan.repositoryIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    repositorySnapshotIdentity: identity(
      plan.repositorySnapshotIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    workingSetIdentity: identity(
      plan.workingSetIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    riskClass: portableId(plan.riskClass, "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID"),
    riskIdentity: identity(plan.riskIdentity, "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID"),
    semanticImpactIdentity: identity(
      plan.semanticImpactIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    semanticClosureWitnessIdentity: identity(
      plan.semanticClosureWitnessIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    sourceAnchorIdentities: identityArray(
      plan.sourceAnchorIdentities,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    sourceGenerationFingerprint: identity(
      plan.sourceGenerationFingerprint,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    sourceManifestIdentity: identity(
      plan.sourceManifestIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    taskContractIdentity: identity(
      plan.taskContractIdentity,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
    taskIdentity: identity(plan.taskIdentity, "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID"),
    taskMaterialFingerprint: identity(
      plan.taskMaterialFingerprint,
      "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID",
    ),
  };
}

function normalizeBindings(value) {
  exactKeys(value, PLAN_BINDING_KEYS, "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID");
  const normalized = {};
  for (const key of PLAN_BINDING_KEYS) {
    if (key === "riskClass") {
      normalized[key] = portableId(value[key], "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID");
    } else if (key === "repositoryHeadCommit" || key === "repositoryHeadTree") {
      normalized[key] = contentIdentity(value[key], "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID");
    } else if (key === "sourceAnchorIdentities") {
      normalized[key] = identityArray(value[key], "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID");
    } else {
      normalized[key] = identity(value[key], "ADAPTIVE_VALIDATION_PLAN_BINDING_INVALID");
    }
  }
  return normalized;
}

function normalizeSnapshot(value) {
  exactKeys(
    value,
    ["indexIdentity", "repositorySnapshotIdentity", "worktreeIdentity"],
    "ADAPTIVE_VALIDATION_SNAPSHOT_INVALID",
  );
  return {
    indexIdentity: identity(value.indexIdentity, "ADAPTIVE_VALIDATION_SNAPSHOT_INVALID"),
    repositorySnapshotIdentity: identity(
      value.repositorySnapshotIdentity,
      "ADAPTIVE_VALIDATION_SNAPSHOT_INVALID",
    ),
    worktreeIdentity: identity(value.worktreeIdentity, "ADAPTIVE_VALIDATION_SNAPSHOT_INVALID"),
  };
}

function normalizeSnapshots(value) {
  exactKeys(value, ["end", "start"], "ADAPTIVE_VALIDATION_SNAPSHOT_INVALID");
  return {
    end: normalizeSnapshot(value.end),
    start: normalizeSnapshot(value.start),
  };
}

function materialBody(value) {
  exactKeys(
    value,
    ["codeIdentity", "configIdentity", "fixtureIdentity", "oracleIdentity"],
    "ADAPTIVE_VALIDATION_MATERIAL_INVALID",
  );
  return {
    codeIdentity: identity(value.codeIdentity, "ADAPTIVE_VALIDATION_MATERIAL_INVALID"),
    configIdentity: identity(value.configIdentity, "ADAPTIVE_VALIDATION_MATERIAL_INVALID"),
    fixtureIdentity: identity(value.fixtureIdentity, "ADAPTIVE_VALIDATION_MATERIAL_INVALID"),
    oracleIdentity: identity(value.oracleIdentity, "ADAPTIVE_VALIDATION_MATERIAL_INVALID"),
  };
}

function buildMaterials(value) {
  const body = materialBody(value);
  return { ...body, materialIdentity: recordIdentity(MATERIAL_SCHEMA, body) };
}

function normalizeMaterials(value) {
  exactKeys(
    value,
    ["codeIdentity", "configIdentity", "fixtureIdentity", "materialIdentity", "oracleIdentity"],
    "ADAPTIVE_VALIDATION_MATERIAL_INVALID",
  );
  const body = materialBody({
    codeIdentity: value.codeIdentity,
    configIdentity: value.configIdentity,
    fixtureIdentity: value.fixtureIdentity,
    oracleIdentity: value.oracleIdentity,
  });
  const computed = recordIdentity(MATERIAL_SCHEMA, body);
  if (identity(value.materialIdentity, "ADAPTIVE_VALIDATION_MATERIAL_INVALID") !== computed) {
    fail("ADAPTIVE_VALIDATION_MATERIAL_IDENTITY_MISMATCH");
  }
  return { ...body, materialIdentity: computed };
}

function normalizeExecution(value) {
  exactKeys(
    value,
    ["actionIdentity", "commandIdentity", "kind"],
    "ADAPTIVE_VALIDATION_EXECUTION_INVALID",
  );
  if (!EXECUTION_KINDS.has(value.kind)) fail("ADAPTIVE_VALIDATION_EXECUTION_INVALID");
  return {
    actionIdentity: identity(value.actionIdentity, "ADAPTIVE_VALIDATION_EXECUTION_INVALID"),
    commandIdentity: identity(value.commandIdentity, "ADAPTIVE_VALIDATION_EXECUTION_INVALID"),
    kind: value.kind,
  };
}

function normalizeCapability(value) {
  exactKeys(value, ["identity", "status"], "ADAPTIVE_VALIDATION_CAPABILITY_INVALID");
  if (!CAPABILITY_STATES.has(value.status)) fail("ADAPTIVE_VALIDATION_CAPABILITY_INVALID");
  return {
    identity: identity(value.identity, "ADAPTIVE_VALIDATION_CAPABILITY_INVALID"),
    status: value.status,
  };
}

function normalizeTarget(value) {
  exactKeys(value, ["id", "kind", "required"], "ADAPTIVE_VALIDATION_TARGET_INVALID");
  if (!TARGET_KINDS.has(value.kind)) fail("ADAPTIVE_VALIDATION_TARGET_INVALID");
  return {
    id:
      value.kind === "SCENARIO"
        ? identity(value.id, "ADAPTIVE_VALIDATION_TARGET_INVALID")
        : portableId(value.id, "ADAPTIVE_VALIDATION_TARGET_INVALID"),
    kind: value.kind,
    required: boolean(value.required, "ADAPTIVE_VALIDATION_TARGET_INVALID"),
  };
}

function targetFromPlan(plan, value) {
  exactKeys(value, ["id", "kind"], "ADAPTIVE_VALIDATION_TARGET_INVALID");
  if (!TARGET_KINDS.has(value.kind)) fail("ADAPTIVE_VALIDATION_TARGET_INVALID");
  if (value.kind === "SCENARIO") {
    const id = identity(value.id, "ADAPTIVE_VALIDATION_TARGET_INVALID");
    if (!plan.scheduledScenarioIdentities.includes(id)) {
      fail("ADAPTIVE_VALIDATION_TARGET_NOT_SCHEDULED");
    }
    return {
      id,
      kind: "SCENARIO",
      required: plan.requiredScenarioIdentities.includes(id),
    };
  }
  const id = portableId(value.id, "ADAPTIVE_VALIDATION_TARGET_INVALID");
  if (!plan.scheduledGateIds.includes(id)) fail("ADAPTIVE_VALIDATION_TARGET_NOT_SCHEDULED");
  return { id, kind: "MANDATORY_GATE", required: true };
}

function replayBody(value, result, fixtureIdentity) {
  exactKeys(
    value,
    [
      "counterexampleIdentity",
      "counterexampleLocator",
      "fixtureIdentity",
      "fixtureLocator",
      "generatorIdentity",
      "generatorLocator",
      "replayActionIdentity",
      "replayActionLocator",
      "seed",
      "seedIdentity",
    ],
    "ADAPTIVE_VALIDATION_REPLAY_INVALID",
  );
  const body = {
    counterexampleIdentity: nullableIdentity(
      value.counterexampleIdentity,
      "ADAPTIVE_VALIDATION_REPLAY_INVALID",
    ),
    counterexampleLocator:
      value.counterexampleLocator === null
        ? null
        : portableId(value.counterexampleLocator, "ADAPTIVE_VALIDATION_REPLAY_INVALID"),
    fixtureIdentity: identity(value.fixtureIdentity, "ADAPTIVE_VALIDATION_REPLAY_INVALID"),
    fixtureLocator: portableId(value.fixtureLocator, "ADAPTIVE_VALIDATION_REPLAY_INVALID"),
    generatorIdentity: identity(value.generatorIdentity, "ADAPTIVE_VALIDATION_REPLAY_INVALID"),
    generatorLocator: portableId(value.generatorLocator, "ADAPTIVE_VALIDATION_REPLAY_INVALID"),
    replayActionIdentity: identity(
      value.replayActionIdentity,
      "ADAPTIVE_VALIDATION_REPLAY_INVALID",
    ),
    replayActionLocator: portableId(
      value.replayActionLocator,
      "ADAPTIVE_VALIDATION_REPLAY_INVALID",
    ),
    seed: seed(value.seed),
    seedIdentity: identity(value.seedIdentity, "ADAPTIVE_VALIDATION_REPLAY_INVALID"),
  };
  const expectedSeedIdentity = recordIdentity(SEED_SCHEMA, { seed: body.seed });
  if (body.seedIdentity !== expectedSeedIdentity) {
    fail("ADAPTIVE_VALIDATION_REPLAY_SEED_IDENTITY_MISMATCH");
  }
  if (body.fixtureIdentity !== fixtureIdentity) fail("ADAPTIVE_VALIDATION_REPLAY_FIXTURE_MISMATCH");
  if (
    result === "PASS" &&
    (body.counterexampleIdentity !== null || body.counterexampleLocator !== null)
  ) {
    fail("ADAPTIVE_VALIDATION_REPLAY_INVALID");
  }
  if (
    result !== "PASS" &&
    (body.counterexampleIdentity === null || body.counterexampleLocator === null)
  ) {
    fail("ADAPTIVE_VALIDATION_REPLAY_REQUIRED");
  }
  return body;
}

function buildReplay(value, executionKind, result, fixtureIdentity) {
  if (executionKind === "EXAMPLE") {
    if (value !== null) fail("ADAPTIVE_VALIDATION_REPLAY_INVALID");
    return null;
  }
  if (value === null) fail("ADAPTIVE_VALIDATION_REPLAY_REQUIRED");
  exactKeys(
    value,
    [
      "counterexampleIdentity",
      "counterexampleLocator",
      "fixtureIdentity",
      "fixtureLocator",
      "generatorIdentity",
      "generatorLocator",
      "replayActionIdentity",
      "replayActionLocator",
      "seed",
    ],
    "ADAPTIVE_VALIDATION_REPLAY_INVALID",
  );
  const body = replayBody(
    {
      ...value,
      seedIdentity: recordIdentity(SEED_SCHEMA, { seed: seed(value.seed) }),
    },
    result,
    fixtureIdentity,
  );
  return {
    ...body,
    replayIdentity: recordIdentity(ADAPTIVE_VALIDATION_REPLAY_SCHEMA, body),
    schemaVersion: ADAPTIVE_VALIDATION_REPLAY_SCHEMA,
  };
}

function normalizeReplay(value, executionKind, result, fixtureIdentity) {
  if (executionKind === "EXAMPLE") {
    if (value !== null) fail("ADAPTIVE_VALIDATION_REPLAY_INVALID");
    return null;
  }
  if (value === null) fail("ADAPTIVE_VALIDATION_REPLAY_REQUIRED");
  exactKeys(
    value,
    [
      "counterexampleIdentity",
      "counterexampleLocator",
      "fixtureIdentity",
      "fixtureLocator",
      "generatorIdentity",
      "generatorLocator",
      "replayActionIdentity",
      "replayActionLocator",
      "replayIdentity",
      "schemaVersion",
      "seed",
      "seedIdentity",
    ],
    "ADAPTIVE_VALIDATION_REPLAY_INVALID",
  );
  if (value.schemaVersion !== ADAPTIVE_VALIDATION_REPLAY_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_REPLAY_SCHEMA_MISMATCH");
  }
  const body = replayBody(
    {
      counterexampleIdentity: value.counterexampleIdentity,
      counterexampleLocator: value.counterexampleLocator,
      fixtureIdentity: value.fixtureIdentity,
      fixtureLocator: value.fixtureLocator,
      generatorIdentity: value.generatorIdentity,
      generatorLocator: value.generatorLocator,
      replayActionIdentity: value.replayActionIdentity,
      replayActionLocator: value.replayActionLocator,
      seed: value.seed,
      seedIdentity: value.seedIdentity,
    },
    result,
    fixtureIdentity,
  );
  const computed = recordIdentity(ADAPTIVE_VALIDATION_REPLAY_SCHEMA, body);
  if (identity(value.replayIdentity, "ADAPTIVE_VALIDATION_REPLAY_INVALID") !== computed) {
    fail("ADAPTIVE_VALIDATION_REPLAY_IDENTITY_MISMATCH");
  }
  return {
    ...body,
    replayIdentity: computed,
    schemaVersion: ADAPTIVE_VALIDATION_REPLAY_SCHEMA,
  };
}

const ATTEMPT_BODY_KEYS = Object.freeze([
  "attemptNumber",
  "bindings",
  "capability",
  "environmentIdentity",
  "evidenceManifestIdentity",
  "execution",
  "factAuthority",
  "materials",
  "mutationAuthorization",
  "priorAttemptIdentity",
  "reasonCodes",
  "replay",
  "result",
  "resultPayloadIdentity",
  "snapshots",
  "target",
]);

function normalizeAttemptBody(value) {
  exactKeys(value, ATTEMPT_BODY_KEYS, "ADAPTIVE_VALIDATION_ATTEMPT_INVALID");
  if (
    value.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    value.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_VALIDATION_AUTHORITY_VIOLATION");
  }
  if (!RESULTS.has(value.result)) fail("ADAPTIVE_VALIDATION_RESULT_INVALID");
  const target = normalizeTarget(value.target);
  const bindings = normalizeBindings(value.bindings);
  const capability = normalizeCapability(value.capability);
  const execution = normalizeExecution(value.execution);
  const materials = normalizeMaterials(value.materials);
  const snapshots = normalizeSnapshots(value.snapshots);
  const normalizedReasons = reasonCodes(value.reasonCodes, value.result === "PASS");
  const environmentIdentity = identity(
    value.environmentIdentity,
    "ADAPTIVE_VALIDATION_ATTEMPT_INVALID",
  );
  if (capability.identity !== bindings.capabilityIdentity) {
    fail("ADAPTIVE_VALIDATION_CAPABILITY_BINDING_MISMATCH");
  }
  if (environmentIdentity !== bindings.environmentIdentity) {
    fail("ADAPTIVE_VALIDATION_ENVIRONMENT_BINDING_MISMATCH");
  }
  if (
    snapshots.start.repositorySnapshotIdentity !== bindings.repositorySnapshotIdentity ||
    snapshots.end.repositorySnapshotIdentity !== bindings.repositorySnapshotIdentity
  ) {
    fail("ADAPTIVE_VALIDATION_REPOSITORY_SNAPSHOT_BINDING_MISMATCH");
  }
  if (capability.status !== "AVAILABLE") {
    if (
      value.result !== "BLOCKED" ||
      !normalizedReasons.includes("REQUIRED_CAPABILITY_UNAVAILABLE")
    ) {
      fail("ADAPTIVE_VALIDATION_CAPABILITY_FAIL_OPEN");
    }
  } else if (normalizedReasons.includes("REQUIRED_CAPABILITY_UNAVAILABLE")) {
    fail("ADAPTIVE_VALIDATION_CAPABILITY_INVALID");
  }
  if (value.result === "PASS") {
    if (normalizedReasons.length !== 0) fail("ADAPTIVE_VALIDATION_RESULT_INVALID");
    if (!canonicalEqual(snapshots.start, snapshots.end)) {
      fail("ADAPTIVE_VALIDATION_PASS_SNAPSHOT_DRIFT");
    }
  }
  const replay = normalizeReplay(
    value.replay,
    execution.kind,
    value.result,
    materials.fixtureIdentity,
  );
  return {
    attemptNumber: positiveInteger(value.attemptNumber, "ADAPTIVE_VALIDATION_ATTEMPT_INVALID"),
    bindings,
    capability,
    environmentIdentity,
    evidenceManifestIdentity: identity(
      value.evidenceManifestIdentity,
      "ADAPTIVE_VALIDATION_ATTEMPT_INVALID",
    ),
    execution,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    materials,
    mutationAuthorization: false,
    priorAttemptIdentity: nullableIdentity(
      value.priorAttemptIdentity,
      "ADAPTIVE_VALIDATION_ATTEMPT_INVALID",
    ),
    reasonCodes: normalizedReasons,
    replay,
    result: value.result,
    resultPayloadIdentity: identity(
      value.resultPayloadIdentity,
      "ADAPTIVE_VALIDATION_ATTEMPT_INVALID",
    ),
    snapshots,
    target,
  };
}

function attemptRecord(body) {
  return deepFreeze({
    ...body,
    attemptIdentity: recordIdentity(ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA, body),
    schemaVersion: ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA,
  });
}

export function verifyAdaptiveValidationAttempt(record) {
  exactKeys(
    record,
    [...ATTEMPT_BODY_KEYS, "attemptIdentity", "schemaVersion"],
    "ADAPTIVE_VALIDATION_ATTEMPT_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA_MISMATCH");
  }
  const rawBody = { ...record };
  delete rawBody.attemptIdentity;
  delete rawBody.schemaVersion;
  const body = normalizeAttemptBody(rawBody);
  if (!canonicalEqual(rawBody, body)) fail("ADAPTIVE_VALIDATION_ATTEMPT_NOT_CANONICAL");
  const computed = recordIdentity(ADAPTIVE_VALIDATION_ATTEMPT_SCHEMA, body);
  if (identity(record.attemptIdentity, "ADAPTIVE_VALIDATION_ATTEMPT_INVALID") !== computed) {
    fail("ADAPTIVE_VALIDATION_ATTEMPT_IDENTITY_MISMATCH");
  }
  return attemptRecord(body);
}

function ledgerBody(taskIdentity, attempts) {
  return {
    attempts,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    taskIdentity,
  };
}

function ledgerRecord(body) {
  return deepFreeze({
    ...body,
    ledgerIdentity: recordIdentity(ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_SCHEMA, body),
    schemaVersion: ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_SCHEMA,
  });
}

export function createAdaptiveValidationAttemptLedger(input) {
  exactKeys(input, ["taskIdentity"], "ADAPTIVE_VALIDATION_LEDGER_INVALID");
  return ledgerRecord(ledgerBody(identity(input.taskIdentity), []));
}

export function verifyAdaptiveValidationAttemptLedger(record) {
  exactKeys(
    record,
    [
      "attempts",
      "factAuthority",
      "ledgerIdentity",
      "mutationAuthorization",
      "schemaVersion",
      "taskIdentity",
    ],
    "ADAPTIVE_VALIDATION_LEDGER_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_LEDGER_SCHEMA_MISMATCH");
  }
  if (
    record.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    record.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_VALIDATION_AUTHORITY_VIOLATION");
  }
  if (!Array.isArray(record.attempts)) fail("ADAPTIVE_VALIDATION_LEDGER_INVALID");
  const taskIdentity = identity(record.taskIdentity, "ADAPTIVE_VALIDATION_LEDGER_INVALID");
  const attempts = record.attempts.map(verifyAdaptiveValidationAttempt);
  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    const expectedPrior = index === 0 ? null : attempts[index - 1].attemptIdentity;
    if (
      attempt.attemptNumber !== index + 1 ||
      attempt.priorAttemptIdentity !== expectedPrior ||
      attempt.bindings.taskIdentity !== taskIdentity
    ) {
      fail("ADAPTIVE_VALIDATION_ATTEMPT_CHAIN_INVALID");
    }
  }
  const body = ledgerBody(taskIdentity, attempts);
  if (
    !canonicalEqual(
      {
        attempts: record.attempts,
        factAuthority: record.factAuthority,
        mutationAuthorization: record.mutationAuthorization,
        taskIdentity: record.taskIdentity,
      },
      body,
    )
  ) {
    fail("ADAPTIVE_VALIDATION_LEDGER_NOT_CANONICAL");
  }
  const computed = recordIdentity(ADAPTIVE_VALIDATION_ATTEMPT_LEDGER_SCHEMA, body);
  if (identity(record.ledgerIdentity, "ADAPTIVE_VALIDATION_LEDGER_INVALID") !== computed) {
    fail("ADAPTIVE_VALIDATION_LEDGER_IDENTITY_MISMATCH");
  }
  return ledgerRecord(body);
}

const PRIOR_LIFECYCLE_BODY_KEYS = Object.freeze([
  "acceptanceIdentity",
  "evidenceIdentity",
  "factAuthority",
  "knownCorrectnessBlockers",
  "mutationAuthorization",
  "reviewIdentity",
  "state",
  "superseded",
]);

function normalizePriorLifecycleBody(value) {
  exactKeys(value, PRIOR_LIFECYCLE_BODY_KEYS, "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID");
  const knownCorrectnessBlockers = reasonCodes(value.knownCorrectnessBlockers);
  if (
    value.factAuthority !== "NON_AUTHORITATIVE_INPUT" ||
    value.mutationAuthorization !== false ||
    !["ACCEPTED_CURRENT", "SUPERSEDED"].includes(value.state) ||
    (value.state === "ACCEPTED_CURRENT" &&
      (value.superseded !== false || knownCorrectnessBlockers.length !== 0)) ||
    (value.state === "SUPERSEDED" && value.superseded !== true)
  ) {
    fail("ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID");
  }
  return {
    acceptanceIdentity: identity(
      value.acceptanceIdentity,
      "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID",
    ),
    evidenceIdentity: identity(
      value.evidenceIdentity,
      "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID",
    ),
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    knownCorrectnessBlockers,
    mutationAuthorization: false,
    reviewIdentity: identity(value.reviewIdentity, "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID"),
    state: value.state,
    superseded: boolean(value.superseded, "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID"),
  };
}

function priorLifecycleRecord(body) {
  return deepFreeze({
    ...body,
    lifecycleIdentity: recordIdentity(ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA, body),
    schemaVersion: ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA,
  });
}

export function defineAdaptiveValidationPriorLifecycle(input) {
  exactKeys(
    input,
    [
      "acceptanceIdentity",
      "evidenceIdentity",
      "knownCorrectnessBlockers",
      "reviewIdentity",
      "state",
      "superseded",
    ],
    "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID",
  );
  return priorLifecycleRecord(
    normalizePriorLifecycleBody({
      ...input,
      factAuthority: "NON_AUTHORITATIVE_INPUT",
      mutationAuthorization: false,
    }),
  );
}

export function verifyAdaptiveValidationPriorLifecycle(record) {
  exactKeys(
    record,
    [...PRIOR_LIFECYCLE_BODY_KEYS, "lifecycleIdentity", "schemaVersion"],
    "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA_MISMATCH");
  }
  const rawBody = {};
  for (const key of PRIOR_LIFECYCLE_BODY_KEYS) rawBody[key] = record[key];
  const body = normalizePriorLifecycleBody(rawBody);
  const computed = recordIdentity(ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_SCHEMA, body);
  if (
    identity(record.lifecycleIdentity, "ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_INVALID") !== computed
  ) {
    fail("ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_IDENTITY_MISMATCH");
  }
  return priorLifecycleRecord(body);
}

const APPEND_KEYS = Object.freeze([
  "capability",
  "environmentIdentity",
  "evidenceManifestIdentity",
  "execution",
  "materials",
  "plan",
  "reasonCodes",
  "replay",
  "result",
  "resultPayloadIdentity",
  "snapshots",
  "target",
]);

export function appendAdaptiveValidationAttempt(ledger, input) {
  const current = verifyAdaptiveValidationAttemptLedger(ledger);
  exactKeys(input, APPEND_KEYS, "ADAPTIVE_VALIDATION_ATTEMPT_INVALID");
  const plan = verifiedPlan(input.plan);
  if (plan.taskIdentity !== current.taskIdentity) fail("ADAPTIVE_VALIDATION_TASK_MISMATCH");
  const execution = normalizeExecution(input.execution);
  const materials = buildMaterials(input.materials);
  const result = RESULTS.has(input.result)
    ? input.result
    : fail("ADAPTIVE_VALIDATION_RESULT_INVALID");
  const body = normalizeAttemptBody({
    attemptNumber: current.attempts.length + 1,
    bindings: bindingsFromPlan(plan),
    capability: normalizeCapability(input.capability),
    environmentIdentity: input.environmentIdentity,
    evidenceManifestIdentity: input.evidenceManifestIdentity,
    execution,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    materials,
    mutationAuthorization: false,
    priorAttemptIdentity: current.attempts.at(-1)?.attemptIdentity ?? null,
    reasonCodes: reasonCodes(input.reasonCodes, result === "PASS"),
    replay: buildReplay(input.replay, execution.kind, result, materials.fixtureIdentity),
    result,
    resultPayloadIdentity: input.resultPayloadIdentity,
    snapshots: normalizeSnapshots(input.snapshots),
    target: targetFromPlan(plan, input.target),
  });
  const attempt = attemptRecord(body);
  const next = ledgerRecord(ledgerBody(current.taskIdentity, [...current.attempts, attempt]));
  currentPlanAttempts(plan, next);
  return next;
}

const REUSE_BODY_KEYS = Object.freeze([
  "acceptanceIdentity",
  "closureWitnessIdentity",
  "disposition",
  "factAuthority",
  "impactWitnessIdentity",
  "implementationBindingIdentity",
  "materialIdentities",
  "mutationAuthorization",
  "priorLifecycleIdentity",
  "oracleIdentity",
  "planContentIdentity",
  "planIdentity",
  "priorAttemptIdentity",
  "priorEvidenceIdentity",
  "reviewIdentity",
  "scenarioIdentity",
  "scenarioRevisionIdentity",
]);

function decisionFromPlan(plan, decision) {
  exactKeys(
    decision,
    [
      "closureWitnessIdentity",
      "disposition",
      "evidenceIdentity",
      "impactWitnessIdentity",
      "implementationBindingIdentity",
      "materialIdentities",
      "oracleIdentity",
      "scenarioIdentity",
      "scenarioRevisionIdentity",
    ],
    "ADAPTIVE_VALIDATION_REUSE_INVALID",
  );
  if (decision.disposition !== "PROVEN_UNAFFECTED") fail("ADAPTIVE_VALIDATION_REUSE_INVALID");
  const normalizedDecision = {
    closureWitnessIdentity: identity(
      decision.closureWitnessIdentity,
      "ADAPTIVE_VALIDATION_REUSE_INVALID",
    ),
    disposition: "PROVEN_UNAFFECTED",
    evidenceIdentity: identity(decision.evidenceIdentity, "ADAPTIVE_VALIDATION_REUSE_INVALID"),
    impactWitnessIdentity: identity(
      decision.impactWitnessIdentity,
      "ADAPTIVE_VALIDATION_REUSE_INVALID",
    ),
    implementationBindingIdentity: identity(
      decision.implementationBindingIdentity,
      "ADAPTIVE_VALIDATION_REUSE_INVALID",
    ),
    materialIdentities: identityArray(
      decision.materialIdentities,
      "ADAPTIVE_VALIDATION_REUSE_INVALID",
    ),
    oracleIdentity: identity(decision.oracleIdentity, "ADAPTIVE_VALIDATION_REUSE_INVALID"),
    scenarioIdentity: identity(decision.scenarioIdentity, "ADAPTIVE_VALIDATION_REUSE_INVALID"),
    scenarioRevisionIdentity: identity(
      decision.scenarioRevisionIdentity,
      "ADAPTIVE_VALIDATION_REUSE_INVALID",
    ),
  };
  if (
    !plan.requiredScenarioIdentities.includes(normalizedDecision.scenarioIdentity) ||
    !plan.scheduledScenarioIdentities.includes(normalizedDecision.scenarioIdentity) ||
    !plan.reusedScenarioEvidence.some((entry) => canonicalEqual(entry, normalizedDecision))
  ) {
    fail("ADAPTIVE_VALIDATION_REUSE_NOT_PLAN_SCOPED");
  }
  return normalizedDecision;
}

function priorExecutedPass(priorEvidence, lifecycle, decision, currentPlan) {
  if (
    priorEvidence.evidenceIdentity !== decision.evidenceIdentity ||
    lifecycle.evidenceIdentity !== priorEvidence.evidenceIdentity ||
    lifecycle.state !== "ACCEPTED_CURRENT" ||
    lifecycle.superseded ||
    lifecycle.knownCorrectnessBlockers.length !== 0 ||
    priorEvidence.priorEvidenceRecords.length !== 0 ||
    priorEvidence.reuseEvidence.length !== 0 ||
    priorEvidence.result !== "PASS"
  ) {
    fail("ADAPTIVE_VALIDATION_PRIOR_PASS_INVALID");
  }
  const coverage = priorEvidence.coverage.find(
    ({ disposition, target }) =>
      disposition === "EXECUTED_PASS" &&
      target.kind === "SCENARIO" &&
      target.id === decision.scenarioIdentity,
  );
  if (coverage === undefined) fail("ADAPTIVE_VALIDATION_PRIOR_PASS_INVALID");
  const attempt = priorEvidence.attemptLedger.attempts.find(
    ({ attemptIdentity }) => attemptIdentity === coverage.bindingIdentity,
  );
  if (
    attempt === undefined ||
    attempt.result !== "PASS" ||
    attempt.capability.status !== "AVAILABLE" ||
    attempt.capability.identity !== currentPlan.capabilityIdentity ||
    attempt.environmentIdentity !== currentPlan.environmentIdentity
  ) {
    fail("ADAPTIVE_VALIDATION_PRIOR_PASS_INVALID");
  }
  const binding = priorEvidence.plan.scenarioExecutionBindings.find(
    ({ scenarioIdentity }) => scenarioIdentity === decision.scenarioIdentity,
  );
  if (
    binding === undefined ||
    binding.scenarioRevisionIdentity !== decision.scenarioRevisionIdentity ||
    binding.oracleIdentity !== decision.oracleIdentity ||
    binding.implementationBindingIdentity !== decision.implementationBindingIdentity ||
    !canonicalEqual(binding.materialIdentities, decision.materialIdentities)
  ) {
    fail("ADAPTIVE_VALIDATION_PRIOR_BINDING_MISMATCH");
  }
  return attempt;
}

function reuseBody(plan, decision, priorEvidenceRecord) {
  const normalizedDecision = decisionFromPlan(plan, decision);
  const priorAttempt = priorExecutedPass(
    priorEvidenceRecord.evidence,
    priorEvidenceRecord.lifecycle,
    normalizedDecision,
    plan,
  );
  return {
    acceptanceIdentity: priorEvidenceRecord.lifecycle.acceptanceIdentity,
    closureWitnessIdentity: normalizedDecision.closureWitnessIdentity,
    disposition: "PROVEN_UNAFFECTED",
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    impactWitnessIdentity: normalizedDecision.impactWitnessIdentity,
    implementationBindingIdentity: normalizedDecision.implementationBindingIdentity,
    materialIdentities: normalizedDecision.materialIdentities,
    mutationAuthorization: false,
    oracleIdentity: normalizedDecision.oracleIdentity,
    planContentIdentity: recordIdentity(PLAN_CONTENT_SCHEMA, plan),
    planIdentity: plan.planIdentity,
    priorAttemptIdentity: priorAttempt.attemptIdentity,
    priorLifecycleIdentity: priorEvidenceRecord.lifecycle.lifecycleIdentity,
    priorEvidenceIdentity: normalizedDecision.evidenceIdentity,
    reviewIdentity: priorEvidenceRecord.lifecycle.reviewIdentity,
    scenarioIdentity: normalizedDecision.scenarioIdentity,
    scenarioRevisionIdentity: normalizedDecision.scenarioRevisionIdentity,
  };
}

function reuseRecord(body) {
  return deepFreeze({
    ...body,
    reuseEvidenceIdentity: recordIdentity(ADAPTIVE_VALIDATION_REUSE_EVIDENCE_SCHEMA, body),
    schemaVersion: ADAPTIVE_VALIDATION_REUSE_EVIDENCE_SCHEMA,
  });
}

export function bindProvenUnaffectedAdaptiveEvidence(input) {
  exactKeys(
    input,
    ["decision", "plan", "priorEvidenceRecord"],
    "ADAPTIVE_VALIDATION_REUSE_INVALID",
  );
  const plan = verifiedPlan(input.plan);
  const priorEvidenceRecord = normalizePriorEvidenceRecord(input.priorEvidenceRecord);
  return reuseRecord(reuseBody(plan, input.decision, priorEvidenceRecord));
}

export function verifyAdaptiveValidationReuseEvidence(record) {
  exactKeys(
    record,
    [...REUSE_BODY_KEYS, "reuseEvidenceIdentity", "schemaVersion"],
    "ADAPTIVE_VALIDATION_REUSE_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_REUSE_EVIDENCE_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_REUSE_SCHEMA_MISMATCH");
  }
  const body = {};
  for (const key of REUSE_BODY_KEYS) body[key] = record[key];
  if (
    body.disposition !== "PROVEN_UNAFFECTED" ||
    body.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    body.mutationAuthorization !== false
  ) {
    fail("ADAPTIVE_VALIDATION_REUSE_INVALID");
  }
  for (const key of [
    "acceptanceIdentity",
    "closureWitnessIdentity",
    "impactWitnessIdentity",
    "implementationBindingIdentity",
    "oracleIdentity",
    "planContentIdentity",
    "planIdentity",
    "priorAttemptIdentity",
    "priorEvidenceIdentity",
    "priorLifecycleIdentity",
    "reviewIdentity",
    "scenarioIdentity",
    "scenarioRevisionIdentity",
  ]) {
    identity(body[key], "ADAPTIVE_VALIDATION_REUSE_INVALID");
  }
  body.materialIdentities = identityArray(
    body.materialIdentities,
    "ADAPTIVE_VALIDATION_REUSE_INVALID",
  );
  const computed = recordIdentity(ADAPTIVE_VALIDATION_REUSE_EVIDENCE_SCHEMA, body);
  if (identity(record.reuseEvidenceIdentity, "ADAPTIVE_VALIDATION_REUSE_INVALID") !== computed) {
    fail("ADAPTIVE_VALIDATION_REUSE_IDENTITY_MISMATCH");
  }
  return reuseRecord(body);
}

function targetKey(target) {
  return target.kind + ":" + target.id;
}

function attemptFlakeKey(attempt) {
  return canonicalJson({
    environmentIdentity: attempt.environmentIdentity,
    materialIdentity: attempt.materials.materialIdentity,
    planContentIdentity: attempt.bindings.planContentIdentity,
    planIdentity: attempt.bindings.planIdentity,
    target: attempt.target,
  });
}

function currentPlanAttempts(plan, ledger) {
  const contentIdentity = recordIdentity(PLAN_CONTENT_SCHEMA, plan);
  const expectedBindings = bindingsFromPlan(plan);
  const result = [];
  for (const attempt of ledger.attempts) {
    const mentionsCurrentPlan =
      attempt.bindings.planIdentity === plan.planIdentity ||
      attempt.bindings.planContentIdentity === contentIdentity;
    if (!mentionsCurrentPlan) continue;
    if (!canonicalEqual(attempt.bindings, expectedBindings)) {
      fail("ADAPTIVE_VALIDATION_ATTEMPT_PLAN_BINDING_MISMATCH");
    }
    if (attempt.target.kind === "SCENARIO") {
      if (!plan.scheduledScenarioIdentities.includes(attempt.target.id)) {
        fail("ADAPTIVE_VALIDATION_TARGET_NOT_SCHEDULED");
      }
      if (attempt.target.required !== plan.requiredScenarioIdentities.includes(attempt.target.id)) {
        fail("ADAPTIVE_VALIDATION_TARGET_REQUIREDNESS_MISMATCH");
      }
      const binding = plan.scenarioExecutionBindings.find(
        ({ scenarioIdentity }) => scenarioIdentity === attempt.target.id,
      );
      const attemptMaterialIdentities = [
        attempt.materials.codeIdentity,
        attempt.materials.configIdentity,
        attempt.materials.fixtureIdentity,
        attempt.materials.oracleIdentity,
      ];
      if (
        binding === undefined ||
        !binding.validationActions.some(
          ({ actionIdentity, commandIdentity }) =>
            actionIdentity === attempt.execution.actionIdentity &&
            commandIdentity === attempt.execution.commandIdentity,
        ) ||
        binding.oracleIdentity !== attempt.materials.oracleIdentity ||
        attemptMaterialIdentities.some(
          (materialIdentity) => !binding.materialIdentities.includes(materialIdentity),
        )
      ) {
        fail("ADAPTIVE_VALIDATION_SCENARIO_EXECUTION_BINDING_MISMATCH");
      }
    } else {
      if (!plan.scheduledGateIds.includes(attempt.target.id) || !attempt.target.required) {
        fail("ADAPTIVE_VALIDATION_MANDATORY_GATE_MISMATCH");
      }
      const gate = plan.mandatoryWiderGates.find(({ gateId }) => gateId === attempt.target.id);
      if (gate === undefined || gate.commandIdentity !== attempt.execution.commandIdentity) {
        fail("ADAPTIVE_VALIDATION_MANDATORY_GATE_MISMATCH");
      }
    }
    result.push(attempt);
  }
  return result;
}

function addReason(reasons, code) {
  if (!reasons.includes(code)) reasons.push(code);
}

function coverageForTarget(target, attempts, finalSnapshot, reasons, blockedState) {
  const matching = attempts.filter((attempt) => targetKey(attempt.target) === targetKey(target));
  if (matching.length === 0) {
    addReason(reasons, "REQUIRED_VALIDATION_MISSING");
    blockedState.value = true;
    return null;
  }
  if (target.required) {
    const groups = new Map();
    for (const attempt of matching) {
      const key = attemptFlakeKey(attempt);
      if (!groups.has(key)) groups.set(key, new Set());
      groups.get(key).add(attempt.result);
    }
    if ([...groups.values()].some((results) => results.has("FAIL") && results.has("PASS"))) {
      addReason(reasons, "UNRESOLVED_REQUIRED_FLAKE");
      blockedState.value = true;
      return null;
    }
  }
  const atFinalSnapshot = matching.filter(({ snapshots }) =>
    canonicalEqual(snapshots.end, finalSnapshot),
  );
  if (atFinalSnapshot.length === 0) {
    addReason(reasons, "REQUIRED_VALIDATION_MISSING_AT_FINAL_SNAPSHOT");
    blockedState.value = true;
    return null;
  }
  if (
    atFinalSnapshot.some(
      ({ capability, result }) => capability.status !== "AVAILABLE" || result === "BLOCKED",
    )
  ) {
    addReason(reasons, "REQUIRED_CAPABILITY_UNAVAILABLE");
    blockedState.value = true;
    return null;
  }
  if (atFinalSnapshot.some(({ result }) => result === "FAIL")) {
    addReason(reasons, "REQUIRED_VALIDATION_FAILED");
    const selected = atFinalSnapshot.filter(({ result }) => result === "FAIL").at(-1);
    return {
      bindingIdentity: selected.attemptIdentity,
      disposition: "EXECUTED_FAIL",
      target,
    };
  }
  const passing = atFinalSnapshot.filter(({ result }) => result === "PASS");
  if (passing.length === 0) {
    addReason(reasons, "REQUIRED_VALIDATION_MISSING");
    blockedState.value = true;
    return null;
  }
  const selected = passing.at(-1);
  return {
    bindingIdentity: selected.attemptIdentity,
    disposition: "EXECUTED_PASS",
    target,
  };
}

function normalizePriorEvidenceRecord(value) {
  exactKeys(value, ["evidence", "lifecycle"], "ADAPTIVE_VALIDATION_PRIOR_EVIDENCE_INVALID");
  const evidence = verifyAdaptiveValidationEvidence(value.evidence);
  const lifecycle = verifyAdaptiveValidationPriorLifecycle(value.lifecycle);
  if (evidence.evidenceIdentity !== lifecycle.evidenceIdentity) {
    fail("ADAPTIVE_VALIDATION_PRIOR_LIFECYCLE_MISMATCH");
  }
  return deepFreeze({ evidence, lifecycle });
}

function normalizePriorEvidenceRecords(value, plan) {
  if (!Array.isArray(value)) fail("ADAPTIVE_VALIDATION_PRIOR_EVIDENCE_INVALID");
  const records = value.map(normalizePriorEvidenceRecord);
  records.sort((left, right) =>
    compare(left.evidence.evidenceIdentity, right.evidence.evidenceIdentity),
  );
  if (new Set(records.map(({ evidence }) => evidence.evidenceIdentity)).size !== records.length) {
    fail("ADAPTIVE_VALIDATION_PRIOR_EVIDENCE_INVALID");
  }
  const referenced = new Set(
    plan.reusedScenarioEvidence.map(({ evidenceIdentity }) => evidenceIdentity),
  );
  if (records.some(({ evidence }) => !referenced.has(evidence.evidenceIdentity))) {
    fail("ADAPTIVE_VALIDATION_PRIOR_EVIDENCE_NOT_REFERENCED");
  }
  return records;
}

function deriveEvidenceBody(plan, ledger, finalSnapshot, priorEvidenceRecords) {
  const attempts = currentPlanAttempts(plan, ledger);
  const reasons = [];
  const blockedState = { value: false };
  const reuseEvidence = [];
  const reuseFailureByScenario = new Map();
  for (const decision of plan.reusedScenarioEvidence) {
    const priorEvidenceRecord = priorEvidenceRecords.find(
      ({ evidence }) => evidence.evidenceIdentity === decision.evidenceIdentity,
    );
    if (priorEvidenceRecord === undefined) {
      reuseFailureByScenario.set(
        decision.scenarioIdentity,
        "SAFE_REUSE_PRIOR_EVIDENCE_UNAVAILABLE",
      );
      continue;
    }
    try {
      reuseEvidence.push(reuseRecord(reuseBody(plan, decision, priorEvidenceRecord)));
    } catch {
      reuseFailureByScenario.set(
        decision.scenarioIdentity,
        "SAFE_REUSE_PRIOR_PASS_OR_BINDING_INVALID",
      );
    }
  }
  reuseEvidence.sort((left, right) => compare(left.scenarioIdentity, right.scenarioIdentity));
  const advisoryReuseEvidence = reuseEvidence;
  const coverage = [];
  if (plan.disposition !== "READY") {
    blockedState.value = true;
    for (const code of plan.reasonCodes) addReason(reasons, code);
  }
  if (plan.targetedPruning !== "OFF") {
    blockedState.value = true;
    addReason(reasons, "TARGETED_PRUNING_MUST_REMAIN_OFF");
  }
  const targets = [
    ...plan.scheduledScenarioIdentities.map((id) => ({
      id,
      kind: "SCENARIO",
      required: plan.requiredScenarioIdentities.includes(id),
    })),
    ...plan.scheduledGateIds.map((id) => ({
      id,
      kind: "MANDATORY_GATE",
      required: true,
    })),
  ];
  for (const target of targets) {
    const record = coverageForTarget(target, attempts, finalSnapshot, reasons, blockedState);
    if (record !== null) {
      coverage.push(record);
    } else if (target.kind === "SCENARIO") {
      if (reuseFailureByScenario.has(target.id)) {
        addReason(reasons, reuseFailureByScenario.get(target.id));
      } else if (
        advisoryReuseEvidence.some(({ scenarioIdentity }) => scenarioIdentity === target.id)
      ) {
        addReason(reasons, "PRIOR_REUSE_NOT_AUTHORITATIVE_FOR_REQUIRED_COVERAGE");
      }
    }
  }
  coverage.sort((left, right) => compare(targetKey(left.target), targetKey(right.target)));
  const requiredCoverage = new Set(
    coverage.filter(({ target }) => target.required).map(({ target }) => targetKey(target)),
  );
  for (const scenarioIdentity of plan.requiredScenarioIdentities) {
    if (!requiredCoverage.has("SCENARIO:" + scenarioIdentity)) {
      addReason(reasons, "REQUIRED_SCENARIO_NOT_PROVEN");
      blockedState.value = true;
    }
  }
  for (const gateId of plan.scheduledGateIds) {
    if (!requiredCoverage.has("MANDATORY_GATE:" + gateId)) {
      addReason(reasons, "MANDATORY_WIDER_GATE_NOT_PROVEN");
      blockedState.value = true;
    }
  }
  const hasFailure = reasons.includes("REQUIRED_VALIDATION_FAILED");
  const result = blockedState.value ? "BLOCKED" : hasFailure ? "FAIL" : "PASS";
  return {
    attemptLedger: ledger,
    bindings: bindingsFromPlan(plan),
    coverage,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    finalSnapshot,
    mutationAuthorization: false,
    plan,
    priorEvidenceRecords,
    reasonCodes: reasons.sort(compare),
    result,
    reuseEvidence: advisoryReuseEvidence,
  };
}

function evidenceRecord(body) {
  return deepFreeze({
    ...body,
    evidenceIdentity: recordIdentity(ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA, body),
    schemaVersion: ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA,
  });
}

export function buildAdaptiveValidationEvidence(input) {
  exactKeys(
    input,
    ["attemptLedger", "finalSnapshot", "plan", "priorEvidenceRecords"],
    "ADAPTIVE_VALIDATION_EVIDENCE_INVALID",
  );
  const plan = verifiedPlan(input.plan);
  const ledger = verifyAdaptiveValidationAttemptLedger(input.attemptLedger);
  if (ledger.taskIdentity !== plan.taskIdentity) fail("ADAPTIVE_VALIDATION_TASK_MISMATCH");
  const finalSnapshot = normalizeSnapshot(input.finalSnapshot);
  const priorEvidenceRecords = normalizePriorEvidenceRecords(input.priorEvidenceRecords, plan);
  return evidenceRecord(deriveEvidenceBody(plan, ledger, finalSnapshot, priorEvidenceRecords));
}

const EVIDENCE_BODY_KEYS = Object.freeze([
  "attemptLedger",
  "bindings",
  "coverage",
  "factAuthority",
  "finalSnapshot",
  "mutationAuthorization",
  "plan",
  "priorEvidenceRecords",
  "reasonCodes",
  "result",
  "reuseEvidence",
]);

export function verifyAdaptiveValidationEvidence(record) {
  exactKeys(
    record,
    [...EVIDENCE_BODY_KEYS, "evidenceIdentity", "schemaVersion"],
    "ADAPTIVE_VALIDATION_EVIDENCE_INVALID",
  );
  if (record.schemaVersion !== ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA_MISMATCH");
  }
  const plan = verifiedPlan(record.plan);
  const ledger = verifyAdaptiveValidationAttemptLedger(record.attemptLedger);
  if (ledger.taskIdentity !== plan.taskIdentity) fail("ADAPTIVE_VALIDATION_TASK_MISMATCH");
  const priorEvidenceRecords = normalizePriorEvidenceRecords(record.priorEvidenceRecords, plan);
  const expected = deriveEvidenceBody(
    plan,
    ledger,
    normalizeSnapshot(record.finalSnapshot),
    priorEvidenceRecords,
  );
  const rawBody = {};
  for (const key of EVIDENCE_BODY_KEYS) rawBody[key] = record[key];
  if (!canonicalEqual(rawBody, expected)) fail("ADAPTIVE_VALIDATION_EVIDENCE_DERIVATION_MISMATCH");
  const computed = recordIdentity(ADAPTIVE_VALIDATION_EVIDENCE_SCHEMA, expected);
  if (identity(record.evidenceIdentity, "ADAPTIVE_VALIDATION_EVIDENCE_INVALID") !== computed) {
    fail("ADAPTIVE_VALIDATION_EVIDENCE_IDENTITY_MISMATCH");
  }
  return evidenceRecord(expected);
}

function normalizeCurrentTargetFact(value) {
  exactKeys(
    value,
    [
      "capabilityIdentity",
      "environmentIdentity",
      "evidenceManifestIdentity",
      "execution",
      "materials",
      "target",
    ],
    "ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID",
  );
  const target = normalizeTarget(value.target);
  return {
    capabilityIdentity: identity(
      value.capabilityIdentity,
      "ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID",
    ),
    environmentIdentity: identity(
      value.environmentIdentity,
      "ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID",
    ),
    evidenceManifestIdentity: identity(
      value.evidenceManifestIdentity,
      "ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID",
    ),
    execution: normalizeExecution(value.execution),
    materials: normalizeMaterials(value.materials),
    target,
  };
}

function normalizeCurrentFacts(value) {
  exactKeys(
    value,
    ["finalSnapshot", "plan", "schemaVersion", "supersededEvidenceIdentities", "targetFacts"],
    "ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID",
  );
  if (value.schemaVersion !== ADAPTIVE_VALIDATION_CURRENT_FACTS_SCHEMA) {
    fail("ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID");
  }
  if (!Array.isArray(value.targetFacts)) fail("ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID");
  const targetFacts = value.targetFacts.map(normalizeCurrentTargetFact);
  targetFacts.sort((left, right) => compare(targetKey(left.target), targetKey(right.target)));
  if (new Set(targetFacts.map(({ target }) => targetKey(target))).size !== targetFacts.length) {
    fail("ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID");
  }
  return {
    finalSnapshot: normalizeSnapshot(value.finalSnapshot),
    plan: verifiedPlan(value.plan),
    schemaVersion: ADAPTIVE_VALIDATION_CURRENT_FACTS_SCHEMA,
    supersededEvidenceIdentities: identityArray(
      value.supersededEvidenceIdentities,
      "ADAPTIVE_VALIDATION_CURRENT_FACTS_INVALID",
    ),
    targetFacts,
  };
}

function stalenessResult(disposition, reasons, evidenceIdentityValue) {
  return deepFreeze({
    disposition,
    evidenceIdentity: evidenceIdentityValue,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    reasonCodes: [...new Set(reasons)].sort(compare),
    schemaVersion: ADAPTIVE_VALIDATION_STALENESS_SCHEMA,
  });
}

function planDriftReasons(previous, current) {
  const reasons = [];
  if (
    previous.sourceGenerationFingerprint !== current.sourceGenerationFingerprint ||
    previous.sourceManifestIdentity !== current.sourceManifestIdentity ||
    !canonicalEqual(previous.sourceAnchorIdentities, current.sourceAnchorIdentities)
  ) {
    reasons.push("SOURCE_GENERATION_DRIFT");
  }
  if (
    previous.catalogIdentity !== current.catalogIdentity ||
    previous.catalogGenerationIdentity !== current.catalogGenerationIdentity
  ) {
    reasons.push("SCENARIO_ORACLE_GENERATION_DRIFT");
  }
  if (
    previous.contextGenerationIdentity !== current.contextGenerationIdentity ||
    previous.contextClosureIdentity !== current.contextClosureIdentity ||
    previous.currentTruthIdentity !== current.currentTruthIdentity ||
    previous.semanticClosureWitnessIdentity !== current.semanticClosureWitnessIdentity
  ) {
    reasons.push("CONTEXT_CURRENTNESS_DRIFT");
  }
  if (
    previous.repositoryIdentity !== current.repositoryIdentity ||
    previous.repositorySnapshotIdentity !== current.repositorySnapshotIdentity ||
    previous.workingSetIdentity !== current.workingSetIdentity ||
    previous.repositoryHeadCommit !== current.repositoryHeadCommit ||
    previous.repositoryHeadTree !== current.repositoryHeadTree
  ) {
    reasons.push("REPOSITORY_CURRENTNESS_DRIFT");
  }
  if (
    previous.authorizationIdentity !== current.authorizationIdentity ||
    previous.taskIdentity !== current.taskIdentity ||
    previous.taskContractIdentity !== current.taskContractIdentity ||
    previous.taskMaterialFingerprint !== current.taskMaterialFingerprint
  ) {
    reasons.push("TASK_MATERIAL_DRIFT");
  }
  if (
    previous.physicalImpactIdentity !== current.physicalImpactIdentity ||
    previous.semanticImpactIdentity !== current.semanticImpactIdentity ||
    previous.riskIdentity !== current.riskIdentity ||
    previous.riskClass !== current.riskClass
  ) {
    reasons.push("IMPACT_OR_RISK_DRIFT");
  }
  if (previous.capabilityIdentity !== current.capabilityIdentity) {
    reasons.push("CAPABILITY_DRIFT");
  }
  if (previous.environmentIdentity !== current.environmentIdentity) {
    reasons.push("ENVIRONMENT_DRIFT");
  }
  if (
    previous.planIdentity !== current.planIdentity ||
    previous.planContentIdentity !== current.planContentIdentity
  ) {
    reasons.push("VALIDATION_PLAN_DRIFT");
  }
  return reasons;
}

export function evaluateAdaptiveValidationEvidence(evidence, currentFacts) {
  let normalizedEvidence;
  try {
    normalizedEvidence = verifyAdaptiveValidationEvidence(evidence);
  } catch (error) {
    return stalenessResult(
      "INVALID_EVIDENCE",
      [
        error instanceof AdaptiveValidationEvidenceError
          ? error.code
          : "ADAPTIVE_VALIDATION_EVIDENCE_INVALID",
      ],
      null,
    );
  }
  let current;
  try {
    current = normalizeCurrentFacts(currentFacts);
  } catch {
    return stalenessResult(
      "TEST_RESULT_STALE",
      ["CURRENT_VALIDATION_FACTS_INVALID_OR_UNKNOWN"],
      normalizedEvidence.evidenceIdentity,
    );
  }
  const reasons = [];
  if (normalizedEvidence.result !== "PASS") reasons.push("VALIDATION_RESULT_NOT_PASS");
  const currentBindings = bindingsFromPlan(current.plan);
  reasons.push(...planDriftReasons(normalizedEvidence.bindings, currentBindings));
  if (!canonicalEqual(normalizedEvidence.finalSnapshot, current.finalSnapshot)) {
    reasons.push("REPOSITORY_CURRENTNESS_DRIFT");
  }
  if (current.supersededEvidenceIdentities.includes(normalizedEvidence.evidenceIdentity)) {
    reasons.push("EVIDENCE_SUPERSEDED");
  }
  if (
    normalizedEvidence.reuseEvidence.some(({ priorEvidenceIdentity }) =>
      current.supersededEvidenceIdentities.includes(priorEvidenceIdentity),
    )
  ) {
    reasons.push("REUSED_EVIDENCE_SUPERSEDED");
  }
  const executedCoverage = normalizedEvidence.coverage.filter(
    ({ disposition }) => disposition === "EXECUTED_PASS",
  );
  for (const coverage of executedCoverage) {
    const fact = current.targetFacts.find(
      ({ target }) => targetKey(target) === targetKey(coverage.target),
    );
    const attempt = normalizedEvidence.attemptLedger.attempts.find(
      ({ attemptIdentity }) => attemptIdentity === coverage.bindingIdentity,
    );
    if (fact === undefined || attempt === undefined) {
      reasons.push("CURRENT_VALIDATION_FACTS_INVALID_OR_UNKNOWN");
      continue;
    }
    if (!canonicalEqual(fact.target, attempt.target)) {
      reasons.push("CURRENT_VALIDATION_FACTS_INVALID_OR_UNKNOWN");
    }
    if (!canonicalEqual(fact.execution, attempt.execution)) {
      reasons.push("VALIDATION_ACTION_DRIFT");
    }
    if (fact.capabilityIdentity !== attempt.capability.identity) {
      reasons.push("CAPABILITY_DRIFT");
    }
    if (fact.environmentIdentity !== attempt.environmentIdentity) {
      reasons.push("ENVIRONMENT_DRIFT");
    }
    if (!canonicalEqual(fact.materials, attempt.materials)) {
      reasons.push("AFFECTED_MATERIAL_DRIFT");
    }
    if (fact.evidenceManifestIdentity !== attempt.evidenceManifestIdentity) {
      reasons.push("EVIDENCE_MATERIAL_DRIFT");
    }
  }
  const expectedFactTargets = new Set(executedCoverage.map(({ target }) => targetKey(target)));
  if (
    current.targetFacts.some(({ target }) => !expectedFactTargets.has(targetKey(target))) ||
    current.targetFacts.length !== expectedFactTargets.size
  ) {
    reasons.push("CURRENT_VALIDATION_FACTS_INVALID_OR_UNKNOWN");
  }
  return stalenessResult(
    reasons.length === 0 ? "CURRENT" : "TEST_RESULT_STALE",
    reasons,
    normalizedEvidence.evidenceIdentity,
  );
}
