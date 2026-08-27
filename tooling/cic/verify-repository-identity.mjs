import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { verifyRepositoryIdentity } from "./lib/repository-identity.mjs";

const MODULE_PATH = fileURLToPath(import.meta.url);

export function formatJsonResult(result) {
  return `${JSON.stringify(result, null, 2)}\n`;
}

function formatHumanResult(result) {
  if (result.status === "PASS") {
    return [
      "CIC repository identity: PASS",
      `repository: ${result.repository.repositoryIdentity}`,
      `snapshot: ${result.snapshotFingerprint}`,
      `HEAD: ${result.head.commit}`,
      `branch: ${result.head.branch.ref ?? "DETACHED"}`,
      `state: ${result.worktree.mutationSafety}`,
    ].join("\n");
  }
  return ["CIC repository identity: BLOCKED", ...result.errors.map(({ code }) => code)].join("\n");
}

export async function run(argv = process.argv.slice(2), repositoryRoot = process.cwd()) {
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== "--json")) {
    return {
      exitCode: 64,
      stdout: "",
      stderr: "Usage: node tooling/cic/verify-repository-identity.mjs [--json]\n",
    };
  }
  const result = await verifyRepositoryIdentity(repositoryRoot);
  return {
    exitCode: result.status === "PASS" ? 0 : 2,
    stdout: argv[0] === "--json" ? formatJsonResult(result) : `${formatHumanResult(result)}\n`,
    stderr: "",
  };
}

async function main() {
  const outcome = await run();
  if (outcome.stdout) process.stdout.write(outcome.stdout);
  if (outcome.stderr) process.stderr.write(outcome.stderr);
  process.exitCode = outcome.exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) {
  main().catch(() => {
    process.stderr.write("CIC repository identity: BLOCKED\nGIT_READ_OPERATION_FAILED\n");
    process.exitCode = 2;
  });
}
