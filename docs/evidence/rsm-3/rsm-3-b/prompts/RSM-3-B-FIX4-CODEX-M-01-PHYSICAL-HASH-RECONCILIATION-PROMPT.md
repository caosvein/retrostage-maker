# RSM-3-B — FIX4 Codex M-01 Physical-Hash Reconciliation Prompt

## 1. Task

Correct the single material finding `M-01` from:

```text
Outputs\RSM-3-B-CODEX-INDEPENDENT-REVIEW.md
```

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

Codex independently verified that the physical source-import map still contains pre-FIX3 hashes for:

```text
RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md
RSM-3-B-READINESS-REPORT.md
```

The current physical files have these accepted pre-FIX4 hashes:

```text
Contract:
4442A2CA9CF864A470A4D9A5FA9A0AB2E8B868B8B101293B9C1F0755957CF3A0

Readiness:
7D2CC2D371A881BBDB4E5894BA0D1AD1B0CD194E60E33EB98FAD630DE84204B6
```

The map still contains:

```text
Contract:
D01E3D4C4211AC5E4FECD61C6E83E09ED83AD0A4EBBE9D2E0E025D5AE9787CDB

Readiness:
7D8C0918B6FB3D2F832FCC77AE5DD24AD4F76E9E75C67ECBAB73D700C9CA3812
```

FIX4 must update the contract and readiness evidence, then write the map last using their final post-FIX4 physical hashes.

Do not begin RSM-3-C.

## 2. Executor identity

Record exactly:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED MODEL LABEL>
Execution date/time/timezone: <OBSERVED>
```

Do not normalize the displayed model label.

## 3. Authorized mutations

Exactly these three existing files may be modified:

```text
Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md
Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv
Outputs\RSM-3-B-READINESS-REPORT.md
```

This file must remain byte-identical:

```text
Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv
```

No other file may be created, modified, renamed, moved, or deleted.

The owner-supplied FIX4 prompt under `Prompts\` is an immutable input.

## 4. Mandatory pre-FIX4 baseline

Verify before any edit:

```text
Prompts\RSM-3-B-FIX3-EXACT-CONTROL-CLASSIFICATION-AND-EVIDENCE-CONSISTENCY-PROMPT.md
DAD28240E0979C199CFC6C176F2880FA45B1C8ACDC1F01D2994887D2AC77E0A6

Prompts\RSM-3-B-CODEX-INDEPENDENT-FINAL-REVIEW-PROMPT.md
0CDCD1688313A6A0B0DA3D63F8538AB823B2C703E24630B10853EA9193DA9F2E

Outputs\RSM-3-B-CODEX-INDEPENDENT-REVIEW.md
5C4E4E8DF3C879C6A70C3AD1E193BB7236772E7FDD784EF26B80AA23A36D9880

Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md
4442A2CA9CF864A470A4D9A5FA9A0AB2E8B868B8B101293B9C1F0755957CF3A0

Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv
F7DE88E3ADD4BC5E31E2F912E369221F60DC4FCEAB7A880B1FCFD7AB1403D49A

Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv
CBA0D63182B5E01D0E6141E62A7B9D91CE0CDF6D3C3260EBD49F9932DB1FC1D1

Outputs\RSM-3-B-READINESS-REPORT.md
7D2CC2D371A881BBDB4E5894BA0D1AD1B0CD194E60E33EB98FAD630DE84204B6
```

Also verify:

```text
Prompts\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT-ANTIGRAVITY-PROMPT.md
BB88D307333F46FACFB6C2D463CBC0574419AFB2B0132A0ED12D2D5E92CEA11C

Prompts\RSM-3-B-FIX1-CONTRACT-IMPORT-MAP-TOPOLOGY-READINESS-CORRECTION-PROMPT.md
457C2A44EF7365F75F4775F0E0F72CFEC56B155776DE90D267492F88941DB01E

Prompts\RSM-3-B-FIX2-RESIDUAL-CONSISTENCY-CLASSIFICATION-SCRATCH-CLEANUP-PROMPT.md
2B8A2FDF546802301BE1A80BCA6C7E032356D31E4BA98B0553F2ADEE46627426
```

Re-verify the original 16 immutable RSM-3-B governing inputs from the original RSM-3-B prompt.

If any baseline differs, stop without mutation:

```text
BLOCKED — RSM-3-B FIX4 BASELINE MISMATCH
```

## 5. Complete reads

Fully read with `Get-Content -Raw` or equivalent:

1. original 16 governing inputs;
2. original RSM-3-B prompt;
3. FIX1 prompt;
4. FIX2 prompt;
5. FIX3 prompt;
6. Codex independent final-review prompt;
7. Codex independent review report;
8. this FIX4 prompt;
9. current contract;
10. current map;
11. current topology;
12. current readiness.

Keep evidence in memory.

Do not create scratch, log, proof, or helper files.

## 6. Accept Codex review state accurately

The current independent review decision is:

```text
FAIL — RSM-3-B NOT ACCEPTED
```

Its severity totals are:

```text
BLOCKER=0
MATERIAL=1
MINOR=1
OBSERVATION=2
```

FIX4 must not rewrite, delete, or conceal the failed review.

Record:

```text
M-01:
The map contained pre-FIX3 hashes for the current physical contract
and readiness files.

FIX4 action:
Contract and readiness were updated first.
The source-import map was written last with their final post-FIX4
physical hashes.

Independent acceptance:
Still pending a narrow Codex M-01 re-review.
```

The `FAIL` review remains immutable historical evidence.

## 7. Minor finding N-01 treatment

Codex observed that the contract's embedded legacy full-read proof byte values were not consistently physical `Get-Item.Length` values.

Do not replace or fabricate the historical values.

Add a clarification to the contract:

```text
The legacy embedded proof values labelled as byte lengths were
computed from UTF-8 re-encoded text in the Antigravity correction
runtime and are not asserted as physical Get-Item.Length values.
SHA-256 remains the integrity authority.
All future proof manifests must use the explicit field name
physical_byte_length and obtain it from Get-Item.Length.
```

Record `N-01` as clarified/non-material, pending confirmation in the narrow re-review.

## 8. Post-FIX3 evidence inclusion

The current FIX3 map snapshot contains 50 current files.

After FIX3, these evidence files were created or owner-supplied:

```text
Prompts\RSM-3-B-CODEX-INDEPENDENT-FINAL-REVIEW-PROMPT.md
Outputs\RSM-3-B-CODEX-INDEPENDENT-REVIEW.md
Prompts\RSM-3-B-FIX4-CODEX-M-01-PHYSICAL-HASH-RECONCILIATION-PROMPT.md
```

The FIX4 map must include all three exactly once.

### Codex review prompt row

```text
classification=TASK_CONTRACT_OR_CONTROL
destination_path=docs/evidence/rsm-3/rsm-3-b/prompts/RSM-3-B-CODEX-INDEPENDENT-FINAL-REVIEW-PROMPT.md
content_policy=COPY_BYTE_IDENTICAL
import_phase=I1
blocking_condition=NONE
notes=Retained independent-review control; not executable authority after import.
```

### Codex failed review report row

```text
classification=AUDIT_OR_REVIEW_EVIDENCE
destination_path=docs/evidence/rsm-3/rsm-3-b/RSM-3-B-CODEX-INDEPENDENT-REVIEW.md
content_policy=COPY_BYTE_IDENTICAL
import_phase=I1
blocking_condition=NONE
notes=Immutable independent review evidence recording M-01 and FAIL before FIX4 correction.
```

### FIX4 prompt row

```text
classification=TASK_CONTRACT_OR_CONTROL
destination_path=docs/evidence/rsm-3/rsm-3-b/prompts/RSM-3-B-FIX4-CODEX-M-01-PHYSICAL-HASH-RECONCILIATION-PROMPT.md
content_policy=COPY_BYTE_IDENTICAL
import_phase=I1
blocking_condition=NONE
notes=Retained M-01 correction control; not executable authority after import.
```

Expected and observed hashes must equal each physical file's SHA-256.

## 9. Dynamic inventory guard

After the owner places this FIX4 prompt in `Prompts\`, dynamically inventory all files under:

```text
Sources\
Prompts\
Outputs\
```

Do not assume a count.

The existing 50-row FIX3 current snapshot plus the three exact later files above should normally yield 53 current rows.

However, use the physical inventory as authority.

Before writing:

1. import the current TSV;
2. form the set of its 50 non-empty current `source_path` values;
3. add the three exact later file paths;
4. compare that expected set with the physical current inventory.

Required:

```text
unexpected_physical_file_count=0
missing_expected_physical_file_count=0
```

If either is nonzero, stop without edits:

```text
BLOCKED — FIX4 INVENTORY SET MISMATCH
```

## 10. Contract correction

Modify the contract narrowly:

1. add a FIX4/Codex M-01 correction-history statement;
2. record the immutable failed Codex review and its SHA-256;
3. record the exact stale map hashes and current pre-FIX4 physical hashes;
4. clarify N-01 byte metric as specified;
5. update current snapshot/map counts dynamically;
6. record that Codex prompt/report/FIX4 prompt are included;
7. state that only contract/map/readiness were modified;
8. preserve all source classification, topology, dependency, historical-byte, phase, owner-approval, and non-implementation rules.

Do not embed the final map SHA-256 in the contract.

## 11. Readiness correction

Modify the readiness report narrowly:

1. add FIX4 baseline verification;
2. record the failed Codex review and `M-01`;
3. record the exact correction;
4. update dynamic current/data/line counts;
5. record that topology stayed byte-identical;
6. record final physical-hash validation results;
7. record that independent Codex M-01 re-review is still pending;
8. preserve bounded prerequisites:
   - exact external device in RSM-3-C;
   - map self-hash/post-review evidence disposition in RSM-3-D;
   - nine historical bytes before I1.

The final non-empty line may remain:

```text
READY FOR RSM-3-C
```

only as the package-internal readiness decision after physical correction.

The body must also state exactly:

```text
FINAL INDEPENDENT ENTRY ACCEPTANCE:
PENDING CODEX M-01 NARROW RE-REVIEW
```

RSM-3-C must not begin until that re-review passes.

Do not embed final output hashes in readiness.

## 12. Exact write order

Use this order:

1. verify all baselines;
2. fully read all required files;
3. validate exact inventory set;
4. update contract;
5. update readiness;
6. compute final physical SHA-256 for contract and readiness;
7. import the existing source map;
8. patch the exact contract row with the final contract hash in both hash fields;
9. patch the exact readiness row with the final readiness hash in both hash fields;
10. add the exact Codex prompt/report/FIX4 prompt rows;
11. retain every other existing row unchanged unless dynamic validation proves an exact required correction;
12. write the map last;
13. do not rewrite contract or readiness after the map is written;
14. compute final map hash for terminal evidence.

## 13. Self-reference rule

Retain exactly one self-reference exception:

```text
filename=RSM-3-B-SOURCE-IMPORT-MAP.tsv
expected_sha256=
observed_sha256=
blocking_condition=POST_WRITE_SHA256_REQUIRED_BEFORE_I1
```

No other current row may have an empty expected or observed hash.

## 14. Mandatory validation

After writing the map, independently prove:

```text
topology SHA-256 =
CBA0D63182B5E01D0E6141E62A7B9D91CE0CDF6D3C3260EBD49F9932DB1FC1D1

historical rows = 9
current rows = physical current inventory count
data rows = current + 9
total physical lines = data + 1
exact columns = 12

Codex review prompt rows = 1
Codex failed review report rows = 1
FIX4 prompt rows = 1

contract map hash fields =
final physical contract SHA-256

readiness map hash fields =
final physical readiness SHA-256

all non-self current expected hashes =
all non-self current observed hashes =
independently recomputed physical hashes

non-self current physical hash mismatch count = 0
empty current expected hash count = 1
empty current observed hash count = 1
self-reference exception count = 1

historical missing expected-hash count = 0
destination collision count = 0
duplicate non-empty source-path count = 0
stale current source-path count = 0
unexpected physical file count = 0
missing expected physical file count = 0
RSM-3-B evidence-root violation count = 0

candidate repository/backup/clone/restore paths = all False
scratch/auxiliary file count created by FIX4 = 0
readiness final token exact
```

Also verify the contract and readiness rows do not retain any of these stale values:

```text
D01E3D4C4211AC5E4FECD61C6E83E09ED83AD0A4EBBE9D2E0E025D5AE9787CDB
7D8C0918B6FB3D2F832FCC77AE5DD24AD4F76E9E75C67ECBAB73D700C9CA3812
```

Those values may appear only inside historical narrative explaining M-01, never in the current hash fields.

## 15. Forbidden actions

Do not:

- modify topology;
- modify Codex prompt or review;
- modify FIX1/FIX2/FIX3/FIX4 prompts;
- modify Sources or RSM-3-A files;
- create a correction report, scratch file, log, or helper file;
- create/init/clone a repository;
- configure Git identity;
- change GitHub or authentication;
- install tools/dependencies;
- import sources;
- create backup/clone/restore paths;
- commit or push;
- begin RSM-3-C;
- claim the failed Codex review passed;
- claim historical bytes exist;
- claim RSM-3 is complete.

## 16. Final response

Return:

- exact model label;
- all pre-FIX4 baseline hashes;
- full-read count;
- exact inventory-set comparison;
- current counts by Sources/Prompts/Outputs;
- contract/readiness stale and corrected hash values;
- three added post-FIX3 evidence rows;
- structural/hash/collision/path results;
- topology unchanged hash;
- final contract/map/readiness SHA-256 values;
- package-internal readiness token;
- explicit statement that Codex narrow re-review remains pending.

Do not proceed into RSM-3-C.
