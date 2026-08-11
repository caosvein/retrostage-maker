# RetroStage Maker — Reboot Project Charter

**Document ID:** `00_RSM_REBOOT_PROJECT_CHARTER`  
**Role:** Foundational product, architecture, scope, and source-authority charter  
**Project:** RetroStage Maker  
**Distribution intent:** Commercial desktop creator distributed through Steam and other approved Windows channels  
**Source generation:** Reboot / clean-start  
**Document date:** 2026-08-05  
**Document state:** `ACTIVE FOUNDATIONAL CHARTER / REPOSITORY FOUNDATION ESTABLISHED / RSM-3 CLOSED`  
**Repository:** `ESTABLISHED — see Source 02 and Source 07 for current physical truth`  
**Primary branch:** `main`  
**Supersedes:** Active-status and live-implementation claims in the 2026-07 pre-loss source set  
**Preserves:** Approved product identity, architectural invariants, roadmap intent, engineering lessons, and evidence-driven review discipline from the pre-loss source set

---

## 1. Purpose of This Document

This charter defines what RetroStage Maker is, what it is not, which product and architectural rules must remain true throughout development, how project sources must be interpreted, and how the clean-start reboot must be governed.

This document is intended to be the first source loaded when planning, reviewing, or implementing RetroStage Maker.

It is the authority for:

- product identity,
- commercial positioning,
- supported creator and game scope,
- architectural invariants,
- source interpretation rules,
- scope protection,
- milestone discipline,
- evidence and review expectations,
- external-tool and third-party dependency boundaries.

It is not:

- a live task tracker,
- a repository-state report,
- proof that a feature is implemented,
- a replacement for repository inspection,
- a dependency-version manifest,
- a detailed package map,
- a substitute for milestone validation or closure evidence,
- a specification for features whose responsible milestone has not approved their detailed contract.

The canonical reboot roadmap, technology contract, architecture map, workflow source, and current-state sources must be derived from and remain compatible with this charter.

---

## 2. Reboot Context and Historical Source Status

The previous RetroStage Maker repository and local working files are no longer available after storage and operating-system failure.

Therefore:

- no previous repository path is currently authoritative,
- no previous branch or commit is currently active,
- no previous milestone marked `CURRENT`, `NEXT`, `PASS`, or `CLOSED` is automatically active in the reboot,
- no previous package directory, implementation report, test result, or commit hash proves that the same implementation exists now,
- no previous live handoff may be resumed as though the physical repository still exists.

The 2026-07 source set remains valuable as:

- historical design evidence,
- a record of approved product intent,
- a record of architectural lessons,
- a record of failure modes and correction patterns,
- input to the reboot roadmap and source reconstruction.

The historical source set must be indexed and preserved as `HISTORICAL / PRE-LOSS / SUPERSEDED FOR LIVE STATUS`.

Historical material may inform a new decision, but it becomes active only when explicitly re-adopted by a current reboot source or implemented and validated in the new repository.

### Historical reboot-origin snapshot

At the original date of this charter, before repository bootstrap:

```text
Project state: PRE-REPOSITORY / REBOOT PLANNING
Live repository: NONE
Implemented reboot milestones: NONE
Historical design sources: AVAILABLE
Approved product direction: AVAILABLE
Approved technology direction: Babylon.js 9 + Electron
Next source task: technology/dependency contract, then canonical reboot roadmap
```

Durable lifecycle note:

```text
RSM-3: CLOSED
POST-RSM-3 PRODUCT STRATEGY ALIGNMENT: PASS
Detailed current milestone, task, product-gate, and next-control authority: Source 02 / Source 08
This foundational charter does not independently close a milestone, activate a gate, or authorize a later milestone.
```

---

## 3. Source Authority Model

RetroStage Maker uses authority by question rather than treating every source as interchangeable.

| Question | Authoritative source |
|---|---|
| What physically exists? | Current repository, manifests, lockfiles, tests, build artifacts, and inspected runtime behavior |
| What task is active now? | Repository-local active phase plan and current-milestone source |
| What was reviewed and accepted? | Approved evidence, validation, closure, alignment, and committed review reports tied to the inspected baseline |
| What is the long-term milestone sequence? | `01_RSM_REBOOT_CANONICAL_ROADMAP.md` |
| What is RetroStage Maker and which rules may not be silently violated? | This charter |
| Which technologies and third-party dependencies are approved? | `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md` |
| Which product decisions are adopted, deferred, conditional, or rejected? | `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` |
| How are packages and ownership boundaries organized? | `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md` |
| How must work be planned, reviewed, validated, and committed? | `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md` |
| What is the current snapshot? | `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` and `08_RSM_REBOOT_CURRENT_MILESTONE.md` |
| What did the pre-loss project establish? | `09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md` and indexed historical sources |

### Conflict rule

When two sources appear to conflict:

1. determine whether they answer the same question,
2. prefer the source that is authoritative for that question,
3. prefer physically inspected repository truth for implementation claims,
4. prefer newer approved evidence tied to the same repository baseline,
5. do not allow a lower-level source to silently override this charter's product identity or architectural invariants,
6. use formal change control when an invariant genuinely must change.

### Interpretation rule

A roadmap entry, interface, component name, package name, UI control, placeholder, test stub, document, or successful isolated demo does not prove a usable product capability exists.

A capability may be:

- proposed,
- deferred,
- represented by a contract only,
- represented by a placeholder or type only,
- partially implemented,
- integrated in one layer only,
- validated within a narrow slice,
- implemented across Preview, PIE, and Export,
- milestone-validated,
- closed.

These states must not be treated as equivalent.

---

## 4. Product Definition

RetroStage Maker is a focused commercial desktop creator for building small-to-medium stylized games inspired by the production language, constraints, and atmosphere of the PlayStation 1 and early PlayStation 2 eras.

It is intended to be sold as an independent maker product on Steam.

RetroStage Maker is not a rebranded general-purpose engine editor. Users must interact with RetroStage-owned workflows, documents, terminology, diagnostics, project structure, templates, and export experience.

Its primary use cases are:

- horror games,
- survival-horror-inspired experiences,
- mystery games,
- atmospheric narrative adventures,
- fixed-camera experiences,
- third-person exploration,
- top-down atmospheric exploration,
- isometric atmospheric exploration,
- limited first-person horror,
- liminal and uncanny-space exploration,
- hybrid 3D, skeletal, sprite, billboard, and flipbook-driven retro presentations.

The product is intended for creators who want:

- a constrained and guided production environment,
- genre-aware authoring,
- reusable gameplay recipes,
- strong retro-presentation controls,
- creator-facing validation and diagnosis,
- a shorter path from idea to standalone playable game,
- less engine-level complexity than a general-purpose game engine.

---

## 5. Product Identity Principles

RetroStage Maker must remain:

### 5.1 Genre-first

Recurring horror, mystery, narrative, survival-horror, and atmospheric-production problems should receive first-class workflows rather than being left entirely to low-level scripting.

### 5.2 Presentation-aware

Retro presentation must be authored across coordinated systems. It must not be reduced to one final CRT filter or one mandatory house style.

### 5.3 Validation-driven

The creator should receive explainable problems, capability truth, runtime diagnosis, repair guidance, and export readiness rather than hidden assumptions or silent failures.

### 5.4 Identity-preserving

Templates and genre kits may provide behavior, structure, and defaults. They must not force every exported game to share the same UI, typography, camera language, audio identity, post-processing profile, VFX treatment, or visual branding.

### 5.5 Self-contained at the core

The supported v0 creation path must not depend on a plugin, MCP client, external editor-only service, or hypothetical companion product.

### 5.6 Product-owned

RetroStage owns the canonical project model, authoring language, workflows, validation rules, runtime semantics, export policy, and creator experience. Third-party libraries may accelerate implementation but must not become hidden product authorities.

---

## 6. Core Product Promise

A creator should ultimately be able to:

1. create, open, save, close, reopen, archive, and safely migrate a project,
2. recover approved work through autosave, local snapshots, or a recovery journal,
3. assemble scenes, entities, components, reusable content, and project assets,
4. place and control a protagonist,
5. author supported camera behavior and composition,
6. create interactions, notes, keys, doors, objectives, dialogue, audio, triggers, puzzles, and bounded no-code logic,
7. author a project-specific retro presentation through geometry treatment, textures, materials, lighting, fog, post-processing, animation, sprites, VFX, audio, camera, and player-facing UI,
8. author supported cinematic sequences with RetroStage's native timeline/sequencer,
9. test through Play-in-Editor without corrupting canonical authoring data,
10. diagnose project and runtime problems through centralized validation, structured tracing, and live inspection,
11. validate Preview, PIE, and Export parity for used features,
12. export a standalone Windows game independent of the editor application,
13. run the exported game on a clean supported target machine,
14. package a representative sample for players, investors, review, Early Access evaluation, or public Alpha testing.

---

## 7. Supported v0 Presentation and Control Profiles

The planned v0 profiles are:

- Fixed Camera,
- TPS / Shoulder Camera,
- Top-Down,
- Isometric,
- Limited FPS.

Top-Down and Isometric are understood as:

- single-protagonist,
- directly controlled,
- exploration-oriented,
- atmosphere-oriented,
- not RTS-oriented,
- not multi-unit-command systems.

A profile defines supported camera, control, composition, and relevant authoring behavior. It must not force one mandatory UI skin, sound identity, presentation preset, animation style, or genre-template appearance onto every project.

A profile being listed here does not mean it is implemented. Implementation and support status must be proven by the roadmap, repository, and validation evidence.

---

## 8. Explicitly Out of Scope for v0

RetroStage Maker is not intended to become:

- a full RTS engine,
- a colony simulator,
- a multiplayer platform,
- an open-world engine,
- a base-building system,
- a factory or large automation simulator,
- a multi-unit command system,
- a large-scale economy simulator,
- an unrestricted physics sandbox,
- an unrestricted procedural-world system,
- a general non-Euclidean engine,
- a fully general-purpose RPG framework,
- a general-purpose game engine,
- a general-purpose digital audio workstation,
- an unrestricted shader-development IDE,
- a general-purpose image editor or texture-painting suite,
- an unrestricted procedural texture or material-node environment,
- a virtual-texturing or open-world texture-streaming platform,
- a general-purpose web-application UI builder,
- a public marketplace or storefront,
- a DLC-commerce, payment, entitlement, or creator-monetization platform.

Installable templates, genre kits, presentation profiles, example projects, asset packs, and content bundles may be supported without introducing marketplace or commerce scope.

Any proposal that materially expands scope must state:

- why the expansion is necessary,
- which milestone owns it,
- which existing scope it displaces,
- which architectural and maintenance costs it introduces,
- which licensing, compatibility, validation, security, and export obligations it adds.

No excluded area may enter the product silently through a third-party dependency or convenience implementation.

---

## 9. Product North Star

The retained long-term target is:

**RSM-120 — First Playable Public Alpha / Investor Demo Candidate**

The reboot roadmap may refine milestone order and intermediate gates, but it should preserve this end-to-end product target unless formal change control explicitly supersedes it.

RSM-120 is not a feature-count checkpoint.

A representative project must be able to:

- be created, saved, closed, reopened, archived, and safely migrated,
- recover through an approved autosave or local-snapshot path,
- be authored through scenes, hierarchy, components, assets, and reusable content,
- contain a controllable protagonist,
- use a supported camera profile and creator-authored camera setup,
- include collision, interaction, narrative content, an objective or puzzle flow, and a scene transition,
- use a coherent project-specific retro presentation across relevant visual, animation, VFX, audio, and player-UI systems,
- demonstrate project-specific UI identity rather than a mandatory exported-game skin,
- run bounded no-code logic,
- use at least one native timeline/sequencer sequence,
- expose creator-facing validation and runtime diagnosis,
- run in PIE without canonical authoring-state corruption,
- preserve Preview, PIE, and Export parity for the features used,
- pass project and export validation,
- export as a standalone Windows build,
- launch on a clean supported target machine,
- provide practical player settings and accessibility foundations,
- preserve project compatibility,
- avoid critical data-loss, security, dependency, licensing, and trust blockers.

The representative project must not require:

- an external cinematic-authoring product,
- a plugin,
- an MCP client,
- a network service,
- the RetroStage editor after export,
- Steam running solely to execute the exported game, unless a creator explicitly enables an optional Steamworks-dependent feature.

---

## 10. Canonical Authoring Data

Canonical project content belongs to explicit RetroStage-owned, versioned, serializable authoring documents.

Expected document families include:

- `ProjectDocument`,
- `SceneDocument`,
- component instances,
- asset metadata and asset references,
- project settings and project variables,
- presentation profiles,
- player-UI documents and design tokens,
- audio cues, mixer, and spatial-authoring documents,
- animation, state-machine, sprite, flipbook, and VFX authoring documents,
- prefab and variant documents,
- Flow Graph documents,
- sequence/timeline documents,
- runtime-save schemas approved by their responsible milestones.

### Core rule

```text
RetroStage canonical documents
        ↓
validated projection / compilation
        ↓
derived editor, preview, PIE, and exported-runtime state
```

The following are never canonical merely because they exist in memory:

- Babylon scene objects,
- Babylon nodes, meshes, materials, cameras, textures, particles, or animations,
- React component state,
- Zustand state,
- XState machine state,
- Golden Layout state,
- Electron window state,
- SQLite index rows,
- worker-process memory,
- cached imported assets,
- generated runtime objects.

Derived subsystem state must be rebuildable from canonical authoring data and approved source assets.

---

## 11. Technology Boundary

The approved reboot direction is:

- Electron as the desktop application shell,
- Babylon.js 9 as the sole 3D rendering and runtime-adapter foundation,
- TypeScript as the primary implementation language,
- RetroStage-owned canonical documents and commands as product authority.

Exact versions, packages, license obligations, and milestone-gated dependencies belong to the technology and dependency contract.

### Mandatory boundaries

- Babylon is a renderer/runtime adapter, not the canonical project model.
- Electron is an application and platform shell, not gameplay or project authority.
- React is an editor UI technology, not canonical authoring storage.
- No second game engine, renderer authority, or canonical scene model may be introduced without formal architectural change control.
- The user must not be required to operate a Babylon, Godot, Stride, Unity, Unreal, or other third-party engine editor as part of the supported RetroStage workflow.
- RetroStage terminology, UI, project structure, authoring workflows, diagnostics, and export experience must remain product-owned.

Third-party technology must remain replaceable behind explicit adapters where replacement is technically and economically reasonable.

---

## 12. Editor Preview, PIE, and Export Are Distinct Systems

### 12.1 Editor Preview

Editor Preview is an authoring visualization generated from canonical documents.

It may include:

- selection,
- gizmos,
- camera preview,
- lighting preview,
- presentation preview,
- authoring overlays,
- debug visualization.

Editor-only state must not silently become gameplay state.

### 12.2 Play-in-Editor

PIE is a disposable runtime session created from approved canonical authoring data.

PIE must:

- have explicit start, pause, resume, stop, and failure behavior,
- isolate runtime mutations from canonical authoring documents,
- restore or discard runtime-only state predictably,
- use runtime systems and event/action semantics intended for export,
- expose diagnostics without making debug state canonical.

### 12.3 Exported Runtime

Export is a standalone game application independent of the editor shell.

The exported runtime must not require:

- the editor application,
- editor-only packages,
- source asset folders,
- development tools,
- Babylon Inspector,
- authoring-only state,
- hidden external authoring products.

### Parity rule

A feature working in Preview does not prove it works in PIE.

A feature working in PIE does not prove it works in Export.

Parity must be validated explicitly for applicable:

- gameplay behavior,
- camera,
- collision and interaction,
- rendering and post-processing,
- animation, sprites, and VFX,
- audio,
- player UI,
- Flow Graph,
- sequencing,
- runtime save and settings.

---

## 13. Project Save and Runtime Save Are Separate

### Project Save

Project Save persists canonical authoring content, including approved project, scene, component, asset, presentation, UI, audio, graph, and sequence documents.

### Runtime Save / Checkpoint

Runtime Save persists only approved player-progress and serializable runtime state.

### Prohibited behavior

- Runtime Save must not become a hidden copy of authoring documents.
- Project Save must not serialize arbitrary live runtime objects.
- Editor state must not be mixed into player-progress data.
- Runtime state must not overwrite canonical authoring data.
- Autosave must not silently replace explicit save authority.

These systems require separate schemas, storage policies, migration rules, validation, and recovery behavior.

---

## 14. Stable Identity and Reference Rules

Persistent identity must use explicit typed stable IDs.

Expected identity classes include:

- project,
- scene,
- entity,
- component instance,
- asset,
- prefab and variant,
- graph and graph node,
- sequence, track, clip, marker, and key,
- UI screen, widget, binding, and design token,
- audio clip, cue, bus, zone, and snapshot,
- animation, state, transition, sprite slice, and VFX definition,
- runtime-save object identities when approved.

Persistent references must not depend on:

- array index,
- display name,
- filesystem ordering,
- hierarchy position,
- current editor selection,
- current renderer object identity,
- temporary database row identity,
- transient process memory.

Remapping must be typed, explicit, and validated.

Missing references must produce structured diagnostics rather than silent substitution.

---

## 15. Schema Versioning, Migration, and Unknown Data

Every persisted canonical format must carry an explicit schema version.

Persisted schema changes require:

- an explicit migration path,
- tests for supported source versions,
- deterministic output,
- structured failure behavior,
- compatibility documentation,
- backup or recovery protection before destructive migration.

Safe unknown data should be preserved when preservation is possible without violating security or correctness.

Dangerous, malformed, prototype-polluting, security-sensitive, or structurally ambiguous keys must fail closed.

No migration may silently discard unsupported user-authored data without:

- a blocking diagnostic,
- an explicit user decision,
- a documented conversion rule,
- or an approved compatibility policy.

---

## 16. Mutation and Command Authority

Canonical authoring changes must pass through typed RetroStage mutation boundaries.

Expected mutation sources include:

- Inspector edits,
- hierarchy operations,
- viewport tools,
- Guided Workspace actions,
- templates and recipes,
- asset import and reimport,
- Flow Graph editing,
- sequencer editing,
- future plugin operations,
- future agent or MCP operations.

These sources must converge on compatible command, validation, revision, and undo semantics.

### Prohibited direction

No UI framework, renderer, plugin, agent, file watcher, importer, or MCP client may gain unrestricted direct mutation authority over canonical project files merely because it can access the process or filesystem.

A canonical mutation path should support, as applicable:

- typed input,
- capability checks,
- candidate construction,
- validation,
- atomic application,
- revision authenticity,
- change description,
- undo/redo,
- provenance,
- recovery and rollback.

---

## 17. Runtime Ownership Principles

Runtime timing, lifecycle, dispatch, and failure behavior must remain centrally controlled.

Expected conceptual ownership:

- `RuntimeGameSession` owns runtime lifecycle and session state,
- `RuntimeSystemRegistry` owns system registration, dependency validation, order, and dispatch,
- `RuntimeSystem` implementations are passive behavior modules,
- renderer, physics, audio, navigation, and platform integrations are adapters,
- runtime event/action semantics belong to RetroStage contracts.

Runtime subsystems must not silently create unrelated private frame loops or competing lifecycle authorities.

Third-party systems may execute internal work, but RetroStage must own when and how they enter the product lifecycle.

---

## 18. Package and Dependency Boundaries

The detailed package topology belongs to the architecture and package map. The following principles are mandatory:

- shared packages must not depend on application entrypoints,
- headless domain and validation code must not depend on DOM, Electron, or Babylon,
- runtime core must not depend on the editor shell,
- canonical documents must not depend on renderer implementations,
- editor UI must use public package APIs rather than deep imports,
- package public APIs must be exposed through approved package roots,
- circular package dependencies are prohibited unless a formal architecture change explicitly resolves the ownership problem,
- planned package names or directories do not prove implementation or ownership.

Third-party dependencies must enter through the narrowest practical adapter boundary.

---

## 19. Workspace Modes

RetroStage Maker may provide:

- Classic Workspace,
- Guided Workspace,
- Custom Workspace.

All workspace modes must use the same canonical project model and mutation path.

Workspace switching must not:

- convert the project,
- duplicate canonical scene data,
- create separate project formats,
- restart PIE without an explicit lifecycle reason,
- clear undo history,
- lose unsaved changes,
- alter runtime behavior merely because the UI layout changed.

Workspace modes are authoring experiences, not separate engines.

---

## 20. Creator Stages

The retained Creator Stages are:

- Project,
- Template,
- Story,
- Blockout,
- Gameplay,
- Atmosphere,
- Test,
- Export.

Creator Stages are navigation and workflow lenses.

They are not mandatory linear progression gates.

Users may move freely between stages.

Only authoritative validation results may block Play or Export.

---

## 21. Validation, Capability, and Diagnosis Authority

Validation must be centralized, typed, explainable, and reusable across the editor, PIE, export, Project Doctor, runtime debugger, CI, and future controlled integrations.

Validation concerns may include:

- schema validity,
- semantic validity,
- reference validity,
- missing or stale resources,
- unsupported capabilities,
- incompatible profile choices,
- Play blockers,
- runtime blockers,
- export blockers,
- performance or compatibility warnings,
- repair guidance.

UI panels do not invent validation truth.

Guided Workspace does not invent validation truth.

Export does not invent validation truth.

A visible control, declared component, placeholder package, or successful preview render does not prove feature capability.

Capability availability must derive from an authoritative capability model.

Creator-facing diagnosis should connect:

- authoritative problems,
- stable project, scene, entity, component, asset, graph, sequence, and runtime identities,
- structured logs,
- event/action traces,
- live runtime inspection,
- Flow Graph debugging,
- asset diagnostics,
- export readiness,
- recovery guidance.

Separate diagnostic surfaces must not silently contradict one another.

---

## 22. Retro Presentation Is a Multi-Layer Authoring System

Retro presentation must not be reduced to one hardcoded filter.

Supported presentation may combine:

- geometry treatment,
- internal resolution and upscale policy,
- texture semantics, filtering, mip, palette, atlas, and derivative policies,
- material and shader behavior,
- lighting, shadows, fog, and atmosphere,
- post-processing and display simulation,
- camera-specific presentation,
- skeletal animation,
- sprite, billboard, and flipbook animation,
- world-space and screen-space VFX,
- spatial and adaptive audio,
- project-specific player UI and typography.

Presentation settings must be canonical authored data.

Babylon materials, render targets, pipelines, effects, audio objects, and other runtime objects remain derived.

The product must support coherent defaults without forcing all games into one RetroStage-branded visual identity.

---

## 23. Liminal and Uncanny-Space Direction

Liminal-space support is a constrained horror and atmospheric-authoring direction.

It may include:

- repeated rooms and corridors,
- controlled architectural variation,
- loop counters and anomaly state,
- section substitution,
- conditional exits,
- impossible-transition illusions,
- continuity teleports,
- lighting, audio, camera, VFX, and timeline-controlled anomalies.

It does not imply:

- unrestricted procedural worlds,
- arbitrary topology mutation,
- a general non-Euclidean engine,
- unbounded runtime world generation.

Liminal systems must remain authorable, debuggable, validated, bounded, and compatible with save, PIE, and export requirements.

---

## 24. Native Sequencing and External Cinematic Interchange

RetroStage Maker must provide sufficient native timeline/sequencer authoring for supported v0 cinematic, anomaly, camera, audio, dialogue, VFX, lighting, UI, and event workflows.

There is no Mnemos Studio dependency or active Mnemos product scope.

No hypothetical companion product may appear in the active roadmap as a required product dependency.

External cinematic, animation, audio, or editorial tools may be supported later through a generic, optional, validated interchange contract.

Expected separation:

- native sequence authoring and runtime belong to the RetroStage core product,
- external timeline import/export is an optional interoperability capability,
- external files do not become canonical project authority merely because they can be imported,
- import must support preview, validation, reference remapping, provenance, unsupported-data diagnostics, and safe review,
- the core RSM-120 representative project must remain producible without an external cinematic tool.

The canonical roadmap should represent this as:

- native timeline/sequencer milestone,
- generic cinematic sequence interchange / external timeline import-export milestone.

---

## 25. Third-Party Dependency Principles

Third-party technologies may serve four roles:

- engine or subsystem adapter,
- editor infrastructure,
- pipeline accelerator,
- quality, build, security, or compliance tooling.

They must not replace RetroStage-owned:

- canonical documents,
- stable identity,
- commands and mutation semantics,
- validation truth,
- capability truth,
- creator workflows,
- runtime event/action semantics,
- diagnostics,
- export policy,
- product identity.

### Dependency admission requirements

Every production dependency must have:

- a concrete roadmap-owned need,
- an exact package and version,
- an approved license classification,
- a transitive dependency review,
- a native/WASM/binary inventory when applicable,
- an adapter and ownership boundary,
- deterministic build expectations,
- update and replacement considerations,
- tests appropriate to its risk,
- inclusion in SBOM and third-party notices when distributed.

### Default license direction

Permissive licenses may be considered through the technology contract. Unknown, unlicensed, non-commercial, source-available-with-restrictions, or copyleft dependencies must not enter a proprietary commercial distribution without explicit review and approval.

GitHub availability alone is not permission to copy, modify, or distribute code.

### Dependency minimization

One responsibility should have one selected authority unless a formal compatibility layer justifies otherwise.

A second renderer, physics authority, schema authority, state authority, or canonical scene model must not be added for convenience.

---

## 26. Data Safety, Backup, and Recovery

No source file, repository, asset, build evidence, or project must rely on one local storage device as its only copy.

The reboot repository must establish from the beginning:

- remote Git hosting,
- frequent reviewed commits,
- push discipline after accepted closures,
- off-device backups or snapshots,
- versioned source assets where practical,
- reproducible bootstrap instructions,
- pinned toolchain and lockfiles,
- recovery and restore testing,
- project autosave and local recovery design,
- portable project archive support at the responsible milestone.

A backup system is not considered proven until restore has been tested.

Generated caches and local indexes must be rebuildable.

Canonical project files and approved source assets must not exist only inside disposable caches, databases, or application-specific temporary storage.

---

## 27. Milestone Discipline

Large milestones must not jump directly from title to implementation.

Preferred structure:

- `A` — current-state, need, or existing-code audit,
- `B` — deep contract design,
- `C` — integration-boundary and third-party-candidate design,
- `D` — readiness and implementation plan,
- `I1...In` — implementation slices,
- `V1` — milestone-wide validation,
- `CLOSE1` — final closure and handoff,
- `ALIGN1` — source-of-truth alignment when required,
- `FIXn` — targeted correction,
- `ADDn` — approved cross-cutting addendum.

Not every milestone requires every label. Every large or high-risk milestone requires enough evidence to establish:

- scope,
- ownership,
- dependency boundaries,
- implementation,
- validation,
- closure,
- future-boundary preservation.

### No milestone skipping

A later milestone must not be activated merely because its feature appears useful.

Dependencies, current phase authority, and exit criteria must be respected.

### Vertical-slice priority

The reboot roadmap should expose product risk early through an end-to-end vertical slice:

```text
create project
→ create scene
→ create entity
→ edit component
→ preview
→ save and reopen
→ start and stop disposable PIE
→ preserve canonical authoring data
→ produce a minimal standalone build
```

Early export validation is preferred over postponing all standalone-runtime risk until the end of the roadmap.

---

## 28. Definition of Done

A milestone is not complete merely because:

- a design document exists,
- a type or interface exists,
- a package directory exists,
- a UI control is visible,
- code compiles,
- one smoke test passes,
- an implementation report was written,
- a feature appears functional in Preview only,
- an agent reports `READY`, `PASS`, or `COMPLETE`.

A milestone is complete only when its approved scope has:

- clear ownership,
- implemented behavior,
- appropriate automated tests,
- relevant integration validation,
- explicit failure behavior,
- migration and compatibility handling when persisted data is involved,
- security and licensing review when applicable,
- Preview/PIE/Export validation when applicable,
- clean repository state or an explicitly reviewed change inventory,
- reviewed evidence tied to the exact baseline,
- approved closure and handoff.

The narrowest honest status must be used.

---

## 29. Engineering, Review, and Commit Principles

The detailed workflow belongs to the engineering and review source. The following principles are mandatory:

- one active implementation task at a time,
- baseline identity before work begins,
- explicit allowed and forbidden scope,
- exact source and interface inspection,
- no trust based on summaries alone,
- no agent-created commit unless explicitly authorized by the human-controlled workflow,
- exact diff and staged inventory review,
- validation tied to the inspected patch,
- post-commit and post-push verification,
- explicit distinction between observed fact, historical evidence, approved design, and future intent,
- no repeated correction loops for wording that does not affect correctness, scope, evidence, trust, or repository state,
- no closure while contradictory repository evidence remains unresolved.

Evidence quality takes priority over confident wording.

---

## 30. Working With Coding Agents, MCP, and Automation

Coding agents may assist with:

- source inspection,
- narrow implementation,
- tests,
- documentation,
- evidence collection,
- migration fixtures,
- repetitive controlled transformations.

They must not be treated as trusted authorities merely because they claim completion.

Future controlled product mutation through MCP or another agent interface must use:

- attributable agent identity,
- least-privilege project, scene, entity, asset, and command scopes,
- typed public commands,
- capability checks,
- dry-run or preview,
- structured diff,
- authoritative validation,
- explicit approval policy,
- undo or rollback,
- provenance and audit records,
- Electron, filesystem, and workspace-trust boundaries.

Read-only tools should precede write tools.

An agent or MCP client must not receive unrestricted filesystem or canonical project-file write access merely because it can connect to the editor.

---

## 31. Steam and Commercial Product Requirements

RetroStage Maker is intended to be sold as an independent creator product.

Therefore:

- the user-facing product must be branded and experienced as RetroStage Maker,
- third-party editor interfaces must not be exposed as the supported product workflow,
- exported games must be independently launchable,
- third-party licenses, notices, and binary inventories must be handled systematically,
- dependency changes must be reviewed for commercial redistribution,
- source assets and user projects must remain owned and controlled according to the product's published terms,
- telemetry and crash reporting must be opt-in or otherwise governed by an explicit privacy contract,
- project files must remain portable and recoverable,
- Steam integration must be optional to the core project and runtime model unless a creator explicitly enables a Steam-specific feature,
- no marketplace, payment, DLC, or entitlement system is implied by Steam distribution of the maker itself.

Commercial readiness requires product behavior, licensing, security, data safety, supportability, onboarding, and compatibility—not only a successful build.

---

## 32. Deferred Product Areas

The following areas remain later roadmap concerns and must not be pulled into the initial reboot foundation without approved dependency need:

- mature Problems panel and capability matrix,
- full change-review, undo, merge, and collaboration architecture,
- mature autosave, local snapshots, and recovery journal,
- all supported camera runtime profiles and composition toolkit,
- complete retro-presentation profiles, LookDev, and texture-derivative pipeline,
- liminal blockout, anomaly, and looping-space systems,
- mature Content Browser and asset import/reimport workflows,
- skeletal, sprite, flipbook, animation-controller, and VFX authoring,
- constrained physics interaction beyond the first approved collision slice,
- navigation bake, patrol, and AI authoring,
- player-facing UI design-language system,
- full audio import, cue, mixer, spatial, adaptive, and authoring systems,
- Flow Graph,
- runtime debugger and live entity inspection,
- full native timeline/sequencer,
- external cinematic sequence interchange,
- runtime settings, localization, and accessibility,
- plugin SDK and permissions,
- MCP read/write integration,
- mature export compiler, optimization, Project Doctor, and packaging,
- installer and distribution,
- telemetry and feedback privacy,
- security hardening,
- public Alpha polish.

Installable content bundles remain a planned content-management capability.

A public marketplace, storefront, payment, entitlement, or DLC-commerce system remains outside v0 requirements.

---

## 33. Decision Rules for Project Assistance

When assisting with RetroStage Maker:

1. Do not claim a feature exists without current repository or approved evidence.
2. Do not infer current status from the long-form roadmap when a current phase source exists.
3. Do not treat planned architecture as implemented architecture.
4. Do not treat a type, placeholder, package, menu entry, or isolated branch as a usable feature.
5. Do not merge milestone scopes for convenience.
6. Do not skip audits for large or high-risk systems.
7. Do not approve a commit from a summary alone when repository evidence is contradictory.
8. Preserve accepted historical evidence without presenting it as live implementation.
9. Keep the current task narrow and explicit.
10. Distinguish observation, historical fact, approved decision, inference, and future intent.
11. Do not introduce a new third-party dependency without identifying its owner, purpose, license status, and adapter boundary.
12. Do not use a hypothetical product as an active dependency.
13. Do not allow UI, renderer, database, or agent state to become canonical project truth.
14. Do not postpone all export, recovery, security, or licensing risk until the end of the roadmap.
15. Prefer partial truthful completion over unsupported closure claims.

---

## 34. Change Control for This Charter

This charter may change only when a proposed change:

- identifies the exact affected sections,
- states the reason and product consequence,
- identifies roadmap and architecture impact,
- identifies compatibility, migration, licensing, security, and schedule impact,
- distinguishes clarification from a genuine policy change,
- is reviewed against current source authority,
- is recorded in the product decisions source when durable.

Changes to the following require explicit architectural and product approval:

- product identity,
- supported v0 profiles,
- general-purpose-engine exclusion,
- canonical data ownership,
- Preview/PIE/Export separation,
- Project Save/Runtime Save separation,
- stable identity policy,
- single-renderer direction,
- core self-containment,
- standalone export requirement,
- commercial dependency policy,
- evidence-driven milestone discipline.

A lower-level implementation convenience is not sufficient reason to weaken an invariant.

---

## 35. Historical Source-Authoring Handoff

After this charter was originally approved, the pre-repository source reconstruction order was:

1. `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
2. `01_RSM_REBOOT_CANONICAL_ROADMAP.md`
3. `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
4. `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
5. `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
6. `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
7. `08_RSM_REBOOT_CURRENT_MILESTONE.md`
8. `09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`
9. `RSM-2-V1-SOURCE-SET-CONSISTENCY-REVIEW.md`

`07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` was intentionally excluded from the pre-repository source-authoring sequence. It was materialized during RSM-3 after the physical repository path, branch, manifests, scripts, validation commands, and restore procedure existed, and is now authoritative under its current disposition.

No repository bootstrap should be treated as approved implementation work until the technology/dependency contract and the first reboot roadmap gate define:

- the exact toolchain,
- the repository and backup policy,
- the initial package boundaries,
- the first vertical-slice exit criteria,
- the validation and evidence requirements.

---

## 36. Charter Approval Statement

Approval of this document means:

- the pre-loss implementation status has been reset,
- the pre-loss product and architecture lessons have been intentionally preserved,
- RetroStage Maker remains a focused commercial Steam creator rather than a general-purpose engine,
- Electron and Babylon.js 9 are the approved foundational direction,
- RetroStage-owned canonical data and workflows remain authoritative,
- Mnemos Studio has been removed from active product scope,
- native sequencing remains a core capability,
- external cinematic interchange remains optional and generic,
- the reboot may proceed to the technology/dependency contract and canonical roadmap.
