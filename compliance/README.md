# Compliance baseline

This directory is the deterministic RSM-3-I3 bootstrap/tooling compliance baseline.

- Distribution scope: `DEVELOPMENT / BOOTSTRAP TOOLING ONLY`.
- The SBOM is native pnpm CycloneDX 1.7 with only volatile serial/timestamp fields removed.
- The accepted physical baseline host is `win32/x64`; only platform-neutral artifacts are byte-compared on other hosts.
- License policy applies only the two exact owner exceptions recorded in `license-review.json`.
- Notice fallbacks require an approved safe source link; native/WASM records carry explicit provenance, runtime, packaged-role, and removal contracts.
- Low and moderate security findings remain visible; high and critical findings block validation.
- Dependency Review Action is deferred because the current private user-owned repository is not platform-eligible.
- These artifacts are not final product-release or legal approval.

Regenerate with `pnpm run compliance:generate` and verify with `pnpm run compliance:check`.
