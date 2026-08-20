import {
  createRendererHostSurfaceCapability,
  type RendererContextObservation,
  type RendererFailure,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void>) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toContain(expected: unknown): void;
  toEqual(expected: unknown): void;
};

class ContextEngine {
  readonly nativeHandle = {};
  readonly callbacks = new Set<() => void>();
  failRestore = false;
  failStop = false;
  resizeCalls = 0;
  runCalls = 0;
  stopCalls = 0;

  dispose(): void {}
  getFps(): number {
    return 60;
  }
  resize(): void {
    this.resizeCalls += 1;
    if (this.failRestore) throw new Error("restore failed");
  }
  runRenderLoop(callback: () => void): void {
    this.runCalls += 1;
    this.callbacks.add(callback);
  }
  stopRenderLoop(callback: () => void): void {
    this.stopCalls += 1;
    if (this.failStop) throw new Error("stop failed");
    this.callbacks.delete(callback);
  }
}

function contextHost(
  listeners: Set<(state: RendererContextObservation) => void>,
): RendererHostSurface {
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    observeResize: () => () => undefined,
    resolveNativeSurface: () => ({}),
  };
  return {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation: 12,
    identity: "context-host",
    logicalExtent: { height: 600, width: 800 },
    pixelExtent: { height: 600, width: 800 },
  };
}

async function runningAdapter(
  engine: ContextEngine,
  listeners: Set<(state: RendererContextObservation) => void>,
  render: () => void = () => undefined,
) {
  const adapter = createRendererAdapterForTests({
    cameraFactory: () => ({ dispose: () => undefined, setProjection: () => undefined }),
    engineFactory: () => engine,
    sceneFactory: () => ({ dispose: () => undefined, nativeHandle: {}, render }),
  });
  await adapter.initialize(contextHost(listeners));
  await adapter.project({
    content: {},
    resources: [],
    revision: "context-revision" as RendererProjectionRevision,
    stableIds: [],
  });
  await adapter.start();
  return adapter;
}

describe("RSM-6-I2 context loss", () => {
  it("suspends one loop and restores exactly one loop", async () => {
    const engine = new ContextEngine();
    const listeners = new Set<(state: RendererContextObservation) => void>();
    const failures: RendererFailure[] = [];
    let renderCalls = 0;
    const adapter = await runningAdapter(engine, listeners, () => {
      renderCalls += 1;
    });
    adapter.onFailure((failure) => failures.push(failure));
    const retainedLoop = [...engine.callbacks][0];
    if (retainedLoop === undefined)
      throw new Error("Expected one registered render-loop callback.");

    for (const listener of listeners) listener("lost");
    expect(adapter.lifecycleState).toBe("SUSPENDED_CONTEXT_LOSS");
    expect(engine.stopCalls).toBe(1);
    expect(engine.callbacks.size).toBe(0);
    expect(failures.map(({ category }) => category)).toContain("CONTEXT_OR_DEVICE_LOST");
    const suspendedSnapshot = adapter.captureDiagnosticSnapshot();

    retainedLoop();
    retainedLoop();
    expect(renderCalls).toBe(0);
    expect(adapter.captureDiagnosticSnapshot().timing.sampleCount).toBe(
      suspendedSnapshot.timing.sampleCount,
    );
    expect(adapter.captureDiagnosticSnapshot().failureCounts).toEqual(
      suspendedSnapshot.failureCounts,
    );
    expect(adapter.lifecycleState).toBe("SUSPENDED_CONTEXT_LOSS");

    for (const listener of listeners) listener("restored");
    expect(adapter.lifecycleState).toBe("RUNNING");
    expect(engine.resizeCalls).toBe(1);
    expect(engine.runCalls).toBe(2);
    expect(engine.callbacks.size).toBe(1);
    expect(adapter.captureDiagnosticSnapshot().contextState).toBe("available");
  });

  it("revokes retained callback authority before a failing context-loss stop", async () => {
    const engine = new ContextEngine();
    const listeners = new Set<(state: RendererContextObservation) => void>();
    const failures: RendererFailure[] = [];
    let renderCalls = 0;
    const adapter = await runningAdapter(engine, listeners, () => {
      renderCalls += 1;
    });
    adapter.onFailure((failure) => failures.push(failure));
    const retainedLoop = [...engine.callbacks][0];
    if (retainedLoop === undefined)
      throw new Error("Expected one registered render-loop callback.");
    engine.failStop = true;

    for (const listener of listeners) listener("lost");
    expect(adapter.lifecycleState).toBe("FAILED");
    expect(engine.callbacks.size).toBe(1);
    expect(failures.map(({ category }) => category)).toContain("RENDERER_INTERNAL_FAILURE");
    const failedSnapshot = adapter.captureDiagnosticSnapshot();

    retainedLoop();
    retainedLoop();
    expect(renderCalls).toBe(0);
    expect(adapter.captureDiagnosticSnapshot().timing.sampleCount).toBe(
      failedSnapshot.timing.sampleCount,
    );
    expect(adapter.captureDiagnosticSnapshot().failureCounts).toEqual(failedSnapshot.failureCounts);
    expect(adapter.lifecycleState).toBe("FAILED");
  });

  it("normalizes restore failure and requires disposal", async () => {
    const engine = new ContextEngine();
    const listeners = new Set<(state: RendererContextObservation) => void>();
    const failures: RendererFailure[] = [];
    const adapter = await runningAdapter(engine, listeners);
    adapter.onFailure((failure) => failures.push(failure));

    for (const listener of listeners) listener("lost");
    engine.failRestore = true;
    for (const listener of listeners) listener("restored");
    expect(adapter.lifecycleState).toBe("FAILED");
    expect(failures.map(({ category }) => category)).toContain("CONTEXT_OR_DEVICE_RESTORE_FAILED");
    expect((await adapter.start()).accepted).toBe(false);
    await adapter.dispose();
    expect(adapter.lifecycleState).toBe("DISPOSED");
  });

  it("ignores retained observer callbacks after terminal disposal", async () => {
    const engine = new ContextEngine();
    const listeners = new Set<(state: RendererContextObservation) => void>();
    const adapter = await runningAdapter(engine, listeners);
    const retained = [...listeners];

    await adapter.dispose();
    expect(listeners.size).toBe(0);
    for (const listener of retained) {
      listener("lost");
      listener("restored");
    }
    expect(adapter.lifecycleState).toBe("DISPOSED");
    expect(engine.runCalls).toBe(1);
  });
});
