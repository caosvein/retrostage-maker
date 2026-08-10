# RetroStage Maker — RSM-3-I4-PRE1 Remote / Backup / Clone / Encryption Readiness Preflight

**Document ID:** `RSM-3-I4-PRE1-REMOTE-BACKUP-CLONE-ENCRYPTION-READINESS-PREFLIGHT-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Task:** `RSM-3-I4-PRE1 — Remote / Backup / Clone / Encryption Readiness Preflight`  
**Primary executor:** `Codex`  
**Authoritative shell:** `Windows PowerShell 5.1`  
**Mode:** `READ-ONLY PHYSICAL PREFLIGHT / NO REPOSITORY OR TARGET MUTATION`

This task is deliberately read-only.

It reconciles the newly activated I4 state with the accepted external-backup carry-forward controls before any irreversible or remotely visible I4 execution.

It does NOT:

- push;
- create an upstream;
- create a remote branch;
- create or overwrite a backup;
- create or delete a clone;
- create or delete a restore target;
- enable, disable, pause, resume, unlock, lock, or otherwise change BitLocker;
- write to the selected external disk;
- create source 07;
- mutate repository files.

---

# 1. Entry Authority

Before any physical observation, fully read and verify:

## Current I4 activation

- `RSM-3-I3-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`
- `RSM-3-I3-ALIGN1-I4-ACTIVATION-REPORT.md`
- current `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- current `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

Required activation report SHA-256:

`01C03720F0088CE132D7CADE5BD5E8CBD6C671115312C439235C53DA51E826D2`

Required authority-delta-lock SHA-256:

`3A0292980EA7795FD0D015505CB23E9BFAFCF5C80647664EBD7CB756E4884BDF`

Required current live-source SHA-256 values:

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
0645B54723D21A72694EC7DF28552B8B5669B708B72C30BA248E9E3EF244BFCD

08_RSM_REBOOT_CURRENT_MILESTONE.md
800B3914A1E578A4A0AD69B79B6EB263C02820D1B84418DA8306243960A22BB7
```

Required current decision:

`RSM-3-I4 AUTHORIZED / READY FOR EXECUTION`

## Accepted external-backup authority

Fully read the accepted current RSM-3-C authority, including:

- `RSM-3-C-SUPPLY-CHAIN-BACKUP-RESTORE-BOUNDARY-CONTRACT.md`
- `RSM-3-C-OWNER-POLICY-DECISION-LOCK-2026-08-06.md`
- `RSM-3-C-EXTERNAL-DEVICE-IDENTITY-DECISION-LOCK-2026-08-06.md`
- corrected final RSM-3-C closure/handoff and accepted independent re-review

Also read the accepted D recovery/terminal authority needed to determine the disposition of:

- `CARRY-01 — Encryption readiness`
- `CARRY-02 — Next complete generation estimate`
- external-backup mechanism/procedure details

At minimum read:

- `RSM-3-D-CODEX-RECOVERY-AUDIT-1.md`
- `RSM-3-D-TERM1-OWNER-SOURCE-GOVERNANCE-EXCEPTION-AND-DECISION-LOCK.md`
- `RSM-3-D-TERM1-CURRENT-AUTHORITY-CUTOFF.tsv`
- `RSM-3-D-TERM1-I1-CANDIDATE-READINESS-REPORT.md`
- `RSM-3-D-TERM1-CHATGPT-INDEPENDENT-TERMINAL-REVIEW.md`

Do not promote Original/FIX1–FIX15 evidence to current authority.

If current authority cannot be reconciled:

STOP:

`BLOCKED — RSM-3-I4-PRE1 AUTHORITY RECONCILIATION FAILURE`

---

# 2. Important Carry-Forward Interpretation

I4 activation means the I4 slice may now perform its own bounded readiness work.

It does NOT waive the accepted first-external-backup prerequisites.

The accepted policy requires:

```text
external backup volume encrypted before first accepted external backup generation
recovery material stored separately from the external disk
recovery material stored separately from the workstation
minimum free-space policy satisfied
next complete generation size evaluated
complete verification manifest used
restore source/target boundaries respected
```

PRE1 must determine the current physical truth.

Do not assume encryption readiness from an old drive letter or an old failed BitLocker query.

Do not assume that terminal D acceptance means the external volume is physically encrypted.

If an exact terminal D mechanism/procedure lock exists, identify it by exact physical artifact and SHA-256.

If no such current accepted artifact can be physically located, record that fact explicitly; do not invent or reconstruct one.

---

# 3. Canonical Repository Read-Only Recheck

Repository:

`C:\RetroStage\retrostage-maker`

Required baseline:

```text
HEAD =
e50cadca387b992f6a5648237fe0c006ef72a6fa

parent =
5c7ff6322ba2583176065a919db385d51b650fba

branch = main
commit count = 4
HEAD tree files = 140
working tree = CLEAN
index = CLEAN
unexpected untracked non-ignored files = 0

origin =
https://github.com/caosvein/retrostage-maker.git

remote refs = 0
upstream = ABSENT
```

Run read-only commands at minimum:

```powershell
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD^
git -C "C:\RetroStage\retrostage-maker" rev-list --count HEAD
git -C "C:\RetroStage\retrostage-maker" branch --show-current
git -C "C:\RetroStage\retrostage-maker" status --short --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" status --porcelain=v2 --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" remote -v
git -C "C:\RetroStage\retrostage-maker" ls-remote origin
git -C "C:\RetroStage\retrostage-maker" ls-tree -r --name-only HEAD
```

Do not fetch, pull, push, reset, restore, checkout, stash, or clean.

If drift exists:

STOP:

`BLOCKED — RSM-3-I4-PRE1 REPOSITORY BASELINE DRIFT`

---

# 4. GitHub Authentication / Remote Permission Preflight

Use read-only GitHub CLI operations only.

Do NOT print or expose authentication tokens.

Run at minimum:

```powershell
gh auth status --active --hostname github.com
gh repo view caosvein/retrostage-maker --json nameWithOwner,isPrivate,isEmpty,defaultBranchRef,viewerPermission,url
gh run list -R caosvein/retrostage-maker --limit 20 --json databaseId,status,conclusion,headSha,headBranch,event,workflowName,createdAt,url
```

Required pre-push truth:

```text
active GitHub account = authenticated
repository = caosvein/retrostage-maker
visibility = PRIVATE
viewer permission sufficient for intended later push
remote repository currently empty / no branch ref expected before first push
GitHub Actions run for current local HEAD = NONE before push
```

Do not use:

`gh auth status --show-token`

Do not perform a push, even dry-run, unless the exact accepted authority explicitly requires it for PRE1. This prompt does not.

Record whether later push permission appears materially ready from read-only evidence.

---

# 5. Selected External Device Authority

The only selected external-backup device is the accepted Seagate identity.

Required stable identity bundle:

```text
friendly/model family =
Seagate Backup+ Hub BK

accepted model =
Seagate Backup+ Hub BK SCSI Disk Device

serial_number =
NA9RMHEH

disk unique identity =
5000000000000001

bus =
USB

physical size bytes =
14000519642624

partition style =
GPT

filesystem =
NTFS

accepted volume GUID =
\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\

backup root relative to accepted volume =
RSM-Offsite-Backup\retrostage-maker
```

The historical Toshiba candidate is NOT selected.

The historical observation-time `F:` drive letter is not the primary identity.

Resolve the accepted Volume GUID to the current physical mount read-only.

Use Windows storage cmdlets / CIM read-only queries as needed.

At minimum record:

- selected device physically present or absent;
- current disk number;
- current drive letter, if any;
- current Volume GUID;
- filesystem;
- total bytes;
- free bytes;
- free-space percentage;
- health status;
- operational status;
- disk model;
- serial;
- unique ID;
- whether all stable identity fields match the accepted lock.

If the device is absent:

do not substitute another device.

Record:

`SELECTED_EXTERNAL_DEVICE = NOT_CONNECTED`

and continue other non-device preflight observations where possible.

---

# 6. BitLocker / Encryption Readiness — READ ONLY

No encryption mutation is authorized.

If the accepted selected volume is connected and has a current drive letter, use official Windows read-only status commands:

```powershell
manage-bde -status <CURRENT_DRIVE>:
manage-bde -protectors -get <CURRENT_DRIVE>:
```

You may also use read-only PowerShell/WMI/CIM observations, but do not require them if they need higher privileges than available.

Never execute:

```text
manage-bde -on
manage-bde -off
manage-bde -pause
manage-bde -resume
manage-bde -lock
manage-bde -unlock
manage-bde -protectors -add
manage-bde -protectors -delete
manage-bde -protectors -enable
manage-bde -protectors -disable
Enable-BitLocker
Disable-BitLocker
Add-BitLockerKeyProtector
Remove-BitLockerKeyProtector
```

Capture, without exposing secret recovery values:

```text
conversion status
percentage encrypted
encryption method
protection status
lock status
key-protector TYPE(S)
whether a recovery protector exists
```

Do NOT copy a recovery password or recovery key value into evidence.

If the tool reveals a recovery password/key value in normal output, redact the secret value before writing evidence while preserving protector type and ID where safe.

### Encryption-ready classification

Classify `EXTERNAL_ENCRYPTION_READY = TRUE` only if physical evidence demonstrates all required conditions applicable to the accepted policy, including at minimum:

```text
selected exact volume identity matched
volume fully encrypted
BitLocker protection ON / protected
volume accessible for the intended operation
at least one suitable recovery protector exists
```

The separate-storage requirement for recovery material must also have an accepted current mechanism/procedure authority.

If physical encryption is off, partial, suspended, protection off, inaccessible, or unverified:

`EXTERNAL_ENCRYPTION_READY = FALSE`

If admin/elevation is required to observe the state and current runtime cannot prove it:

`EXTERNAL_ENCRYPTION_READY = UNVERIFIED_PRIVILEGE_REQUIRED`

Do NOT elevate by changing system configuration.

---

# 7. Terminal Encryption/Recovery Procedure Authority Reconciliation

Search only accepted/current authority artifacts.

Determine whether a terminal accepted D mechanism/procedure lock physically exists that resolves:

- encryption mechanism;
- recovery-material handling;
- retention/pruning mechanism;
- generation-size/free-space procedure;
- SHA-256 manifest/verification procedure;
- safe-eject procedure;
- backup frequency;
- failure handling;
- restore-source selection.

For each item record:

```text
authority artifact
section / decision
artifact SHA-256
exact current state
```

If a procedure is absent, say:

`NO CURRENT ACCEPTED TERMINAL PROCEDURE ARTIFACT LOCATED`

Do not fall back to failed Original/FIX1–FIX15 instructions.

PRE1 may still report physical observations, but it may not declare the full I4 execution ready if a required owner/procedure authority is materially absent.

---

# 8. Governed Backup Scope — READ ONLY

Compute the current complete repository backup scope without copying it.

The accepted backup boundary requires preservation of current repository truth and Git history while excluding secrets and regenerable ephemeral state.

At minimum inventory:

```text
canonical repository root
Git-tracked worktree files
.git repository metadata
current clean-worktree state
```

Explicitly exclude from a proposed ordinary backup generation:

```text
node_modules
dist
coverage
tool caches
logs
temporary files
credential stores
secret-bearing local environment files
local-only secrets
```

Do NOT exclude a file merely because it is a generated artifact if it is currently Git-tracked and committed; Git-tracked repository truth remains recoverable through the repository history.

Scan for obvious secret-bearing untracked/local configuration by filename/pattern only; do not print secret contents.

If a secret-bearing candidate would enter the proposed ordinary backup scope:

STOP external-backup readiness:

`BLOCKED — SECRET-BEARING FILE IN ORDINARY BACKUP SCOPE`

---

# 9. Exact Current Generation-Size Observation

Calculate, without copying:

```text
governed_file_count
governed_file_bytes
.git_file_count
.git_bytes
tracked_worktree_file_count
tracked_worktree_bytes
excluded_ephemeral_file_count
excluded_ephemeral_bytes
secret-bearing-candidate count
```

Produce a deterministic path/size inventory for the governed proposed generation.

Then locate the accepted current generation-size/free-space calculation procedure.

If an exact accepted overhead/safety-margin formula exists, apply it exactly.

If no exact accepted formula exists:

- report the raw governed byte total;
- report the physical free-space facts;
- do NOT invent a percentage/overhead formula beyond the separately locked minimum-free-space rule;
- classify the procedure authority as unresolved.

The locked minimum-free-space policy requires both:

1. the required minimum free-space percentage condition;
2. enough free bytes for the estimated next complete accepted generation.

Record both tests separately.

Do not write to the external disk to calculate this.

---

# 10. Local I4 Target Preflight

Inspect these exact paths read-only:

```text
D:\RSM-Backup\retrostage-maker
D:\RSM-Validation\clean-clone
D:\RSM-Restore-Test
```

For each record:

```text
exists
type
empty/non-empty
file count if present
byte count if present
Git repository present
unexpected content summary
```

Rules:

- Do NOT delete or empty an existing path.
- Do NOT rename an existing path.
- Do NOT create a missing path.
- Do NOT overwrite existing content.
- Do NOT treat a non-empty pre-existing target as disposable without separate authorization.

For clean-clone and restore targets, later execution readiness normally requires the target to be absent or demonstrably empty.

A non-empty existing target is a blocker pending explicit handling.

---

# 11. External Backup Root Preflight

Resolve the accepted backup root from the locked Volume GUID, not from historical `F:` alone.

If the selected volume is connected, inspect only:

`<CURRENT_ACCEPTED_VOLUME_MOUNT>\RSM-Offsite-Backup\retrostage-maker`

Record:

```text
root exists / absent
if exists: content count and byte count
existing accepted-generation structure if any
```

Do NOT create the root.

Do NOT write a probe file.

Do NOT modify timestamps.

Do NOT prune anything.

If pre-existing content exists, preserve it and classify whether later execution would require an explicit append/generation plan rather than overwrite.

---

# 12. GitHub Actions Pre-Push State

The repository currently has a committed CI workflow but no remote branch.

Read-only verify:

- `.github/workflows/ci.yml` exists at current local HEAD;
- current workflow content still has the accepted immutable Action pins;
- remote has no workflow run for current HEAD before first push.

Do not run or dispatch a workflow manually.

Later I4 execution is expected to let the first push trigger the configured `push` workflow naturally.

---

# 13. Source 07 Boundary

Do NOT create:

`Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md`

during PRE1.

Source 07 must be derived only after physically observed I4 commands exist for:

- first push;
- remote verification;
- GitHub-hosted CI;
- clean clone;
- clean install;
- validation/build;
- local/external backup as applicable;
- isolated restore proof.

PRE1 observations may later contribute evidence, but are not sufficient to author source 07.

---

# 14. Bootstrap Mutation Guard

Before any output creation, hash every pre-existing file under:

`C:\RetroStage\bootstrap\RSM-3-A`

No pre-existing bootstrap file may change.

Only the four PRE1 outputs in Section 17 may be created.

Required after execution:

```text
UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0
EXPECTED_NEW_PRE1_OUTPUT_COUNT = 4
UNEXPECTED_NEW_BOOTSTRAP_FILE_COUNT = 0
```

---

# 15. Repository / Target Mutation Guard

Before and after PRE1 require:

```text
repository HEAD unchanged
repository commit count unchanged
repository worktree/index clean
remote refs unchanged = 0
upstream remains absent
push performed = FALSE

local backup target mutation count = 0
clean-clone target mutation count = 0
restore target mutation count = 0
external volume mutation count = 0
BitLocker mutation count = 0
```

If any unauthorized mutation occurs:

STOP and preserve evidence:

`BLOCKED — RSM-3-I4-PRE1 UNAUTHORIZED MUTATION`

---

# 16. No Secret Capture

Never record:

- GitHub token;
- credential-manager secret;
- BitLocker recovery password;
- BitLocker recovery key contents;
- private keys;
- passwords;
- secret environment-variable values.

Record only:

- authenticated account identity;
- permission classification;
- protector type;
- safe protector ID where appropriate;
- existence/state classifications.

If a command accidentally prints secret material, redact it before evidence storage.

---

# 17. Required Outputs

Create exactly FOUR new files under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

## Output 1

`RSM-3-I4-PRE1-REMOTE-AUTH-AND-TARGET-READINESS.md`

Record:

- entry authority verification;
- current repository baseline;
- GitHub auth account/state without token;
- remote repo identity/private/empty state;
- viewer permission;
- current remote refs;
- GitHub Actions pre-push run state;
- D: target states;
- external backup-root state;
- mutation guards.

## Output 2

`RSM-3-I4-PRE1-EXTERNAL-DEVICE-ENCRYPTION-CAPACITY-EVIDENCE.md`

Record:

- accepted stable Seagate identity;
- current physical device observations;
- Volume GUID re-resolution;
- current drive letter if any;
- filesystem/health/capacity/free space;
- `manage-bde -status` classification;
- key-protector TYPE/ID evidence with secret values redacted;
- encryption-ready classification;
- terminal encryption/recovery-procedure authority result;
- locked 20% free-space result;
- next-generation-capacity result.

## Output 3

`RSM-3-I4-PRE1-BACKUP-SCOPE-AND-GENERATION-SIZE.tsv`

Columns at minimum:

```text
repository_relative_or_meta_path
scope_class
file_type
size_bytes
included
exclusion_reason
secret_candidate
sha256_if_governed_file
notes
```

Include deterministic summary/footer evidence separately in the readiness report.

Do not put secret contents in the TSV.

## Output 4

`RSM-3-I4-PRE1-READINESS-REPORT.md`

Must summarize exact gates:

```text
I4 activation authority
repository baseline
GitHub auth/remote readiness
selected-device identity readiness
encryption readiness
terminal encryption/recovery procedure authority
generation-size procedure authority
20% free-space check
next-generation capacity check
local backup target readiness
clean-clone target readiness
restore target readiness
external backup-root readiness
secret-scope blocker count
unauthorized mutation count
```

---

# 18. Final Decision

The report must end with exactly one of:

`READY FOR OWNER-AUTHORIZED RSM-3-I4 EXECUTION`

or

`BLOCKED — RSM-3-I4-PRE1 MATERIAL READINESS FAILURE`

### READY is permitted only when all of these are proven

```text
current I4 authority exact
repository baseline exact and clean
GitHub auth/remote push permission materially ready
selected Seagate identity exact and connected
external encryption readiness TRUE
required terminal mechanism/procedure authority physically located and accepted
generation-size/free-space procedure applicable
20% free-space gate passes
next-generation capacity gate passes
clean-clone target safe
restore target safe
backup targets do not require unauthorized overwrite
secret-scope blocker count = 0
unauthorized mutation count = 0
```

Otherwise BLOCK with exact blocker IDs.

Do not partially execute I4.

Do not push first and “fix backup later.”

Do not create another prompt automatically.

---

# 19. Success Condition

PRE1 succeeds as a preflight when it truthfully determines whether the now-authorized I4 slice is physically safe to execute.

A BLOCKED result is a successful fail-closed preflight if it identifies the exact unresolved prerequisite without changing repository, remote, targets, or encryption state.

Only a later separately owner-authorized I4 execution task may perform:

- first push;
- remote branch verification;
- natural GitHub-hosted CI run observation;
- local backup;
- clean clone / clean install / validation / build;
- external accepted backup;
- isolated restore proof;
- eventual source 07 creation from observed commands.
