import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { run } from "./compile-context.mjs";
import { canonicalJson } from "./lib/canonical-json.mjs";
import { CIC_I3_PREP1_REQUIREMENTS, serializeContextCompilation } from "./lib/context-compiler.mjs";
import { REQUIRED_CONTEXT_DIMENSIONS } from "./lib/context-closure.mjs";
import { sha256Hex } from "./lib/identity.mjs";

const CIC_ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(CIC_ROOT, "..", "..");
const I3_RUNTIME_FILES = Object.freeze([
  "lib/context-provider.mjs",
  "lib/context-closure.mjs",
  "lib/context-compiler.mjs",
  "compile-context.mjs",
]);
const I3_TEST_FILES = Object.freeze([
  "context-provider.test.mjs",
  "context-closure.test.mjs",
  "context-compiler.test.mjs",
  "context-boundary.test.mjs",
]);
const AUTHORIZED_I3_FILES = Object.freeze([...I3_RUNTIME_FILES, ...I3_TEST_FILES]);
const ALLOWED_NODE_IMPORTS = new Set([
  "node:crypto",
  "node:fs/promises",
  "node:path",
  "node:process",
  "node:util",
  "node:url",
]);
const IMPORT_PATTERN =
  /(?:\bimport\s+(?:[^'"]*?\s+from\s+)?|\bexport\s+[^'"]*?\s+from\s+|\bimport\s*\()\s*["']([^"']+)["']/gsu;
const hash = (value) => sha256Hex(`test:${value}`);
const PROVIDER_MATERIAL_IDENTITY = hash("provider-material");

function staticSpecifiers(text) {
  return [...text.matchAll(IMPORT_PATTERN)].map((match) => match[1]);
}

function completeRequest() {
  return {
    authority: { identity: hash("authority") },
    task: { identity: hash("task") },
    prerequisites: {
      sourceGeneration: {
        status: "PASS",
        fingerprint: CIC_I3_PREP1_REQUIREMENTS.sourceGenerationFingerprint,
      },
      repository: {
        status: "PASS",
        repositoryIdentity: CIC_I3_PREP1_REQUIREMENTS.repositoryIdentity,
        snapshotFingerprint: hash("snapshot"),
        view: { complete: true, shallow: false },
      },
      capabilities: {
        status: "PASS",
        requiredStatus: "PASS",
        capabilityFingerprint: CIC_I3_PREP1_REQUIREMENTS.capabilityFingerprint,
      },
    },
    dimensions: REQUIRED_CONTEXT_DIMENSIONS.map((dimension) => ({
      dimension,
      state: "PRESENT",
      materialIdentities: [PROVIDER_MATERIAL_IDENTITY],
    })),
    materials: [{ id: "seed", content: "read-only\n" }],
  };
}

function witness() {
  return {
    authorityIdentity: hash("authority"),
    sourceGenerationFingerprint: CIC_I3_PREP1_REQUIREMENTS.sourceGenerationFingerprint,
    repositoryIdentity: CIC_I3_PREP1_REQUIREMENTS.repositoryIdentity,
    repositorySnapshotIdentity: hash("snapshot"),
    capabilityFingerprint: CIC_I3_PREP1_REQUIREMENTS.capabilityFingerprint,
    taskMaterialFingerprint: hash("task-material"),
    movement: "STABLE",
  };
}

function providerObservation() {
  const result = {
    requestId: "context-query",
    providerId: "test-provider",
    providerIdentity: hash("provider"),
    state: "PRESENT",
    materialIdentity: PROVIDER_MATERIAL_IDENTITY,
    resultIdentity: hash("provider-result"),
  };
  const semantic = { results: [result], findings: [] };
  return {
    schemaVersion: "CIC_CONTEXT_PROVIDER_OBSERVATION_V1",
    status: "PASS",
    ...semantic,
    observationFingerprint: sha256Hex(
      `CIC-CONTEXT-PROVIDER-OBSERVATION-V1\n${canonicalJson(semantic)}\n`,
    ),
  };
}

describe("CIC-I3 development and side-effect boundary", () => {
  it("contains exactly the eight authorized I3 candidate paths", async () => {
    const files = (await readdir(CIC_ROOT, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.startsWith("context-"))
      .map(({ name }) => name);
    const libraryFiles = (await readdir(path.join(CIC_ROOT, "lib"), { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.startsWith("context-"))
      .map(({ name }) => `lib/${name}`);
    const compileEntry = await readFile(path.join(CIC_ROOT, "compile-context.mjs"), "utf8");
    expect(compileEntry.length).toBeGreaterThan(0);
    expect([...files, ...libraryFiles, "compile-context.mjs"].sort()).toEqual(
      [...AUTHORIZED_I3_FILES].sort(),
    );
  });

  it("keeps runtime imports within reviewed read-only Node and local CIC seams", async () => {
    for (const relativePath of I3_RUNTIME_FILES) {
      const text = await readFile(path.join(CIC_ROOT, relativePath), "utf8");
      for (const specifier of staticSpecifiers(text)) {
        expect(
          ALLOWED_NODE_IMPORTS.has(specifier) || specifier.startsWith("./"),
          `${relativePath} imports ${specifier}`,
        ).toBe(true);
        expect(specifier).not.toMatch(/(?:^|\/)(?:apps|packages)(?:\/|$)/u);
        expect(specifier).not.toMatch(/^node:(?:child_process|http|https|net|tls|dgram)$/u);
      }
    }
  });

  it("contains no network, package-install, Git mutation or activation operation", async () => {
    const source = (
      await Promise.all(I3_RUNTIME_FILES.map((file) => readFile(path.join(CIC_ROOT, file), "utf8")))
    ).join("\n");
    expect(source).not.toMatch(/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/u);
    expect(source).not.toMatch(/\b(?:spawn|spawnSync|exec|execFile|fork)\s*\(/u);
    expect(source).not.toMatch(/\bgit\s+(?:add|commit|push|reset|clean|stash|merge|rebase)\b/iu);
    expect(source).not.toMatch(/\b(?:npm|pnpm|yarn)\s+install\b/iu);
    expect(source).not.toMatch(/\bACTIVE_PROGRESSION\b|\bcompare-and-swap\b/iu);
  });

  it("keeps product and package roots free of CIC imports", async () => {
    for (const root of ["apps", "packages"]) {
      const pending = [path.join(REPOSITORY_ROOT, root)];
      while (pending.length > 0) {
        const current = pending.pop();
        for (const entry of await readdir(current, { withFileTypes: true })) {
          if (new Set([".git", ".vite", "dist", "node_modules", "out"]).has(entry.name)) {
            continue;
          }
          const absolute = path.join(current, entry.name);
          if (entry.isDirectory()) pending.push(absolute);
          else if (entry.isFile() && /\.(?:[cm]?[jt]s)$/u.test(entry.name)) {
            expect(await readFile(absolute, "utf8")).not.toMatch(/tooling[\\/]cic/u);
          }
        }
      }
    }
  });

  it("exposes deterministic JSON-only CLI behavior and blocks invalid use", async () => {
    const invalid = await run([], REPOSITORY_ROOT);
    expect(invalid).toMatchObject({ exitCode: 64, stdout: "" });

    const first = await run(["--json"], REPOSITORY_ROOT, {
      request: completeRequest(),
      compilerOptions: {
        observeGeneration: async () => witness(),
        observeProviders: async () => providerObservation(),
      },
    });
    const second = await run(["--json"], REPOSITORY_ROOT, {
      request: completeRequest(),
      compilerOptions: {
        observeGeneration: async () => witness(),
        observeProviders: async () => providerObservation(),
      },
    });
    expect(first).toMatchObject({ exitCode: 0, stderr: "" });
    expect(first.stdout).toBe(second.stdout);
    expect(JSON.parse(first.stdout)).toMatchObject({ status: "VERIFIED", active: false });
    expect(first.stdout).toBe(serializeContextCompilation(JSON.parse(first.stdout)));
  });

  it("returns only sanitized blocking codes for failed input", async () => {
    const outcome = await run(["--json", "C:\\Users\\owner\\secret.json"], REPOSITORY_ROOT);
    expect(outcome.exitCode).toBe(2);
    expect(outcome.stderr).toBe("");
    expect(outcome.stdout).not.toMatch(/Users|owner|secret\.json/u);
    expect(JSON.parse(outcome.stdout)).toMatchObject({
      status: "BLOCKED",
      findings: [{ code: "CONTEXT_INPUT_READ_FAILED" }],
    });
  });
});
