import {
  createRendererHostSurfaceCapability,
  type RendererContextObservation,
  type RendererHostSurface,
  type RendererHostSurfaceCapabilityBinding,
  type RendererPickIntent,
  type RendererPickRequest,
  type RendererProjectionInput,
  type RendererProjectionRevision,
  type RendererSelectionState,
} from "../src/index.js";
import {
  createRendererAdapterForTests,
  resolveRendererHandleBridge,
} from "../src/engine/renderer-adapter.js";
import { createBabylonPickObservation } from "../src/picking/babylon-picking-factory.js";
import type { RendererRawPickObservation } from "../src/picking/picking-port.js";
import type {
  RendererHandleRegistrationEpoch,
  RendererHandleRegistryBridge,
} from "../src/registry/handle-port.js";

declare const describe: (name: string, body: () => void) => void;
declare const it: (name: string, body: () => Promise<void> | void) => void;
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
};

const revision = (value: string): RendererProjectionRevision => value as RendererProjectionRevision;

function captureEpoch(
  bridge: RendererHandleRegistryBridge,
  current: RendererProjectionRevision,
): RendererHandleRegistrationEpoch {
  const epoch = bridge.captureRegistrationEpoch(current);
  if (epoch === null) throw new Error("Expected an active private registration epoch.");
  return epoch;
}

const request = (overrides: Partial<RendererPickRequest> = {}): RendererPickRequest => ({
  correlationId: " pick-correlation ",
  modifiers: { alt: true, control: false, meta: true, shift: false },
  normalizedPosition: { x: 0.25, y: 0.75 },
  ...overrides,
});

function harness() {
  const callbacks = new Set<() => void>();
  const intents: RendererPickIntent[] = [];
  const observations: (RendererSelectionState | null)[] = [];
  const pickPositions: { readonly x: number; readonly y: number }[] = [];
  let contextListener: ((state: RendererContextObservation) => void) | null = null;
  let nextObservation: RendererRawPickObservation = { hitClass: "background" };
  let pickError: Error | null = null;
  let pickCalls = 0;
  const binding: RendererHostSurfaceCapabilityBinding = {
    observeContextState: (listener) => {
      contextListener = listener;
      return () => {
        contextListener = null;
      };
    },
    observeResize: () => () => undefined,
    resolveNativeSurface: () => ({}),
  };
  const host: RendererHostSurface = {
    available: true,
    capability: createRendererHostSurfaceCapability(binding),
    deviceScale: 2,
    generation: 5,
    identity: "picking-host",
    logicalExtent: { height: 300, width: 400 },
    pixelExtent: { height: 600, width: 800 },
  };
  const sceneNativeHandle = {};
  const adapter = createRendererAdapterForTests({
    cameraFactory: () => ({ dispose: () => undefined, setProjection: () => undefined }),
    engineFactory: () => ({
      nativeHandle: {},
      dispose: () => undefined,
      getFps: () => 60,
      resize: () => undefined,
      runRenderLoop: (callback) => callbacks.add(callback),
      stopRenderLoop: (callback) => callbacks.delete(callback),
    }),
    pickingFactory: (_scene, position) => {
      pickCalls += 1;
      pickPositions.push({ ...position });
      if (pickError !== null) throw pickError;
      return nextObservation;
    },
    sceneFactory: () => ({
      dispose: () => undefined,
      nativeHandle: sceneNativeHandle,
      render: () => undefined,
    }),
    selectionSnapshotObserverForTests: (selection) => observations.push(selection),
  });
  adapter.onPickIntent((intent) => intents.push(intent));
  return {
    adapter,
    context: (state: RendererContextObservation) => contextListener?.(state),
    host,
    intents,
    observations,
    pickCalls: () => pickCalls,
    pickPositions,
    setObservation: (value: RendererRawPickObservation) => {
      nextObservation = value;
    },
    throwOnPick: (value: Error | null) => {
      pickError = value;
    },
  };
}

async function initializeWithProjection(
  result: ReturnType<typeof harness>,
  currentRevision: RendererProjectionRevision,
  stableIds: readonly string[] = ["target"],
): Promise<void> {
  await result.adapter.initialize(result.host);
  await result.adapter.project({
    content: {},
    resources: [],
    revision: currentRevision,
    stableIds,
  });
}

async function makeRunning(
  result: ReturnType<typeof harness>,
  currentRevision: RendererProjectionRevision,
): Promise<void> {
  await initializeWithProjection(result, currentRevision);
  await result.adapter.start();
}

describe("RSM-6-I4 private Babylon picking factory", () => {
  it("converts normalized top-left coordinates with current render dimensions", () => {
    const handle = {};
    const positions: number[][] = [];
    const scene = {
      getEngine: () => ({ getRenderHeight: () => 600, getRenderWidth: () => 800 }),
      pick: (x: number, y: number) => {
        positions.push([x, y]);
        return {
          distance: 7.5,
          hit: true,
          pickedMesh: handle,
          pickedPoint: { x: 1, y: 2, z: 3 },
        };
      },
    };
    expect(createBabylonPickObservation(scene, { x: 0.25, y: 0.75 })).toEqual({
      distance: 7.5,
      handle,
      hitClass: "target",
      worldPoint: { x: 1, y: 2, z: 3 },
    });
    expect(positions).toEqual([[200, 450]]);

    const miss = {
      ...scene,
      pick: () => ({ distance: 0, hit: false, pickedMesh: null, pickedPoint: null }),
    };
    expect(createBabylonPickObservation(miss, { x: 1, y: 0 })).toEqual({
      hitClass: "background",
    });
  });
});

describe("RSM-6-I4 adapter picking and derived selection", () => {
  it("translates one current registered hit into one exact Babylon-free target intent", async () => {
    const result = harness();
    const current = revision("pick-revision");
    const handle = {};
    await makeRunning(result, current);
    const bridge = resolveRendererHandleBridge(result.adapter);
    if (bridge === null) throw new Error("Expected a private handle bridge.");
    const epoch = captureEpoch(bridge, current);
    expect(bridge.registerHandle("target", handle, epoch)).toBe(true);
    result.setObservation({
      distance: 4.25,
      handle,
      hitClass: "target",
      worldPoint: { x: 9, y: 8, z: 7 },
    });

    expect(result.adapter.pick(request())).toEqual({ accepted: true });
    expect(result.pickPositions).toEqual([{ x: 0.25, y: 0.75 }]);
    expect(result.intents).toEqual([
      {
        classification: "viewport-pick",
        correlationId: " pick-correlation ",
        hitClass: "target",
        modifiers: { alt: true, control: false, meta: true, shift: false },
        observation: { distance: 4.25, worldPoint: { x: 9, y: 8, z: 7 } },
        revision: current,
        targetId: "target",
      },
    ]);
  });

  it("emits one background intent for a valid miss", async () => {
    const result = harness();
    const current = revision("miss-revision");
    await makeRunning(result, current);
    expect(result.adapter.pick(request({ correlationId: "miss" }))).toEqual({ accepted: true });
    expect(result.intents).toEqual([
      {
        classification: "viewport-pick",
        correlationId: "miss",
        hitClass: "background",
        modifiers: { alt: true, control: false, meta: true, shift: false },
        observation: null,
        revision: current,
        targetId: null,
      },
    ]);
  });

  it("fails closed for unregistered and stale native targets with zero intent", async () => {
    const result = harness();
    const first = revision("first-revision");
    const second = revision("second-revision");
    const handle = {};
    await makeRunning(result, first);
    result.setObservation({ distance: null, handle, hitClass: "target", worldPoint: null });
    const missing = result.adapter.pick(request({ correlationId: "missing" }));
    expect(missing.accepted).toBe(false);
    if (missing.accepted) throw new Error("Expected missing-handle failure.");
    expect(missing.failure.category).toBe("PICK_RESOLUTION_FAILED");
    expect(result.intents).toEqual([]);

    const bridge = resolveRendererHandleBridge(result.adapter);
    if (bridge === null) throw new Error("Expected a private handle bridge.");
    const firstEpoch = captureEpoch(bridge, first);
    expect(bridge.registerHandle("target", handle, firstEpoch)).toBe(true);
    await result.adapter.project({
      content: {},
      resources: [],
      revision: second,
      stableIds: ["target"],
    });
    expect(bridge.registerHandle("target", {}, firstEpoch)).toBe(false);
    const stale = result.adapter.pick(request({ correlationId: "stale" }));
    expect(stale.accepted).toBe(false);
    expect(result.intents).toEqual([]);
  });

  it("rejects malformed runtime stableIds without replacing the current epoch or projection", async () => {
    const result = harness();
    const current = revision("malformed-input-current");
    const malformedRevision = revision("malformed-input-next");
    const handle = {};
    await initializeWithProjection(result, current);
    const bridge = resolveRendererHandleBridge(result.adapter);
    if (bridge === null) throw new Error("Expected a private handle bridge.");
    const currentEpoch = captureEpoch(bridge, current);
    expect(bridge.registerHandle("target", handle, currentEpoch)).toBe(true);

    const malformed = {
      content: {},
      resources: [],
      revision: malformedRevision,
      stableIds: undefined,
    } as unknown as RendererProjectionInput;
    const rejected = await result.adapter.project(malformed);
    expect(rejected.status).toBe("rejected");
    if (rejected.status !== "rejected") throw new Error("Expected malformed projection rejection.");
    expect(rejected.failure.category).toBe("PROJECTION_REJECTED_OR_STALE");
    expect(bridge.captureRegistrationEpoch(current)).toBe(currentEpoch);
    expect(bridge.captureRegistrationEpoch(malformedRevision)).toBe(null);
    expect(
      await result.adapter.project({
        content: { duplicate: true },
        resources: [],
        revision: current,
        stableIds: ["target"],
      }),
    ).toEqual({ status: "duplicate-no-op" });
    expect(result.adapter.captureDiagnosticSnapshot().projectionRevision).toBe(current);

    await result.adapter.start();
    result.setObservation({ distance: null, handle, hitClass: "target", worldPoint: null });
    expect(result.adapter.pick(request({ correlationId: "still-current" })).accepted).toBe(true);
    expect(result.intents[0]?.targetId).toBe("target");
  });

  it("blocks non-RUNNING, suspended, invalid, exceptional, and terminal picks", async () => {
    const result = harness();
    const current = revision("lifecycle-revision");
    await initializeWithProjection(result, current);
    const retainedBridge = resolveRendererHandleBridge(result.adapter);
    if (retainedBridge === null) throw new Error("Expected a private handle bridge.");
    const retainedEpoch = captureEpoch(retainedBridge, current);
    expect(retainedBridge.registerHandle("target", {}, retainedEpoch)).toBe(true);
    expect(result.adapter.pick(request()).accepted).toBe(false);
    expect(result.pickCalls()).toBe(0);
    await result.adapter.start();

    for (const invalid of [
      request({ correlationId: "" }),
      request({ normalizedPosition: { x: -0.01, y: 0 } }),
      request({ normalizedPosition: { x: 0, y: Number.NaN } }),
    ]) {
      expect(result.adapter.pick(invalid).accepted).toBe(false);
    }
    expect(result.pickCalls()).toBe(0);

    result.context("lost");
    expect(result.adapter.pick(request()).accepted).toBe(false);
    expect(result.pickCalls()).toBe(0);
    result.context("restored");
    result.throwOnPick(new Error("private pick exploded"));
    const exceptional = result.adapter.pick(request({ correlationId: "exception" }));
    expect(exceptional.accepted).toBe(false);
    if (exceptional.accepted) throw new Error("Expected normalized private pick failure.");
    expect(exceptional.failure.category).toBe("PICK_RESOLUTION_FAILED");
    expect(exceptional.failure.cause).toEqual({
      authoritative: false,
      summary: "private pick exploded",
    });
    expect(result.intents).toEqual([]);

    await result.adapter.dispose();
    const calls = result.pickCalls();
    const snapshot = result.adapter.captureDiagnosticSnapshot();
    expect(result.adapter.pick(request()).accepted).toBe(false);
    expect(result.adapter.pick(request()).accepted).toBe(false);
    expect(retainedBridge.captureRegistrationEpoch(current)).toBe(null);
    expect(retainedBridge.registerHandle("target", {}, retainedEpoch)).toBe(false);
    expect(retainedBridge.registerHandle("target", {}, retainedEpoch)).toBe(false);
    retainedBridge.unregisterHandle({}, retainedEpoch);
    expect(result.pickCalls()).toBe(calls);
    expect(result.adapter.captureDiagnosticSnapshot()).toEqual(snapshot);
  });

  it("stores only a defensive derived selection snapshot and retains no authority after disposal", async () => {
    const result = harness();
    const current = revision("selection-revision");
    const selectedIds = ["target"];
    const toolIntent = { mode: "inspect", nested: { enabled: true } };
    await initializeWithProjection(result, current);
    const selection: RendererSelectionState = {
      primaryId: "target",
      selectedIds,
      toolIntent,
    };
    expect(result.adapter.setSelection(selection)).toEqual({ accepted: true });
    expect(result.intents).toEqual([]);
    selectedIds.push("caller-mutation");
    toolIntent.mode = "mutated";
    toolIntent.nested.enabled = false;
    expect(result.observations[0]).toEqual({
      primaryId: "target",
      selectedIds: ["target"],
      toolIntent: { mode: "inspect", nested: { enabled: true } },
    });

    expect(
      result.adapter.setSelection({
        primaryId: "target",
        selectedIds: ["target", "target"],
        toolIntent: null,
      }).accepted,
    ).toBe(false);
    expect(
      result.adapter.setSelection({
        primaryId: "missing",
        selectedIds: ["target"],
        toolIntent: null,
      }).accepted,
    ).toBe(false);
    expect(result.intents).toEqual([]);

    await result.adapter.dispose();
    expect(result.observations.at(-1)).toBe(null);
    const snapshot = result.adapter.captureDiagnosticSnapshot();
    expect(result.adapter.setSelection(selection).accepted).toBe(false);
    expect(result.adapter.setSelection(selection).accepted).toBe(false);
    expect(result.adapter.captureDiagnosticSnapshot()).toEqual(snapshot);
  });
});
