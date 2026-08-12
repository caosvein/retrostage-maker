import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const applicationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => readFileSync(path.join(applicationRoot, relativePath), "utf8");
const productionCsp =
  "default-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; worker-src 'none'";

function securityIssues(snapshot) {
  const issues = [];
  const requiredMainFragments = [
    "nodeIntegration: false",
    "contextIsolation: true",
    "sandbox: true",
    "webSecurity: true",
    "allowRunningInsecureContent: false",
    "experimentalFeatures: false",
    "navigateOnDragDrop: false",
    "webviewTag: false",
    'window.webContents.on("will-navigate"',
    "event.preventDefault()",
    "window.webContents.setWindowOpenHandler",
    'return { action: "deny" }',
    'app.on("activate"',
    'app.on("window-all-closed"',
    'process.platform !== "darwin"',
  ];
  for (const fragment of requiredMainFragments) {
    if (!snapshot.main.includes(fragment)) issues.push(`MAIN_FRAGMENT_MISSING:${fragment}`);
  }
  if ((snapshot.main.match(/new BrowserWindow\(/gu) ?? []).length !== 1) {
    issues.push("MAIN_WINDOW_OWNER_COUNT");
  }
  if (!snapshot.preload.includes('contextBridge.exposeInMainWorld("retrostageShell", shell)')) {
    issues.push("PRELOAD_BRIDGE_MISSING");
  }
  if ((snapshot.preload.match(/Object\.freeze\(/gu) ?? []).length !== 2) {
    issues.push("PRELOAD_DEEP_FREEZE_MISSING");
  }
  if (
    /ipcRenderer|\b(?:send|invoke)\s*\(|node:(?:fs|child_process)|\bprocess\b|\bdialog\b|\b(?:shell|ipcRenderer)\s*[,}]/gu.test(
      snapshot.preload,
    )
  ) {
    issues.push("PRELOAD_PRIVILEGED_SURFACE");
  }
  if (!snapshot.html.includes(`content="${productionCsp}"`)) issues.push("PRODUCTION_CSP_MISMATCH");
  if (/unsafe-eval|https?:\/\/|\*\s*;/gu.test(snapshot.html)) issues.push("PRODUCTION_CSP_UNSAFE");
  return issues;
}

function physicalSnapshot() {
  return {
    main: read("src/main/main.ts"),
    preload: read("src/preload/preload.ts"),
    html: read("src/renderer/index.html"),
  };
}

describe("RSM-5-I1 secure Electron contract", () => {
  it("accepts the exact physical secure shell source", () => {
    expect(securityIssues(physicalSnapshot())).toEqual([]);
  });

  it("rejects each insecure BrowserWindow preference", () => {
    const baseline = physicalSnapshot();
    const mutations = [
      ["nodeIntegration: false", "nodeIntegration: true"],
      ["contextIsolation: true", "contextIsolation: false"],
      ["sandbox: true", "sandbox: false"],
      ["webSecurity: true", "webSecurity: false"],
      ["allowRunningInsecureContent: false", "allowRunningInsecureContent: true"],
      ["webviewTag: false", "webviewTag: true"],
    ];
    for (const [safe, unsafe] of mutations) {
      expect(
        securityIssues({ ...baseline, main: baseline.main.replaceAll(safe, unsafe) }),
      ).not.toEqual([]);
    }
  });

  it("rejects privileged preload imports and IPC exposure", () => {
    const baseline = physicalSnapshot();
    for (const injection of [
      '\nimport { ipcRenderer } from "electron";\n',
      '\nimport "node:fs";\n',
      "\nvoid process.env;\n",
    ]) {
      expect(securityIssues({ ...baseline, preload: baseline.preload + injection })).toContain(
        "PRELOAD_PRIVILEGED_SURFACE",
      );
    }
  });

  it("rejects weakened production CSP and absent navigation/window controls", () => {
    const baseline = physicalSnapshot();
    expect(
      securityIssues({
        ...baseline,
        html: baseline.html.replace("script-src 'self'", "script-src *"),
      }),
    ).not.toEqual([]);
    expect(
      securityIssues({
        ...baseline,
        main: baseline.main.replace(
          'window.webContents.on("will-navigate"',
          'window.webContents.on("did-navigate"',
        ),
      }),
    ).not.toEqual([]);
    expect(
      securityIssues({
        ...baseline,
        main: baseline.main.replace('return { action: "deny" }', 'return { action: "allow" }'),
      }),
    ).not.toEqual([]);
  });
});
