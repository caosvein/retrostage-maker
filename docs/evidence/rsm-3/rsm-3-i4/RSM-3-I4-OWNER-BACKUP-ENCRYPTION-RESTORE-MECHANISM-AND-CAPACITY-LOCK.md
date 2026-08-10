# RetroStage Maker — RSM-3-I4 Owner Backup / Encryption / Restore Mechanism and Capacity Lock

**Document ID:** `RSM-3-I4-OWNER-BACKUP-ENCRYPTION-RESTORE-MECHANISM-AND-CAPACITY-LOCK`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Decision type:** `OWNER-AUTHORIZED I4 CARRY-FORWARD RESOLUTION`  
**Date:** `2026-08-10`  
**Timezone:** `Europe/Istanbul`

This lock resolves the exact mechanism/procedure values that earlier accepted RSM-3-C policy left pending for I4 execution.

It does not reopen RSM-3-D and does not promote failed D FIX evidence.

---

## 1. Selected External Device

The only accepted external backup volume remains the locked Seagate identity:

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

The historical Toshiba candidate is not authorized as a substitute.

---

## 2. ENC-01 — Encryption Mechanism

Required mechanism:

`Microsoft BitLocker software encryption`

For an already encrypted selected volume, I4 may accept the existing state only if privileged observation proves:

```text
Conversion status = Fully Encrypted
Percentage encrypted = 100%
Protection status = Protection On
Lock/access state = compatible with intended backup operation
Encryption method = XTS-AES 128 or XTS-AES 256
Suitable Recovery Password protector = PRESENT
```

If a new encryption operation is required, the authorized target configuration is:

```text
Algorithm = XTS-AES 256
Encryption mode = Used Space Only
Recovery Password protector = REQUIRED
Automatic unlock = NOT REQUIRED / DO NOT ENABLE BY DEFAULT
```

No encryption mutation is authorized by this lock alone.

A later explicit mutation task is required if PRE2 proves the volume is not ready.

---

## 3. ENC-02 — Recovery Material Handling

The BitLocker recovery secret must never be written into:

- the RetroStage repository;
- `C:\RetroStage\bootstrap`;
- the selected Seagate backup volume;
- a normal plaintext file on the workstation;
- generated I4 evidence.

Evidence may record only:

- protector type;
- protector ID where safe;
- existence/non-existence;
- owner storage attestation state.

Before the first accepted external backup generation, the owner must affirm:

`RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE`

Meaning the recovery secret is retained in at least one secure location physically/logically separate from both:

1. the workstation; and
2. the selected Seagate disk.

Examples include a trusted password-manager/cloud vault or an offline physical record.

The exact secret must not be supplied to Codex/ChatGPT.

---

## 4. BAK-01 — Backup Generation Structure

External root:

`<LOCKED_VOLUME>\RSM-Offsite-Backup\retrostage-maker`

Generation directory:

`generations\<UTC_YYYYMMDDTHHMMSSZ>_<HEAD12>`

A generation contains:

```text
payload\
manifest.tsv
generation.json
COMPLETE.sha256
```

`COMPLETE.sha256` is written last, only after copy and verification succeed.

A generation without a valid final completion marker is:

`INCOMPLETE / NOT RESTORE-ELIGIBLE`

Never overwrite an existing completed generation directory.

---

## 5. BAK-02 — Governed Backup Scope

Each accepted generation preserves current repository truth needed for restoration:

Included:

```text
all Git-tracked worktree files
.git repository metadata required to preserve local Git history/state
```

Excluded when not Git-tracked:

```text
node_modules
dist
coverage
tool caches
logs
temporary files
credential stores
secret-bearing environment/config files
other regenerable ephemeral state
```

A Git-tracked file is governed repository truth even if generated.

Any secret-bearing file detected inside the proposed ordinary generation is blocking.

---

## 6. BAK-03 — Manifest and Verification

`manifest.tsv` must deterministically contain every governed payload file exactly once with at least:

```text
normalized relative path
size_bytes
SHA-256
```

`generation.json` must record at least:

```text
generation ID
source repository path
source HEAD
source branch
commit count
governed file count
governed raw bytes
manifest SHA-256
creation UTC timestamp
selected volume stable identity
backup mechanism version
```

After copy:

1. enumerate destination payload;
2. recompute destination count, byte total and per-file SHA-256;
3. compare to the source manifest;
4. require missing = 0;
5. require extra = 0;
6. require size mismatch = 0;
7. require hash mismatch = 0;
8. only then write `COMPLETE.sha256`.

A failed verification may not delete or weaken an earlier complete generation.

---

## 7. BAK-04 — Exact Capacity Formula

Let:

```text
G = current governed raw generation bytes
N = current governed file count
T = selected volume total bytes
F = selected volume free bytes before generation
```

Accepted deterministic complete-generation capacity envelope:

```text
E = max(ceil(G * 1.25), G + 16 MiB)
```

where:

`16 MiB = 16,777,216 bytes`

The fixed envelope covers manifest, generation metadata, completion marker and small filesystem/copy overhead for the current bootstrap repository; the 25% branch scales with larger generations.

A generation passes capacity only if BOTH are true before copy:

```text
F >= E
F - E >= ceil(T * 0.20)
```

Thus the volume must still retain at least 20% free space after the projected complete-generation envelope.

For the PRE1 observed state:

```text
G = 4,023,827 bytes
N = 173
E = 20,801,043 bytes
T = 14,000,383,324,160 bytes
F = 13,999,847,215,104 bytes
Projected free after E = 13,999,826,414,061 bytes
20% minimum free = 2,800,076,664,832 bytes
Projected remaining margin above 20% = 11,199,749,749,229 bytes
Projected free percentage after E ~= 99.996022%
```

Therefore PRE1 capacity is materially sufficient once encryption/readiness gates pass.

The capacity formula must be recomputed from fresh physical values immediately before each accepted generation.

---

## 8. BAK-05 — Retention and Pruning

Accepted policy remains:

`8 recent complete generations + 6 monthly anchors`

Definitions:

- recent generation = complete, verified generation;
- monthly anchor = newest complete verified generation in a distinct UTC calendar month.

Retention sets may overlap.

Pruning is permitted only after a new generation is complete and verified.

Pruning must preserve:

```text
the 8 newest complete generations
the newest complete generation for each of the 6 newest represented UTC calendar months
```

Never prune:

- an incomplete generation to create the illusion of success;
- the only known good restore source;
- prior complete generations before the new generation verifies.

First I4 generation requires no pruning when the root is absent.

---

## 9. BAK-06 — Frequency

Accepted frequency:

```text
weekly
plus immediately after accepted milestone closure / materially important repository milestone
```

This is an operational policy; it does not authorize autonomous background execution.

---

## 10. BAK-07 — Failure Handling

Any failure in:

- identity;
- encryption readiness;
- capacity;
- source cleanliness;
- copy;
- manifest;
- hash verification;
- completion marker;
- safe-eject readiness;

must fail closed.

No partial generation becomes accepted.

Do not delete prior complete generations to recover from a failed new backup unless a separately reviewed storage-emergency decision authorizes it.

---

## 11. RST-01 — Restore Source Selection

Restore source priority:

1. newest complete verified generation compatible with the required repository state;
2. if that generation fails verification or compatibility, next newest complete verified generation;
3. continue backward without modifying the source generation.

An incomplete generation is never restore-eligible.

Restore proof must use an isolated target, initially:

`D:\RSM-Restore-Test`

The canonical repository must not be overwritten during validation.

---

## 12. RST-02 — Restore Acceptance

A restored generation is accepted only if:

```text
manifest verification = PASS
Git repository opens = PASS
expected HEAD/history identity = PASS
working tree integrity = PASS
pnpm frozen install = PASS
required validation = PASS
required build = PASS
compliance check = PASS
```

Exact commands must be captured from physical I4 execution and later become source 07 authority.

---

## 13. SAFE-01 — Safe Eject

After external backup verification:

- no copy/verification process may remain active;
- no open handle known to the I4 procedure may remain;
- completed generation evidence must already be persisted;
- use Windows supported safe-removal/eject behavior;
- wait for OS confirmation before physical disconnect.

Do not physically unplug the selected volume while write/verification activity is in progress.

The exact observed safe-eject command/UI path used in I4 must be captured in source 07.

---

## 14. GH-01 — Remote and CI Ordering

The first I4 execution should preserve the following controlled order:

```text
pre-execution baseline recheck
first push of main
remote HEAD/ref verification
natural GitHub-hosted CI observation
local backup / clean clone preparation
clean clone from remote
clean-clone frozen install
clean-clone validation/build/compliance
external accepted generation
isolated restore proof
source 07 derivation from observed commands
```

If remote push or CI fails, do not continue and pretend later gates are accepted.

---

## 15. Decision Boundary

This lock resolves:

```text
PRE1-B02 — terminal mechanism/procedure authority
PRE1-B03 — exact next-generation capacity formula
```

It does NOT itself resolve:

`PRE1-B01 — privileged physical BitLocker readiness observation`

The next task must perform privileged read-only observation only.

If that observation shows encryption is not ready, a separate owner-authorized BitLocker mutation task is required before the first accepted external generation.
