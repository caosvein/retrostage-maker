# RSM-3-A — Repository / Remote / Backup Decision Record

**Task:** RSM-3-A — Environment / Repository / Remote / Toolchain Audit  
**Initial Audit Executor:** Antigravity IDE — Claude Opus 4.6 (Thinking) (Historical execution provenance)  
**Correction Executor:** Antigravity IDE  
**Correction Model:** Gemini 3.1 Pro (High)  
**M-01 Remediation Executor:** Antigravity IDE  
**M-01 Remediation Model:** Gemini 3.1 Pro (High)  
**Date:** 2026-08-05  
**Status:** `OWNER DECISIONS REQUIRED`

---

## 1. Repository Root

| Parameter | Proposed value | Status |
|---|---|---|
| Primary candidate | `C:\RetroStage\retrostage-maker` | `OWNER DECISION REQUIRED` |
| Alternative | `D:\RetroStage\retrostage-maker` | Viable alternative |

**Rationale for C: primary:**
- Same drive as current bootstrap workspace (`C:\RetroStage\bootstrap\RSM-3-A`)
- Confirmed NVMe drive (Owner-provided fact, verified via Get-Disk)
- 804.4 GB free space at the latest retained volume check — ample
- Path length 30 chars — safe
- Not under OneDrive — no sync conflicts
- No existing git repository at `C:\RetroStage`

**Rationale for D: alternative:**
- 179 GB free space — sufficient but less headroom
- Path length 30 chars — safe

> Status: `OWNER DECISION REQUIRED`

---

## 2. Remote Provider

| Parameter | Proposed value | Status |
|---|---|---|
| Provider | GitHub | `OWNER DECISION REQUIRED` |
| Account | Unknown — audit cannot verify | `OWNER DECISION REQUIRED` |

> Status: `OWNER DECISION REQUIRED`

---

## 3. Repository Name

| Parameter | Proposed value | Status |
|---|---|---|
| Repository name | `retrostage-maker` | `OWNER DECISION REQUIRED` |

Historical sources reference `C:\RetroStage\retrostage-maker` and a `retrostage-maker` repository. The reboot should use a consistent name unless the owner decides otherwise.

> Status: `OWNER DECISION REQUIRED`

---

## 4. Visibility

| Parameter | Proposed value | Status |
|---|---|---|
| Visibility | Private | `OWNER DECISION REQUIRED` |

A commercial proprietary product's source repository should be private.

> Status: `OWNER DECISION REQUIRED`

---

## 5. Primary Branch

| Parameter | Proposed value | Status |
|---|---|---|
| Primary branch | `main` | `OWNER DECISION REQUIRED` |

Historical sources reference `main`. The reboot technology contract does not mandate a specific branch name.

> Status: `OWNER DECISION REQUIRED`

---

## 6. Authentication Method

| Parameter | Proposed value | Status |
|---|---|---|
| Authentication | HTTPS + GitHub CLI credential helper | `OWNER DECISION REQUIRED` |
| Alternative | SSH keys | Viable alternative |

**Current state:** Neither Git nor GitHub CLI are installed. No SSH keys exist. Authentication cannot be tested during this audit.

**Recommended path after Git + `gh` installation:**
1. `gh auth login` — browser-based OAuth
2. Automatically configures Git credential helper
3. No manual token management required

> Status: `OWNER DECISION REQUIRED`

---

## 7. Off-Device Backup

| Parameter | Proposed value | Status |
|---|---|---|
| Primary off-device | GitHub private remote | `OWNER DECISION REQUIRED` |
| Secondary backup | `OWNER DECISION REQUIRED` | Not yet determined |

> [!WARNING]
> The technology contract and closure mandate explicitly state: "A GitHub remote alone is not the complete backup/restore plan." The owner must determine whether an additional backup destination (e.g., external drive, cloud storage, separate Git remote) is required.
> GitHub private remote provides off-workstation source replication, but GitHub alone is not the whole backup/restore plan. A secondary off-device backup remains an owner decision. D: may be a verified separate local physical device from C:, but D: is still not off-device from the workstation.

> Status: `OWNER DECISION REQUIRED`

---

## 8. Clean-Clone Target

| Parameter | Proposed value | Status |
|---|---|---|
| Clean-clone path | On the drive NOT used for the primary repository | `OWNER DECISION REQUIRED` |

If repository is on C::
Clean clone: D:\RSM-Validation\clean-clone

If repository is on D::
Clean clone: C:\RSM-Validation\clean-clone

C: and D: are verified distinct physical disks.
The opposite-disk candidate provides separate-local-device isolation.
It does not provide off-device backup.

The clean clone proves reproducibility.

> Status: `OWNER DECISION REQUIRED`

---

## 9. Restore-Test Target

| Parameter | Proposed value | Status |
|---|---|---|
| Restore-test path | On the drive NOT used for the primary repository | `OWNER DECISION REQUIRED` |

If repository is on C::
Restore test: D:\RSM-Restore-Test

If repository is on D::
Restore test: C:\RSM-Restore-Test

C: and D: are verified distinct physical disks.
The opposite-disk candidate provides separate-local-device isolation.
It does not provide off-device backup.

The restore test proves recovery procedure.

> Status: `OWNER DECISION REQUIRED`

---

## 10. Historical Source Archive Location

| Parameter | Proposed value | Status |
|---|---|---|
| Archive directory inside repo | `docs/historical/2026-07-pre-loss/` | `OWNER DECISION REQUIRED` |

This follows the direction stated in `08_RSM_REBOOT_CURRENT_MILESTONE.md` Section 19. The exact path is finalized by RSM-3-B/D.

> Status: `OWNER DECISION REQUIRED`

---

## 11. Active Source Location Inside Future Repository

| Parameter | Proposed value | Status |
|---|---|---|
| Active reboot sources | `docs/sources/` or `docs/reboot/` | `OWNER DECISION REQUIRED` |

The exact path is finalized by RSM-3-B/D.

> Status: `OWNER DECISION REQUIRED`

---

## 12. Summary of Required Installations

Before RSM-3-B can proceed, the owner must authorize installation of:

Git and Node.js:
BLOCKING REQUIRED INSTALLATIONS

pnpm:
BLOCKING TOOLCHAIN REQUIREMENT — activation method unresolved

GitHub CLI:
CONDITIONAL ON OWNER AUTHENTICATION DECISION

LongPathsEnabled:
OWNER DECISION / RECOMMENDED ENVIRONMENT CHANGE

No product dependencies (Electron, Babylon, React, etc.) are authorized for installation.

---

## 13. Decision Status

```text
ALL DECISIONS: OWNER DECISION REQUIRED
NO DECISION HAS BEEN MADE BY THE EXECUTOR
NO PATH, REMOTE, BRANCH, OR TOOL HAS BEEN SELECTED AS FINAL
```
