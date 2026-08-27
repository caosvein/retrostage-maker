import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import {
  containsNonPortableContextText,
  isPortableContextIdentifier,
  normalizeNegativeKnowledgeWitness,
} from "./context-provider.mjs";

export const REQUIRED_CONTEXT_DIMENSIONS = Object.freeze([
  "architecture-boundaries",
  "dependency-license-effects",
  "diagnostics",
  "editor-player-preview-pie-export-responsibility",
  "imports-consumers",
  "negative-knowledge-witnesses",
  "owners",
  "package-environment-constraints",
  "persisted-schema-migrations",
  "semantic-neighbors",
  "tests",
]);

export const CONTEXT_DIMENSION_STATES = Object.freeze([
  "PRESENT",
  "ABSENT_PROVEN",
  "UNKNOWN",
  "NOT_APPLICABLE_WITH_REASON",
]);

const DIMENSION_STATE_SET = new Set(CONTEXT_DIMENSION_STATES);
const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function finding(code, dimension = null) {
  return dimension === null ? { code } : { code, dimension };
}

function inheritedFinding(rawFinding) {
  const result = { code: rawFinding.code };
  for (const key of ["dimension", "material", "requestId"]) {
    if (typeof rawFinding[key] === "string") result[key] = rawFinding[key];
  }
  return result;
}

function nonempty(value) {
  return typeof value === "string" && value.trim().length !== 0;
}

function identitiesValid(values) {
  return (
    Array.isArray(values) &&
    values.length > 0 &&
    values.every((value) => typeof value === "string" && IDENTITY_PATTERN.test(value)) &&
    new Set(values).size === values.length
  );
}

export function validateNegativeKnowledgeWitness(witness) {
  return normalizeNegativeKnowledgeWitness(witness) !== null;
}

function normalizeDimension(dimension) {
  const suppliedReason =
    dimension.state === "NOT_APPLICABLE_WITH_REASON" && typeof dimension.reason === "string"
      ? dimension.reason.trim()
      : null;
  const normalized = {
    dimension: dimension.dimension,
    state: dimension.state,
    materialIdentities: Array.isArray(dimension.materialIdentities)
      ? [...dimension.materialIdentities].sort(compareText)
      : [],
    reason:
      suppliedReason !== null && !containsNonPortableContextText(suppliedReason)
        ? suppliedReason
        : null,
    absenceWitness:
      dimension.state === "ABSENT_PROVEN"
        ? normalizeNegativeKnowledgeWitness(dimension.absenceWitness)
        : null,
  };
  if (normalized.reason !== null && normalized.reason.length !== 0) {
    normalized.reasonIdentity = sha256Hex(`CIC-CONTEXT-NOT-APPLICABLE-V1\n${normalized.reason}\n`);
  }
  return normalized;
}

export function evaluateContextClosure({
  dimensions = [],
  requiredDimensions,
  prerequisiteStatus = "PASS",
  providerResults = [],
  inheritedFindings = [],
} = {}) {
  const findings = inheritedFindings.map(inheritedFinding);
  if (prerequisiteStatus !== "PASS") findings.push(finding("I1_I2_PREREQUISITE_BLOCKED"));

  const suppliedRequiredDimensions = Array.isArray(requiredDimensions)
    ? requiredDimensions.filter(isPortableContextIdentifier)
    : [];
  if (
    requiredDimensions !== undefined &&
    (!Array.isArray(requiredDimensions) ||
      suppliedRequiredDimensions.length !== requiredDimensions.length ||
      REQUIRED_CONTEXT_DIMENSIONS.some(
        (requiredDimension) => !suppliedRequiredDimensions.includes(requiredDimension),
      ))
  ) {
    findings.push(finding("REQUIRED_DIMENSION_FLOOR_VIOLATION"));
  }
  const required = [
    ...new Set([...REQUIRED_CONTEXT_DIMENSIONS, ...suppliedRequiredDimensions]),
  ].sort(compareText);

  const validProviderAbsenceWitnesses = new Set();
  for (const result of providerResults) {
    if (result?.state === "ABSENT_PROVEN") {
      const witness = normalizeNegativeKnowledgeWitness(result.absenceWitness);
      if (witness === null || witness.providerIdentity !== result.providerIdentity) {
        findings.push(finding("NEGATIVE_KNOWLEDGE_UNDER_PROVEN"));
      } else {
        validProviderAbsenceWitnesses.add(canonicalJson(witness));
      }
    }
  }

  const normalizedDimensions = [];
  const seenDimensions = new Set();
  for (const rawDimension of dimensions) {
    if (
      !isPortableContextIdentifier(rawDimension?.dimension) ||
      seenDimensions.has(rawDimension.dimension)
    ) {
      findings.push(
        finding(
          "CONTEXT_IDENTITY_COLLISION",
          isPortableContextIdentifier(rawDimension?.dimension) ? rawDimension.dimension : null,
        ),
      );
      continue;
    }
    seenDimensions.add(rawDimension.dimension);
    const dimension = normalizeDimension(rawDimension);
    normalizedDimensions.push(dimension);
    if (!DIMENSION_STATE_SET.has(dimension.state)) {
      findings.push(finding("REQUIRED_DIMENSION_UNKNOWN", dimension.dimension));
    } else if (dimension.state === "UNKNOWN") {
      findings.push(finding("REQUIRED_DIMENSION_UNKNOWN", dimension.dimension));
    } else if (dimension.state === "PRESENT" && !identitiesValid(dimension.materialIdentities)) {
      findings.push(finding("REQUIRED_MATERIAL_MISSING", dimension.dimension));
    } else if (
      dimension.state === "ABSENT_PROVEN" &&
      (dimension.absenceWitness === null ||
        !validProviderAbsenceWitnesses.has(canonicalJson(dimension.absenceWitness)))
    ) {
      findings.push(finding("NEGATIVE_KNOWLEDGE_UNDER_PROVEN", dimension.dimension));
    } else if (dimension.state === "NOT_APPLICABLE_WITH_REASON" && !nonempty(dimension.reason)) {
      findings.push(finding("NOT_APPLICABLE_REASON_INVALID", dimension.dimension));
    }
  }

  for (const requiredDimension of required) {
    if (!seenDimensions.has(requiredDimension)) {
      findings.push(finding("REQUIRED_DIMENSION_MISSING", requiredDimension));
    }
  }

  for (const result of providerResults) {
    if (result?.state === "UNKNOWN") {
      findings.push(finding("PROVIDER_RESULT_UNKNOWN"));
    }
    if (Array.isArray(result?.findings)) {
      findings.push(...result.findings.map(({ code }) => finding(code)));
    }
  }

  normalizedDimensions.sort((left, right) => compareText(left.dimension, right.dimension));
  findings.sort((left, right) => compareText(canonicalJson(left), canonicalJson(right)));
  const semantic = { requiredDimensions: required, dimensions: normalizedDimensions, findings };
  return {
    schemaVersion: "CIC_CONTEXT_CLOSURE_V1",
    status: findings.length === 0 ? "COMPLETE" : "BLOCKED",
    ...semantic,
    closureFingerprint: sha256Hex(`CIC-CONTEXT-CLOSURE-V1\n${canonicalJson(semantic)}\n`),
  };
}
