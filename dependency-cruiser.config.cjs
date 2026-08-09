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
      to: { path: "^(apps|tools|scripts|\\.github)(/|$)" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    includeOnly: "^tooling",
  },
};
