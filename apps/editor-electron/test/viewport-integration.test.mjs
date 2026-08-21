import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it, vi } from "vitest";

const applicationRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const viewportSource = readFileSync(
  path.join(applicationRoot, "src", "renderer", "viewport-view.ts"),
  "utf8",
);

class FakeElement extends globalThis.EventTarget {
  constructor(rectangle) {
    super();
    this.children = [];
    this.dataset = {};
    this.isConnected = false;
    this.rectangle = { ...rectangle };
    this.tabIndex = -1;
  }

  append(child) {
    this.children.push(child);
    child.isConnected = true;
    child.parent = this;
  }

  getBoundingClientRect() {
    return {
      bottom: this.rectangle.top + this.rectangle.height,
      height: this.rectangle.height,
      left: this.rectangle.left,
      right: this.rectangle.left + this.rectangle.width,
      top: this.rectangle.top,
      width: this.rectangle.width,
      x: this.rectangle.left,
      y: this.rectangle.top,
      toJSON: () => ({}),
    };
  }

  remove() {
    this.isConnected = false;
    if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this);
  }
}

class FakePointerEvent extends globalThis.Event {
  constructor(type, init) {
    super(type, init);
    Object.assign(this, {
      altKey: init.altKey ?? false,
      button: init.button ?? 0,
      clientX: init.clientX ?? 0,
      clientY: init.clientY ?? 0,
      ctrlKey: init.ctrlKey ?? false,
      metaKey: init.metaKey ?? false,
      shiftKey: init.shiftKey ?? false,
    });
  }
}

function createAdapter(log, options = {}) {
  const failures = new Set();
  const lifecycle = new Set();
  const picks = new Set();
  let state = "NEW";
  let binding;
  let disposed = false;
  const adapter = {
    get lifecycleState() {
      return state;
    },
    captureDiagnosticSnapshot() {
      return Object.freeze({
        assets: Object.freeze({ liveContainerCount: 0, liveInstanceCount: 0 }),
        lifecycleState: state,
        resourceCounts: Object.freeze({ engine: disposed ? 0 : 1, scene: disposed ? 0 : 1 }),
        timing: Object.freeze({ sampleCount: 0 }),
      });
    },
    async dispose() {
      log.push(`dispose:${adapter.captureDiagnosticSnapshot().resourceCounts.engine}`);
      state = "DISPOSED";
      disposed = true;
      for (const listener of lifecycle) listener(state);
      binding?.resizeUnsubscribe();
      binding?.contextUnsubscribe();
      return [];
    },
    hostSubscriptionCounts() {
      return {
        context: binding === undefined ? 0 : 1,
        resize: binding === undefined ? 0 : 1,
      };
    },
    async initialize(host) {
      log.push(`initialize:${host.identity}`);
      const capabilityBinding = host.capability.binding;
      binding = {
        contextUnsubscribe: capabilityBinding.observeContextState((observation) => {
          log.push(`context:${observation}`);
          state = observation === "lost" ? "SUSPENDED_CONTEXT_LOSS" : "RUNNING";
          for (const listener of lifecycle) listener(state);
        }),
        resizeUnsubscribe: capabilityBinding.observeResize((extent) =>
          log.push(`resize:${extent.width}`),
        ),
      };
      state = "READY";
      for (const listener of lifecycle) listener(state);
      return { accepted: true };
    },
    onFailure(listener) {
      failures.add(listener);
      return () => failures.delete(listener);
    },
    onLifecycleState(listener) {
      lifecycle.add(listener);
      return () => lifecycle.delete(listener);
    },
    onPickIntent(listener) {
      picks.add(listener);
      return () => picks.delete(listener);
    },
    async project(input) {
      log.push(`project:${input.revision}:${input.stableIds.length}`);
      if (options.projectFailure !== undefined) throw options.projectFailure;
      return { status: "accepted-current" };
    },
    pick(request) {
      log.push(
        `pick:${request.correlationId}:${request.normalizedPosition.x}:${request.normalizedPosition.y}`,
      );
      const intent = Object.freeze({
        classification: "viewport-pick",
        correlationId: request.correlationId,
        hitClass: "background",
        modifiers: request.modifiers,
        observation: null,
        revision: "editor-electron:empty:1",
        targetId: null,
      });
      for (const listener of picks) listener(intent);
      return { accepted: true };
    },
    setSelection(selection) {
      log.push(`selection:${selection.selectedIds.length}`);
      return { accepted: true };
    },
    async start() {
      if (options.startFailure !== undefined) throw options.startFailure;
      state = "RUNNING";
      log.push("start");
      for (const listener of lifecycle) listener(state);
      return { accepted: true };
    },
    subscriptionCounts() {
      return {
        failures: failures.size,
        lifecycle: lifecycle.size,
        picks: picks.size,
      };
    },
    unsubscribeHostContext() {
      binding?.contextUnsubscribe();
    },
    unsubscribeHostResize() {
      binding?.resizeUnsubscribe();
    },
  };
  return adapter;
}

async function fixture({ adapterPlans = [{}], smokeHash = "" } = {}) {
  vi.resetModules();
  const log = [];
  const resizeObservers = [];
  const canvases = [];
  const root = new FakeElement({ height: 400, left: 10, top: 20, width: 800 });
  root.isConnected = true;
  const fakeWindow = Object.assign(new globalThis.EventTarget(), {
    devicePixelRatio: 2,
    location: { hash: smokeHash },
  });
  const adapters = adapterPlans.map((plan) =>
    plan.factoryFailure === undefined ? createAdapter(log, plan) : null,
  );
  let adapterFactoryCall = 0;
  const gizmoIntents = new Set();
  class FakeResizeObserver {
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      resizeObservers.push(this);
    }

    disconnect() {
      this.disconnected = true;
    }

    observe(target) {
      this.target = target;
    }
  }
  vi.stubGlobal("window", fakeWindow);
  vi.stubGlobal("document", {
    createElement: (name) => {
      expect(name).toBe("canvas");
      const canvas = new FakeElement({ height: 400, left: 10, top: 20, width: 800 });
      canvases.push(canvas);
      return canvas;
    },
  });
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  vi.stubGlobal("PointerEvent", FakePointerEvent);
  vi.stubGlobal("requestAnimationFrame", (callback) => globalThis.setTimeout(() => callback(0), 0));
  vi.doMock("@retrostage/renderer-babylon9", () => ({
    createRendererAdapter: () => {
      const plan = adapterPlans[adapterFactoryCall];
      const adapter = adapters[adapterFactoryCall];
      adapterFactoryCall += 1;
      if (plan?.factoryFailure !== undefined) throw plan.factoryFailure;
      if (adapter === null || adapter === undefined) throw new Error("Missing fake adapter plan.");
      return adapter;
    },
    createRendererHostSurfaceCapability: (binding) => ({ binding }),
  }));
  vi.doMock("@retrostage/renderer-babylon9/editor", () => ({
    createRendererEditorGizmoControls: () => ({
      attachGizmo: () => ({ accepted: true }),
      onGizmoIntent: (listener) => {
        gizmoIntents.add(listener);
        return () => gizmoIntents.delete(listener);
      },
      setGizmoMode: () => ({ accepted: true }),
    }),
    createRendererEditorViewportControls: () => ({
      setGridVisible: (visible) => {
        log.push(`grid:${visible}`);
        return { accepted: true };
      },
    }),
  }));
  const { createViewportView } = await import("../src/renderer/viewport-view.ts");
  return {
    adapter: adapters[0],
    adapters,
    canvases,
    createViewportView,
    fakeWindow,
    gizmoIntents,
    log,
    resizeObservers,
    root,
  };
}

afterEach(() => {
  vi.doUnmock("@retrostage/renderer-babylon9");
  vi.doUnmock("@retrostage/renderer-babylon9/editor");
  vi.unstubAllGlobals();
});

describe("RSM-6-I8 ViewportView integration", () => {
  it("owns one canvas/host/adapter/editor composition in the exact startup order", async () => {
    const { createViewportView, log, root } = await fixture();
    const view = await createViewportView(root);
    expect(root.children).toHaveLength(1);
    expect(root.children[0].dataset.retrostageViewport).toBe("babylon9");
    expect(root.children[0].tabIndex).toBe(0);
    expect("__retrostageViewportSmoke" in globalThis.window).toBe(false);
    expect(log).toEqual([
      "initialize:editor-electron:viewport:1",
      "grid:true",
      "project:editor-electron:empty:1:0",
      "selection:0",
      "start",
    ]);
    await expect(createViewportView(root)).rejects.toThrow("already owns a live ViewportView");
    await view.dispose();
  });

  it("normalizes/clamps primary pointers, observes intents privately, and never derives selection", async () => {
    const { createViewportView, log, root } = await fixture();
    const view = await createViewportView(root);
    const canvas = root.children[0];
    canvas.dispatchEvent(
      new FakePointerEvent("pointerdown", {
        altKey: true,
        button: 0,
        clientX: 900,
        clientY: -20,
        ctrlKey: true,
      }),
    );
    canvas.dispatchEvent(new FakePointerEvent("pointerdown", { button: 2 }));
    expect(log).toContain("pick:electron-pick:1:1:0");
    expect(log.filter((entry) => entry.startsWith("selection:"))).toEqual(["selection:0"]);
    expect(viewportSource).not.toContain("CustomEvent");
    expect(viewportSource).not.toContain("retrostage-pick-intent");
    expect(viewportSource).not.toContain("retrostage-gizmo-intent");
    await view.dispose();
  });

  it("routes real ResizeObserver and cancelable context DOM seams", async () => {
    const { adapter, createViewportView, log, resizeObservers, root } = await fixture();
    const view = await createViewportView(root);
    root.rectangle.width = 832;
    resizeObservers[0].callback();
    expect(log).toContain("resize:832");
    const canvas = root.children[0];
    const lost = new globalThis.Event("webglcontextlost", { cancelable: true });
    canvas.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(adapter.lifecycleState).toBe("SUSPENDED_CONTEXT_LOSS");
    canvas.dispatchEvent(new globalThis.Event("webglcontextrestored"));
    expect(adapter.lifecycleState).toBe("RUNNING");
    await view.dispose();
    expect(resizeObservers[0].disconnected).toBe(true);
  });

  it("uses the exact subscribed host Sets for resize/context dispatch and unsubscribe", async () => {
    const { adapter, createViewportView, log, resizeObservers, root } = await fixture();
    const view = await createViewportView(root);
    const canvas = root.children[0];

    adapter.unsubscribeHostResize();
    root.rectangle.width = 864;
    resizeObservers[0].callback();
    expect(log).not.toContain("resize:864");

    adapter.unsubscribeHostContext();
    const stateBeforeStaleContext = adapter.lifecycleState;
    const lost = new globalThis.Event("webglcontextlost", { cancelable: true });
    canvas.dispatchEvent(lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(adapter.lifecycleState).toBe(stateBeforeStaleContext);
    expect(log).not.toContain("context:lost");

    await view.dispose();
    await view.dispose();
    expect(log.filter((entry) => entry.startsWith("dispose:"))).toHaveLength(1);
  });

  it.each(["project", "start"])(
    "fully revokes a post-runtime %s bootstrap failure and releases the root",
    async (operation) => {
      const bootstrapCause = new Error(`${operation}-bootstrap-cause`);
      const plan =
        operation === "project"
          ? { projectFailure: bootstrapCause }
          : { startFailure: bootstrapCause };
      const { adapters, canvases, createViewportView, fakeWindow, gizmoIntents, log, root } =
        await fixture({
          adapterPlans: [plan, {}],
          smokeHash: "#rsm6-i8-smoke-1",
        });

      await expect(createViewportView(root)).rejects.toBe(bootstrapCause);
      const failedAdapter = adapters[0];
      const staleCanvas = canvases[0];
      const failedSmoke = fakeWindow.__retrostageViewportSmoke;
      expect(log.filter((entry) => entry.startsWith("dispose:"))).toHaveLength(1);
      expect(failedAdapter.lifecycleState).toBe("DISPOSED");
      expect(failedAdapter.subscriptionCounts()).toEqual({ failures: 0, lifecycle: 0, picks: 0 });
      expect(gizmoIntents).toHaveLength(0);
      expect(staleCanvas.isConnected).toBe(false);
      expect(root.children).toHaveLength(0);
      expect(failedSmoke).toMatchObject({ canvasRemoved: true, disposed: true, status: "failed" });

      const logLengthAfterFailure = log.length;
      staleCanvas.dispatchEvent(
        new FakePointerEvent("pointerdown", { button: 0, clientX: 20, clientY: 20 }),
      );
      staleCanvas.dispatchEvent(new globalThis.Event("webglcontextlost", { cancelable: true }));
      staleCanvas.dispatchEvent(new globalThis.Event("webglcontextrestored"));
      fakeWindow.dispatchEvent(new globalThis.Event("unhandledrejection"));
      expect(log).toHaveLength(logLengthAfterFailure);
      expect(fakeWindow.__retrostageViewportSmoke).toBe(failedSmoke);

      fakeWindow.location.hash = "";
      const replacement = await createViewportView(root);
      expect(root.children).toHaveLength(1);
      await replacement.dispose();
    },
  );

  it("cleans a pre-runtime factory failure and keeps generation exhaustion ahead of root claim", async () => {
    const bootstrapCause = new Error("adapter-factory-bootstrap-cause");
    const { canvases, createViewportView, root } = await fixture({
      adapterPlans: [{ factoryFailure: bootstrapCause }, {}],
    });
    await expect(createViewportView(root)).rejects.toBe(bootstrapCause);
    expect(canvases[0].isConnected).toBe(false);
    expect(root.children).toHaveLength(0);

    const replacement = await createViewportView(root);
    await replacement.dispose();
    expect(viewportSource.indexOf("const generation = nextViewportGeneration()")).toBeLessThan(
      viewportSource.indexOf("activeRoots.add(root)"),
    );
  });

  it("revokes callbacks and removes the canvas only after adapter disposal", async () => {
    const { createViewportView, log, root } = await fixture();
    const view = await createViewportView(root);
    const canvas = root.children[0];
    await view.dispose();
    expect(log).toContain("dispose:1");
    expect(canvas.isConnected).toBe(false);
    canvas.dispatchEvent(
      new FakePointerEvent("pointerdown", { button: 0, clientX: 20, clientY: 20 }),
    );
    expect(log.filter((entry) => entry.startsWith("pick:"))).toEqual([]);
  });

  it("contains the real smoke seams without forbidden app ownership", () => {
    expect(viewportSource).toContain("createInlineSmokeGlb");
    expect(viewportSource).toContain("i8-smoke-asset-r1");
    expect(viewportSource).toContain("i8-smoke-target");
    expect(viewportSource).toContain("snapshot.timing.sampleCount >= 60");
    expect(viewportSource).toContain("new ResizeObserver");
    expect(viewportSource).toContain('new Event("webglcontextlost", { cancelable: true })');
    expect(viewportSource).toContain("if (event.isTrusted) return");
    expect(viewportSource).toContain("event.stopImmediatePropagation()");
    expect(viewportSource).not.toMatch(/\.getContext\s*\(/u);
    expect(viewportSource).not.toMatch(/adapter\.render\s*\(/u);
    expect(viewportSource).not.toMatch(/(?:from|import\s*)\s*["'](?:electron|node:|@babylonjs\/)/u);
  });
});
