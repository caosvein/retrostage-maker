import type { RendererEnginePort } from "../engine/engine-port.js";

export interface RendererScenePort {
  readonly nativeHandle: unknown;

  dispose(): void;
  render(): void;
}

export type RendererSceneFactory = (engine: RendererEnginePort) => RendererScenePort;
