import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  EXPECTED_DIRECT_DEV_DEPENDENCIES,
  EXPECTED_SOURCE_LAYOUT,
  REQUIRED_PATHS,
  REQUIRED_TEXT_FRAGMENTS,
  validateWorkflowRepository,
} from "./workflow-policy.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoots = [];

function write(root, relativePath, content) {
  const absolute = path.join(root, relativePath);
  mkdirSync(path.dirname(absolute), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex").toUpperCase();
}

function createFixture(activeTaskCount = 0) {
  const root = mkdtempSync(path.join(os.tmpdir(), "retrostage-workflow-policy-"));
  temporaryRoots.push(root);

  for (const requiredPath of REQUIRED_PATHS) {
    const fragments = REQUIRED_TEXT_FRAGMENTS[requiredPath] ?? [];
    write(root, requiredPath, `${fragments.join("\n")}\n`);
  }

  const sourceRows = [];
  for (const [sourceId, filename] of Object.entries(EXPECTED_SOURCE_LAYOUT)) {
    const content = `fixture source ${sourceId}\n`;
    const identity = sha256(content);
    sourceRows.push(`${sourceId}\t${filename}\t${identity}\tCURRENT`);
    write(root, `docs/sources/${filename}`, content);
  }
  write(
    root,
    "docs/sources/SOURCE-MANIFEST.tsv",
    `source_id\tfilename\tsha256\tstatus\n${sourceRows.join("\n")}\n`,
  );

  const milestoneRows = Array.from({ length: activeTaskCount }, (_, index) =>
    [
      "RSM-4",
      `RSM-4-I${index + 1}`,
      `Fixture ${index + 1}`,
      "ACTIVE",
      "docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-EVIDENCE-MANIFEST.md",
      "NOT YET REVIEWED",
    ].join("\t"),
  );
  write(
    root,
    "docs/evidence/rsm-4/RSM-4-MILESTONE-EVIDENCE-MANIFEST.tsv",
    `milestone_id\ttask_id\ttitle\tstatus\tevidence_path\tdecision\n${milestoneRows.join("\n")}${milestoneRows.length === 0 ? "" : "\n"}`,
  );

  write(
    root,
    "package.json",
    `${JSON.stringify(
      {
        name: "retrostage-maker",
        private: true,
        type: "module",
        scripts: {
          "workflow:check": "node tooling/workflow-policy.mjs",
          validate: "pnpm run workflow:check",
        },
        devDependencies: EXPECTED_DIRECT_DEV_DEPENDENCIES,
      },
      null,
      2,
    )}\n`,
  );
  for (const [packagePath, name] of [
    ["packages/core", "@retrostage/core"],
    ["packages/diagnostics", "@retrostage/diagnostics"],
    ["packages/test-fixtures", "@retrostage/test-fixtures"],
  ]) {
    write(root, `${packagePath}/package.json`, `${JSON.stringify({ name }, null, 2)}\n`);
  }
  write(root, ".github/workflows/ci.yml", "name: Fixture CI\n");
  return { root };
}

function validateFixture(fixture) {
  return validateWorkflowRepository(fixture.root);
}

function updateSourceManifestRow(root, sourceId, update) {
  const manifest = path.join(root, "docs/sources/SOURCE-MANIFEST.tsv");
  const lines = readFileSync(manifest, "utf8").trimEnd().split("\n");
  const updated = lines.map((line, index) => {
    if (index === 0) return line;
    const fields = line.split("\t");
    return fields[0] === sourceId ? update(fields).join("\t") : line;
  });
  write(root, "docs/sources/SOURCE-MANIFEST.tsv", `${updated.join("\n")}\n`);
}

function issueCodes(issues) {
  return issues.map(({ code }) => code);
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { force: true, recursive: true });
});

describe("RSM-4 workflow policy", () => {
  it("passes the exact accepted repository baseline", () => {
    expect(validateWorkflowRepository(REPOSITORY_ROOT)).toEqual([]);
  });

  it("passes all ten manifest-governed synchronized source hashes", () => {
    const sourceIssues = validateWorkflowRepository(REPOSITORY_ROOT).filter(({ code }) =>
      code.startsWith("SOURCE_"),
    );
    expect(sourceIssues).toEqual([]);
  });

  it("passes with zero ACTIVE milestone tasks", () => {
    expect(validateFixture(createFixture(0))).toEqual([]);
  });

  it("passes with one ACTIVE milestone task", () => {
    expect(validateFixture(createFixture(1))).toEqual([]);
  });

  it("fails when a required workflow path is missing", () => {
    const fixture = createFixture();
    unlinkSync(path.join(fixture.root, "docs/workflow/templates/closure-report.md"));
    expect(issueCodes(validateFixture(fixture))).toContain("REQUIRED_PATH_MISSING");
  });

  it("fails when task-plan scope, baseline, validation, and closure fields are missing", () => {
    const fixture = createFixture();
    write(fixture.root, "docs/workflow/templates/task-plan.md", "# Incomplete task plan\n");
    const codes = issueCodes(validateFixture(fixture));
    expect(codes.filter((code) => code === "REQUIRED_TEMPLATE_FIELD_MISSING")).toHaveLength(7);
  });

  it("fails with two ACTIVE milestone tasks", () => {
    expect(issueCodes(validateFixture(createFixture(2)))).toContain("MULTIPLE_ACTIVE_TASKS");
  });

  it("fails when a Source row is missing", () => {
    const fixture = createFixture();
    const manifest = path.join(fixture.root, "docs/sources/SOURCE-MANIFEST.tsv");
    const lines = readFileSync(manifest, "utf8").trimEnd().split("\n");
    write(fixture.root, "docs/sources/SOURCE-MANIFEST.tsv", `${lines.slice(0, -1).join("\n")}\n`);
    expect(issueCodes(validateFixture(fixture))).toContain("SOURCE_MANIFEST_MISSING_ROW");

    const schemaFixture = createFixture();
    const schemaManifest = path.join(schemaFixture.root, "docs/sources/SOURCE-MANIFEST.tsv");
    const schemaText = readFileSync(schemaManifest, "utf8").replace(
      "source_id\tfilename\tsha256\tstatus",
      "source_id\tfilename\tstatus\tsha256",
    );
    write(schemaFixture.root, "docs/sources/SOURCE-MANIFEST.tsv", schemaText);
    expect(issueCodes(validateFixture(schemaFixture))).toContain("SOURCE_MANIFEST_SCHEMA_INVALID");
  });

  it("fails when a Source row is duplicated", () => {
    const fixture = createFixture();
    const manifest = path.join(fixture.root, "docs/sources/SOURCE-MANIFEST.tsv");
    const text = readFileSync(manifest, "utf8");
    const duplicate = text.trimEnd().split("\n")[1];
    write(fixture.root, "docs/sources/SOURCE-MANIFEST.tsv", `${text}${duplicate}\n`);
    expect(issueCodes(validateFixture(fixture))).toContain("SOURCE_MANIFEST_DUPLICATE_ROW");
  });

  it("fails when an extra Source row exists", () => {
    const fixture = createFixture();
    const manifest = path.join(fixture.root, "docs/sources/SOURCE-MANIFEST.tsv");
    const text = readFileSync(manifest, "utf8");
    const lines = text.trimEnd().split("\n");
    const source00 = lines[1].split("\t");
    source00[1] = "00_wrong.md";
    source00[3] = "HISTORICAL";
    lines[1] = source00.join("\t");
    write(
      fixture.root,
      "docs/sources/SOURCE-MANIFEST.tsv",
      `${lines.join("\n")}\n10\t10_extra.md\t${"A".repeat(64)}\tCURRENT\n`,
    );
    const codes = issueCodes(validateFixture(fixture));
    expect(codes).toContain("SOURCE_MANIFEST_EXTRA_ROW");
    expect(codes).toContain("SOURCE_MANIFEST_FILENAME_MISMATCH");
    expect(codes).toContain("SOURCE_MANIFEST_STATUS_INVALID");
  });

  it("passes when Source bytes and the corresponding manifest hash advance together", () => {
    const fixture = createFixture();
    const content = "authorized lifecycle source 00\n";
    write(fixture.root, `docs/sources/${EXPECTED_SOURCE_LAYOUT["00"]}`, content);
    updateSourceManifestRow(fixture.root, "00", (fields) => {
      fields[2] = sha256(content);
      return fields;
    });
    expect(validateFixture(fixture)).toEqual([]);
  });

  it("fails when a manifest hash is invalid or drifts without matching Source bytes", () => {
    const invalidFixture = createFixture();
    updateSourceManifestRow(invalidFixture.root, "00", (fields) => {
      fields[2] = "invalid";
      return fields;
    });
    expect(issueCodes(validateFixture(invalidFixture))).toContain("SOURCE_MANIFEST_HASH_INVALID");

    const driftFixture = createFixture();
    updateSourceManifestRow(driftFixture.root, "00", (fields) => {
      fields[2] = "A".repeat(64);
      return fields;
    });
    expect(issueCodes(validateFixture(driftFixture))).toContain("SOURCE_FILE_HASH_MISMATCH");
  });

  it("fails when synchronized source bytes drift", () => {
    const fixture = createFixture();
    write(fixture.root, `docs/sources/${EXPECTED_SOURCE_LAYOUT["00"]}`, "drifted source\n");
    expect(issueCodes(validateFixture(fixture))).toContain("SOURCE_FILE_HASH_MISMATCH");
  });

  it("fails when an RSM-4 product application root appears", () => {
    const fixture = createFixture();
    write(fixture.root, "apps/editor-electron/package.json", "{}\n");
    expect(issueCodes(validateFixture(fixture))).toContain(
      "REPOSITORY_POLICY_FORBIDDEN_EARLY_ROOT",
    );
  });

  it("fails when product content appears in an empty-foundation package", () => {
    const fixture = createFixture();
    write(fixture.root, "packages/core/src/index.ts", "export {};\n");
    expect(issueCodes(validateFixture(fixture))).toContain(
      "REPOSITORY_POLICY_PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION",
    );
  });

  it("fails when root production dependencies are non-empty", () => {
    const fixture = createFixture();
    const packagePath = path.join(fixture.root, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    packageJson.dependencies = { electron: "43.3.0" };
    write(fixture.root, "package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
    expect(issueCodes(validateFixture(fixture))).toContain("PRODUCTION_DEPENDENCIES_FORBIDDEN");
  });

  it("fails when a direct development dependency is unauthorized or inexact", () => {
    const fixture = createFixture();
    const packagePath = path.join(fixture.root, "package.json");
    const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
    packageJson.devDependencies.vitest = "3.2.5";
    packageJson.devDependencies.vite = "8.2.0";
    write(fixture.root, "package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
    const codes = issueCodes(validateFixture(fixture));
    expect(codes).toContain("REPOSITORY_POLICY_DIRECT_DEPENDENCY_MISSING_OR_INEXACT");
    expect(codes).toContain("REPOSITORY_POLICY_UNAUTHORIZED_DIRECT_DEPENDENCY");
  });
});
