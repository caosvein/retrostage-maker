import {
  createRendererHostSurfaceCapability,
  type RendererExtent,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
} from "../src/index.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";
import { RendererResizeController } from "../src/surface/resize-controller.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
};

class ResizeEngine {
  readonly nativeHandle = {};
  failResize = false;
  resizeCalls = 0;

  dispose(): void {}
  getFps(): number {
    return 60;
  }
  resize(): void {
    this.resizeCalls += 1;
    if (this.failResize) throw new Error("resize failed");
  }
  runRenderLoop(): void {}
  stopRenderLoop(): void {}
}

function hostFixture(
  resizeListeners: Set<(extent: RendererExtent) => void>,
  generation: number,
): RendererHostSurface {
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: () => () => undefined,
    observeResize: (listener) => {
      resizeListeners.add(listener);
      return () => resizeListeners.delete(listener);
    },
    resolveNativeSurface: () => ({}),
  };
  return {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation,
    identity: `resize-${generation}`,
    logicalExtent: { height: 480, width: 640 },
    pixelExtent: { height: 480, width: 640 },
  };
}

describe("RSM-6-I2 resize host", () => {
  it("coalesces current-generation resize and silences pending work after disposal", async () => {
    const tasks: Array<() => void> = [];
    const listeners = new Set<(extent: RendererExtent) => void>();
    const engine = new ResizeEngine();
    const adapter = createRendererAdapterForTests({
      engineFactory: () => engine,
      sceneFactory: () => ({ dispose: () => undefined, render: () => undefined }),
      scheduleResize: (task) => tasks.push(task),
    });

    expect((await adapter.initialize(hostFixture(listeners, 4))).accepted).toBe(true);
    for (const listener of listeners) {
      listener({ height: 720, width: 1280 });
      listener({ height: 768, width: 1366 });
    }
    expect(tasks.length).toBe(1);
    expect(engine.resizeCalls).toBe(0);
    tasks.shift()?.();
    expect(engine.resizeCalls).toBe(1);

    expect(adapter.resize().accepted).toBe(true);
    expect(tasks.length).toBe(1);
    await adapter.dispose();
    expect(listeners.size).toBe(0);
    tasks.shift()?.();
    expect(engine.resizeCalls).toBe(1);
  });

  it("rejects obsolete generations and unusable extents", () => {
    const tasks: Array<() => void> = [];
    let applications = 0;
    const binding: RendererHostSurfaceCapabilityBinding = {
      observeContextState: () => () => undefined,
      observeResize: () => () => undefined,
      resolveNativeSurface: () => ({}),
    };
    const controller = new RendererResizeController(
      (task) => tasks.push(task),
      () => {
        applications += 1;
      },
    );
    controller.bind(binding, 9);

    expect(controller.request(8, { height: 100, width: 100 })).toBe(false);
    expect(controller.request(9, { height: 0, width: 100 })).toBe(false);
    expect(controller.request(9, { height: 100, width: 100 })).toBe(true);
    expect(tasks.length).toBe(1);
    tasks.shift()?.();
    expect(applications).toBe(1);
    controller.dispose();
    expect(controller.request(9)).toBe(false);
  });

  it("normalizes scheduled Engine resize failure without an unhandled callback", async () => {
    const tasks: Array<() => void> = [];
    const listeners = new Set<(extent: RendererExtent) => void>();
    const engine = new ResizeEngine();
    const adapter = createRendererAdapterForTests({
      engineFactory: () => engine,
      sceneFactory: () => ({ dispose: () => undefined, render: () => undefined }),
      scheduleResize: (task) => tasks.push(task),
    });
    await adapter.initialize(hostFixture(listeners, 5));
    engine.failResize = true;

    expect(adapter.resize().accepted).toBe(true);
    tasks.shift()?.();
    expect(adapter.lifecycleState).toBe("FAILED");
    expect(adapter.captureDiagnosticSnapshot().failureCounts.RENDERER_INTERNAL_FAILURE).toBe(1);
  });
});
