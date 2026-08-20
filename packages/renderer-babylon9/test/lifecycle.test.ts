import {
  createRendererHostSurfaceCapability,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionInput,
  type RendererProjectionRevision,
} from "../src/index.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toContain(expected: unknown): void;
  toEqual(expected: unknown): void;
};

class FakeEngine {
  readonly nativeHandle = {};
  readonly callbacks = new Set<() => void>();
  disposeCalls = 0;
  resizeCalls = 0;
  runCalls = 0;
  stopCalls = 0;

  dispose(): void {
    this.disposeCalls += 1;
  }

  getFps(): number {
    return 50;
  }

  resize(): void {
    this.resizeCalls += 1;
  }

  runRenderLoop(callback: () => void): void {
    this.runCalls += 1;
    this.callbacks.add(callback);
  }

  stopRenderLoop(callback: () => void): void {
    this.stopCalls += 1;
    this.callbacks.delete(callback);
  }

  tick(): void {
    for (const callback of this.callbacks) callback();
  }
}

class FakeScene {
  readonly nativeHandle = {};
  disposeCalls = 0;
  renderCalls = 0;

  dispose(): void {
    this.disposeCalls += 1;
  }

  render(): void {
    this.renderCalls += 1;
  }
}

function fixtureHost(generation = 7): RendererHostSurface {
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: () => () => undefined,
    observeResize: () => () => undefined,
    resolveNativeSurface: () => ({}),
  };
  return {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation,
    identity: `host-${generation}`,
    logicalExtent: { height: 600, width: 800 },
    pixelExtent: { height: 600, width: 800 },
  };
}

function projection(revision: string): RendererProjectionInput {
  return {
    content: {},
    resources: [],
    revision: revision as RendererProjectionRevision,
    stableIds: [],
  };
}

describe("RSM-6-I2 adapter lifecycle", () => {
  it("owns one Engine, at most one Scene, and exactly one RUNNING loop", async () => {
    const engine = new FakeEngine();
    const scene = new FakeScene();
    let engineCreations = 0;
    let sceneCreations = 0;
    const states: string[] = [];
    const adapter = createRendererAdapterForTests({
      cameraFactory: () => ({ dispose: () => undefined, setProjection: () => undefined }),
      engineFactory: () => {
        engineCreations += 1;
        return engine;
      },
      sceneFactory: () => {
        sceneCreations += 1;
        return scene;
      },
    });
    adapter.onLifecycleState((state) => states.push(state));

    expect((await adapter.initialize(fixtureHost())).accepted).toBe(true);
    expect((await adapter.project(projection("revision-1"))).status).toBe("accepted-current");
    expect((await adapter.project(projection("revision-1"))).status).toBe("duplicate-no-op");
    expect((await adapter.start()).accepted).toBe(true);
    expect((await adapter.start()).accepted).toBe(true);

    expect(engineCreations).toBe(1);
    expect(sceneCreations).toBe(1);
    expect(engine.runCalls).toBe(1);
    expect(engine.callbacks.size).toBe(1);
    engine.tick();
    expect(scene.renderCalls).toBe(1);
    expect(adapter.render().accepted).toBe(true);

    const diagnostics = adapter.captureDiagnosticSnapshot();
    expect(diagnostics.resourceCounts).toEqual({ engine: 1, scene: 1 });
    expect(diagnostics.timing).toEqual({
      frameMilliseconds: 20,
      framesPerSecond: 50,
      sampleCount: 2,
    });
    expect(diagnostics.unavailableMetrics).toContain("drawCalls");

    expect((await adapter.attachSurface(fixtureHost(8))).accepted).toBe(false);
    expect(await adapter.detachSurface()).toEqual([]);
    expect(await adapter.dispose()).toEqual([]);
    expect(engine.disposeCalls).toBe(1);
    expect(scene.disposeCalls).toBe(1);
    expect(states).toEqual(["INITIALIZING", "READY", "RUNNING", "DISPOSING", "DISPOSED"]);
  });

  it("rejects illegal operations and cleans partial initialization", async () => {
    const engine = new FakeEngine();
    const adapter = createRendererAdapterForTests({
      cameraFactory: () => ({ dispose: () => undefined, setProjection: () => undefined }),
      engineFactory: () => engine,
      sceneFactory: () => {
        throw new Error("scene construction failed");
      },
    });

    expect((await adapter.start()).accepted).toBe(false);
    expect(adapter.render().accepted).toBe(false);
    expect(adapter.resize().accepted).toBe(false);
    expect((await adapter.project(projection("early"))).status).toBe("rejected");

    const result = await adapter.initialize(fixtureHost());
    expect(result.accepted).toBe(false);
    expect(adapter.lifecycleState).toBe("FAILED");
    expect(engine.disposeCalls).toBe(1);
    expect(adapter.captureDiagnosticSnapshot().resourceCounts).toEqual({ engine: 0, scene: 0 });
    expect((await adapter.initialize(fixtureHost())).accepted).toBe(false);
    expect(await adapter.dispose()).toEqual([]);
    expect(adapter.lifecycleState).toBe("DISPOSED");
  });

  it("rejects unavailable and forged host capabilities without creating resources", async () => {
    let engineCreations = 0;
    const adapter = createRendererAdapterForTests({
      cameraFactory: () => ({ dispose: () => undefined, setProjection: () => undefined }),
      engineFactory: () => {
        engineCreations += 1;
        return new FakeEngine();
      },
      sceneFactory: () => new FakeScene(),
    });
    const unavailable = { ...fixtureHost(), available: false };

    expect((await adapter.attachSurface(unavailable)).accepted).toBe(false);
    expect(adapter.lifecycleState).toBe("NEW");
    expect(engineCreations).toBe(0);
  });
});
