# RSM-3-A — Controlled Tool Remediation FOLLOWUP1 After WinGet Bootstrap

## Purpose

Continue the previously blocked tool-remediation task only after the owner has installed or registered Microsoft App Installer and verified that `winget` is available.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

The first attempt is immutable evidence:

```text
Outputs\RSM-3-A-TOOL-REMEDIATION-REPORT.md
SHA-256: 26BDA6CC36D3E881AB0E3FED9269C99316E90DA00CEC3E01030A621BD5D23434
Decision: BLOCKED
Reason: WinGet unavailable
```

Do not modify or replace that report.

## Executor identity

Record:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED LABEL>
Execution date/time/timezone: <OBSERVED>
```

## Governing files

Read fully and verify:

```text
Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md
SHA-256:
18BED1CDE587DB5C689B638CF38CD88CB2D95806E4F5B9AD86ED8B99A5E03A71

Outputs\RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md
SHA-256:
0FED4E447F1CE937080516A4E4AF2565DE58DDBCA605A0203A39DE7129BA43E0

Outputs\RSM-3-A-READINESS-REPORT.md
SHA-256:
18A29E7A47F6EDEEFF905E6DD37F9262C91547978141D0F150D6038213DB787F

Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
SHA-256:
65C0E5D40D08AD818D2BEDB5040D4EBBE6597FC3F70B6CCAA42B44167A0CE8A5

Prompts\RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md
SHA-256:
901D6B0F68E4FD5AE4ACB34F6FA66153E2F9DB96B34C917D21E14E51C2D9ED8C

Outputs\RSM-3-A-TOOL-REMEDIATION-REPORT.md
SHA-256:
26BDA6CC36D3E881AB0E3FED9269C99316E90DA00CEC3E01030A621BD5D23434
```

If any differs, stop with:

```text
BLOCKED — FOLLOWUP1 BASELINE MISMATCH
```

## Exact version lock

```text
Git for Windows: 2.55.0.3
Node.js: 24.19.0 LTS
Expected npm: 11.17.0
GitHub CLI: 2.97.0
pnpm: 11.17.0
LongPathsEnabled target: 1
```

Do not silently substitute versions.

## Allowed permanent changes

Only:

1. Install Git for Windows `2.55.0.3`.
2. Install Node.js `24.19.0` x64.
3. Install GitHub CLI `2.97.0`.
4. Install pnpm `11.17.0` globally using the verified npm.
5. Set `LongPathsEnabled` to DWORD `1`, using explicit one-time elevation.
6. Create remediation logs under:
   `C:\RetroStage\bootstrap\RSM-3-A\ToolRemediation\FOLLOWUP1`.
7. Create exactly one permanent report:
   `Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP1-REPORT.md`.

## Forbidden actions

Do not:

- modify the first blocked remediation report;
- create `C:\RetroStage\retrostage-maker`;
- run `git init`, `git clone`, commit, push, or remote commands;
- run `gh auth login`;
- set Git name/email;
- create clean-clone, restore-test, or backup directories;
- install project/product dependencies;
- activate/update Corepack;
- install Visual Studio, Build Tools, SDK, Python, CMake, Ninja, Git LFS, or PowerShell 7;
- modify Sources, Prompts, prior outputs, reviews, or owner-decision files;
- proceed to RSM-3-B.

## Phase 0 — WinGet verification

Run:

```powershell
$ErrorActionPreference = 'Stop'

Get-AppxPackage Microsoft.DesktopAppInstaller |
  Select-Object Name, PackageFullName, Version, InstallLocation, Status

Get-Command winget |
  Select-Object Name, CommandType, Source, Version

where.exe winget.exe
winget --version
winget --info
winget source list
```

Requirements:

- `Microsoft.DesktopAppInstaller` must be registered for the current user.
- `winget` must resolve outside Antigravity/Codex private runtime caches.
- `winget --version` must succeed.
- The `winget` source must be available.

If not, stop:

```text
BLOCKED — WINGET BOOTSTRAP INCOMPLETE
```

Do not attempt another App Installer repair inside this follow-up.

## Phase 1 — Confirm no unexpected tool installation

Run:

```powershell
Get-Command git,node,npm,pnpm,corepack,gh -ErrorAction SilentlyContinue |
  Select-Object Name,CommandType,Source,Version

where.exe git 2>&1
where.exe node 2>&1
where.exe npm 2>&1
where.exe pnpm 2>&1
where.exe corepack 2>&1
where.exe gh 2>&1

Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'
```

If owner-controlled Git, Node, pnpm, or gh unexpectedly exists, stop and report rather than overwriting it.

## Phase 2 — Exact WinGet package metadata

Run:

```powershell
winget source update

winget show --exact --id Git.Git --version 2.55.0.3 --source winget
winget show --exact --id OpenJS.NodeJS.LTS --version 24.19.0 --source winget
winget show --exact --id GitHub.cli --version 2.97.0 --source winget
```

Record full output and `$LASTEXITCODE` for each.

If an exact version is unavailable, stop before installing anything:

```text
BLOCKED — EXACT WINGET PACKAGE VERSION UNAVAILABLE
```

Do not substitute a newer/older version.

## Phase 3 — Install and verify Git

```powershell
winget install --exact --id Git.Git --version 2.55.0.3 `
  --source winget `
  --accept-package-agreements `
  --accept-source-agreements `
  --disable-interactivity
```

Record output and exit code.

Refresh PATH:

```powershell
$env:Path =
  [Environment]::GetEnvironmentVariable('Path','Machine') + ';' +
  [Environment]::GetEnvironmentVariable('Path','User')
```

Verify:

```powershell
git --version
(Get-Command git).Source
git config --global --list --show-origin
```

Required:

```text
git version 2.55.0.windows.3
```

Do not change Git configuration.

## Phase 4 — Install and verify Node.js/npm

```powershell
winget install --exact --id OpenJS.NodeJS.LTS --version 24.19.0 `
  --source winget `
  --accept-package-agreements `
  --accept-source-agreements `
  --disable-interactivity
```

Record output/exit code, refresh PATH, then:

```powershell
node --version
npm --version
(Get-Command node).Source
(Get-Command npm).Source
node -p "process.arch"
node -p "process.platform"
```

Required:

```text
v24.19.0
11.17.0
x64
win32
```

If npm is not `11.17.0`, stop before pnpm installation and report the exact observed value.

Inspect Corepack only:

```powershell
Get-Command corepack -ErrorAction SilentlyContinue |
  Select-Object Name,CommandType,Source,Version

corepack --version 2>&1
```

Do not enable or update Corepack.

## Phase 5 — Install and verify GitHub CLI

```powershell
winget install --exact --id GitHub.cli --version 2.97.0 `
  --source winget `
  --accept-package-agreements `
  --accept-source-agreements `
  --disable-interactivity
```

Record output/exit code, refresh PATH, then:

```powershell
gh --version
(Get-Command gh).Source
gh auth status
```

No authentication is expected. Do not authenticate.

## Phase 6 — Install and verify pnpm

```powershell
npm install --global pnpm@11.17.0
```

Record output/exit code, then:

```powershell
pnpm --version
(Get-Command pnpm).Source
npm root --global
npm prefix --global
npm list --global --depth=0
```

Required:

```text
11.17.0
```

Do not run `pnpm install` in any project directory.

## Phase 7 — Enable long paths

Read current state:

```powershell
Get-ItemProperty `
  'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name LongPathsEnabled |
  Select-Object LongPathsEnabled
```

With one-time explicit elevation:

```powershell
reg.exe add `
  'HKLM\SYSTEM\CurrentControlSet\Control\FileSystem' `
  /v LongPathsEnabled `
  /t REG_DWORD `
  /d 1 `
  /f
```

Verify final value.

If elevation is denied, record:

```text
LONG PATHS: PENDING OWNER-ELEVATED STEP
```

Do not use another privilege mechanism.

## Phase 8 — Fresh-shell final verification

Use a fresh Windows PowerShell 5.1 window/process and run:

```powershell
git --version
node --version
npm --version
pnpm --version
gh --version

(Get-Command git).Source
(Get-Command node).Source
(Get-Command npm).Source
(Get-Command pnpm).Source
(Get-Command gh).Source

git config --global --list --show-origin
gh auth status

Get-ItemProperty `
  'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name LongPathsEnabled |
  Select-Object LongPathsEnabled

Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'
```

## Required report

Create exactly:

```text
Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP1-REPORT.md
```

Sections:

1. Executor identity
2. Baseline hash verification
3. Prior blocked-attempt reference
4. App Installer and WinGet evidence
5. Exact package metadata
6. Install commands/output/exit codes
7. Installed versions and paths
8. Corepack observation
9. pnpm activation result
10. LongPathsEnabled before/after
11. GitHub authentication state
12. Existing files/directories modified or created
13. Forbidden-action confirmation
14. Remaining blockers
15. Final decision

Final decision exactly one of:

```text
TOOLS REMEDIATED — AUTHENTICATION PENDING
PARTIAL REMEDIATION — OWNER ACTION REQUIRED
BLOCKED
```

Last non-empty line must be the decision token.

Do not overwrite the original blocked report.
