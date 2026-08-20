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
      name: "renderer-source-must-remain-browser-safe-and-ui-independent",
      severity: "error",
      from: { path: "^packages/renderer-babylon9/src" },
      to: {
        path: "^(?:@babylonjs/|electron$|react(?:-dom)?$|node:|fs$|path$|child_process$|better-sqlite3$|sqlite)",
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
