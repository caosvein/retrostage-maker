# RSM-3-I4-PRE2 — Privileged BitLocker and Capacity Evidence

**Task:** `RSM-3-I4-PRE2`  
**Observation time:** `2026-08-10T01:13:54.437+03:00` (`2026-08-09T22:13:54.434Z`)  
**Mode:** privileged read-only observation; fail-closed  
**Repository:** `C:\RetroStage\retrostage-maker`

## 1. Entry authority

All mandatory inputs were read as strict UTF-8 and matched their required SHA-256 values.

| Authority artifact | SHA-256 | Result |
|---|---|---|
| `Prompts\RSM-3-I4-PRE2-PRIVILEGED-BITLOCKER-AND-CAPACITY-CLOSURE-PROMPT.md` | `8820F32C1AB1E14960E3C1411737EAAEF0C05A6842C643D217FA3B40C77ECA4C` | PASS |
| `Outputs\RSM-3-I4-PRE1-REMOTE-AUTH-AND-TARGET-READINESS.md` | `5B670859CB9DA94917642CCEE38C95891B7453F035B04BDEFB45C131B518F1B9` | PASS |
| `Outputs\RSM-3-I4-PRE1-EXTERNAL-DEVICE-ENCRYPTION-CAPACITY-EVIDENCE.md` | `CB7F73716FC6F7330400A7D457CA20B619FB44088DAE134990148CCD3DAD98E6` | PASS |
| `Outputs\RSM-3-I4-PRE1-BACKUP-SCOPE-AND-GENERATION-SIZE.tsv` | `66AFF5A055F2A6BAFC93528BD57350EC00C3F5EF7C916DEA86C55AC3179116BA` | PASS |
| `Outputs\RSM-3-I4-PRE1-READINESS-REPORT.md` | `0E06BA39C9C692DC4EE3B21246466D26C5C9598219C345FD282CCD579B87F2B7` | PASS |
| `Outputs\RSM-3-I4-OWNER-BACKUP-ENCRYPTION-RESTORE-MECHANISM-AND-CAPACITY-LOCK.md` | `304A35DA062047A95802A18A1C028CE61874CA81B11B46969630485F3753B78A` | PASS |

The accepted PRE1 decision is exactly `BLOCKED — RSM-3-I4-PRE1 MATERIAL READINESS FAILURE`. PRE2 therefore performed only the separately authorized privileged observations and closure checks.

## 2. Administrator context

The current PowerShell execution context was checked through the read-only Windows principal-role API.

```text
Windows identity = DESKTOP-JBDVC2Q\caosv
Administrator role = TRUE
Integrity level = High (S-1-16-12288)
ADMINISTRATOR_CONTEXT = TRUE
```

## 3. Selected-device identity re-resolution

The locked Volume GUID was resolved physically before BitLocker observation. The drive letter is observational metadata only.

| Field | Observed value | Required value | Result |
|---|---|---|---|
| Volume GUID | `\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\` | same | PASS |
| Current drive letter | `F:` | observational only | INFO |
| Win32 model | `Seagate Backup+ Hub BK SCSI Disk Device` | same | PASS |
| Serial | `NA9RMHEH` | same | PASS |
| Unique ID | `5000000000000001` | same | PASS |
| Bus | `USB` | same | PASS |
| Filesystem | `NTFS` | same | PASS |

Additional physical observations:

```text
Disk number = 3
Physical device = \\.\PHYSICALDRIVE3
Partition number = 2
Disk partition style = GPT
Disk size = 14,000,519,642,624 bytes
Partition size = 14,000,383,328,256 bytes
Volume size = 14,000,383,324,160 bytes
Disk operational status = Online
Disk health = Healthy
Physical-disk operational status = OK
Volume operational/health state = OK / Healthy
Disk offline = FALSE
Disk read-only = FALSE
Selected volume accessible = TRUE
SELECTED_VOLUME_IDENTITY = PASS
```

## 4. Privileged BitLocker safe observation

The following three required read-only channels were run against the resolved `F:` mount:

```text
manage-bde -status F:
manage-bde -protectors -get F:
Get-BitLockerVolume -MountPoint F:
```

Only safe fields are recorded:

| Field | Observation |
|---|---|
| `manage-bde -status` | exit `0`; selected volume recognized |
| `manage-bde -protectors -get` | exit `-1`; no protector inventory returned |
| Conversion status / volume status | `FullyDecrypted` |
| Percentage encrypted | `0` |
| Encryption method | `None` |
| Protection status | `Off` |
| Lock status | `Unlocked` |
| BitLocker version | absent / not provisioned |
| Protector types | none |
| Protector IDs | none |
| Recovery Password protector present | `FALSE` |

```text
RECOVERY_PROTECTOR_PRESENT = FALSE
RECOVERY_SECRET_CAPTURED = FALSE
RECOVERY_SECRET_WRITTEN_TO_EVIDENCE = FALSE
SECRET_REDACTION_CONFIRMED = TRUE
```

No recovery password, key, protector secret, authentication token, or credential value was emitted or persisted. The captured `manage-bde -protectors` stream was never written to evidence and contained no recovery-password-shaped value.

## 5. Encryption-ready classification

| Required condition | Observed | Result |
|---|---|---|
| Conversion status = Fully Encrypted | `FullyDecrypted` | FAIL |
| Percentage encrypted = 100% | `0%` | FAIL |
| Protection status = Protection On | `Off` | FAIL |
| Encryption method = XTS-AES 128 or XTS-AES 256 | `None` | FAIL |
| Recovery Password protector = PRESENT | absent | FAIL |
| Volume accessible for intended backup operation | accessible | PASS |

```text
EXTERNAL_ENCRYPTION_READY = FALSE
BITLOCKER_CONFIGURATION_MUTATION_REQUIRED = TRUE
BITLOCKER_MUTATION_PERFORMED = FALSE
```

The required corrective action is outside this read-only task. No BitLocker command capable of mutation was run.

## 6. Recovery-material custody state

No accepted authority artifact contains an actual owner custody attestation. The exact sentence appears only as a future requirement in the PRE2 prompt and owner mechanism lock; the lock says the owner must affirm it before the first accepted external generation. It is not itself that affirmation.

```text
RECOVERY_MATERIAL_SEPARATE_STORAGE = OWNER_ATTESTATION_REQUIRED
RECOVERY_MATERIAL_STORED_SEPARATELY = NOT_PROVEN
```

No recovery secret was requested or inspected. Because no Recovery Password protector presently exists, separate-storage readiness cannot be satisfied by technical observation alone.

## 7. Governed generation and capacity recalculation

Every one of the 173 included rows in the PRE1 scope inventory was revalidated against its physical repository file. File-set, byte-length, and SHA-256 mismatches were all zero. The current tracked set remains 140 files and the physical `.git` metadata set remains 33 files.

```text
N = 173 governed files
G = 4,023,827 governed raw bytes
T = 14,000,383,324,160 selected-volume total bytes
F = 13,999,847,215,104 selected-volume free bytes

ceil(G × 1.25) = 5,029,784 bytes
G + 16,777,216 = 20,801,043 bytes
E = max(5,029,784, 20,801,043) = 20,801,043 bytes

F >= E = TRUE
projected free bytes = F - E = 13,999,826,414,061 bytes
20% minimum free bytes = ceil(T × 0.20) = 2,800,076,664,832 bytes
projected free >= 20% minimum = TRUE
margin above minimum = 11,199,749,749,229 bytes
projected free percentage = 99.996022180%
CAPACITY_GATE = PASS
POST_GENERATION_20_PERCENT_FREE_SPACE_GATE = PASS
```

## 8. Mechanism-lock application review

The accepted owner mechanism lock supplies exact current procedure authority for every required category:

| Procedure category | Authority state |
|---|---|
| Encryption readiness criteria | COMPLETE |
| Recovery-material handling | COMPLETE |
| Backup generation structure | COMPLETE |
| Governed scope | COMPLETE |
| SHA-256 manifest verification | COMPLETE |
| Capacity formula | COMPLETE |
| Retention/pruning | COMPLETE |
| Frequency | COMPLETE |
| Failure handling | COMPLETE |
| Restore-source selection | COMPLETE |
| Restore acceptance | COMPLETE |
| Safe eject | COMPLETE |
| I4 execution ordering | COMPLETE |

```text
MECHANISM_PROCEDURE_AUTHORITY = COMPLETE
```

## 9. Repository, remote, and target carry-forward

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
parent = 5c7ff6322ba2583176065a919db385d51b650fba
branch = main
commit count = 4
tracked file count = 140
working tree/index = CLEAN
origin = https://github.com/caosvein/retrostage-maker.git
remote refs = 0
upstream = ABSENT
push = FALSE
GitHub active login = caosvein
GitHub repository = caosvein/retrostage-maker
GitHub visibility = private
GitHub viewer permission = ADMIN
GitHub repository size = 0 KiB
GitHub workflow runs = 0
REPOSITORY_REMOTE_READINESS = PASS
```

The exact target paths remain absent and safe for a later separately authorized execution:

```text
D:\RSM-Backup\retrostage-maker = ABSENT / READY_ABSENT_SAFE_TARGET
D:\RSM-Validation\clean-clone = ABSENT / READY_ABSENT_SAFE_TARGET
D:\RSM-Restore-Test = ABSENT / READY_ABSENT_SAFE_TARGET
F:\RSM-Offsite-Backup\retrostage-maker = ABSENT / READY_ABSENT_SAFE_TARGET
D: filesystem = NTFS
D: free bytes = 192,432,906,240
TARGET_READINESS_CARRY_FORWARD = PASS
```

## 10. Mutation guards

```text
REPOSITORY_HEAD_MUTATION_COUNT = 0
REPOSITORY_COMMIT_COUNT_MUTATION_COUNT = 0
REPOSITORY_FILE_MUTATION_COUNT = 0
REMOTE_REF_MUTATION_COUNT = 0
PUSH_COUNT = 0
LOCAL_BACKUP_TARGET_MUTATION_COUNT = 0
CLEAN_CLONE_TARGET_MUTATION_COUNT = 0
RESTORE_TARGET_MUTATION_COUNT = 0
EXTERNAL_BACKUP_ROOT_MUTATION_COUNT = 0
EXTERNAL_VOLUME_DATA_MUTATION_COUNT = 0
BITLOCKER_MUTATION_COUNT = 0
SOURCE_07_CREATED = FALSE
UNAUTHORIZED_MUTATION_COUNT = 0
```

Only the two prompt-authorized PRE2 output files were created. No push, clone, backup, restore, install, commit, target write, external-volume data write, or BitLocker configuration change occurred. RSM-3-I4 was not started.

