import type { RendererVector3, RendererViewportPoint } from "../contracts/public.js";

export type RendererRawPickObservation =
  | { readonly hitClass: "background" }
  | {
      readonly distance: number | null;
      readonly handle: object;
      readonly hitClass: "target";
      readonly worldPoint: RendererVector3 | null;
    };

export type RendererPickingFactory = (
  sceneNativeHandle: unknown,
  normalizedPosition: RendererViewportPoint,
) => RendererRawPickObservation;
