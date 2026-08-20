import type {
  RendererExtent,
  RendererHostSurfaceCapabilityBinding,
  RendererUnsubscribe,
} from "../contracts/public.js";

export type RendererResizeScheduler = (callback: () => void) => void;

export const scheduleRendererResize: RendererResizeScheduler = (callback) => {
  queueMicrotask(callback);
};

function isUsableExtent(extent: RendererExtent): boolean {
  return (
    Number.isFinite(extent.height) &&
    Number.isFinite(extent.width) &&
    extent.height > 0 &&
    extent.width > 0
  );
}

export class RendererResizeController {
  readonly #applyResize: () => void;
  readonly #schedule: RendererResizeScheduler;
  #activeGeneration: number | null = null;
  #disposed = false;
  #pending = false;
  #unsubscribe: RendererUnsubscribe | null = null;

  constructor(schedule: RendererResizeScheduler, applyResize: () => void) {
    this.#schedule = schedule;
    this.#applyResize = applyResize;
  }

  bind(binding: RendererHostSurfaceCapabilityBinding, generation: number): void {
    this.#activeGeneration = generation;
    this.#unsubscribe = binding.observeResize((extent) => {
      this.request(generation, extent);
    });
  }

  dispose(): void {
    this.#disposed = true;
    this.#activeGeneration = null;
    this.#pending = false;
    const unsubscribe = this.#unsubscribe;
    this.#unsubscribe = null;
    unsubscribe?.();
  }

  request(generation: number, extent?: RendererExtent): boolean {
    if (
      this.#disposed ||
      generation !== this.#activeGeneration ||
      (extent !== undefined && !isUsableExtent(extent))
    ) {
      return false;
    }
    if (this.#pending) return true;

    this.#pending = true;
    this.#schedule(() => {
      if (this.#disposed || generation !== this.#activeGeneration || !this.#pending) return;
      this.#pending = false;
      this.#applyResize();
    });
    return true;
  }
}
