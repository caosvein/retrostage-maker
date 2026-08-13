import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  assertNoRelatedWindowsProcesses,
  exactPathProcessIdentities,
  relatedWindowsProcesses,
  windowsProcessIdentity,
} from "../scripts/smoke.mjs";

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
    smoke: read("scripts/smoke.mjs"),
  };
}

function smokeHarnessIssues(smoke) {
  const issues = [];
  const requiredFragments = [
    'process.platform !== "linux"',
    'process.env.GITHUB_ACTIONS !== "true"',
    'path.join(path.dirname(executable), "chrome-sandbox")',
    '["-n", "chown", "root:root", sandboxHelper]',
    '["-n", "chmod", "4755", sandboxHelper]',
    '["-c", "%U:%G %a", sandboxHelper]',
    'observedIdentity !== "root:root 4755"',
    "RSM5_SMOKE_SUID_HELPER_MISSING",
    "RSM5_SMOKE_SUID_CHOWN_FAILED",
    "RSM5_SMOKE_SUID_CHMOD_FAILED",
    "RSM5_SMOKE_SUID_STAT_FAILED",
    "RSM5_SMOKE_SUID_VERIFICATION_FAILED",
    "prepareGitHubActionsLinuxSuidSandbox(executable)",
    "Get-CimInstance Win32_Process",
    "ProcessId",
    "ParentProcessId",
    "ExecutablePath",
    "CreationDate",
    "preExistingIdentities",
    "rootProcessId",
    "launchTimeMilliseconds",
    "closeTimeMilliseconds",
    "relatedWindowsProcesses",
  ];
  for (const fragment of requiredFragments) {
    if (!smoke.includes(fragment)) issues.push(`SMOKE_SUID_FRAGMENT_MISSING:${fragment}`);
  }
  for (const forbidden of [
    "--no-sandbox",
    'appendSwitch("no-sandbox")',
    "ELECTRON_DISABLE_SANDBOX",
    "IMAGENAME eq",
    "taskkill",
    "Stop-Process",
    "process.kill(",
  ]) {
    if (smoke.includes(forbidden)) issues.push(`SMOKE_SANDBOX_BYPASS:${forbidden}`);
  }
  return issues;
}

function windowsProcess({
  processId,
  parentProcessId = 1,
  executablePath = String.raw`C:\lab\electron.exe`,
  name = "electron.exe",
  creationTimeMilliseconds,
}) {
  return {
    processId,
    parentProcessId,
    executablePath,
    name,
    commandLine: `"${executablePath}" --fixture`,
    creationDate: new Date(creationTimeMilliseconds).toISOString(),
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

  it("requires fail-closed GitHub Actions Linux SUID preparation with sandboxing intact", () => {
    const snapshot = physicalSnapshot();
    expect(smokeHarnessIssues(snapshot.smoke)).toEqual([]);
    expect(snapshot.main).toContain("sandbox: true");
  });

  it("rejects missing SUID preparation evidence and sandbox-disable bypasses", () => {
    const baseline = physicalSnapshot().smoke;
    for (const required of [
      'process.env.GITHUB_ACTIONS !== "true"',
      'path.join(path.dirname(executable), "chrome-sandbox")',
      '["-n", "chown", "root:root", sandboxHelper]',
      '["-n", "chmod", "4755", sandboxHelper]',
      'observedIdentity !== "root:root 4755"',
    ]) {
      expect(smokeHarnessIssues(baseline.replace(required, ""))).not.toEqual([]);
    }
    for (const bypass of [
      "--no-sandbox",
      'appendSwitch("no-sandbox")',
      "ELECTRON_DISABLE_SANDBOX",
    ]) {
      expect(smokeHarnessIssues(`${baseline}\n${bypass}\n`)).toContain(
        `SMOKE_SANDBOX_BYPASS:${bypass}`,
      );
    }
  });
});

describe("RSM-5-I1 Windows process identity matcher", () => {
  const executablePath = String.raw`C:\lab\electron.exe`;
  const launchTimeMilliseconds = Date.parse("2026-08-13T00:00:10.000Z");
  const closeTimeMilliseconds = Date.parse("2026-08-13T00:00:12.000Z");

  it("ignores different paths and exact pre-existing process identities", () => {
    const preExisting = windowsProcess({
      processId: 10,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds - 10_000,
    });
    const preExistingIdentities = exactPathProcessIdentities([preExisting], executablePath);
    const inventory = [
      preExisting,
      windowsProcess({
        processId: 20,
        executablePath: String.raw`C:\unrelated\electron.exe`,
        name: "electron.exe",
        creationTimeMilliseconds: launchTimeMilliseconds + 100,
      }),
    ];
    expect(
      relatedWindowsProcesses({
        processInventory: inventory,
        executablePath,
        preExistingIdentities,
        rootProcessId: 30,
        launchTimeMilliseconds,
        closeTimeMilliseconds,
      }),
    ).toEqual([]);
  });

  it("relates the spawned root, child, grandchild, and unreadable-path descendant", () => {
    const root = windowsProcess({
      processId: 30,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds + 100,
    });
    const child = windowsProcess({
      processId: 31,
      parentProcessId: 30,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds + 200,
    });
    const grandchild = windowsProcess({
      processId: 32,
      parentProcessId: 31,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds + 300,
    });
    const unreadable = windowsProcess({
      processId: 33,
      parentProcessId: 30,
      executablePath: null,
      creationTimeMilliseconds: launchTimeMilliseconds + 400,
    });
    const related = relatedWindowsProcesses({
      processInventory: [root, child, grandchild, unreadable],
      executablePath,
      preExistingIdentities: new Set(),
      rootProcessId: 30,
      launchTimeMilliseconds,
      closeTimeMilliseconds,
    });
    expect(related.map((processRecord) => processRecord.processId)).toEqual([30, 31, 32, 33]);
    expect(related.every((processRecord) => processRecord.lineageCorroborated)).toBe(true);
    expect(related.at(-1).executablePathUnreadable).toBe(true);
  });

  it("enforces the launch window and defends against PID reuse", () => {
    const preExisting = windowsProcess({
      processId: 40,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds - 10_000,
    });
    const reusedPid = windowsProcess({
      processId: 40,
      parentProcessId: 50,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds + 200,
    });
    const before = windowsProcess({
      processId: 41,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds - 10_000,
    });
    const after = windowsProcess({
      processId: 42,
      executablePath,
      creationTimeMilliseconds: closeTimeMilliseconds + 10_000,
    });
    expect(windowsProcessIdentity(preExisting)).not.toBe(windowsProcessIdentity(reusedPid));
    const related = relatedWindowsProcesses({
      processInventory: [reusedPid, before, after],
      executablePath,
      preExistingIdentities: exactPathProcessIdentities([preExisting], executablePath),
      rootProcessId: 50,
      launchTimeMilliseconds,
      closeTimeMilliseconds,
    });
    expect(related.map((processRecord) => processRecord.processId)).toEqual([40]);
  });

  it("fails on a persistent related survivor and passes on a clean inventory", () => {
    const survivor = windowsProcess({
      processId: 60,
      executablePath,
      creationTimeMilliseconds: launchTimeMilliseconds + 100,
    });
    const related = relatedWindowsProcesses({
      processInventory: [survivor],
      executablePath,
      preExistingIdentities: new Set(),
      rootProcessId: 60,
      launchTimeMilliseconds,
      closeTimeMilliseconds,
    });
    expect(() => assertNoRelatedWindowsProcesses("development", related)).toThrow(
      "RSM5_SMOKE_ORPHAN_PROCESS:development:1",
    );
    expect(() => assertNoRelatedWindowsProcesses("development", [])).not.toThrow();
  });
});
