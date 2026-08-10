# RetroStage Maker — RSM-3-I4 Owner GitHub Workflow Scope Authorization Lock

**Document ID:** `RSM-3-I4-OWNER-GITHUB-WORKFLOW-SCOPE-AUTHORIZATION-LOCK`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current slice:** `RSM-3-I4 — Remote Push / Clean Clone / Restore Proof`  
**Decision type:** `OWNER-AUTHORIZED EXTERNAL AUTHENTICATION PERMISSION CORRECTION`  
**Date:** `2026-08-10`  
**Timezone:** `Europe/Istanbul`

## 1. Observed blocker

`RSM-3-I4-EXEC1` attempted exactly one first push from accepted local HEAD:

`e50cadca387b992f6a5648237fe0c006ef72a6fa`

GitHub rejected the push because the active GitHub CLI OAuth credential did not include the `workflow` scope required to add/update:

`.github/workflows/ci.yml`

Observed active scopes:

```text
gist
read:org
repo
```

Observed post-failure state remained:

```text
successful push count = 0
remote refs = 0
remote repository = empty
upstream = absent
local HEAD unchanged
local worktree/index clean
```

## 2. Owner authorization

The owner authorizes exactly one permission expansion for the existing active GitHub CLI account:

```text
host = github.com
account = caosvein
additional OAuth scope = workflow
```

Authorized owner-side command:

```powershell
gh auth refresh -h github.com -s workflow
```

This authorization does not permit:

- token display or capture;
- adding unrelated scopes;
- switching accounts;
- changing repository visibility;
- creating/deleting repositories;
- force push;
- history rewrite;
- manual workflow dispatch;
- any repository content mutation.

## 3. Expected authentication state after owner approval

After the interactive browser/device authorization completes, the active credential must still represent:

```text
host = github.com
account = caosvein
```

and effective scope names must include at minimum:

```text
gist
read:org
repo
workflow
```

The token value itself must never be printed or stored in project evidence.

## 4. Retry authority

After the owner completes the authorized scope refresh and the `workflow` scope is physically observed, the failed EXEC1 attempt remains historical fail-closed evidence.

The next permitted control is:

`RSM-3-I4-EXEC1-RETRY1 — Auth-Scope Recovery / First Push / CI / Clean Clone / Backup / Restore`

RETRY1 must begin again from the same accepted local baseline and must not assume that any earlier EXEC1 phase succeeded.
