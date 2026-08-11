# RSM-4-I1 — Repository Workflow Baseline Activation

## Mode and Type

- Work mode: `REPOSITORY TASK`
- Task type: `IMPLEMENTATION / VALIDATION / EXACT STAGING`
- Risk class: `HIGH`
- Primary executor: `Codex`
- Independent reviewer: `ChatGPT`

## Baseline

```text
repository = C:\RetroStage\retrostage-maker
branch = main
HEAD = 5cec4ae7ef05dfe392b0e768dd9ca7d91a5dbc4e
origin/main = HEAD
physical remote main = HEAD
upstream = origin/main
working tree/index at entry = CLEAN
commit count = 6
tree paths = 193
entry manifest = RSM-4-I1-ENTRY-AUTHORITY-MANIFEST.tsv
entry manifest SHA-256 = EB0A34859E5E404032A4F36867B0490B504A1A5C611CE873591E3CFEB0BAC946
```

## Purpose

Materialize the accepted RSM-4 repository workflow baseline, synchronize the complete accepted Source 00-09 package, and leave one exact independently reviewable staged candidate without product implementation, commit, or push.

## Observed Starting Facts

- Entry manifest and all 17 `CURRENT` artifacts matched physically.
- RSM-4-A authorized one 30-path implementation slice.
- The repository and physical remote matched the expected baseline.
- Existing CI already runs `pnpm run validate`; no workflow YAML change is required.

## Allowed Scope

### New paths — 17

```text
docs/sources/SOURCE-MANIFEST.tsv
docs/workflow/RSM-4-ENGINEERING-WORKFLOW.md
docs/workflow/templates/task-plan.md
docs/workflow/templates/evidence-manifest.md
docs/workflow/templates/validation-report.md
docs/workflow/templates/closure-report.md
docs/workflow/templates/dependency-admission.md
docs/workflow/templates/architecture-review.md
docs/workflow/templates/coding-agent-prompt.md
docs/workflow/templates/coding-agent-final-report.md
docs/evidence/rsm-4/RSM-4-MILESTONE-EVIDENCE-MANIFEST.tsv
docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-TASK-PLAN.md
docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-EVIDENCE-MANIFEST.md
docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-VALIDATION-REPORT.md
docs/evidence/rsm-4/rsm-4-i1/RSM-4-I1-STAGED-CANDIDATE-REPORT.md
tooling/workflow-policy.mjs
tooling/workflow-policy.test.mjs
```

### Modified paths — 13

```text
package.json
tooling/repository-policy.ts
tooling/repository-policy.test.mjs
docs/sources/00_RSM_REBOOT_PROJECT_CHARTER.md
docs/sources/01_RSM_REBOOT_CANONICAL_ROADMAP.md
docs/sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
docs/sources/03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md
docs/sources/04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md
docs/sources/05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md
docs/sources/06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md
docs/sources/07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md
docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md
docs/sources/09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md
```

## Forbidden Scope

- Every repository path outside the exact 30 paths above.
- `.github/workflows/ci.yml`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, configuration and compliance baselines.
- Historical `docs/evidence/rsm-2/**` and `docs/evidence/rsm-3/**`.
- `packages/**`, `apps/**`, product implementation, dependency changes, commit, and push.
- Gate B activation, RSM-4 closure, or RSM-5 start.

## Dependency / Schema / Architecture Permissions

```text
production dependency change = FALSE
development dependency change = FALSE
lockfile change = FALSE
persisted schema/migration change = FALSE
product architecture change = FALSE
source synchronization = exact accepted Source 00-09 only
Preview / PIE / Export impact = NONE
editor/player impact = NONE
```

## Required Inspection

- Source 04 workflow, Source 06 dependency/license rules, Source 07 commands.
- Current `package.json`, repository policy/tests, CI, architecture and compliance scripts.
- Complete changed/staged/unstaged/untracked inventories and final cached patch.

## Implementation Requirements

1. Synchronize Source 00-09 byte-exact and create the ten-row source manifest.
2. Materialize the repository workflow and eight standalone templates.
3. Add the RSM-4 milestone/task evidence structure.
4. Reconcile only Vitest 3.2.6 and established `.github` handling in repository policy.
5. Add a Node-built-in workflow policy with isolated positive/negative tests.
6. Add `workflow:check` to the existing package validation chain without dependency or CI YAML change.

## Validation Requirements

- Frozen install and every command required by the authoritative RSM-4-I1 prompt.
- Exact positive/negative workflow-policy cases.
- Full local validation, compliance, audit, `ci:validate`, source byte equality, guard hashes, and Git diff checks.
- Terminal verification after exactly 30 paths are staged.

## Negative / Fail-Closed Cases

- Missing path/field; duplicate, missing, extra or drifted Source row/file; two active tasks; product root/content; production dependency; unauthorized/inexact direct development dependency.

## Stop Conditions

- Baseline/authority drift; path leakage; source mismatch; dependency/lockfile/CI/compliance/product drift; failed validation; temporary residue; staging other than 30 paths; any need to commit or push.

## Allowed Final Inventory

```text
new = 17
modified = 13
deleted = 0
renamed = 0
staged = 30
expected final tree paths = 210
temporary artifacts = 0
```

## Commit / Push Permission

- Commit: `FALSE`
- Push: `FALSE`

## Closure Criteria

Exact scope and source sync pass; workflow/templates and policy checks pass; full and terminal validation pass; forbidden files remain unchanged; exactly 30 paths are staged; external evidence is complete; candidate is handed to ChatGPT without claiming independent review or RSM-4 closure.

## Required Final Report

Repository reports record observed implementation and first validation. Terminal staged-candidate evidence is external to avoid self-reference.

