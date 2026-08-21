interface BootstrapSnapshot {
  readonly repositoryPaths: readonly string[];
  readonly directDevDependencies: Readonly<Record<string, string>>;
  readonly packageNames: Readonly<Record<string, string>>;
  readonly applicationPackageName: string;
  readonly applicationDevDependencies: Readonly<Record<string, string>>;
  readonly rendererDependencies?: Readonly<Record<string, string>>;
  readonly rendererDevDependencies?: Readonly<Record<string, string>>;
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

const expectedRendererDependencies = new Map<string, string>([
  ["@babylonjs/core", "9.21.2"],
  ["@babylonjs/loaders", "9.21.2"],
  ["@retrostage/core", "workspace:*"],
  ["@retrostage/diagnostics", "workspace:*"],
]);

const expectedRendererDevDependencies = new Map<string, string>([
  ["babylonjs-gltf2interface", "9.21.2"],
]);

const expectedPackageNames = new Map<string, string>([
  ["packages/core", "@retrostage/core"],
  ["packages/diagnostics", "@retrostage/diagnostics"],
  ["packages/renderer-babylon9", "@retrostage/renderer-babylon9"],
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

const expectedRendererFoundationPaths = new Set([
  "packages/renderer-babylon9/package.json",
  "packages/renderer-babylon9/tsconfig.json",
  "packages/renderer-babylon9/src/index.ts",
  "packages/renderer-babylon9/src/editor.ts",
  "packages/renderer-babylon9/src/headless.ts",
  "packages/renderer-babylon9/src/contracts/public.ts",
  "packages/renderer-babylon9/test/type-leak.test.ts",
  "packages/renderer-babylon9/test/entry-isolation.test.ts",
]);

const expectedRendererI2Paths = new Set([
  "packages/renderer-babylon9/src/engine/engine-port.ts",
  "packages/renderer-babylon9/src/engine/babylon-engine-factory.ts",
  "packages/renderer-babylon9/src/engine/renderer-adapter.ts",
  "packages/renderer-babylon9/src/scene/scene-port.ts",
  "packages/renderer-babylon9/src/scene/babylon-scene-factory.ts",
  "packages/renderer-babylon9/src/surface/host-capability.ts",
  "packages/renderer-babylon9/src/surface/resize-controller.ts",
  "packages/renderer-babylon9/src/surface/context-controller.ts",
  "packages/renderer-babylon9/test/lifecycle.test.ts",
  "packages/renderer-babylon9/test/resize-host.test.ts",
  "packages/renderer-babylon9/test/context-loss.test.ts",
  "packages/renderer-babylon9/test/disposal-leak.test.ts",
  "packages/renderer-babylon9/test/runtime-import-policy.test.ts",
]);

const expectedRendererI3Paths = new Set([
  "packages/renderer-babylon9/src/camera/camera-port.ts",
  "packages/renderer-babylon9/src/camera/babylon-camera-factory.ts",
  "packages/renderer-babylon9/src/camera/camera-controller.ts",
  "packages/renderer-babylon9/src/grid/grid-port.ts",
  "packages/renderer-babylon9/src/grid/babylon-grid-factory.ts",
  "packages/renderer-babylon9/src/grid/grid-controller.ts",
  "packages/renderer-babylon9/test/camera.test.ts",
  "packages/renderer-babylon9/test/grid.test.ts",
  "packages/renderer-babylon9/test/controller.test.ts",
]);

const expectedRendererI4Paths = new Set([
  "packages/renderer-babylon9/src/registry/handle-port.ts",
  "packages/renderer-babylon9/src/registry/handle-registry.ts",
  "packages/renderer-babylon9/src/picking/picking-port.ts",
  "packages/renderer-babylon9/src/picking/babylon-picking-factory.ts",
  "packages/renderer-babylon9/src/picking/picking-controller.ts",
  "packages/renderer-babylon9/test/handle-registry.test.ts",
  "packages/renderer-babylon9/test/picking.test.ts",
]);

const expectedRendererI5Paths = new Set([
  "packages/renderer-babylon9/src/assets/asset-port.ts",
  "packages/renderer-babylon9/src/assets/asset-container-controller.ts",
  "packages/renderer-babylon9/src/assets/babylon-asset-container-factory.ts",
  "packages/renderer-babylon9/src/loaders/gltf2-loader-registration.ts",
  "packages/renderer-babylon9/src/loaders/gltf2-source-policy.ts",
  "packages/renderer-babylon9/test/asset-container.test.ts",
  "packages/renderer-babylon9/test/asset-stale-epoch.test.ts",
  "packages/renderer-babylon9/test/gltf-loader-policy.test.ts",
]);

const expectedRendererI6Paths = new Set([
  "packages/renderer-babylon9/src/headless/null-engine-factory.ts",
  "packages/renderer-babylon9/src/headless/headless-renderer-adapter.ts",
  "packages/renderer-babylon9/src/diagnostics/diagnostics-port.ts",
  "packages/renderer-babylon9/src/diagnostics/diagnostics-controller.ts",
  "packages/renderer-babylon9/src/diagnostics/babylon-instrumentation-factory.ts",
  "packages/renderer-babylon9/test/headless.test.ts",
  "packages/renderer-babylon9/test/diagnostics.test.ts",
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
  const normalizedRepositoryPaths = snapshot.repositoryPaths.map(normalizePath);

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
    const isRendererFoundationPath =
      productPackageMatch?.[1] === "packages/renderer-babylon9" &&
      (expectedRendererFoundationPaths.has(path) ||
        expectedRendererI2Paths.has(path) ||
        expectedRendererI3Paths.has(path) ||
        expectedRendererI4Paths.has(path) ||
        expectedRendererI5Paths.has(path) ||
        expectedRendererI6Paths.has(path));
    if (
      productPackageMatch !== null &&
      productPackageMatch[2] !== "package.json" &&
      !isRendererFoundationPath
    ) {
      issues.push({ code: "PRODUCT_PACKAGE_NOT_EMPTY_FOUNDATION", detail: path });
    }
  }

  for (const expectedPath of expectedApplicationPaths) {
    if (!snapshot.repositoryPaths.some((candidate) => normalizePath(candidate) === expectedPath)) {
      issues.push({ code: "REQUIRED_APPLICATION_PATH_MISSING", detail: expectedPath });
    }
  }
  const rendererFoundationIsActive = normalizedRepositoryPaths.some(
    (path) =>
      path.startsWith("packages/renderer-babylon9/") &&
      path !== "packages/renderer-babylon9/package.json",
  );
  if (rendererFoundationIsActive) {
    for (const expectedPath of expectedRendererFoundationPaths) {
      if (!normalizedRepositoryPaths.includes(expectedPath)) {
        issues.push({ code: "REQUIRED_RENDERER_FOUNDATION_PATH_MISSING", detail: expectedPath });
      }
    }
  }
  const rendererI2IsActive = normalizedRepositoryPaths.some((path) =>
    expectedRendererI2Paths.has(path),
  );
  if (rendererI2IsActive) {
    for (const expectedPath of expectedRendererI2Paths) {
      if (!normalizedRepositoryPaths.includes(expectedPath)) {
        issues.push({ code: "REQUIRED_RENDERER_I2_PATH_MISSING", detail: expectedPath });
      }
    }
  }
  const rendererI3IsActive = normalizedRepositoryPaths.some((path) =>
    expectedRendererI3Paths.has(path),
  );
  if (rendererI3IsActive) {
    for (const expectedPath of expectedRendererI3Paths) {
      if (!normalizedRepositoryPaths.includes(expectedPath)) {
        issues.push({ code: "REQUIRED_RENDERER_I3_PATH_MISSING", detail: expectedPath });
      }
    }
  }
  const rendererI4IsActive = normalizedRepositoryPaths.some((path) =>
    expectedRendererI4Paths.has(path),
  );
  if (rendererI4IsActive) {
    for (const expectedPath of expectedRendererI4Paths) {
      if (!normalizedRepositoryPaths.includes(expectedPath)) {
        issues.push({ code: "REQUIRED_RENDERER_I4_PATH_MISSING", detail: expectedPath });
      }
    }
  }
  const rendererI5IsActive = normalizedRepositoryPaths.some((path) =>
    expectedRendererI5Paths.has(path),
  );
  if (rendererI5IsActive) {
    for (const expectedPath of expectedRendererI5Paths) {
      if (!normalizedRepositoryPaths.includes(expectedPath)) {
        issues.push({ code: "REQUIRED_RENDERER_I5_PATH_MISSING", detail: expectedPath });
      }
    }
  }
  const rendererI6IsActive = normalizedRepositoryPaths.some((path) =>
    expectedRendererI6Paths.has(path),
  );
  if (rendererI6IsActive) {
    for (const expectedPath of expectedRendererI6Paths) {
      if (!normalizedRepositoryPaths.includes(expectedPath)) {
        issues.push({ code: "REQUIRED_RENDERER_I6_PATH_MISSING", detail: expectedPath });
      }
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

  if (snapshot.rendererDependencies !== undefined) {
    validateExactDependencies(
      snapshot.rendererDependencies,
      expectedRendererDependencies,
      issues,
      "RENDERER_DIRECT",
    );
  }
  if (snapshot.rendererDevDependencies !== undefined) {
    validateExactDependencies(
      snapshot.rendererDevDependencies,
      expectedRendererDevDependencies,
      issues,
      "RENDERER_DEV",
    );
  }

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
