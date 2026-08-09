# RSM-3-C — 14TB-Class External Device Candidate Readiness

## 1. Task identity

```text
Milestone: RSM-3
Slice: RSM-3-C
Task: Replacement Intended External Device Candidate Observation
Mode: READ-ONLY DEVICE / VOLUME / FILESYSTEM / CAPACITY INSPECTION
Primary executor: Antigravity IDE
Implementation authority: NONE
```

Workspace: `C:\RetroStage\bootstrap\RSM-3-A`

## 2. Executor identity

```text
Executor application: Antigravity IDE
Exact model label: Gemini 3.1 Pro (High)
Execution date/time/timezone: 2026-08-06T18:46:45+03:00
```

## 3. Owner intent and change from previous candidate

The owner changed the intended external-backup candidate before the EXT-01 through EXT-05 device-identity lock artifact was created.

```text
Current owner intent:
Use the newly available portable disk described as approximately
14 TB as the intended external-backup candidate.

Do not lock the previously observed 1 TB Toshiba candidate.

Owner intent timestamp:
2026-08-06T09:50+03:00

Timestamp precision:
minute
```

## 4. Device-lock existence guard

```text
previous_device_identity_lock_exists=FALSE
```

No device identity lock file exists, meaning no device has been locked as the accepted external backup role.

## 5. Output guards

Both authorized output targets were absent before execution. No overwrite was attempted.

```text
Outputs\RSM-3-C-14TB-CANDIDATE-OBSERVATION.tsv — ABSENT before task
Outputs\RSM-3-C-14TB-CANDIDATE-READINESS.md — ABSENT before task
```

## 6. Immutable baseline

All 8 required input files matched their expected SHA-256 values before inspection began.

```text
Outputs\RSM-3-C-SUPPLY-CHAIN-BACKUP-RESTORE-BOUNDARY-CONTRACT.md
95A4B81A3A73DC31344A423D2C4158E024E28895EA08B0E1752F11886751781B — MATCH

Outputs\RSM-3-C-READINESS-REPORT.md
145BF7BF4DE5B73897DE99EE30FA2F28436F314444B92911A0BB78D35A4D2A98 — MATCH

Outputs\RSM-3-C-EXTERNAL-DEVICE-INVENTORY.tsv
2FDA531A1ED625B5BEB014C2F933F3EB027141798368DE2EFE828A6FB7D820C6 — MATCH

Outputs\RSM-3-C-RESPONSIBILITY-AND-VALIDATION-MATRIX.tsv
05C4397D1ACC09E526D1E849AD4D07AF84BD30C93EF14E9D9901C79DF62FE913 — MATCH

Outputs\RSM-3-C-CODEX-INDEPENDENT-OWNER-ACTION-PACKAGE-REVIEW.md
8F91B8210FB03380AE63741DB40679126D4482CB73CED06AE4529CB1B73F2CAB — MATCH

Outputs\RSM-3-C-OWNER-POLICY-DECISION-LOCK-2026-08-06.md
52ACFEBDB588AECF852433FC4690235B430D0BBDCF6A45C2085F5B6E85F74EE0 — MATCH

Outputs\RSM-3-C-TOSHIBA-CANDIDATE-OBSERVATION.tsv
9917CC9FC1DFAC16B8004B9F0143A4D6DDAAEC57037370DC27BA2E5C52116CEF — MATCH

Outputs\RSM-3-C-TOSHIBA-CANDIDATE-READINESS.md
979D681F59209334749105A7F06B1798070A1E404524E5F5DD4BCFBDDDC7E10D — MATCH

Result: 8/8 MATCH
```

## 7. Full-read result

```text
Outputs\RSM-3-C-SUPPLY-CHAIN-BACKUP-RESTORE-BOUNDARY-CONTRACT.md|byte_length=20033|sha256=95A4B81A3A73DC31344A423D2C4158E024E28895EA08B0E1752F11886751781B|full_read=TRUE
Outputs\RSM-3-C-READINESS-REPORT.md|byte_length=7522|sha256=145BF7BF4DE5B73897DE99EE30FA2F28436F314444B92911A0BB78D35A4D2A98|full_read=TRUE
Outputs\RSM-3-C-EXTERNAL-DEVICE-INVENTORY.tsv|byte_length=1554|sha256=2FDA531A1ED625B5BEB014C2F933F3EB027141798368DE2EFE828A6FB7D820C6|full_read=TRUE
Outputs\RSM-3-C-RESPONSIBILITY-AND-VALIDATION-MATRIX.tsv|byte_length=8874|sha256=05C4397D1ACC09E526D1E849AD4D07AF84BD30C93EF14E9D9901C79DF62FE913|full_read=TRUE
Outputs\RSM-3-C-CODEX-INDEPENDENT-OWNER-ACTION-PACKAGE-REVIEW.md|byte_length=16492|sha256=8F91B8210FB03380AE63741DB40679126D4482CB73CED06AE4529CB1B73F2CAB|full_read=TRUE
Outputs\RSM-3-C-OWNER-POLICY-DECISION-LOCK-2026-08-06.md|byte_length=15238|sha256=52ACFEBDB588AECF852433FC4690235B430D0BBDCF6A45C2085F5B6E85F74EE0|full_read=TRUE
Outputs\RSM-3-C-TOSHIBA-CANDIDATE-OBSERVATION.tsv|byte_length=1488|sha256=9917CC9FC1DFAC16B8004B9F0143A4D6DDAAEC57037370DC27BA2E5C52116CEF|full_read=TRUE
Outputs\RSM-3-C-TOSHIBA-CANDIDATE-READINESS.md|byte_length=12625|sha256=979D681F59209334749105A7F06B1798070A1E404524E5F5DD4BCFBDDDC7E10D|full_read=TRUE
Prompts\RSM-3-C-14TB-EXTERNAL-CANDIDATE-READ-ONLY-OBSERVATION-PROMPT.md|byte_length=16100|sha256=758704103EF8873822F996A740784EDCBF38052E1A7A1EE508CD84E8B2328E6A|full_read=TRUE

Full-read count: 9/9 TRUE
```

## 8. Accepted internal baseline

Three disks are known internal and are ineligible for the external-backup role.

```text
Internal disk A:
  model=TOSHIBA THNSNJ256G8NU
  serial=556B309KK92X
  unique_id=500080CD0022D65C
  bus=SATA
  size=256060514304
  drive=D

Internal disk B:
  model=WDC WD10EZRX-00D8PB0
  serial=WD-WCC4M0RDUKP0
  unique_id=50014E2E611E0E27
  bus=SATA
  size=1000204886016
  drive=E

Internal disk C:
  model=KIOXIA-EXCERIA PRO G2 SSD
  serial=0000_0000_0000_0000_8CE3_8E05_0298_2FA0.
  unique_id=eui.00000000000000008CE38E0502982FA0
  bus=NVMe
  size=1024209543168
  drive=C
```

## 9. Previous Toshiba candidate disposition

The previous Toshiba candidate observation remains historical evidence. Its state is now recorded as:

```text
OBSERVED_PREVIOUS_CANDIDATE
NOT_SELECTED
NOT_LOCKED
SUPERSEDED_AS_CURRENT_INTENT_BEFORE_DEVICE_LOCK
```

The previous Toshiba device is not currently connected.

## 10. Complete physical-disk summary

Four disks observed:

| Disk | Model | Bus | Size (bytes) | Status |
|---|---|---|---|---|
| 0 | TOSHIBA THNSNJ256G8NU | SATA | 256060514304 | Healthy/Online |
| 1 | WDC WD10EZRX-00D8PB0 | SATA | 1000204886016 | Healthy/Online |
| 2 | KIOXIA-EXCERIA PRO G2 SSD | NVMe | 1024209543168 | Healthy/Online |
| 3 | Seagate Backup+ Hub BK SCSI Disk Device | USB | 14000519642624 | Healthy/Online |

## 11. Baseline subtraction result

After removing the three accepted internal disks:

- Disk 0 (TOSHIBA THNSNJ256G8NU) — subtracted (SYSTEM_INTERNAL)
- Disk 1 (WDC WD10EZRX-00D8PB0) — subtracted (LOCAL_INTERNAL_SECONDARY)
- Disk 2 (KIOXIA-EXCERIA PRO G2 SSD) — subtracted (SYSTEM_INTERNAL)

Remaining after subtraction: **1 disk (Disk 3)**

accepted internal identities remaining after subtraction=0
previous Toshiba identity current-candidate count=0

## 12. Remaining external-device count

```text
external candidate count=1
```

## 13. Candidate exact physical identity

```text
disk_number=3
friendly_name=Seagate Backup+ Hub BK
model=Seagate Backup+ Hub BK SCSI Disk Device
serial_number=NA9RMHEH
unique_id (Get-Disk)=5000000000000001
unique_id (Get-PhysicalDisk)=5000000000000001
pnp_device_id=SCSI\DISK&VEN_SEAGATE&PROD_BACKUP+_HUB_BK\A&2E0C92E1&0&000000
device_id=\\.\PHYSICALDRIVE3
bus_type=USB
interface_type=SCSI
media_type=External hard disk media
physical_size_bytes=14000519642624
partition_style=GPT
```

## 14. Candidate exact volume identity

```text
partition_number=2
partition_type=Basic
partition_size_bytes=14000383328256
drive_letter=F
volume_label=Caosvein-GARD
volume_unique_id=\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
volume_path=\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
volume_size_bytes=14000383324160
volume_free_bytes=13999847239680
```

## 15. Drive letter/mount result

```text
observed_drive_letter=F
mount_path=F:\
volume_path=\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
```

## 16. Filesystem result

```text
filesystem_type=NTFS
filesystem_label=Caosvein-GARD
```

## 17. Capacity interpretation

```text
physical_size_bytes=14000519642624
physical_size_decimal_tb=14.0005
physical_size_binary_tib=12.7334
```

The observed capacity supports the owner's matching hint of a portable device of approximately 14 TB.

## 18. Free-space and EXT-09 result

```text
volume_size_bytes=14000383324160
volume_free_bytes=13999847239680
free_space_percent=99.9961

meets_20_percent_rule=TRUE
next_complete_generation_estimate=NOT AVAILABLE BEFORE REPOSITORY AND BACKUP SCOPE EXIST
meets_next_generation_rule=NOT YET EVALUABLE
```

The current free space satisfies the 20-percent minimum threshold required by the EXT-09 policy. The final execution readiness rule for the next generation estimate remains pending.

## 19. Health/operational/read-only result

```text
disk_operational_status=Online
disk_health_status=Healthy
volume_operational_status=OK
volume_health_status=Healthy
is_read_only=False
is_offline=False
```

## 20. Encryption observation

```text
BitLocker cmdlet: access denied — not available in current execution context
WMI encryption namespace: access denied — not available in current execution context
encryption_status=NOT_AVAILABLE_ACCESS_DENIED
```

No recovery key, password, or secret material was exposed. No unlock, encrypt, or decrypt action was performed.

## 21. Identity completeness

```text
identity_completeness=COMPLETE
identity_eligibility_result=EXTERNAL_CANDIDATE
```

## 22. Backup execution readiness

```text
backup_execution_readiness=PENDING_NEXT_GENERATION_SIZE_AND_OWNER_CONFIRMATION
```

There are no current health or 20-percent free-space blockers.

## 23. EXT-01 candidate state

```text
EXT-01 physical device identity:
OBSERVED_CANDIDATE / OWNER_CONFIRMATION_REQUIRED
```

## 24. EXT-02 candidate state

```text
EXT-02 eligible volume identity:
OBSERVED_CANDIDATE / OWNER_CONFIRMATION_REQUIRED
```

## 25. EXT-03 candidate state

```text
EXT-03 mount path / drive letter:
OBSERVED_CANDIDATE / OWNER_CONFIRMATION_REQUIRED
```

## 26. EXT-04 proposed backup root

```text
EXT-04 future backup root:
PROPOSED_ONLY / OWNER_CONFIRMATION_REQUIRED

Proposed path (pending owner confirmation and RSM-3-D lock):
  F:\RSM-Offsite-Backup\retrostage-maker
```

The directory has not been created.

## 27. EXT-05 filesystem candidate

```text
EXT-05 filesystem acceptance:
observed_filesystem=NTFS
acceptance_state=OWNER_CONFIRMATION_REQUIRED
```

## 28. Owner confirmation packet

| decision_id | observed_candidate | owner_confirmation_required |
|---|---|---|
| EXT-01 | model=Seagate Backup+ Hub BK SCSI Disk Device; serial=NA9RMHEH; unique_id=5000000000000001; bus=USB; size=14000519642624 bytes | approve or reject |
| EXT-02 | partition=2; volume_id=\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\; label=Caosvein-GARD; size=14000383324160 bytes; filesystem=NTFS | approve or reject |
| EXT-03 | drive_letter=F; path=F:\; volume_path=\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\ | approve or reject |
| EXT-04 | proposed_root=F:\RSM-Offsite-Backup\retrostage-maker (not created) | approve or reject |
| EXT-05 | observed_filesystem=NTFS | approve or reject |

## 29. Mutation confirmation

No existing file was modified. No disk mutation was performed. Specifically:

```text
external_volume_write_count=0
external_directory_creation_count=0
F:\RSM-Offsite-Backup exists=False
no disk initialize, format, repair, encrypt, unlock, mount, unmount, or eject operation was performed
no drive letter, partition, label, or attribute was changed
no user files on the external volume were enumerated, read, moved, or deleted
```

## 30. Current gate state

```text
RSM-3-C:
not complete

RSM-3-D:
blocked

Repository:
not created

External backup:
not executed

Previous Toshiba candidate:
not selected
not locked

New approximately 14 TB candidate:
owner confirmation pending

owner-selected count=0
EXACT_AND_LOCKED device-decision count=0
```

## 31. Final decision

OWNER CONFIRMATION REQUIRED — 14TB-CLASS CANDIDATE OBSERVED