# RSM-3-D-TERM1 Owner Source-Governance Exception and Decision Lock

## 1. Task identity

- Task: `RSM-3-D-TERM1 — Owner Source-Governance Resolution / Authority Cutoff / I1 Entry Candidate`.
- Parent: `RSM-3 — Repository / Remote Backup / Reproducible Bootstrap`.
- Phase: `RSM-3-D — Detailed Bootstrap Readiness`.
- Task type: `OWNER-AUTHORIZED GOVERNANCE RESOLUTION / TERMINAL READINESS LOCK`.
- Primary executor: `Codex`.
- This is not a FIX, recovery generation, implementation task, repository creation, source reconstruction, or dependency installation.
- This lock prepares an independent terminal D review. It does not close RSM-3-D and does not authorize or start RSM-3-I1.

## 2. Owner authorization

The owner explicitly pre-authorized OD-01 through OD-04 in the TERM1 execution instruction. Codex records those decisions without reopening, selecting, narrowing, or expanding them.

## 3. OD-01 — Historical byte loss

Exact decision:

`APPROVED GOVERNED EXCEPTION — EXACT PRE-LOSS BYTES UNAVAILABLE`

The following nine indexed pre-loss identities are accepted as physically unavailable in the current reboot environment:

| Historical identity | Recorded historical SHA-256 | Terminal loss status |
|---|---|---|
| `00_RSM_PROJECT_CHARTER.md` | `E40B6A9385CD1E533FD04E4451E817A6B12B190EF8B2E51C5AE712179ADC0954` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `01_RSM_CANONICAL_ROADMAP_RSM-0-RSM-120.md` | `7ABA956B611BC00D060DA9AD94FBE98D8CA3950E184D5F22D86F9B34944BD5B0` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `02_RSM_CURRENT_PROJECT_STATE.md` | `E7C8F3F6A7F9472FF8175A08E07D28B01A80FB215C7B0ADDF32BA030465F641D` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `03_RSM_ARCHITECTURE_AND_PACKAGE_MAP.md` | `3F98F27E42809ACC1A93FEB764C9122BFAF1E44989E75D2A6D4036C12064FCB4` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `04_RSM_ENGINEERING_AND_REVIEW_WORKFLOW.md` | `D5B951342B71C7F117D8B4F2DF2A7743CF329ADBAA9E6DE215E5EBC1D907024A` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `05_RSM_PRODUCT_DECISIONS_AND_DEFERRED_SCOPE.md` | `2477A5D7638B8F21D7392E7B1455600AE3D15D084265416721D36E9AB5D5DA14` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `06_RSM_CURRENT_MILESTONE_RSM-25.md` | `4C636805DFB9DF4585905770888FEF1E93DA6CB277D9EF99E50CDF7855443F21` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `07_RSM_REPOSITORY_COMMANDS_AND_VALIDATION.md` | `E456BEB77431F8A01547359BC242766AF1BD048E2236723CCBCD9BAB42182A19` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |
| `README_POST_I5_ALIGNMENT_REFRESH.md` | `4E0576E1EBC1DCBBC62BDE5200C20DF695CC796C19377F32FBF5FB8FB8A9945C` | `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE` |

The recorded hashes are provenance values, not current physical hashes. No row is `MATCH`, `RESTORED`, `RECONSTRUCTED`, or `PRESENT`.

For RSM-3 and later reboot work, the former requirement to physically import these exact nine byte streams is superseded by this governed exception. The reboot must instead preserve:

1. recorded filename and identity;
2. recorded SHA-256 provenance value;
3. historical classification and role;
4. allowed historical uses and prohibited proof boundaries;
5. historical-to-reboot supersession mapping;
6. explicit physical-loss status;
7. the rule that historical information is not live implementation evidence.

## 4. Reconstruction prohibition and later recovery rule

The project must not recreate any missing historical file from summaries, hashes, reboot counterparts, filenames, indexes, reports, memory, conversation, or synthetic content. It must not claim that the original bytes are retained.

If a genuine original copy is recovered later, admission is allowed only through the historical-source change-control procedure. The recovered bytes must match the recorded identity or be explicitly reconciled through that procedure. Later recovery does not silently convert historical material into live authority or implementation truth.

## 5. OD-02 — Frozen source-import map external identity lock

The physical SHA-256 of `Outputs\RSM-3-B-SOURCE-IMPORT-MAP.tsv` was independently recomputed during TERM1:

`41A01A9D4336F6B7E373100FE9E080E827CF7E7C700BE9A145912D29BDA7F676`

Result: `MATCH` against the owner-approved value.

This document records that physical identity once as the non-self-referential external lock. The frozen map remains unchanged and is not asked to hash itself.

## 6. OD-03 — Current authority cutoff

The owner approves:

- exactly 53 physically `PRESENT` frozen-map authority rows;
- exactly twelve accepted post-map A/B/C authority artifacts identified and hash-verified by RECOVERY1;
- a combined `65-FILE PRESENT CURRENT AUTHORITY BASELINE`.

TERM1 independently verified:

- frozen-map total rows: 62;
- frozen-map present rows: 53;
- historical-missing rows: 9;
- current non-self rows physically missing: 0;
- current non-self physical hash mismatches: 0;
- post-map candidates physically missing: 0;
- post-map candidate hash mismatches: 0;
- overlap between the two groups: 0;
- present authority identities: 65 unique files.

No Original/FIX1–FIX15 RSM-3-D artifact is promoted by this decision.

## 7. OD-04 — RSM-3-D correction history

Exact decision:

`carry_to_i1=NO`

This applies to all 127 rows of `Outputs\RSM-3-D-RECOVERY1-D-EVIDENCE-CARRY-FORWARD.tsv`.

Therefore:

- Original/FIX1–FIX15 correction packages do not become I1 authority;
- failed and superseded packages remain evidence history only;
- reproducible supporting evidence is not automatically authority;
- higher FIX number does not mean higher authority;
- correction debris is not imported merely because it physically exists;
- no existing D-lineage file is deleted, moved, renamed, rewritten, or repaired.

## 8. RECOVERY1 terminal review inputs

The four RECOVERY1 outputs retain their original non-recursive cutoff. TERM1 independently computed their current physical identities and admits them only as `RSM-3-D TERMINAL REVIEW INPUTS`:

| RECOVERY1 terminal review input | Physical SHA-256 |
|---|---|
| `Outputs\RSM-3-D-RECOVERY1-PHYSICAL-SOURCE-INVENTORY.tsv` | `4C8A8906813924C43CEFE3C77FAF3EE9955A0CD3EC73AE10E8D0E66EB73BBF03` |
| `Outputs\RSM-3-D-RECOVERY1-AUTHORITY-AND-GAP-REPORT.md` | `4354C7FCC83B9E079ACCF52A13F1D22F81A64B7AAB43A83991D39092BBA0E619` |
| `Outputs\RSM-3-D-RECOVERY1-D-EVIDENCE-CARRY-FORWARD.tsv` | `51A3D5A60DD9FAAF9F1DFC7DB85A2454568843DF4DA56EAC92847273A608E3D1` |
| `Outputs\RSM-3-D-RECOVERY1-READINESS-REPORT.md` | `C7F8DBBF31748274F8EAC1E307E18242DF96A8457AD36B3CBCA74BE4AA86B3B3` |

They do not retroactively change their own inventory or carry-forward cutoff.

## 9. Source-07 identity separation

- Historical `07_RSM_REPOSITORY_COMMANDS_AND_VALIDATION.md` is one of the nine identities with status `HISTORICAL_IDENTITY_PRESERVED_BYTES_UNAVAILABLE`.
- Reboot `07_RSM_REBOOT_REPOSITORY_COMMANDS_AND_VALIDATION.md` remains `INTENTIONALLY_DEFERRED_REBOOT_SOURCE`.

The two identities must never be merged. TERM1 does not create reboot source 07.

## 10. RSM-2 post-closure validation absence

`RSM-2-CLOSE1-POST-CLOSURE-VALIDATION.md` remains physically absent and non-material because the accepted RSM-2-V1 and RSM-2-CLOSE1 authorities are physically present. It is not reconstructed and is not an I1 prerequisite.

## 11. Source alignment deferral

`Sources\02_RSM_REBOOT_CURRENT_PROJECT_STATE.md` and `Sources\08_RSM_REBOOT_CURRENT_MILESTONE.md` remain operationally stale and physically unchanged.

Required state:

`SOURCE_ALIGNMENT_REQUIRED_IMMEDIATELY_AFTER_TERMINAL_D_ACCEPTANCE`

Only after independent terminal D acceptance may a separate narrow alignment task update 02/08 and activate I1.

## 12. Non-implementation and review boundary

- Repository creation: not performed.
- Source import: not performed.
- Dependency installation: not performed.
- Reboot source 07 creation: not performed.
- Commit or push: not performed.
- RSM-3-I1 start or authorization: not performed.
- RSM-3-D closure: not self-declared.

This owner lock is a terminal authority identity only after its physical hash is recorded in the non-self-referential TERM1 cutoff and the entire TERM1 package is independently reviewed.
