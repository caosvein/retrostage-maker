import type {
  RendererDiagnosticsFactory,
  RendererDiagnosticsPort,
  RendererInstrumentationSample,
} from "./diagnostics-port.js";

const unavailableSample = (): RendererInstrumentationSample =>
  Object.freeze({
    engineGpuFrameMilliseconds: null,
    sceneActiveMeshesEvaluationMilliseconds: null,
    sceneFrameMilliseconds: null,
    sceneRenderMilliseconds: null,
  });

function normalizeMetric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

function normalizeSample(value: unknown): RendererInstrumentationSample {
  if (typeof value !== "object" || value === null) return unavailableSample();
  const sample = value as Partial<RendererInstrumentationSample>;
  return Object.freeze({
    engineGpuFrameMilliseconds: normalizeMetric(sample.engineGpuFrameMilliseconds),
    sceneActiveMeshesEvaluationMilliseconds: normalizeMetric(
      sample.sceneActiveMeshesEvaluationMilliseconds,
    ),
    sceneFrameMilliseconds: normalizeMetric(sample.sceneFrameMilliseconds),
    sceneRenderMilliseconds: normalizeMetric(sample.sceneRenderMilliseconds),
  });
}

function isDiagnosticsPort(value: unknown): value is RendererDiagnosticsPort {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<RendererDiagnosticsPort>;
  return typeof candidate.capture === "function" && typeof candidate.dispose === "function";
}

export class RendererDiagnosticsController {
  readonly #factory: RendererDiagnosticsFactory | null;
  #lastSample = unavailableSample();
  #port: RendererDiagnosticsPort | null = null;
  #terminal = false;

  constructor(factory?: RendererDiagnosticsFactory) {
    this.#factory = factory ?? null;
  }

  attach(engineNativeHandle: unknown, sceneNativeHandle: unknown): void {
    if (this.#terminal || this.#factory === null || this.#port !== null) return;
    try {
      const port = this.#factory(engineNativeHandle, sceneNativeHandle);
      if (!isDiagnosticsPort(port)) return;
      this.#port = port;
    } catch {
      // Instrumentation is observational and cannot prevent renderer readiness.
    }
  }

  capture(): RendererInstrumentationSample {
    if (this.#terminal || this.#port === null) return this.#lastSample;
    try {
      this.#lastSample = normalizeSample(this.#port.capture());
    } catch {
      const failedPort = this.#port;
      this.#port = null;
      this.#lastSample = unavailableSample();
      try {
        failedPort.dispose();
      } catch {
        // Capture failures stay observational; the failed port is never called again.
      }
    }
    return this.#lastSample;
  }

  dispose(): void {
    if (this.#terminal) return;
    this.#terminal = true;
    const port = this.#port;
    this.#port = null;
    port?.dispose();
  }
}
