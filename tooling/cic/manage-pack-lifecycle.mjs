#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  activatePack,
  generatePack,
  inspectPack,
  invalidatePack,
  verifyPack,
} from "./lib/pack-lifecycle.mjs";

export const PACK_LIFECYCLE_COMMANDS = Object.freeze([
  "activate",
  "generate",
  "inspect",
  "invalidate",
  "verify",
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
    taskStateSubroot: `tasks/${domain.taskIdentity}`,
    packStoreSubroot: `packs/${domain.taskIdentity}`,
  };
}

function localRoots(input) {
  const roots = new Set();
  const candidates = [
    input?.repositoryRoot,
    input?.worktreeRoot,
    input?.stateRoot,
    input?.domainInput?.repositoryRoot,
    input?.domainInput?.worktreeRoot,
    input?.domainInput?.stateRoot,
  ];
  for (const candidate of candidates) {
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
      "packStoreRoot",
      "paths",
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

export async function runPackLifecycle(command, input) {
  const roots = localRoots(input);
  switch (command) {
    case "generate":
      return portableResult(await generatePack(input), null, roots);
    case "verify":
      return portableResult(await verifyPack(input), null, roots);
    case "activate":
      return portableResult(await activatePack(input), null, roots);
    case "invalidate":
      return portableResult(await invalidatePack(input), null, roots);
    case "inspect":
      return portableResult(await inspectPack(input), null, roots);
    default:
      throw Object.assign(new Error("CLI_USAGE_INVALID"), { code: "CLI_USAGE_INVALID" });
  }
}

async function main() {
  if (process.argv.length !== 4 || !PACK_LIFECYCLE_COMMANDS.includes(process.argv[2])) {
    throw Object.assign(new Error("CLI_USAGE_INVALID"), { code: "CLI_USAGE_INVALID" });
  }
  const input = JSON.parse(await readFile(process.argv[3], "utf8"));
  process.stdout.write(`${canonicalJson(await runPackLifecycle(process.argv[2], input))}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    process.stderr.write(`${error?.code ?? "CIC_I4_OPERATION_FAILED"}\n`);
    process.exitCode = 1;
  });
}
