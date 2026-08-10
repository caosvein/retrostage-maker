# RetroStage Maker — RSM-3-I4-EXEC1-RETRY1 Auth-Scope Recovery / First Push / GitHub CI / Clean Clone / Backup / Restore

**Document ID:** `RSM-3-I4-EXEC1-RETRY1-AUTH-SCOPE-RECOVERY-AND-PHYSICAL-EXECUTION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Task:** `RSM-3-I4-EXEC1-RETRY1`  
**Primary executor:** `Codex`  
**Mode:** `CONTROLLED RETRY FROM UNCHANGED ACCEPTED BASELINE / FAIL-CLOSED`

This is not a repair of repository content.

The original EXEC1 failed before any remote ref, CI run, clone, backup, restore, source 07, or source 02/08 alignment was created.

RETRY1 restarts the physical I4 sequence only after the owner has explicitly refreshed the existing GitHub CLI credential to include the `workflow` OAuth scope.

---

# 1. Mandatory authority and failed-attempt lineage

Fully read and verify:

- `RSM-3-I4-OWNER-GITHUB-WORKFLOW-SCOPE-AUTHORIZATION-LOCK.md`
- `RSM-3-I4-OWNER-EXTERNAL-BACKUP-ENCRYPTION-NONBLOCKING-CORRECTION-LOCK.md`
- `RSM-3-I4-EXEC1-FIRST-PUSH-CI-CLEAN-CLONE-BACKUP-RESTORE-OBSERVATION-PROMPT.md`
- all six failed EXEC1 evidence outputs

Required failed EXEC1 identities:

```text
RSM-3-I4-EXEC1-REMOTE-PUSH-AND-GITHUB-CI-EVIDENCE.md
SHA-256 = 399A79E4F40BBEF857F7C3E76180AE5FA80F092B2A162CEC21073A8A136B8941

RSM-3-I4-EXEC1-CLEAN-CLONE-VALIDATION-EVIDENCE.md
SHA-256 = 77230457EBBA04D679018978DD24A701B42025A1647A529534EA17B2EA18E0A7

RSM-3-I4-EXEC1-LOCAL-AND-EXTERNAL-BACKUP-EVIDENCE.md
SHA-256 = F00033A70EE50B306D7550C6741DC8E4098668674C4A8E39D10EA2394F9398F0

RSM-3-I4-EXEC1-RESTORE-PROOF-EVIDENCE.md
SHA-256 = 245C954CB3F20E7C8CB0A439F458A3E4336FFDC94310131D9BEFBABFF3CAEB98

RSM-3-I4-EXEC1-OBSERVED-COMMAND-MANIFEST.tsv
SHA-256 = 7FB9808EE789C1D191794CA4AABF461C6CC806B0CF69EA06BB646C08B726D48B

RSM-3-I4-EXEC1-READINESS-REPORT.md
SHA-256 = D056B43EDDDE48FFB763C84C69B130E1C78CE21E30492538D31BD4AD1A8861A5
```

Required failed decision:

`BLOCKED — RSM-3-I4-EXEC1 MATERIAL FAILURE`

Required failure cause:

`FIRST PUSH REJECTED — ACTIVE OAUTH CREDENTIAL LACKED workflow SCOPE`

Do not modify or overwrite these six historical outputs.

---

# 2. Authentication gate — read-only verification only

The owner must have already completed:

```powershell
gh auth refresh -h github.com -s workflow
```

RETRY1 must NOT refresh or otherwise mutate authentication.

Verify:

```powershell
gh auth status --active --hostname github.com
gh repo view caosvein/retrostage-maker --json nameWithOwner,isPrivate,isEmpty,defaultBranchRef,viewerPermission,url
```

Required:

```text
active host = github.com
active account = caosvein
token/auth valid = TRUE
effective scope names include = repo, read:org, gist, workflow
repository = caosvein/retrostage-maker
private = TRUE
viewerPermission = ADMIN
repository empty = TRUE
```

Do NOT use:

```text
gh auth status --show-token
gh auth token
```

Do not capture any token value.

If `workflow` is absent:

STOP:

`BLOCKED — RSM-3-I4-EXEC1-RETRY1 workflow SCOPE STILL ABSENT`

---

# 3. Exact local baseline recheck

Canonical repository:

`C:\RetroStage\retrostage-maker`

Required:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
parent = 5c7ff6322ba2583176065a919db385d51b650fba
branch = main
commit count = 4
HEAD tree files = 140
working tree/index = CLEAN
unexpected untracked non-ignored files = 0
origin = https://github.com/caosvein/retrostage-maker.git
remote refs = 0
upstream = ABSENT
```

Revalidate the governed 173-file baseline against the accepted PRE1/failed-EXEC1 inventory.

Required physical mismatch count:

`0`

If any local or remote drift exists:

STOP:

`BLOCKED — RSM-3-I4-EXEC1-RETRY1 BASELINE DRIFT`

---

# 4. Backup / target gate recheck

Re-resolve the exact selected Seagate identity.

BitLocker remains non-blocking under current owner authority.

Recompute:

```text
G
N
T
F
E = max(ceil(G * 1.25), G + 16,777,216)
```

Require:

```text
secret-scope blocker count = 0
capacity gate = PASS
post-generation 20% free-space gate = PASS
```

Require all exact targets still absent before their phase:

```text
D:\RSM-Validation\clean-clone
D:\RSM-Backup\retrostage-maker
D:\RSM-Restore-Test
<selected Seagate>\RSM-Offsite-Backup\retrostage-maker
```

Do not delete or overwrite pre-existing content.

---

# 5. Phase A — retry first push exactly once

Execute:

```powershell
git -C "C:\RetroStage\retrostage-maker" push -u origin main
```

This is the only authorized push attempt in RETRY1.

If it fails:

STOP immediately.

After success require:

```text
origin/main = e50cadca387b992f6a5648237fe0c006ef72a6fa
upstream = origin/main
local HEAD unchanged
working tree/index clean
```

No force push.

---

# 6. Phase B — natural GitHub-hosted CI

Locate the push-triggered run with:

```text
headSha = e50cadca387b992f6a5648237fe0c006ef72a6fa
headBranch = main
event = push
```

Observe to terminal conclusion.

Required:

`conclusion = success`

Do not manually dispatch a duplicate run.

If CI fails:

STOP:

`BLOCKED — RSM-3-I4-EXEC1-RETRY1 GITHUB CI FAILURE`

Preserve exact run/failed-step evidence.

---

# 7. Phase C — clean clone

Exact target:

`D:\RSM-Validation\clean-clone`

Require absent.

Clone from remote:

```powershell
git clone "https://github.com/caosvein/retrostage-maker.git" "D:\RSM-Validation\clean-clone"
```

Require:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
origin correct
working tree clean
```

---

# 8. Phase D — clean-clone validation

Run in clean clone:

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

Require all mandatory commands PASS, no lockfile drift, HEAD unchanged, tracked worktree clean.

---

# 9. Phase E — local backup

Exact target:

`D:\RSM-Backup\retrostage-maker`

Require absent.

Create a repository backup preserving:

- Git-tracked worktree truth;
- `.git` history/state;

while excluding untracked ephemeral state.

Require backup:

```text
Git repository opens
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
governed source/destination mismatch = 0
```

---

# 10. Phase F — verified external generation

Use the selected Seagate and the existing owner backup mechanism/capacity authority, with encryption classified:

`UNENCRYPTED_OWNER_CONTROLLED / NON_BLOCKING`

Create a new generation only:

```text
generations\<UTC_YYYYMMDDTHHMMSSZ>_e50cadca387b\
  payload\
  manifest.tsv
  generation.json
  COMPLETE.sha256
```

Verify every governed payload file by count, bytes, and SHA-256.

Require:

```text
missing = 0
extra = 0
size mismatch = 0
hash mismatch = 0
```

Write `COMPLETE.sha256` last.

Never overwrite a previous complete generation.

---

# 11. Phase G — isolated restore proof

Exact target:

`D:\RSM-Restore-Test`

Require absent.

Restore only from the newly completed verified external generation.

Verify manifest/completion before restore.

Require restored Git state:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
expected history = PASS
working tree integrity = PASS
```

Run:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd run validate
pnpm.cmd run build
pnpm.cmd run compliance:check
```

Require zero failures and no tracked drift.

---

# 12. Phase H — source 07 and live-source alignment

Only after A–G all pass:

Create:

`Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md`

from physically observed commands only.

Then update only:

- `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

Truthfully record:

```text
first push = PASS
remote main/HEAD exact
upstream = origin/main
GitHub-hosted CI = PASS
clean clone = PASS
clean-clone validation = PASS
local backup = PASS
external verified generation = PASS
isolated restore = PASS
source 07 = drafted from observed commands / pending independent review
I4 = not yet closed
V1 = not authorized
```

Do not modify the canonical repository.

---

# 13. RETRY1 outputs

Create exactly SIX new RETRY1 outputs:

1. `RSM-3-I4-EXEC1-RETRY1-REMOTE-PUSH-AND-GITHUB-CI-EVIDENCE.md`
2. `RSM-3-I4-EXEC1-RETRY1-CLEAN-CLONE-VALIDATION-EVIDENCE.md`
3. `RSM-3-I4-EXEC1-RETRY1-LOCAL-AND-EXTERNAL-BACKUP-EVIDENCE.md`
4. `RSM-3-I4-EXEC1-RETRY1-RESTORE-PROOF-EVIDENCE.md`
5. `RSM-3-I4-EXEC1-RETRY1-OBSERVED-COMMAND-MANIFEST.tsv`
6. `RSM-3-I4-EXEC1-RETRY1-READINESS-REPORT.md`

Do not overwrite original EXEC1 evidence.

---

# 14. Bootstrap mutation guard

On successful A–G:

Authorized existing bootstrap mutations:

```text
Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Authorized new source:

`Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md`

Authorized new outputs:

the exact six RETRY1 outputs.

No other bootstrap mutation is authorized.

---

# 15. Canonical repository final guard

Final successful RETRY1 must leave:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
working tree/index = CLEAN
origin/main = e50cadca387b992f6a5648237fe0c006ef72a6fa
upstream = origin/main
canonical content mutation after first push = 0
```

No new commit.

---

# 16. Final decision

The RETRY1 readiness report must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I4 EXEC1-RETRY1 REVIEW`

or

`BLOCKED — RSM-3-I4-EXEC1-RETRY1 MATERIAL FAILURE`

Do not close I4.

Do not authorize V1.

Do not create a FIX prompt.
