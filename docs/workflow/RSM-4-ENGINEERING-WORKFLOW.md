# RetroStage Maker Repository Engineering Workflow

**Role:** Repository realization of the authoritative workflow  
**Authority:** [Source 04](../sources/04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md)  
**Operational commands:** [Source 07](../sources/07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md)

This document makes the approved Source 04 workflow usable in the repository. It does not replace or compete with Source 04. Where this summary and an authoritative source differ, the source controls and work stops for review.

## One Active Task

At most one implementation task may be `ACTIVE`. The milestone evidence manifest records that state. Automation can reject multiple `ACTIVE` rows; the reviewer and owner remain responsible for deciding which task is active.

## Baseline Before Mutation

Every task starts by recording the repository path, branch, expected and actual HEAD, upstream and remote identity, staged/unstaged/untracked/stash state, toolchain and lockfile identity, sources read, current-state source, and current-milestone source. A material mismatch stops work; it is never repaired by an unrequested reset, clean, stash, checkout, rebase, amend, or history rewrite.

## Exact Scope Contract

Every plan names exact allowed and forbidden paths, production/test/schema/dependency/source permissions, required validation, stop conditions, final inventory, and commit/push permissions. Scope is not broadened for cleanup or convenience.

## Evidence Classification

Use the narrowest truthful class: `OBSERVED`, `HISTORICAL EVIDENCE`, `APPROVED CONTRACT`, `CURRENT INFERENCE`, `FUTURE ROADMAP INTENT`, `UNKNOWN`, or `NONE OBSERVED`. Designed, implemented, validated, staged, committed, pushed, restored, and closed are distinct states.

## Validation and Failure Evidence

Validation must directly cover changed behavior and risk. Record the exact command, environment, exit code, tests/assertions, skipped work, warnings, generated artifacts, and cleanup. Positive evidence alone is insufficient where a fail-closed boundary exists; required negative cases must prove rejection behavior.

## Staged Snapshot Review

Only reviewed task paths may be staged. After the last material edit, inspect the complete changed, staged, unstaged, and untracked inventories; the full cached diff; `git diff --check`; line endings; accidental deletions; generated or temporary artifacts; manifests; lockfiles; and forbidden scope. A materially changed staged patch invalidates earlier patch review.

## Review Decisions and Material Blockers

Allowed implementation-review decisions are `PASS`, `PASS WITH INFORMATIONAL NOTES`, `FIX REQUIRED`, and `BLOCKED`. Incorrect authority, behavior, scope, evidence, dependency/license state, security boundary, data safety, repository identity, or required validation is material. Cosmetic preference is not a material blocker.

## Commit and Post-Commit Verification

`commit default = FALSE`. Commit is allowed only after independent `PASS` and separate owner authorization. After an authorized commit, verify new HEAD and parent, subject, commit stat and exact path inventory, committed diff checks, branch/upstream, staged/unstaged/untracked/stash state, and equality with the reviewed staged snapshot.

## Push, Remote, CI, Backup, and Restore

`push default = FALSE`. Push occurs only when separately authorized. Then verify physical remote branch identity, local/remote HEAD equality, normal non-force push, and required hosted CI. A local commit is not off-device protection. Backup and restore are risk-owned: a backup claim is accepted only after the required isolated restore proof succeeds under Source 07.

## Dependency Admission

No dependency enters for convenience. A task states `NO DEPENDENCY CHANGE` or completes the dependency-admission template with exact identity, need, classification, authority/adapter boundary, transitive/license/native/WASM/install/security/bundle/SBOM/notice impacts, replacement/removal path, tests, and approval. Experiments do not silently alter the baseline lockfile.

## Architecture Review

Architecture-sensitive tasks use the architecture-review template. Review covers authority ownership, dependency direction, technology boundaries, data safety, Preview/PIE/Export separation, editor/player separation, commercial artifacts, and direct evidence. Mechanical graph checks complement but do not replace semantic review.

## Current-State Source Alignment

Ordinary implementation tasks do not silently edit current-state authority. Source alignment requires explicit scope, the accepted baseline, exact authorized fields, preserved milestone identities, and a truthful separation between source completion and implementation completion.

## Enforcement Ownership

- **Mechanically enforceable:** required paths and fields, source hashes, at-most-one active manifest row, current dependency/product guards, validation commands, and staged inventory.
- **Review enforceable:** semantic narrowness, evidence truth, architecture ownership, blocker decisions, and risk-owned recovery need.
- **Owner authorized:** dependency exceptions, architecture/source-authority changes, commit, push, milestone closure, Gate activation, and next-milestone activation.

Software does not claim to perfectly enforce human decisions.

## RSM-4 Product Boundary

`RSM-4 product implementation = FORBIDDEN`. RSM-4 adds no Electron shell, Babylon viewport, React product UI, project/scene schema, gameplay/runtime, asset pipeline, player/export, Steam, marketplace, payment, or DLC capability. Gate B remains inactive and RSM-5 remains blocked until separate authority exists.

