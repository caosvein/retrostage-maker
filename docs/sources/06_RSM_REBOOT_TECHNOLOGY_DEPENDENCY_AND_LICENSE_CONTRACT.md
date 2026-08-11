# RetroStage Maker — Technology, Dependency, and Commercial License Contract

**Document ID:** `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT`  
**Role:** Authoritative technology baseline, dependency-admission policy, licensing contract, and third-party integration boundary  
**Project:** RetroStage Maker  
**Distribution intent:** Commercial proprietary desktop creator distributed through Steam and other approved Windows channels  
**Document date:** 2026-08-05  
**Document state:** `ACTIVE TECHNOLOGY/DEPENDENCY CONTRACT / RSM-3 DEVELOPMENT TOOLCHAIN BASELINE VERIFIED / PRODUCTION DEPENDENCIES MILESTONE-GATED`  
**Repository:** `PRESENT — C:\RetroStage\retrostage-maker`  
**Primary branch:** `main`  
**Governing source:** `00_RSM_REBOOT_PROJECT_CHARTER.md`  
**Verification scope:** RSM-3 established and verified the repository, lockfile, development-tool dependency baseline, compliance evidence, SBOM/notices, and audit gates; later production dependency admission remains milestone-owned and final packaged-artifact approval remains repository- and lockfile-dependent  
**Supersedes:** Pre-loss live dependency manifests, package-version assumptions, and technology-state claims  
**Preserves:** Approved Babylon.js/Electron direction, RetroStage-owned canonical data, evidence-driven dependency review, commercial license discipline, and source-of-truth separation

---

## 1. Purpose of This Document

This document defines the approved reboot technology stack for RetroStage Maker and establishes the rules under which third-party libraries, frameworks, tools, native binaries, WebAssembly modules, codecs, build systems, and external SDKs may enter the product.

It is authoritative for:

- the sole approved editor and rendering foundations,
- the initial programming-language and workspace toolchain,
- approved foundation dependencies,
- milestone-gated dependencies,
- conditional dependencies requiring separate audit,
- rejected or non-baseline technology choices,
- dependency ownership and adapter boundaries,
- exact-version and lockfile policy,
- commercial license allowlists and review classes,
- transitive dependency and binary review,
- SBOM and third-party notice generation,
- Electron security and distribution obligations,
- dependency change, update, removal, and replacement control.

This document is not:

- proof that any package has been installed,
- proof that a repository exists,
- a replacement for the current or future `pnpm-lock.yaml`,
- final legal advice,
- permission to copy code from an unlicensed repository,
- permission to package every tool mentioned as a candidate,
- proof that a dependency works across Editor Preview, PIE, and Export,
- permission for a third-party library to become canonical project authority.

The current and future repository, exact manifests, lockfile, packaged artifacts, generated SBOM, native-binary inventory, and release notices remain the final implementation evidence.

---

## 2. Governing Relationship to the Reboot Charter

This contract implements the technology and third-party boundaries established by `00_RSM_REBOOT_PROJECT_CHARTER.md`.

The following charter rules are binding here:

1. RetroStage Maker is an independent commercial creator, not a rebranded third-party editor.
2. Electron is the approved desktop application shell.
3. Babylon.js 9 is the sole approved 3D rendering and runtime-adapter foundation for the reboot baseline.
4. TypeScript is the primary implementation language.
5. RetroStage-owned canonical documents, stable identities, commands, validation rules, runtime semantics, and export policy remain authoritative.
6. Babylon objects are derived Preview or runtime state, not canonical authoring data.
7. Electron is a platform shell and security boundary, not a project or gameplay authority.
8. React is an editor UI technology, not a canonical storage model.
9. No second engine, renderer, or canonical scene system may be introduced without formal charter-level change control.
10. Third-party components may act only as subsystem adapters, editor infrastructure, pipeline accelerators, or quality/build/security/compliance tools.
11. Native cinematic authoring remains a RetroStage capability; no hypothetical companion product is part of the approved stack.
12. The exported player must not include the editor, development tools, Babylon Inspector, source assets, or unnecessary authoring dependencies.

When this document conflicts with the charter, the charter wins. When this document conflicts with a current or future live repository manifest, the conflict must be resolved explicitly; neither source silently overrides the other.

---

## 3. Current Verification Scope and Physical Boundary

The original pre-repository approval distinguished approved direction from physical installation. Current truth is:

```text
Live repository: PRESENT — C:\RetroStage\retrostage-maker
RSM-3 repository and lockfile baseline: ESTABLISHED / VERIFIED
RSM-3 development-tool dependencies: ESTABLISHED / VERIFIED
RSM-3 compliance, SBOM/notices, and audit gates: ESTABLISHED / VERIFIED
Later production dependencies: MILESTONE-GATED / NOT ADMITTED BY THIS SOURCE UPDATE
Approved technology direction: YES
Exact lockfile authority: CURRENT REPOSITORY
Packaged product artifact: NONE
Final production transitive license audit: MILESTONE-GATED
Final production native/WASM inventory: MILESTONE-GATED
Final Steam release approval: NOT YET POSSIBLE
```

This contract therefore distinguishes between:

- **approved direction** — a technology or package family may be used,
- **bootstrap candidate version** — the upstream version family originally verified when creating the repository or later re-verified at the owning admission milestone,
- **locked repository version** — the exact version later recorded in manifests and `pnpm-lock.yaml`,
- **release-approved artifact** — the exact dependency graph and packaged binaries that pass final audit.

No approved direction may be described as physically installed unless repository, lockfile, and artifact evidence establishes it. Physical repository truth outranks planning claims.

---

## 4. Binding Technology Decision

The reboot baseline is:

```text
RetroStage Maker Editor
├─ Electron desktop shell
│  ├─ Main process
│  ├─ sandboxed Preload bridge
│  └─ sandboxed Renderer process
├─ React editor interface
├─ RetroStage canonical documents and commands
├─ Babylon.js 9 renderer/runtime adapter
├─ RetroStage asset pipeline
└─ RetroStage validation, diagnostics, and export pipeline

RetroStage Exported Player — v0 direction
├─ Separate minimal Electron player application
├─ Babylon.js 9 runtime adapter
├─ RetroStage runtime core
└─ Cooked project content only
```

### 4.1 Sole engine and renderer decision

Babylon.js 9 is the only approved rendering/runtime-adapter foundation.

The following are not part of the reboot baseline:

- Godot,
- Stride,
- Unity,
- Unreal Engine,
- Wicked Engine,
- Bevy,
- O3DE,
- Flax,
- a second JavaScript renderer,
- a parallel native scene engine,
- a hidden second canonical scene graph.

A future native player host may be investigated only if measured package size, memory, performance, platform, or commercial requirements justify it. Such an investigation must preserve the same RetroStage canonical documents and runtime semantics and requires a formal product and architecture decision. It is not part of the initial roadmap baseline.

### 4.2 Product identity decision

Users must interact with:

- RetroStage project formats,
- RetroStage terminology,
- RetroStage Hierarchy,
- RetroStage Inspector,
- RetroStage Content Browser,
- RetroStage validation and Project Doctor,
- RetroStage Preview, PIE, and Export flows.

Users must not be required to operate:

- Babylon Playground,
- Babylon Sandbox,
- Babylon Inspector in production,
- a third-party engine editor,
- a third-party canonical project format.

---

## 5. Technology Layers and Authorities

| Layer | Approved technology | Authority boundary |
|---|---|---|
| Desktop shell | Electron | Windowing, process lifecycle, filesystem mediation, native dialogs, worker/process orchestration, packaging hooks |
| Editor renderer process | React + browser platform | Panels, controls, authoring views, viewport composition, transient presentation state |
| 3D viewport/runtime adapter | Babylon.js 9 | Derived render objects, cameras, materials, animation playback, particles, picking, gizmos, GPU execution |
| Canonical domain | RetroStage TypeScript packages | Project, scene, entity, component, asset, presentation, sequence, UI, runtime-setting documents |
| Mutation authority | RetroStage commands/session layer | Typed and validated authoring changes, revisions, undo/redo integration |
| Runtime semantics | RetroStage runtime packages | Game session, systems, events/actions, scene flow, save-state policy |
| Validation | RetroStage validation packages | Semantic correctness, capability truth, Play blockers, Export blockers, diagnostics |
| Asset cooking | RetroStage pipeline + approved accelerators | Source/cooked separation, import settings, stable asset identity, deterministic derived content |
| Build and release | pnpm + Vite + Electron Forge + CI tools | Reproducible compilation, testing, packaging, reports, SBOM, notices |

No row in this table authorizes a third-party component to own a responsibility assigned to RetroStage.

---

## 6. Dependency Classification Vocabulary

Every dependency must be classified before admission.

### 6.1 `FOUNDATION_RUNTIME`

Required by the editor or exported player at runtime from the first vertical slice.

Examples:

- Electron,
- Babylon.js core packages,
- React,
- runtime schema validation needed by production code.

### 6.2 `FOUNDATION_EDITOR`

Required by the editor interface but not necessarily by the exported player.

Examples:

- Radix UI,
- Golden Layout,
- react-window,
- Zustand,
- XState.

### 6.3 `FOUNDATION_BUILD`

Required from repository bootstrap for building, testing, linting, packaging, architecture validation, and compliance.

Examples:

- TypeScript,
- Vite,
- Vitest,
- Playwright,
- ESLint,
- dependency-cruiser,
- Knip,
- CycloneDX tooling.

### 6.4 `MILESTONE_GATED`

Approved in principle but forbidden from installation until its responsible roadmap milestone opens and its adapter contract is approved.

Examples:

- Havok physics,
- SQLite index,
- React Flow,
- Monaco Editor,
- Recast/Detour,
- OpenTelemetry core/local instrumentation.

Remote OpenTelemetry exporters and hosted telemetry services are not covered by this milestone-gated approval; they remain `CONDITIONAL_AUDIT` under RSM-115.

### 6.5 `CONDITIONAL_AUDIT`

Not approved for packaging until exact binaries, subcomponents, licenses, patents, distribution terms, and deterministic behavior are inspected.

Examples:

- KTX-Software and `toktx`,
- Basis Universal tools,
- Draco binaries,
- FFmpeg or codec-enabled builds,
- installer makers with bundled native tools,
- code-signing utilities,
- Steamworks SDK,
- arbitrary prebuilt native or WebAssembly modules.

### 6.6 `DEVELOPMENT_ONLY`

May be installed for development or testing but must not enter editor/player production packages unless separately approved.

Examples:

- Babylon Inspector,
- Playwright browsers and test harness,
- Vitest,
- lint and architecture tools,
- source-map inspection utilities.

### 6.7 `NOT_BASELINE`

Not selected for the initial stack. It may be reconsidered only after a proven need.

Examples:

- Immer,
- Redux,
- MobX,
- Next.js,
- Tailwind CSS,
- Material UI,
- Ant Design,
- Bootstrap,
- msgpackr.

### 6.8 `REJECTED`

Conflicts with the charter, duplicates an authority, has unacceptable licensing, or introduces unjustified product risk.

Examples:

- a second engine or renderer,
- unlicensed GitHub code,
- dependencies restricted to non-commercial use,
- direct use of Babylon serialization as the canonical project format.

---

## 7. Version and Reproducibility Policy

### 7.1 Exact pinning

All direct dependencies must use exact versions in repository manifests.

Production, development, native, and WebAssembly dependencies must not use:

```text
^
~
*
latest
next
beta
rc
Git branch references
floating Git commit references
unversioned downloaded binaries
```

Approved internal workspace dependencies must use explicit `workspace:` references under a documented policy.

### 7.2 Lockfile

The repository must commit one authoritative `pnpm-lock.yaml`.

A dependency graph is not approved merely because `package.json` looks acceptable. The lockfile and installed graph must also pass review.

### 7.3 Toolchain and admitted-dependency identity

RSM-3 must establish and commit:

- the exact Node.js release,
- the exact pnpm release,
- the `packageManager` field,
- a Node version file such as `.node-version`,
- the exact TypeScript release and approved RSM-3 development-tool versions.

Later milestones must establish and commit exact versions only when their dependency families are admitted:

- Electron, Electron Forge, and Vite at RSM-5,
- Babylon packages on one compatible exact line at RSM-6,
- React, React DOM, Radix, Golden Layout, and react-window at RSM-9,
- TypeBox and Ajv at RSM-11,
- all later milestone-gated packages at their owning milestone.

### 7.4 Historical pre-repository verification snapshot

The following versions were verification candidates on 2026-08-05. They are not proof of installation. RSM-3 toolchain candidates were rechecked during repository bootstrap; every later candidate must be rechecked immediately before its owning milestone admits the dependency.

| Technology | Reboot candidate baseline | Locking rule |
|---|---:|---|
| Node.js | `24.18.1` LTS | Exact external toolchain version |
| Electron | `43.3.0` | Exact dependency |
| Babylon.js modular packages | `9.19.1` | Exact and aligned across official packages |
| TypeScript | `6.0.3` | Exact development dependency |
| React | Latest patched `19.2.x` | Exact patch selected at RSM-9 |
| React DOM | Same release as React | Exact and aligned at RSM-9 |
| Vite | Latest supported `8.2.x` | Exact patch selected at RSM-5 |
| pnpm | Current supported stable compatible with Node 24 | Exact release selected and recorded at bootstrap |

### 7.5 Upgrade control

Dependency upgrades must be isolated changes with:

- upstream changelog review,
- license and transitive graph comparison,
- production bundle comparison,
- native/WASM inventory comparison,
- typecheck,
- architecture checks,
- unit and integration tests,
- Electron E2E smoke,
- Preview/PIE/Export regression as relevant,
- updated SBOM and notices,
- rollback instructions.

Automatic major-version upgrades are prohibited. Security fixes may be expedited but must not bypass verification.

---

## 8. Approved Foundation Platform Stack

### 8.1 Node.js

**Classification:** `FOUNDATION_BUILD` and Electron Main runtime basis  
**License:** MIT  
**Approved major line:** Node.js 24 LTS  
**Responsibility:** build tooling, Electron Main code, scripts, asset jobs, tests, and approved worker processes

Rules:

- Node APIs must not be exposed directly to the Electron Renderer.
- The repository toolchain version and Electron-embedded Node version must be documented separately even when they are on the same major line.
- No package may assume unrestricted filesystem access from browser-facing code.

### 8.2 pnpm

**Classification:** `FOUNDATION_BUILD`  
**License:** MIT  
**Responsibility:** monorepo workspace management, deterministic dependency installation, lockfile authority, scripts, and package linking

Rules:

- one root workspace,
- one committed lockfile,
- no mixed npm/yarn lockfiles,
- no unreviewed install scripts,
- production dependency changes require explicit review,
- exact pnpm version recorded through `packageManager`.

### 8.3 TypeScript

**Classification:** `FOUNDATION_BUILD` and implementation language  
**License:** Apache-2.0  
**Approved major line:** TypeScript 6  
**Responsibility:** typechecked production and tooling code

Rules:

- strict mode is mandatory,
- `skipLibCheck` may not be used to hide unresolved production type conflicts without an approved exception,
- generated types must not become a substitute for runtime validation,
- unsafe `any` boundaries require explicit adapter ownership.

---

## 9. Electron Desktop Shell Contract

### 9.1 Packages

Approved package family:

```text
electron
@electron-forge/core
@electron-forge/plugin-vite
```

Additional Forge makers or publishers are not automatically approved. They are selected only when the Windows installer and Steam distribution plan is ready for audit.

### 9.2 Classification and license

| Component | Classification | License | Initial distribution scope |
|---|---|---|---|
| Electron | `FOUNDATION_RUNTIME` | MIT plus bundled third-party notices | Editor and v0 player |
| Electron Forge core | `FOUNDATION_BUILD` | MIT | Build only |
| Electron Forge Vite plugin | `FOUNDATION_BUILD` | MIT | Build only |

### 9.3 Process architecture

The required architecture is:

```text
Electron Main
    ↓ validated IPC handlers
Preload / contextBridge
    ↓ minimal typed RetroStage API
Renderer
```

Binding security defaults:

- `nodeIntegration: false`,
- `contextIsolation: true`,
- renderer sandboxing enabled,
- restrictive Content Security Policy,
- no raw Electron API exposure,
- no generic `invoke(channel, payload)` bridge,
- narrow typed methods only,
- sender/frame validation for privileged IPC,
- runtime schema validation for all IPC inputs and outputs,
- no direct renderer filesystem access,
- no remote content with privileged access,
- navigation and new-window restrictions,
- no silent shell execution,
- normalized and workspace-scoped paths,
- privileged operations logged with correlation identifiers.

### 9.4 Electron ownership

Electron may own:

- windows,
- menus and approved native dialogs,
- application lifecycle,
- workspace locks,
- filesystem transactions,
- worker/child-process orchestration,
- packaging hooks,
- local recovery storage.

Electron may not own:

- canonical scene semantics,
- component definitions,
- gameplay behavior,
- validation truth,
- project identity rules,
- authoring mutation semantics.

### 9.5 Distribution obligations

Electron packages Chromium, Node.js, and other third-party components. Release packaging must retain or reproduce applicable notices, including Electron's license and Chromium third-party license material.

At minimum, release evidence must confirm the inclusion or reproduction of:

```text
Electron LICENSE
LICENSES.chromium.html or equivalent generated third-party notice coverage
RetroStage THIRD_PARTY_NOTICES.html
```

Removing bundled notice files to reduce package size is prohibited.

---

## 10. Babylon.js 9 Renderer and Runtime-Adapter Contract

### 10.1 Approved packages

```text
@babylonjs/core
@babylonjs/loaders
@babylonjs/materials
@babylonjs/serializers
```

Development-only candidate:

```text
@babylonjs/inspector
```

### 10.2 License

The official Babylon.js repository and modular packages are governed by Apache-2.0, subject to package-specific verification and retained notices.

### 10.3 Package policy

- Use official scoped modular packages.
- Do not use the legacy monolithic `babylonjs` package in parallel.
- Keep official Babylon packages on one compatible exact version line unless upstream explicitly requires otherwise.
- `@babylonjs/serializers` is permitted for conversion, debugging, or derived output only.
- `@babylonjs/inspector` is development-only and forbidden from production editor and player artifacts.
- `react-babylonjs` is not part of the baseline; the renderer adapter remains RetroStage-owned.

### 10.4 Canonical boundary

The only approved data direction is:

```text
RetroStage canonical documents
→ validated projection input
→ RetroStage Babylon adapter
→ Babylon scene/runtime objects
```

Forbidden patterns:

```text
Babylon scene serialization = .rsmscene
Babylon node object = canonical entity
Babylon material object = canonical material document
Babylon object identity = persistent project reference
Babylon scene mutation = implicit authoring mutation
```

A user edit observed through viewport interaction must become a typed RetroStage command and pass validation before canonical state changes.

### 10.5 Babylon responsibilities

Babylon may provide:

- WebGPU/WebGL execution,
- scene rendering,
- cameras,
- lights and shadows,
- materials and textures,
- animation playback,
- particles and VFX primitives,
- picking and gizmos,
- frame-graph and post-process execution,
- loading of supported cooked assets,
- debug rendering in development.

RetroStage remains responsible for:

- stable IDs,
- project and scene documents,
- component registry,
- semantic validation,
- authoring commands,
- runtime systems,
- save-state policy,
- asset identity and import settings,
- Preview/PIE/Export parity,
- performance and compatibility profiles,
- creator-facing diagnostics.

---

## 11. React Editor UI Contract

### 11.1 Approved foundation packages

```text
react
react-dom
@vitejs/plugin-react
selected @radix-ui/react-* packages
golden-layout
react-window
```

### 11.2 Licenses

| Component | License | Status |
|---|---|---|
| React / React DOM | MIT | Approved |
| Radix UI Primitives | MIT | Approved |
| Golden Layout | MIT | Approved |
| react-window | MIT | Approved |
| Vite React plugin | MIT | Approved with build-tool family |

### 11.3 Responsibilities

React and approved UI libraries may provide:

- panel composition,
- Hierarchy and Inspector views,
- Content Browser and Problems views,
- dialogs, menus, tabs, tooltips, focus behavior,
- docking and workspace layout,
- virtualized large lists,
- Creator Stage views,
- diagnostics and export UI.

They may not define:

- canonical scene or project state,
- component meaning,
- save format,
- command semantics,
- runtime capability truth.

### 11.4 Styling decision

The baseline styling system is:

```text
CSS custom properties
+ CSS Modules
+ RetroStage-owned design tokens
+ RetroStage-owned editor components
```

The following are not baseline dependencies:

- Tailwind CSS,
- Material UI,
- Ant Design,
- Bootstrap,
- a third-party visual theme that makes the product resemble another editor.

Their licenses are not the primary reason for exclusion. They are omitted to protect visual ownership and reduce dependency surface.

### 11.5 Docking boundary

Golden Layout state is editor preference data, not project content.

```text
Golden Layout model
→ local workspace preference

RetroStage project documents
→ canonical authoring content
```

Workspace layout must be wrapped by a RetroStage adapter so Golden Layout may be replaced without migrating game projects.

---

## 12. State, Workflow, and Mutation Contract

### 12.1 Zustand

**Classification:** `FOUNDATION_EDITOR`  
**License:** MIT  
**Use:** transient editor state

Approved examples:

- current selection reference,
- active panel,
- hover/focus state,
- temporary filters,
- viewport display options,
- local UI preferences.

Forbidden uses:

- canonical project ownership,
- direct `SceneDocument` mutation,
- save authority,
- undo/redo truth,
- runtime session authority.

### 12.2 XState

**Classification:** `FOUNDATION_EDITOR` with shared workflow use  
**License:** MIT  
**Use:** explicit lifecycle and workflow state machines

Approved targets include:

- project open/close,
- save transaction,
- asset import,
- PIE start/stop,
- export/build,
- recovery,
- cancellable background jobs,
- editor mode transitions.

XState may define lifecycle truth but not canonical project content.

### 12.3 RetroStage command authority

Canonical authoring mutations must pass through RetroStage-owned typed commands or an equivalent approved authoritative session API.

Examples:

```text
CreateEntityCommand
DeleteEntityCommand
AddComponentCommand
ReplaceComponentCommand
MoveEntityCommand
SetParentCommand
ImportAssetCommand
ApplyPresentationProfileCommand
```

No UI, Babylon callback, file watcher, template, plugin, MCP tool, or future agent may bypass this mutation boundary.

### 12.4 Immer decision

Immer is not part of the foundation baseline.

It may be reconsidered only when a responsible milestone proves that explicit immutable update code has become materially unsafe or unmaintainable. If adopted, it remains an implementation helper inside command handlers and never becomes mutation authority.

---

## 13. Schema, Runtime Validation, and Migration Contract

### 13.1 Approved technologies

```text
TypeBox upstream package family
Ajv
```

**Licenses:** MIT

### 13.2 TypeBox package-name gate

The upstream TypeBox project has undergone package and API evolution. The repository must select exactly one supported package identity during bootstrap.

Provisional direction:

```text
typebox
```

The following are prohibited:

- installing `typebox` and `@sinclair/typebox` simultaneously,
- mixing schema APIs from incompatible major lines,
- silently migrating package identity without document and fixture review.

RSM repository bootstrap must close the package-name decision by testing current upstream API compatibility with Ajv, generated types, serialization fixtures, and Electron bundling.

### 13.3 Ajv responsibilities

Ajv may validate:

- project and scene document shape,
- component envelopes,
- asset metadata,
- IPC payloads,
- import/export manifests,
- sequence and UI documents,
- agent/MCP command payloads.

Ajv does not provide semantic validation. RetroStage remains responsible for questions such as:

- does a referenced scene exist,
- is a component permitted by the selected GameProfile,
- is a stable reference valid,
- is the project safe to Play or Export,
- is an asset stale or missing,
- is a runtime state serializable.

### 13.4 Migration rule

Schema validation is not migration.

The approved flow is:

```text
Read bytes
→ parse document envelope
→ identify schema version
→ apply explicit ordered migrations
→ validate migrated structure
→ run semantic validation
→ admit canonical document
```

Every migration must have fixtures, deterministic output, and compatibility evidence.

---

## 14. Filesystem, Archive, Logging, and Local Index Contract

### 14.1 Chokidar

**Classification:** `FOUNDATION_RUNTIME` for editor-side file observation  
**License:** MIT  
**Use:** project and source-asset change detection

File events must pass through:

```text
observe
→ normalize
→ debounce
→ inspect/hash
→ classify
→ request approved reload/reimport/change review
```

A filesystem event must never directly mutate canonical content.

### 14.2 fflate

**Classification:** `FOUNDATION_RUNTIME` or shared utility  
**License:** MIT  
**Use:** ZIP-based recovery bundles, project archives, diagnostic bundles, and approved package helpers

Open directory-based project layout remains canonical during authoring. ZIP is a transport/archive format, not the live project database.

### 14.3 Pino

**Classification:** `FOUNDATION_RUNTIME` and build tooling  
**License:** MIT  
**Use:** structured logging for editor, asset jobs, runtime, export, recovery, and diagnostics

Minimum structured fields should include:

```text
timestamp
eventName
severity
projectId when available
operationId / correlationId
component or subsystem
durationMs when applicable
errorCode when applicable
sanitized details
```

Sensitive paths, user content, or personal data must not be uploaded without the later telemetry/privacy contract.

### 14.4 better-sqlite3

**Classification:** `MILESTONE_GATED`  
**License:** MIT  
**Expected milestone:** workspace index and Content Browser  
**Nature:** native Node addon

Permitted uses:

- asset index,
- reference index,
- search cache,
- import history,
- thumbnail metadata,
- rebuildable diagnostic index.

Forbidden use:

```text
SQLite database = canonical RetroStage project
```

Required invariant:

```text
.rsmproject / .rsmscene / related documents = canonical
SQLite = disposable, rebuildable local index/cache
```

Because `better-sqlite3` contains native code, adoption requires Electron ABI verification, exact prebuilt/source-build inventory, packaged-binary hashing, and clean-machine testing.

---

## 15. Asset Pipeline Contract

### 15.1 Approved milestone-gated packages

```text
@gltf-transform/core
@gltf-transform/functions
@gltf-transform/extensions
meshoptimizer
```

**Classification:** `MILESTONE_GATED` at RSM-75  
**Licenses:** MIT

These packages are approved in principle but must not be installed during RSM-3 merely because they appear in this contract. They enter when the RSM-75 asset-pipeline task opens, or through an earlier formally approved roadmap change supported by a proven vertical-slice need.

### 15.2 Pipeline direction

```text
Source asset
→ source registration and stable AssetId
→ import settings
→ format inspection
→ validation
→ normalization
→ approved optimization
→ cooked derivative
→ runtime manifest
→ Babylon loader
```

### 15.3 glTF-Transform responsibilities

It may accelerate:

- glTF inspection,
- structured transformation,
- extension handling,
- cleanup,
- normalization,
- deterministic conversion steps,
- metadata and reference operations.

It does not own:

- `AssetId`,
- source/cooked authority,
- reimport semantics,
- import settings documents,
- creator-facing diagnostics,
- project reference policy.

### 15.4 meshoptimizer responsibilities

It may accelerate:

- vertex-cache optimization,
- vertex-fetch optimization,
- index/vertex compression,
- simplification and LOD assistance,
- runtime mesh-size reduction.

RetroStage owns quality tiers, creator preview, compatibility fallbacks, warning/blocker policy, and export decisions.

### 15.5 External command prohibition

The MIT license of a JavaScript orchestration package does not automatically approve every external executable it can invoke.

The asset pipeline may not silently download or invoke:

- `toktx`,
- Basis encoders,
- Draco binaries,
- FFmpeg,
- proprietary converters,
- arbitrary GitHub releases,
- untracked native utilities.

Each tool requires explicit conditional audit.

---

## 16. Physics and Navigation Dependencies

### 16.1 Babylon Havok package

Approved candidate:

```text
@babylonjs/havok
```

**Classification:** `MILESTONE_GATED`  
**License:** MIT as published by the official package  
**Candidate version at verification:** `1.3.13`  
**Expected milestone:** collision, grounding, triggers, and constrained physics

It may provide:

- collision shapes,
- raycasts and overlap queries,
- grounding support,
- rigid and kinematic bodies,
- trigger volumes,
- constrained prop simulation.

RetroStage remains responsible for:

- collision channels,
- interaction semantics,
- authoring components,
- save policy,
- debug views,
- gameplay rules,
- performance budgets.

The package must not be installed during repository bootstrap unless the first approved vertical slice explicitly requires it.

### 16.2 Recast/Detour

**Classification:** `MILESTONE_GATED`  
**License:** Zlib for the upstream Recast Navigation project  
**Expected milestone:** navigation and patrol authoring/runtime

The exact JavaScript/WebAssembly adapter is not yet approved. Before adoption, the milestone must verify:

- adapter package identity,
- adapter license,
- upstream source provenance,
- native/WASM binary contents,
- deterministic navmesh cooking,
- worker strategy,
- Babylon integration boundary.

Upstream Recast/Detour approval does not automatically approve every wrapper distributed under a similar name.

---

## 17. Future Authoring and Diagnostic Dependencies

### 17.1 React Flow

Approved candidate:

```text
@xyflow/react
```

**Classification:** `MILESTONE_GATED`  
**License:** MIT for the open-source core  
**Expected milestone:** Flow Graph editor

It may provide graph-canvas interaction, nodes, edges, selection, panning, zooming, and connection handles.

It may not define:

- Event/Action semantics,
- runtime execution,
- cycle policy,
- execution budgets,
- graph serialization,
- migration,
- validation,
- debugging truth.

Paid templates, Pro assets, hosted services, or separately licensed content are not approved by the core MIT decision.

### 17.2 Monaco Editor

Approved candidate:

```text
monaco-editor
```

**Classification:** `MILESTONE_GATED`  
**License:** MIT  
**Expected use:** raw document inspection, advanced logs, optional constrained text or script surfaces

Monaco is not approved as evidence that RetroStage will become a general scripting IDE. Visual Studio Code branding, extensions, marketplace content, and Microsoft-distributed binaries are separate from Monaco and are not approved by this decision.

### 17.3 OpenTelemetry JavaScript

**Classification:** `MILESTONE_GATED`  
**License:** Apache-2.0  
**Expected use:** local performance spans and diagnostic traces

No external telemetry export may be enabled before the privacy and telemetry milestone defines consent, retention, transport, redaction, and user controls.

### 17.4 msgpackr

**Classification:** `NOT_BASELINE`  
**License:** MIT  
**Possible use:** large IPC or temporary cache payloads if measurement proves JSON inadequate

Adoption conditions:

- measured bottleneck,
- canonical JSON documents remain unchanged,
- protocol versioning,
- fallback and corruption handling,
- optional `msgpackr-extract` native addon audited separately.

---

## 18. KTX, Texture Compression, Codec, and Media Tool Policy

### 18.1 KTX-Software

**Classification:** `CONDITIONAL_AUDIT`  
**Current status:** not approved for product packaging  
**Reason:** mixed-license repository and binary composition

The KTX-Software project states that files unique to the project are generally Apache-2.0, while numerous third-party licenses exist and at least one referenced source file is not open source. Therefore, the project may not be treated as one uniformly Apache-2.0 dependency.

Before any KTX tool or library is admitted, the responsible milestone must:

1. identify the exact executable/library and version,
2. identify every source file and bundled library included in that artifact,
3. generate or verify SPDX/REUSE output,
4. exclude non-open-source or incompatible subcomponents,
5. inspect patents and codec implications,
6. archive license and notice texts,
7. hash the binary,
8. verify deterministic output,
9. test fallback textures,
10. obtain manual license approval.

### 18.2 Basis Universal, Draco, and image codecs

These are not foundation dependencies.

Each candidate must be reviewed for:

- source license,
- encoder and decoder separation,
- patent considerations,
- bundled binary provenance,
- WebAssembly content,
- runtime distribution requirements,
- texture/mesh fallback strategy.

### 18.3 FFmpeg and media codecs

FFmpeg or any media toolchain is `CONDITIONAL_AUDIT`.

No arbitrary FFmpeg binary may be copied into the project. Review must include:

- exact build configuration,
- LGPL/GPL component selection,
- codec and patent exposure,
- dynamic/static linking implications,
- source-offer or relinking obligations where relevant,
- platform distribution scope.

The initial product should prefer simple supported audio/image formats that do not require an expanded codec toolchain.

---

## 19. Build, Test, and Architecture Tooling

### 19.1 Vite

**Classification:** `FOUNDATION_BUILD`  
**License:** MIT  
**Approved major line:** Vite 8  
**Use:** Electron renderer development server, HMR, and production build

Vite is a build tool only. It must not define product architecture or introduce server-side framework assumptions.

### 19.2 Vitest

**Classification:** `FOUNDATION_BUILD` / `DEVELOPMENT_ONLY`  
**License:** MIT  
**Use:** domain, schema, migration, command, validation, asset-pipeline, and architecture fixtures

Vitest does not replace real Electron integration or packaged-player testing.

### 19.3 Playwright

**Classification:** `FOUNDATION_BUILD` / `DEVELOPMENT_ONLY`  
**License:** Apache-2.0  
**Use:** Electron E2E and clean-flow automation

Expected scenarios include:

- create project,
- create scene/entity/component,
- edit through Inspector,
- save and reopen,
- Preview selection and transform,
- PIE start/stop,
- asset import,
- export/build flow,
- recovery and failure surfaces.

Playwright binaries and test harnesses must not enter production packages.

### 19.4 ESLint and typescript-eslint

**Classification:** `FOUNDATION_BUILD`  
**Licenses:** MIT  
**Use:** correctness policy, forbidden patterns, unsafe boundary detection, and project conventions

### 19.5 Prettier

**Classification:** `FOUNDATION_BUILD`  
**License:** MIT  
**Use:** deterministic source formatting

### 19.6 dependency-cruiser

**Classification:** `FOUNDATION_BUILD`  
**License:** MIT  
**Use:** package boundaries, forbidden dependency directions, circular imports, and adapter discipline

Minimum forbidden-direction checks must include:

```text
headless domain → Electron
headless domain → DOM
headless domain → Babylon
runtime core → editor UI
canonical documents → Babylon
packages → applications
renderer adapter → editor-private mutation implementation
```

### 19.7 Knip

**Classification:** `FOUNDATION_BUILD`  
**License:** ISC  
**Use:** unused dependencies, files, and exports

Knip findings must be reviewed; generated entry points and Electron packaging hooks may require explicit configuration rather than blanket ignore rules.

---

## 20. Packaging and Windows Distribution

### 20.1 Editor and player separation

The initial monorepo must plan separate applications:

```text
apps/editor-electron
apps/player-electron
```

The player must not package:

- editor panels,
- Content Browser,
- raw authoring documents unless explicitly required by runtime format,
- Babylon Inspector,
- source assets,
- test tools,
- lint/build tools,
- developer-only source maps in public release,
- project migration tools not required by runtime.

### 20.2 Electron Forge

Electron Forge core and the Vite plugin are approved build foundations.

The exact installer maker remains open because different makers may introduce different:

- native dependencies,
- license obligations,
- signing behavior,
- installer capabilities,
- maintenance risk.

The installer decision must be closed before the app-distribution milestone.

### 20.3 Steam

Steam is a distribution channel, not canonical project authority.

The Steamworks SDK is not part of the foundation stack. It is `CONDITIONAL_AUDIT` and may be added only for a defined feature such as:

- Steam build upload workflow,
- achievements,
- cloud saves,
- workshop or approved content distribution,
- controller/device integration where justified.

Steam-specific integration must be isolated behind a RetroStage platform adapter and governed by Valve's current SDK terms.

Exported user games must not require Steam unless the creator explicitly enables a supported Steam integration and satisfies applicable distribution terms.

---

## 21. License Classification Policy

### 21.1 Automatically admissible license families

The following may be admitted after exact package, copyright, transitive, and binary review:

```text
MIT
Apache-2.0
BSD-2-Clause
BSD-3-Clause
ISC
Zlib
0BSD
CC0-1.0
Unlicense / clearly documented public-domain dedication
```

“Automatically admissible” does not mean obligation-free. Required notices, attribution, copyright text, NOTICE files, and patent clauses must still be honored.

### 21.2 Manual review license families

The following require explicit manual legal/license review before use:

```text
MPL-2.0
LGPL-2.0-or-later
LGPL-3.0-or-later
EPL
CDDL
SIL Open Font License
mixed or multiple licenses
custom licenses
source-available licenses
native binary redistributions
WebAssembly blobs without source provenance
codec or patent-sensitive components
```

### 21.3 Prohibited by default

The following are prohibited unless a formal legal decision and product exception explicitly approves them:

```text
GPL-2.0
GPL-3.0
AGPL
SSPL
Commons Clause
Business Source License
PolyForm licenses
Non-Commercial restrictions
No-Derivatives restrictions
field-of-use restrictions
unknown/custom terms that do not clearly permit the intended use
No License
```

A public GitHub repository without a license does not grant permission to copy, modify, or distribute its code.

### 21.4 Asset licenses are separate

Code dependency approval does not approve:

- sample models,
- textures,
- sound effects,
- music,
- fonts,
- icons,
- screenshots,
- demo projects,
- generated training material.

Every distributed asset requires its own source, author, license, modification, attribution, and redistribution record.

---

## 22. Direct Dependency License Matrix

The following matrix records the approved or planned direct-dependency position as of the document date.

| Component / family | Planned role | Classification | Upstream license | Decision | Key obligations or limits |
|---|---|---|---|---|---|
| Node.js | Toolchain and Electron Main basis | Foundation | MIT | Approved | Preserve applicable notices; pin exact release |
| pnpm | Workspace/package manager | Foundation build | MIT | Approved | Commit lockfile; pin package-manager version |
| TypeScript | Primary language/compiler | Foundation build | Apache-2.0 | Approved | Retain license/NOTICE coverage as applicable |
| Electron | Desktop shell and v0 player host | Foundation runtime | MIT plus bundled notices | Approved | Preserve Electron/Chromium third-party notices |
| Electron Forge core | Packaging orchestration | Foundation build | MIT | Approved | Exact maker still gated |
| Forge Vite plugin | Electron build integration | Foundation build | MIT | Approved | Build only |
| Vite | Renderer build/HMR | Foundation build | MIT | Approved | Exact supported patch |
| React / React DOM | Editor UI | Foundation runtime/editor | MIT | Approved | Keep versions aligned |
| Radix UI Primitives | Accessible headless controls | Foundation editor | MIT | Approved | Install only selected packages |
| Golden Layout | Docking/workspace layout | Foundation editor | MIT | Approved | Adapter; local preference only |
| react-window | Large-list virtualization | Foundation editor | MIT | Approved | Use where measured/needed |
| Zustand | Transient UI state | Foundation editor | MIT | Approved | Never canonical authority |
| XState | Workflow/lifecycle machines | Foundation editor/shared | MIT | Approved | Never canonical document owner |
| TypeBox upstream | Runtime schema definitions | Foundation runtime/build | MIT | Approved with package-name gate | Use one package identity only |
| Ajv | Runtime JSON Schema validation | Foundation runtime | MIT | Approved | Shape validation, not semantic truth |
| Chokidar | Filesystem observation | Foundation editor runtime | MIT | Approved | Events require review pipeline |
| fflate | ZIP/archive helpers | Foundation runtime | MIT | Approved | Archive/transport only |
| Pino | Structured logging | Foundation runtime/build | MIT | Approved | Privacy/redaction rules apply |
| Babylon.js scoped packages | Renderer/runtime adapter | Foundation runtime | Apache-2.0 | Approved | One aligned version line; retain notices |
| Babylon Inspector | Development diagnostics | Development only | Apache-2.0 | Conditional dev approval | Forbidden from production packages |
| glTF-Transform | Asset transformation | Milestone-gated pipeline | MIT | Approved in principle | Enters at RSM-75; external invoked tools separate |
| meshoptimizer | Mesh optimization | Milestone-gated pipeline | MIT | Approved in principle | Enters at RSM-75; preserve attribution/notice coverage |
| Vitest | Unit/contract tests | Development only | MIT | Approved | Not packaged |
| Playwright | Electron E2E | Development only | Apache-2.0 | Approved | Test binaries not packaged |
| ESLint | Linting | Development only | MIT | Approved | Exact config and plugins audited |
| typescript-eslint | TypeScript lint support | Development only | MIT | Approved | Keep compatible with ESLint/TS |
| Prettier | Formatting | Development only | MIT | Approved | Not packaged |
| dependency-cruiser | Architecture checks | Development only | MIT | Approved | Boundary rules committed |
| Knip | Dead-code/dependency checks | Development only | ISC | Approved | Review false positives explicitly |
| CycloneDX PNPM tooling | SBOM generation | Development/release | Apache-2.0 | Approved family | Exact package/CLI locked at bootstrap |
| GitHub Dependency Review Action | PR dependency gate | CI service/action | GitHub terms + action license | Approved for CI planning | Pin action by immutable commit where policy permits |
| better-sqlite3 | Rebuildable index/cache | Milestone-gated | MIT | Approved in principle | Native addon audit and ABI tests |
| @babylonjs/havok | Physics | Milestone-gated | MIT | Approved in principle | WASM/binary inventory and integration tests |
| Recast/Detour upstream | Navigation | Milestone-gated | Zlib | Approved upstream | Wrapper/adapter separately audited |
| @xyflow/react | Flow Graph canvas | Milestone-gated | MIT | Approved in principle | Core only; Pro content separate |
| monaco-editor | Advanced text/log surfaces | Milestone-gated | MIT | Approved in principle | No VS Code branding/marketplace assumption |
| OpenTelemetry JS | Local traces/metrics | Milestone-gated | Apache-2.0 | Approved in principle | No remote telemetry before privacy contract |
| msgpackr | Optional IPC/cache encoding | Not baseline | MIT | Reconsider only after measurement | Native addon separate |
| KTX-Software / toktx | Texture cooking | Conditional audit | Mixed | Not yet approved | Exact artifact/subcomponent review required |
| Basis Universal | Texture encoding/decoding | Conditional audit | Exact upstream review required | Not yet approved | Patent/binary/runtime review |
| Draco | Mesh compression | Conditional audit | Exact package review required | Not yet approved | JS/WASM/binary/source provenance |
| FFmpeg | Media processing | Conditional audit | Build-dependent LGPL/GPL mix | Not yet approved | Exact build and codec review mandatory |
| Steamworks SDK | Optional Steam integration | Conditional audit | Valve SDK terms | Not foundation | Isolated platform adapter and terms review |

---

## 23. Native and WebAssembly Binary Policy

A JavaScript package containing or downloading native/WASM code requires an additional review class.

The repository must maintain:

```text
native-binary-inventory.json
wasm-module-inventory.json
```

Each entry must record:

- package and exact version,
- binary/module filename,
- platform and architecture,
- SHA-256 hash,
- source repository and release URL,
- source-code availability,
- license and notice location,
- build provenance when available,
- ABI/runtime requirements,
- whether it is packaged in editor, player, or build tools,
- replacement/removal procedure.

Native/WASM candidates include, but are not limited to:

- `better-sqlite3`,
- `@babylonjs/havok`,
- Recast wrappers,
- `msgpackr-extract`,
- KTX tools,
- texture/mesh codecs,
- installer and signing binaries.

No package postinstall script may download an untracked binary without an approved exception and inventory update.

---

## 24. Supply-Chain and Installation Policy

### 24.1 Installation scripts

Dependency lifecycle scripts must be inspected. The repository should use pnpm configuration to minimize unapproved build scripts and explicitly allow only required packages.

### 24.2 Registry and source

Production dependencies should come from the approved npm registry source unless an exception documents:

- why the registry package is insufficient,
- immutable source identity,
- exact commit or release,
- license,
- integrity hash,
- update and removal path.

### 24.3 No copied snippets without provenance

Code copied from forums, gists, Stack Overflow, blog posts, generated examples, or GitHub issues must have compatible licensing and recorded provenance. “Small snippet” is not an automatic exception.

### 24.4 Secrets

No Steam, signing, publishing, or telemetry secret may be committed. CI secrets must use platform secret storage and least privilege.

### 24.5 Action pinning

Third-party CI actions should be pinned to immutable commit SHAs where supported, with periodic reviewed updates.

---

## 25. SBOM, Notice, and Release Evidence

Every release candidate must generate and archive:

```text
bom.cdx.json
THIRD_PARTY_NOTICES.html
dependency-inventory.json
native-binary-inventory.json
wasm-module-inventory.json
license-review.json
packaged-file-inventory.txt
release-toolchain.json
```

### 25.1 Minimum notice content

`THIRD_PARTY_NOTICES.html` must include:

- dependency name,
- exact version,
- copyright holder where stated,
- license identifier,
- required license text or approved link strategy,
- NOTICE content where required,
- distribution scope,
- special attribution obligations.

### 25.2 Artifact-first audit

The final audit must inspect the packaged editor and player, not only source manifests.

It must answer:

- which files physically ship,
- which native/WASM binaries ship,
- whether development-only packages leaked into production,
- whether required notices are present,
- whether source assets or secrets leaked,
- whether unused packages were stripped,
- whether editor-only code entered the player.

---

## 26. Dependency Admission Workflow

No new dependency may be added only because it is popular, convenient, or available on GitHub.

The required sequence is:

```text
1. Define the concrete product or engineering need.
2. Confirm that existing approved dependencies do not already own the responsibility.
3. Identify candidate package and exact release.
4. Inspect upstream ownership, maintenance, release health, and security history.
5. Inspect direct license and copyright.
6. Inspect transitive dependency graph.
7. Inspect native/WASM/downloaded binaries.
8. Inspect patent, codec, trademark, and hosted-service implications.
9. Define the narrow RetroStage adapter and authority boundary.
10. Run a disposable technical spike where risk warrants it.
11. Define replacement/removal strategy.
12. Pin exact version and update lockfile.
13. Add tests and architecture checks.
14. Regenerate SBOM and notices.
15. Obtain reviewer approval.
16. Commit only after evidence is complete.
```

A dependency request must be rejected when:

- no concrete milestone need exists,
- it duplicates an authority,
- its license is missing or incompatible,
- its transitive/native contents cannot be established,
- it requires exposing unsafe Electron capabilities,
- it makes canonical data dependent on a third-party runtime object,
- it creates a second scene, state, validation, or persistence authority,
- it has no credible maintenance or replacement path.

---

## 27. Dependency Removal and Replacement Policy

Every production dependency must be wrapped so it can be replaced without rewriting canonical project data.

Required examples:

- Babylon behind `renderer-babylon9` adapter,
- Golden Layout behind workspace-layout adapter,
- SQLite behind index service,
- Havok behind physics adapter,
- Recast behind navigation adapter,
- React Flow behind graph-editor surface,
- OpenTelemetry behind diagnostics abstraction.

Removal must include:

- package and lockfile cleanup,
- transitive graph comparison,
- dead-code scan,
- SBOM/notice regeneration,
- migrated tests,
- packaged-file comparison,
- project compatibility review.

A dependency must not write proprietary or opaque data directly into canonical project documents unless that representation is explicitly standardized, versioned, validated, and owned by RetroStage.

---

## 28. Roadmap Placement of Approved Third-Party Components

This table maps third-party components to the roadmap responsibilities they accelerate. It does not imply that the milestone is implemented.

| Roadmap responsibility | Third-party support | Work still owned by RetroStage |
|---|---|---|
| Repository/bootstrap | Node, pnpm, TypeScript, ESLint, Prettier, Vitest, dependency-cruiser, Knip, CycloneDX | Package topology, scripts, backup/restore proof, source authority |
| Electron shell/security | Electron, Forge, Vite | Typed IPC, workspace trust, path security, recovery, app lifecycle semantics |
| Renderer bootstrap | Babylon.js 9 | Canonical projection, stable identity, commands, diagnostics, parity |
| Editor shell | React, Radix, Golden Layout, react-window | Product UX, design system, panel semantics, creator workflows |
| State/workflows | Zustand, XState | Canonical mutation, session authority, business rules |
| Schema and IPC validation | TypeBox, Ajv | Migrations, semantic validation, capability truth |
| File observation | Chokidar | Change review, stable source identity, safe reimport |
| Archives/recovery bundles | fflate | Recovery policy, journal semantics, privacy and integrity |
| Asset import | glTF-Transform | Asset identity, import settings, diagnostics, source/cooked model |
| Mesh optimization | meshoptimizer | Quality profiles, LOD policy, creator preview, export blockers |
| Physics | Havok | Channels, components, gameplay semantics, authoring/debug UX |
| Navigation | Recast/Detour | Bake workflow, agents, patrol authoring, validation |
| Content index | better-sqlite3 | Canonical documents, rebuild policy, search UX |
| Flow Graph editor | React Flow | Event/Action registry, execution runtime, safety/debugging |
| Advanced text surfaces | Monaco | RetroStage language/diagnostic semantics |
| Testing | Vitest, Playwright | Fixtures, acceptance criteria, product truth |
| Logging/tracing | Pino, later OpenTelemetry | Event taxonomy, privacy, Project Doctor and recovery UX |
| Packaging | Electron Forge | Player separation, cooking, validation, Steam-ready artifacts |
| Compliance | CycloneDX, dependency review | License decisions, notices, release approval |

---

## 29. Dependency Admission by Roadmap Milestone

Approval in this contract does not authorize all approved packages to enter during RSM-3. Dependency installation follows the canonical roadmap owner.

### 29.1 RSM-3 bootstrap dependency set

RSM-3 may install only the repository, typechecking, quality, architecture, test-foundation, and compliance tooling required to prove a reproducible empty foundation:

```text
typescript
pnpm toolchain lock
vitest
eslint
typescript-eslint
prettier
dependency-cruiser
knip
CycloneDX PNPM SBOM tooling
```

GitHub Actions and dependency-review configuration may also enter as pinned CI configuration. No production editor, renderer, UI, physics, asset-pipeline, or player dependency is admitted merely by closing RSM-3.

### 29.2 Gate B production dependency schedule

The approved production families enter only when their roadmap milestone opens and their exact compatibility/license checks pass:

| Milestone | Dependency families |
|---|---|
| RSM-5 | Electron, Electron Forge core, Forge Vite plugin, Vite |
| RSM-6 | `@babylonjs/core`, loaders, selected materials support, serializers restricted to derived/debug use |
| RSM-9 | React, React DOM, selected Radix packages, Golden Layout, react-window |
| RSM-10 | Zustand, XState |
| RSM-11 | one approved TypeBox package identity, Ajv |
| RSM-14 | Chokidar, only if external-change observation is required by the slice |
| RSM-15 | fflate, only for approved snapshot/archive behavior |
| RSM-17 | Playwright; `@babylonjs/havok` only after its native/WASM gate |
| RSM-27 | Pino structured logging |

A milestone may defer an approved package when the required behavior can be proved without it. It may not pull a later-owned package forward without a formal roadmap/dependency change.

### 29.3 Explicitly not installed during RSM-3

The following remain milestone-gated, conditional, or not-baseline during repository bootstrap:

```text
electron
vite
@vitejs/plugin-react
@electron-forge/core
@electron-forge/plugin-vite
react
react-dom
selected @radix-ui/react-* packages
golden-layout
react-window
zustand
xstate
TypeBox runtime package
ajv
chokidar
fflate
pino
@playwright/test
@babylonjs/core
@babylonjs/loaders
@babylonjs/materials
@babylonjs/serializers
@babylonjs/havok
better-sqlite3
Recast wrappers
@xyflow/react
monaco-editor
OpenTelemetry packages
@gltf-transform/core
@gltf-transform/functions
@gltf-transform/extensions
meshoptimizer
msgpackr / msgpackr-extract
KTX-Software / toktx
Basis encoder tools
Draco binaries
FFmpeg
Steamworks SDK
installer-specific makers not yet selected
```

---

## 30. Explicit Non-Baseline and Rejected Choices

### 30.1 Rejected architecture choices

```text
A second game engine
A second renderer
A second canonical scene graph
Godot editor/plugin/fork as the product shell
Stride runtime in parallel with Babylon
Unity or Unreal runtime/editor integration
Babylon scene serialization as canonical storage
SQLite as canonical project storage
Direct Electron Renderer filesystem access
A generic unvalidated IPC bridge
Production Babylon Inspector
Unlicensed GitHub source
```

### 30.2 Not-baseline convenience choices

The following are not rejected forever but require a proven need:

```text
Redux
MobX
Immer
Next.js
Tailwind CSS
Material UI
Ant Design
Bootstrap
react-babylonjs
msgpackr
remote telemetry exporters
hosted backend services
```

### 30.3 Mnemos Studio

No Mnemos Studio package, bridge, SDK, namespace, repository, or product dependency is approved.

The future cinematic model is:

```text
RSM native timeline/sequencer
+ optional generic cinematic sequence interchange
```

External interchange must use RetroStage-owned, versioned, validated contracts and may not become required for core cinematic authoring.

---

## 31. Open Exact-Version and Milestone Decisions

The RSM-3 toolchain selections are governed by current repository manifests and lockfile evidence. Remaining production-dependency decisions stay open until their responsible roadmap milestone admits the relevant dependency graph, and must be closed without changing the product direction.

### 31.1 Exact pnpm release — resolved by RSM-3 repository evidence

The exact selection is governed by the current repository `packageManager` field, lockfile, and accepted clean-environment evidence. Any later change must follow dependency upgrade control.

### 31.2 Exact React 19.2 patch

Select the latest patched 19.2 release available when RSM-9 opens and align `react` and `react-dom` exactly.

### 31.3 Exact Vite 8.2 patch

Select the latest supported 8.2 patch when RSM-5 opens and verify compatibility with the selected Electron Forge integration. React tooling compatibility is rechecked again at RSM-9.

### 31.4 TypeBox package identity

At RSM-11, verify current upstream `typebox` package compatibility and select one identity. Do not install both old and new package lines.

### 31.5 CycloneDX command/package identity — resolved for the RSM-3 baseline

The current native pnpm CycloneDX/SBOM baseline is governed by repository scripts, lockfile, and accepted compliance evidence. Any future replacement or version change must follow dependency admission and upgrade control.

### 31.6 Windows installer maker

Defer until distribution requirements are known. Audit Squirrel, WiX, ZIP, or other candidates separately.

### 31.7 Recast adapter

Defer until the navigation milestone. Upstream Recast approval does not select a JavaScript wrapper.

These open details do not reopen the Babylon/Electron architecture decision.

---

## 32. Technology Contract Validation Gates

Physical validation of this approved technology direction spans RSM-3 through the Gate B vertical slice. RSM-3 proves only the reproducible repository/tooling foundation; Electron, Babylon, React, PIE, and player evidence arrive at their owning milestones. Before the complete approved Gate B technology baseline can be marked implemented, evidence must prove:

### 32.1 Bootstrap

- clean checkout or clean directory bootstrap succeeds,
- exact Node and pnpm versions are documented,
- exact dependencies install from the committed lockfile,
- no unexpected lockfile drift occurs,
- remote Git and off-device backup exist,
- restore has been tested.

### 32.2 Build

- Electron Main, Preload, and Renderer build separately,
- sandboxed application starts,
- Babylon viewport initializes,
- React editor shell renders,
- production editor package builds,
- minimal separate player package builds.

### 32.3 Security

- Node integration is disabled in Renderer,
- context isolation and sandbox are active,
- typed Preload API is narrow,
- IPC payloads are runtime validated,
- privileged IPC sender validation exists,
- CSP and navigation restrictions are tested.

### 32.4 Architecture

- canonical packages have no Electron, DOM, or Babylon dependency,
- Babylon is accessible only through the renderer adapter,
- UI state cannot directly mutate canonical documents,
- package dependency rules pass.

### 32.5 Quality

- typecheck passes,
- lint passes,
- architecture checks pass,
- unit tests pass,
- Electron E2E smoke passes,
- production package smoke passes,
- no development-only dependency leaks into player package.

### 32.6 Compliance

- direct licenses are recorded,
- transitive graph is generated,
- SBOM is generated,
- Electron/Chromium notices are present,
- native/WASM inventory is generated,
- no unknown or prohibited license remains unresolved.

---

## 33. Change-Control Rule

The following changes require a formal decision source update before implementation:

- replacing Electron as the editor shell,
- replacing Babylon.js as the sole renderer/runtime adapter,
- adding a second engine or renderer,
- changing the canonical project storage model,
- changing the primary language away from TypeScript,
- changing the exported-player host architecture,
- admitting a prohibited or manually reviewed license family,
- introducing a hosted service required for core authoring,
- introducing an external cinematic product dependency,
- allowing direct third-party object serialization into canonical documents.

Minor exact-version updates that preserve these boundaries may be handled through the dependency upgrade workflow and repository evidence.

---

## 34. Upstream Verification Ledger

This ledger records the authoritative upstream source family used for the historical pre-repository decision. RSM-3 bootstrap verification is complete; exact release verification must be repeated for each later milestone-owned admission or upgrade.

| Technology | Upstream reference | License/status used for this contract |
|---|---|---|
| Electron | `https://github.com/electron/electron` and `https://releases.electronjs.org/` | MIT; 43.3.0 current verification candidate |
| Electron Forge | `https://github.com/electron/forge` | MIT |
| Node.js | `https://nodejs.org/` and `https://github.com/nodejs/node` | MIT; Node 24 LTS |
| Babylon.js | `https://github.com/BabylonJS/Babylon.js` | Apache-2.0; Babylon 9 line |
| TypeScript | `https://github.com/microsoft/TypeScript` | Apache-2.0 |
| React | `https://github.com/facebook/react` and `https://react.dev/` | MIT; React 19.2 line |
| Vite | `https://github.com/vitejs/vite` and `https://vite.dev/` | MIT; Vite 8 line |
| pnpm | `https://github.com/pnpm/pnpm` | MIT |
| Radix UI | `https://github.com/radix-ui/primitives` | MIT |
| Golden Layout | `https://github.com/golden-layout/golden-layout` | MIT |
| react-window | `https://github.com/bvaughn/react-window` | MIT |
| Zustand | `https://github.com/pmndrs/zustand` | MIT |
| XState | `https://github.com/statelyai/xstate` | MIT |
| TypeBox | `https://github.com/sinclairzx81/typebox` | MIT; package identity to verify |
| Ajv | `https://github.com/ajv-validator/ajv` | MIT |
| Chokidar | `https://github.com/paulmillr/chokidar` | MIT |
| fflate | `https://github.com/101arrowz/fflate` | MIT |
| Pino | `https://github.com/pinojs/pino` | MIT |
| glTF-Transform | `https://github.com/donmccurdy/glTF-Transform` | MIT |
| meshoptimizer | `https://github.com/zeux/meshoptimizer` | MIT |
| Vitest | `https://github.com/vitest-dev/vitest` | MIT |
| Playwright | `https://github.com/microsoft/playwright` | Apache-2.0 |
| ESLint | `https://github.com/eslint/eslint` | MIT |
| typescript-eslint | `https://github.com/typescript-eslint/typescript-eslint` | MIT |
| Prettier | `https://github.com/prettier/prettier` | MIT |
| dependency-cruiser | `https://github.com/sverweij/dependency-cruiser` | MIT |
| Knip | `https://github.com/webpro-nl/knip` | ISC |
| CycloneDX PNPM | `https://github.com/CycloneDX/cyclonedx-node-pnpm` | Apache-2.0 |
| better-sqlite3 | `https://github.com/WiseLibs/better-sqlite3` | MIT |
| Babylon Havok | official `@babylonjs/havok` package | MIT as published |
| Recast Navigation | `https://github.com/recastnavigation/recastnavigation` | Zlib |
| React Flow | `https://github.com/xyflow/xyflow` | MIT core |
| Monaco Editor | `https://github.com/microsoft/monaco-editor` | MIT |
| OpenTelemetry JS | `https://github.com/open-telemetry/opentelemetry-js` | Apache-2.0 |
| msgpackr | `https://github.com/kriszyp/msgpackr` | MIT |
| KTX-Software | `https://github.com/KhronosGroup/KTX-Software` | Mixed; conditional audit only |

---

## 35. Approval Statement

This document approves the following reboot direction:

```text
Babylon.js 9
+ Electron
+ Node.js 24 LTS
+ TypeScript 6
+ pnpm
+ React 19.2
+ Vite 8
+ Radix UI
+ Golden Layout
+ react-window
+ Zustand
+ XState
+ TypeBox
+ Ajv
+ Chokidar
+ fflate
+ Pino
+ Vitest
+ Playwright
+ Electron Forge
+ ESLint
+ typescript-eslint
+ Prettier
+ dependency-cruiser
+ Knip
+ CycloneDX/SBOM tooling
```

The list above records approved technology direction, not RSM-3 installation authority.

It also approves milestone-gated evaluation or installation at the responsible roadmap milestone of:

```text
glTF-Transform
meshoptimizer
@babylonjs/havok
better-sqlite3
Recast/Detour
@xyflow/react
monaco-editor
OpenTelemetry JS
```

It does not approve packaging of:

```text
KTX-Software / toktx
Basis or Draco tools
FFmpeg or codec-enabled binaries
Steamworks SDK
unselected installer makers
untracked native or WebAssembly binaries
```

until their responsible audits pass.

The core product remains:

```text
RetroStage-owned canonical documents
+ RetroStage-owned commands and validation
+ RetroStage-owned creator workflows
+ RetroStage-owned runtime semantics
+ third-party technologies behind narrow replaceable adapters
```

---

## 36. Immediate Handoff

With this technology contract approved, the next authoritative source should be:

```text
01_RSM_REBOOT_CANONICAL_ROADMAP.md
```

The roadmap must:

1. preserve the product objectives and invariants from the reboot charter,
2. place the approved foundation stack in the earliest relevant milestones,
3. delay milestone-gated dependencies until their responsibilities open,
4. require a dependency/license/adapter audit before every major new subsystem,
5. move backup, restore, Electron security, testing, SBOM, and early export proof into the opening phase,
6. remove Mnemos Studio completely,
7. define native sequencing as core and generic cinematic interchange as optional,
8. treat this document's open bootstrap decisions as tasks, not silent assumptions.

---

## 37. Legal and Review Notice

This contract is an engineering and product-governance baseline, not legal advice.

Before the first commercial Steam release, the final packaged editor, exported-player template, complete SBOM, third-party notices, native/WASM inventory, asset-license inventory, installer, signing workflow, and any Steamworks integration should be reviewed by qualified counsel familiar with software licensing, open-source compliance, digital distribution, and applicable codec or patent risks.
