# RetroStage Maker — RSM-3-I3-PRE1-COMMIT1 Owner-Authorized Security Remediation Commit / Post-Commit Verification

## 1. Task Identity

**Task:**  
`RSM-3-I3-PRE1-COMMIT1 — Owner-Authorized Security Remediation Commit / Post-Commit Verification`

**Parent phase:**  
`RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline`

**Primary executor:**  
`Codex`

**Mode:**  
`CONTROLLED LOCAL COMMIT / POST-COMMIT VERIFICATION`

This task may create exactly one local commit from the exact independently accepted two-path PRE1 staged candidate.

No push is authorized.

Full I3 implementation is not authorized by this task.

---

## 2. Mandatory Authority

Before any mutation, fully read and verify:

- `RSM-3-I3-PRE1-CHATGPT-INDEPENDENT-SECURITY-REMEDIATION-REVIEW.md`
- `RSM-3-I3-PRE1-VITEST-SECURITY-REMEDIATION-EVIDENCE.md`
- `RSM-3-I3-PRE1-EXACT-LICENSE-DECISION-APPLICATION.md`
- `RSM-3-I3-PRE1-STAGED-CANDIDATE-REPORT.md`
- `RSM-3-I3-PRE1-EXACT-STAGED-PATCH.diff`

Required independent review SHA-256:

`758382133FD8442E3E58FF583BF2B5C7D7EA2371B0EE5F87106FF3C2A91171EE`

Required decision:

`RSM-3-I3-PRE1 INDEPENDENT REVIEW — PASS / SECURITY REMEDIATION CANDIDATE ACCEPTED`

Required accepted patch SHA-256:

`C1472AC8B664B23E37B598FB04CF178A411ECB3F8196CF6627D7E5B6D68150D8`

If any authority identity or decision differs:

STOP:

`BLOCKED — RSM-3-I3-PRE1 COMMIT AUTHORITY INVALID`

---

## 3. Exact Pre-Commit Repository State

Repository:

`C:\RetroStage\retrostage-maker`

Required:

```text
HEAD = 302538e3692ed82daa969bceed0a63945736fc5f
branch = main
commit count = 2
HEAD tree files = 105
staged path count = 2
staged paths = package.json; pnpm-lock.yaml
unstaged tracked count = 0
unexpected untracked non-ignored count = 0
remote refs = 0
upstream tracking = ABSENT
push performed = FALSE
```

Recheck physically.

If drift exists:

STOP:

`BLOCKED — RSM-3-I3-PRE1 COMMIT CANDIDATE DRIFT`

Do not repair, restage, reset, restore, clean, or regenerate.

---

## 4. Exact Staged Patch Recheck

Regenerate directly from Git against:

`302538e3692ed82daa969bceed0a63945736fc5f`

using:

`git diff --cached --no-ext-diff --full-index --binary`

Required:

```text
patch SHA-256 =
C1472AC8B664B23E37B598FB04CF178A411ECB3F8196CF6627D7E5B6D68150D8

patch bytes = 11303
unique staged paths = 2
```

Required staged paths exactly:

```text
package.json
pnpm-lock.yaml
```

No third path is permitted.

---

## 5. High-Value Identity Recheck

Before commit verify:

```text
package.json SHA-256 =
08C9EEA3EA21C260AFD97CB31A19D267D6793DD81FE46730E19E510AD876098A

pnpm-lock.yaml SHA-256 =
CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0
```

Root direct dependency set must remain exactly:

```text
dependency-cruiser@16.10.0
eslint@9.21.0
knip@6.32.0
prettier@3.5.2
typescript@6.0.3
typescript-eslint@8.66.0
vitest@3.2.6
```

Required:

```text
direct dependency count = 7
unexpected direct dependency count = 0
product direct dependency count = 0
```

Do not rerun dependency resolution.

---

## 6. Commit

If and only if every authority and identity check passes, create exactly one local commit.

Commit subject:

`security: remediate vitest critical advisory`

Exact command:

```powershell
git -C "C:\RetroStage\retrostage-maker" commit -m "security: remediate vitest critical advisory"
```

Do not amend.

Do not create a second commit.

Do not push.

---

## 7. Immediate Post-Commit Verification

After commit capture:

```powershell
git -C "C:\RetroStage\retrostage-maker" rev-parse HEAD
git -C "C:\RetroStage\retrostage-maker" rev-list --count HEAD
git -C "C:\RetroStage\retrostage-maker" log -1 --format="%H%n%P%n%an%n%ae%n%s"
git -C "C:\RetroStage\retrostage-maker" status --short --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" status --porcelain=v2 --untracked-files=all
git -C "C:\RetroStage\retrostage-maker" diff --name-status HEAD
git -C "C:\RetroStage\retrostage-maker" diff --cached --name-status
git -C "C:\RetroStage\retrostage-maker" ls-files --others --exclude-standard
git -C "C:\RetroStage\retrostage-maker" ls-tree -r --name-only HEAD
git -C "C:\RetroStage\retrostage-maker" ls-remote origin
```

Required:

```text
commit count = 3
new HEAD parent count = 1
new HEAD parent = 302538e3692ed82daa969bceed0a63945736fc5f
branch = main
working tree clean = TRUE
staged changes = 0
unstaged changes = 0
unexpected untracked non-ignored files = 0
remote refs = 0
push performed = FALSE
```

Expected HEAD tree file count:

`105`

Reason:

PRE1 modifies two existing tracked files and adds/removes no tracked path.

---

## 8. Committed Delta Verification

Verify the new commit changes exactly:

```text
changed paths = 2
modified tracked paths = 2
new tracked paths = 0
deleted tracked paths = 0
```

Exact changed paths:

```text
package.json
pnpm-lock.yaml
```

Compare committed blobs with the exact accepted pre-commit staged blobs.

Required:

`COMMITTED_BLOB_ACCEPTED_STAGED_BLOB_MISMATCH_COUNT = 0`

---

## 9. Committed Security State

Verify from committed HEAD:

```text
vitest = 3.2.6
vitest 3.0.7 direct identity = ABSENT
direct dependency count = 7
package.json SHA-256 =
08C9EEA3EA21C260AFD97CB31A19D267D6793DD81FE46730E19E510AD876098A

pnpm-lock.yaml SHA-256 =
CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0
```

Do not modify dependencies while verifying.

Record the carry-forward security finding:

```text
GHSA-xffm-g5w8-qvg7
@eslint/plugin-kit@0.2.8
severity = low
state = OPEN NON-BLOCKING / MUST BE RECORDED IN RSM-3-I3
```

Do not remediate it in COMMIT1.

---

## 10. Bootstrap Mutation Guard

Before task execution, hash every pre-existing file under:

`C:\RetroStage\bootstrap\RSM-3-A`

No pre-existing bootstrap file may change.

Only the two required COMMIT1 outputs may be created.

Required:

```text
UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0
EXPECTED_NEW_COMMIT1_OUTPUT_COUNT = 2
UNEXPECTED_NEW_BOOTSTRAP_FILE_COUNT = 0
```

---

## 11. Required Outputs

Create exactly TWO new files under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

### Output 1

`RSM-3-I3-PRE1-COMMIT1-POST-COMMIT-EVIDENCE.md`

Record:

- independent authority identity;
- accepted patch identity;
- pre-commit HEAD;
- exact two staged paths;
- exact commit command;
- resulting HEAD;
- parent;
- author;
- subject;
- commit count;
- changed path count;
- committed blob mismatch count;
- final HEAD tree count;
- exact committed Vitest identity;
- post-commit working tree state;
- remote refs;
- push state;
- low-security-finding carry-forward.

### Output 2

`RSM-3-I3-PRE1-COMMIT1-READINESS-REPORT.md`

Must state:

- independent PRE1 review verified;
- accepted two-path candidate unchanged before commit;
- one local PRE1 security commit created;
- exact HEAD and parent;
- 2/2 paths committed;
- committed blob mismatch count = 0;
- final HEAD tree files = 105;
- Vitest 3.2.6 committed;
- direct dependency count = 7;
- working tree clean;
- unauthorized bootstrap mutation count = 0;
- push not performed;
- full I3 implementation not resumed;
- I4 not authorized.

---

## 12. Forbidden Actions

Do NOT:

- push;
- create upstream tracking;
- edit repository content;
- stage another path;
- regenerate lockfile;
- run an upgrade;
- remediate the low ESLint advisory;
- create CI;
- generate SBOM/notices;
- sync sources/evidence;
- resume full I3;
- authorize I4;
- amend the commit.

---

## 13. Final Decision

The readiness report must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I3-PRE1 POST-COMMIT REVIEW`

or

`BLOCKED — RSM-3-I3-PRE1 COMMIT MATERIAL FAILURE`

Do not declare full I3 active again.

Do not push.

Do not create a follow-up FIX prompt.

---

## 14. Success Condition

The task succeeds when the exact independently accepted two-path PRE1 remediation becomes one clean local commit on top of I2, with no byte/path drift and no remote mutation.

Only after independent post-commit review may the full RSM-3-I3 implementation be resumed from the new committed security baseline.
