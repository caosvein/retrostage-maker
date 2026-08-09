# RetroStage Maker — RSM-3-A Interim Multi-AI Execution Assignment

**Document ID:** `RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Task:** `RSM-3-A — Environment / Repository / Remote / Toolchain Audit`  
**Prepared:** 2026-08-05  
**Timezone:** Europe/Istanbul  
**Status:** `ACTIVE FOR RSM-3-A ONLY`  
**Authority level:** task execution assignment; does not supersede the charter, roadmap, workflow, architecture map, technology contract, current-state source, or current-milestone source

---

## 1. Purpose

This document assigns safe temporary roles to the two local AI applications the project owner intends to use during RSM-3-A.

It exists to prevent:

- two agents writing the same files concurrently;
- contradictory environment claims;
- one tool accepting the other tool's narrative without evidence;
- hidden commits, pushes, installs, or global configuration changes;
- model-brand assumptions from becoming project authority;
- and audit output from being mistaken for repository implementation.

The permanent multi-AI operating model remains deferred to:

```text
RSM-4-ADD1 — Multi-AI Application / Agent Role / Handoff / Review Model
```

---

## 2. Temporary Role Assignment

### 2.1 Human Project Owner

The owner:

- controls the workstation;
- chooses whether commands may be executed;
- decides materially different path, remote, branch, authentication, backup, and installation options;
- owns credentials and secrets;
- authorizes installation or system-wide changes;
- authorizes commit and push;
- and accepts or rejects RSM-3-A readiness.

### 2.2 ChatGPT Project Control Plane

ChatGPT acts as:

- source-set custodian;
- task orchestrator;
- prompt author;
- evidence reviewer;
- architecture and workflow reviewer;
- blocker classifier;
- and final review assistant.

ChatGPT does not claim direct knowledge of the local workstation. Local facts must come from inspected command evidence.

### 2.3 Antigravity IDE — Primary Executor for RSM-3-A

Antigravity IDE is the declared primary executor for this audit.

Its permitted role is:

- read the accepted sources;
- inspect the local environment through non-destructive commands;
- collect exact outputs;
- produce the five required RSM-3-A artifacts;
- avoid installation and configuration changes;
- stop on material owner decisions;
- and report the complete evidence inventory.

The exact model selected inside Antigravity must be recorded as displayed by the application at execution time. User-mentioned model labels are not treated as verified product/version facts by this assignment.

### 2.4 Codex — Independent Read-Only Reviewer for RSM-3-A

Codex is the secondary tool for this audit.

Its permitted role is:

- read the authoritative sources;
- read the primary executor's commands and outputs;
- inspect the five produced audit artifacts;
- identify unsupported claims, missing evidence, unsafe assumptions, or scope leaks;
- verify that no product implementation or hidden mutation occurred;
- and produce a review report.

Codex must not modify the five primary output files during this task.

The exact Codex application/model label must be recorded as displayed at review time. Model names do not alter the authority rules.

---

## 3. One-Writer Rule

For RSM-3-A:

```text
Primary writer:
Antigravity IDE

Secondary reviewer:
Codex, read-only

Control and final review:
ChatGPT + project owner

Commit/push authority:
project owner only
```

Codex must not independently rewrite the primary executor's audit artifacts.

If correction is required:

1. Codex reports the exact material issue.
2. ChatGPT or the owner classifies it.
3. Antigravity performs the approved correction.
4. Codex re-reviews the corrected artifact.

---

## 4. No Concurrent Repository Mutation

RSM-3-A does not create the repository.

Later, after a repository exists, the default remains:

- one active working tree writer per task;
- no parallel edits to overlapping files;
- no shared uncommitted working tree between independent agents;
- and no parallel branch/worktree use until an explicit workflow contract permits it.

A second tool may inspect the same repository read-only.

---

## 5. Handoff Package

The primary executor must hand off:

```text
RSM-3-A-ENVIRONMENT-INVENTORY.md
RSM-3-A-SOURCE-READ-MANIFEST.tsv
RSM-3-A-TOOLCHAIN-INVENTORY.tsv
RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
RSM-3-A-READINESS-REPORT.md
```

The handoff must also include:

- exact commands executed;
- relevant command output;
- exact local paths inspected;
- timestamp and timezone;
- warnings and failures;
- files created;
- files modified;
- confirmation that no install, commit, push, global configuration change, or product implementation occurred;
- and one terminal decision: `READY FOR RSM-3-B` or `BLOCKED`.

---

## 6. Model Selection Rule

For this task, application role outranks model preference.

Model selection may consider:

- context size;
- command reliability;
- source-reading quality;
- careful handling of Windows paths and PowerShell;
- and evidence reporting.

However:

- a stronger model does not gain extra write authority;
- two models do not independently implement the same task;
- a model's confidence is not evidence;
- and model output is reviewable work product, not project truth.

The permanent task-to-model selection matrix will be designed after RSM-3 establishes the physical repository and tool environment.

---

## 7. Installation and Workstation Rebuild Boundary

RSM-3-A may discover missing applications and tools, but it may not install them without explicit owner authorization.

It must classify every discovered requirement as:

```text
REQUIRED BEFORE RSM-3-B
REQUIRED DURING A LATER RSM-3 SLICE
MILESTONE-GATED PRODUCT TOOL
OPTIONAL PRODUCTIVITY TOOL
NOT REQUIRED
UNKNOWN / REQUIRES DECISION
```

The consolidated workstation rebuild and installation list will be produced after the observed audit, not guessed in advance.

Likely categories to inspect include, without asserting installation need:

- Git and authentication tooling;
- Node/Corepack/pnpm;
- PowerShell and Windows environment settings;
- GitHub access;
- Antigravity IDE;
- Codex;
- code-signing or native build prerequisites;
- Visual Studio or Build Tools;
- Windows SDK;
- Python/node-gyp prerequisites;
- archive/backup utilities;
- and clean-clone/restore destinations.

---

## 8. Stop Conditions

Stop the primary execution if:

- accepted source files are unavailable or hash-mismatched;
- commands would reveal credentials or secrets;
- a path contains unrelated work;
- a materially different owner choice is required;
- installation or global configuration change is required;
- a command would create, initialize, commit, push, delete, overwrite, or clean content;
- or Antigravity cannot produce exact command evidence.

Stop the secondary review if:

- primary artifacts are incomplete;
- evidence logs are missing;
- the reviewer would need to modify primary artifacts;
- or the review cannot distinguish observed facts from assumptions.

---

## 9. Completion

This temporary assignment completes when:

- Antigravity produces the RSM-3-A audit outputs;
- Codex completes independent read-only review;
- ChatGPT and the owner inspect both sets of evidence;
- and the owner accepts either `READY FOR RSM-3-B` or `BLOCKED`.

This document does not close RSM-3-A by itself.
