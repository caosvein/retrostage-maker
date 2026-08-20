import { Scene } from "@babylonjs/core";

import type { RendererEnginePort } from "../engine/engine-port.js";
import type { RendererScenePort } from "./scene-port.js";

export function createBabylonScene(engine: RendererEnginePort): RendererScenePort {
  const scene = new Scene(engine.nativeHandle as ConstructorParameters<typeof Scene>[0]);

  return {
    dispose: () => {
      scene.dispose();
    },
    render: () => {
      scene.render();
    },
  };
}
