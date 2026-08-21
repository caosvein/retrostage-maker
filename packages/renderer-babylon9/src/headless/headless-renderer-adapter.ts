import type { RendererAdapter, RendererHostSurface } from "../contracts/public.js";
import { createRendererAdapterForHeadlessRuntime } from "../engine/renderer-adapter.js";
import { createRendererHostSurfaceCapability } from "../surface/host-capability.js";
import { createNullEngine } from "./null-engine-factory.js";

const headlessNativeSurface = Object.freeze({ identity: "retrostage-headless-nullengine" });
const headlessHost: RendererHostSurface = Object.freeze({
  available: true,
  capability: createRendererHostSurfaceCapability({
    observeContextState: () => () => undefined,
    observeResize: () => () => undefined,
    resolveNativeSurface: () => headlessNativeSurface,
  }),
  deviceScale: 1,
  generation: 1,
  identity: "retrostage-headless-nullengine",
  logicalExtent: Object.freeze({ height: 256, width: 256 }),
  pixelExtent: Object.freeze({ height: 256, width: 256 }),
});

export async function createHeadlessRendererAdapter(): Promise<RendererAdapter> {
  const adapter = createRendererAdapterForHeadlessRuntime(createNullEngine);
  const result = await adapter.initialize(headlessHost);
  if (result.accepted) return adapter;
  await adapter.dispose();
  throw new Error(`Headless renderer initialization failed: ${result.failure.messageId}`);
}
