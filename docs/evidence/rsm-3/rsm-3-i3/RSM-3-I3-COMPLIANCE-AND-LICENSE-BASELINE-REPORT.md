# RetroStage Maker — RSM-3-I3 Compliance and License Baseline Report

**Task:** `RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline`  
**Execution mode:** `FAIL-CLOSED PRE-MUTATION REVIEW`  
**Result:** `BLOCKED / COMPLIANCE BASELINE NOT MATERIALIZED`

## Native pnpm SBOM capability

The physical CLI was inspected before any repository mutation:

```text
pnpm version = 11.17.0
help command = pnpm.cmd sbom --help
help exit code = 0
native CycloneDX command identity = pnpm.cmd sbom --sbom-format cyclonedx
supported CycloneDX versions = 1.5, 1.6, 1.7
default CycloneDX spec version = 1.7
native capability available = TRUE
external SBOM generator required = FALSE
```

Generation was not started because mandatory license and vulnerability gates failed first.

```text
SBOM spec version produced = NOT PRODUCED
SBOM SHA-256 = NOT PRODUCED
SBOM component count = NOT PRODUCED
notice-entry count = NOT PRODUCED
notices SHA-256 = NOT PRODUCED
native binary count = NOT SCANNED AFTER STOP
WASM count = NOT SCANNED AFTER STOP
deterministic regeneration result = NOT RUN / BLOCKED BEFORE GENERATION
```

## Installed external dependency pre-scan

The physical pnpm virtual store was read without modification and deduplicated by exact package name/version.

```text
external installed package/version count = 207
exact direct development dependencies = 7
transitive package/version count = 200
distribution scope = DEVELOPMENT / BOOTSTRAP TOOLING ONLY
```

Observed package-license expressions:

| License expression | Exact package/version count | Policy result |
|---|---:|---|
| `MIT` | 166 | Automatically admissible |
| `Apache-2.0` | 15 | Automatically admissible |
| `ISC` | 14 | Automatically admissible |
| `BSD-2-Clause` | 6 | Automatically admissible |
| `BSD-3-Clause` | 4 | Automatically admissible |
| `Python-2.0` | 1 | Manual owner/license review required; not in automatic-admission list |
| `BlueOak-1.0.0` | 1 | Manual owner/license review required; not in automatic-admission list |

```text
automatically admissible = 205
manual review required = 2
prohibited = 0
unknown/no-license = 0
license blocker count = 2
```

## Exact license blockers

### `argparse@2.0.1`

```text
declared license = Python-2.0
direct/transitive = TRANSITIVE
dependency path = eslint@9.21.0 -> @eslint/eslintrc@3.3.6 -> js-yaml@4.3.1 -> argparse@2.0.1
installed evidence = node_modules/.pnpm/argparse@2.0.1/node_modules/argparse/package.json
exact owner approval found = FALSE
policy result = MANUAL_REVIEW_REQUIRED
```

### `minimatch@10.2.6`

```text
declared license = BlueOak-1.0.0
direct/transitive = TRANSITIVE
dependency path = typescript-eslint@8.66.0 -> @typescript-eslint/typescript-estree@8.66.0 -> minimatch@10.2.6
installed evidence = node_modules/.pnpm/minimatch@10.2.6/node_modules/minimatch/package.json
upstream repository = https://github.com/isaacs/minimatch
exact owner approval found = FALSE
policy result = MANUAL_REVIEW_REQUIRED
```

The authoritative automatic-admission list does not include `Python-2.0` or `BlueOak-1.0.0`. No dependency was changed or substituted.

## Vulnerability gate

```text
command = pnpm.cmd audit --audit-level high
exit code = 1
total findings = 2
low findings = 1
high findings = 0
critical findings = 1
blocking high/critical finding count = 1
```

Blocking advisory:

```text
package = vitest
installed/direct version = 3.0.7
vulnerable versions = <3.2.6
patched versions = >=3.2.6
severity = critical
advisory = GHSA-5xrq-8626-4rwp
path = . > vitest
advisory URL = https://github.com/advisories/GHSA-5xrq-8626-4rwp
```

The prompt forbids automatic dependency updates. The admitted direct version therefore remained unchanged.

## Fail-closed decision

`BLOCKED — THIRD-PARTY LICENSE REVIEW REQUIRED`

`BLOCKED — HIGH/CRITICAL DEPENDENCY VULNERABILITY PRESENT`

No SBOM, dependency inventory artifact, license-review artifact, notice artifact, native inventory, WASM inventory, tooling, workflow, dependency change, or lockfile change was created in the repository.
