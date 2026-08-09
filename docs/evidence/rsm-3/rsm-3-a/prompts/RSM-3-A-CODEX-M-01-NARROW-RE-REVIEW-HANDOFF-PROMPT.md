# RSM-3-A — Codex Narrow M-01 Re-Review Handoff

## Purpose

Perform a narrow independent re-review of the material finding raised in:

```text
Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
M-01 — Cross-volume targets were incorrectly promoted to proven physical-device separation
```

This re-review determines only whether:

1. M-01 has been materially remediated;
2. the corrected primary package is internally consistent;
3. the package truthfully preserves its overall `BLOCKED` readiness result.

A re-review `PASS` does **not** mean the workstation is ready for RSM-3-B.

## Workspace

Open only:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

This is a temporary audit workspace, not the future repository.

## Reviewer identity

- Application: Codex
- Record the exact model label displayed to the reviewer runtime.
- If no exact label is exposed, record:
  `NOT EXPOSED TO THE REVIEWER RUNTIME`
- Do not infer or normalize a model name.

## Immutable review baseline

Recompute all hashes before review.

| File | Expected SHA-256 |
|---|---|
| `Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md` | `7314CD705673106167D2A372A26753AF456E8181AD8809FD609C3AC32DA2FAB4` |
| `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv` | `65CFEDA9CD2472B55CC557B0D70FC7F9D38A2DCE21102B2266920D57C9C0C8DA` |
| `Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv` | `65C0E5D40D08AD818D2BEDB5040D4EBBE6597FC3F70B6CCAA42B44167A0CE8A5` |
| `Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md` | `4A57F7FBFA62FBC0C85AFB6351DA8595D377793133761B241C75AB6223BA7EE2` |
| `Outputs\RSM-3-A-READINESS-REPORT.md` | `18A29E7A47F6EDEEFF905E6DD37F9262C91547978141D0F150D6038213DB787F` |
| `Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md` | `CC99C65148C0E8DA90C3D6E23BB7D331AE046154981531AFB0AEA971DA0190DF` |

If any hash differs, do not review the changed content. Create the review file with final decision:

```text
BLOCKED
```

and identify:

```text
BASELINE MISMATCH
```

## Files to read fully

Read these files completely:

1. `Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md`
2. `Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md`
3. `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv`
4. `Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv`
5. `Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md`
6. `Outputs\RSM-3-A-READINESS-REPORT.md`
7. `Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
8. `Sources\RSM-3-A-REPOSITORY-BOOTSTRAP-AUDIT-AND-READINESS-CONTRACT.md`
9. `Prompts\RSM-3-A-CODEX-READ-ONLY-REVIEW-PROMPT.md`

Do not treat a header, search result, summary, or partial range as a full read.

## Retained disk evidence to verify

The corrected package should retain exact read-only evidence equivalent to:

```text
C: = Disk 2, KIOXIA-EXCERIA PRO G2 SSD, NVMe
D: = Disk 0, TOSHIBA THNSNJ256G8NU, SATA
E: = Disk 1, WDC WD10EZRX-00D8PB0, SATA

C_AND_D_DISTINCT_DISK_NUMBERS=True
D_IS_TOSHIBA=True
```

The historical FIX1 block may still display KIOXIA as Disk 0, but it must be explicitly labeled inconsistent with and superseded by the complete FIX4 mapping.

## Allowed actions

You may:

- read the nine listed files;
- recompute SHA-256 hashes;
- run narrowly necessary non-destructive checks such as:
  - `Get-FileHash`;
  - `Get-Content`;
  - `Select-String`;
  - `Test-Path`;
  - `Get-Partition`;
  - `Get-Disk`;
  - `Get-Volume`;
- create exactly one permanent file:
  `Outputs\RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md`.

## Forbidden actions

Do not:

- modify any existing file;
- modify the prior Codex review;
- install or update tools;
- change registry, PATH, policy, credentials, Git config, or system settings;
- authenticate to GitHub;
- create/init/clone a repository;
- run mutating Git commands;
- create product code, packages, manifests, apps, or lockfiles;
- resolve owner decisions;
- begin RSM-3-B;
- create any permanent file other than the single re-review output.

## Narrow review questions

### A. Baseline integrity

- Do all six immutable baseline hashes match?
- Were all existing files left unchanged during this re-review?

### B. M-01 physical-device evidence

- Does retained evidence map C:, D:, and E: to disk number, model, and bus type?
- Are C: and D: proven to have different disk numbers?
- Is D: proven to be the Toshiba disk?
- Is the historical FIX1 disk-number output explicitly superseded by FIX4?
- Is any stale statement still relying on a different drive letter alone as proof of a different physical disk?

### C. Clean-clone / restore / backup semantics

Verify that the corrected package clearly distinguishes:

```text
clean clone:
reproducibility test

restore test:
recovery-procedure test

separate local physical disk:
local-device isolation

GitHub private remote:
off-workstation source replication

secondary off-device backup:
still OWNER DECISION REQUIRED
```

Check specifically that:

- clean-clone and restore-test use separate candidate directories;
- candidates do not currently exist;
- D: is not called a complete off-device backup;
- GitHub alone is not called a complete backup/restore plan;
- all exact target paths remain owner decisions.

### D. Cross-file consistency

Check all four corrected primary files for consistency:

- Environment Inventory;
- Toolchain Inventory;
- Repository / Remote / Backup Decision;
- Readiness Report.

Confirm:

- C: free space uses the latest retained `804.4 GB` value where relevant;
- Codex independent review is recorded as completed;
- original review decision remains `PASS WITH MATERIAL CORRECTIONS`;
- M-01 remediation is recorded as executed;
- narrow M-01 re-review is pending before this review;
- no stale `Not yet invoked` or `PENDING REVIEW` Codex state remains;
- Git and Node.js remain blockers;
- GitHub CLI remains conditional;
- LongPathsEnabled remains an owner decision/recommendation;
- no product dependency or repository work was pulled forward.

### E. Status correctness

Verify that the readiness report:

- ends exactly with `BLOCKED`;
- says RSM-3 is current;
- says RSM-3-A audit/corrections were executed;
- says repository does not exist;
- says RSM-3-B remains blocked;
- does not imply that M-01 remediation resolves Git, Node, pnpm, authentication, backup, or owner-decision blockers.

## Materiality rule

Use `PASS WITH MATERIAL CORRECTIONS` only when a remaining contradiction could materially misdirect:

- repository placement;
- physical-device selection;
- clean-clone or restore proof;
- off-device backup planning;
- tool installation;
- authentication;
- RSM-3-B handoff.

Pure grammar, tense, formatting, or historical-log wording that cannot misdirect those decisions should be recorded under non-blocking observations and should not prevent `PASS`.

## Required output

Create exactly:

```text
Outputs\RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md
```

Use these sections:

1. Re-review identity
2. Baseline hash verification
3. Files fully read
4. Additional read-only commands and exact relevant outputs
5. M-01 physical-device evidence decision
6. Clean-clone / restore / backup semantics decision
7. Cross-file consistency decision
8. Remaining material findings
9. Non-blocking observations
10. Scope and mutation confirmation
11. Final re-review decision

The final decision must be exactly one of:

```text
PASS
PASS WITH MATERIAL CORRECTIONS
BLOCKED
```

The last non-empty line of the file must be the exact decision token.

## Decision meaning

### PASS

Use when:

- M-01 is materially remediated;
- no other material contradiction remains in the narrow scope;
- the package truthfully supports its continuing `BLOCKED` readiness status.

After `PASS`, the next work is owner decisions and authorized tool remediation—not RSM-3-B entry.

### PASS WITH MATERIAL CORRECTIONS

Use when a material contradiction remains in the narrow scope.

### BLOCKED

Use for baseline mismatch, unreadable required evidence, unauthorized mutation, or inability to complete the review.

## Final chat response

Return:

- exact Codex model label or the approved unavailable-label text;
- six baseline hash results;
- nine files fully read;
- commands executed;
- M-01 decision;
- any remaining material findings;
- non-blocking observations;
- review output path;
- final decision.

Do not modify the primary package or begin remediation.
