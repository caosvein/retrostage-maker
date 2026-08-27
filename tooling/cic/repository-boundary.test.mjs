import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import {
  chmod,
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import { createReadonlyGitRunner, runReadonlyGitOperation } from "./lib/readonly-git.mjs";
import { observeRepositoryIdentity, verifyRepositoryIdentity } from "./lib/repository-identity.mjs";

const CIC_ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(CIC_ROOT, "../..");
const SOURCE_FINGERPRINT = "6785498B15F1E37163EB8C2E2FE2406F830CD68F99D18397CE157CA3A581BA55";
const AUTHORIZED_I2_PATHS = Object.freeze([
  "execution-capabilities.test.mjs",
  "lib/canonical-json.mjs",
  "lib/execution-capabilities.mjs",
  "lib/readonly-git.mjs",
  "lib/repository-identity.mjs",
  "repository-boundary.test.mjs",
  "repository-identity.test.mjs",
  "verify-repository-identity.mjs",
]);
const I1_PATHS = Object.freeze([
  "lib/identity.mjs",
  "lib/source-generation.mjs",
  "lib/source-manifest.mjs",
  "product-boundary.test.mjs",
  "source-generation.test.mjs",
  "verify-source-generation.mjs",
]);
const RUNTIME_PATHS = Object.freeze([
  "lib/canonical-json.mjs",
  "lib/execution-capabilities.mjs",
  "lib/identity.mjs",
  "lib/readonly-git.mjs",
  "lib/repository-identity.mjs",
  "lib/source-generation.mjs",
  "lib/source-manifest.mjs",
  "verify-repository-identity.mjs",
  "verify-source-generation.mjs",
]);
const IMPORT_PATTERN =
  /(?:\bimport\s+(?:[^'"]*?\s+from\s+)?|\bexport\s+[^'"]*?\s+from\s+|\bimport\s*\()\s*["']([^"']+)["']/gsu;

async function cicPaths() {
  const paths = [];
  async function visit(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) await visit(path.join(directory, entry.name), relative);
      else if (entry.isFile()) paths.push(relative);
    }
  }
  await visit(CIC_ROOT);
  return paths.sort();
}

async function writeLooseGitObject(gitDirectory, type, body) {
  const bodyBytes = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const objectBytes = Buffer.concat([
    Buffer.from(`${type} ${bodyBytes.byteLength}\0`, "utf8"),
    bodyBytes,
  ]);
  const objectId = createHash("sha1").update(objectBytes).digest("hex");
  const objectDirectory = path.join(gitDirectory, "objects", objectId.slice(0, 2));
  await mkdir(objectDirectory, { recursive: true });
  await writeFile(path.join(objectDirectory, objectId.slice(2)), deflateSync(objectBytes));
  return objectId;
}

function singleEntryIndex(filenameBytes, blobId, fileSize) {
  const metadata = Buffer.alloc(62);
  metadata.writeUInt32BE(0o100644, 24);
  metadata.writeUInt32BE(fileSize, 36);
  Buffer.from(blobId, "hex").copy(metadata, 40);
  metadata.writeUInt16BE(Math.min(filenameBytes.byteLength, 0x0fff), 60);
  const unpaddedLength = metadata.byteLength + filenameBytes.byteLength + 1;
  const padding = Buffer.alloc((8 - (unpaddedLength % 8)) % 8);
  const entry = Buffer.concat([metadata, filenameBytes, Buffer.from([0]), padding]);
  const header = Buffer.alloc(12);
  header.write("DIRC", 0, "ascii");
  header.writeUInt32BE(2, 4);
  header.writeUInt32BE(1, 8);
  const content = Buffer.concat([header, entry]);
  return Buffer.concat([content, createHash("sha1").update(content).digest()]);
}

async function createPhysicalRepositoryFixture(repositoryRoot, { signed = false } = {}) {
  const gitDirectory = path.join(repositoryRoot, ".git");
  const filename = "é.txt";
  const filenameBytes = Buffer.from(filename, "utf8");
  const baselineBytes = Buffer.from("alpha\n\nbefore\nomega\n", "utf8");
  const worktreeBytes = Buffer.from("alpha\n\nchanged\nomega\n", "utf8");
  await mkdir(path.join(gitDirectory, "refs", "heads"), { recursive: true });
  await mkdir(path.join(gitDirectory, "refs", "remotes", "origin"), { recursive: true });

  const blobId = await writeLooseGitObject(gitDirectory, "blob", baselineBytes);
  const treeBody = Buffer.concat([
    Buffer.from("100644 ", "ascii"),
    filenameBytes,
    Buffer.from([0]),
    Buffer.from(blobId, "hex"),
  ]);
  const treeId = await writeLooseGitObject(gitDirectory, "tree", treeBody);
  const signature = signed
    ? "gpgsig -----BEGIN PGP SIGNATURE-----\n fake-signature\n -----END PGP SIGNATURE-----\n"
    : "";
  const subject = signed ? "signed subject" : "physical presentation fixture";
  const commitHeaders = [
    `tree ${treeId}`,
    "author CIC <cic@example.invalid> 1 +0000",
    "committer CIC <cic@example.invalid> 1 +0000",
  ];
  if (signed) commitHeaders.push(signature.trimEnd());
  const commitBody = `${commitHeaders.join("\n")}\n\n${subject}\n`;
  const commitId = await writeLooseGitObject(gitDirectory, "commit", commitBody);
  const config = [
    "[core]",
    "  repositoryformatversion = 0",
    "  filemode = false",
    "  bare = false",
    "  logallrefupdates = true",
    "  ignorecase = false",
    "  autocrlf = false",
    '[remote "origin"]',
    "  url = https://github.com/caosvein/retrostage-maker.git",
    "  fetch = +refs/heads/*:refs/remotes/origin/*",
    '[branch "main"]',
    "  remote = origin",
    "  merge = refs/heads/main",
    "",
  ].join("\n");
  await writeFile(path.join(gitDirectory, "config"), config);
  await writeFile(path.join(gitDirectory, "HEAD"), "ref: refs/heads/main\n");
  await writeFile(path.join(gitDirectory, "refs", "heads", "main"), `${commitId}\n`);
  await writeFile(path.join(gitDirectory, "refs", "remotes", "origin", "main"), `${commitId}\n`);
  await writeFile(
    path.join(gitDirectory, "index"),
    singleEntryIndex(filenameBytes, blobId, baselineBytes.byteLength),
  );
  await writeFile(path.join(repositoryRoot, filename), worktreeBytes);
  return { commitId, config, configPath: path.join(gitDirectory, "config"), gitDirectory, subject };
}

const sourceGenerationProvider = async () => ({
  generationFingerprint: SOURCE_FINGERPRINT,
  status: "PASS",
});

describe("CIC-I2 static repository boundary", () => {
  it("contains exactly the closed I1 files plus the eight authorized I2 paths", async () => {
    expect(await cicPaths()).toEqual([...I1_PATHS, ...AUTHORIZED_I2_PATHS].sort());
  });

  it("allows node:child_process only in the closed read-only Git adapter", async () => {
    for (const relativePath of [
      ...RUNTIME_PATHS,
      ...AUTHORIZED_I2_PATHS.filter((value) => value.endsWith(".test.mjs")),
    ]) {
      const source = await readFile(path.join(CIC_ROOT, relativePath), "utf8");
      const imports = [...source.matchAll(IMPORT_PATTERN)].map((match) => match[1]);
      expect(imports.includes("node:child_process"), `${relativePath} child-process boundary`).toBe(
        relativePath === "lib/readonly-git.mjs",
      );
    }
  });

  it("uses shell=false, hardened Git environment and no caller argument seam", async () => {
    const source = await readFile(path.join(CIC_ROOT, "lib/readonly-git.mjs"), "utf8");
    expect(source).toContain("shell: false");
    expect(source).not.toContain("shell: true");
    for (const variable of [
      "GIT_OPTIONAL_LOCKS",
      "GIT_NO_LAZY_FETCH",
      "GIT_NO_REPLACE_OBJECTS",
      "GIT_ATTR_NOSYSTEM",
      "GIT_CONFIG_NOSYSTEM",
      "GIT_CONFIG_GLOBAL",
      "GIT_CONFIG_SYSTEM",
      "GIT_CONFIG_PARAMETERS",
      "GIT_TERMINAL_PROMPT",
      "GIT_PAGER",
      "PAGER",
      "LC_ALL",
      "LANG",
      "GIT_DIR",
      "GIT_WORK_TREE",
      "GIT_COMMON_DIR",
      "GIT_INDEX_FILE",
      "GIT_OBJECT_DIRECTORY",
      "GIT_ALTERNATE_OBJECT_DIRECTORIES",
      "GIT_NAMESPACE",
      "GIT_REPLACE_REF_BASE",
      "GIT_SHALLOW_FILE",
    ]) {
      expect(source).toContain(variable);
    }
    expect(source).toContain("function runReadonlyGitOperation(repositoryRoot, operationId)");
    expect(source).toContain("spawnSync(resolved.executablePath");
    expect(source).not.toContain('spawnSync("git"');
    expect(source).toContain('"--no-color"');
    expect(source).toContain('"--diff-algorithm=myers"');
    expect(source).toContain('"--unified=3"');
    expect(source).toContain('"--full-index"');
    expect(source).toContain('"--src-prefix=a/"');
    expect(source).toContain('"--dst-prefix=b/"');
    expect(source).toContain('"--no-renames"');
    expect(source).toContain('"--no-relative"');
    expect(source).toContain('"--inter-hunk-context=0"');
    expect(source).toContain('"--no-indent-heuristic"');
    expect(source).toContain('"--walk-reflogs"');
    expect(source).toContain("core.attributesFile=");
    expect(source).toContain("core.excludesFile=");
    expect(source).toContain('"core.quotePath=true"');
    expect(source).toContain('"diff.compactionHeuristic=false"');
    expect(source).toContain('"diff.suppressBlankEmpty=false"');
    expect(source).toContain('"log.showSignature=false"');
    expect(source).toContain('"--no-show-signature"');
    expect(source).toContain('startsWith("GIT_REDIRECT_")');
    expect(source).toContain('startsWith("GIT_TRACE")');
  });

  it("uses fatal UTF-8 decoding for semantic Git operation output", async () => {
    const source = await readFile(path.join(CIC_ROOT, "lib/repository-identity.mjs"), "utf8");
    expect(source).toContain('new TextDecoder("utf-8", { fatal: true, ignoreBOM: true })');
    expect(source).toContain("UTF8_SEMANTIC_OPERATIONS.has(operationId)");
    expect(source).toContain("encoding=INVALID_UTF8");
    expect(source).not.toContain('toString("utf8")');
  });

  it("keeps the runtime operation map on the exact read-only Git verb allowlist", async () => {
    const source = await readFile(path.join(CIC_ROOT, "lib/readonly-git.mjs"), "utf8");
    const operationMap = /const OPERATIONS = Object\.freeze\(\{([\s\S]*?)\n\}\);/u.exec(
      source,
    )?.[1];
    expect(operationMap).toBeDefined();
    const verbs = [...operationMap.matchAll(/^\s*[A-Za-z]+:\s*\[\s*"([^"]+)"/gmu)].map(
      (match) => match[1],
    );
    expect(new Set(verbs)).toEqual(
      new Set([
        "--version",
        "config",
        "diff",
        "for-each-ref",
        "fsck",
        "ls-files",
        "merge-base",
        "rev-list",
        "rev-parse",
        "show",
        "symbolic-ref",
        "worktree",
      ]),
    );
    for (const forbidden of [
      "fetch",
      "pull",
      "push",
      "clone",
      "ls-remote",
      "checkout",
      "switch",
      "reset",
      "clean",
      "commit",
      "merge",
      "rebase",
      "cherry-pick",
      "revert",
      "update-index",
      "hash-object",
      "write-tree",
      "submodule",
      "gc",
      "maintenance",
    ]) {
      expect(verbs).not.toContain(forbidden);
    }
  });

  it("keeps every CIC runtime import out of apps and packages", async () => {
    for (const relativePath of RUNTIME_PATHS) {
      const source = await readFile(path.join(CIC_ROOT, relativePath), "utf8");
      for (const specifier of [...source.matchAll(IMPORT_PATTERN)].map((match) => match[1])) {
        expect(specifier).not.toMatch(/(?:^|\/)(?:apps|packages)(?:\/|$)/u);
      }
    }
  });

  it("skips a repository-local fake Git and executes a proven external absolute Git", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-git-resolution-"));
    const fakeBin = path.join(temporaryRoot, "bin");
    const executableName = process.platform === "win32" ? "git.exe" : "git";
    try {
      await mkdir(fakeBin);
      await copyFile(process.execPath, path.join(fakeBin, executableName));
      const environment = {
        ...process.env,
        PATH: `${fakeBin}${path.delimiter}${process.env.PATH ?? ""}`,
      };
      const runner = createReadonlyGitRunner(temporaryRoot, environment);
      const outcome = runner.run("version");
      expect(outcome.exitCode).toBe(0);
      expect(Buffer.from(outcome.stdout).toString("utf8")).toMatch(/^git version /u);
      expect(runner.evidence.gitExecutablePathHash).toMatch(/^[0-9A-F]{64}$/u);
      expect(runner.evidence.gitExecutableSha256).toMatch(/^[0-9A-F]{64}$/u);
      expect(JSON.stringify(runner)).not.toContain(temporaryRoot);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });

  it("isolates global and environment Git configuration and deterministic diff output", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-git-config-repo-"));
    const temporaryHome = await mkdtemp(path.join(os.tmpdir(), "cic-i2-git-config-"));
    try {
      await createPhysicalRepositoryFixture(temporaryRoot);
      await writeFile(path.join(temporaryRoot, "visible-untracked.tmp"), "visible\n");
      const xdgGit = path.join(temporaryHome, "git");
      const sideEffects = path.join(temporaryHome, "side-effects");
      await mkdir(xdgGit);
      await mkdir(sideEffects);
      await writeFile(path.join(xdgGit, "ignore"), "*.tmp\n");
      await writeFile(path.join(xdgGit, "attributes"), "*.txt -diff\n");
      await writeFile(
        path.join(temporaryHome, ".gitconfig"),
        [
          '[remote "ambient"]',
          "  url = https://github.com/ambient/evil.git",
          "[core]",
          "  sparseCheckout = true",
          '[filter "evil"]',
          "  clean = unsafe-command",
          "  process = unsafe-process",
          "  smudge = unsafe-command",
          "[core]",
          `  attributesFile = ${path.join(xdgGit, "attributes")}`,
          `  excludesFile = ${path.join(xdgGit, "ignore")}`,
          "[color]",
          "  ui = always",
          "",
        ].join("\n"),
      );
      const runner = createReadonlyGitRunner(temporaryRoot, {
        ...process.env,
        GIT_CONFIG_COUNT: "3",
        GIT_CONFIG_KEY_0: "remote.injected.url",
        GIT_CONFIG_KEY_1: "core.sparseCheckout",
        GIT_CONFIG_KEY_2: "filter.injected.clean",
        GIT_CONFIG_PARAMETERS: "'color.ui=always' 'diff.context=0'",
        GIT_CONFIG_VALUE_0: "https://github.com/injected/evil.git",
        GIT_CONFIG_VALUE_1: "true",
        GIT_CONFIG_VALUE_2: "unsafe-command",
        HOME: temporaryHome,
        GIT_REDIRECT_STDERR: path.join(sideEffects, "redirect-stderr.log"),
        GIT_REDIRECT_STDOUT: path.join(sideEffects, "redirect-stdout.log"),
        GIT_TRACE: path.join(sideEffects, "trace.log"),
        GIT_TRACE2: path.join(sideEffects, "trace2.log"),
        GIT_TRACE2_EVENT: path.join(sideEffects, "trace2-event.log"),
        USERPROFILE: temporaryHome,
        XDG_CONFIG_HOME: temporaryHome,
      });
      const remotes = runner.run("remoteUrls");
      const sparse = runner.run("sparseCheckout");
      const filters = runner.run("filterDrivers");
      const diff = runner.run("unstagedDiff");
      const untracked = runner.run("untrackedPaths");
      const version = runner.run("version");
      const remoteText = Buffer.from(remotes.stdout).toString("utf8");
      const diffText = Buffer.from(diff.stdout).toString("utf8");
      expect(remotes.exitCode).toBe(0);
      expect(remoteText).toContain("remote.origin.url");
      expect(remoteText).not.toContain("ambient");
      expect(remoteText).not.toContain("injected");
      expect(sparse.exitCode).toBe(1);
      expect(filters.exitCode).toBe(1);
      expect(Buffer.from(diff.stdout)).not.toContain(0x1b);
      expect(diffText).toContain("-before");
      expect(diffText).toContain("+changed");
      expect(Buffer.from(untracked.stdout).toString("utf8")).toContain("visible-untracked.tmp");
      expect(Buffer.from(version.stdout).toString("utf8")).toMatch(/^git version /u);
      expect(await readdir(sideEffects)).toEqual([]);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
      await rm(temporaryHome, { recursive: true, force: true });
    }
  });

  it("pins core.quotePath for a physical dirty non-ASCII tracked path", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-quote-path-"));
    try {
      const fixture = await createPhysicalRepositoryFixture(temporaryRoot);
      await writeFile(fixture.configPath, `${fixture.config}\n[core]\n  quotePath = true\n`);
      const quoted = await observeRepositoryIdentity(temporaryRoot, { sourceGenerationProvider });
      await writeFile(fixture.configPath, `${fixture.config}\n[core]\n  quotePath = false\n`);
      const unquoted = await observeRepositoryIdentity(temporaryRoot, {
        sourceGenerationProvider,
      });

      expect(quoted.result.status).toBe("PASS");
      expect(unquoted.result.status).toBe("PASS");
      expect(quoted.result.worktree.unstaged.bytes).toBeGreaterThan(0);
      expect(unquoted.result.worktree.staged).toEqual(quoted.result.worktree.staged);
      expect(unquoted.result.worktree.unstaged).toEqual(quoted.result.worktree.unstaged);
      expect(unquoted.result.snapshotFingerprint).toBe(quoted.result.snapshotFingerprint);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("pins diff.suppressBlankEmpty for a physical dirty blank-context delta", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-blank-empty-"));
    try {
      const fixture = await createPhysicalRepositoryFixture(temporaryRoot);
      await writeFile(
        fixture.configPath,
        `${fixture.config}\n[diff]\n  suppressBlankEmpty = true\n`,
      );
      const suppressed = await observeRepositoryIdentity(temporaryRoot, {
        sourceGenerationProvider,
      });
      await writeFile(
        fixture.configPath,
        `${fixture.config}\n[diff]\n  suppressBlankEmpty = false\n`,
      );
      const unsuppressed = await observeRepositoryIdentity(temporaryRoot, {
        sourceGenerationProvider,
      });

      expect(suppressed.result.status).toBe("PASS");
      expect(unsuppressed.result.status).toBe("PASS");
      expect(suppressed.result.worktree.unstaged.bytes).toBeGreaterThan(0);
      expect(unsuppressed.result.worktree.staged).toEqual(suppressed.result.worktree.staged);
      expect(unsuppressed.result.worktree.unstaged).toEqual(suppressed.result.worktree.unstaged);
      expect(unsuppressed.result.snapshotFingerprint).toBe(suppressed.result.snapshotFingerprint);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("pins physical diff and snapshot identity against local presentation configuration", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-diff-config-"));
    const temporaryGit = path.join(temporaryRoot, ".git");
    const sourceGenerationProvider = async () => ({
      generationFingerprint: SOURCE_FINGERPRINT,
      status: "PASS",
    });
    try {
      await cp(path.join(REPOSITORY_ROOT, ".git"), temporaryGit, { recursive: true });
      const beforeRunner = createReadonlyGitRunner(temporaryRoot);
      const beforeStaged = beforeRunner.run("stagedDiff").stdout;
      const beforeUnstaged = beforeRunner.run("unstagedDiff").stdout;
      const before = await observeRepositoryIdentity(temporaryRoot, { sourceGenerationProvider });

      const configPath = path.join(temporaryGit, "config");
      const config = await readFile(configPath, "utf8");
      const orderFile = path.join(temporaryGit, "presentation-order.txt");
      await writeFile(orderFile, "tooling/**\n*");
      await writeFile(
        configPath,
        `${config}\n[core]\n  abbrev = 7\n[diff]\n  algorithm = histogram\n  compactionHeuristic = true\n  indentHeuristic = true\n  interHunkContext = 9\n  mnemonicPrefix = true\n  noprefix = true\n  orderFile = ${orderFile.replaceAll("\\", "/")}\n  relative = true\n  renames = true\n`,
      );

      const afterRunner = createReadonlyGitRunner(temporaryRoot);
      const afterStaged = afterRunner.run("stagedDiff").stdout;
      const afterUnstaged = afterRunner.run("unstagedDiff").stdout;
      const after = await observeRepositoryIdentity(temporaryRoot, { sourceGenerationProvider });

      expect(Buffer.from(afterStaged)).toEqual(Buffer.from(beforeStaged));
      expect(Buffer.from(afterUnstaged)).toEqual(Buffer.from(beforeUnstaged));
      expect(before.result.status).toBe("PASS");
      expect(after.result.status).toBe("PASS");
      expect(after.result.snapshotFingerprint).toBe(before.result.snapshotFingerprint);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 30_000);

  it("never executes a repository-configured signature verifier while reading subject", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-signature-display-"));
    try {
      const fixture = await createPhysicalRepositoryFixture(temporaryRoot, { signed: true });
      const markerTarget = path.join(fixture.gitDirectory, "signature-marker.log");
      const markerProgram = path.join(
        fixture.gitDirectory,
        process.platform === "win32" ? "signature-marker.cmd" : "signature-marker.sh",
      );
      if (process.platform === "win32") {
        await writeFile(markerProgram, `@echo CALLED>>"${markerTarget}"\r\n@exit /b 1\r\n`);
      } else {
        await writeFile(
          markerProgram,
          `#!/bin/sh\nprintf 'CALLED\\n' >> '${markerTarget.replaceAll("'", "'\\''")}'\nexit 1\n`,
        );
        await chmod(markerProgram, 0o755);
      }
      await writeFile(
        fixture.configPath,
        `${fixture.config}\n[log]\n  showSignature = true\n[gpg]\n  program = ${markerProgram.replaceAll("\\", "/")}\n`,
      );

      const subjectOutcome = createReadonlyGitRunner(temporaryRoot).run("headSubject");
      expect(subjectOutcome.exitCode).toBe(0);
      expect(Buffer.from(subjectOutcome.stdout).toString("utf8").trim()).toBe(fixture.subject);
      let observationCount = 0;
      const result = await verifyRepositoryIdentity(temporaryRoot, async (repositoryRoot) => {
        observationCount += 1;
        return observeRepositoryIdentity(repositoryRoot, { sourceGenerationProvider });
      });
      expect(observationCount).toBe(2);
      expect(result.status).toBe("PASS");
      expect(result.head.subject).toBe(fixture.subject);
      await expect(readFile(markerTarget)).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("blocks a physically configured upstream whose tracking ref is unresolved", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-upstream-config-"));
    const temporaryGit = path.join(temporaryRoot, ".git");
    try {
      await cp(path.join(REPOSITORY_ROOT, ".git"), temporaryGit, { recursive: true });
      const configPath = path.join(temporaryGit, "config");
      const config = await readFile(configPath, "utf8");
      const unresolved = config.replace(
        "merge = refs/heads/main",
        "merge = refs/heads/__cic_i2_missing_upstream__",
      );
      expect(unresolved).not.toBe(config);
      await writeFile(configPath, unresolved);

      const observation = await observeRepositoryIdentity(temporaryRoot, {
        sourceGenerationProvider: async () => ({
          generationFingerprint: SOURCE_FINGERPRINT,
          status: "PASS",
        }),
      });
      expect(observation.result.status).toBe("BLOCKED");
      expect(observation.result.head.upstream.state).toBe("UNKNOWN");
      expect(observation.result.errors.map(({ code }) => code)).toEqual(
        expect.arrayContaining(["REPOSITORY_UPSTREAM_UNRESOLVED", "REPOSITORY_VIEW_INCOMPLETE"]),
      );
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("counts physical stash reflog entries instead of commit ancestry", async () => {
    const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), "cic-i2-stash-count-"));
    const temporaryGit = path.join(temporaryRoot, ".git");
    try {
      await cp(path.join(REPOSITORY_ROOT, ".git"), temporaryGit, { recursive: true });
      const head = Buffer.from(createReadonlyGitRunner(temporaryRoot).run("head").stdout)
        .toString("utf8")
        .trim();
      const stashRef = path.join(temporaryGit, "refs", "stash");
      const stashLog = path.join(temporaryGit, "logs", "refs", "stash");
      await mkdir(path.dirname(stashLog), { recursive: true });
      await writeFile(stashRef, `${head}\n`);
      const first = `${"0".repeat(40)} ${head} CIC <cic@example.invalid> 1 +0000\tfirst\n`;
      const second = `${head} ${head} CIC <cic@example.invalid> 2 +0000\tsecond\n`;
      await writeFile(stashLog, first);
      expect(
        Buffer.from(createReadonlyGitRunner(temporaryRoot).run("stashCount").stdout)
          .toString("utf8")
          .trim(),
      ).toBe("1");
      await writeFile(stashLog, first + second);
      expect(
        Buffer.from(createReadonlyGitRunner(temporaryRoot).run("stashCount").stdout)
          .toString("utf8")
          .trim(),
      ).toBe("2");
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  }, 15_000);

  it("disables replacement overlays while preserving raw current HEAD identity", () => {
    const runner = createReadonlyGitRunner(REPOSITORY_ROOT);
    expect(
      Buffer.from(runReadonlyGitOperation(REPOSITORY_ROOT, "version").stdout).toString("utf8"),
    ).toMatch(/^git version /u);
    expect(Buffer.from(runner.run("replaceRefs").stdout).toString("utf8")).toBe("");
    expect(Buffer.from(runner.run("headTree").stdout).toString("utf8").trim()).toBe(
      "037906ea83082dbbac49b24b4896d3a81b8e73bb",
    );
  });
});
