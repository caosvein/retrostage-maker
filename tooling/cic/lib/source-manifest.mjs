export const SOURCE_MANIFEST_PATH = "docs/sources/SOURCE-MANIFEST.tsv";

export const EXPECTED_SOURCE_LAYOUT = Object.freeze({
  "00": "00_RSM_REBOOT_PROJECT_CHARTER.md",
  "01": "01_RSM_REBOOT_CANONICAL_ROADMAP.md",
  "02": "02_RSM_REBOOT_CURRENT_PROJECT_STATE.md",
  "03": "03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md",
  "04": "04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md",
  "05": "05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md",
  "06": "06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md",
  "07": "07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md",
  "08": "08_RSM_REBOOT_CURRENT_MILESTONE.md",
  "09": "09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md",
});

export const EXPECTED_SOURCE_IDS = Object.freeze(Object.keys(EXPECTED_SOURCE_LAYOUT));

const EXPECTED_HEADER = "source_id\tfilename\tsha256\tstatus";
const SHA256_PATTERN = /^[0-9A-Fa-f]{64}$/u;

function finding(code, detail) {
  return { code, path: SOURCE_MANIFEST_PATH, detail };
}

export function sortFindings(findings) {
  return [...findings].sort((left, right) => {
    const leftKey = `${left.code}\u0000${left.path}\u0000${left.detail}`;
    const rightKey = `${right.code}\u0000${right.path}\u0000${right.detail}`;
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  });
}

export function parseSourceManifest(value) {
  if (typeof value !== "string") throw new TypeError("manifest input must be UTF-8 text");
  const lines = value.replaceAll("\r\n", "\n").split("\n");
  if (lines.at(-1) === "") lines.pop();

  const errors = [];
  const header = lines.shift() ?? "";
  if (header !== EXPECTED_HEADER) {
    errors.push(finding("SOURCE_MANIFEST_SCHEMA_MISMATCH", `header=${header || "EMPTY"}`));
  }

  const rows = [];
  const seenIds = new Set();
  const seenFilenames = new Set();

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 2;
    const columns = lines[index].split("\t");
    if (columns.length !== 4) {
      errors.push(
        finding("SOURCE_MANIFEST_SCHEMA_MISMATCH", `line=${lineNumber};columns=${columns.length}`),
      );
    }

    const [sourceId = "", filename = "", sha256 = "", status = ""] = columns;
    const normalizedSha256 = SHA256_PATTERN.test(sha256) ? sha256.toUpperCase() : sha256;
    const row = { sourceId, filename, sha256: normalizedSha256, status };
    rows.push(row);

    if (seenIds.has(sourceId)) {
      errors.push(finding("SOURCE_MANIFEST_DUPLICATE_ID", `source_id=${sourceId}`));
    }
    seenIds.add(sourceId);

    if (seenFilenames.has(filename)) {
      errors.push(finding("SOURCE_MANIFEST_DUPLICATE_FILENAME", `filename=${filename}`));
    }
    seenFilenames.add(filename);

    const expectedFilename = EXPECTED_SOURCE_LAYOUT[sourceId];
    if (expectedFilename !== undefined && filename !== expectedFilename) {
      errors.push(
        finding(
          "SOURCE_MANIFEST_SCHEMA_MISMATCH",
          `source_id=${sourceId};filename=${filename};expected=${expectedFilename}`,
        ),
      );
    } else if (
      expectedFilename === undefined &&
      !/^\d{2}_RSM_REBOOT_[A-Z0-9_]+\.md$/u.test(filename)
    ) {
      errors.push(
        finding("SOURCE_MANIFEST_SCHEMA_MISMATCH", `source_id=${sourceId};filename=${filename}`),
      );
    }

    if (!SHA256_PATTERN.test(sha256)) {
      errors.push(
        finding("SOURCE_MANIFEST_SCHEMA_MISMATCH", `source_id=${sourceId};sha256=INVALID`),
      );
    }
    if (status !== "CURRENT") {
      errors.push(
        finding("SOURCE_STATUS_NOT_CURRENT", `source_id=${sourceId};status=${status || "EMPTY"}`),
      );
    }
  }

  const observedIds = [...new Set(rows.map(({ sourceId }) => sourceId))].sort();
  if (
    rows.length !== EXPECTED_SOURCE_IDS.length ||
    JSON.stringify(observedIds) !== JSON.stringify(EXPECTED_SOURCE_IDS)
  ) {
    errors.push(
      finding(
        "SOURCE_MANIFEST_ROWSET_MISMATCH",
        `rows=${rows.length};ids=${observedIds.join(",") || "EMPTY"}`,
      ),
    );
  }

  return {
    schemaVersion: "CIC_SOURCE_MANIFEST_V1",
    rows: rows.sort((left, right) => {
      const leftKey = `${left.sourceId}\u0000${left.filename}`;
      const rightKey = `${right.sourceId}\u0000${right.filename}`;
      return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
    }),
    errors: sortFindings(errors),
  };
}
