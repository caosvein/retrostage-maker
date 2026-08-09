# RetroStage Maker — RSM-3-I3 CI / Dependency Review / SBOM / Notices Baseline Implementation

**Document ID:** `RSM-3-I3-IMPLEMENTATION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Task:** `RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline`  
**Primary executor:** `Codex`  
**Authoritative local shell:** `Windows PowerShell 5.1`  
**Mode:** `CONTROLLED IMPLEMENTATION / STAGED CANDIDATE — NO COMMIT / NO PUSH`

This task materializes the repository CI/compliance baseline only.

It does NOT authorize:

- remote push;
- I4;
- product implementation;
- Electron;
- Babylon.js;
- React;
- TypeBox/Ajv;
- release packaging;
- source 07 creation.

---

## 1. Entry Authority

Before any repository mutation, fully read and verify at minimum:

### Live authorities

- `C:\RetroStage\bootstrap\RSM-3-A\Sources\00_RSM_REBOOT_PROJECT_CHARTER.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\01_RSM_REBOOT_CANONICAL_ROADMAP.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`

### I2 closure / activation authorities

- `RSM-3-I2-COMMIT1-POST-COMMIT-EVIDENCE.md`
- `RSM-3-I2-COMMIT1-READINESS-REPORT.md`
- `RSM-3-I2-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
- `RSM-3-I2-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`
- `RSM-3-I2-ALIGN1-I3-ACTIVATION-REPORT.md`

Required activation decision:

`RSM-3-I3 AUTHORIZED / READY FOR EXECUTION`

If the decision is not exact:

STOP:

`BLOCKED — RSM-3-I3 ENTRY AUTHORITY INVALID`

---

## 2. Accepted Repository Baseline

Canonical repository:

`C:\RetroStage\retrostage-maker`

Required physical starting state:

```text
Git repository = TRUE
branch = main
HEAD = 302538e3692ed82daa969bceed0a63945736fc5f
parent = 6d67b19f136cdd0a36ae11a861f4ba8b0addd196
commit count = 2
HEAD tree file count = 105
working tree = CLEAN
staged changes = 0
unstaged changes = 0
unexpected untracked non-ignored files = 0
origin = https://github.com/caosvein/retrostage-maker.git
remote refs = 0
upstream tracking = ABSENT
push performed = FALSE
```

Recheck physically before mutation.

If HEAD, branch, cleanliness, remote identity, or remote-ref count differs:

STOP:

`BLOCKED — RSM-3-I3 ENTRY REPOSITORY DRIFT`

Do not reset, restore, clean, stash, merge, rebase, fetch-and-rewrite, or otherwise repair automatically.

---

## 3. Current Live-Source Identities

The current live bootstrap sources after I2 ALIGN1 must independently hash to:

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
E37BCFE3D19FD558F60A653BDBB132A37F4F7D62F0448356225B34F4B891445F

08_RSM_REBOOT_CURRENT_MILESTONE.md
680EFD1C9BD21B0F5C17FC586593C22FC7C96DBEBBF35F6E65ACFA44D1414418
```

If either differs:

STOP:

`BLOCKED — LIVE SOURCE IDENTITY DRIFT`

Do not rewrite the bootstrap authority files.

---

## 4. I3 Ownership Boundary

RSM-3-I3 owns only:

- `.github/` CI baseline;
- immutable third-party GitHub Action pinning;
- pull-request dependency-review baseline where the current GitHub account/repository is platform-eligible;
- local/CI vulnerability and dependency-policy checks;
- CycloneDX SBOM baseline;
- dependency inventory;
- license review;
- third-party notices;
- native-binary and WASM baseline inventories;
- deterministic compliance generation/checking;
- synchronization of post-I2 live source/evidence into the repository;
- one exact staged I3 candidate for independent review.

I3 does NOT own:

- remote push;
- branch protection activation;
- clean clone;
- restore proof;
- product source;
- Electron/Forge/Vite product setup;
- Babylon;
- React;
- runtime schemas;
- packaging/signing;
- release distribution.

---

## 5. No New Direct npm Dependency by Default

Do NOT add a new direct npm dependency merely for SBOM or notices.

The previously considered `CycloneDX/cyclonedx-node-pnpm` project is not to be installed.

The accepted pnpm version is already:

`pnpm 11.17.0`

First verify native SBOM support from the physical CLI:

```powershell
pnpm.cmd --version
pnpm.cmd sbom --help
```

The exact supported command syntax must be learned from the physical `pnpm 11.17.0` help output.

If native pnpm cannot produce a CycloneDX JSON SBOM from this workspace:

STOP:

`BLOCKED — PINNED PNPM NATIVE CYCLONEDX CAPABILITY UNAVAILABLE`

Do NOT silently install `cyclonedx-node-pnpm`, `cyclonedx-node-npm`, `cdxgen`, or another generator.

A new compliance dependency requires a separate owner-reviewed admission decision.

---

## 6. Node / pnpm CI Identity

The CI baseline must reproduce:

```text
Node = 24.19.0
npm = 11.17.0
pnpm = 11.17.0
```

For the Linux CI runner, do NOT depend on an unpinned floating Node version.

Use:

`ubuntu-24.04`

The Node 24.19.0 Linux x64 archive identity is:

```text
node-v24.19.0-linux-x64.tar.xz
SHA-256 = 14b342e71204f811bde6153be8e04b62aef63c236fef92b55f9c83154b409647
```

The CI workflow may install Node directly from the official Node.js distribution archive and MUST verify the exact SHA-256 before extraction.

Do not use a checksum fetched from an unrelated mirror.

Do not weaken checksum failure.

After provisioning, CI must prove:

```text
node --version = v24.19.0
npm --version = 11.17.0
```

---

## 7. GitHub Action Candidate Families

Only these action families are admitted for I3:

```text
actions/checkout
pnpm/action-setup
actions/dependency-review-action   # only when platform eligibility passes
```

No upload-artifact action is required for the baseline.

No setup-node action is required by this I3 design because Node is checksum-provisioned directly.

Current release-tag candidates to verify against the official upstream repositories at execution time are:

```text
actions/checkout -> v7.0.1
pnpm/action-setup -> v6.0.9
actions/dependency-review-action -> v5.0.0
```

These tag names are discovery inputs only.

FINAL WORKFLOW FILES MUST NOT USE MOVING TAGS.

For every action actually used:

1. confirm the exact official upstream repository;
2. confirm the exact selected release tag exists;
3. resolve the release tag to the exact immutable commit SHA;
4. record the full 40-character SHA;
5. record license;
6. use only the immutable commit SHA in workflow `uses:`;
7. add a human-readable comment with the reviewed release tag.

Permitted example shape:

```yaml
uses: actions/checkout@<FULL_40_HEX_SHA> # v7.0.1
```

Forbidden:

```text
@main
@master
@v7
@v7.0.1
```

in the final workflow.

If official release identity cannot be resolved unambiguously:

STOP:

`BLOCKED — GITHUB ACTION IMMUTABLE PIN RESOLUTION FAILURE`

---

## 8. GitHub Dependency Review Platform Eligibility

The remote repository is currently private.

Before creating a Dependency Review Action workflow, determine current platform eligibility using GitHub CLI/API and official GitHub capability facts.

Record at minimum:

- owner login;
- owner type;
- repository visibility;
- whether the repository is public;
- whether applicable GitHub Advanced Security / GitHub Code Security capability is available for the private repository;
- whether the Dependency Review Action is usable for this repository.

Do NOT:

- change repository visibility;
- purchase/enable a paid product;
- move the repository to an organization;
- change remote settings.

### If eligible

Create a pull-request dependency-review workflow using:

- immutable checkout pin;
- immutable dependency-review-action pin;
- `permissions: contents: read`;
- no PR write permission;
- no automatic PR comments;
- vulnerability threshold at least `moderate`;
- review scopes including development dependencies;
- license policy consistent with the RetroStage license contract.

### If not eligible

Do NOT create a known-nonfunctional Dependency Review Action workflow.

Record:

`GITHUB_DEPENDENCY_REVIEW_ACTION = DEFERRED_PLATFORM_CAPABILITY`

This is non-blocking only if the repository-local dependency/vulnerability/license policy required below is fully implemented and passes.

The platform action may be activated later only after the repository becomes eligible.

---

## 9. CI Workflow

Create:

`.github/workflows/ci.yml`

The baseline workflow must:

- trigger on `push` and `pull_request`;
- use `ubuntu-24.04`;
- use least privilege:

```yaml
permissions:
  contents: read
```

- pin every third-party action by full immutable SHA;
- use `persist-credentials: false` for checkout;
- provision exact Node 24.19.0 with checksum verification;
- install exact pnpm 11.17.0 through the reviewed immutable `pnpm/action-setup` pin;
- run:

```text
pnpm install --frozen-lockfile
pnpm run validate
pnpm run compliance:check
pnpm run dependency:audit
```

Do not enable dependency lifecycle scripts.

The committed pnpm 11 project policy remains authoritative:

```text
autoInstallPeers = false
strictPeerDependencies = true
ignoreScripts = true
savePrefix = ""
```

The workflow must not require secrets.

The workflow must not push, publish, release, upload packages, or modify the repository.

---

## 10. Repository Dependency Audit

Add a root script:

`dependency:audit`

It must run an online vulnerability audit over the admitted dependency graph using the pinned package manager.

Use a blocking severity threshold of:

`high`

High or critical vulnerabilities must fail.

Moderate/low findings may be recorded but do not automatically block this bootstrap slice unless the finding affects an executed bootstrap/security path and materially invalidates the baseline.

Do not auto-fix.

Do not run:

```text
pnpm audit --fix
npm audit fix
```

Any high/critical finding must be reported with exact package, advisory identity, path, and available remediation.

---

## 11. License Policy

The authoritative automatically admissible license families are:

```text
MIT
Apache-2.0
BSD-2-Clause
BSD-3-Clause
ISC
Zlib
0BSD
CC0-1.0
Unlicense
clearly documented public-domain dedication
```

Manual-review families include:

```text
MPL-2.0
LGPL-2.0-or-later
LGPL-3.0-or-later
EPL
CDDL
SIL Open Font License
mixed or multiple licenses
custom/source-available licenses
```

Prohibited-by-default families include:

```text
GPL-2.0
GPL-3.0
AGPL
SSPL
Commons Clause
Business Source License
PolyForm
Non-Commercial restrictions
No-Derivatives restrictions
field-of-use restrictions
unknown/custom terms without clear commercial permission
No License
```

The I3 local compliance checker must classify every installed external package/version.

If a package has:

- prohibited-by-default license;
- no discoverable license;
- materially ambiguous/custom terms;
- a manual-review family not already explicitly owner-approved;

STOP:

`BLOCKED — THIRD-PARTY LICENSE REVIEW REQUIRED`

List exact packages and evidence.

Do not change dependencies automatically to escape a license finding.

---

## 12. Compliance Topology

Create the repository root:

`compliance/`

Create at minimum:

```text
compliance/bom.cdx.json
compliance/THIRD_PARTY_NOTICES.html
compliance/dependency-inventory.json
compliance/license-review.json
compliance/native-binary-inventory.json
compliance/wasm-module-inventory.json
compliance/README.md
```

These are bootstrap compliance artifacts.

They are NOT final commercial-release approval.

---

## 13. Compliance Tooling

Create narrow infrastructure tooling under:

`tooling/compliance/`

The exact filenames may be chosen for clarity, but the implementation must provide explicit commands for:

- generating dependency inventory;
- generating license review;
- generating notices;
- generating native/WASM inventories;
- invoking native pnpm CycloneDX generation;
- canonicalizing the SBOM when needed for deterministic checked-in output;
- checking that checked-in compliance artifacts match the current lock/install state.

No product code may enter this directory.

Prefer Node standard-library APIs and existing admitted tooling.

Do not add a direct dependency unless separately authorized.

---

## 14. Dependency Inventory Requirements

`compliance/dependency-inventory.json` must include every external installed package/version relevant to the current workspace and at minimum record:

```text
name
version
package identity / purl where available
direct_or_transitive
development_or_runtime_scope
license expression
package repository/homepage where available
installed evidence path or resolution identity
native/WASM flag
distribution scope
```

Current RSM-3 product distribution scope is:

`DEVELOPMENT / BOOTSTRAP TOOLING ONLY`

unless a package is genuinely part of repository-owned workspace metadata.

Do not claim dev-only dependencies ship in the editor/player.

Sort deterministically.

No timestamp-dependent ordering.

---

## 15. License Review Artifact

`compliance/license-review.json` must record per exact package/version:

```text
license
classification
evidence source
notice/license file evidence
manual review required
prohibited
distribution scope
notes
```

It must also record totals:

```text
automatically admissible
manual review required
prohibited
unknown/no-license
```

I3 success requires:

```text
manual review required = 0
prohibited = 0
unknown/no-license = 0
```

unless an already-existing explicit owner decision covers the exact package/version and exact license state.

---

## 16. Third-Party Notices

Generate:

`compliance/THIRD_PARTY_NOTICES.html`

It must be deterministic and HTML-escaped.

For every included exact package/version, provide at minimum:

- dependency name;
- exact version;
- license identifier/expression;
- copyright holder where stated and discoverable;
- license text when physically available;
- otherwise an explicit reviewed source-link strategy;
- NOTICE content when physically required and available;
- current distribution scope;
- special attribution/obligation note where applicable.

Sort entries deterministically by normalized package name and version.

Do not include secrets, local absolute user paths, access tokens, or unstable timestamps.

Generate twice and require identical SHA-256.

---

## 17. Native Binary and WASM Inventory

Scan the physically installed development dependency graph.

Generate:

`compliance/native-binary-inventory.json`

and:

`compliance/wasm-module-inventory.json`

For every detected native/WASM artifact record at minimum:

```text
owning package
exact version
relative artifact filename
artifact type
platform
architecture where determinable
SHA-256
license
source/provenance reference
distribution scope
```

Current expected classification for bootstrap-tool binaries is generally:

`DEVELOPMENT_TOOL_ONLY / NOT PACKAGED`

Do not silently ignore `.node`, `.dll`, `.exe`, or `.wasm` files found inside admitted dependency packages.

Empty inventories are permitted only when the scan physically finds zero matching artifacts.

Sort deterministically.

---

## 18. Native pnpm CycloneDX SBOM

Use the exact physical `pnpm 11.17.0` native SBOM command discovered from:

`pnpm sbom --help`

Generate a CycloneDX JSON SBOM to a temporary location first.

Then create the checked-in:

`compliance/bom.cdx.json`

Requirements:

- `bomFormat = CycloneDX`;
- JSON parses successfully;
- supported CycloneDX spec version is recorded;
- root/workspace component identity is truthful;
- component `bom-ref` identities are unique where required by the produced format;
- external package identities are traceable to the installed/locked graph;
- no local absolute user paths;
- no secrets.

If native output includes volatile fields that prevent deterministic repository checking, canonicalize only objectively volatile metadata such as generation timestamps/serial identifiers while preserving dependency/component semantics and CycloneDX validity.

Sort semantically unordered arrays deterministically where safe.

Generate/canonicalize twice and require identical SHA-256.

Do not fabricate components absent from native SBOM evidence.

---

## 19. Root Scripts

Extend the root `package.json` scripts with truthful commands for at least:

```text
dependency:audit
compliance:generate
compliance:check
ci:validate
```

`ci:validate` must compose the intended CI baseline and fail if required checks fail.

Do not alter the exact seven I2 direct dependency versions.

No new direct dependency is expected.

If `package.json` dependency identities change:

STOP:

`BLOCKED — I3 UNAUTHORIZED DEPENDENCY ADMISSION`

---

## 20. Lockfile Immutability

Because I3 is not expected to add a direct npm dependency, the accepted I2 lockfile must remain byte-identical:

```text
pnpm-lock.yaml SHA-256 =
55A479A66A0FB068D45F772917CE445059DC77AE94A222D61E5789498A3AD949
```

If the lockfile changes unexpectedly:

STOP:

`BLOCKED — I3 UNAUTHORIZED LOCKFILE DRIFT`

Do not regenerate or normalize it merely because package scripts changed.

---

## 21. Post-I2 Live Source Synchronization

Synchronize byte-identically into the repository:

```text
bootstrap Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
-> docs/sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md

bootstrap Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
-> docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Required destination hashes:

```text
02 =
E37BCFE3D19FD558F60A653BDBB132A37F4F7D62F0448356225B34F4B891445F

08 =
680EFD1C9BD21B0F5C17FC586593C22FC7C96DBEBBF35F6E65ACFA44D1414418
```

No other live source copy changes unless separately authorized.

---

## 22. I2 Closure Evidence Synchronization

Import the post-I2 evidence required to explain I3 authority under:

`docs/evidence/rsm-3/rsm-3-i2/`

Retain byte-identically every physically available accepted I2 control artifact needed for the complete lineage, including:

### Original I2 candidate

- `RSM-3-I2-REGISTRY-AND-DEPENDENCY-ADMISSION-EVIDENCE.tsv`
- `RSM-3-I2-REPOSITORY-MUTATION-MANIFEST.tsv`
- `RSM-3-I2-TOOLCHAIN-LOCKFILE-AND-TRANSITIVE-REVIEW.md`
- `RSM-3-I2-VALIDATION-REPORT.md`
- `RSM-3-I2-STAGED-CANDIDATE-REPORT.md`

### Exact-content review lineage

- `RSM-3-I2-REVIEWPKG1-EXACT-STAGED-CONTENT-CAPTURE-PROMPT.md`
- `RSM-3-I2-REVIEWPKG1-EXACT-STAGED-PATCH.diff`
- `RSM-3-I2-REVIEWPKG1-INTEGRITY-REPORT.md`
- `RSM-3-I2-CHATGPT-INDEPENDENT-STAGED-CONTENT-REVIEW.md`

### FIX1 lineage

- `RSM-3-I2-FIX1-PNPM11-PROJECT-CONFIG-LOCATION-CORRECTION-PROMPT.md`
- `RSM-3-I2-FIX1-PNPM11-CONFIG-LOCATION-EVIDENCE.md`
- `RSM-3-I2-FIX1-VALIDATION-REPORT.md`
- `RSM-3-I2-FIX1-STAGED-CANDIDATE-REPORT.md`
- `RSM-3-I2-FIX1-EXACT-STAGED-PATCH.diff`
- `RSM-3-I2-CHATGPT-INDEPENDENT-FIX1-STAGED-CONTENT-REVIEW.md`

### I2 commit / closure / activation

- `RSM-3-I2-COMMIT1-OWNER-AUTHORIZED-TOOLCHAIN-COMMIT-POST-COMMIT-VERIFICATION-PROMPT.md`
- `RSM-3-I2-COMMIT1-POST-COMMIT-EVIDENCE.md`
- `RSM-3-I2-COMMIT1-READINESS-REPORT.md`
- `RSM-3-I2-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
- `RSM-3-I2-ALIGN1-CURRENT-STATE-AND-I3-ACTIVATION-PROMPT.md`
- `RSM-3-I2-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`
- `RSM-3-I2-ALIGN1-I3-ACTIVATION-REPORT.md`

If any listed required physical artifact is missing:

STOP:

`BLOCKED — I2 CLOSURE EVIDENCE INCOMPLETE`

Do not synthesize or reconstruct it.

These imported files are evidence only, not standing executable instructions.

---

## 23. I3 Prompt Retention

Retain this exact physical prompt under:

`docs/evidence/rsm-3/rsm-3-i3/RSM-3-I3-CI-DEPENDENCY-REVIEW-SBOM-NOTICES-BASELINE-IMPLEMENTATION-PROMPT.md`

Policy:

`COPY_BYTE_IDENTICAL`

It becomes traceability evidence, not a standing instruction.

---

## 24. GitHub Workflow Static Validation

Because the remote remains unpushed during I3, no GitHub-hosted workflow execution can yet be claimed.

Local I3 must nevertheless validate the workflow files.

At minimum:

- Prettier must parse/check YAML;
- every `uses:` reference must be a full 40-hex immutable SHA;
- each action owner/repository must match the admitted family;
- no mutable action tags remain;
- workflow permissions must be explicit and least-privilege;
- no secrets are referenced;
- no write/publish/push step exists;
- CI Node checksum equals the accepted Node 24.19.0 Linux x64 SHA;
- CI pnpm version equals `11.17.0`;
- CI required command sequence is present.

Do not claim:

`CI EXECUTED ON GITHUB`

during I3.

Expected current state is:

`CI CONFIGURATION LOCALLY VALIDATED / REMOTE EXECUTION DEFERRED TO I4`

---

## 25. Full Local Validation

After implementation, run at minimum:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd run format:check
pnpm.cmd run lint
pnpm.cmd run typecheck
pnpm.cmd run test
pnpm.cmd run arch:check
pnpm.cmd run deadcode:check
pnpm.cmd run build
pnpm.cmd run validate
pnpm.cmd run compliance:generate
pnpm.cmd run compliance:check
pnpm.cmd run dependency:audit
pnpm.cmd run ci:validate
```

Required:

- every mandatory local command exit code = `0`;
- test count remains at least the existing `3/3`, plus any new meaningful I3 compliance tests;
- architecture violations = `0`;
- Knip final findings = `0`;
- lockfile drift = `0`;
- generated compliance artifacts deterministic;
- high/critical vulnerability findings = `0`;
- license manual/prohibited/unknown blocker count = `0`.

If an existing accepted dependency produces a material vulnerability/license blocker:

STOP and report it.

Do not auto-update packages.

---

## 26. CI / Compliance Tests

Add meaningful tests for I3-owned tooling.

At minimum test:

1. license classification rejects a prohibited license;
2. license classification marks manual-review licenses correctly;
3. notice HTML escaping/deterministic ordering;
4. native/WASM inventory classification for fixture inputs;
5. workflow pin validator rejects a mutable action ref;
6. workflow pin validator accepts a valid immutable 40-hex action ref.

Do not add fake green assertions.

Tests must remain infrastructure/compliance-only.

---

## 27. Repository Mutation Classification

Before staging, classify every repository delta relative to accepted I2 HEAD:

`302538e3692ed82daa969bceed0a63945736fc5f`

Allowed classifications:

```text
LIVE_SOURCE_SYNC
I2_CLOSURE_EVIDENCE_SYNC
I3_EXECUTION_PROMPT
I3_GITHUB_WORKFLOW
I3_DEPENDENCY_REVIEW_CONFIG
I3_ROOT_SCRIPT_UPDATE
I3_COMPLIANCE_TOOLING
I3_COMPLIANCE_ARTIFACT
I3_COMPLIANCE_DOCUMENTATION
```

No unclassified mutation is allowed.

`pnpm-lock.yaml` must not be a mutation.

---

## 28. Bootstrap Workspace Mutation Guard

Before any I3 write, hash all pre-existing files under:

`C:\RetroStage\bootstrap\RSM-3-A`

No pre-existing bootstrap file may change.

Only the exact I3 evidence outputs in Section 32 may be created.

Required:

```text
UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0
```

---

## 29. Staging

Only after all local validation passes:

Stage the exact governed I3 candidate.

Do not commit.

Do not push.

Then capture:

```powershell
git status --short --untracked-files=all
git status --porcelain=v2 --untracked-files=all
git diff --name-status
git diff --cached --name-status
git diff --cached --stat
git diff --cached --check
git ls-files --others --exclude-standard
```

Required:

- all intended tracked I3 changes staged;
- unstaged tracked changes = `0`;
- unexpected untracked non-ignored files = `0`;
- `git diff --cached --check` = PASS;
- HEAD remains `302538e3692ed82daa969bceed0a63945736fc5f`;
- commit count remains `2`;
- remote refs remain `0`;
- push remains `FALSE`.

---

## 30. Exact Staged Patch

Generate a complete exact staged patch against accepted I2 HEAD:

```text
302538e3692ed82daa969bceed0a63945736fc5f
```

Use:

```text
git diff --cached --no-ext-diff --full-index --binary
```

Do not truncate.

Do not filter.

Recompute independently and require byte equality.

Required:

`FINAL_I3_STAGED_PATCH_IDENTITY_STABLE = TRUE`

This patch is mandatory for the next independent content review.

---

## 31. No Commit / No Push

Explicitly forbidden:

```text
git commit
git push
git push -u
git reset
git clean
git stash
git rebase
git commit --amend
```

Do not create I3 commit.

Do not initialize remote refs.

Do not authorize I4.

---

## 32. Required I3 Bootstrap Outputs

Create exactly SIX new files under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

### Output 1

`RSM-3-I3-ACTION-PIN-AND-PLATFORM-ELIGIBILITY-EVIDENCE.tsv`

Columns at minimum:

```text
action_family
selected_release_tag
resolved_commit_sha
official_upstream
license
used_in_final_workflow
platform_eligibility
result
notes
```

Also record Dependency Review Action eligibility.

---

### Output 2

`RSM-3-I3-COMPLIANCE-AND-LICENSE-BASELINE-REPORT.md`

Record:

- native pnpm SBOM command identity;
- SBOM spec version;
- SBOM SHA-256;
- SBOM component count;
- dependency inventory count;
- direct/transitive counts;
- license classification counts;
- notice-entry count;
- notices SHA-256;
- native binary count;
- WASM count;
- prohibited/manual/unknown blocker count;
- deterministic regeneration result.

---

### Output 3

`RSM-3-I3-CI-AND-DEPENDENCY-REVIEW-VALIDATION.md`

Record:

- exact CI workflow paths;
- Node provisioning identity/checksum;
- pnpm action exact immutable pin;
- checkout exact immutable pin;
- Dependency Review Action state;
- explicit workflow permissions;
- local workflow static-validation result;
- local CI-equivalent command results;
- vulnerability audit result;
- GitHub-hosted execution status:
  `NOT EXECUTED / DEFERRED TO I4`.

---

### Output 4

`RSM-3-I3-REPOSITORY-MUTATION-MANIFEST.tsv`

Columns:

```text
repository_relative_path
change_type
classification
pre_task_sha256
post_task_sha256
staged
reason
```

Every intended tracked mutation exactly once.

---

### Output 5

`RSM-3-I3-STAGED-CANDIDATE-REPORT.md`

Must state:

- starting/ending HEAD;
- commit count;
- exact staged path count;
- exact new/modified/deleted count;
- unstaged count;
- unexpected untracked count;
- `git diff --cached --check`;
- bootstrap unauthorized mutation count;
- lockfile changed: `FALSE`;
- direct dependency count and mismatch count;
- source 02/08 sync;
- I2 closure evidence sync;
- CI workflow count;
- action mutable-ref count;
- SBOM/license/notices validation state;
- dependency-review platform state;
- vulnerability blocker count;
- license blocker count;
- product implementation count;
- commit performed;
- push performed;
- I4 authorization state.

---

### Output 6

`RSM-3-I3-EXACT-STAGED-PATCH.diff`

The complete exact staged patch against:

`302538e3692ed82daa969bceed0a63945736fc5f`

No filtering or truncation.

---

## 33. Stop Conditions

Stop without improvising if:

- entry repository baseline drifts;
- live source identity drifts;
- native pnpm CycloneDX capability is unavailable;
- a new direct npm dependency becomes necessary;
- lockfile changes;
- exact Node CI identity cannot be checksum-provisioned;
- an admitted GitHub Action cannot be pinned immutably;
- high/critical vulnerability is present;
- prohibited/manual/unknown license blocker remains;
- compliance generation is nondeterministic;
- I2 closure evidence is missing;
- an unauthorized repository/bootstrap mutation occurs;
- CI requires a secret;
- any product dependency/code becomes necessary;
- commit/push would be required to continue.

Do not create a follow-up FIX prompt.

Preserve evidence and report the exact blocker.

---

## 34. Final Decision

The staged-candidate report must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I3 STAGED-CONTENT REVIEW`

or

`BLOCKED — RSM-3-I3 MATERIAL FAILURE`

Do NOT declare I3 closed.

Do NOT authorize I4.

Do NOT commit.

Do NOT push.

---

## 35. Success Condition

RSM-3-I3 implementation succeeds when:

1. accepted I2 HEAD remains unchanged;
2. live source 02/08 delta is synchronized into the repository;
3. I2 closure evidence is retained;
4. `.github` CI baseline exists with immutable action pins;
5. exact Node 24.19.0 and pnpm 11.17.0 CI identities are controlled;
6. dependency-review platform eligibility is truthfully handled;
7. an authoritative local dependency/vulnerability gate exists;
8. native pnpm produces the CycloneDX SBOM baseline;
9. dependency, license, notice, native, and WASM inventories exist;
10. license policy is fail-closed;
11. compliance artifacts regenerate deterministically;
12. full local I2 validation remains green;
13. no lockfile/direct dependency drift occurs;
14. no product dependency or product implementation enters;
15. the complete I3 candidate is staged;
16. an exact unfiltered staged patch is captured;
17. no commit or push occurs;
18. six exact I3 evidence outputs exist.

The next authority after success is ChatGPT independent review of the actual staged I3 patch.
