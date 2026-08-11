# RSM-4-I1 — Evidence Manifest

## Task Identity

```text
task = RSM-4-I1 — Repository Workflow Baseline Activation
mode/type/risk = REPOSITORY TASK / IMPLEMENTATION + VALIDATION + EXACT STAGING / HIGH
expected and actual baseline = 5cec4ae7ef05dfe392b0e768dd9ca7d91a5dbc4e
branch = main
entry repository state = CLEAN
executor = Codex
independent reviewer = ChatGPT / pending
```

## Evidence Classification

- Entry, repository, source and command observations: `OBSERVED`
- RSM-4-A contract and final execution prompt: `APPROVED CONTRACT`
- Earlier RSM-3 reports: `HISTORICAL EVIDENCE`
- Product capability: `NONE OBSERVED`

## Sources Read

- `RSM-4-I1-ENTRY-AUTHORITY-MANIFEST.tsv`: exact hash and 17/17 rows verified.
- Corrected independent RSM-4-A review and owner routing lock: fully read.
- Live Source 00-09: strict UTF-8 and exact manifest identities verified.
- Source 04/06/07: workflow, dependency/license, and operational boundaries applied.

## Scope and Files

- Allowed: exact 30 repository paths in `RSM-4-I1-TASK-PLAN.md`.
- Forbidden: every other repository path, dependencies, lockfile, CI workflow, compliance, product code, commit and push.
- Changed: complete Source 00-09 sync; workflow/templates; RSM-4 evidence; two workflow-policy files; narrow repository-policy reconciliation; package scripts only.

## Impact

```text
dependency/lockfile = NO DEPENDENCY CHANGE
schema/migration = NONE
architecture = workflow enforcement only / no product architecture
Preview / PIE / Export = NONE
editor/player = NONE
product implementation = NONE OBSERVED
```

## Commands and Results

Implementation and initial validation outcomes are recorded in `RSM-4-I1-VALIDATION-REPORT.md`. Terminal staged-candidate outcomes are intentionally recorded in external bootstrap evidence after repository content is frozen.

## Negative / Fail-Closed Evidence

The isolated workflow-policy suite owns all required rejection cases. No fixture writes into the canonical repository.

## Final Inventory and Handoff

- Expected candidate: `17 new / 13 modified / 30 staged / 0 deleted / 0 renamed`.
- Commit/push: `FALSE / FALSE`.
- Reviewer decision: `NOT YET INDEPENDENTLY REVIEWED`.
- Next handoff: `ChatGPT independent RSM-4-I1 staged-candidate review`.

