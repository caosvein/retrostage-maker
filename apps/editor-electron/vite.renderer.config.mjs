import { resolve } from "node:path";

import { defineConfig } from "vite";

const applicationRoot = import.meta.dirname;

export default defineConfig({
  base: "./",
  build: {
    emptyOutDir: true,
    minify: false,
    outDir: resolve(applicationRoot, ".vite/renderer"),
    rollupOptions: {
      input: resolve(applicationRoot, "src/renderer/index.html"),
    },
    sourcemap: false,
    target: "chrome142",
  },
  root: resolve(applicationRoot, "src/renderer"),
});
