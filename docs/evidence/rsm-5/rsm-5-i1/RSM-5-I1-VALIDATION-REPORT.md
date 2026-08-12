# RSM-5-I1 Validation Report

## Baseline and Scope

Baseline `74304c858782c27d73f1294c2c430af4def6e128`; exact 49-path repository boundary and two live Source paths. The controlled resume preserved the verified `10 modified + 17 untracked` partial worktree and applied only the authorized parent-scoped `eslint@9.21.0>@eslint/plugin-kit = 0.3.4` override before continuing the implementation.

FIX2 preserved the independently reviewed exact staged baseline in place, applied the Human Project Owner's exact 14-identity Windows/x64 license authority, removed 10 non-current-platform Lightning CSS pre-approvals, and corrected current Source truth without changing the implementation/dependency boundary.

## Commands and Results

| Gate | Physical result |
| --- | --- |
| `pnpm run format:check` | PASS |
| `pnpm run lint` | PASS; the prior 28 unfinished-state errors are zero |
| root and Electron `typecheck` | PASS |
| `pnpm run test` | PASS; 5 files / 65 tests |
| `pnpm run arch:check` | PASS; 9 modules / 7 dependencies / 0 violations |
| `pnpm run deadcode:check` | PASS |
| Vite main/preload/renderer build | PASS |
| `pnpm run workflow:check` | PASS; 0 issues |
| Forge package | PASS; 5/5 build outputs byte-identical and packaged `node_modules` absent |
| development Electron smoke | PASS; secure preferences, denied navigation/window creation, clean exit, 0 remaining app processes |
| packaged Electron smoke | PASS; secure preferences, denied navigation/window creation, clean exit, 0 remaining app processes |
| `pnpm run compliance:check` | PASS; all eight artifacts byte-stable, exact current-host owner identities 14/14, 0 license/security/native/notice blockers |
| `pnpm audit --audit-level=high` | PASS; no known vulnerabilities |
| `pnpm run validate` | PASS |
| `pnpm run ci:validate` | PASS, including frozen-lockfile install |
| `git diff --check` | PASS |

The canonical lockfile SHA-256 is `4D37238789E79449714AB68BE05585E5FE1F524F997ADF0C77BA93B985E0A977`. The current audit summary is `info=0, low=0, moderate=0, high=0, critical=0`. Electron `43.4.0`, Forge core `7.11.2`, and Vite `8.2.1` are the only Electron workspace direct dependencies.

Current-host license evidence records exactly 14 owner-approved identities, including the two prior approvals and twelve FIX2 approvals. Non-current-platform owner exceptions are zero. The Forge unpackaged application's 22 resource files contain no Lightning CSS path/text/native-hash match, packaged `node_modules` is absent, and MPL-covered Lightning CSS is therefore recorded as build-only/physically absent with a future artifact-specific source-availability recheck required. Source 02 SHA-256 is `2389C07AFDA7316B6930D89827B9F31329FBCA118342BB8B014AFD2DB15DC9C2`; Source 08 SHA-256 is `B8CFC468D68D938A9741E41DF955E7377D76F4DCE24AEA39757D45C062319350`.

## Negative / Failure Evidence

The previous partial-state 28 lint errors were repaired rather than waived. The earlier FIX1 proof remained blocked under its own contract and is preserved as historical evidence.

## Final Repository Inventory

The completed pre-staging candidate is exactly `27 modified + 22 added = 49` paths with no path outside the original boundary. After exact staging, the external staged inventory and cached patch are controlling evidence for the final index identity.

## Decision

`READY FOR CHATGPT INDEPENDENT RSM-5-I1-FIX2 / STAGED-CANDIDATE RE-REVIEW` after exact restaging and external physical capture. No commit or push is authorized or represented.
