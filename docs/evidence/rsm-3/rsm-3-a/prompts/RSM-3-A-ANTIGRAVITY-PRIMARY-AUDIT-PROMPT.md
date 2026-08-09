# RSM-3-A — Antigravity Primary Audit Prompt

Paste the instruction below into Antigravity IDE as one task. Do not shorten it.

---

You are the **primary executor** for RetroStage Maker task:

```text
RSM-3-A — Environment / Repository / Remote / Toolchain Audit
```

This is a **read-only audit/readiness task**. No repository exists yet. Do not create one.

## Required sources

Read these files in order before executing commands:

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

Record the exact Antigravity application/model label displayed at execution time. Do not infer or normalize the name.

## Authority and role

You are the only writer for the five audit output files in this task.

Codex will be a separate read-only reviewer.

ChatGPT and the human project owner control task acceptance.

## Absolute prohibitions

Do not:

- create or initialize a Git repository;
- create a GitHub repository;
- install or upgrade applications, packages, runtimes, extensions, SDKs, or dependencies;
- modify global Git configuration;
- authenticate by printing or exposing secrets;
- change execution policy, registry, PATH, long-path settings, antivirus settings, or system policy;
- run `git init`, `git clone`, `git add`, `git commit`, `git push`, `git reset`, `git clean`, `git stash`, `git switch`, `git checkout`, `git config --global`, package install commands, or installer commands;
- create product apps, packages, source code, manifests, or lockfiles;
- copy pre-loss implementation code into a live location;
- write the final `07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md`;
- delete, overwrite, move, or rename unrelated files;
- or claim RSM-3 is complete.

## Audit method

Use non-destructive PowerShell commands where possible.

Before every command group, state:

- purpose;
- whether the command is read-only;
- expected output;
- and stop condition.

Capture exact relevant output. Do not paraphrase evidence that can be recorded exactly.

Do not display secret values. For environment variables, credentials, SSH keys, tokens, or credential helpers, record only safe presence/status metadata.

## Required audit areas

### A. Workstation identity and storage

Collect:

- Windows edition/build and architecture;
- current username only if safe and necessary; never expose account secrets;
- local drives, filesystem type, free space, and writable candidate roots;
- path length and path-character risks;
- OneDrive/sync/temp/removable-drive risks;
- presence of unrelated repositories in candidate roots;
- proposed source repository root candidates;
- proposed clean-clone and restore-test roots.

Do not select a final repository path if materially different safe choices require owner decision. Present the options and stop as required.

### B. Git and remote readiness

Collect:

- whether Git is installed;
- exact Git version;
- safe global identity status without changing it;
- current credential helper configuration without exposing secrets;
- SSH directory/key presence metadata without printing private key content;
- GitHub CLI presence and version, if installed;
- safe authentication status, if a command can report it without revealing secrets;
- available browser-based or device authentication paths;
- and whether a private GitHub remote appears feasible.

Do not create a remote or authenticate interactively unless the owner separately authorizes it.

### C. Node and package-tool readiness

Collect:

- Node presence and exact active version;
- Corepack presence/status;
- pnpm presence and exact version, if available;
- npm version;
- PowerShell version;
- whether global TypeScript exists, while recording that project-local TypeScript remains authoritative;
- relevant PATH resolution using safe commands;
- and any version mismatch against the technology contract.

Do not enable Corepack or install pnpm during this audit.

### D. Native build and future workstation prerequisites

Inventory only; do not install:

- Visual Studio, Visual Studio Build Tools, or MSVC presence;
- Windows SDK presence;
- Python presence/version;
- CMake/Ninja presence, if any;
- Git Large File Storage presence, if any;
- archive utilities;
- code-signing tools;
- and other detected native-build prerequisites.

Classify each as:

```text
REQUIRED BEFORE RSM-3-B
REQUIRED DURING A LATER RSM-3 SLICE
MILESTONE-GATED PRODUCT TOOL
OPTIONAL PRODUCTIVITY TOOL
NOT REQUIRED
UNKNOWN / REQUIRES DECISION
```

Do not assume Visual Studio is required merely because it is common. Base classification on the current roadmap and technology contract.

### E. AI application readiness

Record safe presence/version/model-label information for:

- Antigravity IDE;
- Codex;
- any relevant local extension or command-line integration.

Do not install, sign in, or expose account data during the audit.

### F. Accepted source bundle

Locate the accepted RSM-2-CLOSE1 control/source bundle.

Verify:

- every required file is readable;
- exact filename inventory;
- exact SHA-256 hashes against the accepted closure manifest or authoritative source ledger;
- no file has been silently converted, truncated, or renamed;
- and the bundle location is not being treated as the future repository.

If any required file is missing or hash-mismatched, stop and report `BLOCKED`.

### G. Remote, backup, clean-clone, and restore plan

Audit possible destinations without creating them.

Determine or present owner decisions for:

- canonical remote provider;
- intended repository name;
- private/public visibility;
- primary branch;
- authentication method;
- separate off-device backup/snapshot destination;
- clean-clone target;
- restore-test target;
- historical-source archive location;
- and active-source location inside the future repository.

A GitHub remote alone is not the complete backup/restore plan.

### H. Shell and Windows constraints

Collect:

- authoritative PowerShell executable/version candidate;
- execution-policy status without changing it;
- long-path support status if safely inspectable;
- antivirus or controlled-folder-access indicators only where non-invasive and safe;
- likely script-blocking risks;
- and recommended future bootstrap shell.

## Required outputs

Create exactly these five files in a dedicated audit-output directory that is not the future repository:

```text
RSM-3-A-ENVIRONMENT-INVENTORY.md
RSM-3-A-SOURCE-READ-MANIFEST.tsv
RSM-3-A-TOOLCHAIN-INVENTORY.tsv
RSM-3-A-REPOSITORY-REMOTE-BACKUP-DECISION.md
RSM-3-A-READINESS-REPORT.md
```

Do not create extra permanent files. Temporary files must be listed and removed before final reporting unless required as evidence.

## Output requirements

### Environment inventory

Separate:

- observed facts;
- owner decisions;
- approved source requirements;
- inferences;
- unknowns;
- and blockers.

### Source read manifest

TSV columns:

```text
filename	bytes	sha256	read_status	authority_role	notes
```

### Toolchain inventory

TSV columns:

```text
tool	presence	exact_version	path_or_safe_identity	classification	status	notes
```

### Repository/remote/backup decision

Record exact selected values only when observed or owner-approved. Otherwise mark `OWNER DECISION REQUIRED`.

### Readiness report

Include:

- exact model/application label;
- exact commands executed;
- relevant outputs;
- all warnings/failures;
- all files created or modified;
- proof that no install/configuration/repository/product mutation occurred;
- missing applications/tools grouped by classification;
- required owner decisions;
- inputs for RSM-3-B;
- and exactly one final line:

```text
READY FOR RSM-3-B
```

or

```text
BLOCKED
```

## Stop conditions

Stop and report `BLOCKED` if:

- the accepted source bundle is absent or hash-mismatched;
- no safe candidate repository root exists;
- no off-device remote path is feasible;
- no distinct restore-test destination exists;
- credentials would need to be exposed;
- installation or system mutation is required to answer the audit;
- unrelated work could be damaged;
- or the owner must choose between materially different options.

Do not bypass a blocker through a recommendation presented as an observed decision.

## Final chat response

Return:

1. exact execution baseline;
2. source files read;
3. commands run;
4. five output file paths;
5. findings by audit area;
6. missing-tool classification;
7. owner decisions required;
8. warnings/blockers;
9. confirmation of no repository/install/configuration/product mutation;
10. terminal readiness result.

Your narrative is not proof. The five files and exact command evidence are the handoff.
