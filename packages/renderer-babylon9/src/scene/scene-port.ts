import type { RendererEnginePort } from "../engine/engine-port.js";

export interface RendererScenePort {
  dispose(): void;
  render(): void;
}

export type RendererSceneFactory = (engine: RendererEnginePort) => RendererScenePort;
