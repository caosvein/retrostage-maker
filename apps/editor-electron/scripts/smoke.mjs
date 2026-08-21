import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import { setTimeout as delay } from "node:timers/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const applicationRoot = path.resolve(import.meta.dirname, "..");
const timeoutMilliseconds = 90_000;
const processClockToleranceMilliseconds = 1_500;
const windowsInventoryCommand = String.raw`
$ErrorActionPreference = 'Stop'
Get-CimInstance Win32_Process | ForEach-Object {
  [pscustomobject]@{
    ProcessId = [int]$_.ProcessId
    ParentProcessId = [int]$_.ParentProcessId
    Name = [string]$_.Name
    ExecutablePath = if ($null -eq $_.ExecutablePath) { $null } else { [string]$_.ExecutablePath }
    CommandLine = if ($null -eq $_.CommandLine) { $null } else { [string]$_.CommandLine }
    CreationDate = if ($null -eq $_.CreationDate) { $null } else { $_.CreationDate.ToUniversalTime().ToString('O') }
  } | ConvertTo-Json -Compress
}
`;

function packagedExecutablePath() {
  if (process.platform === "win32") {
    return path.join(applicationRoot, "out", "RetroStageMaker-win32-x64", "RetroStageMaker.exe");
  }
  if (process.platform === "linux") {
    return path.join(applicationRoot, "out", "RetroStageMaker-linux-x64", "RetroStageMaker");
  }
  throw new Error(`RSM5_SMOKE_UNSUPPORTED_PLATFORM:${process.platform}`);
}

function developmentExecutablePath() {
  return require("electron");
}

function launchCommand(executable, arguments_) {
  if (process.platform === "linux")
    return { command: "xvfb-run", arguments: ["-a", executable, ...arguments_] };
  return { command: executable, arguments: arguments_ };
}

function runRequiredSandboxCommand(command, arguments_, failureCode) {
  const observation = spawnSync(command, arguments_, { encoding: "utf8" });
  if (observation.error || observation.status !== 0 || observation.signal !== null) {
    throw new Error(
      `${failureCode}:${JSON.stringify({
        command,
        arguments: arguments_,
        status: observation.status,
        signal: observation.signal,
        stdout: observation.stdout,
        stderr: observation.stderr,
        error: observation.error?.message ?? null,
      })}`,
    );
  }
  return observation;
}

function prepareGitHubActionsLinuxSuidSandbox(executable) {
  if (process.platform !== "linux" || process.env.GITHUB_ACTIONS !== "true") return;

  const sandboxHelper = path.join(path.dirname(executable), "chrome-sandbox");
  if (!existsSync(sandboxHelper)) {
    throw new Error(`RSM5_SMOKE_SUID_HELPER_MISSING:${sandboxHelper}`);
  }

  runRequiredSandboxCommand(
    "sudo",
    ["-n", "chown", "root:root", sandboxHelper],
    "RSM5_SMOKE_SUID_CHOWN_FAILED",
  );
  runRequiredSandboxCommand(
    "sudo",
    ["-n", "chmod", "4755", sandboxHelper],
    "RSM5_SMOKE_SUID_CHMOD_FAILED",
  );
  const verification = runRequiredSandboxCommand(
    "stat",
    ["-c", "%U:%G %a", sandboxHelper],
    "RSM5_SMOKE_SUID_STAT_FAILED",
  );
  const observedIdentity = verification.stdout.trim();
  if (observedIdentity !== "root:root 4755") {
    throw new Error(
      `RSM5_SMOKE_SUID_VERIFICATION_FAILED:${JSON.stringify({
        helper: sandboxHelper,
        expected: "root:root 4755",
        observed: observedIdentity,
        stderr: verification.stderr,
      })}`,
    );
  }
}

function linuxProcessCount(executable) {
  const executableName = path.basename(executable).toLowerCase();
  const observation = spawnSync("ps", ["-eo", "comm="], { encoding: "utf8" });
  if (observation.status !== 0) throw new Error("RSM5_PROCESS_OBSERVATION_FAILED:ps");
  return observation.stdout
    .split(/\r?\n/u)
    .filter((line) => path.basename(line.trim()).toLowerCase() === executableName).length;
}

export function normalizeWindowsExecutablePath(executablePath) {
  if (typeof executablePath !== "string" || executablePath.trim() === "") return null;
  return path.win32.normalize(executablePath.trim()).toLowerCase();
}

export function windowsProcessIdentity(processRecord) {
  const processId = Number(processRecord.processId ?? processRecord.ProcessId);
  const creationDate = processRecord.creationDate ?? processRecord.CreationDate;
  if (!Number.isInteger(processId) || processId < 0 || typeof creationDate !== "string")
    return null;
  const creationTimeMilliseconds = Date.parse(creationDate);
  if (!Number.isFinite(creationTimeMilliseconds)) return null;
  return `${processId}\u0000${new Date(creationTimeMilliseconds).toISOString()}`;
}

function normalizeWindowsProcessRecord(processRecord) {
  const processId = Number(processRecord.processId ?? processRecord.ProcessId);
  const parentProcessId = Number(processRecord.parentProcessId ?? processRecord.ParentProcessId);
  const creationDate = processRecord.creationDate ?? processRecord.CreationDate;
  const creationTimeMilliseconds = Date.parse(creationDate);
  if (
    !Number.isInteger(processId) ||
    processId < 0 ||
    !Number.isInteger(parentProcessId) ||
    parentProcessId < 0 ||
    !Number.isFinite(creationTimeMilliseconds)
  ) {
    return null;
  }
  return {
    processId,
    parentProcessId,
    name: String(processRecord.name ?? processRecord.Name ?? ""),
    executablePath: processRecord.executablePath ?? processRecord.ExecutablePath ?? null,
    commandLine: processRecord.commandLine ?? processRecord.CommandLine ?? null,
    creationDate: new Date(creationTimeMilliseconds).toISOString(),
    creationTimeMilliseconds,
  };
}

export function readWindowsProcessInventory() {
  const observation = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", windowsInventoryCommand],
    { encoding: "utf8", windowsHide: true },
  );
  if (observation.error || observation.status !== 0 || observation.signal !== null) {
    throw new Error(
      `RSM5_PROCESS_OBSERVATION_FAILED:Win32_Process:${JSON.stringify({
        status: observation.status,
        signal: observation.signal,
        stderr: observation.stderr,
        error: observation.error?.message ?? null,
      })}`,
    );
  }
  return observation.stdout
    .split(/\r?\n/u)
    .filter((line) => line.trim() !== "")
    .map((line) => normalizeWindowsProcessRecord(JSON.parse(line)))
    .filter((processRecord) => processRecord !== null);
}

export function exactPathProcessIdentities(processInventory, executablePath) {
  const normalizedExecutablePath = normalizeWindowsExecutablePath(executablePath);
  return new Set(
    processInventory
      .filter(
        (processRecord) =>
          normalizeWindowsExecutablePath(processRecord.executablePath) === normalizedExecutablePath,
      )
      .map(windowsProcessIdentity)
      .filter((identity) => identity !== null),
  );
}

function hasRootLineage(processRecord, processById, rootProcessId) {
  if (processRecord.processId === rootProcessId) return true;
  const visited = new Set([processRecord.processId]);
  let parentProcessId = processRecord.parentProcessId;
  while (
    Number.isInteger(parentProcessId) &&
    parentProcessId > 0 &&
    !visited.has(parentProcessId)
  ) {
    if (parentProcessId === rootProcessId) return true;
    visited.add(parentProcessId);
    const parent = processById.get(parentProcessId);
    if (!parent) return false;
    parentProcessId = parent.parentProcessId;
  }
  return false;
}

export function relatedWindowsProcesses({
  processInventory,
  executablePath,
  preExistingIdentities,
  rootProcessId,
  launchTimeMilliseconds,
  closeTimeMilliseconds,
  clockToleranceMilliseconds = processClockToleranceMilliseconds,
}) {
  const normalizedExecutablePath = normalizeWindowsExecutablePath(executablePath);
  if (!normalizedExecutablePath) throw new Error("RSM5_PROCESS_IDENTITY_EXECUTABLE_PATH_MISSING");
  if (!Number.isInteger(rootProcessId) || rootProcessId <= 0) {
    throw new Error("RSM5_PROCESS_IDENTITY_ROOT_PID_INVALID");
  }
  const normalizedInventory = processInventory
    .map(normalizeWindowsProcessRecord)
    .filter((processRecord) => processRecord !== null);
  const processById = new Map(
    normalizedInventory.map((processRecord) => [processRecord.processId, processRecord]),
  );
  const earliestCreation = launchTimeMilliseconds - clockToleranceMilliseconds;
  const latestCreation = closeTimeMilliseconds + clockToleranceMilliseconds;

  return normalizedInventory.flatMap((processRecord) => {
    const identity = windowsProcessIdentity(processRecord);
    if (identity && preExistingIdentities.has(identity)) return [];
    if (
      processRecord.creationTimeMilliseconds < earliestCreation ||
      processRecord.creationTimeMilliseconds > latestCreation
    ) {
      return [];
    }
    const exactExecutablePath =
      normalizeWindowsExecutablePath(processRecord.executablePath) === normalizedExecutablePath;
    const lineageCorroborated = hasRootLineage(processRecord, processById, rootProcessId);
    const executablePathUnreadable =
      normalizeWindowsExecutablePath(processRecord.executablePath) === null;
    if (!exactExecutablePath && !(executablePathUnreadable && lineageCorroborated)) return [];
    return [
      {
        ...processRecord,
        identity,
        exactExecutablePath,
        executablePathUnreadable,
        lineageCorroborated,
      },
    ];
  });
}

export function assertNoRelatedWindowsProcesses(mode, relatedProcesses) {
  if (relatedProcesses.length !== 0) {
    throw new Error(`RSM5_SMOKE_ORPHAN_PROCESS:${mode}:${relatedProcesses.length}`);
  }
}

export function viewportSmokeIssues(result) {
  const issues = [];
  if (result.rendererReloadCount !== 1) issues.push("VIEWPORT_RELOAD_COUNT");
  if (result.rendererConsoleWarnings?.length !== 0) issues.push("VIEWPORT_CONSOLE_WARNING");
  if (result.rendererConsoleErrors?.length !== 0) issues.push("VIEWPORT_CONSOLE_ERROR");
  if (result.rendererCrashCount !== 0) issues.push("VIEWPORT_RENDERER_CRASH");
  if (result.webglInitializationFailures?.length !== 0) issues.push("VIEWPORT_WEBGL_FAILURE");
  if (result.viewportCanvasCount !== 0) issues.push("VIEWPORT_CANVAS_RETAINED");
  const generations = result.viewportGenerations ?? [];
  if (generations.length !== 2) issues.push("VIEWPORT_GENERATION_COUNT");
  for (const [index, generation] of generations.entries()) {
    const expected = index + 1;
    const failureSummary = generation.rendererFailureSummary ?? [];
    if (
      generation.rendererDocumentGeneration !== expected ||
      generation.generation !== 1 ||
      generation.status !== "succeeded" ||
      generation.mounted !== true ||
      generation.frameSampleCount < 60 ||
      generation.resizeObserved !== true ||
      generation.contextLostObserved !== true ||
      generation.contextRestoredObserved !== true ||
      generation.assetLoaded !== true ||
      generation.assetInstantiated !== true ||
      generation.gizmoAttached !== true ||
      generation.gizmoModesAccepted !== true ||
      generation.pickIntentCount < 1 ||
      generation.disposed !== true ||
      generation.terminalLifecycle !== "DISPOSED" ||
      generation.terminalEngineCount !== 0 ||
      generation.terminalSceneCount !== 0 ||
      generation.terminalAssetContainerCount !== 0 ||
      generation.terminalAssetInstanceCount !== 0 ||
      generation.canvasRemoved !== true ||
      generation.unhandledRendererRejectionCount !== 0 ||
      failureSummary.length !== 1 ||
      failureSummary[0]?.category !== "CONTEXT_OR_DEVICE_LOST" ||
      failureSummary[0]?.classification !== "recoverable"
    ) {
      issues.push(`VIEWPORT_GENERATION_${expected}_FAILED`);
    }
  }
  return issues;
}

async function runMode(mode, temporaryRoot) {
  const resultPath = path.join(temporaryRoot, `${mode}.json`);
  const packaged = mode === "packaged";
  const executable = packaged ? packagedExecutablePath() : developmentExecutablePath();
  if (!existsSync(executable)) throw new Error(`RSM5_SMOKE_EXECUTABLE_MISSING:${executable}`);
  const applicationArguments = packaged ? [] : [applicationRoot];
  applicationArguments.push(`--rsm5-smoke-result=${resultPath}`);
  const launch = launchCommand(executable, applicationArguments);
  const preLaunchInventory = process.platform === "win32" ? readWindowsProcessInventory() : [];
  const preExistingIdentities =
    process.platform === "win32"
      ? exactPathProcessIdentities(preLaunchInventory, executable)
      : new Set();
  const processCountBefore =
    process.platform === "win32" ? preExistingIdentities.size : linuxProcessCount(executable);
  prepareGitHubActionsLinuxSuidSandbox(executable);

  const launchTimeMilliseconds = Date.now();
  let rootProcessId = null;
  const observation = await new Promise((resolve, reject) => {
    const child = spawn(launch.command, launch.arguments, {
      cwd: applicationRoot,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
    rootProcessId = child.pid;
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`RSM5_SMOKE_TIMEOUT:${mode}:${timeoutMilliseconds}`));
    }, timeoutMilliseconds);
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timeout);
      resolve({ code, signal, stdout, stderr });
    });
  });
  const closeTimeMilliseconds = Date.now();

  if (observation.code !== 0 || observation.signal !== null) {
    const recorded = existsSync(resultPath) ? readFileSync(resultPath, "utf8").trim() : "ABSENT";
    throw new Error(
      `RSM5_SMOKE_PROCESS_FAILURE:${mode}:${JSON.stringify({ ...observation, recorded })}`,
    );
  }
  if (!existsSync(resultPath)) throw new Error(`RSM5_SMOKE_RESULT_MISSING:${mode}`);
  const result = JSON.parse(readFileSync(resultPath, "utf8"));
  if (result.result !== "PASS" || result.packaged !== packaged) {
    throw new Error(`RSM5_SMOKE_RESULT_FAILURE:${mode}:${JSON.stringify(result)}`);
  }
  const viewportIssues = viewportSmokeIssues(result);
  if (viewportIssues.length !== 0) {
    throw new Error(`RSM6_I8_SMOKE_RESULT_FAILURE:${mode}:${viewportIssues.join(",")}`);
  }
  await delay(250);
  const postCloseInventory = process.platform === "win32" ? readWindowsProcessInventory() : [];
  const relatedProcesses =
    process.platform === "win32"
      ? relatedWindowsProcesses({
          processInventory: postCloseInventory,
          executablePath: executable,
          preExistingIdentities,
          rootProcessId,
          launchTimeMilliseconds,
          closeTimeMilliseconds,
        })
      : [];
  const processCountAfter =
    process.platform === "win32"
      ? exactPathProcessIdentities(postCloseInventory, executable).size
      : linuxProcessCount(executable);
  const remainingApplicationProcessCount =
    process.platform === "win32"
      ? relatedProcesses.length
      : Math.max(0, processCountAfter - processCountBefore);
  if (process.platform === "win32") {
    assertNoRelatedWindowsProcesses(mode, relatedProcesses);
  } else if (remainingApplicationProcessCount !== 0) {
    throw new Error(`RSM5_SMOKE_ORPHAN_PROCESS:${mode}:${remainingApplicationProcessCount}`);
  }
  return {
    mode,
    processExit: observation.code,
    cleanExit: observation.code === 0 && observation.signal === null,
    processIdentityMatcher:
      process.platform === "win32" ? "EXACT_WINDOWS_PROCESS_IDENTITY" : "NAME",
    rootProcessId,
    launchTime: new Date(launchTimeMilliseconds).toISOString(),
    closeTime: new Date(closeTimeMilliseconds).toISOString(),
    preExistingExactPathIdentityCount: preExistingIdentities.size,
    relatedProcesses,
    processCountBefore,
    processCountAfter,
    remainingApplicationProcessCount,
    result,
  };
}

async function main() {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "retrostage-rsm5-smoke-"));
  try {
    const development = await runMode("development", temporaryRoot);
    const packaged = await runMode("packaged", temporaryRoot);
    process.stdout.write(`${JSON.stringify({ result: "PASS", development, packaged }, null, 2)}\n`);
  } finally {
    rmSync(temporaryRoot, { force: true, recursive: true });
  }
}

const isMainModule =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMainModule) {
  await main();
}
