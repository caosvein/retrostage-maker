# RSM-3-A — Controlled Tool Remediation Prompt

## Task

Install and verify only the owner-authorized bootstrap tools required to remove the current workstation tool blockers.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

This remains an audit/remediation workspace. It is not the future repository.

## Executor identity

Record:

```text
Executor application: Antigravity IDE
Exact executor model label: <EXACT DISPLAYED MODEL LABEL>
Execution date/time/timezone: <OBSERVED>
```

Do not infer the model label.

## Governing inputs

Read fully before execution:

```text
Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md
Outputs\RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md
Outputs\RSM-3-A-READINESS-REPORT.md
Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv
Prompts\RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md
```

Expected hashes:

```text
RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md
18BED1CDE587DB5C689B638CF38CD88CB2D95806E4F5B9AD86ED8B99A5E03A71

RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md
0FED4E447F1CE937080516A4E4AF2565DE58DDBCA605A0203A39DE7129BA43E0

RSM-3-A-READINESS-REPORT.md
18A29E7A47F6EDEEFF905E6DD37F9262C91547978141D0F150D6038213DB787F

RSM-3-A-TOOLCHAIN-INVENTORY.tsv
65C0E5D40D08AD818D2BEDB5040D4EBBE6597FC3F70B6CCAA42B44167A0CE8A5
```

If a required file is missing or any expected hash differs, stop with:

```text
BLOCKED — REMEDIATION INPUT BASELINE MISMATCH
```

## Approved exact version lock

```text
Git for Windows: 2.55.0.3
Node.js: 24.19.0 LTS
Expected npm: 11.17.0
GitHub CLI: 2.97.0
pnpm: 11.17.0
LongPathsEnabled target: 1
```

No alternative version may be silently substituted.

## Authorized mutations

Only these persistent changes are authorized:

1. Install Git for Windows `2.55.0.3`.
2. Install Node.js `24.19.0` x64.
3. Install GitHub CLI `2.97.0`.
4. Install pnpm `11.17.0` globally through the verified npm that ships with Node.js.
5. Set `HKLM\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled` to DWORD `1`.
6. Create temporary remediation/download/log files inside:
   `C:\RetroStage\bootstrap\RSM-3-A\ToolRemediation`.
7. Create exactly one permanent evidence file:
   `Outputs\RSM-3-A-TOOL-REMEDIATION-REPORT.md`.

## Forbidden actions

Do not:

- create `C:\RetroStage\retrostage-maker`;
- run `git init`, `git clone`, `git commit`, `git push`, or any repository mutation;
- configure global Git name/email;
- configure repository-local Git identity because the repository does not yet exist;
- run `gh auth login` or perform authentication;
- access, create, modify, or push the GitHub repository;
- install product dependencies such as Electron, Babylon.js, React, TypeScript, Vitest, Playwright, or Vite;
- install Visual Studio, Build Tools, Windows SDK, Python, CMake, Ninja, Git LFS, or PowerShell 7;
- activate/update Corepack;
- create clean-clone, restore-test, backup, active-source, or historical-source paths;
- modify existing Sources, Prompts, primary audit outputs, prior Codex reviews, or owner-decision files;
- expose tokens, credentials, cookies, or private keys;
- proceed to RSM-3-B.

## Phase 0 — Baseline and privilege preflight

Run and retain exact output:

```powershell
$ErrorActionPreference = 'Stop'

$workspace = 'C:\RetroStage\bootstrap\RSM-3-A'
$remediationRoot = Join-Path $workspace 'ToolRemediation'
$downloadRoot = Join-Path $remediationRoot 'Downloads'
$logRoot = Join-Path $remediationRoot 'Logs'

[Environment]::Is64BitOperatingSystem
[Environment]::Is64BitProcess
$PSVersionTable.PSVersion
whoami
whoami /groups
Get-ExecutionPolicy -List
Get-Command winget -ErrorAction SilentlyContinue
winget --version
winget source list

Get-Command git,node,npm,pnpm,corepack,gh -ErrorAction SilentlyContinue |
  Select-Object Name,CommandType,Source,Version

where.exe git 2>&1
where.exe node 2>&1
where.exe npm 2>&1
where.exe pnpm 2>&1
where.exe corepack 2>&1
where.exe gh 2>&1

Get-ItemProperty `
  'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name LongPathsEnabled |
  Select-Object LongPathsEnabled

Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'
```

Preflight rules:

- Operating system and process must be x64.
- WinGet must be available.
- Candidate repository and validation/backup paths must remain absent unless the owner has separately created one outside this task.
- If an owner-controlled installation of Git, Node, pnpm, or gh is unexpectedly found, stop and report it rather than overwriting it.
- Ignore private executables inside Antigravity/Codex runtime caches; they are not the workstation toolchain.

Create the remediation directories only after preflight passes:

```powershell
New-Item -ItemType Directory -Force -Path `
  $remediationRoot,$downloadRoot,$logRoot | Out-Null
```

## Phase 1 — Verify exact WinGet package availability

Run:

```powershell
winget show --exact --id Git.Git --version 2.55.0.3 --source winget
winget show --exact --id OpenJS.NodeJS.LTS --version 24.19.0 --source winget
winget show --exact --id GitHub.cli --version 2.97.0 --source winget
```

Record for each:

- package identifier;
- version;
- publisher;
- installer type;
- installer URL if shown;
- installer SHA-256 if shown;
- agreement/license metadata;
- command exit code.

If any exact package/version is unavailable, stop before all installations with:

```text
BLOCKED — EXACT PACKAGE VERSION UNAVAILABLE
```

Do not substitute another version or package ID.

## Phase 2 — Install Git for Windows

Run only after Phase 1 passes:

```powershell
winget install --exact --id Git.Git --version 2.55.0.3 `
  --source winget `
  --accept-package-agreements `
  --accept-source-agreements `
  --disable-interactivity
```

Capture the full output and exit code.

Refresh the current process PATH from machine and user PATH:

```powershell
$machinePath = [Environment]::GetEnvironmentVariable('Path','Machine')
$userPath = [Environment]::GetEnvironmentVariable('Path','User')
$env:Path = $machinePath + ';' + $userPath
```

Verify:

```powershell
git --version
(Get-Command git).Source
git config --show-origin --get-all credential.helper
git config --global --list --show-origin
```

Expected Git version output must correspond to `2.55.0.windows.3`.

Do not set name/email or any other Git configuration.

## Phase 3 — Install Node.js

Run:

```powershell
winget install --exact --id OpenJS.NodeJS.LTS --version 24.19.0 `
  --source winget `
  --accept-package-agreements `
  --accept-source-agreements `
  --disable-interactivity
```

Capture full output and exit code, refresh PATH again, then verify:

```powershell
node --version
npm --version
(Get-Command node).Source
(Get-Command npm).Source
node -p "process.arch"
node -p "process.platform"
```

Required results:

```text
node: v24.19.0
npm: 11.17.0
arch: x64
platform: win32
```

If npm differs, record the exact observed value and stop before pnpm installation.

Inspect Corepack without changing it:

```powershell
Get-Command corepack -ErrorAction SilentlyContinue |
  Select-Object Name,CommandType,Source,Version

corepack --version 2>&1
```

Do not run `corepack enable`, `corepack prepare`, `corepack install`, or an npm Corepack update.

## Phase 4 — Install GitHub CLI

Run:

```powershell
winget install --exact --id GitHub.cli --version 2.97.0 `
  --source winget `
  --accept-package-agreements `
  --accept-source-agreements `
  --disable-interactivity
```

Capture full output and exit code, refresh PATH, then verify:

```powershell
gh --version
(Get-Command gh).Source
gh auth status
```

`gh auth status` is a read-only check and is expected to report no authenticated account. Do not authenticate.

## Phase 5 — Install exact pnpm through npm

Use the verified npm command:

```powershell
npm install --global pnpm@11.17.0
```

Capture full output and exit code.

Verify:

```powershell
pnpm --version
(Get-Command pnpm).Source
npm root --global
npm prefix --global
npm list --global --depth=0
```

Required pnpm version:

```text
11.17.0
```

Do not use pnpm to create a project or install any product dependency.

## Phase 6 — Enable Windows long paths

This is the only authorized registry mutation.

Record the current value first:

```powershell
Get-ItemProperty `
  'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name LongPathsEnabled |
  Select-Object LongPathsEnabled
```

Then run the following only with explicit one-time elevation/owner approval:

```powershell
reg.exe add `
  'HKLM\SYSTEM\CurrentControlSet\Control\FileSystem' `
  /v LongPathsEnabled `
  /t REG_DWORD `
  /d 1 `
  /f
```

Verify:

```powershell
Get-ItemProperty `
  'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name LongPathsEnabled |
  Select-Object LongPathsEnabled
```

Required final value:

```text
1
```

If elevation is unavailable, do not retry through another mechanism. Record:

```text
LONG PATHS: PENDING OWNER-ELEVATED STEP
```

## Phase 7 — Final workstation verification

Open a fresh PowerShell 5.1 process or refresh PATH, then run:

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

Expected final tool state:

```text
Git: 2.55.0.windows.3
Node.js: v24.19.0
npm: 11.17.0
pnpm: 11.17.0
GitHub CLI: 2.97.0
GitHub authentication: NOT AUTHENTICATED
LongPathsEnabled: 1, or explicitly pending elevation
Repository: NOT CREATED
```

## Permanent evidence output

Create exactly:

```text
Outputs\RSM-3-A-TOOL-REMEDIATION-REPORT.md
```

Required sections:

1. Executor identity and exact model label
2. Governing input/hash verification
3. Pre-remediation state
4. WinGet availability and source evidence
5. Exact package metadata
6. Installation commands, output, and exit codes
7. Post-install paths and versions
8. pnpm activation-method decision
9. Corepack inspection
10. LongPathsEnabled before/after
11. GitHub authentication state
12. Files/directories created or modified
13. Forbidden-action confirmation
14. Remaining blockers
15. Final remediation decision

Final decision must be exactly one of:

```text
TOOLS REMEDIATED — AUTHENTICATION PENDING
PARTIAL REMEDIATION — OWNER ACTION REQUIRED
BLOCKED
```

The last non-empty line must be the exact decision token.

## Success meaning

`TOOLS REMEDIATED — AUTHENTICATION PENDING` means only:

- exact tools are installed and verified;
- long paths are enabled;
- authentication has not occurred;
- no repository exists;
- RSM-3-B remains blocked.

It does not authorize repository creation, authentication, source import, dependency installation, or RSM-3-B entry.

## Final chat response

Return:

- exact executor model label;
- all baseline hashes;
- WinGet version;
- exact installed versions and paths;
- install exit codes;
- Corepack observed state;
- LongPathsEnabled before/after;
- GitHub authentication state;
- created/modified files and directories;
- remaining blockers;
- report path;
- final decision.
