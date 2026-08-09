# RSM-3-A-FIX6 — Final Package Consistency Sweep Before Narrow Codex Re-Review

## Task

Perform one final narrow consistency sweep before the Codex M-01 re-review.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

Do not rerun the audit. Do not install or configure anything. Do not create a repository.

## Starting baseline

Verify these hashes before editing:

```text
Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md
E2FEC00D0BA1E5FBBEAC46913F68FF2813FC4EE4D63BBE2B2E962B7C6602B7C8

Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
424A2ED7EA49D5965CB4672DEE0FF70DA44EBCEFD5F93EF2F459977D17AE726C

Outputs\RSM-3-A-READINESS-REPORT.md
273CCB594E4D73F992EC162C67045E3919822AEE761B729DB5AE9F5216CA15B6

Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
FABF93F2014B096D61172C22BF226E47EA46EB01405858035AE0B78F6DE8E699

Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv
65CFEDA9CD2472B55CC557B0D70FC7F9D38A2DCE21102B2266920D57C9C0C8DA

Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
CC99C65148C0E8DA90C3D6E23BB7D331AE046154981531AFB0AEA971DA0190DF
```

If any differs, stop with:

```text
BLOCKED — FIX6 BASELINE MISMATCH
```

## Accepted facts

Preserve:

```text
C: = Disk 2, KIOXIA-EXCERIA PRO G2 SSD, NVMe
D: = Disk 0, TOSHIBA THNSNJ256G8NU, SATA
E: = Disk 1, WDC WD10EZRX-00D8PB0, SATA

C: and D: are distinct physical devices.
D: is a separate local physical device, not an off-device backup.
Codex independent review completed with PASS WITH MATERIAL CORRECTIONS.
M-01 was remediated by FIX4.
Narrow Codex M-01 re-review remains pending.
Primary readiness remains BLOCKED.
```

## Files allowed to change

Modify exactly:

```text
Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md
Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
Outputs\RSM-3-A-READINESS-REPORT.md
Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
```

Do not modify:

```text
Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv
Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
```

## Required corrections

### 1. Environment Inventory — replace A.7 completely

In:

```text
Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md
```

replace the entire current section:

```text
### A.7 Proposed clean-clone and restore-test targets
```

with the following evidence-accurate structure:

```text
### A.7 Proposed clean-clone and restore-test targets

All paths remain OWNER DECISION REQUIRED and do not currently exist.

If the canonical repository is selected on C::

| Purpose | Candidate path | Storage relation | Meaning |
|---|---|---|---|
| Clean clone | `D:\RSM-Validation\clean-clone` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Reproducibility / clean-clone test |
| Restore test | `D:\RSM-Restore-Test` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Recovery-procedure test |

If the canonical repository is selected on D::

| Purpose | Candidate path | Storage relation | Meaning |
|---|---|---|---|
| Clean clone | `C:\RSM-Validation\clean-clone` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Reproducibility / clean-clone test |
| Restore test | `C:\RSM-Restore-Test` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Recovery-procedure test |

C: and D: are verified distinct physical disks on this workstation. These candidates provide separate-local-device isolation. They do not constitute off-device backup. A separate off-workstation/off-device backup remains an owner decision.
```

After replacement, none of these stale phrases may remain in Environment Inventory:

```text
Separate drive from repo
Same as clean-clone target
prove off-disk recovery
D:\RetroStage\clone-test
C:\RetroStage\clone-test
D:\RetroStage\restore-test
C:\RetroStage\restore-test
```

Do not create any candidate path.

### 2. Repository / Remote / Backup Decision — free-space value

In:

```text
Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
```

replace:

```text
803 GB free space — ample
```

with:

```text
804.4 GB free space at the latest retained volume check — ample
```

### 3. Repository / Remote / Backup Decision — unify clean-clone paths

Use these candidates consistently:

If repository is on C::

```text
Clean clone: D:\RSM-Validation\clean-clone
Restore test: D:\RSM-Restore-Test
```

If repository is on D::

```text
Clean clone: C:\RSM-Validation\clean-clone
Restore test: C:\RSM-Restore-Test
```

State explicitly:

```text
C: and D: are verified distinct physical disks.
The opposite-disk candidate provides separate-local-device isolation.
It does not provide off-device backup.
```

Do not leave `D:\RetroStage\clone-test`, `C:\RetroStage\clone-test`, `D:\RetroStage\restore-test`, or `C:\RetroStage\restore-test`.

Keep all final path choices as `OWNER DECISION REQUIRED`.

### 4. Toolchain Inventory — update Codex execution status

In:

```text
Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
```

replace the stale Codex row:

```text
Codex	ASSIGNED	Not yet invoked	Not yet invoked	OPTIONAL PRODUCTIVITY TOOL	PENDING REVIEW	Secondary read-only reviewer
```

with a valid TSV row equivalent to:

```text
Codex	COMPLETED	NOT EXPOSED TO REVIEWER RUNTIME	Local review application	TASK EXECUTION APPLICATION / OUTSIDE PRODUCT TOOLCHAIN	PASS WITH MATERIAL CORRECTIONS	Independent read-only review completed; M-01 remediated by FIX4; narrow M-01 re-review pending
```

Preserve tab delimiters.

Do not change any other toolchain row unless required to keep valid TSV structure.

### 5. Readiness Report — installation evidence wording

In:

```text
Outputs\RSM-3-A-READINESS-REPORT.md
```

replace the false evidence text:

```text
All tool checks report NOT INSTALLED; no install commands were executed
```

with:

```text
No installation commands were executed. Required bootstrap tools Git and Node.js remain absent; already-present inspection/runtime utilities were not changed.
```

### 6. Readiness Report — owner decision paths

In the owner-decision table, replace vague values such as:

```text
Cross-drive from repo
```

for clean-clone and restore-test with:

```text
Opposite verified physical-disk candidate under the C:↔D: mapping; exact path OWNER DECISION REQUIRED
```

Do not treat this as a final owner decision.

### 7. Readiness Report — file-history grammar and completeness

Replace the current file-history subsection with past-tense, complete entries:

```text
- Initial audit created the five primary Outputs files.
- FIX1 modified four primary Outputs files and left the source-read manifest unchanged.
- FIX2 modified all five primary Outputs files.
- FIX3 modified the environment inventory, toolchain inventory, and readiness report.
- Codex independent review created `RSM-3-A-CODEX-INDEPENDENT-REVIEW.md` and did not modify the primary outputs.
- FIX4 modified the environment inventory, source-read manifest, repository/remote/backup decision, and readiness report.
- FIX5 modified the environment inventory, repository/remote/backup decision, and readiness report.
- FIX6 modifies the environment inventory, repository/remote/backup decision, readiness report, and toolchain inventory.
- Sources and Prompts were never modified.
```

### 8. Readiness Report — status consistency

Preserve the current status:

```text
CODEX INDEPENDENT REVIEW: COMPLETED — PASS WITH MATERIAL CORRECTIONS
M-01 REMEDIATION: EXECUTED
M-01 NARROW RE-REVIEW: PENDING
```

Do not state or imply that Codex has not yet been invoked.

### 9. Final line

The final non-empty line of:

```text
Outputs\RSM-3-A-READINESS-REPORT.md
```

must remain exactly:

```text
BLOCKED
```

## Validation

Before responding, verify:

1. all six starting hashes matched before editing;
2. source-read manifest remains byte-identical;
3. Codex review remains byte-identical;
4. no `Not yet invoked` text remains in any of the four modified files;
5. no `PENDING REVIEW` Codex status remains in toolchain inventory;
6. no stale `803 GB` or `803.51 GB` C: free-space value remains;
7. none of the seven forbidden stale A.7 phrases/paths remains;
8. Environment Inventory does not describe D: as off-device backup;
9. Decision Record uses `RSM-Validation\clean-clone` and `RSM-Restore-Test` candidates consistently;
10. clean-clone and restore-test remain separate paths and are not created;
11. Codex toolchain row says completed, model label unavailable, original decision retained, M-01 re-review pending;
12. readiness installation-evidence wording no longer says all tools were not installed;
13. owner decisions remain unresolved;
14. no installation/configuration/repository/product mutation occurred;
15. readiness report final non-empty line is exactly `BLOCKED`.

## Final response

Return:

- exact model label;
- baseline result;
- four modified files;
- unchanged manifest and Codex-review hashes;
- new toolchain hash;
- fifteen validation results;
- final decision.

Do not begin tool installation or RSM-3-B.
