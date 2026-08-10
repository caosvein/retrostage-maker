# RSM-3-I4-EXEC1-RETRY1 — Local and External Backup Evidence

**Task:** RSM-3-I4-EXEC1-RETRY1  
**Mode:** fail-closed partial evidence / no backup write

## Backup preflight

The selected device and initial backup gates passed before Phase A:

| Field | Observation | Result |
|---|---|---|
| Volume GUID | \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\ | PASS |
| Current drive | F: | observational |
| Model | Seagate Backup+ Hub BK SCSI Disk Device | PASS |
| Serial | NA9RMHEH | PASS |
| UniqueId | 5000000000000001 | PASS |
| Bus | USB | PASS |
| Filesystem | NTFS | PASS |
| Health | Healthy | PASS |

    EXTERNAL_BACKUP_ENCRYPTION = DEFERRED_OPERATIONAL_HARDENING / NON_BLOCKING
    BL1 executed = FALSE
    BitLocker mutation count = 0

Initial exact scope and capacity:

    N = 173 governed files
    G = 4,023,827 governed bytes
    Physical baseline mismatch count = 0
    Secret-scope blocker count = 0
    T = 14,000,383,324,160 bytes
    F = 13,999,847,215,104 bytes
    E = 20,801,043 bytes
    Projected free = 13,999,826,414,061 bytes
    20% minimum free = 2,800,076,664,832 bytes
    Margin above minimum = 11,199,749,749,229 bytes
    Capacity gate = PASS
    Post-generation 20% gate = PASS

## Phase E and Phase F status

Phase D failed before either backup phase became eligible.

    D:\RSM-Backup\retrostage-maker = ABSENT BEFORE / ABSENT AFTER
    F:\RSM-Offsite-Backup\retrostage-maker = ABSENT BEFORE / ABSENT AFTER
    Local repository backup created = FALSE
    External generation ID = NONE
    External payload created = FALSE
    manifest.tsv created = FALSE
    generation.json created = FALSE
    COMPLETE.sha256 created = FALSE
    Local backup target mutation count = 0
    External backup-root mutation count = 0
    External volume data mutation count = 0

No local backup, external generation, manifest verification, completion marker, retention action, or safe-eject completion is claimed.

