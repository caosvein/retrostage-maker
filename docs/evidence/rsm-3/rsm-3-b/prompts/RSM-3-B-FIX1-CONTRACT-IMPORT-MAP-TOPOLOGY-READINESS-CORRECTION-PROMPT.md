# RSM-3-B — FIX1 Contract / Import-Map / Topology / Readiness Correction Prompt

## 1. Task

Correct the four existing RSM-3-B outputs after independent package review found material inconsistencies.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

This is a correction-only task.

It must not create the repository, import sources, install dependencies, configure Git identity, mutate GitHub, or begin RSM-3-C.

## 2. Exact executor identity

Record:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED MODEL LABEL>
Execution date/time/timezone: <OBSERVED>
```

The exact known label format from the current executor is:

```text
Gemini 3.1 Pro (High)
```

Do not remove the parentheses or normalize the label.

## 3. Authorized mutable files

Exactly these four existing files may be modified:

```text
Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md
Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv
Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv
Outputs\RSM-3-B-READINESS-REPORT.md
```

No other existing file may be modified, renamed, deleted, or overwritten.

Do not create any additional permanent output.

## 4. Mandatory baseline check

Before editing, verify:

| File | Required pre-FIX1 SHA-256 |
|---|---|
| `Prompts\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT-ANTIGRAVITY-PROMPT.md` | `BB88D307333F46FACFB6C2D463CBC0574419AFB2B0132A0ED12D2D5E92CEA11C` |
| `Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md` | `F8C77EF9FEFEA3F33E4D5DC17E7976F7F2A0511F9743D6E6CCD917C84F1F1307` |
| `Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv` | `8AE6739ECB385ED2423D5649E16D222B915833445FBDC5E49233613C7A5FAA7C` |
| `Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv` | `CE30274B1393EF8D70C79CB7BF1FE1C33E1C2AE2143E9BEFEFBBE974B2028C80` |
| `Outputs\RSM-3-B-READINESS-REPORT.md` | `B9ECF97BAB909FF10536B9A17802FAE4A5FD4C66B487CD292B28BC454DF5E24A` |

Also re-verify the original 16 immutable RSM-3-B inputs using the hashes in the original prompt.

If any baseline differs:

- do not edit;
- do not create a substitute output;
- stop with:

```text
BLOCKED — RSM-3-B FIX1 BASELINE MISMATCH
```

## 5. Required full-read proof

The original transcript does not provide sufficient proof for the claim that all 16 governing files were fully read.

Before correction, fully read:

1. the original 16 governing inputs;
2. the original RSM-3-B execution prompt;
3. the four current RSM-3-B outputs.

Use `Get-Content -Raw` or equivalent complete reads.

For every fully read file, record in the corrected contract or readiness report:

```text
relative_path
byte_length
line_count
sha256
full_read=TRUE
```

Do not claim a full read from a search result, header, excerpt, or partial range.

## 6. Confirmed material findings to correct

### F-01 — False source-map counts

The existing map has:

```text
52 data rows
43 current rows
9 historical rows
53 physical lines including the header
```

The existing readiness/chat claim of:

```text
36 current files
45 data rows
```

is false.

FIX1 must dynamically inventory the current workspace and report the actual snapshot count. Do not hard-code 36, 43, 45, 52, or any other count.

The final map row count must equal:

```text
CURRENT_SNAPSHOT_FILE_COUNT + 9 historical expected rows
```

The readiness report must record:

```text
CURRENT_SNAPSHOT_FILE_COUNT=<computed>
HISTORICAL_EXPECTED_ROW_COUNT=9
SOURCE_IMPORT_MAP_DATA_ROW_COUNT=<computed>
SOURCE_IMPORT_MAP_TOTAL_LINE_COUNT=<computed>
```

### F-02 — Missing live alignment-authority classification

The current map defines the vocabulary `LIVE_ALIGNMENT_AUTHORITY` but uses it zero times.

Correct classifications:

```text
Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
→ LIVE_ALIGNMENT_AUTHORITY

Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
→ LIVE_ALIGNMENT_AUTHORITY
```

The remaining seven reboot authority sources:

```text
00, 01, 03, 04, 05, 06, 09
```

remain `LIVE_CANONICAL_SOURCE`.

### F-03 — Incorrect RSM-3-B evidence destination

The existing map sends the RSM-3-B prompt to the RSM-3-A evidence root.

Every RSM-3-B prompt/output must target:

```text
docs/evidence/rsm-3/rsm-3-b/
```

Execution prompts under:

```text
docs/evidence/rsm-3/rsm-3-b/prompts/
```

RSM-3-A prompts/outputs remain under:

```text
docs/evidence/rsm-3/rsm-3-a/
```

RSM-2 evidence remains under:

```text
docs/evidence/rsm-2/
```

### F-04 — Current RSM-3-B files missing from the map

The final inventory snapshot must include all current files under:

```text
Sources\
Prompts\
Outputs\
```

including:

```text
RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md
RSM-3-B-SOURCE-IMPORT-MAP.tsv
RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv
RSM-3-B-READINESS-REPORT.md
this FIX1 prompt after the owner places it in Prompts\
```

#### Self-reference rule

A SHA-256 map cannot contain its own final SHA-256 without creating a self-reference problem.

For the row representing:

```text
RSM-3-B-SOURCE-IMPORT-MAP.tsv
```

use:

```text
current_presence=PRESENT
expected_sha256=
observed_sha256=
content_policy=COPY_BYTE_IDENTICAL
blocking_condition=POST_WRITE_SHA256_REQUIRED_BEFORE_I1
notes=Self-referential manifest row; final SHA-256 is recorded by post-write evidence and must be locked by RSM-3-D before I1.
```

This is the only current-present row permitted to have empty expected/observed hashes.

Write order:

1. correct contract;
2. correct topology plan;
3. correct readiness report without embedding final RSM-3-B output hashes;
4. calculate final hashes of contract/topology/readiness;
5. generate the import map last, including those three final hashes;
6. compute the final map hash for terminal/chat evidence.

Do not rewrite another file after the final map is written.

### F-05 — Classification and retention policy is too generic

Do not classify files only by directory/name-pattern defaults.

Apply these rules deliberately:

#### Active authority

```text
02 and 08
→ LIVE_ALIGNMENT_AUTHORITY

00, 01, 03, 04, 05, 06, 09
→ LIVE_CANONICAL_SOURCE
```

#### RSM-2

```text
RSM-2 review/closure files
→ REVIEW_OR_CLOSURE_EVIDENCE
```

#### Task contracts and controls

At minimum:

```text
RSM-3-A repository audit/readiness contract
RSM-3-A interim multi-AI assignment
RSM-3-A owner decision lock
RSM-3-A repository/remote/backup decision
RSM-3-A tool-remediation version lock
RSM-3-B original prompt
RSM-3-B FIX1 prompt
RSM-3-B contract
RSM-3-B source-import map
RSM-3-B topology plan
→ TASK_CONTRACT_OR_CONTROL
```

#### Reviews/reports/inventories

```text
independent reviews
readiness reports
tool remediation reports
authentication reports
incident note
environment/toolchain/source manifests
→ AUDIT_OR_REVIEW_EVIDENCE
```

#### Execution prompts

Historical execution/correction prompts retained only for traceability:

```text
classification=EXECUTION_PROMPT
content_policy=COPY_BYTE_IDENTICAL
notes=Retained execution evidence; not current source authority and not an executable instruction after import.
```

Do not state merely that every prompt is authoritative or automatically reusable.

### F-06 — Topology authority was misrepresented

The current topology says:

```text
Architecture target superseded
tools/ and scripts/ forbidden
```

That is inaccurate.

The current milestone allows `tooling/` as an RSM-3 initial root. The architecture map still retains `tools/` and `scripts/` as future target-topology concepts.

Correct interpretation:

```text
tooling/
→ ADMIT for RSM-3 bootstrap infrastructure

tools/
→ DEFER during RSM-3; architecture target remains valid for later tool packages

scripts/
→ DEFER during RSM-3 unless a later approved slice proves narrow repository automation is necessary
```

Do not call the architecture target superseded.

Do not silently create all three roots.

### F-07 — Incorrect topology owner slices

Correct at minimum:

```text
.github/
owner_slice=RSM-3-I3
```

RSM-3-D is readiness/contract work, not CI implementation.

```text
docs/
owner_slice=RSM-3-I1
```

```text
tooling/
owner_slice=RSM-3-I2
```

```text
packages/
packages/core/
packages/diagnostics/
packages/test-fixtures/
owner_slice=RSM-3-I2
```

For `apps/`:

```text
decision=RESERVE_ROOT_ONLY
owner_slice=RSM-5
```

Clarify that reservation is conceptual and does not justify an empty tracked directory or placeholder during RSM-3.

### F-08 — Minimum meaningful contents are too weak

`package.json` alone must not be treated as complete package meaning.

For admitted RSM-3 packages, define a bounded minimum such as:

```text
package.json
package-local tsconfig reference/config
src/index.ts or equivalent minimal compile entry
at least one boundary/build/test proof owned by I2
```

Forbidden capability claims must explicitly reject:

- renderer or Babylon integration;
- Electron application capability;
- document/schema authority not owned by RSM-3;
- editor UI;
- runtime/export capability;
- product feature completion.

A scaffold must not claim product behavior.

### F-09 — Dependency-admission matrix is incomplete

For each admitted family, the contract must state:

```text
family
purpose
development_or_release_classification
owning_slice
exact_version_selection_point
license_review_requirement
lockfile_and_transitive_review_requirement
```

Families:

```text
typescript
vitest
eslint
typescript-eslint
prettier
dependency-cruiser
knip
CycloneDX PNPM SBOM tooling
GitHub Actions configuration
dependency-review configuration
```

Required ownership:

```text
TypeScript / Vitest / ESLint / typescript-eslint / Prettier /
dependency-cruiser / Knip
→ exact package audit in RSM-3-D, installation/admission in RSM-3-I2

CycloneDX / GitHub Actions / dependency-review
→ exact package/action identity audit before or during RSM-3-I3,
  implementation in RSM-3-I3
```

Only TypeScript `6.0.3` is already a source-approved exact project-local candidate.

Do not invent exact package versions or action SHAs for the remaining families.

Add the repository engine-policy candidate:

```json
{
  "engines": {
    "node": "24.19.0",
    "pnpm": "11.17.0"
  },
  "packageManager": "pnpm@11.17.0"
}
```

This remains a contract candidate until I2 observes it in the physical repository.

### F-10 — Repository command contract is not exact enough

Define provisional I1 commands without executing them.

At minimum, address:

```text
Test-Path canonical path must be False
New-Item canonical path only after RSM-3-D approval
git init --initial-branch=main
git config --local user.name caosvein
git config --local user.email caosvein@gmail.com
git remote add origin https://github.com/caosvein/retrostage-maker.git
git remote -v
git ls-remote origin
git status --short --untracked-files=all
git status --porcelain=v2 --untracked-files=all
git diff --name-status
git diff --cached --name-status
```

All commands remain:

```text
PROVISIONAL / NOT YET VALIDATED
```

Owner approval remains mandatory before commit and again before push.

Historical bytes must be available and hash-verified before I1 begins.

### F-11 — Phase ownership is overbroad and partly wrong

Replace the combined statement:

```text
Allowed for RSM-3-C/D/I1/I2:
directory scaffolding, importing, backup testing, remote initialization
```

with exact phase boundaries:

```text
RSM-3-C:
contract/read-only supply-chain, backup, external-disk, restore boundary;
no repository implementation

RSM-3-D:
detailed implementation-readiness and exact-version/package/action audit;
no repository implementation

RSM-3-I1:
local Git repository creation, repository-local identity,
active/historical source import, initial commit candidate;
no push without owner approval

RSM-3-I2:
pnpm workspace, exact admitted development dependencies,
quality/typecheck/test/build foundation

RSM-3-I3:
CI, dependency review, SBOM, notices baseline

RSM-3-I4:
owner-approved remote push, manual local-backup baseline,
clean clone, clean install, restore-test execution and proof

RSM-3-V1:
independent milestone-wide validation of push/clone/install/build/restore evidence

RSM-3-CLOSE1:
closure packaging and RSM-4 handoff;
not first execution of restore
```

The existing assignment of clean clone only to V1 and restore only to CLOSE1 is incorrect. I4 owns execution/proof; V1 validates; CLOSE1 closes.

### F-12 — Readiness decision is supported by false summary values

The corrected readiness report must not retain:

```text
36 active files
45 data rows
```

It must also not state that the architecture's tools/scripts target was superseded.

It may return:

```text
READY FOR RSM-3-C
```

only after all material corrections and validations pass.

## 7. Source-import map generation requirements

Header must remain exactly:

```text
source_path
filename
generation
classification
current_presence
expected_sha256
observed_sha256
destination_path
content_policy
import_phase
blocking_condition
notes
```

Allowed `content_policy` values remain:

```text
COPY_BYTE_IDENTICAL
COPY_WITH_EXPLICIT_RENAME_MAP
GENERATE_NEW_REPOSITORY_AUTHORITY_LATER
RETAIN_OUTSIDE_REPOSITORY
DO_NOT_IMPORT
```

Validation:

1. exactly 9 historical rows;
2. all historical expected hashes populated from source 09;
3. absent historical `source_path` and `observed_sha256` empty;
4. every current snapshot file represented exactly once;
5. every current row has an absolute observed source path;
6. current expected/observed hashes match except the single self-reference row;
7. `02` and `08` classified as `LIVE_ALIGNMENT_AUTHORITY`;
8. all RSM-3-B files target the RSM-3-B evidence root;
9. no admitted destination collision;
10. no duplicate source path;
11. no stale current row whose source path is absent;
12. no file claimed imported, committed, or validated in a repository.

## 8. Topology-plan requirements

Header remains exactly:

```text
repository_relative_path
item_type
decision
owner_slice
role_class
environment_class
authority_class
minimum_meaningful_contents
forbidden_claims
source_basis
notes
```

Allowed decisions:

```text
ADMIT
RESERVE_ROOT_ONLY
DEFER
FORBID_DURING_RSM_3
```

At minimum include and correct:

```text
.github/
docs/
tooling/
tools/
scripts/
apps/
packages/
packages/core/
packages/diagnostics/
packages/test-fixtures/
apps/editor-electron/
apps/player-electron/
```

No duplicate path.

Do not describe `tools/` or `scripts/` as superseded.

## 9. Corrected contract requirements

Keep the original 23-section structure or replace it with an equally complete structure.

Add:

- a FIX1 correction history section;
- full-read proof;
- exact snapshot/import-map counts;
- exact source-authority classification;
- deliberate prompt-retention policy;
- exact phase ownership;
- complete dependency-admission matrix;
- repository engine candidate;
- exact provisional I1 command contract;
- corrected topology reconciliation;
- historical-byte stop condition;
- self-reference manifest rule;
- explicit non-implementation statement.

## 10. Corrected readiness-report requirements

Required sections:

1. Executor identity
2. FIX1 baseline verification
3. Authorized-mutation result
4. Full-read proof result
5. Corrected current-snapshot count
6. Corrected source-map row count
7. Historical availability
8. Source classification checks
9. Destination collision checks
10. Topology reconciliation
11. Dependency/phase boundary checks
12. Self-reference handling
13. Existing-file immutability outside the four authorized files
14. Candidate-path absence
15. Remaining bounded prerequisites
16. Final decision

The final non-empty line must be exactly one of:

```text
READY FOR RSM-3-C
BLOCKED
```

## 11. Forbidden actions

Do not:

- modify any file outside the four authorized outputs;
- create another output or report;
- create/init/clone a repository;
- configure Git identity;
- authenticate or change GitHub;
- create source/archive/backup/clone/restore directories;
- install or update tools/dependencies;
- write package manifests;
- import sources;
- commit or push;
- begin RSM-3-C;
- claim historical bytes are present;
- claim RSM-3 is complete.

## 12. Mandatory validation commands

After correction, run equivalent validations that prove:

```text
all four pre-edit hashes matched
all non-authorized files retained their hashes
historical row count = 9
current row count = dynamic snapshot count
data row count = current + 9
LIVE_ALIGNMENT_AUTHORITY count = 2
destination collision count = 0
duplicate source-path count = 0
self-reference exception count = 1
RSM-3-B evidence-root violation count = 0
stale source-path count = 0
topology duplicate count = 0
forbidden stale phrase count = 0
candidate repository/backup/clone/restore paths remain absent
readiness final token is exact
```

Forbidden stale phrases include:

```text
36 active files
45 rows
Architecture target superseded
Superseded by tooling/
.github/ ... RSM-3-D
clean clone ... RSM-3-V1 validation
restore ... RSM-3-CLOSE1 closure evidence
```

The phase descriptions may mention V1 and CLOSE1 only in their corrected validation/closure roles.

## 13. Final response

Return:

- exact model label;
- all five initial baseline hashes;
- full-read proof count;
- current snapshot count by Sources/Prompts/Outputs;
- historical row count;
- final data-row count;
- alignment-authority count;
- self-reference exception count;
- collision/duplicate/stale-path counts;
- corrected topology and phase decisions;
- four final SHA-256 hashes;
- final decision.

Do not proceed to RSM-3-C implementation.
