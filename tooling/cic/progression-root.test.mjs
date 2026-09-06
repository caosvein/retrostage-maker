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
import { PROGRESSION_COMMANDS, runProgression } from "./manage-progression.mjs";
import {
  constructProgressionRoot,
  inspectActiveProgression,
  promoteProgressionRoot,
  verifyProgressionRoot,
} from "./lib/progression-root.mjs";
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
const hash = (value) => sha256Hex(`i7-progression-test:${value}`);
const semanticOwners = ["progression-root"];
const scope = ["tooling/cic/lib/progression-root.mjs"];

let temporary;
let worktreeRoot;
let serializationHandle;
const fixtures = new Map();
let proof;
const SERIALIZATION_LOCK = path.join(tmpdir(), `cic-i7-progression-tests-${process.ppid}.lock`);

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
  const task = defineTaskContract({
    taskIdentity: hash(`task-${label}`),
    taskName: `i7-${label}`,
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
    reasonClassification: "i7-progression-test",
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
    owner: "i7-progression-test",
    scope,
    semanticOwners,
  });
  return { label, stateRoot, domainInput, domain, task, authorityIdentity, admitted, lease };
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

function rootInput(fixture, overrides = {}) {
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
      evidenceIdentities: [hash(`bootstrap-evidence-${fixture.label}`)],
      nextAction: "Continue the exact governed CIC task.",
      forbiddenActions: ["COMMIT", "MUTATE_SOURCES", "PUSH", "STAGE"],
    },
    ...overrides,
  };
}

async function activateGenesis(fixture, overrides = {}) {
  const constructed = await constructProgressionRoot(rootInput(fixture, overrides));
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
    reasonClassification: "i7-revocation-test",
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

async function prepareProgressionProof() {
  const main = fixtureFor("main");
  const first = await constructProgressionRoot(rootInput(main));
  const second = await constructProgressionRoot(rootInput(main));
  const stored = await readFile(
    path.join(main.stateRoot, "progression-root", "roots", `${first.rootIdentity}.json`),
    "utf8",
  );
  const genesisPromotion = await promoteProgressionRoot({
    ...operationInput(main),
    rootIdentity: first.rootIdentity,
    leaseIdentity: main.lease.lease.leaseIdentity,
    expectedActiveRootIdentity: null,
    expectedParentRootIdentity: null,
    expectedGeneration: 1,
  });
  const genesisActive = await inspectActiveProgression(operationInput(main));
  const wrongGenerationCandidate = await constructProgressionRoot(
    rootInput(main, { generation: 2, parentRootIdentity: first.rootIdentity }),
  );
  const wrongGenesisExpectation = await errorOf(() =>
    promoteProgressionRoot({
      ...operationInput(main),
      rootIdentity: wrongGenerationCandidate.rootIdentity,
      leaseIdentity: main.lease.lease.leaseIdentity,
      expectedActiveRootIdentity: first.rootIdentity,
      expectedParentRootIdentity: first.rootIdentity,
      expectedGeneration: 3,
    }),
  );
  const afterWrongGenesisExpectation = await inspectActiveProgression(operationInput(main));

  const blocked = fixtureFor("blocked");
  const blockedBootstrap = {
    disposition: "BLOCKED",
    evidenceIdentities: [hash("blocked-evidence")],
    nextAction: "Obtain the missing reviewed evidence.",
    forbiddenActions: ["COMMIT", "MUTATE_SOURCES", "PUSH", "STAGE"],
  };
  await activateGenesis(blocked, { bootstrap: blockedBootstrap });
  const blockedActive = await inspectActiveProgression(operationInput(blocked));

  const predecessorPath = path.join(
    main.stateRoot,
    "progression-root",
    "roots",
    `${first.rootIdentity}.json`,
  );
  const predecessorBefore = await readFile(predecessorPath);
  const successor = await constructProgressionRoot(
    rootInput(main, {
      generation: 2,
      parentRootIdentity: first.rootIdentity,
      sessionWorkstream: {
        role: "SESSION_WORKSTREAM",
        identity: hash("successor-workstream"),
        locator: { kind: "EVIDENCE_ID", value: "successor-workstream" },
      },
    }),
  );
  const successorPromotion = await promoteProgressionRoot({
    ...operationInput(main),
    rootIdentity: successor.rootIdentity,
    leaseIdentity: main.lease.lease.leaseIdentity,
    expectedActiveRootIdentity: first.rootIdentity,
    expectedParentRootIdentity: first.rootIdentity,
    expectedGeneration: 2,
  });
  const predecessorAfter = await readFile(predecessorPath);
  const contenders = await Promise.all(
    ["a", "b"].map((label) =>
      constructProgressionRoot(
        rootInput(main, {
          generation: 3,
          parentRootIdentity: successor.rootIdentity,
          sessionWorkstream: {
            role: "SESSION_WORKSTREAM",
            identity: hash(`contender-${label}`),
            locator: { kind: "EVIDENCE_ID", value: `contender-${label}` },
          },
        }),
      ),
    ),
  );
  const contenderAttempts = await Promise.allSettled(
    contenders.map((candidate) =>
      promoteProgressionRoot({
        ...operationInput(main),
        rootIdentity: candidate.rootIdentity,
        leaseIdentity: main.lease.lease.leaseIdentity,
        expectedActiveRootIdentity: successor.rootIdentity,
        expectedParentRootIdentity: successor.rootIdentity,
        expectedGeneration: 3,
      }),
    ),
  );
  const contenderActive = await inspectActiveProgression(operationInput(main));
  const expectationCandidate = await constructProgressionRoot(
    rootInput(main, {
      generation: 4,
      parentRootIdentity: contenderActive.root.rootIdentity,
    }),
  );
  const expectationCommon = {
    ...operationInput(main),
    rootIdentity: expectationCandidate.rootIdentity,
    leaseIdentity: main.lease.lease.leaseIdentity,
  };
  const staleActiveError = await errorOf(() =>
    promoteProgressionRoot({
      ...expectationCommon,
      expectedActiveRootIdentity: hash("stale-active"),
      expectedParentRootIdentity: contenderActive.root.rootIdentity,
      expectedGeneration: 4,
    }),
  );
  const wrongParentError = await errorOf(() =>
    promoteProgressionRoot({
      ...expectationCommon,
      expectedActiveRootIdentity: contenderActive.root.rootIdentity,
      expectedParentRootIdentity: hash("wrong-parent"),
      expectedGeneration: 4,
    }),
  );
  const wrongGenerationError = await errorOf(() =>
    promoteProgressionRoot({
      ...expectationCommon,
      expectedActiveRootIdentity: contenderActive.root.rootIdentity,
      expectedParentRootIdentity: contenderActive.root.rootIdentity,
      expectedGeneration: 5,
    }),
  );

  const edge = fixtureFor("edge");
  const lineageErrors = {};
  for (const kind of ["ADVISORY", "PARALLEL"]) {
    const candidate = await constructProgressionRoot(
      rootInput(edge, { lineage: { kind, lineageIdentity: hash(`lineage-${kind}`) } }),
    );
    lineageErrors[kind] = await errorOf(() =>
      promoteProgressionRoot({
        ...operationInput(edge),
        rootIdentity: candidate.rootIdentity,
        leaseIdentity: edge.lease.lease.leaseIdentity,
        expectedActiveRootIdentity: null,
        expectedParentRootIdentity: null,
        expectedGeneration: 1,
      }),
    );
  }
  const revokedCandidate = await constructProgressionRoot(rootInput(edge));
  await revoke(edge);
  const revokedError = await errorOf(() =>
    promoteProgressionRoot({
      ...operationInput(edge),
      rootIdentity: revokedCandidate.rootIdentity,
      leaseIdentity: edge.lease.lease.leaseIdentity,
      expectedActiveRootIdentity: null,
      expectedParentRootIdentity: null,
      expectedGeneration: 1,
    }),
  );

  const integrity = fixtureFor("integrity");
  const integrityCandidate = await constructProgressionRoot(rootInput(integrity));
  const movementPath = path.join(worktreeRoot, "i7-currentness-movement.txt");
  await writeFile(movementPath, "movement\n", "utf8");
  const movementError = await errorOf(() =>
    verifyProgressionRoot({
      ...operationInput(integrity),
      rootIdentity: integrityCandidate.rootIdentity,
    }),
  );
  await unlink(movementPath);
  const rootPath = path.join(
    integrity.stateRoot,
    "progression-root",
    "roots",
    `${integrityCandidate.rootIdentity}.json`,
  );
  const tampered = JSON.parse(await readFile(rootPath, "utf8"));
  tampered.bootstrap.nextAction = "Tampered action.";
  await writeFile(rootPath, `${canonicalJson(tampered)}\n`, "utf8");
  const tamperError = await errorOf(() =>
    verifyProgressionRoot({
      ...operationInput(integrity),
      rootIdentity: integrityCandidate.rootIdentity,
    }),
  );
  const invalidCliError = await errorOf(() => runProgression("arbitrary-operation", {}));

  return {
    deterministic: { first, second, stored },
    genesis: { promotion: genesisPromotion, active: genesisActive },
    wrongGenesisExpectation,
    afterWrongGenesisExpectation,
    blockedBootstrap,
    blockedActive,
    successor,
    successorPromotion,
    predecessorBefore,
    predecessorAfter,
    contenders,
    contenderAttempts,
    contenderActive,
    staleActiveError,
    wrongParentError,
    wrongGenerationError,
    lineageErrors,
    revokedError,
    movementError,
    tamperError,
    invalidCliError,
  };
}

beforeAll(async () => {
  const alias = await mkdtemp(path.join(tmpdir(), "cic-i7-progression-"));
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
  for (const label of ["blocked", "edge", "integrity", "main"]) {
    fixtures.set(label, await createAuthorizedFixture(label));
  }
  proof = await prepareProgressionProof();
}, 900_000);

afterAll(async () => {
  if (serializationHandle) {
    await serializationHandle.close();
    await unlink(SERIALIZATION_LOCK);
  }
});

describe.sequential("CIC-I7 immutable progression root and single-winner promotion", () => {
  it("constructs deterministic content-addressed genesis bytes and preserves CTX-26 separation", () => {
    const { first, second, stored } = proof.deterministic;
    expect(second).toEqual(first);
    expect(first.root.currentControl.role).toBe("CURRENT_CONTROL");
    expect(first.root.sessionWorkstream.role).toBe("SESSION_WORKSTREAM");
    expect(first.root.currentControl).not.toEqual(first.root.sessionWorkstream);
    expect(stored).toBe(`${canonicalJson(first.root)}\n`);
    expect(first.root).not.toHaveProperty("timestamp");
  });

  it("activates genesis only through the exact null/null/generation-1 expectation", () => {
    const constructed = proof.deterministic.first;
    const promoted = proof.genesis.promotion;
    expect(promoted).toMatchObject({
      status: "ACTIVE",
      rootIdentity: constructed.rootIdentity,
      previousRootIdentity: null,
    });
    const active = proof.genesis.active;
    expect(active).toMatchObject({ status: "ACTIVE", usable: true });
    expect(active.root.bootstrap.disposition).toBe("PASS");
  });

  it("rejects a malformed genesis expectation without changing the active locator", () => {
    expect(proof.wrongGenesisExpectation).toMatchObject({
      code: "PROGRESSION_GENERATION_MISMATCH",
    });
    expect(proof.afterWrongGenesisExpectation).toMatchObject({ status: "ACTIVE" });
  });

  it("preserves an explicit BLOCKED bootstrap as durable root truth", () => {
    expect(proof.blockedActive.root.bootstrap).toEqual(proof.blockedBootstrap);
  });

  it("promotes an exact successor while the historical predecessor remains byte-stable", () => {
    expect(proof.successorPromotion.previousRootIdentity).toBe(
      proof.deterministic.first.rootIdentity,
    );
    expect(proof.predecessorAfter).toEqual(proof.predecessorBefore);
  });

  it("allows exactly one of two same-parent contenders to win", () => {
    expect(proof.contenderAttempts.filter(({ status }) => status === "fulfilled")).toHaveLength(1);
    expect(proof.contenderAttempts.filter(({ status }) => status === "rejected")).toHaveLength(1);
    expect(proof.contenders.map(({ rootIdentity }) => rootIdentity)).toContain(
      proof.contenderActive.root.rootIdentity,
    );
  });

  it("rejects stale active-root, wrong parent, and wrong generation expectations", () => {
    expect(proof.staleActiveError).toMatchObject({ code: "PROGRESSION_ACTIVE_ROOT_MISMATCH" });
    expect(proof.wrongParentError).toMatchObject({ code: "PROGRESSION_PARENT_MISMATCH" });
    expect(proof.wrongGenerationError).toMatchObject({ code: "PROGRESSION_GENERATION_MISMATCH" });
  });

  it.each(["ADVISORY", "PARALLEL"])("keeps %s descendants non-authoritative", (kind) => {
    expect(proof.lineageErrors[kind]).toMatchObject({ code: "PROGRESSION_LINEAGE_NOT_ACTIVE" });
  });

  it("rejects a revoked durable authorization even when a prior lease still exists", () => {
    expect(proof.revokedError).toMatchObject({ code: "PROGRESSION_AUTHORITY_INVALID" });
  });

  it("fails closed when physical repository currentness moves", () => {
    expect(proof.movementError).toMatchObject({ code: "PROGRESSION_CURRENTNESS_STALE" });
  });

  it("detects content tampering in an immutable root object", () => {
    expect(proof.tamperError).toMatchObject({ code: "PROGRESSION_ROOT_INVALID" });
  });

  it("never emits publication or Source-mutation authority", () => {
    const constructed = proof.deterministic.first;
    const promoted = proof.contenderAttempts.find(({ status }) => status === "fulfilled").value;
    for (const artifact of [constructed.root, constructed.lifecycle, promoted]) {
      expect(artifact).not.toHaveProperty("authorityGrants");
      expect(artifact).not.toHaveProperty("actions");
    }
    expect(promoted.root.bootstrap.forbiddenActions).toEqual([
      "COMMIT",
      "MUTATE_SOURCES",
      "PUSH",
      "STAGE",
    ]);
  });

  it("exposes only the narrow governed CLI command family", () => {
    expect(PROGRESSION_COMMANDS).toEqual([
      "construct-root",
      "create-recovery-capsule",
      "inspect-active",
      "promote-root",
      "recover-current",
      "verify-recovery-capsule",
      "verify-root",
    ]);
    expect(proof.invalidCliError).toMatchObject({ code: "CLI_USAGE_INVALID" });
  });
});
