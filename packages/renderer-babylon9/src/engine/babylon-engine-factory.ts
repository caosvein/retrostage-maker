import { Engine } from "@babylonjs/core";

import type { RendererEnginePort } from "./engine-port.js";

function isNativeSurfaceCandidate(value: unknown): value is object {
  return (typeof value === "object" && value !== null) || typeof value === "function";
}

export function createBabylonEngine(nativeSurface: unknown): RendererEnginePort {
  if (!isNativeSurfaceCandidate(nativeSurface)) {
    throw new TypeError("Renderer host capability did not resolve a native surface object.");
  }

  const engine = new Engine(
    nativeSurface as ConstructorParameters<typeof Engine>[0],
    true,
    {
      preserveDrawingBuffer: false,
      stencil: true,
    },
    true,
  );

  return {
    nativeHandle: engine,
    dispose: () => {
      engine.dispose();
    },
    getFps: () => engine.getFps(),
    resize: () => {
      engine.resize();
    },
    runRenderLoop: (callback) => {
      engine.runRenderLoop(callback);
    },
    stopRenderLoop: (callback) => {
      engine.stopRenderLoop(callback);
    },
  };
}
