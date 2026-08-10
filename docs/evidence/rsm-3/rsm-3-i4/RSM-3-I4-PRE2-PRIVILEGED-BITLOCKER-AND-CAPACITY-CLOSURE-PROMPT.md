# RetroStage Maker — RSM-3-I4-PRE2 Privileged Read-Only BitLocker and Capacity Closure

**Document ID:** `RSM-3-I4-PRE2-PRIVILEGED-BITLOCKER-AND-CAPACITY-CLOSURE-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Task:** `RSM-3-I4-PRE2 — Privileged Read-Only BitLocker and Capacity Closure`  
**Primary executor:** `Codex`  
**Required shell privilege:** `Administrator`  
**Mode:** `PRIVILEGED READ-ONLY OBSERVATION / NO BITLOCKER MUTATION / NO I4 EXECUTION`

IMPORTANT:

Run this task from an Administrator-elevated Codex/PowerShell environment.

If the current shell is not elevated, STOP immediately with:

`BLOCKED — RSM-3-I4-PRE2 ADMINISTRATOR OBSERVATION REQUIRED`

Do not attempt to bypass UAC or silently elevate a hidden mutation process.

---

# 1. Mandatory Authority

Fully read and verify:

- `RSM-3-I4-PRE1-REMOTE-AUTH-AND-TARGET-READINESS.md`
- `RSM-3-I4-PRE1-EXTERNAL-DEVICE-ENCRYPTION-CAPACITY-EVIDENCE.md`
- `RSM-3-I4-PRE1-BACKUP-SCOPE-AND-GENERATION-SIZE.tsv`
- `RSM-3-I4-PRE1-READINESS-REPORT.md`
- `RSM-3-I4-OWNER-BACKUP-ENCRYPTION-RESTORE-MECHANISM-AND-CAPACITY-LOCK.md`

Required PRE1 identities:

```text
REMOTE-AUTH-AND-TARGET-READINESS =
5B670859CB9DA94917642CCEE38C95891B7453F035B04BDEFB45C131B518F1B9

EXTERNAL-DEVICE-ENCRYPTION-CAPACITY-EVIDENCE =
CB7F73716FC6F7330400A7D457CA20B619FB44088DAE134990148CCD3DAD98E6

BACKUP-SCOPE-AND-GENERATION-SIZE =
66AFF5A055F2A6BAFC93528BD57350EC00C3F5EF7C916DEA86C55AC3179116BA

PRE1-READINESS-REPORT =
0E06BA39C9C692DC4EE3B21246466D26C5C9598219C345FD282CCD579B87F2B7
```

Required PRE1 decision:

`BLOCKED — RSM-3-I4-PRE1 MATERIAL READINESS FAILURE`

The owner mechanism lock must be exact and physically present. Required SHA-256:\n\n`304A35DA062047A95802A18A1C028CE61874CA81B11B46969630485F3753B78A`

---

# 2. No Mutation Rule

This task MUST NOT:

- enable BitLocker;
- disable BitLocker;
- add/delete/change protectors;
- unlock or lock the volume;
- enable auto-unlock;
- pause/resume encryption;
- wipe free space;
- write recovery secrets;
- push;
- clone;
- backup;
- restore;
- create source 07;
- change repository files or targets.

Only privileged read-only observation and evidence creation are authorized.

---

# 3. Administrator Check

Prove the current PowerShell process has Administrator rights using a read-only Windows principal-role check.

Required:

`ADMINISTRATOR_CONTEXT = TRUE`

If false:

STOP.

---

# 4. Re-resolve Exact Selected Volume

Re-resolve the locked stable identity.

Required exact Volume GUID:

`\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\`

Required stable device identity:

```text
Model = Seagate Backup+ Hub BK SCSI Disk Device
Serial = NA9RMHEH
Unique ID = 5000000000000001
Bus = USB
Filesystem = NTFS
```

Record current drive letter only as observational metadata.

If stable identity mismatches:

STOP:

`BLOCKED — RSM-3-I4-PRE2 SELECTED VOLUME IDENTITY FAILURE`

---

# 5. Privileged BitLocker Observation

Against the currently resolved selected volume run:

```powershell
manage-bde -status <CURRENT_DRIVE>:
manage-bde -protectors -get <CURRENT_DRIVE>:
Get-BitLockerVolume -MountPoint <CURRENT_DRIVE>:
```

Do not run any mutating BitLocker command.

Evidence must record only safe fields:

```text
Conversion status
Percentage encrypted
Encryption method
Protection status
Lock status
BitLocker version
protector types
protector IDs where safe
Recovery Password protector present TRUE/FALSE
```

REDACT any recovery password, key, or secret if printed.

Never write a recovery secret to an output file.

---

# 6. Encryption-Ready Classification

Use the owner mechanism lock exactly.

`EXTERNAL_ENCRYPTION_READY = TRUE` only if:

```text
Conversion status = Fully Encrypted
Percentage encrypted = 100%
Protection status = Protection On
Encryption method = XTS-AES 128 or XTS-AES 256
Recovery Password protector = PRESENT
volume is accessible for intended backup operation
```

If any condition fails:

`EXTERNAL_ENCRYPTION_READY = FALSE`

Do not modify the volume.

Record the exact failing field(s).

---

# 7. Recovery Material Storage State

Do not request or expose the recovery secret.

If a Recovery Password protector exists, record:

`RECOVERY_PROTECTOR_PRESENT = TRUE`

The separate-storage fact is a human-owner custody fact.

PRE2 may classify full execution readiness only if an explicit owner attestation already exists in accepted authority stating:

`RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE`

If no such exact attestation exists:

record:

`RECOVERY_MATERIAL_SEPARATE_STORAGE = OWNER_ATTESTATION_REQUIRED`

This must remain the only remaining human action; do not fabricate it.

---

# 8. Capacity Recalculation

Refresh current physical:

```text
G = governed raw bytes
N = governed file count
T = selected volume total bytes
F = selected volume free bytes
```

If repository is unchanged from PRE1, G/N may be revalidated against the PRE1 inventory.

Apply exactly:

`E = max(ceil(G * 1.25), G + 16,777,216)`

Require:

```text
F >= E
F - E >= ceil(T * 0.20)
```

Record:

```text
E
projected free bytes
20% minimum free bytes
margin above minimum
projected free percentage
```

If capacity fails:

STOP:

`BLOCKED — RSM-3-I4-PRE2 CAPACITY FAILURE`

---

# 9. Mechanism-Lock Application Review

Confirm the owner lock now supplies exact current procedure authority for:

```text
encryption readiness criteria
recovery-material handling
backup generation structure
governed scope
SHA-256 manifest verification
capacity formula
retention/pruning
frequency
failure handling
restore-source selection
restore acceptance
safe eject
I4 execution ordering
```

Required:

`MECHANISM_PROCEDURE_AUTHORITY = COMPLETE`

Do not search failed D FIX artifacts for missing values.

---

# 10. Repository and Remote Recheck

Read-only require repository still:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
commit count = 4
working tree/index = CLEAN
remote refs = 0
upstream = ABSENT
push = FALSE
```

Remote GitHub auth/private-empty/ADMIN readiness must remain materially unchanged.

No remote mutation.

---

# 11. Mutation Guard

Before and after:

```text
repository mutation = 0
remote mutation = 0
D target mutation = 0
external volume data mutation = 0
BitLocker mutation = 0
source 07 creation = FALSE
```

Only the two PRE2 output files may be created under bootstrap Outputs.

---

# 12. Required Outputs

Create exactly TWO new files:

## Output 1

`RSM-3-I4-PRE2-PRIVILEGED-BITLOCKER-AND-CAPACITY-EVIDENCE.md`

Record:

- admin context;
- exact selected-device identity;
- privileged BitLocker safe observations;
- secret-redaction confirmation;
- encryption-ready classification;
- Recovery Password protector presence;
- recovery-material separate-storage authority/attestation state;
- fresh capacity formula calculation;
- mechanism-lock application status;
- mutation guards.

## Output 2

`RSM-3-I4-PRE2-READINESS-REPORT.md`

Summarize:

```text
repository/remote readiness
device identity
administrator observation
encryption readiness
recovery protector
recovery-material storage attestation
mechanism/procedure authority
generation-capacity gate
20% post-generation free-space gate
target readiness carry-forward
secret-scope blocker
unauthorized mutation count
```

---

# 13. Final Decision

End with exactly one:

`READY FOR OWNER-AUTHORIZED RSM-3-I4 EXECUTION`

or

`BLOCKED — RSM-3-I4-PRE2 MATERIAL READINESS FAILURE`

READY requires:

```text
EXTERNAL_ENCRYPTION_READY = TRUE
RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE
MECHANISM_PROCEDURE_AUTHORITY = COMPLETE
CAPACITY_GATE = PASS
repository/remote/targets remain ready
unauthorized mutation count = 0
```

If BitLocker is not ready, STOP and report exactly:

`BITLOCKER_CONFIGURATION_MUTATION_REQUIRED = TRUE`

Do not perform that mutation.

If only recovery-material owner attestation is missing, state that explicitly and do not invent another technical blocker.

---

# 14. Success Condition

PRE2 closes the PRE1 readiness blockers only through privileged observation plus the accepted owner mechanism lock.

It does not execute I4.

A later separate owner-authorized I4 execution prompt may perform first push, CI observation, clean clone, accepted backup, restore proof, and source 07 derivation only after PRE2 reaches READY.
