import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";

export const CONTEXT_OBSERVATION_STATES = Object.freeze(["PRESENT", "ABSENT_PROVEN", "UNKNOWN"]);

const STATE_SET = new Set(CONTEXT_OBSERVATION_STATES);
const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;
const PORTABLE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/u;
const SECRET_KEY_PATTERN =
  /(?:^|[-_.])(?:auth(?:orization)?|credential|cookie|password|private[-_.]?key|secret|token)(?:$|[-_.])/iu;
const SECRET_VALUE_PATTERN =
  /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer\s+\S+|\b(?:password|secret|token)\s*[:=]\s*\S+)/iu;
const ABSOLUTE_PATH_PATTERN = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/u;

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stableUnique(values) {
  return [...new Set(values)].sort(compareText);
}

function requirePortableIdentifier(value, label) {
  if (
    typeof value !== "string" ||
    !PORTABLE_IDENTIFIER_PATTERN.test(value) ||
    ABSOLUTE_PATH_PATTERN.test(value) ||
    SECRET_VALUE_PATTERN.test(value)
  ) {
    throw new TypeError(`${label} must be a portable identifier`);
  }
  return value;
}

function requireIdentity(value, label) {
  if (typeof value !== "string" || !IDENTITY_PATTERN.test(value)) {
    throw new TypeError(`${label} must be an uppercase SHA-256 identity`);
  }
  return value;
}

function providerFinding(code, requestId = null) {
  return requestId === null ? { code } : { code, requestId };
}

function sanitizePortableValue(value, counters, ancestors = new Set(), key = "") {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new TypeError("portable provider data requires finite numbers");
    return Object.is(value, -0) ? 0 : value;
  }
  if (typeof value === "string") {
    if (SECRET_KEY_PATTERN.test(key) || SECRET_VALUE_PATTERN.test(value)) {
      counters.secretValues += 1;
      return "[SECRET_EXCLUDED]";
    }
    if (ABSOLUTE_PATH_PATTERN.test(value)) {
      counters.localPathValues += 1;
      return "[LOCAL_PATH_EXCLUDED]";
    }
    return value;
  }
  if (typeof value !== "object") {
    throw new TypeError("portable provider data must be JSON-compatible");
  }
  if (ancestors.has(value)) throw new TypeError("portable provider data must be acyclic");
  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return value.map((entry) => sanitizePortableValue(entry, counters, ancestors));
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("portable provider data requires plain objects");
    }
    const result = {};
    for (const entryKey of Object.keys(value).sort(compareText)) {
      if (SECRET_KEY_PATTERN.test(entryKey)) {
        counters.secretValues += 1;
        continue;
      }
      result[entryKey] = sanitizePortableValue(value[entryKey], counters, ancestors, entryKey);
    }
    return result;
  } finally {
    ancestors.delete(value);
  }
}

export function portableProviderData(value) {
  const excluded = { localPathValues: 0, secretValues: 0 };
  const data = sanitizePortableValue(value, excluded);
  canonicalJson(data);
  return { data, excluded };
}

export function defineContextProvider({ id, version, schemaVersion, capabilities, observe }) {
  const metadata = {
    id: requirePortableIdentifier(id, "provider id"),
    version: requirePortableIdentifier(version, "provider version"),
    schemaVersion: requirePortableIdentifier(schemaVersion, "provider schema version"),
    capabilities: stableUnique(
      capabilities.map((capability) => requirePortableIdentifier(capability, "capability")),
    ),
  };
  if (typeof observe !== "function") throw new TypeError("provider observe must be a function");
  return Object.freeze({
    ...metadata,
    providerIdentity: sha256Hex(`CIC-CONTEXT-PROVIDER-V1\n${canonicalJson(metadata)}\n`),
    observe,
  });
}

function normalizeRequest(request) {
  const counters = { localPathValues: 0, secretValues: 0 };
  const query = sanitizePortableValue(request.query ?? {}, counters);
  return {
    requestId: requirePortableIdentifier(request.requestId, "request id"),
    providerId: requirePortableIdentifier(request.providerId, "request provider id"),
    capability: requirePortableIdentifier(request.capability, "request capability"),
    inputIdentity: requireIdentity(request.inputIdentity, "request input identity"),
    query,
    excludedInput: counters,
  };
}

function unknownResult(request, provider, code) {
  return {
    requestId: request.requestId,
    providerId: request.providerId,
    providerIdentity: provider?.providerIdentity ?? null,
    capability: request.capability,
    inputIdentity: request.inputIdentity,
    requestIdentity: sha256Hex(`CIC-CONTEXT-REQUEST-V1\n${canonicalJson(request)}\n`),
    state: "UNKNOWN",
    materialIdentity: null,
    data: null,
    absenceWitness: null,
    excluded: request.excludedInput,
    findings: [providerFinding(code, request.requestId)],
  };
}

function normalizeOutcome(request, provider, rawOutcome) {
  if (rawOutcome === null || typeof rawOutcome !== "object" || !STATE_SET.has(rawOutcome.state)) {
    return unknownResult(request, provider, "PROVIDER_RESULT_INVALID");
  }

  const requestIdentity = sha256Hex(`CIC-CONTEXT-REQUEST-V1\n${canonicalJson(request)}\n`);
  if (rawOutcome.state === "UNKNOWN") {
    return unknownResult(request, provider, "PROVIDER_REPORTED_UNKNOWN");
  }

  try {
    const materialIdentity = requireIdentity(
      rawOutcome.materialIdentity,
      "provider material identity",
    );
    const portable = portableProviderData(rawOutcome.data ?? null);
    const absenceWitness =
      rawOutcome.state === "ABSENT_PROVEN"
        ? portableProviderData(rawOutcome.absenceWitness ?? null).data
        : null;
    const result = {
      requestId: request.requestId,
      providerId: request.providerId,
      providerIdentity: provider.providerIdentity,
      capability: request.capability,
      inputIdentity: request.inputIdentity,
      requestIdentity,
      state: rawOutcome.state,
      materialIdentity,
      data: portable.data,
      absenceWitness,
      excluded: {
        localPathValues: request.excludedInput.localPathValues + portable.excluded.localPathValues,
        secretValues: request.excludedInput.secretValues + portable.excluded.secretValues,
      },
      findings: [],
    };
    return {
      ...result,
      resultIdentity: sha256Hex(`CIC-CONTEXT-PROVIDER-RESULT-V1\n${canonicalJson(result)}\n`),
    };
  } catch {
    return unknownResult(request, provider, "PROVIDER_RESULT_INVALID");
  }
}

export async function observeContextProviders({ providers = [], requests = [] }) {
  const findings = [];
  const providerMap = new Map();
  for (const provider of [...providers].sort((left, right) => compareText(left.id, right.id))) {
    if (providerMap.has(provider.id)) {
      findings.push(providerFinding("CONTEXT_IDENTITY_COLLISION"));
    } else {
      providerMap.set(provider.id, provider);
    }
  }

  let normalizedRequests;
  try {
    normalizedRequests = requests
      .map(normalizeRequest)
      .sort((left, right) => compareText(left.requestId, right.requestId));
  } catch {
    normalizedRequests = [];
    findings.push(providerFinding("PROVIDER_REQUEST_INVALID"));
  }

  const requestIds = new Set();
  for (const request of normalizedRequests) {
    if (requestIds.has(request.requestId)) {
      findings.push(providerFinding("CONTEXT_IDENTITY_COLLISION", request.requestId));
    }
    requestIds.add(request.requestId);
  }

  const results = [];
  for (const request of normalizedRequests) {
    const provider = providerMap.get(request.providerId);
    if (provider === undefined) {
      results.push(unknownResult(request, null, "REQUIRED_PROVIDER_MISSING"));
      continue;
    }
    if (!provider.capabilities.includes(request.capability)) {
      results.push(unknownResult(request, provider, "REQUIRED_PROVIDER_CAPABILITY_MISSING"));
      continue;
    }
    try {
      results.push(normalizeOutcome(request, provider, await provider.observe(request)));
    } catch {
      results.push(unknownResult(request, provider, "PROVIDER_OBSERVATION_FAILED"));
    }
  }

  findings.push(...results.flatMap((result) => result.findings));
  findings.sort((left, right) =>
    compareText(`${left.code}\0${left.requestId ?? ""}`, `${right.code}\0${right.requestId ?? ""}`),
  );
  const semantic = { results, findings };
  return {
    schemaVersion: "CIC_CONTEXT_PROVIDER_OBSERVATION_V1",
    status: findings.length === 0 ? "PASS" : "BLOCKED",
    ...semantic,
    observationFingerprint: sha256Hex(
      `CIC-CONTEXT-PROVIDER-OBSERVATION-V1\n${canonicalJson(semantic)}\n`,
    ),
  };
}
