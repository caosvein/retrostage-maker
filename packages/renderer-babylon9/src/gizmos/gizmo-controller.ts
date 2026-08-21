import type {
  RendererAdapter,
  RendererGizmoIntent,
  RendererGizmoMode,
  RendererIntentListener,
  RendererJsonValue,
  RendererLifecycleState,
  RendererOperationResult,
  RendererProjectionRevision,
  RendererSelectionState,
  RendererUnsubscribe,
  RendererVector3,
} from "../contracts/public.js";
import {
  resolveRendererEditorBridge,
  type RendererEditorBridge,
} from "../engine/renderer-adapter.js";
import type { RendererHandleRegistrationEpoch } from "../registry/handle-port.js";
import { createBabylonGizmo } from "./babylon-gizmo-factory.js";
import type {
  RendererGizmoFactory,
  RendererGizmoNativeEvent,
  RendererGizmoPort,
  RendererGizmoQuaternion,
  RendererGizmoTransformState,
} from "./gizmo-port.js";

export interface RendererEditorGizmoControls {
  attachGizmo(): RendererOperationResult;
  detachGizmo(): RendererOperationResult;
  onGizmoIntent(listener: RendererIntentListener<RendererGizmoIntent>): RendererUnsubscribe;
  setGizmoMode(mode: RendererGizmoMode): RendererOperationResult;
}

interface RendererGizmoAttachment {
  readonly baseline: RendererGizmoTransformState;
  readonly handle: object;
  readonly nativeBaseline: RendererGizmoTransformState;
  readonly registrationEpoch: RendererHandleRegistrationEpoch;
  readonly revision: RendererProjectionRevision;
  readonly stableId: string;
}

interface RendererGizmoGesture {
  readonly baseline: RendererGizmoTransformState;
  readonly correlationId: string;
  readonly handle: object;
  readonly kind: RendererGizmoMode;
  readonly nativeBaseline: RendererGizmoTransformState;
  readonly registrationEpoch: RendererHandleRegistrationEpoch;
  readonly revision: RendererProjectionRevision;
  readonly stableId: string;
}

const validStates = new Set<RendererLifecycleState>(["READY", "RUNNING", "SUSPENDED_CONTEXT_LOSS"]);

function isMode(value: unknown): value is RendererGizmoMode {
  return value === "position" || value === "rotation" || value === "scale";
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function frozenVector(value: unknown): RendererVector3 | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<RendererVector3>;
  if (!finite(candidate.x) || !finite(candidate.y) || !finite(candidate.z)) return null;
  return Object.freeze({ x: candidate.x, y: candidate.y, z: candidate.z });
}

function normalizedQuaternion(value: unknown): RendererGizmoQuaternion | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<RendererGizmoQuaternion>;
  if (
    !finite(candidate.x) ||
    !finite(candidate.y) ||
    !finite(candidate.z) ||
    !finite(candidate.w)
  ) {
    return null;
  }
  const magnitude = Math.hypot(candidate.x, candidate.y, candidate.z, candidate.w);
  if (!finite(magnitude) || magnitude === 0) return null;
  return Object.freeze({
    w: candidate.w / magnitude,
    x: candidate.x / magnitude,
    y: candidate.y / magnitude,
    z: candidate.z / magnitude,
  });
}

function normalizedState(value: unknown): RendererGizmoTransformState | null {
  if (typeof value !== "object" || value === null) return null;
  const candidate = value as Partial<RendererGizmoTransformState>;
  const position = frozenVector(candidate.position);
  const rotationQuaternion = normalizedQuaternion(candidate.rotationQuaternion);
  const scale = frozenVector(candidate.scale);
  if (position === null || rotationQuaternion === null || scale === null) return null;
  return Object.freeze({ position, rotationQuaternion, scale });
}

function subtractVector(current: RendererVector3, baseline: RendererVector3): RendererVector3 {
  return Object.freeze({
    x: current.x - baseline.x,
    y: current.y - baseline.y,
    z: current.z - baseline.z,
  });
}

function jsonVector(value: RendererVector3): RendererJsonValue {
  return Object.freeze({ x: value.x, y: value.y, z: value.z });
}

function jsonQuaternion(value: RendererGizmoQuaternion): RendererJsonValue {
  return Object.freeze({ w: value.w, x: value.x, y: value.y, z: value.z });
}

function relativeQuaternion(
  current: RendererGizmoQuaternion,
  baseline: RendererGizmoQuaternion,
): RendererGizmoQuaternion | null {
  return normalizedQuaternion({
    w:
      current.w * baseline.w +
      current.x * baseline.x +
      current.y * baseline.y +
      current.z * baseline.z,
    x:
      -current.w * baseline.x +
      current.x * baseline.w -
      current.y * baseline.z +
      current.z * baseline.y,
    y:
      -current.w * baseline.y +
      current.x * baseline.z +
      current.y * baseline.w -
      current.z * baseline.x,
    z:
      -current.w * baseline.z -
      current.x * baseline.y +
      current.y * baseline.x +
      current.z * baseline.w,
  });
}

function frozenEnvelope(
  mode: RendererGizmoMode,
  current: RendererGizmoTransformState,
  baseline: RendererGizmoTransformState,
): { readonly candidate: RendererJsonValue; readonly delta: RendererJsonValue } | null {
  if (mode === "position") {
    const candidate: RendererJsonValue = Object.freeze({ position: jsonVector(current.position) });
    const delta: RendererJsonValue = Object.freeze({
      position: jsonVector(subtractVector(current.position, baseline.position)),
    });
    return Object.freeze({
      candidate,
      delta,
    });
  }
  if (mode === "scale") {
    const candidate: RendererJsonValue = Object.freeze({ scale: jsonVector(current.scale) });
    const delta: RendererJsonValue = Object.freeze({
      scale: jsonVector(subtractVector(current.scale, baseline.scale)),
    });
    return Object.freeze({
      candidate,
      delta,
    });
  }
  const delta = relativeQuaternion(current.rotationQuaternion, baseline.rotationQuaternion);
  if (delta === null) return null;
  const candidate: RendererJsonValue = Object.freeze({
    rotationQuaternion: jsonQuaternion(current.rotationQuaternion),
  });
  const relative: RendererJsonValue = Object.freeze({
    rotationQuaternion: jsonQuaternion(delta),
  });
  return Object.freeze({
    candidate,
    delta: relative,
  });
}

function exactSingleSelection(selection: RendererSelectionState | null): string | null {
  if (
    selection === null ||
    selection.selectedIds.length !== 1 ||
    selection.primaryId === null ||
    selection.primaryId !== selection.selectedIds[0]
  ) {
    return null;
  }
  return selection.primaryId;
}

class RendererGizmoController implements RendererEditorGizmoControls {
  readonly #bridge: RendererEditorBridge;
  readonly #factory: RendererGizmoFactory;
  readonly #intentListeners = new Set<RendererIntentListener<RendererGizmoIntent>>();
  #activeGesture: RendererGizmoGesture | null = null;
  #attachment: RendererGizmoAttachment | null = null;
  #desiredAttached = false;
  #gestureSequence: number;
  #mode: RendererGizmoMode = "position";
  #port: RendererGizmoPort | null = null;
  #portUnsubscribe: RendererUnsubscribe = () => undefined;
  #terminal = false;
  #unsubscribes: RendererUnsubscribe[] = [];

  constructor(adapter: RendererAdapter, factory: RendererGizmoFactory, gestureSequence = 0) {
    const bridge = resolveRendererEditorBridge(adapter);
    if (bridge === null) throw new Error("The adapter is not a compatible renderer runtime.");
    this.#bridge = bridge;
    this.#factory = factory;
    this.#gestureSequence = gestureSequence;
    this.#unsubscribes = [
      bridge.onSelectionSnapshot(() => this.#reconcile()),
      bridge.onProjectionRevision(() => this.#reconcile()),
      bridge.onHandleRegistryChange(() => this.#reconcile()),
      bridge.onLifecycleState((state) => this.#observeLifecycle(state)),
      bridge.onBeforeGridDisposal(() => this.#disposeForAdapter()),
    ];
  }

  attachGizmo(): RendererOperationResult {
    const state = this.#bridge.getLifecycleState();
    if (this.#terminal || !validStates.has(state))
      return this.#rejected("Gizmo attachment is unavailable.");
    this.#desiredAttached = true;
    if (state === "SUSPENDED_CONTEXT_LOSS") return { accepted: true };
    return this.#reconcile()
      ? { accepted: true }
      : this.#rejected("Gizmo attachment requires one exact current selected native handle.");
  }

  detachGizmo(): RendererOperationResult {
    const state = this.#bridge.getLifecycleState();
    if (this.#terminal || !validStates.has(state))
      return this.#rejected("Gizmo detachment is unavailable.");
    this.#desiredAttached = false;
    this.#cancelActive(state === "READY" || state === "RUNNING");
    this.#detachNative(false);
    return { accepted: true };
  }

  onGizmoIntent(listener: RendererIntentListener<RendererGizmoIntent>): RendererUnsubscribe {
    if (this.#terminal) return () => undefined;
    this.#intentListeners.add(listener);
    let subscribed = true;
    return () => {
      if (!subscribed) return;
      subscribed = false;
      this.#intentListeners.delete(listener);
    };
  }

  setGizmoMode(mode: RendererGizmoMode): RendererOperationResult {
    const state = this.#bridge.getLifecycleState();
    if (this.#terminal || !validStates.has(state) || !isMode(mode)) {
      return this.#rejected("The requested Gizmo mode is invalid or unavailable.");
    }
    if (mode === this.#mode) return { accepted: true };
    this.#cancelActive(state === "READY" || state === "RUNNING");
    this.#mode = mode;
    if (state === "SUSPENDED_CONTEXT_LOSS" || this.#port === null) return { accepted: true };
    try {
      this.#port.setMode(mode);
      return { accepted: true };
    } catch (cause) {
      this.#detachNative(false);
      return this.#rejected("The private Gizmo mode could not be changed.", cause);
    }
  }

  #rejected(detail: string, cause?: unknown): RendererOperationResult {
    return this.#bridge.reportViewControlFailure(detail, cause);
  }

  #observeLifecycle(state: RendererLifecycleState): void {
    if (this.#terminal) return;
    if (state === "SUSPENDED_CONTEXT_LOSS") {
      this.#cancelActive(false);
      this.#detachNative(false);
      return;
    }
    if (state === "READY" || state === "RUNNING") this.#reconcile();
  }

  #currentResolution(): {
    readonly handle: object;
    readonly registrationEpoch: RendererHandleRegistrationEpoch;
    readonly revision: RendererProjectionRevision;
    readonly stableId: string;
  } | null {
    const stableId = exactSingleSelection(this.#bridge.getSelectionSnapshot());
    const revision = this.#bridge.getProjectionRevision();
    if (stableId === null || revision === null) return null;
    const resolution = this.#bridge.resolveCurrentHandles(stableId, revision);
    if (resolution === null || resolution.handles.length !== 1) return null;
    return {
      handle: resolution.handles[0]!,
      registrationEpoch: resolution.registrationEpoch,
      revision,
      stableId,
    };
  }

  #reconcile(): boolean {
    if (this.#terminal || !this.#desiredAttached) return false;
    const state = this.#bridge.getLifecycleState();
    if (state === "SUSPENDED_CONTEXT_LOSS") return true;
    if (state !== "READY" && state !== "RUNNING") return false;
    const current = this.#currentResolution();
    const attached = this.#attachment;
    if (
      current !== null &&
      attached !== null &&
      current.handle === attached.handle &&
      current.registrationEpoch === attached.registrationEpoch &&
      current.revision === attached.revision &&
      current.stableId === attached.stableId
    ) {
      return true;
    }
    this.#cancelActive(true);
    this.#detachNative(false);
    if (current === null) return false;
    try {
      const port = this.#ensurePort();
      port.setMode(this.#mode);
      const nativeBaseline = port.attach(current.handle);
      const baseline = normalizedState(nativeBaseline);
      if (baseline === null) throw new Error("The native Gizmo target transform is invalid.");
      this.#attachment = Object.freeze({ ...current, baseline, nativeBaseline });
      return true;
    } catch {
      this.#detachNative(false);
      return false;
    }
  }

  #ensurePort(): RendererGizmoPort {
    if (this.#port !== null) return this.#port;
    const scene = this.#bridge.getScene();
    if (scene === null) throw new Error("No private Scene is available for the editor Gizmo.");
    const port = this.#factory(scene.nativeHandle);
    this.#port = port;
    this.#portUnsubscribe = port.onDrag((event) => this.#observeNativeDrag(event));
    return port;
  }

  #authorityCurrent(gesture: RendererGizmoGesture): boolean {
    const state = this.#bridge.getLifecycleState();
    if (state !== "READY" && state !== "RUNNING") return false;
    const current = this.#currentResolution();
    return (
      current !== null &&
      current.handle === gesture.handle &&
      current.registrationEpoch === gesture.registrationEpoch &&
      current.revision === gesture.revision &&
      current.stableId === gesture.stableId &&
      this.#attachment?.handle === gesture.handle &&
      this.#mode === gesture.kind
    );
  }

  #observeNativeDrag(event: RendererGizmoNativeEvent): void {
    if (this.#terminal || this.#port === null) return;
    if (event.phase === "invalid") {
      this.#recoverInvalidNativeState();
      return;
    }
    const state = normalizedState(event.state);
    if (state === null) {
      this.#cancelActive(true);
      this.#detachNative(false);
      return;
    }
    if (event.phase === "begin") {
      this.#beginGesture(event.state, state);
      return;
    }
    const gesture = this.#activeGesture;
    if (gesture === null) return;
    if (!this.#authorityCurrent(gesture)) {
      this.#cancelActive(true);
      this.#detachNative(false);
      return;
    }
    if (event.phase === "update") {
      const intent = this.#createIntent("update", gesture, state);
      if (intent === null) {
        this.#cancelActive(true);
        this.#detachNative(false);
        return;
      }
      this.#publish(intent);
      return;
    }
    const intent = this.#createIntent("commit", gesture, state);
    if (intent === null) {
      this.#cancelActive(true);
      this.#detachNative(false);
      return;
    }
    try {
      this.#port.restore(gesture.nativeBaseline);
    } catch (cause) {
      this.#activeGesture = null;
      this.#detachNative(false);
      this.#rejected("The transient Gizmo transform could not be restored before commit.", cause);
      return;
    }
    this.#activeGesture = null;
    this.#publish(intent);
  }

  #beginGesture(
    nativeBaseline: RendererGizmoTransformState,
    baseline: RendererGizmoTransformState,
  ): void {
    if (this.#activeGesture !== null) this.#cancelActive(true);
    const attachment = this.#attachment;
    if (attachment === null) {
      this.#detachNative(false);
      return;
    }
    if (this.#gestureSequence >= Number.MAX_SAFE_INTEGER) {
      this.#rejectSequenceExhaustion();
      return;
    }
    const provisional: RendererGizmoGesture = Object.freeze({
      baseline,
      correlationId: "",
      handle: attachment.handle,
      kind: this.#mode,
      nativeBaseline,
      registrationEpoch: attachment.registrationEpoch,
      revision: attachment.revision,
      stableId: attachment.stableId,
    });
    if (!this.#authorityCurrent(provisional)) {
      this.#detachNative(false);
      return;
    }
    this.#gestureSequence += 1;
    const gesture: RendererGizmoGesture = Object.freeze({
      ...provisional,
      correlationId: `gizmo:${this.#gestureSequence}`,
    });
    this.#activeGesture = gesture;
    const intent = this.#createIntent("begin", gesture, baseline);
    if (intent === null) {
      this.#cancelActive(true);
      this.#detachNative(false);
      return;
    }
    this.#publish(intent);
  }

  #recoverInvalidNativeState(): void {
    if (this.#activeGesture !== null) {
      this.#cancelActive(true);
      this.#detachNative(false);
      return;
    }
    const attachment = this.#attachment;
    if (attachment !== null) {
      try {
        this.#port?.restore(attachment.nativeBaseline);
      } catch (cause) {
        this.#rejected(
          "The attached Gizmo baseline could not be restored after invalid native state.",
          cause,
        );
      }
    }
    this.#detachNative(false);
  }

  #rejectSequenceExhaustion(): void {
    let cause: unknown;
    try {
      this.#port?.detach();
    } catch (detachCause) {
      cause = detachCause;
    }
    this.#attachment = null;
    this.#rejected("The private Gizmo gesture sequence is exhausted.", cause);
  }

  #createIntent(
    phase: RendererGizmoIntent["phase"],
    gesture: RendererGizmoGesture,
    current: RendererGizmoTransformState,
  ): RendererGizmoIntent | null {
    const envelope = frozenEnvelope(gesture.kind, current, gesture.baseline);
    if (envelope === null) return null;
    return Object.freeze({
      candidate: envelope.candidate,
      correlationId: gesture.correlationId,
      delta: envelope.delta,
      kind: gesture.kind,
      phase,
      revision: gesture.revision,
      targetId: gesture.stableId,
    });
  }

  #cancelActive(publish: boolean): void {
    const gesture = this.#activeGesture;
    if (gesture === null) return;
    this.#activeGesture = null;
    let restored = false;
    try {
      this.#port?.restore(gesture.nativeBaseline);
      restored = true;
    } catch (cause) {
      this.#rejected("The transient Gizmo transform could not be restored during cancel.", cause);
    }
    if (!restored || !publish || this.#terminal) return;
    const state = this.#bridge.getLifecycleState();
    if (state !== "READY" && state !== "RUNNING") return;
    const intent = this.#createIntent("cancel", gesture, gesture.baseline);
    if (intent !== null) this.#publish(intent);
  }

  #publish(intent: RendererGizmoIntent): void {
    if (this.#terminal) return;
    for (const listener of this.#intentListeners) {
      try {
        listener(intent);
      } catch {
        // External listeners have no authority to break renderer/editor state.
      }
    }
  }

  #detachNative(disposal: boolean): void {
    if (this.#port === null) {
      this.#attachment = null;
      return;
    }
    try {
      this.#port.detach();
    } catch (cause) {
      if (disposal) {
        this.#bridge.reportDisposalFailure(
          "The private Gizmo target could not be detached.",
          cause,
        );
      } else {
        this.#rejected("The private Gizmo target could not be detached.", cause);
      }
    }
    this.#attachment = null;
  }

  #disposeForAdapter(): void {
    if (this.#terminal) return;
    this.#terminal = true;
    this.#intentListeners.clear();
    this.#portUnsubscribe();
    this.#portUnsubscribe = () => undefined;
    for (const unsubscribe of this.#unsubscribes) unsubscribe();
    this.#unsubscribes = [];
    const gesture = this.#activeGesture;
    this.#activeGesture = null;
    if (gesture !== null) {
      try {
        this.#port?.restore(gesture.nativeBaseline);
      } catch (cause) {
        this.#bridge.reportDisposalFailure(
          "The transient Gizmo transform could not be restored during disposal.",
          cause,
        );
      }
    }
    this.#detachNative(true);
    const port = this.#port;
    this.#port = null;
    if (port === null) return;
    try {
      port.dispose();
    } catch (cause) {
      this.#bridge.reportDisposalFailure(
        "The private GizmoManager/UtilityLayer could not be disposed before the Grid.",
        cause,
      );
    }
  }
}

const adapterGizmoControllers = new WeakMap<RendererAdapter, RendererGizmoController>();

function getOrCreateRendererGizmoController(
  adapter: RendererAdapter,
  factory: RendererGizmoFactory,
  gestureSequence = 0,
): RendererGizmoController | null {
  if (resolveRendererEditorBridge(adapter) === null) return null;
  const existing = adapterGizmoControllers.get(adapter);
  if (existing !== undefined) return existing;
  const controller = new RendererGizmoController(adapter, factory, gestureSequence);
  adapterGizmoControllers.set(adapter, controller);
  return controller;
}

export function createRendererEditorGizmoControls(
  adapter: RendererAdapter,
): RendererEditorGizmoControls | null {
  return getOrCreateRendererGizmoController(adapter, createBabylonGizmo);
}

export function createRendererEditorGizmoControlsForTests(
  adapter: RendererAdapter,
  factory: RendererGizmoFactory,
  gestureSequence = 0,
): RendererEditorGizmoControls | null {
  return getOrCreateRendererGizmoController(adapter, factory, gestureSequence);
}
