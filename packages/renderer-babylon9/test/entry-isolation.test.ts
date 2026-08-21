export {};

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => void) => void;
declare const expect: (actual: unknown) => {
  readonly not: { toContain(expected: string): void };
  toBe(expected: unknown): void;
  toContain(expected: string): void;
  toEqual(expected: unknown): void;
};

interface ImportMetaWithGlob {
  glob<T>(
    pattern: string,
    options: { readonly eager: true; readonly import: "default"; readonly query: "?raw" },
  ): Readonly<Record<string, T>>;
}

const moduleSpecifierPattern =
  /(?:import|export)\s+(?:type\s+)?[^;]*?from\s+["']([^"']+)["']|import\s*["']([^"']+)["']/gu;

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

function scanForbiddenReachability(
  modules: ReadonlyMap<string, string>,
  entry: string,
  forbidden: ReadonlySet<string>,
): readonly string[] {
  const issues: string[] = [];
  const pending = [entry];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const modulePath = pending.pop();
    if (modulePath === undefined || visited.has(modulePath)) continue;
    visited.add(modulePath);
    if (forbidden.has(modulePath)) issues.push(`FORBIDDEN_ENTRY_REACHABLE:${entry}:${modulePath}`);
    const source = modules.get(modulePath);
    if (source === undefined) {
      issues.push(`UNRESOLVED_ENTRY_MODULE:${modulePath}`);
      continue;
    }
    moduleSpecifierPattern.lastIndex = 0;
    for (const match of source.matchAll(moduleSpecifierPattern)) {
      const specifier = match[1] ?? match[2];
      if (specifier === undefined) continue;
      const local = resolveLocalModule(modulePath, specifier);
      if (local !== null) pending.push(local);
    }
  }

  return issues;
}

function physicalModules(): ReadonlyMap<string, string> {
  const rawModules = (import.meta as unknown as ImportMetaWithGlob).glob<string>("../src/**/*.ts", {
    eager: true,
    import: "default",
    query: "?raw",
  });
  return new Map(
    Object.entries(rawModules).map(([path, source]) => [path.replace(/^\.\.\/src\//u, ""), source]),
  );
}

const editorGridModules = new Set([
  "editor.ts",
  "grid/babylon-grid-factory.ts",
  "grid/grid-controller.ts",
  "grid/grid-port.ts",
]);

const editorGizmoModules = new Set([
  "gizmos/babylon-gizmo-factory.ts",
  "gizmos/gizmo-controller.ts",
  "gizmos/gizmo-port.ts",
]);

const privateI4Modules = new Set([
  "picking/babylon-picking-factory.ts",
  "picking/picking-controller.ts",
  "picking/picking-port.ts",
  "registry/handle-port.ts",
  "registry/handle-registry.ts",
]);

const privateI5Modules = new Set([
  "assets/asset-port.ts",
  "assets/asset-container-controller.ts",
  "assets/babylon-asset-container-factory.ts",
  "loaders/gltf2-loader-registration.ts",
  "loaders/gltf2-source-policy.ts",
]);

const privateI6DiagnosticsModules = new Set([
  "diagnostics/babylon-instrumentation-factory.ts",
  "diagnostics/diagnostics-controller.ts",
  "diagnostics/diagnostics-port.ts",
]);

const privateI6HeadlessModules = new Set([
  "headless/headless-renderer-adapter.ts",
  "headless/null-engine-factory.ts",
]);

describe("RSM-6-I7 public entry isolation", () => {
  it("keeps the physical default/player graph isolated from editor, headless, and Grid", () => {
    expect(
      scanForbiddenReachability(
        physicalModules(),
        "index.ts",
        new Set([
          ...editorGridModules,
          ...editorGizmoModules,
          "headless.ts",
          ...privateI6HeadlessModules,
        ]),
      ),
    ).toEqual([]);
  });

  it("keeps default/headless out of Gizmos while editor intentionally reaches them", () => {
    const modules = physicalModules();
    expect(scanForbiddenReachability(modules, "index.ts", editorGizmoModules)).toEqual([]);
    expect(scanForbiddenReachability(modules, "headless.ts", editorGizmoModules)).toEqual([]);
    const editorReachability = scanForbiddenReachability(modules, "editor.ts", editorGizmoModules);
    for (const modulePath of editorGizmoModules) {
      expect(editorReachability).toContain(`FORBIDDEN_ENTRY_REACHABLE:editor.ts:${modulePath}`);
    }
    const editorSource = modules.get("editor.ts") ?? "";
    expect(editorSource).not.toContain("nativeHandle");
    expect(editorSource).not.toContain("GizmoManager");
    expect(editorSource).not.toContain("UtilityLayerRenderer");
  });

  it("keeps headless isolated from editor Grid while editor intentionally reaches it", () => {
    const modules = physicalModules();
    expect(scanForbiddenReachability(modules, "headless.ts", editorGridModules)).toEqual([]);
    expect(
      scanForbiddenReachability(
        modules,
        "editor.ts",
        new Set(["grid/grid-controller.ts", "grid/babylon-grid-factory.ts"]),
      ),
    ).toEqual([
      "FORBIDDEN_ENTRY_REACHABLE:editor.ts:grid/grid-controller.ts",
      "FORBIDDEN_ENTRY_REACHABLE:editor.ts:grid/babylon-grid-factory.ts",
    ]);
  });

  it("allows root reachability while editor/headless have no direct private I4 edge", () => {
    const modules = physicalModules();
    const rootReachability = scanForbiddenReachability(modules, "index.ts", privateI4Modules);
    for (const modulePath of privateI4Modules) {
      expect(rootReachability).toContain(`FORBIDDEN_ENTRY_REACHABLE:index.ts:${modulePath}`);
    }
    for (const entry of ["editor.ts", "headless.ts"]) {
      const source = modules.get(entry) ?? "";
      expect(source).not.toContain("./picking/");
      expect(source).not.toContain("./registry/");
      expect(source).not.toContain("registerHandle");
      expect(source).not.toContain("unregisterHandle");
      expect(source).not.toContain("nativeHandle");
    }
  });

  it("allows root and headless I5 reachability only through the private adapter composition", () => {
    const modules = physicalModules();
    const rootReachability = scanForbiddenReachability(modules, "index.ts", privateI5Modules);
    for (const modulePath of privateI5Modules) {
      expect(rootReachability).toContain(`FORBIDDEN_ENTRY_REACHABLE:index.ts:${modulePath}`);
    }
    const headlessReachability = scanForbiddenReachability(
      modules,
      "headless.ts",
      privateI5Modules,
    );
    for (const modulePath of privateI5Modules) {
      expect(headlessReachability).toContain("FORBIDDEN_ENTRY_REACHABLE:headless.ts:" + modulePath);
    }
    for (const entry of ["editor.ts", "headless.ts"]) {
      const source = modules.get(entry) ?? "";
      expect(source).not.toContain("./assets/");
      expect(source).not.toContain("./loaders/");
      expect(source).not.toContain("gltf2-loader-registration");
      expect(source).not.toContain("registerLoader");
    }
  });

  it("allows diagnostics only through reviewed adapter composition and keeps editor out of headless", () => {
    const modules = physicalModules();
    for (const entry of ["index.ts", "headless.ts"]) {
      const reachability = scanForbiddenReachability(modules, entry, privateI6DiagnosticsModules);
      for (const modulePath of privateI6DiagnosticsModules) {
        expect(reachability).toContain("FORBIDDEN_ENTRY_REACHABLE:" + entry + ":" + modulePath);
      }
    }
    const editorDiagnostics = scanForbiddenReachability(
      modules,
      "editor.ts",
      privateI6DiagnosticsModules,
    );
    for (const modulePath of privateI6DiagnosticsModules) {
      expect(editorDiagnostics).toContain("FORBIDDEN_ENTRY_REACHABLE:editor.ts:" + modulePath);
    }
    expect(scanForbiddenReachability(modules, "editor.ts", privateI6HeadlessModules)).toEqual([]);
    const editorSource = modules.get("editor.ts") ?? "";
    expect(editorSource).not.toContain("./diagnostics/");
    expect(editorSource).not.toContain("./headless/");
  });

  it("keeps the headless entry free of direct loader-registration and asset imports", () => {
    const modules = physicalModules();
    for (const path of ["headless.ts", "headless/headless-renderer-adapter.ts"]) {
      const source = modules.get(path) ?? "";
      expect(source).not.toContain("./assets/");
      expect(source).not.toContain("./loaders/");
      expect(source).not.toContain("gltf2-loader-registration");
      expect(source).not.toContain("@babylonjs/loaders");
    }
  });

  it("rejects synthetic consumer-driven glTF loader registration", () => {
    const synthetic = new Map([
      ["headless.ts", 'import "./loaders/gltf2-loader-registration.js";'],
      ["loaders/gltf2-loader-registration.ts", 'import "@babylonjs/loaders/glTF/2.0";'],
    ]);
    expect(scanForbiddenReachability(synthetic, "headless.ts", privateI5Modules)).toEqual([
      "FORBIDDEN_ENTRY_REACHABLE:headless.ts:loaders/gltf2-loader-registration.ts",
    ]);
  });

  it("publishes only the three intentional package entry surfaces", () => {
    const manifests = (import.meta as unknown as ImportMetaWithGlob).glob<string>(
      "../package.json",
      {
        eager: true,
        import: "default",
        query: "?raw",
      },
    );
    const manifest = manifests["../package.json"] ?? "";
    expect(manifest).toContain('".": "./src/index.ts"');
    expect(manifest).toContain('"./editor": "./src/editor.ts"');
    expect(manifest).toContain('"./headless": "./src/headless.ts"');
    expect(/"\.\/src\/[^"\n]+"\s*:/u.test(manifest)).toBe(false);
    expect(manifest).not.toContain('"./*"');
  });

  it("rejects a synthetic in-memory default-to-editor edge", () => {
    const synthetic = new Map([
      ["index.ts", 'export type { EditorContract } from "./editor.js";'],
      ["editor.ts", "export interface EditorContract {}"],
    ]);
    expect(scanForbiddenReachability(synthetic, "index.ts", new Set(["editor.ts"]))).toEqual([
      "FORBIDDEN_ENTRY_REACHABLE:index.ts:editor.ts",
    ]);
  });

  it("rejects synthetic editor/headless edges to private picking runtime", () => {
    const synthetic = new Map([
      ["editor.ts", 'export { pick } from "./picking/picking-controller.js";'],
      ["headless.ts", 'export { pick } from "./picking/picking-controller.js";'],
      ["picking/picking-controller.ts", "export const pick = true;"],
    ]);
    expect(scanForbiddenReachability(synthetic, "editor.ts", privateI4Modules)).toEqual([
      "FORBIDDEN_ENTRY_REACHABLE:editor.ts:picking/picking-controller.ts",
    ]);
    expect(scanForbiddenReachability(synthetic, "headless.ts", privateI4Modules)).toEqual([
      "FORBIDDEN_ENTRY_REACHABLE:headless.ts:picking/picking-controller.ts",
    ]);
  });

  it("rejects synthetic default/headless reachability to private Gizmo runtime", () => {
    const synthetic = new Map([
      ["index.ts", 'export { gizmo } from "./gizmos/gizmo-controller.js";'],
      ["headless.ts", 'export { gizmo } from "./gizmos/gizmo-controller.js";'],
      ["gizmos/gizmo-controller.ts", "export const gizmo = true;"],
    ]);
    expect(scanForbiddenReachability(synthetic, "index.ts", editorGizmoModules)).toEqual([
      "FORBIDDEN_ENTRY_REACHABLE:index.ts:gizmos/gizmo-controller.ts",
    ]);
    expect(scanForbiddenReachability(synthetic, "headless.ts", editorGizmoModules)).toEqual([
      "FORBIDDEN_ENTRY_REACHABLE:headless.ts:gizmos/gizmo-controller.ts",
    ]);
  });
});
