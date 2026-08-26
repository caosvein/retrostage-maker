import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { verifySourceGeneration } from "./lib/source-generation.mjs";

const MODULE_PATH = fileURLToPath(import.meta.url);

export function formatJsonResult(result) {
  return `${JSON.stringify(result, null, 2)}\n`;
}

function formatHumanResult(result) {
  if (result.status === "PASS") {
    return [
      "CIC source generation: PASS",
      `fingerprint: ${result.generationFingerprint}`,
      `sources: ${result.sources.length}/${result.sources.length}`,
    ].join("\n");
  }

  return [
    "CIC source generation: BLOCKED",
    ...result.errors.map(({ code, path: relativePath }) => `${code}: ${relativePath}`),
  ].join("\n");
}

export async function run(argv = process.argv.slice(2), repositoryRoot = process.cwd()) {
  if (argv.length > 1 || (argv.length === 1 && argv[0] !== "--json")) {
    return {
      exitCode: 64,
      stdout: "",
      stderr: "Usage: node tooling/cic/verify-source-generation.mjs [--json]\n",
    };
  }

  const result = await verifySourceGeneration(repositoryRoot);
  const json = argv[0] === "--json";
  return {
    exitCode: result.status === "PASS" ? 0 : 2,
    stdout: json ? formatJsonResult(result) : `${formatHumanResult(result)}\n`,
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
    process.stderr.write("CIC source generation: BLOCKED\nSOURCE_INVENTORY_UNKNOWN\n");
    process.exitCode = 2;
  });
}
