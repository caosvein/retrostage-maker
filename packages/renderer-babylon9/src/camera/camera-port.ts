import type { RendererCameraProjection } from "../contracts/public.js";

export interface RendererCameraPort {
  dispose(): void;
  setProjection(projection: RendererCameraProjection): void;
}

export type RendererCameraFactory = (sceneNativeHandle: unknown) => RendererCameraPort;
