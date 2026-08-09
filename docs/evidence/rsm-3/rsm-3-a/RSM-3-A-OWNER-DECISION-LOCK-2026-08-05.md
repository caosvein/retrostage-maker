# RSM-3-A — Owner Decision Lock

**Project:** RetroStage Maker  
**Milestone:** RSM-3-A — Environment / Repository / Remote / Toolchain Audit  
**Decision date:** 2026-08-05  
**Status:** OWNER DECISIONS PARTIALLY LOCKED — TOOL REMEDIATION NEXT  
**Authority:** Project owner

---

## 1. Canonical Repository

| Decision | Locked value |
|---|---|
| Local repository path | `C:\RetroStage\retrostage-maker` |
| Repository name | `retrostage-maker` |
| Primary branch | `main` |
| Visibility | `Private` |
| Repository state | GitHub repository created by owner; local repository not yet created |

---

## 2. GitHub Identity and Remote

| Decision | Locked value |
|---|---|
| GitHub account | `caosvein` |
| Git author name | `caosvein` |
| Git author email | `caosvein@gmail.com` |
| Web repository URL | `https://github.com/caosvein/retrostage-maker` |
| Canonical HTTPS remote URL | `https://github.com/caosvein/retrostage-maker.git` |
| Remote name | `origin` |
| Authentication route | `HTTPS + GitHub CLI`, pending authorized tool installation/authentication |

Git identity must be configured at repository scope after the local repository exists. Do not change global Git identity unless separately authorized.

The repository URL and creation state are owner-provided facts. External visibility/access was not independently proven by the audit package.

---

## 3. Storage Mapping

| Drive | Verified physical device |
|---|---|
| `C:` | Disk 2 — KIOXIA-EXCERIA PRO G2 SSD — NVMe |
| `D:` | Disk 0 — TOSHIBA THNSNJ256G8NU — SATA |
| `E:` | Disk 1 — WDC WD10EZRX-00D8PB0 — SATA |

`C:` and `D:` are verified distinct physical devices.

---

## 4. Clean-Clone Validation

| Decision | Locked value |
|---|---|
| Clean-clone candidate | `D:\RSM-Validation\clean-clone` |
| Purpose | Fresh-clone/reproducibility validation |
| Usage | Disposable validation target; recreate from the canonical remote when validation is required |
| Daily backup use | Forbidden — do not use this directory as the working backup mirror |

The clean-clone directory must remain separate from daily backup data. A clean clone proves that the repository can be reconstructed from the remote; it is not the workstation's daily backup copy.

---

## 5. Restore-Test Target

| Decision | Locked value |
|---|---|
| Restore-test candidate | `D:\RSM-Restore-Test` |
| Purpose | Recovery-procedure validation |
| Usage | Separate from both canonical repository and clean-clone target |

This path does not currently exist and must not be created before its authorized implementation slice.

---

## 6. Manual Local Backup Before Shutdown

| Decision | Locked value |
|---|---|
| Backup target | `D:\RSM-Backup\retrostage-maker` |
| Source | `C:\RetroStage\retrostage-maker` |
| Trigger | Manually run by the owner before shutting down the PC |
| AI/automation dependency | None |
| Intended coverage | Working files, including changes not yet pushed to GitHub |
| Implementation | A local one-click PowerShell backup script will be admitted after the repository exists and its exclusion/retention rules are reviewed |

This manual backup is intentionally separate from `D:\RSM-Validation\clean-clone`.

No ChatGPT/Antigravity/Codex run or scheduled AI task is required each time the backup is executed.

---

## 7. Off-Device Backup

| Decision | Locked value |
|---|---|
| Backup type | External physical disk |
| Storage location | Kept at a different physical location |
| Exact disk identity/path | Pending until the external disk is connected and identified |
| Relationship to GitHub | Additional protection; GitHub alone is not the full backup/restore plan |

The external disk is the selected secondary off-device backup class. Its volume identity, target path, copy format, retention policy, and verification procedure remain implementation details to be locked when the device is available.

---

## 8. Active and Historical Sources

| Decision | Locked value |
|---|---|
| Active reboot sources | `docs/sources/` |
| Historical archive | `docs/historical/2026-07-pre-loss/` |

These are future repository destinations and do not authorize repository creation or source import yet.

---

## 9. Workstation and Tool Decisions

| Decision | Locked value |
|---|---|
| Authoritative shell | Windows PowerShell 5.1 |
| Git installation | Authorized in the controlled remediation slice |
| Node.js 24 LTS installation | Authorized in the controlled remediation slice |
| pnpm | Required; exact activation method selected only after the exact Node distribution is installed and inspected |
| GitHub CLI | Authorized for the selected HTTPS authentication route |
| LongPathsEnabled | Authorized as a recommended environment change, but must be applied only through an explicit elevated step |
| Product dependencies | Not authorized during RSM-3-A remediation |

---

## 10. Current Gate State

```text
RSM-3: CURRENT
RSM-3-A AUDIT PACKAGE: REVIEW PASS
M-01: CLOSED
OWNER DECISIONS: PARTIALLY LOCKED
LOCAL REPOSITORY: NOT YET CREATED
TOOL REMEDIATION: NEXT
RSM-3-B: BLOCKED
```

Remaining implementation inputs:

1. Exact approved Git for Windows version.
2. Exact approved Node.js 24 LTS release.
3. Verified pnpm activation method and exact version.
4. GitHub authentication execution.
5. External backup disk identity/path and operational policy.
6. Post-remediation tool/version and readiness re-verification.

The next authorized activity is controlled tool remediation. It is not repository creation and not RSM-3-B.
