import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex, normalizeRepoRelativePath } from "./identity.mjs";

export const VALIDATION_RESULT_SCHEMA = "CIC-VALIDATION-RESULT-IDENTITY/1";
export const VALIDATION_CURRENT_FACTS_SCHEMA = "CIC-VALIDATION-CURRENT-FACTS/1";
const VALIDATION_EVIDENCE_MANIFEST_SCHEMA = "CIC-VALIDATION-EVIDENCE-MANIFEST/1";
export const VALIDATION_DISPOSITIONS = Object.freeze([
  "CURRENT",
  "REVALIDATION_REQUIRED",
  "INVALID_EVIDENCE",
]);

const INSPECTION_SCHEMA = "CIC-VALIDATION-EVIDENCE-INSPECTION/1";
const VERIFICATION_SCHEMA = "CIC-VALIDATION-EVIDENCE-VERIFICATION/1";
const SHA256_PATTERN = /^[0-9A-F]{64}$/u;
const CONTENT_IDENTITY_PATTERN = /^(?:[0-9a-f]{40}|[0-9A-F]{64})$/u;
const RESULT_VALUES = new Set(["PASS", "FAIL", "UNKNOWN"]);

class ValidationEvidenceError extends Error {
  constructor(code) {
    super(code);
    this.name = "ValidationEvidenceError";
    this.code = code;
  }
}

function fail(code) {
  throw new ValidationEvidenceError(code);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requireObject(value, code) {
  if (!isPlainObject(value)) fail(code);
  return value;
}

function requireExactKeys(value, keys, code) {
  requireObject(value, code);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(code);
  }
}

function requireString(value, code) {
  if (typeof value !== "string" || value.length === 0 || value === "UNKNOWN") fail(code);
  return value;
}

function requireSha256(value, code) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) fail(code);
  return value;
}

function requireContentIdentity(value, code) {
  if (typeof value !== "string" || !CONTENT_IDENTITY_PATTERN.test(value)) fail(code);
  return value;
}

function requireBoolean(value, code) {
  if (typeof value !== "boolean") fail(code);
  return value;
}

function requireCount(value, code) {
  if (!Number.isSafeInteger(value) || value < 0) fail(code);
  return value;
}

function requireStringArray(value, code) {
  if (!Array.isArray(value)) fail(code);
  const result = value.map((entry) => requireString(entry, code));
  if (new Set(result).size !== result.length) fail(code);
  return [...result].sort();
}

function normalizeCommands(value) {
  if (!Array.isArray(value) || value.length === 0) fail("COMMAND_IDENTITIES_INVALID");
  const seen = new Set();
  return value.map((entry) => {
    requireExactKeys(entry, ["commandId", "identity"], "COMMAND_IDENTITIES_INVALID");
    const commandId = requireString(entry.commandId, "COMMAND_IDENTITIES_INVALID");
    if (seen.has(commandId)) fail("COMMAND_IDENTITIES_INVALID");
    seen.add(commandId);
    return {
      commandId,
      identity: requireSha256(entry.identity, "COMMAND_IDENTITIES_INVALID"),
    };
  });
}

function normalizeSourceGeneration(value) {
  requireExactKeys(
    value,
    ["generationFingerprint", "manifestIdentity"],
    "SOURCE_GENERATION_INVALID",
  );
  return {
    generationFingerprint: requireSha256(value.generationFingerprint, "SOURCE_GENERATION_INVALID"),
    manifestIdentity: requireSha256(value.manifestIdentity, "SOURCE_GENERATION_INVALID"),
  };
}

function normalizeRepository(value) {
  requireExactKeys(
    value,
    ["repositoryIdentity", "treeIdentity", "view"],
    "REPOSITORY_IDENTITY_INVALID",
  );
  requireExactKeys(value.view, ["complete", "shallow"], "REPOSITORY_VIEW_INVALID");
  return {
    repositoryIdentity: requireSha256(value.repositoryIdentity, "REPOSITORY_IDENTITY_INVALID"),
    treeIdentity: requireContentIdentity(value.treeIdentity, "REPOSITORY_IDENTITY_INVALID"),
    view: {
      complete: requireBoolean(value.view.complete, "REPOSITORY_VIEW_INVALID"),
      shallow: requireBoolean(value.view.shallow, "REPOSITORY_VIEW_INVALID"),
    },
  };
}

function normalizeWorkingSet(value) {
  requireExactKeys(
    value,
    ["fingerprint", "indexTreeIdentity", "treeIdentity"],
    "WORKING_SET_IDENTITY_INVALID",
  );
  return {
    fingerprint: requireSha256(value.fingerprint, "WORKING_SET_IDENTITY_INVALID"),
    indexTreeIdentity: requireContentIdentity(
      value.indexTreeIdentity,
      "WORKING_SET_IDENTITY_INVALID",
    ),
    treeIdentity: requireContentIdentity(value.treeIdentity, "WORKING_SET_IDENTITY_INVALID"),
  };
}

function normalizeMaterials(value) {
  requireExactKeys(
    value,
    ["configIdentity", "fixtureIdentity", "testIdentity"],
    "MATERIAL_IDENTITIES_INVALID",
  );
  return {
    configIdentity: requireSha256(value.configIdentity, "MATERIAL_IDENTITIES_INVALID"),
    fixtureIdentity: requireSha256(value.fixtureIdentity, "MATERIAL_IDENTITIES_INVALID"),
    testIdentity: requireSha256(value.testIdentity, "MATERIAL_IDENTITIES_INVALID"),
  };
}

function normalizeEnvironment(value) {
  requireExactKeys(value, ["identity", "toolchainIdentity"], "ENVIRONMENT_IDENTITY_INVALID");
  return {
    identity: requireSha256(value.identity, "ENVIRONMENT_IDENTITY_INVALID"),
    toolchainIdentity: requireSha256(value.toolchainIdentity, "ENVIRONMENT_IDENTITY_INVALID"),
  };
}

function normalizeOptionalGeneration(value, code) {
  requireExactKeys(value, ["generation", "required"], code);
  const required = requireBoolean(value.required, code);
  if (required) return { generation: requireSha256(value.generation, code), required };
  if (value.generation !== null) fail(code);
  return { generation: null, required };
}

function normalizePopulation(value) {
  requireExactKeys(value, ["issues", "skipped", "testFiles", "tests"], "POPULATION_INVALID");
  return {
    issues: requireCount(value.issues, "POPULATION_INVALID"),
    skipped: requireCount(value.skipped, "POPULATION_INVALID"),
    testFiles: requireCount(value.testFiles, "POPULATION_INVALID"),
    tests: requireCount(value.tests, "POPULATION_INVALID"),
  };
}

function normalizeManifestEntries(value) {
  if (!Array.isArray(value) || value.length === 0) fail("EVIDENCE_MANIFEST_INVALID");
  const entries = value.map((entry) => {
    requireExactKeys(entry, ["bytes", "path", "sha256"], "EVIDENCE_MANIFEST_INVALID");
    let relativePath;
    try {
      relativePath = normalizeRepoRelativePath(entry.path);
    } catch {
      fail("EVIDENCE_MANIFEST_INVALID");
    }
    return {
      bytes: requireCount(entry.bytes, "EVIDENCE_MANIFEST_INVALID"),
      path: relativePath,
      sha256: requireSha256(entry.sha256, "EVIDENCE_MANIFEST_INVALID"),
    };
  });
  entries.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
  if (new Set(entries.map(({ path }) => path)).size !== entries.length) {
    fail("EVIDENCE_MANIFEST_INVALID");
  }
  return entries;
}

export function evidenceManifestIdentity(entries) {
  const normalized = normalizeManifestEntries(entries);
  return sha256Hex(
    `${VALIDATION_EVIDENCE_MANIFEST_SCHEMA}\n${canonicalJson({ entries: normalized })}\n`,
  );
}

function normalizeEvidenceManifest(value, requireIdentity = true) {
  const keys = requireIdentity ? ["entries", "identity", "schemaVersion"] : ["entries"];
  requireExactKeys(value, keys, "EVIDENCE_MANIFEST_INVALID");
  const entries = normalizeManifestEntries(value.entries);
  const computed = evidenceManifestIdentity(entries);
  if (requireIdentity) {
    if (value.schemaVersion !== VALIDATION_EVIDENCE_MANIFEST_SCHEMA) {
      fail("EVIDENCE_MANIFEST_SCHEMA_MISMATCH");
    }
    if (requireSha256(value.identity, "EVIDENCE_MANIFEST_INVALID") !== computed) {
      fail("EVIDENCE_MANIFEST_MISMATCH");
    }
  }
  return {
    entries,
    identity: computed,
    schemaVersion: VALIDATION_EVIDENCE_MANIFEST_SCHEMA,
  };
}

function normalizeExecutedTestFiles(value) {
  if (!Array.isArray(value) || value.length === 0) fail("EXECUTED_TEST_FILES_INVALID");
  const result = value.map((entry) => {
    requireExactKeys(entry, ["path", "result"], "EXECUTED_TEST_FILES_INVALID");
    let relativePath;
    try {
      relativePath = normalizeRepoRelativePath(entry.path);
    } catch {
      fail("EXECUTED_TEST_FILES_INVALID");
    }
    if (entry.result !== "PASS") fail("EXECUTED_TEST_RESULT_NOT_PASS");
    return { path: relativePath, result: "PASS" };
  });
  result.sort((left, right) => (left.path < right.path ? -1 : left.path > right.path ? 1 : 0));
  if (new Set(result.map(({ path }) => path)).size !== result.length) {
    fail("EXECUTED_TEST_FILES_INVALID");
  }
  return result;
}

function normalizeLifecycle(value) {
  requireExactKeys(value, ["knownCorrectnessBlockers", "superseded"], "EVIDENCE_LIFECYCLE_INVALID");
  return {
    knownCorrectnessBlockers: requireStringArray(
      value.knownCorrectnessBlockers,
      "EVIDENCE_LIFECYCLE_INVALID",
    ),
    superseded: requireBoolean(value.superseded, "EVIDENCE_LIFECYCLE_INVALID"),
  };
}

function normalizeEvidenceBody(value, fromRecord) {
  const expectedKeys = [
    "capability",
    "commandIdentities",
    "endFingerprint",
    "environment",
    "evidenceManifest",
    "executedTestFiles",
    "factAuthority",
    "lifecycle",
    "materials",
    "population",
    "repository",
    "result",
    "scenarioOracle",
    "sourceGeneration",
    "startFingerprint",
    "validationPlanId",
    "workingSet",
  ];
  requireExactKeys(value, expectedKeys, "VALIDATION_EVIDENCE_SHAPE_INVALID");
  if (value.factAuthority !== "NON_AUTHORITATIVE_INPUT") fail("FACT_AUTHORITY_INVALID");
  if (!RESULT_VALUES.has(value.result)) fail("VALIDATION_RESULT_INVALID");
  return {
    capability: normalizeOptionalGeneration(value.capability, "CAPABILITY_IDENTITY_INVALID"),
    commandIdentities: normalizeCommands(value.commandIdentities),
    endFingerprint: requireSha256(value.endFingerprint, "END_FINGERPRINT_INVALID"),
    environment: normalizeEnvironment(value.environment),
    evidenceManifest: normalizeEvidenceManifest(value.evidenceManifest, fromRecord),
    executedTestFiles: normalizeExecutedTestFiles(value.executedTestFiles),
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    lifecycle: normalizeLifecycle(value.lifecycle),
    materials: normalizeMaterials(value.materials),
    population: normalizePopulation(value.population),
    repository: normalizeRepository(value.repository),
    result: value.result,
    scenarioOracle: normalizeOptionalGeneration(value.scenarioOracle, "SCENARIO_ORACLE_INVALID"),
    sourceGeneration: normalizeSourceGeneration(value.sourceGeneration),
    startFingerprint: requireSha256(value.startFingerprint, "START_FINGERPRINT_INVALID"),
    validationPlanId: requireSha256(value.validationPlanId, "VALIDATION_PLAN_ID_INVALID"),
    workingSet: normalizeWorkingSet(value.workingSet),
  };
}

function resultIdentity(body) {
  return sha256Hex(`${VALIDATION_RESULT_SCHEMA}\n${canonicalJson(body)}\n`);
}

export function buildValidationEvidence(input) {
  requireObject(input, "VALIDATION_EVIDENCE_SHAPE_INVALID");
  const bodyInput = {
    ...input,
    evidenceManifest: { entries: input.evidenceManifestEntries },
  };
  delete bodyInput.evidenceManifestEntries;
  const body = normalizeEvidenceBody(bodyInput, false);
  return {
    ...body,
    schemaVersion: VALIDATION_RESULT_SCHEMA,
    validationResultIdentity: resultIdentity(body),
  };
}

function normalizeEvidenceRecord(record) {
  requireExactKeys(
    record,
    [
      "capability",
      "commandIdentities",
      "endFingerprint",
      "environment",
      "evidenceManifest",
      "executedTestFiles",
      "factAuthority",
      "lifecycle",
      "materials",
      "population",
      "repository",
      "result",
      "scenarioOracle",
      "schemaVersion",
      "sourceGeneration",
      "startFingerprint",
      "validationPlanId",
      "validationResultIdentity",
      "workingSet",
    ],
    "VALIDATION_EVIDENCE_SHAPE_INVALID",
  );
  if (record.schemaVersion !== VALIDATION_RESULT_SCHEMA) fail("SCHEMA_MISMATCH");
  const bodyInput = { ...record };
  delete bodyInput.schemaVersion;
  delete bodyInput.validationResultIdentity;
  const { validationResultIdentity } = record;
  const body = normalizeEvidenceBody(bodyInput, true);
  const computed = resultIdentity(body);
  if (requireSha256(validationResultIdentity, "VALIDATION_RESULT_IDENTITY_INVALID") !== computed) {
    fail("VALIDATION_RESULT_IDENTITY_MISMATCH");
  }
  return { body, validationResultIdentity: computed };
}

function stableReasons(reasons) {
  return [...new Set(reasons)];
}

function inspectionResult(disposition, reasons, identity = null) {
  return {
    schemaVersion: INSPECTION_SCHEMA,
    disposition,
    reasonCodes: stableReasons(reasons),
    validationResultIdentity: identity,
    factAuthority: "NON_AUTHORITATIVE_INPUT",
  };
}

export function inspectValidationEvidence(evidence) {
  let normalized;
  try {
    normalized = normalizeEvidenceRecord(evidence);
  } catch (error) {
    return inspectionResult("INVALID_EVIDENCE", [
      error instanceof ValidationEvidenceError ? error.code : "VALIDATION_EVIDENCE_INVALID",
    ]);
  }

  const { body, validationResultIdentity } = normalized;
  const invalidReasons = [];
  if (body.result !== "PASS") invalidReasons.push(`VALIDATION_RESULT_${body.result}`);
  if (body.startFingerprint !== body.endFingerprint) {
    invalidReasons.push("MATERIAL_FINGERPRINT_RACE");
  }
  if (body.population.skipped !== 0) invalidReasons.push("SKIP_POLICY_MISMATCH");
  if (body.population.issues !== 0) invalidReasons.push("ISSUE_POLICY_MISMATCH");
  if (body.population.testFiles !== body.executedTestFiles.length) {
    invalidReasons.push("TEST_FILE_POPULATION_MISMATCH");
  }
  if (invalidReasons.length !== 0) {
    return inspectionResult("INVALID_EVIDENCE", invalidReasons, validationResultIdentity);
  }

  const staleReasons = [];
  if (!body.repository.view.complete || body.repository.view.shallow) {
    staleReasons.push("REPOSITORY_VIEW_INCOMPLETE");
  }
  if (body.lifecycle.superseded) staleReasons.push("EVIDENCE_SUPERSEDED");
  if (body.lifecycle.knownCorrectnessBlockers.length !== 0) {
    staleReasons.push("KNOWN_CORRECTNESS_BLOCKER");
  }
  if (staleReasons.length !== 0) {
    return inspectionResult("REVALIDATION_REQUIRED", staleReasons, validationResultIdentity);
  }
  return inspectionResult("CURRENT", [], validationResultIdentity);
}

function normalizeCurrentFacts(value) {
  requireExactKeys(
    value,
    [
      "capability",
      "commandIdentities",
      "environment",
      "evidenceManifestIdentity",
      "knownCorrectnessBlockers",
      "materialFingerprint",
      "materials",
      "population",
      "repository",
      "scenarioOracle",
      "schemaVersion",
      "sourceGeneration",
      "supersededEvidenceIdentities",
      "validationPlanId",
      "workingSet",
    ],
    "CURRENT_FACTS_INVALID_OR_UNKNOWN",
  );
  if (value.schemaVersion !== VALIDATION_CURRENT_FACTS_SCHEMA) {
    fail("CURRENT_FACTS_INVALID_OR_UNKNOWN");
  }
  if (!Array.isArray(value.supersededEvidenceIdentities)) {
    fail("CURRENT_FACTS_INVALID_OR_UNKNOWN");
  }
  return {
    capability: normalizeOptionalGeneration(value.capability, "CURRENT_FACTS_INVALID_OR_UNKNOWN"),
    commandIdentities: normalizeCommands(value.commandIdentities),
    environment: normalizeEnvironment(value.environment),
    evidenceManifestIdentity: requireSha256(
      value.evidenceManifestIdentity,
      "CURRENT_FACTS_INVALID_OR_UNKNOWN",
    ),
    knownCorrectnessBlockers: requireStringArray(
      value.knownCorrectnessBlockers,
      "CURRENT_FACTS_INVALID_OR_UNKNOWN",
    ),
    materialFingerprint: requireSha256(
      value.materialFingerprint,
      "CURRENT_FACTS_INVALID_OR_UNKNOWN",
    ),
    materials: normalizeMaterials(value.materials),
    population: normalizePopulation(value.population),
    repository: normalizeRepository(value.repository),
    scenarioOracle: normalizeOptionalGeneration(
      value.scenarioOracle,
      "CURRENT_FACTS_INVALID_OR_UNKNOWN",
    ),
    schemaVersion: VALIDATION_CURRENT_FACTS_SCHEMA,
    sourceGeneration: normalizeSourceGeneration(value.sourceGeneration),
    supersededEvidenceIdentities: [
      ...new Set(
        value.supersededEvidenceIdentities.map((entry) =>
          requireSha256(entry, "CURRENT_FACTS_INVALID_OR_UNKNOWN"),
        ),
      ),
    ].sort(),
    validationPlanId: requireSha256(value.validationPlanId, "CURRENT_FACTS_INVALID_OR_UNKNOWN"),
    workingSet: normalizeWorkingSet(value.workingSet),
  };
}

function differs(left, right) {
  return canonicalJson(left) !== canonicalJson(right);
}

export function evaluateValidationEvidence(evidence, currentFacts) {
  const inspection = inspectValidationEvidence(evidence);
  if (inspection.disposition !== "CURRENT") {
    return {
      ...inspection,
      schemaVersion: VERIFICATION_SCHEMA,
    };
  }

  let normalizedEvidence;
  let current;
  try {
    normalizedEvidence = normalizeEvidenceRecord(evidence);
    current = normalizeCurrentFacts(currentFacts);
  } catch (error) {
    return {
      schemaVersion: VERIFICATION_SCHEMA,
      disposition: "REVALIDATION_REQUIRED",
      reasonCodes: [
        error instanceof ValidationEvidenceError ? error.code : "CURRENT_FACTS_INVALID_OR_UNKNOWN",
      ],
      validationResultIdentity: inspection.validationResultIdentity,
      factAuthority: "NON_AUTHORITATIVE_INPUT",
    };
  }

  const body = normalizedEvidence.body;
  const reasons = [];
  if (body.validationPlanId !== current.validationPlanId) reasons.push("PLAN_MISMATCH");
  if (differs(body.commandIdentities, current.commandIdentities)) {
    reasons.push("COMMAND_IDENTITY_MISMATCH");
  }
  if (
    body.sourceGeneration.generationFingerprint !== current.sourceGeneration.generationFingerprint
  ) {
    reasons.push("SOURCE_GENERATION_STALE");
  }
  if (body.sourceGeneration.manifestIdentity !== current.sourceGeneration.manifestIdentity) {
    reasons.push("SOURCE_MANIFEST_STALE");
  }
  if (body.repository.repositoryIdentity !== current.repository.repositoryIdentity) {
    reasons.push("REPOSITORY_IDENTITY_STALE");
  }
  if (
    body.repository.treeIdentity !== current.repository.treeIdentity ||
    differs(body.repository.view, current.repository.view)
  ) {
    reasons.push("REPOSITORY_TREE_OR_VIEW_STALE");
  }
  if (differs(body.workingSet, current.workingSet)) reasons.push("WORKING_SET_STALE");
  if (body.materials.testIdentity !== current.materials.testIdentity) {
    reasons.push("TEST_IDENTITY_STALE");
  }
  if (body.materials.configIdentity !== current.materials.configIdentity) {
    reasons.push("CONFIG_IDENTITY_STALE");
  }
  if (body.materials.fixtureIdentity !== current.materials.fixtureIdentity) {
    reasons.push("FIXTURE_IDENTITY_STALE");
  }
  if (body.environment.identity !== current.environment.identity) {
    reasons.push("ENVIRONMENT_IDENTITY_STALE");
  }
  if (body.environment.toolchainIdentity !== current.environment.toolchainIdentity) {
    reasons.push("TOOLCHAIN_IDENTITY_STALE");
  }
  if (differs(body.capability, current.capability)) reasons.push("CAPABILITY_IDENTITY_STALE");
  if (differs(body.scenarioOracle, current.scenarioOracle)) {
    reasons.push("SCENARIO_ORACLE_STALE");
  }
  if (differs(body.population, current.population)) reasons.push("POPULATION_MISMATCH");
  if (current.population.skipped !== 0) reasons.push("SKIP_POLICY_MISMATCH");
  if (current.population.issues !== 0) reasons.push("ISSUE_POLICY_MISMATCH");
  if (body.evidenceManifest.identity !== current.evidenceManifestIdentity) {
    reasons.push("EVIDENCE_MANIFEST_STALE");
  }
  if (body.endFingerprint !== current.materialFingerprint) {
    reasons.push("MATERIAL_FINGERPRINT_STALE");
  }
  if (current.supersededEvidenceIdentities.includes(normalizedEvidence.validationResultIdentity)) {
    reasons.push("EVIDENCE_SUPERSEDED");
  }
  if (current.knownCorrectnessBlockers.length !== 0) {
    reasons.push("KNOWN_CORRECTNESS_BLOCKER");
  }

  return {
    schemaVersion: VERIFICATION_SCHEMA,
    disposition: reasons.length === 0 ? "CURRENT" : "REVALIDATION_REQUIRED",
    reasonCodes: stableReasons(reasons),
    validationResultIdentity: normalizedEvidence.validationResultIdentity,
    factAuthority: "NON_AUTHORITATIVE_INPUT",
  };
}
