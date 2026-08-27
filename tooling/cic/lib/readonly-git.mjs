import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { accessSync, constants, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const NULL_DEVICE = process.platform === "win32" ? "NUL" : "/dev/null";
const FIXED_CONFIG = Object.freeze([
  "-c",
  `core.attributesFile=${NULL_DEVICE}`,
  "-c",
  `core.excludesFile=${NULL_DEVICE}`,
  "-c",
  "core.fsmonitor=false",
  "-c",
  "core.quotePath=true",
  "-c",
  "log.showSignature=false",
  "-c",
  "diff.compactionHeuristic=false",
  "-c",
  "diff.external=",
  "-c",
  "diff.indentHeuristic=false",
  "-c",
  "diff.interHunkContext=0",
  "-c",
  "diff.mnemonicPrefix=false",
  "-c",
  "diff.noprefix=false",
  "-c",
  "diff.renames=false",
  "-c",
  "diff.relative=false",
  "-c",
  "diff.suppressBlankEmpty=false",
  "-c",
  "color.ui=false",
  "-c",
  "color.diff=false",
  "-c",
  "diff.algorithm=myers",
  "-c",
  "diff.context=3",
]);
const OPERATIONS = Object.freeze({
  aheadBehind: ["rev-list", "--left-right", "--count", "@{upstream}...HEAD"],
  bare: ["rev-parse", "--is-bare-repository"],
  branchRef: ["symbolic-ref", "--quiet", "HEAD"],
  branchUpstreamConfig: ["config", "--null", "--get-regexp", "^branch\..*\.(remote|merge)$"],
  commonDir: ["rev-parse", "--path-format=absolute", "--git-common-dir"],
  externalConfigLocal: [
    "config",
    "--null",
    "--local",
    "--get-regexp",
    "^core\.(attributesFile|excludesFile)$",
  ],
  externalConfigWorktree: [
    "config",
    "--null",
    "--worktree",
    "--get-regexp",
    "^core\.(attributesFile|excludesFile)$",
  ],
  filterDrivers: ["config", "--null", "--get-regexp", "^filter\\..*\\.(clean|smudge|process)$"],
  gitDir: ["rev-parse", "--absolute-git-dir"],
  head: ["rev-parse", "--verify", "HEAD"],
  headSubject: ["show", "-s", "--no-show-signature", "--format=%s", "HEAD"],
  headTree: ["rev-parse", "--verify", "HEAD^{tree}"],
  indexEntries: ["ls-files", "--stage", "-z"],
  indexVisibility: ["ls-files", "-v", "-z"],
  insideWorktree: ["rev-parse", "--is-inside-work-tree"],
  mergeBase: ["merge-base", "HEAD", "@{upstream}"],
  missingObjectWitness: ["fsck", "--full", "--connectivity-only", "--no-dangling", "--no-reflogs"],
  objectFormat: ["rev-parse", "--show-object-format"],
  partialCloneConfig: [
    "config",
    "--null",
    "--get-regexp",
    "^(extensions\\.partialClone|remote\\..*\\.promisor)$",
  ],
  remoteUrls: ["config", "--null", "--get-regexp", "^remote\\..*\\.url$"],
  replaceRefs: ["for-each-ref", "--format=%(refname)", "refs/replace"],
  shallow: ["rev-parse", "--is-shallow-repository"],
  sparseCheckout: ["config", "--bool", "core.sparseCheckout"],
  stagedDiff: [
    "diff",
    "--cached",
    "--binary",
    "--full-index",
    "--src-prefix=a/",
    "--dst-prefix=b/",
    "--no-renames",
    "--no-relative",
    "--no-color",
    "--no-ext-diff",
    "--no-textconv",
    "--diff-algorithm=myers",
    "--unified=3",
    "--inter-hunk-context=0",
    "--no-indent-heuristic",
    "-O",
    NULL_DEVICE,
  ],
  stashCount: ["rev-list", "--walk-reflogs", "--count", "refs/stash"],
  stashTip: ["rev-parse", "--verify", "refs/stash"],
  superprojectRoot: ["rev-parse", "--show-superproject-working-tree"],
  topLevel: ["rev-parse", "--show-toplevel"],
  trackedPaths: ["ls-files", "-z"],
  unstagedDiff: [
    "diff",
    "--binary",
    "--full-index",
    "--src-prefix=a/",
    "--dst-prefix=b/",
    "--no-renames",
    "--no-relative",
    "--no-color",
    "--no-ext-diff",
    "--no-textconv",
    "--diff-algorithm=myers",
    "--unified=3",
    "--inter-hunk-context=0",
    "--no-indent-heuristic",
    "-O",
    NULL_DEVICE,
  ],
  untrackedPaths: ["ls-files", "--others", "--exclude-standard", "-z"],
  upstreamCommit: ["rev-parse", "--verify", "@{upstream}"],
  upstreamRef: ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"],
  version: ["--version"],
  worktrees: ["worktree", "list", "--porcelain", "-z"],
});

const SCRUBBED_ENVIRONMENT = new Set([
  "GIT_ALTERNATE_OBJECT_DIRECTORIES",
  "GIT_ASKPASS",
  "GIT_ATTR_NOSYSTEM",
  "GIT_CEILING_DIRECTORIES",
  "GIT_COMMON_DIR",
  "GIT_CONFIG",
  "GIT_CONFIG_COUNT",
  "GIT_CONFIG_GLOBAL",
  "GIT_CONFIG_NOSYSTEM",
  "GIT_CONFIG_PARAMETERS",
  "GIT_CONFIG_SYSTEM",
  "GIT_DIFF_OPTS",
  "GIT_DIR",
  "GIT_DISCOVERY_ACROSS_FILESYSTEM",
  "GIT_EXEC_PATH",
  "GIT_EXTERNAL_DIFF",
  "GIT_INDEX_FILE",
  "GIT_NAMESPACE",
  "GIT_NO_REPLACE_OBJECTS",
  "GIT_OBJECT_DIRECTORY",
  "GIT_REPLACE_REF_BASE",
  "GIT_SHALLOW_FILE",
  "GIT_SSH",
  "GIT_SSH_COMMAND",
  "GIT_WORK_TREE",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex").toUpperCase();
}

function environmentValue(environment, name) {
  if (Object.hasOwn(environment, name)) return environment[name] ?? "";
  const match = Object.entries(environment).find(([key]) => key.toUpperCase() === name);
  return match?.[1] ?? "";
}

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

function resolveExternalGit(repositoryRoot, environment) {
  let resolvedRoot;
  try {
    resolvedRoot = realpathSync(path.resolve(repositoryRoot));
  } catch {
    resolvedRoot = path.resolve(repositoryRoot);
  }
  const names = process.platform === "win32" ? ["git.exe"] : ["git"];
  const entries = environmentValue(environment, "PATH").split(path.delimiter);
  for (const rawEntry of entries) {
    const entry = rawEntry.replace(/^"|"$/gu, "");
    if (!path.isAbsolute(entry)) continue;
    for (const name of names) {
      try {
        const executablePath = realpathSync(path.join(entry, name));
        const metadata = statSync(executablePath);
        if (!metadata.isFile() || isInside(resolvedRoot, executablePath)) continue;
        accessSync(executablePath, constants.X_OK);
        const executableBytes = readFileSync(executablePath);
        return {
          executablePath,
          evidence: Object.freeze({
            gitExecutablePathHash: sha256(`CIC-LOCAL-PATH-V1\n${executablePath}\n`),
            gitExecutableSha256: sha256(executableBytes),
          }),
        };
      } catch {
        // An unprovable candidate is skipped; no candidate is ever executed during resolution.
      }
    }
  }
  return null;
}

function hardenedEnvironment(environment) {
  const hardened = {};
  for (const [name, value] of Object.entries(environment)) {
    const upperName = name.toUpperCase();
    if (
      !SCRUBBED_ENVIRONMENT.has(upperName) &&
      !upperName.startsWith("GIT_CONFIG_KEY_") &&
      !upperName.startsWith("GIT_CONFIG_VALUE_") &&
      !upperName.startsWith("GIT_REDIRECT_") &&
      !upperName.startsWith("GIT_TRACE")
    ) {
      hardened[name] = value;
    }
  }
  return {
    ...hardened,
    GIT_ATTR_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: NULL_DEVICE,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_SYSTEM: NULL_DEVICE,
    GIT_NO_LAZY_FETCH: "1",
    GIT_NO_REPLACE_OBJECTS: "1",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_PAGER: "cat",
    GIT_TERMINAL_PROMPT: "0",
    LANG: "C",
    LC_ALL: "C",
    PAGER: "cat",
  };
}

function unavailableOutcome() {
  return Object.freeze({
    errorCode: "ENOENT",
    exitCode: null,
    stderr: new Uint8Array(),
    stdout: new Uint8Array(),
    gitExecutablePathHash: null,
    gitExecutableSha256: null,
  });
}

export function createReadonlyGitRunner(repositoryRoot, environment = process.env) {
  const resolved = resolveExternalGit(repositoryRoot, environment);
  const evidence =
    resolved?.evidence ??
    Object.freeze({
      gitExecutablePathHash: null,
      gitExecutableSha256: null,
    });
  return Object.freeze({
    evidence,
    run(operationId) {
      const operation = OPERATIONS[operationId];
      if (operation === undefined) throw new RangeError("unsupported read-only Git operation");
      if (resolved === null) return unavailableOutcome();
      const outcome = spawnSync(resolved.executablePath, [...FIXED_CONFIG, ...operation], {
        cwd: path.resolve(repositoryRoot),
        encoding: null,
        env: hardenedEnvironment(environment),
        maxBuffer: 64 * 1024 * 1024,
        shell: false,
        windowsHide: true,
      });
      return Object.freeze({
        errorCode:
          outcome.error && typeof outcome.error.code === "string" ? outcome.error.code : null,
        exitCode: outcome.status,
        stderr: new Uint8Array(outcome.stderr ?? []),
        stdout: new Uint8Array(outcome.stdout ?? []),
        ...evidence,
      });
    },
  });
}

export function runReadonlyGitOperation(repositoryRoot, operationId) {
  return createReadonlyGitRunner(repositoryRoot).run(operationId);
}
