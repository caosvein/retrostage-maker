import type {
  RendererContextObservation,
  RendererHostSurfaceCapabilityBinding,
  RendererUnsubscribe,
} from "../contracts/public.js";

export class RendererContextController {
  #activeGeneration: number | null = null;
  #disposed = false;
  #unsubscribe: RendererUnsubscribe | null = null;

  bind(
    binding: RendererHostSurfaceCapabilityBinding,
    generation: number,
    listener: (state: RendererContextObservation, generation: number) => void,
  ): void {
    this.#activeGeneration = generation;
    this.#unsubscribe = binding.observeContextState((state) => {
      if (this.#disposed || generation !== this.#activeGeneration) return;
      listener(state, generation);
    });
  }

  dispose(): void {
    this.#disposed = true;
    this.#activeGeneration = null;
    const unsubscribe = this.#unsubscribe;
    this.#unsubscribe = null;
    unsubscribe?.();
  }
}
