# RetroStage Maker — RSM-3-I2 pnpm Workspace / Toolchain / Quality Scripts Implementation

**Document ID:** `RSM-3-I2-IMPLEMENTATION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Task:** `RSM-3-I2 — pnpm Workspace / Toolchain / Quality Scripts`  
**Primary executor:** `Codex`  
**Authoritative shell:** `Windows PowerShell 5.1`  
**Mode:** `CONTROLLED IMPLEMENTATION / STAGED CANDIDATE — NO COMMIT / NO PUSH`

---

## 1. Entry Authority

Before any repository mutation, fully read and verify at minimum:

### Live bootstrap authorities

- `C:\RetroStage\bootstrap\RSM-3-A\Sources\00_RSM_REBOOT_PROJECT_CHARTER.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\01_RSM_REBOOT_CANONICAL_ROADMAP.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`

### Accepted I1 closure / activation evidence

- `RSM-3-I1-COMMIT1-POST-COMMIT-EVIDENCE.md`
- `RSM-3-I1-COMMIT1-READINESS-REPORT.md`
- `RSM-3-I1-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
- `RSM-3-I1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`
- `RSM-3-I1-ALIGN1-I2-ACTIVATION-REPORT.md`

Required activation decision:

`RSM-3-I2 AUTHORIZED / READY FOR EXECUTION`

If it is not exact:

STOP:

`BLOCKED — RSM-3-I2 ENTRY AUTHORITY INVALID`

---

## 2. Accepted Repository Baseline

Canonical repository:

`C:\RetroStage\retrostage-maker`

Required starting baseline:

```text
Git repository = TRUE
branch = main
HEAD = 6d67b19f136cdd0a36ae11a861f4ba8b0addd196
commit count = 1
HEAD parent count = 0
HEAD tree files = 76
working tree = CLEAN
staged changes = 0
unstaged changes = 0
untracked files = 0
origin = https://github.com/caosvein/retrostage-maker.git
remote refs = 0
upstream tracking = ABSENT
push performed = FALSE
```

Recheck physically before mutation.

At minimum:

```powershell
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD
git -C "C:\RetroStage\retrostage-maker" rev-list --count HEAD
git -C "C:\RetroStage\retrostage-maker" branch --show-current
git -C "C:\RetroStage\retrostage-maker" status --short --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" status --porcelain=v2 --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" remote -v
git -C "C:\RetroStage\retrostage-maker" ls-remote origin
git -C "C:\RetroStage\retrostage-maker" ls-tree -r --name-only HEAD
```

If HEAD, branch, cleanliness, remote, or remote refs materially differ:

STOP:

`BLOCKED — RSM-3-I2 ENTRY REPOSITORY DRIFT`

Do not reset, restore, clean, stash, merge, fetch-and-rewrite, or otherwise repair automatically.

---

## 3. Current Live-Source Identities

The current bootstrap source identities after I1 ALIGN1 are:

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
SHA-256 = 4B49BECED127D4C34185EC8D47D00724418FD8BC597B34FE1D43EAB9C6C96315

08_RSM_REBOOT_CURRENT_MILESTONE.md
SHA-256 = 19434151F58BC330E5A3DF3ECBB4F1B91933C559D3BAC914E60F22FB1CC94710
```

Recompute both before repository synchronization.

If either differs unexpectedly:

STOP:

`BLOCKED — LIVE SOURCE IDENTITY DRIFT`

Do not overwrite the live bootstrap sources.

---

## 4. I2 Scope

RSM-3-I2 owns only:

- pnpm workspace materialization;
- Node/pnpm project-level identity;
- project-local TypeScript;
- lint/format/typecheck/test/build foundation;
- architecture/dead-code quality foundation;
- minimal admitted package roots;
- `tooling/` infrastructure;
- authoritative `pnpm-lock.yaml`;
- deterministic local validation;
- staging of an exact I2 candidate for independent review.

I2 does NOT own:

- CI workflows;
- dependency-review GitHub Action;
- CycloneDX/SBOM generation;
- third-party NOTICE generation;
- remote push;
- clean clone;
- restore;
- product application code;
- Electron/Forge/Vite application setup;
- Babylon.js;
- React;
- TypeBox/Ajv;
- physics/navigation/asset pipeline/player/editor work.

Those remain later-owned.

---

## 5. Exact Toolchain Identity

Required retained local toolchain:

```text
Node = 24.19.0
npm = 11.17.0
pnpm = 11.17.0
Git = accepted existing local Git
PowerShell = 5.1
```

Do not upgrade, downgrade, globally install, or globally configure the toolchain.

Create repository Node version file:

`.node-version`

Exact contents:

```text
24.19.0
```

Root package identity must contain:

```json
{
  "private": true,
  "packageManager": "pnpm@11.17.0",
  "engines": {
    "node": "24.19.0",
    "pnpm": "11.17.0"
  }
}
```

Exact dependency versions only.

No caret (`^`), tilde (`~`), wildcard, `latest`, tag-based, or range-based direct dev dependency is permitted.

---

## 6. Exact I2 Dependency Candidate Set

The owner authorizes I2 to attempt admission of exactly these direct development dependencies, conditional on the registry/compatibility checks in this task:

```text
typescript@6.0.3
vitest@3.0.7
eslint@9.21.0
typescript-eslint@8.66.0
prettier@3.5.2
dependency-cruiser@16.10.0
knip@6.32.0
```

No other direct dependency may be added.

`@cyclonedx/cyclonedx-npm` is NOT part of I2; it remains I3-owned.

GitHub Actions packages/config are NOT part of I2; they remain I3-owned.

---

## 7. Mandatory Registry Re-Verification Before Install

Before writing package dependency state, query the official npm registry for every exact candidate.

Use official registry-backed commands such as:

```powershell
npm view typescript@6.0.3 name version license engines peerDependencies scripts dist.integrity --json
npm view vitest@3.0.7 name version license engines peerDependencies scripts dist.integrity --json
npm view eslint@9.21.0 name version license engines peerDependencies scripts dist.integrity --json
npm view typescript-eslint@8.66.0 name version license engines peerDependencies scripts dist.integrity --json
npm view prettier@3.5.2 name version license engines peerDependencies scripts dist.integrity --json
npm view dependency-cruiser@16.10.0 name version license engines peerDependencies scripts dist.integrity --json
npm view knip@6.32.0 name version license engines peerDependencies scripts dist.integrity --json
```

Required:

- exact package exists;
- exact version matches;
- license matches accepted policy;
- Node 24.19.0 is not excluded;
- TypeScript 6.0.3 is accepted by the selected `typescript-eslint` peer range;
- no exact-candidate identity resolves to a different package/version.

For `typescript-eslint@8.66.0`, specifically prove from the current registry response that its TypeScript peer range includes `6.0.3`.

If `8.66.0` is not physically available from the official registry, or its current metadata does not admit TypeScript 6.0.3:

STOP:

`BLOCKED — TYPESCRIPT / TYPESCRIPT-ESLINT EXACT COMPATIBILITY FAILURE`

Do NOT silently choose another TypeScript or typescript-eslint version.

Do NOT substitute “latest”.

---

## 8. Lifecycle-Script Supply-Chain Boundary

No dependency lifecycle script receives automatic execution authority in this task.

Create root `.npmrc` with at minimum:

```text
save-exact=true
strict-peer-dependencies=true
auto-install-peers=false
ignore-scripts=true
```

Use pnpm with lifecycle scripts disabled.

If an admitted quality tool cannot function because a lifecycle/build script was blocked:

STOP and record the exact package/script requirement.

Do NOT enable scripts globally.

Do NOT use `--dangerously-allow-all-builds`.

Do NOT make a package-specific build-script exception without a new owner decision.

Transitive dependencies are permitted only when required by the seven exact direct I2 tools and captured by the lockfile.

A later-owned package appearing only transitively does not authorize direct use or configuration of that package.

In particular, any Vite presence that arrives transitively through Vitest remains:

`TRANSITIVE_TEST_TOOLING_ONLY`

It must NOT appear as a direct dependency, root script target, app build tool, or application configuration during RSM-3-I2.

---

## 9. Repository Topology to Materialize

I2 may create exactly these new topological roots/children as needed:

```text
tooling/
packages/
packages/core/
packages/diagnostics/
packages/test-fixtures/
```

Package identities:

```text
packages/core            -> @retrostage/core
packages/diagnostics     -> @retrostage/diagnostics
packages/test-fixtures   -> @retrostage/test-fixtures
```

These package directories must remain empty-foundation packages.

Minimum meaningful product-package contents:

- `package.json`

Optional narrow package metadata/config is permitted only if required by pnpm workspace correctness.

Do NOT add product `src/` files merely to make a build pass.

Do NOT create fake runtime exports.

Do NOT create placeholder gameplay/editor/renderer logic.

`apps/` remains conceptual/reserved and must not be physically created merely as an empty directory.

Do NOT create:

```text
apps/editor-electron/
apps/player-electron/
tools/
scripts/
.github/
```

during I2.

---

## 10. Workspace Files

Create at repository root as justified by this task:

```text
package.json
pnpm-workspace.yaml
pnpm-lock.yaml
.node-version
.npmrc
.gitignore
eslint.config.mjs
prettier.config.mjs
dependency-cruiser.config.cjs
knip.json
tsconfig.json
tooling/
packages/core/package.json
packages/diagnostics/package.json
packages/test-fixtures/package.json
```

Additional narrow I2 config files are allowed only when required to make the admitted toolchain truthful and functional.

Do not create decorative files.

---

## 11. pnpm Workspace Definition

`pnpm-workspace.yaml` must include only the admitted current package locations.

Expected package glob:

```yaml
packages:
  - "packages/*"
```

Do not include future `apps/*`.

Do not include `tools/*`.

Do not include `scripts/*`.

Do not include `.github`.

---

## 12. Package Manifest Boundary

Root package name:

`retrostage-maker`

Root must be:

`private: true`

Each admitted package must also be:

`private: true`

Use a neutral bootstrap version such as:

`0.0.0`

The package manifests must not claim implemented runtime APIs.

No dependency from one product package to another is needed in I2.

No published-package claim.

No `main`, `exports`, browser bundle, runtime entry, or product build artifact is required merely to prove the empty foundation.

---

## 13. Tooling Foundation

Create narrow infrastructure-only TypeScript under `tooling/`.

The tooling may implement only repository-bootstrap controls such as:

- checking forbidden early paths;
- checking exact package/root topology;
- checking exact package names;
- checking that direct dependencies remain inside the I2 allowlist;
- checking that future-owned product roots/dependencies are absent.

A small Vitest test suite for this infrastructure is permitted and required.

This is infrastructure validation code, not RetroStage product/runtime code.

Do not place this code under `packages/core`, `packages/diagnostics`, or `packages/test-fixtures`.

---

## 14. TypeScript Foundation

Use project-local:

`typescript@6.0.3`

Create a strict TypeScript configuration for `tooling/`.

The actual TypeScript compilation target in I2 must be the infrastructure code under `tooling/`, not fake product source.

Requirements should include at minimum, when supported by the exact compiler:

```text
strict = true
noUncheckedIndexedAccess = true
exactOptionalPropertyTypes = true
noFallthroughCasesInSwitch = true
noImplicitOverride = true
forceConsistentCasingInFileNames = true
skipLibCheck = false
```

Use a modern Node-compatible module setup appropriate to Node 24.

Do not weaken strictness merely to make validation pass.

---

## 15. ESLint Foundation

Use:

```text
eslint@9.21.0
typescript-eslint@8.66.0
```

Use flat config.

Lint scope must be infrastructure/config code owned by I2.

Do not lint the entire historical evidence archive merely to generate noise.

Lint errors must fail validation.

Do not disable broad rule families merely to force a pass.

---

## 16. Prettier Foundation

Use:

`prettier@3.5.2`

Prettier validation must cover the new I2-owned configuration/tooling/package-manifest files.

Do not rewrite the imported historical/review evidence tree.

Formatting check must be read-only during final validation.

---

## 17. Architecture Check

Use:

`dependency-cruiser@16.10.0`

Create a narrow configuration appropriate for the current infrastructure-only foundation.

At minimum prove:

- tooling does not import product package internals;
- no forbidden future application path is introduced;
- no cyclic tooling dependency is present;
- the current foundation does not create false runtime coupling.

The architecture command must return non-zero on a material rule violation.

---

## 18. Dead-Code / Unused Dependency Check

Use:

`knip@6.32.0`

Configure it for the current empty-foundation workspace.

It must meaningfully inspect:

- root scripts;
- I2 tooling entrypoints/tests;
- package/workspace manifests.

Do not suppress every finding globally.

Any intentional ignore must be narrow and explained in the I2 evidence.

---

## 19. Vitest Foundation

Use:

`vitest@3.0.7`

Create at least one meaningful infrastructure test that validates a repository-bootstrap rule.

Do NOT create a meaningless assertion solely to obtain a green test command.

No product test fixture content is required inside `packages/test-fixtures` yet.

---

## 20. Required Root Scripts

Create truthful root scripts for at least:

```text
format:check
lint
typecheck
test
arch:check
deadcode:check
build
validate
```

`validate` must fail if any required preceding quality step fails.

Do not label the same command under several names unless the semantics are genuinely equivalent and explicitly justified.

`build` must prove that the I2-owned TypeScript infrastructure can be compiled successfully.

Generated build output must not be staged.

Generated build output must either:

- be written to an ignored deterministic build directory and removed after evidence capture; or
- otherwise leave the final staged candidate free of generated artifacts.

---

## 21. Lockfile Creation and Install

After exact manifest/config preparation and registry verification:

Run pnpm only from:

`C:\RetroStage\retrostage-maker`

Use the accepted local pnpm:

`11.17.0`

Generate the authoritative:

`pnpm-lock.yaml`

with lifecycle scripts disabled.

Then install from the resulting exact lockfile with lifecycle scripts disabled.

After the first lockfile is generated, prove reproducibility in the same repository by running a frozen-lockfile install path appropriate to pnpm 11 without changing package metadata.

Required final lock condition:

```text
one pnpm-lock.yaml
lockfile parseable = TRUE
lockfile drift after frozen validation = 0
direct dependency versions exact = TRUE
unexpected direct dependency count = 0
```

Do not create npm/yarn/bun lockfiles.

---

## 22. Current Live-Source Synchronization into Repository

The repository copies of source 02 and source 08 are intentionally behind the live bootstrap sources because I1 preserved its accepted root baseline.

During I2, synchronize byte-identically:

```text
C:\RetroStage\bootstrap\RSM-3-A\Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
-> docs/sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md

C:\RetroStage\bootstrap\RSM-3-A\Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
-> docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Required destination hashes after copy:

```text
02 = 4B49BECED127D4C34185EC8D47D00724418FD8BC597B34FE1D43EAB9C6C96315
08 = 19434151F58BC330E5A3DF3ECBB4F1B91933C559D3BAC914E60F22FB1CC94710
```

No other governing source copy is changed unless a separately accepted live delta requires it.

---

## 23. I1 Closure Evidence Synchronization

Import the post-root-commit I1 evidence that is required to explain why I2 is authorized.

Destination:

`docs/evidence/rsm-3/rsm-3-i1/`

Import byte-identically, where physically present:

1. `RSM-3-I1-SOURCE-IMPORT-MANIFEST.tsv`
2. `RSM-3-I1-REPOSITORY-CREATION-AND-REMOTE-EVIDENCE.md`
3. `RSM-3-I1-REPOSITORY-STATE-REPORT.md`
4. `RSM-3-I1-INITIAL-COMMIT-CANDIDATE-REPORT.md`
5. `RSM-3-I1-CHATGPT-INDEPENDENT-INITIAL-COMMIT-CANDIDATE-REVIEW.md`
6. `RSM-3-I1-COMMIT1-OWNER-AUTHORIZED-INITIAL-COMMIT-POST-COMMIT-VERIFICATION-PROMPT.md`
7. `RSM-3-I1-COMMIT1-POST-COMMIT-EVIDENCE.md`
8. `RSM-3-I1-COMMIT1-READINESS-REPORT.md`
9. `RSM-3-I1-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
10. `RSM-3-I1-ALIGN1-CURRENT-STATE-AND-I2-ACTIVATION-PROMPT.md`
11. `RSM-3-I1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`
12. `RSM-3-I1-ALIGN1-I2-ACTIVATION-REPORT.md`

These remain evidence/control records, not executable standing instructions after import.

If any required listed file is physically missing:

STOP:

`BLOCKED — I1 CLOSURE EVIDENCE INCOMPLETE`

Do not synthesize it.

---

## 24. I2 Prompt Retention

Retain this exact physical prompt under:

`docs/evidence/rsm-3/rsm-3-i2/RSM-3-I2-PNPM-WORKSPACE-TOOLCHAIN-QUALITY-SCRIPTS-IMPLEMENTATION-PROMPT.md`

Classification:

`EXECUTION_PROMPT`

Policy:

`COPY_BYTE_IDENTICAL`

After import it is traceability evidence only.

---

## 25. Install Artifact Boundary

`node_modules/` is expected as a local untracked/ignored install artifact.

It must NOT be staged.

`.gitignore` must cover at minimum appropriate local/generated paths such as:

```text
node_modules/
dist/
coverage/
```

Do not commit package-manager stores or generated build output.

Final Git untracked scan must account for ignored local installation/build artifacts separately from unexpected repository files.

---

## 26. Validation Sequence

Run the full I2 validation from repository root.

At minimum:

```powershell
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run arch:check
pnpm run deadcode:check
pnpm run build
pnpm run validate
```

Also run:

```powershell
pnpm install --frozen-lockfile --ignore-scripts
```

or the pnpm-11-equivalent frozen verification consistent with the root `.npmrc`.

Every command must have:

`exit code = 0`

Record exact command and exact exit code.

If a command fails, do not weaken the quality rule merely to obtain green status.

A narrow configuration correction is allowed only when it fixes an objectively incorrect I2 configuration and remains inside the authorized dependency/topology boundary.

Any dependency-version substitution requires STOP and owner review.

---

## 27. Direct / Transitive Dependency Audit

After install, produce the exact direct dependency set from root `package.json`.

Required direct dev dependency set is exactly seven:

```text
typescript
vitest
eslint
typescript-eslint
prettier
dependency-cruiser
knip
```

No direct:

```text
vite
electron
@electron/*
@babylonjs/*
react
react-dom
@sinclair/typebox
typebox
ajv
@babylonjs/havok
better-sqlite3
monaco-editor
reactflow
@xyflow/*
@opentelemetry/*
@gltf-transform/*
meshoptimizer
ktx*
ffmpeg*
steamworks*
```

may appear.

Inspect the lockfile/transitive graph.

If a later-owned family appears transitively solely because it is required by an admitted I2 tool, record:

- exact transitive path;
- exact package/version;
- owning direct I2 package;
- why it is not directly admitted;
- whether lifecycle/native risk exists.

Do not promote a transitive tool to direct project dependency.

---

## 28. Bootstrap Workspace Mutation Guard

Before any task write, hash all pre-existing files under:

`C:\RetroStage\bootstrap\RSM-3-A`

Existing bootstrap files are immutable during I2.

Only the required new I2 execution evidence outputs may be created in the bootstrap workspace.

No existing source, prompt, output, RECOVERY1, TERM1, ALIGN1, or I1 file may change.

Required:

`UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0`

---

## 29. Repository Change Manifest

Before staging, enumerate every repository change relative to:

`HEAD = 6d67b19f136cdd0a36ae11a861f4ba8b0addd196`

Classify every changed/new tracked candidate as one of:

```text
LIVE_SOURCE_SYNC
I1_CLOSURE_EVIDENCE_SYNC
I2_EXECUTION_PROMPT
I2_ROOT_TOOLCHAIN_CONFIG
I2_TOOLING_INFRASTRUCTURE
I2_PACKAGE_SHELL
I2_LOCKFILE
I2_GITIGNORE
```

No unclassified repository mutation is allowed.

---

## 30. Staging

Only after all I2 validation passes:

Stage the complete governed I2 candidate.

Do not commit.

Do not push.

Then capture:

```powershell
git status --short --untracked-files=all
git status --porcelain=v2 --untracked-files=all
git diff --name-status
git diff --cached --name-status
git diff --cached --stat
git diff --cached --check
git ls-files --others --exclude-standard
git diff --cached HEAD
```

Required:

- every intended I2 tracked change staged;
- unstaged tracked changes = `0`;
- unexpected untracked non-ignored files = `0`;
- `git diff --cached --check` = PASS;
- HEAD remains the I1 root commit;
- commit count remains `1`;
- push remains `FALSE`.

---

## 31. No Commit / No Push

Explicitly forbidden during this task:

```text
git commit
git push
git push -u
git reset
git clean
git stash
git rebase
git commit --amend
git reset --hard
```

Do not create the I2 commit.

Do not initialize remote refs.

Do not authorize I3.

---

## 32. Required I2 Bootstrap Outputs

Create exactly FIVE new files under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

### Output 1

`RSM-3-I2-REGISTRY-AND-DEPENDENCY-ADMISSION-EVIDENCE.tsv`

Columns at minimum:

```text
package_name
requested_version
observed_version
official_registry
license
engines
peer_dependencies
lifecycle_scripts
dist_integrity
compatibility_result
admission_result
notes
```

Exactly one primary row for each of the seven direct I2 candidates.

---

### Output 2

`RSM-3-I2-REPOSITORY-MUTATION-MANIFEST.tsv`

Columns at minimum:

```text
repository_relative_path
change_type
classification
pre_task_sha256
post_task_sha256
staged
reason
```

Every intended tracked repository delta represented exactly once.

---

### Output 3

`RSM-3-I2-TOOLCHAIN-LOCKFILE-AND-TRANSITIVE-REVIEW.md`

Record:

- exact Node/npm/pnpm versions;
- exact seven direct dependency identities;
- exact `packageManager`;
- exact engines;
- lockfile SHA-256;
- frozen-lockfile verification;
- lifecycle-script policy;
- direct dependency count;
- transitive dependency count;
- any later-owned transitive package and exact provenance path;
- unexpected direct dependency count;
- multiple-lockfile scan;
- global toolchain mutation count.

---

### Output 4

`RSM-3-I2-VALIDATION-REPORT.md`

Record every required validation command and exit code:

- format check;
- lint;
- typecheck;
- Vitest;
- dependency-cruiser;
- Knip;
- build;
- aggregate validate;
- frozen-lockfile validation;
- forbidden-path/dependency checks.

Include exact test count and exact failures.

---

### Output 5

`RSM-3-I2-STAGED-CANDIDATE-REPORT.md`

Must state:

- starting HEAD;
- ending HEAD;
- commit count;
- exact staged path count;
- exact modified/new tracked path count;
- unstaged tracked count;
- unexpected untracked count;
- `git diff --cached --check` result;
- bootstrap unauthorized mutation count;
- exact seven direct dependencies;
- dependency mismatch count;
- validation failure count;
- source 02/08 repository sync result;
- I1 closure evidence sync result;
- product dependency direct-admission count;
- product implementation count;
- commit performed;
- push performed;
- I3 authorization state.

---

## 33. Final Decision

The staged-candidate report must end with exactly one:

`READY FOR INDEPENDENT RSM-3-I2 REVIEW / TOOLCHAIN CANDIDATE STAGED`

or

`BLOCKED — RSM-3-I2 MATERIAL FAILURE`

Do NOT declare I2 closed.

Do NOT authorize I3.

Do NOT create a follow-up FIX prompt.

---

## 34. Success Condition

RSM-3-I2 implementation succeeds when:

1. the accepted I1 root commit remains the unchanged HEAD;
2. live sources 02/08 are synchronized into the repository as a traceable delta;
3. I1 closure evidence is retained in repository evidence;
4. the exact pnpm workspace is materialized;
5. Node/pnpm project identity is pinned;
6. the seven exact I2 direct dependencies are registry-verified and installed with scripts disabled;
7. TypeScript/typescript-eslint compatibility is physically proven;
8. one authoritative `pnpm-lock.yaml` exists;
9. frozen-lockfile validation passes;
10. `tooling/` contains meaningful infrastructure-only validation code/tests;
11. package shells exist without product implementation;
12. format/lint/typecheck/test/architecture/dead-code/build/aggregate validation all pass;
13. no direct later-owned product dependency is introduced;
14. no generated/install artifact is staged;
15. the complete exact I2 candidate is staged;
16. no commit or push occurs;
17. bootstrap pre-existing files remain unchanged;
18. five exact I2 evidence outputs exist.

The next authority after success is an independent review of the staged RSM-3-I2 candidate.
