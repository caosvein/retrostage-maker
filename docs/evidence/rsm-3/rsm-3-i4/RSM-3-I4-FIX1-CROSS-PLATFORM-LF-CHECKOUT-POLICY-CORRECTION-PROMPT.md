# RetroStage Maker — RSM-3-I4-FIX1 Cross-Platform LF Checkout Policy Correction

**Document ID:** `RSM-3-I4-FIX1-CROSS-PLATFORM-LF-CHECKOUT-POLICY-CORRECTION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Task:** `RSM-3-I4-FIX1 — Cross-Platform LF Checkout Policy Correction`  
**Primary executor:** `Codex`  
**Mode:** `ONE-FILE REPOSITORY CORRECTION / STAGED CANDIDATE / NO COMMIT / NO PUSH`

---

# 1. Entry authority

Fully read and verify:

- `RSM-3-I4-EXEC1-RETRY1-CHATGPT-INDEPENDENT-FAILURE-REVIEW-AND-EOL-CORRECTION-AUTHORIZATION.md`
- all six RETRY1 failed-attempt outputs

Required independent decision:

`RSM-3-I4 EXEC1-RETRY1 FAILURE VALID / NARROW REPOSITORY EOL POLICY CORRECTION AUTHORIZED`

Required RETRY1 readiness SHA-256:

`515DE704BF8311013A02708C68D717A648C55FBFDA8B00EF91CB5ED55CB55BA8`

If authority differs:

STOP:

`BLOCKED — RSM-3-I4-FIX1 AUTHORITY INVALID`

---

# 2. Exact starting repository/remote state

Canonical repository:

`C:\RetroStage\retrostage-maker`

Require before mutation:

```text
HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
branch = main
commit count = 4
HEAD tree files = 140
working tree/index = CLEAN
unexpected untracked non-ignored files = 0
origin/main = e50cadca387b992f6a5648237fe0c006ef72a6fa
upstream = origin/main
```

Do not fetch/pull/reset/restore/clean.

If drift exists:

STOP:

`BLOCKED — RSM-3-I4-FIX1 BASELINE DRIFT`

---

# 3. Full existing tracked EOL inspection

Before creating `.gitattributes`, capture:

```powershell
git -C "C:\RetroStage\retrostage-maker" ls-files --eol
```

Classify every tracked path.

The correction assumes existing committed text blobs are already normalized in the index.

If any existing tracked text path requires a content/index renormalization to comply with LF policy, STOP:

`BLOCKED — RSM-3-I4-FIX1 EXISTING INDEX EOL RENORMALIZATION REQUIRED`

Do NOT run `git add --renormalize .` automatically.

Do NOT change any existing tracked file.

---

# 4. Exact authorized repository mutation

Create exactly one root file:

`C:\RetroStage\retrostage-maker\.gitattributes`

Exact UTF-8/ASCII-compatible bytes:

```text
* text=auto eol=lf
```

with exactly one final LF newline.

No BOM.

Do not add comments.

Do not add extension-specific exceptions in FIX1.

`text=auto` is intentional so binary files remain subject to Git text/binary detection.

---

# 5. Attribute verification

After file creation, verify against all tracked files and the new file:

```powershell
git -C "C:\RetroStage\retrostage-maker" check-attr text eol -- .
git -C "C:\RetroStage\retrostage-maker" ls-files --eol
```

For the 18 paths reported by RETRY1, require effective:

```text
eol = lf
```

and an LF-normalized index identity.

Do not modify global/system/local `core.autocrlf`.

Record the machine's effective value as diagnostic only.

---

# 6. One-file mutation guard

Before staging require:

```text
existing tracked modified paths = 0
new untracked non-ignored paths = exactly .gitattributes
```

Stage only:

```powershell
git -C "C:\RetroStage\retrostage-maker" add -- .gitattributes
```

Then require:

```text
staged paths = 1
A .gitattributes
unstaged tracked paths = 0
unexpected untracked non-ignored paths = 0
```

If any existing tracked path appears staged or modified:

STOP:

`BLOCKED — RSM-3-I4-FIX1 CORRECTION EXPANDED BEYOND ONE FILE`

Do not repair automatically.

---

# 7. Validation

Run the canonical repository validation while only `.gitattributes` is staged:

```powershell
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
tracked unstaged drift = 0
pnpm-lock.yaml drift = 0
direct dependency drift = 0
```

Do not run Prettier in write mode.

---

# 8. Renormalization dry-safety check

After `.gitattributes` is staged, use a non-mutating/dry-run method to determine whether applying the new attributes would require staging changes to any pre-existing tracked path.

If any existing tracked file would produce a different index blob under the new attributes:

STOP:

`BLOCKED — RSM-3-I4-FIX1 HIDDEN RENORMALIZATION DELTA`

The accepted candidate must remain exactly one new file.

---

# 9. Failed clean-clone boundary

Do NOT modify, delete, reuse, reformat, or validate further:

`D:\RSM-Validation\clean-clone`

during FIX1.

It remains the physical failed RETRY1 workspace.

The true proof of this correction will be a NEW remote clean clone after an independently reviewed FIX1 commit/push.

---

# 10. No remote mutation

Do NOT:

- commit;
- push;
- create a new CI run;
- alter authentication;
- change branch/upstream;
- force push.

Remote main must remain:

`e50cadca387b992f6a5648237fe0c006ef72a6fa`

---

# 11. Required outputs

Create exactly FOUR new outputs under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

## Output 1
`RSM-3-I4-FIX1-EOL-ATTRIBUTE-AND-INDEX-EVIDENCE.tsv`

Columns:

```text
path
index_eol_before
worktree_eol_before
effective_text_after
effective_eol_after
renormalization_delta
result
```

Include every tracked path plus `.gitattributes`.

## Output 2
`RSM-3-I4-FIX1-VALIDATION-REPORT.md`

Record all required validation results and zero-drift checks.

## Output 3
`RSM-3-I4-FIX1-STAGED-CANDIDATE-REPORT.md`

Must record:

```text
base HEAD
origin/main
upstream
effective core.autocrlf diagnostic
tracked path count before
one authorized new path
existing tracked mutation count
hidden renormalization delta count
validation result
staged path count
commit = FALSE
push = FALSE
I4 closed = FALSE
V1 authorized = FALSE
```

## Output 4
`RSM-3-I4-FIX1-EXACT-STAGED-PATCH.diff`

Generate exactly:

```text
git diff --cached --no-ext-diff --full-index --binary
```

Do not truncate/filter.

---

# 12. Bootstrap mutation guard

No pre-existing bootstrap file may change.

Only the four FIX1 outputs may be newly created.

Required:

```text
unauthorized pre-existing bootstrap mutations = 0
expected new FIX1 outputs = 4
unexpected new bootstrap files = 0
```

---

# 13. Final decision

The staged candidate report must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I4-FIX1 STAGED-CONTENT REVIEW`

or

`BLOCKED — RSM-3-I4-FIX1 MATERIAL FAILURE`

Do not commit.

Do not push.

Do not create RETRY2.

Do not close I4.
