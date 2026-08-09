# RSM-3-A — GitHub Private-Visibility Re-Verification Prompt

## Purpose

Verify that the owner changed `caosvein/retrostage-maker` from public to private after the successful GitHub authentication task.

This is a narrow, read-only verification. It must not change repository visibility, repository contents, local files, Git identity, or authentication state.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

## Required owner action before running

The owner must first change the GitHub repository visibility through the GitHub web interface:

```text
Repository: caosvein/retrostage-maker
Required final visibility: Private
```

Do not run this prompt before that owner action is complete.

## Expected state

```text
Authenticated GitHub account: caosvein
Repository: caosvein/retrostage-maker
Private: true
Visibility: private
Archived: false
Disabled: false
Default branch: main
Repository size: 0 unless changed by the owner outside this task
HTTPS clone URL: https://github.com/caosvein/retrostage-maker.git
Local repository: absent
Git author identity: not configured
```

## Executor identity

Record:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED LABEL>
Execution date/time/timezone: <OBSERVED>
```

## Governing baseline

Read fully and verify:

```text
Outputs\RSM-3-A-GITHUB-AUTHENTICATION-AND-REMOTE-VERIFICATION-REPORT.md
SHA-256:
6E86FB90C037648AC64809C0CED0D3D68484344975D04C0CA8331A3C0278446A

Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP2-VERIFICATION-REPORT.md
SHA-256:
FB4303E16B41EA29C8AEECB958A045AFEEB9CAA4CB04E407EDCBDF6CD02D6D49

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
```

If any hash differs, do not continue. Create the report with:

```text
BLOCKED — VISIBILITY RE-VERIFICATION BASELINE MISMATCH
```

## Allowed actions

You may:

- read the six governing files;
- recompute hashes;
- run read-only GitHub CLI/API and Git remote-access checks;
- run read-only Git configuration and filesystem-absence checks;
- create exactly one permanent file:
  `Outputs\RSM-3-A-GITHUB-PRIVATE-VISIBILITY-RE-VERIFICATION-REPORT.md`.

## Forbidden actions

Do not:

- change repository visibility;
- run `gh repo edit`;
- create, delete, rename, archive, transfer, fork, or modify a GitHub repository;
- create branches, commits, tags, issues, pull requests, releases, secrets, variables, workflows, or settings;
- push, fetch, pull, clone, or initialize;
- modify authentication or request new scopes;
- run `gh auth login`, `gh auth logout`, `gh auth refresh`, or token-display commands;
- set Git user.name/user.email;
- create a local repository, clean clone, restore-test, or backup path;
- modify existing source, prompt, output, report, manifest, review, or decision files;
- proceed to RSM-3-B.

## Phase 1 — Authentication identity

Run:

```powershell
$ErrorActionPreference = 'Continue'

gh.exe auth status --active --hostname github.com
gh.exe api user --jq '.login'
gh.exe config get git_protocol --host github.com
```

Required:

```text
login: caosvein
protocol: https
```

Do not display tokens.

## Phase 2 — Repository visibility and metadata

Run:

```powershell
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
    html_url: .html_url,
    clone_url: .clone_url,
    permissions: .permissions
  }'
```

Required:

```text
full_name: caosvein/retrostage-maker
owner_login: caosvein
private: true
visibility: private
archived: false
disabled: false
default_branch: main
clone_url: https://github.com/caosvein/retrostage-maker.git
admin permission: true
push permission: true
pull permission: true
```

If `private` is false or visibility is not `private`, return:

```text
PARTIAL AUTHENTICATION — REPOSITORY STILL PUBLIC
```

Do not attempt to fix it.

## Phase 3 — Read-only Git remote access

Run:

```powershell
git.exe ls-remote `
  https://github.com/caosvein/retrostage-maker.git

$lsRemoteExit = $LASTEXITCODE
"LS_REMOTE_EXIT_CODE=$lsRemoteExit"
```

An empty output is acceptable only if exit code is `0`, because the repository may be empty.

Do not clone or fetch.

## Phase 4 — Git identity and credential integration

Run:

```powershell
git.exe config --global --get-all user.name 2>&1
git.exe config --global --get-all user.email 2>&1

git.exe config --global --show-origin --get-regexp `
  '^credential\..*\.helper$|^credential\.helper$' 2>&1

gh.exe config get git_protocol --host github.com
```

Required:

- no owner Git author name/email configured yet;
- GitHub HTTPS credential integration remains configured;
- protocol remains HTTPS.

Do not expose credential values.

## Phase 5 — Local mutation guard

Run:

```powershell
Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'
```

All must remain:

```text
False
```

## Phase 6 — Governing-file immutability

Recompute all six governing hashes and confirm they remain unchanged after verification.

## Required permanent report

Create exactly:

```text
Outputs\RSM-3-A-GITHUB-PRIVATE-VISIBILITY-RE-VERIFICATION-REPORT.md
```

Required sections:

1. Executor identity
2. Baseline hash verification
3. Prior authentication result
4. Active GitHub account and protocol
5. Repository metadata and visibility
6. Read-only Git access result
7. Git identity and credential-helper state
8. Candidate-path absence
9. Existing-file immutability
10. Files created or modified
11. Forbidden-action confirmation
12. Remaining blockers
13. Final decision

Final decision exactly one of:

```text
AUTHENTICATED — PRIVATE REMOTE VERIFIED — READINESS REFRESH REQUIRED
PARTIAL AUTHENTICATION — REPOSITORY STILL PUBLIC
BLOCKED
```

Use the success decision only when:

- the active account is exactly `caosvein`;
- HTTPS remains configured;
- the repository is exactly `caosvein/retrostage-maker`;
- `private=true` and `visibility=private`;
- repository is neither archived nor disabled;
- read-only Git access succeeds;
- no local candidate path exists;
- no governing file changes;
- no Git author identity is configured.

The final non-empty line must be the exact decision token.

## Success meaning

`AUTHENTICATED — PRIVATE REMOTE VERIFIED — READINESS REFRESH REQUIRED` means:

- authentication is complete;
- private remote is verified;
- local repository bootstrap has not started;
- a formal RSM-3-A readiness refresh is the next activity;
- RSM-3-B remains blocked until that refreshed readiness decision explicitly authorizes entry.
