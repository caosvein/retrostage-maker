# Compliance baseline

This directory is the deterministic RSM-5-I1 secure Electron shell compliance baseline.

- Distribution scope: `RSM-5-I1 DEVELOPMENT / SECURE ELECTRON SHELL CANDIDATE / NOT FINAL RELEASE`.
- The SBOM is native pnpm CycloneDX 1.7 with only volatile serial/timestamp fields removed.
- The accepted physical baseline host is `win32/x64`; only platform-neutral artifacts are byte-compared on other hosts.
- License policy applies only exact package/version/license owner dispositions recorded in `license-review.json`; broad family approval is forbidden.
- The owner-exception policy is limited to the exact 14 Human Project Owner-approved current Windows/x64 identities; non-current-platform Lightning CSS identities are not pre-approved.
- Notice fallbacks require an approved safe source link; native/WASM records carry explicit provenance, runtime, packaged-role, and removal contracts.
- MPL-covered Lightning CSS is physically verified as build-only and absent from the current Forge unpackaged application; license review and notices retain the exact absence/source-availability evidence and require a future artifact-specific recheck.
- Candidate readiness requires the complete current audit to remain zero at every severity; the parent-scoped plugin-kit remediation stays visible in `security-findings.json`.
- Electron acquisition remains explicit while lifecycle scripts stay disabled. The sole lock-pinned exotic source is `@electron/node-gyp` commit `06b29aafb7708acef8b3669835c8a7857ebc92d2`, and `tar@7.5.22` remains exact.
- Electron and Chromium bundled license files are physically verified in the acquired distribution and Forge unpackaged application.
- Dependency Review Action is deferred because the current private user-owned repository is not platform-eligible.
- These artifacts are not final product-release notice completeness or legal approval.

Regenerate with `pnpm run compliance:generate` and verify with `pnpm run compliance:check`.
