import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";

export const CONTEXT_OBSERVATION_STATES = Object.freeze(["PRESENT", "ABSENT_PROVEN", "UNKNOWN"]);
export const CONTEXT_PROVIDER_MOVEMENTS = Object.freeze(["STABLE", "REPEATED_MOVEMENT"]);

const STATE_SET = new Set(CONTEXT_OBSERVATION_STATES);
const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;
const PORTABLE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/u;
const SECRET_KEY_PATTERN =
  /(?:^|[-_.\s])(?:api[-_.\s]*key|access[-_.\s]*(?:key|token)|auth(?:orization)?|client[-_.\s]*secret|credential|cookie|password|private[-_.\s]*key|secret|token)(?:$|[-_.\s])/iu;
const SECRET_VALUE_PATTERN =
  /(?:-----BEGIN [A-Z ]*PRIVATE KEY-----|\bBearer\s+\S+|\bauthorization\s*:\s*\S+|\b(?:api[-_.\s]*key|access[-_.\s]*(?:key|token)|client[-_.\s]*secret|credential|password|secret|token)\s*[:=]\s*\S+)/iu;
const LEADING_ABSOLUTE_PATH_PATTERN = /^(?:[A-Za-z]:[\\/]|\\\\|\/)/u;
const EMBEDDED_WINDOWS_PATH_PATTERN = /(?:[A-Za-z]:\\|[A-Za-z]:\/(?!\/)|\\\\)/u;
const LOCAL_POSIX_PATH_PATTERN = /\/(?:home|Users|root|tmp|var|mnt|private)(?:\/|$)/gu;
const HTTP_URL_PATTERN = /https?:\/\/[^\s"'<>]+/giu;
const NEGATIVE_WITNESS_KEYS = Object.freeze([
  "generationIdentity",
  "indexIdentity",
  "providerIdentity",
  "queryClass",
  "result",
  "scopeIdentity",
]);

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function stableUnique(values) {
  return [...new Set(values)].sort(compareText);
}

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isHttpUrlPathOffset(value, offset) {
  for (const match of value.matchAll(HTTP_URL_PATTERN)) {
    const token = match[0];
    const tokenStart = match.index;
    const schemeEnd = token.indexOf("://") + 3;
    const pathStart = token.indexOf("/", schemeEnd);
    const queryStart = [token.indexOf("?", schemeEnd), token.indexOf("#", schemeEnd)]
      .filter((candidate) => candidate >= 0)
      .reduce((minimum, candidate) => Math.min(minimum, candidate), token.length);
    const relativeOffset = offset - tokenStart;
    if (pathStart >= 0 && relativeOffset >= pathStart && relativeOffset < queryStart) return true;
  }
  return false;
}

function containsLocalPathText(value) {
  if (LEADING_ABSOLUTE_PATH_PATTERN.test(value) || EMBEDDED_WINDOWS_PATH_PATTERN.test(value)) {
    return true;
  }
  for (const match of value.matchAll(LOCAL_POSIX_PATH_PATTERN)) {
    if (!isHttpUrlPathOffset(value, match.index)) return true;
  }
  return false;
}

export function containsNonPortableContextText(value) {
  return (
    typeof value !== "string" || SECRET_VALUE_PATTERN.test(value) || containsLocalPathText(value)
  );
}

export function isPortableContextIdentifier(value) {
  return (
    typeof value === "string" &&
    value.length <= 128 &&
    PORTABLE_IDENTIFIER_PATTERN.test(value) &&
    !LEADING_ABSOLUTE_PATH_PATTERN.test(value) &&
    !containsNonPortableContextText(value)
  );
}

function requirePortableIdentifier(value, label) {
  if (!isPortableContextIdentifier(value)) {
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
    if (!Number.isFinite(value)) {
      throw new TypeError("portable provider data requires finite numbers");
    }
    return Object.is(value, -0) ? 0 : value;
  }
  if (typeof value === "string") {
    if (SECRET_KEY_PATTERN.test(key) || SECRET_VALUE_PATTERN.test(value)) {
      counters.secretValues += 1;
      return "[SECRET_EXCLUDED]";
    }
    if (containsLocalPathText(value)) {
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
    if (!isPlainObject(value)) {
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

export function normalizeNegativeKnowledgeWitness(value) {
  if (!isPlainObject(value)) return null;
  if (
    Object.keys(value).sort(compareText).join("\0") !==
    [...NEGATIVE_WITNESS_KEYS].sort(compareText).join("\0")
  ) {
    return null;
  }
  if (value.result !== "ABSENT_PROVEN" || !isPortableContextIdentifier(value.queryClass)) {
    return null;
  }
  try {
    return {
      result: "ABSENT_PROVEN",
      providerIdentity: requireIdentity(value.providerIdentity, "witness provider identity"),
      indexIdentity: requireIdentity(value.indexIdentity, "witness index identity"),
      queryClass: value.queryClass,
      scopeIdentity: requireIdentity(value.scopeIdentity, "witness scope identity"),
      generationIdentity: requireIdentity(value.generationIdentity, "witness generation identity"),
    };
  } catch {
    return null;
  }
}

function contextProviderRequestIdentity(request) {
  return sha256Hex(`CIC-CONTEXT-REQUEST-V1\n${canonicalJson(request)}\n`);
}

export function contextProviderResultIdentity(resultBody) {
  return sha256Hex(`CIC-CONTEXT-PROVIDER-RESULT-V1\n${canonicalJson(resultBody)}\n`);
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

function withResultIdentity(body) {
  return { ...body, resultIdentity: contextProviderResultIdentity(body) };
}

function unknownResult(request, provider, code) {
  return withResultIdentity({
    requestId: request.requestId,
    providerId: request.providerId,
    providerIdentity: provider?.providerIdentity ?? null,
    capability: request.capability,
    inputIdentity: request.inputIdentity,
    requestIdentity: contextProviderRequestIdentity(request),
    state: "UNKNOWN",
    materialIdentity: null,
    data: null,
    absenceWitness: null,
    excluded: request.excludedInput,
    findings: [providerFinding(code, request.requestId)],
  });
}

function normalizeOutcome(request, provider, rawOutcome) {
  if (rawOutcome === null || typeof rawOutcome !== "object" || !STATE_SET.has(rawOutcome.state)) {
    return unknownResult(request, provider, "PROVIDER_RESULT_INVALID");
  }

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
        ? normalizeNegativeKnowledgeWitness(rawOutcome.absenceWitness)
        : null;
    if (
      rawOutcome.state === "ABSENT_PROVEN" &&
      (absenceWitness === null || absenceWitness.providerIdentity !== provider.providerIdentity)
    ) {
      return unknownResult(request, provider, "NEGATIVE_KNOWLEDGE_WITNESS_INVALID");
    }
    return withResultIdentity({
      requestId: request.requestId,
      providerId: request.providerId,
      providerIdentity: provider.providerIdentity,
      capability: request.capability,
      inputIdentity: request.inputIdentity,
      requestIdentity: contextProviderRequestIdentity(request),
      state: rawOutcome.state,
      materialIdentity,
      data: portable.data,
      absenceWitness,
      excluded: {
        localPathValues: request.excludedInput.localPathValues + portable.excluded.localPathValues,
        secretValues: request.excludedInput.secretValues + portable.excluded.secretValues,
      },
      findings: [],
    });
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
  const semantic = { movement: "STABLE", results, findings };
  return {
    schemaVersion: "CIC_CONTEXT_PROVIDER_OBSERVATION_V1",
    status: findings.length === 0 ? "PASS" : "BLOCKED",
    ...semantic,
    observationFingerprint: sha256Hex(
      `CIC-CONTEXT-PROVIDER-OBSERVATION-V1\n${canonicalJson(semantic)}\n`,
    ),
  };
}
