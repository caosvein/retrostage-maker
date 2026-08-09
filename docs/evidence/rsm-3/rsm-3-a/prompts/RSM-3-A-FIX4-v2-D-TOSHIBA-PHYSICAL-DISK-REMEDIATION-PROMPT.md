# RSM-3-A-FIX4-v2 — Physical-Disk Mapping and Codex M-01 Remediation

## Task

Remediate the single material finding from the Codex independent review:

```text
M-01 — Cross-volume targets were incorrectly promoted to proven physical-device separation
```

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

This is still a temporary audit workspace, not the future repository.

## Owner-provided storage facts

The owner provides the following facts:

```text
C: is the KIOXIA NVMe drive.
D: is a physically different Toshiba drive.
```

Handling rule:

- Record both as `OWNER-PROVIDED FACT`.
- C: already has retained read-only `Get-Disk` evidence.
- D: must be independently verified in this pass by mapping drive letter → partition → disk number → physical model.
- Do not invent the exact Toshiba model.
- Do not classify D: as verified separate-device evidence until the read-only mapping confirms that C: and D: have different disk numbers and D:'s physical model is Toshiba.
- If verification succeeds, classify C:↔D: as `SEPARATE PHYSICAL DEVICE — VERIFIED`.
- If verification fails, preserve the owner fact but classify the relationship as `PHYSICAL DEVICE RELATION UNKNOWN PENDING SYSTEM VERIFICATION`.

## Review authority

Read fully:

```text
Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
```

Expected SHA-256:

```text
CC99C65148C0E8DA90C3D6E23BB7D331AE046154981531AFB0AEA971DA0190DF
```

If the review hash differs, stop with:

```text
BLOCKED — CODEX REVIEW BASELINE MISMATCH
```

## Starting primary-output baseline

Verify these hashes before editing:

- `Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md` — `C07130FC505787642E00C7AFECC19A77E89B06BB2DF2FA91C822470E9EFB3C21`
- `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv` — `646DF8E3F0BDCA739399A71D9AFE696E181F994EE6AB36792D99BF1E7BA5F6C6`
- `Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv` — `FABF93F2014B096D61172C22BF226E47EA46EB01405858035AE0B78F6DE8E699`
- `Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md` — `116879F16C26368612B0F94B71BFE5D8900762843B125EEE565B56A95D1AB3E6`
- `Outputs\RSM-3-A-READINESS-REPORT.md` — `CE10C12BA30F114B0521E59C39538368067B784FED991717B69F2385B961A997`

If any baseline differs, stop with:

```text
BLOCKED — PRIMARY OUTPUT BASELINE MISMATCH
```

## Executor provenance

Preserve:

```text
Initial audit:
Antigravity IDE — Claude Opus 4.6 (Thinking)

Prior correction passes:
Antigravity IDE — Gemini 3.1 Pro (High)
```

Record this pass separately:

```text
M-01 remediation executor: Antigravity IDE
M-01 remediation model: <EXACT MODEL LABEL DISPLAYED BY ANTIGRAVITY>
```

Do not imply access to previous hidden reasoning or chats.

## Allowed actions

You may:

- fully read the Codex review and five primary outputs;
- run narrow, non-destructive disk/partition/volume inspection commands;
- modify only the four expected files identified below;
- preserve readiness as `BLOCKED`.

## Forbidden actions

Do not:

- install/update any tool;
- change registry, PATH, policy, credentials, Git configuration, or system settings;
- authenticate to GitHub;
- create/init/clone a repository;
- run mutating Git commands;
- create product code, manifests, packages, apps, or lockfiles;
- resolve owner decisions;
- modify the Codex review;
- begin RSM-3-B;
- create a sixth permanent audit output.

## Required disk mapping

### Primary mapping command

Run:

```powershell
Get-Partition |
  Where-Object {{ $_.DriveLetter }} |
  ForEach-Object {{
    $partition = $_
    $disk = Get-Disk -Number $partition.DiskNumber

    [pscustomobject]@{{
      DriveLetter      = [string]$partition.DriveLetter
      PartitionNumber  = $partition.PartitionNumber
      DiskNumber       = $partition.DiskNumber
      DiskModel        = $disk.FriendlyName
      BusType          = $disk.BusType
      PhysicalDiskGB   = [math]::Round($disk.Size / 1GB, 2)
      PartitionGB      = [math]::Round($partition.Size / 1GB, 2)
    }}
  }} |
  Sort-Object DriveLetter |
  Format-Table -AutoSize
```

### Volume command

Run:

```powershell
Get-Volume |
  Where-Object {{ $_.DriveLetter }} |
  Select-Object DriveLetter, FileSystemType,
    @{{Name='VolumeSizeGB';Expression={{[math]::Round($_.Size / 1GB, 2)}}}},
    @{{Name='FreeGB';Expression={{[math]::Round($_.SizeRemaining / 1GB, 2)}}}} |
  Sort-Object DriveLetter |
  Format-Table -AutoSize
```

### Explicit C:/D: comparison

Run:

```powershell
$mapped = Get-Partition |
  Where-Object {{ $_.DriveLetter -in @('C','D') }} |
  ForEach-Object {{
    $disk = Get-Disk -Number $_.DiskNumber
    [pscustomobject]@{{
      DriveLetter = [string]$_.DriveLetter
      DiskNumber  = $_.DiskNumber
      DiskModel   = $disk.FriendlyName
      BusType     = $disk.BusType
    }}
  }} |
  Sort-Object DriveLetter

$mapped
"C_AND_D_DISTINCT_DISK_NUMBERS=" +
  (($mapped | Select-Object -ExpandProperty DiskNumber -Unique).Count -eq 2)
"D_IS_TOSHIBA=" +
  ([bool](($mapped | Where-Object DriveLetter -eq 'D').DiskModel -match 'TOSHIBA'))
```

Record the exact commands and exact relevant outputs in the readiness report.

## Verification outcomes

### Outcome A — owner fact confirmed

Use only if:

- C: and D: have different `DiskNumber` values; and
- D: model contains `TOSHIBA`.

Then record:

```text
Owner-provided fact CONFIRMED:
C: and D: are distinct physical disks.
D: is a Toshiba physical disk.
C:↔D: classification: SEPARATE PHYSICAL DEVICE — VERIFIED.
```

This permits D: to be considered a genuine separate-device candidate for:

- clean-clone testing;
- restore testing;
- a local secondary copy.

However, do not call D: a complete off-device backup. It remains inside the same workstation and can be lost to theft, fire, power damage, malware, or whole-machine failure.

### Outcome B — mapping incomplete or contradictory

Use if commands fail, access is denied, disk numbers match, or D: is not reported as Toshiba:

```text
Owner-provided fact retained but not system-verified.
C:↔D: classification: PHYSICAL DEVICE RELATION UNKNOWN.
Separate-volume workflow isolation does not prove off-disk resilience.
```

Record the error/result exactly. Do not invent a mapping.

## Required file corrections

### 1. Environment inventory

Modify:

```text
Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md
```

Required changes:

- add the owner-provided D: fact;
- add verified disk number/model/bus type for C:, D:, and E: where observed;
- replace `Unknown / Unproven mapping` only when evidence exists;
- classify C:↔D: using the appropriate verification outcome;
- distinguish:
  - separate volume;
  - separate physical device;
  - separate off-device backup;
- retain repository path and target paths as `OWNER DECISION REQUIRED`.

If C:/D: verification succeeds, proposed paths may be described as:

```text
Repository candidate:
C:\RetroStage\retrostage-maker

Clean-clone candidate:
D:\RSM-Validation\clean-clone

Restore-test candidate:
D:\RSM-Restore-Test

Physical-device relation:
SEPARATE PHYSICAL DEVICE — VERIFIED
```

Do not create these paths.

### 2. Repository / remote / backup decision

Modify:

```text
Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
```

Required distinctions:

- D: may be a verified separate local physical device from C:;
- D: is still not off-device from the workstation;
- clean clone proves reproducibility;
- restore test proves recovery procedure;
- GitHub private remote provides off-workstation source replication;
- GitHub alone is not the whole backup/restore plan;
- a secondary off-device backup remains an owner decision.

Keep all final paths, remote, branch, visibility, authentication, backup, clean-clone, and restore choices unresolved.

### 3. Readiness report

Modify:

```text
Outputs\RSM-3-A-READINESS-REPORT.md
```

Add:

- exact model label for this remediation;
- owner-provided D: fact;
- exact commands and outputs;
- C:/D:/E: mapping result;
- one of these exact M-01 results:

```text
M-01: REMEDIATED — C: AND D: DISTINCT PHYSICAL DEVICES VERIFIED
```

or:

```text
M-01: REMEDIATED BY WORDING — PHYSICAL RELATION REMAINS UNVERIFIED
```

Preserve:

- Git blocker;
- Node.js blocker;
- pnpm activation decision;
- owner decisions;
- RSM-3-B blocked;
- repository not created.

The final non-empty line must be exactly:

```text
BLOCKED
```

### 4. Source manifest provenance cleanup

Modify:

```text
Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv
```

Only correct the source-02 note if it says the current `5417...` value matches the earlier V1 hash.

Use:

```text
Current physical hash matches the post-closure alignment-authority value; it is not the earlier pre-closure V1 table value.
```

Do not change its filename, bytes, SHA-256, or `FULLY_READ`.

### 5. Toolchain inventory

Do not modify:

```text
Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
```

It must remain byte-identical.

### 6. Codex review

Do not modify:

```text
Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
```

It remains the immutable review that raised M-01.

## Expected modified files

Exactly four:

```text
Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md
Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv
Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
Outputs\RSM-3-A-READINESS-REPORT.md
```

## Validation

Before responding, verify:

1. Codex review hash matches.
2. All five starting primary hashes match.
3. C:/D:/E: mapping command result is retained.
4. D: owner fact is either confirmed or explicitly unverified.
5. No phrase equates a different drive letter alone with a different physical disk.
6. Separate local physical disk is not mislabeled as complete off-device backup.
7. Owner decisions remain unresolved.
8. Toolchain inventory remains byte-identical with SHA-256:
   `{primary_hashes["RSM-3-A-TOOLCHAIN-INVENTORY.tsv"]}`
9. Source-02 provenance note is corrected without changing its physical hash field.
10. No installation/configuration/repository/product mutation occurred.
11. Readiness report final non-empty line is exactly `BLOCKED`.

## Final response

Return:

- exact remediation model label;
- baseline verification;
- exact disk commands and outputs;
- whether D: owner fact was confirmed;
- physical-device classifications for C:/D:/E:;
- M-01 result;
- four modified files;
- unchanged toolchain hash;
- eleven validation results;
- final readiness decision.

Do not begin tool installation or RSM-3-B.
