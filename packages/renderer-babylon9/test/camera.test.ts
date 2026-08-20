import {
  createRendererHostSurfaceCapability,
  type RendererCameraProjection,
  type RendererContextObservation,
  type RendererExtent,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import { DEFAULT_RENDERER_CAMERA_PROJECTION } from "../src/camera/camera-controller.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void>) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

function projection(overrides: Partial<RendererCameraProjection> = {}): RendererCameraProjection {
  return {
    alphaRadians: 0.25,
    betaRadians: 0.75,
    farClip: 500,
    nearClip: 0.25,
    radius: 8,
    target: { x: 1, y: 2, z: 3 },
    verticalFieldOfViewRadians: 0.8,
    ...overrides,
  };
}

function harness(
  options: { readonly failInitialCamera?: boolean; readonly failProjectionCall?: number } = {},
) {
  const events: string[] = [];
  const cameraUpdates: RendererCameraProjection[] = [];
  const loopCallbacks = new Set<() => void>();
  let cameraCreations = 0;
  let cameraSetCalls = 0;
  let contextListener: ((state: RendererContextObservation) => void) | null = null;
  let resizeListener: ((extent: RendererExtent) => void) | null = null;
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: (listener) => {
      contextListener = listener;
      return () => {
        contextListener = null;
        events.push("context-unsubscribe");
      };
    },
    observeResize: (listener) => {
      resizeListener = listener;
      return () => {
        resizeListener = null;
        events.push("resize-unsubscribe");
      };
    },
    resolveNativeSurface: () => ({}),
  };
  const host: RendererHostSurface = {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation: 7,
    identity: "camera-host",
    logicalExtent: { height: 600, width: 800 },
    pixelExtent: { height: 600, width: 800 },
  };
  const adapter = createRendererAdapterForTests({
    cameraFactory: () => {
      cameraCreations += 1;
      return {
        dispose: () => events.push("camera-dispose"),
        setProjection: (value) => {
          cameraSetCalls += 1;
          events.push("camera-update");
          if (options.failInitialCamera === true || options.failProjectionCall === cameraSetCalls) {
            throw new Error("camera update failed");
          }
          cameraUpdates.push(structuredClone(value));
        },
      };
    },
    engineFactory: () => ({
      nativeHandle: {},
      dispose: () => events.push("engine-dispose"),
      getFps: () => 60,
      resize: () => events.push("engine-resize"),
      runRenderLoop: (callback) => {
        events.push("run-loop");
        loopCallbacks.add(callback);
      },
      stopRenderLoop: (callback) => {
        events.push("stop-loop");
        loopCallbacks.delete(callback);
      },
    }),
    sceneFactory: () => ({
      dispose: () => events.push("scene-dispose"),
      nativeHandle: {},
      render: () => undefined,
    }),
    scheduleResize: (callback) => callback(),
  });
  return {
    adapter,
    cameraCreations: () => cameraCreations,
    cameraUpdates,
    context: (state: RendererContextObservation) => contextListener?.(state),
    events,
    host,
    loopCallbacks,
    resize: () => resizeListener?.({ height: 700, width: 900 }),
  };
}

async function makeRunning(result: ReturnType<typeof harness>): Promise<void> {
  await result.adapter.initialize(result.host);
  await result.adapter.project({
    content: {},
    resources: [],
    revision: "camera-revision" as RendererProjectionRevision,
    stableIds: [],
  });
  await result.adapter.start();
}

describe("RSM-6-I3 Camera ownership", () => {
  it("creates one Camera, validates exactly, resets deterministically, and preserves it on resize", async () => {
    const result = harness();
    await result.adapter.initialize(result.host);
    expect(result.cameraCreations()).toBe(1);
    expect(result.cameraUpdates).toEqual([DEFAULT_RENDERER_CAMERA_PROJECTION]);

    const valid = projection();
    expect(result.adapter.setCameraProjection(valid)).toEqual({ accepted: true });
    const countAfterValid = result.cameraUpdates.length;
    for (const invalid of [
      projection({ radius: 0 }),
      projection({ betaRadians: Math.PI }),
      projection({ verticalFieldOfViewRadians: Number.NaN }),
      projection({ nearClip: 2, farClip: 1 }),
      projection({ target: { x: Number.POSITIVE_INFINITY, y: 0, z: 0 } }),
    ]) {
      expect(result.adapter.setCameraProjection(invalid).accepted).toBe(false);
    }
    expect(result.cameraUpdates.length).toBe(countAfterValid);

    expect(result.adapter.resetView()).toEqual({ accepted: true });
    expect(result.adapter.resetView()).toEqual({ accepted: true });
    expect(result.cameraUpdates.at(-1)).toEqual(DEFAULT_RENDERER_CAMERA_PROJECTION);
    expect(result.cameraUpdates.at(-2)).toEqual(DEFAULT_RENDERER_CAMERA_PROJECTION);
    result.resize();
    expect(result.cameraCreations()).toBe(1);
    expect(result.cameraUpdates.length).toBe(countAfterValid + 2);
    await result.adapter.dispose();
    const disposedSnapshot = result.adapter.captureDiagnosticSnapshot();
    expect(result.adapter.setCameraProjection(valid).accepted).toBe(false);
    expect(result.cameraUpdates.length).toBe(countAfterValid + 2);
    expect(result.adapter.captureDiagnosticSnapshot()).toEqual(disposedSnapshot);
  });

  it("stores suspended desired state and reapplies it before one resumed loop", async () => {
    const result = harness();
    await makeRunning(result);
    result.context("lost");
    const desired = projection({ radius: 22 });
    const before = result.cameraUpdates.length;
    expect(result.adapter.setCameraProjection(desired)).toEqual({ accepted: true });
    expect(result.cameraUpdates.length).toBe(before);
    result.context("restored");
    expect(result.cameraUpdates.at(-1)).toEqual(desired);
    expect(result.events.slice(-3)).toEqual(["engine-resize", "camera-update", "run-loop"]);
    expect(result.loopCallbacks.size).toBe(1);
  });

  it("cleans partial ownership when Camera initialization fails", async () => {
    const result = harness({ failInitialCamera: true });
    const outcome = await result.adapter.initialize(result.host);
    expect(outcome.accepted).toBe(false);
    expect(result.adapter.lifecycleState).toBe("FAILED");
    expect(result.events).toEqual([
      "camera-update",
      "camera-dispose",
      "scene-dispose",
      "engine-dispose",
    ]);
  });

  it("fails restoration without starting a loop when Camera reapply fails", async () => {
    const result = harness({ failProjectionCall: 2 });
    await makeRunning(result);
    result.context("lost");
    result.context("restored");
    expect(result.adapter.lifecycleState).toBe("FAILED");
    expect(result.loopCallbacks.size).toBe(0);
    expect(result.events.slice(-2)).toEqual(["engine-resize", "camera-update"]);
    expect(
      result.adapter.captureDiagnosticSnapshot().failureCounts.CONTEXT_OR_DEVICE_RESTORE_FAILED,
    ).toBe(1);
  });
});
