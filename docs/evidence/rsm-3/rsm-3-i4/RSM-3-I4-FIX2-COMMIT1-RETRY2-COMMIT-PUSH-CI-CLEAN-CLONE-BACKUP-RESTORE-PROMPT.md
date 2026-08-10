# RetroStage Maker — RSM-3-I4-FIX2-COMMIT1-RETRY2 Commit / Push / CI / Fresh Clean Clone / Backup / Restore

**Document ID:** `RSM-3-I4-FIX2-COMMIT1-RETRY2-COMMIT-PUSH-CI-CLEAN-CLONE-BACKUP-RESTORE-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Task:** `RSM-3-I4-FIX2-COMMIT1-RETRY2`  
**Primary executor:** `Codex`  
**Mode:** `EXACT REVIEWED COMMIT + CONTROLLED PHYSICAL RETRY / FAIL-CLOSED`

---

# 1. Entry authority

Fully read and verify:

- `RSM-3-I4-FIX2-CHATGPT-INDEPENDENT-STAGED-CONTENT-REVIEW.md`
- the four FIX2 outputs;
- current owner external-backup encryption non-blocking correction;
- current backup mechanism/capacity authority;
- prior RETRY1 evidence for first-push/CI lineage.

Required independent decision:

`RSM-3-I4-FIX2 INDEPENDENT REVIEW — PASS / ONE-FILE EOL POLICY CANDIDATE ACCEPTED`

Required FIX2 identities:

```text
validation report = 1E00223FB9D82EE70B38D7F4DBEBA4F4AE6C8FDD4C2E6907429479F0A3182A30
EOL evidence TSV = 352C012262EFB7306485E7FF7EFADC82509DD9F2F70585AAB429757C968D29CF
exact staged patch = FB505B4902C5E863261485670DC0A33D031338074A1C86B5BF5109AE42CECC8D
staged candidate report = A2862158941336E636FFF81AA0D7549FCDE0B866AC1E611094F7D1288CE2F91C
```

Required accepted patch:

`FB505B4902C5E863261485670DC0A33D031338074A1C86B5BF5109AE42CECC8D`

If any identity differs:

STOP:

`BLOCKED — RSM-3-I4-FIX2-COMMIT1-RETRY2 AUTHORITY OR PATCH IDENTITY FAILURE`

---

# 2. Exact pre-commit repository state

Canonical repository:

`C:\RetroStage\retrostage-maker`

Require:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
commit count = 4
origin/main = e50cadca387b992f6a5648237fe0c006ef72a6fa
upstream = origin/main

staged path count = 1
staged entry = A .gitattributes
unstaged tracked path count = 0
unexpected untracked count = 0
```

Regenerate:

```powershell
git -C "C:\RetroStage\retrostage-maker" diff --cached --no-ext-diff --full-index --binary
```

and require SHA-256:

`FB505B4902C5E863261485670DC0A33D031338074A1C86B5BF5109AE42CECC8D`

Require staged `.gitattributes` blob:

`121165e90372b847cd907d3d236253b759097896`

Do not restage or modify the candidate.

---

# 3. Commit exactly the accepted candidate

Commit subject:

`bootstrap: enforce portable lf checkout policy`

Perform exactly one commit.

After commit require:

```text
parent = e50cadca387b992f6a5648237fe0c006ef72a6fa
commit count = 5
commit subject = bootstrap: enforce portable lf checkout policy
commit delta paths = 1
commit delta = A .gitattributes
HEAD tree files = 141
working tree/index = CLEAN
unexpected untracked = 0
```

Capture the new commit SHA as:

`FIX2_HEAD`

If the commit includes any other path:

STOP before push.

---

# 4. Push FIX2 commit

Push normal fast-forward:

```powershell
git -C "C:\RetroStage\retrostage-maker" push origin main
```

No force push.

After push require:

```text
origin/main = FIX2_HEAD
local HEAD = FIX2_HEAD
upstream = origin/main
working tree/index = CLEAN
```

If push fails:

STOP.

---

# 5. GitHub-hosted CI on FIX2_HEAD

Locate the natural push-triggered GitHub Actions run with:

```text
headSha = FIX2_HEAD
headBranch = main
event = push
```

Observe to terminal state.

Required:

`conclusion = success`

Do not manually dispatch a duplicate workflow.

If CI fails:

STOP and preserve exact failure evidence.

---

# 6. Preserve failed RETRY1 clean clone

Historical failed workspace:

`D:\RSM-Validation\clean-clone`

Do NOT:

- modify;
- delete;
- clean;
- reset;
- reuse;
- rename.

It remains physical historical evidence for the `core.autocrlf=true` failure.

---

# 7. Create a brand-new clean clone proof

Fresh proof target:

`D:\RSM-Validation\clean-clone-retry2`

Before clone require:

`ABSENT`

If present:

STOP; do not delete automatically.

Clone from GitHub:

```powershell
git clone "https://github.com/caosvein/retrostage-maker.git" "D:\RSM-Validation\clean-clone-retry2"
```

Before modifying any clone-local Git setting, record:

```text
effective core.autocrlf
HEAD
branch
origin
working tree status
```

Do NOT override `core.autocrlf`.

The proof specifically must succeed under the machine's naturally effective Git configuration.

Require:

```text
HEAD = FIX2_HEAD
branch = main
origin = https://github.com/caosvein/retrostage-maker.git
tracked worktree clean = TRUE
```

---

# 8. Fresh-clone EOL proof before install

From `clean-clone-retry2`, inspect:

```powershell
git ls-files --eol
git check-attr text eol -- .
```

For the exact 18 previously failing paths require physical worktree EOL:

`w/lf`

or an equivalent exact LF-only observation.

Require all:

```text
18/18 index EOL = lf
18/18 worktree EOL = lf
18/18 effective eol = lf
```

Protected historical evidence/notices may retain their committed byte forms and must not be rewritten.

If any of the 18 paths is CRLF/mixed:

STOP:

`BLOCKED — RSM-3-I4-FIX2-COMMIT1-RETRY2 EOL POLICY NOT EFFECTIVE IN FRESH CLONE`

---

# 9. Frozen install and full fresh-clone validation

Run:

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

Require:

```text
install = PASS
11/11 validation = PASS
format:check = PASS
tracked lockfile drift = 0
tracked worktree drift = 0
HEAD = FIX2_HEAD
```

This is the physical closure proof for the Windows LF checkout defect.

If any required command fails:

STOP before backup.

---

# 10. Local backup

Exact target:

`D:\RSM-Backup\retrostage-maker`

Require target absent.

If present:

STOP without deleting.

Create the governed local repository backup preserving:

- all Git-tracked worktree truth;
- `.git` history/state;

excluding untracked ephemeral/secret state.

Require:

```text
backup Git repository opens = PASS
backup HEAD = FIX2_HEAD
backup branch = main
governed source/destination mismatch = 0
```

---

# 11. External backup pre-write recheck

Resolve the exact selected Seagate by stable identity:

```text
Volume GUID = \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
Model = Seagate Backup+ Hub BK SCSI Disk Device
Serial = NA9RMHEH
UniqueId = 5000000000000001
Filesystem = NTFS
```

Encryption remains:

`DEFERRED_OPERATIONAL_HARDENING / NON_BLOCKING`

Do not modify BitLocker.

Recompute current governed backup scope from the FIX2_HEAD repository.

Require:

```text
secret-scope blocker count = 0
capacity gate = PASS
post-generation >=20% free-space gate = PASS
```

Apply exact capacity formula:

`E = max(ceil(G * 1.25), G + 16,777,216)`

---

# 12. Verified external generation

External root:

`<selected volume>\RSM-Offsite-Backup\retrostage-maker`

If the root is still absent, create it as part of the authorized backup operation.

Generation:

`generations\<UTC_YYYYMMDDTHHMMSSZ>_<FIX2_HEAD first 12 chars>`

Create:

```text
payload\
manifest.tsv
generation.json
COMPLETE.sha256
```

Payload must preserve governed repository truth including `.git` while excluding untracked ephemeral/secret state.

`manifest.tsv` must include each governed payload file exactly once with:

```text
normalized relative path
size_bytes
SHA-256
```

Sort deterministically.

`generation.json` must record at minimum:

```text
generation ID
source HEAD = FIX2_HEAD
branch = main
commit count = 5
governed file count
governed raw bytes
manifest SHA-256
UTC creation timestamp
selected stable volume identity
encryption state = UNENCRYPTED_OWNER_CONTROLLED
mechanism version = RSM-3-I4-v1
```

Destination verification must require:

```text
missing = 0
extra = 0
size mismatch = 0
SHA-256 mismatch = 0
file count exact
byte count exact
```

Write `COMPLETE.sha256` last.

If verification fails, no valid completed generation may be claimed.

---

# 13. Isolated restore proof

Exact target:

`D:\RSM-Restore-Test`

Require absent.

Restore only from the newly completed external generation.

Before restore re-verify:

- completion marker;
- manifest identity;
- full payload manifest.

Then require restored repository:

```text
Git opens = PASS
HEAD = FIX2_HEAD
branch = main
history identity = PASS
working tree integrity = PASS
```

Run:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd run validate
pnpm.cmd run build
pnpm.cmd run compliance:check
```

Require:

```text
all PASS
tracked lockfile drift = 0
tracked worktree drift = 0
```

Do not overwrite canonical repository.

---

# 14. Source 07 creation

Only after Sections 3–13 pass, create:

`C:\RetroStage\bootstrap\RSM-3-A\Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md`

Derive it only from commands physically observed in accepted I4 execution, including:

- local baseline verification;
- ordinary push and remote verification;
- GitHub-hosted CI verification;
- clean clone;
- EOL portability verification;
- frozen install;
- validation/build/compliance;
- local backup;
- external generation/manifest verification;
- restore;
- failure rules.

It must not contain secrets.

It must not require BitLocker for RSM-3.

State:

`SOURCE 07 = DRAFTED FROM PHYSICALLY OBSERVED I4 COMMANDS / PENDING INDEPENDENT REVIEW`

---

# 15. Source 02 / 08 live alignment

Only after all physical gates pass, update live bootstrap:

- `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

Truthfully record:

```text
FIX2_HEAD = exact new commit
origin/main = FIX2_HEAD
commit count = 5
tree files = 141
GitHub-hosted CI on FIX2_HEAD = PASS
fresh Windows clean clone = PASS
18/18 LF checkout proof = PASS
full clean-clone validation = PASS
local backup = PASS
external verified generation = PASS
isolated restore = PASS
source 07 = drafted / pending independent review
canonical repository = clean
I4 = NOT YET CLOSED
V1 = NOT AUTHORIZED
RSM-4 = BLOCKED
```

Do not declare I4 closed.

---

# 16. Required outputs

Create exactly EIGHT new outputs:

1. `RSM-3-I4-FIX2-COMMIT1-POST-COMMIT-EVIDENCE.md`
2. `RSM-3-I4-FIX2-COMMIT1-PUSH-AND-CI-EVIDENCE.md`
3. `RSM-3-I4-RETRY2-FRESH-CLEAN-CLONE-EOL-EVIDENCE.tsv`
4. `RSM-3-I4-RETRY2-CLEAN-CLONE-VALIDATION-EVIDENCE.md`
5. `RSM-3-I4-RETRY2-LOCAL-AND-EXTERNAL-BACKUP-EVIDENCE.md`
6. `RSM-3-I4-RETRY2-RESTORE-PROOF-EVIDENCE.md`
7. `RSM-3-I4-RETRY2-OBSERVED-COMMAND-MANIFEST.tsv`
8. `RSM-3-I4-RETRY2-READINESS-REPORT.md`

Do not overwrite prior EXEC1/RETRY1/FIX evidence.

---

# 17. Bootstrap mutation guard

Authorized pre-existing bootstrap mutations on full success:

```text
Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Authorized new source:

`Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md`

Authorized new outputs:

the exact eight outputs above.

No other bootstrap mutation is authorized.

---

# 18. Canonical repository final guard

At successful task end require:

```text
HEAD = FIX2_HEAD
parent = e50cadca387b992f6a5648237fe0c006ef72a6fa
commit count = 5
tree files = 141
branch = main
origin/main = FIX2_HEAD
upstream = origin/main
working tree/index = CLEAN
unexpected untracked = 0
```

---

# 19. Final decision

`RSM-3-I4-RETRY2-READINESS-REPORT.md` must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I4 RETRY2 REVIEW`

or

`BLOCKED — RSM-3-I4-FIX2-COMMIT1-RETRY2 MATERIAL FAILURE`

Do not close I4.

Do not authorize V1.

Do not start RSM-4.

---

# 20. Success condition

The task succeeds when the independently accepted one-file EOL policy is committed and pushed, passes real GitHub-hosted CI, and a brand-new Windows clone proves the original CRLF failure is eliminated under the machine's natural Git configuration; then the accepted baseline is backed up, externally verified, restored in isolation, and documented from physically observed commands.
