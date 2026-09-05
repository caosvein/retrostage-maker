import { execFile } from "node:child_process";
import { mkdir, mkdtemp, open, readFile, realpath, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { observeCurrentTruth } from "./lib/current-truth.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import {
  activatePack,
  assertPackRoleFloor,
  generatePack,
  inspectPack,
  invalidatePack,
  verifyPack,
} from "./lib/pack-lifecycle.mjs";
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
import {
  inspectStateDomainCandidate,
  recordStateDomainBinding,
  semanticIdentity,
} from "./lib/state-domain.mjs";
import { runPackLifecycle } from "./manage-pack-lifecycle.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const hash = (value) => sha256Hex(`i4-pack-test:${value}`);
const runFile = promisify(execFile);
const GIT_EXECUTABLE = path.join(process.env.ProgramFiles, "Git", "cmd", "git.exe");
const ROLES = [
  "TASK_CONTRACT",
  "OWNER_DECISION",
  "TASK_AUTHORIZATION",
  "WORKING_SET_CHECKPOINT",
  "CONTEXT_COMPILATION",
  "SOURCE_GENERATION_PROOF",
  "REPOSITORY_IDENTITY_PROOF",
];
const semanticOwners = ["semantic-owner-pack"];

function contextIntent() {
  return {
    reviewed: true,
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      materialIdentities: [],
      reason: `Reviewed pack contract excludes ${dimension}`,
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

function currentTruthRequest() {
  return { materials: [] };
}

async function truth() {
  return observeCurrentTruth({
    ...fixture.domainInput,
    ...currentTruthRequest(),
    taskContractIdentity: fixture.task.taskContractIdentity,
    authorityIdentity: fixture.authorityIdentity,
  });
}

function packInput(overrides = {}) {
  return {
    domainInput: fixture.domainInput,
    authorizationIdentity: fixture.authorization.authorization.authorizationIdentity,
    currentTruthRequest: currentTruthRequest(),
    ...overrides,
  };
}

async function currentLocatorIdentity() {
  const locator = JSON.parse(
    await readFile(path.join(fixture.domain.packStoreRoot, "active.json"), "utf8"),
  );
  return semanticIdentity("CIC-PACK-ACTIVE-LOCATOR-V1", locator);
}

function expectPortablePackResult(result) {
  const serialized = canonicalJson(result);
  for (const localRoot of [fixture.temporary, fixture.worktreeRoot, fixture.stateRoot]) {
    expect(serialized).not.toContain(localRoot);
    expect(serialized).not.toContain(localRoot.replaceAll("\\", "/"));
    expect(serialized).not.toContain(localRoot.replaceAll("\\", "\\\\"));
  }
  expect(serialized).not.toMatch(
    /"(?:bindingRecordPath|packStoreRoot|repositoryRoot|stateRoot|taskStateRoot|worktreeRoot)"/u,
  );
}

async function acquireCurrentLease(previousRegistryIdentity) {
  fixture.lease = await acquireMutationLease({
    domainInput: fixture.domainInput,
    authorizationIdentity: fixture.authorization.authorization.authorizationIdentity,
    currentTruthRequest: currentTruthRequest(),
    scope: fixture.task.scope,
    semanticOwners: fixture.task.semanticOwners,
    owner: "pack-owner",
    expectedRegistryIdentity: previousRegistryIdentity,
  });
}

async function supersede(reason) {
  const current = await truth();
  const prior = fixture.authorization;
  const decision = defineOwnerDecision({
    decisionKind: "AUTHORIZE",
    taskIdentity: fixture.task.taskIdentity,
    taskContractIdentity: fixture.task.taskContractIdentity,
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity: fixture.portableWorktreeIdentity,
    portableStateDomainIdentity: fixture.domain.portableStateDomainIdentity,
    localStateStoreBindingIdentity: fixture.domain.localStateStoreBindingIdentity,
    localWorktreeBindingIdentity: fixture.domain.localWorktreeBindingIdentity,
    contextIntentIdentity: fixture.task.contextIntent.contextIntentIdentity,
    authorityIdentity: fixture.authorityIdentity,
    currentTruthIdentity: current.currentTruthIdentity,
    actions: I4_ACTION_FLAGS,
    scope: fixture.task.scope,
    owners: fixture.task.owners,
    semanticOwners: fixture.task.semanticOwners,
    reasonClassification: reason,
    reviewedEvidenceIdentities: [hash(`evidence-${reason}`)],
    expectedAuthorizationHeadIdentity: prior.head.authorizationHeadIdentity,
    expectedHeadState: "ACTIVE",
    expectedHeadGeneration: prior.head.generation,
    expectedCurrentAuthorizationIdentity: prior.authorization.authorizationIdentity,
  });
  await recordOwnerDecision(fixture.domainInput, { ...decision });
  fixture.authorization = await admitAuthorization({
    domainInput: fixture.domainInput,
    ownerDecisionIdentity: decision.ownerDecisionIdentity,
    currentTruthRequest: currentTruthRequest(),
  });
}

beforeAll(async () => {
  const temporaryAlias = await mkdtemp(path.join(tmpdir(), "cic-i4-pack-"));
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
  await mkdir(stateRoot, { recursive: true });
  const portableWorktreeIdentity = hash("worktree");
  const authorityIdentity = hash("authority");
  const task = defineTaskContract({
    taskIdentity: hash("stable-task"),
    taskName: "i4-pack-lifecycle",
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    scope: ["alpha.txt"],
    owners: ["pack-owner"],
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
  const current = await truth();
  fixture.policy = current.effectivePolicy;
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
    currentTruthIdentity: current.currentTruthIdentity,
    actions: I4_ACTION_FLAGS,
    scope: task.scope,
    owners: task.owners,
    semanticOwners: task.semanticOwners,
    reasonClassification: "pack-admission",
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
  fixture.lease = await acquireMutationLease({
    domainInput,
    authorizationIdentity: fixture.authorization.authorization.authorizationIdentity,
    currentTruthRequest: currentTruthRequest(),
    scope: task.scope,
    semanticOwners: task.semanticOwners,
    owner: "pack-owner",
    expectedRegistryIdentity: null,
  });
}, 900_000);

afterAll(async () => {
  if (serializationHandle) {
    await serializationHandle.close();
    await unlink(SERIALIZATION_LOCK);
  }
});

describe.sequential("CIC-I4 pack lifecycle", () => {
  it("enforces the non-lowerable policy/schema/role floor", async () => {
    expect(fixture.policy).toMatchObject({
      schemaFloor: 1,
      policyFloor: 1,
      requiredRoles: ROLES,
    });
    expect(assertPackRoleFloor(ROLES)).toEqual(ROLES);
    for (const role of ROLES) {
      expect(() => assertPackRoleFloor(ROLES.filter((candidate) => candidate !== role))).toThrow(
        expect.objectContaining({ code: "PACK_INCOMPLETE" }),
      );
    }
    for (const substitute of ["PACK_MANIFEST", "PREIMAGE"]) {
      expect(() => assertPackRoleFloor([...ROLES.slice(0, -1), substitute])).toThrow(
        expect.objectContaining({ code: "PACK_INCOMPLETE" }),
      );
    }
    await expect(
      observeCurrentTruth({
        ...fixture.domainInput,
        materials: [],
        policyExtension: {
          reviewed: true,
          schemaFloor: 99,
          policyFloor: 99,
          requiredRoles: ["CALLER_AUTHORED_ROLE"],
        },
        taskContractIdentity: fixture.task.taskContractIdentity,
        authorityIdentity: fixture.authorityIdentity,
      }),
    ).rejects.toMatchObject({ code: "PACK_SCHEMA_POLICY_FLOOR_MISMATCH" });
    await expect(
      generatePack(
        packInput({
          generation: 1,
          parentPackIdentity: null,
          declaredPolicy: { ...fixture.policy, policyFloor: 0 },
        }),
      ),
    ).rejects.toMatchObject({ code: "PACK_SCHEMA_POLICY_FLOOR_MISMATCH" });
    await expect(
      generatePack(
        packInput({
          generation: 1,
          parentPackIdentity: null,
          companions: ROLES.map((role) => ({ role, content: { role } })),
        }),
      ),
    ).rejects.toMatchObject({ code: "PACK_MANIFEST_MISMATCH" });
  }, 30_000);

  it("constructs GENERATED non-active, verifies, and activates through one exact CAS", async () => {
    fixture.pack1 = await generatePack(packInput({ generation: 1, parentPackIdentity: null }));
    expect(fixture.pack1).toMatchObject({ active: false, lifecycle: { state: "GENERATED" } });
    expect(fixture.pack1.companions.map(({ role }) => role)).toEqual(ROLES);
    const artifacts = Object.fromEntries(
      fixture.pack1.companions.map(({ role, artifact }) => [role, artifact]),
    );
    expect(artifacts.TASK_CONTRACT.taskContractIdentity).toBe(fixture.task.taskContractIdentity);
    expect(artifacts.OWNER_DECISION.ownerDecisionIdentity).toBe(
      fixture.authorization.authorization.ownerDecisionIdentity,
    );
    expect(artifacts.TASK_AUTHORIZATION.authorizationIdentity).toBe(
      fixture.authorization.authorization.authorizationIdentity,
    );
    expect(artifacts.WORKING_SET_CHECKPOINT.record.authorizationHeadIdentity).toBe(
      fixture.authorization.head.authorizationHeadIdentity,
    );
    expect(artifacts.CONTEXT_COMPILATION.currentTruthIdentity).toMatch(/^[0-9A-F]{64}$/u);
    expect(artifacts.SOURCE_GENERATION_PROOF.fingerprint).toBe(
      "6785498B15F1E37163EB8C2E2FE2406F830CD68F99D18397CE157CA3A581BA55",
    );
    expect(artifacts.REPOSITORY_IDENTITY_PROOF.repository.repositoryIdentity).toBe(
      REPOSITORY_IDENTITY,
    );
    const verified = await verifyPack(packInput({ packIdentity: fixture.pack1.packIdentity }));
    expect(verified.lifecycle.state).toBe("VERIFIED");
    fixture.active1 = await activatePack(
      packInput({
        packIdentity: fixture.pack1.packIdentity,
        leaseIdentity: fixture.lease.lease.leaseIdentity,
        expectedLocatorIdentity: null,
      }),
    );
    expect(fixture.active1.active.state).toBe("ACTIVE");
    expect((await inspectPack(packInput())).usable).toBe(true);
  }, 60_000);

  it("requires an exact completed GENERATED lifecycle witness before verification", async () => {
    const candidate = await generatePack(
      packInput({ generation: 2, parentPackIdentity: fixture.pack1.packIdentity }),
    );
    const generatedPath = path.join(
      fixture.domain.packStoreRoot,
      "lifecycle",
      "generated",
      `${candidate.packIdentity}.json`,
    );
    const generatedBytes = await readFile(generatedPath);
    await unlink(generatedPath);
    await expect(
      verifyPack(packInput({ packIdentity: candidate.packIdentity })),
    ).rejects.toMatchObject({ code: "PACK_STATE_TRANSITION_INVALID" });

    await writeFile(generatedPath, generatedBytes);
    const generated = JSON.parse(generatedBytes.toString("utf8"));
    await writeFile(
      generatedPath,
      `${canonicalJson({ ...generated, authorizationIdentity: hash("tampered-generated") })}\n`,
    );
    await expect(
      verifyPack(packInput({ packIdentity: candidate.packIdentity })),
    ).rejects.toMatchObject({ code: "PACK_STATE_TRANSITION_INVALID" });
    await writeFile(generatedPath, generatedBytes);
  }, 60_000);

  it("never treats a missing or tampered VERIFIED or ACTIVE witness as usable", async () => {
    const verifiedPath = path.join(
      fixture.domain.packStoreRoot,
      "lifecycle",
      "verified",
      `${fixture.pack1.packIdentity}.json`,
    );
    const verifiedBytes = await readFile(verifiedPath);
    await unlink(verifiedPath);
    expect(await inspectPack(packInput())).toMatchObject({ status: "BLOCKED", usable: false });
    await writeFile(verifiedPath, `${canonicalJson({ tampered: true })}\n`);
    expect(await inspectPack(packInput())).toMatchObject({ status: "BLOCKED", usable: false });
    await writeFile(verifiedPath, verifiedBytes);

    const activePath = path.join(
      fixture.domain.packStoreRoot,
      "lifecycle",
      "active",
      `${fixture.pack1.packIdentity}.json`,
    );
    const activeBytes = await readFile(activePath);
    await unlink(activePath);
    expect(await inspectPack(packInput())).toMatchObject({ status: "BLOCKED", usable: false });
    await writeFile(activePath, `${canonicalJson({ tampered: true })}\n`);
    expect(await inspectPack(packInput())).toMatchObject({ status: "BLOCKED", usable: false });
    await writeFile(activePath, activeBytes);
    expect(await inspectPack(packInput())).toMatchObject({ status: "ACTIVE", usable: true });
  }, 60_000);

  it("requires fresh current truth at every pack authority and material gate", async () => {
    const locatorPath = path.join(fixture.domain.packStoreRoot, "active.json");
    const locatorBefore = await readFile(locatorPath);
    const gateCalls = (currentTruthRequest) => [
      () =>
        generatePack(
          packInput({
            currentTruthRequest,
            generation: 2,
            parentPackIdentity: fixture.pack1.packIdentity,
          }),
        ),
      () =>
        verifyPack(packInput({ currentTruthRequest, packIdentity: fixture.pack1.packIdentity })),
      () =>
        activatePack(
          packInput({
            currentTruthRequest,
            packIdentity: fixture.pack1.packIdentity,
            leaseIdentity: fixture.lease.lease.leaseIdentity,
            expectedLocatorIdentity: fixture.active1.locatorIdentity,
          }),
        ),
      () => inspectPack(packInput({ currentTruthRequest })),
      () =>
        invalidatePack(
          packInput({
            currentTruthRequest,
            packIdentity: fixture.pack1.packIdentity,
            expectedLocatorIdentity: fixture.active1.locatorIdentity,
          }),
        ),
    ];

    for (const call of gateCalls(undefined)) {
      await expect(call()).rejects.toMatchObject({ code: "AUTHORIZATION_STALE" });
    }
    expect(await readFile(locatorPath)).toEqual(locatorBefore);

    const driftPath = path.join(fixture.worktreeRoot, "fresh-truth-drift.txt");
    await writeFile(driftPath, "physical drift\n");
    try {
      for (const call of gateCalls(currentTruthRequest())) {
        await expect(call()).rejects.toMatchObject({ code: "AUTHORIZATION_STALE" });
      }
      expect(await readFile(locatorPath)).toEqual(locatorBefore);
    } finally {
      await unlink(driftPath);
    }
  }, 180_000);

  it("rejects generic role-labelled or tampered companion artifacts at the material gate", async () => {
    const candidate = await generatePack(
      packInput({ generation: 2, parentPackIdentity: fixture.pack1.packIdentity }),
    );
    for (const companion of candidate.companions) {
      const companionPath = path.join(
        fixture.domain.packStoreRoot,
        "objects",
        `${companion.companionIdentity}.json`,
      );
      const original = await readFile(companionPath);
      try {
        await writeFile(
          companionPath,
          `${canonicalJson({
            ...companion,
            artifact: { role: companion.role, content: "generic-role-labelled-substitute" },
          })}\n`,
        );
        await expect(
          verifyPack(packInput({ packIdentity: candidate.packIdentity })),
        ).rejects.toMatchObject({ code: "PACK_IDENTITY_MISMATCH" });
      } finally {
        await writeFile(companionPath, original);
      }
    }
    const manifestPath = path.join(
      fixture.domain.packStoreRoot,
      "manifests",
      `${candidate.packIdentity}.json`,
    );
    const manifestBytes = await readFile(manifestPath);
    try {
      const manifest = JSON.parse(manifestBytes.toString("utf8"));
      manifest.companions[0].schemaGeneration += 1;
      manifest.companions[0].policyGeneration += 1;
      manifest.companions[0].bytes += 1;
      manifest.companions[0].sha256 = hash("forged-companion-bytes");
      await writeFile(manifestPath, `${canonicalJson(manifest)}\n`);
      await expect(
        verifyPack(packInput({ packIdentity: candidate.packIdentity })),
      ).rejects.toMatchObject({ code: "PACK_IDENTITY_MISMATCH" });
    } finally {
      await writeFile(manifestPath, manifestBytes);
    }
  }, 240_000);

  it("gives same-expectation activation contenders exactly one winner", async () => {
    const candidateA = await generatePack(
      packInput({
        generation: 2,
        parentPackIdentity: fixture.pack1.packIdentity,
      }),
    );
    const candidateB = await generatePack(
      packInput({
        generation: 2,
        parentPackIdentity: fixture.pack1.packIdentity,
      }),
    );
    fixture.pack2 = candidateA;
    fixture.active2 = await activatePack(
      packInput({
        packIdentity: candidateA.packIdentity,
        leaseIdentity: fixture.lease.lease.leaseIdentity,
        expectedLocatorIdentity: fixture.active1.locatorIdentity,
      }),
    );
    await expect(
      activatePack(
        packInput({
          packIdentity: candidateB.packIdentity,
          leaseIdentity: fixture.lease.lease.leaseIdentity,
          expectedLocatorIdentity: fixture.active1.locatorIdentity,
        }),
      ),
    ).rejects.toMatchObject({ code: "PACK_ACTIVATION_CAS_CONFLICT" });
  }, 90_000);

  it("durably supersedes the predecessor and makes locator replay fail closed", async () => {
    const supersededPath = path.join(
      fixture.domain.packStoreRoot,
      "lifecycle",
      "superseded",
      `${fixture.pack1.packIdentity}.json`,
    );
    const superseded = JSON.parse(await readFile(supersededPath, "utf8"));
    expect(superseded).toMatchObject({
      state: "SUPERSEDED",
      packIdentity: fixture.pack1.packIdentity,
      successorPackIdentity: fixture.pack2.packIdentity,
      predecessorLocatorIdentity: fixture.active1.locatorIdentity,
    });
    expect(superseded.lifecycleRecordIdentity).toMatch(/^[0-9A-F]{64}$/u);

    const locatorPath = path.join(fixture.domain.packStoreRoot, "active.json");
    await writeFile(locatorPath, `${canonicalJson(fixture.active1.locator)}\n`);
    expect(await inspectPack(packInput())).toMatchObject({
      status: "SUPERSEDED",
      usable: false,
    });

    fixture.active2 = await activatePack(
      packInput({
        packIdentity: fixture.pack2.packIdentity,
        leaseIdentity: fixture.lease.lease.leaseIdentity,
        expectedLocatorIdentity: fixture.active1.locatorIdentity,
      }),
    );
    expect(await inspectPack(packInput())).toMatchObject({ status: "ACTIVE", usable: true });
    await expect(
      activatePack(
        packInput({
          packIdentity: fixture.pack1.packIdentity,
          leaseIdentity: fixture.lease.lease.leaseIdentity,
          expectedLocatorIdentity: fixture.active2.locatorIdentity,
        }),
      ),
    ).rejects.toMatchObject({ code: "PACK_STATE_TRANSITION_INVALID" });
  }, 90_000);

  it("makes the old active pack historical after authorization-head movement", async () => {
    const oldLease = fixture.lease;
    await supersede("pack-epoch-supersession");
    fixture.policy = (await truth()).effectivePolicy;
    const historical = await inspectPack(packInput());
    expect(historical).toMatchObject({ status: "HISTORICAL", usable: false });
    await acquireCurrentLease(oldLease.registryIdentity);
    expect(fixture.lease.lease.authorizationHeadIdentity).toBe(
      fixture.authorization.head.authorizationHeadIdentity,
    );
  }, 60_000);

  it("does not persist INVALID or mutate the locator for an intact historical epoch", async () => {
    const locatorPath = path.join(fixture.domain.packStoreRoot, "active.json");
    const locatorBefore = await readFile(locatorPath);
    const invalidPath = path.join(
      fixture.domain.packStoreRoot,
      "lifecycle",
      "invalid",
      `${fixture.pack2.packIdentity}.json`,
    );
    await expect(
      invalidatePack(
        packInput({
          packIdentity: fixture.pack2.packIdentity,
          expectedLocatorIdentity: fixture.active2.locatorIdentity,
        }),
      ),
    ).rejects.toMatchObject({ code: "PACK_STATE_TRANSITION_INVALID" });
    expect(await readFile(locatorPath)).toEqual(locatorBefore);
    await expect(readFile(invalidPath)).rejects.toMatchObject({ code: "ENOENT" });
  }, 30_000);

  it("exact-CAS replaces a stale prior-epoch locator and leaves old bytes immutable", async () => {
    const oldManifestPath = path.join(
      fixture.domain.packStoreRoot,
      "manifests",
      `${fixture.pack2.packIdentity}.json`,
    );
    const oldBytes = await readFile(oldManifestPath);
    fixture.pack3 = await generatePack(
      packInput({
        generation: 3,
        parentPackIdentity: fixture.pack2.packIdentity,
      }),
    );
    fixture.active3 = await activatePack(
      packInput({
        packIdentity: fixture.pack3.packIdentity,
        leaseIdentity: fixture.lease.lease.leaseIdentity,
        expectedLocatorIdentity: fixture.active2.locatorIdentity,
      }),
    );
    expect((await inspectPack(packInput())).status).toBe("ACTIVE");
    expect(await readFile(oldManifestPath)).toEqual(oldBytes);
    fixture.pack4Candidate = await generatePack(
      packInput({ generation: 4, parentPackIdentity: fixture.pack3.packIdentity }),
    );
  }, 60_000);

  it("detects tamper with zero implicit writes and remains unusable after failed persistence", async () => {
    const companionIdentity = fixture.pack3.manifest.companions[0].companionIdentity;
    const companionPath = path.join(
      fixture.domain.packStoreRoot,
      "objects",
      `${companionIdentity}.json`,
    );
    await writeFile(companionPath, `${canonicalJson({ tampered: true })}\n`);
    const locatorPath = path.join(fixture.domain.packStoreRoot, "active.json");
    const before = await readFile(locatorPath);
    expect(await inspectPack(packInput())).toMatchObject({
      status: "BLOCKED",
      usable: false,
      finding: "PACK_IDENTITY_MISMATCH",
    });
    expect(await readFile(locatorPath)).toEqual(before);

    const invalidDirectory = path.join(fixture.domain.packStoreRoot, "lifecycle", "invalid");
    await writeFile(invalidDirectory, "blocks invalid-record persistence\n", { flag: "wx" });
    await expect(
      invalidatePack(
        packInput({
          packIdentity: fixture.pack3.packIdentity,
          expectedLocatorIdentity: fixture.active3.locatorIdentity,
        }),
      ),
    ).rejects.toMatchObject({ code: "PACK_INVALIDATION_PERSIST_FAILED" });
    expect(await inspectPack(packInput())).toMatchObject({ status: "BLOCKED", usable: false });
    expect(await readFile(locatorPath)).toEqual(before);
    await unlink(invalidDirectory);
  }, 60_000);

  it("persists INVALID only through explicit VERIFY plus INVALIDATE_PACK", async () => {
    const invalid = await invalidatePack(
      packInput({
        packIdentity: fixture.pack3.packIdentity,
        expectedLocatorIdentity: fixture.active3.locatorIdentity,
      }),
    );
    expect(invalid.status).toBe("INVALID");
    expect(await inspectPack(packInput())).toMatchObject({
      status: "ABSENT_PROVEN",
      usable: false,
    });
  }, 30_000);

  it("keeps every pack CLI command portable and persists actual manifest tamper", async () => {
    const oldLease = fixture.lease;
    await supersede("pack-cli-portability");
    fixture.policy = (await truth()).effectivePolicy;
    await acquireCurrentLease(oldLease.registryIdentity);
    const expectedLocatorIdentity = await currentLocatorIdentity();
    const generated = await runPackLifecycle(
      "generate",
      packInput({ generation: 1, parentPackIdentity: null }),
    );
    expectPortablePackResult(generated);
    const verified = await runPackLifecycle(
      "verify",
      packInput({ packIdentity: generated.packIdentity }),
    );
    expectPortablePackResult(verified);
    const activated = await runPackLifecycle(
      "activate",
      packInput({
        packIdentity: generated.packIdentity,
        leaseIdentity: fixture.lease.lease.leaseIdentity,
        expectedLocatorIdentity,
      }),
    );
    expectPortablePackResult(activated);
    const inspected = await runPackLifecycle("inspect", packInput());
    expectPortablePackResult(inspected);
    expect(inspected).toMatchObject({ status: "ACTIVE", usable: true });

    const manifestPath = path.join(
      fixture.domain.packStoreRoot,
      "manifests",
      `${generated.packIdentity}.json`,
    );
    await writeFile(manifestPath, `${canonicalJson({ tampered: "manifest" })}\n`);
    const invalidated = await runPackLifecycle(
      "invalidate",
      packInput({
        packIdentity: generated.packIdentity,
        expectedLocatorIdentity: activated.locatorIdentity,
      }),
    );
    expectPortablePackResult(invalidated);
    expect(invalidated.status).toBe("INVALID");
  }, 120_000);

  it("normalizes a missing companion into explicit intrinsic-tamper invalidation", async () => {
    const oldLease = fixture.lease;
    await supersede("missing-companion-invalidation");
    fixture.policy = (await truth()).effectivePolicy;
    await acquireCurrentLease(oldLease.registryIdentity);
    const generated = await generatePack(packInput({ generation: 1, parentPackIdentity: null }));
    const activated = await activatePack(
      packInput({
        packIdentity: generated.packIdentity,
        leaseIdentity: fixture.lease.lease.leaseIdentity,
        expectedLocatorIdentity: await currentLocatorIdentity(),
      }),
    );
    const missingCompanionPath = path.join(
      fixture.domain.packStoreRoot,
      "objects",
      `${generated.manifest.companions[0].companionIdentity}.json`,
    );
    await unlink(missingCompanionPath);
    const invalidated = await invalidatePack(
      packInput({
        packIdentity: generated.packIdentity,
        expectedLocatorIdentity: activated.locatorIdentity,
      }),
    );
    expect(invalidated.status).toBe("INVALID");
    expect(await inspectPack(packInput())).toMatchObject({
      status: "ABSENT_PROVEN",
      usable: false,
    });
  }, 120_000);

  it("blocks activation after revocation without changing the active locator", async () => {
    const candidate = fixture.pack4Candidate;
    const current = await truth();
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
      currentTruthIdentity: current.currentTruthIdentity,
      actions: fixture.authorization.authorization.actions,
      scope: fixture.authorization.authorization.scope,
      owners: fixture.authorization.authorization.owners,
      semanticOwners: fixture.authorization.authorization.semanticOwners,
      reasonClassification: "pack-revocation",
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
    const locatorPath = path.join(fixture.domain.packStoreRoot, "active.json");
    const before = await readFile(locatorPath);
    await expect(
      activatePack(
        packInput({
          packIdentity: candidate.packIdentity,
          leaseIdentity: fixture.lease.lease.leaseIdentity,
          expectedLocatorIdentity: null,
        }),
      ),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_REVOKED" });
    expect(await readFile(locatorPath)).toEqual(before);
  }, 60_000);
});
