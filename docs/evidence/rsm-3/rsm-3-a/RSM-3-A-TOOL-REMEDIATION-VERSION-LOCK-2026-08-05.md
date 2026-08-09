# RSM-3-A — Tool Remediation Version Lock

**Research date:** 2026-08-05  
**Scope:** Windows x64 bootstrap tools only  
**Repository creation:** Not authorized in this slice  
**Authentication:** Deferred until installation evidence is accepted

## Approved exact versions

| Tool | Exact version | Installation decision |
|---|---:|---|
| Git for Windows | `2.55.0.3` | WinGet exact package `Git.Git` |
| Node.js | `24.19.0` LTS (Krypton) | WinGet exact package `OpenJS.NodeJS.LTS` |
| npm | `11.17.0` | Expected with Node.js 24.19.0 |
| GitHub CLI | `2.97.0` | WinGet exact package `GitHub.cli` |
| pnpm | `11.17.0` | Exact global install through npm after Node verification |
| Corepack | Inspection only | Do not activate or update in this slice |
| LongPathsEnabled | `1` | Owner-authorized elevated registry change |

## Rationale

- Git for Windows 2.55.0(3) is the current stable release selected for Windows x64.
- Node.js 24.19.0 is the current Node 24 LTS release and carries npm 11.17.0.
- GitHub CLI 2.97.0 is the selected current stable release.
- pnpm 11.17.0 is the selected stable pnpm 11 release. pnpm 12 remains prerelease/beta and is not admitted.
- pnpm will be installed through npm rather than Corepack to avoid making the experimental Corepack path part of the initial bootstrap contract.
- All installations must be exact-version, verified after installation, and recorded before authentication or repository creation.
