import type { RendererProjectionRevision } from "../contracts/public.js";
import type {
  RendererHandleRegistrationEpoch,
  RendererHandleRegistrySnapshot,
} from "./handle-port.js";

interface RendererHandleRegistryEpoch {
  readonly registrationEpoch: RendererHandleRegistrationEpoch;
  readonly stableIds: ReadonlySet<string>;
}

function isExactStableId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

export class RendererHandleRegistry {
  #activeEpoch: RendererHandleRegistryEpoch | null = null;
  #forward = new Map<string, Set<object>>();
  #resourceGeneration = 0;
  #reverse = new Map<object, string>();
  #terminal = false;

  activateRevision(
    revision: RendererProjectionRevision,
    sceneGeneration: number,
    stableIds: readonly string[],
  ): boolean {
    if (this.#terminal) return false;
    if (
      typeof revision !== "string" ||
      revision.length === 0 ||
      !Number.isSafeInteger(sceneGeneration) ||
      sceneGeneration < 1 ||
      !Array.isArray(stableIds)
    ) {
      return false;
    }
    if (
      this.#activeEpoch?.registrationEpoch.revision === revision &&
      this.#activeEpoch.registrationEpoch.sceneGeneration === sceneGeneration
    ) {
      return true;
    }

    const nextStableIds = new Set<string>();
    try {
      for (const stableId of stableIds) {
        if (!isExactStableId(stableId) || nextStableIds.has(stableId)) return false;
        nextStableIds.add(stableId);
      }
    } catch {
      return false;
    }
    const nextResourceGeneration = this.#resourceGeneration + 1;
    if (!Number.isSafeInteger(nextResourceGeneration)) return false;
    const registrationEpoch: RendererHandleRegistrationEpoch = Object.freeze({
      resourceGeneration: nextResourceGeneration,
      revision,
      sceneGeneration,
    });

    this.#activeEpoch = {
      registrationEpoch,
      stableIds: nextStableIds,
    };
    this.#resourceGeneration = nextResourceGeneration;
    this.#forward = new Map();
    this.#reverse = new Map();
    return true;
  }

  captureSnapshot(): RendererHandleRegistrySnapshot {
    return {
      activeRevision: this.#activeEpoch?.registrationEpoch.revision ?? null,
      handleCount: this.#reverse.size,
      resourceGeneration: this.#resourceGeneration,
      sceneGeneration: this.#activeEpoch?.registrationEpoch.sceneGeneration ?? null,
      stableIdCount: this.#forward.size,
      terminal: this.#terminal,
    };
  }

  captureRegistrationEpoch(
    revision: RendererProjectionRevision,
  ): RendererHandleRegistrationEpoch | null {
    const epoch = this.#activeEpoch?.registrationEpoch ?? null;
    return !this.#terminal && epoch?.revision === revision ? epoch : null;
  }

  dispose(): void {
    if (this.#terminal) return;
    this.#terminal = true;
    this.#activeEpoch = null;
    this.#forward = new Map();
    this.#reverse = new Map();
  }

  isCurrent(revision: RendererProjectionRevision, sceneGeneration: number): boolean {
    return (
      !this.#terminal &&
      this.#activeEpoch?.registrationEpoch.revision === revision &&
      this.#activeEpoch.registrationEpoch.sceneGeneration === sceneGeneration
    );
  }

  registerHandle(
    stableId: string,
    handle: object,
    registrationEpoch: RendererHandleRegistrationEpoch,
  ): boolean {
    const epoch = this.#activeEpoch;
    if (
      this.#terminal ||
      epoch === null ||
      registrationEpoch !== epoch.registrationEpoch ||
      !isExactStableId(stableId) ||
      !epoch.stableIds.has(stableId) ||
      typeof handle !== "object" ||
      handle === null
    ) {
      return false;
    }

    const existingOwner = this.#reverse.get(handle);
    if (existingOwner !== undefined) {
      return existingOwner === stableId && (this.#forward.get(stableId)?.has(handle) ?? false);
    }

    const nextHandles = new Set(this.#forward.get(stableId) ?? []);
    nextHandles.add(handle);
    const nextForward = new Map(this.#forward);
    nextForward.set(stableId, nextHandles);
    const nextReverse = new Map(this.#reverse);
    nextReverse.set(handle, stableId);
    this.#forward = nextForward;
    this.#reverse = nextReverse;
    return true;
  }

  resolveHandle(handle: object): string | null {
    if (this.#terminal || this.#activeEpoch === null) return null;
    const stableId = this.#reverse.get(handle);
    if (stableId === undefined || !this.#activeEpoch.stableIds.has(stableId)) return null;
    return this.#forward.get(stableId)?.has(handle) === true ? stableId : null;
  }

  resolveStableIdHandles(
    stableId: string,
    registrationEpoch: RendererHandleRegistrationEpoch,
  ): readonly object[] {
    const epoch = this.#activeEpoch;
    if (
      this.#terminal ||
      epoch === null ||
      registrationEpoch !== epoch.registrationEpoch ||
      !isExactStableId(stableId) ||
      !epoch.stableIds.has(stableId)
    ) {
      return Object.freeze([]);
    }
    const handles = this.#forward.get(stableId);
    if (handles === undefined) return Object.freeze([]);
    const current = [...handles].filter((handle) => this.#reverse.get(handle) === stableId);
    return Object.freeze(current);
  }

  unregisterHandle(handle: object, registrationEpoch: RendererHandleRegistrationEpoch): void {
    if (this.#terminal || registrationEpoch !== this.#activeEpoch?.registrationEpoch) return;
    const stableId = this.#reverse.get(handle);
    if (stableId === undefined) return;

    const nextReverse = new Map(this.#reverse);
    nextReverse.delete(handle);
    const nextForward = new Map(this.#forward);
    const nextHandles = new Set(nextForward.get(stableId) ?? []);
    nextHandles.delete(handle);
    if (nextHandles.size === 0) nextForward.delete(stableId);
    else nextForward.set(stableId, nextHandles);
    this.#forward = nextForward;
    this.#reverse = nextReverse;
  }
}
