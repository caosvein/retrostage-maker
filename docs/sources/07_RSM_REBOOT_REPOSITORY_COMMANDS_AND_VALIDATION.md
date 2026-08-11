# RetroStage Maker — Repository Commands and Validation

**Document ID:** `07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION`  
**Role:** Authoritative operating command and validation source derived from physical RSM-3-I4 execution  
**Project:** RetroStage Maker  
**Observation date:** 2026-08-10  
**Timezone:** Europe/Istanbul  
**State:** `AUTHORITATIVE REPOSITORY COMMAND SOURCE / RSM-3 CLOSED / PRODUCT STRATEGY PASS / RSM-4 BASELINE INPUT`

---

## 1. Scope

This source records commands and operations physically executed during the accepted-candidate FIX2 commit and the RSM-3-I4 RETRY2 physical proof. It covers repository identity, ordinary push, GitHub-hosted CI, fresh Windows clone, LF checkout verification, frozen install, validation, local and external backup, manifest verification, and isolated restore.

It does not close RSM-3-I4, authorize RSM-3-V1, start RSM-4, or authorize product implementation.

BitLocker is not required for RSM-3. External encryption remains:

`DEFERRED_OPERATIONAL_HARDENING / NON_BLOCKING`

The accepted generation is an unencrypted owner-controlled secondary backup. Secrets remain excluded.

---

## 2. Fail-Closed Execution Order

The physically observed order was:

1. verify independent candidate authority and exact staged patch;
2. verify the canonical repository and remote baseline;
3. commit exactly the accepted one-file candidate;
4. push normally to `origin/main`;
5. observe the natural push-triggered GitHub-hosted CI run;
6. clone into a brand-new target;
7. prove LF checkout behavior before install;
8. run frozen install and full clean-clone validation;
9. create and verify a governed local backup;
10. recheck selected external-device identity, secret scope, and capacity;
11. create and verify a new external generation;
12. restore only from the completed external generation;
13. validate the isolated restore; and
14. align live sources and produce evidence.

No later step is eligible after a failed earlier gate.

---

## 3. Canonical Repository Baseline and Candidate Identity

Observed repository:

`C:\RetroStage\retrostage-maker`

Observed commands:

```powershell
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD
git -C "C:\RetroStage\retrostage-maker" branch --show-current
git -C "C:\RetroStage\retrostage-maker" rev-list --count HEAD
git -C "C:\RetroStage\retrostage-maker" status --porcelain=v1 --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" rev-parse refs/remotes/origin/main
git -C "C:\RetroStage\retrostage-maker" rev-parse --abbrev-ref --symbolic-full-name "@{u}"
git -C "C:\RetroStage\retrostage-maker" diff --cached --no-ext-diff --full-index --binary
git -C "C:\RetroStage\retrostage-maker" ls-files -s -- .gitattributes
```

Accepted pre-commit identity:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
commit count = 4
origin/main = e50cadca387b992f6a5648237fe0c006ef72a6fa
upstream = origin/main
staged delta = A .gitattributes
staged blob = 121165e90372b847cd907d3d236253b759097896
staged patch SHA-256 = FB505B4902C5E863261485670DC0A33D031338074A1C86B5BF5109AE42CECC8D
```

---

## 4. Exact Commit and Remote Push

Observed commit:

```powershell
git -C "C:\RetroStage\retrostage-maker" commit -m "bootstrap: enforce portable lf checkout policy"
```

Observed post-commit checks:

```powershell
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD^
git -C "C:\RetroStage\retrostage-maker" log -1 --format=%s
git -C "C:\RetroStage\retrostage-maker" diff-tree --no-commit-id --name-status -r HEAD
git -C "C:\RetroStage\retrostage-maker" ls-tree -r --name-only HEAD
git -C "C:\RetroStage\retrostage-maker" status --porcelain=v1 --untracked-files=all
```

Accepted commit:

```text
FIX2_HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
parent = e50cadca387b992f6a5648237fe0c006ef72a6fa
subject = bootstrap: enforce portable lf checkout policy
delta = A .gitattributes
commit count = 5
tree files = 141
```

Observed normal push and verification:

```powershell
git -C "C:\RetroStage\retrostage-maker" push origin main
git -C "C:\RetroStage\retrostage-maker" ls-remote --heads origin main
git -C "C:\RetroStage\retrostage-maker" rev-parse refs/remotes/origin/main
git -C "C:\RetroStage\retrostage-maker" rev-parse --abbrev-ref --symbolic-full-name "@{u}"
```

Force push was not used.

---

## 5. GitHub-Hosted CI

Observed commands:

```powershell
gh run list -R caosvein/retrostage-maker --commit f9404ec83436cb739e9363ccc3791517a3ddefb9 --event push --limit 20 --json databaseId,workflowName,headSha,headBranch,event,status,conclusion,url,createdAt,updatedAt
gh run watch 31342080945 -R caosvein/retrostage-maker --exit-status --interval 5
gh run view 31342080945 -R caosvein/retrostage-maker --json databaseId,workflowName,headSha,headBranch,event,status,conclusion,url,createdAt,updatedAt,jobs
```

Observed result:

```text
run ID = 31342080945
workflow = CI
job ID = 93317410502
head SHA = f9404ec83436cb739e9363ccc3791517a3ddefb9
head branch = main
event = push
status = completed
conclusion = success
```

No duplicate manual dispatch was performed.

---

## 6. Fresh Windows Clone and LF Proof

Observed clone:

```powershell
git clone "https://github.com/caosvein/retrostage-maker.git" "D:\RSM-Validation\clean-clone-retry2"
```

Before changing any clone-local setting, these commands were observed:

```powershell
git -C "D:\RSM-Validation\clean-clone-retry2" config --get core.autocrlf
git -C "D:\RSM-Validation\clean-clone-retry2" config --show-origin --get core.autocrlf
git -C "D:\RSM-Validation\clean-clone-retry2" rev-parse HEAD
git -C "D:\RSM-Validation\clean-clone-retry2" branch --show-current
git -C "D:\RSM-Validation\clean-clone-retry2" remote get-url origin
git -C "D:\RSM-Validation\clean-clone-retry2" status --porcelain=v1 --untracked-files=all
```

Natural configuration:

`core.autocrlf=true`

No clone-local override was applied.

Observed EOL commands:

```powershell
git -C "D:\RSM-Validation\clean-clone-retry2" ls-files --eol
git -C "D:\RSM-Validation\clean-clone-retry2" check-attr text eol -- .
git -C "D:\RSM-Validation\clean-clone-retry2" check-attr text eol -- <path>
```

The exact 18 previously failing formatting paths produced:

```text
index EOL = lf: 18/18
worktree EOL = lf: 18/18
effective text = auto: 18/18
effective eol = lf: 18/18
physical CR bytes = 0: 18/18
```

For all 103 protected `docs/evidence/**` and notice paths, the physical no-filter blob matched the index blob. Historical evidence and notices were not rewritten.

---

## 7. Frozen Install and Validation

Observed clean-clone commands:

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

Observed results:

```text
frozen install = PASS
11/11 validation commands = PASS
tests = 34 PASS
dependency violations = 0
compliance = PASS
security blockers = 0
known low advisory = 1 / visible / non-blocking
pnpm-lock.yaml drift = 0
tracked worktree drift = 0
HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
```

Never run a formatter in write mode as part of validation.

---

## 8. Governed Local Backup

Observed governed scope construction:

```powershell
git -C "C:\RetroStage\retrostage-maker" ls-files
Get-ChildItem -LiteralPath "C:\RetroStage\retrostage-maker\.git" -Recurse -File
Get-FileHash -Algorithm SHA256 -LiteralPath <governed-file>
Copy-Item -LiteralPath <source-governed-file> -Destination <local-backup-path>
```

Target:

`D:\RSM-Backup\retrostage-maker`

Observed result:

```text
governed files = 179
governed raw bytes = 4,025,576
missing = 0
extra = 0
size mismatch = 0
SHA-256 mismatch = 0
backup HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
backup branch = main
backup status = clean
```

Untracked `node_modules`, build output, caches, logs, temporary files, and secret-bearing local state are outside the governed scope.

---

## 9. Selected External Device and Capacity

Observed read-only identity commands:

```powershell
Get-CimInstance Win32_Volume
Get-Partition -DriveLetter F
Get-Disk
Get-CimInstance Win32_DiskDrive
```

Stable accepted identity:

```text
Volume GUID = \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
Model = Seagate Backup+ Hub BK SCSI Disk Device
Serial = NA9RMHEH
UniqueId = 5000000000000001
Filesystem = NTFS
```

Capacity formula:

```text
E = max(ceil(G * 1.25), G + 16,777,216)
G = 4,025,576
E = 20,802,792
T = 14,000,383,324,160
F = 13,999,847,215,104
projected free = 13,999,826,412,312
20% minimum free = 2,800,076,664,832
capacity gate = PASS
post-generation 20% gate = PASS
secret-scope blocker count = 0
```

BitLocker state was not changed.

---

## 10. External Generation and Verification

Observed generation path:

`F:\RSM-Offsite-Backup\retrostage-maker\generations\20260809T233850Z_f9404ec83436`

Observed mechanical operations:

```powershell
Copy-Item -LiteralPath <source-governed-file> -Destination <generation-payload-path>
Get-ChildItem -LiteralPath <generation-payload> -Recurse -File
Get-FileHash -Algorithm SHA256 -LiteralPath <payload-file>
Import-Csv -Delimiter "`t" -LiteralPath <manifest.tsv>
Get-FileHash -Algorithm SHA256 -LiteralPath <manifest.tsv>
Get-FileHash -Algorithm SHA256 -LiteralPath <generation.json>
```

Generation result:

```text
payload files = 179
payload raw bytes = 4,025,576
missing = 0
extra = 0
size mismatch = 0
SHA-256 mismatch = 0
manifest data rows = 179
manifest SHA-256 = D96F8F52DB5535C6E14FB08978FB1176AF077756FDCF051F606BFCDB5EF90494
generation.json SHA-256 = 52214E9F2BF99E06DF261CF4A232A59324FE54F5B04AD50C0789BD7900CEB71F
COMPLETE.sha256 SHA-256 = 8F200693DD979B20DB935D38BF0101A54DAF5DB0ACF3295C6D7C4FBB7D98E208
completion marker written last = TRUE
encryption state = UNENCRYPTED_OWNER_CONTROLLED
mechanism version = RSM-3-I4-v1
```

A generation is restore-eligible only when its marker, metadata, manifest, file count, sizes, and hashes all verify.

---

## 11. Isolated Restore

Restore source:

`20260809T233850Z_f9404ec83436`

Restore target:

`D:\RSM-Restore-Test`

Observed pre-restore and copy operations:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath <COMPLETE.sha256>
Get-FileHash -Algorithm SHA256 -LiteralPath <manifest.tsv>
Import-Csv -Delimiter "`t" -LiteralPath <manifest.tsv>
Get-ChildItem -LiteralPath <payload> -Recurse -File
Copy-Item -LiteralPath <verified-payload-file> -Destination <isolated-restore-path>
git -C "D:\RSM-Restore-Test" fsck --full
git -C "D:\RSM-Restore-Test" rev-parse HEAD
git -C "D:\RSM-Restore-Test" branch --show-current
git -C "D:\RSM-Restore-Test" status --porcelain=v1 --untracked-files=all
```

Observed restore validation:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd run validate
pnpm.cmd run build
pnpm.cmd run compliance:check
```

Observed result:

```text
source completion marker = PASS
source full manifest = PASS
restore missing/extra/size/hash mismatch = 0/0/0/0
Git fsck = PASS
HEAD/history identity = PASS
branch = main
frozen install = PASS
validate = PASS
build = PASS
compliance = PASS
lockfile drift = 0
tracked worktree drift = 0
```

The canonical repository was not overwritten.

---

## 12. Failure Rules

Stop before the next phase if any required identity, authority, patch, push, CI, clone, EOL, install, validation, source-cleanliness, secret-scope, capacity, copy, manifest, completion-marker, or restore gate fails.

Never:

- force-push the accepted branch;
- reuse or alter historical failed clone evidence;
- override natural clone-local `core.autocrlf` for the portability proof;
- accept a partial external generation;
- write `COMPLETE.sha256` before verification;
- restore from an incomplete or unverified generation;
- include credentials, tokens, private keys, recovery secrets, or untracked secret state;
- change BitLocker as part of RSM-3 RETRY2; or
- treat this operational source alone as I4 closure or V1 authorization.

---

`SOURCE 07 = AUTHORITATIVE REPOSITORY COMMAND SOURCE / RSM-3 CLOSED / PRODUCT STRATEGY PASS / RSM-4 BASELINE INPUT`
