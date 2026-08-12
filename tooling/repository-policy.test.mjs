import { describe, expect, it } from "vitest";

import { validateRepositoryBootstrap } from "./repository-policy.ts";

const rootDependencies = {
  "dependency-cruiser": "16.10.0",
  eslint: "9.21.0",
  knip: "6.32.0",
  prettier: "3.5.2",
  typescript: "6.0.3",
  "typescript-eslint": "8.66.0",
  vitest: "3.2.6",
};
const applicationDependencies = {
  "@electron-forge/core": "7.11.2",
  electron: "43.4.0",
  vite: "8.2.1",
};
const packageNames = {
  "packages/core": "@retrostage/core",
  "packages/diagnostics": "@retrostage/diagnostics",
  "packages/test-fixtures": "@retrostage/test-fixtures",
};

function snapshot(overrides = {}) {
  return {
    repositoryPaths: [
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
      "packages/core/package.json",
      "packages/diagnostics/package.json",
      "packages/test-fixtures/package.json",
    ],
    directDevDependencies: rootDependencies,
    packageNames,
    applicationPackageName: "@retrostage/editor-electron",
    applicationDevDependencies: applicationDependencies,
    ...overrides,
  };
}

describe("RSM-5-I1 repository policy", () => {
  it("accepts the exact secure-shell topology and dependency sets", () => {
    expect(validateRepositoryBootstrap(snapshot())).toEqual([]);
  });

  it("rejects unexpected app topology and later product paths", () => {
    const baseline = snapshot();
    const issues = validateRepositoryBootstrap(
      snapshot({
        repositoryPaths: [
          ...baseline.repositoryPaths,
          "apps/player-electron/package.json",
          "apps/editor-electron/scene/model.ts",
        ],
      }),
    );
    expect(issues.map(({ code }) => code)).toEqual([
      "UNAUTHORIZED_APPLICATION_PATH",
      "UNAUTHORIZED_APPLICATION_PATH",
    ]);
  });

  it("rejects an incomplete secure-shell topology", () => {
    const issues = validateRepositoryBootstrap(
      snapshot({ repositoryPaths: ["apps/editor-electron/package.json"] }),
    );
    expect(issues.map(({ code }) => code)).toContain("REQUIRED_APPLICATION_PATH_MISSING");
  });

  it("rejects a fourth app dependency, plugin-vite, Forge CLI and a prerelease", () => {
    for (const applicationDevDependencies of [
      { ...applicationDependencies, react: "19.0.0" },
      { ...applicationDependencies, "@electron-forge/plugin-vite": "7.11.2" },
      { ...applicationDependencies, "@electron-forge/cli": "7.11.2" },
      { ...applicationDependencies, "@electron-forge/core": "8.0.0-alpha.10" },
    ]) {
      expect(validateRepositoryBootstrap(snapshot({ applicationDevDependencies }))).not.toEqual([]);
    }
  });

  it("rejects Vite downgrade and inexact tar-independent app versions", () => {
    const issues = validateRepositoryBootstrap(
      snapshot({ applicationDevDependencies: { ...applicationDependencies, vite: "7.3.6" } }),
    );
    expect(issues.map(({ code }) => code)).toContain(
      "APPLICATION_DIRECT_DEPENDENCY_MISSING_OR_INEXACT",
    );
  });
});
