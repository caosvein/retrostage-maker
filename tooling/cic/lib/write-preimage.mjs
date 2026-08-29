import { lstat, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { gitBlobSha1, sha256Hex } from "./identity.mjs";
import {
  acceptSuccessorCheckpoint,
  effectiveCheckpoint,
  loadAuthorizationEpoch,
  verifyAuthorization,
  verifyMutationLease,
} from "./task-authorization.mjs";
import {
  fail,
  inspectBoundedWorktreePath,
  isIdentity,
  pathState,
  readJson,
  requireIdentity,
  requirePlainObject,
  requirePortableId,
  semanticIdentity,
  stableUnique,
  writeImmutableJson,
} from "./state-domain.mjs";

const OPERATIONS = new Set(["CREATE", "DELETE", "MODIFY", "RENAME"]);

function normalizeGovernedPath(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.includes("\\") ||
    value.includes("\0") ||
    value.startsWith("/") ||
    /^[A-Za-z]:/u.test(value)
  ) {
    fail("WRITE_PREIMAGE_MISMATCH");
  }
  const parts = value.split("/");
  if (parts.some((part) => part === "" || part === "." || part === "..")) {
    fail("WRITE_PREIMAGE_MISMATCH");
  }
  return parts.join("/");
}

async function assertNoSemanticCollision(parent, basename, allowExact) {
  const entries = await readdir(parent);
  const key = basename.normalize("NFC").toUpperCase();
  const collisions = entries.filter((entry) => entry.normalize("NFC").toUpperCase() === key);
  if (
    collisions.some((entry) => entry !== basename) ||
    (!allowExact && collisions.includes(basename)) ||
    collisions.length > 1
  ) {
    fail("CONTEXT_IDENTITY_COLLISION");
  }
}

async function safeParent(worktreeRoot, governedPath) {
  const bounded = await inspectBoundedWorktreePath(worktreeRoot, governedPath, {
    allowMissingLeaf: true,
    code: "WRITE_PREIMAGE_MISMATCH",
  });
  const parentRealpath = path.dirname(bounded.target);
  const stats = await lstat(parentRealpath, { bigint: true });
  if (!stats.isDirectory() || stats.isSymbolicLink()) fail("WRITE_PREIMAGE_MISMATCH");
  return {
    root: bounded.root,
    target: bounded.target,
    targetState: bounded.state,
    parentRealpath,
    parentIdentity: semanticIdentity("CIC-WRITE-PARENT-V1", {
      relativePath: path.relative(bounded.root, parentRealpath).replaceAll("\\", "/") || ".",
      device: String(stats.dev),
      inode: String(stats.ino),
    }),
  };
}

async function observeFile(worktreeRoot, governedPath, expectedState) {
  const safe = await safeParent(worktreeRoot, governedPath);
  const basename = governedPath.split("/").at(-1);
  const candidate = safe.target;
  const state =
    safe.targetState === "ABSENT_PROVEN"
      ? { state: "ABSENT_PROVEN", stats: null }
      : await pathState(candidate);
  if (state.state === "UNKNOWN") fail("WRITE_PREIMAGE_MISMATCH");
  if (state.state === "ABSENT_PROVEN") {
    await assertNoSemanticCollision(safe.parentRealpath, basename, false);
    if (expectedState === "PRESENT") fail("WRITE_PREIMAGE_MISMATCH");
    return {
      path: governedPath,
      state: "ABSENT_PROVEN",
      type: null,
      mode: null,
      bytes: null,
      sha256: null,
      gitBlobSha1: null,
      parentIdentity: safe.parentIdentity,
    };
  }
  await assertNoSemanticCollision(safe.parentRealpath, basename, true);
  if (state.stats.isSymbolicLink() || !state.stats.isFile()) fail("WRITE_PREIMAGE_MISMATCH");
  if (expectedState === "ABSENT_PROVEN") fail("WRITE_PREIMAGE_MISMATCH");
  const bytes = await readFile(candidate);
  return {
    path: governedPath,
    state: "PRESENT",
    type: "REGULAR_FILE",
    mode: state.stats.mode & 0o777,
    bytes: bytes.byteLength,
    sha256: sha256Hex(bytes),
    gitBlobSha1: gitBlobSha1(bytes),
    parentIdentity: safe.parentIdentity,
  };
}

function normalizeIntendedPostimage(value, operation) {
  if (operation === "DELETE") {
    if (value !== null) fail("WRITE_PREIMAGE_MISMATCH");
    return null;
  }
  requirePlainObject(value, "intended postimage");
  if (
    !Number.isSafeInteger(value.bytes) ||
    value.bytes < 0 ||
    !isIdentity(value.sha256) ||
    typeof value.gitBlobSha1 !== "string" ||
    !/^[0-9a-f]{40}$/u.test(value.gitBlobSha1)
  ) {
    fail("WRITE_PREIMAGE_MISMATCH");
  }
  return { bytes: value.bytes, sha256: value.sha256, gitBlobSha1: value.gitBlobSha1 };
}

export function intendedPostimageFromBytes(bytes) {
  if (!(bytes instanceof Uint8Array)) fail("WRITE_PREIMAGE_MISMATCH");
  return { bytes: bytes.byteLength, sha256: sha256Hex(bytes), gitBlobSha1: gitBlobSha1(bytes) };
}

function normalizeSemanticOwners(values) {
  const owners = stableUnique(values, "semantic owners");
  if (owners.length === 0) fail("AUTHORIZATION_SCOPE_MISMATCH");
  return owners.map((owner) => requirePortableId(owner, "semantic owner"));
}

function verifyWritePreimageSeal(record, addressedIdentity) {
  requirePlainObject(record, "write-preimage seal");
  const body = { ...record };
  delete body.writePreimageIdentity;
  if (
    Object.keys(record).sort().join("\0") !==
      [
        "schemaVersion",
        "operation",
        "authorizationHeadIdentity",
        "authorizationHeadGeneration",
        "authorizationIdentity",
        "taskIdentity",
        "taskContractIdentity",
        "portableWorktreeIdentity",
        "portableStateDomainIdentity",
        "localStateStoreBindingIdentity",
        "localWorktreeBindingIdentity",
        "checkpointRecordIdentity",
        "leaseIdentity",
        "currentTruthIdentity",
        "semanticOwners",
        "sourcePath",
        "targetPath",
        "sourcePreimage",
        "targetPreimage",
        "intendedPostimage",
        "writePreimageIdentity",
      ]
        .sort()
        .join("\0") ||
    record.schemaVersion !== "CIC_WRITE_PREIMAGE_V2" ||
    record.writePreimageIdentity !== addressedIdentity ||
    semanticIdentity("CIC-WRITE-PREIMAGE-V2", body) !== addressedIdentity
  ) {
    fail("WRITE_PREIMAGE_MISMATCH");
  }
  return record;
}

export async function sealWritePreimage(input) {
  const operation = input.operation;
  if (!OPERATIONS.has(operation)) fail("WRITE_PREIMAGE_MISMATCH");
  const verified = await verifyAuthorization({
    ...input,
    requiredAction: "GOVERNED_CONTENT_WRITE",
  });
  const checkpoint = await effectiveCheckpoint(verified);
  const sourcePath = operation === "RENAME" ? normalizeGovernedPath(input.sourcePath) : null;
  const targetPath = normalizeGovernedPath(input.targetPath);
  if (sourcePath !== null && sourcePath === targetPath) fail("WRITE_PREIMAGE_MISMATCH");
  const semanticOwners = normalizeSemanticOwners(input.semanticOwners);
  if (semanticOwners.some((entry) => !verified.authorization.semanticOwners.includes(entry))) {
    fail("AUTHORIZATION_SCOPE_MISMATCH");
  }
  const lease = await verifyMutationLease(
    verified,
    input.leaseIdentity,
    sourcePath ?? targetPath,
    semanticOwners,
  );
  if (sourcePath !== null && !lease.scope.includes(targetPath))
    fail("AUTHORIZATION_SCOPE_MISMATCH");
  const worktreeRoot = verified.domain.worktreeRoot;
  const targetPreimage = await observeFile(
    worktreeRoot,
    targetPath,
    new Set(["CREATE", "RENAME"]).has(operation) ? "ABSENT_PROVEN" : "PRESENT",
  );
  const sourcePreimage =
    sourcePath === null ? null : await observeFile(worktreeRoot, sourcePath, "PRESENT");
  const intendedPostimage = normalizeIntendedPostimage(input.intendedPostimage, operation);
  if (
    operation === "RENAME" &&
    (intendedPostimage.sha256 !== sourcePreimage.sha256 ||
      intendedPostimage.gitBlobSha1 !== sourcePreimage.gitBlobSha1 ||
      intendedPostimage.bytes !== sourcePreimage.bytes)
  ) {
    fail("WRITE_PREIMAGE_MISMATCH");
  }
  const body = {
    schemaVersion: "CIC_WRITE_PREIMAGE_V2",
    operation,
    authorizationHeadIdentity: verified.head.authorizationHeadIdentity,
    authorizationHeadGeneration: verified.head.generation,
    authorizationIdentity: verified.authorization.authorizationIdentity,
    taskIdentity: verified.domain.taskIdentity,
    taskContractIdentity: verified.authorization.taskContractIdentity,
    portableWorktreeIdentity: verified.domain.portableWorktreeIdentity,
    portableStateDomainIdentity: verified.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: verified.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: verified.domain.localWorktreeBindingIdentity,
    checkpointRecordIdentity: checkpoint.record.checkpointRecordIdentity,
    leaseIdentity: lease.leaseIdentity,
    currentTruthIdentity: verified.currentTruth.currentTruthIdentity,
    semanticOwners,
    sourcePath,
    targetPath,
    sourcePreimage,
    targetPreimage,
    intendedPostimage,
  };
  const seal = { ...body, writePreimageIdentity: semanticIdentity("CIC-WRITE-PREIMAGE-V2", body) };
  await writeImmutableJson(
    path.join(verified.paths.preimages, `${seal.writePreimageIdentity}.json`),
    seal,
    "WRITE_PREIMAGE_MISMATCH",
    verified.paths.stateRoot,
  );
  return { seal, verified, checkpoint, lease };
}

function equalPostimage(observed, intended) {
  return (
    observed.state === "PRESENT" &&
    observed.bytes === intended.bytes &&
    observed.sha256 === intended.sha256 &&
    observed.gitBlobSha1 === intended.gitBlobSha1
  );
}

export async function acceptSealedPostimage(input) {
  requireIdentity(input.writePreimageIdentity, "write preimage identity");
  const verified = await loadAuthorizationEpoch({
    ...input,
    requiredAction: "GOVERNED_CONTENT_WRITE",
  });
  const seal = verifyWritePreimageSeal(
    await readJson(
      path.join(verified.paths.preimages, `${input.writePreimageIdentity}.json`),
      "WRITE_PREIMAGE_MISMATCH",
      verified.paths.stateRoot,
    ),
    input.writePreimageIdentity,
  );
  if (
    seal.writePreimageIdentity !== input.writePreimageIdentity ||
    seal.authorizationHeadIdentity !== verified.head.authorizationHeadIdentity ||
    seal.authorizationIdentity !== verified.authorization.authorizationIdentity ||
    seal.leaseIdentity !== input.leaseIdentity ||
    seal.taskContractIdentity !== verified.authorization.taskContractIdentity ||
    seal.localWorktreeBindingIdentity !== verified.domain.localWorktreeBindingIdentity
  ) {
    fail("WRITE_PREIMAGE_MISMATCH");
  }
  await verifyMutationLease(
    verified,
    seal.leaseIdentity,
    seal.sourcePath ?? seal.targetPath,
    seal.semanticOwners,
  );
  const root = verified.domain.worktreeRoot;
  let postimage;
  if (seal.operation === "DELETE") {
    postimage = await observeFile(root, seal.targetPath, "ABSENT_PROVEN");
  } else {
    postimage = await observeFile(root, seal.targetPath, "PRESENT");
    if (!equalPostimage(postimage, seal.intendedPostimage)) fail("WRITE_PREIMAGE_MISMATCH");
  }
  if (seal.operation === "RENAME") {
    await observeFile(root, seal.sourcePath, "ABSENT_PROVEN");
  }
  const postimageIdentity = semanticIdentity("CIC-WRITE-POSTIMAGE-V1", {
    operation: seal.operation,
    sourcePath: seal.sourcePath,
    targetPath: seal.targetPath,
    postimage,
  });
  const changedPaths = [seal.sourcePath, seal.targetPath].filter((value) => value !== null).sort();
  const successor = await acceptSuccessorCheckpoint({
    ...input,
    movement: {
      writePreimageIdentity: seal.writePreimageIdentity,
      postimageIdentity,
      changedPaths,
      semanticOwners: seal.semanticOwners,
      contextExpansion: false,
      unexplained: false,
    },
  });
  return { seal, postimage, postimageIdentity, successor };
}
