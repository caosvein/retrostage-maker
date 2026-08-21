import {
  createRendererHostSurfaceCapability,
  type RendererContextObservation,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererProjectionRevision,
} from "../src/index.js";
import type { RendererGizmoIntent, RendererGizmoMode } from "../src/editor.js";
import {
  createRendererAdapterForTests,
  resolveRendererHandleBridge,
} from "../src/engine/renderer-adapter.js";
import {
  createRendererEditorGizmoControls,
  createRendererEditorGizmoControlsForTests,
} from "../src/gizmos/gizmo-controller.js";
import type {
  RendererGizmoFactory,
  RendererGizmoNativeEvent,
  RendererGizmoPort,
  RendererGizmoTransformState,
} from "../src/gizmos/gizmo-port.js";
import { createRendererEditorViewportControlsForTests } from "../src/grid/grid-controller.js";
import type { RendererHandleRegistrationEpoch } from "../src/registry/handle-port.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

const revision = (value: string): RendererProjectionRevision => value as RendererProjectionRevision;

function transform(
  position = { x: 0, y: 0, z: 0 },
  scale = { x: 1, y: 1, z: 1 },
  rotationQuaternion = { w: 1, x: 0, y: 0, z: 0 },
): RendererGizmoTransformState {
  return { position, rotationQuaternion, scale };
}

class FakeGizmoPort implements RendererGizmoPort {
  readonly events: string[];
  readonly listeners = new Set<(event: RendererGizmoNativeEvent) => void>();
  attached: object | null = null;
  current = transform();
  disposed = false;
  mode: RendererGizmoMode = "position";
  restoreThrows = false;
  disposeThrows = false;

  constructor(events: string[]) {
    this.events = events;
  }

  attach(handle: object): RendererGizmoTransformState {
    if (this.disposed) throw new Error("disposed port");
    this.attached = handle;
    this.events.push("gizmo-attach");
    return this.current;
  }

  detach(): void {
    if (this.disposed) return;
    this.events.push("gizmo-detach");
    this.attached = null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.listeners.clear();
    this.events.push("gizmo-dispose");
    if (this.disposeThrows) throw new Error("gizmo disposal failed");
  }

  emit(phase: "begin" | "commit" | "update", state: RendererGizmoTransformState): void {
    this.current = state;
    for (const listener of this.listeners) listener({ phase, state });
  }

  emitInvalid(): void {
    for (const listener of this.listeners) listener({ phase: "invalid", state: null });
  }

  onDrag(listener: (event: RendererGizmoNativeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  restore(state: RendererGizmoTransformState): void {
    this.events.push("gizmo-restore");
    if (this.restoreThrows) throw new Error("gizmo restore failed");
    this.current = state;
  }

  setMode(mode: RendererGizmoMode): void {
    this.mode = mode;
    this.events.push(`gizmo-mode:${mode}`);
  }
}

function harness(gestureSequence = 0) {
  const events: string[] = [];
  const intents: RendererGizmoIntent[] = [];
  const callbacks = new Set<() => void>();
  const ports: FakeGizmoPort[] = [];
  let contextListener: ((state: RendererContextObservation) => void) | null = null;
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: (listener) => {
      contextListener = listener;
      return () => events.push("context-unsubscribe");
    },
    observeResize: () => () => events.push("resize-unsubscribe"),
    resolveNativeSurface: () => ({}),
  };
  const host: RendererHostSurface = {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 1,
    generation: 1,
    identity: "gizmo-host",
    logicalExtent: { height: 256, width: 256 },
    pixelExtent: { height: 256, width: 256 },
  };
  const adapter = createRendererAdapterForTests({
    cameraFactory: () => ({
      dispose: () => events.push("camera-dispose"),
      setProjection: () => undefined,
    }),
    engineFactory: () => ({
      nativeHandle: {},
      dispose: () => events.push("engine-dispose"),
      getFps: () => 60,
      resize: () => undefined,
      runRenderLoop: (callback) => callbacks.add(callback),
      stopRenderLoop: (callback) => callbacks.delete(callback),
    }),
    sceneFactory: () => ({
      dispose: () => events.push("scene-dispose"),
      nativeHandle: {},
      render: () => undefined,
    }),
  });
  const factory: RendererGizmoFactory = () => {
    const port = new FakeGizmoPort(events);
    ports.push(port);
    return port;
  };
  const controls = createRendererEditorGizmoControlsForTests(adapter, factory, gestureSequence);
  if (controls === null) throw new Error("Expected compatible Gizmo controls.");
  controls.onGizmoIntent((intent) => intents.push(intent));
  return {
    adapter,
    context: (state: RendererContextObservation) => contextListener?.(state),
    controls,
    events,
    factory,
    host,
    intents,
    port: () => {
      const port = ports[0];
      if (port === undefined) throw new Error("Expected a lazily created Gizmo port.");
      return port;
    },
    ports,
  };
}

async function projectAndRun(
  result: ReturnType<typeof harness>,
  current: RendererProjectionRevision,
  stableIds: readonly string[] = ["target"],
): Promise<void> {
  await result.adapter.initialize(result.host);
  await result.adapter.project({ content: {}, resources: [], revision: current, stableIds });
  await result.adapter.start();
}

function register(
  result: ReturnType<typeof harness>,
  current: RendererProjectionRevision,
  stableId: string,
  handle: object,
): RendererHandleRegistrationEpoch {
  const bridge = resolveRendererHandleBridge(result.adapter);
  if (bridge === null) throw new Error("Expected the private handle bridge.");
  const epoch = bridge.captureRegistrationEpoch(current);
  if (epoch === null) throw new Error("Expected a current registration epoch.");
  if (!bridge.registerHandle(stableId, handle, epoch)) throw new Error("Expected registration.");
  return epoch;
}

function select(
  result: ReturnType<typeof harness>,
  ids: readonly string[],
  primary: string | null,
) {
  return result.adapter.setSelection({
    primaryId: primary,
    selectedIds: ids,
    toolIntent: { ignored: true },
  });
}

describe("RSM-6-I7 editor-only Gizmo intent authority", () => {
  it("shares one adapter-scoped controller/port and keeps different adapters independent", async () => {
    const first = harness();
    const second = harness();
    const firstAgain = createRendererEditorGizmoControlsForTests(first.adapter, first.factory);
    const publicControls = createRendererEditorGizmoControls(first.adapter);
    if (firstAgain === null || publicControls === null) throw new Error("Expected Gizmo controls.");
    expect(firstAgain).toBe(first.controls);
    expect(publicControls).toBe(first.controls);
    expect(second.controls === first.controls).toBe(false);

    const firstRevision = revision("gizmo-singleton-a");
    const secondRevision = revision("gizmo-singleton-b");
    await projectAndRun(first, firstRevision);
    await projectAndRun(second, secondRevision);
    register(first, firstRevision, "target", {});
    register(second, secondRevision, "target", {});
    select(first, ["target"], "target");
    select(second, ["target"], "target");
    expect(firstAgain.attachGizmo()).toEqual({ accepted: true });
    expect(publicControls.setGizmoMode("scale")).toEqual({ accepted: true });
    expect(second.controls.attachGizmo()).toEqual({ accepted: true });
    expect(first.ports.length).toBe(1);
    expect(second.ports.length).toBe(1);
    expect(first.port().mode).toBe("scale");
    expect(second.port().mode).toBe("position");
  });

  it("emits frozen begin/update/commit and cancel envelopes while restoring before publication", async () => {
    const result = harness();
    const current = revision("gizmo-gesture");
    const handle = {};
    await projectAndRun(result, current);
    register(result, current, "target", handle);
    select(result, ["target"], "target");
    expect(result.controls.attachGizmo()).toEqual({ accepted: true });
    result.controls.onGizmoIntent(() => {
      throw new Error("listener failure must remain isolated");
    });
    const port = result.port();
    const baseline = transform({ x: 1, y: 2, z: 3 });
    const candidate = transform({ x: 5, y: 4, z: 3 });
    port.current = baseline;
    port.emit("begin", baseline);
    port.emit("update", candidate);
    port.emit("commit", candidate);
    expect(
      result.intents.map(({ correlationId, kind, phase }) => ({ correlationId, kind, phase })),
    ).toEqual([
      { correlationId: "gizmo:1", kind: "position", phase: "begin" },
      { correlationId: "gizmo:1", kind: "position", phase: "update" },
      { correlationId: "gizmo:1", kind: "position", phase: "commit" },
    ]);
    expect(result.intents[2]).toEqual({
      candidate: { position: { x: 5, y: 4, z: 3 } },
      correlationId: "gizmo:1",
      delta: { position: { x: 4, y: 2, z: 0 } },
      kind: "position",
      phase: "commit",
      revision: current,
      targetId: "target",
    });
    expect(port.current).toBe(baseline);
    expect(Object.isFrozen(result.intents[2])).toBe(true);
    expect(Object.isFrozen(result.intents[2]?.candidate)).toBe(true);

    expect(result.controls.setGizmoMode("rotation")).toEqual({ accepted: true });
    const rotationBaseline = transform();
    const rotationCandidate = transform(
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 1, z: 1 },
      { w: Math.SQRT1_2, x: 0, y: Math.SQRT1_2, z: 0 },
    );
    port.emit("begin", rotationBaseline);
    port.emit("update", rotationCandidate);
    expect(result.controls.detachGizmo()).toEqual({ accepted: true });
    expect(
      result.intents
        .slice(-3)
        .map(({ correlationId, kind, phase }) => ({ correlationId, kind, phase })),
    ).toEqual([
      { correlationId: "gizmo:2", kind: "rotation", phase: "begin" },
      { correlationId: "gizmo:2", kind: "rotation", phase: "update" },
      { correlationId: "gizmo:2", kind: "rotation", phase: "cancel" },
    ]);
    expect(port.current).toBe(rotationBaseline);

    expect(result.controls.attachGizmo()).toEqual({ accepted: true });
    expect(result.controls.setGizmoMode("scale")).toEqual({ accepted: true });
    const scaleBaseline = transform();
    const scaleCandidate = transform({ x: 0, y: 0, z: 0 }, { x: 2, y: 3, z: 4 });
    port.emit("begin", scaleBaseline);
    port.emit("commit", scaleCandidate);
    expect(result.intents.slice(-1)[0]).toEqual({
      candidate: { scale: { x: 2, y: 3, z: 4 } },
      correlationId: "gizmo:3",
      delta: { scale: { x: 1, y: 2, z: 3 } },
      kind: "scale",
      phase: "commit",
      revision: current,
      targetId: "target",
    });
  });

  it("cancels and restores an active gesture before accepting a duplicate native begin", async () => {
    const result = harness();
    const current = revision("gizmo-duplicate-begin");
    await projectAndRun(result, current);
    register(result, current, "target", {});
    select(result, ["target"], "target");
    result.controls.attachGizmo();
    const port = result.port();
    const firstBaseline = transform({ x: 1, y: 0, z: 0 });
    const secondBaseline = transform({ x: 2, y: 0, z: 0 });
    port.emit("begin", firstBaseline);
    port.emit("update", transform({ x: 10, y: 0, z: 0 }));
    port.emit("begin", secondBaseline);
    expect(result.intents.map(({ correlationId, phase }) => ({ correlationId, phase }))).toEqual([
      { correlationId: "gizmo:1", phase: "begin" },
      { correlationId: "gizmo:1", phase: "update" },
      { correlationId: "gizmo:1", phase: "cancel" },
      { correlationId: "gizmo:2", phase: "begin" },
    ]);
    expect(result.events.filter((event) => event === "gizmo-restore").length).toBe(1);
  });

  it("contains invalid native state during an active gesture and leaves stale callbacks inert", async () => {
    const result = harness();
    const current = revision("gizmo-invalid-active");
    await projectAndRun(result, current);
    register(result, current, "target", {});
    select(result, ["target"], "target");
    result.controls.attachGizmo();
    const port = result.port();
    const retained = [...port.listeners][0];
    if (retained === undefined) throw new Error("Expected a retained native callback.");
    const baseline = transform({ x: 1, y: 2, z: 3 });
    port.emit("begin", baseline);
    port.emit("update", transform({ x: 5, y: 6, z: 7 }));
    port.current = transform({ x: Number.NaN, y: 6, z: 7 });
    port.emitInvalid();

    expect(result.intents.map(({ phase }) => phase)).toEqual(["begin", "update", "cancel"]);
    expect(result.intents.filter(({ phase }) => phase === "cancel").length).toBe(1);
    expect(port.current).toBe(baseline);
    expect(port.attached).toBe(null);
    expect(result.events.slice(-2)).toEqual(["gizmo-restore", "gizmo-detach"]);

    const intentCount = result.intents.length;
    retained({ phase: "commit", state: transform({ x: 99, y: 99, z: 99 }) });
    retained({ phase: "invalid", state: null });
    expect(result.intents.length).toBe(intentCount);
    expect(port.attached).toBe(null);
  });

  it("restores the exact attachment baseline for invalid native state before begin", async () => {
    const result = harness();
    const current = revision("gizmo-invalid-before-begin");
    await projectAndRun(result, current);
    register(result, current, "target", {});
    select(result, ["target"], "target");
    result.controls.attachGizmo();
    const port = result.port();
    const attachmentBaseline = port.current;
    const retained = [...port.listeners][0];
    if (retained === undefined) throw new Error("Expected a retained native callback.");
    port.current = transform({ x: Number.POSITIVE_INFINITY, y: 0, z: 0 });
    port.emitInvalid();

    expect(result.intents).toEqual([]);
    expect(port.current).toBe(attachmentBaseline);
    expect(port.attached).toBe(null);
    expect(result.events.slice(-2)).toEqual(["gizmo-restore", "gizmo-detach"]);

    retained({ phase: "begin", state: transform({ x: 10, y: 10, z: 10 }) });
    expect(result.intents).toEqual([]);
    expect(port.attached).toBe(null);
  });

  it("fails sequence exhaustion once without wrapping or publishing a new begin", async () => {
    const result = harness(Number.MAX_SAFE_INTEGER);
    const current = revision("gizmo-sequence-exhaustion");
    await projectAndRun(result, current);
    register(result, current, "target", {});
    select(result, ["target"], "target");
    result.controls.attachGizmo();
    const port = result.port();
    port.emit("begin", transform());

    expect(result.intents).toEqual([]);
    expect(port.attached).toBe(null);
    expect(result.adapter.captureDiagnosticSnapshot().failureCounts.VIEW_CONTROL_REJECTED).toBe(1);
    port.emit("begin", transform({ x: 2, y: 0, z: 0 }));
    expect(result.intents).toEqual([]);
    expect(result.adapter.captureDiagnosticSnapshot().failureCounts.VIEW_CONTROL_REJECTED).toBe(1);
  });

  it("fails closed for non-exact selection or ambiguous handles and re-resolves current authority", async () => {
    const result = harness();
    const current = revision("gizmo-resolution");
    const firstHandle = {};
    const secondHandle = {};
    await projectAndRun(result, current, ["target", "other"]);
    select(result, [], null);
    expect(result.controls.attachGizmo().accepted).toBe(false);
    select(result, ["target", "other"], "target");
    expect(result.controls.attachGizmo().accepted).toBe(false);
    select(result, ["target"], "other");
    expect(result.controls.attachGizmo().accepted).toBe(false);

    const firstEpoch = register(result, current, "target", firstHandle);
    select(result, ["target"], "target");
    expect(result.controls.attachGizmo()).toEqual({ accepted: true });
    expect(result.port().attached).toBe(firstHandle);
    result.port().emit("begin", transform());
    result.port().emit("update", transform({ x: 3, y: 2, z: 1 }));
    register(result, current, "target", secondHandle);
    expect(result.port().attached).toBe(null);
    expect(result.intents.slice(-1)[0]?.phase).toBe("cancel");
    const bridge = resolveRendererHandleBridge(result.adapter);
    if (bridge === null) throw new Error("Expected handle bridge.");
    bridge.unregisterHandle(secondHandle, firstEpoch);
    expect(result.port().attached).toBe(firstHandle);

    const next = revision("gizmo-resolution-next");
    await result.adapter.project({
      content: {},
      resources: [],
      revision: next,
      stableIds: ["target"],
    });
    expect(result.port().attached).toBe(null);
    const nextHandle = {};
    register(result, next, "target", nextHandle);
    expect(result.port().attached).toBe(nextHandle);
    bridge.unregisterHandle(firstHandle, firstEpoch);
    expect(result.port().attached).toBe(nextHandle);
  });

  it("cancels transient state on context loss and reattaches only current state after restore", async () => {
    const result = harness();
    const current = revision("gizmo-context");
    const handle = {};
    await projectAndRun(result, current);
    register(result, current, "target", handle);
    select(result, ["target"], "target");
    result.controls.attachGizmo();
    const port = result.port();
    const baseline = transform({ x: 2, y: 3, z: 4 });
    port.emit("begin", baseline);
    port.emit("update", transform({ x: 9, y: 8, z: 7 }));
    const published = result.intents.length;
    result.context("lost");
    expect(port.current).toBe(baseline);
    expect(port.attached).toBe(null);
    expect(result.intents.length).toBe(published);
    port.emit("commit", transform({ x: 99, y: 99, z: 99 }));
    expect(result.intents.length).toBe(published);
    result.context("restored");
    expect(port.attached).toBe(handle);
  });

  it("revokes retained callbacks and disposes Gizmo before Grid/Camera/Scene/Engine", async () => {
    const result = harness();
    const current = revision("gizmo-disposal");
    const handle = {};
    const grid = createRendererEditorViewportControlsForTests(result.adapter, () => ({
      dispose: () => result.events.push("grid-dispose"),
      setVisible: () => undefined,
    }));
    if (grid === null) throw new Error("Expected grid controls.");
    await projectAndRun(result, current);
    register(result, current, "target", handle);
    select(result, ["target"], "target");
    result.controls.attachGizmo();
    grid.setGridVisible(true);
    const port = result.port();
    const retained = [...port.listeners][0];
    if (retained === undefined) throw new Error("Expected retained native callback.");
    port.disposeThrows = true;
    const failures = await result.adapter.dispose();
    expect(result.events.slice(-5)).toEqual([
      "gizmo-dispose",
      "grid-dispose",
      "camera-dispose",
      "scene-dispose",
      "engine-dispose",
    ]);
    expect(failures.map(({ category }) => category)).toEqual(["RESOURCE_DISPOSAL_FAILED"]);
    const intentCount = result.intents.length;
    const snapshot = result.adapter.captureDiagnosticSnapshot();
    retained({ phase: "begin", state: transform({ x: 100, y: 100, z: 100 }) });
    expect(result.intents.length).toBe(intentCount);
    expect(result.controls.attachGizmo().accepted).toBe(false);
    expect(result.controls.detachGizmo().accepted).toBe(false);
    expect(result.controls.setGizmoMode("position").accepted).toBe(false);
    expect(result.adapter.captureDiagnosticSnapshot()).toEqual(snapshot);
  });
});
