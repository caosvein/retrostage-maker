import { Buffer } from "node:buffer";
import { lstat, readFile, readlink, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { URL } from "node:url";
import { TextDecoder } from "node:util";

import { canonicalJson } from "./canonical-json.mjs";
import { evaluateExecutionCapabilities } from "./execution-capabilities.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./identity.mjs";
import { createReadonlyGitRunner } from "./readonly-git.mjs";
import { verifySourceGeneration } from "./source-generation.mjs";

const ABSENT_EXIT_CODES = Object.freeze([1, 128]);
// Diff payloads remain byte-addressed; their paths are independently covered by the
// strict tracked/index witnesses below, so arbitrary file bytes are never lossy-decoded.
const UTF8_SEMANTIC_OPERATIONS = new Set([
  "aheadBehind",
  "bare",
  "branchRef",
  "branchUpstreamConfig",
  "commonDir",
  "externalConfigLocal",
  "externalConfigWorktree",
  "filterDrivers",
  "gitDir",
  "head",
  "headSubject",
  "headTree",
  "indexEntries",
  "indexVisibility",
  "insideWorktree",
  "mergeBase",
  "objectFormat",
  "partialCloneConfig",
  "remoteUrls",
  "replaceRefs",
  "shallow",
  "sparseCheckout",
  "stashCount",
  "stashTip",
  "superprojectRoot",
  "topLevel",
  "trackedPaths",
  "untrackedPaths",
  "upstreamCommit",
  "upstreamRef",
  "version",
  "worktrees",
]);
const VIEW_ERROR_CODES = new Set([
  "CONTEXT_IDENTITY_COLLISION",
  "GIT_EXECUTABLE_UNAVAILABLE",
  "GIT_READ_OPERATION_FAILED",
  "REPOSITORY_EXTERNAL_CONFIG_UNSUPPORTED",
  "REPOSITORY_EXTERNAL_FILTER_UNSUPPORTED",
  "REPOSITORY_HISTORY_OVERLAY_UNSUPPORTED",
  "REPOSITORY_INDEX_VISIBILITY_UNSUPPORTED",
  "REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED",
  "REPOSITORY_BARE_UNSUPPORTED",
  "REPOSITORY_MISSING_OBJECT",
  "REPOSITORY_NESTED_VIEW",
  "REPOSITORY_NOT_WORKTREE",
  "REPOSITORY_PARTIAL_CLONE_VIEW",
  "REPOSITORY_ROOT_UNAVAILABLE",
  "REPOSITORY_SHALLOW_VIEW",
  "REPOSITORY_SPARSE_VIEW",
  "REPOSITORY_SUBMODULE_VIEW_UNSUPPORTED",
  "REPOSITORY_UPSTREAM_UNRESOLVED",
  "WORKTREE_PATH_OUTSIDE_ROOT",
  "WORKTREE_UNTRACKED_OBJECT_UNAVAILABLE",
]);

function compareText(left, right) {
  const leftPoints = Array.from(left, (character) => character.codePointAt(0));
  const rightPoints = Array.from(right, (character) => character.codePointAt(0));
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
}

function finding(code, detail) {
  return { code, detail };
}

function sortFindings(findings) {
  const unique = new Map(findings.map((entry) => [`${entry.code}\0${entry.detail}`, entry]));
  return [...unique.values()].sort((left, right) =>
    compareText(`${left.code}\0${left.detail}`, `${right.code}\0${right.detail}`),
  );
}

function text(bytes) {
  return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
}

function line(bytes) {
  return text(bytes).replace(/[\r\n]+$/u, "");
}

function nulFields(bytes) {
  const fields = text(bytes).split("\0");
  if (fields.at(-1) === "") fields.pop();
  return fields;
}

function booleanValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return "UNKNOWN";
}

function portablePathHash(value) {
  return sha256Hex(`CIC-LOCAL-PATH-V1\n${value}\n`);
}

function withoutUrlDecoration(value) {
  return value.split(/[?#]/u, 1)[0];
}

function normalizeRemotePath(value) {
  let decoded;
  try {
    decoded = decodeURIComponent(withoutUrlDecoration(value));
  } catch {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }
  const normalized = decoded
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/gu, "")
    .replace(/\.git$/iu, "");
  if (
    normalized.length === 0 ||
    normalized.split("/").length < 2 ||
    normalized
      .split("/")
      .some((segment) => segment === "" || segment === "." || segment === "..") ||
    /[\u0000-\u001F\u007F]/u.test(normalized)
  ) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }
  return normalized;
}

export function normalizeRemoteIdentity(value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }

  if (/^[a-z]:[\\/]/iu.test(value) || value.startsWith("/") || value.startsWith("\\\\")) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }

  if (/^(?:https|ssh):\/\//iu.test(value)) {
    let parsed;
    try {
      parsed = new URL(value);
    } catch {
      throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
    }
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== "https:" && protocol !== "ssh:") {
      throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
    }
    const host = parsed.hostname.toLowerCase();
    const defaultPort = protocol === "https:" ? "443" : "22";
    const port = parsed.port && parsed.port !== defaultPort ? `:${parsed.port}` : "";
    if (!/^[a-z0-9.-]+$/u.test(host) || host.startsWith(".") || host.endsWith(".")) {
      throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
    }
    return `${host}${port}/${normalizeRemotePath(parsed.pathname)}`;
  }

  if (/\s/u.test(value)) throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  const separator = value.indexOf(":");
  if (separator <= 0 || separator === value.length - 1) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }
  const authority = value.slice(0, separator);
  const remotePath = value.slice(separator + 1);
  if (remotePath.includes(":") || remotePath.includes("@")) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }
  const authorityParts = authority.split("@");
  if (authorityParts.length > 2 || authorityParts.some((part) => part.length === 0)) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }
  if (authorityParts.length === 2 && !/^[a-z0-9._-]+$/iu.test(authorityParts[0])) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }
  const host = authorityParts.at(-1).toLowerCase();
  if (!/^[a-z0-9.-]+$/u.test(host) || host.startsWith(".") || host.endsWith(".")) {
    throw new RangeError("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
  }
  return `${host}/${normalizeRemotePath(remotePath)}`;
}

export function repositoryIdentity(objectFormat, primaryRemote) {
  return sha256Hex(
    [
      "CIC-REPOSITORY-IDENTITY-V1",
      `object_format=${objectFormat}`,
      `primary_remote=${primaryRemote}`,
      "",
    ].join("\n"),
  );
}

export function detectPathCollisions(paths) {
  const exact = new Map();
  const nfc = new Map();
  const folded = new Map();
  const collisions = [];
  for (const candidate of paths) {
    const repositoryPath = normalizeRepoRelativePath(candidate);
    const identities = [
      ["EXACT", repositoryPath, exact],
      ["UNICODE_NFC", repositoryPath.normalize("NFC"), nfc],
      ["CASE_FOLDED", repositoryPath.normalize("NFC").toLowerCase(), folded],
    ];
    for (const [kind, identity, records] of identities) {
      const previous = records.get(identity);
      if (previous !== undefined && (kind === "EXACT" || previous !== repositoryPath)) {
        collisions.push({ kind, left: previous, right: repositoryPath });
      } else if (previous === undefined) {
        records.set(identity, repositoryPath);
      }
    }
  }
  return collisions.sort((left, right) =>
    compareText(
      `${left.kind}\0${left.left}\0${left.right}`,
      `${right.kind}\0${right.left}\0${right.right}`,
    ),
  );
}

export function classifyMutationSafety({ complete, clean, operationActive }) {
  if (!complete) return "VIEW_INCOMPLETE";
  if (operationActive) return "OPERATION_ACTIVE";
  return clean ? "CLEAN_BASELINE" : "DIRTY_COMPLETE";
}

function parseIndexEntries(bytes) {
  return nulFields(bytes).map((record) => {
    const tab = record.indexOf("\t");
    if (tab < 0) throw new TypeError("invalid staged index record");
    const [mode, objectId, stageText] = record.slice(0, tab).split(" ");
    const stage = Number.parseInt(stageText, 10);
    if (
      !/^[0-7]{6}$/u.test(mode) ||
      !/^[0-9a-f]{40,64}$/u.test(objectId) ||
      !Number.isInteger(stage)
    ) {
      throw new TypeError("invalid staged index metadata");
    }
    return {
      mode,
      objectId,
      path: normalizeRepoRelativePath(record.slice(tab + 1)),
      stage,
    };
  });
}

function parseIndexVisibility(bytes) {
  const entries = nulFields(bytes).map((record) => {
    if (record.length < 3 || record[1] !== " ") {
      throw new TypeError("invalid index visibility record");
    }
    const tag = record[0];
    if (!/^[A-Za-z?]$/u.test(tag)) throw new TypeError("invalid index visibility tag");
    return {
      assumeUnchanged: tag !== tag.toUpperCase(),
      path: normalizeRepoRelativePath(record.slice(2)),
      skipWorktree: tag.toUpperCase() === "S",
    };
  });
  return {
    assumeUnchangedCount: entries.filter(({ assumeUnchanged }) => assumeUnchanged).length,
    entries,
    skipWorktreeCount: entries.filter(({ skipWorktree }) => skipWorktree).length,
  };
}

function parseConfigRecords(bytes, operationId, errors) {
  const records = [];
  for (const field of nulFields(bytes)) {
    const separator = field.indexOf("\n");
    if (separator < 0) {
      errors.push(
        finding("GIT_READ_OPERATION_FAILED", `operation=${operationId};parse=INVALID_RECORD`),
      );
      return null;
    }
    records.push({
      key: field.slice(0, separator).replace(/\r$/u, ""),
      value: field.slice(separator + 1),
    });
  }
  return records;
}

function parseRemoteConfiguration(bytes, errors) {
  const fields = nulFields(bytes);
  const records = [];
  let readFailure = false;
  for (const field of fields) {
    const separator = field.indexOf("\n");
    if (separator < 0) {
      readFailure = true;
      errors.push(
        finding("GIT_READ_OPERATION_FAILED", "operation=remoteUrls;parse=INVALID_RECORD"),
      );
      continue;
    }
    const key = field.slice(0, separator).replace(/\r$/u, "");
    const value = field.slice(separator + 1);
    const match = /^remote\.(.+)\.url$/u.exec(key);
    if (match === null) {
      readFailure = true;
      errors.push(finding("GIT_READ_OPERATION_FAILED", "operation=remoteUrls;parse=INVALID_KEY"));
      continue;
    }
    try {
      records.push({ name: match[1], identity: normalizeRemoteIdentity(value) });
    } catch {
      errors.push(finding("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED", "configured-remote"));
    }
  }
  const identities = [...new Set(records.map(({ identity }) => identity))].sort(compareText);
  const originIdentities = [
    ...new Set(records.filter(({ name }) => name === "origin").map(({ identity }) => identity)),
  ];
  const primaryRemote =
    originIdentities.length === 1
      ? originIdentities[0]
      : originIdentities.length === 0 && identities.length === 1
        ? identities[0]
        : null;
  if (primaryRemote === null) {
    errors.push(finding("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED", "primary-remote-unavailable"));
  }
  return { identities, primaryRemote, readFailure };
}

function parseWorktrees(bytes) {
  const records = [];
  let current = null;
  for (const field of nulFields(bytes)) {
    if (field === "") {
      if (current !== null) records.push(current);
      current = null;
      continue;
    }
    const separator = field.indexOf(" ");
    const key = separator < 0 ? field : field.slice(0, separator);
    const value = separator < 0 ? "" : field.slice(separator + 1);
    if (key === "worktree") {
      if (current !== null) records.push(current);
      current = {
        location: value,
        head: null,
        branchRef: null,
        detached: false,
        locked: false,
        prunable: false,
      };
    } else if (current !== null && key === "HEAD") current.head = value;
    else if (current !== null && key === "branch") current.branchRef = value;
    else if (current !== null && key === "detached") current.detached = true;
    else if (current !== null && key === "locked") current.locked = true;
    else if (current !== null && key === "prunable") current.prunable = true;
  }
  if (current !== null) records.push(current);
  const portable = records
    .map(({ head, branchRef, detached, locked, prunable }) => ({
      branch:
        detached || branchRef === null
          ? { state: "DETACHED", ref: null }
          : { state: "SYMBOLIC", ref: branchRef },
      head,
      locked,
      prunable,
    }))
    .sort((left, right) => compareText(canonicalJson(left), canonicalJson(right)));
  const locationHashes = records
    .map(({ location }) => portablePathHash(location))
    .sort(compareText);
  return { portable, locationHashes };
}

async function pathState(candidate) {
  try {
    await lstat(candidate);
    return "PRESENT";
  } catch (error) {
    if (error && error.code === "ENOENT") return "ABSENT_PROVEN";
    return "UNKNOWN";
  }
}

async function observeOperationState(gitDir, errors) {
  let filesystemAvailable = true;
  const markers = {
    bisect: "BISECT_START",
    cherryPick: "CHERRY_PICK_HEAD",
    merge: "MERGE_HEAD",
    revert: "REVERT_HEAD",
  };
  const result = {};
  for (const [name, marker] of Object.entries(markers)) {
    const state = await pathState(path.join(gitDir, marker));
    result[name] = state;
    if (state === "UNKNOWN") {
      filesystemAvailable = false;
      errors.push(finding("GIT_READ_OPERATION_FAILED", `operation-state=${name}`));
    }
  }
  const rebaseStates = await Promise.all([
    pathState(path.join(gitDir, "rebase-apply")),
    pathState(path.join(gitDir, "rebase-merge")),
  ]);
  result.rebase = rebaseStates.includes("PRESENT")
    ? "PRESENT"
    : rebaseStates.includes("UNKNOWN")
      ? "UNKNOWN"
      : "ABSENT_PROVEN";
  if (result.rebase === "UNKNOWN") {
    filesystemAvailable = false;
    errors.push(finding("GIT_READ_OPERATION_FAILED", "operation-state=rebase"));
  }
  return { filesystemAvailable, operations: result };
}

async function observeAncestorRepositoryMarker(repositoryRoot) {
  let current = path.dirname(repositoryRoot);
  while (true) {
    try {
      const marker = await lstat(path.join(current, ".git"));
      if (marker.isFile() || marker.isDirectory()) return { nested: true, readAvailable: true };
      return { nested: "UNKNOWN", readAvailable: false };
    } catch (error) {
      if (!error || error.code !== "ENOENT") return { nested: "UNKNOWN", readAvailable: false };
    }
    const parent = path.dirname(current);
    if (parent === current) return { nested: false, readAvailable: true };
    current = parent;
  }
}

function pathWithinRoot(repositoryRoot, repositoryPath) {
  const absolute = path.resolve(repositoryRoot, ...repositoryPath.split("/"));
  const relative = path.relative(repositoryRoot, absolute);
  if (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  ) {
    return absolute;
  }
  throw new RangeError("WORKTREE_PATH_OUTSIDE_ROOT");
}

async function observeUntracked(repositoryRoot, paths, errors) {
  const entries = [];
  let filesystemAvailable = true;
  for (const rawPath of paths) {
    let repositoryPath;
    let absolute;
    try {
      repositoryPath = normalizeRepoRelativePath(rawPath);
      absolute = pathWithinRoot(repositoryRoot, repositoryPath);
    } catch {
      errors.push(finding("WORKTREE_PATH_OUTSIDE_ROOT", "untracked-path"));
      continue;
    }
    try {
      const metadata = await lstat(absolute);
      if (metadata.isFile()) {
        const bytes = await readFile(absolute);
        entries.push({
          bytes: bytes.byteLength,
          kind: "REGULAR_FILE",
          path: repositoryPath,
          sha256: sha256Hex(bytes),
        });
      } else if (metadata.isSymbolicLink()) {
        const target = Buffer.from(await readlink(absolute, { encoding: "buffer" }));
        entries.push({
          bytes: target.byteLength,
          kind: "SYMBOLIC_LINK",
          path: repositoryPath,
          sha256: sha256Hex(target),
        });
      } else {
        entries.push({ bytes: null, kind: "UNKNOWN", path: repositoryPath, sha256: null });
        errors.push(finding("WORKTREE_UNTRACKED_OBJECT_UNAVAILABLE", `path=${repositoryPath}`));
      }
    } catch (error) {
      filesystemAvailable = false;
      const cause = error && typeof error.code === "string" ? error.code : "UNAVAILABLE";
      entries.push({ bytes: null, kind: "UNKNOWN", path: repositoryPath, sha256: null });
      errors.push(
        finding("WORKTREE_UNTRACKED_OBJECT_UNAVAILABLE", `path=${repositoryPath};cause=${cause}`),
      );
    }
  }
  return {
    entries: entries.sort((left, right) => compareText(left.path, right.path)),
    filesystemAvailable,
  };
}

function addViewErrors(facts, errors) {
  const indexVisibility = facts.index.visibility ?? {
    assumeUnchangedCount: 0,
    skipWorktreeCount: 0,
  };
  const checks = [
    [facts.view.insideWorktree !== true, "REPOSITORY_NOT_WORKTREE", "inside-worktree"],
    [facts.view.bare === true, "REPOSITORY_BARE_UNSUPPORTED", "bare=true"],
    [facts.view.shallow === true, "REPOSITORY_SHALLOW_VIEW", "shallow=true"],
    [facts.view.sparse === true, "REPOSITORY_SPARSE_VIEW", "sparse=true"],
    [facts.view.partial === true, "REPOSITORY_PARTIAL_CLONE_VIEW", "partial=true"],
    [facts.view.nested === true, "REPOSITORY_NESTED_VIEW", "nested=true"],
    [
      facts.view.externalConfig === true,
      "REPOSITORY_EXTERNAL_CONFIG_UNSUPPORTED",
      "external-ignore-or-attributes-config",
    ],
    [
      facts.view.externalFilters === true,
      "REPOSITORY_EXTERNAL_FILTER_UNSUPPORTED",
      "external-filter-driver",
    ],
    [
      facts.view.historyOverlay === true,
      "REPOSITORY_HISTORY_OVERLAY_UNSUPPORTED",
      "replace-ref-or-graft",
    ],
    [facts.view.missingObjects === true, "REPOSITORY_MISSING_OBJECT", "missing-object-witness"],
    [
      indexVisibility.skipWorktreeCount > 0,
      "REPOSITORY_SPARSE_VIEW",
      `skip-worktree-count=${indexVisibility.skipWorktreeCount}`,
    ],
    [
      indexVisibility.assumeUnchangedCount > 0,
      "REPOSITORY_INDEX_VISIBILITY_UNSUPPORTED",
      `assume-unchanged-count=${indexVisibility.assumeUnchangedCount}`,
    ],
    [
      facts.index.entries.some(({ mode }) => mode === "160000"),
      "REPOSITORY_SUBMODULE_VIEW_UNSUPPORTED",
      "gitlink-index-entry",
    ],
  ];
  for (const [material, code, detail] of checks) if (material) errors.push(finding(code, detail));
  for (const [key, value] of Object.entries(facts.view)) {
    if (value === "UNKNOWN") errors.push(finding("GIT_READ_OPERATION_FAILED", `view=${key}`));
  }
}

export function finalizeRepositoryObservation(facts) {
  const errors = [...facts.observationErrors];
  addViewErrors(facts, errors);

  const collisions = detectPathCollisions([
    ...new Set(facts.trackedPaths),
    ...new Set(facts.untracked.entries.map(({ path: repositoryPath }) => repositoryPath)),
  ]);
  if (collisions.length !== 0)
    errors.push(finding("CONTEXT_IDENTITY_COLLISION", `count=${collisions.length}`));

  const capabilities = evaluateExecutionCapabilities(facts.capabilityEvidence);
  if (capabilities.status !== "PASS") {
    errors.push(
      finding(
        "REQUIRED_CAPABILITY_UNAVAILABLE",
        `missing=${capabilities.missing.join(",") || "NONE"};unknown=${capabilities.unknown.join(",") || "NONE"}`,
      ),
    );
  }
  if (facts.sourceGeneration.status !== "PASS") {
    errors.push(finding("SOURCE_GENERATION_UNAVAILABLE", "CIC-I1 prerequisite"));
  }
  if (facts.repository.primaryRemote === null) {
    errors.push(finding("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED", "primary-remote-unavailable"));
  }

  const viewComplete = !errors.some(({ code }) => VIEW_ERROR_CODES.has(code));
  if (!viewComplete)
    errors.push(finding("REPOSITORY_VIEW_INCOMPLETE", "one-or-more-view-preconditions-blocked"));

  const operationActive = Object.values(facts.operations).includes("PRESENT");
  const clean =
    facts.index.unmergedStageCount === 0 &&
    facts.staged.bytes === 0 &&
    facts.unstaged.bytes === 0 &&
    facts.untracked.entries.length === 0 &&
    !operationActive;
  const mutationSafety = classifyMutationSafety({ complete: viewComplete, clean, operationActive });
  const remoteIdentity = facts.repository.primaryRemote;
  const repoIdentity =
    remoteIdentity === null
      ? null
      : repositoryIdentity(facts.repository.objectFormat, remoteIdentity);

  const untrackedWitness = {
    count: facts.untracked.entries.length,
    entries: facts.untracked.entries,
    state: facts.untracked.entries.some(({ kind }) => kind === "UNKNOWN") ? "UNKNOWN" : "COMPLETE",
  };
  const untrackedFingerprint =
    untrackedWitness.state === "COMPLETE"
      ? sha256Hex(`CIC-UNTRACKED-INVENTORY-V1\n${canonicalJson(untrackedWitness.entries)}\n`)
      : null;
  const portableWitness = {
    capabilities: {
      available: capabilities.available,
      capabilityFingerprint: capabilities.capabilityFingerprint,
      required: capabilities.required,
    },
    head: facts.head,
    repository: {
      configuredRemoteIdentities: facts.repository.configuredRemoteIdentities,
      objectFormat: facts.repository.objectFormat,
      primaryRemote: remoteIdentity,
      repositoryIdentity: repoIdentity,
    },
    sourceGeneration: facts.sourceGeneration,
    view: {
      ...facts.view,
      complete: viewComplete,
      pathCollisionCount: collisions.length,
      unsupportedGitlinkCount: facts.index.entries.filter(({ mode }) => mode === "160000").length,
    },
    worktree: {
      clean,
      index: {
        entryCount: facts.index.entries.length,
        fingerprint: facts.index.fingerprint,
        unmergedStageCount: facts.index.unmergedStageCount,
        visibility: facts.index.visibility ?? {
          assumeUnchangedCount: 0,
          fingerprint: null,
          skipWorktreeCount: 0,
        },
      },
      linkedWorktrees: facts.linkedWorktrees,
      mutationSafety,
      operations: facts.operations,
      staged: facts.staged,
      stash: facts.stash,
      unstaged: facts.unstaged,
      untracked: {
        count: untrackedWitness.count,
        fingerprint: untrackedFingerprint,
        state: untrackedWitness.state,
        entries: untrackedWitness.entries,
      },
    },
  };
  const environmentWitness = {
    architecture: facts.environment.architecture,
    availableCapabilities: capabilities.available,
    commonGitDirectoryHash: facts.environment.commonGitDirectoryHash,
    gitDirectoryHash: facts.environment.gitDirectoryHash,
    gitExecutablePathHash: facts.environment.gitExecutablePathHash,
    gitExecutableSha256: facts.environment.gitExecutableSha256,
    gitVersion: facts.environment.gitVersion,
    linkedWorktreeLocationHashes: facts.environment.linkedWorktreeLocationHashes,
    nodeVersion: facts.environment.nodeVersion,
    platform: facts.environment.platform,
    repositoryRootHash: facts.environment.repositoryRootHash,
  };
  const status = errors.length === 0 ? "PASS" : "BLOCKED";
  const snapshotFingerprint =
    status === "PASS"
      ? sha256Hex(`CIC-WORKTREE-SNAPSHOT-V1\n${canonicalJson(portableWitness)}\n`)
      : null;
  const environmentFingerprint = sha256Hex(
    `CIC-EXECUTION-ENVIRONMENT-V1\n${canonicalJson(environmentWitness)}\n`,
  );
  const sortedErrors = sortFindings(errors);
  const result = {
    schemaVersion: "CIC_REPOSITORY_IDENTITY_V1",
    status,
    repository: portableWitness.repository,
    sourceGeneration: portableWitness.sourceGeneration,
    capabilities: { ...capabilities },
    head: portableWitness.head,
    view: portableWitness.view,
    worktree: portableWitness.worktree,
    snapshotFingerprint,
    environment: { ...environmentWitness, environmentFingerprint },
    errors: sortedErrors,
  };
  return {
    coherenceFingerprint: sha256Hex(
      `CIC-REPOSITORY-OBSERVATION-V1\n${canonicalJson({
        environmentWitness,
        errors: sortedErrors,
        portableWitness,
        status,
      })}\n`,
    ),
    result,
  };
}

async function invoke(
  runGit,
  repositoryRoot,
  operationId,
  observationErrors,
  failedOperations,
  absentExitCodes = [],
) {
  let outcome;
  try {
    outcome = await runGit(repositoryRoot, operationId);
  } catch {
    failedOperations.add(operationId);
    observationErrors.push(finding("GIT_READ_OPERATION_FAILED", `operation=${operationId}`));
    return { state: "UNKNOWN", stdout: new Uint8Array() };
  }
  if (outcome.errorCode !== null || outcome.exitCode === null) {
    failedOperations.add(operationId);
    observationErrors.push(
      finding(
        outcome.errorCode === "ENOENT" ? "GIT_EXECUTABLE_UNAVAILABLE" : "GIT_READ_OPERATION_FAILED",
        `operation=${operationId}`,
      ),
    );
    return { state: "UNKNOWN", stdout: new Uint8Array() };
  }
  if (outcome.exitCode === 0) {
    if (UTF8_SEMANTIC_OPERATIONS.has(operationId)) {
      try {
        text(outcome.stdout);
      } catch {
        failedOperations.add(operationId);
        observationErrors.push(
          finding("GIT_READ_OPERATION_FAILED", `operation=${operationId};encoding=INVALID_UTF8`),
        );
        return { state: "UNKNOWN", stdout: new Uint8Array() };
      }
    }
    return { state: "PRESENT", stdout: outcome.stdout };
  }
  if (absentExitCodes.includes(outcome.exitCode)) {
    return { state: "ABSENT_PROVEN", stdout: outcome.stdout };
  }
  failedOperations.add(operationId);
  observationErrors.push(
    finding("GIT_READ_OPERATION_FAILED", `operation=${operationId};exit=${outcome.exitCode}`),
  );
  return { state: "UNKNOWN", stdout: outcome.stdout };
}

function capabilityEvidence(failedOperations, filesystemAvailable, sourceAvailable) {
  const groups = new Map([
    [
      "git.local.read",
      ["version", "topLevel", "gitDir", "commonDir", "insideWorktree", "bare", "objectFormat"],
    ],
    [
      "git.config.read",
      [
        "remoteUrls",
        "sparseCheckout",
        "partialCloneConfig",
        "filterDrivers",
        "externalConfigLocal",
        "externalConfigWorktree",
      ],
    ],
    [
      "git.refs.read",
      [
        "head",
        "headSubject",
        "branchRef",
        "branchUpstreamConfig",
        "upstreamRef",
        "upstreamCommit",
        "mergeBase",
        "aheadBehind",
        "stashTip",
        "stashCount",
        "replaceRefs",
      ],
    ],
    ["git.objects.read", ["headTree", "missingObjectWitness"]],
    ["git.index.read", ["indexEntries", "indexVisibility", "stagedDiff"]],
    [
      "git.worktree.read",
      [
        "trackedPaths",
        "unstagedDiff",
        "untrackedPaths",
        "worktrees",
        "shallow",
        "superprojectRoot",
      ],
    ],
  ]);
  const available = [];
  const unknown = [];
  for (const [capability, operations] of groups) {
    (operations.some((operationId) => failedOperations.has(operationId))
      ? unknown
      : available
    ).push(capability);
  }
  (filesystemAvailable ? available : unknown).push("filesystem.repository.read");
  (sourceAvailable ? available : unknown).push("cic.source-generation.read");
  return { available, unknown };
}

export async function observeRepositoryIdentity(
  repositoryRoot,
  { runGit, sourceGenerationProvider = verifySourceGeneration, runtimeEnvironment = process } = {},
) {
  const observationErrors = [];
  const failedOperations = new Set();
  let resolvedRoot;
  let filesystemAvailable = true;
  try {
    resolvedRoot = await realpath(path.resolve(repositoryRoot));
  } catch {
    resolvedRoot = path.resolve(repositoryRoot);
    filesystemAvailable = false;
    observationErrors.push(finding("REPOSITORY_ROOT_UNAVAILABLE", "repository-root"));
  }

  let gitExecutableEvidence = {
    gitExecutablePathHash: null,
    gitExecutableSha256: null,
  };
  let executeGit = runGit;
  if (executeGit === undefined) {
    const gitRunner = createReadonlyGitRunner(resolvedRoot);
    gitExecutableEvidence = gitRunner.evidence;
    executeGit = (_repositoryRoot, operationId) => gitRunner.run(operationId);
  }

  const get = (operationId, absentCodes = []) =>
    invoke(executeGit, resolvedRoot, operationId, observationErrors, failedOperations, absentCodes);
  const version = await get("version");
  const topLevel = await get("topLevel");
  const gitDir = await get("gitDir");
  const commonDir = await get("commonDir");
  const inside = await get("insideWorktree");
  const bare = await get("bare");
  const objectFormat = await get("objectFormat");
  const shallow = await get("shallow");
  const superproject = await get("superprojectRoot");
  const head = await get("head");
  const headTree = await get("headTree");
  const headSubject = await get("headSubject");
  const branch = await get("branchRef", ABSENT_EXIT_CODES);
  const branchUpstreamConfig = await get("branchUpstreamConfig", [1]);
  const upstreamRef = await get("upstreamRef", ABSENT_EXIT_CODES);
  const remoteUrls = await get("remoteUrls", [1]);
  const sparse = await get("sparseCheckout", [1]);
  const partial = await get("partialCloneConfig", [1]);
  const filterDrivers = await get("filterDrivers", [1]);
  const externalConfigLocal = await get("externalConfigLocal", [1]);
  const externalConfigWorktree = await get("externalConfigWorktree", [1]);
  const replaceRefs = await get("replaceRefs");
  const index = await get("indexEntries");
  const indexVisibility = await get("indexVisibility");
  const tracked = await get("trackedPaths");
  const staged = await get("stagedDiff");
  let unstaged = { state: "UNKNOWN", stdout: new Uint8Array() };
  if (filterDrivers.state === "ABSENT_PROVEN") {
    unstaged = await get("unstagedDiff");
  } else {
    observationErrors.push(
      finding(
        "REPOSITORY_EXTERNAL_FILTER_UNSUPPORTED",
        filterDrivers.state === "PRESENT" ? "external-filter-driver" : "filter-state-unknown",
      ),
    );
    if (filterDrivers.state === "UNKNOWN") failedOperations.add("unstagedDiff");
  }
  const untracked = await get("untrackedPaths");
  const stashTip = await get("stashTip", ABSENT_EXIT_CODES);
  const worktrees = await get("worktrees");

  let missingObjects = "UNKNOWN";
  try {
    const missingWitness = await executeGit(resolvedRoot, "missingObjectWitness");
    if (missingWitness.errorCode !== null || missingWitness.exitCode === null) {
      failedOperations.add("missingObjectWitness");
      observationErrors.push(
        finding(
          missingWitness.errorCode === "ENOENT"
            ? "GIT_EXECUTABLE_UNAVAILABLE"
            : "GIT_READ_OPERATION_FAILED",
          "operation=missingObjectWitness",
        ),
      );
    } else {
      missingObjects = missingWitness.exitCode !== 0;
    }
  } catch {
    failedOperations.add("missingObjectWitness");
    observationErrors.push(finding("GIT_READ_OPERATION_FAILED", "operation=missingObjectWitness"));
  }

  let branchUpstreamState = "UNKNOWN";
  if (branch.state === "ABSENT_PROVEN") {
    branchUpstreamState = "ABSENT_PROVEN";
  } else if (branch.state === "PRESENT") {
    if (branchUpstreamConfig.state === "ABSENT_PROVEN") {
      branchUpstreamState = "ABSENT_PROVEN";
    } else if (branchUpstreamConfig.state === "PRESENT") {
      const records = parseConfigRecords(
        branchUpstreamConfig.stdout,
        "branchUpstreamConfig",
        observationErrors,
      );
      if (records === null) {
        failedOperations.add("branchUpstreamConfig");
      } else {
        const branchName = line(branch.stdout).replace(/^refs\/heads\//u, "");
        const remoteValues = records
          .filter(({ key }) => key === `branch.${branchName}.remote`)
          .map(({ value }) => value);
        const mergeValues = records
          .filter(({ key }) => key === `branch.${branchName}.merge`)
          .map(({ value }) => value);
        if (remoteValues.length === 0 && mergeValues.length === 0) {
          branchUpstreamState = "ABSENT_PROVEN";
        } else if (
          remoteValues.length === 1 &&
          mergeValues.length === 1 &&
          remoteValues[0].length > 0 &&
          mergeValues[0].length > 0
        ) {
          branchUpstreamState = "CONFIGURED";
        } else {
          branchUpstreamState = "UNRESOLVED";
          observationErrors.push(
            finding("REPOSITORY_UPSTREAM_UNRESOLVED", "incomplete-or-ambiguous-branch-config"),
          );
        }
      }
    }
  }

  let upstream = {
    state: upstreamRef.state === "ABSENT_PROVEN" ? "UNKNOWN" : upstreamRef.state,
    ref: null,
    commit: null,
    mergeBase: null,
    ahead: null,
    behind: null,
  };
  if (upstreamRef.state === "PRESENT") {
    const upstreamCommit = await get("upstreamCommit");
    const mergeBase = await get("mergeBase");
    const aheadBehind = await get("aheadBehind");
    if (
      upstreamCommit.state === "PRESENT" &&
      mergeBase.state === "PRESENT" &&
      aheadBehind.state === "PRESENT"
    ) {
      const counts = line(aheadBehind.stdout)
        .trim()
        .split(/\s+/u)
        .map((value) => Number.parseInt(value, 10));
      if (counts.length === 2 && counts.every(Number.isInteger)) {
        upstream = {
          state: "PRESENT",
          ref: line(upstreamRef.stdout),
          commit: line(upstreamCommit.stdout),
          mergeBase: line(mergeBase.stdout),
          behind: counts[0],
          ahead: counts[1],
        };
      } else {
        failedOperations.add("aheadBehind");
        observationErrors.push(
          finding("GIT_READ_OPERATION_FAILED", "operation=aheadBehind;parse=INVALID"),
        );
      }
    }
  } else if (upstreamRef.state === "ABSENT_PROVEN" && branchUpstreamState === "ABSENT_PROVEN") {
    upstream = {
      state: "ABSENT_PROVEN",
      ref: null,
      commit: null,
      mergeBase: null,
      ahead: null,
      behind: null,
    };
  } else if (
    upstreamRef.state === "ABSENT_PROVEN" &&
    (branchUpstreamState === "CONFIGURED" || branchUpstreamState === "UNRESOLVED")
  ) {
    observationErrors.push(
      finding("REPOSITORY_UPSTREAM_UNRESOLVED", "configured-upstream-ref-unresolvable"),
    );
  }

  let indexEntries = [];
  try {
    if (index.state === "PRESENT") indexEntries = parseIndexEntries(index.stdout);
  } catch {
    failedOperations.add("indexEntries");
    observationErrors.push(
      finding("GIT_READ_OPERATION_FAILED", "operation=indexEntries;parse=INVALID"),
    );
  }
  let indexVisibilityObservation = {
    assumeUnchangedCount: 0,
    entries: [],
    skipWorktreeCount: 0,
  };
  try {
    if (indexVisibility.state === "PRESENT") {
      indexVisibilityObservation = parseIndexVisibility(indexVisibility.stdout);
    }
  } catch {
    failedOperations.add("indexVisibility");
    observationErrors.push(
      finding("GIT_READ_OPERATION_FAILED", "operation=indexVisibility;parse=INVALID"),
    );
  }
  let trackedPaths = [];
  try {
    if (tracked.state === "PRESENT")
      trackedPaths = nulFields(tracked.stdout).map(normalizeRepoRelativePath);
  } catch {
    failedOperations.add("trackedPaths");
    observationErrors.push(
      finding("GIT_READ_OPERATION_FAILED", "operation=trackedPaths;parse=INVALID"),
    );
  }
  let untrackedPaths = [];
  try {
    if (untracked.state === "PRESENT")
      untrackedPaths = nulFields(untracked.stdout).map(normalizeRepoRelativePath);
  } catch {
    failedOperations.add("untrackedPaths");
    observationErrors.push(
      finding("GIT_READ_OPERATION_FAILED", "operation=untrackedPaths;parse=INVALID"),
    );
  }
  const untrackedObservation = await observeUntracked(
    resolvedRoot,
    untrackedPaths,
    observationErrors,
  );
  if (!untrackedObservation.filesystemAvailable) filesystemAvailable = false;
  const untrackedEntries = untrackedObservation.entries;

  let remotes = { identities: [], primaryRemote: null };
  if (remoteUrls.state === "PRESENT") {
    remotes = parseRemoteConfiguration(remoteUrls.stdout, observationErrors);
    if (remotes.readFailure) failedOperations.add("remoteUrls");
  } else if (remoteUrls.state === "ABSENT_PROVEN") {
    observationErrors.push(
      finding("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED", "no-configured-remote"),
    );
  }

  let externalConfig = false;
  for (const [operationId, observation] of [
    ["externalConfigLocal", externalConfigLocal],
    ["externalConfigWorktree", externalConfigWorktree],
  ]) {
    if (observation.state === "UNKNOWN") {
      externalConfig = "UNKNOWN";
      continue;
    }
    if (observation.state === "PRESENT") {
      const records = parseConfigRecords(observation.stdout, operationId, observationErrors);
      if (records === null) {
        failedOperations.add(operationId);
        externalConfig = "UNKNOWN";
      } else if (records.length > 0 && externalConfig !== "UNKNOWN") {
        externalConfig = true;
      }
    }
  }

  let linked = { portable: [], locationHashes: [] };
  try {
    if (worktrees.state === "PRESENT") linked = parseWorktrees(worktrees.stdout);
  } catch {
    failedOperations.add("worktrees");
    observationErrors.push(
      finding("GIT_READ_OPERATION_FAILED", "operation=worktrees;parse=INVALID"),
    );
  }

  let operationState = {
    bisect: "UNKNOWN",
    cherryPick: "UNKNOWN",
    merge: "UNKNOWN",
    rebase: "UNKNOWN",
    revert: "UNKNOWN",
  };
  if (gitDir.state === "PRESENT") {
    const operationObservation = await observeOperationState(
      line(gitDir.stdout),
      observationErrors,
    );
    operationState = operationObservation.operations;
    if (!operationObservation.filesystemAvailable) filesystemAvailable = false;
  } else filesystemAvailable = false;

  const ancestorObservation = await observeAncestorRepositoryMarker(resolvedRoot);
  if (!ancestorObservation.readAvailable) {
    filesystemAvailable = false;
    observationErrors.push(finding("GIT_READ_OPERATION_FAILED", "ancestor-repository-marker"));
  }

  let graftOverlay = "UNKNOWN";
  if (commonDir.state === "PRESENT") {
    const graftState = await pathState(path.join(line(commonDir.stdout), "info", "grafts"));
    graftOverlay =
      graftState === "PRESENT" ? true : graftState === "ABSENT_PROVEN" ? false : "UNKNOWN";
    if (graftState === "UNKNOWN") {
      filesystemAvailable = false;
      observationErrors.push(finding("GIT_READ_OPERATION_FAILED", "history-graft-state"));
    }
  } else {
    filesystemAvailable = false;
  }

  let stash = { state: stashTip.state, tip: null, count: null };
  if (stashTip.state === "PRESENT") {
    const count = await get("stashCount");
    if (count.state === "PRESENT") {
      const parsedCount = Number.parseInt(line(count.stdout), 10);
      if (Number.isInteger(parsedCount) && parsedCount >= 0) {
        stash = {
          state: "PRESENT",
          tip: line(stashTip.stdout),
          count: parsedCount,
        };
      } else {
        failedOperations.add("stashCount");
        observationErrors.push(
          finding("GIT_READ_OPERATION_FAILED", "operation=stashCount;parse=INVALID"),
        );
      }
    }
  } else if (stashTip.state === "ABSENT_PROVEN") {
    stash = { state: "ABSENT_PROVEN", tip: null, count: 0 };
  }

  let sourceGeneration;
  try {
    sourceGeneration = await sourceGenerationProvider(resolvedRoot);
  } catch {
    sourceGeneration = { status: "BLOCKED", generationFingerprint: null };
  }
  const sourceAvailable = sourceGeneration.status === "PASS";

  const partialFields =
    partial.state === "PRESENT"
      ? nulFields(partial.stdout).map((field) => {
          const separator = field.indexOf("\n");
          return separator < 0 ? "true" : field.slice(separator + 1);
        })
      : [];
  const partialView =
    partial.state === "UNKNOWN"
      ? "UNKNOWN"
      : partialFields.some((value) => value.toLowerCase() !== "false");
  const sparseView =
    sparse.state === "UNKNOWN"
      ? "UNKNOWN"
      : sparse.state === "PRESENT"
        ? booleanValue(line(sparse.stdout))
        : false;
  const externalFilters =
    filterDrivers.state === "UNKNOWN"
      ? "UNKNOWN"
      : filterDrivers.state === "PRESENT"
        ? true
        : false;
  const replaceOverlay =
    replaceRefs.state === "UNKNOWN"
      ? "UNKNOWN"
      : replaceRefs.state === "PRESENT"
        ? line(replaceRefs.stdout).length !== 0
        : false;
  const historyOverlay =
    replaceOverlay === true || graftOverlay === true
      ? true
      : replaceOverlay === "UNKNOWN" || graftOverlay === "UNKNOWN"
        ? "UNKNOWN"
        : false;
  const superprojectNested =
    superproject.state === "PRESENT" ? line(superproject.stdout).length !== 0 : "UNKNOWN";
  const nestedView =
    superprojectNested === true || ancestorObservation.nested === true
      ? true
      : superprojectNested === "UNKNOWN" || ancestorObservation.nested === "UNKNOWN"
        ? "UNKNOWN"
        : false;
  const repositoryRootMatches =
    topLevel.state === "PRESENT" &&
    path.resolve(line(topLevel.stdout)).toLowerCase() === path.resolve(resolvedRoot).toLowerCase();
  if (topLevel.state === "PRESENT" && !repositoryRootMatches) {
    observationErrors.push(
      finding("REPOSITORY_ROOT_UNAVAILABLE", "provided-root-is-not-top-level"),
    );
  }

  const facts = {
    capabilityEvidence: capabilityEvidence(failedOperations, filesystemAvailable, sourceAvailable),
    environment: {
      architecture: runtimeEnvironment.arch,
      commonGitDirectoryHash:
        commonDir.state === "PRESENT" ? portablePathHash(line(commonDir.stdout)) : null,
      gitDirectoryHash: gitDir.state === "PRESENT" ? portablePathHash(line(gitDir.stdout)) : null,
      gitExecutablePathHash: gitExecutableEvidence.gitExecutablePathHash,
      gitExecutableSha256: gitExecutableEvidence.gitExecutableSha256,
      gitVersion: version.state === "PRESENT" ? line(version.stdout) : null,
      linkedWorktreeLocationHashes: linked.locationHashes,
      nodeVersion: runtimeEnvironment.version,
      platform: runtimeEnvironment.platform,
      repositoryRootHash: filesystemAvailable ? portablePathHash(resolvedRoot) : null,
    },
    head: {
      branch:
        branch.state === "PRESENT"
          ? { state: "SYMBOLIC", ref: line(branch.stdout) }
          : branch.state === "ABSENT_PROVEN"
            ? { state: "DETACHED", ref: null }
            : { state: "UNKNOWN", ref: null },
      commit: head.state === "PRESENT" ? line(head.stdout) : null,
      subject: headSubject.state === "PRESENT" ? line(headSubject.stdout) : null,
      tree: headTree.state === "PRESENT" ? line(headTree.stdout) : null,
      upstream,
    },
    index: {
      entries: indexEntries,
      fingerprint:
        index.state === "PRESENT"
          ? sha256Hex(
              Buffer.concat([Buffer.from("CIC-GIT-INDEX-V1\0", "utf8"), Buffer.from(index.stdout)]),
            )
          : null,
      unmergedStageCount: indexEntries.filter(({ stage }) => stage !== 0).length,
      visibility: {
        assumeUnchangedCount: indexVisibilityObservation.assumeUnchangedCount,
        fingerprint:
          indexVisibility.state === "PRESENT" && !failedOperations.has("indexVisibility")
            ? sha256Hex(
                Buffer.concat([
                  Buffer.from("CIC-GIT-INDEX-VISIBILITY-V1\0", "utf8"),
                  Buffer.from(indexVisibility.stdout),
                ]),
              )
            : null,
        skipWorktreeCount: indexVisibilityObservation.skipWorktreeCount,
      },
    },
    linkedWorktrees: linked.portable,
    observationErrors,
    operations: operationState,
    repository: {
      configuredRemoteIdentities: remotes.identities,
      objectFormat: objectFormat.state === "PRESENT" ? line(objectFormat.stdout) : null,
      primaryRemote: remotes.primaryRemote,
    },
    sourceGeneration: {
      fingerprint: sourceGeneration.generationFingerprint ?? null,
      status: sourceGeneration.status,
    },
    staged: {
      bytes: staged.state === "PRESENT" ? staged.stdout.byteLength : null,
      sha256: staged.state === "PRESENT" ? sha256Hex(staged.stdout) : null,
    },
    stash,
    trackedPaths,
    unstaged: {
      bytes: unstaged.state === "PRESENT" ? unstaged.stdout.byteLength : null,
      sha256: unstaged.state === "PRESENT" ? sha256Hex(unstaged.stdout) : null,
    },
    untracked: { entries: untrackedEntries },
    view: {
      bare: bare.state === "PRESENT" ? booleanValue(line(bare.stdout)) : "UNKNOWN",
      externalConfig,
      externalFilters,
      historyOverlay,
      insideWorktree:
        inside.state === "PRESENT" && repositoryRootMatches
          ? booleanValue(line(inside.stdout))
          : "UNKNOWN",
      missingObjects,
      nested: nestedView,
      partial: partialView,
      shallow: shallow.state === "PRESENT" ? booleanValue(line(shallow.stdout)) : "UNKNOWN",
      sparse: sparseView,
    },
  };
  return finalizeRepositoryObservation(facts);
}

export async function verifyRepositoryIdentity(
  repositoryRoot,
  observationProvider = observeRepositoryIdentity,
) {
  const first = await observationProvider(repositoryRoot);
  const second = await observationProvider(repositoryRoot);
  const coherenceChanged = first.coherenceFingerprint !== second.coherenceFingerprint;
  const observationBlocked = first.result.status !== "PASS" || second.result.status !== "PASS";
  if (coherenceChanged || observationBlocked) {
    const additional = [];
    if (coherenceChanged) {
      additional.push(
        finding(
          "REPOSITORY_SNAPSHOT_RACE",
          `first=${first.coherenceFingerprint};second=${second.coherenceFingerprint}`,
        ),
      );
    }
    return {
      ...second.result,
      status: "BLOCKED",
      snapshotFingerprint: null,
      errors: sortFindings([...first.result.errors, ...second.result.errors, ...additional]),
    };
  }
  return second.result;
}
