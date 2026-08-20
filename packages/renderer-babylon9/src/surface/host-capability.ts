import type {
  RendererHostSurfaceCapability,
  RendererHostSurfaceCapabilityBinding,
} from "../contracts/public.js";

const bindings = new WeakMap<object, RendererHostSurfaceCapabilityBinding>();

function isBinding(value: RendererHostSurfaceCapabilityBinding): boolean {
  return (
    typeof value.resolveNativeSurface === "function" &&
    typeof value.observeResize === "function" &&
    typeof value.observeContextState === "function"
  );
}

export function createRendererHostSurfaceCapability(
  binding: RendererHostSurfaceCapabilityBinding,
): RendererHostSurfaceCapability {
  if (!isBinding(binding)) {
    throw new TypeError("Renderer host capability binding is incomplete.");
  }

  const capability = Object.freeze({}) as RendererHostSurfaceCapability;
  bindings.set(capability, binding);
  return capability;
}

export function resolveRendererHostSurfaceCapability(
  capability: RendererHostSurfaceCapability,
): RendererHostSurfaceCapabilityBinding | null {
  return bindings.get(capability) ?? null;
}
