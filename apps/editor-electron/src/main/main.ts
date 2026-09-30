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
const allowedSmokeUrls = new Set([
  `${allowedInitialUrl}#rsm6-i8-smoke-1`,
  `${allowedInitialUrl}#rsm6-i8-smoke-2`,
]);
const smokePrefix = "--rsm5-smoke-result=";
const smokeResultPath = process.argv
  .find((argument) => argument.startsWith(smokePrefix))
  ?.slice(smokePrefix.length);

let ownedWindow: BrowserWindow | null = null;
let deniedNavigationCount = 0;
let deniedWindowCount = 0;
let rendererCrashCount = 0;
let rendererReloadCount = 0;
const rendererConsoleErrors: string[] = [];
const rendererConsoleWarnings: string[] = [];
const webglInitializationFailures: string[] = [];

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

interface RendererConsoleObservation {
  readonly level?: string;
  readonly message?: string;
}

interface ViewportSmokeObservation {
  readonly assetInstantiated?: boolean;
  readonly assetLoaded?: boolean;
  readonly canvasRemoved?: boolean;
  readonly contextLostObserved?: boolean;
  readonly contextRestoredObserved?: boolean;
  readonly disposed?: boolean;
  readonly frameSampleCount?: number;
  readonly generation?: number;
  readonly gizmoAttached?: boolean;
  readonly gizmoModesAccepted?: boolean;
  readonly mounted?: boolean;
  readonly pickIntentCount?: number;
  readonly rendererDocumentGeneration?: number;
  readonly rendererFailureSummary?: readonly {
    readonly category?: string;
    readonly classification?: string;
  }[];
  readonly resizeObserved?: boolean;
  readonly running?: boolean;
  readonly status?: string;
  readonly terminalAssetContainerCount?: number | null;
  readonly terminalAssetInstanceCount?: number | null;
  readonly terminalEngineCount?: number | null;
  readonly terminalLifecycle?: string | null;
  readonly terminalSceneCount?: number | null;
  readonly unhandledRendererRejectionCount?: number;
}

function sanitizedFailure(error: unknown): Readonly<{ name: string; code: string }> {
  const name = error instanceof Error ? error.name : "UnknownError";
  const candidate = error as { code?: unknown };
  const controlledMessage =
    error instanceof Error && /^RSM(?:5|6)_[A-Z0-9_]+$/u.test(error.message)
      ? error.message
      : undefined;
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

async function readViewportSmoke(window: BrowserWindow): Promise<ViewportSmokeObservation | null> {
  return (await window.webContents.executeJavaScript(
    "window.__retrostageViewportSmoke ?? null",
  )) as ViewportSmokeObservation | null;
}

async function waitForViewportSmoke(
  window: BrowserWindow,
  predicate: (observation: ViewportSmokeObservation) => boolean,
  timeoutMilliseconds: number,
  timeoutCode: string,
): Promise<ViewportSmokeObservation> {
  const deadline = Date.now() + timeoutMilliseconds;
  let lastObservation: ViewportSmokeObservation | null = null;
  while (Date.now() < deadline) {
    const observation = await readViewportSmoke(window);
    lastObservation = observation;
    if (observation !== null && predicate(observation)) return observation;
    await delay(50);
  }
  writeSmokeResult({
    failure: Object.freeze({ code: timeoutCode, name: "Error" }),
    observation: lastObservation,
    result: "FAIL",
  });
  throw new Error(timeoutCode);
}

async function observeViewportGeneration(
  window: BrowserWindow,
  expectedDocumentGeneration: 1 | 2,
): Promise<ViewportSmokeObservation> {
  await waitForViewportSmoke(
    window,
    (observation) =>
      observation.rendererDocumentGeneration === expectedDocumentGeneration &&
      observation.running === true,
    30_000,
    `RSM6_I8_RUNNING_TIMEOUT_${expectedDocumentGeneration}`,
  );
  const [width, height] = window.getSize();
  if (width === undefined || height === undefined) {
    throw new Error("RSM6_I8_WINDOW_EXTENT_UNAVAILABLE");
  }
  window.setSize(width + (expectedDocumentGeneration === 1 ? 32 : -32), height + 24);
  return waitForViewportSmoke(
    window,
    (observation) =>
      observation.rendererDocumentGeneration === expectedDocumentGeneration &&
      observation.disposed === true,
    60_000,
    `RSM6_I8_DISPOSED_TIMEOUT_${expectedDocumentGeneration}`,
  );
}

function viewportGenerationPasses(
  observation: ViewportSmokeObservation,
  expectedDocumentGeneration: 1 | 2,
): boolean {
  const summaries = observation.rendererFailureSummary ?? [];
  return (
    observation.rendererDocumentGeneration === expectedDocumentGeneration &&
    observation.generation === 1 &&
    observation.status === "succeeded" &&
    observation.mounted === true &&
    observation.running === false &&
    observation.frameSampleCount !== undefined &&
    observation.frameSampleCount >= 60 &&
    observation.resizeObserved === true &&
    observation.contextLostObserved === true &&
    observation.contextRestoredObserved === true &&
    observation.assetLoaded === true &&
    observation.assetInstantiated === true &&
    observation.gizmoAttached === true &&
    observation.gizmoModesAccepted === true &&
    observation.pickIntentCount !== undefined &&
    observation.pickIntentCount >= 1 &&
    observation.disposed === true &&
    observation.terminalLifecycle === "DISPOSED" &&
    observation.terminalEngineCount === 0 &&
    observation.terminalSceneCount === 0 &&
    observation.terminalAssetContainerCount === 0 &&
    observation.terminalAssetInstanceCount === 0 &&
    observation.canvasRemoved === true &&
    observation.unhandledRendererRejectionCount === 0 &&
    summaries.length === 1 &&
    summaries[0]?.category === "CONTEXT_OR_DEVICE_LOST" &&
    summaries[0]?.classification === "recoverable"
  );
}

async function reloadForSecondViewportGeneration(window: BrowserWindow): Promise<void> {
  await window.webContents.executeJavaScript("location.hash = 'rsm6-i8-smoke-2'");
  const completed = new Promise<void>((resolve) => {
    window.webContents.once("did-finish-load", () => resolve());
  });
  rendererReloadCount += 1;
  window.webContents.reload();
  await completed;
  window.showInactive();
}

async function runSmoke(window: BrowserWindow): Promise<void> {
  const firstViewportGeneration = await observeViewportGeneration(window, 1);
  await reloadForSecondViewportGeneration(window);
  const secondViewportGeneration = await observeViewportGeneration(window, 2);
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
    secondWindowOpenDenied: window.open('file:///rsm5-window-escape') === null,
    viewportCanvasCount: document.querySelectorAll('canvas[data-retrostage-viewport="babylon9"]').length
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
    rendererReloadCount,
    rendererConsoleErrors,
    rendererConsoleWarnings,
    rendererCrashCount,
    webglInitializationFailures,
    viewportGenerations: [firstViewportGeneration, secondViewportGeneration],
    viewportCanvasCount: rendererState.viewportCanvasCount,
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
    result.electronVersion === "43.5.0" &&
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
    result.rendererReloadCount === 1 &&
    result.rendererConsoleErrors.length === 0 &&
    result.rendererConsoleWarnings.length === 0 &&
    result.rendererCrashCount === 0 &&
    result.webglInitializationFailures.length === 0 &&
    result.viewportCanvasCount === 0 &&
    viewportGenerationPasses(firstViewportGeneration, 1) &&
    viewportGenerationPasses(secondViewportGeneration, 2) &&
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
      backgroundThrottling: false,
      preload: preloadEntry,
    },
  });
  ownedWindow = window;

  window.on("closed", () => {
    if (ownedWindow === window) ownedWindow = null;
  });
  window.webContents.on("will-navigate", (event, targetUrl) => {
    if (targetUrl !== allowedInitialUrl && !allowedSmokeUrls.has(targetUrl)) {
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
  window.webContents.on("console-message", (event) => {
    const observation = event as unknown as RendererConsoleObservation;
    const message = observation.message ?? "";
    if (observation.level === "warning") rendererConsoleWarnings.push(message);
    if (observation.level === "error") rendererConsoleErrors.push(message);
    if (/WebGL.*(?:initializ|creation|unavailable|failed)/iu.test(message)) {
      webglInitializationFailures.push(message);
    }
  });
  window.webContents.on("render-process-gone", () => {
    rendererCrashCount += 1;
  });
  if (smokeResultPath !== undefined) window.showInactive();

  await window.loadFile(
    rendererEntry,
    smokeResultPath === undefined ? undefined : { hash: "rsm6-i8-smoke-1" },
  );
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
