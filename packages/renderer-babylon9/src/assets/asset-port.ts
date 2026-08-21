import type { RendererAssetFormat } from "../contracts/public.js";

export interface RendererValidatedAssetSource {
  readonly bytes: Uint8Array;
  readonly format: RendererAssetFormat;
}

export interface RendererAssetInstancePort {
  readonly meshCount: number;
  readonly nativeHandles: readonly object[];

  dispose(): void;
}

export interface RendererAssetContainerPort {
  readonly loadedMeshCount: number;
  readonly textureRgba8EquivalentBytes: number;

  dispose(): void;
  instantiate(): RendererAssetInstancePort;
}

export type RendererAssetContainerFactory = (
  sceneNativeHandle: unknown,
  source: RendererValidatedAssetSource,
) => Promise<RendererAssetContainerPort>;
