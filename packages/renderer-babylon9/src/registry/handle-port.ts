import type { RendererProjectionRevision } from "../contracts/public.js";

export interface RendererHandleRegistrationEpoch {
  readonly resourceGeneration: number;
  readonly revision: RendererProjectionRevision;
  readonly sceneGeneration: number;
}

export interface RendererHandleRegistryBridge {
  captureRegistrationEpoch(
    revision: RendererProjectionRevision,
  ): RendererHandleRegistrationEpoch | null;
  registerHandle(stableId: string, handle: object, epoch: RendererHandleRegistrationEpoch): boolean;
  unregisterHandle(handle: object, epoch: RendererHandleRegistrationEpoch): void;
}

export interface RendererHandleRegistrySnapshot {
  readonly activeRevision: RendererProjectionRevision | null;
  readonly handleCount: number;
  readonly resourceGeneration: number;
  readonly sceneGeneration: number | null;
  readonly stableIdCount: number;
  readonly terminal: boolean;
}
