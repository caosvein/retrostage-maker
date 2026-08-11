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

export const EXPECTED_SOURCE_LAYOUT = Object.freeze({
  "00": "00_RSM_REBOOT_PROJECT_CHARTER.md",
  "01": "01_RSM_REBOOT_CANONICAL_ROADMAP.md",
  "02": "02_RSM_REBOOT_CURRENT_PROJECT_STATE.md",
  "03": "03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md",
  "04": "04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md",
  "05": "05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md",
  "06": "06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md",
  "07": "07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md",
  "08": "08_RSM_REBOOT_CURRENT_MILESTONE.md",
  "09": "09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md",
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

function validateSourceManifest(rootPath, expectedSourceLayout, issues) {
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
    const expectedFilename = expectedSourceLayout[row.source_id];
    if (!expectedFilename) {
      issues.push(issue("SOURCE_MANIFEST_EXTRA_ROW", row.source_id));
      continue;
    }
    if (row.filename !== expectedFilename) {
      issues.push(
        issue(
          "SOURCE_MANIFEST_FILENAME_MISMATCH",
          `${row.source_id}: ${row.filename} != ${expectedFilename}`,
        ),
      );
    }
    const manifestHashIsValid = /^[0-9A-F]{64}$/u.test(row.sha256);
    if (!manifestHashIsValid) {
      issues.push(issue("SOURCE_MANIFEST_HASH_INVALID", `${row.source_id}: ${row.sha256}`));
    }
    if (row.status !== "CURRENT") {
      issues.push(issue("SOURCE_MANIFEST_STATUS_INVALID", `${row.source_id}: ${row.status}`));
    }
    const sourcePath = path.join(rootPath, "docs", "sources", expectedFilename);
    if (!existsSync(sourcePath)) {
      issues.push(issue("SOURCE_FILE_MISSING", expectedFilename));
    } else {
      const observed = sha256File(sourcePath);
      if (manifestHashIsValid && observed !== row.sha256) {
        issues.push(
          issue("SOURCE_FILE_HASH_MISMATCH", `${row.source_id}: ${observed} != ${row.sha256}`),
        );
      }
    }
  }
  for (const sourceId of Object.keys(expectedSourceLayout)) {
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
  const expectedSourceLayout = options.expectedSourceLayout ?? EXPECTED_SOURCE_LAYOUT;
  const repositoryPaths = options.repositoryPaths ?? walkFiles(resolvedRoot);
  validateRequiredPaths(resolvedRoot, issues);
  validateRequiredText(resolvedRoot, issues);
  validateSourceManifest(resolvedRoot, expectedSourceLayout, issues);
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
    sourceRowsExpected: Object.keys(EXPECTED_SOURCE_LAYOUT).length,
    requiredPaths: REQUIRED_PATHS.length,
    issueCount: issues.length,
    issues,
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (issues.length !== 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) main();
