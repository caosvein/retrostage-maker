/* global structuredClone */

import { canonicalJson } from "./canonical-json.mjs";
import { isPortableContextIdentifier } from "./context-provider.mjs";
import { sha256Hex } from "./identity.mjs";
import { inspectSemanticEvidence } from "./semantic-evidence.mjs";
import {
  verifyBoundSemanticProvider,
  verifySemanticProviderProjection,
} from "./semantic-provider.mjs";

const SCHEMA = "CIC_SEMANTIC_PROJECTION_SET_V1";
const IDENTITY = /^[0-9A-F]{64}$/u;
const LIMITS = Object.freeze({
  requestedRoots: 128,
  providers: 128,
  projectionSets: 128,
  records: 1024,
  dependencies: 8192,
  evidence: 4096,
});
const BINDING_KEYS = Object.freeze([
  "authorityIdentity",
  "contextGenerationIdentity",
  "repositoryIdentity",
  "repositorySnapshotIdentity",
  "sourceGenerationFingerprint",
  "taskContractIdentity",
  "taskIdentity",
  "taskMaterialFingerprint",
]);
const INPUT_KEYS = Object.freeze([
  "bindings",
  "evidence",
  "projectionSets",
  "providers",
  "requestedRoots",
]);
const OUTPUT_KEYS = Object.freeze([
  "authorityState",
  "bindings",
  "conflicts",
  "dependencyEdges",
  "evidenceIdentities",
  "limits",
  "presencePartitions",
  "projectionSetIdentity",
  "providers",
  "records",
  "requestedRoots",
  "schemaVersion",
  "status",
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

function requireIdentity(value, code = "SEMANTIC_PROJECTION_SET_INVALID") {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function requirePortable(value, code = "SEMANTIC_PROJECTION_SET_INVALID") {
  if (!isPortableContextIdentifier(value)) fail(code);
  return value;
}

function boundedArray(value, maximum, code = "SEMANTIC_PROJECTION_SET_INVALID") {
  if (!Array.isArray(value) || value.length > maximum) fail(code);
  return value;
}

function uniqueSorted(values, maximum, normalizer, code = "SEMANTIC_PROJECTION_SET_INVALID") {
  const result = boundedArray(values, maximum, code).map((value) => normalizer(value, code));
  result.sort(compare);
  if (new Set(result).size !== result.length) fail(code);
  return result;
}

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

function semanticIdentity(schema, body) {
  return sha256Hex(`${schema.replaceAll("_", "-")}\n${canonicalJson(body)}\n`);
}

function normalizeBindings(value) {
  exactKeys(value, BINDING_KEYS, "SEMANTIC_PROJECTION_SET_BINDINGS_INVALID");
  return Object.fromEntries(
    BINDING_KEYS.map((key) => [
      key,
      requireIdentity(value[key], "SEMANTIC_PROJECTION_SET_BINDINGS_INVALID"),
    ]),
  );
}

function normalizeProvider(value) {
  const provider = verifyBoundSemanticProvider(value);
  return {
    ownerIdentity: provider.ownerIdentity,
    providerIdentity: provider.providerIdentity,
    providerBindingIdentity: provider.providerBindingIdentity,
    authorityClaimIdentity: provider.authorityClaimIdentity,
    authorizationIdentity: provider.authorizationIdentity,
    currentTruthIdentity: provider.currentTruthIdentity,
    taskContractIdentity: provider.taskContractIdentity,
    semanticKinds: [...provider.semanticKinds],
  };
}

function normalizeEvidence(value) {
  const inspection = inspectSemanticEvidence(value);
  if (
    inspection.disposition === "INVALID" ||
    inspection.evidenceIdentity === null ||
    inspection.evidenceIdentity !== value.evidenceIdentity ||
    value.authorityState !== "UNPROVEN"
  ) {
    fail("SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID");
  }
  return {
    evidenceIdentity: value.evidenceIdentity,
    semanticKey: requirePortable(value.semanticKey, "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID"),
    semanticKind: requirePortable(value.semanticKind, "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID"),
    producerIdentity: requireIdentity(
      value.producerIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    providerBindingIdentity: requireIdentity(
      value.providerBindingIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    providerInputIdentity: requireIdentity(
      value.providerInputIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    presenceState: value.presenceState,
    materialIdentities: uniqueSorted(
      value.materialIdentities,
      LIMITS.evidence,
      requireIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    dependencyIdentities: uniqueSorted(
      value.dependencyIdentities,
      LIMITS.dependencies,
      requireIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    supportingEvidenceIdentities: uniqueSorted(
      value.supportingEvidenceIdentities,
      LIMITS.evidence,
      requireIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    authorityIdentity: requireIdentity(
      value.authorityIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    sourceGenerationFingerprint: requireIdentity(
      value.sourceGenerationFingerprint,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    repositoryIdentity: requireIdentity(
      value.repositoryIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    repositorySnapshotIdentity: requireIdentity(
      value.repositorySnapshotIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    taskIdentity: requireIdentity(value.taskIdentity, "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID"),
    taskContractIdentity: requireIdentity(
      value.taskContractIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    contextGenerationIdentity: requireIdentity(
      value.contextGenerationIdentity,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    taskMaterialFingerprint: requireIdentity(
      value.taskMaterialFingerprint,
      "SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID",
    ),
    absenceWitness: value.absenceWitness === null ? null : structuredClone(value.absenceWitness),
  };
}

function evidenceMatchesProjection(item, record, bindings) {
  const expectedMaterials = record.materialIdentity === null ? [] : [record.materialIdentity];
  const expectedDependencies = record.dependencies
    .map((dependency) => sha256Hex(`CIC-SEMANTIC-DEPENDENCY-V1\n${dependency}\n`))
    .sort(compare);
  return (
    item.semanticKey === record.semanticKey &&
    item.semanticKind === record.semanticKind &&
    item.producerIdentity === record.providerIdentity &&
    item.providerBindingIdentity === record.providerBindingIdentity &&
    item.providerInputIdentity === record.inputIdentity &&
    item.presenceState === record.presenceState &&
    canonicalJson(item.materialIdentities) === canonicalJson(expectedMaterials) &&
    canonicalJson(item.dependencyIdentities) === canonicalJson(expectedDependencies) &&
    canonicalJson(item.absenceWitness) === canonicalJson(record.absenceWitness) &&
    BINDING_KEYS.every((key) => item[key] === bindings[key])
  );
}

function normalizeProjectionEnvelope(value) {
  exactKeys(
    value,
    [
      "capability",
      "findings",
      "inputIdentity",
      "projectionSetIdentity",
      "providerBindingIdentity",
      "providerIdentity",
      "records",
      "schemaVersion",
      "status",
    ],
    "SEMANTIC_PROJECTION_SET_PROJECTION_INVALID",
  );
  if (
    value.schemaVersion !== "CIC_SEMANTIC_PROVIDER_PROJECTION_V1" ||
    !["UNPROVEN", "UNKNOWN"].includes(value.status)
  ) {
    fail("SEMANTIC_PROJECTION_SET_PROJECTION_INVALID");
  }
  const providerIdentity = requireIdentity(
    value.providerIdentity,
    "SEMANTIC_PROJECTION_SET_PROJECTION_INVALID",
  );
  const providerBindingIdentity = requireIdentity(
    value.providerBindingIdentity,
    "SEMANTIC_PROJECTION_SET_PROJECTION_INVALID",
  );
  const inputIdentity = requireIdentity(
    value.inputIdentity,
    "SEMANTIC_PROJECTION_SET_PROJECTION_INVALID",
  );
  const capability = requirePortable(
    value.capability,
    "SEMANTIC_PROJECTION_SET_PROJECTION_INVALID",
  );
  if (
    !Array.isArray(value.findings) ||
    value.findings.some((finding) => typeof finding !== "string")
  ) {
    fail("SEMANTIC_PROJECTION_SET_PROJECTION_INVALID");
  }
  const records = boundedArray(
    value.records,
    LIMITS.records,
    "SEMANTIC_PROJECTION_SET_PROJECTION_INVALID",
  ).map((record) => verifySemanticProviderProjection(record));
  const semantic = {
    providerIdentity,
    providerBindingIdentity,
    inputIdentity,
    capability,
    records,
  };
  const expectedIdentity = semanticIdentity("CIC_SEMANTIC_PROVIDER_PROJECTION_SET_V1", semantic);
  if (
    requireIdentity(value.projectionSetIdentity, "SEMANTIC_PROJECTION_SET_PROJECTION_INVALID") !==
    expectedIdentity
  ) {
    fail("SEMANTIC_PROJECTION_SET_PROJECTION_INVALID");
  }
  return { ...semantic, status: value.status };
}

function normalizeInput(input) {
  exactKeys(input, INPUT_KEYS, "SEMANTIC_PROJECTION_SET_INVALID");
  const requestedRoots = uniqueSorted(input.requestedRoots, LIMITS.requestedRoots, requirePortable);
  const bindings = normalizeBindings(input.bindings);
  const providers = boundedArray(input.providers, LIMITS.providers)
    .map(normalizeProvider)
    .sort((left, right) => compare(left.providerBindingIdentity, right.providerBindingIdentity));
  if (
    new Set(providers.map(({ providerBindingIdentity }) => providerBindingIdentity)).size !==
    providers.length
  ) {
    fail("SEMANTIC_PROJECTION_SET_PROVIDER_CONFLICT");
  }
  if (
    providers.some(
      (provider) =>
        provider.authorizationIdentity !== bindings.authorityIdentity ||
        provider.taskContractIdentity !== bindings.taskContractIdentity,
    )
  ) {
    fail("SEMANTIC_PROJECTION_SET_PROVIDER_BINDING_MISMATCH");
  }
  const providerMap = new Map(
    providers.map((provider) => [provider.providerBindingIdentity, provider]),
  );
  const evidence = boundedArray(input.evidence, LIMITS.evidence)
    .map(normalizeEvidence)
    .sort((left, right) => compare(left.evidenceIdentity, right.evidenceIdentity));
  if (new Set(evidence.map(({ evidenceIdentity }) => evidenceIdentity)).size !== evidence.length) {
    fail("SEMANTIC_PROJECTION_SET_EVIDENCE_INVALID");
  }
  const evidenceByProjection = new Map();
  const projectionRecords = [];
  for (const envelope of boundedArray(input.projectionSets, LIMITS.projectionSets).map(
    normalizeProjectionEnvelope,
  )) {
    const provider = providerMap.get(envelope.providerBindingIdentity);
    if (
      provider === undefined ||
      provider.providerIdentity !== envelope.providerIdentity ||
      envelope.records.length === 0
    ) {
      fail("SEMANTIC_PROJECTION_SET_PROVIDER_MISMATCH");
    }
    for (const record of envelope.records) {
      if (
        record.providerIdentity !== provider.providerIdentity ||
        record.providerBindingIdentity !== provider.providerBindingIdentity ||
        record.ownerIdentity !== provider.ownerIdentity ||
        record.inputIdentity !== envelope.inputIdentity ||
        !provider.semanticKinds.includes(record.semanticKind)
      ) {
        fail("SEMANTIC_PROJECTION_SET_PROVIDER_MISMATCH");
      }
      projectionRecords.push(record);
      evidenceByProjection.set(record.projectionIdentity, {
        evidenceIdentities: [],
        supportingEvidenceIdentities: [],
      });
    }
  }
  for (const item of evidence) {
    const matches = projectionRecords.filter((record) =>
      evidenceMatchesProjection(item, record, bindings),
    );
    if (matches.length !== 1) fail("SEMANTIC_PROJECTION_SET_EVIDENCE_MISMATCH");
    const lineage = evidenceByProjection.get(matches[0].projectionIdentity);
    lineage.evidenceIdentities.push(item.evidenceIdentity);
    lineage.supportingEvidenceIdentities.push(...item.supportingEvidenceIdentities);
  }
  if (projectionRecords.length > LIMITS.records) fail("SEMANTIC_PROJECTION_SET_BOUND_EXCEEDED");
  return { requestedRoots, bindings, providers, evidence, projectionRecords, evidenceByProjection };
}

function buildBody(input) {
  const normalized = normalizeInput(input);
  const records = normalized.projectionRecords
    .map((record) => ({
      semanticKey: record.semanticKey,
      semanticKind: record.semanticKind,
      presenceState: record.presenceState,
      ownerIdentity: record.ownerIdentity,
      providerIdentity: record.providerIdentity,
      providerBindingIdentity: record.providerBindingIdentity,
      inputIdentity: record.inputIdentity,
      projectionIdentity: record.projectionIdentity,
      evidenceIdentities: [
        ...new Set(
          normalized.evidenceByProjection.get(record.projectionIdentity).evidenceIdentities,
        ),
      ].sort(compare),
      supportingEvidenceIdentities: [
        ...new Set(
          normalized.evidenceByProjection.get(
            record.projectionIdentity,
          ).supportingEvidenceIdentities,
        ),
      ].sort(compare),
      materialIdentity: record.materialIdentity,
      dependencyKeys: [...record.dependencies].sort(compare),
    }))
    .sort((left, right) =>
      compare(
        `${left.semanticKey}\0${left.ownerIdentity}\0${left.providerIdentity}\0${left.projectionIdentity}`,
        `${right.semanticKey}\0${right.ownerIdentity}\0${right.providerIdentity}\0${right.projectionIdentity}`,
      ),
    );
  const dependencyEdges = [];
  for (const record of records) {
    for (const targetSemanticKey of record.dependencyKeys) {
      const edgeBody = {
        sourceSemanticKey: record.semanticKey,
        targetSemanticKey,
        originOwnerIdentity: record.ownerIdentity,
        originProviderIdentity: record.providerIdentity,
        originProviderBindingIdentity: record.providerBindingIdentity,
        originProviderInputIdentity: record.inputIdentity,
        originProjectionIdentity: record.projectionIdentity,
        originEvidenceIdentities: [...record.evidenceIdentities],
        originSupportingEvidenceIdentities: [...record.supportingEvidenceIdentities],
      };
      dependencyEdges.push({
        ...edgeBody,
        edgeIdentity: semanticIdentity("CIC_SEMANTIC_DEPENDENCY_EDGE_V1", edgeBody),
      });
    }
  }
  if (dependencyEdges.length > LIMITS.dependencies) fail("SEMANTIC_PROJECTION_SET_BOUND_EXCEEDED");
  dependencyEdges.sort((left, right) => compare(left.edgeIdentity, right.edgeIdentity));
  const byKey = new Map();
  for (const record of records) {
    const values = byKey.get(record.semanticKey) ?? [];
    values.push(record);
    byKey.set(record.semanticKey, values);
  }
  const conflicts = [];
  for (const [semanticKey, values] of byKey) {
    const owners = [...new Set(values.map(({ ownerIdentity }) => ownerIdentity))].sort(compare);
    const providers = [...new Set(values.map(({ providerIdentity }) => providerIdentity))].sort(
      compare,
    );
    const kinds = [...new Set(values.map(({ semanticKind }) => semanticKind))].sort(compare);
    if (values.length > 1) {
      const body = { semanticKey, owners, providers, semanticKinds: kinds };
      conflicts.push({
        ...body,
        conflictIdentity: semanticIdentity("CIC_SEMANTIC_OWNER_PROVIDER_CONFLICT_V1", body),
      });
    }
  }
  conflicts.sort((left, right) => compare(left.semanticKey, right.semanticKey));
  const presencePartitions = Object.fromEntries(
    ["PRESENT", "ABSENT_PROVEN", "UNKNOWN"].map((state) => [
      state,
      [
        ...new Set(
          records
            .filter(({ presenceState }) => presenceState === state)
            .map(({ semanticKey }) => semanticKey),
        ),
      ].sort(compare),
    ]),
  );
  return {
    schemaVersion: SCHEMA,
    status: "UNPROVEN",
    authorityState: "UNPROVEN",
    requestedRoots: normalized.requestedRoots,
    bindings: normalized.bindings,
    providers: normalized.providers,
    records,
    dependencyEdges,
    presencePartitions,
    conflicts,
    evidenceIdentities: normalized.evidence.map(({ evidenceIdentity }) => evidenceIdentity),
    limits: { ...LIMITS },
  };
}

export function buildSemanticProjectionSet(input) {
  const body = buildBody(input);
  return deepFreeze({ ...body, projectionSetIdentity: semanticIdentity(SCHEMA, body) });
}

export function verifySemanticProjectionSet(value) {
  exactKeys(value, OUTPUT_KEYS, "SEMANTIC_PROJECTION_SET_INVALID");
  if (
    value.schemaVersion !== SCHEMA ||
    value.status !== "UNPROVEN" ||
    value.authorityState !== "UNPROVEN"
  ) {
    fail("SEMANTIC_PROJECTION_SET_INVALID");
  }
  const body = { ...value };
  delete body.projectionSetIdentity;
  if (
    requireIdentity(value.projectionSetIdentity) !== semanticIdentity(SCHEMA, body) ||
    canonicalJson(value.limits) !== canonicalJson(LIMITS)
  ) {
    fail("SEMANTIC_PROJECTION_SET_IDENTITY_MISMATCH");
  }
  const bindings = normalizeBindings(value.bindings);
  const requestedRoots = uniqueSorted(value.requestedRoots, LIMITS.requestedRoots, requirePortable);
  if (canonicalJson(value.requestedRoots) !== canonicalJson(requestedRoots)) {
    fail("SEMANTIC_PROJECTION_SET_ORDER_INVALID");
  }
  const providers = boundedArray(value.providers, LIMITS.providers);
  for (const provider of providers) {
    exactKeys(
      provider,
      [
        "authorityClaimIdentity",
        "authorizationIdentity",
        "currentTruthIdentity",
        "ownerIdentity",
        "providerBindingIdentity",
        "providerIdentity",
        "semanticKinds",
        "taskContractIdentity",
      ],
      "SEMANTIC_PROJECTION_SET_INVALID",
    );
    for (const key of [
      "authorityClaimIdentity",
      "authorizationIdentity",
      "currentTruthIdentity",
      "ownerIdentity",
      "providerBindingIdentity",
      "providerIdentity",
      "taskContractIdentity",
    ]) {
      requireIdentity(provider[key]);
    }
    uniqueSorted(provider.semanticKinds, LIMITS.records, requirePortable);
  }
  if (
    providers.some(
      (provider) =>
        provider.authorizationIdentity !== bindings.authorityIdentity ||
        provider.taskContractIdentity !== bindings.taskContractIdentity,
    )
  ) {
    fail("SEMANTIC_PROJECTION_SET_PROVIDER_BINDING_MISMATCH");
  }
  const records = boundedArray(value.records, LIMITS.records);
  for (const record of records) {
    exactKeys(
      record,
      [
        "dependencyKeys",
        "evidenceIdentities",
        "inputIdentity",
        "materialIdentity",
        "ownerIdentity",
        "presenceState",
        "projectionIdentity",
        "providerBindingIdentity",
        "providerIdentity",
        "semanticKey",
        "semanticKind",
        "supportingEvidenceIdentities",
      ],
      "SEMANTIC_PROJECTION_SET_INVALID",
    );
    requirePortable(record.semanticKey);
    requirePortable(record.semanticKind);
    if (!["PRESENT", "ABSENT_PROVEN", "UNKNOWN"].includes(record.presenceState)) {
      fail("SEMANTIC_PROJECTION_SET_INVALID");
    }
    for (const key of [
      "ownerIdentity",
      "inputIdentity",
      "projectionIdentity",
      "providerBindingIdentity",
      "providerIdentity",
    ]) {
      requireIdentity(record[key]);
    }
    if (
      (record.presenceState === "UNKNOWN" && record.materialIdentity !== null) ||
      (record.presenceState !== "UNKNOWN" && record.materialIdentity === null)
    ) {
      fail("SEMANTIC_PROJECTION_SET_INVALID");
    }
    if (record.materialIdentity !== null) requireIdentity(record.materialIdentity);
    const dependencyKeys = uniqueSorted(
      record.dependencyKeys,
      LIMITS.dependencies,
      requirePortable,
    );
    const evidenceIdentities = uniqueSorted(
      record.evidenceIdentities,
      LIMITS.evidence,
      requireIdentity,
    );
    const supportingEvidenceIdentities = uniqueSorted(
      record.supportingEvidenceIdentities,
      LIMITS.evidence,
      requireIdentity,
    );
    if (
      canonicalJson(record.dependencyKeys) !== canonicalJson(dependencyKeys) ||
      canonicalJson(record.evidenceIdentities) !== canonicalJson(evidenceIdentities) ||
      canonicalJson(record.supportingEvidenceIdentities) !==
        canonicalJson(supportingEvidenceIdentities)
    ) {
      fail("SEMANTIC_PROJECTION_SET_ORDER_INVALID");
    }
  }
  const dependencyEdges = boundedArray(value.dependencyEdges, LIMITS.dependencies);
  for (const edge of dependencyEdges) {
    exactKeys(
      edge,
      [
        "edgeIdentity",
        "originEvidenceIdentities",
        "originOwnerIdentity",
        "originProviderBindingIdentity",
        "originProviderIdentity",
        "originProviderInputIdentity",
        "originProjectionIdentity",
        "originSupportingEvidenceIdentities",
        "sourceSemanticKey",
        "targetSemanticKey",
      ],
      "SEMANTIC_PROJECTION_SET_INVALID",
    );
    const edgeBody = {
      sourceSemanticKey: requirePortable(edge.sourceSemanticKey),
      targetSemanticKey: requirePortable(edge.targetSemanticKey),
      originOwnerIdentity: requireIdentity(edge.originOwnerIdentity),
      originProviderIdentity: requireIdentity(edge.originProviderIdentity),
      originProviderBindingIdentity: requireIdentity(edge.originProviderBindingIdentity),
      originProviderInputIdentity: requireIdentity(edge.originProviderInputIdentity),
      originProjectionIdentity: requireIdentity(edge.originProjectionIdentity),
      originEvidenceIdentities: uniqueSorted(
        edge.originEvidenceIdentities,
        LIMITS.evidence,
        requireIdentity,
      ),
      originSupportingEvidenceIdentities: uniqueSorted(
        edge.originSupportingEvidenceIdentities,
        LIMITS.evidence,
        requireIdentity,
      ),
    };
    if (
      canonicalJson(edge.originEvidenceIdentities) !==
        canonicalJson(edgeBody.originEvidenceIdentities) ||
      canonicalJson(edge.originSupportingEvidenceIdentities) !==
        canonicalJson(edgeBody.originSupportingEvidenceIdentities)
    ) {
      fail("SEMANTIC_PROJECTION_SET_ORDER_INVALID");
    }
    if (
      requireIdentity(edge.edgeIdentity) !==
      semanticIdentity("CIC_SEMANTIC_DEPENDENCY_EDGE_V1", edgeBody)
    ) {
      fail("SEMANTIC_PROJECTION_SET_EDGE_IDENTITY_MISMATCH");
    }
  }
  exactKeys(
    value.presencePartitions,
    ["ABSENT_PROVEN", "PRESENT", "UNKNOWN"],
    "SEMANTIC_PROJECTION_SET_INVALID",
  );
  for (const state of ["PRESENT", "ABSENT_PROVEN", "UNKNOWN"]) {
    uniqueSorted(value.presencePartitions[state], LIMITS.records, requirePortable);
  }
  for (const conflict of boundedArray(value.conflicts, LIMITS.records)) {
    exactKeys(
      conflict,
      ["conflictIdentity", "owners", "providers", "semanticKey", "semanticKinds"],
      "SEMANTIC_PROJECTION_SET_INVALID",
    );
    requirePortable(conflict.semanticKey);
    uniqueSorted(conflict.owners, LIMITS.providers, requireIdentity);
    uniqueSorted(conflict.providers, LIMITS.providers, requireIdentity);
    uniqueSorted(conflict.semanticKinds, LIMITS.records, requirePortable);
    const conflictBody = {
      semanticKey: conflict.semanticKey,
      owners: conflict.owners,
      providers: conflict.providers,
      semanticKinds: conflict.semanticKinds,
    };
    if (
      requireIdentity(conflict.conflictIdentity) !==
      semanticIdentity("CIC_SEMANTIC_OWNER_PROVIDER_CONFLICT_V1", conflictBody)
    ) {
      fail("SEMANTIC_PROJECTION_SET_CONFLICT_IDENTITY_MISMATCH");
    }
  }
  uniqueSorted(value.evidenceIdentities, LIMITS.evidence, requireIdentity);

  const expectedRecords = [...records].sort((left, right) =>
    compare(
      `${left.semanticKey}\0${left.ownerIdentity}\0${left.providerIdentity}\0${left.projectionIdentity}`,
      `${right.semanticKey}\0${right.ownerIdentity}\0${right.providerIdentity}\0${right.projectionIdentity}`,
    ),
  );
  const expectedProviders = [...providers].sort((left, right) =>
    compare(left.providerBindingIdentity, right.providerBindingIdentity),
  );
  if (
    canonicalJson(records) !== canonicalJson(expectedRecords) ||
    canonicalJson(providers) !== canonicalJson(expectedProviders)
  ) {
    fail("SEMANTIC_PROJECTION_SET_ORDER_INVALID");
  }

  const providerMap = new Map(
    providers.map((provider) => [provider.providerBindingIdentity, provider]),
  );
  const expectedEdges = [];
  for (const record of records) {
    const provider = providerMap.get(record.providerBindingIdentity);
    if (
      provider === undefined ||
      provider.providerIdentity !== record.providerIdentity ||
      provider.ownerIdentity !== record.ownerIdentity ||
      !provider.semanticKinds.includes(record.semanticKind)
    ) {
      fail("SEMANTIC_PROJECTION_SET_PROVIDER_MISMATCH");
    }
    for (const targetSemanticKey of record.dependencyKeys) {
      const edgeBody = {
        sourceSemanticKey: record.semanticKey,
        targetSemanticKey,
        originOwnerIdentity: record.ownerIdentity,
        originProviderIdentity: record.providerIdentity,
        originProviderBindingIdentity: record.providerBindingIdentity,
        originProviderInputIdentity: record.inputIdentity,
        originProjectionIdentity: record.projectionIdentity,
        originEvidenceIdentities: [...record.evidenceIdentities],
        originSupportingEvidenceIdentities: [...record.supportingEvidenceIdentities],
      };
      expectedEdges.push({
        ...edgeBody,
        edgeIdentity: semanticIdentity("CIC_SEMANTIC_DEPENDENCY_EDGE_V1", edgeBody),
      });
    }
  }
  expectedEdges.sort((left, right) => compare(left.edgeIdentity, right.edgeIdentity));
  if (canonicalJson(dependencyEdges) !== canonicalJson(expectedEdges)) {
    fail("SEMANTIC_PROJECTION_SET_EDGE_SET_MISMATCH");
  }

  const expectedPartitions = Object.fromEntries(
    ["PRESENT", "ABSENT_PROVEN", "UNKNOWN"].map((state) => [
      state,
      [
        ...new Set(
          records
            .filter(({ presenceState }) => presenceState === state)
            .map(({ semanticKey }) => semanticKey),
        ),
      ].sort(compare),
    ]),
  );
  if (canonicalJson(value.presencePartitions) !== canonicalJson(expectedPartitions)) {
    fail("SEMANTIC_PROJECTION_SET_PARTITION_MISMATCH");
  }

  const recordsByKey = new Map();
  for (const record of records) {
    const entries = recordsByKey.get(record.semanticKey) ?? [];
    entries.push(record);
    recordsByKey.set(record.semanticKey, entries);
  }
  const expectedConflicts = [];
  for (const [semanticKey, entries] of recordsByKey) {
    if (entries.length < 2) continue;
    const conflictBody = {
      semanticKey,
      owners: [...new Set(entries.map(({ ownerIdentity }) => ownerIdentity))].sort(compare),
      providers: [...new Set(entries.map(({ providerIdentity }) => providerIdentity))].sort(
        compare,
      ),
      semanticKinds: [...new Set(entries.map(({ semanticKind }) => semanticKind))].sort(compare),
    };
    expectedConflicts.push({
      ...conflictBody,
      conflictIdentity: semanticIdentity("CIC_SEMANTIC_OWNER_PROVIDER_CONFLICT_V1", conflictBody),
    });
  }
  expectedConflicts.sort((left, right) => compare(left.semanticKey, right.semanticKey));
  if (canonicalJson(value.conflicts) !== canonicalJson(expectedConflicts)) {
    fail("SEMANTIC_PROJECTION_SET_CONFLICT_SET_MISMATCH");
  }
  const expectedEvidence = [
    ...new Set(records.flatMap(({ evidenceIdentities }) => evidenceIdentities)),
  ].sort(compare);
  if (canonicalJson(value.evidenceIdentities) !== canonicalJson(expectedEvidence)) {
    fail("SEMANTIC_PROJECTION_SET_EVIDENCE_SET_MISMATCH");
  }
  return deepFreeze(structuredClone(value));
}
