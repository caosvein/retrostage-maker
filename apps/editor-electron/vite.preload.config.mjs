import { resolve } from "node:path";

import { defineConfig } from "vite";

const applicationRoot = import.meta.dirname;

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(applicationRoot, "src/preload/preload.ts"),
      formats: ["cjs"],
      fileName: () => "preload.cjs",
    },
    minify: false,
    outDir: resolve(applicationRoot, ".vite/preload"),
    rollupOptions: {
      external: ["electron"],
    },
    sourcemap: false,
    target: "node22",
  },
});
