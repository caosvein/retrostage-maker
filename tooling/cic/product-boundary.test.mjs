import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const CIC_ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(CIC_ROOT, "..", "..");
const RUNTIME_FILES = Object.freeze([
  "lib/identity.mjs",
  "lib/source-manifest.mjs",
  "lib/source-generation.mjs",
  "verify-source-generation.mjs",
]);
const ALL_CIC_FILES = Object.freeze([
  ...RUNTIME_FILES,
  "source-generation.test.mjs",
  "product-boundary.test.mjs",
]);
const ALLOWED_NODE_IMPORTS = new Set([
  "node:crypto",
  "node:fs/promises",
  "node:os",
  "node:path",
  "node:process",
  "node:url",
]);
const IMPORT_PATTERN =
  /(?:\bimport\s+(?:[^'"]*?\s+from\s+)?|\bexport\s+[^'"]*?\s+from\s+|\bimport\s*\()\s*["']([^"']+)["']/gsu;

function staticSpecifiers(text) {
  return [...text.matchAll(IMPORT_PATTERN)].map((match) => match[1]);
}

async function walkSourceFiles(root) {
  const result = [];
  async function visit(current) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        new Set([".git", ".vite", "dist", "node_modules", "out"]).has(entry.name)
      ) {
        continue;
      }
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) await visit(absolute);
      else if (entry.isFile() && /\.(?:[cm]?[jt]s)$/u.test(entry.name)) result.push(absolute);
    }
  }
  await visit(root);
  return result.sort();
}

describe("CIC-I1 product boundary", () => {
  it("keeps runtime imports within approved Node built-ins and local CIC modules", async () => {
    for (const relativePath of RUNTIME_FILES) {
      const text = await readFile(path.join(CIC_ROOT, relativePath), "utf8");
      for (const specifier of staticSpecifiers(text)) {
        expect(
          ALLOWED_NODE_IMPORTS.has(specifier) || specifier.startsWith("./"),
          `${relativePath} imports ${specifier}`,
        ).toBe(true);
        expect(specifier).not.toMatch(/(?:^|\/)(?:apps|packages)(?:\/|$)/u);
        expect(specifier).not.toBe("node:child_process");
      }
    }
  });

  it("keeps tests on approved built-ins, local modules, and the existing Vitest harness", async () => {
    for (const relativePath of ALL_CIC_FILES.filter((file) => file.endsWith(".test.mjs"))) {
      const text = await readFile(path.join(CIC_ROOT, relativePath), "utf8");
      for (const specifier of staticSpecifiers(text)) {
        expect(
          ALLOWED_NODE_IMPORTS.has(specifier) ||
            specifier.startsWith("./") ||
            specifier === "vitest",
          `${relativePath} imports ${specifier}`,
        ).toBe(true);
        expect(specifier).not.toBe("node:child_process");
      }
    }
  });

  it("finds no product source relative import that resolves into tooling/cic", async () => {
    const productFiles = [
      ...(await walkSourceFiles(path.join(REPOSITORY_ROOT, "apps"))),
      ...(await walkSourceFiles(path.join(REPOSITORY_ROOT, "packages"))),
    ];
    const violations = [];
    for (const productFile of productFiles) {
      const text = await readFile(productFile, "utf8");
      for (const specifier of staticSpecifiers(text).filter((value) => value.startsWith("."))) {
        const resolved = path.resolve(path.dirname(productFile), specifier);
        if (resolved === CIC_ROOT || resolved.startsWith(`${CIC_ROOT}${path.sep}`)) {
          violations.push(`${path.relative(REPOSITORY_ROOT, productFile)} -> ${specifier}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("keeps tooling/cic outside package and workspace product topology", async () => {
    await expect(readFile(path.join(CIC_ROOT, "package.json"), "utf8")).rejects.toMatchObject({
      code: "ENOENT",
    });
    const workspace = await readFile(path.join(REPOSITORY_ROOT, "pnpm-workspace.yaml"), "utf8");
    expect(workspace).not.toMatch(/^\s*-\s*["']?tooling(?:\/\*|\/cic)["']?\s*$/mu);
  });
});
