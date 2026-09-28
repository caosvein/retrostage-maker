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
