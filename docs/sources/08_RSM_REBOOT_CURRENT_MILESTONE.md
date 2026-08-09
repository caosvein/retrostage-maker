# RetroStage Maker — Reboot Current Milestone

**Document ID:** `08_RSM_REBOOT_CURRENT_MILESTONE`  
**Role:** Authoritative active-milestone and next-task control source  
**Project:** RetroStage Maker  
**Current gate:** `Gate A — Governed Reboot`  
**Current milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current task:** `RSM-3-I1 — Local Git Repository / Source Import / Initial Commit Candidate`  
**Milestone state:** `CURRENT / RSM-3-I1 AUTHORIZED`  
**Task state:** `AUTHORIZED / READY FOR EXECUTION`  
**Work mode:** `PRE-REPOSITORY I1 IMPLEMENTATION AUTHORIZED`  
**Snapshot date:** 2026-08-09  
**Timezone:** Europe/Istanbul  
**Repository:** `NOT YET CREATED`  
**RSM-2:** `CLOSED / SOURCE PASS`  
**RSM-4:** `BLOCKED UNTIL RSM-3 CLOSURE`  

---

## 1. Purpose

This document controls the active RSM-3 milestone after the explicit closure of RSM-2.

It defines:

- what RSM-3 must prove,
- what the authorized RSM-3-I1 slice may establish,
- what may and may not be created,
- how repository, remote, toolchain, backup, and restore evidence must be handled,
- and when RSM-4 may begin.

It does not claim that repository bootstrap has already occurred.

---

## 2. Milestone Identity

```text
RSM-3 — Repository / Remote Backup / Reproducible Bootstrap
```

Purpose:

> Create a physical, remotely recoverable, reproducible repository baseline without beginning product implementation or admitting dependencies before their roadmap owners.

Canonical roadmap exit:

> A clean supported machine can clone, install, validate, and build the approved empty foundation without relying on lost local state.

---

## 3. Entry Evidence

RSM-3-I1 entry is authorized by the accepted phase chain and the terminal owner-resolution package:

| Phase / gate | Current result | Authority anchor |
|---|---|---|
| `RSM-2` | `CLOSED / SOURCE PASS` | RSM-2 closure evidence |
| `RSM-3-A` | `ACCEPTED` | accepted audit/readiness package |
| `RSM-3-B` | `ACCEPTED` | accepted repository/toolchain/source-import contract package |
| `RSM-3-C` | `ACCEPTED` | accepted supply-chain/backup/restore boundary package |
| `RSM-3-D` | `TERMINALLY ACCEPTED` | `RSM-3-D-TERM1-OWNER-SOURCE-GOVERNANCE-EXCEPTION-AND-DECISION-LOCK.md`; `RSM-3-D-TERM1-CHATGPT-INDEPENDENT-TERMINAL-REVIEW.md` |
| `RSM-3-I1` | `AUTHORIZED / READY FOR EXECUTION` | terminal-review decision `RSM-3-D TERMINAL REVIEW — ACCEPTED`; this ALIGN1 authority delta |

Recursive FIX/review history remains evidence history and does not replace the terminal current-authority chain. RSM-3-I1 authorization does not claim repository creation or implementation execution.

---

## 4. Source Authority

RSM-3 must read:

1. charter;
2. technology/license contract;
3. canonical roadmap;
4. decisions registry;
5. architecture map;
6. workflow;
7. current-state source;
8. this current-milestone source;
9. historical index;
10. V1 review;
11. RSM-2 closure;
12. accepted RSM-3-A/B/C packages;
13. `RSM-3-D-TERM1-OWNER-SOURCE-GOVERNANCE-EXCEPTION-AND-DECISION-LOCK.md`;
14. `RSM-3-D-TERM1-CURRENT-AUTHORITY-CUTOFF.tsv`;
15. `RSM-3-D-TERM1-I1-ENTRY-CANDIDATE-REPORT.md`;
16. `RSM-3-D-TERM1-CHATGPT-INDEPENDENT-TERMINAL-REVIEW.md`;
17. `RSM-3-D-ALIGN1-AUTHORITY-DELTA-LOCK.tsv` and the aligned sources 02, 08, and 09.

`RSM-3-D-TERM1-CURRENT-AUTHORITY-CUTOFF.tsv` remains immutable. ALIGN1 records only the bounded post-cutoff identity delta for sources 02, 08, and 09. Physical repository evidence becomes authoritative as soon as repository facts exist.

---

## 5. Current Truth

```text
Repository: NOT YET CREATED
Remote: NOT YET CREATED
Branch: NONE
HEAD: NONE
Lockfile: NONE
Dependencies: NONE
CI: NONE
Tests: NONE
Build: NONE
Push: NONE
Clean clone: NONE
Restore proof: NONE
Product implementation: NONE
```

No source or agent may contradict this block without new observed evidence and current-state alignment.

---

## 6. RSM-3 Objectives

RSM-3 must establish:

1. safe canonical repository root;
2. off-device remote origin;
3. primary branch and Git identity;
4. exact Node/pnpm/TypeScript baseline;
5. minimal approved monorepo skeleton;
6. exact development-only tool dependencies assigned to RSM-3;
7. committed package-manager and lockfile baseline;
8. imported active reboot sources;
9. preserved historical source identities, provenance, and governed byte-loss records without synthetic replacement bytes;
10. lint/typecheck/test/build scripts for the empty foundation;
11. architecture checks;
12. dependency review and license policy;
13. SBOM and third-party-notice baseline;
14. off-device push;
15. clean clone and clean install;
16. clean validation and empty-foundation build;
17. tested restore;
18. authoritative repository command source;
19. current-state/current-milestone updates;
20. RSM-4 handoff.

---

## 7. RSM-3 Dependency Boundary

RSM-3 may admit only repository/toolchain/quality/compliance dependencies assigned by the canonical roadmap and technology contract.

Candidate categories include:

- Node.js;
- pnpm;
- project-local TypeScript;
- ESLint;
- Prettier;
- dependency-cruiser;
- Knip;
- Vitest foundation;
- GitHub Actions;
- dependency review;
- CycloneDX/SBOM tooling.

Exact versions are not approved until audited and pinned.

RSM-3 may not admit:

- no Electron/Forge/Vite before RSM-5;
- no Babylon before RSM-6;
- no React editor UI before RSM-9;
- no TypeBox/Ajv before RSM-11;
- Havok, SQLite, Recast, React Flow, Monaco, OpenTelemetry, glTF-Transform, meshoptimizer, KTX, FFmpeg, Steamworks, or other later dependencies early.

---

## 8. Planned Repository Topology Boundary

RSM-3 may create only the minimal initial structure justified by the architecture map.

A directory name does not prove a package capability.

The bootstrap must avoid pre-creating every future package.

Allowed initial roots may include:

```text
apps/
packages/
docs/
tooling/
.github/
```

Exact children must be approved by RSM-3-B/D and created only when needed for the empty foundation.

---

## 9. RSM-3 Phase Plan

```text
RSM-3-A — Environment / Repository / Remote / Toolchain Audit
RSM-3-B — Repository / Toolchain / Source-Import Contract
RSM-3-C — Supply-Chain / Backup / Restore Boundary
RSM-3-D — Detailed Bootstrap Readiness
RSM-3-I1 — Local Git Repository / Source Import / Initial Commit Candidate
RSM-3-I2 — pnpm Workspace / Toolchain / Quality Scripts
RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline
RSM-3-I4 — Remote Push / Clean Clone / Restore Proof
RSM-3-V1 — Milestone-Wide Bootstrap Validation
RSM-3-CLOSE1 — Closure / RSM-4 Handoff
```

The accepted phase chain is `RSM-3-A → RSM-3-B → RSM-3-C → RSM-3-D`. Only `RSM-3-I1` is now authorized for execution. RSM-3-I2 and all later slices remain blocked until their predecessor evidence and review gates are satisfied.

---

## 10. Current Task — RSM-3-I1

`RSM-3-I1 — Local Git Repository / Source Import / Initial Commit Candidate` is the only currently authorized implementation slice.

Its bounded purpose is to establish the approved local repository foundation, import the authorized source/evidence set under the accepted mappings and governance exception, and prepare an initial commit candidate for review. No repository, import, commit candidate, commit, push, backup, clone, restore, dependency installation, or product implementation has yet occurred merely because I1 is authorized.

---

## 11. RSM-3-I1 Authorized Scope

- create the approved local Git repository at the owner-locked canonical path;
- apply the accepted branch, identity, shell, topology, source-import, and import-lock contracts;
- import the authorized current source/evidence set;
- preserve the nine unavailable historical sources as identity/provenance records under the terminal exception, without synthesizing replacement bytes;
- produce the required physical inventory, import-lock, validation, and initial commit-candidate evidence;
- stop before commit or push pending their explicit downstream approvals.

Authorization is prospective. Every physical fact must be observed and recorded during I1.

---

## 12. RSM-3-I1 Forbidden Scope

- product code or product functionality;
- product dependencies owned by later milestones;
- final source 07 authority before commands are physically observed;
- synthetic reconstruction of the nine unavailable historical files;
- automatic commit or push;
- remote, backup, clone, restore, or dependency work owned by later RSM-3 slices;
- secret exposure or unrelated directory mutation;
- declaring RSM-3 complete or starting RSM-4.

---

## 13. RSM-3-I1 Evidence Requirement

I1 must return a reviewable physical package that identifies at minimum:

- repository root, `.git` identity, branch, and working-tree state;
- every imported file and its physical hash;
- applied source-import and import-lock mappings;
- treatment of the historical byte-loss exception;
- validation commands actually run and their results;
- exact initial commit-candidate inventory;
- all blockers or divergences.

The evidence may support `READY FOR REVIEW` or `BLOCKED`; it may not silently advance to commit or push.

---

## 14. RSM-3-I1 Stop Conditions

Stop if:

- the owner-locked repository path or source mapping cannot be applied exactly;
- a current-authority source is missing, ambiguous, or hash-divergent without authorized mapping;
- an operation would synthesize the unavailable historical bytes;
- required Git identity/authentication facts conflict with the accepted owner lock;
- secrets or unrelated data could be exposed or overwritten;
- an unapproved dependency, commit, push, backup, clone, restore, or product action would be required;
- or a material owner choice remains unresolved.

No guessing is permitted.

---

## 15. Downstream Phase Gate

The controlled sequence is:

```text
RSM-3-I1 → RSM-3-I2 → RSM-3-I3 → RSM-3-I4 → RSM-3-V1 → RSM-3-CLOSE1
```

I2 may begin only after I1 physical evidence is independently accepted and the next slice is explicitly authorized. I3 depends on accepted I2; I4 depends on accepted I3; V1 depends on accepted I1–I4; CLOSE1 depends on an accepted V1. No transition authorizes an automatic commit or push.

---

## 16. Repository Command Source Position

`07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` is still deferred.

It becomes authoritative only after commands exist and have been observed against the physical repository.

RSM-3 may create it incrementally, but unverified commands must be labeled provisional and may not be presented as validated authority.

---

## 17. Backup and Restore Acceptance

RSM-3 cannot close with only a remote configured.

Required evidence includes:

- committed baseline pushed off-device;
- fresh clone into a separate target;
- install from committed declarations;
- validation from the clone;
- empty-foundation build;
- simulated local-loss restore or equivalent controlled restore test;
- restored source/hash verification;
- and recorded recovery instructions.

---

## 18. Commit and Push Authority

Agents do not automatically commit or push.

Each implementation slice must show:

- baseline status;
- exact file inventory;
- validation evidence;
- staged inventory;
- reviewer decision;
- owner-approved commit;
- owner-approved push;
- remote verification.

No unpushed local repository may be treated as safe completion.

---

## 19. Historical Source Governance

The nine historical source identities and their RSM-2 provenance remain preserved, but their physical bytes are unavailable:

```text
HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE
```

RECOVERY1 found `0/9` physical historical files. TERM1 accepted the bounded owner source-governance exception. I1 must carry the filenames, recorded line counts, recorded SHA-256 identities, roles, allowed-use boundaries, prohibited proof boundaries, supersession state, and governed-loss status into the repository evidence without creating placeholder or reconstructed source bytes.

If genuine originals are later recovered, their admission requires explicit change control and independent identity verification.

---

## 20. Active Source Import

The accepted reboot sources and closure evidence must be copied into a reviewed documentation/evidence structure.

RSM-3 must preserve:

- filenames or an explicit rename/mapping record;
- hashes where content is unchanged;
- source authority order;
- and current-state/current-milestone update ownership.

---

## 21. RSM-3 Validation Requirements

RSM-3-V1 must verify at minimum:

- repository and remote identity;
- clean working state at the accepted baseline;
- exact toolchain identity;
- lockfile integrity;
- minimal topology;
- architecture boundaries;
- lint/typecheck/test/build scripts;
- dependency review;
- SBOM generation;
- notice generation;
- current-source integrity and historical identity/provenance integrity without synthetic bytes;
- clean clone;
- clean install;
- clean validation/build;
- off-device push;
- restore proof;
- source 07 accuracy;
- and truthful sources 02/08.

---

## 22. RSM-3 Closure Criteria

RSM-3 may close only when:

- physical repository evidence exists;
- remote evidence exists;
- committed and pushed baseline exists;
- clean clone/install/validation/build succeeds;
- restore succeeds;
- source 07 is authoritative for the accepted baseline;
- no product milestone was started early;
- RSM-3-V1 passes;
- and RSM-4 receives a narrow activation handoff.

---

## 23. Gate A Relationship

Gate A remains current.

RSM-3 closure alone does not close Gate A.

RSM-4 must still activate repository-valid task, review, evidence, dependency, commit, push, and closure discipline before Gate B begins.

---

## 24. Multi-AI Application Requirement

The project owner has requested active use of both Antigravity IDE and Codex.

This requirement is recorded but the permanent role model is not yet approved.

Planned owner:

```text
RSM-4-ADD1 — Multi-AI Application / Agent Role / Handoff / Review Model
```

Temporary RSM-3 rule:

- declare one primary executor for each task;
- secondary AI is read-only reviewer/auditor unless separately authorized;
- no concurrent writes to the same files;
- no independent dependency, commit, push, or scope changes;
- all work follows the existing evidence contract.

---

## 25. Current Risks

| Risk | Control |
|---|---|
| Unsafe local root | Accepted owner-locked path plus I1 stop conditions |
| Remote unavailable | Stop before implementation |
| Repeat data loss | Push, clean clone, restore proof |
| Unpinned environment | Exact toolchain admission |
| Premature product dependencies | Canonical milestone ownership |
| Excess package creation | Proven-boundary rule |
| Historical byte loss or synthetic reconstruction | TERM1 governed exception, identity/provenance preservation, no synthetic bytes |
| AI tool conflicts | One-primary-executor temporary rule |
| False bootstrap success | V1 and physical evidence |

---

## 26. Current Blockers

No source-governance blocker prevents authorized RSM-3-I1 execution. The nine historical bytes remain unavailable, but TERM1 has dispositioned that condition as a bounded owner-accepted exception; it is not permission to reconstruct them.

Repository facts remain absent until I1 observes and creates them. RSM-3-I2 and later slices, source 07 finalization, RSM-4, and Gate B remain blocked.

---

## 27. Immediate Next Action

```text
Execute the bounded RSM-3-I1 contract using one declared primary local engineering tool.
Create and validate only the approved local repository/source-import/initial commit-candidate slice.
Return READY FOR REVIEW or BLOCKED; do not commit or push automatically.
```

---

## 28. Status Transition Rules

RSM-3-I1 may transition:

```text
READY FOR EXECUTION
→ IN PROGRESS
→ READY FOR REVIEW
```

or:

```text
READY FOR EXECUTION
→ IN PROGRESS
→ BLOCKED
```

RSM-3 remains `CURRENT` throughout these task transitions.

---

## 29. Update Triggers

Update this document when:

- RSM-3-I1 starts or completes;
- I1 physical repository and source-import facts are accepted;
- RSM-3-I2 is activated;
- repository/remote/branch/HEAD appears;
- toolchain versions are pinned;
- lockfile or CI exists;
- remote push, clone, or restore succeeds;
- source 07 becomes authoritative;
- RSM-3-V1 passes;
- RSM-3 closes;
- or the multi-AI addendum is approved.

---

## 30. Current Milestone Statement

```text
RSM-3 is current.
RSM-3-A, RSM-3-B, and RSM-3-C are accepted.
RSM-3-D is terminally accepted.
RSM-3-I1 is authorized / ready for execution.
No repository exists yet.
No product implementation is authorized.
Gate A remains open.
```

---

## 31. Approval Statement

Acceptance of this milestone source means:

- RSM-2 closure is accepted;
- RSM-3-A, RSM-3-B, and RSM-3-C acceptance is current;
- RSM-3-D terminal acceptance is current;
- only RSM-3-I1 may begin;
- RSM-3-I2 and all later RSM-3 slices remain blocked by their dependency gates;
- source 07 remains deferred;
- backup/restore evidence is mandatory;
- product dependencies remain milestone-gated;
- and the two-AI workflow requirement is recorded for controlled later definition.
