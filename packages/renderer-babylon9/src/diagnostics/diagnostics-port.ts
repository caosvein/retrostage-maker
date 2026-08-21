export interface RendererInstrumentationSample {
  readonly engineGpuFrameMilliseconds: number | null;
  readonly sceneActiveMeshesEvaluationMilliseconds: number | null;
  readonly sceneFrameMilliseconds: number | null;
  readonly sceneRenderMilliseconds: number | null;
}

export interface RendererDiagnosticsPort {
  capture(): RendererInstrumentationSample;
  dispose(): void;
}

export type RendererDiagnosticsFactory = (
  engineNativeHandle: unknown,
  sceneNativeHandle: unknown,
) => RendererDiagnosticsPort;
