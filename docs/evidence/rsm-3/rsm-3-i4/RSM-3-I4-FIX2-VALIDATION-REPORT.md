# RSM-3-I4-FIX2 Validation Report

## Result

`PASS`

The refined LF checkout policy was validated without changing any pre-existing tracked repository content. The only repository candidate is the staged root `.gitattributes` file.

## Entry authority

- Required decision: `RSM-3-I4-FIX1 FAILURE VALID / EOL POLICY MUST PRESERVE HISTORICAL EVIDENCE AND NOTICE BYTES`
- Decision match: `TRUE`
- FIX1 staged candidate report SHA-256: `087BDAFA543ACBC4B4A1361B9587CFE5EA4503A2ABD52137054C748B03D3B644`
- FIX1 validation report SHA-256: `815EC8050CFC86C09909DA438F21C25FA26FDDEB0E32DF7A1019AF6556A0AFB4`
- FIX1 EOL evidence SHA-256: `0695C8F9101B7DF48611EE2570A2AE0F9C6719400515BA44C7E9E334DBC72786`
- FIX1 empty patch SHA-256: `E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855`
- Authority result: `PASS`

## Starting state

- Repository: `C:\RetroStage\retrostage-maker`
- HEAD: `e50cadca387b992f6a5648237fe0c006ef72a6fa`
- Branch: `main`
- Commit count: `4`
- HEAD tree files: `140`
- Initial working tree/index: `CLEAN`
- Initial unexpected untracked non-ignored paths: `0`
- `origin/main`: `e50cadca387b992f6a5648237fe0c006ef72a6fa`
- Upstream: `origin/main`
- Local `core.autocrlf`: `false`
- Failed clean clone `D:\RSM-Validation\clean-clone`: `NOT ACCESSED / NOT MODIFIED`

## Policy artifact

- Path: `.gitattributes`
- Physical bytes: `84`
- SHA-256: `D08703F2A1CA1ADE6A38BB75DF3CABDA98535F6A2DD40D7D90A4C37DCD1D90DE`
- Staged blob OID: `121165e90372b847cd907d3d236253b759097896`
- Encoding: `UTF-8 / ASCII-compatible`
- BOM: `none`
- CR bytes: `0`
- LF bytes: `3`
- Final newline: `exactly one LF`
- Exact content match: `TRUE`

```gitattributes
* text=auto eol=lf
docs/evidence/** -text
compliance/THIRD_PARTY_NOTICES.html -text
```

## EOL and byte-preservation checks

- Baseline `git ls-files --eol` record count: `140`
- Baseline non-LF text path count: `6`
- Baseline non-LF set exact match: `PASS`
- Baseline `i/none` patch evidence count: `1`
- Baseline `i/none` path exact match: `PASS`
- `git check-attr text eol -- .`: `text=auto`, `eol=lf`
- Required `git add -n --renormalize .` execution: `exit 0`
- Dry-run listing behavior: `enumerated candidate inputs; not treated as a delta list`
- Attribute-aware `git hash-object --path` comparison count: `140`
- Existing tracked would-be blob mismatch count: `0`
- Dry renormalization existing tracked delta count: `0`
- Protected historical evidence paths under `docs/evidence/**`: `102`
- Protected notice paths: `1`
- Protected effective text attribute: `unset / -text` for all `103`
- Seven critical protected blob OID mismatch count: `0`
- Seven critical protected physical SHA-256 mismatch count: `0`
- Protected historical evidence byte mismatch count: `0`
- Third-party notice byte mismatch count: `0`
- Exact 18 clean-clone formatting paths with index EOL `lf`, `text=auto`, `eol=lf`, and no exception: `18/18 PASS`
- Complete row-level evidence: `RSM-3-I4-FIX2-EOL-POLICY-AND-BYTE-PRESERVATION-EVIDENCE.tsv`

## Full local validation

| Command | Exit | Result |
|---|---:|---|
| `pnpm.cmd run format:check` | 0 | PASS |
| `pnpm.cmd run lint` | 0 | PASS |
| `pnpm.cmd run typecheck` | 0 | PASS |
| `pnpm.cmd run test` | 0 | PASS — 2 files, 34 tests |
| `pnpm.cmd run arch:check` | 0 | PASS — 0 dependency violations |
| `pnpm.cmd run deadcode:check` | 0 | PASS |
| `pnpm.cmd run build` | 0 | PASS |
| `pnpm.cmd run validate` | 0 | PASS |
| `pnpm.cmd run compliance:check` | 0 | PASS |
| `pnpm.cmd run dependency:audit` | 0 | PASS — 1 visible low advisory, 0 blocking high-or-greater findings |
| `pnpm.cmd run ci:validate` | 0 | PASS |

- Mandatory failure count: `0`
- Compliance result: `PASS`
- Compliance artifact byte stability: `TRUE`
- Security blocker count: `0`
- Open low advisory count: `1`
- `pnpm-lock.yaml` SHA-256 before/after: `CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0` / same
- `package.json` SHA-256 before/after: `6BDC5C42D6E3AF3BBACC8A423BC94FAA8DC17287AF54C84052EE0D45734A324A` / same
- Lockfile drift: `0`
- Direct dependency drift: `0`
- Existing tracked unstaged drift: `0`
- Protected evidence byte drift: `0`
- Notice byte drift: `0`

## Final boundary

- Staged paths: `1`
- Staged entry: `A .gitattributes`
- Existing tracked staged paths: `0`
- Unstaged tracked paths: `0`
- Unexpected untracked paths: `0`
- Exact patch diff headers: `1`
- Exact patch bytes: `293`
- Exact patch SHA-256: `FB505B4902C5E863261485670DC0A33D031338074A1C86B5BF5109AE42CECC8D`
- Commit: `FALSE`
- Push: `FALSE`
- I4 closed: `FALSE`
- V1 authorized: `FALSE`

`READY FOR CHATGPT INDEPENDENT RSM-3-I4-FIX2 STAGED-CONTENT REVIEW`
