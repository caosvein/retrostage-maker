#requires -RunAsAdministrator
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$ExpectedVolumeGuid = '\\?\Volume{15607945-45f1-49e8-bacd-481208610792}\'
$ExpectedModel = 'Seagate Backup+ Hub BK SCSI Disk Device'
$ExpectedSerial = 'NA9RMHEH'
$ExpectedUniqueId = '5000000000000001'
$ExpectedRepoHead = 'e50cadca387b992f6a5648237fe0c006ef72a6fa'
$Repo = 'C:\RetroStage\retrostage-maker'
$OutputDir = 'C:\RetroStage\bootstrap\RSM-3-A\Outputs'
$EvidencePath = Join-Path $OutputDir 'RSM-3-I4-BL1-OWNER-BITLOCKER-MUTATION-EVIDENCE.md'
$AttestationPath = Join-Path $OutputDir 'RSM-3-I4-BL1-OWNER-RECOVERY-MATERIAL-CUSTODY-ATTESTATION.md'

function Stop-FailClosed([string]$Message) {
    throw "FAIL-CLOSED: $Message"
}

function Get-SelectedVolume {
    $vol = Get-CimInstance Win32_Volume | Where-Object { $_.DeviceID -eq $ExpectedVolumeGuid }
    if (@($vol).Count -ne 1) {
        Stop-FailClosed "Exact selected Volume GUID was not resolved uniquely."
    }
    if ([string]::IsNullOrWhiteSpace($vol.DriveLetter)) {
        Stop-FailClosed "Exact selected volume has no current drive letter."
    }

    $driveLetterOnly = $vol.DriveLetter.TrimEnd(':')
    $partition = Get-Partition -DriveLetter $driveLetterOnly
    $disk = Get-Disk -Number $partition.DiskNumber
    $cimDisk = Get-CimInstance Win32_DiskDrive -Filter "Index=$($partition.DiskNumber)"

    if ($cimDisk.Model.Trim() -ne $ExpectedModel) {
        Stop-FailClosed "Disk model mismatch."
    }
    if ($cimDisk.SerialNumber.Trim() -ne $ExpectedSerial) {
        Stop-FailClosed "Disk serial mismatch."
    }
    if ($disk.UniqueId.Trim() -ne $ExpectedUniqueId) {
        Stop-FailClosed "Disk UniqueId mismatch."
    }
    if ([string]$disk.BusType -ne 'USB') {
        Stop-FailClosed "Disk bus mismatch."
    }
    if ([string]$vol.FileSystem -ne 'NTFS') {
        Stop-FailClosed "Filesystem mismatch."
    }

    [pscustomobject]@{
        Volume = $vol
        MountPoint = $vol.DriveLetter
        Partition = $partition
        Disk = $disk
        CimDisk = $cimDisk
    }
}

function Get-BitLockerSafeState([string]$MountPoint) {
    $bl = Get-BitLockerVolume -MountPoint $MountPoint
    $protectors = @($bl.KeyProtector)
    [pscustomobject]@{
        VolumeStatus = [string]$bl.VolumeStatus
        EncryptionPercentage = [int]$bl.EncryptionPercentage
        EncryptionMethod = [string]$bl.EncryptionMethod
        ProtectionStatus = [string]$bl.ProtectionStatus
        LockStatus = [string]$bl.LockStatus
        AutoUnlockEnabled = [bool]$bl.AutoUnlockEnabled
        ProtectorTypes = @($protectors | ForEach-Object { [string]$_.KeyProtectorType })
        ProtectorIds = @($protectors | ForEach-Object { [string]$_.KeyProtectorId })
    }
}

function Compare-SecureStrings([Security.SecureString]$A, [Security.SecureString]$B) {
    $pa = [IntPtr]::Zero
    $pb = [IntPtr]::Zero
    try {
        $pa = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($A)
        $pb = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($B)
        $sa = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pa)
        $sb = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pb)
        return ($sa -ceq $sb)
    }
    finally {
        if ($pa -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pa) }
        if ($pb -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pb) }
        Remove-Variable sa,sb -ErrorAction SilentlyContinue
    }
}

function Clear-RecoverySecret {
    try { Set-Clipboard -Value '' -ErrorAction SilentlyContinue } catch {}
    Remove-Variable recoveryPassword -Scope Script -ErrorAction SilentlyContinue
    Remove-Variable enableResult -Scope Script -ErrorAction SilentlyContinue
}

$startedAt = Get-Date
$repoHeadBefore = (& git -C $Repo rev-parse HEAD).Trim()
$repoStatusBefore = @(& git -C $Repo status --porcelain=v2 --untracked-files=all)

if ($repoHeadBefore -ne $ExpectedRepoHead) {
    Stop-FailClosed "Repository HEAD drift."
}
if ($repoStatusBefore.Count -ne 0) {
    Stop-FailClosed "Repository is not clean."
}

if ((Test-Path -LiteralPath $EvidencePath) -or (Test-Path -LiteralPath $AttestationPath)) {
    Stop-FailClosed "BL1 output already exists; refusing overwrite."
}

$selected = Get-SelectedVolume
$mount = $selected.MountPoint
$pre = Get-BitLockerSafeState $mount

if ($pre.VolumeStatus -ne 'FullyDecrypted' -or
    $pre.EncryptionPercentage -ne 0 -or
    $pre.EncryptionMethod -ne 'None' -or
    $pre.ProtectionStatus -ne 'Off') {
    Stop-FailClosed "PRE2 BitLocker baseline no longer matches FullyDecrypted/0%/None/Off."
}
if ($pre.ProtectorTypes.Count -ne 0) {
    Stop-FailClosed "Unexpected existing BitLocker protector detected."
}

Write-Host ''
Write-Host 'RSM-3-I4-BL1 OWNER-ONLY BITLOCKER MUTATION'
Write-Host "Exact selected volume: $ExpectedVolumeGuid ($mount)"
Write-Host 'Mode: XTS-AES 256, FULL VOLUME ENCRYPTION'
Write-Host 'No repository, push, backup, clone, or restore operation will occur.'
Write-Host ''
$confirm = Read-Host 'Type exactly AUTHORIZE FULL VOLUME ENCRYPTION to continue'
if ($confirm -cne 'AUTHORIZE FULL VOLUME ENCRYPTION') {
    Stop-FailClosed "Owner authorization phrase not supplied."
}

do {
    $pw1 = Read-Host 'Enter a strong non-reused BitLocker unlock passphrase' -AsSecureString
    $pw2 = Read-Host 'Re-enter the same BitLocker unlock passphrase' -AsSecureString

    if ($pw1.Length -lt 16) {
        Write-Warning 'Passphrase must be at least 16 characters for this owner procedure.'
        $match = $false
    } else {
        $match = Compare-SecureStrings $pw1 $pw2
        if (-not $match) { Write-Warning 'Passphrases did not match.' }
    }
} until ($match)

$script:recoveryPassword = $null
$script:enableResult = $null
$recoveryProtectorId = $null
$passwordProtectorId = $null
$attested = $false
$mutationError = $null

try {
    # Important: no -UsedSpaceOnly => full-volume encryption.
    # The returned object is captured so a generated Recovery Password never prints to the host.
    $script:enableResult = Enable-BitLocker `
        -MountPoint $mount `
        -EncryptionMethod XtsAes256 `
        -RecoveryPasswordProtector `
        -Confirm:$false `
        -ErrorAction Stop

    $generatedRecovery = @(
        $script:enableResult.KeyProtector |
        Where-Object {
            [string]$_.KeyProtectorType -eq 'RecoveryPassword' -and
            -not [string]::IsNullOrWhiteSpace([string]$_.RecoveryPassword)
        }
    ) | Select-Object -First 1

    if ($null -eq $generatedRecovery) {
        Stop-FailClosed "Windows did not return the generated Recovery Password safely to the captured object."
    }

    $script:recoveryPassword = [string]$generatedRecovery.RecoveryPassword
    $recoveryProtectorId = [string]$generatedRecovery.KeyProtectorId

    if ($script:recoveryPassword -notmatch '^\d{6}(?:-\d{6}){7}$') {
        Stop-FailClosed "Generated Recovery Password has unexpected format."
    }

    # Add a normal primary unlock password without printing it.
    $passwordResult = Add-BitLockerKeyProtector `
        -MountPoint $mount `
        -PasswordProtector `
        -Password $pw1 `
        -Confirm:$false `
        -ErrorAction Stop

    $passwordProtector = @(
        $passwordResult.KeyProtector |
        Where-Object { [string]$_.KeyProtectorType -eq 'Password' }
    ) | Select-Object -Last 1

    if ($null -eq $passwordProtector) {
        Stop-FailClosed "Primary Password protector was not observed after creation."
    }
    $passwordProtectorId = [string]$passwordProtector.KeyProtectorId

    # Owner-only custody handoff. The secret is never printed.
    Set-Clipboard -Value $script:recoveryPassword

    Write-Host ''
    Write-Host 'A BitLocker Recovery Password has been copied to the LOCAL CLIPBOARD.'
    Write-Host 'DO NOT paste it into ChatGPT, Codex, repository, bootstrap, notes, or the Seagate disk.'
    Write-Host 'Paste it now into a secure location separate from BOTH this workstation and the Seagate volume.'
    Write-Host 'Examples: trusted cloud/password-manager vault or offline physical record.'
    Write-Host ''

    $custody = Read-Host 'After you have securely stored it separately, type exactly RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE'
    if ($custody -cne 'RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE') {
        Stop-FailClosed "Owner recovery-material custody attestation not supplied."
    }
    $attested = $true

    Clear-RecoverySecret

    $post = Get-BitLockerSafeState $mount

    $repoHeadAfter = (& git -C $Repo rev-parse HEAD).Trim()
    $repoStatusAfter = @(& git -C $Repo status --porcelain=v2 --untracked-files=all)
    if ($repoHeadAfter -ne $repoHeadBefore -or $repoStatusAfter.Count -ne 0) {
        Stop-FailClosed "Unexpected repository mutation detected."
    }

    $completedAt = Get-Date
    $owner = [Security.Principal.WindowsIdentity]::GetCurrent().Name

    $attestationLines = @(
        '# RSM-3-I4-BL1 — Owner Recovery Material Custody Attestation'
        ''
        ('Owner Windows identity: ' + $owner)
        ('Local timestamp: ' + $completedAt.ToString('o'))
        ('Selected Volume GUID: ' + $ExpectedVolumeGuid)
        ('Recovery Password protector ID: ' + $recoveryProtectorId)
        ''
        'RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE'
        ''
        'The owner attests that the BitLocker Recovery Password has been stored in a secure location logically/physically separate from both the workstation and the selected Seagate backup volume.'
        ''
        'The Recovery Password itself is intentionally NOT included in this artifact.'
        ''
        'RECOVERY_SECRET_IN_EVIDENCE = FALSE'
        'RECOVERY_SECRET_IN_REPOSITORY = FALSE'
        'RECOVERY_SECRET_IN_BOOTSTRAP = FALSE'
        'RECOVERY_SECRET_ON_SELECTED_SEAGATE = FALSE'
        'CLIPBOARD_CLEARED_AFTER_ATTESTATION = TRUE'
    )
    $attestation = [string]::Join([Environment]::NewLine, $attestationLines) + [Environment]::NewLine

    $evidenceLines = @(
        '# RSM-3-I4-BL1 — Owner BitLocker Mutation Evidence'
        ''
        'Task: RSM-3-I4-BL1'
        'Mode: owner-only Administrator BitLocker mutation'
        ('Started: ' + $startedAt.ToString('o'))
        ('Completed observation: ' + $completedAt.ToString('o'))
        ''
        '## Exact selected identity'
        ('Volume GUID = ' + $ExpectedVolumeGuid)
        ('Current mount = ' + $mount)
        ('Model = ' + $selected.CimDisk.Model.Trim())
        ('Serial = ' + $selected.CimDisk.SerialNumber.Trim())
        ('UniqueId = ' + $selected.Disk.UniqueId.Trim())
        ('Bus = ' + [string]$selected.Disk.BusType)
        ('Filesystem = ' + [string]$selected.Volume.FileSystem)
        ''
        '## Pre-mutation safe state'
        ('VolumeStatus = ' + $pre.VolumeStatus)
        ('EncryptionPercentage = ' + $pre.EncryptionPercentage)
        ('EncryptionMethod = ' + $pre.EncryptionMethod)
        ('ProtectionStatus = ' + $pre.ProtectionStatus)
        ('ProtectorCount = ' + $pre.ProtectorTypes.Count)
        ''
        '## Authorized configuration applied'
        'EncryptionMethod requested = XtsAes256'
        'Encryption extent = FULL VOLUME'
        'UsedSpaceOnly = FALSE'
        'RecoveryPassword protector created = TRUE'
        'Password protector created = TRUE'
        ('RecoveryPassword protector ID = ' + $recoveryProtectorId)
        ('Password protector ID = ' + $passwordProtectorId)
        'Auto-unlock enabled by this task = FALSE'
        ''
        '## Immediate post-start safe observation'
        ('VolumeStatus = ' + $post.VolumeStatus)
        ('EncryptionPercentage = ' + $post.EncryptionPercentage)
        ('EncryptionMethod = ' + $post.EncryptionMethod)
        ('ProtectionStatus = ' + $post.ProtectionStatus)
        ('LockStatus = ' + $post.LockStatus)
        ('AutoUnlockEnabled = ' + $post.AutoUnlockEnabled)
        ('ProtectorTypes = ' + [string]::Join(', ', $post.ProtectorTypes))
        ''
        '## Secret boundary'
        'Recovery secret printed to evidence = FALSE'
        'Recovery secret printed to host by script = FALSE'
        'Recovery secret copied transiently to local clipboard = TRUE'
        'Owner separate-storage attestation = TRUE'
        'Clipboard cleared after attestation = TRUE'
        'Primary password recorded = FALSE'
        ''
        '## Repository / I4 boundary'
        ('Repository HEAD before = ' + $repoHeadBefore)
        ('Repository HEAD after = ' + $repoHeadAfter)
        'Repository remained clean = TRUE'
        'Push = FALSE'
        'Backup = FALSE'
        'Clone = FALSE'
        'Restore = FALSE'
        'Source 07 created = FALSE'
        ''
        'BL1 does not claim full encryption completion.'
        'A later privileged read-only verification must prove FullyEncrypted / 100% / XtsAes256 / Protection On and both required protector types before RSM-3-I4 execution.'
    )
    $evidence = [string]::Join([Environment]::NewLine, $evidenceLines) + [Environment]::NewLine

    [IO.File]::WriteAllText($AttestationPath, $attestation, (New-Object Text.UTF8Encoding($false)))
    [IO.File]::WriteAllText($EvidencePath, $evidence, (New-Object Text.UTF8Encoding($false)))

    Write-Host ''
    Write-Host 'BL1 configuration started successfully.'
    Write-Host 'Recovery material attestation recorded WITHOUT the secret.'
    Write-Host "Evidence: $EvidencePath"
    Write-Host "Attestation: $AttestationPath"
    Write-Host ''
    Write-Host 'Do not disconnect the Seagate volume. Do not begin RSM-3-I4 execution yet.'
    Write-Host 'Bring ONLY the two non-secret BL1 output files back for independent verification.'
}
catch {
    $mutationError = $_.Exception.Message

    if (-not [string]::IsNullOrWhiteSpace($script:recoveryPassword)) {
        try {
            Set-Clipboard -Value $script:recoveryPassword
            Write-Warning 'A Recovery Password exists and has been copied to the local clipboard.'
            Write-Warning 'Store it separately now. DO NOT paste it into ChatGPT/Codex.'
            $custodyOnFailure = Read-Host 'After storage, type exactly RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE'
            if ($custodyOnFailure -ceq 'RECOVERY_MATERIAL_STORED_SEPARATELY = TRUE') {
                $attested = $true
            }
        } catch {}
    }

    Clear-RecoverySecret

    Write-Error $mutationError
    Write-Host 'BitLocker may have been partially configured. DO NOT retry blindly.'
    Write-Host 'Run only a read-only status verification before any further mutation.'
    exit 1
}
finally {
    Clear-RecoverySecret
    Remove-Variable pw1,pw2 -ErrorAction SilentlyContinue
}
