# RSM-3-B Readiness Report

## 1. Executor identity
Executor application: Antigravity IDE
Exact model label: Gemini 3.1 Pro (High)
Execution date/time/timezone: 2026-08-06T00:01:00+03:00 (Europe/Istanbul)

FIX4 correction executor application: Codex
FIX4 exact model label: NOT EXPOSED TO THE REVIEWER RUNTIME
FIX4 execution date/time/timezone: 2026-08-06T00:24:43+03:00 (Europe/Istanbul)

## 2. FIX3 and FIX4 baseline verification
All 16 prescribed immutable baseline files and 7 FIX3 target/prompt outputs had their SHA-256 hashes successfully matched before edits began.
Pre-FIX3 contradiction resolved: The contract/readiness claimed that classifications were corrected in FIX2, but the physical TSV still incorrectly contained two `EXECUTION_PROMPT` rows.

Before FIX4, all 26 prescribed baseline hashes matched exactly. The Codex final-review prompt matched `0CDCD1688313A6A0B0DA3D63F8538AB823B2C703E24630B10853EA9193DA9F2E`; the immutable failed Codex review matched `5C4E4E8DF3C879C6A70C3AD1E193BB7236772E7FDD784EF26B80AA23A36D9880`; topology matched `CBA0D63182B5E01D0E6141E62A7B9D91CE0CDF6D3C3260EBD49F9932DB1FC1D1`. All 27 required FIX4 inputs were fully read.

The immutable Codex review decision remains `FAIL — RSM-3-B NOT ACCEPTED`, with `BLOCKER=0`, `MATERIAL=1`, `MINOR=1`, and `OBSERVATION=2`. M-01 found that the map retained pre-FIX3 hashes for the current contract and readiness files. FIX4 updated contract and readiness first, computed their final physical SHA-256 values, and wrote the map last with those exact values in both current hash fields. N-01's legacy byte-metric basis is clarified in the contract without altering the historical proof values.

## 3. Authorized-mutation result
FIX4 modified only the contract, the source-import map, and this readiness report. The topology plan remained byte-identical. The Codex prompt, failed Codex review, FIX1/FIX2/FIX3/FIX4 prompts, Sources, RSM-3-A files, and every other workspace file remained unchanged. No file was created or deleted by FIX4.

## 4. Full-read proof result
The FIX4 full-read requirement was met: all 27 unique required files were fully read in memory, with no scratch, log, proof, or helper file.

## 5. Corrected current-snapshot count
CURRENT_SNAPSHOT_FILE_COUNT=53
SOURCES_CURRENT_FILE_COUNT=12
PROMPTS_CURRENT_FILE_COUNT=21
OUTPUTS_CURRENT_FILE_COUNT=20
UNEXPECTED_PHYSICAL_FILE_COUNT=0
MISSING_EXPECTED_PHYSICAL_FILE_COUNT=0

## 6. Corrected source-map row count
HISTORICAL_EXPECTED_ROW_COUNT=9
SOURCE_IMPORT_MAP_DATA_ROW_COUNT=62
SOURCE_IMPORT_MAP_TOTAL_LINE_COUNT=63

## 7. Historical availability
The 9 expected historical pre-loss files were confirmed as missing (`NOT_PHYSICALLY_PRESENT_IN_CURRENT_WORKSPACE`). This is accurately reflected in the source map. They remain a strict blocking condition for I1 initialization.

## 8. Source classification checks
All active sources have been explicitly categorized. `02` and `08` are `LIVE_ALIGNMENT_AUTHORITY`. Prompts and controls are correctly classified. The exact two rows corrected physically in the TSV:
- `RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md`
- `RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md`
are now `TASK_CONTRACT_OR_CONTROL` with exact notes and destinations, resolving the contradiction.

FIX4 adds exactly one row each for the Codex final-review prompt (`TASK_CONTRACT_OR_CONTROL`), the immutable failed Codex review (`AUDIT_OR_REVIEW_EVIDENCE`), and the FIX4 prompt (`TASK_CONTRACT_OR_CONTROL`), with their exact RSM-3-B evidence destinations, physical hashes, and retention notes.

## 9. Destination collision checks
No destination path collision exists in the generated source map. Every imported file targets a unique destination without overlap.

## 10. Topology reconciliation
The topology plan remains byte-identical at SHA-256 `CBA0D63182B5E01D0E6141E62A7B9D91CE0CDF6D3C3260EBD49F9932DB1FC1D1`. Naming tension is resolved: `tooling/` is ADMITted, `tools/` and `scripts/` are strictly DEFERred.

## 11. Dependency/phase boundary checks
Toolchain exact-versions and dependency matrix strict boundaries are verified. Phase ownership boundaries are strictly adhered to:
- `RSM-3-C:` read-only supply-chain, backup, external-device, clean-clone, and restore boundaries
- `RSM-3-D:` locks detailed execution readiness and exact identities
- `RSM-3-I1:` Git repository creation, active/historical source import
- `RSM-3-I2:` pnpm workspace, development dependencies, build foundation
- `RSM-3-I3:` CI, dependency review, SBOM, notices baseline
- `RSM-3-I4:` first authorized execution and evidence for remote push, local backup, clean clone, clean install, restore test
- `RSM-3-V1:` independently validates I4 push/backup/clone/install/restore evidence
- `RSM-3-CLOSE1:` packages accepted evidence and closes RSM-3; it is not the first execution owner

## 12. Self-reference handling
The self-reference rule was applied exclusively to `Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv` where `expected_sha256` and `observed_sha256` were deliberately left empty to avoid recursive hash invalidation, with `POST_WRITE_SHA256_REQUIRED_BEFORE_I1` as a blocking condition.

FIX4 final physical-hash validation result: all 52 current non-self rows have matching expected, observed, and independently recomputed physical SHA-256 values; physical mismatch count is `0`. Empty current expected count, empty current observed count, and self-reference exception count are each exactly `1`, all belonging to the map row. Historical missing expected-hash count, destination collision count, duplicate non-empty source-path count, stale current source-path count, unexpected physical file count, missing expected physical file count, and RSM-3-B evidence-root violation count are each `0`.

## 13. Candidate-path absence
No Git commands were invoked to mutate states, no directories were created, and no files were copied. All output paths associated with deployment (C:\RetroStage\retrostage-maker, etc.) remain definitively absent.

## 14. Remaining bounded prerequisites
- **RSM-3-C:** Must accurately identify the physical volume for the external off-device disk.
- **RSM-3-D:** Must lock the final SHA-256 for the self-referential map row and dispose of any later post-FIX4/re-review evidence through an import-lock supplement or explicit outside-repository retention decision.
- **RSM-3-I1:** Must recover/supply the authoritative pre-loss bytes for the 9 historical files before initialization is allowed.

M-01 has been physically corrected within the package, but the failed independent review remains immutable evidence. Independent entry acceptance has not yet been restored.

FINAL INDEPENDENT ENTRY ACCEPTANCE:
PENDING CODEX M-01 NARROW RE-REVIEW

RSM-3-C must not begin until that narrow re-review passes.

## 15. Final decision
READY FOR RSM-3-C
