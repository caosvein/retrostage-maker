# RSM-3-B — Codex Independent Final Review Prompt

## 1. Review identity

```text
Milestone: RSM-3
Slice: RSM-3-B
Review mode: INDEPENDENT / READ-ONLY / FINAL ENTRY REVIEW
Reviewer: Codex
Implementation authority: NONE
```

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

Review whether the corrected RSM-3-B package is materially coherent and supports entry to RSM-3-C.

Do not implement RSM-3-C.

## 2. Mandatory output guard

The only authorized new file is:

```text
Outputs\RSM-3-B-CODEX-INDEPENDENT-REVIEW.md
```

Before any other work:

```powershell
$reviewOutput =
  'C:\RetroStage\bootstrap\RSM-3-A\Outputs\RSM-3-B-CODEX-INDEPENDENT-REVIEW.md'

if (Test-Path -LiteralPath $reviewOutput) {
  'BLOCKED — RSM-3-B CODEX REVIEW OUTPUT ALREADY EXISTS'
  exit 42
}
```

If it exists, stop. Do not overwrite, rename, delete, or create a substitute.

## 3. Reviewer identity

Record:

```text
Reviewer application: Codex
Exact reviewer model label: <EXACT LABEL EXPOSED BY RUNTIME>
Review date/time/timezone: <OBSERVED>
```

If the runtime exposes no exact model label, record exactly:

```text
NOT EXPOSED TO THE REVIEWER RUNTIME
```

Do not infer a model name.

## 4. Immutable reviewed package

Verify before review:

| File | Required SHA-256 |
|---|---|
| `Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md` | `4442A2CA9CF864A470A4D9A5FA9A0AB2E8B868B8B101293B9C1F0755957CF3A0` |
| `Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv` | `F7DE88E3ADD4BC5E31E2F912E369221F60DC4FCEAB7A880B1FCFD7AB1403D49A` |
| `Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv` | `CBA0D63182B5E01D0E6141E62A7B9D91CE0CDF6D3C3260EBD49F9932DB1FC1D1` |
| `Outputs\RSM-3-B-READINESS-REPORT.md` | `7D2CC2D371A881BBDB4E5894BA0D1AD1B0CD194E60E33EB98FAD630DE84204B6` |
| `Prompts\RSM-3-B-FIX3-EXACT-CONTROL-CLASSIFICATION-AND-EVIDENCE-CONSISTENCY-PROMPT.md` | `DAD28240E0979C199CFC6C176F2880FA45B1C8ACDC1F01D2994887D2AC77E0A6` |

Also verify:

```text
Outputs\RSM-3-A-READINESS-REFRESH1-REPORT.md
77F8A11AF17BF4A1202BFC3C1F0ECA9D2A6FD4071A8DDB653BE88620B6109957

Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md
18BED1CDE587DB5C689B638CF38CD88CB2D95806E4F5B9AD86ED8B99A5E03A71

Sources\03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md
912FCBC1588E0EB3C6EDF4488DA56D3C79CB4DF086DA389ED8D2ADFF20C7FD1B

Sources\04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md
41AB7216F5193DC31499C2F2C5E86D4EE0D1530C782D48B94A910B8A7C2001FA

Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md
8C618F89153F485A96CBE441214DC9C18CD2DE634500ED175A4938964F76C33C

Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
F0BB28A7E4CF0F1E0146E545ECA69B25F004100CA558B0DF4C031E56D9736F60

Sources\09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md
9D0F825B4A4823A7E6B102D1B2B69BEFEB10E6CF074DE095D088E4936913CFBA
```

If any required file is missing or mismatched, create only the review report and end:

```text
FAIL — RSM-3-B NOT ACCEPTED
```

## 5. Required complete reads

Read fully:

1. the four corrected RSM-3-B outputs;
2. original RSM-3-B prompt;
3. FIX1 prompt;
4. FIX2 prompt;
5. FIX3 prompt;
6. RSM-3-A Readiness Refresh1;
7. owner-decision lock;
8. sources 03, 04, 06, 08, and 09.

Use complete reads, not excerpts or search snippets.

Record a compact full-read manifest containing:

```text
relative_path
byte_length
line_count
sha256
full_read=TRUE
```

## 6. Temporal snapshot rule

The physical source-import map is a frozen RSM-3-B FIX3 snapshot:

```text
CURRENT_SNAPSHOT_FILE_COUNT=50
HISTORICAL_EXPECTED_ROW_COUNT=9
SOURCE_IMPORT_MAP_DATA_ROW_COUNT=59
SOURCE_IMPORT_MAP_TOTAL_LINE_COUNT=60
```

This Codex review prompt and its later review report occur after that snapshot.

Therefore:

- do not require the Codex prompt/report to appear in the FIX3 map;
- do not call the RSM-3-B map invalid merely because later review evidence exists;
- record that RSM-3-D must reconcile post-FIX3 review evidence before I1 by either:
  - admitting it through a final import-lock supplement; or
  - explicitly retaining it outside the repository;
- do not modify the RSM-3-B map during this review.

This is a bounded later-phase requirement, not automatically an RSM-3-C blocker.

## 7. Required independent checks

### 7.1 TSV structure

Read the TSV as tab-delimited data and verify:

```text
columns = 12 exact expected columns
current rows = 50
historical rows = 9
data rows = 59
physical lines including header = 60
```

Expected columns:

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

### 7.2 Exact classification checks

Verify exactly:

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
→ LIVE_ALIGNMENT_AUTHORITY

08_RSM_REBOOT_CURRENT_MILESTONE.md
→ LIVE_ALIGNMENT_AUTHORITY
```

Verify these exact control rows:

```text
RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md
→ TASK_CONTRACT_OR_CONTROL
→ docs/evidence/rsm-3/rsm-3-a/RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md

RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md
→ TASK_CONTRACT_OR_CONTROL
→ docs/evidence/rsm-3/rsm-3-a/RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md

RSM-3-B original/FIX1/FIX2/FIX3 prompts
→ TASK_CONTRACT_OR_CONTROL
→ docs/evidence/rsm-3/rsm-3-b/prompts/
```

Ordinary RSM-3-A execution prompts may remain `EXECUTION_PROMPT` only when their notes say they are retained trace evidence and not executable authority after import.

### 7.3 Hash and self-reference checks

Verify:

```text
exactly one self-reference exception
self-reference filename = RSM-3-B-SOURCE-IMPORT-MAP.tsv
expected_sha256 empty only for that current row
observed_sha256 empty only for that current row
blocking_condition = POST_WRITE_SHA256_REQUIRED_BEFORE_I1
all other current expected hashes equal observed hashes
all nine historical expected hashes populated
```

Where physical Windows source paths are available, independently recompute current non-self SHA-256 values.

If the reviewer runtime cannot access a physical Windows path, distinguish:

```text
NOT RECOMPUTABLE IN REVIEWER RUNTIME
```

from a mismatch. Do not invent successful recomputation.

### 7.4 Collision and path checks

Verify:

```text
destination collision count = 0
duplicate non-empty source-path count = 0
RSM-3-B evidence-root violation count = 0
historical destination collision count = 0
```

Verify no exact control row remains under:

```text
docs/evidence/rsm-3/rsm-3-a/prompts/
```

### 7.5 Topology review

Verify the topology plan remains coherent:

```text
.github/ → ADMIT / RSM-3-I3
docs/ → ADMIT / RSM-3-I1
tooling/ → ADMIT / RSM-3-I2
tools/ → DEFER / POST_RSM_3_OWNER_TBD
scripts/ → DEFER / POST_RSM_3_OWNER_TBD
apps/ → RESERVE_ROOT_ONLY / RSM-5
packages/ and the three admitted packages → RSM-3-I2
editor/player Electron packages → FORBID_DURING_RSM_3
```

Check that minimum meaningful package contents do not claim product behavior.

### 7.6 Contract consistency

Review whether contract, map, topology, and readiness agree on:

- repository path, remote, branch, HTTPS authentication;
- repository-local Git identity;
- historical bytes blocking I1;
- self-reference map hash lock owned by RSM-3-D;
- TypeScript 6.0.3 candidate;
- exact-version-only and one-lockfile rules;
- dependency-admission boundary;
- `tooling/` versus deferred `tools/` and `scripts/`;
- no product dependency admission;
- no implementation evidence claim.

### 7.7 Phase ownership

Verify exact ownership:

```text
RSM-3-C:
read-only supply-chain/backup/external-device/clone/restore boundary

RSM-3-D:
detailed execution readiness, exact package/action identities,
self-reference map-hash lock, post-FIX3 evidence reconciliation

RSM-3-I1:
repository creation and source import after historical bytes exist

RSM-3-I2:
pnpm workspace and admitted development tooling

RSM-3-I3:
CI, dependency review, SBOM, notices

RSM-3-I4:
first push/backup/clean-clone/clean-install/restore execution and evidence

RSM-3-V1:
independent validation of I4 evidence

RSM-3-CLOSE1:
closure packaging, not first restore execution
```

### 7.8 Non-implementation and live guards

Run read-only checks:

```powershell
Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Backup\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'C:\RetroStage\bootstrap\RSM-3-A\scratch_proofs.txt'
```

Expected:

```text
False
False
False
False
False
```

Do not create these paths.

## 8. Finding severity

Classify every finding:

```text
BLOCKER
MATERIAL
MINOR
OBSERVATION
```

Rules:

- any false physical TSV classification, collision, missing historical hash, unauthorized implementation, or material contract contradiction is at least `MATERIAL`;
- any condition that makes RSM-3-C unsafe is `BLOCKER`;
- bounded RSM-3-D/I1 prerequisites are not blockers when truthfully recorded;
- style-only or redundant wording may be `MINOR`;
- do not fail the package for harmless chronology wording when the current physical evidence is unambiguous.

## 9. Required report

Create exactly:

```text
Outputs\RSM-3-B-CODEX-INDEPENDENT-REVIEW.md
```

Required sections:

1. Reviewer identity
2. Output guard
3. Immutable hash verification
4. Full-read manifest
5. Review scope and temporal snapshot rule
6. TSV structural results
7. Classification results
8. Hash/self-reference results
9. Collision/path results
10. Topology results
11. Contract consistency results
12. Phase-ownership results
13. Non-implementation/live-guard results
14. Findings table
15. Bounded later-phase prerequisites
16. Final assessment
17. Final decision

Final decision exactly one of:

```text
PASS — RSM-3-B ACCEPTED FOR RSM-3-C
FAIL — RSM-3-B NOT ACCEPTED
```

The final non-empty line must be the exact decision token.

Use PASS only when no `BLOCKER` or `MATERIAL` finding remains.

## 10. Forbidden actions

Do not:

- modify any existing file;
- modify the RSM-3-B map to include this review;
- create a second report or scratch file;
- create/init/clone a repository;
- configure Git identity;
- authenticate or mutate GitHub;
- install tools or dependencies;
- create backup/clone/restore paths;
- import sources;
- commit or push;
- begin RSM-3-C;
- claim historical bytes exist;
- claim RSM-3 is complete.

## 11. Final chat response

Return:

- exact reviewer model label;
- package hash results;
- full-read count;
- TSV counts;
- exact control-row outcomes;
- hash/self-reference outcomes;
- collision/path outcomes;
- topology and phase outcomes;
- findings by severity;
- report path and SHA-256;
- final decision.
