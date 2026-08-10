# RSM-3-I4-RETRY2 Local and External Backup Evidence

**Task:** `RSM-3-I4-FIX2-COMMIT1-RETRY2`  
**Mode:** governed backup / exact manifest verification / fail-closed

## Governed source scope

```text
Canonical source = C:\RetroStage\retrostage-maker
Source HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
Source branch = main
Source state = CLEAN
Git-tracked worktree files = 141
.git history/state files = 38
Governed file count N = 179
Governed raw bytes G = 4,025,576
Git lock files = 0
Secret-name blockers = 0
Secret-content blockers = 0
Embedded Git remote credential = FALSE
Secret-scope blocker count = 0
```

Untracked dependency stores, build output, caches, logs, temporary files, credential stores, and secret-bearing local state were excluded.

## Local backup

```text
Target = D:\RSM-Backup\retrostage-maker
Target absent before operation = TRUE
Start UTC = 2026-08-09T23:36:16.2105611Z
End UTC = 2026-08-09T23:36:19.6289603Z
Source files / bytes = 179 / 4,025,576
Destination files / bytes = 179 / 4,025,576
Missing = 0
Extra = 0
Size mismatch = 0
SHA-256 mismatch = 0
Backup Git opens = PASS
Backup HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
Backup branch = main
Backup tracked state = CLEAN
```

## External device recheck

```text
Volume GUID = \\?\Volume{15607945-45f1-49e8-bacd-481208610792}\
Observed mount = F:
Model = Seagate Backup+ Hub BK SCSI Disk Device
Serial = NA9RMHEH
UniqueId = 5000000000000001
Bus = USB
Physical disk bytes = 14,000,519,642,624
Partition style = GPT
Filesystem = NTFS
Health = Healthy
Selected identity = PASS
Encryption = UNENCRYPTED_OWNER_CONTROLLED
BitLocker = DEFERRED_OPERATIONAL_HARDENING / NON_BLOCKING
BitLocker mutation = FALSE
```

## Capacity

Exact formula: `E = max(ceil(G * 1.25), G + 16,777,216)`

```text
G = 4,025,576
ceil(G * 1.25) = 5,031,970
G + 16,777,216 = 20,802,792
E = 20,802,792
Volume total T = 14,000,383,324,160
Free before F = 13,999,847,215,104
Projected free after E = 13,999,826,412,312
20% minimum free = 2,800,076,664,832
Projected margin above 20% = 11,199,749,747,480
Capacity gate = PASS
Projected post-generation >=20% gate = PASS
Observed free after generation = 13,999,842,545,664
Actual post-generation >=20% gate = PASS
```

## External verified generation

```text
External root was absent before operation = TRUE
Generation ID = 20260809T233850Z_f9404ec83436
Generation path = F:\RSM-Offsite-Backup\retrostage-maker\generations\20260809T233850Z_f9404ec83436
Creation UTC = 2026-08-09T23:38:50Z
Source HEAD = f9404ec83436cb739e9363ccc3791517a3ddefb9
Branch = main
Commit count = 5
Payload files = 179
Payload raw bytes = 4,025,576
Missing = 0
Extra = 0
Size mismatch = 0
SHA-256 mismatch = 0
Manifest rows / unique paths = 179 / 179
Manifest SHA-256 = D96F8F52DB5535C6E14FB08978FB1176AF077756FDCF051F606BFCDB5EF90494
generation.json SHA-256 = 52214E9F2BF99E06DF261CF4A232A59324FE54F5B04AD50C0789BD7900CEB71F
COMPLETE.sha256 SHA-256 = 8F200693DD979B20DB935D38BF0101A54DAF5DB0ACF3295C6D7C4FBB7D98E208
Completion marker written last = TRUE
Completion marker valid = TRUE
Mechanism version = RSM-3-I4-v1
```

No prior completed generation was deleted or pruned.

`LOCAL_BACKUP = PASS`

`EXTERNAL_VERIFIED_GENERATION = PASS`
