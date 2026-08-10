# RSM-3-I4-EXEC1-RETRY1 — Clean Clone Validation Evidence

**Task:** RSM-3-I4-EXEC1-RETRY1  
**Mode:** controlled retry / fail-closed

## Phase C — clean clone

The exact target was absent before clone. Its parent was also absent and was created only to host the authorized target.

    Target = D:\RSM-Validation\clean-clone
    Target before = ABSENT
    Clone source = https://github.com/caosvein/retrostage-maker.git
    git clone exit = 0
    HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Branch = main
    Commit count = 4
    HEAD tree files = 140
    Origin = https://github.com/caosvein/retrostage-maker.git
    Working tree/index after clone = CLEAN
    Canonical node_modules copied = FALSE
    CLEAN_CLONE = PASS

## Phase D — frozen installation

    Command = pnpm.cmd install --frozen-lockfile
    Exit code = 0
    Node = v24.19.0
    pnpm = 11.17.0
    Workspace projects = 4
    Packages installed = 211
    Frozen lockfile = PASS

Git tracked-state checks after installation:

    HEAD = e50cadca387b992f6a5648237fe0c006ef72a6fa
    Working tree/index = CLEAN
    Tracked pnpm-lock.yaml drift = FALSE
    LF-normalized pnpm-lock.yaml SHA-256 = CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0

The physical checkout hash differs because Git converted line endings to CRLF; Git-normalized content and the committed lockfile identity remain unchanged.

## Mandatory validation failure

The first required quality command was run:

    Command = pnpm.cmd run format:check
    Exit code = 1
    Result = FAIL

Prettier reported all 18 checked tracked paths:

1. package.json
2. pnpm-workspace.yaml
3. eslint.config.mjs
4. prettier.config.mjs
5. dependency-cruiser.config.cjs
6. knip.json
7. tsconfig.json
8. .github/workflows/ci.yml
9. tooling/compliance/check.mjs
10. tooling/compliance/generate.mjs
11. tooling/compliance/policy.mjs
12. tooling/compliance/policy.test.mjs
13. tooling/node-fs-r-ok-compat-loader.mjs
14. tooling/repository-policy.test.mjs
15. tooling/repository-policy.ts
16. packages/core/package.json
17. packages/diagnostics/package.json
18. packages/test-fixtures/package.json

Read-only physical diagnosis:

    Effective core.autocrlf = true
    Config origin = C:/Program Files/Git/etc/gitconfig
    Repository text/eol attributes for sampled files = unspecified
    All 18 reported physical files = CRLF only
    Prettier endOfLine = lf
    Prettier content write performed = FALSE
    Tracked drift after check = 0

The remaining mandatory commands were not run because RETRY1 requires immediate stop at the first Phase D failure:

    lint = NOT EXECUTED
    typecheck = NOT EXECUTED
    test = NOT EXECUTED
    arch:check = NOT EXECUTED
    deadcode:check = NOT EXECUTED
    build = NOT EXECUTED
    validate = NOT EXECUTED
    compliance:check = NOT EXECUTED
    dependency:audit = NOT EXECUTED
    ci:validate = NOT EXECUTED

    CLEAN_CLONE_VALIDATION = FAIL
    MANDATORY_FAILURE_COUNT = 1

No remediation, formatting write, repository repair, restage, commit, or dependency change was performed.

BLOCKED — RSM-3-I4-EXEC1-RETRY1 CLEAN-CLONE VALIDATION FAILURE

