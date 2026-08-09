# RSM-3-B — FIX3 Exact Control-Classification and Evidence-Consistency Prompt

## 1. Task

Perform one narrow correction of the current RSM-3-B package.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

The actual current source-import map still classifies these two files incorrectly:

```text
RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md
RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md
```

They remain `EXECUTION_PROMPT` in the physical TSV even though the corrected contract and readiness report claim they are `TASK_CONTRACT_OR_CONTROL`.

FIX3 must make the physical TSV, contract, and readiness report consistent.

Do not begin RSM-3-C.

## 2. Executor identity

Record exactly:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED MODEL LABEL>
Execution date/time/timezone: <OBSERVED>
```

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

## 4. Mandatory pre-FIX3 baseline

Verify before any edit:

| File | Required SHA-256 |
|---|---|
| `Prompts\RSM-3-B-FIX2-RESIDUAL-CONSISTENCY-CLASSIFICATION-SCRATCH-CLEANUP-PROMPT.md` | `2B8A2FDF546802301BE1A80BCA6C7E032356D31E4BA98B0553F2ADEE46627426` |
| `Outputs\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT.md` | `D01E3D4C4211AC5E4FECD61C6E83E09ED83AD0A4EBBE9D2E0E025D5AE9787CDB` |
| `Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv` | `5841BEE7CA1124B02DCBFE8EDAEDB49F66DFE65481A4B3208FDA890FDE1A6044` |
| `Outputs\RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv` | `CBA0D63182B5E01D0E6141E62A7B9D91CE0CDF6D3C3260EBD49F9932DB1FC1D1` |
| `Outputs\RSM-3-B-READINESS-REPORT.md` | `7D8C0918B6FB3D2F832FCC77AE5DD24AD4F76E9E75C67ECBAB73D700C9CA3812` |

Also verify:

```text
Prompts\RSM-3-B-REPOSITORY-TOOLCHAIN-SOURCE-IMPORT-CONTRACT-ANTIGRAVITY-PROMPT.md
BB88D307333F46FACFB6C2D463CBC0574419AFB2B0132A0ED12D2D5E92CEA11C

Prompts\RSM-3-B-FIX1-CONTRACT-IMPORT-MAP-TOPOLOGY-READINESS-CORRECTION-PROMPT.md
457C2A44EF7365F75F4775F0E0F72CFEC56B155776DE90D267492F88941DB01E
```

Re-verify the original 16 immutable RSM-3-B governing inputs from the original RSM-3-B prompt.

If any baseline differs, stop without mutation:

```text
BLOCKED — RSM-3-B FIX3 BASELINE MISMATCH
```

## 5. Required full reads

Fully read with `Get-Content -Raw` or equivalent:

1. original RSM-3-B prompt;
2. FIX1 prompt;
3. FIX2 prompt;
4. this FIX3 prompt;
5. current contract;
6. current source-import map;
7. current topology plan;
8. current readiness report;
9. the original 16 governing inputs.

Keep proof in memory. Do not create a scratch or auxiliary file.

## 6. Exact physical-map correction

Import the physical TSV and find rows by exact `filename`.

### Row 1

```text
filename:
RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md

required classification:
TASK_CONTRACT_OR_CONTROL

required destination_path:
docs/evidence/rsm-3/rsm-3-a/RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md

required notes:
Retained workflow-control evidence; not current source authority and not an executable instruction after import.
```

### Row 2

```text
filename:
RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md

required classification:
TASK_CONTRACT_OR_CONTROL

required destination_path:
docs/evidence/rsm-3/rsm-3-a/RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md

required notes:
Retained exact-version control evidence; not current source authority and not an executable instruction after import.
```

For both rows retain:

```text
generation=current
current_presence=PRESENT
content_policy=COPY_BYTE_IDENTICAL
import_phase=I1
blocking_condition=NONE
expected_sha256=<existing exact hash>
observed_sha256=<same existing exact hash>
```

Do not apply filename-pattern heuristics. Patch the two exact filename rows deliberately.

## 7. FIX3 prompt inclusion

The owner will place this FIX3 prompt in `Prompts\` before execution.

The source-import map must include it exactly once:

```text
filename:
RSM-3-B-FIX3-EXACT-CONTROL-CLASSIFICATION-AND-EVIDENCE-CONSISTENCY-PROMPT.md

classification:
TASK_CONTRACT_OR_CONTROL

destination_path:
docs/evidence/rsm-3/rsm-3-b/prompts/RSM-3-B-FIX3-EXACT-CONTROL-CLASSIFICATION-AND-EVIDENCE-CONSISTENCY-PROMPT.md

content_policy:
COPY_BYTE_IDENTICAL

import_phase:
I1

blocking_condition:
NONE
```

Its expected and observed SHA-256 fields must match its physical file hash.

## 8. Dynamic inventory and counts

Do not retain `49` by assumption.

After this FIX3 prompt exists and no other file is created, dynamically count current files under:

```text
Sources\
Prompts\
Outputs\
```

Expected relationship:

```text
SOURCE_IMPORT_MAP_DATA_ROW_COUNT =
CURRENT_SNAPSHOT_FILE_COUNT + 9

SOURCE_IMPORT_MAP_TOTAL_LINE_COUNT =
SOURCE_IMPORT_MAP_DATA_ROW_COUNT + 1
```

The map must contain every current file exactly once and exactly nine historical rows.

## 9. Contract correction

Modify the contract only to:

1. add a concise FIX3 correction-history statement;
2. state that the physical TSV now matches the intended classifications;
3. update dynamic snapshot/map counts;
4. retain the two exact control classifications and destinations;
5. state that FIX3 modified only contract/map/readiness;
6. retain all prior toolchain, topology, dependency, historical-byte, phase, and non-implementation boundaries.

Do not rewrite unrelated sections.

## 10. Readiness correction

Modify the readiness report to:

1. add FIX3 baseline verification;
2. record the pre-FIX3 contradiction:
   - contract/readiness claimed corrected;
   - physical TSV still contained two `EXECUTION_PROMPT` rows;
3. record the exact two corrected rows;
4. update dynamic counts;
5. state topology remained byte-identical;
6. record all validation results;
7. state that only contract/map/readiness were modified;
8. preserve historical-byte, map-self-hash, and external-device bounded prerequisites.

The final non-empty line must be exactly:

```text
READY FOR RSM-3-C
```

only when all validations pass.

## 11. Write order and self-reference

Use this order:

1. verify all baselines;
2. full-read inputs;
3. compute dynamic inventory;
4. update contract;
5. update readiness without embedding final map hash;
6. generate or patch source-import map last;
7. do not rewrite contract/readiness after map creation;
8. verify topology hash remains `CBA0D63182B5E01D0E6141E62A7B9D91CE0CDF6D3C3260EBD49F9932DB1FC1D1`;
9. compute final contract/map/readiness hashes for terminal evidence.

Retain exactly one self-reference exception:

```text
filename=RSM-3-B-SOURCE-IMPORT-MAP.tsv
expected_sha256=
observed_sha256=
blocking_condition=POST_WRITE_SHA256_REQUIRED_BEFORE_I1
```

## 12. Mandatory validation

Run exact validations proving:

```text
historical row count = 9
current row count = dynamic current snapshot
data row count = current + 9
total line count = data + 1

LIVE_ALIGNMENT_AUTHORITY count = 2

RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md:
classification = TASK_CONTRACT_OR_CONTROL
destination = exact RSM-3-A evidence root
notes = exact retained-control note

RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md:
classification = TASK_CONTRACT_OR_CONTROL
destination = exact RSM-3-A evidence root
notes = exact retained-control note

FIX3 prompt row count = 1
FIX3 prompt classification = TASK_CONTRACT_OR_CONTROL
FIX3 prompt evidence-root violation count = 0

self-reference exception count = 1
empty current-hash row count = 1
non-self current hash mismatch count = 0
historical missing expected-hash count = 0
destination collision count = 0
duplicate source-path count = 0
stale current source-path count = 0
RSM-3-B evidence-root violation count = 0

topology hash unchanged
candidate repository/backup/clone/restore paths absent
no scratch/auxiliary file created
readiness final token exact
```

Also inspect and prove that neither exact control filename remains under:

```text
docs/evidence/rsm-3/rsm-3-a/prompts/
```

## 13. Forbidden actions

Do not:

- modify topology;
- modify Sources, Prompts, or any RSM-3-A output;
- create scratch, log, report, or helper files;
- create/init/clone a repository;
- configure Git identity;
- change GitHub/authentication;
- install dependencies or tools;
- import sources;
- create backup/clone/restore directories;
- commit or push;
- begin RSM-3-C;
- claim historical bytes are present;
- claim RSM-3 is complete.

## 14. Final response

Return:

- exact model label;
- pre-FIX3 baseline hashes;
- full-read count;
- current snapshot counts by Sources/Prompts/Outputs;
- two exact corrected row values;
- FIX3 prompt row result;
- historical/current/data/line counts;
- alignment/self-reference/hash/collision/duplicate/stale-path results;
- topology unchanged hash;
- final contract/map/readiness SHA-256 values;
- final decision.

Do not proceed to RSM-3-C implementation.
