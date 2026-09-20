import { Buffer } from "node:buffer";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import { semanticIdentity } from "./state-domain.mjs";

const RESTORE_SET_SCHEMA = "CIC_I9_RESTORE_SET_V1";
const ENTRY_SCHEMA = "CIC_I9_RESTORE_SET_ENTRY_V1";
const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;
const GIT_OBJECT_ID_PATTERN = /^[0-9a-f]{40}(?:[0-9a-f]{24})?$/u;
const POINTER_ONLY = new Set(["BINARY", "BUILD", "LARGE", "MEDIA"]);
const CLASSIFICATIONS = new Set([...POINTER_ONLY, "OTHER", "PATCH", "TEXT"]);
const RETENTION_CLASSES = new Set([
  "ACTIVE_PROTECTED",
  "ARCHIVE_RETAINED",
  "CLOSURE_PROTECTED",
  "REBUILDABLE",
]);
const AVAILABILITY = new Set(["REFERENCE_ONLY", "REQUIRED"]);
const ROLES = new Set([
  "LEASE_HISTORY",
  "PACK_STATE",
  "PROGRESSION_STATE",
  "RECOVERY_CAPSULE",
  "REQUIRED_EVIDENCE",
  "STATE_DOMAIN_BINDING",
  "TASK_AUTHORIZATION",
]);

export const I9_RESTORE_SET_LIMITS = Object.freeze({
  maxEntries: 4096,
  maxInlineItemBytes: 1_048_576,
  maxLocatorBytes: 1024,
  maxPayloadBytes: 67_108_864,
});

function fail(code) {
  throw Object.assign(new Error(code), { code });
}

function exactKeys(value, expected, code = "RESTORE_SET_INVALID") {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).sort().join("\0") !== [...expected].sort().join("\0")
  ) {
    fail(code);
  }
}

function identity(value) {
  if (typeof value !== "string" || !IDENTITY_PATTERN.test(value)) {
    fail("RESTORE_SET_INVALID");
  }
  return value;
}

function portableLocator(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    value.startsWith("/") ||
    value.normalize("NFC") !== value ||
    Buffer.byteLength(value, "utf8") > I9_RESTORE_SET_LIMITS.maxLocatorBytes
  ) {
    fail("RESTORE_SET_PATH_INVALID");
  }
  const parts = value.split("/");
  if (parts.some((part) => part.length === 0 || part === "." || part === "..")) {
    fail("RESTORE_SET_PATH_INVALID");
  }
  return value;
}

function collisionKey(value) {
  return value.normalize("NFC").toLowerCase();
}

function assertNoCollisions(values) {
  if (new Set(values.map(collisionKey)).size !== values.length) {
    fail("CONTEXT_IDENTITY_COLLISION");
  }
}

function normalizeRepository(value) {
  exactKeys(value, ["head", "repositoryIdentity", "tree"]);
  if (!GIT_OBJECT_ID_PATTERN.test(value.head) || !GIT_OBJECT_ID_PATTERN.test(value.tree)) {
    fail("RESTORE_SET_INVALID");
  }
  return {
    repositoryIdentity: identity(value.repositoryIdentity),
    head: value.head,
    tree: value.tree,
  };
}

function normalizeRawEntry(value) {
  exactKeys(value, [
    "availability",
    "bytes",
    "classification",
    "locator",
    "retentionClass",
    "role",
    "sha256",
    "stableIdentity",
  ]);
  if (
    !ROLES.has(value.role) ||
    !CLASSIFICATIONS.has(value.classification) ||
    !RETENTION_CLASSES.has(value.retentionClass) ||
    !AVAILABILITY.has(value.availability) ||
    !Number.isSafeInteger(value.bytes) ||
    value.bytes < 0
  ) {
    fail("RESTORE_SET_INVALID");
  }
  if (value.availability === "REQUIRED" && value.retentionClass === "REBUILDABLE") {
    fail("RESTORE_SET_INVALID");
  }
  if (
    !POINTER_ONLY.has(value.classification) &&
    value.bytes > I9_RESTORE_SET_LIMITS.maxInlineItemBytes
  ) {
    fail("RESTORE_SET_ITEM_LIMIT_EXCEEDED");
  }
  const locator = portableLocator(value.locator);
  const sha256 = identity(value.sha256);
  return {
    schemaVersion: ENTRY_SCHEMA,
    role: value.role,
    stableIdentity: identity(value.stableIdentity),
    classification: value.classification,
    retentionClass: value.retentionClass,
    availability: value.availability,
    disposition: POINTER_ONLY.has(value.classification) ? "POINTER_PLUS_HASH" : "DURABLE_REQUIRED",
    locator,
    objectLocator: `objects/${sha256}.bin`,
    bytes: value.bytes,
    sha256,
  };
}

function normalizeStoredEntry(value) {
  exactKeys(value, [
    "availability",
    "bytes",
    "classification",
    "disposition",
    "locator",
    "objectLocator",
    "retentionClass",
    "role",
    "schemaVersion",
    "sha256",
    "stableIdentity",
  ]);
  if (value.schemaVersion !== ENTRY_SCHEMA) fail("RESTORE_SET_INVALID");
  const raw = normalizeRawEntry({
    role: value.role,
    stableIdentity: value.stableIdentity,
    classification: value.classification,
    retentionClass: value.retentionClass,
    availability: value.availability,
    locator: value.locator,
    bytes: value.bytes,
    sha256: value.sha256,
  });
  if (
    raw.disposition !== value.disposition ||
    raw.objectLocator !== value.objectLocator ||
    canonicalJson(raw) !== canonicalJson(value)
  ) {
    fail("RESTORE_SET_INVALID");
  }
  return raw;
}

function normalizeLink(value) {
  exactKeys(value, [
    "kind",
    "sourceField",
    "sourceLocator",
    "targetField",
    "targetIdentity",
    "targetLocator",
  ]);
  if (
    value.kind !== "JSON_IDENTITY" ||
    typeof value.sourceField !== "string" ||
    typeof value.targetField !== "string" ||
    !/^[A-Za-z][A-Za-z0-9]{0,63}$/u.test(value.sourceField) ||
    !/^[A-Za-z][A-Za-z0-9]{0,63}$/u.test(value.targetField)
  ) {
    fail("RESTORE_SET_INVALID");
  }
  return {
    kind: value.kind,
    sourceLocator: portableLocator(value.sourceLocator),
    sourceField: value.sourceField,
    targetLocator: portableLocator(value.targetLocator),
    targetField: value.targetField,
    targetIdentity: identity(value.targetIdentity),
  };
}

function normalizeEntries(values, stored = false) {
  if (!Array.isArray(values) || values.length === 0) fail("RESTORE_SET_INVALID");
  if (values.length > I9_RESTORE_SET_LIMITS.maxEntries) {
    fail("RESTORE_SET_ENTRY_LIMIT_EXCEEDED");
  }
  const entries = values
    .map((value) => (stored ? normalizeStoredEntry(value) : normalizeRawEntry(value)))
    .sort((left, right) => left.locator.localeCompare(right.locator));
  assertNoCollisions(entries.map(({ locator }) => locator));
  assertNoCollisions(entries.map(({ stableIdentity }) => stableIdentity));
  if (
    entries.reduce((total, entry) => total + entry.bytes, 0) > I9_RESTORE_SET_LIMITS.maxPayloadBytes
  ) {
    fail("RESTORE_SET_PAYLOAD_LIMIT_EXCEEDED");
  }
  return entries;
}

function normalizeLinks(values, entries) {
  if (!Array.isArray(values)) fail("RESTORE_SET_INVALID");
  const links = values
    .map(normalizeLink)
    .sort((left, right) =>
      `${left.sourceLocator}\0${left.sourceField}`.localeCompare(
        `${right.sourceLocator}\0${right.sourceField}`,
      ),
    );
  assertNoCollisions(
    links.map(({ sourceLocator, sourceField }) => `${sourceLocator}#${sourceField}`),
  );
  const locators = new Set(entries.map(({ locator }) => locator));
  if (
    links.some(
      ({ sourceLocator, targetLocator }) =>
        !locators.has(sourceLocator) || !locators.has(targetLocator),
    )
  ) {
    fail("RESTORE_SET_LINK_INVALID");
  }
  return links;
}

function manifestBody(input, stored = false) {
  const entries = normalizeEntries(input.entries, stored);
  return {
    schemaVersion: RESTORE_SET_SCHEMA,
    limits: { ...I9_RESTORE_SET_LIMITS },
    repository: normalizeRepository(input.repository),
    sourceGeneration: identity(input.sourceGeneration),
    capsuleIdentity: identity(input.capsuleIdentity),
    entries,
    links: normalizeLinks(input.links, entries),
    authorityGrants: [],
  };
}

export function defineGovernedRestoreSet(input) {
  exactKeys(input, ["capsuleIdentity", "entries", "links", "repository", "sourceGeneration"]);
  const body = manifestBody(input);
  return {
    ...body,
    restoreSetIdentity: semanticIdentity("CIC-I9-RESTORE-SET-V1", body),
  };
}

function verifyManifestIntrinsic(manifest) {
  exactKeys(manifest, [
    "authorityGrants",
    "capsuleIdentity",
    "entries",
    "limits",
    "links",
    "repository",
    "restoreSetIdentity",
    "schemaVersion",
    "sourceGeneration",
  ]);
  if (
    manifest.schemaVersion !== RESTORE_SET_SCHEMA ||
    canonicalJson(manifest.limits) !== canonicalJson(I9_RESTORE_SET_LIMITS) ||
    !Array.isArray(manifest.authorityGrants) ||
    manifest.authorityGrants.length !== 0
  ) {
    fail("RESTORE_SET_INVALID");
  }
  const body = manifestBody(manifest, true);
  const restoreSetIdentity = semanticIdentity("CIC-I9-RESTORE-SET-V1", body);
  if (
    identity(manifest.restoreSetIdentity) !== restoreSetIdentity ||
    canonicalJson(manifest) !== canonicalJson({ ...body, restoreSetIdentity })
  ) {
    fail("RESTORE_SET_INVALID");
  }
  return { ...body, restoreSetIdentity };
}

async function assertAbsentRoot(root) {
  if (typeof root !== "string" || root.length === 0) fail("RESTORE_SET_PATH_INVALID");
  try {
    await lstat(root);
    fail("RESTORE_SET_DESTINATION_NOT_EMPTY");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const parent = path.dirname(path.resolve(root));
  const parentStats = await lstat(parent);
  if (!parentStats.isDirectory() || parentStats.isSymbolicLink()) {
    fail("RESTORE_SET_PATH_INVALID");
  }
}

async function readBoundedSource(sourceRoot, sourceLocator) {
  const locator = portableLocator(sourceLocator);
  let root;
  try {
    const rootStats = await lstat(sourceRoot);
    if (!rootStats.isDirectory() || rootStats.isSymbolicLink()) fail("RESTORE_SET_PATH_INVALID");
    root = await realpath(sourceRoot);
    let cursor = root;
    const parts = locator.split("/");
    for (const part of parts) {
      cursor = path.join(cursor, part);
      const stats = await lstat(cursor);
      if (stats.isSymbolicLink()) fail("RESTORE_SET_PATH_INVALID");
    }
    const stats = await lstat(cursor);
    if (!stats.isFile() || stats.isSymbolicLink()) fail("REQUIRED_OBJECT_UNAVAILABLE");
    const relative = path.relative(root, cursor);
    if (relative.startsWith("..") || path.isAbsolute(relative)) fail("RESTORE_SET_PATH_INVALID");
    return new Uint8Array(await readFile(cursor));
  } catch (error) {
    if (typeof error?.code === "string" && error.code.startsWith("RESTORE_SET_")) throw error;
    fail("REQUIRED_OBJECT_UNAVAILABLE");
  }
}

function normalizeCaptureSource(value) {
  exactKeys(value, [
    "availability",
    "classification",
    "locator",
    "retentionClass",
    "role",
    "sourceLocator",
    "sourceRoot",
    "stableIdentity",
  ]);
  if (typeof value.sourceRoot !== "string" || value.sourceRoot.length === 0) {
    fail("RESTORE_SET_PATH_INVALID");
  }
  return {
    ...value,
    locator: portableLocator(value.locator),
    sourceLocator: portableLocator(value.sourceLocator),
  };
}

async function checkedBytes(bytes, expected) {
  if (bytes.byteLength !== expected.bytes || sha256Hex(bytes) !== expected.sha256) {
    fail("REQUIRED_OBJECT_UNAVAILABLE");
  }
  return bytes;
}

async function verifyLinks(manifest, reader) {
  for (const link of manifest.links) {
    let source;
    let target;
    try {
      source = JSON.parse(Buffer.from(await reader(link.sourceLocator)).toString("utf8"));
      target = JSON.parse(Buffer.from(await reader(link.targetLocator)).toString("utf8"));
    } catch (error) {
      if (error?.code === "REQUIRED_OBJECT_UNAVAILABLE") throw error;
      fail("RESTORE_SET_LINK_INVALID");
    }
    if (
      source?.[link.sourceField] !== link.targetIdentity ||
      target?.[link.targetField] !== link.targetIdentity
    ) {
      fail("RESTORE_SET_LINK_INVALID");
    }
  }
}

export async function captureGovernedRestoreSet(input) {
  exactKeys(input, [
    "backupRoot",
    "capsuleIdentity",
    "links",
    "repository",
    "sourceGeneration",
    "sources",
  ]);
  if (!Array.isArray(input.sources) || input.sources.length === 0) fail("RESTORE_SET_INVALID");
  const captured = [];
  for (const rawSource of input.sources) {
    const source = normalizeCaptureSource(rawSource);
    const bytes = await readBoundedSource(source.sourceRoot, source.sourceLocator);
    captured.push({
      source,
      bytes,
      entry: {
        role: source.role,
        stableIdentity: source.stableIdentity,
        classification: source.classification,
        retentionClass: source.retentionClass,
        availability: source.availability,
        locator: source.locator,
        bytes: bytes.byteLength,
        sha256: sha256Hex(bytes),
      },
    });
  }
  const manifest = defineGovernedRestoreSet({
    repository: input.repository,
    sourceGeneration: input.sourceGeneration,
    capsuleIdentity: input.capsuleIdentity,
    entries: captured.map(({ entry }) => entry),
    links: input.links,
  });
  await assertAbsentRoot(input.backupRoot);
  await mkdir(path.join(input.backupRoot, "objects"), { recursive: true });
  const written = new Set();
  for (const { bytes, entry } of captured) {
    if (written.has(entry.sha256)) continue;
    await writeFile(path.join(input.backupRoot, "objects", `${entry.sha256}.bin`), bytes, {
      flag: "wx",
    });
    written.add(entry.sha256);
  }
  await writeFile(path.join(input.backupRoot, "manifest.json"), `${canonicalJson(manifest)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
  await verifyGovernedRestoreSet(manifest, { backupRoot: input.backupRoot });
  return manifest;
}

export async function verifyGovernedRestoreSet(manifestInput, { backupRoot } = {}) {
  const manifest = verifyManifestIntrinsic(manifestInput);
  let persisted;
  try {
    persisted = await readFile(path.join(backupRoot, "manifest.json"), "utf8");
  } catch {
    fail("REQUIRED_OBJECT_UNAVAILABLE");
  }
  if (persisted !== `${canonicalJson(manifest)}\n`) fail("REQUIRED_OBJECT_UNAVAILABLE");
  const byLocator = new Map(manifest.entries.map((entry) => [entry.locator, entry]));
  const reader = async (locator) => {
    const entry = byLocator.get(locator);
    if (entry === undefined) fail("RESTORE_SET_LINK_INVALID");
    let bytes;
    try {
      bytes = new Uint8Array(await readFile(path.join(backupRoot, entry.objectLocator)));
    } catch {
      fail("REQUIRED_OBJECT_UNAVAILABLE");
    }
    return checkedBytes(bytes, entry);
  };
  for (const entry of manifest.entries) await reader(entry.locator);
  await verifyLinks(manifest, reader);
  return {
    schemaVersion: "CIC_I9_RESTORE_SET_VERIFICATION_V1",
    status: "PASS",
    restoreSetIdentity: manifest.restoreSetIdentity,
    checkedEntries: manifest.entries.length,
    checkedBytes: manifest.entries.reduce((total, entry) => total + entry.bytes, 0),
    authorityGrants: [],
  };
}

export async function materializeGovernedRestoreSet(
  manifestInput,
  { backupRoot, restoreRoot } = {},
) {
  const manifest = verifyManifestIntrinsic(manifestInput);
  await verifyGovernedRestoreSet(manifest, { backupRoot });
  await assertAbsentRoot(restoreRoot);
  await mkdir(restoreRoot, { recursive: false });
  for (const entry of manifest.entries) {
    const bytes = new Uint8Array(await readFile(path.join(backupRoot, entry.objectLocator)));
    const target = path.join(restoreRoot, ...entry.locator.split("/"));
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes, { flag: "wx" });
  }
  const verification = await verifyRestoredGovernedSet(manifest, { restoreRoot });
  return { ...verification, authorityGrants: [] };
}

export async function verifyRestoredGovernedSet(manifestInput, { restoreRoot } = {}) {
  const manifest = verifyManifestIntrinsic(manifestInput);
  const byLocator = new Map(manifest.entries.map((entry) => [entry.locator, entry]));
  const reader = async (locator) => {
    const entry = byLocator.get(locator);
    if (entry === undefined) fail("RESTORE_SET_LINK_INVALID");
    const bytes = await readBoundedSource(restoreRoot, entry.locator);
    return checkedBytes(bytes, entry);
  };
  for (const entry of manifest.entries) await reader(entry.locator);
  await verifyLinks(manifest, reader);
  return {
    schemaVersion: "CIC_I9_RESTORED_SET_VERIFICATION_V1",
    status: "PASS",
    restoreSetIdentity: manifest.restoreSetIdentity,
    checkedEntries: manifest.entries.length,
    checkedBytes: manifest.entries.reduce((total, entry) => total + entry.bytes, 0),
    authorityGrants: [],
  };
}
