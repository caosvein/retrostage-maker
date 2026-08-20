import type { RendererVector3 } from "../contracts/public.js";

export interface RendererGridLineDefinition {
  readonly end: RendererVector3;
  readonly start: RendererVector3;
}

export interface RendererGridVisual {
  readonly alpha: number;
  readonly blue: number;
  readonly green: number;
  readonly red: number;
}

export interface RendererGridPort {
  dispose(): void;
  setVisible(visible: boolean): void;
}

export type RendererGridFactory = (
  sceneNativeHandle: unknown,
  lines: readonly RendererGridLineDefinition[],
  visual: RendererGridVisual,
) => RendererGridPort;
