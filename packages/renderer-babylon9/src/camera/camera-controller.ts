import type { RendererCameraProjection } from "../contracts/public.js";
import type { RendererCameraFactory, RendererCameraPort } from "./camera-port.js";

export const DEFAULT_RENDERER_CAMERA_PROJECTION: RendererCameraProjection = Object.freeze({
  alphaRadians: -1.5707963267948966,
  betaRadians: 1.0471975511965976,
  farClip: 1000,
  nearClip: 0.1,
  radius: 12,
  target: Object.freeze({ x: 0, y: 0, z: 0 }),
  verticalFieldOfViewRadians: 0.7853981633974483,
});

function cloneProjection(projection: RendererCameraProjection): RendererCameraProjection {
  return {
    alphaRadians: projection.alphaRadians,
    betaRadians: projection.betaRadians,
    farClip: projection.farClip,
    nearClip: projection.nearClip,
    radius: projection.radius,
    target: { ...projection.target },
    verticalFieldOfViewRadians: projection.verticalFieldOfViewRadians,
  };
}

function isRendererCameraProjectionValid(projection: RendererCameraProjection): boolean {
  return (
    Number.isFinite(projection.alphaRadians) &&
    Number.isFinite(projection.betaRadians) &&
    Number.isFinite(projection.radius) &&
    Number.isFinite(projection.target.x) &&
    Number.isFinite(projection.target.y) &&
    Number.isFinite(projection.target.z) &&
    Number.isFinite(projection.verticalFieldOfViewRadians) &&
    Number.isFinite(projection.nearClip) &&
    Number.isFinite(projection.farClip) &&
    projection.radius > 0 &&
    projection.betaRadians > 0 &&
    projection.betaRadians < Math.PI &&
    projection.verticalFieldOfViewRadians > 0 &&
    projection.verticalFieldOfViewRadians < Math.PI &&
    projection.nearClip > 0 &&
    projection.farClip > projection.nearClip
  );
}

export class RendererCameraController {
  readonly #factory: RendererCameraFactory;
  #camera: RendererCameraPort | null = null;
  #desiredProjection = cloneProjection(DEFAULT_RENDERER_CAMERA_PROJECTION);
  #disposed = false;

  constructor(factory: RendererCameraFactory) {
    this.#factory = factory;
  }

  currentProjection(): RendererCameraProjection {
    return cloneProjection(this.#desiredProjection);
  }

  initialize(sceneNativeHandle: unknown): void {
    if (this.#disposed) throw new Error("The Camera controller is disposed.");
    if (this.#camera !== null) throw new Error("The Camera controller already owns a Camera.");

    const camera = this.#factory(sceneNativeHandle);
    try {
      camera.setProjection(this.#desiredProjection);
      this.#camera = camera;
    } catch (cause) {
      try {
        camera.dispose();
      } catch {
        // The initialization failure remains authoritative; adapter cleanup continues.
      }
      throw cause;
    }
  }

  setProjection(projection: RendererCameraProjection, applyPrivate: boolean): boolean {
    if (!isRendererCameraProjectionValid(projection)) return false;
    const next = cloneProjection(projection);
    this.#desiredProjection = next;
    if (applyPrivate) this.#requireCamera().setProjection(next);
    return true;
  }

  reset(applyPrivate: boolean): void {
    const next = cloneProjection(DEFAULT_RENDERER_CAMERA_PROJECTION);
    this.#desiredProjection = next;
    if (applyPrivate) this.#requireCamera().setProjection(next);
  }

  reapply(): void {
    this.#requireCamera().setProjection(this.#desiredProjection);
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    const camera = this.#camera;
    this.#camera = null;
    camera?.dispose();
  }

  #requireCamera(): RendererCameraPort {
    if (this.#camera === null) throw new Error("No private Camera is available.");
    return this.#camera;
  }
}
