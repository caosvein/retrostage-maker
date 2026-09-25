import { canonicalJson } from "./canonical-json.mjs";
import { TARGETED_PRUNING_POLICY } from "./adaptive-validation-plan.mjs";
import { sha256Hex } from "./identity.mjs";

export const PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA = "CIC_PROOF_CLASS_CURRENTNESS_LEDGER_V1";
export const PROOF_CLASS_EVIDENCE_REFERENCE_SCHEMA = "CIC_PROOF_CLASS_EVIDENCE_REFERENCE_V1";
export const PROOF_CLASS_CURRENTNESS_DISPOSITIONS = Object.freeze([
  "CURRENT_FOR_SAME_PROOF_CLASS",
  "REVALIDATION_REQUIRED",
  "INVALID_OR_UNAVAILABLE",
]);
export const PROOF_CLASS_CURRENTNESS_REASON_CODES = Object.freeze([
  "CANDIDATE_IDENTITY_STALE",
  "CURRENT_TRUTH_STALE",
  "DUPLICATE_PROOF_CLASS",
  "ENVIRONMENT_IDENTITY_STALE",
  "EVIDENCE_IDENTITY_STALE",
  "EVIDENCE_NOT_APPLICABLE",
  "EVIDENCE_SUPERSEDED",
  "EVIDENCE_UNAVAILABLE",
  "KNOWN_CORRECTNESS_BLOCKER",
  "MANDATORY_WIDER_GATE_IDENTITY_STALE",
  "MATERIAL_IDENTITY_STALE",
  "PROOF_CLASS_CATALOG_STALE",
  "PROOF_CLASS_UNKNOWN",
  "REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN",
  "REPOSITORY_HEAD_STALE",
  "REPOSITORY_IDENTITY_STALE",
  "REPOSITORY_SNAPSHOT_STALE",
  "REPOSITORY_TREE_STALE",
  "REQUIRED_PROOF_CLASS_MISSING",
  "SOURCE_GENERATION_STALE",
  "SOURCE_MANIFEST_STALE",
  "TARGETED_PRUNING_POLICY_MISMATCH",
  "TOOLCHAIN_IDENTITY_STALE",
  "WORKTREE_STALE_OR_DIRTY",
]);

const IDENTITY = /^[0-9A-F]{64}$/u;
const CONTENT_IDENTITY = /^(?:[0-9a-f]{40}|[0-9A-F]{64})$/u;
const PROOF_CLASS_ID = /^[A-Z][A-Z0-9_]{0,127}$/u;
const AVAILABILITY = new Set(["AVAILABLE", "UNAVAILABLE", "UNKNOWN"]);
const INVALID_REASON_CODES = new Set([
  "DUPLICATE_PROOF_CLASS",
  "EVIDENCE_UNAVAILABLE",
  "PROOF_CLASS_UNKNOWN",
  "TARGETED_PRUNING_POLICY_MISMATCH",
]);
const GLOBAL_ONLY_REASON_CODES = new Set([
  "DUPLICATE_PROOF_CLASS",
  "PROOF_CLASS_UNKNOWN",
  "TARGETED_PRUNING_POLICY_MISMATCH",
]);
const PROOF_CLASS_REASON_CODES = new Set([
  "CANDIDATE_IDENTITY_STALE",
  "CURRENT_TRUTH_STALE",
  "ENVIRONMENT_IDENTITY_STALE",
  "EVIDENCE_IDENTITY_STALE",
  "EVIDENCE_NOT_APPLICABLE",
  "EVIDENCE_SUPERSEDED",
  "EVIDENCE_UNAVAILABLE",
  "KNOWN_CORRECTNESS_BLOCKER",
  "MANDATORY_WIDER_GATE_IDENTITY_STALE",
  "MATERIAL_IDENTITY_STALE",
  "PROOF_CLASS_CATALOG_STALE",
  "REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN",
  "REPOSITORY_HEAD_STALE",
  "REPOSITORY_IDENTITY_STALE",
  "REPOSITORY_SNAPSHOT_STALE",
  "REPOSITORY_TREE_STALE",
  "SOURCE_GENERATION_STALE",
  "SOURCE_MANIFEST_STALE",
  "TOOLCHAIN_IDENTITY_STALE",
  "WORKTREE_STALE_OR_DIRTY",
]);

function fail(code) {
  const error = new TypeError(code);
  error.code = code;
  throw error;
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

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const entry of Object.values(value)) deepFreeze(entry);
  }
  return value;
}

function identity(value, code) {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function nullableIdentity(value, code) {
  return value === null ? null : identity(value, code);
}

function contentIdentity(value, code) {
  if (typeof value !== "string" || !CONTENT_IDENTITY.test(value)) fail(code);
  return value;
}

function boolean(value, code) {
  if (typeof value !== "boolean") fail(code);
  return value;
}

function proofClassId(value, code) {
  if (typeof value !== "string" || !PROOF_CLASS_ID.test(value)) fail(code);
  return value;
}

function stableUnique(values, normalize, code) {
  if (!Array.isArray(values) || values.length === 0) fail(code);
  const normalized = values.map((value) => normalize(value, code)).sort(compare);
  if (new Set(normalized).size !== normalized.length) fail(code);
  return normalized;
}

function reasonCodes(values) {
  return [...new Set(values)].sort(compare);
}

function recordIdentity(schema, body) {
  return sha256Hex(`${schema}\n${canonicalJson(body)}\n`);
}

const CURRENT_KEYS = Object.freeze([
  "candidateIdentity",
  "currentTruthIdentity",
  "environmentIdentity",
  "mandatoryWiderGateIdentity",
  "materialIdentity",
  "remoteBindingIdentity",
  "repositoryHeadCommit",
  "repositoryHeadTree",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "sourceGenerationFingerprint",
  "sourceManifestIdentity",
  "toolchainIdentity",
  "worktreeClean",
  "worktreeIdentity",
]);

function normalizeCurrent(value, code) {
  exactKeys(value, CURRENT_KEYS, code);
  return {
    currentTruthIdentity: identity(value.currentTruthIdentity, code),
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint, code),
    sourceManifestIdentity: identity(value.sourceManifestIdentity, code),
    repositoryIdentity: identity(value.repositoryIdentity, code),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity, code),
    repositoryHeadCommit: contentIdentity(value.repositoryHeadCommit, code),
    repositoryHeadTree: contentIdentity(value.repositoryHeadTree, code),
    worktreeIdentity: identity(value.worktreeIdentity, code),
    worktreeClean: boolean(value.worktreeClean, code),
    remoteBindingIdentity: nullableIdentity(value.remoteBindingIdentity, code),
    candidateIdentity: identity(value.candidateIdentity, code),
    materialIdentity: identity(value.materialIdentity, code),
    environmentIdentity: identity(value.environmentIdentity, code),
    toolchainIdentity: identity(value.toolchainIdentity, code),
    mandatoryWiderGateIdentity: identity(value.mandatoryWiderGateIdentity, code),
  };
}

function normalizeEvidence(value) {
  const code = "PROOF_CLASS_EVIDENCE_REFERENCE_INVALID";
  exactKeys(
    value,
    [
      "applicable",
      "availability",
      "bindings",
      "evidenceIdentity",
      "expectedEvidenceIdentity",
      "knownCorrectnessBlocker",
      "proofClassCatalogIdentity",
      "proofClassId",
      "requiresRemote",
      "schemaVersion",
      "superseded",
    ],
    code,
  );
  if (value.schemaVersion !== PROOF_CLASS_EVIDENCE_REFERENCE_SCHEMA) fail(code);
  if (!AVAILABILITY.has(value.availability)) fail(code);
  return {
    schemaVersion: PROOF_CLASS_EVIDENCE_REFERENCE_SCHEMA,
    proofClassId: proofClassId(value.proofClassId, code),
    evidenceIdentity: identity(value.evidenceIdentity, code),
    expectedEvidenceIdentity: identity(value.expectedEvidenceIdentity, code),
    availability: value.availability,
    applicable: boolean(value.applicable, code),
    superseded: boolean(value.superseded, code),
    knownCorrectnessBlocker: boolean(value.knownCorrectnessBlocker, code),
    proofClassCatalogIdentity: identity(value.proofClassCatalogIdentity, code),
    requiresRemote: boolean(value.requiresRemote, code),
    bindings: normalizeCurrent(value.bindings, code),
  };
}

function compareBindings(evidence, current, proofClassCatalogIdentity) {
  const reasons = [];
  const bindings = evidence.bindings;
  if (bindings.currentTruthIdentity !== current.currentTruthIdentity) {
    reasons.push("CURRENT_TRUTH_STALE");
  }
  if (evidence.proofClassCatalogIdentity !== proofClassCatalogIdentity) {
    reasons.push("PROOF_CLASS_CATALOG_STALE");
  }
  if (bindings.sourceGenerationFingerprint !== current.sourceGenerationFingerprint) {
    reasons.push("SOURCE_GENERATION_STALE");
  }
  if (bindings.sourceManifestIdentity !== current.sourceManifestIdentity) {
    reasons.push("SOURCE_MANIFEST_STALE");
  }
  if (bindings.repositoryIdentity !== current.repositoryIdentity) {
    reasons.push("REPOSITORY_IDENTITY_STALE");
  }
  if (bindings.repositorySnapshotIdentity !== current.repositorySnapshotIdentity) {
    reasons.push("REPOSITORY_SNAPSHOT_STALE");
  }
  if (bindings.repositoryHeadCommit !== current.repositoryHeadCommit) {
    reasons.push("REPOSITORY_HEAD_STALE");
  }
  if (bindings.repositoryHeadTree !== current.repositoryHeadTree) {
    reasons.push("REPOSITORY_TREE_STALE");
  }
  if (
    bindings.worktreeIdentity !== current.worktreeIdentity ||
    bindings.worktreeClean !== true ||
    current.worktreeClean !== true
  ) {
    reasons.push("WORKTREE_STALE_OR_DIRTY");
  }
  if (
    evidence.requiresRemote &&
    (bindings.remoteBindingIdentity === null ||
      current.remoteBindingIdentity === null ||
      bindings.remoteBindingIdentity !== current.remoteBindingIdentity)
  ) {
    reasons.push("REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN");
  }
  if (bindings.candidateIdentity !== current.candidateIdentity) {
    reasons.push("CANDIDATE_IDENTITY_STALE");
  }
  if (bindings.materialIdentity !== current.materialIdentity) {
    reasons.push("MATERIAL_IDENTITY_STALE");
  }
  if (bindings.environmentIdentity !== current.environmentIdentity) {
    reasons.push("ENVIRONMENT_IDENTITY_STALE");
  }
  if (bindings.toolchainIdentity !== current.toolchainIdentity) {
    reasons.push("TOOLCHAIN_IDENTITY_STALE");
  }
  if (bindings.mandatoryWiderGateIdentity !== current.mandatoryWiderGateIdentity) {
    reasons.push("MANDATORY_WIDER_GATE_IDENTITY_STALE");
  }
  if (evidence.availability !== "AVAILABLE") reasons.push("EVIDENCE_UNAVAILABLE");
  if (evidence.evidenceIdentity !== evidence.expectedEvidenceIdentity) {
    reasons.push("EVIDENCE_IDENTITY_STALE");
  }
  if (!evidence.applicable) reasons.push("EVIDENCE_NOT_APPLICABLE");
  if (evidence.superseded) reasons.push("EVIDENCE_SUPERSEDED");
  if (evidence.knownCorrectnessBlocker) reasons.push("KNOWN_CORRECTNESS_BLOCKER");
  return reasonCodes(reasons);
}

function dispositionForReasons(reasons) {
  if (reasons.length === 0) return "CURRENT_FOR_SAME_PROOF_CLASS";
  if (reasons.some((reason) => INVALID_REASON_CODES.has(reason))) {
    return "INVALID_OR_UNAVAILABLE";
  }
  return "REVALIDATION_REQUIRED";
}

function validateSerializedProofClassFacts(entry, current, code) {
  const reasons = new Set(entry.reasonCodes);
  if (entry.evidenceIdentity === null) {
    if (
      entry.availability !== "UNKNOWN" ||
      entry.applicable !== false ||
      entry.requiresRemote !== false ||
      entry.disposition !== "REVALIDATION_REQUIRED" ||
      entry.reasonCodes.length !== 1 ||
      entry.reasonCodes[0] !== "REQUIRED_PROOF_CLASS_MISSING"
    ) {
      fail(code);
    }
    return;
  }
  if (
    reasons.has("REQUIRED_PROOF_CLASS_MISSING") ||
    entry.reasonCodes.some((reason) => !PROOF_CLASS_REASON_CODES.has(reason)) ||
    (entry.availability !== "AVAILABLE") !== reasons.has("EVIDENCE_UNAVAILABLE") ||
    (entry.applicable === false) !== reasons.has("EVIDENCE_NOT_APPLICABLE") ||
    (!entry.requiresRemote && reasons.has("REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN")) ||
    (entry.requiresRemote &&
      current.remoteBindingIdentity === null &&
      !reasons.has("REMOTE_OR_UPSTREAM_STALE_OR_UNKNOWN")) ||
    (!current.worktreeClean && !reasons.has("WORKTREE_STALE_OR_DIRTY"))
  ) {
    fail(code);
  }
}

function normalizeInput(input) {
  const code = "PROOF_CLASS_CURRENTNESS_INPUT_INVALID";
  exactKeys(
    input,
    [
      "current",
      "evidence",
      "knownProofClassIds",
      "proofClassCatalogIdentity",
      "requiredProofClassIds",
      "targetedPruning",
    ],
    code,
  );
  if (!Array.isArray(input.evidence)) fail(code);
  return {
    targetedPruning: input.targetedPruning,
    proofClassCatalogIdentity: identity(input.proofClassCatalogIdentity, code),
    knownProofClassIds: stableUnique(input.knownProofClassIds, proofClassId, code),
    requiredProofClassIds: stableUnique(input.requiredProofClassIds, proofClassId, code),
    current: normalizeCurrent(input.current, code),
    evidence: input.evidence.map(normalizeEvidence),
  };
}

function deriveBody(input) {
  const normalized = normalizeInput(input);
  const globalReasons = [];
  if (normalized.targetedPruning !== "OFF" || TARGETED_PRUNING_POLICY !== "OFF") {
    globalReasons.push("TARGETED_PRUNING_POLICY_MISMATCH");
  }
  const known = new Set(normalized.knownProofClassIds);
  if (normalized.requiredProofClassIds.some((proofClass) => !known.has(proofClass))) {
    globalReasons.push("PROOF_CLASS_UNKNOWN");
  }
  const counts = new Map();
  for (const entry of normalized.evidence) {
    counts.set(entry.proofClassId, (counts.get(entry.proofClassId) ?? 0) + 1);
    if (!known.has(entry.proofClassId)) globalReasons.push("PROOF_CLASS_UNKNOWN");
  }
  if ([...counts.values()].some((count) => count > 1)) {
    globalReasons.push("DUPLICATE_PROOF_CLASS");
  }

  const uniqueEvidence = new Map();
  for (const entry of normalized.evidence) {
    if (!uniqueEvidence.has(entry.proofClassId)) uniqueEvidence.set(entry.proofClassId, entry);
  }
  const proofClasses = [];
  for (const required of normalized.requiredProofClassIds) {
    const entry = uniqueEvidence.get(required);
    if (entry === undefined) {
      globalReasons.push("REQUIRED_PROOF_CLASS_MISSING");
      proofClasses.push({
        proofClassId: required,
        evidenceIdentity: null,
        availability: "UNKNOWN",
        applicable: false,
        requiresRemote: false,
        disposition: "REVALIDATION_REQUIRED",
        reasonCodes: ["REQUIRED_PROOF_CLASS_MISSING"],
      });
      continue;
    }
    const reasons = compareBindings(
      entry,
      normalized.current,
      normalized.proofClassCatalogIdentity,
    );
    proofClasses.push({
      proofClassId: required,
      evidenceIdentity: entry.evidenceIdentity,
      availability: entry.availability,
      applicable: entry.applicable,
      requiresRemote: entry.requiresRemote,
      disposition: dispositionForReasons(reasons),
      reasonCodes: reasons,
    });
  }
  proofClasses.sort((left, right) => compare(left.proofClassId, right.proofClassId));
  const allReasons = reasonCodes([
    ...globalReasons,
    ...proofClasses.flatMap(({ reasonCodes: reasons }) => reasons),
  ]);
  return {
    schemaVersion: PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    targetedPruning: "OFF",
    disposition: dispositionForReasons(allReasons),
    reasonCodes: allReasons,
    proofClassCatalogIdentity: normalized.proofClassCatalogIdentity,
    knownProofClassIds: normalized.knownProofClassIds,
    requiredProofClassIds: normalized.requiredProofClassIds,
    mandatoryWiderGateIdentity: normalized.current.mandatoryWiderGateIdentity,
    current: normalized.current,
    proofClasses,
  };
}

export function deriveProofClassCurrentnessLedger(input) {
  const body = deriveBody(input);
  return deepFreeze({
    ...body,
    ledgerIdentity: recordIdentity(PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA, body),
  });
}

function inputFromLedger(record) {
  const code = "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID";
  exactKeys(
    record,
    [
      "current",
      "disposition",
      "factAuthority",
      "knownProofClassIds",
      "ledgerIdentity",
      "mandatoryWiderGateIdentity",
      "mutationAuthorization",
      "proofClassCatalogIdentity",
      "proofClasses",
      "reasonCodes",
      "requiredProofClassIds",
      "schemaVersion",
      "targetedPruning",
    ],
    code,
  );
  if (
    record.schemaVersion !== PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA ||
    record.factAuthority !== "DERIVED_NON_AUTHORITATIVE" ||
    record.mutationAuthorization !== false ||
    record.targetedPruning !== "OFF" ||
    TARGETED_PRUNING_POLICY !== "OFF" ||
    !PROOF_CLASS_CURRENTNESS_DISPOSITIONS.includes(record.disposition)
  ) {
    fail(code);
  }
  const current = normalizeCurrent(record.current, code);
  if (current.mandatoryWiderGateIdentity !== record.mandatoryWiderGateIdentity) fail(code);
  const knownProofClassIds = stableUnique(record.knownProofClassIds, proofClassId, code);
  const requiredProofClassIds = stableUnique(record.requiredProofClassIds, proofClassId, code);
  if (
    !Array.isArray(record.proofClasses) ||
    record.proofClasses.length !== requiredProofClassIds.length
  ) {
    fail(code);
  }
  const proofClasses = record.proofClasses
    .map((entry) => {
      exactKeys(
        entry,
        [
          "applicable",
          "availability",
          "disposition",
          "evidenceIdentity",
          "proofClassId",
          "reasonCodes",
          "requiresRemote",
        ],
        code,
      );
      if (
        !AVAILABILITY.has(entry.availability) ||
        !PROOF_CLASS_CURRENTNESS_DISPOSITIONS.includes(entry.disposition) ||
        !Array.isArray(entry.reasonCodes) ||
        entry.reasonCodes.some((reason) => !PROOF_CLASS_CURRENTNESS_REASON_CODES.includes(reason))
      ) {
        fail(code);
      }
      const entryReasons = reasonCodes(entry.reasonCodes);
      if (entry.disposition !== dispositionForReasons(entryReasons)) fail(code);
      const normalizedEntry = {
        proofClassId: proofClassId(entry.proofClassId, code),
        evidenceIdentity:
          entry.evidenceIdentity === null ? null : identity(entry.evidenceIdentity, code),
        availability: entry.availability,
        applicable: boolean(entry.applicable, code),
        requiresRemote: boolean(entry.requiresRemote, code),
        disposition: entry.disposition,
        reasonCodes: entryReasons,
      };
      validateSerializedProofClassFacts(normalizedEntry, current, code);
      return normalizedEntry;
    })
    .sort((left, right) => compare(left.proofClassId, right.proofClassId));
  if (
    new Set(proofClasses.map(({ proofClassId: value }) => value)).size !== proofClasses.length ||
    canonicalJson(proofClasses.map(({ proofClassId: value }) => value)) !==
      canonicalJson(requiredProofClassIds)
  ) {
    fail(code);
  }
  const reasons = reasonCodes(record.reasonCodes);
  if (reasons.some((reason) => !PROOF_CLASS_CURRENTNESS_REASON_CODES.includes(reason))) fail(code);
  if (record.disposition !== dispositionForReasons(reasons)) fail(code);
  const aggregateReasons = new Set(reasons);
  if (
    proofClasses.some((entry) => entry.reasonCodes.some((reason) => !aggregateReasons.has(reason)))
  ) {
    fail(code);
  }
  const proofClassReasons = new Set(proofClasses.flatMap((entry) => entry.reasonCodes));
  if (
    reasons.some(
      (reason) => !proofClassReasons.has(reason) && !GLOBAL_ONLY_REASON_CODES.has(reason),
    ) ||
    (requiredProofClassIds.some((proofClass) => !knownProofClassIds.includes(proofClass)) &&
      !aggregateReasons.has("PROOF_CLASS_UNKNOWN"))
  ) {
    fail(code);
  }
  const body = {
    schemaVersion: PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA,
    factAuthority: "DERIVED_NON_AUTHORITATIVE",
    mutationAuthorization: false,
    targetedPruning: "OFF",
    disposition: record.disposition,
    reasonCodes: reasons,
    proofClassCatalogIdentity: identity(record.proofClassCatalogIdentity, code),
    knownProofClassIds,
    requiredProofClassIds,
    mandatoryWiderGateIdentity: identity(record.mandatoryWiderGateIdentity, code),
    current,
    proofClasses,
  };
  return body;
}

export function verifyProofClassCurrentnessLedger(record) {
  const body = inputFromLedger(record);
  const computed = recordIdentity(PROOF_CLASS_CURRENTNESS_LEDGER_SCHEMA, body);
  if (identity(record.ledgerIdentity, "PROOF_CLASS_CURRENTNESS_LEDGER_INVALID") !== computed) {
    fail("PROOF_CLASS_CURRENTNESS_LEDGER_IDENTITY_MISMATCH");
  }
  return deepFreeze({ ...body, ledgerIdentity: computed });
}
