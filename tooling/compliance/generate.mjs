import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
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
  isFirstPartyWorkspaceNode,
  normalizeSafeSourceUrl,
  ownerExceptionApplicationState,
  renderNoticesHtml,
  selectSafeNoticeSource,
  stableJson,
  validateArtifactProvenance,
  vulnerabilityDisposition,
} from "./policy.mjs";

const MODULE_PATH = fileURLToPath(import.meta.url);
const REPOSITORY_ROOT = path.resolve(path.dirname(MODULE_PATH), "..", "..");
const EXPECTED_ROOT_DIRECT_DEPENDENCIES = Object.freeze({
  "dependency-cruiser": "16.10.0",
  eslint: "9.21.0",
  knip: "6.32.0",
  prettier: "3.5.2",
  typescript: "6.0.3",
  "typescript-eslint": "8.66.0",
  vitest: "4.1.11",
});
const EXPECTED_APPLICATION_DIRECT_DEPENDENCIES = Object.freeze({
  "@electron-forge/core": "7.11.2",
  electron: "43.4.0",
  vite: "8.2.1",
});
const DEPENDENCY_SECURITY_ADMISSION = Object.freeze({
  rootTestRunner: "vitest@4.1.11",
  workspaceOverride: "js-yaml@4.3.2",
});
const APPROVED_NODE_GYP_SOURCES = new Set([
  "https://codeload.github.com/electron/node-gyp/tar.gz/06b29aafb7708acef8b3669835c8a7857ebc92d2",
  "git+https://github.com/electron/node-gyp.git#06b29aafb7708acef8b3669835c8a7857ebc92d2",
]);
const EXOTIC_SOURCE_PATTERN =
  /(?:https:\/\/codeload\.github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/tar\.gz\/[A-Za-z0-9_.-]+|(?:git\+(?:https?|ssh)|git|ssh):\/\/(?:git@)?[A-Za-z0-9.-]+\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git#[A-Za-z0-9_.-]+|git@[A-Za-z0-9.-]+:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git#[A-Za-z0-9_.-]+|github:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+#[A-Za-z0-9_.-]+)/gu;
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
const LIGHTNINGCSS_MPL_IDENTITIES = Object.freeze([
  "lightningcss@1.33.0",
  "lightningcss-linux-x64-gnu@1.33.0",
  "lightningcss-win32-x64-msvc@1.33.0",
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

function normalizeNoticeTextLineEndings(value) {
  return value.replace(/\r\n?|\n/gu, "\n");
}

function encodeTerminalSpacesInEscapedNoticeHtml(value) {
  let representedHtml = value;
  for (const heading of ["convert-source-map 2.0.0", "typescript 5.4.5", "typescript 6.0.3"]) {
    const headingMarker = `<h2>${heading}</h2>`;
    const headingIndex = representedHtml.indexOf(headingMarker);
    if (headingIndex === -1 || representedHtml.indexOf(headingMarker, headingIndex + 1) !== -1) {
      throw new Error(`Notice terminal-space target is not unique: ${heading}`);
    }
    const sectionStart = representedHtml.lastIndexOf('<section id="package-', headingIndex);
    const sectionEndMarker = "</section>";
    const sectionEnd = representedHtml.indexOf(sectionEndMarker, headingIndex);
    if (sectionStart === -1 || sectionEnd === -1) {
      throw new Error(`Notice terminal-space section is missing: ${heading}`);
    }
    const sectionAfter = sectionEnd + sectionEndMarker.length;
    const section = representedHtml.slice(sectionStart, sectionAfter);
    const terminalSpaces = section.match(/ +(?=\n)/gu) ?? [];
    if (terminalSpaces.length !== 1) {
      throw new Error(`Notice terminal-space count is not exact for ${heading}`);
    }
    const representedSection = section.replace(/ +(?=\n)/gu, (spaces) =>
      "&#32;".repeat(spaces.length),
    );
    representedHtml = `${representedHtml.slice(0, sectionStart)}${representedSection}${representedHtml.slice(sectionAfter)}`;
  }
  return representedHtml;
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

export function assertRuntimeDependencyBaseline(
  rootRuntimeDependencies,
  applicationRuntimeDependencies,
) {
  if (Object.keys(rootRuntimeDependencies ?? {}).length !== 0) {
    throw new Error("Root production npm runtime direct dependencies are not authorized.");
  }
  const applicationEntries = Object.entries(applicationRuntimeDependencies ?? {});
  if (
    applicationEntries.length !== 1 ||
    applicationEntries[0]?.[0] !== "@retrostage/renderer-babylon9" ||
    applicationEntries[0]?.[1] !== "workspace:*"
  ) {
    throw new Error(
      "Electron app runtime dependencies must be exactly @retrostage/renderer-babylon9=workspace:*.",
    );
  }
}

function assertDependencyBaseline() {
  const rootPackageJson = JSON.parse(
    readFileSync(path.join(REPOSITORY_ROOT, "package.json"), "utf8"),
  );
  const applicationPackageJson = JSON.parse(
    readFileSync(path.join(REPOSITORY_ROOT, "apps", "editor-electron", "package.json"), "utf8"),
  );
  if (
    JSON.stringify(rootPackageJson.devDependencies ?? {}) !==
    JSON.stringify(EXPECTED_ROOT_DIRECT_DEPENDENCIES)
  ) {
    throw new Error("Root direct dependency baseline differs from the accepted seven identities.");
  }
  if (
    JSON.stringify(applicationPackageJson.devDependencies ?? {}) !==
    JSON.stringify(EXPECTED_APPLICATION_DIRECT_DEPENDENCIES)
  ) {
    throw new Error(
      "Electron app direct dependency baseline differs from the accepted three identities.",
    );
  }
  assertRuntimeDependencyBaseline(
    rootPackageJson.dependencies,
    applicationPackageJson.dependencies,
  );

  const workspace = readFileSync(path.join(REPOSITORY_ROOT, "pnpm-workspace.yaml"), "utf8");
  for (const fragment of [
    '  - "apps/*"',
    "autoInstallPeers: false",
    "blockExoticSubdeps: false",
    "strictPeerDependencies: true",
    "ignoreScripts: true",
    'savePrefix: ""',
    "  - electron@43.4.0",
    "overrides:\n  js-yaml: 4.3.2",
    "  tar: 7.5.22",
    '  "eslint@9.21.0>@eslint/plugin-kit": 0.3.4',
  ]) {
    if (!workspace.includes(fragment)) throw new Error(`Workspace policy drift: ${fragment}`);
  }

  const lock = readFileSync(path.join(REPOSITORY_ROOT, "pnpm-lock.yaml"), "utf8");
  for (const fragment of [
    "overrides:\n  js-yaml: 4.3.2",
    "js-yaml@4.3.2:",
    "eslint@9.21.0>@eslint/plugin-kit: 0.3.4",
    "'@eslint/plugin-kit@0.3.4':",
    "tar@7.5.22:",
    "electron@43.4.0:",
  ]) {
    if (!lock.includes(fragment)) throw new Error(`Lock graph identity missing: ${fragment}`);
  }
  const exoticSources = new Set(lock.match(EXOTIC_SOURCE_PATTERN) ?? []);
  if (
    exoticSources.size !== 1 ||
    !APPROVED_NODE_GYP_SOURCES.has(exoticSources.values().next().value)
  ) {
    throw new Error(`Exotic source set differs: ${[...exoticSources].join(",") || "ABSENT"}`);
  }
  return { rootPackageJson, applicationPackageJson };
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

function buildElectronBundledLicenseEvidence(snapshotHost) {
  const sourceRoot = path.join(
    REPOSITORY_ROOT,
    "apps",
    "editor-electron",
    "node_modules",
    "electron",
    "dist",
  );
  const packagedRoot = path.join(
    REPOSITORY_ROOT,
    "apps",
    "editor-electron",
    "out",
    `RetroStageMaker-${snapshotHost.platform}-${snapshotHost.architecture}`,
  );
  const evidence = [];
  for (const filename of ["LICENSE", "LICENSES.chromium.html"]) {
    const sourcePath = path.join(sourceRoot, filename);
    const packagedPath = path.join(packagedRoot, filename);
    if (!existsSync(sourcePath) || !existsSync(packagedPath)) {
      throw new Error(`Electron bundled license evidence missing: ${filename}`);
    }
    const sourceBytes = readFileSync(sourcePath);
    const packagedBytes = readFileSync(packagedPath);
    if (!sourceBytes.equals(packagedBytes)) {
      throw new Error(`Electron bundled license package identity mismatch: ${filename}`);
    }
    for (const [role, filePath, bytes] of [
      ["ACQUIRED_ELECTRON_DISTRIBUTION", sourcePath, sourceBytes],
      ["FORGE_UNPACKAGED_APPLICATION", packagedPath, packagedBytes],
    ]) {
      evidence.push({
        role,
        path: relativeRepositoryPath(filePath),
        bytes: bytes.length,
        sha256: sha256Bytes(bytes),
      });
    }
  }
  return evidence;
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

function walkAllFiles(rootPath) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name, "en"),
    )) {
      if (entry.isSymbolicLink()) continue;
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile()) files.push(entryPath);
    }
  };
  visit(rootPath);
  return files;
}

function buildMplPackagedDistributionEvidence(snapshotHost, nativeArtifacts) {
  const packagedApplicationRoot = path.join(
    REPOSITORY_ROOT,
    "apps",
    "editor-electron",
    "out",
    `RetroStageMaker-${snapshotHost.platform}-${snapshotHost.architecture}`,
    "resources",
    "app",
  );
  if (!existsSync(packagedApplicationRoot)) {
    throw new Error("Forge unpackaged application is missing for MPL distribution inspection.");
  }

  const packagedFiles = walkAllFiles(packagedApplicationRoot);
  const installedMplNativeHashes = new Set(
    nativeArtifacts
      .filter((artifact) =>
        LIGHTNINGCSS_MPL_IDENTITIES.includes(`${artifact.owningPackage}@${artifact.version}`),
      )
      .map((artifact) => artifact.sha256),
  );
  const packagedPathIdentityMatches = packagedFiles
    .map((filePath) => relativeRepositoryPath(filePath))
    .filter((filePath) => filePath.toLowerCase().includes("lightningcss"));
  const packagedNativeHashMatches = packagedFiles
    .map((filePath) => ({ path: relativeRepositoryPath(filePath), sha256: sha256File(filePath) }))
    .filter((entry) => installedMplNativeHashes.has(entry.sha256));
  const textExtensions = new Set([".cjs", ".css", ".html", ".js", ".json", ".mjs", ".ts"]);
  const packagedTextIdentityMatches = packagedFiles
    .filter((filePath) => textExtensions.has(path.extname(filePath).toLowerCase()))
    .filter((filePath) => readFileSync(filePath, "utf8").toLowerCase().includes("lightningcss"))
    .map((filePath) => relativeRepositoryPath(filePath));
  const packagedNodeModulesPresent = existsSync(path.join(packagedApplicationRoot, "node_modules"));
  const coveredExecutableOrSourcePresent =
    packagedNodeModulesPresent ||
    packagedPathIdentityMatches.length !== 0 ||
    packagedNativeHashMatches.length !== 0 ||
    packagedTextIdentityMatches.length !== 0;
  if (coveredExecutableOrSourcePresent) {
    throw new Error(
      "BLOCKED — MPL-COVERED LIGHTNING CSS CONTENT PRESENT WITHOUT A REVIEWED RELEASE-DISTRIBUTION MECHANISM",
    );
  }

  return {
    identities: [...LIGHTNINGCSS_MPL_IDENTITIES],
    packagedApplicationRoot: relativeRepositoryPath(packagedApplicationRoot),
    packagedResourceFileCount: packagedFiles.length,
    packagedNodeModulesPresent,
    installedMplNativeArtifactCount: installedMplNativeHashes.size,
    packagedPathIdentityMatches,
    packagedNativeHashMatches,
    packagedTextIdentityMatches,
    coveredExecutableOrSourcePresent,
    distributionDisposition:
      "BUILD_ONLY / PHYSICALLY ABSENT FROM CURRENT FORGE UNPACKAGED APPLICATION",
    sourceAvailabilityFulfillment:
      "NOT TRIGGERED FOR THIS CANDIDATE ARTIFACT; RE-EVALUATE AND PROVIDE MPL-COVERED SOURCE IF A FUTURE RELEASE ARTIFACT PHYSICALLY DISTRIBUTES THE COMPONENT",
    noticeFulfillment:
      "MPL identity, license material, and build-graph provenance remain retained in the governed compliance notices.",
  };
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

/**
 * Resolve the set of first-party workspace package absolute paths from
 * pnpm-workspace.yaml. Only paths strictly within REPOSITORY_ROOT are
 * included. Fails closed: any glob pattern that is not a simple "dir/*"
 * form, or any resolved path that escapes the repository, is ignored.
 */
export function readFirstPartyWorkspacePackagePaths(repoRoot = REPOSITORY_ROOT) {
  const workspaceYaml = readFileSync(path.join(repoRoot, "pnpm-workspace.yaml"), "utf8");
  const packageGlobs = [];
  let inPackages = false;
  for (const line of workspaceYaml.split("\n")) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }
    if (inPackages) {
      const m = line.match(/^\s+-\s+"([^"]+)"\s*$/);
      if (m) {
        packageGlobs.push(m[1]);
      } else if (/^\S/.test(line)) {
        inPackages = false;
      }
    }
  }
  const firstPartyPaths = new Map();
  const repoResolved = realpathSync(repoRoot);
  const repoPrefix = repoResolved + path.sep;
  const nameOwners = new Map(); // name -> realPath (for duplicate detection)
  const realPathLogicalOwners = new Map(); // realPath -> logicalPkgPath (for ambiguity detection)
  for (const glob of packageGlobs) {
    if (!glob.endsWith("/*")) continue;
    const parentDir = path.join(repoResolved, glob.slice(0, -2));
    if (!existsSync(parentDir)) continue;
    for (const entry of readdirSync(parentDir, { withFileTypes: true })) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const logicalPkgPath = path.join(parentDir, entry.name);
      // Physical real path resolution — fails closed on symlink escape
      let realPkgPath;
      try {
        realPkgPath = realpathSync(logicalPkgPath);
      } catch (err) {
        throw new Error(`WORKSPACE_REALPATH_FAILED:${logicalPkgPath}: ${err.message}`);
      }
      // Fail closed: real path must be strictly inside real repo root
      if (!realPkgPath.startsWith(repoPrefix)) {
        throw new Error(`WORKSPACE_REALPATH_ESCAPE:${logicalPkgPath} realPath=${realPkgPath}`);
      }
      // Fail closed: real path must not equal repo root
      if (realPkgPath === repoResolved) {
        throw new Error(`WORKSPACE_REALPATH_IS_REPO_ROOT:${logicalPkgPath}`);
      }
      const packageJsonPath = path.join(realPkgPath, "package.json");
      if (!existsSync(packageJsonPath)) continue;
      let pkgJson;
      try {
        const pkgJsonBytes = readFileSync(packageJsonPath, "utf8");
        pkgJson = JSON.parse(pkgJsonBytes);
      } catch (err) {
        // Fail closed: malformed or unreadable manifest
        throw new Error(`WORKSPACE_MANIFEST_PARSE_FAILED:${packageJsonPath}: ${err.message}`);
      }
      const pkgName = typeof pkgJson.name === "string" ? pkgJson.name.trim() : "";
      if (!pkgName) {
        throw new Error(`WORKSPACE_MANIFEST_EMPTY_NAME:${packageJsonPath}`);
      }
      // Fail closed: duplicate package name
      if (nameOwners.has(pkgName) && nameOwners.get(pkgName) !== realPkgPath) {
        throw new Error(
          `WORKSPACE_DUPLICATE_PACKAGE_NAME:${pkgName} owned_by=${nameOwners.get(pkgName)} and ${realPkgPath}`,
        );
      }
      // Fail closed: ambiguous real ownership (two distinct logical paths → same real path)
      if (
        realPathLogicalOwners.has(realPkgPath) &&
        realPathLogicalOwners.get(realPkgPath) !== logicalPkgPath
      ) {
        throw new Error(
          `WORKSPACE_AMBIGUOUS_REAL_PATH:${realPkgPath} claimed_by=${realPathLogicalOwners.get(realPkgPath)} and ${logicalPkgPath}`,
        );
      }
      nameOwners.set(pkgName, realPkgPath);
      firstPartyPaths.set(realPkgPath, pkgName);
      realPathLogicalOwners.set(realPkgPath, logicalPkgPath);
    }
  }
  return firstPartyPaths;
}

function packagePurl(name, version) {
  const encodedName = encodeURIComponent(name).replace("%2F", "/");
  return `pkg:npm/${encodedName}@${version}`;
}

function buildPackageState(graph, rootPackageJson, applicationPackageJson) {
  const directIdentities = new Set(
    [
      ...Object.entries(rootPackageJson.devDependencies ?? {}),
      ...Object.entries(applicationPackageJson.devDependencies ?? {}),
    ].map(([name, version]) => `${name}@${version}`),
  );
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
      const provenance = createArtifactProvenanceFields({
        name: node.name,
        version: node.version,
        artifactType: physicalArtifactType,
        repository: declaredRepository,
        noticeSourceUrl,
        licenseNoticeLocations,
      });
      if (node.name === "electron") {
        provenance.packagedRole =
          "RSM-5-I1 ELECTRON SECURE SHELL RUNTIME / NOT FINAL RELEASE PACKAGE";
      }
      const record = {
        owningPackage: node.name,
        version: node.version,
        relativeArtifactPath: relativeRepositoryPath(artifactPath),
        artifactType: physicalArtifactType,
        sha256: sha256File(artifactPath),
        license,
        provenanceSourceIdentity: identity,
        distributionScope: DISTRIBUTION_SCOPE,
        ...provenance,
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
      direct: directIdentities.has(identity),
      directWorkspace:
        rootPackageJson.devDependencies?.[node.name] === node.version
          ? "ROOT"
          : applicationPackageJson.devDependencies?.[node.name] === node.version
            ? "apps/editor-electron"
            : "TRANSITIVE",
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

function buildInventory(packages, snapshotHost, electronBundledLicenseEvidence) {
  const entries = packages.map((entry) => ({
    name: entry.name,
    version: entry.version,
    identity: entry.identity,
    purl: entry.purl,
    direct: entry.direct,
    directWorkspace: entry.directWorkspace,
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
    electronBundledLicenseEvidence,
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

function specialObligation(identity, license, mplDistributionEvidence) {
  if (identity === "argparse@2.0.1") {
    return "Retain applicable Python/PSF, BeOpen, CNRI, and CWI license/copyright text; describe covered derivative changes when applicable.";
  }
  if (identity === "minimatch@10.2.6") {
    return "Give recipients the Blue Oak Model License 1.0.0 text or its permitted canonical link.";
  }
  if (LIGHTNINGCSS_MPL_IDENTITIES.includes(identity)) {
    return `Retain MPL-2.0 license/source-availability obligations. Current physical package observation: ${mplDistributionEvidence.distributionDisposition}; ${mplDistributionEvidence.sourceAvailabilityFulfillment}`;
  }
  if (identity === "type-fest@0.13.1" || identity === "type-fest@1.4.0") {
    return "Upstream metadata remains (MIT OR CC0-1.0); the exact owner commercial disposition selects the MIT branch without rewriting upstream metadata.";
  }
  return license
    ? "Preserve applicable license and copyright material when distributing this development/bootstrap dependency."
    : "No standalone license identity was discovered; distribution is blocked.";
}

function buildLicenseReview(packages, snapshotHost, mplDistributionEvidence) {
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
    ownerCommercialDisposition:
      entry.identity === "type-fest@0.13.1" || entry.identity === "type-fest@1.4.0"
        ? "MIT SELECTED FROM UPSTREAM (MIT OR CC0-1.0) EXPRESSION"
        : entry.ownerExactException
          ? "HUMAN PROJECT OWNER APPROVED — EXACT IDENTITY/LICENSE ONLY"
          : "NOT APPLICABLE",
    packagedArtifactDisposition: LIGHTNINGCSS_MPL_IDENTITIES.includes(entry.identity)
      ? mplDistributionEvidence
      : null,
    notes: specialObligation(entry.identity, entry.license, mplDistributionEvidence),
  }));
  const count = (classification) =>
    entries.filter((entry) => entry.classification === classification).length;
  return {
    schemaVersion: 1,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    distributionScope: DISTRIBUTION_SCOPE,
    currentHostOwnerApprovedIdentities: entries
      .filter((entry) => entry.ownerExactException)
      .map((entry) => entry.identity)
      .sort((left, right) => left.localeCompare(right, "en")),
    mplCoveredComponentEvidence: mplDistributionEvidence,
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

function buildNotices(
  packages,
  snapshotHost,
  electronBundledLicenseEvidence,
  mplDistributionEvidence,
) {
  const entries = packages.map((entry) => ({
    name: entry.name,
    version: entry.version,
    license: entry.license,
    author: entry.author,
    safeSourceUrl: entry.safeNoticeSourceUrl,
    classification: entry.classification,
    distributionScope: entry.distributionScope,
    specialObligation: specialObligation(entry.identity, entry.license, mplDistributionEvidence),
    licenseFiles: entry.evidenceFiles
      .filter((file) => file.type === "LICENSE")
      .map((file) => ({ ...file, text: normalizeNoticeTextLineEndings(file.text) })),
    noticeFiles: entry.evidenceFiles
      .filter((file) => file.type === "NOTICE_OR_COPYRIGHT")
      .map((file) => ({ ...file, text: normalizeNoticeTextLineEndings(file.text) })),
  }));
  const sourceLinkFallbackCount = entries.filter(
    (entry) => entry.licenseFiles.length + entry.noticeFiles.length === 0,
  ).length;
  const escapedHtml = renderNoticesHtml(
    entries,
    snapshotHost,
    electronBundledLicenseEvidence,
    mplDistributionEvidence,
  );
  return {
    output: encodeTerminalSpacesInEscapedNoticeHtml(escapedHtml),
    sourceLinkFallbackCount,
    metadataOnlyFallbackCount: 0,
    noticeProvenanceBlockerCount: 0,
  };
}

function buildSecurityFindings(snapshotHost) {
  const audit = runPnpm(["audit", "--json"], [0]);
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
          "Current full pnpm audit finding; candidate readiness requires this list to be empty.",
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
    dependencySecurityAdmission: DEPENDENCY_SECURITY_ADMISSION,
    auditCommand: "pnpm audit --json",
    blockingThreshold: "high",
    summary: {
      ...severityCounts,
      total: findings.length,
      blocking: findings.filter((finding) => finding.blocking).length,
    },
    carryForward: {
      advisory: "GHSA-xffm-g5w8-qvg7",
      package: "@eslint/plugin-kit@0.3.4",
      severity: "low",
      state: findings.some((finding) => finding.advisory === "GHSA-xffm-g5w8-qvg7")
        ? "UNEXPECTED_PRESENT"
        : "REMEDIATED_NOT_PRESENT_IN_CURRENT_AUDIT",
      remediation: 'parent-scoped pnpm override "eslint@9.21.0>@eslint/plugin-kit": 0.3.4',
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

function buildReadme(ownerExceptionState) {
  return `# Compliance baseline

This directory is the deterministic RSM-5-I1 secure Electron shell compliance baseline.

- Distribution scope: \`${DISTRIBUTION_SCOPE}\`.
- The SBOM is native pnpm CycloneDX 1.7 with only volatile serial/timestamp fields removed.
- The accepted physical baseline host is \`${BASELINE_HOST.platform}/${BASELINE_HOST.architecture}\`; only platform-neutral artifacts are byte-compared on other hosts.
- License policy applies only exact package/version/license owner dispositions recorded in \`license-review.json\`; broad family approval is forbidden.
- The owner-exception policy contains exactly ${ownerExceptionState.policyWideApprovedCount} Human Project Owner-approved package/version/license identities; broad family or platform-prefix approval is forbidden.
- On every installed host, applied owner exceptions must be an exact-identity subset of that policy-wide approved set; platform-specific approved identities may remain dormant when absent from the current host graph.
- Notice fallbacks require an approved safe source link; native/WASM records carry explicit provenance, runtime, packaged-role, and removal contracts.
- MPL-covered Lightning CSS is physically verified as build-only and absent from the current Forge unpackaged application; license review and notices retain the exact absence/source-availability evidence and require a future artifact-specific recheck.
- Candidate readiness requires the complete current audit to remain zero at every severity; the parent-scoped plugin-kit remediation stays visible in \`security-findings.json\`.
- Dependency-security admission requires exact \`vitest@4.1.11\` and the exact workspace override \`js-yaml@4.3.2\`; the lock graph must contain the matching js-yaml package identity.
- Electron acquisition remains explicit while lifecycle scripts stay disabled. The sole lock-pinned exotic source is \`@electron/node-gyp\` commit \`06b29aafb7708acef8b3669835c8a7857ebc92d2\`, and \`tar@7.5.22\` remains exact.
- Electron and Chromium bundled license files are physically verified in the acquired distribution and Forge unpackaged application.
- Dependency Review Action is deferred because the current private user-owned repository is not platform-eligible.
- These artifacts are not final product-release notice completeness or legal approval.

Regenerate with \`pnpm run compliance:generate\` and verify with \`pnpm run compliance:check\`.
`;
}

function assertNoBlockers(licenseReview, securityFindings) {
  const licenseBlockers =
    licenseReview.summary.unapprovedManualReview +
    licenseReview.summary.prohibited +
    licenseReview.summary.unknownNoLicense;
  if (licenseBlockers !== 0) throw new Error(`License blocker count is ${licenseBlockers}.`);
  if (securityFindings.summary.total !== 0 || securityFindings.summary.blocking !== 0) {
    throw new Error(`Current full audit is not zero: ${JSON.stringify(securityFindings.summary)}.`);
  }
  const expectedOwnerIdentities = [...OWNER_EXCEPTIONS.keys()].sort((left, right) =>
    left.localeCompare(right, "en"),
  );
  const observedOwnerIdentities = licenseReview.packages
    .filter((entry) => entry.ownerExactException)
    .map((entry) => entry.identity)
    .sort((left, right) => left.localeCompare(right, "en"));
  const ownerExceptionState = ownerExceptionApplicationState({
    observedIdentities: observedOwnerIdentities,
    platform: licenseReview.snapshotHost.platform,
    architecture: licenseReview.snapshotHost.architecture,
  });
  if (expectedOwnerIdentities.length !== 15) {
    throw new Error(
      `Owner-approved identity policy count is ${expectedOwnerIdentities.length}; expected 15.`,
    );
  }
  if (securityFindings.carryForward.state !== "REMEDIATED_NOT_PRESENT_IN_CURRENT_AUDIT") {
    throw new Error("Plugin-kit remediation visibility differs from the accepted RESUME1 state.");
  }
  return ownerExceptionState;
}

export function generateCompliance(destinationPath) {
  const destination = path.resolve(destinationPath);
  mkdirSync(destination, { recursive: true });
  const snapshotHost = { platform: process.platform, architecture: process.arch };
  const { rootPackageJson, applicationPackageJson } = assertDependencyBaseline();
  const firstPartyPaths = readFirstPartyWorkspacePackagePaths();
  const graph = readActiveDependencyGraph().filter(
    (node) => !isFirstPartyWorkspaceNode(node, firstPartyPaths, REPOSITORY_ROOT),
  );
  const electronBundledLicenseEvidence = buildElectronBundledLicenseEvidence(snapshotHost);
  const { packages, nativeArtifacts, wasmArtifacts } = buildPackageState(
    graph,
    rootPackageJson,
    applicationPackageJson,
  );
  const mplDistributionEvidence = buildMplPackagedDistributionEvidence(
    snapshotHost,
    nativeArtifacts,
  );
  const inventory = buildInventory(packages, snapshotHost, electronBundledLicenseEvidence);
  const licenseReview = buildLicenseReview(packages, snapshotHost, mplDistributionEvidence);
  const notices = buildNotices(
    packages,
    snapshotHost,
    electronBundledLicenseEvidence,
    mplDistributionEvidence,
  );
  const securityFindings = buildSecurityFindings(snapshotHost);
  const sbom = buildCanonicalSbom();
  const ownerExceptionState = assertNoBlockers(licenseReview, securityFindings);

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
    dependencySecurityAdmission: DEPENDENCY_SECURITY_ADMISSION,
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
    ["README.md", buildReadme(ownerExceptionState)],
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
    currentHostOwnerApprovedIdentities: licenseReview.currentHostOwnerApprovedIdentities,
    currentHostOwnerExceptionCount: licenseReview.currentHostOwnerApprovedIdentities.length,
    policyWideOwnerExceptionCount: ownerExceptionState.policyWideApprovedCount,
    approvedButDormantOwnerExceptionIdentities: ownerExceptionState.approvedButDormantIdentities,
    mplCoveredComponentDistributed: mplDistributionEvidence.coveredExecutableOrSourcePresent,
    mplPackagedResourceFileCount: mplDistributionEvidence.packagedResourceFileCount,
    baselineHost: BASELINE_HOST,
    snapshotHost,
    metadataOnlyFallbackCount: notices.metadataOnlyFallbackCount,
    sourceLinkFallbackCount: notices.sourceLinkFallbackCount,
    noticeProvenanceBlockerCount: notices.noticeProvenanceBlockerCount,
    nativeRequiredFieldCompleteCount: nativeArtifacts.length,
    nativeProvenanceBlockerCount: provenanceIssues.length,
    electronBundledLicenseEvidenceCount: electronBundledLicenseEvidence.length,
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
