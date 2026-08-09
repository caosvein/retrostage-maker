import { describe, expect, it } from "vitest";

import { validateRepositoryBootstrap } from "./repository-policy.ts";

const admittedDependencies = {
  "dependency-cruiser": "16.10.0",
  eslint: "9.21.0",
  knip: "6.32.0",
  prettier: "3.5.2",
  typescript: "6.0.3",
  "typescript-eslint": "8.66.0",
  vitest: "3.0.7",
};

const admittedPackages = {
  "packages/core": "@retrostage/core",
  "packages/diagnostics": "@retrostage/diagnostics",
  "packages/test-fixtures": "@retrostage/test-fixtures",
};

describe("RSM-3-I2 repository bootstrap policy", () => {
  it("accepts the exact empty-foundation topology and dependency set", () => {
    const issues = validateRepositoryBootstrap({
      repositoryPaths: [
        "tooling/repository-policy.ts",
        "packages/core/package.json",
        "packages/diagnostics/package.json",
        "packages/test-fixtures/package.json",
      ],
      directDevDependencies: admittedDependencies,
      packageNames: admittedPackages,
    });

    expect(issues).toEqual([]);
  });

  it("rejects a future application root and product source content", () => {
    const issues = validateRepositoryBootstrap({
      repositoryPaths: ["apps/editor-electron/package.json", "packages/core/src/index.ts"],
      directDevDependencies: admittedDependencies,
      packageNames: admittedPackages,
    });

    expect(issues.map(({ code }) => code)).toEqual([
      "FORBIDDEN_EARLY_ROOT",
      "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION",
    ]);
  });

  it("rejects an unauthorized or inexact direct dependency", () => {
    const issues = validateRepositoryBootstrap({
      repositoryPaths: [],
      directDevDependencies: {
        ...admittedDependencies,
        typescript: "6.0.2",
        vite: "8.2.0",
      },
      packageNames: admittedPackages,
    });

    expect(issues.map(({ code }) => code)).toEqual([
      "DIRECT_DEPENDENCY_MISSING_OR_INEXACT",
      "UNAUTHORIZED_DIRECT_DEPENDENCY",
    ]);
  });
});
