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

const moduleSpecifierPattern = /(?:import|export)\s+(?:type\s+)?[^;]*?from\s+["']([^"']+)["']/gu;

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
      const specifier = match[1];
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

describe("RSM-6-I1 public entry isolation", () => {
  it("keeps the physical default/player graph isolated from editor and headless entries", () => {
    expect(
      scanForbiddenReachability(
        physicalModules(),
        "index.ts",
        new Set(["editor.ts", "headless.ts"]),
      ),
    ).toEqual([]);
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
});
