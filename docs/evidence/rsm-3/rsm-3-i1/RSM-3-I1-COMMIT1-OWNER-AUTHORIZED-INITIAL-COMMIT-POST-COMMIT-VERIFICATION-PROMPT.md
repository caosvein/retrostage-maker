# RetroStage Maker — RSM-3-I1 Owner-Authorized Initial Commit / Post-Commit Verification

## 1. Task Identity

**Milestone:**  
`RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`

**Task:**  
`RSM-3-I1-COMMIT1 — Owner-Authorized Initial Commit / Post-Commit Verification`

**Task type:**  
`CONTROLLED COMMIT / POST-COMMIT VERIFICATION`

**Primary executor:**  
`Codex`

This task is authorized only after the independent review:

`RSM-3-I1 INDEPENDENT REVIEW — PASS / INITIAL COMMIT CANDIDATE ACCEPTED`

This task does NOT authorize:

- push;
- I2 implementation;
- dependency installation;
- source expansion;
- product code;
- source 07 creation.

---

# 2. Mandatory Inputs

Before any mutation, fully read and verify:

- `RSM-3-I1-SOURCE-IMPORT-MANIFEST.tsv`
- `RSM-3-I1-REPOSITORY-CREATION-AND-REMOTE-EVIDENCE.md`
- `RSM-3-I1-REPOSITORY-STATE-REPORT.md`
- `RSM-3-I1-INITIAL-COMMIT-CANDIDATE-REPORT.md`
- `RSM-3-I1-CHATGPT-INDEPENDENT-INITIAL-COMMIT-CANDIDATE-REVIEW.md`

Required independent-review SHA-256:

`4B3375F2BED271C88BCB868F840091FAB4BBE651C3EE72478F28D328733CAF68`

Required review decision:

`RSM-3-I1 INDEPENDENT REVIEW — PASS / INITIAL COMMIT CANDIDATE ACCEPTED`

If either differs:

STOP:

`BLOCKED — I1 COMMIT AUTHORITY INVALID`

---

# 3. Owner Authorization

The project owner authorizes creation of exactly one local initial commit from the already reviewed staged candidate.

Owner authorization applies only to the exact reviewed 76-file staged snapshot.

No staging expansion is authorized.

No push is authorized.

---

# 4. Repository Baseline Recheck

Repository:

`C:\RetroStage\retrostage-maker`

Before committing, verify:

```text
branch = main
HEAD = unborn / none
commit count = 0
origin = https://github.com/caosvein/retrostage-maker.git
staged files = 76
staged outside docs/ = 0
unstaged files = 0
untracked files = 0
```

Re-run:

```powershell
git status --short --untracked-files=all
git status --porcelain=v2 --untracked-files=all
git diff --cached --name-status
git diff --cached --stat
git diff --cached --check
git diff --name-status
git ls-files --others --exclude-standard
git branch --show-current
git remote -v
git config --local --get user.name
git config --local --get user.email
```

The exact staged path set must still equal the 76 repository-relative paths in:

`RSM-3-I1-SOURCE-IMPORT-MANIFEST.tsv`

If any staged path, hash, unstaged file, untracked file, branch, or remote differs materially:

STOP:

`BLOCKED — INITIAL COMMIT CANDIDATE DRIFT`

Do not repair or restage automatically.

---

# 5. Staged Blob Identity Recheck

For all 76 staged paths:

- compare current working-tree bytes to manifest `repository_sha256`;
- compare staged Git blob bytes to the same accepted identity;
- require mismatch count = `0`.

Do not normalize or rewrite files.

Required:

`WORKTREE_MANIFEST_MISMATCH_COUNT = 0`

`STAGED_BLOB_MANIFEST_MISMATCH_COUNT = 0`

---

# 6. Commit

If and only if all rechecks pass, create exactly one commit.

Commit subject:

`bootstrap: establish governed reboot source baseline`

Do not add a commit body unless Git tooling requires one.

Execute:

```powershell
git commit -m "bootstrap: establish governed reboot source baseline"
```

Do NOT amend.

Do NOT create a second commit.

Do NOT push.

---

# 7. Immediate Post-Commit Verification

After commit, capture:

```powershell
git rev-parse HEAD
git log -1 --format="%H%n%P%n%an%n%ae%n%s"
git status --short --untracked-files=all
git status --porcelain=v2 --untracked-files=all
git diff --name-status HEAD
git diff --cached --name-status
git ls-files --others --exclude-standard
git branch --show-current
git remote -v
git rev-list --count HEAD
git show --stat --oneline --summary HEAD
git ls-tree -r --name-only HEAD
```

Required:

```text
commit count = 1
parent count = 0
branch = main
working tree clean = TRUE
staged changes = 0
unstaged changes = 0
untracked files = 0
HEAD tree files = 76
remote refs remain 0
push performed = FALSE
```

The commit must be a root commit.

---

# 8. Committed Tree Verification

Compare all 76 committed tree paths against the reviewed manifest.

Required:

- committed tree path count = `76`;
- manifest path count = `76`;
- path-set difference = `0`;
- committed blob / accepted repository hash mismatch = `0`.

No unexpected file may enter HEAD.

No reviewed file may be omitted.

---

# 9. Forbidden Scope

Do NOT:

- run `git push`;
- create upstream tracking;
- fetch/merge unrelated state;
- add or remove files;
- edit repository files;
- edit bootstrap sources/evidence;
- run package installation;
- create `package.json`;
- create pnpm workspace or lockfile;
- create `.github`;
- create `packages/`;
- create `tooling/`;
- create product code;
- create reboot source 07;
- authorize or begin I2.

---

# 10. Bootstrap Workspace Mutation Guard

Before commit task execution, hash all pre-existing files in:

`C:\RetroStage\bootstrap\RSM-3-A`

After the commit and creation of the two allowed COMMIT1 outputs below, verify:

`UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0`

No existing bootstrap file may change.

---

# 11. Required Outputs

Create exactly TWO new outputs under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

## Output 1

`RSM-3-I1-COMMIT1-POST-COMMIT-EVIDENCE.md`

Record:

- pre-commit HEAD state;
- exact pre-commit staged count;
- staged path/hash recheck;
- exact commit command;
- resulting HEAD SHA-256 Git commit ID;
- parent count;
- author name/email;
- subject;
- committed path count;
- committed path/hash comparison;
- post-commit working-tree state;
- remote refs;
- confirmation push was not performed.

## Output 2

`RSM-3-I1-COMMIT1-READINESS-REPORT.md`

Must state:

- independent review identity verified;
- exact reviewed candidate unchanged before commit;
- root commit created once;
- exact HEAD;
- 76/76 files committed;
- committed mismatch count;
- unexpected committed file count;
- missing committed file count;
- post-commit working tree clean;
- bootstrap unauthorized mutation count;
- push not performed;
- I2 not authorized.

---

# 12. Final Decision

The readiness report must end with exactly one:

`READY FOR INDEPENDENT RSM-3-I1 POST-COMMIT REVIEW`

or

`BLOCKED — RSM-3-I1 COMMIT MATERIAL FAILURE`

Do not declare I1 closed.

Do not authorize I2.

Do not push.

Do not create a FIX prompt.

---

# 13. Success Condition

This task succeeds when the exact independently reviewed 76-file staged candidate becomes one clean local root commit, with no extra files, no missing files, no changed bytes, and no remote mutation.

The next control after success is an independent post-commit review.
