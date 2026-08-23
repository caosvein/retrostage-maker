# RetroStage Maker — Reboot Canonical Roadmap

**Document ID:** `01_RSM_REBOOT_CANONICAL_ROADMAP`  
**Role:** Canonical long-range product, architecture, dependency-order, and product-gate roadmap  
**Project:** RetroStage Maker  
**Roadmap namespace:** `RSM-0` → `RSM-120`  
**Document date:** 2026-08-22  
**Document state:** `ACTIVE CANONICAL ROADMAP / RSM-6 MILESTONE CLOSED-PASS / Gate B ACTIVE / CURRENT`  
**Repository:** `ESTABLISHED — live physical truth belongs to Source 02/07 and repository inspection`  
**Primary branch:** `main`  
**Primary product target:** `RSM-120 — Public Alpha / Investor Demo Maturity Gate`  
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

RetroStage should prefer mature permissively licensed libraries when they remove low-value boilerplate, reduce known error classes, or provide well-tested infrastructure without replacing RetroStage product semantics. Convenience is not enough by itself; the dependency must reduce total maintenance risk.

RetroStage-owned development tooling may automate repetitive evidence collection such as SHA-256, Git blob/tree/parent identity, patch boundaries, Source-manifest equality, remote refs, and CI run identity. Such tooling remains evidence collection only: it does not become owner authorization, independent review, validation truth, or an implicit stage/commit/push authority.

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

### POST-RSM-3 PRODUCT STRATEGY ALIGNMENT — Non-Numbered Inter-Milestone Control
**Purpose:** Lock durable commercial creator-rights, exported-game legal/credits metadata, pricing-boundary, and localization-safe architecture decisions before engineering/review gate activation.  
**Boundary:**
- Roadmap renumbering is `FALSE`.
- An `RSM-3.5` milestone is `FALSE`.
- RSM-4 implementation is `NOT STARTED`.
- Production dependency changes are `NONE`.
**Exit:** The strategy decisions are independently accepted in live source authority and RSM-4 may then be activated under separate authority.

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
**Purpose:** Create the sole 3D viewport and renderer-adapter foundation while using Babylon's proven derived-runtime primitives aggressively enough to reduce boilerplate, without making Babylon canonical.  
**Accepted implementation and closure status:** `MILESTONE CLOSED / PASS`; `I1-I8` are `CLOSED / ACCEPTED` and RSM-6-V1 is `CLOSED / PASS`. The independently validated implementation baseline remains `dbd3f2be31d89ca36a17ccb4914e21623df424a2` with tree `5a3186fa70a5215fe1aaf770a1b845c5d1ff4107`; the accepted closure/publication baseline is `34b1148e1c7be12e30f1e962148d40b5027a7b07`, validated by natural CI run `32526483832`, job `96909482744`, attempt `1`, with `success`.  
**Third-party placement:** Exact `@babylonjs/core@9.21.2` and `@babylonjs/loaders@9.21.2` are admitted renderer runtime dependencies. Exact `babylonjs-gltf2interface@9.21.2` is admitted only as the renderer package's declaration-only development/build strict-peer provider. Inspector, materials, serializers, addons, decoder helpers, Havok, and other Babylon families remain outside the admitted RSM-6 graph.  
**Key deliverables:**
- Create the viewport, camera/controller seam, grid, render loop, resize handling, and device/context-loss direction.
- Define adapter-owned stable-ID ↔ transient Babylon-handle registries.
- Route Babylon picking through RetroStage stable identity and selection intent; Babylon hit results never become canonical selection.
- Establish `AssetContainer`-based derived asset/resource ownership and explicit create/dispose/teardown rules.
- Establish `UtilityLayerRenderer` plus a RetroStage-owned render-classification seam for editor overlays, gizmos, selection/debug visuals, and later capture surfaces.
- Establish a `GizmoManager` seam with RetroStage retaining selection, command, validation, and mutation authority.
- Establish `NullEngine` as a headless adapter-conformance backend; it supplements but never replaces real WebGL/WebGPU/Electron renderer validation.
- Expose `SceneInstrumentation` through RetroStage-owned diagnostics snapshots instead of leaking Babylon instrumentation objects across package boundaries.
- Keep Babylon Inspector UI and headless Inspector/CLI connectivity development-only, diagnostic-oriented, removable from production artifacts, and non-authoritative for canonical mutation.
- Prefer narrow ESM imports/tree-shaking; legacy monolithic imports are not the baseline.
- Keep Babylon scene objects replaceable and disposable.
- Reserve a Frame Graph/backend seam without moving advanced post-processing or presentation authoring into RSM-6.
**Accepted exit evidence:** A derived scene renders through the real Electron editor viewport; the same adapter foundation is exercised through a real `NullEngine` headless path and RetroStage-owned diagnostics; stable-handle picking, derived asset-container ownership, editor grid/camera/gizmo intent seams, context-loss recovery, and ordered resource teardown are proven while canonical documents remain Babylon-independent. Natural push CI run `32496829684`, job `96817113858`, attempt `1`, on `main` completed with `success`; fresh-clone automated validation and owner manual acceptance independently passed.

## RSM-7 — Canonical Project / Scene Document Foundation
**Current control boundary:** `RSM-7 = NEXT ROADMAP MILESTONE / NOT STARTED / NOT AUTHORIZED`; live activation belongs to Source 02/08 and separate owner authority. Roadmap/source alignment by itself never activates RSM-7 implementation.  
**Purpose:** Define the first versioned project, scene, entity, component-envelope, and asset-reference documents.  
**Third-party placement:** RetroStage-owned TypeScript packages own persistence; `fast-check` may enter `DEVELOPMENT_ONLY` after exact admission when property-based tests materially reduce schema/round-trip risk.  
**Key deliverables:**
- Define deterministic serialization and explicit schema versions.
- Separate authoring documents from editor preferences and generated files.
- Define unknown-data preservation policy.
- Establish the first Golden Fixture Corpus with known-valid, known-invalid, corrupt, compatibility, and round-trip fixtures.
- Establish a deterministic `load → parse → canonical model → save → reload → compare` round-trip harness.
- Create headless fixtures independent of Electron, React, and Babylon.
**V2 game-wide composition foundation additions:**
- Define the minimal `GameDefinitionDocument` envelope and stable `ProjectDocument.gameDefinitionId` binding for one game-wide composition root without turning ProjectDocument into a giant settings object.
- Keep RSM-7 GameDefinition content intentionally narrow: identity, schema/version, typed stable references/default slots, requested-capability intent envelope, validation ownership, deterministic serialization, unknown-data policy, and headless round-trip fixture shape only.
- Distinguish requested capability intent from later canonical Capability Matrix supported-capability truth; do not implement full effective-capability resolution in RSM-7.
- Extend Golden Fixture and round-trip coverage to Project/Scene/GameDefinition reference integrity.
- Do not implement gameplay profiles, Scene Director, full runtime resolver, RNG runtime, audio runtime, navigation runtime, or later subsystem semantics in this milestone.

**Exit:** Projects and scenes can be created, parsed, serialized, round-tripped, and compared without renderer or UI ownership.

## RSM-8 — Stable Identity / Schema Migration / Reference Foundation
**Purpose:** Establish durable IDs, reference types, migration order, remapping, and missing-reference diagnostics.  
**Third-party placement:** TypeBox and Ajv may support shape validation after exact package identity is approved; development-only `fast-check` may exercise stable-ID, migration, and reference invariants.  
**Key deliverables:**
- Define project, scene, entity, component, asset, and future document identities.
- Prohibit display-name, array-index, and renderer-object identity as persistent references.
- Create explicit migration functions and future-version rejection.
- Create deterministic fixtures for ID preservation and remapping.
- Add property-based invariants where generated edge cases provide more value than hand-written examples alone.
**V2 game-wide identity/migration additions:**
- Extend stable identity, reference remapping, migration, compatibility, and revision rules to `GameDefinitionDocument` and the Project→GameDefinition binding.
- Define coherent accepted authoring revision/snapshot identity so later resolution cannot combine mutually inconsistent live revisions.
- Preserve structurally safe unknown extension data without executing it; required unknown runtime meaning fails closed instead of silently disappearing or guessing semantics.
- Add fixtures for GameDefinition identity preservation/remap, unknown-extension preservation, and coherent revision identity.

**Exit:** A supported old fixture migrates to the current schema without silent identity or unknown-data loss, and generated/reference edge cases cannot silently break stable-identity guarantees.

## Cross-Milestone Architecture Alignment — Game-Wide Composition & Deterministic Resolution

**Type:** `CROSS-CUTTING ROADMAP CONTRACT / NOT A NUMBERED MILESTONE / NOT CURRENT IMPLEMENTATION AUTHORITY`

RetroStage requires one explicit game-wide composition root without creating a giant GameMode object or collapsing subsystem ownership.

```text
ProjectDocument
      ↓ stable gameDefinitionId
GameDefinitionDocument
      ↓ typed references/default intent
accepted immutable authoring snapshot
      ↓ coherent resolution view
GameConfigurationResolver
      ↓
ResolvedGameConfiguration
      ↓
RuntimeGameSession / Preview / Cook / Export consumers
```

**Binding semantics:**
- `GameDefinitionDocument` composes game-wide intent through stable references; it does not inline every Scene, enemy, UI widget, dialogue line, asset, or subsystem document.
- `GameConfigurationResolver` is one RetroStage-owned, headless, deterministic resolution contract reused by Preview/PIE/runtime/cook/export rather than separate hidden resolvers.
- `CanonicalProjectSnapshot` terminology, where used by future implementation/evidence, means a coherent resolver view of one accepted immutable authoring snapshot; it is not a second persisted snapshot/session authority.
- `ResolvedGameConfiguration`, `ResolutionDependencySet`, and `ResolvedConfigurationFingerprint` are derived runtime/cache/provenance/regression evidence, never canonical authoring truth.
- Capability authority is separated as `RequestedCapabilities ≠ SupportedCapabilities ≠ EffectiveCapabilities`: GameDefinition may request intent, the canonical Capability Matrix owns support truth, and the resolver derives effective capability truth for a resolution context.
- GameDefinition defaults, Project Variables, Runtime Settings, Player Settings, Runtime Save state, target/build settings, editor/Studio state, and secrets remain separate authorities.
- Resolution fails closed on missing required semantic meaning, exposes provenance/explainability, and never writes resolved runtime state back into canonical documents.
- RSM-7 creates only the extensible document shape; RSM-8 owns stable identity/remap/migration; RSM-16 owns first shared resolver/runtime integration. Later subsystem milestones populate their own typed meaning.
- No new `game-definition` or `config-resolver` package is mandated by this roadmap alignment; Source 03 package-creation rules remain controlling.

**Runtime hardening owner map:**

| Contract | Primary roadmap owners |
|---|---|
| Runtime clock domains, ordered update phases, fixed/variable semantics | RSM-16–17 |
| Runtime entity identity, spawn/despawn provenance, save-safe boundary | RSM-23–24 |
| Async generation leases and worker mutation barrier | RSM-27 |
| Event/Action effect idempotency, semantic commit keys, causal-chain budgets | RSM-37+ |
| Transactional Scene/Section lifecycle and residency | RSM-39, RSM-63–64 |
| Camera/input arbitration and focus/device lifecycle | RSM-42, RSM-67 |
| Shared traversal metrics and dynamic navigation projection | RSM-56–64 |
| Domain-separated deterministic randomness | RSM-16+, RSM-57, RSM-86 |
| Audio semantic/lifetime/listener/transition ownership | RSM-79, RSM-88–89 |
| Animation marker/event semantic identity | RSM-84–85 |
| Same composition/resolution contract in cook/export | RSM-18, RSM-94–103 |

This contract is future-direction source truth only. It does not start or authorize RSM-7 implementation.

### V5 Runtime / Composition Detail Completeness Lock

This lock preserves runtime details from the reviewed game-wide composition candidate that must not disappear behind generic subsystem wording.

**Event queue dispatch contract**
An Event/Action occurrence carries one explicit dispatch class:
```text
IMMEDIATE_ALLOWED
DEFERRED_TO_PHASE_BOUNDARY
DEFERRED_TO_NEXT_TICK
```
or an implementation-equivalent enum with the same bounded semantics. Immediate dispatch is allowed only where the owning phase permits it and still consumes causal-work budget. Same-priority queued work is ordered deterministically by accepted enqueue sequence plus stable tie-break identity. Cancellation, owner teardown, re-entry and dispatch of newly-enqueued work during a drain are explicit; hidden recursion cannot bypass the queue, phase, idempotency or causal-budget contracts.

**Level / traversal creator diagnostics**
As the owning milestones activate, creator diagnostics must cover representative failures such as blocked/invalid spawn, insufficient head/door/step clearance, traversal-metric mismatch, unreachable required Section/exit, broken dynamic navigation link, invalid cross-Scene reference, camera clearance/composition obstruction, stale derived navigation, and Scene/Section transition ownership conflicts. A World/Level Flow visualization may be added as an optional editor-only derived view if creator need proves it useful; it is not a new canonical graph, milestone, or runtime authority.

**Critical synchronized audio**
Audio latency classes must distinguish ordinary streamed/preloaded content from a synchronization-critical cue whose late start would change gameplay, dialogue, sequence or presentation meaning. Critical cues require an owning readiness/preload or explicit degraded/blocker policy and diagnostics; silently starting materially late is not valid parity. Sequence/dialogue/UI audio ownership and interruption/restoration reuse the same audio lifetime scopes rather than private UI/Sequencer audio truth.

**Runtime session generation**
Starting a New Game, full retry that creates a fresh world/session, return-to-title followed by a new session, or PIE restart mints a fresh `RuntimeSessionGeneration` (or accepted equivalent). Async completion from generation N cannot mutate generation N+1 merely because the older task completed later.

**Composition transaction**
A creator operation that changes `GameDefinitionDocument` together with referenced profiles/documents is one normal multi-document authoring transaction/command. Validation occurs before commit where required, and failure/cancellation cannot leave a half-applied canonical composition graph.

**Resolver parity acceptance A–H**
The resolver foundation must eventually prove:
A. deterministic base resolution from equivalent canonical inputs;  
B. independence from editor/workspace/UI state;  
C. Preview/PIE effective-configuration parity for the same context;  
D. cook/export uses the same composition semantics;  
E. missing required reference/meaning fails closed and is diagnosable;  
F. supported migration/default evolution preserves declared compatibility;  
G. effective override provenance is explainable;  
H. save/reload/round-trip does not silently change effective composition.

**Dynamic navigation timing**
Door/blocker/Section/teleport/passability changes publish navigation projections at an owning, explicit runtime boundary. A stale derived navigation result cannot overwrite a newer gameplay/passability generation; Scene unload cancels/rejects owner-scoped navigation work; save/load reconstructs navigation from semantic gameplay state rather than serializing backend topology.

## RSM-9 — Editor Shell / Hierarchy / Inspector Vertical Slice
**Purpose:** Create the first product-owned editor workspace around the Babylon viewport.  
**Third-party placement:** React, React DOM, selected Radix primitives, Golden Layout behind an adapter, react-window where scale requires it, CSS Modules, and CSS variables. Development-only Testing Library packages are approved in principle for user-oriented React/DOM tests after exact admission. Storybook is a conditional development-only component-workbench candidate, not a product/runtime dependency.  
**Key deliverables:**
- Create viewport, hierarchy, inspector, problems placeholder, and project navigation surfaces.
- Keep panel layout local and non-canonical.
- Support product-owned dock/tab/resize workspace behavior through the approved Golden Layout adapter while keeping layout state editor-local and non-canonical.
- Persist supported workspace layouts locally between application sessions without marking project content dirty.
- Provide a safe reset-to-default path for the current workspace layout; reset changes editor preference state only and must not mutate project content, undo history, runtime state, or exported content.
- Create RetroStage design tokens, component states, terminology, focus rules, and interaction semantics.
- Exercise UI behavior with semantic/user-oriented tests rather than component-instance or implementation-detail assertions.
- If Storybook is admitted, use it only to develop/document/test RetroStage-owned UI components and states in isolation; it must not become the editor shell, canonical design authority, hosted dependency, or required production runtime.
- Prove keyboard focus and basic accessibility behavior.
**Exit:** The user can navigate a project and select an entity through a branded RetroStage interface without exposure to a third-party engine editor, and critical UI behavior is testable without coupling tests to React internals.

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
**Third-party placement:** Babylon gizmo/picking facilities behind RetroStage adapters; React UI remains non-canonical. The modern `dnd-kit` package family is approved in principle as a milestone-gated UI interaction backend for hierarchy/list/asset drag-and-drop when the exact slice proves it reduces bespoke pointer/keyboard/accessibility code.  
**Key deliverables:**
- Define the first transform convention and candidate edit flow.
- Project stable entity IDs to disposable renderer objects.
- Support create, select, move, rotate, scale, and delete for the minimal slice.
- Define drag-and-drop intents separately from canonical mutation; any admitted DnD toolkit emits RetroStage intents/commands rather than editing documents directly.
- Preserve keyboard-accessible reorder/move semantics and deterministic drop validation.
- Ensure renderer refresh does not reverse-write arbitrary Babylon state.
**Exit:** Transform edits survive save/reopen and produce matching Preview state from canonical documents; any hierarchy drag/drop path remains replaceable and command-authoritative on the RetroStage side.

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
**V2 composition/runtime hardening additions:**
- Implement the first headless `GameConfigurationResolver` contract over one coherent accepted authoring snapshot and produce derived `ResolvedGameConfiguration` plus dependency/fingerprint evidence without making derived data canonical.
- Use the same composition/resolution semantics later consumed by standalone runtime/export; do not read mutable UI/live-document state as shipped configuration authority.
- Define explicit runtime clock domains, ordered update phases, fixed/variable-step semantics, pause/time-scale/hit-stop behavior, and teardown/quiescence contracts.
- Establish RetroStage-owned domain-separated RNG stream/seed provenance hooks; any later PRNG library is a replaceable adapter beneath RetroStage save/test/trace semantics.

**Exit:** PIE starts and stops repeatedly without canonical mutation, leaked runtime ownership, or duplicate loops.

## RSM-17 — Collision / Grounding / Playable Sandbox / Vertical-Slice Tests
**Purpose:** Add the first bounded playable movement and collision slice with permanent test evidence.  
**Third-party placement:** `@babylonjs/havok` may enter only after its milestone-gated native/WASM license and inventory review passes; otherwise use an approved temporary test seam without committing a second physics authority.  
**Key deliverables:**
- Implement protagonist movement, grounding, blocker collision, and simple trigger observation.
- Define physics adapter ownership and teardown.
- Add Vitest contract tests and Playwright Electron smoke tests.
- Record native/WASM artifacts when Havok ships.
**V2 runtime stability additions:**
- Run gameplay-sensitive collision/grounding from the approved runtime clock/fixed-update semantics rather than renderer-frame timing.
- Keep authored entity identity, runtime entity identity, renderer handles, physics bodies, and persistence/save identity distinct.
- Prove a stable runtime entity mapping/provenance boundary and an allowed save-safe/quiescent point for the vertical slice where applicable.

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

### POST-RSM-18 — Studio Identity & Creator Experience Pass

**Type:** `NON-NUMBERED INTER-MILESTONE PRODUCT EXPERIENCE CONTROL`  
**Activation precondition:** `RSM-18 MILESTONE CLOSED / PASS AND GATE B CLOSED`  
**Sequencing rule:** `RSM-19 MAY NOT START UNTIL THIS CONTROL IS CLOSED / PASS`  
**Purpose:** Convert the proven Gate-B product spine into a personal, polished, creator-owned working environment before Gate-C authoring breadth expands, without adding gameplay capability or changing canonical project/runtime authority.  
**Third-party placement:** Existing approved Electron/React/Golden Layout/browser-platform capabilities only unless a separate Source-06 dependency-admission gate approves an additional production dependency. Bundled artwork/audio remains subject to asset/content provenance and redistribution-rights evidence.

**Required direction:**
- Startup Welcome / Studio Launcher shown before a project is active, with local Creator Profile identity, optional hero artwork, Continue, New Project, Open Project, Recent Projects, passive Project Memory, and Recent Captures/Project Gallery surfaces.
- Successful New/Open/Continue leaves the launcher and enters the normal active workbench through the same trusted application-layer project-open/create authority.
- Local Creator Profile remains an editor/app preference identity, not an account and not exported-game developer/publisher/legal metadata.
- Recent Projects / Continue may not bypass workspace trust, path validation, schema/version handling, migration, recovery, or diagnostics.
- Project Memory and Session Rituals are passive local history/presentation only; no streaks, XP, goals, productivity scores, achievements, daily quests, or shutdown blockers.
- Recent Captures / Project Gallery is local creator-history media, not canonical project assets unless a later explicit normal asset-import action imports a copy.
- Studio Player uses only explicitly user-selected local media through secure Electron Main/Preload-mediated operations.
- Studio Radio uses only bundled first-party or otherwise redistribution-cleared offline media; it is not network/streaming radio.
- Studio Presets affect editor experience only and remain separate from canonical game `PresentationProfile` data.
- PIE Studio-audio interlock defaults to Pause, may optionally Dim or Do Nothing, and must restore the exact pre-PIE Studio playback state.
- Studio Experience is fully disableable and its surfaces individually hideable; the RSM-18 create/edit/save/reopen/PIE/export spine must remain functional with Studio Identity disabled.
- Workspace dock/tab/resize persistence and reset remain editor-local and project-clean.

**Authority/security boundary:**
- Studio state must not enter `ProjectDocument`, `SceneDocument`, gameplay documents, runtime-save schemas, cooked runtime manifests, or exported-player artifacts.
- Studio Player/Radio are creator-comfort systems, not game-audio authoring/runtime authority.
- Renderer code receives no arbitrary filesystem authority and Studio media discovery performs no silent broad filesystem scan.
- Stale Project Memory / recent-project references cannot silently mutate, recreate, or repair canonical projects.
- Bundled media requires explicit provenance, usage-rights, attribution, and redistribution evidence.

**Explicit non-goals:**
- cloud account, social graph/feed, public online profile, gamified productivity, Spotify/music-service integration, streaming radio, marketplace/payment/entitlement infrastructure, mandatory telemetry, Steamworks/Steam achievements, detached multi-window/multi-monitor closure requirements, or any gameplay/renderer/physics/AI/Flow-Graph/content-pack/plugin scope not required by the narrow Studio experience.

**Control slices:** `SICE-A → SICE-B → SICE-I1…I6 → SICE-V1 → SICE-CLOSE1 → SICE-ALIGN1`.

**V2 composition/export additions:**
- Build the minimal standalone sample from the same `GameDefinitionDocument` and shared resolver semantics used by PIE; a separate export-only resolver or hidden player defaults are forbidden.
- Prove minimal GameDefinition→resolved runtime→player parity while excluding editor/Studio-local/source authority from the player.

**Exit:** Studio Identity closes only when its local persistence, secure media access, launcher/project-open path, workspace persistence/reset, PIE audio interlock, master-disable behavior, provenance, export exclusion, and no-canonical-authority guarantees are independently proven. On closure, RSM-19 may be separately authorized.

#### SICE Feature-Level Product / Acceptance Lock

The following feature-level SICE contract is binding for the non-numbered control. It refines the high-level direction above without creating project/runtime authority.

**Canonical terminology and lifecycle**
- `Studio Identity` is the editor-local creator-experience umbrella.
- `Startup Welcome / Studio Launcher` is pre-project UI. Startup enters the launcher; successful New/Open/Continue project admission removes it completely from the active workbench; closing the active project may return to the launcher.
- `Studio Home` may be conversational shorthand only; it is not a persistent project workbench authority.
- Active authoring space remains primary: hero/welcome presentation disappears after project admission; Studio Player/Radio controls are compact and hideable; Gallery/Project Memory are optional surfaces; Creator Profile is mainly Welcome/Settings identity; master disable can reduce persistent Studio footprint to effectively zero.

**Project Memory / Session Ritual detail**
Project Memory may retain local convenience/history fields such as:
```text
firstSeenAt / firstOpenedAt
lastOpenedAt
lastValidSceneId/reference when available
sessionCount
accumulatedStudioSessionTime
lastSessionDuration
recent/favorite capture references
safe lastKnownProjectLocation for recent-project navigation
```
These are local history, never project truth or productivity scoring.

Session Rituals may show non-blocking welcome/close summaries such as last project/scene, session duration, or capture count. They must be independently disableable, must not delay shutdown, require no network service, and must not introduce streaks, achievements, XP, goals, rankings, productivity pressure, or compliance scoring.

**Gallery / capture detail**
A local Gallery/Recent Capture record may include:
```text
captureId
stable associated project identity
associated scene identity when available
createdAt
favorite/pinned state when supported
Studio-owned local media locator
```
Entity/camera references are optional local convenience only. Project moves, scene deletion, stale records, or missing media must degrade to diagnosable missing/stale local references and must never corrupt, recreate, rewrite, or silently repair canonical projects.

**Studio Player**
Baseline local-media behavior includes explicit file and/or folder selection, play/pause, previous/next for a list, seek where supported by the selected media, volume, optional shuffle/repeat, local playlist/library preferences, compact/hideable controls, and PIE interlock.

Forbidden Player behavior includes background disk crawling, arbitrary Renderer filesystem access, automatic project import/copy, automatic Audio-asset conversion, export inclusion, or streaming-service integration. `Use/Import in Project` is a separate normal project asset-import command with normal provenance/import rules.

**Studio Radio**
Studio Radio is offline bundled creator-comfort audio only. Shipped tracks require verifiable ownership/redistribution rights. Baseline operation must require no external API, login, subscription, Spotify/music-service integration, or network radio.

**Studio Preset**
A Studio Preset may coordinate editor visual tone/preferences within accessibility limits, launcher presentation, Studio Radio selection, Studio Player defaults, and small decorative editor ambience. It must not change Scene lighting, project materials, game cameras, game post-processing, gameplay, runtime audio, exported-player rendering, or canonical `PresentationProfile`.

**PIE audio interlock**
```text
capture exact pre-PIE Studio playback state
→ PIE START
   → Pause (default) / Dim / Do Nothing local preference
→ PIE ACTIVE
→ PIE STOP
   → restore pre-PIE play/pause state, supported track-position behavior, and volume
```
If Studio audio was paused before PIE, it remains paused after PIE Stop. A newer user action during PIE must not be overwritten by stale restore logic unless the interlock contract explicitly owns that state transition.

**Master disable**
With `Disable Studio Experience`, the following core chain must still pass without Creator Profile, Project Memory, Gallery, Studio Player/Radio/Presets or rituals:
```text
create project
→ edit
→ save
→ close
→ reopen
→ PIE
→ stop PIE
→ cook/export
→ run player
```

**Implementation evidence required for SICE closure**
Evidence must include, as applicable:
- unit/contract tests for local state, startup/close lifecycle, persistence and reset semantics;
- Main/Preload IPC schema, sender/origin/path validation and denied-path behavior for local media;
- React/Electron acceptance for Welcome/Continue/New/Open, workspace reset and Studio disable;
- filesystem permission/path-failure fixtures;
- stale recent-project and stale/missing Gallery reference fixtures;
- restart persistence checks;
- exact PIE interlock restoration tests, including pre-paused state and volume/position behavior where supported;
- project-dirty invariants for workspace/Studio-only changes;
- cooked/export forbidden-content inventory proving Studio-local state/media exclusion;
- bundled-media provenance/license evidence;
- a no-network proof for baseline Studio Radio;
- exact architecture/diff review plus normal V1/CLOSE1 evidence.

**Failure / deferral rule**
If SICE later proves materially riskier or more expensive than expected, accepted RSM-18 closure remains valid. SICE may be narrowed/deferred only through explicit source change control. RSM-19 may not silently bypass a still-binding SICE-before-RSM-19 rule; removing or changing that sequencing dependency requires a formal roadmap/decision amendment.

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
**V2 entity/lifetime additions:**
- Define authored stable identity, runtime-spawned identity, persistence/save identity, spawn provenance, despawn reason, and explicit mapping without serializing renderer/physics/navigation object identity.
- Tie owner-scoped scheduled work and async results to runtime entity/session lifetime so teardown cannot leave stale work with mutation authority.

**Exit:** Runtime entities can be spawned and removed without identity collision, leaks, or project mutation.

## RSM-24 — Runtime Settings / Project Variables / Serializable-State Registry
**Purpose:** Create typed runtime configuration and declare which systems may participate in save/restore.  
**Third-party placement:** TypeBox/Ajv for structure; RetroStage owns semantics.  
**Key deliverables:**
- Define project variables, runtime settings, defaults, and overrides.
- Define serializable runtime state registration and versioning.
- Separate secret/editor-only values from exported runtime settings.
- Define unsupported or non-serializable state diagnostics.
**V2 state/save additions:**
- Keep GameDefinition defaults, Project Variables, Runtime Settings, Player Settings, Runtime Save state, target/build settings, editor/Studio state, and secrets as distinct authorities with explicit precedence.
- Define a stable/quiescent save-safe boundary and explicit save participation for RNG stream state, effect commit state, and owner-scoped scheduled work where those semantics later become active; do not persist opaque timer/backend handles.

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
**V2 async/worker additions:**
- Every material long-running derived job captures an owner plus relevant accepted snapshot/session generation lease; completion is accepted only if the lease still matches current authority.
- Workers compute derived results only. Canonical mutation is validated/committed by the owning application/command authority; worker completion alone grants no mutation authority.
- Reject/cancel stale import, validation, navigation-bake, thumbnail, cooking, export, and related results deterministically when their lease is obsolete.

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

## Cross-Milestone Public Alpha Gameplay / Storytelling / Player-Experience Alignment

This roadmap adopts one bounded first-product gameplay model without creating a milestone per mechanic.

**Core composition model:**

```text
Supported Game Profile / capability envelope
+ first-class gameplay profiles
+ canonical components
+ validated recipes
+ specialized creator editors
+ shared Event/Action contracts
+ runtime systems
+ diagnostics
+ explicit save/export participation
```

`Supported Game Profile` is the project capability envelope owned by RSM-19. `MovementProfile`, `CameraProfile`, `InteractionProfile`, `EnemyProfile`, `PerceptionProfile`, `AttackProfile`, `WeaponProfile`, `FeedbackProfile`, `SaveExperienceProfile`, and similar gameplay authoring profiles are typed tuning/authoring semantics; they are not a second capability registry.

**Binding product direction:**
- Common gameplay must not require Flow Graph. First-class profiles/components/recipes/specialized editors author common behavior; Flow Graph later orchestrates and extends the same shared semantics.
- Gameplay feel is coordinated across movement, camera, animation, audio, VFX, UI, haptics where supported, and timing.
- Narrative authoring expresses story meaning directly through story state, NPCs, dialogue, clues/knowledge, objectives/tasks, readables, and bounded narrative recipes before falling back to generic graph logic.
- Enemy authoring begins from bounded archetypes/profiles, state vocabulary, perception, attacks, activation, encounter recipes, and diagnostics rather than requiring a general behavior-tree/GOAP IDE.
- Runtime Save persists approved semantic progress, not engine object graphs.
- Player UI presents gameplay meaning; UI widgets/React state do not become gameplay authority.
- Creator-facing style defaults may be distinctive, while bounded player accessibility/readability overrides may take precedence through typed runtime settings.
- Every supported gameplay capability must declare Preview/PIE/runtime/cook/export/save/diagnostic responsibilities where applicable.

**Existing milestone ownership map:**

| Capability family | Primary roadmap owners |
|---|---|
| Capability envelopes, components, recipes | RSM-19, RSM-37, RSM-69 |
| Player movement, camera, interaction, physical props | RSM-17, RSM-28, RSM-41–46, RSM-51, RSM-67 |
| Items, inventory, puzzles, containers, utility equipment | RSM-50, RSM-69, RSM-87 |
| Story state, clues/knowledge, NPCs, dialogue, objectives | RSM-24, RSM-39, RSM-47–49, RSM-60, RSM-69, RSM-87, RSM-104–106 |
| Enemy, stealth, perception, bounded combat | RSM-59–62, RSM-68–70 |
| Runtime save, continue, death/retry | RSM-24, RSM-65–66, RSM-70 |
| Player UI, typography, frontend, dialogue presentation | RSM-48, RSM-67, RSM-87, RSM-119 |
| Input, controller, accessibility/readability overrides | RSM-67, RSM-87, RSM-119 |
| Feedback, audio/VFX/UI gameplay language | RSM-37, RSM-45, RSM-70, RSM-87–89 |
| Native sequencing and conditional media tracks | RSM-106 plus Source-06 admission where media technology is required |
| Gameplay/narrative/AI/save diagnostics | RSM-70, RSM-98–99, RSM-101, RSM-112 |
| Integrated proof and exported parity | RSM-55, RSM-72, RSM-91, RSM-111, RSM-120 plus RSM-94–103 |

**Representative first-product composition target:** fixed-camera survival horror, modern chase horror, mystery/narrative horror, liminal/anomaly horror, and action-horror-lite must be achievable by composition of the same bounded systems rather than separate engine architectures.

The Deferred Scope Registry in Source 05 remains binding: this direction does not authorize multiplayer/live-service, open-world/RTS/general-RPG scope, unrestricted procedural/physics systems, broad RPG loot/economy/crafting frameworks, general-purpose UI/application builders, unrestricted scripting/Flow Graph, or other excluded first-product systems.

## Feature-Level Gameplay / Storytelling / Player-Experience Completeness Annex

**Status:** `BINDING ROADMAP DETAIL / REBASED TO CURRENT AUTHORITY MODEL`

The following reviewed capability detail is retained at feature level so future source alignment cannot collapse product intent into generic subsystem names.

Normalization rules for this annex:
- `ALPHA CORE / ALPHA SUPPORTED / ALPHA CONDITIONAL / EDITOR ONLY` are product-scope labels only; they do not replace `RequestedCapabilities / SupportedCapabilities / EffectiveCapabilities`.
- `Supported Game Profile` is the project capability envelope. Player/Movement/Camera/Enemy/Attack/Weapon/Feedback/SaveExperience and similar profiles remain typed subsystem-owned authoring semantics referenced by `GameDefinitionDocument`.
- specialized editors/workshops/directors are editor-only views/workflows unless another canonical source explicitly assigns persisted semantics.
- official export disposition remains `EDITOR_ONLY / COOKED / RUNTIME / HYBRID`; save participation is separate metadata.
- Public Alpha language in this annex refers to the RSM-120 `Public Alpha / Investor Demo Maturity Gate`, not first public availability.
- current Source 00–09 authority rules override any older routing/implementation wording; the feature-level intent below remains binding unless explicitly deferred/rejected/superseded.

### PART I — No-Code Gameplay Foundation

#### 4. Shared Gameplay Semantics — `ALPHA CORE`

All first-class gameplay systems should share RetroStage-owned typed semantics instead of creating private mini-engines.

Required foundations:

- stable gameplay identities;
- typed variables;
- typed events;
- typed actions;
- typed conditions;
- explicit state transitions;
- explicit save participation;
- creator-readable diagnostics;
- Preview / PIE / Export disposition;
- migration/version identity where persisted.

Common condition vocabulary should cover bounded cases such as:

```text
Has Item
Does Not Have Item
Story Flag
Objective State
NPC State
Enemy State
Entity State
Entered Area
Interaction Completed
Readable Read
Clue Known
Counter
Timer
Sequence Completed
Scene/Section State
```

Common actions should cover bounded cases such as:

```text
Set Story Flag
Set Variable
Start / Update / Complete / Fail Objective
Give / Remove Item
Set NPC State
Set Enemy State / Activate Enemy
Enable / Disable Entity
Lock / Unlock / Open Interaction
Play Audio
Play Sequence
Change Supported Presentation/Atmosphere State
Transition Scene
Emit Typed Event
```

**Invariant:** Dialogue, objectives, recipes, Sequence and Flow Graph must consume the same semantic registry rather than creating incompatible action languages.

---

#### 5. Profiles, Components, Recipes and Specialized Editors — `ALPHA CORE`

##### Profiles
Reusable tuning/feel definitions, for example:

- Movement Profile
- Camera Profile
- Interaction Profile
- Feedback Profile
- Enemy Profile
- Perception Profile
- Attack Profile
- Weapon Profile
- Save Experience Profile
- Screen Policy
- UI Theme / Design Tokens
- Typography Style
- Dialogue Presentation Profile
- Subtitle Profile
- Notification Profile
- UI Audio Profile

##### Components
Direct entity capabilities, for example:

- Interactable
- Health
- Dialogue Speaker
- Readable
- Objective Trigger
- Inventory Container
- Damage Receiver
- Patrol Agent
- Save Point
- Puzzle Target

##### Recipes
Validated combinations of multiple systems, for example:

- Locked Door
- Drawer
- Lever / Switch
- Pickup Item
- Readable Note
- Item-on-Target Puzzle
- Save Point
- Checkpoint
- Patrol & Investigate Enemy
- Chase
- Stealth Encounter
- NPC Conversation
- Liminal Loop / Anomaly pattern

##### Specialized Editors
Common complex authoring should use a dedicated product workflow rather than generic graphs where practical:

- Fixed Camera Composer
- Dialogue Editor
- Objective / Task Editor
- Inventory & Puzzle Workshop
- Patrol / Perception Editor
- Enemy / Encounter Editor
- Player UI Designer
- Player Experience Designer
- Sequencer
- Story & Objective Spine
- Progress & Save Director

---

### PART II — Player Control & Movement

#### 6. Protagonist / Player Profile — `ALPHA CORE`

A first-class player/protagonist definition is currently under-specified and should be made explicit.

It should own or reference:

- player identity;
- spawn/restore behavior;
- Movement Profile;
- camera/control interpretation;
- interaction profile;
- health/damage participation;
- inventory ownership;
- input action mapping;
- animation set;
- footstep/noise profile;
- optional combat capability;
- save participation.

It must not turn the player entity into one giant opaque component.

---

#### 7. Movement Feel — `ALPHA CORE`

Movement is not only `speed`.

Supported creator-facing controls should include, where relevant to the chosen profile:

- walk speed;
- run speed;
- sprint behavior;
- acceleration;
- deceleration;
- turn rate;
- strafe enable/disable;
- backward speed;
- analog response curve;
- deadzone;
- start/stop/turn weight;
- camera-relative vs character-relative movement;
- hold/toggle run;
- hold/toggle aim;
- crouch where supported;
- slope/step behavior;
- simple grounded collision response.

Recommended built-in Movement Profile directions:

```text
Modern Exploration
Heavy Exploration
Classic Tank
Modern Fixed-Camera
TPS Horror
Limited FPS Horror
Top-Down
Isometric
Custom
```

##### Optional simple jump — `ALPHA CONDITIONAL`

If creator testing proves it necessary for TPS/Limited-FPS projects, support a **simple profile-gated grounded jump**.

Do not interpret this as:

- platformer movement;
- wall running;
- parkour;
- ledge traversal framework;
- climbing simulation.

---

#### 8. Movement ↔ Animation ↔ Footstep Integration — `ALPHA CORE`

Movement should emit stable high-level states/events consumed by presentation:

```text
Idle
Walk
Run
Backward
Strafe
Turn
Start
Stop
Aim Walk
Crouch
Injured
```

Footsteps should use surface-aware cue profiles where supported.

Gameplay hearing must use explicit gameplay noise events, not raw audio-waveform analysis as hidden AI authority.

Example:

```text
Walk Footstep → Noise 0.30
Run Footstep  → Noise 0.70
Gunshot       → Noise 1.00
```

---

### PART III — Camera & View Feel

#### 9. Supported Camera Families — `ALPHA CORE`

Public Alpha should preserve the already-adopted v0 camera families:

- Fixed Camera;
- TPS / Shoulder Camera;
- Top-Down;
- Isometric;
- Limited FPS.

Camera and movement are separate profiles.

Examples:

```text
Fixed Camera + Classic Tank
Fixed Camera + Modern Camera-Relative Movement
TPS Camera + Heavy Exploration Movement
Limited FPS + No-Combat
```

No camera family should force an unrelated combat or movement architecture.

---

#### 10. Gameplay Camera Feel — `ALPHA CORE`

Creator-facing camera gameplay controls should include bounded support for:

- activation volumes;
- priority;
- cuts/blends;
- framing;
- damping/weight;
- rotation lag;
- movement lag where applicable;
- FOV changes;
- collision handling;
- recentering where relevant;
- aim camera behavior;
- sensitivity;
- fixed-camera control interpretation;
- camera transition safety.

Camera presentation effects already belonging to the visual/atmosphere alignment remain separate from gameplay semantics.

---

### PART IV — Interaction & Physical Props

#### 11. Interaction Feel — `ALPHA CORE`

Interaction should expose:

- Focus / Proximity / Crosshair targeting modes;
- range;
- focus cone;
- line-of-sight;
- deterministic priority;
- stable tie-breaks;
- prompt delay;
- prompt placement;
- Tap / Hold / Toggle / Automatic / Sequence-driven activation;
- creator-readable targeting diagnostics.

Interaction detection and gameplay result must remain separate.

---

#### 12. Physical Interaction Recipes — `ALPHA CORE`

Supported bounded physical/kinematic interaction families:

- hinged doors;
- sliding doors;
- drawers;
- levers;
- buttons/switches;
- pushable props;
- carry/drop;
- controlled impulses;
- kinematic platforms;
- limited breakables;
- inspectable props;
- trigger volumes.

Common interactions must not require generic physics programming.

##### Hiding Spot Recipe — `ALPHA SUPPORTED`

A horror-focused hiding workflow should be added explicitly:

- locker / closet / under-object style bounded hide target;
- enter/exit;
- optional peek;
- player visibility/noise state;
- enemy search interaction;
- safe exit conditions;
- camera/UI hooks;
- diagnostics.

This should not become a general cover system.

---

### PART V — Items, Inventory & Puzzles

#### 13. Item Definition & Item Runtime State — `ALPHA CORE`

Separate:

```text
Item Definition
≠
runtime possession / quantity / instance state
```

Supported initial item classes:

- Key Item
- Puzzle Item
- Consumable
- Ammo
- Weapon
- Readable / Document
- Clue / Evidence
- Utility Item
- bounded Custom Item using supported actions

Common item actions:

- Inspect
- Use
- Combine
- Equip
- Quick Slot
- Discard
- Read

Not every item supports every action.

---

#### 14. Inventory Models — `ALPHA CORE`

Support at least:

- Unlimited List;
- Fixed Slots;
- simple visual Grid over slot semantics.

Inventory behavior and inventory UI skin remain separate.

##### Spatial case inventory — `POST-ALPHA OR ALPHA CONDITIONAL`

A Resident-Evil-4-style physical footprint/grid case may be added later or admitted only if schedule and UX evidence justify it.

It is not required to prove the Public Alpha thesis.

---

#### 15. Inventory & Puzzle Workshop — `ALPHA CORE`

First-class authoring should cover:

- pickups;
- key/lock;
- item-on-target;
- consumables;
- inspect mode;
- 3D inspect rotation/zoom;
- bounded inspect hotspots;
- A + B → C combine recipes;
- multi-slot puzzle targets;
- keypad/code puzzles;
- storage containers;
- shared item box;
- ammo/weapon linkage;
- quick slots where enabled;
- critical-item protection;
- progression diagnostics.

Puzzle state must be high-level and save-safe, not raw physics-object state.

---

#### 16. Storage Box / Container — `ALPHA SUPPORTED`

Support:

- Local Container;
- Shared Storage;
- capacity policy;
- allowed item categories;
- persistence.

This is especially valuable to classic survival-horror workflows.

---

#### 17. Utility Equipment — `ALPHA SUPPORTED`

A bounded utility-item pattern should exist for common horror mechanics such as:

- flashlight;
- battery-backed light;
- story tool;
- fuse/tool-like equipment.

This is not a general equipment-stat system.

---

### PART VI — Storytelling, NPC, Dialogue & Objectives

#### 18. Story State — `ALPHA CORE`

Story progression needs a first-class typed state surface rather than scattered hidden variables.

Supported story-state types:

- Boolean flags;
- bounded numbers/counters;
- enums;
- stable references where justified.

Scopes should distinguish:

- game/global runtime;
- scene;
- NPC;
- objective;
- temporary/session.

Persistent story state participates explicitly in Runtime Save.

---

#### 19. Clue / Knowledge System — `ALPHA SUPPORTED`

Mystery storytelling benefits from separating **knowledge** from physical inventory.

Example:

```text
HasItem(BasementKey)
≠
KnowsCode(5731)
```

Clues may contain:

- stable ClueId;
- title/description;
- source;
- related character/location/objective;
- journal visibility;
- acquisition state.

Clues may unlock dialogue choices or objectives.

Do not turn this into a full detective-deduction simulator in Alpha.

---

#### 20. NPC Profile — `ALPHA CORE`

A creator should not author a general behavior tree to create a story NPC.

Supported bounded NPC configuration:

- stable NPC identity;
- speaker profile;
- role;
- stationary / wander / patrol;
- simple follow where supported;
- face/look-at player;
- default dialogue;
- animation set;
- interaction behavior;
- story-driven availability;
- persistent narrative state;
- conversation memory;
- bounded story-driven relocation.

No vendor/economy system is required.

---

#### 21. Dialogue Editor — `ALPHA CORE`

The Dialogue Editor should support:

- linear lines;
- speaker identity;
- stable text/string-table references;
- choices;
- conditions;
- actions;
- voice cue reference;
- animation/emotion cue;
- camera/presentation hook;
- auto-advance/manual advance;
- skip/interrupt policy;
- subtitle presentation;
- conversation preview;
- unreachable branch diagnostics.

Supported conversation modes:

- Gameplay
- Focused
- Cinematic
- Radio / Offscreen
- Bark

Dialogue actions consume the shared Event/Action registry.

---

#### 22. Dialogue Memory & Barks — `ALPHA SUPPORTED`

Support bounded persistent conversation memory:

- conversation never played / completed;
- selected choice where explicitly persistent;
- story-state consequences.

Barks should support:

- text/audio;
- condition;
- priority;
- cooldown;
- interruption policy.

---

#### 23. Objective / Task System — `ALPHA CORE`

Keep the canonical product concept **Objective / Task** rather than building a general RPG Quest Engine.

Required states:

```text
INACTIVE
ACTIVE
COMPLETED
FAILED
```

Visibility is separate from gameplay state.

Creator-facing support:

- main / optional / hidden;
- objective text;
- steps;
- conditions;
- progress;
- completion/failure;
- On Start / Update / Complete / Fail actions;
- persistence;
- minimal notification;
- journal-only presentation;
- optional HUD presentation.

World-marker guidance should never be mandatory.

---

#### 24. Story & Objective Spine — `ALPHA SUPPORTED`

Provide a high-level narrative structure view such as:

```text
Chapter / Section
├─ Story Beat
├─ NPC Conversation
├─ Objective
├─ Clue
├─ Sequence
└─ World Reaction
```

This is **not Flow Graph**.

- Story Spine = high-level narrative structure.
- Flow Graph = bounded conditional/orchestration logic.

---

#### 25. Narrative Recipes — `ALPHA SUPPORTED`

Useful first-party recipes:

- First Meeting
- Talk to NPC
- Give Item to NPC
- Receive Item from NPC
- Read Note → Start Objective
- Dialogue Choice → Set Story Flag
- Objective → Unlock Dialogue
- NPC Leaves / Relocates After Conversation
- Radio Message
- Environmental Reveal
- Dialogue → Chase
- Sequence → Objective
- Readable → Clue
- Clue → Dialogue Choice

---

### PART VII — Enemy, Stealth & Encounter Authoring

#### 26. Enemy Profile — `ALPHA CORE`

A reusable Enemy Profile should reference:

- behavior archetype;
- navigation agent;
- movement speeds;
- perception profile;
- attack profiles;
- health/reaction profile;
- animation set;
- audio/VFX feedback;
- activation policy;
- save/persistence policy;
- encounter tags/references.

The creator must not need a general behavior-tree IDE.

---

#### 27. Enemy State Vocabulary — `ALPHA CORE`

Bounded states may include:

```text
IDLE
PATROL
SUSPICIOUS
INVESTIGATE
ALERT
CHASE
SEARCH
ATTACK
RECOVER
STUNNED
RETURN
DEAD
```

Not every enemy must use every state.

---

#### 28. Alpha Enemy Archetypes — `ALPHA SUPPORTED`

Supported first-product archetypes:

- Roamer
- Patroller
- Watcher / Guard
- Investigator
- Chaser
- Searcher
- Ambusher
- Stalker
- Unkillable Pursuer
- Stationary Threat
- Set-Piece Enemy
- Bounded Boss

No squad tactics, formation AI or large-scale battle coordination.

---

#### 29. Perception Profile — `ALPHA CORE`

Support:

- sight distance;
- field of view;
- line-of-sight/occlusion;
- hearing;
- gameplay noise events;
- suspicion;
- progressive/instant/hybrid detection;
- memory/last-known position;
- investigate;
- search;
- return;
- bounded concealment modifiers;
- performance budgets;
- creator-readable debug visualization.

Gameplay visibility must not silently depend on renderer luminance as canonical truth.

---

#### 30. Enemy Activation & Encounter Recipes — `ALPHA SUPPORTED`

Activation sources:

- Always
- Area
- Objective State
- Story Flag
- Sequence
- Typed Event
- Manual authoring state

Recipes:

- Patrol & Investigate
- Guarded Corridor
- Dormant Ambush
- Enemy Behind Door
- Chase
- Search & Return
- Unkillable Pursuer
- Enemy After Objective
- Enemy After Pickup
- Enemy Interrupts Story Beat
- Safe Room Boundary
- Bounded Boss Encounter

---

### PART VIII — Bounded Combat

#### 31. Public Alpha Combat Types

The first product should support **multiple horror-relevant combat modes without becoming a general combat framework**.

##### `ALPHA CORE`

1. **No-Combat / Evasion**
2. **Stealth / Avoidance**
3. **Defensive Stun / Repel**
4. **Simple Melee**
5. **Classic Survival-Horror Firearms**
6. **TPS Horror Shooting**
7. **Limited FPS Horror Shooting**
8. **Enemy Melee / Lunge**
9. **Simple Enemy Projectile**
10. **Environmental Damage / Hazards**

##### `ALPHA SUPPORTED`

11. **Bounded Set-Piece / Boss Encounter** with small fixed phase count.

---

#### 32. Shared Combat Semantics — `ALPHA CORE`

Avoid separate combat engines for Fixed/TPS/FPS.

Shared semantics should cover:

- Health;
- Damage;
- Damage Source;
- bounded Damage Type;
- Hit Result;
- Hurtbox;
- Attack Profile;
- Weapon Profile;
- Ammo;
- Death;
- Reset;
- Stagger;
- Stun;
- Interrupt;
- bounded Knockback;
- hit reaction;
- invulnerability window where supported;
- feedback hooks;
- save eligibility.

Camera/input projection may differ while damage/weapon semantics remain shared.

---

#### 33. Attack Profiles — `ALPHA CORE`

Supported attack primitives:

- Contact
- Melee Arc
- Lunge
- Projectile
- bounded Hitscan Ranged
- Area / Hazard

Attack phase model:

```text
Windup
→ Active
→ Recovery
```

Creator may bind:

- animation;
- audio cue;
- VFX;
- hitbox activation;
- feedback.

This gives attacks readable telegraphing and deterministic timing.

---

#### 34. Weapon Profiles — `ALPHA CORE`

Initial firearm scope should prefer **hitscan** for reliability and debugging.

Weapon Profile supports bounded controls such as:

- damage;
- ammo type;
- magazine;
- reload;
- fire rate;
- spread/accuracy;
- recoil;
- range;
- aim mode;
- aim FOV;
- supported target assistance.

Fixed-camera aim assistance may include:

- Off
- Soft Target Preference
- Classic Snap

No competitive-shooter aim-assist framework is required.

---

#### 35. Player Health & Healing — `ALPHA CORE`

Explicitly add player-facing health/healing semantics.

Support:

- numeric health or bounded health-state presentation;
- healing consumable;
- player hit reaction;
- death;
- optional status display such as Fine / Caution / Danger;
- feedback profile;
- save participation.

Do not add RPG attribute/stat systems.

---

#### 36. Bounded Boss / Phase Encounter — `ALPHA SUPPORTED`

Support a small fixed phase model such as:

```text
Phase 1
→ condition
Phase 2
→ optional Sequence / Environment Action
Phase 3
```

A phase may change:

- attack set;
- movement;
- aggression;
- environment action;
- sequence;
- objective.

No raid-boss or general boss scripting product is required.

---

### PART IX — Save, Death, Retry & Persistence

#### 37. Core Save Principle — `ALPHA CORE`

> **RetroStage saves gameplay meaning, not engine object graphs.**

Persist high-level authored state such as:

- item possession;
- door locked/open semantic state;
- puzzle state;
- objective progress;
- story flags;
- dialogue memory;
- clues;
- NPC persistent state;
- enemy alive/dead or supported encounter state;
- checkpoint/restore anchor.

Do not serialize Babylon/Havok/AI-internal object graphs as canonical save truth.

---

#### 38. Save Experience Profiles — `ALPHA CORE`

Support:

- Checkpoint Only
- Save Points Only
- Anywhere Manual, if the chosen GameProfile supports safe save eligibility
- Hybrid
- Limited-Resource Save

Save Point Recipe may optionally consume an authored item/token.

---

#### 39. Save Slots / Continue — `ALPHA CORE`

Support:

- stable slot identity;
- multiple manual slots;
- separate autosave/checkpoint slots;
- timestamps;
- playtime;
- optional screenshot;
- location/chapter metadata;
- version;
- corruption handling;
- Continue from newest compatible valid save;
- safe delete;
- fallback to previous valid generation when explicitly supported.

---

#### 40. Transactional Runtime Save — `ALPHA CORE`

Desired semantic pipeline:

```text
Capture registered state
→ build candidate
→ validate schema
→ write temporary generation
→ validate/hash
→ promote
→ update current generation
```

Failed save must preserve the previous valid generation.

Exact physical save layout remains an implementation contract owned by the save milestone; this candidate does not freeze filenames.

---

#### 41. Save Eligibility — `ALPHA CORE`

Explicit states:

```text
ALLOWED
DEFERRED
BLOCKED
```

Examples that may block/defer saving:

- unsafe scene transition;
- unsupported Sequence moment;
- pending transactional puzzle change;
- unsupported active attack/encounter state.

Creator-facing diagnostics should explain why.

---

#### 42. Death / Retry — `ALPHA CORE`

First-class common policies:

- Reload Last Checkpoint
- Show Death Screen → Retry
- Return to Main Menu
- Custom bounded Event/Action route

No Flow Graph should be required for the basic policy.

---

### PART X — Player UI, HUD, Menu, Typography & Dialogue Presentation

#### 43. Player UI Design Language — `ALPHA CORE`

RetroStage Player UI must be a project-owned game-production system, not a fixed RetroStage skin.

The architectural model is:

```text
GAMEPLAY / STORY MEANING
        ↓
typed runtime binding
        ↓
UI screen / HUD component
        ↓
theme / typography / layout
        ↓
motion / audio / feedback
        ↓
PLAYER
```

The UI never becomes the owner of gameplay truth.

Examples:

```text
PlayerHealth = 35
≠
red progress bar

ObjectiveState = ACTIVE
≠
objective toast

InventoryEntry = BasementKey
≠
inventory slot widget
```

The first is gameplay/runtime meaning.  
The second is replaceable player presentation.

This separation is required so that two creators can use the same gameplay system while producing visibly and interactively distinct games.

##### 43.1 Core Player-UI concepts

The Public Alpha design should distinguish:

```text
Screen
HUD Layer
UI Component
Runtime Binding
Screen Policy
Screen Stack
UI Layer
UI Theme / Design Tokens
Typography Style
Dialogue Presentation Profile
Subtitle Profile
Notification Profile
UI Audio Profile
UI Motion
Accessibility Override
```

These concepts are product language. They must not be aliases for arbitrary React/DOM implementation details.

##### 43.2 UI Screen

A `Screen` is a concrete authored player-facing interface.

Representative screen families:

- Title / Main Menu
- Pause
- Inventory
- Inspect
- Journal
- Save / Load
- Settings
- Death / Retry
- Dialogue / Focused Conversation
- Readable / Document
- Credits
- bounded Custom Screen

A screen may begin from a Screen Recipe, but the recipe must not force one exported visual identity.

##### 43.3 Screen Stack — `ALPHA CORE`

Menu navigation should not require graph programming.

The runtime should understand safe operations such as:

```text
Open Screen
Close Screen
Replace Screen
Return
```

Example:

```text
Gameplay
  ↓
Pause
  ↓
Settings
  ↓
Audio Settings

Back:
Audio Settings
→ Settings
→ Pause
→ Gameplay
```

Screen navigation must preserve focus, input context and restoration semantics where supported.

##### 43.4 UI Layer Model — `ALPHA CORE`

UI composition needs explicit ordering so HUD, dialogue, menus and critical system messages do not fight each other.

A bounded layer direction may include:

```text
World UI
Gameplay HUD
Narrative / Dialogue
Menu
Modal
System / Critical
```

Exact names may change at implementation time, but the runtime must have a deterministic layer/priority model.

Examples:

- Pause hides or suspends gameplay prompts according to policy.
- A save-failure modal appears above the Pause screen.
- Subtitles remain readable without being accidentally covered by normal HUD.
- Cinematic UI can temporarily suppress gameplay HUD and restore it safely.

##### 43.5 Screen Policy — `ALPHA CORE`

A screen should explicitly declare what happens to gameplay while it is active.

Representative policy fields:

```text
Pause World
Player Movement
Player Actions
Camera Input
Gameplay HUD
Mouse Cursor
Input Context
Audio Snapshot
Save Eligibility Interaction
```

Examples:

###### Classic survival-horror inventory

```text
Pause World       Yes
Player Input      Locked
Camera Input      Locked
Gameplay HUD      Hidden
Cursor            Profile-dependent
Audio Snapshot    Inventory
```

###### Modern in-world inventory

```text
Pause World       No
Player Movement   Locked
Camera            Allowed
HUD               Dimmed
```

###### Focused dialogue

```text
Pause World       No
Movement          Locked
Camera            Dialogue Profile
HUD               Hidden/Dimmed
```

`Screen Policy` prevents UI behavior from becoming a collection of undocumented side effects.

##### 43.6 Bounded UI Component Set — `ALPHA CORE`

The first product should provide enough components to build the supported game UI without becoming a general web/app builder.

Candidate component vocabulary:

```text
Text
Bounded Rich Text
Image
Panel
Button
List
Grid
Stack
Spacer
Icon
Progress Bar / Meter
Selector
Slider
Toggle
Tab
Scroll View
Prompt
Dialogue Choice
Inventory Slot
Save Slot
```

Components may expose documented states such as:

```text
Normal
Hover
Focus
Pressed
Disabled
Selected
Unavailable
```

Do not expose arbitrary executable DOM/JavaScript components as the core authoring path.

##### 43.7 Layout, Reference Resolution & Safe Area — `ALPHA CORE`

UI authoring should support bounded responsive layout primitives:

- anchor;
- alignment;
- margin;
- padding;
- fixed size;
- percentage size;
- min/max size;
- stack direction;
- grid;
- safe-area alignment;
- aspect behavior.

A project should define a UI reference-resolution direction such as:

```text
640×480
1280×720
1920×1080
Custom supported reference
```

Retro/pixel UI should support project-safe behavior such as:

- pixel snapping where appropriate;
- nearest sampling where supported;
- integer scaling where applicable;
- predictable placement under 4:3 / 16:9 / 16:10;
- bounded ultrawide safe policy.

The editor should provide aspect previews rather than forcing creators to discover clipping only after export.

##### 43.8 Player Experience Designer — `ALPHA SUPPORTED`

A high-level editor workspace may organize the player-facing experience without becoming a new runtime authority.

Candidate structure:

```text
PLAYER EXPERIENCE

Frontend
├ Main Menu
├ Pause
├ Settings
├ Save / Load
└ Death / Continue

Gameplay HUD
├ Health
├ Ammo
├ Prompt
├ Crosshair
└ Notifications

Narrative
├ Dialogue
├ Subtitle
├ Readable
└ Journal

Gameplay Screens
├ Inventory
├ Inspect
└ Objective

Design System
├ Typography
├ Tokens
├ UI Audio
└ Motion

Accessibility
├ Text / UI Scale
├ Subtitle
├ Motion
├ Input
└ Contrast

Diagnostics
├ Layout
├ Focus
├ Text
└ Export
```

This is an editor/orchestration surface over existing UI/runtime authorities, not a second UI state model.

---

#### 44. Typography, Text Identity & Localization — `ALPHA CORE`

Typography is a first-class project design dimension, but text must remain localization-safe and diagnosable.

##### 44.1 Typography roles

At minimum, creators should be able to define coordinated roles such as:

```text
Body
Heading
Menu
HUD
Prompt
Dialogue
Subtitle
Speaker Name
Dialogue Choice
Readable Title
Readable Body
Inventory
Objective
Save Slot
Numeric HUD
```

Each role may reference a reusable Typography Style.

##### 44.2 Typography Style

Candidate properties:

- font asset;
- supported weight/style where available;
- size;
- line height;
- letter spacing;
- alignment;
- color/token reference;
- outline;
- shadow;
- wrapping;
- max lines;
- pixel snap where relevant;
- reveal/typewriter pacing where relevant;
- text-sound reference;
- fallback chain.

The implementation may use platform/browser text technology behind RetroStage contracts. RetroStage should not unnecessarily build a complete text-shaping engine from scratch.

##### 44.3 Creator font assets

Distinct project UI requires creator-controlled font assets.

Public Alpha should provide a supported font-asset path, subject to exact format, packaging, provenance and license rules owned by the asset/text milestones.

The product must preserve:

- AssetId rather than raw filesystem path;
- source/provenance metadata;
- cooked/export-safe font representation where required;
- glyph coverage diagnostics;
- fallback behavior.

A dedicated bitmap-font authoring/atlas-generation suite is **not** required for Alpha. Pixel-friendly rendering is still important.

##### 44.4 Stable TextId and string-table semantics

Visible strings must not be persistent identity.

Example:

```text
TextId:
dialogue.elena.warning_01
```

may resolve to:

```text
"You shouldn't be here."
```

The Alpha system should preserve the existing canonical direction for:

- stable text identity;
- source locale;
- locale keys;
- fallback;
- formatting arguments;
- source context;
- Unicode normalization;
- missing-key diagnostics;
- font fallback;
- missing-glyph diagnostics;
- expansion/truncation fixtures;
- CJK/RTL/Bidi readiness.

A full external translation-management platform is not required, but the shipped product must be capable of resolving supported localized player-facing text safely by the final Alpha gate.

##### 44.5 Font fallback and glyph diagnostics

A chosen visual font must not silently produce unreadable squares.

Example diagnostic:

```text
WARNING

Font "NightmarePixel" does not contain:
Ğ
ş
İ

Affected TextIds:
dialogue.elena_043
menu.settings
```

A Typography Style may define a supported fallback chain.

Exact bundled fallback fonts and their redistribution rights remain technology/release evidence, not assumptions in this candidate.

##### 44.6 Text expansion / overflow preview — `EDITOR ONLY`

The editor should provide stress states such as:

```text
100%
130%
160%
200% player text scale
Pseudo-locale expansion
CJK fixture
RTL/Bidi readiness fixture where supported
```

Creator-readable diagnostics should detect:

- clipped text;
- overflow;
- overlap;
- unsupported glyph;
- missing TextId;
- unsafe truncation;
- unusable line count;
- text outside safe area.

This helper is editor-only; the exported game carries the resulting runtime UI/text behavior, not the diagnostic editor.

---

#### 45. HUD, Prompts, Notifications & Gameplay Feedback — `ALPHA CORE`

HUD is optional and compositional. A RetroStage game may legitimately have no persistent HUD.

##### 45.1 HUD building blocks

Supported bounded HUD blocks should include:

- health;
- ammo;
- interaction prompt;
- objective notification;
- optional current-objective display;
- crosshair where required by profile;
- player status;
- quick slots where enabled;
- message/notification feed;
- bounded boss health where an encounter uses it.

No-HUD and minimal-HUD games are first-class outcomes.

##### 45.2 HUD visibility rules

Common visibility rules should be authorable without Flow Graph:

```text
Always
When Changed
When Below Threshold
When Combat Active
While Weapon Equipped
While Aiming
On Update For Duration
Only When Valid Target
Never
Supported condition
```

Example Minimal Horror HUD recipe:

```text
Health       hidden unless changed / damaged
Objective    toast + journal only
Prompt       contextual
Crosshair    only while aiming
Ammo         while aiming / reloading
```

The recipe supplies behavior and defaults, not a mandatory visual skin.

##### 45.3 Interaction Prompt

Prompt presentation should consume the interaction system rather than duplicate it.

Candidate prompt bindings:

```text
Action Label
Device Glyph
Target Name if allowed
Hold Progress
Available / Unavailable State
Reason TextId where appropriate
```

Presentation controls may include:

- HUD or world-space mode;
- icon/text ordering;
- background;
- hold bar/ring;
- distance fade;
- enter/exit motion.

Input-device changes should update the prompt through the input/glyph contract.

##### 45.4 Controller glyphs

The player should see device-aware prompts for supported input families.

The exact art, trademark/platform naming and redistribution rules for controller glyph assets must be validated before shipping; no platform-specific asset right is assumed by this candidate.

##### 45.5 Crosshair

Bounded support is sufficient:

```text
Hidden
Dot
Cross
Image
Bounded dynamic spread
```

Possible states:

```text
Normal
Aim
Valid Target
Interaction
```

This is not a competitive-shooter crosshair framework.

##### 45.6 Health presentation

The same health runtime may be presented as:

- bar;
- segments;
- numeric value;
- text state;
- icon;
- portrait state;
- hidden.

A survival-horror project may use:

```text
FINE
CAUTION
DANGER
```

without changing health semantics.

Critical state should not rely on color alone when accessibility requires an additional text/icon signal.

##### 45.7 Notification / Toast system

Common gameplay systems need a shared notification route rather than separate one-off screens.

Representative notifications:

```text
Item Acquired
Objective Updated
New Clue
Cannot Use
Door Locked
Save Complete
Save Failed
```

A Notification Profile may define:

- placement;
- duration;
- enter/exit motion;
- typography;
- sound;
- priority;
- queue policy;
- duplicate policy.

Bounded priorities may include:

```text
Critical
Important
Normal
Ambient
```

This prevents multiple gameplay systems from visually colliding.

##### 45.8 UI Design Tokens

Project-level UI tokens should cover at least:

- primary/secondary text;
- accent;
- danger;
- panel background;
- panel border;
- spacing;
- border width;
- corner treatment where applicable;
- focus;
- hover;
- disabled;
- motion defaults.

`UI Theme / Design Tokens` are not the same concept as the world `Presentation Profile`.

They may coordinate by default, but creator overrides win.

##### 45.9 UI Motion & Reduced Motion

Bounded UI motion primitives may include:

```text
Fade
Slide
Scale
Pulse
Typewriter
Bounded Wipe
```

Each relevant motion should define a reduced-motion fallback, for example:

```text
Slide + Scale
→ Reduced Motion
Fade
```

The product should not force accessibility users to accept motion purely because it is part of the creator's default style.

##### 45.10 UI Audio Profile

UI identity includes sound.

A reusable profile may bind:

```text
Navigate
Confirm
Cancel
Error
Open
Close
Tab
```

to project audio cues.

UI audio consumes the approved audio runtime; it does not create a separate sound authority.

---

#### 46. Frontend, Menus, Inventory UI, Dialogue Presentation & Readables — `ALPHA CORE`

##### 46.1 Public Alpha player screens

The exported game should be able to author:

- Title / Main Menu;
- New Game;
- Continue;
- Load;
- Pause;
- Inventory;
- Inspect;
- Dialogue / Subtitle;
- Objective / Journal;
- Save / Load;
- Settings;
- Death / Retry;
- Credits;
- Quit / Return.

A bounded Custom Screen may be supported when it uses the same typed components/bindings and does not introduce arbitrary executable code.

##### 46.2 Main Menu / Game Frontend

Common actions:

```text
Continue
New Game
Load Game
Settings
Credits
Quit
```

The creator should not implement save scanning or application-exit logic through generic graphs.

Background presentation may use supported:

- static image;
- live rendered scene;
- authored camera scene;
- video only if the Media/Video capability is separately admitted.

##### 46.3 New Game flow

Common no-code flow:

```text
New Game
→ optional confirmation
→ optional bounded difficulty/profile selection
→ initialize supported runtime state
→ load start scene
```

Basic frontend flow should not require Flow Graph.

##### 46.4 Continue

`Continue` binds to the Runtime Save subsystem:

```text
newest compatible valid save
```

The UI does not independently discover, parse or rank save files.

##### 46.5 Pause Menu

Representative actions:

```text
Resume
Inventory
Journal
Save [when policy allows]
Load
Settings
Return to Main Menu
Quit
```

Creators choose which actions are present.

##### 46.6 Runtime Settings screen

Projects should bind UI controls to shared typed settings rather than reinvent settings logic.

Representative groups:

```text
Display
Audio
Input
Subtitles
Accessibility
Gameplay-supported options
```

Typical settings:

- master/music/SFX/voice volume;
- resolution/window/display policy where supported;
- VSync/presentation quality where supported;
- mouse/controller sensitivity;
- control rebinding;
- subtitles;
- subtitle size;
- UI/text scale;
- reduced motion;
- camera shake;
- hold/toggle alternatives.

##### 46.7 Confirmation & System Message Modal

First-class modal primitives should support:

```text
Confirm
Cancel
Optional third action
```

and player-facing system/error messaging.

Example:

```text
Save failed.
Your previous save was not changed.
```

Critical failures must not be silent.

##### 46.8 Inventory UI

Inventory UI consumes inventory semantics:

```text
Inventory Entries
→ List / Grid
→ Item Slot
```

A slot may bind:

- icon;
- display name;
- quantity;
- selection;
- equipped state;
- supported status markers.

Available context actions come from the Item Definition/runtime:

```text
USE
EXAMINE
COMBINE
EQUIP
DISCARD
```

The UI does not reimplement item rules.

##### 46.9 Inspect UI

A bounded inspect screen may combine:

- 3D item viewport;
- name;
- description;
- rotation/zoom controls;
- hotspot prompts;
- accessible text.

The inspect screen is a specialized player-UI recipe over the item/inspect runtime.

##### 46.10 Save / Load UI

Save-slot UI binds to Runtime Save metadata such as:

```text
SlotId
Location / Section
Playtime
Timestamp
Optional Thumbnail
Compatibility / Corruption Status
```

Possible visual recipes:

- Minimal List
- Typewriter
- Memory-Card-inspired
- Photo/Record style

The runtime state remains the same.

##### 46.11 Journal UI

A project may expose selected sections such as:

```text
Objectives
Documents
Clues
Characters
```

All sections are optional.

The journal consumes Story/Objective/Clue data; it does not become a second narrative database.

##### 46.12 Simple static authored map / floor plan — `ALPHA CONDITIONAL`

A bounded static map/floorplan screen may be admitted if creator demand and UI schedule justify it.

This does not authorize:

- GPS;
- dynamic open-world minimap;
- navigation path rendering;
- fast travel;
- world-scale discovery simulation.

##### 46.13 Dialogue Presentation Profile — `ALPHA CORE`

Dialogue content and dialogue appearance are separate.

The same dialogue graph/content should be displayable through supported modes such as:

```text
Classic Text Box
Portrait Box
Cinematic Subtitle
Minimal Subtitle
Focused Conversation
Radio / Offscreen
Bark
Custom UI-backed bounded presentation
```

A Dialogue Presentation Profile may control:

- panel treatment;
- speaker-name presentation;
- portrait region;
- text area;
- choice area;
- advance indicator;
- typography roles;
- text reveal behavior;
- UI audio;
- screen policy;
- HUD interaction.

##### 46.14 Dialogue portraits — `ALPHA SUPPORTED`

Speaker Profiles may reference bounded portrait variants such as:

```text
Neutral
Angry
Afraid
Injured
```

A dialogue beat may select an authored emotion/portrait variant.

This is a low-cost narrative presentation capability and does not imply a full facial-animation system.

##### 46.15 Dialogue choice presentation

Alpha needs a readable list-based choice model.

States may include:

```text
Normal
Focused
Selected
Unavailable
Hidden
```

Whether a choice exists or is available belongs to dialogue/story semantics.  
How that state looks belongs to presentation.

A general radial-dialogue framework is not required for Alpha.

##### 46.16 Dialogue pacing

Bounded controls may include:

```text
Reveal:
  Instant
  Typewriter

Characters Per Second
Punctuation Pause
Auto Advance:
  Manual
  Voice End
  Timed
```

A text-blip cue may be used for retro presentation.

Player accessibility should be able to bypass forced slow text through supported instant/fast-text options.

##### 46.17 Dialogue skip / advance semantics

A reliable default policy should distinguish:

```text
First advance input:
  complete current text reveal

Next advance input:
  advance line
```

Voice handling should have explicit interruption policy.

The product must avoid ambiguous cases where one input both skips unread text and closes the conversation unexpectedly.

##### 46.18 Dialogue history — `ALPHA SUPPORTED`

A bounded optional history/log may show recent spoken lines for narrative/mystery projects.

It should use the same TextId/speaker data and must not become a second dialogue-state authority.

##### 46.19 Subtitle Profile — `ALPHA CORE`

Subtitles are not limited to interactive dialogue.

They may present:

- dialogue;
- bark;
- radio/offscreen speech;
- cinematic voice;
- narration;
- important off-screen speech.

Creator defaults should include bounded:

- position;
- width;
- typography;
- speaker name;
- background;
- outline;
- max lines;
- timing/fade.

##### 46.20 Player subtitle/accessibility override

Creator styling is the default, but player readability options may override it where accessibility requires.

Example:

```text
Creator subtitle size: Small
Player setting: Large
→ Runtime uses supported Large size
```

Supported player overrides should include, where relevant:

- subtitle size;
- subtitle background/opacity;
- speaker names;
- UI/text scale.

**Principle:**

> Creator style is the default; player readability settings may override presentation where accessibility requires it.

##### 46.21 Non-speech audio captions — `ALPHA SUPPORTED`

Audio cues may optionally reference localized caption TextIds:

```text
[door slams]
[distant scream]
[phone ringing]
```

This is especially valuable for accessibility, but is not mandatory for every sound.

##### 46.22 Readable presentation

Readables may use supported modes such as:

```text
Fullscreen Document
Paper Overlay
Inspect + Text
Simple Text Panel
Multi-page
```

Controls:

- next/previous page;
- close;
- supported zoom;
- accessible text mode.

If a readable relies on an image of handwritten/graphical text, the creator should be able to provide an accessible text transcript.

##### 46.23 Focus & navigation behavior

Mouse, keyboard and controller should operate the same screen model.

Each screen needs:

- default focus;
- deterministic navigation;
- Back action;
- focus states;
- disabled-state behavior.

Auto-generated navigation may be offered, but creator validation must detect unreachable or trapped controls.

##### 46.24 UI / dialogue interruption & restoration

Narrative presentation must define what happens when gameplay interrupts it.

Candidate interruption policies:

```text
Uninterruptible
Interrupt On Danger
Interrupt On Damage
Manual Cancel
Sequence Controlled
```

UI restoration must be deterministic:

- HUD returns when appropriate;
- input context restores;
- camera policy restores;
- dialogue/subtitle surfaces close or resume according to contract.

##### 46.25 Sequencer UI integration

RSM-106 already assigns UI and dialogue/subtitle tracks to the native Sequencer direction.

Candidate bounded sequence actions may include:

```text
Show / Hide Gameplay HUD
Show / Hide Screen
Show Text / Subtitle
Set temporary UI state
Fade UI
Cinematic Bars
Restore prior UI state
```

Cinematic bars are a UI overlay and should not be confused with output aspect-ratio letterboxing.

##### 46.26 World-space / diegetic UI — `ALPHA SUPPORTED`

Bounded support may include:

- world-space interaction prompt;
- in-world computer/terminal screen where supported;
- item inspect interface;
- diegetic status presentation where authored.

Do not interpret this as authorization for a full 3D/VR UI framework or arbitrary in-world browser surface.

##### 46.27 UI Recipes — `ALPHA SUPPORTED`

Useful first-party recipes:

```text
Minimal Horror HUD
Classic Survival-Horror Inventory
Modern Item Grid
Classic Text-Box Dialogue
Cinematic Subtitles
PS1-Inspired Pause Menu
Minimal Save Slots
Readable Document
Objective Toast
Controller Prompt
```

Recipes provide behavior/layout starting points.

**Identity rule:** two creators using the same recipe should be able to produce visibly distinct games by changing typography, tokens, panels, icons, spacing, motion, audio and layout without code.

##### 46.28 UI Readability / Navigation Diagnostics — `ALPHA CORE`

Creator-readable diagnostics should cover at least:

```text
Text clipped
Text overflow
Missing TextId
Missing glyph
Low critical-text contrast
Control outside safe area
Focus unreachable
Focus trap
No Back action
Controller glyph missing
Subtitle exceeds safe width
HUD / subtitle collision
Prompt hidden by higher layer
Unsupported binding
Invalid screen policy
Missing runtime setting binding
```

Warnings should be actionable and must not become an aesthetic police system.

Accessibility-critical failures can block readiness where the governing milestone requires it.

##### 46.29 UI asset / runtime boundary

UI assets such as:

- icons;
- portraits;
- panel textures;
- cursors;
- fonts;
- backgrounds;
- UI sprites

must use the normal AssetId/source/cooked ownership rules.

No canonical UI document should depend on raw absolute filesystem paths.

##### 46.30 UI transient state vs persistent state

Do not confuse:

```text
gameplay state
player settings
runtime save state
transient UI state
```

Examples normally **not** part of gameplay save truth:

```text
hovered button
current mouse position
half-revealed text
open editor inspector
temporary focus highlight
```

Player preferences such as:

- volume;
- input bindings;
- subtitle size;
- UI/text scale;
- accessibility options

belong to the player-data/settings persistence domain, not Project Save.

##### 46.31 Public Alpha UI acceptance

A representative exported project should prove:

```text
Title
→ New Game / Continue
→ Gameplay HUD
→ Interaction Prompt
→ Dialogue + Choices
→ Subtitle
→ Inventory + Inspect
→ Objective / Journal
→ Save / Load
→ Settings
→ Pause
→ Death / Retry
→ Credits / Quit
```

with:

- controller navigation;
- device-aware prompts;
- localization-safe text identity;
- font fallback/glyph diagnostics;
- UI scale/subtitle override;
- safe-area/aspect validation;
- clean exported-player behavior.

### PART XI — Input, Controller & Accessibility

#### 47. Controller Feel & UI Navigation — `ALPHA CORE`

Support:

- keyboard/mouse;
- gamepad;
- rebinding;
- binding conflicts;
- reset defaults;
- device detection;
- context-aware input;
- controller-aware prompts;
- analog deadzones;
- response curves where owned by Movement/Input profiles;
- UI navigation;
- rumble/haptics where supported;
- persisted player preferences.

The same player screen should normally serve mouse, keyboard and controller rather than requiring separate duplicated screens.

##### 47.1 Focus navigation

A screen should have:

```text
Default Focus
Up
Down
Left
Right
Confirm
Cancel / Back
```

semantics.

Auto-navigation may be supported, but creator validation must detect:

- unreachable control;
- focus trap;
- invalid Back path;
- hidden control still receiving focus;
- controller-only dead end.

##### 47.2 Device glyph switching

Interaction and UI prompts should consume the active-device contract.

The exact shipped glyph assets remain subject to platform/trademark/license review.

---

#### 48. Accessibility & Player Overrides — `ALPHA CORE`

Public Alpha should provide representative player-facing options including:

- subtitles;
- subtitle size;
- subtitle background where supported;
- speaker-name option;
- UI/text scale;
- font fallback;
- contrast support;
- color-independent critical feedback;
- reduced motion;
- camera-shake reduction/disable;
- hold/toggle alternatives;
- input rebinding;
- controller navigation;
- mouse/controller sensitivity;
- audio caption support where authored;
- audio/dynamic-range direction where supported;
- display settings needed by the supported player.

Accessibility is an exported-game capability, not only an editor preference.

##### 48.1 Creator default vs player override

The creator defines the game's intended presentation.

The player may override bounded readability/comfort settings when accessibility requires it.

Examples:

```text
creator subtitle size
→ player larger subtitle size

creator slide animation
→ reduced-motion fade

creator hold interaction
→ supported toggle alternative
```

##### 48.2 Accessibility preview — `EDITOR ONLY`

Useful editor preview modes may include:

```text
Large Text
Maximum Supported UI Scale
Reduced Motion
High-Contrast Stress
Controller Only
Subtitle Background On
Pseudo-localized Text
```

These are authoring aids and do not become separate runtime game systems.

##### 48.3 Readable accessibility

Where story information is conveyed through stylized document art, a creator should be able to provide accessible text backing/transcript so the game does not rely exclusively on an unreadable image.

##### 48.4 Accessibility diagnostics

Creator-readable diagnostics should detect representative risks such as:

- critical text below supported size policy;
- missing subtitle text;
- missing glyph;
- text clipping at supported scale;
- focus unreachable by controller;
- color-only critical state;
- motion with no reduced-motion fallback where required;
- hold action with no allowed alternative when the chosen accessibility policy requires one.

### PART XII — Feedback Language

#### 49. Feedback Profile — `ALPHA CORE`

Gameplay feel should be coordinated across:

```text
Animation
Audio
VFX
UI
Camera
Haptic
Time response
```

Typical feedback events:

- interaction accepted;
- interaction rejected;
- pickup;
- objective updated;
- player hit;
- enemy hit;
- weapon fire;
- reload;
- door locked;
- puzzle success;
- save complete;
- damage/death.

A profile supplies defaults; per-action creator overrides remain available.

---

#### 50. Horror Friction Principle — `ALPHA CORE`

> **Deliberate friction must be authored, predictable, readable and reversible. Accidental friction is a usability defect.**

Acceptable deliberate friction may include:

- heavy turning;
- slower door interaction;
- constrained inventory;
- manual aiming;
- limited sprint;
- deliberate animation recovery.

Not acceptable as "horror feel":

- ignored input;
- unexplained lag;
- inconsistent targeting;
- camera fighting the player;
- hidden interaction rules.

---

### PART XIII — Sequencing, Cinematics & Media

#### 51. Native Sequencer — `ALPHA CORE`

Support the already-approved native sequence families:

- camera;
- transform;
- animation;
- audio;
- dialogue/subtitle;
- VFX;
- lighting;
- material/post-process;
- UI;
- scene visibility;
- Event/Action.

Also require:

- preview/scrub;
- interruption policy;
- skip policy;
- state restoration;
- safe gameplay handoff;
- diagnostics.

---

#### 52. Video / FMV Media Track — `ALPHA CONDITIONAL`

A bounded video/media track is a useful PS1/PS2-era and horror workflow, but it is not currently an explicit canonical Sequencer track.

Candidate capability:

- video asset reference;
- fullscreen / fit / fill / custom rect;
- audio volume;
- start/end;
- skippable;
- fade in/out;
- input lock;
- pause gameplay;
- restore gameplay;
- On Finished action;
- scene transition hook.

**Admission rule:** The capability may be accepted as Public Alpha scope only after exact codec/container/backend, redistribution, Electron packaging, hardware-decoding/fallback, security and license review in the technology contract.

RetroStage should support **playback and sequencing**, not become a video editor/NLE.

---

#### 53. Scene Transition / Loading Experience — `ALPHA CORE`

This is a currently under-specified player-experience area and should become explicit.

Support:

- validated destination;
- fade out/in;
- transition audio;
- optional loading presentation;
- input lock;
- restore point;
- optional Sequence;
- optional conditional video/FMV;
- failure diagnostics.

Example:

```text
Door Interaction
→ Fade Out
→ checkpoint if policy allows
→ Play FMV (conditional)
→ Load Scene
→ Restore Player
→ Fade In
```

---

### PART XIV — Gameplay Diagnostics & Creator Trust

#### 54. Gameplay Diagnostics — `ALPHA CORE`

Creator-readable diagnostics must cover at least:

- interaction targeting;
- missing/invalid prompts;
- objectives;
- inventory progression;
- puzzle references;
- narrative branches;
- NPC dialogue selection reason;
- navigation;
- enemy state;
- perception;
- combat/damage;
- animation marker issues;
- runtime save eligibility;
- missing restore anchors;
- scene transitions;
- sequence interruption/restore;
- UI/text/localization risks;
- screen-stack / restoration errors;
- focus/navigation traps;
- safe-area/aspect/layout overflow;
- missing glyphs / invalid font fallback;
- subtitle/HUD collisions;
- unsupported accessibility override paths;
- runtime-binding errors;
- export capability parity.

Raw engine logs are supplemental, not the primary product experience.

---

#### 55. Narrative Trace — `ALPHA SUPPORTED`

Example:

```text
Player acquired Photo
StoryFlag FoundPhoto = true
NPC Elena selected Dialogue Elena_Photo
Reason: FoundPhoto == true
Dialogue completed
Objective FindDoctor started
```

---

#### 56. AI / Perception Trace — `ALPHA CORE`

Example:

```text
Enemy did not detect player
Sight: PASS
Distance: PASS
Line of Sight: BLOCKED
Occluder: Door_03
```

or:

```text
Noise: PlayerFootstep
Intensity: 0.42
Threshold: 0.31
Result: INVESTIGATE
```

---

#### 57. Save Trace — `ALPHA CORE`

Show creator-readable:

- save request;
- eligibility;
- captured systems;
- generation;
- validation;
- promotion;
- restore;
- migration/fallback reason.

---

### PART XV — Export / Runtime Parity

#### 58. Export Disposition — `ALPHA CORE`

Every creator-facing gameplay capability must declare one of:

```text
RUNTIME
COOKED
HYBRID
EDITOR_ONLY
```

Examples:

| Capability | Disposition |
|---|---|
| Movement Profile | RUNTIME |
| Dialogue runtime | RUNTIME |
| Dialogue Editor | EDITOR_ONLY |
| Objective runtime | RUNTIME |
| Story flags | RUNTIME + SAVE |
| Inventory runtime | RUNTIME + SAVE |
| Enemy AI / perception | RUNTIME |
| Navmesh/bake | COOKED + RUNTIME |
| Weapon/Attack profiles | RUNTIME |
| Save system | RUNTIME |
| Sequencer | RUNTIME |
| Sequence editor | EDITOR_ONLY |
| UI runtime | RUNTIME |
| UI editor | EDITOR_ONLY |
| Gameplay diagnostics UI | EDITOR_ONLY / dev instrumentation |
| Recipe editor | EDITOR_ONLY |
| Recipe-produced gameplay data | RUNTIME / HYBRID |
| Video playback | RUNTIME + COOKED, if admitted |

A feature working only in Preview is not complete.

---

#### 59. Required Product Chain

Relevant non-editor-only capabilities should prove:

```text
AUTHOR
  ↓
PREVIEW where applicable
  ↓
PIE
  ↓
COOK
  ↓
EXPORT
  ↓
CLEAN SUPPORTED MACHINE
```

Supported quality/fallback changes may lower fidelity.

They must not silently erase gameplay or narrative meaning.

---

### PART XVII — Public Alpha Proof Projects / Acceptance Scenarios

#### 60. Required Representative Gameplay Proof

At least one coherent exported project should demonstrate the cross-system chain.

Suggested proof:

```text
Launch exported player
→ Title / Main Menu
→ verify controller focus + device prompt
→ open Settings
→ change subtitle/UI accessibility option
→ New Game
→ Move / Run / Crouch where profile supports
→ Fixed Camera section
→ contextual Interaction Prompt
→ Interact with Readable
→ accessible text / readable presentation works
→ Learn Clue
→ Talk to NPC
→ Dialogue Presentation + subtitle works
→ Dialogue branch changes because of Clue
→ Objective starts
→ objective notification / journal updates
→ Pick up Key
→ inventory UI updates
→ Inspect Item
→ Unlock Door
→ Enemy activates
→ Perception / Chase works
→ Player evades or uses bounded combat
→ HUD/feedback reacts correctly
→ Puzzle item acquired
→ Puzzle completed
→ Objective updates
→ Sequence plays
→ cinematic UI hides/restores safely
→ Save / checkpoint
→ Save/Load UI shows valid metadata
→ Exit application
→ Relaunch exported player
→ Continue / Load
→ runtime state restores
→ settings/accessibility preference persists
→ final transition / exit
```

The project should include real project-specific UI, typography, audio, presentation and gameplay feedback rather than generic debug UI.

---

#### 61. Minimum Alpha Gameplay Genres Proved by Composition

The Public Alpha does not need a separate engine architecture for each game type.

The same bounded systems should be able to compose at least:

##### Fixed-camera survival horror
```text
Fixed Camera
+ Tank or Modern Fixed movement
+ doors/keys
+ inventory/puzzle
+ NPC/dialogue
+ limited handgun or no-combat
+ save point
```

##### Modern chase horror
```text
TPS or Limited FPS
+ no-combat
+ stalker / unkillable pursuer
+ hiding
+ objectives
+ sequence
```

##### Mystery / narrative horror
```text
exploration
+ dialogue
+ readables
+ clues
+ objectives
+ Story Spine
+ light puzzle
```

##### Liminal / anomaly horror
```text
limited FPS or fixed camera
+ looping section
+ anomaly state
+ objective/observation logic
+ atmosphere
+ no-combat or pursuer
```

##### Action-horror-lite
```text
TPS or Limited FPS
+ hitscan weapon
+ bounded enemies
+ ammo
+ inventory
+ checkpoint
```

---

# Gate D — First Playable Creator

## RSM-37 — Event / Action Contract Registry
**Purpose:** Create the common typed language used by gameplay, UI, audio, VFX, camera, sequencing, and no-code systems.  
**Third-party placement:** RetroStage-owned registry and schemas.  
**Key deliverables:**
- Define event/action identity, parameters, context, result, and failure behavior.
- Define capability and export support metadata.
- Create validation and creator descriptors.
- Prevent subsystem-specific string conventions from becoming hidden contracts.
**V2 Event/Action safety additions:**
- Add stable causal identity and effect repeatability semantics.
- One-shot/once-per-scope effects use semantic commit/idempotency keys and explicit reset/save scope where applicable; repeated delivery does not automatically repeat the committed effect.
- Bound causal-chain depth/event/work budgets so individually legal Event/Action cycles fail in a diagnosable deterministic way instead of running forever.

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
**V2 Scene/Section lifecycle additions:**
- Make Scene/Section transitions transactional (`requested → preparing → validated/prepared → committing → active → deactivating → unloaded`) with explicit cancellation/failure behavior.
- Separate semantic residency from resource residency and define transition/quiescence points safe for save/restore.
- Coordinate navigation, runtime entities, scheduled work, async generation leases, audio, camera, objectives and presentation without making renderer visibility state the lifecycle authority.

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
**V2 camera/input arbitration additions:**
- Define one explicit camera-ownership/arbitration contract across gameplay, sequence, Scene/Section, UI, and temporary overrides; hidden competing flags are forbidden.
- Keep input ownership/capture lifecycle explicit when camera authority changes.

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
- Define string tables, stable string identity, source locale, locale keys, fallback, formatting arguments, and source context.
- Define a Unicode normalization policy and deterministic diagnostics for incompatible or malformed text.
- Define grapheme-cluster-aware fixtures covering combining marks and emoji.
- Define representative CJK strings and CJK line-breaking direction.
- Define long German/French expansion fixtures.
- Define font fallback and missing-glyph diagnostics direction.
- Define IME-safe input contract direction and RTL/Bidi readiness direction.
- Define pseudo-localization fixtures and overflow/truncation diagnostics direction.
- Prevent display text from becoming persistent reference identity.
- Create missing-key diagnostics.
- Prepare later subtitle, UI, and accessibility integration.
- Keep full player/editor UI localization behavior in later owners such as RSM-87 and RSM-119.
**Exit:** Narrative and UI text can be replaced by locale without changing persistent gameplay references, and deterministic localization fixtures diagnose normalization, grapheme, glyph, expansion, directionality, and layout risks for later UI/runtime consumers.

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
**V2 deterministic-variation addition:**
- Route controlled authored variation through RetroStage-owned domain-separated RNG/seed semantics rather than ambient `Math.random()` or renderer randomness; backend algorithm changes that alter golden/saved meaning are compatibility-sensitive.

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
**V2 traversal/navigation additions:**
- Define shared typed traversal metrics reused by blockout/collision/navigation/AI/diagnostics.
- Keep door/passability/gameplay truth in canonical/runtime gameplay semantics; navigation receives a derived traversability/topology projection and never becomes passability authority.
- Apply generation-lease acceptance/cancellation and the worker mutation barrier to asynchronous navigation bakes.

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
**V2 residency/lifetime additions:**
- Separate semantic residency from resource residency and tie Scene/Section generation, async leases, runtime entities, audio, navigation and scheduled work to the lifecycle.
- Require stale owner-scoped work to be cancelled/rejected and teardown to reach a defined quiescent state before unload is complete.

**Exit:** A small multi-section project transitions predictably without leaking resources or runtime entities.

## RSM-64 — Looping Space / Section Substitution / Impossible Transition Runtime
**Purpose:** Implement the constrained liminal runtime defined earlier.  
**Third-party placement:** RetroStage scene director and section systems.  
**Key deliverables:**
- Support conditional exits, return-path mutation, section substitution, continuity teleport, and anomaly outcomes.
- Maintain explicit state, references, and reset policy.
- Integrate camera, audio, lighting, objectives, and save direction.
- Provide trace and debug visualization.
**V2 transition consistency additions:**
- Carry transition generation identity, save-safe boundaries, deterministic RNG participation and dynamic navigation projection through looping/substitution/teleport behavior.
- Navigation topology is derived from gameplay truth; it does not own whether a route/door is semantically open.

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
**V2 focus/device lifecycle additions:**
- Define focus loss/regain, device disconnect/reconnect/switching, pointer-lock/capture loss, held-action release and pause-policy behavior.
- Keep physical device/focus state transient and separate from canonical input/gameplay configuration.

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

## Cross-Milestone Presentation / Visual Character / Atmosphere Alignment

RetroStage presentation is a coordinated authored system, not a mandatory filter stack.

**Canonical vocabulary/direction:**
- `PresentationProfile` is the single canonical game-presentation authority.
- `Visual Rawness` is an authorable dimension of that profile/presentation model, not a separate competing profile authority.
- Geometry Character, Texture Character, Material Character, Raster Character, and Temporal Character describe bounded, reversible/non-destructive presentation intent where applicable.
- `AtmosphereVolume` is canonical spatial presentation intent; `AtmosphereDirector` coordinates typed atmosphere changes over existing scene/event/sequence semantics.
- Babylon materials/lights/fog/post-processes/VFX resources remain derived runtime projection, never canonical presentation truth.
- Creator-authored presentation defaults are distinct from player quality/accessibility/comfort overrides and from editor-local Studio Identity preferences.
- Deterministic variation that affects authored meaning or QA must be reproducible.
- Presentation capabilities require explicit `RUNTIME`, `COOKED`, `HYBRID`, or `EDITOR_ONLY` disposition and export parity.

**Existing milestone ownership map:**

| Presentation responsibility | Primary roadmap owners |
|---|---|
| Typed actions, scene flow, camera composition | RSM-37, RSM-39, RSM-42 |
| Lighting, atmosphere volumes/director, exposure/fog/sky direction | RSM-43 |
| Presentation profiles / Visual Rawness / render architecture | RSM-44, RSM-83, RSM-89 |
| Atmosphere audio and preview/PIE integration | RSM-45, RSM-79, RSM-88 |
| Blockout, repetition, surface storytelling | RSM-56–58, RSM-86 |
| Source/cooked geometry, texture, material and reimport semantics | RSM-75–78, RSM-83 |
| Animation/VFX presentation | RSM-84–86, RSM-89 |
| Hardware/quality/fallback/output compatibility | RSM-90, RSM-92, RSM-97, RSM-101, RSM-103 |
| Preset/content-pack lifecycle | RSM-108–110 |
| Golden regression, reproducibility and migration | RSM-112–116 |
| Accessibility/comfort validation | RSM-119 |
| Cook/export/package parity | RSM-94–103 |

This alignment does not admit new rendering/media dependencies and does not authorize implementation before the owning milestone.

## Feature-Level Visual Character / Rawness / Atmosphere / Export-Parity Completeness Annex

**Status:** `BINDING ROADMAP DETAIL / REBASED TO CURRENT AUTHORITY MODEL`

This annex preserves the reviewed creator-facing visual capability inventory at feature level. Generic camera/lighting/material/post-processing subsystem presence is not sufficient closure.

Normalization rules:
- `PresentationProfile` remains the single canonical game-presentation authority; Visual Rawness is a coordinated dimension, not a second profile document.
- creator defaults, player quality/accessibility overrides and editor-local Studio Identity remain separate authorities.
- Babylon/render/audio/VFX objects are derived projection only.
- official export disposition remains `EDITOR_ONLY / COOKED / RUNTIME / HYBRID`.
- dependency/tool references are candidates only unless Source 06 separately admits them.
- the feature-level intent below is binding; old proposal/promotion wording is not implementation authority.

### PART A — GLOBAL PRODUCT AND PRESENTATION MODEL

#### 4. New Product Vocabulary

The following terms should become explicit RetroStage product vocabulary where their owning source permits it.

##### 4.1 Presentation Profile

A coordinated set of project presentation defaults. A profile may configure several visual and acoustic dimensions together, but every supported creator-facing parameter remains independently overrideable.

A Presentation Profile is **not** a mandatory house style.

Candidate example profiles:

- `Brutalist PSX Raw`
- `PS1 Constraint`
- `Clean PS1`
- `Early PS2 Atmospheric`
- `Low-Poly Cinematic`
- `Pixel Resolution Hybrid`
- `Sprite-3D Hybrid`
- `Custom`

Profile names are product-facing examples, not historical-hardware accuracy claims.

##### 4.2 Visual Rawness

`Visual Rawness` describes intentional control over visual information density, precision, smoothness, sampling cleanliness, shading cleanliness, visibility, and temporal cadence.

It is not a generic graphics-quality slider.

Canonical dimensions:

```text
Visual Rawness
├─ Geometry Rawness
├─ Texture Rawness
├─ Material Rawness
├─ Lighting Rawness
├─ Raster / Output Rawness
└─ Temporal Rawness
```

Rawness must be:

- explicit;
- authorable;
- bounded;
- reversible where the workflow is non-destructive;
- diagnosable;
- profile-aware;
- creator-controlled.

Rawness must not mean accidental corruption, random broken rendering, or mandatory degradation.

##### 4.3 Geometry Character

The creator-facing character of mesh density, precision, normals, hard-edge treatment, generated LODs, and safely supported de-polish behavior.

##### 4.4 Texture Character

The creator-facing character of texture resolution, filtering, mip behavior, anisotropy, palette, posterization, dithering, and atlas/sprite sampling.

##### 4.5 Material Character / Material De-Polish

A constrained authoring layer that can reduce modern PBR cleanliness without requiring raw shader programming. Typical dimensions include specular response, reflection response, normal-detail influence, roughness complexity, vertex color influence, transparency character, and supported retro lighting models.

##### 4.6 Raster Character

The creator-facing character of internal resolution, upscale policy, anti-aliasing, aspect ratio, integer scaling, output color precision, dithering, and bounded PSX-inspired raster/UV/vertex precision behavior.

##### 4.7 Temporal Character

The creator-facing cadence of animation, sprite/flipbook playback, and VFX. It permits continuous or intentionally stepped/sample-and-hold presentation without requiring the runtime render loop itself to run at that cadence.

##### 4.8 Atmosphere Volume

A canonical RetroStage-authored spatial volume that blends a bounded set of atmosphere/presentation/audio parameters when the relevant runtime listener or player enters or approaches it.

Possible controlled domains include:

- fog;
- exposure;
- color/LUT influence;
- lighting influence;
- supported presentation overrides;
- VFX density or state;
- audio snapshot reference;
- reverb/acoustic state;
- blend distance/time.

An Atmosphere Volume is not Babylon-only state.

##### 4.9 Atmosphere Director

A creator-facing orchestration workflow that coordinates existing RetroStage-owned systems across image, space, motion, camera, and sound.

It is **not** a one-click “Make Horror” effect and must not hide or replace the underlying authoring dimensions.

Conceptual grouping:

```text
Atmosphere Director

VISUAL
├─ Geometry Character
├─ Texture Character
├─ Material Character
├─ Raster Character
└─ Temporal Character

SPACE
├─ Lighting
├─ Fog
├─ Atmosphere Volumes
├─ Sky / Backdrop
├─ Surface Dressing
└─ Set Dressing

MOTION
├─ Ambient Motion
├─ Environmental FX
└─ VFX

CAMERA
├─ Composition
├─ Weight
├─ Framing
└─ Controlled Imperfection

AUDIO
├─ Room Tone
├─ Reverb / Occlusion
├─ Tension
├─ Silence
└─ Adaptive Layers
```

##### 4.10 Surface Dressing / Surface Storytelling

Creator-facing use of decals/cards/approved surface layers to add leaks, rust, dirt, cracks, posters, wet patches, soot, blood/organic marks, and custom decals without requiring a unique mesh and unique high-resolution texture for every environmental variation.

##### 4.11 Ambient Motion

A lightweight deterministic or authorable motion system for environment objects and presentation elements, such as oscillation, rotation, sway, pulse, flicker, or bounded curve-driven motion.

It is not a general physics or cloth simulation system.

##### 4.12 Environmental FX Recipe

A bounded authoring recipe for atmospheric effects such as rain, snow, ash, dust, drips, steam, embers, mist, or light falling debris. A recipe may coordinate particles, cards, screen layers, sound, and wind direction but must not become a global climate/weather simulator.

##### 4.13 Atmosphere Analysis

Editor-only diagnostic views that help creators understand why a scene does or does not read atmospherically.

Candidate views include:

- Contrast;
- Luminance;
- Silhouette;
- Fog Depth;
- Lighting;
- Material Complexity;
- Texture Density;
- Shadow Coverage;
- Overdraw;
- Palette;
- Focal Region.

##### 4.14 Look Snapshot / A-B Compare

An editor-only workflow that captures the same camera under different presentation states and supports A/B, B/C, before/after, or wipe comparison. It exists to make profile and Rawness decisions evidence-based rather than memory-based.

---

#### 5. Five Binding Presentation Invariants

The aligned sources should preserve these exact concepts:

> **Rawness is intentional, not broken.**

> **Retroization is non-destructive.**

> **Profiles suggest; creator overrides win.**

> **Third-party algorithms accelerate; RetroStage owns meaning.**

> **Atmosphere is coordinated across space, image, motion, and sound — not reduced to post-processing.**

---

#### 5A. Additional Cross-Cutting Contracts

The atmosphere/presentation direction needs several contracts that apply across individual feature families.

##### 5A.1 Persisted Presentation State Is Canonical, Versioned, and Migration-Safe

Any project-authored state that materially defines the exported game's presentation must live in explicit RetroStage-owned persisted semantics rather than only in Babylon objects, React state, transient editor stores, or generated derivatives.

This includes, where applicable:

- Presentation Profile identity and creator overrides;
- Visual Rawness dimensions;
- Atmosphere Volume identity, bounds, blend policy, and references;
- camera-character settings;
- lighting/fog/exposure authoring state;
- material-character settings;
- Temporal Character settings;
- Environmental FX recipe references and creator overrides;
- atmosphere-audio references and states;
- deterministic seeds when they affect authored/reproducible output.

Required direction:

```text
versioned canonical meaning
→ validate
→ save
→ reopen
→ migrate when schema changes
→ project/runtime projection
```

A save/reopen or migration must not silently reset a creator's presentation identity to newer defaults. Generated/cooked derivatives may be rebuilt, but canonical intent must remain independently recoverable.

##### 5A.2 Creator Artistic Intent Is Distinct From Runtime Quality and Accessibility State

RetroStage must distinguish:

```text
creator-authored artistic intent
≠ player quality/performance preference
≠ accessibility/comfort override
≠ hardware fallback
```

For example, a creator may intentionally author hard low-resolution shadows and 4:3 output as identity, while particle density or expensive reflection quality may be quality-scalable. Likewise, a reduced-motion or flicker-safety option may alter a motion/flicker effect for accessibility without rewriting the project document.

A future owning milestone may formalize concepts similar to:

- `CREATOR_LOCKED` — changing it would materially replace the intended project identity;
- `PLAYER_ADJUSTABLE_WITHIN_CREATOR_BOUNDS` — creator defines safe range/default;
- `QUALITY_SCALABLE` — fidelity may be reduced through validated fallback tiers;
- `ACCESSIBILITY_OVERRIDE` — player comfort/safety takes precedence within explicit supported behavior.

**The exact enum names are not frozen by this candidate.** What is binding is the separation of authority and the requirement that overrides be bounded, diagnosable, and non-destructive to canonical project state.

##### 5A.3 Color / Output Pipeline Ordering Must Be Explicit

Retro identity can change materially when color transforms are reordered. The aligned roadmap/architecture should require an explicit supported ordering contract across the relevant stages, conceptually:

```text
source color-space interpretation
→ material / lighting result
→ exposure / tone mapping
→ LUT / palette treatment
→ reduced precision / posterization where used
→ dithering where used
→ internal-resolution / upscale policy
→ final display/output transform
```

This candidate does not freeze one shader graph or one exact order for every backend mode. It requires the owning renderer/presentation milestone to define, validate, and preserve the supported order so Editor Preview, PIE, cooked runtime, screenshots/captures where relevant, and standalone output do not drift semantically.

##### 5A.4 Deterministic Variation Must Be Reproducible Where It Affects Authored Meaning or QA

Noise, scatter, flicker variants, ambience variants, procedural-looking VFX variation, and other bounded variation may use randomness, but where reproducibility is needed the seed/timebase must be explicit enough to support:

- save/reopen stability where authored placement/state is expected;
- deterministic cooking where required;
- reproducible bug reports;
- golden-scene/golden-project regression;
- replay/test fixtures.

This does not require every visual particle to be bit-identical across every GPU. It requires the system to distinguish intentional nondeterminism from testable deterministic state.

##### 5A.5 Editor-Local Studio Identity / Comfort State Must Never Become Game Presentation Authority

If a separate Studio Identity / Creator Experience candidate is later promoted, its editor-local state must remain separate from game/export state.

Examples:

```text
StudioPreset
≠ PresentationProfile

Studio Player / Studio Radio
≠ Project Audio Asset / Runtime AudioCue

Editor accent / workspace mood
≠ Scene lighting / fog / LUT / game color treatment

Creator comfort music
≠ exported ambience
```

No editor-local mood preset, Studio audio, welcome-screen state, creator profile, or workspace layout may silently dirty the game project or affect standalone export unless the creator explicitly invokes a supported project-authoring command that produces canonical game data.

##### 5A.6 Accessibility and Comfort Overrides Are Part of Presentation Correctness

Some proposed atmosphere tools intentionally use motion, flicker, contrast, low-resolution output, rapid transitions, or audio pressure. The product direction must therefore leave room for explicit creator/player-safe handling such as:

- reduced camera sway/head-bob where exposed;
- reduced or disabled non-essential flicker/strobe behavior;
- safe defaults and diagnostics for high-frequency flicker;
- reduced motion for non-essential screen-space effects where applicable;
- accessibility-aware player settings using the shared typed runtime-settings foundation.

Accessibility behavior must not be implemented by mutating canonical authoring documents at runtime. It should be applied through explicit runtime settings/override policy.

##### 5A.7 Presentation Profile / Preset Lifecycle, Versioning, and Provenance

A Presentation Profile can be both a convenient starting point and a long-lived project dependency. RetroStage must therefore avoid a failure mode where updating a built-in/profile pack silently changes the look of an existing game.

The owning milestones should define an explicit policy such as versioned references, project-owned resolved settings/snapshots, or another deterministic mechanism that preserves creator intent. The exact storage strategy is not frozen here.

Required behavior:

- an applied profile/preset has stable identity and compatible version semantics;
- changing a shipped preset's future defaults does not silently restyle already-authored supported projects;
- creator overrides remain explicit and migration-safe;
- missing/incompatible profile versions produce diagnostics and a migration/remap path where supported;
- project portability rules define whether required profile resources are embedded, referenced, or installed through an approved content-pack contract;
- bundled LUTs, palettes, noise textures, cards, audio, sample assets, fonts, or other media used by presentation/atmosphere presets carry source/provenance/usage/redistribution metadata where applicable.

Software-library licensing does not substitute for rights to bundled presentation media.

##### 5A.8 Runtime Save Participation for Dynamic Atmosphere Is Explicit, Not Automatic

Some atmosphere changes are merely transient presentation state; others represent gameplay progression and must survive a checkpoint.

Examples that may need save participation when authored as game state:

- power is permanently disabled and the lighting/ambience state changed;
- a room entered a persistent anomaly variant;
- a story event permanently changed fog, soundscape, or environmental state;
- a persistent weather/Environmental FX recipe is tied to registered progression state.

Examples that usually should **not** require raw-state serialization:

- current particle positions;
- Babylon object instances;
- current shader object handles;
- arbitrary fog-card animation phase;
- transient camera damping velocity unless a specific supported contract requires it.

Required model:

```text
gameplay-semantic registered state
→ Runtime Save registry
→ restore
→ recompute effective presentation through RetroStage systems
```

not:

```text
serialize Babylon/render/audio implementation state
```

RSM-65/66 remain the owners of Runtime Save / slot persistence. Presentation and atmosphere systems must declare save participation only when their state is approved player progress.

### PART B — EXPORT / RUNTIME PARITY CONTRACT

#### 6. Core Rule

Every creator-facing capability that affects the intended player experience must declare an export disposition of:

- `RUNTIME`
- `COOKED`
- `HYBRID`
- `EDITOR_ONLY`

Preview success alone is never completion evidence.

The supported artistic/gameplay meaning authored by the creator must remain materially equivalent across every stage required by that disposition, subject only to explicit supported quality/fallback differences.

Quality reduction is allowed. Silent semantic disappearance is not.

---

#### 7. Export Disposition Definitions

##### 7.1 `RUNTIME`

The final player actively executes the feature using cooked settings/data and approved runtime code.

Typical examples:

- Camera Weight / Damping;
- Micro Sway;
- FOV Breathing;
- camera transitions;
- Atmosphere Volumes;
- fog/exposure behavior;
- shadow character;
- runtime material character;
- stepped animation playback;
- Ambient Motion;
- Environmental FX;
- audio zones, tension, ducking, and snapshots.

##### 7.2 `COOKED`

The authoring/cooking tool does not ship as player functionality. Its validated output does.

Typical examples:

- texture resize;
- offline palette reduction;
- offline dithering;
- atlas packing;
- mesh simplification;
- generated cooked mesh derivatives;
- generated cooked texture derivatives;
- some baked AO/lightmap outputs.

##### 7.3 `HYBRID`

Part of the feature is produced at cook time and another part is interpreted at runtime.

Typical examples:

- LOD generation + runtime LOD selection;
- Visual Rawness profiles;
- Material De-Polish when part of the character is baked and part runtime;
- Surface Dressing;
- generated presentation assets consumed by runtime;
- sprite atlas generation + runtime sprite playback.

##### 7.4 `EDITOR_ONLY`

The capability assists creation or diagnosis and must be excluded from the player artifact.

Typical examples:

- Atmosphere Analysis views;
- Look A/B Compare;
- authoring gizmos;
- scatter handles;
- diagnostic overlays;
- import controls;
- Project Doctor authoring panels;
- Babylon Inspector;
- editor docking/workbench state.

---

#### 8. Proposed Disposition Matrix

| Capability | Proposed disposition |
|---|---|
| Camera Weight / Damping | `RUNTIME` |
| Micro Sway / FOV Breathing | `RUNTIME` |
| Fixed-camera transitions | `RUNTIME` |
| Background / Foreground Plates | `HYBRID` |
| Fog / layered atmospheric depth | `RUNTIME / HYBRID` |
| Fog–draw-distance coupling | `RUNTIME` |
| Atmosphere Volume | `RUNTIME` |
| Exposure Lag | `RUNTIME` |
| Light Cookies | `RUNTIME / HYBRID` |
| Retro Shadow Modes | `RUNTIME` |
| AO Character | `RUNTIME / COOKED / HYBRID`, mode-dependent |
| Sky / Backdrop / Horizon | `RUNTIME / COOKED`, implementation-dependent |
| Visual Rawness Profile | `HYBRID` |
| Internal Resolution / AA / 4:3 / Integer Scaling | `RUNTIME` |
| Runtime color precision / runtime dithering | `RUNTIME` |
| Offline texture dithering / palette derivative | `COOKED` |
| Vertex Jitter | `RUNTIME` |
| Geometry / attribute quantization derivative | `COOKED / HYBRID` |
| Affine-style / UV Character | `RUNTIME` |
| Mesh Decimation | `COOKED` |
| Generated LOD | `HYBRID` |
| Texture Resize | `COOKED` |
| Atlas Generation | `COOKED` |
| Material De-Polish | `HYBRID` |
| Flat / Vertex / Gouraud-like supported shading | `RUNTIME` |
| Transparency Character | `RUNTIME` |
| Stepped Animation / Sprite Cadence | `RUNTIME` |
| Sprite Pixel Snapping | `RUNTIME` |
| Fog / Light / Parallax Cards | `RUNTIME` |
| Surface Dressing | `HYBRID` |
| Debris / Clutter Scatter | `COOKED / HYBRID` |
| Ambient Motion | `RUNTIME` |
| Environmental FX Recipes | `RUNTIME` |
| Room Tone / Reverb / Tension / Silence / Ducking | `RUNTIME` |
| Atmosphere Analysis | `EDITOR_ONLY` |
| Look A/B Compare | `EDITOR_ONLY` |
| Scatter Gizmos | `EDITOR_ONLY` |

The exact implementation backend may change during the owning milestone. The export-disposition semantics may change only through explicit review/change control.

---

#### 9. Completion Rules by Disposition

##### `RUNTIME` Done

Relevant evidence must cover:

```text
Authoring
→ Preview
→ PIE
→ cooked runtime representation
→ standalone Export
→ relevant clean-machine validation
```

##### `COOKED` Done

Relevant evidence must cover:

```text
Authoring/settings
→ deterministic cook
→ derivative validation/integrity
→ runtime consumption
→ source/editor processing tools excluded from player unless independently required
```

##### `HYBRID` Done

Must satisfy both the relevant cooked and runtime obligations.

##### `EDITOR_ONLY` Done

No runtime parity is required, but player-artifact exclusion must be verified.

---

#### 10. Parity Meaning

Parity does **not** require pixel-identical output on every quality tier or hardware profile.

Allowed:

- lower shadow resolution;
- lower particle density;
- reduced texture tier;
- supported effect fallback;
- lower-cost presentation backend.

Not allowed without an explicit unsupported/fallback state:

- Atmosphere Volume silently disappearing;
- creator-authored fog meaning being ignored;
- tension audio missing from player;
- stepped animation becoming continuous without declared fallback;
- material character being replaced with an unrelated default;
- editor-only visual illusion being marketed as exported-game capability.

---

### PART C — SOURCE 01: CANONICAL ROADMAP ALIGNMENT

#### 10A. RSM-37 / RSM-39 — Typed Atmosphere and Presentation Actions

The Visual Rawness / Atmosphere work must reuse the existing typed Event/Action and Scene Director architecture rather than inventing private strings, hidden scripts, or an unrelated atmosphere automation system.

RSM-37 should eventually be able to describe supported creator-facing actions/events for needs such as:

- activate/deactivate or blend an authored atmosphere state;
- request camera-profile or camera-character transitions;
- request supported lighting/fog/exposure changes;
- start/stop or parameterize supported Ambient Motion / Environmental FX behavior;
- request audio ambience/tension/snapshot changes;
- restore an authored state after interruption;
- expose validation/export-support metadata for each action.

RSM-39 should coordinate narrative-section progression with those typed actions when atmosphere changes are part of authored scene flow.

**Boundary:** exact event/action names, payload schemas, restoration semantics, and execution budgets belong to the owning milestones. This candidate only requires reuse of the shared semantic registry.

#### 11. RSM-42 — Camera Authoring / Activation Zones / Composition Toolkit

Preserve existing purpose and ownership. Add or clarify the following creator-facing capabilities:

- Camera Weight / Damping with bounded translation/rotation response;
- Micro Sway / Breathing as optional low-amplitude camera character;
- bounded FOV Breathing for supported states/transitions;
- camera-transition character beyond a raw duration value;
- Foreground Framing Helpers and foreground occlusion composition workflows;
- Fixed-Camera Background Plates;
- camera-specific Foreground Plates / overlays;
- background plate + 3D actor + simple occluder workflow where supported;
- export disposition for every camera-character feature;
- parity proof for used camera-character features.

**Boundary:** no mandatory camera shake, wobble, or fixed house style.

---

#### 12. RSM-43 — Lighting / Atmosphere Runtime

Extend the milestone to cover:

##### Lighting Character

- supported Retro Shadow Modes such as No Dynamic Shadow, Blob/Contact, Hard Low-Resolution, Baked/Lightmapped direction, and supported modern modes;
- Light Cookies / Projected Masks;
- bounded AO Character, including support direction for baked/vertex and supported runtime variants;
- bounded selective/fake reflection direction where justified.

##### Atmospheric Depth

- layered fog/haze;
- background haze;
- local fog/card integration;
- near/mid/far depth separation;
- fog ↔ draw-distance coupling;
- controlled visibility cutoff where supported;
- Controlled Detail Loss as an explicit presentation intent.

##### Exposure

- exposure adaptation;
- optional Exposure Lag;
- bounded response and fallback behavior.

##### Atmosphere Volumes

Introduce RetroStage-owned atmosphere volume semantics covering a bounded blendable subset of:

- fog;
- exposure;
- color/presentation influence;
- lighting influence;
- VFX state/density;
- audio snapshot/reverb references;
- blend distance/time.

##### Sky / Backdrop / Horizon

Support bounded environment-backdrop workflows such as:

- solid/gradient backgrounds;
- low-resolution sky/panorama;
- backdrop cards;
- distant silhouette layers;
- horizon haze;
- fog merging.

**Boundary:** no open-world or global dynamic weather/climate system is authorized.

---

#### 13. RSM-44 — Retro Presentation Profiles / Frame-Graph Architecture

Expand RSM-44 into the canonical profile/renderer-level owner for Visual Rawness and Raster Character.

Add or clarify:

- Visual Rawness dimensions and override rules;
- internal resolution and upscale policy;
- explicit AA Policy;
- 4:3 / 16:9 / supported custom aspect direction;
- integer scaling;
- letterbox/pillarbox;
- optional overscan;
- reduced color precision / posterization;
- runtime dithering;
- LUT/palette treatment;
- controlled vertex-position/raster precision direction;
- controlled Vertex Jitter;
- UV precision / affine-style texture character;
- capability/quality/fallback metadata for every supported presentation dimension;
- export disposition for each profile dimension;
- creator override precedence over profile defaults;
- explicit supported color/output ordering across color-space interpretation, exposure/tone mapping, LUT/palette, reduced precision/posterization, dithering, upscale, and final display transform;
- metadata/policy that distinguishes creator-locked artistic intent from quality-scalable, player-adjustable-within-bounds, accessibility-override, and hardware-fallback behavior without freezing exact enum names here;
- persisted/versioned presentation-state requirements sufficient for save/reopen and later migration without silent reset to newer profile defaults.

Candidate profile family may include:

- Brutalist PSX Raw;
- PS1 Constraint;
- Clean PS1;
- Early PS2 Atmospheric;
- Low-Poly Cinematic;
- Pixel Resolution Hybrid;
- Sprite-3D Hybrid;
- Custom.

**Boundary:** profiles are coordinated defaults, not mandatory visual brands and not claims of exact historical hardware emulation.

---

#### 14. RSM-45 — Atmosphere Audio Foundation / Preview-PIE Integration

Preserve the basic audio milestone and add only the early atmosphere subset needed before mature RSM-88 audio:

- basic Room Tone authoring;
- ambience layering/loops/fades;
- basic Proximity Ambience;
- basic tension-state hooks;
- Atmosphere Volume audio hooks;
- basic silence/duck behavior direction;
- Preview/PIE lifecycle correctness;
- export disposition for all supported early-audio features.

**Boundary:** mature mixer, acoustic authoring, adaptive audio, and full snapshot workflow remain RSM-88-owned.

---

#### 15. RSM-56 — Level Design / Blockout Tools

Add only the set-dressing foundations that belong to level placement:

- surface-aware placement;
- ground/surface snapping for dressing content;
- composition-friendly foreground placement helpers;
- placement/exclusion guidance used later by bounded scatter tools.

**Boundary:** no general procedural environment generator.

---

#### 16. RSM-57 — Liminal Blockout / Repetition / Transitional Architecture Toolkit

Extend controlled repetition into a bounded deterministic `Debris / Clutter Scatter` authoring accelerator.

Candidate controls:

- Collection;
- Density;
- Minimum Spacing;
- Cluster Strength;
- Scale Variation;
- Rotation Variation;
- Surface Alignment;
- Ground Hugging;
- Exclusion Areas;
- Deterministic Seed.

Use cases may include rubble, trash, concrete chunks, papers, broken furniture, bottles, cables, vegetation, and atmospheric clutter.

Requirements:

- deterministic result for the same authored state/seed;
- editable/bakeable authored representation where appropriate;
- no hidden procedural-world authority;
- diagnostics for excessive or invalid generation;
- explicit export disposition, normally `COOKED / HYBRID`.

---

#### 17. RSM-58 — Prefab / Variant System

Extend prefab/variant authoring to support:

- reusable scatter collections;
- deterministic presentation variants;
- visual variants separate from gameplay variants;
- safe update/override behavior for dressing sets;
- stable identity after generated/baked authoring operations where supported.

---

#### 18. RSM-75 — GLB / glTF Asset Pipeline

Expand creator-facing geometry derivative capabilities while preserving source ownership.

Add or clarify:

- Mesh Simplification / Decimation;
- target triangle percentage/count direction;
- Generated LOD derivatives;
- position quantization assistance;
- supported attribute quantization assistance;
- Normal Simplification / Normal Character;
- Hard-Edge Character where safely supported;
- bounded Geometry De-Polish;
- temporary derivative → validation → promotion flow;
- diagnostics when requested simplification cannot be safely reached;
- source asset never mutated or replaced by a retroized derivative.

**Boundary:** risky topology-edit operations such as arbitrary automatic bevel removal are not promised unless separately proven safe.

---

#### 19. RSM-76 — Texture / Sprite Atlas / Retro Image Import

Expand the milestone with non-destructive Texture Character authoring:

- maximum/derived texture-size policy;
- supported arbitrary/downscale derivative generation;
- nearest / linear and later admitted filtering policies;
- Mipmap Off / Limited / Normal direction;
- Mip Bias;
- Anisotropy control;
- Palette Reduction;
- Posterization;
- ordered and admitted error-diffusion dithering;
- atlas generation;
- atlas padding / relevant packing policy;
- stable SpriteSliceId preservation;
- sprite sampling/pixel character;
- exact source/cooked distinction;
- export disposition of each derivative or runtime setting.

**Boundary:** KTX/Basis/native image tooling remains separately audited and is not authorized by this proposal.

---

#### 20. RSM-77 — Content Integrity / Hashing / Cache Invalidation

Extend derivative identity to include relevant Retroization/Rawness recipes.

A derivative identity should be sensitive, where relevant, to:

- source hash;
- importer version;
- derivative recipe/version;
- geometry settings;
- texture settings;
- palette/dither settings;
- relevant rawness settings;
- relevant presentation-compatible settings.

Requirements:

- invalidate only affected caches/derivatives;
- never silently use stale retroized outputs;
- detect partial/failed jobs;
- surface repair actions.

---

#### 21. RSM-78 — Asset Reimport / Import Cache / Non-Destructive Settings

Require safe retroization reimport behavior:

```text
source changed
→ generate temporary derivative
→ validate
→ atomically promote if valid
```

On failure:

- source remains intact;
- canonical settings remain intact;
- previous last-good derivative remains intact;
- valid references remain intact where possible;
- creator receives a meaningful diagnostic.

---

#### 20A. RSM-65 / RSM-66 — Runtime Save / Checkpoint Participation Boundary

Dynamic atmosphere/presentation state must integrate with the existing registered Runtime Save model only where it represents approved player progress.

RSM-65 should be able to restore gameplay-semantic state that causes RetroStage systems to reconstruct the effective visual/audio atmosphere after load. It should not serialize raw Babylon, shader, particle, mixer-node, or renderer object state.

The owning atmosphere/presentation system must classify relevant state as one of:

- canonical project authoring state — never written by Runtime Save;
- registered runtime-progress state — saveable/migratable when explicitly supported;
- transient derived runtime state — recomputed/reset on restore according to documented semantics.

RSM-66 player profiles/slots may persist player quality/accessibility preferences through the proper runtime-settings/profile path, but those local preferences remain separate from project authoring files.

#### 21A. RSM-79 — Audio Import / Transcode / Loop Metadata Dependency Note

Atmosphere-audio authoring depends on a trustworthy audio content pipeline. RSM-79 remains the owner of source format support, loop metadata, streaming/loudness metadata, waveform/preview derivatives, and any admitted transcode tooling.

Clarify the boundary:

```text
Audio source/import/transcode/derivative policy → RSM-79
Runtime mixer/spatial/adaptive atmosphere behavior → RSM-88
Atmosphere orchestration/parity → RSM-89
Export/cooked manifest/runtime inclusion → RSM-94–103
```

No FFmpeg, codec binary, or other audio executable is authorized by this alignment candidate. Cook-time audio tooling is not automatically a player runtime dependency.

#### 22. RSM-80 — Runtime Asset Loading / Resource Manager

Clarify runtime resolution of:

- correct cooked mesh derivative;
- texture derivative;
- LOD chain;
- atlas/sprite derivative;
- material/presentation resource variant;
- explicit fallback when a required cooked artifact is unavailable.

Runtime code resolves these through stable RetroStage asset identity rather than physical derivative filenames becoming gameplay/canonical authority.

---

#### 23. RSM-81 — Large Project Scalability / Resource Disposal

Add or clarify resource safety for presentation/retroization workflows:

- disposal of superseded preview derivatives;
- disposal of replaced cooked preview resources;
- LOD/resource memory budgets;
- texture-tier budgets;
- VFX/atmosphere resource budgets;
- Hero / Supporting / Background content-budget direction;
- no unbounded retention of original + multiple generated GPU variants.

---

#### 24. RSM-82 — Editor Performance Profiling / Slow Operation Detector

Extend slow-operation diagnostics to include:

- mesh conversion/simplification;
- image conversion;
- atlas generation;
- derivative validation;
- shader/material variant compilation;
- transparent overdraw from atmospheric cards;
- fog/VFX cost;
- derivative/cache memory cost;
- slow background jobs.

Diagnostics should identify dominant causes rather than report only a generic “scene slow” state.

---

#### 25. RSM-83 — Material / Shader / Retro LookDev Editor

Extend constrained material authoring with `Material De-Polish` and `Material Character`.

Candidate controls:

- Specular Suppression;
- Reflection Suppression;
- Normal Detail Suppression;
- roughness simplification;
- material-layer simplification where supported;
- vertex-color influence;
- dirt/variation masks;
- UV character hooks;
- supported retro PBR-lite direction.

Supported material character should include, where validated:

- Unlit;
- Flat-like;
- Vertex Lit;
- Gouraud-like;
- Lightmapped;
- supported modern material profile.

##### Transparency Character

Add creator-facing supported transparency character such as:

- Modern Blend;
- Alpha Cutout;
- Dithered;
- Threshold / Stepped;
- Additive;
- Retro Card.

##### AO Character

Coordinate supported AO behavior with RSM-43 lighting/runtime and the material workflow.

**Boundary:** no general raw GLSL/HLSL shader IDE.

---

#### 26. RSM-84 — Skeletal / Sprite / Flipbook Animation Pipeline

Add `Temporal Rawness` support:

- Continuous animation cadence;
- Stepped / Sample-and-Hold cadence;
- supported custom sample rate;
- sprite/flipbook cadence controls;
- Sprite Pixel Snapping where applicable;
- Preview/PIE/player parity for selected cadence.

The runtime may render at a high frame rate while animation poses update at the chosen authored cadence.

---

#### 27. RSM-85 — Animation State Machine / Locomotion / Retargeting

Require transition/blending systems to preserve the creator-selected Temporal Character unless the creator explicitly selects a different transition behavior.

A stepped presentation must not silently become continuous merely because a state transition or blend exists.

---

#### 28. RSM-86 — Retro VFX / Particle / Sprite FX Authoring

Expand bounded VFX authoring with low-cost perceptual atmosphere techniques:

- Fog Cards;
- Light / God-Ray Cards;
- Dust / Smoke / Mist Cards;
- Parallax Background Cards;
- supported depth-fade intersections;
- Stepped VFX cadence;
- Animated Grime / Noise;
- deterministic variation seeds.

##### Surface Storytelling / Surface Dressing

Add creator workflows for:

- Leak;
- Rust;
- Dirt;
- Crack;
- Poster;
- Wet Patch;
- Soot;
- Blood / Organic;
- Custom Decal.

##### Ambient Motion

Add bounded transform/material-motion profiles such as:

- Oscillate;
- Rotate;
- Sway;
- Pulse;
- Flicker;
- Custom Curve.

Candidate controls:

- Speed;
- Amplitude;
- Phase;
- Deterministic Seed where relevant.

##### Environmental FX Recipes

Support bounded authoring recipes such as:

- Rain;
- Snow;
- Ash;
- Dust;
- Drips;
- Steam;
- Embers;
- Mist;
- light falling debris.

**Boundary:** no full climate/weather simulator, full destruction engine, or general VFX programming environment.

---

#### 29. RSM-88 — Audio Runtime / Mixer / Spatial / Adaptive Sound

Extend mature atmosphere audio with:

- Room Tone layering;
- ambience variants;
- proximity rumble/tension layers;
- reverb/acoustic zones;
- acoustic transitions;
- ducking;
- mixer snapshots;
- deterministic/randomized one-shot selection where appropriate and owned by RetroStage semantics;
- Atmosphere Volume integration;
- creator diagnostics/budgets.

##### Acoustic Tension / Silence

Silence and reduction of sound are first-class authorable atmosphere tools.

Support creator-authored states in which music, ambience, selected frequency content, or room tone may be reduced or transitioned to create tension.

---

#### 30. RSM-89 — Advanced Retro Presentation / Animation / VFX / UI / Audio Parity

Make RSM-89 the mature convergence point for `Atmosphere Director`, `Visual Rawness`, analysis tooling, and full presentation parity.

Add or clarify:

- coordination of Camera Character, Lighting, Fog, Atmosphere Volumes, Material Character, Raster Character, Temporal Character, VFX, Environmental FX, Surface Dressing, and Audio Atmosphere;
- Atmosphere Director authoring workflow;
- quality tiers/fallbacks for these systems;
- Atmosphere Analysis views;
- Look Snapshot / A-B Compare;
- visual/audio regression fixtures;
- explicit export disposition for every used presentation/atmosphere capability;
- no editor-only illusion may be presented as an exported-game capability.

##### Proposed RSM-89 parity exit strengthening

All used Visual Rawness, Atmosphere Director, material, animation, VFX, audio, camera, and environment-presentation capabilities in the representative project have declared export disposition and preserve materially equivalent creator intent across every required Preview/PIE/Cooked/Export stage.

---

#### 31. RSM-90 — Minimum Hardware Target / Compatibility Profiles

Extend fallback profiles to every new atmosphere/rawness capability where needed.

Each relevant capability should have a support state such as:

- `Full`
- `Reduced`
- `Minimal`
- `Unsupported`

Fallback may reduce fidelity but must not silently erase semantic intent.

Examples:

- lower shadow resolution;
- lower particle count;
- lower texture tier;
- reduced expensive post-processing;
- retaining cheaper cards/fog/silhouette treatment where possible.

---

#### 32. RSM-91 — Production Content Creator Gate

Strengthen Gate F acceptance with at least two deliberately distinct presentation proofs.

Candidate golden content:

##### A — Brutalist PSX Raw

- high/raw geometry/material/raster character;
- dark controlled-detail-loss lighting;
- low texture information density;
- hard silhouettes;
- rubble/clutter;
- strong fog depth;
- industrial atmosphere audio.

##### B — Clean Early-PS2 Atmospheric

- richer geometry/material response;
- cleaner texture character;
- smoother camera;
- subtler raster artifacts;
- more cinematic fog/audio.

Requirements:

- both are built with the same RetroStage product architecture;
- they must not look like recolors of one mandatory template;
- both must be proven as exported/packaged experiences, not screenshots only;
- editor-only analysis/helper systems must not leak into player artifacts;
- critical atmosphere/presentation parity findings must be closed.

---

#### 32A. RSM-92 — Runtime Platform / Display Output Contract

The standalone target contract must own the OS/display conditions that can materially alter RetroStage presentation.

Add or clarify validation direction for:

- windowed / borderless / fullscreen behavior as supported;
- resize and display-mode changes;
- 4:3 and other authored aspect behavior;
- letterbox/pillarbox correctness;
- integer-scaling behavior and explicit fallback when the target display cannot satisfy the ideal integer multiple;
- DPI / display scaling interaction;
- internal-resolution and final-output mapping;
- renderer-backend capability/fallback differences that affect presentation;
- audio-device/runtime-environment behavior relevant to atmosphere parity.

The exact Windows versions, DPI thresholds, resolutions, and hardware limits remain evidence-driven milestone decisions. The requirement is that final display behavior not be left as an accidental Electron/browser-window consequence.

#### 33. RSM-94 — Cooked Content Manifest / Runtime Content Contract

Clarify that the mature cooked manifest must support the semantics necessary to distinguish:

- runtime-required content/capabilities;
- cooked derivatives;
- hybrid runtime+cooked requirements;
- editor-only/excluded content;
- capabilities and fallbacks required by the player.

Do not prescribe the final field names in this source-alignment candidate; schema details belong to the owning milestone contract.

---

#### 34. RSM-95 — Export Compiler / Deterministic Runtime Layout

Extend export compiler responsibilities to:

- select correct cooked geometry/texture/atlas derivatives;
- prepare material/presentation variants;
- prepare runtime atmosphere/presentation data;
- resolve audio/VFX/presentation references;
- exclude editor-only data and authoring-only processing tools;
- produce an export blocker if a used non-editor-only capability lacks a valid runtime/cooked projection;
- preserve deterministic output and explain artifact differences.

---

#### 35. RSM-96 — Standalone Runtime App Flow

Clarify that exported runtime must execute all used supported `RUNTIME` and runtime portions of `HYBRID` capabilities without requiring the editor application or authoring services.

Examples include:

- Atmosphere Volume runtime;
- Camera Character;
- presentation profiles;
- material character;
- VFX/Environmental FX;
- Temporal Character;
- audio atmosphere.

The player must not contain unnecessary editor UI, import authoring tools, analysis views, or editor-only dependencies.

---

#### 35A. RSM-97 — Runtime Error Boundary / Presentation Fallback Policy

Runtime failure handling should include presentation/atmosphere resources and capabilities.

Examples:

- missing cooked LUT/palette/texture derivative;
- unsupported material/presentation variant;
- missing Atmosphere Volume reference;
- failed audio ambience/snapshot reference;
- unavailable optional effect at the active hardware tier.

The runtime must classify failures as fatal, recoverable, degraded, or creator-build problems according to the owning contract. A fallback must be explicit and diagnosable rather than silently replacing project identity.

#### 35B. RSM-98 — Structured Logging / Atmosphere and Presentation Trace

Structured trace should be able to explain relevant state transitions and fallback decisions, including stable project/scene/entity/asset/presentation identities where available.

Useful trace classes include:

- active Presentation Profile and overrides;
- Atmosphere Volume enter/exit/blend state;
- camera-character transition requests;
- material/presentation variant selection;
- quality/accessibility/fallback overrides;
- asset-derivative resolution;
- audio snapshot/tension/ambience transitions;
- export/runtime capability fallback.

Raw Babylon object identities must not become the creator-facing trace authority.

#### 35C. RSM-99 — Live Atmosphere / Presentation Debugging

The runtime debugger should eventually let creators inspect why the running game differs from expectation without making runtime state canonical.

Candidate readouts include:

- effective presentation profile and individual overrides;
- active Atmosphere Volumes and blend weights;
- effective fog/exposure/lighting character;
- current camera-character state;
- effective quality/accessibility overrides;
- selected material/texture/LOD derivatives;
- active Ambient Motion / Environmental FX states;
- current ambience/reverb/tension/snapshot state.

This is creator-facing diagnosis, not permission for arbitrary Babylon mutation.

#### 35D. RSM-100 — Build Stripping Must Understand Presentation Dispositions and Dynamic References

The dependency optimizer/build stripper must distinguish:

- editor-only analysis views and authoring helpers;
- source-only/cook-only tools;
- unused presentation/material/shader variants;
- runtime-required variants selected dynamically by approved profile/quality/accessibility logic;
- dynamically referenced Atmosphere/FX/audio content that must not be stripped incorrectly.

A build-size optimization is invalid if it removes a supported dynamically reachable atmosphere/presentation capability.

#### 35E. RSM-101 — Project Doctor / Export Validation for Atmosphere and Visual Rawness

Project Doctor should eventually diagnose export-readiness problems such as:

- used non-editor-only capability has no valid cooked/runtime projection;
- presentation profile references missing or stale derivatives;
- Atmosphere Volume references missing audio/VFX/material resources;
- unsupported profile/hardware combination;
- quality fallback would materially violate a creator-locked presentation requirement;
- excessive transparent overdraw / VFX / texture-memory cost where measurable;
- dangerous or unsupported flicker/reduced-motion interaction where rules can be proven;
- editor-only content has leaked into an export dependency graph;
- deterministic seed/settings mismatch produces stale derivatives.

The Doctor must remain evidence-driven and must not claim subjective artistic quality as a validation truth.

#### 35F. RSM-102 — Packaged Artifact Evidence

Release artifact reporting should make the atmosphere/presentation pipeline auditable by recording, where applicable:

- packaged runtime presentation/material variants;
- cooked derivative inventories/hashes;
- player dependency graph and notices;
- native/WASM inventory for admitted processing/runtime dependencies;
- absence of editor-only analysis/import tooling from player artifacts;
- warnings/fallbacks relevant to the selected target profile.

#### 35G. RSM-103 — Final Performance / Render / Export / Clean-Machine Parity Gate

RSM-103 should explicitly include representative Visual Rawness/Atmosphere profiles in final profiling and parity work.

Acceptance direction:

- profile representative hardware tiers;
- test frame pacing with fog/transparency/cards/particles/material variants and audio atmosphere;
- test display resize/fullscreen/DPI/aspect/integer-scale behavior;
- prove clean-machine standalone execution;
- compare Preview/PIE/player material intent rather than demanding impossible pixel identity;
- close unexplained runtime fallback or artifact leakage.

This is the mature Gate G proof that the feature set is a real exported-game capability rather than an editor showcase.

#### 35H. RSM-104 / RSM-105 — Flow Graph Boundary

Flow Graph may expose approved atmosphere/presentation actions through the same Event/Action registry, for example transitions, toggles, parameter changes, or state requests.

It must not gain:

- arbitrary shader code;
- arbitrary renderer-object access;
- direct Babylon mutation;
- unrestricted per-frame loops used as a substitute for missing presentation APIs.

Execution budgets, trace, validation, and export support remain mandatory.

#### 35I. RSM-106 — Native Sequencer Integration

The native Sequencer should be able to orchestrate supported atmosphere/presentation tracks using existing canonical semantics rather than creating a second authority.

Potential track/control families include:

- camera-character/profile transitions;
- lighting/fog/exposure parameters;
- material/presentation parameters;
- VFX / Ambient Motion / Environmental FX triggers;
- audio ambience/snapshot/tension changes;
- visibility/scene-state interaction through existing sequence contracts.

Scrub, interruption, skip, restoration, and Preview/PIE/Export parity must be defined by RSM-106. There must be no independent "Atmosphere Timeline" runtime that bypasses the native sequence/event architecture.

#### 35I-A. RSM-108 / RSM-109 / RSM-110 — Presentation Preset / Pack Lifecycle

The later genre-kit/template/content-pack milestones should own distribution and compatibility of reusable Presentation Profiles, atmosphere recipes, and any bundled presentation media.

Required direction:

- RSM-108 presets remain replaceable starting points and preserve project identity;
- RSM-109 versions/migrates profiles, recipes, and sample projects predictably;
- RSM-110 owns local pack manifest, provenance, license, dependency, update, removal, and project portability rules;
- project behavior must not silently change because a globally installed preset/pack was updated;
- pack removal must diagnose or protect projects that still depend on required resources;
- bundled presentation media follows existing asset-provenance and redistribution rules.

This candidate does not create a marketplace, entitlement system, or DLC-commerce requirement.

#### 35J. RSM-112 / RSM-113 — Golden Presentation Regression and Reproducibility

At least one living/golden project should exercise the aligned presentation pipeline across later QA.

Regression direction should cover, where practical:

- representative fixed-camera and free-camera scenes;
- Atmosphere Volume transitions;
- Presentation Profile / Visual Rawness settings;
- cooked mesh/texture derivatives;
- material and transparency character;
- Temporal Character / Ambient Motion / VFX;
- audio ambience/tension/zone transitions;
- player quality/accessibility fallback behavior;
- migration of persisted presentation data;
- build stripping and clean export.

Deterministic seeds, replayable inputs, fixed camera viewpoints, hashes, and approved visual/audio comparison methods should be used where they make regressions reproducible. Expected GPU/audio nondeterminism must be separated from true regressions rather than hidden by overly brittle pixel-perfect rules.

RSM-113 CI should run the appropriate migration/cook/export/artifact tests and preserve dependency/notice evidence.

#### 35K. RSM-116 — Presentation / Derivative Compatibility and Migration

Project compatibility policy must include presentation documents/settings and derivative recipes.

Required direction:

- supported historical presentation/profile settings open or migrate explicitly;
- destructive migration receives backup/rollback protection;
- deprecated profile dimensions produce diagnostics rather than silent loss;
- changing renderer implementation or profile defaults must not silently "refresh" an existing supported project's authored identity;
- rebuildable derivatives may be regenerated from preserved canonical intent using versioned migration/import rules;
- unsupported old behavior must be explained through compatibility diagnostics.

This does not promise infinite exact visual preservation across every future major version; it requires explicit support policy and no silent abandonment of supported project meaning.

#### 35L. RSM-119 — Accessibility / Comfort Validation for Atmospheric Presentation

Public-readiness work should validate the shared runtime-settings path for presentation features that can affect comfort or safety.

Representative checks should include:

- reduced camera sway/head-bob where exposed as non-essential motion;
- reduced/disabled non-essential flicker or strobe effects;
- safe-default/diagnostic direction for creator-authored high-frequency flicker where measurable;
- reduced-motion handling for non-essential screen-space effects where applicable;
- settings persistence without mutating canonical project authoring data;
- documentation of creator-locked versus player-adjustable presentation behavior.

Exact accessibility UX belongs to the owning milestones and Source 05 accessibility decisions; this candidate only requires the atmosphere system not to make such support architecturally impossible.

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

### POST-RSM-78 — Early Access Release Candidate

**Type:** `NON-NUMBERED COMMERCIAL RELEASE CONTROL`  
**Activation precondition:** `RSM-78 MILESTONE CLOSED / PASS`  
**Purpose:** Permit a paid Steam Early Access release before RSM-120 by pulling forward only the release-critical export, packaging, clean-machine, compatibility, security, compliance, onboarding, support, migration, and store obligations required by the actually advertised product, while preserving the complete RSM-79→RSM-120 roadmap.

**Required direction:**
- Freeze a truthful Early Access feature/support boundary from capabilities actually accepted at or before RSM-78 plus explicitly approved EA-RC release infrastructure.
- Prove the universal runtime-capability/export-completeness contract for every advertised exported-game capability.
- Prove deterministic standalone creator export with no unexplained semantic loss from supported authored meaning through PIE, cook, manifest, package, and standalone player.
- Prove supported Windows clean-machine editor and exported-player operation.
- Prove representative Electron/Babylon heavy-3D player stability and selected store-target behavior without creating a benchmark program.
- Prove physical artifact inventories, stripping, notices, SBOM, native/WASM inventory, dependency/media licensing, and zero secret leakage.
- Provide minimum truthful onboarding/help, known limitations, repair guidance, installer/update behavior, and support diagnostics required for paying EA users.
- Establish minimum project migration/regression/backup protection for public customer projects.
- Produce current store/commercial evidence, Early Access disclosure, pricing/region/promotion/SKU/entitlement/EULA consistency as release evidence rather than architecture constants.
- Keep RSM-79→RSM-120 open and unchanged as the continuing development roadmap.
- Keep the live EA release channel controlled; current development state is not automatically public-release state.

**Explicit non-claims:**
- EA-RC does not close Gate F, Gate G, RSM-92–103, RSM-112–119, RSM-119-ADD1, or RSM-120.
- Early Access does not imply every future roadmap capability exists.
- Store publication does not make a storefront or SDK canonical product/runtime authority.

**Live-EA continuation rule:** paid customer projects become compatibility-sensitive data. Roadmap work may continue through RSM-79→120, but public updates require validated release-candidate promotion, applicable migration/backup/reopen/export evidence, release notes, and bounded urgent-maintenance authorization for critical security/data-loss/export/crash/store-compliance issues.

**Exit:** `POST-RSM-78 EA-RC CLOSED / PASS` requires independently accepted evidence that the advertised Early Access build is installable, usable, supportable, secure enough for its declared surface, legally distributable, capable of complete supported standalone export, clean-machine verified, migration/update protected to the defined baseline, and truthfully represented. After closure, RSM-79 may be separately authorized; storefront launch remains subject to then-current external requirements.

## RSM-79 — Audio Import / Transcode / Loop Metadata
**Purpose:** Create audio source metadata, waveform, streaming, loop, loudness, and derivative policy.  
**Third-party placement:** No FFmpeg or codec-enabled binary enters without the conditional audit defined in the technology contract.  
**Key deliverables:**
- Define initially supported source and runtime formats.
- Record loop points, channels, sample rate, streaming, and loudness metadata.
- Generate approved previews and waveforms.
- Diagnose unsupported codecs and licensing risk.
**V2 source-inspection boundary:**
- Audio source inspection may later use `music-metadata` only if RSM-79 separately admits it under Source 06; it may inspect container/duration/tag/source metadata but does not own decode/runtime cue/gameplay-noise/codec semantics.

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
**V2 animation-event addition:**
- Gameplay meaning binds to typed animation marker/event identity and repeat policy, not raw frame numbers or transient engine callback object identity.

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
**V2 deterministic VFX addition:**
- Use domain-separated RetroStage RNG streams/seed provenance where deterministic authored meaning or regression depends on variation; PRNG/noise libraries remain replaceable algorithms.

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
**V2 audio-authority additions:**
- Keep audible audio events distinct from typed AI `GameplayNoise`; AI hearing is not inferred from speaker gain/volume.
- Define audio ownership/lifetime scopes, preload/streaming latency classes, Scene/Section transition continuity, and one runtime listener authority independent of active camera count.
- Runtime Save reconstructs transient audio voices from semantic state; engine voice/player handles are not save truth.

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
- Build a representative content-rich sample and at least two deliberately distinct exported presentation proofs: one `Brutalist PSX Raw` direction and one `Clean Early-PS2 Atmospheric` direction, proving shared architecture without one recolored house style.
- Validate import, reimport, materials, animation, VFX, UI, audio, performance, and fallback behavior.
- Audit asset provenance and packaged derivatives.
- Close critical usability, memory, and parity findings.
**Exit:** Gate F closes when creators can produce a distinctive content-rich game without external engine-editor workflows.

# Gate G — Standalone Build Product

## Gate-G Cross-Cutting Runtime Capability / Export Completeness Contract

A supported creator-facing capability classified as `RUNTIME`, `COOKED`, or `HYBRID` is not export-complete merely because it works in Editor Preview or PIE.

For every used supported non-editor-only capability, Gate G must prove:

```text
used supported capability
→ stable capability identity / owning semantic
→ declared export disposition
→ runtime and/or cooked projection
→ complete semantic + asset + module dependency closure
→ cooked manifest representation
→ deterministic package inclusion
→ physical artifact evidence
→ standalone-player execution
→ required parity / clean-machine proof
```

Missing any required link is an `EXPORT BLOCKER`.

`RUNTIME` means player behavior/code/data is required; `COOKED` means deterministic generated runtime artifacts are required; `HYBRID` requires both; `EDITOR_ONLY` must be proven absent from player artifacts unless an explicit normal project import/conversion creates runtime-owned content.

Dependency closure is semantic, not merely a static asset-reference graph. Story flags, dialogue/objective transitions, recipes, scene transitions, dynamic resource references, UI bindings, presentation/atmosphere state, audio/VFX triggers, save participation, and store-enabled capabilities must remain explainably reachable where required.

Store-target packaging composes over a store-neutral complete export. Store adapters may add target-specific files/services, but cannot repair a semantically incomplete base runtime package.

### Heavy-3D / store qualification boundary

The initial Electron player remains valid only through evidence, not assumption. When a commercial/store target is claimed, the owning gate must prove representative hardware-accelerated Babylon/Electron packaged-player startup, graphics/process lifecycle, long-session/resource churn, crash/error supervision, clean-machine behavior, and selected store integration behavior. This is qualification, not a benchmark program, and it does not pre-admit any vendor SDK.

## RSM-92 — Runtime Platform Environment / Target Contract
**Purpose:** Define supported Windows runtime environment, filesystem, graphics, input, audio, and process behavior.  
**Third-party placement:** Electron and Babylon target capabilities; Steam remains a distribution layer rather than canonical authority.  
**Key deliverables:**
- Define supported OS versions and architecture.
- Define writable paths, display modes, device behavior, and offline expectations.
- Define clean-machine prerequisites and error handling.
- Define representative packaged Electron/Babylon graphics/process/lifecycle qualification expectations for supported hardware and selected store targets without creating a benchmark program.
- Keep store-specific requirements behind optional platform adapters; store SDK admission remains Source-06-controlled.
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

### RSM-93-ADD1 — Exported Game Legal / Credits Metadata Contract
**Purpose:** Define canonical exported-game legal/credits metadata and creator/publisher identity without forcing RetroStage product branding.  
**Key deliverables:**
- Define canonical creator, developer, and publisher identity fields.
- Define copyright and legal fields.
- Support optional creator-defined credits.
- Define asset-attribution references.
- Keep generated third-party software notices distinct from creator-authored credits.
- Define localization-ready legal and credit references.
- Require no mandatory RetroStage splash/logo metadata.
- Map project-owned metadata into exports deterministically.
**Exit:** An exported project can produce correct creator-owned identity/legal/credits metadata without leaking RetroStage editor identity or omitting required third-party notices.

## RSM-94 — Cooked Content Manifest / Runtime Content Contract
**Purpose:** Define the complete manifest for scenes, assets, shaders, audio, UI, presentation, and runtime settings.  
**Third-party placement:** RetroStage compiler; approved asset tools and Babylon runtime loader.  
**Key deliverables:**
- Resolve stable identities to cooked artifacts.
- Record hashes, versions, stable capability identities, export dispositions, semantic dependencies, asset/module dependencies, and optional content.
- Represent the complete used-capability closure required by the player, including dynamic/semantic reachability that cannot be inferred from static asset references alone.
- Separate editor-only and runtime content and explain why retained dynamic content remains reachable.
- Validate manifest integrity and capability closure before packaging.
**V2 manifest/composition addition:**
- Root cooked capability/dependency closure in the same GameDefinition/shared resolution semantics used by PIE/runtime and record resolution provenance/fingerprint evidence where useful for reproducibility.

**Exit:** The player can load a project solely through an approved deterministic cooked manifest.

## RSM-95 — Export Compiler / Deterministic Runtime Layout
**Purpose:** Build the mature cooking and export pipeline.  
**Third-party placement:** glTF-Transform, meshoptimizer, optional audited texture/audio tools, Electron packaging, and RetroStage compiler services.  
**Key deliverables:**
- Cook assets and documents into deterministic runtime forms.
- Project canonical gameplay, presentation, UI, save, and runtime semantics into the required runtime/cooked representations without making generated forms canonical.
- Prepare shader/material/presentation variants.
- Create reproducible hierarchical runtime layout and cache invalidation; optional store-target layers compose over the store-neutral base output.
- Support cancellation, logs, and failure recovery.
**V2 compiler/composition addition:**
- Cook from one coherent accepted snapshot through the shared resolver semantics; generated runtime layout must not introduce package-time gameplay defaults or a second resolver authority.

**Exit:** Equivalent approved inputs produce equivalent runtime content and explainable artifact differences.

## RSM-96 — Standalone Runtime App Flow
**Purpose:** Own player startup, settings, save selection, scene entry, pause, shutdown, and failure states.  
**Third-party placement:** `player-electron`, Babylon adapter, runtime core, and player UI.  
**Key deliverables:**
- Remove editor and development-only code.
- Define bootstrap, loading, first scene, suspend/resume direction, and shutdown.
- Integrate settings, input, saves, and error boundary.
- Compose optional store services only through bounded platform adapters when enabled.
- Prove editor independence and representative packaged Electron/Babylon lifecycle stability.
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
- Build dependency closure from authoritative references plus declared semantic/dynamic capability reachability.
- Strip development packages, source assets, unused variants, and only content proven unreachable under the supported runtime semantics.
- Explain retained and removed content, including why dynamically/semantically referenced content is retained.
- Protect approved dynamic references, story/gameplay transitions, UI/presentation bindings, and other declared runtime reachability.
**Exit:** The player package contains only required approved runtime files and notices.

## RSM-101 — Project Doctor / Export Validation Gate
**Purpose:** Converge validation into creator-facing readiness and repair guidance before build.  
**Third-party placement:** Validation framework, asset/index services, runtime capability matrix, and packaging checks.  
**Key deliverables:**
- Check references, gameplay, scenes, saves, assets, shaders, textures, audio, UI, presentation, capability export dispositions, semantic dependency closure, performance, licensing metadata, and target support.
- Separate warning, Play blocker, Export blocker, and release blocker.
- Treat any missing required capability→projection→dependency→manifest→package link as an Export blocker.
- Offer safe repair actions where possible.
- Generate machine-readable validation evidence.
**V2 Project Doctor additions:**
- Diagnose GameDefinition binding/resolution provenance, torn/incompatible revision inputs, requested/supported/effective capability mismatch, stale async results, required unknown-extension meaning, and missing resolution→export closure links where applicable.

**Exit:** No release build proceeds with unresolved critical blockers, and creators can understand the reason.

## RSM-102 — Game Packaging / Artifact Report / Release Notes
**Purpose:** Produce final Windows package artifacts and complete evidence.  
**Third-party placement:** Electron Forge and a separately audited Windows installer maker when selected; Steam tools remain conditional.  
**Key deliverables:**
- Package player, content, licenses, notices, and required runtime files from the validated store-neutral runtime layout.
- Add optional store-target files/services only through the selected distribution adapter and only when admitted/required.
- Generate build contents, versions, warnings, hashes, SBOM, native/WASM inventory, capability/export-closure evidence, and release notes.
- Inspect the physical artifact rather than manifests alone and prove editor-only/Studio-local/source content exclusion.
- Define signing hooks without committing secrets.
**Exit:** A release candidate has reproducible artifact evidence and can be installed or launched on a clean supported target.

## RSM-103 — Performance / Render / Export Polish / Clean-Machine Gate
**Purpose:** Optimize and validate frame pacing, shaders, batching, transparency, memory, audio, package size, and startup.  
**Third-party placement:** All approved runtime and profiling tools; no new dependency added only to mask architectural problems.  
**Key deliverables:**
- Profile representative hardware tiers.
- Close critical performance and compatibility findings, including packaged Electron/Babylon graphics/process/lifecycle issues for the supported player host.
- Verify clean install/run/uninstall or portable behavior as selected.
- Verify used-capability closure and final Preview/PIE/player parity, long-session/resource-churn stability, and packaged-file audit.
- For selected store targets, verify the target adapter/overlay/runtime behavior required by current release evidence without treating vendor behavior as canonical game authority.
**Exit:** Gate G closes when RetroStage reliably produces diagnosed, optimized, standalone Windows games.

### Cross-Milestone Store / Heavy-3D Packaged-Player Qualification Lock

**Type:** `RELEASE QUALIFICATION CONTRACT / NOT A BENCHMARK PROGRAM`

Marketplace precedent does not prove RetroStage's Electron + Chromium + Babylon heavy-3D runtime. Claimed commercial store support requires physical packaged-player evidence on the selected target path.

Required qualification categories:
- **Minimal host integrity:** release player excludes editor/authoring/test/Inspector authority and loads the cooked runtime manifest as runtime content truth.
- **Hardware graphics:** observe the actual graphics capability/path; classify degraded/unsupported behavior; do not silently claim support through unacceptable software rendering when the target requires hardware acceleration.
- **Steam target when enabled:** physically prove launch from Steam client; windowed/borderless/fullscreen and focus/Alt-Tab; overlay activation/deactivation where used; optional achievement/store/controller callbacks only when that feature is enabled; correct admitted bridge initialization ordering; shutdown without orphaned store/native resources; store-neutral build remains free of Steam requirement.
- **Epic target when enabled:** physically prove launch from Epic Games Launcher / selected distribution path; target artifact/config resolution; achievements/cross-store/EOS/overlay/social behavior only when the shipped feature set actually requires and admits it; shutdown without orphaned platform resources; store-neutral build remains free of Epic/EOS requirement.
- **Host/process supervision:** classify renderer/GPU/child-process loss, preserving available crash/OOM/launch/integrity/memory-eviction reason; produce local diagnostic evidence; use controlled shutdown or an explicitly designed recovery path; never silently restart into save/runtime corruption.
- **Long-session/resource churn:** repeated Scene load/unload, derived-resource create/dispose, save/load where applicable, suspend/resume, focus/window transitions, overlay/device transitions where applicable, and clean shutdown without monotonic unmanaged retention or stale async resurrection.
- **Representative target coverage:** use supported Windows/GPU/store environments selected by the runtime target contract; this is compatibility/stability evidence, not a universal FPS score or public benchmark.

**Store update ownership**
For store-delivered builds, the selected distribution target owns normal patch/update delivery:
```text
Steam build updates → Steam distribution pipeline
Epic build updates  → Epic distribution pipeline
store-neutral standalone update → separate future policy if ever required
```
A generic Electron self-updater is not baseline exported-game authority. RetroStage owns reproducible package content and version identity; the store owns distribution/depot/update transport for that target.

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

### RSM-119-ADD1 — Commercial Model / Steam Go-to-Market Contract
**Purpose:** Finalize commercial/store-facing policy from current market/store evidence without turning mutable commercial values into architecture constants.  
**Key deliverables:**
- Verify creator commercial/export-rights policy consistency.
- Verify the `0%` RetroStage engine royalty policy and the absence of a per-game/export fee or creator-revenue cap.
- Define paid Alpha/Early Access to same-product `1.0` entitlement continuity.
- Define the Steam/store product identity and edition/SKU boundary.
- Produce a current evidence-based retail/Early Access pricing recommendation.
- Produce a current evidence-based regional-pricing approach.
- Produce a current evidence-based discount/promotion policy.
- Produce a current evidence-based Early Access duration and transition plan.
- Produce a current language/territory rollout recommendation.
- Record current marketing/wishlist goals when useful and mark them explicitly non-architectural.
- Verify consistency with final EULA/store text and third-party rights.
**Exit:** Commercial launch/Alpha policy is evidence-backed, legally and operationally consistent with product architecture, and exact mutable values are recorded as release evidence rather than permanent technical invariants.

## RSM-120 — Public Alpha / Investor Demo Maturity Gate
**Purpose:** Prove the complete canonical Public Alpha maturity target as a coherent commercial creator product, including all still-open roadmap obligations after any earlier paid Early Access release.  
**Third-party placement:** No new dependency may enter solely to force closure; all shipped components require final artifact-level approval.  
**Key deliverables:**
- Produce at least one representative PS1/early-PS2-inspired horror, mystery, narrative, or liminal game through supported creator workflows.
- Demonstrate create/open/save/migrate/recover, scene and asset authoring, gameplay, camera, presentation, animation, VFX, audio, UI, no-code logic, sequencing, PIE, debugging, validation, cooking, and standalone export.
- Run at least one representative exported player-experience path from Title/New Game or Continue through gameplay/interaction, story/dialogue/objective, inventory/item or puzzle use, save/load/continue, settings/accessibility and a representative death/retry or completion flow.
- Run the editor and exported game on clean supported machines and verify performance, compatibility, security, licenses, notices, and recovery.
- Close all release-critical findings and publish truthful limitations.
**Exit:** RetroStage Maker satisfies the complete Public Alpha / investor-demo maturity gate: a focused, independent creator product whose full RSM-0→120 obligations are proven. Any earlier Early Access release is commercial evidence and customer history, not a substitute for this maturity closure.


---

# Appendix A — Third-Party Placement Summary

Third-party components enter only through their responsible milestone and do not replace the milestone's RetroStage-owned product work.

| Component | Earliest responsible milestone | Primary acceleration | RetroStage-owned responsibility that remains |
|---|---:|---|---|
| Node.js / pnpm / TypeScript | RSM-3 | Toolchain and monorepo | Topology, scripts, source authority, restore proof |
| Electron / Forge / Vite | RSM-5 | Desktop shell and packaging | IPC security, lifecycle semantics, player/editor separation |
| Babylon.js 9 | RSM-6 | Rendering and runtime facilities | Canonical documents, projection, gameplay, diagnostics, parity |
| React / Radix / Golden Layout / react-window | RSM-9 | Editor UI and docking | Product UX, design system, panel semantics, creator workflow |
| Testing Library family | RSM-9 | Maintainable user-oriented React/DOM tests | Product semantics, real-browser/Electron acceptance, accessibility policy |
| Storybook | RSM-9 or later, conditional development-only | Isolated component/state development and visual review | RetroStage design system, product shell, release UI truth |
| dnd-kit family | RSM-13 or later, milestone-gated | Pointer/keyboard-accessible drag/drop primitives | Drop validation, command authority, hierarchy/asset semantics |
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

`07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` was intentionally excluded from the pre-repository sequence. It was created and finalized during RSM-3 after physical repository paths, manifests, scripts, commands, branch state, clean-clone behavior, and restore evidence existed; it is now materialized authority in the final reboot source package.

RSM-3 may activate only after the source set establishes:

- then-truthful pre-repository state,
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
- RSM-120 remains the complete public-quality Alpha maturity and investor-demo product gate; an earlier POST-RSM-78 Early Access release does not pre-close it.
