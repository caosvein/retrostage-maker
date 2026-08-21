import { NullEngine } from "@babylonjs/core";

import type { RendererEnginePort } from "../engine/engine-port.js";

export function createNullEngine(): RendererEnginePort {
  const engine = new NullEngine({
    deterministicLockstep: true,
    lockstepMaxSteps: 1,
    renderHeight: 256,
    renderWidth: 256,
    textureSize: 256,
  });
  let disposed = false;
  let logicalRenderLoop: (() => void) | null = null;

  return {
    nativeHandle: engine,
    dispose: () => {
      if (disposed) return;
      disposed = true;
      logicalRenderLoop = null;
      engine.dispose();
    },
    getFps: () => 0,
    resize: () => {
      if (disposed) throw new Error("The headless Engine is disposed.");
    },
    runRenderLoop: (callback) => {
      if (disposed) throw new Error("The headless Engine is disposed.");
      if (logicalRenderLoop !== null && logicalRenderLoop !== callback) {
        throw new Error("The headless Engine already owns a logical render loop.");
      }
      logicalRenderLoop = callback;
    },
    stopRenderLoop: (callback) => {
      if (logicalRenderLoop === callback) logicalRenderLoop = null;
    },
  };
}
