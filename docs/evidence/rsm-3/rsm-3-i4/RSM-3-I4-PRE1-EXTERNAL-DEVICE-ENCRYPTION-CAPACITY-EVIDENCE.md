# RSM-3-I4-PRE1 — External Device, Encryption, and Capacity Evidence

**Task:** `RSM-3-I4-PRE1`  
**Mode:** `READ-ONLY PHYSICAL PREFLIGHT / NO DISK OR BITLOCKER MUTATION`  
**Observation time:** `2026-08-10T00:49:43.2343412+03:00`  

## 1. Accepted device authority

Binding device lock:

`Outputs\RSM-3-C-EXTERNAL-DEVICE-IDENTITY-DECISION-LOCK-2026-08-06.md`

SHA-256:

`0C8FC35317CE3D5C7298739ABF1673E6DD28CBF6D3CFF296F5CDBF6E6B907FB6`

Binding owner-policy lock:

`Outputs\RSM-3-C-OWNER-POLICY-DECISION-LOCK-2026-08-06.md`

SHA-256:

`52ACFEBDB588AECF852433FC4690235B430D0BBDCF6A45C2085F5B6E85F74EE0`

The accepted current selection remains exactly one device: `Seagate Backup+ Hub BK`. The earlier Toshiba evidence remains historical, not selected, and not locked.

## 2. Current physical device observation

| Stable field | Accepted | Current physical observation | Result |
|---|---|---|---|
| Friendly/model family | `Seagate Backup+ Hub BK` | `Seagate Backup+ Hub BK` | MATCH |
| Model | `Seagate Backup+ Hub BK SCSI Disk Device` | `Seagate Backup+ Hub BK SCSI Disk Device` | MATCH |
| Serial number | `NA9RMHEH` | `NA9RMHEH` | MATCH |
| Disk unique ID | `5000000000000001` | `5000000000000001` | MATCH |
| Physical-disk unique ID | `5000000000000001` | `5000000000000001` | MATCH |
| PNP device ID | `SCSI\DISK&VEN_SEAGATE&PROD_BACKUP+_HUB_BK\A&2E0C92E1&0&000000` | exact same | MATCH |
| Bus | `USB` | `USB` | MATCH |
| Get-Disk physical size bytes | `14000519642624` | `14000519642624` | MATCH |
| Partition style | `GPT` | `GPT` | MATCH |

Current observation-time values:

```text
SELECTED_EXTERNAL_DEVICE = CONNECTED
Disk number = 3
Device path = \\.\PHYSICALDRIVE3
Interface type = SCSI
Media type = External hard disk media
Disk operational status = Online
Disk health status = Healthy
Is boot = FALSE
Is system = FALSE
Is offline = FALSE
Is read-only = FALSE
```

`Win32_DiskDrive.Size` projected `14000512296960` bytes, while the accepted physical-size authority is the `Get-Disk.Size` field; the current `Get-Disk.Size` matches the lock exactly. The provider projection is recorded as a non-authoritative observation, not silently substituted for the locked field.

Result: `SELECTED_DEVICE_STABLE_IDENTITY = EXACT_MATCH`.

## 3. Volume GUID re-resolution

```text
Accepted partition number = 2
Current partition number = 2
Accepted partition type = Basic
Current partition type = Basic
Accepted Volume GUID = \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
Current Volume GUID = \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
Current drive letter = F
Current mount path = F:\
Volume label = Caosvein-GARD
Accepted filesystem = NTFS
Current filesystem = NTFS
Partition size bytes = 14000383328256
Volume size bytes = 14000383324160
Volume free bytes = 13999847215104
Free-space percentage = 99.996171
Volume operational status = OK
Volume health status = Healthy
```

The Volume GUID, rather than historical drive letter `F:`, was used as primary authority. It currently resolves to `F:` and all locked volume identity fields match.

Result: `SELECTED_VOLUME_IDENTITY = EXACT_MATCH`.

## 4. BitLocker read-only evidence

The following official read-only queries were run against current mount `F:`:

```text
manage-bde -status F:
exit = -2147217405
result = ACCESS DENIED / administrative rights required

manage-bde -protectors -get F:
exit = -2147217405
result = ACCESS DENIED / administrative rights required

Get-BitLockerVolume -MountPoint F:
result = ACCESS DENIED
```

No elevation, configuration change, unlock, lock, protector change, or encryption operation was attempted. No recovery password, key, token, or other secret was captured.

Because status observation was denied, the following remain unproven:

```text
Conversion status = UNVERIFIED
Percentage encrypted = UNVERIFIED
Encryption method = UNVERIFIED
Protection status = UNVERIFIED
Lock status = UNVERIFIED
Key-protector types = UNVERIFIED
Key-protector IDs = UNVERIFIED
Suitable recovery protector exists = UNVERIFIED
Recovery material stored separately from disk/workstation = UNVERIFIED
```

Fail-closed classification:

`EXTERNAL_ENCRYPTION_READY = UNVERIFIED_PRIVILEGE_REQUIRED`

This is not equivalent to encrypted, protected, or ready.

## 5. Current terminal procedure-authority reconciliation

The accepted/current C and D chain was searched physically. No filename or content established a separately accepted terminal D mechanism/procedure lock. The accepted artifacts instead preserve the pending requirement:

| Control | Current accepted authority | Section/decision | Artifact SHA-256 | Exact current state |
|---|---|---|---|---|
| Encryption mechanism and recovery-material handling | `RSM-3-C-OWNER-POLICY-DECISION-LOCK-2026-08-06.md` | EXT-06 / §8 | `52ACFEBDB588AECF852433FC4690235B430D0BBDCF6A45C2085F5B6E85F74EE0` | Policy locked; implementation detail `BOUNDARY_DEFINED_EXACT_VALUE_PENDING_RSM_3_D` |
| Retention | same | EXT-07 / §8 | same | 8 weekly + 6 monthly policy locked; D mechanism pending |
| Rotation/pruning | same | EXT-08 / §8 | same | verify new generation first; preserve policy minima; D mechanism pending |
| Free-space/generation estimate | same | EXT-09 / §8 | same | 20% plus enough bytes policy locked; exact estimation command/procedure pending D |
| Manifest/verification | same | EXT-10 / §8 | same | complete SHA-256 manifest + count + bytes policy locked; exact D schema/procedure absent |
| Safe eject | same | EXT-11 / §8 | same | safe-eject policy locked; exact procedure pending D |
| Backup frequency | same | EXT-14 / §8 | same | weekly + post-milestone policy locked; exact D procedure pending |
| Failure handling | same | EXT-15 / §8 | same | fail-closed policy locked; exact D procedure pending |
| Restore-source selection | same | EXT-16 / §8 | same | newest complete verified compatible generation/fallback policy locked; exact D procedure pending |

The forensic authority finding remains explicit in:

- `RSM-3-D-CODEX-RECOVERY-AUDIT-1.md`, §13 MB-04 and §20, SHA-256 `6DE3C460FF6170647F89473DB3B351CCDB447891F816C347EAC7F6784564D7D2`: exact mechanism/procedure package absent and D details pending.
- `RSM-3-D-TERM1-OWNER-SOURCE-GOVERNANCE-EXCEPTION-AND-DECISION-LOCK.md`, SHA-256 `5DDC4344AEB2F34C15BC1279290E50F9565239AD2DFDFC4FD7814CA3B8B04BB7`: TERM1 locks source-governance, frozen-map identity, authority cutoff, and correction-history exclusion; it does not lock external-backup procedures.
- `RSM-3-D-TERM1-CURRENT-AUTHORITY-CUTOFF.tsv`, SHA-256 `B34CA0371D75AC05CCFAB2CC1A0BFF4C90D5EC4876BF68ED263FE0705D5B5E9E`: no terminal external-backup procedure artifact is included.
- `RSM-3-D-TERM1-CHATGPT-INDEPENDENT-TERMINAL-REVIEW.md`, SHA-256 `FDD5D8F76B8A515C638BDE5B4C8B7C1F76F731E47C13E30D7D9E3C2CD25213E6`: accepts the TERM1 source-governance package but does not add a mechanism/procedure lock.

Result for every required procedure item:

`NO CURRENT ACCEPTED TERMINAL PROCEDURE ARTIFACT LOCATED`

## 6. Governed generation-size observation

The deterministic inventory is recorded in `RSM-3-I4-PRE1-BACKUP-SCOPE-AND-GENERATION-SIZE.tsv`.

```text
Canonical repository root = C:\RetroStage\retrostage-maker
Git metadata file count = 33
Git metadata bytes = 931214
Tracked worktree file count = 140
Tracked worktree bytes = 3092613
Governed file count = 173
Raw governed file bytes = 4023827
Excluded ephemeral file count = 8121
Excluded ephemeral bytes = 96600058
Secret-bearing candidate count = 0
Untracked local other count = 0
Tracked physical missing count = 0
Inventory TSV SHA-256 = 66AFF5A055F2A6BAFC93528BD57350EC00C3F5EF7C916DEA86C55AC3179116BA
```

Excluded ephemeral aggregates:

| Root | Physical file/link count | Bytes | Reason |
|---|---:|---:|---|
| `dist/**` | 1 | 2562 | regenerable build output |
| `node_modules/**` | 8120 | 96597496 | regenerable installed dependency state |

No Git-tracked file was excluded merely because it is generated.

## 7. Capacity checks

Locked policy input and current arithmetic:

```text
Volume total bytes = 14000383324160
Volume free bytes = 13999847215104
Current free percentage = 99.996171
Locked minimum free percentage = 20
Locked 20% minimum bytes = 2800076664832
Free bytes above 20% minimum = 11199770550272
20% free-space check = PASS

Raw governed generation bytes = 4023827
Free bytes >= raw governed generation bytes = TRUE
Free bytes after raw bytes only = 13999843191277
Raw-byte capacity observation = PASS
```

No accepted exact overhead, staging, manifest-size, generation-envelope, or safety-margin formula was located. PRE1 therefore does not invent one.

```text
GENERATION_SIZE_PROCEDURE_AUTHORITY = UNRESOLVED
NEXT_COMPLETE_ACCEPTED_GENERATION_ESTIMATE = NOT FULLY EVALUABLE
NEXT_GENERATION_CAPACITY_CHECK = PASS_RAW_BYTES_ONLY / FAIL_CLOSED_FOR_FULL_ACCEPTED_GENERATION
```

## 8. External root and mutation guard

```text
Resolved external root = F:\RSM-Offsite-Backup\retrostage-maker
Root exists = FALSE
Existing accepted-generation structure = NONE
Overwrite required = FALSE
Root path readiness = READY_ABSENT_SAFE_TARGET

External volume write count = 0
External backup-root mutation count = 0
BitLocker mutation count = 0
```

## 9. Device readiness result

The selected device and volume identity pass, health passes, the current 20% gate passes, and raw governed bytes fit. Full external-backup readiness does not pass because encryption/protector state is unverified, separate recovery-material handling is unproven, the terminal procedure artifact is absent, and the exact next-complete-generation procedure is unresolved.

`EXTERNAL_DEVICE_EXECUTION_READINESS = BLOCKED_FAIL_CLOSED`
