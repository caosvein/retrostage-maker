import type {
  RendererInputModifiers,
  RendererJsonValue,
  RendererPickIntent,
  RendererPickRequest,
  RendererProjectionRevision,
  RendererVector3,
} from "../contracts/public.js";
import type { RendererHandleRegistry } from "../registry/handle-registry.js";
import type { RendererPickingFactory, RendererRawPickObservation } from "./picking-port.js";

export type RendererPickingControllerResult =
  | { readonly accepted: true; readonly intent: RendererPickIntent }
  | { readonly accepted: false; readonly cause?: unknown; readonly detail: string };

function copyModifiers(value: RendererInputModifiers): RendererInputModifiers | null {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof value.alt !== "boolean" ||
    typeof value.control !== "boolean" ||
    typeof value.meta !== "boolean" ||
    typeof value.shift !== "boolean"
  ) {
    return null;
  }
  return Object.freeze({
    alt: value.alt,
    control: value.control,
    meta: value.meta,
    shift: value.shift,
  });
}

function copyWorldPoint(value: RendererVector3 | null): RendererJsonValue | undefined {
  if (value === null) return null;
  if (
    typeof value !== "object" ||
    !Number.isFinite(value.x) ||
    !Number.isFinite(value.y) ||
    !Number.isFinite(value.z)
  ) {
    return undefined;
  }
  return Object.freeze({ x: value.x, y: value.y, z: value.z });
}

function validateRequest(request: RendererPickRequest): RendererInputModifiers | null {
  if (
    typeof request !== "object" ||
    request === null ||
    typeof request.correlationId !== "string" ||
    request.correlationId.length === 0 ||
    typeof request.normalizedPosition !== "object" ||
    request.normalizedPosition === null ||
    !Number.isFinite(request.normalizedPosition.x) ||
    !Number.isFinite(request.normalizedPosition.y) ||
    request.normalizedPosition.x < 0 ||
    request.normalizedPosition.x > 1 ||
    request.normalizedPosition.y < 0 ||
    request.normalizedPosition.y > 1
  ) {
    return null;
  }
  return copyModifiers(request.modifiers);
}

export class RendererPickingController {
  readonly #factory: RendererPickingFactory | null;
  readonly #registry: RendererHandleRegistry;
  #terminal = false;

  constructor(registry: RendererHandleRegistry, factory?: RendererPickingFactory) {
    this.#registry = registry;
    this.#factory = factory ?? null;
  }

  dispose(): void {
    this.#terminal = true;
  }

  pick(
    sceneNativeHandle: unknown,
    request: RendererPickRequest,
    revision: RendererProjectionRevision,
    sceneGeneration: number,
  ): RendererPickingControllerResult {
    if (this.#terminal) return { accepted: false, detail: "Picking authority is terminal." };
    const modifiers = validateRequest(request);
    if (modifiers === null) {
      return { accepted: false, detail: "The normalized viewport pick request is invalid." };
    }
    if (!this.#registry.isCurrent(revision, sceneGeneration)) {
      return { accepted: false, detail: "The private handle registry epoch is stale." };
    }
    if (this.#factory === null) {
      return { accepted: false, detail: "No private picking factory is configured." };
    }

    let observation: RendererRawPickObservation;
    try {
      observation = this.#factory(sceneNativeHandle, request.normalizedPosition);
    } catch (cause) {
      return { accepted: false, cause, detail: "The private Scene pick operation failed." };
    }

    if (observation.hitClass === "background") {
      return {
        accepted: true,
        intent: Object.freeze({
          classification: "viewport-pick",
          correlationId: request.correlationId,
          hitClass: "background",
          modifiers,
          observation: null,
          revision,
          targetId: null,
        }),
      };
    }

    if (
      typeof observation.handle !== "object" ||
      observation.handle === null ||
      (observation.distance !== null && !Number.isFinite(observation.distance))
    ) {
      return { accepted: false, detail: "The private target observation is invalid." };
    }
    const worldPoint = copyWorldPoint(observation.worldPoint);
    if (worldPoint === undefined) {
      return { accepted: false, detail: "The private target world point is invalid." };
    }
    const stableId = this.#registry.resolveHandle(observation.handle);
    if (stableId === null) {
      return { accepted: false, detail: "The native pick target has no current stable identity." };
    }

    return {
      accepted: true,
      intent: Object.freeze({
        classification: "viewport-pick",
        correlationId: request.correlationId,
        hitClass: "target",
        modifiers,
        observation: Object.freeze({
          distance: observation.distance,
          worldPoint,
        }),
        revision,
        targetId: stableId,
      }),
    };
  }
}
