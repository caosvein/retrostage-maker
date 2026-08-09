# RSM-3-A — Environment Inventory

**Task:** RSM-3-A — Environment / Repository / Remote / Toolchain Audit  
**Initial Audit Executor:** Antigravity IDE — Claude Opus 4.6 (Thinking) (Historical execution provenance)  
**Correction Executor:** Antigravity IDE  
**Correction Model:** Gemini 3.1 Pro (High)  
**M-01 Remediation Executor:** Antigravity IDE  
**M-01 Remediation Model:** Gemini 3.1 Pro (High)  
**Audit date:** 2026-08-05  
**Audit time:** 19:32–19:38 UTC+3 (Europe/Istanbul)  
**Audit type:** Non-destructive inspection with temporary audit-workspace writes; no persistent system, configuration, repository, authoritative-source, or product mutation

---

## A. Workstation Identity and Storage — Observed Facts

### A.1 Operating system

| Property | Value |
|---|---|
| Edition | Microsoft Windows 10 Pro |
| Version | 10.0.19045.0 |
| Architecture | 64-bit |
| Username | `caosv` |
| Timezone | Europe/Istanbul (UTC+3) |

### A.2 Local drives

| Drive | Filesystem | Total GB | Free GB | Hardware |
|---|---|---|---|---|
| C: | NTFS | 953.32 | 804.4 | Disk 2: KIOXIA-EXCERIA PRO G2 SSD (NVMe) |
| D: | NTFS | 237.75 | 179.22 | Disk 0: TOSHIBA THNSNJ256G8NU (SATA) |
| E: | NTFS | 931.51 | 46.29 | Disk 1: WDC WD10EZRX-00D8PB0 (SATA) |

> [!NOTE]
> **Owner-provided facts:**
> C: is the KIOXIA NVMe drive.
> D: is a physically different Toshiba drive.
>
> Owner-provided fact CONFIRMED:
> C: and D: are distinct physical disks.
> D: is a Toshiba physical disk.
> C:↔D: classification: SEPARATE PHYSICAL DEVICE — VERIFIED.

All drives are fixed internal disks. No removable media detected.

### A.3 Path length and character risks

| Candidate path | Length | Risk |
|---|---|---|
| `C:\RetroStage\retrostage-maker` | 30 chars | LOW — well within MAX_PATH |
| `D:\RetroStage\retrostage-maker` | 30 chars | LOW — well within MAX_PATH |
| `C:\RetroStage\bootstrap\RSM-3-A` | 31 chars | LOW — current workspace |

LongPathsEnabled registry value: **0 (DISABLED)**

> [!WARNING]
> Long paths are not enabled. Node.js `node_modules` nesting can exceed 260 characters.
> OWNER DECISION REQUIRED / RECOMMENDED ENVIRONMENT CHANGE

### A.4 OneDrive and sync risks

| Check | Result |
|---|---|
| OneDrive environment variable | `C:\Users\caosv\OneDrive` |
| OneDrive folder exists | Yes |
| `C:\RetroStage` under OneDrive | **No** — SAFE |

`C:\RetroStage` is NOT subject to OneDrive sync. No sync-conflict risk.

### A.5 Existing content at candidate roots

| Path | Status |
|---|---|
| `C:\RetroStage` | Exists, writable, contains only `bootstrap\` |
| `C:\RetroStage\.git` | Does NOT exist |
| `C:\RetroStage\bootstrap\.git` | Does NOT exist |
| `C:\RetroStage\bootstrap\RSM-3-A` | Current workspace (audit data) |
| No git repositories found in `C:\` root | SAFE |
| `D:\` | Writable |

### A.6 Proposed repository root candidates

| Candidate | Drive | Free space | Path length | Sync risk | Git repo conflict | Assessment |
|---|---|---|---|---|---|---|
| `C:\RetroStage\retrostage-maker` | C: (NVMe) | 804.4 GB | 30 chars | None | None | **PRIMARY CANDIDATE** |
| `D:\RetroStage\retrostage-maker` | D: | 179.22 GB | 30 chars | None | None | Viable alternative |

> [!IMPORTANT]
> **OWNER DECISION REQUIRED:** Select repository root between C: and D: drives. C: is an NVMe drive with more free space and is the same drive as the current bootstrap workspace. Both are viable.

### A.7 Proposed clean-clone and restore-test targets

All paths remain OWNER DECISION REQUIRED and do not currently exist.

If the canonical repository is selected on C::

| Purpose | Candidate path | Storage relation | Meaning |
|---|---|---|---|
| Clean clone | `D:\RSM-Validation\clean-clone` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Reproducibility / clean-clone test |
| Restore test | `D:\RSM-Restore-Test` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Recovery-procedure test |

If the canonical repository is selected on D::

| Purpose | Candidate path | Storage relation | Meaning |
|---|---|---|---|
| Clean clone | `C:\RSM-Validation\clean-clone` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Reproducibility / clean-clone test |
| Restore test | `C:\RSM-Restore-Test` | `SEPARATE LOCAL PHYSICAL DEVICE — VERIFIED` | Recovery-procedure test |

C: and D: are verified distinct physical disks on this workstation. These candidates provide separate-local-device isolation. They do not constitute off-device backup. A separate off-workstation/off-device backup remains an owner decision.

---

## B. Git and Remote Readiness — Observed Facts

| Property | Observed value | Status |
|---|---|---|
| Git installed | **NO** | **BLOCKER** |
| Git version | N/A | N/A |
| Git global user.name | N/A (Git not installed) | N/A |
| Git global user.email | N/A (Git not installed) | N/A |
| Credential helper | N/A (Git not installed) | N/A |
| SSH directory (`~/.ssh`) | Does NOT exist | Not configured |
| SSH keys | None | Not configured |
| GitHub CLI (`gh`) | **NOT installed** | Missing |
| GitHub auth status | N/A (gh not installed) | N/A |

> [!CAUTION]
> **BLOCKER: Git is not installed.** Git must be installed before RSM-3-B can proceed. This is classified as `REQUIRED BEFORE RSM-3-B`.

### B.1 Remote readiness assessment

- No Git installation means no remote testing is possible during this audit.
- No SSH keys or credential helpers are configured.
- Browser-based authentication (via GitHub CLI `gh auth login`) is the recommended path after Git and `gh` are installed.
- A private GitHub remote appears feasible once Git, `gh`, and authentication are established.

> [!IMPORTANT]
> **OWNER DECISIONS REQUIRED for remote:**
> - Canonical remote provider: GitHub (assumed but unconfirmed)
> - Repository name: `retrostage-maker` (assumed from historical sources, needs confirmation)
> - Visibility: Private (assumed, needs confirmation)
> - Primary branch: `main` (assumed, needs confirmation)
> - Authentication method: HTTPS + GitHub CLI credential helper, or SSH keys

---

## C. Node and Package-Tool Readiness — Observed Facts

| Tool | Installed | Version | Status |
|---|---|---|---|
| Node.js | **NO** | N/A | **BLOCKER** |
| npm | **NO** | N/A | Missing with Node |
| Corepack | **NO** | N/A | Missing with Node |
| pnpm | **NO** | N/A | Not available |
| Global TypeScript (`tsc`) | **NO** | N/A | Not required (project-local remains authoritative) |

> [!CAUTION]
> **BLOCKER: Node.js is not installed.** Node.js 24 LTS is required by the technology contract. This must be installed before RSM-3-B.

### C.1 PowerShell version

| Property | Value |
|---|---|
| PowerShell version | 5.1.19041.3803 |
| PowerShell path | `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe` |
| PowerShell 7 (pwsh) | **NOT installed** |

### C.2 Technology contract version mismatches

| Required (contract) | Observed | Gap |
|---|---|---|
| Node.js 24 LTS | Not installed | INSTALL REQUIRED |
| pnpm (current stable) | Not installed | INSTALL REQUIRED (via Corepack or direct) |
| TypeScript 6 (project-local) | Not installed | INSTALL REQUIRED at RSM-3-I2 |
| Git | Not installed | INSTALL REQUIRED |

---

## D. Native Build and Future Workstation Prerequisites — Inventory

| Tool | Presence | Classification |
|---|---|---|
| Visual Studio | NOT FOUND (vswhere absent) | `MILESTONE-GATED PRODUCT TOOL` — only if native addons (better-sqlite3, node-gyp) are needed |
| Visual Studio Build Tools | NOT FOUND | `MILESTONE-GATED PRODUCT TOOL` — same as above |
| Windows SDK | NOT FOUND | `MILESTONE-GATED PRODUCT TOOL` — required only for native addon compilation |
| Python | NOT FOUND | `UNKNOWN / REQUIRES LATER DEPENDENCY DECISION` — needed by node-gyp if native addons are compiled |
| CMake | NOT FOUND | `NOT REQUIRED` — no current roadmap need |
| Ninja | NOT FOUND | `NOT REQUIRED` — no current roadmap need |
| Git LFS | NOT FOUND | `OPTIONAL PRODUCTIVITY TOOL` — not required for initial bootstrap |
| 7-Zip | NOT FOUND | `OPTIONAL PRODUCTIVITY TOOL` |
| tar (bsdtar) | FOUND — bsdtar 3.5.2 | Available via Windows built-in |
| Code-signing tools | NOT FOUND | `MILESTONE-GATED PRODUCT TOOL` — needed at distribution milestone |

> [!NOTE]
> Visual Studio / Build Tools / Windows SDK / Python are NOT required for RSM-3-B. They are required only when native Node addons (e.g., `better-sqlite3`) are compiled, which is milestone-gated to later RSM milestones. The technology contract does not require them for the initial bootstrap toolchain.

---

## E. AI Application Readiness — Observed Facts

| Application | Status | Label |
|---|---|---|
| Antigravity IDE (Initial Audit) | **HISTORICAL** | Model label at execution: **Claude Opus 4.6 (Thinking)** |
| Antigravity IDE (Correction) | **ACTIVE** | Model label at execution: **Gemini 3.1 Pro (High)** |
| Codex independent review | COMPLETED | Decision: PASS WITH MATERIAL CORRECTIONS<br>Material finding M-01: remediated by FIX4<br>Narrow M-01 re-review: PENDING |

---

## H. Shell and Windows Constraints — Observed Facts

| Property | Value | Risk |
|---|---|---|
| PowerShell 5.1 | Active (`C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`) | Adequate for bootstrap |
| PowerShell 7 (pwsh) | NOT installed | `OPTIONAL PRODUCTIVITY TOOL` |
| Execution Policy (MachinePolicy) | Undefined | No block |
| Execution Policy (UserPolicy) | Undefined | No block |
| Execution Policy (Process) | Bypass | Current session OK |
| Execution Policy (CurrentUser) | Undefined | No block |
| Execution Policy (LocalMachine) | Undefined | No block |
| LongPathsEnabled | **0 (Disabled)** | `OWNER DECISION REQUIRED / RECOMMENDED ENVIRONMENT CHANGE` |
| Controlled Folder Access | 0 (Disabled) | No block |
| Recommended bootstrap shell | PowerShell 5.1 (available) | Adequate |

---

## Owner Decisions Required

| # | Decision | Options | Impact |
|---|---|---|---|
| 1 | Repository root drive | C: (804.4 GB free, NVMe) or D: (179 GB free) | Determines all repository paths |
| 2 | Repository path | `C:\RetroStage\retrostage-maker` or `D:\RetroStage\retrostage-maker` | Primary workspace |
| 3 | Remote provider | GitHub (assumed) | Authentication method |
| 4 | Repository name | `retrostage-maker` (assumed from history) | Remote URL |
| 5 | Visibility | Private (assumed) | Access control |
| 6 | Primary branch | `main` (assumed) | Git workflow |
| 7 | Authentication method | HTTPS + `gh` credential helper, or SSH keys | Security |
| 8 | Clean-clone target drive | Separate from repo drive | Recovery testing |
| 9 | Off-device backup | GitHub remote + additional? | Data safety |
| 10 | LongPathsEnabled | Enable? | Node.js compatibility |

---

## Blockers

| # | Blocker | Classification | Resolution |
|---|---|---|---|
| 1 | Git not installed | `REQUIRED BEFORE RSM-3-B` | Owner must authorize installation |
| 2 | Node.js not installed | `REQUIRED BEFORE RSM-3-B` | Owner must authorize installation |
| 3 | Owner decisions (above table) | `OWNER DECISION REQUIRED` | Must be resolved before RSM-3-B |

---

## Inferences

- The workstation appears to be freshly configured or rebuilt after the documented storage/OS failure.
- No conflicting repositories or development tools exist, which simplifies bootstrap.
- The absence of all development tools is consistent with the documented loss event.

---

## Unknowns

- Whether a GitHub account already exists for the owner.
- Whether existing GitHub credentials or SSH keys exist elsewhere (e.g., backed up).
- Whether the owner prefers HTTPS or SSH authentication.
- Whether a separate off-device backup destination (beyond GitHub) is planned.
- Whether the historical source files referenced in source 09 are available elsewhere on this machine.
