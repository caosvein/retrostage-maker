import { resolve } from "node:path";

import { defineConfig } from "vite";

const applicationRoot = import.meta.dirname;

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(applicationRoot, "src/main/main.ts"),
      formats: ["cjs"],
      fileName: () => "main.cjs",
    },
    minify: false,
    outDir: resolve(applicationRoot, ".vite/main"),
    rollupOptions: {
      external: (identity) => identity === "electron" || identity.startsWith("node:"),
    },
    sourcemap: false,
    target: "node22",
  },
});
