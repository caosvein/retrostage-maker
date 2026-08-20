import { ArcRotateCamera, Vector3 } from "@babylonjs/core";

import type { RendererCameraProjection } from "../contracts/public.js";
import type { RendererCameraFactory } from "./camera-port.js";

export const createBabylonCamera: RendererCameraFactory = (sceneNativeHandle) => {
  if (
    sceneNativeHandle === null ||
    (typeof sceneNativeHandle !== "object" && typeof sceneNativeHandle !== "function")
  ) {
    throw new Error("The private Scene handle is unavailable for Camera construction.");
  }

  const camera = new ArcRotateCamera(
    "retrostage-camera",
    -1.5707963267948966,
    1.0471975511965976,
    12,
    Vector3.Zero(),
    sceneNativeHandle as ConstructorParameters<typeof ArcRotateCamera>[5],
  );

  const setProjection = (projection: RendererCameraProjection): void => {
    camera.alpha = projection.alphaRadians;
    camera.beta = projection.betaRadians;
    camera.radius = projection.radius;
    camera.fov = projection.verticalFieldOfViewRadians;
    camera.minZ = projection.nearClip;
    camera.maxZ = projection.farClip;
    camera.setTarget(new Vector3(projection.target.x, projection.target.y, projection.target.z));
  };

  return {
    dispose: () => camera.dispose(),
    setProjection,
  };
};
