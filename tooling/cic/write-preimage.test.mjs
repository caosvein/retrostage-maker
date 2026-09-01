import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  open,
  readFile,
  realpath,
  rename,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify, TextEncoder } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { observeCurrentTruth } from "./lib/current-truth.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  I4_ACTION_FLAGS,
  acquireMutationLease,
  admitAuthorization,
  defineOwnerDecision,
  defineTaskContract,
  recordOwnerDecision,
  recordTaskContract,
  revokeAuthorization,
  verifyCurrentTruthFact,
} from "./lib/task-authorization.mjs";
import { inspectStateDomainCandidate, recordStateDomainBinding } from "./lib/state-domain.mjs";
import {
  acceptSealedPostimage,
  intendedPostimageFromBytes,
  sealWritePreimage,
} from "./lib/write-preimage.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const hash = (value) => sha256Hex(`i4-preimage-test:${value}`);
const runFile = promisify(execFile);
const GIT_EXECUTABLE = path.join(process.env.ProgramFiles, "Git", "cmd", "git.exe");
const semanticOwners = ["semantic-owner-write"];

function contextIntent() {
  return {
    reviewed: true,
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      materialIdentities: [],
      reason: `Reviewed preimage contract excludes ${dimension}`,
    })),
  };
}
let fixture;
let serializationHandle;
const SERIALIZATION_LOCK = path.join(tmpdir(), `cic-i4-tests-${process.ppid}.lock`);

async function acquireSerializationLock() {
  for (let attempt = 0; attempt < 4_000; attempt += 1) {
    try {
      serializationHandle = await open(SERIALIZATION_LOCK, "wx");
      return;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      await delay(250);
    }
  }
  throw new Error("CIC_I4_TEST_SERIALIZATION_TIMEOUT");
}

await acquireSerializationLock();

function currentTruthRequest() {
  return { materials: [] };
}

async function currentTruth() {
  return observeCurrentTruth({
    ...fixture.domainInput,
    ...currentTruthRequest(),
    taskContractIdentity: fixture.task.taskContractIdentity,
    authorityIdentity: fixture.authorityIdentity,
  });
}

beforeAll(async () => {
  const temporaryAlias = await mkdtemp(path.join(tmpdir(), "cic-i4-preimage-"));
  const temporary = await realpath(temporaryAlias);
  const worktreeRoot = path.join(temporary, "worktree");
  const stateRoot = path.join(temporary, "state");
  await runFile(
    GIT_EXECUTABLE,
    ["clone", "--local", "--no-hardlinks", REPOSITORY_ROOT, worktreeRoot],
    { windowsHide: true },
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
  await mkdir(path.join(worktreeRoot, "folder"));
  await mkdir(stateRoot, { recursive: true });
  const portableWorktreeIdentity = hash("worktree");
  const authorityIdentity = hash("authority");
  const task = defineTaskContract({
    taskIdentity: hash("stable-task"),
    taskName: "i4-write-preimage",
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    scope: ["alpha.txt", "beta.txt", "folder", "gamma.txt"],
    owners: ["writer"],
    semanticOwners,
    contextIntent: contextIntent(),
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
  fixture = {
    temporary,
    worktreeRoot,
    stateRoot,
    portableWorktreeIdentity,
    authorityIdentity,
    task,
    domainInput,
    domain,
  };
  const truth = await currentTruth();
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
    scope: task.scope,
    owners: task.owners,
    semanticOwners: task.semanticOwners,
    reasonClassification: "preimage-admission",
    reviewedEvidenceIdentities: [hash("evidence")],
    expectedAuthorizationHeadIdentity: null,
    expectedHeadState: null,
    expectedHeadGeneration: 0,
    expectedCurrentAuthorizationIdentity: null,
  });
  await recordOwnerDecision(domainInput, { ...decision });
  fixture.authorization = await admitAuthorization({
    domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest: currentTruthRequest(),
  });
  fixture.admissionFact = verifyCurrentTruthFact(fixture.authorization.authorization.admissionFact);
  fixture.lease = await acquireMutationLease({
    domainInput,
    authorizationIdentity: fixture.authorization.authorization.authorizationIdentity,
    currentTruthRequest: currentTruthRequest(),
    scope: task.scope,
    semanticOwners: task.semanticOwners,
    owner: "writer",
    expectedRegistryIdentity: null,
  });
}, 900_000);

afterAll(async () => {
  if (serializationHandle) {
    await serializationHandle.close();
    await unlink(SERIALIZATION_LOCK);
  }
});

function operationInput(overrides) {
  return {
    domainInput: fixture.domainInput,
    authorizationIdentity: fixture.authorization.authorization.authorizationIdentity,
    currentTruthRequest: currentTruthRequest(),
    leaseIdentity: fixture.lease.lease.leaseIdentity,
    semanticOwners: fixture.task.semanticOwners,
    ...overrides,
  };
}

async function governCreate(targetPath, bytes) {
  const sealed = await sealWritePreimage(
    operationInput({
      operation: "CREATE",
      targetPath,
      intendedPostimage: intendedPostimageFromBytes(bytes),
    }),
  );
  await writeFile(path.join(fixture.worktreeRoot, targetPath), bytes);
  return acceptSealedPostimage(
    operationInput({ writePreimageIdentity: sealed.seal.writePreimageIdentity }),
  );
}

describe.sequential("CIC-I4 immediate physical write-preimage seals", () => {
  it("blocks physical material and repository-snapshot movement between generation phases", async () => {
    const materialPath = path.join(fixture.worktreeRoot, "moving-material.txt");
    await writeFile(materialPath, "generation-start\n");
    const movement = runFile(
      process.execPath,
      [
        "-e",
        "setTimeout(() => require('node:fs').writeFileSync(process.argv[1], 'generation-end\\n'), 3000)",
        materialPath,
      ],
      { windowsHide: true },
    );
    try {
      await expect(
        observeCurrentTruth({
          ...fixture.domainInput,
          taskContractIdentity: fixture.task.taskContractIdentity,
          authorityIdentity: fixture.authorityIdentity,
          materials: [{ id: "moving-material", path: "moving-material.txt" }],
        }),
      ).rejects.toMatchObject({ code: "CONTEXT_GENERATION_RACE" });
      await movement;
    } finally {
      await movement;
      await unlink(materialPath);
    }
  }, 30_000);

  it("requires fresh current truth before sealing governed write authority", async () => {
    await expect(
      sealWritePreimage(
        operationInput({
          currentTruthRequest: undefined,
          operation: "CREATE",
          targetPath: "gamma.txt",
          intendedPostimage: intendedPostimageFromBytes(
            new TextEncoder().encode("missing-current-truth\n"),
          ),
        }),
      ),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_STALE" });
  });

  it("seals and accepts an exact CREATE without writing worktree content itself", async () => {
    const bytes = new TextEncoder().encode("alpha-v1\n");
    const sealed = await sealWritePreimage(
      operationInput({
        operation: "CREATE",
        targetPath: "alpha.txt",
        intendedPostimage: intendedPostimageFromBytes(bytes),
      }),
    );
    expect(sealed.seal.targetPreimage.state).toBe("ABSENT_PROVEN");
    expect(sealed.seal).not.toHaveProperty("repositoryRoot");
    await writeFile(path.join(fixture.worktreeRoot, "alpha.txt"), bytes);
    const accepted = await acceptSealedPostimage(
      operationInput({ writePreimageIdentity: sealed.seal.writePreimageIdentity }),
    );
    expect(accepted.successor.content.sequence).toBe(1);
    const successorFact = verifyCurrentTruthFact(accepted.successor.content.generationFact);
    expect(successorFact.currentTruthFactIdentity).toBe(
      accepted.successor.record.generationFactIdentity,
    );
    expect(successorFact.repositorySnapshotIdentity).not.toBe(
      fixture.admissionFact.repositorySnapshotIdentity,
    );
    expect(verifyCurrentTruthFact(fixture.authorization.authorization.admissionFact)).toEqual(
      fixture.admissionFact,
    );
  }, 30_000);

  it("seals and accepts exact MODIFY and DELETE operations in sequence", async () => {
    const modifiedBytes = new TextEncoder().encode("alpha-v2\n");
    const modify = await sealWritePreimage(
      operationInput({
        operation: "MODIFY",
        targetPath: "alpha.txt",
        intendedPostimage: intendedPostimageFromBytes(modifiedBytes),
      }),
    );
    expect(modify.seal.targetPreimage.state).toBe("PRESENT");
    await writeFile(path.join(fixture.worktreeRoot, "alpha.txt"), modifiedBytes);
    const modified = await acceptSealedPostimage(
      operationInput({ writePreimageIdentity: modify.seal.writePreimageIdentity }),
    );
    expect(modified.successor.content.sequence).toBe(2);

    const remove = await sealWritePreimage(
      operationInput({ operation: "DELETE", targetPath: "alpha.txt", intendedPostimage: null }),
    );
    await unlink(path.join(fixture.worktreeRoot, "alpha.txt"));
    const removed = await acceptSealedPostimage(
      operationInput({ writePreimageIdentity: remove.seal.writePreimageIdentity }),
    );
    expect(removed.successor.content.sequence).toBe(3);
  }, 60_000);

  it("binds RENAME source-present and destination-absent as one intent", async () => {
    const bytes = new TextEncoder().encode("rename-me\n");
    await governCreate("alpha.txt", bytes);
    const renameSeal = await sealWritePreimage(
      operationInput({
        operation: "RENAME",
        sourcePath: "alpha.txt",
        targetPath: "beta.txt",
        intendedPostimage: intendedPostimageFromBytes(bytes),
      }),
    );
    await rename(
      path.join(fixture.worktreeRoot, "alpha.txt"),
      path.join(fixture.worktreeRoot, "beta.txt"),
    );
    const accepted = await acceptSealedPostimage(
      operationInput({ writePreimageIdentity: renameSeal.seal.writePreimageIdentity }),
    );
    expect(accepted.seal.sourcePath).toBe("alpha.txt");
    expect(accepted.postimage.sha256).toBe(renameSeal.seal.intendedPostimage.sha256);
  }, 60_000);

  it("blocks non-regular targets, path escapes, and mismatched rename identities", async () => {
    await expect(
      sealWritePreimage(
        operationInput({ operation: "DELETE", targetPath: "folder", intendedPostimage: null }),
      ),
    ).rejects.toMatchObject({ code: "WRITE_PREIMAGE_MISMATCH" });
    await expect(
      sealWritePreimage(
        operationInput({
          operation: "CREATE",
          targetPath: "../escape",
          intendedPostimage: intendedPostimageFromBytes(new Uint8Array()),
        }),
      ),
    ).rejects.toMatchObject({ code: "WRITE_PREIMAGE_MISMATCH" });
    await expect(
      sealWritePreimage(
        operationInput({
          operation: "RENAME",
          sourcePath: "beta.txt",
          targetPath: "gamma.txt",
          intendedPostimage: intendedPostimageFromBytes(new TextEncoder().encode("wrong\n")),
        }),
      ),
    ).rejects.toMatchObject({ code: "WRITE_PREIMAGE_MISMATCH" });
  }, 30_000);

  it("rejects a postimage whose bytes differ from the sealed intent", async () => {
    const intended = new TextEncoder().encode("intended\n");
    const sealed = await sealWritePreimage(
      operationInput({
        operation: "CREATE",
        targetPath: "gamma.txt",
        intendedPostimage: intendedPostimageFromBytes(intended),
      }),
    );
    await writeFile(path.join(fixture.worktreeRoot, "gamma.txt"), "different\n");
    await expect(
      acceptSealedPostimage(
        operationInput({ writePreimageIdentity: sealed.seal.writePreimageIdentity }),
      ),
    ).rejects.toMatchObject({ code: "WRITE_PREIMAGE_MISMATCH" });
    await unlink(path.join(fixture.worktreeRoot, "gamma.txt"));
  }, 30_000);

  it("cannot redirect physical preimage observation or add an unadmitted semantic owner", async () => {
    const alternateRoot = path.join(fixture.temporary, "alternate-worktree");
    await mkdir(alternateRoot);
    await writeFile(path.join(alternateRoot, "gamma.txt"), "redirected\n");
    const intended = new TextEncoder().encode("bound-root\n");
    const redirected = await sealWritePreimage(
      operationInput({
        currentTruthRequest: { ...currentTruthRequest(), worktreeRoot: alternateRoot },
        operation: "CREATE",
        targetPath: "gamma.txt",
        intendedPostimage: intendedPostimageFromBytes(intended),
      }),
    );
    expect(redirected.seal.targetPreimage.state).toBe("ABSENT_PROVEN");
    expect(redirected.seal.localWorktreeBindingIdentity).toBe(
      fixture.domain.localWorktreeBindingIdentity,
    );
    await expect(
      sealWritePreimage(
        operationInput({
          semanticOwners: ["unadmitted-semantic-owner"],
          operation: "CREATE",
          targetPath: "gamma.txt",
          intendedPostimage: intendedPostimageFromBytes(intended),
        }),
      ),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_SCOPE_MISMATCH" });
  }, 30_000);

  it("recomputes a durable write-preimage seal before consuming governed path or postimage fields", async () => {
    const intended = new TextEncoder().encode("self-hash-bound\n");
    const sealed = await sealWritePreimage(
      operationInput({
        operation: "CREATE",
        targetPath: "gamma.txt",
        intendedPostimage: intendedPostimageFromBytes(intended),
      }),
    );
    const sealPath = path.join(
      fixture.domain.taskStateRoot,
      "preimages",
      `${sealed.seal.writePreimageIdentity}.json`,
    );
    const checkpointPath = path.join(fixture.domain.taskStateRoot, "checkpoints", "head.json");
    const sealBytes = await readFile(sealPath);
    const checkpointBytes = await readFile(checkpointPath);
    try {
      const record = JSON.parse(sealBytes.toString("utf8"));
      record.targetPath = "beta.txt";
      await writeFile(sealPath, `${canonicalJson(record)}\n`);
      await expect(
        acceptSealedPostimage(
          operationInput({ writePreimageIdentity: sealed.seal.writePreimageIdentity }),
        ),
      ).rejects.toMatchObject({ code: "WRITE_PREIMAGE_MISMATCH" });

      record.targetPath = "gamma.txt";
      record.intendedPostimage.sha256 = hash("forged-postimage");
      await writeFile(sealPath, `${canonicalJson(record)}\n`);
      await expect(
        acceptSealedPostimage(
          operationInput({ writePreimageIdentity: sealed.seal.writePreimageIdentity }),
        ),
      ).rejects.toMatchObject({ code: "WRITE_PREIMAGE_MISMATCH" });
    } finally {
      await writeFile(sealPath, sealBytes);
    }
    expect(await readFile(checkpointPath)).toEqual(checkpointBytes);
  }, 60_000);

  it("makes a seal unusable immediately after reviewed revocation", async () => {
    const intended = new TextEncoder().encode("never-authorized\n");
    const sealed = await sealWritePreimage(
      operationInput({
        operation: "CREATE",
        targetPath: "gamma.txt",
        intendedPostimage: intendedPostimageFromBytes(intended),
      }),
    );
    const truth = await currentTruth();
    const decision = defineOwnerDecision({
      decisionKind: "REVOKE",
      taskIdentity: fixture.task.taskIdentity,
      taskContractIdentity: fixture.task.taskContractIdentity,
      repositoryIdentity: REPOSITORY_IDENTITY,
      portableWorktreeIdentity: fixture.portableWorktreeIdentity,
      portableStateDomainIdentity: fixture.domain.portableStateDomainIdentity,
      localStateStoreBindingIdentity: fixture.domain.localStateStoreBindingIdentity,
      localWorktreeBindingIdentity: fixture.domain.localWorktreeBindingIdentity,
      contextIntentIdentity: fixture.task.contextIntent.contextIntentIdentity,
      authorityIdentity: fixture.authorityIdentity,
      currentTruthIdentity: truth.currentTruthIdentity,
      actions: fixture.authorization.authorization.actions,
      scope: fixture.authorization.authorization.scope,
      owners: fixture.authorization.authorization.owners,
      semanticOwners: fixture.authorization.authorization.semanticOwners,
      reasonClassification: "preimage-revocation",
      reviewedEvidenceIdentities: [hash("revoke-evidence")],
      expectedAuthorizationHeadIdentity: fixture.authorization.head.authorizationHeadIdentity,
      expectedHeadState: "ACTIVE",
      expectedHeadGeneration: fixture.authorization.head.generation,
      expectedCurrentAuthorizationIdentity:
        fixture.authorization.authorization.authorizationIdentity,
    });
    await recordOwnerDecision(fixture.domainInput, { ...decision });
    await revokeAuthorization({
      domainInput: fixture.domainInput,
      ownerDecisionIdentity: decision.ownerDecisionIdentity,
      currentTruthRequest: currentTruthRequest(),
    });
    await expect(
      acceptSealedPostimage(
        operationInput({ writePreimageIdentity: sealed.seal.writePreimageIdentity }),
      ),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_REVOKED" });
  }, 30_000);
});
