# RetroStage Maker — RSM-3-I4-FIX2 LF Checkout Policy with Byte-Preserved Evidence / Notice Exceptions

**Document ID:** `RSM-3-I4-FIX2-LF-CHECKOUT-POLICY-WITH-BYTE-PRESERVED-EVIDENCE-NOTICE-EXCEPTIONS-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Task:** `RSM-3-I4-FIX2`  
**Primary executor:** `Codex`  
**Mode:** `REFINED ONE-FILE REPOSITORY CORRECTION / NO COMMIT / NO PUSH`

---

# 1. Entry authority

Fully read and verify:

- `RSM-3-I4-FIX1-CHATGPT-INDEPENDENT-FAILURE-REVIEW-AND-BYTE-PRESERVATION-REFINEMENT.md`
- all three uploaded/non-empty FIX1 evidence outputs
- the physically present zero-byte FIX1 exact patch

Required decision:

`RSM-3-I4-FIX1 FAILURE VALID / EOL POLICY MUST PRESERVE HISTORICAL EVIDENCE AND NOTICE BYTES`

Required identities:

```text
FIX1 staged candidate report = 087BDAFA543ACBC4B4A1361B9587CFE5EA4503A2ABD52137054C748B03D3B644
FIX1 validation report = 815EC8050CFC86C09909DA438F21C25FA26FDDEB0E32DF7A1019AF6556A0AFB4
FIX1 EOL evidence = 0695C8F9101B7DF48611EE2570A2AE0F9C6719400515BA44C7E9E334DBC72786
FIX1 empty patch = E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855
```

If authority differs:

STOP:

`BLOCKED — RSM-3-I4-FIX2 AUTHORITY INVALID`

---

# 2. Exact starting repository/remote state

Canonical repository:

`C:\RetroStage\retrostage-maker`

Require:

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

Do not modify the failed clean clone.

Do not fetch/pull/reset/restore/clean.

---

# 3. Reconfirm the six protected non-LF text identities

Using:

```powershell
git -C "C:\RetroStage\retrostage-maker" ls-files --eol
```

require exactly the previously observed six existing text paths needing blanket-LF renormalization:

```text
compliance/THIRD_PARTY_NOTICES.html
docs/evidence/rsm-3/rsm-3-b/RSM-3-B-INITIAL-TOPOLOGY-PLAN.tsv
docs/evidence/rsm-3/rsm-3-b/RSM-3-B-SOURCE-IMPORT-MAP.tsv
docs/evidence/rsm-3/rsm-3-c/RSM-3-C-EXTERNAL-DEVICE-INVENTORY.tsv
docs/evidence/rsm-3/rsm-3-c/RSM-3-C-SUPPLY-CHAIN-BACKUP-RESTORE-BOUNDARY-CONTRACT.md
docs/evidence/rsm-3/rsm-3-i1/RSM-3-I1-LOCAL-GIT-REPOSITORY-SOURCE-IMPORT-INITIAL-COMMIT-CANDIDATE-PROMPT.md
```

Also record the existing `i/none` patch evidence path.

Before mutation record the exact Git blob OID and SHA-256 for each of these seven protected paths.

If the set differs materially:

STOP:

`BLOCKED — RSM-3-I4-FIX2 EOL BASELINE DRIFT`

---

# 4. Exact authorized `.gitattributes`

Create exactly one root file:

`C:\RetroStage\retrostage-maker\.gitattributes`

Exact content:

```text
* text=auto eol=lf
docs/evidence/** -text
compliance/THIRD_PARTY_NOTICES.html -text
```

Requirements:

```text
encoding = UTF-8/ASCII-compatible
BOM = none
line endings = LF
final newline = exactly one LF
```

No comments.

No other patterns.

No existing tracked file modification.

---

# 5. Attribute-effect verification before staging

After creating `.gitattributes`, run read-only/dry checks at minimum:

```powershell
git -C "C:\RetroStage\retrostage-maker" check-attr text eol -- .
git -C "C:\RetroStage\retrostage-maker" ls-files --eol
git -C "C:\RetroStage\retrostage-maker" add -n --renormalize .
```

The dry renormalization simulation must show:

```text
existing tracked path requiring renormalization = 0
```

If the Git version's dry-run output is ambiguous, use a temporary index (`GIT_INDEX_FILE`) simulation rather than mutating the real index.

Do NOT run mutating:

`git add --renormalize .`

against the real index.

---

# 6. Protected-byte verification

Under the refined attributes require:

```text
docs/evidence/** effective text attribute = unset / -text
compliance/THIRD_PARTY_NOTICES.html effective text attribute = unset / -text
```

For all seven protected paths:

```text
Git blob OID after attribute creation = before
working file SHA-256 = before
staged/index blob = unchanged
```

Protected historical evidence byte mismatch count:

`0`

Third-party notice byte mismatch count:

`0`

---

# 7. The 18 clean-clone formatting paths

Verify the exact 18 paths reported by RETRY1:

```text
package.json
pnpm-workspace.yaml
eslint.config.mjs
prettier.config.mjs
dependency-cruiser.config.cjs
knip.json
tsconfig.json
.github/workflows/ci.yml
tooling/compliance/check.mjs
tooling/compliance/generate.mjs
tooling/compliance/policy.mjs
tooling/compliance/policy.test.mjs
tooling/node-fs-r-ok-compat-loader.mjs
tooling/repository-policy.test.mjs
tooling/repository-policy.ts
packages/core/package.json
packages/diagnostics/package.json
packages/test-fixtures/package.json
```

Required:

```text
index EOL = lf
effective text = auto/set as applicable
effective eol = lf
byte-preservation exception = FALSE
```

No current content modification is required.

---

# 8. Stage exactly one file

Before staging require:

```text
existing tracked modified paths = 0
untracked non-ignored paths = exactly .gitattributes
```

Stage only:

```powershell
git -C "C:\RetroStage\retrostage-maker" add -- .gitattributes
```

Then require:

```text
staged path count = 1
A .gitattributes
existing tracked staged paths = 0
unstaged tracked paths = 0
unexpected untracked paths = 0
```

---

# 9. Full local validation

Run:

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

Require:

```text
mandatory failures = 0
pnpm-lock.yaml drift = 0
direct dependency drift = 0
existing tracked unstaged drift = 0
protected evidence byte drift = 0
notice byte drift = 0
```

Do not run formatter in write mode.

---

# 10. Final staged boundary

Require exactly:

```text
A .gitattributes
```

and no other staged/unstaged tracked delta.

Generate:

`git diff --cached --no-ext-diff --full-index --binary`

The exact patch must contain one diff header only.

Do not commit.

Do not push.

Remote `origin/main` must remain:

`e50cadca387b992f6a5648237fe0c006ef72a6fa`

---

# 11. Failed clean-clone boundary

Do not modify/delete/reuse:

`D:\RSM-Validation\clean-clone`

It remains historical physical evidence of the Windows EOL failure.

The refined policy must later be proven using a new clone after FIX2 commit/push.

---

# 12. Required outputs

Create exactly FOUR new outputs:

## 1
`RSM-3-I4-FIX2-EOL-POLICY-AND-BYTE-PRESERVATION-EVIDENCE.tsv`

Columns:

```text
path
class
index_eol_before
effective_text_after
effective_eol_after
blob_oid_before
blob_oid_after
sha256_before
sha256_after
renormalization_delta
result
```

Include all 140 tracked paths plus `.gitattributes`.

## 2
`RSM-3-I4-FIX2-VALIDATION-REPORT.md`

## 3
`RSM-3-I4-FIX2-STAGED-CANDIDATE-REPORT.md`

Must state:

```text
base HEAD
origin/main
protected historical evidence count
protected notice count
dry renormalization delta count
18 clean-clone path policy result
validation result
staged path count
existing tracked staged count
exact patch SHA-256
commit = FALSE
push = FALSE
I4 closed = FALSE
V1 authorized = FALSE
```

## 4
`RSM-3-I4-FIX2-EXACT-STAGED-PATCH.diff`

Complete one-file staged patch.

---

# 13. Bootstrap mutation guard

No pre-existing bootstrap file may change.

Only the exact four FIX2 outputs may be created.

---

# 14. Final decision

End with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I4-FIX2 STAGED-CONTENT REVIEW`

or

`BLOCKED — RSM-3-I4-FIX2 MATERIAL FAILURE`

Do not commit.

Do not push.

Do not create RETRY2.

Do not close I4.
