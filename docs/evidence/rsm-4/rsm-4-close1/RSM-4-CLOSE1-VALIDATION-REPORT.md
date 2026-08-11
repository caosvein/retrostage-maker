# RSM-4-CLOSE1 — Validation Report

## Baseline and Scope

Expected and observed entry baseline: `1f6634b59d7f6773e5ac58273de3b95dceba963f`. Branch, origin/main, physical remote main, and upstream passed the entry gate. Exact allowed repository candidate: 11 paths (`M=7`, `A=4`, `D=0`, `R=0`).

## Acceptance Matrix

| ID | Requirement | Evidence | Result |
|---|---|---|---|
| `C1-V01` | Strict UTF-8 changed live Sources | Strict decoder over Source 00/02/04/08/09 | `PASS 5/5` |
| `C1-V02` | Strict UTF-8 changed repository Sources | Strict decoder over five synchronized copies | `PASS 5/5` |
| `C1-V03` | Live/repository Source equality | Physical SHA and byte comparison for Source 00–09 | `PASS 10/10` |
| `C1-V04` | Source manifest physical identity | Ten rows, exact schema/IDs/filenames/CURRENT status and SHA equality | `PASS 10/10` |
| `C1-V05` | Preserve Source 01/03/05/06/07 | Baseline SHA comparison | `PASS 5/5` |
| `C1-V06` | Truthful evidence chronology | I1/FIX1 completed; CLOSE1 exactly one ACTIVE row; all evidence paths exist | `PASS` |
| `C1-V07` | Preserve Source 09 historical/governed-loss semantics | Required classifications, 0/9 result, Source 07 distinction, D-073–D-079, roadmap ancestry, and RSM-3 history found | `PASS` |
| `C1-V08` | No premature closure/product authority | Semantic negative review of changed Sources and evidence | `PASS` |
| `C1-V09` | Workflow-policy suite | `tooling/workflow-policy.test.mjs` | `PASS 17/17` |
| `C1-V10` | Complete test suite | Three test files | `PASS 51/51` |
| `C1-V11` | Full repository validation | Exact required command chain | `PASS` |
| `C1-V12` | Dependency/lockfile/CI/product drift | Physical identities and Git scope audit | `PASS / 0` |

## Commands and Results

| Command | Environment | Exit | Tests/assertions | Skips/warnings | Result |
|---|---|---:|---|---|---|
| `pnpm.cmd install --frozen-lockfile` | Windows / Node v24.19.0 / pnpm 11.17.0 | 0 | Lockfile accepted; workspace already current | None | `PASS` |
| `pnpm.cmd run format:check` | Repository root | 0 | All configured files formatted | None | `PASS` |
| `pnpm.cmd run lint` | Repository root | 0 | ESLint configured scope | None | `PASS` |
| `pnpm.cmd run typecheck` | Repository root | 0 | TypeScript no-emit check | None | `PASS` |
| `pnpm.cmd run test` | Repository root | 0 | Workflow 17/17; compliance 31/31; repository 3/3; total 51/51 | None | `PASS` |
| `pnpm.cmd run arch:check` | Repository root | 0 | 9 modules / 7 dependencies / 0 violations | Node experimental-loader warning is informational | `PASS` |
| `pnpm.cmd run deadcode:check` | Repository root | 0 | Knip configured scope | None | `PASS` |
| `pnpm.cmd run build` | Repository root | 0 | Tooling build | None | `PASS` |
| `pnpm.cmd run workflow:check` | Repository root | 0 | Source rows 10; required paths 17; issue count 0 | None | `PASS` |
| `pnpm.cmd run validate` | Repository root | 0 | Format/lint/typecheck/test/architecture/deadcode/build/workflow chain | Experimental-loader warning is informational | `PASS` |
| `pnpm.cmd run compliance:check` | Repository root | 0 | Byte-stable artifacts; license/security/native/notice blockers 0 | One low advisory remains visible and non-blocking | `PASS` |
| `pnpm.cmd run dependency:audit` | Repository root | 0 | Accepted high threshold | One low vulnerability visible | `PASS` |
| `pnpm.cmd run ci:validate` | Repository root | 0 | Frozen install plus validate/compliance/audit | Same informational warning and low advisory | `PASS` |
| `git diff --check` | Repository root | 0 | Working-tree whitespace check | None | `PASS` |

## Direct Behavior Evidence

- Lifecycle-safe policy accepted the synchronized five Source and manifest changes with `workflow-policy issues = 0`.
- The manifest matches all ten physical repository Sources while rows 01/03/05/06/07 retain their baseline fields.
- The milestone manifest contains exactly one ACTIVE task: `RSM-4-CLOSE1`.

## Negative / Failure Evidence

- No changed current-authority content asserts final RSM-4 closure, active Gate B, started RSM-5/product implementation, a future CLOSE1 commit/CI identity, or already-passed independent CLOSE1 review.
- Source 09 retains `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE`, the `0/9` result, historical/reboot Source 07 distinction, governed-loss exception, D-073 through D-079 provenance, canonical numeric roadmap ancestry, and RSM-3 closure history.
- Source 01/03/05/06/07 remain byte-identical to baseline.

## Architecture and Authority Review

No dependency direction, technology boundary, data owner, product architecture, or runtime responsibility changes. Source 02/08 own volatile state; Source 00/04 remain durable; Source 09 owns historical interpretation only.

## Schema / Migration / Recovery Impact

None. No product schema, migration, backup, restore, or external-disk operation occurred.

## Dependency / License / Artifact Impact

No dependency change. `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, CI workflows, and compliance artifacts retain baseline identities. Compliance blockers remain zero; the accepted low advisory remains visible.

## Preview / PIE / Export Classification

No product implementation; Preview, PIE, player, and export work remain outside scope and not started.

## Temporary Artifact Cleanup

No retained temporary fixture or helper artifact. Validation-generated build output is ignored and did not enter the Git candidate.

## Final Repository Inventory

At completion of this full pre-staging validation pass: exact 11 candidate paths, seven modified and four untracked additions; staged `0`; deletions `0`; renames `0`; forbidden-path drift `0`. Exact staging and terminal cached-diff checks follow as a separate controlled step and are recorded in external CLOSE1 evidence.

## Known Risks and Deferred Ownership

- Independent staged review, owner-authorized commit, normal push, hosted CI, and final closure acceptance remain future gates.
- A later `RSM-4-POSTCLOSE1-ALIGN1` must synchronize final closure truth before Gate B or RSM-5 activation can be considered.

## Decision

`PASS`
