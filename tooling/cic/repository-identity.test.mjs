import { Buffer } from "node:buffer";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { REQUIRED_I2_CAPABILITIES } from "./lib/execution-capabilities.mjs";
import {
  classifyMutationSafety,
  detectPathCollisions,
  finalizeRepositoryObservation,
  normalizeRemoteIdentity,
  observeRepositoryIdentity,
  repositoryIdentity,
  verifyRepositoryIdentity,
} from "./lib/repository-identity.mjs";
import { createReadonlyGitRunner } from "./lib/readonly-git.mjs";
import { formatJsonResult, run } from "./verify-repository-identity.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const HEAD = "03fb4884522a434946f57131af4880b04cced522";
const TREE = "037906ea83082dbbac49b24b4896d3a81b8e73bb";
const SOURCE_FINGERPRINT = "F3CA72E7F199DAC701270E7E9611AE10921685579F9AF38D5060F1920BDCCBAB";
const REPOSITORY_IDENTITY = "D1847AD57E4D92862E32419FFDF36061BD30AA2B37ECA74E28E3036B9CC1A40A";
const EMPTY_SHA256 = "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855";

function baseFacts() {
  return {
    capabilityEvidence: { available: [...REQUIRED_I2_CAPABILITIES], unknown: [] },
    environment: {
      architecture: "x64",
      commonGitDirectoryHash: "C".repeat(64),
      gitDirectoryHash: "D".repeat(64),
      gitExecutablePathHash: "E".repeat(64),
      gitExecutableSha256: "F".repeat(64),
      gitVersion: "git version fixture",
      linkedWorktreeLocationHashes: ["W".repeat(64)],
      nodeVersion: "v24.19.0",
      platform: "win32",
      repositoryRootHash: "R".repeat(64),
    },
    head: {
      branch: { state: "SYMBOLIC", ref: "refs/heads/main" },
      commit: HEAD,
      subject: "tooling: fix CIC verifier dead-code export",
      tree: TREE,
      upstream: {
        state: "PRESENT",
        ref: "origin/main",
        commit: HEAD,
        mergeBase: HEAD,
        ahead: 0,
        behind: 0,
      },
    },
    index: {
      entries: [{ mode: "100644", objectId: "a".repeat(40), path: "tracked.txt", stage: 0 }],
      fingerprint: "I".repeat(64),
      unmergedStageCount: 0,
      visibility: {
        assumeUnchangedCount: 0,
        fingerprint: "V".repeat(64),
        skipWorktreeCount: 0,
      },
    },
    linkedWorktrees: [
      {
        branch: { state: "SYMBOLIC", ref: "refs/heads/main" },
        head: HEAD,
        locked: false,
        prunable: false,
      },
    ],
    observationErrors: [],
    operations: {
      bisect: "ABSENT_PROVEN",
      cherryPick: "ABSENT_PROVEN",
      merge: "ABSENT_PROVEN",
      rebase: "ABSENT_PROVEN",
      revert: "ABSENT_PROVEN",
    },
    repository: {
      configuredRemoteIdentities: ["github.com/caosvein/retrostage-maker"],
      objectFormat: "sha1",
      primaryRemote: "github.com/caosvein/retrostage-maker",
    },
    sourceGeneration: { status: "PASS", fingerprint: SOURCE_FINGERPRINT },
    staged: { bytes: 0, sha256: EMPTY_SHA256 },
    stash: { state: "ABSENT_PROVEN", tip: null, count: 0 },
    trackedPaths: ["tracked.txt"],
    unstaged: { bytes: 0, sha256: EMPTY_SHA256 },
    untracked: { entries: [] },
    view: {
      bare: false,
      externalConfig: false,
      externalFilters: false,
      historyOverlay: false,
      insideWorktree: true,
      missingObjects: false,
      nested: false,
      partial: false,
      shallow: false,
      sparse: false,
    },
  };
}

function finalized(update = () => {}) {
  const facts = JSON.parse(JSON.stringify(baseFacts()));
  update(facts);
  return finalizeRepositoryObservation(facts);
}

function gitOutcome(stdout = "", exitCode = 0) {
  return {
    errorCode: null,
    exitCode,
    stderr: new Uint8Array(),
    stdout: Buffer.from(stdout),
  };
}

function fixtureGit(repositoryRoot, overrides = {}, calls = []) {
  const objectId = "a".repeat(40);
  const operations = {
    aheadBehind: gitOutcome("0 0\n"),
    bare: gitOutcome("false\n"),
    branchRef: gitOutcome("refs/heads/main\n"),
    branchUpstreamConfig: gitOutcome(
      "branch.main.remote\norigin\0branch.main.merge\nrefs/heads/main\0",
    ),
    commonDir: gitOutcome(path.join(repositoryRoot, ".git") + "\n"),
    externalConfigLocal: gitOutcome("", 1),
    externalConfigWorktree: gitOutcome("", 1),
    filterDrivers: gitOutcome("", 1),
    gitDir: gitOutcome(path.join(repositoryRoot, ".git") + "\n"),
    head: gitOutcome(HEAD + "\n"),
    headSubject: gitOutcome("fixture subject\n"),
    headTree: gitOutcome(TREE + "\n"),
    indexEntries: gitOutcome(`100644 ${objectId} 0\ttracked.txt\0`),
    indexVisibility: gitOutcome("H tracked.txt\0"),
    insideWorktree: gitOutcome("true\n"),
    mergeBase: gitOutcome(HEAD + "\n"),
    missingObjectWitness: gitOutcome(),
    objectFormat: gitOutcome("sha1\n"),
    partialCloneConfig: gitOutcome("", 1),
    remoteUrls: gitOutcome("remote.origin.url\nhttps://github.com/caosvein/retrostage-maker.git\0"),
    replaceRefs: gitOutcome(),
    shallow: gitOutcome("false\n"),
    sparseCheckout: gitOutcome("", 1),
    stagedDiff: gitOutcome(),
    stashCount: gitOutcome("1\n"),
    stashTip: gitOutcome("", 128),
    superprojectRoot: gitOutcome(),
    topLevel: gitOutcome(repositoryRoot + "\n"),
    trackedPaths: gitOutcome("tracked.txt\0"),
    unstagedDiff: gitOutcome(),
    untrackedPaths: gitOutcome(),
    upstreamCommit: gitOutcome(HEAD + "\n"),
    upstreamRef: gitOutcome("origin/main\n"),
    version: gitOutcome("git version fixture\n"),
    worktrees: gitOutcome(`worktree ${repositoryRoot}\0HEAD ${HEAD}\0branch refs/heads/main\0\0`),
  };
  return async (_root, operationId) => {
    calls.push(operationId);
    return overrides[operationId] ?? operations[operationId];
  };
}

async function observed(repositoryRoot = REPOSITORY_ROOT, overrides = {}, calls = []) {
  return observeRepositoryIdentity(repositoryRoot, {
    runGit: fixtureGit(repositoryRoot, overrides, calls),
    sourceGenerationProvider: async () => ({
      generationFingerprint: SOURCE_FINGERPRINT,
      status: "PASS",
    }),
  });
}

describe("CIC-I2 repository and worktree identity", () => {
  it("passes the current physical repository with canonical identity and raw HEAD coherence", async () => {
    const rawRunner = createReadonlyGitRunner(REPOSITORY_ROOT);
    const rawHead = rawRunner.run("head");
    const rawTree = rawRunner.run("headTree");
    expect(rawHead.exitCode).toBe(0);
    expect(rawTree.exitCode).toBe(0);
    const currentHead = Buffer.from(rawHead.stdout).toString("utf8").trim();
    const currentTree = Buffer.from(rawTree.stdout).toString("utf8").trim();

    const outcome = await run([], REPOSITORY_ROOT);
    expect(outcome).toMatchObject({ exitCode: 0, stderr: "" });
    expect(outcome.stdout).toContain(REPOSITORY_IDENTITY);
    const json = await run(["--json"], REPOSITORY_ROOT);
    const result = JSON.parse(json.stdout);
    expect(result).toMatchObject({
      status: "PASS",
      repository: {
        objectFormat: "sha1",
        primaryRemote: "github.com/caosvein/retrostage-maker",
        repositoryIdentity: REPOSITORY_IDENTITY,
      },
      sourceGeneration: { status: "PASS", fingerprint: SOURCE_FINGERPRINT },
      head: {
        commit: currentHead,
        tree: currentTree,
        branch: { state: "SYMBOLIC", ref: "refs/heads/main" },
      },
      view: {
        bare: false,
        shallow: false,
        sparse: false,
        partial: false,
        nested: false,
        missingObjects: false,
        complete: true,
      },
    });
    expect(result.worktree.linkedWorktrees).toEqual(
      expect.arrayContaining([expect.objectContaining({ head: currentHead })]),
    );
  }, 15_000);

  it("normalizes HTTPS, SSH and scp remotes to one credential-free identity", () => {
    for (const remote of [
      "https://github.com/caosvein/retrostage-maker.git",
      "https://user:secret@github.com/caosvein/retrostage-maker.git?token=secret#fragment",
      "ssh://git@github.com/caosvein/retrostage-maker.git",
      "git@github.com:caosvein/retrostage-maker.git",
    ]) {
      expect(normalizeRemoteIdentity(remote)).toBe("github.com/caosvein/retrostage-maker");
    }
  });

  it("blocks unsupported remote syntax without echoing it", () => {
    expect(() => normalizeRemoteIdentity("C:/secret/repository")).toThrow(
      "REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED",
    );
  });

  it("blocks malformed scp credential-like syntax without leaking it", () => {
    const secretRemote = "user:pass@github.com:caosvein/retrostage-maker.git";
    let message = "";
    try {
      normalizeRemoteIdentity(secretRemote);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toBe("REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED");
    expect(message).not.toContain(secretRemote);
    expect(message).not.toContain("pass@");
  });

  it("derives the frozen current repository identity formula", () => {
    expect(repositoryIdentity("sha1", "github.com/caosvein/retrostage-maker")).toBe(
      REPOSITORY_IDENTITY,
    );
  });

  it("distinguishes complete dirty tracked state from unknown state", () => {
    const result = finalized((facts) => {
      facts.unstaged = { bytes: 8, sha256: "U".repeat(64) };
    }).result;
    expect(result.status).toBe("PASS");
    expect(result.worktree).toMatchObject({ clean: false, mutationSafety: "DIRTY_COMPLETE" });
    expect(classifyMutationSafety({ complete: false, clean: false, operationActive: false })).toBe(
      "VIEW_INCOMPLETE",
    );
  });

  it("changes staged and index fingerprints deterministically", () => {
    const clean = finalized().result;
    const dirty = finalized((facts) => {
      facts.index.fingerprint = "J".repeat(64);
      facts.staged = { bytes: 4, sha256: "S".repeat(64) };
    }).result;
    expect(dirty.status).toBe("PASS");
    expect(dirty.worktree.index.fingerprint).not.toBe(clean.worktree.index.fingerprint);
    expect(dirty.worktree.staged).toEqual({ bytes: 4, sha256: "S".repeat(64) });
    expect(dirty.snapshotFingerprint).not.toBe(clean.snapshotFingerprint);
  });

  it("represents exact untracked regular-file and non-followed symlink identities", () => {
    const result = finalized((facts) => {
      facts.untracked.entries = [
        { path: "new.txt", kind: "REGULAR_FILE", bytes: 3, sha256: "A".repeat(64) },
        { path: "pointer", kind: "SYMBOLIC_LINK", bytes: 10, sha256: "B".repeat(64) },
      ];
    }).result;
    expect(result.status).toBe("PASS");
    expect(result.worktree.untracked).toMatchObject({ count: 2, state: "COMPLETE" });
    expect(result.worktree.untracked.entries[1]).toEqual({
      path: "pointer",
      kind: "SYMBOLIC_LINK",
      bytes: 10,
      sha256: "B".repeat(64),
    });
  });

  it("blocks an unavailable untracked object", () => {
    const result = finalized((facts) => {
      facts.untracked.entries = [{ path: "special", kind: "UNKNOWN", bytes: null, sha256: null }];
      facts.observationErrors.push({
        code: "WORKTREE_UNTRACKED_OBJECT_UNAVAILABLE",
        detail: "path=special",
      });
    }).result;
    expect(result.status).toBe("BLOCKED");
    expect(result.errors.map(({ code }) => code)).toContain(
      "WORKTREE_UNTRACKED_OBJECT_UNAVAILABLE",
    );
  });

  it("represents stash state deterministically without making the worktree dirty", () => {
    const result = finalized((facts) => {
      facts.stash = { state: "PRESENT", tip: "b".repeat(40), count: 2 };
    }).result;
    expect(result.status).toBe("PASS");
    expect(result.worktree.clean).toBe(true);
    expect(result.worktree.stash).toEqual({ state: "PRESENT", tip: "b".repeat(40), count: 2 });
  });

  it("represents detached HEAD explicitly and missing upstream as ABSENT_PROVEN", () => {
    const result = finalized((facts) => {
      facts.head.branch = { state: "DETACHED", ref: null };
      facts.head.upstream = {
        state: "ABSENT_PROVEN",
        ref: null,
        commit: null,
        mergeBase: null,
        ahead: null,
        behind: null,
      };
    }).result;
    expect(result.status).toBe("PASS");
    expect(result.head.branch).toEqual({ state: "DETACHED", ref: null });
    expect(result.head.upstream.state).toBe("ABSENT_PROVEN");
  });

  it("captures upstream commit, merge-base and ahead/behind", () => {
    const result = finalized((facts) => {
      facts.head.upstream = {
        state: "PRESENT",
        ref: "origin/main",
        commit: "c".repeat(40),
        mergeBase: "d".repeat(40),
        ahead: 3,
        behind: 2,
      };
    }).result;
    expect(result.head.upstream).toMatchObject({ ahead: 3, behind: 2, mergeBase: "d".repeat(40) });
  });

  it("blocks a configured but unresolved upstream instead of proving absence", async () => {
    const result = (await observed(REPOSITORY_ROOT, { upstreamRef: gitOutcome("", 128) })).result;
    expect(result.status).toBe("BLOCKED");
    expect(result.head.upstream.state).toBe("UNKNOWN");
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining(["REPOSITORY_UPSTREAM_UNRESOLVED", "REPOSITORY_VIEW_INCOMPLETE"]),
    );
  });

  it("proves upstream absence only when current-branch configuration is absent", async () => {
    const result = (
      await observed(REPOSITORY_ROOT, {
        branchUpstreamConfig: gitOutcome("", 1),
        upstreamRef: gitOutcome("", 128),
      })
    ).result;
    expect(result.status).toBe("PASS");
    expect(result.head.upstream.state).toBe("ABSENT_PROVEN");
  });

  it.each([1, 2])("reports %i stash reflog entries from the closed witness", async (count) => {
    const result = (
      await observed(REPOSITORY_ROOT, {
        stashCount: gitOutcome(`${count}\n`),
        stashTip: gitOutcome("b".repeat(40) + "\n"),
      })
    ).result;
    expect(result.status).toBe("PASS");
    expect(result.worktree.stash).toEqual({
      state: "PRESENT",
      tip: "b".repeat(40),
      count,
    });
  });

  it.each([
    ["shallow", "REPOSITORY_SHALLOW_VIEW"],
    ["sparse", "REPOSITORY_SPARSE_VIEW"],
    ["partial", "REPOSITORY_PARTIAL_CLONE_VIEW"],
    ["nested", "REPOSITORY_NESTED_VIEW"],
    ["missingObjects", "REPOSITORY_MISSING_OBJECT"],
  ])("blocks an incomplete %s repository view", (property, errorCode) => {
    const result = finalized((facts) => {
      facts.view[property] = true;
    }).result;
    expect(result.status).toBe("BLOCKED");
    expect(result.snapshotFingerprint).toBeNull();
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining([errorCode, "REPOSITORY_VIEW_INCOMPLETE"]),
    );
  });

  it.each([
    ["skip-worktree", "S tracked.txt\0", "REPOSITORY_SPARSE_VIEW"],
    ["assume-unchanged", "h tracked.txt\0", "REPOSITORY_INDEX_VISIBILITY_UNSUPPORTED"],
  ])("blocks hidden physical worktree state from %s", async (_flag, visibility, errorCode) => {
    const result = (await observed(REPOSITORY_ROOT, { indexVisibility: gitOutcome(visibility) }))
      .result;
    expect(result.status).toBe("BLOCKED");
    expect(result.snapshotFingerprint).toBeNull();
    expect(result.worktree.mutationSafety).toBe("VIEW_INCOMPLETE");
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining([errorCode, "REPOSITORY_VIEW_INCOMPLETE"]),
    );
  });

  it("binds supported index visibility into the portable snapshot", async () => {
    const first = (await observed()).result;
    const second = (
      await observed(REPOSITORY_ROOT, { indexVisibility: gitOutcome("H other.txt\0") })
    ).result;
    expect(first.status).toBe("PASS");
    expect(second.status).toBe("PASS");
    expect(second.worktree.index.visibility).toMatchObject({
      assumeUnchangedCount: 0,
      skipWorktreeCount: 0,
    });
    expect(second.snapshotFingerprint).not.toBe(first.snapshotFingerprint);
  });

  it("blocks repository-local external ignore or attributes delegation", async () => {
    const result = (
      await observed(REPOSITORY_ROOT, {
        externalConfigLocal: gitOutcome("core.excludesfile\nC:/outside/ignore\0"),
      })
    ).result;
    expect(result.status).toBe("BLOCKED");
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "REPOSITORY_EXTERNAL_CONFIG_UNSUPPORTED",
        "REPOSITORY_VIEW_INCOMPLETE",
      ]),
    );
  });

  it("blocks an unsupported gitlink/submodule index view", () => {
    const result = finalized((facts) => {
      facts.index.entries.push({
        mode: "160000",
        objectId: "e".repeat(40),
        path: "vendor/submodule",
        stage: 0,
      });
      facts.trackedPaths.push("vendor/submodule");
    }).result;
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "REPOSITORY_SUBMODULE_VIEW_UNSUPPORTED",
        "REPOSITORY_VIEW_INCOMPLETE",
      ]),
    );
  });

  it("detects exact, case-folded and Unicode NFC path collisions", () => {
    expect(detectPathCollisions(["same", "same"]).map(({ kind }) => kind)).toContain("EXACT");
    expect(detectPathCollisions(["File.txt", "file.txt"]).map(({ kind }) => kind)).toContain(
      "CASE_FOLDED",
    );
    expect(
      detectPathCollisions(["caf\u00e9.txt", "cafe\u0301.txt"]).map(({ kind }) => kind),
    ).toContain("UNICODE_NFC");
    const blocked = finalized((facts) => {
      facts.trackedPaths = ["File.txt", "file.txt"];
    }).result;
    expect(blocked.errors.map(({ code }) => code)).toContain("CONTEXT_IDENTITY_COLLISION");
  });

  it("deduplicates unmerged stage multiplicity before path-union collision analysis", () => {
    const result = finalized((facts) => {
      facts.trackedPaths = ["conflict.txt", "conflict.txt", "conflict.txt"];
      facts.index.entries = [1, 2, 3].map((stage) => ({
        mode: "100644",
        objectId: String(stage).repeat(40),
        path: "conflict.txt",
        stage,
      }));
      facts.index.unmergedStageCount = 3;
    }).result;
    expect(result.errors.map(({ code }) => code)).not.toContain("CONTEXT_IDENTITY_COLLISION");
    expect(result.worktree.index).toMatchObject({ entryCount: 3, unmergedStageCount: 3 });
    expect(result.worktree.mutationSafety).toBe("DIRTY_COMPLETE");
  });

  it("still blocks a true tracked-to-untracked exact path collision", () => {
    const result = finalized((facts) => {
      facts.trackedPaths = ["shared.txt"];
      facts.untracked.entries = [
        {
          bytes: 1,
          kind: "REGULAR_FILE",
          path: "shared.txt",
          sha256: "A".repeat(64),
        },
      ];
    }).result;
    expect(result.errors.map(({ code }) => code)).toContain("CONTEXT_IDENTITY_COLLISION");
  });

  it("blocks two individually valid but differing observations as a snapshot race", async () => {
    const first = finalized();
    const second = finalized((facts) => {
      facts.unstaged = { bytes: 1, sha256: "F".repeat(64) };
    });
    let call = 0;
    const result = await verifyRepositoryIdentity("unused", async () => {
      call += 1;
      return call === 1 ? first : second;
    });
    expect(first.result.status).toBe("PASS");
    expect(second.result.status).toBe("PASS");
    expect(result.status).toBe("BLOCKED");
    expect(result.snapshotFingerprint).toBeNull();
    expect(result.errors.map(({ code }) => code)).toContain("REPOSITORY_SNAPSHOT_RACE");
  });

  it("never launders a first BLOCKED observation through an equal-coherence PASS", async () => {
    const passed = finalized();
    const firstError = {
      code: "REPOSITORY_REMOTE_IDENTITY_UNSUPPORTED",
      detail: "configured-remote",
    };
    const first = {
      coherenceFingerprint: "X",
      result: {
        ...passed.result,
        status: "BLOCKED",
        snapshotFingerprint: null,
        errors: [firstError],
      },
    };
    const second = { coherenceFingerprint: "X", result: passed.result };
    let call = 0;
    const result = await verifyRepositoryIdentity("unused", async () => {
      call += 1;
      return call === 1 ? first : second;
    });
    expect(call).toBe(2);
    expect(result.status).toBe("BLOCKED");
    expect(result.snapshotFingerprint).toBeNull();
    expect(result.errors).toContainEqual(firstError);
  });

  it.each([
    ["gitDir", "git.local.read"],
    ["commonDir", "git.local.read"],
    ["upstreamCommit", "git.refs.read"],
    ["mergeBase", "git.refs.read"],
    ["aheadBehind", "git.refs.read"],
    ["stashCount", "git.refs.read"],
    ["branchUpstreamConfig", "git.refs.read"],
    ["filterDrivers", "git.config.read"],
    ["externalConfigLocal", "git.config.read"],
    ["indexVisibility", "git.index.read"],
    ["replaceRefs", "git.refs.read"],
  ])("downgrades %s read failure to UNKNOWN %s capability", async (operationId, capability) => {
    const failure = gitOutcome("", 2);
    const overrides = { [operationId]: failure };
    if (operationId === "stashCount") overrides.stashTip = gitOutcome("b".repeat(40) + "\n");
    const result = (await observed(REPOSITORY_ROOT, overrides)).result;
    expect(result.status).toBe("BLOCKED");
    expect(result.capabilities.unknown).toContain(capability);
    expect(result.capabilities.available).not.toContain(capability);
  });

  it.each([
    ["trackedPaths", "git.worktree.read", Buffer.from([0xff, 0x2e, 0x74, 0x78, 0x74, 0x00])],
    [
      "indexEntries",
      "git.index.read",
      Buffer.concat([
        Buffer.from(`100644 ${"a".repeat(40)} 0\t`),
        Buffer.from([0xff, 0x2e, 0x74, 0x78, 0x74, 0x00]),
      ]),
    ],
    ["headSubject", "git.refs.read", Buffer.from([0xff, 0x0a])],
  ])(
    "rejects invalid UTF-8 from successful %s output and downgrades %s",
    async (operationId, capability, invalidOutput) => {
      const result = (await observed(REPOSITORY_ROOT, { [operationId]: gitOutcome(invalidOutput) }))
        .result;
      expect(result.status).toBe("BLOCKED");
      expect(result.snapshotFingerprint).toBeNull();
      expect(result.capabilities.unknown).toContain(capability);
      expect(result.capabilities.available).not.toContain(capability);
      expect(result.errors).toContainEqual({
        code: "GIT_READ_OPERATION_FAILED",
        detail: `operation=${operationId};encoding=INVALID_UTF8`,
      });
      expect(JSON.stringify(result)).not.toContain("�");
    },
  );

  it.each([
    ["PRESENT", gitOutcome("filter.evil.clean\nunsafe-command\0")],
    ["UNKNOWN", gitOutcome("", 2)],
  ])("never reaches worktree diff when filter-driver state is %s", async (_state, filterState) => {
    const calls = [];
    const result = (await observed(REPOSITORY_ROOT, { filterDrivers: filterState }, calls)).result;
    expect(calls).not.toContain("unstagedDiff");
    expect(result.status).toBe("BLOCKED");
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "REPOSITORY_EXTERNAL_FILTER_UNSUPPORTED",
        "REPOSITORY_VIEW_INCOMPLETE",
      ]),
    );
  });

  it("blocks replace-ref and graft overlay facts", () => {
    const result = finalized((facts) => {
      facts.view.historyOverlay = true;
    }).result;
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "REPOSITORY_HISTORY_OVERLAY_UNSUPPORTED",
        "REPOSITORY_VIEW_INCOMPLETE",
      ]),
    );
  });

  it("detects an independent parent repository marker without invoking Git there", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-nested-"));
    const outer = path.join(temporaryRoot, "outer");
    const inner = path.join(outer, "inner");
    try {
      await mkdir(path.join(outer, ".git"), { recursive: true });
      await mkdir(path.join(inner, ".git"), { recursive: true });
      const calls = [];
      const result = (await observed(inner, {}, calls)).result;
      expect(result.view.nested).toBe(true);
      expect(result.errors.map(({ code }) => code)).toEqual(
        expect.arrayContaining(["REPOSITORY_NESTED_VIEW", "REPOSITORY_VIEW_INCOMPLETE"]),
      );
      expect(calls.every((operation) => typeof operation === "string")).toBe(true);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("downgrades filesystem capability after an untracked material read fails", async () => {
    const missingPath = "tooling/cic/__cic_i2_fix1_missing__";
    const result = (
      await observed(REPOSITORY_ROOT, { untrackedPaths: gitOutcome(`${missingPath}\0`) })
    ).result;
    expect(result.status).toBe("BLOCKED");
    expect(result.capabilities.unknown).toContain("filesystem.repository.read");
    expect(result.capabilities.available).not.toContain("filesystem.repository.read");
  });

  it("turns a Git observation failure into UNKNOWN/BLOCK rather than false absence", () => {
    const result = finalized((facts) => {
      facts.view.shallow = "UNKNOWN";
      facts.observationErrors.push({
        code: "GIT_READ_OPERATION_FAILED",
        detail: "operation=shallow",
      });
      facts.capabilityEvidence.available = facts.capabilityEvidence.available.filter(
        (capability) => capability !== "git.worktree.read",
      );
      facts.capabilityEvidence.unknown = ["git.worktree.read"];
    }).result;
    expect(result.status).toBe("BLOCKED");
    expect(result.view.shallow).toBe("UNKNOWN");
    expect(result.errors.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "GIT_READ_OPERATION_FAILED",
        "REPOSITORY_VIEW_INCOMPLETE",
        "REQUIRED_CAPABILITY_UNAVAILABLE",
      ]),
    );
  });

  it("produces byte-identical repeated JSON without raw local paths or remotes", async () => {
    const first = await run(["--json"], REPOSITORY_ROOT);
    const second = await run(["--json"], REPOSITORY_ROOT);
    expect(second.stdout).toBe(first.stdout);
    expect(first.stdout).not.toContain(REPOSITORY_ROOT);
    expect(first.stdout).not.toContain("C:\\RetroStage");
    expect(first.stdout).not.toContain("https://github.com");
    expect(first.stdout).not.toContain("git@github.com");
    expect(formatJsonResult(JSON.parse(first.stdout))).toBe(first.stdout);
  }, 15_000);

  it("uses the required CLI exit contract", async () => {
    expect(await run(["--unknown"], REPOSITORY_ROOT)).toMatchObject({
      exitCode: 64,
      stdout: "",
    });
  });
});
