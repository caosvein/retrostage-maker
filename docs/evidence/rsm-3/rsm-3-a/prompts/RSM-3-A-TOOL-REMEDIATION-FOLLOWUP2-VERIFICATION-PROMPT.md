# RSM-3-A — Tool Remediation FOLLOWUP2 Verification After Owner-Elevated Steps

## Purpose

Verify the owner-completed elevated installation of Git for Windows and the owner-completed LongPaths registry change. Also verify the previously installed Node.js/npm/pnpm/GitHub CLI toolchain in a genuinely fresh process.

This is a verification-only Antigravity task. Do not install, elevate, authenticate, configure Git identity, or create a repository.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

## Required owner actions before running this prompt

The owner must first:

1. Locate and resolve the unexpected `task.md` artifact as directed outside this prompt.
2. Open **Windows PowerShell 5.1 as Administrator**.
3. Install Git for Windows exactly:
   `2.55.0.3`.
4. Set `LongPathsEnabled` to `1`.
5. Close the elevated PowerShell.
6. Completely exit Antigravity and all existing terminal windows.
7. Reopen Antigravity with the same workspace in a normal, non-elevated session.

Do not run this prompt until those owner actions are complete.

## Executor identity

Record:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED LABEL>
Execution date/time/timezone: <OBSERVED>
```

## Governing evidence

Read fully:

```text
Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP1-REPORT.md
```

Expected SHA-256:

```text
01D09406A1BE4B110CDB1BC399684FEDF8C49199A33E55DB1DD00FF65CEFE47A
```

Also verify these immutable files:

```text
Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md
18BED1CDE587DB5C689B638CF38CD88CB2D95806E4F5B9AD86ED8B99A5E03A71

Outputs\RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md
0FED4E447F1CE937080516A4E4AF2565DE58DDBCA605A0203A39DE7129BA43E0

Outputs\RSM-3-A-READINESS-REPORT.md
18A29E7A47F6EDEEFF905E6DD37F9262C91547978141D0F150D6038213DB787F

Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
65C0E5D40D08AD818D2BEDB5040D4EBBE6597FC3F70B6CCAA42B44167A0CE8A5

Outputs\RSM-3-A-TOOL-REMEDIATION-REPORT.md
26BDA6CC36D3E881AB0E3FED9269C99316E90DA00CEC3E01030A621BD5D23434
```

If any hash differs, create the report with:

```text
BLOCKED — FOLLOWUP2 BASELINE MISMATCH
```

## Exact expected tool state

```text
WinGet: available
Git: 2.55.0.windows.3
Node.js: v24.19.0
npm: 11.17.0
pnpm: 11.17.0
GitHub CLI: 2.97.0
Corepack: present but not activated/updated
LongPathsEnabled: 1
GitHub authentication: not authenticated
Repository: not created
Git identity: not configured by this task
```

## Allowed actions

You may:

- read the governing files;
- compute hashes;
- execute non-destructive tool/version/PATH/registry/auth-status/path-absence checks;
- locate `task.md` read-only;
- create exactly one permanent file:
  `Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP2-VERIFICATION-REPORT.md`.

## Forbidden actions

Do not:

- install, repair, update, or uninstall any application;
- request elevation or invoke `RunAs`;
- write the registry;
- configure Git name/email or credential helpers;
- authenticate with GitHub;
- run `git init`, `git clone`, commit, push, fetch, pull, remote, or repository commands;
- create candidate repository, clean-clone, restore-test, or backup paths;
- enable/update Corepack;
- install project dependencies;
- modify or delete `task.md`;
- modify any existing report, source, prompt, manifest, review, or decision file;
- proceed to RSM-3-B.

## Phase 1 — Fresh-process identity and PATH

Run:

```powershell
$ErrorActionPreference = 'Continue'

$PSVersionTable.PSVersion
[Environment]::Is64BitOperatingSystem
[Environment]::Is64BitProcess
whoami

[Environment]::GetEnvironmentVariable('Path','Machine')
[Environment]::GetEnvironmentVariable('Path','User')
$env:Path
```

Record exact output relevant to tool paths.

## Phase 2 — WinGet and App Installer

Run:

```powershell
Get-AppxPackage Microsoft.DesktopAppInstaller |
  Select-Object Name, PackageFullName, Version, InstallLocation, Status

Get-Command winget |
  Select-Object Name, CommandType, Source, Version

where.exe winget.exe
winget --version
winget --info
```

## Phase 3 — Tool versions and resolved paths

Use executable/cmd names that avoid PowerShell script-policy ambiguity:

```powershell
git.exe --version
node.exe --version
npm.cmd --version
pnpm.cmd --version
gh.exe --version

Get-Command git.exe,node.exe,npm.cmd,pnpm.cmd,gh.exe |
  Select-Object Name,CommandType,Source,Version

where.exe git.exe
where.exe node.exe
where.exe npm.cmd
where.exe pnpm.cmd
where.exe gh.exe

node.exe -p "process.arch"
node.exe -p "process.platform"

npm.cmd root --global
npm.cmd prefix --global
npm.cmd list --global --depth=0
```

Required:

```text
git version 2.55.0.windows.3
v24.19.0
11.17.0
11.17.0
gh version 2.97.0
x64
win32
```

If duplicate tool executables are found, list every path and determine which one resolves first. Do not change PATH.

## Phase 4 — Corepack inspection only

Run:

```powershell
Get-Command corepack.cmd -ErrorAction SilentlyContinue |
  Select-Object Name,CommandType,Source,Version

where.exe corepack.cmd 2>&1
corepack.cmd --version 2>&1
```

Do not run any Corepack mutation.

## Phase 5 — Long paths

Run:

```powershell
Get-ItemProperty `
  'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name LongPathsEnabled |
  Select-Object LongPathsEnabled
```

Required:

```text
LongPathsEnabled = 1
```

## Phase 6 — Git configuration and authentication status

Run read-only checks:

```powershell
git.exe config --global --list --show-origin 2>&1
git.exe config --system --list --show-origin 2>&1
gh.exe auth status 2>&1
```

Expected:

- no Git identity added by this remediation task;
- GitHub is not authenticated.

Do not print credential values if any unexpected credential helper metadata appears.

## Phase 7 — Path and repository absence

Run:

```powershell
Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'

Get-ChildItem `
  -LiteralPath 'C:\RetroStage\bootstrap\RSM-3-A' `
  -Filter 'task.md' `
  -File `
  -Recurse `
  -Force `
  -ErrorAction SilentlyContinue |
  Select-Object FullName,Length,CreationTime,LastWriteTime
```

The four candidate paths must remain absent.

For `task.md`, report:

- no match; or
- exact path, size, creation time, and last-write time.

Do not modify or delete it.

## Phase 8 — Existing-evidence immutability

Recompute all governing hashes after verification and confirm they remain unchanged.

## Required permanent report

Create exactly:

```text
Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP2-VERIFICATION-REPORT.md
```

Required sections:

1. Executor identity
2. Baseline hash verification
3. Prior FOLLOWUP1 result
4. Fresh-process/PATH evidence
5. WinGet/App Installer evidence
6. Exact tool versions and paths
7. Duplicate-path assessment
8. Corepack observation
9. LongPathsEnabled result
10. Git configuration state
11. GitHub authentication state
12. Candidate-path absence
13. `task.md` artifact finding
14. Existing-file immutability
15. Remaining blockers
16. Final decision

Final decision exactly one of:

```text
TOOLS REMEDIATED — AUTHENTICATION PENDING
PARTIAL REMEDIATION — OWNER ACTION REQUIRED
BLOCKED
```

Use `TOOLS REMEDIATED — AUTHENTICATION PENDING` only when:

- all exact versions match;
- all required executables resolve in the fresh process;
- LongPathsEnabled is `1`;
- GitHub remains unauthenticated;
- no repository/validation/backup path exists;
- no existing governing file changed.

The final non-empty line must be the exact decision token.

Do not authenticate or create the repository.
