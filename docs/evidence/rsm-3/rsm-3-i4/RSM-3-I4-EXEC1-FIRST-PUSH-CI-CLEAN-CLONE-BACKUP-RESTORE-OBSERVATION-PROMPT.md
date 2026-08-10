# RetroStage Maker — RSM-3-I4-EXEC1 First Push / GitHub CI / Clean Clone / Verified Backup / Restore Observation

**Document ID:** `RSM-3-I4-EXEC1-FIRST-PUSH-CI-CLEAN-CLONE-BACKUP-RESTORE-OBSERVATION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Task:** `RSM-3-I4-EXEC1 — First Push / GitHub CI / Clean Clone / Verified Backup / Restore Observation`  
**Primary executor:** `Codex`  
**Mode:** `CONTROLLED I4 PHYSICAL EXECUTION / FAIL-CLOSED`

This task performs the first real off-device and reproducibility observations for RetroStage Maker.

It intentionally treats BitLocker as deferred non-blocking operational hardening for RSM-3.

---

# 1. Mandatory Authority

Before any mutation, fully read and verify:

- `RSM-3-I3-ALIGN1-I4-ACTIVATION-REPORT.md`
- `RSM-3-I4-PRE1-REMOTE-AUTH-AND-TARGET-READINESS.md`
- `RSM-3-I4-PRE1-EXTERNAL-DEVICE-ENCRYPTION-CAPACITY-EVIDENCE.md`
- `RSM-3-I4-PRE1-BACKUP-SCOPE-AND-GENERATION-SIZE.tsv`
- `RSM-3-I4-PRE1-READINESS-REPORT.md`
- `RSM-3-I4-PRE2-PRIVILEGED-BITLOCKER-AND-CAPACITY-EVIDENCE.md`
- `RSM-3-I4-PRE2-READINESS-REPORT.md`
- `RSM-3-I4-OWNER-BACKUP-ENCRYPTION-RESTORE-MECHANISM-AND-CAPACITY-LOCK.md`
- `RSM-3-I4-OWNER-EXTERNAL-BACKUP-ENCRYPTION-NONBLOCKING-CORRECTION-LOCK.md`

Required current owner decision:

`EXTERNAL_BACKUP_ENCRYPTION = DEFERRED_OPERATIONAL_HARDENING / NON_BLOCKING`

Required I4 activation:

`RSM-3-I4 AUTHORIZED / READY FOR EXECUTION`

If either is absent or inconsistent:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 AUTHORITY INVALID`

---

# 2. Accepted Starting Repository State

Canonical repository:

`C:\RetroStage\retrostage-maker`

Required:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
parent = 5c7ff6322ba2583176065a919db385d51b650fba
branch = main
commit count = 4
HEAD tree files = 140
working tree = CLEAN
index = CLEAN
unexpected untracked non-ignored files = 0
origin = https://github.com/caosvein/retrostage-maker.git
remote refs = 0
upstream = ABSENT
```

Physically recheck before execution.

If drift exists:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 LOCAL BASELINE DRIFT`

Do not repair automatically.

---

# 3. Selected Seagate and Unencrypted-Backup Boundary

Resolve the selected volume by exact stable identity:

```text
Volume GUID = \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
Model = Seagate Backup+ Hub BK SCSI Disk Device
Serial = NA9RMHEH
UniqueId = 5000000000000001
Bus = USB
Filesystem = NTFS
```

BitLocker may remain:

```text
FullyDecrypted / 0% / None / Protection Off
```

That state is non-blocking under the current owner correction.

Do NOT:

- enable BitLocker;
- modify protectors;
- format;
- repartition;
- enable auto-unlock.

External backup root:

`<CURRENT_SELECTED_VOLUME>\RSM-Offsite-Backup\retrostage-maker`

---

# 4. Fresh Capacity and Secret-Scope Recheck

Before any external write, recompute:

```text
G = governed raw generation bytes
N = governed file count
T = selected volume total bytes
F = selected volume free bytes
E = max(ceil(G * 1.25), G + 16,777,216)
```

Require:

```text
F >= E
F - E >= ceil(T * 0.20)
```

Re-run the governed backup-scope/filename secret-candidate check.

Required:

```text
secret-scope blocker count = 0
```

If not:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 BACKUP SCOPE OR CAPACITY FAILURE`

---

# 5. GitHub Authentication Recheck

Read-only verify:

```powershell
gh auth status --active --hostname github.com
gh repo view caosvein/retrostage-maker --json nameWithOwner,isPrivate,isEmpty,defaultBranchRef,viewerPermission,url
```

Required:

```text
repository = caosvein/retrostage-maker
visibility = PRIVATE
viewer permission = ADMIN or otherwise sufficient
remote repository = empty before first push
```

Never print/show token values.

---

# 6. Phase A — First Push

From the exact clean accepted baseline:

```powershell
git -C "C:\RetroStage\retrostage-maker" push -u origin main
```

If push fails:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 FIRST PUSH FAILURE`

After push verify:

```powershell
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD
git -C "C:\RetroStage\retrostage-maker" ls-remote --heads origin main
git -C "C:\RetroStage\retrostage-maker" rev-parse --abbrev-ref --symbolic-full-name @{u}
```

Required remote `main` object ID:

`e50cadca387b992f6a5648237fe0c006ef72a6fa`

Required upstream:

`origin/main`

If remote HEAD differs:

STOP.

---

# 7. Phase B — GitHub-Hosted CI Observation

The committed workflow is expected to trigger naturally on the first `main` push.

Do NOT manually dispatch another workflow unless the committed workflow explicitly requires it; current design uses push trigger.

Use GitHub CLI to locate the workflow run whose:

```text
headSha = e50cadca387b992f6a5648237fe0c006ef72a6fa
headBranch = main
event = push
```

Observe the run to terminal state.

You may use:

```powershell
gh run list -R caosvein/retrostage-maker --commit e50cadca387b992f6a5648237fe0c006ef72a6fa --limit 20
gh run view <RUN_ID> -R caosvein/retrostage-maker
gh run watch <RUN_ID> -R caosvein/retrostage-maker --exit-status
```

Required:

`GitHub-hosted CI conclusion = success`

If CI fails:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 GITHUB CI FAILURE`

Capture run ID, workflow name, head SHA, event, conclusion, URL, and relevant failed-step summary if blocked.

---

# 8. Phase C — Clean Clone

Exact target:

`D:\RSM-Validation\clean-clone`

Before clone require target:

`ABSENT`

If it exists:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 CLEAN-CLONE TARGET NOT ABSENT`

Do not delete automatically.

Clone:

```powershell
git clone "https://github.com/caosvein/retrostage-maker.git" "D:\RSM-Validation\clean-clone"
```

Verify:

```text
branch = main
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
working tree clean = TRUE
origin correct = TRUE
```

Do not copy local `node_modules` into the clone.

---

# 9. Phase D — Clean-Clone Install and Validation

Inside:

`D:\RSM-Validation\clean-clone`

Run at minimum:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd run format:check
pnpm.cmd run lint
pnpm.cmd run typecheck
pnpm.cmd run test
pnpm.cmd run arch:check
pnpm.cmd run deadcode:check
pnpm.cmd run build
pnpm.cmd run validate
pnpm.cmd run compliance:check
pnpm.cmd run dependency:audit
pnpm.cmd run ci:validate
```

Required:

```text
mandatory failures = 0
lockfile drift = 0
working tree after validation = CLEAN
HEAD unchanged = e50cadca387b992f6a5648237fe0c006ef72a6fa
```

If validation mutates tracked files or fails:

STOP.

Do not repair the canonical repository from the clone.

---

# 10. Phase E — Local Backup Copy

Exact target:

`D:\RSM-Backup\retrostage-maker`

Before use require:

`ABSENT`

If it exists:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 LOCAL BACKUP TARGET NOT ABSENT`

Create a local repository backup preserving Git history.

Use a deterministic copy approach that preserves:

- Git-tracked worktree repository truth;
- `.git` history/state;

and excludes untracked ephemeral state such as `node_modules`.

After copy verify at minimum:

```text
backup Git repository opens = TRUE
backup HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
backup branch = main
backup tracked tree identity = canonical HEAD tree
backup source/destination governed file mismatch = 0
```

Do not treat this local backup as the external generation.

---

# 11. Phase F — Verified External Generation

Generation root:

`<selected-volume>\RSM-Offsite-Backup\retrostage-maker\generations\`

Generation ID:

`<UTC_YYYYMMDDTHHMMSSZ>_e50cadca387b`

Create a NEW generation only.

Never overwrite an existing generation.

Generation content:

```text
payload\
manifest.tsv
generation.json
COMPLETE.sha256
```

## Payload

Copy the governed repository backup scope:

- all current Git-tracked worktree files;
- `.git` repository metadata required for local Git history/state;

excluding untracked ephemeral/secret state.

## manifest.tsv

For every governed payload file exactly once:

```text
normalized relative path
size_bytes
SHA-256
```

Sort deterministically by normalized relative path.

## generation.json

Record at minimum:

```text
generation ID
source repository = C:\RetroStage\retrostage-maker
source HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
source branch = main
commit count = 4
governed file count
governed raw bytes
manifest SHA-256
creation UTC timestamp
selected Volume GUID
selected disk serial / UniqueId
encryption state = UNENCRYPTED_OWNER_CONTROLLED
backup mechanism version = RSM-3-I4-v1
```

Do not include secrets.

## Verify before completion

Re-enumerate destination payload and require:

```text
missing = 0
extra = 0
size mismatch = 0
SHA-256 mismatch = 0
file count exact
byte count exact
```

Then write `COMPLETE.sha256` LAST.

`COMPLETE.sha256` must contain the accepted SHA-256 of `manifest.tsv` plus sufficient generation identity to reject accidental cross-generation use.

If verification fails:

- do not write a valid completion marker;
- do not delete previous complete generations;
- STOP.

---

# 12. Phase G — Isolated Restore Proof

Exact restore target:

`D:\RSM-Restore-Test`

Before restore require:

`ABSENT`

If it exists:

STOP:

`BLOCKED — RSM-3-I4-EXEC1 RESTORE TARGET NOT ABSENT`

Restore only from the newly completed verified external generation.

Before restore, re-verify:

- completion marker;
- manifest SHA;
- full payload SHA manifest.

Copy payload to restore target.

Then require:

```text
Git repository opens = PASS
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch/history identity = PASS
working tree integrity = PASS
```

Run from restore target:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd run validate
pnpm.cmd run build
pnpm.cmd run compliance:check
```

Required:

```text
failures = 0
lockfile drift = 0
tracked working tree clean after validation = TRUE
```

If restore fails, preserve evidence and STOP.

Do not overwrite the canonical repository.

---

# 13. Phase H — Observed Command Authority / Source 07 Draft

Only after Phases A–G all pass, create:

`C:\RetroStage\bootstrap\RSM-3-A\Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md`

This source must be derived from the commands actually observed during this task.

It must include exact operational command contracts for:

- canonical repository status/baseline verification;
- first/subsequent push;
- remote HEAD verification;
- GitHub Actions run verification;
- clean clone;
- frozen install;
- validation/build/compliance;
- local backup;
- external generation creation and verification;
- restore source selection;
- isolated restore validation;
- safe handling of the owner-controlled unencrypted external backup;
- failure behavior.

Do NOT include:

- tokens;
- passwords;
- secret values;
- invented commands not physically validated;
- BitLocker commands as required RSM-3 operations.

Source 07 state after this task:

`DRAFTED FROM OBSERVED I4 COMMANDS / PENDING INDEPENDENT REVIEW`

---

# 14. Source 02 / 08 Draft Alignment

After A–G pass and source 07 is created, update live bootstrap:

- `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

to truthfully record:

```text
I3 closed
I4 physical execution completed through first-push/CI/clone/backup/restore observation
remote main present
remote HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
upstream = origin/main
GitHub-hosted CI = PASS for e50cadca...
clean clone = PASS
external verified generation = PASS
isolated restore = PASS
source 07 = drafted / pending independent review
I4 = NOT YET CLOSED
V1 = NOT AUTHORIZED
RSM-4 = BLOCKED
```

Do not declare I4 closed.

Do not start V1.

---

# 15. Repository Mutation Boundary After Push

The canonical repository itself must NOT be modified by source 07/02/08 creation during EXEC1.

Those live-source changes occur only in bootstrap.

The accepted local repository remains at:

`e50cadca387b992f6a5648237fe0c006ef72a6fa`

through this task.

A later reviewed I4 source/evidence synchronization candidate will bring the observed I4 authority into the repository.

---

# 16. Required Outputs

Create exactly SIX new outputs under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

## Output 1
`RSM-3-I4-EXEC1-REMOTE-PUSH-AND-GITHUB-CI-EVIDENCE.md`

## Output 2
`RSM-3-I4-EXEC1-CLEAN-CLONE-VALIDATION-EVIDENCE.md`

## Output 3
`RSM-3-I4-EXEC1-LOCAL-AND-EXTERNAL-BACKUP-EVIDENCE.md`

## Output 4
`RSM-3-I4-EXEC1-RESTORE-PROOF-EVIDENCE.md`

## Output 5
`RSM-3-I4-EXEC1-OBSERVED-COMMAND-MANIFEST.tsv`

Columns:

```text
sequence
phase
working_directory
command_or_operation
exit_code
result
mutating
target
notes
```

Do not place secrets in commands/notes.

## Output 6
`RSM-3-I4-EXEC1-READINESS-REPORT.md`

Must summarize:

```text
local baseline
first push
remote main/HEAD
upstream
GitHub CI
clean clone
clean-clone validation
local backup
selected Seagate identity
unencrypted-backup decision authority
capacity gate
secret-scope gate
external generation ID
manifest verification
restore proof
source 07 draft
source 02/08 draft alignment
canonical repository mutation count after push = 0
V1 authorization = FALSE
```

---

# 17. Bootstrap Mutation Guard

Before EXEC1:

hash every pre-existing bootstrap file.

Authorized pre-existing bootstrap mutations during successful EXEC1:

```text
Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Authorized new source:

```text
Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md
```

Authorized new outputs:

exact six EXEC1 outputs.

Required:

```text
AUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 2
UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0
EXPECTED_NEW_SOURCE_COUNT = 1
EXPECTED_NEW_EXEC1_OUTPUT_COUNT = 6
UNEXPECTED_NEW_BOOTSTRAP_FILE_COUNT = 0
```

If the task blocks before Phase H, source 07 and source 02/08 alignment must not falsely claim completion.

Evidence outputs may still record the fail-closed partial execution state.

---

# 18. Canonical Repository Final Guard

At final successful EXEC1:

```text
canonical HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
canonical branch = main
canonical working tree/index = CLEAN
canonical unexpected untracked = 0
origin/main = e50cadca387b992f6a5648237fe0c006ef72a6fa
upstream = origin/main
```

No new canonical commit in EXEC1.

---

# 19. Forbidden Actions

Do NOT:

- run the BL1 BitLocker script;
- enable/modify BitLocker;
- expose credentials;
- force-push;
- rewrite Git history;
- delete pre-existing D: targets;
- overwrite existing backup generations;
- overwrite canonical repository from restore;
- create a new product dependency;
- change lockfile;
- change repository content after first push;
- declare I4 closed;
- authorize V1;
- start RSM-4.

---

# 20. Final Decision

`RSM-3-I4-EXEC1-READINESS-REPORT.md` must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I4 EXEC1 REVIEW`

or

`BLOCKED — RSM-3-I4-EXEC1 MATERIAL FAILURE`

Do not create a FIX prompt.

---

# 21. Success Condition

EXEC1 succeeds when the accepted I3 repository baseline is proven:

- off-device on GitHub;
- successful under real GitHub-hosted CI;
- reproducible from a fresh remote clone;
- preserved in verified local/external backup;
- restorable into an isolated target;
- documented by source 07 using physically observed commands;

while leaving the canonical repository clean and unchanged after its first push.

A later independent review will decide whether the I4 source/evidence synchronization candidate may be created and committed.
