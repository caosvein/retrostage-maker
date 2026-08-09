# RetroStage Maker — Reboot Current Milestone

**Document ID:** `08_RSM_REBOOT_CURRENT_MILESTONE`  
**Role:** Authoritative active-milestone and next-task control source  
**Project:** RetroStage Maker  
**Current gate:** `Gate A — Governed Reboot`  
**Current milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current task:** `RSM-3-I3 — CI / Dependency Review / SBOM / Third-Party Notices`  
**Milestone state:** `CURRENT / RSM-3-I1 CLOSED / RSM-3-I2 CLOSED / RSM-3-I3-PRE1 CLOSED / RSM-3-I3 AUTHORIZED`  
**Task state:** `AUTHORIZED / READY TO RESUME IMPLEMENTATION`  
**Work mode:** `FULL RSM-3-I3 IMPLEMENTATION AUTHORIZED TO RESUME / NOT EXECUTED BY ALIGN1`  
**Snapshot date:** 2026-08-09  
**Timezone:** Europe/Istanbul  
**Repository:** `PRESENT — C:\RetroStage\retrostage-maker`  
**RSM-2:** `CLOSED / SOURCE PASS`  
**RSM-4:** `BLOCKED UNTIL RSM-3 CLOSURE`  

---

## 1. Purpose

This document controls the active RSM-3 milestone after the explicit closure of RSM-2, RSM-3-I1, RSM-3-I2, and the RSM-3-I3-PRE1 security remediation.

It defines:

- what RSM-3 must prove,
- what the authorized RSM-3-I3 slice may establish,
- what may and may not be created,
- how repository, remote, toolchain, backup, and restore evidence must be handled,
- and when RSM-4 may begin.

It records the accepted PRE1 security-remediation repository baseline. It does not claim that full I3 implementation has resumed or that CI, dependency-review automation, SBOM generation, third-party-notice generation, push, clean clone, restore proof, or product implementation has occurred.

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

RSM-3-I3 resume is authorized by the accepted phase chain, the completed I1/I2 controls, the accepted PRE1 security commit, and independent PRE1 closure:

| Phase / gate | Current result | Authority anchor |
|---|---|---|
| `RSM-2` | `CLOSED / SOURCE PASS` | RSM-2 closure evidence |
| `RSM-3-A` | `ACCEPTED` | accepted audit/readiness package |
| `RSM-3-B` | `ACCEPTED` | accepted repository/toolchain/source-import contract package |
| `RSM-3-C` | `ACCEPTED` | accepted supply-chain/backup/restore boundary package |
| `RSM-3-D` | `TERMINALLY ACCEPTED` | `RSM-3-D-TERM1-OWNER-SOURCE-GOVERNANCE-EXCEPTION-AND-DECISION-LOCK.md`; `RSM-3-D-TERM1-CHATGPT-INDEPENDENT-TERMINAL-REVIEW.md` |
| `RSM-3-I1` | `CLOSED` | accepted root commit `6d67b19f136cdd0a36ae11a861f4ba8b0addd196`; independent decision `RSM-3-I1 CLOSED / RSM-3-I2 ALIGNMENT ELIGIBLE` |
| `RSM-3-I2` | `CLOSED` | accepted commit `302538e3692ed82daa969bceed0a63945736fc5f`; independent decision `RSM-3-I2 CLOSED / RSM-3-I3 ALIGNMENT ELIGIBLE` |
| `RSM-3-I3-PRE1` | `CLOSED` | accepted security commit `5c7ff6322ba2583176065a919db385d51b650fba`; independent decision `RSM-3-I3-PRE1 CLOSED / RSM-3-I3 CURRENT-STATE ALIGNMENT REQUIRED BEFORE RESUME` |
| `RSM-3-I3` | `AUTHORIZED / READY TO RESUME IMPLEMENTATION` | this post-PRE1 current-state alignment and accepted PRE1 closure lineage |
| `RSM-3-I4` | `BLOCKED ON RSM-3-I3` | requires accepted I3 evidence plus I4-specific entry authority |
| `RSM-3-V1` | `BLOCKED` | requires accepted I1–I4 evidence |
| `RSM-3-CLOSE1` | `BLOCKED` | requires accepted V1 |
| `RSM-4` | `BLOCKED UNTIL RSM-3 CLOSURE` | cannot begin during the current milestone |

Recursive FIX/review history remains evidence history and does not replace the terminal current-authority chain. RSM-3-I3 resume authorization is prospective and does not claim full I3 execution by ALIGN1.

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
17. `RSM-3-D-ALIGN1-AUTHORITY-DELTA-LOCK.tsv` and its aligned sources 02, 08, and 09;
18. the accepted RSM-3-I1 import, candidate-review, commit, post-commit-review, and closure evidence;
19. `RSM-3-I1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv` and the aligned current sources 02 and 08;
20. the accepted RSM-3-I2 implementation, FIX1, staged-review, commit, post-commit-review, and closure evidence;
21. `RSM-3-I2-ALIGN1-AUTHORITY-DELTA-LOCK.tsv` and the aligned current sources 02 and 08;
22. the accepted RSM-3-I3-PRE1 owner lock, remediation, independent reviews, commit, post-commit evidence, and closure;
23. `RSM-3-I3-PRE1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv` and the aligned current sources 02 and 08.

`RSM-3-D-TERM1-CURRENT-AUTHORITY-CUTOFF.tsv` remains immutable. D-ALIGN1 records only the bounded post-cutoff identity delta for sources 02, 08, and 09; later I1/I2 ALIGN1 controls record only their bounded live-source deltas. Physical repository evidence remains authoritative for repository facts.

---

## 5. Current Truth

```text
Repository: PRESENT
Repository path: C:\RetroStage\retrostage-maker
Branch: main
HEAD: 5c7ff6322ba2583176065a919db385d51b650fba
Parent: 302538e3692ed82daa969bceed0a63945736fc5f
HEAD role: ACCEPTED RSM-3-I3-PRE1 SECURITY REMEDIATION COMMIT
Commit count: 3
HEAD parent count: 1
HEAD tree files: 105
Working tree: CLEAN
Staged changes: 0
Unstaged changes: 0
Untracked files: 0
Origin: https://github.com/caosvein/retrostage-maker.git
Remote refs: 0
Push: NONE
Upstream: NONE
pnpm workspace: PRESENT
pnpm-lock.yaml: PRESENT
I2 direct dev dependencies: 7 exact
Vitest: 3.2.6
Critical Vitest remediation: COMMITTED
Open non-blocking security finding: GHSA-xffm-g5w8-qvg7 / @eslint/plugin-kit@0.2.8 / low
Product dependencies: NONE
CI: NONE
SBOM: NONE
Third-party notices: NONE
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

The exact seven I2 direct development dependencies are audited and pinned. Any additional I3 compliance dependency requires its own exact admission evidence before use.

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

The accepted phase chain is `RSM-3-A → RSM-3-B → RSM-3-C → RSM-3-D → RSM-3-I1 → RSM-3-I2 → RSM-3-I3-PRE1`. I1, I2, and I3-PRE1 are closed. Only `RSM-3-I3` is now authorized to resume implementation. I4 is blocked on I3; V1 and CLOSE1 remain blocked.

The remaining controlled sequence is `I3 → I4 → V1 → CLOSE1`.

---

## 10. Current Task — RSM-3-I3

`RSM-3-I3 — CI / Dependency Review / SBOM / Third-Party Notices` is the only currently authorized implementation slice and is ready to resume from the accepted PRE1 security baseline.

Its bounded purpose is to add the approved CI, dependency-review, SBOM, and third-party-notice baseline to security commit `5c7ff6322ba2583176065a919db385d51b650fba`. PRE1 is closed, but authorization does not mean any full-I3 workflow, dependency-review result, SBOM, notice artifact, or staged candidate already exists.

---

## 11. RSM-3-I3 Authorized Scope

- operate only on the accepted canonical PRE1 security repository baseline through a revised separately controlled I3 implementation task;
- create only the bounded CI and dependency-review controls assigned to I3;
- admit any required compliance tooling only through exact dependency and license review within RSM-3 authority;
- generate the bounded SBOM and third-party-notice baseline assigned to I3;
- synchronize the post-PRE1 aligned live source 02/08 identities into the repository as an explicit traceable I3 delta;
- produce reviewable I3 evidence and stop before any commit or push unless separately authorized.

Authorization is prospective. Every I3 physical fact must be observed and recorded during I3.

---

## 12. RSM-3-I3 Forbidden Scope

- product code or product functionality;
- product dependencies owned by later milestones;
- Electron / Forge / Vite before RSM-5;
- Babylon.js before RSM-6;
- React editor UI before RSM-9;
- TypeBox/Ajv before RSM-11;
- final source 07 authority before commands are physically observed;
- synthetic reconstruction of the nine unavailable historical files;
- automatic commit or push;
- remote push, backup, clean-clone, or restore work owned by I4;
- secret exposure or unrelated directory mutation;
- declaring RSM-3 complete or starting RSM-4.

---

## 13. RSM-3-I3 Evidence Requirement

I3 must return a reviewable physical package that identifies at minimum:

- repository root, branch, HEAD, and working-tree baseline;
- every I3-created or I3-modified path and its physical hash;
- exact CI, dependency-review, SBOM, notice, dependency, and script declarations;
- exact 02/08 repository synchronization delta;
- validation commands actually run and their results;
- exact I3 commit-candidate inventory;
- all blockers or divergences.

The evidence may support `READY FOR REVIEW` or `BLOCKED`; it may not silently advance to commit or push.

---

## 14. RSM-3-I3 Stop Conditions

Stop if:

- the accepted PRE1 security repository baseline or current post-PRE1 02/08 authority cannot be applied exactly;
- a current-authority source is missing, ambiguous, or hash-divergent without authorized mapping;
- an operation would synthesize the unavailable historical bytes;
- required toolchain/dependency identities cannot be resolved within RSM-3 authority;
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

I3 is now explicitly authorized to resume after accepted PRE1 closure and this alignment. I4 depends on accepted I3 and its own entry controls; V1 depends on accepted I1–I4; CLOSE1 depends on an accepted V1. No transition authorizes an automatic commit or push.

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
| Unsafe local root | Accepted owner-locked path plus accepted PRE1 security repository baseline |
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

No source-governance blocker prevents authorized RSM-3-I3 execution. The nine historical bytes remain unavailable under `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE`, but TERM1 has dispositioned that condition as a bounded owner-accepted exception; it is not permission to reconstruct them.

RSM-3-I1, RSM-3-I2, and RSM-3-I3-PRE1 repository facts are accepted and present. I3 is authorized / ready to resume implementation. The open low finding `GHSA-xffm-g5w8-qvg7 / @eslint/plugin-kit@0.2.8` must remain visible in resumed I3 evidence. I4 is blocked on I3; V1, CLOSE1, source 07 finalization, RSM-4, and Gate B remain blocked.

---

## 27. Immediate Next Action

```text
Resume the bounded RSM-3-I3 contract using one declared primary local engineering tool and a revised prompt that consumes the post-PRE1 source identities and closure lineage.
Create and validate only the approved CI / dependency-review / SBOM / third-party-notice slice.
Return READY FOR REVIEW or BLOCKED; do not commit or push automatically.
```

---

## 28. Status Transition Rules

RSM-3-I3 may transition:

```text
READY TO RESUME IMPLEMENTATION
→ IN PROGRESS
→ READY FOR REVIEW
```

or:

```text
READY TO RESUME IMPLEMENTATION
→ IN PROGRESS
→ BLOCKED
```

RSM-3 remains `CURRENT` throughout these task transitions.

---

## 29. Update Triggers

Update this document when:

- RSM-3-I3 starts or completes;
- I3 CI, dependency-review, SBOM, notice, and source-alignment facts are accepted;
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
RSM-3-I1 is closed.
RSM-3-I2 is closed.
RSM-3-I3-PRE1 is closed.
RSM-3-I3 is authorized / ready to resume implementation.
The accepted local repository exists at C:\RetroStage\retrostage-maker.
The critical Vitest remediation is committed at 5c7ff6322ba2583176065a919db385d51b650fba.
ALIGN1 has not executed full I3 implementation.
No product implementation is authorized.
Gate A remains open.
```

---

## 31. Approval Statement

Acceptance of this milestone source means:

- RSM-2 closure is accepted;
- RSM-3-A, RSM-3-B, and RSM-3-C acceptance is current;
- RSM-3-D terminal acceptance is current;
- RSM-3-I1 closure is accepted;
- RSM-3-I2 closure is accepted;
- RSM-3-I3-PRE1 closure is accepted;
- only RSM-3-I3 may resume implementation;
- RSM-3-I4 and all later RSM-3 slices remain blocked by their dependency gates;
- source 07 remains deferred;
- backup/restore evidence is mandatory;
- product dependencies remain milestone-gated;
- and the two-AI workflow requirement is recorded for controlled later definition.
