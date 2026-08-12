import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { clearTimeout, setTimeout } from "node:timers";
import { setTimeout as delay } from "node:timers/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const applicationRoot = path.resolve(import.meta.dirname, "..");
const electronExecutable = require("electron");
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), "retrostage-rsm5-smoke-"));
const timeoutMilliseconds = 45_000;

function packagedExecutablePath() {
  if (process.platform === "win32") {
    return path.join(applicationRoot, "out", "RetroStageMaker-win32-x64", "RetroStageMaker.exe");
  }
  if (process.platform === "linux") {
    return path.join(applicationRoot, "out", "RetroStageMaker-linux-x64", "RetroStageMaker");
  }
  throw new Error(`RSM5_SMOKE_UNSUPPORTED_PLATFORM:${process.platform}`);
}

function launchCommand(executable, arguments_) {
  if (process.platform === "linux")
    return { command: "xvfb-run", arguments: ["-a", executable, ...arguments_] };
  return { command: executable, arguments: arguments_ };
}

function processCount(executable) {
  const executableName = path.basename(executable).toLowerCase();
  if (process.platform === "win32") {
    const observation = spawnSync(
      "tasklist.exe",
      ["/FO", "CSV", "/NH", "/FI", `IMAGENAME eq ${path.basename(executable)}`],
      { encoding: "utf8", windowsHide: true },
    );
    if (observation.status !== 0) throw new Error("RSM5_PROCESS_OBSERVATION_FAILED:tasklist");
    return observation.stdout
      .split(/\r?\n/u)
      .filter((line) => line.trim().toLowerCase().startsWith(`"${executableName}"`)).length;
  }
  const observation = spawnSync("ps", ["-eo", "comm="], { encoding: "utf8" });
  if (observation.status !== 0) throw new Error("RSM5_PROCESS_OBSERVATION_FAILED:ps");
  return observation.stdout
    .split(/\r?\n/u)
    .filter((line) => path.basename(line.trim()).toLowerCase() === executableName).length;
}

async function runMode(mode) {
  const resultPath = path.join(temporaryRoot, `${mode}.json`);
  const packaged = mode === "packaged";
  const executable = packaged ? packagedExecutablePath() : electronExecutable;
  if (!existsSync(executable)) throw new Error(`RSM5_SMOKE_EXECUTABLE_MISSING:${executable}`);
  const applicationArguments = packaged ? [] : [applicationRoot];
  applicationArguments.push(`--rsm5-smoke-result=${resultPath}`);
  const launch = launchCommand(executable, applicationArguments);
  const processCountBefore = processCount(executable);

  const observation = await new Promise((resolve, reject) => {
    const child = spawn(launch.command, launch.arguments, {
      cwd: applicationRoot,
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });
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
  await delay(250);
  const processCountAfter = processCount(executable);
  const remainingApplicationProcessCount = Math.max(0, processCountAfter - processCountBefore);
  if (remainingApplicationProcessCount !== 0) {
    throw new Error(`RSM5_SMOKE_ORPHAN_PROCESS:${mode}:${remainingApplicationProcessCount}`);
  }
  return {
    mode,
    processExit: observation.code,
    cleanExit: observation.code === 0 && observation.signal === null,
    processCountBefore,
    processCountAfter,
    remainingApplicationProcessCount,
    result,
  };
}

try {
  const development = await runMode("development");
  const packaged = await runMode("packaged");
  process.stdout.write(`${JSON.stringify({ result: "PASS", development, packaged }, null, 2)}\n`);
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}
