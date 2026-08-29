import { execFile } from "node:child_process";
import { mkdir, mkdtemp, open, readFile, readdir, symlink, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  I4_BASE_CONTEXT_PROVIDERS,
  I4_BASE_POLICY,
  assertPhysicalGenerationStable,
  observeCurrentTruth,
  serializeCurrentTruth,
} from "./lib/current-truth.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";
import { defineTaskContract, recordTaskContract } from "./lib/task-authorization.mjs";
import {
  inspectStateDomainCandidate,
  inspectBoundedWorktreePath,
  atomicReplaceJson,
  recordStateDomainBinding,
  reverifyStateDomain,
  withExclusiveLock,
  writeImmutableJson,
} from "./lib/state-domain.mjs";
import { PACK_LIFECYCLE_COMMANDS, runPackLifecycle } from "./manage-pack-lifecycle.mjs";
import { TASK_LIFECYCLE_COMMANDS, runTaskLifecycle } from "./manage-task-lifecycle.mjs";

const CIC_ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(CIC_ROOT, "../..");
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const hash = (value) => sha256Hex(`i4-boundary-test:${value}`);
const runFile = promisify(execFile);
const GIT_EXECUTABLE = path.join(process.env.ProgramFiles, "Git", "cmd", "git.exe");

function contextIntent() {
  return {
    reviewed: true,
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "NOT_APPLICABLE_WITH_REASON",
      materialIdentities: [],
      reason: `Reviewed boundary contract excludes ${dimension}`,
    })),
  };
}

const I4_PATHS = Object.freeze([
  "lib/current-truth.mjs",
  "lib/pack-lifecycle.mjs",
  "lib/state-domain.mjs",
  "lib/task-authorization.mjs",
  "lib/write-preimage.mjs",
  "manage-pack-lifecycle.mjs",
  "manage-task-lifecycle.mjs",
  "pack-lifecycle.test.mjs",
  "task-authorization.test.mjs",
  "task-pack-boundary.test.mjs",
  "write-preimage.test.mjs",
]);

const CLOSED_I1_I2_PATHS = Object.freeze([
  "execution-capabilities.test.mjs",
  "lib/canonical-json.mjs",
  "lib/execution-capabilities.mjs",
  "lib/identity.mjs",
  "lib/readonly-git.mjs",
  "lib/repository-identity.mjs",
  "lib/source-generation.mjs",
  "lib/source-manifest.mjs",
  "product-boundary.test.mjs",
  "repository-boundary.test.mjs",
  "repository-identity.test.mjs",
  "source-generation.test.mjs",
  "verify-repository-identity.mjs",
  "verify-source-generation.mjs",
]);

const PRODUCTION_PATHS = Object.freeze([
  "lib/current-truth.mjs",
  "lib/pack-lifecycle.mjs",
  "lib/state-domain.mjs",
  "lib/task-authorization.mjs",
  "lib/write-preimage.mjs",
  "manage-pack-lifecycle.mjs",
  "manage-task-lifecycle.mjs",
]);

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

beforeAll(async () => {
  await acquireSerializationLock();
  const temporary = await mkdtemp(path.join(tmpdir(), "cic-i4-boundary-"));
  const stateRoot = path.join(temporary, "state");
  const worktreeRoot = REPOSITORY_ROOT;
  await mkdir(stateRoot, { recursive: true });
  const portableWorktreeIdentity = hash("worktree");
  const task = defineTaskContract({
    taskIdentity: hash("stable-task"),
    taskName: "i4-boundary",
    repositoryIdentity: REPOSITORY_IDENTITY,
    portableWorktreeIdentity,
    scope: ["alpha.txt"],
    owners: ["owner"],
    semanticOwners: ["semantic-owner-boundary"],
    contextIntent: contextIntent(),
  });
  const domainInput = {
    repositoryRoot: REPOSITORY_ROOT,
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
    stateRoot,
    worktreeRoot,
    portableWorktreeIdentity,
    task,
    domainInput,
    domain,
  };
}, 1_500_000);

afterAll(async () => {
  if (serializationHandle) {
    await serializationHandle.close();
    await unlink(SERIALIZATION_LOCK);
  }
});

async function recursiveFiles(root, prefix = "") {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const relative = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory())
      result.push(...(await recursiveFiles(path.join(root, entry.name), relative)));
    else if (entry.isFile()) result.push(relative);
  }
  return result.sort();
}

describe("CIC-I4 public, dependency, and side-effect boundary", () => {
  it("contains the exact mandatory eleven-path I4 slice without weakening closed I1/I2 inventory", async () => {
    const files = await recursiveFiles(CIC_ROOT);
    expect(I4_PATHS.every((candidate) => files.includes(candidate))).toBe(true);
    expect(CLOSED_I1_I2_PATHS.every((candidate) => files.includes(candidate))).toBe(true);
    expect(I4_PATHS).toHaveLength(11);
    expect(new Set(I4_PATHS).size).toBe(11);
  });

  it("keeps production modules free of child process, shell, dynamic import, and ambient network", async () => {
    for (const relativePath of PRODUCTION_PATHS) {
      const source = await readFile(path.join(CIC_ROOT, relativePath), "utf8");
      expect(source).not.toMatch(
        /node:child_process|\bexecFile\b|\bspawn\b|\bfetch\s*\(|\bimport\s*\(/u,
      );
      expect(source).not.toMatch(/https?:\/\//u);
    }
  });

  it("keeps pack-store authority separate from write-preimage and worktree writes", async () => {
    const pack = await readFile(path.join(CIC_ROOT, "lib/pack-lifecycle.mjs"), "utf8");
    expect(pack).not.toContain("write-preimage");
    const preimage = await readFile(path.join(CIC_ROOT, "lib/write-preimage.mjs"), "utf8");
    expect(preimage).not.toMatch(/\bwriteFile\b|\brename\b|\btruncate\b|\bunlink\b/u);
  });

  it("exposes exactly the reviewed task and pack command sets", () => {
    expect(TASK_LIFECYCLE_COMMANDS).toEqual([
      "accept-successor-checkpoint",
      "acquire-lease",
      "admit-authorization",
      "inspect-state-domain",
      "record-owner-decision",
      "record-state-domain-binding",
      "record-task-contract",
      "release-lease",
      "revoke-authorization",
      "seal-write-preimage",
      "verify-authorization",
    ]);
    expect(PACK_LIFECYCLE_COMMANDS).toEqual([
      "activate",
      "generate",
      "inspect",
      "invalidate",
      "verify",
    ]);
  });

  it("rejects arbitrary public operations instead of dispatching caller execution", async () => {
    await expect(runTaskLifecycle("eval", {})).rejects.toMatchObject({ code: "CLI_USAGE_INVALID" });
    await expect(runPackLifecycle("shell", {})).rejects.toMatchObject({
      code: "CLI_USAGE_INVALID",
    });
  });

  it("binds one repo-external state root and emits no absolute path in portable inspection", async () => {
    const portable = await runTaskLifecycle("inspect-state-domain", fixture.domainInput);
    expect(portable.portableStateDomainIdentity).toBe(fixture.domain.portableStateDomainIdentity);
    expect(JSON.stringify(portable)).not.toContain(fixture.temporary);
    const differentRoot = path.join(fixture.temporary, "different-state");
    await expect(
      reverifyStateDomain({ ...fixture.domainInput, stateRoot: differentRoot }),
    ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });
  }, 30_000);

  it("rejects a same-identity clone as a different physical repository/worktree root", async () => {
    const alternateWorktree = path.join(fixture.temporary, "alternate-worktree");
    await runFile(
      GIT_EXECUTABLE,
      ["clone", "--local", "--no-hardlinks", REPOSITORY_ROOT, alternateWorktree],
      { windowsHide: true },
    );
    await runFile(
      GIT_EXECUTABLE,
      [
        "-C",
        alternateWorktree,
        "remote",
        "set-url",
        "origin",
        "https://github.com/caosvein/retrostage-maker.git",
      ],
      { windowsHide: true },
    );
    await expect(
      inspectStateDomainCandidate({ ...fixture.domainInput, worktreeRoot: alternateWorktree }),
    ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });
  }, 30_000);

  it("physically binds repository/worktree roots to one repository and keeps state outside both", async () => {
    const otherRepository = path.join(fixture.temporary, "independent-repository");
    await runFile(
      GIT_EXECUTABLE,
      ["clone", "--local", "--no-hardlinks", REPOSITORY_ROOT, otherRepository],
      { windowsHide: true },
    );
    await runFile(
      GIT_EXECUTABLE,
      [
        "-C",
        otherRepository,
        "remote",
        "set-url",
        "origin",
        "https://github.com/caosvein/retrostage-maker.git",
      ],
      { windowsHide: true },
    );
    const fakeRepositoryRoot = path.join(fixture.temporary, "fake-repository-root");
    const stateInsideRealWorktree = path.join(otherRepository, "state-inside-real-worktree");
    await mkdir(fakeRepositoryRoot);
    await mkdir(stateInsideRealWorktree);
    await expect(
      inspectStateDomainCandidate({
        ...fixture.domainInput,
        repositoryRoot: fakeRepositoryRoot,
        worktreeRoot: otherRepository,
        stateRoot: stateInsideRealWorktree,
      }),
    ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });
    await expect(readdir(stateInsideRealWorktree)).resolves.toEqual([]);
    await expect(
      inspectStateDomainCandidate({
        ...fixture.domainInput,
        repositoryRoot: REPOSITORY_ROOT,
        worktreeRoot: otherRepository,
      }),
    ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });

    const nestedStateRoot = path.join(otherRepository, "repo-external-state-bypass");
    await mkdir(nestedStateRoot);
    await expect(
      inspectStateDomainCandidate({
        ...fixture.domainInput,
        repositoryRoot: otherRepository,
        worktreeRoot: otherRepository,
        stateRoot: nestedStateRoot,
      }),
    ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });
    await expect(readdir(nestedStateRoot)).resolves.toEqual([]);

    const linkedWorktree = path.join(fixture.temporary, "linked-other-worktree");
    await runFile(
      GIT_EXECUTABLE,
      ["-C", otherRepository, "worktree", "add", "--detach", linkedWorktree, "HEAD"],
      { windowsHide: true },
    );
    const linkedStateRoot = path.join(linkedWorktree, "state-inside-linked-worktree");
    await mkdir(linkedStateRoot);
    try {
      await expect(
        inspectStateDomainCandidate({
          ...fixture.domainInput,
          repositoryRoot: otherRepository,
          worktreeRoot: linkedWorktree,
          stateRoot: linkedStateRoot,
        }),
      ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });
      await expect(readdir(linkedStateRoot)).resolves.toEqual([]);
    } finally {
      await runFile(
        GIT_EXECUTABLE,
        ["-C", otherRepository, "worktree", "remove", "--force", linkedWorktree],
        {
          windowsHide: true,
        },
      );
    }
  }, 90_000);

  it("fails closed when any physical GEN_START/GEN_END fact moves", () => {
    const generation = {
      authorityIdentity: hash("authority"),
      sourceGenerationFingerprint: hash("source"),
      repositoryIdentity: REPOSITORY_IDENTITY,
      repositorySnapshotIdentity: hash("snapshot"),
      capabilityFingerprint: hash("capabilities"),
      taskMaterialFingerprint: hash("materials"),
      localWorktreeBindingIdentity: fixture.domain.localWorktreeBindingIdentity,
      localStateStoreBindingIdentity: fixture.domain.localStateStoreBindingIdentity,
      movement: "STABLE",
    };
    expect(() => assertPhysicalGenerationStable(generation, { ...generation })).not.toThrow();
    for (const key of [
      "sourceGenerationFingerprint",
      "repositorySnapshotIdentity",
      "capabilityFingerprint",
      "taskMaterialFingerprint",
      "localWorktreeBindingIdentity",
    ]) {
      expect(() =>
        assertPhysicalGenerationStable(generation, { ...generation, [key]: hash(`moved-${key}`) }),
      ).toThrowError(expect.objectContaining({ code: "CONTEXT_GENERATION_RACE" }));
    }
  });

  it("physically reobserves GEN_START instead of replaying the preflight observation", async () => {
    const source = await readFile(path.join(CIC_ROOT, "lib/current-truth.mjs"), "utf8");
    expect(
      source.match(/await observePhysicalGeneration\(input, domain, contextRequest\)/gu),
    ).toHaveLength(2);
    const callbackStart = source.indexOf("observeGeneration: async (phase) => {");
    const callbackEnd = source.indexOf("observeProviders:", callbackStart);
    expect(callbackStart).toBeGreaterThan(-1);
    expect(callbackEnd).toBeGreaterThan(callbackStart);
    const callback = source.slice(callbackStart, callbackEnd);
    expect(callback).toContain("await observePhysicalGeneration(input, domain, contextRequest)");
    expect(callback).not.toMatch(/\binitial\b/u);
  });

  it("requires complete reviewed task-bound context intent and rejects blanket N/A", () => {
    const base = {
      taskIdentity: hash("intent-task"),
      taskName: "intent-task",
      repositoryIdentity: REPOSITORY_IDENTITY,
      portableWorktreeIdentity: hash("intent-worktree"),
      scope: ["alpha.txt"],
      owners: ["owner"],
      semanticOwners: ["semantic-owner"],
    };
    expect(() => defineTaskContract(base)).toThrowError(
      expect.objectContaining({ code: "INPUT_SCHEMA_INVALID" }),
    );
    const incomplete = contextIntent();
    incomplete.dimensions.pop();
    expect(() => defineTaskContract({ ...base, contextIntent: incomplete })).toThrowError(
      expect.objectContaining({ code: "CONTEXT_PREREQUISITE_BLOCKED" }),
    );
    const blanket = contextIntent();
    blanket.dimensions[0].reason = "N/A";
    expect(() => defineTaskContract({ ...base, contextIntent: blanket })).toThrowError(
      expect.objectContaining({ code: "CONTEXT_PREREQUISITE_BLOCKED" }),
    );
    expect(
      defineTaskContract({ ...base, contextIntent: contextIntent() }).contextIntent,
    ).toMatchObject({
      reviewed: true,
    });
  });

  it("rejects state and worktree symlink or junction aliases at every bounded primitive", async () => {
    const outsideState = path.join(fixture.temporary, "outside-state");
    const stateAlias = path.join(fixture.stateRoot, "state-alias");
    await mkdir(outsideState);
    await symlink(outsideState, stateAlias, "junction");
    const aliasedRecord = path.join(stateAlias, "record.json");
    await expect(
      writeImmutableJson(aliasedRecord, { value: 1 }, "STATE_RECORD_CONFLICT", fixture.stateRoot),
    ).rejects.toMatchObject({ code: "STATE_PATH_BOUNDARY_VIOLATION" });
    await expect(
      atomicReplaceJson(aliasedRecord, { value: 2 }, fixture.stateRoot),
    ).rejects.toMatchObject({ code: "STATE_PATH_BOUNDARY_VIOLATION" });
    await expect(
      withExclusiveLock(
        path.join(stateAlias, "selector.lock"),
        "LOCK_CONFLICT",
        async () => undefined,
        fixture.stateRoot,
      ),
    ).rejects.toMatchObject({ code: "STATE_PATH_BOUNDARY_VIOLATION" });

    const physicalWorktree = path.join(fixture.temporary, "symlink-worktree");
    const outsideWorktree = path.join(fixture.temporary, "outside-worktree");
    const worktreeAlias = path.join(physicalWorktree, "alias");
    await mkdir(physicalWorktree);
    await mkdir(outsideWorktree);
    await symlink(outsideWorktree, worktreeAlias, "junction");
    await expect(
      inspectBoundedWorktreePath(physicalWorktree, "alias/file.txt", {
        allowMissingLeaf: true,
      }),
    ).rejects.toMatchObject({ code: "WRITE_PREIMAGE_MISMATCH" });
  });

  it("keeps stable task identity separate from immutable contract generations", async () => {
    const revised = defineTaskContract({
      taskIdentity: fixture.task.taskIdentity,
      taskName: fixture.task.taskName,
      repositoryIdentity: REPOSITORY_IDENTITY,
      portableWorktreeIdentity: fixture.portableWorktreeIdentity,
      scope: ["alpha.txt", "beta.txt"],
      owners: fixture.task.owners,
      semanticOwners: fixture.task.semanticOwners,
      contextIntent: contextIntent(),
    });
    expect(revised.taskIdentity).toBe(fixture.task.taskIdentity);
    expect(revised.taskContractIdentity).not.toBe(fixture.task.taskContractIdentity);
    expect(fixture.task.taskContractIdentity).toMatch(/^[0-9A-F]{64}$/u);
  });

  it("reaches the real I3 provider/compiler path in production with no hidden injection", async () => {
    const result = await observeCurrentTruth({
      ...fixture.domainInput,
      taskContractIdentity: fixture.task.taskContractIdentity,
      authorityIdentity: hash("authority"),
      materials: [],
    });
    expect(result.context).toMatchObject({ status: "VERIFIED", active: false });
    expect(result.contextCompilation).toMatchObject({ lifecycle: "VERIFIED_NON_ACTIVE" });
    expect(I4_BASE_CONTEXT_PROVIDERS).toEqual([]);
    expect(I4_BASE_POLICY.requiredRoles).toEqual([
      "TASK_CONTRACT",
      "OWNER_DECISION",
      "TASK_AUTHORIZATION",
      "WORKING_SET_CHECKPOINT",
      "CONTEXT_COMPILATION",
      "SOURCE_GENERATION_PROOF",
      "REPOSITORY_IDENTITY_PROOF",
    ]);
    expect(serializeCurrentTruth(result)).not.toContain(fixture.temporary);
  }, 30_000);

  it("rejects caller provider callbacks and observations before they can become authority", async () => {
    await expect(
      observeCurrentTruth({
        ...fixture.domainInput,
        taskContractIdentity: fixture.task.taskContractIdentity,
        authorityIdentity: hash("authority"),
        materials: [],
        providerCallback: () => ({ status: "PASS" }),
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_INVALID" });
    await expect(
      observeCurrentTruth({
        ...fixture.domainInput,
        taskContractIdentity: fixture.task.taskContractIdentity,
        authorityIdentity: hash("authority"),
        materials: [],
        providerObservation: { status: "PASS" },
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_INVALID" });
    await expect(
      observeCurrentTruth({
        ...fixture.domainInput,
        taskContractIdentity: fixture.task.taskContractIdentity,
        authorityIdentity: hash("authority"),
        materials: [],
        repositoryObservation: { status: "PASS" },
      }),
    ).rejects.toMatchObject({ code: "AUTHORIZATION_INVALID" });
    await expect(
      observeCurrentTruth({
        ...fixture.domainInput,
        portableWorktreeIdentity: hash("fabricated-worktree"),
        taskContractIdentity: fixture.task.taskContractIdentity,
        authorityIdentity: hash("authority"),
        materials: [],
      }),
    ).rejects.toMatchObject({ code: "STATE_STORE_BINDING_MISMATCH" });
  });

  it("blocks a required provider that is absent from the static I4 base registry", async () => {
    await expect(
      observeCurrentTruth({
        ...fixture.domainInput,
        taskContractIdentity: fixture.task.taskContractIdentity,
        authorityIdentity: hash("authority"),
        materials: [],
        providerRequests: [
          {
            requestId: "required-query",
            providerId: "not-admitted",
            capability: "repository.query",
            query: {},
          },
        ],
      }),
    ).rejects.toMatchObject({ code: "REQUIRED_PROVIDER_MISSING" });
  }, 30_000);
});
