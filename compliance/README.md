# Compliance baseline

This directory is the deterministic RSM-5-I1 secure Electron shell compliance baseline.

- Distribution scope: `RSM-5-I1 DEVELOPMENT / SECURE ELECTRON SHELL CANDIDATE / NOT FINAL RELEASE`.
- The SBOM is native pnpm CycloneDX 1.7 with only volatile serial/timestamp fields removed.
- The accepted physical baseline host is `win32/x64`; only platform-neutral artifacts are byte-compared on other hosts.
- License policy applies only exact package/version/license owner dispositions recorded in `license-review.json`; broad family approval is forbidden.
- The owner-exception policy contains exactly 15 Human Project Owner-approved package/version/license identities; broad family or platform-prefix approval is forbidden.
- The current win32/x64 installed graph applies 14 exact owner exceptions: argparse@2.0.1, caniuse-lite@1.0.30001809, chownr@3.0.0, lightningcss-win32-x64-msvc@1.33.0, lightningcss@1.33.0, minimatch@10.2.6, minipass-flush@1.0.7, minipass@7.1.3, spdx-exceptions@2.5.0, spdx-license-ids@3.0.23, tar@7.5.22, type-fest@0.13.1, type-fest@1.4.0, yallist@5.0.0.
- Approved-but-dormant identities absent from this host graph: lightningcss-linux-x64-gnu@1.33.0.
- Notice fallbacks require an approved safe source link; native/WASM records carry explicit provenance, runtime, packaged-role, and removal contracts.
- MPL-covered Lightning CSS is physically verified as build-only and absent from the current Forge unpackaged application; license review and notices retain the exact absence/source-availability evidence and require a future artifact-specific recheck.
- Candidate readiness requires the complete current audit to remain zero at every severity; the parent-scoped plugin-kit remediation stays visible in `security-findings.json`.
- Electron acquisition remains explicit while lifecycle scripts stay disabled. The sole lock-pinned exotic source is `@electron/node-gyp` commit `06b29aafb7708acef8b3669835c8a7857ebc92d2`, and `tar@7.5.22` remains exact.
- Electron and Chromium bundled license files are physically verified in the acquired distribution and Forge unpackaged application.
- Dependency Review Action is deferred because the current private user-owned repository is not platform-eligible.
- These artifacts are not final product-release notice completeness or legal approval.

Regenerate with `pnpm run compliance:generate` and verify with `pnpm run compliance:check`.
