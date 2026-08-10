# RSM-3-I4-EXEC1 — Remote Push and GitHub CI Evidence

**Task:** RSM-3-I4-EXEC1  
**Executor:** Codex primary executor  
**Mode:** controlled I4 physical execution / fail-closed  
**Execution date:** 2026-08-10  
**Failure observation:** 2026-08-10T01:38:14.592+03:00

## Authority and pre-push gates

The mandatory authority set was physically read as strict UTF-8 before mutation. The controlling prompt SHA-256 was:

    310220C75043143D9745A29B2B6197C7204B2C12509743C47FD8759C12440185

Required current decisions were present and consistent:

    RSM-3-I4 AUTHORIZED / READY FOR EXECUTION
    EXTERNAL_BACKUP_ENCRYPTION = DEFERRED_OPERATIONAL_HARDENING / NON_BLOCKING

The owner correction lock SHA-256 was:

    F3244B7126A5BD9FE55285D8F2523BC8DAE2A9E7A3BDAE32AB7E0621B5DDBAD6

BL1 remained superseded, was not run, and no encryption mutation occurred.

The exact accepted repository baseline passed immediately before the push attempt:

    Repository = C:\RetroStage\retrostage-maker
    HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Parent = 5c7ff6322ba2583176065a919db385d51b650fba
    Branch = main
    Commit count = 4
    HEAD tree files = 140
    Working tree = CLEAN
    Index = CLEAN
    Unexpected untracked non-ignored files = 0
    Origin = https://github.com/caosvein/retrostage-maker.git
    Remote refs = 0
    Upstream = ABSENT

GitHub authentication and repository preflight:

    Active host = github.com
    Active account = caosvein
    gh auth status exit = 0
    Repository = caosvein/retrostage-maker
    URL = https://github.com/caosvein/retrostage-maker
    Private = TRUE
    Empty = TRUE
    Viewer permission = ADMIN
    Token value captured = FALSE

## Phase A — first push attempt

The prompt-authorized exact command was executed once:

    git -C "C:\RetroStage\retrostage-maker" push -u origin main

Result:

    Exit code = 1
    Remote result = REJECTED
    Successful push count = 0

GitHub returned:

    refusing to allow an OAuth App to create or update workflow
    .github/workflows/ci.yml without workflow scope

The safe authentication status exposed only scope names:

    gist, read:org, repo

No credential or token value was printed or persisted. Authentication was not changed, refreshed, replaced, or retried.

## Immediate fail-closed verification

After rejection:

    Local HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Local branch = main
    Local commit count = 4
    Local HEAD tree files = 140
    Local working tree/index = CLEAN
    Local unexpected untracked non-ignored files = 0
    Remote main ref count = 0
    Remote total ref count = 0
    GitHub repository empty = TRUE
    Upstream = ABSENT
    Canonical governed physical mismatch count = 0 of 173

No partial remote branch was created.

## Phase B — GitHub-hosted CI

The push-triggered workflow could not start because Phase A did not create remote main.

    Matching head SHA = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Matching push workflow run count = 0
    GitHub-hosted CI = NOT EXECUTED / GATED BY PHASE A FAILURE
    Manual workflow dispatch = FALSE

The execution stopped before Phase B and all later physical phases as required.

BLOCKED — RSM-3-I4-EXEC1 FIRST PUSH FAILURE

