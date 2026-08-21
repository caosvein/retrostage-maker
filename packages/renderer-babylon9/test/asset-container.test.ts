import {
  createRendererHostSurfaceCapability,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import type {
  RendererAssetContainerFactory,
  RendererAssetContainerPort,
  RendererAssetInstancePort,
} from "../src/assets/asset-port.js";
import {
  createRendererAdapterForTests,
  resolveRendererHandleBridge,
} from "../src/engine/renderer-adapter.js";
import { createRendererEditorViewportControlsForTests } from "../src/grid/grid-controller.js";
import type { RendererGridFactory } from "../src/grid/grid-port.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void>) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

const revision = (value: string): RendererProjectionRevision => value as RendererProjectionRevision;
const validBytes = new TextEncoder().encode(
  JSON.stringify({ asset: { version: "2.0" }, scene: 0, scenes: [{}] }),
);

function host(): RendererHostSurface {
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: () => () => undefined,
    observeResize: () => () => undefined,
    resolveNativeSurface: () => ({}),
  };
  return {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation: 1,
    identity: "asset-host",
    logicalExtent: { height: 600, width: 800 },
    pixelExtent: { height: 600, width: 800 },
  };
}

function loadRequest(sourceRevision: string) {
  return {
    assetId: " asset-id ",
    bytes: validBytes,
    format: "gltf-2.0" as const,
    sourceRevision,
  };
}

function instance(
  handles: readonly object[],
  events: string[],
  name: string,
  throws = false,
): RendererAssetInstancePort {
  return {
    meshCount: handles.length,
    nativeHandles: handles,
    dispose: () => {
      events.push(`${name}-dispose`);
      if (throws) throw new Error(`${name} disposal failed`);
    },
  };
}

function container(
  instances: RendererAssetInstancePort[],
  events: string[],
  name: string,
  options: {
    readonly loadedMeshCount?: number;
    readonly textureBytes?: number;
    readonly throws?: boolean;
  } = {},
): RendererAssetContainerPort {
  return {
    loadedMeshCount: options.loadedMeshCount ?? 2,
    textureRgba8EquivalentBytes: options.textureBytes ?? 64,
    dispose: () => {
      events.push(`${name}-dispose`);
      if (options.throws === true) throw new Error(`${name} disposal failed`);
    },
    instantiate: () => {
      const next = instances.shift();
      if (next === undefined) throw new Error("No inline candidate instance remains.");
      return next;
    },
  };
}

function harness(factory: RendererAssetContainerFactory, events: string[] = []) {
  let pickHandle: object | null = null;
  const intents: string[] = [];
  const callbacks = new Set<() => void>();
  const adapter = createRendererAdapterForTests({
    assetFactory: factory,
    cameraFactory: () => ({
      dispose: () => events.push("camera-dispose"),
      setProjection: () => undefined,
    }),
    engineFactory: () => ({
      nativeHandle: {},
      dispose: () => events.push("engine-dispose"),
      getFps: () => 60,
      resize: () => undefined,
      runRenderLoop: (callback) => callbacks.add(callback),
      stopRenderLoop: (callback) => callbacks.delete(callback),
    }),
    pickingFactory: () =>
      pickHandle === null
        ? { hitClass: "background" }
        : { distance: 1, handle: pickHandle, hitClass: "target", worldPoint: null },
    sceneFactory: () => ({
      dispose: () => events.push("scene-dispose"),
      nativeHandle: {},
      render: () => undefined,
    }),
  });
  adapter.onPickIntent((intent) => {
    if (intent.targetId !== null) intents.push(intent.targetId);
  });
  return {
    adapter,
    intents,
    setPickHandle: (handle: object | null) => {
      pickHandle = handle;
    },
  };
}

async function initialize(
  result: ReturnType<typeof harness>,
  stableIds: readonly string[] = [" instance-a ", "instance-b", "occupied"],
): Promise<void> {
  await result.adapter.initialize(host());
  await result.adapter.project({
    content: {},
    resources: [],
    revision: revision("asset-projection"),
    stableIds,
  });
}

describe("RSM-6-I5 AssetContainer lifecycle", () => {
  it("loads, deduplicates, instantiates every handle under one exact caller stableId, and replaces atomically", async () => {
    const events: string[] = [];
    const firstA = {};
    const firstB = {};
    const secondHandle = {};
    const first = container(
      [
        instance([firstA, firstB], events, "instance-a"),
        instance([secondHandle], events, "instance-b"),
      ],
      events,
      "container-v1",
      { loadedMeshCount: 3, textureBytes: 128 },
    );
    const replacement = container([], events, "container-v2", {
      loadedMeshCount: 5,
      textureBytes: 256,
    });
    const queue = [first, replacement];
    let factoryCalls = 0;
    const result = harness(() => {
      factoryCalls += 1;
      const next = queue.shift();
      if (next === undefined) throw new Error("No inline AssetContainer remains.");
      return Promise.resolve(next);
    }, events);
    await initialize(result);

    expect((await result.adapter.loadAssetContainer(loadRequest("source-v1"))).accepted).toBe(true);
    expect((await result.adapter.loadAssetContainer(loadRequest("source-v1"))).accepted).toBe(true);
    expect(factoryCalls).toBe(1);
    expect(result.adapter.captureDiagnosticSnapshot().assets).toEqual({
      estimatedTextureRgba8EquivalentBytes: 128,
      inFlightLoadCount: 0,
      liveContainerCount: 1,
      liveInstanceCount: 0,
      loadedMeshCount: 3,
    });

    expect(
      result.adapter.instantiateAsset({
        assetId: " asset-id ",
        sourceRevision: "source-v1",
        stableId: " instance-a ",
      }).accepted,
    ).toBe(true);
    expect(
      result.adapter.instantiateAsset({
        assetId: " asset-id ",
        sourceRevision: "source-v1",
        stableId: " instance-a ",
      }).accepted,
    ).toBe(true);
    expect(
      result.adapter.instantiateAsset({
        assetId: " asset-id ",
        sourceRevision: "source-v1",
        stableId: "instance-b",
      }).accepted,
    ).toBe(true);
    expect(result.adapter.captureDiagnosticSnapshot().assets.liveInstanceCount).toBe(2);

    await result.adapter.start();
    for (const handle of [firstA, firstB]) {
      result.setPickHandle(handle);
      expect(
        result.adapter.pick({
          correlationId: "asset-pick",
          modifiers: { alt: false, control: false, meta: false, shift: false },
          normalizedPosition: { x: 0.5, y: 0.5 },
        }).accepted,
      ).toBe(true);
    }
    expect(result.intents).toEqual([" instance-a ", " instance-a "]);

    expect((await result.adapter.loadAssetContainer(loadRequest("source-v2"))).accepted).toBe(true);
    expect(events).toEqual(["instance-a-dispose", "instance-b-dispose", "container-v1-dispose"]);
    expect(result.adapter.captureDiagnosticSnapshot().assets).toEqual({
      estimatedTextureRgba8EquivalentBytes: 256,
      inFlightLoadCount: 0,
      liveContainerCount: 1,
      liveInstanceCount: 0,
      loadedMeshCount: 5,
    });
    expect(result.adapter.disposeAssetContainer({ assetId: " asset-id " }).accepted).toBe(true);
    expect(result.adapter.disposeAssetContainer({ assetId: " asset-id " }).accepted).toBe(true);
    expect(events.at(-1)).toBe("container-v2-dispose");
    expect(result.adapter.captureDiagnosticSnapshot().assets.liveContainerCount).toBe(0);
  });

  it("rolls back every candidate mapping and disposes the instance after partial registration failure", async () => {
    const events: string[] = [];
    const firstHandle = {};
    const conflictingHandle = {};
    const candidate = container(
      [instance([firstHandle, conflictingHandle], events, "candidate")],
      events,
      "container",
    );
    const result = harness(() => Promise.resolve(candidate), events);
    await initialize(result, ["target", "occupied"]);
    expect((await result.adapter.loadAssetContainer(loadRequest("source-v1"))).accepted).toBe(true);
    const bridge = resolveRendererHandleBridge(result.adapter);
    const epoch = bridge?.captureRegistrationEpoch(revision("asset-projection"));
    if (bridge === null || bridge === undefined || epoch === null || epoch === undefined) {
      throw new Error("Expected current private registration authority.");
    }
    expect(bridge.registerHandle("occupied", conflictingHandle, epoch)).toBe(true);
    const failed = result.adapter.instantiateAsset({
      assetId: " asset-id ",
      sourceRevision: "source-v1",
      stableId: "target",
    });
    expect(failed.accepted).toBe(false);
    if (failed.accepted) throw new Error("Expected atomic registration failure.");
    expect(failed.failure.category).toBe("ASSET_LOAD_FAILED");
    expect(events).toEqual(["candidate-dispose"]);

    await result.adapter.start();
    result.setPickHandle(firstHandle);
    expect(
      result.adapter.pick({
        correlationId: "rolled-back",
        modifiers: { alt: false, control: false, meta: false, shift: false },
        normalizedPosition: { x: 0, y: 0 },
      }).accepted,
    ).toBe(false);
    expect(result.adapter.captureDiagnosticSnapshot().assets.liveInstanceCount).toBe(0);
  });

  it("disposes instances and containers before Grid, Camera, Scene, and Engine while continuing after failures", async () => {
    const events: string[] = [];
    const candidate = container(
      [instance([{}], events, "asset-instance", true)],
      events,
      "asset-container",
      { throws: true },
    );
    const result = harness(() => Promise.resolve(candidate), events);
    const gridFactory: RendererGridFactory = () => ({
      dispose: () => events.push("grid-dispose"),
      setVisible: () => undefined,
    });
    const controls = createRendererEditorViewportControlsForTests(result.adapter, gridFactory);
    if (controls === null) throw new Error("Expected compatible editor controls.");
    await initialize(result, ["target"]);
    expect((await result.adapter.loadAssetContainer(loadRequest("source-v1"))).accepted).toBe(true);
    expect(
      result.adapter.instantiateAsset({
        assetId: " asset-id ",
        sourceRevision: "source-v1",
        stableId: "target",
      }).accepted,
    ).toBe(true);
    expect(controls.setGridVisible(true).accepted).toBe(true);

    const failures = await result.adapter.dispose();
    expect(events).toEqual([
      "asset-instance-dispose",
      "asset-container-dispose",
      "grid-dispose",
      "camera-dispose",
      "scene-dispose",
      "engine-dispose",
    ]);
    expect(failures.map(({ category }) => category)).toEqual([
      "RESOURCE_DISPOSAL_FAILED",
      "RESOURCE_DISPOSAL_FAILED",
    ]);
    expect(result.adapter.captureDiagnosticSnapshot().assets).toEqual({
      estimatedTextureRgba8EquivalentBytes: 0,
      inFlightLoadCount: 0,
      liveContainerCount: 0,
      liveInstanceCount: 0,
      loadedMeshCount: 0,
    });
  });
});
