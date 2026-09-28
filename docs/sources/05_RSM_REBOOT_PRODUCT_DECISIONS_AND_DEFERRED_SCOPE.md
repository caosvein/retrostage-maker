# RetroStage Maker — Reboot Product Decisions and Deferred Scope

**Document ID:** `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE`  
**Role:** Authoritative durable product-decision, architecture-direction, scope-boundary, deferral, and rejection registry  
**Project:** RetroStage Maker  
**Distribution intent:** Commercial proprietary desktop creator distributed through Steam and other approved Windows channels  
**Source generation:** Reboot / clean-start  
**Document date:** 2026-08-22  
**Document state:** `ACTIVE DECISION REGISTRY / RSM-6 MILESTONE CLOSED-PASS OUTCOMES / GATE B ACTIVE-CURRENT`  
**Repository:** `ESTABLISHED — current physical truth belongs to repository inspection and Source 02/07`  
**Primary branch:** `main`  
**Governing charter:** `00_RSM_REBOOT_PROJECT_CHARTER.md`  
**Technology authority:** `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`  
**Roadmap authority:** `01_RSM_REBOOT_CANONICAL_ROADMAP.md`  
**Supersedes:** Live-status and active-scope interpretation of `05_RSM_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` from the 2026-07 pre-loss source set  
**Preserves:** Durable product identity, architectural lessons, scope protections, presentation direction, creator-workflow direction, data-safety rules, and controlled extensibility principles from the historical source set

---

## 1. Purpose

This document records the durable product and architecture decisions that must guide the RetroStage Maker reboot.

Its purpose is to prevent:

- scope creep,
- accidental reversal of settled product decisions,
- third-party libraries becoming hidden product authorities,
- historical implementation claims being treated as current repository truth,
- deferred features being pulled into an earlier milestone,
- roadmap entries being described as implemented capabilities,
- a focused creator drifting into a general-purpose engine,
- Babylon.js becoming the canonical scene model,
- Electron becoming gameplay or project authority,
- templates imposing one repeated visual identity on exported games,
- retro presentation being reduced to one post-process filter,
- runtime systems being planned without creator-facing authoring, validation, and debugging,
- external cinematic tools becoming core dependencies,
- AI, MCP, plugins, or file watchers bypassing typed commands and validation,
- public marketplace, DLC commerce, payment, or entitlement work becoming a hidden v0 requirement,
- unreviewed GitHub dependencies, native binaries, codecs, or WebAssembly modules entering commercial distribution,
- backup being claimed without a tested restore path.

This document is not:

- a live milestone tracker,
- a repository-state report,
- proof that a feature exists,
- a package manifest,
- a lockfile,
- a substitute for milestone contracts or validation evidence,
- a legal opinion,
- permission to implement deferred scope early.

A decision may be durable even when its implementation is deferred.

---

## 2. Historical Origin and Current Decision Boundary

At the original date of this source, the reboot was in this historical state:

```text
Project state: PRE-REPOSITORY / REBOOT PLANNING
Live repository: NONE
Implemented reboot milestones: NONE
Current source task: REBOOT SOURCE-SET RECONSTRUCTION
Approved product direction: AVAILABLE
Approved technology direction: Babylon.js 9 + Electron
Historical pre-loss sources: AVAILABLE FOR DESIGN EVIDENCE ONLY
```

Current lifecycle truth is `RSM-6 MILESTONE CLOSED / PASS`, with I1-I8 `CLOSED / ACCEPTED` and RSM-6-V1 `CLOSED / PASS`. The accepted implementation baseline is `dbd3f2be31d89ca36a17ccb4914e21623df424a2`; closure publication is `34b1148e1c7be12e30f1e962148d40b5027a7b07`; repository inspection and Source 02/08 govern physical truth. Only the specifically accepted RSM-6 outcomes recorded below are implementation facts. No other decision in this registry implies that milestone-gated product implementation exists.

No decision in this document proves that corresponding code, UI, tests, assets, packages, build artifacts, or exported games currently exist.

The pre-loss source set remains useful for:

- product intent,
- architectural lessons,
- known failure modes,
- previously explored workflow decisions,
- roadmap reconstruction.

It does not provide live implementation status for the reboot.

---

## 3. Source Authority Relationship

Use authority by question.

| Question | Authoritative source |
|---|---|
| What is RetroStage Maker and which rules may not silently change? | `00_RSM_REBOOT_PROJECT_CHARTER.md` |
| Which technologies and dependencies are approved? | `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md` |
| What is the long-term milestone order? | `01_RSM_REBOOT_CANONICAL_ROADMAP.md` |
| Which durable decisions are adopted, deferred, conditional, rejected, or superseded? | This document |
| What packages and ownership boundaries are planned or implemented? | `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md` plus repository inspection |
| How must work be audited, implemented, reviewed, validated, and committed? | `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md` |
| What currently exists? | Current repository, manifests, lockfiles, tests, artifacts, and inspected behavior |
| What is active now? | `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` and `08_RSM_REBOOT_CURRENT_MILESTONE.md` |
| What did the pre-loss project establish? | `09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md` and indexed historical sources |

### Conflict rule

If this decision registry conflicts with the charter, the charter wins.

If this decision registry names a dependency differently from the technology contract, the technology contract wins.

If this decision registry names milestone ownership differently from the canonical roadmap, the canonical roadmap wins.

If this document describes an implementation that is absent from the repository, repository truth wins for implementation status.

A durable decision may be changed only through explicit change control; it must not be silently bypassed by implementation convenience.

---

## 4. Decision Status Vocabulary

Each decision uses one of the following states.

### `ADOPTED`

A binding product or architecture rule.

### `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

The product direction is settled, but implementation belongs to a future milestone.

### `CONDITIONAL`

The direction is acceptable only after a named audit, contract, prototype, license review, or product gate.

### `DEFERRED`

Intentionally postponed. It must not enter an earlier milestone without formal roadmap change.

### `OUT OF SCOPE`

Not part of the v0 product target.

### `REJECTED`

Actively disallowed for the current architecture or commercial product direction.

### `SUPERSEDED`

Replaced by a newer approved decision.

### `OPEN`

Not yet decided and owned by a named future milestone or source.

### Interpretation rule

A physical package, folder, interface, type, button, placeholder, demo scene, or test stub does not prove a product capability is usable or closed.

---

# Product Identity Decisions

## 5. D-001 — RetroStage Maker Is a Focused Creator, Not a General-Purpose Engine

**Status:** `ADOPTED`

RetroStage Maker is a genre-first, presentation-aware, validation-driven desktop creator for small-to-medium stylized horror, mystery, liminal, survival-horror-inspired, and atmospheric narrative games.

It should prioritize:

- guided production,
- reliable authoring,
- practical genre workflows,
- constrained but expressive systems,
- creator-facing diagnosis,
- end-to-end standalone export,
- distinct project identity.

It must not attempt to match the unrestricted breadth of Unreal Engine, Unity, Godot, or another general-purpose engine.

### Consequence

Every proposed system must justify its value for supported creator profiles.

A technically interesting engine feature is not automatically RetroStage product scope.

### Roadmap ownership

- RSM-0
- RSM-19
- RSM-120

---

## 6. D-002 — RetroStage Maker Is an Independent Commercial Steam Product

**Status:** `ADOPTED`

RetroStage Maker is intended to be sold as an independent maker application through Steam and other approved Windows distribution channels.

The user-facing product must be RetroStage-owned in:

- terminology,
- navigation,
- project structure,
- Inspector behavior,
- hierarchy and content workflows,
- templates,
- validation,
- diagnostics,
- export experience,
- branding.

The supported workflow must not require the user to operate a Babylon, Godot, Stride, Unity, Unreal, or other third-party engine editor.

### Consequence

Third-party libraries may remain visible in license and notice documents, but they must not define the supported user experience.

### Roadmap ownership

- RSM-5
- RSM-9
- RSM-54
- RSM-102
- RSM-119
- RSM-120

---

## 7. D-003 — Supported v0 Presentation and Control Profiles

**Status:** `ADOPTED`

The intended v0 profiles are:

- Fixed Camera,
- TPS / Shoulder Camera,
- Top-Down,
- Isometric,
- Limited FPS.

Top-Down and Isometric mean:

- one directly controlled protagonist,
- exploration-oriented play,
- atmospheric presentation,
- no RTS-style unit selection or command system.

### Consequence

Camera, input, templates, validation, player UI, and export must eventually support these profiles without creating separate unrelated product architectures.

### Roadmap ownership

- RSM-19
- RSM-41
- RSM-42
- RSM-53
- RSM-55

---

## 8. D-004 — v0 Genre Focus

**Status:** `ADOPTED`

Primary v0 genres and experiences are:

- horror,
- survival-horror-inspired games,
- mystery,
- atmospheric narrative adventure,
- fixed-camera horror,
- constrained third-person exploration,
- limited first-person horror,
- top-down or isometric atmospheric exploration,
- liminal and uncanny-space experiences.

### Consequence

The product should first solve recurring creator problems such as:

- doors and keys,
- notes and readable content,
- dialogue and subtitles,
- interaction prompts,
- objectives and lightweight tasks,
- inventory puzzles,
- simple enemies and perception,
- scene transitions,
- looping or substituted spaces,
- camera composition,
- atmosphere and audio,
- retro presentation,
- diagnostics and export.

### Roadmap ownership

- RSM-37–55
- RSM-56–72
- RSM-108–111

---

## 9. D-005 — Explicitly Excluded v0 Product Types

**Status:** `OUT OF SCOPE`

The v0 target does not include:

- full RTS,
- colony simulation,
- multiplayer,
- MMO or live-service infrastructure,
- open-world streaming engine,
- base building,
- factory automation,
- multi-unit command,
- complex economy simulation,
- unrestricted physics sandbox,
- full general-purpose RPG framework,
- unrestricted procedural world generation,
- general non-Euclidean world engine,
- public marketplace or storefront,
- payment, entitlement, or DLC-commerce infrastructure.

### Consequence

A proposal in one of these areas requires explicit charter and roadmap change.

Installable templates, genre kits, presentation presets, sample projects, and content bundles may be supported without creating public commerce infrastructure.

---

## 10. D-006 — RSM-120 Is the Product North Star

**Status:** `ADOPTED`

The north star is:

```text
RSM-120 — Public Alpha / Investor Demo Maturity Gate
```

RSM-120 is an end-to-end product-quality gate.

It is not satisfied by:

- a long feature list,
- an editor-only prototype,
- a PIE-only demonstration,
- a repository that builds but cannot export,
- a visually coherent demo that cannot be saved, reopened, migrated, recovered, diagnosed, or packaged,
- runtime systems without usable authoring and validation.

### Consequence

Roadmap progress must be judged by product gates and representative workflows, not milestone count alone.

A separately accepted earlier paid Early Access release may provide commercial/customer evidence, but it does not satisfy, replace, or pre-close the RSM-120 maturity gate.

---

## 11. D-007 — Templates Provide Behavior, Not Mandatory Visual Identity

**Status:** `ADOPTED`

Templates, recipes, and genre kits may provide:

- component arrangements,
- gameplay contracts,
- validated defaults,
- scene structures,
- starter content,
- optional presentation presets.

They must not force every exported game to share the same:

- typography,
- UI layout,
- color language,
- camera grammar,
- audio identity,
- post-processing,
- VFX treatment,
- branding.

### Consequence

A template should shorten production while preserving project identity.

### Roadmap ownership

- RSM-53
- RSM-69
- RSM-108
- RSM-109
- RSM-110

---

## 12. D-008 — A Declared Type or Placeholder Is Not a Usable Product Feature

**Status:** `ADOPTED`

A component type, package, interface, document, UI control, runtime branch, placeholder, or isolated demo is not sufficient evidence that a feature exists as a usable creator capability.

A usable feature normally requires:

- canonical authoring data,
- creator-facing authoring,
- validation,
- runtime behavior,
- Preview/PIE/Export parity where applicable,
- save/reopen behavior,
- diagnostics,
- tests,
- milestone evidence.

### Consequence

Project reports must distinguish proposed, partial, integrated, validated, and closed states.

---

# Canonical Data, Identity, and Runtime Decisions

## 13. D-009 — Canonical Authoring Data Belongs to RetroStage Documents

**Status:** `ADOPTED`

Canonical project content belongs to explicit RetroStage-owned document families such as:

- `ProjectDocument`,
- `SceneDocument`,
- component instances,
- asset metadata documents,
- presentation documents,
- future approved UI, audio, sequence, Flow Graph, and gameplay documents.

Canonical data must not depend on:

- renderer object state,
- Electron window state,
- React component state,
- Zustand store state,
- SQLite rows,
- current selection,
- display names,
- array order,
- preview-only objects.

### Roadmap ownership

- RSM-7
- RSM-8
- RSM-29
- RSM-73
- RSM-94

---

## 14. D-010 — Babylon Renderer State Is Derived, Not Canonical

**Status:** `ADOPTED`

Babylon.js objects visualize authoring or runtime state.

They are not canonical owners of:

- project data,
- scene data,
- component data,
- stable identity,
- persisted references,
- project save,
- runtime save.

The approved direction is:

```text
RetroStage documents
→ validated projection
→ Babylon preview/runtime objects
```

### Consequence

Renderer state must be reconstructable from canonical documents.

Babylon scene serialization must not become the RetroStage project format.

### Roadmap ownership

- RSM-6
- RSM-13
- RSM-44
- RSM-55
- RSM-80

---

## 15. D-011 — Editor Preview, PIE, and Export Are Distinct Systems

**Status:** `ADOPTED`

- **Editor Preview** visualizes authoring data.
- **PIE** runs a disposable runtime session derived from canonical data.
- **Exported Runtime** is a standalone application with cooked content.

A feature working in one layer does not prove parity in the others.

### Consequence

Gameplay, camera, rendering, animation, sprites, VFX, audio, UI, and sequence behavior require explicit parity validation.

### Roadmap ownership

- RSM-16
- RSM-18
- RSM-55
- RSM-89
- RSM-103

---

## 16. D-012 — Project Save and Runtime Save Are Separate Systems

**Status:** `ADOPTED`

Project Save persists authoring content.

Runtime Save / Checkpoint persists approved player-progress state.

They must not share an undefined mixed storage model.

### Consequence

PIE stop must not commit arbitrary runtime mutations into authoring data.

Runtime save participation must be explicit and registry-based.

### Roadmap ownership

- RSM-14–15
- RSM-24
- RSM-65–66

---

## 17. D-013 — Stable IDs Are the Persistent Identity Authority

**Status:** `ADOPTED`

Persistent identity must use stable typed identifiers for approved project objects, including:

- projects,
- scenes,
- entities,
- components where required,
- assets,
- sequences,
- tracks and clips,
- variables,
- text entries,
- Flow Graph nodes where persisted.

Persistent references must not rely on:

- array position,
- display name,
- hierarchy position,
- renderer object identity,
- filesystem enumeration order.

### Roadmap ownership

- RSM-8
- RSM-22
- RSM-73
- RSM-106–107

---

## 18. D-014 — Typed Remapping Is Required

**Status:** `ADOPTED`

Duplication, prefab instantiation, import, merge, migration, archive restore, and external sequence interchange must use typed remapping rules.

### Consequence

String replacement across unknown JSON is not an acceptable reference-remapping strategy.

Unknown or unremappable references must produce diagnostics rather than silent corruption.

### Roadmap ownership

- RSM-8
- RSM-32
- RSM-58
- RSM-78
- RSM-107

---

## 19. D-015 — Persisted Schema Changes Require Explicit Migration

**Status:** `ADOPTED`

Every persisted document family must carry explicit schema/version identity.

Persisted schema changes require:

- version detection,
- explicit migration steps,
- validation before and after migration,
- failure reporting,
- backup or recovery protection before destructive conversion,
- migration fixtures.

### Consequence

TypeScript compile success does not replace persisted-data migration.

### Roadmap ownership

- RSM-8
- RSM-15
- RSM-30
- RSM-109
- RSM-116

---

## 20. D-016 — Safe Unknown Data Should Be Preserved

**Status:** `ADOPTED`

When a newer or optional field can be preserved safely without granting authority or executing unknown behavior, the system should prefer preservation over destructive loss.

### Consequence

Unknown data must be classified:

- safely preservable,
- unsupported but diagnosable,
- dangerous and rejected.

Round-trip preservation must not imply runtime execution.

---

## 21. D-017 — Dangerous Keys and Executable Unknowns Must Fail Closed

**Status:** `ADOPTED`

Unknown data must not be trusted when it can:

- influence prototype chains,
- escape a workspace boundary,
- request arbitrary files,
- execute code,
- activate unapproved plugin capabilities,
- bypass schema or command validation.

### Consequence

Dangerous keys, paths, commands, and executable payloads must fail closed with structured diagnostics.

### Roadmap ownership

- RSM-11
- RSM-26
- RSM-115
- RSM-117–119

---

## 22. D-018 — Canonical Mutation Uses One Typed Command Authority

**Status:** `ADOPTED`

Canonical project changes must pass through RetroStage-owned typed commands or approved transactions.

The same mutation path must be used by:

- Inspector edits,
- hierarchy actions,
- Guided Workspace,
- templates and recipes,
- import/reimport,
- undo/redo,
- future plugin actions,
- future agent/MCP operations.

### Consequence

React, Zustand, Babylon, file watchers, plugins, agents, and external tools may propose changes but may not write canonical files directly.

### Roadmap ownership

- RSM-10
- RSM-12
- RSM-31
- RSM-35
- RSM-118

---

## 23. D-019 — Runtime Systems Must Not Create Private Uncontrolled Loops

**Status:** `ADOPTED`

Runtime timing, pause, resume, start, stop, and system dispatch must remain centrally controlled.

Intended ownership:

- runtime lifecycle: runtime session,
- clock and scheduling: runtime framework,
- behavior modules: registered runtime systems,
- visual adaptation: Babylon adapter.

### Consequence

A subsystem must not silently create its own independent frame loop or untracked scheduler.

### Roadmap ownership

- RSM-16
- RSM-23
- RSM-24
- RSM-37

---

## 24. D-020 — Component Instances Remain in Scene Authoring Data

**Status:** `ADOPTED`

The component registry defines metadata, factories, policies, descriptors, and validation.

It does not replace component instances stored in canonical scene authoring data.

### Consequence

Registry metadata and scene instance data must remain distinct authorities.

### Roadmap ownership

- RSM-7
- RSM-12
- RSM-25

---

# Technology and Third-Party Decisions

## 25. D-021 — Babylon.js 9 Is the Sole Approved Renderer and Runtime Adapter

**Status:** `ADOPTED`

Babylon.js 9 is the only approved 3D rendering and runtime-adapter foundation for the reboot baseline.

It may provide:

- viewport rendering,
- cameras and camera-input primitives behind RetroStage controller semantics,
- materials,
- animation playback,
- particles,
- picking and gizmos,
- GPU execution,
- loaders,
- `AssetContainer`-based derived resource lifecycle,
- `UtilityLayerRenderer` and other editor-overlay/render-isolation primitives,
- `NullEngine` for headless adapter-conformance testing,
- `SceneInstrumentation` as a source for RetroStage-owned diagnostics snapshots,
- development-only Inspector UI/headless CLI diagnostics,
- Frame Graph facilities and later presentation backends,
- thin-instance/batching, selection visualization, capture, NodeMaterial, advanced materials, and VFX backends when their owning milestones justify them,
- runtime visual projection.

RetroStage should use these proven Babylon primitives when they reduce boilerplate and lifecycle bugs, but it may not delegate canonical product data or creator semantics.

The following authority separations are durable:

```text
Babylon Scene serialization != .rsmscene
Babylon node/object IDs != RetroStage stable IDs
Babylon picking != canonical selection authority
GizmoManager != command/mutation authority
AssetContainer != canonical asset document
NodeMaterial != canonical RetroStage material document
Frame Graph != canonical PresentationProfile
Babylon GUI != RetroStage editor UI authority
Babylon Flow Graph != RetroStage gameplay authority
Inspector/CLI mutation != RetroStage authoring authority
```

Data direction remains one-way by default:

```text
RetroStage canonical truth
→ validated renderer projection
→ Babylon derived runtime state
```

### Accepted RSM-6 outcome

The physical `@retrostage/renderer-babylon9` implementation now establishes the contract/public-entry foundation; one Engine/Scene/render-loop lifecycle with context safety; camera and editor-only grid controls; adapter-scoped handle epochs and pick intents; self-contained glTF 2.0/GLB `AssetContainer` ownership; real `NullEngine` headless conformance with frozen diagnostics; editor-only UtilityLayer/Gizmo intent ownership; and a real Electron `ViewportView`.

These are derived renderer capabilities. Picks do not mutate canonical selection; gizmos emit intent sequences and restore native baselines rather than committing canonical transforms; loaded handles share caller-supplied stable IDs; assets and Babylon objects remain disposable; diagnostics expose JSON-safe values rather than native objects. Canonical documents, commands, persistence, undo/redo, gameplay, player/export, product hierarchy/Inspector UI, advanced materials, and Frame Graph runtime remain deferred to their owning milestones.

### Consequence

Godot, Stride, Unity, Unreal, Bevy, Wicked Engine, or a second renderer must not be added to the same baseline architecture without formal replacement decision.

### Roadmap ownership

- RSM-6
- RSM-44
- RSM-55
- RSM-80
- RSM-103

---

## 26. D-022 — Electron Is the Sole Desktop Application Shell for the Reboot Baseline

**Status:** `ADOPTED`

Electron is the approved desktop shell for:

- application windows,
- process lifecycle,
- native dialogs,
- filesystem mediation,
- approved worker or child-process orchestration,
- packaging hooks,
- the initial editor and minimal v0 player applications.

Electron is not:

- canonical project authority,
- gameplay authority,
- validation authority,
- asset identity authority.

### Consequence

Main, Preload, and Renderer boundaries must remain explicit and secured.

### Roadmap ownership

- RSM-5
- RSM-18
- RSM-26
- RSM-92
- RSM-96

---

## 27. D-023 — TypeScript Is the Primary Product Language

**Status:** `ADOPTED`

The reboot baseline uses TypeScript for:

- domain models,
- canonical documents,
- validation and migrations,
- commands,
- Electron application code,
- React editor UI,
- Babylon adapters,
- asset pipeline orchestration,
- tests and tooling.

### Consequence

A second implementation language must not be introduced merely for preference.

Native or WebAssembly components may enter only through approved dependencies and adapter boundaries.

---

## 28. D-024 — The Approved Editor UI Foundation Is React-Based and RetroStage-Branded

**Status:** `ADOPTED`

The baseline editor UI uses:

- React,
- Radix UI primitives,
- Golden Layout,
- react-window,
- CSS variables,
- CSS Modules,
- RetroStage-owned design tokens and components.

### Consequence

A third-party component library may provide behavior but must not define RetroStage's visual identity.

Golden Layout state remains editor-local layout state, not project content.

### Roadmap ownership

- RSM-9
- RSM-25
- RSM-33
- RSM-35
- RSM-54

---

## 29. D-025 — Third-Party Components Accelerate Work but Never Become Product Authorities

**Status:** `ADOPTED`

Third-party components may act as:

- engine adapters,
- editor infrastructure,
- pipeline accelerators,
- development tools,
- quality and compliance tools.

They may not silently own:

- canonical documents,
- stable identity,
- command semantics,
- validation truth,
- capability truth,
- gameplay rules,
- project save,
- runtime save,
- product branding.

### Consequence

Every dependency requires an owner, purpose, adapter boundary, classification, and removal strategy.

---

## 30. D-026 — Dependency Admission Uses Explicit Classes and Exact Version Control

**Status:** `ADOPTED`

Approved dependency classes are:

- `FOUNDATION_RUNTIME`,
- `FOUNDATION_EDITOR`,
- `FOUNDATION_BUILD`,
- `MILESTONE_GATED`,
- `CONDITIONAL_AUDIT`,
- `DEVELOPMENT_ONLY`,
- `NOT_BASELINE`,
- `REJECTED`.

Production and build dependencies must use exact approved versions and a committed lockfile.

### Consequence

A dependency is not admitted because it is popular, useful, or available on GitHub.

It must pass the technology contract's admission workflow.

### Roadmap ownership

- RSM-1
- RSM-3
- RSM-113
- RSM-119

---

## 31. D-027 — SQLite Is a Rebuildable Local Index, Not Canonical Project Storage

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

`better-sqlite3` may be introduced at its owning milestone for:

- Content Browser indexing,
- search,
- reference queries,
- asset usage,
- import history,
- diagnostic caches.

SQLite must remain disposable and rebuildable from canonical project sources.

### Consequence

Deleting the local index must not destroy the project.

### Roadmap ownership

- RSM-33
- RSM-74
- RSM-77–78

---

## 32. D-028 — Native and WebAssembly Dependencies Require Separate Binary Inventory

**Status:** `ADOPTED`

A package's JavaScript license is not sufficient evidence for bundled native or WebAssembly artifacts.

Every distributed native/WASM component requires:

- exact file inventory,
- source and version,
- license verification,
- notices,
- architecture/platform mapping,
- hash or provenance evidence,
- update and removal path.

### Consequence

Havok, SQLite native modules, codecs, compression tools, and future SDK binaries receive additional review.

---

## 33. D-029 — KTX, Basis, Draco, FFmpeg, Codec, and Media Tools Are Conditional

**Status:** `CONDITIONAL`

KTX-Software, `toktx`, Basis Universal tools, Draco binaries, FFmpeg, codec-enabled builds, and arbitrary media converters are not baseline dependencies.

They may enter only after their owning milestone proves:

- exact binary/subcomponent identity,
- license compatibility,
- patent and codec risk review where relevant,
- deterministic output,
- fallback behavior,
- source preservation,
- quality value.

### Consequence

No milestone may package a downloaded converter binary merely because it solves an import problem.

### Roadmap ownership

- RSM-76
- RSM-79
- RSM-95
- RSM-119

---

## 34. D-030 — Commercial License Policy Is Allowlist-Driven

**Status:** `ADOPTED`

Permissive license families may be admitted through the technology contract, including approved MIT, Apache-2.0, BSD, ISC, Zlib, 0BSD, and CC0/public-domain cases.

Manual review is required for:

- MPL,
- LGPL,
- EPL,
- CDDL,
- mixed licenses,
- custom licenses,
- source-available licenses,
- font and asset-specific licenses,
- patent-sensitive components.

The following are rejected by default for proprietary commercial distribution without explicit legal approval:

- GPL,
- AGPL,
- SSPL,
- Non-Commercial,
- No-Derivatives,
- Commons Clause,
- Business Source License,
- PolyForm restrictions,
- unknown or missing license.

### Consequence

Public GitHub availability is not permission to copy, modify, or distribute code.

---

## 35. D-031 — Editor and Exported Player Are Separate Applications

**Status:** `ADOPTED`

The product must maintain separate application targets:

```text
RetroStage Editor
RetroStage Player
```

The player must not include:

- editor UI,
- authoring tools,
- source assets when cooked derivatives are sufficient,
- Babylon Inspector,
- development-only dependencies,
- unnecessary Electron privileges.

### Consequence

The initial player may use Electron, but it must remain minimal and independently packaged.

A future native player replacement is not baseline scope and requires evidence that Electron player cost is commercially unacceptable.

### Roadmap ownership

- RSM-18
- RSM-94–96
- RSM-102–103

---

## 36. D-032 — Early Standalone Export and Clean-Machine Proof Are Mandatory

**Status:** `ADOPTED`

Standalone export is not a late-stage polish task.

The opening vertical slice must prove:

```text
Create
→ Edit
→ Save
→ Close
→ Reopen
→ PIE
→ Export
→ Run on a clean supported machine
```

### Consequence

Roadmap progress cannot claim a secure vertical slice until the exported player and restore path are tested.

### Roadmap ownership

- RSM-18
- RSM-55
- RSM-103

---

# Authoring, Workflow, Validation, and Safety Decisions

## 37. D-033 — Workspace Modes Share One Canonical Project Model

**Status:** `ADOPTED`

Classic, Guided, and future Custom workspace modes are different authoring lenses over the same project model.

They are not separate project formats or runtimes.

### Consequence

A project must remain editable across supported workspace modes without destructive conversion.

### Roadmap ownership

- RSM-35
- RSM-54

---

## 38. D-034 — Creator Stages Are Lenses, Not Mandatory Gates

**Status:** `ADOPTED`

Creator stages such as Project, Template, Story, Blockout, Gameplay, Atmosphere, Test, and Export may guide the user.

They must not impose a rigid one-way wizard that prevents expert navigation or hides canonical state.

### Consequence

Stage readiness may warn and guide, but it must not invent a second project model.

---

## 39. D-035 — Guided Workflow Uses the Same Commands and Validation

**Status:** `ADOPTED`

Guided authoring must use the same:

- component registry,
- typed commands,
- validation,
- undo/redo,
- save model,
- capability matrix

as Classic authoring.

### Consequence

Guided mode must not become an untested shortcut that writes special hidden state.

---

## 40. D-036 — Inspector Binding Must Be Registry-Driven

**Status:** `ADOPTED`

Inspector behavior should be derived from approved component metadata, descriptors, policies, candidate values, and typed edit intents.

It should not remain a scattered type-name switch across unrelated UI files.

### Consequence

New component support must be reviewable through one registry/descriptor contract rather than repeated editor branches.

### Roadmap ownership

- RSM-12
- RSM-25

---

## 41. D-037 — Validation Truth Must Be Centralized

**Status:** `ADOPTED`

Validation must produce structured, stable diagnostics used consistently by:

- Inspector,
- Problems panel,
- Guided readiness,
- PIE start gates,
- export gates,
- Project Doctor,
- runtime diagnostics,
- future agent/MCP actions.

### Consequence

Each UI surface must not invent its own truth about whether a project is valid.

### Roadmap ownership

- RSM-12
- RSM-25
- RSM-52
- RSM-70
- RSM-101
- RSM-112

---

## 42. D-038 — Capability Truth Must Not Be Inferred From Visible UI

**Status:** `ADOPTED`

A visible button, panel, component option, or template does not prove that the selected game profile, runtime, export target, or content tier supports the feature.

Capability truth must be explicit and queryable.

### Consequence

Unsupported behavior must be hidden, disabled with explanation, or reported through structured diagnostics.

### Roadmap ownership

- RSM-19
- RSM-25
- RSM-54
- RSM-101

---

## 43. D-039 — Undo / Redo Must Reuse Canonical Commands

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Undo/redo must record approved canonical commands or transactions rather than UI-local snapshots that bypass validation.

### Consequence

External reloads, imports, and non-reversible operations require explicit history policy.

### Roadmap ownership

- RSM-31

---

## 44. D-040 — External File Changes Require Reviewable Reload Direction

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

File watchers may detect external changes, but detection must not directly overwrite in-memory canonical state.

Approved direction:

```text
Filesystem event
→ debounce
→ inspect/hash
→ diff or reload proposal
→ validation
→ user or policy decision
→ canonical command/transaction
```

### Consequence

Chokidar is an observer, not mutation authority.

### Roadmap ownership

- RSM-32
- RSM-77–78

---

## 45. D-041 — Authoring Data Safety Includes Atomic Save, Autosave, and Recoverable Local History

**Status:** `ADOPTED`

Data safety requires:

- atomic or interruption-resilient save,
- explicit dirty-state handling,
- local autosave or snapshot support,
- recovery candidates,
- migration backup,
- off-device source/remote protection,
- restore testing.

### Consequence

Autosave must not silently overwrite explicit user saves.

A backup is not proven until restore succeeds.

### Roadmap ownership

- RSM-3
- RSM-14–15
- RSM-114
- RSM-119

---

## 46. D-042 — Search and Indexes Are Derived Views

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Global search, reference browser, asset usage, and Content Browser indexes may use derived caches.

They must remain rebuildable from canonical sources.

### Consequence

Index corruption may degrade convenience, but it must not destroy project truth.

### Roadmap ownership

- RSM-33
- RSM-74
- RSM-77

---

# Gameplay, Camera, Liminal, and Runtime Decisions

## 47. D-043 — Camera Authoring Is a First-Class Survival-Horror Workflow

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Camera support must include creator-facing authoring for:

- profile selection,
- placement,
- activation zones,
- priorities,
- cut/blend behavior,
- framing guides,
- composition diagnostics,
- Preview/PIE/Export parity.

### Consequence

Runtime camera classes alone do not satisfy the feature.

### Roadmap ownership

- RSM-41–42
- RSM-55

---

## 48. D-044 — Liminal and Uncanny-Space Creation Is a Supported Genre Direction

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

RetroStage should support bounded liminal workflows such as:

- repeated rooms and corridors,
- modular transitional architecture,
- controlled variation,
- anomaly states,
- section substitution,
- looping routes,
- impossible-transition illusions,
- return-path mutation,
- continuity-preserving teleport techniques.

### Consequence

This does not authorize a general-purpose non-Euclidean world engine or unrestricted procedural generation.

### Roadmap ownership

- RSM-40
- RSM-57
- RSM-64
- RSM-108

---

## 49. D-045 — Physics Interaction Is Constrained, Not a General Sandbox

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Supported physics interaction should focus on creator-relevant bounded behaviors such as:

- doors,
- drawers,
- carry/drop,
- pushable props,
- kinematic platforms,
- controlled impulses,
- limited breakables,
- triggers and queries.

### Consequence

The product does not promise unrestricted physics simulation or arbitrary user-authored solver behavior.

### Roadmap ownership

- RSM-17
- RSM-28
- RSM-51

---

## 50. D-046 — Gameplay Recipes Must Be Constraint-Aware

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Gameplay recipes may package validated combinations of:

- components,
- events/actions,
- variables,
- assets,
- camera assumptions,
- UI requirements,
- diagnostics.

### Consequence

Recipes must state supported profiles and must not hide unsupported dependencies.

### Roadmap ownership

- RSM-53
- RSM-69
- RSM-108–110

---

## 51. D-047 — Creator-Facing Runtime Debugging Is a Core Product Capability

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

RetroStage must eventually expose creator-readable runtime information for:

- entities and components,
- variables,
- events/actions,
- camera state,
- triggers,
- objectives,
- AI and perception,
- animation,
- audio,
- VFX,
- Flow Graph execution,
- sequence tracks.

### Consequence

Engine logs alone are not an adequate creator debugging experience.

### Roadmap ownership

- RSM-68
- RSM-70
- RSM-98–99
- RSM-105
- RSM-112

---

## 52. D-048 — Runtime Settings Use the Same Player-UI and Accessibility Foundations

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Display, audio, input, subtitle, accessibility, and project settings should be represented through shared typed runtime settings and player UI foundations.

### Consequence

Each exported project should not require an unrelated settings implementation.

### Roadmap ownership

- RSM-24
- RSM-67
- RSM-87–88
- RSM-119

---

# Presentation, Asset, Animation, VFX, Audio, and UI Decisions

## 53. D-049 — Retro Presentation Is a Multi-Layer Production System

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Retro presentation includes coordinated choices across:

- internal resolution,
- upscale behavior,
- geometry treatment,
- texture filtering and mip policy,
- palette and dithering,
- materials and shading,
- lighting and fog,
- post-processing,
- camera,
- animation,
- sprites and flipbooks,
- VFX,
- audio,
- player UI.

### Consequence

RetroStage must not reduce retro identity to one mandatory CRT filter.

### Roadmap ownership

- RSM-43–45
- RSM-76
- RSM-83–89

---

## 54. D-050 — Texture Sources, Import Semantics, and Runtime Derivatives Are Separate

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Texture workflows must distinguish:

- original source images,
- import semantics and creator settings,
- atlas/slice metadata,
- stable image or slice identity,
- cooked runtime derivatives,
- compatibility fallbacks.

### Consequence

Reimport or compression must not destroy source ownership or silently change visual meaning.

### Roadmap ownership

- RSM-73
- RSM-76–78
- RSM-80
- RSM-94–95

---

## 55. D-051 — Content Browser and Asset Placement Are Core Creator Workflows

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

The creator needs first-class workflows for:

- folders and collections,
- filters and search,
- thumbnails,
- source/cooked status,
- license/provenance metadata,
- usage and references,
- drag-and-drop placement,
- reimport and diagnostics.

### Consequence

A raw filesystem picker is not sufficient as the long-term asset workflow.

### Roadmap ownership

- RSM-73–78

---

## 56. D-052 — Skeletal, Sprite, Flipbook, and VFX Workflows Are First-Class

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

RetroStage should support representative production workflows for:

- skeletal animation,
- sprite sheets,
- billboards,
- directional sprites,
- flipbooks,
- frame events,
- sprite and mesh particles,
- decals and cards,
- screen effects,
- deterministic VFX seeds where required.

### Consequence

These systems require authoring, preview, runtime, export, validation, and budget support.

### Roadmap ownership

- RSM-84–86
- RSM-89

---

## 57. D-053 — Audio Is a First-Class Horror and Atmosphere System

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Audio is not a late polish layer.

The product direction includes:

- source import,
- loop metadata,
- 2D and 3D playback,
- ambience,
- fades,
- buses and mixer snapshots,
- music states,
- spatial zones,
- occlusion where supported,
- streaming and runtime budgets,
- Preview/PIE/Export behavior.

### Consequence

Audio authoring and diagnostics must be designed with horror and atmosphere workflows in mind.

### Roadmap ownership

- RSM-45
- RSM-79
- RSM-88–89

---

## 58. D-054 — Player UI Must Support Distinct Project Design Languages

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Player UI must support project-specific:

- typography,
- layout,
- color and tokens,
- HUD composition,
- menus,
- prompts,
- subtitles,
- focus and controller navigation,
- accessibility settings,
- diegetic or non-diegetic presentation.

### Consequence

RetroStage may provide defaults and recipes, but exported games must not be forced into one house UI.

### Roadmap ownership

- RSM-48
- RSM-67
- RSM-87
- RSM-119

---

## 59. D-055 — Text Identity Must Be Localization-Ready Before Full Localization

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Narrative and UI text should use stable text identity and string-table-compatible references before full localization implementation.

### Consequence

Display text should not become the only persistent identity for dialogue, subtitles, objectives, UI labels, or readable content.

### Roadmap ownership

- RSM-47–48
- RSM-87
- RSM-119

---

# No-Code, Sequencing, Interchange, and Extensibility Decisions

## 60. D-056 — Flow Graph Is Deferred but Uses the Shared Event/Action Registry

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Flow Graph will provide bounded no-code gameplay logic after the typed Event/Action registry, variables, runtime systems, validation, and debugging foundations exist.

It must not create a second incompatible gameplay semantics layer.

### Consequence

React Flow may provide graph-editor interaction, but RetroStage owns:

- node types,
- execution,
- serialization,
- validation,
- budgets,
- debugging,
- migration.

### Roadmap ownership

- RSM-37
- RSM-104–105

---

## 61. D-057 — Native Cinematic Authoring Is Core; External Tools Are Optional

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

RetroStage must provide native timeline/sequencer authoring for supported:

- camera,
- transform,
- animation,
- audio,
- dialogue and subtitle,
- VFX,
- lighting,
- material and post-process,
- UI,
- scene visibility,
- Event/Action tracks.

The representative RSM-120 project must be producible without an external cinematic-authoring product.

### Consequence

Core cutscene production cannot depend on a hypothetical or external companion application.

### Roadmap ownership

- RSM-106

---

## 62. D-058 — The Historical Mnemos Studio Assumption Is Removed

**Status:** `SUPERSEDED`

The pre-loss roadmap assumption named “Mnemos Studio” is not part of the reboot product, technology stack, package plan, or active roadmap.

The real requirement previously represented by that name is split into:

1. native RetroStage sequencing,
2. optional generic cinematic sequence interchange.

### Consequence

No source may reintroduce Mnemos Studio as a required dependency, package, roadmap product, or future deliverable without an entirely new approved product decision.

### Replacement ownership

- RSM-106 — Native Cutscene / Timeline Runtime and Sequencer
- RSM-107 — Cinematic Sequence Interchange / External Timeline Import-Export

---

## 63. D-059 — External Cinematic Interchange Is Generic, Optional, and Validated

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

External timeline or cinematic exchange may be supported through a generic contract with:

- stable sequence, track, clip, and marker IDs,
- time-base conversion,
- typed track mapping,
- import preview,
- unsupported-data diagnostics,
- reference remapping,
- provenance,
- explicit round-trip policy.

### Consequence

No specific external format or library is approved until RSM-107 audit proves mapping value, license suitability, and safe round-trip behavior.

External files never become direct canonical authority.

---

## 64. D-060 — Installable Content Bundles Are Supported; Marketplace and DLC Commerce Are Not v0 Requirements

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

RetroStage may support installable:

- templates,
- genre kits,
- presentation profiles,
- sample projects,
- approved asset or content packs.

The v0 product does not require:

- a public storefront,
- creator payments,
- entitlements,
- DLC commerce,
- seller accounts,
- marketplace moderation.

### Roadmap ownership

- RSM-108–110

---

## 65. D-061 — Plugin SDK Is Deferred Until Core Product Boundaries Are Stable

**Status:** `DEFERRED`

Plugin and SDK work must not begin before:

- canonical commands,
- validation,
- permissions,
- package boundaries,
- project compatibility,
- recovery,
- security,
- release evidence

are stable enough to support third-party extension.

### Consequence

A plugin may not receive arbitrary Electron, Node, filesystem, renderer, or canonical-write access by default.

### Roadmap ownership

- RSM-117

---

## 66. D-062 — MCP and AI Integration Is Deferred and Controlled

**Status:** `DEFERRED`

MCP or agent integration must begin with read-only or diagnostic capabilities and later use:

- typed commands,
- explicit scope,
- capability checks,
- dry-run or preview,
- validation,
- approval,
- undo/rollback,
- provenance,
- trust boundaries.

### Consequence

An agent must not receive unrestricted filesystem or canonical-file writes merely because it can connect to the editor.

### Roadmap ownership

- RSM-118

---

# Reliability, Compatibility, Privacy, and Commercial Decisions

## 67. D-063 — Project Doctor and Creator-Facing Repair Guidance Are Product Features

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Validation should evolve into a creator-facing Project Doctor that explains:

- what is wrong,
- why it matters,
- which workflow is blocked,
- how to repair it,
- whether automatic repair is safe,
- whether the problem affects Preview, PIE, Export, or compatibility.

### Consequence

Raw exceptions and console logs are not sufficient release diagnostics.

### Roadmap ownership

- RSM-25
- RSM-70
- RSM-101
- RSM-112

---

## 68. D-064 — Golden Projects and Deterministic Fixtures Are Required

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Representative projects and deterministic fixtures must cover:

- known-valid and known-invalid canonical documents,
- corrupt/truncated save or project cases,
- schema migrations and future-version rejection,
- stable-ID/reference preservation and remapping,
- deterministic save/reload round trips,
- renderer-adapter projection/lifecycle/disposal conformance,
- camera profiles,
- interaction,
- objectives and inventory,
- AI and perception,
- liminal flow,
- save/restore,
- assets,
- presentation,
- animation and VFX,
- audio,
- UI,
- Flow Graph,
- sequences,
- export.

The Golden Fixture Corpus is a versioned RetroStage-owned test asset, not a third-party dependency. A deterministic round-trip harness must support:

```text
load
→ parse
→ canonical model
→ save
→ reload
→ semantic/byte-policy comparison
```

An Adapter Conformance Kit should standardize checks that renderer/importer/exporter adapters preserve stable IDs, obey canonical authority boundaries, avoid derived-state leakage, and dispose resources correctly.

Property-based testing may supplement this corpus when generated inputs find classes of edge cases that fixed fixtures cannot efficiently enumerate.

### Consequence

Regression evidence must use product-representative fixtures, deterministic round-trip checks, and adapter-boundary tests rather than only isolated unit tests.

### Roadmap ownership

- RSM-6–8
- RSM-30
- RSM-112–113

---

## 69. D-065 — Compatibility Requires Explicit Policy and Migration Guarantees

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

RetroStage must eventually state:

- which project versions can be opened,
- when automatic migration is allowed,
- when a backup is required,
- which features are deprecated,
- how templates and packs declare compatibility,
- how rollback or recovery works.

### Roadmap ownership

- RSM-109
- RSM-116

---

## 70. D-066 — Telemetry and Crash Reporting Are Opt-In and Privacy-Governed

**Status:** `CONDITIONAL`

No network telemetry or hosted crash reporting is approved by default.

If introduced, it requires:

- explicit user choice,
- clear data categories,
- minimization,
- retention policy,
- endpoint and vendor review,
- security review,
- license and cost review,
- local disable controls.

### Consequence

OpenTelemetry core instrumentation may be used locally at RSM-82 for diagnostic spans and measurements without authorizing data transmission. Any remote exporter, hosted collector, or network telemetry path remains conditional and belongs to the privacy-governed RSM-115 decision.

### Roadmap ownership

- RSM-82 — Editor Performance Profiling / Slow Operation Detector (local-only instrumentation)
- RSM-115 — Telemetry / Crash Report / Feedback Privacy Contract (remote telemetry and hosted crash reporting)

---

## 71. D-067 — Steam Is a Distribution Layer, Not Canonical Product Authority

**Status:** `ADOPTED`

Steam may distribute the maker and optionally support approved Steam-specific runtime features.

Core project data and exported games must not require Steam solely to exist or run unless the creator explicitly enables a Steam-dependent feature.

### Consequence

Steamworks SDK is conditional and must not enter the baseline before exact feature, license, redistributable, secrets, and packaging review.

### Roadmap ownership

- RSM-92
- RSM-102
- RSM-119

---

## 72. D-068 — Asset Licenses Are Separate From Software Dependency Licenses

**Status:** `ADOPTED`

The license of a library does not grant rights to:

- imported meshes,
- textures,
- audio,
- fonts,
- sample projects,
- templates,
- bundled media,
- marketplace or user-supplied content.

### Consequence

Asset registry and content-pack workflows must record source, provenance, usage terms, attribution, and redistribution limits where applicable.

### Roadmap ownership

- RSM-73
- RSM-79
- RSM-108–110
- RSM-119

---

## 73. D-069 — Reproducible Build, SBOM, Notices, and Binary Inventory Are Release Requirements

**Status:** `ADOPTED`

Release readiness requires:

- exact dependency versions,
- committed lockfiles,
- reproducible bootstrap instructions,
- SBOM,
- third-party notices,
- native/WASM inventory,
- installer contents,
- clean build evidence,
- packaged-artifact license scan,
- restore verification.

### Consequence

A passing development build is not sufficient commercial release evidence.

### Roadmap ownership

- RSM-3
- RSM-102
- RSM-113
- RSM-119

---

## 74. D-070 — Security and Workspace Trust Are Product Requirements

**Status:** `ADOPTED`

RetroStage must treat projects, packs, plugins, imported files, paths, and IPC requests as potentially untrusted until validated.

Required direction includes:

- Electron context isolation,
- narrow preload APIs,
- no raw Node exposure,
- path and workspace validation,
- sender validation,
- schema validation,
- sandboxing where practical,
- permissioned plugins,
- safe archive extraction,
- no arbitrary command execution.

### Roadmap ownership

- RSM-5
- RSM-11
- RSM-26
- RSM-117–119

---

## 75. D-071 — Minimum Hardware and Compatibility Profiles Are Explicit

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

RetroStage must eventually define:

- minimum and recommended editor hardware,
- minimum exported-player hardware,
- WebGPU/WebGL or renderer fallback policy,
- texture and memory tiers,
- audio and post-process budgets,
- compatibility warnings.

### Consequence

“Works on the developer machine” is not a product compatibility policy.

### Roadmap ownership

- RSM-71
- RSM-81–82
- RSM-90
- RSM-103

---

## 76. D-072 — Commercial Release Readiness Includes Onboarding and Accessibility

**Status:** `ADOPTED DIRECTION; IMPLEMENTATION DEFERRED`

Public Alpha readiness includes more than technical packaging.

It must include representative:

- onboarding,
- documentation,
- sample projects,
- localization-ready UI,
- subtitles,
- font fallback,
- UI scaling,
- contrast and reduced-motion options,
- controller navigation,
- safe defaults,
- repair guidance.

### Roadmap ownership

- RSM-48
- RSM-54
- RSM-87
- RSM-119–120

---

## 77. D-073 — Commercial Creator Rights / Zero Engine Royalty

**Status:** `ADOPTED PRODUCT POLICY`

Creators may commercially distribute games exported from RetroStage Maker.

The RetroStage engine/editor royalty on creator game revenue is `0%`.

There is no per-export or per-game fee and no creator-revenue cap.

Exported games must not require an always-online RetroStage licensing phone-home merely to run.

Creator obligations for separately licensed third-party assets and content remain separate. Final EULA and store terms must implement this product policy consistently, and RetroStage cannot waive rights held by third-party asset or dependency licensors.

### Consequence

Commercial rights for creator exports do not authorize a marketplace, payment backend, DLC commerce platform, or seller-account system in v0. This decision is consistent with D-005, D-060, D-067, D-068, and D-072.

### Roadmap ownership

- RSM-93-ADD1
- RSM-119-ADD1
- RSM-120

---

## 78. D-074 — Creator Owns Exported Game and Creator Revenue

**Status:** `ADOPTED PRODUCT POLICY`

Creators retain ownership of their original project/game content and exported-game intellectual property to the extent they own those inputs.

Creators retain revenue generated by their games.

RetroStage retains ownership of the RetroStage Maker product and its own technology and assets.

Third-party assets, fonts, audio, libraries, SDKs, and trademarks remain governed by their own rights.

Exported-game metadata must distinguish creator and publisher identity from RetroStage editor identity.

### Consequence

Creator ownership does not transfer RetroStage technology or third-party rights and does not create commerce infrastructure excluded by D-005 or D-060.

### Roadmap ownership

- RSM-93
- RSM-93-ADD1
- RSM-119-ADD1

---

## 79. D-075 — RetroStage Branding Is Not Mandatory in Exported Games

**Status:** `ADOPTED PRODUCT POLICY`

Exported games require:

- no mandatory RetroStage splash screen;
- no mandatory RetroStage logo or watermark;
- no forced visible “Made with RetroStage” player-facing branding.

An optional creator-selected RetroStage credit is allowed.

Legally required third-party notices and credits remain mandatory where applicable. Removing mandatory product branding must not remove required software or asset-license notices.

### Consequence

Export identity remains creator-owned while license compliance remains intact.

### Roadmap ownership

- RSM-93-ADD1
- RSM-95
- RSM-119

---

## 80. D-076 — Paid Alpha / Early Access Entitlement Continues Through 1.0

**Status:** `ADOPTED COMMERCIAL DIRECTION`

A purchaser of the same paid RetroStage Maker product/SKU during paid Alpha or Early Access should not be required to repurchase merely because that product reaches `1.0`.

Storefront, account, and platform terms remain applicable.

This decision does not promise free future major editions, unrelated products, optional content, or services.

Exact Early Access duration and exact price are not fixed here.

### Consequence

Entitlement continuity is a same-product/SKU policy direction, not a perpetual entitlement for every future RetroStage offering.

### Roadmap ownership

- RSM-119-ADD1
- RSM-120

---

## 81. D-077 — Exact Pricing and Promotion Values Are Release-Time Commercial Evidence

**Status:** `ADOPTED BOUNDARY`

Do not encode the following as architecture, file-format, entitlement-engine, or roadmap invariants:

```text
exact retail price
exact Early Access price
exact launch discount
exact discount percentage
exact regional price table
fixed wishlist target
fixed Early Access duration
```

Those values require contemporaneous commercial and store evidence near their owning release milestone.

### Consequence

Mutable commercial evidence cannot silently become a durable technical constant.

### Roadmap ownership

- RSM-119-ADD1
- RSM-120

---

## 82. D-078 — Export Legal / Credits Metadata Is First-Class Project Data

**Status:** `ADOPTED ARCHITECTURE DIRECTION; IMPLEMENTATION DEFERRED`

Project-owned canonical metadata direction must support at least:

- game title and version;
- creator/developer identity;
- publisher identity where applicable;
- copyright and legal text;
- optional website and contact fields;
- optional creator-defined credits;
- asset/content attribution records where project-owned;
- generated third-party software notices kept distinguishable from creator-authored credits;
- localization-safe legal and credit text references.

RetroStage must not be hardcoded as the exported-game developer or publisher.

### Consequence

Export identity/legal data becomes canonical project truth while generated compliance notices remain separately attributable.

### Roadmap ownership

- RSM-93
- RSM-93-ADD1
- RSM-95
- RSM-119

---

## 83. D-079 — Localization-Safe Architecture Precedes Translation

**Status:** `ADOPTED ARCHITECTURE DIRECTION; IMPLEMENTATION DEFERRED`

Before broad translation work, product contracts must be designed for:

- stable string identity;
- source locale and fallback;
- Unicode normalization policy;
- grapheme-aware behavior;
- combining marks and emoji;
- CJK text and line-breaking direction;
- long-text expansion such as German/French fixtures;
- font fallback and missing-glyph diagnostics;
- IME-safe text entry direction;
- RTL/Bidi readiness direction;
- pseudo-localization;
- layout overflow diagnostics;
- copy, paste, and selection semantics where applicable.

RSM-48 owns the localization-ready identity and fixture contract. Later UI/runtime implementation remains owned by relevant milestones such as RSM-87 and RSM-119.

Exact shipped-language lists and localization rollout waves remain open commercial/product decisions.

### Consequence

Localization-safe contracts precede translation without prematurely selecting languages, rollout waves, or a complete UI implementation.

### Roadmap ownership

- RSM-48
- RSM-87
- RSM-119–120

---

# Post-RSM-6 / Pre-RSM-7 Alignment Amendments and Durable Decisions

## 84. Binding Extensions to Existing Decisions

The following are semantic extensions to already-adopted decisions; they do not create duplicate authorities.

### D-012 extension — runtime save stores semantic progress

Runtime Save participation for story state, objectives, inventory/item state, enemy/encounter state, dynamic atmosphere state, and similar systems must be explicit. Runtime Save persists approved semantic state through stable RetroStage identities/contracts, not Babylon/Havok/Recast/UI object graphs. Transient runtime implementation state is reconstructed.

### D-024 extension — persistent/resettable workspace remains local

Supported dock/tab/resize workspace layout may persist locally between editor sessions and may be reset to an approved default. These changes remain editor preference state, do not mark projects dirty, and do not mutate canonical documents, command history, PIE/runtime state, or exported content. Detached native-window/multi-monitor layout is not implied.

### D-048 / D-071 / D-072 extension — creator intent, quality, accessibility and comfort stay separate

Shared typed runtime settings are the authority for supported player-facing display/audio/input/presentation quality and accessibility/comfort overrides. Creator defaults/bounds remain project-owned where applicable. Hardware/quality fallback must be declared and diagnosable; it may not silently disable creator-locked semantic requirements while claiming parity. Atmosphere/presentation systems must participate in reduced-motion/flicker/comfort policy where relevant.

### D-049 / D-050 / D-052 / D-053 extension — one coordinated presentation system

`PresentationProfile` is the single canonical game-presentation authority. Visual Rawness is a controlled dimension of that model, not a second profile authority. Geometry/texture/material/raster/temporal character, atmosphere volumes/director, surface storytelling, ambient motion, VFX and audio remain coordinated authored semantics with non-destructive source/derivative separation and explicit Preview/PIE/Export responsibilities.

### D-054 extension — Player UI presents meaning, it does not own gameplay

Player UI may bind project-specific typography/layout/tokens/HUD/menus/prompts/subtitles/dialogue/frontend/accessibility, but UI widget/React/Zustand state does not become gameplay authority. Dialogue content/text identity and dialogue presentation remain separate contracts. Creator style is the default; bounded player readability/accessibility overrides may take precedence where the owning runtime-settings policy allows.

### D-056 extension — common gameplay does not require Flow Graph

First-class gameplay profiles, components, recipes and specialized editors own common no-code authoring. Flow Graph later orchestrates and extends the shared Event/Action/gameplay vocabulary; it does not replace bounded first-class gameplay authoring or create a second semantics layer.

### D-067 extension — store platforms are optional distribution adapters

Generalize the existing Steam boundary: Steam, Epic, and other approved storefronts are optional distribution targets/adapters. Core project data, store-neutral player behavior, and exported games do not require a storefront unless the creator explicitly enables a supported store-dependent feature. Vendor SDKs remain conditional and adapter-isolated.

### D-068 extension — Studio/presentation media remains separately licensed

Bundled Studio Radio media, hero art, fonts, images, LUTs, palettes, noise textures, decals, sky/backdrop images, VFX cards, ambience/audio, sample materials, and other reusable presentation/creator-comfort media require provenance, usage-term, attribution, and redistribution evidence. A software-library license never grants unrelated media rights.

### D-069 extension — release evidence includes capability/export closure

Reproducible release evidence must also explain the used-capability runtime/export closure, physical packaged contents, store-target additions where applicable, and exclusion of editor-only/Studio-local/source content.

### D-076 / D-077 extension — Early Access continuity without architectural commercial constants

Paid Early Access for the same RetroStage Maker product/SKU retains the existing entitlement-continuity direction. Exact launch timing, prices, discounts, regions, store procedures, EA duration, and similar mutable values remain contemporaneous release evidence.

### D-009 / D-013 / D-015 / D-016 / D-017 extension — composition identity, migration and unknown extensions

`GameDefinitionDocument` is canonical RetroStage authoring data and may be referenced from `ProjectDocument` through stable identity. It composes by reference and must not become a monolithic container for every subsystem.

Stable identity/remap/migration rules extend to GameDefinition bindings and authored/runtime/save reference mappings. Renderer, physics, navigation, worker and UI object identities remain transient.

Structurally safe unknown extension data may be preserved for compatibility, but unknown executable/runtime meaning receives no authority. Required unavailable/unknown meaning becomes a Play and/or Export blocker rather than silent fallback/deletion.

### D-018 extension — worker completion is not mutation authority

Async workers/jobs may compute derived results but cannot directly mutate canonical documents. Results return to the owning application/command authority with owner/snapshot/session-generation evidence; only a still-valid accepted result may be committed through normal mutation authority.

### D-019 extension — clocks, scheduled work and causal execution are owned runtime semantics

Runtime systems use explicit clock domains, ordered update phases, fixed/variable-step contracts, pause/time-scale/hit-stop semantics, owner-scoped scheduled work, and bounded Event/Action causal chains.

Raw render-frame cadence, `setTimeout`/`setInterval` handles, unowned callbacks, or unbounded event recursion are not gameplay authority. Owner teardown cancels/rejects work that can no longer legally execute. Timer handles are not Runtime Save truth.

### D-032 extension — standalone export reuses the same composition/resolution semantics

PIE/player/export may differ in process topology and derived objects, but one GameDefinition/composition meaning and one deterministic resolution contract govern effective game configuration. An export-only resolver or hidden package-time gameplay defaults are prohibited.

### D-037 / D-038 extension — resolution/capability truth is explicit and diagnosable

GameDefinition requested capability intent, canonical supported capability truth, and resolver-derived effective capability truth are distinct. Visible UI does not prove support.

Validation/Project Doctor must diagnose missing composition references, unresolved required extensions, invalid overrides, capability mismatches, torn/incompatible revision inputs, stale async results where material, and missing semantic export closure.

### D-047 extension — runtime diagnostics include causal, resolution and lifetime provenance

Diagnostics may explain effective resolved values, resolution dependency/fingerprint basis, Scene/Section transitions, runtime entity provenance, effect commit keys, RNG stream/seed provenance, async generation leases, focus/device transitions, scheduled work ownership, causal-chain budget overflow, audio lifetime/listener policy, and dynamic navigation projection.

Diagnostic state remains derived and does not become product authority.

### D-053 extension — audible sound, gameplay noise, listener and lifetime are separate semantics

`GameplayNoise` for AI perception is typed gameplay meaning and must not be inferred from speaker gain/volume. Audio cues/voices remain audio runtime semantics.

Audio ownership/lifetime and Scene/Section transition continuity are explicit. One runtime listener authority is selected independently of camera count. Runtime Save reconstructs transient audio from semantic state.

### D-056 extension — Event/Action orchestration obeys idempotency and causal budgets

Shared Event/Action semantics include repeatability class, stable semantic commit/idempotency keys where required, and bounded causal-chain work/depth/event budgets. Flow Graph later inherits the same safety floor rather than bypassing it.

### D-064 extension — deterministic resolution, RNG and lifetime contracts require golden regression evidence

Golden fixtures must cover GameDefinition round-trip/migration, coherent resolution snapshots, requested/supported/effective capability separation, deterministic resolution fingerprints, domain-separated RNG behavior, effect replay/idempotency, stale async result rejection, scheduled-work teardown, causal-budget overflow, Scene/Section transitions, input focus/device lifecycle, and save/load reconstruction where those systems become active.

### D-065 extension — public project compatibility includes composition/resolver compatibility

Compatibility policy must account for GameDefinition schema/reference evolution, resolver/default evolution, capability changes, unknown extension preservation, deterministic/provenance-sensitive behavior, and public customer projects after Early Access. A change in a third-party PRNG/noise/backend algorithm may be compatibility-sensitive when saved or golden behavior depends on it.

### D-070 extension — subprocess and worker acceleration cannot bypass security/authority

External-process wrappers, worker pools, media/asset tools and graph helpers remain behind approved Node/Main/worker/application boundaries. No project-provided shell command, arbitrary Renderer process execution, secret-bearing canonical configuration, or worker direct authority mutation is permitted.

### D-018 / D-019 extension — session generation and queued Event dispatch are explicit

New Game, fresh full retry, return-to-title followed by a new runtime session, and PIE restart mint a fresh runtime-session generation. Async/worker completion from an older generation cannot commit into the newer session.

Event/Action dispatch uses an explicit bounded dispatch mode equivalent to `IMMEDIATE_ALLOWED`, `DEFERRED_TO_PHASE_BOUNDARY`, or `DEFERRED_TO_NEXT_TICK`. Same-priority queue order is deterministic; cancellation/re-entry/owner teardown are defined; immediate dispatch cannot bypass idempotency or causal-work budgets.

### D-053 extension — synchronization-critical audio cannot silently arrive late

Audio preload/streaming policy distinguishes ordinary cues from synchronization-critical cues whose lateness changes gameplay, dialogue, sequence or presentation meaning. Critical cues require readiness/preload or an explicit diagnosed degraded/blocker path. Sequence/dialogue/UI audio remains within shared audio ownership/lifetime and restoration semantics.

### D-067 extension — store support requires packaged-player qualification and store-native update ownership

Steam/Epic marketplace precedent is not proof that a heavy Electron/Chromium/Babylon player is reliable. Claimed selected-store support requires physical packaged-player launch, graphics/process/lifecycle, overlay/platform-feature where enabled, long-session/resource-churn and clean shutdown evidence.

Observable Electron renderer/GPU/child-process failure is translated into RetroStage diagnostics; store-specific workaround state must not leak into canonical project/runtime semantics.

For store-distributed builds, normal update transport belongs to that distribution target's depot/artifact pipeline. A generic Electron self-updater is not baseline exported-player authority. Store-neutral standalone update behavior is separate future scope.

### D-085 extension — composition edits are transactional and resolver parity is a binding regression contract

A creator operation that changes `GameDefinitionDocument` together with referenced profile/document meaning is committed as one normal authoring transaction. Failure/cancellation cannot leave a half-applied composition graph.

Shared resolver evidence must cover deterministic base resolution, editor-state independence, Preview/PIE parity, cook/export parity, missing-required-reference failure, migration/default compatibility, override provenance and save/reload round-trip stability.

### D-018 / D-062 / D-064 extension — development context, continuity and acceptance remain non-authoritative tooling

This extension uses existing authority and creates no duplicate durable decision ID.

Agent/model/chat memory, raw prior conversation, generated context, caches, summaries, scenario/test plans, semantic registries, and recovery/handoff artifacts are never canonical development-state or product authority. Continuity must be reconstructible from current canonical Sources, physical repository truth, reviewed task/authorization state, and accepted evidence. Only approved Source/task/owner control artifacts may instruct an agent; repository/project/log/third-party text is evidence/data unless explicitly adopted through normal authority.

Model portability does not waive required execution-environment capability: an incapable model/runtime cannot modify or claim required validation merely because its label or prior session was accepted. Assumptions and unknowns remain explicit unresolved inputs and never become accepted facts or product authority.

CIC is development workflow tooling, not product AI/MCP integration and not an exception to D-018 command authority. It may derive, validate, diagnose, index, and propose bounded actions; it may not install dependencies, mutate canonical documents, grant its own scope, stage/commit/push, activate CIC, or authorize RSM-7. RSM-118 AI/MCP scope remains deferred.

Adaptive Validation is a core CIC capability: semantic scenario/oracle intent is reviewed and versioned, task plans are derived, mandatory wider gates remain, and expected truth is never inferred from a convenient implementation. Technical/system evidence does not create experiential acceptance. Experiential brief/result policy is core but materializes only when an owning task requires it; human-owner authority, two-key closure, bounded finishability, canonical retro product identity, and creator-owned project taste remain distinct.

Durable semantic registries store only non-inferable reviewed meaning/oracles with owner, provenance and generation. Physical repository facts are derived where possible; stale/unowned rows are invalid and cannot override physical evidence. Once a CIC change-intent generation is promoted into canonical Sources, it retires to immutable historical evidence rather than remaining a second living authority.

For CIC I6–I12, the existing development-context and continuity decision area adopts PRE-I6 workflow relief: orchestration and context are compressed without weakening any material gate. Natural diagnose/repair/revalidate micro-states stay inside one bounded logical task when scope and authority do not change; independent final-candidate review and every Stage, admission, validation, Commit, Push, remote, and hosted-CI predicate remain intact. The accepted Post-I12 sequence is closed through Slice5. Slice6 retains canonical technical state `CONDITIONAL / DISABLED / NOT STARTED` and separate owner progression disposition `DEFERRED / RESEARCH-ONLY / NOT REQUIRED FOR CURRENT PROGRESSION`; this currentness update creates no new product, architecture, workflow-policy, or CICtrl authority.

This extension creates no duplicate durable decision ID and no new authority. CIC itself may not grant its own scope, stage, commit, push, activate itself, or authorize RSM-7; owner authorization, currentness, publication, dependency, schema, persistence, security, and Source-authority gates retain their existing meaning.

### Feature-Level gameplay principles retained from the reviewed Public-Alpha package

### PART XVIII — Binding Product Principles

These are **candidate durable principles** to consider during source rebase. Do not assign permanent decision IDs until the latest Source 05 is re-read and decision-ID collisions are resolved.

> **Common gameplay must not require Flow Graph. Flow Graph orchestrates and extends gameplay; it does not replace first-class gameplay authoring.**

> **Gameplay feel is coordinated across movement, camera, animation, audio, VFX, UI, haptics and timing; it is not a single movement-speed or combat parameter.**

> **Deliberate gameplay friction must be authored, predictable, readable and reversible. Accidental friction is a usability defect.**

> **RetroStage saves gameplay meaning, not engine object graphs.**

> **Narrative authoring should express story meaning directly through NPCs, dialogue, objectives, clues and story state before falling back to generic graph logic.**

> **Enemy authoring should begin from bounded profiles, perception, attacks and encounter recipes rather than a general-purpose behavior-tree IDE.**

> **Templates and recipes provide behavior and validated defaults; creator-controlled presentation and project identity remain first class.**

> **A gameplay capability is not complete until its required Preview / PIE / Cooked / Export / Save / Diagnostics responsibilities are explicitly proven.**

> **Player UI presents gameplay meaning; UI widgets do not become gameplay authority.**

> **Style may be distinctive; interaction must remain understandable.**

> **Creator UI style is the default, but bounded player accessibility/readability overrides may take precedence where required.**

> **Dialogue content, text identity and dialogue presentation are separate concerns connected through stable contracts.**

> **UI recipes and themes accelerate authoring but must not impose a mandatory RetroStage house interface.**

---

### Feature-Level visual scope guardrails retained from the reviewed presentation package

### PART H — SCOPE GUARDRAILS

#### 58. Explicitly Not Authorized

This alignment must not become an indirect authorization for:

- general-purpose raw shader IDE;
- unrestricted procedural-world generation;
- open-world streaming expansion beyond existing bounded roadmap scope;
- global dynamic weather/climate simulation;
- full destruction simulation;
- full cloth simulation;
- general VFX programming environment;
- arbitrary code injection;
- Babylon serialization as canonical project data;
- destructive source-asset conversion;
- mandatory PS1 style;
- mandatory CRT/VHS effect;
- mandatory vertex wobble;
- random rendering corruption as a product feature;
- hidden external executable downloads;
- renderer-thread heavy asset conversion;
- one mandatory RetroStage visual/audio identity.

---

## 85. D-080 — Studio Identity Is an Optional Editor-Local Creator Experience Layer

**Status:** `ADOPTED PRODUCT/ARCHITECTURE DIRECTION; IMPLEMENTATION DEFERRED TO POST-RSM-18`

After RSM-18 closes and before RSM-19 may start, RetroStage Maker should provide the bounded POST-RSM-18 Studio Identity & Creator Experience control.

The planned layer includes Startup Welcome/Studio Launcher, local Creator Profile, Continue/Recent Projects, passive Project Memory, optional non-blocking Session Rituals, Recent Captures/Project Gallery, Studio Player for explicitly selected local media, offline rights-cleared Studio Radio, Studio Presets, PIE Studio-audio interlock, persistent/resettable local workspace behavior, and full per-surface/master disable.

Studio Identity is editor-local/application-local and non-canonical. It is not project/gameplay/runtime-save/exported-player truth, not game `PresentationProfile`, not game audio authority, not exported-game legal identity, and not an account/social/cloud/commerce system.

Recent/Continue must use normal trusted project-open authority. Local media access is explicit and Main/secure-Preload-mediated; arbitrary renderer filesystem authority and silent broad scanning are forbidden. Studio media enters a project only through a later explicit normal asset import.

**Explicitly excluded inside SICE:** cloud/social/public profiles, achievements/streaks/XP/productivity scoring, Spotify/music-service integration, streaming radio, marketplace/payment/seller/entitlement systems, mandatory telemetry, Steamworks/Steam achievements, premature game-audio systems, and detached multi-window/multi-monitor as a closure requirement.

**Roadmap ownership:** `POST-RSM-18 SICE`.

### D-080 feature-level closure / evidence extension

SICE product acceptance also includes:
- launcher return behavior after project close and a compact/hideable active-workspace footprint;
- Project Memory field semantics for timestamps, last Scene, session count/time, last duration, capture references and safe last-known location;
- Gallery capture metadata/tolerance for moved projects, deleted Scenes and missing media;
- Studio Player explicit local media/library controls without crawling/import/export authority;
- bounded Studio Preset editor-only domains;
- exact PIE interlock restoration including pre-paused state and supported volume/position behavior;
- a master-disable proof of the complete create/edit/save/close/reopen/PIE/stop/cook/export/run-player spine.

SICE closure evidence includes Main/Preload schema/sender/path validation, local-media permission/path failure fixtures, Welcome/Continue/reset/disable acceptance, restart persistence, stale local-reference fixtures, project-dirty invariants, no-network Studio Radio proof and Studio-local export exclusion.

### D-080 Wave 2 creator-appeal / hardening extension

The POST-RSM-18 SICE owner is extended with bounded Showcase Capture, deterministic Project Hero fallback, Scene Mood Board, Beautiful Empty States, Look Lab, Look A/B, Atmosphere Recipes, Visual Recipe Gallery, Command Palette/Quick Actions, Safe Startup and Diagnostic Actions. These are optional editor-local/application-local experience surfaces over existing authorities; they do not create canonical game/project/runtime meaning, a second command system, a second diagnostics truth source, a marketplace/network catalog or a second presentation profile.

Existing decision authority is inherited as follows:

| V4 intent | Controlling existing authority |
|---|---|
| `CAE-01`, `CAE-02`, `CAE-03`, `CAE-10`, `SICE-H1`…`SICE-H10` | D-080 Studio-local identity, state, media, recovery and disable boundary |
| `CAE-04` | D-024/D-033 project-clean workspace/local-state boundary plus existing contextual guidance |
| `CAE-05`, `CAE-06`, `CAE-07`, `CAE-08`, `CAE-H1` | D-049/D-081 canonical presentation and controlled-imperfection authority; previews remain derived and disposable |
| `CAE-09` | D-018 command authority; palette search/enumeration cannot create parallel mutations |
| `CAE-11`, `CAE-H3` | D-037/D-063 centralized validation/diagnostic and safe repair guidance, under existing privacy/redaction controls |
| Later recipe/profile packs | D-060 bounded content/pack direction; no marketplace is required |

The D-080 local-state contract now requires one versioned Main-side Studio store, ordered migrations, quarantine, safe defaults, selective reset, atomic replace-safe persistence, one serialized durable writer and deterministic multi-instance behavior. Startup reads only minimal recovery/recent-project metadata; secondary history and all Hero/Gallery/Player/Mood Board media are lazy and bounded. Gallery media is classified as Studio-owned capture, rebuildable cache or external reference; cleanup is visible, favorites/pins are protected, external originals are never deleted, and path/reparse/junction containment must pass before owned deletion.

Each local feature fails independently. Corrupt Gallery, Hero, Mood Board, Player, layout or preset data cannot block the create/open/edit/save/close/reopen/PIE/cook/export/run-player spine. Safe Startup uses a minimal recovery record independent of ordinary Studio payloads and never bypasses normal project trust, schema, migration or recovery. Project-identity ambiguity is shown explicitly and resolved only through local-history choices; canonical identity is not silently changed.

SICE accessibility and privacy are mandatory: keyboard/focus/reduced-motion/readability/no-surprise-audio preferences outrank decorative presets; copied diagnostics are redacted before publication; local paths, tags, user values and secrets do not enter canonical projects, exports, logs or network surfaces by default. Bounded media parsing must enforce byte/count/dimension/string/time/memory ceilings and may defer rich metadata instead of pulling RSM-27 forward.

Dependency planning remains non-admission. `fuse.js` may be considered only as a replaceable POST-RSM-18 bounded local fuzzy-ranking helper. The single existing `music-metadata` family may also be considered at narrow owner `POST-RSM-18 SICE-I5` for explicitly selected local Studio Player metadata while retaining RSM-79 source inspection. Neither is installed, mandatory for SICE entry/closure, playback/codec authority or permission to expand filesystem/network/runtime scope.

If SICE is later narrowed or deferred, accepted RSM-18 closure remains valid, but RSM-19 cannot silently bypass a still-binding SICE-before-RSM-19 rule. Changing/removing that sequencing dependency requires explicit source change control.

## 86. D-081 — Controlled Imperfection Is an Authorable Presentation Dimension, Not Accidental Degradation

**Status:** `ADOPTED PRODUCT/PRESENTATION DIRECTION; IMPLEMENTATION MILESTONE-OWNED`

RetroStage may intentionally reduce precision, smoothness, visibility, sampling cleanliness, and information density to create project-specific visual character.

Controlled imperfection must be explicit, bounded, creator-controlled, reversible/non-destructive where applicable, diagnosable, profile-aware, deterministic where authored meaning/QA depends on it, and compatible with supported export/fallback contracts.

It must not rely on accidental renderer bugs, corrupted assets, random z-fighting, mandatory vertex wobble, mandatory CRT/VHS, mandatory low resolution, or one mandatory RetroStage house style.

`Visual Rawness` is a dimension of the canonical `PresentationProfile`/presentation model, not a separate competing profile authority.

**Roadmap ownership:** RSM-43–45, RSM-56–58, RSM-75–78, RSM-83–90, RSM-94–103, RSM-108–119 as applicable.

## 87. D-082 — Used Runtime Capabilities Require Complete Semantic Export Closure

**Status:** `ADOPTED ARCHITECTURE / PRODUCT QUALITY INVARIANT`

A creator-facing capability classified as `RUNTIME`, `COOKED`, or `HYBRID` is not complete merely because it works in Preview or PIE.

For every used supported non-editor-only capability, RetroStage must prove a continuous chain from stable authored meaning through declared export disposition, runtime/cooked projection, complete semantic/asset/module dependency closure, cooked manifest representation, deterministic package inclusion, physical artifact evidence, standalone execution, and required parity/clean-machine proof.

Static asset references alone are not sufficient. Missing any required link is an Export blocker.

`EDITOR_ONLY` capability state must be excluded from player artifacts unless an explicit supported conversion/import creates runtime-owned project content.

**Roadmap ownership:** RSM-55, RSM-94–103, RSM-111–120.

## 88. D-083 — Early Access Is a Commercial Checkpoint, Not Roadmap Completion

**Status:** `ADOPTED COMMERCIAL / ROADMAP DIRECTION`

RetroStage Maker may enter paid Early Access after the non-numbered `POST-RSM-78 EA-RC` control closes without requiring RSM-79→RSM-120 to be complete.

EA-RC pulls forward only the release-critical obligations necessary to sell, support, update, secure, license, package, and truthfully represent the actual Early Access product and its advertised standalone-export capability.

Later numbered milestones remain open and retain complete mature ownership. Narrow EA proof does not pre-close them, Gate G, RSM-119, RSM-119-ADD1, or RSM-120.

After release, roadmap development continues normally. Current development state is not automatically public-release state; the live EA channel receives validated release-candidate updates. Supported public customer projects are compatibility-sensitive data and require applicable migration/backup/regression/reopen/export evidence and release notes for affected updates.

Exact store procedures, prices, promotions, regions, and EA duration remain contemporaneous release evidence.

**Roadmap ownership:** POST-RSM-78 EA-RC, RSM-79→RSM-120 continuation, RSM-119/119-ADD1, RSM-120.

## 89. D-084 — Export Uses a Deterministic Hierarchical Store-Neutral Runtime Layout

**Status:** `ADOPTED EXPORT / DISTRIBUTION ARCHITECTURE DIRECTION`

RetroStage export should produce a deterministic, inspectable hierarchical runtime layout rather than forcing one opaque monolithic file.

The base standalone package is store-neutral and complete for all advertised non-store-dependent capabilities. Optional store targets compose bounded target-specific files/services over that base through platform adapters.

Store-target packaging must not contaminate canonical project/gameplay meaning, require a vendor SDK for projects that do not use it, or hide release obligations inside an opaque package.

Build stripping may remove only content proven unreachable under declared runtime semantics. The artifact report must explain retained/removed content and target-specific additions.

**Roadmap ownership:** RSM-18, RSM-92–103, POST-RSM-78 EA-RC when activated, RSM-119.

## 90. D-085 — Game-Wide Composition Has One Canonical Root and One Deterministic Resolution Contract

**Status:** `ADOPTED ARCHITECTURE DIRECTION; FOUNDATION SHAPE BEGINS RSM-7 / RESOLVER ACTIVATION RSM-16`

RetroStage has one explicit game-wide canonical composition root, `GameDefinitionDocument`, referenced through stable project identity. It composes runtime/export intent by referencing subsystem-owned documents/profiles/defaults; it does not own or inline every Scene, entity, item, enemy, dialogue, UI widget, asset or engine object.

One RetroStage-owned headless `GameConfigurationResolver` resolves effective configuration from one coherent accepted authoring snapshot/context. The same semantic resolution contract is reused across Preview, PIE, player runtime, cooking and export.

```text
ProjectDocument ≠ GameDefinitionDocument
GameDefinitionDocument ≠ RuntimeGameSession
GameDefinitionDocument ≠ ResolvedGameConfiguration

RequestedCapabilities ≠ SupportedCapabilities ≠ EffectiveCapabilities

accepted immutable authoring snapshot
→ coherent resolution view
→ shared resolver
→ derived resolution provenance/fingerprint
→ derived ResolvedGameConfiguration
```

`ResolutionDependencySet` and `ResolvedConfigurationFingerprint` are derived provenance/cache/regression evidence, not canonical authoring truth.

GameDefinition defaults, Project Variables, Runtime Settings, Player Settings, Runtime Save state, target/build settings, editor/Studio state and secrets remain separate authorities.

The resolver must be deterministic, explain effective-value provenance, reject torn/incompatible inputs, fail closed on unresolved required meaning, never depend on React/Zustand/Babylon/transient UI state for shipped semantics, and never write resolved runtime state back into canonical authoring documents.

No new package is mandated. Exact physical placement follows Source 03 package-creation and environment-boundary rules.

**Roadmap ownership:** RSM-7–8 foundation shape/identity, RSM-16 runtime resolution, RSM-18 minimal standalone parity, later gameplay/presentation/save/Scene/audio owners, RSM-94–103 mature cook/export, RSM-112–116 regression/migration.

### D-085 architecture-violation registry — reviewed V5 shortcuts

Unless a later explicit owner-approved decision changes one item, the following remain architecture violations:

1. giant GameMode/all-systems object;
2. runtime service locator for hidden global configuration;
3. UI/workspace state as shipped configuration authority;
4. separate unrelated export resolver;
5. raw filesystem path as persistent composition identity;
6. implicit unrelated fallback for missing required meaning;
7. runtime effective-state write-back into canonical authoring documents;
8. plugin override escape hatch around resolver/validation/permissions;
9. resolved cache treated as canonical truth;
10. render-frame cadence as gameplay timing authority;
11. ad-hoc Scene destruction transition without transactional lifecycle;
12. physics/renderer object identity as persistence identity;
13. Runtime Save during unstable half-applied transition;
14. competing subsystem-private input/camera ownership flags;
15. AI hearing derived from speaker/mixer volume;
16. camera object automatically implies/steals spatial listener authority;
17. audio lifetime determined only by object GC/renderer destruction;
18. raw animation frame/index as sole gameplay-critical contract;
19. repeated Event occurrence automatically implies repeated gameplay effect;
20. one mutable global RNG stream shared across unrelated domains;
21. completed async work automatically regains stale authority;
22. focus loss leaves held gameplay actions latched;
23. navigation backend state owns door/passability truth;
24. raw timer/callback outlives semantic owner generation;
25. platform timer handle/closure serialized as save truth;
26. unbounded chain of individually legal Events/Actions;
27. worker/native/WASM process directly mutates canonical/runtime semantic truth;
28. candidate helper/tool becomes product/canonical/runtime authority;
29. permissive license alone implies dependency admission;
30. process wrapper admission automatically authorizes an external executable;
31. Graphlib/Dagre or other derived helper graph becomes canonical project meaning.

## 91. D-086 — Feature-Level Creator Capability and Anti-Scope Intent Must Survive Roadmap Compression

**Status:** `ADOPTED PRODUCT / ROADMAP GOVERNANCE INVARIANT`

A feature-level creator capability is not considered preserved merely because a generic subsystem with a related name exists.

During source alignment, roadmap cleanup or architecture consolidation, each reviewed feature-level intent must be:
`CANONICALIZED`, `MERGED INTO A NAMED OWNER`, `NORMALIZED TO A NAMED AUTHORITY`, `EXPLICITLY DEFERRED`, `EXPLICITLY REJECTED`, or `SUPERSEDED BY A NAMED ACCEPTED DECISION`.

The positive gameplay/player-experience inventory and its Deferred/Excluded companion are inseparable. The same rule applies to the Visual Rawness/Atmosphere inventory.

The smallest coherent RetroStage system is preferred over a general-purpose framework when existing bounded semantics can express the creator workflow.

Post-Alpha reconsideration of excluded/deferred scope requires concrete creator demand, clear canonical/runtime/export/save authority, no overlapping second authority, acceptable dependency/security/licensing/performance/support cost, defined migration/diagnostics/parity, and evidence that the addition does not destroy the focused horror/mystery/narrative/liminal creator identity.

**Roadmap ownership:** continuous product governance; no implementation authority by itself.

### Binding first-product anti-scope completeness annex

The following reviewed Deferred/Excluded package is retained as binding scope policy after current-authority normalization:


### PART I — HARD FIRST-PRODUCT EXCLUSIONS

The following are already consistent with the canonical v0 exclusions and should remain outside the first Public / Alpha scope unless a formal charter/roadmap change explicitly reopens them.

#### 2. Multiplayer / MMO / Live-Service — `EXCLUDE`

Do not build:

- network replication;
- multiplayer lobbies;
- matchmaking;
- dedicated servers;
- co-op synchronization;
- PvP;
- account service gameplay state;
- live-service progression;
- MMO infrastructure.

##### Supported alternative
Single-player runtime with local player profile/save.

---

#### 3. Open-World Engine / Large Streaming World — `EXCLUDE`

Do not build:

- seamless open-world streaming framework;
- world partition;
- kilometer-scale terrain;
- dynamic world-origin systems;
- massive runtime population streaming;
- general outdoor-world simulation.

##### Supported alternative
Small-to-medium scenes/sections with bounded section visibility/transition and liminal substitution where explicitly supported.

---

#### 4. RTS / Colony / Multi-Unit Command — `EXCLUDE`

Do not build:

- multi-unit selection;
- squad formation command;
- economy/resource simulation;
- base building;
- factory automation;
- colony simulation;
- RTS path planning;
- mass-agent strategy gameplay.

##### Supported alternative
One directly controlled protagonist plus bounded NPC/enemy agents.

---

#### 5. General-Purpose RPG Framework — `EXCLUDE`

Do not build a universal RPG engine containing:

- large stat/attribute graphs;
- class systems;
- skill trees;
- party management;
- equipment-stat optimization;
- leveling/XP;
- complex status-effect frameworks;
- reputation networks;
- large faction systems;
- procedural loot;
- RPG economy.

##### Supported alternative
Bounded horror/mystery items, health, ammo, objectives, clues, NPC states and supported combat profiles.

---

#### 6. Complex Economy / Vendor / Commerce Gameplay — `EXCLUDE`

Do not build:

- player economy;
- shops/vendors as a general subsystem;
- dynamic prices;
- merchant inventories;
- currencies;
- barter;
- trading simulation.

##### Supported alternative
Direct story item exchange: Give Item / Receive Item through NPC/dialogue actions.

---

#### 7. Public Marketplace / Payments / DLC Commerce — `EXCLUDE`

Do not confuse installable creator packs with:

- public marketplace;
- seller accounts;
- payment processing;
- entitlements;
- creator revenue distribution;
- in-editor DLC commerce.

##### Supported alternative
Installable templates/genre kits/content bundles under separate product/content rules.

---

#### 8. Unrestricted Procedural World Generation — `EXCLUDE`

Do not build:

- arbitrary procedural terrain;
- procedural city/world generation;
- unlimited random dungeon framework;
- procedural game-generation platform;
- unrestricted rule-driven world compiler.

##### Supported alternative
Deterministic bounded scatter, repetition, prefab variants, liminal loop/substitution and authored anomaly recipes.

---

#### 9. General Non-Euclidean World Engine — `EXCLUDE`

Do not build a universal portal/non-Euclidean geometry engine.

##### Supported alternative
Bounded looping corridors, section substitution, continuity teleport and authored impossible-transition illusions.

---

#### 10. Unrestricted Physics Sandbox — `EXCLUDE`

Do not build:

- user-authored solver behavior;
- general rigid-body sandbox;
- soft-body simulation;
- cloth framework;
- fully physical inventory;
- unrestricted joints;
- large destruction simulation.

##### Supported alternative
Doors, drawers, carry/drop, pushable props, simple impulses, limited breakables, triggers and kinematic platforms.

---

### PART II — AI / NPC SCOPE TO DEFER

#### 11. General Behavior Tree IDE — `DEFER / DO NOT REQUIRE FOR CORE`

Do not make creators construct every enemy from a generic behavior tree.

##### Why
It increases product complexity, authoring burden, debugging burden and save/runtime variability.

##### Alpha alternative
Enemy Profile + bounded state vocabulary + Perception Profile + Attack Profile + Encounter Recipe.

A Behavior Tree-like advanced escape hatch may be reconsidered only after Alpha if creator demand proves that bounded profiles cannot express supported games.

---

#### 12. Advanced GOAP / Utility AI / Planning AI — `DEFER`

Do not build:

- general goal-oriented action planning;
- utility-scoring behavior framework;
- planner authoring;
- dynamic action-domain simulation.

##### Alpha alternative
Explicit bounded enemy states, typed conditions/actions and Flow Graph orchestration where needed.

---

#### 13. Large-Group / Squad Tactical AI — `EXCLUDE FIRST PRODUCT`

Do not build:

- formation behavior;
- squad flanking coordinator;
- tactical cover teams;
- shared squad blackboard;
- large combat groups.

##### Alpha alternative
Independent bounded enemies and small authored encounter groups.

---

#### 14. Life-Simulation NPC Schedules — `DEFER`

Do not build:

- hour-by-hour Sims-style schedules;
- hunger/sleep/social simulation;
- autonomous needs;
- systemic daily routines.

##### Alpha alternative
Story-stage-driven NPC presence/relocation:

```text
BeforePower → Reception
PowerRestored → BasementDoor
DoctorFound → Gone
```

---

#### 15. Deep Social / Relationship Simulation — `DEFER`

Do not build:

- relationship graphs across many NPCs;
- romance system;
- personality simulation;
- dynamic social reputation;
- faction diplomacy.

##### Alpha alternative
Bounded NPC state, trust/disposition enum/number where narratively useful, conversation memory and story flags.

---

### PART III — QUEST / STORY SCOPE TO DEFER

#### 16. General RPG Quest Engine — `EXCLUDE FIRST PRODUCT`

Do not build:

- hundreds of quest types;
- quest hubs;
- daily/repeatable quests;
- procedural quests;
- quest reward/economy engine;
- level-gated quest chains;
- MMO-style tracker.

##### Alpha alternative
Objective / Task:

- main / optional / hidden;
- steps;
- conditions;
- progress;
- completion/failure;
- story actions;
- journal/minimal UI.

---

#### 17. Full Detective Deduction Simulator — `DEFER`

Do not build:

- evidence-board logic engine;
- freeform deduction parser;
- procedural contradiction solver;
- complex case database.

##### Alpha alternative
Clues/Knowledge + Objectives + Dialogue conditions + Story State.

---

#### 18. Procedural Narrative / Generative Story Runtime — `EXCLUDE FIRST PRODUCT`

Do not make runtime story depend on:

- LLM-generated dialogue;
- dynamically generated quests;
- procedural narrative planning;
- uncontrolled AI-authored story state.

##### Alpha alternative
Authored dialogue, typed conditions/actions, Story Spine, Sequencer and bounded Flow Graph.

---

#### 19. Full Dialogue Scripting Language — `DEFER`

Do not create an unrestricted text scripting language as a prerequisite for narrative authoring.

##### Alpha alternative
Dialogue Editor with choices, conditions, actions, speaker profile, preview and diagnostics.

A later text-format convenience layer may be evaluated only if it remains a front-end to the same canonical dialogue model.

---

### PART IV — INVENTORY / ITEM SCOPE TO DEFER

#### 20. Complex Crafting System — `EXCLUDE FIRST PRODUCT`

Do not build:

- crafting benches;
- large recipe trees;
- ingredient quality;
- crafting levels;
- procedural recipes;
- resource production chains.

##### Alpha alternative
Bounded `A + B → C` item combine recipes and item-on-target puzzles.

---

#### 21. Random Loot / Rarity / Affix System — `EXCLUDE`

Do not build:

- rarity tiers;
- random affixes;
- Diablo-style drops;
- loot tables;
- item rolls.

##### Alpha alternative
Authored item placement and optional direct authored drop on enemy death.

---

#### 22. Equipment / Encumbrance RPG System — `EXCLUDE FIRST PRODUCT`

Do not build:

- weight simulation;
- armor slots/stat bonuses;
- equipment load;
- inventory encumbrance penalties.

##### Alpha alternative
Weapon equip, quick slots, bounded utility items, fixed inventory capacity.

---

#### 23. Spatial Case Inventory — `DEFER OR ALPHA CONDITIONAL`

A physical footprint inventory grid is desirable for some survival-horror projects but should not block Alpha.

##### Admission condition
Only promote if:

- slot/list inventory is already stable;
- gamepad navigation is solid;
- save/migration is proven;
- UI complexity is acceptable;
- creator testing shows clear value.

---

### PART V — COMBAT SCOPE TO DEFER / EXCLUDE

#### 24. Soulslike Combat Framework — `EXCLUDE FIRST PRODUCT`

Do not build:

- frame-perfect dodge systems;
- parry windows;
- stamina-metagame;
- lock-on duel system;
- weapon scaling;
- posture systems;
- deep melee move sets.

##### Alpha alternative
Simple Melee + Defensive Stun/Repel + bounded recovery/stagger.

---

#### 25. Character-Action / Combo Combat — `EXCLUDE`

Do not build:

- combo trees;
- launchers;
- aerial combat;
- animation-cancel meta;
- combo scoring;
- style ranks.

##### Alpha alternative
Light/Heavy/Shove only where needed.

---

#### 26. Competitive Shooter Framework — `EXCLUDE`

Do not build:

- network shooter mechanics;
- advanced recoil-pattern editor;
- competitive aim assist;
- movement-tech shooter systems;
- weapon metas;
- ranking.

##### Alpha alternative
Bounded horror hitscan shooting with creator-friendly recoil/spread/ammo.

---

#### 27. Advanced Tactical Cover Shooter — `EXCLUDE FIRST PRODUCT`

Do not build:

- cover nodes;
- blind fire;
- squad cover AI;
- tactical lean/peek framework;
- cover-to-cover navigation.

##### Alpha alternative
Basic line-of-sight, occlusion, hiding spots and authored environmental composition.

---

#### 28. Complex Ballistics — `EXCLUDE`

Do not build:

- real-world bullet drop;
- wind;
- penetration;
- ricochet simulation;
- material-dependent ballistic physics;
- advanced projectile physics.

##### Alpha alternative
Hitscan + simple projectile.

---

#### 29. Huge Weapon/Attachment System — `EXCLUDE FIRST PRODUCT`

Do not build:

- modular attachments;
- weapon crafting;
- dozens of fire modes;
- gunsmith editor;
- per-part stat simulation.

##### Alpha alternative
Weapon Profile with damage, ammo, magazine, reload, fire rate, spread, recoil, range and supported aim mode.

---

#### 30. Large Elemental / Resistance Matrix — `EXCLUDE FIRST PRODUCT`

Do not build a full RPG damage/resistance spreadsheet.

##### Alpha alternative
Small bounded damage categories sufficient for:
- generic;
- melee;
- projectile;
- environmental;
- fire;
- electric;
- custom supported tag where needed.

---

#### 31. Full Ragdoll / Gore / Dismemberment Framework — `DEFER`

Do not make Alpha depend on:

- advanced ragdolls;
- physical dismemberment;
- gore simulation;
- persistent body physics;
- complex corpse collision.

##### Alpha alternative
Death animation/simple fall, optional bounded impulse, corpse remain/disappear policy.

---

#### 32. Destruction-Heavy Combat — `EXCLUDE FIRST PRODUCT`

Do not build destructible buildings or systemic destruction.

##### Alpha alternative
Limited authored breakables and Event/Action consequences.

---

### PART VI — MOVEMENT / TRAVERSAL SCOPE TO DEFER

#### 33. Platformer / Parkour Framework — `EXCLUDE FIRST PRODUCT`

Do not build:

- wall run;
- mantle framework;
- parkour chains;
- grappling;
- advanced air control;
- climbing puzzles as a general movement system.

##### Alpha alternative
Grounded movement; profile-gated simple jump only if needed.

---

#### 34. Vehicles — `EXCLUDE FIRST PRODUCT`

Do not build:

- drivable cars;
- vehicle physics;
- mounted combat;
- vehicle AI.

##### Alpha alternative
Scripted/Sequence-driven vehicle presentation if a sample scene needs it.

---

#### 35. Full Climbing / Ledge System — `DEFER`

A simple authored ladder/transition may be considered later.

Do not create a generalized traversal/IK/climbing framework for Public Alpha.

---

### PART VII — UI / HUD / MENU / TYPOGRAPHY / DIALOGUE-PRESENTATION SCOPE TO DEFER

#### 36. General App/UI Builder — `EXCLUDE`

Player UI authoring is not a generic web/app builder.

Do not expose as the normal gameplay-authoring model:

- arbitrary JavaScript;
- arbitrary DOM/CSS as canonical UI;
- unrestricted custom runtime components;
- arbitrary browser widgets;
- creator code execution inside UI components.

##### Alpha alternative

Typed UI components, layouts, typography, tokens, bindings, screen policies, screen stack, focus/navigation, motion and recipes.

##### 36.1 Arbitrary Executable Custom Widgets — `EXCLUDE FIRST PRODUCT`

Do not allow user-authored executable UI widgets to become a hidden scripting escape hatch in the Public Alpha.

##### Alpha alternative

A bounded `Custom Screen` composed from supported typed components and bindings.

A controlled Plugin/SDK path may be reconsidered later under the separate extensibility contract.

##### 36.2 General Website / Remote-Web UI Runtime — `EXCLUDE FIRST PRODUCT`

Do not build:

- arbitrary embedded websites as player UI;
- remote HTML interfaces;
- network-fetched gameplay UI;
- web-account dashboards inside exported games.

##### Alpha alternative

Local cooked RetroStage UI assets and runtime documents.

---

#### 37. Dynamic Open-World Map / Navigation UI — `EXCLUDE FIRST PRODUCT`

Do not build:

- GPS/minimap pathfinding;
- dynamic map discovery;
- world-scale markers;
- open-world fast travel;
- navigation arrows;
- route planning.

##### Alpha alternative

Optional static authored floorplan/map UI if later admitted.

---

#### 38. MMO-Style Quest Tracker / HUD — `EXCLUDE AS DEFAULT`

RetroStage may technically support text/list UI, but its product defaults should not assume:

- permanent waypoint arrows;
- large objective tracker;
- minimap;
- floating combat numbers;
- raid frames;
- multi-party status UI.

##### Alpha alternative

Minimal, journal-only, notification-only or custom creator-authored presentation.

##### 38.1 Full Visual-Novel Engine — `EXCLUDE FIRST PRODUCT`

Do not expand dialogue presentation into:

- complete VN route-management product;
- save-any-line VN backlog state machine;
- scene/CG gallery framework;
- affection/route engine;
- hundreds of portrait-positioning/layout conventions;
- visual-novel-specific scripting language.

##### Alpha alternative

Dialogue Editor + Speaker Profile + portrait variants + choices + Dialogue Presentation Profile + Story State + Sequence.

##### 38.2 Complex Radial-Menu Framework — `DEFER`

A radial selector may eventually be useful for a particular game, but it should not be a Public Alpha system requirement.

##### Alpha alternative

List/grid/slot selection plus supported quick slots.

##### 38.3 Full Localization Management Platform — `EXCLUDE AS A TOOLING PRODUCT`

Do **not** confuse the canonical requirement for localization-ready text and final Alpha localization behavior with building a commercial translation-management suite.

Do not build for Alpha:

- translator accounts;
- cloud translation projects;
- CAT-tool replacement;
- translation-memory platform;
- vendor workflow;
- machine-translation service;
- online review portal.

##### Alpha requirement that remains

- stable TextId/string-table semantics;
- locale resolution;
- fallback;
- formatting args;
- font fallback;
- missing glyph/key diagnostics;
- pseudo-localization/expansion fixtures;
- player-facing localized runtime behavior required by the release milestone.

External import/export conveniences may be evaluated later.

##### 38.4 Custom Text-Shaping / Font Engine From Scratch — `EXCLUDE`

Do not build a complete font rasterizer/shaper/layout engine merely to obtain retro typography.

##### Alpha alternative

Use approved platform/browser/text capabilities behind RetroStage-owned typography, fallback, layout and diagnostics contracts.

A specialized bitmap-font authoring suite remains conditional/post-Alpha unless creator evidence justifies it.

##### 38.5 Full Bitmap-Font Authoring Suite — `DEFER / ALPHA CONDITIONAL`

Do not make Public Alpha depend on:

- bitmap font drawing;
- glyph painting;
- kerning editor;
- atlas authoring suite.

##### Alpha alternative

Supported creator font assets, pixel-safe rendering where possible, fallback/glyph diagnostics, and optionally imported prepared bitmap/font-atlas assets if an owning milestone safely admits them.

##### 38.6 VR / Spatial UI Framework — `EXCLUDE FIRST PRODUCT`

No VR pointer/focus system, world-space VR menus or headset-specific UI architecture.

##### Alpha alternative

Bounded world-space prompts and supported in-world UI surfaces for normal desktop games.

##### 38.7 Procedural UI Generator / Runtime Layout AI — `EXCLUDE FIRST PRODUCT`

Do not generate production UI dynamically from uncontrolled runtime AI or procedural logic.

##### Alpha alternative

Authored screens, recipes, tokens and deterministic responsive rules.

##### 38.8 UI Marketplace / Theme Store — `EXCLUDE FIRST PRODUCT`

Do not create:

- public UI theme marketplace;
- paid theme commerce;
- user account/entitlement layer.

##### Alpha alternative

First-party recipes/templates and optional installable packs under existing content-pack policy.

##### 38.9 Full UI Animation / Motion-Graphics Suite — `EXCLUDE FIRST PRODUCT`

Do not turn the UI editor into After Effects.

##### Alpha alternative

Bounded UI motion primitives such as Fade, Slide, Scale, Pulse, Typewriter and simple Wipe with reduced-motion fallbacks.

##### 38.10 Advanced Diegetic / 3D UI Framework — `DEFER`

Do not build a universal 3D UI scene system with arbitrary meshes, browser surfaces, physics and world interaction.

##### Alpha alternative

Bounded world-space prompt, supported terminal/computer-like UI, inspect presentation and authored diegetic screens.

##### 38.11 Floating Combat-Text / Damage-Number Framework — `EXCLUDE AS DEFAULT`

This aesthetic is not central to the supported horror product thesis.

##### Alpha alternative

Hit reaction, audio/VFX/camera feedback, health presentation and optional project-authored simple text if a supported UI binding allows it.

### PART VIII — CINEMATIC / MEDIA SCOPE TO DEFER

#### 39. Full Non-Linear Video Editor — `EXCLUDE`

Do not make RetroStage:

- Premiere;
- Resolve;
- After Effects;
- compositing software;
- video encoding suite.

##### Alpha alternative
Conditional video playback track inside Sequencer after codec/backend admission.

---

#### 40. Advanced Facial Animation / Lip Sync — `DEFER`

Do not make Public Alpha depend on:

- facial rig authoring;
- phoneme editor;
- auto lip sync;
- performance capture.

##### Alpha alternative
Imported animation, portrait/dialogue presentation, simple character animation cues.

---

#### 41. Runtime Video Streaming Platform — `EXCLUDE FIRST PRODUCT`

No remote video streaming or web-media dependency.

##### Alpha alternative
Local packaged approved media assets only, if admitted.

---

### PART IX — SAVE / ACCOUNT SCOPE TO DEFER

#### 42. Cloud Save Synchronization — `DEFER`

Do not make core Runtime Save depend on:

- Steam Cloud;
- proprietary cloud accounts;
- cross-device sync backend.

##### Alpha alternative
Local robust runtime saves. Platform cloud integration may later wrap the same save contract.

---

#### 43. Account / Login System — `EXCLUDE FIRST PRODUCT`

No player account infrastructure for exported games is required.

---

#### 44. Full Memory Snapshot / Emulator Save State — `EXCLUDE`

Do not serialize:

- entire JavaScript heap;
- Babylon scene object graphs;
- physics internals;
- nav query internals;
- active VFX instances;
- arbitrary Flow Graph executor memory.

##### Alpha alternative
Registered semantic runtime state + safe restore policy.

---

#### 45. Arbitrary Mid-Frame Save — `EXCLUDE FIRST PRODUCT`

Do not promise save at every possible animation/physics/sequence frame.

##### Alpha alternative
Save eligibility, safe checkpoints, safe markers and authored fallback.

---

### PART X — SCRIPTING / EXTENSIBILITY SCOPE

#### 46. Arbitrary Code as the No-Code Foundation — `REJECT FOR CORE`

Do not require:

- JavaScript;
- TypeScript;
- Python;
- C#;
- shell commands

to implement normal supported gameplay.

##### Alpha alternative
Profiles + Components + Recipes + Specialized Editors + Sequence + bounded Flow Graph.

A controlled Plugin/SDK escape hatch remains a later product direction only after core boundaries are stable.

---

#### 47. Unrestricted Flow Graph — `REJECT`

Flow Graph must not become:

- arbitrary filesystem access;
- arbitrary shell execution;
- unrestricted HTTP/network access;
- arbitrary code eval;
- recursion without budgets;
- unbounded loops;
- general renderer programming;
- hidden second persistence engine.

##### Supported alternative
Bounded typed nodes using shared Event/Action semantics, validation, execution budgets, tracing and migration.

---

### PART XI — PRODUCT-SCOPE SUBSTITUTION TABLE

The first product should solve the creator's intent with the **smallest coherent RetroStage system**.

| Tempting broad system | Do not build first | Bounded RetroStage alternative |
|---|---|---|
| General AI editor | Behavior Tree / GOAP platform | Enemy Profile + Perception + Attack + Encounter Recipe |
| General RPG quest engine | MMO/RPG quest framework | Objective/Task + Story State + Story Spine |
| RPG inventory | stats/crafting/loot/economy | Items + slots/list + inspect/combine/puzzle |
| General combat engine | Souls/combo/tactical shooter | No-combat + defensive + simple melee + horror firearms |
| Physics sandbox | arbitrary joints/solver | doors/drawers/push/carry/limited breakables |
| Open-world engine | terrain/world partition | scenes/sections + validated transitions |
| Procedural engine | runtime world generator | authored repetition/scatter/liminal substitution |
| Social sim | schedules/needs/relationships | story-driven NPC state/memory |
| General UI/app builder | arbitrary HTML/CSS/JS/components | typed screens/components/bindings/tokens/navigation |
| One house UI | fixed RetroStage skin | UI Theme + Typography + creator-owned screens/recipes |
| Translation-management platform | cloud CAT/translator workflow | stable TextId + locale/fallback/runtime + diagnostics |
| Custom font/text engine | full shaping/rasterizer stack | approved text stack behind RetroStage typography contracts |
| Full visual-novel engine | route/CG/backlog framework | Dialogue Editor + Presentation Profile + Story State + Sequence |
| Motion-graphics editor | arbitrary UI animation timeline | bounded UI motion + Sequencer hooks |
| Dynamic open-world map | GPS/minimap/navigation system | optional authored static floorplan |
| Cinematic suite | NLE/compositor | native Sequencer + conditional media playback |
| Scripting platform | arbitrary code | first-class workflows + bounded Flow Graph |
| Cloud account/save | backend platform | local versioned Runtime Save |
| General 3D/VR UI | arbitrary spatial UI runtime | bounded world prompts/diegetic screens |

### PART XII — Post-Alpha Reconsideration Rules

A deferred feature should not be promoted merely because:

- a library makes it easy;
- one internal demo needs it;
- an agent can generate the code;
- a competitor has it;
- it sounds "engine-like";
- it is technically interesting.

A deferred feature may be reconsidered only when there is evidence of:

1. repeated creator demand inside the supported personas;
2. a clear product workflow that cannot be expressed with current bounded systems;
3. source-authority compatibility;
4. a stable canonical owner;
5. Preview / PIE / Export responsibility;
6. Runtime Save implications;
7. diagnostics and repair UX;
8. migration/compatibility impact;
9. performance budget;
10. dependency/license/security impact where applicable;
11. representative golden-project proof;
12. explicit scope tradeoff and schedule consequence.

---

# Deferred Scope Registry

## 92. Deferred but Approved Product Directions

The following directions are approved but must wait for their owning milestones.

| Area | Status | Earliest owner | Reason for deferral |
|---|---|---:|---|
| Undo/redo and command history | Deferred implementation | RSM-31 | Requires stable canonical commands |
| Workspace index and SQLite cache | Deferred implementation | RSM-33 | Requires stable storage and reference contracts |
| Camera authoring toolkit and user navigation | Deferred implementation | RSM-42 | RSM-6 provides only renderer projection/reset foundations; canonical camera profiles and navigation remain future work |
| Retro presentation profiles | Deferred implementation | RSM-44 | Requires renderer adapter and profile documents |
| Audio foundation | Deferred implementation | RSM-45 | Requires PIE lifecycle and asset direction |
| Liminal scene-flow systems | Deferred implementation | RSM-40 / 57 / 64 | Requires scene, event, transform, and runtime contracts |
| Navigation and patrol authoring | Deferred implementation | RSM-59 | Requires physics/query and level tools |
| AI, stealth, combat | Deferred implementation | RSM-60–62 | Requires navigation, runtime lifecycle, and diagnostics |
| Runtime save and profiles | Deferred implementation | RSM-65–66 | Requires serializable-state policy |
| Asset registry and Content Browser | Deferred implementation | RSM-73–74 | Requires stable project/storage/index foundations |
| Full glTF import/cook/reimport pipeline | Deferred implementation | RSM-75 | RSM-6 admits only self-contained derived runtime loading; canonical asset identity, jobs, cooking, source management, and reimport remain future work |
| Texture and sprite pipeline | Deferred implementation | RSM-76 | Requires content semantics and conditional-tool audit |
| Material/LookDev | Deferred implementation | RSM-83 | Requires assets and presentation runtime |
| Animation and VFX | Deferred implementation | RSM-84–86 | Requires resource and authoring foundations |
| Player UI | Deferred implementation | RSM-87 | Requires settings, text identity, input, and runtime contracts |
| Advanced audio | Deferred implementation | RSM-88 | Requires imported audio and runtime mixer ownership |
| Flow Graph | Deferred implementation | RSM-104–105 | Requires Event/Action registry and runtime debugging |
| Native sequencer | Deferred implementation | RSM-106 | Requires cameras, animation, audio, VFX, UI, and events |
| Generic cinematic interchange | Deferred implementation | RSM-107 | Requires canonical sequence contract |
| Genre kits and content packs | Deferred implementation | RSM-108–110 | Requires stable templates, assets, compatibility, and licenses |
| Plugin SDK | Deferred | RSM-117 | Requires permissions, security, compatibility, and recovery |
| AI/MCP integration | Deferred | RSM-118 | Requires typed commands, approval, undo, provenance, and trust |
| Hosted telemetry/crash reporting | Conditional | RSM-115 | Requires explicit privacy and vendor decision |
| Behavior-tree IDE / GOAP / utility-planning AI | Deferred / not core requirement | Post-first-product unless separately justified | Alpha uses bounded enemy profiles, perception, states, attacks, encounters and diagnostics |
| Life-simulation NPC schedules / deep relationship simulation | Deferred | Post-first-product | Story-driven bounded relocation/memory is sufficient for first product |
| Full detective-deduction simulator | Deferred | Post-first-product | Clue/knowledge + story/objective semantics cover bounded mystery workflows |
| Full dialogue scripting language | Deferred | Post-first-product | Typed dialogue/story semantics and bounded actions come first |
| Spatial case inventory | Conditional / defer unless proved necessary | RSM-50 / RSM-87 owner decision | Not required for every first-product profile |
| Full ragdoll/gore/dismemberment | Deferred | Post-first-product | Bounded damage/feedback remains sufficient |
| Full climbing/ledge traversal | Deferred | Post-first-product | Not required for supported first-product profiles |
| Advanced lip-sync/facial animation | Deferred | Post-first-product | Dialogue presentation does not require it |
| Cloud-save synchronization | Deferred | Post-first-product/store-specific decision | Local runtime save remains baseline |
| Complex radial-menu framework | Deferred | Post-first-product | Bounded UI/menu patterns remain sufficient |
| Bitmap-font authoring suite | Conditional/deferred | Presentation/UI owner if proven | Import/use may be supported without a full authoring suite |
| Advanced diegetic/3D UI framework | Deferred | Post-first-product | Bounded world-space UI may be supported without a general framework |

No table entry authorizes implementation before the canonical roadmap reaches its owner.

---

## 93. Conditional Third-Party and Tooling Registry

The following are not automatically installed merely because their direction is approved. Exact dependency admission remains milestone-owned.

### 92.1 Adopted internal engineering-acceleration direction

RetroStage should deliberately automate repetitive engineering evidence where automation reduces human transcription error without weakening owner/reviewer gates.

A future RetroStage-owned Governance/Evidence CLI may collect:

- SHA-256 and byte counts,
- Git blob/tree/parent/ref identities,
- exact patch/path boundaries,
- Source-manifest/repository/live equality,
- dependency/native/WASM evidence,
- audit summaries,
- CI run/head/event/attempt/job/step identities.

It must remain read-only/evidence-first by default and must not silently authorize, stage, commit, push, rerun CI, repair drift, or replace independent review. No command name is canonical until it physically exists and passes its owning review.

### 92.2 Third-party candidates

| Candidate | Status | Owning work | Required proof |
|---|---|---:|---|
| `fast-check` | Milestone-gated / development-only preferred | RSM-7 / RSM-8 | Exact package/license, deterministic seeds/replay policy, CI time budget, property tests that add value beyond fixtures |
| Testing Library family (`@testing-library/react`, DOM helpers, user-event where appropriate) | Approved in principle / development-only | RSM-9 onward | Exact package set/license, compatibility with selected React/Vitest environment, semantic-query discipline, preference for real-browser Playwright/Vitest Browser actions where appropriate |
| Storybook | Conditional / development-only component workbench | RSM-9 onward | Exact package family/license/transitives, Vite/React compatibility, local/offline operation, telemetry/config review, demonstrated reduction in component-state/design-system iteration cost |
| `dnd-kit` family | Milestone-gated UI interaction backend | RSM-13 or first real hierarchy/asset drag-drop slice | Exact package family/license, API maturity, keyboard/accessibility behavior, virtualization compatibility, command/validation adapter proof |
| Piscina | Conditional / Node-only worker orchestration | Asset/export/index/validation work after measured CPU bottleneck | Exact package/license, Node compatibility, cancellation/shutdown behavior, optional-native dependency inventory, measured benefit |
| Changesets | Conditional / development-release tooling | First real multi-package publication/release-management need | Exact package/license, proof that package-version/changelog automation reduces work rather than adding ceremony |
| `ts-pattern` | Conditional convenience | Complex discriminated-union hotspots only | Exact package/license, compile-time impact, demonstrated readability/exhaustiveness benefit over native TypeScript |
| `@babylonjs/addons` | Conditional renderer capability family | Feature-owning Babylon/render milestone | Exact imported addon(s), bundle impact, API maturity, license/transitive review; never admit the package merely as a grab-bag |
| `@babylonjs/havok` | Milestone-gated | RSM-17 / RSM-28 | Exact package, WASM inventory, license, behavior, performance |
| `better-sqlite3` | Milestone-gated | RSM-33 / RSM-74 | Native binary inventory, Electron ABI, rebuild policy |
| Recast/Detour adapter | Milestone-gated/open adapter | RSM-59 | Exact adapter, license, navmesh lifecycle, debug path |
| React Flow | Milestone-gated | RSM-104 | UI-only adapter boundary and license verification |
| Monaco Editor | Milestone-gated | RSM-98 or later | Proven creator need and package-size impact |
| OpenTelemetry JS core/local instrumentation | Milestone-gated | RSM-82 | Local-only diagnostics; no remote exporter |
| OpenTelemetry remote exporters / hosted telemetry | Conditional audit | RSM-115 | Consent, privacy, vendor, endpoint, retention, security |
| msgpackr | Conditional | Performance audit | Measured IPC need and optional native-addon inventory |
| KTX-Software / `toktx` | Conditional audit | RSM-76 / RSM-95 | Exact subset, mixed licenses, binary inventory, deterministic value |
| Basis Universal tools | Conditional audit | RSM-76 / RSM-95 | License, patents, output quality, source preservation |
| Draco | Conditional audit | RSM-75 / RSM-95 | Binary/WASM identity, license, performance value |
| FFmpeg and codecs | Conditional audit | RSM-79 / RSM-95 | Codec/patent/license review and distribution plan |
| Steamworks SDK | Conditional audit | POST-RSM-78 EA-RC if actually required, otherwise RSM-119 | Exact feature, SDK terms, redistributables, secrets, opt-in behavior, packaged-player qualification |
| Epic/EOS or other store-specific SDK/service | Conditional audit | Owning store/distribution control only when a real requirement exists | Exact feature, terms/license, build-only vs runtime role, secrets, packaging and clean-machine proof |
| Installer/signing tools | Conditional audit | RSM-102 / RSM-119 | Exact maker, native tools, license, signing and secret handling |
| External cinematic formats/libraries | Open until audit | RSM-107 | Mapping, round-trip, license, provenance, unsupported-data policy |
| `@microsoft/api-extractor` | Development-only candidate | First package-boundary/API-review milestone where several public TypeScript APIs justify it | Exact package/license/transitives, config fit, generated-report workflow, player/build exclusion |
| `pure-rand` | Milestone-gated runtime-adapter candidate | RSM-16+ RNG contract; later RSM-57/RSM-86 consumers only through RetroStage RNG authority | Exact version/license, deterministic fixtures, algorithm-upgrade compatibility, save-state policy |
| `fuse.js` | Milestone-gated local-ranking candidate | POST-RSM-18 SICE only if bounded local fuzzy ranking materially reduces owned code | Exact package/license/transitives, browser/Electron compatibility, deterministic bounded ranking fixtures, local-query-only adapter boundary; candidate only, no install |
| `music-metadata` | Milestone-gated import-inspection candidate | POST-RSM-18 SICE-I5 for explicit local Studio Player metadata; retain RSM-79 source inspection | Exact package/license/transitives, Node/ESM compatibility, malformed/oversized-input and responsiveness tests, metadata/source-inspection-only boundary; one family/row, no playback or codec authority |
| `execa` | Conditional audit | First real audited external-process need | Exact graph/license, Node/Main/worker placement, cancellation/security, external executable separately admitted |
| `@dagrejs/graphlib` | Milestone-gated derived-graph candidate | RSM-94/100/101 or earlier only when repeated graph algorithms justify it | Exact algorithms, determinism/order, performance/memory, derived-graph-only boundary |
| `@dagrejs/dagre` | Milestone-gated deferred candidate | Real World/Level/Flow/dependency visual graph layout need only | Exact package/license, Graphlib relation, layout-only boundary; no semantic graph authority |
| `jimp` | Milestone-gated secondary image-processing candidate | RSM-76 | Exact package/transitives, pure-JS claim verification, performance/memory, narrow resize/basic-pixel adapter |
| `maxrects-packer` | Milestone-gated narrow atlas-packing candidate | RSM-76 | Exact package/license, deterministic packing fixtures, stable ordering/rotation policy |
| `simplex-noise` | Milestone-gated procedural/presentation candidate | RSM-43/RSM-83/RSM-86 as proven | Exact version/license, RetroStage RNG injection, version/output-regression policy, no ambient Math.random authority |
| `image-q` | Optional milestone-gated quantization candidate | RSM-76 | Exact license/transitive/provenance, maintenance review, deterministic palette/dither fixtures |
| `poisson-disk-sampling` | Optional/deferred milestone-gated scatter candidate | RSM-57 | Exact package/license/transitive, maintenance review, RetroStage RNG injection, deterministic ordering/performance proof |

### 92.3 Deliberate non-selections / friction controls

The following were reviewed during the pre-RSM-6 technology freeze and are intentionally **not** baseline selections:

```text
axe-core / @axe-core/*
Comlink
MSW
Zod
broad Storybook addon bundles
ts-morph as a core/default architecture dependency
```

Rationale:

- `axe-core` is valuable, but its MPL-2.0 licensing/notice/source obligations and current upstream licensing-identifier discussion create more compliance friction than RetroStage needs in the foundation. It may be reconsidered development-only at a later accessibility milestone after a focused license review.
- Comlink is a sound Apache-2.0 worker-RPC library, but RetroStage already has explicit Electron IPC boundaries plus a conditional Piscina direction for Node worker pools. A second RPC abstraction is deferred until a concrete browser/Web Worker use case proves it removes more complexity than it adds.
- MSW is not selected because the current product is not network/API-centric; add only if a real service-mocking need emerges.
- Zod is not selected because RetroStage already owns the TypeBox/Ajv runtime-schema direction; parallel schema authorities would increase drift risk.
- Storybook itself is only a conditional workbench. Addons are not inherited wholesale; each addon may introduce separate dependencies, telemetry, browser binaries, or licenses.
- `ts-morph` is not part of the core acceleration candidate set. Reconsider only after repeated TypeScript Compiler API boilerplate proves a concrete need that API Extractor or native compiler APIs do not already solve.

### 92.4 Dependency-surface freeze and accepted RSM-6 graph

After this clarification, no new third-party library should be added to canonical planning merely because it is popular or convenient. New additions require an owning milestone, a concrete reduction in code/error/maintenance cost, license/transitive evidence, and an explicit authority boundary.

This freeze does not prevent future admissions; it prevents speculative dependency accumulation.

RSM-6 admits exactly `@babylonjs/core@9.21.2` and `@babylonjs/loaders@9.21.2` as renderer runtime dependencies, plus `babylonjs-gltf2interface@9.21.2` only as a declaration-only package-local development/build strict-peer provider. Inspector, materials, serializers, addons, decoder helpers, Havok, legacy `babylonjs`, unexpected native code, and unexpected WASM are not part of the accepted graph.

---

# Explicit Rejections and Out-of-Scope Directions

## 94. Rejected Architecture Directions

The following are rejected for the reboot baseline:

- Babylon plus a second rendering engine,
- Stride, Godot, Unity, Unreal, Bevy, or Wicked Engine as parallel runtime authority,
- exposing a third-party engine editor as the RetroStage authoring workflow,
- Babylon scene serialization as canonical project format,
- SQLite as canonical project storage,
- React/Zustand state as canonical project storage,
- unrestricted Electron Renderer access to Node or filesystem,
- direct canonical writes by file watchers, plugins, agents, MCP clients, or external tools,
- multiple competing validation authorities,
- multiple competing scene identity systems,
- private uncontrolled runtime loops,
- opaque third-party state persisted without an adapter contract.

---

## 95. Rejected Dependency and Licensing Directions

The following are rejected by default:

- code copied from a repository with no license,
- packages with unknown provenance,
- unreviewed install scripts with broad system access,
- arbitrary downloaded native binaries,
- GPL/AGPL/SSPL or restrictive source-available dependencies without explicit legal approval,
- Non-Commercial or No-Derivatives content in a commercial distribution,
- bundled codecs without patent and distribution review,
- dependencies that cannot produce required notices or source identity,
- packages that require exposing unsafe Electron capabilities,
- external commands that mutate canonical files outside approved transactions.

---

## 96. Out-of-Scope Product Directions

The following remain outside v0:

- public marketplace or storefront,
- payments, seller accounts, entitlements, or DLC commerce,
- full multiplayer or live-service stack,
- full RTS or multi-unit command,
- open-world engine scope,
- unrestricted physics sandbox,
- general-purpose shader IDE,
- general-purpose image editor or texture-painting package,
- general-purpose DAW,
- arbitrary scripting platform with unrestricted host access,
- external companion product required for core authoring,
- general non-Euclidean or procedural world engine,
- MMO/large-scale online world or live-service progression framework,
- colony/resource-management/RTS multi-unit command framework,
- general-purpose RPG framework, deep stat/equipment/encumbrance system, random loot/rarity/affix system, or complex crafting/economy/vendor framework,
- unrestricted procedural world generation,
- full destruction-heavy or unrestricted physics-sandbox gameplay framework,
- Soulslike/character-action combo framework, competitive shooter framework, advanced tactical-cover shooter framework, complex ballistics, or huge weapon/attachment framework,
- platformer/parkour framework, vehicles, or full traversal/climbing system as a first-product requirement,
- general app/UI builder, arbitrary executable custom widgets, remote-web UI runtime, dynamic open-world map/navigation UI, MMO-style quest HUD, full visual-novel engine, VR/spatial UI framework, procedural UI generator, UI marketplace/theme store, or full motion-graphics suite,
- full localization-management product or custom text-shaping/font engine from scratch,
- full non-linear video editor or runtime video-streaming platform,
- account/login infrastructure as a first-product requirement,
- emulator-style full-memory save states or arbitrary mid-frame save,
- arbitrary code as the no-code foundation,
- unrestricted Flow Graph as a substitute for first-class gameplay authoring,

---

# Superseded Historical Decisions

## 97. Superseded Live-Status Claims

All pre-loss claims that a milestone is currently implemented, active, next, passed, or closed are superseded for reboot live status.

They remain historical evidence only.

---

## 98. Superseded Technology Alternatives

Previous discussions of switching the baseline to Godot, Stride, Wicked Engine, or a custom native renderer are superseded by the approved reboot technology contract unless future evidence triggers formal replacement review.

This does not claim those technologies are commercially unusable. It records that they are not the approved RetroStage reboot baseline.

---

## 99. Superseded Named Companion-Product Assumption

The named Mnemos Studio assumption is superseded and removed.

The durable needs are now owned by:

```text
RSM-106 — Native Cutscene / Timeline Runtime and Sequencer
RSM-107 — Cinematic Sequence Interchange / External Timeline Import-Export
```

No package, bridge, roadmap dependency, or product promise may use the removed name as though the product exists.

---

# Open Decisions Owned by Future Milestones

## 100. Open Questions

The following questions remain intentionally open.

| Question | Owner |
|---|---:|
| Exact Windows installer maker | RSM-102 / RSM-119 |
| Exact signing provider and secret workflow | RSM-119 |
| Whether Steamworks features are needed in exported games | RSM-119 |
| Exact Recast/Detour JavaScript/WASM adapter | RSM-59 |
| Exact KTX/Basis texture toolchain | RSM-76 / RSM-95 |
| Exact audio transcode and codec policy | RSM-79 / RSM-95 |
| Whether msgpack IPC is justified | RSM-82 performance evidence |
| Whether Monaco is needed | RSM-98 or scripting decision |
| Whether remote OpenTelemetry export or hosted crash reporting is justified | RSM-115 |
| Exact cinematic interchange formats | RSM-107 |
| Whether the Electron player must later be replaced | Post-evidence architecture review; not baseline |
| Exact plugin distribution model | RSM-117 |
| Exact MCP transport and tool surface | RSM-118 |
| Exact paid Alpha / Early Access price | RSM-119-ADD1 / RSM-120 |
| Exact 1.0 retail price | RSM-119-ADD1 / RSM-120 |
| Exact launch/seasonal discount policy | RSM-119-ADD1 / RSM-120 |
| Exact regional pricing table | RSM-119-ADD1 / RSM-120 |
| Exact Early Access duration | RSM-119-ADD1 / RSM-120 |
| Exact wishlist/marketing target | RSM-119-ADD1 / RSM-120 |
| Exact shipped-language matrix / localization rollout waves | RSM-119-ADD1 / RSM-120 |

Open questions must not be answered implicitly by whichever package a coding agent happens to install first.

---

# Change Control

## 101. Decision Change Rule

A binding decision may be changed only when a proposed replacement includes:

1. the decision ID being changed,
2. the reason the current decision is insufficient,
3. repository or prototype evidence,
4. product impact,
5. roadmap impact,
6. migration impact,
7. dependency and license impact,
8. security and data-safety impact,
9. replacement text,
10. explicit approval.

A dependency upgrade, package experiment, or implementation convenience does not by itself supersede a product decision.

---

## 102. New Decision Admission Rule

A new durable decision must state:

- unique decision ID,
- status,
- decision text,
- consequence,
- scope boundaries,
- roadmap owner,
- relationship to existing decisions,
- whether it changes charter or technology-contract authority.

Duplicate or overlapping decisions should be merged rather than allowed to create competing truth.

---

# Immediate Handoff

## 103. Next Source

Current lifecycle authority remains external to this durable decision registry:

```text
Gate B = ACTIVE / CURRENT
RSM-7 = NEXT ROADMAP MILESTONE / NOT STARTED / NOT AUTHORIZED
live activation = Source 02/08 + separate owner authority
```

RSM-6 is `MILESTONE CLOSED / PASS`: I1-I8 and V1 remain accepted at implementation baseline `dbd3f2be31d89ca36a17ccb4914e21623df424a2`, and closure publication is `34b1148e1c7be12e30f1e962148d40b5027a7b07` with natural CI `32526483832 / 96909482744 / attempt 1 / success`. The post-RSM-6 alignment decisions recorded here are durable future direction only; they do not start RSM-7 or any later implementation.

---

# Approval Statement

## 104. Decision Registry Approval

This decision registry adopts the following reboot direction:

- RetroStage Maker remains a focused commercial Steam creator,
- Babylon.js 9 is the sole renderer/runtime adapter,
- Electron is the desktop shell and initial player shell,
- TypeScript is the primary product language,
- canonical data, commands, validation, identity, gameplay semantics, and export policy remain RetroStage-owned,
- Preview, PIE, and Export remain distinct,
- Project Save and Runtime Save remain distinct,
- third-party dependencies enter through explicit classes and adapter boundaries,
- license, SBOM, notices, native/WASM inventory, backup, restore, and clean-machine proof are product requirements,
- creators may commercially distribute exported games with `0%` RetroStage engine royalty, no per-game/export fee, and no creator-revenue cap,
- exported-game creator and publisher identity remains separate from RetroStage editor identity,
- mandatory RetroStage splash, logo, watermark, or forced player-facing branding is rejected,
- export legal/credits metadata is first-class project data and remains distinct from generated third-party notices,
- localization-safe architecture and deterministic fixtures precede broad translation,
- exact pricing, discount, regional-pricing, wishlist, Early Access duration, and localization rollout values remain milestone-time commercial evidence,
- retro presentation, liminal authoring, camera, audio, UI, animation, VFX, Flow Graph, native sequencing, and creator debugging remain approved future directions,
- the named Mnemos Studio assumption is removed,
- native sequencing remains core and generic cinematic interchange remains optional,
- plugin, MCP, hosted telemetry, codecs, and commerce-related systems remain deferred or conditional,
- no historical milestone status is treated as live reboot implementation truth.

This source becomes authoritative for durable product decisions and deferred scope once approved alongside the charter, technology contract, and canonical roadmap.
