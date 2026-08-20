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
const rendererDependencies = {
  "@babylonjs/core": "9.21.2",
  "@babylonjs/loaders": "9.21.2",
  "@retrostage/core": "workspace:*",
  "@retrostage/diagnostics": "workspace:*",
};
const rendererDevDependencies = {
  "babylonjs-gltf2interface": "9.21.2",
};
const packageNames = {
  "packages/core": "@retrostage/core",
  "packages/diagnostics": "@retrostage/diagnostics",
  "packages/renderer-babylon9": "@retrostage/renderer-babylon9",
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
      "packages/renderer-babylon9/package.json",
      "packages/renderer-babylon9/tsconfig.json",
      "packages/renderer-babylon9/src/index.ts",
      "packages/renderer-babylon9/src/editor.ts",
      "packages/renderer-babylon9/src/headless.ts",
      "packages/renderer-babylon9/src/contracts/public.ts",
      "packages/renderer-babylon9/src/engine/engine-port.ts",
      "packages/renderer-babylon9/src/engine/babylon-engine-factory.ts",
      "packages/renderer-babylon9/src/engine/renderer-adapter.ts",
      "packages/renderer-babylon9/src/scene/scene-port.ts",
      "packages/renderer-babylon9/src/scene/babylon-scene-factory.ts",
      "packages/renderer-babylon9/src/surface/host-capability.ts",
      "packages/renderer-babylon9/src/surface/resize-controller.ts",
      "packages/renderer-babylon9/src/surface/context-controller.ts",
      "packages/renderer-babylon9/src/camera/camera-port.ts",
      "packages/renderer-babylon9/src/camera/babylon-camera-factory.ts",
      "packages/renderer-babylon9/src/camera/camera-controller.ts",
      "packages/renderer-babylon9/src/grid/grid-port.ts",
      "packages/renderer-babylon9/src/grid/babylon-grid-factory.ts",
      "packages/renderer-babylon9/src/grid/grid-controller.ts",
      "packages/renderer-babylon9/src/registry/handle-port.ts",
      "packages/renderer-babylon9/src/registry/handle-registry.ts",
      "packages/renderer-babylon9/src/picking/picking-port.ts",
      "packages/renderer-babylon9/src/picking/babylon-picking-factory.ts",
      "packages/renderer-babylon9/src/picking/picking-controller.ts",
      "packages/renderer-babylon9/test/type-leak.test.ts",
      "packages/renderer-babylon9/test/entry-isolation.test.ts",
      "packages/renderer-babylon9/test/lifecycle.test.ts",
      "packages/renderer-babylon9/test/resize-host.test.ts",
      "packages/renderer-babylon9/test/context-loss.test.ts",
      "packages/renderer-babylon9/test/disposal-leak.test.ts",
      "packages/renderer-babylon9/test/runtime-import-policy.test.ts",
      "packages/renderer-babylon9/test/camera.test.ts",
      "packages/renderer-babylon9/test/grid.test.ts",
      "packages/renderer-babylon9/test/controller.test.ts",
      "packages/renderer-babylon9/test/handle-registry.test.ts",
      "packages/renderer-babylon9/test/picking.test.ts",
      "packages/test-fixtures/package.json",
    ],
    directDevDependencies: rootDependencies,
    packageNames,
    applicationPackageName: "@retrostage/editor-electron",
    applicationDevDependencies: applicationDependencies,
    rendererDependencies,
    rendererDevDependencies,
    ...overrides,
  };
}

describe("RSM-6-ADMIT1 repository policy", () => {
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

  it("rejects unauthorized renderer dependencies, unexpected materials, and wrong workspace protocols", () => {
    expect(
      validateRepositoryBootstrap(
        snapshot({
          rendererDependencies: {
            ...rendererDependencies,
            "@babylonjs/materials": "9.21.2",
          },
        }),
      ),
    ).not.toEqual([]);

    expect(
      validateRepositoryBootstrap(
        snapshot({
          rendererDependencies: {
            ...rendererDependencies,
            "@retrostage/core": "^0.0.0",
          },
        }),
      ),
    ).not.toEqual([]);

    expect(
      validateRepositoryBootstrap(
        snapshot({
          rendererDependencies: {
            ...rendererDependencies,
            "babylonjs-gltf2interface": "9.21.2",
          },
        }),
      ),
    ).not.toEqual([]);
  });

  it("rejects missing renderer package or unexpected product package", () => {
    const missing = { ...packageNames };
    delete missing["packages/renderer-babylon9"];
    expect(validateRepositoryBootstrap(snapshot({ packageNames: missing }))).not.toEqual([]);

    const unexpected = { ...packageNames, "packages/renderer-three": "@retrostage/renderer-three" };
    expect(validateRepositoryBootstrap(snapshot({ packageNames: unexpected }))).not.toEqual([]);
  });

  it("accepts the exact complete I4 renderer path set", () => {
    expect(validateRepositoryBootstrap(snapshot())).toEqual([]);
  });

  it("rejects a missing required I2 path once I2 is active", () => {
    const baseline = snapshot();
    const withoutContextTest = baseline.repositoryPaths.filter(
      (path) => path !== "packages/renderer-babylon9/test/context-loss.test.ts",
    );
    const issues = validateRepositoryBootstrap(snapshot({ repositoryPaths: withoutContextTest }));
    expect(issues.map(({ code }) => code)).toContain("REQUIRED_RENDERER_I2_PATH_MISSING");
  });

  it("rejects a missing required I3 path once I3 is active", () => {
    const baseline = snapshot();
    const withoutGridTest = baseline.repositoryPaths.filter(
      (path) => path !== "packages/renderer-babylon9/test/grid.test.ts",
    );
    const issues = validateRepositoryBootstrap(snapshot({ repositoryPaths: withoutGridTest }));
    expect(issues.map(({ code }) => code)).toContain("REQUIRED_RENDERER_I3_PATH_MISSING");
  });

  it("rejects a missing required I4 path once I4 is active", () => {
    const baseline = snapshot();
    const withoutPickingTest = baseline.repositoryPaths.filter(
      (path) => path !== "packages/renderer-babylon9/test/picking.test.ts",
    );
    const issues = validateRepositoryBootstrap(snapshot({ repositoryPaths: withoutPickingTest }));
    expect(issues.map(({ code }) => code)).toContain("REQUIRED_RENDERER_I4_PATH_MISSING");
  });

  it("rejects unexpected camera/Grid/registry paths and an I5 asset path", () => {
    const baseline = snapshot();
    const issues = validateRepositoryBootstrap(
      snapshot({
        repositoryPaths: [
          ...baseline.repositoryPaths,
          "packages/renderer-babylon9/src/camera/runtime.ts",
          "packages/renderer-babylon9/src/grid/material.ts",
          "packages/renderer-babylon9/src/registry/runtime.ts",
          "packages/renderer-babylon9/src/assets/runtime.ts",
        ],
      }),
    );
    expect(issues.map(({ code }) => code)).toEqual([
      "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION",
      "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION",
      "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION",
      "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION",
    ]);
  });

  it("rejects a later-slice renderer path and a missing required I1 path", () => {
    const baseline = snapshot();
    const withoutHeadless = baseline.repositoryPaths.filter(
      (path) => path !== "packages/renderer-babylon9/src/headless.ts",
    );
    const issues = validateRepositoryBootstrap(
      snapshot({
        repositoryPaths: [...withoutHeadless, "packages/renderer-babylon9/src/assets/runtime.ts"],
      }),
    );
    expect(issues.map(({ code }) => code)).toContain("PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION");
    expect(issues.map(({ code }) => code)).toContain("REQUIRED_RENDERER_FOUNDATION_PATH_MISSING");
  });
});
