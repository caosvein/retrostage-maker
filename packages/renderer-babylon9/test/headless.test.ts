import { createHeadlessRendererAdapter, type RendererProjectionRevision } from "../src/headless.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void>) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

const revision = (value: string): RendererProjectionRevision => value as RendererProjectionRevision;

function projection(value: string, stableIds: readonly string[]) {
  return {
    content: {},
    resources: [],
    revision: revision(value),
    stableIds,
  };
}

function inlineTransformGlb(): Uint8Array {
  const json = new TextEncoder().encode(
    JSON.stringify({
      asset: { version: "2.0" },
      nodes: [{ name: "inline-transform" }],
      scene: 0,
      scenes: [{ nodes: [0] }],
    }),
  );
  const paddedLength = Math.ceil(json.byteLength / 4) * 4;
  const bytes = new Uint8Array(20 + paddedLength);
  bytes.fill(0x20, 20);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, bytes.byteLength, true);
  view.setUint32(12, paddedLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  bytes.set(json, 20);
  return bytes;
}

describe("RSM-6-I6 public headless conformance", () => {
  it("runs deterministically in pure Node and renders only through explicit public calls", async () => {
    expect(typeof globalThis.window).toBe("undefined");
    expect(typeof globalThis.document).toBe("undefined");
    expect(typeof globalThis.HTMLCanvasElement).toBe("undefined");
    expect(typeof globalThis.WebGLRenderingContext).toBe("undefined");
    expect(typeof globalThis.GPU).toBe("undefined");

    const adapter = await createHeadlessRendererAdapter();
    expect(adapter.lifecycleState).toBe("READY");
    expect(adapter.captureDiagnosticSnapshot().resourceCounts).toEqual({ engine: 1, scene: 1 });
    expect(adapter.captureDiagnosticSnapshot().contextState).toBe("available");
    expect((await adapter.project(projection("headless-1", ["headless-target"]))).status).toBe(
      "accepted-current",
    );
    expect((await adapter.start()).accepted).toBe(true);
    expect(adapter.lifecycleState).toBe("RUNNING");

    const before = adapter.captureDiagnosticSnapshot().timing.sampleCount;
    await Promise.resolve();
    await Promise.resolve();
    expect(adapter.captureDiagnosticSnapshot().timing.sampleCount).toBe(before);
    expect(adapter.render().accepted).toBe(true);
    expect(adapter.captureDiagnosticSnapshot().timing.sampleCount).toBe(before + 1);
    expect(adapter.resetView().accepted).toBe(true);
    expect(
      adapter.setCameraProjection({
        alphaRadians: 0.5,
        betaRadians: 1,
        farClip: 500,
        nearClip: 0.1,
        radius: 10,
        target: { x: 1, y: 2, z: 3 },
        verticalFieldOfViewRadians: 0.8,
      }).accepted,
    ).toBe(true);

    expect(await adapter.dispose()).toEqual([]);
    expect(adapter.lifecycleState).toBe("DISPOSED");
    const terminal = adapter.captureDiagnosticSnapshot();
    expect(terminal.resourceCounts).toEqual({ engine: 0, scene: 0 });
    expect(adapter.captureDiagnosticSnapshot()).toEqual(terminal);
  });

  it("keeps multiple headless Engine, Scene, registry, and asset domains independent", async () => {
    const first = await createHeadlessRendererAdapter();
    const second = await createHeadlessRendererAdapter();
    expect((await first.project(projection("same-revision", ["same-id"]))).status).toBe(
      "accepted-current",
    );
    expect((await second.project(projection("same-revision", ["same-id"]))).status).toBe(
      "accepted-current",
    );
    expect((await first.start()).accepted).toBe(true);
    expect(first.render().accepted).toBe(true);
    expect(first.captureDiagnosticSnapshot().timing.sampleCount).toBe(1);
    expect(second.captureDiagnosticSnapshot().timing.sampleCount).toBe(0);
    expect(await first.dispose()).toEqual([]);
    expect(second.lifecycleState).toBe("READY");
    expect(second.captureDiagnosticSnapshot().resourceCounts).toEqual({ engine: 1, scene: 1 });
    expect(await second.dispose()).toEqual([]);
  });

  it("runs the real admitted inline glTF AssetContainer path on a real NullEngine", async () => {
    const adapter = await createHeadlessRendererAdapter();
    expect((await adapter.project(projection("asset-revision", ["inline-stable-id"]))).status).toBe(
      "accepted-current",
    );
    const load = await adapter.loadAssetContainer({
      assetId: "inline-asset",
      bytes: inlineTransformGlb(),
      format: "glb-2.0",
      sourceRevision: "inline-source-1",
    });
    if (!load.accepted) {
      throw new Error(
        [load.failure.detail, load.failure.cause?.summary, load.failure.messageId]
          .filter(Boolean)
          .join(" | "),
      );
    }
    expect(adapter.captureDiagnosticSnapshot().assets.liveContainerCount).toBe(1);
    expect(
      adapter.instantiateAsset({
        assetId: "inline-asset",
        sourceRevision: "inline-source-1",
        stableId: "inline-stable-id",
      }).accepted,
    ).toBe(true);
    expect(adapter.captureDiagnosticSnapshot().assets.liveInstanceCount).toBe(1);
    expect(adapter.disposeAssetContainer({ assetId: "inline-asset" }).accepted).toBe(true);
    expect(adapter.captureDiagnosticSnapshot().assets).toEqual({
      estimatedTextureRgba8EquivalentBytes: 0,
      inFlightLoadCount: 0,
      liveContainerCount: 0,
      liveInstanceCount: 0,
      loadedMeshCount: 0,
    });
    expect(await adapter.dispose()).toEqual([]);
  });
});
