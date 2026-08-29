import {
  constants as fsConstants,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { TextDecoder, TextEncoder } from "node:util";

import { canonicalJson } from "./canonical-json.mjs";
import { sha256Hex } from "./identity.mjs";
import { verifyRepositoryIdentity } from "./repository-identity.mjs";

const IDENTITY_PATTERN = /^[0-9A-F]{64}$/u;
const PORTABLE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const STATE_BINDING_FILE = "state-domain-binding.json";

class CicI4Error extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = "CicI4Error";
    this.code = code;
  }
}

export function fail(code, message = code) {
  throw new CicI4Error(code, message);
}

export function isIdentity(value) {
  return typeof value === "string" && IDENTITY_PATTERN.test(value);
}

export function requireIdentity(value, label) {
  if (!isIdentity(value)) fail("IDENTITY_INVALID", `${label} must be an uppercase SHA-256`);
  return value;
}

export function requirePortableId(value, label) {
  if (typeof value !== "string" || !PORTABLE_ID_PATTERN.test(value)) {
    fail("PORTABLE_IDENTITY_INVALID", `${label} must be a portable identifier`);
  }
  return value;
}

export function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function requirePlainObject(value, label) {
  if (!isPlainObject(value)) fail("INPUT_SCHEMA_INVALID", `${label} must be a plain object`);
  return value;
}

export function stableUnique(values, label = "values") {
  if (!Array.isArray(values) || values.some((value) => typeof value !== "string")) {
    fail("INPUT_SCHEMA_INVALID", `${label} must be an array of strings`);
  }
  const result = [...new Set(values)].sort();
  if (result.length !== values.length) fail("INPUT_SCHEMA_INVALID", `${label} must be unique`);
  return result;
}

export function semanticIdentity(schema, body) {
  return sha256Hex(`${schema}\n${canonicalJson(body)}\n`);
}

function jsonBytes(value) {
  return new TextEncoder().encode(`${canonicalJson(value)}\n`);
}

function samePhysicalPath(left, right) {
  const normalize = (value) => {
    const normalized = path.normalize(value);
    return process.platform === "win32" ? normalized.toLowerCase() : normalized;
  };
  return normalize(left) === normalize(right);
}

function requirePhysicalObjectIdentity(stats, code) {
  if (stats.dev === undefined || stats.ino === undefined) fail(code);
  const device = String(stats.dev);
  const inode = String(stats.ino);
  if (device.length === 0 || inode.length === 0 || inode === "0") fail(code);
  return { device, inode };
}

async function inspectPhysicalDirectory(directory, code) {
  const requested = path.resolve(directory);
  let stats;
  let resolved;
  try {
    stats = await lstat(requested, { bigint: true });
    resolved = await realpath(requested);
  } catch {
    fail(code);
  }
  if (!stats.isDirectory() || stats.isSymbolicLink() || !samePhysicalPath(requested, resolved)) {
    fail(code);
  }
  return {
    path: resolved,
    ...requirePhysicalObjectIdentity(stats, code),
  };
}

function requireContained(root, candidate, code) {
  const relative = path.relative(root, candidate);
  if (
    relative === "" ||
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.split(path.sep).some((part) => part === "" || part === "." || part === "..")
  ) {
    fail(code);
  }
  return relative.split(path.sep);
}

async function inspectBoundedComponents(root, target, { allowMissingLeaf, createParents, code }) {
  const rootObservation = await inspectPhysicalDirectory(root, code);
  const absoluteTarget = path.resolve(target);
  const parts = requireContained(rootObservation.path, absoluteTarget, code);
  let current = rootObservation.path;
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    const leaf = index === parts.length - 1;
    let stats;
    try {
      stats = await lstat(current, { bigint: true });
    } catch (error) {
      if (error?.code !== "ENOENT") fail(code);
      if (leaf && allowMissingLeaf) {
        return { root: rootObservation.path, target: absoluteTarget, state: "ABSENT_PROVEN" };
      }
      if (!leaf && createParents) {
        try {
          await mkdir(current);
          stats = await lstat(current, { bigint: true });
        } catch {
          fail(code);
        }
      } else {
        fail(code);
      }
    }
    if (stats.isSymbolicLink()) fail(code);
    if (!leaf && !stats.isDirectory()) fail(code);
    let resolved;
    try {
      resolved = await realpath(current);
    } catch {
      fail(code);
    }
    if (!samePhysicalPath(current, resolved)) fail(code);
    requirePhysicalObjectIdentity(stats, code);
  }
  return { root: rootObservation.path, target: absoluteTarget, state: "PRESENT" };
}

async function ensureBoundedStateDirectory(stateRoot, directory) {
  const sentinel = path.join(directory, ".cic-directory-boundary");
  await inspectBoundedComponents(stateRoot, sentinel, {
    allowMissingLeaf: true,
    createParents: true,
    code: "STATE_PATH_BOUNDARY_VIOLATION",
  });
  return path.resolve(directory);
}

export async function inspectBoundedWorktreePath(worktreeRoot, relativePath, options = {}) {
  if (
    typeof relativePath !== "string" ||
    relativePath.length === 0 ||
    relativePath.includes("\\") ||
    relativePath.includes("\0") ||
    relativePath.startsWith("/") ||
    /^[A-Za-z]:/u.test(relativePath)
  ) {
    fail(options.code ?? "WRITE_PREIMAGE_MISMATCH");
  }
  const parts = relativePath.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    fail(options.code ?? "WRITE_PREIMAGE_MISMATCH");
  }
  return inspectBoundedComponents(worktreeRoot, path.join(worktreeRoot, ...parts), {
    allowMissingLeaf: options.allowMissingLeaf === true,
    createParents: false,
    code: options.code ?? "WRITE_PREIMAGE_MISMATCH",
  });
}

async function flushDirectory(directory) {
  let handle;
  try {
    handle = await open(directory, fsConstants.O_RDONLY);
    await handle.sync();
  } catch (error) {
    if (!new Set(["EINVAL", "EISDIR", "EPERM", "ENOTSUP"]).has(error?.code)) throw error;
  } finally {
    await handle?.close();
  }
}

export async function pathState(filePath, stateRoot) {
  if (stateRoot !== undefined) {
    const bounded = await inspectBoundedComponents(stateRoot, filePath, {
      allowMissingLeaf: true,
      createParents: false,
      code: "STATE_PATH_BOUNDARY_VIOLATION",
    });
    if (bounded.state === "ABSENT_PROVEN") {
      return { state: "ABSENT_PROVEN", stats: null };
    }
  }
  try {
    const stats = await lstat(filePath);
    return { state: "PRESENT", stats };
  } catch (error) {
    if (error?.code === "ENOENT") return { state: "ABSENT_PROVEN", stats: null };
    return { state: "UNKNOWN", stats: null, error };
  }
}

export async function readJson(filePath, code = "STATE_RECORD_INVALID", stateRoot) {
  try {
    if (typeof stateRoot !== "string") fail("STATE_PATH_BOUNDARY_VIOLATION");
    const bounded = await inspectBoundedComponents(stateRoot, filePath, {
      allowMissingLeaf: true,
      createParents: false,
      code: "STATE_PATH_BOUNDARY_VIOLATION",
    });
    if (bounded.state === "ABSENT_PROVEN") fail(code);
    const bytes = await readFile(filePath);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const parsed = JSON.parse(text);
    requirePlainObject(parsed, "JSON record");
    return parsed;
  } catch (error) {
    if (error instanceof CicI4Error) throw error;
    fail(code, `${code}: ${error?.code ?? error?.message ?? "read failed"}`);
  }
}

export async function writeImmutableJson(
  filePath,
  value,
  conflictCode = "STATE_RECORD_CONFLICT",
  stateRoot,
) {
  if (typeof stateRoot !== "string") fail("STATE_PATH_BOUNDARY_VIOLATION");
  const bytes = jsonBytes(value);
  await ensureBoundedStateDirectory(stateRoot, path.dirname(filePath));
  await inspectBoundedComponents(stateRoot, filePath, {
    allowMissingLeaf: true,
    createParents: false,
    code: "STATE_PATH_BOUNDARY_VIOLATION",
  });
  let handle;
  try {
    handle = await open(filePath, "wx", 0o600);
    await handle.writeFile(bytes);
    await handle.sync();
    await handle.close();
    handle = null;
    await flushDirectory(path.dirname(filePath));
    return semanticIdentity("CIC-PHYSICAL-JSON-V1", value);
  } catch (error) {
    await handle?.close();
    if (error?.code === "EEXIST") {
      const existing = await readJson(filePath, conflictCode, stateRoot);
      if (canonicalJson(existing) === canonicalJson(value))
        return semanticIdentity("CIC-PHYSICAL-JSON-V1", value);
      fail(conflictCode);
    }
    throw error;
  }
}

export async function atomicReplaceJson(filePath, value, stateRoot) {
  if (typeof stateRoot !== "string") fail("STATE_PATH_BOUNDARY_VIOLATION");
  await ensureBoundedStateDirectory(stateRoot, path.dirname(filePath));
  await inspectBoundedComponents(stateRoot, filePath, {
    allowMissingLeaf: true,
    createParents: false,
    code: "STATE_PATH_BOUNDARY_VIOLATION",
  });
  const temporary = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${sha256Hex(jsonBytes(value)).slice(0, 20)}.tmp`,
  );
  let handle;
  try {
    handle = await open(temporary, "wx", 0o600);
    await handle.writeFile(jsonBytes(value));
    await handle.sync();
    await handle.close();
    handle = null;
    await inspectBoundedComponents(stateRoot, temporary, {
      allowMissingLeaf: false,
      createParents: false,
      code: "STATE_PATH_BOUNDARY_VIOLATION",
    });
    await inspectBoundedComponents(stateRoot, filePath, {
      allowMissingLeaf: true,
      createParents: false,
      code: "STATE_PATH_BOUNDARY_VIOLATION",
    });
    await rename(temporary, filePath);
    await flushDirectory(path.dirname(filePath));
  } catch (error) {
    await handle?.close();
    try {
      await unlink(temporary);
    } catch (cleanupError) {
      if (cleanupError?.code !== "ENOENT") throw cleanupError;
    }
    throw error;
  }
}

export async function withExclusiveLock(lockPath, conflictCode, operation, stateRoot) {
  if (typeof stateRoot !== "string") fail("STATE_PATH_BOUNDARY_VIOLATION");
  await ensureBoundedStateDirectory(stateRoot, path.dirname(lockPath));
  await inspectBoundedComponents(stateRoot, lockPath, {
    allowMissingLeaf: true,
    createParents: false,
    code: "STATE_PATH_BOUNDARY_VIOLATION",
  });
  let handle;
  try {
    handle = await open(lockPath, "wx", 0o600);
    await handle.writeFile(`${process.pid}\n`, { encoding: "utf8" });
    await handle.sync();
  } catch (error) {
    await handle?.close();
    if (error?.code === "EEXIST") fail(conflictCode);
    throw error;
  }
  try {
    return await operation();
  } finally {
    await inspectBoundedComponents(stateRoot, lockPath, {
      allowMissingLeaf: false,
      createParents: false,
      code: "STATE_PATH_BOUNDARY_VIOLATION",
    });
    await handle.close();
    await unlink(lockPath);
    await flushDirectory(path.dirname(lockPath));
  }
}

function ensureOutside(repositoryRoot, stateRoot) {
  const relative = path.relative(repositoryRoot, stateRoot);
  if (relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative))) {
    fail("STATE_STORE_BINDING_MISMATCH", "CIC state root must be repo-external");
  }
}

function domainBody({ repositoryIdentity, taskIdentity, portableWorktreeIdentity }) {
  requireIdentity(repositoryIdentity, "repository identity");
  requireIdentity(taskIdentity, "task identity");
  requireIdentity(portableWorktreeIdentity, "portable worktree identity");
  return {
    schemaVersion: "CIC_PORTABLE_STATE_DOMAIN_V1",
    repositoryIdentity,
    taskIdentity,
    portableWorktreeIdentity,
  };
}

async function observeStateDomainCandidate({
  repositoryRoot,
  worktreeRoot,
  stateRoot,
  repositoryIdentity,
  taskIdentity,
  portableWorktreeIdentity,
  acceptedAssociation = null,
}) {
  const repositoryObservation = await inspectPhysicalDirectory(
    repositoryRoot,
    "STATE_STORE_BINDING_MISMATCH",
  );
  const worktreeObservation = await inspectPhysicalDirectory(
    worktreeRoot,
    "WORKTREE_BINDING_MISMATCH",
  );
  const stateObservation = await inspectPhysicalDirectory(
    stateRoot,
    "STATE_STORE_BINDING_MISMATCH",
  );
  const repositoryRootRealpath = repositoryObservation.path;
  const worktreeRootRealpath = worktreeObservation.path;
  const stateRootRealpath = stateObservation.path;
  let repositoryVerifierObservation = null;
  let worktreeRepositoryObservation = null;
  let repositoryCommonGitDirectoryHash;
  let worktreeCommonGitDirectoryHash;
  if (acceptedAssociation === null) {
    try {
      repositoryVerifierObservation = await verifyRepositoryIdentity(repositoryRootRealpath);
      worktreeRepositoryObservation = await verifyRepositoryIdentity(worktreeRootRealpath);
    } catch {
      fail("STATE_STORE_BINDING_MISMATCH");
    }
    const repositoryValid =
      repositoryVerifierObservation.status === "PASS" &&
      repositoryVerifierObservation.repository.repositoryIdentity === repositoryIdentity &&
      repositoryVerifierObservation.view.complete === true &&
      repositoryVerifierObservation.view.shallow === false;
    const worktreeValid =
      worktreeRepositoryObservation.status === "PASS" &&
      worktreeRepositoryObservation.repository.repositoryIdentity === repositoryIdentity &&
      worktreeRepositoryObservation.view.complete === true &&
      worktreeRepositoryObservation.view.shallow === false;
    repositoryCommonGitDirectoryHash =
      repositoryVerifierObservation.environment.commonGitDirectoryHash;
    worktreeCommonGitDirectoryHash =
      worktreeRepositoryObservation.environment.commonGitDirectoryHash;
    if (!repositoryValid || !worktreeValid) fail("STATE_STORE_BINDING_MISMATCH");
  } else {
    requirePlainObject(acceptedAssociation, "accepted repository/worktree association");
    repositoryCommonGitDirectoryHash = acceptedAssociation.repositoryCommonGitDirectoryHash;
    worktreeCommonGitDirectoryHash = acceptedAssociation.worktreeCommonGitDirectoryHash;
  }
  if (
    !isIdentity(repositoryCommonGitDirectoryHash) ||
    !isIdentity(worktreeCommonGitDirectoryHash) ||
    repositoryCommonGitDirectoryHash !== worktreeCommonGitDirectoryHash
  ) {
    fail("STATE_STORE_BINDING_MISMATCH");
  }
  ensureOutside(repositoryRootRealpath, stateRootRealpath);
  ensureOutside(worktreeRootRealpath, stateRootRealpath);
  const portableBody = domainBody({ repositoryIdentity, taskIdentity, portableWorktreeIdentity });
  const portableStateDomainIdentity = semanticIdentity(
    "CIC-PORTABLE-STATE-DOMAIN-V1",
    portableBody,
  );
  const localWorktreeBody = {
    schemaVersion: "CIC_LOCAL_WORKTREE_BINDING_V1",
    repositoryIdentity,
    portableWorktreeIdentity,
    repositoryRootHash: sha256Hex(repositoryRootRealpath),
    worktreeRootRealpathHash: sha256Hex(worktreeRootRealpath),
    repositoryDevice: repositoryObservation.device,
    repositoryInode: repositoryObservation.inode,
    worktreeDevice: worktreeObservation.device,
    worktreeInode: worktreeObservation.inode,
    repositoryCommonGitDirectoryHash,
    worktreeCommonGitDirectoryHash,
  };
  const localWorktreeBindingIdentity = semanticIdentity(
    "CIC-LOCAL-WORKTREE-BINDING-V1",
    localWorktreeBody,
  );
  const localBody = {
    schemaVersion: "CIC_LOCAL_STATE_STORE_BINDING_V1",
    portableStateDomainIdentity,
    localWorktreeBindingIdentity,
    repositoryRootHash: sha256Hex(repositoryRootRealpath),
    stateRootRealpathHash: sha256Hex(stateRootRealpath),
    repositoryDevice: repositoryObservation.device,
    repositoryInode: repositoryObservation.inode,
    stateDevice: stateObservation.device,
    stateInode: stateObservation.inode,
    repositoryCommonGitDirectoryHash,
    worktreeCommonGitDirectoryHash,
  };
  const localStateStoreBindingIdentity = semanticIdentity(
    "CIC-LOCAL-STATE-STORE-BINDING-V1",
    localBody,
  );
  return {
    schemaVersion: "CIC_STATE_DOMAIN_OBSERVATION_V1",
    portableStateDomainIdentity,
    localWorktreeBindingIdentity,
    localStateStoreBindingIdentity,
    repositoryIdentity,
    taskIdentity,
    portableWorktreeIdentity,
    repositoryRoot: repositoryRootRealpath,
    worktreeRoot: worktreeRootRealpath,
    stateRoot: stateRootRealpath,
    taskStateRoot: path.join(stateRootRealpath, "tasks", taskIdentity),
    packStoreRoot: path.join(stateRootRealpath, "packs", taskIdentity),
    bindingRecordPath: path.join(stateRootRealpath, STATE_BINDING_FILE),
    portableBody,
    localWorktreeBody,
    localBody,
    repositoryVerifierObservation,
    worktreeRepositoryObservation,
  };
}

export async function inspectStateDomainCandidate(input) {
  return observeStateDomainCandidate({
    repositoryRoot: input.repositoryRoot,
    worktreeRoot: input.worktreeRoot,
    stateRoot: input.stateRoot,
    repositoryIdentity: input.repositoryIdentity,
    taskIdentity: input.taskIdentity,
    portableWorktreeIdentity: input.portableWorktreeIdentity,
  });
}

function portableDomainResult(observation) {
  return {
    schemaVersion: observation.schemaVersion,
    portableStateDomainIdentity: observation.portableStateDomainIdentity,
    localWorktreeBindingIdentity: observation.localWorktreeBindingIdentity,
    localStateStoreBindingIdentity: observation.localStateStoreBindingIdentity,
    repositoryIdentity: observation.repositoryIdentity,
    taskIdentity: observation.taskIdentity,
    portableWorktreeIdentity: observation.portableWorktreeIdentity,
    taskStateSubroot: `tasks/${observation.taskIdentity}`,
    packStoreSubroot: `packs/${observation.taskIdentity}`,
  };
}

export async function recordStateDomainBinding(input) {
  const observation = await inspectStateDomainCandidate(input);
  requireIdentity(
    input.expectedLocalStateStoreBindingIdentity,
    "expected local state-store binding identity",
  );
  if (input.expectedLocalStateStoreBindingIdentity !== observation.localStateStoreBindingIdentity) {
    fail("STATE_STORE_BINDING_MISMATCH");
  }
  const record = {
    schemaVersion: "CIC_STATE_DOMAIN_BINDING_RECORD_V1",
    ...portableDomainResult(observation),
    repositoryRoot: observation.repositoryRoot,
    worktreeRoot: observation.worktreeRoot,
    stateRoot: observation.stateRoot,
    worktreeRootRealpathHash: observation.localWorktreeBody.worktreeRootRealpathHash,
    repositoryRootHash: observation.localBody.repositoryRootHash,
    stateRootRealpathHash: observation.localBody.stateRootRealpathHash,
    repositoryDevice: observation.localBody.repositoryDevice,
    repositoryInode: observation.localBody.repositoryInode,
    worktreeDevice: observation.localWorktreeBody.worktreeDevice,
    worktreeInode: observation.localWorktreeBody.worktreeInode,
    stateDevice: observation.localBody.stateDevice,
    stateInode: observation.localBody.stateInode,
    repositoryCommonGitDirectoryHash: observation.localBody.repositoryCommonGitDirectoryHash,
    worktreeCommonGitDirectoryHash: observation.localBody.worktreeCommonGitDirectoryHash,
  };
  await writeImmutableJson(
    observation.bindingRecordPath,
    record,
    "STATE_STORE_BINDING_MISMATCH",
    observation.stateRoot,
  );
  await ensureBoundedStateDirectory(observation.stateRoot, observation.taskStateRoot);
  await ensureBoundedStateDirectory(observation.stateRoot, observation.packStoreRoot);
  return { ...observation, record };
}

export async function reverifyStateDomain(input) {
  const stateObservation = await inspectPhysicalDirectory(
    input.stateRoot,
    "STATE_STORE_BINDING_MISMATCH",
  );
  const record = await readJson(
    path.join(stateObservation.path, STATE_BINDING_FILE),
    "STATE_STORE_BINDING_MISMATCH",
    stateObservation.path,
  );
  const observation = await observeStateDomainCandidate({
    ...input,
    acceptedAssociation: record,
  });
  const expected = {
    schemaVersion: "CIC_STATE_DOMAIN_BINDING_RECORD_V1",
    ...portableDomainResult(observation),
    repositoryRoot: observation.repositoryRoot,
    worktreeRoot: observation.worktreeRoot,
    stateRoot: observation.stateRoot,
    worktreeRootRealpathHash: observation.localWorktreeBody.worktreeRootRealpathHash,
    repositoryRootHash: observation.localBody.repositoryRootHash,
    stateRootRealpathHash: observation.localBody.stateRootRealpathHash,
    repositoryDevice: observation.localBody.repositoryDevice,
    repositoryInode: observation.localBody.repositoryInode,
    worktreeDevice: observation.localWorktreeBody.worktreeDevice,
    worktreeInode: observation.localWorktreeBody.worktreeInode,
    stateDevice: observation.localBody.stateDevice,
    stateInode: observation.localBody.stateInode,
    repositoryCommonGitDirectoryHash: observation.localBody.repositoryCommonGitDirectoryHash,
    worktreeCommonGitDirectoryHash: observation.localBody.worktreeCommonGitDirectoryHash,
  };
  if (canonicalJson(record) !== canonicalJson(expected)) fail("STATE_STORE_BINDING_MISMATCH");
  return { ...observation, record };
}
