import { lstat, readFile, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { TextDecoder } from "node:util";
import { fileURLToPath } from "node:url";

import { canonicalJson } from "./lib/canonical-json.mjs";
import {
  compileContext,
  computeTaskMaterialFingerprint,
  serializeContextCompilation,
} from "./lib/context-compiler.mjs";
import { normalizeRepoRelativePath } from "./lib/identity.mjs";
import { verifyRepositoryIdentity } from "./lib/repository-identity.mjs";
import { verifySourceGeneration } from "./lib/source-generation.mjs";

const MODULE_PATH = fileURLToPath(import.meta.url);
const USAGE =
  "Usage: node tooling/cic/compile-context.mjs --json <repository-relative-request.json>\n";

function isInside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))
  );
}

async function resolveBoundedFile(repositoryRoot, relativePath) {
  const normalized = normalizeRepoRelativePath(relativePath);
  const root = await realpath(repositoryRoot);
  const candidate = path.resolve(root, ...normalized.split("/"));
  if (!isInside(root, candidate)) throw new RangeError("input escapes repository root");
  const candidateMetadata = await lstat(candidate);
  if (candidateMetadata.isSymbolicLink()) {
    throw new RangeError("input must not be a symbolic link");
  }
  const resolved = await realpath(candidate);
  const metadata = await lstat(resolved);
  if (!isInside(root, resolved) || !metadata.isFile()) {
    throw new RangeError("input must be a regular repository file");
  }
  return { normalized, resolved };
}

async function readRequest(repositoryRoot, relativePath) {
  const { resolved } = await resolveBoundedFile(repositoryRoot, relativePath);
  const bytes = await readFile(resolved);
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  const request = JSON.parse(text);
  if (request === null || typeof request !== "object" || Array.isArray(request)) {
    throw new TypeError("request must be an object");
  }
  return request;
}

async function readPhysicalMaterials(repositoryRoot, descriptors) {
  const materials = [];
  for (const descriptor of descriptors) {
    const { normalized, resolved } = await resolveBoundedFile(repositoryRoot, descriptor.path);
    const bytes = new Uint8Array(await readFile(resolved));
    let content = bytes;
    if (descriptor.encoding === "utf8") {
      content = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } else if (descriptor.encoding !== "binary") {
      throw new TypeError("material encoding must be utf8 or binary");
    }
    materials.push({ ...descriptor, path: normalized, content });
  }
  return materials;
}

async function physicalPrerequisites(repositoryRoot) {
  const [source, repository] = await Promise.all([
    verifySourceGeneration(repositoryRoot),
    verifyRepositoryIdentity(repositoryRoot),
  ]);
  return {
    sourceGeneration: { status: source.status, fingerprint: source.generationFingerprint },
    repository: {
      status: repository.status,
      repositoryIdentity: repository.repository.repositoryIdentity,
      snapshotFingerprint: repository.snapshotFingerprint,
      view: { complete: repository.view.complete, shallow: repository.view.shallow },
    },
    capabilities: {
      status: repository.capabilities.status,
      requiredStatus: repository.capabilities.status,
      capabilityFingerprint: repository.capabilities.capabilityFingerprint,
    },
  };
}

function blockedCliResult(code) {
  return {
    schemaVersion: "CIC_CONTEXT_COMPILATION_V1",
    status: "BLOCKED",
    active: false,
    contextGenerationIdentity: null,
    generation: { start: null, end: null, coherent: false },
    closure: { schemaVersion: "CIC_CONTEXT_CLOSURE_V1", status: "BLOCKED" },
    tiers: { tier0: null, tier1: [], tier2: [] },
    findings: [{ code }],
  };
}

export async function run(
  argv = process.argv.slice(2),
  repositoryRoot = process.cwd(),
  { request: injectedRequest, compilerOptions = {} } = {},
) {
  if (
    argv[0] !== "--json" ||
    (injectedRequest === undefined && argv.length !== 2) ||
    (injectedRequest !== undefined && argv.length !== 1)
  ) {
    return { exitCode: 64, stdout: "", stderr: USAGE };
  }

  try {
    const request =
      injectedRequest === undefined ? await readRequest(repositoryRoot, argv[1]) : injectedRequest;
    let compileRequest = request;
    let options = compilerOptions;
    if (injectedRequest === undefined) {
      const prerequisites = await physicalPrerequisites(repositoryRoot);
      compileRequest = { ...request, prerequisites };
      options = {
        ...compilerOptions,
        readMaterials: (materials) => readPhysicalMaterials(repositoryRoot, materials),
        observeGeneration: async () => {
          const [current, materials] = await Promise.all([
            physicalPrerequisites(repositoryRoot),
            readPhysicalMaterials(repositoryRoot, request.materials ?? []),
          ]);
          return {
            authorityIdentity: request.authority?.identity,
            sourceGenerationFingerprint: current.sourceGeneration.fingerprint,
            repositoryIdentity: current.repository.repositoryIdentity,
            repositorySnapshotIdentity: current.repository.snapshotFingerprint,
            capabilityFingerprint: current.capabilities.capabilityFingerprint,
            taskMaterialFingerprint: computeTaskMaterialFingerprint(request, materials),
            movement: "STABLE",
          };
        },
      };
    }
    const result = await compileContext(compileRequest, options);
    return {
      exitCode: result.status === "VERIFIED" ? 0 : 2,
      stdout: serializeContextCompilation(result),
      stderr: "",
    };
  } catch {
    return {
      exitCode: 2,
      stdout: `${canonicalJson(blockedCliResult("CONTEXT_INPUT_READ_FAILED"))}\n`,
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
    process.stdout.write(`${canonicalJson(blockedCliResult("CONTEXT_COMPILER_FAILED"))}\n`);
    process.exitCode = 2;
  });
}
