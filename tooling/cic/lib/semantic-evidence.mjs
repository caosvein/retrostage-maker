import { TextEncoder } from "node:util";

import { canonicalJson } from "./canonical-json.mjs";
import {
  isPortableContextIdentifier,
  normalizeNegativeKnowledgeWitness,
  portableProviderData,
} from "./context-provider.mjs";
import { sha256Hex } from "./identity.mjs";
import {
  SEMANTIC_PRESENCE_STATES,
  verifyBoundSemanticProvider,
  verifySemanticProviderProjection,
} from "./semantic-provider.mjs";

const SEMANTIC_EVIDENCE_SCHEMA = "CIC_SEMANTIC_EVIDENCE_V1";

const IDENTITY = /^[0-9A-F]{64}$/u;
const MAX_OBSERVATION_BYTES = 32 * 1024;
const BODY_KEYS = Object.freeze([
  "absenceWitness",
  "authorityIdentity",
  "contextGenerationIdentity",
  "createdAs",
  "dependencyIdentities",
  "evidenceKind",
  "materialIdentities",
  "observation",
  "presenceState",
  "producerIdentity",
  "providerBindingIdentity",
  "providerInputIdentity",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "schemaVersion",
  "semanticKey",
  "semanticKind",
  "sourceGenerationFingerprint",
  "supportingEvidenceIdentities",
  "taskContractIdentity",
  "taskIdentity",
  "taskMaterialFingerprint",
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
  const actual = Object.keys(value).sort(compare);
  const expected = [...keys].sort(compare);
  if (canonicalJson(actual) !== canonicalJson(expected)) fail(code);
}

function identity(value, code = "SEMANTIC_EVIDENCE_INVALID") {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function portable(value, code = "SEMANTIC_EVIDENCE_INVALID") {
  if (!isPortableContextIdentifier(value)) fail(code);
  return value;
}

function identities(value, code = "SEMANTIC_EVIDENCE_INVALID") {
  if (!Array.isArray(value) || value.length > 1024) fail(code);
  const normalized = value.map((entry) => identity(entry, code)).sort(compare);
  if (new Set(normalized).size !== normalized.length) fail(code);
  return normalized;
}

function semanticIdentity(schema, body) {
  return sha256Hex(`${schema.replaceAll("_", "-")}\n${canonicalJson(body)}\n`);
}

function normalizeBody(value) {
  exactKeys(value, BODY_KEYS, "SEMANTIC_EVIDENCE_INVALID");
  if (
    value.schemaVersion !== SEMANTIC_EVIDENCE_SCHEMA ||
    value.createdAs !== "OBSERVATION" ||
    !SEMANTIC_PRESENCE_STATES.includes(value.presenceState)
  ) {
    fail("SEMANTIC_EVIDENCE_INVALID");
  }
  const portableObservation = portableProviderData(value.observation);
  if (
    portableObservation.excluded.localPathValues !== 0 ||
    portableObservation.excluded.secretValues !== 0 ||
    canonicalJson(portableObservation.data) !== canonicalJson(value.observation) ||
    new TextEncoder().encode(canonicalJson(portableObservation.data)).byteLength >
      MAX_OBSERVATION_BYTES
  ) {
    fail("SEMANTIC_EVIDENCE_INVALID");
  }
  const absenceWitness =
    value.presenceState === "ABSENT_PROVEN"
      ? normalizeNegativeKnowledgeWitness(value.absenceWitness)
      : null;
  if (
    (value.presenceState === "ABSENT_PROVEN" && absenceWitness === null) ||
    (value.presenceState !== "ABSENT_PROVEN" && value.absenceWitness !== null)
  ) {
    fail("SEMANTIC_ABSENCE_WITNESS_INVALID");
  }
  return {
    schemaVersion: SEMANTIC_EVIDENCE_SCHEMA,
    evidenceKind: portable(value.evidenceKind),
    producerIdentity: identity(value.producerIdentity),
    providerBindingIdentity: identity(value.providerBindingIdentity),
    providerInputIdentity: identity(value.providerInputIdentity),
    authorityIdentity: identity(value.authorityIdentity),
    semanticKey: portable(value.semanticKey),
    semanticKind: portable(value.semanticKind),
    presenceState: value.presenceState,
    sourceGenerationFingerprint: identity(value.sourceGenerationFingerprint),
    repositoryIdentity: identity(value.repositoryIdentity),
    repositorySnapshotIdentity: identity(value.repositorySnapshotIdentity),
    taskIdentity: identity(value.taskIdentity),
    taskContractIdentity: identity(value.taskContractIdentity),
    contextGenerationIdentity: identity(value.contextGenerationIdentity),
    taskMaterialFingerprint: identity(value.taskMaterialFingerprint),
    materialIdentities: identities(value.materialIdentities),
    dependencyIdentities: identities(value.dependencyIdentities),
    supportingEvidenceIdentities: identities(value.supportingEvidenceIdentities),
    absenceWitness,
    observation: portableObservation.data,
    createdAs: "OBSERVATION",
  };
}

export function buildSemanticEvidence(input) {
  if (!plain(input) || !plain(input.projection) || !plain(input.bindings)) {
    fail("SEMANTIC_EVIDENCE_INVALID");
  }
  const projection = verifySemanticProviderProjection(input.projection);
  const materialIdentities =
    projection.materialIdentity === null ? [] : [projection.materialIdentity];
  const body = normalizeBody({
    schemaVersion: SEMANTIC_EVIDENCE_SCHEMA,
    evidenceKind: input.evidenceKind,
    producerIdentity: projection.providerIdentity,
    providerBindingIdentity: projection.providerBindingIdentity,
    providerInputIdentity: projection.inputIdentity,
    authorityIdentity: input.bindings.authorityIdentity,
    semanticKey: projection.semanticKey,
    semanticKind: projection.semanticKind,
    presenceState: projection.presenceState,
    sourceGenerationFingerprint: input.bindings.sourceGenerationFingerprint,
    repositoryIdentity: input.bindings.repositoryIdentity,
    repositorySnapshotIdentity: input.bindings.repositorySnapshotIdentity,
    taskIdentity: input.bindings.taskIdentity,
    taskContractIdentity: input.bindings.taskContractIdentity,
    contextGenerationIdentity: input.bindings.contextGenerationIdentity,
    taskMaterialFingerprint: input.bindings.taskMaterialFingerprint,
    materialIdentities,
    dependencyIdentities: (projection.dependencies ?? []).map((dependency) =>
      sha256Hex(`CIC-SEMANTIC-DEPENDENCY-V1\n${dependency}\n`),
    ),
    supportingEvidenceIdentities: input.supportingEvidenceIdentities ?? [],
    absenceWitness: projection.absenceWitness,
    observation: projection.payload,
    createdAs: "OBSERVATION",
  });
  return {
    ...body,
    evidenceIdentity: semanticIdentity(SEMANTIC_EVIDENCE_SCHEMA, body),
    authorityState: "UNPROVEN",
  };
}

function normalizeEvidenceRecord(record) {
  exactKeys(
    record,
    [...BODY_KEYS, "authorityState", "evidenceIdentity"],
    "SEMANTIC_EVIDENCE_INVALID",
  );
  if (record.authorityState !== "UNPROVEN") fail("SEMANTIC_EVIDENCE_INVALID");
  const bodyInput = { ...record };
  delete bodyInput.evidenceIdentity;
  delete bodyInput.authorityState;
  const body = normalizeBody(bodyInput);
  if (identity(record.evidenceIdentity) !== semanticIdentity(SEMANTIC_EVIDENCE_SCHEMA, body)) {
    fail("SEMANTIC_EVIDENCE_IDENTITY_MISMATCH");
  }
  if (
    body.presenceState === "ABSENT_PROVEN" &&
    body.absenceWitness.providerIdentity !== body.producerIdentity
  ) {
    fail("SEMANTIC_ABSENCE_WITNESS_INVALID");
  }
  return { body, evidenceIdentity: record.evidenceIdentity };
}

export function inspectSemanticEvidence(record) {
  try {
    const normalized = normalizeEvidenceRecord(record);
    return {
      disposition: "UNKNOWN",
      reasonCodes: ["EVIDENCE_AUTHORITY_UNPROVEN"],
      evidenceIdentity: normalized.evidenceIdentity,
      authorityState: "UNPROVEN",
    };
  } catch (error) {
    return {
      disposition: "INVALID",
      reasonCodes: [error?.code ?? "SEMANTIC_EVIDENCE_INVALID"],
      evidenceIdentity: null,
      authorityState: "UNPROVEN",
    };
  }
}

function normalizeCurrentFacts(value) {
  exactKeys(
    value,
    [
      "absenceWitnessExpectation",
      "authorityIdentity",
      "contextGenerationIdentity",
      "currentMaterialIdentities",
      "providerInputIdentity",
      "repositoryIdentity",
      "repositorySnapshotIdentity",
      "repositoryView",
      "schemaVersion",
      "sourceGenerationFingerprint",
      "taskContractIdentity",
      "taskIdentity",
      "taskMaterialFingerprint",
    ],
    "SEMANTIC_CURRENT_FACTS_UNKNOWN",
  );
  exactKeys(value.repositoryView, ["complete", "shallow"], "SEMANTIC_CURRENT_FACTS_UNKNOWN");
  if (
    value.schemaVersion !== "CIC_I5_SEMANTIC_CURRENT_FACTS_V1" ||
    value.repositoryView.complete !== true ||
    value.repositoryView.shallow !== false
  ) {
    fail("SEMANTIC_CURRENT_FACTS_UNKNOWN");
  }
  const absenceWitnessExpectation =
    value.absenceWitnessExpectation === null
      ? null
      : normalizeNegativeKnowledgeWitness(value.absenceWitnessExpectation);
  if (value.absenceWitnessExpectation !== null && absenceWitnessExpectation === null) {
    fail("SEMANTIC_CURRENT_FACTS_UNKNOWN");
  }
  return {
    absenceWitnessExpectation,
    authorityIdentity: identity(value.authorityIdentity, "SEMANTIC_CURRENT_FACTS_UNKNOWN"),
    contextGenerationIdentity: identity(
      value.contextGenerationIdentity,
      "SEMANTIC_CURRENT_FACTS_UNKNOWN",
    ),
    currentMaterialIdentities: identities(
      value.currentMaterialIdentities,
      "SEMANTIC_CURRENT_FACTS_UNKNOWN",
    ),
    providerInputIdentity: identity(value.providerInputIdentity, "SEMANTIC_CURRENT_FACTS_UNKNOWN"),
    repositoryIdentity: identity(value.repositoryIdentity, "SEMANTIC_CURRENT_FACTS_UNKNOWN"),
    repositorySnapshotIdentity: identity(
      value.repositorySnapshotIdentity,
      "SEMANTIC_CURRENT_FACTS_UNKNOWN",
    ),
    sourceGenerationFingerprint: identity(
      value.sourceGenerationFingerprint,
      "SEMANTIC_CURRENT_FACTS_UNKNOWN",
    ),
    taskContractIdentity: identity(value.taskContractIdentity, "SEMANTIC_CURRENT_FACTS_UNKNOWN"),
    taskIdentity: identity(value.taskIdentity, "SEMANTIC_CURRENT_FACTS_UNKNOWN"),
    taskMaterialFingerprint: identity(
      value.taskMaterialFingerprint,
      "SEMANTIC_CURRENT_FACTS_UNKNOWN",
    ),
  };
}

export function evaluateSemanticEvidence(record, { boundProvider, currentFacts } = {}) {
  let normalized;
  let current;
  try {
    normalized = normalizeEvidenceRecord(record);
    current = normalizeCurrentFacts(currentFacts);
  } catch (error) {
    return {
      disposition: error?.code === "SEMANTIC_CURRENT_FACTS_UNKNOWN" ? "UNKNOWN" : "INVALID",
      assessment: "UNPROVEN",
      reasonCodes: [error?.code ?? "SEMANTIC_EVIDENCE_INVALID"],
      evidenceIdentity: null,
      authorityState: "UNPROVEN",
    };
  }
  const body = normalized.body;
  let provider;
  try {
    provider = verifyBoundSemanticProvider(boundProvider);
  } catch {
    provider = null;
  }
  if (
    provider === null ||
    provider.providerIdentity !== body.producerIdentity ||
    provider.providerBindingIdentity !== body.providerBindingIdentity ||
    provider.authorizationIdentity !== body.authorityIdentity ||
    provider.taskContractIdentity !== body.taskContractIdentity
  ) {
    return {
      disposition: "UNKNOWN",
      assessment: "UNPROVEN",
      reasonCodes: ["EVIDENCE_AUTHORITY_UNPROVEN"],
      evidenceIdentity: normalized.evidenceIdentity,
      authorityState: "UNPROVEN",
    };
  }
  if (body.presenceState === "UNKNOWN") {
    return {
      disposition: "UNKNOWN",
      assessment: "SEMANTIC_PRESENCE_UNKNOWN",
      reasonCodes: ["SEMANTIC_PRESENCE_UNKNOWN"],
      evidenceIdentity: normalized.evidenceIdentity,
      authorityState: "UNPROVEN",
    };
  }
  const stale = [];
  for (const [field, code] of [
    ["authorityIdentity", "AUTHORIZATION_STALE"],
    ["sourceGenerationFingerprint", "SOURCE_GENERATION_STALE"],
    ["repositoryIdentity", "REPOSITORY_IDENTITY_STALE"],
    ["repositorySnapshotIdentity", "REPOSITORY_SNAPSHOT_STALE"],
    ["taskIdentity", "TASK_IDENTITY_STALE"],
    ["taskContractIdentity", "TASK_CONTRACT_STALE"],
    ["contextGenerationIdentity", "CONTEXT_GENERATION_STALE"],
    ["taskMaterialFingerprint", "TASK_MATERIAL_STALE"],
    ["providerInputIdentity", "PROVIDER_INPUT_STALE"],
  ]) {
    if (body[field] !== current[field]) stale.push(code);
  }
  if (stale.length !== 0) {
    return {
      disposition: "STALE",
      assessment: "STALE_MATCH",
      reasonCodes: stale,
      evidenceIdentity: normalized.evidenceIdentity,
      authorityState: "UNPROVEN",
    };
  }
  if (
    body.materialIdentities.some(
      (materialIdentity) => !current.currentMaterialIdentities.includes(materialIdentity),
    )
  ) {
    return {
      disposition: "INVALID",
      assessment: "MATERIAL_MISMATCH",
      reasonCodes: ["EVIDENCE_MATERIAL_MISMATCH"],
      evidenceIdentity: normalized.evidenceIdentity,
      authorityState: "UNPROVEN",
    };
  }
  if (body.presenceState === "ABSENT_PROVEN") {
    if (
      current.absenceWitnessExpectation === null ||
      canonicalJson(body.absenceWitness) !== canonicalJson(current.absenceWitnessExpectation)
    ) {
      return {
        disposition: "UNKNOWN",
        assessment: "ABSENCE_WITNESS_REPLAY_OR_UNBOUND",
        reasonCodes: ["ABSENCE_WITNESS_CURRENTNESS_UNPROVEN"],
        evidenceIdentity: normalized.evidenceIdentity,
        authorityState: "UNPROVEN",
      };
    }
    return {
      disposition: "UNKNOWN",
      assessment: "ABSENCE_WITNESS_MATCH_UNPROVEN",
      reasonCodes: ["PHYSICAL_ABSENCE_WITNESS_UNPROVEN"],
      evidenceIdentity: normalized.evidenceIdentity,
      authorityState: "UNPROVEN",
    };
  }
  return {
    disposition: "UNKNOWN",
    assessment: "CURRENTNESS_MATCH",
    reasonCodes: ["PHYSICAL_CURRENT_TRUTH_UNPROVEN"],
    evidenceIdentity: normalized.evidenceIdentity,
    authorityState: "UNPROVEN",
  };
}
