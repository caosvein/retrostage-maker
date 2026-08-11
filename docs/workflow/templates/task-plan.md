# <TASK ID> — <TITLE>

## Mode and Type

- Work mode: `<SOURCE AUTHORING | REPOSITORY TASK | RELEASE AND COMPLIANCE>`
- Task type: `<AUDIT | CONTRACT | READINESS | IMPLEMENTATION | VALIDATION | CLOSURE | ALIGNMENT | DEPENDENCY ADMISSION | ARCHITECTURE CHANGE | RELEASE VERIFICATION>`
- Risk class: `<LOW | MEDIUM | HIGH>`

## Baseline

- Repository and remote: `<exact identities>`
- Expected branch and HEAD: `<exact values>`
- Actual branch and HEAD: `<observed values>`
- Staged / unstaged / untracked / stash state: `<observed values>`
- Toolchain and lockfile identity: `<exact values>`
- Authoritative sources: `<exact paths and identities>`

## Purpose

`<one narrow outcome>`

## Observed Starting Facts

- `<OBSERVED fact and evidence>`

## Allowed Scope

- `<exact path or constrained family>`

## Forbidden Scope

- `<exact path, operation, capability, or family>`

## Dependency / Schema / Architecture Permissions

- Production dependencies: `<FALSE or exact admission>`
- Development dependencies: `<FALSE or exact admission>`
- Lockfile/manifest: `<permission>`
- Persisted schema/migration: `<permission>`
- Architecture/source authority: `<permission>`
- Editor/player and Preview/PIE/Export: `<classification>`

## Required Inspection

- `<entrypoints, consumers, manifests, tests, boundaries, artifacts>`

## Implementation Requirements

1. `<observable requirement>`

## Validation Requirements

- `<exact command, expected outcome, environment>`

## Negative / Fail-Closed Cases

- `<case that must be rejected or stop work>`

## Stop Conditions

- `<material condition requiring immediate stop>`

## Allowed Final Inventory

- New: `<exact paths>`
- Modified: `<exact paths>`
- Deleted/renamed: `<exact count and paths>`
- Temporary artifacts: `0` unless explicitly retained

## Commit / Push Permission

- Commit: `FALSE` unless separately authorized
- Push: `FALSE` unless separately authorized

## Closure Criteria

- `<scope, evidence, validation, inventory, risk, and handoff criteria>`

## Required Final Report

Use `coding-agent-final-report.md` and `validation-report.md`; enumerate checks and actual repository state.

