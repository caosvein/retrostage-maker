import { EngineInstrumentation, SceneInstrumentation } from "@babylonjs/core";

import type { RendererDiagnosticsPort, RendererInstrumentationSample } from "./diagnostics-port.js";

const gpuNanosecondsToMilliseconds = 0.000001;

function nullSample(): RendererInstrumentationSample {
  return Object.freeze({
    engineGpuFrameMilliseconds: null,
    sceneActiveMeshesEvaluationMilliseconds: null,
    sceneFrameMilliseconds: null,
    sceneRenderMilliseconds: null,
  });
}

export function createBabylonRendererDiagnostics(
  engineNativeHandle: unknown,
  sceneNativeHandle: unknown,
): RendererDiagnosticsPort {
  const engine = engineNativeHandle as ConstructorParameters<typeof EngineInstrumentation>[0];
  const scene = sceneNativeHandle as ConstructorParameters<typeof SceneInstrumentation>[0];
  const sceneInstrumentation = new SceneInstrumentation(scene);
  const engineInstrumentation = new EngineInstrumentation(engine);
  let gpuCaptureEnabled = false;
  let terminal = false;

  try {
    sceneInstrumentation.captureFrameTime = true;
    sceneInstrumentation.captureRenderTime = true;
    sceneInstrumentation.captureActiveMeshesEvaluationTime = true;

    const capabilities = (
      engine as unknown as { getCaps(): { readonly timerQuery?: unknown } }
    ).getCaps();
    if (Boolean(capabilities.timerQuery)) {
      engineInstrumentation.captureGPUFrameTime = true;
      gpuCaptureEnabled = true;
    }
  } catch (cause) {
    try {
      sceneInstrumentation.dispose();
    } catch {
      // The attachment cause remains authoritative to the private controller.
    }
    try {
      engineInstrumentation.dispose();
    } catch {
      // The attachment cause remains authoritative to the private controller.
    }
    throw cause;
  }

  return {
    capture: () => {
      if (terminal) return nullSample();
      return {
        engineGpuFrameMilliseconds: gpuCaptureEnabled
          ? engineInstrumentation.gpuFrameTimeCounter.current * gpuNanosecondsToMilliseconds
          : null,
        sceneActiveMeshesEvaluationMilliseconds:
          sceneInstrumentation.activeMeshesEvaluationTimeCounter.current,
        sceneFrameMilliseconds: sceneInstrumentation.frameTimeCounter.current,
        sceneRenderMilliseconds: sceneInstrumentation.renderTimeCounter.current,
      };
    },
    dispose: () => {
      if (terminal) return;
      terminal = true;
      let firstCause: unknown;
      try {
        sceneInstrumentation.dispose();
      } catch (cause) {
        firstCause ??= cause;
      }
      if (gpuCaptureEnabled) {
        try {
          engineInstrumentation.captureGPUFrameTime = false;
        } catch (cause) {
          firstCause ??= cause;
        }
      }
      try {
        engineInstrumentation.dispose();
      } catch (cause) {
        firstCause ??= cause;
      }
      if (firstCause instanceof Error) throw firstCause;
      if (firstCause !== undefined) {
        throw new Error("Babylon instrumentation could not be fully disposed.", {
          cause: firstCause,
        });
      }
    },
  };
}
