#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  constructProgressionRoot,
  inspectActiveProgression,
  promoteProgressionRoot,
  verifyProgressionRoot,
} from "./lib/progression-root.mjs";
import {
  createRecoveryCapsule,
  recoverCurrent,
  verifyRecoveryCapsule,
} from "./lib/recovery-capsule.mjs";

export const PROGRESSION_COMMANDS = Object.freeze([
  "construct-root",
  "create-recovery-capsule",
  "inspect-active",
  "promote-root",
  "recover-current",
  "verify-recovery-capsule",
  "verify-root",
]);

function portableDomain(domain) {
  return {
    schemaVersion: domain.schemaVersion,
    repositoryIdentity: domain.repositoryIdentity,
    taskIdentity: domain.taskIdentity,
    portableWorktreeIdentity: domain.portableWorktreeIdentity,
    portableStateDomainIdentity: domain.portableStateDomainIdentity,
    localWorktreeBindingIdentity: domain.localWorktreeBindingIdentity,
    localStateStoreBindingIdentity: domain.localStateStoreBindingIdentity,
    progressionStoreSubroot: "progression-root",
  };
}

function localRoots(input) {
  const roots = new Set();
  for (const candidate of [
    input?.repositoryRoot,
    input?.worktreeRoot,
    input?.stateRoot,
    input?.domainInput?.repositoryRoot,
    input?.domainInput?.worktreeRoot,
    input?.domainInput?.stateRoot,
    input?.evidenceRoot,
  ]) {
    if (typeof candidate === "string" && candidate.length > 0) {
      roots.add(candidate);
      roots.add(candidate.replaceAll("\\", "/"));
    }
  }
  return [...roots];
}

function containsMachineLocalPath(value, roots) {
  if (roots.some((root) => value.includes(root))) return true;
  if (/(?:^|[^A-Za-z0-9+.-])[A-Za-z]:[\\/]/u.test(value)) return true;
  if (value.startsWith("\\\\") || value.startsWith("/")) return true;
  return /(?:^|[\s:=@(-])\/(?:home|Users|tmp|var\/tmp)\//u.test(value);
}

function portableResult(value, key = null, roots = []) {
  if (key === "domain") return portableDomain(value);
  if (
    new Set([
      "bindingRecordPath",
      "paths",
      "progressionStoreRoot",
      "repositoryRoot",
      "stateRoot",
      "taskStateRoot",
      "worktreeRoot",
    ]).has(key)
  ) {
    return undefined;
  }
  if (typeof value === "string" && containsMachineLocalPath(value, roots)) return undefined;
  if (Array.isArray(value)) {
    return value
      .map((entry) => portableResult(entry, null, roots))
      .filter((entry) => entry !== undefined);
  }
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .map(([entryKey, entryValue]) => [entryKey, portableResult(entryValue, entryKey, roots)])
      .filter(([, entryValue]) => entryValue !== undefined),
  );
}

export async function runProgression(command, input) {
  const roots = localRoots(input);
  switch (command) {
    case "construct-root":
      return portableResult(await constructProgressionRoot(input), null, roots);
    case "promote-root":
      return portableResult(await promoteProgressionRoot(input), null, roots);
    case "inspect-active":
      return portableResult(await inspectActiveProgression(input), null, roots);
    case "verify-root":
      return portableResult(await verifyProgressionRoot(input), null, roots);
    case "create-recovery-capsule":
      return portableResult(await createRecoveryCapsule(input), null, roots);
    case "verify-recovery-capsule":
      return portableResult(
        await verifyRecoveryCapsule(input.capsule, { evidenceRoot: input.evidenceRoot }),
        null,
        roots,
      );
    case "recover-current":
      return portableResult(await recoverCurrent(input), null, roots);
    default:
      throw Object.assign(new Error("CLI_USAGE_INVALID"), { code: "CLI_USAGE_INVALID" });
  }
}

async function main() {
  if (process.argv.length !== 4 || !PROGRESSION_COMMANDS.includes(process.argv[2])) {
    throw Object.assign(new Error("CLI_USAGE_INVALID"), { code: "CLI_USAGE_INVALID" });
  }
  const input = JSON.parse(await readFile(process.argv[3], "utf8"));
  process.stdout.write(`${canonicalJson(await runProgression(process.argv[2], input))}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    process.stderr.write(`${error?.code ?? "CIC_I7_OPERATION_FAILED"}\n`);
    process.exitCode = 1;
  });
}
