export {};

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => void) => void;
declare const expect: (actual: unknown) => {
  toEqual(expected: unknown): void;
};

interface ImportMetaWithGlob {
  glob<T>(
    pattern: string,
    options: { readonly eager: true; readonly import: "default"; readonly query: "?raw" },
  ): Readonly<Record<string, T>>;
}

const allowedBabylonFactories = new Set([
  "camera/babylon-camera-factory.ts",
  "engine/babylon-engine-factory.ts",
  "grid/babylon-grid-factory.ts",
  "picking/babylon-picking-factory.ts",
  "scene/babylon-scene-factory.ts",
]);
const exactBabylonBindings = new Map<string, readonly string[]>([
  ["camera/babylon-camera-factory.ts", ["ArcRotateCamera", "Vector3"]],
  ["engine/babylon-engine-factory.ts", ["Engine"]],
  ["grid/babylon-grid-factory.ts", ["Color3", "MeshBuilder", "Vector3"]],
  ["picking/babylon-picking-factory.ts", ["PickingInfo"]],
  ["scene/babylon-scene-factory.ts", ["Scene"]],
]);
const importPattern =
  /(?:import|export)\s+(?:type\s+)?[^;]*?from\s+["']([^"']+)["']|import\s*["']([^"']+)["']/gu;
const forbiddenRuntimePattern =
  /^(?:electron$|react(?:-dom)?$|@retrostage\/editor-ui-react$|node:|fs$|path$|child_process$|better-sqlite3$|sqlite)/u;

function scanRuntimeImports(modules: ReadonlyMap<string, string>): readonly string[] {
  const issues: string[] = [];
  for (const [path, source] of modules) {
    importPattern.lastIndex = 0;
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1] ?? match[2];
      if (specifier === undefined) continue;
      if (specifier.startsWith("@babylonjs/")) {
        if (!allowedBabylonFactories.has(path)) {
          issues.push(`BABYLON_IMPORT_OUTSIDE_FACTORY:${path}:${specifier}`);
        } else if (specifier !== "@babylonjs/core") {
          issues.push(`BABYLON_FACTORY_SPECIFIER_FORBIDDEN:${path}:${specifier}`);
        } else {
          const namedImport =
            /import\s+(?:type\s+)?\{([^}]+)\}\s*from\s*["']@babylonjs\/core["']/u.exec(match[0]);
          const observed =
            namedImport?.[1]
              ?.split(",")
              .map((binding) => binding.trim())
              .filter(Boolean)
              .sort() ?? [];
          const expected = [...(exactBabylonBindings.get(path) ?? [])].sort();
          if (JSON.stringify(observed) !== JSON.stringify(expected)) {
            issues.push(`BABYLON_FACTORY_BINDINGS_INEXACT:${path}:${observed.join(",")}`);
          }
        }
      }
      if (forbiddenRuntimePattern.test(specifier)) {
        issues.push(`FORBIDDEN_RENDERER_RUNTIME_IMPORT:${path}:${specifier}`);
      }
    }
  }
  return issues;
}

function physicalRuntimeModules(): ReadonlyMap<string, string> {
  const rawModules = (import.meta as unknown as ImportMetaWithGlob).glob<string>("../src/**/*.ts", {
    eager: true,
    import: "default",
    query: "?raw",
  });
  return new Map(
    Object.entries(rawModules).map(([path, source]) => [path.replace(/^\.\.\/src\//u, ""), source]),
  );
}

describe("RSM-6-I4 runtime import policy", () => {
  it("accepts the physical exact five-factory Babylon core import surface", () => {
    expect(scanRuntimeImports(physicalRuntimeModules())).toEqual([]);
  });

  it("rejects Babylon outside factories, deep imports, loaders, and materials", () => {
    const synthetic = new Map([
      ["engine/renderer-adapter.ts", 'import { Engine } from "@babylonjs/core";'],
      ["engine/babylon-engine-factory.ts", 'import { Engine } from "@babylonjs/core/Engines";'],
      ["scene/babylon-scene-factory.ts", 'import "@babylonjs/loaders";'],
      ["scene/babylon-scene-factory.ts#materials", 'import "@babylonjs/materials";'],
      ["camera/babylon-camera-factory.ts", 'import { FreeCamera } from "@babylonjs/core";'],
      ["picking/picking-controller.ts", 'import type { PickingInfo } from "@babylonjs/core";'],
    ]);
    expect(scanRuntimeImports(synthetic)).toEqual([
      "BABYLON_IMPORT_OUTSIDE_FACTORY:engine/renderer-adapter.ts:@babylonjs/core",
      "BABYLON_FACTORY_SPECIFIER_FORBIDDEN:engine/babylon-engine-factory.ts:@babylonjs/core/Engines",
      "BABYLON_FACTORY_SPECIFIER_FORBIDDEN:scene/babylon-scene-factory.ts:@babylonjs/loaders",
      "BABYLON_IMPORT_OUTSIDE_FACTORY:scene/babylon-scene-factory.ts#materials:@babylonjs/materials",
      "BABYLON_FACTORY_BINDINGS_INEXACT:camera/babylon-camera-factory.ts:FreeCamera",
      "BABYLON_IMPORT_OUTSIDE_FACTORY:picking/picking-controller.ts:@babylonjs/core",
    ]);
  });

  it("rejects Electron, React, Node, filesystem, child-process, and SQLite imports", () => {
    const synthetic = new Map([
      [
        "engine/runtime.ts",
        [
          'import "electron";',
          'import "react";',
          'import "node:fs";',
          'import "path";',
          'import "child_process";',
          'import "better-sqlite3";',
        ].join("\n"),
      ],
    ]);
    expect(scanRuntimeImports(synthetic)).toEqual([
      "FORBIDDEN_RENDERER_RUNTIME_IMPORT:engine/runtime.ts:electron",
      "FORBIDDEN_RENDERER_RUNTIME_IMPORT:engine/runtime.ts:react",
      "FORBIDDEN_RENDERER_RUNTIME_IMPORT:engine/runtime.ts:node:fs",
      "FORBIDDEN_RENDERER_RUNTIME_IMPORT:engine/runtime.ts:path",
      "FORBIDDEN_RENDERER_RUNTIME_IMPORT:engine/runtime.ts:child_process",
      "FORBIDDEN_RENDERER_RUNTIME_IMPORT:engine/runtime.ts:better-sqlite3",
    ]);
  });
});
