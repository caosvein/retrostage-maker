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

const publicEntries = ["index.ts", "editor.ts", "headless.ts"] as const;
const exportSpecifierPattern = /export\s+(?:type\s+)?[^;]*?from\s+["']([^"']+)["']/gu;
const babylonSpecifierPattern = /(?:from\s+|import\s*\()\s*["'](@babylonjs\/[^"']+)["']/gu;
const forbiddenTypePattern =
  /\b(?:Engine|WebGPUEngine|Scene|Mesh|AbstractMesh|TransformNode|Ray|AssetContainer|Texture|SceneLoader|PickingInfo|UtilityLayerRenderer|GizmoManager|NullEngine|SceneInstrumentation|ArcRotateCamera|FreeCamera|UniversalCamera|Vector3|Matrix|LinesMesh|Color3|Color4)\b/u;
const forbiddenDomTypePattern =
  /\b(?:HTMLCanvasElement|OffscreenCanvas|CanvasRenderingContext2D|WebGLRenderingContext|WebGL2RenderingContext)\b/u;

function resolveLocalModule(from: string, specifier: string): string | null {
  if (!specifier.startsWith(".")) return null;
  const segments = [...from.split("/").slice(0, -1), ...specifier.split("/")];
  const normalized: string[] = [];
  for (const segment of segments) {
    if (segment === "." || segment === "") continue;
    if (segment === "..") normalized.pop();
    else normalized.push(segment);
  }
  return normalized.join("/").replace(/\.js$/u, ".ts");
}

function findBalancedBrace(source: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    if (character === "{") depth += 1;
    if (character === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return source.length - 1;
}

function exportedDeclarationSurface(source: string): string {
  const declarations: string[] = [];
  const exportPattern = /\bexport\s+(?=(?:type|interface|class|function|const|let|var|\{))/gu;
  for (const match of source.matchAll(exportPattern)) {
    const start = match.index;
    const remainder = source.slice(start);
    const braceOffset = remainder.indexOf("{");
    const semicolonOffset = remainder.indexOf(";");
    if (braceOffset >= 0 && (semicolonOffset < 0 || braceOffset < semicolonOffset)) {
      if (/^export\s+function\b/u.test(remainder)) {
        declarations.push(remainder.slice(0, braceOffset));
      } else {
        const end = findBalancedBrace(source, start + braceOffset);
        declarations.push(source.slice(start, end + 1));
      }
      continue;
    }
    declarations.push(
      remainder.slice(0, semicolonOffset < 0 ? remainder.length : semicolonOffset + 1),
    );
  }
  return declarations.join("\n");
}

function scanPublicDeclarationGraph(
  modules: ReadonlyMap<string, string>,
  entries: readonly string[],
): readonly string[] {
  const issues: string[] = [];
  const pending = [...entries];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const modulePath = pending.pop();
    if (modulePath === undefined || visited.has(modulePath)) continue;
    visited.add(modulePath);
    const source = modules.get(modulePath);
    if (source === undefined) {
      issues.push(`UNRESOLVED_PUBLIC_MODULE:${modulePath}`);
      continue;
    }
    const declarations = exportedDeclarationSurface(source);
    if (declarations.includes("@babylonjs/") || forbiddenTypePattern.test(declarations)) {
      issues.push(`BABYLON_PUBLIC_TYPE_LEAK:${modulePath}`);
    }
    if (forbiddenDomTypePattern.test(declarations)) {
      issues.push(`DOM_PUBLIC_TYPE_LEAK:${modulePath}`);
    }
    babylonSpecifierPattern.lastIndex = 0;
    for (const match of declarations.matchAll(babylonSpecifierPattern)) {
      const specifier = match[1];
      if (specifier !== undefined) {
        issues.push(`BABYLON_PUBLIC_SPECIFIER:${modulePath}:${specifier}`);
      }
    }
    exportSpecifierPattern.lastIndex = 0;
    for (const match of source.matchAll(exportSpecifierPattern)) {
      const specifier = match[1];
      if (specifier === undefined) continue;
      const local = resolveLocalModule(modulePath, specifier);
      if (local !== null) pending.push(local);
    }
  }

  return issues;
}

function physicalPublicModules(): ReadonlyMap<string, string> {
  const rawModules = (import.meta as unknown as ImportMetaWithGlob).glob<string>("../src/**/*.ts", {
    eager: true,
    import: "default",
    query: "?raw",
  });
  return new Map(
    Object.entries(rawModules).map(([path, source]) => [path.replace(/^\.\.\/src\//u, ""), source]),
  );
}

describe("RSM-6-I5 public type isolation", () => {
  it("accepts all three physical public entry declaration graphs", () => {
    expect(scanPublicDeclarationGraph(physicalPublicModules(), publicEntries)).toEqual([]);
  });

  it("rejects a synthetic in-memory Babylon type in a public signature", () => {
    const synthetic = new Map([
      ["index.ts", 'export interface Leak { readonly scene: import("@babylonjs/core").Scene; }'],
    ]);
    expect(scanPublicDeclarationGraph(synthetic, ["index.ts"])).toEqual([
      "BABYLON_PUBLIC_TYPE_LEAK:index.ts",
      "BABYLON_PUBLIC_SPECIFIER:index.ts:@babylonjs/core",
    ]);
  });

  it("rejects a synthetic DOM implementation type in a public signature", () => {
    const synthetic = new Map([
      ["index.ts", "export interface Leak { readonly canvas: HTMLCanvasElement; }"],
    ]);
    expect(scanPublicDeclarationGraph(synthetic, ["index.ts"])).toEqual([
      "DOM_PUBLIC_TYPE_LEAK:index.ts",
    ]);
  });

  it("rejects synthetic Babylon Camera, vector, matrix, line, and color types", () => {
    for (const name of ["ArcRotateCamera", "Vector3", "Matrix", "LinesMesh", "Color3"]) {
      expect(
        scanPublicDeclarationGraph(
          new Map([["index.ts", `export interface Leak { readonly value: ${name}; }`]]),
          ["index.ts"],
        ),
      ).toEqual(["BABYLON_PUBLIC_TYPE_LEAK:index.ts"]);
    }
  });

  it("rejects every I4 Babylon picking implementation type", () => {
    for (const name of ["PickingInfo", "AbstractMesh", "TransformNode", "Ray"]) {
      expect(
        scanPublicDeclarationGraph(
          new Map([["index.ts", `export interface Leak { readonly nativePickValue: ${name}; }`]]),
          ["index.ts"],
        ),
      ).toEqual(["BABYLON_PUBLIC_TYPE_LEAK:index.ts"]);
    }
  });

  it("rejects every I5 Babylon asset and loader implementation type", () => {
    for (const name of [
      "AssetContainer",
      "AbstractMesh",
      "TransformNode",
      "Texture",
      "SceneLoader",
    ]) {
      expect(
        scanPublicDeclarationGraph(
          new Map([["index.ts", `export interface Leak { readonly nativeAssetValue: ${name}; }`]]),
          ["index.ts"],
        ),
      ).toEqual(["BABYLON_PUBLIC_TYPE_LEAK:index.ts"]);
    }
  });

  it("exposes only the approved Uint8Array source seam and no URL, path, File, or loader owner", () => {
    const contracts = physicalPublicModules().get("contracts/public.ts") ?? "";
    expect(contracts.includes("readonly bytes: Uint8Array")).toEqual(true);
    for (const forbidden of [
      "readonly url:",
      "readonly path:",
      "readonly file: File",
      "registerLoader",
      "AssetContainerPort",
    ]) {
      expect(contracts.includes(forbidden)).toEqual(false);
    }
  });

  it("keeps private registry, picking ports, and native-handle bridges out of entry sources", () => {
    const modules = physicalPublicModules();
    for (const entry of publicEntries) {
      const source = modules.get(entry) ?? "";
      for (const forbidden of [
        "RendererHandleRegistry",
        "RendererHandleRegistryBridge",
        "RendererPickingFactory",
        "RendererRawPickObservation",
        "registerHandle",
        "unregisterHandle",
        "nativeHandle",
      ]) {
        expect(source.includes(forbidden)).toEqual(false);
      }
    }
  });

  it("accepts a private Babylon implementation import behind an explicit public seam", () => {
    const synthetic = new Map([
      ["index.ts", 'export { createAdapter } from "./adapter.js";'],
      [
        "adapter.ts",
        'import { createEngine } from "./private-factory.js";\nexport function createAdapter(): { readonly ready: boolean } { return { ready: Boolean(createEngine) }; }',
      ],
      ["private-factory.ts", 'import { Engine } from "@babylonjs/core";'],
    ]);
    expect(scanPublicDeclarationGraph(synthetic, ["index.ts"])).toEqual([]);
  });
});
