# RSM-4-CLOSE1 — Pre-Closure Terminal Authority and Evidence Alignment Candidate

## Mode and Type

- Work mode: `SOURCE AUTHORING + REPOSITORY ALIGNMENT + VALIDATION + EXACT STAGING`
- Task type: `CLOSURE / ALIGNMENT`
- Risk class: `HIGH`

## Baseline

- Repository: `C:\RetroStage\retrostage-maker`
- Remote: `https://github.com/caosvein/retrostage-maker.git`
- Branch: `main`
- Expected and observed pre-CLOSE1 implementation baseline: `1f6634b59d7f6773e5ac58273de3b95dceba963f`
- Parent: `483b2a29a491c8c5ccbacf06eb1f06f8fdb9e606`
- Tree: `60593d2e48d3d33768b105cb6460ebe93699466e`
- Entry repository state: staged `0`; unstaged tracked `0`; unexpected untracked `0`; stash `0`
- Entry origin/main and physical remote main: `1f6634b59d7f6773e5ac58273de3b95dceba963f`
- Hosted implementation CI: run `31529314116`; job `93905231438`; push; completed; success
- Toolchain: Node `v24.19.0`; pnpm `11.17.0`
- `package.json` SHA-256: `BD4D5388821CA5173131DAF33E1247CBD692FB588A7DCDF595E508B036B4B0D6`
- `pnpm-lock.yaml` SHA-256: `CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0`
- `pnpm-workspace.yaml` SHA-256: `E47480903A23976E502E164A3205F4478BBB38F72604F441CCA0534C58552D2B`
- Controlling independent authority: bootstrap `Outputs/RSM-4-V1-RERUN1-CHATGPT-INDEPENDENT-REVIEW.md`, SHA-256 `021C6DE5021DF91AD70B04FD9C73F712955E36307CD27320A448CC78C3EB2F81`

## Purpose

Create one exact independently reviewable 11-path pre-closure candidate that aligns durable/current Source authority, Source identities, and truthful RSM-4 evidence chronology without self-closing the milestone.

## Observed Starting Facts

- RSM-4-I1 is materially complete through accepted staged, commit, push, and hosted-CI evidence.
- RSM-4-FIX1 is materially complete through accepted remediation, staged, commit, push, and hosted-CI evidence.
- Original RSM-4-V1 remains historical material-failure evidence.
- RSM-4-V1-RERUN1 independently passed and authorized this exact CLOSE1 topology with closure-sequencing correction.
- RSM-4 remains open; Gate B is inactive; RSM-5 and product implementation remain blocked.

## Allowed Scope

External live Source edits, exactly five:

- `Sources/00_RSM_REBOOT_PROJECT_CHARTER.md`
- `Sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `Sources/04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
- `Sources/08_RSM_REBOOT_CURRENT_MILESTONE.md`
- `Sources/09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`

Repository modified paths, exactly seven:

- `docs/sources/00_RSM_REBOOT_PROJECT_CHARTER.md`
- `docs/sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `docs/sources/04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
- `docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md`
- `docs/sources/09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`
- `docs/sources/SOURCE-MANIFEST.tsv`
- `docs/evidence/rsm-4/RSM-4-MILESTONE-EVIDENCE-MANIFEST.tsv`

Repository added paths, exactly four:

- `docs/evidence/rsm-4/rsm-4-close1/RSM-4-CLOSE1-TASK-PLAN.md`
- `docs/evidence/rsm-4/rsm-4-close1/RSM-4-CLOSE1-EVIDENCE-MANIFEST.md`
- `docs/evidence/rsm-4/rsm-4-close1/RSM-4-CLOSE1-VALIDATION-REPORT.md`
- `docs/evidence/rsm-4/rsm-4-close1/RSM-4-CLOSURE-REPORT.md`

## Forbidden Scope

- Source `01/03/05/06/07`, tooling, package manifests, lockfiles, CI, compliance, application/package product paths, historical RSM-2/RSM-3 evidence, and existing RSM-4-I1 evidence.
- Dependency, schema, architecture, product implementation, commit, push, history rewrite, Gate B activation, or RSM-5 activation.
- Any future CLOSE1 commit, push, hosted-CI, or independent-review identity claim.

## Dependency / Schema / Architecture Permissions

- Production dependencies: `FALSE`
- Development dependencies: `FALSE`
- Lockfile/manifest: only `docs/sources/SOURCE-MANIFEST.tsv`; package and lockfile changes forbidden
- Persisted schema/migration: `FALSE`
- Product architecture or implementation: `FALSE`
- Current-authority alignment: only the exact five Sources and evidence topology above

## Required Inspection and Implementation

1. Verify exact baseline, remote, hosted CI, controlling independent authority, clean state, and Source identities fail-closed.
2. Make Source 00 and Source 04 durable; make Source 09 delegate volatile lifecycle state while preserving governed-loss history.
3. Make Source 02 and Source 08 truthfully identify the active pre-closure candidate.
4. Preserve Source 01/03/05/06/07 byte identities and synchronize all live/repository Sources 10/10.
5. Update exactly manifest rows 00/02/04/08/09.
6. Record one ACTIVE CLOSE1 row and completed I1/FIX1 chronology.
7. Stage exactly 11 repository paths with `M=7`, `A=4`, `D=0`, `R=0`.

## Validation Requirements

- Strict UTF-8, 10/10 live/repository equality, 10/10 manifest/physical hash equality, and 5/5 preserved Source identity checks.
- Semantic rejection of premature milestone closure, active Gate B, started RSM-5/product work, invented commit/CI/review claims, or lost Source 09 distinctions.
- `pnpm.cmd install --frozen-lockfile`
- `pnpm.cmd run format:check`
- `pnpm.cmd run lint`
- `pnpm.cmd run typecheck`
- `pnpm.cmd run test`
- `pnpm.cmd run arch:check`
- `pnpm.cmd run deadcode:check`
- `pnpm.cmd run build`
- `pnpm.cmd run workflow:check`
- `pnpm.cmd run validate`
- `pnpm.cmd run compliance:check`
- `pnpm.cmd run dependency:audit`
- `pnpm.cmd run ci:validate`
- `git diff --check` and final cached-diff checks

## Negative / Fail-Closed Cases

- Stop on baseline, remote, CI, authority, Source, or scope drift.
- Reject more than one ACTIVE milestone task or any missing evidence path.
- Reject any premature final milestone-closure, active product-gate, next-milestone-start, product-start, future identity, or already-passed independent-review assertion.
- Reject Source 09 if `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE`, `0/9`, historical/reboot Source 07 distinction, governed-loss exception, D-073–D-079, roadmap ancestry, or RSM-3 closure history is lost.

## Stop Conditions and Allowed Final Inventory

- Stop on any material validation failure, unexpected live Source mutation, repository path outside the exact 11, deletion/rename, dependency/lockfile/CI/product drift, or temporary fixture.
- Final repository inventory: exactly seven modified and four added paths; no deletion or rename.
- Final external Outputs: exactly seven authorized CLOSE1 artifacts.

## Commit / Push Permission

- Commit: `FALSE`
- Push: `FALSE`

## Closure Criteria

All entry, Source, manifest, evidence, semantic, validation, staging, and mutation guards pass; CLOSE1 remains independently unreviewed; RSM-4 remains open; Gate B remains inactive; RSM-5 remains blocked; the candidate is handed to ChatGPT for independent staged review.
