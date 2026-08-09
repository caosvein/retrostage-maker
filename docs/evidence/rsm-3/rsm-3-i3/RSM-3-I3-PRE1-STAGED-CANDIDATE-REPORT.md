# RetroStage Maker — RSM-3-I3-PRE1 Staged Candidate Report

**Task:** `RSM-3-I3-PRE1 — Security and Exact-License Baseline Remediation`  
**Candidate state:** `READY FOR INDEPENDENT REVIEW / NO COMMIT / NO PUSH`

## Repository identity and exact stage

```text
starting HEAD = 302538e3692ed82daa969bceed0a63945736fc5f
ending HEAD = 302538e3692ed82daa969bceed0a63945736fc5f
branch = main
commit count = 2
HEAD tree file count = 105
staged path count = 2
staged path 1 = package.json
staged path 2 = pnpm-lock.yaml
unstaged tracked path count = 0
unexpected untracked non-ignored path count = 0
git diff --cached --check = PASS
remote ref count = 0
upstream = ABSENT
```

## Exact direct dependencies

```text
dependency-cruiser = 16.10.0
eslint = 9.21.0
knip = 6.32.0
prettier = 3.5.2
typescript = 6.0.3
typescript-eslint = 8.66.0
vitest = 3.2.6
direct dependency count = 7
unexpected direct dependency count = 0
product direct dependency count = 0
```

Exact file identities:

```text
package.json SHA-256 = 08C9EEA3EA21C260AFD97CB31A19D267D6793DD81FE46730E19E510AD876098A
pnpm-lock.yaml SHA-256 = CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0
lockfile frozen-install drift = 0
```

## Security and license gates

```text
GHSA-5xrq-8626-4rwp blocking installed direct vitest = FALSE
high vulnerability count = 0
critical vulnerability count = 0
high/critical vulnerability blocker count = 0
remaining low vulnerability count = 1
prohibited license count = 0
unknown/no-license count = 0
unapproved manual-review license count = 0
license blocker count = 0
exact owner-approved transitive license identity count = 2
```

## Full validation

| Command | Exit code | Result |
|---|---:|---|
| `pnpm.cmd run format:check` | 0 | PASS |
| `pnpm.cmd run lint` | 0 | PASS |
| `pnpm.cmd run typecheck` | 0 | PASS |
| `pnpm.cmd run test` | 0 | PASS — Vitest 3.2.6, 1 file, 3/3 tests |
| `pnpm.cmd run arch:check` | 0 | PASS — 0 violations |
| `pnpm.cmd run deadcode:check` | 0 | PASS — 0 Knip findings |
| `pnpm.cmd run build` | 0 | PASS |
| `pnpm.cmd run validate` | 0 | PASS |

```text
validation command count = 8
validation failure count = 0
generated ignored artifact staged count = 0
out-of-scope source/config changes required = FALSE
```

## Mutation guards

```text
AUTHORIZED_TRACKED_MUTATION_PATHS = package.json; pnpm-lock.yaml
authorized tracked mutation count = 2
UNAUTHORIZED_TRACKED_REPOSITORY_MUTATION_COUNT = 0
HEAD_CHANGED = FALSE
COMMIT_COUNT = 2
PUSH_PERFORMED = FALSE
UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0
EXPECTED_NEW_PRE1_OUTPUT_COUNT = 4
UNEXPECTED_NEW_BOOTSTRAP_FILE_COUNT = 0
```

## Exact staged patch

```text
patch filename = RSM-3-I3-PRE1-EXACT-STAGED-PATCH.diff
patch bytes = 11303
patch SHA-256 = C1472AC8B664B23E37B598FB04CF178A411ECB3F8196CF6627D7E5B6D68150D8
fresh independent staged stream bytes = 11303
fresh independent staged stream SHA-256 = C1472AC8B664B23E37B598FB04CF178A411ECB3F8196CF6627D7E5B6D68150D8
PRE1_STAGED_PATCH_IDENTITY_STABLE = TRUE
```

## Boundary state

```text
commit performed = FALSE
push performed = FALSE
CI implementation started = FALSE
SBOM generated = FALSE
notices generated = FALSE
source 02/08 synchronized = FALSE
I2 evidence synchronized = FALSE
full I3 implementation resumed = FALSE
I4 authorized = FALSE
```

READY FOR CHATGPT INDEPENDENT RSM-3-I3-PRE1 SECURITY REMEDIATION REVIEW
