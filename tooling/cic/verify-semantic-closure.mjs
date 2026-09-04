#!/usr/bin/env node
import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

import { canonicalJson } from "./lib/canonical-json.mjs";
import { normalizeRepoRelativePath, sha256Hex } from "./lib/identity.mjs";
import { serializeSemanticClosureResult, verifySemanticClosure } from "./lib/semantic-closure.mjs";

const MODULE_PATH = fileURLToPath(import.meta.url);
const USAGE =
  "node tooling/cic/verify-semantic-closure.mjs --json <repository-relative-request.json>";

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

function cliResult(status, code) {
  const body = {
    schemaVersion: "CIC_SEMANTIC_CLOSURE_CLI_RESULT_V1",
    status,
    reasonCode: code,
    usage: status === "USAGE_ERROR" ? USAGE : null,
    mutationAuthorization: false,
  };
  return {
    ...body,
    resultIdentity: sha256Hex(`CIC-I5-C-SEMANTIC-CLOSURE-CLI-RESULT-V1\n${canonicalJson(body)}\n`),
  };
}

async function readRequest(repositoryRoot, relativePath) {
  const normalized = normalizeRepoRelativePath(relativePath);
  const root = await realpath(repositoryRoot);
  const candidate = path.resolve(root, ...normalized.split("/"));
  if (!isInside(root, candidate)) throw Object.assign(new Error(), { code: "CLI_PATH_ESCAPE" });
  let cursor = root;
  for (const segment of normalized.split("/")) {
    cursor = path.join(cursor, segment);
    const segmentMetadata = await lstat(cursor);
    if (segmentMetadata.isSymbolicLink()) {
      throw Object.assign(new Error(), { code: "CLI_REQUEST_NOT_REGULAR" });
    }
  }
  const candidateMetadata = await lstat(candidate);
  if (candidateMetadata.isSymbolicLink() || !candidateMetadata.isFile()) {
    throw Object.assign(new Error(), { code: "CLI_REQUEST_NOT_REGULAR" });
  }
  const resolved = await realpath(candidate);
  const metadata = await lstat(resolved);
  if (!isInside(root, resolved) || !metadata.isFile() || metadata.isSymbolicLink()) {
    throw Object.assign(new Error(), { code: "CLI_REQUEST_NOT_REGULAR" });
  }
  const bytes = await readFile(resolved);
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw Object.assign(new Error(), { code: "CLI_REQUEST_INVALID_UTF8" });
  }
  let request;
  try {
    request = JSON.parse(text);
  } catch {
    throw Object.assign(new Error(), { code: "CLI_REQUEST_INVALID_JSON" });
  }
  if (request === null || typeof request !== "object" || Array.isArray(request)) {
    throw Object.assign(new Error(), { code: "CLI_REQUEST_INVALID_JSON" });
  }
  return request;
}

export async function run(
  argv = process.argv.slice(2),
  repositoryRoot = process.cwd(),
  { request: injectedRequest } = {},
) {
  const validArguments =
    argv[0] === "--json" &&
    ((injectedRequest === undefined && argv.length === 2) ||
      (injectedRequest !== undefined && argv.length === 1));
  if (!validArguments) {
    return {
      exitCode: 64,
      stdout: `${canonicalJson(cliResult("USAGE_ERROR", "CLI_USAGE_INVALID"))}\n`,
      stderr: "",
    };
  }
  try {
    const request =
      injectedRequest === undefined ? await readRequest(repositoryRoot, argv[1]) : injectedRequest;
    const result = await verifySemanticClosure(request);
    return {
      exitCode: result.status === "PASS" ? 0 : 2,
      stdout: serializeSemanticClosureResult(result),
      stderr: "",
    };
  } catch (error) {
    return {
      exitCode: 2,
      stdout: `${canonicalJson(cliResult("BLOCKED", error?.code ?? "CLI_REQUEST_READ_FAILED"))}\n`,
      stderr: "",
    };
  }
}

async function main() {
  const outcome = await run();
  process.stdout.write(outcome.stdout);
  process.exitCode = outcome.exitCode;
}

if (process.argv[1] && path.resolve(process.argv[1]) === MODULE_PATH) {
  main().catch(() => {
    process.stdout.write(`${canonicalJson(cliResult("BLOCKED", "SEMANTIC_CLOSURE_CLI_FAILED"))}\n`);
    process.exitCode = 2;
  });
}
