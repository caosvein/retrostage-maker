# RetroStage Maker — Reboot Historical Source Index

**Document ID:** `09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-2 — Canonical Roadmap / Reboot Source-Set Reconstruction`  
**Source slice:** `RSM-2-S9 — Historical Source Index / Retention / Supersession Map`  
**Product gate:** `Gate A — Governed Reboot`  
**Document date:** 2026-08-09  
**Document state:** `SOURCE COMPLETE / REVIEWED BY RSM-2-V1 / ALIGN1 CURRENT PHYSICAL-LOSS STATUS`  
**Active work mode:** `CURRENT-AUTHORITY ALIGNMENT / HISTORICAL IDENTITY GOVERNANCE`  
**Repository:** `NOT YET CREATED`  
**Historical source generation:** `2026-07 PRE-LOSS`  
**Reboot source generation:** `2026-08 CLEAN-START`  
**Governing live-state source:** `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`  
**Governing active-milestone source:** `08_RSM_REBOOT_CURRENT_MILESTONE.md`  
**Review result:** `RSM-2-V1 — PASS AFTER MATERIAL ALIGNMENT CORRECTIONS`  
**Immediate next control step:** `RSM-3-I1 — Local Git Repository / Source Import / Initial Commit Candidate`  

---

## 1. Purpose

This document inventories the recorded identities of the pre-loss RetroStage Maker sources that were physically retained and verified during RSM-2, records their current governed byte-unavailable status, and defines exactly how their knowledge may and may not be used during the reboot.

It exists to preserve valuable product, architecture, roadmap, workflow, and engineering lessons without accidentally reviving implementation claims that belonged to a repository that is no longer available.

This index is authoritative for:

- the filenames, recorded line counts, recorded SHA-256 identities, and provenance of the pre-loss source files,
- the historical status of those files,
- the permitted evidentiary use of each file,
- the claims each file may not support,
- the reboot source that supersedes each historical authority area,
- the distinction between pre-loss and reboot milestone identifiers,
- the treatment of old repository paths, branches, commits, commands, tests, and reports,
- historical-identity preservation, governed-loss, and future recovery integrity rules,
- and the prevention of accidental implementation-status resurrection.

This document is not:

- a live repository report,
- proof that the pre-loss repository can be restored,
- proof that any old commit is reachable,
- proof that any old test still passes,
- permission to execute old repository commands without rediscovery,
- permission to copy old status values into the reboot roadmap,
- a replacement for the reboot charter, roadmap, architecture map, workflow, current state, or current milestone,
- or a claim that historical source files are implementation artifacts.

The governing rule is:

> The pre-loss sources preserve knowledge. They do not preserve live repository truth.

---

## 2. Truthful Reboot State

At the date of this source:

```text
Project state: PRE-REPOSITORY / RSM-3-I1 AUTHORIZED
Live reboot repository: NONE
Remote origin: NONE
Current Git HEAD: NONE
Installed reboot dependencies: NONE
Implemented reboot capabilities: NONE
Current milestone: RSM-3
Current task: RSM-3-I1 — AUTHORIZED / READY FOR EXECUTION
Historical source identity/provenance: PRESERVED
Historical pre-loss source files: HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE
RECOVERY1 physical result: 0/9
TERM1 disposition: OWNER-ACCEPTED SOURCE-GOVERNANCE EXCEPTION
Historical pre-loss implementation: NOT PHYSICALLY AVAILABLE
Historical commit reachability: NOT VERIFIED
Historical test results: NOT CURRENT
```

During RSM-2, the nine then-retained Markdown copies were physically read and verified against the recorded identities. RECOVERY1 later found `0/9` of those physical files in the current workspace. TERM1 accepted that byte loss as a bounded owner source-governance exception. The inventory below is therefore current identity/provenance authority, not a claim that the source bytes remain available.

It does not prove that:

- the referenced repository still exists,
- the referenced files still exist,
- the referenced commits can be checked out,
- the referenced branch can be fetched,
- the referenced tests can be rerun,
- the referenced package graph can be installed,
- or the referenced feature behavior survives in any reboot codebase.

---

## 3. Historical and Reboot Generations

RetroStage Maker now has two distinct source generations.

### 3.1 Pre-loss generation

```text
Generation label: PRE-LOSS
Primary date range: 2026-07
Repository named in sources: C:\RetroStage\retrostage-maker
Primary branch named in sources: main
Last recorded milestone area: pre-loss RSM-25
Status: HISTORICAL / NON-LIVE
```

The pre-loss generation contains product reasoning, architecture discoveries, roadmap intent, workflow rules, snapshots, and command patterns recorded before the local repository was lost.

### 3.2 Reboot generation

```text
Generation label: REBOOT
Primary date range: 2026-08 onward
Repository: NOT YET CREATED at RSM-2
Current gate: Gate A — Governed Reboot
Current milestone: reboot RSM-2
Status: LIVE SOURCE AUTHORITY
```

The reboot generation defines the product and engineering plan that will govern the clean-start repository.

### 3.3 No silent continuity

The reboot is informed by the pre-loss project but is not a continuation of its physical repository state.

The following statement is prohibited:

```text
RSM-25 continues from the old repository.
```

The truthful statement is:

```text
The reboot retains design and engineering lessons from the pre-loss source set.
The reboot repository and implementation begin from a new physical baseline.
```

---

## 4. Terminology

### 4.1 `HISTORICAL`

A source or claim that belongs to the pre-loss generation. Its identity/provenance may remain preserved even when its physical bytes are unavailable; such a record is historical context or evidence, never live implementation truth.

### 4.2 `LIVE`

A reboot source or physical repository fact that currently governs work.

At RSM-2, only the approved reboot source set is live; no reboot repository facts exist yet.

### 4.3 `SUPERSEDED`

A historical authority area replaced by a reboot source.

Superseded does not mean useless or false. It means the old file no longer controls current work.

### 4.4 `RE-ADOPTED`

A historical principle explicitly accepted again in a reboot source.

Examples include:

- RetroStage remains a focused creator rather than a general-purpose engine,
- canonical documents remain independent of Babylon objects,
- Editor Preview, PIE, and Export remain distinct,
- stable identities and migrations remain required,
- evidence-driven review remains required.

A principle is not re-adopted merely because it appears in a historical file. It must appear in an approved reboot source.

### 4.5 `HISTORICAL EVIDENCE ONLY`

The source may support an explanation of what was previously planned, believed, recorded, or reported. It may not establish current implementation truth.

### 4.6 `PHYSICAL EVIDENCE`

Files, manifests, commits, test output, build artifacts, packaged applications, or remote state that can be inspected in the current reboot environment.

No pre-loss physical evidence is assumed to exist merely because a source describes it.

### 4.7 `PRE-LOSS RSM-X`

A milestone identifier from `01_RSM_CANONICAL_ROADMAP_RSM-0-RSM-120.md`.

### 4.8 `REBOOT RSM-X`

A milestone identifier from `01_RSM_REBOOT_CANONICAL_ROADMAP.md`.

These identifiers belong to different milestone maps and must not be treated as interchangeable.

---

## 5. Source Authority Rule

For current work, the reboot source set governs.

Use the following order until a physical reboot repository is created:

1. `00_RSM_REBOOT_PROJECT_CHARTER.md`
2. `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
3. `01_RSM_REBOOT_CANONICAL_ROADMAP.md`
4. `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
5. `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
6. `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
7. `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
8. `08_RSM_REBOOT_CURRENT_MILESTONE.md`
9. this historical index
10. `RSM-3-D-TERM1-CURRENT-AUTHORITY-CUTOFF.tsv` as immutable pre-ALIGN1 terminal evidence
11. `RSM-3-D-TERM1-CHATGPT-INDEPENDENT-TERMINAL-REVIEW.md`
12. `RSM-3-D-ALIGN1-AUTHORITY-DELTA-LOCK.tsv` for the bounded post-cutoff identities of sources 02, 08, and 09
13. recorded pre-loss source identities and provenance under the TERM1 governed-loss exception

When a physical reboot repository exists, current repository evidence and approved task evidence will enter the hierarchy as defined by the charter and workflow.

Historical sources never silently override reboot sources.

If a historical source appears more detailed than a reboot source, the detail may be studied but is not automatically binding.

---

## 6. Historical Source Set Inventory

The minimum recorded pre-loss source identity set contains nine files.

| Historical file | Lines | SHA-256 | Classification | Current physical status |
|---|---:|---|---|---|
| `00_RSM_PROJECT_CHARTER.md` | 915 | `E40B6A9385CD1E533FD04E4451E817A6B12B190EF8B2E51C5AE712179ADC0954` | Historical charter and invariants | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `01_RSM_CANONICAL_ROADMAP_RSM-0-RSM-120.md` | 1394 | `7ABA956B611BC00D060DA9AD94FBE98D8CA3950E184D5F22D86F9B34944BD5B0` | Historical roadmap and target inventory | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `02_RSM_CURRENT_PROJECT_STATE.md` | 221 | `E7C8F3F6A7F9472FF8175A08E07D28B01A80FB215C7B0ADDF32BA030465F641D` | Historical repository-state snapshot | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `03_RSM_ARCHITECTURE_AND_PACKAGE_MAP.md` | 263 | `3F98F27E42809ACC1A93FEB764C9122BFAF1E44989E75D2A6D4036C12064FCB4` | Historical implemented/planned architecture snapshot | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `04_RSM_ENGINEERING_AND_REVIEW_WORKFLOW.md` | 942 | `D5B951342B71C7F117D8B4F2DF2A7743CF329ADBAA9E6DE215E5EBC1D907024A` | Historical engineering workflow | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `05_RSM_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` | 1767 | `2477A5D7638B8F21D7392E7B1455600AE3D15D084265416721D36E9AB5D5DA14` | Historical product decisions and deferred scope | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `06_RSM_CURRENT_MILESTONE_RSM-25.md` | 237 | `4C636805DFB9DF4585905770888FEF1E93DA6CB277D9EF99E50CDF7855443F21` | Historical active-milestone snapshot | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `07_RSM_REPOSITORY_COMMANDS_AND_VALIDATION.md` | 1057 | `E456BEB77431F8A01547359BC242766AF1BD048E2236723CCBCD9BAB42182A19` | Historical command and validation patterns | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `README_POST_I5_ALIGNMENT_REFRESH.md` | 33 | `4E0576E1EBC1DCBBC62BDE5200C20DF695CC796C19377F32FBF5FB8FB8A9945C` | Historical source-refresh handoff note | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |

The line counts and hashes identify the copies physically inspected during RSM-2-S9. They do not claim current byte availability, verify the lost repository, or verify any artifact referenced inside the files. RECOVERY1 independently found `0/9`; no reconstruction is authorized.

---

## 7. Supersession Overview

| Historical authority area | Historical source | Live reboot successor |
|---|---|---|
| Product identity and invariants | `00_RSM_PROJECT_CHARTER.md` | `00_RSM_REBOOT_PROJECT_CHARTER.md` |
| Milestone sequence and product gates | `01_RSM_CANONICAL_ROADMAP_RSM-0-RSM-120.md` | `01_RSM_REBOOT_CANONICAL_ROADMAP.md` |
| Current project state | `02_RSM_CURRENT_PROJECT_STATE.md` | `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` |
| Architecture and package ownership | `03_RSM_ARCHITECTURE_AND_PACKAGE_MAP.md` | `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md` |
| Engineering and review discipline | `04_RSM_ENGINEERING_AND_REVIEW_WORKFLOW.md` | `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md` |
| Durable product decisions and deferred scope | `05_RSM_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` | `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` |
| Active milestone | `06_RSM_CURRENT_MILESTONE_RSM-25.md` | `08_RSM_REBOOT_CURRENT_MILESTONE.md` |
| Technology, dependency, and license direction | historical files and old manifests described by them | `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md` |
| Repository commands and validation | `07_RSM_REPOSITORY_COMMANDS_AND_VALIDATION.md` | future `07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` after RSM-3 materializes the repository |
| Source-refresh handoff | `README_POST_I5_ALIGNMENT_REFRESH.md` | `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`, `08_RSM_REBOOT_CURRENT_MILESTONE.md`, and this index |

The absence of a completed reboot successor for repository commands is intentional. Exact commands cannot be authoritative before the new repository, manifests, scripts, shell expectations, and paths physically exist.

---

# Historical File Records

## 8. `00_RSM_PROJECT_CHARTER.md`

### 8.1 Historical role

This file was the foundational pre-loss project charter.

It described:

- the focused creator identity,
- supported presentation profiles,
- explicit v0 exclusions,
- canonical-data rules,
- Editor Preview, PIE, and Export separation,
- Project Save and Runtime Save separation,
- stable identity,
- unknown-data preservation,
- runtime ownership,
- package boundaries,
- workspaces and creator stages,
- validation and milestone discipline,
- review and commit rules,
- agent and MCP control,
- and a pre-loss current-project snapshot.

### 8.2 What it may support

It may support historical explanations of:

- why RetroStage was defined as a focused horror, mystery, atmospheric, retro, and liminal creator,
- why a general-purpose engine was rejected,
- why canonical data should remain renderer-independent,
- why Preview, PIE, and Export were separated,
- why stable IDs, migrations, validation, and controlled mutation matter,
- why AI and MCP were intended to use approved product boundaries,
- and which engineering failures had already been anticipated.

### 8.3 What it may not prove

It may not prove:

- that `C:\RetroStage\retrostage-maker` currently exists,
- that `main` exists,
- that any package or feature described there currently exists,
- that the pre-loss source hierarchy is still active,
- that pre-loss RSM-25 remains current,
- or that old implementation and validation evidence is available.

### 8.4 Superseded content

The following content is superseded:

- old repository path,
- old branch identity,
- old source hierarchy that placed `PHASE_PLAN.md` first,
- old current-project snapshot,
- old RSM-25 boundary,
- any named companion-product assumption,
- and any technology detail that conflicts with the reboot technology contract.

### 8.5 Re-adopted lessons

The reboot charter explicitly re-adopts the durable product identity and core invariants while resetting physical implementation truth.

### 8.6 Live replacement

```text
00_RSM_REBOOT_PROJECT_CHARTER.md
```

---

## 9. `01_RSM_CANONICAL_ROADMAP_RSM-0-RSM-120.md`

### 9.1 Historical role

This file was the pre-loss long-form product and architecture roadmap from RSM-0 through RSM-120.

It recorded:

- the product north star,
- architectural invariants,
- 121 numbered milestones,
- addenda and correction milestones,
- product gates,
- gameplay, asset, presentation, audio, UI, cinematic, QA, extensibility, security, and release targets,
- and a pre-loss handoff snapshot at RSM-25.

### 9.2 What it may support

It may support:

- recovery of the full intended product-capability inventory,
- understanding of milestone ownership ideas,
- identification of dependencies between authoring, runtime, assets, diagnostics, export, and productization,
- analysis of the original ordering and where it created late risk,
- and comparison between pre-loss and reboot sequencing.

### 9.3 What it may not prove

It may not prove:

- that any milestone was physically completed,
- that the pre-loss status snapshot remains true,
- that the old milestone numbering maps directly to the reboot numbering,
- that a roadmap heading corresponds to a usable product feature,
- or that named future integrations remain approved.

### 9.4 Superseded content

Superseded areas include:

- `RSM-24 CLOSED / PASS`,
- `RSM-25 CURRENT`,
- `RSM-25-I6 NEXT / UNBLOCKED`,
- the old phase and gate ordering,
- late placement of repository restore, Electron security, early export, dependency licensing, and clean-machine validation,
- and the named `RSM-95 — Mnemos Studio Bridge / Cinematic Runtime` assumption.

### 9.5 Re-adopted lessons

The reboot roadmap retains the major product destination while changing implementation order.

Re-adopted target areas include:

- focused creator foundation,
- canonical authoring architecture,
- camera and interaction,
- narrative and objective systems,
- liminal authoring,
- gameplay systems,
- asset pipeline,
- retro presentation,
- animation and VFX,
- audio and player UI,
- standalone export,
- Flow Graph,
- native sequencing,
- generic cinematic interchange,
- QA and recovery,
- controlled extensibility,
- security, compliance, onboarding, and Public Alpha.

### 9.6 Milestone-reference rule

Every citation to this file must use the label `pre-loss`.

Correct:

```text
pre-loss RSM-95 referred to a named companion-product bridge.
```

Incorrect:

```text
RSM-95 is the companion-product bridge.
```

In the reboot roadmap, RSM-95 belongs to a different sequence and meaning.

### 9.7 Live replacement

```text
01_RSM_REBOOT_CANONICAL_ROADMAP.md
```

---

## 10. `02_RSM_CURRENT_PROJECT_STATE.md`

### 10.1 Historical role

This file was a dated pre-loss repository-state snapshot from 2026-07-26.

It recorded:

- repository path and branch,
- historical Git hashes,
- historical clean-state claims,
- historical implementation and alignment subjects,
- historical RSM-25 slice states,
- and a reported handoff to I6.

### 10.2 What it may support

It may support a historical narrative that the pre-loss project reported:

- an implementation commit for authoritative scene sessions and atomic operations,
- an alignment commit activating I6,
- RSM-25-I1 through I5 as closed,
- and a clean pushed state at the snapshot date.

The wording must remain attribution-based:

```text
The historical state source reported that...
```

### 10.3 What it may not prove

It may not prove:

- that commit `824d8faf7d210a5e1aa3345fed6f28828da82c7c` is reachable,
- that commit `d0087bb7d468cab0d34ce97e6daace829acfae74` is reachable,
- that `origin/main` exists,
- that the repository was recoverable after data loss,
- that the working tree is currently clean,
- that the described code or tests exist,
- or that RSM-25-I6 is still next.

### 10.4 Superseded content

All live status, path, branch, HEAD, commit reachability, clean-state, test, and handoff claims are superseded as current truth.

### 10.5 Retained value

The file remains useful as:

- a dated historical checkpoint,
- an index of prior evidence names,
- a record of what the project believed had been completed,
- and a warning that status summaries must always be separated from current physical evidence.

### 10.6 Live replacement

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
```

---

## 11. `03_RSM_ARCHITECTURE_AND_PACKAGE_MAP.md`

### 11.1 Historical role

This file described the best-supported pre-loss TypeScript/pnpm monorepo topology after the reported RSM-25-I5 implementation.

It distinguished:

- canonical authoring data,
- component metadata and policy,
- authoritative authoring-session mutation,
- renderer-derived state,
- runtime-transient state,
- application orchestration,
- package ownership,
- and planned versus implemented systems.

### 11.2 What it may support

It may support architecture lessons about:

- keeping canonical documents independent of Babylon,
- treating renderer objects as derived state,
- avoiding application-to-package reverse dependencies,
- centralizing component policy,
- separating authoring sessions from raw document mutation,
- avoiding a second mutable canonical copy,
- and distinguishing planned packages from proven package contents.

### 11.3 What it may not prove

It may not prove:

- that the named packages exist in the reboot,
- that the old monorepo can be installed,
- that old entrypoints or exports exist,
- that pre-loss package dependencies remain appropriate,
- that old paths or manifests can be reused,
- or that the old package map is the reboot package map.

### 11.4 Superseded content

Superseded areas include:

- all snapshot commit references,
- all claims that a package physically exists,
- old exact package names when they differ from the reboot map,
- old application topology when it conflicts with the editor/player separation,
- and any dependency choice replaced by the reboot technology contract.

### 11.5 Re-adopted lessons

The reboot architecture map re-adopts the ownership principles but defines a new planned topology.

### 11.6 Live replacement

```text
03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md
```

---

## 12. `04_RSM_ENGINEERING_AND_REVIEW_WORKFLOW.md`

### 12.1 Historical role

This file defined the pre-loss evidence-driven workflow for scoping, investigation, planning, implementation, validation, review, commit, closure, and handoff.

### 12.2 What it may support

It may support the following durable lessons:

- an agent completion statement is not evidence,
- one passing smoke script is not complete validation,
- tasks require explicit allowed and forbidden scope,
- repository state must be inspected before and after work,
- exact diff and staged inventory matter,
- implementation, validation, alignment, and closure are distinct,
- commits should follow review rather than precede it,
- and milestone status must be backed by specific evidence.

### 12.3 What it may not prove

It may not prove:

- the current task mode,
- the current repository path,
- the current active milestone,
- that old report templates exactly fit reboot tasks,
- that old validation commands remain valid,
- or that every small reboot task requires the full historical correction structure.

### 12.4 Superseded content

Superseded areas include:

- repository-specific path references,
- dependence on the old `PHASE_PLAN.md`,
- old live-status resolution,
- and any workflow step changed by reboot source-authoring, dependency admission, release compliance, restore verification, or risk classification.

### 12.5 Re-adopted lessons

The reboot workflow retains the evidence-driven core and adds:

- Source Authoring Mode,
- Repository Task Mode,
- Release and Compliance Mode,
- task-risk classification,
- dependency-admission tasks,
- architecture-change tasks,
- release verification,
- restore evidence,
- and clean-machine artifact validation.

### 12.6 Live replacement

```text
04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md
```

---

## 13. `05_RSM_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`

### 13.1 Historical role

This file recorded durable pre-loss product decisions, explicit exclusions, deferred systems, presentation direction, creator workflow, data safety, and controlled extensibility.

### 13.2 What it may support

It may support recovery of historical decisions concerning:

- focused creator scope,
- supported game and camera profiles,
- retro presentation as a multi-system concern,
- liminal authoring,
- asset and texture ownership,
- player UI identity,
- audio and animation direction,
- native sequencing,
- creator-facing diagnostics,
- recovery and compatibility,
- templates and content packs,
- marketplace exclusion,
- plugin deferral,
- and controlled AI/MCP boundaries.

### 13.3 What it may not prove

It may not prove:

- that any deferred system was implemented,
- that every historical decision remains adopted,
- that a named external or companion product exists,
- that old roadmap ownership numbers remain current,
- or that historical technology assumptions remain approved.

### 13.4 Superseded content

Superseded areas include:

- old live repository references,
- old milestone ownership mappings,
- named companion-product assumptions,
- technology choices replaced by the reboot baseline,
- and any decision not explicitly re-adopted in the reboot decision registry.

### 13.5 Re-adopted lessons

The reboot decision registry re-adopts or replaces the durable decisions in a new D-001 through D-072 sequence.

A historical decision number must not be cited as if it were a reboot decision number unless the mapping is explicitly stated.

### 13.6 Live replacement

```text
05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md
```

---

## 14. `06_RSM_CURRENT_MILESTONE_RSM-25.md`

### 14.1 Historical role

This file was the pre-loss active-milestone snapshot for:

```text
pre-loss RSM-25 — Component Type Registry / Validation / Inspector Binding
```

It reported:

- audit and readiness work closed,
- I1 through I5 closed,
- I5 alignment passed,
- I6 next and unblocked,
- V1 and CLOSE1 inactive,
- and pre-loss RSM-26 not started.

### 14.2 What it may support

It may support understanding of:

- the intended component registry architecture,
- validation and Inspector-binding concerns,
- scene-session authority,
- revision and authenticity concepts,
- atomic component operations,
- and the exact implementation boundary the pre-loss project was attempting to reach.

### 14.3 What it may not prove

It may not prove:

- that any pre-loss slice remains complete,
- that I6 may resume,
- that the pre-loss milestone is current,
- that old tests or files are available,
- or that reboot RSM-25 has the same meaning.

### 14.4 Status prohibition

The following language is prohibited in the reboot:

```text
RSM-25-I6 is next.
```

The historically accurate language is:

```text
The pre-loss milestone source reported RSM-25-I6 as next on 2026-07-26.
That handoff is superseded and cannot be resumed without physical repository evidence.
```

### 14.5 Live replacement

```text
08_RSM_REBOOT_CURRENT_MILESTONE.md
```

The live reboot milestone is RSM-2, not RSM-25.

---

## 15. `07_RSM_REPOSITORY_COMMANDS_AND_VALIDATION.md`

### 15.1 Historical role

This file recorded pre-loss PowerShell and Git command patterns for:

- repository inspection,
- status and diff review,
- file checks,
- command discovery,
- validation,
- staging,
- commit verification,
- and report quality checks.

### 15.2 What it may support

It may support general procedural lessons such as:

- inspect before changing,
- use `git status` and diff inventories,
- distinguish staged, unstaged, and untracked files,
- read manifests before assuming script names,
- stage exact paths,
- inspect the staged patch,
- and verify the resulting commit.

### 15.3 What it may not prove

It may not prove:

- the reboot repository path,
- the reboot shell environment,
- the reboot branch name,
- the existence of any package script,
- the existence of old PowerShell helper files,
- the validity of old file paths,
- or the correctness of running any copied command against the reboot.

### 15.4 Execution prohibition

Commands from this file must not be executed by copy/paste as live project authority.

Before a command becomes live, RSM-3 must establish:

- the actual repository root,
- the actual operating shell,
- actual manifest scripts,
- actual workspace package names,
- actual branch and remote policy,
- actual output directories,
- and actual safety constraints.

### 15.5 Re-adopted lessons

Safe Git inspection and exact-scope review remain approved principles.

The exact command source will be rebuilt from the physical reboot repository.

### 15.6 Future live replacement

```text
07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md
```

This future file is intentionally deferred until RSM-3 produces real repository evidence.

---

## 16. `README_POST_I5_ALIGNMENT_REFRESH.md`

### 16.1 Historical role

This file was a short pre-loss source-refresh handoff after the reported I5 alignment commit.

It listed:

- historical HEAD and parent hashes,
- historical alignment patch hash,
- historical clean-state and milestone statuses,
- which project sources should be replaced,
- which sources should remain unchanged,
- and the next intended I6 readiness action.

### 16.2 What it may support

It may support:

- understanding which source files formed the final pre-loss source refresh,
- dating the last recorded source alignment,
- and tracing why the recorded pre-loss identity set has its nine-entry composition.

### 16.3 What it may not prove

It may not prove:

- current Git state,
- commit reachability,
- source freshness for the reboot,
- I6 readiness,
- or that the “keep unchanged” instruction remains active.

### 16.4 Superseded content

Every operational instruction in the file is superseded.

Its only current role is historical provenance for the recorded pre-loss identity set.

### 16.5 Live replacement

Its former functions are now distributed across:

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
08_RSM_REBOOT_CURRENT_MILESTONE.md
09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md
```

---

# Cross-Source Interpretation Rules

## 17. Pre-Loss Versus Reboot Milestone Naming

The pre-loss and reboot roadmaps both use identifiers from RSM-0 to RSM-120, but the sequencing and meanings differ.

Therefore every historical milestone reference must carry a generation qualifier.

### 17.1 Required forms

```text
pre-loss RSM-25
reboot RSM-25
```

or:

```text
RSM-25 in the 2026-07 pre-loss roadmap
RSM-25 in the 2026-08 reboot roadmap
```

### 17.2 Prohibited ambiguous form

```text
RSM-25
```

when the generation cannot be inferred unambiguously from the immediate context.

### 17.3 No completion transfer

Completion, closure, validation, or readiness labels do not transfer between generations.

```text
pre-loss RSM-24 CLOSED / PASS
```

has no effect on:

```text
reboot RSM-24
```

### 17.4 No task continuation

A pre-loss implementation slice may inform a future reboot design, but it cannot be resumed as an active task unless the reboot roadmap independently activates an equivalent scope and the current repository proves its baseline.

---

## 18. Historical Commit and Branch Policy

The historical sources contain commit hashes and branch claims.

These values may be retained verbatim as recorded historical identifiers.

They must be described as:

```text
recorded historical commit hash
reported historical HEAD
reported historical origin/main state
```

They must not be described as:

```text
current commit
verified remote commit
recoverable baseline
current main branch
```

until independently verified in a physically available repository.

### 18.1 Known recorded hashes

The historical source set mentions, among others:

```text
824d8faf7d210a5e1aa3345fed6f28828da82c7c
reported pre-loss alignment HEAD

d0087bb7d468cab0d34ce97e6daace829acfae74
reported pre-loss I5 implementation commit
```

This index does not verify reachability, authorship, parentage, patch contents, or remote presence for those commits.

### 18.2 No synthetic Git history

The reboot must not:

- create commits using old hashes,
- fabricate parent relationships,
- claim a clean continuation branch,
- or manufacture reports saying the historical commits were restored when they were not.

Historical provenance remains textual unless actual Git objects are recovered and independently audited.

---

## 19. Historical Repository Path Policy

The pre-loss sources reference:

```text
C:\RetroStage\retrostage-maker
```

This path is historical.

It may not be used as the reboot repository path merely because it appears in old sources.

RSM-3 must choose and record the actual reboot path.

The new path may coincidentally be the same, but that requires an explicit current decision and physical verification. It must never be inferred from the pre-loss documents.

---

## 20. Historical Command Policy

Historical commands are patterns, not executable current authority.

Before reusing any old command:

1. establish the actual repository root,
2. establish the actual shell,
3. inspect current manifests,
4. inspect current scripts,
5. inspect current package names,
6. inspect current generated paths,
7. confirm command safety,
8. and record the approved command in the reboot command source.

PowerShell-specific commands are not automatically valid in Bash, Git Bash, Command Prompt, or another environment.

A command that was safe for the old working tree may be destructive or meaningless in the reboot.

---

## 21. Historical Test and Validation Policy

Historical test claims may be reported only as historical results attributed to the source.

Correct:

```text
The pre-loss current-state source reported that the I5 implementation had passed its reviewed validation at the recorded snapshot.
```

Incorrect:

```text
I5 tests pass.
```

No historical result establishes current:

- typecheck success,
- unit-test success,
- Electron launch success,
- Playwright success,
- build success,
- package compatibility,
- export success,
- or clean-machine behavior.

All reboot validation must be generated from the reboot repository and current exact dependencies.

---

## 22. Historical Architecture Policy

The old architecture map contains both valuable ownership lessons and snapshot-specific package claims.

Use it to ask:

- Which ownership problems were already discovered?
- Which boundaries reduced mutation ambiguity?
- Which systems caused correction cycles?
- Which concepts should be preserved independently of package names?

Do not use it to assert:

- that a package exists,
- that an import path is correct,
- that an API signature is current,
- or that an old internal abstraction should be copied unchanged.

The reboot architecture map is the current planned authority. The future repository will determine physical truth.

---

## 23. Historical Product-Decision Policy

Historical decisions fall into four categories:

1. **Re-adopted** — explicitly included in the reboot charter or decision registry.
2. **Replaced** — the underlying need remains, but the solution or ownership changed.
3. **Deferred** — still plausible but gated by the reboot roadmap.
4. **Removed** — no longer part of the active direction.

Examples:

| Historical direction | Reboot treatment |
|---|---|
| Focused creator, not general engine | Re-adopted |
| Canonical documents independent of renderer | Re-adopted |
| Retro presentation as a multi-system authored stack | Re-adopted |
| Native timeline/sequencer | Re-adopted |
| Named Mnemos Studio bridge | Removed |
| Generic external cinematic interchange | Replacement direction |
| Public marketplace/DLC commerce as v0 requirement | Rejected/out of scope |
| Controlled MCP/agent integration | Deferred and re-adopted with stricter control |
| Old exact technology/package state | Superseded by reboot technology contract |

---

## 24. Historical Technology Policy

The historical source set may mention Electron, Babylon.js, TypeScript, pnpm, package names, or implementation details.

The current approved technology baseline is defined only by:

```text
06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md
```

Historical technology references may support prior-experience analysis, but they do not establish:

- current versions,
- current package names,
- current licenses,
- current compatibility,
- current transitive dependencies,
- or current distribution approval.

No historical native binary, WebAssembly module, codec, installer, or SDK is automatically approved for the reboot.

---

## 25. Mnemos Studio Removal

The pre-loss roadmap contained:

```text
pre-loss RSM-95 — Mnemos Studio Bridge / Cinematic Runtime
```

The reboot removes this named product assumption.

No active source may describe Mnemos Studio as:

- an existing RetroStage product,
- a required companion application,
- a planned dependency,
- a roadmap deliverable,
- or a repository package.

The underlying product needs were separated into:

```text
native cinematic authoring
and
optional generic cinematic sequence interchange
```

The live owners are defined by the reboot roadmap and decision registry.

Historical mentions remain recorded by the indexed identities and interpretations solely to explain the supersession. If genuine original bytes are later recovered and admitted through change control, those originals must remain historical and non-current.

---

## 26. Historical Identity Preservation and Governed-Loss Policy

### 26.1 Preserve identity and provenance

The nine filenames, recorded line counts, recorded SHA-256 values, roles, allowed evidentiary uses, prohibited proof boundaries, and supersession mappings must remain traceable. Their current status is exactly:

```text
HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE
```

No placeholder, paraphrase, or reconstructed Markdown file may be presented as an original historical source.

### 26.2 Preserve filenames and status

The recorded original filenames remain unchanged in this index. Each is historical, not selected as live authority, not locked as a current implementation source, and physically unavailable under the TERM1 owner-accepted exception.

### 26.3 Future recovery only through change control

If genuine original bytes are later recovered, they may be considered only after physical hash/identity review, provenance review, conflict analysis, and explicit change-control authorization. This document does not decide repository import or outside-repository retention for such a future recovery.

### 26.4 Identity manifest

A later repository evidence package may include a machine-readable historical-identity manifest containing:

- filename,
- generation and date range,
- recorded line count and SHA-256,
- classification and live successor,
- current physical status,
- governed exception reference,
- and any independently verified future-recovery disposition.

Recorded byte size must not be invented where no accepted record exists.

### 26.5 Backup and restore boundary

The current identity/provenance records and reboot sources belong in tested off-device backup and restore procedures once RSM-3 establishes them. Genuine originals may join those procedures only after future change-control admission. Unavailable bytes cannot be claimed as backed up or restorable.

---

## 27. Historical Source Mutation Rule

Do not edit a historical source to make it appear consistent with the reboot.

Prohibited examples:

- replacing `RSM-25 CURRENT` inside the historical current-state file,
- changing old commit hashes to new hashes,
- renaming old milestones inside the old roadmap,
- rewriting the old companion-product reference in any genuinely recovered historical roadmap bytes,
- rewriting old paths as if they were current,
- or adding reboot package names into the old architecture map.

The reboot records supersession through new sources, not retroactive alteration.

If genuine historical bytes are later recovered, preserve the original recovery copy, verify its identity, and admit any managed copy only through explicit change control. No currently retained copy is assumed available for restoration.

---

## 28. Historical Evidence Attribution Standard

When using a historical source in a report or discussion, state:

1. the filename,
2. the snapshot date if available,
3. that it is pre-loss/historical,
4. what it recorded,
5. and whether the point has been re-adopted by a reboot source.

Example:

```text
The 2026-07 pre-loss architecture source recorded renderer-derived state as non-canonical.
That principle is re-adopted by the reboot charter and architecture map.
```

Do not flatten historical and reboot evidence into one undifferentiated claim.

---

## 29. Prohibited Resurrection Claims

Unless current physical evidence exists, the following claims are prohibited:

```text
The old repository is restored.
The old repository is clean.
HEAD equals origin/main.
RSM-25-I5 is implemented in the reboot.
RSM-25-I6 is ready to start.
The old tests still pass.
The old package map exists.
The old Electron app launches.
The old Babylon viewport works.
The old export works.
The old commit can be checked out.
The old branch is current.
The old source hierarchy remains active.
```

Permitted forms include:

```text
The historical source reported...
The pre-loss roadmap planned...
The reboot re-adopts the principle that...
The reboot has not yet physically implemented...
```

---

## 30. Reusable Lessons Retained from the Pre-Loss Project

The recorded historical identities, RSM-2 physical inspection record, and indexed interpretations support the following lessons, subject to explicit reboot adoption. This is not a current physical-byte claim.

### 30.1 Product lessons

- A focused creator has a better identity than a general-purpose engine clone.
- Horror, mystery, atmosphere, retro presentation, and liminal authoring require coordinated product systems.
- Templates should provide behavior without forcing one repeated visual identity.
- Creator-facing diagnosis is a product capability, not only a developer tool.

### 30.2 Data lessons

- Canonical data must be independent of renderer objects.
- Stable identities are required for persistent references.
- Project Save and Runtime Save must be separate.
- Unknown data requires an explicit preservation policy.
- Schema changes require versioning, migration, validation, and recovery.

### 30.3 Runtime lessons

- Preview, PIE, and Export require distinct ownership and proof.
- Runtime systems need a central lifecycle, clock, registration, and cleanup policy.
- Disposable PIE state must not mutate canonical authoring data.
- A visual placeholder is not an end-to-end feature.

### 30.4 Editor lessons

- Inspector UI must not become canonical mutation authority.
- Selection, temporary panel state, and layout state are not project state.
- Mutation should pass through typed, validated, reviewable commands.
- Large creator systems need authoring, validation, debugging, and export parity.

### 30.5 Engineering lessons

- Agent confidence is not evidence.
- Exact source inspection matters.
- One active task reduces scope drift.
- Allowed and forbidden paths prevent accidental expansion.
- Clean repository claims require explicit status evidence.
- Commits and pushes require post-action verification.
- Backup is incomplete without restore testing.

### 30.6 Roadmap lessons

- Early vertical slices should include save, reopen, PIE, export, and clean-machine proof.
- Security, licensing, dependency control, and recovery must not be postponed until release.
- Product gates are more meaningful than milestone-count progress.
- A roadmap entry does not prove capability existence.

---

## 31. Lessons Not Automatically Carried Forward

The following are not automatically carried into the reboot:

- old package names,
- old file paths,
- old class or interface names,
- old command syntax,
- old test structure,
- old script names,
- old commit layout,
- old milestone statuses,
- old dependency versions,
- old UI implementation details,
- old process assumptions,
- old named companion-product integrations,
- or old exact implementation strategies.

Each must be reconsidered against the reboot charter, technology contract, roadmap, architecture map, and physical repository evidence.

---

## 32. Reboot Source Set Covered by This Index

This index assumes the following reboot sources are available:

| Reboot source | Authority area |
|---|---|
| `00_RSM_REBOOT_PROJECT_CHARTER.md` | Product identity, invariants, source reset |
| `01_RSM_REBOOT_CANONICAL_ROADMAP.md` | Reboot milestone sequence and product gates |
| `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` | Current truthful state |
| `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md` | Planned architecture and package boundaries |
| `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md` | Work, evidence, review, commit, restore, and release discipline |
| `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` | Adopted, deferred, conditional, rejected, and open decisions |
| `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md` | Technology, dependency, license, and supply-chain policy |
| `08_RSM_REBOOT_CURRENT_MILESTONE.md` | Active RSM-3-I1 scope, status, and handoff |
| `09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md` | Historical identity, governed-loss, and supersession policy |

The absence of `07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` is expected until a physical repository is created.

---

## 33. Historical-to-Reboot Concept Mapping

| Historical concept | Reboot owner |
|---|---|
| Focused creator identity | Reboot Charter |
| Supported game and camera profiles | Reboot Charter and Roadmap |
| Canonical document ownership | Reboot Charter and Architecture Map |
| Babylon as derived renderer state | Technology Contract and Architecture Map |
| Electron process boundary | Technology Contract and Architecture Map |
| Stable ID and migration | Reboot Roadmap and Architecture Map |
| Component registry and validation | Reboot Roadmap |
| Authoring-session mutation authority | Reboot Architecture Map and future implementation milestones |
| Workspace and creator stages | Reboot Charter, Decisions, and Roadmap |
| Retro presentation stack | Reboot Charter, Decisions, and Roadmap |
| Liminal authoring | Reboot Decisions and Roadmap |
| Asset pipeline | Technology Contract and Roadmap |
| Project Doctor and diagnostics | Reboot Decisions and Roadmap |
| Native cinematic sequencing | Reboot Decisions and Roadmap |
| External cinematic bridge | Replaced by generic interchange contract |
| Controlled AI/MCP | Reboot Decisions and Roadmap |
| Repository review discipline | Reboot Workflow |
| Old commands | Future reboot command source after RSM-3 |
| Old current state | Reboot Current Project State |
| Old current milestone | Reboot Current Milestone |

---

## 34. Historical Use in RSM-2-V1

This index is an input to:

```text
RSM-2-V1 — Source-Set Consistency Review
```

The V1 review historically verified at minimum:

1. every required historical file is indexed,
2. each file is marked historical rather than live,
3. each file has a permitted-use statement,
4. each file has a prohibited-proof statement,
5. superseded current-state claims are explicit,
6. pre-loss and reboot milestone names are distinguished,
7. old repository commands are not live authority,
8. old commit reachability is not claimed,
9. the named companion-product assumption is removed from live direction,
10. live successor sources are correctly identified,
11. historical-source hashes matched the then-retained files,
12. no reboot implementation capability is claimed,
13. and no physical repository state is invented.

These criteria were satisfied for the RSM-2 review state. They do not override the later RECOVERY1 `0/9` physical result or the TERM1 governed-loss exception.

---

## 35. RSM-2-S9 Acceptance Criteria

RSM-2-S9 was eligible to be marked `SOURCE COMPLETE` when:

- all nine required historical files are included,
- every file has a historical role,
- every file has an allowed evidentiary use,
- every file has an explicit non-proof boundary,
- supersession is mapped,
- milestone-generation terminology is defined,
- old path, branch, commit, test, and command claims are constrained,
- historical retention rules were defined for the then-present copies,
- prohibited resurrection language is defined,
- the named companion-product assumption is removed from active direction,
- and the file passes structural and integrity review.

`SOURCE COMPLETE` did not itself mean `RSM-2 CLOSED`; V1 and CLOSE1 subsequently completed that closure.

---

## 36. RSM-2-S9 Forbidden Outcomes

This source must not result in:

- reactivating pre-loss RSM-25,
- creating an I6 implementation prompt,
- claiming old code has survived,
- creating a synthetic Git baseline,
- copying old commands into live authority,
- changing the reboot roadmap to mirror old status,
- installing dependencies,
- creating the repository,
- defining unverified script names,
- or closing RSM-2 without V1 review.

---

## 37. Historical RSM-2 Archive Review Checklist

This checklist records the then-current RSM-2 review, not present physical availability. Before RSM-2 closure, the review verified:

- [ ] all nine historical files are readable,
- [ ] filenames match the inventory,
- [ ] line counts match the inventory,
- [ ] SHA-256 values match the inventory,
- [ ] no historical file was silently rewritten,
- [ ] old status is not described as current,
- [ ] old paths are not described as current,
- [ ] old commits are not described as reachable,
- [ ] old tests are not described as passing now,
- [ ] old commands are not described as executable authority,
- [ ] pre-loss and reboot milestone identifiers are qualified,
- [ ] every historical authority area has a live successor or an explicit deferral,
- [ ] Mnemos Studio appears only in historical/supersession context,
- [ ] and the reboot remained `PRE-REPOSITORY`.

Current overlay: RECOVERY1 found `0/9`; all nine entries now carry `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE`; TERM1 accepted the bounded exception; no original bytes were reconstructed.

---

## 38. Change Control

### 38.1 Adding a historical source

A newly recovered pre-loss source may be added only after:

1. preserving the recovered original file exactly as found,
2. calculating its hash,
3. identifying its date and role,
4. classifying what it may support,
5. defining what it may not prove,
6. mapping its supersession,
7. and reviewing it for conflicts with the reboot source set.

### 38.2 Removing a historical source

A recorded historical identity/provenance entry should not be removed merely because its authority is obsolete or its bytes are unavailable.

Removal requires a documented reason such as:

- duplicate byte-identical copy,
- corrupted or unverifiable file,
- accidental non-project content,
- legal or privacy restriction,
- or replacement by a more complete original artifact while retaining provenance.

### 38.3 Updating this index

Update this index when:

- a new historical source is recovered,
- a historical file hash changes unexpectedly,
- a reboot source supersession changes,
- genuine original bytes are recovered and their repository or outside-repository disposition is authorized,
- or a V1 review identifies a material interpretation gap.

Do not update it merely to make historical language resemble current language.

---

## 39. Handoff Status

This historical-source index completed the S9 handoff to:

```text
RSM-2-V1 — Source-Set Consistency Review
```

RSM-2-V1 subsequently passed after material alignment corrections, and RSM-2-CLOSE1 closed the source-reconstruction milestone.

The current handoff is now controlled by sources 02 and 08:

```text
RSM-3-I1 — Local Git Repository / Source Import / Initial Commit Candidate
```

This index remains authoritative for historical-source interpretation. It does not independently control current milestone status.

---

## 40. Approval Statement

This document approves the recorded 2026-07 source identities, RSM-2 provenance, and indexed interpretations as:

```text
HISTORICAL DESIGN, ARCHITECTURE, ROADMAP,
WORKFLOW, STATUS, AND PROVENANCE EVIDENCE
```

It explicitly rejects treating that source set as:

```text
LIVE REPOSITORY, CURRENT IMPLEMENTATION,
CURRENT MILESTONE, CURRENT COMMAND,
CURRENT TEST, OR CURRENT RELEASE EVIDENCE
```

All nine entries are `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE`. The reboot may learn from the pre-loss project without pretending that the lost source bytes or physical implementation still exist.

---

## 41. Current Source-Slice Statement

```text
RSM-2-S9 — Historical Source Index / Retention / Supersession Map
Historical state: SOURCE COMPLETE / RSM-2-V1 REVIEWED / RSM-2 CLOSED
Current overlay: HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE (9/9)
Current task: RSM-3-I1 — AUTHORIZED / READY FOR EXECUTION
Repository: NOT YET CREATED
Implementation capabilities: NONE
```

Sources 02 and 08 control the current task. This index controls historical interpretation and the bounded governed-loss status; it does not claim I1 execution or authorize a later phase.
