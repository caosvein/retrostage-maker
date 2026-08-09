# RSM-3-A — Formal Readiness Refresh1 Prompt

## 1. Task

Perform the formal RSM-3-A readiness refresh after:

- audit-package correction and independent review;
- M-01 closure;
- owner-decision lock;
- exact tool remediation;
- GitHub authentication;
- private-remote verification;
- and explicit recording of the visibility-report overwrite incident.

This task must decide whether the current evidence now supports:

```text
READY FOR RSM-3-B
```

or remains:

```text
BLOCKED
```

This task does not create the local repository and does not begin RSM-3-B.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

## 2. Output non-overwrite guard — mandatory first action

The only authorized new output is:

```text
Outputs\RSM-3-A-READINESS-REFRESH1-REPORT.md
```

Before any other task work, run:

```powershell
$refreshOutput =
  'C:\RetroStage\bootstrap\RSM-3-A\Outputs\RSM-3-A-READINESS-REFRESH1-REPORT.md'

if (Test-Path -LiteralPath $refreshOutput) {
  Write-Host 'BLOCKED — READINESS REFRESH1 OUTPUT ALREADY EXISTS'
  exit 40
}
```

If the file already exists:

- stop immediately;
- do not read live state;
- do not modify or delete the existing file;
- do not create a differently named substitute;
- return `BLOCKED — READINESS REFRESH1 OUTPUT ALREADY EXISTS`.

Never overwrite an existing evidence file.

## 3. Executor identity

Record:

```text
Executor application: Antigravity IDE
Exact executor model label: <EXACT DISPLAYED MODEL LABEL>
Execution date/time/timezone: <OBSERVED>
```

Do not infer the model label.

## 4. Required full reads

Read these sources and evidence files fully:

1. `Sources\RSM-3-A-REPOSITORY-BOOTSTRAP-AUDIT-AND-READINESS-CONTRACT.md`
2. `Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
3. `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`
4. `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
5. `Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md`
6. `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv`
7. `Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv`
8. `Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md`
9. `Outputs\RSM-3-A-READINESS-REPORT.md`
10. `Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md`
11. `Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md`
12. `Outputs\RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md`
13. `Outputs\RSM-3-A-TOOL-REMEDIATION-REPORT.md`
14. `Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP1-REPORT.md`
15. `Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP2-VERIFICATION-REPORT.md`
16. `Outputs\RSM-3-A-GITHUB-AUTHENTICATION-AND-REMOTE-VERIFICATION-REPORT.md`
17. `Outputs\RSM-3-A-GITHUB-PRIVATE-VISIBILITY-RE-VERIFICATION-REPORT.md`
18. `Outputs\RSM-3-A-GITHUB-VISIBILITY-OVERWRITE-INCIDENT-NOTE.md`
19. `Prompts\RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md`

A search result, header, excerpt, or previous summary is not a full read.

## 5. Immutable input hashes

Verify before live inspection:

| File | Required SHA-256 |
|---|---|
| `Sources\RSM-3-A-REPOSITORY-BOOTSTRAP-AUDIT-AND-READINESS-CONTRACT.md` | `FCBDA15B020C2A726A20204382AEDD6B1CF6FAA153DD9C4BDB08920E3206EB11` |
| `Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md` | `8C618F89153F485A96CBE441214DC9C18CD2DE634500ED175A4938964F76C33C` |
| `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md` | `F0BB28A7E4CF0F1E0146E545ECA69B25F004100CA558B0DF4C031E56D9736F60` |
| `Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` | `5417B6C6CE30755EB38EC436FAC1AE214F1BD79681E0F6E65E5BB6DA23A818D8` |
| `Outputs\RSM-3-A-ENVIRONMENT-INVENTORY.md` | `7314CD705673106167D2A372A26753AF456E8181AD8809FD609C3AC32DA2FAB4` |
| `Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv` | `65CFEDA9CD2472B55CC557B0D70FC7F9D38A2DCE21102B2266920D57C9C0C8DA` |
| `Outputs\RSM-3-A-TOOLCHAIN-INVENTORY.tsv` | `65C0E5D40D08AD818D2BEDB5040D4EBBE6597FC3F70B6CCAA42B44167A0CE8A5` |
| `Outputs\RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md` | `4A57F7FBFA62FBC0C85AFB6351DA8595D377793133761B241C75AB6223BA7EE2` |
| `Outputs\RSM-3-A-READINESS-REPORT.md` | `18A29E7A47F6EDEEFF905E6DD37F9262C91547978141D0F150D6038213DB787F` |
| `Outputs\RSM-3-A-OWNER-DECISION-LOCK-2026-08-05.md` | `18BED1CDE587DB5C689B638CF38CD88CB2D95806E4F5B9AD86ED8B99A5E03A71` |
| `Outputs\RSM-3-A-CODEX-INDEPENDENT-REVIEW.md` | `CC99C65148C0E8DA90C3D6E23BB7D331AE046154981531AFB0AEA971DA0190DF` |
| `Outputs\RSM-3-A-CODEX-M-01-NARROW-RE-REVIEW.md` | `0FED4E447F1CE937080516A4E4AF2565DE58DDBCA605A0203A39DE7129BA43E0` |
| `Outputs\RSM-3-A-TOOL-REMEDIATION-REPORT.md` | `26BDA6CC36D3E881AB0E3FED9269C99316E90DA00CEC3E01030A621BD5D23434` |
| `Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP1-REPORT.md` | `01D09406A1BE4B110CDB1BC399684FEDF8C49199A33E55DB1DD00FF65CEFE47A` |
| `Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP2-VERIFICATION-REPORT.md` | `FB4303E16B41EA29C8AEECB958A045AFEEB9CAA4CB04E407EDCBDF6CD02D6D49` |
| `Outputs\RSM-3-A-GITHUB-AUTHENTICATION-AND-REMOTE-VERIFICATION-REPORT.md` | `6E86FB90C037648AC64809C0CED0D3D68484344975D04C0CA8331A3C0278446A` |
| `Outputs\RSM-3-A-GITHUB-PRIVATE-VISIBILITY-RE-VERIFICATION-REPORT.md` | `E4F405C3C26DC8E44F1BF0038CB9A04BBE97F344F903C016FD5D7CA80A7F4BFD` |
| `Outputs\RSM-3-A-GITHUB-VISIBILITY-OVERWRITE-INCIDENT-NOTE.md` | `5D6C75DF507B53D94BE6C2E194ACE77A6BF4B8810DFE731C0487E9CE12D7BB4B` |
| `Prompts\RSM-3-A-TOOL-REMEDIATION-VERSION-LOCK-2026-08-05.md` | `901D6B0F68E4FD5AE4ACB34F6FA66153E2F9DB96B34C917D21E14E51C2D9ED8C` |

If any file is missing or any hash differs:

1. create only the authorized Refresh1 report;
2. record every mismatch;
3. end it with exactly:

```text
BLOCKED
```

Do not continue into live readiness inspection.

## 6. Authority and historical-state rule

The original:

```text
Outputs\RSM-3-A-READINESS-REPORT.md
```

must remain unchanged as historical evidence of the earlier `BLOCKED` state.

This Refresh1 report may supersede only the current readiness decision after later evidence. It does not erase or rewrite the earlier blockers.

The overwritten visibility-specific report must remain unchanged. The incident note is the authority for how that overwrite is interpreted.

## 7. Forbidden actions

Do not:

- modify, replace, rename, or delete any existing file;
- modify the primary audit outputs;
- modify prior Codex reviews or remediation/authentication reports;
- install, update, repair, or uninstall any tool;
- change registry, PATH, Git configuration, credentials, or authentication;
- display or record tokens;
- set Git `user.name` or `user.email`;
- create, initialize, or clone a repository;
- create clean-clone, restore-test, backup, active-source, or archive directories;
- run `git init`, clone, fetch, pull, commit, tag, push, or remote mutation;
- modify the GitHub repository;
- install TypeScript or any product/development dependency;
- write final source 07;
- update sources 02 or 08;
- begin RSM-3-B;
- claim RSM-3 is complete.

## 8. Live environment re-verification

Run exact read-only checks and retain relevant output.

### 8.1 Shell, tools, and long paths

```powershell
$ErrorActionPreference = 'Continue'

$PSVersionTable.PSVersion
[Environment]::Is64BitOperatingSystem
[Environment]::Is64BitProcess

winget.exe --version
git.exe --version
node.exe --version
npm.cmd --version
pnpm.cmd --version
gh.exe --version

Get-Command winget.exe,git.exe,node.exe,npm.cmd,pnpm.cmd,gh.exe |
  Select-Object Name,CommandType,Source,Version

node.exe -p "process.arch"
node.exe -p "process.platform"

Get-Command corepack.cmd -ErrorAction SilentlyContinue |
  Select-Object Name,CommandType,Source,Version
corepack.cmd --version 2>&1

Get-ItemProperty `
  'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
  -Name LongPathsEnabled |
  Select-Object LongPathsEnabled
```

Required current values:

```text
Windows PowerShell: 5.1
Git: 2.55.0.windows.3
Node.js: v24.19.0
npm: 11.17.0
pnpm: 11.17.0
GitHub CLI: 2.97.0
Node architecture: x64
Node platform: win32
Corepack: present, not activated or updated by RSM-3-A
LongPathsEnabled: 1
```

### 8.2 Authentication and private remote

```powershell
gh.exe auth status --active --hostname github.com
gh.exe api user --jq '.login'
gh.exe config get git_protocol --host github.com

gh.exe api repos/caosvein/retrostage-maker `
  --jq '{
    full_name: .full_name,
    owner_login: .owner.login,
    private: .private,
    visibility: .visibility,
    archived: .archived,
    disabled: .disabled,
    default_branch: .default_branch,
    size: .size,
    clone_url: .clone_url,
    permissions: .permissions
  }'

git.exe ls-remote `
  https://github.com/caosvein/retrostage-maker.git

"LS_REMOTE_EXIT_CODE=$LASTEXITCODE"
```

Required:

```text
active account: caosvein
protocol: https
repository: caosvein/retrostage-maker
private: true
visibility: private
archived: false
disabled: false
default branch: main
clone URL: https://github.com/caosvein/retrostage-maker.git
admin/push/pull access: true
ls-remote exit code: 0
```

An empty `ls-remote` output is acceptable when its exit code is `0`, because the repository may still be empty.

Do not expose tokens.

### 8.3 Git identity and candidate-path guard

```powershell
git.exe config --global --get-all user.name 2>&1
git.exe config --global --get-all user.email 2>&1

Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'
```

Required:

- no Git author identity has yet been configured by RSM-3-A;
- all four candidate paths remain absent.

Repository-local identity planned for the later authorized repository slice:

```text
user.name = caosvein
user.email = caosvein@gmail.com
```

Do not configure it now.

### 8.4 Storage and target viability

```powershell
Get-Partition |
  Where-Object { $_.DriveLetter -in @('C','D') } |
  ForEach-Object {
    $disk = Get-Disk -Number $_.DiskNumber
    $volume = Get-Volume -DriveLetter $_.DriveLetter

    [pscustomobject]@{
      DriveLetter     = [string]$_.DriveLetter
      DiskNumber      = $_.DiskNumber
      DiskModel       = $disk.FriendlyName
      BusType         = $disk.BusType
      FileSystem      = $volume.FileSystemType
      FreeGB          = [math]::Round($volume.SizeRemaining / 1GB, 2)
      HealthStatus    = $volume.HealthStatus
      OperationalStatus = ($volume.OperationalStatus -join ',')
    }
  } |
  Sort-Object DriveLetter |
  Format-Table -AutoSize

Test-Path 'C:\RetroStage'
Test-Path 'D:\'
```

Confirm:

```text
C: and D: remain distinct verified physical devices
C: remains the canonical repository-drive candidate
D: remains the local backup/clean-clone/restore target drive
```

Do not claim D: is off-device from the workstation.

### 8.5 Source-bundle integrity

Use the manifest to verify every current source/prompt file:

```powershell
$workspace = 'C:\RetroStage\bootstrap\RSM-3-A'
$manifestPath =
  Join-Path $workspace 'Outputs\RSM-3-A-SOURCE-READ-MANIFEST.tsv'

$manifest = Import-Csv -Delimiter "`t" -LiteralPath $manifestPath

$sourceResults = foreach ($row in $manifest) {
  $candidatePaths = @(
    (Join-Path $workspace ('Sources\' + $row.filename)),
    (Join-Path $workspace ('Prompts\' + $row.filename))
  )

  $match = $candidatePaths |
    Where-Object { Test-Path -LiteralPath $_ } |
    Select-Object -First 1

  if (-not $match) {
    [pscustomobject]@{
      File = $row.filename
      Path = $null
      Exists = $false
      ExpectedSHA256 = $row.sha256
      ObservedSHA256 = $null
      Match = $false
    }
    continue
  }

  $observed =
    (Get-FileHash -Algorithm SHA256 -LiteralPath $match).Hash

  [pscustomobject]@{
    File = $row.filename
    Path = $match
    Exists = $true
    ExpectedSHA256 = $row.sha256
    ObservedSHA256 = $observed
    Match = ($observed -eq $row.sha256)
  }
}

$sourceResults | Format-Table -AutoSize
"SOURCE_FILE_COUNT=$($sourceResults.Count)"
"SOURCE_HASH_MATCH_COUNT=$(($sourceResults | Where-Object Match).Count)"
"SOURCE_FAILURE_COUNT=$(($sourceResults | Where-Object { -not $_.Match }).Count)"
```

Required:

```text
SOURCE_FILE_COUNT=15
SOURCE_HASH_MATCH_COUNT=15
SOURCE_FAILURE_COUNT=0
```

## 9. Exact RSM-3-B readiness input set

Assess and record this complete candidate input set.

### 9.1 Repository and remote

```text
Canonical local repository:
C:\RetroStage\retrostage-maker

Remote provider:
GitHub

Remote owner/account:
caosvein

Repository:
retrostage-maker

Visibility:
Private

Canonical HTTPS URL:
https://github.com/caosvein/retrostage-maker.git

Future remote name:
origin

Primary branch:
main

Authentication:
GitHub CLI browser OAuth + HTTPS Git protocol
```

### 9.2 Git identity

```text
Future repository-local user.name:
caosvein

Future repository-local user.email:
caosvein@gmail.com

Global Git identity:
must remain unset unless separately authorized
```

### 9.3 Toolchain candidates

```text
Git for Windows:
2.55.0.windows.3

Node.js:
24.19.0 LTS

npm:
11.17.0

pnpm:
11.17.0

Corepack:
observed 0.35.0; not selected as the pnpm activation authority

pnpm activation:
exact global pnpm installed through npm for workstation bootstrap

TypeScript project-local candidate:
6.0.3

Authoritative shell:
Windows PowerShell 5.1

LongPathsEnabled:
1
```

TypeScript rule:

- The project contract approves the TypeScript 6 major line.
- `6.0.3` is the exact source-approved RSM-3 project-local candidate.
- Do not replace it with TypeScript 7 merely because a newer major exists.
- Do not install TypeScript during this refresh.
- RSM-3-B/I2 must re-confirm and lock it in repository manifests and the lockfile before admission.

### 9.4 Source destinations

```text
Current accepted source bundle:
C:\RetroStage\bootstrap\RSM-3-A\Sources

Active reboot source destination:
docs/sources/

Historical archive destination:
docs/historical/2026-07-pre-loss/
```

RSM-3-B must define exact copy/mapping rules before source import.

### 9.5 Backup, clean-clone, and restore targets

```text
Manual local backup source:
C:\RetroStage\retrostage-maker

Manual local backup target:
D:\RSM-Backup\retrostage-maker

Clean-clone target:
D:\RSM-Validation\clean-clone

Restore-test target:
D:\RSM-Restore-Test

Canonical off-workstation remote:
GitHub private repository

Additional off-device backup class:
external physical disk kept at a different physical location
```

Interpretation:

- the three D: paths are exact selected local targets;
- clean clone, restore test, and daily local backup are separate responsibilities;
- D: is a separate local physical device, not an off-device workstation backup;
- the external disk class is owner-selected;
- its exact volume identity/path may remain an RSM-3-C implementation input, but must be fixed before external-disk backup execution or RSM-3 closure;
- this deferral must not be misrepresented as completed external backup evidence.

### 9.6 Initial topology recommendation

Record this as a constrained RSM-3-B recommendation, not implemented directories:

```text
Allowed initial roots:
.github/
docs/
tooling/
apps/
packages/
```

Rules:

- `.github/`, `docs/`, and `tooling/` may be admitted when their exact RSM-3 responsibilities are defined.
- `apps/` and `packages/` are allowed architecture roots, but no future product package may be pre-created merely from roadmap plans.
- Exact children belong to RSM-3-B/D.
- Empty directory names are not implementation evidence.
- Electron, Babylon.js, React, TypeBox/Ajv, and later product dependencies remain forbidden during RSM-3 bootstrap admission.

## 10. Readiness decision test

Return `READY FOR RSM-3-B` only if all are true:

1. every immutable input hash matches;
2. all required files are fully read;
3. source bundle remains 15/15 hash-valid;
4. safe canonical repository path is selected and absent;
5. exact remote is authenticated, accessible, and private;
6. branch and authentication method are selected;
7. exact Git/Node/npm/pnpm versions are present and resolvable;
8. project-local TypeScript 6.0.3 candidate is supplied without being installed;
9. LongPathsEnabled is `1`;
10. backup, clean-clone, and restore targets are exact and distinct;
11. the external backup class is selected and its later exact-device requirement is explicitly bounded;
12. active and historical source destinations are selected;
13. the initial topology recommendation is constrained;
14. no materially different owner choice remains unresolved for RSM-3-B contract work;
15. repository and product implementation remain absent;
16. the overwrite incident is explicitly recorded and does not conceal any current material contradiction.

Return `BLOCKED` if any required input is missing, contradictory, unavailable, hash-invalid, or dependent on guessing.

Do not treat these as blockers by themselves:

- local repository has not yet been created;
- remote repository is empty;
- Git author identity has not yet been configured;
- clean-clone/restore/backup directories do not yet exist;
- TypeScript is not yet installed;
- the exact external-disk volume/path is deferred to RSM-3-C under the recorded boundary.

Those are expected pre-implementation states when their exact future handling is supplied.

## 11. Required report

Create exactly:

```text
Outputs\RSM-3-A-READINESS-REFRESH1-REPORT.md
```

Required sections:

1. Executor identity
2. Output non-overwrite guard result
3. Full-read manifest
4. Immutable input hash verification
5. Historical readiness and later-evidence timeline
6. Toolchain live verification
7. GitHub authentication/private-remote verification
8. Storage and candidate-path verification
9. Source-bundle integrity
10. Owner-decision resolution
11. Exact RSM-3-B readiness inputs
12. Deferred-but-bounded inputs
13. Overwrite-incident treatment
14. Forbidden-action and mutation confirmation
15. Remaining blockers
16. Supersession statement
17. Final readiness decision

The supersession statement must say:

```text
This Refresh1 report does not modify or erase the historical
RSM-3-A-READINESS-REPORT.md decision. It supersedes that earlier
decision only for current RSM-3-A entry-control status, based on
the later immutable remediation, authentication, private-remote,
and incident evidence listed in this report.
```

The final non-empty line must be exactly one of:

```text
READY FOR RSM-3-B
BLOCKED
```

## 12. Success meaning

`READY FOR RSM-3-B` means:

- RSM-3-A readiness has passed;
- RSM-3-B contract work may be prepared after review;
- the local repository still does not exist;
- source import, Git identity configuration, repository creation, commit, push, clean clone, restore, and product dependency work have not started;
- RSM-3 itself is not complete;
- RSM-4 remains blocked.

## 13. Final chat response

Return:

- exact model label;
- output-guard result;
- all input hash results;
- 15/15 source verification result;
- exact live tool versions;
- authenticated account and private-remote result;
- exact selected RSM-3-B input set;
- bounded deferred inputs;
- overwrite-incident assessment;
- existing/new file inventory;
- final report path;
- final decision.

Do not modify any previous evidence file.
