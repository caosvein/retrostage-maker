import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import {
  EXPECTED_APPLICATION_DEV_DEPENDENCIES,
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
          "electron:acquire": "node apps/editor-electron/node_modules/electron/install.js",
          "electron:build": "pnpm --dir apps/editor-electron run build",
          "electron:package": "pnpm --dir apps/editor-electron run package",
          "electron:smoke": "pnpm --dir apps/editor-electron run smoke",
          "workflow:check": "node tooling/workflow-policy.mjs",
          "compliance:check": "node tooling/compliance/check.mjs",
          "dependency:audit": "pnpm audit --audit-level low",
          validate:
            "pnpm run format:check && pnpm run lint && pnpm run typecheck && pnpm run test && pnpm run arch:check && pnpm run deadcode:check && pnpm run electron:acquire && pnpm run build && pnpm run workflow:check && pnpm run electron:package && pnpm run electron:smoke && pnpm run compliance:check && pnpm run dependency:audit",
        },
        devDependencies: EXPECTED_DIRECT_DEV_DEPENDENCIES,
      },
      null,
      2,
    )}\n`,
  );
  write(
    root,
    "apps/editor-electron/package.json",
    `${JSON.stringify(
      {
        name: "@retrostage/editor-electron",
        private: true,
        type: "module",
        devDependencies: EXPECTED_APPLICATION_DEV_DEPENDENCIES,
      },
      null,
      2,
    )}\n`,
  );
  write(
    root,
    "pnpm-workspace.yaml",
    `packages:\n  - "packages/*"\n  - "apps/*"\n\nautoInstallPeers: false\nblockExoticSubdeps: false\nstrictPeerDependencies: true\nignoreScripts: true\nsavePrefix: ""\nminimumReleaseAgeExclude:\n  - electron@43.5.0\noverrides:\n  js-yaml: 4.3.2\n  tar: 7.5.22\n  "eslint@9.21.0>@eslint/plugin-kit": 0.3.4\n`,
  );
  write(
    root,
    "pnpm-lock.yaml",
    `lockfileVersion: '9.0'\noverrides:\n  js-yaml: 4.3.2\n  eslint@9.21.0>@eslint/plugin-kit: 0.3.4\n  tar: 7.5.22\npackages:\n  '@eslint/plugin-kit@0.3.4': {}\n  '@electron/node-gyp@https://codeload.github.com/electron/node-gyp/tar.gz/06b29aafb7708acef8b3669835c8a7857ebc92d2': {}\n  electron@43.5.0: {}\n  js-yaml@4.3.2: {}\n  tar@7.5.22: {}\n`,
  );
  for (const [packagePath, name] of [
    ["packages/core", "@retrostage/core"],
    ["packages/diagnostics", "@retrostage/diagnostics"],
    ["packages/renderer-babylon9", "@retrostage/renderer-babylon9"],
    ["packages/test-fixtures", "@retrostage/test-fixtures"],
  ]) {
    write(root, `${packagePath}/package.json`, `${JSON.stringify({ name }, null, 2)}\n`);
  }
  write(
    root,
    ".github/workflows/ci.yml",
    [
      "name: Fixture CI",
      "jobs:",
      "  validation:",
      "    steps:",
      "      - name: Install",
      "        shell: pwsh",
      "        run: pnpm install --frozen-lockfile",
      "      - name: Validate",
      "        shell: pwsh",
      "        run: pnpm run validate",
      "",
    ].join("\n"),
  );
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

function mutateFixtureWorkflow(fixture, mutate) {
  const workflowPath = path.join(fixture.root, ".github/workflows/ci.yml");
  const current = readFileSync(workflowPath, "utf8");
  write(fixture.root, ".github/workflows/ci.yml", mutate(current));
}

function mutateFixturePackage(fixture, mutate) {
  const packagePath = path.join(fixture.root, "package.json");
  const current = JSON.parse(readFileSync(packagePath, "utf8"));
  mutate(current);
  write(fixture.root, "package.json", `${JSON.stringify(current, null, 2)}\n`);
}

const APPROVED_NODE_GYP_COMMIT = "06b29aafb7708acef8b3669835c8a7857ebc92d2";
const APPROVED_NODE_GYP_CODELOAD = `https://codeload.github.com/electron/node-gyp/tar.gz/${APPROVED_NODE_GYP_COMMIT}`;
const APPROVED_NODE_GYP_GIT = `git+https://github.com/electron/node-gyp.git#${APPROVED_NODE_GYP_COMMIT}`;

function replaceNodeGypSource(fixture, replacement) {
  const lockPath = path.join(fixture.root, "pnpm-lock.yaml");
  const lock = readFileSync(lockPath, "utf8").replace(APPROVED_NODE_GYP_CODELOAD, replacement);
  write(fixture.root, "pnpm-lock.yaml", lock);
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

  it.each([
    [
      "direct compliance execution",
      "HOSTED_DIRECT_COMPLIANCE_GATE_PRESENT",
      (workflow) =>
        `${workflow}      - name: Duplicate compliance\n        run: pnpm run compliance:check\n`,
    ],
    [
      "direct dependency-audit execution",
      "HOSTED_DIRECT_DEPENDENCY_AUDIT_PRESENT",
      (workflow) =>
        `${workflow}      - name: Duplicate audit\n        run: pnpm run dependency:audit\n`,
    ],
    [
      "ci:validate execution",
      "HOSTED_CI_VALIDATE_PRESENT",
      (workflow) =>
        `${workflow}      - name: Forbidden wrapper\n        run: pnpm run ci:validate\n`,
    ],
    [
      "a missing frozen install",
      "HOSTED_FROZEN_INSTALL_COUNT_INVALID",
      (workflow) => workflow.replace("pnpm install --frozen-lockfile", "pnpm install"),
    ],
    [
      "a duplicate frozen install",
      "HOSTED_FROZEN_INSTALL_COUNT_INVALID",
      (workflow) =>
        `${workflow}      - name: Duplicate install\n        run: pnpm install --frozen-lockfile\n`,
    ],
    [
      "a missing validate invocation",
      "HOSTED_VALIDATE_COUNT_INVALID",
      (workflow) => workflow.replace("pnpm run validate", "pnpm run typecheck"),
    ],
    [
      "a duplicate validate invocation",
      "HOSTED_VALIDATE_COUNT_INVALID",
      (workflow) => `${workflow}      - name: Duplicate validate\n        run: pnpm run validate\n`,
    ],
    [
      "validate before install",
      "HOSTED_COMMAND_ORDER_INVALID",
      (workflow) =>
        workflow
          .replace("pnpm install --frozen-lockfile", "__VALIDATE__")
          .replace("pnpm run validate", "pnpm install --frozen-lockfile")
          .replace("__VALIDATE__", "pnpm run validate"),
    ],
    [
      "continue-on-error on validate",
      "HOSTED_VALIDATE_CONTINUE_ON_ERROR",
      (workflow) =>
        workflow.replace(
          "        run: pnpm run validate",
          "        continue-on-error: true\n        run: pnpm run validate",
        ),
    ],
  ])("fails closed on hosted workflow %s", (_name, expectedCode, mutate) => {
    const fixture = createFixture();
    mutateFixtureWorkflow(fixture, mutate);
    expect(issueCodes(validateFixture(fixture))).toContain(expectedCode);
  });

  it.each([
    ["pnpm.cmd run compliance:check", "HOSTED_DIRECT_COMPLIANCE_GATE_PRESENT"],
    ["pnpm run --silent compliance:check", "HOSTED_DIRECT_COMPLIANCE_GATE_PRESENT"],
    ["pnpm.cmd run dependency:audit", "HOSTED_DIRECT_DEPENDENCY_AUDIT_PRESENT"],
    ["pnpm run --silent dependency:audit", "HOSTED_DIRECT_DEPENDENCY_AUDIT_PRESENT"],
    ["pnpm.cmd run ci:validate", "HOSTED_CI_VALIDATE_PRESENT"],
    ["pnpm run --silent ci:validate", "HOSTED_CI_VALIDATE_PRESENT"],
    ["pnpm.cmd run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["pnpm run --silent validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["pnpm.cmd install --frozen-lockfile", "HOSTED_SEMANTIC_INSTALL_COUNT_INVALID"],
    ["pnpm --silent install --frozen-lockfile", "HOSTED_SEMANTIC_INSTALL_COUNT_INVALID"],
    ["pnpm.ps1 run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["pnpm.exe run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["PNPM.PS1 run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["pnpm.ps1 --silent run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["C:/tools/pnpm.ps1 run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["C:/tools/pnpm.cmd run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["C:/tools/pnpm.exe run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["$env:PNPM_HOME/pnpm.ps1 run validate", "HOSTED_SEMANTIC_VALIDATE_COUNT_INVALID"],
    ["pnpm.ps1 install --frozen-lockfile", "HOSTED_SEMANTIC_INSTALL_COUNT_INVALID"],
    ["pnpm.exe install --frozen-lockfile", "HOSTED_SEMANTIC_INSTALL_COUNT_INVALID"],
    ["C:/tools/pnpm.ps1 install --frozen-lockfile", "HOSTED_SEMANTIC_INSTALL_COUNT_INVALID"],
    ["node tooling/compliance/check.mjs", "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT"],
    ["node ./tooling/compliance/check.mjs", "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT"],
    ["node tooling\\compliance\\check.mjs", "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT"],
    ["node .\\tooling\\compliance\\check.mjs", "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT"],
    [
      "node C:\\repo\\tooling\\compliance\\check.mjs",
      "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT",
    ],
    [
      "node C:/repo/tooling/compliance/check.mjs",
      "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT",
    ],
    [
      "node C:/repo\\tooling/compliance\\check.mjs",
      "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT",
    ],
    [
      "pnpm exec node .\\tooling\\compliance\\check.mjs",
      "HOSTED_DIRECT_COMPLIANCE_IMPLEMENTATION_PRESENT",
    ],
    ["pnpm audit --audit-level low", "HOSTED_DIRECT_PNPM_AUDIT_PRESENT"],
    ["pnpm audit --audit-level=low", "HOSTED_DIRECT_PNPM_AUDIT_PRESENT"],
    ["pnpm --silent audit --audit-level low", "HOSTED_DIRECT_PNPM_AUDIT_PRESENT"],
  ])("fails closed on semantic hosted alias %s", (command, expectedCode) => {
    const fixture = createFixture();
    mutateFixtureWorkflow(
      fixture,
      (workflow) => `${workflow}      - name: Semantic alias\n        run: ${command}\n`,
    );
    expect(issueCodes(validateFixture(fixture))).toContain(expectedCode);
  });

  it.each(["${{ true }}", "${{ matrix.allowed_failure }}"])(
    "fails closed on validate continue-on-error value %s",
    (value) => {
      const fixture = createFixture();
      mutateFixtureWorkflow(fixture, (workflow) =>
        workflow.replace(
          "        run: pnpm run validate",
          `        continue-on-error: ${value}\n        run: pnpm run validate`,
        ),
      );
      expect(issueCodes(validateFixture(fixture))).toContain("HOSTED_VALIDATE_CONTINUE_ON_ERROR");
    },
  );

  it.each([
    [
      "missing compliance",
      "VALIDATE_TERMINAL_GATE_MISSING",
      (scripts) => {
        scripts.validate = "pnpm run workflow:check && pnpm run dependency:audit";
      },
    ],
    [
      "missing audit",
      "VALIDATE_TERMINAL_GATE_MISSING",
      (scripts) => {
        scripts.validate = "pnpm run workflow:check && pnpm run compliance:check";
      },
    ],
    [
      "reversed terminal gates",
      "VALIDATE_TERMINAL_GATE_ORDER_INVALID",
      (scripts) => {
        scripts.validate =
          "pnpm run workflow:check && pnpm run dependency:audit && pnpm run compliance:check";
      },
    ],
    [
      "duplicated compliance",
      "VALIDATE_TERMINAL_GATE_DUPLICATED",
      (scripts) => {
        scripts.validate =
          "pnpm run compliance:check && pnpm run workflow:check && pnpm run compliance:check && pnpm run dependency:audit";
      },
    ],
    [
      "duplicated audit",
      "VALIDATE_TERMINAL_GATE_DUPLICATED",
      (scripts) => {
        scripts.validate =
          "pnpm run dependency:audit && pnpm run workflow:check && pnpm run compliance:check && pnpm run dependency:audit";
      },
    ],
    [
      "a command after dependency audit",
      "VALIDATE_FAIL_STOP_CHAIN_INVALID",
      (scripts) => {
        scripts.validate =
          "pnpm run workflow:check && pnpm run compliance:check && pnpm run dependency:audit && pnpm run typecheck";
      },
    ],
    [
      "a non-fail-stop terminal separator",
      "VALIDATE_FAIL_STOP_CHAIN_INVALID",
      (scripts) => {
        scripts.validate =
          "pnpm run workflow:check && pnpm run compliance:check ; pnpm run dependency:audit";
      },
    ],
    [
      "a swallowed failure before the terminal gates",
      "VALIDATE_FAIL_STOP_CHAIN_INVALID",
      (scripts) => {
        scripts.validate =
          "pnpm run workflow:check || true && pnpm run compliance:check && pnpm run dependency:audit";
      },
    ],
    [
      "a direct compliance implementation bypass",
      "VALIDATE_NAMED_GATE_BYPASS",
      (scripts) => {
        scripts.validate =
          "node tooling/compliance/check.mjs && pnpm run compliance:check && pnpm run dependency:audit";
      },
    ],
    [
      "a direct dependency-audit implementation bypass",
      "VALIDATE_NAMED_GATE_BYPASS",
      (scripts) => {
        scripts.validate =
          "pnpm audit --audit-level low && pnpm run compliance:check && pnpm run dependency:audit";
      },
    ],
  ])("fails closed on package validate %s", (_name, expectedCode, mutate) => {
    const fixture = createFixture();
    mutateFixturePackage(fixture, ({ scripts }) => mutate(scripts));
    expect(issueCodes(validateFixture(fixture))).toContain(expectedCode);
  });

  it.each([
    "node ./tooling/compliance/check.mjs && ",
    "pnpm audit --audit-level=low && ",
    "pnpm --silent audit --audit-level low && ",
    "echo harmless && ",
  ])("fails closed on complete package validate identity drift: %s", (prefix) => {
    const fixture = createFixture();
    mutateFixturePackage(fixture, ({ scripts }) => {
      scripts.validate = `${prefix}${scripts.validate}`;
    });
    expect(issueCodes(validateFixture(fixture))).toContain("VALIDATE_SCRIPT_IDENTITY_DRIFT");
  });

  it("fails closed on a harmless-looking package validate suffix", () => {
    const fixture = createFixture();
    mutateFixturePackage(fixture, ({ scripts }) => {
      scripts.validate = `${scripts.validate} && echo done`;
    });
    expect(issueCodes(validateFixture(fixture))).toContain("VALIDATE_SCRIPT_IDENTITY_DRIFT");
  });

  it("fails closed on package validate whitespace drift", () => {
    const fixture = createFixture();
    mutateFixturePackage(fixture, ({ scripts }) => {
      scripts.validate = ` ${scripts.validate}`;
    });
    expect(issueCodes(validateFixture(fixture))).toContain("VALIDATE_SCRIPT_IDENTITY_DRIFT");
  });

  it.each([
    ["compliance:check", "node tooling/compliance/generate.mjs"],
    ["dependency:audit", "pnpm audit --audit-level moderate"],
  ])("fails closed when the %s named gate identity drifts", (name, command) => {
    const fixture = createFixture();
    mutateFixturePackage(fixture, ({ scripts }) => {
      scripts[name] = command;
    });
    expect(issueCodes(validateFixture(fixture))).toContain("NAMED_GATE_SCRIPT_IDENTITY_DRIFT");
  });

  it("accepts the exact codeload node-gyp repository and commit identity", () => {
    expect(validateFixture(createFixture())).toEqual([]);
  });

  it("accepts the pnpm-normal git+https node-gyp repository and commit identity", () => {
    const fixture = createFixture();
    replaceNodeGypSource(fixture, APPROVED_NODE_GYP_GIT);
    expect(validateFixture(fixture)).toEqual([]);
  });

  it("rejects a wrong node-gyp commit", () => {
    const fixture = createFixture();
    replaceNodeGypSource(fixture, `git+https://github.com/electron/node-gyp.git#${"a".repeat(40)}`);
    expect(issueCodes(validateFixture(fixture))).toContain("EXOTIC_SOURCE_SET_INVALID");
  });

  it("rejects a wrong node-gyp repository owner", () => {
    const fixture = createFixture();
    replaceNodeGypSource(
      fixture,
      `git+https://github.com/example/node-gyp.git#${APPROVED_NODE_GYP_COMMIT}`,
    );
    expect(issueCodes(validateFixture(fixture))).toContain("EXOTIC_SOURCE_SET_INVALID");
  });

  it("rejects a short node-gyp commit", () => {
    const fixture = createFixture();
    replaceNodeGypSource(
      fixture,
      `git+https://github.com/electron/node-gyp.git#${APPROVED_NODE_GYP_COMMIT.slice(0, 12)}`,
    );
    expect(issueCodes(validateFixture(fixture))).toContain("EXOTIC_SOURCE_SET_INVALID");
  });

  it("rejects git+http for the approved node-gyp identity", () => {
    const fixture = createFixture();
    replaceNodeGypSource(
      fixture,
      `git+http://github.com/electron/node-gyp.git#${APPROVED_NODE_GYP_COMMIT}`,
    );
    expect(issueCodes(validateFixture(fixture))).toContain("EXOTIC_SOURCE_SET_INVALID");
  });

  it("rejects git+ssh for the approved node-gyp identity", () => {
    const fixture = createFixture();
    replaceNodeGypSource(
      fixture,
      `git+ssh://git@github.com/electron/node-gyp.git#${APPROVED_NODE_GYP_COMMIT}`,
    );
    expect(issueCodes(validateFixture(fixture))).toContain("EXOTIC_SOURCE_SET_INVALID");
  });

  it("rejects a second exotic source", () => {
    const fixture = createFixture();
    const lock = readFileSync(path.join(fixture.root, "pnpm-lock.yaml"), "utf8");
    write(
      fixture.root,
      "pnpm-lock.yaml",
      `${lock}  x@https://codeload.github.com/example/x/tar.gz/${"a".repeat(40)}: {}\n`,
    );
    expect(issueCodes(validateFixture(fixture))).toContain("EXOTIC_SOURCE_SET_INVALID");
  });

  it("rejects a missing approved node-gyp source", () => {
    const fixture = createFixture();
    replaceNodeGypSource(fixture, "registry-only-node-gyp");
    expect(issueCodes(validateFixture(fixture))).toContain("EXOTIC_SOURCE_SET_INVALID");
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
  });

  it("fails when the Source manifest schema is invalid", () => {
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

  it("fails when an unexpected application root appears", () => {
    const fixture = createFixture();
    write(fixture.root, "apps/player-electron/package.json", "{}\n");
    expect(issueCodes(validateFixture(fixture))).toContain(
      "REPOSITORY_POLICY_UNAUTHORIZED_APPLICATION_PATH",
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
    packageJson.devDependencies.vitest = "4.1.10";
    packageJson.devDependencies.vite = "8.2.0";
    write(fixture.root, "package.json", `${JSON.stringify(packageJson, null, 2)}\n`);
    const codes = issueCodes(validateFixture(fixture));
    expect(codes).toContain("REPOSITORY_POLICY_ROOT_DIRECT_DEPENDENCY_MISSING_OR_INEXACT");
    expect(codes).toContain("REPOSITORY_POLICY_ROOT_DIRECT_UNAUTHORIZED_DEPENDENCY");
  });

  it("fails closed when the js-yaml override or lock identity is missing or drifted", () => {
    for (const [relativePath, accepted, rejected, expectedCode] of [
      ["pnpm-workspace.yaml", "  js-yaml: 4.3.2\n", "", "WORKSPACE_POLICY_DRIFT"],
      ["pnpm-workspace.yaml", "js-yaml: 4.3.2", "js-yaml: 4.3.1", "WORKSPACE_POLICY_DRIFT"],
      ["pnpm-lock.yaml", "  js-yaml: 4.3.2\n", "", "LOCK_IDENTITY_MISSING"],
      ["pnpm-lock.yaml", "js-yaml@4.3.2:", "js-yaml@4.3.1:", "LOCK_IDENTITY_MISSING"],
    ]) {
      const fixture = createFixture();
      const fixturePath = path.join(fixture.root, relativePath);
      const content = readFileSync(fixturePath, "utf8").replace(accepted, rejected);
      write(fixture.root, relativePath, content);
      expect(issueCodes(validateFixture(fixture))).toContain(expectedCode);
    }
  });

  it("fails closed on plugin-vite, Vite downgrade, tar drift, a second exotic and missing security control", () => {
    const pluginFixture = createFixture();
    const appPath = path.join(pluginFixture.root, "apps/editor-electron/package.json");
    const appPackage = JSON.parse(readFileSync(appPath, "utf8"));
    appPackage.devDependencies["@electron-forge/plugin-vite"] = "7.11.2";
    appPackage.devDependencies.vite = "7.3.6";
    write(
      pluginFixture.root,
      "apps/editor-electron/package.json",
      `${JSON.stringify(appPackage, null, 2)}\n`,
    );
    const pluginCodes = issueCodes(validateFixture(pluginFixture));
    expect(pluginCodes).toContain("REPOSITORY_POLICY_APPLICATION_DIRECT_UNAUTHORIZED_DEPENDENCY");
    expect(pluginCodes).toContain(
      "REPOSITORY_POLICY_APPLICATION_DIRECT_DEPENDENCY_MISSING_OR_INEXACT",
    );

    const supplyFixture = createFixture();
    const workspace = readFileSync(
      path.join(supplyFixture.root, "pnpm-workspace.yaml"),
      "utf8",
    ).replace("tar: 7.5.22", "tar: 7.5.20");
    write(supplyFixture.root, "pnpm-workspace.yaml", workspace);
    const lock = `${readFileSync(path.join(supplyFixture.root, "pnpm-lock.yaml"), "utf8")}  x@https://codeload.github.com/example/x/tar.gz/${"a".repeat(40)}: {}\n`;
    write(supplyFixture.root, "pnpm-lock.yaml", lock);
    expect(issueCodes(validateFixture(supplyFixture))).toEqual(
      expect.arrayContaining(["WORKSPACE_POLICY_DRIFT", "EXOTIC_SOURCE_SET_INVALID"]),
    );

    const scriptFixture = createFixture();
    const rootPath = path.join(scriptFixture.root, "package.json");
    const rootPackage = JSON.parse(readFileSync(rootPath, "utf8"));
    delete rootPackage.scripts["electron:smoke"];
    write(scriptFixture.root, "package.json", `${JSON.stringify(rootPackage, null, 2)}\n`);
    expect(issueCodes(validateFixture(scriptFixture))).toContain(
      "ELECTRON_SCRIPT_MISSING_OR_INEXACT",
    );

    const securityFixture = createFixture();
    const mainPath = "apps/editor-electron/src/main/main.ts";
    const main = readFileSync(path.join(securityFixture.root, mainPath), "utf8").replace(
      "nodeIntegration: false",
      "nodeIntegration: true",
    );
    write(securityFixture.root, mainPath, main);
    expect(issueCodes(validateFixture(securityFixture))).toContain(
      "REQUIRED_TEMPLATE_FIELD_MISSING",
    );

    const preloadFixture = createFixture();
    write(
      preloadFixture.root,
      "apps/editor-electron/src/preload/preload.ts",
      `${readFileSync(
        path.join(preloadFixture.root, "apps/editor-electron/src/preload/preload.ts"),
        "utf8",
      )}\nvoid process.env;\n`,
    );
    expect(issueCodes(validateFixture(preloadFixture))).toContain(
      "PRELOAD_PRIVILEGED_SURFACE_PRESENT",
    );
  });
});
