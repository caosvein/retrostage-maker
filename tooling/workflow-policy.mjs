import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { validateRepositoryBootstrap } from "./repository-policy.ts";

const MODULE_PATH = fileURLToPath(import.meta.url);
export const REPOSITORY_ROOT = path.resolve(path.dirname(MODULE_PATH), "..");

export const EXPECTED_DIRECT_DEV_DEPENDENCIES = Object.freeze({
  "dependency-cruiser": "16.10.0",
  eslint: "9.21.0",
  knip: "6.32.0",
  prettier: "3.5.2",
  typescript: "6.0.3",
  "typescript-eslint": "8.66.0",
  vitest: "3.2.6",
});

export const EXPECTED_SOURCE_IDENTITIES = Object.freeze({
  "00": Object.freeze({
    filename: "00_RSM_REBOOT_PROJECT_CHARTER.md",
    sha256: "91E8492ECA2AB14A1B8090968E75A214B2892B0A9DBFC015FFE15D61280D510D",
  }),
  "01": Object.freeze({
    filename: "01_RSM_REBOOT_CANONICAL_ROADMAP.md",
    sha256: "F04CAF1A8384E49A349B159DD8FF2EE0C53A988FEFE563D44BCD9C046EEF4B59",
  }),
  "02": Object.freeze({
    filename: "02_RSM_REBOOT_CURRENT_PROJECT_STATE.md",
    sha256: "6D529460E9B7292910D41EDD282B08B02595A86CB7177E5BB297E8FA719BDA8B",
  }),
  "03": Object.freeze({
    filename: "03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md",
    sha256: "B2D3AF3EEEE6166BDF69533894A6E6CD7961BF1DA6A966807D03E3C92E7AB790",
  }),
  "04": Object.freeze({
    filename: "04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md",
    sha256: "E6D8D039ACB5739F48F5135303279C26069CB86F0D033AB49A460F4ED741D95F",
  }),
  "05": Object.freeze({
    filename: "05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md",
    sha256: "B84964F5213D462BBEB3058D78B90BBA64C7465247C9602DE7836A5893774085",
  }),
  "06": Object.freeze({
    filename: "06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md",
    sha256: "37E82204F974036EE81CB8B917935C9D0574E75668746F29B99FC439FA463FE4",
  }),
  "07": Object.freeze({
    filename: "07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md",
    sha256: "46F8AADE2C55468197C646FAB653BBC0205DCD3B57B46FA30144CD3D28FB9745",
  }),
  "08": Object.freeze({
    filename: "08_RSM_REBOOT_CURRENT_MILESTONE.md",
    sha256: "038E16C0C9032630D4A22D2B49EEAAA21712F59DF7EB2DEABFC47B6A7067BAAE",
  }),
  "09": Object.freeze({
    filename: "09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md",
    sha256: "C8CFEB1D4BEA6A4A46E9AB4035DAE1F5CF308F32ADBC756E7437EE3E18CCD016",
  }),
});

export const REQUIRED_PATHS = Object.freeze([
  "docs/sources/SOURCE-MANIFEST.tsv",
  "docs/workflow/RSM-4-ENGINEERING-WORKFLOW.md",
  "docs/workflow/templates/task-plan.md",
  "docs/workflow/templates/evidence-manifest.md",
  "docs/workflow/templates/validation-report.md",
  "docs/workflow/templates/closure-report.md",
  "docs/workflow/templates/dependency-admission.md",
  "docs/workflow/templates/architecture-review.md",
  "docs/workflow/templates/coding-agent-prompt.md",
  "docs/workflow/templates/coding-agent-final-report.md",
  "docs/evidence/rsm-4/RSM-4-MILESTONE-EVIDENCE-MANIFEST.tsv",
  "docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-TASK-PLAN.md",
  "docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-EVIDENCE-MANIFEST.md",
  "docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-VALIDATION-REPORT.md",
  "docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-STAGED-CANDIDATE-REPORT.md",
  "tooling/workflow-policy.mjs",
  "tooling/workflow-policy.test.mjs",
]);

export const REQUIRED_TEXT_FRAGMENTS = Object.freeze({
  "docs/workflow/RSM-4-ENGINEERING-WORKFLOW.md": Object.freeze([
    "04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md",
    "07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md",
    "At most one implementation task",
    "commit default = FALSE",
    "push default = FALSE",
    "RSM-4 product implementation = FORBIDDEN",
  ]),
  "docs/workflow/templates/task-plan.md": Object.freeze([
    "## Baseline",
    "## Allowed Scope",
    "## Forbidden Scope",
    "## Validation Requirements",
    "## Negative / Fail-Closed Cases",
    "## Closure Criteria",
    "## Commit / Push Permission",
  ]),
  "docs/workflow/templates/evidence-manifest.md": Object.freeze([
    "OBSERVED",
    "HISTORICAL EVIDENCE",
    "APPROVED CONTRACT",
    "CURRENT INFERENCE",
    "FUTURE ROADMAP INTENT",
    "UNKNOWN",
    "NONE OBSERVED",
  ]),
  "docs/workflow/templates/validation-report.md": Object.freeze([
    "## Baseline and Scope",
    "## Commands and Results",
    "## Negative / Failure Evidence",
    "## Final Repository Inventory",
    "## Decision",
  ]),
  "docs/workflow/templates/closure-report.md": Object.freeze([
    "## Authoritative Contract",
    "## Acceptance Matrix",
    "## Repository / Commit / Remote Evidence",
    "## Final Decision",
    "## Next Handoff",
  ]),
  "docs/workflow/templates/dependency-admission.md": Object.freeze([
    "NO DEPENDENCY CHANGE",
    "## Exact Identity and Need",
    "## Authority and Adapter Boundary",
    "Native/WASM",
    "SBOM",
    "Replacement/removal path",
  ]),
  "docs/workflow/templates/architecture-review.md": Object.freeze([
    "## Authority Ownership",
    "## Dependency Direction",
    "## Technology Boundaries",
    "## Data Safety",
    "## Preview / PIE / Export",
    "## Editor / Player Separation",
    "## Commercial Artifacts",
    "## Direct Evidence",
  ]),
  "docs/workflow/templates/coding-agent-prompt.md": Object.freeze([
    "## Expected Baseline and Authority",
    "## Allowed Scope",
    "## Forbidden Scope",
    "## Validation Requirements",
    "## Negative / Fail-Closed Cases",
    "## Commit / Push Permission",
  ]),
  "docs/workflow/templates/coding-agent-final-report.md": Object.freeze([
    "## Actual Baseline and Sources Read",
    "## Changes Made and Files Changed",
    "## Commands, Tests, Failures, and Warnings",
    "## Final Repository State",
    "## Recommended Next Review Action",
  ]),
  "docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-TASK-PLAN.md": Object.freeze([
    "## Baseline",
    "## Allowed Scope",
    "## Forbidden Scope",
    "## Validation Requirements",
    "## Closure Criteria",
  ]),
});

function issue(code, detail) {
  return { code, detail };
}

function normalizePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//u, "");
}

export function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

function sha256File(filePath) {
  return sha256Bytes(readFileSync(filePath));
}

function readUtf8(filePath) {
  return readFileSync(filePath, "utf8").replace(/^\uFEFF/u, "");
}

export function parseTsv(text) {
  const lines = text
    .replace(/^\uFEFF/u, "")
    .replaceAll("\r\n", "\n")
    .split("\n");
  const nonEmpty = lines.filter((line) => line.length > 0);
  if (nonEmpty.length === 0) return { headers: [], rows: [] };
  const headers = nonEmpty[0].split("\t");
  const rows = nonEmpty.slice(1).map((line) => {
    const values = line.split("\t");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
  return { headers, rows };
}

function walkFiles(rootPath, currentPath = rootPath) {
  const files = [];
  for (const entry of readdirSync(currentPath, { withFileTypes: true })) {
    if (entry.isDirectory() && new Set([".git", "dist", "node_modules"]).has(entry.name)) continue;
    const absolute = path.join(currentPath, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(rootPath, absolute));
    else if (entry.isFile()) files.push(normalizePath(path.relative(rootPath, absolute)));
  }
  return files.sort((left, right) => left.localeCompare(right, "en"));
}

function validateRequiredPaths(rootPath, issues) {
  for (const relativePath of REQUIRED_PATHS) {
    if (!existsSync(path.join(rootPath, relativePath))) {
      issues.push(issue("REQUIRED_PATH_MISSING", relativePath));
    }
  }
}

function validateRequiredText(rootPath, issues) {
  for (const [relativePath, fragments] of Object.entries(REQUIRED_TEXT_FRAGMENTS)) {
    const absolute = path.join(rootPath, relativePath);
    if (!existsSync(absolute)) continue;
    const text = readUtf8(absolute);
    for (const fragment of fragments) {
      if (!text.includes(fragment)) {
        issues.push(issue("REQUIRED_TEMPLATE_FIELD_MISSING", `${relativePath}: ${fragment}`));
      }
    }
  }
}

function validateSourceManifest(rootPath, expectedSources, issues) {
  const manifestPath = path.join(rootPath, "docs", "sources", "SOURCE-MANIFEST.tsv");
  if (!existsSync(manifestPath)) return;
  const { headers, rows } = parseTsv(readUtf8(manifestPath));
  const expectedHeaders = ["source_id", "filename", "sha256", "status"];
  if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
    issues.push(issue("SOURCE_MANIFEST_SCHEMA_INVALID", headers.join(",")));
  }

  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.source_id)) {
      issues.push(issue("SOURCE_MANIFEST_DUPLICATE_ROW", row.source_id));
      continue;
    }
    seen.add(row.source_id);
    const expected = expectedSources[row.source_id];
    if (!expected) {
      issues.push(issue("SOURCE_MANIFEST_EXTRA_ROW", row.source_id));
      continue;
    }
    if (row.filename !== expected.filename) {
      issues.push(
        issue(
          "SOURCE_MANIFEST_FILENAME_MISMATCH",
          `${row.source_id}: ${row.filename} != ${expected.filename}`,
        ),
      );
    }
    if (row.sha256 !== expected.sha256) {
      issues.push(
        issue(
          "SOURCE_MANIFEST_HASH_MISMATCH",
          `${row.source_id}: ${row.sha256} != ${expected.sha256}`,
        ),
      );
    }
    if (row.status !== "CURRENT") {
      issues.push(issue("SOURCE_MANIFEST_STATUS_INVALID", `${row.source_id}: ${row.status}`));
    }
    const sourcePath = path.join(rootPath, "docs", "sources", expected.filename);
    if (!existsSync(sourcePath)) {
      issues.push(issue("SOURCE_FILE_MISSING", expected.filename));
    } else {
      const observed = sha256File(sourcePath);
      if (observed !== expected.sha256) {
        issues.push(
          issue("SOURCE_FILE_HASH_MISMATCH", `${row.source_id}: ${observed} != ${expected.sha256}`),
        );
      }
    }
  }
  for (const sourceId of Object.keys(expectedSources)) {
    if (!seen.has(sourceId)) issues.push(issue("SOURCE_MANIFEST_MISSING_ROW", sourceId));
  }
}

function validateMilestoneManifest(rootPath, issues) {
  const manifestPath = path.join(
    rootPath,
    "docs",
    "evidence",
    "rsm-4",
    "RSM-4-MILESTONE-EVIDENCE-MANIFEST.tsv",
  );
  if (!existsSync(manifestPath)) return;
  const { headers, rows } = parseTsv(readUtf8(manifestPath));
  const expectedHeaders = [
    "milestone_id",
    "task_id",
    "title",
    "status",
    "evidence_path",
    "decision",
  ];
  if (JSON.stringify(headers) !== JSON.stringify(expectedHeaders)) {
    issues.push(issue("MILESTONE_MANIFEST_SCHEMA_INVALID", headers.join(",")));
  }
  const active = rows.filter((row) => row.status === "ACTIVE");
  if (active.length > 1) {
    issues.push(issue("MULTIPLE_ACTIVE_TASKS", active.map((row) => row.task_id).join(",")));
  }
  const taskIds = new Set();
  for (const row of rows) {
    if (taskIds.has(row.task_id)) issues.push(issue("DUPLICATE_MILESTONE_TASK", row.task_id));
    taskIds.add(row.task_id);
    if (row.evidence_path && !existsSync(path.join(rootPath, row.evidence_path))) {
      issues.push(issue("TASK_EVIDENCE_PATH_MISSING", row.evidence_path));
    }
  }
}

function readPackageNames(rootPath) {
  const result = {};
  const packagesPath = path.join(rootPath, "packages");
  if (!existsSync(packagesPath)) return result;
  for (const entry of readdirSync(packagesPath, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const relative = `packages/${entry.name}`;
    const manifest = path.join(packagesPath, entry.name, "package.json");
    if (existsSync(manifest)) result[relative] = JSON.parse(readUtf8(manifest)).name ?? "";
  }
  return result;
}

function validateRepositoryAndDependencies(rootPath, repositoryPaths, issues) {
  const packagePath = path.join(rootPath, "package.json");
  if (!existsSync(packagePath)) {
    issues.push(issue("ROOT_PACKAGE_MISSING", "package.json"));
    return;
  }
  const rootPackage = JSON.parse(readUtf8(packagePath));
  if (Object.keys(rootPackage.dependencies ?? {}).length !== 0) {
    issues.push(
      issue("PRODUCTION_DEPENDENCIES_FORBIDDEN", JSON.stringify(rootPackage.dependencies)),
    );
  }
  if (rootPackage.scripts?.["workflow:check"] !== "node tooling/workflow-policy.mjs") {
    issues.push(issue("WORKFLOW_SCRIPT_MISSING_OR_INEXACT", "workflow:check"));
  }
  if (!String(rootPackage.scripts?.validate ?? "").includes("pnpm run workflow:check")) {
    issues.push(issue("VALIDATE_CHAIN_MISSING_WORKFLOW_CHECK", "validate"));
  }

  const bootstrapIssues = validateRepositoryBootstrap({
    repositoryPaths,
    directDevDependencies: rootPackage.devDependencies ?? {},
    packageNames: readPackageNames(rootPath),
  });
  for (const bootstrapIssue of bootstrapIssues) {
    issues.push(issue(`REPOSITORY_POLICY_${bootstrapIssue.code}`, bootstrapIssue.detail));
  }
}

export function validateWorkflowRepository(rootPath, options = {}) {
  const resolvedRoot = path.resolve(rootPath);
  const issues = [];
  const expectedSources = options.expectedSources ?? EXPECTED_SOURCE_IDENTITIES;
  const repositoryPaths = options.repositoryPaths ?? walkFiles(resolvedRoot);
  validateRequiredPaths(resolvedRoot, issues);
  validateRequiredText(resolvedRoot, issues);
  validateSourceManifest(resolvedRoot, expectedSources, issues);
  validateMilestoneManifest(resolvedRoot, issues);
  validateRepositoryAndDependencies(resolvedRoot, repositoryPaths, issues);
  return issues.sort((left, right) =>
    `${left.code}:${left.detail}`.localeCompare(`${right.code}:${right.detail}`, "en"),
  );
}

function main() {
  const issues = validateWorkflowRepository(REPOSITORY_ROOT);
  const result = {
    result: issues.length === 0 ? "PASS" : "BLOCKED",
    repository: normalizePath(REPOSITORY_ROOT),
    sourceRowsExpected: Object.keys(EXPECTED_SOURCE_IDENTITIES).length,
    requiredPaths: REQUIRED_PATHS.length,
    issueCount: issues.length,
    issues,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (issues.length !== 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) main();
