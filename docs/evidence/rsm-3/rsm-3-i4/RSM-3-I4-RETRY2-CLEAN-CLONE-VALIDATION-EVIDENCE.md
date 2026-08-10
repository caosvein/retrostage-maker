# RSM-3-I4-RETRY2 Clean-Clone Validation Evidence

**Task:** `RSM-3-I4-FIX2-COMMIT1-RETRY2`  
**Target:** `D:\RSM-Validation\clean-clone-retry2`

## Fresh clone baseline

```text
Target absent before clone = TRUE
Clone source = https://github.com/caosvein/retrostage-maker.git
HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
Branch = main
Commit count = 5
Tree files = 141
Tracked state = CLEAN
Natural effective core.autocrlf = true
core.autocrlf origin = C:/Program Files/Git/etc/gitconfig
Clone-local override = NONE
```

The historical failed `D:\RSM-Validation\clean-clone` target was not read, modified, deleted, cleaned, reset, renamed, or reused.

## Pre-install LF and protected-byte proof

```text
git ls-files --eol records = 141
18 required index EOL lf = 18/18
18 required worktree EOL lf = 18/18
18 effective text auto = 18/18
18 effective eol lf = 18/18
18 physical CR byte count = 0/18 paths
Protected docs/evidence and notice paths = 103
Protected physical no-filter/index blob mismatches = 0
```

Exact per-path observations are recorded in `RSM-3-I4-RETRY2-FRESH-CLEAN-CLONE-EOL-EVIDENCE.tsv`.

## Frozen install and full validation

| Command | Exit | Result |
|---|---:|---|
| `pnpm.cmd install --frozen-lockfile` | 0 | PASS |
| `pnpm.cmd run format:check` | 0 | PASS |
| `pnpm.cmd run lint` | 0 | PASS |
| `pnpm.cmd run typecheck` | 0 | PASS |
| `pnpm.cmd run test` | 0 | PASS — 34 tests |
| `pnpm.cmd run arch:check` | 0 | PASS |
| `pnpm.cmd run deadcode:check` | 0 | PASS |
| `pnpm.cmd run build` | 0 | PASS |
| `pnpm.cmd run validate` | 0 | PASS |
| `pnpm.cmd run compliance:check` | 0 | PASS |
| `pnpm.cmd run dependency:audit` | 0 | PASS — one visible non-blocking low advisory |
| `pnpm.cmd run ci:validate` | 0 | PASS |

```text
Frozen install = PASS
Full validation = 11/11 PASS
format:check = PASS
pnpm-lock.yaml SHA-256 before/after = CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0 / same
Tracked lockfile drift = 0
Tracked worktree drift = 0
HEAD after validation = f9404ec83436cb739e9363ccc3791517a3ddefb9
```

`WINDOWS LF CHECKOUT DEFECT PHYSICAL CLOSURE PROOF = PASS`
