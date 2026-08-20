import {
  createRendererHostSurfaceCapability,
  type RendererContextObservation,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";
import {
  createRendererEditorViewportControls,
  createRendererEditorViewportControlsForTests,
  createRendererGridLineDefinitions,
  RENDERER_GRID_VISUAL,
} from "../src/grid/grid-controller.js";
import type { RendererGridFactory } from "../src/grid/grid-port.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

function gridHarness(disposeGridThrows = false) {
  const events: string[] = [];
  const visibility: boolean[] = [];
  let creations = 0;
  let contextListener: ((state: RendererContextObservation) => void) | null = null;
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: (listener) => {
      contextListener = listener;
      return () => events.push("context-unsubscribe");
    },
    observeResize: () => () => events.push("resize-unsubscribe"),
    resolveNativeSurface: () => ({}),
  };
  const host: RendererHostSurface = {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation: 3,
    identity: "grid-host",
    logicalExtent: { height: 600, width: 800 },
    pixelExtent: { height: 600, width: 800 },
  };
  const callbacks = new Set<() => void>();
  const adapter = createRendererAdapterForTests({
    cameraFactory: () => ({
      dispose: () => events.push("camera-dispose"),
      setProjection: () => undefined,
    }),
    engineFactory: () => ({
      nativeHandle: {},
      dispose: () => events.push("engine-dispose"),
      getFps: () => 60,
      resize: () => events.push("engine-resize"),
      runRenderLoop: (callback) => callbacks.add(callback),
      stopRenderLoop: (callback) => callbacks.delete(callback),
    }),
    sceneFactory: () => ({
      dispose: () => events.push("scene-dispose"),
      nativeHandle: {},
      render: () => undefined,
    }),
  });
  const gridFactory: RendererGridFactory = (_scene, lines, visual) => {
    creations += 1;
    expect(lines).toEqual(createRendererGridLineDefinitions());
    expect(visual).toEqual(RENDERER_GRID_VISUAL);
    return {
      dispose: () => {
        events.push("grid-dispose");
        if (disposeGridThrows) throw new Error("grid disposal failed");
      },
      setVisible: (visible) => visibility.push(visible),
    };
  };
  const controls = createRendererEditorViewportControlsForTests(adapter, gridFactory);
  if (controls === null) throw new Error("Expected compatible editor controls.");
  return {
    adapter,
    context: (state: RendererContextObservation) => contextListener?.(state),
    controls,
    creations: () => creations,
    events,
    gridFactory,
    host,
    visibility,
  };
}

async function run(result: ReturnType<typeof gridHarness>): Promise<void> {
  await result.adapter.initialize(result.host);
  await result.adapter.project({
    content: {},
    resources: [],
    revision: "grid-revision" as RendererProjectionRevision,
    stableIds: [],
  });
  await result.adapter.start();
}

describe("RSM-6-I3 editor Grid", () => {
  it("defines exactly 42 deterministic XZ-plane lines", () => {
    const lines = createRendererGridLineDefinitions();
    expect(lines.length).toBe(42);
    expect(lines[0]).toEqual({ end: { x: 10, y: 0, z: -10 }, start: { x: -10, y: 0, z: -10 } });
    expect(lines.at(-1)).toEqual({ end: { x: 10, y: 0, z: 10 }, start: { x: 10, y: 0, z: -10 } });
    expect(lines.every(({ end, start }) => end.y === 0 && start.y === 0)).toBe(true);
  });

  it("allocates lazily once, is idempotent, and reapplies suspended desired state", async () => {
    const result = gridHarness();
    await run(result);
    expect(result.controls.setGridVisible(false)).toEqual({ accepted: true });
    expect(result.creations()).toBe(0);
    expect(result.controls.setGridVisible(true)).toEqual({ accepted: true });
    expect(result.controls.setGridVisible(true)).toEqual({ accepted: true });
    expect(result.controls.setGridVisible(false)).toEqual({ accepted: true });
    expect(result.creations()).toBe(1);
    expect(result.visibility).toEqual([true, true, false]);
    result.context("lost");
    expect(result.controls.setGridVisible(true)).toEqual({ accepted: true });
    expect(result.visibility).toEqual([true, true, false]);
    result.context("restored");
    expect(result.visibility).toEqual([true, true, false, true]);
    expect(result.creations()).toBe(1);
  });

  it("shares one adapter-scoped authority and one Grid across every factory reference", async () => {
    const result = gridHarness();
    const helperB = createRendererEditorViewportControlsForTests(
      result.adapter,
      result.gridFactory,
    );
    const publicA = createRendererEditorViewportControls(result.adapter);
    const publicB = createRendererEditorViewportControls(result.adapter);
    if (helperB === null || publicA === null || publicB === null) {
      throw new Error("Expected compatible adapter-scoped controls.");
    }
    expect(helperB).toBe(result.controls);
    expect(publicA).toBe(result.controls);
    expect(publicB).toBe(result.controls);

    await run(result);
    expect(publicA.setGridVisible(true)).toEqual({ accepted: true });
    expect(publicB.setGridVisible(false)).toEqual({ accepted: true });
    expect(helperB.setGridVisible(true)).toEqual({ accepted: true });
    expect(result.creations()).toBe(1);
    expect(result.visibility).toEqual([true, false, true]);

    expect(await result.adapter.dispose()).toEqual([]);
    expect(result.events.filter((event) => event === "grid-dispose").length).toBe(1);
    expect(result.events.slice(-4)).toEqual([
      "grid-dispose",
      "camera-dispose",
      "scene-dispose",
      "engine-dispose",
    ]);
    const snapshot = result.adapter.captureDiagnosticSnapshot();
    expect(publicA.setGridVisible(false).accepted).toBe(false);
    expect(publicB.setGridVisible(false).accepted).toBe(false);
    expect(result.adapter.captureDiagnosticSnapshot()).toEqual(snapshot);
  });

  it("keeps distinct adapters and their single Grid resources independent", async () => {
    const first = gridHarness();
    const second = gridHarness();
    expect(first.controls === second.controls).toBe(false);
    await run(first);
    await run(second);
    expect(first.controls.setGridVisible(true)).toEqual({ accepted: true });
    expect(second.controls.setGridVisible(true)).toEqual({ accepted: true });
    expect(first.creations()).toBe(1);
    expect(second.creations()).toBe(1);
    await first.adapter.dispose();
    await second.adapter.dispose();
    expect(first.events.filter((event) => event === "grid-dispose").length).toBe(1);
    expect(second.events.filter((event) => event === "grid-dispose").length).toBe(1);
  });

  it("disposes before Camera/Scene/Engine, normalizes failure, and retains silence", async () => {
    const result = gridHarness(true);
    await run(result);
    result.controls.setGridVisible(true);
    const failures = await result.adapter.dispose();
    expect(result.events.slice(-4)).toEqual([
      "grid-dispose",
      "camera-dispose",
      "scene-dispose",
      "engine-dispose",
    ]);
    expect(failures.map(({ category }) => category)).toEqual(["RESOURCE_DISPOSAL_FAILED"]);
    const snapshot = result.adapter.captureDiagnosticSnapshot();
    expect(result.controls.setGridVisible(false).accepted).toBe(false);
    expect(result.adapter.captureDiagnosticSnapshot()).toEqual(snapshot);
  });
});
