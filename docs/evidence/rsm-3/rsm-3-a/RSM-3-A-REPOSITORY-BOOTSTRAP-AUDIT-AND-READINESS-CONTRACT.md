# RetroStage Maker — RSM-3-A Repository Bootstrap Audit and Readiness Contract

**Document ID:** `RSM-3-A-REPOSITORY-BOOTSTRAP-AUDIT-AND-READINESS-CONTRACT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Task:** `RSM-3-A — Environment / Repository / Remote / Toolchain Audit`  
**Task class:** `AUDIT / READINESS`  
**Risk class:** `HIGH`  
**Prepared:** 2026-08-05  
**Timezone:** Europe/Istanbul  
**Repository at task start:** `NOT YET CREATED`  
**Execution state:** `READY FOR OWNER-SELECTED LOCAL ENGINEERING TOOL`  

---

## 1. Task Purpose

RSM-3-A determines the exact physical environment in which the RetroStage Maker reboot repository can be created safely and reproducibly.

It prevents the project from inventing:

- a repository path,
- a remote URL,
- a branch,
- installed tool versions,
- authentication state,
- backup destinations,
- command names,
- or restore behavior.

RSM-3-A is an audit and readiness task. It does not create the product implementation.

---

## 2. Authoritative Inputs

The executor must read, in this order:

1. `00_RSM_REBOOT_PROJECT_CHARTER.md`
2. `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
3. `01_RSM_REBOOT_CANONICAL_ROADMAP.md`
4. `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
5. `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
6. `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
7. `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
8. `08_RSM_REBOOT_CURRENT_MILESTONE.md`
9. `09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`
10. `RSM-2-V1-SOURCE-SET-CONSISTENCY-REVIEW.md`
11. `RSM-2-CLOSE1-SOURCE-RECONSTRUCTION-CLOSURE.md`

The task may not reinterpret historical sources as live implementation.

---

## 3. Audit Questions

The executor must collect observed answers for:

### 3.1 Local storage

- What supported local drives are available?
- Which drive is appropriate for an active source repository?
- Is the proposed root writable?
- Is there adequate free space?
- Is the path short enough for Windows tooling?
- Is the path outside disposable/temp/sync-conflict directories?
- Is the path free of an unrelated existing repository?

### 3.2 Git environment

- Is Git installed?
- What exact version is installed?
- What global user name and email are configured?
- Is the intended primary branch policy supported?
- Are credential helpers or SSH keys available?
- Is any existing remote account authenticated?

### 3.3 Node toolchain

- Is Node.js installed?
- What exact version is active?
- Is Corepack available and enabled?
- Is pnpm installed or resolvable through Corepack?
- What exact pnpm version is available?
- Is a global TypeScript installation present, and if so, will it be ignored in favor of project-local TypeScript?

### 3.4 Remote and backup

- Which remote provider will host the canonical off-device repository?
- What exact repository name is available?
- Will the repository be private or public?
- What authentication method will be used?
- What separate backup/snapshot destination exists?
- Where will clean-clone and restore tests be performed?

### 3.5 Source import

- Where are the accepted reboot sources currently stored?
- Are all files readable?
- Do their hashes match the closure manifest?
- Where will active sources live inside the repository?
- Where will immutable historical sources live?

### 3.6 Shell and execution environment

- Which shell will be authoritative for bootstrap commands?
- Are PowerShell and/or another supported shell available?
- Are execution policies or antivirus controls likely to block scripts?
- Is long-path support enabled where needed?

---

## 4. Allowed Scope

RSM-3-A may:

- inspect drives, directories, environment variables, and free space;
- inspect Git, Node, Corepack, pnpm, and shell versions;
- inspect Git identity and authentication readiness without exposing secrets;
- inspect candidate remote availability;
- inspect the accepted source bundle and hashes;
- propose one canonical repository path;
- propose one remote plan;
- propose one primary branch;
- propose one backup and restore plan;
- record blockers and decisions required from the owner;
- produce a readiness report and exact RSM-3-B contract inputs.

---

## 5. Forbidden Scope

RSM-3-A may not:

- install product dependencies;
- install Electron, Babylon, React, TypeBox, Ajv, Havok, or asset-pipeline packages;
- create product applications or packages;
- implement canonical documents;
- implement editor, renderer, runtime, gameplay, asset, export, UI, audio, or cinematic features;
- copy historical code into live source;
- create or push a repository without the task's explicit implementation authorization;
- delete or overwrite unrelated directories;
- reveal credentials, tokens, private keys, or secret environment values;
- change global Git configuration without explicit owner approval;
- change system-wide tool versions without explicit owner approval;
- write `07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` as final authority;
- commit or push automatically;
- or claim RSM-3 has passed.

---

## 6. Required Outputs

RSM-3-A must produce:

```text
RSM-3-A-ENVIRONMENT-INVENTORY.md
RSM-3-A-SOURCE-READ-MANIFEST.tsv
RSM-3-A-TOOLCHAIN-INVENTORY.tsv
RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
RSM-3-A-READINESS-REPORT.md
```

The readiness report must end with exactly one decision:

```text
READY FOR RSM-3-B
BLOCKED
```

---

## 7. Evidence Requirements

The report must distinguish:

- observed fact,
- owner decision,
- approved source requirement,
- inference,
- and unresolved unknown.

Evidence should include, where applicable:

- exact command invoked,
- exact relevant output,
- timestamp and timezone,
- candidate path existence checks,
- free-space result,
- Git version and identity status,
- Node/Corepack/pnpm versions,
- remote authentication status without secrets,
- source file inventory and hashes,
- backup target availability,
- clean-clone target path,
- and stop-condition results.

Screenshots are supplemental, not substitutes for command evidence.

---

## 8. Stop Conditions

Stop and report `BLOCKED` if:

- no safe local repository root is available;
- the candidate path contains unrelated work;
- no off-device remote can be established;
- no restore destination exists;
- the accepted source bundle is incomplete or hash-mismatched;
- Git is unavailable and installation is not explicitly authorized;
- Node/pnpm requirements cannot be met without an unapproved system change;
- authentication requires exposing secrets;
- the task would need to overwrite or delete unrelated data;
- or the owner must choose between materially different path/remote/branch options.

A blocker must not be bypassed by guessing.

---

## 9. RSM-3-B Readiness Inputs

When `READY FOR RSM-3-B`, the report must supply:

- exact canonical repository path;
- exact remote provider and intended URL/name;
- exact primary branch;
- exact Git authentication method;
- exact Node version candidate;
- exact pnpm version candidate;
- exact TypeScript version candidate for project-local admission;
- exact authoritative shell;
- exact source import directories;
- exact historical archive directory;
- exact backup target;
- exact clean-clone target;
- exact restore target;
- approved initial directory skeleton;
- and any owner-approved environment changes.

---

## 10. Proposed RSM-3 Phase Structure

RSM-3 should proceed through:

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

This structure may be refined only through an approved current-milestone update.

---

## 11. Multi-AI Execution Guard

The owner intends to use both Antigravity IDE and Codex actively.

Until `RSM-4-ADD1 — Multi-AI Application / Agent Role / Handoff / Review Model` is approved, RSM-3-A must declare one primary executor.

Permitted temporary pattern:

```text
Primary executor:
one selected AI application

Secondary tool:
read-only review, evidence audit, or prompt critique

Write authority:
primary executor only for the declared task

Commit/push authority:
project owner only unless separately authorized
```

The secondary tool must not independently modify the same output files.

---

## 12. Completion Statement

RSM-3-A is complete only when:

- all audit questions have observed answers or explicit blockers;
- exact source hashes are verified;
- the owner-required decisions are recorded;
- one safe repository/remote/backup plan is selected;
- no product implementation has begun;
- and the readiness decision is reviewable.

RSM-3-A completion does not create the repository and does not close RSM-3.
