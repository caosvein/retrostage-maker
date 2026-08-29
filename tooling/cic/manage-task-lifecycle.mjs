#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { acceptSealedPostimage, sealWritePreimage } from "./lib/write-preimage.mjs";
import {
  acquireMutationLease,
  admitAuthorization,
  recordOwnerDecision,
  recordTaskContract,
  releaseMutationLease,
  revokeAuthorization,
  verifyAuthorization,
} from "./lib/task-authorization.mjs";
import { inspectStateDomainCandidate, recordStateDomainBinding } from "./lib/state-domain.mjs";

export const TASK_LIFECYCLE_COMMANDS = Object.freeze([
  "accept-successor-checkpoint",
  "acquire-lease",
  "admit-authorization",
  "inspect-state-domain",
  "record-owner-decision",
  "record-state-domain-binding",
  "record-task-contract",
  "release-lease",
  "revoke-authorization",
  "seal-write-preimage",
  "verify-authorization",
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

function portableResult(value, key = null) {
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
  if (Array.isArray(value)) return value.map((entry) => portableResult(entry));
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .map(([entryKey, entryValue]) => [entryKey, portableResult(entryValue, entryKey)])
      .filter(([, entryValue]) => entryValue !== undefined),
  );
}

export async function runTaskLifecycle(command, input) {
  switch (command) {
    case "inspect-state-domain":
      return portableDomain(await inspectStateDomainCandidate(input));
    case "record-state-domain-binding":
      return portableDomain(await recordStateDomainBinding(input));
    case "record-task-contract":
      return portableResult(await recordTaskContract(input.domainInput, input.taskContract));
    case "record-owner-decision":
      return portableResult(await recordOwnerDecision(input.domainInput, input.ownerDecision));
    case "admit-authorization":
      return portableResult(await admitAuthorization(input));
    case "verify-authorization":
      return portableResult(await verifyAuthorization(input));
    case "revoke-authorization":
      return portableResult(await revokeAuthorization(input));
    case "acquire-lease":
      return portableResult(await acquireMutationLease(input));
    case "seal-write-preimage": {
      const { seal } = await sealWritePreimage(input);
      return seal;
    }
    case "accept-successor-checkpoint":
      return portableResult(await acceptSealedPostimage(input));
    case "release-lease":
      return releaseMutationLease(input);
    default:
      throw Object.assign(new Error("CLI_USAGE_INVALID"), { code: "CLI_USAGE_INVALID" });
  }
}

async function main() {
  if (process.argv.length !== 4 || !TASK_LIFECYCLE_COMMANDS.includes(process.argv[2])) {
    throw Object.assign(new Error("CLI_USAGE_INVALID"), { code: "CLI_USAGE_INVALID" });
  }
  const input = JSON.parse(await readFile(process.argv[3], "utf8"));
  process.stdout.write(`${canonicalJson(await runTaskLifecycle(process.argv[2], input))}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    process.stderr.write(`${error?.code ?? "CIC_I4_OPERATION_FAILED"}\n`);
    process.exitCode = 1;
  });
}
