# RetroStage Maker — RSM-3-I3-RESUME1 CI / Security / SBOM / Third-Party Notices Implementation

**Document ID:** `RSM-3-I3-RESUME1-CI-SECURITY-SBOM-NOTICES-IMPLEMENTATION-PROMPT`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Current phase:** `RSM-3-I3 — CI / Dependency Review / SBOM / Third-Party Notices`  
**Task:** `RSM-3-I3-RESUME1 — CI / Security / SBOM / Third-Party Notices Implementation`  
**Primary executor:** `Codex`  
**Authoritative local shell:** `Windows PowerShell 5.1`  
**Mode:** `CONTROLLED IMPLEMENTATION / EXACT STAGED CANDIDATE / NO COMMIT / NO PUSH`

This is the revised full-I3 implementation task after the closed PRE1 security remediation.

Do NOT reuse the superseded pre-PRE1 I3 execution assumptions.

---

# 1. Entry Authority

Before any repository mutation, fully read and verify at minimum:

## Live sources

- `C:\RetroStage\bootstrap\RSM-3-A\Sources\00_RSM_REBOOT_PROJECT_CHARTER.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\01_RSM_REBOOT_CANONICAL_ROADMAP.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\03_RSM_REBOOT_ARCHITECTURE_AND_PACKAGE_MAP.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\04_RSM_REBOOT_ENGINEERING_AND_REVIEW_WORKFLOW.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\05_RSM_REBOOT_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\06_RSM_REBOOT_TECHNOLOGY_DEPENDENCY_AND_LICENSE_CONTRACT.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md`
- `C:\RetroStage\bootstrap\RSM-3-A\Sources\09_RSM_REBOOT_HISTORICAL_SOURCE_INDEX.md`

## PRE1 authority and closure lineage

- `RSM-3-I3-PRE1-OWNER-SECURITY-AND-LICENSE-DECISION-LOCK.md`
- `RSM-3-I3-PRE1-VITEST-SECURITY-REMEDIATION-EVIDENCE.md`
- `RSM-3-I3-PRE1-EXACT-LICENSE-DECISION-APPLICATION.md`
- `RSM-3-I3-PRE1-STAGED-CANDIDATE-REPORT.md`
- `RSM-3-I3-PRE1-EXACT-STAGED-PATCH.diff`
- `RSM-3-I3-PRE1-CHATGPT-INDEPENDENT-SECURITY-REMEDIATION-REVIEW.md`
- `RSM-3-I3-PRE1-COMMIT1-POST-COMMIT-EVIDENCE.md`
- `RSM-3-I3-PRE1-COMMIT1-READINESS-REPORT.md`
- `RSM-3-I3-PRE1-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
- `RSM-3-I3-PRE1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`
- `RSM-3-I3-PRE1-ALIGN1-I3-RESUME-ACTIVATION-REPORT.md`

Required current activation decision:

`RSM-3-I3 AUTHORIZED / READY TO RESUME IMPLEMENTATION`

If the decision is not exact:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 ENTRY AUTHORITY INVALID`

---

# 2. Exact Current Live-Source Identities

Before repository mutation, recompute:

```text
02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
SHA-256 =
80C77A77775453DF8815DF957F79B2413778424C9CC7DAFFC2BEAF452AF79FEF

08_RSM_REBOOT_CURRENT_MILESTONE.md
SHA-256 =
E187743D5D6E6FE0F0F597E7D60D9753F813709F083BD994876FD03AB4FC4FE8
```

If either differs:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 LIVE SOURCE IDENTITY DRIFT`

Do not rewrite the bootstrap authority files.

---

# 3. Exact Accepted Repository Baseline

Canonical repository:

`C:\RetroStage\retrostage-maker`

Required starting state:

```text
Git repository = TRUE
branch = main
HEAD = 5c7ff6322ba2583176065a919db385d51b650fba
parent = 302538e3692ed82daa969bceed0a63945736fc5f
commit count = 3
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

Committed dependency/security baseline:

```text
direct dev dependency count = 7

dependency-cruiser = 16.10.0
eslint = 9.21.0
knip = 6.32.0
prettier = 3.5.2
typescript = 6.0.3
typescript-eslint = 8.66.0
vitest = 3.2.6

package.json SHA-256 =
08C9EEA3EA21C260AFD97CB31A19D267D6793DD81FE46730E19E510AD876098A

pnpm-lock.yaml SHA-256 =
CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0
```

Recheck physically before any write.

If repository or dependency baseline differs:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 REPOSITORY BASELINE DRIFT`

Do not reset, restore, clean, stash, rebase, regenerate, or repair automatically.

---

# 4. Security Carry-Forward

The critical Vitest advisory is closed by committed PRE1 remediation.

The following finding remains open and MUST remain visible:

```text
advisory = GHSA-xffm-g5w8-qvg7
package = @eslint/plugin-kit@0.2.8
severity = low
state = OPEN NON-BLOCKING
```

Do not silently remove, suppress, or relabel this finding.

It must appear in:

- repository security/compliance evidence;
- I3 compliance report;
- staged candidate report.

If the package/version disappears naturally from the current locked graph without dependency mutation, record that physical fact.

Do not upgrade ESLint or any dependency merely to remove this low finding during I3.

---

# 5. Exact Owner-Approved License Exceptions

The normal governing license policy remains unchanged.

The only narrow exact owner approvals are:

```text
argparse@2.0.1
license = Python-2.0
scope = TRANSITIVE DEVELOPMENT / BOOTSTRAP TOOLING ONLY

minimatch@10.2.6
license = BlueOak-1.0.0
scope = TRANSITIVE DEVELOPMENT / BOOTSTRAP TOOLING ONLY
```

Classification when physically present:

`OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE`

These approvals do NOT apply to:

- another package;
- another version;
- another license identity;
- later product/runtime distribution without new evidence.

Any other manual-review, prohibited, custom/ambiguous, unknown, or no-license state remains blocking.

---

# 6. I3 Scope

RSM-3-I3-RESUME1 owns only:

- `.github/` CI baseline;
- immutable GitHub Action pins;
- local dependency vulnerability gate;
- truthful Dependency Review Action eligibility/deferment;
- native pnpm CycloneDX SBOM generation;
- deterministic dependency inventory;
- deterministic license review;
- deterministic third-party notices;
- native-binary inventory;
- WASM inventory;
- security-findings baseline;
- compliance validation tooling/tests;
- post-PRE1 live source synchronization;
- I2/I3/PRE1 evidence synchronization;
- exact staged I3 candidate;
- exact full staged patch.

It does NOT own:

- remote push;
- branch-protection changes;
- repository visibility changes;
- paid GitHub security product enablement;
- clean clone / restore proof;
- product implementation;
- Electron;
- Babylon.js;
- React;
- TypeBox/Ajv;
- packaging/signing;
- release distribution;
- source 07 creation.

---

# 7. No New Direct npm Dependency

No new direct dependency is authorized.

Final root direct dev dependency count must remain exactly:

`7`

`package.json` may change only to add or refine I3-owned scripts.

The exact seven direct dependency versions must remain unchanged.

Required final:

```text
unexpected direct dependency count = 0
product dependency direct-admission count = 0
```

If a new dependency appears necessary:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 NEW DEPENDENCY REQUIRED`

Do not choose or install one automatically.

---

# 8. Lockfile Immutability

I3-RESUME1 is not authorized to change the dependency graph.

Required final lockfile SHA-256:

`CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0`

Before and after implementation:

```text
pnpm-lock.yaml byte drift = 0
```

If the lockfile changes:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 UNAUTHORIZED LOCKFILE DRIFT`

Do not regenerate or normalize it.

---

# 9. Native pnpm CycloneDX Capability

Use the physically pinned:

`pnpm 11.17.0`

Before any SBOM implementation, run:

```powershell
pnpm.cmd --version
pnpm.cmd sbom --help
```

Required:

```text
pnpm version = 11.17.0
native sbom help exit code = 0
CycloneDX output capability = TRUE
external SBOM package required = FALSE
```

The prior physical preflight observed:

```text
native command family = pnpm sbom
format = cyclonedx
supported CycloneDX versions = 1.5, 1.6, 1.7
default observed spec version = 1.7
```

Re-observe the exact current CLI syntax.

Do not add:

- `cyclonedx-node-pnpm`;
- `cyclonedx-node-npm`;
- `cdxgen`;
- any other direct SBOM dependency.

If native pnpm CycloneDX support is unavailable:

STOP:

`BLOCKED — PINNED PNPM NATIVE CYCLONEDX CAPABILITY UNAVAILABLE`

---

# 10. Node 24.19.0 CI External Identity

The repository toolchain remains pinned to:

`Node 24.19.0`

Before creating CI, verify official Node.js release evidence from:

`https://nodejs.org/download/release/v24.19.0/`

Required Linux x64 archive:

`node-v24.19.0-linux-x64.tar.xz`

Required official SHA-256:

`14b342e71204f811bde6153be8e04b62aef63c236fef92b55f9c83154b409647`

Do not accept a mirror-only checksum.

Do not use a nightly build.

Do not use an unofficial binary.

If official release or checksum does not match:

STOP:

`BLOCKED — NODE 24.19.0 OFFICIAL CI IDENTITY FAILURE`

---

# 11. Immutable GitHub Action Pins

The blocked pre-PRE1 I3 preflight already resolved:

```text
actions/checkout
reviewed release = v7.0.1
resolved commit =
3d3c42e5aac5ba805825da76410c181273ba90b1

pnpm/action-setup
reviewed release = v6.0.9
resolved commit =
0ebf47130e4866e96fce0953f49152a61190b271

actions/dependency-review-action
reviewed release = v5.0.0
resolved commit =
a1d282b36b6f3519aa1f3fc636f609c47dddb294
```

Before mutation, re-resolve each relevant official tag from official upstream with `git ls-remote`.

For annotated tags, dereference to the commit.

Required:

```text
full 40-hex pin mismatch count = 0
official upstream mismatch count = 0
license mismatch count = 0
```

Final workflow MUST use only immutable full commit SHA values.

Moving tags are forbidden in committed workflow `uses:` values.

Human-readable reviewed version comments are permitted.

Example:

```yaml
uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

---

# 12. Dependency Review Action Platform State

The previously observed repository platform state was:

```text
owner = caosvein
owner type = User
visibility = private
security_and_analysis = null
Dependency Review Action usable = FALSE
state = DEFERRED_PLATFORM_CAPABILITY
```

Recheck through GitHub CLI/API before workflow creation.

Do NOT:

- make the repository public;
- move it to an organization;
- buy/enable a paid GitHub security product;
- change remote configuration.

If the repository remains ineligible:

```text
GITHUB_DEPENDENCY_REVIEW_ACTION = DEFERRED_PLATFORM_CAPABILITY
```

and do NOT create a known-nonfunctional dependency-review workflow.

This deferment is non-blocking only if the local vulnerability/license/compliance gates below are implemented and pass.

If the platform has become eligible without project-side mutation, record exact evidence before using the action.

---

# 13. CI Workflow

Create:

`.github/workflows/ci.yml`

Required triggers:

```text
push
pull_request
```

Required runner:

`ubuntu-24.04`

Required top-level permissions:

```yaml
permissions:
  contents: read
```

No write permission.

No secret required.

No repository mutation.

## Checkout

Use exact immutable:

`actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1`

with:

```yaml
persist-credentials: false
```

## Exact Node provisioning

Provision official `node-v24.19.0-linux-x64.tar.xz` into a runner-temporary directory.

Required behavior:

1. HTTPS download from official nodejs.org release location;
2. verify exact SHA-256 before extraction;
3. extract under `$RUNNER_TEMP` or equivalent non-repository runner path;
4. add only its `bin` directory to GitHub Actions PATH;
5. verify:

```text
node --version = v24.19.0
```

Do not rely on the runner's preinstalled Node for project validation.

Do not use a floating `24` version.

## pnpm setup

Use exact immutable:

`pnpm/action-setup@0ebf47130e4866e96fce0953f49152a61190b271`

Configure exact pnpm:

`11.17.0`

Do not let the action perform an uncontrolled install.

Verify:

```text
pnpm --version = 11.17.0
```

## Required CI commands

Run at minimum:

```text
pnpm install --frozen-lockfile
pnpm run validate
pnpm run compliance:check
pnpm run dependency:audit
```

The committed project policy remains authoritative:

```text
autoInstallPeers = false
strictPeerDependencies = true
ignoreScripts = true
savePrefix = ""
```

Do not pass a flag that weakens it.

No publish, release, commit, push, or artifact upload is required.

---

# 14. Vulnerability Gate

Add root script:

`dependency:audit`

It must run a read-only vulnerability audit with blocking threshold:

`high`

Expected current baseline after PRE1:

```text
critical = 0
high = 0
low finding GHSA-xffm-g5w8-qvg7 remains recorded if still present
```

Do not auto-fix.

Do not update dependencies.

If a high or critical finding exists:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 HIGH/CRITICAL VULNERABILITY`

Record exact:

- advisory;
- severity;
- package/version;
- dependency path;
- patched boundary where available.

Low/moderate findings must remain visible in generated security findings.

---

# 15. Compliance Repository Topology

Create:

`compliance/`

At minimum:

```text
compliance/bom.cdx.json
compliance/dependency-inventory.json
compliance/license-review.json
compliance/THIRD_PARTY_NOTICES.html
compliance/native-binary-inventory.json
compliance/wasm-module-inventory.json
compliance/security-findings.json
compliance/README.md
```

These are current bootstrap/toolchain compliance artifacts.

They are NOT final product-release compliance approval.

Current distribution classification:

`DEVELOPMENT / BOOTSTRAP TOOLING ONLY`

unless exact physical evidence requires a different classification.

---

# 16. Compliance Tooling

Create narrow repository infrastructure under:

`tooling/compliance/`

Use existing admitted dependencies and Node standard-library APIs.

No new direct dependency.

The implementation must provide truthful commands for:

- dependency inventory generation;
- exact license classification;
- exact owner-license exception application;
- third-party notices generation;
- native binary inventory;
- WASM inventory;
- security-findings generation;
- native pnpm CycloneDX SBOM generation;
- deterministic/canonical SBOM processing where objectively required;
- workflow immutable-pin validation;
- full compliance regeneration/checking.

Do not create product/runtime code.

---

# 17. Dependency Inventory

Generate deterministic:

`compliance/dependency-inventory.json`

Cover every physically installed external exact package/version relevant to the workspace.

At minimum record:

```text
name
version
purl or equivalent package identity where derivable
direct/transitive
development/runtime scope
license expression
repository/homepage when discoverable
locked/installed resolution identity
native flag
WASM flag
distribution scope
```

Sort deterministically by normalized package identity.

No absolute user path.

No access token.

No unstable timestamp required.

---

# 18. License Classification

Generate:

`compliance/license-review.json`

Default automatically admissible families remain:

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

Apply only these exact owner exceptions:

```text
argparse@2.0.1 / Python-2.0
minimatch@10.2.6 / BlueOak-1.0.0
```

For each exact package/version record:

```text
license
classification
evidence source
license/notice file identity
manual review required
owner exact exception
prohibited
distribution scope
notes
```

Final success requires:

```text
unapproved manual review = 0
prohibited = 0
unknown/no-license = 0
```

If a new non-auto-admissible identity appears:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 NEW LICENSE REVIEW REQUIRED`

Do not infer approval from similarity.

---

# 19. Third-Party Notices

Generate deterministic:

`compliance/THIRD_PARTY_NOTICES.html`

For each included package/version provide, where physically evidenced:

- name;
- exact version;
- license identifier/expression;
- copyright/holder text;
- license text or appropriate license-reference strategy;
- required NOTICE text where present;
- exact current distribution scope;
- special obligation note.

Requirements:

- valid HTML;
- HTML-escaped package/license/notice content;
- deterministic ordering;
- no absolute local user paths;
- no secrets;
- no volatile timestamp.

Generate twice independently.

Required:

`NOTICE_REGEN_SHA256_MATCH = TRUE`

---

# 20. Native Binary Inventory

Generate:

`compliance/native-binary-inventory.json`

Scan the installed dependency graph for relevant native/platform artifacts, including where present:

```text
.node
.dll
.exe
.so
.dylib
platform-specific executable package payloads
```

Record at minimum:

```text
owning package
version
relative artifact path
artifact type
platform
architecture where determinable
SHA-256
license
provenance/source identity
distribution scope
```

Do not silently ignore native bootstrap-tool artifacts.

Sort deterministically.

---

# 21. WASM Inventory

Generate:

`compliance/wasm-module-inventory.json`

For each detected `.wasm` artifact record:

```text
owning package
version
relative artifact path
SHA-256
license
source/provenance identity
distribution scope
```

If none exist, the artifact must truthfully contain an empty deterministic inventory plus scan metadata.

---

# 22. Security Findings Artifact

Generate:

`compliance/security-findings.json`

Record every vulnerability finding returned by the approved audit path.

At minimum fields:

```text
advisory
package
version
severity
dependency path
patched boundary where known
blocking
state
notes
```

The known low carry-forward:

`GHSA-xffm-g5w8-qvg7`

must be present if the vulnerable exact package remains in the active locked graph.

Do not hide non-blocking findings.

---

# 23. CycloneDX SBOM

Generate native pnpm CycloneDX JSON to a temporary non-repository location first.

Use the exact syntax observed from:

`pnpm sbom --help`

Select CycloneDX `1.7` if supported by the exact installed pnpm help as expected.

Create checked-in:

`compliance/bom.cdx.json`

Requirements:

```text
bomFormat = CycloneDX
JSON parse = PASS
spec version = supported exact version
root/workspace identity truthful
component identities traceable to active graph
no secrets
no absolute local paths
```

If native output contains objectively volatile fields such as:

- timestamp;
- generated serial identity;

canonicalize only those volatile fields where required for repository determinism.

Do not change component/dependency semantics.

Do not fabricate components absent from native pnpm output.

Generate/canonicalize twice.

Required:

`SBOM_REGEN_SHA256_MATCH = TRUE`

---

# 24. Compliance Check

Add root scripts at minimum:

```text
dependency:audit
compliance:generate
compliance:check
ci:validate
```

Do not change direct dependency versions.

`compliance:check` must:

1. generate all compliance outputs to a temporary location;
2. compare their semantic/byte identities with checked-in artifacts;
3. fail on drift;
4. fail on license blocker;
5. fail on high/critical vulnerability;
6. fail on mutable action ref;
7. fail on Node checksum/version mismatch;
8. fail on lockfile drift;
9. keep low/moderate findings visible without automatically failing unless governing policy says otherwise.

`ci:validate` must compose the intended local CI-equivalent gates.

---

# 25. Meaningful I3 Tests

Add meaningful infrastructure tests for I3 compliance tooling.

At minimum test:

1. prohibited license is rejected;
2. an unapproved manual-review license blocks;
3. exact approved `argparse@2.0.1 / Python-2.0` is accepted only for that exact identity;
4. exact approved `minimatch@10.2.6 / BlueOak-1.0.0` is accepted only for that exact identity;
5. same license on a different package/version is NOT auto-approved;
6. notice HTML escapes untrusted text;
7. notice ordering is deterministic;
8. native/WASM fixture classification is deterministic;
9. mutable GitHub Action ref is rejected;
10. full 40-hex immutable action ref is accepted;
11. high/critical vulnerability classification blocks;
12. low vulnerability remains visible but non-blocking under current policy.

Existing I2 tests must continue to pass.

Do not add meaningless green assertions.

---

# 26. Local Workflow Static Validation

Because no remote push occurs in I3, GitHub-hosted CI execution cannot be claimed yet.

Statically validate `.github/workflows/ci.yml`.

Required:

```text
YAML parse/format check = PASS
mutable uses refs = 0
unapproved action families = 0
action full-SHA pin mismatch = 0
permissions write scopes = 0
persist-credentials = false
secret references = 0
publish/release/push steps = 0
Node archive version = 24.19.0
Node archive SHA-256 = 14b342e71204f811bde6153be8e04b62aef63c236fef92b55f9c83154b409647
pnpm version = 11.17.0
required CI command sequence = PRESENT
```

Final remote CI state:

`NOT EXECUTED / DEFERRED TO RSM-3-I4`

Do not claim GitHub-hosted success.

---

# 27. Post-PRE1 Live Source Synchronization

Copy byte-identically:

```text
C:\RetroStage\bootstrap\RSM-3-A\Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md
-> docs/sources/02_RSM_REBOOT_CURRENT_PROJECT_STATE.md

C:\RetroStage\bootstrap\RSM-3-A\Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md
-> docs/sources/08_RSM_REBOOT_CURRENT_MILESTONE.md
```

Required repository destination hashes:

```text
02 =
80C77A77775453DF8815DF957F79B2413778424C9CC7DAFFC2BEAF452AF79FEF

08 =
E187743D5D6E6FE0F0F597E7D60D9753F813709F083BD994876FD03AB4FC4FE8
```

Do not modify the bootstrap copies.

---

# 28. Evidence Synchronization

Under:

`docs/evidence/rsm-3/rsm-3-i3/`

retain byte-identically all physically present control artifacts needed to explain the I3 lineage, including:

## Original blocked full-I3 attempt

- `RSM-3-I3-CI-DEPENDENCY-REVIEW-SBOM-NOTICES-BASELINE-IMPLEMENTATION-PROMPT.md`
- `RSM-3-I3-ACTION-PIN-AND-PLATFORM-ELIGIBILITY-EVIDENCE.tsv`
- `RSM-3-I3-COMPLIANCE-AND-LICENSE-BASELINE-REPORT.md`
- `RSM-3-I3-CI-AND-DEPENDENCY-REVIEW-VALIDATION.md`
- `RSM-3-I3-REPOSITORY-MUTATION-MANIFEST.tsv`
- `RSM-3-I3-STAGED-CANDIDATE-REPORT.md`
- `RSM-3-I3-EXACT-STAGED-PATCH.diff` if physically present, including valid zero-byte identity

## PRE1 owner/security remediation

- `RSM-3-I3-PRE1-OWNER-SECURITY-AND-LICENSE-DECISION-LOCK.md`
- `RSM-3-I3-PRE1-SECURITY-AND-LICENSE-BASELINE-REMEDIATION-PROMPT.md`
- `RSM-3-I3-PRE1-VITEST-SECURITY-REMEDIATION-EVIDENCE.md`
- `RSM-3-I3-PRE1-EXACT-LICENSE-DECISION-APPLICATION.md`
- `RSM-3-I3-PRE1-STAGED-CANDIDATE-REPORT.md`
- `RSM-3-I3-PRE1-EXACT-STAGED-PATCH.diff`
- `RSM-3-I3-PRE1-CHATGPT-INDEPENDENT-SECURITY-REMEDIATION-REVIEW.md`
- `RSM-3-I3-PRE1-COMMIT1-OWNER-AUTHORIZED-SECURITY-REMEDIATION-COMMIT-PROMPT.md`
- `RSM-3-I3-PRE1-COMMIT1-POST-COMMIT-EVIDENCE.md`
- `RSM-3-I3-PRE1-COMMIT1-READINESS-REPORT.md`
- `RSM-3-I3-PRE1-CHATGPT-INDEPENDENT-POST-COMMIT-REVIEW-AND-CLOSURE.md`
- `RSM-3-I3-PRE1-ALIGN1-CURRENT-STATE-AND-I3-RESUME-ACTIVATION-PROMPT.md`
- `RSM-3-I3-PRE1-ALIGN1-AUTHORITY-DELTA-LOCK.tsv`
- `RSM-3-I3-PRE1-ALIGN1-I3-RESUME-ACTIVATION-REPORT.md`

If a required non-zero artifact is physically missing:

STOP:

`BLOCKED — RSM-3-I3-RESUME1 LINEAGE EVIDENCE INCOMPLETE`

Do not reconstruct or synthesize it.

A valid zero-byte failed-attempt patch must be retained as zero bytes if physically present.

---

# 29. RESUME1 Prompt Retention

Copy this exact prompt byte-identically into:

`docs/evidence/rsm-3/rsm-3-i3/RSM-3-I3-RESUME1-CI-SECURITY-SBOM-NOTICES-IMPLEMENTATION-PROMPT.md`

Classification:

`EXECUTION_PROMPT / HISTORICAL AFTER EXECUTION`

Do not treat it as standing authority after completion.

---

# 30. Full Local Validation

After implementation run at minimum:

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

```text
mandatory command failures = 0
critical vulnerabilities = 0
high vulnerabilities = 0
unapproved manual licenses = 0
prohibited licenses = 0
unknown/no-license = 0
architecture violations = 0
Knip findings = 0
lockfile drift = 0
direct dependency mismatch count = 0
product implementation count = 0
```

The low advisory may remain non-zero but must be visible and non-blocking only under the current policy.

---

# 31. Repository Mutation Classification

Before staging, classify every repository delta relative to:

`5c7ff6322ba2583176065a919db385d51b650fba`

Allowed classifications:

```text
LIVE_SOURCE_SYNC
I3_LINEAGE_EVIDENCE_SYNC
I3_RESUME_EXECUTION_PROMPT
I3_GITHUB_WORKFLOW
I3_ROOT_SCRIPT_UPDATE
I3_COMPLIANCE_TOOLING
I3_COMPLIANCE_TEST
I3_SBOM
I3_DEPENDENCY_INVENTORY
I3_LICENSE_REVIEW
I3_THIRD_PARTY_NOTICES
I3_NATIVE_BINARY_INVENTORY
I3_WASM_INVENTORY
I3_SECURITY_FINDINGS
I3_COMPLIANCE_DOCUMENTATION
```

No unclassified tracked mutation.

`pnpm-lock.yaml` must not appear as a mutation.

---

# 32. Bootstrap Mutation Guard

Before I3-RESUME1 writes:

hash every pre-existing file under:

`C:\RetroStage\bootstrap\RSM-3-A`

No pre-existing bootstrap file may change.

Only the exact six RESUME1 evidence outputs in Section 36 may be created.

Required:

```text
UNAUTHORIZED_PRE_EXISTING_BOOTSTRAP_MUTATION_COUNT = 0
EXPECTED_NEW_RESUME1_OUTPUT_COUNT = 6
UNEXPECTED_NEW_BOOTSTRAP_FILE_COUNT = 0
```

---

# 33. Staging

Only after all validation passes:

stage the complete exact I3-RESUME1 candidate.

Do not commit.

Do not push.

Capture:

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

```text
HEAD = 5c7ff6322ba2583176065a919db385d51b650fba
commit count = 3
unstaged tracked changes = 0
unexpected untracked non-ignored files = 0
git diff --cached --check = PASS
remote refs = 0
push performed = FALSE
```

---

# 34. Exact Full Staged Patch

Generate against:

`5c7ff6322ba2583176065a919db385d51b650fba`

using:

```text
git diff --cached --no-ext-diff --full-index --binary
```

Do not truncate.

Do not filter.

Do not summarize.

Recompute independently and require byte identity:

`FINAL_I3_RESUME1_STAGED_PATCH_IDENTITY_STABLE = TRUE`

This exact patch is mandatory for ChatGPT independent staged-content review.

---

# 35. Forbidden Actions

Do NOT:

- commit;
- push;
- create upstream tracking;
- change remote;
- change repository visibility;
- enable paid GitHub security capability;
- change any direct dependency version;
- add/remove a direct dependency;
- modify lockfile;
- auto-fix audit findings;
- remediate the low ESLint advisory;
- create product code;
- create source 07;
- start I4;
- claim GitHub-hosted workflow execution.

---

# 36. Required Bootstrap Outputs

Create exactly SIX new outputs under:

`C:\RetroStage\bootstrap\RSM-3-A\Outputs\`

## Output 1

`RSM-3-I3-RESUME1-ACTION-PIN-PLATFORM-AND-NODE-IDENTITY-EVIDENCE.tsv`

Columns at minimum:

```text
identity_type
name
reviewed_version_or_tag
resolved_identity
official_source
license_or_checksum
used
platform_state
result
notes
```

Must include:

- actions/checkout;
- pnpm/action-setup;
- dependency-review-action eligibility;
- Node 24.19.0 Linux x64 official archive/checksum;
- pnpm 11.17.0.

---

## Output 2

`RSM-3-I3-RESUME1-COMPLIANCE-SECURITY-AND-LICENSE-REPORT.md`

Record:

- exact installed external package/version count;
- direct/transitive count;
- SBOM spec version;
- SBOM component count;
- SBOM SHA-256;
- dependency inventory SHA-256;
- license classification counts;
- exact owner-exception application;
- third-party notice entry count;
- notices SHA-256;
- native binary count;
- WASM count;
- security finding counts by severity;
- GHSA-xffm-g5w8-qvg7 carry-forward state;
- deterministic regeneration result;
- blocker counts.

---

## Output 3

`RSM-3-I3-RESUME1-CI-AND-LOCAL-GATE-VALIDATION.md`

Record:

- exact CI workflow path;
- immutable action SHAs;
- Node download URL identity and SHA;
- pnpm exact version;
- workflow permission result;
- mutable action ref count;
- local workflow validation;
- local CI-equivalent command results;
- audit result;
- Dependency Review platform state;
- GitHub-hosted execution:
  `NOT EXECUTED / DEFERRED TO I4`.

---

## Output 4

`RSM-3-I3-RESUME1-REPOSITORY-MUTATION-MANIFEST.tsv`

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

Every tracked repository delta exactly once.

---

## Output 5

`RSM-3-I3-RESUME1-STAGED-CANDIDATE-REPORT.md`

Must state:

- starting/ending HEAD;
- commit count;
- HEAD tree baseline;
- exact staged path count;
- new/modified/deleted counts;
- unstaged/untracked counts;
- diff-check result;
- bootstrap unauthorized mutation count;
- lockfile changed = FALSE;
- direct dependency count = 7;
- direct dependency mismatch count;
- source 02/08 sync result;
- lineage evidence sync result;
- CI workflow count;
- mutable action ref count;
- Node identity result;
- Dependency Review platform state;
- SBOM state;
- notices state;
- vulnerability blocker count;
- license blocker count;
- low advisory carry-forward state;
- deterministic compliance result;
- product implementation count;
- commit performed;
- push performed;
- I4 authorization state.

---

## Output 6

`RSM-3-I3-RESUME1-EXACT-STAGED-PATCH.diff`

Exact complete unfiltered staged patch.

---

# 37. Final Decision

The staged-candidate report must end with exactly one:

`READY FOR CHATGPT INDEPENDENT RSM-3-I3-RESUME1 STAGED-CONTENT REVIEW`

or

`BLOCKED — RSM-3-I3-RESUME1 MATERIAL FAILURE`

Do NOT declare I3 closed.

Do NOT authorize I4.

Do NOT commit.

Do NOT push.

Do NOT create a follow-up FIX prompt.

---

# 38. Success Condition

RSM-3-I3-RESUME1 succeeds only when:

1. new PRE1 security HEAD remains unchanged;
2. current live source 02/08 are synchronized into the repository;
3. full I3/PRE1 lineage is retained;
4. CI workflow exists with immutable reviewed action pins;
5. CI provisions exact official Node 24.19.0 with verified checksum;
6. CI installs exact pnpm 11.17.0;
7. Dependency Review platform state is represented truthfully;
8. local high/critical vulnerability gate passes;
9. low advisory remains visible if present;
10. native pnpm CycloneDX SBOM is generated;
11. dependency/license/notices/native/WASM/security artifacts are generated deterministically;
12. exact owner license exceptions are narrowly applied;
13. no new license blocker remains;
14. all toolchain and I3 validation passes;
15. lockfile and seven direct dependency versions do not change;
16. no product dependency/code enters;
17. exact full staged patch is captured;
18. no commit/push occurs;
19. six exact RESUME1 evidence outputs exist.

The next authority after success is ChatGPT independent review of the actual I3-RESUME1 staged patch.
