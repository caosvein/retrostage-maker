import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import {
  AUTOMATIC_LICENSES,
  BASELINE_HOST,
  DISTRIBUTION_SCOPE,
  OWNER_EXCEPTIONS,
  classifyArtifactPath,
  classifyLicenseIdentity,
  createArtifactProvenanceFields,
  normalizeSafeSourceUrl,
  renderNoticesHtml,
  selectSafeNoticeSource,
  stableJson,
  validateArtifactProvenance,
  vulnerabilityDisposition,
} from "./policy.mjs";

const MODULE_PATH = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = path.resolve(path.dirname(MODULE_PATH), "..", "..");
const EXPECTED_LOCK_SHA256 = "CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0";
const EXPECTED_DIRECT_DEPENDENCIES = Object.freeze({
  "dependency-cruiser": "16.10.0",
  eslint: "9.21.0",
  knip: "6.32.0",
  prettier: "3.5.2",
  typescript: "6.0.3",
  "typescript-eslint": "8.66.0",
  vitest: "3.2.6",
});
const ARTIFACT_FILES = Object.freeze([
  "bom.cdx.json",
  "dependency-inventory.json",
  "license-review.json",
  "THIRD_PARTY_NOTICES.html",
  "native-binary-inventory.json",
  "wasm-module-inventory.json",
  "security-findings.json",
  "README.md",
]);
const LICENSE_FILE_PATTERN = /^(?:LICENSE|LICENCE|COPYING)(?:[.\-_]|$)/iu;
const NOTICE_FILE_PATTERN = /^(?:NOTICE|COPYRIGHT)(?:[.\-_]|$)/iu;

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex").toUpperCase();
}

function sha256File(filePath) {
  return sha256Bytes(readFileSync(filePath));
}

function normalizePath(value) {
  return value.replaceAll("\\", "/");
}

function relativeRepositoryPath(filePath) {
  const relative = normalizePath(path.relative(REPOSITORY_ROOT, filePath));
  if (!relative || relative.startsWith("../") || path.isAbsolute(relative)) {
    throw new Error(`Path is outside repository: ${filePath}`);
  }
  return relative;
}

function runPnpm(args, acceptedStatuses = [0]) {
  const command = process.platform === "win32" ? process.env.ComSpec || "cmd.exe" : "pnpm";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "pnpm.cmd", ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (!acceptedStatuses.includes(result.status ?? -1)) {
    throw new Error(
      `pnpm ${args.join(" ")} exited ${result.status}: ${(result.stderr || result.stdout).trim()}`,
    );
  }
  return { status: result.status ?? -1, stdout: result.stdout, stderr: result.stderr };
}

function assertDependencyBaseline() {
  const packageJson = JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, "package.json"), "utf8"));
  const actual = packageJson.devDependencies ?? {};
  if (JSON.stringify(actual) !== JSON.stringify(EXPECTED_DIRECT_DEPENDENCIES)) {
    throw new Error("Direct dependency baseline differs from the accepted seven exact identities.");
  }
  if (Object.keys(packageJson.dependencies ?? {}).length !== 0) {
    throw new Error("Product/runtime direct dependencies are not authorized in I3.");
  }
  if (sha256File(path.join(REPOSITORY_ROOT, "pnpm-lock.yaml")) !== EXPECTED_LOCK_SHA256) {
    throw new Error("pnpm-lock.yaml differs from the accepted immutable PRE1 identity.");
  }
  return packageJson;
}

function walkDependencyNode(node, identities) {
  for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
    const dependencies = node?.[field] ?? {};
    for (const [declaredName, dependency] of Object.entries(dependencies)) {
      const name = dependency.name || declaredName;
      const version = String(dependency.version || "");
      const packagePath = String(dependency.path || "");
      if (name && version) {
        const identity = `${name}@${version}`;
        const packageJsonPath = packagePath ? path.join(packagePath, "package.json") : "";
        if (packageJsonPath && existsSync(packageJsonPath) && !identities.has(identity)) {
          identities.set(identity, { name, version, packagePath });
        }
      }
      walkDependencyNode(dependency, identities);
    }
  }
}

function readActiveDependencyGraph() {
  const result = runPnpm(["list", "--recursive", "--depth", "Infinity", "--json"]);
  const roots = JSON.parse(result.stdout);
  const identities = new Map();
  for (const root of roots) walkDependencyNode(root, identities);
  return [...identities.values()].sort((left, right) =>
    `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`, "en"),
  );
}

function readLicenseExpression(packageJson) {
  if (typeof packageJson.license === "string") return packageJson.license.trim();
  if (packageJson.license && typeof packageJson.license.type === "string") {
    return packageJson.license.type.trim();
  }
  if (Array.isArray(packageJson.licenses)) {
    return packageJson.licenses
      .map((license) => (typeof license === "string" ? license : license?.type))
      .filter(Boolean)
      .join(" OR ");
  }
  return "";
}

function normalizeRepository(packageJson) {
  if (typeof packageJson.repository === "string") return packageJson.repository;
  if (packageJson.repository && typeof packageJson.repository.url === "string") {
    return packageJson.repository.url;
  }
  return "";
}

function normalizeAuthor(packageJson) {
  if (typeof packageJson.author === "string") return packageJson.author.trim();
  if (!packageJson.author || typeof packageJson.author !== "object") return "";
  const parts = [];
  if (typeof packageJson.author.name === "string" && packageJson.author.name.trim()) {
    parts.push(packageJson.author.name.trim());
  }
  if (typeof packageJson.author.email === "string" && packageJson.author.email.trim()) {
    parts.push(`<${packageJson.author.email.trim()}>`);
  }
  const safeAuthorUrl = normalizeSafeSourceUrl(packageJson.author.url);
  if (safeAuthorUrl) parts.push(`(${safeAuthorUrl})`);
  return parts.join(" ");
}

function readEvidenceFiles(packagePath) {
  return readdirSync(packagePath, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        (LICENSE_FILE_PATTERN.test(entry.name) || NOTICE_FILE_PATTERN.test(entry.name)),
    )
    .sort((left, right) => left.name.localeCompare(right.name, "en"))
    .map((entry) => {
      const filePath = path.join(packagePath, entry.name);
      const text = readFileSync(filePath, "utf8");
      return {
        name: entry.name,
        path: relativeRepositoryPath(filePath),
        sha256: sha256File(filePath),
        text,
        type: LICENSE_FILE_PATTERN.test(entry.name) ? "LICENSE" : "NOTICE_OR_COPYRIGHT",
      };
    });
}

function walkArtifactFiles(rootPath) {
  const files = [];
  const visit = (directory) => {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name, "en"))) {
      if (entry.name === "node_modules") continue;
      const entryPath = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile() && classifyArtifactPath(entryPath) !== "OTHER") files.push(entryPath);
    }
  };
  visit(rootPath);
  return files;
}

function inferPlatform(value) {
  const normalized = value.toLowerCase();
  for (const platform of ["win32", "linux", "darwin", "android", "freebsd"]) {
    if (normalized.includes(platform)) return platform;
  }
  return "UNSPECIFIED";
}

function inferArchitecture(value) {
  const normalized = value.toLowerCase();
  for (const architecture of ["x64", "arm64", "arm", "ia32", "s390x", "ppc64", "riscv64"]) {
    if (normalized.includes(architecture)) return architecture;
  }
  return "UNSPECIFIED";
}

function packagePurl(name, version) {
  const encodedName = encodeURIComponent(name).replace("%2F", "/");
  return `pkg:npm/${encodedName}@${version}`;
}

function buildPackageState(graph, rootPackageJson) {
  const directNames = new Set(Object.keys(rootPackageJson.devDependencies));
  const packages = [];
  const nativeArtifacts = [];
  const wasmArtifacts = [];

  for (const node of graph) {
    const packageJson = JSON.parse(
      readFileSync(path.join(node.packagePath, "package.json"), "utf8"),
    );
    const license = readLicenseExpression(packageJson);
    const classification = classifyLicenseIdentity({
      name: node.name,
      version: node.version,
      license,
    });
    const evidenceFiles = readEvidenceFiles(node.packagePath);
    const packageArtifacts = walkArtifactFiles(node.packagePath);
    const identity = `${node.name}@${node.version}`;
    const packageRelativePath = relativeRepositoryPath(node.packagePath);
    const declaredRepository = normalizeRepository(packageJson);
    const repository = normalizeSafeSourceUrl(declaredRepository);
    const homepage = normalizeSafeSourceUrl(packageJson.homepage);
    const noticeSourceUrl = selectSafeNoticeSource({
      repository: declaredRepository,
      homepage: packageJson.homepage,
    });
    const author = normalizeAuthor(packageJson);
    const licenseNoticeLocations = evidenceFiles.map((file) => file.path);

    for (const artifactPath of packageArtifacts) {
      const artifactType = classifyArtifactPath(artifactPath);
      const physicalArtifactType =
        artifactType === "WASM"
          ? ".wasm"
          : path.basename(artifactPath).toLowerCase().includes(".so")
            ? ".so"
            : path.extname(artifactPath).toLowerCase();
      const record = {
        owningPackage: node.name,
        version: node.version,
        relativeArtifactPath: relativeRepositoryPath(artifactPath),
        artifactType: physicalArtifactType,
        sha256: sha256File(artifactPath),
        license,
        provenanceSourceIdentity: identity,
        distributionScope: DISTRIBUTION_SCOPE,
        ...createArtifactProvenanceFields({
          name: node.name,
          version: node.version,
          artifactType: physicalArtifactType,
          repository: declaredRepository,
          noticeSourceUrl,
          licenseNoticeLocations,
        }),
      };
      if (artifactType === "WASM") {
        wasmArtifacts.push(record);
      } else {
        nativeArtifacts.push({
          ...record,
          platform: inferPlatform(`${identity}/${packageRelativePath}/${artifactPath}`),
          architecture: inferArchitecture(`${identity}/${packageRelativePath}/${artifactPath}`),
        });
      }
    }

    const ownerException = OWNER_EXCEPTIONS.get(identity);
    packages.push({
      name: node.name,
      version: node.version,
      identity,
      purl: packagePurl(node.name, node.version),
      direct:
        directNames.has(node.name) && rootPackageJson.devDependencies[node.name] === node.version,
      dependencyScope: "development",
      license,
      author,
      repository,
      homepage,
      safeNoticeSourceUrl: noticeSourceUrl,
      lockedInstalledResolutionIdentity: identity,
      native: packageArtifacts.some((file) => classifyArtifactPath(file) === "NATIVE_BINARY"),
      wasm: packageArtifacts.some((file) => classifyArtifactPath(file) === "WASM"),
      distributionScope: DISTRIBUTION_SCOPE,
      classification: classification.classification,
      manualReviewRequired: classification.manualReviewRequired,
      ownerExactException: classification.ownerExactException,
      prohibited: classification.prohibited,
      ownerExceptionScope: ownerException?.scope ?? "",
      evidenceFiles,
    });
  }

  const byArtifactIdentity = (left, right) =>
    `${left.owningPackage}@${left.version}/${left.relativeArtifactPath}`.localeCompare(
      `${right.owningPackage}@${right.version}/${right.relativeArtifactPath}`,
      "en",
    );
  nativeArtifacts.sort(byArtifactIdentity);
  wasmArtifacts.sort(byArtifactIdentity);
  return { packages, nativeArtifacts, wasmArtifacts };
}

function buildInventory(packages, snapshotHost) {
  const entries = packages.map((entry) => ({
    name: entry.name,
    version: entry.version,
    identity: entry.identity,
    purl: entry.purl,
    direct: entry.direct,
    dependencyScope: entry.dependencyScope,
    license: entry.license,
    author: entry.author,
    repository: entry.repository,
    homepage: entry.homepage,
    safeNoticeSourceUrl: entry.safeNoticeSourceUrl,
    lockedInstalledResolutionIdentity: entry.lockedInstalledResolutionIdentity,
    native: entry.native,
    wasm: entry.wasm,
    distributionScope: entry.distributionScope,
  }));
  return {
    schemaVersion: 1,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    distributionScope: DISTRIBUTION_SCOPE,
    summary: {
      exactInstalledExternalPackageVersionCount: entries.length,
      directCount: entries.filter((entry) => entry.direct).length,
      transitiveCount: entries.filter((entry) => !entry.direct).length,
      nativePackageCount: entries.filter((entry) => entry.native).length,
      wasmPackageCount: entries.filter((entry) => entry.wasm).length,
    },
    packages: entries,
  };
}

function specialObligation(identity, license) {
  if (identity === "argparse@2.0.1") {
    return "Retain applicable Python/PSF, BeOpen, CNRI, and CWI license/copyright text; describe covered derivative changes when applicable.";
  }
  if (identity === "minimatch@10.2.6") {
    return "Give recipients the Blue Oak Model License 1.0.0 text or its permitted canonical link.";
  }
  return license
    ? "Preserve applicable license and copyright material when distributing this development/bootstrap dependency."
    : "No standalone license identity was discovered; distribution is blocked.";
}

function buildLicenseReview(packages, snapshotHost) {
  const entries = packages.map((entry) => ({
    name: entry.name,
    version: entry.version,
    identity: entry.identity,
    license: entry.license,
    author: entry.author,
    safeNoticeSourceUrl: entry.safeNoticeSourceUrl,
    classification: entry.classification,
    evidenceSource: "Installed package.json plus physical top-level license/notice files",
    licenseFiles: entry.evidenceFiles
      .filter((file) => file.type === "LICENSE")
      .map(({ text: _text, type: _type, ...file }) => file),
    noticeFiles: entry.evidenceFiles
      .filter((file) => file.type === "NOTICE_OR_COPYRIGHT")
      .map(({ text: _text, type: _type, ...file }) => file),
    manualReviewRequired: entry.manualReviewRequired,
    ownerExactException: entry.ownerExactException,
    prohibited: entry.prohibited,
    distributionScope: entry.distributionScope,
    notes: specialObligation(entry.identity, entry.license),
  }));
  const count = (classification) =>
    entries.filter((entry) => entry.classification === classification).length;
  return {
    schemaVersion: 1,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    distributionScope: DISTRIBUTION_SCOPE,
    policy: {
      automaticallyAdmissible: [...AUTOMATIC_LICENSES].sort((left, right) =>
        left.localeCompare(right, "en"),
      ),
      exactOwnerExceptions: [...OWNER_EXCEPTIONS.entries()].map(([identity, exception]) => ({
        identity,
        ...exception,
      })),
      broadFamilyApproval: false,
    },
    summary: {
      packageCount: entries.length,
      automaticallyAdmissible: count("AUTOMATICALLY_ADMISSIBLE"),
      ownerApprovedExact: count("OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE"),
      unapprovedManualReview: count("UNAPPROVED_MANUAL_REVIEW"),
      prohibited: count("PROHIBITED_BY_DEFAULT"),
      unknownNoLicense: count("UNKNOWN_NO_LICENSE"),
    },
    packages: entries,
  };
}

function buildNotices(packages, snapshotHost) {
  const entries = packages.map((entry) => ({
    name: entry.name,
    version: entry.version,
    license: entry.license,
    author: entry.author,
    safeSourceUrl: entry.safeNoticeSourceUrl,
    classification: entry.classification,
    distributionScope: entry.distributionScope,
    specialObligation: specialObligation(entry.identity, entry.license),
    licenseFiles: entry.evidenceFiles.filter((file) => file.type === "LICENSE"),
    noticeFiles: entry.evidenceFiles.filter((file) => file.type === "NOTICE_OR_COPYRIGHT"),
  }));
  const sourceLinkFallbackCount = entries.filter(
    (entry) => entry.licenseFiles.length + entry.noticeFiles.length === 0,
  ).length;
  return {
    output: renderNoticesHtml(entries, snapshotHost),
    sourceLinkFallbackCount,
    metadataOnlyFallbackCount: 0,
    noticeProvenanceBlockerCount: 0,
  };
}

function buildSecurityFindings(snapshotHost) {
  const audit = runPnpm(["audit", "--json"], [0, 1]);
  const parsed = JSON.parse(audit.stdout);
  const findings = [];
  for (const advisory of Object.values(parsed.advisories ?? {})) {
    const advisoryIdentity = advisory.github_advisory_id || String(advisory.id || advisory.url);
    for (const finding of advisory.findings ?? []) {
      const disposition = vulnerabilityDisposition(advisory.severity);
      findings.push({
        advisory: advisoryIdentity,
        package: advisory.module_name,
        version: finding.version,
        severity: advisory.severity,
        dependencyPaths: [...(finding.paths ?? [])].sort((left, right) =>
          left.localeCompare(right, "en"),
        ),
        patchedBoundary: advisory.patched_versions ?? "",
        vulnerableVersions: advisory.vulnerable_versions ?? "",
        blocking: disposition.blocking,
        state: disposition.state,
        notes:
          advisoryIdentity === "GHSA-xffm-g5w8-qvg7"
            ? "PRE1 carry-forward: open, visible, non-blocking low-severity development-tool finding."
            : "Current read-only pnpm audit finding.",
      });
    }
  }
  findings.sort((left, right) =>
    `${left.advisory}/${left.package}@${left.version}`.localeCompare(
      `${right.advisory}/${right.package}@${right.version}`,
      "en",
    ),
  );
  const severityCounts = Object.fromEntries(
    ["info", "low", "moderate", "high", "critical"].map((severity) => [
      severity,
      findings.filter((finding) => finding.severity === severity).length,
    ]),
  );
  return {
    schemaVersion: 1,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    auditCommand: "pnpm audit --json",
    blockingThreshold: "high",
    summary: {
      ...severityCounts,
      total: findings.length,
      blocking: findings.filter((finding) => finding.blocking).length,
    },
    carryForward: {
      advisory: "GHSA-xffm-g5w8-qvg7",
      package: "@eslint/plugin-kit@0.2.8",
      severity: "low",
      state: findings.some((finding) => finding.advisory === "GHSA-xffm-g5w8-qvg7")
        ? "OPEN_NON_BLOCKING"
        : "NOT_PRESENT_IN_CURRENT_AUDIT",
    },
    findings,
  };
}

function canonicalizeCycloneDxCollections(value, parentKey = "") {
  if (Array.isArray(value)) {
    const entries = value.map((entry) => canonicalizeCycloneDxCollections(entry));
    const keyFor = (entry) => {
      if (typeof entry === "string") return entry;
      if (!entry || typeof entry !== "object") return JSON.stringify(entry);
      if (parentKey === "components") {
        return `${entry["bom-ref"] || ""}/${entry.purl || ""}/${entry.name || ""}/${entry.version || ""}`;
      }
      if (parentKey === "dependencies") return String(entry.ref || "");
      if (parentKey === "authors") return `${entry.name || ""}/${entry.email || ""}`;
      if (parentKey === "externalReferences") return `${entry.type || ""}/${entry.url || ""}`;
      if (parentKey === "hashes") return `${entry.alg || ""}/${entry.content || ""}`;
      if (parentKey === "properties") return `${entry.name || ""}/${entry.value || ""}`;
      if (parentKey === "licenses") {
        return `${entry.expression || ""}/${entry.license?.id || ""}/${entry.license?.name || ""}`;
      }
      return "";
    };
    const unorderedCycloneDxCollections = new Set([
      "authors",
      "components",
      "dependencies",
      "dependsOn",
      "externalReferences",
      "hashes",
      "licenses",
      "properties",
    ]);
    return unorderedCycloneDxCollections.has(parentKey)
      ? entries.sort((left, right) => keyFor(left).localeCompare(keyFor(right), "en"))
      : entries;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        canonicalizeCycloneDxCollections(nested, key),
      ]),
    );
  }
  return value;
}

function buildCanonicalSbom() {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "retrostage-native-sbom-"));
  const nativePath = path.join(temporaryRoot, "native.cdx.json");
  let sbom;
  try {
    runPnpm([
      "sbom",
      "--sbom-format",
      "cyclonedx",
      "--sbom-spec-version",
      "1.7",
      "--lockfile-only",
      "--out",
      nativePath,
    ]);
    sbom = JSON.parse(readFileSync(nativePath, "utf8"));
  } finally {
    rmSync(temporaryRoot, { force: true, recursive: true });
  }
  if (sbom.bomFormat !== "CycloneDX" || sbom.specVersion !== "1.7") {
    throw new Error("Native pnpm SBOM did not produce the required CycloneDX 1.7 identity.");
  }
  if (
    sbom.metadata?.component?.name !== "retrostage-maker" ||
    sbom.metadata?.component?.version !== "0.0.0"
  ) {
    throw new Error("Native pnpm SBOM root identity is not the current workspace root.");
  }
  delete sbom.serialNumber;
  if (sbom.metadata) delete sbom.metadata.timestamp;
  const output = stableJson(canonicalizeCycloneDxCollections(sbom));
  const absoluteRoot = normalizePath(REPOSITORY_ROOT).toLowerCase();
  if (output.toLowerCase().includes(absoluteRoot) || /[A-Za-z]:\\\\/u.test(output)) {
    throw new Error("Canonical SBOM contains an absolute local path.");
  }
  return { output, componentCount: Array.isArray(sbom.components) ? sbom.components.length : 0 };
}

function buildReadme() {
  return `# Compliance baseline

This directory is the deterministic RSM-3-I3 bootstrap/tooling compliance baseline.

- Distribution scope: \`${DISTRIBUTION_SCOPE}\`.
- The SBOM is native pnpm CycloneDX 1.7 with only volatile serial/timestamp fields removed.
- The accepted physical baseline host is \`${BASELINE_HOST.platform}/${BASELINE_HOST.architecture}\`; only platform-neutral artifacts are byte-compared on other hosts.
- License policy applies only the two exact owner exceptions recorded in \`license-review.json\`.
- Notice fallbacks require an approved safe source link; native/WASM records carry explicit provenance, runtime, packaged-role, and removal contracts.
- Low and moderate security findings remain visible; high and critical findings block validation.
- Dependency Review Action is deferred because the current private user-owned repository is not platform-eligible.
- These artifacts are not final product-release or legal approval.

Regenerate with \`pnpm run compliance:generate\` and verify with \`pnpm run compliance:check\`.
`;
}

function assertNoBlockers(licenseReview, securityFindings) {
  const licenseBlockers =
    licenseReview.summary.unapprovedManualReview +
    licenseReview.summary.prohibited +
    licenseReview.summary.unknownNoLicense;
  if (licenseBlockers !== 0) throw new Error(`License blocker count is ${licenseBlockers}.`);
  if (securityFindings.summary.blocking !== 0) {
    throw new Error(
      `High/critical vulnerability blocker count is ${securityFindings.summary.blocking}.`,
    );
  }
  if (
    !licenseReview.packages.some(
      (entry) => entry.identity === "argparse@2.0.1" && entry.ownerExactException,
    ) ||
    !licenseReview.packages.some(
      (entry) => entry.identity === "minimatch@10.2.6" && entry.ownerExactException,
    )
  ) {
    throw new Error("An exact owner-approved license identity is missing or misclassified.");
  }
  if (securityFindings.carryForward.state !== "OPEN_NON_BLOCKING") {
    throw new Error("Required low advisory carry-forward is not visible in the current audit.");
  }
}

export function generateCompliance(destinationPath) {
  const destination = path.resolve(destinationPath);
  mkdirSync(destination, { recursive: true });
  const snapshotHost = { platform: process.platform, architecture: process.arch };
  const rootPackageJson = assertDependencyBaseline();
  const graph = readActiveDependencyGraph();
  const { packages, nativeArtifacts, wasmArtifacts } = buildPackageState(graph, rootPackageJson);
  const inventory = buildInventory(packages, snapshotHost);
  const licenseReview = buildLicenseReview(packages, snapshotHost);
  const notices = buildNotices(packages, snapshotHost);
  const securityFindings = buildSecurityFindings(snapshotHost);
  const sbom = buildCanonicalSbom();
  assertNoBlockers(licenseReview, securityFindings);

  const provenanceIssues = [...nativeArtifacts, ...wasmArtifacts].flatMap((artifact) =>
    validateArtifactProvenance(artifact).map(
      (issue) => `${artifact.relativeArtifactPath}:${issue}`,
    ),
  );
  if (provenanceIssues.length !== 0) {
    throw new Error(
      `BLOCKED — NATIVE ARTIFACT PROVENANCE INCOMPLETE: ${provenanceIssues.join(", ")}`,
    );
  }

  const nativeInventory = {
    schemaVersion: 1,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    distributionScope: DISTRIBUTION_SCOPE,
    scanExtensions: [".node", ".dll", ".exe", ".so", ".dylib"],
    count: nativeArtifacts.length,
    artifacts: nativeArtifacts,
  };
  const wasmInventory = {
    schemaVersion: 1,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    distributionScope: DISTRIBUTION_SCOPE,
    scanExtension: ".wasm",
    count: wasmArtifacts.length,
    artifacts: wasmArtifacts,
  };

  const outputs = new Map([
    ["bom.cdx.json", sbom.output],
    ["dependency-inventory.json", stableJson(inventory)],
    ["license-review.json", stableJson(licenseReview)],
    ["THIRD_PARTY_NOTICES.html", notices.output],
    ["native-binary-inventory.json", stableJson(nativeInventory)],
    ["wasm-module-inventory.json", stableJson(wasmInventory)],
    ["security-findings.json", stableJson(securityFindings)],
    ["README.md", buildReadme()],
  ]);
  for (const [name, content] of outputs)
    writeFileSync(path.join(destination, name), content, "utf8");

  return {
    artifactFiles: ARTIFACT_FILES,
    packageCount: inventory.summary.exactInstalledExternalPackageVersionCount,
    directCount: inventory.summary.directCount,
    transitiveCount: inventory.summary.transitiveCount,
    sbomSpecVersion: "1.7",
    sbomComponentCount: sbom.componentCount,
    noticeEntryCount: packages.length,
    nativeBinaryCount: nativeArtifacts.length,
    wasmCount: wasmArtifacts.length,
    licenseSummary: licenseReview.summary,
    securitySummary: securityFindings.summary,
    carryForwardState: securityFindings.carryForward.state,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    metadataOnlyFallbackCount: notices.metadataOnlyFallbackCount,
    sourceLinkFallbackCount: notices.sourceLinkFallbackCount,
    noticeProvenanceBlockerCount: notices.noticeProvenanceBlockerCount,
    nativeRequiredFieldCompleteCount: nativeArtifacts.length,
    nativeProvenanceBlockerCount: provenanceIssues.length,
  };
}

function main() {
  const destination = process.argv[2]
    ? path.resolve(REPOSITORY_ROOT, process.argv[2])
    : path.join(REPOSITORY_ROOT, "compliance");
  const result = generateCompliance(destination);
  process.stdout.write(
    stableJson({
      destination: normalizePath(path.relative(REPOSITORY_ROOT, destination)),
      ...result,
    }),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) main();
