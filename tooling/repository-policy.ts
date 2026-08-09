interface BootstrapSnapshot {
  readonly repositoryPaths: readonly string[];
  readonly directDevDependencies: Readonly<Record<string, string>>;
  readonly packageNames: Readonly<Record<string, string>>;
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
  ["vitest", "3.0.7"],
]);

const expectedPackageNames = new Map<string, string>([
  ["packages/core", "@retrostage/core"],
  ["packages/diagnostics", "@retrostage/diagnostics"],
  ["packages/test-fixtures", "@retrostage/test-fixtures"],
]);

const forbiddenEarlyRoots = new Set([".github", "apps", "scripts", "tools"]);

function normalizePath(path: string): string {
  return path.replaceAll("\\\\", "/").replace(/^\.\//u, "");
}

export function validateRepositoryBootstrap(snapshot: BootstrapSnapshot): readonly PolicyIssue[] {
  const issues: PolicyIssue[] = [];

  for (const rawPath of snapshot.repositoryPaths) {
    const path = normalizePath(rawPath);
    const root = path.split("/", 1)[0];

    if (root !== undefined && forbiddenEarlyRoots.has(root)) {
      issues.push({ code: "FORBIDDEN_EARLY_ROOT", detail: path });
    }

    const productPackageMatch = /^(packages\/[^/]+)\/(.+)$/u.exec(path);
    if (productPackageMatch !== null && productPackageMatch[2] !== "package.json") {
      issues.push({ code: "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION", detail: path });
    }
  }

  for (const [name, version] of expectedDirectDevDependencies) {
    const actualVersion = snapshot.directDevDependencies[name];
    if (actualVersion !== version) {
      issues.push({
        code: "DIRECT_DEPENDENCY_MISSING_OR_INEXACT",
        detail: `${name}: expected ${version}, observed ${actualVersion ?? "ABSENT"}`,
      });
    }
  }

  for (const [name, version] of Object.entries(snapshot.directDevDependencies)) {
    if (!expectedDirectDevDependencies.has(name)) {
      issues.push({ code: "UNAUTHORIZED_DIRECT_DEPENDENCY", detail: `${name}@${version}` });
    }
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
