export interface RendererEnginePort {
  readonly nativeHandle: unknown;

  dispose(): void;
  getFps(): number;
  resize(): void;
  runRenderLoop(callback: () => void): void;
  stopRenderLoop(callback: () => void): void;
}

export type RendererEngineFactory = (nativeSurface: unknown) => RendererEnginePort;
