import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const applicationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(applicationRoot, "..", "..");

function walkFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files.sort((left, right) => left.localeCompare(right, "en"));
}

function boundaryIssues({
  mainText,
  packageJson,
  preloadText,
  rendererEntryText,
  rendererText,
  repositoryPaths,
  viewportText,
}) {
  const issues = [];
  if (
    /(?:import\s+(?:[^;]*?\s+from\s+)?|export\s+[^;]*?\s+from\s+)["'](?:electron|node:[^"']+|fs|path|child_process)["']|require\s*\(|\bprocess\b/u.test(
      rendererText,
    )
  ) {
    issues.push("RENDERER_FORBIDDEN_IMPORT");
  }
  if (
    /ipcRenderer|(?:import\s+(?:[^;]*?\s+from\s+)?|export\s+[^;]*?\s+from\s+)["']node:(?:fs|child_process)["']|\bprocess\b/u.test(
      preloadText,
    )
  ) {
    issues.push("PRELOAD_PRIVILEGED_IMPORT");
  }
  const exactDependencies = {
    "@electron-forge/core": "7.11.2",
    electron: "43.5.0",
    vite: "8.2.1",
  };
  if (JSON.stringify(packageJson.devDependencies) !== JSON.stringify(exactDependencies)) {
    issues.push("APP_DIRECT_DEPENDENCY_DRIFT");
  }
  if (
    JSON.stringify(packageJson.dependencies) !==
    JSON.stringify({ "@retrostage/renderer-babylon9": "workspace:*" })
  ) {
    issues.push("APP_RUNTIME_DEPENDENCY_DRIFT");
  }
  const forbiddenIdentity = /(?:plugin-vite|forge\/cli|maker-|publisher-|react|typebox|ajv)/iu;
  if (Object.keys(packageJson.devDependencies ?? {}).some((name) => forbiddenIdentity.test(name))) {
    issues.push("FORBIDDEN_DIRECT_DEPENDENCY");
  }
  const forbiddenProductPath =
    /^(?:apps\/(?!editor-electron(?:\/|$))|apps\/editor-electron\/(?:project|scene|gameplay|runtime|assets|player|export|steam|marketplace|dlc)(?:\/|$))/u;
  if (repositoryPaths.some((entry) => forbiddenProductPath.test(entry))) {
    issues.push("LATER_PRODUCT_PATH_PRESENT");
  }
  const viewportImports = [
    ...viewportText.matchAll(
      /(?:import\s+(?:[^;]*?\s+from\s+)?|export\s+[^;]*?\s+from\s+)["']([^"']+)["']/gu,
    ),
  ].map((match) => match[1]);
  if (
    viewportImports.some(
      (specifier) =>
        specifier !== "@retrostage/renderer-babylon9" &&
        specifier !== "@retrostage/renderer-babylon9/editor",
    )
  ) {
    issues.push("VIEWPORT_NONPUBLIC_IMPORT");
  }
  if (
    !viewportImports.includes("@retrostage/renderer-babylon9") ||
    !viewportImports.includes("@retrostage/renderer-babylon9/editor")
  ) {
    issues.push("VIEWPORT_PUBLIC_IMPORT_MISSING");
  }
  if (
    /@babylonjs\/|@retrostage\/renderer-babylon9\/headless|packages\/renderer-babylon9\/src|\.getContext\s*\(/u.test(
      viewportText,
    )
  ) {
    issues.push("VIEWPORT_FORBIDDEN_RENDERER_EDGE");
  }
  if (
    /@retrostage\/renderer-babylon9/u.test(mainText) ||
    /@retrostage\/renderer-babylon9/u.test(preloadText)
  ) {
    issues.push("PRIVILEGED_RENDERER_OWNERSHIP");
  }
  const entryImports = [
    ...rendererEntryText.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/gu),
  ].map((match) => match[1]);
  if (
    entryImports.length !== 1 ||
    entryImports[0] !== "./viewport-view.js" ||
    /@retrostage\/renderer-babylon9|@babylonjs\//u.test(rendererEntryText)
  ) {
    issues.push("RENDERER_ENTRY_OWNERSHIP_DRIFT");
  }
  return issues;
}

function physicalSnapshot() {
  const rendererFiles = walkFiles(path.join(applicationRoot, "src", "renderer"));
  const preloadFiles = [
    ...walkFiles(path.join(applicationRoot, "src", "preload")),
    ...walkFiles(path.join(applicationRoot, ".vite", "preload")),
  ];
  const repositoryPaths = walkFiles(repositoryRoot).map((entry) =>
    path.relative(repositoryRoot, entry).replaceAll("\\", "/"),
  );
  return {
    rendererText: rendererFiles.map((entry) => readFileSync(entry, "utf8")).join("\n"),
    rendererEntryText: readFileSync(
      path.join(applicationRoot, "src", "renderer", "renderer.ts"),
      "utf8",
    ),
    viewportText: readFileSync(
      path.join(applicationRoot, "src", "renderer", "viewport-view.ts"),
      "utf8",
    ),
    mainText: readFileSync(path.join(applicationRoot, "src", "main", "main.ts"), "utf8"),
    preloadText: preloadFiles.map((entry) => readFileSync(entry, "utf8")).join("\n"),
    packageJson: JSON.parse(readFileSync(path.join(applicationRoot, "package.json"), "utf8")),
    repositoryPaths,
  };
}

describe("RSM-6-I8 Electron viewport import and product boundary", () => {
  it("accepts the physical browser-only Renderer and non-privileged Preload", () => {
    expect(boundaryIssues(physicalSnapshot())).toEqual([]);
  });

  it("rejects Renderer Electron/Node edges and Preload privilege", () => {
    const baseline = physicalSnapshot();
    expect(boundaryIssues({ ...baseline, rendererText: 'import "electron";' })).toContain(
      "RENDERER_FORBIDDEN_IMPORT",
    );
    expect(boundaryIssues({ ...baseline, preloadText: 'import "node:fs";' })).toContain(
      "PRELOAD_PRIVILEGED_IMPORT",
    );
  });

  it("rejects headless/private/Babylon viewport edges and privileged renderer ownership", () => {
    const baseline = physicalSnapshot();
    for (const injection of [
      '\nimport "@babylonjs/core";\n',
      '\nimport "@retrostage/renderer-babylon9/headless";\n',
      '\nimport "../../../../packages/renderer-babylon9/src/engine/renderer-adapter";\n',
      "\ncanvas.getContext('webgl');\n",
    ]) {
      expect(
        boundaryIssues({ ...baseline, viewportText: baseline.viewportText + injection }),
      ).toContain("VIEWPORT_FORBIDDEN_RENDERER_EDGE");
    }
    expect(
      boundaryIssues({
        ...baseline,
        mainText: `${baseline.mainText}\nimport "@retrostage/renderer-babylon9";`,
      }),
    ).toContain("PRIVILEGED_RENDERER_OWNERSHIP");
  });

  it("rejects dependency drift, plugin-vite, prerelease and Vite downgrade", () => {
    const baseline = physicalSnapshot();
    for (const devDependencies of [
      { ...baseline.packageJson.devDependencies, react: "19.0.0" },
      { ...baseline.packageJson.devDependencies, "@electron-forge/plugin-vite": "7.11.2" },
      { ...baseline.packageJson.devDependencies, "@electron-forge/core": "8.0.0-alpha.10" },
      { ...baseline.packageJson.devDependencies, vite: "7.3.6" },
    ]) {
      expect(
        boundaryIssues({
          ...baseline,
          packageJson: { ...baseline.packageJson, devDependencies },
        }),
      ).not.toEqual([]);
    }
    expect(
      boundaryIssues({
        ...baseline,
        packageJson: { ...baseline.packageJson, dependencies: { react: "19.0.0" } },
      }),
    ).toContain("APP_RUNTIME_DEPENDENCY_DRIFT");
  });

  it("rejects later-product paths", () => {
    const baseline = physicalSnapshot();
    expect(
      boundaryIssues({ ...baseline, repositoryPaths: ["apps/editor-electron/scene/model.ts"] }),
    ).toContain("LATER_PRODUCT_PATH_PRESENT");
  });
});
