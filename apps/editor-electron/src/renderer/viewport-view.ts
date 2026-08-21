import {
  createRendererAdapter,
  createRendererHostSurfaceCapability,
} from "@retrostage/renderer-babylon9";
import type {
  RendererAdapter,
  RendererExtent,
  RendererFailure,
  RendererHostSurface,
  RendererLifecycleState,
  RendererPickIntent,
  RendererProjectionInput,
  RendererProjectionRevision,
  RendererUnsubscribe,
} from "@retrostage/renderer-babylon9";
import {
  createRendererEditorGizmoControls,
  createRendererEditorViewportControls,
} from "@retrostage/renderer-babylon9/editor";
import type {
  RendererEditorGizmoControls,
  RendererEditorViewportControls,
  RendererGizmoIntent,
} from "@retrostage/renderer-babylon9/editor";

export interface ViewportView {
  dispose(): Promise<void>;
}

interface ViewportSmokeState {
  readonly assetInstantiated: boolean;
  readonly assetLoaded: boolean;
  readonly canvasRemoved: boolean;
  readonly contextLostObserved: boolean;
  readonly contextRestoredObserved: boolean;
  readonly disposed: boolean;
  readonly frameSampleCount: number;
  readonly generation: number;
  readonly gizmoAttached: boolean;
  readonly gizmoModesAccepted: boolean;
  readonly mounted: boolean;
  readonly pickIntentCount: number;
  readonly rendererDocumentGeneration: number;
  readonly rendererFailureSummary: readonly Readonly<{
    category: string;
    classification: string;
  }>[];
  readonly resizeObserved: boolean;
  readonly running: boolean;
  readonly status: "failed" | "mounting" | "running" | "succeeded";
  readonly terminalAssetContainerCount: number | null;
  readonly terminalAssetInstanceCount: number | null;
  readonly terminalEngineCount: number | null;
  readonly terminalLifecycle: RendererLifecycleState | null;
  readonly terminalSceneCount: number | null;
  readonly unhandledRendererRejectionCount: number;
}

declare global {
  interface Window {
    __retrostageViewportSmoke?: ViewportSmokeState;
  }
}

const activeRoots = new WeakSet<HTMLElement>();
const smokeAssetId = "i8-smoke-asset";
const smokeSourceRevision = "i8-smoke-asset-r1";
const smokeStableId = "i8-smoke-target";
let viewportGenerationSequence = 0;

function nextViewportGeneration(): number {
  if (viewportGenerationSequence === Number.MAX_SAFE_INTEGER) {
    throw new Error("The ViewportView generation sequence is exhausted.");
  }
  viewportGenerationSequence += 1;
  return viewportGenerationSequence;
}

function smokeDocumentGeneration(): number | null {
  const match = /^#rsm6-i8-smoke-(1|2)$/u.exec(window.location.hash);
  return match === null ? null : Number(match[1]);
}

function frozenJson<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) frozenJson(nested);
  return Object.freeze(value);
}

function extentFrom(root: HTMLElement): RendererExtent | null {
  const rectangle = root.getBoundingClientRect();
  if (
    !Number.isFinite(rectangle.width) ||
    !Number.isFinite(rectangle.height) ||
    rectangle.width <= 0 ||
    rectangle.height <= 0
  ) {
    return null;
  }
  return Object.freeze({ height: rectangle.height, width: rectangle.width });
}

function requireAccepted(
  result: { readonly accepted: boolean },
  operation: string,
): asserts result is { readonly accepted: true } {
  if (!result.accepted) throw new Error(`Viewport renderer operation rejected: ${operation}.`);
}

function requireProjectionAccepted(result: {
  readonly status: string;
}): asserts result is { readonly status: "accepted-current" | "duplicate-no-op" } {
  if (result.status === "rejected") throw new Error("Viewport projection was rejected.");
}

function createInlineSmokeGlb(): Uint8Array {
  const source = JSON.stringify({
    asset: { version: "2.0" },
    nodes: [{ name: "i8-smoke-unreferenced-marker" }],
    scene: 0,
    scenes: [{ nodes: [] }],
  });
  const encoded = new TextEncoder().encode(source);
  const jsonLength = Math.ceil(encoded.length / 4) * 4;
  const result = new Uint8Array(20 + jsonLength);
  const view = new DataView(result.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, result.length, true);
  view.setUint32(12, jsonLength, true);
  view.setUint32(16, 0x4e4f534a, true);
  result.fill(0x20, 20);
  result.set(encoded, 20);
  return result;
}

function waitForAnimationFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitUntil(predicate: () => boolean, timeoutMilliseconds: number): Promise<void> {
  const deadline = performance.now() + timeoutMilliseconds;
  while (!predicate()) {
    if (performance.now() >= deadline) throw new Error("Viewport smoke observation timed out.");
    await waitForAnimationFrame();
  }
}

class ViewportViewRuntime implements ViewportView {
  readonly #adapter: RendererAdapter;
  readonly #canvas: HTMLCanvasElement;
  readonly #contextListeners: Set<(state: "lost" | "restored") => void>;
  readonly #failures: RendererFailure[] = [];
  readonly #generation: number;
  readonly #gizmoControls: RendererEditorGizmoControls;
  readonly #gridControls: RendererEditorViewportControls;
  readonly #resizeListeners: Set<(extent: RendererExtent) => void>;
  readonly #root: HTMLElement;
  readonly #smokeGeneration: number | null;
  readonly #syntheticContextLostHandler: (event: Event) => void;
  readonly #syntheticContextRestoredHandler: (event: Event) => void;
  #disposed = false;
  #disposePromise: Promise<void> | null = null;
  #initializationFailed = false;
  #latestGizmoIntent: RendererGizmoIntent | null = null;
  #latestPickIntent: RendererPickIntent | null = null;
  #pickSequence = 0;
  #resizeObserver: ResizeObserver | null = null;
  #smoke: ViewportSmokeState | null = null;
  #unsubscribes: RendererUnsubscribe[] = [];

  private constructor(
    root: HTMLElement,
    canvas: HTMLCanvasElement,
    adapter: RendererAdapter,
    gridControls: RendererEditorViewportControls,
    gizmoControls: RendererEditorGizmoControls,
    generation: number,
    smokeGeneration: number | null,
    resizeListeners: Set<(extent: RendererExtent) => void>,
    contextListeners: Set<(state: "lost" | "restored") => void>,
    syntheticContextLostHandler: (event: Event) => void,
    syntheticContextRestoredHandler: (event: Event) => void,
  ) {
    this.#root = root;
    this.#canvas = canvas;
    this.#adapter = adapter;
    this.#gridControls = gridControls;
    this.#gizmoControls = gizmoControls;
    this.#generation = generation;
    this.#smokeGeneration = smokeGeneration;
    this.#resizeListeners = resizeListeners;
    this.#contextListeners = contextListeners;
    this.#syntheticContextLostHandler = syntheticContextLostHandler;
    this.#syntheticContextRestoredHandler = syntheticContextRestoredHandler;
  }

  static async create(root: HTMLElement): Promise<ViewportViewRuntime> {
    if (activeRoots.has(root))
      throw new Error("The viewport root already owns a live ViewportView.");
    const generation = nextViewportGeneration();
    const smokeGeneration = smokeDocumentGeneration();
    activeRoots.add(root);
    const resizeListeners = new Set<(extent: RendererExtent) => void>();
    const contextListeners = new Set<(state: "lost" | "restored") => void>();
    let canvas: HTMLCanvasElement | null = null;
    let adapter: RendererAdapter | null = null;
    let runtime: ViewportViewRuntime | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let dispatchSyntheticContext: (state: "lost" | "restored") => void = () => undefined;
    let syntheticContextLostHandler: ((event: Event) => void) | null = null;
    let syntheticContextRestoredHandler: ((event: Event) => void) | null = null;
    try {
      canvas = document.createElement("canvas");
      canvas.dataset.retrostageViewport = "babylon9";
      canvas.tabIndex = 0;
      root.append(canvas);
      syntheticContextLostHandler = (event: Event): void => {
        if (event.isTrusted) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        dispatchSyntheticContext("lost");
      };
      syntheticContextRestoredHandler = (event: Event): void => {
        if (event.isTrusted) return;
        event.stopImmediatePropagation();
        dispatchSyntheticContext("restored");
      };
      canvas.addEventListener("webglcontextlost", syntheticContextLostHandler);
      canvas.addEventListener("webglcontextrestored", syntheticContextRestoredHandler);
      adapter = createRendererAdapter();
      const logicalExtent = extentFrom(root);
      const deviceScale = window.devicePixelRatio;
      if (logicalExtent === null || !Number.isFinite(deviceScale) || deviceScale <= 0) {
        throw new Error("The viewport has no finite positive initial extent or device scale.");
      }

      const capability = createRendererHostSurfaceCapability({
        observeContextState(listener) {
          contextListeners.add(listener);
          return () => contextListeners.delete(listener);
        },
        observeResize(listener) {
          resizeListeners.add(listener);
          return () => resizeListeners.delete(listener);
        },
        resolveNativeSurface: () => canvas,
      });
      const host: RendererHostSurface = Object.freeze({
        available: true,
        capability,
        deviceScale,
        generation,
        identity: `editor-electron:viewport:${generation}`,
        logicalExtent,
        pixelExtent: Object.freeze({
          height: logicalExtent.height * deviceScale,
          width: logicalExtent.width * deviceScale,
        }),
      });

      const initializeResult = await adapter.initialize(host);
      requireAccepted(initializeResult, "initialize");
      if (adapter.lifecycleState !== "READY") {
        throw new Error("The viewport adapter did not become READY.");
      }
      const gridControls = createRendererEditorViewportControls(adapter);
      const gizmoControls = createRendererEditorGizmoControls(adapter);
      if (gridControls === null || gizmoControls === null) {
        throw new Error("The viewport editor controls could not be composed.");
      }
      requireAccepted(gridControls.setGridVisible(true), "setGridVisible");

      runtime = new ViewportViewRuntime(
        root,
        canvas,
        adapter,
        gridControls,
        gizmoControls,
        generation,
        smokeGeneration,
        resizeListeners,
        contextListeners,
        syntheticContextLostHandler,
        syntheticContextRestoredHandler,
      );
      const ownedRuntime = runtime;
      dispatchSyntheticContext = (state) => {
        for (const listener of contextListeners) listener(state);
      };

      let lastObservedExtent = logicalExtent;
      resizeObserver = new ResizeObserver(() => {
        const extent = extentFrom(root);
        if (extent === null || ownedRuntime.#disposed) return;
        for (const listener of ownedRuntime.#resizeListeners) listener(extent);
        if (
          extent.width !== lastObservedExtent.width ||
          extent.height !== lastObservedExtent.height
        ) {
          ownedRuntime.#updateSmoke({ resizeObserved: true });
        }
        lastObservedExtent = extent;
      });
      resizeObserver.observe(root);
      ownedRuntime.#resizeObserver = resizeObserver;
      canvas.addEventListener("webglcontextlost", ownedRuntime.#onContextLost);
      canvas.addEventListener("webglcontextrestored", ownedRuntime.#onContextRestored);
      canvas.addEventListener("pointerdown", ownedRuntime.#onPointerDown);

      ownedRuntime.#unsubscribes = [
        adapter.onFailure((failure) => {
          ownedRuntime.#failures.push(failure);
          ownedRuntime.#publishFailureSummary();
        }),
        adapter.onLifecycleState((state) => {
          if (state === "SUSPENDED_CONTEXT_LOSS") {
            ownedRuntime.#updateSmoke({ contextLostObserved: true, running: false });
          } else if (state === "RUNNING" && ownedRuntime.#smoke?.contextLostObserved === true) {
            ownedRuntime.#updateSmoke({ contextRestoredObserved: true, running: true });
          }
        }),
        adapter.onPickIntent((intent) => ownedRuntime.#routePickIntent(intent)),
        gizmoControls.onGizmoIntent((intent) => ownedRuntime.#routeGizmoIntent(intent)),
      ];
      window.addEventListener("unhandledrejection", ownedRuntime.#onUnhandledRejection);

      ownedRuntime.#initializeSmokeState();
      const projection = ownedRuntime.#projectionInput();
      requireProjectionAccepted(await adapter.project(projection));
      requireAccepted(
        adapter.setSelection({ primaryId: null, selectedIds: [], toolIntent: null }),
        "setSelection-empty",
      );
      requireAccepted(await adapter.start(), "start");
      if ((adapter.lifecycleState as RendererLifecycleState) !== "RUNNING") {
        throw new Error("The viewport adapter did not become RUNNING.");
      }
      ownedRuntime.#updateSmoke({ mounted: true, running: true, status: "running" });
      if (smokeGeneration !== null) void ownedRuntime.#runSmoke();
      return ownedRuntime;
    } catch (cause) {
      if (runtime !== null) {
        runtime.#markInitializationFailed();
        await runtime.#disposeAfterInitializationFailure();
      } else {
        if (adapter !== null) await adapter.dispose().catch(() => []);
        try {
          resizeObserver?.disconnect();
        } catch {
          // Preserve the original bootstrap failure.
        }
        resizeListeners.clear();
        contextListeners.clear();
        if (canvas !== null && syntheticContextLostHandler !== null) {
          canvas.removeEventListener("webglcontextlost", syntheticContextLostHandler);
        }
        if (canvas !== null && syntheticContextRestoredHandler !== null) {
          canvas.removeEventListener("webglcontextrestored", syntheticContextRestoredHandler);
        }
        canvas?.remove();
        activeRoots.delete(root);
        if (smokeGeneration !== null) {
          let terminal: ReturnType<RendererAdapter["captureDiagnosticSnapshot"]> | null = null;
          try {
            terminal = adapter?.captureDiagnosticSnapshot() ?? null;
          } catch {
            // The failed adapter may not expose terminal diagnostics.
          }
          window.__retrostageViewportSmoke = frozenJson({
            ...ViewportViewRuntime.#initialSmoke(generation, smokeGeneration),
            canvasRemoved: canvas === null || !canvas.isConnected,
            disposed: true,
            status: "failed",
            terminalAssetContainerCount: terminal?.assets.liveContainerCount ?? null,
            terminalAssetInstanceCount: terminal?.assets.liveInstanceCount ?? null,
            terminalEngineCount: terminal?.resourceCounts.engine ?? null,
            terminalLifecycle: terminal?.lifecycleState ?? null,
            terminalSceneCount: terminal?.resourceCounts.scene ?? null,
          });
        }
      }
      throw cause;
    }
  }

  static #initialSmoke(generation: number, documentGeneration: number): ViewportSmokeState {
    return frozenJson({
      assetInstantiated: false,
      assetLoaded: false,
      canvasRemoved: false,
      contextLostObserved: false,
      contextRestoredObserved: false,
      disposed: false,
      frameSampleCount: 0,
      generation,
      gizmoAttached: false,
      gizmoModesAccepted: false,
      mounted: false,
      pickIntentCount: 0,
      rendererDocumentGeneration: documentGeneration,
      rendererFailureSummary: [],
      resizeObserved: false,
      running: false,
      status: "mounting",
      terminalAssetContainerCount: null,
      terminalAssetInstanceCount: null,
      terminalEngineCount: null,
      terminalLifecycle: null,
      terminalSceneCount: null,
      unhandledRendererRejectionCount: 0,
    });
  }

  #initializeSmokeState(): void {
    if (this.#smokeGeneration === null) return;
    this.#smoke = ViewportViewRuntime.#initialSmoke(this.#generation, this.#smokeGeneration);
    window.__retrostageViewportSmoke = this.#smoke;
  }

  #projectionInput(): RendererProjectionInput {
    const smoke = this.#smokeGeneration !== null;
    return frozenJson({
      content: {
        classification: smoke ? "electron-smoke-viewport" : "empty-editor-viewport",
        source: "electron-derived",
      },
      resources: [],
      revision:
        `editor-electron:${smoke ? "smoke" : "empty"}:${this.#generation}` as RendererProjectionRevision,
      stableIds: smoke ? [smokeStableId] : [],
    });
  }

  #onContextLost = (event: Event): void => {
    event.preventDefault();
    for (const listener of this.#contextListeners) listener("lost");
  };

  #onContextRestored = (): void => {
    for (const listener of this.#contextListeners) listener("restored");
  };

  #onPointerDown = (event: PointerEvent): void => {
    if (this.#disposed || event.button !== 0) return;
    const rectangle = this.#canvas.getBoundingClientRect();
    if (
      !Number.isFinite(rectangle.width) ||
      !Number.isFinite(rectangle.height) ||
      rectangle.width <= 0 ||
      rectangle.height <= 0 ||
      this.#pickSequence === Number.MAX_SAFE_INTEGER
    ) {
      return;
    }
    this.#pickSequence += 1;
    const normalizedPosition = Object.freeze({
      x: Math.min(1, Math.max(0, (event.clientX - rectangle.left) / rectangle.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rectangle.top) / rectangle.height)),
    });
    this.#adapter.pick({
      correlationId: `electron-pick:${this.#pickSequence}`,
      modifiers: Object.freeze({
        alt: event.altKey,
        control: event.ctrlKey,
        meta: event.metaKey,
        shift: event.shiftKey,
      }),
      normalizedPosition,
    });
  };

  #onUnhandledRejection = (): void => {
    this.#updateSmoke({
      unhandledRendererRejectionCount: (this.#smoke?.unhandledRendererRejectionCount ?? 0) + 1,
    });
  };

  #routePickIntent(intent: RendererPickIntent): void {
    if (this.#disposed) return;
    this.#latestPickIntent = frozenJson(intent);
    this.#updateSmoke({ pickIntentCount: (this.#smoke?.pickIntentCount ?? 0) + 1 });
  }

  #routeGizmoIntent(intent: RendererGizmoIntent): void {
    if (this.#disposed) return;
    this.#latestGizmoIntent = frozenJson(intent);
  }

  #updateSmoke(update: Partial<ViewportSmokeState>): void {
    if (this.#smoke === null) return;
    this.#smoke = frozenJson({ ...this.#smoke, ...update });
    window.__retrostageViewportSmoke = this.#smoke;
  }

  #publishFailureSummary(): void {
    this.#updateSmoke({
      rendererFailureSummary: this.#failures.map((failure) =>
        Object.freeze({
          category: failure.category,
          classification: failure.classification,
        }),
      ),
    });
  }

  async #runSmoke(): Promise<void> {
    try {
      const loadResult = await this.#adapter.loadAssetContainer({
        assetId: smokeAssetId,
        bytes: createInlineSmokeGlb(),
        format: "glb-2.0",
        sourceRevision: smokeSourceRevision,
      });
      requireAccepted(loadResult, "loadAssetContainer");
      let diagnostics = this.#adapter.captureDiagnosticSnapshot();
      if (diagnostics.assets.liveContainerCount !== 1) {
        throw new Error("The smoke AssetContainer was not published.");
      }
      this.#updateSmoke({ assetLoaded: true });

      requireAccepted(
        this.#adapter.instantiateAsset({
          assetId: smokeAssetId,
          sourceRevision: smokeSourceRevision,
          stableId: smokeStableId,
        }),
        "instantiateAsset",
      );
      diagnostics = this.#adapter.captureDiagnosticSnapshot();
      if (diagnostics.assets.liveInstanceCount !== 1) {
        throw new Error("The smoke asset instance was not published.");
      }
      this.#updateSmoke({ assetInstantiated: true });

      requireAccepted(
        this.#adapter.setSelection({
          primaryId: smokeStableId,
          selectedIds: [smokeStableId],
          toolIntent: null,
        }),
        "setSelection-smoke",
      );
      requireAccepted(this.#gizmoControls.attachGizmo(), "attachGizmo");
      this.#updateSmoke({ gizmoAttached: true });
      for (const mode of ["position", "rotation", "scale"] as const) {
        requireAccepted(this.#gizmoControls.setGizmoMode(mode), `setGizmoMode-${mode}`);
      }
      this.#updateSmoke({ gizmoModesAccepted: true });

      const rectangle = this.#canvas.getBoundingClientRect();
      this.#canvas.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          clientX: rectangle.left + rectangle.width / 2,
          clientY: rectangle.top + rectangle.height / 2,
        }),
      );
      await waitUntil(() => (this.#smoke?.pickIntentCount ?? 0) >= 1, 5_000);

      requireAccepted(
        this.#adapter.disposeAssetContainer({ assetId: smokeAssetId }),
        "disposeAssetContainer",
      );
      diagnostics = this.#adapter.captureDiagnosticSnapshot();
      if (
        diagnostics.assets.liveContainerCount !== 0 ||
        diagnostics.assets.liveInstanceCount !== 0
      ) {
        throw new Error("The smoke asset resources were not released.");
      }

      await waitUntil(() => {
        const snapshot = this.#adapter.captureDiagnosticSnapshot();
        this.#updateSmoke({ frameSampleCount: snapshot.timing.sampleCount });
        return (
          snapshot.timing.sampleCount >= 60 &&
          snapshot.lifecycleState === "RUNNING" &&
          snapshot.resourceCounts.engine === 1 &&
          snapshot.resourceCounts.scene === 1 &&
          snapshot.health === "healthy"
        );
      }, 20_000);
      await waitUntil(() => this.#smoke?.resizeObserved === true, 10_000);

      const beforeContext = this.#adapter.captureDiagnosticSnapshot().timing.sampleCount;
      const lostEvent = new Event("webglcontextlost", { cancelable: true });
      this.#canvas.dispatchEvent(lostEvent);
      if (!lostEvent.defaultPrevented) throw new Error("Context loss was not prevented.");
      await waitUntil(() => this.#adapter.lifecycleState === "SUSPENDED_CONTEXT_LOSS", 5_000);
      this.#canvas.dispatchEvent(new Event("webglcontextrestored"));
      await waitUntil(
        () =>
          this.#adapter.lifecycleState === "RUNNING" &&
          this.#adapter.captureDiagnosticSnapshot().timing.sampleCount > beforeContext,
        10_000,
      );
      this.#updateSmoke({
        contextLostObserved: true,
        contextRestoredObserved: true,
        frameSampleCount: this.#adapter.captureDiagnosticSnapshot().timing.sampleCount,
        running: true,
      });
      await this.dispose();
    } catch {
      this.#updateSmoke({ status: "failed" });
      await this.dispose();
    }
  }

  dispose(): Promise<void> {
    this.#disposePromise ??= this.#dispose(false);
    return this.#disposePromise;
  }

  #markInitializationFailed(): void {
    this.#initializationFailed = true;
    this.#updateSmoke({ running: false, status: "failed" });
  }

  #disposeAfterInitializationFailure(): Promise<void> {
    this.#disposePromise ??= this.#dispose(true);
    return this.#disposePromise;
  }

  async #dispose(preserveBootstrapCause: boolean): Promise<void> {
    if (this.#disposed) return;
    this.#disposed = true;
    let cleanupFailure: unknown;
    const recordCleanupFailure = (cause: unknown): void => {
      cleanupFailure ??= cause;
    };
    for (const removeListener of [
      () => this.#canvas.removeEventListener("pointerdown", this.#onPointerDown),
      () => this.#canvas.removeEventListener("webglcontextlost", this.#onContextLost),
      () => this.#canvas.removeEventListener("webglcontextrestored", this.#onContextRestored),
      () => this.#canvas.removeEventListener("webglcontextlost", this.#syntheticContextLostHandler),
      () =>
        this.#canvas.removeEventListener(
          "webglcontextrestored",
          this.#syntheticContextRestoredHandler,
        ),
    ]) {
      try {
        removeListener();
      } catch (cause) {
        recordCleanupFailure(cause);
      }
    }
    try {
      window.removeEventListener("unhandledrejection", this.#onUnhandledRejection);
    } catch (cause) {
      recordCleanupFailure(cause);
    }
    for (const unsubscribe of this.#unsubscribes) {
      try {
        unsubscribe();
      } catch (cause) {
        recordCleanupFailure(cause);
      }
    }
    this.#unsubscribes = [];
    this.#latestGizmoIntent = null;
    this.#latestPickIntent = null;
    let disposalFailures: readonly RendererFailure[] = [];
    try {
      disposalFailures = await this.#adapter.dispose();
    } catch (cause) {
      recordCleanupFailure(cause);
    }
    this.#failures.push(...disposalFailures);
    this.#publishFailureSummary();
    let terminal: ReturnType<RendererAdapter["captureDiagnosticSnapshot"]> | null = null;
    try {
      terminal = this.#adapter.captureDiagnosticSnapshot();
    } catch (cause) {
      recordCleanupFailure(cause);
    }
    try {
      this.#resizeObserver?.disconnect();
    } catch (cause) {
      recordCleanupFailure(cause);
    }
    this.#resizeObserver = null;
    this.#resizeListeners.clear();
    this.#contextListeners.clear();
    try {
      this.#canvas.remove();
    } catch (cause) {
      recordCleanupFailure(cause);
    }
    activeRoots.delete(this.#root);
    const expectedFailures = this.#failures.filter(
      (failure) => failure.category !== "CONTEXT_OR_DEVICE_LOST",
    );
    this.#updateSmoke({
      canvasRemoved: !this.#canvas.isConnected,
      disposed: true,
      frameSampleCount: Math.max(
        this.#smoke?.frameSampleCount ?? 0,
        terminal?.timing.sampleCount ?? 0,
      ),
      rendererFailureSummary: this.#failures.map((failure) =>
        Object.freeze({
          category: failure.category,
          classification: failure.classification,
        }),
      ),
      running: false,
      status:
        this.#initializationFailed ||
        this.#smoke?.status === "failed" ||
        expectedFailures.length > 0 ||
        cleanupFailure !== undefined
          ? "failed"
          : "succeeded",
      terminalAssetContainerCount: terminal?.assets.liveContainerCount ?? null,
      terminalAssetInstanceCount: terminal?.assets.liveInstanceCount ?? null,
      terminalEngineCount: terminal?.resourceCounts.engine ?? null,
      terminalLifecycle: terminal?.lifecycleState ?? null,
      terminalSceneCount: terminal?.resourceCounts.scene ?? null,
    });
    if (!preserveBootstrapCause && cleanupFailure !== undefined) {
      if (cleanupFailure instanceof Error) throw cleanupFailure;
      throw new Error("Viewport disposal failed.", { cause: cleanupFailure });
    }
  }
}

export function createViewportView(root: HTMLElement): Promise<ViewportView> {
  return ViewportViewRuntime.create(root);
}
