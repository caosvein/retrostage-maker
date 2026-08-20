import type {
  RendererAdapter,
  RendererOperationResult,
  RendererUnsubscribe,
} from "../contracts/public.js";
import { resolveRendererEditorBridge } from "../engine/renderer-adapter.js";
import type { RendererEditorBridge } from "../engine/renderer-adapter.js";
import { createBabylonGrid } from "./babylon-grid-factory.js";
import type {
  RendererGridFactory,
  RendererGridLineDefinition,
  RendererGridPort,
  RendererGridVisual,
} from "./grid-port.js";

export interface RendererEditorViewportControls {
  setGridVisible(visible: boolean): RendererOperationResult;
}

export const RENDERER_GRID_VISUAL: RendererGridVisual = Object.freeze({
  alpha: 0.6,
  blue: 0.42,
  green: 0.38,
  red: 0.35,
});

export function createRendererGridLineDefinitions(): readonly RendererGridLineDefinition[] {
  const lines: RendererGridLineDefinition[] = [];
  for (let coordinate = -10; coordinate <= 10; coordinate += 1) {
    lines.push({
      end: { x: 10, y: 0, z: coordinate },
      start: { x: -10, y: 0, z: coordinate },
    });
    lines.push({
      end: { x: coordinate, y: 0, z: 10 },
      start: { x: coordinate, y: 0, z: -10 },
    });
  }
  return lines;
}

class RendererGridController implements RendererEditorViewportControls {
  readonly #bridge: RendererEditorBridge;
  readonly #factory: RendererGridFactory;
  readonly #lines = createRendererGridLineDefinitions();
  #desiredVisible = false;
  #disposed = false;
  #grid: RendererGridPort | null = null;
  #unsubscribe: RendererUnsubscribe;

  constructor(adapter: RendererAdapter, factory: RendererGridFactory) {
    const bridge = resolveRendererEditorBridge(adapter);
    if (bridge === null) throw new Error("The adapter is not a compatible renderer runtime.");
    this.#bridge = bridge;
    this.#factory = factory;
    this.#unsubscribe = bridge.onLifecycleState((state) => {
      if (state === "DISPOSING") {
        this.#disposeForAdapter();
        return;
      }
      if (state === "RUNNING" && !this.#disposed) this.#rehydrateDesiredState();
    });
  }

  setGridVisible(visible: boolean): RendererOperationResult {
    const state = this.#bridge.getLifecycleState();
    if (
      this.#disposed ||
      (state !== "READY" && state !== "RUNNING" && state !== "SUSPENDED_CONTEXT_LOSS")
    ) {
      return this.#bridge.reportViewControlFailure(
        "Editor Grid visibility requires READY, RUNNING, or SUSPENDED_CONTEXT_LOSS state.",
      );
    }

    this.#desiredVisible = visible;
    if (state === "SUSPENDED_CONTEXT_LOSS") return { accepted: true };

    try {
      this.#applyDesiredState();
      return { accepted: true };
    } catch (cause) {
      return this.#bridge.reportViewControlFailure(
        "The editor Grid visibility operation failed.",
        cause,
      );
    }
  }

  #applyDesiredState(): void {
    if (!this.#desiredVisible && this.#grid === null) return;
    if (this.#grid === null) {
      const scene = this.#bridge.getScene();
      if (scene === null) throw new Error("No private Scene is available for the editor Grid.");
      this.#grid = this.#factory(scene.nativeHandle, this.#lines, RENDERER_GRID_VISUAL);
    }
    this.#grid.setVisible(this.#desiredVisible);
  }

  #rehydrateDesiredState(): void {
    try {
      this.#applyDesiredState();
    } catch (cause) {
      const staleGrid = this.#grid;
      this.#grid = null;
      if (staleGrid !== null) {
        try {
          staleGrid.dispose();
        } catch (disposeCause) {
          this.#bridge.reportDisposalFailure(
            "An obsolete editor Grid could not be disposed during context restoration.",
            disposeCause,
          );
        }
      }
      if (!this.#desiredVisible) {
        this.#bridge.reportViewControlFailure(
          "The editor Grid could not reapply hidden state after context restoration.",
          cause,
        );
        return;
      }
      try {
        this.#applyDesiredState();
      } catch (replacementCause) {
        this.#bridge.reportViewControlFailure(
          "The editor Grid could not be rehydrated after context restoration.",
          replacementCause,
        );
      }
    }
  }

  #disposeForAdapter(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#unsubscribe();
    this.#unsubscribe = () => undefined;
    const grid = this.#grid;
    this.#grid = null;
    if (grid === null) return;
    try {
      grid.dispose();
    } catch (cause) {
      this.#bridge.reportDisposalFailure(
        "The editor Grid could not be disposed before Camera/Scene/Engine teardown.",
        cause,
      );
    }
  }
}

const adapterGridControllers = new WeakMap<RendererAdapter, RendererGridController>();

function getOrCreateRendererGridController(
  adapter: RendererAdapter,
  factory: RendererGridFactory,
): RendererGridController | null {
  if (resolveRendererEditorBridge(adapter) === null) return null;
  const existing = adapterGridControllers.get(adapter);
  if (existing !== undefined) return existing;
  const controller = new RendererGridController(adapter, factory);
  adapterGridControllers.set(adapter, controller);
  return controller;
}

export function createRendererEditorViewportControls(
  adapter: RendererAdapter,
): RendererEditorViewportControls | null {
  return getOrCreateRendererGridController(adapter, createBabylonGrid);
}

export function createRendererEditorViewportControlsForTests(
  adapter: RendererAdapter,
  factory: RendererGridFactory,
): RendererEditorViewportControls | null {
  return getOrCreateRendererGridController(adapter, factory);
}
