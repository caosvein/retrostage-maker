import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { evaluateValidationEvidence } from "./lib/validation-evidence.mjs";

const MODULE_PATH = fileURLToPath(import.meta.url);
const USAGE =
  "Usage: node tooling/cic/verify-validation-evidence.mjs [--json] <evidence.json> <current-facts.json>\n";

function human(result) {
  return [
    `CIC validation evidence: ${result.disposition}`,
    `authority: ${result.factAuthority}`,
    ...result.reasonCodes.map((code) => `reason: ${code}`),
  ].join("\n");
}

export async function run(argv = process.argv.slice(2), cwd = process.cwd()) {
  const json = argv[0] === "--json";
  const paths = json ? argv.slice(1) : argv;
  if (paths.length !== 2 || paths.some((value) => value.startsWith("--"))) {
    return { exitCode: 64, stdout: "", stderr: USAGE };
  }
  try {
    const [evidenceText, currentText] = await Promise.all(
      paths.map((file) => readFile(path.resolve(cwd, file), "utf8")),
    );
    const result = evaluateValidationEvidence(JSON.parse(evidenceText), JSON.parse(currentText));
    return {
      exitCode:
        result.disposition === "CURRENT"
          ? 0
          : result.disposition === "REVALIDATION_REQUIRED"
            ? 2
            : 3,
      stdout: json ? `${JSON.stringify(result, null, 2)}\n` : `${human(result)}\n`,
      stderr: "",
    };
  } catch {
    const result = {
      schemaVersion: "CIC-VALIDATION-EVIDENCE-VERIFICATION/1",
      disposition: "INVALID_EVIDENCE",
      reasonCodes: ["EVIDENCE_DOCUMENT_READ_FAILED"],
      validationResultIdentity: null,
      factAuthority: "NON_AUTHORITATIVE_INPUT",
    };
    return {
      exitCode: 3,
      stdout: json ? `${JSON.stringify(result, null, 2)}\n` : `${human(result)}\n`,
      stderr: "",
    };
  }
}

async function main() {
  const outcome = await run();
  if (outcome.stdout) process.stdout.write(outcome.stdout);
  if (outcome.stderr) process.stderr.write(outcome.stderr);
  process.exitCode = outcome.exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) {
  main().catch(() => {
    process.stderr.write("CIC validation evidence: INVALID_EVIDENCE\n");
    process.exitCode = 3;
  });
}
