# RetroStage Maker — Reboot Canonical Roadmap

**Document ID:** `01_RSM_REBOOT_CANONICAL_ROADMAP`  
**Role:** Canonical long-range product, architecture, dependency-order, and product-gate roadmap  
**Project:** RetroStage Maker  
**Roadmap namespace:** `RSM-0` → `RSM-120`  
**Document date:** 2026-08-05  
**Document state:** `PRE-REPOSITORY / REBOOT PLANNING`  
**Repository:** `NOT YET CREATED`  
**Primary product target:** `RSM-120 — First Playable Public Alpha / Investor Demo Candidate`  
**Governed by:** `00_RSM_REBOOT_PROJECT_CHARTER.md`  
**Technology authority:** `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`  
**Historical basis:** 2026-07 pre-loss roadmap, charter, decisions, architecture, milestone, and workflow sources  
**Supersedes:** The pre-loss roadmap for all live reboot sequencing and milestone identity

---

## 1. Purpose

This document defines the canonical reboot sequence for RetroStage Maker from source reconstruction through a commercial-quality public Alpha candidate.

It defines:

- the order and ownership of reboot milestones,
- the product gates that determine real progress,
- the earliest acceptable vertical slice,
- where approved third-party technologies enter the project,
- which responsibilities remain RetroStage-owned,
- the dependency and evidence conditions between major systems,
- the point at which a feature may be called usable, integrated, validated, or closed,
- the full product direction preserved from the historical roadmap.

This document does not:

- prove that any code exists,
- report live repository status,
- replace repository inspection,
- replace the active milestone source,
- approve exact dependency versions beyond the technology contract,
- allow a roadmap label to substitute for validation evidence,
- treat historical `PASS`, `CLOSED`, `CURRENT`, or `NEXT` labels as live reboot status.

Live status belongs to:

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
08_RSM_REBOOT_CURRENT_MILESTONE.md
repository-local plans and committed evidence
```

---

## 2. Roadmap Reset and Historical Identity

The reboot reuses the `RSM-0` → `RSM-120` namespace for the new canonical sequence.

Historical milestone references must therefore be identified as pre-loss when ambiguity is possible, for example:

```text
PRE-LOSS RSM-25
REBOOT RSM-25
```

A matching number does not imply matching implementation, scope, status, or evidence.

The reboot roadmap preserves the historical product goals but intentionally changes sequencing so that the following risks are addressed earlier:

- remote backup and restore,
- reproducible bootstrap,
- Electron security,
- runtime schema validation,
- architecture tests,
- third-party license evidence,
- minimal standalone player generation,
- clean-machine execution,
- Preview/PIE/Export ownership boundaries.

---

## 3. Product North Star

RetroStage Maker is a focused commercial desktop creator for small-to-medium games inspired by PlayStation 1 and early PlayStation 2 production language.

The supported direction includes:

- horror,
- survival-horror-inspired experiences,
- mystery,
- atmospheric narrative adventure,
- fixed-camera experiences,
- TPS / shoulder-camera exploration,
- top-down atmospheric exploration,
- isometric atmospheric exploration,
- limited first-person horror,
- liminal and uncanny-space experiences,
- hybrid 3D, skeletal, sprite, billboard, flipbook, particle, audio, and UI presentation.

It is not a general-purpose engine.

The creator must ultimately support this complete representative chain:

```text
Create project
→ author scenes and gameplay
→ import and manage content
→ configure camera and presentation
→ test in disposable PIE
→ diagnose problems
→ validate used capabilities
→ cook content
→ export standalone Windows game
→ run on a clean supported machine
```

---

## 4. Binding Architectural Invariants

All milestones must preserve the following rules.

### 4.1 Canonical data is RetroStage-owned

Canonical authoring data belongs to explicit, versioned RetroStage documents. Babylon objects, React state, Electron state, XState state, Golden Layout state, SQLite rows, caches, and generated runtime objects remain derived.

### 4.2 Babylon.js 9 is the sole renderer/runtime adapter

Babylon may render, load approved assets, animate, simulate approved presentation behavior, and host derived runtime objects. It does not own project identity, scene identity, persistence, validation truth, or gameplay authoring semantics.

### 4.3 Electron is the desktop shell

Electron owns approved desktop concerns through strict Main/Preload/Renderer boundaries. Renderer code receives no unrestricted Node or filesystem access.

### 4.4 Preview, PIE, and Export are distinct

A feature is not complete merely because it appears in Editor Preview. Used capabilities must eventually prove authoring, disposable PIE, cooked runtime, exported player, validation, and diagnostics as appropriate.

### 4.5 Project Save and Runtime Save are distinct

Authoring content and player progress are separate schemas, storage paths, migration responsibilities, and security domains.

### 4.6 Mutation has one authority

Canonical changes route through typed RetroStage commands, validated candidates, authoritative sessions, and later undoable history. UI stores, renderer state, file watchers, indexes, and agents do not directly become mutation authorities.

### 4.7 Third-party components accelerate, but do not govern

Every production dependency must have:

- a concrete milestone need,
- an approved license state,
- an adapter boundary,
- exact-version and lockfile evidence,
- transitive/native/WASM review where applicable,
- a replacement or removal path.

### 4.8 The core product is self-contained

Native creator workflows must not depend on a hypothetical or separate companion product. Native sequencing is core. External cinematic interchange is optional and generic.

---

## 5. Status Vocabulary

This roadmap intentionally does not carry a live status snapshot.

Current-state sources may use:

- `SOURCE COMPLETE` — a source document is approved; no implementation implication,
- `PLANNED` — canonical future scope,
- `CURRENT` — active milestone in the current-state source,
- `NEXT / UNBLOCKED` — approved next work,
- `BLOCKED` — named dependency prevents activation,
- `IMPLEMENTATION PASS` — approved implementation slice passed,
- `MILESTONE CLOSED / PASS` — all milestone exits and evidence passed,
- `SUPERSEDED` — replaced by a newer approved source or correction.

A milestone number alone never communicates live status.

---

## 6. Standard Milestone Execution Model

Large, cross-cutting, security-sensitive, persistence-sensitive, or dependency-heavy milestones should use:

```text
A — Current-state and need audit
B — Contract and ownership design
C — Integration and adapter boundary
D — Detailed readiness plan
I1…In — Narrow implementation slices
V1 — Milestone-wide validation
CLOSE1 — Closure and next handoff
ALIGN1 — Source alignment when required
FIXn / ADDn — Targeted correction or approved addendum
```

Small implementation milestones may use a reduced form only when scope, authority, risk, tests, and exit conditions are already unambiguous.

Every dependency-introducing milestone must include a dependency admission sub-gate from the technology contract.

---

## 7. Definition of Done

Unless a milestone explicitly narrows the requirement, closure requires:

1. exact approved scope is implemented,
2. forbidden scope is absent,
3. architecture boundaries pass,
4. canonical data ownership remains correct,
5. relevant validation and diagnostics exist,
6. tests pass at the appropriate layer,
7. Preview/PIE/Export responsibility is explicitly classified,
8. dependency and license evidence is updated,
9. documentation and current-state sources align,
10. repository state, commit, and remote evidence pass the engineering workflow,
11. recovery or rollback exists for data-sensitive changes,
12. the next milestone receives a truthful handoff.

---

## 8. Product Gates

| Gate | Milestones | Product outcome |
|---|---:|---|
| **Gate A — Governed Reboot** | RSM-0–4 | Product, technology, roadmap, repository safety, and review discipline are authoritative |
| **Gate B — Secure Vertical Slice** | RSM-5–18 | Create, edit, save, reopen, play, export, restore, and validate one minimal project |
| **Gate C — Controlled Authoring Foundation** | RSM-19–36 | Core data, packages, validation, commands, workspaces, jobs, indexes, and editor ownership are controlled |
| **Gate D — First Playable Creator** | RSM-37–55 | A creator can author and export a minimal representative game loop with camera, interaction, narrative, and presentation |
| **Gate E — Genre-Capable Gameplay Creator** | RSM-56–72 | Level design, liminal structure, AI, gameplay, save, input, and creator diagnostics are genre-capable |
| **Gate F — Production Content Creator** | RSM-73–91 | Assets, materials, animation, VFX, UI, audio, performance, and compatibility are production-capable |
| **Gate G — Standalone Build Product** | RSM-92–103 | Deterministic, diagnosed, optimized, packaged Windows games can be produced and verified |
| **Gate H — No-Code Narrative Production** | RSM-104–111 | Flow Graph, sequencing, interchange, genre kits, templates, and installable packs form a usable no-code production layer |
| **Gate I — Reliable Public Alpha Product** | RSM-112–120 | QA, recovery, compatibility, extensibility, security, compliance, onboarding, distribution, and Alpha polish converge |

---

# Gate A — Governed Reboot

## RSM-0 — Reboot Product Charter / Source Authority Reset
**Purpose:** Define the reboot truth model, preserve approved product intent, reset lost implementation status, and establish non-negotiable product and architecture invariants.  
**Third-party placement:** No runtime dependency. Source work only.  
**Key deliverables:**
- Approve the focused Steam creator identity and v0 exclusions.
- Classify all pre-loss implementation claims as historical rather than live.
- Establish canonical-data, Preview/PIE/Export, save-model, and single-renderer invariants.
- Define source authority and formal charter change control.
**Exit:** `00_RSM_REBOOT_PROJECT_CHARTER.md` is approved and becomes the first source loaded for product and architecture questions.

## RSM-1 — Technology / Dependency / Commercial License Contract
**Purpose:** Select the approved foundation stack, dependency classes, license policy, supply-chain controls, and adapter boundaries.  
**Third-party placement:** Babylon.js 9, Electron, Node.js, TypeScript, pnpm, React, Vite, and the approved supporting stack are classified; milestone-gated and conditional tools remain uninstalled.  
**Key deliverables:**
- Define exact-version pinning and lockfile policy.
- Define direct, transitive, native, WASM, notice, and SBOM evidence.
- Reject second-engine and second-canonical-model directions.
- Define dependency admission, upgrade, replacement, and removal workflows.
**Exit:** `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md` is approved without silently claiming that packages are installed.

## RSM-2 — Canonical Roadmap / Reboot Source-Set Reconstruction
**Purpose:** Create the canonical reboot milestone order and define the remaining source reconstruction sequence.  
**Third-party placement:** No runtime dependency. Uses the charter, technology contract, and historical source set as inputs.  
**Key deliverables:**
- Preserve all approved product targets from the historical roadmap.
- Move export, restore, security, testing, and license proof into the opening gates.
- Remove named hypothetical companion-product dependencies.
- Define product gates, milestone execution rules, and final Alpha acceptance.
**Exit:** This roadmap is approved and hands off creation of the decision, architecture, workflow, current-state, current-milestone, historical-index, and source-review sources. The repository-command source remains intentionally deferred until RSM-3 creates physical repository reality.

## RSM-3 — Repository / Remote Backup / Reproducible Bootstrap
**Purpose:** Create the new repository, remote origin, toolchain lock, monorepo skeleton, backup policy, and restore proof.  
**Third-party placement:** Node.js, pnpm, TypeScript, ESLint, Prettier, dependency-cruiser, Knip, Vitest, GitHub Actions, dependency review, and CycloneDX tooling may enter under exact approved versions.  
**Key deliverables:**
- Create `apps/` and `packages/` only from the approved initial topology.
- Commit lockfiles, toolchain identity, CI baselines, license policy, and source documents.
- Push the first baseline to an off-device remote.
- Perform and record a clean-clone/bootstrap/restore test.
**Exit:** A clean supported machine can clone, install, validate, and build the approved empty foundation without relying on lost local state.

## RSM-4 — Engineering / Review / Milestone Gate Baseline
**Purpose:** Activate evidence-driven task, review, commit, and closure discipline before product implementation begins.  
**Third-party placement:** Development tooling from RSM-3; no new production dependency.  
**Key deliverables:**
- Activate and repository-validate the approved one-active-task, allowed/forbidden scope, baseline, validation, staging, review, commit, and push rules.
- Materialize milestone templates and evidence manifests against the physical repository.
- Activate dependency-admission and architecture-check requirements in CI and repository practice.
- Update and commit the current-state and current-milestone sources against the verified RSM-3 baseline.
**Exit:** No implementation task can begin without a narrow plan, baseline evidence, validation commands, and closure criteria.

# Gate B — Secure Vertical Slice

## RSM-5 — Electron Secure Desktop Shell Foundation
**Purpose:** Launch the RetroStage desktop application with strict Main, Preload, and Renderer boundaries.  
**Third-party placement:** Electron, Electron Forge core, Vite integration, and approved build tooling.  
**Key deliverables:**
- Enable context isolation and renderer sandboxing.
- Disable unrestricted Node integration in the renderer.
- Expose only a narrow typed preload API.
- Establish application lifecycle, window ownership, CSP direction, and development/production separation.
**Exit:** A branded RetroStage shell launches securely and architecture tests reject unsafe renderer access patterns.

## RSM-6 — Babylon.js 9 Viewport / Renderer Adapter Bootstrap
**Purpose:** Create the sole 3D viewport and renderer-adapter foundation without making Babylon canonical.  
**Third-party placement:** `@babylonjs/core`, `@babylonjs/loaders`, selected materials support, and serializers restricted to derived/debug use.  
**Key deliverables:**
- Create a viewport, camera, grid, render loop, resize handling, and device-loss direction.
- Define renderer handles keyed by RetroStage stable identity.
- Keep Babylon scene objects replaceable and disposable.
- Keep Babylon Inspector development-only.
**Exit:** A derived scene can render in the editor while headless canonical documents remain possible.

## RSM-7 — Canonical Project / Scene Document Foundation
**Purpose:** Define the first versioned project, scene, entity, component-envelope, and asset-reference documents.  
**Third-party placement:** RetroStage-owned TypeScript packages; no third-party state model may own persistence.  
**Key deliverables:**
- Define deterministic serialization and explicit schema versions.
- Separate authoring documents from editor preferences and generated files.
- Define unknown-data preservation policy.
- Create headless fixtures independent of Electron, React, and Babylon.
**Exit:** Projects and scenes can be created, parsed, serialized, and compared without renderer or UI ownership.

## RSM-8 — Stable Identity / Schema Migration / Reference Foundation
**Purpose:** Establish durable IDs, reference types, migration order, remapping, and missing-reference diagnostics.  
**Third-party placement:** TypeBox and Ajv may support shape validation after exact package identity is approved.  
**Key deliverables:**
- Define project, scene, entity, component, asset, and future document identities.
- Prohibit display-name, array-index, and renderer-object identity as persistent references.
- Create explicit migration functions and future-version rejection.
- Create deterministic fixtures for ID preservation and remapping.
**Exit:** A supported old fixture migrates to the current schema without silent identity or unknown-data loss.

## RSM-9 — Editor Shell / Hierarchy / Inspector Vertical Slice
**Purpose:** Create the first product-owned editor workspace around the Babylon viewport.  
**Third-party placement:** React, React DOM, selected Radix primitives, Golden Layout behind an adapter, react-window where scale requires it, CSS Modules, and CSS variables.  
**Key deliverables:**
- Create viewport, hierarchy, inspector, problems placeholder, and project navigation surfaces.
- Keep panel layout local and non-canonical.
- Create RetroStage design tokens and terminology.
- Prove keyboard focus and basic accessibility behavior.
**Exit:** The user can navigate a project and select an entity through a branded RetroStage interface without exposure to a third-party engine editor.

## RSM-10 — Transient State / Workflow / Command Authority Foundation
**Purpose:** Separate UI state, lifecycle state, and canonical mutation authority.  
**Third-party placement:** Zustand for transient UI state; XState for approved workflows; RetroStage commands for canonical changes.  
**Key deliverables:**
- Define selection and panel state as transient.
- Define project-open, save, PIE, and export lifecycle machines at foundation level.
- Route canonical edits through typed commands and validated candidates.
- Prohibit Zustand, XState, React, Babylon, and IPC handlers from direct document authority.
**Exit:** A basic entity edit travels through one typed command path and produces an auditable canonical revision.

## RSM-11 — Runtime Schema / IPC Validation Foundation
**Purpose:** Validate files and all security-sensitive IPC boundaries at runtime.  
**Third-party placement:** TypeBox and Ajv under the technology contract.  
**Key deliverables:**
- Define schemas for initial documents, command payloads, and preload requests/responses.
- Return structured paths and diagnostic identities.
- Separate structural validation from semantic validation.
- Reject malformed or unauthorized requests before filesystem or process actions.
**Exit:** Malformed project and IPC fixtures fail safely with structured diagnostics and no partial mutation.

## RSM-12 — Component Registry / Validation / Inspector Binding Foundation
**Purpose:** Create the authoritative registry for component metadata, factories, validation, Inspector descriptors, and safe unknown components.  
**Third-party placement:** RetroStage-owned registry and adapters; no new third-party authority.  
**Key deliverables:**
- Register built-in component definitions through public package APIs.
- Generate Inspector descriptors without hardcoded UI type lists.
- Preserve unknown component payloads safely.
- Route replacement and removal through authentic session operations.
**Exit:** A registered component can be created, inspected, edited, validated, saved, reopened, and projected without direct document mutation.

## RSM-13 — Selection / Transform / Basic Hierarchy / Scene Projection
**Purpose:** Connect canonical transform edits to selection, gizmos, hierarchy presentation, and Babylon projection.  
**Third-party placement:** Babylon gizmo/picking facilities behind RetroStage adapters; React UI remains non-canonical.  
**Key deliverables:**
- Define the first transform convention and candidate edit flow.
- Project stable entity IDs to disposable renderer objects.
- Support create, select, move, rotate, scale, and delete for the minimal slice.
- Ensure renderer refresh does not reverse-write arbitrary Babylon state.
**Exit:** Transform edits survive save/reopen and produce matching Preview state from canonical documents.

## RSM-14 — Project Create / Open / Save / Dirty-State Foundation
**Purpose:** Implement project lifecycle and explicit persisted-state boundaries.  
**Third-party placement:** Electron Main filesystem services, typed preload API, Chokidar only for observed external changes where needed.  
**Key deliverables:**
- Create and open a project through RetroStage-owned paths.
- Track clean, dirty, saving, failed, and externally changed states.
- Validate paths and trusted workspace identity.
- Prevent file-watcher events from becoming direct mutation commands.
**Exit:** A project can be created, edited, saved, closed, reopened, and externally changed without silent overwrite.

## RSM-15 — Atomic Save / Backup / Autosave / Recovery Foundation
**Purpose:** Protect canonical authoring content against interrupted writes and local failure.  
**Third-party placement:** Electron filesystem services and fflate for approved snapshot or bundle compression.  
**Key deliverables:**
- Use temporary writes, fsync/replace strategy where supported, and recoverable backups.
- Create bounded autosave or local snapshots separate from explicit save.
- Record recovery candidates and integrity metadata.
- Test interruption and restore scenarios.
**Exit:** A simulated interrupted save cannot destroy the last approved project state, and recovery candidates are explainable.

## RSM-16 — Runtime Framework / Clock / Disposable PIE Foundation
**Purpose:** Create runtime session ownership, scheduler, pause/stop policy, and disposable Play-in-Editor construction.  
**Third-party placement:** XState may coordinate lifecycle; Babylon remains visual/runtime adapter rather than session authority.  
**Key deliverables:**
- Define `RuntimeGameSession`, system registry, tick policy, and teardown.
- Construct PIE from a canonical snapshot.
- Prevent PIE mutations from changing authoring documents.
- Restore editor input, selection, and preview state after Stop.
**Exit:** PIE starts and stops repeatedly without canonical mutation, leaked runtime ownership, or duplicate loops.

## RSM-17 — Collision / Grounding / Playable Sandbox / Vertical-Slice Tests
**Purpose:** Add the first bounded playable movement and collision slice with permanent test evidence.  
**Third-party placement:** `@babylonjs/havok` may enter only after its milestone-gated native/WASM license and inventory review passes; otherwise use an approved temporary test seam without committing a second physics authority.  
**Key deliverables:**
- Implement protagonist movement, grounding, blocker collision, and simple trigger observation.
- Define physics adapter ownership and teardown.
- Add Vitest contract tests and Playwright Electron smoke tests.
- Record native/WASM artifacts when Havok ships.
**Exit:** The minimal scene is playable in PIE and the editor passes headless, integration, and Electron smoke validation.

## RSM-18 — Minimal Standalone Player / Early Cooking / Clean-Restore Gate
**Purpose:** Prove the complete product spine before expanding feature breadth.  
**Third-party placement:** Electron Forge for editor/player packaging; Babylon runtime adapter; initial cooking owned by RetroStage.  
**Key deliverables:**
- Separate `editor-electron` and minimal `player-electron` applications.
- Cook only required canonical and source-derived content for one sample.
- Export a standalone Windows test build without editor UI or source-project authority.
- Verify clean clone, clean build, clean target execution, notices, SBOM, and packaged-file inventory.
**Exit:** One minimal project can be created, saved, reopened, played, exported, and run on a clean supported machine; Gate B closes only with recorded restore and artifact evidence.

# Gate C — Controlled Authoring Foundation

## RSM-19 — Supported Game Profiles / MVP Scope / Capability Matrix
**Purpose:** Translate charter profiles and exclusions into authoritative capability data.  
**Third-party placement:** RetroStage-owned capability registry; no new dependency.  
**Key deliverables:**
- Define Fixed, TPS/Shoulder, Top-Down, Isometric, and Limited FPS capability declarations.
- Define supported and unsupported feature combinations.
- Drive tool visibility and validation from capability truth.
- Prevent templates from silently expanding v0 scope.
**Exit:** A project profile can explain which tools and runtime capabilities are available and why unsupported combinations are blocked.

## RSM-20 — System Dependency Map / Package Boundary / Public API Contract
**Purpose:** Define the controlled monorepo topology and forbidden dependency directions.  
**Third-party placement:** dependency-cruiser and Knip enforce architecture and dead-code rules.  
**Key deliverables:**
- Separate documents, commands, validation, storage, runtime core, renderer adapter, editor UI, asset pipeline, editor app, and player app.
- Prohibit packages depending on apps and core depending on Electron/DOM/render implementation.
- Expose package-root APIs and reject deep imports.
- Record HARD, SOFT, VALIDATION, EXPORT, and FUTURE relationships.
**Exit:** Architecture checks fail on forbidden imports, duplicate authorities, circular dependencies, and undeclared package responsibilities.

## RSM-21 — World Units / Coordinates / Transform Convention
**Purpose:** Lock units, axes, handedness, rotations, scale, and editor/runtime/export parity.  
**Third-party placement:** Babylon conversion belongs in the renderer adapter.  
**Key deliverables:**
- Define local and world transform representations.
- Define serialization precision and normalization.
- Define camera, controller, physics, animation, and import conversions.
- Create parity fixtures across headless, Preview, PIE, and player.
**Exit:** The same canonical transform produces matching approved behavior across all execution contexts.

## RSM-22 — Scene Hierarchy / Parent-Child Transform / Layers / Tags
**Purpose:** Extend the flat vertical slice into deterministic hierarchical authoring.  
**Third-party placement:** RetroStage-owned documents and validation.  
**Key deliverables:**
- Define parent ownership, ordering, local/world transform propagation, and reparent operations.
- Detect cycles and illegal cross-scene references.
- Define layers and tags as typed project concepts.
- Integrate hierarchy changes with commands, selection, save, Preview, and PIE.
**Exit:** Hierarchy and reparent operations preserve stable identity and deterministic world transforms.

## RSM-23 — Runtime Entity Lifecycle / Spawn / Despawn Policy
**Purpose:** Define runtime-only entity creation, activation, ownership, and cleanup.  
**Third-party placement:** RetroStage runtime core; renderer and physics adapters observe lifecycle.  
**Key deliverables:**
- Separate authored entities from runtime instances.
- Define spawn provenance and stable runtime handles.
- Define activation, deactivation, despawn, scene-unload, and session-stop cleanup.
- Prevent runtime instances from becoming canonical without an explicit authoring command.
**Exit:** Runtime entities can be spawned and removed without identity collision, leaks, or project mutation.

## RSM-24 — Runtime Settings / Project Variables / Serializable-State Registry
**Purpose:** Create typed runtime configuration and declare which systems may participate in save/restore.  
**Third-party placement:** TypeBox/Ajv for structure; RetroStage owns semantics.  
**Key deliverables:**
- Define project variables, runtime settings, defaults, and overrides.
- Define serializable runtime state registration and versioning.
- Separate secret/editor-only values from exported runtime settings.
- Define unsupported or non-serializable state diagnostics.
**Exit:** Runtime systems cannot enter save/checkpoint scope without explicit registration, schema, migration, and ownership.

## RSM-25 — Central Validation Framework / Problems Panel
**Purpose:** Create one authoritative problem model for authoring, Play, cooking, and Export.  
**Third-party placement:** Ajv contributes structural findings; React/react-window support presentation; RetroStage owns rules and severity.  
**Key deliverables:**
- Define stable issue IDs, severity, location, capability, remediation, and blocker classes.
- Aggregate document, reference, asset, runtime-readiness, and export findings.
- Connect issues to navigation and repair guidance.
- Prevent independent UI panels from inventing conflicting validation truth.
**Exit:** The Problems panel displays deterministic findings from one validation authority and identifies Play/Export blockers.

## RSM-26 — Electron IPC / Filesystem / Workspace Trust Hardening
**Purpose:** Generalize the initial shell into a reviewed desktop security boundary.  
**Third-party placement:** Electron security facilities, TypeBox/Ajv, architecture tests, Playwright security fixtures.  
**Key deliverables:**
- Validate IPC sender, request scope, path roots, symlink handling, and trusted workspace identity.
- Separate read, write, process, dialog, and export capabilities.
- Define untrusted-project and external-content behavior.
- Add tests for traversal, arbitrary-file access, and unsafe API exposure.
**Exit:** Renderer compromise cannot trivially gain unrestricted filesystem or process authority through approved APIs.

## RSM-27 — Async Job System / Progress / Cancellation / Task Locks
**Purpose:** Create one system for long-running import, validation, cooking, thumbnail, and export work.  
**Third-party placement:** XState for lifecycle; Electron workers/child processes behind approved services; Pino for structured logs.  
**Key deliverables:**
- Define job identity, progress, cancellation, timeout, retry, and cleanup.
- Define project and asset locks.
- Prevent overlapping save/import/export races.
- Surface actionable creator feedback and failure evidence.
**Exit:** Long operations remain responsive, cancellable where safe, and unable to silently race canonical writes.

## RSM-28 — Collision Queries / Trigger Layers / Physics Adapter Contract
**Purpose:** Replace the minimal sandbox assumptions with typed collision and query policy.  
**Third-party placement:** Havok behind a RetroStage physics adapter after native/WASM review.  
**Key deliverables:**
- Define channels for world, protagonist, interaction, trigger, perception, navigation, and audio queries.
- Define shapes, ownership, filters, and lifecycle.
- Separate gameplay meaning from low-level contacts.
- Create debug visualization and diagnostics.
**Exit:** Gameplay systems request typed queries without depending directly on Havok object identity or APIs.

## RSM-29 — Project Storage Layout / Source-Cooked-Save Separation
**Purpose:** Finalize the filesystem model for authoring, source assets, derived data, editor-local data, cooked content, and runtime saves.  
**Third-party placement:** Electron filesystem services; no database becomes canonical.  
**Key deliverables:**
- Define portable and local-only paths.
- Define generated-content cleanup and rebuild rules.
- Prevent exported player and runtime saves from modifying authoring sources.
- Define path migration and workspace relocation.
**Exit:** Deleting rebuildable local/generated data cannot destroy canonical project content.

## RSM-30 — Architecture Contract Tests / Core Fixtures
**Purpose:** Convert critical invariants into permanent automated evidence.  
**Third-party placement:** Vitest, Playwright, dependency-cruiser, Knip, and build scripts.  
**Key deliverables:**
- Create fixtures for documents, migration, commands, hierarchy, save, PIE, player, and package boundaries.
- Test absence of direct renderer/UI/database authority.
- Add clean-install and build smoke validation.
- Define golden expected outputs for deterministic operations.
**Exit:** The repository continuously rejects known architectural regressions and lost historical failure modes.

## RSM-31 — Undo / Redo / Command History
**Purpose:** Make canonical authoring changes reversible through the same command authority.  
**Third-party placement:** RetroStage-owned command history; no generic state library owns canonical history.  
**Key deliverables:**
- Define command inverse or snapshot policy.
- Group transactions and continuous edits.
- Preserve dirty-state and revision semantics.
- Define interactions with save, PIE, external changes, and recovery.
**Exit:** Supported authoring edits can be undone/redone deterministically without bypassing validation or session authority.

## RSM-32 — Scene Diff / Change Review / Safe Reload Direction
**Purpose:** Allow creators to understand and approve external or generated changes.  
**Third-party placement:** Chokidar detects changes; RetroStage owns diff and merge semantics.  
**Key deliverables:**
- Define document-aware diffs using stable identity.
- Review external edits before reload or overwrite.
- Define conflict and unsupported-merge policy.
- Connect accepted changes to commands, validation, history, and recovery.
**Exit:** External changes cannot silently replace unsaved work, and accepted changes have visible provenance.

## RSM-33 — Workspace Index / Global Search / Reference Browser
**Purpose:** Create fast searchable indexes without moving canonical truth into a database.  
**Third-party placement:** better-sqlite3 may enter after native-binary audit; react-window supports large result surfaces.  
**Key deliverables:**
- Index projects, scenes, entities, components, assets, text, and references.
- Define full rebuild from canonical sources.
- Show incoming and outgoing references.
- Handle stale, missing, and corrupted index state safely.
**Exit:** Deleting the index triggers a deterministic rebuild, while search and reference results remain creator-useful at scale.

## RSM-34 — Input Context Stack / Editor Mode State Machine
**Purpose:** Define focus, tools, shortcuts, and input ownership across Editor, PIE, UI, and modal workflows.  
**Third-party placement:** XState and Zustand within their approved scopes.  
**Key deliverables:**
- Define selection, transform, placement, navigation, text-entry, modal, PIE, and player-UI contexts.
- Prevent shortcut leakage across contexts.
- Define device focus and capture behavior.
- Integrate pause/stop and workspace changes without hidden state loss.
**Exit:** The same input cannot unintentionally control multiple authorities, and mode transitions are explicit and testable.

## RSM-35 — Workspace Modes / Creator Stages / App-Shell Architecture
**Purpose:** Implement Classic, Guided, and Custom workspaces over one project model.  
**Third-party placement:** React, Radix, Golden Layout adapter, Zustand, and capability/validation services.  
**Key deliverables:**
- Implement Project, Template, Story, Blockout, Gameplay, Atmosphere, Test, and Export lenses.
- Persist local layout without modifying project semantics.
- Drive readiness guidance from real validation.
- Permit free navigation between stages.
**Exit:** Workspace switching neither converts project data nor restarts PIE, clears history, loses unsaved edits, or changes runtime behavior.

## RSM-36 — Controlled Authoring Foundation Closure
**Purpose:** Audit Gate C as an integrated product foundation before genre breadth begins.  
**Third-party placement:** All approved Gate C technologies; no new dependency solely for closure.  
**Key deliverables:**
- Run architecture, migration, save/recovery, security, command, hierarchy, index, and workspace validations.
- Inspect packaged editor for dependency leakage and notices.
- Update source authority and deferred registry.
- Close or explicitly carry every finding.
**Exit:** Gate C closes only when the foundation is controlled, reproducible, diagnosable, and ready for gameplay authoring.

# Gate D — First Playable Creator

## RSM-37 — Event / Action Contract Registry
**Purpose:** Create the common typed language used by gameplay, UI, audio, VFX, camera, sequencing, and no-code systems.  
**Third-party placement:** RetroStage-owned registry and schemas.  
**Key deliverables:**
- Define event/action identity, parameters, context, result, and failure behavior.
- Define capability and export support metadata.
- Create validation and creator descriptors.
- Prevent subsystem-specific string conventions from becoming hidden contracts.
**Exit:** A supported event/action can be authored, validated, dispatched, traced, and later exposed to Flow Graph without duplicate definitions.

## RSM-38 — Scene Registry / Validated Scene Transition Contract
**Purpose:** Create stable scene identity, start-scene ownership, destinations, and transition requests.  
**Third-party placement:** RetroStage documents and runtime core.  
**Key deliverables:**
- Define scene registry and project membership.
- Validate missing, cyclic, unsupported, or unreachable destinations.
- Define transition payload and persistence boundary.
- Separate editor navigation from runtime scene transition.
**Exit:** A runtime transition resolves by stable scene identity and fails with a creator-facing diagnostic when invalid.

## RSM-39 — Scene Director / Narrative Section Flow
**Purpose:** Create a higher-level owner for activation, progression, and authored scene sections.  
**Third-party placement:** RetroStage runtime systems and Event/Action registry.  
**Key deliverables:**
- Define sections, activation conditions, progression state, and completion.
- Coordinate scene, objective, camera, audio, and presentation actions.
- Define authoring descriptors and trace identity.
- Keep authored flow separate from renderer visibility state.
**Exit:** A small narrative sequence can progress deterministically and be inspected through typed events and state.

## RSM-40 — Spatial Loop / Anomaly / Liminal Flow Contract
**Purpose:** Define constrained liminal repetition and anomaly behavior without claiming a general non-Euclidean engine.  
**Third-party placement:** RetroStage documents/runtime; no new foundation dependency.  
**Key deliverables:**
- Define loop count, anomaly state, route result, section variant, reset, and persistence policy.
- Define stable references between repeated authored sections.
- Create validation for impossible or ambiguous configurations.
- Prepare integration with later substitution and impossible-transition runtime.
**Exit:** Liminal flow is expressible as explicit authored state rather than ad hoc teleport scripts.

## RSM-41 — Runtime Camera Profiles
**Purpose:** Implement the supported Fixed, TPS/Shoulder, Top-Down, Isometric, and Limited FPS camera runtime profiles.  
**Third-party placement:** Babylon camera capabilities behind RetroStage camera systems.  
**Key deliverables:**
- Define profile data, runtime state, input coupling, collision expectations, and capability limits.
- Separate authoring camera objects from runtime camera ownership.
- Create deterministic activation and fallback policy.
- Validate unsupported profile/system combinations.
**Exit:** Each supported profile runs in PIE and minimal player from canonical configuration.

## RSM-42 — Camera Authoring / Activation Zones / Composition Toolkit
**Purpose:** Create creator-facing tools for camera placement, priority, framing, cuts, and blends.  
**Third-party placement:** Babylon preview helpers behind product-owned authoring and runtime contracts.  
**Key deliverables:**
- Create activation volumes, priorities, cut/blend policies, target/framing guides, and safe zones.
- Provide Fixed Camera and shoulder-composition workflows.
- Add camera preview and diagnostics.
- Preserve Preview/PIE/Export behavior.
**Exit:** A creator can author and diagnose representative camera setups without low-level engine scripting.

## RSM-43 — Lighting / Atmosphere Runtime
**Purpose:** Create the first coherent lighting, shadow, fog, and mood runtime layer.  
**Third-party placement:** Babylon lighting and material capabilities behind presentation adapters.  
**Key deliverables:**
- Define supported light types and project budgets.
- Define fog, ambient, shadow, and environment ownership.
- Create quality tiers and unsupported-feature diagnostics.
- Integrate scene transitions and camera profiles.
**Exit:** A representative scene has stable lighting and atmosphere in Preview, PIE, and exported player.

## RSM-44 — Retro Presentation Profiles / Frame-Graph Architecture
**Purpose:** Build multi-layer retro presentation as canonical profiles rather than a single final filter.  
**Third-party placement:** Babylon.js 9 Frame Graph and approved renderer facilities behind RetroStage profile documents.  
**Key deliverables:**
- Define internal resolution, upscale, color treatment, dithering, LUT/palette, fog, glow/bloom, display simulation, and ordered passes.
- Define PS1-inspired, early-PS2-inspired, and custom profile directions without forcing one style.
- Create capability, quality, and fallback metadata.
- Keep render resources derived.
**Exit:** Creators can switch and customize presentation profiles with deterministic Preview/PIE/player output.

## RSM-45 — Atmosphere Audio Foundation / Preview-PIE Integration
**Purpose:** Create basic 2D/3D playback, ambience, loops, fades, and lifecycle integration.  
**Third-party placement:** Babylon audio facilities may be used behind a RetroStage audio adapter until the mature audio milestone.  
**Key deliverables:**
- Define audio asset references, source ownership, play/stop/fade actions, and scene/session cleanup.
- Prevent Preview and PIE audio overlap or leakage.
- Create missing-audio and unsupported-format diagnostics.
- Prepare later mixer and spatial-zone ownership.
**Exit:** A scene can author and export basic ambience and one-shot audio with correct lifecycle behavior.

## RSM-46 — Interaction Runtime
**Purpose:** Create typed interaction queries, prompts, candidates, actions, and results.  
**Third-party placement:** RetroStage runtime plus physics query adapter and Event/Action registry.  
**Key deliverables:**
- Define interactable, interactor, range, line-of-sight, priority, and prompt data.
- Separate detection from gameplay result.
- Trace interaction decisions.
- Create authoring and validation support.
**Exit:** A protagonist can detect and activate a representative interaction consistently in PIE and player.

## RSM-47 — Narrative Text / Readable / Dialogue Runtime
**Purpose:** Create native notes, readable text, dialogue, subtitle, and narrative presentation foundations.  
**Third-party placement:** React may support editor authoring; player presentation remains RetroStage-owned.  
**Key deliverables:**
- Define readable and dialogue documents/components.
- Define timing, speaker, choice direction, interruption, and presentation hooks.
- Integrate input contexts, interaction, camera, audio, and UI placeholders.
- Create validation and trace identities.
**Exit:** A creator can author a note and a short dialogue that execute in PIE and player.

## RSM-48 — Text Identity / String Table / Localization-Ready Contract
**Purpose:** Give all player-facing text stable identity before full localization tooling.  
**Third-party placement:** RetroStage documents and schema validation.  
**Key deliverables:**
- Define string tables, locale keys, fallback, formatting arguments, and source context.
- Prevent display text from becoming persistent reference identity.
- Create missing-key diagnostics.
- Prepare later subtitle, UI, and accessibility integration.
**Exit:** Narrative and UI text can be replaced by locale without changing gameplay references.

## RSM-49 — Objective / Task Runtime
**Purpose:** Create lightweight goals, conditions, progress, completion, and presentation events.  
**Third-party placement:** RetroStage runtime and Event/Action registry.  
**Key deliverables:**
- Define objective identity, states, conditions, updates, completion, failure, and persistence direction.
- Integrate interaction, scene director, narrative, and transition systems.
- Create authoring descriptors and validation.
- Trace state changes.
**Exit:** A representative objective can begin, update, complete, and unlock the next authored action.

## RSM-50 — Inventory / Items / Keys / Puzzle Foundation
**Purpose:** Create bounded inventory and item-use behavior suitable for horror and mystery workflows.  
**Third-party placement:** RetroStage documents/runtime; UI remains replaceable.  
**Key deliverables:**
- Define item identity, possession, consume/use, key/lock, examine, and puzzle target contracts.
- Separate behavior from presentation skin.
- Integrate interaction, objectives, save direction, and validation.
- Provide creator-friendly recipe defaults.
**Exit:** A player can acquire a key, inspect inventory state, unlock a door, and preserve project-specific visual identity.

## RSM-51 — Constrained Physics Interaction / Kinematic Props
**Purpose:** Support bounded doors, drawers, pushable/carryable props, impulse reactions, and simple breakables.  
**Third-party placement:** Havok behind the physics adapter; no unrestricted sandbox promise.  
**Key deliverables:**
- Define kinematic and dynamic ownership, interaction limits, reset, save eligibility, and safety budgets.
- Create authoring components and gizmos.
- Integrate collision channels, interaction, audio, and runtime tracing.
- Diagnose unstable or unsupported configurations.
**Exit:** Representative door, drawer, and pushable-prop interactions work without exposing raw physics-engine authority.

## RSM-52 — Playable Spine / End-to-End Game Loop Gate
**Purpose:** Integrate Start → Move → Interact → Acquire/Read → Objective → Unlock → Exit.  
**Third-party placement:** Uses approved Gate D systems; no dependency added merely for the demo.  
**Key deliverables:**
- Build one canonical sample scene chain.
- Prove save/reopen, PIE isolation, player export, validation, and diagnostics.
- Verify used camera and presentation profiles.
- Record performance and clean-target evidence.
**Exit:** The representative loop is authorable and playable without source-code edits or engine-editor exposure.

## RSM-53 — Starter Templates / Minimal Game Recipes v0
**Purpose:** Provide validated starting points without forcing final identity.  
**Third-party placement:** RetroStage template documents and approved assets; third-party asset licenses remain separate.  
**Key deliverables:**
- Create locked-door/readable, fixed-camera horror, limited-FPS horror, and liminal starter recipes as appropriate.
- Separate behavior defaults from UI, audio, typography, and presentation tokens.
- Define template compatibility and provenance.
- Create readiness diagnostics.
**Exit:** A new creator can start from a known-good recipe and replace presentation identity without rewriting gameplay systems.

## RSM-54 — Guided Creator Workflow / Usability Gate
**Purpose:** Turn foundational systems into an understandable creator journey.  
**Third-party placement:** React/Radix/Golden Layout workspaces; validation and capability services.  
**Key deliverables:**
- Provide contextual guidance, readiness, empty states, navigation, and repair actions.
- Avoid mandatory linear stage progression.
- Test keyboard, focus, and common creator paths.
- Remove hidden engine terminology from supported workflows.
**Exit:** A representative first-time creator can produce the playable spine using product UI and guidance.

## RSM-55 — Preview / PIE / Export Parity Gate
**Purpose:** Validate every Gate D capability across its declared execution contexts.  
**Third-party placement:** Playwright, Vitest, packaged-player tests, Pino logs, and artifact inspection.  
**Key deliverables:**
- Create parity matrix for camera, transforms, interaction, narrative, objectives, physics, lighting, presentation, and audio.
- Classify Preview-only authoring helpers explicitly.
- Block unsupported export combinations.
- Close all critical parity findings.
**Exit:** Gate D closes only when the representative project behaves consistently and explainably in Preview, PIE, and exported player.

# Gate E — Genre-Capable Gameplay Creator

## RSM-56 — Level Design / Blockout Tools
**Purpose:** Create room, corridor, wall, floor, doorway, snapping, alignment, and measurement workflows.  
**Third-party placement:** Babylon preview geometry behind RetroStage commands and documents.  
**Key deliverables:**
- Define blockout primitives and reusable operations.
- Support grid, angle, surface, and object snapping.
- Provide dimensions and collision-preview guidance.
- Keep generated geometry editable and exportable.
**Exit:** A creator can block out a small level quickly without external modelling for basic structure.

## RSM-57 — Liminal Blockout / Repetition / Transitional Architecture Toolkit
**Purpose:** Add controlled repetition and variation tools for uncanny-space design.  
**Third-party placement:** RetroStage blockout and prefab systems; no procedural-world dependency.  
**Key deliverables:**
- Create repeated corridor/room, modular section, light-array, and controlled-variation tools.
- Preserve stable identities and explicit authored variants.
- Provide repetition and transition preview.
- Diagnose excessive or invalid generation.
**Exit:** A creator can author a constrained liminal space with editable repetitions and variations.

## RSM-58 — Prefab / Variant System
**Purpose:** Create reusable authored objects, inheritance, safe overrides, and anomaly variants.  
**Third-party placement:** RetroStage-owned documents and command system.  
**Key deliverables:**
- Define prefab identity, instance identity, override paths, detach, update, and conflict behavior.
- Support presentation and gameplay overrides independently.
- Integrate references, validation, diff, and migration.
- Prevent hidden renderer/database ownership.
**Exit:** Reusable content can be updated and varied without corrupting instance identity or silently losing overrides.

## RSM-59 — Navigation / Patrol Path Runtime and Authoring
**Purpose:** Create navmesh, agents, links, patrol paths, bake, debug, and validation workflows.  
**Third-party placement:** Recast/Detour may enter behind a navigation adapter after exact wrapper/native/WASM audit.  
**Key deliverables:**
- Define navigation source geometry, agent dimensions, areas, links, and bake ownership.
- Create asynchronous bake jobs and cache invalidation.
- Create patrol-path authoring and runtime queries.
- Provide debug visualization and Project Doctor findings.
**Exit:** A representative NPC can navigate and patrol an authored level in PIE and player.

## RSM-60 — Enemy AI / NPC Runtime
**Purpose:** Create bounded NPC state, behavior, movement, and lifecycle foundations.  
**Third-party placement:** RetroStage runtime systems using navigation, Event/Action registry, and diagnostics.  
**Key deliverables:**
- Define state, target, movement request, action, interruption, and cleanup.
- Separate perception and combat into later systems.
- Create authoring profiles and capability limits.
- Trace decisions and failures.
**Exit:** A simple enemy can idle, patrol, investigate a commanded target, and recover from invalid navigation.

## RSM-61 — Stealth / Perception Runtime
**Purpose:** Create sight, hearing, alert, suspicion, concealment, and investigation behavior.  
**Third-party placement:** RetroStage runtime using typed physics/audio queries.  
**Key deliverables:**
- Define sensor channels, ranges, occlusion, memory, thresholds, and state transitions.
- Integrate player actions, audio cues, lighting direction, and AI.
- Create debug visualization and trace events.
- Provide performance budgets.
**Exit:** A creator can author and diagnose a representative stealth encounter.

## RSM-62 — Combat / Damage / Health Runtime
**Purpose:** Add bounded health, damage, death, reaction, and combat integration without becoming a general combat framework.  
**Third-party placement:** RetroStage runtime, physics adapter, animation, VFX, audio, and UI hooks.  
**Key deliverables:**
- Define health, damage types, hit results, invulnerability direction, death, and reset.
- Integrate AI, objectives, save eligibility, and diagnostics.
- Create capability limits by GameProfile.
- Keep presentation replaceable.
**Exit:** A simple supported combat/damage scenario works and unsupported complexity is explicitly rejected.

## RSM-63 — Scene Streaming / Section Visibility
**Purpose:** Manage scene sections and visibility without claiming open-world streaming.  
**Third-party placement:** Babylon resource/visibility adapters and RetroStage scene ownership.  
**Key deliverables:**
- Define section identity, preload, activation, unload, visibility, and ownership.
- Coordinate camera, navigation, audio, lighting, and runtime entities.
- Create memory and transition diagnostics.
- Preserve canonical scene references.
**Exit:** A small multi-section project transitions predictably without leaking resources or runtime entities.

## RSM-64 — Looping Space / Section Substitution / Impossible Transition Runtime
**Purpose:** Implement the constrained liminal runtime defined earlier.  
**Third-party placement:** RetroStage scene director and section systems.  
**Key deliverables:**
- Support conditional exits, return-path mutation, section substitution, continuity teleport, and anomaly outcomes.
- Maintain explicit state, references, and reset policy.
- Integrate camera, audio, lighting, objectives, and save direction.
- Provide trace and debug visualization.
**Exit:** A representative looping-space recipe works deterministically and is diagnosable without unrestricted world-generation claims.

## RSM-65 — Runtime Save / Checkpoint
**Purpose:** Implement approved player-progress capture and restore independently from project save.  
**Third-party placement:** RetroStage runtime-save schemas and storage services.  
**Key deliverables:**
- Capture only registered serializable systems.
- Version and migrate runtime saves.
- Define checkpoint triggers, failure recovery, and unsupported-state diagnostics.
- Prevent runtime save data from overwriting authoring content.
**Exit:** A representative game can checkpoint, exit, reopen, and restore supported progress in exported player.

## RSM-66 — Runtime User Profile / Save Slot Management
**Purpose:** Create player profiles, slots, metadata, selection, deletion, and compatibility handling.  
**Third-party placement:** RetroStage player UI and runtime-save services.  
**Key deliverables:**
- Define slot identity, timestamps, playtime, screenshot direction, version, and corruption handling.
- Support input and accessibility requirements.
- Separate local player data from project files.
- Create safe deletion and fallback behavior.
**Exit:** An exported game can present and manage multiple valid save slots without exposing authoring storage.

## RSM-67 — Input Rebinding / Controller Support
**Purpose:** Support keyboard and gamepad bindings with context-aware prompts.  
**Third-party placement:** Electron/browser input and Babylon device facilities behind RetroStage input contracts.  
**Key deliverables:**
- Define actions, bindings, conflicts, defaults, reset, device detection, and persistence.
- Support editor and player contexts separately.
- Integrate UI navigation and accessibility.
- Validate required actions.
**Exit:** A player can rebind supported controls and see correct device-aware prompts.

## RSM-68 — Patrol / AI Authoring and Live Diagnostics
**Purpose:** Turn navigation, AI, and perception into creator-usable workflows.  
**Third-party placement:** React editor surfaces, Babylon debug drawing, Pino tracing; no new authority.  
**Key deliverables:**
- Create patrol, sensor, state, target, and behavior authoring panels.
- Visualize paths, fields of view, hearing events, and current states.
- Connect live data to stable entity and issue identities.
- Define pause/step inspection direction.
**Exit:** Creators can identify why a representative NPC cannot move, perceive, or transition state.

## RSM-69 — Gameplay Recipe / Genre Constraint Library
**Purpose:** Package validated gameplay structures for supported genres.  
**Third-party placement:** RetroStage recipe and template system.  
**Key deliverables:**
- Create reusable door/key, readable, objective, chase, stealth, checkpoint, and anomaly recipe patterns.
- Declare required capabilities and assets.
- Keep presentation replaceable.
- Version recipe inputs and migrations.
**Exit:** Recipes accelerate authoring without hiding unsupported behavior or creating separate canonical formats.

## RSM-70 — Creator-Facing Gameplay Diagnostics
**Purpose:** Unify gameplay validation, runtime traces, repair guidance, and authoring navigation.  
**Third-party placement:** Pino structured events and RetroStage Problems/trace models.  
**Key deliverables:**
- Diagnose interaction, objectives, inventory, transitions, AI, physics, and save eligibility.
- Provide stable issue/event IDs.
- Link live failures back to authoring documents.
- Avoid exposing raw third-party stack details as the primary creator message.
**Exit:** A creator can understand and repair common gameplay failures from product diagnostics.

## RSM-71 — Gameplay / Level Performance Budgets
**Purpose:** Define practical limits for supported project sizes and runtime systems.  
**Third-party placement:** Local profiling and structured metrics; OpenTelemetry remains optional until its later approved audit.  
**Key deliverables:**
- Define budgets for entities, physics bodies, triggers, navmesh, AI, scene sections, and scripts/actions.
- Create warnings and representative stress fixtures.
- Connect budgets to hardware profiles.
- Avoid unsupported scale promises.
**Exit:** Representative projects remain within documented budgets and exceedances produce actionable warnings.

## RSM-72 — Genre-Capable Gameplay Creator Gate
**Purpose:** Validate Gate E as a creator product, not isolated runtime systems.  
**Third-party placement:** All Gate E systems and test infrastructure.  
**Key deliverables:**
- Produce representative fixed-camera/TPS or limited-FPS horror and liminal slices.
- Validate authoring, PIE, runtime save, input, AI, and export behavior.
- Run performance, recovery, and diagnostics checks.
- Close or explicitly defer every critical finding.
**Exit:** Gate E closes when creators can assemble a small genre-capable game without unsupported code paths.

# Gate F — Production Content Creator

## RSM-73 — Asset Registry / Source Metadata / License Contract
**Purpose:** Create stable asset identity, source ownership, metadata, dependencies, and asset-license recording.  
**Third-party placement:** RetroStage asset documents; TypeBox/Ajv for structure.  
**Key deliverables:**
- Define mesh, texture, sprite, material, animation, VFX, audio, font, UI, and generated asset classes.
- Record source path, hash, importer, settings, license/provenance, and cooked derivatives.
- Define missing, moved, stale, and unsupported states.
- Separate source asset identity from Babylon runtime resources.
**Exit:** Every imported or generated asset has stable identity, provenance, validation, and rebuild rules.

## RSM-74 — Content Browser / Asset Library / Placement Workflow
**Purpose:** Create scalable browsing, organization, thumbnails, filtering, and drag-placement.  
**Third-party placement:** better-sqlite3 index after audit, React/react-window, Chokidar, and job system.  
**Key deliverables:**
- Support folders, collections, search, tags, source/cooked status, usage, and problems.
- Generate thumbnails asynchronously.
- Drag approved assets into scenes through commands.
- Rebuild index and thumbnail cache safely.
**Exit:** Creators can find, inspect, place, and diagnose assets in a medium-size project.

## RSM-75 — GLB / glTF Asset Pipeline
**Purpose:** Create deterministic model, material, skeleton, and animation import.  
**Third-party placement:** `@gltf-transform/*`, meshoptimizer, Babylon loaders behind RetroStage import/runtime adapters.  
**Key deliverables:**
- Inspect, validate, normalize, transform, and cook approved glTF/GLB sources.
- Record import settings and generated derivatives.
- Preserve stable asset and subasset identities.
- Provide unsupported-extension and material diagnostics.
**Exit:** A representative animated GLB imports, reopens, reimports, cooks, and runs without direct source mutation.

## RSM-76 — Texture / Sprite Atlas / Retro Image Import
**Purpose:** Define texture semantics, color space, alpha, palette, filtering, mip, atlas, slice, and sprite metadata.  
**Third-party placement:** Babylon texture runtime; image tooling remains limited to approved pure-library paths. KTX/Basis tools remain conditional until separate audit.  
**Key deliverables:**
- Define source and cooked texture roles.
- Create stable sprite-slice IDs and atlas reimport policy.
- Support nearest/linear filtering and retro-oriented import settings.
- Diagnose unsupported dimensions, formats, and alpha/color-space mistakes.
**Exit:** Textures and sprite atlases import non-destructively and maintain stable authored references.

## RSM-77 — Content Integrity / Hashing / Cache Invalidation
**Purpose:** Detect changed, stale, corrupted, or mismatched assets and derivatives.  
**Third-party placement:** Node crypto/hash facilities, asset registry, and job/index systems.  
**Key deliverables:**
- Hash source, settings, importer version, and derivatives.
- Invalidate only affected caches and cooked outputs.
- Detect corruption and partial jobs.
- Surface creator-facing repair actions.
**Exit:** The pipeline never silently uses stale derivatives after a relevant source or settings change.

## RSM-78 — Asset Reimport / Import Cache / Non-Destructive Settings
**Purpose:** Create stable reimport behavior that preserves references and creator decisions.  
**Third-party placement:** glTF-Transform, meshoptimizer, Chokidar, async jobs, and asset registry.  
**Key deliverables:**
- Separate source changes from approved import settings.
- Review destructive subasset changes.
- Preserve or remap stable identities where valid.
- Provide rollback and failed-reimport recovery.
**Exit:** A changed source can be reimported without silently breaking valid scene references or losing previous good derivatives.

## RSM-79 — Audio Import / Transcode / Loop Metadata
**Purpose:** Create audio source metadata, waveform, streaming, loop, loudness, and derivative policy.  
**Third-party placement:** No FFmpeg or codec-enabled binary enters without the conditional audit defined in the technology contract.  
**Key deliverables:**
- Define initially supported source and runtime formats.
- Record loop points, channels, sample rate, streaming, and loudness metadata.
- Generate approved previews and waveforms.
- Diagnose unsupported codecs and licensing risk.
**Exit:** A supported audio source imports and loops predictably while unapproved codecs fail safely.

## RSM-80 — Runtime Asset Loading / Resource Manager
**Purpose:** Create one owner for loading, reuse, lifetime, reference counts, and failure behavior.  
**Third-party placement:** Babylon loaders/resources behind RetroStage resource handles.  
**Key deliverables:**
- Resolve cooked manifests by stable asset identity.
- Share approved resources and release them deterministically.
- Handle missing/corrupt assets with explicit fallbacks.
- Integrate scene sections, PIE teardown, and player shutdown.
**Exit:** Runtime assets load and release without leaking canonical or renderer implementation identity.

## RSM-81 — Large Project Scalability / Resource Disposal
**Purpose:** Define memory pressure, unloading, cache limits, and large-project behavior.  
**Third-party placement:** Babylon/resource adapters and local indexes; no open-world promise.  
**Key deliverables:**
- Create project-size fixtures and memory budgets.
- Dispose unused preview, PIE, thumbnail, and runtime resources.
- Define cache eviction and section unload behavior.
- Surface slow or excessive content diagnostics.
**Exit:** Supported medium projects remain usable without unbounded memory growth.

## RSM-82 — Editor Performance Profiling / Slow Operation Detector
**Purpose:** Measure import, validation, projection, shader, texture, audio, VFX, UI, and memory costs.  
**Third-party placement:** Pino; OpenTelemetry JS may enter only after an approved local-tracing audit.  
**Key deliverables:**
- Define operation/span identities and local-only default behavior.
- Detect slow commands and jobs.
- Attach performance findings to project content where possible.
- Protect user privacy and avoid hidden network telemetry.
**Exit:** Creators and developers can identify the dominant cause of representative editor stalls.

## RSM-83 — Material / Shader / Retro LookDev Editor
**Purpose:** Create constrained material authoring for the supported product direction.  
**Third-party placement:** Babylon materials and shader facilities behind RetroStage material documents and adapters.  
**Key deliverables:**
- Support approved unlit, vertex-lit, lightmapped, cutout, additive, distortion, palette, and animated material profiles.
- Create parameter, texture, transparency, and capability validation.
- Preview against project presentation profiles.
- Avoid becoming a general shader IDE.
**Exit:** A creator can author distinct materials and retro looks without direct Babylon material serialization as canonical data.

## RSM-84 — Skeletal / Sprite / Flipbook Animation Pipeline
**Purpose:** Create import, clip, sprite-sheet, flipbook, directional sprite, and frame-event foundations.  
**Third-party placement:** Babylon animation runtime, glTF pipeline, and RetroStage animation documents.  
**Key deliverables:**
- Define clip identity, timing, looping, events, and reference rules.
- Support skeletal and sprite/flipbook presentation paths.
- Create editor preview and runtime playback.
- Validate missing bones, frames, clips, and incompatible assets.
**Exit:** Representative skeletal and flipbook assets author and play consistently across Preview, PIE, and player.

## RSM-85 — Animation State Machine / Locomotion / Retargeting
**Purpose:** Create parameters, states, transitions, locomotion, directional behavior, and constrained retargeting.  
**Third-party placement:** RetroStage state-machine documents/runtime; Babylon playback adapter.  
**Key deliverables:**
- Define transition conditions, interruption, blending, and events.
- Integrate movement, AI, interaction, combat, and sequencing.
- Provide visual authoring and live diagnostics.
- Define explicit retargeting limits and validation.
**Exit:** A supported protagonist or NPC locomotion graph is authorable, diagnosable, and exportable.

## RSM-86 — Retro VFX / Particle / Sprite FX Authoring
**Purpose:** Create bounded particles, decals, cards, mesh effects, screen effects, seeds, and budgets.  
**Third-party placement:** Babylon particle/render facilities behind RetroStage VFX documents.  
**Key deliverables:**
- Define emitters, modules, assets, triggers, lifetime, pooling, and deterministic-seed direction.
- Integrate Event/Action, animation, audio, materials, camera, and sequencing.
- Create preview and runtime debug tools.
- Enforce performance and transparency budgets.
**Exit:** Creators can author representative fog, dust, spark, blood, flash, and screen effects without raw engine authoring.

## RSM-87 — Player UI / HUD / Menu Runtime and Authoring
**Purpose:** Create project-owned screen documents, layout, tokens, bindings, navigation, and diegetic UI direction.  
**Third-party placement:** React may support editor authoring; player UI implementation must remain export-safe and product-owned.  
**Key deliverables:**
- Define HUD, pause, dialogue, inventory, objective, save-slot, settings, and prompt surfaces.
- Create design tokens for typography, spacing, color, and motion.
- Integrate input focus, localization, accessibility, and runtime data bindings.
- Keep gameplay recipes independent of one mandatory skin.
**Exit:** A creator can produce a distinct player-facing UI language and export it with supported interactions.

## RSM-88 — Audio Runtime / Mixer / Spatial / Adaptive Sound
**Purpose:** Create clips, cues, buses, snapshots, music, ambience, zones, occlusion, streaming, and adaptive behavior.  
**Third-party placement:** Approved audio adapter and runtime formats; conditional codec tools remain gated.  
**Key deliverables:**
- Define cues, variations, buses, gain, ducking, snapshots, spatial emitters/listeners, and zones.
- Integrate perception, scene director, camera, UI, sequencing, and presentation.
- Create mixer and spatial authoring tools.
- Provide budgets, meters, and diagnostics.
**Exit:** A representative game has creator-authored ambience, effects, music, UI audio, spatial behavior, and mixer control.

## RSM-89 — Advanced Retro Presentation / Animation / VFX / UI / Audio Parity
**Purpose:** Converge all presentation layers into coherent project-specific profiles.  
**Third-party placement:** Babylon Frame Graph, material, animation, VFX, audio, and player-UI adapters.  
**Key deliverables:**
- Validate ordering and interactions between resolution, materials, lighting, fog, post-process, animation, particles, UI, and audio.
- Provide quality tiers and fallback behavior.
- Create visual/audio regression fixtures.
- Preserve creator identity rather than one house style.
**Exit:** Representative presentation profiles remain coherent and consistent across authoring, PIE, and player.

## RSM-90 — Minimum Hardware Target / Compatibility Profiles
**Purpose:** Define minimum/recommended Windows targets and fallback tiers.  
**Third-party placement:** Electron/Babylon runtime evidence, hardware fixtures, and performance tooling.  
**Key deliverables:**
- Define GPU/API, CPU, memory, storage, resolution, audio, and controller expectations.
- Create fallback profiles for effects, shadows, textures, VFX, and audio.
- Detect unsupported devices or configurations.
- Document honest project budgets.
**Exit:** The product can state and validate a credible supported hardware envelope.

## RSM-91 — Production Content Creator Gate
**Purpose:** Validate the complete asset and presentation workflow as a creator product.  
**Third-party placement:** All Gate F systems plus packaged-player and regression evidence.  
**Key deliverables:**
- Build a representative content-rich sample.
- Validate import, reimport, materials, animation, VFX, UI, audio, performance, and fallback behavior.
- Audit asset provenance and packaged derivatives.
- Close critical usability, memory, and parity findings.
**Exit:** Gate F closes when creators can produce a distinctive content-rich game without external engine-editor workflows.

# Gate G — Standalone Build Product

## RSM-92 — Runtime Platform Environment / Target Contract
**Purpose:** Define supported Windows runtime environment, filesystem, graphics, input, audio, and process behavior.  
**Third-party placement:** Electron and Babylon target capabilities; Steam remains a distribution layer rather than canonical authority.  
**Key deliverables:**
- Define supported OS versions and architecture.
- Define writable paths, display modes, device behavior, and offline expectations.
- Define clean-machine prerequisites and error handling.
- Create target validation fixtures.
**Exit:** Editor and player have explicit supported environment contracts and fail explainably outside them.

## RSM-93 — Game Identity / Publishing Metadata
**Purpose:** Create canonical title, version, icon, company, executable, legal, and publishing metadata.  
**Third-party placement:** Electron packaging metadata and RetroStage project documents.  
**Key deliverables:**
- Define validation and localization direction.
- Separate editor product identity from exported game identity.
- Generate runtime and artifact metadata deterministically.
- Prevent unsafe filenames and identity collisions.
**Exit:** A project produces a correctly branded standalone game without leaking RetroStage editor identity where inappropriate.

## RSM-94 — Cooked Content Manifest / Runtime Content Contract
**Purpose:** Define the complete manifest for scenes, assets, shaders, audio, UI, presentation, and runtime settings.  
**Third-party placement:** RetroStage compiler; approved asset tools and Babylon runtime loader.  
**Key deliverables:**
- Resolve stable identities to cooked artifacts.
- Record hashes, versions, capabilities, dependencies, and optional content.
- Separate editor-only and runtime content.
- Validate manifest integrity before packaging.
**Exit:** The player can load a project solely through an approved deterministic cooked manifest.

## RSM-95 — Export Compiler / Deterministic Runtime Layout
**Purpose:** Build the mature cooking and export pipeline.  
**Third-party placement:** glTF-Transform, meshoptimizer, optional audited texture/audio tools, Electron packaging, and RetroStage compiler services.  
**Key deliverables:**
- Cook assets and documents into deterministic runtime forms.
- Prepare shader/material/presentation variants.
- Create reproducible output layout and cache invalidation.
- Support cancellation, logs, and failure recovery.
**Exit:** Equivalent approved inputs produce equivalent runtime content and explainable artifact differences.

## RSM-96 — Standalone Runtime App Flow
**Purpose:** Own player startup, settings, save selection, scene entry, pause, shutdown, and failure states.  
**Third-party placement:** `player-electron`, Babylon adapter, runtime core, and player UI.  
**Key deliverables:**
- Remove editor and development-only code.
- Define bootstrap, loading, first scene, suspend/resume direction, and shutdown.
- Integrate settings, input, saves, and error boundary.
- Prove editor independence.
**Exit:** The exported game starts, runs, saves, and exits without the editor application or authoring services.

## RSM-97 — Runtime Error Boundary / Fallback Policy
**Purpose:** Convert missing or failed runtime content into controlled behavior and diagnostics.  
**Third-party placement:** RetroStage runtime and Pino; Babylon failures translated through adapters.  
**Key deliverables:**
- Define fatal, recoverable, degraded, and creator-build error classes.
- Create approved placeholders and safe shutdown.
- Avoid exposing raw internal or secret data to players.
- Connect failures to artifact reports and Project Doctor.
**Exit:** Representative corrupt or missing content fails safely and produces actionable developer evidence.

## RSM-98 — Structured Logging / Event Trace / Debug Console
**Purpose:** Create typed runtime and build observability.  
**Third-party placement:** Pino; optional local OpenTelemetry adapter after audit.  
**Key deliverables:**
- Define event taxonomy, correlation, timestamps, entity/asset/scene identity, and privacy levels.
- Create editor, player, import, cook, and export logs.
- Provide development debug console without shipping unsafe authoring powers.
- Support diagnostic-bundle collection.
**Exit:** A representative failure can be traced across command, event, runtime, asset, and export boundaries.

## RSM-99 — Runtime Debugger / Live Entity Inspector
**Purpose:** Create creator-facing live inspection for entities, variables, camera, triggers, AI, animation, audio, VFX, and events.  
**Third-party placement:** React editor tools, Babylon debug visualization, RetroStage trace model; Monaco remains optional for approved text views.  
**Key deliverables:**
- Inspect stable runtime identities without making runtime state canonical.
- Pause, step, filter, and navigate to authoring sources where safe.
- Show system ownership and current values.
- Integrate Problems and event traces.
**Exit:** Creators can diagnose why representative runtime behavior differs from expectation.

## RSM-100 — Asset Dependency Optimizer / Build Stripping
**Purpose:** Remove unused, editor-only, duplicate, or unreachable runtime content.  
**Third-party placement:** Asset index, manifest compiler, meshoptimizer, and packaged-file inspection.  
**Key deliverables:**
- Build dependency graph from authoritative references.
- Strip development packages, source assets, and unused variants.
- Explain retained and removed content.
- Protect dynamically referenced approved content.
**Exit:** The player package contains only required approved runtime files and notices.

## RSM-101 — Project Doctor / Export Validation Gate
**Purpose:** Converge validation into creator-facing readiness and repair guidance before build.  
**Third-party placement:** Validation framework, asset/index services, runtime capability matrix, and packaging checks.  
**Key deliverables:**
- Check references, gameplay, scenes, saves, assets, shaders, textures, audio, UI, performance, licensing metadata, and target support.
- Separate warning, Play blocker, Export blocker, and release blocker.
- Offer safe repair actions where possible.
- Generate machine-readable validation evidence.
**Exit:** No release build proceeds with unresolved critical blockers, and creators can understand the reason.

## RSM-102 — Game Packaging / Artifact Report / Release Notes
**Purpose:** Produce final Windows package artifacts and complete evidence.  
**Third-party placement:** Electron Forge and a separately audited Windows installer maker when selected; Steam tools remain conditional.  
**Key deliverables:**
- Package player, content, licenses, notices, and required runtime files.
- Generate build contents, versions, warnings, hashes, SBOM, native/WASM inventory, and release notes.
- Inspect the physical artifact rather than manifests alone.
- Define signing hooks without committing secrets.
**Exit:** A release candidate has reproducible artifact evidence and can be installed or launched on a clean supported target.

## RSM-103 — Performance / Render / Export Polish / Clean-Machine Gate
**Purpose:** Optimize and validate frame pacing, shaders, batching, transparency, memory, audio, package size, and startup.  
**Third-party placement:** All approved runtime and profiling tools; no new dependency added only to mask architectural problems.  
**Key deliverables:**
- Profile representative hardware tiers.
- Close critical performance and compatibility findings.
- Verify clean install/run/uninstall or portable behavior as selected.
- Run final Preview/PIE/player parity and packaged-file audit.
**Exit:** Gate G closes when RetroStage reliably produces diagnosed, optimized, standalone Windows games.

# Gate H — No-Code Narrative Production

## RSM-104 — Flow Graph Runtime
**Purpose:** Create bounded no-code gameplay execution on the shared Event/Action registry.  
**Third-party placement:** RetroStage graph documents/runtime; React Flow may support the editor surface only after milestone-gated admission.  
**Key deliverables:**
- Define nodes, ports, types, variables, events, actions, control flow, and runtime state.
- Keep execution semantics independent from the visual editor library.
- Integrate validation, capabilities, save direction, and tracing.
- Version and migrate graph documents.
**Exit:** A representative gameplay sequence can be authored without code and executes in PIE and player.

## RSM-105 — Flow Graph Safety / Execution Budget / Debugger
**Purpose:** Prevent runaway or opaque graph behavior.  
**Third-party placement:** RetroStage runtime/debugger; React Flow remains visual surface only.  
**Key deliverables:**
- Define cycle, recursion, queue, time, and action budgets.
- Provide breakpoints, step, trace, variable inspection, and source navigation.
- Detect invalid or unsupported nodes before export.
- Integrate runtime error boundary.
**Exit:** A malformed or runaway graph cannot freeze the product silently, and valid graphs are creator-debuggable.

## RSM-106 — Native Cutscene / Timeline Runtime and Sequencer
**Purpose:** Create first-class native cinematic and timed-event authoring.  
**Third-party placement:** RetroStage sequence documents/runtime; React editor surfaces and Babylon/audio/UI adapters.  
**Key deliverables:**
- Support camera, transform, animation, audio, dialogue, VFX, lighting, material, UI, scene visibility, and Event/Action tracks.
- Define clips, tracks, markers, timebase, scrub, preview, play, interruption, skip, and restoration.
- Version and validate sequence documents.
- Maintain Preview/PIE/Export parity.
**Exit:** Creators can author representative cinematics entirely inside RetroStage without an external companion product.

## RSM-107 — Cinematic Sequence Interchange / External Timeline Import-Export
**Purpose:** Provide optional generic exchange with supported external animation, audio, or editorial tools.  
**Third-party placement:** No format or library is approved until an audit proves license, mapping, and round-trip value. Open interchange candidates are evaluated here.  
**Key deliverables:**
- Define stable sequence/track/clip/marker identities and provenance.
- Define timebase conversion, reference remapping, unsupported-track diagnostics, and round-trip policy.
- Preview and validate changes before import.
- Keep external files non-canonical until accepted through commands.
**Exit:** Supported exchange works without making any external cinematic product required for core authoring.

## RSM-108 — Horror / Liminal Genre Kit / Retro Presentation Presets
**Purpose:** Package validated components, recipes, camera setups, ambience, UI, VFX, and anomaly patterns.  
**Third-party placement:** RetroStage installable content format and approved asset provenance.  
**Key deliverables:**
- Create replaceable behavior and presentation presets.
- Declare required capabilities and compatibility.
- Provide sample variations rather than one branded identity.
- Validate source and license metadata.
**Exit:** Creators can accelerate genre production while retaining distinct project identity.

## RSM-109 — Template Compatibility / Sample Project Versioning
**Purpose:** Keep templates, recipes, presets, and samples usable across product versions.  
**Third-party placement:** RetroStage migration and content-pack services.  
**Key deliverables:**
- Define template/package versions and compatibility ranges.
- Migrate or explain incompatible content.
- Create golden sample projects for representative workflows.
- Prevent samples from becoming hidden implementation authorities.
**Exit:** Approved templates and samples open or migrate predictably on supported product versions.

## RSM-110 — Installable Content Pack System
**Purpose:** Create local installation, versioning, dependency, update, removal, and trust for approved packs.  
**Third-party placement:** RetroStage package format; public marketplace and commerce remain outside v0.  
**Key deliverables:**
- Define manifests, provenance, licenses, capabilities, conflicts, and project embedding/reference policy.
- Validate untrusted or incompatible content.
- Support templates, genre kits, presentation profiles, and content bundles.
- Provide safe uninstall and project portability rules.
**Exit:** Approved packs can be installed and used without adding a storefront, payment, entitlement, or DLC-commerce system.

## RSM-111 — No-Code Narrative Production Gate
**Purpose:** Validate Flow Graph, sequencing, interchange, templates, and packs as one production workflow.  
**Third-party placement:** All Gate H systems and product tests.  
**Key deliverables:**
- Build a representative narrative-horror sequence using native no-code tools.
- Prove debugging, skip/restoration, save interaction, export, and compatibility.
- Verify that external interchange is optional.
- Close critical usability and safety findings.
**Exit:** Gate H closes when a creator can produce a representative narrative experience without source-code authoring.

# Gate I — Reliable Public Alpha Product

## RSM-112 — Project Doctor / Golden Projects / Deterministic Replay QA
**Purpose:** Create canonical regression projects and repeatable product-level QA fixtures.  
**Third-party placement:** Vitest, Playwright, packaged-player automation, logs, hashes, and approved visual/audio comparison direction.  
**Key deliverables:**
- Cover migration, camera, interaction, AI, liminal flow, save, assets, presentation, audio, UI, Flow Graph, and sequencing.
- Define deterministic seeds and replayable inputs where supported.
- Separate expected nondeterminism from regressions.
- Connect failures to stable product identities.
**Exit:** Representative golden projects can detect cross-system regressions before release.

## RSM-113 — Automated Regression / CI / Reproducible Build
**Purpose:** Turn product validation, artifact generation, architecture, licenses, and clean-build checks into release gates.  
**Third-party placement:** GitHub Actions pinned appropriately, CycloneDX, dependency review, Vitest, Playwright, architecture tools, and packaging scripts.  
**Key deliverables:**
- Run clean install, typecheck, lint, unit, integration, Electron, player, migration, cooking, and artifact tests.
- Generate and compare SBOM, notices, inventories, hashes, and toolchain identity.
- Test restore and rebuild from remote sources.
- Prevent secret or development-dependency leakage.
**Exit:** A tagged candidate can be reproduced and validated from approved source and toolchain inputs.

## RSM-114 — Crash Recovery / Diagnostics / Recovery Bundle
**Purpose:** Protect editor work and create privacy-aware reproducible support artifacts.  
**Third-party placement:** Electron crash/process APIs, fflate, Pino, recovery journal, and artifact inventory.  
**Key deliverables:**
- Detect abnormal shutdown and offer approved recovery candidates.
- Create project-scoped diagnostic bundles with logs, manifests, system data, and optional content samples.
- Redact secrets and user-controlled private data.
- Test corruption, crash, and partial-job recovery.
**Exit:** Common editor failures do not silently destroy approved work, and users can produce safe diagnostic evidence.

## RSM-115 — Telemetry / Crash Report / Feedback Privacy Contract
**Purpose:** Define optional product analytics and feedback without hidden collection.  
**Third-party placement:** OpenTelemetry or hosted reporting enters only after explicit product, privacy, security, and license approval.  
**Key deliverables:**
- Define opt-in/opt-out, purposes, collected fields, retention, deletion, offline behavior, and user review.
- Separate local diagnostics from network telemetry.
- Protect project content and personal data.
- Provide transparent settings and documentation.
**Exit:** No telemetry or crash upload occurs without an approved privacy contract and user-visible control.

## RSM-116 — Project Compatibility / Backward Support / Developer Update System
**Purpose:** Define supported project versions, deprecation, migration guarantees, and product update behavior.  
**Third-party placement:** RetroStage migration, updater, release, and compatibility services; updater technology selected only after audit.  
**Key deliverables:**
- Define support window and unsupported-version behavior.
- Create pre-migration backup and rollback.
- Separate application updates from project migration.
- Publish migration and compatibility guidance.
**Exit:** Supported historical reboot projects open or migrate safely, and updates cannot silently strand user work.

## RSM-117 — Plugin / SDK / Permission Capability Model
**Purpose:** Create bounded extension points without surrendering project, filesystem, or runtime authority.  
**Third-party placement:** RetroStage public SDK; no arbitrary Electron/Node access by default.  
**Key deliverables:**
- Define extension identities, versions, capabilities, permissions, lifecycle, and compatibility.
- Expose typed commands, documents, UI slots, asset processors, validators, and runtime hooks only where approved.
- Sandbox or isolate untrusted operations as feasible.
- Provide disable, recovery, and diagnostic paths.
**Exit:** An approved extension can add value without bypassing canonical mutation, security, validation, or export policy.

## RSM-118 — AI Agent / MCP Controlled Project Integration
**Purpose:** Expose read and later scoped write tools through product-owned contracts.  
**Third-party placement:** RetroStage MCP server and agent boundary; no direct filesystem mutation authority.  
**Key deliverables:**
- Deliver read-only discovery and diagnostics before writes.
- Require scoped authorization, typed commands, capability checks, previews, validation, approval, undo/rollback, and provenance for mutations.
- Limit filesystem and process capabilities.
- Create audit logs and safe failure behavior.
**Exit:** Agents can assist without becoming hidden project authorities or bypassing creator approval and product safeguards.

## RSM-119 — Commercial Release Readiness / Onboarding / Accessibility / Security / Compliance / Distribution
**Purpose:** Converge all remaining user-facing and commercial obligations before Alpha qualification.  
**Third-party placement:** Approved installer/signing/Steam tooling only after exact conditional audits; documentation and localization tooling remain product-owned or separately reviewed.  
**Key deliverables:**
- Complete documentation, tutorials, onboarding, sample projects, and creator help.
- Complete localization, font fallback, subtitles, UI scale, contrast, reduced motion, input, audio, and display settings.
- Complete portable project archive, backup/version-control guidance, and collaboration-safe structure.
- Complete workspace trust, sandbox, path, content, plugin, agent, and supply-chain hardening.
- Complete installer/update channel, Steam depot direction, signing, third-party notices, SBOM, native/WASM inventory, product licensing, and asset-license handling.
**Exit:** A release-candidate editor can be installed, learned, used, recovered, secured, audited, and legally distributed through approved Windows channels.

## RSM-120 — First Playable Public Alpha / Investor Demo Candidate
**Purpose:** Prove RetroStage Maker as a coherent commercial creator product.  
**Third-party placement:** No new dependency may enter solely to force closure; all shipped components require final artifact-level approval.  
**Key deliverables:**
- Produce at least one representative PS1/early-PS2-inspired horror, mystery, narrative, or liminal game through supported creator workflows.
- Demonstrate create/open/save/migrate/recover, scene and asset authoring, gameplay, camera, presentation, animation, VFX, audio, UI, no-code logic, sequencing, PIE, debugging, validation, cooking, and standalone export.
- Run the editor and exported game on clean supported machines and verify performance, compatibility, security, licenses, notices, and recovery.
- Close all release-critical findings and publish truthful limitations.
**Exit:** RetroStage Maker is credible as a public Alpha and investor-demo candidate: a focused, independent Steam creator rather than a themed wrapper around a third-party engine editor.


---

# Appendix A — Third-Party Placement Summary

Third-party components enter only through their responsible milestone and do not replace the milestone's RetroStage-owned product work.

| Component | Earliest responsible milestone | Primary acceleration | RetroStage-owned responsibility that remains |
|---|---:|---|---|
| Node.js / pnpm / TypeScript | RSM-3 | Toolchain and monorepo | Topology, scripts, source authority, restore proof |
| Electron / Forge / Vite | RSM-5 | Desktop shell and packaging | IPC security, lifecycle semantics, player/editor separation |
| Babylon.js 9 | RSM-6 | Rendering and runtime facilities | Canonical documents, projection, gameplay, diagnostics, parity |
| React / Radix / Golden Layout / react-window | RSM-9 | Editor UI and docking | Product UX, design system, panel semantics, creator workflow |
| Zustand / XState | RSM-10 | Transient state and workflow lifecycle | Canonical mutation and business rules |
| TypeBox / Ajv | RSM-8 and RSM-11 | Runtime schemas | Migration, semantic validation, capability truth |
| Chokidar | RSM-14 | External-change observation | Review, identity, reimport, safe mutation |
| fflate | RSM-15 | Archives and recovery bundles | Recovery policy, integrity, privacy |
| Havok | RSM-17 / RSM-28 | Collision and physics solving | Channels, gameplay semantics, authoring, debug, save policy |
| better-sqlite3 | RSM-33 / RSM-74 | Rebuildable search/index cache | Canonical documents and reference semantics |
| Recast/Detour | RSM-59 | Navigation algorithms | Bake workflow, agents, patrols, validation, runtime ownership |
| glTF-Transform | RSM-75 | glTF inspection/transformation | Asset identity, settings, diagnostics, source/cooked policy |
| meshoptimizer | RSM-75 | Mesh optimization/compression | Quality profiles, preview, LOD policy, export blockers |
| KTX/Basis/Draco/media tools | RSM-76 / RSM-79 / RSM-95 | Optional content derivatives | Conditional license, patent, binary, quality, and fallback decisions |
| Pino | RSM-27 onward | Structured logs | Event taxonomy, privacy, creator diagnostics |
| OpenTelemetry JS | RSM-82 or later | Optional local traces | Privacy contract, hosted-service decision, product semantics |
| React Flow | RSM-104 | Graph canvas | Graph documents, execution, validation, debugger, safety |
| Monaco Editor | RSM-99 or later if justified | Advanced text/debug surfaces | Language and diagnostic semantics |
| Vitest / Playwright | RSM-3 onward | Automated evidence | Fixtures, acceptance criteria, product truth |
| dependency-cruiser / Knip | RSM-3 and RSM-20 | Architecture and dead-code checks | Ownership decisions and exceptions |
| CycloneDX / dependency review | RSM-3 and RSM-113 | SBOM and policy automation | License approval, notices, final artifact audit |
| Steamworks / installer / signing tools | RSM-102 / RSM-119 | Distribution | Product identity, secrets, packaging policy, compliance |

---

# Appendix B — Dependency Admission Rule

Every new production dependency must pass:

```text
Need
→ existing-authority check
→ candidate and exact release
→ maintenance/security review
→ direct and transitive license review
→ native/WASM/download audit
→ adapter and ownership contract
→ technical spike when needed
→ replacement/removal plan
→ exact pin and lockfile
→ tests and architecture guards
→ SBOM/notices/inventories
→ reviewer approval
```

A dependency is rejected when it:

- duplicates a renderer, canonical data, state, validation, persistence, or runtime authority,
- has no compatible license or verifiable provenance,
- downloads untracked binaries,
- requires unsafe Electron exposure,
- writes opaque third-party state into canonical documents,
- lacks a realistic maintenance or removal path,
- has no active milestone need.

---

# Appendix C — Preview / PIE / Export Completion Matrix

Each capability must declare one or more of these support states:

- authoring only,
- Editor Preview,
- PIE,
- cooked runtime,
- exported player,
- runtime save,
- Project Doctor validation,
- live debugging,
- hardware fallback.

A capability is not called complete when only its easiest state exists.

RSM-55, RSM-91, RSM-103, RSM-111, and RSM-120 are explicit integration and parity gates.

---

# Appendix D — Historical Product Target Preservation

The reboot roadmap preserves the historical target families:

- focused genre and camera profiles,
- canonical project/scene/component/asset documents,
- stable identity and migrations,
- component registry and Inspector binding,
- hierarchy, commands, validation, capability truth, and workspaces,
- runtime framework, clock, entity lifecycle, settings, and saves,
- camera, lighting, atmosphere, interaction, narrative, objectives, inventory, physics, and scene flow,
- liminal loops, anomaly state, repetition, substitution, and impossible-transition techniques,
- blockout, prefab, navigation, AI, stealth, combat, checkpoints, and controller support,
- asset registry, Content Browser, glTF, textures, audio import, reimport, hashing, resource management, and profiling,
- materials, skeletal/sprite/flipbook animation, animation state machines, VFX, player UI, and adaptive audio,
- cooked manifests, export compiler, standalone runtime, Project Doctor, optimization, packaging, and artifact reports,
- Flow Graph, native sequencing, generic cinematic interchange, genre kits, templates, and installable packs,
- golden projects, regression, crash recovery, privacy, compatibility, updates, plugins, controlled agents/MCP,
- documentation, onboarding, localization, accessibility, project archives, backup, security, reproducibility, distribution, licensing, and public Alpha polish.

No named hypothetical companion product remains in the canonical roadmap.

---

# Appendix E — Roadmap Change Control

A roadmap change must state:

- exact milestones affected,
- whether it changes order, ownership, scope, dependency, or exit criteria,
- charter and technology-contract compatibility,
- migration and historical-reference impact,
- schedule and product-gate consequence,
- whether a source-alignment update is required.

A new feature may not be inserted merely because a library makes it easy.

A roadmap milestone may be split when implementation risk warrants it, but the parent exit remains unchanged until all required slices pass.

---

# Appendix F — Source Reconstruction Handoff Record

The pre-repository source-reconstruction sequence approved by this roadmap was:

```text
05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md
03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md
04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
08_RSM_REBOOT_CURRENT_MILESTONE.md
09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md
RSM-2-V1-SOURCE-SET-CONSISTENCY-REVIEW.md
RSM-2-CLOSE1-SOURCE-RECONSTRUCTION-CLOSURE.md
```

`07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` is intentionally excluded from the pre-repository sequence. It may be created or finalized only during RSM-3 after physical repository paths, manifests, scripts, commands, branch state, clean-clone behavior, and restore evidence exist.

RSM-3 may activate only after the source set establishes:

- current truthful pre-repository state,
- active milestone authority,
- planned package topology,
- repository-path and remote selection requirements,
- validation-command ownership,
- backup and restore acceptance,
- first task scope and evidence requirements.

The repository path, remote URL, branch, exact commands, and restore procedure are RSM-3 outputs; they are not pre-repository source assumptions.

---

## Approval Statement

Approval of this roadmap means:

- the pre-loss implementation sequence no longer governs live work,
- the full product target remains preserved,
- the opening sequence now proves security, backup, testing, licenses, PIE, and standalone export early,
- Babylon.js 9 and Electron remain bounded implementation foundations rather than product authorities,
- milestone-gated and conditional third-party components enter only when their owning work begins,
- native sequencing remains core,
- external cinematic interchange remains optional and generic,
- RSM-120 remains the first public-quality Alpha and investor-demo product gate.
