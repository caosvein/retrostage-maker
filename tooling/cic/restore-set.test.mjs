import { execFile } from "node:child_process";
import { Buffer } from "node:buffer";
import {
  cp,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { observeCurrentTruth } from "./lib/current-truth.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import { activatePack, generatePack } from "./lib/pack-lifecycle.mjs";
import { constructProgressionRoot, promoteProgressionRoot } from "./lib/progression-root.mjs";
import {
  createRecoveryCapsule,
  recoverCurrent,
  verifyRecoveryCapsule,
} from "./lib/recovery-capsule.mjs";
import { verifyRepositoryIdentity } from "./lib/repository-identity.mjs";
import {
  I9_RESTORE_SET_LIMITS,
  captureGovernedRestoreSet,
  defineGovernedRestoreSet,
  materializeGovernedRestoreSet,
  verifyGovernedRestoreSet,
  verifyRestoredGovernedSet,
} from "./lib/restore-set.mjs";
import { verifySourceGeneration } from "./lib/source-generation.mjs";
import {
  inspectStateDomainCandidate,
  recordStateDomainBinding,
  reverifyStateDomain,
} from "./lib/state-domain.mjs";
import {
  I4_ACTION_FLAGS,
  acquireMutationLease,
  admitAuthorization,
  defineOwnerDecision,
  defineTaskContract,
  recordOwnerDecision,
  recordTaskContract,
} from "./lib/task-authorization.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const SOURCE_GENERATION = "E21080B39B6A691CF159AC24398B9D57AE4362CC9836F50CD686454F3CF65CF3";
const GIT_EXECUTABLE = path.join(process.env.ProgramFiles, "Git", "cmd", "git.exe");
const runFile = promisify(execFile);
const hash = (value) => sha256Hex(`cic-i9-restore-test:${value}`);
const scope = ["tooling/cic/lib/recovery-capsule.mjs"];
const semanticOwners = ["cic-i9-restore-owner"];
const expectedCandidatePaths = [
  "tooling/cic/bounded-scale-fixture.test.mjs",
  "tooling/cic/lib/bounded-scale-fixture.mjs",
  "tooling/cic/lib/restore-set.mjs",
  "tooling/cic/restore-set.test.mjs",
];

let scratchRoot;
let cleanClone;
let stateRoot;
let evidenceRoot;
let backupRoot;
let restoreA;
let restoreB;
let fixture;
let manifest;
let canonicalBefore;
let canonicalAfter;
let proof;

function contextIntent() {
  return {
    reviewed: true,
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      materialIdentities: [],
      reason: `Reviewed CIC I9 restore fixture excludes ${dimension}`,
    })),
  };
}

function truthRequest() {
  return { materials: [] };
}

function operationInput() {
  return {
    domainInput: fixture.domainInput,
    authorizationIdentity: fixture.authorization.authorization.authorizationIdentity,
    currentTruthRequest: truthRequest(),
  };
}

async function collectFiles(root) {
  const results = [];
  const pending = [""];
  while (pending.length > 0) {
    const relativeDirectory = pending.shift();
    const absoluteDirectory = path.join(root, ...relativeDirectory.split("/").filter(Boolean));
    const entries = (await readdir(absoluteDirectory, { withFileTypes: true })).sort(
      (left, right) => left.name.localeCompare(right.name),
    );
    for (const entry of entries) {
      const relative = [relativeDirectory, entry.name].filter(Boolean).join("/");
      if (entry.isSymbolicLink()) throw new Error("RESTORE_TEST_SYMLINK_UNEXPECTED");
      if (entry.isDirectory()) pending.push(relative);
      else if (entry.isFile() && !relative.endsWith(".lock")) results.push(relative);
      if (results.length + pending.length > 4096) throw new Error("RESTORE_TEST_BOUND_EXCEEDED");
    }
  }
  return results;
}

function stateRole(relative) {
  if (relative === "state-domain-binding.json") return "STATE_DOMAIN_BINDING";
  if (relative.startsWith("packs/")) return "PACK_STATE";
  if (relative.startsWith("progression-root/")) return "PROGRESSION_STATE";
  if (relative.includes("/leases/")) return "LEASE_HISTORY";
  return "TASK_AUTHORIZATION";
}

function sourceRecord(sourceRoot, sourceLocator, locator, role, overrides = {}) {
  return {
    sourceRoot,
    sourceLocator,
    locator,
    role,
    stableIdentity: hash(`entry:${locator}`),
    classification: "TEXT",
    retentionClass: "ACTIVE_PROTECTED",
    availability: "REQUIRED",
    ...overrides,
  };
}

function evidencePointer(identityValue, relativePath, bytes, retentionClass = "ACTIVE_PROTECTED") {
  return {
    evidenceIdentity: identityValue,
    sha256: sha256Hex(bytes),
    bytes: bytes.byteLength,
    classification: "TEXT",
    retentionClass,
    locator: { kind: "EVIDENCE_ROOT_RELATIVE", value: relativePath },
  };
}

async function errorOf(operation) {
  try {
    await operation();
    return null;
  } catch (error) {
    return error;
  }
}

async function copyScratch(source, label) {
  const destination = path.join(scratchRoot, label);
  await cp(source, destination, { recursive: true, force: false, errorOnExist: true });
  return destination;
}

beforeAll(async () => {
  canonicalBefore = await verifyRepositoryIdentity(REPOSITORY_ROOT);
  scratchRoot = await realpath(await mkdtemp(path.join(tmpdir(), "cic-i9-restore-")));
  cleanClone = path.join(scratchRoot, "clean-clone");
  stateRoot = path.join(scratchRoot, "source-state");
  evidenceRoot = path.join(scratchRoot, "source-evidence");
  backupRoot = path.join(scratchRoot, "backup");
  restoreA = path.join(scratchRoot, "restore-a");
  restoreB = path.join(scratchRoot, "restore-b");
  await runFile(
    GIT_EXECUTABLE,
    ["clone", "--local", "--no-hardlinks", REPOSITORY_ROOT, cleanClone],
    {
      windowsHide: true,
    },
  );
  await runFile(
    GIT_EXECUTABLE,
    [
      "-C",
      cleanClone,
      "remote",
      "set-url",
      "origin",
      "https://github.com/caosvein/retrostage-maker.git",
    ],
    { windowsHide: true },
  );
  const fsck = await runFile(GIT_EXECUTABLE, ["-C", cleanClone, "fsck", "--full"], {
    windowsHide: true,
  });
  const cloneRepository = await verifyRepositoryIdentity(cleanClone);
  const cloneSource = await verifySourceGeneration(cleanClone);
  await mkdir(stateRoot, { recursive: true });
  await mkdir(path.join(evidenceRoot, "accepted"), { recursive: true });

  const portableWorktreeIdentity = hash("portable-worktree");
  const authorityIdentity = hash("authority");
  const bootstrapEvidenceIdentity = hash("bootstrap-evidence");
  const task = defineTaskContract({
    taskIdentity: hash("task"),
    taskName: "cic-i9-restore-drill",
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    scope,
    owners: ["cic-i9-owner"],
    semanticOwners,
    contextIntent: contextIntent(),
  });
  const domainInput = {
    repositoryRoot: cleanClone,
    worktreeRoot: cleanClone,
    stateRoot,
    repositoryIdentity: REPOSITORY_IDENTITY,
    taskIdentity: task.taskIdentity,
    portableWorktreeIdentity,
  };
  const domainCandidate = await inspectStateDomainCandidate(domainInput);
  const domain = await recordStateDomainBinding({
    ...domainInput,
    expectedLocalStateStoreBindingIdentity: domainCandidate.localStateStoreBindingIdentity,
  });
  await recordTaskContract(domainInput, task);
  const currentTruth = await observeCurrentTruth({
    ...domainInput,
    taskContractIdentity: task.taskContractIdentity,
    authorityIdentity,
    materials: [],
  });
  const decision = defineOwnerDecision({
    decisionKind: "AUTHORIZE",
    taskIdentity: task.taskIdentity,
    taskContractIdentity: task.taskContractIdentity,
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    contextIntentIdentity: task.contextIntent.contextIntentIdentity,
    authorityIdentity,
    currentTruthIdentity: currentTruth.currentTruthIdentity,
    actions: I4_ACTION_FLAGS,
    scope,
    owners: task.owners,
    semanticOwners,
    reasonClassification: "cic-i9-restore-drill",
    reviewedEvidenceIdentities: [hash("review")],
    expectedAuthorizationHeadIdentity: null,
    expectedHeadState: null,
    expectedHeadGeneration: 0,
    expectedCurrentAuthorizationIdentity: null,
  });
  await recordOwnerDecision(domainInput, decision);
  const authorization = await admitAuthorization({
    domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest: truthRequest(),
  });
  const lease = await acquireMutationLease({
    domainInput,
    authorizationIdentity: authorization.authorization.authorizationIdentity,
    currentTruthRequest: truthRequest(),
    expectedRegistryIdentity: null,
    owner: "cic-i9-restore-test",
    scope,
    semanticOwners,
  });
  fixture = {
    portableWorktreeIdentity,
    authorityIdentity,
    bootstrapEvidenceIdentity,
    task,
    domainInput,
    domain,
    decision,
    authorization,
    lease,
  };

  const pack = await generatePack({
    ...operationInput(),
    generation: 1,
    parentPackIdentity: null,
  });
  const activePack = await activatePack({
    ...operationInput(),
    packIdentity: pack.packIdentity,
    leaseIdentity: lease.lease.leaseIdentity,
    expectedLocatorIdentity: null,
  });
  const root = await constructProgressionRoot({
    ...operationInput(),
    generation: 1,
    parentRootIdentity: null,
    lineage: { kind: "ACTIVE_PROGRESSION", lineageIdentity: hash("lineage") },
    currentControl: {
      role: "CURRENT_CONTROL",
      identity: hash("current-control"),
      locator: { kind: "EVIDENCE_ID", value: "cic-i9-current-control" },
    },
    sessionWorkstream: {
      role: "SESSION_WORKSTREAM",
      identity: hash("session-workstream"),
      locator: { kind: "EVIDENCE_ID", value: "cic-i9-session-workstream" },
    },
    bootstrap: {
      disposition: "PASS",
      evidenceIdentities: [bootstrapEvidenceIdentity],
      nextAction: "Continue the exact governed CIC I9 implementation.",
      forbiddenActions: ["COMMIT", "MUTATE_SOURCES", "PUSH", "STAGE"],
    },
  });
  const activeProgression = await promoteProgressionRoot({
    ...operationInput(),
    rootIdentity: root.rootIdentity,
    leaseIdentity: lease.lease.leaseIdentity,
    expectedActiveRootIdentity: null,
    expectedParentRootIdentity: null,
    expectedGeneration: 1,
  });
  const evidenceBytes = Buffer.from("CIC I9 required recovery evidence\n", "utf8");
  await writeFile(path.join(evidenceRoot, "accepted", "bootstrap.txt"), evidenceBytes);
  const acceptedPointer = evidencePointer(
    bootstrapEvidenceIdentity,
    "accepted/bootstrap.txt",
    evidenceBytes,
  );
  const capsuleInput = {
    ...operationInput(),
    evidenceRoot,
    expectedActiveRootIdentity: root.rootIdentity,
    acceptedEvidencePointers: [acceptedPointer],
    staleEvidencePointers: [],
    embeddedMaterials: [],
    workstreamChanges: { state: "CLEAN", paths: [] },
  };
  const capsule = await createRecoveryCapsule(capsuleInput);
  const recovered = await recoverCurrent({
    ...operationInput(),
    capsule,
    evidenceRoot,
  });
  const artifactsRoot = path.join(scratchRoot, "source-artifacts");
  await mkdir(artifactsRoot);
  await writeFile(path.join(artifactsRoot, "recovery-capsule.json"), `${canonicalJson(capsule)}\n`);
  const binaryBytes = Buffer.from([0, 1, 2, 3, 4, 5]);
  await writeFile(path.join(evidenceRoot, "accepted", "pointer.bin"), binaryBytes);

  const stateFiles = await collectFiles(stateRoot);
  const sources = stateFiles.map((relative) =>
    sourceRecord(stateRoot, relative, `state/${relative}`, stateRole(relative)),
  );
  sources.push(
    sourceRecord(
      artifactsRoot,
      "recovery-capsule.json",
      "artifacts/recovery-capsule.json",
      "RECOVERY_CAPSULE",
      { stableIdentity: capsule.capsuleIdentity },
    ),
    sourceRecord(
      evidenceRoot,
      "accepted/bootstrap.txt",
      "evidence/accepted/bootstrap.txt",
      "REQUIRED_EVIDENCE",
      { stableIdentity: bootstrapEvidenceIdentity },
    ),
    sourceRecord(
      evidenceRoot,
      "accepted/pointer.bin",
      "evidence/accepted/pointer.bin",
      "REQUIRED_EVIDENCE",
      { classification: "BINARY", stableIdentity: hash("binary-evidence") },
    ),
  );
  const taskPrefix = `state/tasks/${task.taskIdentity}`;
  const packPrefix = `state/packs/${task.taskIdentity}`;
  const progressionPrefix = "state/progression-root";
  const links = [
    {
      kind: "JSON_IDENTITY",
      sourceLocator: `${taskPrefix}/authorization/head.json`,
      sourceField: "currentAuthorizationIdentity",
      targetLocator: `${taskPrefix}/authorization/records/${authorization.authorization.authorizationIdentity}.json`,
      targetField: "authorizationIdentity",
      targetIdentity: authorization.authorization.authorizationIdentity,
    },
    {
      kind: "JSON_IDENTITY",
      sourceLocator: `${packPrefix}/active.json`,
      sourceField: "packIdentity",
      targetLocator: `${packPrefix}/manifests/${pack.packIdentity}.json`,
      targetField: "packIdentity",
      targetIdentity: pack.packIdentity,
    },
    {
      kind: "JSON_IDENTITY",
      sourceLocator: `${progressionPrefix}/active.json`,
      sourceField: "rootIdentity",
      targetLocator: `${progressionPrefix}/roots/${root.rootIdentity}.json`,
      targetField: "rootIdentity",
      targetIdentity: root.rootIdentity,
    },
    {
      kind: "JSON_IDENTITY",
      sourceLocator: `${progressionPrefix}/active.json`,
      sourceField: "promotionIdentity",
      targetLocator: `${progressionPrefix}/promotions/${activeProgression.promotion.promotionIdentity}.json`,
      targetField: "promotionIdentity",
      targetIdentity: activeProgression.promotion.promotionIdentity,
    },
  ];
  manifest = await captureGovernedRestoreSet({
    backupRoot,
    repository: {
      repositoryIdentity: REPOSITORY_IDENTITY,
      head: canonicalBefore.head.commit,
      tree: canonicalBefore.head.tree,
    },
    sourceGeneration: SOURCE_GENERATION,
    capsuleIdentity: capsule.capsuleIdentity,
    sources,
    links,
  });
  const backupVerification = await verifyGovernedRestoreSet(manifest, { backupRoot });
  const restoredA = await materializeGovernedRestoreSet(manifest, {
    backupRoot,
    restoreRoot: restoreA,
  });
  const restoredB = await materializeGovernedRestoreSet(manifest, {
    backupRoot,
    restoreRoot: restoreB,
  });
  const restoredCapsule = JSON.parse(
    await readFile(path.join(restoreA, "artifacts", "recovery-capsule.json"), "utf8"),
  );
  const restoredEvidenceRoot = path.join(restoreA, "evidence");
  const restoredCapsuleVerification = await verifyRecoveryCapsule(restoredCapsule, {
    evidenceRoot: restoredEvidenceRoot,
  });
  proof = {
    fsck,
    cloneRepository,
    cloneSource,
    pack,
    activePack,
    root,
    activeProgression,
    capsule,
    capsuleInput,
    acceptedPointer,
    recovered,
    backupVerification,
    restoredA,
    restoredB,
    restoredCapsuleVerification,
  };
}, 900_000);

afterAll(async () => {
  if (typeof scratchRoot !== "string") return;
  const temporaryRoot = await realpath(tmpdir());
  const relative = path.relative(temporaryRoot, scratchRoot);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    !path.basename(scratchRoot).startsWith("cic-i9-restore-")
  ) {
    throw new Error("CIC_I9_SCRATCH_CLEANUP_BOUNDARY");
  }
  await rm(scratchRoot, { recursive: true, force: true });
});

describe.sequential("CIC I9 governed restore set and clean-clone drill", () => {
  it("I9-S01 proves clean clone, exact restore, capsule recovery, and current Source/repository identity", () => {
    expect(I9_RESTORE_SET_LIMITS).toEqual({
      maxEntries: 4096,
      maxInlineItemBytes: 1_048_576,
      maxLocatorBytes: 1024,
      maxPayloadBytes: 67_108_864,
    });
    expect(proof.fsck.stderr).toBe("");
    expect(proof.cloneRepository).toMatchObject({
      status: "PASS",
      head: {
        commit: canonicalBefore.head.commit,
        tree: canonicalBefore.head.tree,
      },
      errors: [],
    });
    expect(proof.cloneSource).toMatchObject({
      status: "PASS",
      generationFingerprint: SOURCE_GENERATION,
      errors: [],
    });
    expect(proof.backupVerification.status).toBe("PASS");
    expect(proof.restoredA.status).toBe("PASS");
    expect(proof.recovered).toMatchObject({ status: "PASS", current: true, authorityGrants: [] });
    expect(proof.restoredCapsuleVerification.availability.status).toBe("PASS");
  });

  it("I9-S02 fails closed when a required backup object is missing", async () => {
    const faultRoot = await copyScratch(backupRoot, "fault-missing-object");
    const entry = manifest.entries[0];
    await unlink(path.join(faultRoot, entry.objectLocator));
    await expect(
      verifyGovernedRestoreSet(manifest, { backupRoot: faultRoot }),
    ).rejects.toMatchObject({ code: "REQUIRED_OBJECT_UNAVAILABLE" });
  });

  it("I9-S03 fails closed when a required backup object is corrupt", async () => {
    const faultRoot = await copyScratch(backupRoot, "fault-corrupt-object");
    const entry = manifest.entries[0];
    await writeFile(path.join(faultRoot, entry.objectLocator), "corrupt\n");
    await expect(
      verifyGovernedRestoreSet(manifest, { backupRoot: faultRoot }),
    ).rejects.toMatchObject({ code: "REQUIRED_OBJECT_UNAVAILABLE" });
  });

  it("I9-S04 fails closed on a stale Source file", async () => {
    const staleRoot = await copyScratch(cleanClone, "fault-stale-source");
    await writeFile(
      path.join(staleRoot, "docs", "sources", "00_RSM_REBOOT_PROJECT_CHARTER.md"),
      "\nstale\n",
      { flag: "a" },
    );
    const result = await verifySourceGeneration(staleRoot);
    expect(result.status).toBe("BLOCKED");
    expect(result.errors.map(({ code }) => code)).toContain("SOURCE_FILE_HASH_MISMATCH");
  });

  it("I9-S05 rejects a coherent but wrong Source generation against the restore-set binding", async () => {
    const mixedRoot = await copyScratch(cleanClone, "fault-mixed-source-generation");
    const sourcePath = path.join(mixedRoot, "docs", "sources", "00_RSM_REBOOT_PROJECT_CHARTER.md");
    await writeFile(sourcePath, "\nother-generation\n", { flag: "a" });
    const sourceSha = sha256Hex(await readFile(sourcePath));
    const manifestPath = path.join(mixedRoot, "docs", "sources", "SOURCE-MANIFEST.tsv");
    const rows = (await readFile(manifestPath, "utf8")).split("\n");
    rows[1] = rows[1].replace(/[0-9A-F]{64}/u, sourceSha);
    await writeFile(manifestPath, rows.join("\n"));
    const result = await verifySourceGeneration(mixedRoot);
    expect(result.status).toBe("PASS");
    expect(result.generationFingerprint).not.toBe(manifest.sourceGeneration);
  });

  it("I9-S06 fails closed on an incomplete shallow repository view", async () => {
    const shallowRoot = await copyScratch(cleanClone, "fault-incomplete-repository");
    await writeFile(path.join(shallowRoot, ".git", "shallow"), `${canonicalBefore.head.commit}\n`);
    const result = await verifyRepositoryIdentity(shallowRoot);
    expect(result.status).toBe("BLOCKED");
    expect(result.errors.map(({ code }) => code)).toContain("REPOSITORY_SHALLOW_VIEW");
  });

  it("I9-S07 preserves restore-set identity across permitted relocation", () => {
    expect(proof.restoredA.restoreSetIdentity).toBe(manifest.restoreSetIdentity);
    expect(proof.restoredB.restoreSetIdentity).toBe(manifest.restoreSetIdentity);
  });

  it("I9-S08 recovers active pack and progression locator targets", async () => {
    const verified = await verifyRestoredGovernedSet(manifest, { restoreRoot: restoreA });
    expect(verified.status).toBe("PASS");
    expect(manifest.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ targetIdentity: proof.pack.packIdentity }),
        expect.objectContaining({ targetIdentity: proof.root.rootIdentity }),
        expect.objectContaining({
          targetIdentity: proof.activeProgression.promotion.promotionIdentity,
        }),
      ]),
    );
  });

  it("I9-S09 fails closed when the restored progression locator is changed", async () => {
    const faultRoot = await copyScratch(restoreA, "fault-progression-parent");
    const locatorPath = path.join(faultRoot, "state", "progression-root", "active.json");
    const locator = JSON.parse(await readFile(locatorPath, "utf8"));
    locator.parentRootIdentity = hash("wrong-parent");
    await writeFile(locatorPath, `${canonicalJson(locator)}\n`);
    await expect(
      verifyRestoredGovernedSet(manifest, { restoreRoot: faultRoot }),
    ).rejects.toMatchObject({ code: "REQUIRED_OBJECT_UNAVAILABLE" });
  });

  it("I9-S10 rejects replay of the restored machine-local state binding", async () => {
    await expect(
      reverifyStateDomain({
        ...fixture.domainInput,
        repositoryRoot: cleanClone,
        worktreeRoot: cleanClone,
        stateRoot: path.join(restoreA, "state"),
      }),
    ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });
  });

  it("I9-S11 restores no lease, mutation, or publication authority", () => {
    expect(manifest.authorityGrants).toEqual([]);
    expect(proof.restoredA.authorityGrants).toEqual([]);
    expect(proof.restoredB.authorityGrants).toEqual([]);
    expect(proof.restoredCapsuleVerification.capsule.authorityGrants).toEqual([]);
  });

  it("I9-S18 preserves pointer-only treatment for binary recovery material", async () => {
    expect(
      manifest.entries.find(({ locator }) => locator === "evidence/accepted/pointer.bin"),
    ).toMatchObject({ classification: "BINARY", disposition: "POINTER_PLUS_HASH" });
    const error = await errorOf(() =>
      verifyRecoveryCapsule(
        {
          ...proof.capsule,
          embeddedMaterials: [{ kind: "BINARY", text: "forbidden-inline-binary" }],
        },
        { evidenceRoot },
      ),
    );
    expect(error).toMatchObject({ code: "PROGRESSION_ROOT_INVALID" });
  });

  it("I9-S19 rejects rebuildable retention for required recovery evidence", async () => {
    const error = await errorOf(() =>
      verifyRecoveryCapsule(
        {
          ...proof.capsule,
          acceptedEvidencePointers: [
            { ...proof.capsule.acceptedEvidencePointers[0], retentionClass: "REBUILDABLE" },
          ],
        },
        { evidenceRoot },
      ),
    );
    expect(error).toMatchObject({ code: "PROGRESSION_ROOT_INVALID" });
  });

  it("I9-S20 rejects exact, case-folded, and Unicode locator collisions", () => {
    const base = {
      role: "REQUIRED_EVIDENCE",
      classification: "TEXT",
      retentionClass: "ACTIVE_PROTECTED",
      availability: "REQUIRED",
      bytes: 0,
      sha256: sha256Hex(new Uint8Array()),
    };
    for (const [left, right] of [
      ["evidence/A.txt", "evidence/a.txt"],
      ["evidence/Ä.txt", "evidence/ä.txt"],
    ]) {
      expect(() =>
        defineGovernedRestoreSet({
          repository: manifest.repository,
          sourceGeneration: manifest.sourceGeneration,
          capsuleIdentity: manifest.capsuleIdentity,
          entries: [
            { ...base, locator: left, stableIdentity: hash(`left:${left}`) },
            { ...base, locator: right, stableIdentity: hash(`right:${right}`) },
          ],
          links: [],
        }),
      ).toThrow(expect.objectContaining({ code: "CONTEXT_IDENTITY_COLLISION" }));
    }
  });

  it("I9-S21 leaves the canonical repository snapshot and governed candidate exact", async () => {
    canonicalAfter = await verifyRepositoryIdentity(REPOSITORY_ROOT);
    expect(canonicalAfter.status).toBe("PASS");
    expect(canonicalAfter.snapshotFingerprint).toBe(canonicalBefore.snapshotFingerprint);
    expect(canonicalAfter.head).toEqual(canonicalBefore.head);
    expect(canonicalAfter.sourceGeneration.fingerprint).toBe(SOURCE_GENERATION);
    expect(canonicalAfter.worktree.staged.bytes).toBe(canonicalBefore.worktree.staged.bytes);
    expect(canonicalAfter.worktree.staged.sha256).toBe(canonicalBefore.worktree.staged.sha256);
    expect(canonicalAfter.worktree.unstaged.bytes).toBe(canonicalBefore.worktree.unstaged.bytes);
    expect(canonicalAfter.worktree.unstaged.sha256).toBe(canonicalBefore.worktree.unstaged.sha256);
    expect(canonicalAfter.worktree.untracked.entries).toEqual(
      canonicalBefore.worktree.untracked.entries,
    );
  });

  it("I9-S22 binds proof to four present, nonempty, identity-bearing implementation postimages", async () => {
    const identities = [];
    for (const relative of expectedCandidatePaths) {
      const absolute = path.join(REPOSITORY_ROOT, ...relative.split("/"));
      const stats = await lstat(absolute);
      const bytes = await readFile(absolute);
      expect(stats.isFile()).toBe(true);
      expect(bytes.byteLength).toBeGreaterThan(0);
      identities.push(sha256Hex(bytes));
    }
    expect(new Set(identities).size).toBe(4);
  });
});
