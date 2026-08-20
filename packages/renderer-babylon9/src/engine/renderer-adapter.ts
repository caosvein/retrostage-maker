import type {
  RendererAdapter,
  RendererCameraProjection,
  RendererDiagnosticSnapshot,
  RendererFailure,
  RendererFailureCategory,
  RendererFailureListener,
  RendererHostSurface,
  RendererIntentListener,
  RendererJsonValue,
  RendererLifecycleState,
  RendererOperationResult,
  RendererPickIntent,
  RendererPickRequest,
  RendererProjectionInput,
  RendererProjectionRevision,
  RendererProjectionResult,
  RendererSelectionState,
  RendererStateListener,
  RendererUnsubscribe,
} from "../contracts/public.js";
import { createBabylonCamera } from "../camera/babylon-camera-factory.js";
import { RendererCameraController } from "../camera/camera-controller.js";
import type { RendererCameraFactory } from "../camera/camera-port.js";
import { createBabylonPickObservation } from "../picking/babylon-picking-factory.js";
import { RendererPickingController } from "../picking/picking-controller.js";
import type { RendererPickingFactory } from "../picking/picking-port.js";
import { RendererHandleRegistry } from "../registry/handle-registry.js";
import type {
  RendererHandleRegistrationEpoch,
  RendererHandleRegistryBridge,
} from "../registry/handle-port.js";
import { createBabylonScene } from "../scene/babylon-scene-factory.js";
import type { RendererSceneFactory, RendererScenePort } from "../scene/scene-port.js";
import { RendererContextController } from "../surface/context-controller.js";
import { resolveRendererHostSurfaceCapability } from "../surface/host-capability.js";
import {
  RendererResizeController,
  scheduleRendererResize,
  type RendererResizeScheduler,
} from "../surface/resize-controller.js";
import { createBabylonEngine } from "./babylon-engine-factory.js";
import type { RendererEngineFactory, RendererEnginePort } from "./engine-port.js";

export interface RendererAdapterRuntimeOptions {
  readonly cameraFactory: RendererCameraFactory;
  readonly engineFactory: RendererEngineFactory;
  readonly pickingFactory?: RendererPickingFactory;
  readonly sceneFactory: RendererSceneFactory;
  readonly scheduleResize?: RendererResizeScheduler;
  readonly selectionSnapshotObserverForTests?: (selection: RendererSelectionState | null) => void;
}

export interface RendererEditorBridge {
  getLifecycleState(): RendererLifecycleState;
  getScene(): RendererScenePort | null;
  onLifecycleState(listener: RendererStateListener): RendererUnsubscribe;
  reportDisposalFailure(detail: string, cause?: unknown): void;
  reportViewControlFailure(detail: string, cause?: unknown): RendererOperationResult;
}

const editorBridges = new WeakMap<RendererAdapter, RendererEditorBridge>();
const handleBridges = new WeakMap<RendererAdapter, RendererHandleRegistryBridge>();

export function resolveRendererEditorBridge(adapter: RendererAdapter): RendererEditorBridge | null {
  return editorBridges.get(adapter) ?? null;
}

export function resolveRendererHandleBridge(
  adapter: RendererAdapter,
): RendererHandleRegistryBridge | null {
  return handleBridges.get(adapter) ?? null;
}

const emptyFailureCounts = (): Record<RendererFailureCategory, number> => ({
  ASSET_LOAD_FAILED: 0,
  CONTEXT_OR_DEVICE_LOST: 0,
  CONTEXT_OR_DEVICE_RESTORE_FAILED: 0,
  ENGINE_INITIALIZATION_FAILED: 0,
  HOST_SURFACE_UNAVAILABLE: 0,
  PICK_RESOLUTION_FAILED: 0,
  PROJECTION_REJECTED_OR_STALE: 0,
  RENDERER_INTERNAL_FAILURE: 0,
  RESOURCE_DISPOSAL_FAILED: 0,
  SCENE_PROJECTION_FAILED: 0,
  UNSUPPORTED_DECODER: 0,
  VIEW_CONTROL_REJECTED: 0,
});

const allowedTransitions: Readonly<
  Record<RendererLifecycleState, readonly RendererLifecycleState[]>
> = {
  DISPOSED: ["DISPOSED"],
  DISPOSING: ["DISPOSED"],
  FAILED: ["DISPOSING"],
  INITIALIZING: ["READY", "FAILED", "DISPOSING"],
  NEW: ["INITIALIZING", "DISPOSING"],
  READY: ["RUNNING", "FAILED", "DISPOSING"],
  RUNNING: ["SUSPENDED_CONTEXT_LOSS", "FAILED", "DISPOSING"],
  SUSPENDED_CONTEXT_LOSS: ["RUNNING", "FAILED", "DISPOSING"],
};

function causeSummary(cause: unknown): RendererFailure["cause"] {
  if (cause instanceof Error) {
    return { authoritative: false, summary: cause.message.slice(0, 256) };
  }
  if (typeof cause === "string") {
    return { authoritative: false, summary: cause.slice(0, 256) };
  }
  return null;
}

function isUsableHost(host: RendererHostSurface): boolean {
  return (
    host.available &&
    host.identity.length > 0 &&
    Number.isInteger(host.generation) &&
    host.generation >= 0 &&
    Number.isFinite(host.deviceScale) &&
    host.deviceScale > 0 &&
    Number.isFinite(host.logicalExtent.height) &&
    Number.isFinite(host.logicalExtent.width) &&
    Number.isFinite(host.pixelExtent.height) &&
    Number.isFinite(host.pixelExtent.width) &&
    host.logicalExtent.height > 0 &&
    host.logicalExtent.width > 0 &&
    host.pixelExtent.height > 0 &&
    host.pixelExtent.width > 0
  );
}

type RendererJsonCopyResult =
  | { readonly valid: true; readonly value: RendererJsonValue }
  | { readonly valid: false };

function copyRendererJsonValue(
  value: unknown,
  ancestors: Set<object> = new Set(),
): RendererJsonCopyResult {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return { valid: true, value };
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? { valid: true, value } : { valid: false };
  }
  if (typeof value !== "object" || ancestors.has(value)) return { valid: false };

  ancestors.add(value);
  if (Array.isArray(value)) {
    const copy: RendererJsonValue[] = [];
    for (const item of value) {
      const result = copyRendererJsonValue(item, ancestors);
      if (!result.valid) {
        ancestors.delete(value);
        return result;
      }
      copy.push(result.value);
    }
    ancestors.delete(value);
    return { valid: true, value: Object.freeze(copy) };
  }

  const prototype = Object.getPrototypeOf(value) as unknown;
  if (prototype !== Object.prototype && prototype !== null) {
    ancestors.delete(value);
    return { valid: false };
  }
  const copy: Record<string, RendererJsonValue> = Object.create(null) as Record<
    string,
    RendererJsonValue
  >;
  for (const [key, item] of Object.entries(value)) {
    const result = copyRendererJsonValue(item, ancestors);
    if (!result.valid) {
      ancestors.delete(value);
      return result;
    }
    copy[key] = result.value;
  }
  ancestors.delete(value);
  return { valid: true, value: Object.freeze(copy) };
}

function copyRendererSelectionState(value: unknown): RendererSelectionState | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<RendererSelectionState>;
  if (!Array.isArray(candidate.selectedIds)) return null;

  const selectedIds: string[] = [];
  const seen = new Set<string>();
  for (const stableId of candidate.selectedIds) {
    if (typeof stableId !== "string" || stableId.length === 0 || seen.has(stableId)) return null;
    seen.add(stableId);
    selectedIds.push(stableId);
  }
  if (
    candidate.primaryId !== null &&
    (typeof candidate.primaryId !== "string" ||
      candidate.primaryId.length === 0 ||
      !seen.has(candidate.primaryId))
  ) {
    return null;
  }
  const toolIntent = copyRendererJsonValue(candidate.toolIntent);
  if (!toolIntent.valid) return null;
  return Object.freeze({
    primaryId: candidate.primaryId,
    selectedIds: Object.freeze(selectedIds),
    toolIntent: toolIntent.value,
  });
}

class RendererAdapterRuntime implements RendererAdapter {
  readonly #cameraController: RendererCameraController;
  readonly #contextController = new RendererContextController();
  readonly #engineFactory: RendererEngineFactory;
  readonly #failureCounts = emptyFailureCounts();
  readonly #failureListeners = new Set<RendererFailureListener>();
  readonly #handleRegistry = new RendererHandleRegistry();
  readonly #pickingController: RendererPickingController;
  readonly #pickListeners = new Set<RendererIntentListener<RendererPickIntent>>();
  readonly #renderLoop = (): void => {
    if (!this.#renderLoopActive || this.#state !== "RUNNING") return;
    this.#renderOwnedScene();
  };
  readonly #sceneFactory: RendererSceneFactory;
  readonly #scheduleResize: RendererResizeScheduler;
  readonly #selectionSnapshotObserverForTests:
    | ((selection: RendererSelectionState | null) => void)
    | null;
  readonly #stateListeners = new Set<RendererStateListener>();
  #adapterGeneration = 0;
  #contextState: RendererDiagnosticSnapshot["contextState"] = "unavailable";
  #correlationIds: string[] = [];
  #disposalStarted = false;
  #derivedSelection: RendererSelectionState | null = null;
  #engine: RendererEnginePort | null = null;
  #framesRendered = 0;
  #hostGeneration: number | null = null;
  #latestProjection: RendererProjectionInput | null = null;
  #pendingEditorDisposalFailures: RendererFailure[] = [];
  #renderLoopActive = false;
  #resizeController: RendererResizeController | null = null;
  #scene: RendererScenePort | null = null;
  #state: RendererLifecycleState = "NEW";

  constructor(options: RendererAdapterRuntimeOptions) {
    this.#cameraController = new RendererCameraController(options.cameraFactory);
    this.#engineFactory = options.engineFactory;
    this.#pickingController = new RendererPickingController(
      this.#handleRegistry,
      options.pickingFactory,
    );
    this.#sceneFactory = options.sceneFactory;
    this.#scheduleResize = options.scheduleResize ?? scheduleRendererResize;
    this.#selectionSnapshotObserverForTests = options.selectionSnapshotObserverForTests ?? null;
    editorBridges.set(this, {
      getLifecycleState: () => this.#state,
      getScene: () => this.#scene,
      onLifecycleState: (listener) => this.onLifecycleState(listener),
      reportDisposalFailure: (detail, cause) => {
        this.#reportEditorDisposalFailure(detail, cause);
      },
      reportViewControlFailure: (detail, cause) => this.#viewControlFailure(detail, cause),
    });
    handleBridges.set(this, {
      captureRegistrationEpoch: (revision) =>
        this.#handleRegistry.captureRegistrationEpoch(revision),
      registerHandle: (stableId, handle, epoch) => this.#registerHandle(stableId, handle, epoch),
      unregisterHandle: (handle, epoch) => {
        this.#handleRegistry.unregisterHandle(handle, epoch);
      },
    });
  }

  get lifecycleState(): RendererLifecycleState {
    return this.#state;
  }

  attachSurface(host: RendererHostSurface): Promise<RendererOperationResult> {
    return Promise.resolve(this.#attachSurface(host));
  }

  #attachSurface(host: RendererHostSurface): RendererOperationResult {
    if (this.#state !== "NEW") {
      return this.#rejected(
        "RENDERER_INTERNAL_FAILURE",
        "recoverable",
        "A surface can only be attached to a NEW adapter.",
      );
    }
    if (!isUsableHost(host)) {
      return this.#rejected(
        "HOST_SURFACE_UNAVAILABLE",
        "recoverable",
        "The renderer host surface is unavailable or has an invalid extent.",
      );
    }

    const binding = resolveRendererHostSurfaceCapability(host.capability);
    if (binding === null) {
      return this.#rejected(
        "HOST_SURFACE_UNAVAILABLE",
        "recoverable",
        "The renderer host capability is not bound by this package instance.",
      );
    }

    let nativeSurface: unknown;
    try {
      nativeSurface = binding.resolveNativeSurface();
    } catch (cause) {
      return this.#rejected(
        "HOST_SURFACE_UNAVAILABLE",
        "recoverable",
        "The renderer host capability could not resolve its native surface.",
        cause,
      );
    }

    this.#transition("INITIALIZING");
    this.#hostGeneration = host.generation;
    this.#adapterGeneration += 1;

    let initializationPhase: "camera" | "engine-scene" = "engine-scene";
    try {
      this.#engine = this.#engineFactory(nativeSurface);
      this.#scene = this.#sceneFactory(this.#engine);
      initializationPhase = "camera";
      this.#cameraController.initialize(this.#scene.nativeHandle);
      initializationPhase = "engine-scene";

      this.#resizeController = new RendererResizeController(this.#scheduleResize, () => {
        this.#applyOwnedResize();
      });
      this.#resizeController.bind(binding, host.generation);
      this.#contextController.bind(binding, host.generation, (state, generation) => {
        this.#observeContext(state, generation);
      });

      this.#contextState = "available";
      this.#transition("READY");
      return { accepted: true };
    } catch (cause) {
      this.#transition("FAILED");
      const failure = this.#createFailure(
        initializationPhase === "camera" ? "VIEW_CONTROL_REJECTED" : "ENGINE_INITIALIZATION_FAILED",
        "fatal",
        initializationPhase === "camera"
          ? "The private Camera runtime could not be initialized."
          : "The private Engine/Scene runtime could not be initialized.",
        cause,
      );
      this.#recordFailure(failure);
      this.#cleanupPartialInitialization();
      return { accepted: false, failure };
    }
  }

  captureDiagnosticSnapshot(): RendererDiagnosticSnapshot {
    let fps: number | null = null;
    if (this.#engine !== null && this.#state !== "DISPOSED") {
      try {
        const candidate = this.#engine.getFps();
        if (Number.isFinite(candidate) && candidate > 0) fps = candidate;
      } catch {
        fps = null;
      }
    }

    const unavailableMetrics = ["drawCalls"];
    if (fps === null) unavailableMetrics.push("framesPerSecond", "frameMilliseconds");

    return {
      adapterGeneration: this.#adapterGeneration,
      contextState: this.#contextState,
      correlationIds: [...this.#correlationIds],
      failureCounts: { ...this.#failureCounts },
      health: this.#health(),
      lifecycleState: this.#state,
      projectionRevision: this.#latestProjection?.revision ?? null,
      resourceCounts: {
        engine: this.#engine === null ? 0 : 1,
        scene: this.#scene === null ? 0 : 1,
      },
      timing: {
        frameMilliseconds: fps === null ? null : 1000 / fps,
        framesPerSecond: fps,
        sampleCount: this.#framesRendered,
      },
      unavailableMetrics,
    };
  }

  detachSurface(): Promise<readonly RendererFailure[]> {
    return this.dispose();
  }

  dispose(): Promise<readonly RendererFailure[]> {
    if (this.#state === "DISPOSED" || this.#disposalStarted) return Promise.resolve([]);
    this.#disposalStarted = true;
    return Promise.resolve(this.#performDisposal());
  }

  initialize(host: RendererHostSurface): Promise<RendererOperationResult> {
    return this.attachSurface(host);
  }

  onFailure(listener: RendererFailureListener): RendererUnsubscribe {
    return this.#subscribe(this.#failureListeners, listener);
  }

  onLifecycleState(listener: RendererStateListener): RendererUnsubscribe {
    return this.#subscribe(this.#stateListeners, listener);
  }

  onPickIntent(listener: RendererIntentListener<RendererPickIntent>): RendererUnsubscribe {
    return this.#subscribe(this.#pickListeners, listener);
  }

  pick(request: RendererPickRequest): RendererOperationResult {
    const correlationId =
      typeof request === "object" &&
      request !== null &&
      typeof request.correlationId === "string" &&
      request.correlationId.length > 0
        ? request.correlationId
        : null;
    if (this.#state === "DISPOSING" || this.#state === "DISPOSED") {
      return {
        accepted: false,
        failure: this.#createFailure(
          "PICK_RESOLUTION_FAILED",
          "recoverable",
          "Picking is unavailable after renderer disposal begins.",
          undefined,
          correlationId,
        ),
      };
    }
    if (this.#state !== "RUNNING" || this.#scene === null || this.#latestProjection === null) {
      return this.#pickRejected(
        "Picking requires a RUNNING adapter with a current Scene and projection.",
        undefined,
        correlationId,
      );
    }

    const result = this.#pickingController.pick(
      this.#scene.nativeHandle,
      request,
      this.#latestProjection.revision,
      this.#adapterGeneration,
    );
    if (!result.accepted) {
      return this.#pickRejected(result.detail, result.cause, correlationId);
    }
    for (const listener of this.#pickListeners) {
      try {
        listener(result.intent);
      } catch {
        // External listeners have no authority to break pick translation.
      }
    }
    return { accepted: true };
  }

  project(input: RendererProjectionInput): Promise<RendererProjectionResult> {
    if (!this.#acceptsProjection()) {
      const failure = this.#createFailure(
        "PROJECTION_REJECTED_OR_STALE",
        "recoverable",
        "The adapter cannot accept projection input in its current lifecycle state.",
      );
      this.#recordFailure(failure);
      return Promise.resolve({ failure, status: "rejected" });
    }
    let activated = false;
    let revision: RendererProjectionRevision | null = null;
    try {
      revision = input.revision;
      activated = this.#handleRegistry.activateRevision(
        revision,
        this.#adapterGeneration,
        input.stableIds,
      );
    } catch {
      activated = false;
    }
    if (!activated || revision === null) {
      const failure = this.#createFailure(
        "PROJECTION_REJECTED_OR_STALE",
        "recoverable",
        "The projection stable identities or registry epoch are invalid.",
      );
      this.#recordFailure(failure);
      return Promise.resolve({ failure, status: "rejected" });
    }
    if (this.#latestProjection?.revision === revision) {
      return Promise.resolve({ status: "duplicate-no-op" });
    }
    this.#latestProjection = input;
    return Promise.resolve({ status: "accepted-current" });
  }

  render(): RendererOperationResult {
    if ((this.#state !== "READY" && this.#state !== "RUNNING") || this.#latestProjection === null) {
      return this.#rejected(
        "RENDERER_INTERNAL_FAILURE",
        "recoverable",
        "Rendering requires a ready/running adapter and an accepted projection.",
      );
    }
    return this.#renderOwnedScene();
  }

  resize(): RendererOperationResult {
    if (
      (this.#state !== "READY" && this.#state !== "RUNNING") ||
      this.#hostGeneration === null ||
      this.#resizeController === null ||
      !this.#resizeController.request(this.#hostGeneration)
    ) {
      return this.#rejected(
        "RENDERER_INTERNAL_FAILURE",
        "recoverable",
        "Resize requires an active current host generation.",
      );
    }
    return { accepted: true };
  }

  resetView(): RendererOperationResult {
    if (!this.#acceptsViewControl()) {
      return this.#viewControlFailure(
        "Camera reset requires READY, RUNNING, or SUSPENDED_CONTEXT_LOSS state.",
      );
    }
    try {
      this.#cameraController.reset(this.#state !== "SUSPENDED_CONTEXT_LOSS");
      return { accepted: true };
    } catch (cause) {
      return this.#viewControlFailure("The private Camera reset operation failed.", cause);
    }
  }

  setCameraProjection(projection: RendererCameraProjection): RendererOperationResult {
    if (!this.#acceptsViewControl()) {
      return this.#viewControlFailure(
        "Camera projection requires READY, RUNNING, or SUSPENDED_CONTEXT_LOSS state.",
      );
    }
    try {
      if (
        !this.#cameraController.setProjection(projection, this.#state !== "SUSPENDED_CONTEXT_LOSS")
      ) {
        return this.#viewControlFailure("The Camera projection is invalid.");
      }
      return { accepted: true };
    } catch (cause) {
      return this.#viewControlFailure("The private Camera projection operation failed.", cause);
    }
  }

  setSelection(selection: RendererSelectionState): RendererOperationResult {
    if (this.#state === "DISPOSING" || this.#state === "DISPOSED") {
      return {
        accepted: false,
        failure: this.#createFailure(
          "RENDERER_INTERNAL_FAILURE",
          "recoverable",
          "Derived selection is unavailable after renderer disposal begins.",
        ),
      };
    }
    if (!this.#acceptsProjection()) {
      return this.#rejected(
        "RENDERER_INTERNAL_FAILURE",
        "recoverable",
        "Derived selection requires READY, RUNNING, or SUSPENDED_CONTEXT_LOSS state.",
      );
    }
    const snapshot = copyRendererSelectionState(selection);
    if (snapshot === null) {
      return this.#rejected(
        "RENDERER_INTERNAL_FAILURE",
        "recoverable",
        "The derived selection state is invalid or not JSON-safe.",
      );
    }
    this.#derivedSelection = snapshot;
    this.#observeSelectionSnapshot(snapshot);
    return { accepted: true };
  }

  start(): Promise<RendererOperationResult> {
    if (this.#state === "RUNNING") return Promise.resolve({ accepted: true });
    if (
      this.#state !== "READY" ||
      this.#latestProjection === null ||
      this.#contextState !== "available"
    ) {
      return Promise.resolve(
        this.#rejected(
          "RENDERER_INTERNAL_FAILURE",
          "recoverable",
          "Start requires READY state, an accepted projection, and an available context.",
        ),
      );
    }

    try {
      this.#startOwnedLoop();
      this.#transition("RUNNING");
      return Promise.resolve({ accepted: true });
    } catch (cause) {
      this.#transition("FAILED");
      return Promise.resolve(
        this.#rejected(
          "RENDERER_INTERNAL_FAILURE",
          "fatal",
          "The private render loop could not be started.",
          cause,
        ),
      );
    }
  }

  #acceptsProjection(): boolean {
    return (
      this.#state === "READY" ||
      this.#state === "RUNNING" ||
      this.#state === "SUSPENDED_CONTEXT_LOSS"
    );
  }

  #acceptsViewControl(): boolean {
    return this.#acceptsProjection();
  }

  #applyOwnedResize(): void {
    if ((this.#state !== "READY" && this.#state !== "RUNNING") || this.#engine === null) return;
    try {
      this.#engine.resize();
    } catch (cause) {
      try {
        this.#stopOwnedLoop();
      } catch (stopCause) {
        this.#recordFailure(
          this.#createFailure(
            "RESOURCE_DISPOSAL_FAILED",
            "recoverable",
            "The render loop could not be stopped after a resize failure.",
            stopCause,
          ),
        );
      }
      this.#transition("FAILED");
      this.#recordFailure(
        this.#createFailure(
          "RENDERER_INTERNAL_FAILURE",
          "fatal",
          "The private Engine resize operation failed.",
          cause,
        ),
      );
    }
  }

  #cleanupPartialInitialization(): void {
    for (const cleanup of [
      () => this.#resizeController?.dispose(),
      () => this.#contextController.dispose(),
      () => this.#cameraController.dispose(),
      () => this.#scene?.dispose(),
      () => this.#engine?.dispose(),
    ]) {
      try {
        cleanup();
      } catch (cause) {
        this.#recordFailure(
          this.#createFailure(
            "RESOURCE_DISPOSAL_FAILED",
            "recoverable",
            "Partial initialization cleanup failed; remaining cleanup continued.",
            cause,
          ),
        );
      }
    }
    this.#clearOwnedState();
  }

  #clearOwnedState(): void {
    this.#engine = null;
    this.#scene = null;
    this.#resizeController = null;
    this.#hostGeneration = null;
    this.#latestProjection = null;
    this.#renderLoopActive = false;
    this.#contextState = "unavailable";
  }

  #registerHandle(
    stableId: string,
    handle: object,
    epoch: RendererHandleRegistrationEpoch,
  ): boolean {
    const accepted = this.#handleRegistry.registerHandle(stableId, handle, epoch);
    if (
      !accepted &&
      this.#state !== "DISPOSING" &&
      this.#state !== "DISPOSED" &&
      !this.#disposalStarted
    ) {
      this.#recordFailure(
        this.#createFailure(
          "PICK_RESOLUTION_FAILED",
          "recoverable",
          "A private native handle registration was rejected by the current registry epoch.",
        ),
      );
    }
    return accepted;
  }

  #createFailure(
    category: RendererFailureCategory,
    classification: RendererFailure["classification"],
    detail: string,
    cause?: unknown,
    correlationId: string | null = null,
  ): RendererFailure {
    return {
      category,
      cause: causeSummary(cause),
      classification,
      correlationId,
      detail,
      lifecycleState: this.#state,
      messageId: `renderer.${category.toLowerCase()}`,
      revision: this.#latestProjection?.revision ?? null,
      targetId: null,
    };
  }

  #health(): RendererDiagnosticSnapshot["health"] {
    switch (this.#state) {
      case "READY":
      case "RUNNING":
        return "healthy";
      case "FAILED":
        return "failed";
      case "INITIALIZING":
      case "SUSPENDED_CONTEXT_LOSS":
      case "DISPOSING":
        return "degraded";
      case "NEW":
      case "DISPOSED":
        return "unavailable";
    }
  }

  #observeSelectionSnapshot(selection: RendererSelectionState | null): void {
    if (this.#selectionSnapshotObserverForTests === null) return;
    try {
      this.#selectionSnapshotObserverForTests(selection);
    } catch {
      // A test observer has no authority to change renderer-owned derived state.
    }
  }

  #observeContext(state: "lost" | "restored", generation: number): void {
    if (generation !== this.#hostGeneration || this.#state === "DISPOSED") return;

    if (state === "lost") {
      this.#contextState = "lost";
      if (this.#state !== "RUNNING") return;

      try {
        this.#stopOwnedLoop();
        this.#transition("SUSPENDED_CONTEXT_LOSS");
        this.#recordFailure(
          this.#createFailure(
            "CONTEXT_OR_DEVICE_LOST",
            "recoverable",
            "The rendering context or device was lost; rendering is suspended.",
          ),
        );
      } catch (cause) {
        this.#transition("FAILED");
        this.#recordFailure(
          this.#createFailure(
            "RENDERER_INTERNAL_FAILURE",
            "fatal",
            "The render loop could not be suspended after context loss.",
            cause,
          ),
        );
      }
      return;
    }

    if (this.#state === "READY") {
      this.#contextState = "available";
      return;
    }
    if (this.#state !== "SUSPENDED_CONTEXT_LOSS") return;

    try {
      if (this.#engine === null || this.#scene === null || this.#latestProjection === null) {
        throw new Error("Context restore continuity state is incomplete.");
      }
      this.#engine.resize();
      this.#cameraController.reapply();
      this.#startOwnedLoop();
      this.#contextState = "available";
      this.#transition("RUNNING");
    } catch (cause) {
      this.#contextState = "lost";
      this.#transition("FAILED");
      this.#recordFailure(
        this.#createFailure(
          "CONTEXT_OR_DEVICE_RESTORE_FAILED",
          "fatal",
          "The rendering context or device could not be restored.",
          cause,
        ),
      );
    }
  }

  #performDisposal(): readonly RendererFailure[] {
    const failures: RendererFailure[] = [];
    this.#transition("DISPOSING", false);
    this.#pickingController.dispose();
    this.#handleRegistry.dispose();
    this.#derivedSelection = null;
    this.#observeSelectionSnapshot(null);

    const cleanup = (operation: () => void, detail: string): void => {
      try {
        operation();
      } catch (cause) {
        const failure = this.#createFailure(
          "RESOURCE_DISPOSAL_FAILED",
          "recoverable",
          detail,
          cause,
        );
        failures.push(failure);
        this.#recordFailure(failure);
      }
    };

    cleanup(() => this.#stopOwnedLoop(), "The render loop could not be stopped during disposal.");
    cleanup(
      () => this.#resizeController?.dispose(),
      "The resize observer could not be detached during disposal.",
    );
    cleanup(
      () => this.#contextController.dispose(),
      "The context observer could not be detached during disposal.",
    );
    this.#notifyStateListeners("DISPOSING");
    failures.push(...this.#pendingEditorDisposalFailures);
    this.#pendingEditorDisposalFailures = [];
    cleanup(() => this.#cameraController.dispose(), "The private Camera could not be disposed.");
    cleanup(() => this.#scene?.dispose(), "The private Scene could not be disposed.");
    cleanup(() => this.#engine?.dispose(), "The private Engine could not be disposed.");

    this.#clearOwnedState();
    this.#transition("DISPOSED");
    this.#failureListeners.clear();
    this.#pickListeners.clear();
    this.#stateListeners.clear();
    return failures;
  }

  #recordFailure(failure: RendererFailure): void {
    this.#failureCounts[failure.category] += 1;
    if (failure.correlationId !== null) this.#correlationIds.push(failure.correlationId);
    for (const listener of this.#failureListeners) {
      try {
        listener(failure);
      } catch {
        // External listeners have no authority to break renderer lifecycle handling.
      }
    }
  }

  #reportEditorDisposalFailure(detail: string, cause?: unknown): void {
    if (this.#state !== "DISPOSING") return;
    const failure = this.#createFailure("RESOURCE_DISPOSAL_FAILED", "recoverable", detail, cause);
    this.#pendingEditorDisposalFailures.push(failure);
    this.#recordFailure(failure);
  }

  #rejected(
    category: RendererFailureCategory,
    classification: RendererFailure["classification"],
    detail: string,
    cause?: unknown,
  ): RendererOperationResult {
    const failure = this.#createFailure(category, classification, detail, cause);
    this.#recordFailure(failure);
    return { accepted: false, failure };
  }

  #pickRejected(
    detail: string,
    cause?: unknown,
    correlationId: string | null = null,
  ): RendererOperationResult {
    const failure = this.#createFailure(
      "PICK_RESOLUTION_FAILED",
      "recoverable",
      detail,
      cause,
      correlationId,
    );
    this.#recordFailure(failure);
    return { accepted: false, failure };
  }

  #viewControlFailure(detail: string, cause?: unknown): RendererOperationResult {
    if (this.#state === "DISPOSED" || this.#state === "DISPOSING") {
      return {
        accepted: false,
        failure: this.#createFailure("VIEW_CONTROL_REJECTED", "recoverable", detail, cause),
      };
    }
    return this.#rejected("VIEW_CONTROL_REJECTED", "recoverable", detail, cause);
  }

  #renderOwnedScene(): RendererOperationResult {
    if (this.#scene === null) {
      return this.#rejected(
        "RENDERER_INTERNAL_FAILURE",
        "fatal",
        "No private Scene is available for rendering.",
      );
    }

    try {
      this.#scene.render();
      this.#framesRendered += 1;
      return { accepted: true };
    } catch (cause) {
      try {
        this.#stopOwnedLoop();
      } catch (stopCause) {
        this.#recordFailure(
          this.#createFailure(
            "RESOURCE_DISPOSAL_FAILED",
            "recoverable",
            "The render loop could not be stopped after a render failure.",
            stopCause,
          ),
        );
      }
      this.#transition("FAILED");
      return this.#rejected(
        "RENDERER_INTERNAL_FAILURE",
        "fatal",
        "The private Scene render operation failed.",
        cause,
      );
    }
  }

  #startOwnedLoop(): void {
    if (this.#renderLoopActive) return;
    if (this.#engine === null) throw new Error("No private Engine owns the render loop.");
    this.#renderLoopActive = true;
    try {
      this.#engine.runRenderLoop(this.#renderLoop);
    } catch (cause) {
      this.#renderLoopActive = false;
      throw cause;
    }
  }

  #stopOwnedLoop(): void {
    if (!this.#renderLoopActive) return;
    this.#renderLoopActive = false;
    if (this.#engine === null) throw new Error("The active render loop has no owning Engine.");
    this.#engine.stopRenderLoop(this.#renderLoop);
  }

  #subscribe<T>(listeners: Set<T>, listener: T): RendererUnsubscribe {
    if (this.#state === "DISPOSED" || this.#state === "DISPOSING") return () => undefined;
    listeners.add(listener);
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      listeners.delete(listener);
    };
  }

  #notifyStateListeners(next: RendererLifecycleState): void {
    for (const listener of this.#stateListeners) {
      try {
        listener(next);
      } catch {
        // External listeners have no authority to break renderer lifecycle handling.
      }
    }
  }

  #transition(next: RendererLifecycleState, notify = true): void {
    if (!allowedTransitions[this.#state].includes(next)) {
      throw new Error(`Forbidden renderer lifecycle transition: ${this.#state} -> ${next}`);
    }
    this.#state = next;
    if (notify) this.#notifyStateListeners(next);
  }
}

export function createRendererAdapter(): RendererAdapter {
  return new RendererAdapterRuntime({
    cameraFactory: createBabylonCamera,
    engineFactory: createBabylonEngine,
    pickingFactory: createBabylonPickObservation,
    sceneFactory: createBabylonScene,
  });
}

export function createRendererAdapterForTests(
  options: RendererAdapterRuntimeOptions,
): RendererAdapter {
  return new RendererAdapterRuntime(options);
}
