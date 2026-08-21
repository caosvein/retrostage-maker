import type {
  RendererGizmoMode,
  RendererUnsubscribe,
  RendererVector3,
} from "../contracts/public.js";

export interface RendererGizmoQuaternion {
  readonly w: number;
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface RendererGizmoTransformState {
  readonly position: RendererVector3;
  readonly rotationQuaternion: RendererGizmoQuaternion;
  readonly scale: RendererVector3;
}

export type RendererGizmoNativeEvent =
  | {
      readonly phase: "begin" | "commit" | "update";
      readonly state: RendererGizmoTransformState;
    }
  | {
      readonly phase: "invalid";
      readonly state: null;
    };

export interface RendererGizmoPort {
  attach(handle: object): RendererGizmoTransformState;
  detach(): void;
  dispose(): void;
  onDrag(listener: (event: RendererGizmoNativeEvent) => void): RendererUnsubscribe;
  restore(state: RendererGizmoTransformState): void;
  setMode(mode: RendererGizmoMode): void;
}

export type RendererGizmoFactory = (sceneNativeHandle: unknown) => RendererGizmoPort;
