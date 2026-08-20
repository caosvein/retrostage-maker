declare const rendererHostSurfaceCapabilityBrand: unique symbol;
declare const rendererProjectionRevisionBrand: unique symbol;

export type RendererJsonPrimitive = boolean | number | string | null;

export type RendererJsonValue =
  | RendererJsonPrimitive
  | readonly RendererJsonValue[]
  | { readonly [key: string]: RendererJsonValue };

export type RendererProjectionRevision = string & {
  readonly [rendererProjectionRevisionBrand]: "RendererProjectionRevision";
};

export interface RendererExtent {
  readonly height: number;
  readonly width: number;
}

export interface RendererVector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface RendererCameraProjection {
  readonly alphaRadians: number;
  readonly betaRadians: number;
  readonly radius: number;
  readonly target: RendererVector3;
  readonly verticalFieldOfViewRadians: number;
  readonly nearClip: number;
  readonly farClip: number;
}

export interface RendererHostSurfaceCapability {
  readonly [rendererHostSurfaceCapabilityBrand]: "RendererHostSurfaceCapability";
}

export type RendererContextObservation = "lost" | "restored";

export interface RendererHostSurfaceCapabilityBinding {
  observeContextState(listener: (state: RendererContextObservation) => void): RendererUnsubscribe;
  observeResize(listener: (extent: RendererExtent) => void): RendererUnsubscribe;
  resolveNativeSurface(): unknown;
}

export interface RendererHostSurface {
  readonly available: boolean;
  readonly capability: RendererHostSurfaceCapability;
  readonly deviceScale: number;
  readonly generation: number;
  readonly identity: string;
  readonly logicalExtent: RendererExtent;
  readonly pixelExtent: RendererExtent;
}

export interface RendererProjectionResource {
  readonly stableId: string;
  readonly sourceRevision: string;
  readonly value: RendererJsonValue;
}

export interface RendererProjectionInput {
  readonly content: RendererJsonValue;
  readonly resources: readonly RendererProjectionResource[];
  readonly revision: RendererProjectionRevision;
  readonly stableIds: readonly string[];
}

export interface RendererSelectionState {
  readonly primaryId: string | null;
  readonly selectedIds: readonly string[];
  readonly toolIntent: RendererJsonValue | null;
}

export interface RendererInputModifiers {
  readonly alt: boolean;
  readonly control: boolean;
  readonly meta: boolean;
  readonly shift: boolean;
}

export interface RendererViewportPoint {
  readonly x: number;
  readonly y: number;
}

export interface RendererPickRequest {
  readonly correlationId: string;
  readonly modifiers: RendererInputModifiers;
  readonly normalizedPosition: RendererViewportPoint;
}

export interface RendererPickIntent {
  readonly classification: string;
  readonly correlationId: string;
  readonly hitClass: "background" | "target";
  readonly modifiers: RendererInputModifiers;
  readonly observation: RendererJsonValue | null;
  readonly revision: RendererProjectionRevision;
  readonly targetId: string | null;
}

export type RendererGizmoPhase = "begin" | "cancel" | "commit" | "update";

export interface RendererGizmoIntent {
  readonly candidate: RendererJsonValue | null;
  readonly correlationId: string;
  readonly delta: RendererJsonValue | null;
  readonly kind: string;
  readonly phase: RendererGizmoPhase;
  readonly revision: RendererProjectionRevision;
  readonly targetId: string;
}

export type RendererLifecycleState =
  | "NEW"
  | "INITIALIZING"
  | "READY"
  | "RUNNING"
  | "SUSPENDED_CONTEXT_LOSS"
  | "FAILED"
  | "DISPOSING"
  | "DISPOSED";

export type RendererFailureCategory =
  | "HOST_SURFACE_UNAVAILABLE"
  | "ENGINE_INITIALIZATION_FAILED"
  | "CONTEXT_OR_DEVICE_LOST"
  | "CONTEXT_OR_DEVICE_RESTORE_FAILED"
  | "PROJECTION_REJECTED_OR_STALE"
  | "SCENE_PROJECTION_FAILED"
  | "ASSET_LOAD_FAILED"
  | "UNSUPPORTED_DECODER"
  | "PICK_RESOLUTION_FAILED"
  | "RESOURCE_DISPOSAL_FAILED"
  | "VIEW_CONTROL_REJECTED"
  | "RENDERER_INTERNAL_FAILURE";

export interface RendererFailureCauseSummary {
  readonly authoritative: false;
  readonly summary: string;
}

export interface RendererFailure {
  readonly category: RendererFailureCategory;
  readonly cause: RendererFailureCauseSummary | null;
  readonly classification: "fatal" | "recoverable";
  readonly correlationId: string | null;
  readonly detail: string | null;
  readonly lifecycleState: RendererLifecycleState;
  readonly messageId: string;
  readonly revision: RendererProjectionRevision | null;
  readonly targetId: string | null;
}

export type RendererHealth = "degraded" | "failed" | "healthy" | "unavailable";

export interface RendererTimingSnapshot {
  readonly frameMilliseconds: number | null;
  readonly framesPerSecond: number | null;
  readonly sampleCount: number;
}

export interface RendererDiagnosticSnapshot {
  readonly adapterGeneration: number;
  readonly contextState: "available" | "lost" | "unavailable" | "unsupported";
  readonly correlationIds: readonly string[];
  readonly failureCounts: Readonly<Record<RendererFailureCategory, number>>;
  readonly health: RendererHealth;
  readonly lifecycleState: RendererLifecycleState;
  readonly projectionRevision: RendererProjectionRevision | null;
  readonly resourceCounts: Readonly<Record<string, number>>;
  readonly timing: RendererTimingSnapshot;
  readonly unavailableMetrics: readonly string[];
}

export type RendererOperationResult =
  | { readonly accepted: true }
  | { readonly accepted: false; readonly failure: RendererFailure };

export type RendererProjectionResult =
  | { readonly status: "accepted-current" | "duplicate-no-op" }
  | { readonly failure: RendererFailure; readonly status: "rejected" };

export type RendererIntentListener<TIntent> = (intent: TIntent) => void;
export type RendererStateListener = (state: RendererLifecycleState) => void;
export type RendererFailureListener = (failure: RendererFailure) => void;
export type RendererUnsubscribe = () => void;

export interface RendererAdapter {
  readonly lifecycleState: RendererLifecycleState;

  attachSurface(host: RendererHostSurface): Promise<RendererOperationResult>;
  captureDiagnosticSnapshot(): RendererDiagnosticSnapshot;
  detachSurface(): Promise<readonly RendererFailure[]>;
  dispose(): Promise<readonly RendererFailure[]>;
  initialize(host: RendererHostSurface): Promise<RendererOperationResult>;
  onFailure(listener: RendererFailureListener): RendererUnsubscribe;
  onLifecycleState(listener: RendererStateListener): RendererUnsubscribe;
  onPickIntent(listener: RendererIntentListener<RendererPickIntent>): RendererUnsubscribe;
  pick(request: RendererPickRequest): RendererOperationResult;
  project(input: RendererProjectionInput): Promise<RendererProjectionResult>;
  render(): RendererOperationResult;
  resize(): RendererOperationResult;
  resetView(): RendererOperationResult;
  setCameraProjection(projection: RendererCameraProjection): RendererOperationResult;
  setSelection(selection: RendererSelectionState): RendererOperationResult;
  start(): Promise<RendererOperationResult>;
}
