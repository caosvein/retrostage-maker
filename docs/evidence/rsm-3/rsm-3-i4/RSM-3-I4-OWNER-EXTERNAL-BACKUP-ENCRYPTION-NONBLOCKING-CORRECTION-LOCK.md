# RetroStage Maker — RSM-3-I4 Owner External-Backup Encryption Non-Blocking Correction Lock

**Document ID:** `RSM-3-I4-OWNER-EXTERNAL-BACKUP-ENCRYPTION-NONBLOCKING-CORRECTION-LOCK`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Decision type:** `OWNER-AUTHORIZED SCOPE CORRECTION`  
**Date:** `2026-08-10`  
**Timezone:** `Europe/Istanbul`

## 1. Decision

For the current RSM-3 bootstrap milestone only:

`EXTERNAL_BACKUP_ENCRYPTION = DEFERRED_OPERATIONAL_HARDENING / NON_BLOCKING`

The selected Seagate volume may be used as an:

`ACCEPTED UNENCRYPTED OWNER-CONTROLLED SECONDARY BACKUP`

provided every integrity, identity, capacity, secret-scope, manifest, verification, restore, and safe-target gate remains satisfied.

BitLocker is not a product feature and is not required to close RSM-3.

---

## 2. Exact Selected External Device

The accepted device remains:

```text
Model = Seagate Backup+ Hub BK SCSI Disk Device
Serial = NA9RMHEH
Unique disk identity = 5000000000000001
Bus = USB
Physical size bytes = 14000519642624
Partition style = GPT
Filesystem = NTFS
Volume GUID = \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
Backup root relative path = RSM-Offsite-Backup\retrostage-maker
```

Drive letter is observational only.

No substitute device is authorized by this decision.

---

## 3. Superseded Blocking Requirement

The following earlier RSM-3-I4 readiness condition is superseded as a blocker:

```text
external volume must be BitLocker-encrypted before first accepted external generation
```

The following are therefore no longer required for RSM-3 closure:

```text
FullyEncrypted
100% encryption
Protection On
RecoveryPassword protector
owner recovery-material custody attestation
```

They remain optional future hardening.

---

## 4. BitLocker Mutation Status

PRE2 physically established:

```text
VolumeStatus = FullyDecrypted
EncryptionPercentage = 0
EncryptionMethod = None
ProtectionStatus = Off
ProtectorCount = 0
```

The owner subsequently exited the prepared BL1 procedure before entering the BitLocker unlock password.

The BL1 script sequence requests/validates the owner password before invoking `Enable-BitLocker`.

Therefore:

`BL1 AUTHORIZED MUTATION WAS NOT EXECUTED`

The previously created:

`RSM-3-I4-OWNER-BITLOCKER-FULL-VOLUME-ENCRYPTION-ADDENDUM.md`

is classified:

`SUPERSEDED / NOT EXECUTED / NOT REQUIRED FOR RSM-3`

Do not run the BL1 script as part of RSM-3.

---

## 5. Integrity Requirements Remain Mandatory

Deferring encryption does NOT weaken backup integrity.

Every accepted external generation must still satisfy:

```text
exact selected-device identity = PASS
repository source state = CLEAN / exact
secret-scope blocker count = 0
capacity gate = PASS
post-generation >=20% free-space gate = PASS
manifest path count = exact
manifest byte count = exact
destination missing files = 0
destination extra files = 0
destination size mismatch = 0
destination SHA-256 mismatch = 0
completion marker = valid / written last
restore source = complete verified generation only
```

The existing generation structure, SHA-256 verification, retention, failure handling, restore-source selection, restore acceptance, and capacity formula in:

`RSM-3-I4-OWNER-BACKUP-ENCRYPTION-RESTORE-MECHANISM-AND-CAPACITY-LOCK.md`

remain authoritative except for the superseded encryption/recovery gating sections.

---

## 6. Secret Boundary

An unencrypted external generation MUST NOT contain:

- passwords;
- GitHub tokens;
- credential-manager secrets;
- BitLocker recovery secrets;
- signing/private keys;
- Steam credentials;
- plaintext secret environment files;
- other identified secret-bearing local state.

If any secret-bearing candidate enters ordinary backup scope:

`BLOCKED — SECRET-BEARING FILE IN UNENCRYPTED BACKUP SCOPE`

Git-tracked repository truth may be backed up only if the repository secret scan remains clean.

---

## 7. Future Re-Activation of Encryption Requirement

Encryption should be reconsidered before the external backup is intentionally used to store materially confidential data outside the present public/source-governance scope, such as:

- signing/private keys;
- credentials;
- unreleased proprietary source/assets requiring at-rest confidentiality;
- other secrets.

That future hardening is outside RSM-3 and must not block current RetroStage Maker development.

---

## 8. I4 Readiness Effect

The PRE2 blockers are reclassified:

```text
BitLocker configuration required = SUPERSEDED AS RSM-3 BLOCKER
Recovery-material attestation required = SUPERSEDED AS RSM-3 BLOCKER
Mechanism/procedure authority = COMPLETE
Capacity gate = PASS
20% free-space gate = PASS
Repository baseline = PASS
GitHub auth/remote readiness = PASS
Selected Seagate identity = PASS
D: targets = SAFE
External backup root = SAFE
Secret-scope blockers = 0
```

Subject to an immediate pre-execution recheck, the next permitted control is:

`RSM-3-I4-EXEC1 — First Push / GitHub CI / Clean Clone / Verified Backup / Restore Observation`

No BitLocker mutation is required before that task.
