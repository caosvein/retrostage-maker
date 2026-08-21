import {
  createRendererHostSurfaceCapability,
  type RendererContextObservation,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import type {
  RendererAssetContainerFactory,
  RendererAssetContainerPort,
} from "../src/assets/asset-port.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void>) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

interface Deferred<T> {
  readonly promise: Promise<T>;
  resolve(value: T): void;
}

function deferred<T>(): Deferred<T> {
  let resolvePromise: ((value: T) => void) | null = null;
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });
  return {
    promise,
    resolve: (value) => {
      if (resolvePromise === null) throw new Error("Deferred resolver is unavailable.");
      resolvePromise(value);
    },
  };
}

const sourceBytes = new TextEncoder().encode(
  JSON.stringify({ asset: { version: "2.0" }, scene: 0, scenes: [{}] }),
);
const revision = (value: string): RendererProjectionRevision => value as RendererProjectionRevision;

function request(sourceRevision: string) {
  return {
    assetId: "asset",
    bytes: sourceBytes,
    format: "gltf-2.0" as const,
    sourceRevision,
  };
}

function candidate(
  name: string,
  events: string[],
  handle: object = {},
): RendererAssetContainerPort {
  return {
    loadedMeshCount: 1,
    textureRgba8EquivalentBytes: 16,
    dispose: () => events.push(`${name}-container-dispose`),
    instantiate: () => ({
      meshCount: 1,
      nativeHandles: [handle],
      dispose: () => events.push(`${name}-instance-dispose`),
    }),
  };
}

function harness(factory: RendererAssetContainerFactory) {
  let contextListener: ((state: RendererContextObservation) => void) | null = null;
  let pickHandle: object | null = null;
  const intents: string[] = [];
  const callbacks = new Set<() => void>();
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: (listener) => {
      contextListener = listener;
      return () => {
        contextListener = null;
      };
    },
    observeResize: () => () => undefined,
    resolveNativeSurface: () => ({}),
  };
  const host: RendererHostSurface = {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation: 4,
    identity: "stale-asset-host",
    logicalExtent: { height: 600, width: 800 },
    pixelExtent: { height: 600, width: 800 },
  };
  const adapter = createRendererAdapterForTests({
    assetFactory: factory,
    cameraFactory: () => ({ dispose: () => undefined, setProjection: () => undefined }),
    engineFactory: () => ({
      nativeHandle: {},
      dispose: () => undefined,
      getFps: () => 60,
      resize: () => undefined,
      runRenderLoop: (callback) => callbacks.add(callback),
      stopRenderLoop: (callback) => callbacks.delete(callback),
    }),
    pickingFactory: () =>
      pickHandle === null
        ? { hitClass: "background" }
        : { distance: 1, handle: pickHandle, hitClass: "target", worldPoint: null },
    sceneFactory: () => ({ dispose: () => undefined, nativeHandle: {}, render: () => undefined }),
  });
  adapter.onPickIntent((intent) => {
    if (intent.targetId !== null) intents.push(intent.targetId);
  });
  return {
    adapter,
    context: (state: RendererContextObservation) => contextListener?.(state),
    host,
    intents,
    setPickHandle: (handle: object) => {
      pickHandle = handle;
    },
  };
}

async function initialize(
  result: ReturnType<typeof harness>,
  current = revision("A"),
): Promise<void> {
  await result.adapter.initialize(result.host);
  await result.adapter.project({
    content: {},
    resources: [],
    revision: current,
    stableIds: ["stable"],
  });
}

function pick(result: ReturnType<typeof harness>): boolean {
  return result.adapter.pick({
    correlationId: "stale-proof",
    modifiers: { alt: false, control: false, meta: false, shift: false },
    normalizedPosition: { x: 0.5, y: 0.5 },
  }).accepted;
}

describe("RSM-6-I5 asynchronous epoch authority", () => {
  it("lets A2 supersede A1 and keeps A2 handle mappings intact after A1 late cleanup", async () => {
    const events: string[] = [];
    const first = deferred<RendererAssetContainerPort>();
    const second = deferred<RendererAssetContainerPort>();
    const queue = [first, second];
    const currentHandle = {};
    const result = harness(() => {
      const next = queue.shift();
      if (next === undefined) throw new Error("No deferred load remains.");
      return next.promise;
    });
    await initialize(result);

    const loadA1 = result.adapter.loadAssetContainer(request("source-A1"));
    const loadA2 = result.adapter.loadAssetContainer(request("source-A2"));
    expect(result.adapter.captureDiagnosticSnapshot().assets.inFlightLoadCount).toBe(2);
    second.resolve(candidate("A2", events, currentHandle));
    expect((await loadA2).accepted).toBe(true);
    expect(
      result.adapter.instantiateAsset({
        assetId: "asset",
        sourceRevision: "source-A2",
        stableId: "stable",
      }).accepted,
    ).toBe(true);
    await result.adapter.start();
    result.setPickHandle(currentHandle);
    expect(pick(result)).toBe(true);

    first.resolve(candidate("A1", events));
    expect((await loadA1).accepted).toBe(false);
    expect(events).toEqual(["A1-container-dispose"]);
    expect(pick(result)).toBe(true);
    expect(result.intents).toEqual(["stable", "stable"]);
    expect(result.adapter.captureDiagnosticSnapshot().assets).toEqual({
      estimatedTextureRgba8EquivalentBytes: 16,
      inFlightLoadCount: 0,
      liveContainerCount: 1,
      liveInstanceCount: 1,
      loadedMeshCount: 1,
    });
  });

  it("rejects an A1 completion after projection A to B to fresh A2 token replacement", async () => {
    const events: string[] = [];
    const pending = deferred<RendererAssetContainerPort>();
    const result = harness(() => pending.promise);
    await initialize(result, revision("A"));
    const load = result.adapter.loadAssetContainer(request("source-A1"));
    await result.adapter.project({
      content: {},
      resources: [],
      revision: revision("B"),
      stableIds: ["stable"],
    });
    await result.adapter.project({
      content: {},
      resources: [],
      revision: revision("A"),
      stableIds: ["stable"],
    });
    pending.resolve(candidate("old-A1", events));
    expect((await load).accepted).toBe(false);
    expect(events).toEqual(["old-A1-container-dispose"]);
    expect(result.adapter.captureDiagnosticSnapshot().assets.liveContainerCount).toBe(0);
  });

  it("supersedes in-flight work on context loss, explicit asset disposal, and terminal adapter disposal", async () => {
    const contextEvents: string[] = [];
    const contextPending = deferred<RendererAssetContainerPort>();
    const contextResult = harness(() => contextPending.promise);
    await initialize(contextResult);
    await contextResult.adapter.start();
    const contextLoad = contextResult.adapter.loadAssetContainer(request("context-source"));
    contextResult.context("lost");
    contextResult.context("restored");
    contextPending.resolve(candidate("context-stale", contextEvents));
    expect((await contextLoad).accepted).toBe(false);
    expect(contextEvents).toEqual(["context-stale-container-dispose"]);

    const explicitEvents: string[] = [];
    const explicitPending = deferred<RendererAssetContainerPort>();
    const explicitResult = harness(() => explicitPending.promise);
    await initialize(explicitResult);
    const explicitLoad = explicitResult.adapter.loadAssetContainer(request("explicit-source"));
    expect(explicitResult.adapter.disposeAssetContainer({ assetId: "asset" }).accepted).toBe(true);
    explicitPending.resolve(candidate("explicit-stale", explicitEvents));
    expect((await explicitLoad).accepted).toBe(false);
    expect(explicitEvents).toEqual(["explicit-stale-container-dispose"]);

    const terminalEvents: string[] = [];
    const terminalPending = deferred<RendererAssetContainerPort>();
    const terminalResult = harness(() => terminalPending.promise);
    await initialize(terminalResult);
    const terminalLoad = terminalResult.adapter.loadAssetContainer(request("terminal-source"));
    await terminalResult.adapter.dispose();
    const terminalSnapshot = terminalResult.adapter.captureDiagnosticSnapshot();
    terminalPending.resolve(candidate("terminal-stale", terminalEvents));
    expect((await terminalLoad).accepted).toBe(false);
    expect(terminalEvents).toEqual(["terminal-stale-container-dispose"]);
    expect(terminalResult.adapter.captureDiagnosticSnapshot()).toEqual(terminalSnapshot);
  });
});
