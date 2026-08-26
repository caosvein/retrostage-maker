import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { gitBlobSha1, sha256Hex } from "./identity.mjs";
import {
  EXPECTED_SOURCE_IDS,
  EXPECTED_SOURCE_LAYOUT,
  parseSourceManifest,
  sortFindings,
  SOURCE_MANIFEST_PATH,
} from "./source-manifest.mjs";

const SOURCE_ROOT_PATH = "docs/sources";
const CANONICAL_SOURCE_PATTERN = /^\d{2}_RSM_REBOOT_[A-Z0-9_]+\.md$/u;

function finding(code, relativePath, detail) {
  return { code, path: relativePath, detail };
}

function causeCode(error) {
  return typeof error === "object" && error !== null && typeof error.code === "string"
    ? error.code
    : "UNAVAILABLE";
}

function generationFingerprint(manifestSha256, rows) {
  const encoded = [
    "CIC-SOURCE-GENERATION-V1",
    `manifest_sha256=${manifestSha256}`,
    ...rows.map(
      ({ sourceId, filename, sha256, status }) => `${sourceId}\t${filename}\t${sha256}\t${status}`,
    ),
    "",
  ].join("\n");
  return sha256Hex(encoded);
}

function unknownSourceRows() {
  return EXPECTED_SOURCE_IDS.map((sourceId) => ({
    sourceId,
    filename: EXPECTED_SOURCE_LAYOUT[sourceId],
    state: "UNKNOWN",
    bytes: null,
    sha256: null,
    expectedSha256: null,
    gitBlobSha1: null,
  }));
}

function entryKind(record) {
  if (record.isFile()) return "file";
  if (record.isDirectory()) return "directory";
  if (record.isSymbolicLink()) return "symbolic-link";
  if (record.isBlockDevice()) return "block-device";
  if (record.isCharacterDevice()) return "character-device";
  if (record.isFIFO()) return "fifo";
  if (record.isSocket()) return "socket";
  return "unknown";
}

function completeObservation(result, inventoryRecords = []) {
  const witness = {
    status: result.status,
    manifest: result.manifest,
    inventory: {
      state: result.inventory.state,
      complete: result.inventory.complete,
      entries: inventoryRecords
        .map((record) => ({ name: record.name, kind: entryKind(record) }))
        .sort((left, right) => (left.name < right.name ? -1 : left.name > right.name ? 1 : 0)),
    },
    sources: result.sources,
    errors: result.errors,
  };
  return { result, witness };
}

export async function observeSourceGeneration(repositoryRoot) {
  const sourceRoot = path.join(repositoryRoot, "docs", "sources");
  const manifestAbsolutePath = path.join(sourceRoot, "SOURCE-MANIFEST.tsv");
  const errors = [];
  let inventoryEntries = [];
  let inventoryRecords = [];
  let inventoryState = "UNKNOWN";
  let inventoryComplete = false;

  try {
    inventoryRecords = await readdir(sourceRoot, { withFileTypes: true });
    inventoryEntries = inventoryRecords.map(({ name }) => name).sort();
    inventoryState = "PRESENT";
    inventoryComplete = true;
  } catch (error) {
    errors.push(finding("SOURCE_ROOT_UNAVAILABLE", SOURCE_ROOT_PATH, `cause=${causeCode(error)}`));
    errors.push(finding("SOURCE_INVENTORY_UNKNOWN", SOURCE_ROOT_PATH, `cause=${causeCode(error)}`));
  }

  if (!inventoryComplete) {
    return completeObservation({
      schemaVersion: "CIC_SOURCE_GENERATION_V1",
      status: "BLOCKED",
      generationFingerprint: null,
      manifest: {
        path: SOURCE_MANIFEST_PATH,
        state: "UNKNOWN",
        bytes: null,
        sha256: null,
      },
      inventory: {
        path: SOURCE_ROOT_PATH,
        state: inventoryState,
        complete: false,
        entries: [],
      },
      sources: unknownSourceRows(),
      errors: sortFindings(errors),
    });
  }

  for (const record of inventoryRecords) {
    if (
      CANONICAL_SOURCE_PATTERN.test(record.name) &&
      !Object.values(EXPECTED_SOURCE_LAYOUT).includes(record.name)
    ) {
      errors.push(
        finding(
          "SOURCE_UNEXPECTED_CANONICAL_FILE",
          `${SOURCE_ROOT_PATH}/${record.name}`,
          `entry-kind=${entryKind(record)}`,
        ),
      );
    }
  }

  let manifestBytes = null;
  const manifestInventoryRecord = inventoryRecords.find(
    ({ name }) => name === "SOURCE-MANIFEST.tsv",
  );
  let manifestState = manifestInventoryRecord === undefined ? "ABSENT_PROVEN" : "UNKNOWN";
  let parsedManifest = null;

  if (manifestState === "ABSENT_PROVEN") {
    errors.push(finding("SOURCE_MANIFEST_MISSING", SOURCE_MANIFEST_PATH, "absence-proven"));
  } else if (!manifestInventoryRecord.isFile()) {
    errors.push(
      finding(
        "SOURCE_MANIFEST_UNAVAILABLE",
        SOURCE_MANIFEST_PATH,
        `entry-kind=${entryKind(manifestInventoryRecord)}`,
      ),
    );
  } else {
    try {
      manifestBytes = await readFile(manifestAbsolutePath);
      manifestState = "PRESENT";
      try {
        parsedManifest = parseSourceManifest(manifestBytes.toString("utf8"));
        errors.push(...parsedManifest.errors);
      } catch (error) {
        errors.push(
          finding(
            "SOURCE_MANIFEST_SCHEMA_MISMATCH",
            SOURCE_MANIFEST_PATH,
            `decode=${causeCode(error)}`,
          ),
        );
      }
    } catch (error) {
      errors.push(
        finding("SOURCE_MANIFEST_UNAVAILABLE", SOURCE_MANIFEST_PATH, `read=${causeCode(error)}`),
      );
    }
  }

  const manifestRowsById = new Map();
  for (const row of parsedManifest?.rows ?? []) {
    if (!manifestRowsById.has(row.sourceId)) manifestRowsById.set(row.sourceId, row);
  }

  const inventoryByName = new Map(inventoryRecords.map((record) => [record.name, record]));
  const sources = [];
  for (const sourceId of EXPECTED_SOURCE_IDS) {
    const filename = EXPECTED_SOURCE_LAYOUT[sourceId];
    const relativePath = `${SOURCE_ROOT_PATH}/${filename}`;
    const manifestRow = manifestRowsById.get(sourceId);
    const inventoryRecord = inventoryByName.get(filename);

    if (inventoryRecord === undefined) {
      errors.push(finding("SOURCE_FILE_MISSING", relativePath, "absence-proven"));
      sources.push({
        sourceId,
        filename,
        state: "ABSENT_PROVEN",
        bytes: null,
        sha256: null,
        expectedSha256: manifestRow?.sha256 ?? null,
        gitBlobSha1: null,
      });
      continue;
    }

    if (!inventoryRecord.isFile()) {
      errors.push(
        finding(
          "SOURCE_FILE_UNAVAILABLE",
          relativePath,
          `entry-kind=${entryKind(inventoryRecord)}`,
        ),
      );
      sources.push({
        sourceId,
        filename,
        state: "UNKNOWN",
        bytes: null,
        sha256: null,
        expectedSha256: manifestRow?.sha256 ?? null,
        gitBlobSha1: null,
      });
      continue;
    }

    try {
      const bytes = await readFile(path.join(sourceRoot, filename));
      const observedSha256 = sha256Hex(bytes);
      if (manifestRow !== undefined && observedSha256 !== manifestRow.sha256) {
        errors.push(
          finding(
            "SOURCE_FILE_HASH_MISMATCH",
            relativePath,
            `expected=${manifestRow.sha256};observed=${observedSha256}`,
          ),
        );
      }
      sources.push({
        sourceId,
        filename,
        state: "PRESENT",
        bytes: bytes.byteLength,
        sha256: observedSha256,
        expectedSha256: manifestRow?.sha256 ?? null,
        gitBlobSha1: gitBlobSha1(bytes),
      });
    } catch (error) {
      errors.push(finding("SOURCE_FILE_UNAVAILABLE", relativePath, `read=${causeCode(error)}`));
      sources.push({
        sourceId,
        filename,
        state: "UNKNOWN",
        bytes: null,
        sha256: null,
        expectedSha256: manifestRow?.sha256 ?? null,
        gitBlobSha1: null,
      });
    }
  }

  const sortedErrors = sortFindings(errors);
  const manifestSha256 = manifestBytes === null ? null : sha256Hex(manifestBytes);
  const proofComplete =
    sortedErrors.length === 0 &&
    manifestState === "PRESENT" &&
    parsedManifest !== null &&
    sources.every(({ state }) => state === "PRESENT");

  return completeObservation(
    {
      schemaVersion: "CIC_SOURCE_GENERATION_V1",
      status: proofComplete ? "PASS" : "BLOCKED",
      generationFingerprint: proofComplete
        ? generationFingerprint(manifestSha256, parsedManifest.rows)
        : null,
      manifest: {
        path: SOURCE_MANIFEST_PATH,
        state: manifestState,
        bytes: manifestBytes?.byteLength ?? null,
        sha256: manifestSha256,
      },
      inventory: {
        path: SOURCE_ROOT_PATH,
        state: inventoryState,
        complete: inventoryComplete,
        entries: inventoryEntries,
      },
      sources,
      errors: sortedErrors,
    },
    inventoryRecords,
  );
}

export async function verifySourceGeneration(
  repositoryRoot,
  observationProvider = observeSourceGeneration,
) {
  const start = await observationProvider(repositoryRoot);
  const end = await observationProvider(repositoryRoot);
  const startIdentity = sha256Hex(JSON.stringify(start.witness));
  const endIdentity = sha256Hex(JSON.stringify(end.witness));

  if (startIdentity !== endIdentity) {
    return {
      ...end.result,
      status: "BLOCKED",
      generationFingerprint: null,
      errors: sortFindings([
        ...end.result.errors,
        finding(
          "SOURCE_GENERATION_RACE",
          SOURCE_ROOT_PATH,
          `start=${startIdentity};end=${endIdentity}`,
        ),
      ]),
    };
  }

  if (start.result.status !== "PASS" || end.result.status !== "PASS") {
    return end.result;
  }

  return end.result;
}
