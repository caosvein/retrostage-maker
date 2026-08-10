# RetroStage Maker — RSM-3-I4-SYNC1 Reviewed Source / Evidence Repository Synchronization Candidate

**Document ID:** `RSM-3-I4-SYNC1-REVIEWED-SOURCE-EVIDENCE-REPOSITORY-SYNCHRONIZATION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current phase:** `RSM-3-I4`  
**Task:** `RSM-3-I4-SYNC1`  
**Primary executor:** `Codex`  
**Mode:** `NARROW SOURCE/EVIDENCE SYNC / STAGED CANDIDATE / NO COMMIT / NO PUSH`

---

# 1. Entry authority

Fully read:

- `RSM-3-I4-RETRY2-CHATGPT-INDEPENDENT-PHYSICAL-REVIEW.md`
- all eight RETRY2/FIX2 physical outputs reviewed there;
- current live Source 02/07/08;
- current canonical repository copies of Source 02/08.

Required review decision:

`RSM-3-I4 RETRY2 INDEPENDENT REVIEW — PASS / PHYSICAL I4 GATES ACCEPTED / SOURCE 07 CONTENT ACCEPTED / REPOSITORY SYNC REQUIRED BEFORE I4 CLOSURE`

Required current live source identities before any edit:

```text
Source 02 = DBD4144AC86F20864D71A32C443CE78A596A5B878512C87C37BD97DEF685E3C5
Source 07 = 84A1BEF6F00F59A04D4851F8E436DC263D7242FECF289625E72D6686589CBD4B
Source 08 = 957AA368B9CA20236C0C6ED262885D00434944DB73AFCD4CC888103A4EA62525
```

---

# 2. Exact repository starting state

Canonical repository:

`C:\RetroStage\retrostage-maker`

Required:

```text
HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
parent = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
commit count = 5
HEAD tree files = 141
working tree/index = CLEAN
unexpected untracked non-ignored files = 0
origin/main = f9404ec83436cb739e9363ccc3791517a3ddefb9
upstream = origin/main
```

If drift exists:

`BLOCKED — RSM-3-I4-SYNC1 REPOSITORY BASELINE DRIFT`

Do not repair automatically.

---

# 3. Live-source disposition update

Modify only these live bootstrap sources:

```text
Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md
Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Do not change factual RETRY2 values.

Apply only the minimum review-state transition necessary to truthfully state:

```text
RETRY2 independent review = PASS
I4 physical gates = ACCEPTED
Source 07 operational content = INDEPENDENTLY ACCEPTED
repository source/evidence sync = CURRENT NEXT CONTROL / SYNC1
I4 = NOT YET CLOSED
V1 = NOT AUTHORIZED
RSM-4 = BLOCKED
```

For Source 07, replace the prior pending-review state with:

`INDEPENDENTLY ACCEPTED / PENDING REPOSITORY SYNC AND I4 CLOSURE`

Do not alter the physically observed command content except where an exact status sentence must change.

---

# 4. Source repository synchronization

Synchronize byte-identically after the live-source disposition update:

```text
bootstrap Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
-> docs/sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md

bootstrap Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md
-> docs/sources/07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md

bootstrap Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
-> docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Expected repository path effects:

```text
M docs/sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
A docs/sources/07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md
M docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md
```

No other `docs/sources/` path may change.

---

# 5. I4 evidence directory

Use:

`docs/evidence/rsm-3/rsm-3-i4/`

If absent, create it only as needed for files.

Retain byte-identically the current physically present I4 control lineage needed to explain:

- I4 activation;
- PRE1/PRE2 fail-closed readiness history;
- owner encryption non-blocking correction;
- GitHub workflow-scope correction;
- original EXEC1 failure;
- RETRY1 push/CI success plus clean-clone EOL failure;
- FIX1/FIX2 EOL correction lineage;
- independently accepted FIX2 staged candidate;
- FIX2 commit/push/CI;
- RETRY2 clean clone / EOL / validation;
- local/external backup;
- restore proof;
- observed command manifest;
- RETRY2 readiness;
- this independent RETRY2 review;
- this SYNC1 execution prompt.

At minimum, the following current terminal I4 artifacts MUST be included byte-identically:

```text
RSM-3-I4-OWNER-EXTERNAL-BACKUP-ENCRYPTION-NONBLOCKING-CORRECTION-LOCK.md
RSM-3-I4-OWNER-GITHUB-WORKFLOW-SCOPE-AUTHORIZATION-LOCK.md
RSM-3-I4-EXEC1-RETRY1-CHATGPT-INDEPENDENT-FAILURE-REVIEW-AND-EOL-CORRECTION-AUTHORIZATION.md
RSM-3-I4-FIX1-CHATGPT-INDEPENDENT-FAILURE-REVIEW-AND-BYTE-PRESERVATION-REFINEMENT.md
RSM-3-I4-FIX2-LF-CHECKOUT-POLICY-WITH-BYTE-PRESERVED-EVIDENCE-NOTICE-EXCEPTIONS-PROMPT.md
RSM-3-I4-FIX2-EOL-POLICY-AND-BYTE-PRESERVATION-EVIDENCE.tsv
RSM-3-I4-FIX2-VALIDATION-REPORT.md
RSM-3-I4-FIX2-STAGED-CANDIDATE-REPORT.md
RSM-3-I4-FIX2-EXACT-STAGED-PATCH.diff
RSM-3-I4-FIX2-CHATGPT-INDEPENDENT-STAGED-CONTENT-REVIEW.md
RSM-3-I4-FIX2-COMMIT1-RETRY2-COMMIT-PUSH-CI-CLEAN-CLONE-BACKUP-RESTORE-PROMPT.md
RSM-3-I4-FIX2-COMMIT1-POST-COMMIT-EVIDENCE.md
RSM-3-I4-FIX2-COMMIT1-PUSH-AND-CI-EVIDENCE.md
RSM-3-I4-RETRY2-CLEAN-CLONE-VALIDATION-EVIDENCE.md
RSM-3-I4-RETRY2-FRESH-CLEAN-CLONE-EOL-EVIDENCE.tsv
RSM-3-I4-RETRY2-LOCAL-AND-EXTERNAL-BACKUP-EVIDENCE.md
RSM-3-I4-RETRY2-RESTORE-PROOF-EVIDENCE.md
RSM-3-I4-RETRY2-OBSERVED-COMMAND-MANIFEST.tsv
RSM-3-I4-RETRY2-READINESS-REPORT.md
RSM-3-I4-RETRY2-CHATGPT-INDEPENDENT-PHYSICAL-REVIEW.md
RSM-3-I4-SYNC1-REVIEWED-SOURCE-EVIDENCE-REPOSITORY-SYNCHRONIZATION-PROMPT.md
```

Also retain earlier I4 PRE/failure artifacts if physically present and required for a complete non-synthetic lineage.

Do not reconstruct missing historical artifacts.

A valid physically present zero-byte failed-attempt patch must remain zero bytes.

Do not copy any file containing a secret.

---

# 6. Evidence exactness

For every synchronized evidence file record:

```text
source physical path
repository relative path
source SHA-256
repository SHA-256
byte size
classification
```

Required source/repository mismatch count:

`0`

Do not normalize historical evidence bytes.

The repository `.gitattributes` already protects:

`docs/evidence/** -text`

which must remain unchanged.

---

# 7. Repository delta classification

Every repository delta must classify as exactly one of:

```text
I4_LIVE_SOURCE_SYNC
I4_SOURCE07_ADDITION
I4_LINEAGE_EVIDENCE_SYNC
I4_REVIEW_RETENTION
I4_SYNC_EXECUTION_PROMPT_RETENTION
```

No product code/config/dependency/compliance artifact mutation is authorized.

`.gitattributes`, `package.json`, `pnpm-lock.yaml`, workflow files, tooling, packages, and compliance outputs must not change.

---

# 8. Stage candidate only

Stage only authorized source/evidence synchronization paths.

Do NOT commit.

Do NOT push.

Do NOT create a CI run.

Do NOT alter clean-clone, backup, external generation, or restore targets.

After staging require:

```text
unstaged tracked paths = 0
unexpected untracked non-ignored paths = 0
unclassified staged paths = 0
```

---

# 9. Full validation

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
11/11 validation = PASS
tests = PASS
lockfile drift = 0
direct dependency drift = 0
product implementation count = 0
source/evidence byte mismatch = 0
```

No write-format operation.

---

# 10. Live bootstrap guard

Authorized modified existing bootstrap files:

```text
Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
Sources\07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md
Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Authorized new bootstrap Outputs:

the exact SYNC1 outputs defined below.

No other pre-existing bootstrap mutation.

---

# 11. Required SYNC1 outputs

Create exactly FIVE new files under bootstrap Outputs:

1. `RSM-3-I4-SYNC1-LIVE-SOURCE-DISPOSITION-REPORT.md`
2. `RSM-3-I4-SYNC1-REPOSITORY-SOURCE-SYNC-EVIDENCE.tsv`
3. `RSM-3-I4-SYNC1-I4-EVIDENCE-LINEAGE-INVENTORY.tsv`
4. `RSM-3-I4-SYNC1-STAGED-CANDIDATE-REPORT.md`
5. `RSM-3-I4-SYNC1-EXACT-STAGED-PATCH.diff`

The staged-candidate report must include:

```text
base HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
origin/main = same
source 02/07/08 post-update hashes
repository source copy mismatch = 0
I4 evidence retained count
I4 evidence byte mismatch = 0
staged path count
unclassified staged path count = 0
full validation = PASS
canonical worktree has no unstaged tracked drift
commit = FALSE
push = FALSE
I4 closed = FALSE
V1 authorized = FALSE
```

Exact patch command:

```powershell
git -C "C:\RetroStage\retrostage-maker" diff --cached --no-ext-diff --full-index --binary
```

Do not truncate the patch.

---

# 12. Final decision

End with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I4-SYNC1 STAGED-CONTENT REVIEW`

or

`BLOCKED — RSM-3-I4-SYNC1 MATERIAL FAILURE`

Do not commit.

Do not push.

Do not close I4.

Do not authorize V1.

---

# 13. Success condition

SYNC1 succeeds only when the accepted RETRY2 operational truth and I4 lineage are represented in a fully validated, exact staged repository candidate suitable for final independent review.

The next review will decide whether the candidate may be committed/pushed and whether that resulting remote snapshot can close I4 and activate RSM-3-V1.
