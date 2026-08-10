# RSM-3-I4-EXEC1-RETRY1 — Remote Push and GitHub CI Evidence

**Task:** RSM-3-I4-EXEC1-RETRY1  
**Executor:** Codex primary executor  
**Mode:** controlled retry / fail-closed  
**Execution date:** 2026-08-10  
**Observation cutoff:** 2026-08-10T01:52:33.156+03:00

## Authority lineage

All mandatory authority and failed-attempt lineage artifacts were fully read as strict UTF-8. Physical hashes matched the RETRY1 prompt:

| Artifact | SHA-256 | Result |
|---|---|---|
| RETRY1 prompt | EDDB551C4C3DD44B933DB6163F9EBE5A27E3AD15A2BA33B2D5D32D6AF9930654 | PASS |
| Owner workflow-scope authorization lock | D4375576716D708B8A4F551760CF3B28685DD6F28DDF57DC8AE543B173A3288F | PASS |
| Owner encryption non-blocking correction lock | F3244B7126A5BD9FE55285D8F2523BC8DAE2A9E7A3BDAE32AB7E0621B5DDBAD6 | PASS |
| Original EXEC1 prompt | 310220C75043143D9745A29B2B6197C7204B2C12509743C47FD8759C12440185 | PASS |
| Failed remote/CI evidence | 399A79E4F40BBEF857F7C3E76180AE5FA80F092B2A162CEC21073A8A136B8941 | PASS |
| Failed clean-clone evidence | 77230457EBBA04D679018978DD24A701B42025A1647A529534EA17B2EA18E0A7 | PASS |
| Failed backup evidence | F00033A70EE50B306D7550C6741DC8E4098668674C4A8E39D10EA2394F9398F0 | PASS |
| Failed restore evidence | 245C954CB3F20E7C8CB0A439F458A3E4336FFDC94310131D9BEFBABFF3CAEB98 | PASS |
| Failed command manifest | 7FB9808EE789C1D191794CA4AABF461C6CC806B0CF69EA06BB646C08B726D48B | PASS |
| Failed readiness report | D056B43EDDDE48FFB763C84C69B130E1C78CE21E30492538D31BD4AD1A8861A5 | PASS |

The failed historical decision remained exact:

    BLOCKED — RSM-3-I4-EXEC1 MATERIAL FAILURE

## Authentication gate

The owner had already refreshed the credential. RETRY1 only observed it.

    Active host = github.com
    Active account = caosvein
    Authentication valid = TRUE
    Effective scopes = gist, read:org, repo, workflow
    workflow scope present = TRUE
    Token value captured = FALSE
    Authentication mutation during RETRY1 = FALSE

Before retry:

    Repository = caosvein/retrostage-maker
    Private = TRUE
    Empty = TRUE
    Viewer permission = ADMIN
    Remote refs = 0

## Phase A — retry first push

The single authorized RETRY1 push attempt was:

    git -C "C:\RetroStage\retrostage-maker" push -u origin main

Result:

    Exit code = 0
    Push attempts in RETRY1 = 1
    Successful pushes in RETRY1 = 1
    Remote branch created = main
    origin/main = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Upstream = origin/main
    Local HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Canonical working tree/index = CLEAN
    Force push = FALSE

## Phase B — natural GitHub-hosted CI

No manual dispatch occurred. The push-triggered run was observed to terminal state:

    Run ID = 31340336172
    Workflow = CI
    Job ID = 93312948482
    Job = validation
    Head SHA = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Head branch = main
    Event = push
    Status = completed
    Conclusion = success
    URL = https://github.com/caosvein/retrostage-maker/actions/runs/31340336172
    Created = 2026-08-09T22:48:54Z
    Completed = 2026-08-09T22:49:36Z

All job steps, including immutable install, validation, deterministic compliance verification, and the high-severity vulnerability gate, concluded successfully.

    FIRST_PUSH = PASS
    REMOTE_HEAD_VERIFICATION = PASS
    GITHUB_HOSTED_CI = PASS

