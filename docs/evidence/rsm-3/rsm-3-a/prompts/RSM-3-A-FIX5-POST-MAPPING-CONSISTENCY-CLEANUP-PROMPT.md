# RSM-3-A-FIX5 — Post-FIX4 Residual Consistency Cleanup

## Task

Apply a narrow consistency cleanup after successful physical-disk mapping.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

Do not rerun the full audit. Do not install/configure anything. Do not create a repository.

## Starting hashes

Verify before editing:

```text
Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md
2EE3F949751F00535A5F2C35007257E85748F8E1E0BE77CCAC03845FC0F7FC4E

Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv
65CFEDA9CD2472B55CC557B0D70FC7F9D38A2DCE21102B2266920D57C9C0C8DA

Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
FABF93F2014B096D61172C22BF226E47EA46EB01405858035AE0B78F6DE8E699

Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
23E0CFBF723BDF386ADDA02C51122E7F9EAD5D060B837BEB766F4B0FEF6D4EB1

Outputs\RSM-3-A-READINESS-REPORT.md
0A695586852038BC5F51474B9F3067B0F54F7667289D12DC5FFE5A42569F3A44

Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
CC99C65148C0E8DA90C3D6E23BB7D331AE046154981531AFB0AEA971DA0190DF
```

If any differs, stop with:

```text
BLOCKED — FIX5 BASELINE MISMATCH
```

## Accepted current facts

Preserve:

```text
C: = Disk 2, KIOXIA-EXCERIA PRO G2 SSD, NVMe
D: = Disk 0, TOSHIBA THNSNJ256G8NU, SATA
E: = Disk 1, WDC WD10EZRX-00D8PB0, SATA

C: and D: are distinct physical devices.
D: is a separate local physical device, but not an off-device backup.
M-01 physical-disk contradiction was remediated by FIX4.
Primary readiness remains BLOCKED.
```

## Files allowed to change

Modify exactly:

```text
Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md
Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
Outputs\RSM-3-A-READINESS-REPORT.md
```

Do not modify:

```text
Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv
Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
```

## Required corrections

### 1. Provenance header

In each modified Markdown file, add separate provenance lines:

```text
M-01 Remediation Executor: Antigravity IDE
M-01 Remediation Model: Gemini 3.1 Pro (High)
```

Preserve the initial Claude and prior Gemini correction provenance.

### 2. Environment audit-type wording

In `RSM-3-A-ENVIRONMENT-INVENTORY.md`, replace the misleading header:

```text
Audit type: Read-only; no installation, configuration, or repository mutation
```

with:

```text
Audit type: Non-destructive inspection with temporary audit-workspace writes; no persistent system, configuration, repository, authoritative-source, or product mutation
```

### 3. Free-space consistency

Use the latest verified C: volume free-space value consistently:

```text
804.4 GB
```

Do not leave the stale `803.51 GB` value in the repository-candidate table.

### 4. Clean-clone and restore target wording

In the environment inventory, remove or replace stale wording including:

```text
Separate drive from repo
Same as clean-clone target, different directory
prove off-disk recovery
```

Use a clear table such as:

```text
If repository is on C::

Clean clone:
D:\RSM-Validation\clean-clone
SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED

Restore test:
D:\RSM-Restore-Test
SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED

These are separate local-device workflow/recovery-test targets.
They are not off-device backup.
```

If repository is placed on D:, present equivalent C: candidates as owner-decision alternatives.

Do not create any path.

### 5. Decision-record wording

In `RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md`, replace:

```text
Cross-drive testing ensures the clone is not an accidental same-disk reference.
```

with evidence-specific wording:

```text
For the verified C:/D: mapping on this workstation, C: and D: are distinct physical disks. Placing the clean-clone or restore-test target on the other of these two disks provides separate-local-device isolation. This does not constitute off-device backup.
```

Preserve:

- clean clone proves reproducibility;
- restore test proves recovery procedure;
- GitHub remote is off-workstation source replication;
- GitHub alone is not the complete backup/restore plan;
- secondary off-device backup remains an owner decision.

### 6. Historical FIX1 disk-number contradiction

In `RSM-3-A-READINESS-REPORT.md`, rename:

```text
FIX1 Direct Terminal Command
```

to:

```text
FIX1 Retained Historical Output — Superseded by FIX4 Full Mapping
```

Immediately after its retained output, add:

```text
Evidence note:
The retained FIX1 block reports the KIOXIA device as Disk 0.
The later complete FIX4 drive-letter-to-disk mapping identifies:
C: = Disk 2 KIOXIA
D: = Disk 0 TOSHIBA
E: = Disk 1 WDC

The FIX1 disk number is inconsistent with and superseded by the complete FIX4 mapping.
It must not be used as current disk-number authority.
```

Do not silently rewrite the historical output.

### 7. Codex status

Replace every stale statement:

```text
Codex: Assigned as read-only reviewer — not yet invoked
```

or equivalent with:

```text
Codex independent review: COMPLETED
Decision: PASS WITH MATERIAL CORRECTIONS
Material finding M-01: remediated by FIX4
Narrow M-01 re-review: PENDING
```

Apply this in environment inventory and readiness report.

### 8. RSM status semantics

In the readiness report, use:

```text
RSM-3: CURRENT
RSM-3-A PRIMARY AUDIT: EXECUTED
RSM-3-A CORRECTIONS FIX1–FIX4: EXECUTED
CODEX INDEPENDENT REVIEW: COMPLETED — PASS WITH MATERIAL CORRECTIONS
M-01 REMEDIATION: EXECUTED
M-01 NARROW RE-REVIEW: PENDING
RSM-3-A ACCEPTANCE: BLOCKED / PENDING M-01 RE-REVIEW, OWNER DECISIONS, AND TOOL REMEDIATION
RSM-3-B: BLOCKED
REPOSITORY: NOT YET CREATED
```

### 9. Resolution path

Update the readiness resolution path so that the independent review step is no longer presented as not yet performed.

Use:

1. narrow Codex M-01 re-review;
2. owner decisions;
3. owner authorization for Git and Node.js;
4. exact pnpm activation method selection;
5. authentication-method selection;
6. GitHub CLI only if selected;
7. LongPathsEnabled decision as recommendation;
8. tool/version re-verification;
9. updated readiness decision.

### 10. File-history inventory

Update the readiness report’s modified-file history to include:

```text
FIX3 modified the environment inventory, toolchain inventory, and readiness report.
FIX4 modified the environment inventory, source-read manifest, repository/remote/backup decision, and readiness report.
FIX5 modifies the three Markdown files authorized by this prompt.
```

Do not claim that only FIX1/FIX2 occurred.

### 11. Final decision

The readiness report’s last non-empty line must remain exactly:

```text
BLOCKED
```

## Validation

Before responding, verify:

1. all six starting hashes match;
2. manifest remains byte-identical;
3. toolchain inventory remains byte-identical;
4. Codex review remains byte-identical;
5. no `Not yet invoked` Codex status remains;
6. no stale `803.51 GB` C: candidate free-space value remains;
7. no claim says D: is off-device backup;
8. FIX1 disk-number inconsistency is explicitly superseded by FIX4;
9. clean-clone and restore-test paths are separate and uncreated;
10. status block shows Codex review completed and M-01 re-review pending;
11. no installation/configuration/repository/product mutation occurred;
12. readiness report final non-empty line is exactly `BLOCKED`.

## Final response

Return:

- exact model label;
- baseline result;
- three modified files;
- unchanged hashes for manifest, toolchain, and Codex review;
- twelve validation results;
- final decision.

Do not start tool installation or RSM-3-B.
