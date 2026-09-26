import { canonicalJson } from "./canonical-json.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./identity.mjs";

const PUBLICATION_FILE_INVENTORY_SCHEMA = "CIC_PUBLICATION_FILE_INVENTORY_V1";
export const PACKAGE_MANIFEST_SCHEMA = "CIC_PACKAGE_MANIFEST_V1";
const PACKAGE_MANIFEST_VERIFICATION_SCHEMA = "CIC_PACKAGE_MANIFEST_VERIFICATION_V1";
export const HOSTED_CI_EVIDENCE_SCHEMA = "CIC_HOSTED_CI_EVIDENCE_V1";
const HOSTED_CI_HISTORY_SCHEMA = "CIC_HOSTED_CI_HISTORY_V1";
export const PUBLICATION_SNAPSHOT_VERIFICATION_SCHEMA = "CIC_PUBLICATION_SNAPSHOT_VERIFICATION_V1";
const PUBLICATION_STATE_EVALUATION_SCHEMA = "CIC_PUBLICATION_STATE_EVALUATION_V1";
export const COMMIT_AUTHORIZATION_SCHEMA = "CIC_EXTERNAL_COMMIT_AUTHORIZATION_V1";
export const PUSH_AUTHORIZATION_SCHEMA = "CIC_EXTERNAL_PUSH_AUTHORIZATION_V1";
export const INDEPENDENT_REVIEW_SCHEMA = "CIC_EXTERNAL_INDEPENDENT_REVIEW_V1";
export const SOURCE_PROMOTION_AUTHORIZATION_SCHEMA =
  "CIC_EXTERNAL_SOURCE_PROMOTION_AUTHORIZATION_V1";
export const EVIDENCE_ENTRY_SCHEMA = "CIC_CONTENT_ADDRESSED_EVIDENCE_ENTRY_V1";
export const EVIDENCE_BUNDLE_PROFILE_SCHEMA = "CIC_NON_CIRCULAR_EVIDENCE_BUNDLE_PROFILE_V1";
const EVIDENCE_BUNDLE_VERIFICATION_SCHEMA = "CIC_NON_CIRCULAR_EVIDENCE_BUNDLE_VERIFICATION_V1";
export const INVOCATION_RECORD_SCHEMA = "CIC_DETERMINISTIC_INVOCATION_RECORD_V1";
export const INVOCATION_LEDGER_SCHEMA = "CIC_APPEND_ONLY_INVOCATION_LEDGER_V2";
const INVOCATION_LEDGER_EXTENSION_VERIFICATION_SCHEMA =
  "CIC_INVOCATION_LEDGER_EXTENSION_VERIFICATION_V1";

const SHA256_PATTERN = /^[0-9A-F]{64}$/u;
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/u;
const PORTABLE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:@/+~-]{0,511}$/u;
const PORTABLE_PATH_SEGMENT_PATTERN = /^[A-Za-z0-9._+@-]+$/u;
const ROLE_PATTERN = /^[A-Z][A-Z0-9_-]{0,63}$/u;
const FILE_MODES = new Set(["100644", "100755"]);
const HOSTED_STATUSES = new Set(["COMPLETED"]);
const HOSTED_CONCLUSIONS = new Set(["SUCCESS", "FAILURE", "CANCELLED", "SKIPPED"]);

class PublicationGateError extends Error {
  constructor(code, detail = null) {
    super(detail === null ? code : `${code}: ${detail}`);
    this.name = "PublicationGateError";
    this.code = code;
    this.detail = detail;
  }
}

function fail(code, detail = null) {
  throw new PublicationGateError(code, detail);
}

function requireObject(value, code, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(code, `${label} must be an object`);
  }
  return value;
}

function requireExactKeys(value, expectedKeys, code, label) {
  const object = requireObject(value, code, label);
  const actual = Object.keys(object).sort();
  const expected = [...expectedKeys].sort();
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    fail(code, `${label} keys are not exact`);
  }
  return object;
}

function requireBoolean(value, code, label) {
  if (typeof value !== "boolean") {
    fail(code, `${label} must be boolean`);
  }
  return value;
}

function requireInteger(value, code, label, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum) {
    fail(code, `${label} must be a safe integer >= ${minimum}`);
  }
  return value;
}

function requireText(value, code, label, maximumLength = 512) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximumLength ||
    value.trim() !== value
  ) {
    fail(code, `${label} must be bounded non-empty text`);
  }
  return value;
}

function normalizeSha256(value, code, label) {
  const text = requireText(value, code, label, 64);
  if (!SHA256_PATTERN.test(text)) {
    fail(code, `${label} must be an uppercase SHA-256 identity`);
  }
  return text;
}

function normalizeGitSha(value, code, label) {
  const text = requireText(value, code, label, 40);
  if (!GIT_SHA_PATTERN.test(text)) {
    fail(code, `${label} must be a lowercase 40-hex Git identity`);
  }
  return text;
}

function normalizePortableIdentifier(value, code, label) {
  const text = requireText(value, code, label);
  if (!PORTABLE_IDENTIFIER_PATTERN.test(text)) {
    fail(code, `${label} is not portable`);
  }
  return text;
}

function normalizePortablePath(value, code, label) {
  const text = requireText(value, code, label);
  if (text.includes("\\")) {
    fail(code, `${label} must use forward slashes`);
  }

  let normalized;
  try {
    normalized = normalizeRepoRelativePath(text);
  } catch {
    fail(code, `${label} is not repository-relative`);
  }

  const segments = text.split("/");
  if (
    normalized !== text ||
    segments.some(
      (segment) =>
        segment.length === 0 ||
        segment === "." ||
        segment === ".." ||
        !PORTABLE_PATH_SEGMENT_PATTERN.test(segment),
    )
  ) {
    fail(code, `${label} is not a canonical portable path`);
  }
  return text;
}

function normalizeRole(value, code, label) {
  const text = requireText(value, code, label, 64);
  if (!ROLE_PATTERN.test(text)) {
    fail(code, `${label} is not a canonical role`);
  }
  return text;
}

function semanticIdentity(schemaVersion, body) {
  return sha256Hex(`${schemaVersion}\n${canonicalJson(body)}\n`);
}

function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function normalizeFileInventory(entries, code = "PUBLICATION_SNAPSHOT_INVALID") {
  if (!Array.isArray(entries) || entries.length === 0) {
    fail(code, "file inventory must be a non-empty array");
  }

  const normalized = entries.map((entry, index) => {
    const value = requireExactKeys(
      entry,
      ["bytes", "gitBlob", "mode", "path", "sha256"],
      code,
      `file inventory entry ${index}`,
    );
    const mode = requireText(value.mode, code, `file inventory mode ${index}`, 6);
    if (!FILE_MODES.has(mode)) {
      fail(code, `file inventory mode ${index} is not supported`);
    }
    return {
      path: normalizePortablePath(value.path, code, `file inventory path ${index}`),
      bytes: requireInteger(value.bytes, code, `file inventory bytes ${index}`),
      sha256: normalizeSha256(value.sha256, code, `file inventory SHA-256 ${index}`),
      gitBlob: normalizeGitSha(value.gitBlob, code, `file inventory Git blob ${index}`),
      mode,
    };
  });

  normalized.sort((left, right) => left.path.localeCompare(right.path));
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index - 1].path === normalized[index].path) {
      fail(code, `duplicate file inventory path ${normalized[index].path}`);
    }
  }
  return normalized;
}

export function publicationFileInventoryIdentity(entries) {
  const files = normalizeFileInventory(entries);
  return semanticIdentity(PUBLICATION_FILE_INVENTORY_SCHEMA, { files });
}

function normalizeCompanionDeclarations(entries, manifestPath) {
  const code = "PACKAGE_MANIFEST_INVALID";
  if (!Array.isArray(entries) || entries.length === 0) {
    fail(code, "companions must be a non-empty array");
  }
  const normalized = entries.map((entry, index) => {
    const value = requireExactKeys(
      entry,
      ["bytes", "classification", "path", "role", "sha256"],
      code,
      `companion ${index}`,
    );
    const path = normalizePortablePath(value.path, code, `companion path ${index}`);
    const role = normalizeRole(value.role, code, `companion role ${index}`);
    if (path === manifestPath || role === "PACKAGE_MANIFEST") {
      fail("PACKAGE_MANIFEST_CIRCULAR", "manifest cannot declare itself");
    }
    if (value.classification !== "REQUIRED" && value.classification !== "OPTIONAL") {
      fail(code, `companion classification ${index} is invalid`);
    }
    return {
      path,
      role,
      bytes: requireInteger(value.bytes, code, `companion bytes ${index}`),
      sha256: normalizeSha256(value.sha256, code, `companion SHA-256 ${index}`),
      classification: value.classification,
    };
  });

  normalized.sort((left, right) =>
    `${left.path}\0${left.role}`.localeCompare(`${right.path}\0${right.role}`),
  );
  const paths = new Set();
  const roles = new Set();
  for (const companion of normalized) {
    if (paths.has(companion.path) || roles.has(companion.role)) {
      fail("PACKAGE_MANIFEST_AMBIGUOUS_COMPANION", `duplicate path or role at ${companion.path}`);
    }
    paths.add(companion.path);
    roles.add(companion.role);
  }
  return normalized;
}

function normalizePackageManifestBody(input) {
  const code = "PACKAGE_MANIFEST_INVALID";
  const value = requireExactKeys(
    input,
    ["companions", "exactInventory", "manifestPath", "packageRole"],
    code,
    "package manifest input",
  );
  const manifestPath = normalizePortablePath(value.manifestPath, code, "manifest path");
  const packageRole = normalizeRole(value.packageRole, code, "package role");
  if (packageRole === "PACKAGE_MANIFEST" || packageRole.endsWith("_AUTHORITY")) {
    fail("PACKAGE_MANIFEST_CIRCULAR", "manifest cannot declare authority over itself");
  }
  return {
    manifestPath,
    packageRole,
    exactInventory: requireBoolean(value.exactInventory, code, "exact inventory"),
    companions: normalizeCompanionDeclarations(value.companions, manifestPath),
    authority: "EVIDENCE_ONLY",
  };
}

export function definePackageManifest(input) {
  const body = normalizePackageManifestBody(input);
  return deepFreeze({
    schemaVersion: PACKAGE_MANIFEST_SCHEMA,
    ...body,
    manifestIdentity: semanticIdentity(PACKAGE_MANIFEST_SCHEMA, body),
  });
}

function normalizeSealedPackageManifest(input) {
  const code = "PACKAGE_MANIFEST_INVALID";
  const value = requireExactKeys(
    input,
    [
      "authority",
      "companions",
      "exactInventory",
      "manifestIdentity",
      "manifestPath",
      "packageRole",
      "schemaVersion",
    ],
    code,
    "sealed package manifest",
  );
  if (value.schemaVersion !== PACKAGE_MANIFEST_SCHEMA || value.authority !== "EVIDENCE_ONLY") {
    fail(code, "package manifest schema or authority marker is invalid");
  }
  const body = normalizePackageManifestBody({
    manifestPath: value.manifestPath,
    packageRole: value.packageRole,
    exactInventory: value.exactInventory,
    companions: value.companions,
  });
  const manifestIdentity = normalizeSha256(value.manifestIdentity, code, "manifest identity");
  if (manifestIdentity !== semanticIdentity(PACKAGE_MANIFEST_SCHEMA, body)) {
    fail("PACKAGE_MANIFEST_MISMATCH", "manifest identity does not match content");
  }
  return { ...body, schemaVersion: PACKAGE_MANIFEST_SCHEMA, manifestIdentity };
}

function normalizeObservedCompanions(entries) {
  const code = "PACKAGE_MANIFEST_INVALID";
  if (!Array.isArray(entries)) {
    fail(code, "observed companions must be an array");
  }
  const normalized = entries.map((entry, index) => {
    const value = requireExactKeys(
      entry,
      ["bytes", "path", "role", "sha256"],
      code,
      `observed companion ${index}`,
    );
    return {
      path: normalizePortablePath(value.path, code, `observed companion path ${index}`),
      role: normalizeRole(value.role, code, `observed companion role ${index}`),
      bytes: requireInteger(value.bytes, code, `observed companion bytes ${index}`),
      sha256: normalizeSha256(value.sha256, code, `observed companion SHA-256 ${index}`),
    };
  });
  normalized.sort((left, right) =>
    `${left.path}\0${left.role}`.localeCompare(`${right.path}\0${right.role}`),
  );
  const paths = new Set();
  const roles = new Set();
  for (const companion of normalized) {
    if (paths.has(companion.path) || roles.has(companion.role)) {
      fail(
        "PACKAGE_MANIFEST_AMBIGUOUS_COMPANION",
        `duplicate observed path or role at ${companion.path}`,
      );
    }
    paths.add(companion.path);
    roles.add(companion.role);
  }
  return normalized;
}

export function verifyPackageManifest(manifestInput, observedInput) {
  const manifest = normalizeSealedPackageManifest(manifestInput);
  const observed = normalizeObservedCompanions(observedInput);
  const observedByPath = new Map(observed.map((entry) => [entry.path, entry]));

  for (const declared of manifest.companions) {
    const actual = observedByPath.get(declared.path);
    if (actual === undefined) {
      if (declared.classification === "REQUIRED") {
        fail("PACKAGE_MANIFEST_REQUIRED_COMPANION_MISSING", declared.path);
      }
      continue;
    }
    if (
      actual.role !== declared.role ||
      actual.bytes !== declared.bytes ||
      actual.sha256 !== declared.sha256
    ) {
      fail("PACKAGE_MANIFEST_MISMATCH", declared.path);
    }
  }

  if (manifest.exactInventory) {
    const declaredPaths = new Set(manifest.companions.map((entry) => entry.path));
    const unexpected = observed.find((entry) => !declaredPaths.has(entry.path));
    if (unexpected !== undefined) {
      fail("PACKAGE_MANIFEST_UNEXPECTED_COMPANION", unexpected.path);
    }
  }

  const body = {
    manifestIdentity: manifest.manifestIdentity,
    exactInventory: manifest.exactInventory,
    declaredCompanionCount: manifest.companions.length,
    observedCompanionCount: observed.length,
    disposition: "VERIFIED",
    authority: "EVIDENCE_ONLY",
  };
  return deepFreeze({
    schemaVersion: PACKAGE_MANIFEST_VERIFICATION_SCHEMA,
    ...body,
    verificationIdentity: semanticIdentity(PACKAGE_MANIFEST_VERIFICATION_SCHEMA, body),
  });
}

const EVIDENCE_AVAILABILITY = new Set(["AVAILABLE", "UNAVAILABLE"]);
const EVIDENCE_DISPOSITIONS = new Set(["EMBEDDED", "REFERENCED"]);
const EVIDENCE_PAYLOAD_KINDS = new Set(["EVIDENCE", "ARCHIVE"]);
const EVIDENCE_CURRENTNESS = new Set(["CURRENT", "STALE", "UNKNOWN"]);
const EVIDENCE_RETENTION_CLASSES = new Set(["STANDARD", "CLOSURE_CRITICAL", "HISTORICAL_FAILURE"]);
const INVOCATION_DISPOSITIONS = new Set(["EXECUTED", "REUSED"]);
const INVOCATION_RESULTS = new Set(["PASS", "FAIL", "REUSED"]);

function normalizeOptionalSha256(value, code, label) {
  return value === null ? null : normalizeSha256(value, code, label);
}

function normalizeEvidenceLocator(input, code, label) {
  const value = requireExactKeys(input, ["identity", "scheme", "value"], code, label);
  const scheme = normalizeRole(value.scheme, code, `${label} scheme`);
  if (scheme !== "BUNDLE_PATH" && scheme !== "GOVERNED_REFERENCE") {
    fail(code, `${label} scheme is unsupported`);
  }
  return {
    scheme,
    value: normalizePortablePath(value.value, code, `${label} value`),
    identity: normalizeSha256(value.identity, code, `${label} identity`),
  };
}

function normalizeEvidenceAvailability(input, payloadSha256, code, label) {
  const value = requireExactKeys(input, ["disposition", "observedIdentity"], code, label);
  const disposition = requireText(value.disposition, code, `${label} disposition`, 32);
  if (!EVIDENCE_AVAILABILITY.has(disposition)) {
    fail(code, `${label} disposition is invalid`);
  }
  const observedIdentity = normalizeOptionalSha256(
    value.observedIdentity,
    code,
    `${label} observed identity`,
  );
  if (disposition === "AVAILABLE" && observedIdentity !== payloadSha256) {
    fail(code, `${label} available identity does not match payload`);
  }
  if (disposition === "UNAVAILABLE" && observedIdentity !== null) {
    fail(code, `${label} unavailable evidence cannot have an observed identity`);
  }
  return { disposition, observedIdentity };
}

function normalizeEvidenceBindings(input, code) {
  const value = requireExactKeys(
    input,
    [
      "candidateIdentity",
      "commandIdentity",
      "environmentIdentity",
      "head",
      "repositorySnapshotIdentity",
      "sourceGeneration",
      "sourceManifestIdentity",
      "tree",
    ],
    code,
    "evidence bindings",
  );
  return {
    candidateIdentity: normalizeOptionalSha256(value.candidateIdentity, code, "candidate identity"),
    sourceGeneration: normalizeOptionalSha256(value.sourceGeneration, code, "Source generation"),
    sourceManifestIdentity: normalizeOptionalSha256(
      value.sourceManifestIdentity,
      code,
      "Source manifest identity",
    ),
    repositorySnapshotIdentity: normalizeOptionalSha256(
      value.repositorySnapshotIdentity,
      code,
      "repository snapshot identity",
    ),
    head: value.head === null ? null : normalizeGitSha(value.head, code, "HEAD"),
    tree: value.tree === null ? null : normalizeGitSha(value.tree, code, "tree"),
    environmentIdentity: normalizeOptionalSha256(
      value.environmentIdentity,
      code,
      "environment identity",
    ),
    commandIdentity: normalizeOptionalSha256(value.commandIdentity, code, "command identity"),
  };
}

function normalizeEvidenceCurrentness(input, code) {
  const value = requireExactKeys(input, ["disposition", "reasonCodes"], code, "currentness");
  const disposition = requireText(value.disposition, code, "currentness disposition", 32);
  if (!EVIDENCE_CURRENTNESS.has(disposition) || !Array.isArray(value.reasonCodes)) {
    fail(code, "currentness is invalid");
  }
  const reasonCodes = value.reasonCodes.map((reason, index) =>
    normalizeRole(reason, code, `currentness reason ${index}`),
  );
  reasonCodes.sort();
  if (new Set(reasonCodes).size !== reasonCodes.length) {
    fail(code, "currentness reason codes contain a duplicate");
  }
  if ((disposition === "CURRENT") !== (reasonCodes.length === 0)) {
    fail(code, "currentness disposition and reasons are inconsistent");
  }
  return { disposition, reasonCodes };
}

function normalizeEvidenceRelationships(input, code) {
  const value = requireExactKeys(
    input,
    ["companions", "parents", "references"],
    code,
    "evidence relationships",
  );
  const normalizeEntryIds = (entries, label) => {
    if (!Array.isArray(entries)) fail(code, `${label} must be an array`);
    const result = entries.map((entryId, index) =>
      normalizePortableIdentifier(entryId, code, `${label} ${index}`),
    );
    result.sort();
    if (new Set(result).size !== result.length) fail(code, `${label} contains a duplicate`);
    return result;
  };
  return {
    parents: normalizeEntryIds(value.parents, "parent entry IDs"),
    companions: normalizeEntryIds(value.companions, "companion entry IDs"),
    references: normalizeEntryIds(value.references, "reference entry IDs"),
  };
}

function normalizeEvidenceEntryBody(input, code = "EVIDENCE_ENTRY_INVALID") {
  const value = requireExactKeys(
    input,
    [
      "availability",
      "bindings",
      "currentness",
      "disposition",
      "entryId",
      "locator",
      "payload",
      "payloadKind",
      "proofClass",
      "relationships",
      "retentionClass",
      "role",
    ],
    code,
    "evidence entry",
  );
  const payload = requireExactKeys(value.payload, ["bytes", "sha256"], code, "evidence payload");
  const normalizedPayload = {
    bytes: requireInteger(payload.bytes, code, "payload bytes"),
    sha256: normalizeSha256(payload.sha256, code, "payload SHA-256"),
  };
  const disposition = requireText(value.disposition, code, "embed/reference disposition", 32);
  const payloadKind = requireText(value.payloadKind, code, "payload kind", 32);
  const retentionClass = requireText(value.retentionClass, code, "retention class", 64);
  if (
    !EVIDENCE_DISPOSITIONS.has(disposition) ||
    !EVIDENCE_PAYLOAD_KINDS.has(payloadKind) ||
    !EVIDENCE_RETENTION_CLASSES.has(retentionClass)
  ) {
    fail(code, "evidence disposition, payload kind, or retention class is invalid");
  }
  const locator = normalizeEvidenceLocator(value.locator, code, "evidence locator");
  if (
    (disposition === "EMBEDDED" && locator.scheme !== "BUNDLE_PATH") ||
    (disposition === "REFERENCED" && locator.scheme !== "GOVERNED_REFERENCE")
  ) {
    fail(code, "evidence disposition and locator scheme are inconsistent");
  }
  const availability = normalizeEvidenceAvailability(
    value.availability,
    normalizedPayload.sha256,
    code,
    "evidence availability",
  );
  if (disposition === "EMBEDDED" && availability.disposition !== "AVAILABLE") {
    fail(code, "embedded evidence must be available");
  }
  return {
    entryId: normalizePortableIdentifier(value.entryId, code, "entry ID"),
    role: normalizeRole(value.role, code, "evidence role"),
    proofClass: normalizeRole(value.proofClass, code, "proof class"),
    payloadKind,
    payload: normalizedPayload,
    locator,
    availability,
    relationships: normalizeEvidenceRelationships(value.relationships, code),
    bindings: normalizeEvidenceBindings(value.bindings, code),
    currentness: normalizeEvidenceCurrentness(value.currentness, code),
    retentionClass,
    disposition,
    authority: "EVIDENCE_ONLY",
    mutationAuthorization: false,
    targetedPruning: "OFF",
  };
}

export function createEvidenceEntry(input) {
  const body = normalizeEvidenceEntryBody(input);
  return deepFreeze({
    schemaVersion: EVIDENCE_ENTRY_SCHEMA,
    ...body,
    evidenceIdentity: semanticIdentity(EVIDENCE_ENTRY_SCHEMA, body),
  });
}

function normalizeSealedEvidenceEntry(input) {
  const code = "EVIDENCE_ENTRY_INVALID";
  const value = requireExactKeys(
    input,
    [
      "authority",
      "availability",
      "bindings",
      "currentness",
      "disposition",
      "entryId",
      "evidenceIdentity",
      "locator",
      "mutationAuthorization",
      "payload",
      "payloadKind",
      "proofClass",
      "relationships",
      "retentionClass",
      "role",
      "schemaVersion",
      "targetedPruning",
    ],
    code,
    "sealed evidence entry",
  );
  if (
    value.schemaVersion !== EVIDENCE_ENTRY_SCHEMA ||
    value.authority !== "EVIDENCE_ONLY" ||
    value.mutationAuthorization !== false ||
    value.targetedPruning !== "OFF"
  ) {
    fail(code, "evidence schema or permanent authority boundary is invalid");
  }
  const body = normalizeEvidenceEntryBody({
    entryId: value.entryId,
    role: value.role,
    proofClass: value.proofClass,
    payloadKind: value.payloadKind,
    payload: value.payload,
    locator: value.locator,
    availability: value.availability,
    relationships: value.relationships,
    bindings: value.bindings,
    currentness: value.currentness,
    retentionClass: value.retentionClass,
    disposition: value.disposition,
  });
  const evidenceIdentity = normalizeSha256(value.evidenceIdentity, code, "evidence identity");
  if (evidenceIdentity !== semanticIdentity(EVIDENCE_ENTRY_SCHEMA, body)) {
    fail("EVIDENCE_ENTRY_MISMATCH", value.entryId);
  }
  return { schemaVersion: EVIDENCE_ENTRY_SCHEMA, ...body, evidenceIdentity };
}

function assertEvidenceGraph(entries, manifestPath, archivePath) {
  const byId = new Map();
  const locators = new Set();
  const evidenceIdentities = new Set();
  for (const entry of entries) {
    if (
      byId.has(entry.entryId) ||
      locators.has(`${entry.locator.scheme}\0${entry.locator.value}`) ||
      evidenceIdentities.has(entry.evidenceIdentity)
    ) {
      fail("EVIDENCE_BUNDLE_AMBIGUOUS_ENTRY", entry.entryId);
    }
    if (entry.locator.scheme === "BUNDLE_PATH" && entry.locator.value === manifestPath) {
      fail("EVIDENCE_BUNDLE_MANIFEST_SELF_ENTRY", entry.entryId);
    }
    if (entry.locator.scheme === "BUNDLE_PATH" && entry.locator.value === archivePath) {
      fail("EVIDENCE_BUNDLE_ARCHIVE_SELF_ENTRY", entry.entryId);
    }
    if (entry.payloadKind === "ARCHIVE" && entry.disposition === "EMBEDDED") {
      fail("EVIDENCE_BUNDLE_RECURSIVE_ARCHIVE", entry.entryId);
    }
    byId.set(entry.entryId, entry);
    locators.add(`${entry.locator.scheme}\0${entry.locator.value}`);
    evidenceIdentities.add(entry.evidenceIdentity);
  }

  const edgesById = new Map();
  for (const entry of entries) {
    const edges = [
      ...entry.relationships.parents,
      ...entry.relationships.companions,
      ...entry.relationships.references,
    ];
    for (const target of edges) {
      if (!byId.has(target)) fail("EVIDENCE_BUNDLE_EDGE_MISSING", `${entry.entryId}->${target}`);
      if (target === entry.entryId) fail("EVIDENCE_BUNDLE_CYCLE", entry.entryId);
    }
    edgesById.set(entry.entryId, [...new Set(edges)].sort());
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (entryId) => {
    if (visiting.has(entryId)) fail("EVIDENCE_BUNDLE_CYCLE", entryId);
    if (visited.has(entryId)) return;
    visiting.add(entryId);
    for (const target of edgesById.get(entryId)) visit(target);
    visiting.delete(entryId);
    visited.add(entryId);
  };
  for (const entry of entries) visit(entry.entryId);
}

function normalizeEvidenceBundleInput(input) {
  const code = "EVIDENCE_BUNDLE_INVALID";
  const value = requireExactKeys(
    input,
    ["archiveBytes", "archivePath", "entries", "looseEvidenceBytes", "manifestPath"],
    code,
    "evidence bundle profile input",
  );
  if (!Array.isArray(value.entries) || value.entries.length === 0) {
    fail(code, "evidence bundle must contain entries");
  }
  const manifestPath = normalizePortablePath(value.manifestPath, code, "manifest path");
  const archivePath = normalizePortablePath(value.archivePath, code, "archive path");
  if (manifestPath === archivePath) fail(code, "manifest and archive paths must differ");
  const entries = value.entries.map((entry) => normalizeSealedEvidenceEntry(entry));
  entries.sort((left, right) => left.entryId.localeCompare(right.entryId));
  assertEvidenceGraph(entries, manifestPath, archivePath);
  const uniquePayloads = new Map();
  for (const entry of entries) {
    const payloadKey = `${entry.payload.sha256}\0${entry.payload.bytes}`;
    uniquePayloads.set(payloadKey, entry.payload.bytes);
  }
  return {
    manifestPath,
    archivePath,
    entries,
    metrics: {
      archiveInclusiveBytes: requireInteger(value.archiveBytes, code, "archive-inclusive bytes"),
      uniquePayloadBytes: [...uniquePayloads.values()].reduce((sum, bytes) => sum + bytes, 0),
      looseEvidenceBytes: requireInteger(value.looseEvidenceBytes, code, "loose evidence bytes"),
    },
    authority: "EVIDENCE_ONLY",
    mutationAuthorization: false,
    targetedPruning: "OFF",
  };
}

export function defineEvidenceBundleProfile(input) {
  const body = normalizeEvidenceBundleInput(input);
  return deepFreeze({
    schemaVersion: EVIDENCE_BUNDLE_PROFILE_SCHEMA,
    ...body,
    profileIdentity: semanticIdentity(EVIDENCE_BUNDLE_PROFILE_SCHEMA, body),
  });
}

function normalizeSealedEvidenceBundleProfile(input) {
  const code = "EVIDENCE_BUNDLE_INVALID";
  const value = requireExactKeys(
    input,
    [
      "archivePath",
      "authority",
      "entries",
      "manifestPath",
      "metrics",
      "mutationAuthorization",
      "profileIdentity",
      "schemaVersion",
      "targetedPruning",
    ],
    code,
    "sealed evidence bundle profile",
  );
  if (
    value.schemaVersion !== EVIDENCE_BUNDLE_PROFILE_SCHEMA ||
    value.authority !== "EVIDENCE_ONLY" ||
    value.mutationAuthorization !== false ||
    value.targetedPruning !== "OFF"
  ) {
    fail(code, "bundle schema or permanent authority boundary is invalid");
  }
  const metrics = requireExactKeys(
    value.metrics,
    ["archiveInclusiveBytes", "looseEvidenceBytes", "uniquePayloadBytes"],
    code,
    "bundle metrics",
  );
  const body = normalizeEvidenceBundleInput({
    manifestPath: value.manifestPath,
    archivePath: value.archivePath,
    entries: value.entries,
    archiveBytes: metrics.archiveInclusiveBytes,
    looseEvidenceBytes: metrics.looseEvidenceBytes,
  });
  if (body.metrics.uniquePayloadBytes !== metrics.uniquePayloadBytes) {
    fail("EVIDENCE_BUNDLE_PROFILE_MISMATCH", "unique payload metric drift");
  }
  const profileIdentity = normalizeSha256(value.profileIdentity, code, "bundle profile identity");
  if (profileIdentity !== semanticIdentity(EVIDENCE_BUNDLE_PROFILE_SCHEMA, body)) {
    fail("EVIDENCE_BUNDLE_PROFILE_MISMATCH", "profile identity drift");
  }
  return { schemaVersion: EVIDENCE_BUNDLE_PROFILE_SCHEMA, ...body, profileIdentity };
}

function normalizeEvidenceObservation(input, code, index) {
  const value = requireExactKeys(
    input,
    ["availability", "entryId", "locator", "payload"],
    code,
    `evidence observation ${index}`,
  );
  const payload = requireExactKeys(
    value.payload,
    ["bytes", "sha256"],
    code,
    `observed payload ${index}`,
  );
  const normalizedPayload = {
    bytes: requireInteger(payload.bytes, code, `observed payload bytes ${index}`),
    sha256: normalizeSha256(payload.sha256, code, `observed payload SHA-256 ${index}`),
  };
  return {
    entryId: normalizePortableIdentifier(value.entryId, code, `observed entry ID ${index}`),
    payload: normalizedPayload,
    locator: normalizeEvidenceLocator(value.locator, code, `observed locator ${index}`),
    availability: normalizeEvidenceAvailability(
      value.availability,
      normalizedPayload.sha256,
      code,
      `observed availability ${index}`,
    ),
  };
}

export function verifyEvidenceBundleProfile(profileInput, observationsInput) {
  const profile = normalizeSealedEvidenceBundleProfile(profileInput);
  if (!Array.isArray(observationsInput)) {
    fail("EVIDENCE_BUNDLE_OBSERVATION_INVALID", "observations must be an array");
  }
  const observations = observationsInput.map((entry, index) =>
    normalizeEvidenceObservation(entry, "EVIDENCE_BUNDLE_OBSERVATION_INVALID", index),
  );
  const byId = new Map();
  for (const observation of observations) {
    if (byId.has(observation.entryId)) {
      fail("EVIDENCE_BUNDLE_AMBIGUOUS_OBSERVATION", observation.entryId);
    }
    byId.set(observation.entryId, observation);
  }
  if (byId.size !== profile.entries.length) {
    fail("EVIDENCE_BUNDLE_PAYLOAD_MISSING", "observation inventory is not exact");
  }
  for (const entry of profile.entries) {
    const observation = byId.get(entry.entryId);
    if (observation === undefined) fail("EVIDENCE_BUNDLE_PAYLOAD_MISSING", entry.entryId);
    if (canonicalJson(observation.locator) !== canonicalJson(entry.locator)) {
      fail("EVIDENCE_BUNDLE_LOCATOR_DRIFT", entry.entryId);
    }
    if (observation.payload.bytes !== entry.payload.bytes) {
      fail("EVIDENCE_BUNDLE_PAYLOAD_BYTES_MISMATCH", entry.entryId);
    }
    if (observation.payload.sha256 !== entry.payload.sha256) {
      fail("EVIDENCE_BUNDLE_PAYLOAD_HASH_MISMATCH", entry.entryId);
    }
    if (
      entry.disposition === "REFERENCED" &&
      (entry.availability.disposition !== "AVAILABLE" ||
        observation.availability.disposition !== "AVAILABLE")
    ) {
      fail("EVIDENCE_BUNDLE_REFERENCE_UNAVAILABLE", entry.entryId);
    }
    if (observation.availability.disposition !== "AVAILABLE") {
      fail("EVIDENCE_BUNDLE_PAYLOAD_UNAVAILABLE", entry.entryId);
    }
  }
  const body = {
    profileIdentity: profile.profileIdentity,
    entryCount: profile.entries.length,
    metrics: profile.metrics,
    disposition: "VERIFIED",
    authority: "EVIDENCE_ONLY",
    mutationAuthorization: false,
    targetedPruning: "OFF",
  };
  return deepFreeze({
    schemaVersion: EVIDENCE_BUNDLE_VERIFICATION_SCHEMA,
    ...body,
    verificationIdentity: semanticIdentity(EVIDENCE_BUNDLE_VERIFICATION_SCHEMA, body),
  });
}

function normalizeInvocationRecordBody(input, code = "INVOCATION_RECORD_INVALID") {
  const value = requireExactKeys(
    input,
    [
      "argumentsIdentity",
      "attempt",
      "candidateIdentity",
      "commandIdentity",
      "cwdIdentity",
      "disposition",
      "endedAt",
      "environmentIdentity",
      "evidenceIdentity",
      "exitCode",
      "firstFailureIdentity",
      "proofClass",
      "result",
      "reusedInvocationIdentity",
      "startedAt",
      "taskId",
      "toolchainIdentity",
    ],
    code,
    "invocation record",
  );
  const disposition = requireText(value.disposition, code, "invocation disposition", 32);
  const result = requireText(value.result, code, "invocation result", 32);
  if (!INVOCATION_DISPOSITIONS.has(disposition) || !INVOCATION_RESULTS.has(result)) {
    fail(code, "invocation disposition or result is invalid");
  }
  const firstFailureIdentity = normalizeOptionalSha256(
    value.firstFailureIdentity,
    code,
    "first-failure identity",
  );
  const reusedInvocationIdentity = normalizeOptionalSha256(
    value.reusedInvocationIdentity,
    code,
    "reused invocation identity",
  );
  let exitCode;
  if (disposition === "EXECUTED") {
    if (result === "REUSED" || reusedInvocationIdentity !== null) {
      fail(code, "executed invocation cannot claim reuse");
    }
    exitCode = requireInteger(value.exitCode, code, "exit code");
    if ((result === "PASS") !== (exitCode === 0)) {
      fail(code, "executed result and exit code are inconsistent");
    }
    if (result === "FAIL" && firstFailureIdentity === null) {
      fail(code, "failed invocation requires first-failure identity");
    }
  } else {
    if (result !== "REUSED" || value.exitCode !== null || reusedInvocationIdentity === null) {
      fail(code, "reused invocation fields are inconsistent");
    }
    exitCode = null;
  }
  return {
    taskId: normalizePortableIdentifier(value.taskId, code, "task ID"),
    attempt: requireInteger(value.attempt, code, "attempt", 1),
    proofClass: normalizeRole(value.proofClass, code, "proof class"),
    commandIdentity: normalizeSha256(value.commandIdentity, code, "command identity"),
    argumentsIdentity: normalizeSha256(value.argumentsIdentity, code, "arguments identity"),
    cwdIdentity: normalizeSha256(value.cwdIdentity, code, "cwd identity"),
    toolchainIdentity: normalizeSha256(value.toolchainIdentity, code, "toolchain identity"),
    environmentIdentity: normalizeSha256(value.environmentIdentity, code, "environment identity"),
    candidateIdentity: normalizeSha256(value.candidateIdentity, code, "candidate identity"),
    evidenceIdentity: normalizeSha256(value.evidenceIdentity, code, "evidence identity"),
    startedAt: requireText(value.startedAt, code, "start", 128),
    endedAt: requireText(value.endedAt, code, "end", 128),
    exitCode,
    result,
    firstFailureIdentity,
    disposition,
    reusedInvocationIdentity,
    authority: "EVIDENCE_ONLY",
    mutationAuthorization: false,
    targetedPruning: "OFF",
  };
}

export function createInvocationRecord(input) {
  const body = normalizeInvocationRecordBody(input);
  return deepFreeze({
    schemaVersion: INVOCATION_RECORD_SCHEMA,
    ...body,
    invocationIdentity: semanticIdentity(INVOCATION_RECORD_SCHEMA, body),
  });
}

function normalizeSealedInvocationRecord(input) {
  const code = "INVOCATION_RECORD_INVALID";
  const value = requireExactKeys(
    input,
    [
      "argumentsIdentity",
      "attempt",
      "authority",
      "candidateIdentity",
      "commandIdentity",
      "cwdIdentity",
      "disposition",
      "endedAt",
      "environmentIdentity",
      "evidenceIdentity",
      "exitCode",
      "firstFailureIdentity",
      "invocationIdentity",
      "mutationAuthorization",
      "proofClass",
      "result",
      "reusedInvocationIdentity",
      "schemaVersion",
      "startedAt",
      "targetedPruning",
      "taskId",
      "toolchainIdentity",
    ],
    code,
    "sealed invocation record",
  );
  if (
    value.schemaVersion !== INVOCATION_RECORD_SCHEMA ||
    value.authority !== "EVIDENCE_ONLY" ||
    value.mutationAuthorization !== false ||
    value.targetedPruning !== "OFF"
  ) {
    fail(code, "invocation schema or permanent authority boundary is invalid");
  }
  const body = normalizeInvocationRecordBody({
    taskId: value.taskId,
    attempt: value.attempt,
    proofClass: value.proofClass,
    commandIdentity: value.commandIdentity,
    argumentsIdentity: value.argumentsIdentity,
    cwdIdentity: value.cwdIdentity,
    toolchainIdentity: value.toolchainIdentity,
    environmentIdentity: value.environmentIdentity,
    candidateIdentity: value.candidateIdentity,
    evidenceIdentity: value.evidenceIdentity,
    startedAt: value.startedAt,
    endedAt: value.endedAt,
    exitCode: value.exitCode,
    result: value.result,
    firstFailureIdentity: value.firstFailureIdentity,
    disposition: value.disposition,
    reusedInvocationIdentity: value.reusedInvocationIdentity,
  });
  const invocationIdentity = normalizeSha256(value.invocationIdentity, code, "invocation identity");
  if (invocationIdentity !== semanticIdentity(INVOCATION_RECORD_SCHEMA, body)) {
    fail("INVOCATION_RECORD_MISMATCH", `${value.taskId}:${value.attempt}`);
  }
  return { schemaVersion: INVOCATION_RECORD_SCHEMA, ...body, invocationIdentity };
}

function normalizeInvocationLedgerLineage(input, code = "INVOCATION_LEDGER_INVALID") {
  const value = requireExactKeys(
    input,
    ["kind", "parentLedgerIdentity"],
    code,
    "invocation ledger lineage",
  );
  const kind = requireText(value.kind, code, "invocation ledger lineage kind", 32);
  if (kind === "ROOT") {
    if (value.parentLedgerIdentity !== null) {
      fail(code, "root invocation ledger cannot claim a parent");
    }
    return { kind, parentLedgerIdentity: null };
  }
  if (kind === "EXTENSION") {
    return {
      kind,
      parentLedgerIdentity: normalizeSha256(
        value.parentLedgerIdentity,
        code,
        "parent invocation ledger identity",
      ),
    };
  }
  fail(code, "invocation ledger lineage kind is invalid");
}

function deriveInvocationLedgerBody(recordsInput, lineageInput) {
  if (!Array.isArray(recordsInput) || recordsInput.length === 0) {
    fail("INVOCATION_LEDGER_INVALID", "ledger must contain records");
  }
  const lineage = normalizeInvocationLedgerLineage(lineageInput);
  const records = recordsInput.map((record) => normalizeSealedInvocationRecord(record));
  records.sort((left, right) =>
    `${left.taskId}\0${left.proofClass}\0${String(left.attempt).padStart(16, "0")}\0${left.invocationIdentity}`.localeCompare(
      `${right.taskId}\0${right.proofClass}\0${String(right.attempt).padStart(16, "0")}\0${right.invocationIdentity}`,
    ),
  );
  const identities = new Set();
  const invocationRows = new Set();
  const byIdentity = new Map();
  for (const record of records) {
    const row = `${record.taskId}\0${record.proofClass}\0${record.attempt}`;
    if (identities.has(record.invocationIdentity)) {
      fail("INVOCATION_LEDGER_DUPLICATE_IDENTITY", record.invocationIdentity);
    }
    if (invocationRows.has(row)) fail("INVOCATION_LEDGER_AMBIGUOUS_ROW", row);
    identities.add(record.invocationIdentity);
    invocationRows.add(row);
    byIdentity.set(record.invocationIdentity, record);
  }

  const firstFailureByGroup = new Map();
  for (const record of records) {
    const group = `${record.taskId}\0${record.proofClass}`;
    if (record.disposition === "EXECUTED" && record.result === "FAIL") {
      if (!firstFailureByGroup.has(group)) {
        firstFailureByGroup.set(group, record.firstFailureIdentity);
      } else if (record.firstFailureIdentity !== firstFailureByGroup.get(group)) {
        fail("INVOCATION_LEDGER_FIRST_FAILURE_LINEAGE_MISMATCH", group);
      }
    } else if (
      firstFailureByGroup.has(group) &&
      record.firstFailureIdentity !== firstFailureByGroup.get(group)
    ) {
      fail("INVOCATION_LEDGER_FIRST_FAILURE_LINEAGE_MISMATCH", group);
    }

    if (record.disposition === "REUSED") {
      const reused = byIdentity.get(record.reusedInvocationIdentity);
      if (
        reused === undefined ||
        reused.disposition !== "EXECUTED" ||
        reused.candidateIdentity !== record.candidateIdentity ||
        reused.proofClass !== record.proofClass ||
        reused.evidenceIdentity !== record.evidenceIdentity
      ) {
        fail("INVOCATION_LEDGER_REUSE_BINDING_MISMATCH", record.invocationIdentity);
      }
    }
  }

  const metrics = {
    invocationCount: records.length,
    executedCount: records.filter((record) => record.disposition === "EXECUTED").length,
    reusedCount: records.filter((record) => record.disposition === "REUSED").length,
    failedCount: records.filter((record) => record.result === "FAIL").length,
    firstFailureIdentities: [...new Set(firstFailureByGroup.values())].sort(),
  };
  const body = {
    records,
    metrics,
    lineage,
    appendOnly: true,
    authority: "EVIDENCE_ONLY",
    mutationAuthorization: false,
    targetedPruning: "OFF",
  };
  return body;
}

function sealInvocationLedger(recordsInput, lineageInput) {
  const body = deriveInvocationLedgerBody(recordsInput, lineageInput);
  return deepFreeze({
    schemaVersion: INVOCATION_LEDGER_SCHEMA,
    ...body,
    ledgerIdentity: semanticIdentity(INVOCATION_LEDGER_SCHEMA, body),
  });
}

export function createInvocationLedger(recordsInput) {
  return sealInvocationLedger(recordsInput, { kind: "ROOT", parentLedgerIdentity: null });
}

function normalizeSealedInvocationLedger(input) {
  const code = "INVOCATION_LEDGER_INVALID";
  const value = requireExactKeys(
    input,
    [
      "appendOnly",
      "authority",
      "ledgerIdentity",
      "lineage",
      "metrics",
      "mutationAuthorization",
      "records",
      "schemaVersion",
      "targetedPruning",
    ],
    code,
    "sealed invocation ledger",
  );
  if (
    value.schemaVersion !== INVOCATION_LEDGER_SCHEMA ||
    value.appendOnly !== true ||
    value.authority !== "EVIDENCE_ONLY" ||
    value.mutationAuthorization !== false ||
    value.targetedPruning !== "OFF"
  ) {
    fail(code, "invocation ledger schema or permanent authority boundary is invalid");
  }
  requireExactKeys(
    value.metrics,
    ["executedCount", "failedCount", "firstFailureIdentities", "invocationCount", "reusedCount"],
    code,
    "invocation ledger metrics",
  );
  const body = deriveInvocationLedgerBody(value.records, value.lineage);
  if (canonicalJson(value.metrics) !== canonicalJson(body.metrics)) {
    fail("INVOCATION_LEDGER_METRICS_MISMATCH");
  }
  const ledgerIdentity = normalizeSha256(value.ledgerIdentity, code, "invocation ledger identity");
  if (ledgerIdentity !== semanticIdentity(INVOCATION_LEDGER_SCHEMA, body)) {
    fail("INVOCATION_LEDGER_MISMATCH", ledgerIdentity);
  }
  return { schemaVersion: INVOCATION_LEDGER_SCHEMA, ...body, ledgerIdentity };
}

export function extendInvocationLedger(parentLedgerInput, appendedRecordsInput) {
  const parent = normalizeSealedInvocationLedger(parentLedgerInput);
  if (!Array.isArray(appendedRecordsInput) || appendedRecordsInput.length === 0) {
    fail("INVOCATION_LEDGER_EXTENSION_INVALID", "extension must append records");
  }
  return sealInvocationLedger([...parent.records, ...appendedRecordsInput], {
    kind: "EXTENSION",
    parentLedgerIdentity: parent.ledgerIdentity,
  });
}

export function verifyInvocationLedgerExtension(expectedParentInput, candidateInput) {
  const expectedParent = normalizeSealedInvocationLedger(expectedParentInput);
  const candidate = normalizeSealedInvocationLedger(candidateInput);
  if (candidate.lineage.kind !== "EXTENSION") {
    fail("INVOCATION_LEDGER_NOT_EXTENSION", candidate.ledgerIdentity);
  }
  if (candidate.lineage.parentLedgerIdentity !== expectedParent.ledgerIdentity) {
    fail("INVOCATION_LEDGER_PARENT_MISMATCH", candidate.lineage.parentLedgerIdentity);
  }
  const candidateByIdentity = new Map(
    candidate.records.map((record) => [record.invocationIdentity, record]),
  );
  for (const parentRecord of expectedParent.records) {
    const retained = candidateByIdentity.get(parentRecord.invocationIdentity);
    if (retained === undefined) {
      fail("INVOCATION_LEDGER_PARENT_RECORD_MISSING", parentRecord.invocationIdentity);
    }
    if (canonicalJson(retained) !== canonicalJson(parentRecord)) {
      fail("INVOCATION_LEDGER_PARENT_RECORD_REWRITTEN", parentRecord.invocationIdentity);
    }
  }
  if (candidate.records.length <= expectedParent.records.length) {
    fail("INVOCATION_LEDGER_EXTENSION_EMPTY", candidate.ledgerIdentity);
  }
  const body = {
    expectedParentLedgerIdentity: expectedParent.ledgerIdentity,
    candidateLedgerIdentity: candidate.ledgerIdentity,
    retainedRecordCount: expectedParent.records.length,
    appendedRecordCount: candidate.records.length - expectedParent.records.length,
    disposition: "VERIFIED",
    authority: "EVIDENCE_ONLY",
    mutationAuthorization: false,
    targetedPruning: "OFF",
  };
  return deepFreeze({
    schemaVersion: INVOCATION_LEDGER_EXTENSION_VERIFICATION_SCHEMA,
    ...body,
    verificationIdentity: semanticIdentity(INVOCATION_LEDGER_EXTENSION_VERIFICATION_SCHEMA, body),
  });
}

function normalizeHostedCiBody(input, code = "HOSTED_CI_EVIDENCE_INVALID") {
  const value = requireExactKeys(
    input,
    [
      "attempt",
      "conclusion",
      "event",
      "headSha",
      "jobId",
      "provider",
      "ref",
      "repository",
      "retainedEvidence",
      "runId",
      "status",
      "workflow",
    ],
    code,
    "hosted CI evidence",
  );
  const workflow = requireExactKeys(
    value.workflow,
    ["identity", "path"],
    code,
    "hosted CI workflow",
  );
  const retainedEvidence = requireExactKeys(
    value.retainedEvidence,
    ["identity", "required"],
    code,
    "retained hosted evidence",
  );
  const status = requireText(value.status, code, "hosted CI status", 32);
  const conclusion = requireText(value.conclusion, code, "hosted CI conclusion", 32);
  if (!HOSTED_STATUSES.has(status) || !HOSTED_CONCLUSIONS.has(conclusion)) {
    fail(code, "hosted CI status or conclusion is invalid");
  }
  const retainedRequired = requireBoolean(
    retainedEvidence.required,
    code,
    "retained evidence required",
  );
  let retainedIdentity = null;
  if (retainedRequired) {
    retainedIdentity = normalizeSha256(
      retainedEvidence.identity,
      code,
      "retained evidence identity",
    );
  } else if (retainedEvidence.identity !== null) {
    fail(code, "optional retained evidence identity must be null when absent");
  }
  return {
    provider: normalizePortableIdentifier(value.provider, code, "provider"),
    repository: normalizePortableIdentifier(value.repository, code, "repository"),
    headSha: normalizeGitSha(value.headSha, code, "hosted CI head SHA"),
    workflow: {
      identity: normalizeSha256(workflow.identity, code, "workflow identity"),
      path: normalizePortablePath(workflow.path, code, "workflow path"),
    },
    event: normalizePortableIdentifier(value.event, code, "event"),
    ref: normalizePortableIdentifier(value.ref, code, "ref"),
    runId: normalizePortableIdentifier(value.runId, code, "run ID"),
    attempt: requireInteger(value.attempt, code, "attempt", 1),
    jobId: normalizePortableIdentifier(value.jobId, code, "job ID"),
    status,
    conclusion,
    retainedEvidence: {
      required: retainedRequired,
      identity: retainedIdentity,
    },
  };
}

export function createHostedCiEvidence(input) {
  const body = normalizeHostedCiBody(input);
  return deepFreeze({
    schemaVersion: HOSTED_CI_EVIDENCE_SCHEMA,
    ...body,
    authority: "EVIDENCE_ONLY",
    evidenceIdentity: semanticIdentity(HOSTED_CI_EVIDENCE_SCHEMA, body),
  });
}

function normalizeSealedHostedCiEvidence(input) {
  const code = "HOSTED_CI_EVIDENCE_INVALID";
  const value = requireExactKeys(
    input,
    [
      "attempt",
      "authority",
      "conclusion",
      "event",
      "evidenceIdentity",
      "headSha",
      "jobId",
      "provider",
      "ref",
      "repository",
      "retainedEvidence",
      "runId",
      "schemaVersion",
      "status",
      "workflow",
    ],
    code,
    "sealed hosted CI evidence",
  );
  if (value.schemaVersion !== HOSTED_CI_EVIDENCE_SCHEMA || value.authority !== "EVIDENCE_ONLY") {
    fail(code, "hosted CI schema or authority marker is invalid");
  }
  const body = normalizeHostedCiBody({
    provider: value.provider,
    repository: value.repository,
    headSha: value.headSha,
    workflow: value.workflow,
    event: value.event,
    ref: value.ref,
    runId: value.runId,
    attempt: value.attempt,
    jobId: value.jobId,
    status: value.status,
    conclusion: value.conclusion,
    retainedEvidence: value.retainedEvidence,
  });
  const evidenceIdentity = normalizeSha256(
    value.evidenceIdentity,
    code,
    "hosted CI evidence identity",
  );
  if (evidenceIdentity !== semanticIdentity(HOSTED_CI_EVIDENCE_SCHEMA, body)) {
    fail("HOSTED_CI_EVIDENCE_MISMATCH", "evidence identity does not match content");
  }
  return {
    schemaVersion: HOSTED_CI_EVIDENCE_SCHEMA,
    ...body,
    authority: "EVIDENCE_ONLY",
    evidenceIdentity,
  };
}

function normalizeHostedCiRequirements(input) {
  const code = "HOSTED_CI_EVIDENCE_INVALID";
  const value = requireExactKeys(
    input,
    [
      "attempt",
      "conclusion",
      "event",
      "evidenceIdentity",
      "headSha",
      "jobId",
      "provider",
      "ref",
      "repository",
      "retainedEvidence",
      "runId",
      "status",
      "workflow",
    ],
    code,
    "hosted CI requirements",
  );
  return {
    ...normalizeHostedCiBody({
      provider: value.provider,
      repository: value.repository,
      headSha: value.headSha,
      workflow: value.workflow,
      event: value.event,
      ref: value.ref,
      runId: value.runId,
      attempt: value.attempt,
      jobId: value.jobId,
      status: value.status,
      conclusion: value.conclusion,
      retainedEvidence: value.retainedEvidence,
    }),
    evidenceIdentity: normalizeSha256(
      value.evidenceIdentity,
      code,
      "required hosted CI evidence identity",
    ),
  };
}

export function verifyHostedCiEvidence(evidenceInput, requirementsInput) {
  const evidence = normalizeSealedHostedCiEvidence(evidenceInput);
  const requirements = normalizeHostedCiRequirements(requirementsInput);
  const evidenceBody = {
    provider: evidence.provider,
    repository: evidence.repository,
    headSha: evidence.headSha,
    workflow: evidence.workflow,
    event: evidence.event,
    ref: evidence.ref,
    runId: evidence.runId,
    attempt: evidence.attempt,
    jobId: evidence.jobId,
    status: evidence.status,
    conclusion: evidence.conclusion,
    retainedEvidence: evidence.retainedEvidence,
    evidenceIdentity: evidence.evidenceIdentity,
  };
  if (canonicalJson(evidenceBody) !== canonicalJson(requirements)) {
    fail("HOSTED_CI_EVIDENCE_MISMATCH", "hosted CI requirements do not match");
  }
  return deepFreeze({
    disposition: "VERIFIED",
    evidenceIdentity: evidence.evidenceIdentity,
    headSha: evidence.headSha,
    runId: evidence.runId,
    attempt: evidence.attempt,
    jobId: evidence.jobId,
    conclusion: evidence.conclusion,
    authority: "EVIDENCE_ONLY",
  });
}

export function createHostedCiHistory(recordsInput) {
  if (!Array.isArray(recordsInput) || recordsInput.length === 0) {
    fail("HOSTED_CI_HISTORY_INVALID", "history must contain evidence records");
  }
  const records = recordsInput.map((record) => normalizeSealedHostedCiEvidence(record));
  records.sort((left, right) => left.evidenceIdentity.localeCompare(right.evidenceIdentity));
  const evidenceIdentities = new Set();
  const runAttempts = new Set();
  for (const record of records) {
    const runAttempt = `${record.provider}\0${record.repository}\0${record.runId}\0${record.attempt}`;
    if (evidenceIdentities.has(record.evidenceIdentity) || runAttempts.has(runAttempt)) {
      fail("HOSTED_CI_HISTORY_INVALID", "duplicate hosted CI evidence record");
    }
    evidenceIdentities.add(record.evidenceIdentity);
    runAttempts.add(runAttempt);
  }
  const body = {
    records,
    authority: "EVIDENCE_ONLY",
  };
  return deepFreeze({
    schemaVersion: HOSTED_CI_HISTORY_SCHEMA,
    ...body,
    historyIdentity: semanticIdentity(HOSTED_CI_HISTORY_SCHEMA, body),
  });
}

function normalizeSnapshotRequirements(input) {
  const code = "PUBLICATION_SNAPSHOT_INVALID";
  const value = requireExactKeys(
    input,
    [
      "candidateIdentity",
      "commitParent",
      "commitSha",
      "commitTree",
      "files",
      "hostedCi",
      "remoteRef",
      "stagedTree",
      "validatedSnapshotIdentity",
    ],
    code,
    "publication snapshot requirements",
  );
  const files = normalizeFileInventory(value.files, code);
  return {
    candidateIdentity: normalizeSha256(
      value.candidateIdentity,
      code,
      "required candidate identity",
    ),
    validatedSnapshotIdentity: normalizeSha256(
      value.validatedSnapshotIdentity,
      code,
      "required validated snapshot identity",
    ),
    files,
    fileInventoryIdentity: semanticIdentity(PUBLICATION_FILE_INVENTORY_SCHEMA, {
      files,
    }),
    stagedTree: normalizeGitSha(value.stagedTree, code, "required staged tree"),
    commitSha: normalizeGitSha(value.commitSha, code, "required commit SHA"),
    commitTree: normalizeGitSha(value.commitTree, code, "required commit tree"),
    commitParent: normalizeGitSha(value.commitParent, code, "required commit parent"),
    remoteRef: normalizePortableIdentifier(value.remoteRef, code, "required remote ref"),
    hostedCi: normalizeHostedCiRequirements(value.hostedCi),
  };
}

function normalizeReviewedCandidate(input) {
  const code = "PUBLICATION_SNAPSHOT_INVALID";
  const value = requireExactKeys(
    input,
    ["candidateIdentity", "files", "reviewIdentity", "validatedSnapshotIdentity"],
    code,
    "reviewed candidate",
  );
  const files = normalizeFileInventory(value.files, code);
  return {
    candidateIdentity: normalizeSha256(
      value.candidateIdentity,
      code,
      "reviewed candidate identity",
    ),
    validatedSnapshotIdentity: normalizeSha256(
      value.validatedSnapshotIdentity,
      code,
      "reviewed validated snapshot identity",
    ),
    reviewIdentity: normalizeSha256(value.reviewIdentity, code, "review identity"),
    files,
    fileInventoryIdentity: semanticIdentity(PUBLICATION_FILE_INVENTORY_SCHEMA, {
      files,
    }),
  };
}

function normalizeValidatedSnapshot(input) {
  const code = "PUBLICATION_SNAPSHOT_INVALID";
  const value = requireExactKeys(
    input,
    ["candidateIdentity", "files", "snapshotIdentity"],
    code,
    "validated snapshot",
  );
  const files = normalizeFileInventory(value.files, code);
  return {
    candidateIdentity: normalizeSha256(
      value.candidateIdentity,
      code,
      "validated candidate identity",
    ),
    snapshotIdentity: normalizeSha256(value.snapshotIdentity, code, "validated snapshot identity"),
    files,
    fileInventoryIdentity: semanticIdentity(PUBLICATION_FILE_INVENTORY_SCHEMA, {
      files,
    }),
  };
}

function normalizeStagedSnapshot(input) {
  const code = "PUBLICATION_SNAPSHOT_INVALID";
  const value = requireExactKeys(
    input,
    ["candidateIdentity", "files", "tree"],
    code,
    "staged snapshot",
  );
  const files = normalizeFileInventory(value.files, code);
  return {
    candidateIdentity: normalizeSha256(value.candidateIdentity, code, "staged candidate identity"),
    tree: normalizeGitSha(value.tree, code, "staged tree"),
    files,
    fileInventoryIdentity: semanticIdentity(PUBLICATION_FILE_INVENTORY_SCHEMA, {
      files,
    }),
  };
}

function normalizeCommitSnapshot(input) {
  const code = "PUBLICATION_SNAPSHOT_INVALID";
  const value = requireExactKeys(
    input,
    ["candidateIdentity", "files", "parent", "sha", "tree"],
    code,
    "commit snapshot",
  );
  const files = normalizeFileInventory(value.files, code);
  return {
    candidateIdentity: normalizeSha256(
      value.candidateIdentity,
      code,
      "committed candidate identity",
    ),
    sha: normalizeGitSha(value.sha, code, "commit SHA"),
    tree: normalizeGitSha(value.tree, code, "commit tree"),
    parent: normalizeGitSha(value.parent, code, "commit parent"),
    files,
    fileInventoryIdentity: semanticIdentity(PUBLICATION_FILE_INVENTORY_SCHEMA, {
      files,
    }),
  };
}

function normalizeRemoteSnapshot(input) {
  const code = "PUBLICATION_SNAPSHOT_INVALID";
  const value = requireExactKeys(input, ["ref", "sha"], code, "remote snapshot");
  return {
    ref: normalizePortableIdentifier(value.ref, code, "remote ref"),
    sha: normalizeGitSha(value.sha, code, "remote SHA"),
  };
}

function snapshotMismatch(condition, detail) {
  if (!condition) {
    fail("PUBLICATION_SNAPSHOT_MISMATCH", detail);
  }
}

export function verifyPublicationSnapshot(input) {
  const code = "PUBLICATION_SNAPSHOT_INVALID";
  const value = requireExactKeys(
    input,
    [
      "commit",
      "hostedCi",
      "remote",
      "requirements",
      "reviewedCandidate",
      "staged",
      "validatedSnapshot",
    ],
    code,
    "publication snapshot",
  );
  const requirements = normalizeSnapshotRequirements(value.requirements);
  const reviewedCandidate = normalizeReviewedCandidate(value.reviewedCandidate);
  const validatedSnapshot = normalizeValidatedSnapshot(value.validatedSnapshot);
  const staged = normalizeStagedSnapshot(value.staged);
  const commit = normalizeCommitSnapshot(value.commit);
  const remote = normalizeRemoteSnapshot(value.remote);
  let hostedCi;
  try {
    hostedCi = normalizeSealedHostedCiEvidence(value.hostedCi);
  } catch (error) {
    fail("PUBLICATION_SNAPSHOT_MISMATCH", error.code ?? "hosted CI invalid");
  }

  const candidateIdentities = [
    reviewedCandidate.candidateIdentity,
    validatedSnapshot.candidateIdentity,
    staged.candidateIdentity,
    commit.candidateIdentity,
  ];
  snapshotMismatch(
    candidateIdentities.every((identity) => identity === requirements.candidateIdentity),
    "candidate identity chain",
  );
  snapshotMismatch(
    reviewedCandidate.validatedSnapshotIdentity === requirements.validatedSnapshotIdentity &&
      validatedSnapshot.snapshotIdentity === requirements.validatedSnapshotIdentity,
    "validated snapshot identity chain",
  );
  const inventoryIdentities = [
    reviewedCandidate.fileInventoryIdentity,
    validatedSnapshot.fileInventoryIdentity,
    staged.fileInventoryIdentity,
    commit.fileInventoryIdentity,
  ];
  snapshotMismatch(
    inventoryIdentities.every((identity) => identity === requirements.fileInventoryIdentity),
    "reviewed file/blob inventory chain",
  );
  snapshotMismatch(
    requirements.stagedTree === requirements.commitTree &&
      staged.tree === requirements.stagedTree &&
      commit.tree === requirements.commitTree,
    "staged and committed tree chain",
  );
  snapshotMismatch(
    commit.sha === requirements.commitSha && commit.parent === requirements.commitParent,
    "commit identity chain",
  );
  snapshotMismatch(
    remote.ref === requirements.remoteRef && remote.sha === requirements.commitSha,
    "remote ref chain",
  );
  snapshotMismatch(hostedCi.headSha === requirements.commitSha, "hosted CI head chain");
  try {
    verifyHostedCiEvidence(hostedCi, requirements.hostedCi);
  } catch (error) {
    fail("PUBLICATION_SNAPSHOT_MISMATCH", error.code ?? "hosted CI mismatch");
  }

  const body = {
    disposition: "VERIFIED",
    candidateIdentity: requirements.candidateIdentity,
    reviewIdentity: reviewedCandidate.reviewIdentity,
    validatedSnapshotIdentity: requirements.validatedSnapshotIdentity,
    fileInventoryIdentity: requirements.fileInventoryIdentity,
    stagedTree: requirements.stagedTree,
    commitSha: requirements.commitSha,
    commitTree: requirements.commitTree,
    remoteRef: requirements.remoteRef,
    hostedCiEvidenceIdentity: hostedCi.evidenceIdentity,
    authority: "EVIDENCE_ONLY",
  };
  return deepFreeze({
    schemaVersion: PUBLICATION_SNAPSHOT_VERIFICATION_SCHEMA,
    ...body,
    verificationIdentity: semanticIdentity(PUBLICATION_SNAPSHOT_VERIFICATION_SCHEMA, body),
  });
}

function normalizeNullableSha256(value, code, label) {
  return value === null ? null : normalizeSha256(value, code, label);
}

function normalizeAuthorityExpectations(input) {
  const code = "PUBLICATION_FACT_INVALID";
  const value = requireExactKeys(
    input,
    [
      "commitAuthorizationIdentity",
      "hostedCiEvidenceIdentity",
      "independentReviewIdentity",
      "pushAuthorizationIdentity",
      "sourcePromotionAuthorizationIdentity",
    ],
    code,
    "authority expectations",
  );
  return {
    commitAuthorizationIdentity: normalizeNullableSha256(
      value.commitAuthorizationIdentity,
      code,
      "expected commit authorization identity",
    ),
    pushAuthorizationIdentity: normalizeNullableSha256(
      value.pushAuthorizationIdentity,
      code,
      "expected push authorization identity",
    ),
    hostedCiEvidenceIdentity: normalizeNullableSha256(
      value.hostedCiEvidenceIdentity,
      code,
      "expected hosted CI evidence identity",
    ),
    independentReviewIdentity: normalizeNullableSha256(
      value.independentReviewIdentity,
      code,
      "expected independent review identity",
    ),
    sourcePromotionAuthorizationIdentity: normalizeNullableSha256(
      value.sourcePromotionAuthorizationIdentity,
      code,
      "expected Source-promotion authorization identity",
    ),
  };
}

function normalizeExternalArtifact(input, schemaVersion, bodyKeys, bodyNormalizer) {
  const code = "PUBLICATION_FACT_INVALID";
  const value = requireExactKeys(
    input,
    ["artifactIdentity", "schemaVersion", ...bodyKeys],
    code,
    schemaVersion,
  );
  if (value.schemaVersion !== schemaVersion) {
    fail(code, `${schemaVersion} schema mismatch`);
  }
  const body = bodyNormalizer(value, code);
  const artifactIdentity = normalizeSha256(
    value.artifactIdentity,
    code,
    `${schemaVersion} artifact identity`,
  );
  if (artifactIdentity !== semanticIdentity(schemaVersion, body)) {
    fail(code, `${schemaVersion} artifact identity mismatch`);
  }
  return { schemaVersion, ...body, artifactIdentity };
}

function normalizeCommitAuthorization(input) {
  if (input === null) return null;
  return normalizeExternalArtifact(
    input,
    COMMIT_AUTHORIZATION_SCHEMA,
    ["candidateIdentity", "current", "decision"],
    (value, code) => {
      if (value.decision !== "AUTHORIZED" && value.decision !== "DENIED") {
        fail(code, "commit authorization decision is invalid");
      }
      return {
        candidateIdentity: normalizeSha256(
          value.candidateIdentity,
          code,
          "commit-authorized candidate identity",
        ),
        decision: value.decision,
        current: requireBoolean(value.current, code, "commit authorization current"),
      };
    },
  );
}

function normalizePushAuthorization(input) {
  if (input === null) return null;
  return normalizeExternalArtifact(
    input,
    PUSH_AUTHORIZATION_SCHEMA,
    ["commitSha", "current", "decision"],
    (value, code) => {
      if (value.decision !== "AUTHORIZED" && value.decision !== "DENIED") {
        fail(code, "push authorization decision is invalid");
      }
      return {
        commitSha: normalizeGitSha(value.commitSha, code, "push-authorized commit SHA"),
        decision: value.decision,
        current: requireBoolean(value.current, code, "push authorization current"),
      };
    },
  );
}

function normalizeIndependentReview(input) {
  if (input === null) return null;
  return normalizeExternalArtifact(
    input,
    INDEPENDENT_REVIEW_SCHEMA,
    ["candidateIdentity", "commitSha", "current", "decision", "hostedEvidenceIdentity"],
    (value, code) => {
      if (value.decision !== "ACCEPTED" && value.decision !== "REJECTED") {
        fail(code, "independent review decision is invalid");
      }
      return {
        candidateIdentity: normalizeSha256(
          value.candidateIdentity,
          code,
          "reviewed candidate identity",
        ),
        commitSha: normalizeGitSha(value.commitSha, code, "reviewed commit SHA"),
        hostedEvidenceIdentity: normalizeSha256(
          value.hostedEvidenceIdentity,
          code,
          "reviewed hosted evidence identity",
        ),
        decision: value.decision,
        current: requireBoolean(value.current, code, "independent review current"),
      };
    },
  );
}

function normalizeSourcePromotionAuthorization(input) {
  if (input === null) return null;
  return normalizeExternalArtifact(
    input,
    SOURCE_PROMOTION_AUTHORIZATION_SCHEMA,
    ["current", "decision", "reviewIdentity", "sourceGeneration"],
    (value, code) => {
      if (value.decision !== "AUTHORIZED" && value.decision !== "DENIED") {
        fail(code, "Source-promotion authorization decision is invalid");
      }
      return {
        reviewIdentity: normalizeSha256(
          value.reviewIdentity,
          code,
          "Source-promotion review identity",
        ),
        sourceGeneration: normalizeSha256(value.sourceGeneration, code, "Source generation"),
        decision: value.decision,
        current: requireBoolean(value.current, code, "Source-promotion authorization current"),
      };
    },
  );
}

function normalizeImplementationFact(input) {
  if (input === null) return null;
  const code = "PUBLICATION_FACT_INVALID";
  const value = requireExactKeys(
    input,
    ["candidateIdentity", "evidenceIdentity"],
    code,
    "implementation fact",
  );
  return {
    candidateIdentity: normalizeSha256(
      value.candidateIdentity,
      code,
      "implemented candidate identity",
    ),
    evidenceIdentity: normalizeSha256(
      value.evidenceIdentity,
      code,
      "implementation evidence identity",
    ),
  };
}

function normalizeCommitFact(input) {
  if (input === null) return null;
  const code = "PUBLICATION_FACT_INVALID";
  const value = requireExactKeys(input, ["candidateIdentity", "sha", "tree"], code, "commit fact");
  return {
    candidateIdentity: normalizeSha256(
      value.candidateIdentity,
      code,
      "committed candidate identity",
    ),
    sha: normalizeGitSha(value.sha, code, "commit fact SHA"),
    tree: normalizeGitSha(value.tree, code, "commit fact tree"),
  };
}

function normalizeRemoteFact(input) {
  if (input === null) return null;
  const code = "PUBLICATION_FACT_INVALID";
  const value = requireExactKeys(input, ["ref", "sha"], code, "remote fact");
  return {
    ref: normalizePortableIdentifier(value.ref, code, "remote fact ref"),
    sha: normalizeGitSha(value.sha, code, "remote fact SHA"),
  };
}

function normalizeCommandResults(input) {
  const code = "PUBLICATION_FACT_INVALID";
  if (!Array.isArray(input)) {
    fail(code, "command results must be an array");
  }
  return input.map((entry, index) => {
    const value = requireExactKeys(entry, ["command", "success"], code, `command result ${index}`);
    return {
      command: requireText(value.command, code, `command ${index}`, 1024),
      success: requireBoolean(value.success, code, `command success ${index}`),
    };
  });
}

function disposition(satisfied) {
  return satisfied ? "SATISFIED" : "BLOCKED";
}

export function evaluatePublicationStates(input) {
  const code = "PUBLICATION_FACT_INVALID";
  const value = requireExactKeys(
    input,
    [
      "authorityExpectations",
      "commandResults",
      "commit",
      "commitAuthorization",
      "hostedCi",
      "implementation",
      "independentReview",
      "narrative",
      "pushAuthorization",
      "remote",
      "sourceGeneration",
      "sourcePromotionAuthorization",
    ],
    code,
    "publication state facts",
  );
  const authorityExpectations = normalizeAuthorityExpectations(value.authorityExpectations);
  const implementation = normalizeImplementationFact(value.implementation);
  const commitAuthorization = normalizeCommitAuthorization(value.commitAuthorization);
  const commit = normalizeCommitFact(value.commit);
  const pushAuthorization = normalizePushAuthorization(value.pushAuthorization);
  const remote = normalizeRemoteFact(value.remote);
  const hostedCi = value.hostedCi === null ? null : normalizeSealedHostedCiEvidence(value.hostedCi);
  const independentReview = normalizeIndependentReview(value.independentReview);
  const sourcePromotionAuthorization = normalizeSourcePromotionAuthorization(
    value.sourcePromotionAuthorization,
  );
  const sourceGeneration = normalizeSha256(
    value.sourceGeneration,
    code,
    "current Source generation",
  );
  const commandResults = normalizeCommandResults(value.commandResults);
  const narrative =
    value.narrative === null ? null : requireText(value.narrative, code, "narrative", 4096);

  const implemented = implementation !== null;
  const commitAuthorized =
    implemented &&
    commitAuthorization?.decision === "AUTHORIZED" &&
    commitAuthorization.current &&
    commitAuthorization.candidateIdentity === implementation.candidateIdentity &&
    authorityExpectations.commitAuthorizationIdentity === commitAuthorization.artifactIdentity;
  const committed =
    implemented && commit !== null && commit.candidateIdentity === implementation.candidateIdentity;
  const pushAuthorized =
    committed &&
    pushAuthorization?.decision === "AUTHORIZED" &&
    pushAuthorization.current &&
    pushAuthorization.commitSha === commit.sha &&
    authorityExpectations.pushAuthorizationIdentity === pushAuthorization.artifactIdentity;
  const pushed = committed && remote !== null && remote.sha === commit.sha;
  const hostedCiAccepted =
    pushed &&
    hostedCi !== null &&
    hostedCi.headSha === commit.sha &&
    hostedCi.status === "COMPLETED" &&
    hostedCi.conclusion === "SUCCESS" &&
    authorityExpectations.hostedCiEvidenceIdentity === hostedCi.evidenceIdentity;
  const reviewAccepted =
    hostedCiAccepted &&
    independentReview?.decision === "ACCEPTED" &&
    independentReview.current &&
    independentReview.candidateIdentity === implementation.candidateIdentity &&
    independentReview.commitSha === commit.sha &&
    independentReview.hostedEvidenceIdentity === hostedCi.evidenceIdentity &&
    authorityExpectations.independentReviewIdentity === independentReview.artifactIdentity;
  const sourcePromotionAuthorized =
    reviewAccepted &&
    sourcePromotionAuthorization?.decision === "AUTHORIZED" &&
    sourcePromotionAuthorization.current &&
    sourcePromotionAuthorization.reviewIdentity === independentReview.artifactIdentity &&
    sourcePromotionAuthorization.sourceGeneration === sourceGeneration &&
    authorityExpectations.sourcePromotionAuthorizationIdentity ===
      sourcePromotionAuthorization.artifactIdentity;

  const states = {
    IMPLEMENTED: disposition(implemented),
    COMMIT_AUTHORIZED: disposition(commitAuthorized),
    COMMITTED: disposition(committed),
    PUSH_AUTHORIZED: disposition(pushAuthorized),
    PUSHED: disposition(pushed),
    HOSTED_CI_ACCEPTED: disposition(hostedCiAccepted),
    REVIEW_ACCEPTED: disposition(reviewAccepted),
    SOURCE_PROMOTION_AUTHORIZED: disposition(sourcePromotionAuthorized),
  };
  const body = {
    states,
    sourceGeneration,
    ignoredAdvisoryMetadata: {
      commandResultCount: commandResults.length,
      narrativePresent: narrative !== null,
    },
    authority: "VERIFICATION_ONLY",
  };
  return deepFreeze({
    schemaVersion: PUBLICATION_STATE_EVALUATION_SCHEMA,
    ...body,
    evaluationIdentity: semanticIdentity(PUBLICATION_STATE_EVALUATION_SCHEMA, {
      ...body,
      authorityExpectations,
      implementation,
      commitAuthorization,
      commit,
      pushAuthorization,
      remote,
      hostedCi,
      independentReview,
      sourcePromotionAuthorization,
      commandResults,
      narrative,
    }),
  });
}
