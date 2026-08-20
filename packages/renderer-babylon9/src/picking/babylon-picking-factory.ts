import type { PickingInfo } from "@babylonjs/core";

import type { RendererViewportPoint } from "../contracts/public.js";
import type { RendererRawPickObservation } from "./picking-port.js";

interface BabylonPickingEngineCapability {
  getRenderHeight(): number;
  getRenderWidth(): number;
}

interface BabylonPickingSceneCapability {
  getEngine(): BabylonPickingEngineCapability;
  pick(x: number, y: number): PickingInfo | null;
}

function resolveSceneCapability(value: unknown): BabylonPickingSceneCapability {
  if (
    typeof value !== "object" ||
    value === null ||
    !("getEngine" in value) ||
    typeof value.getEngine !== "function" ||
    !("pick" in value) ||
    typeof value.pick !== "function"
  ) {
    throw new Error("The private Scene does not expose a usable picking capability.");
  }
  return value as BabylonPickingSceneCapability;
}

export function createBabylonPickObservation(
  sceneNativeHandle: unknown,
  normalizedPosition: RendererViewportPoint,
): RendererRawPickObservation {
  const scene = resolveSceneCapability(sceneNativeHandle);
  const engine = scene.getEngine();
  const width = engine.getRenderWidth();
  const height = engine.getRenderHeight();
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    throw new Error("The private Scene has invalid current render dimensions.");
  }

  const result = scene.pick(normalizedPosition.x * width, normalizedPosition.y * height);
  if (result === null || !result.hit || result.pickedMesh === null) {
    return { hitClass: "background" };
  }

  const point = result.pickedPoint;
  const worldPoint =
    point !== null &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    Number.isFinite(point.z)
      ? { x: point.x, y: point.y, z: point.z }
      : null;
  return {
    distance: Number.isFinite(result.distance) ? result.distance : null,
    handle: result.pickedMesh,
    hitClass: "target",
    worldPoint,
  };
}
