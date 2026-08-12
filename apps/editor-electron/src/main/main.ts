import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

import { app, BrowserWindow } from "electron";

declare const __dirname: string;

const rendererEntry = join(__dirname, "..", "renderer", "index.html");
const preloadEntry = join(__dirname, "..", "preload", "preload.cjs");
const allowedInitialUrl = pathToFileURL(rendererEntry).href;
const smokePrefix = "--rsm5-smoke-result=";
const smokeResultPath = process.argv
  .find((argument) => argument.startsWith(smokePrefix))
  ?.slice(smokePrefix.length);

let ownedWindow: BrowserWindow | null = null;
let deniedNavigationCount = 0;
let deniedWindowCount = 0;

interface ObservedWebPreferences {
  readonly nodeIntegration?: boolean;
  readonly contextIsolation?: boolean;
  readonly sandbox?: boolean;
  readonly webSecurity?: boolean;
  readonly allowRunningInsecureContent?: boolean;
  readonly webviewTag?: boolean;
  readonly experimentalFeatures?: boolean;
  readonly navigateOnDragDrop?: boolean;
}

interface PreferenceInspectableWebContents {
  getLastWebPreferences(): ObservedWebPreferences;
}

function sanitizedFailure(error: unknown): Readonly<{ name: string; code: string }> {
  const name = error instanceof Error ? error.name : "UnknownError";
  const candidate = error as { code?: unknown };
  const controlledMessage =
    error instanceof Error && /^RSM5_[A-Z0-9_]+$/u.test(error.message) ? error.message : undefined;
  return Object.freeze({
    name,
    code:
      controlledMessage ??
      (typeof candidate?.code === "string" ? candidate.code : "RSM5_SHELL_FAILURE"),
  });
}

function writeSmokeResult(value: unknown): void {
  if (smokeResultPath)
    writeFileSync(smokeResultPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function attemptDeniedNavigation(window: BrowserWindow, target: string): Promise<void> {
  try {
    await window.webContents.executeJavaScript(`location.href = ${JSON.stringify(target)}`);
  } catch {
    // The navigation policy intentionally rejects the initiating script promise.
  }
  await delay(150);
}

async function runSmoke(window: BrowserWindow): Promise<void> {
  const initialUrl = window.webContents.getURL();
  const rendererState = (await window.webContents.executeJavaScript(`({
    brand: document.querySelector('[data-retrostage-brand]')?.textContent,
    nodeProcessType: typeof process,
    nodeRequireType: typeof require,
    shellKeys: Object.keys(window.retrostageShell).sort(),
    capabilityKeys: Object.keys(window.retrostageShell.capabilities).sort(),
    shellFrozen: Object.isFrozen(window.retrostageShell),
    capabilitiesFrozen: Object.isFrozen(window.retrostageShell.capabilities),
    privilegedIpc: window.retrostageShell.capabilities.privilegedIpc,
    filesystem: window.retrostageShell.capabilities.filesystem,
    firstWindowOpenDenied: window.open('https://example.com') === null,
    secondWindowOpenDenied: window.open('file:///rsm5-window-escape') === null
  })`)) as Record<string, unknown>;

  await attemptDeniedNavigation(window, "https://example.com/");
  await attemptDeniedNavigation(window, "file:///rsm5-navigation-escape");
  await attemptDeniedNavigation(window, "::::invalid-rsm5-target");

  const preferences = (
    window.webContents as unknown as PreferenceInspectableWebContents
  ).getLastWebPreferences();
  const result = {
    result: "PASS",
    appReady: app.isReady(),
    packaged: app.isPackaged,
    electronVersion: process.versions.electron,
    brand: rendererState.brand,
    nodeProcessType: rendererState.nodeProcessType,
    nodeRequireType: rendererState.nodeRequireType,
    shellKeys: rendererState.shellKeys,
    capabilityKeys: rendererState.capabilityKeys,
    shellFrozen: rendererState.shellFrozen,
    capabilitiesFrozen: rendererState.capabilitiesFrozen,
    privilegedIpc: rendererState.privilegedIpc,
    filesystem: rendererState.filesystem,
    firstWindowOpenDenied: rendererState.firstWindowOpenDenied,
    secondWindowOpenDenied: rendererState.secondWindowOpenDenied,
    deniedNavigationCount,
    deniedWindowCount,
    initialUrl,
    finalUrl: window.webContents.getURL(),
    windowCount: BrowserWindow.getAllWindows().length,
    preferences: {
      nodeIntegration: preferences.nodeIntegration,
      contextIsolation: preferences.contextIsolation,
      sandbox: preferences.sandbox,
      webSecurity: preferences.webSecurity,
      allowRunningInsecureContent: preferences.allowRunningInsecureContent,
      webviewTag: preferences.webviewTag,
      experimentalFeatures: preferences.experimentalFeatures,
      navigateOnDragDrop: preferences.navigateOnDragDrop,
    },
  };

  const passes =
    result.appReady === true &&
    result.electronVersion === "43.4.0" &&
    result.brand === "RetroStage Maker" &&
    result.nodeProcessType === "undefined" &&
    result.nodeRequireType === "undefined" &&
    JSON.stringify(result.shellKeys) ===
      JSON.stringify(["capabilities", "platform", "productName", "shellVersion"]) &&
    JSON.stringify(result.capabilityKeys) ===
      JSON.stringify([
        "export",
        "filesystem",
        "privilegedIpc",
        "projectDocuments",
        "sceneRuntime",
      ]) &&
    result.shellFrozen === true &&
    result.capabilitiesFrozen === true &&
    result.privilegedIpc === false &&
    result.filesystem === false &&
    result.firstWindowOpenDenied === true &&
    result.secondWindowOpenDenied === true &&
    result.deniedNavigationCount >= 3 &&
    result.deniedWindowCount >= 2 &&
    result.initialUrl === result.finalUrl &&
    result.windowCount === 1 &&
    result.preferences.nodeIntegration === false &&
    result.preferences.contextIsolation === true &&
    result.preferences.sandbox === true &&
    result.preferences.webSecurity === true &&
    result.preferences.allowRunningInsecureContent === false &&
    result.preferences.webviewTag === false &&
    result.preferences.experimentalFeatures === false &&
    (result.preferences.navigateOnDragDrop === false ||
      result.preferences.navigateOnDragDrop === undefined);

  writeSmokeResult({ ...result, result: passes ? "PASS" : "FAIL" });
  if (!passes) throw new Error("RSM5_SECURITY_SMOKE_ASSERTION_FAILED");
  window.destroy();
  app.exit(0);
}

async function createWindow(): Promise<void> {
  if (ownedWindow !== null) return;

  const window = new BrowserWindow({
    width: 960,
    height: 600,
    show: smokeResultPath === undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      navigateOnDragDrop: false,
      webviewTag: false,
      preload: preloadEntry,
    },
  });
  ownedWindow = window;

  window.on("closed", () => {
    if (ownedWindow === window) ownedWindow = null;
  });
  window.webContents.on("will-navigate", (event, targetUrl) => {
    if (targetUrl !== allowedInitialUrl) {
      deniedNavigationCount += 1;
      event.preventDefault();
    }
  });
  window.webContents.setWindowOpenHandler(() => {
    deniedWindowCount += 1;
    return { action: "deny" };
  });
  window.webContents.on("did-fail-load", (_event, code) => {
    console.error(`RSM5_LOAD_FAILURE:${code}`);
  });

  await window.loadFile(rendererEntry);
  if (smokeResultPath) await runSmoke(window);
}

app
  .whenReady()
  .then(createWindow)
  .catch((error: unknown) => {
    const failure = sanitizedFailure(error);
    console.error(`RSM5_MAIN_FAILURE:${failure.name}:${failure.code}`);
    if (smokeResultPath === undefined || !existsSync(smokeResultPath)) {
      writeSmokeResult({ result: "FAIL", failure });
    }
    app.exit(1);
  });

app.on("activate", () => {
  if (ownedWindow === null) void createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
