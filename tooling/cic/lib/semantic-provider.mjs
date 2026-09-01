import { TextEncoder } from "node:util";

import { canonicalJson } from "./canonical-json.mjs";
import {
  isPortableContextIdentifier,
  normalizeNegativeKnowledgeWitness,
  portableProviderData,
} from "./context-provider.mjs";
import { sha256Hex } from "./identity.mjs";

const SEMANTIC_PROVIDER_REGISTRATION_SCHEMA = "CIC_SEMANTIC_PROVIDER_REGISTRATION_V1";
const SEMANTIC_PROVIDER_BINDING_SCHEMA = "CIC_SEMANTIC_PROVIDER_BINDING_V1";
const SEMANTIC_PROVIDER_PROJECTION_SCHEMA = "CIC_SEMANTIC_PROVIDER_PROJECTION_V1";
export const SEMANTIC_PRESENCE_STATES = Object.freeze(["PRESENT", "ABSENT_PROVEN", "UNKNOWN"]);

const IDENTITY = /^[0-9A-F]{64}$/u;
const MAX_CAPABILITIES = 128;
const MAX_RECORDS = 1024;
const MAX_DEPENDENCIES = 256;
const MAX_PAYLOAD_BYTES = 32 * 1024;

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

function identity(value, code) {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function portable(value, code) {
  if (!isPortableContextIdentifier(value)) fail(code);
  return value;
}

function uniquePortable(values, code, maximum = MAX_CAPABILITIES, allowEmpty = false) {
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0) || values.length > maximum) {
    fail(code);
  }
  const normalized = values.map((value) => portable(value, code)).sort(compare);
  if (new Set(normalized).size !== normalized.length) fail(code);
  return normalized;
}

function semanticIdentity(schema, body) {
  return sha256Hex(`${schema.replaceAll("_", "-")}\n${canonicalJson(body)}\n`);
}

function registrationBody(value) {
  return {
    schemaVersion: SEMANTIC_PROVIDER_REGISTRATION_SCHEMA,
    providerId: portable(value.providerId, "SEMANTIC_PROVIDER_REGISTRATION_INVALID"),
    providerVersion: portable(value.providerVersion, "SEMANTIC_PROVIDER_REGISTRATION_INVALID"),
    ownerIdentity: identity(value.ownerIdentity, "SEMANTIC_PROVIDER_REGISTRATION_INVALID"),
    capabilities: uniquePortable(value.capabilities, "SEMANTIC_PROVIDER_REGISTRATION_INVALID"),
    semanticKinds: uniquePortable(value.semanticKinds, "SEMANTIC_PROVIDER_REGISTRATION_INVALID"),
    schemaFloor: value.schemaFloor,
    policyFloor: value.policyFloor,
  };
}

function requireFloors(body, code) {
  if (
    !Number.isSafeInteger(body.schemaFloor) ||
    body.schemaFloor < 1 ||
    !Number.isSafeInteger(body.policyFloor) ||
    body.policyFloor < 1
  ) {
    fail(code);
  }
}

export function defineSemanticProviderRegistration(input) {
  if (!plain(input) || Object.values(input).some((value) => typeof value === "function")) {
    fail("SEMANTIC_PROVIDER_REGISTRATION_INVALID");
  }
  exactKeys(
    input,
    [
      "capabilities",
      "ownerIdentity",
      "policyFloor",
      "providerId",
      "providerVersion",
      "schemaFloor",
      "semanticKinds",
    ],
    "SEMANTIC_PROVIDER_REGISTRATION_INVALID",
  );
  const body = registrationBody(input);
  requireFloors(body, "SEMANTIC_PROVIDER_REGISTRATION_INVALID");
  return {
    ...body,
    registrationState: "RAW_UNADMITTED",
    providerIdentity: semanticIdentity(SEMANTIC_PROVIDER_REGISTRATION_SCHEMA, body),
  };
}

function normalizeRawRegistration(record) {
  exactKeys(
    record,
    [
      "capabilities",
      "ownerIdentity",
      "policyFloor",
      "providerId",
      "providerIdentity",
      "providerVersion",
      "registrationState",
      "schemaFloor",
      "schemaVersion",
      "semanticKinds",
    ],
    "SEMANTIC_PROVIDER_REGISTRATION_INVALID",
  );
  if (
    record.schemaVersion !== SEMANTIC_PROVIDER_REGISTRATION_SCHEMA ||
    record.registrationState !== "RAW_UNADMITTED"
  ) {
    fail("SEMANTIC_PROVIDER_REGISTRATION_INVALID");
  }
  const body = registrationBody(record);
  requireFloors(body, "SEMANTIC_PROVIDER_REGISTRATION_INVALID");
  if (
    identity(record.providerIdentity, "SEMANTIC_PROVIDER_IDENTITY_MISMATCH") !==
    semanticIdentity(SEMANTIC_PROVIDER_REGISTRATION_SCHEMA, body)
  ) {
    fail("SEMANTIC_PROVIDER_IDENTITY_MISMATCH");
  }
  return { ...body, providerIdentity: record.providerIdentity };
}

function normalizeAuthorityClaim(value) {
  exactKeys(
    value,
    [
      "authorityClaimIdentity",
      "authorityState",
      "authorizationIdentity",
      "authorizedSemanticOwnerSet",
      "currentTruthIdentity",
      "schemaVersion",
      "taskContractIdentity",
    ],
    "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
  );
  if (value.schemaVersion !== "CIC_I5_AUTHORITY_CLAIM_V1" || value.authorityState !== "UNPROVEN") {
    fail("SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN");
  }
  const body = {
    schemaVersion: value.schemaVersion,
    authorityState: "UNPROVEN",
    authorizationIdentity: identity(
      value.authorizationIdentity,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
    currentTruthIdentity: identity(
      value.currentTruthIdentity,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
    taskContractIdentity: identity(
      value.taskContractIdentity,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
    authorizedSemanticOwnerSet: uniquePortable(
      value.authorizedSemanticOwnerSet,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
  };
  if (
    identity(value.authorityClaimIdentity, "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN") !==
    semanticIdentity("CIC_I5_AUTHORITY_CLAIM_V1", body)
  ) {
    fail("SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN");
  }
  return { ...body, authorityClaimIdentity: value.authorityClaimIdentity };
}

export function verifySemanticAuthorityClaim(value) {
  return normalizeAuthorityClaim(value);
}

export function authorityClaimIdentity(input) {
  const body = {
    schemaVersion: "CIC_I5_AUTHORITY_CLAIM_V1",
    authorityState: "UNPROVEN",
    authorizationIdentity: identity(
      input.authorizationIdentity,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
    currentTruthIdentity: identity(
      input.currentTruthIdentity,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
    taskContractIdentity: identity(
      input.taskContractIdentity,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
    authorizedSemanticOwnerSet: uniquePortable(
      input.authorizedSemanticOwnerSet,
      "SEMANTIC_AUTHORITY_CONTEXT_UNPROVEN",
    ),
  };
  return semanticIdentity("CIC_I5_AUTHORITY_CLAIM_V1", body);
}

export function bindSemanticProviderRegistration(rawRegistration, authorityClaim) {
  const provider = normalizeRawRegistration(rawRegistration);
  const authority = normalizeAuthorityClaim(authorityClaim);
  if (!authority.authorizedSemanticOwnerSet.includes(provider.ownerIdentity)) {
    fail("SEMANTIC_OWNER_UNAUTHORIZED");
  }
  const body = {
    schemaVersion: SEMANTIC_PROVIDER_BINDING_SCHEMA,
    providerIdentity: provider.providerIdentity,
    ownerIdentity: provider.ownerIdentity,
    authorityClaimIdentity: authority.authorityClaimIdentity,
    authorizationIdentity: authority.authorizationIdentity,
    currentTruthIdentity: authority.currentTruthIdentity,
    taskContractIdentity: authority.taskContractIdentity,
  };
  return {
    ...provider,
    ...body,
    registrationState: "STRUCTURALLY_BOUND_UNPROVEN",
    authorityState: "UNPROVEN",
    providerBindingIdentity: semanticIdentity(SEMANTIC_PROVIDER_BINDING_SCHEMA, body),
  };
}

export function verifyBoundSemanticProvider(provider) {
  exactKeys(
    provider,
    [
      "authorityClaimIdentity",
      "authorityState",
      "authorizationIdentity",
      "capabilities",
      "currentTruthIdentity",
      "ownerIdentity",
      "policyFloor",
      "providerBindingIdentity",
      "providerId",
      "providerIdentity",
      "providerVersion",
      "registrationState",
      "schemaFloor",
      "schemaVersion",
      "semanticKinds",
      "taskContractIdentity",
    ],
    "SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN",
  );
  if (
    provider.schemaVersion !== SEMANTIC_PROVIDER_BINDING_SCHEMA ||
    provider.registrationState !== "STRUCTURALLY_BOUND_UNPROVEN" ||
    provider.authorityState !== "UNPROVEN"
  ) {
    fail("SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN");
  }
  const registration = normalizeRawRegistration({
    schemaVersion: SEMANTIC_PROVIDER_REGISTRATION_SCHEMA,
    providerId: provider.providerId,
    providerVersion: provider.providerVersion,
    ownerIdentity: provider.ownerIdentity,
    capabilities: provider.capabilities,
    semanticKinds: provider.semanticKinds,
    schemaFloor: provider.schemaFloor,
    policyFloor: provider.policyFloor,
    registrationState: "RAW_UNADMITTED",
    providerIdentity: provider.providerIdentity,
  });
  const admission = {
    schemaVersion: SEMANTIC_PROVIDER_BINDING_SCHEMA,
    providerIdentity: registration.providerIdentity,
    ownerIdentity: registration.ownerIdentity,
    authorityClaimIdentity: identity(
      provider.authorityClaimIdentity,
      "SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN",
    ),
    authorizationIdentity: identity(
      provider.authorizationIdentity,
      "SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN",
    ),
    currentTruthIdentity: identity(
      provider.currentTruthIdentity,
      "SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN",
    ),
    taskContractIdentity: identity(
      provider.taskContractIdentity,
      "SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN",
    ),
  };
  if (
    identity(provider.providerBindingIdentity, "SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN") !==
    semanticIdentity(SEMANTIC_PROVIDER_BINDING_SCHEMA, admission)
  ) {
    fail("SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN");
  }
  return {
    ...registration,
    ...admission,
    registrationState: "STRUCTURALLY_BOUND_UNPROVEN",
    authorityState: "UNPROVEN",
    providerBindingIdentity: provider.providerBindingIdentity,
  };
}

function projectionRecord(provider, inputIdentity, raw) {
  exactKeys(
    raw,
    [
      "absenceWitness",
      "dependencies",
      "materialIdentity",
      "payload",
      "presenceState",
      "semanticKey",
      "semanticKind",
    ],
    "SEMANTIC_PROVIDER_RESULT_INVALID",
  );
  const presenceState = raw.presenceState;
  if (!SEMANTIC_PRESENCE_STATES.includes(presenceState)) {
    fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  }
  const semanticKind = portable(raw.semanticKind, "SEMANTIC_PROVIDER_RESULT_INVALID");
  if (!provider.semanticKinds.includes(semanticKind)) fail("SEMANTIC_PROVIDER_CAPABILITY_MISSING");
  const dependencies = uniquePortable(
    raw.dependencies ?? [],
    "SEMANTIC_PROVIDER_RESULT_INVALID",
    MAX_DEPENDENCIES,
    true,
  );
  let payload = null;
  let materialIdentity = null;
  let absenceWitness = null;
  if (presenceState === "PRESENT") {
    materialIdentity = identity(raw.materialIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID");
    const normalized = portableProviderData(raw.payload);
    if (
      normalized.excluded.localPathValues !== 0 ||
      normalized.excluded.secretValues !== 0 ||
      canonicalJson(normalized.data) !== canonicalJson(raw.payload) ||
      new TextEncoder().encode(canonicalJson(normalized.data)).byteLength > MAX_PAYLOAD_BYTES
    ) {
      fail("SEMANTIC_PROVIDER_PAYLOAD_INVALID");
    }
    payload = normalized.data;
    if (raw.absenceWitness !== null) fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  } else if (presenceState === "ABSENT_PROVEN") {
    materialIdentity = identity(raw.materialIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID");
    absenceWitness = normalizeNegativeKnowledgeWitness(raw.absenceWitness);
    if (absenceWitness === null || absenceWitness.providerIdentity !== provider.providerIdentity) {
      fail("SEMANTIC_ABSENCE_WITNESS_INVALID");
    }
    if (raw.payload !== null) fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  } else if (raw.materialIdentity !== null || raw.payload !== null || raw.absenceWitness !== null) {
    fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  }
  const body = {
    schemaVersion: SEMANTIC_PROVIDER_PROJECTION_SCHEMA,
    providerIdentity: provider.providerIdentity,
    providerBindingIdentity: provider.providerBindingIdentity,
    ownerIdentity: provider.ownerIdentity,
    inputIdentity,
    semanticKey: portable(raw.semanticKey, "SEMANTIC_PROVIDER_RESULT_INVALID"),
    semanticKind,
    presenceState,
    materialIdentity,
    dependencies,
    payload,
    absenceWitness,
  };
  return {
    ...body,
    projectionIdentity: semanticIdentity(SEMANTIC_PROVIDER_PROJECTION_SCHEMA, body),
  };
}

export function verifySemanticProviderProjection(record) {
  exactKeys(
    record,
    [
      "absenceWitness",
      "dependencies",
      "inputIdentity",
      "materialIdentity",
      "ownerIdentity",
      "payload",
      "presenceState",
      "projectionIdentity",
      "providerBindingIdentity",
      "providerIdentity",
      "schemaVersion",
      "semanticKey",
      "semanticKind",
    ],
    "SEMANTIC_PROVIDER_RESULT_INVALID",
  );
  if (
    record.schemaVersion !== SEMANTIC_PROVIDER_PROJECTION_SCHEMA ||
    !SEMANTIC_PRESENCE_STATES.includes(record.presenceState)
  ) {
    fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  }
  const presenceState = record.presenceState;
  const providerIdentity = identity(record.providerIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID");
  let materialIdentity = null;
  let payload = null;
  let absenceWitness = null;
  if (presenceState === "PRESENT") {
    materialIdentity = identity(record.materialIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID");
    const normalized = portableProviderData(record.payload);
    if (
      normalized.excluded.localPathValues !== 0 ||
      normalized.excluded.secretValues !== 0 ||
      canonicalJson(normalized.data) !== canonicalJson(record.payload) ||
      new TextEncoder().encode(canonicalJson(normalized.data)).byteLength > MAX_PAYLOAD_BYTES ||
      record.absenceWitness !== null
    ) {
      fail("SEMANTIC_PROVIDER_PAYLOAD_INVALID");
    }
    payload = normalized.data;
  } else if (presenceState === "ABSENT_PROVEN") {
    materialIdentity = identity(record.materialIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID");
    absenceWitness = normalizeNegativeKnowledgeWitness(record.absenceWitness);
    if (
      absenceWitness === null ||
      absenceWitness.providerIdentity !== providerIdentity ||
      record.payload !== null
    ) {
      fail("SEMANTIC_ABSENCE_WITNESS_INVALID");
    }
  } else if (
    record.materialIdentity !== null ||
    record.payload !== null ||
    record.absenceWitness !== null
  ) {
    fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  }
  const body = {
    schemaVersion: SEMANTIC_PROVIDER_PROJECTION_SCHEMA,
    providerIdentity,
    providerBindingIdentity: identity(
      record.providerBindingIdentity,
      "SEMANTIC_PROVIDER_RESULT_INVALID",
    ),
    ownerIdentity: identity(record.ownerIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID"),
    inputIdentity: identity(record.inputIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID"),
    semanticKey: portable(record.semanticKey, "SEMANTIC_PROVIDER_RESULT_INVALID"),
    semanticKind: portable(record.semanticKind, "SEMANTIC_PROVIDER_RESULT_INVALID"),
    presenceState,
    materialIdentity,
    dependencies: uniquePortable(
      record.dependencies,
      "SEMANTIC_PROVIDER_RESULT_INVALID",
      MAX_DEPENDENCIES,
      true,
    ),
    payload,
    absenceWitness,
  };
  if (
    identity(record.projectionIdentity, "SEMANTIC_PROVIDER_RESULT_INVALID") !==
    semanticIdentity(SEMANTIC_PROVIDER_PROJECTION_SCHEMA, body)
  ) {
    fail("SEMANTIC_PROVIDER_RESULT_IDENTITY_MISMATCH");
  }
  return { ...body, projectionIdentity: record.projectionIdentity };
}

export function buildSemanticProviderProjection({ provider, inputIdentity, capability, records }) {
  const normalizedProvider = verifyBoundSemanticProvider(provider);
  identity(inputIdentity, "SEMANTIC_PROVIDER_INPUT_INVALID");
  const requestedCapability = portable(capability, "SEMANTIC_PROVIDER_INPUT_INVALID");
  if (!normalizedProvider.capabilities.includes(requestedCapability)) {
    return {
      schemaVersion: SEMANTIC_PROVIDER_PROJECTION_SCHEMA,
      status: "UNKNOWN",
      providerIdentity: normalizedProvider.providerIdentity,
      providerBindingIdentity: normalizedProvider.providerBindingIdentity,
      inputIdentity,
      capability: requestedCapability,
      records: [],
      findings: ["REQUIRED_PROVIDER_CAPABILITY_MISSING"],
      projectionSetIdentity: null,
    };
  }
  if (!Array.isArray(records) || records.length > MAX_RECORDS) {
    fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  }
  const normalized = records
    .map((record) => projectionRecord(normalizedProvider, inputIdentity, record))
    .sort((left, right) => compare(left.semanticKey, right.semanticKey));
  if (new Set(normalized.map(({ semanticKey }) => semanticKey)).size !== normalized.length) {
    fail("SEMANTIC_PROVIDER_RESULT_INVALID");
  }
  const semantic = {
    providerIdentity: normalizedProvider.providerIdentity,
    providerBindingIdentity: normalizedProvider.providerBindingIdentity,
    inputIdentity,
    capability: requestedCapability,
    records: normalized,
  };
  return {
    schemaVersion: SEMANTIC_PROVIDER_PROJECTION_SCHEMA,
    status: normalized.some(({ presenceState }) => presenceState === "UNKNOWN")
      ? "UNKNOWN"
      : "UNPROVEN",
    ...semantic,
    findings: normalized.some(({ presenceState }) => presenceState === "UNKNOWN")
      ? ["SEMANTIC_PROVIDER_REPORTED_UNKNOWN", "PHYSICAL_AUTHORITY_UNPROVEN"]
      : ["PHYSICAL_AUTHORITY_UNPROVEN"],
    projectionSetIdentity: semanticIdentity("CIC_SEMANTIC_PROVIDER_PROJECTION_SET_V1", semantic),
  };
}
