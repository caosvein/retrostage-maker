# RSM-3-I4-RETRY2 Isolated Restore Proof Evidence

**Task:** `RSM-3-I4-FIX2-COMMIT1-RETRY2`  
**Restore target:** `D:\RSM-Restore-Test`

## Restore source

Only the newly completed external generation was used:

`F:\RSM-Offsite-Backup\retrostage-maker\generations\20260809T233850Z_f9404ec83436`

Pre-restore re-verification:

```text
Completion marker = VALID
Generation metadata = VALID
Manifest SHA-256 = D96F8F52DB5535C6E14FB08978FB1176AF077756FDCF051F606BFCDB5EF90494
Manifest rows / unique rows = 179 / 179
Payload files = 179
Missing = 0
Extra = 0
Size mismatch = 0
SHA-256 mismatch = 0
```

## Isolated copy and repository identity

```text
Target absent before restore = TRUE
Restored files = 179
Restore missing / extra / size mismatch / hash mismatch = 0 / 0 / 0 / 0
Git repository opens = PASS
git fsck --full = PASS
HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
Branch = main
Commit count = 5
Tree files = 141
History identity = PASS
Working tree integrity = PASS
Tracked state before install = CLEAN
```

## Restore validation

| Command | Exit | Result |
|---|---:|---|
| `pnpm.cmd install --frozen-lockfile` | 0 | PASS |
| `pnpm.cmd run validate` | 0 | PASS |
| `pnpm.cmd run build` | 0 | PASS |
| `pnpm.cmd run compliance:check` | 0 | PASS |

```text
pnpm-lock.yaml SHA-256 before = CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0
pnpm-lock.yaml SHA-256 after = CA4D42AB5A23D84F3A106C2458BE1C3204F58E42A13C04AC85CABC197F9939A0
Tracked lockfile drift = 0
Tracked worktree drift = 0
HEAD after validation = f9404ec83436cb739e9363ccc3791517a3ddefb9
Validation end UTC = 2026-08-09T23:40:47.0507495Z
Canonical repository overwritten = FALSE
```

`ISOLATED_RESTORE_PROOF = PASS`
