import { execFile } from "node:child_process";
import { Buffer } from "node:buffer";
import { mkdir, mkdtemp, open, realpath, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { observeCurrentTruth } from "./lib/current-truth.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import { constructProgressionRoot, promoteProgressionRoot } from "./lib/progression-root.mjs";
import {
  RECOVERY_MAX_EMBEDDED_ITEM_BYTES,
  createRecoveryCapsule,
  installRecoveryEvidenceVerificationBarrierForTest,
  recoverCurrent,
  verifyRecoveryCapsule,
} from "./lib/recovery-capsule.mjs";
import {
  I4_ACTION_FLAGS,
  acquireMutationLease,
  admitAuthorization,
  defineOwnerDecision,
  defineTaskContract,
  recordOwnerDecision,
  recordTaskContract,
  revokeAuthorization,
} from "./lib/task-authorization.mjs";
import { inspectStateDomainCandidate, recordStateDomainBinding } from "./lib/state-domain.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const GIT_EXECUTABLE = path.join(process.env.ProgramFiles, "Git", "cmd", "git.exe");
const runFile = promisify(execFile);
const hash = (value) => sha256Hex(`i7-recovery-test:${value}`);
const semanticOwners = ["progression-recovery-root"];
const scope = ["tooling/cic/lib/recovery-capsule.mjs"];
const FORBIDDEN_ACTIONS = ["COMMIT", "MUTATE_SOURCES", "PUSH", "STAGE"];

let temporary;
let worktreeRoot;
let serializationHandle;
const fixtures = new Map();
let recoveryProof;
const SERIALIZATION_LOCK = path.join(tmpdir(), `cic-i7-recovery-tests-${process.ppid}.lock`);

async function acquireSerializationLock() {
  for (let attempt = 0; attempt < 6_000; attempt += 1) {
    try {
      serializationHandle = await open(SERIALIZATION_LOCK, "wx");
      return;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      await delay(250);
    }
  }
  throw new Error("CIC_I7_TEST_SERIALIZATION_TIMEOUT");
}

await acquireSerializationLock();

function contextIntent(label) {
  return {
    reviewed: true,
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      materialIdentities: [],
      reason: `Reviewed ${label} excludes ${dimension}`,
    })),
  };
}

function truthRequest() {
  return { materials: [] };
}

async function createAuthorizedFixture(label) {
  const stateRoot = path.join(temporary, `state-${label}`);
  await mkdir(stateRoot, { recursive: true });
  const portableWorktreeIdentity = hash(`worktree-${label}`);
  const authorityIdentity = hash(`authority-${label}`);
  const bootstrapEvidenceIdentity = hash(`bootstrap-evidence-${label}`);
  const task = defineTaskContract({
    taskIdentity: hash(`task-${label}`),
    taskName: `i7-recovery-${label}`,
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    scope,
    owners: ["owner-a"],
    semanticOwners,
    contextIntent: contextIntent(label),
  });
  const domainInput = {
    repositoryRoot: worktreeRoot,
    worktreeRoot,
    stateRoot,
    repositoryIdentity: REPOSITORY_IDENTITY,
    taskIdentity: task.taskIdentity,
    portableWorktreeIdentity,
  };
  const candidate = await inspectStateDomainCandidate(domainInput);
  const domain = await recordStateDomainBinding({
    ...domainInput,
    expectedLocalStateStoreBindingIdentity: candidate.localStateStoreBindingIdentity,
  });
  await recordTaskContract(domainInput, task);
  const truth = await observeCurrentTruth({
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
    currentTruthIdentity: truth.currentTruthIdentity,
    actions: I4_ACTION_FLAGS,
    scope,
    owners: task.owners,
    semanticOwners,
    reasonClassification: "i7-recovery-test",
    reviewedEvidenceIdentities: [hash(`review-${label}`)],
    expectedAuthorizationHeadIdentity: null,
    expectedHeadState: null,
    expectedHeadGeneration: 0,
    expectedCurrentAuthorizationIdentity: null,
  });
  await recordOwnerDecision(domainInput, decision);
  const admitted = await admitAuthorization({
    domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest: truthRequest(),
  });
  const lease = await acquireMutationLease({
    domainInput,
    authorizationIdentity: admitted.authorization.authorizationIdentity,
    currentTruthRequest: truthRequest(),
    expectedRegistryIdentity: null,
    owner: "i7-recovery-test",
    scope,
    semanticOwners,
  });
  return {
    label,
    stateRoot,
    domainInput,
    domain,
    task,
    authorityIdentity,
    admitted,
    lease,
    bootstrapEvidenceIdentity,
  };
}

function fixtureFor(label) {
  const fixture = fixtures.get(label);
  if (fixture === undefined) throw new Error(`missing fixture ${label}`);
  return fixture;
}

function operationInput(fixture) {
  return {
    domainInput: fixture.domainInput,
    authorizationIdentity: fixture.admitted.authorization.authorizationIdentity,
    currentTruthRequest: truthRequest(),
  };
}

function progressionInput(fixture, overrides = {}) {
  return {
    ...operationInput(fixture),
    generation: 1,
    parentRootIdentity: null,
    lineage: {
      kind: "ACTIVE_PROGRESSION",
      lineageIdentity: hash(`lineage-${fixture.label}`),
    },
    currentControl: {
      role: "CURRENT_CONTROL",
      identity: hash(`current-control-${fixture.label}`),
      locator: { kind: "EVIDENCE_ID", value: `current-${fixture.label}` },
    },
    sessionWorkstream: {
      role: "SESSION_WORKSTREAM",
      identity: hash(`session-workstream-${fixture.label}`),
      locator: { kind: "EVIDENCE_ID", value: `session-${fixture.label}` },
    },
    bootstrap: {
      disposition: "PASS",
      evidenceIdentities: [fixture.bootstrapEvidenceIdentity],
      nextAction: "Continue the exact governed CIC task.",
      forbiddenActions: FORBIDDEN_ACTIONS,
    },
    ...overrides,
  };
}

async function activateGenesis(fixture, overrides = {}) {
  const constructed = await constructProgressionRoot(progressionInput(fixture, overrides));
  const promoted = await promoteProgressionRoot({
    ...operationInput(fixture),
    rootIdentity: constructed.rootIdentity,
    leaseIdentity: fixture.lease.lease.leaseIdentity,
    expectedActiveRootIdentity: null,
    expectedParentRootIdentity: null,
    expectedGeneration: 1,
  });
  return { constructed, promoted };
}

function evidencePointer(evidenceIdentity, relativePath, bytes, classification = "TEXT") {
  return {
    evidenceIdentity,
    sha256: sha256Hex(bytes),
    bytes: bytes.byteLength,
    classification,
    retentionClass: "ACTIVE_PROTECTED",
    locator: { kind: "EVIDENCE_ROOT_RELATIVE", value: relativePath },
  };
}

async function writeEvidence(root, relativePath, bytes) {
  const filePath = path.join(root, ...relativePath.split("/"));
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, bytes);
  return filePath;
}

async function createPrimaryEvidence(fixture, suffix = "primary") {
  const evidenceRoot = path.join(temporary, `evidence-${fixture.label}-${suffix}`);
  await mkdir(evidenceRoot, { recursive: true });
  const relativePath = "accepted/bootstrap.txt";
  const bytes = Buffer.from(`accepted evidence for ${fixture.label}\n`, "utf8");
  const filePath = await writeEvidence(evidenceRoot, relativePath, bytes);
  return {
    evidenceRoot,
    relativePath,
    bytes,
    filePath,
    pointer: evidencePointer(fixture.bootstrapEvidenceIdentity, relativePath, bytes),
  };
}

function capsuleInput(fixture, evidence, overrides = {}) {
  return {
    ...operationInput(fixture),
    evidenceRoot: evidence.evidenceRoot,
    acceptedEvidencePointers: [evidence.pointer],
    staleEvidencePointers: [],
    embeddedMaterials: [],
    workstreamChanges: { state: "CLEAN", paths: [] },
    ...overrides,
  };
}

async function revoke(fixture) {
  const truth = await observeCurrentTruth({
    ...fixture.domainInput,
    taskContractIdentity: fixture.task.taskContractIdentity,
    authorityIdentity: fixture.authorityIdentity,
    materials: [],
  });
  const current = fixture.admitted;
  const decision = defineOwnerDecision({
    decisionKind: "REVOKE",
    taskIdentity: fixture.task.taskIdentity,
    taskContractIdentity: fixture.task.taskContractIdentity,
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity: fixture.domain.portableWorktreeIdentity,
    portableStateDomainIdentity: fixture.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: fixture.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: fixture.domain.localWorktreeBindingIdentity,
    contextIntentIdentity: fixture.task.contextIntent.contextIntentIdentity,
    authorityIdentity: fixture.authorityIdentity,
    currentTruthIdentity: truth.currentTruthIdentity,
    actions: current.authorization.actions,
    scope: current.authorization.scope,
    owners: current.authorization.owners,
    semanticOwners: current.authorization.semanticOwners,
    reasonClassification: "i7-recovery-revocation-test",
    reviewedEvidenceIdentities: [hash(`revocation-${fixture.label}`)],
    expectedAuthorizationHeadIdentity: current.head.authorizationHeadIdentity,
    expectedHeadState: "ACTIVE",
    expectedHeadGeneration: current.head.generation,
    expectedCurrentAuthorizationIdentity: current.authorization.authorizationIdentity,
  });
  await recordOwnerDecision(fixture.domainInput, decision);
  return revokeAuthorization({
    domainInput: fixture.domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest: truthRequest(),
  });
}

async function errorOf(operation) {
  try {
    await operation();
    return null;
  } catch (error) {
    return error;
  }
}

async function withEvidenceVerificationBarrier(barrier, operation) {
  const removeBarrier = installRecoveryEvidenceVerificationBarrierForTest(barrier);
  try {
    return await operation();
  } finally {
    removeBarrier();
  }
}

beforeAll(async () => {
  const alias = await mkdtemp(path.join(tmpdir(), "cic-i7-recovery-"));
  temporary = await realpath(alias);
  worktreeRoot = path.join(temporary, "worktree");
  await runFile(
    GIT_EXECUTABLE,
    ["clone", "--local", "--no-hardlinks", REPOSITORY_ROOT, worktreeRoot],
    {
      windowsHide: true,
    },
  );
  await runFile(
    GIT_EXECUTABLE,
    [
      "-C",
      worktreeRoot,
      "remote",
      "set-url",
      "origin",
      "https://github.com/caosvein/retrostage-maker.git",
    ],
    { windowsHide: true },
  );
  const primary = await createAuthorizedFixture("primary");
  primary.active = await activateGenesis(primary);
  primary.evidence = await createPrimaryEvidence(primary);
  primary.capsuleInput = capsuleInput(primary, primary.evidence, {
    expectedActiveRootIdentity: primary.active.constructed.rootIdentity,
  });
  primary.capsule = await createRecoveryCapsule(primary.capsuleInput);
  primary.secondCapsule = await createRecoveryCapsule(primary.capsuleInput);
  primary.recovered = await recoverCurrent({
    ...operationInput(primary),
    capsule: JSON.parse(`${canonicalJson(primary.capsule)}\n`),
    evidenceRoot: primary.evidence.evidenceRoot,
  });
  fixtures.set("primary", primary);

  const blocked = await createAuthorizedFixture("blocked");
  blocked.bootstrap = {
    disposition: "BLOCKED",
    evidenceIdentities: [blocked.bootstrapEvidenceIdentity],
    nextAction: "Obtain the missing reviewed evidence.",
    forbiddenActions: FORBIDDEN_ACTIONS,
  };
  await activateGenesis(blocked, { bootstrap: blocked.bootstrap });
  blocked.evidence = await createPrimaryEvidence(blocked);
  blocked.capsule = await createRecoveryCapsule(capsuleInput(blocked, blocked.evidence));
  blocked.recovered = await recoverCurrent({
    ...operationInput(blocked),
    capsule: blocked.capsule,
    evidenceRoot: blocked.evidence.evidenceRoot,
  });
  fixtures.set("blocked", blocked);

  const pointerOnlyPointers = [primary.evidence.pointer];
  for (const classification of ["LARGE", "BINARY", "MEDIA", "BUILD"]) {
    const relativePath = `pointer-only/${classification.toLowerCase()}.bin`;
    const bytes = Buffer.from(`pointer-${classification}\n`, "utf8");
    await writeEvidence(primary.evidence.evidenceRoot, relativePath, bytes);
    pointerOnlyPointers.push(
      evidencePointer(hash(`pointer-${classification}`), relativePath, bytes, classification),
    );
  }
  const pointerOnlyCapsule = await createRecoveryCapsule(
    capsuleInput(primary, primary.evidence, { acceptedEvidencePointers: pointerOnlyPointers }),
  );
  const oversizedEmbedError = await errorOf(() =>
    createRecoveryCapsule(
      capsuleInput(primary, primary.evidence, {
        embeddedMaterials: [
          { kind: "UTF8_TEXT", text: "x".repeat(RECOVERY_MAX_EMBEDDED_ITEM_BYTES + 1) },
        ],
      }),
    ),
  );
  const binaryEmbedError = await errorOf(() =>
    createRecoveryCapsule(
      capsuleInput(primary, primary.evidence, {
        embeddedMaterials: [{ kind: "BINARY", text: "not valid embedded material" }],
      }),
    ),
  );

  const collisionErrors = {};
  for (const [label, left, right] of [
    ["duplicate", "collision/same.txt", "collision/same.txt"],
    ["case", "collision/File.txt", "collision/file.txt"],
    ["Unicode case", "collision/Ä.txt", "collision/ä.txt"],
  ]) {
    collisionErrors[label] = await errorOf(() =>
      createRecoveryCapsule(
        capsuleInput(primary, primary.evidence, {
          acceptedEvidencePointers: [
            primary.evidence.pointer,
            evidencePointer(hash(`collision-left-${label}`), left, Buffer.from("left\n")),
            evidencePointer(hash(`collision-right-${label}`), right, Buffer.from("right\n")),
          ],
        }),
      ),
    );
  }

  const recoveryRootRace = await createAuthorizedFixture("recovery-root-race");
  recoveryRootRace.active = await activateGenesis(recoveryRootRace);
  recoveryRootRace.evidence = await createPrimaryEvidence(recoveryRootRace);
  recoveryRootRace.capsule = await createRecoveryCapsule(
    capsuleInput(recoveryRootRace, recoveryRootRace.evidence),
  );
  recoveryRootRace.successor = await constructProgressionRoot(
    progressionInput(recoveryRootRace, {
      generation: 2,
      parentRootIdentity: recoveryRootRace.active.constructed.rootIdentity,
      sessionWorkstream: {
        role: "SESSION_WORKSTREAM",
        identity: hash("recovery-root-race-successor-workstream"),
        locator: { kind: "EVIDENCE_ID", value: "recovery-root-race-successor-workstream" },
      },
    }),
  );
  let recoveryRootRaceBarrierCalls = 0;
  const inFlightRootError = await errorOf(() =>
    withEvidenceVerificationBarrier(
      async () => {
        recoveryRootRaceBarrierCalls += 1;
        await promoteProgressionRoot({
          ...operationInput(recoveryRootRace),
          rootIdentity: recoveryRootRace.successor.rootIdentity,
          leaseIdentity: recoveryRootRace.lease.lease.leaseIdentity,
          expectedActiveRootIdentity: recoveryRootRace.active.constructed.rootIdentity,
          expectedParentRootIdentity: recoveryRootRace.active.constructed.rootIdentity,
          expectedGeneration: 2,
        });
      },
      () =>
        recoverCurrent({
          ...operationInput(recoveryRootRace),
          capsule: recoveryRootRace.capsule,
          evidenceRoot: recoveryRootRace.evidence.evidenceRoot,
        }),
    ),
  );

  const recoveryRevocationRace = await createAuthorizedFixture("recovery-revocation-race");
  recoveryRevocationRace.active = await activateGenesis(recoveryRevocationRace);
  recoveryRevocationRace.evidence = await createPrimaryEvidence(recoveryRevocationRace);
  recoveryRevocationRace.capsule = await createRecoveryCapsule(
    capsuleInput(recoveryRevocationRace, recoveryRevocationRace.evidence),
  );
  let recoveryRevocationRaceBarrierCalls = 0;
  const inFlightRevocationError = await errorOf(() =>
    withEvidenceVerificationBarrier(
      async () => {
        recoveryRevocationRaceBarrierCalls += 1;
        await revoke(recoveryRevocationRace);
      },
      () =>
        recoverCurrent({
          ...operationInput(recoveryRevocationRace),
          capsule: recoveryRevocationRace.capsule,
          evidenceRoot: recoveryRevocationRace.evidence.evidenceRoot,
        }),
    ),
  );

  const capsuleCreationRace = await createAuthorizedFixture("capsule-creation-race");
  capsuleCreationRace.active = await activateGenesis(capsuleCreationRace);
  capsuleCreationRace.evidence = await createPrimaryEvidence(capsuleCreationRace);
  capsuleCreationRace.successor = await constructProgressionRoot(
    progressionInput(capsuleCreationRace, {
      generation: 2,
      parentRootIdentity: capsuleCreationRace.active.constructed.rootIdentity,
      sessionWorkstream: {
        role: "SESSION_WORKSTREAM",
        identity: hash("capsule-creation-race-successor-workstream"),
        locator: { kind: "EVIDENCE_ID", value: "capsule-creation-race-successor-workstream" },
      },
    }),
  );
  let capsuleCreationRaceBarrierCalls = 0;
  const inFlightCapsuleCreationError = await errorOf(() =>
    withEvidenceVerificationBarrier(
      async () => {
        capsuleCreationRaceBarrierCalls += 1;
        await promoteProgressionRoot({
          ...operationInput(capsuleCreationRace),
          rootIdentity: capsuleCreationRace.successor.rootIdentity,
          leaseIdentity: capsuleCreationRace.lease.lease.leaseIdentity,
          expectedActiveRootIdentity: capsuleCreationRace.active.constructed.rootIdentity,
          expectedParentRootIdentity: capsuleCreationRace.active.constructed.rootIdentity,
          expectedGeneration: 2,
        });
      },
      () => createRecoveryCapsule(capsuleInput(capsuleCreationRace, capsuleCreationRace.evidence)),
    ),
  );

  const successor = await constructProgressionRoot(
    progressionInput(primary, {
      generation: 2,
      parentRootIdentity: primary.active.constructed.rootIdentity,
      sessionWorkstream: {
        role: "SESSION_WORKSTREAM",
        identity: hash("successor-workstream"),
        locator: { kind: "EVIDENCE_ID", value: "successor-workstream" },
      },
    }),
  );
  await promoteProgressionRoot({
    ...operationInput(primary),
    rootIdentity: successor.rootIdentity,
    leaseIdentity: primary.lease.lease.leaseIdentity,
    expectedActiveRootIdentity: primary.active.constructed.rootIdentity,
    expectedParentRootIdentity: primary.active.constructed.rootIdentity,
    expectedGeneration: 2,
  });
  const staleRootError = await errorOf(() =>
    recoverCurrent({
      ...operationInput(primary),
      capsule: primary.capsule,
      evidenceRoot: primary.evidence.evidenceRoot,
    }),
  );

  const movementPath = path.join(worktreeRoot, "i7-recovery-currentness-movement.txt");
  await writeFile(movementPath, "movement\n", "utf8");
  const movementError = await errorOf(() =>
    recoverCurrent({
      ...operationInput(blocked),
      capsule: blocked.capsule,
      evidenceRoot: blocked.evidence.evidenceRoot,
    }),
  );
  await unlink(movementPath);
  await revoke(blocked);
  const revokedError = await errorOf(() =>
    recoverCurrent({
      ...operationInput(blocked),
      capsule: blocked.capsule,
      evidenceRoot: blocked.evidence.evidenceRoot,
    }),
  );
  recoveryProof = {
    pointerOnlyCapsule,
    oversizedEmbedError,
    binaryEmbedError,
    collisionErrors,
    staleRootError,
    movementError,
    revokedError,
    inFlightRootError,
    inFlightRevocationError,
    inFlightCapsuleCreationError,
    recoveryRootRaceBarrierCalls,
    recoveryRevocationRaceBarrierCalls,
    capsuleCreationRaceBarrierCalls,
  };
}, 900_000);

afterAll(async () => {
  if (serializationHandle) {
    await serializationHandle.close();
    await unlink(SERIALIZATION_LOCK);
  }
});

describe.sequential("CIC-I7 pointer-oriented fresh-session recovery capsule", () => {
  it("creates byte-identical deterministic capsules and recovers exact PASS control", async () => {
    const fixture = fixtureFor("primary");
    const active = fixture.active;
    const first = fixture.capsule;
    const second = fixture.secondCapsule;
    expect(second).toEqual(first);
    expect(Buffer.from(`${canonicalJson(second)}\n`, "utf8")).toEqual(
      Buffer.from(`${canonicalJson(first)}\n`, "utf8"),
    );
    expect(first.capsuleIdentity).toMatch(/^[0-9A-F]{64}$/u);

    const recovered = fixture.recovered;
    expect(recovered).toMatchObject({
      status: "PASS",
      current: true,
      activeRootIdentity: active.constructed.rootIdentity,
      nextAction: "Continue the exact governed CIC task.",
      forbiddenActions: FORBIDDEN_ACTIONS,
      authorityGrants: [],
    });
    expect(recovered.currentControl.role).toBe("CURRENT_CONTROL");
    expect(recovered.sessionWorkstream.role).toBe("SESSION_WORKSTREAM");
  });

  it("preserves a BLOCKED bootstrap instead of laundering it into PASS", async () => {
    const fixture = fixtureFor("blocked");
    const blockedBootstrap = fixture.bootstrap;
    const capsule = fixture.capsule;
    const recovered = fixture.recovered;
    expect(capsule.bootstrap.disposition).toBe("BLOCKED");
    expect(recovered).toMatchObject({
      status: "BLOCKED",
      bootstrapDisposition: "BLOCKED",
      nextAction: blockedBootstrap.nextAction,
      authorityGrants: [],
    });
  });

  it("fails closed when required evidence is missing or corrupt", async () => {
    const fixture = fixtureFor("primary");
    const evidence = fixture.evidence;
    const capsule = fixture.capsule;

    await unlink(evidence.filePath);
    await expect(
      verifyRecoveryCapsule(capsule, { evidenceRoot: evidence.evidenceRoot }),
    ).rejects.toMatchObject({ code: "REQUIRED_OBJECT_UNAVAILABLE" });

    await writeEvidence(evidence.evidenceRoot, evidence.relativePath, Buffer.from("corrupt\n"));
    await expect(
      verifyRecoveryCapsule(capsule, { evidenceRoot: evidence.evidenceRoot }),
    ).rejects.toMatchObject({ code: "REQUIRED_OBJECT_UNAVAILABLE" });
    await writeEvidence(evidence.evidenceRoot, evidence.relativePath, evidence.bytes);
  });

  it("preserves semantic capsule identity when identical evidence relocates", async () => {
    const fixture = fixtureFor("primary");
    const original = fixture.evidence;
    const capsule = fixture.capsule;

    const relocatedRoot = path.join(temporary, "relocated-evidence-root");
    await mkdir(relocatedRoot, { recursive: true });
    await writeEvidence(relocatedRoot, original.relativePath, original.bytes);
    const verified = await verifyRecoveryCapsule(capsule, { evidenceRoot: relocatedRoot });
    expect(verified.capsule.capsuleIdentity).toBe(capsule.capsuleIdentity);
  });

  it("keeps large, binary, media, and build evidence pointer-only", () => {
    const capsule = recoveryProof.pointerOnlyCapsule;
    expect(capsule.embeddedMaterials).toEqual([]);
    for (const classification of ["LARGE", "BINARY", "MEDIA", "BUILD"]) {
      const pointer = capsule.acceptedEvidencePointers.find(
        (entry) => entry.classification === classification,
      );
      expect(pointer).toBeDefined();
      expect(pointer).not.toHaveProperty("content");
      expect(pointer).not.toHaveProperty("text");
    }

    expect(recoveryProof.oversizedEmbedError).toMatchObject({ code: "PROGRESSION_ROOT_INVALID" });
    expect(recoveryProof.binaryEmbedError).toMatchObject({ code: "PROGRESSION_ROOT_INVALID" });
  });

  it("rejects recursive raw chat and history fields as authority input", async () => {
    const fixture = fixtureFor("primary");
    const evidence = fixture.evidence;
    await expect(
      createRecoveryCapsule(
        capsuleInput(fixture, evidence, {
          extension: { nested: { priorChatHistory: [{ role: "user", content: "continue" }] } },
        }),
      ),
    ).rejects.toMatchObject({ code: "PROGRESSION_ROOT_INVALID" });
  });

  it.each([
    ["duplicate", "collision/same.txt", "collision/same.txt"],
    ["case", "collision/File.txt", "collision/file.txt"],
    ["Unicode case", "collision/Ä.txt", "collision/ä.txt"],
  ])("rejects %s governed-locator collisions", (label) => {
    expect(recoveryProof.collisionErrors[label]).toMatchObject({
      code: "CONTEXT_IDENTITY_COLLISION",
    });
  });

  it("rejects a capsule after an exact successor becomes active", () => {
    expect(recoveryProof.staleRootError).toMatchObject({ code: "PROGRESSION_RECOVERY_STALE" });
  });

  it("fails recovery closed after physical repository currentness moves", () => {
    expect(recoveryProof.movementError).toMatchObject({ code: "PROGRESSION_RECOVERY_STALE" });
  });

  it("rejects recovery under revoked authority and never grants mutation actions", () => {
    const fixture = fixtureFor("blocked");
    const capsule = fixture.capsule;
    expect(capsule.authorityGrants).toEqual([]);
    expect(capsule).not.toHaveProperty("actions");
    expect(recoveryProof.revokedError).toMatchObject({ code: "PROGRESSION_AUTHORITY_INVALID" });
  });

  it("fails recovery closed when the active root moves between authenticated START and END", () => {
    expect(recoveryProof.recoveryRootRaceBarrierCalls).toBe(1);
    expect(recoveryProof.inFlightRootError).toMatchObject({
      code: "PROGRESSION_RECOVERY_STALE",
    });
  });

  it("fails recovery closed when authorization is revoked between authenticated START and END", () => {
    expect(recoveryProof.recoveryRevocationRaceBarrierCalls).toBe(1);
    expect(recoveryProof.inFlightRevocationError).toMatchObject({
      code: "PROGRESSION_AUTHORITY_INVALID",
    });
  });

  it("fails capsule construction closed when progression moves during evidence verification", () => {
    expect(recoveryProof.capsuleCreationRaceBarrierCalls).toBe(1);
    expect(recoveryProof.inFlightCapsuleCreationError).toMatchObject({
      code: "PROGRESSION_RECOVERY_STALE",
    });
  });
});
