import { createHash } from "node:crypto";

function asHashInput(value) {
  if (typeof value === "string" || value instanceof Uint8Array) return value;
  throw new TypeError("identity input must be a string or Uint8Array");
}

export function sha256Hex(value) {
  const input = asHashInput(value);
  const hash = createHash("sha256");
  if (typeof input === "string") hash.update(input, "utf8");
  else hash.update(input);
  return hash.digest("hex").toUpperCase();
}

export function gitBlobSha1(value) {
  if (!(value instanceof Uint8Array)) {
    throw new TypeError("Git blob input must be a Uint8Array");
  }
  return createHash("sha1")
    .update(`blob ${value.byteLength}\0`, "utf8")
    .update(value)
    .digest("hex");
}

export function normalizeRepoRelativePath(value) {
  if (typeof value !== "string") throw new TypeError("repository path must be a string");

  const normalized = value
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "")
    .replace(/\/{2,}/gu, "/");
  const segments = normalized.split("/");

  if (
    normalized.length === 0 ||
    normalized.startsWith("/") ||
    /^[A-Za-z]:\//u.test(normalized) ||
    segments.includes("..")
  ) {
    throw new RangeError("repository path must be a non-empty relative path");
  }

  const identity = segments.filter((segment) => segment !== "." && segment !== "").join("/");
  if (identity.length === 0) {
    throw new RangeError("repository path must be a non-empty relative path");
  }
  return identity;
}
