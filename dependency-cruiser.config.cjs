"use strict";

module.exports = {
  forbidden: [
    {
      name: "no-circular-tooling-dependencies",
      severity: "error",
      from: { path: "^tooling" },
      to: { circular: true },
    },
    {
      name: "tooling-must-not-import-product-packages",
      severity: "error",
      from: { path: "^tooling" },
      to: { path: "^packages" },
    },
    {
      name: "tooling-must-not-import-future-roots",
      severity: "error",
      from: { path: "^tooling" },
      to: { path: "^(tools|scripts|\\.github)(/|$)" },
    },
    {
      name: "no-circular-renderer-dependencies",
      severity: "error",
      from: { path: "^packages/renderer-babylon9" },
      to: { circular: true },
    },
    {
      name: "renderer-default-must-not-reach-editor-or-headless",
      severity: "error",
      from: { path: "^packages/renderer-babylon9/src/index\\.ts$" },
      to: { path: "^packages/renderer-babylon9/src/(?:editor|headless)\\.ts$" },
    },
    {
      name: "renderer-default-editor-and-product-must-not-reach-headless-runtime",
      severity: "error",
      from: {
        path: "^(?:packages/renderer-babylon9/src/(?:index|editor)\\.ts|apps/editor-electron/src)",
      },
      to: { path: "^packages/renderer-babylon9/src/headless(?:\\.ts|/)" },
    },
    {
      name: "renderer-headless-must-not-reach-editor-grid",
      severity: "error",
      from: { path: "^packages/renderer-babylon9/src/headless(?:\\.ts|/)" },
      to: { path: "^packages/renderer-babylon9/src/(?:editor\\.ts|grid/)" },
    },
    {
      name: "renderer-babylon-imports-only-in-exact-private-factories",
      severity: "error",
      from: {
        path: "^packages/renderer-babylon9/src",
        pathNot:
          "^packages/renderer-babylon9/src/(?:engine/babylon-engine-factory|scene/babylon-scene-factory|camera/babylon-camera-factory|grid/babylon-grid-factory|picking/babylon-picking-factory|assets/babylon-asset-container-factory|headless/null-engine-factory|diagnostics/babylon-instrumentation-factory|loaders/gltf2-loader-registration)\\.ts$",
      },
      to: { path: "^@babylonjs/" },
    },
    {
      name: "renderer-private-factories-may-import-only-babylon-core-root",
      severity: "error",
      from: {
        path: "^packages/renderer-babylon9/src/(?:engine/babylon-engine-factory|scene/babylon-scene-factory|camera/babylon-camera-factory|grid/babylon-grid-factory|picking/babylon-picking-factory|assets/babylon-asset-container-factory|headless/null-engine-factory|diagnostics/babylon-instrumentation-factory)\\.ts$",
      },
      to: { path: "^@babylonjs/(?!core$)" },
    },
    {
      name: "renderer-loader-registration-may-import-only-exact-gltf2-subpath",
      severity: "error",
      from: {
        path: "^packages/renderer-babylon9/src/loaders/gltf2-loader-registration\\.ts$",
      },
      to: { path: "^@babylonjs/(?!loaders/glTF/2\\.0$)" },
    },
    {
      name: "renderer-tests-must-not-import-babylon-runtime",
      severity: "error",
      from: { path: "^packages/renderer-babylon9/test" },
      to: { path: "^@babylonjs/" },
    },
    {
      name: "renderer-source-must-remain-browser-safe-and-ui-independent",
      severity: "error",
      from: { path: "^packages/renderer-babylon9/src" },
      to: {
        path: "^(?:electron$|react(?:-dom)?$|@retrostage/editor-ui-react$|node:|fs$|path$|child_process$|better-sqlite3$|sqlite)",
      },
    },
    {
      name: "renderer-must-not-import-electron-or-node",
      severity: "error",
      from: { path: "^apps/editor-electron/src/renderer" },
      to: {
        path: "^(?:electron|node:|fs$|child_process$|apps/editor-electron/src/(?:main|preload))",
      },
    },
    {
      name: "preload-must-not-import-privileged-node-modules",
      severity: "error",
      from: { path: "^apps/editor-electron/src/preload" },
      to: {
        path: "^(?:node:(?:fs|child_process)|fs$|child_process$|apps/editor-electron/src/(?:main|renderer))",
      },
    },
    {
      name: "main-must-not-import-renderer-source",
      severity: "error",
      from: { path: "^apps/editor-electron/src/main" },
      to: { path: "^apps/editor-electron/src/renderer" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    includeOnly: "^(tooling|packages/renderer-babylon9|apps/editor-electron/src)",
  },
};
