# RetroStage Maker — Reboot Architecture and Package Map

**Document ID:** `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP`  
**Role:** Authoritative reboot architecture, application-boundary, package-ownership, dependency-direction, and state-authority map  
**Project:** RetroStage Maker  
**Distribution intent:** Commercial proprietary desktop creator distributed through Steam and other approved Windows channels  
**Source generation:** Reboot / clean-start  
**Document date:** 2026-08-22  
**Document state:** `APPROVED ARCHITECTURE / RSM-6 CLOSED MILESTONE FOUNDATION / GATE B ACTIVE-CURRENT`  
**Repository:** `PRESENT — C:\RetroStage\retrostage-maker`  
**Primary branch:** `main`  
**Governing charter:** `00_RSM_REBOOT_PROJECT_CHARTER.md`  
**Technology authority:** `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`  
**Roadmap authority:** `01_RSM_REBOOT_CANONICAL_ROADMAP.md`  
**Decision authority:** `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`  
**Supersedes:** Live-status and package-existence interpretation of the 2026-07 pre-loss architecture map  
**Preserves:** RetroStage-owned canonical data, headless domain boundaries, renderer-derived state, single mutation authority, explicit runtime ownership, application/package separation, and evidence-driven architecture review

---

## 1. Purpose

This document translates the approved reboot charter, technology contract, canonical roadmap, and durable product decisions into target application/package architecture and records the physically accepted RSM-6 subset where repository evidence now exists.

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

Current and future repository manifests, package public entrypoints, architecture tests, dependency graph, lockfile, build outputs, and committed source remain the implementation evidence.

---

## 2. Governing Source Relationship

This map is subordinate to the following sources:

1. `00_RSM_REBOOT_PROJECT_CHARTER.md`
2. `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
3. `01_RSM_REBOOT_CANONICAL_ROADMAP.md`
4. `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
5. this architecture and package map
6. current-state, active-milestone, and repository-local evidence

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

If the current or a future repository intentionally differs from this planned map, the difference must be resolved through explicit architecture change control. The repository does not silently invalidate an approved boundary, and this document does not silently override observed repository truth.

---

## 3. Current Architecture/Implementation Boundary

Current durable truth:

```text
Repository foundation: ESTABLISHED BY CLOSED RSM-3
Product architecture implementation: MILESTONE-GATED; ONLY PHYSICALLY ACCEPTED SUBSETS ARE CURRENT
Current implementation truth: repository inspection + Source 02/08
Implemented reboot product application subset: apps/editor-electron secure shell + real renderer viewport
Implemented reboot product package subset: @retrostage/renderer-babylon9 plus its admitted supporting contracts
Approved application direction: Electron editor + separate Electron player
Approved renderer direction: Babylon.js 9 adapter
Approved language direction: TypeScript
Approved canonical authority: RetroStage-owned documents and typed commands
Package topology status: TARGET MAP WITH RSM-6 PHYSICAL SUBSET PROVEN
```

Package names outside the physical subset remain planned ownership boundaries. The accepted RSM-6 repository, public entrypoints, tests, lockfile, and V1 evidence prove `@retrostage/renderer-babylon9` as a real package; they do not make later target packages or capabilities real.

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
- composition of optional store/platform services through bounded RetroStage platform adapters when explicitly enabled and admitted; the store-neutral player remains the base runtime.

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
| Game-wide composition intent | `GameDefinitionDocument` in canonical document authority | Yes | Stable references/default intent only; not a giant settings object |
| Effective game-wide configuration | shared headless resolver | No | Derived `ResolvedGameConfiguration`; never canonical authoring truth |
| Resolution dependency/fingerprint evidence | shared resolver/diagnostics | Derived | Cache/provenance/regression evidence only; not authority |
| Scene/entity/component authoring data | canonical document package | Yes | Stable-ID based |
| Asset source identity and import settings | asset authoring document package | Yes | Source and cooked forms separated |
| Component definitions and policies | component registry | Code/config authority | Does not own component instances |
| Validation findings | validation engine | Recomputed | Persist only when explicitly part of reports |
| Active authoring revision/session authenticity | authoring session | No | Never serialized into project documents |
| Command history | authoring session/history subsystem | Usually local/session | Later durable local history may be separate |
| Editor selection, hover, open panels | editor UI state | Local preference/session | Not project truth |
| Workspace layout | editor preference storage | Local | Dock/tab/resize state may persist/reset locally; never project content or dirty-state authority |
| Creator Profile / Studio preferences | Studio experience authority | Local | Editor-only; not account identity, project truth, or exported-game metadata |
| Recent Projects / Continue metadata | Studio experience authority | Local | Navigation convenience only; project open still uses the normal trusted application use case |
| Project Memory / Session Ritual state | Studio experience authority | Local | Passive history/presentation only; not productivity scoring or project content |
| Project Gallery / Recent Captures | Studio experience local-media authority | Local | Creator-history media; not canonical assets unless explicitly imported later |
| Studio Player library/playback preferences | Studio experience authority | Local | Explicitly selected local media; no game-audio authority |
| Studio Radio / Studio Preset preferences | Studio experience authority | Local | Offline creator-comfort/editor-presentation state; not runtime/game presentation authority |
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

### 9.1 Studio Identity / Creator Experience Authority

POST-RSM-18 Studio Identity is a RetroStage-owned **editor-local/application-local experience layer**. It improves creator continuity and product identity but owns no game semantics.

**Owns:** Startup Welcome / Studio Launcher state, local Creator Profile/Studio display preferences, Recent Projects/Continue metadata, passive Project Memory and Session Ritual preferences, local Recent Captures/Gallery metadata, Studio Player local-media references/playback preferences, Studio Radio/Studio Preset preferences, PIE Studio-audio interlock state, and Studio Experience visibility/disable preferences.

**Does not own:** canonical project/scene/entity/component/asset/gameplay meaning, exported-game legal identity, runtime-save/checkpoint data, game `PresentationProfile`, game audio semantics, Steam/store entitlement, cloud/account/social state, or project dirty state merely because a Studio preference changes.

**Persistence/security boundary:**
- Studio data lives under application/user-data authority, outside canonical project documents.
- Project-associated Studio records may use stable project identity and safe last-known-location metadata, but stale/missing records cannot mutate, recreate, or repair projects silently.
- Gallery captures become project content only through an explicit normal asset-import action.
- User-local Studio media access is initiated explicitly and mediated by Electron Main/secure Preload narrow operations; Renderer code receives no arbitrary filesystem authority and no silent broad filesystem scan is allowed.
- Golden Layout remains an adapter for local layout state; reset-to-default changes only local preferences.
- Studio Player/Radio are creator-comfort playback, not game audio authoring/runtime.
- PIE interlock owns only Studio playback behavior and restores the exact pre-PIE Studio state.
- Cooking/export treats all Studio Identity state/media as editor-only unless a file separately entered project authority through explicit import.

#### 9.1A Detailed SICE Local-State / Media Contract

Studio Identity uses application/user-data persistence, not project persistence.

Recommended local records may contain:
```text
CreatorProfile
RecentProjectEntry
ProjectMemory
SessionRitualPreferences
GalleryCaptureRecord
StudioPlayerLibraryPreferences
StudioRadioPreferences
StudioPresetPreferences
StudioExperienceVisibility/Disable
```

`ProjectMemory` may record first/last open timestamps, last valid Scene reference, session count, accumulated Studio session time, last session duration, recent/favorite capture references and safe last-known local path metadata.

`GalleryCaptureRecord` may record `captureId`, stable project identity, optional stable Scene identity, `createdAt`, favorite/pinned state and a Studio-owned local media locator. Missing media, moved projects or deleted Scenes produce stale/missing local diagnostics only; they do not mutate project data.

Studio Player media selection is explicitly initiated by the user. Main/Preload operations must validate IPC shape, sender/origin where applicable, allowed operation and selected path before filesystem access. Permission/path failures are returned as typed local-media diagnostics. Background recursive disk discovery is forbidden.

Studio Presets may coordinate only editor-local presentation/comfort preferences. They cannot mutate game `PresentationProfile`, Scene lighting/materials/cameras, gameplay, runtime audio or exported-player rendering.

PIE audio interlock stores an explicit pre-PIE local playback snapshot sufficient to restore play/pause, volume and supported position behavior. The interlock snapshot is transient/local and cannot become Runtime Save state.

Master disable must make all Studio records optional; no canonical open/save/PIE/cook/export path may require them.

#### 9.1B Wave 2 Creator-Appeal / SICE Hardening Architecture

`StudioLocalStateStore` is the single conceptual authority for POST-RSM-18 Studio-local durable state. Its physical implementation belongs to Electron Main/application-user-data infrastructure behind narrow typed Preload operations. Renderer/UI code may request use cases and render immutable JSON-safe projections; it does not receive arbitrary paths, native filesystem objects or durable-write authority.

The store envelope is versioned independently of canonical project schemas and contains explicit record schemas, ordered migrations, quarantine evidence, built-in defaults and selective-reset boundaries. Exactly one Main-side durable writer serializes migration, reset and writes, commits through atomic replace-safe persistence, and exposes deterministic multi-instance behavior. A second process/window cannot become a competing durable writer. Migration/reset failure preserves the last accepted state when possible, emits a typed local diagnostic and falls back only within the failed Studio feature.

Studio-local records may be extended with:

```text
ProjectHeroRecord
SceneMoodBoardRecord
ShowcaseCaptureRecord / GalleryCaptureRecord
VisualRecipeBrowserPreferences
CommandPalettePreferences
SafeStartupBootstrap
```

`ProjectHeroRecord` stores an optional explicit capture reference plus derived fallback provenance. Resolution is deterministic: valid explicit pin, else latest valid eligible capture, else built-in fallback. `SceneMoodBoardRecord` stores only stable project/Scene associations, Studio-local capture references, bounded palette swatches, tags and notes. Neither record is canonical Scene/project/runtime truth.

Studio media has three non-overlapping ownership classes:

```text
STUDIO_OWNED_CAPTURE
REBUILDABLE_STUDIO_CACHE
EXTERNAL_USER_SELECTED_REFERENCE
```

Cleanup may delete only content proven to be inside an owned Studio root after existing normalization, traversal, symlink, reparse-point and junction containment policy passes. Favorites/pins are protected from automatic cleanup. External originals are never deleted; stale external references degrade to local diagnostics. Renderer-facing media identities are opaque handles, never raw paths. Two live locations claiming one project identity remain an explicit ambiguous local-history state until the user chooses fork-local-history, same-project, or forget-location; no choice silently rewrites canonical project identity.

The startup critical path reads only a minimal `SafeStartupBootstrap` plus bounded recent-project metadata needed for a first-useful launcher. Hero images, Gallery pages, Player artwork/metadata, Mood Board media and secondary history are lazy and governed by explicit item/byte/time/memory budgets. The recovery bootstrap is independently parseable and recoverable from built-in defaults; corrupt Gallery/layout/player/preset payloads cannot prevent Safe Startup. Generation-sequence exhaustion or one failed feature cannot poison the launcher/root authority.

Media parsing is defensive and bounded. Input size, decoded dimensions, artwork count/bytes, string lengths, nesting and elapsed work have explicit ceilings; active content is rejected or neutralized. Rich metadata is deferred when Main responsiveness cannot be demonstrated with the pre-RSM-19 architecture. POST-RSM-18 does not pull the RSM-27 general async-job system forward merely to parse media.

Accessibility precedence applies across Launcher, Gallery, Hero, Mood Board, Look Lab, recipe browser, Command Palette, Problems and local Player/Radio: keyboard operation, visible focus, semantic names, readable contrast, reduced motion and no-surprise-audio preferences override decorative Studio presets. Corrupt or unavailable Gallery, Player, Hero, Mood Board, layout or preset state degrades independently and cannot block the core project spine.

Creator-appeal controllers reuse existing authorities:

- Showcase capture coordinates the existing editor-view/capture seam, temporarily suppresses editor-only overlays, and restores the exact previous view in a best-effort `finally` path. It publishes a Studio-owned capture record only after successful media publication.
- Look Lab, Look A/B, Atmosphere Recipe and Visual Recipe Gallery use ephemeral preview records carrying request/generation identity, baseline fingerprint and resource ownership. Superseded, cancelled, context-invalidated or disposed completions are inert and release temporary resources.
- Look/A-B comparison fixes the camera/view and identifies the exact compared baseline/candidate. Preview state never becomes canonical until explicit Apply.
- Visual/atmosphere recipe descriptors reference existing supported presentation controls. Apply validates the complete candidate and enters the existing composition transaction / D-085 authority as one all-or-nothing history action; no half-applied multi-document graph may publish.
- Command Palette is a side-effect-free query/presentation projection over the existing command/use-case registry. Search results carry existing command identity, availability and confirmation metadata; invocation calls the existing command path.
- Diagnostic Action descriptors carry diagnostic identity plus `GoTo`, `Reveal`, `Explain`, `Copy`, `Retry`, or existing-command-backed `Fix` metadata. They neither mutate state directly nor replace centralized Problems/validation truth.

Creator-facing diagnostic copy/export uses a dedicated redacted representation. Local absolute paths, media tags, user/profile values, secrets and unapproved free text remain out of canonical project documents, player/export artifacts, logs and network surfaces by default. Redaction happens before serialization/publication; a failed redaction produces no diagnostic payload.

No new package is required by this architecture. A future admitted `fuse.js` may only rank bounded local Command Palette/recipe/diagnostic descriptors. A future admitted `music-metadata` may only parse explicitly selected local Studio Player metadata through Main/Preload mediation. Both remain replaceable adapters and own no command, filesystem, playback, codec, canonical, export or runtime authority.

### 9.2 Gameplay / Storytelling / Player-Experience Semantic Ownership

RetroStage uses one shared typed gameplay meaning layer across specialized authoring surfaces, PIE, player runtime, diagnostics, save, and later Flow Graph/Sequencer integration.

```text
Supported Game Profile
= project capability envelope / tool-availability contract

MovementProfile / CameraProfile / InteractionProfile /
EnemyProfile / PerceptionProfile / AttackProfile /
WeaponProfile / FeedbackProfile / SaveExperienceProfile / similar
= typed gameplay authoring/tuning semantics

Component
= canonical entity-attached state/behavior configuration

Recipe
= validated composition of existing capabilities/components/profiles

Specialized Editor
= creator-facing view/workflow over canonical contracts
```

A specialized editor must not invent a private runtime format or second authority.

Required semantic families include bounded player movement/camera/interaction, items/inventory/puzzles, story state/clues/NPC/dialogue/objectives, enemy/perception/combat, save/death/retry, player UI/text/frontend, input/accessibility, feedback, sequencing/media integration, and gameplay diagnostics according to Source 01 milestone ownership.

**Authority rules:**
- Common gameplay does not require Flow Graph; Flow Graph later orchestrates and extends the shared Event/Action and gameplay semantics.
- Story state, clue/knowledge, dialogue/objective state, item state, enemy state, and save-eligible progress use stable RetroStage identities/contracts rather than Babylon/Havok/Recast/React object identity.
- Runtime Save stores approved semantic progress and reconstructs transient engine objects.
- Player UI binds/presents gameplay meaning; React/Zustand/widget state is not gameplay authority.
- Transient UI navigation/focus/animation state remains separate from persistent gameplay/save state unless explicitly declared otherwise.
- Player accessibility/readability settings are typed runtime/profile state and do not overwrite creator-authored project defaults.
- Diagnostics/traces refer back to stable authored identities and explain runtime ownership.

### 9.3 Presentation / Atmosphere / Visual Character Authority

`PresentationProfileDocument` remains the canonical game-presentation authority. `Visual Rawness` is an authorable presentation dimension within that authority/model, not a separate competing profile document.

The presentation vocabulary may include Geometry Character, Texture Character, Material Character, Raster Character, Temporal Character, Atmosphere Volume, Atmosphere Director, Surface Dressing/Storytelling, Ambient Motion, Environmental FX Recipes, Atmosphere Analysis, and Look Snapshot/A-B tooling.

Canonical separation:

```text
canonical project presentation/atmosphere intent
≠ transient Babylon renderer/audio/VFX objects
≠ local player quality/accessibility settings
≠ editor-local Studio Identity/workspace comfort state
```

Effective runtime presentation is derived from canonical authored intent plus active scene/volume/event/sequence state plus validated quality/hardware fallback plus validated accessibility/comfort override. Runtime overrides never silently write back into canonical project documents.

`AtmosphereVolume` is canonical spatial intent projected through RetroStage adapters; Babylon fog/light/post-process state is derived. `AtmosphereDirector` coordinates typed atmosphere semantics and does not become a private renderer-control language.

Deterministic variation that affects authored meaning or QA must be reproducible. Creator-locked identity versus player-adjustable quality/accessibility must be explicit. Unsupported fallback combinations become supported fallback, warning/blocker, or declared unsupported-target states rather than silent substitution.

### 9.4 Runtime Capability / Export Disposition and Semantic Closure

Every supported creator capability that can affect a standalone game must expose stable owning semantics and one declared export disposition:

```text
EDITOR_ONLY
COOKED
RUNTIME
HYBRID
```

The required chain is:

```text
used capability
→ stable capability identity
→ export disposition
→ runtime/cooked projection
→ semantic + asset + module dependency closure
→ cooked manifest
→ deterministic package inclusion
→ physical artifact evidence
→ standalone execution/parity proof
```

Static asset references are insufficient as the complete closure model. Semantic reachability may include story flags, dialogue/objective transitions, recipes, scene transitions, dynamic resources, UI bindings, presentation/atmosphere state, audio/VFX triggers, save participation, and optional store-enabled capabilities.

Missing a required link is an Export blocker.

Store-specific packaging composes over a complete store-neutral runtime; a store adapter cannot repair a semantically incomplete base export.

### 9.5 Game-Wide Composition Authority

RetroStage has one explicit game-wide composition root: `GameDefinitionDocument`.

`ProjectDocument` may bind it through a stable `gameDefinitionId`. GameDefinition owns game-wide runtime/export composition **intent through typed references and defaults**. It must not inline every Scene, entity, dialogue line, enemy, UI widget, asset, gameplay object, or subsystem document.

```text
ProjectDocument
≠ GameDefinitionDocument
≠ RuntimeGameSession
≠ ResolvedGameConfiguration
```

`GameDefinitionDocument` is canonical authoring data. `ResolvedGameConfiguration` is derived. `RuntimeGameSession` is transient runtime authority.

No giant GameMode object, runtime service locator, UI-state configuration authority, raw file-path composition, hidden plugin override, or resolved-cache-as-truth shortcut may replace this contract.

### 9.6 Deterministic Game Configuration Resolution

One RetroStage-owned headless `GameConfigurationResolver` resolves effective game configuration for Preview, PIE, runtime, cook, and export.

```text
accepted immutable authoring snapshot
→ coherent project-resolution view
→ GameDefinition + referenced semantic owners
→ canonical Capability Matrix support truth
→ ResolutionContext
→ GameConfigurationResolver
→ ResolutionDependencySet
→ ResolvedConfigurationFingerprint
→ ResolvedGameConfiguration
```

`CanonicalProjectSnapshot`, if used as implementation terminology, means the **coherent resolution view of one accepted immutable authoring snapshot**. It does not create a second persisted snapshot/session authority.

A resolver invocation must never combine torn live revisions that never coexisted. `ResolutionDependencySet` identifies material canonical inputs/revisions/versions that affected a result. `ResolvedConfigurationFingerprint` deterministically identifies that material resolution basis. Both are derived evidence/cache/provenance artifacts and may be discarded/rebuilt.

Required behavior:
- deterministic output for equivalent material inputs/context;
- explicit provenance for effective values and overrides;
- fail-closed diagnostics for unresolved required meaning;
- no runtime write-back into canonical defaults;
- no editor workspace/Zustand/React/Babylon state as shipped configuration authority;
- one resolution semantics shared by PIE and Export;
- cache invalidation keyed by material dependency identity, never hidden ambient state.

Exact physical module/package placement is deferred to owning implementation. This alignment does **not** require creation of `@retrostage/game-definition`, `@retrostage/config-resolver`, or another new package.

### 9.7 Capability and Settings/State Authority Separation

```text
RequestedCapabilities
≠ SupportedCapabilities
≠ EffectiveCapabilities
```

- GameDefinition/project intent may request/select capabilities.
- The canonical Capability Matrix or accepted successor owns support/unsupported truth.
- The resolver derives EffectiveCapabilities for the current composition/context.
- UI visibility is derived consumer state and never capability truth.

Also distinct:

```text
GameDefinition defaults
Project Variables
Runtime Settings
Player Settings
Runtime Save state
Target/Build settings
Editor/Studio state
Secrets
```

No universal untyped global-settings bag may mix these authorities.

### 9.8 Runtime Temporal / Entity / Effect / RNG Stability

`@retrostage/runtime-core` is governed by these semantic contracts:

**Clock/update.** Gameplay timing uses explicit clock domains and ordered update phases. Fixed-step semantics are explicit where required. Render-frame cadence is not gameplay authority. Pause/time-scale/hit-stop behavior is defined per clock/domain.

**Runtime entity identity.** Authored stable identity, runtime-spawned entity identity, persistence/save identity, renderer handles, physics bodies, navigation objects, worker objects, and UI objects are not interchangeable. Spawn provenance and despawn reason are explicit.

**Save-safe boundary.** Runtime Save captures approved semantic state only at an allowed stable/quiescent boundary. It does not persist Babylon/Havok/Recast/worker/timer object identity.

**Effect idempotency.** Event/Action effects declare repeatability semantics. One-shot/once-per-scope effects use stable semantic commit/idempotency keys and explicit reset scope. Repeated event delivery does not automatically imply repeated committed effect.

**Randomness.** RetroStage owns RNG domains, stream identity, seed provenance, save participation, trace, and regression meaning. Streams are domain-separated so unrelated systems do not perturb one another. Third-party PRNG/noise code, if admitted, only produces numbers behind this authority.

### 9.9 Scene / Section / Level Lifecycle, Residency and Traversability

Scene/Section transitions are transactional semantic operations, not immediate renderer destruction.

```text
requested
→ preparing
→ validated/prepared
→ committing
→ active
→ deactivating
→ unloaded
```

Cancellation/failure must leave an explainable prior/next state rather than a half-applied world.

Required distinctions:
- semantic residency vs resource residency;
- authored Scene/Section identity vs transient Babylon scene/resource identity;
- cross-Scene stable references vs raw object pointers;
- entry/spawn identity vs camera/listener state;
- gameplay passability truth vs derived navigation topology.

Shared traversal metrics such as agent radius/height/step/slope or accepted equivalents are product semantics reused by blockout, collision, navigation, AI, diagnostics, and export validation.

Dynamic doors/blockers/section substitutions/teleports project gameplay truth into navigation links/topology. Recast/navigation backend state never becomes authority for whether a door or route is semantically passable.

### 9.10 Audio, Input, Async and Scheduled-Work Lifetime Boundaries

**Audio.** Audible sound and `GameplayNoise` are separate semantics. AI hearing consumes typed gameplay-noise events, not speaker gain. Audio ownership/lifetime scopes include project/session/Scene/Section/entity/sequence/UI/cue as applicable. Scene teardown/transition continuity is explicit. One runtime listener authority is selected independently of camera count. Runtime Save reconstructs transient audio from semantic state.

**Input/focus/device.** Focus loss/regain, device disconnect/reconnect/switching, pointer-lock/capture loss, held-action release, and pause policy are explicit runtime lifecycle events. Physical device state never becomes canonical gameplay configuration.

**Async generation lease.** Long-running derived work captures owner identity plus relevant snapshot/session generation. Completion is accepted only if the lease still matches current authority. Stale work is rejected/cancelled; completion alone grants no mutation authority.

**Worker mutation barrier.** Workers may compute derived results but may not directly commit canonical documents or authoritative runtime state. The owning application/command/runtime authority validates and commits accepted results.

**Scheduled work.** Delayed/repeating work has stable semantic identity, clock/domain, owner lifetime, repeat policy, cancellation semantics, save disposition, and teardown behavior. Raw `setTimeout`/`setInterval` handles are implementation details, not gameplay or save authority.

**Event causal budget.** Event/Action dispatch carries causal identity and bounded depth/work/event budgets. Overflow fails in a diagnosable deterministic way instead of allowing unbounded legal cycles. Later Flow Graph orchestration inherits the same safety floor.

### 9.11 Unknown Extension Data and Runtime Authority

Structurally safe unknown extension data may be preserved for forward/plugin compatibility without being executed.

```text
required runtime/export meaning unknown or owner unavailable
→ Play blocker and/or Export blocker
```

Optional/unreachable unknown data may be preserved only when the requested operation proves it is not required. RetroStage must not guess semantics, silently drop required data, or elevate unknown values into executable authority.

### 9.11A Game-Wide Runtime Detail Completion

**Event queue.** Runtime Event/Action dispatch declares one bounded mode equivalent to `IMMEDIATE_ALLOWED`, `DEFERRED_TO_PHASE_BOUNDARY`, or `DEFERRED_TO_NEXT_TICK`. Same-priority queued items use deterministic accepted enqueue order plus stable tie-break identity. Cancellation, owner teardown, re-entry and work enqueued during drain are explicit. Immediate dispatch still consumes causal-work budget and cannot recurse around phase/idempotency rules.

**Level diagnostics / optional flow view.** Creator-facing validation may report blocked spawn, insufficient head/door/step clearance, traversal-metric mismatch, unreachable required Section/exit, invalid dynamic navigation link, stale navigation projection, invalid cross-Scene reference, camera clearance/composition obstruction and Scene/Section ownership conflict. A World/Level Flow visualization is optional editor-only derived analysis; it is not a canonical graph or new milestone.

**Critical audio cues.** A cue whose late start changes gameplay/dialogue/sequence/presentation meaning is marked synchronization-critical by the owning semantic contract. It requires readiness/preload or an explicit degraded/blocker policy. Missing/late critical-cue behavior is diagnosable. Sequence/dialogue/UI audio shares normal audio lifetime/ownership and interruption/restoration semantics.

**Runtime session generation.** New Game, fresh full retry, return-to-title→new session and PIE restart mint a new session generation. Async/worker completion validates that generation at acceptance time; older generations cannot regain authority.

**Composition transaction.** Multi-document authoring that changes GameDefinition plus referenced profile/document semantics commits through normal atomic authoring transaction/command authority. Validation/cancellation/failure cannot leave a half-applied canonical graph.

**Resolver acceptance.** The shared resolver is regression-tested for deterministic base output, editor-state independence, Preview/PIE parity, cook/export parity, missing-reference failure, migration/default compatibility, override provenance and stable save/reload round-trip.

**Dynamic navigation publication.** Gameplay passability changes publish derived navigation at an explicit owner/update boundary. Generation leases reject stale navigation completion; unload cancels/rejects owner work; save/load reconstructs backend navigation from semantic state.

### 9.12 Feature-Level Gameplay / Player-Experience Normalization

Feature-level gameplay and player-experience detail from the roadmap annex reuses existing authorities:

```text
GameDefinitionDocument = game-wide composition by stable reference
Supported Game Profile = capability envelope
typed gameplay profiles/components/recipes = subsystem-owned canonical authoring semantics
Player Experience Designer / Story & Objective Spine / Inventory & Puzzle Workshop = editor-only views/workflows
React/Zustand/Babylon/Havok/Recast = transient/derived implementation state
```

`Screen Stack`, UI layer/policy, focus/back/restoration, save eligibility and player settings may be typed runtime/player-experience contracts, but they do not move story/inventory/health/save authority into UI state.

`ALPHA CORE / SUPPORTED / CONDITIONAL / EDITOR ONLY` remain roadmap-scope labels only.

### 9.13 Export Disposition and Save Participation Normalization

```text
EDITOR_ONLY
COOKED
RUNTIME
HYBRID
```

is the only export-disposition vocabulary.

Save participation is orthogonal. Candidate wording `RUNTIME + SAVE` means `RUNTIME` plus explicit save participation; `COOKED + RUNTIME` means `HYBRID`.

### 9.14 Feature-Level Visual / Asset-Pipeline Architecture Annex

The following reviewed Source-03 visual architecture detail is binding after current-authority normalization:


### PART D — SOURCE 03: ARCHITECTURE AND PACKAGE MAP ALIGNMENT

#### 36. Preserve Existing Package Strategy

Do **not** create one new package per feature or milestone.

Preserve the existing planned ownership model and extend existing package responsibilities only when a proven boundary exists.

The primary planned ownership remains:

```text
Canonical RetroStage Documents / Settings
              │
              ▼
Application / Authoring Policy
              │
      ┌───────┴─────────┐
      ▼                 ▼
Asset Pipeline      Runtime/Renderer Projection
      │                 │
      ▼                 ▼
Cooked Derivatives  Babylon.js 9 runtime resources
```

---

#### 37. `@retrostage/asset-pipeline` Additions

Extend the planned responsibilities with adapter families as needed, without making them separate packages by default:

- image-processing adapter;
- atlas-packing adapter;
- geometry-retroization adapter;
- derivative recipe coordinator;
- deterministic-random/noise adapter where a real boundary exists;
- transactional temporary-artifact validation/promotion support.

Preserve existing ownership exclusions:

- asset stable identity is not owned by the third-party tool;
- canonical import-setting meaning is not owned by the third-party tool;
- license/provenance truth is not owned by the third-party tool;
- runtime resource lifetime is not owned by the asset pipeline.

---

#### 38. Renderer/Runtime Projection Boundary

`@retrostage/renderer-babylon9` or the owning Babylon adapter may implement:

- renderer projection of Geometry/Texture/Material/Raster Character;
- shadows/fog/exposure presentation;
- Atmosphere Volume runtime projection;
- camera presentation behavior;
- VFX/cards/particle projection;
- runtime material variants;
- instances/thin instances as performance representation;
- derived render resources.

It must **not** own canonical presentation meaning.

---

#### 39. New Architecture Invariants

Add or reinforce the following concepts:

```text
Babylon Material
≠ canonical Material meaning

Babylon fog/light/post-process state
≠ canonical Atmosphere / Presentation documents

ThinInstance
≠ canonical Entity identity

Derived mesh
≠ source mesh

Derived texture
≠ source texture

Presentation Profile
≠ renderer object graph

Atmosphere Volume
≠ Babylon-only state

Third-party algorithm
≠ RetroStage product policy

Authoring Tool
≠ Runtime Capability

Editor Representation
≠ Exported Runtime Representation

Editor Dependency
≠ Player Dependency

Preview Success
≠ Export Success
```

---

#### 39A. Persisted Presentation Ownership and Runtime-Override Architecture

Source 03 should explicitly preserve four separate authorities:

```text
Canonical project presentation / atmosphere intent
≠ transient renderer objects
≠ local player quality / accessibility settings
≠ editor-local Studio Identity / workspace comfort state
```

A useful conceptual runtime projection is:

```text
canonical authored intent
+ active scene/volume/event/sequence state
+ validated quality/hardware fallback
+ validated accessibility/comfort override
        ↓
effective runtime presentation state
        ↓
RetroStage renderer/audio adapters
        ↓
Babylon / audio runtime primitives
```

The exact data structures are not frozen here. Required properties are:

- deterministic and traceable precedence;
- no runtime override silently writes back into canonical project documents;
- no Babylon object becomes the persisted truth;
- save/reopen and migration preserve canonical authored intent;
- generated derivatives remain rebuildable and separately versioned/hashed as required;
- editor Preview and exported player use compatible color/output semantics rather than unrelated pipelines;
- player quality/accessibility state can be reset/changed without losing creator-authored project defaults.

Where a conflict exists between creator-locked identity and a hardware fallback, the result must be explicit: supported fallback, build warning/blocker, or declared unsupported target — never unexplained silent substitution.

#### 40. Export Disposition Architecture

Canonical authoring meaning must be able to resolve through a declared disposition:

```text
Canonical Authoring Meaning
        │
        ▼
Export Disposition
        ├─ EDITOR_ONLY → editor-only representation; excluded from player
        ├─ COOKED      → deterministic cook pipeline → validated artifact
        ├─ RUNTIME     → runtime contract → player behavior
        └─ HYBRID      → validated cooked artifacts + runtime behavior
```

Exact schema belongs to later milestone contract design.

---

#### 41. Heavy Job Isolation

Mesh simplification, image conversion, palette conversion, atlas generation, and other memory-heavy transformations must not be designed as synchronous renderer/UI-thread mutations.

Preferred architecture direction:

```text
canonical request
→ queued/isolated Node-side job
→ temporary artifact
→ validation
→ atomic promotion
→ hot-swap/reload through approved resource lifecycle
```

On failure:

- canonical project remains safe;
- source asset remains safe;
- last-good derivative remains safe;
- temporary partial output is not promoted;
- creator receives a structured diagnostic.

---

#### 42. Scatter Ownership

Bounded scatter must preserve RetroStage-owned semantics:

```text
RetroStage Scatter Settings
+ seed
+ collection
+ exclusions
+ placement policy
        ↓
deterministic authored placement
        ↓
cooked/authored representation
        ↓
Babylon instance / thin-instance optimization where appropriate
```

Runtime optimization identities must not become canonical authored identity.

---

---

### 9.15 V30-FREEZE11 Semantic Authority Register

This architecture register carries only durable V30-FREEZE11 runtime, authoring, identity, lifecycle, and adapter-boundary rules into Source 03 authority.
Evidence/examples remain in the accepted external oracle; these rules record intent and do not claim implementation, milestone completion, dependency admission, publication, or RSM-7 authority.

#### Authority placement: §9.1 Studio Identity / Creator Experience Authority and §9.1A/B; merge local-state/media hardening

##### SICE-H11 — Local Authority Partition / Core Startup Project-Admission Fallback

- Authority normalization: StudioLocalStateStore is the single durable authority for Studio Identity records, but it does not absorb every editor-local authority.
- The local authority partition remains.
- StudioLocalStateStore -> Creator Profile -> Recent Projects / local history -> Project Memory -> Gallery / Hero / Mood Board -> Studio Player / Radio / Presets -> SICE feature preferences -> SafeStartupBootstrap for Studio-local recovery.
- WorkspaceLayoutPreferenceStore / Golden Layout adapter -> dock/tab/resize/workspace layout only.
- Canonical Project Recovery / AUT -> project save/recovery/migration/external-change authority.
- RuntimeGameSession -> PIE runtime authority.
- Workspace-layout clarification: StudioLocalStateStore is not Golden Layout canonical/local layout authority.
- SICE may coordinate layout reset/recovery UX, but Golden Layout remains behind the editor workspace adapter and local workspace-preference ownership already established by RSM-9/35 and Source06.
- Corrupt layout state and corrupt Studio Identity state must be independently recoverable.
- Core startup fallback: A minimal RetroStage-owned Core Project Admission Shell exists independently of decorative Studio Identity surfaces.
- It can provide the minimum safe path required to.
- New Project Open Project project recovery/restricted-open routing where required application settings / Studio reset where necessary.
- Creator Profile Gallery Hero Project Memory Studio Player Studio Radio Studio Preset Look Lab Command Palette third-party plugin optional SICE dependency.
- Therefore.
- disable/reset/quarantine Studio-local state start from built-in local defaults enter Core Project Admission Shell show project-recovery status/proposals produced by AUT.
- but it cannot itself.
- Those remain AUT/project-open authorities.

##### SICE-H12 — Studio Local-State Generation / Feature Envelope / Durable Transaction

- Per-record atomic writes alone must not expose mixed local state when one user action changes several Studio records.
- At the same time, one corrupt Gallery payload must not make Creator Profile/Launcher preferences unreadable.
- The Studio store exposes a coherent local generation model.
- StudioLocalStateGenerationId StudioLocalWriteTransactionId feature-record schema/version record identity integrity/provenance.
- or implementation-equivalent semantics.
- Feature envelopes: Material feature families are independently parseable/quarantinable where practical.
- CORE / bootstrap CreatorProfile RecentProjects ProjectMemory Gallery/Hero MoodBoard Player Radio Preset Look/Recipe preferences CommandPalette preferences.
- The physical format may be one file or several files, but it must prove.
- one corrupt optional feature is not loss of all Studio local state.
- and.
- one accepted multi-record Studio operation is not partially acknowledged local state.
- Transaction: For one Studio-local multi-record operation.
- Disk-full/failure: Write, rename, permission or disk-full failure.
- does not destroy last accepted local generation does not corrupt SafeStartupBootstrap does not block canonical project Save.
- If one optional feature migration fails, quarantine/fallback remains local to that feature when its schema boundaries permit.
- The bootstrap/core local state must remain independently readable.
- Full Studio reset requires explicit confirmation and does not reset.
- canonical project Runtime Save workspace layout unless separately selected plugin permissions/secrets exported content.

##### SICE-H13 — Studio Project Context Generation / Recent-Path Admission / AUT-06 Coupling

- Critical stale-context problem: Studio surfaces can keep async work alive while the active project changes.
- Project A Gallery/Hero/MoodBoard/Look preview loads -> user closes A -> opens Project B -> late A result arrives.
- That result must not appear under or mutate B's local Studio context.
- Project-associated Studio work carries.
- StudioProjectContextGeneration ProjectStableId CanonicalWorkspaceIdentity when project is admitted request identity feature owner.
- Late work from an old project context is inert.
- Project admission order: Recent Projects / Continue does not decide canonical project identity.
- The sequence is.
- user selects Recent/Continue entry -> normal project-open authority validates path/trust/schema/recovery -> AUT-06 resolves ProjectStableId/location ambiguity -> successful project admission -> SICE attaches/updates local history for the admitted identity/location.
- SICE-H4 normalization: Existing local-history choices such as.
- same project fork local history forget location.
- operate only on Studio-local history after/beside AUT-06 identity resolution.
- They cannot mint/rewrite canonical ProjectStableId.
- A true project fork uses AUT-06/Fork Project semantics.
- Recent-project launcher I/O: The first-useful Launcher reads local RecentProjectEntry metadata only.
- It does not eagerly.
- parse every recent project hash every workspace stat/read every removable/network path walk project directories perform migration/recovery.
- merely to render the list.
- Any optional background stale-location check must be.
- and cannot mutate project state.
- Stale location: A stale Recent entry remains a local navigation diagnostic.
- It cannot recreate a directory, relink to another same-named project or silently change canonical identity.
- Continue/Open: Filesystem/project validation is performed when the user chooses a target through the normal project-open authority.
- bounded cancellable non-blocking generation-bound.

##### SICE-H14 — External Media Reference / Folder Enumeration / Operation-Time Revalidation

- External reference is not durable filesystem authority: EXTERNAL_USER_SELECTED_REFERENCE records a user-selected local media reference.
- It does not permanently grant the Renderer or future sessions unrestricted access to the path or its containing folder.
- Opaque identity: Studio Player/library records should use a stable local reference identity such as.
- StudioMediaReferenceId ownership class display metadata Main-side locator/provenance last-known media fingerprint/identity where useful.
- Renderer projections continue to receive opaque handles rather than raw filesystem authority.
- Revalidation on use: Before opening/reading metadata/playback for an external reference, Main revalidates.
- selected/reference identity allowed operation path normalization current existence/type symlink/reparse/junction behavior supported local-media class size/budget.
- under the current Electron filesystem policy.
- A path selected yesterday is not assumed safe/unchanged forever.
- Changed target: If the stored reference now resolves to materially different/unexpected content.
- stale/replaced reference -> local diagnostic / reselect.
- rather than silently treating the replacement as the original media identity.
- Exact OS file-identity evidence is implementation-owned.
- Folder selection: Explicit folder selection is not permission for an unbounded recursive crawl.
- Baseline enumeration should be bounded and preferably non-recursive unless a separately reviewed mode is admitted.
- It enforces.
- Huge/slow folders: If bounded enumeration cannot finish safely without RSM-27 infrastructure.
- degrade/stop with a clear limit.
- Startup: External media references are not automatically dereferenced or decoded merely because the Launcher starts or a project opens.

##### SICE-H15 — Studio Playback Session / Decoder Event / Audio Ownership / No-Surprise Playback

- Playback identity: Studio Player/Radio playback uses local semantic session identity.
- StudioPlaybackSessionId StudioPlaybackGeneration StudioMediaReferenceId / bundled-track identity StudioAudioOwnerId.
- Raw HTMLAudioElement, decoder, AudioContext or browser media event identity is not local-state authority.
- Lifecycle: Representative local lifecycle.
- REQUESTED -> PREPARING -> READY -> PLAYING ↔ PAUSED -> COMPLETED / STOPPED / FAILED.
- Stale decoder events: Late.
- loadedmetadata canplay seeked ended error durationchange.
- from an old playback generation cannot mutate the newly selected track/session.
- Decode failure: Malformed/unsupported playback.
- fails only the local playback feature releases owned media handles/resources preserves editor/Main responsiveness does not affect project/PIE/game audio authority.
- Studio audio authority: Player and Radio contribute through one editor-local StudioAudioAuthority/equivalent composition layer.
- It owns Studio-only.
- effective Studio master/local volume Player contribution Radio contribution PIE interlock attenuation/pause no-surprise-audio preference.
- It is not the game's Audio Engine.
- No automatic surprise audio: App startup, Safe Startup, opening a project, restoring a workspace or merely selecting a Studio Preset must not start audible Studio media unexpectedly.
- Audible playback begins from.
- explicit creator playback action or a clearly defined same-session resume that the creator already initiated.
- and remains subordinate to the no-surprise-audio preference.
- Persisted "was playing" state does not automatically imply autoplay on the next application launch.

##### SICE-H16 — PIE Studio-Audio Interlock Lease / User-Action Precedence

- PIE interlock uses a scoped contribution/lease.
- StudioAudioInterlockId PIE RuntimeSessionGeneration captured StudioPlaybackGeneration(s) captured user-action generation interlock policy = PAUSE / DIM / DO_NOTHING.
- Start: On accepted PIE start.
- capture relevant Studio playback state -> publish PIE interlock contribution.
- The contribution affects only Studio audio.
- During PIE: If the creator changes Studio Player/Radio state during PIE.
- play pause seek change track change volume stop.
- the Studio user-action generation advances.
- Stop: On PIE stop, the interlock removes only its own contribution.
- It restores/reconciles captured state only when that state is still semantically current under the interlock contract.
- It must not write an old cached volume/track/play state over a newer creator decision.
- Aborted/stale PIE: Failed PIE start, Retry, restart, crash recovery or a stale RuntimeSessionGeneration releases the interlock contribution.
- No Studio audio remains permanently dimmed/paused because a PIE lifecycle terminated unusually.
- Multiple starts: Play/Restart races remain single-flight through the existing PIE workflow.
- one Studio interlock cannot accidentally be owned by two concurrent editor runtime sessions.

##### SICE-H17 — Showcase Capture Scoped View Lease / Transactional Local Publication

- Critical stale-restore problem: Existing Source03 wording says Showcase Capture.
- temporarily suppress overlays -> restore exact previous view in finally.
- A blind cached restore can overwrite a newer creator action that happened while capture was running.
- Showcase Capture uses a scoped editor-presentation contribution/lease.
- Representative identity.
- ShowcaseCaptureRequestId StudioProjectContextGeneration EditorViewGeneration CapturePresentationLeaseId capture output candidate identity.
- Overlay suppression: Instead of imperatively rewriting persistent panel/gizmo preferences.
- capture lease contributes: hide editor chrome hide gizmos hide selection overlays.
- to the capture/render seam.
- Completion/cancel/failure removes only that contribution.
- The current underlying editor state then becomes visible naturally.
- No stale restore: If the creator changed.
- gizmo visibility selection camera/view panel state.
- during an allowed asynchronous capture window, lease teardown cannot restore a stale pre-capture value over that newer state.
- Capture consistency: The capture request binds the intended.
- project Scene/Section context camera/view identity presentation/Preview generation.
- and fails/stales when that context is no longer valid.
- Publication transaction: Capture local publication is staged.
- render/capture candidate -> encode/write temporary Studio-owned media -> validate file/budget -> promote Studio-owned media -> commit GalleryCaptureRecord / Hero eligibility through StudioLocalStateStore.
- A Gallery record is never published before valid media exists.
- Resource budget: Capture dimensions, encoded bytes, temporary GPU/CPU memory and simultaneous capture count are bounded.
- Capture failure cannot leave editor overlays suppressed or project dirty.

##### SICE-H18 — Preview / Recipe Apply Baseline Revalidation / Cross-Project Stale Protection

- Existing preview rule: CAE-H1 already binds preview work to request/generation identity.
- The final hardening is the Apply boundary.
- Baseline: Look Lab, Look A/B and Recipe preview records bind.
- ProjectStableId AuthoringRevisionId / relevant presentation baseline fingerprint StudioProjectContextGeneration PreviewRequestGeneration camera/view identity where required.
- Concurrent authoring: If another editor surface changes relevant canonical presentation while Look Lab remains open.
- old preview baseline is not permission to overwrite the new canonical state.
- Apply: Apply routes through MUI-02/03/05 and the existing D-085 composition transaction.
- At command time it.
- revalidates target stable IDs revalidates capability revalidates relevant authoring revision/baseline recomputes or rejects stale candidate.
- according to the operation.
- A stale Lab must not restore/replace unrelated newer fields from an old whole-profile snapshot.
- Cross-project: Closing/switching projects invalidates all project-bound.
- Look Lab Look A/B Recipe preview Mood Board derived preview Showcase request diagnostic/navigation async work.
- through StudioProjectContextGeneration.
- Command Palette / Diagnostic Actions: Command Palette and Diagnostic Actions inherit MUI-05/MUI-09.
- displayed enabled state is not execution-time permission.
- stale diagnostic location is not permission to target a same-index/name replacement.
- Invocation revalidates the current project/session/selection/command identity.

##### SICE-H19 — Studio Preset / Accessibility / Master-Disable Precedence and Quiescence

- Explicit precedence: Studio local experience has one deterministic precedence order.
- Accessibility / no-surprise-audio / safety preferences -> Master Disable / Safe Startup restrictions -> active PIE interlock / modal/focus safety -> explicit current creator local preferences -> Studio Preset decorative/default suggestions.
- A Studio Preset cannot override a higher-precedence accessibility/safety choice.
- Preset as declarative contribution: Preset application should set/compose owned Studio preference fields or scoped contributions.
- It must not cache and later restore global UI/audio state over newer creator choices.
- Master disable: Disable Studio Experience is not merely display:none.
- It revokes/quiesces Studio-owned optional activity.
- Studio Player/Radio audible playback media decode/metadata work Gallery/Hero/MoodBoard lazy work Showcase capture Look/Recipe preview resources Studio-only timers/session rituals optional Studio watchers/listeners.
- while preserving the Core Project Admission Shell and canonical editor spine.
- Disable vs reset: DISABLE = stop/hide/quiesce Studio experience.
- retain local data unless policy says otherwise.
- RESET SELECTED FEATURE = delete/reset only the selected Studio-local state/media class.
- FULL STUDIO RESET = explicit confirmation.
- reset owned Studio-local records/media according to retention policy.
- None of these operations reset canonical projects, Runtime Save, game PresentationProfile or plugin secrets/permissions.
- Re-enable: Re-enable reconstructs Studio projections from the last accepted local generation/built-in defaults.
- It does not resume stale media/preview operations that were active before disable.
- Audible playback remains subject to SICE-H15 explicit/no-surprise semantics.

##### SICE-H20 — Studio Local Storage Budget / Retention / Disk-Full / Cleanup Integrity

- Studio-local storage has bounded policies by ownership class.
- Representative budgets.
- StudioLocalStateStore bytes Gallery owned-media bytes/count rebuildable thumbnail/cache bytes Hero/MoodBoard derived preview bytes external-reference metadata count Player library entry count diagnostic/local-history retention.
- Exact values remain SICE implementation-owned.
- Retention: Automatic cleanup may target only.
- REBUILDABLE_STUDIO_CACHE unreferenced/orphaned STUDIO_OWNED_CAPTURE under policy expired bounded local history.
- Favorites/pins and explicit protected captures remain protected.
- External originals are never deleted.
- Disk-full: Capture/cache/local-state write failure from insufficient disk space.
- does not corrupt StudioLocalStateStore does not delete a protected/last-known-good generation merely to make room does not affect canonical Project Save authority.
- Owned media reference integrity: Before deleting Studio-owned media, cleanup verifies.
- ownership class contained real target reference/pin/favorite status current local generation.
- and avoids deleting a file still referenced by accepted Gallery/Hero/MoodBoard records unless the chosen cleanup operation explicitly updates those records transactionally.
- Imported project copy: If a Studio capture was explicitly imported into the project.
- Studio-owned original is not project asset copy.
- Deleting the Studio-owned copy does not delete the canonical/source project asset.
- Cleanup evidence: Diagnostics can explain.
- what is owned what is rebuildable what is protected what is external what will be deleted estimated freed bytes.
- before destructive manual cleanup.

##### SICE-H21 — SICE Control-Slice / Evidence / Closure Matrix

- SICE-A -> SICE-B -> SICE-I1…I6 -> SICE-V1 -> SICE-CLOSE1 -> SICE-ALIGN1.
- Source04's generic high-risk workflow remains authoritative.
- To remove implementation ambiguity, the future SICE control should map its slices explicitly as follows unless physical baseline evidence justifies a reviewed adjustment.
- SICE-A = current-state / Studio-local authority / existing shell-media-layout audit.
- SICE-B = local-state, startup, security, accessibility, failure, project-admission and authority contracts.
- SICE-I1 = Core Project Admission Shell + Safe Startup bootstrap + StudioLocalStateStore foundation + durable-writer/migration/failure isolation.
- SICE-I2 = Studio Launcher + Creator Profile + Recent Projects / Project Memory / Session Ritual + workspace persistence/reset integration.
- SICE-I3 = Showcase Capture + Gallery + Project Hero + Scene Mood Board + owned-media cleanup/storage budgets.
- SICE-I4 = Look Lab / Look A-B + Atmosphere/Visual Recipe surfaces + Command Palette + Diagnostic Actions + Beautiful Empty States.
- SICE-I5 = Studio Player + Studio Radio + explicit local media references + optional rich metadata admission + StudioAudioAuthority + PIE audio interlock.
- SICE-I6 = master disable + accessibility precedence + failure isolation + privacy/redaction + no-network proof + export/editor-only exclusion + full core-spine regression.
- SICE-ALIGN1 = current-state/source alignment only after accepted closure.
- Closure truth: SICE cannot close merely because all visual surfaces render.
- Closure must prove.
- old project-context async work -> cannot publish into new project.
- stale capture/PIE restore -> cannot overwrite newer creator state.
- local media/store failure -> cannot block canonical work.
- project identity/recovery -> delegated to AUT/project-open authority.
- Source01 already freezes.

#### Authority placement: §9.15.1 Runtime spine and observability boundaries (new under §9, after §9.14); consistent with §30 Diagnostics Architecture

##### OBS-00 — Runtime Error Boundary / Failure Containment / Safe Shutdown

- Canonical source preservation: SYS-06 defines failure classes. RSM-97 additionally requires one player/runtime error-boundary policy.
- Failure classes: Existing vocabulary remains.
- REJECTED DEFERRED BLOCKED DEGRADED RECOVERABLE FATAL.
- plus creator-build/package classifications where the owner needs them.
- Boundary levels: Failures are caught/translated at the nearest owning boundary.
- adapter/backend subsystem Scene/Section RuntimeGameSession player application shell editor workflow.
- No raw backend failure authority: Babylon/Electron/WebAudio/decoder/worker exception objects are diagnostic inputs.
- They do not define product-level recovery semantics.
- Recoverable failure: A recoverable failure may.
- substitute an approved placeholder disable an optional feature retry bounded work return to safe screen reconstruct a subsystem.
- only when the owning contract proves semantic safety.
- Fatal failure: Fatal runtime failure enters a controlled terminal path.
- stop new gameplay commits freeze/reject unsafe new operations flush bounded local diagnostics where safe release/close resources best-effort show player-safe error surface exit/return according to product policy.
- Player-safe messaging: Player-facing error surfaces do not expose.
- local filesystem secrets developer tokens private project paths stack traces plugin secrets signing credentials.
- Save safety: Error handling cannot write a "recovery save" from an incoherent runtime state unless normal SaveEligibility and save-state contracts explicitly permit it.
- Error loops: Repeated fallback/retry is bounded.
- A corrupt required asset cannot create an infinite.
- load -> fail -> fallback -> reload -> fail.
- loop.

##### OBS-01 — Structured Log / Trace / Correlation / Redaction Contract

- Canonical source preservation: RSM-98 requires typed observability across editor, runtime, asset and export flows.
- Diagnostic event envelope: Representative structured event.
- DiagnosticEventId event taxonomy/category severity timestamp / semantic tick where relevant CorrelationId CausalId / ParentId where applicable ProjectStableId or redacted project scope AuthoringRevision / RuntimeSessionGeneration / ExportBuildId where relevant Scene/Section/entity/asset/plugin/job identity result/failure code privacy classification bounded structured fields.
- Correlation: One creator action can be followed across.
- command -> job -> asset/resource load -> runtime event -> save/export operation.
- without relying on free-form text matching.
- Time semantics: Operational timestamps and runtime semantic ticks are distinct.
- Wall-clock timestamps aid diagnosis.
- they do not become gameplay ordering authority.
- Pino/adapters: A logging package such as Pino is an output adapter.
- It does not own.
- event taxonomy privacy classification correlation identity failure semantics.
- Bounded logs: Logs are bounded by.
- record size rate retention disk quota rotation policy.
- according to editor/player mode.
- A runaway plugin/system cannot fill disk indefinitely.
- Redaction: Known sensitive classes are removed or represented safely.
- secrets/tokens signing credentials unnecessary absolute paths personal data raw project content unless explicitly opted into a diagnostic bundle.
- Diagnostic bundles: Bundles are explicit collections with inventory/size/redaction rules.
- Creator can inspect what is included where product UX supports it.

##### OBS-02 — Local Diagnostics / Telemetry / Crash-Upload Privacy Separation

- Hard separation: local logs / traces / diagnostics is not network telemetry is not crash upload.
- Local diagnostics can exist with zero network telemetry.
- Baseline: Telemetry/crash upload remains.
- OFF unless explicitly admitted and user-controlled.
- under RSM-115.
- Consent: Any future remote telemetry defines.
- purpose fields frequency retention deletion endpoint/provider network behavior offline behavior consent/opt-out.
- before collection.
- Project content: Project files, asset bytes, screenshots/captures, save files and source paths are not automatically uploaded as crash payload.
- Crash artifact: A local crash record may reference bounded.
- build/app version failure code platform profile recent redacted correlation IDs non-secret stack/signature where safe.
- without silently transmitting it.
- Editor vs exported games: RetroStage editor telemetry policy does not automatically become telemetry inside creator-exported games.
- Exported-game analytics require creator-owned separate product capability/admission.

#### Authority placement: §9.15.1 Runtime spine, generations, clocks, resources and systemic ownership (new under §9, after §9.14)

##### SYS-01 — Runtime Authority Context / Generation-Lease Normalization

- runtime session generation async generation lease owner lifetime event causal identity scheduled-work identity stable runtime entity identity.
- The hardening candidate also introduces local identities such as.
- actionInstanceId attackInstanceId ShotInstance notification occurrence identity screenInstanceId stimulus identity transaction identity.
- If each subsystem invents unrelated rules for when such identities become stale, late callbacks and cross-system operations can disagree about whether an operation still belongs to the current world.
- RetroStage should normalize one conceptual runtime authority context vocabulary.
- This does not require one physical object passed everywhere.
- A runtime operation/occurrence should carry the relevant subset of identity required by its owner, for example.
- runtimeSessionGeneration Scene / Section activation generation where material owner stable identity owner lifetime/generation semantic operation / occurrence identity tick / phase identity where ordering matters causal identity where Event/Action is involved.
- The exact tuple is subsystem-specific.
- the validity semantics are shared.
- A new RuntimeGameSession invalidates old-session runtime authority.
- Scene/Section unload invalidates owner-scoped work tied to that activation.
- Entity despawn invalidates entity-owned late work.
- Screen closure invalidates screen-owned late work.
- Sequence/Flow Graph cancellation invalidates owned pending work according to the owning contract.
- A late completion may publish only after all material authority/generation checks still match.
- Anti-god-object rule: This contract must not become.
- It is a shared identity/validity vocabulary only.
- Wall-clock recency does not grant runtime authority.

##### SYS-02 — Scene / Section / Session Transition Composition Barrier

- But the hardening candidate adds many runtime features whose behavior during those transition boundaries must be explicitly composed.
- movement combat projectiles conditions AI/perception animation runtime UI save eligibility visual temporal state async work scheduled work audio/VFX.
- Scene/Section/session transition remains owned by the existing lifecycle authority.
- All participating systems must expose bounded transition behavior rather than independently destroy or activate runtime state.
- Representative semantic flow.
- Transition Request -> freeze/identify source semantic state -> PREPARE participating owners -> validate destination + required resources/semantics -> resolve save/operation blockers -> COMMIT transition generation -> activate destination semantic owners -> reconstruct/project runtime resources -> DEACTIVATE / TEARDOWN old owner scopes.
- Required participant behavior: Where applicable, a subsystem must declare whether an in-flight operation at transition time is.
- COMPLETE_BEFORE_COMMIT CANCEL DEFER_TRANSITION TRANSFER / REBIND RECONSTRUCT_FROM_SEMANTIC_STATE.
- projectile owned by an unloading Section -> despawn or transfer only by explicit policy.
- poison/condition -> persist only if semantic owner/save policy allows.
- pending async thumbnail/resource/query -> stale-reject by owner generation.
- scheduled action -> cancel, persist or reconstruct according to its declared owner/save policy.
- Quiescence: A Scene/Section transition may be a Save Eligibility blocker/defer reason until it reaches an approved save-safe boundary.
- A save must never capture a half-committed transition.
- Old Scene/Section/UI/entity/async authority cannot cross that replacement unless an explicit external/local player-setting authority owns the data.
- Exact staging is implementation-owned.
- the transactional meaning is binding.

##### SYS-03 — Save Eligibility Aggregation / Scoped Blocker Contract

- Existing canonical vocabulary: The canonical save model already defines.
- ALLOWED DEFERRED BLOCKED.
- and examples such as.
- unsafe Scene transition unsupported Sequence moment pending transactional puzzle change unsupported active attack / encounter state.
- Structural gap: The hardening candidate mentions Save Eligibility from several domains but does not yet define how multiple simultaneous reasons compose.
- A single mutable boolean is unsafe.
- Pause screen says save allowed while Scene transition says defer while inventory transaction says block.
- or one subsystem may clear a flag still required by another.
- Runtime Save remains the final save-eligibility authority.
- Participating systems may publish scoped typed eligibility contributions/reasons.
- Conceptually.
- SaveEligibilityContribution { owner identity owner generation/lifetime disposition: ALLOWED | DEFERRED | BLOCKED stable reason code creator/player-safe explanation key optional retry/recheck trigger }.
- Exact schema belongs to RSM-65 implementation.
- Aggregation: The effective state should deterministically compose all current valid contributions.
- At minimum.
- any BLOCKED -> BLOCKED.
- else any DEFERRED -> DEFERRED.
- else -> ALLOWED.
- unless RSM-65 freezes an implementation-equivalent policy with the same safety semantics.
- Required safeguards: A closed screen/ended attack/finished transaction removes only its own contribution.
- One owner cannot clear another owner's blocker.
- Stale contributions disappear/reject when their owner generation is no longer active.
- UI merely presents the effective result/reasons.
- Save Point token consumption cannot commit while effective eligibility is not accepted.
- Sequence/Flow Graph cannot force a save around a blocker.
- without exposing raw engine state.

##### SYS-04 — Consequential Operation / Semantic Commit Protocol

- combat attacks inventory/item transfer weapon/ammo/reload save/load/retry settings apply UI consequential operations.
- with concepts such as.
- operation identity expected state single-flight idempotency commit point rollback/no-op.
- Those semantics should not drift into incompatible implementations.
- RetroStage should define one conceptual consequential-operation protocol reusable by owning systems.
- This is not a universal transaction manager and does not imply distributed ACID transactions.
- Representative lifecycle.
- REQUESTED -> VALIDATED -> RESERVED / PREPARED where needed -> COMMITTED -> COMPLETED.
- or.
- REJECTED CANCELLED FAILED_WITHOUT_COMMIT FAILED_AFTER_COMMIT_WITH_EXPLICIT_RECOVERY.
- Exact states may vary by subsystem, but each consequential operation must identify.
- operation identity owner runtime/session generation where applicable expected/precondition state idempotency/repeat policy semantic commit point result/failure classification rollback/no-op/recovery behavior trace/provenance identity.
- Core invariant: A presentation/UI/animation callback can request or synchronize an operation but cannot create the semantic commit merely by firing.
- Cross-system examples: This shared protocol should normalize, without merging ownership.
- key consumption + door unlock ammo consumption + shot commit reload reserve->magazine transfer save-token use + save promotion settings candidate + verified effective setting load/retry + runtime-session replacement item combine A+B->C.
- No giant transaction coordinator: The owning subsystem remains authoritative.
- The protocol prevents each owner from inventing incompatible meanings of "accepted", "committed", "cancelled" and "duplicated".

##### SYS-05 — Event/Action + Flow Graph + Sequencer Non-Bypass Contract

- The new gameplay/UI/animation/visual hardening adds important commit and authority rules that a later orchestration layer must not bypass.
- Flow Graph, Sequencer and future orchestration surfaces may invoke approved semantic events/actions/requests only through the same owning contracts used by specialized tools and runtime gameplay.
- They must not gain privileged shortcuts.
- Forbidden examples.
- Flow Graph -> health -= 10 Sequencer -> Babylon transform = ... Flow Graph -> inventory array push Sequencer -> direct ScreenPolicy boolean mutation Flow Graph -> direct renderer fog/material object mutation Sequencer marker -> raw save-file write Flow Graph -> bypass Save Eligibility.
- Required direction.
- Flow Graph / Sequencer / specialized editor / gameplay runtime -> shared Event/Action semantic request -> owning subsystem validation -> normal action/transaction/lifetime rules -> semantic commit.
- Scrub / skip / restore: Sequencer preview/scrub must distinguish preview evaluation from authoritative live commit.
- Skip/restoration must not duplicate.
- damage item grants objective rewards save operations death rewards notifications one-shot audio/VFX.
- Event/Action causal identity, idempotency and reset/save scope remain applicable.
- Budget / recursion: Flow Graph and Sequencer-triggered Event/Action work inherit.
- event causal budget phase rules same-tick deterministic ordering owner teardown idempotency.
- They cannot recurse around these protections.
- Player UI: A UI button exposed through Flow Graph/Sequence still creates a typed UI/gameplay intent.
- it never grants a graph arbitrary DOM/IPC/runtime mutation access.

##### SYS-06 — Runtime Failure Classification / Fallback / Diagnostic Contract

- throw fallback retry ignore block.
- for semantically similar failures.
- Canonical RSM-97 already establishes a runtime error-boundary/fallback direction.
- Every runtime-facing hardening contract should map material failures into the existing structured runtime failure/error-boundary architecture.
- REJECTED / INVALID_REQUEST DEFERRED / RETRYABLE BLOCKED / REQUIRED_MEANING_UNAVAILABLE DEGRADED_WITH_EXPLICIT_FALLBACK RECOVERABLE_RUNTIME_FAILURE FATAL_RUNTIME_FAILURE.
- Exact canonical names belong to RSM-97 and must be normalized there.
- Required properties: A material runtime failure should carry where applicable.
- stable subsystem/error identity owner semantic identity runtime/session/Scene generation operation/occurrence identity user/creator-safe message key diagnostic detail fallback/recovery disposition cause/provenance link.
- Required safeguards: Raw Babylon/Havok/Recast/DOM/Electron exceptions are adapted before becoming product-facing semantics.
- A fallback cannot silently change creator-locked gameplay/presentation meaning.
- A degraded visual/audio/UI path cannot masquerade as full parity.
- Fatal failure cannot leave partially active session/Scene/UI authority.
- Recoverable failure cannot duplicate a previously committed consequential effect during retry.
- Error reporting itself must not leak secrets, unsafe paths or privileged content.
- RSM-97 integration: RSM-97 should become the normalization point for failure codes/dispositions introduced by GPC/RUI/ANI/VIS/SYS contracts.
- The alignment candidate should not permanently mint a competing global error taxonomy before that physical milestone.
- A bounded conceptual classification should distinguish implementation-equivalent outcomes such as.

##### SYS-07 — Persisted Semantic Admission / Migration / Export / Save Matrix

- PlayerProfile / ProtagonistDefinition AnimationSet / AnimationGraph MaterialFamily / MaterialInstance Visual Baseline ShadowProfile Screen/UI documents gameplay conditions new profile policies.
- Canonical Source03 already requires all persisted documents to have.
- schema version stable identity deterministic serialization runtime validation explicit migration typed reference remapping safe unknown-data policy dangerous-key rejection.
- The candidate must explicitly inherit that rule so new contracts are not implemented first and retrofitted for migration/export later.
- Before a new persisted semantic is admitted, its owner must classify.
- AUTHORITY canonical project runtime save player settings/profile editor local derived/cache transient runtime.
- PERSISTENCE persisted or not.
- SCHEMA versioned validation/migration.
- REFERENCE IDENTITY stable identity/remap policy.
- EXPORT DISPOSITION EDITOR_ONLY | COOKED | RUNTIME | HYBRID.
- SAVE PARTICIPATION none / explicit approved semantic state.
- UNKNOWN DATA preserve/reject/block according to owner policy.
- SECURITY dangerous-key / untrusted-content validation.
- No accidental document proliferation: A named contract such as VisualBaseline, ShadowProfile, AnimationSet or PlayerProfile does not automatically require a new top-level document or package.
- It may be.
- Migration-first invariant: If a persisted shape is changed after release/support begins.
- Export/save closure: Any persisted capability used by the game must still satisfy normal semantic dependency closure, cook/export disposition and runtime-save participation rules.
- Being serializable is not the same as being exportable or save-eligible.
- Silent reinterpretation is forbidden.

##### SYS-08 — Typed Condition Evaluation Purity / Snapshot / Revalidation Contract

- Dialogue Objective Story State Scene Director / Section flow Enemy activation Encounter / boss phase transitions Narrative Recipes Liminal route selection Flow Graph Sequencer gating UI availability.
- V9 already makes Dialogue conditions pure/read-only, but condition purity must be a cross-domain runtime rule.
- CONDITION EVALUATION = READ ONLY.
- Evaluating a condition cannot directly mutate.
- Story State Inventory/items Objective state Clue/Knowledge NPC memory Scene/Section state combat/health save state UI stack/policy audio/VFX.
- A condition may only read approved typed semantic facts and return a deterministic supported result for the accepted snapshot/context.
- Typed identity: Durable conditions should use stable typed identities/operands/predicates rather than ad hoc private strings or executable snippets.
- HasItem(ItemId) ClueKnown(ClueId) ObjectiveState(ObjectiveId) == COMPLETED StoryState(Route) == MERCY NpcPresent(NpcId) HealthBelow(EntityId, threshold).
- Exact vocabulary remains subsystem/registry-owned.
- It must not observe.
- Revalidation: A condition being true when UI/dialogue/interaction/AI/encounter intent is presented does not guarantee it remains true when a consequential action commits.
- Where state can materially change between presentation/request and commit, the owning action must revalidate the required predicates at its semantic commit boundary.
- TRUE FALSE INVALID / MISSING REFERENCE RUNTIME-UNAVAILABLE where the owner explicitly supports it.
- Missing/invalid data must not silently become false if that would hide a broken required narrative/gameplay dependency.
- A future bounded expression layer would require separate schema/security/dependency/sandbox admission and still remain read-only.
- Representative predicates.
- Error semantics: Condition evaluation should distinguish.
- or implementation-equivalent bounded outcomes.

##### SYS-09 — Runtime Clock Domain / Update Phase / Scheduled-Work Contract

- Canonical source preservation: Source01 and Source03 already require.
- explicit runtime clock domains ordered update phases fixed/variable-step semantics pause/time-scale/hit-stop policy owner-scoped scheduled work render frame is not gameplay authority raw timer handle is not save/gameplay authority.
- This alignment makes that source truth an explicit alignment contract.
- Clock domains: Runtime timing uses RetroStage-owned semantic clock domains.
- Representative domains may include.
- GAMEPLAY_FIXED GAMEPLAY_VARIABLE where explicitly permitted PRESENTATION UI AUDIO / MEDIA adapter-facing time UNSCALED / REALTIME for approved non-gameplay uses EDITOR / PREVIEW outside standalone runtime.
- Exact names are implementation-owned.
- A system declares which clock/domain it consumes.
- Ordered phases: A runtime tick has an explicit ordered phase model.
- INPUT_SAMPLE PRE_SIMULATION FIXED_SIMULATION GAMEPLAY_RESOLUTION POST_SIMULATION EVENT_PHASE_BOUNDARY PRESENTATION_PROJECTION END_OF_TICK.
- The exact phase list remains RSM-16/17-owned, but order is product semantics.
- A long frame/suspend cannot produce an unbounded "simulate every missed fixed step" spiral.
- Raw browser/Babylon frame delta is never consumed as unreviewed gameplay truth.
- A subsystem cannot implement a private pause model by simply choosing a different browser timer.
- SKIPS_MISSED_OCCURRENCES COALESCES CATCHES_UP_BOUNDED RESCHEDULES_FROM_NOW.
- or an equivalent bounded policy after stall/resume.
- The system never fires an unbounded burst merely because host time advanced.
- Save: Scheduled gameplay work that must survive Runtime Save stores semantic remaining/deadline/repeat meaning in the owning clock domain, not opaque timer handles.
- Restore recreates scheduled work under the new RuntimeSessionGeneration.
- Representative conceptual ordering may include.
- Fixed-step accumulation: Where gameplay uses fixed simulation.
- host/render elapsed time -> bounded accumulator -> 0..N fixed simulation steps -> interpolated/derived presentation.

##### SYS-10 — Event Queue Dispatch / Phase / Re-entry / Deterministic Ordering Contract

- Canonical source preservation: Source01 V5 and Source03 §9.11A explicitly freeze a bounded Event/Action dispatch model equivalent to.
- IMMEDIATE_ALLOWED DEFERRED_TO_PHASE_BOUNDARY DEFERRED_TO_NEXT_TICK.
- This detail must not disappear behind generic SYS-05 wording.
- Dispatch identity: Every Event/Action occurrence carries.
- OccurrenceId / semantic event identity causal chain identity owner RuntimeSessionGeneration dispatch class priority where used accepted enqueue sequence stable tie-break identity.
- Immediate dispatch: IMMEDIATE_ALLOWED is valid only from phases/actions that explicitly allow it.
- Immediate work.
- still consumes causal budget still validates generation/owner still obeys idempotency cannot recursively bypass phase rules.
- Queued ordering: Same-priority queued work uses deterministic accepted enqueue order plus a stable tie-break where needed.
- Ordering must not depend on.
- object hash order Map/Set incidental population physics callback order Promise completion race worker completion order renderer traversal order.
- Drain semantics: Work enqueued while a queue/phase is draining follows an explicit policy.
- eligible later in same drain under bounded rule or next phase boundary or next tick.
- It cannot create hidden recursive unbounded dispatch.
- Cancellation / teardown: Queued work validates owner/session/Scene/Section/entity generation at acceptance/dispatch.
- Owner teardown cancels/rejects ineligible queued work.
- They cannot implement private dispatch loops that bypass SYS-04/05/10.
- Failure: Causal/event-budget overflow produces deterministic diagnostics and a bounded failure/degradation path under SYS-06.
- It never freezes the runtime by processing an unbounded legal cycle.

##### SYS-11 — Runtime System Dependency / Bootstrap / Readiness / Teardown Transaction

- Critical remaining inference: Canonical Sources require one RuntimeGameSession, one system registry, dependency declaration and deterministic disposal, but they do not yet spell out partial-startup behavior with the same rigor as Scene/Save transactions.
- A half-initialized RuntimeGameSession must never become playable.
- System registration descriptor: Each runtime system declares/derives.
- Dependency graph: Before activation.
- Bootstrap lifecycle: Representative session bootstrap.
- CREATING -> REGISTERING -> PREPARING -> VALIDATING -> READY_TO_COMMIT -> ACTIVE.
- > FAILED -> TEARING_DOWN_PREPARED_SYSTEMS -> DISPOSED / SAFE_FAILURE_STATE.
- No partial authority publication: Input/gameplay/event dispatch does not treat the session as ACTIVE until every required system has passed its declared preparation/readiness contract.
- A system cannot begin authoritative gameplay merely because its own constructor finished.
- before commit, but those resources are owned by the preparing session generation.
- Teardown: Normal teardown follows deterministic dependency-safe order, usually reverse ownership/dependency order unless an explicit relation requires another plan.
- A disposed dependency cannot be used by a still-active dependent.
- Repeated Stop/Retry/window-close/error paths cannot double-release or resurrect ownership.
- Runtime restart: PIE restart/New Game/fresh Retry creates a fresh system/session generation.
- Prepared/queued/asynchronous work from the previous graph cannot re-register or publish into the new graph.
- Optional degraded system: A system is optional only when the resolved Game Configuration/capability contract explicitly says the session remains valid without it.
- Unexpected initialization failure does not silently reinterpret a required system as optional.
- On failure.
- Prepared resources: Systems may prepare.
- resource leases subscriptions queries workers audio nodes runtime projections.
- Failure releases them.

##### SYS-12 — Host Focus / Suspend / Resume / Input-Device Discontinuity Contract

- Canonical source preservation: Source03 already requires explicit handling of.
- focus loss/regain device disconnect/reconnect/switching pointer-lock/capture loss held-action release pause policy.
- RSM-97 also requires suspend/resume and focus/window churn evidence.
- External platform reality: Electron exposes Main-process power events such as.
- suspend resume lock-screen unlock-screen.
- and Chromium/Electron may throttle backgrounded renderer timers/animations.
- Therefore.
- renderer callback continuity is not runtime continuity.
- Host lifecycle event: RuntimeGameSession receives normalized host lifecycle events such as.
- FOCUS_LOST FOCUS_GAINED VISIBILITY_HIDDEN VISIBILITY_VISIBLE SYSTEM_SUSPEND SYSTEM_RESUME SCREEN_LOCK SCREEN_UNLOCK POINTER_CAPTURE_LOST INPUT_DEVICE_DISCONNECTED INPUT_DEVICE_CONNECTED ACTIVE_DEVICE_CHANGED.
- as supported by the target.
- Held input safety: On focus/capture/device loss, affected held actions are semantically released/cancelled according to the current input context.
- The runtime must not leave.
- because a key/button-up event was never delivered.
- The first resumed host delta is not fed blindly into.
- physics AI camera damping animation VFX cooldowns scheduled gameplay Sequence.
- SYS-09 applies bounded resume/catch-up policy.
- pauses gameplay continues selected unpaused clocks shows Pause UI on return requires explicit resume input.
- Audio/media: Audio, Dialogue, Sequence and MED playback use their own semantic pause/restore contracts, but host suspend/focus events enter through this common lifecycle boundary.
- Disconnect/reconnect cannot rewrite creator-authored bindings.
- Overlay/store events: Steam/Epic overlay focus transitions, where admitted, normalize into the same focus/input lifecycle rather than gaining a private pause/input path.

##### SYS-13 — Runtime Resource Manager / Handle / Lease / Coalesced Load / Eviction Contract

- Canonical source preservation: RSM-80/81 require one owner for.
- This must become an explicit cross-domain authority because the alignment now relies on resource leases in Sections, assets, media, animation, VFX and presentation.
- Stable resource identity: Runtime consumers request semantic resources through stable identities such as.
- Resource states: Representative lifecycle.
- UNREQUESTED -> REQUESTED -> LOADING -> READY -> EVICTABLE -> EVICTING -> RELEASED.
- or -> FAILED.
- Lease rule: A resource cannot be physically disposed while any valid strong lease/pin requires it.
- active Scene/Section preparing Section live entity/material/animation Sequence/media transition Preview/PIE owner shared runtime dependency.
- Weak/cached resources may be evicted under policy once no strong lease remains.
- A stale load for old revision/session/build cannot replace the current resource.
- Fallback presentation may degrade visuals/audio only where the owning capability contract allows it.
- A missing gameplay-critical resource cannot be converted silently into success.
- Memory pressure: Resource Manager owns coordinated eviction policy under RSM-81 budgets.
- but cannot each independently dispose shared engine resources.
- Device loss: VIS-10 reconstruction uses semantic resource handles/revisions.
- GPU resource recreation does not mint new gameplay/asset identity or replay gameplay consequences.
- Preview/PIE separation: Editor Preview and PIE may share immutable decoded/cooked bytes where safe, but their runtime projections/leases are context-owned.
- PIE Stop cannot dispose a resource still leased by editor Preview, and editor reimport cannot mutate the exact revision currently leased by PIE.
- Shutdown: Runtime/PIE shutdown releases all session leases and reports leaks/late owners.

##### SYS-14 — Domain-Separated RNG / Seed Provenance / Save / Trace Contract

- Canonical source preservation: Source01/03 require RetroStage-owned domain-separated RNG semantics.
- This alignment promotes that requirement into the shared alignment spine.
- Authority: RetroStage RNG semantic service = stream identity / seed provenance / draw semantics / save / trace authority.
- third-party PRNG/noise library = replaceable number-producing adapter only.
- Streams: Unrelated systems use separate stable RNG domains/streams, for example.
- ENCOUNTER AI_VARIATION LOOT / ITEM_VARIATION where product scope allows VFX_PRESENTATION AUDIO_VARIATION LIMINAL_VARIATION PROCEDURAL_PREVIEW.
- Exact domains remain feature-owned.
- Isolation: Adding one random draw to an unrelated VFX system must not change.
- enemy spawn choice liminal route gameplay variation.
- that belongs to another domain.
- Seed provenance: A stream seed is derived/recorded from explicit semantic provenance such as.
- runtime session seed stable domain identity Scene/Section/entity/encounter identity authored seed where creator-exposed repeat/occurrence identity.
- not.
- current Date.now() render frame count object memory address unordered collection position.
- unless nondeterminism is explicitly desired and classified.
- Save: Gameplay-relevant stream state/seed progression participates in Runtime Save when future draws must remain continuation-equivalent.
- Presentation-only RNG may reconstruct/reseed according to its contract.
- New Game / Retry: New Game/fresh session uses explicit seed policy.
- restore saved stream state reseed from stable checkpoint provenance mint a new allowed variation.
- Trace / diagnostics: Important gameplay RNG decisions can record.
- without requiring every raw PRNG call to be logged.
- Expected visual/audio nondeterminism remains separately classified.

##### SYS-15 — Shared Traversal Metrics / Collision / Navigation / Clearance Contract

- Canonical source preservation: Source01/03 explicitly require shared traversal metrics to be product semantics reused across.
- blockout player collision AI/navigation door/opening validation EntryAnchor clearance dynamic navigation creator diagnostics export validation.
- Without one shared authority, each subsystem can use plausible but incompatible dimensions.
- Traversal profile identity: A supported actor/traversal family uses a stable profile/metric identity such as.
- TraversalProfileId agent/capsule radius standing height crouched height where supported step height maximum traversable slope ground/clearance tolerances door/opening clearance margin navigation-agent identity.
- Exact fields/units remain RSM-17/56/59/60-owned.
- One semantic source: Movement collision dimensions Navigation agent dimensions Blockout clearance diagnostics EntryAnchor validation Door/corridor traversal checks AI path feasibility.
- derive from the same accepted traversal semantics or an explicitly compatible profile relationship.
- They do not independently copy magic constants.
- PLAYER small enemy large enemy special pursuer.
- where product scope requires it.
- do not redefine semantic traversal size.
- Stance: GPC-26 standing/crouched state may select an approved effective physical clearance profile.
- Animation pose alone cannot change the collision/navigation clearance contract.
- Standing from crouch validates required headroom before changing effective physical height.
- A stale navmesh baked for another agent profile cannot silently satisfy the current actor.
- If scalable physical actors are ever supported, scale->collision/nav semantics require an explicit bounded authored/runtime contract.
- Missing or stale traversal-profile closure is an Export blocker where the actor/route is required.
- Navigation bake/runtime identity: Navigation derivatives record the relevant.
- TraversalProfileId profile revision/fingerprint geometry/source revision navigation settings.
- so changing traversal dimensions invalidates affected nav proof.

##### SYS-16 — Display / Window / DPI / Render-Surface / Safe-Area Lifecycle

- Canonical source preservation: RSM-6 and RSM-92 already require.
- resize handling display modes device behavior supported Windows target behavior.
- logical UI/CSS/DIP coordinates window content bounds render-surface physical pixel size game presentation reference resolution/aspect pointer/input logical coordinates safe-area / letterbox region.
- window resize window move to another display display added/removed display scale-factor / DPI change display bounds/work-area change fullscreen/windowed transition resolution/render-scale change orientation/rotation where relevant.
- into one display-context update path.
- Atomic projection update: A display-context change updates coherently.
- Babylon engine/render target size camera projection/aspect postprocess/CRT target sizing UI layout/safe area pointer/picking coordinate conversion capture/showcase dimensions resolution-dependent diagnostics.
- DPI / pixel ratio: High-DPI scaling is treated as a dynamic platform property.
- Moving a window between displays with different scale factors cannot leave.
- blurry/undersized render target incorrect mouse picking mis-scaled UI wrong CRT scanline density wrong pixel-art/retro raster scale.
- Presentation reference vs physical pixels: A creator's authored presentation reference resolution/aspect remains separate from the current physical display resolution.
- Visual Rawness/CRT may define semantic scanline/raster behavior relative to the presentation profile rather than blindly using one physical scanline per display pixel.
- must avoid unbounded per-event churn while still publishing the final valid display generation.
- It cannot leave the player in a half-applied render/UI/input state.
- Save/settings: Player-selected display preferences persist through Runtime Settings/Player Settings authority.

##### JOB-01 — Async Job Executor / Worker Budget / Priority / Cancellation / Publication

- Canonical source preservation: RSM-27 already owns a general job system.
- This alignment depends on async work across.
- asset import nav generation validation thumbnail Look Lab media metadata plugin processors cook/export indexing diagnostics capture.
- A shared execution contract prevents every subsystem from creating its own queue/pool.
- Job identity: Representative job envelope.
- JobId JobTypeId owner/session/project identity captured AuthoringRevision / RuntimeSessionGeneration where relevant priority class resource-cost estimate/class cancellation token progress contract publication contract.
- Priority classes: Bounded classes may include.
- INTERACTIVE_CRITICAL INTERACTIVE BACKGROUND BUILD / EXPORT MAINTENANCE.
- Exact names are RSM-27-owned.
- Priority is not permission to starve all lower classes indefinitely.
- Worker/main boundary: CPU-heavy work that materially threatens editor/runtime responsiveness should move behind the approved worker/job boundary when the owning milestone supports it.
- Workers.
- compute parse analyze transform.
- but do not directly mutate canonical documents or authoritative runtime state.
- Shared worker budget: The application defines bounded concurrency rather than allowing.
- asset importer pool nav pool plugin pool thumbnail pool validation pool export pool.
- to each independently saturate the machine.
- The executor may reserve capacity for interactive/editor-critical work.
- input bytes temporary memory output bytes worker count elapsed CPU/wall time queued result size.
- before commit/publication.
- Shutdown: Project close/app quit/plugin disable/runtime teardown cancels or detaches only work that is safe to detach under the owning contract.
- No job worker remains a hidden process-lifetime owner after its application authority has ended.
- Canonical source preservation: RSM-27 already owns a general job system. This alignment depends on async work across.

#### Authority placement: §9.15.2 Bounded static-map projection contracts (new under §9, after §9.14)

##### MAP-01 — MapDefinition / Floor / Region / Marker Identity & Ownership

- Required identities: If MAP-00 is accepted, the map model should distinguish.
- MapDefinitionId MapFloorId / MapLayerId MapRegionId MapMarkerDefinitionId optional map-owned reveal-state identity player/UI marker occurrence identity.
- from.
- SceneId SectionId EntityId ObjectiveId PuzzleId SavePointId UI widget identity floorplan texture AssetId.
- MapDefinition: A bounded MapDefinition may own/reference.
- stable map identity localized display name floors/layers floorplan art AssetId or typed authored vector/shape data where supported regions / authored map bounds Scene/Section/Area mappings marker definitions/categories legend labels/icons reveal policy player-location projection policy player-UI presentation profile reference save participation only for genuinely map-owned runtime state.
- No second spatial database: MapRegion is map projection metadata over existing world semantics.
- It must not become a competing Scene/Section/world hierarchy or AI/navigation space.

##### MAP-02 — Scene / Section / Area → Map Projection / Player Location Semantics

- Map position is a projection of authoritative world location.
- A supported map may use one of two bounded modes.
- REGION_ONLY -> current Scene/Section/Area highlights an authored MapRegion.
- AUTHORED_2D_PROJECTION -> an explicit validated world->floorplan mapping projects player position/orientation.
- Safety rules: If projection data is missing/stale/invalid, do not invent a precise player position. - Fall back to current floor/region indication where valid. - Scene/Section transitions re-evaluate map/floor mapping through stable identities. - Map projection does not drive the player transform, navigation or collision. - Reimport/move of floorplan art must preserve MapDefinition references through AssetId/IMP contracts. - Mapping transforms/anchors are canonical authored map data, not Babylon node identity.
- Multiple Scenes / floors: One map may reference several Scenes/Sections and one Scene may contribute to several authored map regions if explicitly supported. Ambiguous mappings must be diagnosed rather than guessed.

##### MAP-03 — Objective / Puzzle / Save / Door / POI Marker Binding & Non-Authority

- Marker rule: MARKER PRESENTATION != DOMAIN TRUTH.
- A marker binding may read typed owner facts such as.
- Objective state / selected objective Puzzle state SavePoint identity/availability presentation Scene/Section state Door/interaction entity state where a stable owner exists Clue/POI authored visibility condition player location projection.
- MarkerDefinition: A bounded marker may provide.
- stable MarkerDefinitionId category/icon/legend label map/floor/region anchor owner reference or authored static POI identity visibility condition state-to-presentation mapping priority/filter category optional objective association.
- Non-authority: Clicking/focusing a marker must not directly.
- complete an Objective solve a Puzzle unlock a Door teleport the player change Story State.
- unless a separately admitted typed UI action explicitly represents a valid gameplay command. The default floorplan is informational/navigation-of-the-UI, not gameplay mutation authority.
- Objective guidance: Objective marker support is optional and authored. World-marker guidance remains non-mandatory and Source05's MMO tracker/navigation defaults remain excluded.

##### MAP-04 — Authored Reveal / Visibility / Save / Restore Semantics

- Preserve Source05 boundary: Freeze6 does not admit automatic dynamic map discovery.
- If MAP-00 is accepted, map reveal is explicitly authored and bounded.
- Representative typed operations may include.
- RevealMap RevealMapFloor RevealMapRegion HideMapRegion where product policy permits.
- or implementation-equivalent semantics.
- A Creator may deliberately bind, for example.
- Acquire HospitalMap item -> RevealMapFloor(Floor1).
- Enter Section Basement -> authored action RevealMapRegion(Basement).
- but there is no invisible global exploration/fog-of-war engine that automatically discovers world space.
- Ownership: Persist only genuinely map-owned state such as authored reveal progress.
- Derived marker presentation should normally recompute from Objective/Puzzle/Scene/etc. authorities rather than duplicating their state into the map save payload.
- Restore: Save/restore hydrates map-owned reveal state without replaying reveal notifications/consequences. Deleted/renamed floor/region identities use normal migration/reference diagnostics.
- Optional user presentation preferences such as selected floor/filter need not become gameplay truth.

##### MAP-05 — Creator Map/Floorplan Authoring + Player Map UI / Accessibility / Export Closure

- Creator authoring: If MAP-00 is accepted, provide a bounded Map / Floorplan authoring workflow rather than requiring manual JSON or generic UI graphs.
- Default Creator flow.
- Create Map -> add/select Floor -> choose/import floorplan art through IMP/AssetId pipeline -> link Scene / Section / Area regions -> place/author marker anchors -> choose reveal policy -> preview player location / objective / puzzle / save markers -> validate.
- Advanced: Advanced may expose bounded.
- world->map transform/anchor calibration region polygons/bounds floor ordering marker category/filter rules state-to-icon mapping projection fallback policy reveal action bindings.
- It is not a GIS/editor/navmesh tool.
- Diagnostics: Creator diagnostics should identify.
- unmapped Scene/Section ambiguous player-location projection marker references missing owner marker outside valid floor/region bounds floorplan art missing/stale/reimported MapRegion with missing world semantic reference revealed state with missing stable identity objective marker bound to impossible objective export-blocking cooked asset/reference issue.
- Player Map UI: RSM-87 remains the player-UI owner.
- Supported screen behavior may include.
- Controller/keyboard/pointer navigation, focus, localization, text scaling and non-color-only marker communication inherit the runtime UI/accessibility contracts.
- Import / cook / export: floorplan source art -> IMP accepted AssetId/AssetRevision -> MapDefinition references stable AssetId -> immutable ExportSnapshot -> cooked UI/map resources -> Runtime Content Manifest -> packaged player.
- Packaged games never resolve original workstation source paths.
- Map state participates in save only as specified by MAP-04.
- Preview / PIE / cooked player must agree on semantic marker/reveal results.

#### Authority placement: §9.15.2 Gameplay authority and transaction contracts (new under §9, after §9.14)

##### GPC-01 — Player Action Arbitration & Input Buffering

- Competing gameplay intents cannot invoke subsystems directly. A bounded Player Action Arbiter owns priority, exclusivity, start/continue eligibility, interruption, cancellation windows, buffering, expiry, and restore behavior. Each multi-phase action has stable identity and a bounded REQUESTED, ACCEPTED, STARTED, optional COMMITTED, COMPLETED or rejected/cancelled/interrupted lifecycle so presentation or adapter callbacks cannot create half-committed gameplay.
- RSM-17 owns the first playable action seam, RSM-41/42 integrate camera and capture, and RSM-67 binds physical input to semantic actions. RSM-67 is not gameplay priority authority.
- the Player Action Arbiter remains the sole bounded arbitration owner.
- The same overlapping intent window must resolve deterministically across movement, attack, interaction, damage, and camera-authority changes. Focus loss must release held actions and must not leave gameplay input latched.

##### GPC-02 — Combat Resolution / Hit Deduplication

- ONE_HIT_PER_TARGET REPEAT_HIT_WITH_INTERVAL.
- Multi-hit behavior must never arise accidentally from repeated physics/render overlap.
- Animation may provide a typed synchronization request, but Combat Runtime remains damage authority.
- Same-tick outcome ordering and source provenance: When multiple damage/heal/reaction effects target the same entity in one gameplay boundary, the owning combat/health system must apply a deterministic accepted ordering rather than inherit physics-callback or container iteration order.
- A committed hit/damage result should retain stable source/provenance information sufficient for diagnostics and gameplay meaning even if the originating projectile/entity despawns before later feedback or death processing.
- Death is a semantic state transition and must be idempotent for one accepted death generation.
- ALIVE -> DYING / DEATH_COMMITTED where used -> DEAD.
- Repeated contact/event delivery must not produce duplicated death rewards, objectives, drops, sequences or save mutations unless an explicit repeatable rule owns them.
- Health/damage inputs and derived results must reject or contain non-finite numeric values rather than allow NaN/Infinity to poison runtime state.
- DEAD -> cannot silently return to ALIVE through an ordinary Heal action.
- If a future supported profile admits revival/resurrection, it requires an explicit semantic transition and save/animation/combat integration.
- Container/callback order must not decide whether the entity dies or survives.
- A DYING/death-committed entity cannot receive ordinary healing that invalidates an already committed death transition unless an explicitly admitted revival contract owns that behavior.
- Ownership: RSM-62 -> authoritative attack/hit/damage/health/reaction/death resolution owner.

##### GPC-03 — Projectile & Hazard Runtime Lifecycle

- Projectile and gameplay hazard semantics must be real RetroStage runtime entities or equivalent bounded runtime semantic owners.
- They must not exist solely as renderer/particle objects.
- Canonical direction.
- Attack / Gameplay Action -> ProjectileSpawnRequest / HazardSpawnRequest -> Runtime Entity Lifecycle -> Collision / Query -> Hit Result -> Combat Resolver -> Damage -> Despawn / Persist according to policy.
- Every projectile/hazard contract should resolve.
- spawn provenance owner / instigator runtime entity identity lifetime collision eligibility self/friendly-hit policy per-target hit policy despawn policy section-unload behavior checkpoint-restore behavior save participation.
- Ownership: RSM-23 -> runtime spawn/despawn ownership.
- RSM-51 -> constrained physics/collision interaction where applicable.
- RSM-62 -> hit/damage authority.

##### GPC-04 — Death / Retry / Encounter Reconstruction

- Retry Last Checkpoint must not be treated as an arbitrary scene reload.
- Registered gameplay state must reconstruct deterministically from approved checkpoint/runtime-save semantics.
- A checkpoint/save capture must represent one coherent accepted runtime boundary.
- Registered systems must not contribute a mixed-generation snapshot in which inventory is from tick N, enemy state from tick N+1 and objective state from another transition boundary.
- The runtime-save owner should bind the candidate capture to one stable runtime/session/save capture generation (or equivalent coherent boundary identity).
- Partial capture/validation failure must abort the candidate and preserve the previous valid generation.
- SAVEABLE_PROGRESS RECONSTRUCTABLE_DERIVED_STATE TRANSIENT_RESET_ON_RESTORE_STATE NOT_SAVE_ELIGIBLE.
- player transform/spawn player health inventory subset objective/story state enemy state spawn/despawn state projectiles hazards doors/interactions registered puzzle state eligible timers required RNG provenance approved atmosphere/gameplay state.
- Raw engine objects must not become save truth.
- Reconstructing semantic state must not accidentally re-fire one-shot effects such as.
- RESTORE / HYDRATE vs LIVE GAMEPLAY COMMIT.
- and emit only explicitly approved post-restore reconciliation/presentation events.
- Effect-idempotency rules from the runtime architecture remain applicable.
- saved semantic restore pose -> validate destination Scene / Section generation -> validate owning entity/profile compatibility -> validate collision / ground / clearance / traversal constraints where required -> if valid: restore accepted pose else: attempt only an explicitly authored compatible fallback restore anchor/policy else: fail/block with creator/player-diagnosable recovery.
- Systems should classify runtime state into.
- Raw physics-body pose, stale collision contact or renderer transform is not restore authority.

##### GPC-05 — Bounded Gameplay Conditions

- RetroStage should support bounded horror/action conditions without becoming a generic RPG buff/debuff/stat engine.
- Minimum condition contract.
- conditionId source start identity duration policy tick policy stack policy refresh policy removal policy save participation gameplay hooks presentation hooks.
- Condition duration/ticking must bind to an explicit RetroStage clock/domain and declare pause, time-scale and hit-stop behavior. Raw platform timers must not become condition authority.
- Repeated scheduler/event delivery must not double-apply a semantic condition tick. Tick/periodic effects should have stable occurrence identity or equivalent idempotency semantics where required.
- Restore must reconstruct condition state from approved semantic duration/tick state without replaying already committed damage/healing ticks.
- Candidate built-in semantic conditions.
- POISONED BURNING BLEEDING SLOWED INJURED.
- Not every GameProfile must expose every condition.
- Explicit anti-scope: This alignment does not authorize.
- generic stat modifier stacks large resistance matrices attribute systems MMO/RPG buff frameworks.
- Ownership: RSM-62 -> bounded gameplay-condition runtime.
- RSM-65 -> save participation.
- RSM-70 -> creator-facing diagnostics.
- Condition duration/ticking must bind to an explicit RetroStage clock/domain and declare pause, time-scale and hit-stop behavior.
- Raw platform timers must not become condition authority.
- Repeated scheduler/event delivery must not double-apply a semantic condition tick.
- Tick/periodic effects should have stable occurrence identity or equivalent idempotency semantics where required.

##### GPC-06 — First-Class Protagonist Runtime Ownership

- The protagonist must not remain only an accidental combination of generic Entity + Movement components.
- A first-class semantic PlayerProfile / ProtagonistDefinition should own or reference.
- player identity spawn / restore behavior MovementProfile CameraProfile InteractionProfile HealthProfile InventoryProfile CombatProfile AnimationSet FeedbackProfile InputActionMap Footstep / GameplayNoise profile optional ActionResourceProfile save participation.
- This must not become a giant opaque god-object.
- It references bounded subsystem profiles while preserving each subsystem's own authority.
- First owner seam: RSM-17.
- should make the first protagonist runtime identity explicit, with later owners enriching the referenced profiles.

##### GPC-07 — Character / NPC / Enemy Animation Continuity

- This contract is expanded in PART III.
- Gameplay/AI systems must expose typed animation-facing semantics rather than direct raw clip playback.

##### GPC-08 — Root-Motion Ownership Policy

- This contract is expanded in PART III.
- Canonical default.
- IN_PLACE_LOCOMOTION.
- Gameplay movement/collision/navigation remains movement authority.

##### GPC-09 — Optional Action Resource / Stamina

- PROFILE-GATED / NOT ALPHA-MANDATORY.
- A bounded action-resource seam may support use cases such as.
- stamina flashlight battery other small profile-owned temporary resource.
- This does not authorize a general mana/energy/RPG resource framework.

##### GPC-10 — Difficulty Profile

- PROFILE-GATED / NOT CORE.
- If a difficulty selector is exposed, it must resolve through a typed DifficultyProfile authority rather than arbitrary scripting.
- Candidate bounded controls may include.
- enemy damage player damage received enemy perception resource availability ammo availability healing availability checkpoint policy.
- If no first-product difficulty selector is exposed, implementation may remain deferred.

##### GPC-11 — Gameplay Query Normalization & External Callback Barrier

- Gameplay meaning must not inherit that incidental order.
- Gameplay-relevant engine/backend callbacks and query results are inputs to RetroStage semantic resolution, not direct mutation authority.
- Havok / Babylon / navigation callback or query -> adapter normalization -> stable RetroStage query/contact identity -> eligibility/filtering -> deterministic ordering / tie-break where order matters -> owning gameplay phase -> semantic commit.
- Required query semantics: Where applicable, a gameplay query should define.
- query identity owner / session generation query type filter/channel/mask origin / shape stable target identity distance / hit fraction where applicable surface/contact semantics deterministic tie-break stale-owner rejection.
- hitscan first valid hit -> nearest accepted distance -> stable target/subshape tie-break.
- interaction target -> explicit interaction priority -> distance/angle policy -> stable identity tie-break.
- The exact policies remain subsystem-owned, but raw backend iteration order cannot decide gameplay.
- Trigger/contact lifecycle: Gameplay triggers should resolve stable semantic overlap/contact lifecycle where used.
- ENTER STAY / ACTIVE EXIT.
- with explicit teardown/unload behavior.
- Contact chatter or duplicated backend callbacks must not repeatedly commit one-shot objectives, damage, pickups or interaction results.
- Mutation barrier: A raw physics/navigation/renderer callback must not directly write authoritative gameplay state.
- This extends the existing worker mutation barrier to gameplay-facing adapter callbacks without creating a second event system.

##### GPC-12 — Item / Inventory / Progression Transaction Semantics

- world pickup inventory door / puzzle target objective container save point.
- A partial commit can lose or duplicate critical progression state.
- Consequential item/progression operations must use a bounded semantic transaction/commit contract.
- Representative operations include.
- pickup world item -> inventory inventory -> container container -> inventory consume item use key on lock A + B -> C combine healing consumable ammo transfer critical-item discard protection save-token consumption objective-triggered item grant/removal.
- Required transaction properties: Where an operation crosses more than one semantic owner, it should provide.
- Core invariant: ITEM REMOVED FROM SOURCE and ITEM/RESULT NOT COMMITTED TO TARGET.
- must not be a normal failure outcome.
- Likewise duplicate event delivery must not duplicate unique/key/progression items.
- Key / lock example: Preferred semantic direction.
- Interaction Attempt -> validate target + key possession + lock state -> commit unlock/use policy -> inventory consumption only if policy requires it -> objective/event consequences.
- A failed unlock must not consume the key.
- Limited-resource save example: If a Save Point consumes a token, token consumption and successful save promotion must have an explicit failure-safe policy.
- A failed save must not silently consume the token while preserving only the previous save generation.
- The implementation may reserve first and commit consumption only after successful save promotion, or use another reviewed equivalent, but the user-visible result must be atomic/failure-safe.
- RSM-46+ interaction RSM-50 inventory/items/puzzles RSM-65 runtime save/checkpoint RSM-69 recipes RSM-70 diagnostics.
- Ownership: Primary cross-milestone owners include.
- operation / transaction identity expected source state expected target state eligibility validation reservation or equivalent pre-commit protection where needed single semantic commit boundary idempotency key failure result rollback/no-op semantics diagnostics.

##### GPC-13 — Runtime Motion / Displacement Arbitration

- player/NPC locomotion kinematic platform/base motion collision resolution knockback / impulse root-motion request scripted/sequence move teleport / spawn / restore navigation steering.
- If each subsystem writes the transform independently, ordering-dependent jitter, tunneling, double movement or stale transform overwrites can result.
- Each controlled runtime entity should have one authoritative movement/displacement commit path per applicable movement phase.
- movement intents / displacement requests -> priority + mode arbitration -> collision / movement authority -> accepted displacement / transform -> post-move semantic state -> presentation projection.
- Required displacement classes: The exact model may vary by profile, but should distinguish materially different semantics such as.
- LOCOMOTION_INTENT EXTERNAL_IMPULSE / KNOCKBACK BASE / PLATFORM MOTION ROOT_MOTION_REQUEST SCRIPTED / SEQUENCE MOTION TELEPORT / SNAP / RESTORE.
- Required rules: Teleport/restore is not ordinary velocity integration.
- Root motion remains a request and never directly overwrites world transform.
- Kinematic platform transport must not double-apply character locomotion.
- Knockback/stun interaction with player/AI locomotion must be explicit.
- it does not own the final engine transform.
- Collision solver/backend body handles remain adapters, not semantic movement identity.
- Movement results should reject/contain non-finite displacement/velocity values.
- which movement source won which requests were rejected/deferred collision-limited displacement teleport/reset knockback interruption root-motion requested vs accepted platform/base contribution.
- Required rules: Teleport/restore is not ordinary velocity integration. - Root motion remains a request and never directly overwrites world transform. - Kinematic platform transport must not double-apply character locomotion. - Knockback/stun interaction with player/AI locomotion must be explicit. - Navigation steering produces movement intent.
- it does not own the final engine transform. - Collision solver/backend body handles remain adapters, not semantic movement identity. - Transform commits from a stale runtime/session generation are rejected. - Movement results should reject/contain non-finite displacement/velocity values.

##### GPC-14 — Weapon / Ammo / Reload Transaction Semantics

- Otherwise common bugs include.
- ammo consumed but no shot committed shot committed twice reload duplicated after interruption magazine refilled while reserve ammo is not decremented save/load duplicating an in-progress reload.
- A weapon runtime should use explicit semantic shot/reload instances and resource commit points.
- Shot lifecycle: A representative shot flow.
- Fire Request -> action/weapon eligibility -> ShotInstance accepted -> ammo/resource commit according to weapon policy -> hitscan query OR projectile spawn commit -> recoil / cooldown / feedback.
- The exact point of ammo consumption may differ for supported profiles, but must be deterministic, documented and failure-safe.
- If a shot cannot be semantically committed, ammunition must not disappear merely because an input or animation began.
- Reload lifecycle: Reload should distinguish at least.
- REQUESTED STARTED COMMIT_POINT COMPLETED INTERRUPTED.
- or equivalent semantics.
- Magazine/reserve transfer should occur at an explicit reviewed commit point.
- Interruption before/after that point must have deterministic resource results.
- Save eligibility: If in-progress reload/fire states are not safely serializable, Save Eligibility should defer/block rather than guess.
- If they are save-eligible, semantic resource/action state must restore without duplicated consumption or refilling.
- Identity: Weapon/ammo state must use RetroStage stable item/runtime identities rather than presentation clip, audio cue or transient engine object identity.

##### GPC-15 — Perception Stimulus / Target Arbitration

- Raw event/callback order must not make enemy behavior unstable.
- Perception should normalize accepted stimuli and use deterministic bounded target/stimulus arbitration.
- Representative stimulus identity should include where applicable.
- stimulus identity stimulus type source stable identity position strength / salience semantic clock/time owner/session generation expiry / memory policy.
- Required arbitration: When multiple relevant stimuli compete, the Perception Profile/AI owner should define bounded rules for.
- priority / salience distance or recency where semantically relevant current-target stickiness / hysteresis memory stable tie-break target invalidation.
- Required safeguards: Two equal stimuli must not cause frame-to-frame target flicker due to container order. - Destroyed/unloaded targets must invalidate cleanly. - Stale stimuli from a prior runtime-session generation cannot regain authority. - Audible audio volume remains separate from GameplayNoise semantics. - Renderer luminance remains separate from gameplay visibility/perception truth. - Search/last-known state uses semantic memory, not raw renderer/physics pointers.
- Diagnostics: AI trace should explain why a target/stimulus won and why it was later replaced, forgotten or invalidated.

##### GPC-16 — Camera-Control Transition Continuity

- During a camera authority change, a held movement/aim input can be reinterpreted against a new camera basis and cause an abrupt direction flip unless the profile owns a transition rule.
- Every camera/control profile that can change movement interpretation during gameplay should define a bounded held-input transition policy.
- Candidate policy directions.
- IMMEDIATE_REMAP PRESERVE_WORLD_INTENT_UNTIL_RELEASE REBASE_AT_TRANSITION_BOUNDARY TANK_CONTROLS_UNAFFECTED.
- Exact names may differ.
- Required semantics: A camera cut/blend should explicitly define where applicable.
- movement basis before transition movement basis after transition held directional input handling aim state handling target-assist handoff pointer/cursor capture behavior action-buffer interaction camera-transition lock if used.
- Critical invariant: A fixed-camera cut must not accidentally reverse or rotate the player's held movement because the input vector was silently re-read in a new camera basis with no declared policy.
- Integration: This contract binds.
- CameraProfile MovementProfile Player Action Arbiter input semantic actions camera transition safety.
- without creating a second camera or input authority.
- Acceptance fixture: A representative fixed-camera fixture should test.
- player holds movement -> camera cut / blend occurs -> declared control-transition policy applies -> no unexplained direction snap -> release / next input behaves predictably.
- and should also cover aim/interaction behavior where the chosen profile uses them.

##### GPC-17 — Interaction Session / Revalidation / Commit Contract

- A target that was valid at interaction start may become invalid before commit because of.
- movement out of range line-of-sight change target disable/despawn Scene/Section unload required item/state change target already consumed/used session replacement competing interaction/sequence commit.
- Any non-trivial interaction should use a semantic interaction session/attempt identity.
- Representative lifecycle.
- CANDIDATE -> REQUESTED -> ACCEPTED -> HOLDING / PREPARING where applicable -> REVALIDATE -> COMMITTED -> COMPLETED.
- or.
- REJECTED CANCELLED INVALIDATED.
- Exact names may differ.
- Required identity: Where material.
- interactionSessionId source/interactor stable identity target stable identity interaction definition/type runtime/session/Scene/Section generation start semantic time hold/progress state required conditions/items.
- Commit-time revalidation: Before a consequential interaction commits, the owner revalidates the material conditions.
- target still exists / same generation interaction still enabled range still valid where required line of sight still valid where required interactor still eligible required item/state still valid target not already committed/consumed Save/Scene/Sequence policy still allows the operation where relevant.
- Hold/toggle safety: Hold progress binds to the interaction session and declared semantic clock.
- Changing target, losing focus, leaving range or invalidating the owner cancels/restarts according to the interaction definition.
- old progress cannot jump to a new target.
- Duplicate requests cannot commit the same one-shot interaction twice.

##### GPC-18 — Item Runtime Identity / Stack / Slot / Reference Integrity

- pickup split merge consume discard combine equip quick-slot container transfer save/restore.
- The runtime must explicitly distinguish.
- ItemDefinitionId is not ItemRuntimeInstanceId is not InventoryEntry / Stack identity is not Slot identity is not Container identity.
- Exact representation may vary by item family.
- Where applicable.
- quantity is finite integer/allowed bounded numeric form quantity >= 0 zero-quantity semantics are deterministic stack max/min constraints are enforced unique/progression item duplication policy is explicit container capacity/rules are validated equipped/quick-slot references target stable semantic IDs array/list index is never durable item identity.
- Stack operations: Split/merge should define.
- source identity destination identity quantity capacity compatibility single semantic commit rollback/no-op on failure.
- No successful operation may produce negative quantity, over-capacity quantity, duplicated unique identity or dangling equipped/quick-slot references.
- Consume/delete/reference invalidation: When an item/stack is exhausted or removed, dependent references must deterministically.
- They must not remain dangling references.
- Combine: A + B -> C uses GPC-12/SYS-04 transaction semantics and must not leave.
- A consumed B retained accidentally C granted twice.
- after duplicate delivery or partial failure.
- Save/restore: Runtime Save preserves stable semantic item/container/equipment relationships.
- Restore validation should reject/repair only according to explicit supported migration/recovery policy.
- it must not silently invent missing unique/progression items.
- clear rebind to an explicitly valid replacement or enter diagnosed unavailable state.

##### GPC-19 — Constrained Physics Mode / Transform Ownership Transition

- authored/kinematic movement dynamic physics simulation player carry/hold constraint/joint scripted/sequence motion restore/teleport parent/attachment motion.
- If more than one owns transform/velocity simultaneously, the result can be.
- jitter explosive impulse teleport tunneling stuck objects NaN/Infinity velocity player launch.
- ONE PHYSICAL TRANSFORM AUTHORITY AT A TIME.
- for each constrained physics runtime object.
- Representative bounded modes may include.
- KINEMATIC_DRIVEN DYNAMIC_SIMULATED HELD / CONSTRAINED SCRIPTED / SEQUENCE_DRIVEN RESTORING / DISABLED.
- Exact profile vocabulary belongs to RSM-51 implementation.
- Transition protocol: A mode transition should conceptually perform.
- validate requested transition -> release old authority / constraints -> normalize or preserve velocity according to policy -> apply required pose/attachment/constraint state -> activate new authority -> post-transition validation.
- at an accepted runtime/physics phase boundary.
- Required rules: Picking up a dynamic prop cannot leave free simulation fighting the held transform.
- Dropping a held object must define inherited/cleared velocity behavior.
- Scripted/Sequence motion cannot fight dynamic simulation unless an explicit bounded handoff is performed.
- Restore/teleport is not ordinary physics integration.
- Parent/attachment changes must not leave stale constraints.
- Non-finite position/velocity/impulse values are rejected/contained.
- Engine body/constraint object identity remains an adapter, not semantic mode identity.
- If a mode cannot be safely serialized, Save Eligibility must defer/block rather than guess.
- Required rules: Picking up a dynamic prop cannot leave free simulation fighting the held transform. - Dropping a held object must define inherited/cleared velocity behavior. - Scripted/Sequence motion cannot fight dynamic simulation unless an explicit bounded handoff is performed. - Restore/teleport is not ordinary physics integration. - Parent/attachment changes must not leave stale constraints. - Non-finite position/velocity/impulse values are rejected/contained. - Engine body/constraint object identity remains an adapter, not semantic mode identity.

##### GPC-20 — AI State / Action / Navigation Request Arbitration

- Perception Combat Damage/Stun/Death Navigation Sequence Scripted typed action Encounter/phase logic.
- Raw callback/event order must not decide the AI's authoritative state.
- Enemy/NPC runtime should have one semantic state/action arbitration authority.
- Perception / Combat / Navigation / Sequence / Encounter inputs -> typed AI transition/action requests -> AI state authority -> deterministic priority / interruption / eligibility -> accepted state/action -> movement/navigation/action requests.
- State semantics: Supported archetypes may use bounded states such as.
- IDLE PATROL INVESTIGATE CHASE ATTACK STUNNED RETURN DEAD.
- but AI state is semantic runtime state, not AnimationGraph state.
- Deterministic competing transitions: The profile/runtime contract should define bounded priority/interruption rules.
- For example, an already committed DEAD transition cannot be overwritten by a late ATTACK request.
- STUNNED vs CHASE behavior must be explicit, not callback-order dependent.
- Navigation request identity: Where pathfinding is asynchronous or generation-based, a path/navigation request should bind.
- pathRequestId AI owner stable identity AI owner generation target stable identity target generation navigation topology generation request semantic time/phase.
- A stale path completion cannot overwrite a newer target or topology generation.
- Invalid targets: Destroyed/unloaded/invalidated targets must clear/re-resolve through semantic rules.
- Diagnostics: AI trace should explain.
- requested state/action accepted winner rejected/deferred requests target changes path request generation stale path rejection interrupt reason.

##### GPC-21 — Encounter / Activation / Phase Transition Contract

- Activation/phase transitions may be triggered by.
- health threshold Story State Objective player presence timer/clock Dialogue/Sequence Event/Action enemy count.
- Without one transition occurrence identity, duplicate triggers can replay phase consequences.
- Every active encounter should have stable semantic runtime identity.
- Representative state.
- encounterInstanceId encounterDefinitionId activation generation current phaseId pending/accepted transition identity owned spawned-entity identities/provenance runtime/session/Scene/Section generation save participation.
- Activation: Encounter activation is a consequential semantic transition.
- Duplicate activation requests cannot create duplicate encounter instances/spawns for one accepted activation generation.
- Phase transition: Representative flow.
- current phase -> evaluate pure transition predicates under SYS-08 -> deterministically resolve competing eligible transitions -> commit exactly one accepted phase transition -> run phase-exit/phase-enter consequences exactly once.
- Competing phase transitions have deterministic authored/runtime resolution.
- Phase actions use Event/Action and owning subsystem contracts under SYS-04/SYS-05.
- Spawned enemies/props receive normal RSM-23 runtime identity/provenance.
- Scene/Section unload/transition follows SYS-02.
- DEAD/completed encounter states cannot be overwritten by stale phase requests.
- Restore of Phase 2 must not replay the Phase 1 -> Phase 2 transition actions merely because the runtime reconstructs Phase 2 presentation/entities.
- Where runtime-spawned encounter entities participate in save, their stable provenance/identity and restoration policy must prevent duplicate spawn on hydration.

##### GPC-22 — Puzzle / Mechanism State & Exactly-Once Transition Contract

- key / lock item-on-target multi-slot puzzle keypad / code puzzle A+B -> C combination containers shared item box high-level save-safe puzzle state.
- Item transactions alone do not define puzzle/mechanism state.
- Without an explicit owner, duplicate Event/Action delivery or restore can replay.
- OnSolved door unlock objective start item grant sequence trigger audio/VFX.
- after the puzzle already committed.
- Each runtime puzzle/mechanism instance should have stable semantic identity and bounded state/ transition ownership.
- Representative state.
- puzzleInstanceId puzzleDefinitionId current semantic state stable slot/input identities where applicable accepted transition/operation identity runtime/session/Scene/Section generation save participation.
- RetroStage may support focused models such as.
- LOCKED / UNLOCKED INCOMPLETE / SOLVED multi-slot occupancy keypad/code acceptance container state item-on-target state bounded mechanism position/state.
- without introducing a general puzzle scripting language.
- Consequences use normal Event/Action and owning subsystem contracts under SYS-04/SYS-05.
- Slot identity: For multi-slot puzzles.
- slotId is not UI index is not mesh-child index.
- A slot references stable semantic item/requirement identity.
- One ItemRuntimeInstance cannot occupy multiple exclusive slots through duplicated delivery.
- Solved-state invariant: A non-resettable SOLVED state is idempotent.
- If reset/rearm behavior is supported, it must be explicit.
- restore SOLVED is not execute OnSolved again.
- Raw door transforms, animations, keypad UI, VFX/audio and Babylon objects are not puzzle truth.

##### GPC-23 — Hiding Spot / Concealment Session Contract

- locker / closet / under-object enter / exit peek player visibility/noise changes enemy search interaction camera/UI behavior safe exit conditions.
- A hiding spot cannot safely be only player.hidden = true.
- Hiding uses a semantic concealment session.
- Representative lifecycle.
- AVAILABLE -> ENTER_REQUESTED -> ENTER_VALIDATED -> ENTER_COMMITTED -> HIDDEN.
- HIDDEN -> EXIT_REQUESTED -> EXIT_VALIDATED -> EXIT_COMMITTED -> AVAILABLE.
- with bounded CANCELLED, INVALIDATED and FORCED_EXIT paths where supported.
- Representative identity.
- hidingSessionId hidingSpotId player/runtime entity identity entry anchor exit anchor(s) concealment profile runtime/session/Scene/Section generation.
- Entry validation: Entry revalidates.
- spot exists / same generation spot available player eligible entry clearance/placement valid interaction requirements valid occupancy valid.
- Concealment semantics: HIDDEN may modify bounded.
- player visibility/concealment class GameplayNoise behavior enemy search eligibility movement/action availability camera/control policy UI presentation.
- through existing owners.
- Renderer visibility alone is not concealment truth.
- Exit safety: Before exit commit.
- destination Scene/Section valid collision/clearance valid exit not blocked authored fallback-exit policy valid where needed.
- must pass.
- The player cannot be forced through locked geometry or into an invalid Section merely to exit.
- Teardown / save: Death, session replacement and Scene/Section unload release only this session's scoped movement, camera, UI, perception and audio ownership.
- If exact hiding state cannot be safely reconstructed, hiding contributes DEFERRED/BLOCKED to SYS-03 rather than serializing raw camera/collision/widget state.

##### GPC-24 — Combat Target Eligibility / Bounded Affiliation Contract

- Can this source affect this target?
- Private per-attack "friendly" rules would drift.
- RetroStage should provide a small bounded combat-affiliation/target-eligibility contract.
- This is not a faction diplomacy system.
- Representative classes/profiles may express.
- PLAYER HOSTILE FRIENDLY NEUTRAL WORLD / DESTRUCTIBLE where supported.
- or project-defined bounded equivalents.
- Eligibility flow: attack / projectile / hazard candidate -> stable source + target identity validation -> self-hit policy -> affiliation/relation eligibility -> target capability / alive / hurtbox eligibility -> attack-specific filtering -> combat commit.
- The same contract is shared by supported melee, hitscan, projectile, area/hazard, enemy attacks and player attacks.
- Required safeguards.
- self-hit is explicit.
- same-affiliation hit policy is explicit.
- neutral/noncombat targets require explicit eligibility.
- dead/despawned/unloaded targets cannot become eligible via stale callbacks.
- renderer layer/material/mesh name/navigation class do not define affiliation.
- This does not admit diplomacy, reputation or large social/faction graphs.

##### GPC-25 — Bounded Damage Response Profile

- Canonical scope includes simple combat, defensive stun/repel, bounded Damage Type, enemy health/reaction profiles and unkillable-pursuer patterns.
- Combat targets may reference a bounded DamageResponseProfile.
- Representative responses.
- APPLY_DAMAGE APPLY_DAMAGE_AND_STAGGER STUN_ONLY REPEL_ONLY REACTION_ONLY IMMUNE.
- Small bounded multipliers/thresholds may be admitted only within the existing Damage Type scope.
- Resolution: accepted hit / damage source -> Damage Type / Attack Profile -> target DamageResponseProfile -> bounded response -> Combat Runtime commits health/stagger/stun/repel/reaction -> animation/VFX/audio presentation.
- Example unkillable pursuer.
- NORMAL_DAMAGE -> REACTION_ONLY DEFENSIVE_STUN -> STUN_ONLY REPEL -> REPEL_ONLY.
- DamageResponseProfile is not an animation clip, VFX tag or renderer/material property.
- This does not create a large elemental/resistance, armor or RPG matrix.

##### GPC-26 — Character Physical Stance / Grounding / Clearance Contract

- Animation pose cannot own physical collision state.
- A controlled character has one semantic physical-stance/grounding owner integrated with GPC-13.
- Representative states.
- STANDING CROUCHED.
- and, where simple jump is supported.
- GROUNDED AIRBORNE.
- Stance transition: STANCE REQUEST -> validate action/player state -> collision/clearance query -> commit physical stance -> reconcile movement/collision -> project compatible animation stance.
- CROUCHED -> STANDING cannot commit without required clearance. If blocked, remain crouched.
- Grounded/airborne meaning derives through movement/physics authority at the accepted phase, not animation or arbitrary contact callback order.
- Profile-gated simple jump uses.
- GROUNDED -> JUMP COMMIT -> AIRBORNE -> LAND / GROUNDED.
- without becoming a platformer/traversal framework.
- Animation stance is not physical stance authority.
- raw Havok contact is not final grounded state.

##### GPC-27 — Playable Boundary / Recovery Volume Contract

- Projects/scenes may author stable playable-boundary/recovery volumes with bounded response policies.
- BLOCK DAMAGE KILL / RETRY RESET_TO_AUTHORED_ANCHOR RETURN_TO_CHECKPOINT.
- Representative identity.
- boundary/recovery volume identity affected entity/profile class response policy authored recovery anchor where required runtime/session/Scene/Section generation.
- Recovery invariant: RESET_TO_AUTHORED_ANCHOR uses an explicit compatible semantic anchor.
- A generic nearest-nav-point teleport is not a safe default because it may bypass doors, hazards, objectives, story boundaries or encounters.
- One accepted out-of-bounds occurrence commits one recovery consequence.
- duplicated overlap/contact callbacks cannot multiply the same recovery.
- Recovery integrates with GPC-04 restore placement and normal checkpoint/session authority.
- Recovery volumes are not hidden save checkpoints unless explicitly authored as such.

##### GPC-28 — Surface Semantic Profile

- If gameplay meaning is inferred from renderer material names, an art-only change can alter AI hearing or impact behavior.
- RetroStage should use a stable SurfaceProfile semantic identity.
- Representative outputs may include.
- footstep audio cue family GameplayNoise response/profile impact audio family impact VFX family optional decal family optional bounded physical-material semantics.
- Core invariant: SurfaceProfile is not Babylon Material is not texture name is not mesh display name.
- A visual material may reference a SurfaceProfile for authoring convenience, but rendering identity is not gameplay truth.
- Contact flow: movement / hit / contact query -> GPC-11 normalized contact -> stable SurfaceProfile -> owning response: footstep GameplayNoise impact audio impact VFX bounded physics response where admitted.
- A footstep occurrence uses character/movement occurrence identity + contacted SurfaceProfile + movement/stance profile.
- Duplicate animation marker/contact delivery cannot emit two AI-hearing noises for one semantic footstep.
- Surface bindings survive compatible reimport by stable RetroStage identity.
- This is not a full physical-material, terrain deformation, footprint or fluid simulation system.

##### GPC-29 — Stealth Visibility / Illumination Gameplay Semantic Contract

- Canonical RSM-61 integrates perception with lighting direction, but gameplay visibility must never be inferred from arbitrary final rendered brightness or GPU output.
- Otherwise changing.
- shadow quality fog fallback exposure LUT/post-process internal resolution GPU/hardware behavior.
- could silently alter enemy detection.
- Stealth illumination therefore uses RetroStage-owned gameplay semantics. A bounded GameplayVisibilityProfile, IlluminationExposure or equivalent may derive from.
- authored gameplay-light contribution semantic light on/off state concealment/hiding state surface/zone modifiers where supported player stance/movement distance/occlusion queries explicit stealth-profile settings.
- If a lamp intentionally affects both presentation and stealth.
- Lamp semantic state = OFF ├─ visual owner updates the rendered light └─ gameplay visibility owner updates semantic illumination contribution.
- Both consume the same semantic state.
- gameplay does not sample renderer pixels.
- Graphics quality/accessibility/fallback changes cannot silently change gameplay detection meaning.
- Perception diagnostics should explain the semantic visibility contribution used for a decision.
- This does not authorize physically accurate light transport or a general stealth-light simulator.

#### Authority placement: §9.15.2 Inventory/item authority and transaction contracts (new under §9, after §9.14)

##### INV-00 — Inventory Ecosystem Authority / Bounded Product Scope Contract

- Objective: RetroStage's inventory stack must be a bounded horror/mystery/action-horror gameplay domain, not a disguised general-purpose RPG/economy engine.
- The inventory ecosystem owns semantic answers such as.
- What item definition is this?
- Which runtime item instance/stack is possessed?
- Which inventory/container owns it?
- Which slot/reference points to it?
- Can it be picked up, used, consumed, combined, equipped, dropped or discarded?
- What transaction committed that change?
- It does not own.
- Health truth Combat damage truth AI state Story flags that belong to Story State Objective state Puzzle solved state Equipment socket/rig meaning player-UI widget state Babylon mesh/node state.
- Those domains remain with their existing owners and are reached through typed operations/queries.
- Bounded product scope: First-product inventory capability may include.
- Key / progression items Puzzle items Consumables / healing items Ammo Weapons Readables / documents Clues/evidence references Utility equipment bounded Custom Items composed only from admitted item capabilities local/shared containers quick slots fixed authored rewards/drops bounded fixed exchange/vendor behavior when the accepted optional/profile-gated INV-07 capability is enabled.
- Still excluded.
- general RPG item-stat framework procedural loot / rarity / affixes unbounded crafting tree encumbrance/weight simulation as a core system dynamic market/economy simulation reputation-driven prices merchant AI/economic simulation auction/marketplace/trading network unrestricted item scripting.
- Existing GPC-12, GPC-18, EQP-01..07, GPC-14, GPC-22, SYS-04, SYS-05, SYS-08, SAV-*, RUI-* and CUX-* remain authoritative.
- This family specializes their inventory application.
- it does not create a global god-object inventory manager.
- What item definition is this? Which runtime item instance/stack is possessed? Which inventory/container owns it? Which slot/reference points to it? Can it be picked up, used, consumed, combined, equipped, dropped or discarded? What transaction committed that change?

##### INV-01 — Item Definition Capability Composition / Runtime Instance Contract

- An ItemDefinition is immutable project-authored meaning.
- Runtime possession is represented by runtime item/stack state derived from that definition.
- A bounded item definition should be composition-oriented rather than a deep item-class hierarchy.
- Representative first-party capability blocks may include.
- Presentation Stack / Quantity World Pickup Use / Consume Equip Ammo Combine Readable / Inspect Critical / Progression Protection Quick-Slot Eligibility Bounded Exchange Eligibility.
- Exact schema names are owner-defined.
- Capability blocks are typed RetroStage data, not arbitrary plugin fragments or executable scripts.
- Representative definition facts: Where applicable.
- ItemDefinitionId display/localization references icon / inspect / world-presentation references item category/tags stack policy + max quantity supported semantic actions critical/progression-loss policy InventoryProfile/category compatibility equipment/ammo/recipe references world pickup/drop policy creator-authored fallback behavior.
- Runtime identities: The existing GPC-18 distinctions remain binding.
- Unique / progression items: Unique or progression-critical items must declare duplication/loss semantics explicitly.
- A critical item cannot disappear because a UI action, container transfer, failed drop spawn, combine failure or stale async callback partially committed.
- Custom items: A bounded Custom Item may compose only supported capabilities/actions.
- CUSTOM ITEM is not arbitrary user runtime class is not arbitrary JavaScript callback is not unrestricted effect scripting.
- If a requested item behavior cannot be expressed through owned typed actions/conditions, it is unsupported until an explicit owner/capability is admitted.
- An ItemDefinition is immutable project-authored meaning. Runtime possession is represented by runtime item/stack state derived from that definition.
- Exact schema names are owner-defined. Capability blocks are typed RetroStage data, not arbitrary plugin fragments or executable scripts.

##### INV-02 — Inventory Profile / Container / Slot / Capacity / Transfer Contract

- Inventory profile: Inventory semantics and player-facing visual skin remain separate.
- A project/profile may support bounded inventory models such as.
- UNLIMITED_LIST FIXED_SLOTS SIMPLE_GRID_OVER_SLOT_SEMANTICS.
- Spatial footprint/case packing remains separately gated by the canonical roadmap and is not implied by this contract.
- An InventoryProfile may define supported policy such as.
- capacity model slot count where applicable allowed item categories stack behavior quick-slot availability critical-item rules default container presentation hints.
- This does not add general weight/encumbrance simulation.
- Container definition vs runtime instance: Explicitly distinguish.
- ContainerDefinitionId is not ContainerRuntimeInstanceId is not ContainerSlotId is not InventoryEntry / Stack identity.
- Supported bounded container families may include.
- PLAYER_INVENTORY LOCAL_CONTAINER SHARED_STORAGE / ITEM_BOX PROFILE-SPECIFIC SPECIAL CONTAINER.
- A container definition may describe.
- capacity policy slot/category rules persistence/reset policy local vs shared scope transfer permissions empty/full behavior presentation references.
- Local vs shared storage: Local container contents belong to that semantic container instance.
- Transfer transaction: Moving items between player inventory and a container is one consequential operation under GPC-12/SYS-04.
- validate source identity + quantity validate destination identity + capacity/category rules validate session/generation reserve / stage transfer commit source decrement/removal commit destination add/merge repair stable slot/quick-slot/equipment references if required emit one accepted result.
- Partial transfer failure must not lose or duplicate items.
- A React/DnD/widget list operation never edits canonical/runtime inventory arrays directly.
- UI gestures are not mutation authority: Drag/drop, controller move, context menu and keyboard transfer are input gestures.
- UI gesture -> typed TransferItem command/request -> inventory/container authority -> revalidation -> commit.

##### INV-03 — World Pickup / Drop / Discard / Critical-Loss & Respawn Contract

- Distinct operations: RetroStage must not alias.
- PICKUP DROP_TO_WORLD DISCARD_DESTROY.
- DROP_TO_WORLD creates or transfers to a world item occurrence according to the owning item policy.
- DISCARD_DESTROY intentionally removes the possessed semantic item/quantity.
- They have different eligibility, save and recovery behavior.
- World occurrence identity: A supported world pickup/drop should have stable semantic occurrence/provenance sufficient to answer.
- which item/quantity does this occurrence represent?
- was it authored, rewarded, enemy-dropped or player-dropped?
- has it already been picked up?
- is it allowed to respawn/reset?
- which Scene/Section/runtime generation owns its presentation?
- Raw Babylon mesh/node identity is presentation only.
- Pickup: Representative flow.
- interaction occurrence -> revalidate world occurrence -> revalidate destination inventory capacity/rules -> one inventory transaction -> commit possession -> retire/update world occurrence -> presentation/audio/VFX/animation feedback.
- Duplicate pickup delivery cannot grant the same unique occurrence twice.
- Drop to world: Representative flow.
- request Drop -> validate item/quantity + item policy -> validate world placement / Scene ownership -> stage world occurrence -> commit inventory removal + world ownership handoff atomically -> create/reconcile presentation.
- If a safe world occurrence cannot be committed, the inventory item is not silently lost.
- Equipment drop continues to obey EQP-05.
- ALLOWED CONFIRM BLOCKED_CRITICAL BLOCKED_PROFILE.
- Creator/player UI must explain blocked critical-item loss.
- NEVER NEW_GAME_RESET STORY / SCENE RESET WHEN EXPLICITLY AUTHORED.
- Player-dropped unique items do not spontaneously respawn elsewhere unless an explicit recovery policy owns that behavior.
- Discard: Discard policy may be.
- or owner-defined bounded equivalents.

##### INV-04 — Item Use / Consume / Quick-Slot / Animation Commit Contract

- Common operation model: Using an item is not equivalent to decrementing quantity.
- A supported item-use operation may coordinate.
- Inventory target/query owner Health or other owned gameplay action Equipment/Ammo where applicable Animation intent Audio/VFX/feedback UI Save Eligibility.
- through existing typed contracts.
- Use transaction: Representative flow.
- Use request -> stable item/runtime-instance validation -> current owner/container validation -> target + pure condition evaluation -> action eligibility -> optional presentation/action preparation -> semantic commit boundary -> owned gameplay consequence(s) -> inventory consume/update -> feedback.
- If gameplay consequence and consumption must be atomic, both participate in one bounded GPC-12/SYS-04 operation.
- The system must not produce.
- Consumables: A consumable definition may specify bounded facts such as.
- quantity consumed typed use action/profile valid target/self rules full-health/no-effect policy where applicable animation intent audio/VFX/UI feedback references.
- The typed action resolves to the real owner, for example Health under GPC-02.
- This is not a generic status-effect/RPG attribute framework.
- Quick slots: Quick Slot is a stable reference/selection surface, not a second inventory.
- Exhaustion, transfer, drop, combine or invalidation follows GPC-18 reference-repair rules.
- Ammo / weapons / equipment: GPC-14 remains the weapon/ammo/reload owner.
- EQP-* remains the equipment lifecycle/socket owner.
- This contract only ensures ordinary item-use UI/commands cannot bypass those systems.
- PICKUP USE_CONSUMABLE EQUIP UNEQUIP GIVE RECEIVE DROP INSPECT.
- Gameplay consequence cannot be owned by a raw animation frame.
- Where timing requires a marker.
- Scrub/preview cannot consume items or apply gameplay effects.
- Animation and commit markers: Item presentation may request semantic intents such as.
- semantic animation marker -> owning item/action operation -> revalidate occurrence -> commit exactly once.
- If gameplay consequence and consumption must be atomic, both participate in one bounded GPC-12/SYS-04 operation. The system must not produce.
- healing applied but item not consumed item consumed but healing rejected ammo spent but shot not committed.
- QuickSlot -> references eligible possessed ItemRuntimeInstance/entry.

##### INV-05 — Combine Recipe / Item-on-Target / Puzzle Interoperability Contract

- Combine recipe identity: An authored combine operation should use a stable CombineRecipeId or owner-equivalent semantic identity.
- A bounded recipe may define.
- required ItemDefinition/semantic categories required quantities order sensitivity where relevant pure conditions input consume/retain policy explicit output item(s) creator-facing failure reason.
- Canonical Alpha direction remains explicit authored recipes, not a general crafting graph.
- Transaction: select inputs -> resolve recipe -> revalidate current possessed instances/quantities -> validate destination capacity/output -> one commit: consume/retain inputs grant/merge output -> repair references -> emit one result.
- Duplicate UI activation or event delivery cannot craft twice.
- Item-on-target / puzzle: Use Item On Target is not a hidden combine shortcut.
- Inventory item -> typed ItemOnTarget request -> GPC-22 puzzle/mechanism owner -> validate target/puzzle state -> accepted puzzle transition -> item consume/retain according to authored policy.
- Puzzle truth remains in the puzzle owner.
- Story exchange recipes: A fixed story exchange such as.
- Give Photograph -> Receive Key.
- may use an explicit typed exchange operation through Dialogue/Event/Action without requiring INV-07 vendor commerce.
- This is authored narrative exchange, not barter-value simulation.

##### INV-06 — Authored Reward / Enemy & Encounter Drop / Provenance Contract

- Objective: Supported horror/action-horror gameplay needs direct authored rewards and occasional enemy item drops without introducing procedural loot.
- A reward/drop definition may use bounded modes such as.
- NONE FIXED_ITEM FIXED_ITEM_SET CONDITIONALLY_AUTHORED_FIXED_ITEM.
- Exact names are owner-defined.
- Explicitly excluded by this contract.
- weighted rarity tables as a general loot system random affixes procedural item generation level-scaled loot economy farmable economy simulation.
- Reward destination: An authored consequence may explicitly target.
- PLAYER_INVENTORY WORLD_PICKUP OWNED_CONTAINER.
- where supported and validated.
- Enemy death drop: Enemy/encounter death may reference an authored fixed DeathDropProfile/reward profile.
- death occurrence committed once -> evaluate pure authored drop condition -> allocate reward occurrence/provenance -> validate world placement or destination -> commit reward exactly once -> project world pickup / inventory result.
- Restore of an already-dead enemy cannot generate a second death drop.
- A duplicated death callback cannot duplicate a unique reward.
- Encounter/objective/story rewards: Objectives, puzzles, dialogue and sequences use the same typed reward/item operations.
- No domain privately pushes into an inventory array.
- Provenance: Diagnostics/save evidence should be able to distinguish representative sources such as.
- AUTHORED_WORLD_PICKUP PLAYER_DROP ENEMY_DEATH_DROP ENCOUNTER_REWARD OBJECTIVE_REWARD DIALOGUE_EXCHANGE VENDOR_EXCHANGE.
- without making provenance itself gameplay authority unless a supported rule explicitly depends on it.

##### INV-08 — Creator Inventory & Puzzle Workshop / Progressive Disclosure Contract

- Product objective: A Creator should be able to create and connect ordinary supported items, inventory profiles, containers, recipes, drops and optional bounded exchange without editing JSON, writing code or understanding runtime/Babylon identities.
- Inventory & Puzzle Workshop remains an editor workflow over canonical owners, not a second inventory database.
- Default Creator surface: A representative navigation model may expose.
- ITEMS INVENTORIES / CONTAINERS RECIPES / PUZZLE ITEM LINKS EQUIPMENT / AMMO LINKS DROPS / REWARDS COMMERCE [only with the accepted optional/profile-gated INV-07 capability/enabled].
- Exact tabs/layout are non-normative.
- Common item presets may include.
- Key Item Puzzle Item Consumable / Healing Ammo Weapon Readable Utility Equipment Bounded Custom Item.
- A preset fills typed supported capabilities.
- it does not create hidden gameplay rules.
- Representative item authoring: Default view should prioritize creator meaning.
- Name / localization Type / capabilities Icon / inspect / world presentation Stack size Supported actions Critical/progression protection Key equipment/ammo/recipe links where relevant.
- Common switches/actions may include.
- Use Inspect / Read Combine Equip Quick Slot Drop Discard.
- only when the selected capability/profile supports them.
- Container authoring: Creator should be able to choose.
- through stable references and validation.
- Which containers allow it?
- Stable reference navigation should lead to the owning editor.
- create a key item create a consumable create ammo/weapon linkage configure a local/shared container author a combine recipe author a fixed enemy/reward drop configure critical-item protection preview player inventory actions save/reopen PIE cook/export.
- with the accepted optional/profile-gated INV-07 capability for the selected profile, also prove one fixed vendor purchase/exchange.
- Recipe / reward authoring: Creator should be able to author.
- A + B -> C Use Item On Target Fixed Enemy Drop Objective/Story Reward.

##### INV-09 — Player Inventory / Container / Vendor UI Projection & Accessibility Contract

- UI authority: Player-facing Inventory, Container and optional Vendor screens consume immutable/coherent runtime views and issue typed requests.
- They never become inventory/currency/container authority.
- Representative projection.
- Inventory Runtime -> InventoryView -> slots/list/grid skin -> context actions.
- Available actions derive from.
- ItemDefinition capabilities current runtime instance/quantity container/equipment state current target/context pure conditions Save/Scene/session validity.
- and are revalidated when executed.
- Common player surfaces: Supported profiles may project.
- Inventory Inspect / Read Combine selection Container transfer Quick Slots Equipment state Ammo status Vendor / Exchange screen [only with the accepted optional/profile-gated INV-07 capability].
- The same gameplay model may use radically different visual skins.
- Interaction / drag-drop: Pointer drag/drop is optional presentation.
- Controller, keyboard and accessible command paths must be able to perform equivalent supported operations.
- drop gesture is not inventory mutation.
- The gesture emits the same typed transfer/equip/quick-slot request used by other input paths.
- Stale UI safety: A menu rendered from an older item/container/vendor generation cannot commit against stale quantity, stock, capacity or ownership without revalidation.
- Duplicate clicks/confirm events cannot consume/buy/drop twice.
- Critical loss / confirmation: When discard/drop may lose meaningful progress.
- block or explicitly confirm according to item policy.
- The UI does not invent its own critical-item list.
- Save / pause / screen stack: Inventory/container/vendor screens use existing RUI Screen Stack, focus, back, modal, pause/control and Save Eligibility contracts.
- Opening a screen does not serialize widget state as inventory truth.
- with creator/player-readable reason.

##### INV-10 — Inventory Cross-Domain Save / Story / Animation / Export / Diagnostics Closure

- Story / Dialogue / Objective: Cross-domain queries read the owning domain.
- HasItem(ItemDefinitionId) -> Inventory authority HasQuantity(ItemDefinitionId, n) -> Inventory authority CurrencyAtLeast(...) -> INV-07 currency authority when the accepted optional/profile-gated capability is enabled PuzzleSolved(...) -> Puzzle authority.
- Do not mirror possession/currency into Story State merely for convenience.
- Dialogue/Event/Action may request.
- Give Item Remove Item Exchange Item Open Container Open Vendor [when INV-07 capability enabled] Add / Spend Currency [when INV-07 capability enabled].
- through typed owners.
- PICKUP USE GIVE RECEIVE EQUIP DROP INSPECT.
- but Animation/Sequencer never directly mutates quantity, container ownership, equipment or currency.
- Save / restore: Runtime Save must preserve the supported semantic state required by the selected profile, including as applicable.
- inventory/container identities + contents item runtime/stack identities critical/unique relationships quick-slot references equipment references via existing EQP owner authored pickup/drop occurrence state consumable/ammo state according to owning model combine/puzzle relationships through GPC-22 currency balances / finite vendor stock with the accepted optional/profile-gated INV-07 capability.
- For the optional/profile-gated INV-07 capability, Runtime Save persists applicable finite vendor stock counts through their owning state; `UNLIMITED` stock has no mutable finite-count state to save.
- Editor Preview/PIE/runtime-save residue must not leak into a new branch.
- Export: Cook/export must include only supported runtime item definitions, profiles, recipes, references and player-UI assets required by the project.
- The Creator Workshop, debug reference graph and editor-only preview state are stripped from player authority/bundles except for explicitly required generated runtime data.
- Parity: Representative supported flows must be proven across.
- Authoring Preview where meaningful PIE Runtime Save / Restore Cooked / Standalone Player.
- No editor-only fallback may silently become required for a shipped inventory flow.
- Animation / presentation: Inventory operations may request semantic presentation such as.
- Preview/scrub does not consume, grant, buy, sell or drop items.
- Restore reconstructs presentation and does not replay pickup/reward/purchase/consume consequences.
- Diagnostics: Creator diagnostics should surface.
- duplicate unique item risk dangling quick-slot/equipment reference invalid stack/capacity container transfer failure critical item can become permanently unreachable recipe cycle/dead result where statically provable missing world presentation duplicate reward/drop occurrence consume/action atomicity failure save/restore reference mismatch vendor/currency insufficiency or stock conflict when INV-07 capability is enabled stale UI operation rejection.

#### Authority placement: §9.15.2 Progression/objective contracts (new under §9, after §9.14)

##### PRG-00 — Objective / Progression Authority & Non-Quest-Engine Boundary

- RetroStage keeps the canonical product concept Objective / Task.
- A Creator-facing Objectives & Progression surface may coordinate authoring and diagnostics, but it is not a second runtime Quest database.
- Objective authority = objective definition / step definition + runtime objective state/progress + typed objective transitions + objective-owned completion/failure consequences.
- Objectives & Progression editor = projection / authoring / validation / navigation != runtime authority.
- Explicit non-admission: Freeze6 does not admit.
- hundreds of generic quest types procedural/daily/repeatable quest framework quest hub / quest-giver framework level-gated quest economy MMO quest tracker defaults generic reward/economy engine private quest scripting language second Story State variable database.
- This preserves Source05's General RPG Quest Engine exclusion.
- Cross-domain rule: Progression may observe/use typed facts owned by.
- Story State Clue / Knowledge Inventory / Item Puzzle Scene / Section / Area NPC / Dialogue memory Interaction Sequence Save / checkpoint eligibility where relevant.
- but never mirrors those facts merely for convenience.

##### PRG-01 — ObjectiveDefinition / Runtime Objective / Stable Step Identity

- Required distinction: ObjectiveDefinitionId != ObjectiveRuntimeInstance / save-state record != ObjectiveStepId != Objective journal row/widget != notification occurrence != map marker identity.
- Objective definition: A supported ObjectiveDefinition should provide or derive.
- stable ObjectiveId classification: MAIN / OPTIONAL / HIDDEN localized title / description / step TextIds ordered or explicitly related stable ObjectiveStepIds start conditions update/progress rules complete conditions failure conditions where used OnStart / OnUpdate / OnComplete / OnFail typed actions visibility/presentation policy separate from gameplay state save/migration participation.
- Runtime state: The existing bounded states remain.
- INACTIVE ACTIVE COMPLETED FAILED.
- Visibility is separately derived/owned and must not be encoded by overloading the gameplay state.
- Step state/progress may use an implementation-equivalent bounded model, but stable step identity is required so reorder/insert/localization changes do not reinterpret existing saves.
- Persistence / replay: Restore hydrates accepted objective/step state without replaying already committed start/update/ complete/fail consequences. Existing STY-03 / SAV consequence provenance remains authoritative.

##### PRG-02 — Objective Dependency / Chain / Branch / Terminal Semantics

- Read Note -> Start Restore Power -> Find Fuse -> Solve Fuse Box -> Unlock Doctor Dialogue -> Start Escape.
- without a second Quest Graph runtime.
- Progression relationships derive from canonical typed conditions, actions and stable references.
- A progression/dependency graph is therefore primarily.
- AUTHORING + VALIDATION PROJECTION.
- not a second executor.
- Supported authored relationships: Bounded relationships may express.
- starts-after / starts-when requires objective state requires step completion optional branch mutually exclusive authored outcomes via owned Story/Objective facts terminal completion/failure follow-up objective suggestion/link.
- The implementation may present these visually, but execution still resolves through the shared Condition/Event/Action and domain-owner contracts.
- Cycle rule: Cycles are not automatically illegal because horror/liminal narratives may intentionally revisit content. Validation must distinguish.
- cycle with real player/time/event escape boundary vs zero-progress / impossible / unconditional deadlock cycle.
- No unbounded same-tick progression traversal is allowed.

##### PRG-03 — Puzzle / Clue / Inventory / Scene / NPC / Story Cross-Domain Binding

- Core invariant: RELATED TO PROGRESSION != OWNED BY PROGRESSION.
- Representative facts remain owned as follows.
- FuseBoxPuzzle = SOLVED -> Puzzle authority.
- BasementKey possessed -> Inventory authority.
- Clue 5731 known -> Clue / Knowledge authority.
- GeneratorRoom active/entered -> Scene / Section authority.
- Doctor dialogue choice committed -> Dialogue/NPC-memory authority.
- RestorePower objective COMPLETED -> Objective authority.
- Binding model: Objective conditions/actions may consume typed queries/events such as.
- PuzzleState(PuzzleId) == SOLVED HasItem(ItemDefinitionId) ClueKnown(ClueId) SectionState(SectionId) DialogueOccurrenceCommitted(...) StoryState(...).
- and may emit normal typed actions such as.
- Start / Update / Complete Objective Unlock / Transition Scene Give / Remove Item Play Sequence Set owner-appropriate Story State Reveal bounded Map region/floor if MAP-00 is admitted.
- No mirrored convenience flags: The progression editor must diagnose, not encourage.
- StoryFlag.FuseBoxSolved = true + PuzzleState(FuseBox) = SOLVED.
- when both represent the same fact.

##### PRG-04 — Story & Objective Spine — Puzzle Inclusion / Projection Rules

- The canonical Story & Objective Spine remains a high-level narrative editing/projection surface, not Flow Graph and not a runtime database.
- Freeze6 explicitly admits Puzzle as a first-class projected narrative node where the puzzle is a material progression beat.
- A representative spine may show.
- Chapter / Section ├ Story Beat ├ NPC Conversation ├ Objective ├ Objective Step ├ Clue ├ Puzzle / Mechanism ├ Sequence └ World Reaction.
- Editing rule: Selecting/editing a projected node navigates or dispatches to its canonical owner.
- Objective -> Objective owner/editor Puzzle -> Inventory & Puzzle Workshop / Puzzle owner Clue -> Clue/Readable owner Scene/Section -> Scene Director Dialogue/NPC -> Dialogue/NPC owner Sequence -> Sequencer.
- The Spine does not clone those documents.
- Relationship edges: Edges may visualize.
- condition/dependency action/consequence unlocks requires alternative branch world reaction.
- but the visual edge must resolve to canonical typed semantics rather than becoming private graph-only logic.
- Map/floorplan associations may be shown as annotations/links, not narrative authority nodes.

##### PRG-05 — Objectives & Progression Creator Workshop / Preview

- Product objective: A Creator should be able to create and debug a supported progression chain without JSON/code, private flags or raw Event/Action IDs.
- Objectives & Progression may be implemented as a specialized editor/workspace that composes the existing Objective / Story Spine / puzzle / scene / diagnostics owners.
- Default Creator surface: Prioritize game meaning.
- Objectives Main Optional Hidden.
- Selected Objective Title / description State policy Steps Start condition Completion / failure On Start / Update / Complete / Fail Related Scene / Section Related Puzzle Related Clue / Item / NPC / Sequence Journal / notification presentation Optional Map relationship [only if MAP-00 admitted].
- Exact tabs/layout are non-normative.
- Progression overview: A Creator-facing graph/tree may answer.
- What starts this objective? What can complete/fail it? Which puzzle/item/clue blocks it? What does it unlock? What branch becomes impossible after this choice?
- without requiring a generic scripting graph.
- Advanced: Advanced may expose bounded.
- compound typed conditions progress counters branch/exclusivity intent failure/retry policy explicit ordering/dependency links presentation visibility rules map reveal/marker bindings if admitted.
- Preview / simulation: Preview inherits STY-09.
- sandboxed non-persistent no real save mutation no permanent inventory/puzzle/story consequences.
- Creator may simulate facts and inspect the resulting progression path, then discard the sandbox.

##### PRG-06 — Journal / Notification / HUD Projection & Accessibility

- UI authority: Journal, notifications and optional HUD objective presentation are read projections over coherent Objective runtime state.
- Objective Runtime -> ObjectiveView -> Journal / notification / optional HUD skin.
- UI does not complete/fail/update an Objective by directly mutating objective state.
- Product defaults: Source05's MMO-style tracker exclusion remains binding.
- Default product direction supports.
- journal-only notification-only minimal selected-objective HUD creator-owned custom screen presentation.
- and does not require.
- permanent waypoint arrow minimap tracker large quest list overlay floating world objective text.
- Localization / accessibility: Objective title/description/steps use stable TextId/localization semantics and RSM-87 UI rules.
- Supported surfaces must honor.
- controller/keyboard focus text scaling/layout tolerance screen-reader/semantic labeling direction where the UI contract supports it contrast / non-color-only status communication input-method independence.
- Notification occurrence identity is distinct from Objective state so duplicate UI callbacks cannot replay gameplay consequences.

##### PRG-07 — Progression Reachability / Deadlock / Critical-Path Diagnostics

- Extend STY-07's narrative reachability model into a bounded Progression Critical-Path Analysis over existing canonical facts.
- The analysis is derived validation evidence, never runtime truth.
- Graph inputs: Where statically knowable, validation may include.
- Objective/step conditions and actions Puzzle solve requirements/results critical Item acquisition/consumption/drop/discard policies Clue acquisition Scene/Section transitions and availability NPC presence/dialogue gates Story State branches Sequence-triggered consequences map reveal/marker dependencies only if MAP-00 admitted.
- Required diagnostics: Detect or conservatively flag.
- objective can never start active objective can never complete or fail required puzzle unreachable required critical item can be permanently destroyed/lost required Scene/Section becomes unreachable first branch excludes every remaining valid completion path completion requires contradictory facts objective references deleted/missing owner cycle with no real progress/escape boundary hidden dependency with no Creator-visible explanation restored save state has dangling progression references.
- False-certainty guardrail: Dynamic conditions may prevent complete static proof. The tool must distinguish.
- PROVEN ISSUE LIKELY / CONSERVATIVE WARNING RUNTIME-ONLY / UNKNOWN.
- rather than claiming impossible certainty.
- Diagnostics link to the owning editor and show the fact/dependency chain in Creator language.

#### Authority placement: §9.15.2 Story, objective and interaction state contracts (new under §9, after §9.14)

##### STY-00 — Story State Primary Semantic Ownership

- Critical ownership gap found: Source01 correctly declares Story State as ALPHA CORE, and the ownership map associates story/clue/NPC/dialogue/objective meaning with several milestones.
- However, the semantic owner of the shared Story State surface itself is not currently singular enough.
- That ambiguity can lead to.
- Dialogue creates private story flags Objective system creates another variable store Scene Director creates private progression flags NPC memory becomes a second story-state database Flow Graph later creates graph-local story variables.
- The post-CIC Source rebase should normalize ownership as follows.
- RSM-24 = generic runtime-state registration/versioning/save-participation foundation NOT narrative semantic ownership by itself.
- RSM-39 = first shared Story State semantic/runtime foundation + narrative progression integration.
- RSM-47 = Dialogue/Readable consumer + typed Story State action/condition integration.
- RSM-49 = Objective owner.
- consumes Story State where appropriate but does not mirror objective truth.
- RSM-60 = NPC narrative-state/memory owner.
- consumes Story State where appropriate but does not mirror it.
- RSM-69 = recipes over the same semantics.
- RSM-104–106 = orchestration/sequencing over the same semantics.
- never a second Story State authority.
- The exact package/document placement remains a post-CIC architecture decision, but the semantic ownership direction should be binding.
- Core rule: ONE SHARED STORY-STATE SEMANTIC SURFACE + DOMAIN OWNERS FOR FACTS THAT BELONG ELSEWHERE.
- not several private variable stores.

##### STY-01 — Narrative Fact Ownership / No Mirrored Truth

- Every material narrative fact must have one authoritative semantic owner.
- Representative ownership examples.
- "BasementKey is possessed" -> Inventory / Item authority.
- "Clue 5731 is known" -> Clue / Knowledge authority.
- "Objective RestorePower is COMPLETED" -> Objective authority.
- "NPC Doctor conversation choice X was committed" -> NPC/Dialogue-memory authority according to the accepted contract.
- "Section PowerRestored is active" -> Scene Director / Section authority.
- "Global ending route = MERCY" -> Story State authority when no more specific owner exists.
- Anti-mirroring rule: A fact already owned by another subsystem should not be redundantly copied into a Story Flag merely for convenience.
- For example.
- HasItem(BasementKey).
- should normally query Inventory truth, not require an additional.
- StoryFlag.HasBasementKey = true.
- Likewise.
- ClueKnown(Code5731).
- must not require a second manual Story Flag unless that flag represents a different authored story fact.
- Derived predicates: Cross-system conditions may derive predicates from authoritative facts.
- Derived predicates are.
- read-only recomputable non-authoritative unless explicitly admitted as a new semantic fact.
- Shared condition vocabulary: Dialogue, Objective, Scene Director, Narrative Recipes, Flow Graph and Sequencer should reference the same typed condition registry and stable fact identities.
- Private string-based conditions such as.
- "powerDone" "doctorGone" "hasClueMaybe".
- outside the owned semantic registry are forbidden as durable runtime truth.

##### STY-02 — Story State Definition / Runtime Value / Scope / Initialization

- Story State should distinguish authoring definition from runtime value.
- Conceptually.
- StoryStateDefinition = canonical authored schema/default/scope/identity.
- StoryStateRuntimeValue = current runtime/session/save-eligible value.
- Runtime story progression must never rewrite canonical project defaults.
- Supported value families: The existing bounded model remains.
- Boolean bounded number / counter enum stable reference where justified.
- stable StoryStateId type default/initial value scope save participation validation constraints authoring description/context migration/version ownership through SYS-07.
- Scope: Supported scopes remain bounded.
- GAME / GLOBAL RUNTIME SCENE NPC OBJECTIVE TEMPORARY / SESSION.
- but scope must have explicit lifetime semantics.
- For example.
- Scene-scoped state cannot silently survive unrelated Scene lifetime unless save/transfer policy explicitly says so.
- NPC-scoped state binds stable NPC narrative identity rather than a runtime entity pointer.
- Objective-scoped state cannot outlive or change owner when Objective identity is replaced.
- Mutation authority: Story State mutation occurs only through typed RetroStage semantic actions/commands owned by the runtime narrative contract.
- These cannot mutate Story State directly.
- Flow Graph/Sequencer may request normal typed actions under SYS-05.
- Numeric/reference safety: Counters/numbers must remain finite and within the authored supported domain.
- Enums reject unsupported values.
- Stable references validate their target identity/lifetime.
- It must not inherit.
- previous save story values previous PIE runtime values editor preview simulation values old session temporary variables.
- Player Settings/Profile data remains a separate authority.
- Required definition semantics: Each persisted Story State definition should provide or derive.

##### STY-03 — Objective / Task Transition & Exactly-Once Consequence Contract

- Existing model: Objectives use.
- INACTIVE ACTIVE COMPLETED FAILED.
- with visibility separate from gameplay state.
- Objective transition is a semantic state-machine commit, not a UI/event convenience.
- Representative transitions should be validated, such as.
- INACTIVE -> ACTIVE ACTIVE -> COMPLETED ACTIVE -> FAILED.
- Any reset/reactivation/reopen behavior must be explicit and profile/recipe-owned rather than an accidental assignment.
- Mutually exclusive terminal state: For one Objective generation.
- COMPLETED and FAILED.
- cannot both become current authoritative state.
- If competing completion/failure predicates resolve in the same semantic boundary, the Objective owner uses a deterministic declared priority/tie policy or rejects the ambiguous authoring configuration.
- Stable step/progress identity: Where objectives have steps/progress.
- objectiveId stepId progress-source occurrence identity.
- should remain stable.
- Display row/index/order is not step identity.
- Exactly-once transition actions: Actions such as.
- On Start On Update On Complete On Fail.
- must be tied to the accepted semantic transition/occurrence.
- Repeated Event/Action delivery, UI refresh, save restore, or journal presentation must not re-execute a transition consequence that already committed.
- Progress idempotency: Event-driven progress increments should use the semantic source occurrence/repeat policy so one gameplay occurrence cannot count twice merely because it was delivered through multiple adapters.
- Restore: Runtime Save restores Objective semantic state/progress.
- Hydration must not replay.
- On Start On Complete On Fail reward/grant/unlock consequences.
- that were already committed before capture.

##### STY-04 — Clue / Knowledge / Readable Acquisition Commit Contract

- Clue/Knowledge acquisition must be a first-class idempotent semantic commit.
- A clue occurrence should preserve enough meaning to know.
- ClueId acquisition state source/provenance related narrative identity where authored journal visibility state notification state/policy save participation.
- Separate state dimensions: The following are not automatically the same fact.
- Readable UI opened Readable semantically read Clue acquired / known Journal entry visible Journal entry viewed Notification shown Physical evidence item possessed.
- A project/profile may connect them through explicit Narrative Recipes, but one presentation event must not silently stand in for all of them.
- Readable commit: Opening/closing the Readable presentation must not automatically repeat narrative consequences.
- A recipe such as.
- Read Note -> Mark Readable Read -> Learn Clue -> Start Objective.
- should use SYS-04 consequential-operation semantics with stable occurrence/idempotency identity.
- Failure safety: If a multi-effect narrative recipe cannot fully validate before its semantic commit, the system must not end in a silent half-progression state such as.
- Clue acquired but required Objective transition failed.
- unless the recipe explicitly defines those as independent consequences.
- Restore: Restore reconstructs.
- Readable-read state Clue/Knowledge state journal visibility.
- from semantic progress.
- It must not reacquire the clue, replay the objective start action, or emit duplicate "New Clue" notifications merely because the Readable was restored as already read.
- Inventory separation: Physical evidence items and knowledge remain separate authorities.
- Item possession is not Clue known.
- unless a recipe explicitly commits both.

##### STY-05 — NPC Narrative Presence / Relocation / Conversation Memory Contract

- BeforePower -> Reception PowerRestored -> BasementDoor DoctorFound -> Gone.
- Without explicit identity/presence semantics, Scene loading/restore may instantiate duplicate copies or lose persistent conversation memory.
- A story NPC should distinguish.
- stable NPC narrative identity is not runtime entity instance is not Dialogue session is not Speaker presentation profile.
- Narrative presence: A stable NPC narrative owner should determine whether the NPC is.
- AVAILABLE / PRESENT ABSENT RELOCATING / TRANSITIONING where material REMOVED / GONE according to authored story state.
- or implementation-equivalent bounded states.
- Runtime instantiation: Scene/Section runtime entities are projections of the accepted narrative presence/location state.
- For one stable NPC identity, the runtime must not accidentally create multiple authoritative story-NPC presences because.
- two Sections overlap an old Scene unload is late restore races loading a relocation action is delivered twice.
- unless the authored design explicitly models multiple distinct entities/identities.
- Relocation: Narrative relocation uses the existing Scene Director / Scene/Section transactional lifecycle.
- A relocation consequence should commit semantic destination/presence before runtime projection is reconciled according to the accepted transition policy.
- Conversation memory: Persistent conversation memory belongs to the stable NPC/narrative authority, not to.
- Dialogue widget current DialogueSession runtime entity component instance audio voice.
- Restore: Runtime Save reconstructs NPC narrative presence/location/memory and then runtime entity instantiation.
- It does not save raw Scene object/entity handles as narrative identity.

##### STY-06 — Story & Objective Spine Non-Authority / Editing Contract

- Existing intent: Story & Objective Spine is explicitly a high-level narrative structure view and not Flow Graph.
- Structural decision: The Spine is also not a second narrative database or runtime graph authority.
- It should be a creator-facing projection/editor over stable references to existing semantic owners.
- Story State Scene/Section Dialogue Objective Clue NPC Sequence world reaction/Event-Action.
- Editing: Edits initiated in Story Spine must route through ordinary canonical authoring commands to the owning documents/registries.
- The Spine cannot directly maintain private duplicate copies of.
- Objective state machines Dialogue branches Story flags Scene transition rules Sequence actions.
- Spine layout: Purely editor-visual state such as.
- node position zoom collapsed groups selection filters.
- is editor-local/derived unless an explicit collaboration/product requirement later changes that authority.
- Story Beat identity: A named Story Beat does not automatically require a new persisted top-level document.
- If a durable Story Beat semantic is later admitted, SYS-07 persistence/schema/export/save rules apply.
- Otherwise it may remain a derived organizational grouping/reference.
- Derived graph: Reachability/dependency views may be rebuilt from authoritative semantic references.
- A stale generated Story Spine graph cannot override the documents it visualizes.

##### STY-07 — Cross-Domain Narrative Reachability / Contradiction / Deadlock Validation

- A narrative path may cross.
- Story State Clue/Knowledge Objective NPC availability Dialogue choice Scene/Section Sequence Inventory/key state.
- and become impossible only when those systems are considered together.
- RetroStage should provide bounded cross-domain narrative validation using the shared semantic registry/references.
- It is not a general theorem prover or procedural story solver.
- Deterministic findings: Where the graph is statically decidable, diagnostics should detect representative cases such as.
- required StoryState fact has no producer/default path Clue can only be acquired behind the condition that the same Clue unlocks Objective step requires its own already-completed terminal state required NPC is never present on the reachable story stage all choices in a required dialogue node are provably unavailable required Scene/Section destination is missing/unreachable a narrative recipe references a missing Objective/Clue/NPC/Dialogue action a mandatory branch depends on mutually exclusive enum/state facts an automatic narrative cycle has no player/time/external-event boundary.
- Uncertainty: When arbitrary dynamic Flow Graph/Sequence/runtime conditions prevent proof, the validator should say.
- UNKNOWN / RUNTIME-DEPENDENT / REQUIRES TEST COVERAGE.
- or equivalent, not invent certainty.
- Export closure: Cook/export semantic dependency closure must include assets/documents reachable through supported narrative branches, not only references visible from the current default branch.
- A branch being inactive at cook time does not make its required content disposable.

##### STY-08 — Narrative Save / Restore / New-Game Branch Coherence & Consequence Provenance

- Narrative progress is a coherent cross-owner save domain assembled through existing Runtime Save registration and SYS-03/SYS-04.
- Representative participating owners.
- Story State runtime values Objective state/progress Clue/Knowledge acquisition NPC narrative presence/memory Dialogue persistent memory/safe progress Scene/Section narrative state approved sequence/progression state Inventory facts used by narrative.
- Each keeps its own authority.
- the save captures one coherent accepted generation.
- No replay on hydration: Restore must never treat the restored state as a new narrative occurrence.
- It must not automatically re-run.
- Set Story Flag consequence Objective OnComplete Clue OnAcquire Readable OnRead NPC relocation action Dialogue OnChoice/OnLine action Sequence completion consequence story item grant journal "new" notification.
- already committed before the save.
- Consequence provenance: Material story-changing commits should retain bounded causal/provenance identity sufficient for diagnostics and idempotency, such as.
- source authored identity semantic action/occurrence identity target narrative fact/state accepted transition/result runtime/session generation.
- This need not become an unbounded permanent event log.
- The goal is to answer.
- "Why is this objective completed?" "Why is this choice available?" "Why is this NPC gone?" "Where was this clue learned?".
- through creator diagnostics.
- No narrative progress from.
- previous Continue/Load previous New Game session PIE editor narrative preview abandoned temporary run.
- may silently survive.
- Player Settings/Profile remain separate.
- There must not be a hidden global mutable Story State outside the selected runtime save/session that causes one save branch to contaminate another.

##### STY-09 — Narrative Preview / Simulation Sandbox

- Narrative preview/simulation should run against a disposable derived/sandbox semantic state unless the creator explicitly enters normal PIE/runtime execution.
- Representative authoring activities.
- preview dialogue branch simulate Objective progression test Clue unlock preview NPC story-stage relocation preview Story Spine branch preview Sequence narrative consequences inspect Flow Graph story action path.
- must not mutate.
- canonical project defaults real Runtime Save live player profile/settings unrelated active runtime session.
- Sandbox semantics: A preview may.
- clone/derive a bounded narrative state snapshot apply test-only story actions show resulting branches/objectives/NPC presence reset instantly.
- but its mutations remain non-authoritative and disposable.
- Explicit commit boundary: If an editor workflow is intended to author a changed default/condition/action, it uses normal canonical commands.
- "Use current preview state as authored defaults" would itself be an explicit validated authoring operation, not an accidental consequence of running preview.
- Diagnostics: Preview should clearly identify.
- SANDBOX / PREVIEW STATE.
- versus live PIE/player story state to prevent creator confusion.

#### Authority placement: §9.15.3 Dialogue/text/voice identity and lifetime contracts (new under §9, after §9.14)

##### DLG-01 — Dialogue Session / Conversation Instance Authority

- Every foreground dialogue/conversation execution should create a RetroStage-owned dialogue-session identity.
- A representative session binds the relevant subset of.
- dialogueSessionId dialogueDocumentId current node/line stable identity participant/speaker identities runtimeSessionGeneration Scene/Section owner where applicable current dialogue state pending choice identity interruption/resume state.
- Exact structure belongs to RSM-47 implementation.
- Concurrency: The product should define bounded concurrency for player-facing foreground dialogue.
- Opening the same conversation twice from duplicate interaction/event delivery must not create two competing authoritative sessions.
- Non-blocking ambient voice/bark presentation, if later supported, must remain a separate bounded audio/narrative occurrence rather than silently behaving as a second foreground dialogue session.
- Identity rule: React dialogue widget instance subtitle component audio voice displayed speaker name is not dialogueSessionId.

##### DLG-02 — Dialogue Condition Purity / Choice Identity / Revalidation

- Dialogue conditions are read-only semantic predicates.
- They must not mutate story, inventory, objectives or runtime state merely because the editor/player evaluated available choices.
- Coherent evaluation: A choice list should be derived from one coherent accepted semantic view of the relevant.
- Story State Objective state Inventory/items NPC/conversation state other typed condition sources.
- rather than independent mutable widget reads.
- Choice identity: Every choice uses stable semantic identity.
- choice display index display text localized text DOM button identity.
- are not persistent/action authority.
- Commit-time revalidation: When the player selects a displayed choice.
- choice intent -> dialogue session/choice identity validation -> condition/precondition revalidation -> semantic choice commit -> actions / next node.
- If state changed after the choice was displayed, the system refreshes/rejects safely according to the dialogue contract rather than committing a stale choice.
- Formatting/localization: Choice TextId/localized presentation may change without changing choice identity.

##### DLG-03 — Dialogue Line / Action Commit / Skip-Advance Idempotency

- Dialogue lines and dialogue actions require explicit semantic commit points.
- A line may carry or reference bounded actions such as.
- set story flag advance objective give/receive item request camera/sequence action request audio/VFX/presentation action transition to next dialogue node.
- These actions must use normal Event/Action and owning subsystem contracts under SYS-04/SYS-05.
- Action phase: The dialogue definition should make clear when a consequential action commits.
- Representative bounded phases may include implementation equivalents of.
- ON_LINE_ENTER ON_LINE_COMMIT ON_CHOICE_COMMIT ON_LINE_EXIT.
- Exact vocabulary remains dialogue-owner-defined.
- Skip / reveal / advance: Player operations such as.
- complete typewriter reveal skip voice advance line skip skippable dialogue/sequence segment.
- must not accidentally.
- double-commit line actions skip required committed actions run exit actions twice advance two nodes from duplicate voice-end callbacks.
- Idempotency: A consequential dialogue action uses stable occurrence/commit identity inherited from Event/Action and the owning subsystem.
- Preview/scrub in the editor may inspect/present dialogue without committing live project/gameplay state.

##### DLG-04 — Dialogue Interruption / Control / Camera / Audio Scoped Ownership

- player movement/actions camera focus/input dialogue UI/subtitles audio ducking/voice sequence save eligibility.
- Imperative enter/exit restoration can release state still owned by another system.
- Dialogue acquires bounded scoped contributions/leases through the existing owners.
- Player Action / input context ScreenPolicy / UI focus Camera authority Audio snapshot/ducking Sequence ownership Save Eligibility.
- Dialogue itself does not directly toggle global booleans.
- Interruption policy: A dialogue definition/profile should declare supported interruption behavior for material cases, for example.
- CANCEL PAUSE_AND_RESUME COMPLETE_CURRENT_LINE_THEN_STOP RESTART_FROM_SAFE_MARKER IGNORE_NON_FATAL_INTERRUPT where justified.
- Exact policy set remains bounded and milestone-owned.
- Required safeguards: Death/session replacement invalidates old dialogue authority. - Scene/Section unload cancels or transfers dialogue only by explicit policy. - Stun/combat interruption cannot leave camera/focus/audio locks orphaned. - Closing dialogue UI does not itself mean the semantic conversation committed/cancelled. - A stale dialogue session cannot restore an old camera/audio snapshot over newer state. - Dialogue audio uses AUD-01/AUD-02 ownership, not private voice truth.
- Required safeguards: Death/session replacement invalidates old dialogue authority.
- Scene/Section unload cancels or transfers dialogue only by explicit policy.
- Stun/combat interruption cannot leave camera/focus/audio locks orphaned.
- A stale dialogue session cannot restore an old camera/audio snapshot over newer state.
- Dialogue audio uses AUD-01/AUD-02 ownership, not private voice truth.

##### DLG-05 — Dialogue Save / Restore / Safe-Marker Semantics

- Dialogue save participation must be explicit.
- A runtime save must not capture a half-applied dialogue action/choice transition.
- Dialogue contributes to SYS-03 Save Eligibility when the current dialogue moment is not safely serializable.
- Save-safe boundaries: Representative safe semantic boundaries may include.
- before line actions commit after line actions commit and before next line begins awaiting a stable player choice explicit authored dialogue save marker.
- Exact supported boundaries belong to RSM-47/RSM-65 integration.
- Saved truth: Where dialogue state is save-eligible, persist semantic meaning such as.
- dialogue document/session-progress identity where required current stable node/line committed action/choice state conversation memory/story flags through their owning systems approved interruption/resume state.
- Do not serialize.
- React component state typewriter character index unless explicitly semantic audio voice handle subtitle animation portrait animation object DOM focus.
- Restore: Restore reconstructs presentation from semantic dialogue/story state.
- Already committed line/choice actions must not replay simply because the dialogue presentation re-entered the saved node.
- If exact mid-line resume is not safely supported, the profile should restart from an accepted stable marker rather than guess.

##### DLG-06 — Speaker / Text / Voice / Portrait Identity Separation

- Dialogue meaning, localization text and presentation assets remain separate stable contracts.
- A dialogue line should be able to reference.
- speaker stable identity / SpeakerProfile TextId voice cue/voice variant identity where used portrait/expression semantic identity where used presentation profile.
- without making any display string or engine asset object the dialogue-line identity.
- Required distinctions: speaker ID is not displayed localized speaker name.
- TextId is not rendered string.
- voice cue is not subtitle/dialogue line identity.
- portrait/expression is not NPC gameplay identity.
- Missing presentation assets: The dialogue contract should classify presentation assets as required or optional.
- Examples.
- optional missing portrait -> diagnosed visual fallback.
- optional missing voice -> subtitle/text fallback.
- synchronization-critical required voice -> readiness/block/degraded policy under audio rules.
- missing TextId/string key -> explicit localization/content error.
- A missing presentation asset must not silently mutate story branch/choice meaning.
- Scope guardrail: This does not admit.
- auto lip sync facial rig authoring full visual-novel route/backlog engine LLM-generated runtime dialogue.
- which remain deferred/excluded by Source05.

##### DLG-07 — Dialogue Auto-Advance / Cycle / Work-Budget Safety

- zero-delay auto-advance conditions actions jumps voice-end transitions.
- that form a legal but non-terminating cycle.
- Dialogue execution inherits the Event/Action causal/work budget and also uses bounded dialogue-step progression semantics.
- One runtime occurrence must not process an unbounded number of dialogue nodes/actions in the same tick/phase.
- Required safeguards: zero-time cycles fail in a creator-diagnosable deterministic way.
- auto-advance cannot recurse around Event/Action budgets.
- duplicated voice-end/timer callbacks cannot multiply progression.
- cancelled/superseded dialogue sessions stop pending scheduled advancement.
- authoring validation should detect statically obvious unconditional loops where feasible.
- runtime trace should show the dialogue/session/node sequence that exceeded budget.
- This is a safety floor, not a ban on intentional authored loops that include real player/time/event boundaries.

##### DLG-08 — Bark / Ambient Narrative Occurrence Arbitration

- Existing direction: Barks support.
- text/audio condition priority cooldown interruption policy.
- A bark is a bounded narrative/audio occurrence, not a foreground DialogueSession.
- Each accepted bark should have semantic occurrence identity and bind.
- speaker/NPC stable identity bark definition identity condition evaluation snapshot priority cooldown policy interruption policy runtime/session/Scene generation audio/subtitle occurrence identity where used.
- Cooldown: Cooldown uses an explicit RetroStage semantic clock/domain.
- Raw wall-clock/browser timer state is not bark authority.
- Foreground dialogue arbitration: A profile must define behavior when a foreground dialogue and bark compete, such as.
- suppress bark queue bark interrupt lower-priority bark allow separate non-conflicting offscreen bark.
- according to bounded rules.
- Barks must not speak over synchronization-critical foreground dialogue simply because their audio voice was allocated first.
- Duplicate trigger: Repeated perception/interaction/event delivery for one semantic bark occurrence must obey cooldown and idempotency/repeat policy rather than flood.
- audio subtitles notifications conversation memory.
- Save: Transient bark playback/cooldown is not automatically Runtime Save state.
- Persistent bark/conversation memory is admitted only where explicitly authored and save-registered.

#### Authority placement: §9.15.3 Exported-game localization contracts (new under §9, after §9.14)

##### LOC-00 — Locale Identity / Canonicalization / Source-Locale / Fallback Graph

- Locale identity: Project-facing locale identity uses normalized Unicode/BCP-47-style language tags such as.
- en tr de pt-BR zh-Hans zh-Hant.
- rather than display labels such as.
- English Türkçe Chinese Brazilian Portuguese.
- Display names are localized presentation only.
- Canonicalization: The localization authority validates and canonicalizes locale tags through one product-owned normalization path.
- Equivalent spellings/aliases do not create two independent locale identities accidentally.
- raw locale string -> parse/validate -> normalized LocaleId.
- Invalid locale identifiers fail with diagnostics.
- Source locale: Every game localization configuration has one explicit source locale.
- SourceLocaleId.
- is project authoring truth.
- It is not inferred from.
- developer OS language RetroStage Maker UI language Steam client language current player language.
- Fallback graph: Locale fallback is a deterministic, acyclic project policy.
- Representative.
- fr-CA -> fr -> en.
- may be valid when intentionally configured.
- Script-sensitive or product-specific cases must not rely on naïve string truncation.
- For example.
- zh-Hant.
- must not silently collapse into an unintended Simplified-Chinese asset/text family.
- CLDR-informed, project-pinned: Unicode CLDR parent/locale data may inform the resolver implementation, but the accepted project fallback result is deterministic for the cooked build/profile.
- A future CLDR/library update does not silently change the meaning of an already cooked build.
- Locale identity is not semantic identity: LocaleId is not StringId is not DialogueLineId is not ObjectiveId is not ItemId.
- Changing locale never changes semantic gameplay references.

##### LOC-01 — Game Localization Profile / Supported Locale / Default / Shipping Contract

- Need: StringTableDocument owns text entries, but the project also needs one bounded game-level localization configuration without bloating GameDefinitionDocument.
- This alignment proposes a future canonical LocalizationProfileDocument or implementation-equivalent game-localization profile owned by RSM-48/RSM-87/RSM-93/RSM-119.
- It may be referenced from GameDefinition through one stable typed reference.
- Representative profile: LocalizationProfileId SourceLocaleId DefaultPlayerLocaleId SupportedLocaleIds fallback graph/policy locale-specific font set references localized asset/voice family policies missing-translation policy runtime locale-switch policy export/shipping policy.
- Exact schema remains owning-milestone work.
- Requested / supported / shipped: The architecture distinguishes.
- AUTHORED SUPPORTED LOCALES = project says it has localization intent/content.
- VALIDATED LOCALES = localization closure passes the selected readiness policy.
- SHIPPED LOCALES = exact locale set included in a physical exported build.
- STORE-CLAIMED LOCALES = distribution metadata claims for that artifact/release.
- These are not automatically equal.
- Source locale inclusion: The source/default fallback locale needed for a shipped fallback graph must be physically included in the export closure unless the build proves an equivalent complete fallback path.
- Locale removal: If a later game version stops shipping a locale that a player previously selected.
- saved Player Settings preference -> re-resolve against current ShippedLocaleSet -> deterministic fallback.
- rather than crash or load missing resources.

##### LOC-02 — Message Pattern / Plural / Select / Number-Date Formatting / Safe Markup

- Why simple replacement is insufficient: Localization cannot be modeled only as.
- StringId -> translated literal string.
- because natural languages require.
- plural categories selection/grammatical alternatives variable reordering localized number/date/time formatting safe rich-text structure.
- Message semantics: Localized dynamic text uses a bounded message-definition model compatible in spirit with modern Unicode MessageFormat/CLDR semantics.
- Representative message data.
- StringId LocaleId message pattern / compiled message representation typed argument schema plural/select branches where used safe markup/token usage source revision provenance.
- No arbitrary expressions: Message formatting does not execute.
- JavaScript arbitrary property access arbitrary functions HTML CSS remote code.
- Plural/select: Plural categories are locale-dependent.
- The product does not hard-code.
- one other.
- as if every language used English plural logic.
- Cardinal/ordinal/select semantics, when used, follow the accepted locale-data/runtime contract.
- Typed arguments: Arguments may include bounded types such as.
- text number integer/count date/time value semantic enum/select value.
- Exact type vocabulary remains RSM-48-owned.
- Placeholder name/type mismatch is a validation error.
- Number/date formatting: Gameplay data remains numeric/semantic.
- Presentation uses locale-aware formatting at render time.
- stored currency/number/date value is not preformatted localized string.
- Safe markup: RUI-12 remains binding.
- Localization markup is a RetroStage-owned allowlisted semantic token model.
- Translator content cannot inject arbitrary DOM/HTML/JavaScript.
- The exported player need not parse a general-purpose localization source syntax at runtime.

##### LOC-03 — Translation Entry State / Source Revision / Stale Translation / Review Contract

- Critical content-maintenance problem: Changing source text must not silently leave an old translation looking “complete.”.
- Source revision provenance: Each translation entry can record/derive.
- StringId LocaleId SourceTextRevision / SourceTextFingerprint TranslationRevision review state translator/context metadata where useful.
- Translation states: Representative states.
- MISSING DRAFT REVIEWED STALE_SOURCE INVALID_FORMAT BLOCKED.
- Exact names are UX-owned.
- Source change: If source text/context/argument contract materially changes.
- previous translation -> preserved -> marked STALE_SOURCE / NEEDS_REVIEW.
- It is not deleted automatically and is not silently counted as fully reviewed.
- Argument contract change: Removing/renaming/changing a formatting argument invalidates affected translations until they pass message validation.
- Context: Translator context may include.
- screen/dialogue/objective location speaker developer note character limit/space guidance screenshot/reference identity where explicitly attached.
- but context does not become gameplay identity.
- Review policy: Projects may select readiness policy such as.
- allow fallback for missing noncritical text require all critical strings reviewed require complete locale for release claim.
- under validation/export rules.

##### LOC-04 — Localized Asset Family / Voice / Image / Font / Media Variant Contract

- Text is not the only localized content: Games may require locale variants for.
- voiceover spoken video/media track/subtitle track images containing text tutorial/help illustrations fonts locale-sensitive branding/legal images.
- Localized asset family: Representative identity.
- LocalizedAssetFamilyId semantic role base/source asset LocaleId -> AssetId variant mapping fallback policy required/optional class.
- A localized variant is not identified by filename convention alone.
- Voice: Dialogue line identity remains stable.
- DialogueLineId + Text/StringId + LocalizedVoiceFamilyId.
- Voice variants may differ by locale and duration.
- Voice fallback: Fallback is explicit.
- A missing Turkish voice might mean.
- Turkish subtitle + no voice.
- rather than silently playing English voice.
- The creator may explicitly allow source-language voice fallback for selected content, but this is a declared presentation policy.
- Localized images: Images with embedded text should preferably be avoided when text can be rendered semantically.
- When unavoidable, locale variants use LocalizedAssetFamily identity and normal asset/export closure.
- Fonts: Locale/font set selection is explicit and validated against required glyph coverage.
- A locale pack cannot claim readiness while its critical text requires glyphs absent from every included fallback font.
- Media: Video/FMV localization follows the existing MED contracts.
- localized subtitle track / StringId mapping optional localized audio/voice track locale-aware asset family.
- Locale switching cannot replay committed media/gameplay consequences.

##### LOC-05 — Runtime Locale Selection / Player Setting / Hot-Switch / Generation Contract

- Locale preference ownership: Exported-game language preference is a Player Settings / Runtime Settings preference.
- PlayerLocalePreference is not Runtime Save.
- A save slot can be loaded under another language.
- Initial locale selection: Representative precedence.
- explicit valid player preference -> best supported match from OS/system preferred languages -> project DefaultPlayerLocaleId -> SourceLocaleId / validated fallback.
- The matching algorithm operates over exact shipped locale identities.
- OS language is initial evidence, not authority: Changing the OS/Steam language does not silently overwrite an explicit player choice unless the product explicitly offers a “Follow System Language” setting.
- Locale context: Runtime text/layout/localized-asset requests bind.
- LocaleContextGeneration EffectiveLocaleId FormattingLocaleId where separately supported RuntimeSessionGeneration.
- Locale switch: Changing language.
- validate requested locale -> resolve fallback/profile -> prepare required locale resources/fonts -> publish new LocaleContextGeneration -> invalidate/re-resolve locale-bound UI/text/layout/assets.
- Stale work: Async work from a prior locale generation.
- font load text layout localized image load subtitle preparation voice lookup search/filter result.
- cannot publish into the new locale context.
- Failure: If requested locale resources fail to become ready.
- retain current known-good locale or degrade through validated fallback.
- according to policy.
- The player is not left in a half-switched mixed-language/missing-font state.
- Formatting locale: If the product later separates UI language from regional number/date formatting, that is an explicit Player Settings dimension.
- It is not inferred by mutating StringId or source-locale identity.

##### LOC-06 — Dialogue / Subtitle / Voice Locale-Switch Boundary

- Active line problem: A language switch can occur while.
- dialogue line is active subtitle is visible localized voice is playing Sequence waits on dialogue/audio boundary.
- Blind restart risks replaying consequences.
- Default safe policy: Baseline recommended behavior.
- menus/UI/text outside active semantic occurrences -> re-resolve at new LocaleContextGeneration.
- active dialogue semantic line -> keep DialogueLineId/commit state -> subtitle may re-resolve safely -> active voice normally completes under its current voice occurrence -> next semantic line uses new locale voice/text.
- No consequence replay: Locale switching cannot replay.
- ON_LINE_ENTER item grant objective commit Story State mutation Sequence marker Event/Action consequence.
- Optional presentation restart: If a future profile allows restarting presentation audio/text for the same active semantic line.
- cancel old presentation occurrence -> start new locale presentation occurrence.
- without creating a new semantic DialogueLine occurrence or gameplay commit.
- Voice duration: Different localized voice durations may affect subtitle lifetime and dialogue auto-advance.
- Auto-advance uses the new/current presentation occurrence timing while preserving the same semantic dialogue progression identity.
- Sequence: Sequence waiting on a dialogue/media presentation boundary consumes the owning semantic completion, not raw old/new voice-player callbacks.

##### LOC-07 — Runtime Save / Story / RNG / Gameplay Locale Independence

- Hard invariant: Changing language must not change the game.
- The following remain locale-independent.
- Story State Objective state inventory/item identity NPC identity Scene/Section state puzzle state enemy/AI state RNG streams/seeds interaction identity save generation Sequence semantic commits.
- Runtime Save: Runtime Save stores.
- StringId / semantic IDs where necessary gameplay state.
- and never stores resolved localized display strings as truth.
- Save portability: A save created in.
- tr.
- can be loaded in.
- en de ja.
- without migration of gameplay state solely due to locale.
- Locale-dependent presentation caches: Localized text layout, glyph runs, voice handles, images and locale-specific UI caches are reconstructed.
- They are not durable save data.
- Determinism: Localized collation/sorting, formatting, font metrics or text length cannot become hidden gameplay ordering/RNG input unless a separately explicit gameplay contract says so.
- Intl.Collator order is not gameplay deterministic order.
- Choice identity: A dialogue choice can change label length/order presentation under locale-specific UI rules, but its ChoiceId remains the action identity.

##### LOC-08 — Localization Workspace / Preview / Pseudo-Locale / Coverage / Diagnostics

- Maker workflow for game localization: RetroStage Maker should eventually provide a bounded Localization Workspace.
- StringId Source Context Arguments per-locale translation state / stale status preview references/usage coverage diagnostics.
- This is not a generic spreadsheet application.
- Locale Preview: Creator can preview.
- selected locale fallback path font set UI layout subtitle/dialogue localized images voice availability.
- without changing the source locale or current editor product language.
- Project preview locale vs Maker UI locale: Maker UI = Turkish Game Preview Locale = Japanese Project Source Locale = English.
- is valid.
- These are independent settings.
- Pseudo-localization: Built-in development-only pseudo-locales can test.
- text expansion accented/altered glyph shapes wrapper markers RTL/mirrored direction profile where appropriate missing-glyph/layout sensitivity.
- without pretending to be real translations.
- Pseudo-locales are not shipped or store-claimed by default.
- Coverage: Coverage is computed from semantic reachability/required classes, not merely.
- translated rows / all rows.
- Unused/editor-only source content can be classified separately.
- Criticality: Strings/assets may be classified for release validation.
- CRITICAL_PLAYER_PATH NORMAL OPTIONAL/UNREACHABLE EDITOR_ONLY.
- or equivalent.
- Diagnostics: Creator-readable findings include.
- missing key missing translation stale source translation fallback cycle invalid locale tag argument mismatch unsafe markup token missing glyph/font overflow/truncation Bidi/RTL layout issue missing localized voice/image/media variant voice/subtitle fallback mismatch locale pack dependency missing store language claim not proven by build.

##### LOC-09 — Cook / Locale Pack / Dependency Closure / Export Manifest / Store Claim Contract

- Locale pack model: Cook/export produces deterministic locale closure.
- Representative physical/manifest identity.
- LocalizationBuildManifest LocalePackId LocaleId source content revision string/message payload hashes font dependencies localized asset families/variants voice/audio/media dependencies fallback dependencies locale capability/readiness result.
- Exact packaging may be one archive or multiple bundles.
- Shared vs locale-specific content: Export may separate.
- COMMON -> language-neutral assets/runtime.
- LOCALE PACK -> translated messages/fonts/voice/localized images/media.
- without duplicating common project content unnecessarily.
- Exact shipped set: The artifact declares exact ShippedLocaleSet.
- The player does not discover arbitrary translation files from the editor/project filesystem at runtime.
- Reachability: Locale cook reachability includes dynamic semantic references.
- A localized asset needed only through.
- Dialogue Objective/UI Sequence Story branch tutorial settings legal/credits.
- must still be included when reachable under the selected project/profile.
- Export blocker: Depending on project policy, export blocks on.
- missing required source fallback fallback cycle invalid message patterns critical missing translation critical missing glyph required localized voice/image/media missing invalid locale dependency closure claimed locale not physically included.
- Store language claims: Steam/Epic/store metadata language support is release evidence over the physical artifact.
- checkbox in store metadata is not localization proof.
- The exact store taxonomy remains platform-adapter/release-owned.
- Player locale settings: Player locale preference remains separate from a particular save slot and can survive game updates only through supported Player Settings migration.
- A locale should not be claimed as full interface/subtitle/audio support unless the corresponding artifact and coverage class is physically proven.

##### LOC-10 — Translation Interchange / Import / Untrusted File / Merge Contract

- Interchange is optional, not authority: RetroStage may later support formats such as.
- CSV/TSV JSON-based exchange XLIFF or equivalent professional interchange.
- only when a responsible milestone admits them.
- The external file is an interchange candidate, not canonical truth.
- Export for translators: An exchange record should preserve enough stable metadata to avoid text-only matching.
- StringId source locale source text/source fingerprint context argument schema target locale current translation/review state where applicable.
- Import: Translation import.
- parse bounded untrusted file -> validate locale/StringId/schema -> match source revision -> classify exact / stale / conflict / unknown key -> show/apply candidate -> canonical transaction.
- No silent overwrite: If the project source changed since the translator export.
- old translation import -> STALE/CONFLICT.
- rather than overwrite a newer reviewed translation automatically.
- Parser security: Translation files are untrusted input.
- Any XML/XLIFF parser must prohibit unsafe external-entity/network/file resolution.
- CSV/spreadsheet exchange must treat formulas/markup as data and not execute them inside RetroStage.
- Unknown entries: Unknown StringIds/locale tags are diagnosed and preserved only through an explicitly safe import review path.
- They do not mint arbitrary new gameplay references.
- Collaboration: Localization import does not become a second multi-writer project authority.
- It uses normal AUT/MUI revision and conflict rules.

##### LOC-11 — Legal / Credits / Metadata Localization Boundary

- Product/game metadata: RSM-93 publishing metadata may have localized presentation fields where the target platform supports them, for example.
- game title presentation short description store text credits headings legal UI labels.
- while stable product/build identity remains locale-independent.
- Required third-party notices: Third-party license/notice text is legal evidence.
- RetroStage must not machine-translate or rewrite required verbatim notices automatically.
- A localized explanatory wrapper may be shown where legally appropriate, but the authoritative required notice text remains preserved.
- Credits: Creator-authored credits may use normal StringId/localization where desired.
- Attribution/license records preserve exact legal/provenance identities independently of display translation.
- Store metadata: Localized store descriptions/assets remain release/distribution material and cannot mutate the canonical gameplay StringTable merely because a storefront supports another language.

##### LOC-12 — Locale-Pack Runtime Residency / Voice-Font-Media Memory Contract

- Localization performance risk: A game may ship many locales with large.
- voiceover fonts localized images FMV/audio.
- but should not load all shipped locales into memory at startup.
- Runtime residency: LOC-05/SYS-13 distinguish.
- SHIPPED LOCALE ON DISK is not RESIDENT LOCALE RESOURCES IN MEMORY.
- Active locale closure: The runtime keeps the active locale plus only the fallback/shared resources actually required by the current context.
- Large inactive locale voice/media packs remain nonresident.
- Locale switch: Representative.
- current locale A -> prepare locale B messages/fonts/required UI assets -> publish LocaleContextGeneration B -> release A-only unleased resources.
- Active dialogue/media occurrences may retain their current localized resource lease until their semantic presentation boundary completes under LOC-06.
- Fonts: Font fallback resources may remain resident/shared when several locales use them, but residency is resource/provenance-driven rather than "load every font family for every shipped locale.".
- Player startup: PERF-08 player startup loads only the locale resources required for the selected effective locale and first-scene/UI critical path.
- Export package vs memory: All ShippedLocaleSet packages may physically exist in one installation without implying equivalent runtime RAM use.

#### Authority placement: §9.15.3 Maker-product localization contracts (new under §9, after §9.14)

##### APPLOC-00 — Maker Product Catalog / Stable Product Message Identity

- Hard separation: RetroStage Maker's own interface uses a product-owned catalog, conceptually.
- ProductMessageCatalog ProductMessageId ProductLocalePack.
- This is shipped application content.
- It is not.
- StringTableDocument project content StudioLocalStateStore content plugin canonical data Runtime Save.
- Stable product identity: Editor labels/actions/errors use stable product message identity.
- Examples conceptually.
- app.file.openProject inspector.component.add problems.asset.missing export.status.building settings.language.
- Exact naming remains implementation-owned.
- UI code: React components and commands reference stable ProductMessageIds/descriptors, not English literals as persistent UI semantics.
- Display labels remain replaceable/localized.
- Structured diagnostics: OBS DiagnosticId remains the stable failure identity.
- The Maker UI resolves a localized product message for display.
- Changing editor language never changes the diagnostic code/correlation identity.

##### APPLOC-01 — Maker UI Locale / Regional Format / System Preference Resolution

- Separate user preferences: RetroStage Maker may maintain.
- MakerInterfaceLocalePreference MakerRegionalFormatPreference FollowSystemLanguage boolean/policy.
- as local application/user preferences.
- They do not dirty any project.
- Initial interface locale: When no explicit user preference exists, Electron/system preferred language information may seed the initial interface-locale choice.
- The resolver matches only installed/supported Maker locale packs.
- Explicit preference wins: Once the user explicitly chooses a Maker UI language.
- OS preferred language change is not silent overwrite.
- unless Follow System Language is enabled.
- Language vs regional formatting: The Maker UI language and number/date formatting locale are distinct concepts.
- For example.
- Interface Language = English Regional Format = Turkish / Türkiye.
- can be valid.
- Electron's system/preferred language APIs are platform evidence, not canonical project truth.
- Project language independence: Changing Maker UI language does not.
- change Project SourceLocaleId change game Preview Locale rewrite StringTableDocument change exported game language.

##### APPLOC-02 — Maker Hot-Switch / Restart Boundary / Locale Generation

- Product locale generation: Maker-localized projections bind.
- MakerLocaleGeneration EffectiveMakerLocaleId RegionalFormatGeneration where separate ProductCatalogRevision.
- Hot-switch: RetroStage-owned React/editor surfaces should re-resolve through the new Maker locale generation where safe.
- This includes.
- menus Inspector Hierarchy Problems Command Palette Launcher Studio surfaces settings onboarding status/progress.
- Native/platform boundary: Some Electron/Chromium/native OS UI resources may only reflect locale at application startup or may follow OS locale independently.
- The product must classify those surfaces honestly.
- If a restart is required for a specific native-shell locale change.
- Apply language -> persist preference -> explain restart requirement.
- rather than pretending a half-localized application is complete.
- Stale async projections: Locale-bound.
- search indexes menu models localized diagnostic text help content font/layout results.
- from an old MakerLocaleGeneration cannot republish after switch.
- Canonical safety: Locale switching is local presentation work.
- It cannot interrupt or rewrite an active canonical command/save transaction merely to translate its display label.

##### APPLOC-03 — Maker Diagnostics / Commands / Search / Help Localization

- Commands: Command identity is stable.
- CommandId is not localized command label.
- Command Palette may search localized label/keywords plus stable aliases, but invocation uses CommandId.
- Search indexes: Changing Maker locale invalidates/rebuilds only locale-sensitive search/ranking projections.
- Stable asset/entity/project IDs and canonical search truth do not change.
- Problems/diagnostics: A diagnostic stores.
- DiagnosticId structured fields stable target.
- and the UI renders localized explanatory text.
- Logs/bundles may keep stable machine-readable codes even when the UI is Turkish/Japanese/etc.
- Help/onboarding: Localized tutorials/help/onboarding content may be versioned with the Maker build or separately admitted documentation packs.
- Help text is not command/business-rule authority.
- Keyboard shortcuts: Shortcuts bind CommandIds, not translated labels.
- Locale changes do not silently remap creator shortcuts unless an explicit keyboard-layout policy owns that behavior.

##### APPLOC-04 — Plugin / Extension Product-UI Localization Namespace

- Plugin localization ownership: Plugins may contribute their own namespaced UI message catalogs.
- PluginId PluginLocaleCatalog PluginMessageId.
- through PLG public SDK rules.
- No core override: A plugin cannot replace.
- RetroStage core ProductMessageId security prompt text authority workspace trust prompt permission prompt core error wording.
- by claiming the same localized key.
- Fallback: Plugin UI fallback is bounded.
- requested Maker locale -> plugin-supported compatible locale -> plugin source/default locale -> explicit missing-plugin-localization marker/English/source as policy.
- A missing plugin translation does not make the core editor unusable.
- Permission/security prompts: Security-sensitive prompts remain host-owned RetroStage catalog/UI.
- Plugin-provided localized strings may describe the plugin's requested capability, but cannot spoof the final trusted permission surface.

##### APPLOC-05 — Core Startup / Safe Mode / Missing Catalog / Offline Fallback

- Core startup guarantee: The Core Project Admission Shell from SICE-H11 must remain usable even if an optional Maker locale pack is corrupt/missing.
- A built-in source/fallback product catalog sufficient for.
- New Project Open Project Safe Mode Reset language Settings critical error/recovery actions.
- is always available offline.
- Missing catalog: If the user's selected locale pack is unavailable/corrupt.
- start with known-good fallback locale -> show localized/fallback diagnostic -> retain user preference for repair/retry if appropriate.
- The app does not fail before the user can reach Settings/Safe Mode.
- No network dependency: Maker language packs required for normal supported operation are included locally in the installed artifact.
- Runtime UI does not fetch translations from a remote service merely to start.
- Update: Maker catalog revisions are tied to compatible application versions.
- A stale external catalog cannot silently replace current core messages.
- Remote hot language-pack update is not baseline.

##### APPLOC-06 — Maker Font / Bidi / CJK / Layout / Accessibility / IME Parity

- TXT-02 applies to Maker UI as well as exported game UI.
- Required Maker fixtures: Representative product surfaces must be tested with.
- Turkish English German/French expansion CJK Arabic/Hebrew RTL/Bidi samples combining marks emoji/grapheme samples large accessibility text scale IME composition.
- Exact commercial language list remains release-owned.
- Layout: Golden Layout panel geometry is local workspace state, but localized labels/text inside panels must handle expansion without corrupting layout persistence.
- Changing language can reflow content.
- it cannot rewrite dock topology merely because translated labels are longer.
- Bidi: Structural direction is controlled by UI/layout semantics.
- Where HTML/React structure is available, structural Bidi direction should use markup/layout direction rather than embedding invisible Unicode control characters as the primary application layout mechanism.
- Fonts: Core Maker fallback fonts needed for shipped locales are physically packaged and glyph-tested.
- Missing glyphs in.
- menus Problems security prompts project recovery export status.
- are release blockers for the claimed Maker locale.
- IME: Inspector/text editors/dialogue/string-table fields honor IME composition and MUI EditSession rules.
- Changing Maker UI language never commits or cancels a project text composition silently.

##### APPLOC-07 — Maker Localization Packaging / Electron Locale Resources / Clean-Machine Proof

- Packaged application: A supported Maker locale requires physical packaged proof.
- The build must include.
- RetroStage ProductLocalePack required Maker fonts required localized help/onboarding resources where claimed required Chromium/Electron locale resources for the selected packaging strategy.
- Electron distinction: Electron/Chromium has its own locale resources and system-language APIs.
- RetroStage product catalogs remain separate.
- The application cannot assume that shipping a Chromium locales directory automatically localizes RetroStage React UI.
- Likewise, a complete RetroStage catalog does not prove every native Chromium/OS surface can hot switch without restart.
- Clean-machine proof: For each claimed Maker locale class, packaged validation should include.
- fresh machine/profile no developer source tree offline startup selected locale persistence fallback behavior font/glyph availability Launcher/Core Admission project open Inspector/Problems settings PIE/export workflow Safe Mode/recovery.
- Installer/distribution: Installer/store/product-description localization remains distribution-owned at RSM-119.
- It does not become canonical project localization merely because the Maker itself is translated.

#### Authority placement: §9.15.3 Media playback semantic boundary (new under §9, after §9.14)

##### MED-00 — Media Capability Admission / Supported Playback Profile

- RetroStage should define a bounded MediaPlaybackCapabilityProfile or equivalent product capability rather than assuming "Electron can play the file".
- The effective profile is the intersection of.
- Requested media features ∩ admitted Source06 codec/container/backend set ∩ packaged-player platform capability ∩ product performance/budget limits = Effective Media Playback Capability.
- Capability dimensions: The admitted profile should freeze at least.
- accepted container(s) accepted video codec(s) accepted embedded audio codec(s) maximum supported dimensions / frame rate / bitrate / duration policy supported audio channel layouts fullscreen / rect presentation modes seek requirements hardware decode expectation and software fallback policy packaged-player local-resource access method color/output expectations subtitle/caption policy supported target platforms.
- Exact values are milestone-owned after Source06 audit.
- No implicit codec promise: File extension or MIME label alone is not proof of support.
- .mp4 is not guaranteed playable.
- .webm is not guaranteed playable.
- browser canPlayType() is not complete product capability authority.
- Runtime/backend probing may provide diagnostic evidence, but export/readiness uses the RetroStage-admitted capability profile and packaged-player proof.
- Unsupported source media: RetroStage may retain an imported source video as authoring/source evidence even if it cannot yet produce a supported runtime derivative.
- In that case.
- Preview/runtime/export capability = UNSUPPORTED / BLOCKED.
- with a creator-readable reason.
- It must not silently ship a file that only happened to play on the creator's development machine.
- the original source is preserved and the derivative identity participates in AST-01 revision/ derivative generation.

##### MED-01 — Media Asset / Playback Session Identity / Lifecycle / Generation

- Video playback uses RetroStage semantic identity rather than raw HTMLVideoElement, texture or decoder handles.
- Representative identities.
- MediaAssetId MediaDerivativeId / AssetRevisionId where applicable MediaPlaybackProfileId MediaPlaybackSessionId MediaPlaybackGeneration RuntimeSessionGeneration Scene/Section generation where applicable SequenceInstanceId where Sequence-owned.
- Lifecycle: Representative bounded lifecycle.
- REQUESTED -> PREPARING -> READY -> PLAYING ↔ PAUSED.
- PLAYING ↔ STALLED / BUFFERING where backend exposes it.
- PLAYING / PAUSED / STALLED -> TERMINATING -> COMPLETED / SKIPPED / FAILED / CANCELLED.
- Exact state names may differ.
- Terminal identity: A playback session has one accepted terminal result.
- COMPLETED SKIPPED FAILED CANCELLED.
- are semantic outcomes, not a collection of unrelated DOM/backend callbacks.
- Stale callback barrier: Late.
- ended error canplay seeked loadeddata audio completion texture upload decode completion.
- from playback generation N cannot mutate generation N+1 or a replaced RuntimeSessionGeneration.
- Cleanup: Terminal/invalidated playback releases only its own.
- media resource lease decoder/backend handle video texture/DOM element projection object/blob URL where used audio routing node/lease input lock pause contribution camera/UI/presentation contribution.
- through owning systems.
- No hidden global media object survives session replacement.

##### MED-02 — Codec / Container / Decode Backend / Hardware-Fallback Capability Gate

- Source06 authority: Exact media implementation is conditional.
- This alignment does not approve.
- FFmpeg binary proprietary codec bundle external codec DLL WebAssembly decoder OS-specific media framework third-party player runtime.
- by implication.
- Packaged-player proof: Before Video/FMV becomes Public Alpha supported, the exact target player build must prove.
- container recognition video decode embedded audio decode seek behavior where required end-of-stream behavior pause/resume packaged-resource access hardware decode behavior software/fallback behavior if claimed license/notice compliance failure diagnostics.
- on supported target environments.
- Hardware decode: Hardware acceleration is an optimization/capability, not gameplay authority.
- A hardware decoder failure may fall back only to an already-packaged/admitted backend/profile.
- The player must never.
- download a codec load an untracked native binary switch to an unapproved external executable.
- at runtime.
- Decode failure: Decode/backend failure produces a typed media failure and follows MED-06/MED-07 continuation policy.
- It must not leave.
- black screen permanent input lock permanent gameplay pause stuck Scene transition.
- as the only outcome.
- Runtime feature probing: Backend APIs such as codec/type support checks may contribute diagnostic evidence, but the product does not dynamically expand its commercial codec promise beyond the Source06-admitted capability.

##### MED-03 — Media Clock / A-V Sync / Stall / Seek / Duration Semantics

- Media time: Decoded audiovisual playback uses the selected media backend's coherent media clock for presentation.
- RetroStage does not try to drive decoded frames directly from the gameplay fixed-step clock.
- Gameplay boundary: media decode position is not gameplay semantic clock is not Sequence Event/Action authority.
- Consequential gameplay/story actions remain on RetroStage semantic Event/Action / Sequencer occurrence contracts.
- Sequence integration modes: A Sequence media track may support bounded synchronization modes such as.
- PRESENTATION_ONLY GATE_SEQUENCE_UNTIL_MEDIA_TERMINAL.
- or implementation-equivalent policies.
- Exact frame-lock between arbitrary video frames and consequential gameplay actions is not a baseline promise.
- If gameplay meaning must happen at a cinematic point, it uses an authored semantic Sequence marker/action rather than decoder frame callbacks.
- Stall / buffering: A playback profile declares bounded behavior for unexpected stall.
- pause media-owned sequence gate show allowed buffering/loading presentation allow skip if policy permits fail after bounded policy/timeout where appropriate.
- A stall cannot leave gameplay permanently paused with no terminal route.
- Seek: Seek support is admitted only when the chosen codec/container/backend proves it.
- Seek result is semantic when backend confirms an accepted position.
- decoder keyframe behavior and approximation are not hidden gameplay state.
- Runtime seeking across consequential Sequence actions remains governed by SEQ-03.
- Duration / end: Authoring/runtime should use validated media duration metadata where available but must tolerate backend duration uncertainty/failure explicitly.
- ended, duration boundary and explicit stop must converge on one terminal arbitration path under MED-06.

##### MED-04 — Video Presentation / Aspect / Color / Safe Area / Renderer-Loss Semantics

- Presentation modes: The bounded authoring model may support.
- FULLSCREEN FIT FILL / CROP CUSTOM_RECT.
- as already retained by the roadmap.
- Aspect ratio: Source aspect ratio is preserved unless the creator explicitly chooses a crop/fill policy.
- Silent non-uniform stretching is not the default.
- The editor preview should show the same fit/fill/crop rule used by PIE/player.
- Safe area / overlays: Custom-rect and fullscreen video must compose with.
- subtitles/captions skip prompt pause/menu overlay where allowed safe-area / overscan rules.
- through RUI ownership.
- Normal HUD may be hidden while subtitle/skip accessibility layers remain independently controlled.
- Color / SDR output: Video presentation participates in the VIS-01 SDR/color-management contract.
- The exact decoder/browser color-conversion behavior must be validated for the admitted media profile, including representative.
- black level white level gamma/transfer behavior color primaries/matrix metadata where applicable full/limited-range handling where relevant.
- or a documented bounded fallback.
- A video should not appear materially washed out/crushed between Preview and packaged Player because different unreviewed paths were used.
- Backend presentation: Whether implementation uses a DOM/video overlay, Babylon video texture or another admitted adapter is an implementation detail.
- The semantic media session/presentation contract remains identical.
- Renderer/device loss: If video is projected through GPU texture resources, renderer/device-loss recovery must rebind or reconstruct that presentation without replaying media terminal/gameplay actions.
- If the admitted overlay path survives renderer reset independently, it still validates current MediaPlaybackGeneration before continuing.

##### MED-05 — Media Audio Routing / Bus / Pause / Ducking / Volume Authority

- Embedded media audio participates in RetroStage Audio authority.
- A video element/decoder cannot bypass.
- Master volume mute cinematic/media bus level pause policy ducking/snapshot policy accessibility/player settings.
- merely because its backend can output sound directly.
- Media audio bus: A bounded semantic route such as.
- MEDIA / CINEMATIC bus.
- may be admitted by the Audio owner.
- Exact bus naming remains RSM-45/RSM-88-owned.
- Volume: Creator audio volume becomes a media-session contribution multiplied/composed with effective runtime Audio settings.
- It is not a second master-volume system.
- Pause: Media pause behavior is explicit.
- pause with gameplay continue while gameplay paused pause only when Pause Menu owns the screen.
- according to the supported playback profile.
- The default for a fullscreen gameplay-pausing FMV should be creator-readable and consistent.
- Ducking: If media playback ducks music/ambience/dialogue, it enters AUD-02 scoped snapshot/ducking composition.
- Stopping/skipping/failing the video removes only its own ducking contribution.
- Double-audio safeguard: A media profile should make explicit whether audio comes from.
- embedded media audio or separate RetroStage Audio track.
- where both would otherwise produce duplicate dialogue/music.
- Any deliberate mixed use is explicit.

##### MED-06 — Input Lock / Skip / Terminal Outcome / Exactly-Once Continuation

- Scoped input/pause: Video playback may acquire scoped.
- gameplay input lock skip-input capture gameplay pause contribution HUD/presentation policy.
- through existing Input/UI/runtime owners.
- The media session never flips a global inputDisabled flag without ownership.
- Skip request: Skip Request -> validate session + skippable policy -> single-flight terminal arbitration -> commit SKIPPED -> release media-owned leases -> execute the authored skip continuation exactly once.
- Repeated button presses cannot create multiple terminal operations.
- Terminal result: Downstream continuation receives a typed terminal result.
- COMPLETED SKIPPED FAILED CANCELLED.
- On Finished normalization: Creator-facing On Finished must not remain ambiguous.
- The alignment direction is.
- On Completed On Skipped where exposed On Failed where exposed On Terminal / continuation policy.
- or an equivalent typed result surface.
- If product UX keeps a single On Finished field, the profile must explicitly define whether SKIPPED counts as completion.
- Exactly-once continuation: Only one accepted terminal outcome can trigger.
- story/event continuation Sequence continuation Scene transition continuation input restoration pause restoration UI teardown.
- for one MediaPlaybackSessionId.
- Failure policy: A media use declares a bounded failure policy, for example.
- OPTIONAL_MEDIA_SKIP_AND_CONTINUE REQUIRED_MEDIA_ABORT_TO_SAFE_STATE FALLBACK_TO_LOADING_PRESENTATION.
- Exact labels remain milestone-owned.
- A failed optional FMV must be able to continue the game safely if the creator/profile allows it.
- A failed required FMV cannot silently pretend the required content played.

##### MED-07 — Sequencer / Scene Transition / Loading / Resource-Headroom Integration

- Sequence ownership: A Video/FMV track is a Sequencer presentation/media track under SEQ-01–04.
- It does not gain.
- Story authority Scene activation authority Save authority input authority Audio authority.
- from its timeline placement.
- Scene transition example: A bounded transition may be.
- Door Interaction -> Fade Out -> checkpoint if allowed -> prepare FMV -> play FMV while destination resources may PREPARE -> media terminal policy -> destination readiness barrier -> Scene/Section commit -> restore player -> Fade In.
- Media does not own Scene commit: On Completed / On Skipped may request/continue a typed Scene transition, but LVL-05/06 and SYS-02 still decide whether the destination can commit.
- End before destination ready: If video ends/skips before the destination is ready.
- do not enter an unready Section.
- The transition uses its approved loading/fallback presentation until readiness or failure.
- Destination ready before media ends: If the destination becomes ready while required video is still playing, its required resources remain safely leased/pinned until the transition commits or cancels.
- Memory headroom: LVL-09 transition budgeting includes.
- media decoder/buffer video presentation texture/overlay resources embedded audio buffer/state current Section required residency destination PREPARING residency transition UI/presentation resources.
- A large FMV must not cause the Resource Manager to evict the destination/current state needed to finish safely.
- Cancellation/session replacement: Scene transition cancellation, Retry, Load, New Game or session replacement cancels/invalidates the media session through generation checks and releases only its owned resources.

##### MED-08 — Runtime Save / Restore / Play-Once / Crash-Recovery Semantics

- Default Public Alpha direction: Video decoder/playhead state is not baseline Runtime Save truth.
- A live fullscreen/transition FMV should normally contribute.
- SAVE_DEFERRED or SAVE_BLOCKED.
- unless an explicitly reviewed safe-marker/resume policy is admitted.
- No arbitrary decoder-position save: Saving.
- currentTime = 17.384s decoder internal state buffer state HTMLVideoElement state.
- is not a portable semantic restore contract.
- Safe semantic progress: If the cinematic has required persistent meaning, that meaning is committed through.
- Story State Objective Sequence marker typed Event/Action Scene transition.
- at explicit semantic boundaries.
- Media playback itself does not create a hidden permanent "watched" database.
- Play-once behavior: If a creator wants an FMV to play only once, the condition uses an explicit semantic owner such as Story State / Sequence progression.
- HasWatchedIntroVideo.
- may be an authored Story State fact if product semantics require it.
- it is not hidden media-player history.
- Restore/crash behavior: After Load/Retry/crash recovery, the game resumes from the last promoted semantic state.
- Depending on authored commit boundaries, the FMV may legitimately.
- play again be skipped because the required Story State already committed resume from an admitted safe marker if a future profile supports it.
- but cannot infer this from stale decoder time.
- Mid-sequence integration: If video is inside a saveable Sequence, SEQ-04 safe-marker rules own the semantic resume point.
- Media decode reconstruction cannot replay already committed gameplay/story actions.

##### MED-09 — Cook / Packaging / Local URI / Untrusted-Media / Resource Budget

- Cooked media identity: Runtime media loads through stable cooked asset/derivative identity under AST-01 and the Resource Manager.
- MediaAssetId -> accepted AssetRevision / media derivative -> CookManifest -> contained packaged-player local resource -> Media adapter.
- Source-project absolute paths are not player media authority.
- Local-only baseline: Exported player FMV playback is local/cooked content.
- This capability does not admit.
- remote HTTP video embedded remote web player streaming service URL DRM platform user-provided arbitrary runtime URL.
- Security: Imported/cooked media is treated as untrusted binary input.
- Import/readiness should validate bounded.
- container/header recognition declared vs observed media type dimensions duration where available frame rate track count audio channels/sample rate bitrate/size metadata/string sizes.
- according to the admitted profile.
- Extension alone is not trusted.
- Resource budget: Media policy should bound.
- source/cooked file size decode dimensions/frame rate decoder surface count buffer/preload memory simultaneous playback session count GPU texture memory where video texture is used audio decode/buffer cost.
- No whole-file JS-heap requirement: The playback backend should not require loading arbitrarily large FMV files wholesale into Renderer JavaScript memory merely to play them.
- The exact admitted local resource delivery/range/seek mechanism must be proven in packaged Electron.
- Packaging proof: Tests must run against the actual packaged Player layout, not only Vite/dev URLs.
- No arbitrary codec execution: Media metadata cannot name an executable, decoder DLL, JS module, WebAssembly module or external tool to load.

##### MED-10 — Captions / Subtitles / Localization / Accessibility / Diagnostics / Parity

- Captions/subtitles: Video dialogue should be able to use a RetroStage-owned external caption/subtitle cue asset or equivalent typed data rendered through the existing RUI subtitle layer.
- Representative cue identity.
- MediaCaptionTrackId CaptionCueId start/end media time localized text/string identity speaker/style metadata where supported.
- Exact schema remains RSM-47/RSM-87/localization-owned.
- Embedded tracks: Embedded container subtitle tracks are not automatically canonical authoring/localization truth.
- They may be unsupported/ignored unless separately admitted.
- This avoids browser/backend-specific subtitle UI and keeps typography/safe-area/accessibility parity under RetroStage control.
- Burned-in text: Burned-in video text is allowed as creator content but cannot provide the same localization, readability or accessibility control as semantic caption tracks.
- Locale variants: A project may later support bounded localized media variants through stable media/profile identity, but this does not create a full localization-media-management platform.
- Subtitle lifetime: Caption layer behavior under.
- pause skip menu overlay fullscreen fit/fill/custom rect.
- follows RUI subtitle ownership.
- Skipping/ending media clears only that media session's active caption occurrence.
- Diagnostics: Creator-readable media diagnostics should cover at least.
- Preview / PIE / packaged Player parity: Representative media assets must be tested across.
- Asset/Media Preview Sequencer Preview PIE Cooked Packaged standalone Player.
- The packaged Player is the final authority for media capability.
- Raw browser/decoder logs are supplemental.
- creator diagnostics remain primary.

#### Authority placement: §9.15.3 Runtime UI, focus, settings and presentation contracts (new under §9, after §9.14)

##### RUI-00 — Runtime UI Backend Admission & Export Boundary

- Source ambiguity found: The current technology direction contains a material ambiguity that must be normalized before RSM-87 implementation.
- React is described as an editor UI technology and not a canonical storage model.
- The exported-player baseline lists a minimal Electron player + Babylon runtime + RetroStage runtime core, without explicitly naming React.
- Another dependency-classification section lists React as a FOUNDATION_RUNTIME example.
- RSM-87 says React may support editor authoring while player UI must be export-safe and RetroStage-owned.
- This candidate does not guess the eventual player UI backend.
- EXACT PLAYER-UI RUNTIME BACKEND = RSM-87 MILESTONE-GATED IMPLEMENTATION / ADMISSION DECISION.
- REACT IN EXPORTED PLAYER = NOT ASSUMED BY THIS CANDIDATE.
- EDITOR UI STACK IN EXPORTED PLAYER = NOT IMPLIED.
- RSM-87 must physically prove the selected runtime UI implementation against.
- export/package size startup/runtime cost controller/keyboard/pointer behavior focus/accessibility localization/text behavior safe-area/layout behavior security/CSP offline/local cooked-content boundary Preview/PIE/Player parity clean-machine packaging resource cleanup.
- Packaging guardrail: The player must not accidentally inherit editor-only infrastructure such as.
- Golden Layout editor docking/layout state editor-only Radix surfaces editor-only diagnostics/workbench code Zustand editor transient stores authoring-only XState workflows Storybook/testing infrastructure.
- If React/React DOM is selected for exported-player UI, that inclusion must be explicit in Source06, package manifests and release evidence.
- it is not granted merely because React is already used by the editor.
- No second player UI authority may coexist beside the selected RetroStage runtime UI contract.
- unless a later exact package-level admission explicitly proves a justified runtime role.

##### RUI-01 — Runtime Screen/Layer State Authority & Instance Identity

- Runtime UI navigation must have a RetroStage-owned typed state model.
- React/component-local state, DOM presence or animation visibility must not become Screen Stack authority.
- Every active screen instance should have stable runtime identity sufficient for lifecycle, focus, async work and diagnostics, for example.
- screenDefinitionId screenInstanceId parent/opener identity where applicable runtimeSessionGeneration open sequence / stack generation screen policy identity lifecycle state.
- Exact field names may differ.
- Screen operation semantics: Operations such as.
- OPEN CLOSE REPLACE BACK / RETURN PUSH MODAL DISMISS MODAL.
- must commit through one deterministic screen-stack/runtime-UI authority.
- A screen must not become active merely because a component mounted.
- A component unmount must not silently mean the semantic screen operation succeeded.
- Lifecycle: A bounded lifecycle should distinguish equivalent states such as.
- OPENING ACTIVE CLOSING CLOSED.
- where transitions or async cleanup make the distinction material.
- A stale screen instance cannot regain focus, policy or input authority after it has closed or after its runtime session generation is superseded.

##### RUI-02 — Effective Screen-Policy Composition & Scoped Control Leases

- Pause World Player Movement Player Actions Camera Input Gameplay HUD Mouse Cursor Input Context Audio Snapshot Save Eligibility Interaction.
- but nested screens can still be implemented incorrectly if each screen imperatively toggles these systems on enter/exit.
- Example failure.
- Gameplay -> Pause pauses world -> Settings -> Confirm Modal -> close modal accidentally resumes world.
- because the child blindly restores a previous boolean.
- Effective player/runtime policy must be derived from the currently accepted active UI stack/layers/scopes, not implemented as unowned enter/exit side effects.
- Active Screen Stack + Modal Layers + Explicit UI Scopes -> deterministic ScreenPolicy composition -> EffectiveRuntimeUiPolicy -> scoped pause / control / cursor / HUD / audio / save-eligibility effects.
- Required scoped semantics: Where a policy creates a lock/override, ownership should remain tied to the active screen/scope that requested it.
- Closing one child screen must not release.
- world pause movement lock camera lock cursor mode HUD suppression audio snapshot save eligibility restriction.
- still required by another active owner.
- Reference-count-like implementation is not mandated.
- scoped ownership is.
- Policy precedence: Conflicts must have bounded deterministic precedence.
- System / Critical and Modal layers may preempt presentation/focus, but they still must not silently rewrite gameplay state.
- Policy recomputation after stack changes should be atomic from the player's perspective.

##### RUI-03 — Focus / Back / Modal / Device-Capture Continuity

- Focus and input capture require explicit runtime ownership, not incidental browser focus behavior.
- A focus scope should be bound to an active screen/modal instance.
- Where applicable, runtime UI should track.
- focusScopeId current focused semantic element return-focus target input context device family pointer/cursor capture state modal trap state.
- Required safeguards: A stale/closed screen cannot asynchronously reclaim focus. - Modal focus remains trapped inside the active modal until dismissal. - Closing a modal restores focus only to a still-valid target/scope. - Back/Cancel has one semantic owner at a time. - The same physical input cannot both dismiss UI and trigger gameplay. - Device hot-swap may update glyph/presentation without synthesizing a gameplay/UI confirm action. - Window/focus loss clears or safely reconciles held UI/gameplay actions. - Pointer capture loss cannot leave camera/gameplay controls latched. - A screen transition cannot expose a one-frame input leak into gameplay.
- Controller navigation: Focus navigation must use semantic component order/relationships, not DOM accident alone.
- Disabled/unavailable items must not trap focus.
- No-focusable-element states must have a defined fallback rather than leaving the player unable to navigate or dismiss the screen.

##### RUI-04 — Coherent Runtime Binding Snapshot / UI View Model

- health ammo weapon state objective interaction target status conditions boss state save status.
- If widgets read unrelated mutable services independently, a single rendered UI update can show a mixed runtime generation.
- Player UI should consume typed, read-only runtime binding/view-model snapshots assembled at an accepted semantic boundary.
- gameplay/runtime authorities -> accepted semantic snapshot/binding projection -> RuntimeUiViewGeneration -> HUD / Screen bindings.
- This snapshot is derived UI input, not gameplay or save authority.
- UI rendering may lag by a bounded frame/update, but it must not invent mixed semantic truth. - A binding carries stable semantic identity and validity. - Unavailable is explicit.
- missing data must not silently become zero/false/default if that changes player meaning. - UI actions never use the displayed value itself as proof that an operation is still valid. - Consequential actions revalidate against the owning runtime system at commit time.
- Example.
- UI displays "Use Key".
- does not authorize key consumption after the key/door state changed. The Interaction/Inventory owner revalidates.
- Performance boundary: High-frequency visual interpolation may be presentation-local, but authoritative semantic binding updates should remain bounded and diagnosable rather than forcing arbitrary whole-UI rerenders on every engine callback.

##### RUI-05 — Async UI Lifetime & Stale Completion Rejection

- Async player-UI work must bind to its owning screen/session/settings/locale generation where material.
- Representative async work.
- save-slot metadata save thumbnail decode font load image/icon load localized resource resolution live-menu background preparation device/capability query settings apply delayed notification asset.
- A completion must verify that its owner is still current before publication.
- Representative acceptance identity.
- runtimeSessionGeneration screenInstanceId / owner scope requested asset/slot identity locale/settings generation where material.
- Required safeguards: Closing a screen invalidates or ignores stale screen-owned completion. - Starting a new runtime session invalidates prior-session UI async work. - Locale change rejects stale prior-locale text/layout completion. - Save-slot refresh rejects stale metadata/thumbnail results. - Replaced/disposed image/font/resource handles cannot be republished by an older callback. - Cancellation/teardown is explicit where resources or background work survive beyond one tick.
- This reuses the project-wide generation-lease philosophy without creating an unrelated async authority.
- Required safeguards: Closing a screen invalidates or ignores stale screen-owned completion.
- Starting a new runtime session invalidates prior-session UI async work.
- Locale change rejects stale prior-locale text/layout completion.
- Replaced/disposed image/font/resource handles cannot be republished by an older callback.

##### RUI-06 — Consequential UI Operation Single-Flight & Idempotency

- Player UI actions that cause consequential runtime/application transitions require one semantic operation identity and bounded single-flight/idempotency behavior.
- Representative operations.
- New Game Continue Load Save Delete Save Retry Return to Main Menu Quit Apply Display Settings Reset Input Bindings.
- Required flow: UI intent -> operation request / correlation identity -> semantic owner validates -> single accepted operation -> pending/result projection to UI.
- Double-click, key-repeat, controller+mouse overlap or duplicated event delivery must not create two accepted operations.
- Required safeguards: Two Continue clicks cannot start two runtime sessions. - Two Retry actions cannot mint two competing replacement sessions. - Save cannot promote twice from one user occurrence. - Delete Save confirmation cannot delete a newly replaced slot by stale index. - Closing a UI screen does not automatically cancel an already committed operation unless that operation explicitly supports cancellation. - UI disabled/pending state is presentation.
- the semantic service still enforces idempotency.

##### RUI-07 — Save-Slot Stable Identity / TOCTOU Protection

- Save/Load UI must operate on stable save-slot/save-generation identity, never transient list index, visible timestamp or thumbnail order.
- A rendered save-slot row may bind to.
- SlotId save generation / manifest identity where applicable compatibility status corruption status metadata revision thumbnail identity.
- Revalidation: Operations such as.
- LOAD DELETE OVERWRITE CONTINUE.
- must revalidate the selected semantic identity at execution time.
- If the slot changed between display and commit, the operation must.
- refresh/reconfirm or fail safely.
- rather than act on a different physical save.
- Continue: Continue remains owned by Runtime Save.
- newest compatible valid save.
- and should be resolved/revalidated at action time rather than freezing a stale UI-sorted result.
- Thumbnail rule: A thumbnail is presentation metadata.
- thumbnail identity is not save-slot authority.
- Missing/corrupt thumbnail must not make a valid save disappear or change slot identity.

##### RUI-08 — Settings Apply/Revert & Input-Recovery Transaction

- Runtime Settings UI must distinguish.
- REQUESTED SUPPORTED EFFECTIVE PERSISTED.
- settings where failure or device capability matters.
- A UI control value alone is not effective runtime truth.
- Display/graphics settings: Potentially disruptive settings such as.
- display mode resolution presentation quality VSync where supported internal/output scaling options.
- should apply through a bounded transaction.
- requested candidate -> validate capability/range -> apply -> verify usable output -> commit persisted setting.
- or.
- > failure / timeout / device problem revert to last known usable setting.
- Exact confirmation countdown UX is not mandated, but the player must not be permanently stranded on an unusable display configuration by one failed setting.
- VIS-05 and VIS-10 lifecycle/reconstruction rules apply when display changes invalidate temporal or GPU resources.
- Input settings: Rebinding must not allow the player to irrecoverably remove all supported paths for essential UI navigation.
- The product should preserve a recovery route for actions such as.
- CONFIRM CANCEL / BACK PAUSE / MENU RESET TO DEFAULTS.
- according to supported device families.
- Binding conflicts, duplicate essential actions and unsupported device inputs must be explicit.
- Accessibility/UI scale: Player text/UI scale and accessibility overrides should clamp to supported ranges that preserve access to critical modals/actions and safe-area navigation.
- A huge/small scale setting must not make the only recovery controls unreachable.

##### RUI-09 — UI Save/Restore Participation Classification

- Most runtime UI state is transient presentation state and must not silently enter Runtime Save.
- Default non-save UI state includes.
- open Pause screen screen stack modal visibility hover/focus current selected UI row scroll position notification animation progress cursor position temporary pending spinner HUD enter/exit animation state.
- Player Settings belong to their own typed user/settings authority, not ordinary gameplay save unless a specific setting contract says otherwise.
- Narrative, inventory, objective, dialogue-choice and gameplay state shown by UI remains owned by those semantic systems.
- Restore: Loading a save should reconstruct UI from the restored gameplay/runtime state plus a defined post-load UI baseline.
- Hydration must not restore a stale Pause/Inventory/modal stack merely because those screens were open when a save was captured.
- If a future feature intentionally persists a UI-like semantic state, it requires an explicit owner and save-participation contract rather than serializing generic screen state.

##### RUI-10 — Notification / Toast Queue Identity, Backpressure & Clock Semantics

- The existing Notification Profile concepts.
- priority queue policy duplicate policy duration.
- should be hardened with stable occurrence/lifetime semantics.
- A notification occurrence should be able to carry.
- notification occurrence identity semantic source/event identity priority duplicate/coalescing key presentation lifetime policy clock domain owner/session generation.
- Backpressure: The queue must be bounded.
- A flood of low-priority gameplay messages must not.
- grow memory without bound starve critical messages hide a save failure delay a death/retry/system message indefinitely.
- The profile may coalesce/drop/summarize lower-priority notifications according to explicit policy.
- Critical / System notifications must have a defined non-silent overflow/preemption behavior.
- Time semantics: Notification duration must bind to an explicit UI/runtime presentation clock and define behavior during.
- Pause slow motion / hit stop where relevant screen replacement session replacement.
- Raw platform timers are not durable notification authority.
- Repeated gameplay event delivery must not create duplicate toasts when duplicate policy says one semantic occurrence.

##### RUI-11 — Dialogue / Subtitle Timing, Advance & Grapheme Safety

- Dialogue/subtitle presentation timing must use semantic text/audio/runtime timing rather than renderer frame count or raw DOM timing.
- Existing behavior remains.
- first advance -> complete current reveal.
- next advance -> advance line.
- unless the selected profile explicitly chooses another supported bounded policy.
- Grapheme safety: Typewriter/reveal must operate on Unicode grapheme-aware text semantics rather than UTF-16 code units or naive byte/code-point slicing.
- It must not split.
- combining marks emoji sequences supported complex grapheme clusters.
- during reveal.
- Voice/audio synchronization: For profiles using.
- VOICE_END TIMED MANUAL.
- auto-advance, the owner must define.
- voice-start readiness/failure behavior voice-end occurrence identity pause behavior interruption behavior skip/advance behavior fallback when voice is missing/late.
- A duplicated voice-end/audio callback must not advance two lines.
- Critical synchronized audio follows the existing audio-latency/readiness contract.
- Subtitle lifetime: Subtitles remain readable according to their layer/profile and must not be accidentally discarded merely because normal HUD is hidden.
- Pause/menu/cinematic policies should explicitly define whether an active subtitle.
- continues freezes hides or is replaced.
- for the supported presentation mode.

##### RUI-12 — Bounded Rich Text / Asset URI / DOM Security

- Because RetroStage uses Electron/browser technology and supports bounded Rich Text, localized text, images/icons and authored UI content, player UI must not interpret project text as arbitrary HTML, CSS, JavaScript or remote navigation.
- Required security boundary: TextId/string-table content = text / typed formatting data.
- NOT = trusted HTML/JS.
- Bounded Rich Text should use an allowlisted RetroStage-owned token/markup model.
- Formatting arguments must be escaped/typed so user/content data cannot inject executable markup.
- Prohibited default behavior: Runtime player UI must not permit authored content to become.
- dangerously-set arbitrary HTML inline JavaScript javascript: URL remote web navigation uncontrolled file:// navigation arbitrary iframe/webview remote executable UI privileged Electron IPC channel selection.
- Asset references: Images/icons/fonts and UI media should resolve through stable RetroStage asset/cooked identities or other explicitly admitted local presentation references.
- Raw arbitrary URL strings must not become player-UI asset authority.
- Actions/links: If bounded rich text or UI supports clickable semantic links/actions, they must map to allowlisted RetroStage action identities and pass normal runtime validation/authorization.
- A displayed string cannot name an arbitrary Electron/IPC command.
- Packaging: This contract aligns with the existing Electron requirements.
- sandboxed renderer context isolation restrictive CSP no remote privileged content typed IPC navigation/new-window restriction.
- and must be proven in the actual selected RSM-87 runtime UI backend.

#### Authority placement: §9.15.3 Runtime VFX/audio/media lifetime contracts (new under §9, after §9.14)

##### VFX-01 — Effect Occurrence Identity / Pool Reset Safety

- A pooled Babylon/particle/render object can retain stale mutable state if it is reused as though engine-object identity were effect identity.
- That can produce failures such as.
- old target/bone attachment leaks into new effect old seed/variation survives reuse old event listener fires for the new occurrence old material/module parameter survives old owner callback mutates a recycled effect one semantic hit creates several visible pooled occurrences.
- Every runtime VFX play/spawn is a semantic effect occurrence separate from any pooled engine instance.
- A representative occurrence should bind the relevant subset of.
- effectOccurrenceId effectDefinitionId semantic source/event identity owner stable identity runtime/session/Scene/Section generation attachment identity seed / RNG provenance where deterministic meaning matters start clock/domain lifetime policy priority/budget class.
- Exact fields may differ by effect type.
- Pool reset invariant: Before a pooled engine instance is accepted for a new occurrence, all mutable state that can affect the new occurrence must be reset/rebound according to its definition.
- Representative reset surface.
- owner/target attachment transform/local offset seed/random stream state emitter/module parameters material parameters visibility/enabled state age/lifetime event listeners/callbacks collision/decal target state where supported screen/camera association.
- Identity rule: pooled particle/emitter/decal object identity is not effectOccurrenceId.
- A stale callback from occurrence A cannot act on a pooled instance after it has been rebound to occurrence B.
- Repeated delivery does not automatically duplicate a one-shot VFX effect when the owning event contract is idempotent.

##### VFX-02 — VFX Space / Attachment / Lifetime / Teardown

- Every effect type should declare its semantic spatial/lifetime mode rather than infer it from a raw engine parent pointer.
- Representative spaces.
- WORLD LOCAL_TO_ENTITY LOCAL_TO_BONE / ATTACH_POINT where supported SCREEN / VIEW UI / PRESENTATION_LAYER where explicitly owned.
- Exact vocabulary may differ.
- Attachment identity: Entity/bone attachment uses stable RetroStage semantic identity/adapters.
- A raw Babylon node pointer is not the durable VFX owner/attachment contract.
- Owner teardown: When the owner/target is.
- despawned unloaded replaced session-superseded bone/attachment-invalidated.
- the VFX definition/lifetime policy must deterministically choose an allowed outcome such as.
- STOP FINISH_IN_WORLD DETACH_AND_FINISH RECONSTRUCT / REBIND only when explicitly supported.
- No effect should become an orphan merely because an engine parent disappeared.
- Scene / Section: Scene/Section transition behavior inherits SYS-02.
- An effect may not survive an unloading semantic scope just because its GPU/engine object has not yet been garbage-collected.
- Decal / persistent presentation: A decal that materially persists beyond the source occurrence must have explicit owner/lifetime and save/reset classification.
- Persistent-looking does not automatically mean Runtime Save participation.

##### VFX-03 — VFX Budget / Backpressure / Priority / Degradation

- Unbounded effect creation can produce.
- memory pressure GPU overdraw explosion frame-time spikes critical telegraph loss queue/pool growth.
- Every runtime VFX family should participate in bounded capacity/budget semantics.
- A VFX occurrence may carry or derive.
- priority class critical-presentation requirement where applicable pool/capacity class quality-tier behavior fallback/degradation policy.
- Backpressure: At capacity, the runtime must use an explicit bounded policy such as.
- DROP_LOWEST_PRIORITY COALESCE REUSE_ALLOWED_SLOT DEGRADE_TO_CHEAPER_VARIANT REJECT_WITH_DIAGNOSTIC.
- according to the effect/profile.
- Exact policies are owner-defined.
- silent unbounded allocation is not allowed.
- Critical presentation: A purely decorative spark may be dropped.
- A creator-locked attack telegraph or materially required screen cue must not silently disappear while the runtime still claims presentation parity.
- If the required presentation cannot be delivered, the system must use an approved fallback or surface a diagnosed unsupported/degraded state under SYS-06.
- Accessibility / comfort: Full-screen flash, flicker, strong distortion and similar effects must respect the existing reduced-motion/flicker/comfort settings policy where relevant.
- A comfort override may alter presentation intensity, but must not silently remove required gameplay meaning.
- an alternate readable cue should exist when the original effect carried required meaning.

##### VFX-04 — VFX Clock / Seed / Save-Restore Semantics

- Every effect with semantic timing must bind to an explicit RetroStage clock/domain and declare behavior under.
- Pause time scale hit stop Scene/Section transition session replacement.
- Raw render-frame age is not gameplay authority.
- Deterministic variation: Where deterministic authored meaning/regression depends on variation.
- effectDefinitionId + semantic occurrence identity + domain-separated RetroStage RNG provenance.
- should be sufficient to derive repeatable VFX variation.
- Unrelated RNG systems must not perturb it.
- Save / restore: Raw active VFX engine instances are not Runtime Save state.
- Default rule.
- semantic owner state -> load/restore -> reconstruct only approved VFX presentation.
- A one-shot effect whose semantic occurrence already committed before save must not automatically replay on restore.
- A long-lived effect that must be visible after restore should be reconstructed from its semantic owner/state, not serialized particle positions/emitter handles.
- Exact particle simulation frame restoration is not promised.

##### AUD-01 — Cue / Voice Occurrence Identity & Voice Allocation

- Every accepted audio play should create a semantic cue/voice occurrence distinct from an engine voice/source node.
- Representative occurrence identity.
- audioOccurrenceId cueId semantic source/event identity owner/lifetime scope runtime/session/Scene/Section generation bus priority criticality / synchronization class spatial emitter identity where applicable.
- Identity rule: WebAudio/Babylon voice/source identity is not audioOccurrenceId.
- A recycled/virtualized engine voice cannot inherit semantic authority from a previous occurrence.
- Voice allocation: The runtime should use bounded voice/capacity policy.
- A cue/profile may derive.
- priority max simultaneous occurrences duplicate/coalescing policy steal policy virtualization/degradation policy where supported.
- Critical cues: A synchronization-critical dialogue/sequence/UI cue must not be silently stolen by a lower-priority decorative sound.
- If required capacity/readiness is unavailable, the owning contract chooses an explicit.
- BLOCK / DEFER DEGRADE WITH DECLARED FALLBACK FAIL WITH DIAGNOSTIC.
- path.
- Repeated event delivery: Repeated Event/Action/audio callback delivery must obey cue repeat/idempotency semantics.
- A one-shot semantic occurrence cannot mint multiple committed voices merely because the UI, animation or sequence sent the same occurrence twice.

##### AUD-02 — Bus / Snapshot / Ducking Scoped Composition

- Gameplay mix -> Dialogue ducks music -> Pause snapshot applies -> child modal closes -> child restores "normal" -> dialogue duck is accidentally lost.
- Mixer/snapshot/ducking effects must be scoped contributions composed by the authoritative audio runtime rather than independent global set/reset side effects.
- active audio scopes game state dialogue UI sequence Scene/Section accessibility/settings -> deterministic mixer/snapshot composition -> effective bus state.
- Scoped ownership: Closing/cancelling one scope removes only its own contribution.
- It cannot release.
- ducking music suppression ambience attenuation UI mix override sequence snapshot.
- still required by another active scope.
- Precedence / composition: Conflicting gain/snapshot/ducking rules require bounded deterministic composition.
- The exact DSP/mixer implementation remains RSM-88-owned.
- Restore: Audio scope restoration after interruption/transition must validate owner generation before reapplying state.
- A stale dialogue/sequence/UI scope cannot restore an older mixer snapshot over newer player or Scene audio state.

##### AUD-03 — Listener / Emitter / Spatial / Occlusion Authority

- Existing invariant: There is one runtime listener authority independent of active camera count.
- Hardening decision: The effective listener must have an explicit semantic pose/source policy.
- Possible policy sources may include.
- active gameplay camera pose player/head/listener anchor explicit authored listener anchor profile-defined blend/transition.
- The exact supported set belongs to RSM-88.
- A camera object becoming active does not automatically steal listener authority.
- Camera transitions: Fixed-camera cuts/blends must define listener transition behavior separately from visual camera transition behavior.
- The product should avoid unintended.
- instant spatial pan reversal distance jump occlusion discontinuity duplicate listeners.
- caused solely by camera-object churn.
- Emitters: A spatial emitter binds to stable RetroStage owner/entity/attachment identity.
- Entity despawn/Section unload invalidates the emitter according to its audio lifetime scope.
- Occlusion: If occlusion/spatial queries are asynchronous or backend-derived.
- query result -> owner/emitter/listener generation validation -> accepted audio parameter update.
- is required.
- Stale occlusion results cannot alter a new emitter/listener generation.
- GameplayNoise: This contract never merges audible audio with AI hearing.
- audible mix / occlusion / gain is not GameplayNoise semantic truth.
- remains binding.

##### AUD-04 — Music / Ambience Transport & Adaptive Transition State

- Adaptive music/ambience should have RetroStage-owned semantic transport/state identity.
- Representative state may include.
- music/ambience state identity current semantic cue/section pending transition identity transition policy loop/segment identity owner/session/Scene scope optional semantic position/phase when the profile requires it.
- Raw audio-node/playhead identity is not transport authority.
- Transition single-flight: Competing music-state requests must resolve deterministically.
- A newer accepted transition may supersede/cancel an older pending transition according to the profile.
- both must not silently complete and fight over the mix.
- Transition policy: Supported transitions may be bounded combinations such as.
- IMMEDIATE FADE CROSSFADE AT_LOOP_BOUNDARY AT_DECLARED_MARKER where supported.
- Exact vocabulary remains RSM-88-owned.
- Scene / Section continuity: Music/ambience may be.
- session-persistent Scene-owned Section-owned sequence-owned.
- according to declared lifetime.
- Scene change must not automatically restart session-persistent music simply because a new Babylon scene/resource was created.
- Save / restore: If music state participates in Runtime Save, the saved truth is semantic music state/transition meaning.
- Exact sample-accurate playback-head restoration is not promised unless a later profile explicitly admits and validates it.

##### AUD-05 — Audio Clock / Pause / Streaming / Save-Reconstruction

- Audio timing must declare behavior relative to RetroStage runtime clocks and player settings.
- Relevant cue/profile semantics may include.
- continues while gameplay paused pauses with gameplay UI/system clock sequence/dialogue clock affected/not affected by gameplay time scale.
- Raw platform/audio-context timing does not decide gameplay meaning.
- Streaming / decode readiness: For ordinary streamed/large audio, underrun/decode/start failure requires an explicit diagnosed policy.
- For synchronization-critical cues, the existing critical-audio readiness contract remains stronger.
- ready/preloaded or explicit blocker/degraded policy.
- Silent materially late start is invalid parity.
- Loop semantics: Loop points, loop count/repeat policy and stop/fade behavior must be semantic metadata, not inferred only from engine source state.
- Reimport must preserve compatible loop identity/meaning.
- Save / restore: Raw active voices, buffer nodes and audio-context handles are never save truth.
- Runtime Save may reconstruct approved.
- music/ambience semantic state long-lived loop state dialogue/sequence audio ownership where save-eligible.
- according to owner policy.
- Already committed one-shot SFX must not replay merely because the world was loaded.
- Numeric safety: Bus/cue gain/pitch/rate values that enter runtime semantics should be validated/clamped to supported finite ranges. NaN/Infinity must not poison the mixer graph.

##### AUD-06 — Audio Output Device / Sample-Rate / Hotplug / Reinitialization

- Gap: Existing audio contracts own semantic buses, cues, occurrences and save reconstruction, but output hardware lifecycle needs one explicit boundary.
- AudioDeviceContext: Representative transient platform state.
- AudioDeviceContextGeneration selected/requested output policy effective output device effective sample rate channel/layout capability where relevant backend/context generation device availability state.
- Default vs explicit device: Baseline exported games may use the system default output.
- If explicit device selection is supported, it is a Player Settings/platform capability and never canonical project authoring truth.
- Hotplug: Audio-output disconnect/change is normalized through one audio-device lifecycle.
- The runtime may.
- continue on new/default device pause/degrade affected playback rebuild backend graph report device-unavailable state.
- according to capability policy.
- It cannot create a second audible audio authority accidentally.
- Reinitialization: When backend/device/context must be recreated.
- merely because the output device changed.
- If a device transition makes exact synchronization impossible, the owning Dialogue/Sequence/UI contract decides whether to defer, degrade or continue.
- Media and Studio audio: Game audio, MED video audio and SICE Studio Player/Radio remain separate semantic owners even when they ultimately share the same OS output device.
- Output-device change cannot merge their volume/playback authorities.
- Sample-rate differences: Imported/cooked audio timing remains semantic-time based.
- A different effective hardware sample rate must not alter.
- Device identifiers: Raw OS/browser device IDs are transient platform locators.
- They are not exported project identity, Runtime Save identity or portable cross-machine settings guarantees.
- semantic audio state -> preserved by RetroStage audio owners.
- backend nodes/buffers/routes -> reconstructed.
- A new AudioContext/device generation does not replay.
- one-shot dialogue damage cue sequence marker objective sound gameplay consequence.
- dialogue continuation Sequence marker meaning music state machine meaning gameplay timer duration.

#### Authority placement: §9.15.3 Text and localization identity contracts (new under §9, after §9.14)

##### TXT-01 — String Identity / Locale / Formatting / Fallback Contract

- Canonical source preservation: RSM-48 requires stable player-facing text identity before full localization tooling.
- Authority: StringTableDocument -> canonical text identity/source-locale authority.
- StringId -> stable reference.
- rendered/display string -> derived localized presentation.
- Stable identity: Display text itself is never a persistent reference key.
- Renaming/rewording.
- "Use" -> "Interact".
- does not break references when the StringId remains stable.
- Entry model: Representative canonical entry.
- StringId source locale source text context/description format argument schema optional plural/select semantics when later admitted translation/fallback metadata.
- Exact schema remains RSM-48-owned.
- Locale resolution: Effective text resolution follows an explicit fallback chain.
- requested locale -> supported fallback locale(s) -> source locale -> missing-key diagnostic/fallback marker.
- No arbitrary object/property lookup becomes localization authority.
- Formatting arguments: Format arguments are typed/validated.
- A missing/wrong argument yields a diagnostic/degraded string rather than runtime exception or silent incorrect substitution.
- Runtime ownership: Dialogue, subtitles, objectives, inventory, UI, save/load labels and legal/credits surfaces consume the same stable string identity model where localization-ready text is required.
- Save/story identity: Runtime Save and story logic store semantic IDs/state.
- They do not persist translated display text as gameplay truth.

##### TXT-02 — Grapheme / Bidi / Font-Glyph / Layout / IME Readiness Contract

- Unicode normalization: Canonical text input/storage follows an explicit Unicode normalization policy.
- Equivalent-looking strings cannot produce unstable identity/hash behavior merely due to accidental normalization differences.
- Grapheme-aware operations: Cursor movement, deletion, truncation diagnostics and text measurement tests must account for grapheme clusters where user-facing behavior matters.
- They must not assume.
- JavaScript UTF-16 code unit = visible character.
- Bidi / RTL readiness: The UI/text architecture must not hard-code LTR-only ordering into semantic text identity.
- Even if initial shipped languages are LTR, layout/text surfaces remain structurally ready for.
- RTL direction mixed-direction text numbers/punctuation inside RTL.
- without inventing a new persistent text model.
- Font fallback: Font presentation has an explicit fallback chain/coverage diagnostic.
- Missing glyph.
- is not silently acceptable blank square in critical UI/dialogue.
- Critical surfaces can report/fallback before release.
- CJK / expansion: Representative fixtures include.
- CJK text long German/French expansion combining marks emoji/grapheme sequences RTL/Bidi samples.
- Layout overflow: Player-facing UI surfaces define overflow behavior.
- wrap scroll expand container truncate with explicit policy.
- rather than clipping unpredictably.
- Pseudo-localization/expansion tests can detect insufficient layouts before real translations.
- IME: Editable creator/player text fields are designed not to commit intermediate IME composition as final text prematurely.
- IME composition state is transient UI state, not canonical text until accepted.
- Accessibility: Font scaling/text-size accessibility settings reflow layout through the normal UI system.
- They do not modify canonical StringTable content.

#### Authority placement: §9.15.4 Camera authority and activation contracts (new under §9, after §9.14)

##### CAM-01 — Camera Authority Arbitration / Scoped Override Restoration

- Canonical RSM-42 requires one camera ownership contract across gameplay, fixed-camera zones, Sequence, Scene/Section, Dialogue, UI and temporary overrides. GPC-16 already owns held-input interpretation after a camera change.
- CAM-01 owns which request becomes effective.
- Camera producers submit scoped semantic requests.
- cameraRequestId request owner camera/profile identity priority/class RuntimeSessionGeneration Scene/Section generation where applicable lifetime/lease cut/blend policy.
- Representative request classes may include.
- GAMEPLAY_ZONE AIM / GAMEPLAY_OVERRIDE DIALOGUE SEQUENCE SCENE_TRANSITION UI/PRESENTATION_OVERRIDE where supported.
- The exact priority ordering remains RSM-41/42-owned and profile-aware.
- When an override ends, the camera owner removes that request and recomputes the effective camera from all currently valid requests. It must not blindly restore a cached previous camera.
- Thus.
- Sequence ends is not blindly restore Camera_A.
- if the player is now inside a different valid CameraZone.
- Stale owner/session/Section generations cannot regain camera or input-capture authority.

##### CAM-02 — Camera Activation Zone Selection / Overlap / Hysteresis

- Camera activation zones have stable identity and deterministic overlap semantics.
- CameraZoneId camera/profile reference priority stable tie-break identity enter/exit policy optional hysteresis/blend boundary Scene/Section generation.
- If multiple eligible zones overlap, selection is independent of physics overlap callback order, Babylon mesh order, array insertion order and renderer visibility.
- A declared priority plus stable deterministic tie-break/fallback chooses the winner.
- Bounded hysteresis/exit margin/cooldown may prevent fixed-camera boundary chatter. This is camera-zone stabilization, not spatial world streaming.
- Deactivated/unloaded Section zones lose eligibility through LVL lifetime rules. Destination EntryAnchor/Section startup may nominate a camera request but still passes through the same arbiter.
- Camera diagnostics should expose eligible zones, priorities, winner, override owner, stale-request rejection and GPC-16 held-input transition policy.

#### Authority placement: §9.15.4 Runtime Save/restore authority and compatibility contracts (new under §9, after §9.14)

##### SAV-00 — Runtime Save Authority / Single Durable Writer

- manual save autosave checkpoint save point migration delete fallback/repair.
- RUI-06 prevents duplicate UI intent, but UI single-flight is not a filesystem concurrency contract.
- Without one physical authority, competing operations can race.
- autosave writing Slot A + manual save writing Slot A + delete Slot A + migration promoting Slot A.
- The exported player should have one RetroStage-owned durable Runtime Save writer authority.
- The Source03 process boundary should remain.
- Player Renderer -> typed Runtime Save intent.
- Player Main / approved Runtime Save application service -> ONE durable writer authority -> contained runtime-save filesystem adapter.
- Renderer/UI code does not write save files directly.
- Writer responsibilities: The durable writer serializes/coordinates.
- generation creation temporary candidate persistence integrity validation promotion/current-generation update delete migration output retention cleanup fallback promotion where policy allows it.
- Per-namespace serialization: For one Runtime Save namespace, physical mutations must be serialized through one owner.
- A second process/session that cannot safely acquire the namespace's supported writer lease/lock must not concurrently write the same save store.
- The product may choose.
- read-only access explicit "save store in use" failure separate profile namespace.
- according to later UX policy, but silent multi-writer corruption is forbidden.
- Authority invariant: Save UI is not durable writer.
- Slot row/list is not physical save path.
- subsystem serializer is not permission to independently write save files.
- Subsystems contribute semantic state to the Runtime Save candidate.
- the Runtime Save authority owns physical persistence.

##### SAV-01 — Slot / Immutable Save Generation / Manifest Promotion

- A Runtime Save Slot should point to an immutable promoted save generation.
- Conceptually.
- SaveSlot └── SlotId └── CurrentPromotedSaveGenerationId.
- A save generation should have or derive a manifest containing the semantic identity required to validate one coherent candidate.
- Representative fields.
- SlotId SaveGenerationId SaveKind / channel where relevant RuntimeSaveFormatVersion SaveCompatibilityDescriptor captured RuntimeSessionGeneration / semantic capture identity registered-subsystem manifest per-payload schema/version identity required payload length/integrity data gameplay-facing summary metadata optional presentation-sidecar identity.
- Exact names/layout remain implementation-owned.
- Immutable candidate rule: After a generation is promoted, its authoritative payload is not modified in place.
- Promotion protocol: Representative flow.
- coherent semantic capture -> build immutable candidate -> validate schema / bounded structure -> persist temporary/unpromoted generation -> validate required payload lengths / integrity hashes -> finalize generation manifest -> promote generation -> atomically update Slot current-generation identity -> old valid generation becomes retention-managed fallback/history.
- The exact filesystem primitive is platform-adapter owned, but the visible authority change must be atomic from the save-store perspective.
- Inventory generation N Story generation N Scene state generation N-1.
- must never be promoted as one valid save.
- Gameplay summary metadata that affects Continue/Load compatibility or semantic selection must be bound to the same promoted generation rather than floating independently.
- They do not imply DRM, competitive anti-cheat or a promise that local saves cannot be deliberately modified by a user.

##### SAV-02 — Save Namespace / Compatibility / Release Evolution

- Continue -> newest compatible valid save.
- but "compatible" must be stronger than a single arbitrary version integer and weaker than exact executable-hash equality.
- Every exported game should have a stable Runtime Save namespace identity independent of.
- install directory display-title rename source-project absolute path temporary build directory.
- A promoted save generation includes or derives a bounded SaveCompatibilityDescriptor.
- Representative semantic inputs may include.
- GameSaveNamespaceId RuntimeSaveFormatVersion save-compatibility epoch/lineage supported migration lineage required registered-state schema identities/versions required content/semantic identity compatibility where material optional build/release provenance for diagnostics.
- Exact structure remains RSM-65/release-owned.
- Build identity is not compatibility authority: exact executable/build hash is not Save Compatibility Identity.
- Build provenance may be recorded for diagnostics, but compatible patch/minor releases should not be invalidated merely because bytes changed.
- Namespace isolation: A save from another exported game/project namespace cannot be loaded merely because filenames or slot numbers match.
- Compatibility outcomes: Load/Continue should produce explicit bounded outcomes such as.
- COMPATIBLE MIGRATION_REQUIRED UNSUPPORTED_OLDER_LINEAGE UNSUPPORTED_FUTURE_VERSION WRONG_GAME_NAMESPACE CORRUPT / INCOMPLETE.
- or implementation-equivalent results.
- Content evolution: If a save references required persistent identities that no longer exist after a game update, migration/remap policy under SYS-07 must decide the result.
- Missing required identities must not be silently replaced by "closest" content.

##### SAV-03 — Atomic Restore / Replacement Session Publication

- Restore is a prepare -> validate -> publish replacement-session operation.
- select immutable promoted generation -> bounded manifest/integrity validation -> compatibility classification -> migration candidate where required -> validate required semantic payloads -> prepare replacement RuntimeGameSession / safe load staging -> hydrate registered semantic owners -> reconstruct derived runtime systems -> post-restore cross-owner validation -> ATOMIC RUNTIME AUTHORITY PUBLICATION -> new RuntimeSessionGeneration becomes ACTIVE -> old session is released.
- No partial publication: Before the publication boundary, partially hydrated replacement state is not authoritative gameplay.
- External input, AI, combat, ordinary timers and consequential Event/Action execution remain blocked from treating the replacement as live.
- Failure before commit: Where memory/resource strategy allows the previous session to remain available.
- restore failure before publication -> previous valid session remains authoritative.
- If a full replacement/loading-screen strategy cannot retain the old world, it must enter an explicit non-gameplay load state with a safe failure route such as Title/Load.
- It still must not publish a mixed/half-hydrated gameplay session.
- Generation rule: Successful publication mints/adopts the new RuntimeSessionGeneration.
- All stale async work from the previous session fails SYS-01 generation validation.

##### SAV-04 — Restore Dependency Phases / Owner Ordering

- Scene/Section semantic state Story State RNG domains persistent entity presence Inventory Equipment Objectives Clues NPC narrative state Dialogue memory Puzzle state Encounter state Health music/ambience derived physics/nav/animation/VFX/audio/UI.
- Registration order is not a safe dependency order.
- Save-participating owners should declare/derive bounded restore dependencies or restore phases.
- A representative phase model is.
- 1.
- READ / MANIFEST / INTEGRITY 2.
- COMPATIBILITY / MIGRATION 3.
- REPLACEMENT SESSION + SCENE/SECTION SEMANTIC FOUNDATION 4.
- GLOBAL STORY / RNG / SHARED SEMANTIC STATE 5.
- PERSISTENT ENTITY PRESENCE / OWNERSHIP / SECTION STATE 6.
- INVENTORY / EQUIPMENT / OBJECTIVES / NPC / DIALOGUE / PUZZLES / ENCOUNTERS / HEALTH 7.
- DERIVED PHYSICS / NAV / ANIMATION / AUDIO / VFX PRESENTATION 8.
- RUNTIME UI RECONSTRUCTION 9.
- POST-RESTORE VALIDATION 10.
- ATOMIC PUBLICATION.
- Exact phase assignment is implementation-owned.
- the invariant is explicit dependency rather than incidental registration order.
- Examples: EquipmentBinding requires restored ItemRuntimeInstance identity.
- NPC runtime presence requires accepted NPC narrative state + Section placement/runtime policy.
- Encounter reconstruction requires accepted encounter phase + Section/spawn provenance.
- The runtime must not "solve" the cycle through callback order.
- Hydration side-effect barrier: During restore phases, owner hydration cannot emit ordinary live gameplay consequences merely because state changed from defaults to restored values.
- hydrate Objective = COMPLETED is not execute OnComplete.
- hydrate item = consumed is not run pickup/use consequence.
- hydrate enemy = dead/absent is not grant death reward.
- 1. READ / MANIFEST / INTEGRITY 2. COMPATIBILITY / MIGRATION 3. REPLACEMENT SESSION + SCENE/SECTION SEMANTIC FOUNDATION 4. GLOBAL STORY / RNG / SHARED SEMANTIC STATE 5. PERSISTENT ENTITY PRESENCE / OWNERSHIP / SECTION STATE 6. INVENTORY / EQUIPMENT / OBJECTIVES / NPC / DIALOGUE / PUZZLES / ENCOUNTERS / HEALTH 7. DERIVED PHYSICS / NAV / ANIMATION / AUDIO / VFX PRESENTATION 8. RUNTIME UI RECONSTRUCTION 9. POST-RESTORE VALIDATION 10. ATOMIC PUBLICATION.
- Dependency cycles: A required restore dependency cycle is a validation/design error unless the involved owners provide an explicit two-phase prepare/rebind contract.

##### SAV-05 — Persistent Entity Presence / Absence / Tombstone / Transfer

- Example.
- Pickup_A exists in authored Scene -> player consumes Pickup_A -> save -> load authored Scene defaults.
- Without persisted absence semantics, Pickup_A can respawn while its item also remains in Inventory.
- The same class of failure applies to.
- destroyed prop defeated persistent enemy opened one-shot container moved persistent physics object transferred world item disabled one-shot mechanism.
- Persistent runtime entity meaning must distinguish authored/default presence from the accepted session/save state.
- Where a feature needs persistence, the owning subsystem should preserve enough stable identity and state to express outcomes such as.
- PRESENT CONSUMED GAMEPLAY_DESTROYED DISABLED MOVED / TRANSFERRED.
- or feature-specific equivalents.
- This does not require one universal global entity-status enum.
- Identity basis: Use the existing RSM-23 distinctions.
- authored definition/placement identity persistent/save identity where applicable runtime instance identity spawn provenance despawn reason.
- Tombstone rule: A gameplay destruction/consumption result may require a persistent absence/tombstone record so default authored reconstruction does not recreate the object.
- Stream-out distinction: STREAM_OUT is not persistent destruction tombstone.
- An enemy or item being temporarily non-resident does not mean it was killed/consumed.
- Transfer: A moved/transferred persistent entity preserves its semantic identity while its residency/owner changes under LVL-03.
- Save reconstruction must not create.
- old authored copy + transferred copy.
- at the same time.
- Feature policy: Not every runtime entity must be persisted.
- The requirement applies only where product semantics promise persistence.

##### SAV-06 — Streamed-Out / Inactive Section Semantic Capture

- Critical V13 interaction: V13 allows a Section to be.
- not resident / not simulating while accepted semantic state persists in the RuntimeGameSession.
- Therefore.
- Runtime Save capture is not enumerate currently resident Babylon/runtime objects.
- Runtime Save captures from registered semantic owners/state stores, including approved state for inactive/streamed-out Sections.
- Representative persisted Section-associated state may include where required.
- SectionPlacementId SectionRuntimeInstanceId where persistence semantics require it SectionVariantId / liminal route state puzzle/mechanism state NPC narrative presence/location persistent entity tombstones/presence transferred item/prop ownership/location encounter phase/state approved Section-local Story/Objectives.
- Resident object independence: A Section does not need a live Babylon Scene/node/entity projection merely for its semantic state to participate in save.
- Load behavior: Load may restore inactive Section semantic state without immediately making that Section resident.
- Later activation reconstructs the runtime projection from restored semantic state under LVL-05/08.
- No default-reset leak: Example.
- Section A puzzle solved -> Section A streams out -> player saves in Section B -> load -> Section A remains non-resident -> later activate Section A.
- must reconstruct the solved state rather than authoring defaults.
- Capture coherence: Active and inactive Section semantic records belong to the same coherent SaveGeneration capture.

##### SAV-07 — Save Request Arbitration / Coalescing / Stale-Request Rejection

- checkpoint autosave manual save save point.
- Without arbitration, the system can produce write storms, starvation or stale saves after session replacement.
- All save experiences submit typed requests to one Runtime Save request arbiter.
- Representative identity.
- SaveRequestId SaveKind target SlotId / channel requested RuntimeSessionGeneration request priority requested semantic boundary request owner/reason.
- Shared pipeline: Manual, autosave, checkpoint and save-point requests use.
- ONE Save Eligibility authority ONE coherent semantic capture contract ONE durable writer.
- They may differ in.
- trigger slot/channel retention policy UI resource-token rule checkpoint/restore-anchor policy.
- but not in gameplay truth semantics.
- Coalescing: Repeated equivalent autosave/checkpoint requests may be coalesced according to bounded policy.
- The queue cannot grow without limit.
- Fairness: Manual save should not starve behind an endless sequence of lower-priority autosaves.
- A save-point request that consumes a limited token must use the existing transactional rule.
- save generation promoted successfully -> then token/resource consumption commits.
- unless the accepted design uses an equivalent atomic combined operation.
- DEFERRED requests: When Save Eligibility returns DEFERRED, the request may remain pending only under a bounded revalidation/expiry policy.
- A new RuntimeSessionGeneration invalidates stale pending requests unless explicitly transferred.
- Stale completion: A completed physical write from an obsolete/cancelled request cannot become the current promoted generation if its request/session authority was superseded before promotion.

##### SAV-08 — Corruption / Migration / Previous-Generation Fallback

- Migration rule: Migration never mutates the source promoted generation in place.
- old promoted generation -> read-only input migration transform -> new candidate generation -> schema/reference validation -> integrity validation -> new generation promotion.
- If migration fails, the old generation remains physically unchanged.
- Corruption classification: Validation should distinguish, where feasible.
- manifest/header invalid required payload missing integrity/hash mismatch unsupported schema unsupported future version wrong game namespace invalid required reference optional presentation sidecar corrupt.
- Fallback: If the current promoted generation is invalid but a previous compatible known-good generation exists, product policy may offer/use explicit fallback.
- Fallback must be diagnosable and must not pretend the damaged current generation was loaded.
- Example creator/player-facing meaning.
- Current save generation is invalid. Previous compatible generation is available.
- Exact wording/UX remains milestone-owned.
- Previous generation safety: A newly promoted generation should not make the previous known-good generation immediately unrecoverable before promotion/integrity policy has succeeded.
- Retention cleanup follows SAV-10.
- Unsupported future version: A save from a newer unsupported RuntimeSaveFormatVersion must be rejected rather than "best effort" deserialized into potentially invalid gameplay state.
- Unknown fields/data: Unknown-data behavior follows SYS-07 schema admission.
- No subsystem may independently guess how to reinterpret unknown durable data.

##### SAV-09 — Runtime Save Storage Security / Containment / Bounded Parsing

- Trust boundary: Runtime Save files are local but still treated as untrusted input because they can be.
- corrupted by disk failure manually edited copied from another machine/build malformed deliberately hostile.
- Path containment: SlotId is not raw filename is not relative/absolute filesystem path.
- All physical save paths are derived inside the approved Player Main save root.
- Save payloads/metadata cannot request arbitrary filesystem reads/writes/deletes.
- Delete/cleanup/migration operations must preserve the same containment and platform symlink/reparse-point policy as other privileged filesystem operations.
- Serialization safety: Runtime Save data is schema-driven semantic data.
- It must not deserialize.
- functions JavaScript source for execution arbitrary classes/constructors HTML/DOM executable content arbitrary filesystem URLs remote-web executable references privileged IPC requests.
- from save payload.
- Bounded parsing: The loader should enforce supported limits such as.
- maximum generation bytes maximum individual payload bytes maximum decompressed bytes where compression is used maximum entry/count limits bounded string/collection/nesting sizes bounded migration work.
- to prevent corrupted/compressed input from causing unbounded memory/CPU use.
- Parse order: Cheap bounded manifest/header checks should occur before expensive allocation/decompression where the physical format allows it.
- Integrity is not authenticity: Hash/integrity validation detects accidental corruption/torn data.
- Unless a separate security feature is explicitly admitted, it does not claim anti-tamper authenticity or competitive anti-cheat.

##### SAV-10 — Retention / Size / Disk / Performance Budget

- Autosave/checkpoint activity also must not create unacceptable gameplay hitching or unbounded disk usage.
- Runtime Save should have bounded retention and performance policy.
- Representative retention direction.
- manual slots -> user-visible/user-owned lifecycle within product limits.
- autosave/checkpoint channels -> bounded ring/history.
- previous known-good generation -> protected until newer promotion is valid and retention policy permits cleanup.
- failed temporary/unpromoted generations -> bounded safe cleanup.
- orphan optional thumbnails/sidecars -> bounded cleanup.
- Exact counts are product/milestone-owned.
- Disk-space failure: Before or during save.
- ENOSPC / disk-full / permission failure.
- must fail the candidate transaction without invalidating the previous promoted generation.
- Retention cleanup must not delete the last known-good generation in an attempt to make space for an unproven candidate unless an explicit owner-approved policy safely guarantees recovery.
- Capture vs physical write: The coherent semantic snapshot is established at a safe accepted runtime boundary.
- Where architecture permits.
- short bounded semantic capture/freeze -> immutable in-memory/staged candidate -> resume gameplay -> serialization/compression/physical write.
- may reduce gameplay hitching.
- The later asynchronous write still uses SAV-00/SAV-07 generation/request validity and cannot promote stale session data after invalidation.
- Memory budget: Snapshot/staging memory itself is bounded.
- A "save asynchronously" implementation must not duplicate the entire game state without a documented memory budget.
- Scope: This does not admit.
- unless separately authorized.
- Diagnostics / budgets: Runtime/dev diagnostics should expose representative.
- without making platform timing guarantees unsupported by evidence.

#### Authority placement: §9.15.4 Scene/Section activation, residency and transition contracts (new under §9, after §9.14)

##### LVL-00 — Scene / Level / Section Terminology & Authority

- RetroStage keeps one canonical level hierarchy.
- Project -> GameDefinition / Scene Registry -> SceneDocument -> Section definitions / placements.
- Creator-facing terminology may display Level and Sublevel, but canonical/runtime authority remains Scene and Section.
- Scene is not RuntimeGameSession Section is not Scene Section is not arbitrary renderer node group Editor folder/group is not Section unless explicitly authored as one Editor visibility group is not runtime Section activation state.
- A Section is a bounded semantic lifecycle/residency unit, not an open-world cell or world-partition shard.
- Scene/Section lifecycle remains owned by the existing Scene Registry / Scene Director / Section runtime contracts and SYS-02. Renderer/resource state cannot independently activate gameplay.

##### LVL-01 — Section Definition / Placement / Runtime Instance / Activation Generation

- A reusable authored Section may appear more than once or be substituted/looped at runtime.
- The architecture therefore distinguishes.
- SectionDefinitionId SectionPlacementId SectionRuntimeInstanceId SectionActivationGeneration SectionVariantId where used.
- Meanings.
- SectionDefinitionId = authored reusable Section meaning/content.
- SectionPlacementId = authored occurrence/location/linkage in a Scene.
- SectionRuntimeInstanceId = concrete runtime occurrence.
- SectionActivationGeneration = current semantic activation lifetime.
- SectionVariantId = selected bounded authored variant.
- Example.
- Definition: Hallway_A Placement: LoopRoute.Entry03 RuntimeInstance: SectionRuntime-7F2A ActivationGeneration: 14 Variant: LIGHTS_OFF.
- same SectionDefinitionId is not same runtime Section instance.
- Save, spawned-entity provenance, RNG, stale-work validation and liminal behavior use the appropriate placement/runtime/generation identities. Old activation callbacks cannot mutate a new activation of the same placement.

##### LVL-02 — Orthogonal Resource Residency / Semantic Activation / Simulation / Visibility

- Canonical semantic residency and resource residency are distinct. V13 makes this explicit across four conceptual axes.
- RESOURCE RESIDENCY UNLOADED LOADING RESIDENT EVICTING.
- SEMANTIC ACTIVATION INACTIVE PREPARING ACTIVE DEACTIVATING.
- SIMULATION SUSPENDED SIMULATING.
- PRESENTATION HIDDEN VISIBLE.
- A valid preloaded destination may be.
- RESOURCE = RESIDENT SEMANTIC = INACTIVE SIMULATION = SUSPENDED PRESENTATION = HIDDEN.
- Core invariants.
- resource loaded is not gameplay active mesh visible is not gameplay active renderer hidden is not gameplay inactive resource resident is not permission to simulate.
- Inactive/preloaded Section-owned AI, hazards, ordinary physics, gameplay timers, interactions and spawn loops do not run merely because resources are resident.
- Renderer visibility remains presentation only.

##### LVL-03 — Section Entity Ownership / Transfer / Strong Residency Edges

- An entity may originate in Section A but move into Section B. Authored origin therefore cannot be treated as immutable runtime lifetime ownership.
- Distinguish.
- authored home/origin Section current runtime residency/lifetime owner transfer policy.
- Representative policies.
- SECTION_STATIC TRANSFERABLE_RUNTIME SCENE_PERSISTENT SESSION_PERSISTENT where explicitly valid.
- Core invariant.
- Authored Home Section is not necessarily current runtime lifetime owner.
- Portable props/items can transfer ownership before source Section unload. Static walls/panels normally cannot.
- Strong relationships such as.
- transform parent physics joint/constraint equipment/attachment lifetime edge shared runtime controller.
- cannot silently cross independently unloadable Section boundaries. They require.
- same residency group explicit ownership transfer explicit shared/pinned owner or validation failure.
- A Section cannot dispose an entity just because it authored it after runtime ownership transferred.

##### LVL-04 — Cross-Section Reference / Dependency Resolution

- Cross-Section semantic references do not automatically cause streaming.
- Representative resolution modes.
- SEMANTIC_ONLY REQUIRES_ACTIVE_TARGET OPTIONAL_IF_RESIDENT PREDECLARED_TRANSITION_DEPENDENCY.
- SEMANTIC_ONLY can resolve stable facts without a live target Section.
- REQUIRES_ACTIVE_TARGET rejects/defers if the live runtime target is unavailable.
- OPTIONAL_IF_RESIDENT uses a live target only if already valid/resident.
- Core invariant.
- reference dereference is not permission to load/activate Section.
- Only approved Scene/Section transition/preload owners may request residency or activation.
- Strong circular dependencies that make independent unload unsafe must become a shared residency group/shared owner or fail validation.
- Cycle normalization: Scene/Section route cycles are not automatically invalid.
- Supported examples include.
- Room A -> Hallway -> Room A Hallway -> Hallway bounded liminal loops.
- What is invalid is an unbounded automatic transition cycle with no meaningful boundary such as.
- player input time/event boundary explicit counter/state change external semantic trigger.
- Post-CIC Source wording should therefore mean.
- detect / validate cycles is not reject all cycles.

##### LVL-05 — Section Activation Manifest / Gameplay Readiness Barrier

- A Section cannot publish ACTIVE simply because a visible mesh loaded.
- Each activation derives a readiness manifest with classifications such as.
- REQUIRED_BEFORE_ACTIVATION CAN_STREAM_AFTER_ACTIVATION OPTIONAL_WITH_FALLBACK EDITOR_ONLY.
- Required-before-activation may include where applicable.
- Section semantic definition required EntryAnchor(s) required collision required gameplay entity/prefab definitions required interaction/puzzle semantics required spawn definitions required transition/link data required typed runtime semantics navigation/link data needed immediately synchronization-critical audio/presentation required by activation.
- Flow.
- activation requested -> resources/preconditions prepared -> activation manifest validated -> required semantic/runtime resources READY -> commit SectionActivationGeneration -> publish gameplay ACTIVE.
- visible floor without required collision/readiness is not valid ACTIVE Section.
- If destination preparation fails, the current valid state remains authoritative until an explicit failure/recovery transition commits.

##### LVL-06 — Section Link / Exit / Entry Anchor / Transition Payload

- Scene/Section transitions use stable semantic links and entry anchors instead of raw target coordinates.
- Representative contract.
- SectionLinkId source Scene/Section/Exit identity destination SceneId destination SectionPlacementId where applicable destination EntryAnchorId TransitionProfile PreloadPolicy required conditions.
- An EntryAnchor may define.
- stable identity position/orientation required clearance bounds supported actor/profile class camera/control handoff metadata where applicable.
- Core invariant.
- raw x/y/z destination is not durable transition identity.
- Transition payload carries stable source/destination/session/profile context.
- Before commit, validate destination, conditions, anchor compatibility/clearance and activation readiness.
- Missing/blocked required anchors fail diagnostically.
- no arbitrary nearest-position substitution may bypass gameplay meaning.

##### LVL-07 — Activation Request / Preload / Hysteresis / Thrash Prevention

- A target Section cannot rely solely on a trigger that exists inside itself while unloaded.
- Residency/activation requests originate from an authoritative source such as.
- active source Section link/transition Scene Director Scene-level persistent trigger/volume Sequence/Event-Action semantic request approved preload controller.
- A request carries.
- request identity request owner target Scene/Section placement owner/session generation priority reason/profile.
- Bounded anti-thrash mechanisms may include.
- preload window activation/deactivation hysteresis minimum residency/cooldown where justified priority cancellation/supersession.
- Requests for one target generation resolve single-flight/coalesced.
- Stale load completion cannot reactivate a Section after owner/session cancellation.
- This does not admit distance-grid/open-world streaming.

##### LVL-08 — Simulation Suspend / Stream-Out / Semantic State Persistence

- Stream-out is residency/lifetime management, not gameplay destruction.
- enemy streamed out is not enemy died item streamed out is not item consumed puzzle streamed out is not puzzle reset.
- Section-owned semantic state declares in-session persistence behavior such as.
- RESET_ON_REACTIVATE PERSIST_SESSION_SEMANTIC SAVE_REGISTERED TRANSFERRED_TO_OTHER_OWNER.
- Runtime teardown reason remains distinct where applicable.
- STREAM_OUT GAMEPLAY_DESTROYED CONSUMED TRANSFERRED SESSION_END.
- On reactivation.
- authoritative semantic state -> reconstruct approved runtime projection.
- not blind replay of original gameplay consequences.
- Stream-out/reactivation cannot duplicate pickup grants, objective progress, puzzle actions, death rewards, story events, encounter phases or one-shot presentation.
- In-session persistence is not identical to disk save.

##### LVL-09 — Transition Memory Headroom / Residency Pin / Eviction Safety

- A transition may require overlap between current, destination, shared and transition-critical resources.
- Before memory-sensitive commit, evaluate bounded headroom using.
- current pinned/active residency destination REQUIRED_BEFORE_ACTIVATION resources shared leases evictable optional caches transition overlap/headroom budget.
- Protect via residency pins/leases.
- current active Section required resources PREPARING destination required resources shared resources with live leases transition-critical assets.
- If destination cannot be prepared safely.
- do not unload the last valid current gameplay state first.
- unless a separately valid full-loading/session-safe replacement flow owns recovery.
- Unloading Section A cannot dispose a shared asset still leased by active/preparing B.
- RSM-80/81 remain implementation owners for refcount/lease/eviction behavior.

##### LVL-10 — Section Cook / Export Reachability / Runtime Load Manifest

- Conditional/liminal Sections cannot be discarded merely because the default editor path does not activate them.
- Cook/export reachability includes supported references such as.
- Scene Registry links Section links / EntryAnchors Story/Objective conditions Narrative recipes liminal substitutions/variants Encounter/Sequence transitions Flow Graph typed Scene/Section actions bounded route tables.
- inactive in current editor/default route is not unused for cook.
- The exported player loads through a cooked stable-ID manifest.
- SceneId / SectionDefinitionId / SectionPlacementId -> CookManifest -> cooked local resource identities -> Runtime Resource Manager.
- Source-project filesystem paths are not runtime streaming authority.
- Missing semantically reachable Section/resource closure blocks export diagnostically.

##### LVL-11 — Editor Section Visibility / Preview / PIE / Player Separation

- Editor view controls are not runtime semantics.
- Editor-local state may include.
- hide/show Section solo Section ghost/outline selection lock focus Section editor preload preference.
- Core invariant.
- EditorSectionVisibility is not Section semantic activation Editor Solo is not runtime unload editor resource preview is not runtime preload contract.
- Section preview may show bounds, links, anchors, dependencies, collision/nav overlays and resource manifests without creating gameplay activation.
- PIE uses the same semantic Scene/Section lifecycle as the player with diagnostics layered on top.
- No player behavior may depend on hidden editor-only Section state.

##### LVL-12 — Level / Section Diagnostics & Cross-Boundary Validation

- Project Doctor / level validation should detect at least.
- missing Scene/Section destination missing EntryAnchor EntryAnchor incompatible with actor/profile EntryAnchor inside collision / invalid clearance reference with no valid activation path target Section depending solely on its own unavailable preload trigger strong parent/constraint crossing independent Section lifetimes transferable entity destroyed by source unload duplicate/ambiguous Section placement identity stale/missing SectionVariant required activation-manifest resource missing required collision/nav/gameplay dependency not ready unbounded automatic transition cycle unsupported residency dependency cycle active/preparing Section exceeding memory/headroom policy shared resource disposed while leased conditional/liminal Section missing from cook closure editor-only state required for runtime behavior runtime load-manifest entry missing.
- Validation should reason across topology, ownership, physics/parents, navigation, anchors, story/objective routes, encounter/sequence transitions, restore anchors and cook dependencies.
- Dynamic uncertainty should report runtime-dependent/unknown rather than invent certainty.
- Intentional bounded cycles/substitution are valid when their explicit runtime instance/generation/transition contracts are satisfied.

#### Authority placement: §9.15.4 Sequencer orchestration and non-bypass contracts (new under §9, after §9.14)

##### SEQ-00 — Babylon Editor Cinematic Reuse Audit / RetroStage Sequencer Authority Boundary

- Before implementing the mature RSM-106 Sequencer, RetroStage should perform an exact reuse/adaptation audit of the then-current Babylon.js Editor cinematic subsystem.
- The audit is an engineering acceleration step, not a dependency or canonical-format admission.
- Required audit dispositions: Each candidate reusable element receives one of.
- REUSE ADAPT / SELECTIVE PORT REFERENCE ONLY REJECT.
- Likely candidates for adaptation/reference include mechanical ideas such as.
- timeline/key/cut representation curve evaluation AnimationGroup scheduling/weighting seek/scrub presentation mechanics camera/property animation compilation bounded sound/frame scheduling.
- Canonical authority boundary: The following do not become RetroStage canonical authority.
- Babylon Editor .cinematic file format Babylon scene node IDs as SequenceDocument identity raw propertyPath as ordinary creator contract Babylon Editor global scene state direct set-enabled gameplay mutation direct apply-impulse gameplay mutation raw AnimationEvent as consequential gameplay authority Babylon Editor application/undo/filesystem ownership.
- Correct direction.
- RetroStage SequenceDocument stable Track/Clip/Marker identities typed semantic track descriptors -> RetroStage Sequence compiler/runtime -> presentation/mechanical adapter plan -> selected Babylon animation/cinematic mechanics.
- Gameplay/story consequences continue through SYS-04/SYS-05 and the owning subsystem.
- If source-level selective adaptation/porting is chosen, the owning milestone must record.
- No reuse decision may silently reintroduce the legacy unscoped babylonjs package or an incompatible second Babylon runtime graph.
- Current external evidence snapshot: A 2026-08-29 review of the Babylon.js Editor repository observed a small separable tools/src/cinematic/ runtime area containing parsing/generation/types/events around Babylon Animation / AnimationGroup mechanics.
- The same review also observed.
- These observations are freshness-gated evidence and must be rechecked at the RSM-106 admission point.

##### SEQ-01 — Sequence Instance / Timebase / Generation Contract

- RSM-106 Sequencer can coordinate camera, transform, animation, audio, dialogue/subtitle, VFX, lighting, materials/post-process, UI, Scene visibility and Event/Action. It therefore needs one stable runtime playback identity rather than using the raw timeline/playhead as authority.
- Every live sequence playback should have or derive.
- SequenceDefinitionId SequenceInstanceId SequenceOwnerIdentity RuntimeSessionGeneration Scene/Section generation where applicable SequencePlaybackGeneration semantic playback state declared RetroStage timebase / clock domain current authored segment / marker region.
- Representative bounded states may include.
- PREPARING PLAYING PAUSED INTERRUPTING SKIPPING COMPLETED CANCELLED FAILED.
- Raw render-frame time, AudioContext time, animation callback time or wall-clock time cannot independently advance sequence gameplay meaning.
- The sequence defines supported behavior under Pause, gameplay time scale, loading/Section transition and editor scrub. Async work from playback generation N cannot complete into generation N+1 after restart, interruption or session replacement.

##### SEQ-02 — Track Ownership / Scoped Lease / Non-Bypass Contract

- A Sequencer track orchestrates existing subsystem owners.
- it does not gain direct mutation authority because it is placed on a timeline.
- Camera track -> Camera request/lease.
- Transform track -> approved scripted/sequence-driven motion handoff.
- Animation track -> AnimationSet semantic request.
- Audio track -> Audio occurrence / music transport owner.
- Dialogue track -> DialogueSession / subtitle owner.
- VFX track -> VFX occurrence owner.
- Lighting / material / presentation track -> scoped presentation contribution.
- UI track -> runtime Screen/UI policy owner.
- Scene visibility / Section track -> presentation visibility contribution OR typed Scene/Section action.
- Event/Action track -> shared Event/Action registry.
- A transform track cannot fight dynamic physics, player movement, root motion, AI navigation or equipment attachment. It must use GPC-13/GPC-19/ANI-09 ownership handoff.
- A Scene-visibility track cannot silently interpret hidden as Section unloaded/inactive.
- LVL-02 remains authoritative.
- Temporary Sequence camera/UI/audio/lighting/material/post-process state is represented as scoped leases/contributions. Ending one Sequence removes only its own contribution and recomputes the effective current state. A stale Sequence cannot restore an old cached global state over a newer owner.
- Playback never rewrites canonical project documents.

##### SEQ-03 — Marker / Event / Skip / Scrub / Preview Exactly-Once Contract

- Every consequential sequence marker/action uses stable semantic occurrence identity such as.
- SequenceInstanceId TrackId Clip / MarkerId semantic occurrence / repeat identity SequencePlaybackGeneration.
- Ordinary forward playback commits consequential Event/Action markers through SYS-04/SYS-05. Repeated frame evaluation, duplicate backend callbacks or seek correction cannot commit a one-shot occurrence twice.
- Editor timeline scrub, frame preview and thumbnail evaluation are non-committing. They may evaluate derived presentation in disposable preview state but cannot damage, grant/remove items, complete objectives, mutate Story State, solve puzzles, spawn persistent entities, save, or change canonical Scene/Section state.
- Skip is not "execute every callback between old and new time at high speed". Consequential markers must declare/derive bounded skip behavior, for example.
- REQUIRED_FINAL_STATE REQUIRED_GAMEPLAY_COMMIT PRESENTATION_ONLY DO_NOT_REPLAY INTERRUPT / CANCEL.
- A successful skip preserves required terminal gameplay/story meaning exactly once, avoids replaying presentation one-shots, and releases/restores scoped owners correctly.
- Runtime reverse/seek across committed gameplay actions is not implied. If later admitted, it requires an explicit semantic policy rather than callback rewind.

##### SEQ-04 — Sequence Save / Restore / Interruption / Safe-Marker Contract

- Every Sequence declares Runtime Save participation explicitly, for example.
- SAVE_ALLOWED_AT_SAFE_MARKER SAVE_DEFERRED_WHILE_ACTIVE SAVE_BLOCKED_WHILE_ACTIVE.
- If mid-sequence save is supported, capture occurs only at a coherent semantic boundary after required actions for that boundary have committed.
- Persisted meaning may include.
- SequenceDefinitionId safe semantic marker/segment identity required persistent branch state already committed consequential occurrence identity where needed owner/session/Scene context.
- Raw timeline UI state, animation frame, AudioContext playhead, particle state or camera object is not save truth.
- Restore reconstructs supported sequence meaning without replaying already committed actions, objective changes, item grants, encounter spawns or one-shot presentation.
- Interruption may come from danger/damage, manual cancel, death, Scene transition, Dialogue policy, retry/load or session replacement. It releases only Sequence-owned leases.
- Skip, cancel and interruption are distinct semantic operations: a cancel may intentionally omit terminal consequences while an authored successful skip may need to commit them.

#### Authority placement: §9.15.5 Asset revision/import security contracts (new under §9, after §9.14); consistent with §28 Asset Architecture

##### AST-01 — Asset Revision / Coherent Derivative Set / Runtime Lease / Atomic Reimport

- RSM-77/78 already require deterministic hashing, stale-derivative invalidation and temporary derivative -> validation -> atomic promotion.
- Cross-domain consumers require one additional coherence rule.
- One imported asset can simultaneously participate in.
- visual mesh/materials skeleton animation clips rig/socket mapping collision source/derivative navigation source LOD lightmap/baked data VFX attachment points level bounds.
- Asset semantics therefore distinguish or derive.
- AssetId AssetRevisionId stable SubassetId DerivativeSetGeneration / accepted derivative revision.
- For dependencies that must agree, promotion occurs as one compatible derivative set.
- Invalid mixed examples include.
- new skeleton + old incompatible animation binding new mesh + old incompatible collision new rig hierarchy + stale HAND_R mapping new UV layout + stale baked/lightmap derivative new geometry bounds + stale required nav/collision derivative.
- A relevant source/import/settings change invalidates all affected derivatives and compatibility proofs.
- "File exists in cache" is not validity.
- source/import candidate -> generate affected temporary derivatives -> validate stable IDs/remaps -> validate cross-derivative compatibility -> promote accepted AssetRevision / DerivativeSetGeneration.
- A live Preview/PIE/player projection holds a lease/reference to one accepted asset revision.
- The runtime may continue on the old revision, reconstruct safely, or require PIE restart for unsupported live changes.
- Late thumbnail/import/cook/load results bind their AssetRevision/DerivativeSet generation and cannot overwrite a newer revision.
- Cook/export records the exact accepted derivative identities required by the build and never packages a stale derivative merely because it exists on disk.

##### AST-02 — Untrusted Asset Import / Parser / URI / Decode-Budget Contract

- source reference -> bounded source identity/size checks -> temporary/import staging -> parser/decoder -> semantic normalization -> candidate derivatives + diagnostics -> host validation -> AST-01 atomic accepted revision promotion.
- Parser/decoder callbacks never mutate canonical authoring state directly.
- Network/file URI containment: Imported asset content cannot grant itself network/filesystem authority.
- remote HTTP/HTTPS URI file:// URI absolute path UNC path ../ escape custom privileged URI.
- Baseline GLB/self-contained/import-selected dependency behavior remains local and explicit.
- dependency must belong to the explicitly selected/imported contained source set.
- A parser cannot walk arbitrary folders because the source file named a relative URI.
- source bytes container entries mesh vertices/indices/primitives node/material/animation counts animation key counts/duration metadata image dimensions/pixels/mip count decoded image bytes audio channels/rate/duration/decoded estimate font tables/glyph counts where applicable string/metadata sizes nesting/dependency count decompression ratio where compressed content exists CPU/job time temporary memory.
- Exact product limits remain milestone/profile-owned.
- Main/Renderer authority: Expensive parse/decode work follows RSM-27 job/worker policy when needed.
- Renderer/UI remains a request/progress/diagnostic surface rather than privileged parser authority.
- Active content: Imported metadata, SVG/font/media/container text or extension payload does not become executable HTML/JavaScript/Node/Electron content.
- Native/WASM decoder admission: Any new decoder/optimizer/native/WASM importer enters only after Source06 audit.
- A parser upgrade invalidates affected derivative/cache proof according to the import contract.
- Bounded parsing: Import policy places limits on relevant.
- Provenance: Accepted asset provenance records the importer/tool/version/settings/source hashes required by RSM-73/77/AST-01.
- Import staging: Untrusted source asset bytes are inspected/imported through an import candidate/job boundary.
- Decode bomb / malformed input: An asset that exceeds limits or causes parser/decoder failure.
- fails/quarantines the import candidate does not publish partial canonical asset state does not poison the last accepted AssetRevision does not freeze Electron Main.

#### Authority placement: §9.15.5 Export/cook/packaging contracts (new under §9, after §9.14); consistent with §29 Export and Packaging Architecture

##### EXP-00 — Export Snapshot / Build Identity / Target Context

- Every export captures one immutable accepted semantic snapshot. Later editor changes are not inputs to that ExportBuildId. One build identity binds cooking, cache lookup, manifest generation, artifact reporting, packaging, smoke evidence, logs, and failure records. OS, architecture, runtime profile, capability/quality target, admitted store adapter, player contract, codec capability, and optional features are frozen before cooking.
- outputs and caches cannot cross target contexts or unrelated attempts.
- Validation must reject mixed document revisions, reuse across incompatible target contexts, and silent merging of outputs from unrelated export attempts. A retry must have a new build identity or an explicit versioned attempt owned by the same build.

##### EXP-01 — Export Job / Staging / Single-Writer / Atomic Publication

- Failure or cancellation can leave.
- old files + new files + stale files removed from the new manifest.
- while the directory still looks like a finished game.
- Each export uses an isolated staging namespace owned by one ExportBuildId.
- acquire target/output ownership -> create empty isolated staging root -> cook / assemble / package into staging -> run manifest + artifact validation -> run required smoke checks against staged artifact -> mark candidate complete -> publish/promote final artifact -> release previous target/output ownership.
- Known-good preservation: Until publication succeeds.
- previous successful export remains unchanged.
- when overwriting/updating an existing selected export destination is supported.
- Single writer: Two concurrent export jobs cannot publish to the same final destination/profile without explicit serialization.
- They may build in separate staging directories, but final publication is single-owner.
- Clean staging: Every attempt starts from an empty/validated staging root.
- Incremental reuse belongs to controlled caches, not to copying new output over a dirty old release folder.
- Cancellation: Cancellation.
- stops/cancels owned work prevents stale job promotion releases resource leases marks staging disposable.
- but cannot delete or overwrite the last known-good final artifact.
- Where an atomic directory rename is unavailable or cross-volume output is requested, the export pipeline must use an explicit two-phase publish/final-complete marker/inventory protocol rather than pretend a multi-file copy is atomic.
- A partially copied directory must never be reported as a successful completed export.

##### EXP-02 — Portable Runtime Path Namespace / Collision / Containment

- Examples include.
- Textures/DOOR.png textures/door.png.
- Foo foo.
- name. name.
- CON NUL AUX COM1.
- plus Unicode normalization and path-length differences.
- The export compiler owns one portable logical runtime-path namespace independent of source absolute paths.
- Each cooked item receives or derives a stable portable runtime path from semantic identity and artifact role.
- Validation: Before physical layout creation, validate at least.
- case-insensitive collision Unicode-normalization collision Windows reserved device names trailing dot/space ambiguity unsafe executable/package characters path traversal absolute-path injection separator ambiguity path-length budget for supported target/layout duplicate final artifact path.
- Exact Windows target rules remain RSM-92/93-owned and evidence-driven.
- Core invariants: Asset source path is not runtime package path.
- creator display name is not trusted filesystem path.
- AssetId / semantic identity is not path string.
- Containment: Every generated runtime path must resolve inside the selected staging/runtime root.
- No canonical/imported data may produce.
- ../ absolute drive path UNC escape unapproved junction/symlink escape.
- into another filesystem location.
- Case policy: The logical manifest should use one normalized canonical path representation while preserving stable semantic identity separately.
- Runtime resource lookup must not depend on development-machine filesystem case sensitivity.

##### EXP-03 — Toolchain / Environment Fingerprint / Determinism Scope

- Export evidence records a non-secret toolchain/target fingerprint.
- Representative material inputs.
- RetroStage export schema/compiler version Node version pnpm / lockfile identity Electron version Electron Forge / packager identity asset tool identities/versions target OS/architecture build configuration admitted native/WASM/tool binary hashes where used relevant deterministic feature flags.
- Machine-local paths, usernames and secret values are not semantic fingerprint material.
- Determinism layers: RetroStage should distinguish.
- SEMANTIC DETERMINISM same accepted canonical snapshot/resolution -> same runtime meaning.
- COOK DETERMINISM same relevant inputs/toolchain/target -> same cooked semantic artifacts/hashes where the tool supports determinism.
- LAYOUT DETERMINISM same closure -> same logical runtime inventory/path mapping/order.
- DISTRIBUTION REPRODUCIBILITY same unsigned/store-neutral inputs -> explainably equivalent package content.
- SIGNED/INSTALLER BYTE IDENTITY = NOT automatically promised.
- Signing/timestamps: Code signing, timestamp authorities, installer metadata, compression timestamps and some platform-tool details can legitimately change physical bytes.
- These differences must be classified and explained rather than silently breaking the deterministic build claim or forcing the semantic cook to include wall-clock time.
- Forbidden nondeterminism: Semantic/cooked outputs must not depend accidentally on.
- unless an owning contract explicitly classifies that field as non-semantic artifact metadata.

##### EXP-04 — Cook Cache / Derivative Provenance / Stale-Poisoning Defense

- cooked documents shader/material variants UI bundles/atlases audio/media derivatives Scene/Section manifests runtime module chunks generated compliance artifacts.
- A cache hit is unsafe if its key omits a material input.
- Every reusable export/cook cache artifact binds a complete material provenance key.
- Representative key material.
- source/canonical semantic identity + revision/hash import/cook settings identity AssetRevision / DerivativeSetGeneration where applicable ResolvedConfigurationFingerprint target profile capability/export disposition toolchain/compiler identity schema version dependency identities.
- Cache hit validation: cache file exists is not valid cache hit.
- Before reuse, validate stored provenance/integrity against the current build context.
- Cross-project isolation: Two projects may reuse content-addressed physical bytes only if the cache system proves identical material provenance and does not merge project semantic identities.
- A cache directory name is not ownership proof.
- Preview/editor cache separation: Editor preview caches/thumbnails are not automatically export-authoritative cooked artifacts.
- Export consumes only artifacts with the correct cook/export provenance class.
- Invalidation: A changed material input invalidates the affected closure.
- The system must prefer conservative recook over silently shipping a stale derivative when dependency proof is incomplete.

##### EXP-05 — Runtime Build Manifest Root / File Integrity / Build Binding

- Example.
- Player shell from Export A + Cooked content folder from Export B.
- must not silently boot.
- A packaged player has one root Runtime Build Manifest / Build Binding.
- Representative root identity.
- ExportBuildId / RuntimeBuildId ProjectStableId / GameSaveNamespaceId GameDefinition / ResolvedConfigurationFingerprint BuildTargetProfileId PlayerRuntimeContractVersion CookManifest schema/version used capability closure fingerprint file/inventory root identity artifact/build version.
- Shell binding: The generated player shell/package contains or derives the expected RuntimeBuildId / manifest-root identity for the content it was assembled with.
- At startup.
- player shell expectation ↔ runtime build manifest.
- must match before gameplay becomes active.
- File integrity: The build manifest records integrity/hash information for runtime-critical packaged files.
- Verification may be tiered.
- critical bootstrap + manifest files -> verify before startup.
- large content -> verify on first load / bounded background validation as policy allows.
- to avoid mandatory full-game hashing on every launch.
- Meaning: Integrity here detects.
- partial copy mixed build corruption missing file unexpected stale file where exact inventory is required.
- Code signing/ASAR integrity provide separate layers where admitted.
- Exact inventory: The packaged-file inventory must be reconcilable with the manifest/artifact report.
- Unexpected files inside protected runtime namespaces are diagnosed rather than silently loaded.

##### EXP-06 — Player Shell / Cooked Content ABI / Capability Module Closure

- The player shell exposes one explicit Runtime Content Contract / compatibility handshake.
- Representative compatibility identity.
- PlayerRuntimeContractVersion CookManifestVersion supported capability identities/versions runtime document schema support required migration/adaptation lineage.
- Startup: Before first Scene activation.
- load root build manifest -> validate player/content contract -> validate used capability closure -> validate required runtime modules -> validate required content schema support -> only then enter normal RuntimeGameSession bootstrap.
- Wrong shell/content: An incompatible player/content pairing is a creator-build/package error.
- It must fail before partial gameplay rather than attempting best-effort execution of unknown semantics.
- Capability module closure: Every used runtime capability that requires code/module support must have a declared module projection.
- Build stripping/tree-shaking must not remove a module reachable only through typed dynamic capability registration.
- Conversely, the player must not ship editor implementations merely because an editor package also contains a runtime type.
- Store adapter: A store adapter composes over a complete base runtime.
- It cannot supply missing ordinary gameplay/runtime modules as a hidden repair for an incomplete store-neutral export.
- Save compatibility: Runtime Build identity and SaveCompatibilityDescriptor remain separate.
- A new compatible build may load old saves under SAV-02 migration policy.
- save compatibility is not defined by exact RuntimeBuildId equality.

##### EXP-07 — Runtime Layout Placement Classes / ASAR / Native / WASM / Large Media

- Electron application code, native modules, WASM, large FMV, cooked textures and ordinary runtime data have different loading constraints.
- Every packaged artifact receives/derives a runtime placement class.
- APP_CODE_ASAR_ELIGIBLE COOKED_EXTERNAL_READONLY ASAR_UNPACK_REQUIRED PLATFORM_NATIVE_RUNTIME STORE_TARGET_RUNTIME COMPLIANCE / NOTICE USER_WRITABLE = NEVER INSIDE IMMUTABLE RUNTIME CONTENT.
- Exact names/layout remain RSM-95/102-owned.
- Application code: The minimal player Main/Preload/Renderer application code should be packaged through the reviewed Electron application-code path, normally ASAR when the selected Electron/Forge security posture supports it.
- Cooked game content: Large/hierarchical cooked project content should remain inspectable and manifest-addressed rather than being forced into one opaque application-code archive.
- The exact directory layout remains deterministic and store-neutral.
- Native modules: A native .node/DLL/resource that requires a real filesystem path is placed in the admitted unpacked/native runtime area.
- Electron/Forge native-module unpack behavior must be proven against the actual packaged player.
- WASM / worker assets: WASM and worker artifacts are classified according to the admitted loader/backend and security contract.
- Video / large streaming media: MED-09 remains binding.
- If reliable local range/seek/stream behavior requires media outside app.asar, export layout must place the admitted media derivative accordingly.
- The product must prove that the packaged-player URI/protocol path supports the claimed seek/stream behavior.
- inside application ASAR outside ASAR native/unpacked cooked content store-target addition compliance-only.

##### EXP-08 — Packaged Player Electron Security / Protocol / Fuse / ASAR-Integrity Posture

- External platform reality: Current Electron security guidance recommends.
- nodeIntegration disabled contextIsolation enabled renderer sandbox enabled restrictive CSP navigation/new-window restriction typed validated IPC avoid file:// for application content review Electron fuses.
- Canonical Source06 already requires most of this.
- Export must now prove the packaged player actually retains the posture.
- The protocol maps only approved packaged runtime identities/paths within the build root.
- It must not become.
- arbitrary local filesystem browser remote proxy CSP bypass general URL fetch service.
- unless a separately admitted capability explicitly requires it.
- Current hardening candidates, when compatible with player requirements, include.
- RunAsNode = disabled NODE_OPTIONS environment support = disabled Node CLI inspect arguments = disabled Embedded ASAR integrity validation = enabled OnlyLoadAppFromAsar = enabled file-protocol extra privileges = disabled when custom protocol is used.
- Exact fuse names/support can change with Electron and must be re-verified against the selected release.
- @electron/fuses @electron-forge/plugin-fuses.
- ASAR integrity: When supported by the selected Electron/packager path, application-code ASAR integrity plus OnlyLoadAppFromAsar should be treated as a release hardening requirement or an explicit reviewed exception.
- External cooked game content still uses EXP-05 manifest/build integrity.
- ASAR integrity does not magically protect files outside the application ASAR.
- DevTools / debugging: Production player DevTools/debug entrypoints, inspector flags and development-only debugging APIs are absent/disabled unless an explicit release diagnostic policy admits a bounded path.
- Creator diagnostic bundles do not grant runtime authoring powers.
- Package-time fuse review: At the owning Electron/package milestone, the exact selected Electron version should be reviewed for applicable fuses.
- Custom local protocol: The player should use a narrowly controlled custom local protocol / equivalent contained resource serving layer rather than granting broad file:// application privileges.
- Dependency admission: This contract does not itself approve.
- or any new packager plugin.
- Security evidence: Artifact validation proves the actual packaged settings/fuses/protocol behavior.
- A secure source configuration is not enough if the final packaged binary differs.

##### EXP-09 — Store-Neutral Base / Signing / Installer / Store-Target Layer Separation

- Export produces one complete store-neutral base artifact first.
- Distribution layers derive from that accepted base.
- validated store-neutral runtime -> optional signing -> optional installer/container maker -> optional Steam/Epic/other admitted target layer.
- Semantic immutability: Signing, installer generation and store upload packaging may add target metadata/files, but they cannot silently recook gameplay or change canonical/cooked semantic meaning.
- If target requirements require a runtime platform adapter, that adapter must already be part of the declared target capability closure before base/target packaging.
- Signing identity: Creator-exported games are not automatically signed as RetroStage Maker.
- Any signing identity/certificate belongs to the selected distribution/signing policy and creator/ publisher ownership model.
- Secrets: Private keys, signing tokens, publisher credentials and store secrets.
- never enter canonical project documents never enter cooked runtime manifest never enter artifact reports in plaintext never enter portable evidence packages.
- They are injected through approved secret storage/CI/user tooling at the distribution layer.
- Reproducibility boundary: The artifact report distinguishes.
- unsigned/store-neutral base identity signed executable identity installer identity store-target identity.
- because signing/timestamp/installer steps may legitimately change bytes.
- Maker selection: Squirrel/WiX/MSIX/ZIP or another maker is not chosen by this candidate.
- The exact maker remains Source06/RSM-102/119 gated.
- Update ownership: Store target patch/update transport remains store-owned as already frozen.
- A generic Electron self-updater is not added to exported games merely because Forge supports publishing/update tooling.

##### EXP-10 — Immutable Install Resources / Writable User Data / Upgrade Preservation

- Critical rule: Packaged runtime/cooked resources are treated as immutable installation content.
- The player does not attempt ordinary runtime writes into.
- app.asar Resources/resources game-content root installed cooked manifests Program Files application directory store-managed install directory.
- Writable authorities: Writable player state uses explicit user-data roots owned by existing runtime contracts.
- Runtime Save Player Settings local logs/diagnostics bounded caches where admitted crash/recovery metadata where admitted.
- Save identity: The writable save root is derived from stable exported game/save namespace policy, not merely.
- current exe filename install directory build output folder name.
- so compatible upgrades do not orphan saves because the executable display name changed.
- Updates / reinstall: Replacing immutable application/content files must not silently destroy or relocate player saves unless an explicit user-facing uninstall/reset policy owns that operation.
- Portable mode: A fully portable "write beside executable" mode is not baseline.
- If later admitted, it must separately define permissions, store compatibility, update behavior, backup and path containment.
- Read-only proof: Clean-machine testing should include execution from a location where the install/content directory is not writable by the ordinary user process, proving that the player does not depend on accidental developer-folder write access.

##### EXP-11 — Artifact Contamination / Secret / Source-Map / Editor-Leak Prevention

- editor-only packages Studio state/media source assets that should have been cooked out tests/fixtures development tools Inspector/debug UI source maps with local paths .env files API/signing/store secrets temporary build files user profile paths unredacted logs old artifacts left by previous builds.
- RSM-102 physical artifact inspection becomes an exact contamination gate.
- Forbidden-by-default artifact classes: Unless explicitly required by the selected target.
- editor application code editor React panels/workspaces Babylon Inspector/editor-only debug tools test fixtures and snapshot baselines development-only dependencies source authoring documents not required by runtime raw source assets when approved cooked derivatives are sufficient workspace metadata Git data temporary cook/export directories .env / credential files private keys/tokens local absolute-path reports unapproved source maps/debug bundles.
- Source maps: Production source-map policy is explicit.
- If source maps are not needed for the shipped player, they are excluded.
- If a future diagnostic/release policy admits them, they must be separately classified/redacted and must not leak secrets or unnecessary machine-local paths.
- Local path redaction: Generated manifests/reports/player-visible logs use stable logical/project-relative identities.
- Machine-local authoring paths remain outside the game package unless the runtime genuinely requires a specifically reviewed contained path representation.
- Exact inventory: Unexpected files fail or warn according to protected namespace/severity policy.
- "Not referenced by package.json" is not proof that a file was not packaged.

##### EXP-12 — Artifact-First Verification / Clean-Machine / Reproducibility Evidence

- Principle: The final export claim is proven against the physical artifact, not against.
- source manifests Vite dev server editor PIE staging assumptions.
- alone.
- Required artifact evidence: For a release-capable export, evidence should bind at least.
- ExportBuildId ExportSnapshotId ResolvedConfigurationFingerprint BuildTargetProfileId toolchain/environment fingerprint RuntimeBuildManifest/root hash packaged-file inventory + hashes where applicable player dependency graph SBOM / notices native/WASM inventory editor/dev/source leakage result security/fuse/protocol configuration evidence signing/installer/store layer identities where used smoke/clean-machine result warnings/fallbacks.
- Artifact smoke: Run the actual staged/final packaged player and prove representative.
- bootstrap manifest compatibility first Scene load runtime resource resolution settings/input save/load Scene/Section transition representative audio/video where used shutdown.
- according to project capability closure.
- Corruption/mix proof: Tests should include.
- missing runtime file modified critical manifest/file shell from build A + content from build B stale extra protected-runtime file unsupported manifest/player contract.
- and verify controlled failure.
- Read-only install proof: The packaged player runs with immutable install resources and uses only approved writable roots.
- Clean machine: Clean-machine proof must not rely on.
- global Node/pnpm install developer Vite server editor repository authoring source files Visual Studio runtime unless explicitly packaged/required by an admitted native component untracked codec/tool DLL creator machine environment variables.
- Any prerequisite is part of RSM-92 supported-target contract and must be explicit.
- Offline proof: A store-neutral game's advertised non-network capabilities should launch/run with network unavailable unless the creator intentionally enabled an admitted network/store-dependent feature.

##### EXP-13 — Export Working-Set / Parallelism / I-O / Incremental Cache / Retention Contract

- Build performance risk: A deterministic export can still.
- consume all RAM spawn too many CPU workers saturate disk keep every intermediate alive make Maker unusable for minutes.
- Shared executor: Export uses JOB-01.
- External tools/processes, plugin processors and workers count against the build's global CPU/memory working-set policy.
- Build working set: The exporter defines/observes bounded classes such as.
- max concurrent CPU-heavy transforms max concurrent external processes temporary decoded asset bytes temporary compressed/uncompressed bytes in-flight output bytes hashing/I-O concurrency peak JS heap/native buffer class.
- Exact numbers are target/hardware-profile evidence.
- Streaming I/O: Large source/cooked/runtime artifacts should be.
- streamed chunked hashed incrementally or passed through bounded native/file handles.
- where practical instead of loading the entire build into JavaScript memory.
- Deterministic parallelism: Parallel completion order cannot change semantic/cooked artifact ordering or manifest meaning.
- Deterministic sort/identity rules remain explicit.
- Incremental build: Incremental speedup comes only from EXP-04 provenance-complete cache reuse.
- It does not come from building over the previous final output folder.
- Cache retention: Cook/export caches have.
- so repeated builds do not grow disk without bound.
- Cache eviction: Cache deletion can slow a later build but cannot make the project unrecoverable.
- No cache is the only copy of source/canonical truth.
- Editor responsiveness: When export runs while Maker remains usable.
- interactive Main/Renderer/JOB capacity.
- is reserved.
- Dedicated build mode: If a future CLI/dedicated build worker is admitted, it remains the same export authority/provenance contract, not a second compiler.

#### Authority placement: §9.15.5 Managed-source import/content lifecycle contracts (new under §9, after §9.14); consistent with §28 Asset Architecture

##### IMP-00 — Unified Import Authority / Input-Class Separation / Non-Bypass Contract

- ordinary asset source RetroStage project project archive / backup content pack plugin package localization interchange cinematic interchange media external DCC/reimport source.
- Treating all of them as one generic Import operation invites security, identity and migration confusion.
- Asset Import is a first-class RetroStage application use case owned by the asset pipeline and canonical AssetDocument authority.
- The product distinguishes at least.
- IMPORT_ASSET OPEN_PROJECT RESTORE_PROJECT_ARCHIVE IMPORT_CONTENT_PACK / PROJECT_CONTENT IMPORT_PLUGIN_PACKAGE IMPORT_LOCALIZATION_EXCHANGE IMPORT_CINEMATIC_INTERCHANGE.
- where supported.
- A file extension or drag/drop gesture may suggest an input class, but the receiving use case revalidates it.
- Non-bypass: The following may inspect, decode, propose or project.
- file picker Content Browser drop target Babylon loader glTF-Transform image/audio/font decoder plugin asset processor background worker filesystem watcher.
- but none may directly publish canonical asset state.
- Accepted flow.
- This reuses AST-01 atomic promotion, AST-02 untrusted-input containment, JOB-01 shared async execution and AUT project-write authority.
- Project boundary: Opening/restoring/merging projects is not asset import and uses the project/migration/remapping authorities.
- A .rsmproject file dragged onto Content Browser cannot become an ordinary AssetId.
- Plugin boundary: Plugins may contribute admitted import processors through PLG contracts, but cannot create a private asset registry, bypass source containment or publish runtime/Babylon objects as canonical assets.
- Project boundary: Opening/restoring/merging projects is not asset import and uses the project/migration/remapping authorities. A .rsmproject file dragged onto Content Browser cannot become an ordinary AssetId.

##### IMP-01 — Project Content Namespace / Managed Source Ownership / Portability Contract

- D:\Art\hospital.glb /home/user/audio/door.wav external-drive:\Characters\enemy.glb.
- If the canonical project depends on those workstation paths, moving the project, restoring a backup, using source control or building on another machine can fail.
- RetroStage distinguishes.
- ContentPath ProjectManagedSourceIdentity ExternalSourceLink [optional] AssetId.
- ContentPath is Creator organization, not identity.
- Default imported content must have a project-managed accepted source or equivalent immutable project-owned source snapshot sufficient to rebuild supported derivatives without the original workstation path.
- Representative physical layout remains implementation-owned, but the current Source03 direction.
- assets/source/ assets/metadata/ generated/ .retrostage-local/.
- is compatible with this rule.
- Source ownership modes: Baseline.
- MANAGED_SOURCE.
- The imported source/dependency set is brought under project ownership before accepted publication.
- A milestone may additionally support.
- LINKED_EXTERNAL_SOURCE.
- only when.
- external path/link = reimport provenance/convenience project-managed last-good accepted source snapshot = retained missing external link != project content loss external link != runtime/export dependency relink = explicit reviewed operation.
- Logical Content namespace: Creator-facing organization may look like.
- Content/ Characters/ Environments/ Props/ Materials/ Textures/ Audio/ UI/ Cinematics/.
- without requiring one exact physical folder convention.
- Move or rename of ContentPath does not change AssetId.
- Portability invariant: A supported project copy/archive can reopen and rebuild accepted content on another supported machine without requiring absolute source paths from the original workstation.

##### IMP-02 — SourceSet / SourceSnapshot / AssetRevision / Provenance Identity Contract

- Identity separation: The asset lifecycle distinguishes or derives stable equivalents of.
- SourceSetId SourceSnapshotId AssetId AssetRevisionId SubassetId ImportProfile / EffectiveSettingsFingerprint DerivativeSetGeneration.
- These identities may be represented differently in implementation, but their semantic roles cannot collapse.
- Meaning: SourceSetId : logical imported source dependency set.
- SourceSnapshotId : immutable accepted bytes/content identity for one source-set revision.
- AssetId : stable RetroStage semantic asset identity referenced by project content.
- AssetRevisionId : accepted semantic/import revision of that asset.
- SubassetId : stable child identity where a source produces independently referenced children.
- Not identity: The following are hints, labels or physical facts only.
- absolute source path Content Browser folder filename display name mtime source array index glTF node index Babylon object identity SQLite row identity thumbnail/cache filename.
- Provenance: Accepted source metadata records enough reviewable provenance to explain.
- where the accepted source came from which source members were admitted source hashes importer / processor identity effective import settings license/provenance metadata accepted revision derived-output lineage.
- Host-private original paths should not leak into player packages and may be redacted from shareable diagnostic/export artifacts where they are not required.
- Timestamp rule: Timestamps may optimize observation, but content validity and reimport identity cannot rely on timestamps alone.

##### IMP-03 — Multi-File Source Set / Sidecar Dependency / Containment Closure Contract

- scene.gltf scene.bin albedo.png normal.png.
- font + related metadata.
- media + admitted sidecar metadata.
- A single selected filename is not necessarily the complete source.
- Import inspection constructs an explicit contained SourceSet or equivalent dependency closure.
- Each member is classified.
- PRIMARY REQUIRED_DEPENDENCY OPTIONAL_DEPENDENCY EMBEDDED IGNORED / UNSUPPORTED.
- Containment: AST-02 remains controlling for untrusted paths and URI handling.
- A source file cannot grant arbitrary filesystem/network authority through.
- ../ traversal absolute path UNC path file:// http:// / https:// symlink/reparse escape unbounded directory search.
- A supported sidecar must be explicitly admitted into the source set or resolved by a separately authorized brokered workflow.
- Atomicity: If a required member is missing, malformed, ambiguous or outside allowed containment.
- no partial canonical AssetRevision publication.
- The previous accepted revision remains last-good.
- Source-set hash: Change detection considers the required admitted dependency set, not merely the primary file hash.
- Adding/removing/replacing a required sidecar can invalidate the source snapshot and affected derivatives.
- Duplicate names: Two source members with the same basename are not conflated. Resolution uses contained source-set identity/path context rather than basename-only lookup.

##### IMP-04 — Generic Stable Subasset Identity / Reimport Remapping Contract

- meshes materials textures skeletons animation clips morph targets sprite slices audio regions where supported other admitted subassets.
- Reimport may reorder, rename, add, remove, split or merge those children.
- Generic subasset continuity must not depend only on source array index, transient importer order or display name.
- Where subassets are externally referencable, reimport computes a reviewable mapping classification.
- UNCHANGED RENAMED_OR_RELABELED ADDED REMOVED SPLIT MERGED AMBIGUOUS INCOMPATIBLE.
- Mapping evidence: Mapping may use format/domain evidence such as.
- stable source identifiers where available hierarchy/parent relationships semantic type structural/content fingerprints creator-approved mappings domain-specific rig/animation/sprite evidence.
- Name similarity alone is advisory.
- Destructive change: If one old SubassetId cannot be safely mapped to one compatible new child.
- do not silently pick the nearest candidate.
- The reimport review exposes affected references and requires explicit repair, accepted remap, replacement or rejection.
- Domain ownership: RIG-00/RIG-07, ANI-12, texture/sprite atlas identity, material identity and other domain-specific contracts may add stronger rules, but they build on this generic subasset lifecycle rather than inventing incompatible identity systems.
- Tombstone/history: Removed subasset identity may remain diagnosable as historical/tombstoned metadata long enough to explain broken references and repair them.
- it does not remain a live runtime resource.

##### IMP-05 — Import Profile / Effective Settings Fingerprint / Importer-Version Drift Contract

- Accepted asset revision records or derives.
- ImportProfileId / profile revision where used accepted effective import settings ImporterId ImporterImplementationVersion / semantic revision relevant admitted processor/tool versions where output-affecting EffectiveSettingsFingerprint.
- Reimport default: Normal reimport uses the accepted effective settings of the asset, not whatever defaults happen to be current in a newer editor.
- new application defaults != automatic migration of old imported assets.
- Explicit upgrade: A creator may invoke an explicit reviewed operation such as.
- Adopt Current Import Defaults Upgrade Import Profile Change Import Settings.
- That operation is a semantic import-settings change.
- preview impact -> invalidate affected derivatives -> reimport candidate -> validate -> explicit commit.
- Cache/provenance key: Derivative validity considers all material inputs.
- SourceSnapshot identity + effective settings fingerprint + importer/processor semantic identity + relevant project capability/profile inputs.
- source hash matches alone is insufficient when settings/importer semantics changed.
- Migration: If an old importer profile cannot be executed by a newer RetroStage release, migration must be explicit and evidence-backed. Silent best-effort reinterpretation is not accepted.

##### IMP-06 — Content Browser Move / Rename / Duplicate / Delete / Collection Contract

- Authority: Content Browser is a Creator workflow over canonical asset commands and the derived index.
- It is not a raw filesystem explorer.
- Rename / move: rename display/content path -> AssetId unchanged.
- move between Content folders -> AssetId unchanged -> semantic references unchanged.
- The physical storage adapter performs necessary file operations through project authority.
- Duplicate: Duplicate Asset means.
- new AssetId new appropriate canonical metadata identity copied/derived source ownership according to asset policy explicit internal-reference remap where needed.
- It is different from placing the same asset twice in a Scene.
- Physical blob deduplication, if later implemented, does not merge semantic AssetIds.
- Delete: Delete uses reference impact.
- Delete Asset Request -> incoming/outgoing reference graph -> required/optional/reference classification -> block / repair / replace / confirm policy -> canonical transaction.
- Deleting a source file directly from disk is never the canonical deletion protocol.
- Collections: Collections/tags may be derived or authored organizational metadata according to the owning schema, but they do not become AssetId and do not change gameplay/runtime meaning merely by membership.
- External move: A watcher observing an external physical move reports a change/missing-source state. It does not silently reinterpret a different file as the same asset.

##### IMP-07 — Import / Reimport Job / Batch / Lock / Cancellation / Atomic Publication Contract

- Shared executor: Import and reimport use JOB-01 rather than creating uncontrolled worker pools.
- Representative phases.
- queued -> source admission -> inspect -> parse/decode -> normalize -> derive -> validate -> await/review where required -> atomic publish -> index/thumbnail follow-up.
- Generation binding: A job captures the identities needed to reject stale work.
- ProjectStableId / authoring session AssetId or provisional import identity SourceSnapshot candidate import settings/profile revision captured accepted AssetRevision where reimporting JobId / generation.
- Late completion from an older job cannot overwrite a newer accepted revision.
- Per-asset/source concurrency: Competing writes to the same AssetId/source-set are serialized, rejected, superseded or otherwise generation-guarded.
- Two background workers cannot both publish “latest” revisions.
- Cancellation: Cancellation before publication.
- canonical asset state unchanged temporary artifacts cleaned or quarantined previous accepted revision preserved.
- Batch import: Batch import has per-item diagnostics and an explicit atomicity policy.
- A group that is semantically one SourceSet follows IMP-03 atomicity.
- Independent files may succeed/fail independently only when the UI and evidence make that partial result explicit.
- Disk/full failure: Out-of-space, decode failure, tool crash, worker termination or validation failure cannot leave half-published metadata/derivative generations.

##### IMP-08 — External Source Change / Relink / Missing Source / Last-Good Contract

- Observation: Chokidar/file observation remains.
- observation != command.
- A relevant source change can produce states such as.
- READY SOURCE_CHANGED REIMPORT_AVAILABLE SOURCE_LINK_MISSING RELINK_REQUIRED IMPORT_FAILED_USING_LAST_GOOD DERIVATIVE_STALE UNSUPPORTED.
- Exact UI labels may evolve.
- Default policy: External source modification does not automatically rewrite canonical asset state by default.
- source changes -> hash/source-set inspection -> reviewable reimport availability.
- A later opt-in auto-reimport mode, if admitted, still obeys AST-01/IMP-07 publication and must be restricted to explicitly safe policy classes.
- Missing source: For MANAGED_SOURCE, missing canonical project-managed source bytes are an integrity problem.
- For optional LINKED_EXTERNAL_SOURCE.
- external link missing -> relink diagnostic.
- last accepted project-managed snapshot -> remains available.
- where that mode is supported.
- Relink: Relinking is not “edit path string and continue”.
- The new candidate source is inspected and classified.
- same/compatible source continuation replacement source ambiguous incompatible.
- Subasset/reference impact is reviewed before accepted publication.
- Last-good: Failed reimport or broken external linkage does not destroy the last-good accepted AssetRevision and coherent derivative set.

##### IMP-09 — Canonical Generated Content / Rebuildable Derivative / Bake Promotion Contract

- thumbnail/cache cooked texture optimized mesh generated atlas LOD baked scatter result creator-chosen bake-to-editable result.
- Treating all generated files as disposable risks deleting authored work.
- Classification: Every relevant generated output belongs to a semantic storage class such as.
- REBUILDABLE_DERIVATIVE CANONICAL_AUTHORED_OR_PROMOTED_CONTENT EDITOR_LOCAL_CACHE COOK_EXPORT_ARTIFACT.
- Exact enum names are implementation-owned.
- Rebuildable derivative: A rebuildable derivative has sufficient canonical source/settings/provenance to regenerate it.
- Clearing it cannot destroy the only recoverable Creator intent.
- Canonical recipe vs output: Example.
- AtlasDefinition / atlas settings = canonical authored intent.
- generated atlas pixels = rebuildable derivative.
- unless the owning workflow explicitly promotes the result to canonical authored content.
- Bake/promote: A workflow such as Bake To Editable or equivalent.
- derivative preview -> explicit promote/bake command -> new or updated canonical authored identity -> provenance to source/recipe.
- After promotion, cleanup rules treat the result as canonical according to its owner.
- No hidden authority: A generated file existing on disk does not become canonical merely because another editor surface can load it.

##### IMP-10 — Collision / Replacement / Orphan / Physical Dedup Safety Contract

- Import collision: If a Creator imports a source whose suggested name/path conflicts with existing content, the system does not infer semantic overwrite from filename equality.
- Explicit operations include.
- IMPORT_AS_NEW_ASSET REIMPORT_EXISTING_ASSET REPLACE_SOURCE_FOR_EXISTING_ASSET CANCEL.
- where applicable.
- Each operation has different identity and reference semantics.
- Replace source: Replacing the source of an existing AssetId requires.
- target AssetId explicit new source candidate admitted subasset/semantic compatibility review affected reference review derivative invalidation atomic publication.
- Orphans: The pipeline can diagnose.
- canonical asset with missing managed source unreferenced source snapshot orphan derivative broken subasset reference stale cooked artifact.
- without equating every unreferenced asset with safe deletion.
- Physical deduplication: Content-addressed storage/cache deduplication may reuse identical physical bytes.
- Invariant.
- physical blob reuse != AssetId merge != license/provenance merge != project semantic identity merge.
- Cross-project caches follow EXP-04 provenance rules.
- Replacement compatibility: A Texture cannot silently replace a Skeleton, and even same-class replacement may require capability/semantic compatibility checks.

##### IMP-11 — Creator Import / Reimport Review / Progressive Disclosure / Diagnostics Contract

- Default Creator workflow: Ordinary import should be understandable in project/game terms.
- Import Files -> Destination / Content location -> Detected asset meaning -> readiness summary -> recommended profile/settings -> Import.
- For a character source, the summary may show.
- Model Skeleton: detected Animations: N Materials: N Textures: N Rig mapping: ready / needs review.
- without exposing parser internals.
- Advanced: Advanced may expose bounded owner-approved options such as.
- source ownership/link mode units / scale / axis normalization material policy texture role/color-space policy normal/tangent policy animation import selection rig mapping/profile LOD/optimization profile sprite/atlas policy audio/media policy where owned reimport profile/settings.
- Domain-specific panels remain owned by RIG/ANI/VIS/MED/etc.
- Reimport review: When change is material, Creator review can present.
- source changed settings changed subassets added/removed/renamed/ambiguous references affected derivatives invalidated estimated repair blockers.
- Actions remain typed.
- Reimport Review Changes Relink Source Replace Source Keep Last Good Open Import Settings Show References Repair Mapping.
- Status / Content Browser: Content Browser may expose bounded status such as.
- READY SOURCE_CHANGED REIMPORT_REQUIRED SOURCE_LINK_MISSING IMPORT_FAILED_USING_LAST_GOOD DERIVATIVE_STALE REFERENCE_BROKEN LICENSE_REVIEW EXPORT_BLOCKED.
- with creator-readable reason and repair navigation.
- Diagnostics / Expert: Diagnostics can expose.
- Non-exposure: Ordinary Creator workflows do not require.
- Babylon AssetContainer glTF accessor/bufferView index SQLite row IDs cache filenames raw decoder objects worker internals absolute hidden build paths.

##### IMP-12 — Import → Cook → Runtime Manifest → Export Provenance Closure Contract

- End-to-end chain: Supported content can be explained through.
- SourceSet / SourceSnapshot -> AssetId / AssetRevision -> stable SubassetIds -> accepted DerivativeSetGeneration -> canonical semantic references -> immutable ExportSnapshot -> CookPlan / cooked artifact identities -> Runtime Content Manifest -> ExportBuild / package inventory.
- Runtime boundary: Packaged runtime resolves cooked/runtime content identities.
- It does not resolve.
- original DCC path absolute workstation source path Content Browser convenience path as identity editor thumbnail cache raw authoring source folder unaccepted temporary import output.
- Source stripping: Player builds include only content required by the accepted runtime closure plus required notices/ runtime metadata. Authoring source assets and editor-only import metadata are excluded unless a specific runtime capability explicitly requires a separately admitted representation.
- Cook validity: Cook/export refuses stale or incompatible derivative generations even if files exist.
- The build records sufficient provenance to explain which accepted AssetRevision/derivatives were used.
- Project archive / backup distinction: Portable authoring project archive should preserve enough to reconstruct the project.
- canonical project documents project-managed accepted source snapshots canonical import settings/profile identity required provenance/license metadata.
- while rebuildable/editor-local data such as.
- thumbnails SQLite search index temporary import staging rebuildable derivatives where policy permits.
- need not be authoritative archive content.
- Archive policy remains AUT-11-owned.
- No export-only resolver: EXP shared resolver/capability rules remain controlling.
- import does not introduce a second export-specific asset meaning.

##### IMP-13 — Content Path / Case / Unicode / Reparse / Portable Archive Safety Contract

- Portability risk: A content project can appear valid on one machine but fail elsewhere because of.
- case-only collisions Unicode normalization differences reserved Windows names trailing spaces/dots invalid target-platform filename characters path length separator differences symlink/junction/reparse traversal archive path traversal absolute host paths.
- Canonical AssetId remains path-independent, while user-visible ContentPath/source storage names use a validated portable normalization policy.
- Import/move/rename detects relevant collisions before publication.
- Examples.
- Texture.png texture.png.
- must not become two silently conflicting portable content entries when a supported target filesystem cannot distinguish them safely.
- Reserved / unsafe names: The owning storage policy rejects or repairs names that cannot be represented safely on supported project/export/archive targets.
- Unicode: Normalization and comparison policy is explicit and deterministic. Display labels may preserve Creator text where safe, while identity and collision checks use the defined normalized form.
- Reparse / symlink: Workspace confinement uses resolved-path/reparse checks as required by Source04/AUT/AST-02 security rules. A path that lexically appears inside the project cannot escape through a junction/symlink.
- Archive extraction: Project/content archive extraction rejects.
- ../ traversal absolute paths drive/UNC escape unsafe link/reparse entries duplicate normalized destinations.
- before canonical files are materialized.
- Host-path leakage: Runtime packages, portable project archives and shareable diagnostics do not require or silently publish private absolute workstation paths except where an explicit user-approved diagnostic export owns that disclosure.

#### Authority placement: §9.15.5 Prefab identity/rebase contracts (new under §9, after §9.14)

##### PFB-01 — Prefab Definition / Instance / Stable Local Child / Override Identity

- RSM-58 spans gameplay components, visuals, animation/equipment, interactions, level placement, story references and save identity. Prefab hierarchy/index identity is therefore unsafe.
- Prefab semantics distinguish.
- PrefabDefinitionId PrefabVariantId where used PrefabInstanceId PrefabLocalEntityId / stable local child identity component/field override identity.
- A Prefab local child identity is independent of display name, array order, hierarchy ordering, editor tree path and Babylon node identity.
- A placed Prefab instance derives/reifies stable instance-child identity from its PrefabInstance plus stable local child identity according to the canonical schema.
- Effective state resolves deterministically through bounded layers such as.
- Base Prefab -> authored Variant -> Instance overrides.
- Presentation and gameplay overrides remain separately classifiable.
- Overrides target stable semantic component/field identities, not fragile Inspector/tree paths.
- Prefab resolution produces ordinary canonical/runtime entities/components. Prefab machinery does not become a privileged runtime gameplay engine.
- Scene links, Story/Objective references, interactions, equipment and save identity target stable resolved semantic identities, not raw Prefab hierarchy paths.

##### PFB-02 — Prefab Update / Rebase / Variant / Detach / Save-Migration Safety

- Updating a PrefabDefinition is a reviewed canonical transaction.
- new prefab candidate -> resolve affected instances/variants -> classify unchanged / cleanly rebaseable / conflicting / removed identity -> validate references + override paths + migration implications -> creator review where destructive/conflicting -> commit.
- If base update and instance override both change the same semantic field, conflict handling is explicit. The product cannot silently choose base or silently discard the override.
- Deleting/replacing a Prefab-local child referenced by Scene links, Story/Objectives, Runtime Save, Sequence, equipment/loadout or another durable reference requires explicit remap/migration/removal handling.
- Detach is atomic authoring work. Existing stable identities are preserved where valid.
- otherwise a deterministic reviewed remap is required. Half-prefab/half-detached state is forbidden.
- A compatible visual Prefab update should not invalidate Runtime Save merely because presentation changed. Persistent semantic identity changes are migration-sensitive.
- Visual variants do not silently change gameplay meaning unless the authored variant explicitly contains an admitted gameplay override.

#### Authority placement: §9.15.6 Authoring durability/workspace transaction contracts (new under §9, after §9.14)

##### AUT-00 — Persisted Project Revision / Multi-File Save Transaction Barrier

- A multi-document canonical change has one accepted AuthoringRevisionId. Save captures that immutable revision and its complete dirty canonical-file set, serializes and validates every candidate before authoritative replacement, and journals the previous persisted revision, logical paths, preimage and candidate hashes, recovery locators, and transaction phase. PersistedProjectRevision advances only after all required replacements succeed. Recovery may roll forward only from a complete proven set or restore previous preimages.
- it must never accept a mixed half-transaction. A save of revision N that finishes after authoring reaches N+1 leaves the project dirty. Failure preserves the previous known-good persisted state. Versioned storage metadata must detect partial copy, mixed restore, interrupted save, and stale canonical files.

##### AUT-01 — Single Writable Authoring Session / Project Workspace Lease

- One physical project workspace has at most one writable canonical authoring owner at a time.
- Representative identity.
- ProjectStableId CanonicalWorkspaceIdentity / normalized realpath identity WritableProjectLeaseId EditorProcess/Instance identity lease generation.
- Same application: Multiple editor windows may observe one project only through one shared AuthoringSession/write authority or explicit read-only projections.
- They do not create independent writable canonical sessions.
- Separate processes: If another RetroStage process already owns the writable project lease, a second process must use an explicit policy such as.
- open read-only refuse writable open request/take over only after verified stale-owner recovery.
- It may not silently become a second writer.
- Stale lock: A lock marker/file by itself is not canonical truth.
- The exact implementation must distinguish.
- live owner stale crash residue copied workspace containing stale marker ambiguous network/removable-filesystem state.
- and require safe recovery/takeover rather than deleting lock evidence blindly.
- Lease loss: If the current process can no longer prove its write lease.
- canonical commands may remain inspectable in memory but explicit save/migration/external-file overwrite is blocked.
- until authority is re-established or the user saves/forks through an approved new workspace path.
- Worker/plugin/agent rule: Jobs, plugins, MCP/agents and file watchers never receive a competing workspace write lease.
- They operate through the one application/authoring authority.

##### AUT-02 — Dirty / Persisted / Saving / External-Change State Derivation

- save in progress new edits after save capture save failure external disk modification recovery-required disk state.
- Project lifecycle state is derived from explicit authority facts such as.
- CurrentAuthoringRevisionId LastPersistedProjectRevisionId ActiveProjectSaveTransactionId LastSaveResult ExternalDiskWitness / ExternalChangeSet state RecoveryRequired state WritableProjectLease state.
- Exact UI state-machine shape remains RSM-10/14-owned.
- Dirty: Conceptually.
- DIRTY = current accepted authoring meaning differs from the last acknowledged persisted project revision.
- not.
- last Save button returned success.
- Save during edit: If save captures N and the user edits to N+1 while I/O continues, save of N may succeed while the project remains dirty.
- Save failure: A failed save does not clear dirty state.
- External modification: External disk modification does not automatically make the in-memory authoring snapshot dirty "because disk changed".
- Instead it introduces an explicit.
- EXTERNAL_CHANGE_PENDING / CONFLICT.
- dimension that must be reviewed under AUT-03.
- Close indicators: The creator UI must distinguish as useful.
- Unsaved authoring changes Save in progress Save failed External changes detected Recovery required Read-only / write lease unavailable.
- rather than collapsing them into one generic asterisk.

##### AUT-03 — External Change Witness / Diff / Reload / Save-TOCTOU Barrier

- Existing Source direction: D-040 already correctly requires.
- filesystem event -> debounce -> inspect/hash -> diff/reload proposal -> validation -> user/policy decision -> canonical command/transaction.
- AUT-03 hardens the race with active in-memory edits and save.
- Disk witness: The authoring session/project-storage layer tracks the last known persisted disk witness for canonical files relevant to the current project revision.
- Representative witness data.
- logical file identity expected content hash/revision last accepted persisted generation filesystem observation generation.
- Save precondition: Before a save transaction replaces a canonical file, it verifies that the authoritative disk preimage still matches the expected persisted witness.
- If another tool/process changed the file after capture.
- save does not silently overwrite it.
- The save becomes a conflict/review operation.
- Self-write classification: Filesystem events produced by RetroStage's own accepted save/import/migration transaction are recognized through transaction/path/hash evidence.
- They do not create false "external modification" conflicts.
- External change while clean: A clean project may offer explicit validated reload/apply when external changes are coherent.
- Even then, watcher observation itself never mutates canonical memory.
- External change while dirty: If both.
- in-memory accepted authoring changed AND disk changed externally.
- It does not choose.
- silently.
- using stable IDs/document-aware semantics.
- Unsupported/conflicting semantic merges may require explicit choose/reload/reapply/manual repair.
- Save/Reload history: Accepted external changes enter canonical history/provenance according to RSM-31/32 policy.
- They do not bypass undo/recovery simply because their source was the filesystem.
- the system creates a reviewable conflict.
- memory wins disk wins newest timestamp wins.

##### AUT-04 — Autosave / Recovery Snapshot / Crash Journal / Explicit-Save Separation

- Autosave/recovery is a safety system, not a second canonical save authority.
- Explicit Project Save = user-approved persisted project state.
- Autosave / Recovery Snapshot = local recovery candidate.
- Recovery generation: A recovery candidate binds.
- ProjectStableId base PersistedProjectRevisionId captured AuthoringRevisionId schema/version set logical canonical inventory content hashes/integrity creation/recovery generation.
- plus bounded recovery metadata.
- Autosave never promotes explicit state: Autosave does not.
- replace explicit canonical files clear dirty state become the new explicit persisted revision.
- by itself.
- Crash journal: On abnormal shutdown, the recovery system distinguishes.
- incomplete explicit ProjectSaveTransaction valid newer autosave/recovery candidate last known-good explicit persisted project external disk changes after the recovery base.
- Recovery choice: Startup does not apply "newest file wins".
- It presents/derives explainable options such as.
- open last explicit project inspect/recover autosave candidate finish/rollback interrupted explicit save where proven compare with externally modified disk state.
- Applying recovery: A recovery candidate becomes normal accepted authoring state through validation/migration and the authoring session.
- It remains dirty until the user explicitly persists it.
- Retention: Recovery/autosave generations are bounded by count/bytes/time policy.
- The last known useful recovery candidate is not discarded merely because a newer corrupt candidate exists.
- Privacy: Recovery data may contain project content and therefore stays local/private under the same project security rules.
- It is not automatically included in diagnostics/telemetry.

##### AUT-05 — Whole-Project Schema Migration / Pre-Migration Backup / Rollback

- Opening a supported historical project performs migration against a staged/candidate project graph, not in-place opportunistic edits as each file is read.
- read project in non-mutating compatibility mode -> classify schema/version set -> create pre-migration backup/recovery point -> migrate all required documents/assets metadata in deterministic order -> apply stable-ID/reference remaps -> validate complete candidate graph -> validate unknown-data preservation -> publish through AUT-00 project persistence transaction -> open new accepted AuthoringSession.
- Old project remains recoverable: Until migration publication succeeds, the original persisted project remains the last known-good version.
- Failure: Migration failure.
- does not leave some files at schema N+1 and others at N does not overwrite the only compatible backup does not create a writable partially migrated session.
- Future version: Unsupported future project/schema meaning fails closed/read-only as allowed by product policy.
- RetroStage does not "best effort save" unknown newer canonical data into an older format.
- Application update: Application update and project migration remain separate.
- Launching a newer RetroStage build does not silently commit destructive project migration before backup/review policy.
- Plugin data: Plugin-owned extension migrations remain governed by PLG-07/21 and participate in the whole-project migration/recovery transaction when materially required.

##### AUT-06 — Project Identity / Workspace Location / Relocation / Fork / Save-As Semantics

- Critical distinction: ProjectStableId is not workspace filesystem path.
- Moving a project directory does not automatically create a new project.
- Copying a directory does not automatically prove it is the same active project either.
- Workspace location: A normalized trusted workspace location is a locator for one project identity.
- Local Recent Projects/history may remember locations but cannot redefine ProjectStableId.
- Relocation: A project moved to another path can preserve ProjectStableId after.
- root/schema/path validation project identity confirmation workspace trust review derived/local path rebuild as needed.
- Duplicate physical locations: If two live locations claim the same ProjectStableId, RetroStage treats the state as ambiguous.
- The user must resolve intent such as.
- this is the same project at a new location this is a fork/copy that needs a new ProjectStableId open this copy read-only forget the stale location record.
- Save As terminology: Maker UX should distinguish where useful.
- SAVE = persist current project identity.
- SAVE COPY / BACKUP = write a copy without changing active project identity.
- FORK / DUPLICATE PROJECT = create a new ProjectStableId.
- RELOCATE / MOVE PROJECT = preserve ProjectStableId at a new workspace location.
- A generic "Save As" must not hide which semantic identity operation is occurring.
- Fork: Forking normally preserves the internal authored graph/StableIds where they are project-scoped and remain coherent, while minting a new project identity and rebuilding local-only state.
- Any project-derived namespace requiring uniqueness outside the project boundary must have an explicit fork policy.
- In particular.
- Those identities change only through their own owning semantics.
- unless an explicit safe copy/import feature owns that operation.

##### AUT-07 — Duplicate / Copy / Paste Stable Identity / Internal Reference Remap

- entities components where multiplicity allows Scene content Prefab instances/definitions camera zones lights triggers objectives dialogue nodes UI elements.
- A raw JSON copy can duplicate durable IDs and create alias corruption.
- Duplicate/copy-paste is a typed canonical authoring operation, not raw object cloning.
- Clone plan: The operation first computes a clone closure.
- selected source stable identities owned child identities owned local references external incoming/outgoing references destination context.
- New identities: Durable identities that represent new semantic instances are freshly minted.
- duplicate Entity_A -> Entity_B with new EntityId.
- Internal reference remap: References whose source and target both belong to the duplicated closure are remapped to the cloned target when that matches the owning type semantics.
- Example.
- Door_A -> Trigger_A duplicate both -> Door_B -> Trigger_B.
- not Door_B -> Trigger_A by accident.
- External references: References from the duplicated closure to objects outside it follow explicit per-reference/type policy.
- preserve reference to original clear/review require user choice.
- rather than guessing by name/path.
- Incoming external references to the originals do not automatically retarget to the duplicates.
- Clipboard: Clipboard payload is a versioned, validated, non-authoritative transfer format.
- It contains stable source provenance and enough typed clone data for import/remap, but.
- clipboard IDs is not permission to reuse durable target IDs.
- Pasting into another project performs compatibility/capability/schema validation and cannot smuggle executable/plugin authority.
- Undo: Duplicate/paste is one canonical command/transaction and therefore participates correctly in undo/redo.

##### AUT-08 — Rename / Move / Delete / Reference Impact / Orphan Safety

- Rename: Creator-facing rename normally changes display/name metadata only.
- rename is not new stable identity.
- References do not retarget by string matching.
- Move / reparent / storage relocation: Hierarchy move/reparent is a typed semantic command.
- Moving a canonical file or asset location preserves semantic identity when the owning type permits relocation and updates storage locators/references through approved remap rules.
- Delete impact analysis: Before destructive deletion, the application can derive.
- incoming durable references owned children save/export/story/sequence implications plugin-owned extension references derived index references.
- where relevant.
- Delete policy: A delete may.
- block because required references exist perform an explicit cascade transaction replace/remap references through creator-approved action leave approved optional missing references with diagnostics.
- according to type semantics.
- It never silently retargets to an object with the same display name.
- Tombstones / aliases: Tombstones, aliases or supersession records are used only where historical/migration/persistence continuity requires them.
- They are not mandatory clutter for every ordinary reversible editor delete.
- Orphan cleanup: "Unreferenced" does not automatically mean "safe to delete", especially for creator source assets that may intentionally be unused temporarily.
- Generated/rebuildable data may be garbage-collected under AUT-09.
- Canonical/source content requires explicit product/creator-owned cleanup semantics.

##### AUT-09 — Storage-Class / Cleanup / Rebuildability / Path-Migration Boundary

- Canonical storage classes: The project layout maintains explicit classes such as.
- CANONICAL_AUTHORING_DOCUMENT SOURCE_ASSET / NONREBUILDABLE_PROJECT_INPUT GENERATED_REBUILDABLE EDITOR_LOCAL / .retrostage-local COOKED / EXPORT CANDIDATE RUNTIME_SAVE = separate runtime authority EXTERNAL_REFERENCE.
- Exact directory names remain RSM-29-owned.
- Cleanup: A cleanup tool deletes automatically only data proven by class/manifest/provenance to be rebuildable/local-owned.
- folder happens to be named "generated" is not sufficient deletion authority.
- Source assets: Source assets remain protected even if a derivative exists unless the owning import/storage policy explicitly proves the source is safely replaceable/discardable and the creator requested that operation.
- Local caches: Deleting.
- index thumbnails preview cache temporary cook outputs.
- cannot destroy project truth.
- Path migration: Workspace-layout/path-schema changes are migrations with.
- source/destination containment collision detection preimage/backup candidate staging reference/storage-locator update validation recoverable publication.
- External references: External references are never silently copied/deleted/moved by project cleanup.
- Missing external sources degrade to diagnostics/import-relink flows according to the asset policy.
- Runtime separation: Exported player and Runtime Save never write back into these canonical/source roots.

##### AUT-10 — Close / Quit / Project Switch / Update / Job Quiescence Interlock

- save asset import plugin processor migration external reload export snapshot thumbnail/navigation jobs.
- and stale completion can write after the authoring session is gone.
- Close/project-switch/application-quit enters a controlled quiescence workflow.
- Dirty project: The user must resolve unsaved canonical edits according to product policy.
- Save Discard Cancel close Recovery snapshot on emergency shutdown where policy applies.
- No workflow silently treats autosave as explicit Save.
- Active save: Close does not report completion until the active ProjectSaveTransaction reaches a safe terminal state or is safely cancelled/left recoverable.
- Jobs: All material jobs carry AuthoringSession/project generation leases.
- Project close.
- cancels/rejects publishable stale jobs waits only for operations whose safe shutdown requires bounded quiescence releases locks/resources.
- Late results cannot reopen files or mutate a new project that reused the same UI panel.
- Export: An export may continue only if it already owns an immutable ExportSnapshot independent of the closing authoring session and product UX explicitly allows background continuation.
- It cannot read more live project state after close.
- Application update/restart: A product update/restart does not begin while an uncommitted canonical save/migration transaction is being silently abandoned.
- Recovery markers are finalized before forced restart where the platform permits.
- OS/process crash: Hard crash cannot guarantee graceful quiescence.
- AUT-00/04 journals and recovery candidates are the fallback safety boundary.

##### AUT-11 — Portable Project Archive / Backup / Restore / Version-Control Reconciliation

- Backup truth: A backup is proven only by successful restore/validation, matching D-041.
- Portable project archive: A project archive/backup captures an explicit inventory of.
- canonical authoring documents required source/nonrebuildable project assets required extension requirement metadata/envelopes project storage schema/version integrity hashes license/provenance metadata required to preserve project legality where applicable.
- and excludes by default.
- Runtime Save secrets plugin permission grants workspace locks Studio-local history rebuildable indexes/thumbnails/caches temporary export/cook outputs machine-local absolute paths.
- unless a separate backup mode explicitly owns them.
- Restore: Restore occurs into staging/new workspace.
- extract with path/size containment -> validate archive inventory/hashes -> parse/schema/migrate as needed -> validate complete project graph -> resolve ProjectStableId/location ambiguity -> publish/open through normal project lifecycle.
- It never restores by blindly overlaying a currently open project directory.
- Version control: Git/source-control integration remains external/tooling-friendly because canonical files are diffable.
- After external VCS changes.
- file observation -> AUT-03 review/validation.
- Collaboration boundary: First-product architecture remains collaboration-safe, not real-time collaborative.
- No CRDT/live multi-writer canonical authority is implied.
- Multiple contributors coordinate through filesystem/version-control change review, one writable local authoring session per workspace, stable IDs and deterministic migration/validation.
- Archive identity: Restoring a backup to a second location with the same ProjectStableId triggers AUT-06 ambiguity handling rather than silently creating two writable clones of one identity.
- RetroStage does not pretend line-level Git merge success proves semantic project validity.
- applies.

##### AUT-12 — Authoring Corruption / Recovery Classification / Explainable Evidence

- Project open/save/recovery diagnostics classify failures rather than reducing everything to "Project could not open".
- Representative classifications include.
- CANONICAL_FILE_MISSING CANONICAL_FILE_PARSE_FAILED UNSUPPORTED_FUTURE_SCHEMA MIGRATION_REQUIRED MIGRATION_FAILED REFERENCE_INTEGRITY_FAILED PERSISTED_REVISION_WITNESS_MISMATCH INCOMPLETE_PROJECT_SAVE_TRANSACTION RECOVERY_CANDIDATE_AVAILABLE EXTERNAL_CHANGE_PENDING EXTERNAL_CHANGE_CONFLICT WORKSPACE_WRITE_LEASE_UNAVAILABLE WORKSPACE_IDENTITY_AMBIGUOUS PATH_CONTAINMENT_FAILED BACKUP_RESTORE_FAILED.
- Exact diagnostic IDs remain validation/storage-owned.
- Fail closed before mutation: Corruption discovered during open is diagnosed before a writable normal AuthoringSession is published.
- Where possible the user can.
- open read-only/restricted restore previous explicit revision inspect recovery candidate restore backup review external changes relocate/fork project.
- without first overwriting the damaged evidence.
- Recovery provenance: A recovery proposal explains.
- source explicit revision candidate authoring revision/time integrity state files/documents affected schema/migration state whether external disk changes exist which action would mutate canonical files.
- No silent repair: RetroStage may provide deterministic safe repair/Fix commands where semantics are certain.
- It does not silently.
- delete unknown fields regenerate missing stable IDs with guessed references choose newest timestamp replace corrupt canonical source with cache take ownership of an ambiguous duplicate workspace.
- Diagnostics bundle: RSM-114 diagnostic/recovery bundles may include bounded hashes/manifests/logs and explicitly approved project samples, subject to privacy/redaction.
- Recovery/autosave content is not uploaded automatically.

#### Authority placement: §9.15.6 Maker authoring projection and command-boundary contracts (new under §9, after §9.14)

##### MUI-00 — Authoring Surface Projection / Intent / Command Boundary

- Every authoring surface projects accepted immutable canonical state plus validation, capability, and local editor context into a read-only view model. React presentation emits typed intent to an approved use case or command, which validates revision, permission, capability, and semantics, commits one atomic canonical result, and publishes a new immutable snapshot for UI and Preview reprojection. No authoring surface receives direct document-write authority.
- React state, Zustand, XState context, Golden Layout, DOM values, Babylon objects, inspector nodes, and specialized-editor graph nodes cannot become canonical meaning. After command success the UI reads the accepted result.
- optimistic presentation must reconcile and cannot remain divergent after rejection or normalization.

##### MUI-01 — GameDefinition Composition Surface / Authored-Supported-Effective Provenance

- The GameDefinition creator surface is a composition/orchestration editor, not a giant settings bag.
- It edits only the canonical meaning owned by GameDefinitionDocument, primarily.
- stable references default profile selections start/default slots requested capability intent game-wide composition choices explicitly owned by GameDefinition.
- Subsystem details remain in their owning documents/profiles.
- Required presentation distinction: The surface should visibly distinguish.
- AUTHORED / REQUESTED = editable canonical intent.
- SUPPORTED = read-only Capability Matrix truth.
- EFFECTIVE / RESOLVED = read-only GameConfigurationResolver result.
- PROVENANCE = why the effective value exists / where it came from.
- Example: Camera Profile.
- Authored: FixedCamera_Default [editable reference].
- Supported: Fixed Camera = YES [read-only capability truth].
- Effective: FixedCamera_Default [read-only resolved result].
- Source: GameDefinition.defaultCameraProfileId.
- If a target/runtime setting overrides or rejects that result, the UI explains the provenance.
- No editing resolved values: ResolvedGameConfiguration is not editable settings object.
- A creator who clicks an effective value should be able to.
- Go To Source Reveal Owning Profile Explain Override.
- rather than editing the derived result in place.
- Authority separation visible in UI: GameDefinition UI must not merge these into one generic settings object.
- GameDefinition defaults Project Variables Runtime Settings Player Settings Runtime Save state Target/Build settings Studio/editor preferences Secrets.
- may update GameDefinition plus several referenced profiles/documents, but Apply is one multi-document canonical transaction under existing D-085 authority.
- No half-applied "Game Setup Wizard" graph may publish.

##### MUI-02 — Projection Revision / Selection Generation / Stale UI Result Rejection

- Classic failure.
- select Enemy_A -> Inspector async option lookup starts -> select Enemy_B -> old callback returns -> writes Enemy_A value into Enemy_B field.
- or a delayed text/slider callback submits against a document revision that has already changed.
- Material editor projections and edit intents carry enough identity to prove their authority.
- Representative context.
- ProjectSessionId accepted AuthoringRevisionId ActiveDocumentId SelectionGeneration selected StableId(s) descriptor/field identity projection/request generation where async.
- Exact field names remain editor/application-owned.
- Stale intent rule: At command acceptance, stale.
- authoring revision selection generation target stable identity session identity descriptor/capability context.
- is rejected or revalidated according to the command contract.
- UI callback order never changes the intended target.
- Selection changes: Changing selection invalidates target-bound ephemeral edit sessions/previews unless the operation explicitly captured stable targets for batch work.
- Async option/reference lists: Search/reference picker/autocomplete results bind query generation and relevant authoring/index generation.
- A late result may update a cache, but cannot silently retarget the active field if its owning edit session is obsolete.
- UI key identity: React keys/list rows/tree nodes use stable semantic/editor projection identities where correctness depends on identity.
- Array index is not sufficient for canonical entity/component/reference rows.

##### MUI-03 — Field Edit Session / Draft Candidate / Continuous Edit / Atomic Commit

- text entry numeric typing color editing curve editing slider drag transform gizmo vector field editing reference picker multi-step recipe form.
- Writing every transient keystroke/pointer delta directly into canonical documents can create.
- invalid intermediate canonical state huge undo history validation storms PIE/export races partially edited vectors/structures.
- Controls that require intermediate editing use an explicit editor-only EditSession / candidate model.
- Representative lifecycle.
- BEGIN -> edit local candidate -> preview candidate where allowed -> validate candidate -> COMMIT one canonical command/transaction or -> CANCEL / discard candidate.
- Draft authority: Draft/candidate values are editor-local.
- draft value is not canonical project state.
- They may drive a bounded Preview projection, but Preview is disposable and must restore canonical projection on cancel.
- Simple immediate controls: A checkbox or bounded select may still submit immediately when every intermediate state is valid and the command semantics are atomic.
- The contract does not require all controls to use explicit Apply buttons.
- Continuous edit: Slider/gizmo/drag operations may provide interactive Preview while grouping the final accepted canonical edit into one history transaction where appropriate.
- Normalization: If canonical validation normalizes/clamps a value.
- UI candidate -> command -> accepted normalized value.
- the UI reconciles to the accepted result and displays relevant diagnostic/provenance.
- It cannot keep showing a rejected uncommitted value as if saved.

##### MUI-04 — Multi-Selection / Batch / Multi-Document Transaction Semantics

- edit several selected entities assign profile to many enemies change multiple atmosphere volumes apply recipe to several objects move hierarchy selections update GameDefinition + referenced profiles.
- A UI loop that submits N unrelated commands can stop after item 7 of 20 and leave a surprising partial state.
- The authoring surface must classify batch operations.
- Representative classes.
- ATOMIC_BATCH EXPLICIT_PARTIAL_BATCH SEQUENTIAL_USER_OPERATIONS.
- Atomic batch: Where creator intent is one semantic action.
- Apply Profile to Selected Enemies.
- the command/transaction validates the complete candidate set before commit.
- Failure leaves all canonical targets unchanged unless the product explicitly presents a partial operation.
- Explicit partial batch: If partial success is a deliberate feature, the UI must show.
- which targets succeeded which failed why what history boundary was created.
- and must never present partial success as one complete operation.
- Multi-document composition: GameDefinition recipes, Prefab rebase, asset remap and other composition operations retain their existing atomic multi-document rules.
- Mixed values: Inspector multi-selection may show.
- MIXED.
- as presentation state.
- MIXED is not a canonical value and is never serialized.
- Target capture: A batch operation captures stable target IDs.
- Later selection changes do not silently change which objects the pending operation targets.

##### MUI-05 — Capability / Validation / Availability Descriptor / Execution-Time Revalidation

- The inverse is also important.
- button enabled at time T is not permission still valid at click/commit time T+1.
- because capability, selection, project revision, lock state or job/session state may change.
- Creator actions expose a bounded availability descriptor derived from real authorities.
- Representative fields.
- action/command identity VISIBLE / HIDDEN ENABLED / DISABLED reason/diagnostic identity required capability required selection/document context confirmation/destructive class task-lock state.
- Exact UI naming may differ.
- UI availability is advisory projection: The command/use-case revalidates at execution/commit time.
- disabled/enabled UI state is not security or semantic authorization boundary.
- Unsupported feature explanation: For supported Maker UX, unavailable features should normally provide a clear reason where useful.
- Not available for current Game Profile Missing required CameraProfile Section is read-only during this operation Export capability not admitted PIE must stop before this edit.
- rather than silently doing nothing.
- Validation source: Inspector, Problems, Guided readiness, Play gate, Export gate and Project Doctor reuse centralized diagnostic/validation truth.
- A specialized editor may add local presentation hints, but cannot downgrade a canonical blocker into success.
- TOCTOU: Long-running Fix/Apply/import/reference operations bind the accepted authoring generation and are revalidated before publication under RSM-27/SYS generation rules.

##### MUI-06 — Preview / PIE Control Plane / Snapshot Pinning / Explicit Hot-Edit Policy

- PIE control is explicit.
- START PIE -> validate Play capability -> capture accepted immutable authoring snapshot -> resolve GameDefinition -> create RuntimeGameSession -> pin PIE SourceSnapshotId / ResolvedConfigurationFingerprint -> run.
- Ordinary authoring after PIE starts belongs to the authoring session and does not silently change the running RuntimeGameSession.
- Default policy: Baseline.
- Authoring edits during PIE is not automatic runtime hot patch.
- The UI may show.
- PIE running from older snapshot Authoring revision has changed Restart PIE to apply.
- Explicit hot-edit: A later subsystem may support a narrowly declared safe live-update path only when it defines.
- supported mutable fields runtime owner validation generation rollback/failure save implication Preview/PIE parity.
- No generic React->Babylon "live edit everything" path is authorized.
- PIE controls: Play/Pause/Resume/Step/Stop/Restart requests go through the RuntimeSession/application control boundary.
- Toolbar buttons do not hold the RuntimeGameSession object as mutation authority.
- Stop: Stopping PIE.
- tears down runtime generation rejects stale callbacks releases runtime locks/input restores editor Preview restores editor selection/focus as policy allows.
- without writing arbitrary runtime mutations back into canonical documents.
- Start/Stop race: Repeated Play/Stop/Restart clicks resolve single-flight through the workflow authority.
- Two runtime sessions cannot accidentally become active for one editor play surface unless a future explicit multi-session feature is separately designed.

##### MUI-07 — Runtime Inspector / Debug Actions / No Reverse Write-Back

- PIE/debug UI may inspect runtime state, but runtime observation and canonical authoring remain visually and semantically distinct.
- Representative runtime inspection may show.
- RuntimeSessionGeneration entity runtime identity + authored provenance current health/state AI state camera owner Section generation save eligibility Sequence/media state Event/Action trace RNG provenance.
- Read-only baseline: Runtime Inspector is read-only by default.
- Reading.
- Enemy runtime health = 42.
- does not change authored EnemyProfile health defaults.
- Debug actions: If approved debug actions exist.
- Teleport debug player Force Event for testing Pause AI Set runtime trace filter.
- they use typed runtime debug intents owned by RuntimeGameSession/debug tooling.
- They do not become canonical authoring commands unless a separate explicit "Copy Runtime Value to Authoring" feature is designed.
- No reverse write-back: runtime object changed is not authoring document changed.
- PIE stop discards debug mutations.
- Copy-to-authoring: A future copy/apply action must.
- identify stable authored target construct normal canonical candidate validate capability/reference/revision commit a normal authoring command.
- It cannot serialize arbitrary runtime object graphs back into project data.
- Production separation: Runtime debug/Inspector authoring controls remain editor/dev-only and are excluded from the standalone player according to export closure.

##### MUI-08 — Specialized Editor / Workshop / Designer Shared Authoring Contract

- Fixed Camera Composer Dialogue Editor Objective / Task Editor Inventory & Puzzle Workshop Patrol / Perception Editor Enemy / Encounter Editor Player UI Designer Player Experience Designer Sequencer Story & Objective Spine Progress & Save Director Level / Blockout tools Prefab / Variant workflows.
- Without a shared contract, each can invent a private persistence format or runtime meaning.
- Every specialized editor is an authoring lens over existing canonical semantic owners.
- It must declare.
- canonical documents/profiles read canonical commands/transactions emitted derived/editor-local projection state Preview/PIE behavior validation/capability dependencies save/export participation of the authored feature.
- No private runtime format: Examples.
- Story Spine node is not second story-state graph.
- Inventory Workshop slot row is not private inventory schema.
- Enemy Editor state node is not private AI runtime enum.
- Player Experience Designer screen tile is not second player UI runtime model.
- Level flow visualization is not second Scene/Section graph.
- Sequencer track widget is not sequence runtime authority.
- Reuse common descriptors: Where semantics match, specialized editors reuse.
- stable reference picker component/profile descriptors validation findings capability/availability descriptors command metadata diagnostic navigation.
- rather than hardcoding private type-name branches.
- Specialized convenience is allowed: A workshop may present more useful domain-specific UX than the generic Inspector.
- That does not require generic Inspector and specialized editor to share the same visual layout.
- they share the same semantic command/validation authorities.
- One surface cannot maintain a hidden unsynchronized canonical copy.

##### MUI-09 — Cross-Panel Selection / Reveal / Navigation / Reference Context

- Selection and navigation are editor context, not project meaning.
- One editor selection service/model should provide stable selection context consumed by.
- Hierarchy Viewport Inspector Problems Content Browser Reference Browser specialized editors diagnostic actions.
- Stable selection: Selection identifies canonical/derived stable IDs plus context, not Babylon object pointers or DOM row identity.
- Babylon picking emits a RetroStage pick intent that resolves to selection through the existing adapter/application boundary.
- Reveal / Go To: Diagnostic and reference navigation uses typed destinations.
- GoTo document/entity/component/field Reveal asset Open owning profile Reveal Scene/Section Reveal Sequence marker Explain effective configuration source.
- A navigation action changes editor context only.
- Go To is not canonical mutation.
- unless an explicit command-backed Fix is invoked.
- Missing target: If the referenced object was deleted/migrated before navigation executes, the action fails diagnostically rather than selecting a coincidentally similar row/index/name.
- Selection restoration: PIE stop, modal close, workspace switch and reload may restore selection only if the stable target still exists in the accepted current revision.
- Stale selection is cleared/diagnosed rather than resurrected from a transient renderer handle.

##### MUI-10 — Command History / Gesture Grouping / Undo-Redo / External-Change Interaction

- Undo/redo remains command-authoritative under RSM-31/D-039.
- Maker UI adds explicit gesture/history grouping rules.
- Examples: One creator gesture may form one history entry.
- gizmo drag slider drag batch assign profile recipe Apply Prefab rebase transaction GameDefinition composition Apply multi-field dialog Apply.
- Repeated internal preview updates do not each become a durable undo item unless product semantics require it.
- History identity: History references accepted command/transaction identity and canonical revisions.
- It does not store UI component snapshots as canonical inverse state.
- Failed/cancelled edits: A cancelled draft/edit session creates no canonical history entry.
- A rejected command creates no "successful edit" history entry.
- External reload/conflict: When external-file review/reload changes the accepted authoring lineage, command history follows the RSM-32 explicit policy.
- The UI cannot blindly replay old inverse operations against a new unrelated revision.
- PIE: Runtime debug actions do not enter canonical authoring history.
- Ordinary authoring commands submitted while PIE is active enter authoring history but still do not hot-patch PIE unless MUI-06 explicitly supports that operation.

##### MUI-11 — Async Editor Query / Preview / Job Generation / Cancellation / Resource Ownership

- asset search reference search thumbnail Look Lab material/atmosphere preview navigation preview import inspection media metadata Project Doctor cook/export content index large tree filtering.
- A late result must not publish into a reused panel/selection.
- Every material async UI request captures.
- request identity owner surface/session identity selection/document context where relevant accepted authoring/index generation resource budget/lease cancellation/supersession policy.
- Publication: Result publication requires the owner/context generation still to be valid.
- A result may be cached under its own provenance, but cannot mutate active UI/canonical/Preview state merely because it completed.
- Supersession: New query/selection/preview requests can supersede prior work.
- Superseded work becomes inert and releases temporary.
- Babylon resources blob/object URLs workers media handles temporary files memory.
- through owning adapters.
- Busy/task locks: The UI obtains task-lock/readiness state from the RSM-27 job/workflow authority.
- A disabled button alone is not concurrency protection.
- Bounded UI: Search/reference/result lists may virtualize for scale, but virtualization state does not change result identity/order semantics.

##### MUI-12 — UI Local Persistence / Focus / Modal / Accessibility / Failure Isolation

- Editor-local persistence: These remain editor/application preference state.
- dock/tab layout panel visibility filters column sizes recent editor navigation local viewport preferences workspace mode/lens local theme/Studio preferences.
- They do not mark the project dirty unless a specific value is intentionally canonical by another owner.
- Corruption isolation: Corrupt local layout/panel/Studio state must fall back to safe defaults without preventing.
- open project edit save PIE export.
- The existing SICE failure-isolation direction remains binding.
- Focus/modal/input: RSM-34 input context stack owns.
- text entry modal drag gizmo viewport navigation PIE input player UI input.
- A shortcut cannot simultaneously activate editor and PIE/gameplay authority.
- Modal close/error/cancel restores the correct previous focus/input context, not a cached stale one.
- Accessibility: Creator-facing authoring surfaces require.
- keyboard operation visible focus semantic labels screen-reader-accessible control names where practical reduced-motion respect non-color-only error/capability communication scalable readable text accessible drag/drop alternatives.
- according to RSM-9/SICE/product accessibility policy.
- Destructive actions: Delete, overwrite, detach, destructive Prefab update, migration/reset and similar operations use clear confirmation/risk policy appropriate to reversibility.
- A visual confirmation dialog is not authority.
- the underlying command still validates current revision/target/permission at execution.
- Failure isolation: One broken specialized editor/panel should fail within an editor error boundary/degraded surface where feasible and must not corrupt canonical state.
- A panel crash must not take durable command/storage authority with it.

#### Authority placement: §9.15.6 Plugin/SDK authority, isolation and portability contracts (new under §9, after §9.14)

##### PLG-00 — Extension Taxonomy / Authority Classes / No Content-Pack Confusion

- Extension authority is partitioned into DECLARATIVE_CONTENT_PACK, SANDBOXED_EDITOR_EXTENSION, PRIVILEGED_LOCAL_EXTENSION, COOK_TIME_EXTENSION, PLAYER_RUNTIME_EXTENSION, and AGENT / MCP INTEGRATION. Declarative content never grants code execution. Sandboxed editor execution is the preferred third-party class. Node, native, or process-capable code is a separate high-trust local class and is never project-auto-enabled or treated as a public-marketplace baseline. Cook-time code runs only through audited processors and does not automatically ship to players. Player-runtime extensions are DEFAULT DENY until lifecycle, save, security, export, redistribution, SDK, and clean-machine proofs exist. Agent integrations cannot bypass these rules.

##### PLG-01 — Plugin Package Identity / Manifest / Install Transaction / Supply Chain

- A package has stable identity.
- PluginId PublisherId / publisher namespace where used PluginVersion PluginSdkCompatibilityRange HostCompatibilityRange PackageArtifactHash.
- Display name is not identity.
- PluginPackageManifest is parsed before any plugin code executes and may declare.
- identity/version SDK/host compatibility entrypoints by execution class activation events contributions required/optional permissions project-data schema registrations plugin dependencies export disposition native/WASM/executable payload inventory license/notices/dependency inventory resource inventory/hashes.
- Manifest parsing cannot execute lifecycle code.
- Plugin install consumes a prebuilt artifact. Baseline installation does not run.
- npm install pnpm install postinstall prepare node-gyp arbitrary shell/download scripts.
- Third-party JS dependencies for a sandboxed plugin are bundled/vendor-contained in the plugin artifact.
- Install is transactional.
- select artifact -> quarantine/stage -> parse manifest -> path/inventory/hash/compatibility/permission/native/license validation -> user trust review -> immutable version-directory install -> atomic InstalledPluginRecord update.
- Failure preserves the previous version.
- Archive/package paths reject traversal, absolute paths, symlink/junction escape, normalized duplicates, case/Unicode collisions and unsafe target names.
- A future package signature may add trust evidence, but signature/hash never implies permission or workspace trust.
- Baseline installation does not run.

##### PLG-02 — Project Requirement / Local Installation / Enablement / Workspace Trust Separation

- The product separates.
- plugin installed locally plugin enabled locally project requires/optionally references plugin current project/session trusts and grants activation/permissions.
- Canonical project requirements may record.
- PluginId required/optional class compatible version range required extension capability/type identities plugin-owned validated project configuration.
- Opening a project cannot auto-download, install, update, enable or grant permissions to executable plugins.
- Executable activation is gated by project/workspace trust.
- An untrusted project can still open, inspect core data, preserve unknown/plugin-owned data and show diagnostics without activating executable project-triggered plugin code.
- Plugin-owned project configuration is untrusted data. A config field named toolPath, url, command, outputPath or similar does not itself grant file/network/process authority.

##### PLG-03 — Execution Host / Isolation Class / Permission-Enforcement Boundary

- Permissions are meaningful only if the plugin cannot bypass the permission broker.
- Default sandboxed executable plugins therefore do not run with raw Node/Electron/fs/process authority.
- Preferred architecture uses an implementation-owned isolated worker/sandboxed renderer-style host with.
- Node integration off Electron APIs unavailable direct filesystem unavailable direct process execution unavailable direct canonical objects unavailable network unavailable unless brokered/admitted typed structured-message SDK bridge only.
- Where feasible, each executable third-party plugin receives an individually terminable isolation unit so a hang/leak/exception can disable one plugin without taking down the editor or other extensions.
- An Electron utilityProcess/Node child is useful for crash/process separation but is Node-enabled.
- therefore.
- separate process is not secure permission sandbox.
- when arbitrary plugin code can import Node APIs.
- Node-capable execution belongs to privileged/processor classes.
- node:vm is explicitly not accepted as the untrusted-plugin security boundary.
- node:vm context is not security sandbox.
- Sandboxed plugin code cannot import Electron, Node built-ins, private RetroStage packages, editor React internals or application service instances.

##### PLG-04 — Public SDK / API Version / Capability Negotiation / Private-Package Barrier

- Plugins code against one intentionally public versioned Plugin SDK surface. A conceptual future @retrostage/plugin-sdk package may exist only if Source03 package-creation rules justify it.
- The SDK may expose granted subsets of.
- extension context typed commands read-only document projections plugin-owned schema/type registration diagnostics UI contribution descriptors asset/job requests reference/query services plugin-local storage permission-brokered services.
- Plugins may not import private RetroStage application/document/component-registry/Electron/Babylon/ React/database internals.
- Activation validates.
- PluginSdkCompatibilityRange host SDK version contribution schema versions required capability versions.
- Unknown required API/capability meaning fails closed.
- SDK compatibility/deprecation/support windows are explicit and separate from the application display version.
- Capability availability never implies permission grant.

##### PLG-05 — Activation Lifecycle / Lazy Start / Budgets / Crash / Safe Mode

- Plugins activate lazily on admitted events such as.
- onCommand:<id> onView:<id> onProjectCapability:<id> onAssetType:<id> onValidatorRequested onCookProcessorRequested onStartupFinished where justified.
- Universal startup activation is discouraged.
- Representative lifecycle.
- DISCOVERED -> INSTALLED -> ENABLED -> ACTIVATING -> ACTIVE -> DEACTIVATING -> INACTIVE.
- or -> FAILED -> QUARANTINED / DISABLED.
- Contribution registration is transactional: activation failure rolls back partial commands, panels, validators and type registrations.
- The host bounds/observes activation time, CPU/event work, message size/rate, memory, callback queues, diagnostic spam, jobs and processor output according to execution class.
- A hung plugin can be terminated and diagnosed without corrupting canonical state.
- Repeated activation crashes must support Safe Mode/restricted startup with third-party executable plugins disabled or the suspect plugin quarantined. The user can disable/uninstall/rollback without successfully re-activating it.

##### PLG-06 — Permission Tokens / Filesystem / Network / Process / Secret Brokers

- Sensitive capability is default-deny.
- Representative permission families may include.
- project.read project.command.invoke:<scope> project.extension-data:<namespace> asset.read:<scope> asset.process:<scope> workspace.read:<contained-scope> workspace.write-derived:<contained-scope> network.request:<policy> clipboard.read / clipboard.write external-url.open secret.get:<plugin-keyspace> process.execute:<privileged-class only> runtime.hook:<explicit class only> export.contribute:<explicit class only>.
- Exact names remain RSM-117-owned.
- No permission exposes raw canonical-file writes.
- canonical changes use typed commands/transactions.
- Sandboxed file access uses semantic handles/brokered byte streams. Plugin-local storage has a contained plugin-specific root/quota.
- Network is denied by default. If later admitted, requests are brokered with scheme/domain policy, timeouts/size limits and no ambient browser-session/cookie authority by default.
- Arbitrary child-process/shell execution is not a normal sandboxed permission. Privileged execution requires workspace trust, binary identity/inventory, argument-array invocation, bounded cwd/env, timeout/cancellation and diagnostics.
- Secrets never live in canonical project documents. A future secret service exposes only the requesting plugin's approved namespace and cannot enumerate unrelated store/signing/editor secrets.
- A plugin update requesting new sensitive permissions requires renewed review.

##### PLG-07 — Canonical Extension Data / Namespaces / Missing-Plugin Preservation / Migration

- Plugin-owned persisted meaning uses namespaced stable envelopes such as.
- ownerPluginId extensionTypeId schemaVersion stable extension identity typed data required/optional runtime meaning.
- A plugin cannot patch core schemas in place, reuse core type IDs or claim another plugin namespace.
- If the plugin is missing/disabled.
- structurally safe unknown extension data -> PRESERVE.
- Optional/editor-only meaning may degrade gracefully. Required PIE/gameplay/save/export meaning fails closed with a clear missing-extension diagnostic.
- Plugin-owned migrations are transactional and recoverable.
- old namespaced data -> migration candidate -> validate -> atomic canonical commit.
- A migration may directly change only its owned namespace. Cross-document changes must go through normal public commands.
- Project open does not need to execute plugin code merely to preserve safe envelopes. Executable migration waits until the plugin is installed/enabled/trusted and the migration is accepted.

##### PLG-08 — Contribution Registry / Namespaced IDs / Conflict / No Override Escape Hatch

- Every contribution has collision-safe namespaced identity.
- Duplicate contribution IDs fail deterministically.
- discovery/load order never means "last plugin wins".
- Plugins extend only declared extension points and cannot replace/suppress by default.
- GameConfigurationResolver core validation/Project Doctor blockers core serializer/migration authority Runtime Save authority Scene/Section authority component-registry implementation command dispatcher security/permission service export compiler.
- Plugin validators may add plugin-owned findings but cannot downgrade/suppress core blockers.
- Plugin commands are namespaced registrations whose canonical mutation ultimately passes through approved public commands/use cases.
- Where multiple providers are supported, ordering/composition policy is explicit rather than filesystem/plugin-discovery order.

##### PLG-09 — Plugin UI Contributions / Declarative Surfaces / Isolated Custom Panels

- Default plugin UI contribution is host-rendered declarative metadata.
- commands menus toolbar/context actions Inspector descriptors Problems/diagnostic actions simple forms/settings tree/list projections status/progress surfaces.
- through MUI contracts.
- A plugin does not import host React internals, mount arbitrary nodes into the main editor root, patch Zustand/XState, monkey-patch host DOM/prototypes or access Electron preload APIs.
- If custom executable plugin UI is later admitted, it uses a separately isolated sandboxed panel with Node off, context isolation, restrictive CSP, no arbitrary navigation/windows, local contained resources, a narrow typed bridge and panel-specific lifecycle.
- The panel receives projections and submits typed intents.
- it never receives mutable canonical objects.
- Remote web content is not baseline plugin UI.
- Hosted plugin UI uses RetroStage theme/focus/accessibility contracts.
- custom panels may not spoof core security/permission prompts.

##### PLG-10 — Validators / Asset Processors / Jobs / Deterministic Output Provenance

- Plugin expensive work follows RSM-27 and the worker mutation barrier.
- immutable accepted input -> plugin validator/processor job -> candidate result -> host validation -> application-owned publication/commit.
- Asset processors receive brokered input and host-owned temporary output. They do not directly overwrite canonical assets, source files, cook cache or final export.
- Derived outputs record provenance including.
- PluginId PluginVersion processor/contribution identity input semantic/hash identity settings/schema identity target profile where material output hash native/WASM/external-tool identity where applicable.
- If output participates in deterministic cook/export, the plugin must prove the required determinism/fallback policy or be ineligible for that profile.
- Validators remain read-only. Fix actions are separate typed commands.
- External executables remain privileged processor territory with explicit binary/provenance/security review.

##### PLG-11 — Runtime Hook / Save / Player-Extension / Export Disposition

- Executable capabilities declare.
- EDITOR_ONLY COOK_TIME_ONLY PLAYER_RUNTIME_REQUIRED.
- Editor-only code is excluded from player artifacts.
- its authored results must cook into ordinary RetroStage semantics.
- Cook-time code executes only through the plugin job host.
- validated outputs may ship, plugin code does not automatically ship.
- PLAYER_RUNTIME_REQUIRED requires separate admission of a player-safe SDK subset, runtime lifecycle/generation, save participation, security, performance, packaging, redistribution/license and clean-machine evidence.
- The standalone player never scans editor/user/project plugin folders for arbitrary executable code.
- Any admitted runtime extension is exact-manifest/build pinned under EXP-05/06.
- Runtime hooks remain typed extension points over existing RuntimeGameSession/Event-Action/Save/ Scene/Audio/UI/Input/RNG/export authorities.
- Plugin runtime state participates only through the approved save registry with namespaced schemas, stable IDs, eligibility, migration and restore ordering. Raw plugin objects/worker handles are not save truth.
- If plugin code/binaries ship with a creator game, export verifies package/version/hash, redistribution rights, notices, native/WASM inventory, dependency closure and SBOM contribution.
- Local editor-plugin licensing never automatically grants creator-game redistribution rights.
- Plugin runtime state participates only through the approved save registry with namespaced schemas, stable IDs, eligibility, migration and restore ordering.

##### PLG-12 — Plugin Dependencies / Update / Rollback / Uninstall / Compatibility

- If plugin-to-plugin dependencies are admitted, they are manifest-declared, deterministic and acyclic.
- Baseline prefers one active version per PluginId in one editor/project resolution, with explicit required/optional dependencies.
- Bundled npm dependencies remain inside the plugin artifact.
- plugins cannot reach into RetroStage's host node_modules.
- Update is transactional.
- stage new immutable version -> validate -> review compatibility/new permissions/native payloads -> optionally migrate after approval -> switch active version.
- Previous known-good version remains available until safe cleanup.
- Executable plugin auto-update is not baseline.
- Uninstall removes local binaries/registration state but never silently deletes canonical plugin data.
- Plugin package compatibility, SDK compatibility and project-data compatibility remain separate.

##### PLG-13 — Diagnostics / Audit / Provenance / Privacy / Compliance

- Plugin Manager should expose.
- PluginId / version / publisher identity where known artifact hash installed/enabled state project required/optional state trust state granted/denied permissions execution class activation state SDK compatibility native/WASM/executable declarations export disposition last failure/crash owned schemas/capabilities.
- without exposing secret values.
- Material actions can carry provenance for command proposals, migrations, processor outputs, export contributions and privileged broker calls.
- Plugins receive only data exposed by granted APIs.
- filesystem metadata, environment, credentials, other logs and user identity are not ambient.
- Plugin logs are namespaced, bounded, rate-limited and secret-redacted.
- Installed third-party plugin license/notices remain visible. Shipped runtime plugin code contributes required export notices/SBOM/native-WASM inventory.
- Repeated crash/corruption/security failure may quarantine/disable a plugin without deleting project data.

##### PLG-14 — Project Portability / Restricted Mode / Recovery / Required-vs-Optional Semantics

- Projects remain structurally openable when executable plugins are missing/disabled whenever unknown extension data is safe.
- The editor can enter restricted/degraded mode.
- Extension requirements classify meaning, for example.
- OPTIONAL_EDITOR_AID OPTIONAL_AUTHORING_FEATURE REQUIRED_FOR_EDIT REQUIRED_FOR_PIE REQUIRED_FOR_EXPORT REQUIRED_FOR_PLAYER_RUNTIME.
- Missing plugins block only operations whose required meaning is unavailable.
- Executable plugin binaries embedded in a portable project are never auto-executed. If embedding is later supported, they are quarantined install candidates requiring explicit local install/trust/ permission review.
- Safe Mode can open with third-party executable plugins disabled, preserve extension data, show required-plugin diagnostics and allow disable/uninstall/rollback/backups.
- Recovery must not require re-running the same broken plugin that caused activation/migration/update failure.
- Portable-project evidence may record PluginId/version range/capability identities/artifact hash/ license provenance but never permission grants, secrets or implicit execution authority.
- Executable plugin binaries embedded in a portable project are never auto-executed.
- If embedding is later supported, they are quarantined install candidates requiring explicit local install/trust/ permission review.

##### PLG-15 — Plugin Identity Continuity / Exact Resolution / Permission-Grant Binding

- RetroStage distinguishes.
- DeclaredPublisherId VerifiedPublisherIdentity where cryptographically/registry proven PluginId PluginVersion PackageArtifactHash PluginTrustLineageId / equivalent local trust lineage.
- A displayed publisher string is not represented as verified unless the selected distribution model actually proves that identity.
- Identity continuity: A package claiming the same PluginId is treated as a legitimate update only when the accepted trust/update policy proves continuity.
- Until a signing/registry PKI exists, replacing a local unsigned artifact with another artifact under the same PluginId requires explicit user review and cannot silently inherit all sensitive trust.
- Reserved RetroStage/core namespaces and product/security-looking publisher identities cannot be claimed by ordinary third-party packages.
- Active resolution snapshot: Project requirements may use compatibility ranges, but one active editor/PIE/cook/export operation uses an exact derived resolution.
- PluginResolutionSnapshotId PluginId exact PluginVersion PackageArtifactHash trust-lineage identity execution class Plugin SDK version resolved dependency identities/versions/hashes granted capability-set identity.
- Project vs local authority: ProjectExtensionRequirement = canonical requested compatibility/meaning.
- Reproducibility: PIE, plugin migrations, plugin processors, cook and export capture the exact relevant PluginResolutionSnapshot.
- An update that changes.
- trust lineage publisher verification state execution class native/WASM/executable posture permission semantics.
- requires re-review even when the textual permission list appears unchanged.
- An impostor package claiming an old PluginId cannot automatically read the previous plugin's secret values.

##### PLG-16 — Broker RPC / Opaque Capability Handle / Revocation / Backpressure

- old capability handles survive disable stale responses publish after project switch plugin forges another plugin's handle RPC queues grow without bound plugin callback re-enters host synchronously.
- Every brokered request carries host-validated provenance.
- PluginRuntimeSessionId PluginRuntimeGeneration PluginResolutionSnapshotId PluginId ProjectSessionId / WorkspaceTrustGeneration where relevant RequestId operation identity.
- The plugin cannot self-declare these fields as authority.
- the host associates them with the transport/runtime endpoint.
- Opaque capability handles: Filesystem, asset, secret, job, query and other sensitive broker objects use host-minted opaque handles/tokens.
- A handle is bound to.
- owning PluginRuntimeGeneration project/session scope capability/permission scope resource identity lifetime.
- and is not accepted from another plugin/session/generation.
- Message contract: Plugin broker RPC inherits the Source03 IPC discipline.
- stable operation identity TypeBox-owned schema Ajv validation explicit request/response/error contracts dangerous-key rejection bounded bytes / counts / strings / nesting timeout/cancellation no arbitrary method invocation.
- Asynchronous trust boundary: Sandbox plugin->host RPC is asynchronous.
- The host must not synchronously block its Main/UI authority waiting for arbitrary plugin code, and plugin code cannot synchronously re-enter host mutation while a host callback is mid-commit.
- Backpressure: Per-plugin channels have bounded.
- and apply backpressure/drop/coalescing only according to explicit event semantics.
- A plugin cannot create unbounded synchronous or immediate feedback loops around RSM Event/Action or authoring command budgets.

##### PLG-17 — Web Sandbox Origin / Network Egress / Storage / Markup Isolation

- Critical browser-sandbox problem: A renderer/WebWorker without Node is safer, but ordinary web APIs can still provide.
- fetch WebSocket EventSource sendBeacon remote image/font/media loads WebRTC/device APIs service workers localStorage / IndexedDB BroadcastChannel.
- If these remain ambient, "network denied unless brokered" or "plugin-local storage quota" is not actually enforced.
- Any executable custom plugin panel/web-style sandbox uses a dedicated non-privileged plugin origin and isolated Electron session/partition policy.
- Where practical, sandboxed plugin runtimes use isolated in-memory storage sessions by default.
- CSP / egress baseline: The plugin web sandbox uses a restrictive CSP/session policy equivalent in intent to.
- default-src 'none' script-src approved immutable plugin origin only connect-src 'none' frame-src 'none' object-src 'none' base-uri 'none' form-action 'none'.
- with narrowly admitted img-src, font-src, media-src, style-src rules only for contained plugin resources needed by the UI.
- No unsafe-eval/remote script baseline is authorized for sandboxed plugins.
- Ambient network denial: Direct.
- cannot become an alternate network permission path.
- Approved network access uses PLG-06/18 host brokers.
- camera microphone screen/display capture geolocation clipboard read USB/HID/serial file-system web APIs notifications window management.
- Plugin A cannot inspect Plugin B through.
- They must not persist executable behavior after a panel/plugin is disabled.
- HTML scriptable SVG CSS injection javascript:/data: executable URLs event-handler attributes.
- External links use the approved external-URL broker.
- Custom panel identity: Custom panels cannot imitate/replace host-owned.
- and security-sensitive prompts render only in trusted RetroStage-owned UI.

##### PLG-18 — Filesystem + Network Broker TOCTOU / SSRF / Redirect Containment

- Filesystem TOCTOU: A path that was safe during validation can become unsafe before use through.
- symlink junction reparse point path replacement rename.
- Sandboxed plugins receive opaque brokered resource handles rather than durable raw filesystem paths whenever possible.
- The privileged broker performs operation-time containment.
- For sensitive filesystem access it should, where platform APIs permit.
- resolve approved root validate normalized target reject symlink/junction/reparse escapes open/use a validated handle avoid unsafe validate-path-then-reopen-by-string gaps.
- Writes: Plugin writable operations are limited to explicit owned/derived roots.
- Canonical project changes remain command-owned.
- Brokered file writes use.
- temporary owned candidate bounded bytes flush/close as required revalidate ownership/target atomic replace/promotion where appropriate.
- rather than arbitrary overwrite.
- Delete: Deletion proves target ownership/containment at execution time and never follows a plugin-provided link into unrelated storage.
- Network SSRF boundary: A granted network permission does not automatically mean "any URL on this computer/network".
- The broker validates.
- scheme declared/approved domain policy resolved address class redirect target timeout response/body size request headers method.
- file: javascript: data: custom privileged app protocols localhost / loopback link-local private/internal address ranges metadata-service style endpoints arbitrary Unix/named-pipe/local IPC targets.
- and revalidates redirects/DNS resolution sufficiently to prevent simple allowlist->private-network bypass.
- External URL opening: Opening a browser URL is a separate user-visible/brokered action and is not equivalent to network fetch permission.

##### PLG-19 — Package Bounds / Immutable Code Graph / Remote-Code Prohibition

- Package parser limits: Plugin package validation is bounded before activation.
- Representative limits include.
- compressed package bytes total decompressed bytes decompression ratio file count per-file bytes manifest bytes manifest nesting/count/string limits path length source-map/debug artifact size where admitted native/WASM count/size.
- A zip/decompression bomb or pathological manifest fails in quarantine/staging.
- Immutable installed code: Installed plugin version directories are immutable/read-only from the plugin runtime's point of view.
- Plugin-local writable storage cannot become a code/module search path.
- Accepted code graph: Sandboxed executable code is loaded only from.
- manifest-declared entrypoints validated package inventory accepted package artifact hash.
- and code/resource imports remain inside that immutable package root plus the public SDK surface.
- Remote/self-modifying code: A sandboxed plugin cannot use.
- network response plugin-local writable file project file data:/blob: code URL arbitrary dynamic import target remote script tag.
- as a new executable module to bypass package review/identity.
- Remote downloaded text cannot be converted into executable code through a host-provided evaluator.
- WebAssembly: If sandboxed WASM is later admitted.
- WASM module identity/hash imports memory/thread policy capability bridge.
- WASM does not receive ambient filesystem/network/process capability.
- imported host functions remain the permission boundary.
- Dynamically downloaded WASM is not executable baseline.
- Native code: Native binaries cannot execute inside the default sandboxed-extension trust class.
- Native execution moves the extension to a separately admitted privileged/processor/runtime class with Source06 inventory/security review.

##### PLG-20 — Cross-Plugin Service / Dependency / Confused-Deputy Prevention

- Plugins have no direct arbitrary transport/channel to another plugin runtime.
- Cross-plugin cooperation uses host-mediated namespaced typed service/command extension points.
- Dependency meaning: A package dependency grants.
- resolution/activation dependency API/service compatibility expectation.
- not.
- filesystem permission network permission secret permission canonical mutation permission.
- Caller identity: Host-mediated service calls preserve.
- original caller PluginId/runtime generation callee identity project/session causal request identity delegated capability identity where explicitly allowed.
- The callee cannot mistake an unprivileged plugin caller for the user/core host.
- Confused-deputy rule: A plugin service may perform privileged work on behalf of another plugin only when the extension point explicitly allows delegation and the host permission model validates that delegated action.
- A callee's ambient permissions are not automatically lent to callers.
- No shared secret/storage reach-through: Plugin A cannot read Plugin B's.
- secret namespace plugin-local storage opaque capability handles private contribution state.
- through dependency declarations.
- Activation order: Resolved plugin dependency graph determines deterministic activation prerequisites.
- Service calls to an inactive/failed/missing dependency fail diagnostically rather than implicitly installing/enabling it or bypassing trust.
- Cycles: Package/dependency cycles remain rejected by default.
- Service-level callbacks/re-entry are additionally subject to PLG-16 causal/backpressure rules.
- Provenance: Cross-plugin canonical commands, jobs and export contributions retain the originating plugin causal chain for diagnostics/audit.

##### PLG-21 — Plugin Update / Data Migration / Rollback Coupled Transaction

- Critical update/recovery problem: Binary rollback alone is insufficient after project extension data has been migrated.
- Example.
- Plugin 1.0 -> update Plugin 2.0 migrates project schema 1 -> 2 -> 2.0 activation fails "rollback to 1.0".
- If 1.0 cannot read schema 2, the project is still stranded.
- Plugin package switch and plugin-owned project-data migration are treated as one coordinated compatibility operation when migration is required.
- Pre-migration recovery point: Before destructive/nontrivial plugin migration.
- project backup / recovery snapshot exact old PluginResolutionSnapshot old plugin version/artifact identity old extension schema versions migration plan identity.
- are established according to RSM-116 recovery policy.
- Staged update: Representative flow.
- Exact physical ordering remains implementation-owned but cannot expose a half-new-plugin/ half-old-data accepted state.
- Failure: If migration or new-plugin activation fails before final acceptance.
- old plugin resolution + old project data/recovery state.
- remain/restored together.
- Rollback after committed migration: After a committed migration, "rollback plugin version" is allowed only when.
- old plugin explicitly supports new schema or a reviewed reverse migration exists or the project recovery snapshot is restored together with the old plugin resolution.
- Binary-only rollback is rejected when it would strand project data.
- Uninstall: Uninstall still preserves plugin-owned project data.
- If the project requires the plugin, relevant operations become restricted rather than destructive auto-migration.
- In-flight work: Plugin update/disable/migration first invalidates/quiesces the old PluginRuntimeGeneration so old jobs/RPC responses cannot publish after the new resolution/data version becomes active.
- install new immutable plugin version -> resolve compatibility/dependencies/permissions -> quiesce old plugin generation -> capture pre-migration project recovery point -> run migration against candidate/transactional project state -> validate canonical project + plugin-owned schemas -> activate/test new plugin against migrated candidate where architecture permits -> commit project migration + switch active PluginResolutionSnapshot.

#### Authority placement: §9.15.6 Workbench/panel/workspace composition contracts (new under §9, after §9.14)

##### WBX-00 — Workbench Shell / Authority / Non-Canonical Boundary

- The RetroStage Workbench is the shared editor shell that composes creator-facing surfaces.
- It owns surface composition and navigation infrastructure, not game/project meaning.
- Workbench owns: - which registered creator surfaces exist - where a surface may be hosted - surface open/close/reveal/focus orchestration - workspace layout/preset application - shared navigation/selection routing - shared chrome, status and contextual shell actions - shell-level failure isolation.
- Workbench does not own: - Scene / Entity / Item / Objective / Puzzle / Dialogue / Sequence meaning - validation truth - command semantics - undo/redo truth - runtime/PIE truth - save/export eligibility - asset identity.
- Authority chain: Every Workbench-hosted edit follows the existing MUI boundary.
- canonical snapshot -> ViewProjection / descriptor -> Workbench-hosted surface -> typed creator intent -> application command/use case -> validation + atomic canonical commit -> new snapshot.
- The Workbench never receives a general mutable-document API.
- Local-state rule: Workbench shell state is editor-local unless another already-canonical owner explicitly says otherwise.
- Representative local state.
- open panel instances active tab dock graph split sizes panel visibility focused surface recent reveal/navigation history per-surface presentation preference workspace preset selection.
- Changing these must not.
- dirty project content create undo/redo entries change PIE/runtime meaning change Save eligibility change Cook/Export output.
- Golden Layout boundary: Golden Layout = docking/tab/resize/geometry adapter.
- MUI/application layer = command/projection authority.
- Golden Layout component identity, config node identity or serialized layout object is never canonical project identity.
- RetroStage Workbench = surface registry + composition policy.
- canonical domain owner = game meaning.

##### WBX-01 — Panel Registry / Stable Surface Identity / Descriptor Contract

- All Workbench-hosted creator surfaces register through one RetroStage-owned descriptor/registry model.
- Stable identity: A registered surface has a stable semantic PanelDefinitionId or equivalent.
- Representative identity separation.
- PanelDefinitionId != PanelInstanceId != DocumentId / AssetId / SceneId != Golden Layout component id != React component instance != DOM node.
- PanelDefinitionId is stable product/plugin surface identity.
- PanelInstanceId is editor-local instance identity.
- A document-oriented editor references its canonical document/asset identity separately.
- Descriptor: A descriptor may contain.
- Exact field names remain implementation-owned.
- Surface kinds: The registry must distinguish at least the semantic roles required to prevent one generic concept from becoming overloaded.
- Representative categories.
- TOOL_PANEL -> Hierarchy / Inspector / Problems / Content Browser / Jobs.
- DOCUMENT_SURFACE -> Dialogue / Objective / Sequence / Material or asset-specific editor.
- WORKFLOW_SURFACE -> Guided setup / Project Doctor / bounded multi-step creator workflow.
- PREVIEW_SURFACE -> Viewport / specialized read-only or interactive derived Preview.
- Additional kinds may be admitted later without changing canonical project identity.
- Registration invariants: No two active contributions may claim the same stable core surface identity.
- Display title is not identity.
- Renaming a panel title does not create a new panel.
- Golden Layout names/indexes are adapters, not identity.
- commands remain separately validated.
- A panel may be hidden/unavailable because of capability state without deleting its stable definition.
- Missing or unknown extension panels must not corrupt the rest of the workspace layout.
- PanelDefinitionId surface kind localized title key icon/token reference core or extension origin multiplicity policy allowed host region/surface reveal/open command identity selection/reveal capabilities workspace-mode relevance creator-stage relevance capability requirements default disclosure affordance persistence schema version accessibility label/role metadata.
- Registration invariants: No two active contributions may claim the same stable core surface identity. - Display title is not identity. - Renaming a panel title does not create a new panel. - Golden Layout names/indexes are adapters, not identity. - Registry discovery does not imply command capability.
- commands remain separately validated. - A panel may be hidden/unavailable because of capability state without deleting its stable definition. - Missing or unknown extension panels must not corrupt the rest of the workspace layout.

##### WBX-02 — Workspace Mode / Creator Stage / Disclosure Tier / Layout Orthogonality

- RetroStage has four independent editor-organization dimensions.
- 1. Workspace Mode Classic / Guided / future Custom.
- 2. Creator Stage Project / Template / Story / Blockout / Gameplay / Atmosphere / Test / Export.
- 3. Disclosure Tier Creator / Advanced / Diagnostics-Expert.
- 4. Layout Geometry dock/tab/resize/open/hidden/focus state.
- Required non-aliasing: Guided != Basic Classic != Advanced Custom != Expert.
- Gameplay Stage != gameplay project state Export Stage != build authorization Diagnostics Tier != debug workspace mode layout preset != workspace mode.
- Any supported combination may exist when the underlying feature supports it.
- Examples.
- Guided + Gameplay + Advanced + compact layout Classic + Story + Creator + dual-monitor local layout Custom + Atmosphere + Diagnostics + creator-defined layout.
- Mode behavior: Workspace Mode may.
- curate visible/recommended surfaces adjust default layout preset change contextual guidance density surface relevant commands change onboarding/step presentation.
- It may not.
- convert project documents change runtime semantics create hidden canonical fields use private mutation commands change validator truth change exported-game meaning.
- Stage behavior: Creator Stage may prioritize and recommend relevant surfaces, checks and help.
- A Stage change must not silently overwrite a creator's current local layout.
- If a stage-specific layout is available, behavior is one of.
- suggest layout apply by explicit command apply because the creator explicitly enabled an editor-local auto-layout preference.
- and the previous layout remains recoverable.
- Disclosure behavior: Disclosure tier is per-surface/feature presentation policy under CUX.
- Changing disclosure tier does not switch Workspace Mode or Creator Stage and does not alter canonical data.

##### WBX-03 — Workspace Layout Profile / Version / Migration / Reset / Recovery Contract

- Workspace layout persistence is versioned editor-local data.
- Identity separation: WorkspaceLayoutProfileId != ProjectId != SceneId != PanelDefinitionId != panel instance identity != canonical project document.
- A local layout may be associated with a stable project identity for convenience, but the project must remain openable and complete without that local record.
- Layout payload: A persisted layout may contain only supported local presentation/composition state such as.
- layout schema version workspace-mode/stage association where applicable registered PanelDefinitionId references panel instance descriptors permitted by multiplicity policy dock/split/tab graph dimensions visibility active tab/focus hints bounded panel-local presentation state.
- It must not serialize.
- mutable canonical documents raw React state trees Babylon scene/resource objects Node/Electron handles open filesystem handles command history as project truth runtime/PIE object graphs.
- updating a built-in preset must not silently rewrite the creator's saved layout.
- Migration: Layout schema and stable panel identities have explicit migration/fallback behavior.
- A migration may.
- rename a known PanelDefinitionId through an explicit alias/migration drop unsupported local-only geometry replace a removed panel with a non-blocking placeholder/report normalize invalid dimensions.
- It must not guess an unrelated panel identity by title or array position.
- Corruption/failure: Corrupt or incompatible layout state must degrade to.
- and must not prevent project admission.
- Reset: Reset Workspace Layout affects editor-local workbench state only.
- It must not.
- dirty canonical project clear canonical undo/redo stop/change PIE semantics change runtime save state change exported output delete creator assets.
- safe built-in layout + recoverable diagnostic + optional reset/migration action.

##### WBX-04 — Panel Lifecycle / Multiplicity / Document Context / Draft Safety Contract

- A panel definition declares a bounded lifecycle/multiplicity policy.
- Representative policies may include.
- SINGLETON_PER_WORKSPACE SINGLETON_PER_DOCUMENT MULTI_INSTANCE TRANSIENT.
- Exact enum names remain implementation-owned.
- Instance identity: Opening a panel creates or resolves a local PanelInstanceId.
- A document-oriented surface separately binds.
- PanelInstanceId + canonical DocumentId / AssetId / SceneId / other stable semantic identity + projection revision.
- No panel instance identity is persisted into canonical game data.
- Open/close semantics: Open, close, pin, move, dock, undock and focus are local Workbench operations.
- Closing a panel does not mean.
- delete document revert canonical edits commit a draft stop runtime owner.
- Draft/edit sessions: If a surface has an uncommitted MUI-03 edit session, closing/navigating the panel follows that existing draft policy.
- commit through typed command discard local draft cancel close/navigation.
- A panel may not create a private dirty-state system that conflicts with canonical project dirty state.
- Document removal/replacement: If the bound document/asset is deleted, replaced, reimported or becomes unavailable.
- panel receives new projection / tombstone / unavailable state -> local stale result rejected -> creator gets contextual repair/reveal/close action.
- The panel must not continue mutating a stale object reference.
- Detached/floating host rule: Detached/pop-out/multi-window hosting is not a baseline requirement.
- If admitted later, it remains the same Workbench/MUI authority in another approved host and cannot become a second Electron/Node mutation channel.

##### WBX-05 — Global Navigation / Reveal / Selection / Command / Focus Integration

- Workbench navigation composes existing MUI-09 selection/reveal and application command authority.
- Shared semantic navigation: Cross-surface navigation uses stable semantic targets.
- GoTo(semantic target) Reveal(reference target) Open(surface descriptor + document context) Focus(surface instance) ShowReferences(stable identity) OpenProblem(diagnostic identity).
- Exact APIs remain implementation-owned.
- Targets are not raw React refs, DOM nodes or Golden Layout nodes.
- Selection: Workbench may maintain editor-local selection context/projection state.
- Selection itself is not canonical project meaning.
- When a selection affects game/project data, the resulting edit still requires a typed command.
- Reveal behavior: Problems, Project Doctor, global search/reference browser, Inspector links and specialized editors must be able to reveal the owning semantic surface without each inventing a private navigation protocol.
- Unknown/unavailable target handling must be explicit.
- TARGET_REMOVED SURFACE_UNAVAILABLE CAPABILITY_DISABLED REFERENCE_BROKEN EXTENSION_MISSING.
- with safe fallback.
- Command surfaces: Menus, toolbar actions, command palette, context menus, keyboard shortcuts and panel buttons resolve to the same registered command/use-case authority.
- A panel cannot implement a shadow mutation merely because it has a custom toolbar.
- Focus/input: Workbench participates in the existing editor input-context/focus model.
- focus moves are explicit and keyboard reachable.
- text entry/modal/PIE contexts prevent shortcut leakage.
- opening/revealing a panel does not send unintended gameplay input.
- focus restoration after modal/panel close is deterministic enough for accessibility and testing.

##### WBX-06 — Specialized Editor Hosting / Shared Shell / No Private Mini-App Contract

- Every specialized RetroStage editor is hosted by the shared Workbench contract even when its internal canvas, timeline, graph or workflow is highly specialized.
- Examples include.
- Dialogue Editor Objective / Task Editor Inventory & Puzzle Workshop Story & Objective Spine Map / Floorplan authoring Patrol / Perception Editor Enemy / Encounter Editor Player UI Designer Sequencer Animation / locomotion tools Import / Reimport review Progress & Save Director.
- Shared host services: A specialized editor consumes shared services/contracts for the capabilities it needs.
- projection / selection / reveal typed command dispatch validation / Problems undo-redo authority Jobs/progress/cancellation capability availability/reasons focus/input context local layout/presentation preferences accessibility semantics help/contextual repair.
- Prohibited private shell: A specialized editor must not create an independent mini-application with its own.
- canonical state store command history validation truth project dirty flag workspace persistence format modal/focus router filesystem authority Electron IPC mutation channel layout engine as project truth.
- Its internal graph/timeline/canvas representation remains a projection over the owning canonical semantics.
- Local internal composition: A specialized editor may have internal panes or split views when useful.
- Internal pane identity never becomes canonical gameplay/document identity.
- Common grammar, not forced identical layout: Shared hosting does not require every editor to look identical.
- same command semantics same validation truth same navigation/reveal grammar same accessibility baseline same design-token vocabulary same failure/loading-state rules.
- A timeline, node canvas and item workshop may use different interaction patterns while preserving.

##### WBX-07 — Classic / Guided / Custom Semantic Parity Contract

- Workspace modes are different authoring lenses over one capability and command model.
- Parity invariant: For a capability available in more than one supported mode.
- same canonical input + same validated creator intent -> same canonical semantic result.
- Mode-specific UI composition may differ.
- Guided: Guided mode may provide.
- recommended sequence contextual explanation readiness checks curated panel set safe defaults repair shortcuts completion summary.
- Guided mode must use the same commands, validation, capability truth and documents as Classic.
- It cannot create hidden "guided-only" canonical state.
- Classic: Classic mode may expose more direct simultaneous tools and less workflow narration.
- It cannot bypass validation or expose raw-engine authority merely because it targets experienced creators.
- Custom: Custom mode may allow creator-controlled local panel/workspace composition over registered surfaces.
- It is not.
- custom project schema custom runtime arbitrary Electron UI injection unrestricted plugin DOM authority.
- Switching: Mode switching must preserve.
- project bytes/meaning unsaved canonical edits command history active project identity PIE/runtime semantics unless an existing explicit rule requires otherwise.
- Local panel/layout state may change only through explicit mode/preset policy and remains recoverable.

##### WBX-08 — Panel Async Work / Failure Isolation / Performance / Resource Ownership Contract

- The Workbench must scale to many specialized surfaces without making all panels permanently live.
- Async generation: Panel-owned asynchronous queries/previews follow existing MUI-11/JOB-01 generation/cancellation rules.
- A result is applied only if its.
- panel instance document/selection context projection generation capability/lifetime token.
- is still current.
- Inactive/hidden surfaces: A hidden/background panel must not retain expensive work merely because its tab exists.
- As appropriate it should.
- pause/cancel background queries release Preview-only Babylon resources unsubscribe high-frequency observers reduce polling retain only bounded local presentation state.
- Canonical domain services remain owned by their domain, not by panel mount state.
- Virtualization/budgets: Large Hierarchy, Content Browser, Problems, reference, log and list surfaces use bounded querying, pagination/virtualization or equivalent strategies.
- A panel must not eagerly materialize the entire project graph into React state as a normal architecture.
- Failure isolation: A creator-facing surface failure should degrade at the smallest practical boundary.
- panel error boundary -> creator-readable error -> Retry / Reload Surface / Reset Local State / Open Problems.
- The failure of one non-critical panel must not corrupt canonical project data or require closing the project.
- Startup: Corrupt optional panel state, missing extension panels, Gallery/Studio state, or one specialized-editor failure must not poison Safe Startup/project admission.
- Core shell recovery has a supported built-in fallback.

##### WBX-09 — Plugin / Extension Panel Contribution / Host Identity / Security Boundary

- If a later admitted plugin contributes editor UI, it does so through a bounded Workbench contribution contract.
- Freeze7 does not itself authorize a plugin UI API or new dependency.
- Namespaced identity: An extension contribution uses a collision-resistant namespaced stable identity such as.
- plugin:<PluginId>:panel:<LocalPanelId>.
- or implementation-equivalent.
- It cannot claim/replace a core RetroStage PanelDefinitionId.
- Host boundary: An extension panel receives only approved host capabilities.
- It does not automatically receive.
- Node filesystem access Electron Main APIs arbitrary preload bridge access canonical mutable document references raw command-bus bypass Babylon private object ownership secrets/tokens unscoped network access.
- Any such capability remains separately brokered/admitted under existing plugin/security authority.
- Semantic mutation: Extension UI invokes approved plugin/application commands and registered semantic contribution points.
- A plugin panel is not an exemption from.
- validation permission/capability checks undo/redo policy project trust save/export disposition.
- Missing/uninstalled extension: Layouts referencing an unavailable extension panel degrade safely.
- non-blocking missing-surface placeholder or omission + diagnostic/reinstall guidance where applicable.
- They do not make the project or entire workspace unopenable.
- Product identity: Extension panels must not impersonate protected core security/trust/diagnostic surfaces.
- Host chrome/origin indication may be shown where needed for trust and diagnostics.

##### WBX-10 — Design Tokens / Visual Grammar / State Vocabulary / Accessibility Consistency Contract

- RetroStage owns the visual and interaction grammar of the editor.
- Third-party UI infrastructure supplies mechanics, not product identity.
- Product-owned grammar: The shared editor design system owns at minimum the reusable semantics needed for.
- typography hierarchy spacing/density scale surface elevation/borders panel/tab chrome focus treatment selection disabled/unavailable states warning/error/success/info states destructive-action treatment primary/secondary/context actions progress/job states empty/loading/error/recovery states tooltips/help affordances keyboard hints.
- Exact visual values remain design-system implementation data.
- Golden Layout styling: Golden Layout's default visual language is not the RetroStage product design.
- Dock/tab mechanics are wrapped/styled through RetroStage-owned tokens/components where supported.
- State vocabulary: Creator surfaces should share a consistent state grammar.
- Representative bounded states.
- READY EMPTY LOADING STALE UNAVAILABLE BLOCKED WARNING ERROR RECOVERABLE_FAILURE.
- Domain-specific semantic states remain owned by their domains.
- Workbench state labels must not overwrite or blur domain truth.
- Consistency without monotony: Specialized editors may have distinct high-level compositions appropriate to their tasks, but common actions should not arbitrarily change meaning.
- Examples.
- keyboard reachability visible focus semantic names/roles screen-reader meaningful labels where supported contrast requirements non-color-only status communication reduced-motion preference text scaling/layout resilience non-pointer-only essential actions.
- Acceptance asks.
- Is it registered with stable surface identity?
- How does CUX disclosure apply?
- WBX-00..10 admit no new production or development dependency by themselves.
- Accessibility: Workbench and every registered core surface inherit.
- A specialized editor may add accessible alternatives for canvas/timeline interactions.
- it may not declare itself exempt merely because the interaction is visual.
- Closure rule: A new creator-facing surface is not Workbench-complete merely because it renders.
- Does it use shared projection/command authority?
- What is its multiplicity/document context?
- How is it revealed/navigated?
- How does it behave in Classic/Guided/Custom?
- How does Stage relevance work without becoming a gate?
- What layout state is local?
- Can its failure be isolated?
- What happens when its persisted state is stale/corrupt?
- What happens when its async work is stale/cancelled?
- What are its empty/loading/error/recovery states?
- Does it preserve focus/accessibility?
- Does it use RetroStage visual grammar rather than third-party defaults?

#### Authority placement: §9.15.7 Collision semantic/profile adapter contracts (new under §9, after §9.14)

##### PHY-00 — Early Collision Semantic Profile / Channel / Query Boundary

- The first RSM-17 playable collision slice already uses RetroStage-owned semantic collision/query identities. Gameplay code may not learn raw Havok masks, layer bits, body identity or callback object structure.
- Minimum early seam supports implementation-equivalent semantic roles for.
- world/blocker collision protagonist body/grounding interaction query trigger observation.
- and reserves extensibility toward RSM-28 roles such as perception/navigation/audio without assigning backend bits as public meaning.
- Required abstractions include implementation-equivalent concepts for.
- CollisionProfileId / role QueryIntent Trigger/Contact normalized occurrence RetroStage entity/runtime identity.
- The adapter alone maps these semantics to backend filter/layer/mask mechanics.

##### PHY-02 — Collision / Trigger Backend Mapping / Diagnostics / Parity Contract

- Physics mapping and callback normalization are one reviewed adapter responsibility.
- 1. RetroStage semantic collision profiles compile deterministically to backend filter/mask state. 2. Backend contact/trigger callbacks are normalized into stable RetroStage runtime entity IDs, occurrence identity, phase/order and semantic role before gameplay observes them. 3. Physics work obeys the approved runtime fixed-step/update-phase contract rather than render-frame timing. 4. Stale callbacks after entity/session teardown fail closed through runtime generation/lifetime checks. 5. Debug visualization is derived presentation, never physics/gameplay truth. 6. Validation detects undefined profiles, impossible filter relationships and raw-backend leakage in public gameplay APIs. 7. Permanent fixtures prove equivalent approved collision/query meaning in headless tests where possible, PIE and standalone/cooked player.

#### Authority placement: §9.15.7 Exported Player Settings durability contracts (new under §9, after §9.14)

##### PST-00 — Exported Player Settings Durable Authority / Non-Aliasing Contract

- One conceptual Player Settings authority owns user-local preferences such as supported.
- input binding overrides mouse/controller sensitivity invert preferences display preferences audio preferences subtitle/UI scale/accessibility preferences language.
- as later owners admit them.
- Non-aliasing: Player Settings is not canonical project is not RuntimeSettingsDocument creator defaults is not Project Variables is not Runtime Save is not save-slot progress is not editor/Studio state is not platform transient device state.
- Changing a player preference does not dirty the authoring project or rewrite gameplay save.
- EXP-10 writable-user-data and stable exported-game namespace rules remain controlling.

##### PST-01 — Player Settings Schema / Migration / Atomic Write / Corruption / Multi-Instance Contract

- Durable envelope: The Player Settings store is versioned and has ordered migrations.
- Writes use crash-safe/atomic-replace semantics appropriate to the admitted platform.
- Failure: Corrupt or incompatible settings cannot prevent the exported game from reaching a safe usable frontend when built-in defaults are available.
- Representative recovery.
- parse/migration failure -> preserve/quarantine failed payload for diagnostics where appropriate -> load safe supported defaults / last-known-good -> surface bounded recovery notice.
- Writer policy: There is one accepted durable-writer policy.
- If multiple exported-game processes are possible, they cannot concurrently race an uncoordinated settings file. The product must either.
- coordinate/lock writes or make secondary instances read-only for settings or use another explicitly reviewed deterministic policy.
- Silent last-writer corruption is not an architecture.
- Settings writes do not share Runtime Save transaction identity.

##### PST-02 — Player Override Resolution / Compatibility / Reset / Recovery Contract

- Four truths: Player-facing settings distinguish as applicable.
- REQUESTED SUPPORTED EFFECTIVE PERSISTED.
- RUI-08 remains the apply/revert UI transaction owner for disruptive settings.
- Input override resolution: For input.
- creator default map revision + stable action/binding identities + stored player overrides + current target/device support -> effective player input map.
- A compatible game update should preserve valid player choices.
- An override referencing removed/unsupported meaning is diagnosed and safely ignored/migrated without making menus unusable.
- Reset: Reset may be.
- Reset Controls Reset Accessibility Reset Display Reset All Player Settings.
- or accepted bounded equivalents.
- Selective reset cannot accidentally erase Runtime Save or canonical project data.
- Recovery invariant: A broken preference must always have a route back to a usable built-in configuration when the target itself is supported.

#### Authority placement: §9.15.7 Hierarchy and namespace non-aliasing contracts (new under §9, after §9.14)

##### HRY-00 — Authored Hierarchy / Parent / Order / Cycle Authority

- The authored Scene hierarchy is one canonical relationship model owned by documents/commands/validation.
- Required distinctions.
- EntityId ParentEntityId Sibling/order identity Hierarchy UI row Renderer parent node.
- are not interchangeable.
- 1. Parent changes are canonical commands, never drag/drop widget mutation. 2. Cycles are rejected before commit. 3. Cross-Scene and cross-Section parent relations follow explicit lifetime rules.
- an independently unloadable child cannot silently depend on an independently unloadable parent. 4. Child ordering is deterministic and stable across save/reopen/undo/redo. 5. Renderer parenting is a projection of canonical hierarchy, not authority. 6. Unknown/missing parent references fail safely and surface repair/navigation diagnostics. 7. Hierarchy validation composes with Scene/Section ownership and LVL lifetime contracts rather than inventing a second residency/activation model.

##### HRY-01 — Reparent KEEP_WORLD / KEEP_LOCAL / Exact Representability Contract

- Every reparent operation explicitly chooses semantic intent.
- KEEP_LOCAL -> local transform remains canonical.
- world transform changes through new parent.
- KEEP_WORLD -> world transform should remain materially identical.
- new local transform is derived.
- 1. UI drag/drop cannot infer a hidden reparent mode that differs by panel/workspace. 2. KEEP_WORLD computes the candidate local transform against the accepted canonical spatial convention. 3. If the result is not exactly representable by the canonical transform model (for example a shear-producing parent combination under a TRS-only model), the command does not silently approximate. 4. Unsupported KEEP_WORLD resolves as a structured rejection or a separately explicit bake/repair operation. 5. Parent non-invertibility/singular scale blocks KEEP_WORLD with actionable diagnostics. 6. Reparent across illegal Scene/Section lifetime boundaries is rejected before transform mutation. 7. Undo restores parent, sibling order and the exact prior canonical transform meaning.

##### HRY-02 — Delete / Detach / Duplicate / Undo-Redo Hierarchy Semantics

- Hierarchy-destructive operations are explicit transactions rather than filesystem/tree-widget behavior.
- Required operation classes include implementation-equivalent semantics for.
- DELETE_SUBTREE DELETE_PARENT_AND_DETACH_CHILDREN DETACH_FROM_PARENT DUPLICATE_SUBTREE MOVE/REPARENT.
- 1. No ambiguous Delete silently chooses between deleting descendants and orphaning them. 2. Destructive previews identify affected authored entities, references, Scene/Section lifetime consequences and specialized owner bindings where relevant. 3. Duplicate creates fresh stable identities and a deterministic internal reference remap.
- it does not alias the source subtree's component/entity identities. 4. Undo/redo is command-authoritative and restores hierarchy/order/transform/reference semantics coherently. 5. Runtime-spawned entities cannot be promoted into authored hierarchy by a hierarchy UI gesture without a separately authorized authoring operation.

##### HRY-03 — Authored Parent / Runtime Attachment / Equipment / Physics / Section Ownership Non-Aliasing

- These relations remain distinct even when they produce similar visual transforms.
- AuthoredParentId RuntimeAttachment / base-motion relation EquipmentBinding / semantic socket PhysicsJoint / constraint Scene/Section authored home Runtime Section ownership/residency.
- Examples.
- A weapon attached to HAND_R is not required to become a canonical child of an imported bone. - A protagonist standing on a moving platform does not become a persistent authored child of the platform. - A physics joint does not become an authored hierarchy edge merely because bodies move together. - Section transfer/residency does not silently rewrite authored parent identity.
- Adapters/projectors may derive transform relationships, but save/reconstruction uses the semantic owner for each relation and never persists backend parent/body/socket handles as canonical identity.

##### HRY-04 — Layer / Tag / Collision / Navigation / Audio Namespace Separation

- The term layer or tag may not become a universal untyped cross-domain keyspace.
- At minimum these concepts are non-aliased.
- EditorLayerId / authoring organization Renderer visibility/render group CollisionProfileId / CollisionChannelId Gameplay semantic label/tag identity NavigationAreaId / traversal classification Audio category/bus/surface semantics Section/Scene identity.
- 1. A string such as Enemy cannot implicitly mean renderer layer + collision channel + AI tag + Objective query. 2. Cross-domain relationships require typed mappings/queries owned by the relevant semantic authority. 3. Renaming a Creator-facing layer/tag label preserves stable identity where that concept supports persistence. 4. Editor visibility/isolation layers do not alter collision/gameplay by default. 5. Collision masks remain physics-adapter implementation details beneath RetroStage collision semantics. 6. Problems/diagnostics detect ambiguous or deleted typed identities without falling back to raw strings.

#### Authority placement: §9.15.7 Input action/context/binding and platform-adapter contracts (new under §9, after §9.14)

##### INP-01 — InputAction / ActionMap / Binding Stable Identity Contract

- Stable authored identities: Representative semantic entities.
- InputActionMapId InputActionId InputContextId BindingSlotId InputPresetId where presets are used.
- are stable RetroStage identities.
- They are not.
- keyboard scan/event object Gamepad.index Gamepad.id Gamepad button/axis array position DOM node Babylon input object UI row index localized display label.
- Action definition: An input action declares bounded semantic metadata such as.
- stable identity localization-ready display name value type: DIGITAL AXIS_1D AXIS_2D required / optional classification allowed contexts player-rebind policy prompt/glyph participation accessibility-alternative policy where applicable.
- Exact enum names may differ.
- Boundary: InputAction means player intent vocabulary, not gameplay consequence.
- INTERACT action active is not item transferred is not door opened is not puzzle solved.
- The owning gameplay system still validates and commits the consequence.

##### INP-02 — Input Context / Scope / Priority / Capture / Restoration Contract

- Required separation: RetroStage input contexts are explicit scoped runtime ownership rather than incidental if/else checks.
- Representative contexts may include.
- GAMEPLAY RUNTIME_UI PAUSE_MENU INVENTORY DIALOGUE SEQUENCE MEDIA REBIND_CAPTURE TEXT_ENTRY.
- These names are illustrative.
- the contract is the authority/lifecycle model.
- Context activation: A context instance has.
- context identity owner/scope identity priority/order accepted actions consumption policy capture policy lifetime/generation restore behavior.
- Critical invariants: One physical input cannot silently commit both UI and gameplay consequences in one transition. - A closed/stale context cannot reclaim capture. - Context restoration revalidates the previous owner rather than restoring a dead object. - Input lock is scoped contribution, not one hidden global boolean. - Rebind capture is a dedicated temporary context and cannot leak a captured press into gameplay. - Focus/device/camera changes reuse RUI-03, GPC-16 and SYS-12 rather than inventing private capture paths.

##### INP-03 — Creator Defaults / Device Presets / Player Override Resolution Contract

- Authority layers: Creator-authored InputActionMap + project/game-profile default bindings + supported device-family preset + Player Settings binding override + runtime capability/device availability -> ResolvedInputMapGeneration.
- ResolvedInputMapGeneration is derived runtime/player-settings evidence, not canonical project truth.
- Creator defaults: RetroStage may ship bounded starting presets aligned with supported game profiles, for example.
- Modern Fixed-Camera Classic Tank TPS Horror Limited FPS Horror Top-Down / Isometric.
- where useful.
- A preset supplies starting semantic actions and default bindings. It does not own movement speed, camera physics, interaction consequence or animation.
- Player overrides: Player rebinding changes user-local Player Settings only.
- It does not dirty the creator project and does not rewrite the creator's default InputActionMap.

##### INP-04 — Keyboard Physical Binding / Logical Label / Text & IME Separation Contract

- RetroStage distinguishes.
- physical gameplay-key identity is not layout/localized display label is not generated character/text input is not IME/composition state.
- A gameplay binding may use an accepted physical-key abstraction where appropriate so a control can remain position-stable across keyboard layouts.
- The player-facing label is resolved separately from the active keyboard/layout environment where supported.
- Text-entry boundary: Typing into.
- save/profile name settings field search dialogue/name entry where supported.
- uses text/composition input semantics.
- IME/composition text must never be interpreted as gameplay action presses.
- Gameplay rebinding capture must not intercept ordinary text entry unless the explicit Rebind Capture context owns focus.
- Reserved/system keys: Unsupported or OS/browser-reserved combinations are rejected or warned explicitly rather than pretending they are reliable shipped bindings.

##### INP-05 — Mouse / Pointer Absolute-vs-Relative / Capture / DPI Contract

- Distinct pointer semantics: UI absolute pointer position is not gameplay LOOK relative delta is not drag/pointer capture is not pointer-lock state.
- Runtime rules: UI uses the coherent logical-coordinate system owned by RUI/VIS display topology. - Camera LOOK consumes normalized relative pointer intent, not absolute screen position. - Pointer-lock request/failure/loss is an explicit lifecycle transition. - Focus/capture loss releases affected held actions through SYS-12. - DPI/display-scale changes cannot silently multiply or divide look sensitivity. - Mouse wheel is normalized as a declared semantic source rather than relying on incidental DOM delta units. - Pointer buttons may participate in normal binding resolution but do not bypass context ownership.
- If raw/unadjusted mouse input is unavailable on a supported target, fallback is explicit and diagnosable.

##### INP-06 — Gamepad Normalization / Transient Device Identity / Active-Device Arbitration

- Device identity boundary: A connected gamepad's platform/browser index and descriptive id are transient device facts.
- Gamepad.index / raw id is not stable player identity is not InputActionMapId is not Player Settings binding identity.
- Disconnect/reconnect may produce another transient device handle.
- Standard mapping: Recognized standard gamepad layout is normalized behind RetroStage semantic control names.
- Unmapped/raw devices may be.
- supported through an admitted remap/calibration path or declared unsupported/degraded with diagnostics.
- They are never assumed to have Xbox-style indices merely because an array exists.
- Active-device arbitration: Prompt/glyph switching uses meaningful recent activity with bounded hysteresis/noise thresholds.
- Tiny stick drift must not cause.
- keyboard prompt ↔ controller prompt ↔ keyboard prompt.
- flicker.
- Changing active presentation device cannot synthesize semantic CONFIRM/ATTACK/etc.
- First-product single-player input does not imply local-multiplayer controller ownership.

##### INP-07 — Analog Processing / Deadzone / Sensitivity / Response-Curve Single-Owner Contract

- Processing ownership: Analog input processing is explicit and ordered.
- Representative pipeline.
- raw normalized device sample -> device normalization/calibration -> deadzone -> optional inversion -> response curve -> player sensitivity/accessibility override -> semantic action value -> movement/camera owner.
- Critical invariant: Deadzone, sensitivity or response curve must not be silently applied twice by.
- InputProfile + MovementProfile + CameraProfile + Babylon/device backend.
- The owning profile declares whether a value is.
- INPUT_PROCESSOR_OWNED MOVEMENT_INTERPRETATION_OWNED CAMERA_INTERPRETATION_OWNED.
- or accepted equivalent.
- NaN/Infinity/out-of-range analog values are clamped/rejected before gameplay authority.

##### INP-08 — Rebind Capture / Conflict / Essential-Recovery / Override-Migration Contract

- Capture transaction: Rebinding is a bounded transaction.
- begin capture for InputActionId / BindingSlotId -> activate REBIND_CAPTURE context -> neutralize/ignore opening input until released where required -> capture candidate source -> validate support / conflicts / reserved controls / essential recovery -> commit player override or cancel.
- The press that opens the rebind UI cannot accidentally become the new binding.
- Conflict model: Conflicts are evaluated in semantic context.
- The same physical control may legally map to different actions in mutually exclusive contexts, while same-context destructive ambiguity is diagnosed.
- Essential recovery: The player must retain at least one supported path for.
- CONFIRM CANCEL / BACK PAUSE / MENU RESET CONTROLS / RECOVERY.
- according to the enabled device families.
- Upgrade reconciliation: Player overrides bind through stable action/binding identity.
- If a game update.
- renames a display label reorders actions changes defaults removes an action replaces an action by explicit migration.
- the old override is migrated, retained, quarantined or dropped by explicit policy.
- It is never rebound to a different action because a list index changed.

##### INP-09 — Input Sampling / Edge / Repeat / Fixed-Step / Buffer Determinism Contract

- Normalization: RetroStage converts physical input into semantic samples/edges such as.
- PRESSED HELD / ACTIVE RELEASED analog value.
- at an explicit runtime input/update boundary.
- Required rules: Keyboard auto-repeat does not become repeated gameplay PRESSED unless the semantic action explicitly requests repeat behavior. - Gamepad button/axis polling is sampled coherently for the runtime update. - Fixed-step gameplay can consume a stable semantic input sample without becoming monitor-refresh dependent. - Short taps between fixed steps use the accepted edge/buffer policy rather than disappearing. - GPC-01 owns action buffering/priority after semantic action creation. - Duplicate physical events or simultaneous device sources do not imply duplicate irreversible gameplay commits. - Input timestamps/order are implementation evidence, not save truth.

##### INP-10 — Gameplay / UI / Dialogue / Sequence / Media Input-Leak Prevention

- Cross-domain rule: Consequential input ownership is explicit across.
- Gameplay Runtime UI Dialogue Inventory/Map Sequence Media/FMV Pause Rebind Capture.
- Required transition safety: Representative transitions prove.
- Gameplay -> Pause Pause -> Gameplay Gameplay -> Dialogue Dialogue -> Gameplay Gameplay -> Inventory Inventory -> Gameplay Gameplay -> Sequence Sequence -> Gameplay FMV skip -> Scene continuation.
- without one-frame leakage.
- The same physical button release/press that closes a modal or skips media cannot automatically trigger the gameplay action newly exposed beneath it.
- Owners may use release-gate, neutral-state, generation boundary or equivalent accepted semantics.

##### INP-11 — Device Prompt / Glyph / Action-Origin / Licensing Boundary

- Prompt identity: Runtime prompts request.
- InputActionId + current resolved context/device family -> prompt/action-origin projection.
- They do not hard-code.
- "Press E" "Press A" button index 0.
- as gameplay meaning.
- Glyph resolution: Glyph/image selection is presentation.
- If exact controller/platform art is not licensed/admitted.
- generic semantic label/icon or text fallback.
- must preserve usability.
- A missing glyph must not make an essential action undiscoverable.
- Steam/platform action-origin APIs, if later admitted, remain presentation/platform adapters beneath RetroStage semantic action identity.

##### INP-12 — Haptic / Rumble Semantic Cue / Capability / Lifetime Contract

- Boundary: Gameplay/feedback systems emit a semantic haptic request such as.
- HapticCueId strength/envelope intent duration priority owner/lifetime.
- or accepted equivalent.
- They do not directly own GamepadHapticActuator, Steam Input handles or browser/native actuator objects.
- Capability and fallback: Haptic capability is queried at runtime.
- Unsupported haptics degrade silently in presentation only when haptic feedback is non-critical. Critical gameplay information must always have another supported visual/audio/UI path.
- Lifetime safety: Haptics cancel or re-resolve on.
- device disconnect active-device replacement where relevant focus/session teardown owner cancellation pause policy where applicable death/retry/new session.
- A stale haptic completion cannot reactivate a dead device/session.
- Haptic state is not Runtime Save truth.

##### INP-13 — Creator Input & Controls Workshop / Presets / Progressive Disclosure

- Product direction: Creator-facing input authoring should feel like configuring a game, not editing browser events.
- A bounded Controls / Input & Controls specialized surface should cover.
- Actions Contexts Keyboard / Mouse defaults Gamepad defaults required actions conflicts player-rebind permission prompt preview controller-only validation accessibility alternatives.
- Default view: Normal Creator view may show.
- Move WASD / Left Stick Look Mouse / Right Stick Interact E / South Button Run Shift / Left Stick Press Pause Escape / Menu.
- with game-profile starting presets.
- Advanced: Advanced controls may expose.
- context scope binding slots analog deadzone/curve owner sensitivity/invert defaults conflict policy hold/toggle accessibility allowance device-family support.
- Diagnostics: Diagnostics may expose.
- InputActionId BindingSlotId ResolvedInputMapGeneration active InputContext physical source normalized value processor ownership active device capture/focus state override provenance export support.
- Raw DOM/Gamepad/Babylon objects are not ordinary Creator knowledge.

##### INP-14 — Preview / PIE / Standalone / Export / Platform-Adapter Input Parity

- Same semantic configuration: Creator Preview where interactive PIE minimal standalone player cooked/exported player.
- resolve the same project-owned action/default-binding semantics.
- Editor shortcuts are a different context/authority and cannot leak into exported player behavior.
- Export: Cook/export includes only the supported runtime input semantics, defaults, required prompt/glyph assets and settings schema required by the target.
- The player does not depend on the Maker/editor at runtime.
- Platform adapters: A future platform adapter such as Steam Input may map platform action sets/origins to RetroStage semantic actions.
- It cannot.
- replace InputActionId authority rewrite canonical project bindings make Steam mandatory for store-neutral export create a second gameplay-action model.
- Platform action-set/layer activation follows RetroStage context changes at explicit boundaries rather than becoming a separate every-frame state machine.
- Acceptance: Representative exported tests include.
- keyboard-only mouse + keyboard standard gamepad gamepad disconnect/reconnect device switch focus loss/regain pointer-lock loss rebind + restart controller-only menu navigation clean-machine player.

#### Authority placement: §9.15.7 Project-variable authority and persistence contracts (new under §9, after §9.14)

##### VAR-00 — Project Variable Authority / No Mirrored Semantic Truth

- Project Variables provide bounded creator-defined runtime facts only when no specialized semantic owner already owns that truth.
- Critical invariant.
- specialized owner exists -> query/use that owner -> DO NOT mirror it into a Project Variable.
- Examples of prohibited mirrors.
- playerHasKey -> Inventory query owns item possession objectiveDone -> Objective authority owns objective state puzzleSolved -> Puzzle authority owns puzzle state doorOpened -> Door/Mechanism owner owns door state npcPresent -> NPC/Scene authority owns presence chosenDialogue -> Dialogue/Story authority owns narrative choice.
- Valid Project Variables are creator-defined facts with no existing canonical owner, such as bounded custom counters, scores, experiment values or game-specific state admitted by the project profile.
- 1. Variable display name/key is not stable identity. 2. Variable Definition and runtime value are distinct. 3. A generic variable bag may not become an escape hatch around typed domain contracts. 4. Validation warns/blocks known mirrored-truth patterns where the referenced specialized owner is available. 5. Flow/Conditions/UI/Sequencer consume Project Variables through typed queries/actions, never direct map mutation.
- 1.
- Variable display name/key is not stable identity.
- 2.
- Variable Definition and runtime value are distinct.
- 3.
- Flow/Conditions/UI/Sequencer consume Project Variables through typed queries/actions, never direct map mutation.

##### VAR-01 — Variable Definition / Type / Scope / Lifetime / Default Identity

- Every Project Variable has a stable definition identity and explicit semantics.
- A definition includes implementation-equivalent fields for.
- VariableDefinitionId creator label / description bounded type validated default value scope / owner lifetime save participation new-game/reset policy optional bounds/enum domain where type requires them export/runtime availability.
- 1. Arbitrary unvalidated JSON is not the default Project Variable type system. 2. Renaming/reorganizing a variable preserves stable identity. 3. Changing type/domain/default in a way that affects persisted/runtime state is migration-sensitive. 4. Deleted definitions trigger incoming-reference and save-compatibility diagnostics. 5. Session-, Scene-, Section- or persistence-scoped values have explicit teardown/rehydration semantics. 6. Editor-only/secrets/build-target values are not Project Variables merely because they are key/value shaped.

##### VAR-02 — Typed Mutation / Condition / Transaction / Validation Contract

- Project Variable changes use typed semantic operations, for example implementation-equivalent commands/actions.
- SetVariable Add/IncrementVariable ToggleVariable where type-compatible ResetVariable.
- 1. React/UI/Flow nodes/plugins/scripts may request an operation.
- they do not mutate the underlying value store directly. 2. Type, scope, bounds, owner/session generation and capability are revalidated at commit time. 3. Condition evaluation is read-only and revalidated through the shared condition/query model. 4. Consequential operations participate in the existing Event/Action occurrence/exactly-once semantics where required. 5. Compound gameplay effects involving variables and other owners use a declared transaction/commit boundary rather than partial independent writes. 6. Failed/rejected mutation produces structured diagnostics and no partial value change.

##### VAR-03 — Save / New Game / Reset / Lifetime / Migration Contract

- Project Variable persistence is explicit per definition and composes with Runtime Save rather than creating a second save store.
- 1. Runtime Save captures only variables registered/admitted for that save scope and generation. 2. New Game/profile reset restores definition defaults according to explicit policy.
- editor defaults are not retroactively overwritten by a runtime save. 3. Session-only values do not leak into a new runtime session. 4. Scene/Section-lifetime values teardown/reconstruct according to their declared lifetime and do not survive merely because a UI cache or runtime object still exists. 5. Type/schema changes require explicit migration or compatibility failure.
- old serialized bytes are never reinterpreted under a new type silently. 6. Save-safe capture occurs at the same approved quiescent/runtime boundary as other registered state. 7. Opaque timer/backend/UI handles are never persisted as variable values merely to reconstruct behavior.

##### VAR-04 — Runtime Settings / Player Settings / Story State / Save / Secrets Non-Aliasing

- The following authorities remain distinct.
- GameDefinition defaults Project Variables Runtime Settings Player Settings Story State / narrative facts Runtime Save state Target / Build settings Editor / Studio state Secrets.
- 1. Similar names do not imply shared identity or automatic override precedence. 2. Override/precedence exists only where a specific settings contract defines it. 3. Project Variables cannot shadow security secrets, build configuration, editor preferences or player accessibility settings. 4. Story State remains narrative semantic authority and is not implemented as a renamed generic variable bag. 5. Runtime Settings use the existing typed settings/player-UI/accessibility foundations.
- Project Variables are not a replacement. 6. Runtime Save serializes admitted owner state.
- it is not itself the live variable/settings authority. 7. Creator diagnostics explain the correct owner when a value is authored in the wrong state class.

#### Authority placement: §9.15.7 Spatial transform foundation contracts (new under §9, after §9.14)

##### TRF-02 — Local / World TRS / Matrix / Scale / Representability Contract

- Canonical authored transform meaning is separated from derived world/backend matrices.
- Required model.
- Canonical Local Transform -> hierarchy composition Derived World Transform -> adapters Babylon / Physics / Navigation / other backend representations.
- 1. Canonical persistence does not serialize Babylon matrices/nodes as transform authority. 2. Local and world transform meaning, composition order and parent dependency are explicit. 3. If the canonical authored representation is TRS, arbitrary shear/skew matrices are not silently approximated into TRS during import, reparent, paste, bake or backend round-trip. 4. Matrix decomposition is either exact/within an explicitly approved semantic tolerance or the operation reports NOT_REPRESENTABLE / equivalent structured failure. 5. Zero, negative and non-uniform scale behavior is explicit for rendering, hierarchy, collider generation, animation/root motion, normals/tangents and export.
- unsupported combinations fail closed. 6. World transforms are derived and may be cached with generation/revision evidence.
- they are not a second editable canonical truth. 7. Derived inverse matrices or parent inverses that are singular/non-invertible produce actionable diagnostics.
- no guessed fallback silently moves content.
- 1.
- Canonical persistence does not serialize Babylon matrices/nodes as transform authority.
- 2.
- Local and world transform meaning, composition order and parent dependency are explicit.
- 3.
- If the canonical authored representation is TRS, arbitrary shear/skew matrices are not silently approximated into TRS during import, reparent, paste, bake or backend round-trip.
- 4.
- Matrix decomposition is either exact/within an explicitly approved semantic tolerance or the operation reports NOT_REPRESENTABLE / equivalent structured failure.
- 5.
- Zero, negative and non-uniform scale behavior is explicit for rendering, hierarchy, collider generation, animation/root motion, normals/tangents and export.
- 6.
- 7.

##### TRF-03 — Spatial Adapter / Import / Physics / Navigation / Animation Conversion Boundary

- Every conversion between canonical spatial meaning and an external/domain representation is owned by an explicit adapter or domain conversion contract.
- At minimum the architecture must account for.
- canonical ↔ Babylon renderer/camera/gizmo external glTF/source transform -> canonical import canonical ↔ Havok physics shapes/body poses canonical ↔ Recast/navigation coordinates and agent dimensions canonical ↔ animation/root-motion deltas canonical ↔ camera/controller movement math canonical -> static Map/Floorplan authored projection where used.
- 1. Ad hoc sign flips, axis swaps or unit multipliers inside gameplay/specialized editors are prohibited. 2. Import conversion occurs before imported spatial values become canonical asset/entity meaning. 3. Physics/navigation adapters consume semantic dimensions/poses.
- gameplay never stores backend conversion results as authoring truth. 4. Root-motion deltas cross the existing Movement Authority boundary after canonical spatial conversion.
- animation cannot directly mutate world transforms because its source clip used another coordinate basis. 5. Conversion changes are schema/migration-sensitive and invalidate affected derived/cooked artifacts explicitly. 6. Diagnostics identify source convention, target convention and failed conversion step without exposing backend details as Creator-required knowledge.
- 1.
- Ad hoc sign flips, axis swaps or unit multipliers inside gameplay/specialized editors are prohibited.
- 2.
- Import conversion occurs before imported spatial values become canonical asset/entity meaning.
- 3.
- Physics/navigation adapters consume semantic dimensions/poses.
- gameplay never stores backend conversion results as authoring truth.
- 4.
- Root-motion deltas cross the existing Movement Authority boundary after canonical spatial conversion.
- animation cannot directly mutate world transforms because its source clip used another coordinate basis.
- 5.
- Conversion changes are schema/migration-sensitive and invalidate affected derived/cooked artifacts explicitly.
- 6.
- Diagnostics identify source convention, target convention and failed conversion step without exposing backend details as Creator-required knowledge.

#### Authority placement: §9.15.8 Animation/locomotion semantic authority contracts (new under §9, after §9.14)

##### ANI-01 — Animation Authority Separation

- Animation is primarily a presentation authority.
- It may consume gameplay semantic state and produce typed synchronization/presentation signals.
- It may not silently become.
- movement truth AI truth damage truth health truth navigation truth save truth.
- Correct direction.
- Gameplay / AI / Interaction / Combat -> typed semantic movement/action/reaction state -> Animation State Machine -> clip / blend / layer / one-shot selection -> Babylon playback adapter.
- Forbidden direction.
- AI State CHASE -> directly play raw clip "Run".
- raw animation callback -> directly mutate Health.
- Babylon animation object -> become save/canonical identity.

##### ANI-02 — Stable Animation Semantic Identity

- Gameplay and AI systems should not reference raw animation clip array positions or transient engine animation objects.
- Animation integration should use stable owner-scoped semantic identities or slots.
- Representative semantic families.
- LOCOMOTION.IDLE LOCOMOTION.WALK LOCOMOTION.RUN LOCOMOTION.TURN.
- ACTION.INTERACT ACTION.ATTACK_PRIMARY ACTION.RELOAD.
- REACTION.HIT_LIGHT REACTION.HIT_HEAVY REACTION.STAGGER REACTION.STUN REACTION.DEATH.
- Exact vocabulary may remain profile-owned and bounded.
- AnimationSet maps semantic animation identity to clips/graphs/presentation assets.

##### ANI-03 — Character AnimationSet Contract

- PlayerProfile, NPCProfile and EnemyProfile should reference an AnimationSet or equivalent stable animation-profile authority.
- An AnimationSet may organize bounded semantic groups such as.
- locomotion actions interaction combat reactions death dialogue/gesture special profile-specific presentation.
- Gameplay profiles should reference semantic animation actions where necessary, not raw Babylon playback state.
- For skeletal animation, an AnimationSet should declare or derive compatible CharacterRigProfile / RSM-HUMANOID-V1 requirements. Compatibility must not be inferred only from clip or bone names.
- Attack Profile may request an animation semantic action, while Combat Runtime continues to own attack/damage semantics.

##### ANI-04 — Bounded Locomotion Graph

- RSM-85 should implement a bounded locomotion system rather than an unrestricted general-purpose animation programming environment.
- Required capability direction.
- parameters states transitions interruption blending directional locomotion one-shots typed events.
- Bounded locomotion blending may include where required.
- 1D speed blend 2D direction/velocity blend explicit directional sets.
- without requiring an arbitrary procedural animation graph.
- Animation-facing locomotion inputs should be derived from gameplay truth, including where applicable.
- speed velocity movement direction desired facing grounded vertical motion movement mode idle/moving intent navigation locomotion intent.

##### ANI-05 — Bounded Animation Layers

- RetroStage should support enough layering for horror/action presentation without building an unrestricted animation-layer framework.
- Recommended bounded semantic layers.
- BASE_LOCOMOTION ACTION_REACTION OPTIONAL_ADDITIVE_PRESENTATION.
- BASE_LOCOMOTION owns ordinary locomotion presentation.
- ACTION_REACTION may host bounded full-body or compatible masked actions such as.
- attack reload interaction hit reaction stun death.
- OPTIONAL_ADDITIVE_PRESENTATION is profile-gated and may support bounded aim/look/pose presentation only where justified.
- Bone masks/layer masks, where supported, must be explicit validated assets/definitions.
- Layer ordering and interruption priority must be deterministic.
- This does not authorize arbitrary unbounded layer stacks.

##### ANI-06 — Action / Reaction / Interruption Integration

- Animation must integrate with Player Action Arbiter, AI action intent and Combat Runtime.
- Animation must not independently decide that gameplay action X has been cancelled merely because another clip began.
- Gameplay/action owners decide.
- canStart canContinue interrupt cancel complete.
- Animation reflects the accepted semantic action state.
- Animation may report.
- typed marker reached clip semantic completion transition completion playback inability/failure.
- back to the owning semantic system.
- Representative interruption cases requiring deterministic policy.
- attack interrupted by stun reload interrupted by damage interaction interrupted by sequence authority death overrides non-death action AI attack interrupted by stun/death.

##### ANI-07 — Typed Animation Marker & Event Contract

- Gameplay-critical meaning must not bind to raw frame numbers or transient Babylon callback objects.
- Every gameplay/presentation-relevant marker should have stable typed identity and repeat policy.
- Candidate repeat policies.
- ONCE_PER_PLAY ONCE_PER_LOOP EVERY_VALID_CROSSING PRESENTATION_ONLY.
- Exact naming may be normalized during implementation.
- Marker behavior must define seek/restart/loop semantics.
- Editor Preview must not accidentally perform authoritative gameplay mutations because a marker was scrubbed across.
- Repeated marker occurrence must not automatically imply repeated gameplay effect.

##### ANI-08 — Combat Timing Synchronization

- Attack Profile owns the semantic attack-phase model.
- WINDUP -> ACTIVE -> RECOVERY.
- Animation markers may synchronize phase boundaries through typed requests, but do not directly own damage.
- Permitted direction.
- typed marker -> Combat Runtime synchronization request -> Combat Runtime validates current attack instance/profile/generation -> phase/window transition.
- Representative typed timing signals.
- OPEN_HIT_WINDOW CLOSE_HIT_WINDOW SPAWN_PROJECTILE ATTACK_PHASE_COMMIT.
- The exact names may be profile/contract-owned.
- Missing/duplicate/out-of-order marker behavior must fail predictably or use an explicitly declared fallback policy.
- Combat timing must not depend on renderer frame cadence.

##### ANI-09 — Root-Motion Policy

- Canonical default: IN_PLACE_LOCOMOTION.
- Gameplay movement authority remains with.
- Character Controller Navigation Combat Movement Resolver other explicit gameplay movement owner.
- Bounded root-motion support: Root motion may be supported only through explicit profile/action policy for bounded cases such as.
- short attack lunge bounded finisher-like movement interaction alignment short authored traversal transition.
- Animation root translation must not directly seize world-transform authority.
- Required direction.
- Animation Root Delta -> RootMotionRequest -> Movement / Collision Authority -> Accepted Physical Displacement -> Animation Reconciliation.
- For enemies/NPCs.
- navigation truth > animation root transform.
- RSM-85 requirement: The phrase and contract root-motion policy should be restored as an explicit RSM-85 deliverable.

##### ANI-10 — NPC / Enemy Locomotion Integration

- Enemy AI state and animation state are separate.
- Incorrect.
- AI = CHASE -> play "RunForward".
- Correct.
- AI State / Navigation -> movement/action intent -> Animation-facing semantic parameters -> locomotion/action graph.
- Representative enemy semantic inputs.
- locomotion intent speed movement direction desired facing attack intent/action damage reaction stagger/stun death return/recover.
- NPC profiles may expose.
- idle walk wander/patrol relocate talk/gesture face/look-at presentation.
- without requiring a general behavior-tree or facial-animation system.

##### ANI-11 — Retargeting Limits

- RSM-85 retargeting remains constrained.
- Retargeting should use explicit compatibility/retarget profiles and validation.
- For humanoids, RSM-HUMANOID-V1 semantic joints/chains plus RetargetReferencePose are the preferred compatibility basis. Mixamo/Blender/source-name matching is import assistance only.
- It should detect or reject material incompatibility such as.
- missing required bones invalid mapping unsupported hierarchy difference material scale/orientation mismatch unsupported semantic slot.
- No arbitrary automatic runtime retargeting laboratory is required.
- No advanced facial-animation/lip-sync retargeting is implied.

##### ANI-12 — Import / Reimport Identity Stability

- RSM-84 animation import/reimport should preserve stable clip and animation semantic references.
- Durable identity must not rely solely on.
- source array index transient importer order raw engine object identity.
- Reimport should map clips/bones/semantic slots through stable import identity and explicit validation.
- Creator-approved CharacterRigProfile semantic mappings and semantic socket parents should remain stable across compatible reimport rather than silently remapping after source-name/order drift.
- Missing or incompatible clips/bones must produce creator-readable diagnostics rather than silent substitution.

##### ANI-13 — Save / Restore Animation Semantics

- Runtime Save must not serialize raw Babylon animation/mixer/controller object graphs.
- Default save truth is semantic gameplay state.
- Animation should reconstruct from semantic state after restore.
- Examples.
- enemy state combat action/reaction state if save-eligible interaction state sequence state where explicitly owned presentation mode where explicitly save-approved.
- must determine reconstructed animation presentation.
- RetroStage does not promise arbitrary exact-frame restoration of every transient animation, physics or sequence state.
- If a specific long-lived authored animation state needs save participation, that participation must be explicit and semantic.

##### ANI-14 — Environmental Ambient Motion

- Environmental presentation should include a lightweight deterministic/authorable Ambient Motion capability.
- Candidate bounded motion profiles.
- OSCILLATE ROTATE SWAY PULSE FLICKER CUSTOM_CURVE.
- Candidate controls.
- speed amplitude phase deterministic seed where variation matters target channel.
- Candidate target channels may include bounded.
- presentation transform light parameter material parameter sprite/card/VFX parameter.
- Ambient Motion is intended for low-cost environmental presentation such as.
- fans signs lamps neon small props steam presentation pulsing lights subtle swaying presentation-only mechanical loops.
- It does not authorize.
- general cloth simulation general weather simulation destruction simulation arbitrary physics animation.

##### ANI-15 — Gameplay-Moving Environment Separation

- Ambient Motion must not silently become gameplay/collision/passability authority.
- If an environmental object materially affects gameplay through.
- collision passability damage navigation player transport door state hazard timing.
- its movement/state must belong to an explicit gameplay/interactable/physics/sequence semantic owner.
- Example.
- presentation-only fan rotation -> Ambient Motion.
- door opening that changes passability -> Door / Interaction gameplay authority.
- moving gameplay platform -> explicit gameplay movement/physics authority.
- damage trap -> Hazard Runtime + Combat/Damage authority.

##### ANI-16 — Preview / PIE / Cooked / Player Parity

- Animation capability is not complete solely because editor Preview can play it.
- Representative used animation capabilities must preserve materially equivalent creator intent across required stages.
- Preview PIE Cooked Standalone Player.
- Parity coverage should include where used.
- clip identity looping state transitions locomotion layers one-shots typed markers/events retargeting root-motion policy combat reaction environmental motion fallback behavior.

##### ANI-19 — Babylon.js 9 Animation / Retargeting Adapter & Derived-Cache Contract

- Evidence-bounded technology direction: The currently accessible Source06 admits exact.
- This is fresh external evidence for the candidate, not permission to change the admitted package graph or skip implementation-time API/bundle tests.
- RetroStage remains owner of.
- AnimationSet AnimationGraph/state semantics semantic rig identity CharacterRigProfile RetargetReferencePose RetargetProfile typed markers root-motion policy save/reconstruction meaning creator diagnostics Preview/PIE/Export parity.
- RSM-HUMANOID-V1 / CharacterRigProfile -> validated semantic source/target correspondence -> RetargetProfile -> adapter derives Babylon-compatible mapping/options -> AnimatorAvatar.retargetAnimationGroup(...) -> derived retargeted AnimationGroup.
- Mutable source display names never become canonical compatibility identity.
- Upstream limitation containment: The currently verified Babylon implementation requires attention to.
- source AnimationGroup targets TransformNode objects, not direct Bone targets source transforms must represent the intended reference/rest pose when retargeting runs target skeleton rest pose must be correct unmatched targets may be removed hierarchy checking is optional/backend-specific root/ground correction requires explicit validated policy.
- RetroStage therefore keeps RIG-02/RIG-03/RIG-05/ANI-11 validation rather than claiming arbitrary retarget compatibility.
- The exact key schema remains implementation-owned.
- is not canonical project data is not save identity is not stable gameplay identity.
- Runtime retargeting may remain a bounded preview/fallback implementation technique where needed, but the default production direction is to avoid repeated retarget work on hot state transitions.
- Version/dependency rule: ANI-19 admits no new dependency by itself.
- Derived-cache policy: Retargeting should normally be prepared once per validated input generation, not repeated at every locomotion transition.
- A retarget derivative key should be provenance-complete over the materially relevant inputs, such as.
- A cached/derived retargeted AnimationGroup.
- It does not authorize.
- @babylonjs/core upgrade @babylonjs/addons admission babylonjs-editor-tools admission legacy babylonjs package.
- Any future package/version change still follows Source06 exact admission.
- @babylonjs/core@9.21.2 @babylonjs/loaders@9.21.2.
- and already assigns Babylon animation playback responsibility behind RetroStage semantics.

##### ANI-17 — Animation Diagnostics

- RSM-85 and later diagnostics should make animation failure creator-readable.
- Live diagnostics should expose enough information to inspect.
- current semantic state current locomotion parameters active clip/blend active transition layer weights/priorities interruption reason marker/event timeline missing semantic slot retargeting errors root-motion request vs accepted movement combat phase synchronization Preview/PIE/Player mismatch.
- Diagnostics must describe RetroStage semantic meaning rather than expose only raw Babylon implementation objects.

##### ANI-18 — Procedural / IK Scope Guardrail

- Public Alpha does not require a generalized procedural-animation / IK / climbing framework.
- Explicitly out of core scope.
- general full-body IK framework general foot-placement framework general procedural locomotion general climbing/ledge IK Motion Matching large animation-cancel/combo framework advanced facial/lip-sync system.
- Bounded NPC face/look-at presentation already supported by product direction may remain.
- Additional IK/procedural features require explicit future owner, creator demand, diagnostics, export/save/parity semantics and scope review.

#### Authority placement: §9.15.8 Equipment projection and lifecycle contracts (new under §9, after §9.14)

##### EQP-01 — Equipment Channel / Semantic Socket Separation

- Logical gameplay/loadout channel and physical attachment socket are separate.
- Representative logical channels.
- PRIMARY_HAND OFF_HAND BACK_CARRY HIP_CARRY UTILITY.
- Representative sockets.
- HAND_R HAND_L BACK HIP_R HIP_L.
- A capability/loadout profile maps logical role to a compatible socket.
- Equipment Channel is not Semantic Socket is not Imported Bone.

##### EQP-02 — Equipment Presentation / Mount Profile

- An equippable item may reference a bounded presentation/mount profile.
- presentation asset equipment class preferred/required socket mount position offset mount rotation offset scale policy optional holster socket world-drop presentation identity light/VFX/audio presentation hooks where applicable.
- Final mount is derived from.
- Rig semantic socket transform + equipment-class/default calibration + bounded item-specific mount override.
- Examples.
- Flashlight equipmentClass = UTILITY_HANDHELD primarySocket = HAND_R optionalHolster = HIP_R.
- WoodenClub equipmentClass = ONE_HANDED_MELEE primarySocket = HAND_R optionalHolster = BACK.
- Authority.
- attached mesh/light is not item ownership is not weapon damage authority is not flashlight on/off/battery authority.

##### EQP-03 — Character Equipment Capability Profile

- Player/NPC/Enemy profiles may reference a bounded equipment capability profile.
- Representative declarations.
- supported equipment classes supported logical channels supported semantic sockets allow holster allow drop allow runtime equip change animation stance capabilities.
- Examples.
- HumanoidCombat -> PRIMARY_HAND -> OFF_HAND -> BACK_CARRY -> UTILITY_HANDHELD -> ONE_HANDED_MELEE -> HANDGUN.
- HumanoidSimpleEnemy -> PRIMARY_HAND -> ONE_HANDED_MELEE.
- CreatureDog -> no humanoid hand equipment.
- Incompatible equip attempts fail explicitly.
- No root-bone fallback is permitted.

##### EQP-04 — Equipment Loadout Profile

- Character/enemy archetypes may reference a data-driven EquipmentLoadoutProfile.
- Example.
- EnemyProfile: Janitor Rig: RSM-HUMANOID-V1 compatible AnimationSet: Human_Melee Loadout: PRIMARY_HAND -> WoodenClub.
- Another.
- EnemyProfile: Guard Loadout: PRIMARY_HAND -> Handgun OFF_HAND -> Flashlight.
- No enemy-specific code is required merely to attach supported equipment.
- Story/Encounter/Flow/Sequence loadout changes still use normal typed equipment transactions.
- A graph cannot directly attach a mesh to a raw bone.

##### EQP-05 — Equip / Unequip / Holster / Drop / Restore Lifecycle

- Equipment lifecycle is semantic and transactional.
- Equip Request -> validate ItemRuntimeInstance -> validate CharacterEquipmentCapability -> validate Rig/Socket -> validate behavior/animation requirements -> semantic EQUIP COMMIT -> rebuild/rebind derived attachment presentation.
- One ItemRuntimeInstance may project as.
- WORLD INVENTORY EQUIPPED HOLSTERED.
- without minting duplicate gameplay identities.
- Drop flow.
- DROP transaction -> remove equipment binding -> inventory/world ownership transition -> spawn world entity with normal RSM-23 provenance -> derived world presentation.
- A failed drop cannot both retain the equipped item and create a duplicate world item.
- Runtime Save restores semantic item/equipment state and reconstructs attachments from.
- CharacterRigProfile + EquipmentBinding + ItemRuntimeInstance.
- Raw mesh/bone handles are never save truth.

##### EQP-06 — Equipment Animation / Stance Binding

- Equipment integrates with AnimationSet through semantic stance/action requirements.
- Representative bounded stance tags.
- NONE UTILITY_HANDHELD MELEE_ONE_HAND HANDGUN.
- Direction.
- Equipment semantic state -> Animation stance/action semantic input -> AnimationSet -> compatible locomotion/action/reaction.
- Examples.
- LOCOMOTION.IDLE + MELEE_ONE_HAND LOCOMOTION.WALK + MELEE_ONE_HAND ACTION.ATTACK_PRIMARY + MELEE_ONE_HAND.
- Missing stance-specific animation uses only an explicitly compatible fallback.
- Two-handed v1 presentation may use.
- primary socket + authored compatible animation + optional secondary-grip marker/socket metadata.
- without promising automatic two-hand/full-body IK.
- ANI-18 remains binding.

##### EQP-07 — Deterministic Enemy/NPC Loadout Variation

- Enemy/NPC profiles may optionally use bounded deterministic loadout variation.
- FIXED WEIGHTED_DETERMINISTIC STORY_DRIVEN.
- Example.
- ZombieWorker 50% EmptyHand 30% WoodenClub 20% Pipe.
- Weighted selection uses a dedicated RetroStage RNG domain/provenance tied to stable spawn/encounter identity where reproducibility matters.
- Once selected as semantic runtime state, save/restore reconstructs that accepted loadout.
- It is not re-rolled on load.
- This does not create a general loot generator, RPG affix system or large weapon-modification tree.

#### Authority placement: §9.15.8 Rendering/presentation continuity contracts (new under §9, after §9.14)

##### VIS-19 — Atmosphere Volume / Presentation Contribution Composition

- Canonical Atmosphere Volumes can affect fog, exposure, color/LUT influence, lighting, presentation overrides, VFX density/state, audio snapshots/reverb and blend time/distance.
- Overlapping volumes must not each imperatively write and later restore global state.
- Each active volume has/derives.
- AtmosphereVolumeId runtime placement/occurrence identity RuntimeSessionGeneration Scene/Section generation priority blend weight blend profile affected domains.
- Each parameter/domain uses an explicit supported composition policy such as.
- weighted blend highest-priority winner bounded additive contribution replace within scoped priority.
- Physics overlap callback order cannot decide final atmosphere.
- Leaving/unloading one volume removes only that volume's contribution and recomputes current visual, audio and VFX state. It cannot restore stale fog/exposure/audio state over another still-active volume or Sequence contribution.
- Audio contributions route through AUD-02/AUD-03.
- VFX through VFX owners.
- visual lighting/material/ post-process through presentation owners.
- Pure position-derived blend weights are reconstructed rather than saved as gameplay truth. Story-driven persistent atmosphere state is saved through its semantic owner if admitted.
- Visual fog/exposure/color does not automatically change AI perception.
- intentional stealth meaning uses GPC-29.

##### VIS-01 — Color Management & SDR Output Contract

- Public Alpha owns one deterministic SDR-oriented color pipeline. Texture semantics distinguish SRGB_COLOR from LINEAR_DATA.
- lightmaps declare source encoding and decode into linear-light shading. Processing order remains source semantics, material sampling, linear lighting, exposure, tone map, world treatment, internal-resolution/upscale presentation, UI composition, then final SDR transfer. WORLD_AFFECTED_UI and READABLE_SCREEN_UI are distinct bounded composition domains.
- The exact Frame Graph and physical color-management implementation remain milestone-owned, but they must preserve the declared semantic domains, explicit LUT expectations, and explicit UI placement relative to tone mapping, palette, posterization, dithering, and output transfer.
- V0 requires SDR output. HDR is deferred and is not implied. Preview, PIE, Cooked, and Standalone Player cannot reinterpret a texture role silently.
- final captures must identify world-only, world-plus-UI, or final-display output.

##### VIS-02 — Lightmap / Baked-Lighting Ownership

- Problem found: Canonical visual direction references.
- Baked / Lightmapped direction Lightmapped material capability some baked AO / lightmap outputs.
- but does not currently assign a sufficiently explicit owner for a native RetroStage lightmap baker.
- This creates a product-promise ambiguity.
- V0 NATIVE RETROSTAGE LIGHTMAP BAKER = NOT PROMISED.
- IMPORTED / PRE-BAKED LIGHTMAP WORKFLOW = SUPPORTED DIRECTION.
- LIGHTMAP ASSET IDENTITY = RETROSTAGE-OWNED.
- LIGHTMAP REFERENCE / UV / COLOR ROLE = VALIDATED.
- FUTURE NATIVE BAKER = REQUIRES SEPARATE TOOL / DEPENDENCY / LICENSE / PIPELINE ADMISSION.
- Required v0 semantics: If a Lightmapped material/profile is exposed, the creator must be able to understand.
- which lightmap asset is referenced which UV set is used what texture/color-data role applies whether the asset is present/compatible whether the material has a valid fallback.
- Missing lightmap assets, invalid UV expectations or unsupported bake metadata must produce creator-readable diagnostics.
- Explicit anti-promise: Selecting a Lightmapped profile must not imply.
- RetroStage will automatically unwrap RetroStage will automatically bake GI RetroStage will automatically bake shadows.
- unless a future admitted native baker explicitly provides those functions.

##### VIS-03 — Camera Depth / Clip / Depth-Precision Contract

- Camera configuration must explicitly own validated depth-range semantics.
- Each relevant CameraProfile or effective camera state should derive or validate.
- near clip far clip scene-scale compatibility depth-precision risk projection compatibility.
- Required distinction: AUTHORED RETRO VERTEX / RASTER JITTER = presentation feature.
- UNCONTROLLED Z-FIGHTING / DEPTH PRECISION FAILURE = bug / diagnostic.
- Uncontrolled depth artifacts must never be accepted as Visual Rawness merely because they resemble historical hardware artifacts.
- Diagnostics: Project Doctor / camera diagnostics should be able to identify at least.
- pathological near/far ratio unexpected clipping depth-fighting risk camera-profile inconsistency fixed-camera foreground/background depth misuse.
- The implementation may use the current Babylon/WebGL/WebGPU depth strategy, but the creator contract must remain RetroStage-owned and backend-neutral.

##### VIS-04 — Transparency / Render Classification / Ordering

- RetroStage should use bounded render/material classification rather than unrestricted arbitrary render-order manipulation.
- Representative classes.
- OPAQUE CUTOUT TRANSPARENT_CARD ADDITIVE_VFX SCREEN_SPACE_PRESENTATION UI.
- Exact naming may be normalized during implementation.
- Required ownership: Every relevant render/material class must define or derive.
- alpha mode depth-test policy depth-write policy sorting class bounded priority if required lighting participation atmosphere / fog participation scene-post participation output / UI composition domain fallback behavior.
- A render class is therefore more than draw order. It also defines how that presentation participates in the scene's lighting/atmosphere/output pipeline.
- Candidate processing direction: Opaque -> Cutout / alpha-test -> Transparent / card-like presentation -> Additive / selected VFX -> screen-space post/presentation -> UI.
- This is a semantic ordering contract, not a mandate for one specific engine queue layout.
- Required safeguards: Arbitrary giant renderOrder escape values must not become normal creator workflow. - Transparent cards, fog cards, particles, decals and sprite-like actors must have predictable ordering behavior. - A sprite/card/particle must not accidentally bypass fog, exposure, scene post or other presentation stages merely because it belongs to a transparent queue. - Overdraw-heavy combinations should be diagnosable. - Transparency fallback on weaker hardware must remain explicit. - Renderer sorting order must not become gameplay/passability authority.
- A render class is therefore more than draw order.
- Required safeguards: Arbitrary giant renderOrder escape values must not become normal creator workflow.
- Transparent cards, fog cards, particles, decals and sprite-like actors must have predictable ordering behavior.
- A sprite/card/particle must not accidentally bypass fog, exposure, scene post or other presentation stages merely because it belongs to a transparent queue.
- Transparency fallback on weaker hardware must remain explicit.
- Renderer sorting order must not become gameplay/passability authority.

##### VIS-05 — Temporal Presentation State Lifecycle

- Any visual feature that carries history across frames must declare lifecycle behavior.
- Temporal state may include current or future features such as.
- Exposure Lag / adaptation temporal AA history temporal upscale history motion-history-dependent effects temporal denoise/history buffers selected accumulated presentation state.
- No future temporal algorithm is mandated.
- the lifecycle contract is required whenever one exists.
- Required lifecycle outcomes: Each relevant discontinuity should explicitly resolve to.
- PRESERVE RESET REBASE.
- according to the feature's semantics.
- Representative discontinuities.
- hard camera cut teleport / impossible camera transition Scene switch Section switch load / checkpoint restore window resize fullscreen / display-mode change internal-resolution change quality-tier change PresentationProfile change graphics-device/context restoration.
- Required safeguards: Old history must not produce.
- ghosting exposure flash stale-frame contamination cross-camera smearing invalid reprojection.
- after a discontinuity.
- Fixed-camera games make this particularly important because camera cuts are normal authored gameplay/presentation events, not edge cases.

##### VIS-06 — Shader / Material Variant Warmup & Stutter Control

- Known presentation variants should not first compile at the dramatic moment when the player sees them if they can be prepared deterministically.
- Cooked/standalone preparation should be able to derive a bounded variant inventory from actual project/material/presentation usage.
- Candidate flow.
- project/material/presentation usage -> bounded variant manifest -> cook/build preparation -> optional prewarm / staged preparation -> runtime activation.
- Required safeguards: Unbounded shader/material variant explosion must be detected. - Runtime first-use compilation hitch should be measurable/diagnosable. - A failed/unsupported variant should have a documented fallback path where feasible. - Variant identity must derive from semantic material/presentation inputs rather than transient engine object identity. - Warmup/preparation must not introduce hidden gameplay behavior or mutate canonical content.
- Acceptance direction: A representative visually rich cooked scenario should not exhibit a material first-use hitch that was avoidable from its declared project variant set.
- Frame pacing is part of visual quality, not merely an optimization afterthought.

##### VIS-07 — Runtime LOD / Culling Stability

- Runtime LOD and culling should be stable, bounded and creator-diagnosable.
- LOD selection may be based on explicit project/profile policy such as.
- distance screen coverage quality tier device capability.
- but must avoid rapid threshold oscillation.
- Required semantics: stable bounds LOD thresholds hysteresis / anti-thrash behavior fallback LOD missing-LOD handling quality-tier interaction.
- should be defined where the asset/profile uses LOD.
- Required authority boundary: renderer culling visibility is not AI/gameplay visibility.
- An object disappearing due to renderer culling must not cause AI, interaction, collision or gameplay existence to disappear unless a separate gameplay streaming/section owner explicitly decides that state.
- Diagnostics: Creator-facing diagnostics should identify.
- invalid/extreme bounds rapid LOD switching missing expected LOD culled-yet-gameplay-active state where relevant unexpected quality-tier fallback.

##### VIS-08 — Imported Visual Asset Fidelity Validation

- Visual import validation should make material fidelity risks explicit rather than relying only on successful file parsing.
- For relevant imported assets, the pipeline should validate/report where applicable.
- normal semantics normal-map tangent-space convention normal-channel orientation/conversion where admitted tangent availability/derivation UV-set availability and orientation/convention lightmap UV expectations vertex colors alpha mode material texture roles color/data texture interpretation supported material extensions unsupported material extensions skeleton influences skin/bone compatibility scale/orientation texture presence.
- Reimport rule: Reimport must preserve RetroStage stable semantic references where compatible and explicitly diagnose material identity/fidelity drift.
- Fallback rule: Unsupported visual material features must use.
- supported fallback or explicit creator-facing incompatibility.
- rather than silent rendering corruption.

##### VIS-10 — Presentation Resource Reconstruction / Device Loss

- GPU/device/context resources are derived presentation state.
- They are never canonical project/gameplay authority.
- After graphics-device/context loss or equivalent presentation reinitialization, RetroStage should reconstruct used resources from stable project/runtime semantic state.
- Representative resources include.
- material instances shader/pipeline variants textures LUTs/palette resources Frame Graph resources render targets VFX GPU resources animation presentation adapters environmental-presentation resources.
- Required invariant: STALE GPU HANDLE is not DURABLE IDENTITY.
- Required recovery behavior: On supported recovery paths.
- stable project/runtime state -> presentation resource rebuild -> validation/fallback -> render resumes.
- without mutating canonical content merely to survive a presentation reset.
- If a resource cannot be reconstructed or supported on the recovered device, the failure/fallback must be creator-readable.

##### VIS-11 — Visual Geometry / Collision / Navigation Separation

- Rendered geometry, collision geometry and navigation geometry are separate semantic products.
- The architecture must explicitly preserve.
- VISUAL GEOMETRY is not COLLISION GEOMETRY is not NAVIGATION GEOMETRY.
- A useful derivation model is.
- Authored / Imported Geometry -> ├── Render Derivative │ visual LOD │ mesh simplification for presentation │ geometry de-polish │ visual quantization │ authored vertex/raster character │ ├── Collision Derivative │ └── Navigation Derivative.
- These derivatives may share provenance and invalidation links, but none silently becomes the authority of another.
- Render LOD selection is not collision LOD selection.
- Renderer culling is not entity existence.
- Visual vertex jitter / quantization is not physical displacement.
- Visual mesh simplification is not automatic collision simplification.
- Render bounds is not gameplay/navigation truth unless explicitly adapted.
- Required safeguards: A low-poly visual LOD must not silently change collision shape. - Vertex jitter or retro geometry character must not move hurtboxes, interaction volumes, nav surfaces or physical ground. - Navigation generation must use an explicitly approved geometry/source policy. - Collision regeneration and render-LOD regeneration must have separate invalidation semantics. - Creator diagnostics should identify mismatches where visual geometry materially diverges from collision/navigation expectations.
- Ownership: This contract should be reflected across geometry/import, physics/collision, navigation and visual-rawness owners rather than assigned to a single renderer-only subsystem.

##### VIS-12 — Alpha / Premultiplication / Coverage Contract

- Alpha semantics must be explicit for imported textures, materials, sprites/cards, UI and VFX.
- RetroStage must not allow each asset or adapter to silently choose incompatible straight/premultiplied alpha assumptions.
- Every alpha-bearing visual asset/profile should define or derive where applicable.
- alpha semantic straight vs premultiplied convention blend mode cutout / alpha-test threshold semantics depth-test policy depth-write policy sorting/render class mip behavior coverage preservation policy atlas gutter/padding policy color-space relationship fallback behavior.
- Required safeguards: The system should prevent or diagnose common failures such as.
- dark / black halos white fringes sprite atlas edge bleeding incorrect additive edge energy cutout coverage collapsing across mip levels transparent brightness mismatch double premultiplication missing premultiplication.
- Cutout / coverage: Where alpha-cutout assets use mipmaps, the pipeline should have an explicit policy for preserving intended coverage or otherwise document the expected threshold behavior.
- The exact algorithm may remain implementation-owned.
- the semantic result must be predictable.
- Atlas interaction: Atlas generation/import should preserve sufficient gutter/padding for the declared filtering/mip policy.
- Authority boundary: Alpha/compositing behavior is presentation authority only and must not alter gameplay hitboxes, visibility/perception or entity existence.

##### VIS-13 — Shadow Quality / Bias / Stability Contract

- RetroStage may intentionally expose low-resolution, hard or stylized shadow character, but uncontrolled shadow instability is a rendering defect.
- The architecture must distinguish.
- AUTHORED LOW-RES / HARD SHADOW CHARACTER = PRESENTATION FEATURE.
- SHADOW ACNE PETER-PANNING CAMERA-RELATIVE SHIMMER UNSTABLE CASCADE/REGION TRANSITION UNEXPECTED CASTER LOSS = BUG / DIAGNOSTIC.
- Bounded ShadowProfile direction: Where dynamic shadows are used, an effective shadow profile should be able to own or derive.
- shadow mode resolution tier caster policy receiver policy bias policy normal-bias policy where applicable distance / coverage budget stability policy quality-tier fallback hardware fallback.
- Exact engine/backend fields need not be exposed one-for-one to creators.
- Required safeguards: Bias must not be an uncontrolled global magic number. - Low-resolution shadows may be intentional but should remain stable under representative camera movement/cuts. - Fixed-camera compositions should not exhibit accidental shadow swimming between stable shots. - Unsupported/over-budget casters should fall back predictably and be diagnosable. - Shadow settings should not silently change gameplay light/noise/perception semantics.
- Diagnostics: Project Doctor / presentation diagnostics should be able to surface likely cases such as.
- probable shadow acne excessively detached shadow unsupported caster shadow-budget overflow unstable quality combination unexpected fallback.

##### VIS-14 — Material Family / Material Instance System

- RetroStage should support a constrained material-family / material-instance workflow so creators can produce coherent variations without cloning entire material definitions or exposing an unbounded shader graph.
- A material family should own stable semantic structure such as.
- material family identity supported material profile allowed texture slots allowed scalar/vector/color parameters transparency/render class compatibility presentation capability requirements fallback policy variant-affecting parameters.
- A material instance should reference one material family/base and apply bounded overrides.
- Representative structure.
- PaintedMetal_Base -> ├── PaintedMetal_Red ├── PaintedMetal_Green ├── PaintedMetal_Rusted └── PaintedMetal_Wet.
- Authority rule: Material Instance is not arbitrary shader graph.
- Material Instance = constrained semantic override over RetroStage-owned material structure.
- A material instance must not silently add new shader topology, engine-private nodes or hidden runtime dependencies.
- Variant discipline: The system should distinguish.
- presentation-only parameter override vs shader/material variant-affecting override.
- so that material instances do not create uncontrolled shader-variant explosion.
- This contract should integrate with VIS-06 variant inventory/warmup.
- Reimport / identity: Material-family and instance references should remain stable across compatible asset reimport.
- If a referenced texture slot/profile becomes invalid, the instance should enter a diagnosable invalid/fallback state rather than silently detaching from its base.
- Creator value: The intended outcome is.
- without becoming a general-purpose material programming environment.

##### VIS-15 — Visual Baseline / Look Consistency Guardrail

- RetroStage should allow a creator to establish an optional project or look-level Visual Baseline against which scenes/sections can be compared for material presentation drift.
- A Visual Baseline may reference or summarize stable presentation intent such as.
- PresentationProfile Exposure family Palette / LUT family Fog / atmosphere character ShadowProfile Texture character Material family expectations Visual Rawness family Internal-resolution / output family selected atmosphere/look recipe identity.
- The exact schema should be derived from existing PresentationProfile / Look Lab / Atmosphere Analysis ownership rather than duplicate them.
- Critical authority boundary: Visual Baseline is not mandatory house style is not automatic visual rewrite.
- The creator may intentionally diverge.
- The system should classify material drift as.
- EXPECTED / OVERRIDDEN or UNEXPECTED / REVIEW.
- rather than silently "fix" the scene.
- Candidate diagnostics: Examples of useful warnings.
- scene uses a materially different exposure family scene accidentally bypasses intended palette/LUT scene uses incompatible filtering/material mode scene uses unexpected shadow profile scene output differs from the selected project look baseline.
- Integration rule: VIS-15 should reuse existing.
- Look Lab Look Snapshot / A-B Atmosphere Analysis PresentationProfile Visual Recipe / Scene Mood Board.
- capabilities.
- It must not create a second canonical presentation authority.

##### VIS-16 — Gameplay Readability / Visual Legibility Analysis

- RetroStage should provide editor-side advisory analysis that helps creators identify when visual style unintentionally destroys gameplay readability.
- This is especially relevant for.
- dark horror scenes heavy fog palette reduction low internal resolution high visual noise strong post treatment sprite/card actors dense VFX.
- Candidate readability targets: Where the project marks such elements as relevant, analysis may evaluate representative.
- player silhouette enemy silhouette enemy attack telegraph interactable contrast critical pickup visibility hazard readability objective-critical object visibility prompt contrast HUD contrast subtitle readability low-resolution survival palette-reduction survival fog/atmosphere survival.
- Authority boundary: This tool is advisory.
- Gameplay Readability Analysis is not gameplay visibility authority is not AI perception authority is not automatic balance system.
- AI/perception must continue to use explicit gameplay semantics such as GameplayNoise, perception rules, visibility/occlusion semantics and authored state.
- The analysis may say.
- "Enemy silhouette has low visual separation in this camera/look.".
- It must not decide.
- "Enemy is therefore invisible to gameplay.".
- Analysis inputs: The tool may reuse existing visual diagnostics such as.
- contrast luminance silhouette fog depth palette focal region material complexity texture density shadow coverage overdraw.
- and combine them with optional semantic annotations for gameplay-critical subjects.
- Output: Warnings should be.
- creator-readable camera/look-specific non-destructive dismissible / acknowledged traceable to a semantic subject.

##### VIS-17 — Target Quality / Fallback Preview Matrix

- Creators should be able to preview the current scene/look under the project's declared quality, capability and fallback tiers without requiring a full external export cycle for every check.
- Candidate modes.
- RECOMMENDED LOW MINIMUM_SUPPORTED FALLBACK.
- Exact names should align with the current quality/capability model.
- Preview matrix: A representative comparison may expose changes such as.
- shadow mode / resolution fog / atmosphere quality VFX budget texture derivative / residency choice LOD selection post-effect fallback transparency fallback material variant fallback internal resolution.
- Authority rule: LOWER QUALITY / FALLBACK is not DIFFERENT GAMEPLAY MEANING.
- A lower visual tier may reduce visual cost but must not silently change.
- collision navigation interaction enemy existence damage objective state gameplay visibility authority.
- unless an explicit gameplay system separately owns that difference.
- Creator workflow: VIS-17 should integrate with existing.
- Look A/B quality tiers capability resolver fallback policy Preview/PIE parity.
- rather than create a second renderer.
- Acceptance direction: A creator should be able to identify before shipping when a fallback materially harms.
- composition readability atmosphere shadow character material fidelity VFX intent.
- and receive creator-readable diagnostics for unsupported mandatory presentation requirements.

##### VIS-18 — Reference Image / Composition Overlay

- RetroStage should provide an editor-only reference/composition overlay workflow for creator-supplied reference art or screenshots.
- This should extend existing Scene Mood Board / composition tooling without making reference images canonical scene/runtime content by default.
- Candidate controls.
- opacity wipe / split comparison fit fill safe crop grid center guides rule-of-thirds guides aspect preview.
- Use cases: fixed-camera composition architectural proportion lighting direction silhouette comparison focal-point alignment set-dressing balance color-balance comparison scene reconstruction from concept/reference.
- Authority and packaging boundary: Reference Image / Overlay = EDITOR-ONLY BY DEFAULT.
- Reference Image is not Scene asset is not Cooked asset is not Standalone Player dependency.
- If the creator explicitly imports the same source image as a runtime asset, that is a separate normal asset-import decision with normal provenance/license/reference rules.
- Privacy / portability: Project portability must not silently depend on machine-local absolute reference paths.
- If references are intentionally project-associated, their locator/provenance policy should be explicit. Otherwise editor-local references should remain non-authoritative and safely missing.
- Scope guardrail: VIS-18 is a composition convenience tool, not.
- image editor paint package automatic style transfer system AI image-generation subsystem general compositing application.

#### Authority placement: §9.15.8 Rig/retarget/attachment identity contracts (new under §9, after §9.14)

##### RIG-01 — RSM-HUMANOID-V1 Semantic Rig Contract

- Humanoid characters share one RetroStage semantic anatomy contract. Source bone names do not need to match RetroStage names.
- The semantic structure is chain/role based.
- RIG_ROOT logical rig/root-motion domain └── PELVIS.
- SPINE_CHAIN one or more mapped segments └── HEAD NECK_CHAIN optional/intermediate where available.
- ARM_L ├── CLAVICLE_L optional ├── UPPER_ARM_L ├── LOWER_ARM_L └── HAND_L.
- ARM_R ├── CLAVICLE_R optional ├── UPPER_ARM_R ├── LOWER_ARM_R └── HAND_R.
- LEG_L ├── UPPER_LEG_L ├── LOWER_LEG_L ├── FOOT_L └── TOE_L optional.
- LEG_R ├── UPPER_LEG_R ├── LOWER_LEG_R ├── FOOT_R └── TOE_R optional.
- SPINE_CHAIN / NECK_CHAIN intentionally allow variable source-bone counts.
- Optional presentation extensions may include.
- twist / roll bones extra spine segments finger chains jaw / eye bones accessory / cloth / hair helper bones weapon/helper bones.
- but these are not baseline humanoid requirements.
- _L and _R always mean the character's anatomical left/right.
- Examples that are source identities, not canonical semantics.
- hand_r RightHand mixamorig:RightHand Bip01_R_Hand.
- All may map to HAND_R.

##### RIG-02 — Coordinate / Reference-Pose / Orientation Contract

- RSM-HUMANOID-V1 inherits the exact unit/axis/handedness/rotation convention frozen by RSM-21.
- This candidate must not create a second coordinate convention.
- After RSM-21, rig/retarget data must express.
- canonical up canonical forward canonical right canonical unit/scale canonical rotation semantics.
- through that same transform contract.
- Retarget reference pose: A source skeleton is not required to ship in a particular named pose such as T-pose or A-pose.
- RetroStage stores/derives a validated.
- RetargetReferencePose.
- that calibrates the source skeleton into the RSM-HUMANOID-V1 semantic reference orientation.
- The exact numerical reference pose is frozen by the owning animation/retarget milestone after RSM-21 coordinate truth exists.
- source bind/rest pose is not automatically canonical retarget reference pose.
- Negative scale or hierarchy mirroring is not an accepted implicit conversion strategy.

##### RIG-03 — Rig Compatibility Tiers & Required-Joint Validation

- Compatibility is capability-based rather than requiring every optional humanoid joint.
- Conceptual tiers.
- HUMANOID_CORE HUMANOID_STANDARD HUMANOID_EXTENDED.
- HUMANOID_CORE direction: Baseline biped locomotion / representative actions require.
- PELVIS at least one SPINE segment HEAD.
- UPPER_ARM_L LOWER_ARM_L HAND_L.
- UPPER_ARM_R LOWER_ARM_R HAND_R.
- UPPER_LEG_L LOWER_LEG_L FOOT_L.
- UPPER_LEG_R LOWER_LEG_R FOOT_R.
- HUMANOID_STANDARD direction: May add.
- NECK CLAVICLE_L / CLAVICLE_R multiple spine semantics TOE_L / TOE_R validated root-motion source.
- HUMANOID_EXTENDED direction: May preserve.
- twist/roll chains fingers facial/helper bones custom sockets.
- without making those requirements universal.
- A feature declares its required semantics. For example.
- one-handed flashlight -> compatible HAND_R or HAND_L socket.
- baseline locomotion -> HUMANOID_CORE locomotion semantics.
- two-hand authored weapon presentation -> primary hand + authored secondary-hand compatibility.
- Missing required semantics produce an explicit incompatibility diagnostic.
- RetroStage must never silently attach missing equipment to RIG_ROOT.

##### RIG-04 — CharacterRigProfile / Stable Bone Mapping

- Each supported character skeleton has a RetroStage-owned CharacterRigProfile or equivalent.
- Conceptually.
- CharacterRigProfile ├ sourceSkeletonIdentity ├ semanticRig = RSM-HUMANOID-V1 or CUSTOM/CREATURE ├ semanticJointMap ├ semanticChainMap ├ RetargetReferencePose ├ rootMotionSource ├ semantic sockets └ compatibility capabilities.
- Example.
- HAND_R -> importedBoneId: bone-4A23.
- HAND_L -> importedBoneId: bone-8831.
- SPINE_CHAIN -> [bone-12, bone-13, bone-14].
- Approved mapping should use stable imported subasset/bone identity where available, not mutable display name alone.
- CharacterRigProfile = semantic rig mapping authority.
- Babylon Skeleton/Bone objects = derived runtime adapters.

##### RIG-05 — RetargetReferencePose / RetargetProfile

- ANI-11 constrained retargeting uses semantic rig compatibility, not filename matching.
- A RetargetProfile should bind.
- source CharacterRigProfile target CharacterRigProfile / compatibility class semantic joint/chain correspondence RetargetReferencePose calibration scale/proportion policy root/pelvis policy translation-retarget policy where admitted rotation-retarget policy missing/unsupported semantic behavior.
- Required safeguards.
- bone-name similarity is only an import hint.
- different spine counts use semantic chain mapping.
- material limb-proportion differences are bounded/validated.
- missing required hands/feet/limbs fail rather than silently substitute.
- twist/finger/helper chains remain optional unless explicitly required.
- retargeting cannot seize gameplay movement authority.
- non-finite retarget transforms fail diagnostically.
- This remains constrained retargeting and does not admit motion matching, facial retarget automation, or an unrestricted runtime retarget laboratory.

##### RIG-06 — Semantic Attachment Socket Contract

- Equipment/VFX/audio attachments use stable RetroStage semantic sockets.
- Built-in humanoid socket vocabulary should include at least where supported.
- HAND_R HAND_L BACK HIP_R HIP_L CHEST HEAD.
- Bounded custom sockets may exist where genuinely needed.
- CUSTOM.JAW CUSTOM.TAIL_BASE CUSTOM.TAIL_TIP CUSTOM.WEAPON_HELPER.
- A socket is conceptually.
- socketId parent semantic joint / mapped imported bone local position offset local rotation offset local scale policy capability/tags where applicable.
- Core invariant.
- Semantic Socket is not source bone display name.
- Thus.
- HAND_R -> hand_r.
- on one source asset, while.
- HAND_R -> mixamorig:RightHand.
- on another.
- Runtime socket access validates current character/rig/session generation. Stale Babylon bone handles cannot regain authority.

##### RIG-07 — Rig Import Auto-Mapping / Manual Correction / Reimport Stability

- Maker workflow: Character import may propose semantic mappings using.
- bone names hierarchy left/right relationships bind/reference pose known source-profile heuristics.
- Example.
- HAND_R -> mixamorig:RightHand [HIGH confidence] HAND_L -> mixamorig:LeftHand [HIGH confidence] CHEST -> Spine2 [MEDIUM confidence].
- Auto-map is advisory.
- The creator may.
- accept correct clear.
- mappings.
- Compatible reimport must preserve creator-approved mappings by stable source/import identity.
- A bone rename/reorder must not silently remap HAND_R to another bone.
- Rig preview should expose.
- semantic joint labels source mappings reference pose socket gizmos test animation test equipment attachment.
- without committing gameplay state.

##### RIG-08 — Non-Humanoid / Creature Rig Boundary

- Enemy does not imply humanoid.
- A dog, crawler, creature or boss may use.
- CUSTOM / CREATURE RigProfile.
- and does not need fake HAND_R semantics.
- Non-humanoid rigs still reuse.
- stable imported bone identity CharacterRigProfile concept AnimationSet semantic custom sockets capability validation reimport/runtime adapter boundaries.
- A creature may expose no equipment, or bounded custom sockets such as.
- CUSTOM.MOUTH CUSTOM.BACK CUSTOM.TAIL.
- Missing humanoid sockets never fall back to root.

##### RIG-09 — Root / Pelvis / Root-Motion Source Separation

- These are different concepts.
- RIG_ROOT PELVIS source skeleton root/helper node runtime character/world transform root-motion source.
- Required rules.
- RIG_ROOT is semantic, not automatically a physical imported bone.
- PELVIS is the body/pelvic semantic joint.
- source skeletons may contain armature/helper nodes above pelvis.
- gameplay movement owns character world transform.
- root-motion extraction uses explicit rig/retarget policy.
- import/retarget must avoid double application of root-node and pelvis translation.
- This binds directly to ANI-09 and GPC-13.

##### RIG-10 — Rig Diagnostics / Preview / Export Parity

- Rig validation should diagnose at least.
- missing required semantic joint duplicate semantic mapping left/right inversion invalid hierarchy non-finite reference/bind transform extreme scale/proportion mismatch unsupported root/pelvis mapping socket with missing parent equipment incompatibility retarget reference-pose mismatch reimport mapping drift.
- Representative rig + animation + equipment combinations must remain materially equivalent across.
- Asset Preview Rig/Character Preview PIE Cooked Standalone Player.
- Preview gizmos/helpers remain editor-only.

#### Authority placement: §9.15.9 Performance ownership/budget contracts (new under §9, after §9.14); proof remains in Source04 §53

##### PERF-00 — Shared Performance Budget / Hardware Profile / Degradation / Hysteresis Contract

- Canonical source preservation: RSM-71, RSM-82 and RSM-103 require explicit budgets and slow-operation evidence.
- The alignment has many local limits.
- This hardening adds one shared budget vocabulary so those limits do not become unrelated numbers.
- Performance profile: Representative derived target profile.
- PerformanceTargetProfileId hardware/capability class target frame cadence / frame-time budget CPU/main-thread budget classes GPU/render budget classes memory/resource budget classes async/background budget classes quality/fallback policy.
- Exact values remain milestone evidence.
- Budget registry: Subsystems declare measurable budget classes for relevant costs, for example.
- entities/physics/AI Section/streaming transparent overdraw postprocess/rawness Diorama animated layers VFX particles audio voices UI complexity resource memory worker concurrency import/cook temporary memory.
- No unsupported scale promise: Budget warnings explain.
- Effective quality: Creator-authored visual/gameplay meaning remains separate from player effective quality.
- Performance fallback may reduce.
- LOD/detail VFX density rawness tier Diorama motion tier shadow/post quality cache residency.
- only where the owning capability declares a safe fallback.
- It cannot reduce.
- If automatic runtime adaptation is later admitted, it must use.
- bounded measurements hysteresis minimum dwell time stable transition rules.
- Editor slow operations: RSM-82 slow-operation detection uses the same operation/job identities where possible.
- import validation projection shader/material work thumbnail audio/media VFX UI memory pressure.
- Export proof: RSM-103 packaged/clean-machine testing measures the final artifact on supported target profiles.
- Editor Preview performance alone cannot prove player performance.
- The alignment has many local limits. This hardening adds one shared budget vocabulary so those limits do not become unrelated numbers.
- It can attribute.
- without turning telemetry into a requirement.

##### PERF-01 — Frame-Time / Pacing / Spike Classification / Work Admission Contract

- Core problem: Average FPS is insufficient.
- A game can report.
- 60 FPS average.
- while repeatedly producing.
- 9 ms 10 ms 11 ms 63 ms 8 ms 9 ms 57 ms.
- and feel broken.
- Performance evidence: Representative frame evidence should distinguish.
- CPU main/update time fixed-simulation work runtime-system work render preparation/submission GPU/frame completion where measurable resource load/upload work shader/pipeline preparation UI/React work in editor/player shell GC/allocation pause evidence where observable job-result publication long-frame count consecutive missed-frame count.
- Exact instrumentation remains RSM-82/103-owned.
- Percentiles / pacing: Performance gates should consider.
- median / representative frame time p95 p99 or long-frame distribution where statistically meaningful max bounded hitch class frame-time variance / pacing startup/transition hitches.
- rather than only average FPS.
- MUST_COMPLETE_CURRENT_PHASE MAY_SLICE_ACROSS_FRAMES MAY_DEFER BACKGROUND_ONLY.
- or implementation-equivalent semantics.
- No hidden all-at-once commit: Expensive preparation can be incremental, but semantic publication remains atomic.
- Representative.
- instead of.
- Fairness: A permanently busy low-priority system cannot consume all spare frame time.
- Gameplay semantics: Optimization cannot dynamically skip required gameplay simulation because rendering is slow.
- If a subsystem uses intentionally staggered semantic updates, for example bounded AI perception cadence, that cadence belongs to the authored/runtime profile and remains independent of momentary render FPS.
- Gameplay-sensitive fixed simulation remains SYS-09-owned.
- Background: SYS-12 remains authoritative for focus/background/suspend discontinuity.
- Background throttling behavior is not used as a gameplay timer.
- Frame-work admission: Work that is not semantically required to finish in the current frame declares a work class.
- This classification is owned by RetroStage, not inferred from Promise timing.

##### PERF-02 — Hot-Path Allocation / GC / Pool Capacity / Lifetime Contract

- Critical JavaScript risk: A stable average CPU profile can still stutter because hot paths allocate short-lived objects every tick/frame and periodically trigger large garbage-collection work.
- Hot-path classification: Representative hot paths include.
- runtime fixed update event queue dispatch physics/query normalization AI/perception result processing animation/VFX update render submission preparation Diorama evaluation player UI bindings editor viewport frame path.
- Allocation discipline: Hot paths should prefer.
- reuse of bounded scratch structures ToRef/in-place style math where semantically safe pre-sized/reused arrays where practical stable immutable/static descriptors bounded pools for expensive reusable engine objects.
- over unnecessary per-frame object/closure/string/array creation.
- This is an implementation performance rule, not permission to expose mutable backend objects as canonical authority.
- The requirement is.
- Pooling: A pool must define.
- Pool is not memory leak: A pool cannot retain the maximum historical burst forever merely because an object is reusable.
- Representative.
- VFX burst to 5,000 -> temporary expansion where policy permits -> idle period -> bounded trim toward normal capacity.
- Pool reset: VFX-01/AUD-01 and other pool users remain required to clear every mutable occurrence-specific field before reuse.
- Large temporary objects: Image/audio/media/import/export buffers and archive payloads should not be duplicated into several simultaneous full JS-heap copies when streaming/chunked/native-buffer handling can safely avoid it.
- String/log churn: Per-frame string interpolation/JSON serialization for diagnostics is not free.
- OBS/PERF-10 determine which hot-path evidence is aggregated/sampled rather than formatted eagerly every frame.

##### PERF-03 — Render Submission / Draw-Call / Instancing / Shadow-Light / Transparency Contract

- Core authority: RetroStage may optimize Babylon render representation, but optimization remains derived.
- The architecture should expose creator-diagnosable render-cost classes such as.
- visible rendered objects draw/submission count material/state changes instance/thin-instance groups skinned meshes transparent submissions/coverage shadow caster submissions dynamic light influence postprocess passes render-target work.
- Exact Babylon counters/adapters remain implementation-owned.
- Instance / batching eligibility: Many visually identical decorative objects may use.
- instances thin instances static batching/merge other approved Babylon batching primitives.
- only when semantic eligibility is proven.
- Stable identity preservation: A batched/instanced representation keeps a reversible mapping.
- RenderBatchId / InstanceRenderIndex ↔ RetroStage StableId / runtime entity identity.
- where picking, selection, diagnostics, VFX attachment, visibility or runtime references require individual identity.
- Cross-Section boundary: A render batch cannot combine objects whose independent lifetime/residency is required unless the batch representation itself supports correct Section-level membership/removal.
- cross-Section static merge is not acceptable if it prevents independent unload.
- must not be frozen/merged under an optimization contract that cannot invalidate/rebuild them.
- rather than only object count.
- Transparency: Transparent PNG/Diorama/VFX/card density uses.
- A scene with only fifty full-screen transparent cards may be more expensive than thousands of opaque static triangles.
- Culling: VIS-07 remains authoritative.
- frustum culling LOD occlusion visibility groups.
- changes render work only, not gameplay existence.
- without exposing Babylon object identity as product truth.

##### PERF-04 — GPU Upload / Texture-Mesh Residency / Render-Target / Bandwidth Contract

- Critical hitch class: CPU-side loading can finish asynchronously, then still create a long foreground hitch when many.
- textures vertex/index buffers animation textures video textures LUTs render targets shader resources.
- are uploaded/created on the graphics path together.
- Upload queue: SYS-13 Resource Manager owns or coordinates a bounded GPU-resource preparation/upload queue.
- Representative identity.
- GpuPreparationRequestId ResourceHandleId AssetRevision / DerivativeSetGeneration DisplayContextGeneration RuntimeSessionGeneration where relevant priority/readiness class estimated upload/memory class.
- Critical vs deferred: Resources distinguish.
- REQUIRED_BEFORE_ACTIVATION REQUIRED_SOON DEFERRED_PRESENTATION OPTIONAL_CACHE.
- or equivalent.
- Required resources participate in the owning Section/Sequence/UI/media readiness barrier.
- Optional resources may stream/prepare later without exposing broken semantic state.
- Upload budget: Where backend constraints permit, large upload work is staged/bounded so a Section load does not suddenly transfer the whole scene in one frame.
- GPU memory: SYS-13/PERF-09 track effective GPU-facing residency classes, including.
- textures/mips geometry buffers skinning/animation resources shadow maps postprocess/render targets video textures temporary capture targets.
- Exact GPU memory visibility may be approximate/backend-dependent.
- semantic resource ownership remains exact.
- Render-target pool: Temporary render targets may be reused only through bounded compatibility/ownership rules.
- Device/display change: VIS-10 and SYS-16 remain authoritative.
- Display resize/device restoration can recreate render targets/resources in a staged way and rejects stale old-context completions.
- Texture policy: Texture dimensions/format/mips/quality tiers are cook/runtime profile decisions.
- This alignment does not mandate a general virtual-texturing or open-world texture-streaming system.

##### PERF-05 — Shader-Pipeline Variant Closure / Prewarm / Compilation-Stutter Contract

- Integration with VIS-06: VIS-06 remains the visual contract.
- PERF-05 makes warmup part of runtime/export workload architecture.
- Variant closure: Cook/export derives a finite semantic variant inventory from.
- reachable MaterialFamily/Profile creator material-instance parameters that affect shader shape lighting/shadow mode Visual Rawness/CRT/post chain quality tier capability/hardware fallback skinning/vertex feature requirements.
- Avoid combinatorial explosion: Not every independently configurable visual flag should necessarily become an independent shader define.
- The renderer adapter should distinguish.
- shader-shape-affecting parameter uniform/runtime parameter material resource binding.
- so creator flexibility does not multiply compiled variants unnecessarily.
- Warmup plan: The cooked build may derive a staged.
- PipelineWarmupPlan.
- with groups such as.
- PLAYER_STARTUP_CRITICAL FIRST_SCENE_REQUIRED NEXT_SECTION_PRELOAD DEFERRED.
- No "warm everything at startup": Prewarming all project variants can merely move the hitch into a huge startup stall/memory spike.
- Warmup follows PERF-08 startup critical path and LVL/PERF-06 transition preparation.
- Runtime miss: An unexpected runtime compile/variant miss is.
- measurable correlated to semantic variant identity bounded/fallback-capable where possible.
- and cannot silently freeze the game repeatedly without diagnostics.
- Backend cache: Driver/browser/backend compiled-pipeline caches are derived local acceleration only.
- They are not portable build truth and are invalidated/rebuilt according to device/backend identity.

##### PERF-06 — Scene-Section Prepare / Budgeted Instantiation / Activation Commit Contract

- Staged preparation: A Section activation may have a bounded preparation plan.
- resolve manifest -> request/decode resources -> GPU prepare/upload required assets -> prepare shader/pipeline variants -> construct runtime entity/component projections -> prepare physics/navigation/audio/presentation owners -> validate readiness -> small semantic activation commit.
- Budgeted instantiation: Large entity/component projection work may be sliced/cooperatively prepared across frames/jobs when safe.
- Partially prepared entities are not yet normal gameplay participants.
- Hidden prepare state: Prepared-but-not-active objects.
- do not receive gameplay input do not trigger Event/Action consequences do not become AI targets do not appear in Runtime Save as newly active semantic state.
- until activation commit.
- Commit: The final activation commit should be bounded and predictable.
- If the commit itself is still too expensive, the Section/content exceeds the selected performance contract and requires diagnostics/content restructuring rather than pretending preparation solved it.
- Transition headroom: LVL-09 memory headroom includes.
- old active Section + preparing new Section + temporary decode/upload buffers + warmup resources + commit working set.
- not only the final post-transition residency.
- Camera/door transition: Creator-facing transition profiles may choose.
- but cannot expose a half-initialized world to avoid a loading indicator.
- Retry/cancel: Cancelled/stale preparation releases only its generation-owned resources/leases and cannot publish after another Section activation won.

##### PERF-07 — Maker Projection / React Subscription / IPC Payload / Incremental Validation Contract

- Core editor risk: RetroStage Maker may have.
- React Golden Layout Zustand/XState Babylon viewport Hierarchy Inspector Content Browser Problems Localization Workspace Flow Graph Sequencer.
- inside one product.
- A small canonical edit must not require O(project-size) recomputation/re-render across every surface.
- Authoring change set: An accepted authoring transaction should emit/derive a bounded change description such as.
- AuthoringRevisionId changed document IDs changed stable entity/component/profile IDs changed field/semantic domains where useful invalidated derived indexes/projections.
- Exact representation remains application-owned.
- Projection subscription: Editor surfaces subscribe to the smallest stable projection they need.
- one transform edit is not re-project entire project is not rerender every Inspector/Hierarchy/Content Browser row.
- virtualization incremental query/result paging stable row IDs bounded sorting/filtering work.
- where scale warrants it.
- according to MUI EditSession semantics.
- IPC payload: Electron Main/Preload/Renderer messages carry.
- No synchronous IPC hot path: Synchronous/blocking IPC is not used in viewport frame paths, input paths, scrolling or normal editing.
- Main-process protection: Filesystem/index/export/import/native work initiated from UI follows asynchronous JOB-01/project storage boundaries.
- The Electron Main/UI thread cannot be used as a CPU-heavy editor worker.
- Viewport isolation: A heavy React panel update should not cause the Babylon Preview/PIE viewport to rebuild runtime resources.
- Viewport/runtime projections are stable owned adapters, not children recreated by arbitrary UI component lifecycle.
- A small edit does not require dropping/rebuilding the entire index unless recovery/corruption policy explicitly does so.
- Validation: Keystroke/draft interaction can use.
- cheap local validation debounced/incremental derived validation commit-time authoritative validation.
- Expensive whole-project validation is not synchronously rerun on every text input event.

##### PERF-08 — Editor + Player Startup Critical Path / Lazy Capability / First-Useful Contract

- Separate startup goals: RetroStage tracks distinct startup milestones, for example.
- PROCESS_READY CORE_UI_VISIBLE FIRST_USEFUL_MAKER PROJECT_ADMITTED VIEWPORT_READY.
- PLAYER_SHELL_READY BUILD_MANIFEST_VALID FIRST_FRAME_VISIBLE FIRST_SCENE_PLAYABLE.
- Exact names/targets remain evidence-owned.
- Maker startup: Core startup loads only what is needed for.
- Core Project Admission Safe Startup basic Settings first-useful Launcher.
- Optional/heavy systems such as.
- Monaco Flow Graph Sequencer editor advanced Look tools Localization Workspace plugin code large Gallery/Studio media specialized importers export tooling.
- are activated when their workflow requires them.
- PLG lazy activation and SICE first-useful boot remain binding.
- Player startup: The packaged player.
- creates minimal shell -> validates RuntimeBuildManifest/content ABI -> loads required RuntimeGameSession systems -> prepares first-scene critical resource/pipeline closure -> enters first playable state.
- It does not preload every project Scene, locale voice pack, media file and shader variant at boot.
- Lazy-code hitch prevention: Lazy loading is not universally good.
- A module/variant required at the first interactive moment belongs in the earlier critical path.
- A rarely used settings/help/optional capability may load later.
- Disk I/O: Startup avoids broad.
- directory walks full-artifact hash scans where tiered verification suffices all-locale voice enumeration all-project index rebuild all-thumbnail decode.
- unless corruption/recovery policy explicitly requires it.
- Startup diagnostics: Evidence distinguishes.
- module/code load disk I/O manifest/schema validation font/catalog load first-scene resources shader warmup plugin activation index recovery.
- rather than one opaque "startup time".

##### PERF-09 — Long-Session Memory / Process-GPU-DOM-Worker Leak / Pressure / OOM Contract

- Memory is cross-process: Electron/Babylon memory is not one number.
- Diagnostics should distinguish where possible.
- Main/Browser process Renderer process GPU process Utility/worker processes V8/JS heap Blink/DOM Resource Manager GPU-facing resources media/audio buffers native/WASM allocations SQLite/index/cache memory temporary job/export/import buffers.
- Budget / trend: A long-session fixture evaluates both.
- absolute peak/steady-state budget and retained growth trend after repeated equivalent churn.
- A stable 1.5 GB project may be acceptable on a target where a 400 MB->1.5 GB monotonic leak is not.
- Scene/Section A ↔ B PIE start/stop project open/close asset Preview open/close Look Lab preview video playback language switch plugin enable/disable where supported export run/cancel window/fullscreen/device transitions.
- must return toward a bounded retained baseline.
- Non-Resource-Manager leaks: SYS-13 cannot clean leaks it does not own.
- DOM/event listeners React subscriptions XState/Zustand subscriptions Babylon observables object/blob URLs AudioNodes media elements workers/utility processes timers/adapters native handles IPC subscriptions.
- according to ownership.
- OOM pressure: If available memory falls below safe headroom, the product may.
- defer/reject optional jobs trim caches/pools reduce admitted presentation quality through PERF-00 cancel noncritical preparation.
- before entering fatal failure.
- It cannot delete canonical/source truth or mutate gameplay semantics to save memory.
- Process/GPU loss: If Renderer/GPU/utility process loss occurs, OBS-00/VIS-10/RSM-103 decide controlled recovery or shutdown.
- Leak evidence: Development diagnostics may use Electron/Chromium process/heap/memory instrumentation, but the measurement API is not memory-management authority.
- Therefore lifecycle scopes also account for.
- Automatic restart into half-owned resources or save corruption is forbidden.

##### PERF-10 — Profiling / Trace / Debugger / Development-Overlay Overhead Contract

- Observer effect: A profiler can create the hitch it is measuring.
- Instrumentation modes: RetroStage distinguishes at least conceptually.
- SHIPPING_BASELINE LOCAL_LIGHTWEIGHT_DIAGNOSTICS DEVELOPMENT_DETAILED_TRACE HEAVY_CAPTURE / PROFILE SESSION.
- Hot-path logging: Production/player hot paths do not eagerly emit large structured events for every.
- entity tick particle physics contact render submission Diorama card UI binding.
- unless a bounded diagnostic session explicitly enables that class.
- Aggregation: High-frequency performance data may aggregate.
- count min/max histogram/bucket rolling percentile estimate duration total top-N expensive owners.
- before producing bounded structured events.
- Debug overlays: Babylon Inspector, runtime debugger overlays, debug draw, SceneInstrumentation detail, React development diagnostics and similar tools.
- are development/editor features are off by default in shipped player are not used as performance-baseline evidence unless overhead is classified.
- Trace buffers: Detailed trace/ring buffers are bounded in bytes/time and can drop/aggregate lower-value events instead of exhausting memory.
- Profiling comparison: RSM-103 release evidence compares the real packaged shipping configuration.
- A build that meets frame targets only after disabling the very production diagnostics required by the product is invalid.
- conversely a heavy developer profiler is not required to fit shipping frame budget.

##### PERF-11 — Derived Optimization Representation / Stable Identity / Invalidation / Reversibility Contract

- Most important optimization invariant: optimization representation is not semantic authority.
- Examples of derived optimization representations.
- merged/static render mesh instance/thin-instance buffer frozen active-set/material optimization precomputed visibility/culling data render list shader/pipeline cache nav derivative texture atlas sprite atlas resource cache compiled message payload incremental index.
- Semantic mapping: Where an optimization collapses many semantic objects into one backend representation, RetroStage retains enough mapping/provenance for every required operation.
- picking/selection diagnostics resource ownership Section unload visibility VFX/audio attachment where relevant export explanation reimport/invalidation.
- Eligibility: An optimization has an explicit eligibility predicate.
- For example static render merge may require.
- same compatible material/render class compatible lightmap/vertex layout compatible Section lifetime no required independent transform animation no required independent runtime visibility no required per-object renderer feature that merge would lose.
- Invalidation: When a material input changes, the derived representation is invalidated/rebuilt.
- creator edits transform/material -> frozen/batched representation does not remain silently stale.
- Stable semantics under optimization level: Changing.
- batching strategy instance representation LOD optimization cache policy shader warmup render scale.
- must not change.
- unless a separate semantic profile explicitly owns such a change.
- No premature "freeze everything": Backend-specific freeze/skip-update optimizations may be used only where mutation/invalidation ownership is proven.
- A general "freeze all active meshes/materials" style optimization is not a project-level creator toggle.

---

## 10. Canonical Document Direction

The planned canonical document family includes:

```text
ProjectDocument
GameDefinitionDocument
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

The word `Profile` is intentionally namespaced by authority. A project `Supported Game Profile` is a capability envelope; gameplay tuning profiles are typed authoring semantics; `PresentationProfileDocument` is game-presentation intent; local Creator Profile/Studio preferences are editor-local. They are not one registry and cannot substitute for one another.

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

- project, GameDefinition, and scene document schemas,
- entity and component envelopes,
- stable persisted references, including the Project→GameDefinition composition binding,
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
- GameDefinition/composition/resolution validation and provenance diagnostics,
- capability validation across requested/supported/effective capability separation,
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
- shared GameConfigurationResolver invocation/composition ports without owning canonical meaning,
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
- runtime clock domains, ordered update phases, fixed/variable-step policy, pause/time-scale/hit-stop semantics,
- runtime system registration and dispatch,
- transient runtime entities/components plus stable runtime identity/provenance contracts,
- runtime events/actions, effect-commit/idempotency semantics, and causal-budget enforcement,
- domain-separated RNG stream/seed/save/trace contracts,
- owner-scoped scheduled work semantics,
- runtime lifecycle and disposal,
- Scene/Section transition participation and quiescence contracts,
- approved serializable runtime-state registry and save-safe-boundary contracts.

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

**Physically accepted through RSM-6:**

- Babylon engine and scene lifecycle,
- public default, editor-only, and headless entrypoints,
- one-way renderer projection revisions and lifecycle-safe resource epochs,
- stable-ID ↔ transient Babylon-handle registries,
- selection/picking adapters that translate Babylon hits into RetroStage identity/intents,
- camera/controller projection and editor-only XZ grid ownership,
- `AssetContainer`-based derived asset/resource ownership,
- `UtilityLayerRenderer` and `GizmoManager` integration without command or canonical-mutation authority,
- explicit renderer resource lifetime and disposal,
- real `NullEngine` headless adapter-conformance support,
- `SceneInstrumentation` and `EngineInstrumentation` capture behind frozen JSON-safe RetroStage diagnostics contracts,
- the plain-TypeScript Electron `ViewportView` host seam through `apps/editor-electron`.

**Later ownership reserved by this map, not implemented by RSM-6:**

- canonical scene/project projection driven by RSM-7+ documents,
- lights, materials, textures, animation, particles, selection visualization, capture, and presentation backends,
- Frame Graph and advanced post-processing,
- development-only Inspector adapters if separately admitted,
- player/export integration and later runtime/content milestones.

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
- dependency graph resolution across static references **and declared semantic/dynamic reachability**,
- consumption of the same GameDefinition/shared resolver semantics used by PIE/runtime; no export-only resolver,
- stable capability/export-disposition reconciliation,
- complete used-capability runtime semantic closure rooted in resolved game composition,
- resolution-dependency/fingerprint evidence where useful to explain reproducibility,
- cooked-content manifest generation,
- deterministic hierarchical store-neutral output layout,
- editor-only/Studio-local/source exclusion,
- build report inputs,
- player package assembly orchestration.

**Must not own:**

- canonical project meaning,
- arbitrary filesystem writes outside approved output scope,
- installer or Steam credentials,
- gameplay runtime semantics.

### 15.15.1 Export closure contract

`@retrostage/export-pipeline` must be able to explain why each packaged runtime item exists and which supported capability requires it.

It coordinates, but does not own, canonical gameplay/presentation meaning. Owning domain systems expose stable capability identity, export disposition, dependencies, runtime/cooked projection, and validation hooks. The export pipeline composes those contracts into the manifest/package closure.

Build stripping may remove only content proven unreachable under the supported runtime semantics. Dynamic/semantic references must be declared or discoverable through typed product contracts rather than hidden strings or third-party object graphs.

## 15.16 `@retrostage/test-fixtures`

**Role:** development-only builders, canonical fixtures, golden-project helpers, fake ports, and deterministic test inputs.

**Class:** `TEST_ONLY / DEVELOPMENT_ONLY`

**Owns:**

- test document builders,
- mock/fake storage and renderer ports,
- migration fixtures,
- command/session fixtures,
- deterministic runtime fixtures,
- a versioned Golden Fixture Corpus covering known-valid, known-invalid, corrupt, compatibility, migration, round-trip, asset, and later product-representative cases,
- deterministic round-trip harness inputs and expected outputs,
- adapter-conformance fixtures, including headless renderer projection/disposal cases,
- development-only property-based arbitraries when an admitted tool such as `fast-check` materially improves edge-case coverage.

It must never enter editor or player production bundles.

**Roadmap entry:** RSM-3, RSM-6–8, RSM-17, RSM-30, RSM-112–113.

## 15.17 RetroStage-owned governance/evidence tooling

**Role:** development-only automation for repetitive repository, Source, patch, dependency-evidence, and hosted-CI identity collection.

**Class:** `TOOLING / DEVELOPMENT_ONLY / NON_PRODUCT / NON_AUTHORITY`

**May automate:**

- SHA-256 and byte counts,
- Git blob/tree/parent/ref identity,
- exact changed-path and patch boundaries,
- Source-manifest/repository/live equality,
- dependency/evidence inventories,
- remote-ref observations,
- CI run/head/event/attempt/job/step identity capture.

**Must not become:**

- Human Project Owner authorization,
- independent review,
- product validation truth,
- an implicit stage/commit/push authority,
- a tool that silently repairs drift,
- a production editor/player dependency.

No `pnpm rsm:*` or equivalent command is canonical merely because this architecture reserves the tooling direction; commands enter Source 07 only after physical implementation and accepted validation.

## 15.18 Editor development/testing acceleration boundaries

RetroStage may use mature development-only UI tooling to reduce repetitive test and component-workbench code without outsourcing product semantics.

Approved directions:

```text
Testing Library family
→ semantic React/DOM tests focused on user-visible behavior

Storybook
→ conditional isolated development/review of RetroStage-owned UI components and states

dnd-kit family
→ milestone-gated drag/drop primitives behind RetroStage intent/command adapters
```

Durable boundaries:

- Testing Library does not replace Playwright/Electron acceptance or real-browser validation.
- Storybook does not become the production editor shell, a hosted service requirement, or the canonical source of design tokens/behavior.
- DnD toolkit object IDs, collision results, sensors, and sortable state are transient UI implementation details; canonical hierarchy/asset moves remain RetroStage commands with validation.
- No accessibility or visual-testing addon is inherited automatically through a workbench; each addon/dependency family remains subject to its own license/transitive review.

## 15.19 Store / Distribution Adapter Boundary

Storefronts are optional distribution targets, not canonical project/game authority.

A future platform adapter may own only target-specific integration such as admitted SDK/API calls, overlay/store lifecycle glue, achievements/cloud/controller features when explicitly enabled, depot/upload/build metadata integration, or other selected target services.

It must not own:
- canonical project data;
- core gameplay semantics;
- base save meaning;
- store-neutral export layout;
- creator entitlement/business policy;
- generic player startup;
- secrets in source control.

The store-neutral standalone package must remain complete on its own for all non-store-dependent advertised capabilities. Target packaging may layer additional files/services over that base.

Electron/Babylon player hosting remains subject to representative hardware/process/GPU/lifecycle qualification for claimed commercial targets. Qualification is evidence-driven and does not imply a benchmark program or pre-admit any vendor SDK.

A new package is not required merely because a store target exists; ordinary package-creation rules still apply.

### 15.19A Packaged-Player Store Qualification / Update Authority

`apps/player-electron` remains store-neutral by default. A selected store adapter is accepted only through physical target evidence and does not change renderer/gameplay/save authority.

For an enabled Steam target, target validation may include client launch, overlay lifecycle, fullscreen/focus transitions, admitted callback/controller features, bridge initialization ordering and clean platform-resource shutdown.

For an enabled Epic target, target validation may include launcher/distribution launch, artifact/config resolution, admitted achievements/cross-store/EOS/overlay/social features and clean platform-resource shutdown.

Electron Main is the player host/supervisor. Observable renderer/GPU/child-process loss is translated into RetroStage error/diagnostic categories with available reason preservation; recovery or shutdown must not silently corrupt runtime/save state.

Target-distribution update ownership is separate from package creation:
```text
RetroStage export pipeline → deterministic package/version/artifact truth
Steam target → Steam depot/distribution update transport
Epic target → Epic artifact/distribution update transport
standalone self-update → absent unless separately designed/admitted
```
The platform adapter may integrate upload/depot metadata at release tooling boundaries, but neither a store updater nor Electron self-updater becomes canonical/runtime authority.

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

- initialize the admitted Babylon Engine or real headless `NullEngine` according to the public entrypoint,
- own Babylon Scene lifecycle,
- accept derived projection contracts without owning canonical documents,
- load only self-contained supported glTF 2.0/GLB sources through the admitted loader seam,
- manage Babylon resource creation and disposal,
- map stable RetroStage IDs to transient Babylon objects,
- route Babylon picking through RetroStage identity/selection adapters,
- own `AssetContainer` lifecycle only as derived runtime resource state,
- isolate editor-only overlays through `UtilityLayerRenderer`/render-classification mappings,
- integrate `GizmoManager` only behind RetroStage selection/command/validation authority,
- provide a `NullEngine`-based headless conformance backend for projection/lifecycle tests,
- expose `SceneInstrumentation` only through RetroStage diagnostics snapshots,
- implement the accepted camera/editor-grid foundation while later lighting, fog, materials, animation, particles, and presentation work remains milestone-owned,
- keep Inspector absent unless a later development-only admission explicitly authorizes it,
- prefer narrow ESM imports and tree-shakable Babylon entrypoints,
- reserve Frame Graph/presentation seams without making Babylon graph structure canonical,
- support Preview, PIE, and player runtime modes without sharing forbidden state.

### RSM-6 foundation primitive map

```text
RetroStage canonical/render contracts
        ↓
@retrostage/renderer-babylon9
        ├─ Engine / Scene / camera / render loop
        ├─ stable ID ↔ transient handle registry
        ├─ picking adapter
        ├─ AssetContainer lifecycle
        ├─ UtilityLayerRenderer / render-classification seam
        ├─ GizmoManager intent seam
        ├─ NullEngine conformance backend
        ├─ Scene/Engine instrumentation → RetroStage diagnostics
        └─ real Electron ViewportView host seam
```

This map is physically implemented for the listed RSM-6 foundation primitives. Inspector and Frame Graph are not part of the accepted RSM-6 implementation. The adapter may use admitted Babylon facilities internally as long as its public/canonical side remains RetroStage-owned.

### Babylon adapter prohibitions

It may not:

- serialize canonical projects using Babylon scene serialization,
- generate persistent entity IDs,
- mutate `SceneDocument`,
- own component validation,
- determine gameplay capabilities from a rendered object,
- store canonical references as object identity,
- make Babylon Inspector a shipping product surface,
- treat Inspector/CLI edits as canonical authoring operations,
- make Babylon picking the canonical selection authority,
- make `GizmoManager` the command/mutation authority,
- make `AssetContainer` the canonical asset document,
- make NodeMaterial the canonical material document,
- make Frame Graph the canonical presentation document,
- expose Babylon objects or instrumentation objects as public cross-package state.

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
| OpenTelemetry JS | later diagnostics adapter/local instrumentation | remote telemetry/privacy authority |
| fast-check | `test-fixtures` / development test tooling | canonical data generation or validation authority |
| Testing Library family | `editor-app` / development-only UI tests | product acceptance, real-browser/Electron truth, canonical UI semantics |
| Storybook | conditional development-only component workbench | production editor shell, hosted design authority, canonical product truth |
| dnd-kit family | hierarchy/list/asset interaction adapter after milestone admission | canonical hierarchy mutation, drop validation, command authority |
| Piscina | conditional Node-only worker/job adapter | product semantics, canonical mutation, or automatic parallelism policy |
| Changesets | conditional release/version tooling | product capability/version truth by itself |
| ts-pattern | conditional TypeScript convenience dependency | canonical domain model or validation semantics |
| Babylon Inspector | `renderer-babylon9` development-only diagnostics | shipping editor UI or canonical mutation authority |
| `@babylonjs/addons` | feature-specific renderer adapter only after separate admission | baseline package grab-bag or product authority |
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
| Game-wide composition intent | GameDefinitionDocument / canonical documents | shared resolver, Preview/PIE/export | UI state, RuntimeGameSession, third-party object graphs |
| Resolved game configuration | shared headless GameConfigurationResolver | RuntimeGameSession, cook/export, diagnostics | canonical persistence |
| Resolution dependency/fingerprint | shared resolver/diagnostics | cache, regression, evidence | authoring authority |
| Requested/Supported/Effective capabilities | GameDefinition intent / Capability Matrix / resolver respectively | UI, validation, runtime/export consumers | visible UI alone |
| Gameplay profile/component/recipe meaning | canonical gameplay documents/registries | specialized editors, PIE/player, Flow Graph/Sequencer adapters | React/Babylon/Havok/Recast object state |
| Story/dialogue/objective/clue meaning | canonical narrative/gameplay authorities | editors, runtime, save, diagnostics | UI widget state |
| Player UI authored meaning | canonical UI/text/runtime-settings contracts | player UI runtime | React/Zustand transient state |
| Presentation/Atmosphere authored meaning | PresentationProfile/owned project contracts | renderer/audio adapters, player | Babylon runtime objects or Studio preferences |
| Studio Identity / Creator Experience | local editor/app preferences | editor shell | project/runtime/export authority |
| Export capability closure | owning semantic systems + export pipeline orchestration | manifest, package, Project Doctor | static asset graph alone |
| Store target integration | optional platform adapter | packaging/player integration | canonical project/gameplay authority |
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

## 43.1 Context Integrity Development-Tooling Boundary

CIC is a RetroStage-owned, development-only architecture boundary. It is not a runtime/product package and it grants no canonical mutation authority.

```text
canonical Sources + physical repository/tool truth + reviewed task/authorization state
        ↓ read-only deterministic derivation
Context Compiler / closure / validation / continuity tooling
        ↓
derived context packs, task projections, evidence pointers and recovery indices
```

Generated artifacts never outrank canonical Sources, Git/repository bytes, accepted evidence, or explicit owner authority. The compiler must not install packages, execute arbitrary project content, make ambient network calls, stage/commit/push, or mutate canonical files.

The architecture distinguishes:

- rebuildable local cache: content-addressed, fingerprinted, isolated from governed worktree evidence, discardable on corruption/schema mismatch;
- reviewed durable metadata: provenance-bound semantic relations, carry-forward invariants, scenario/oracle intent, acceptance briefs, and progression lineage;
- reviewed durable evidence: accepted test/experiential results, closure/handoff generations, recovery manifests, and CIC proof;
- task-local CTX projections: derived/referenced lifecycle roles, not 29 mandatory duplicated files and never self-authoritative inputs.

Physical import/consumer/package facts are derived from repository truth wherever possible. Durable registries contain only non-inferable reviewed semantics/oracles and bind stable owner, provenance, generation and aggregate identities; unowned or stale rows are `INVALID`, and no full manual import/consumer/dependency mirror may override physical evidence. Closure witnesses cover negative knowledge and dynamic channels such as IPC, command/event IDs, schema/migration registries, capability/resolver registrations, save/export reachability, and generated-code lineage.

Stable semantic context entities use deterministic owner-scoped identities appropriate to their class, never casual display labels, paths, array indices, or transient renderer/runtime IDs. A rename or move that preserves semantic continuity requires an explicit remap, alias, or supersession record; removal uses a tombstone or superseded state when historical continuity requires it. Duplicate or ambiguous identity and remap/alias cycles fail closed as `CONTEXT_IDENTITY_COLLISION`.

Context generations use coherent start/end input witnesses, global and task-material fingerprints, deterministic UTF-8/LF serialization, stable Git-relative identities, and acyclic manifests. Pack/registry/root activation is immutable-generation plus compare-and-swap; partial/mixed generations never become active. Authorized working-set checkpoints and immediate file preimages protect legitimate edits without accepting unexplained drift.

The durable CTX-26/27/28 progression root must have one exact physical root and active-root locator, one explicit owner/mutation authority, single-winner CAS promotion, retention/supersession, and governed backup/restore. A chat copy is convenience only. CTX-17 recovery bundles use reviewed size/retention classes: bounded text/patch bytes may be captured, while large binary/media/build material defaults to hash plus governed pointer/backup; exceptions require explicit owner/reviewer authority and cleanup/supersession policy.

Evidence uses stable ID, content hash, classification, governed locator and availability. Required missing/corrupt bytes fail closed; relocation of identical bytes does not change semantic identity. Clean-clone/restore and bounded deterministic scale fixtures must prove the architecture before CIC closure.

No new production or development dependency is admitted by this boundary. Physical top-level CIC command entry points exist and Source07 is reauthenticated to the current repository baseline; Source02/08 remain the current-control and lifecycle authority. This architecture text does not activate a later control or RSM-7.

---

## 44. Immediate Handoff

Current architecture handoff:

```text
RSM-6 I1-I8 = CLOSED / ACCEPTED
RSM-6-V1 = CLOSED / PASS
RSM-6 = MILESTONE CLOSED / PASS
implementation baseline = dbd3f2be31d89ca36a17ccb4914e21623df424a2
closure/publication baseline = 34b1148e1c7be12e30f1e962148d40b5027a7b07
closure natural CI = 32526483832 / 96909482744 / attempt 1 / success
Gate B = ACTIVE / CURRENT
Final CIC Closure = CLOSED / PASS / PUBLISHED / HOSTED-VALIDATED
Post-I12 Slice1-5 = CLOSED / PASS / PUBLISHED / HOSTED-VALIDATED
Slice6 canonical technical state = CONDITIONAL / DISABLED / NOT STARTED
Slice6 owner progression disposition = DEFERRED / RESEARCH-ONLY / NOT REQUIRED FOR CURRENT PROGRESSION
current CIC/repository baseline = 4414bcb7df4b3efe8aa0ad392405339f42dc70b8 / tree 754a410dfc2eb9a50918e9e0d76b603b3c221a2f / CI run 71 attempt 1 success
RSM → CICtrl H0 = CLOSED / PASS / DONOR CAPTURE ACCEPTED / RSM MUTATION NONE
current control = FIRST POST-I12 CIC REBASE / CURRENT-SOURCE ALIGNMENT
V30-FREEZE11 / R16 / second CIC rebase / RIH = LOCKED
RSM-7 = next roadmap milestone / not implemented / not started / not authorized
```

The accepted closed-milestone foundation includes the renderer contract/public entries, lifecycle/context safety, camera/editor grid, stable handle epochs and picking, derived asset containers, headless diagnostics, editor gizmo intents, and real Electron viewport. This architecture alignment records future accepted direction only; canonical RSM-7 document work remains unimplemented, not started, and unauthorized until Source 02/08 lifecycle truth and separate owner authority allow it.

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
