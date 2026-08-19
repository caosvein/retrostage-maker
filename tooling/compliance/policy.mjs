import { realpathSync } from "node:fs";
import path from "node:path";
import { URL } from "node:url";

export const DISTRIBUTION_SCOPE =
  "RSM-5-I1 DEVELOPMENT / SECURE ELECTRON SHELL CANDIDATE / NOT FINAL RELEASE";

export const BASELINE_HOST = Object.freeze({
  platform: "win32",
  architecture: "x64",
});

export const PLATFORM_NEUTRAL_ARTIFACTS = Object.freeze(["bom.cdx.json", "README.md"]);

export const HOST_SENSITIVE_ARTIFACTS = Object.freeze([
  "dependency-inventory.json",
  "license-review.json",
  "THIRD_PARTY_NOTICES.html",
  "native-binary-inventory.json",
  "wasm-module-inventory.json",
  "security-findings.json",
]);

export const AUTOMATIC_LICENSES = new Set([
  "0BSD",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "MIT",
  "Unlicense",
  "Zlib",
]);

export const OWNER_EXCEPTION_IDENTITIES = Object.freeze([
  ["argparse@2.0.1", "Python-2.0"],
  ["caniuse-lite@1.0.30001809", "CC-BY-4.0"],
  ["chownr@3.0.0", "BlueOak-1.0.0"],
  ["lightningcss@1.33.0", "MPL-2.0"],
  ["lightningcss-linux-x64-gnu@1.33.0", "MPL-2.0"],
  ["lightningcss-win32-x64-msvc@1.33.0", "MPL-2.0"],
  ["minimatch@10.2.6", "BlueOak-1.0.0"],
  ["minipass@7.1.3", "BlueOak-1.0.0"],
  ["minipass-flush@1.0.7", "BlueOak-1.0.0"],
  ["spdx-exceptions@2.5.0", "CC-BY-3.0"],
  ["spdx-license-ids@3.0.23", "CC0-1.0"],
  ["tar@7.5.22", "BlueOak-1.0.0"],
  ["type-fest@0.13.1", "(MIT OR CC0-1.0)"],
  ["type-fest@1.4.0", "(MIT OR CC0-1.0)"],
  ["yallist@5.0.0", "BlueOak-1.0.0"],
]);

export const OWNER_EXCEPTIONS = new Map(
  OWNER_EXCEPTION_IDENTITIES.map(([identity, license]) => [
    identity,
    { license, scope: DISTRIBUTION_SCOPE },
  ]),
);

function duplicateIdentities(identities) {
  const seen = new Set();
  const duplicates = new Set();
  for (const identity of identities) {
    if (seen.has(identity)) duplicates.add(identity);
    seen.add(identity);
  }
  return [...duplicates].sort((left, right) => left.localeCompare(right, "en"));
}

export function ownerExceptionApplicationState({ observedIdentities, platform, architecture }) {
  const policyIdentities = OWNER_EXCEPTION_IDENTITIES.map(([identity]) => identity);
  const duplicatePolicyIdentities = duplicateIdentities(policyIdentities);
  if (duplicatePolicyIdentities.length !== 0) {
    throw new Error(`OWNER_EXCEPTION_POLICY_DUPLICATE:${duplicatePolicyIdentities.join(",")}`);
  }

  const observed = [...observedIdentities];
  const duplicateObservedIdentities = duplicateIdentities(observed);
  if (duplicateObservedIdentities.length !== 0) {
    throw new Error(`OWNER_EXCEPTION_HOST_DUPLICATE:${duplicateObservedIdentities.join(",")}`);
  }

  const policySet = new Set(policyIdentities);
  const unknownObservedIdentities = observed
    .filter((identity) => !policySet.has(identity))
    .sort((left, right) => left.localeCompare(right, "en"));
  if (unknownObservedIdentities.length !== 0) {
    throw new Error(`OWNER_EXCEPTION_HOST_UNKNOWN:${unknownObservedIdentities.join(",")}`);
  }

  const hostObservedAppliedIdentities = observed.sort((left, right) =>
    left.localeCompare(right, "en"),
  );
  const observedSet = new Set(hostObservedAppliedIdentities);
  const approvedButDormantIdentities = policyIdentities
    .filter((identity) => !observedSet.has(identity))
    .sort((left, right) => left.localeCompare(right, "en"));

  return {
    policyWideApprovedCount: policyIdentities.length,
    hostObservedAppliedCount: hostObservedAppliedIdentities.length,
    hostObservedAppliedIdentities,
    approvedButDormantIdentities,
    host: { platform, architecture },
  };
}

const PROHIBITED_LICENSE_PATTERN =
  /(?:^|[^A-Za-z])(?:AGPL|GPL-2\.0|GPL-3\.0|SSPL|BUSL|Business Source License|Commons Clause|PolyForm|Non-Commercial|No-Derivatives)(?:$|[^A-Za-z])/i;

export function classifyLicenseIdentity({ name, version, license }) {
  const identity = `${name}@${version}`;
  const normalizedLicense = typeof license === "string" ? license.trim() : "";
  const ownerException = OWNER_EXCEPTIONS.get(identity);

  if (!normalizedLicense) {
    return {
      classification: "UNKNOWN_NO_LICENSE",
      manualReviewRequired: true,
      ownerExactException: false,
      prohibited: false,
    };
  }

  if (ownerException?.license === normalizedLicense) {
    return {
      classification: "OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE",
      manualReviewRequired: false,
      ownerExactException: true,
      prohibited: false,
    };
  }

  if (AUTOMATIC_LICENSES.has(normalizedLicense)) {
    return {
      classification: "AUTOMATICALLY_ADMISSIBLE",
      manualReviewRequired: false,
      ownerExactException: false,
      prohibited: false,
    };
  }

  if (PROHIBITED_LICENSE_PATTERN.test(normalizedLicense)) {
    return {
      classification: "PROHIBITED_BY_DEFAULT",
      manualReviewRequired: true,
      ownerExactException: false,
      prohibited: true,
    };
  }

  return {
    classification: "UNAPPROVED_MANUAL_REVIEW",
    manualReviewRequired: true,
    ownerExactException: false,
    prohibited: false,
  };
}

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function normalizeSafeSourceUrl(value) {
  if (typeof value !== "string") return "";
  let candidate = value.trim();
  if (!candidate) return "";
  if (/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(candidate)) {
    candidate = `https://github.com/${candidate}`;
  }
  if (/^git\+https?:\/\//iu.test(candidate)) candidate = candidate.slice(4);
  else if (/^git:\/\/github\.com\//iu.test(candidate)) {
    candidate = `https://github.com/${candidate.slice("git://github.com/".length)}`;
  }
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    return "";
  }
  if (!new Set(["http:", "https:"]).has(parsed.protocol)) return "";
  if (parsed.username || parsed.password) return "";
  return parsed.toString();
}

export function selectSafeNoticeSource({ repository, homepage }) {
  return normalizeSafeSourceUrl(repository) || normalizeSafeSourceUrl(homepage);
}

/**
 * Classify whether a dependency graph node is a first-party workspace package.
 *
 * A node is first-party if and only if all of the following hold:
 *   1. Its resolved packagePath is strictly within repositoryRoot (not equal to it).
 *   2. Its resolved packagePath is present in the declared firstPartyAbsolutePaths set.
 *
 * Properties:
 *   - Canonical workspace links (@retrostage/core, @retrostage/diagnostics) → true
 *   - Babylon.js and all other external packages → false
 *   - Namespace-only spoof (@retrostage/fake with non-workspace path) → false
 *   - Out-of-repository or broken links → false (fail closed)
 *
 * @param {{ name: string, version: string, packagePath: string }} node  Dependency graph node.
 * @param {Map<string,string>} firstPartyMap  Map from canonical real workspace path to canonical package name.
 * @param {string} repositoryRoot  Physical real path to the repository root.
 * @returns {boolean}
 */
export function isFirstPartyWorkspaceNode(node, firstPartyMap, repositoryRoot) {
  if (!node || !node.name || !node.version || !node.packagePath) return false;

  // node.version/resolution is current workspace-link form
  // Only the physically observed resolved graph form (link:) is accepted.
  // workspace:* in source manifests does not prove link: in the resolved graph.
  if (!node.version.startsWith("link:")) return false;

  const resolvedPkg = realpathSync(node.packagePath);
  const resolvedRepo = realpathSync(repositoryRoot);

  // Physical real path must be strictly inside the physical repository real path (no symlink escape)
  const repoPrefix = resolvedRepo + path.sep;
  if (!resolvedPkg.startsWith(repoPrefix)) return false;

  // Physical real path must match exactly one canonical workspace real path in the map
  if (!firstPartyMap.has(resolvedPkg)) return false;

  // node.name exact canonical package name
  if (firstPartyMap.get(resolvedPkg) !== node.name) return false;

  return true;
}

export function complianceComparisonPolicy(platform, architecture) {
  const baselineHost = { ...BASELINE_HOST };
  const currentHost = { platform, architecture };
  const baselineHostMatch =
    platform === BASELINE_HOST.platform && architecture === BASELINE_HOST.architecture;
  return {
    baselineHost,
    currentHost,
    baselineHostMatch,
    fullBaselineByteComparison: baselineHostMatch,
    platformNeutralArtifacts: [...PLATFORM_NEUTRAL_ARTIFACTS],
    hostSensitiveArtifacts: [...HOST_SENSITIVE_ARTIFACTS],
    byteComparedArtifacts: baselineHostMatch
      ? [...PLATFORM_NEUTRAL_ARTIFACTS, ...HOST_SENSITIVE_ARTIFACTS]
      : [...PLATFORM_NEUTRAL_ARTIFACTS],
    hostSensitiveCurrentHostValidation: true,
  };
}

export function artifactComparisonDisposition({ artifactName, platform, architecture, matches }) {
  const policy = complianceComparisonPolicy(platform, architecture);
  const byteCompared = policy.byteComparedArtifacts.includes(artifactName);
  return {
    byteCompared,
    blocking: byteCompared && !matches,
    result: byteCompared ? (matches ? "MATCH" : "BLOCKING_MISMATCH") : "HOST_SENSITIVE_DEFERRED",
  };
}

export function renderNoticesHtml(
  entries,
  snapshotHost = BASELINE_HOST,
  bundledElectronEvidence = [],
  mplDistributionEvidence = null,
) {
  const sorted = [...entries].sort((left, right) =>
    `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`, "en"),
  );
  const sections = sorted.map((entry, index) => {
    const evidence = [...entry.licenseFiles, ...entry.noticeFiles]
      .sort((left, right) => left.name.localeCompare(right.name, "en"))
      .map(
        (file) =>
          `<h3>${escapeHtml(file.name)}</h3>\n<p>SHA-256: <code>${escapeHtml(file.sha256)}</code></p>\n<pre>${escapeHtml(file.text)}</pre>`,
      )
      .join("\n");
    const safeSourceUrl = normalizeSafeSourceUrl(entry.safeSourceUrl);
    if (!evidence && !safeSourceUrl) {
      throw new Error(`NOTICE_PROVENANCE_BLOCKER: ${entry.name}@${entry.version}`);
    }
    const sourceLink = safeSourceUrl
      ? `<p>Reviewed source: <a href="${escapeHtml(safeSourceUrl)}" rel="noreferrer">${escapeHtml(safeSourceUrl)}</a></p>`
      : "";
    const fallback = evidence
      ? evidence
      : `<p>No standalone license/notice file was physically present in the installed package.</p>
<p>The declared license expression and reviewed source link are the approved bootstrap notice-reference strategy.</p>
${sourceLink}`;

    return `<section id="package-${index + 1}">
<h2>${escapeHtml(entry.name)} ${escapeHtml(entry.version)}</h2>
<dl>
<dt>License</dt><dd>${escapeHtml(entry.license || "UNKNOWN")}</dd>
<dt>Distribution scope</dt><dd>${escapeHtml(entry.distributionScope)}</dd>
<dt>Classification</dt><dd>${escapeHtml(entry.classification)}</dd>
<dt>Stated author/copyright metadata</dt><dd>${escapeHtml(entry.author || "NOT STATED")}</dd>
<dt>Special obligation</dt><dd>${escapeHtml(entry.specialObligation)}</dd>
</dl>
${evidence ? sourceLink : ""}
${fallback}
</section>`;
  });

  const electronEvidenceSection = `<section id="electron-bundled-license-evidence">
<h2>Electron / Chromium bundled license evidence</h2>
<p>This physical evidence covers the RSM-5-I1 Electron shell candidate only. It does not claim final release-package notice completeness.</p>
<ul>
${bundledElectronEvidence
  .map(
    (entry) =>
      `<li><code>${escapeHtml(entry.path)}</code> — ${escapeHtml(String(entry.bytes))} bytes — SHA-256 <code>${escapeHtml(entry.sha256)}</code></li>`,
  )
  .join("\n")}
</ul>
</section>`;

  const mplEvidenceSection = mplDistributionEvidence
    ? `<section id="mpl-covered-component-distribution-evidence">
<h2>MPL-covered Lightning CSS distribution evidence</h2>
<p>Identities: <code>${escapeHtml(mplDistributionEvidence.identities.join(", "))}</code></p>
<p>Packaged application root: <code>${escapeHtml(mplDistributionEvidence.packagedApplicationRoot)}</code></p>
<p>Packaged resource files scanned: ${escapeHtml(String(mplDistributionEvidence.packagedResourceFileCount))}</p>
<p>Packaged node_modules present: ${escapeHtml(String(mplDistributionEvidence.packagedNodeModulesPresent))}</p>
<p>Covered executable or source present: ${escapeHtml(String(mplDistributionEvidence.coveredExecutableOrSourcePresent))}</p>
<p>Disposition: ${escapeHtml(mplDistributionEvidence.distributionDisposition)}</p>
<p>Source availability: ${escapeHtml(mplDistributionEvidence.sourceAvailabilityFulfillment)}</p>
<p>Notice fulfillment: ${escapeHtml(mplDistributionEvidence.noticeFulfillment)}</p>
</section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="retrostage-baseline-platform" content="${escapeHtml(BASELINE_HOST.platform)}">
<meta name="retrostage-baseline-architecture" content="${escapeHtml(BASELINE_HOST.architecture)}">
<meta name="retrostage-snapshot-platform" content="${escapeHtml(snapshotHost.platform)}">
<meta name="retrostage-snapshot-architecture" content="${escapeHtml(snapshotHost.architecture)}">
<title>RetroStage Maker Third-Party Notices</title>
</head>
<body>
<h1>RetroStage Maker Third-Party Notices</h1>
<p>Scope: ${escapeHtml(DISTRIBUTION_SCOPE)}.</p>
<p>Accepted baseline host: ${escapeHtml(BASELINE_HOST.platform)}/${escapeHtml(BASELINE_HOST.architecture)}. Physical snapshot host: ${escapeHtml(snapshotHost.platform)}/${escapeHtml(snapshotHost.architecture)}.</p>
<p>Package entries: ${sorted.length}</p>
${sections.join("\n")}
${mplEvidenceSection}
${electronEvidenceSection}
</body>
</html>
`;
}

export function createArtifactProvenanceFields({
  name,
  version,
  artifactType,
  repository,
  noticeSourceUrl,
  licenseNoticeLocations,
}) {
  const sourceRepository = normalizeSafeSourceUrl(repository);
  const reviewedNoticeSource = normalizeSafeSourceUrl(noticeSourceUrl);
  const evidenceLocations = [...new Set(licenseNoticeLocations ?? [])].sort((left, right) =>
    left.localeCompare(right, "en"),
  );
  if (evidenceLocations.length === 0 && reviewedNoticeSource) {
    evidenceLocations.push(`APPROVED_BOOTSTRAP_SOURCE_LINK: ${reviewedNoticeSource}`);
  }
  const abiRuntimeRequirements =
    artifactType === ".node"
      ? "NODE_NATIVE_ADDON / EXACT N-API OR NODE ABI LEVEL NOT ESTABLISHED BY INSTALLED PACKAGE METADATA"
      : artifactType === ".exe"
        ? "STANDALONE_PLATFORM_EXECUTABLE / NODE ABI NOT APPLICABLE"
        : artifactType === ".wasm"
          ? "WEBASSEMBLY_MODULE / EXACT HOST IMPORT AND RUNTIME CONTRACT NOT ESTABLISHED BY INSTALLED PACKAGE METADATA"
          : "PLATFORM_NATIVE_LIBRARY / EXACT ABI LEVEL NOT ESTABLISHED BY INSTALLED PACKAGE METADATA";
  return {
    sourceRepository,
    packageReleaseUrl: `https://www.npmjs.com/package/${encodeURIComponent(name)}/v/${encodeURIComponent(version)}`,
    sourceCodeAvailability: sourceRepository
      ? "UPSTREAM_REPOSITORY_DECLARED"
      : reviewedNoticeSource
        ? "PACKAGE_METADATA_ONLY"
        : "UNKNOWN",
    licenseNoticeLocations: evidenceLocations,
    buildProvenance: "PUBLISHED_NPM_PACKAGE_CONTENT / LOCAL BUILD PROVENANCE NOT ESTABLISHED",
    abiRuntimeRequirements,
    packagedRole: "DEVELOPMENT_BUILD_TOOL_ONLY / NOT EDITOR_OR_PLAYER_PACKAGED",
    replacementRemovalProcedure: `Remove or update owning tool dependency ${name}@${version} or its transitive parent; review pnpm-lock.yaml changes; regenerate compliance artifacts; run full validation. Do not delete the artifact directly from node_modules.`,
  };
}

export function validateArtifactProvenance(record) {
  const issues = [];
  const requiredStrings = [
    "packageReleaseUrl",
    "sourceCodeAvailability",
    "buildProvenance",
    "abiRuntimeRequirements",
    "packagedRole",
    "replacementRemovalProcedure",
  ];
  for (const field of requiredStrings) {
    if (typeof record[field] !== "string" || !record[field].trim()) issues.push(`${field}:MISSING`);
  }
  if (record.sourceRepository && !normalizeSafeSourceUrl(record.sourceRepository)) {
    issues.push("sourceRepository:UNSAFE");
  }
  if (!normalizeSafeSourceUrl(record.packageReleaseUrl)) issues.push("packageReleaseUrl:UNSAFE");
  if (!Array.isArray(record.licenseNoticeLocations) || record.licenseNoticeLocations.length === 0) {
    issues.push("licenseNoticeLocations:MISSING");
  }
  const allowedPackagedRoles = new Set([
    "DEVELOPMENT_BUILD_TOOL_ONLY / NOT EDITOR_OR_PLAYER_PACKAGED",
    "RSM-5-I1 ELECTRON SECURE SHELL RUNTIME / NOT FINAL RELEASE PACKAGE",
  ]);
  if (!allowedPackagedRoles.has(record.packagedRole)) {
    issues.push("packagedRole:OUT_OF_SCOPE");
  }
  if (!record.replacementRemovalProcedure?.includes("pnpm-lock.yaml")) {
    issues.push("replacementRemovalProcedure:LOCKFILE_REVIEW_MISSING");
  }
  return issues;
}

export function classifyArtifactPath(filePath) {
  const normalized = filePath.replaceAll("\\", "/").toLowerCase();
  const base = path.posix.basename(normalized);
  if (base.endsWith(".wasm")) return "WASM";
  if (
    base.endsWith(".node") ||
    base.endsWith(".dll") ||
    base.endsWith(".exe") ||
    base.endsWith(".so") ||
    base.includes(".so.") ||
    base.endsWith(".dylib")
  ) {
    return "NATIVE_BINARY";
  }
  return "OTHER";
}

export function vulnerabilityDisposition(severity) {
  const normalized = String(severity).toLowerCase();
  const blocking = normalized === "high" || normalized === "critical";
  return {
    blocking,
    state: blocking ? "OPEN_BLOCKING" : "OPEN_NON_BLOCKING",
  };
}

export function validateActionReference(uses, expectedActions = new Map()) {
  const match = /^(?<family>[^@\s]+)@(?<ref>[0-9a-fA-F]{40})$/.exec(uses);
  if (!match?.groups) {
    return { valid: false, reason: "ACTION_REF_NOT_FULL_40_HEX" };
  }
  const expected = expectedActions.get(match.groups.family);
  if (!expected) {
    return { valid: false, reason: "ACTION_FAMILY_NOT_APPROVED" };
  }
  if (match.groups.ref.toLowerCase() !== expected.toLowerCase()) {
    return { valid: false, reason: "ACTION_SHA_MISMATCH" };
  }
  return { valid: true, reason: "IMMUTABLE_APPROVED_ACTION" };
}

export function stableJson(value) {
  const canonicalize = (input) => {
    if (Array.isArray(input)) return input.map(canonicalize);
    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input)
          .sort(([left], [right]) => left.localeCompare(right, "en"))
          .map(([key, nested]) => [key, canonicalize(nested)]),
      );
    }
    return input;
  };
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

const WINDOWS_PRIMARY_CI_CONTRACT = Object.freeze({
  actions: new Map([
    ["actions/checkout", "3d3c42e5aac5ba805825da76410c181273ba90b1"],
    ["pnpm/action-setup", "0ebf47130e4866e96fce0953f49152a61190b271"],
  ]),
  runner: "windows-2022",
  nodeUrl: "https://nodejs.org/download/release/v24.19.0/node-v24.19.0-win-x64.zip",
  nodeSha: "57f71ab3652e797d84acddc79c81cc9ff1c6ddb2a1974cdb83f00fee9bff4c73",
  nodeExe: "node.exe",
  nodeVersion: "v24.19.0",
  pnpmVersion: "11.17.0",
  fragments: [
    "https://nodejs.org/download/release/v24.19.0/node-v24.19.0-win-x64.zip",
    "57f71ab3652e797d84acddc79c81cc9ff1c6ddb2a1974cdb83f00fee9bff4c73",
    '$expectedNodeExe = Join-Path $nodeRoot "node.exe"',
    '$allNodeExes = @(Get-ChildItem -Path $nodeRoot -Filter "node.exe" -Recurse -File)',
    "if ($allNodeExes.Count -ne 1) {",
    "$resolvedCandidate = (Resolve-Path $allNodeExes[0].FullName).Path",
    "$resolvedExpected = (Resolve-Path $expectedNodeExe).Path",
    "if ($resolvedCandidate -ne $resolvedExpected) {",
    "$nodeVersion = (& $expectedNodeExe --version).Trim()",
    '$nodeVersion -ne "v24.19.0"',
    "echo $nodeRoot >> $env:GITHUB_PATH",
    "$nodeCmd = Get-Command node -CommandType Application -ErrorAction Stop",
    "$resolvedCommand = (Resolve-Path $nodeCmd.Source).Path",
    "if ($resolvedCommand -ne $resolvedExpected) {",
    "$nodeVersion = (node --version).Trim()",
    "version: 11.17.0",
    "run_install: false",
    "$pnpmVersion = (pnpm --version).Trim()",
    '$pnpmVersion -ne "11.17.0"',
    "pnpm install --frozen-lockfile",
    "pnpm run validate",
    "pnpm run compliance:check",
    "pnpm run dependency:audit",
  ],
  commands: [
    "pnpm install --frozen-lockfile",
    "pnpm run validate",
    "pnpm run compliance:check",
    "pnpm run dependency:audit",
  ],
});

export function validateWorkflowText(workflow) {
  const issues = [];
  const lines = workflow.split(/\r\n|\n|\r/u);
  if (lines.some((line) => line.includes("\t"))) issues.push("YAML_TAB_INDENTATION");
  if (!/^name:\s+CI$/mu.test(workflow)) issues.push("YAML_NAME_MISSING");
  if (!/^on:\s*$/mu.test(workflow)) issues.push("YAML_TRIGGER_ROOT_MISSING");
  if (!/^\s{2}push:\s*$/mu.test(workflow)) issues.push("PUSH_TRIGGER_MISSING");
  if (!/^\s{2}pull_request:\s*$/mu.test(workflow)) issues.push("PULL_REQUEST_TRIGGER_MISSING");
  if (!/^permissions:\s*\n\s{2}contents:\s*read\s*$/mu.test(workflow))
    issues.push("LEAST_PRIVILEGE_PERMISSIONS_MISSING");
  if (/permissions:[\s\S]*?\bwrite\b/iu.test(workflow)) issues.push("WRITE_PERMISSION_PRESENT");
  const runnerLines = lines.filter((line) => /^\s*runs-on:/u.test(line));
  if (
    runnerLines.length !== 1 ||
    runnerLines[0].trim() !== `runs-on: ${WINDOWS_PRIMARY_CI_CONTRACT.runner}`
  ) {
    issues.push("RUNNER_MISMATCH");
  }
  if (!/persist-credentials:\s*false/u.test(workflow)) issues.push("CHECKOUT_CREDENTIALS_PERSIST");
  if (/\$\{\{\s*secrets\./u.test(workflow)) issues.push("SECRET_REFERENCE_PRESENT");
  if (/(?:git\s+push|npm\s+publish|pnpm\s+publish|gh\s+release)/iu.test(workflow))
    issues.push("PUBLISH_RELEASE_PUSH_STEP_PRESENT");

  const uses = [...workflow.matchAll(/^\s*-?\s*uses:\s*([^\s#]+).*$/gmu)].map((match) => match[1]);
  let unexpectedActionReference = uses.length > WINDOWS_PRIMARY_CI_CONTRACT.actions.size;
  for (const reference of uses) {
    const result = validateActionReference(reference, WINDOWS_PRIMARY_CI_CONTRACT.actions);
    if (!result.valid) {
      if (result.reason === "ACTION_FAMILY_NOT_APPROVED") unexpectedActionReference = true;
      else issues.push(`${result.reason}:${reference}`);
    }
  }
  if (unexpectedActionReference) issues.push("UNEXPECTED_ACTION_REFERENCE");
  if (uses.length !== WINDOWS_PRIMARY_CI_CONTRACT.actions.size)
    issues.push(`ACTION_COUNT_MISMATCH:${uses.length}`);

  for (const fragment of WINDOWS_PRIMARY_CI_CONTRACT.fragments) {
    if (!workflow.includes(fragment)) issues.push(`REQUIRED_FRAGMENT_MISSING:${fragment}`);
  }

  const commandOrder = WINDOWS_PRIMARY_CI_CONTRACT.commands.map((command) =>
    workflow.indexOf(command),
  );
  if (
    commandOrder.some((index) => index < 0) ||
    commandOrder.some((index, i) => i > 0 && index <= commandOrder[i - 1])
  ) {
    issues.push("COMMAND_ORDER_INVALID");
  }

  const stepBlocks = workflow.split(/^\s*-\s*name:/mu).slice(1);
  for (const block of stepBlocks) {
    if (/^\s*run:/mu.test(block)) {
      if (!/^\s*shell:\s*pwsh/mu.test(block)) {
        issues.push("REQUIRED_FRAGMENT_MISSING:shell: pwsh");
      }
    }
  }

  return issues;
}
