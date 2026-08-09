# RetroStage Maker — RSM-3-I1-ALIGN1 Current-State Alignment / RSM-3-I2 Activation

## 1. Task Identity

**Task:**  
`RSM-3-I1-ALIGN1 — Current-State Alignment / RSM-3-I2 Activation`

**Parent milestone:**  
`RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`

**Completed slice:**  
`RSM-3-I1 — Local Git Repository / Source Import / Initial Commit Candidate`

**Next slice:**  
`RSM-3-I2 — pnpm Workspace / Toolchain / Quality Scripts`

**Task type:**  
`POST-CLOSURE SOURCE ALIGNMENT / NEXT-TASK ACTIVATION`

**Primary executor:**  
`Codex`

This task updates the live control sources after accepted I1 closure.

It does NOT implement I2.

---

# 2. Entry Authority

Before any write, fully read and verify:

- `RSM-3-I1-COMMIT1-POST-COMMIT-EVIDENCE.md`
- `RSM-3-I1-COMMIT1-READINESS-REPORT.md`
- `RSM-3-I1-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
- current `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- current `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

Required independent closure-review decision:

`RSM-3-I1 CLOSED / RSM-3-I2 ALIGNMENT ELIGIBLE`

If not exact:

STOP:

`BLOCKED — I1 CLOSURE AUTHORITY INVALID`

---

# 3. Exact Accepted Physical Repository Baseline

The current live repository truth to be represented is:

```text
Repository = C:\RetroStage\retrostage-maker
Git repository = TRUE
Branch = main
HEAD = 6d67b19f136cdd0a36ae11a861f4ba8b0addd196
Commit count = 1
HEAD parent count = 0
HEAD tree file count = 76
Working tree = CLEAN
Staged changes = 0
Unstaged changes = 0
Untracked files = 0
Origin = https://github.com/caosvein/retrostage-maker.git
Remote refs = 0
Upstream tracking = ABSENT
Push = NOT PERFORMED
Lockfile = NONE
Installed project dependency graph = NONE
CI = NONE
Build = NONE
Clean clone proof = NONE
Restore proof = NONE
Product implementation = NONE
Reboot source 07 = ABSENT / DEFERRED
```

Before using these values for alignment, inspect the physical repository and confirm that they remain true.

At minimum run:

```powershell
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD
git -C "C:\RetroStage\retrostage-maker" rev-list --count HEAD
git -C "C:\RetroStage\retrostage-maker" branch --show-current
git -C "C:\RetroStage\retrostage-maker" status --short --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" status --porcelain=v2 --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" remote -v
git -C "C:\RetroStage\retrostage-maker" ls-remote origin
git -C "C:\RetroStage\retrostage-maker" ls-tree -r --name-only HEAD
```

If the repository has materially drifted:

STOP:

`BLOCKED — POST-I1 REPOSITORY DRIFT`

Do not repair automatically.

---

# 4. Allowed Existing-Source Mutations

Only these two pre-existing live source files may change:

1. `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
2. `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

Do NOT modify source 09.

Do NOT modify 00, 01, 03, 04, 05, or 06.

Do NOT edit RECOVERY1, TERM1, D-ALIGN1, I1 execution evidence, or independent reviews.

Do NOT modify repository files during this task.

---

# 5. Source 02 Alignment Requirements

Update `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` to truthfully state:

- Gate A remains current.
- RSM-2 remains closed.
- RSM-3 remains current.
- RSM-3-A accepted.
- RSM-3-B accepted.
- RSM-3-C accepted.
- RSM-3-D terminally accepted.
- RSM-3-I1 closed.
- RSM-3-I2 is the one current authorized next task.
- Canonical repository physically exists at:
  `C:\RetroStage\retrostage-maker`.
- Primary branch is `main`.
- Current physical HEAD is:
  `6d67b19f136cdd0a36ae11a861f4ba8b0addd196`.
- HEAD is the one accepted root commit from I1.
- Working tree is clean at the I1 closure baseline.
- Origin is:
  `https://github.com/caosvein/retrostage-maker.git`.
- Remote refs remain `0`.
- No push has occurred.
- No upstream tracking exists.
- No project dependency graph, package-manager lockfile, CI, build, clean-clone proof, restore proof, or product implementation exists yet.
- Reboot source 07 remains intentionally deferred.
- The nine historical pre-loss identities remain governed as:
  `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE`.

The current-state source must no longer describe the project as pre-repository.

Do not claim I2 implementation has already occurred.

---

# 6. Source 08 Alignment Requirements

Update `08_RSM_REBOOT_CURRENT_MILESTONE.md` so that:

**Current milestone:**

`RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`

**Current task:**

`RSM-3-I2 — pnpm Workspace / Toolchain / Quality Scripts`

**Task state:**

`AUTHORIZED / READY FOR EXECUTION`

Record phase state:

- A: accepted
- B: accepted
- C: accepted
- D: terminally accepted
- I1: closed
- I2: authorized / ready
- I3: blocked on I2
- I4: blocked on I3 and its own entry controls
- V1: blocked
- CLOSE1: blocked
- RSM-4: blocked until RSM-3 closure

Update current physical truth to include:

```text
Repository: PRESENT
Repository path: C:\RetroStage\retrostage-maker
Branch: main
HEAD: 6d67b19f136cdd0a36ae11a861f4ba8b0addd196
Commit count: 1
Working tree: CLEAN
Origin: https://github.com/caosvein/retrostage-maker.git
Remote refs: 0
Push: NONE
Upstream: NONE
Lockfile: NONE
Dependencies: NONE
CI: NONE
Build: NONE
Clean clone: NONE
Restore proof: NONE
Product implementation: NONE
```

Keep the controlled remaining sequence:

`I2 → I3 → I4 → V1 → CLOSE1`

Preserve the product dependency gates:

- Electron / Forge / Vite not before RSM-5.
- Babylon.js not before RSM-6.
- React editor UI not before RSM-9.
- TypeBox/Ajv not before RSM-11.

RSM-3-I2 may admit only the repository/toolchain/quality dependencies already assigned to RSM-3 by governing authority.

---

# 7. Repository Source-Copy Rule

Do NOT update:

`C:\RetroStage\retrostage-maker\docs\sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`

or:

`C:\RetroStage\retrostage-maker\docs\sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

during ALIGN1.

Reason:

The I1 root commit is an immutable accepted baseline.

The new live bootstrap-source identities will be synchronized into the repository as an explicit, traceable delta at the beginning of RSM-3-I2 and will be included in the later reviewed I2 commit candidate.

Therefore ALIGN1 must leave the Git working tree clean.

---

# 8. Required Outputs

Create exactly TWO new outputs under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

## Output 1

`RSM-3-I1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`

Exactly two data rows.

Columns:

```text
source
pre_align_sha256
post_align_sha256
change_reason
authority_result
```

Rows:

- `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `08_RSM_REBOOT_CURRENT_MILESTONE.md`

`authority_result` must be:

`ALIGNED_CURRENT_AUTHORITY`

---

## Output 2

`RSM-3-I1-ALIGN1-I2-ACTIVATION-REPORT.md`

Must record:

- independent I1 closure authority verified;
- physical repository baseline independently rechecked;
- exact root HEAD;
- exact branch;
- exact origin;
- exact clean working-tree state;
- exact remote-ref state;
- 02 pre/post hashes;
- 08 pre/post hashes;
- only 02 and 08 changed;
- repository files changed: `0`;
- Git working tree remained clean;
- no push occurred;
- no dependencies installed;
- no I2 files created;
- reboot source 07 remains deferred;
- I2 is authorized but not executed.

---

# 9. Mutation Guard

Before modification:

hash every pre-existing file in:

`C:\RetroStage\bootstrap\RSM-3-A`

After the task:

Required:

```text
AUTHORIZED_PRE_EXISTING_MUTATION_COUNT = 2
UNAUTHORIZED_PRE_EXISTING_MUTATION_COUNT = 0
MISSING_PRE_EXISTING_FILE_COUNT = 0
EXPECTED_NEW_ALIGN1_OUTPUT_COUNT = 2
UNEXPECTED_NEW_FILE_COUNT = 0
```

The only changed existing files must be 02 and 08.

The only new bootstrap files must be the two ALIGN1 outputs.

---

# 10. Repository Mutation Guard

Hash/inspect the repository state before and after ALIGN1.

Required:

```text
HEAD_BEFORE = 6d67b19f136cdd0a36ae11a861f4ba8b0addd196
HEAD_AFTER = 6d67b19f136cdd0a36ae11a861f4ba8b0addd196
REPOSITORY_FILE_MUTATION_COUNT = 0
STAGED_CHANGE_COUNT = 0
UNSTAGED_CHANGE_COUNT = 0
UNTRACKED_FILE_COUNT = 0
COMMIT_COUNT = 1
PUSH_PERFORMED = FALSE
```

If repository state changes:

STOP:

`BLOCKED — ALIGN1 REPOSITORY MUTATION`

---

# 11. Forbidden Actions

Do NOT:

- modify repository contents;
- stage files;
- create a commit;
- push;
- create upstream tracking;
- create `package.json`;
- create `pnpm-workspace.yaml`;
- create `pnpm-lock.yaml`;
- run `pnpm install`;
- install TypeScript or any package;
- create `packages/`;
- create `tooling/`;
- create `.github/`;
- create CI;
- create source 07;
- implement I2;
- begin product implementation.

---

# 12. Final Decision

The activation report must end with exactly one:

`RSM-3-I2 AUTHORIZED / READY FOR EXECUTION`

or

`BLOCKED — I1 ALIGNMENT MATERIAL FAILURE`

Do not claim I2 was executed.

Do not create a FIX prompt.

---

# 13. Success Condition

This task succeeds when:

1. I1 closure is reflected truthfully in live sources;
2. current physical repository truth is represented exactly;
3. the I1 root commit remains untouched;
4. the Git working tree remains clean;
5. 02 and 08 are the only aligned sources;
6. I2 becomes the single authorized next task.

After success, the next task is the actual:

`RSM-3-I2 — pnpm Workspace / Toolchain / Quality Scripts`

implementation.
