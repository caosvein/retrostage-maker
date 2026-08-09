# RetroStage Maker — RSM-3-I3 PRE1 Owner Security and License Decision Lock

**Document ID:** `RSM-3-I3-PRE1-OWNER-SECURITY-AND-LICENSE-DECISION-LOCK`  
**Project:** RetroStage Maker  
**Milestone:** `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`  
**Phase:** `RSM-3-I3 — CI / Dependency Review / SBOM / Notices Baseline`  
**Decision type:** `OWNER-AUTHORIZED NARROW SECURITY REMEDIATION / EXACT LICENSE EXCEPTIONS`  
**Date:** 2026-08-09  
**Timezone:** Europe/Istanbul

---

## 1. Decision Context

The first RSM-3-I3 fail-closed pre-mutation review found:

1. direct `vitest@3.0.7` affected by critical advisory `GHSA-5xrq-8626-4rwp`;
2. transitive `argparse@2.0.1` with declared license `Python-2.0`;
3. transitive `minimatch@10.2.6` with declared license `BlueOak-1.0.0`;
4. GitHub Dependency Review Action unavailable for the current private user-owned repository and therefore deferred as a platform capability.

No repository mutation occurred during the blocked I3 attempt.

---

## 2. OD-I3-PRE1-01 — Vitest Security Remediation

The owner authorizes one exact direct dependency change:

```text
FROM: vitest@3.0.7
TO:   vitest@3.2.6
```

Reason:

`vitest@3.0.7` is within the affected range for critical advisory:

`GHSA-5xrq-8626-4rwp`

and `3.2.6` is the minimal patched 3.x boundary.

This is a security remediation, not a general toolchain refresh.

The following direct dependency identities remain frozen and must not change:

```text
dependency-cruiser@16.10.0
eslint@9.21.0
knip@6.32.0
prettier@3.5.2
typescript@6.0.3
typescript-eslint@8.66.0
```

No other direct dependency may be added, removed, upgraded, or downgraded.

---

## 3. OD-I3-PRE1-02 — Exact Python-2.0 Transitive License Approval

The owner approves exactly:

```text
package = argparse
version = 2.0.1
declared license = Python-2.0
scope = TRANSITIVE DEVELOPMENT / BOOTSTRAP TOOLING ONLY
```

This approval is based on the permissive use/distribution grant and required preservation of applicable license/copyright notices.

Required compliance handling:

- retain the applicable license text;
- retain required copyright/license notices;
- include the package in the dependency inventory;
- include it in license review;
- include applicable license/notice content in third-party notices;
- classify distribution scope truthfully as development/bootstrap tooling unless later product packaging physically changes that fact.

This is NOT:

- blanket approval for every `Python-2.0` package/version;
- automatic addition of `Python-2.0` to the global auto-admission list;
- approval for runtime/product distribution without later evidence.

If the exact package/version disappears after dependency resolution, this decision becomes historical and does not authorize another identity.

---

## 4. OD-I3-PRE1-03 — Exact BlueOak-1.0.0 Transitive License Approval

The owner approves exactly:

```text
package = minimatch
version = 10.2.6
declared license = BlueOak-1.0.0
scope = TRANSITIVE DEVELOPMENT / BOOTSTRAP TOOLING ONLY
```

Required compliance handling:

- preserve the Blue Oak license text or permitted license link as required;
- include the package in dependency inventory;
- include it in license review;
- include applicable notice/license information in third-party notices;
- preserve development/bootstrap-tooling distribution classification unless later physical evidence changes it.

This is NOT:

- blanket approval for every `BlueOak-1.0.0` package/version;
- automatic addition of the license family to the global auto-admission list;
- approval of an unrelated package carrying the same license.

If the exact package/version changes or disappears after dependency resolution, this approval does not automatically transfer.

---

## 5. OD-I3-PRE1-04 — Other License Findings

All other license-policy rules remain unchanged.

After the security remediation:

- any new manual-review license identity not exactly covered by this lock is blocking;
- any prohibited license is blocking;
- any unknown/no-license state is blocking;
- any custom or ambiguous license requires owner review.

Do not infer approval by similarity.

---

## 6. OD-I3-PRE1-05 — Vulnerability Policy

After the authorized Vitest update:

```text
pnpm audit --audit-level high
```

must have:

```text
high findings = 0
critical findings = 0
blocking high/critical findings = 0
```

No vulnerability waiver is granted for `GHSA-5xrq-8626-4rwp`.

The project must use the patched dependency rather than accepting the vulnerable direct version.

Low/moderate findings remain governed by the existing I3 policy and must still be recorded.

---

## 7. OD-I3-PRE1-06 — Dependency Review Platform State

The current result:

`GITHUB_DEPENDENCY_REVIEW_ACTION = DEFERRED_PLATFORM_CAPABILITY`

is accepted as non-blocking for the current private user-owned repository.

Do not:

- change repository visibility;
- purchase or enable a paid GitHub security product;
- move the repository;
- create a known-nonfunctional dependency-review workflow.

The local vulnerability/license/compliance gate remains mandatory.

---

## 8. Scope Boundary

This decision authorizes only:

- exact Vitest security remediation to `3.2.6`;
- resulting lockfile reconciliation;
- exact license acceptance of the two identities above;
- validation and evidence necessary to establish a clean I3 entry baseline.

It does NOT authorize:

- CI implementation;
- SBOM generation as part of PRE1;
- notices generation as part of PRE1;
- source 02/08 synchronization;
- I2 evidence synchronization;
- product implementation;
- commit;
- push;
- I4 activation.

---

## 9. Success Condition

This decision is successfully consumed when a controlled PRE1 task proves:

1. `vitest@3.2.6` is the exact direct version;
2. the critical advisory no longer blocks the installed graph;
3. all six other direct dependencies remain exact and unchanged;
4. the lockfile is reconciled deterministically;
5. full existing I2 validation remains green;
6. `argparse@2.0.1 / Python-2.0` and `minimatch@10.2.6 / BlueOak-1.0.0` are either still present and explicitly accepted under this lock, or absent and not replaced by unreviewed manual-license identities;
7. no new license blocker remains;
8. the remediation is staged for independent review without commit or push.
