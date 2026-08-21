import type {
  RendererAssetFormat,
  RendererAssetLoadRequest,
  RendererFailureCategory,
} from "../contracts/public.js";
import type { RendererValidatedAssetSource } from "../assets/asset-port.js";

export type RendererAssetSourcePolicyResult =
  | { readonly accepted: true; readonly source: RendererValidatedAssetSource }
  | {
      readonly accepted: false;
      readonly category: Extract<
        RendererFailureCategory,
        "ASSET_LOAD_FAILED" | "UNSUPPORTED_DECODER"
      >;
      readonly detail: string;
    };

const unsupportedDecoders = [
  "EXT_meshopt_compression",
  "KHR_draco_mesh_compression",
  "KHR_texture_basisu",
] as const;
type UnsupportedDecoder = (typeof unsupportedDecoders)[number];
const glbJsonChunkType = 0x4e4f534a;

function rejected(
  detail: string,
  category: "ASSET_LOAD_FAILED" | "UNSUPPORTED_DECODER" = "ASSET_LOAD_FAILED",
): RendererAssetSourcePolicyResult {
  return { accepted: false, category, detail };
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function decodeJson(bytes: Uint8Array): unknown {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return JSON.parse(text) as unknown;
}

function parseGlb(bytes: Uint8Array): unknown {
  if (bytes.byteLength < 20) throw new Error("The GLB source is truncated.");
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(0, true) !== 0x46546c67) throw new Error("The GLB magic is invalid.");
  if (view.getUint32(4, true) !== 2) throw new Error("The GLB version is not 2.");
  if (view.getUint32(8, true) !== bytes.byteLength) {
    throw new Error("The GLB declared length does not match its copied source extent.");
  }
  const jsonLength = view.getUint32(12, true);
  const jsonType = view.getUint32(16, true);
  if (jsonLength === 0 || jsonType !== glbJsonChunkType || 20 + jsonLength > bytes.byteLength) {
    throw new Error("The GLB first JSON chunk is missing or invalid.");
  }
  let text = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(20, 20 + jsonLength));
  text = text.replace(/[\u0000 ]+$/u, "");
  if (text.length === 0) throw new Error("The GLB JSON chunk is empty.");
  return JSON.parse(text) as unknown;
}

function hasOwnExtension(value: unknown, extension: UnsupportedDecoder): boolean {
  if (!isRecord(value) || !isRecord(value.extensions)) return false;
  return Object.prototype.hasOwnProperty.call(value.extensions, extension);
}

function findUnsupportedDecoder(
  document: Readonly<Record<string, unknown>>,
): UnsupportedDecoder | null {
  if (Array.isArray(document.extensionsRequired)) {
    for (const decoder of unsupportedDecoders) {
      if (document.extensionsRequired.includes(decoder)) return decoder;
    }
  }

  if (Array.isArray(document.meshes)) {
    for (const mesh of document.meshes) {
      if (!isRecord(mesh) || !Array.isArray(mesh.primitives)) continue;
      for (const primitive of mesh.primitives) {
        if (hasOwnExtension(primitive, "KHR_draco_mesh_compression")) {
          return "KHR_draco_mesh_compression";
        }
      }
    }
  }

  if (Array.isArray(document.textures)) {
    for (const texture of document.textures) {
      if (hasOwnExtension(texture, "KHR_texture_basisu")) return "KHR_texture_basisu";
    }
  }

  if (Array.isArray(document.bufferViews)) {
    for (const bufferView of document.bufferViews) {
      if (hasOwnExtension(bufferView, "EXT_meshopt_compression")) {
        return "EXT_meshopt_compression";
      }
    }
  }

  return null;
}

function validateUriArray(
  document: Readonly<Record<string, unknown>>,
  key: "buffers" | "images",
  format: RendererAssetFormat,
): string | null {
  const values = document[key];
  if (values === undefined) return null;
  if (!Array.isArray(values)) return `${key} must be an array.`;
  const bufferViews = document.bufferViews;

  for (const value of values) {
    if (!isRecord(value)) return `${key} contains a malformed entry.`;
    if (value.uri !== undefined) {
      if (typeof value.uri !== "string" || !value.uri.startsWith("data:")) {
        return `${key} contains an external or non-data URI.`;
      }
      continue;
    }
    if (key === "buffers") {
      if (format !== "glb-2.0") return "A .gltf buffer is missing its self-contained data URI.";
      continue;
    }
    if (
      !Number.isSafeInteger(value.bufferView) ||
      !Array.isArray(bufferViews) ||
      (value.bufferView as number) < 0 ||
      (value.bufferView as number) >= bufferViews.length
    ) {
      return "An image without a data URI lacks a valid bufferView.";
    }
  }
  return null;
}

function validateDocument(
  document: unknown,
  format: RendererAssetFormat,
): RendererAssetSourcePolicyResult | null {
  if (!isRecord(document) || !isRecord(document.asset) || document.asset.version !== "2.0") {
    return rejected("The asset is malformed or is not exact glTF 2.0.");
  }

  const unsupported = findUnsupportedDecoder(document);
  if (unsupported !== null) {
    return rejected(
      `The asset requires unsupported decoder extension ${unsupported}.`,
      "UNSUPPORTED_DECODER",
    );
  }

  for (const key of ["buffers", "images"] as const) {
    const issue = validateUriArray(document, key, format);
    if (issue !== null) return rejected(issue);
  }
  return null;
}

export function validateRendererAssetSource(
  request: RendererAssetLoadRequest,
): RendererAssetSourcePolicyResult {
  try {
    if (
      typeof request !== "object" ||
      request === null ||
      typeof request.assetId !== "string" ||
      request.assetId.length === 0 ||
      typeof request.sourceRevision !== "string" ||
      request.sourceRevision.length === 0 ||
      (request.format !== "gltf-2.0" && request.format !== "glb-2.0") ||
      !(request.bytes instanceof Uint8Array) ||
      request.bytes.byteLength === 0
    ) {
      return rejected("The in-memory asset request is empty or malformed.");
    }

    const copiedBytes = new Uint8Array(request.bytes);
    const document =
      request.format === "gltf-2.0" ? decodeJson(copiedBytes) : parseGlb(copiedBytes);
    const issue = validateDocument(document, request.format);
    if (issue !== null) return issue;
    return {
      accepted: true,
      source: Object.freeze({ bytes: copiedBytes, format: request.format }),
    };
  } catch {
    return rejected("The in-memory glTF 2.0 source is malformed or truncated.");
  }
}
