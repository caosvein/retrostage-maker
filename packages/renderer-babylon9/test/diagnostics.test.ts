import {
  createRendererHostSurfaceCapability,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import type { RendererAssetContainerFactory } from "../src/assets/asset-port.js";
import { createHeadlessRendererAdapter } from "../src/headless.js";
import { RendererDiagnosticsController } from "../src/diagnostics/diagnostics-controller.js";
import { createRendererAdapterForTests } from "../src/engine/renderer-adapter.js";
import { createRendererEditorViewportControlsForTests } from "../src/grid/grid-controller.js";
import type { RendererGridFactory } from "../src/grid/grid-port.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
  toThrow(expected?: string): void;
};

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
    identity: "diagnostics-host",
    logicalExtent: { height: 256, width: 256 },
    pixelExtent: { height: 256, width: 256 },
  };
}

describe("RSM-6-I6 diagnostics", () => {
  it("normalizes samples and publishes a deeply frozen JSON-safe snapshot", async () => {
    const adapter = createRendererAdapterForTests({
      cameraFactory: () => ({ dispose: () => undefined, setProjection: () => undefined }),
      diagnosticsFactory: () => ({
        capture: () => ({
          engineGpuFrameMilliseconds: 2.5,
          sceneActiveMeshesEvaluationMilliseconds: -1,
          sceneFrameMilliseconds: Number.NaN,
          sceneRenderMilliseconds: 0,
        }),
        dispose: () => undefined,
      }),
      engineFactory: () => ({
        nativeHandle: { privateEngine: true },
        dispose: () => undefined,
        getFps: () => 0,
        resize: () => undefined,
        runRenderLoop: () => undefined,
        stopRenderLoop: () => undefined,
      }),
      sceneFactory: () => ({
        dispose: () => undefined,
        nativeHandle: { privateScene: true },
        render: () => undefined,
      }),
    });
    expect((await adapter.initialize(host())).accepted).toBe(true);
    const snapshot = adapter.captureDiagnosticSnapshot();
    expect(snapshot.instrumentation).toEqual({
      engineGpuFrameMilliseconds: 2.5,
      sceneActiveMeshesEvaluationMilliseconds: null,
      sceneFrameMilliseconds: null,
      sceneRenderMilliseconds: 0,
    });
    expect(snapshot.unavailableMetrics).toEqual([
      "drawCalls",
      "frameMilliseconds",
      "framesPerSecond",
      "instrumentation.sceneActiveMeshesEvaluationMilliseconds",
      "instrumentation.sceneFrameMilliseconds",
    ]);
    for (const value of [
      snapshot,
      snapshot.assets,
      snapshot.instrumentation,
      snapshot.timing,
      snapshot.failureCounts,
      snapshot.resourceCounts,
      snapshot.correlationIds,
      snapshot.unavailableMetrics,
    ]) {
      expect(Object.isFrozen(value)).toBe(true);
    }
    const json = JSON.stringify(snapshot);
    expect(json.includes("privateEngine")).toBe(false);
    expect(json.includes("privateScene")).toBe(false);
    await adapter.dispose();
  });

  it("keeps attachment and capture failures observational and disables repeated capture", () => {
    const unattached = new RendererDiagnosticsController(() => {
      throw new Error("attach failed");
    });
    unattached.attach({}, {});
    expect(unattached.capture()).toEqual({
      engineGpuFrameMilliseconds: null,
      sceneActiveMeshesEvaluationMilliseconds: null,
      sceneFrameMilliseconds: null,
      sceneRenderMilliseconds: null,
    });

    let captures = 0;
    let disposals = 0;
    const failed = new RendererDiagnosticsController(() => ({
      capture: () => {
        captures += 1;
        throw new Error("capture failed");
      },
      dispose: () => {
        disposals += 1;
        throw new Error("cleanup failed");
      },
    }));
    failed.attach({}, {});
    const first = failed.capture();
    expect(failed.capture()).toEqual(first);
    expect(captures).toBe(1);
    expect(disposals).toBe(1);
  });

  it("terminalizes before disposal, attempts complete native cleanup, and is idempotent", () => {
    const events: string[] = [];
    let captures = 0;
    const controller = new RendererDiagnosticsController(() => ({
      capture: () => {
        captures += 1;
        return {
          engineGpuFrameMilliseconds: 1,
          sceneActiveMeshesEvaluationMilliseconds: 2,
          sceneFrameMilliseconds: 3,
          sceneRenderMilliseconds: 4,
        };
      },
      dispose: () => {
        let first: Error | null = null;
        try {
          events.push("scene-instrumentation-dispose");
          throw new Error("scene disposal failed");
        } catch (cause) {
          first = cause as Error;
        }
        events.push("engine-instrumentation-dispose");
        throw first;
      },
    }));
    controller.attach({}, {});
    const retained = controller.capture();
    expect(() => controller.dispose()).toThrow("scene disposal failed");
    controller.dispose();
    expect(controller.capture()).toEqual(retained);
    expect(captures).toBe(1);
    expect(events).toEqual(["scene-instrumentation-dispose", "engine-instrumentation-dispose"]);
  });

  it("detaches instrumentation before Camera, Scene, and Engine while continuing after failure", async () => {
    const events: string[] = [];
    const assetFactory: RendererAssetContainerFactory = () =>
      Promise.resolve({
        loadedMeshCount: 1,
        textureRgba8EquivalentBytes: 0,
        dispose: () => events.push("asset-container-dispose"),
        instantiate: () => ({
          meshCount: 1,
          nativeHandles: [{}],
          dispose: () => events.push("asset-instance-dispose"),
        }),
      });
    const adapter = createRendererAdapterForTests({
      assetFactory,
      cameraFactory: () => ({
        dispose: () => events.push("camera-dispose"),
        setProjection: () => undefined,
      }),
      diagnosticsFactory: () => ({
        capture: () => ({
          engineGpuFrameMilliseconds: null,
          sceneActiveMeshesEvaluationMilliseconds: null,
          sceneFrameMilliseconds: null,
          sceneRenderMilliseconds: null,
        }),
        dispose: () => {
          events.push("diagnostics-dispose");
          throw new Error("diagnostics disposal failed");
        },
      }),
      engineFactory: () => ({
        nativeHandle: {},
        dispose: () => events.push("engine-dispose"),
        getFps: () => 60,
        resize: () => undefined,
        runRenderLoop: () => undefined,
        stopRenderLoop: () => undefined,
      }),
      sceneFactory: () => ({
        dispose: () => events.push("scene-dispose"),
        nativeHandle: {},
        render: () => undefined,
      }),
    });
    const gridFactory: RendererGridFactory = () => ({
      dispose: () => events.push("grid-dispose"),
      setVisible: () => undefined,
    });
    const controls = createRendererEditorViewportControlsForTests(adapter, gridFactory);
    if (controls === null) throw new Error("Expected compatible editor controls.");
    await adapter.initialize(host());
    await adapter.project({
      content: {},
      resources: [],
      revision: "diagnostics-projection" as RendererProjectionRevision,
      stableIds: ["diagnostics-asset"],
    });
    const source = new TextEncoder().encode(
      JSON.stringify({ asset: { version: "2.0" }, scene: 0, scenes: [{}] }),
    );
    expect(
      (
        await adapter.loadAssetContainer({
          assetId: "diagnostics-asset",
          bytes: source,
          format: "gltf-2.0",
          sourceRevision: "source-1",
        })
      ).accepted,
    ).toBe(true);
    expect(
      adapter.instantiateAsset({
        assetId: "diagnostics-asset",
        sourceRevision: "source-1",
        stableId: "diagnostics-asset",
      }).accepted,
    ).toBe(true);
    expect(controls.setGridVisible(true).accepted).toBe(true);
    const failures = await adapter.dispose();
    expect(events).toEqual([
      "diagnostics-dispose",
      "asset-instance-dispose",
      "asset-container-dispose",
      "grid-dispose",
      "camera-dispose",
      "scene-dispose",
      "engine-dispose",
    ]);
    expect(failures.map(({ category }) => category)).toEqual(["RESOURCE_DISPOSAL_FAILED"]);
    expect(adapter.captureDiagnosticSnapshot().failureCounts.RESOURCE_DISPOSAL_FAILED).toBe(1);
  });

  it("exposes normalized real instrumentation through the public headless adapter", async () => {
    const adapter = await createHeadlessRendererAdapter();
    const sample = adapter.captureDiagnosticSnapshot().instrumentation;
    for (const value of Object.values(sample)) {
      expect(value === null || (Number.isFinite(value) && value >= 0)).toBe(true);
    }
    expect(sample.engineGpuFrameMilliseconds).toBe(null);
    await adapter.dispose();
    const terminal = adapter.captureDiagnosticSnapshot();
    expect(JSON.stringify(terminal).includes("Instrumentation")).toBe(false);
    expect(adapter.captureDiagnosticSnapshot()).toEqual(terminal);
  });
});
