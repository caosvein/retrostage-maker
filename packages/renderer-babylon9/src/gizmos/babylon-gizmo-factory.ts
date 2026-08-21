import { GizmoManager, UtilityLayerRenderer } from "@babylonjs/core";

import type { RendererGizmoMode, RendererUnsubscribe } from "../contracts/public.js";
import type {
  RendererGizmoNativeEvent,
  RendererGizmoPort,
  RendererGizmoQuaternion,
  RendererGizmoTransformState,
} from "./gizmo-port.js";

interface MutableVector3 {
  x: number;
  y: number;
  z: number;
}

interface MutableQuaternion extends MutableVector3 {
  w: number;
}

interface TransformHandle {
  position: MutableVector3;
  rotation: MutableVector3;
  rotationQuaternion?: MutableQuaternion | null;
  scaling: MutableVector3;
}

interface NativeSnapshot {
  readonly handle: TransformHandle;
  readonly position: MutableVector3;
  readonly rotation: MutableVector3;
  readonly rotationQuaternion: MutableQuaternion | null;
  readonly scale: MutableVector3;
}

interface ObservableLike {
  add(listener: () => void): object | null;
  remove(observer: object | null): boolean;
}

interface ModeGizmoLike {
  readonly onDragEndObservable: ObservableLike;
  readonly onDragObservable: ObservableLike;
  readonly onDragStartObservable: ObservableLike;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function vector(value: unknown): MutableVector3 | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<MutableVector3>;
  return finite(candidate.x) && finite(candidate.y) && finite(candidate.z)
    ? { x: candidate.x, y: candidate.y, z: candidate.z }
    : null;
}

function normalize(value: MutableQuaternion): RendererGizmoQuaternion | null {
  const magnitude = Math.hypot(value.x, value.y, value.z, value.w);
  if (!finite(magnitude) || magnitude === 0) return null;
  return Object.freeze({
    w: value.w / magnitude,
    x: value.x / magnitude,
    y: value.y / magnitude,
    z: value.z / magnitude,
  });
}

function eulerToQuaternion(rotation: MutableVector3): RendererGizmoQuaternion | null {
  const halfRoll = rotation.z * 0.5;
  const halfPitch = rotation.x * 0.5;
  const halfYaw = rotation.y * 0.5;
  const sinRoll = Math.sin(halfRoll);
  const cosRoll = Math.cos(halfRoll);
  const sinPitch = Math.sin(halfPitch);
  const cosPitch = Math.cos(halfPitch);
  const sinYaw = Math.sin(halfYaw);
  const cosYaw = Math.cos(halfYaw);
  return normalize({
    w: cosYaw * cosPitch * cosRoll + sinYaw * sinPitch * sinRoll,
    x: cosYaw * sinPitch * cosRoll + sinYaw * cosPitch * sinRoll,
    y: sinYaw * cosPitch * cosRoll - cosYaw * sinPitch * sinRoll,
    z: cosYaw * cosPitch * sinRoll - sinYaw * sinPitch * cosRoll,
  });
}

function transformHandle(value: object): TransformHandle | null {
  const candidate = value as Partial<TransformHandle>;
  return vector(candidate.position) !== null &&
    vector(candidate.rotation) !== null &&
    vector(candidate.scaling) !== null
    ? (candidate as TransformHandle)
    : null;
}

function copyInto(target: MutableVector3, source: MutableVector3): void {
  target.x = source.x;
  target.y = source.y;
  target.z = source.z;
}

class BabylonGizmoPort implements RendererGizmoPort {
  readonly #listeners = new Set<(event: RendererGizmoNativeEvent) => void>();
  readonly #manager: GizmoManager;
  readonly #snapshots = new WeakMap<RendererGizmoTransformState, NativeSnapshot>();
  #attached: TransformHandle | null = null;
  #disposed = false;
  #mode: RendererGizmoMode = "position";
  #observerRemovers: (() => void)[] = [];

  constructor(manager: GizmoManager) {
    this.#manager = manager;
    this.#manager.usePointerToAttachGizmos = false;
    this.#manager.enableAutoPicking = false;
    this.setMode("position");
  }

  attach(handle: object): RendererGizmoTransformState {
    if (this.#disposed) throw new Error("The private Gizmo port is disposed.");
    const compatible = transformHandle(handle);
    if (compatible === null)
      throw new Error("The native Gizmo target is not transform-compatible.");
    this.#attached = compatible;
    this.#manager.attachToNode(
      compatible as unknown as Parameters<GizmoManager["attachToNode"]>[0],
    );
    return this.#captureState();
  }

  detach(): void {
    if (this.#disposed) return;
    this.#manager.attachToNode(null);
    this.#attached = null;
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#removeObservers();
    this.#listeners.clear();
    this.#attached = null;
    let failure: unknown;
    try {
      this.#manager.attachToNode(null);
    } catch (cause) {
      failure = cause;
    }
    try {
      this.#manager.dispose();
    } catch (cause) {
      failure ??= cause;
    }
    if (failure instanceof Error) throw failure;
    if (failure !== undefined) {
      throw new Error("The private Babylon Gizmo could not be disposed.", { cause: failure });
    }
  }

  onDrag(listener: (event: RendererGizmoNativeEvent) => void): RendererUnsubscribe {
    if (this.#disposed) return () => undefined;
    this.#listeners.add(listener);
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      this.#listeners.delete(listener);
    };
  }

  restore(state: RendererGizmoTransformState): void {
    if (this.#disposed) throw new Error("The private Gizmo port is disposed.");
    const snapshot = this.#snapshots.get(state);
    if (snapshot === undefined || snapshot.handle !== this.#attached) {
      throw new Error("The requested native Gizmo baseline is not current.");
    }
    copyInto(snapshot.handle.position, snapshot.position);
    copyInto(snapshot.handle.scaling, snapshot.scale);
    copyInto(snapshot.handle.rotation, snapshot.rotation);
    if (snapshot.rotationQuaternion === null) {
      snapshot.handle.rotationQuaternion = null;
    } else {
      const current = snapshot.handle.rotationQuaternion;
      if (current === null || current === undefined) {
        throw new Error("The native Quaternion representation is no longer available.");
      }
      copyInto(current, snapshot.rotationQuaternion);
      current.w = snapshot.rotationQuaternion.w;
    }
  }

  setMode(mode: RendererGizmoMode): void {
    if (this.#disposed) throw new Error("The private Gizmo port is disposed.");
    this.#removeObservers();
    this.#manager.positionGizmoEnabled = mode === "position";
    this.#manager.rotationGizmoEnabled = mode === "rotation";
    this.#manager.scaleGizmoEnabled = mode === "scale";
    this.#mode = mode;
    const gizmo = this.#activeGizmo();
    this.#observe(gizmo.onDragStartObservable, "begin");
    this.#observe(gizmo.onDragObservable, "update");
    this.#observe(gizmo.onDragEndObservable, "commit");
  }

  #activeGizmo(): ModeGizmoLike {
    const gizmo =
      this.#mode === "position"
        ? this.#manager.gizmos.positionGizmo
        : this.#mode === "rotation"
          ? this.#manager.gizmos.rotationGizmo
          : this.#manager.gizmos.scaleGizmo;
    if (gizmo === null) throw new Error("The requested Babylon Gizmo mode was not created.");
    return gizmo;
  }

  #observe(observable: ObservableLike, phase: "begin" | "commit" | "update"): void {
    const observer = observable.add(() => {
      if (this.#disposed || this.#attached === null) return;
      let event: RendererGizmoNativeEvent;
      try {
        event = Object.freeze({ phase, state: this.#captureState() });
      } catch {
        event = Object.freeze({ phase: "invalid", state: null });
      }
      for (const listener of this.#listeners) {
        try {
          listener(event);
        } catch {
          // Private listener failures have no authority to escape Babylon event processing.
        }
      }
    });
    this.#observerRemovers.push(() => {
      observable.remove(observer);
    });
  }

  #removeObservers(): void {
    for (const remove of this.#observerRemovers) remove();
    this.#observerRemovers = [];
  }

  #captureState(): RendererGizmoTransformState {
    const handle = this.#attached;
    if (handle === null) throw new Error("No native Gizmo target is attached.");
    const position = vector(handle.position);
    const rotation = vector(handle.rotation);
    const scale = vector(handle.scaling);
    if (position === null || rotation === null || scale === null) {
      throw new Error("The native Gizmo target transform is not finite.");
    }
    const rawQuaternion = handle.rotationQuaternion;
    const quaternion =
      rawQuaternion === null || rawQuaternion === undefined
        ? eulerToQuaternion(rotation)
        : vector(rawQuaternion) === null || !finite(rawQuaternion.w)
          ? null
          : normalize({
              x: rawQuaternion.x,
              y: rawQuaternion.y,
              z: rawQuaternion.z,
              w: rawQuaternion.w,
            });
    if (quaternion === null) throw new Error("The native Gizmo rotation is invalid.");
    const state: RendererGizmoTransformState = Object.freeze({
      position: Object.freeze(position),
      rotationQuaternion: quaternion,
      scale: Object.freeze(scale),
    });
    this.#snapshots.set(state, {
      handle,
      position,
      rotation,
      rotationQuaternion:
        rawQuaternion === null || rawQuaternion === undefined
          ? null
          : { x: rawQuaternion.x, y: rawQuaternion.y, z: rawQuaternion.z, w: rawQuaternion.w },
      scale,
    });
    return state;
  }
}

export function createBabylonGizmo(sceneNativeHandle: unknown): RendererGizmoPort {
  let utilityLayer: UtilityLayerRenderer | null = null;
  let manager: GizmoManager | null = null;
  try {
    utilityLayer = new UtilityLayerRenderer(
      sceneNativeHandle as ConstructorParameters<typeof UtilityLayerRenderer>[0],
    );
    manager = new GizmoManager(
      sceneNativeHandle as ConstructorParameters<typeof GizmoManager>[0],
      1,
      utilityLayer,
    );
    utilityLayer = null;
    return new BabylonGizmoPort(manager);
  } catch (cause) {
    if (manager === null) utilityLayer?.dispose();
    else manager.dispose();
    throw cause;
  }
}
