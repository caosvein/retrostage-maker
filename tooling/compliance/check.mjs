import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { generateCompliance } from "./generate.mjs";
import {
  BASELINE_HOST,
  HOST_SENSITIVE_ARTIFACTS,
  PLATFORM_NEUTRAL_ARTIFACTS,
  complianceComparisonPolicy,
  stableJson,
  validateWorkflowText,
} from "./policy.mjs";

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const COMPLIANCE_ROOT = path.join(REPOSITORY_ROOT, "compliance");
const EXPECTED_LOCK_SHA256 = "CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

function readExact(filePath) {
  if (!existsSync(filePath))
    throw new Error(`Required compliance artifact is missing: ${filePath}`);
  return readFileSync(filePath);
}

function assertEqual(left, right, message) {
  if (!left.equals(right)) throw new Error(message);
}

function assertHostIdentity(actual, expected, context) {
  if (actual?.platform !== expected.platform || actual?.architecture !== expected.architecture) {
    throw new Error(
      `${context} host identity mismatch: ${JSON.stringify(actual)} != ${JSON.stringify(expected)}`,
    );
  }
}

function validateJsonHostArtifact(bytes, expectedSnapshotHost, context) {
  const parsed = JSON.parse(bytes.toString("utf8"));
  assertHostIdentity(parsed.baselineHost, BASELINE_HOST, `${context} baseline`);
  assertHostIdentity(parsed.snapshotHost, expectedSnapshotHost, `${context} snapshot`);
}

function validateHtmlHostArtifact(bytes, expectedSnapshotHost, context) {
  const html = bytes.toString("utf8");
  const required = [
    `<meta name="retrostage-baseline-platform" content="${BASELINE_HOST.platform}">`,
    `<meta name="retrostage-baseline-architecture" content="${BASELINE_HOST.architecture}">`,
    `<meta name="retrostage-snapshot-platform" content="${expectedSnapshotHost.platform}">`,
    `<meta name="retrostage-snapshot-architecture" content="${expectedSnapshotHost.architecture}">`,
  ];
  for (const fragment of required) {
    if (!html.includes(fragment))
      throw new Error(`${context} host declaration missing: ${fragment}`);
  }
}

function validateHostArtifact(name, bytes, expectedSnapshotHost, context) {
  if (name === "THIRD_PARTY_NOTICES.html") {
    validateHtmlHostArtifact(bytes, expectedSnapshotHost, context);
  } else {
    validateJsonHostArtifact(bytes, expectedSnapshotHost, context);
  }
}

function main() {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "retrostage-i3-compliance-"));
  const first = path.join(temporaryRoot, "first");
  const second = path.join(temporaryRoot, "second");
  try {
    const firstSummary = generateCompliance(first);
    const secondSummary = generateCompliance(second);
    const currentHost = { platform: process.platform, architecture: process.arch };
    const comparisonPolicy = complianceComparisonPolicy(
      currentHost.platform,
      currentHost.architecture,
    );
    const ubuntuPolicy = complianceComparisonPolicy("linux", "x64");
    if (
      ubuntuPolicy.fullBaselineByteComparison ||
      !ubuntuPolicy.hostSensitiveCurrentHostValidation ||
      HOST_SENSITIVE_ARTIFACTS.some((name) => ubuntuPolicy.byteComparedArtifacts.includes(name))
    ) {
      throw new Error("Static Ubuntu cross-platform comparison policy is invalid.");
    }
    const identities = [];
    for (const name of firstSummary.artifactFiles) {
      const committed = readExact(path.join(COMPLIANCE_ROOT, name));
      const regeneratedFirst = readExact(path.join(first, name));
      const regeneratedSecond = readExact(path.join(second, name));
      assertEqual(
        regeneratedFirst,
        regeneratedSecond,
        `Deterministic regeneration mismatch: ${name}`,
      );
      const platformNeutral = PLATFORM_NEUTRAL_ARTIFACTS.includes(name);
      const hostSensitive = HOST_SENSITIVE_ARTIFACTS.includes(name);
      if (!platformNeutral && !hostSensitive) {
        throw new Error(`Compliance artifact has no comparison classification: ${name}`);
      }
      if (hostSensitive) {
        validateHostArtifact(name, committed, BASELINE_HOST, `Checked-in ${name}`);
        validateHostArtifact(name, regeneratedFirst, currentHost, `Current-host ${name}`);
      }
      const byteCompared = comparisonPolicy.byteComparedArtifacts.includes(name);
      if (byteCompared) {
        assertEqual(committed, regeneratedFirst, `Checked-in compliance drift: ${name}`);
      }
      identities.push({
        name,
        classification: platformNeutral ? "PLATFORM_NEUTRAL" : "HOST_SENSITIVE",
        currentHostByteDeterministic: true,
        checkedInByteCompared: byteCompared,
        checkedInBytes: committed.length,
        checkedInSha256: sha256(committed),
        currentHostBytes: regeneratedFirst.length,
        currentHostSha256: sha256(regeneratedFirst),
      });
    }

    if (JSON.stringify(firstSummary) !== JSON.stringify(secondSummary)) {
      throw new Error("Generated compliance summaries are not deterministic on the current host.");
    }
    const licenseBlockerCount =
      firstSummary.licenseSummary.unapprovedManualReview +
      firstSummary.licenseSummary.prohibited +
      firstSummary.licenseSummary.unknownNoLicense;
    if (licenseBlockerCount !== 0)
      throw new Error(`License blocker count is ${licenseBlockerCount}.`);
    if (firstSummary.securitySummary.blocking !== 0) {
      throw new Error(`Security blocker count is ${firstSummary.securitySummary.blocking}.`);
    }
    if (firstSummary.noticeProvenanceBlockerCount !== 0) {
      throw new Error(
        `Notice provenance blocker count is ${firstSummary.noticeProvenanceBlockerCount}.`,
      );
    }
    if (firstSummary.metadataOnlyFallbackCount !== 0) {
      throw new Error(
        `Metadata-only notice fallback count is ${firstSummary.metadataOnlyFallbackCount}.`,
      );
    }
    if (firstSummary.nativeProvenanceBlockerCount !== 0) {
      throw new Error(
        `Native provenance blocker count is ${firstSummary.nativeProvenanceBlockerCount}.`,
      );
    }
    if (firstSummary.nativeRequiredFieldCompleteCount !== firstSummary.nativeBinaryCount) {
      throw new Error(
        `Native field completeness mismatch: ${firstSummary.nativeRequiredFieldCompleteCount}/${firstSummary.nativeBinaryCount}.`,
      );
    }

    const workflow = readFileSync(
      path.join(REPOSITORY_ROOT, ".github", "workflows", "ci.yml"),
      "utf8",
    );
    const workflowIssues = validateWorkflowText(workflow);
    if (workflowIssues.length !== 0) {
      throw new Error(`CI workflow validation failed: ${workflowIssues.join(", ")}`);
    }
    const lockHash = sha256(readFileSync(path.join(REPOSITORY_ROOT, "pnpm-lock.yaml")));
    if (lockHash !== EXPECTED_LOCK_SHA256) throw new Error("Lockfile identity drift detected.");

    process.stdout.write(
      stableJson({
        result: "PASS",
        noticeRegenSha256Match: true,
        sbomRegenSha256Match: true,
        allComplianceArtifactsByteStable: true,
        baselineHost: BASELINE_HOST,
        currentHost,
        fullBaselineByteComparisonPerformed: comparisonPolicy.fullBaselineByteComparison,
        hostSensitiveCurrentHostValidationPerformed: true,
        platformNeutralComparisonResult: "PASS",
        crossPlatformComplianceGate: "PASS",
        staticUbuntuBehaviorProof: {
          runnerHost: { platform: "linux", architecture: "x64" },
          complianceGateInvokedByWorkflow: workflow.includes("pnpm run compliance:check"),
          fullBaselineByteComparisonPerformed: ubuntuPolicy.fullBaselineByteComparison,
          hostSensitiveCurrentHostValidationPerformed:
            ubuntuPolicy.hostSensitiveCurrentHostValidation,
          linuxHostSensitiveBytesRequiredToEqualWindowsBaseline: false,
          platformNeutralArtifacts: ubuntuPolicy.platformNeutralArtifacts,
          hostSensitiveArtifacts: ubuntuPolicy.hostSensitiveArtifacts,
        },
        licenseBlockerCount,
        securityBlockerCount: firstSummary.securitySummary.blocking,
        noticeProvenanceBlockerCount: firstSummary.noticeProvenanceBlockerCount,
        nativeProvenanceBlockerCount: firstSummary.nativeProvenanceBlockerCount,
        workflowValidationIssueCount: 0,
        lockfileSha256: lockHash,
        summary: firstSummary,
        artifacts: identities,
      }),
    );
  } finally {
    rmSync(temporaryRoot, { force: true, recursive: true });
  }
}

main();
