import { createBabylonAssetContainerFactory } from "../src/assets/babylon-asset-container-factory.js";
import type { RendererValidatedAssetSource } from "../src/assets/asset-port.js";
import { validateRendererAssetSource } from "../src/loaders/gltf2-source-policy.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  readonly not: { toContain(expected: unknown): void };
  toBe(expected: unknown): void;
  toContain(expected: unknown): void;
  toEqual(expected: unknown): void;
};

interface ImportMetaWithGlob {
  glob<T>(
    pattern: string,
    options: { readonly eager: true; readonly import: "default"; readonly query: "?raw" },
  ): Readonly<Record<string, T>>;
}

const encode = (value: unknown): Uint8Array => new TextEncoder().encode(JSON.stringify(value));

function request(bytes: Uint8Array, format: "glb-2.0" | "gltf-2.0" = "gltf-2.0") {
  return { assetId: "asset", bytes, format, sourceRevision: "source" };
}

function glb(document: unknown): Uint8Array {
  const json = new TextEncoder().encode(JSON.stringify(document));
  const paddedLength = Math.ceil(json.byteLength / 4) * 4;
  const bytes = new Uint8Array(20 + paddedLength);
  bytes.fill(0x20, 20);
  bytes.set(json, 20);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, bytes.byteLength, true);
  view.setUint32(12, paddedLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  return bytes;
}

describe("RSM-6-I5 offline glTF2 source and loader policy", () => {
  it("accepts minimal inline self-contained glTF and GLB 2.0 with a defensive copy", () => {
    const gltfBytes = encode({
      asset: { version: "2.0" },
      buffers: [{ byteLength: 0, uri: "data:application/octet-stream;base64," }],
      scene: 0,
      scenes: [{}],
    });
    const gltfResult = validateRendererAssetSource(request(gltfBytes));
    expect(gltfResult.accepted).toBe(true);
    if (!gltfResult.accepted) throw new Error("Expected valid self-contained glTF.");
    expect(gltfResult.source.bytes === gltfBytes).toBe(false);
    const first = gltfResult.source.bytes[0];
    gltfBytes[0] = 0;
    expect(gltfResult.source.bytes[0]).toBe(first);

    const glbResult = validateRendererAssetSource(
      request(glb({ asset: { version: "2.0" }, scene: 0, scenes: [{}] }), "glb-2.0"),
    );
    expect(glbResult.accepted).toBe(true);
  });

  it("rejects malformed, empty, non-2.0, missing-buffer, and truncated inputs as ASSET_LOAD_FAILED", () => {
    const cases = [
      request(new Uint8Array()),
      request(new Uint8Array([0xff])),
      request(encode({ asset: { version: "1.0" } })),
      request(encode({ asset: { version: "2.0" }, buffers: [{ byteLength: 4 }] })),
      request(glb({ asset: { version: "2.0" } }).subarray(0, 19), "glb-2.0"),
    ];
    for (const candidate of cases) {
      const result = validateRendererAssetSource(candidate);
      expect(result.accepted).toBe(false);
      if (result.accepted) throw new Error("Expected source-policy rejection.");
      expect(result.category).toBe("ASSET_LOAD_FAILED");
    }
  });

  it("rejects every external URI before loader or outgoing-network authority", () => {
    const originalFetch = globalThis.fetch;
    let outgoingNetworkAttempts = 0;
    let loaderInvocations = 0;
    globalThis.fetch = () => {
      outgoingNetworkAttempts += 1;
      return Promise.reject(new Error("Network authority must never be reached."));
    };
    try {
      for (const uri of [
        "asset.bin",
        "/asset.bin",
        "//example.invalid/asset.bin",
        "http://example.invalid/asset.bin",
        "https://example.invalid/asset.bin",
        "file:///asset.bin",
        "blob:https://example.invalid/id",
      ]) {
        const result = validateRendererAssetSource(
          request(encode({ asset: { version: "2.0" }, buffers: [{ byteLength: 4, uri }] })),
        );
        if (result.accepted) loaderInvocations += 1;
        expect(result.accepted).toBe(false);
        if (result.accepted) throw new Error("Expected external URI rejection.");
        expect(result.category).toBe("ASSET_LOAD_FAILED");
      }
      expect(loaderInvocations).toBe(0);
      expect(outgoingNetworkAttempts).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rejects exact required and semantically active decoder extensions before loader authority", () => {
    const originalFetch = globalThis.fetch;
    let outgoingNetworkAttempts = 0;
    let loaderInvocations = 0;
    globalThis.fetch = () => {
      outgoingNetworkAttempts += 1;
      return Promise.reject(new Error("Network authority must never be reached."));
    };

    const documents = [
      ...["KHR_draco_mesh_compression", "KHR_texture_basisu", "EXT_meshopt_compression"].map(
        (extension) => ({ asset: { version: "2.0" }, extensionsRequired: [extension] }),
      ),
      {
        asset: { version: "2.0" },
        meshes: [{ primitives: [{ extensions: { KHR_draco_mesh_compression: {} } }] }],
      },
      {
        asset: { version: "2.0" },
        textures: [{ extensions: { KHR_texture_basisu: {} } }],
      },
      {
        asset: { version: "2.0" },
        bufferViews: [{ extensions: { EXT_meshopt_compression: {} } }],
      },
    ];

    try {
      for (const document of documents) {
        const result = validateRendererAssetSource(request(encode(document)));
        if (result.accepted) loaderInvocations += 1;
        expect(result.accepted).toBe(false);
        if (result.accepted) throw new Error("Expected unsupported decoder rejection.");
        expect(result.category).toBe("UNSUPPORTED_DECODER");
      }
      expect(loaderInvocations).toBe(0);
      expect(outgoingNetworkAttempts).toBe(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("accepts decoder-looking metadata and extensionsUsed-only declarations", () => {
    const documents = [
      {
        asset: { version: "2.0" },
        extras: {
          tags: ["KHR_draco_mesh_compression", "KHR_texture_basisu", "EXT_meshopt_compression"],
        },
      },
      {
        asset: { version: "2.0" },
        extras: {
          EXT_meshopt_compression: { note: "application metadata only" },
          KHR_draco_mesh_compression: true,
          KHR_texture_basisu: "metadata",
        },
      },
      {
        asset: { version: "2.0" },
        extensionsUsed: [
          "KHR_draco_mesh_compression",
          "KHR_texture_basisu",
          "EXT_meshopt_compression",
        ],
      },
    ];

    for (const document of documents) {
      const result = validateRendererAssetSource(request(encode(document)));
      expect(result.accepted).toBe(true);
    }
  });

  it("classifies exact Draco, Basis/KTX2, and Meshopt requirements as UNSUPPORTED_DECODER", () => {
    for (const extension of [
      "KHR_draco_mesh_compression",
      "KHR_texture_basisu",
      "EXT_meshopt_compression",
    ]) {
      const result = validateRendererAssetSource(
        request(encode({ asset: { version: "2.0" }, extensionsRequired: [extension] })),
      );
      expect(result.accepted).toBe(false);
      if (result.accepted) throw new Error("Expected unsupported decoder rejection.");
      expect(result.category).toBe("UNSUPPORTED_DECODER");
    }
  });

  it("wraps an injected deterministic AssetContainer without NullEngine or native public output", async () => {
    let observedSource: RendererValidatedAssetSource | null = null;
    const root = {
      dispose: () => undefined,
      getDescendants: () => [{ dispose: () => undefined, getTotalVertices: () => 3 }],
    };
    const factory = createBabylonAssetContainerFactory((_scene, source) => {
      observedSource = source;
      return Promise.resolve({
        dispose: () => undefined,
        instantiateModelsToScene: () => ({ rootNodes: [root] }),
        meshes: [{}, {}],
        textures: [{ getSize: () => ({ height: 4, width: 8 }) }],
      });
    });
    const validation = validateRendererAssetSource(
      request(encode({ asset: { version: "2.0" }, scene: 0, scenes: [{}] })),
    );
    if (!validation.accepted) throw new Error("Expected valid inline source.");
    const wrapped = await factory({}, validation.source);
    expect(observedSource).toBe(validation.source);
    expect(wrapped.loadedMeshCount).toBe(2);
    expect(wrapped.textureRgba8EquivalentBytes).toBe(128);
    expect(wrapped.instantiate().nativeHandles.length).toBe(2);
  });

  it("physically locks the sole exact registration module and production SceneLoader path", () => {
    const modules = (import.meta as unknown as ImportMetaWithGlob).glob<string>(
      "../src/{assets,loaders}/**/*.ts",
      { eager: true, import: "default", query: "?raw" },
    );
    const registration = modules["../src/loaders/gltf2-loader-registration.ts"] ?? "";
    const factory = modules["../src/assets/babylon-asset-container-factory.ts"] ?? "";
    expect(registration).toContain('import "@babylonjs/loaders/glTF/2.0";');
    expect(registration).not.toContain('import "@babylonjs/loaders";');
    expect(registration).not.toContain('import "@babylonjs/loaders/glTF";');
    expect(factory).toContain('import "../loaders/gltf2-loader-registration.js";');
    expect(factory).toContain("SceneLoader.LoadAssetContainerAsync");
    expect(factory).not.toContain("NullEngine");
    expect(Object.values(modules).join("\n")).not.toContain('from "babylonjs-gltf2interface"');
  });
});
