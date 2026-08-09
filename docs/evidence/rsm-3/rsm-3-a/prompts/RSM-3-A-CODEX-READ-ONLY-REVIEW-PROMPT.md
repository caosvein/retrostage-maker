# RSM-3-A — Codex Independent Read-Only Review Prompt

Use this only after Antigravity has completed the primary audit and produced all five required files.

---

You are the **independent read-only reviewer** for RetroStage Maker task:

```text
RSM-3-A — Environment / Repository / Remote / Toolchain Audit
```

You must not modify the primary audit files.

## Required sources

Read:

1. `00_RSM_REBOOT_PROJECT_CHARTER.md`
2. `06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
3. `01_RSM_REBOOT_CANONICAL_ROADMAP.md`
4. `05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
5. `03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
6. `04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
7. `02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
8. `08_RSM_REBOOT_CURRENT_MILESTONE.md`
9. `09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`
10. `RSM-2-V1-SOURCE-SET-CONSISTENCY-REVIEW.md`
11. `RSM-2-CLOSE1-SOURCE-RECONSTRUCTION-CLOSURE.md`
12. `RSM-3-A-REPOSITORY-BOOTSTRAP-AUDIT-AND-READINESS-CONTRACT.md`
13. `RSM-3-A-INTERIM-MULTI-AI-EXECUTION-ASSIGNMENT.md`
14. `RSM-3-A-ANTIGRAVITY-PRIMARY-AUDIT-PROMPT.md`

Read the primary outputs:

```text
RSM-3-A-ENVIRONMENT-INVENTORY.md
RSM-3-A-SOURCE-READ-MANIFEST.tsv
RSM-3-A-TOOLCHAIN-INVENTORY.tsv
RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
RSM-3-A-READINESS-REPORT.md
```

Record the exact Codex application/model label shown at review time. Do not infer or normalize it.

## Review constraints

Do not:

- edit the five primary files;
- create or initialize a repository;
- install or upgrade tools;
- change configuration;
- authenticate or expose secrets;
- commit or push;
- rerun destructive or mutating commands;
- implement product code;
- or silently repair the primary executor's work.

You may run additional **read-only** verification commands only when necessary and safe. Record each command and result.

## Required review questions

### Scope and safety

- Did the primary executor remain inside RSM-3-A scope?
- Did any command create, initialize, install, authenticate, configure, commit, push, delete, overwrite, or implement?
- Are all generated files accounted for?
- Were secrets protected?

### Evidence quality

- Does every important claim cite exact command evidence?
- Are observed facts separated from recommendations and owner decisions?
- Are timestamps/timezone and paths explicit?
- Are failed commands and warnings preserved?
- Are screenshots being misused as substitutes for text evidence?

### Source integrity

- Are all authoritative files present?
- Do hashes match the accepted closure ledger?
- Are historical sources correctly treated as historical?
- Is the future repository clearly separate from the source-bundle location?

### Toolchain classification

- Are missing tools classified without speculative installation requirements?
- Is project-local TypeScript authority preserved?
- Are Electron/Babylon/React product dependencies correctly deferred beyond RSM-3 bootstrap admission?
- Are Visual Studio/Build Tools, SDKs, Python, and native tools classified based on evidence and roadmap need rather than habit?

### Repository and remote planning

- Is the proposed repository root safe and observed?
- Is remote visibility and authentication an owner-approved decision?
- Is the backup destination distinct from the working disk?
- Are clean-clone and restore targets explicit and distinct?
- Is GitHub incorrectly treated as the only backup proof?

### Readiness result

- Does `READY FOR RSM-3-B` have all required exact inputs?
- Should any unresolved owner choice force `BLOCKED`?
- Did the primary report overstate readiness?

## Required review output

Create one new file only:

```text
RSM-3-A-CODEX-INDEPENDENT-REVIEW.md
```

It must contain:

- reviewer application/model label;
- files reviewed;
- additional read-only commands, if any;
- scope decision;
- evidence decision;
- source-integrity decision;
- toolchain-classification decision;
- repository/remote/backup decision;
- list of material findings;
- list of non-blocking observations;
- exact correction requests, if material;
- and one final decision:

```text
PASS
PASS WITH MATERIAL CORRECTIONS
BLOCKED
```

Do not use `PASS WITH MATERIAL CORRECTIONS` for wording preferences or optional cleanup.

## Final chat response

Return:

1. exact reviewer baseline;
2. files reviewed;
3. additional commands run;
4. material findings;
5. non-blocking observations;
6. final decision;
7. path to the review file.
