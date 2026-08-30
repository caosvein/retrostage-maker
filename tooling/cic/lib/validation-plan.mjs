import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex, normalizeRepoRelativePath } from "./identity.mjs";
import { evaluateValidationEvidence } from "./validation-evidence.mjs";

export const VALIDATION_PHASES = Object.freeze([
  "IMPLEMENT_FIX",
  "STAGE",
  "COMMIT",
  "PUSH_LOCAL",
  "NATURAL_CI",
  "CLOSURE",
]);
export const VALIDATION_PLAN_REQUESTS = Object.freeze(["SAFE_SUPERSET_DEDUP", "ADAPTIVE_PRUNING"]);
export const VALIDATION_REVALIDATION_SCOPES = Object.freeze([
  "NONE",
  "FALLBACK_DIRECT_GATES",
  "FULL_GOVERNED_PLAN",
]);

const MEMBERSHIP_SCHEMA = "CIC-VALIDATION-FULL-SUITE-MEMBERSHIP/1";
const EXECUTION_PLAN_SCHEMA = "CIC-VALIDATION-EXECUTION-PLAN/1";
const PHASE_RESULT_SCHEMA = "CIC-VALIDATION-PHASE-RESULT/1";
const SUPERSET_EXECUTION_SCHEMA = "CIC-VALIDATION-SUPERSET-EXECUTION/2";
const SHA256_PATTERN = /^[0-9A-F]{64}$/u;
const CONTENT_IDENTITY_PATTERN = /^(?:[0-9a-f]{40}|[0-9A-F]{64})$/u;

function fail(code) {
  const error = new TypeError(code);
  error.code = code;
  throw error;
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, keys, code) {
  if (!isPlainObject(value)) fail(code);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(code);
  }
}

function string(value, code) {
  if (typeof value !== "string" || value.length === 0 || value === "UNKNOWN") fail(code);
  return value;
}

function sha256(value, code) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) fail(code);
  return value;
}

function identity(value, code) {
  if (typeof value !== "string" || !CONTENT_IDENTITY_PATTERN.test(value)) fail(code);
  return value;
}

function uniqueStrings(value, code) {
  if (!Array.isArray(value)) fail(code);
  const result = value.map((entry) => string(entry, code));
  if (new Set(result).size !== result.length) fail(code);
  return result;
}

function testFiles(value, code) {
  if (!Array.isArray(value) || value.length === 0) fail(code);
  const normalized = value.map((entry) => {
    try {
      return normalizeRepoRelativePath(entry);
    } catch {
      fail(code);
    }
  });
  normalized.sort();
  if (new Set(normalized).size !== normalized.length) fail(code);
  return normalized;
}

function membershipIdentity(body) {
  return sha256Hex(`${MEMBERSHIP_SCHEMA}\n${canonicalJson(body)}\n`);
}

export function createFullSuiteMembershipProof({ validationPlanId, fullGateId, testFiles: files }) {
  const body = {
    fullGateId: string(fullGateId, "MEMBERSHIP_PROOF_INVALID"),
    testFiles: testFiles(files, "MEMBERSHIP_PROOF_INVALID"),
    validationPlanId: sha256(validationPlanId, "MEMBERSHIP_PROOF_INVALID"),
  };
  return {
    ...body,
    schemaVersion: MEMBERSHIP_SCHEMA,
    membershipProofIdentity: membershipIdentity(body),
  };
}

function normalizeMembershipProof(value) {
  exactKeys(
    value,
    ["fullGateId", "membershipProofIdentity", "schemaVersion", "testFiles", "validationPlanId"],
    "MEMBERSHIP_PROOF_INVALID",
  );
  if (value.schemaVersion !== MEMBERSHIP_SCHEMA) fail("MEMBERSHIP_PROOF_INVALID");
  const body = {
    fullGateId: string(value.fullGateId, "MEMBERSHIP_PROOF_INVALID"),
    testFiles: testFiles(value.testFiles, "MEMBERSHIP_PROOF_INVALID"),
    validationPlanId: sha256(value.validationPlanId, "MEMBERSHIP_PROOF_INVALID"),
  };
  if (
    sha256(value.membershipProofIdentity, "MEMBERSHIP_PROOF_INVALID") !== membershipIdentity(body)
  ) {
    fail("MEMBERSHIP_PROOF_INVALID");
  }
  return { ...body, membershipProofIdentity: membershipIdentity(body) };
}

function normalizeGate(value) {
  exactKeys(
    value,
    ["commandIdentity", "gateId", "kind", "mandatory", "requiredTestFiles"],
    "VALIDATION_GATE_INVALID",
  );
  if (!["DIRECT", "FULL_SUITE"].includes(value.kind)) fail("VALIDATION_GATE_INVALID");
  if (value.mandatory !== true) fail("VALIDATION_GATE_INVALID");
  return {
    commandIdentity: sha256(value.commandIdentity, "VALIDATION_GATE_INVALID"),
    gateId: string(value.gateId, "VALIDATION_GATE_INVALID"),
    kind: value.kind,
    mandatory: true,
    requiredTestFiles: testFiles(value.requiredTestFiles, "VALIDATION_GATE_INVALID"),
  };
}

function normalizeGates(value) {
  if (!Array.isArray(value) || value.length === 0) fail("VALIDATION_GATES_INVALID");
  const gates = value.map(normalizeGate);
  if (new Set(gates.map(({ gateId }) => gateId)).size !== gates.length) {
    fail("VALIDATION_GATES_INVALID");
  }
  return gates;
}

function executionPlanIdentity(body) {
  return sha256Hex(`${EXECUTION_PLAN_SCHEMA}\n${canonicalJson(body)}\n`);
}

function allGateIds(gates) {
  return gates.map(({ gateId }) => gateId);
}

export function createValidationExecutionPlan({
  validationPlanId,
  request,
  gates: gateInput,
  membershipProof,
}) {
  const planId = sha256(validationPlanId, "VALIDATION_PLAN_ID_INVALID");
  if (!VALIDATION_PLAN_REQUESTS.includes(request)) fail("VALIDATION_PLAN_REQUEST_INVALID");
  const gates = normalizeGates(gateInput);
  const fullGates = gates.filter(({ kind }) => kind === "FULL_SUITE");
  const directGates = gates.filter(({ kind }) => kind === "DIRECT");
  const coverage = [];
  let scheduledGateIds = allGateIds(gates);
  const deduplicatedGateIds = [];
  let membershipProofIdentity = null;
  let disposition = "PLAN_READY";
  const reasonCodes = [];

  if (request === "ADAPTIVE_PRUNING") {
    disposition = "DEFER_TO_CIC_I6";
    reasonCodes.push("ADAPTIVE_PRUNING_NOT_AUTHORIZED");
  } else if (fullGates.length !== 1) {
    reasonCodes.push(fullGates.length === 0 ? "FULL_SUPERSET_MISSING" : "FULL_SUPERSET_AMBIGUOUS");
  } else {
    let proof;
    try {
      proof = normalizeMembershipProof(membershipProof);
    } catch {
      reasonCodes.push("FULL_SUPERSET_MEMBERSHIP_UNPROVEN");
    }
    const fullGate = fullGates[0];
    if (
      proof &&
      (proof.validationPlanId !== planId ||
        proof.fullGateId !== fullGate.gateId ||
        canonicalJson(proof.testFiles) !== canonicalJson(fullGate.requiredTestFiles))
    ) {
      reasonCodes.push("FULL_SUPERSET_MEMBERSHIP_UNPROVEN");
      proof = null;
    }
    if (proof) {
      membershipProofIdentity = proof.membershipProofIdentity;
      const members = new Set(proof.testFiles);
      for (const gate of directGates) {
        const covered = gate.requiredTestFiles.every((file) => members.has(file));
        coverage.push({
          directGateId: gate.gateId,
          disposition: covered ? "COVERED_BY_FULL_SUPERSET" : "DIRECT_GATE_PRESERVED",
          requiredTestFiles: gate.requiredTestFiles,
        });
        if (covered) deduplicatedGateIds.push(gate.gateId);
      }
      scheduledGateIds = allGateIds(gates).filter(
        (gateId) => !deduplicatedGateIds.includes(gateId),
      );
      if (deduplicatedGateIds.length !== directGates.length) {
        reasonCodes.push("PARTIAL_SUPERSET_MEMBERSHIP");
      }
    }
  }

  if (coverage.length === 0) {
    for (const gate of directGates) {
      coverage.push({
        directGateId: gate.gateId,
        disposition: "DIRECT_GATE_PRESERVED",
        requiredTestFiles: gate.requiredTestFiles,
      });
    }
  }

  const body = {
    coverage,
    deduplicatedGateIds,
    disposition,
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    fallbackGateIds: [...deduplicatedGateIds],
    gates,
    membershipProofIdentity,
    reasonCodes: [...new Set(reasonCodes)],
    request,
    scheduledGateIds,
    validationPlanId: planId,
  };
  return {
    ...body,
    schemaVersion: EXECUTION_PLAN_SCHEMA,
    executionPlanIdentity: executionPlanIdentity(body),
  };
}

function normalizeCoverage(value, gateIds) {
  if (!Array.isArray(value)) fail("EXECUTION_PLAN_INVALID");
  return value.map((entry) => {
    exactKeys(
      entry,
      ["directGateId", "disposition", "requiredTestFiles"],
      "EXECUTION_PLAN_INVALID",
    );
    const directGateId = string(entry.directGateId, "EXECUTION_PLAN_INVALID");
    if (!gateIds.has(directGateId)) fail("EXECUTION_PLAN_INVALID");
    if (!["COVERED_BY_FULL_SUPERSET", "DIRECT_GATE_PRESERVED"].includes(entry.disposition)) {
      fail("EXECUTION_PLAN_INVALID");
    }
    return {
      directGateId,
      disposition: entry.disposition,
      requiredTestFiles: testFiles(entry.requiredTestFiles, "EXECUTION_PLAN_INVALID"),
    };
  });
}

function normalizeExecutionPlan(value) {
  exactKeys(
    value,
    [
      "coverage",
      "deduplicatedGateIds",
      "disposition",
      "executionPlanIdentity",
      "factAuthority",
      "fallbackGateIds",
      "gates",
      "membershipProofIdentity",
      "reasonCodes",
      "request",
      "scheduledGateIds",
      "schemaVersion",
      "validationPlanId",
    ],
    "EXECUTION_PLAN_INVALID",
  );
  if (value.schemaVersion !== EXECUTION_PLAN_SCHEMA) fail("EXECUTION_PLAN_INVALID");
  if (value.factAuthority !== "NON_AUTHORITATIVE_INPUT") fail("EXECUTION_PLAN_INVALID");
  if (!["PLAN_READY", "DEFER_TO_CIC_I6"].includes(value.disposition)) {
    fail("EXECUTION_PLAN_INVALID");
  }
  if (!VALIDATION_PLAN_REQUESTS.includes(value.request)) fail("EXECUTION_PLAN_INVALID");
  const gates = normalizeGates(value.gates);
  const gateIds = new Set(gates.map(({ gateId }) => gateId));
  const scheduledGateIds = uniqueStrings(value.scheduledGateIds, "EXECUTION_PLAN_INVALID");
  const deduplicatedGateIds = uniqueStrings(value.deduplicatedGateIds, "EXECUTION_PLAN_INVALID");
  const fallbackGateIds = uniqueStrings(value.fallbackGateIds, "EXECUTION_PLAN_INVALID");
  if ([...scheduledGateIds, ...deduplicatedGateIds].some((gateId) => !gateIds.has(gateId))) {
    fail("EXECUTION_PLAN_INVALID");
  }
  if (scheduledGateIds.some((gateId) => deduplicatedGateIds.includes(gateId))) {
    fail("EXECUTION_PLAN_INVALID");
  }
  if (canonicalJson(fallbackGateIds) !== canonicalJson(deduplicatedGateIds)) {
    fail("EXECUTION_PLAN_INVALID");
  }
  const union = new Set([...scheduledGateIds, ...deduplicatedGateIds]);
  if (union.size !== gateIds.size || [...gateIds].some((gateId) => !union.has(gateId))) {
    fail("EXECUTION_PLAN_INVALID");
  }
  const directGateIds = new Set(
    gates.filter(({ kind }) => kind === "DIRECT").map(({ gateId }) => gateId),
  );
  if (deduplicatedGateIds.some((gateId) => !directGateIds.has(gateId))) {
    fail("EXECUTION_PLAN_INVALID");
  }
  const coverage = normalizeCoverage(value.coverage, gateIds);
  if (
    coverage.length !== directGateIds.size ||
    new Set(coverage.map(({ directGateId }) => directGateId)).size !== directGateIds.size ||
    coverage.some(({ directGateId }) => !directGateIds.has(directGateId))
  ) {
    fail("EXECUTION_PLAN_INVALID");
  }
  for (const entry of coverage) {
    const gate = gates.find(({ gateId }) => gateId === entry.directGateId);
    const covered = entry.disposition === "COVERED_BY_FULL_SUPERSET";
    if (
      covered !== deduplicatedGateIds.includes(entry.directGateId) ||
      canonicalJson(entry.requiredTestFiles) !== canonicalJson(gate.requiredTestFiles)
    ) {
      fail("EXECUTION_PLAN_INVALID");
    }
  }
  const membershipProofIdentity =
    value.membershipProofIdentity === null
      ? null
      : sha256(value.membershipProofIdentity, "EXECUTION_PLAN_INVALID");
  if ((deduplicatedGateIds.length !== 0) !== (membershipProofIdentity !== null)) {
    fail("EXECUTION_PLAN_INVALID");
  }
  const body = {
    coverage,
    deduplicatedGateIds,
    disposition: value.disposition,
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    fallbackGateIds,
    gates,
    membershipProofIdentity,
    reasonCodes: uniqueStrings(value.reasonCodes, "EXECUTION_PLAN_INVALID"),
    request: value.request,
    scheduledGateIds,
    validationPlanId: sha256(value.validationPlanId, "EXECUTION_PLAN_INVALID"),
  };
  if (
    sha256(value.executionPlanIdentity, "EXECUTION_PLAN_INVALID") !== executionPlanIdentity(body)
  ) {
    fail("EXECUTION_PLAN_INVALID");
  }
  return body;
}

function supersetResult(
  disposition,
  reasonCodes,
  { revalidationScope, requiredGateIds, governedPlanRebuildRequired = false, ...extra },
) {
  return {
    schemaVersion: SUPERSET_EXECUTION_SCHEMA,
    disposition,
    reasonCodes: [...new Set(reasonCodes)],
    factAuthority: "NON_AUTHORITATIVE_INPUT",
    revalidationScope,
    requiredGateIds,
    fallbackGateIds: requiredGateIds,
    governedPlanRebuildRequired,
    ...extra,
  };
}

function fullGovernedPlanResult(plan, disposition, reasonCodes, extra = {}) {
  return supersetResult(disposition, reasonCodes, {
    revalidationScope: "FULL_GOVERNED_PLAN",
    requiredGateIds: allGateIds(plan.gates),
    ...extra,
  });
}

function governedPlanRebuildResult(disposition, reasonCodes) {
  return supersetResult(disposition, reasonCodes, {
    revalidationScope: "FULL_GOVERNED_PLAN",
    requiredGateIds: null,
    governedPlanRebuildRequired: true,
  });
}

export function confirmSupersetExecution({ executionPlan, evidence, currentFacts }) {
  let plan;
  try {
    plan = normalizeExecutionPlan(executionPlan);
  } catch {
    return governedPlanRebuildResult("INVALID_EVIDENCE", ["EXECUTION_PLAN_INVALID"]);
  }
  if (plan.disposition !== "PLAN_READY") {
    return fullGovernedPlanResult(plan, "REVALIDATION_REQUIRED", ["EXECUTION_PLAN_NOT_READY"]);
  }
  const verification = evaluateValidationEvidence(evidence, currentFacts);
  if (verification.disposition !== "CURRENT") {
    return fullGovernedPlanResult(plan, verification.disposition, verification.reasonCodes);
  }
  const fullGates = plan.gates.filter(({ kind }) => kind === "FULL_SUITE");
  if (fullGates.length !== 1 || !plan.scheduledGateIds.includes(fullGates[0].gateId)) {
    return governedPlanRebuildResult("INVALID_EVIDENCE", ["FULL_SUITE_NOT_SCHEDULED"]);
  }
  const fullGate = fullGates[0];
  const command = evidence.commandIdentities.find(
    ({ commandId, identity: commandIdentity }) =>
      commandId === fullGate.gateId && commandIdentity === fullGate.commandIdentity,
  );
  if (!command) {
    return fullGovernedPlanResult(plan, "REVALIDATION_REQUIRED", ["FULL_SUITE_COMMAND_UNPROVEN"]);
  }
  const passedFiles = new Set(
    evidence.executedTestFiles
      .filter(({ result: fileResult }) => fileResult === "PASS")
      .map(({ path }) => path),
  );
  const required = plan.coverage
    .filter(
      ({ disposition: coverageDisposition }) => coverageDisposition === "COVERED_BY_FULL_SUPERSET",
    )
    .flatMap(({ requiredTestFiles }) => requiredTestFiles);
  const missing = [...new Set(required)].filter((file) => !passedFiles.has(file));
  if (missing.length === 0) {
    return supersetResult("CURRENT", [], {
      revalidationScope: "NONE",
      requiredGateIds: [],
      missingRequiredTestFiles: [],
    });
  }
  const missingSet = new Set(missing);
  const affectedDirectGateIds = plan.coverage
    .filter(
      ({ disposition: coverageDisposition, requiredTestFiles }) =>
        coverageDisposition === "COVERED_BY_FULL_SUPERSET" &&
        requiredTestFiles.some((file) => missingSet.has(file)),
    )
    .map(({ directGateId }) => directGateId);
  return supersetResult("REVALIDATION_REQUIRED", ["DIRECT_FILE_EXECUTION_UNPROVEN"], {
    revalidationScope: "FALLBACK_DIRECT_GATES",
    requiredGateIds: affectedDirectGateIds,
    missingRequiredTestFiles: missing,
  });
}

function phaseResult(phase, disposition, reasonCodes, separateProofsRequired = []) {
  return {
    schemaVersion: PHASE_RESULT_SCHEMA,
    phase,
    disposition,
    reasonCodes: [...new Set(reasonCodes)],
    requiresFullGovernedPlan: disposition !== "CURRENT",
    separateProofsRequired,
    factAuthority: "NON_AUTHORITATIVE_INPUT",
  };
}

function pair(value, left, right, code) {
  if (!isPlainObject(value)) return code;
  try {
    if (identity(value[left], code) !== identity(value[right], code)) return code;
  } catch {
    return code;
  }
  return null;
}

export function evaluatePhaseCarryForward({ phase, evidence, currentFacts, proof = {} }) {
  if (!VALIDATION_PHASES.includes(phase)) {
    return phaseResult("UNKNOWN", "INVALID_EVIDENCE", ["PHASE_INVALID"]);
  }
  const verification = evaluateValidationEvidence(evidence, currentFacts);
  if (verification.disposition !== "CURRENT") {
    return phaseResult(phase, verification.disposition, verification.reasonCodes);
  }
  if (phase === "IMPLEMENT_FIX") {
    return phaseResult(phase, "REVALIDATION_REQUIRED", [
      "MATERIAL_MUTATION_REQUIRES_NEW_BEHAVIOR_PROOF",
    ]);
  }
  if (phase === "NATURAL_CI") {
    return phaseResult(phase, "REVALIDATION_REQUIRED", ["FRESH_NATURAL_CI_REQUIRED"]);
  }

  const reasons = [];
  if (phase === "STAGE") {
    for (const [left, right, code] of [
      ["candidateIdentity", "stagedIdentity", "STAGE_BLOB_MISMATCH"],
      ["reviewedWriteTree", "stagedWriteTree", "STAGE_TREE_MISMATCH"],
      ["expectedPathIdentity", "stagedPathIdentity", "STAGE_PATH_MISMATCH"],
    ]) {
      const reason = pair(proof, left, right, code);
      if (reason) reasons.push(reason);
    }
  } else if (phase === "COMMIT") {
    for (const [left, right, code] of [
      ["reviewedWriteTree", "commitTree", "COMMIT_TREE_MISMATCH"],
      ["expectedParent", "commitParent", "COMMIT_PARENT_MISMATCH"],
      ["expectedSubjectIdentity", "commitSubjectIdentity", "COMMIT_SUBJECT_MISMATCH"],
      ["expectedPathBlobIdentity", "commitPathBlobIdentity", "COMMIT_PATH_BLOB_MISMATCH"],
    ]) {
      const reason = pair(proof, left, right, code);
      if (reason) reasons.push(reason);
    }
  } else if (phase === "PUSH_LOCAL") {
    for (const [left, right, code] of [
      ["validatedCommit", "localCommit", "LOCAL_COMMIT_MISMATCH"],
      ["remotePreimageExpected", "remotePreimageObserved", "REMOTE_PREIMAGE_MISMATCH"],
      ["localCommit", "remotePostimageObserved", "REMOTE_POSTIMAGE_MISMATCH"],
    ]) {
      const reason = pair(proof, left, right, code);
      if (reason) reasons.push(reason);
    }
    if (proof.fastForward !== true) reasons.push("FAST_FORWARD_UNPROVEN");
  } else if (phase === "CLOSURE") {
    for (const [left, right, code] of [
      ["acceptedLocalEvidenceIdentity", "currentLocalEvidenceIdentity", "LOCAL_EVIDENCE_MISMATCH"],
      [
        "acceptedHostedEvidenceIdentity",
        "currentHostedEvidenceIdentity",
        "HOSTED_EVIDENCE_MISMATCH",
      ],
      [
        "acceptedPublicationIdentity",
        "currentPublicationIdentity",
        "PUBLICATION_IDENTITY_MISMATCH",
      ],
    ]) {
      const reason = pair(proof, left, right, code);
      if (reason) reasons.push(reason);
    }
  }

  return phaseResult(
    phase,
    reasons.length === 0 ? "CURRENT" : "REVALIDATION_REQUIRED",
    reasons,
    phase === "PUSH_LOCAL" && reasons.length === 0 ? ["FRESH_NATURAL_CI"] : [],
  );
}
