# RetroStage Maker — RSM-3-I3-PRE1-ALIGN1 Security-Baseline Current-State Alignment / Full I3 Resume Authorization

## 1. Task Identity

**Task:**  
`RSM-3-I3-PRE1-ALIGN1 — Security-Baseline Current-State Alignment / Full I3 Resume Authorization`

**Parent milestone:**  
`RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`

**Current phase:**  
`RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline`

**Completed subtask:**  
`RSM-3-I3-PRE1 — Security and Exact-License Baseline Remediation`

**Task type:**  
`POST-SECURITY-COMMIT SOURCE ALIGNMENT / FULL I3 RESUME AUTHORIZATION`

**Primary executor:**  
`Codex`

This task updates live project-control truth after the accepted PRE1 security commit.

It does NOT implement CI, SBOM, notices, compliance tooling, or GitHub workflows.

---

# 2. Entry Authority

Before any write, fully read and verify:

- `RSM-3-I3-PRE1-COMMIT1-POST-COMMIT-EVIDENCE.md`
- `RSM-3-I3-PRE1-COMMIT1-READINESS-REPORT.md`
- `RSM-3-I3-PRE1-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
- `RSM-3-I3-PRE1-OWNER-SECURITY-AND-LICENSE-DECISION-LOCK.md`
- current `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- current `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

Required independent decision:

`RSM-3-I3-PRE1 CLOSED / RSM-3-I3 CURRENT-STATE ALIGNMENT REQUIRED BEFORE RESUME`

If not exact:

STOP:

`BLOCKED — PRE1 CLOSURE AUTHORITY INVALID`

---

# 3. Exact Accepted Physical Repository Baseline

Required live repository truth:

```text
Repository = C:\RetroStage\retrostage-maker
Git repository = TRUE
Branch = main
HEAD = 5c7ff6322ba2583176065a919db385d51b650fba
Parent = 302538e3692ed82daa969bceed0a63945736fc5f
Commit count = 3
HEAD tree file count = 105
Working tree = CLEAN
Staged changes = 0
Unstaged changes = 0
Unexpected untracked non-ignored files = 0
Origin = https://github.com/caosvein/retrostage-maker.git
Remote refs = 0
Upstream tracking = ABSENT
Push = NOT PERFORMED
Direct dev dependency count = 7
Vitest = 3.2.6
Product dependencies = NONE
Product implementation = NONE
CI = NONE
SBOM = NONE
Third-party notices = NONE
```

Before alignment, recheck the repository physically.

At minimum:

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

If the repository materially differs:

STOP:

`BLOCKED — POST-PRE1 REPOSITORY DRIFT`

Do not repair automatically.

---

# 4. Allowed Existing-Source Mutations

Only:

1. `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
2. `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`

may change.

Do NOT modify source 09 or sources 00/01/03/04/05/06.

Do NOT modify repository files.

Do NOT modify prior PRE1/I3 evidence, prompts, reviews, or decision locks.

---

# 5. Source 02 Requirements

Update source 02 so it truthfully records:

- Gate A remains current.
- RSM-2 remains closed.
- RSM-3 remains current.
- RSM-3-A/B/C accepted.
- RSM-3-D terminally accepted.
- RSM-3-I1 closed.
- RSM-3-I2 closed.
- RSM-3-I3 remains the current active/authorized task.
- RSM-3-I3-PRE1 is closed.
- Full I3 implementation is authorized to resume only after this alignment succeeds.
- Repository path:
  `C:\RetroStage\retrostage-maker`.
- Branch:
  `main`.
- Current HEAD:
  `5c7ff6322ba2583176065a919db385d51b650fba`.
- Current HEAD parent:
  `302538e3692ed82daa969bceed0a63945736fc5f`.
- Commit count:
  `3`.
- HEAD tree files:
  `105`.
- Working tree:
  `CLEAN`.
- Remote refs:
  `0`.
- Push:
  `NOT PERFORMED`.
- Direct dev dependencies:
  `7`.
- Vitest direct identity:
  `3.2.6`.
- Critical Vitest advisory remediation:
  `COMMITTED / PRE1 CLOSED`.
- Exact owner-approved license decisions remain limited to:
  `argparse@2.0.1 / Python-2.0`
  and
  `minimatch@10.2.6 / BlueOak-1.0.0`
  if those exact identities remain present.
- Open non-blocking security finding:
  `GHSA-xffm-g5w8-qvg7 / @eslint/plugin-kit@0.2.8 / low`
  must be carried into full I3 evidence.
- CI, SBOM, notices, clean-clone proof, restore proof, and product implementation still do not exist.
- Reboot source 07 remains deferred.
- historical-loss governance remains unchanged.

Do not claim I3 implementation has already resumed.

---

# 6. Source 08 Requirements

Keep:

**Current milestone:**

`RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`

Set:

**Current task:**

`RSM-3-I3 — CI / Dependency Review / SBOM / Third-Party Notices`

**Task state:**

`AUTHORIZED / READY TO RESUME IMPLEMENTATION`

Record phase/subtask state:

- A: accepted
- B: accepted
- C: accepted
- D: terminally accepted
- I1: closed
- I2: closed
- I3-PRE1: closed
- I3: authorized / ready to resume
- I4: blocked on I3
- V1: blocked
- CLOSE1: blocked
- RSM-4: blocked until RSM-3 closure

Current physical truth must include:

```text
Repository: PRESENT
Repository path: C:\RetroStage\retrostage-maker
Branch: main
HEAD: 5c7ff6322ba2583176065a919db385d51b650fba
Parent: 302538e3692ed82daa969bceed0a63945736fc5f
Commit count: 3
HEAD tree files: 105
Working tree: CLEAN
Origin: https://github.com/caosvein/retrostage-maker.git
Remote refs: 0
Push: NONE
Upstream: NONE
Direct dev dependencies: 7 exact
Vitest: 3.2.6
Critical Vitest remediation: COMMITTED
CI: NONE
SBOM: NONE
Third-party notices: NONE
Clean clone: NONE
Restore proof: NONE
Product implementation: NONE
```

Record the open non-blocking low advisory carry-forward.

Keep remaining sequence:

`I3 → I4 → V1 → CLOSE1`

Do not authorize I4.

---

# 7. Repository Copy Rule

Do NOT update repository copies of source 02/08 in this alignment.

The security commit is an immutable accepted physical baseline.

The new post-PRE1 live-source delta will be synchronized into the repository during resumed I3 implementation and included in its later reviewed staged candidate.

Git worktree must remain clean during ALIGN1.

---

# 8. Required Outputs

Create exactly TWO new outputs under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

## Output 1

`RSM-3-I3-PRE1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`

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

`authority_result`:

`ALIGNED_CURRENT_AUTHORITY`

## Output 2

`RSM-3-I3-PRE1-ALIGN1-I3-RESUME-ACTIVATION-REPORT.md`

Must record:

- PRE1 independent closure authority verified;
- physical repository baseline rechecked;
- exact HEAD/parent/branch/commit count/tree count;
- exact clean worktree;
- exact remote state;
- exact Vitest 3.2.6 committed state;
- critical advisory remediation committed;
- open low advisory carry-forward;
- exact owner-approved license identities;
- 02 pre/post hashes;
- 08 pre/post hashes;
- only 02/08 changed;
- repository mutation count = 0;
- push = false;
- CI/SBOM/notices still absent;
- full I3 authorized to resume but not executed in this task.

---

# 9. Bootstrap Mutation Guard

Before modification hash every pre-existing file under:

`C:\RetroStage\bootstrap\RSM-3-A`

After task require:

```text
AUTHORIZED_PRE_EXISTING_MUTATION_COUNT = 2
UNAUTHORIZED_PRE_EXISTING_MUTATION_COUNT = 0
MISSING_PRE_EXISTING_FILE_COUNT = 0
EXPECTED_NEW_ALIGN1_OUTPUT_COUNT = 2
UNEXPECTED_NEW_FILE_COUNT = 0
```

---

# 10. Repository Mutation Guard

Require:

```text
HEAD_BEFORE = 5c7ff6322ba2583176065a919db385d51b650fba
HEAD_AFTER = 5c7ff6322ba2583176065a919db385d51b650fba
COMMIT_COUNT = 3
REPOSITORY_FILE_MUTATION_COUNT = 0
STAGED_CHANGE_COUNT = 0
UNSTAGED_CHANGE_COUNT = 0
UNEXPECTED_UNTRACKED_NON_IGNORED_COUNT = 0
PUSH_PERFORMED = FALSE
REMOTE_REF_COUNT = 0
```

If repository changes:

STOP:

`BLOCKED — PRE1 ALIGN1 REPOSITORY MUTATION`

---

# 11. Forbidden Actions

Do NOT:

- modify repository files;
- stage;
- commit;
- push;
- install/upgrade dependencies;
- change lockfile;
- remediate the low advisory;
- create `.github`;
- generate SBOM/notices;
- implement I3;
- create source 07;
- authorize I4.

---

# 12. Final Decision

The resume activation report must end with exactly one:

`RSM-3-I3 AUTHORIZED / READY TO RESUME IMPLEMENTATION`

or

`BLOCKED — PRE1 ALIGNMENT MATERIAL FAILURE`

Do not claim I3 was executed by ALIGN1.

Do not create a FIX prompt.

---

# 13. Success Condition

ALIGN1 succeeds when:

1. source 02/08 truthfully represent the committed PRE1 security baseline;
2. PRE1 is closed;
3. I3 remains the single current task;
4. full I3 implementation is explicitly authorized to resume;
5. the new security HEAD remains untouched;
6. only 02/08 are mutated;
7. no commit or push occurs.

After success, a revised full RSM-3-I3 implementation prompt must consume the new live source hashes and the PRE1 decision/closure lineage.
