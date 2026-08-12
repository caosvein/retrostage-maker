interface BootstrapSnapshot {
  readonly repositoryPaths: readonly string[];
  readonly directDevDependencies: Readonly<Record<string, string>>;
  readonly packageNames: Readonly<Record<string, string>>;
  readonly applicationPackageName: string;
  readonly applicationDevDependencies: Readonly<Record<string, string>>;
}

interface PolicyIssue {
  readonly code: string;
  readonly detail: string;
}

const expectedDirectDevDependencies = new Map<string, string>([
  ["dependency-cruiser", "16.10.0"],
  ["eslint", "9.21.0"],
  ["knip", "6.32.0"],
  ["prettier", "3.5.2"],
  ["typescript", "6.0.3"],
  ["typescript-eslint", "8.66.0"],
  ["vitest", "3.2.6"],
]);

const expectedApplicationDevDependencies = new Map<string, string>([
  ["@electron-forge/core", "7.11.2"],
  ["electron", "43.4.0"],
  ["vite", "8.2.1"],
]);

const expectedPackageNames = new Map<string, string>([
  ["packages/core", "@retrostage/core"],
  ["packages/diagnostics", "@retrostage/diagnostics"],
  ["packages/test-fixtures", "@retrostage/test-fixtures"],
]);

const expectedApplicationPaths = new Set([
  "apps/editor-electron/package.json",
  "apps/editor-electron/tsconfig.json",
  "apps/editor-electron/forge.config.mjs",
  "apps/editor-electron/vite.main.config.mjs",
  "apps/editor-electron/vite.preload.config.mjs",
  "apps/editor-electron/vite.renderer.config.mjs",
  "apps/editor-electron/src/main/main.ts",
  "apps/editor-electron/src/preload/preload.ts",
  "apps/editor-electron/src/shell-api.ts",
  "apps/editor-electron/src/renderer/index.html",
  "apps/editor-electron/src/renderer/renderer.ts",
  "apps/editor-electron/src/renderer/styles.css",
  "apps/editor-electron/src/renderer/global.d.ts",
  "apps/editor-electron/scripts/forge.mjs",
  "apps/editor-electron/scripts/smoke.mjs",
  "apps/editor-electron/test/security-contract.test.mjs",
  "apps/editor-electron/test/import-boundary.test.mjs",
]);

const forbiddenEarlyRoots = new Set(["scripts", "tools"]);

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\.\//u, "");
}

function validateExactDependencies(
  actual: Readonly<Record<string, string>>,
  expected: ReadonlyMap<string, string>,
  issues: PolicyIssue[],
  prefix: string,
): void {
  for (const [name, version] of expected) {
    const actualVersion = actual[name];
    if (actualVersion !== version) {
      issues.push({
        code: `${prefix}_DEPENDENCY_MISSING_OR_INEXACT`,
        detail: `${name}: expected ${version}, observed ${actualVersion ?? "ABSENT"}`,
      });
    }
  }
  for (const [name, version] of Object.entries(actual)) {
    if (!expected.has(name)) {
      issues.push({ code: `${prefix}_UNAUTHORIZED_DEPENDENCY`, detail: `${name}@${version}` });
    }
    if (version.includes("-")) {
      issues.push({ code: `${prefix}_PRERELEASE_DEPENDENCY`, detail: `${name}@${version}` });
    }
  }
}

export function validateRepositoryBootstrap(snapshot: BootstrapSnapshot): readonly PolicyIssue[] {
  const issues: PolicyIssue[] = [];

  for (const rawPath of snapshot.repositoryPaths) {
    const path = normalizePath(rawPath);
    const root = path.split("/", 1)[0];
    if (root !== undefined && forbiddenEarlyRoots.has(root)) {
      issues.push({ code: "FORBIDDEN_EARLY_ROOT", detail: path });
    }
    if (path.startsWith("apps/") && !expectedApplicationPaths.has(path)) {
      issues.push({ code: "UNAUTHORIZED_APPLICATION_PATH", detail: path });
    }
    const productPackageMatch = /^(packages\/[^/]+)\/(.+)$/u.exec(path);
    if (productPackageMatch !== null && productPackageMatch[2] !== "package.json") {
      issues.push({ code: "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION", detail: path });
    }
  }

  for (const expectedPath of expectedApplicationPaths) {
    if (!snapshot.repositoryPaths.some((candidate) => normalizePath(candidate) === expectedPath)) {
      issues.push({ code: "REQUIRED_APPLICATION_PATH_MISSING", detail: expectedPath });
    }
  }

  validateExactDependencies(
    snapshot.directDevDependencies,
    expectedDirectDevDependencies,
    issues,
    "ROOT_DIRECT",
  );
  validateExactDependencies(
    snapshot.applicationDevDependencies,
    expectedApplicationDevDependencies,
    issues,
    "APPLICATION_DIRECT",
  );

  if (snapshot.applicationPackageName !== "@retrostage/editor-electron") {
    issues.push({
      code: "APPLICATION_PACKAGE_IDENTITY_MISMATCH",
      detail: snapshot.applicationPackageName || "ABSENT",
    });
  }

  for (const [packagePath, expectedName] of expectedPackageNames) {
    const actualName = snapshot.packageNames[packagePath];
    if (actualName !== expectedName) {
      issues.push({
        code: "PACKAGE_IDENTITY_MISMATCH",
        detail: `${packagePath}: expected ${expectedName}, observed ${actualName ?? "ABSENT"}`,
      });
    }
  }
  for (const packagePath of Object.keys(snapshot.packageNames)) {
    if (!expectedPackageNames.has(packagePath)) {
      issues.push({ code: "UNAUTHORIZED_PRODUCT_PACKAGE", detail: packagePath });
    }
  }

  return issues;
}
