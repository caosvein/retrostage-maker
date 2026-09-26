import { Buffer } from "node:buffer";
import { execFile } from "node:child_process";
import {
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  realpath,
  unlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  createMirrorCurrentnessReport,
  observeCurrentTruth,
  verifyMirrorCurrentnessReport,
} from "./lib/current-truth.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  I4_ACTION_FLAGS,
  acceptSuccessorCheckpoint,
  acquireMutationLease,
  admitAuthorization,
  defineOwnerDecision,
  defineTaskContract,
  effectiveCheckpoint,
  recordOwnerDecision,
  recordTaskContract,
  releaseMutationLease,
  revokeAuthorization,
  verifyAuthorization,
  verifyCurrentTruthFact,
  verifyMutationLease,
} from "./lib/task-authorization.mjs";
import {
  inspectStateDomainCandidate,
  recordStateDomainBinding,
  semanticIdentity,
} from "./lib/state-domain.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const hash = (value) => sha256Hex(`i4-task-test:${value}`);
const runFile = promisify(execFile);
const GIT_EXECUTABLE = path.join(process.env.ProgramFiles, "Git", "cmd", "git.exe");
const semanticOwners = ["semantic-owner-a"];

function contextIntent(label = "task-lifecycle") {
  return {
    reviewed: true,
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      materialIdentities: [],
      reason: `Reviewed ${label} contract excludes ${dimension}`,
    })),
  };
}

let fixture;
let serializationHandle;
const SERIALIZATION_LOCK = path.join(tmpdir(), `cic-i4-tests-${process.ppid}.lock`);

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
  throw new Error("CIC_I4_TEST_SERIALIZATION_TIMEOUT");
}

await acquireSerializationLock();

function truthRequest(_current) {
  return {
    materials: [],
  };
}

async function authorize(current, expectation, reason) {
  const truth = await observeCurrentTruth({
    ...current.domainInput,
    taskContractIdentity: current.task.taskContractIdentity,
    authorityIdentity: current.authorityIdentity,
    materials: [],
  });
  const decision = defineOwnerDecision({
    decisionKind: "AUTHORIZE",
    taskIdentity: current.task.taskIdentity,
    taskContractIdentity: current.task.taskContractIdentity,
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity: current.portableWorktreeIdentity,
    portableStateDomainIdentity: current.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: current.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: current.domain.localWorktreeBindingIdentity,
    contextIntentIdentity: current.task.contextIntent.contextIntentIdentity,
    authorityIdentity: current.authorityIdentity,
    currentTruthIdentity: truth.currentTruthIdentity,
    actions: I4_ACTION_FLAGS,
    scope: current.task.scope,
    owners: current.task.owners,
    semanticOwners: current.task.semanticOwners,
    reasonClassification: reason,
    reviewedEvidenceIdentities: [hash(`evidence-${reason}`)],
    ...expectation,
  });
  await recordOwnerDecision(current.domainInput, { ...decision });
  return admitAuthorization({
    domainInput: current.domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest: truthRequest(current),
  });
}

async function revoke(current, authorization, reason) {
  const truth = await observeCurrentTruth({
    ...current.domainInput,
    taskContractIdentity: current.task.taskContractIdentity,
    authorityIdentity: current.authorityIdentity,
    materials: [],
  });
  const decision = defineOwnerDecision({
    decisionKind: "REVOKE",
    taskIdentity: current.task.taskIdentity,
    taskContractIdentity: current.task.taskContractIdentity,
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity: current.portableWorktreeIdentity,
    portableStateDomainIdentity: current.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: current.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: current.domain.localWorktreeBindingIdentity,
    contextIntentIdentity: current.task.contextIntent.contextIntentIdentity,
    authorityIdentity: current.authorityIdentity,
    currentTruthIdentity: truth.currentTruthIdentity,
    actions: authorization.authorization.actions,
    scope: authorization.authorization.scope,
    owners: authorization.authorization.owners,
    semanticOwners: authorization.authorization.semanticOwners,
    reasonClassification: reason,
    reviewedEvidenceIdentities: [hash(`evidence-${reason}`)],
    expectedAuthorizationHeadIdentity: authorization.head.authorizationHeadIdentity,
    expectedHeadState: "ACTIVE",
    expectedHeadGeneration: authorization.head.generation,
    expectedCurrentAuthorizationIdentity: authorization.authorization.authorizationIdentity,
  });
  await recordOwnerDecision(current.domainInput, { ...decision });
  return revokeAuthorization({
    domainInput: current.domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest: truthRequest(current),
  });
}

beforeAll(async () => {
  const temporaryAlias = await mkdtemp(path.join(tmpdir(), "cic-i4-task-"));
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
  const physicalHeadCommit = (
    await runFile(GIT_EXECUTABLE, ["-C", worktreeRoot, "rev-parse", "--verify", "HEAD"], {
      windowsHide: true,
    })
  ).stdout.trim();
  const physicalHeadTree = (
    await runFile(GIT_EXECUTABLE, ["-C", worktreeRoot, "rev-parse", "--verify", "HEAD^{tree}"], {
      windowsHide: true,
    })
  ).stdout.trim();
  await mkdir(stateRoot, { recursive: true });
  const portableWorktreeIdentity = hash("worktree");
  const authorityIdentity = hash("owner-authority");
  const task = defineTaskContract({
    taskIdentity: hash("stable-task"),
    taskName: "i4-task-lifecycle",
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    scope: ["alpha.txt", "beta.txt"],
    owners: ["owner-a"],
    semanticOwners,
    contextIntent: contextIntent(),
  });
  const candidate = await inspectStateDomainCandidate({
    repositoryRoot: worktreeRoot,
    worktreeRoot,
    stateRoot,
    repositoryIdentity: REPOSITORY_IDENTITY,
    taskIdentity: task.taskIdentity,
    portableWorktreeIdentity,
  });
  const domainInput = {
    repositoryRoot: worktreeRoot,
    worktreeRoot,
    stateRoot,
    repositoryIdentity: REPOSITORY_IDENTITY,
    taskIdentity: task.taskIdentity,
    portableWorktreeIdentity,
  };
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
    physicalHeadCommit,
    physicalHeadTree,
    authorityIdentity,
    task,
    domainInput,
    domain,
  };
}, 900_000);

afterAll(async () => {
  if (serializationHandle) {
    await serializationHandle.close();
    await unlink(SERIALIZATION_LOCK);
  }
});

describe.sequential("CIC-I4 task authorization, checkpoint, and lease lifecycle", () => {
  it("admits an initial authorization only through null-head CAS after durable sequence-0 bootstrap", async () => {
    fixture.current = await authorize(
      fixture,
      {
        expectedAuthorizationHeadIdentity: null,
        expectedHeadState: null,
        expectedHeadGeneration: 0,
        expectedCurrentAuthorizationIdentity: null,
      },
      "initial-admission",
    );
    expect(fixture.current.head).toMatchObject({ state: "ACTIVE", generation: 1 });
    const verified = await verifyAuthorization({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
    });
    const checkpoint = await effectiveCheckpoint(verified);
    expect(checkpoint.source).toBe("AUTHORIZED_ROOT");
    expect(checkpoint.record.authorizationHeadIdentity).toBe(
      fixture.current.head.authorizationHeadIdentity,
    );
    const admissionFact = verifyCurrentTruthFact(fixture.current.authorization.admissionFact);
    expect(admissionFact.currentTruthFactIdentity).toBe(
      fixture.current.authorization.admissionFactIdentity,
    );
    expect(admissionFact).toMatchObject({
      sourceGenerationFingerprint:
        "F3CA72E7F199DAC701270E7E9611AE10921685579F9AF38D5060F1920BDCCBAB",
      repositoryIdentity: REPOSITORY_IDENTITY,
      repositoryHeadCommit: fixture.physicalHeadCommit,
      repositoryHeadTree: fixture.physicalHeadTree,
      portableWorktreeIdentity: fixture.portableWorktreeIdentity,
      localWorktreeBindingIdentity: fixture.domain.localWorktreeBindingIdentity,
      portableStateDomainIdentity: fixture.domain.portableStateDomainIdentity,
      localStateStoreBindingIdentity: fixture.domain.localStateStoreBindingIdentity,
      capabilityStatus: "PASS",
      taskContractIdentity: fixture.task.taskContractIdentity,
      contextIntentIdentity: fixture.task.contextIntent.contextIntentIdentity,
      authorizedPathSet: fixture.task.scope,
      authorizedSemanticOwnerSet: fixture.task.semanticOwners,
    });
    expect(fixture.current.checkpointContent.generationFactIdentity).toBe(
      admissionFact.currentTruthFactIdentity,
    );
    expect(
      verifyCurrentTruthFact(fixture.current.checkpointContent.generationFact)
        .currentTruthFactIdentity,
    ).toBe(admissionFact.currentTruthFactIdentity);
    fixture.initialAdmissionFact = admissionFact;
  }, 90_000);

  it("requires fresh current truth for public verification and lease authority", async () => {
    const authorizationIdentity = fixture.current.authorization.authorizationIdentity;
    await expect(
      verifyAuthorization({
        domainInput: fixture.domainInput,
        authorizationIdentity,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_STALE" });
    await expect(
      acquireMutationLease({
        domainInput: fixture.domainInput,
        authorizationIdentity,
        scope: fixture.task.scope,
        semanticOwners: fixture.task.semanticOwners,
        owner: "owner-a",
        expectedRegistryIdentity: null,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_STALE" });

    const driftPath = path.join(fixture.worktreeRoot, "fresh-truth-drift.txt");
    await writeFile(driftPath, "physical drift\n");
    try {
      await expect(
        acquireMutationLease({
          domainInput: fixture.domainInput,
          authorizationIdentity,
          currentTruthRequest: truthRequest(fixture),
          scope: fixture.task.scope,
          semanticOwners: fixture.task.semanticOwners,
          owner: "owner-a",
          expectedRegistryIdentity: null,
        }),
      ).rejects.toMatchObject({ code: "AUTHORIZATION_STALE" });
    } finally {
      await unlink(driftPath);
    }
  }, 90_000);

  it("recomputes durable task-contract and owner-decision identities before authority use", async () => {
    const taskPath = path.join(
      fixture.domain.taskStateRoot,
      "task-contracts",
      `${fixture.task.taskContractIdentity}.json`,
    );
    const decisionPath = path.join(
      fixture.domain.taskStateRoot,
      "owner-decisions",
      `${fixture.current.authorization.ownerDecisionIdentity}.json`,
    );
    const taskBytes = await readFile(taskPath);
    const decisionBytes = await readFile(decisionPath);
    const checkpointBefore = await readdir(path.join(fixture.domain.taskStateRoot, "checkpoints"));
    const verify = () =>
      verifyAuthorization({
        domainInput: fixture.domainInput,
        authorizationIdentity: fixture.current.authorization.authorizationIdentity,
        currentTruthRequest: truthRequest(fixture),
      });
    try {
      const task = JSON.parse(taskBytes.toString("utf8"));
      task.scope = ["beta.txt"];
      await writeFile(taskPath, `${canonicalJson(task)}\n`);
      await expect(verify()).rejects.toMatchObject({ code: "AUTHORIZATION_INVALID" });
      await writeFile(taskPath, taskBytes);

      const decision = JSON.parse(decisionBytes.toString("utf8"));
      decision.actions = decision.actions.filter((action) => action !== "VERIFY");
      await writeFile(decisionPath, `${canonicalJson(decision)}\n`);
      await expect(verify()).rejects.toMatchObject({
        code: "AUTHORIZATION_OWNER_DECISION_INVALID",
      });
    } finally {
      await writeFile(taskPath, taskBytes);
      await writeFile(decisionPath, decisionBytes);
    }
    expect(await readdir(path.join(fixture.domain.taskStateRoot, "checkpoints"))).toEqual(
      checkpointBefore,
    );
  }, 90_000);

  it("rejects a losing null-head admission and leaves any immutable orphan non-authoritative", async () => {
    await expect(
      authorize(
        fixture,
        {
          expectedAuthorizationHeadIdentity: null,
          expectedHeadState: null,
          expectedHeadGeneration: 0,
          expectedCurrentAuthorizationIdentity: null,
        },
        "losing-null-head",
      ),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_CAS_CONFLICT" });
    const records = await readdir(
      path.join(fixture.domain.taskStateRoot, "authorization", "records"),
    );
    expect(records.length).toBe(2);
  }, 30_000);

  it("rejects an owner decision bound to the wrong task-contract generation", async () => {
    const decision = defineOwnerDecision({
      decisionKind: "AUTHORIZE",
      taskIdentity: fixture.task.taskIdentity,
      taskContractIdentity: hash("wrong-contract-generation"),
      repositoryIdentity: REPOSITORY_IDENTITY,
      portableWorktreeIdentity: fixture.portableWorktreeIdentity,
      portableStateDomainIdentity: fixture.domain.portableStateDomainIdentity,
      localStateStoreBindingIdentity: fixture.domain.localStateStoreBindingIdentity,
      localWorktreeBindingIdentity: fixture.domain.localWorktreeBindingIdentity,
      contextIntentIdentity: fixture.task.contextIntent.contextIntentIdentity,
      authorityIdentity: fixture.authorityIdentity,
      currentTruthIdentity: fixture.current.currentTruth.currentTruthIdentity,
      actions: I4_ACTION_FLAGS,
      scope: fixture.task.scope,
      owners: fixture.task.owners,
      semanticOwners: fixture.task.semanticOwners,
      reasonClassification: "wrong-contract-generation",
      reviewedEvidenceIdentities: [hash("wrong-contract-evidence")],
      expectedAuthorizationHeadIdentity: fixture.current.head.authorizationHeadIdentity,
      expectedHeadState: "ACTIVE",
      expectedHeadGeneration: fixture.current.head.generation,
      expectedCurrentAuthorizationIdentity: fixture.current.authorization.authorizationIdentity,
    });
    await expect(recordOwnerDecision(fixture.domainInput, decision)).rejects.toMatchObject({
      code: "AUTHORIZATION_OWNER_DECISION_INVALID",
    });
  });

  it("gives current-epoch lease contenders one winner and preserves same-epoch overlap", async () => {
    fixture.lease = await acquireMutationLease({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
      scope: ["alpha.txt"],
      semanticOwners,
      owner: "owner-a",
      expectedRegistryIdentity: null,
    });
    await expect(
      acquireMutationLease({
        domainInput: fixture.domainInput,
        authorizationIdentity: fixture.current.authorization.authorizationIdentity,
        currentTruthRequest: truthRequest(fixture),
        scope: ["beta.txt"],
        semanticOwners,
        owner: "owner-a",
        expectedRegistryIdentity: fixture.lease.registryIdentity,
      }),
    ).rejects.toMatchObject({ code: "MUTATION_LEASE_CONFLICT" });
    await expect(
      acquireMutationLease({
        domainInput: fixture.domainInput,
        authorizationIdentity: fixture.current.authorization.authorizationIdentity,
        currentTruthRequest: truthRequest(fixture),
        scope: ["beta.txt"],
        semanticOwners: ["unadmitted-semantic-owner"],
        owner: "owner-a",
        expectedRegistryIdentity: fixture.lease.registryIdentity,
      }),
    ).rejects.toMatchObject({ code: "CONTEXT_EXPANSION_REQUIRED" });
    const staleExpectation = acquireMutationLease({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
      scope: ["alpha.txt"],
      semanticOwners,
      owner: "owner-a",
      expectedRegistryIdentity: null,
    });
    await expect(staleExpectation).rejects.toMatchObject({ code: "MUTATION_LEASE_CAS_CONFLICT" });
  }, 90_000);

  it("never steals a stale-looking lease lock", async () => {
    const lock = path.join(fixture.domain.taskStateRoot, "leases", "registry.lock");
    await writeFile(lock, "stale-looking\n", { flag: "wx" });
    try {
      await expect(
        acquireMutationLease({
          domainInput: fixture.domainInput,
          authorizationIdentity: fixture.current.authorization.authorizationIdentity,
          currentTruthRequest: truthRequest(fixture),
          scope: ["alpha.txt"],
          semanticOwners,
          owner: "owner-a",
          expectedRegistryIdentity: fixture.lease.registryIdentity,
        }),
      ).rejects.toMatchObject({ code: "MUTATION_LEASE_CAS_CONFLICT" });
    } finally {
      await unlink(lock);
    }
  }, 30_000);

  it("recomputes mutation-lease identity before consuming scope or semantic-owner authority", async () => {
    const leasePath = path.join(
      fixture.domain.taskStateRoot,
      "leases",
      "records",
      `${fixture.lease.lease.leaseIdentity}.json`,
    );
    const registryPath = path.join(fixture.domain.taskStateRoot, "leases", "registry.json");
    const leaseBytes = await readFile(leasePath);
    const registryBytes = await readFile(registryPath);
    const verified = await verifyAuthorization({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
    });
    try {
      const lease = JSON.parse(leaseBytes.toString("utf8"));
      lease.scope = ["beta.txt"];
      await writeFile(leasePath, `${canonicalJson(lease)}\n`);
      await expect(
        verifyMutationLease(
          verified,
          fixture.lease.lease.leaseIdentity,
          "beta.txt",
          semanticOwners,
        ),
      ).rejects.toMatchObject({ code: "MUTATION_LEASE_STALE" });

      lease.scope = ["alpha.txt"];
      lease.semanticOwners = ["forged-semantic-owner"];
      await writeFile(leasePath, `${canonicalJson(lease)}\n`);
      await expect(
        verifyMutationLease(
          verified,
          fixture.lease.lease.leaseIdentity,
          "alpha.txt",
          semanticOwners,
        ),
      ).rejects.toMatchObject({ code: "MUTATION_LEASE_STALE" });
    } finally {
      await writeFile(leasePath, leaseBytes);
    }
    expect(await readFile(registryPath)).toEqual(registryBytes);
  }, 30_000);

  it("advances two exact successors while distinguishing drift and context expansion", async () => {
    const base = {
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
      leaseIdentity: fixture.lease.lease.leaseIdentity,
    };
    fixture.successor1 = await acceptSuccessorCheckpoint({
      ...base,
      movement: {
        writePreimageIdentity: hash("seal-1"),
        postimageIdentity: hash("post-1"),
        changedPaths: ["alpha.txt"],
        semanticOwners,
        unexplained: false,
        contextExpansion: false,
      },
    });
    fixture.successor2 = await acceptSuccessorCheckpoint({
      ...base,
      movement: {
        writePreimageIdentity: hash("seal-2"),
        postimageIdentity: hash("post-2"),
        changedPaths: ["beta.txt"],
        semanticOwners,
        unexplained: false,
        contextExpansion: false,
      },
    });
    expect(fixture.successor2.content.sequence).toBe(fixture.successor1.content.sequence + 1);
    const successorFact = verifyCurrentTruthFact(fixture.successor2.content.generationFact);
    expect(successorFact.currentTruthFactIdentity).toBe(
      fixture.successor2.record.generationFactIdentity,
    );
    expect(successorFact).toMatchObject({
      taskContractIdentity: fixture.task.taskContractIdentity,
      authorizedPathSet: fixture.task.scope,
      authorizedSemanticOwnerSet: fixture.task.semanticOwners,
    });
    expect(verifyCurrentTruthFact(fixture.current.authorization.admissionFact)).toEqual(
      fixture.initialAdmissionFact,
    );
    await expect(
      acceptSuccessorCheckpoint({
        ...base,
        movement: {
          writePreimageIdentity: hash("seal-drift"),
          postimageIdentity: hash("post-drift"),
          changedPaths: ["outside.txt"],
          semanticOwners,
          unexplained: true,
          contextExpansion: false,
        },
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED_WORKTREE_DRIFT" });
    await expect(
      acceptSuccessorCheckpoint({
        ...base,
        movement: {
          writePreimageIdentity: hash("seal-expand"),
          postimageIdentity: hash("post-expand"),
          changedPaths: ["alpha.txt"],
          semanticOwners,
          unexplained: false,
          contextExpansion: true,
        },
      }),
    ).rejects.toMatchObject({ code: "CONTEXT_EXPANSION_REQUIRED" });
  }, 60_000);

  it("supersession makes the old checkpoint and lease stale while the new root wins", async () => {
    const previous = fixture.current;
    fixture.current = await authorize(
      fixture,
      {
        expectedAuthorizationHeadIdentity: previous.head.authorizationHeadIdentity,
        expectedHeadState: "ACTIVE",
        expectedHeadGeneration: previous.head.generation,
        expectedCurrentAuthorizationIdentity: previous.authorization.authorizationIdentity,
      },
      "active-supersession",
    );
    await expect(
      verifyAuthorization({
        domainInput: fixture.domainInput,
        authorizationIdentity: previous.authorization.authorizationIdentity,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_SUPERSEDED" });
    const verified = await verifyAuthorization({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
    });
    expect((await effectiveCheckpoint(verified)).source).toBe("AUTHORIZED_ROOT");
    await expect(
      verifyMutationLease(verified, fixture.lease.lease.leaseIdentity),
    ).rejects.toMatchObject({ code: "MUTATION_LEASE_STALE" });
  }, 30_000);

  it("replaces the stale lease registry without old-authority release and roots the first new checkpoint", async () => {
    fixture.newLease = await acquireMutationLease({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
      scope: ["alpha.txt", "beta.txt"],
      semanticOwners,
      owner: "owner-a",
      expectedRegistryIdentity: fixture.lease.registryIdentity,
    });
    const successor = await acceptSuccessorCheckpoint({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
      leaseIdentity: fixture.newLease.lease.leaseIdentity,
      movement: {
        writePreimageIdentity: hash("new-epoch-seal"),
        postimageIdentity: hash("new-epoch-post"),
        changedPaths: ["alpha.txt"],
        semanticOwners,
        unexplained: false,
        contextExpansion: false,
      },
    });
    expect(successor.content.sequence).toBe(1);
    expect(successor.content.predecessorCheckpointContentIdentity).toBe(
      fixture.current.authorization.authorizedCheckpointRootIdentity,
    );
    await expect(
      releaseMutationLease({
        domainInput: fixture.domainInput,
        authorizationIdentity: fixture.lease.lease.authorizationIdentity,
        leaseIdentity: fixture.lease.lease.leaseIdentity,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_SUPERSEDED" });
  }, 60_000);

  it("revocation cuts off a live lease without cleanup", async () => {
    const revokedAuthorization = fixture.current;
    fixture.revoked = await revoke(fixture, revokedAuthorization, "owner-revocation");
    await expect(
      verifyAuthorization({
        domainInput: fixture.domainInput,
        authorizationIdentity: revokedAuthorization.authorization.authorizationIdentity,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_REVOKED" });
    await expect(
      releaseMutationLease({
        domainInput: fixture.domainInput,
        authorizationIdentity: revokedAuthorization.authorization.authorizationIdentity,
        leaseIdentity: fixture.newLease.lease.leaseIdentity,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_REVOKED" });
  }, 30_000);

  it("admits a fresh post-revocation epoch and replaces the stale live lease", async () => {
    const prior = fixture.current;
    fixture.current = await authorize(
      fixture,
      {
        expectedAuthorizationHeadIdentity: fixture.revoked.head.authorizationHeadIdentity,
        expectedHeadState: "REVOKED",
        expectedHeadGeneration: fixture.revoked.head.generation,
        expectedCurrentAuthorizationIdentity: prior.authorization.authorizationIdentity,
      },
      "post-revocation-admission",
    );
    fixture.postRevocationLease = await acquireMutationLease({
      domainInput: fixture.domainInput,
      authorizationIdentity: fixture.current.authorization.authorizationIdentity,
      currentTruthRequest: truthRequest(fixture),
      scope: ["alpha.txt"],
      semanticOwners,
      owner: "owner-a",
      expectedRegistryIdentity: fixture.newLease.registryIdentity,
    });
    expect(fixture.postRevocationLease.lease.authorizationHeadIdentity).toBe(
      fixture.current.head.authorizationHeadIdentity,
    );
  }, 60_000);

  it("allows exactly one same-head sibling and keeps the losing orphan invalid", async () => {
    const expectation = {
      expectedAuthorizationHeadIdentity: fixture.current.head.authorizationHeadIdentity,
      expectedHeadState: "ACTIVE",
      expectedHeadGeneration: fixture.current.head.generation,
      expectedCurrentAuthorizationIdentity: fixture.current.authorization.authorizationIdentity,
    };
    const before = await readdir(
      path.join(fixture.domain.taskStateRoot, "authorization", "records"),
    );
    const outcomes = await Promise.allSettled([
      authorize(fixture, expectation, "sibling-a"),
      authorize(fixture, expectation, "sibling-b"),
    ]);
    expect(outcomes.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(outcomes.filter(({ status }) => status === "rejected")[0].reason).toMatchObject({
      code: "AUTHORIZATION_CAS_CONFLICT",
    });
    const winner = outcomes.find(({ status }) => status === "fulfilled").value;
    const after = await readdir(
      path.join(fixture.domain.taskStateRoot, "authorization", "records"),
    );
    expect(after.length).toBe(before.length + 2);
    const losingRecord = after
      .map((name) => name.replace(/\.json$/u, ""))
      .find(
        (identity) =>
          !before.includes(`${identity}.json`) &&
          identity !== winner.authorization.authorizationIdentity,
      );
    await expect(
      verifyAuthorization({
        domainInput: fixture.domainInput,
        authorizationIdentity: losingRecord,
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_INVALID" });
  }, 60_000);

  it("binds one stable physical observation to a shared material-set generation", async () => {
    const alphaPath = path.join(fixture.worktreeRoot, "multi-alpha.txt");
    const betaPath = path.join(fixture.worktreeRoot, "multi-beta.txt");
    const gammaPath = path.join(fixture.worktreeRoot, "multi-gamma.txt");
    const alphaBytes = "alpha-material\n";
    const betaBytes = "beta-material\n";
    const gammaBytes = alphaBytes;
    await Promise.all([
      writeFile(alphaPath, alphaBytes),
      writeFile(betaPath, betaBytes),
      writeFile(gammaPath, gammaBytes),
    ]);

    const multiTask = defineTaskContract({
      taskIdentity: hash("multi-material-task"),
      taskName: "i4-multi-material-current-truth",
      repositoryIdentity: REPOSITORY_IDENTITY,
      portableWorktreeIdentity: fixture.portableWorktreeIdentity,
      scope: ["multi-alpha.txt", "multi-beta.txt", "multi-gamma.txt"],
      owners: ["owner-a"],
      semanticOwners,
      contextIntent: contextIntent("multi-material"),
    });
    const multiDomainInput = {
      repositoryRoot: fixture.worktreeRoot,
      worktreeRoot: fixture.worktreeRoot,
      stateRoot: path.join(fixture.temporary, "multi-state"),
      repositoryIdentity: REPOSITORY_IDENTITY,
      taskIdentity: multiTask.taskIdentity,
      portableWorktreeIdentity: fixture.portableWorktreeIdentity,
    };
    await mkdir(multiDomainInput.stateRoot, { recursive: true });
    const multiDomainCandidate = await inspectStateDomainCandidate(multiDomainInput);
    const multiDomain = await recordStateDomainBinding({
      ...multiDomainInput,
      expectedLocalStateStoreBindingIdentity: multiDomainCandidate.localStateStoreBindingIdentity,
    });
    await recordTaskContract(multiDomainInput, multiTask);

    const alpha = { id: "material-alpha", path: "multi-alpha.txt" };
    const beta = { id: "material-beta", path: "multi-beta.txt" };
    const gamma = { id: "material-gamma", path: "multi-gamma.txt" };
    const observe = (materials) =>
      observeCurrentTruth({
        ...multiDomainInput,
        taskContractIdentity: multiTask.taskContractIdentity,
        authorityIdentity: fixture.authorityIdentity,
        materials,
      });
    const materialFacts = (truth) => [
      ...truth.contextCompilation.tiers.tier1,
      ...truth.contextCompilation.tiers.tier2,
    ];
    const sharedGeneration = (truth) => {
      const generations = new Set(
        materialFacts(truth).map(({ generationIdentity }) => generationIdentity),
      );
      expect(generations.size).toBe(1);
      const [generationIdentity] = generations;
      expect(generationIdentity).toMatch(/^[0-9A-F]{64}$/u);
      return generationIdentity;
    };

    try {
      const baseline = await observe([alpha, beta]);
      expect(baseline.contextCompilation.status).toBe("VERIFIED");
      expect(materialFacts(baseline)).toMatchObject([
        {
          id: alpha.id,
          path: alpha.path,
          bytes: Buffer.byteLength(alphaBytes),
          sha256: sha256Hex(alphaBytes),
        },
        {
          id: beta.id,
          path: beta.path,
          bytes: Buffer.byteLength(betaBytes),
          sha256: sha256Hex(betaBytes),
        },
      ]);
      const baselineGeneration = sharedGeneration(baseline);

      const reversed = await observe([beta, alpha]);
      expect(sharedGeneration(reversed)).toBe(baselineGeneration);
      expect(reversed.context.taskMaterialFingerprint).toBe(
        baseline.context.taskMaterialFingerprint,
      );
      expect(reversed.currentTruthIdentity).toBe(baseline.currentTruthIdentity);

      const zero = await observe([]);
      expect(zero.contextCompilation.status).toBe("VERIFIED");
      expect(materialFacts(zero)).toEqual([]);

      const single = await observe([alpha]);
      const singleFact = materialFacts(single)[0];
      const oldSingleGeneration = sha256Hex(
        `CIC-I4-MATERIAL-GENERATION-V1\n${canonicalJson({
          path: singleFact.path,
          bytes: singleFact.bytes,
          sha256: singleFact.sha256,
        })}\n`,
      );
      expect(singleFact.generationIdentity).not.toBe(oldSingleGeneration);
      expect(singleFact.generationIdentity).not.toBe(baselineGeneration);

      const renamedId = await observe([{ ...alpha, id: "material-alpha-renamed" }, beta]);
      expect(sharedGeneration(renamedId)).not.toBe(baselineGeneration);

      const changedPath = await observe([{ ...alpha, path: gamma.path }, beta]);
      expect(sharedGeneration(changedPath)).not.toBe(baselineGeneration);

      const added = await observe([alpha, beta, gamma]);
      expect(sharedGeneration(added)).not.toBe(baselineGeneration);

      await writeFile(alphaPath, "alpha-material-changed\n");
      const changedAlpha = await observe([alpha, beta]);
      expect(sharedGeneration(changedAlpha)).not.toBe(baselineGeneration);
      expect(changedAlpha.currentTruthIdentity).not.toBe(baseline.currentTruthIdentity);
      await writeFile(alphaPath, alphaBytes);

      await writeFile(betaPath, "beta-material-changed\n");
      const changedBeta = await observe([alpha, beta]);
      expect(sharedGeneration(changedBeta)).not.toBe(baselineGeneration);
      expect(changedBeta.currentTruthIdentity).not.toBe(baseline.currentTruthIdentity);
      await writeFile(betaPath, betaBytes);

      const restored = await observe([alpha, beta]);
      expect(restored.currentTruthIdentity).toBe(baseline.currentTruthIdentity);
      const decision = defineOwnerDecision({
        decisionKind: "AUTHORIZE",
        taskIdentity: multiTask.taskIdentity,
        taskContractIdentity: multiTask.taskContractIdentity,
        repositoryIdentity: REPOSITORY_IDENTITY,
        portableWorktreeIdentity: fixture.portableWorktreeIdentity,
        portableStateDomainIdentity: multiDomain.portableStateDomainIdentity,
        localStateStoreBindingIdentity: multiDomain.localStateStoreBindingIdentity,
        localWorktreeBindingIdentity: multiDomain.localWorktreeBindingIdentity,
        contextIntentIdentity: multiTask.contextIntent.contextIntentIdentity,
        authorityIdentity: fixture.authorityIdentity,
        currentTruthIdentity: restored.currentTruthIdentity,
        actions: I4_ACTION_FLAGS,
        scope: multiTask.scope,
        owners: multiTask.owners,
        semanticOwners: multiTask.semanticOwners,
        reasonClassification: "multi-material-current-truth",
        reviewedEvidenceIdentities: [hash("multi-material-evidence")],
        expectedAuthorizationHeadIdentity: null,
        expectedHeadState: null,
        expectedHeadGeneration: 0,
        expectedCurrentAuthorizationIdentity: null,
      });
      await recordOwnerDecision(multiDomainInput, decision);
      const admitted = await admitAuthorization({
        domainInput: multiDomainInput,
        ownerDecisionIdentity: decision.ownerDecisionIdentity,
        currentTruthRequest: { materials: [alpha, beta] },
      });

      await writeFile(alphaPath, "alpha-material-stale\n");
      await expect(
        verifyAuthorization({
          domainInput: multiDomainInput,
          authorizationIdentity: admitted.authorization.authorizationIdentity,
          currentTruthRequest: { materials: [alpha, beta] },
        }),
      ).rejects.toMatchObject({ code: "AUTHORIZATION_STALE" });
    } finally {
      await Promise.all([unlink(alphaPath), unlink(betaPath), unlink(gammaPath)]);
    }
  }, 600_000);
});

function mirrorCurrentnessFixture() {
  const governedSourceFiles = [
    {
      path: "docs/sources/00_RSM_REBOOT_PROJECT_CHARTER.md",
      bytes: 43146,
      sha256: hash("source-00"),
    },
    {
      path: "docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md",
      bytes: 27913,
      sha256: hash("source-08"),
    },
  ];
  const governedMirrors = [
    { mirrorId: "chatgpt-project-sources", locatorIdentity: hash("chatgpt-locator") },
    { mirrorId: "google-drive-sources", locatorIdentity: hash("drive-locator") },
  ];
  const sourceGenerationFingerprint = hash("source-generation");
  return {
    currentTruthIdentity: hash("current-truth"),
    sourceGenerationFingerprint,
    sourceManifestIdentity: hash("source-manifest"),
    governedSourceFiles,
    governedMirrors,
    mirrorObservations: governedMirrors.map((mirror) => ({
      ...mirror,
      availability: "AVAILABLE",
      observedGenerationFingerprint: sourceGenerationFingerprint,
      files: governedSourceFiles.map((file) => ({ ...file })),
    })),
  };
}

function mirrorCurrentnessExpectation(input) {
  const expected = globalThis.structuredClone(input);
  delete expected.mirrorObservations;
  return expected;
}

function resealMirrorReport(report) {
  const resealed = globalThis.structuredClone(report);
  delete resealed.reportIdentity;
  return {
    ...resealed,
    reportIdentity: semanticIdentity("CIC-MIRROR-CURRENTNESS-REPORT-V1", resealed),
  };
}

describe("CIC Slice4 derived mirror currentness", () => {
  it("reports exact governed mirrors as converged with order-independent identities", () => {
    const input = mirrorCurrentnessFixture();
    const report = createMirrorCurrentnessReport(input);
    const reordered = createMirrorCurrentnessReport({
      ...input,
      governedSourceFiles: [...input.governedSourceFiles].reverse(),
      governedMirrors: [...input.governedMirrors].reverse(),
      mirrorObservations: [...input.mirrorObservations]
        .reverse()
        .map((observation) => ({ ...observation, files: [...observation.files].reverse() })),
    });

    expect(report.disposition).toBe("CONVERGED");
    expect(report.mirrors.map(({ state }) => state)).toEqual(["CURRENT", "CURRENT"]);
    expect(report.reasonCodes).toEqual([]);
    expect(report.reportIdentity).toBe(reordered.reportIdentity);
    expect(report).toMatchObject({
      factAuthority: "DERIVED_NON_AUTHORITATIVE",
      mutationAuthorization: false,
      mirrorWriteAuthorization: false,
      sourceWriteAuthorization: false,
      publicationAuthorization: false,
      ownerAuthorization: false,
      targetedPruning: "OFF",
    });
    expect(verifyMirrorCurrentnessReport(report, mirrorCurrentnessExpectation(input))).toEqual({
      status: "PASS",
      disposition: "CONVERGED",
      reportIdentity: report.reportIdentity,
    });
  });

  it("classifies unavailable, stale, divergent, partial, and locator-mismatched mirrors", () => {
    const fixture = mirrorCurrentnessFixture();
    const cases = [
      {
        name: "missing",
        mutate(input) {
          input.mirrorObservations.pop();
        },
        mirrorId: "google-drive-sources",
        state: "UNAVAILABLE",
      },
      {
        name: "explicit unavailable",
        mutate(input) {
          input.mirrorObservations[0].availability = "UNAVAILABLE";
          input.mirrorObservations[0].observedGenerationFingerprint = null;
          input.mirrorObservations[0].files = [];
        },
        mirrorId: "chatgpt-project-sources",
        state: "UNAVAILABLE",
      },
      {
        name: "stale generation",
        mutate(input) {
          input.mirrorObservations[0].observedGenerationFingerprint = hash("stale-generation");
        },
        mirrorId: "chatgpt-project-sources",
        state: "STALE",
      },
      {
        name: "divergent byte count",
        mutate(input) {
          input.mirrorObservations[0].files[0].bytes += 1;
        },
        mirrorId: "chatgpt-project-sources",
        state: "DIVERGENT",
      },
      {
        name: "divergent hash",
        mutate(input) {
          input.mirrorObservations[0].files[0].sha256 = hash("single-byte-divergence");
        },
        mirrorId: "chatgpt-project-sources",
        state: "DIVERGENT",
      },
      {
        name: "missing file",
        mutate(input) {
          input.mirrorObservations[0].files.pop();
        },
        mirrorId: "chatgpt-project-sources",
        state: "PARTIAL",
      },
      {
        name: "extra file",
        mutate(input) {
          input.mirrorObservations[0].files.push({
            path: "docs/sources/extra.md",
            bytes: 1,
            sha256: hash("extra-file"),
          });
        },
        mirrorId: "chatgpt-project-sources",
        state: "PARTIAL",
      },
      {
        name: "locator mismatch",
        mutate(input) {
          input.mirrorObservations[0].locatorIdentity = hash("wrong-locator");
        },
        mirrorId: "chatgpt-project-sources",
        state: "LOCATOR_MISMATCH",
      },
    ];

    for (const scenario of cases) {
      const input = globalThis.structuredClone(fixture);
      scenario.mutate(input);
      const report = createMirrorCurrentnessReport(input);
      expect(report.disposition, scenario.name).toBe("BLOCKED");
      expect(report.mirrors.find(({ mirrorId }) => mirrorId === scenario.mirrorId)?.state).toBe(
        scenario.state,
      );
      expect(
        verifyMirrorCurrentnessReport(report, mirrorCurrentnessExpectation(fixture)).status,
        scenario.name,
      ).toBe("PASS");
    }
  });

  it("fails closed on duplicate or unknown mirror and file observations", () => {
    const duplicateMirror = mirrorCurrentnessFixture();
    duplicateMirror.mirrorObservations.push(
      globalThis.structuredClone(duplicateMirror.mirrorObservations[0]),
    );
    expect(() => createMirrorCurrentnessReport(duplicateMirror)).toThrowError(
      expect.objectContaining({ code: "MIRROR_CURRENTNESS_DUPLICATE_MIRROR" }),
    );

    const duplicateFile = mirrorCurrentnessFixture();
    duplicateFile.mirrorObservations[0].files.push(
      globalThis.structuredClone(duplicateFile.mirrorObservations[0].files[0]),
    );
    expect(() => createMirrorCurrentnessReport(duplicateFile)).toThrowError(
      expect.objectContaining({ code: "MIRROR_CURRENTNESS_DUPLICATE_FILE" }),
    );

    const unknownMirror = mirrorCurrentnessFixture();
    unknownMirror.mirrorObservations.push({
      ...globalThis.structuredClone(unknownMirror.mirrorObservations[0]),
      mirrorId: "unknown-mirror",
    });
    expect(() => createMirrorCurrentnessReport(unknownMirror)).toThrowError(
      expect.objectContaining({ code: "MIRROR_CURRENTNESS_UNKNOWN_MIRROR" }),
    );
  });

  it("rejects stale expected bindings and semantically false resealed reports", () => {
    const input = mirrorCurrentnessFixture();
    const converged = createMirrorCurrentnessReport(input);
    const expected = mirrorCurrentnessExpectation(input);
    const drifts = [
      { ...expected, currentTruthIdentity: hash("changed-current-truth") },
      { ...expected, sourceGenerationFingerprint: hash("changed-generation") },
      { ...expected, sourceManifestIdentity: hash("changed-manifest") },
      {
        ...expected,
        governedSourceFiles: expected.governedSourceFiles.map((file, index) =>
          index === 0 ? { ...file, bytes: file.bytes + 1 } : file,
        ),
      },
      {
        ...expected,
        governedMirrors: expected.governedMirrors.map((mirror, index) =>
          index === 0 ? { ...mirror, locatorIdentity: hash("changed-mirror-set") } : mirror,
        ),
      },
    ];
    for (const drift of drifts) {
      expect(() => verifyMirrorCurrentnessReport(converged, drift)).toThrowError(
        expect.objectContaining({ code: "MIRROR_CURRENTNESS_BINDING_STALE" }),
      );
    }

    const blockedInput = mirrorCurrentnessFixture();
    blockedInput.mirrorObservations[0].files[0].sha256 = hash("divergent");
    const blocked = createMirrorCurrentnessReport(blockedInput);
    const falseCurrent = globalThis.structuredClone(blocked);
    falseCurrent.mirrors[0].state = "CURRENT";
    falseCurrent.mirrors[0].reasonCodes = [];
    expect(() =>
      verifyMirrorCurrentnessReport(
        resealMirrorReport(falseCurrent),
        mirrorCurrentnessExpectation(blockedInput),
      ),
    ).toThrowError(expect.objectContaining({ code: "MIRROR_CURRENTNESS_SEMANTIC_MISMATCH" }));

    const falseConverged = globalThis.structuredClone(blocked);
    falseConverged.disposition = "CONVERGED";
    falseConverged.reasonCodes = [];
    expect(() =>
      verifyMirrorCurrentnessReport(
        resealMirrorReport(falseConverged),
        mirrorCurrentnessExpectation(blockedInput),
      ),
    ).toThrowError(expect.objectContaining({ code: "MIRROR_CURRENTNESS_SEMANTIC_MISMATCH" }));
  });

  it("rejects secret, raw locator, executable, and cyclic injection without leaking contents", () => {
    const input = mirrorCurrentnessFixture();
    const rawUrl = { ...input, url: "https://mirror.invalid/source" };
    expect(() => createMirrorCurrentnessReport(rawUrl)).toThrowError(
      expect.objectContaining({ code: "MIRROR_CURRENTNESS_SENSITIVE_FIELD_REJECTED" }),
    );

    const credential = mirrorCurrentnessFixture();
    credential.governedMirrors[0].token = "not-a-real-token";
    expect(() => createMirrorCurrentnessReport(credential)).toThrowError(
      expect.objectContaining({ code: "MIRROR_CURRENTNESS_SENSITIVE_FIELD_REJECTED" }),
    );

    const executable = mirrorCurrentnessFixture();
    executable.mirrorObservations[0].execute = () => "forbidden";
    expect(() => createMirrorCurrentnessReport(executable)).toThrowError(
      expect.objectContaining({ code: "MIRROR_CURRENTNESS_INJECTION_REJECTED" }),
    );

    const cyclic = mirrorCurrentnessFixture();
    cyclic.self = cyclic;
    expect(() => createMirrorCurrentnessReport(cyclic)).toThrowError(
      expect.objectContaining({ code: "MIRROR_CURRENTNESS_INJECTION_REJECTED" }),
    );

    const serialized = canonicalJson(createMirrorCurrentnessReport(input));
    expect(serialized).not.toMatch(/https?:|file:|password|credential|cookie|secret|token/iu);
    expect(serialized).not.toContain('"content"');
  });
});
