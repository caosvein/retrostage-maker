import {
  createRendererHostSurfaceCapability,
  type RendererContextObservation,
  type RendererExtent,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void>) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

describe("RSM-6-I2 disposal ownership", () => {
  it("tears down in order, continues after failure, and remains idempotent", async () => {
    const events: string[] = [];
    const resizeListeners = new Set<(extent: RendererExtent) => void>();
    const contextListeners = new Set<(state: RendererContextObservation) => void>();
    const loopCallbacks = new Set<() => void>();
    const binding: RendererHostSurfaceCapabilityBinding = {
      observeContextState: (listener) => {
        contextListeners.add(listener);
        return () => {
          events.push("context-unsubscribe");
          contextListeners.delete(listener);
        };
      },
      observeResize: (listener) => {
        resizeListeners.add(listener);
        return () => {
          events.push("resize-unsubscribe");
          resizeListeners.delete(listener);
        };
      },
      resolveNativeSurface: () => ({}),
    };
    const host: RendererHostSurface = {
      available: true,
      capability: createRendererHostSurfaceCapability(binding),
      deviceScale: 1,
      generation: 3,
      identity: "disposal-host",
      logicalExtent: { height: 600, width: 800 },
      pixelExtent: { height: 600, width: 800 },
    };
    const engine = {
      nativeHandle: {},
      dispose: () => events.push("engine-dispose"),
      getFps: () => 60,
      resize: () => undefined,
      runRenderLoop: (callback: () => void) => {
        loopCallbacks.add(callback);
      },
      stopRenderLoop: (callback: () => void) => {
        events.push("stop-loop");
        loopCallbacks.delete(callback);
      },
    };
    const scene = {
      dispose: () => {
        events.push("scene-dispose");
        throw new Error("scene cleanup failed");
      },
      render: () => undefined,
    };
    const adapter = createRendererAdapterForTests({
      engineFactory: () => engine,
      sceneFactory: () => scene,
    });

    await adapter.initialize(host);
    await adapter.project({
      content: {},
      resources: [],
      revision: "dispose-revision" as RendererProjectionRevision,
      stableIds: [],
    });
    await adapter.start();
    const retainedLoop = [...loopCallbacks][0];
    if (retainedLoop === undefined)
      throw new Error("Expected one registered render-loop callback.");
    let failureListenerCalls = 0;
    adapter.onFailure(() => {
      failureListenerCalls += 1;
    });

    const failures = await adapter.dispose();
    expect(events).toEqual([
      "stop-loop",
      "resize-unsubscribe",
      "context-unsubscribe",
      "scene-dispose",
      "engine-dispose",
    ]);
    expect(failures.map(({ category }) => category)).toEqual(["RESOURCE_DISPOSAL_FAILED"]);
    expect(loopCallbacks.size).toBe(0);
    expect(resizeListeners.size).toBe(0);
    expect(contextListeners.size).toBe(0);
    expect(adapter.captureDiagnosticSnapshot().resourceCounts).toEqual({ engine: 0, scene: 0 });
    const disposedSnapshot = adapter.captureDiagnosticSnapshot();
    const disposedFailureListenerCalls = failureListenerCalls;

    retainedLoop();
    retainedLoop();
    expect(adapter.captureDiagnosticSnapshot()).toEqual(disposedSnapshot);
    expect(failureListenerCalls).toBe(disposedFailureListenerCalls);

    expect(await adapter.dispose()).toEqual([]);
    expect(events.length).toBe(5);
  });

  it("revokes callback authority before a failing stop and continues disposal cleanup", async () => {
    const events: string[] = [];
    const resizeListeners = new Set<(extent: RendererExtent) => void>();
    const contextListeners = new Set<(state: RendererContextObservation) => void>();
    const loopCallbacks = new Set<() => void>();
    let renderCalls = 0;
    const binding: RendererHostSurfaceCapabilityBinding = {
      observeContextState: (listener) => {
        contextListeners.add(listener);
        return () => {
          events.push("context-unsubscribe");
          contextListeners.delete(listener);
        };
      },
      observeResize: (listener) => {
        resizeListeners.add(listener);
        return () => {
          events.push("resize-unsubscribe");
          resizeListeners.delete(listener);
        };
      },
      resolveNativeSurface: () => ({}),
    };
    const host: RendererHostSurface = {
      available: true,
      capability: createRendererHostSurfaceCapability(binding),
      deviceScale: 1,
      generation: 4,
      identity: "stop-failure-disposal-host",
      logicalExtent: { height: 600, width: 800 },
      pixelExtent: { height: 600, width: 800 },
    };
    const engine = {
      nativeHandle: {},
      dispose: () => events.push("engine-dispose"),
      getFps: () => 60,
      resize: () => undefined,
      runRenderLoop: (callback: () => void) => {
        loopCallbacks.add(callback);
      },
      stopRenderLoop: () => {
        events.push("stop-loop");
        throw new Error("stop failed");
      },
    };
    const scene = {
      dispose: () => events.push("scene-dispose"),
      render: () => {
        renderCalls += 1;
      },
    };
    const adapter = createRendererAdapterForTests({
      engineFactory: () => engine,
      sceneFactory: () => scene,
    });

    await adapter.initialize(host);
    await adapter.project({
      content: {},
      resources: [],
      revision: "stop-failure-dispose-revision" as RendererProjectionRevision,
      stableIds: [],
    });
    await adapter.start();
    const retainedLoop = [...loopCallbacks][0];
    if (retainedLoop === undefined)
      throw new Error("Expected one registered render-loop callback.");
    let failureListenerCalls = 0;
    adapter.onFailure(() => {
      failureListenerCalls += 1;
    });

    const failures = await adapter.dispose();
    expect(failures.map(({ category }) => category)).toEqual(["RESOURCE_DISPOSAL_FAILED"]);
    expect(events).toEqual([
      "stop-loop",
      "resize-unsubscribe",
      "context-unsubscribe",
      "scene-dispose",
      "engine-dispose",
    ]);
    expect(loopCallbacks.size).toBe(1);
    expect(resizeListeners.size).toBe(0);
    expect(contextListeners.size).toBe(0);
    expect(adapter.lifecycleState).toBe("DISPOSED");
    expect(adapter.captureDiagnosticSnapshot().resourceCounts).toEqual({ engine: 0, scene: 0 });
    const disposedSnapshot = adapter.captureDiagnosticSnapshot();
    const disposedFailureListenerCalls = failureListenerCalls;

    retainedLoop();
    retainedLoop();
    expect(renderCalls).toBe(0);
    expect(adapter.captureDiagnosticSnapshot()).toEqual(disposedSnapshot);
    expect(failureListenerCalls).toBe(disposedFailureListenerCalls);
  });
});
