# RetroStage Maker — Reboot Architecture and Package Map

**Document ID:** `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP`  
**Role:** Authoritative reboot architecture, application-boundary, package-ownership, dependency-direction, and state-authority map  
**Project:** RetroStage Maker  
**Distribution intent:** Commercial proprietary desktop creator distributed through Steam and other approved Windows channels  
**Source generation:** Reboot / clean-start  
**Document date:** 2026-08-05  
**Document state:** `PLANNED ARCHITECTURE / PRE-REPOSITORY`  
**Repository:** `NOT YET CREATED`  
**Primary branch:** `NOT YET ESTABLISHED`  
**Governing charter:** `00_RSM_REBOOT_PROJECT_CHARTER.md`  
**Technology authority:** `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`  
**Roadmap authority:** `01_RSM_REBOOT_CANONICAL_ROADMAP.md`  
**Decision authority:** `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`  
**Supersedes:** Live-status and package-existence interpretation of the 2026-07 pre-loss architecture map  
**Preserves:** RetroStage-owned canonical data, headless domain boundaries, renderer-derived state, single mutation authority, explicit runtime ownership, application/package separation, and evidence-driven architecture review

---

## 1. Purpose

This document translates the approved reboot charter, technology contract, canonical roadmap, and durable product decisions into a planned application and package architecture.

It defines:

- application boundaries,
- Electron process boundaries,
- canonical state authorities,
- package families and planned package names,
- dependency direction,
- public-entrypoint rules,
- browser, Node, Electron, and headless environment boundaries,
- editor/player separation,
- Babylon.js adapter ownership,
- authoring-session and command ownership,
- storage, recovery, asset-pipeline, runtime, export, diagnostics, and testing boundaries,
- milestone-gated package growth,
- conditions under which a package may be created, split, merged, replaced, or removed,
- forbidden dependency and state-ownership directions.

This document is not:

- proof that a repository exists,
- proof that a directory or package exists,
- a package manifest,
- a lockfile,
- a live architecture report,
- permission to create every planned package immediately,
- permission to expose internal package files as public API,
- permission for Babylon, Electron, React, SQLite, or any other dependency to own canonical project truth,
- a substitute for repository inspection, architecture tests, milestone validation, or committed evidence.

The future repository manifests, package public entrypoints, architecture tests, dependency graph, lockfile, build outputs, and committed source remain the implementation evidence.

---

## 2. Governing Source Relationship

This map is subordinate to the following sources:

1. `00_RSM_REBOOT_PROJECT_CHARTER.md`
2. `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
3. `01_RSM_REBOOT_CANONICAL_ROADMAP.md`
4. `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
5. this architecture and package map
6. future current-state, active-milestone, and repository-local evidence

Use authority by question:

| Question | Authority |
|---|---|
| What is RetroStage Maker? | Reboot charter |
| Which technologies and license classes are approved? | Technology/dependency contract |
| When is a capability introduced? | Canonical roadmap |
| Which durable choices are adopted, deferred, conditional, rejected, or superseded? | Product decisions source |
| Which package or application owns a responsibility? | This architecture map |
| What currently exists? | Live repository, manifests, public entrypoints, tests, commits, current-state source |
| What is the active task? | Current-milestone source and repository-local phase plan |

### Conflict rule

If this document conflicts with a higher authority, the higher authority wins and this document must be corrected.

If a future repository intentionally differs from this planned map, the difference must be resolved through explicit architecture change control. The repository does not silently invalidate an approved boundary, and this document does not silently override observed repository truth.

---

## 3. Truthful Reboot State

At the date of this source:

```text
Project state: PRE-REPOSITORY / REBOOT PLANNING
Live repository: NONE
Implemented reboot applications: NONE
Implemented reboot packages: NONE
Installed reboot dependencies: NONE
Approved application direction: Electron editor + separate Electron player
Approved renderer direction: Babylon.js 9 adapter
Approved language direction: TypeScript
Approved canonical authority: RetroStage-owned documents and typed commands
Package topology status: PLANNED, NOT IMPLEMENTED
```

Every package name in this document is a planned ownership boundary.

A package becomes real only when all of the following exist:

- a repository directory,
- a package manifest,
- an approved public entrypoint,
- architecture-compatible dependencies,
- tests appropriate to its authority,
- committed evidence.

An empty directory, placeholder manifest, exported type, or roadmap label is not a proven package capability.

---

## 4. Architecture Goals

The reboot architecture must optimize for the following goals.

### 4.1 Product ownership

RetroStage must own:

- canonical project data,
- schema versions and migrations,
- stable identities,
- component semantics,
- command semantics,
- validation truth,
- capability truth,
- creator workflows,
- runtime gameplay semantics,
- export policy,
- diagnostics,
- compatibility policy.

### 4.2 Replaceable adapters

Electron, Babylon.js, React, SQLite, Havok, Recast, glTF-Transform, and other third-party components must be isolated behind RetroStage-owned boundaries.

Replacement may be expensive, but it must remain conceptually possible without changing canonical project meaning.

### 4.3 One authority per responsibility

The architecture must not create competing owners for:

- scene identity,
- document mutation,
- validation severity,
- project persistence,
- runtime lifecycle,
- filesystem access,
- renderer projection,
- asset identity,
- export contents.

### 4.4 Headless domain logic

Canonical documents, schemas, migration, validation, commands, reference logic, and runtime contracts must remain testable without:

- Electron,
- DOM,
- React,
- Babylon.js,
- a GPU,
- an application window.

### 4.5 Early vertical-slice proof

The initial architecture must support the Gate B chain:

```text
Create project
→ create scene
→ create entity
→ edit component
→ project to Babylon preview
→ save
→ close
→ reopen
→ start disposable PIE
→ stop without changing authoring truth
→ cook minimal runtime content
→ package standalone player
→ run on a clean target
```

### 4.6 Controlled growth

The monorepo must not create one package per feature or one package per roadmap milestone.

A new package requires a proven boundary, not merely a future idea.

### 4.7 Commercial reliability

Architecture decisions must support:

- remote backup and restore,
- atomic save,
- autosave and recovery,
- deterministic cooking,
- clean-machine execution,
- SBOM and notices,
- workspace trust,
- crash diagnosis,
- backward compatibility.

---

## 5. Top-Level Architecture

The approved top-level model is:

```text
┌──────────────────────────────────────────────────────────────┐
│                       RetroStage Maker                       │
├──────────────────────────────────────────────────────────────┤
│ apps/editor-electron                                        │
│  ├─ Electron Main                                           │
│  ├─ secure Preload                                          │
│  └─ React + Babylon editor renderer                         │
├──────────────────────────────────────────────────────────────┤
│ RetroStage application/use-case layer                       │
│  ├─ project lifecycle                                       │
│  ├─ authoring sessions                                      │
│  ├─ command dispatch                                        │
│  ├─ validation                                              │
│  ├─ jobs                                                    │
│  └─ Preview / PIE orchestration                             │
├──────────────────────────────────────────────────────────────┤
│ RetroStage domain and contracts                             │
│  ├─ canonical documents                                     │
│  ├─ stable IDs                                              │
│  ├─ schemas and migration                                   │
│  ├─ component registry                                      │
│  ├─ commands and diagnostics                                │
│  └─ runtime contracts                                       │
├──────────────────────────────────────────────────────────────┤
│ Approved adapters                                            │
│  ├─ project storage / filesystem                            │
│  ├─ Babylon.js 9 renderer                                   │
│  ├─ asset import/cooking                                    │
│  ├─ physics/navigation                                      │
│  ├─ local index                                             │
│  └─ logging/archive/export                                  │
├──────────────────────────────────────────────────────────────┤
│ apps/player-electron                                        │
│  ├─ minimal Electron Main                                   │
│  ├─ minimal secure Preload                                  │
│  └─ cooked runtime + Babylon projection                     │
└──────────────────────────────────────────────────────────────┘
```

The editor and player share approved domain and runtime packages, but they are distinct applications and distinct build products.

---

## 6. Architectural Layers

The architecture uses six conceptual layers.

### 6.1 Foundation layer

Owns small, stable, environment-independent primitives:

- branded stable IDs,
- result and error primitives,
- JSON-safe value contracts,
- revision values,
- diagnostic identity,
- time and version primitives,
- immutable utility contracts.

### 6.2 Canonical authoring layer

Owns persisted authoring meaning:

- project documents,
- scene documents,
- entity and component envelopes,
- asset metadata documents,
- presentation documents,
- text/string-table documents,
- future sequence, UI, animation, audio, and gameplay authoring documents,
- schema versions,
- migration contracts.

### 6.3 Authoring policy layer

Owns how canonical data may be interpreted and changed:

- component definitions,
- validation,
- capability rules,
- typed commands,
- authoring sessions,
- revision and authenticity checks,
- undo/redo integration.

### 6.4 Application layer

Owns product use cases and orchestration:

- create/open/save/close project,
- import asset,
- start/stop PIE,
- run validation,
- submit command,
- schedule job,
- request export,
- recover project,
- coordinate ports and adapters.

### 6.5 Adapter layer

Owns integration with technology and operating-system facilities:

- Electron IPC,
- filesystem,
- file watching,
- local SQLite index,
- Babylon renderer,
- Havok physics,
- Recast navigation,
- glTF transformation,
- compression and archive tools,
- logging and trace sinks,
- packaging and Steam adapters.

### 6.6 Application-shell layer

Owns executable composition and process lifecycle:

- editor Electron app,
- player Electron app,
- optional future command-line or worker entrypoints,
- process startup and shutdown,
- security configuration,
- dependency injection/composition roots.

Dependency direction must normally point inward:

```text
application shells
→ adapters + application layer
→ authoring policy + runtime contracts
→ canonical documents
→ foundation
```

Canonical and foundation layers must not depend outward on application shells or third-party implementation adapters.

---

## 7. Application Boundaries

The reboot baseline has two product applications.

## 7.1 `apps/editor-electron`

**Role:** commercial RetroStage Maker desktop authoring application.

It owns:

- Electron application lifecycle,
- BrowserWindow creation,
- secure Main/Preload/Renderer composition,
- editor-only menus and native dialogs,
- workspace trust prompts,
- application-level project orchestration,
- panel composition,
- Babylon editor viewport hosting,
- development-only Inspector activation when explicitly allowed,
- editor update and packaging entrypoints.

It does not own:

- canonical document definitions,
- stable ID semantics,
- migration logic,
- component validation truth,
- command semantics,
- runtime gameplay semantics,
- asset-source identity,
- cooked-content meaning.

The application may compose packages but must not become the only place where reusable product rules exist.

## 7.2 `apps/player-electron`

**Role:** minimal standalone runtime shell included in exported games during the reboot baseline.

It owns:

- standalone application startup and shutdown,
- minimal runtime window creation,
- loading a cooked runtime manifest,
- approved runtime filesystem/save access,
- runtime logging and error boundary,
- Babylon runtime canvas hosting,
- game identity and window metadata,
- packaged-game lifecycle.

It must not include:

- editor panels,
- Golden Layout,
- authoring Inspector,
- project source documents unless explicitly required by a debug build,
- source assets,
- import tools,
- Playwright or Vitest,
- Babylon Inspector,
- authoring commands not required by runtime systems,
- dependency/license tooling,
- editor-only diagnostics.

## 7.3 Future non-product entrypoints

The following may be introduced only when their milestone proves a need:

```text
tools/project-doctor-cli
tools/cook-worker
tools/asset-worker
tools/recovery-inspector
tools/build-verifier
```

They are not baseline applications and must not be created as empty placeholders.

---

## 8. Electron Process Topology

Both editor and player use strict process separation.

### 8.1 Editor process model

```text
Editor Main process
├─ application lifecycle
├─ project/workspace filesystem authority
├─ native dialogs
├─ job and worker coordination
├─ atomic save and recovery
├─ export/package coordination
├─ logs and secure secrets
└─ IPC handlers

Editor Preload
├─ contextBridge only
├─ narrow typed request API
├─ event subscription API
└─ no generic Electron or Node exposure

Editor Renderer
├─ React workbench
├─ editor UI state
├─ Babylon preview canvas
├─ view models
├─ command intents
└─ no direct filesystem or arbitrary Node access
```

### 8.2 Player process model

```text
Player Main process
├─ runtime application lifecycle
├─ approved runtime-save filesystem access
├─ game metadata/window configuration
├─ runtime logs
├─ crash/error reporting boundary
└─ minimal IPC handlers

Player Preload
├─ narrow runtime API
└─ no editor or project-authoring operations

Player Renderer
├─ runtime session
├─ Babylon runtime projection
├─ player UI
└─ cooked content only
```

### 8.3 IPC rule

Every IPC message must have:

- a stable operation identity,
- a TypeBox-owned schema,
- Ajv runtime validation,
- explicit request and response contracts,
- explicit error taxonomy,
- sender validation,
- path and workspace-scope validation where relevant,
- cancellation or timeout policy for long-running work,
- no arbitrary method invocation.

Forbidden:

```text
window.require(...)
renderer fs access
renderer child_process access
generic ipcRenderer exposure
send-any-channel APIs
unvalidated JSON payloads
absolute-path trust from renderer input
```

---

## 9. Canonical State Authorities

The architecture distinguishes persisted authoring truth, active authoring-session truth, runtime truth, and derived technology state.

| State | Planned authority | Persisted? | Notes |
|---|---|---:|---|
| Project metadata and project-level settings | canonical document package | Yes | RetroStage-owned, versioned |
| Scene/entity/component authoring data | canonical document package | Yes | Stable-ID based |
| Asset source identity and import settings | asset authoring document package | Yes | Source and cooked forms separated |
| Component definitions and policies | component registry | Code/config authority | Does not own component instances |
| Validation findings | validation engine | Recomputed | Persist only when explicitly part of reports |
| Active authoring revision/session authenticity | authoring session | No | Never serialized into project documents |
| Command history | authoring session/history subsystem | Usually local/session | Later durable local history may be separate |
| Editor selection, hover, open panels | editor UI state | Local preference/session | Not project truth |
| Workspace layout | editor preference storage | Local | Not project content |
| Babylon objects | renderer adapter | No | Derived and disposable |
| PIE world | runtime session | No | Derived from authoring snapshot |
| Exported runtime content | export pipeline | Generated | Cooked derivative, reproducible |
| Player runtime save/checkpoint | runtime save subsystem | Yes, separate location | Never project authoring data |
| SQLite index | workspace index adapter | Rebuildable | Never canonical |
| Thumbnails and import caches | asset pipeline cache | Rebuildable | Never only recoverable source |
| Logs and traces | diagnostics subsystem | Local/release policy | Privacy and retention controlled |
| Recovery snapshots/journal | recovery subsystem | Local safety data | Does not silently replace explicit save |

### Authority rule

No adapter may elevate its derived state into canonical truth merely because it is convenient to serialize.

---

## 10. Canonical Document Direction

The planned canonical document family includes:

```text
ProjectDocument
SceneDocument
EntityDocument
ComponentEnvelope
AssetDocument / AssetMetadataDocument
PresentationProfileDocument
ProjectVariablesDocument
StringTableDocument
RuntimeSettingsDocument
```

Later milestones may add:

```text
PrefabDocument
GameplayRecipeDocument
UI/ScreenDocument
AnimationGraphDocument
VfxDocument
AudioCue/MixerDocument
SequenceDocument
FlowGraphDocument
ContentPackManifest
PluginManifest
```

All persisted documents must support:

- explicit schema version,
- stable identity,
- deterministic serialization,
- runtime validation,
- explicit migration,
- typed reference remapping,
- safe unknown-data policy,
- dangerous-key rejection,
- source provenance where external import is involved.

### Document package rule

Document meaning belongs to RetroStage packages, not to:

- Babylon serialization,
- React state,
- XState snapshots,
- Golden Layout state,
- SQLite schemas,
- glTF files,
- Electron preferences,
- third-party timeline formats.

---

## 11. Canonical Mutation and Authoring Sessions

The planned mutation path is:

```text
UI interaction / guided workflow / external approved request
→ typed edit intent
→ application use case
→ canonical command
→ session authenticity and revision check
→ candidate document construction
→ structural and semantic validation
→ atomic accept / reject / no-op result
→ new immutable authoring snapshot
→ diagnostics and renderer projection update
```

### Session authority owns

- active project/scene identity,
- current revision,
- command membership/authenticity,
- accepted immutable snapshots,
- command result classification,
- undo/redo integration,
- stale-intent rejection,
- change events for derived systems.

### Session authority does not persist

The following must not enter project documents:

- active session tokens,
- command object identity,
- runtime-private authority state,
- in-memory revision authenticity objects,
- UI subscriptions,
- renderer handles.

### Mutation prohibitions

The following may not mutate canonical documents directly:

- React components,
- Zustand stores,
- Babylon nodes,
- file watchers,
- SQLite indexes,
- import workers,
- plugins,
- MCP tools,
- AI agents,
- external cinematic tools,
- player runtime systems.

They must request approved operations through the application and command boundaries.

---

## 12. Preview, PIE, and Export Architecture

Preview, PIE, and Export share contracts but not state authority.

### 12.1 Editor Preview

```text
Canonical authoring snapshot
→ preview projection builder
→ Babylon editor scene
→ selection/gizmo/editor overlays
```

Preview may include editor-only helpers that never enter runtime content.

### 12.2 Play-in-Editor

```text
Canonical authoring snapshot
→ runtime compilation/projection
→ disposable RuntimeGameSession
→ runtime systems
→ Babylon runtime scene
→ stop/dispose
```

PIE must not execute against the mutable authoring-session object.

PIE changes are runtime-transient unless a future approved “apply runtime change” workflow explicitly converts them into reviewed commands.

### 12.3 Export

```text
Canonical project snapshot
+ source assets
+ approved settings
→ full validation
→ dependency resolution
→ asset cooking
→ runtime content manifest
→ deterministic output layout
→ player package
→ clean-machine verification
```

Export may not package the editor repository as a game.

### 12.4 Parity boundary

Parity means the same approved product semantics produce compatible results across Preview, PIE, and Export.

It does not require identical implementation objects or process topology.

---

## 13. Planned Repository Topology

The planned high-level repository layout is:

```text
retrostage-maker/
├─ apps/
│  ├─ editor-electron/
│  └─ player-electron/
├─ packages/
│  ├─ core/
│  ├─ documents/
│  ├─ ipc-contracts/
│  ├─ component-registry/
│  ├─ validation/
│  ├─ commands/
│  ├─ authoring-session/
│  ├─ application/
│  ├─ project-storage-node/
│  ├─ runtime-core/
│  ├─ renderer-babylon9/
│  ├─ editor-ui-react/
│  ├─ diagnostics/
│  ├─ asset-pipeline/
│  ├─ export-pipeline/
│  └─ test-fixtures/
├─ tools/
│  └─ created only when milestone evidence requires them
├─ examples/
│  └─ golden projects and sample projects when introduced
├─ docs/
│  ├─ source set
│  ├─ architecture decisions
│  └─ generated notices/reports where appropriate
├─ scripts/
│  └─ narrow repository automation only
├─ package.json
├─ pnpm-workspace.yaml
├─ pnpm-lock.yaml
└─ toolchain/configuration files
```

This is a target topology, not a mandate to create every directory at bootstrap.

### Bootstrap restraint

At RSM-3, only packages required for the active vertical slice should exist.

Deferred package directories must not be created solely to make the repository appear complete.

---

## 14. Package Classification Vocabulary

Each package must be classified by role and environment.

### 14.1 Role classes

- `FOUNDATION`
- `CANONICAL_DOCUMENT`
- `AUTHORING_POLICY`
- `APPLICATION_USE_CASE`
- `RUNTIME`
- `ADAPTER`
- `UI`
- `PIPELINE`
- `DIAGNOSTIC`
- `TEST_ONLY`

### 14.2 Environment classes

- `HEADLESS_ANY`
- `BROWSER_SAFE`
- `NODE_ONLY`
- `ELECTRON_MAIN_ONLY`
- `ELECTRON_RENDERER_ONLY`
- `PLAYER_RUNTIME_SAFE`
- `DEVELOPMENT_ONLY`

A package must document its environment class in its README or package metadata once implemented.

### 14.3 Authority classes

- `CANONICAL_AUTHORITY`
- `POLICY_AUTHORITY`
- `SESSION_AUTHORITY`
- `RUNTIME_AUTHORITY`
- `DERIVED_VIEW`
- `DERIVED_CACHE`
- `ORCHESTRATOR`
- `ADAPTER_ONLY`

A package must not claim more than one primary authority without explicit architecture review.

---

## 15. Initial Package Map

The following package names define the planned early architecture.

## 15.1 `@retrostage/core`

**Role:** minimal shared foundation.

**Class:** `FOUNDATION / HEADLESS_ANY`

**Owns:**

- branded ID primitives,
- revision and version primitives,
- result/error primitives,
- diagnostic identity primitives,
- JSON-safe value contracts,
- narrow immutable utility types.

**May depend on:**

- no RetroStage package,
- minimal approved utility dependencies only when unavoidable.

**Must not depend on:**

- Electron,
- React,
- Babylon,
- Node filesystem,
- documents,
- commands,
- validation.

**Roadmap entry:** RSM-3, RSM-7, RSM-8.

## 15.2 `@retrostage/documents`

**Role:** canonical persisted authoring contracts and schemas.

**Class:** `CANONICAL_DOCUMENT / HEADLESS_ANY / CANONICAL_AUTHORITY`

**Owns:**

- project and scene document schemas,
- entity and component envelopes,
- stable persisted references,
- serialization envelopes,
- schema-version fields,
- migration input/output contracts,
- deterministic document serialization rules,
- later approved document modules.

**May depend on:**

- `@retrostage/core`,
- approved TypeBox package.

**Must not depend on:**

- component registry implementation,
- commands,
- authoring session,
- Electron,
- React,
- Babylon,
- SQLite,
- filesystem.

**Roadmap entry:** RSM-7, RSM-8, expanded throughout later document-owning milestones.

## 15.3 `@retrostage/ipc-contracts`

**Role:** pure typed Main/Preload/Renderer request, response, and event schemas.

**Class:** `FOUNDATION / HEADLESS_ANY / POLICY_AUTHORITY`

**Owns:**

- IPC operation identities,
- request/response schemas,
- error/result envelopes,
- progress and cancellation contracts,
- sender-capability descriptors where applicable.

**May depend on:**

- `@retrostage/core`,
- selected stable schemas from `@retrostage/documents`,
- TypeBox.

**Must not depend on:**

- Electron runtime APIs,
- application implementations,
- React,
- Babylon,
- filesystem adapters.

The actual Electron handler and bridge implementations remain in application/adapters.

**Roadmap entry:** RSM-5, RSM-11, RSM-26.

## 15.4 `@retrostage/component-registry`

**Role:** built-in component definition, metadata, factory, exposure, multiplicity, and policy authority.

**Class:** `AUTHORING_POLICY / HEADLESS_ANY / POLICY_AUTHORITY`

**Owns:**

- component type identity,
- default factory strategy,
- display and category metadata,
- Inspector descriptors or descriptor inputs,
- multiplicity policy,
- type-local constraints,
- relationship-policy metadata,
- supported profile/capability metadata.

**Does not own:**

- component instances,
- scene persistence,
- active editor sessions,
- UI widget state.

**May depend on:**

- `@retrostage/core`,
- `@retrostage/documents`.

**Must not depend on:**

- React,
- Electron,
- Babylon,
- authoring session.

**Roadmap entry:** RSM-12, extended by gameplay and content milestones.

## 15.5 `@retrostage/validation`

**Role:** centralized structural, semantic, capability, reference, Play, and Export validation.

**Class:** `AUTHORING_POLICY / HEADLESS_ANY / POLICY_AUTHORITY`

**Owns:**

- validation issue taxonomy,
- severity and blocker classes,
- document validation composition,
- reference validation,
- capability validation,
- Play and Export gate evaluation,
- repair-guidance contracts when introduced.

**May depend on:**

- `@retrostage/core`,
- `@retrostage/documents`,
- `@retrostage/component-registry`,
- Ajv.

**Must not depend on:**

- React,
- Babylon,
- Electron,
- command execution,
- project-storage implementation.

**Roadmap entry:** RSM-8, RSM-11, RSM-12, RSM-25, RSM-101, RSM-112.

## 15.6 `@retrostage/commands`

**Role:** canonical edit command definitions and pure/controlled command application semantics.

**Class:** `AUTHORING_POLICY / HEADLESS_ANY / POLICY_AUTHORITY`

**Owns:**

- command type identities,
- command payloads,
- command preconditions,
- candidate mutation behavior,
- accepted/rejected/no-op result contracts,
- inverse/history metadata where approved,
- typed reference-remap operations.

**May depend on:**

- `@retrostage/core`,
- `@retrostage/documents`,
- `@retrostage/component-registry`,
- `@retrostage/validation`.

**Must not depend on:**

- React,
- Electron,
- Babylon,
- filesystem,
- authoring application shell.

**Roadmap entry:** RSM-10, RSM-12, RSM-31.

## 15.7 `@retrostage/authoring-session`

**Role:** authoritative in-memory project/scene editing session.

**Class:** `AUTHORING_POLICY / HEADLESS_ANY / SESSION_AUTHORITY`

**Owns:**

- active immutable authoring snapshots,
- revision progression,
- command authenticity and application,
- session identity,
- stale-operation rejection,
- command history integration,
- session-level change notifications.

**May depend on:**

- `@retrostage/core`,
- `@retrostage/documents`,
- `@retrostage/commands`,
- `@retrostage/validation`.

**Must not depend on:**

- React,
- Babylon,
- Electron,
- filesystem implementation.

**Roadmap entry:** RSM-10, RSM-12, RSM-14, RSM-31.

## 15.8 `@retrostage/application`

**Role:** product use cases and ports independent of Electron UI implementation.

**Class:** `APPLICATION_USE_CASE / HEADLESS_ANY / ORCHESTRATOR`

**Owns:**

- project lifecycle use cases,
- scene lifecycle use cases,
- command dispatch use cases,
- Preview/PIE/export orchestration contracts,
- job orchestration interfaces,
- storage/index/renderer ports,
- application-level result and progress semantics.

**May depend on:**

- domain, policy, session, runtime, and diagnostic packages,
- port interfaces.

**Must not depend directly on:**

- Electron,
- React,
- Babylon implementation,
- better-sqlite3,
- raw filesystem APIs.

Concrete adapters are injected by the application composition root.

**Roadmap entry:** RSM-5 through RSM-18, expanded across all application-level milestones.

## 15.9 `@retrostage/project-storage-node`

**Role:** Node-side workspace, project-file, atomic-save, archive, and recovery adapter.

**Class:** `ADAPTER / NODE_ONLY / ADAPTER_ONLY`

**Owns:**

- path normalization and scope checks,
- reading/writing canonical files,
- atomic write implementation,
- temporary and backup files,
- autosave/recovery storage,
- archive integration,
- file watching integration,
- storage diagnostics.

**May depend on:**

- `@retrostage/core`,
- `@retrostage/documents`,
- `@retrostage/validation`,
- `@retrostage/diagnostics`,
- Node APIs,
- Chokidar,
- fflate.

**Must not depend on:**

- React,
- Babylon,
- editor UI,
- command semantics beyond approved application ports.

**Roadmap entry:** RSM-14, RSM-15, RSM-26, RSM-29, RSM-32.

## 15.10 `@retrostage/runtime-core`

**Role:** headless runtime session, clock, scheduler, system registry, runtime entity lifecycle, and runtime event contracts.

**Class:** `RUNTIME / HEADLESS_ANY / RUNTIME_AUTHORITY`

**Owns:**

- `RuntimeGameSession`,
- runtime clock and pause policy,
- runtime system registration and dispatch,
- transient runtime entities/components,
- runtime events and actions,
- runtime lifecycle and disposal,
- approved serializable runtime-state registry contracts.

**May depend on:**

- `@retrostage/core`,
- approved runtime-safe document contracts.

**Must not depend on:**

- Electron,
- React,
- Babylon implementation,
- editor commands,
- authoring session,
- project storage.

**Roadmap entry:** RSM-16, RSM-23, RSM-24, then gameplay/runtime milestones.

## 15.11 `@retrostage/renderer-babylon9`

**Role:** sole Babylon.js 9 rendering and runtime-projection adapter.

**Class:** `ADAPTER / BROWSER_SAFE / PLAYER_RUNTIME_SAFE / DERIVED_VIEW`

**Owns:**

- Babylon engine and scene lifecycle,
- Preview and runtime scene projections,
- object-to-stable-ID lookup maps,
- selection/picking/gizmo adapters,
- camera/light/material/texture projection,
- renderer resource lifetime,
- Frame Graph and presentation implementation,
- development-only Babylon diagnostics adapters.

**May depend on:**

- `@retrostage/core`,
- selected canonical document contracts,
- `@retrostage/runtime-core`,
- `@retrostage/diagnostics`,
- approved Babylon packages.

**Must not depend on:**

- authoring session mutation internals,
- project storage,
- Electron Main,
- React components,
- SQLite,
- commands as mutation authority.

**Roadmap entry:** RSM-6, RSM-13, RSM-16–18, then rendering/presentation/content/export milestones.

## 15.12 `@retrostage/editor-ui-react`

**Role:** reusable RetroStage-branded editor workbench and panels.

**Class:** `UI / ELECTRON_RENDERER_ONLY / DERIVED_VIEW`

**Owns:**

- design tokens and editor components,
- workbench layout composition,
- Hierarchy, Inspector, Problems, Content Browser, Project Doctor, and future graph/timeline surfaces,
- view models and UI intents,
- panel-local state,
- accessibility and keyboard behavior,
- Golden Layout adapter,
- Radix primitives composition,
- list virtualization.

**May depend on:**

- `@retrostage/core`,
- public document/view contracts,
- component descriptors,
- validation diagnostics,
- command intent types,
- React/Radix/Golden Layout/react-window/Zustand/XState as approved.

**Must not depend on:**

- filesystem,
- Electron Main APIs,
- project-storage implementation,
- Babylon internals outside a narrow viewport host adapter,
- canonical mutable documents.

**Roadmap entry:** RSM-9, RSM-10, RSM-25, RSM-35, then creator-facing milestones.

## 15.13 `@retrostage/diagnostics`

**Role:** shared structured diagnostic, logging, correlation, event-trace, and report contracts.

**Class:** `DIAGNOSTIC / HEADLESS_ANY`

**Owns:**

- diagnostic event taxonomy,
- correlation IDs,
- structured log contracts,
- operation duration/result contracts,
- local sink interfaces,
- privacy classification metadata,
- future Project Doctor/report adapters.

**May depend on:**

- `@retrostage/core`.

The headless diagnostic-contract package must not import Pino directly. Concrete Pino sinks belong in the application shell or a future Node-only diagnostic adapter if reuse proves the split.

**Must not become:**

- a second validation authority,
- canonical project storage,
- an automatic hosted telemetry client before RSM-115 approval.

**Roadmap entry:** RSM-3 onward; expanded RSM-82, RSM-98, RSM-112–115.

## 15.14 `@retrostage/asset-pipeline`

**Role:** milestone-gated asset inspection, import, normalization, cooking, and reimport pipeline.

**Class:** `PIPELINE / NODE_ONLY / ADAPTER_ONLY`

**Creation gate:** no earlier than the asset-pipeline readiness work leading to RSM-73–75, except a deliberately minimal RSM-18 cooking proof.

**Owns when implemented:**

- import job orchestration,
- source inspection,
- glTF-Transform adapters,
- meshoptimizer adapters,
- import reports,
- source/cooked mapping,
- deterministic derivative generation,
- reimport and cache invalidation support.

**Does not own:**

- asset stable identity,
- canonical import settings meaning,
- license truth,
- Content Browser UX,
- runtime resource lifetime.

## 15.15 `@retrostage/export-pipeline`

**Role:** validation, cooking, content manifest, deterministic layout, packaging input, and artifact-report orchestration.

**Class:** `PIPELINE / NODE_ONLY / ORCHESTRATOR`

**Creation gate:** minimal form at RSM-18; expanded RSM-92–103.

**Owns:**

- export plan construction,
- full project validation invocation,
- dependency graph resolution,
- cooked-content manifest generation,
- deterministic output layout,
- editor-only/source exclusion,
- build report inputs,
- player package assembly orchestration.

**Must not own:**

- canonical project meaning,
- arbitrary filesystem writes outside approved output scope,
- installer or Steam credentials,
- gameplay runtime semantics.

## 15.16 `@retrostage/test-fixtures`

**Role:** development-only builders, canonical fixtures, golden-project helpers, fake ports, and deterministic test inputs.

**Class:** `TEST_ONLY / DEVELOPMENT_ONLY`

**Owns:**

- test document builders,
- mock/fake storage and renderer ports,
- migration fixtures,
- command/session fixtures,
- deterministic runtime fixtures,
- later golden-project helpers.

It must never enter editor or player production bundles.

**Roadmap entry:** RSM-3, RSM-17, RSM-30, RSM-112–113.

---

## 16. Initial Physical-Creation Sequence

The package map does not require all packages to exist at once.

### RSM-3 bootstrap minimum

Likely minimum:

```text
workspace/root tooling
@retrostage/core
@retrostage/diagnostics
@retrostage/test-fixtures
```

RSM-3 may reserve the top-level `apps/` and `packages/` workspace roots, but it must not claim an Electron application before RSM-5 or a player application before the RSM-18 export work creates and proves them.

### RSM-5–11 secure-shell and document foundation

Introduce only as needed:

```text
apps/editor-electron
@retrostage/documents
@retrostage/ipc-contracts
@retrostage/application
@retrostage/project-storage-node
@retrostage/editor-ui-react
@retrostage/renderer-babylon9
```

### RSM-10–17 authoring and runtime authority

Introduce:

```text
@retrostage/component-registry
@retrostage/validation
@retrostage/commands
@retrostage/authoring-session
@retrostage/runtime-core
```

### RSM-18 early export proof

Introduce a minimal:

```text
@retrostage/export-pipeline
```

A separate full asset-pipeline package should not be created merely because glTF dependencies are approved. It should be created when the first real import/cooking ownership boundary is implemented.

---

## 17. Package Dependency Direction

The planned dependency graph is:

```text
core
├─ documents
│  ├─ component-registry
│  ├─ validation
│  │  └─ commands
│  │     └─ authoring-session
│  └─ ipc-contracts
├─ diagnostics
└─ runtime-core

application
├─ documents
├─ validation
├─ commands
├─ authoring-session
├─ runtime-core
├─ diagnostics
└─ ports only

project-storage-node
├─ documents
├─ validation
├─ diagnostics
└─ Node/file/archive/watch adapters

renderer-babylon9
├─ documents/runtime contracts
├─ runtime-core
├─ diagnostics
└─ Babylon.js

editor-ui-react
├─ documents/view contracts
├─ component metadata
├─ diagnostics/validation outputs
├─ command intent types
└─ React UI dependencies

asset-pipeline
├─ asset documents/contracts
├─ application job ports
├─ diagnostics
└─ approved import/optimization adapters

export-pipeline
├─ documents
├─ validation
├─ asset-pipeline
├─ runtime content contracts
├─ diagnostics
└─ packaging ports

apps
└─ compose application + adapters + UI/runtime packages

test-fixtures (development only)
└─ may depend on the public test-relevant surfaces of packages under test; production packages must never depend on it
```

The exact graph must be enforced by architecture tests once manifests exist.

---

## 18. Forbidden Dependency Directions

The following directions are forbidden unless this architecture map is explicitly changed.

```text
package → apps/*
core → any higher package
documents → Electron / React / Babylon / Node filesystem
documents → component registry implementation
documents → commands or authoring session
component-registry → editor UI
validation → React / Babylon / Electron
commands → React / Babylon / Electron / filesystem
authoring-session → React / Babylon / Electron / filesystem
runtime-core → editor UI / authoring session / renderer implementation
renderer-babylon9 → project storage / authoring mutation internals
editor-ui-react → Node filesystem / Electron Main / project-storage implementation
project-storage-node → renderer or UI
asset-pipeline → editor UI
SQLite index adapter → canonical mutation
file watcher → canonical mutation
player app → editor-only packages
plugin/MCP/agent adapter → private package internals
```

### No circular authority

A cycle between packages that each claim authority is a design failure, not a bundler inconvenience.

Circular dependencies must fail CI once architecture enforcement exists.

---

## 19. Public Entrypoint Policy

Every implemented package must expose an intentional public API.

Allowed:

```text
import { ... } from "@retrostage/documents";
import { ... } from "@retrostage/validation";
```

Forbidden:

```text
import { ... } from "@retrostage/documents/src/internal/...";
import { ... } from "../../packages/validation/src/...";
```

Package `exports` maps must:

- expose only approved surfaces,
- distinguish production and test-only entrypoints,
- avoid accidental internals,
- remain compatible with browser/Node environment constraints,
- prevent application code from depending on private authority representations.

A public type is a compatibility promise. Public API growth must be deliberate.

---

## 20. Environment Compatibility Rules

| Package | Browser safe | Node safe | Player safe | Electron-specific |
|---|---:|---:|---:|---:|
| core | Yes | Yes | Yes | No |
| documents | Yes | Yes | Yes where needed | No |
| ipc-contracts | Yes | Yes | Yes where used | No runtime import required |
| component-registry | Yes | Yes | Selected runtime metadata only | No |
| validation | Yes/headless | Yes | Selected validators | No |
| commands | Yes/headless | Yes | Normally editor only | No |
| authoring-session | Yes/headless | Yes | No | No |
| application | Depends on adapter-free module | Yes | Selected runtime use cases | No |
| project-storage-node | No | Yes | Player-save subset may be separate later | No direct Electron requirement |
| runtime-core | Yes/headless | Yes | Yes | No |
| renderer-babylon9 | Browser/WebGPU/WebGL | Build-time only under tests | Yes | No direct Electron Main dependency |
| editor-ui-react | Browser renderer | Build-time | No | Electron Renderer composition |
| diagnostics | Yes with browser sink | Yes | Yes | No |
| asset-pipeline | No | Yes | No | No direct UI dependency |
| export-pipeline | No | Yes | No | Invoked from editor Main/application |
| test-fixtures | Test only | Test only | Never bundled | No |

Environment-specific adapters should be separated rather than hidden behind runtime `if` checks inside canonical packages.

---

## 21. Babylon.js Adapter Boundary

Babylon.js 9 is the sole approved renderer/runtime adapter, but it is not the product domain.

### Babylon adapter responsibilities

- initialize Engine/WebGPUEngine according to approved compatibility policy,
- own Babylon Scene lifecycle,
- project RetroStage transforms and renderable components,
- load approved cooked assets,
- manage Babylon resource creation and disposal,
- map stable RetroStage IDs to transient Babylon objects,
- implement camera, lighting, fog, materials, animation, particles, and presentation adapters,
- expose renderer diagnostics through RetroStage contracts,
- support Preview, PIE, and player runtime modes without sharing forbidden state.

### Babylon adapter prohibitions

It may not:

- serialize canonical projects using Babylon scene serialization,
- generate persistent entity IDs,
- mutate `SceneDocument`,
- own component validation,
- determine gameplay capabilities from a rendered object,
- store canonical references as object identity,
- make Babylon Inspector a shipping product surface,
- expose Babylon objects as public cross-package state.

### Stable mapping

Renderer mapping must be explicit:

```text
RetroStage EntityId / ComponentId / AssetId
↔ adapter-owned transient Babylon handles
```

When the adapter is disposed, canonical identity remains unaffected.

---

## 22. React Editor Architecture

The editor workbench is React-based and RetroStage-branded.

### UI composition

```text
App shell
├─ workspace mode
├─ menu/command surfaces
├─ panel registry
├─ Golden Layout adapter
├─ Hierarchy
├─ Inspector
├─ Viewport host
├─ Content Browser
├─ Problems / Project Doctor
├─ jobs/progress
├─ settings
└─ future graph/timeline/debug panels
```

### UI state classes

**Transient UI state — Zustand:**

- selection presentation,
- hover,
- panel visibility,
- filters,
- local viewport preferences,
- active tab/tool display.

**Workflow state — XState:**

- project open/close,
- save transaction,
- import job,
- PIE lifecycle,
- export lifecycle,
- recovery workflow,
- editor mode state machine where useful.

**Canonical authoring state — not Zustand/XState:**

- project documents,
- scene documents,
- components,
- stable references,
- persisted gameplay and presentation data.

### Inspector direction

The Inspector consumes:

- selected stable identity,
- component registry metadata,
- current immutable document snapshot,
- validation findings.

It emits typed edit intents. It does not edit object properties in place.

### Viewport direction

The React viewport host owns DOM/canvas placement only. Babylon scene ownership stays inside the renderer adapter.

---

## 23. Application Ports and Adapters

The `@retrostage/application` layer should define ports for external effects.

Planned port families include:

```text
ProjectStoragePort
WorkspaceTrustPort
FileObservationPort
RecoveryStoragePort
RendererPreviewPort
RuntimeSessionPort
AssetImportPort
WorkspaceIndexPort
ExportPipelinePort
DialogPort
ClockPort
LoggingPort
JobExecutorPort
```

Concrete adapters are supplied at the application composition root.

Benefits:

- domain/use-case tests do not require Electron,
- Electron can be replaced or isolated without rewriting project semantics,
- player and editor can reuse runtime contracts without reusing editor UI,
- fake ports support deterministic tests,
- security checks remain visible at adapter boundaries.

Do not create abstract interfaces without an actual use case. Port creation is subject to the same evidence rule as package creation.

---

## 24. Storage and Workspace Architecture

The workspace is a directory-based, diffable, recoverable project structure.

### Planned logical layout

```text
<ProjectRoot>/
├─ project.rsmproject
├─ scenes/
├─ assets/
│  ├─ source/
│  └─ metadata/
├─ presentation/
├─ gameplay/
├─ ui/
├─ audio/
├─ sequences/
├─ generated/
│  └─ reproducible cooked/cache outputs
└─ .retrostage-local/
   ├─ autosave/
   ├─ recovery/
   ├─ index.sqlite
   ├─ thumbnails/
   └─ editor preferences / local state
```

Exact folders are established by RSM-29 and later content milestones.

### Storage rules

- canonical source files are human-inspectable where practical,
- generated derivatives are not the only recoverable source,
- local index/cache can be deleted and rebuilt,
- explicit save uses atomic transactions,
- autosave never silently replaces the user’s explicit project state,
- workspace paths are scope-checked,
- external changes enter reviewable reload flow,
- runtime saves live outside authoring content or in an explicitly separate runtime-save area.

### File observation

Chokidar events are observations, not commands.

```text
filesystem event
→ debounce/coalesce
→ source identity resolution
→ content/hash inspection
→ change classification
→ user review or approved reimport use case
→ canonical command/transaction if needed
```

---

## 25. Local Index Architecture

The local index enters at RSM-33/RSM-74 and is expected to use `better-sqlite3` after its native-binary gate.

It may index:

- asset metadata,
- source hashes,
- reference relationships,
- thumbnails,
- import history,
- search tokens,
- validation summaries,
- recent project-local queries.

It may not become the only owner of:

- project metadata,
- scene data,
- stable asset identity,
- source paths,
- import settings,
- licenses.

Required property:

```text
delete index.sqlite
→ reopen project
→ rebuild index from canonical files and source assets
→ no project-content loss
```

---

## 26. Runtime Architecture

The runtime is a RetroStage-owned gameplay execution layer using Babylon for presentation.

### Runtime composition

```text
RuntimeGameSession
├─ runtime clock
├─ system registry
├─ runtime entity lifecycle
├─ event/action dispatch
├─ input contexts
├─ scene flow
├─ camera
├─ interaction
├─ objectives/inventory
├─ AI/perception/combat when enabled
├─ animation/VFX/audio/UI adapters
├─ save-state registry
└─ diagnostics
```

### Runtime system rule

Each system must:

- register with the runtime session,
- obey the central clock and pause policy,
- declare dependencies/capabilities,
- dispose deterministically,
- avoid private uncontrolled loops,
- expose creator-facing diagnostics where relevant,
- separate transient state from approved serializable state.

### Runtime package growth

The runtime should begin as one coherent `runtime-core` package.

Feature packages may split only when:

- browser/player bundle boundaries justify it,
- ownership is independently stable,
- tests and public APIs are clear,
- package cycles are avoided,
- the split reduces coupling rather than merely increasing directory count.

---

## 27. Physics and Navigation Architecture

### Physics

Havok is milestone-gated and accessed through a RetroStage physics adapter.

Planned responsibilities:

```text
RetroStage collision/query contracts
→ Havok adapter
→ shapes, raycasts, overlaps, grounding, kinematic/rigid behavior
```

RetroStage owns:

- collision channels,
- trigger/query semantics,
- component schemas,
- authoring UX,
- gameplay rules,
- persistence policy,
- diagnostics.

Havok owns low-level simulation only.

### Navigation

Recast/Detour is milestone-gated and accessed through a navigation adapter.

RetroStage owns:

- navigation settings documents,
- agent profiles,
- bake inclusion policy,
- patrol-path authoring,
- off-mesh link semantics,
- validation,
- runtime integration,
- debug views.

---

## 28. Asset Architecture

Asset architecture separates identity, source, import settings, cooked derivatives, and runtime resources.

```text
AssetId
├─ source identity/path
├─ semantic role
├─ import settings
├─ license/provenance metadata
├─ source hash
├─ derived artifact manifest
└─ runtime resource references
```

### Authorities

| Concern | Authority |
|---|---|
| Asset stable identity | canonical asset document |
| Source file observation | storage/file-watch adapter |
| Import semantics | RetroStage asset contracts |
| glTF manipulation | glTF-Transform adapter |
| Mesh optimization | meshoptimizer adapter |
| Texture/audio codec tools | conditional adapters after audit |
| Cooked derivative generation | asset pipeline |
| Runtime loading/lifetime | runtime resource manager |
| Search and thumbnails | derived local index/cache |
| Placement UX | editor UI/application use case |
| License visibility | asset metadata + Project Doctor |

### Import transaction

```text
source selected
→ workspace/path/license checks
→ inspect
→ propose import settings
→ import job
→ generate deterministic derivatives
→ validate
→ commit AssetDocument/metadata through approved transaction
→ update derived index and thumbnails
```

A failed import must not leave partially authoritative project state.

---

## 29. Export and Packaging Architecture

Export is a pipeline, not a file-copy command.

### Export stages

```text
1. Capture immutable project snapshot
2. Run full Project Doctor/export validation
3. Resolve scene/asset/runtime dependencies
4. Cook source assets and project documents
5. Generate runtime content manifest
6. Strip editor-only and unused content
7. Assemble deterministic runtime layout
8. Build/package player shell
9. Generate artifact report, notices, SBOM, and inventories
10. Run smoke/clean-machine verification
```

### Output authority

Exported artifacts are generated products. They do not replace canonical project sources.

### Editor/player dependency rule

The player build graph must be separately inspectable and must fail if editor-only packages or development dependencies enter the production bundle.

---

## 30. Diagnostics Architecture

Diagnostics have four related but distinct sources.

### 30.1 Validation findings

Deterministic project/content problems:

- missing references,
- invalid component relationships,
- unsupported profile combinations,
- Play blockers,
- Export blockers.

Authority: validation package.

### 30.2 Operational logs

Execution events:

- project open/save,
- import jobs,
- runtime startup/shutdown,
- export steps,
- recoveries and failures.

Authority: diagnostic taxonomy; Pino is an output adapter.

### 30.3 Runtime trace/debug state

Live execution information:

- runtime entities,
- events/actions,
- AI states,
- camera state,
- audio/VFX/animation state.

Authority: runtime systems surfaced through approved diagnostic contracts.

### 30.4 Project Doctor and repair guidance

Creator-facing synthesis of validation, integrity, compatibility, license, performance, and export findings.

Authority: RSM-101/RSM-112 application feature; not the logging library.

---

## 31. Testing and Architecture Enforcement

### 31.1 Unit and contract tests

Vitest covers:

- schemas,
- migrations,
- stable IDs,
- reference remapping,
- component definitions,
- validation,
- commands,
- authoring sessions,
- runtime systems,
- pipeline planning.

### 31.2 Electron integration and E2E

Playwright covers:

- secure shell startup,
- project create/open/save/reopen,
- panel interactions,
- Inspector command path,
- Preview/PIE lifecycle,
- import/export workflows,
- recovery scenarios,
- packaged application smoke tests where supported.

### 31.3 Architecture tests

`dependency-cruiser`, ESLint restrictions, package exports, and custom tests enforce:

- no package-to-app dependency,
- no deep imports,
- no forbidden environment dependencies,
- no renderer-to-canonical mutation path,
- no editor package in player bundle,
- no cycles,
- no unapproved third-party import location.

### 31.4 Bundle and artifact tests

Release tests verify:

- editor/player separation,
- source-asset exclusion,
- development-dependency exclusion,
- license file inclusion,
- SBOM consistency,
- native/WASM inventory,
- deterministic layout expectations,
- clean-machine startup.

---

## 32. Third-Party Dependency Placement

Third-party imports must be concentrated in their owning adapter/UI/tooling package.

| Third-party component | Approved primary location | Prohibited authority |
|---|---|---|
| Electron | `apps/editor-electron`, `apps/player-electron` | documents, gameplay, validation |
| Babylon.js 9 | `renderer-babylon9` | canonical scene/project truth |
| React/React DOM | `editor-ui-react`, app renderer composition | persistence and mutation authority |
| Radix UI | `editor-ui-react` | product design language authority |
| Golden Layout | editor workbench adapter | canonical project/workspace content |
| react-window | list views | data ownership |
| Zustand | editor transient state | canonical documents |
| XState | workflows/application state machines | canonical documents |
| TypeBox | documents/ipc contracts | migration policy by itself |
| Ajv | validation/IPC boundaries | semantic capability truth by itself |
| Chokidar | storage/file observation adapter | direct mutation |
| fflate | archive/recovery adapter | project working format authority |
| Pino | diagnostic sink adapter | validation authority |
| glTF-Transform | asset pipeline adapter | asset identity/import policy |
| meshoptimizer | asset pipeline adapter | quality and LOD product policy |
| Havok | physics adapter | gameplay semantics |
| Recast/Detour | navigation adapter | navigation authoring semantics |
| better-sqlite3 | local index adapter | canonical storage |
| React Flow | future graph UI adapter | graph runtime semantics |
| Monaco | future text surface | scripting/product language authority |
| Electron Forge | build/package adapter | export semantics and release approval |
| CycloneDX tools | build/compliance tooling | license approval authority |

### Import-location rule

A package outside the approved owner must not import a third-party implementation merely for convenience.

Example:

```text
validation importing Babylon types = forbidden
commands importing Electron = forbidden
editor panel importing Node fs = forbidden
runtime-core importing React = forbidden
```

---

## 33. Milestone-Gated Architecture Growth

The following are package families, not guaranteed final package names.

### Gate C — Controlled Authoring Foundation

Potential growth:

- workspace-index adapter,
- command-history module,
- change-review module,
- input/editor-mode contracts.

Do not split unless boundaries become independently stable.

### Gate D — First Playable Creator

Potential runtime/authoring modules:

- event-action registry,
- scene-flow,
- camera,
- presentation,
- audio foundation,
- interaction,
- narrative text,
- objectives/inventory.

These may begin as modules inside runtime/application packages.

### Gate E — Genre-Capable Gameplay Creator

Potential modules:

- level tools,
- prefabs/variants,
- navigation,
- AI/perception/combat,
- runtime save/profile,
- recipes and gameplay diagnostics.

### Gate F — Production Content Creator

Potential packages or modules:

- asset documents/registry,
- Content Browser services,
- asset pipeline,
- resource manager,
- material/LookDev,
- animation,
- VFX,
- player UI,
- audio runtime.

### Gate G — Standalone Build Product

Potential packages or tools:

- export pipeline expansion,
- runtime content contracts,
- artifact reporting,
- Project Doctor,
- packaging adapters,
- clean-machine verifier.

### Gate H — No-Code Narrative Production

Potential modules:

- `flow-graph-core`,
- `flow-graph-runtime`,
- `flow-graph-editor`,
- `sequence-core`,
- `sequence-runtime`,
- `sequence-editor`,
- `sequence-interchange`,
- content-pack contracts.

The named historical companion-product bridge is not part of this architecture. External cinematic interchange is generic and optional.

### Gate I — Reliable Public Alpha Product

Potential packages/adapters:

- compatibility/migration tooling,
- plugin SDK contracts,
- permission/capability system,
- MCP/agent adapters,
- recovery bundle tooling,
- telemetry/crash-report adapters,
- installer/Steam distribution adapters.

---

## 34. Package Creation Rule

A new package may be created only when at least one of the following is true:

1. it owns a distinct canonical or policy authority,
2. it requires a different execution environment,
3. it must be shared by editor and player without pulling application-only code,
4. it isolates a third-party adapter with meaningful replacement/security value,
5. it requires independent build or testing boundaries,
6. it prevents a proven dependency cycle,
7. it has a stable public API used by more than one consumer.

A new package must not be created merely because:

- a roadmap milestone exists,
- a directory name looks organized,
- a coding agent prefers smaller files,
- a future feature might need it,
- an empty package makes the architecture appear mature.

Before package creation, record:

- proposed authority,
- environment class,
- dependencies,
- public consumers,
- prohibited dependencies,
- migration from current ownership,
- tests,
- milestone owner.

---

## 35. Package Split, Merge, and Removal Rules

### Split when

- two responsibilities require different environments,
- editor/player bundle isolation requires it,
- a third-party adapter must be isolated,
- public API and authority are stable,
- measured build/test performance benefits justify it,
- the current package creates dependency-direction violations.

### Do not split when

- modules are small and tightly cohesive,
- APIs are still changing every task,
- the split would create mutual dependencies,
- ownership cannot be explained independently,
- no second consumer exists,
- only directory aesthetics improve.

### Merge when

- two packages have the same authority and environment,
- public APIs are artificial pass-throughs,
- they always change together,
- the split creates cycles or excessive orchestration.

### Remove when

- responsibility is obsolete,
- a dependency is replaced,
- the package never developed real authority,
- its content can move without violating boundaries.

Removal requires dependency, migration, build, license, and artifact review.

---

## 36. State Ownership Matrix

| Concern | Authority | Consumers | Forbidden owner |
|---|---|---|---|
| Stable IDs | core/documents | all domain systems | Babylon object identity |
| Project document | documents + authoring session | application, validation, export | React/Zustand |
| Scene document | documents + authoring session | editor, renderer projection, runtime compilation | Babylon Scene |
| Component definitions | component registry | Inspector, validation, runtime capability | scene instances |
| Validation truth | validation | Problems, Project Doctor, Play/Export gates | UI components |
| Command semantics | commands | authoring session/application | buttons or file watchers |
| Active authoring revision | authoring session | editor/application | persistence |
| Editor selection | editor UI state | panels/viewport | project document unless explicitly selected default is a feature |
| Workspace filesystem | project-storage adapter under application authority | editor Main | renderer process |
| Preview objects | renderer adapter | viewport | canonical documents |
| Runtime session | runtime-core | PIE/player | authoring session |
| Runtime save state | runtime-save subsystem | player/profile UI | project save |
| Asset source identity | asset documents | import/index/export | glTF object identity |
| Cooked derivatives | asset/export pipeline | player/runtime | source authority |
| Local search index | SQLite adapter | Content Browser/search | canonical project files |
| Layout preferences | local editor preferences | editor UI | shared project content by default |
| Logs/traces | diagnostics | support/Project Doctor | validation truth |
| Package/license inventory | build/compliance process | release gate | package metadata alone |

---

## 37. Data Flow Reference

### 37.1 Project open

```text
Editor Renderer request
→ typed Preload API
→ Main IPC handler
→ application.openProject
→ workspace trust/path checks
→ project-storage-node read
→ parse/schema version
→ migration
→ Ajv validation
→ authoring session creation
→ derived index/preview initialization
→ UI receives view state and diagnostics
```

### 37.2 Inspector edit

```text
Inspector field change
→ typed edit intent
→ application.submitCommand
→ command/session revision check
→ candidate document
→ validation
→ atomic result
→ immutable snapshot update
→ Problems update
→ Babylon projection update
→ dirty-state update
```

### 37.3 Save

```text
save request
→ capture accepted immutable snapshot
→ deterministic serialization
→ validate save candidate
→ write temporary files
→ fsync/close as required
→ atomic replace
→ backup/journal update
→ persisted revision acknowledgement
→ dirty-state recalculation
```

### 37.4 PIE start

```text
start PIE request
→ capability/Play validation
→ snapshot capture
→ runtime compilation
→ disposable RuntimeGameSession
→ runtime systems registration
→ Babylon runtime projection
→ run under central clock
```

### 37.5 Asset import

```text
source selection
→ trust/path/license checks
→ async import job
→ inspect/transform/optimize
→ validate outputs
→ approved asset transaction
→ canonical metadata update
→ derived index/thumbnail update
→ renderer resource refresh
```

### 37.6 Export

```text
export request
→ immutable snapshot
→ Project Doctor/export blockers
→ dependency graph
→ cook
→ content manifest
→ player assembly
→ notices/SBOM/inventories
→ package report
→ clean-machine smoke
```

---

## 38. Security and Trust Boundaries

Architecture must enforce:

- context isolation,
- renderer sandboxing where supported,
- Node integration disabled in renderer,
- narrow Preload API,
- runtime validation of IPC payloads,
- sender and window validation,
- workspace-root path confinement,
- protection against path traversal and symlink escape,
- explicit trust for opened projects and imported content,
- restricted child process execution,
- no automatic execution of project content,
- no secret exposure to Renderer or logs,
- safe handling of native/WASM dependencies,
- plugin/agent permissions only after their owning milestones.

Canonical JSON-like data is data, not executable code.

Unknown executable payloads fail closed.

---

## 39. Licensing and Supply-Chain Architecture

Package architecture must make compliance observable.

Each package manifest must support:

- exact versions,
- lockfile resolution,
- dependency classification,
- license inventory,
- native/WASM inventory where applicable,
- production/development separation,
- owner and roadmap purpose.

Release composition must produce or verify:

```text
THIRD_PARTY_NOTICES.html
bom.cdx.json or approved equivalent
software dependency inventory
native binary inventory
WebAssembly inventory
packaged file manifest
source/cooked asset license report where applicable
```

Third-party code may not be copied into RetroStage packages without provenance and license review.

A permissive library license does not automatically approve:

- its optional native binaries,
- external encoders,
- codecs,
- templates/assets,
- trademarks,
- hosted services.

---

## 40. Architecture Risks and Required Guards

### 40.1 Package explosion

**Risk:** creating many placeholder packages before boundaries stabilize.

**Guard:** package creation rule and no-empty-placeholder policy.

### 40.2 Canonical drift into Babylon

**Risk:** Babylon objects become easier to mutate and serialize than RetroStage documents.

**Guard:** one-way projection, stable-ID maps, architecture tests, no Babylon types in canonical packages.

### 40.3 UI becomes state authority

**Risk:** React/Zustand state silently becomes the real project model.

**Guard:** immutable session snapshots and typed commands.

### 40.4 Electron boundary erosion

**Risk:** renderer code receives direct Node/filesystem power.

**Guard:** strict IPC contracts, Preload allowlist, security tests.

### 40.5 Player contamination

**Risk:** exported games include editor packages, tools, source assets, or excessive dependencies.

**Guard:** separate app, separate entry graph, bundle inspection, clean-machine tests.

### 40.6 Multiple validation systems

**Risk:** UI, runtime, and export invent different truths.

**Guard:** central validation authority with context-specific gate evaluation.

### 40.7 Asset pipeline owns identity

**Risk:** imported glTF paths or cache rows become stable identity.

**Guard:** canonical AssetId and source/cooked separation.

### 40.8 SQLite becomes project truth

**Risk:** project becomes unrecoverable without local database.

**Guard:** rebuild test and canonical file ownership.

### 40.9 Runtime private loops

**Risk:** AI, animation, audio, or graph systems create uncontrolled update loops.

**Guard:** central RuntimeGameSession clock/system registry.

### 40.10 Third-party leakage

**Risk:** third-party types cross public boundaries and lock the product model.

**Guard:** adapter-owned translation and public API review.

### 40.11 Premature extensibility

**Risk:** plugin/MCP abstractions destabilize core authorities.

**Guard:** defer to RSM-117/RSM-118 and reuse commands/permissions.

### 40.12 Fictional integration assumptions

**Risk:** architecture contains a bridge to a product or service that does not exist.

**Guard:** no named companion-product package; RSM-107 is generic cinematic interchange only.

---

## 41. Architecture Review Checklist

Before closing an architecture-sensitive task, verify:

### Authority

- What state or policy does the changed package own?
- Is another package already the authority?
- Is canonical versus derived state explicit?

### Dependencies

- Are dependencies pointing inward?
- Has any app/package reverse dependency appeared?
- Are deep imports absent?
- Is the package environment compatible?

### Technology boundaries

- Are Babylon types confined to the renderer adapter?
- Are Electron APIs confined to application shells/adapters?
- Are React types confined to UI surfaces?
- Are Node APIs absent from browser-safe packages?

### Data safety

- Is mutation routed through commands/session?
- Are schema/migration/reference rules preserved?
- Can generated caches be rebuilt?
- Is recovery behavior explicit?

### Runtime/export

- Is Preview/PIE/Export separation preserved?
- Does player remain free of editor-only code?
- Are lifecycle and disposal deterministic?

### Commercial readiness

- Did dependency or binary inventory change?
- Are notices/SBOM implications known?
- Did the packaged artifact change?

### Evidence

- Do tests prove the boundary?
- Do manifests and public exports match the claim?
- Is the repository clean and committed according to workflow rules?

---

## 42. Architecture Change Control

A proposed architecture change must identify:

1. the current boundary being changed,
2. the package/application authority affected,
3. the reason the current model is insufficient,
4. repository or prototype evidence,
5. new dependency direction,
6. canonical and runtime state impact,
7. migration impact,
8. editor/player impact,
9. security impact,
10. license and supply-chain impact,
11. test and validation changes,
12. roadmap and decision-source changes,
13. rollback or replacement strategy.

The following require charter- or technology-level review, not merely package-map edits:

- adding a second engine or renderer,
- replacing Electron or Babylon as the approved baseline,
- changing canonical project authority,
- allowing direct filesystem access from Renderer,
- combining editor and player into one uncontrolled product bundle,
- introducing a restrictive dependency outside approved policy.

---

## 43. Update Policy

Update this source when:

- an application is added, removed, or changes responsibility,
- a package is created, split, merged, renamed, or removed,
- package authority changes,
- public entrypoints change materially,
- environment classification changes,
- a new adapter or third-party technology enters the product,
- editor/player dependency graphs change,
- a major architecture milestone closes,
- architecture tests prove a different topology,
- the roadmap or decisions source changes ownership direction.

Do not update this source merely because:

- a local experimental file was created,
- a coding agent proposed a package name,
- an uncommitted spike exists,
- a future roadmap feature was discussed.

Once the repository exists, each update must distinguish:

```text
Observed current topology
Approved target topology
Deferred future topology
```

---

## 44. Immediate Handoff

The next source to prepare is:

```text
04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md
```

That source must define:

- source-reading order,
- one-active-task discipline,
- milestone subphase model,
- audit/contract/readiness/implementation/validation/closure flow,
- baseline and repository-cleanliness requirements,
- coding-agent prompt and evidence expectations,
- review classifications,
- commit and post-commit verification,
- dependency and architecture review gates,
- restore and reproducibility checks,
- how partial work, blockers, corrections, and handoffs are recorded.

After the workflow source, the current-state and active-milestone sources can be created without pretending that a repository already exists.

---

## 45. Architecture Approval Statement

This architecture map adopts the following reboot structure:

- `apps/editor-electron` and `apps/player-electron` are separate executable products,
- Electron application shells own platform lifecycle and secure IPC, not canonical project meaning,
- Babylon.js 9 is isolated in `@retrostage/renderer-babylon9` as the sole renderer/runtime adapter,
- RetroStage-owned canonical documents, stable identities, schemas, migrations, commands, validation, and runtime contracts remain headless authorities,
- authoring sessions own revisioned in-memory editing authority,
- React, Radix, Golden Layout, Zustand, and XState remain editor infrastructure and derived state,
- storage, index, import, physics, navigation, export, logging, packaging, and future interchange systems remain adapters or pipelines,
- SQLite, caches, cooked content, Babylon objects, and UI state remain derived,
- Preview, PIE, and Export remain separate paths sharing product contracts rather than mutable implementation state,
- package growth is milestone-gated and evidence-driven,
- no empty placeholder package is treated as progress,
- public APIs, dependency direction, environment compatibility, editor/player separation, security, and supply-chain evidence are architecture requirements,
- no hypothetical companion product or named bridge is part of the active architecture,
- generic cinematic interchange remains an optional future boundary owned by RSM-107.

This source becomes authoritative for planned application and package ownership once approved alongside the reboot charter, technology contract, canonical roadmap, and product decision registry.
