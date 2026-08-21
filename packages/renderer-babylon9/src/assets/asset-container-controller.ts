import type {
  RendererAssetDisposeRequest,
  RendererAssetInstantiateRequest,
  RendererAssetLoadRequest,
  RendererFailureCategory,
  RendererProjectionRevision,
} from "../contracts/public.js";
import type {
  RendererHandleRegistrationEpoch,
  RendererHandleRegistryBridge,
} from "../registry/handle-port.js";
import { validateRendererAssetSource } from "../loaders/gltf2-source-policy.js";
import type {
  RendererAssetContainerFactory,
  RendererAssetContainerPort,
  RendererAssetInstancePort,
} from "./asset-port.js";

export interface RendererAssetDiagnosticSnapshot {
  readonly estimatedTextureRgba8EquivalentBytes: number;
  readonly inFlightLoadCount: number;
  readonly liveContainerCount: number;
  readonly liveInstanceCount: number;
  readonly loadedMeshCount: number;
}

export interface RendererAssetDisposalIssue {
  readonly cause?: unknown;
  readonly detail: string;
}

export type RendererAssetControllerResult =
  | {
      readonly accepted: true;
      readonly disposalIssues: readonly RendererAssetDisposalIssue[];
    }
  | {
      readonly accepted: false;
      readonly category: Extract<
        RendererFailureCategory,
        "ASSET_LOAD_FAILED" | "UNSUPPORTED_DECODER"
      >;
      readonly cause?: unknown;
      readonly detail: string;
      readonly disposalIssues: readonly RendererAssetDisposalIssue[];
    };

interface RendererAssetOperationToken {
  readonly assetId: string;
  readonly sequence: number;
  readonly sourceRevision: string;
}

interface RendererAssetInstanceSlot {
  readonly epoch: RendererHandleRegistrationEpoch;
  readonly handles: readonly object[];
  readonly instance: RendererAssetInstancePort;
  readonly stableId: string;
}

interface RendererAssetSlot {
  readonly container: RendererAssetContainerPort;
  readonly epoch: RendererHandleRegistrationEpoch;
  readonly instances: Map<string, RendererAssetInstanceSlot>;
  readonly sourceRevision: string;
}

const accepted = (
  disposalIssues: readonly RendererAssetDisposalIssue[] = [],
): RendererAssetControllerResult => ({ accepted: true, disposalIssues });

const rejected = (
  detail: string,
  category: "ASSET_LOAD_FAILED" | "UNSUPPORTED_DECODER" = "ASSET_LOAD_FAILED",
  cause?: unknown,
  disposalIssues: readonly RendererAssetDisposalIssue[] = [],
): RendererAssetControllerResult => ({ accepted: false, category, cause, detail, disposalIssues });

function isExactIdentity(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isValidMetric(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}

export class RendererAssetContainerController {
  readonly #factory: RendererAssetContainerFactory;
  readonly #inFlight = new Set<RendererAssetOperationToken>();
  readonly #registry: RendererHandleRegistryBridge;
  readonly #slots = new Map<string, RendererAssetSlot>();
  readonly #stableOwners = new Map<string, string>();
  #lifecycleGeneration = 0;
  #operationSequence = 0;
  #operations = new Map<string, RendererAssetOperationToken>();
  #terminal = false;

  constructor(factory: RendererAssetContainerFactory, registry: RendererHandleRegistryBridge) {
    this.#factory = factory;
    this.#registry = registry;
  }

  captureDiagnosticSnapshot(): RendererAssetDiagnosticSnapshot {
    let estimatedTextureRgba8EquivalentBytes = 0;
    let liveInstanceCount = 0;
    let loadedMeshCount = 0;
    for (const slot of this.#slots.values()) {
      estimatedTextureRgba8EquivalentBytes += slot.container.textureRgba8EquivalentBytes;
      loadedMeshCount += slot.container.loadedMeshCount;
      liveInstanceCount += slot.instances.size;
    }
    return Object.freeze({
      estimatedTextureRgba8EquivalentBytes,
      inFlightLoadCount: this.#inFlight.size,
      liveContainerCount: this.#slots.size,
      liveInstanceCount,
      loadedMeshCount,
    });
  }

  async load(
    request: RendererAssetLoadRequest,
    sceneNativeHandle: unknown,
    revision: RendererProjectionRevision,
    isLifecycleCurrent: () => boolean,
  ): Promise<RendererAssetControllerResult> {
    if (this.#terminal) return rejected("Asset loading authority is terminal.");
    const validation = validateRendererAssetSource(request);
    if (!validation.accepted) return rejected(validation.detail, validation.category);

    const current = this.#slots.get(request.assetId);
    if (
      current?.sourceRevision === request.sourceRevision &&
      !this.#operations.has(request.assetId)
    ) {
      return accepted();
    }
    const epoch = this.#registry.captureRegistrationEpoch(revision);
    if (epoch === null) return rejected("No current I4 registration epoch is available for load.");
    const sequence = this.#operationSequence + 1;
    if (!Number.isSafeInteger(sequence))
      return rejected("The asset operation sequence is exhausted.");
    this.#operationSequence = sequence;
    const token: RendererAssetOperationToken = Object.freeze({
      assetId: request.assetId,
      sequence,
      sourceRevision: request.sourceRevision,
    });
    const lifecycleGeneration = this.#lifecycleGeneration;
    this.#operations.set(request.assetId, token);
    this.#inFlight.add(token);

    let candidate: RendererAssetContainerPort;
    try {
      candidate = await this.#factory(sceneNativeHandle, validation.source);
    } catch (cause) {
      this.#inFlight.delete(token);
      if (this.#operations.get(request.assetId) === token) this.#operations.delete(request.assetId);
      return rejected("The private AssetContainer load failed.", "ASSET_LOAD_FAILED", cause);
    }
    this.#inFlight.delete(token);

    if (
      !isValidMetric(candidate.loadedMeshCount) ||
      !isValidMetric(candidate.textureRgba8EquivalentBytes)
    ) {
      const disposalIssues = this.#disposeCandidate(candidate, "The invalid candidate container");
      if (this.#operations.get(request.assetId) === token) this.#operations.delete(request.assetId);
      return rejected(
        "The private AssetContainer metrics are invalid.",
        "ASSET_LOAD_FAILED",
        undefined,
        disposalIssues,
      );
    }

    const authorityIsCurrent =
      !this.#terminal &&
      this.#operations.get(request.assetId) === token &&
      this.#lifecycleGeneration === lifecycleGeneration &&
      this.#registry.captureRegistrationEpoch(revision) === epoch &&
      isLifecycleCurrent();
    if (!authorityIsCurrent) {
      const disposalIssues = this.#disposeCandidate(candidate, "The stale candidate container");
      if (this.#operations.get(request.assetId) === token) this.#operations.delete(request.assetId);
      return rejected(
        "The asynchronous asset load was superseded before publication.",
        "ASSET_LOAD_FAILED",
        undefined,
        disposalIssues,
      );
    }

    this.#operations.delete(request.assetId);
    const disposalIssues = current === undefined ? [] : this.#disposeSlot(request.assetId, current);
    this.#slots.set(request.assetId, {
      container: candidate,
      epoch,
      instances: new Map(),
      sourceRevision: request.sourceRevision,
    });
    return accepted(disposalIssues);
  }

  instantiate(
    request: RendererAssetInstantiateRequest,
    revision: RendererProjectionRevision,
  ): RendererAssetControllerResult {
    if (
      this.#terminal ||
      typeof request !== "object" ||
      request === null ||
      !isExactIdentity(request.assetId) ||
      !isExactIdentity(request.sourceRevision) ||
      !isExactIdentity(request.stableId)
    ) {
      return rejected("The asset instantiation request is malformed or terminal.");
    }
    const slot = this.#slots.get(request.assetId);
    if (slot === undefined || slot.sourceRevision !== request.sourceRevision) {
      return rejected("No current matching AssetContainer is loaded.");
    }
    if (slot.instances.has(request.stableId)) return accepted();
    const owner = this.#stableOwners.get(request.stableId);
    if (owner !== undefined && owner !== request.assetId) {
      return rejected("The stable identity already belongs to another current asset instance.");
    }
    const epoch = this.#registry.captureRegistrationEpoch(revision);
    if (epoch === null || epoch !== slot.epoch) {
      return rejected("The asset container registration epoch is stale.");
    }

    let candidate: RendererAssetInstancePort;
    try {
      candidate = slot.container.instantiate();
    } catch (cause) {
      return rejected(
        "The private asset instance could not be created.",
        "ASSET_LOAD_FAILED",
        cause,
      );
    }
    const uniqueHandles = new Set<object>();
    try {
      if (!isValidMetric(candidate.meshCount)) {
        throw new Error("The private asset instance port is malformed.");
      }
      for (const handle of candidate.nativeHandles) {
        if (typeof handle !== "object" || handle === null) {
          throw new Error("The private asset instance contains a non-object native handle.");
        }
        uniqueHandles.add(handle);
      }
      if (uniqueHandles.size === 0) {
        throw new Error("The private asset instance contains no registerable native handles.");
      }
    } catch (cause) {
      const disposalIssues = this.#disposeInstanceCandidate(candidate);
      return rejected(
        "The private asset instance handles are invalid.",
        "ASSET_LOAD_FAILED",
        cause,
        disposalIssues,
      );
    }

    const registered: object[] = [];
    for (const handle of uniqueHandles) {
      if (!this.#registry.registerHandle(request.stableId, handle, epoch)) {
        for (const published of registered) this.#registry.unregisterHandle(published, epoch);
        const disposalIssues = this.#disposeInstanceCandidate(candidate);
        return rejected(
          "Atomic native-handle publication was rejected.",
          "ASSET_LOAD_FAILED",
          undefined,
          disposalIssues,
        );
      }
      registered.push(handle);
    }

    slot.instances.set(request.stableId, {
      epoch,
      handles: Object.freeze(registered),
      instance: candidate,
      stableId: request.stableId,
    });
    this.#stableOwners.set(request.stableId, request.assetId);
    return accepted();
  }

  disposeAsset(request: RendererAssetDisposeRequest): RendererAssetControllerResult {
    if (typeof request !== "object" || request === null || !isExactIdentity(request.assetId)) {
      return rejected("The AssetContainer disposal request is malformed.");
    }
    this.#operations.delete(request.assetId);
    const slot = this.#slots.get(request.assetId);
    if (slot === undefined) return accepted();
    this.#slots.delete(request.assetId);
    return accepted(this.#disposeSlot(request.assetId, slot));
  }

  observeContextLoss(): void {
    if (this.#terminal) return;
    this.#advanceLifecycleGeneration();
    this.#operations = new Map();
  }

  invalidateProjection(): readonly RendererAssetDisposalIssue[] {
    if (this.#terminal) return [];
    this.#advanceLifecycleGeneration();
    this.#operations = new Map();
    return this.#disposePublishedSlots();
  }

  terminalize(): void {
    if (this.#terminal) return;
    this.#terminal = true;
    this.#advanceLifecycleGeneration();
    this.#operations = new Map();
    this.#inFlight.clear();
  }

  disposeAll(): readonly RendererAssetDisposalIssue[] {
    return this.#disposePublishedSlots();
  }

  #advanceLifecycleGeneration(): void {
    const next = this.#lifecycleGeneration + 1;
    this.#lifecycleGeneration = Number.isSafeInteger(next) ? next : Number.MAX_SAFE_INTEGER;
  }

  #disposeCandidate(
    container: RendererAssetContainerPort,
    subject: string,
  ): readonly RendererAssetDisposalIssue[] {
    try {
      container.dispose();
      return [];
    } catch (cause) {
      return [{ cause, detail: `${subject} could not be disposed.` }];
    }
  }

  #disposeInstanceCandidate(
    instance: RendererAssetInstancePort,
  ): readonly RendererAssetDisposalIssue[] {
    try {
      instance.dispose();
      return [];
    } catch (cause) {
      return [{ cause, detail: "The rejected candidate asset instance could not be disposed." }];
    }
  }

  #disposePublishedSlots(): readonly RendererAssetDisposalIssue[] {
    const slots = [...this.#slots.entries()];
    this.#slots.clear();
    const issues: RendererAssetDisposalIssue[] = [];
    for (const [assetId, slot] of slots) issues.push(...this.#disposeSlot(assetId, slot));
    return issues;
  }

  #disposeSlot(assetId: string, slot: RendererAssetSlot): readonly RendererAssetDisposalIssue[] {
    const issues: RendererAssetDisposalIssue[] = [];
    const instances = [...slot.instances.values()];
    slot.instances.clear();
    for (const instance of instances) {
      for (const handle of instance.handles)
        this.#registry.unregisterHandle(handle, instance.epoch);
      if (this.#stableOwners.get(instance.stableId) === assetId) {
        this.#stableOwners.delete(instance.stableId);
      }
      try {
        instance.instance.dispose();
      } catch (cause) {
        issues.push({ cause, detail: "A private asset instance could not be disposed." });
      }
    }
    try {
      slot.container.dispose();
    } catch (cause) {
      issues.push({ cause, detail: "A private AssetContainer could not be disposed." });
    }
    return issues;
  }
}
