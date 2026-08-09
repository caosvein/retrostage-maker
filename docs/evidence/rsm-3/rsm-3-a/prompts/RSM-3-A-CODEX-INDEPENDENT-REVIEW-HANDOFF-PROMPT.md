# RSM-3-A — Codex Independent Read-Only Review Handoff

## Role

You are the independent read-only reviewer for:

```text
RetroStage Maker
RSM-3-A — Environment / Repository / Remote / Toolchain Audit
```

Primary audit provenance recorded in the artifacts:

```text
Initial audit:
Antigravity IDE — Claude Opus 4.6 (Thinking)

Correction passes:
Antigravity IDE — Gemini 3.1 Pro (High)
```

Do not assume access to either prior Antigravity conversation or hidden reasoning. Review only the files and directly observed read-only evidence available in the workspace.

Record the exact Codex application/model label displayed at review time. Do not infer or normalize it.

## Workspace

Open only:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

This is a temporary audit workspace, not the future repository.

## Immutable primary-output baseline

The following five primary outputs are the exact review baseline. Do not edit, rename, regenerate, normalize, or repair them.

| File | SHA-256 |
|---|---|
| `Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md` | `C07130FC505787642E00C7AFECC19A77E89B06BB2DF2FA91C822470E9EFB3C21` |
| `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv` | `646DF8E3F0BDCA739399A71D9AFE696E181F994EE6AB36792D99BF1E7BA5F6C6` |
| `Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv` | `FABF93F2014B096D61172C22BF226E47EA46EB01405858035AE0B78F6DE8E699` |
| `Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md` | `116879F16C26368612B0F94B71BFE5D8900762843B125EEE565B56A95D1AB3E6` |
| `Outputs\RSM-3-A-READINESS-REPORT.md` | `CE10C12BA30F114B0521E59C39538368067B784FED991717B69F2385B961A997` |

Recompute these hashes before review. If any value differs, stop and report `BLOCKED — PRIMARY BASELINE MISMATCH`.

## Files to read fully

### Authoritative sources

1. `Sources\00_RSM_REBOOT_PROJECT_CHARTER.md`
2. `Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
3. `Sources\01_RSM_REBOOT_CANONICAL_ROADMAP.md`
4. `Sources\05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
5. `Sources\03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
6. `Sources\04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
7. `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
8. `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`
9. `Sources\09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`
10. `Sources\RSM-2-V1-SOURCE-SET-CONSISTENCY-REVIEW.md`
11. `Sources\RSM-2-CLOSE1-SOURCE-RECONSTRUCTION-CLOSURE.md`
12. `Sources\RSM-3-A-REPOSITORY-BOOTSTRAP-AUDIT-AND-READINESS-CONTRACT.md`

### Execution-control prompts

13. `Prompts\RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md`
14. `Prompts\RSM-3-A-ANTIGRAVITY-PRIMARY-AUDIT-PROMPT.md`
15. `Prompts\RSM-3-A-CODEX-READ-ONLY-REVIEW-PROMPT.md`

### Primary outputs

16. `Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md`
17. `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv`
18. `Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv`
19. `Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md`
20. `Outputs\RSM-3-A-READINESS-REPORT.md`

Read all 20 files completely. Do not treat filenames, headers, searches, summaries, or partial ranges as full reads.

## Allowed actions

You may:

- read the listed files;
- recompute hashes;
- run narrowly necessary non-destructive inspection commands;
- compare claims across the five primary outputs and authoritative sources;
- create exactly one permanent review file:
  `Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md`.

## Forbidden actions

Do not:

- modify the five primary outputs;
- modify Sources or Prompts;
- install or update programs;
- change registry, PATH, execution policy, Git configuration, credentials, or system settings;
- authenticate to GitHub;
- create or initialize a repository;
- run mutating Git commands;
- create a remote, branch, commit, push, clone, package manifest, lockfile, app, package, or product code;
- silently repair a finding;
- proceed to RSM-3-B;
- create any file other than the one review file.

## Review questions

### A. Baseline and scope

- Do all five baseline hashes match?
- Did the primary executor stay within the approved RSM-3-A audit scope?
- Are all permanent and temporary files accounted for?
- Is the distinction between temporary audit writes and persistent system/repository/product mutation truthful?
- Were secrets protected?

### B. Source integrity

- Does the source-read manifest contain exactly 15 rows and mark each as `FULLY_READ`?
- Do all 15 manifest sizes and SHA-256 values match the physical Sources/Prompts files?
- Are post-closure source 02 and 08 hashes treated correctly?
- Are historical sources kept separate from live reboot truth?

### C. Evidence quality

- Are observed facts, owner-provided facts, inferences, recommendations, and unresolved decisions clearly distinguished?
- Are claims supported by retained evidence?
- Are abbreviated initial command summaries truthfully labeled as summaries rather than exact terminal transcripts?
- Are failed tool-presence checks represented accurately?
- Are there material internal contradictions across the five outputs?

### D. Toolchain classification

Review at minimum:

- Git;
- Node.js;
- npm;
- Corepack;
- pnpm;
- project-local TypeScript;
- GitHub CLI;
- PowerShell;
- Visual Studio / Build Tools / Windows SDK;
- Python;
- CMake/Ninja;
- Git LFS;
- Antigravity;
- Codex.

Check that:

- Git and Node absence are true blockers;
- pnpm remains required but its activation method is unresolved;
- GitHub CLI is conditional on the owner-selected authentication route;
- LongPathsEnabled is a recommendation/owner decision rather than an invented independent blocker;
- Python/native tooling is not pulled into RSM-3 without a proven current need;
- Electron, Babylon, React, TypeBox/Ajv, and later product dependencies remain deferred.

### E. Repository, remote, backup, clone, and restore planning

- Is `C:\RetroStage\retrostage-maker` only a safe candidate rather than an existing repository?
- Is C: accurately recorded as verified NVMe?
- Are remote provider, account, visibility, branch, and authentication still owner decisions?
- Are clean-clone and restore targets separate from the canonical repository?
- Is a GitHub remote correctly distinguished from complete backup/restore proof?
- Are active-source and historical-source destination paths still decisions for the next contract stage?

### F. Status and final decision

- Does the primary readiness report end exactly with `BLOCKED`?
- Is RSM-3 current while RSM-3-A was executed but remains unaccepted?
- Is RSM-3-B correctly blocked?
- Does any finding justify changing the primary package before owner/tool remediation?
- Are remaining issues material or merely non-blocking wording/cleanup?

## Required review output

Create exactly:

```text
Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
```

Use these sections:

1. Review identity and exact Codex model label
2. Reviewed baseline and hash verification
3. Files fully read
4. Additional read-only commands and exact relevant output
5. Scope and safety decision
6. Source-integrity decision
7. Evidence-quality decision
8. Toolchain-classification decision
9. Repository/remote/backup decision
10. Material findings
11. Non-blocking observations
12. Exact corrective actions, only when material
13. Final review decision

The final review decision must be exactly one of:

```text
PASS
PASS WITH MATERIAL CORRECTIONS
BLOCKED
```

Use `PASS WITH MATERIAL CORRECTIONS` only for contradictions that can materially misdirect owner decisions, installation, repository creation, authentication, backup, or RSM-3-B handoff. Do not use it for stylistic preferences.

The last non-empty line of the review file must be the exact decision token.

## Expected primary-readiness state

The primary audit currently reports:

```text
RSM-3: CURRENT
RSM-3-A PRIMARY AUDIT: EXECUTED
RSM-3-A CORRECTION: EXECUTED
RSM-3-A ACCEPTANCE: BLOCKED / PENDING INDEPENDENT REVIEW, OWNER DECISIONS, AND TOOL REMEDIATION
RSM-3-B: BLOCKED
REPOSITORY: NOT YET CREATED
```

Independent review does not install tools, resolve owner decisions, or make the environment ready. A review `PASS` means the **audit package truthfully supports its `BLOCKED` readiness result**, not that RSM-3-A may enter RSM-3-B.

## Final chat response

Return:

- exact Codex model label;
- hash verification result;
- 20 files fully read;
- additional commands run;
- material findings;
- non-blocking observations;
- review-file path;
- final review decision.

Do not modify the primary baseline or begin remediation.
