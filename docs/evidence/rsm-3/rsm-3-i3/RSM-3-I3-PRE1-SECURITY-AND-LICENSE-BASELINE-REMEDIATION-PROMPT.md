# RetroStage Maker — RSM-3-I3-PRE1 Security and Exact-License Baseline Remediation

**Document ID:** `RSM-3-I3-PRE1-SECURITY-AND-LICENSE-BASELINE-REMEDIATION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Parent phase:** `RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline`  
**Task:** `RSM-3-I3-PRE1 — Security and Exact-License Baseline Remediation`  
**Primary executor:** `Codex`  
**Mode:** `NARROW SECURITY REMEDIATION / STAGED CANDIDATE — NO COMMIT / NO PUSH`

This is not a retry of the full I3 implementation.

It resolves the exact fail-closed blockers found before I3 repository mutation.

---

## 1. Mandatory Entry Authority

Before any repository mutation, fully read and verify:

- `RSM-3-I3-PRE1-OWNER-SECURITY-AND-LICENSE-DECISION-LOCK.md`
- `RSM-3-I3-ACTION-PIN-AND-PLATFORM-ELIGIBILITY-EVIDENCE.tsv`
- `RSM-3-I3-COMPLIANCE-AND-LICENSE-BASELINE-REPORT.md`
- `RSM-3-I3-CI-AND-DEPENDENCY-REVIEW-VALIDATION.md`
- `RSM-3-I3-REPOSITORY-MUTATION-MANIFEST.tsv`
- `RSM-3-I3-STAGED-CANDIDATE-REPORT.md`

Required blocked-attempt decision:

`BLOCKED — RSM-3-I3 MATERIAL FAILURE`

Required blocked-attempt repository mutation count:

`0`

Required blocked-attempt staged patch:

```text
SHA-256 = E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855
bytes = 0
```

If the blocked I3 attempt mutated the repository:

STOP.

---

## 2. Repository Baseline

Repository:

`C:\RetroStage\retrostage-maker`

Required:

```text
HEAD = 302538e3692ed82daa969bceed0a63945736fc5f
branch = main
commit count = 2
HEAD tree files = 105
working tree = CLEAN
staged paths = 0
unstaged tracked paths = 0
unexpected untracked non-ignored paths = 0
remote refs = 0
push performed = FALSE
```

If drift exists:

STOP:

`BLOCKED — I3-PRE1 ENTRY REPOSITORY DRIFT`

Do not repair automatically.

---

## 3. Exact Owner Decisions

Consume the owner decision lock exactly.

Authorized direct change:

```text
vitest@3.0.7 -> vitest@3.2.6
```

Exact transitive license approvals:

```text
argparse@2.0.1 / Python-2.0
minimatch@10.2.6 / BlueOak-1.0.0
```

These approvals are package/version-specific and development/bootstrap-tooling-only.

No broad license-family approval exists.

Dependency Review Action remains:

`DEFERRED_PLATFORM_CAPABILITY`

---

## 4. Official Vitest Security / Release Verification

Before changing package metadata, independently verify using official upstream/registry evidence:

### Advisory

`GHSA-5xrq-8626-4rwp`

Required:

```text
severity = critical
vitest@3.0.7 affected = TRUE
patched 3.x boundary includes 3.2.6
```

### Exact release

Verify official:

`vitest v3.2.6`

Required exact package metadata:

```text
name = vitest
version = 3.2.6
license = MIT
Node engine admits Node 24.19.0
```

Record registry integrity for exact `vitest@3.2.6`.

If `3.2.6` is unavailable, identity differs, or Node 24.19.0 is excluded:

STOP:

`BLOCKED — VITEST 3.2.6 SECURITY REMEDIATION IDENTITY FAILURE`

Do not choose a different version automatically.

---

## 5. Allowed Repository Mutations

Only these tracked repository files may change:

```text
package.json
pnpm-lock.yaml
```

Ignored `node_modules/` may change as install state.

No other repository file may change.

In particular do NOT change:

```text
pnpm-workspace.yaml
tsconfig.json
eslint.config.mjs
prettier.config.mjs
dependency-cruiser.config.cjs
knip.json
tooling/node-fs-r-ok-compat-loader.mjs
tooling/repository-policy.ts
tooling/repository-policy.test.mjs
packages/core/package.json
packages/diagnostics/package.json
packages/test-fixtures/package.json
docs/
.github/
```

No source/evidence synchronization occurs in PRE1.

---

## 6. Direct Dependency Change

Modify only the exact root direct dev dependency:

```text
"vitest": "3.0.7"
```

to:

```text
"vitest": "3.2.6"
```

All six other direct dependency versions must remain unchanged:

```text
dependency-cruiser@16.10.0
eslint@9.21.0
knip@6.32.0
prettier@3.5.2
typescript@6.0.3
typescript-eslint@8.66.0
```

Required final direct dependency count:

`7`

Unexpected direct dependency count:

`0`

Product direct dependency count:

`0`

---

## 7. Lockfile Reconciliation

Use the existing committed pnpm 11 project policy.

Do not alter:

`pnpm-workspace.yaml`

Required effective policy remains:

```text
autoInstallPeers = false
strictPeerDependencies = true
ignoreScripts = true
savePrefix = ""
```

Reconcile the lockfile for exact `vitest@3.2.6`.

Do not manually edit the lockfile.

Record:

- pre-remediation lockfile SHA-256;
- post-remediation lockfile SHA-256;
- exact package/snapshot additions/removals/version deltas;
- direct dependency resolution;
- transitive graph delta.

After reconciliation run:

```powershell
pnpm.cmd install --frozen-lockfile
```

without a CLI lifecycle-script override.

Required:

```text
exit code = 0
lockfile drift = 0
effective ignoreScripts = true
```

No lifecycle/build script may be manually approved.

---

## 8. Vulnerability Verification

Run:

```powershell
pnpm.cmd audit --audit-level high
```

Required:

```text
high findings = 0
critical findings = 0
blocking high/critical findings = 0
GHSA-5xrq-8626-4rwp blocking installed direct vitest = FALSE
```

Record all remaining low/moderate findings separately.

Do not auto-fix.

If another high/critical finding remains:

STOP:

`BLOCKED — I3-PRE1 HIGH/CRITICAL VULNERABILITY REMAINS`

---

## 9. Exact License Re-Scan

Re-scan the physically installed deduplicated external dependency graph by exact package/version.

For every package determine declared/evidenced license.

Apply normal governing license policy plus only these exact owner exceptions:

```text
argparse@2.0.1 / Python-2.0
minimatch@10.2.6 / BlueOak-1.0.0
```

If either exact approved package is still present:

classify:

`OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE`

If absent:

record:

`APPROVED_IDENTITY_NOT_PRESENT_AFTER_REMEDIATION`

Do not transfer its approval to another version/package.

Required final blocker counts:

```text
prohibited = 0
unknown/no-license = 0
unapproved manual-review = 0
```

If a new manual-review license appears:

STOP:

`BLOCKED — NEW THIRD-PARTY LICENSE REVIEW REQUIRED`

Do not infer approval.

---

## 10. Notice Evidence Boundary

PRE1 does not create final third-party notices.

It must, however, record the exact license/notice files physically available for any approved exact manual-review package still present.

At minimum for each approved present identity record:

```text
package
version
declared license
license file path
license file SHA-256
copyright/notice file if present
notice obligation summary
development/bootstrap-only scope
```

This evidence will be consumed by resumed I3 compliance generation.

---

## 11. Full Existing Toolchain Validation

After the exact Vitest remediation, rerun:

```powershell
pnpm.cmd run format:check
pnpm.cmd run lint
pnpm.cmd run typecheck
pnpm.cmd run test
pnpm.cmd run arch:check
pnpm.cmd run deadcode:check
pnpm.cmd run build
pnpm.cmd run validate
```

Required:

- every command exit code = `0`;
- existing meaningful tests all pass;
- architecture violations = `0`;
- Knip findings = `0`;
- build succeeds;
- generated artifacts remain ignored/unstaged.

Do not weaken configuration to make Vitest 3.2.6 pass.

If existing tests/tooling require unrelated source changes:

STOP:

`BLOCKED — VITEST REMEDIATION REQUIRES OUT-OF-SCOPE SOURCE CHANGE`

---

## 12. Repository Mutation Guard

Before PRE1:

hash every physical tracked repository file and capture Git state.

After remediation require:

```text
AUTHORIZED_TRACKED_MUTATION_PATHS = package.json; pnpm-lock.yaml
UNAUTHORIZED_TRACKED_REPOSITORY_MUTATION_COUNT = 0
HEAD_CHANGED = FALSE
COMMIT_COUNT = 2
PUSH_PERFORMED = FALSE
REMOTE_REF_COUNT = 0
```

No `.github`, compliance, docs, tooling, package-shell, or source mutation is allowed.

---

## 13. Bootstrap Mutation Guard

Before task write:

hash every pre-existing bootstrap file under:

`C:\RetroStage\bootstrap\RSM-3-A`

No pre-existing bootstrap file may change.

Only the four PRE1 outputs in Section 17 may be created.

Required:

```text
UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0
EXPECTED_NEW_PRE1_OUTPUT_COUNT = 4
UNEXPECTED_NEW_BOOTSTRAP_FILE_COUNT = 0
```

---

## 14. Staging

Only after all PRE1 gates pass:

stage exactly:

```text
package.json
pnpm-lock.yaml
```

Do not stage ignored install/build artifacts.

Final required:

```text
staged paths = 2
unstaged tracked paths = 0
unexpected untracked non-ignored paths = 0
git diff --cached --check = PASS
HEAD = 302538e3692ed82daa969bceed0a63945736fc5f
commit count = 2
push = FALSE
```

---

## 15. Exact Staged Patch

Generate the complete exact staged patch against:

`302538e3692ed82daa969bceed0a63945736fc5f`

using full-index/binary Git diff.

Do not filter or truncate.

Recompute independently and require byte identity.

Required:

`PRE1_STAGED_PATCH_IDENTITY_STABLE = TRUE`

---

## 16. No Commit / No Push / No I3 Resume

PRE1 must not:

- commit;
- push;
- create upstream;
- create CI;
- generate SBOM;
- generate notices;
- synchronize source 02/08;
- synchronize I2 evidence;
- resume full I3 implementation;
- authorize I4.

The two-path security remediation must first receive independent review and commit authorization.

---

## 17. Required Outputs

Create exactly FOUR new outputs under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

### Output 1

`RSM-3-I3-PRE1-VITEST-SECURITY-REMEDIATION-EVIDENCE.md`

Record:

- official advisory verification;
- exact 3.2.6 release/registry identity;
- pre/post direct dependency identities;
- pre/post lockfile hashes;
- transitive graph delta;
- frozen install result;
- audit result.

### Output 2

`RSM-3-I3-PRE1-EXACT-LICENSE-DECISION-APPLICATION.md`

Record:

- exact owner decision-lock identity;
- exact package/version/license presence after remediation;
- license file identities;
- approval application result;
- any new manual/prohibited/unknown license count.

### Output 3

`RSM-3-I3-PRE1-STAGED-CANDIDATE-REPORT.md`

Record:

- starting/ending HEAD;
- 2 exact staged paths;
- package.json exact direct dependencies;
- lockfile identity;
- vulnerability blocker count;
- license blocker count;
- validation failure count;
- unauthorized repository/bootstrap mutation count;
- commit/push state;
- full I3 resume state.

### Output 4

`RSM-3-I3-PRE1-EXACT-STAGED-PATCH.diff`

Complete exact two-path staged patch.

---

## 18. Final Decision

The staged-candidate report must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I3-PRE1 SECURITY REMEDIATION REVIEW`

or

`BLOCKED — RSM-3-I3-PRE1 MATERIAL FAILURE`

Do not declare full I3 unblocked without independent review.

Do not create another FIX prompt.

---

## 19. Success Condition

PRE1 succeeds when:

1. exact `vitest@3.2.6` replaces vulnerable `3.0.7`;
2. all other direct dependency versions remain unchanged;
3. lockfile is deterministically reconciled;
4. high/critical vulnerability blocker count is zero;
5. exact owner-approved Python-2.0 and BlueOak identities are correctly handled if still present;
6. no new unapproved license blocker exists;
7. full prior toolchain validation remains green;
8. only `package.json` and `pnpm-lock.yaml` are staged;
9. no commit or push occurs;
10. exact patch is available for independent review.
