# RSM-3-A — Controlled GitHub Authentication and Remote Verification Prompt

## Purpose

Authenticate the owner-selected GitHub account through GitHub CLI using the web browser and HTTPS protocol, configure GitHub CLI as Git's credential helper for `github.com`, and verify the owner-provided remote repository read-only.

This task does not create or clone a local repository.

Workspace:

```text
C:\RetroStage\bootstrap\RSM-3-A
```

## Expected identity and remote

```text
Expected GitHub account: caosvein
Owner-provided Git author name: caosvein
Owner-provided Git author email: caosvein@gmail.com

Expected repository: caosvein/retrostage-maker
Expected visibility: PRIVATE
Expected web URL: https://github.com/caosvein/retrostage-maker
Expected HTTPS clone URL: https://github.com/caosvein/retrostage-maker.git
Expected remote name for later bootstrap: origin
Expected primary branch decision: main
```

The Git author name/email are not to be configured in this task. They will be configured repository-locally after the local repository exists.

## Executor identity

Record:

```text
Executor application: Antigravity IDE
Exact model label: <EXACT DISPLAYED MODEL LABEL>
Execution date/time/timezone: <OBSERVED>
```

## Governing evidence and baseline

Read fully and verify before authentication:

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

Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP1-REPORT.md
01D09406A1BE4B110CDB1BC399684FEDF8C49199A33E55DB1DD00FF65CEFE47A

Outputs\RSM-3-A-TOOL-REMEDIATION-FOLLOWUP2-VERIFICATION-REPORT.md
FB4303E16B41EA29C8AEECB958A045AFEEB9CAA4CB04E407EDCBDF6CD02D6D49
```

If any hash differs, do not authenticate. Create the report with:

```text
BLOCKED — AUTH BASELINE MISMATCH
```

## Authorized persistent mutations

Only these authentication-related changes are authorized:

1. Authenticate GitHub CLI to `github.com` through the browser as account `caosvein`.
2. Select HTTPS as the Git protocol.
3. Store the GitHub CLI OAuth credential using the normal secure credential-store path.
4. Run:
   `gh auth setup-git --hostname github.com`
   to configure GitHub CLI as the Git credential helper for GitHub.
5. Create exactly one permanent report:
   `Outputs\RSM-3-A-GITHUB-AUTHENTICATION-AND-REMOTE-VERIFICATION-REPORT.md`.

## Forbidden actions

Do not:

- use `--with-token`;
- paste or display a personal access token;
- use `--insecure-storage`;
- run `gh auth token`;
- run `gh auth status --show-token`;
- display, record, or copy OAuth tokens, cookies, credential blobs, or private keys;
- authenticate any account other than `caosvein`;
- set Git `user.name` or `user.email`, globally or locally;
- create, initialize, or clone a local repository;
- create a remote, branch, commit, tag, issue, pull request, release, secret, variable, workflow, or repository setting;
- push, fetch, pull, or alter the remote repository;
- create clean-clone, restore-test, backup, active-source, or historical-source directories;
- install or update tools;
- modify registry, PATH, source files, prompts, prior reports, reviews, manifests, or owner decisions;
- proceed to RSM-3-B.

## Phase 1 — Pre-authentication verification

Run:

```powershell
$ErrorActionPreference = 'Continue'

gh.exe --version
git.exe --version

gh.exe auth status --hostname github.com 2>&1
gh.exe config get git_protocol --host github.com 2>&1

git.exe config --global --get-all user.name 2>&1
git.exe config --global --get-all user.email 2>&1
git.exe config --global --get-all credential.helper 2>&1

Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'
```

Expected before authentication:

```text
GitHub authentication: absent
Repository/validation/backup paths: absent
Git author identity: not configured by this task
```

If a different GitHub account is already authenticated, stop:

```text
BLOCKED — UNEXPECTED GITHUB ACCOUNT ALREADY AUTHENTICATED
```

Do not log out or replace an existing account without a separate owner decision.

## Phase 2 — Owner-controlled browser authentication

Start exactly:

```powershell
gh.exe auth login `
  --hostname github.com `
  --git-protocol https `
  --web
```

The owner must personally:

1. review the browser/device authorization page;
2. sign in as `caosvein`;
3. complete any 2FA/passkey challenge;
4. authorize GitHub CLI;
5. return to the terminal after success.

Do not request extra OAuth scopes in this task.

If the terminal offers to authenticate Git operations with GitHub credentials, accept HTTPS credential integration.

If the browser displays an account other than `caosvein`, cancel the authorization and stop.

## Phase 3 — Configure Git credential integration

After successful login, run:

```powershell
gh.exe auth setup-git --hostname github.com
```

Record exit code and non-secret output.

Do not modify any unrelated Git configuration.

## Phase 4 — Authentication identity verification

Run without token-display flags:

```powershell
gh.exe auth status --active --hostname github.com
gh.exe auth status --json hosts
gh.exe api user --jq '.login'
gh.exe api user --jq '{login: .login, id: .id, type: .type}'
```

Required login:

```text
caosvein
```

Do not query or record token values.

The account email may be private or absent from API output. Do not treat API email visibility as validation of the future repository-local Git author email.

## Phase 5 — Read-only remote repository verification

Run:

```powershell
gh.exe api repos/caosvein/retrostage-maker `
  --jq '{
    full_name: .full_name,
    private: .private,
    visibility: .visibility,
    archived: .archived,
    disabled: .disabled,
    default_branch: .default_branch,
    size: .size,
    html_url: .html_url,
    clone_url: .clone_url,
    ssh_url: .ssh_url,
    owner_login: .owner.login,
    permissions: .permissions
  }'

git.exe ls-remote `
  https://github.com/caosvein/retrostage-maker.git
```

Record:

- repository full name;
- owner login;
- private/visibility state;
- archived/disabled state;
- default branch returned by GitHub;
- repository size;
- HTTPS clone URL;
- effective account permissions;
- `git ls-remote` exit code.

An empty `git ls-remote` output is acceptable only when the exit code is `0`; it may indicate an empty repository. Do not create an initial branch or commit to change that state.

Required identity/remote results:

```text
Account: caosvein
Repository: caosvein/retrostage-maker
Private: true
Visibility: private
Archived: false
Disabled: false
Clone URL: https://github.com/caosvein/retrostage-maker.git
```

If the repository is public, belongs to a different owner, is archived/disabled, or the authenticated account lacks adequate access, stop and report the exact non-secret state.

## Phase 6 — Git credential-helper verification

Run:

```powershell
git.exe config --global --show-origin --get-regexp `
  '^credential\..*\.helper$|^credential\.helper$' 2>&1

gh.exe config get git_protocol --host github.com
```

Expected GitHub protocol:

```text
https
```

Record configuration origins but do not expose credentials.

## Phase 7 — Mutation guard

Verify again:

```powershell
Test-Path 'C:\RetroStage\retrostage-maker'
Test-Path 'D:\RSM-Validation\clean-clone'
Test-Path 'D:\RSM-Restore-Test'
Test-Path 'D:\RSM-Backup\retrostage-maker'

git.exe config --global --get-all user.name 2>&1
git.exe config --global --get-all user.email 2>&1
```

Recompute all baseline hashes after the checks and confirm that all governing files remain unchanged.

## Required permanent report

Create exactly:

```text
Outputs\RSM-3-A-GITHUB-AUTHENTICATION-AND-REMOTE-VERIFICATION-REPORT.md
```

Sections:

1. Executor identity
2. Baseline hash verification
3. Pre-authentication state
4. Authentication command and owner interaction result
5. Authenticated account identity
6. Credential storage/integration result without secrets
7. Remote repository metadata
8. Read-only Git remote-access result
9. Git identity state
10. Candidate-path absence
11. Existing-file immutability
12. Files/configuration changed
13. Forbidden-action confirmation
14. Remaining blockers
15. Final decision

Final decision exactly one of:

```text
AUTHENTICATED — REMOTE VERIFIED — READINESS REFRESH REQUIRED
PARTIAL AUTHENTICATION — OWNER ACTION REQUIRED
BLOCKED
```

Use the success decision only when:

- active authenticated account is exactly `caosvein`;
- HTTPS is configured;
- GitHub CLI credential integration succeeds;
- the exact private repository is verified;
- authenticated read-only Git access succeeds;
- no local repository or candidate directory is created;
- no Git author identity is set;
- all governing hashes remain unchanged.

The report's last non-empty line must be the exact decision token.

## Success meaning

```text
AUTHENTICATED — REMOTE VERIFIED — READINESS REFRESH REQUIRED
```

means only:

- GitHub authentication and remote verification are complete;
- the audit package now requires a readiness refresh;
- local repository bootstrap has not started;
- RSM-3-B remains blocked until the refreshed readiness decision explicitly authorizes it.

Do not create or clone the repository.
