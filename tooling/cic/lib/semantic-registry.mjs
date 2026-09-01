import { canonicalJson } from "./canonical-json.mjs";
import { evaluateSemanticEvidence } from "./semantic-evidence.mjs";
import { sha256Hex } from "./identity.mjs";
import { verifyBoundSemanticProvider, verifySemanticAuthorityClaim } from "./semantic-provider.mjs";

const SEMANTIC_OWNER_REGISTRATION_SCHEMA = "CIC_SEMANTIC_OWNER_REGISTRATION_V1";
const SEMANTIC_OWNER_BINDING_SCHEMA = "CIC_SEMANTIC_OWNER_BINDING_V1";
const SEMANTIC_REGISTRY_SCHEMA = "CIC_SEMANTIC_REGISTRY_V1";

const IDENTITY = /^[0-9A-F]{64}$/u;
const PORTABLE = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,127}$/u;

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
  if (canonicalJson(Object.keys(value).sort(compare)) !== canonicalJson([...keys].sort(compare))) {
    fail(code);
  }
}

function identity(value, code) {
  if (typeof value !== "string" || !IDENTITY.test(value)) fail(code);
  return value;
}

function portable(value, code) {
  if (typeof value !== "string" || !PORTABLE.test(value)) fail(code);
  return value;
}

function portableList(value, code) {
  if (!Array.isArray(value) || value.length === 0 || value.length > 128) fail(code);
  const normalized = value.map((entry) => portable(entry, code)).sort(compare);
  if (new Set(normalized).size !== normalized.length) fail(code);
  return normalized;
}

function floor(value, code) {
  if (!Number.isSafeInteger(value) || value < 1) fail(code);
  return value;
}

function semanticIdentity(schema, body) {
  return sha256Hex(`${schema.replaceAll("_", "-")}\n${canonicalJson(body)}\n`);
}

function ownerBody(value) {
  return {
    schemaVersion: SEMANTIC_OWNER_REGISTRATION_SCHEMA,
    ownerId: portable(value.ownerId, "SEMANTIC_OWNER_REGISTRATION_INVALID"),
    semanticKinds: portableList(value.semanticKinds, "SEMANTIC_OWNER_REGISTRATION_INVALID"),
    schemaFloor: floor(value.schemaFloor, "SEMANTIC_OWNER_REGISTRATION_INVALID"),
    policyFloor: floor(value.policyFloor, "SEMANTIC_OWNER_REGISTRATION_INVALID"),
  };
}

export function defineSemanticOwnerRegistration(input) {
  exactKeys(
    input,
    ["ownerId", "policyFloor", "schemaFloor", "semanticKinds"],
    "SEMANTIC_OWNER_REGISTRATION_INVALID",
  );
  const body = ownerBody(input);
  return {
    ...body,
    registrationState: "RAW_UNADMITTED",
    ownerIdentity: semanticIdentity(SEMANTIC_OWNER_REGISTRATION_SCHEMA, body),
  };
}

function normalizeRawOwner(record) {
  exactKeys(
    record,
    [
      "ownerId",
      "ownerIdentity",
      "policyFloor",
      "registrationState",
      "schemaFloor",
      "schemaVersion",
      "semanticKinds",
    ],
    "SEMANTIC_OWNER_REGISTRATION_INVALID",
  );
  if (
    record.schemaVersion !== SEMANTIC_OWNER_REGISTRATION_SCHEMA ||
    record.registrationState !== "RAW_UNADMITTED"
  ) {
    fail("SEMANTIC_OWNER_REGISTRATION_INVALID");
  }
  const body = ownerBody(record);
  if (
    identity(record.ownerIdentity, "SEMANTIC_OWNER_IDENTITY_MISMATCH") !==
    semanticIdentity(SEMANTIC_OWNER_REGISTRATION_SCHEMA, body)
  ) {
    fail("SEMANTIC_OWNER_IDENTITY_MISMATCH");
  }
  return { ...body, ownerIdentity: record.ownerIdentity };
}

export function bindSemanticOwnerRegistration(rawRegistration, authorityClaim) {
  const owner = normalizeRawOwner(rawRegistration);
  const authority = verifySemanticAuthorityClaim(authorityClaim);
  if (!authority.authorizedSemanticOwnerSet.includes(owner.ownerIdentity)) {
    fail("SEMANTIC_OWNER_UNAUTHORIZED");
  }
  const admission = {
    schemaVersion: SEMANTIC_OWNER_BINDING_SCHEMA,
    ownerIdentity: owner.ownerIdentity,
    authorityClaimIdentity: authority.authorityClaimIdentity,
    authorizationIdentity: authority.authorizationIdentity,
    currentTruthIdentity: authority.currentTruthIdentity,
    taskContractIdentity: authority.taskContractIdentity,
  };
  return {
    ...owner,
    ...admission,
    registrationState: "STRUCTURALLY_BOUND_UNPROVEN",
    authorityState: "UNPROVEN",
    ownerBindingIdentity: semanticIdentity(SEMANTIC_OWNER_BINDING_SCHEMA, admission),
  };
}

function normalizeOwnerBinding(owner) {
  exactKeys(
    owner,
    [
      "authorityClaimIdentity",
      "authorityState",
      "authorizationIdentity",
      "currentTruthIdentity",
      "ownerBindingIdentity",
      "ownerId",
      "ownerIdentity",
      "policyFloor",
      "registrationState",
      "schemaFloor",
      "schemaVersion",
      "semanticKinds",
      "taskContractIdentity",
    ],
    "SEMANTIC_OWNER_AUTHORITY_UNPROVEN",
  );
  if (
    owner.schemaVersion !== SEMANTIC_OWNER_BINDING_SCHEMA ||
    owner.registrationState !== "STRUCTURALLY_BOUND_UNPROVEN" ||
    owner.authorityState !== "UNPROVEN"
  ) {
    fail("SEMANTIC_OWNER_AUTHORITY_UNPROVEN");
  }
  const registration = ownerBody({ ...owner, schemaVersion: SEMANTIC_OWNER_REGISTRATION_SCHEMA });
  if (
    identity(owner.ownerIdentity, "SEMANTIC_OWNER_IDENTITY_MISMATCH") !==
    semanticIdentity(SEMANTIC_OWNER_REGISTRATION_SCHEMA, registration)
  ) {
    fail("SEMANTIC_OWNER_IDENTITY_MISMATCH");
  }
  const admission = {
    schemaVersion: SEMANTIC_OWNER_BINDING_SCHEMA,
    ownerIdentity: owner.ownerIdentity,
    authorityClaimIdentity: identity(
      owner.authorityClaimIdentity,
      "SEMANTIC_OWNER_AUTHORITY_UNPROVEN",
    ),
    authorizationIdentity: identity(
      owner.authorizationIdentity,
      "SEMANTIC_OWNER_AUTHORITY_UNPROVEN",
    ),
    currentTruthIdentity: identity(owner.currentTruthIdentity, "SEMANTIC_OWNER_AUTHORITY_UNPROVEN"),
    taskContractIdentity: identity(owner.taskContractIdentity, "SEMANTIC_OWNER_AUTHORITY_UNPROVEN"),
  };
  if (
    identity(owner.ownerBindingIdentity, "SEMANTIC_OWNER_AUTHORITY_UNPROVEN") !==
    semanticIdentity(SEMANTIC_OWNER_BINDING_SCHEMA, admission)
  ) {
    fail("SEMANTIC_OWNER_AUTHORITY_UNPROVEN");
  }
  return {
    ...registration,
    ...admission,
    registrationState: "STRUCTURALLY_BOUND_UNPROVEN",
    authorityState: "UNPROVEN",
    ownerBindingIdentity: owner.ownerBindingIdentity,
  };
}

function normalizeProviderBinding(provider) {
  return verifyBoundSemanticProvider(provider);
}

function finding(code, subjectIdentity = null) {
  return { code, subjectIdentity };
}

export function buildSemanticRegistry({
  authorityClaim,
  owners,
  providers,
  evidence,
  requiredSchemaFloor = 1,
  requiredPolicyFloor = 1,
}) {
  const authority = verifySemanticAuthorityClaim(authorityClaim);
  floor(requiredSchemaFloor, "SEMANTIC_REGISTRY_FLOOR_INVALID");
  floor(requiredPolicyFloor, "SEMANTIC_REGISTRY_FLOOR_INVALID");
  if (!Array.isArray(owners) || !Array.isArray(providers) || !Array.isArray(evidence)) {
    fail("SEMANTIC_REGISTRY_INVALID");
  }
  const findings = [];
  const normalizedOwners = [];
  for (const candidate of owners) {
    try {
      const owner = normalizeOwnerBinding(candidate);
      if (
        owner.authorityClaimIdentity !== authority.authorityClaimIdentity ||
        owner.authorizationIdentity !== authority.authorizationIdentity ||
        owner.currentTruthIdentity !== authority.currentTruthIdentity ||
        owner.taskContractIdentity !== authority.taskContractIdentity
      ) {
        findings.push(finding("SEMANTIC_OWNER_AUTHORITY_MISMATCH", owner.ownerIdentity));
      } else if (
        owner.schemaFloor < requiredSchemaFloor ||
        owner.policyFloor < requiredPolicyFloor
      ) {
        findings.push(finding("SEMANTIC_REGISTRY_FLOOR_VIOLATION", owner.ownerIdentity));
      } else {
        normalizedOwners.push(owner);
      }
    } catch (error) {
      findings.push(finding(error?.code ?? "SEMANTIC_OWNER_AUTHORITY_UNPROVEN"));
    }
  }
  const ownership = new Map();
  for (const owner of normalizedOwners) {
    for (const semanticKind of owner.semanticKinds) {
      const current = ownership.get(semanticKind) ?? [];
      current.push(owner.ownerIdentity);
      ownership.set(semanticKind, current);
    }
  }
  for (const [semanticKind, ownerIdentities] of ownership) {
    if (ownerIdentities.length > 1) {
      findings.push(finding("SEMANTIC_OWNER_CONFLICT", semanticKind));
    }
  }
  const normalizedProviders = [];
  for (const candidate of providers) {
    try {
      const provider = normalizeProviderBinding(candidate);
      const owner = normalizedOwners.find(
        ({ ownerIdentity }) => ownerIdentity === provider.ownerIdentity,
      );
      if (owner === undefined) {
        findings.push(finding("SEMANTIC_PROVIDER_OWNER_UNKNOWN", provider.providerIdentity));
      } else if (
        provider.authorityClaimIdentity !== authority.authorityClaimIdentity ||
        provider.authorizationIdentity !== authority.authorizationIdentity ||
        provider.currentTruthIdentity !== authority.currentTruthIdentity ||
        provider.taskContractIdentity !== authority.taskContractIdentity ||
        provider.schemaFloor < requiredSchemaFloor ||
        provider.policyFloor < requiredPolicyFloor ||
        provider.semanticKinds.some((kind) => !owner.semanticKinds.includes(kind))
      ) {
        findings.push(finding("SEMANTIC_PROVIDER_AUTHORITY_MISMATCH", provider.providerIdentity));
      } else {
        normalizedProviders.push(provider);
      }
    } catch (error) {
      findings.push(finding(error?.code ?? "SEMANTIC_PROVIDER_AUTHORITY_UNPROVEN"));
    }
  }
  const structuralEvidence = [];
  for (const item of evidence) {
    if (!plain(item)) {
      findings.push(finding("SEMANTIC_EVIDENCE_INVALID"));
      continue;
    }
    const provider = normalizedProviders.find(
      ({ providerBindingIdentity }) =>
        providerBindingIdentity === item.record?.providerBindingIdentity,
    );
    const evaluation = evaluateSemanticEvidence(item.record, {
      boundProvider: provider,
      currentFacts: item.currentFacts,
    });
    if (evaluation.disposition !== "UNKNOWN" || evaluation.assessment !== "CURRENTNESS_MATCH") {
      findings.push(
        finding(`SEMANTIC_EVIDENCE_${evaluation.disposition}`, evaluation.evidenceIdentity),
      );
      continue;
    }
    const ownerIdentities = ownership.get(item.record.semanticKind) ?? [];
    if (
      ownerIdentities.length !== 1 ||
      provider === undefined ||
      ownerIdentities[0] !== provider.ownerIdentity
    ) {
      findings.push(finding("SEMANTIC_EVIDENCE_OWNER_MISMATCH", evaluation.evidenceIdentity));
      continue;
    }
    structuralEvidence.push({
      semanticKey: item.record.semanticKey,
      semanticKind: item.record.semanticKind,
      presenceState: item.record.presenceState,
      evidenceIdentity: evaluation.evidenceIdentity,
      assessment: evaluation.assessment,
      ownerIdentity: provider.ownerIdentity,
      providerIdentity: provider.providerIdentity,
    });
  }
  const duplicateKeys = new Set();
  for (const entry of structuralEvidence) {
    if (
      structuralEvidence.filter(({ semanticKey }) => semanticKey === entry.semanticKey).length > 1
    ) {
      duplicateKeys.add(entry.semanticKey);
    }
  }
  for (const semanticKey of duplicateKeys) {
    findings.push(finding("SEMANTIC_KEY_CONFLICT", semanticKey));
  }
  const assessments = structuralEvidence
    .filter(({ semanticKey }) => !duplicateKeys.has(semanticKey))
    .sort((left, right) => compare(left.semanticKey, right.semanticKey));
  const normalizedFindings = findings.sort((left, right) =>
    compare(canonicalJson(left), canonicalJson(right)),
  );
  const semantic = {
    schemaVersion: SEMANTIC_REGISTRY_SCHEMA,
    authorityClaimIdentity: authority.authorityClaimIdentity,
    requiredSchemaFloor,
    requiredPolicyFloor,
    owners: normalizedOwners
      .map(({ ownerIdentity, ownerBindingIdentity, semanticKinds }) => ({
        ownerIdentity,
        ownerBindingIdentity,
        semanticKinds,
      }))
      .sort((left, right) => compare(left.ownerIdentity, right.ownerIdentity)),
    providers: normalizedProviders
      .map(({ providerIdentity, providerBindingIdentity, ownerIdentity, semanticKinds }) => ({
        providerIdentity,
        providerBindingIdentity,
        ownerIdentity,
        semanticKinds,
      }))
      .sort((left, right) => compare(left.providerIdentity, right.providerIdentity)),
    entries: [],
    assessments,
    findings: [finding("PHYSICAL_AUTHORITY_INTEGRATION_REQUIRED"), ...normalizedFindings],
  };
  return {
    ...semantic,
    status: "UNPROVEN_BLOCKED",
    registryIdentity: semanticIdentity(SEMANTIC_REGISTRY_SCHEMA, semantic),
  };
}
