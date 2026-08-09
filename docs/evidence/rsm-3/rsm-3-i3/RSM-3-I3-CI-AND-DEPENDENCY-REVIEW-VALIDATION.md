# RetroStage Maker — RSM-3-I3 CI and Dependency Review Validation

**Task:** `RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline`  
**Result:** `BLOCKED BEFORE REPOSITORY MUTATION`

## Immutable action-pin verification

| Action | Reviewed tag | Official resolved commit | License |
|---|---|---|---|
| `actions/checkout` | `v7.0.1` | `3d3c42e5aac5ba805825da76410c181273ba90b1` | MIT |
| `pnpm/action-setup` | `v6.0.9` | `0ebf47130e4866e96fce0953f49152a61190b271` | MIT |
| `actions/dependency-review-action` | `v5.0.0` | `a1d282b36b6f3519aa1f3fc636f609c47dddb294` | MIT |

Each release identity was resolved from its official upstream repository with `git ls-remote`. The annotated `pnpm/action-setup` tag was dereferenced to its underlying commit. License identities were read from the official GitHub repository license endpoint at the resolved commits.

```text
full 40-hex pin resolution failure count = 0
mutable refs introduced = 0
workflow files created = 0
```

## Intended CI identity

```text
runner = ubuntu-24.04
Node archive = node-v24.19.0-linux-x64.tar.xz
Node archive SHA-256 = 14b342e71204f811bde6153be8e04b62aef63c236fef92b55f9c83154b409647
expected node --version = v24.19.0
expected npm --version = 11.17.0
expected pnpm version = 11.17.0
```

No CI workflow was created because mandatory pre-mutation dependency gates failed. Therefore no workflow permissions, secrets, command sequence, or local workflow static validation can be claimed as implemented.

## Dependency Review Action eligibility

GitHub API observations:

```text
owner login = caosvein
owner type = User
repository visibility = private
repository public = FALSE
security_and_analysis = null
GitHub Code Security / Advanced Security capability observed enabled = FALSE
Dependency Review Action usable for this repository = FALSE
GITHUB_DEPENDENCY_REVIEW_ACTION = DEFERRED_PLATFORM_CAPABILITY
```

Official GitHub capability documentation states that dependency review is available to public repositories and eligible organization-owned private repositories with GitHub Code Security or GitHub Advanced Security enabled. This private, user-owned repository does not meet that platform eligibility boundary. Visibility, account ownership, paid capability, and remote settings were not changed.

Official documentation reviewed:

`https://docs.github.com/en/enterprise-cloud@latest/code-security/concepts/supply-chain-security/dependency-review`

## Local vulnerability result

```text
command = pnpm.cmd audit --audit-level high
exit code = 1
blocking vulnerability count = 1
blocking severity = critical
package = vitest@3.0.7
advisory = GHSA-5xrq-8626-4rwp
patched version boundary = >=3.2.6
dependency auto-fix/update performed = FALSE
```

## Validation boundary

```text
CI workflow path = NOT CREATED
Dependency Review workflow path = DEFERRED / NOT CREATED
explicit workflow permissions = NOT APPLICABLE / NO WORKFLOW
local workflow static-validation result = NOT RUN / NO WORKFLOW
local CI-equivalent command chain = NOT RUN AFTER MATERIAL STOP
GitHub-hosted execution status = NOT EXECUTED / DEFERRED TO I4
commit performed = FALSE
push performed = FALSE
I4 authorized = FALSE
```
