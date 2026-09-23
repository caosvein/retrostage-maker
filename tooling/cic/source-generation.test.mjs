import { mkdtemp, mkdir, readFile, rm, symlink, unlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { gitBlobSha1, normalizeRepoRelativePath, sha256Hex } from "./lib/identity.mjs";
import { observeSourceGeneration, verifySourceGeneration } from "./lib/source-generation.mjs";
import {
  EXPECTED_SOURCE_IDS,
  EXPECTED_SOURCE_LAYOUT,
  parseSourceManifest,
} from "./lib/source-manifest.mjs";
import { formatJsonResult, run } from "./verify-source-generation.mjs";

const CIC_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(CIC_DIRECTORY, "..", "..");
const SOURCE_ROOT = path.join(REPOSITORY_ROOT, "docs", "sources");
const EXPECTED_FINGERPRINT = "F3CA72E7F199DAC701270E7E9611AE10921685579F9AF38D5060F1920BDCCBAB";
const temporaryRoots = [];

async function createFixture(order = [...EXPECTED_SOURCE_IDS]) {
  const root = await mkdtemp(path.join(tmpdir(), "retrostage-cic-i1-"));
  temporaryRoots.push(root);
  const destination = path.join(root, "docs", "sources");
  await mkdir(destination, { recursive: true });

  const files = new Map([
    ["MANIFEST", await readFile(path.join(SOURCE_ROOT, "SOURCE-MANIFEST.tsv"))],
    ...(await Promise.all(
      EXPECTED_SOURCE_IDS.map(async (sourceId) => [
        sourceId,
        await readFile(path.join(SOURCE_ROOT, EXPECTED_SOURCE_LAYOUT[sourceId])),
      ]),
    )),
  ]);

  for (const sourceId of order) {
    await writeFile(path.join(destination, EXPECTED_SOURCE_LAYOUT[sourceId]), files.get(sourceId));
  }
  await writeFile(path.join(destination, "SOURCE-MANIFEST.tsv"), files.get("MANIFEST"));
  return root;
}

async function rewriteManifest(root, update) {
  const manifestPath = path.join(root, "docs", "sources", "SOURCE-MANIFEST.tsv");
  const original = await readFile(manifestPath, "utf8");
  await writeFile(manifestPath, update(original), "utf8");
}

async function createChangedValidFixture() {
  const root = await createFixture();
  const sourcePath = path.join(root, "docs", "sources", EXPECTED_SOURCE_LAYOUT["01"]);
  const changedBytes = new Uint8Array(await readFile(sourcePath));
  changedBytes[changedBytes.length - 1] ^= 1;
  await writeFile(sourcePath, changedBytes);
  const changedHash = sha256Hex(changedBytes);
  await rewriteManifest(root, (text) =>
    text.replace("C307F9FF4B45B21508DEE48AF1ECAFF99A0F0235CE212DB5C735DE7DB69D1501", changedHash),
  );
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true })),
  );
});

describe("CIC-I1 source generation foundation", () => {
  it("proves the current physical Source generation and exact fingerprint", async () => {
    const result = await verifySourceGeneration(REPOSITORY_ROOT);

    expect(result.status).toBe("PASS");
    expect(result.generationFingerprint).toBe(EXPECTED_FINGERPRINT);
    expect(result.inventory).toMatchObject({ state: "PRESENT", complete: true });
    expect(result.sources).toHaveLength(10);
    expect(result.errors).toEqual([]);
  });

  it("derives the same fingerprint from the same bytes created in reverse order", async () => {
    const ascending = await createFixture();
    const descending = await createFixture([...EXPECTED_SOURCE_IDS].reverse());

    const [first, second] = await Promise.all([
      verifySourceGeneration(ascending),
      verifySourceGeneration(descending),
    ]);
    expect(first.generationFingerprint).toBe(EXPECTED_FINGERPRINT);
    expect(second.generationFingerprint).toBe(first.generationFingerprint);
    expect(formatJsonResult(second)).toBe(
      formatJsonResult(await verifySourceGeneration(descending)),
    );
  });

  it("requires exactly two coherent observations and blocks a start/end mismatch", async () => {
    const startRoot = await createFixture();
    const endRoot = await createChangedValidFixture();
    const observations = [
      await observeSourceGeneration(startRoot),
      await observeSourceGeneration(endRoot),
    ];
    expect(observations.every(({ result }) => result.status === "PASS")).toBe(true);

    let callCount = 0;
    const result = await verifySourceGeneration("unused-test-root", async () => {
      const observation = observations[callCount];
      callCount += 1;
      return observation;
    });

    expect(callCount).toBe(2);
    expect(result.status).toBe("BLOCKED");
    expect(result.generationFingerprint).toBeNull();
    expect(result.errors.map(({ code }) => code)).toContain("SOURCE_GENERATION_RACE");
  });

  it("blocks a one-byte Source mutation with a hash mismatch", async () => {
    const root = await createFixture();
    const sourcePath = path.join(root, "docs", "sources", EXPECTED_SOURCE_LAYOUT["01"]);
    const bytes = await readFile(sourcePath);
    bytes[bytes.length - 1] ^= 1;
    await writeFile(sourcePath, bytes);

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.errors.map(({ code }) => code)).toContain("SOURCE_FILE_HASH_MISMATCH");
  });

  it("proves a missing Source only from a complete inventory witness", async () => {
    const root = await createFixture();
    await unlink(path.join(root, "docs", "sources", EXPECTED_SOURCE_LAYOUT["09"]));

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.inventory.complete).toBe(true);
    expect(result.sources.find(({ sourceId }) => sourceId === "09")?.state).toBe("ABSENT_PROVEN");
    expect(result.errors.map(({ code }) => code)).toContain("SOURCE_FILE_MISSING");
    expect(result.errors.map(({ code }) => code)).not.toContain("SOURCE_FILE_UNAVAILABLE");
  });

  it("classifies a present non-regular Source as UNKNOWN and unavailable", async () => {
    const root = await createFixture();
    const sourcePath = path.join(root, "docs", "sources", EXPECTED_SOURCE_LAYOUT["09"]);
    await unlink(sourcePath);
    await mkdir(sourcePath);

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.sources.find(({ sourceId }) => sourceId === "09")?.state).toBe("UNKNOWN");
    expect(result.errors.map(({ code }) => code)).toContain("SOURCE_FILE_UNAVAILABLE");
    expect(result.errors.map(({ code }) => code)).not.toContain("SOURCE_FILE_MISSING");
  });

  it("blocks duplicate Source IDs and duplicate filenames", async () => {
    const duplicateIdRoot = await createFixture();
    await rewriteManifest(duplicateIdRoot, (text) => text.replace(/^01\t/mu, "00\t"));
    const duplicateFilenameRoot = await createFixture();
    await rewriteManifest(duplicateFilenameRoot, (text) =>
      text.replace(
        /^01\t01_RSM_REBOOT_CANONICAL_ROADMAP\.md\t/mu,
        "01\t00_RSM_REBOOT_PROJECT_CHARTER.md\t",
      ),
    );

    const [duplicateId, duplicateFilename] = await Promise.all([
      verifySourceGeneration(duplicateIdRoot),
      verifySourceGeneration(duplicateFilenameRoot),
    ]);
    expect(duplicateId.errors.map(({ code }) => code)).toContain("SOURCE_MANIFEST_DUPLICATE_ID");
    expect(duplicateFilename.errors.map(({ code }) => code)).toContain(
      "SOURCE_MANIFEST_DUPLICATE_FILENAME",
    );
  });

  it("blocks a non-CURRENT row and a manifest row-set violation", async () => {
    const staleRoot = await createFixture();
    await rewriteManifest(staleRoot, (text) => text.replace(/\tCURRENT\n/u, "\tSTALE\n"));
    const rowSetRoot = await createFixture();
    await rewriteManifest(rowSetRoot, (text) => text.replace(/^09\t/mu, "10\t"));

    const [stale, rowSet] = await Promise.all([
      verifySourceGeneration(staleRoot),
      verifySourceGeneration(rowSetRoot),
    ]);
    expect(stale.errors.map(({ code }) => code)).toContain("SOURCE_STATUS_NOT_CURRENT");
    expect(rowSet.errors.map(({ code }) => code)).toContain("SOURCE_MANIFEST_ROWSET_MISMATCH");
  });

  it("blocks a missing manifest and a malformed manifest schema", async () => {
    const missingRoot = await createFixture();
    await unlink(path.join(missingRoot, "docs", "sources", "SOURCE-MANIFEST.tsv"));
    const malformedRoot = await createFixture();
    await rewriteManifest(malformedRoot, (text) =>
      text.replace("source_id\tfilename\tsha256\tstatus", "source_id\tfilename\tstatus"),
    );

    const [missing, malformed] = await Promise.all([
      verifySourceGeneration(missingRoot),
      verifySourceGeneration(malformedRoot),
    ]);
    expect(missing.manifest.state).toBe("ABSENT_PROVEN");
    expect(missing.errors.map(({ code }) => code)).toContain("SOURCE_MANIFEST_MISSING");
    expect(missing.errors.map(({ code }) => code)).not.toContain("SOURCE_MANIFEST_UNAVAILABLE");
    expect(malformed.errors.map(({ code }) => code)).toContain("SOURCE_MANIFEST_SCHEMA_MISMATCH");
  });

  it("classifies a present non-regular manifest as UNKNOWN and unavailable", async () => {
    const root = await createFixture();
    const manifestPath = path.join(root, "docs", "sources", "SOURCE-MANIFEST.tsv");
    await unlink(manifestPath);
    await mkdir(manifestPath);

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.manifest.state).toBe("UNKNOWN");
    expect(result.errors.map(({ code }) => code)).toContain("SOURCE_MANIFEST_UNAVAILABLE");
    expect(result.errors.map(({ code }) => code)).not.toContain("SOURCE_MANIFEST_MISSING");
  });

  it("blocks an unexpected canonical Source10-like file", async () => {
    const root = await createFixture();
    await writeFile(
      path.join(root, "docs", "sources", "10_RSM_REBOOT_UNAUTHORIZED.md"),
      "not canonical\n",
      "utf8",
    );

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.errors.map(({ code }) => code)).toContain("SOURCE_UNEXPECTED_CANONICAL_FILE");
    expect(
      result.errors.find(({ code }) => code === "SOURCE_UNEXPECTED_CANONICAL_FILE")?.detail,
    ).toBe("entry-kind=file");
  });

  it("blocks an unexpected canonical directory", async () => {
    const root = await createFixture();
    await mkdir(path.join(root, "docs", "sources", "10_RSM_REBOOT_UNAUTHORIZED.md"));

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.errors).toContainEqual({
      code: "SOURCE_UNEXPECTED_CANONICAL_FILE",
      path: "docs/sources/10_RSM_REBOOT_UNAUTHORIZED.md",
      detail: "entry-kind=directory",
    });
  });

  it("blocks an unexpected canonical symlink when the platform supports it", async () => {
    const root = await createFixture();
    const linkPath = path.join(root, "docs", "sources", "10_RSM_REBOOT_UNAUTHORIZED.md");
    const targetPath = path.join(root, "docs", "sources", EXPECTED_SOURCE_LAYOUT["00"]);
    try {
      await symlink(targetPath, linkPath, "file");
    } catch (error) {
      expect(["EPERM", "EACCES", "ENOTSUP"]).toContain(error.code);
      return;
    }

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.errors).toContainEqual({
      code: "SOURCE_UNEXPECTED_CANONICAL_FILE",
      path: "docs/sources/10_RSM_REBOOT_UNAUTHORIZED.md",
      detail: "entry-kind=symbolic-link",
    });
  });

  it("treats an unavailable Source root as UNKNOWN and never as absence PASS", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "retrostage-cic-i1-missing-"));
    temporaryRoots.push(root);

    const result = await verifySourceGeneration(root);
    expect(result.status).toBe("BLOCKED");
    expect(result.inventory).toMatchObject({ state: "UNKNOWN", complete: false });
    expect(result.sources.every(({ state }) => state === "UNKNOWN")).toBe(true);
    expect(result.errors.map(({ code }) => code)).toEqual([
      "SOURCE_INVENTORY_UNKNOWN",
      "SOURCE_ROOT_UNAVAILABLE",
    ]);
  });

  it("matches the accepted Source01 Git blob oracle and deterministic identity helpers", async () => {
    const sourceBytes = await readFile(
      path.join(SOURCE_ROOT, "01_RSM_REBOOT_CANONICAL_ROADMAP.md"),
    );
    expect(gitBlobSha1(sourceBytes)).toBe("ec52876d0ba3f7032b03d205d07f46e866c1ce28");
    expect(sha256Hex(sourceBytes)).toBe(
      "C307F9FF4B45B21508DEE48AF1ECAFF99A0F0235CE212DB5C735DE7DB69D1501",
    );
    expect(normalizeRepoRelativePath(".\\docs\\sources\\SOURCE-MANIFEST.tsv")).toBe(
      "docs/sources/SOURCE-MANIFEST.tsv",
    );
    expect(normalizeRepoRelativePath("docs/./sources//SOURCE-MANIFEST.tsv")).toBe(
      "docs/sources/SOURCE-MANIFEST.tsv",
    );
  });

  it("accepts lowercase manifest hashes and normalizes them to uppercase", async () => {
    const manifest = await readFile(path.join(SOURCE_ROOT, "SOURCE-MANIFEST.tsv"), "utf8");
    const parsed = parseSourceManifest(
      manifest.replace(/[0-9A-F]{64}/gu, (hash) => hash.toLowerCase()),
    );
    expect(parsed.errors).toEqual([]);
    expect(parsed.rows.every(({ sha256 }) => /^[0-9A-F]{64}$/u.test(sha256))).toBe(true);
  });

  it("provides deterministic JSON and the specified CLI exit behavior", async () => {
    const first = await verifySourceGeneration(REPOSITORY_ROOT);
    const second = await verifySourceGeneration(REPOSITORY_ROOT);
    expect(formatJsonResult(first)).toBe(formatJsonResult(second));

    const human = await run([], REPOSITORY_ROOT);
    const json = await run(["--json"], REPOSITORY_ROOT);
    const invalid = await run(["--unknown"], REPOSITORY_ROOT);
    expect(human).toMatchObject({ exitCode: 0, stderr: "" });
    expect(json).toMatchObject({ exitCode: 0, stderr: "" });
    expect(JSON.parse(json.stdout).generationFingerprint).toBe(EXPECTED_FINGERPRINT);
    expect(json.stdout).not.toContain(REPOSITORY_ROOT);
    expect(invalid).toMatchObject({ exitCode: 64, stdout: "" });
  });
});
