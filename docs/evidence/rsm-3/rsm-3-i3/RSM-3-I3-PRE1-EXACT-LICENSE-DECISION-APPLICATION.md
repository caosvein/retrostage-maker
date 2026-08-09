# RetroStage Maker — RSM-3-I3-PRE1 Exact License Decision Application

**Task:** `RSM-3-I3-PRE1 — Security and Exact-License Baseline Remediation`  
**Result:** `PASS / NO UNAPPROVED LICENSE BLOCKER`

## Exact owner decision-lock identity

```text
path = Outputs/RSM-3-I3-PRE1-OWNER-SECURITY-AND-LICENSE-DECISION-LOCK.md
SHA-256 = 2E61177732B16285414C9829EF4E0241CC1BA2B21646B3BC7399532C317CFA02
bytes = 6329
authorized security change = vitest@3.0.7 -> vitest@3.2.6
approved exact license identity 1 = argparse@2.0.1 / Python-2.0
approved exact license identity 2 = minimatch@10.2.6 / BlueOak-1.0.0
approval scope = TRANSITIVE DEVELOPMENT / BOOTSTRAP TOOLING ONLY
broad license-family approval = FALSE
dependency-review state = DEFERRED_PLATFORM_CAPABILITY
```

## Active physical graph re-scan

The scan used the current reachable install graph reported by `pnpm.cmd list --recursive --depth Infinity --json`, then read each physically present package root and deduplicated by exact package/version. Stale virtual-store cache directories were not classified as active dependencies.

```text
lock graph listed identities = 304
nonphysical platform-optional identities = 93
active physical unique external package/version identities = 211
automatic-admission identities = 209
owner-approved exact identities = 2
```

Exact active license-expression counts:

| License | Count | Classification |
|---|---:|---|
| `MIT` | 170 | Automatically admissible |
| `Apache-2.0` | 15 | Automatically admissible |
| `ISC` | 14 | Automatically admissible |
| `BSD-2-Clause` | 6 | Automatically admissible |
| `BSD-3-Clause` | 4 | Automatically admissible |
| `Python-2.0` | 1 | Owner-approved exact identity |
| `BlueOak-1.0.0` | 1 | Owner-approved exact identity |

## Exact approved identity: argparse@2.0.1

```text
package = argparse
version = 2.0.1
declared license = Python-2.0
presence after remediation = PRESENT / ACTIVE TRANSITIVE GRAPH
classification = OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE
package path = node_modules/.pnpm/argparse@2.0.1/node_modules/argparse
license file = node_modules/.pnpm/argparse@2.0.1/node_modules/argparse/LICENSE
license file SHA-256 = DE4D1F2D2AD5AD0CFD1657A106476B31CB5DB5EF9D1FF842B237C0C81F0C8A23
license file bytes = 12775
separate notice/copyright file = NOT PRESENT
scope = DEVELOPMENT / BOOTSTRAP TOOLING ONLY
```

Notice obligation summary: retain the applicable Python/PSF, BeOpen, CNRI, and CWI license and copyright text. If a covered derivative is distributed, include the license/copyright notices and the applicable brief summary of changes. This PRE1 report does not broaden the owner approval or create final notices.

## Exact approved identity: minimatch@10.2.6

```text
package = minimatch
version = 10.2.6
declared license = BlueOak-1.0.0
presence after remediation = PRESENT / ACTIVE TRANSITIVE GRAPH
classification = OWNER_APPROVED_EXACT_TRANSITIVE_DEV_TOOL_LICENSE
package path = node_modules/.pnpm/minimatch@10.2.6/node_modules/minimatch
license file = node_modules/.pnpm/minimatch@10.2.6/node_modules/minimatch/LICENSE.md
license file SHA-256 = 2C7C5D22ED5A8EE968C64757710979AFCD77438C48B4A265B94E615BABD8A901
license file bytes = 1550
separate notice/copyright file = NOT PRESENT
scope = DEVELOPMENT / BOOTSTRAP TOOLING ONLY
```

Notice obligation summary: every recipient of any copied portion must also receive the Blue Oak Model License 1.0.0 text or the permitted canonical license link. This exact approval does not transfer to another package or version.

## Final classification result

```text
prohibited = 0
unknown/no-license = 0
unapproved manual-review = 0
new manual-review license = 0
license blocker count = 0
owner-approved identities present = 2
approved identity absent after remediation = 0
```

PRE1 did not create final third-party notices, an SBOM, or a general license-family admission.
