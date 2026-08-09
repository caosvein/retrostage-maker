# RSM-3-B — Repository / Toolchain / Source-Import Contract Prompt

## 1. Task identity

```text
Milestone: RSM-3 — Repository / Remote Backup / Reproducible Bootstrap
Task: RSM-3-B — Repository / Toolchain / Source-Import Contract
Mode: CONTRACT / READ-ONLY INSPECTION
Primary executor: Antigravity IDE
Repository implementation: FORBIDDEN
```

RSM-3-A has supplied a current entry-control decision:

```text
READY FOR RSM-3-B
```

This task must define the exact contract that later RSM-3-D/I1/I2 work will implement.

It must not create the local repository, source destinations, workspace manifests, package files, directories, commits, or pushes.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

## 2. Mandatory output non-overwrite guards

Exactly four permanent outputs are authorized:

```text
Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md
Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv
Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv
Outputs\RSM-3-B-READINESS-REPORT.md
```

Before any other work:

```powershell
$workspace = 'C:\RetroStage\bootstrap\RSM-3-A'

$authorizedOutputs = @(
  'Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md',
  'Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv',
  'Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv',
  'Outputs\RSM-3-B-READINESS-REPORT.md'
) | ForEach-Object { Join-Path $workspace $_ }

$existingOutputs =
  $authorizedOutputs | Where-Object { Test-Path -LiteralPath $_ }

if ($existingOutputs) {
  'BLOCKED — RSM-3-B OUTPUT ALREADY EXISTS'
  $existingOutputs
  exit 41
}
```

If any target exists, stop immediately. Do not overwrite, rename, delete, or create substitute filenames.

## 3. Executor identity

Record in the Markdown outputs:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED MODEL LABEL>
Execution date/time/timezone: <OBSERVED>
```

Do not infer a model label.

## 4. Required full reads

Read fully, in authority order:

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
13. `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv`
14. `Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md`
15. `Outputs\RSM-3-A-READINESS-REFRESH1-REPORT.md`
16. `Outputs\RSM-3-A-GITHUB-VISIBILITY-OVERWRITE-INCIDENT-NOTE.md`

A search result, excerpt, header, or previous summary is not a full read.

## 5. Immutable baseline

Verify before contract work:

| File | Required SHA-256 |
|---|---|
| `Sources\00_RSM_REBOOT_PROJECT_CHARTER.md` | `509D9F67CC6C5645B5C3DCCE9437A8C41BA049A561DD15307D6A3B9DEDFB928C` |
| `Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md` | `8C618F89153F485A96CBE441214DC9C18CD2DE634500ED175A4938964F76C33C` |
| `Sources\01_RSM_REBOOT_CANONICAL_ROADMAP.md` | `AE8A851C81F7B18ECDCCA2EBABEFE026C3D2491EA48E645F7EE9085C8324BC05` |
| `Sources\05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` | `86A5B5BC350AA3A6C7C7B141AC489EE76C1535628CF16E5CF7F6764F081C1573` |
| `Sources\03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md` | `912FCBC1588E0EB3C6EDF4488DA56D3C79CB4DF086DA389ED8D2ADFF20C7FD1B` |
| `Sources\04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md` | `41AB7216F5193DC31499C2F2C5E86D4EE0D1530C782D48B94A910B8A7C2001FA` |
| `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` | `5417B6C6CE30755EB38EC436FAC1AE214F1BD79681E0F6E65E5BB6DA23A818D8` |
| `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md` | `F0BB28A7E4CF0F1E0146E545ECA69B25F004100CA558B0DF4C031E56D9736F60` |
| `Sources\09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md` | `9D0F825B4A4823A7E6B102D1B2B69BEFEB10E6CF074DE095D088E4936913CFBA` |
| `Sources\RSM-2-V1-SOURCE-SET-CONSISTENCY-REVIEW.md` | `1DD2FA78E82B5338BD6A75028DA7C911A146CD0785C3C70F3A22FA881E302EC0` |
| `Sources\RSM-2-CLOSE1-SOURCE-RECONSTRUCTION-CLOSURE.md` | `FE61409732028356EEE534464A252E0F5AAC29587540980A2A1B09D8F6683E75` |
| `Sources\RSM-3-A-REPOSITORY-BOOTSTRAP-AUDIT-AND-READINESS-CONTRACT.md` | `FCBDA15B020C2A726A20204382AEDD6B1CF6FAA153DD9C4BDB08920E3206EB11` |
| `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv` | `65CFEDA9CD2472B55CC557B0D70FC7F9D38A2DCE21102B2266920D57C9C0C8DA` |
| `Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md` | `18BED1CDE587DB5C689B638CF38CD88CB2D95806E4F5B9AD86ED8B99A5E03A71` |
| `Outputs\RSM-3-A-READINESS-REFRESH1-REPORT.md` | `77F8A11AF17BF4A1202BFC3C1F0ECA9D2A6FD4071A8DDB653BE88620B6109957` |
| `Outputs\RSM-3-A-GITHUB-VISIBILITY-OVERWRITE-INCIDENT-NOTE.md` | `5D6C75DF507B53D94BE6C2E194ACE77A6BF4B8810DFE731C0487E9CE12D7BB4B` |

If any file is missing or mismatched:

- create only the four authorized outputs if none already exists;
- record every mismatch;
- do not continue contract decisions;
- make the final line of `RSM-3-B-READINESS-REPORT.md` exactly:

```text
BLOCKED
```

## 6. Current accepted RSM-3-B inputs

The contract must preserve these accepted inputs unless a governing source proves a material contradiction:

```text
Canonical repository:
C:\RetroStage\retrostage-maker

Remote:
https://github.com/caosvein/retrostage-maker.git

Remote owner:
caosvein

Visibility:
Private

Future remote name:
origin

Primary branch:
main

Authentication:
GitHub CLI browser OAuth + HTTPS Git protocol

Future repository-local Git identity:
user.name = caosvein
user.email = caosvein@gmail.com

Global Git identity:
remain unset unless separately authorized

Shell:
Windows PowerShell 5.1

Git:
2.55.0.windows.3

Node.js:
24.19.0 LTS

npm:
11.17.0

pnpm:
11.17.0

Corepack:
observed only; not selected as pnpm activation authority

TypeScript project-local candidate:
6.0.3

LongPathsEnabled:
1

Active source root:
docs/sources/

Historical archive root:
docs/historical/2026-07-pre-loss/

Local manual backup:
D:\RSM-Backup\retrostage-maker

Clean clone:
D:\RSM-Validation\clean-clone

Restore test:
D:\RSM-Restore-Test

Additional off-device backup class:
external physical disk stored at another physical location
```

No path above currently authorizes directory creation.

## 7. Read-only current-state checks

Run:

```powershell
$ErrorActionPreference = 'Continue'

git.exe --version
node.exe --version
npm.cmd --version
pnpm.cmd --version
gh.exe --version

gh.exe auth status --active --hostname github.com
gh.exe api user --jq '.login'
gh.exe config get git_protocol --host github.com

gh.exe api repos/caosvein/retrostage-maker `
  --jq '{
    full_name: .full_name,
    private: .private,
    visibility: .visibility,
    archived: .archived,
    disabled: .disabled,
    default_branch: .default_branch,
    size: .size,
    clone_url: .clone_url,
    permissions: .permissions
  }'

git.exe ls-remote `
  https://github.com/caosvein/retrostage-maker.git

"LS_REMOTE_EXIT_CODE=$LASTEXITCODE"

git.exe config --global --get-all user.name 2>&1
git.exe config --global --get-all user.email 2>&1

Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Backup\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
```

Do not expose tokens.

## 8. Contract decisions required

### 8.1 Repository creation contract

Define, without executing:

- exact canonical repository path;
- preconditions for directory creation;
- whether I1 uses `git init` followed by adding `origin`, or another explicit approved method;
- exact primary branch creation rule;
- empty-remote handling;
- repository-local Git identity commands;
- global identity prohibition;
- exact remote verification commands;
- baseline status/diff/untracked checks;
- owner approval points before commit and push;
- no automatic commit/push rule.

All commands in RSM-3-B are **PROVISIONAL / NOT YET VALIDATED** until physically executed and observed in I1 or later.

Do not create/finalize source 07 as validated authority.

### 8.2 Source classification and import contract

Define distinct classes:

```text
LIVE_CANONICAL_SOURCE
LIVE_ALIGNMENT_AUTHORITY
REVIEW_OR_CLOSURE_EVIDENCE
TASK_CONTRACT_OR_CONTROL
EXECUTION_PROMPT
AUDIT_OR_REVIEW_EVIDENCE
HISTORICAL_PRE_LOSS_SOURCE
TEMPORARY_BOOTSTRAP_ARTIFACT
DO_NOT_IMPORT
```

Every file currently present under:

```text
Sources\
Prompts\
Outputs\
```

must be inventoried read-only and assigned one class.

Do not assume every prompt or correction artifact belongs in the repository.

### 8.3 Active source destinations

The contract must define exact destinations for at least:

- nine reboot authority sources;
- RSM-2 review and closure evidence;
- RSM-3-A contract, audit, review, remediation, authentication, incident, and readiness evidence;
- retained execution prompts that are deliberately admitted;
- files deliberately excluded from import.

At minimum, evaluate this structure:

```text
docs/sources/
docs/evidence/rsm-2/
docs/evidence/rsm-3/rsm-3-a/
docs/historical/2026-07-pre-loss/
```

Do not create these directories.

Preserve filenames where unchanged. Any rename requires an explicit source-to-destination mapping row and reason.

### 8.4 Historical source contract

Use source 09 as the identity and hash authority for the nine historical files:

```text
00_RSM_PROJECT_CHARTER.md
01_RSM_CANONICAL_ROADMAP_RSM-0-RSM-120.md
02_RSM_CURRENT_PROJECT_STATE.md
03_RSM_ARCHITECTURE_AND_PACKAGE_MAP.md
04_RSM_ENGINEERING_AND_REVIEW_WORKFLOW.md
05_RSM_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md
06_RSM_CURRENT_MILESTONE_RSM-25.md
07_RSM_REPOSITORY_COMMANDS_AND_VALIDATION.md
README_POST_I5_ALIGNMENT_REFRESH.md
```

Inspect only the current workspace for these exact files:

```powershell
$historicalNames = @(
  '00_RSM_PROJECT_CHARTER.md',
  '01_RSM_CANONICAL_ROADMAP_RSM-0-RSM-120.md',
  '02_RSM_CURRENT_PROJECT_STATE.md',
  '03_RSM_ARCHITECTURE_AND_PACKAGE_MAP.md',
  '04_RSM_ENGINEERING_AND_REVIEW_WORKFLOW.md',
  '05_RSM_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md',
  '06_RSM_CURRENT_MILESTONE_RSM-25.md',
  '07_RSM_REPOSITORY_COMMANDS_AND_VALIDATION.md',
  'README_POST_I5_ALIGNMENT_REFRESH.md'
)

foreach ($name in $historicalNames) {
  Get-ChildItem `
    -LiteralPath 'C:\RetroStage\bootstrap\RSM-3-A' `
    -File -Recurse -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -ceq $name } |
    Select-Object FullName,Length,CreationTime,LastWriteTime
}
```

Rules:

- If physically present, compute SHA-256 and compare with source 09.
- If absent, record `NOT_PHYSICALLY_PRESENT_IN_CURRENT_WORKSPACE`.
- Never fabricate a source path.
- Missing historical bytes may be a bounded prerequisite for I1 rather than a false import claim.
- The contract must state exactly when missing historical bytes become blocking.
- Historical files must later be copied byte-identically and accompanied by a machine-readable manifest.
- No historical file may be edited during import.

### 8.5 Source-import map TSV

Create:

```text
Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv
```

UTF-8 with one header row and these exact columns:

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

Requirements:

- Include every current file under `Sources`, `Prompts`, and `Outputs`.
- Include nine historical expected-file rows even when absent.
- Use absolute source paths only when observed.
- For absent historical files, leave `source_path` and `observed_sha256` empty.
- Destination paths are repository-relative.
- `content_policy` must be one of:
  - `COPY_BYTE_IDENTICAL`
  - `COPY_WITH_EXPLICIT_RENAME_MAP`
  - `GENERATE_NEW_REPOSITORY_AUTHORITY_LATER`
  - `RETAIN_OUTSIDE_REPOSITORY`
  - `DO_NOT_IMPORT`
- No two admitted files may map to the same destination path.
- No file may be labeled imported or committed.

### 8.6 Toolchain and dependency-admission contract

Define:

- external tool versions already installed and verified;
- root `packageManager` field target:
  `pnpm@11.17.0`;
- Node version-file target:
  `.node-version` containing `24.19.0`;
- repository engine policy candidate;
- TypeScript `6.0.3` as source-approved project-local candidate;
- exact-version-only policy;
- one authoritative `pnpm-lock.yaml`;
- frozen-lockfile validation requirement;
- no Corepack activation authority;
- no global TypeScript authority;
- no product dependencies during RSM-3.

The RSM-3 admitted dependency families are limited to:

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

RSM-3-B must not invent exact package versions for families not yet exact-audited.

For each admitted family, assign:

- purpose;
- development/release classification;
- owning RSM-3 implementation slice;
- exact-version selection point;
- license review requirement;
- lockfile/transitive-graph review requirement.

Explicitly forbid Electron, Vite, Babylon.js, React, TypeBox/Ajv, Havok, SQLite, Recast, Monaco, React Flow, OpenTelemetry, asset-pipeline codecs, FFmpeg, Steamworks, and other later-owned dependencies.

### 8.7 Initial topology reconciliation

The sources contain a naming tension:

```text
Architecture target:
tools/ and scripts/

Current milestone / Refresh1 recommendation:
tooling/
```

Do not silently create both.

The contract must:

1. identify the tension explicitly;
2. choose one bootstrap rule or return `BLOCKED`;
3. explain source authority and migration implications;
4. avoid empty cosmetic roots;
5. distinguish target topology from I1/I2 physical creation.

Evaluate:

```text
.github/
docs/
apps/
packages/
tools/
scripts/
tooling/
```

The architecture source describes a likely RSM-3 package minimum:

```text
@retrostage/core
@retrostage/diagnostics
@retrostage/test-fixtures
```

The contract must decide for each:

- admitted in RSM-3 or deferred;
- owning slice;
- exact physical path;
- authority/environment classification;
- minimum files required before the directory has meaning;
- forbidden capability claims.

No `apps/editor-electron` or `apps/player-electron` may be admitted during RSM-3.

### 8.8 Initial topology plan TSV

Create:

```text
Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv
```

UTF-8 with these exact columns:

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

`decision` must be one of:

```text
ADMIT
RESERVE_ROOT_ONLY
DEFER
FORBID_DURING_RSM_3
```

This file is a plan, not proof of directory creation.

### 8.9 Backup/source safety interface

RSM-3-B must carry forward, but not implement:

```text
D:\RSM-Backup\retrostage-maker
D:\RSM-Validation\clean-clone
D:\RSM-Restore-Test
external off-device disk at another physical location
```

Define which later phase owns each:

- RSM-3-C contract/boundary;
- RSM-3-I4 execution;
- RSM-3-V1 validation;
- RSM-3-CLOSE1 closure evidence.

Do not confuse local backup, clean clone, restore test, remote replication, or external off-device backup.

## 9. Contract Markdown output

Create:

```text
Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md
```

Required sections:

1. Task identity and executor
2. RSM-3-A entry evidence
3. Full-read manifest
4. Immutable hash verification
5. Current observed state
6. Repository creation contract
7. Branch/remote/authentication contract
8. Repository-local Git identity contract
9. Source classification vocabulary
10. Active-source import contract
11. Historical-source import contract
12. RSM-3-A evidence-retention contract
13. Toolchain identity contract
14. Dependency-admission boundary
15. Topology naming reconciliation
16. Initial package/root admission decisions
17. Backup/clean-clone/restore interfaces
18. Provisional command policy
19. Allowed and forbidden scope for RSM-3-C/D/I1/I2
20. Risks and stop conditions
21. Required validation evidence
22. Deferred-but-bounded decisions
23. Supersession/non-implementation statement

The non-implementation statement must include:

```text
This RSM-3-B contract defines future repository bootstrap behavior.
It does not prove that any repository path, directory, manifest,
package, dependency, lockfile, commit, push, clone, backup, or
restore artifact exists.
```

## 10. RSM-3-B readiness decision

Create:

```text
Outputs\RSM-3-B-READINESS-REPORT.md
```

Required sections:

1. Executor identity
2. Output guards
3. Baseline hashes
4. Full-read result
5. Contract-output inventory
6. Source-map completeness
7. Historical-source physical-availability result
8. Topology reconciliation result
9. Toolchain/dependency boundary result
10. Remaining material contradictions
11. Bounded prerequisites for later phases
12. Mutation confirmation
13. Final decision

Final decision exactly one of:

```text
READY FOR RSM-3-C
BLOCKED
```

Use `READY FOR RSM-3-C` only when:

- all baseline hashes match;
- all required files were fully read;
- the contract has no material internal contradiction;
- every current Sources/Prompts/Outputs file is classified;
- all nine historical expected rows exist in the map;
- absent historical files are truthfully bounded without false availability claims;
- active-source and evidence destinations are collision-free;
- topology naming is explicitly resolved;
- admitted/deferred/forbidden roots and packages are exact;
- dependency families are bounded to RSM-3 ownership;
- repository creation commands remain provisional;
- no implementation occurred.

`READY FOR RSM-3-C` does not mean I1 is executable. RSM-3-C and RSM-3-D must still close their boundaries and readiness checks.

The final non-empty line must be the exact decision token.

## 11. Post-write verification

After creating the four outputs:

```powershell
Get-FileHash -Algorithm SHA256 `
  'Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md',
  'Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv',
  'Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv',
  'Outputs\RSM-3-B-READINESS-REPORT.md' |
  Format-List

Get-Content `
  'Outputs\RSM-3-B-READINESS-REPORT.md' |
  Where-Object { $_.Trim() } |
  Select-Object -Last 1
```

Also prove:

```powershell
Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Backup\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
```

All must remain `False`.

## 12. Final chat response

Return:

- exact model label;
- output-guard result;
- baseline result;
- full-read result;
- current file inventory count;
- historical availability count;
- source-import map row count;
- collision count;
- topology decisions;
- naming-reconciliation decision;
- toolchain/dependency contract summary;
- four output paths and SHA-256 values;
- final decision.

Do not create the repository or begin RSM-3-C implementation.
