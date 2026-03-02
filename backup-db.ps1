# ─── FleetCar Database Backup Script ───
# Usage:  .\backup-db.ps1
# ใช้ได้ทั้ง Docker container (sqlserver) และ local SQL Server

param(
    [string]$Server      = "localhost",
    [string]$Database    = "FleetCarDb",
    [string]$User        = "sa",
    [string]$Password    = "FleetCar@Dev123",
    [string]$BackupDir   = ".\backups",
    [switch]$UseDocker                          # ใช้ -UseDocker ถ้ารัน SQL Server ผ่าน Docker
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "FleetCarDb_$timestamp.bak"

# สร้างโฟลเดอร์ backups ถ้ายังไม่มี
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Write-Host "[+] Created backup directory: $BackupDir" -ForegroundColor Green
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FleetCar Database Backup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Server  : $Server"
Write-Host "  Database: $Database"
Write-Host "  File    : $backupFile"
Write-Host "============================================" -ForegroundColor Cyan

if ($UseDocker) {
    # ── Backup ภายใน Docker container แล้ว copy ออกมา ──
    $containerName = "fleetcar-sqlserver"
    $containerBackupPath = "/var/opt/mssql/backup/$backupFile"

    Write-Host "`n[1/3] Creating backup directory inside container..." -ForegroundColor Yellow
    docker exec $containerName mkdir -p /var/opt/mssql/backup

    Write-Host "[2/3] Running BACKUP DATABASE inside container..." -ForegroundColor Yellow
    $sqlCmd = "BACKUP DATABASE [$Database] TO DISK = N'$containerBackupPath' WITH FORMAT, INIT, NAME = N'FleetCarDb-Full', SKIP, NOREWIND, NOUNLOAD, COMPRESSION, STATS = 10"
    docker exec $containerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U $User -P $Password -C -Q $sqlCmd

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Backup FAILED!" -ForegroundColor Red
        exit 1
    }

    Write-Host "[3/3] Copying backup file from container..." -ForegroundColor Yellow
    docker cp "${containerName}:${containerBackupPath}" "$BackupDir\$backupFile"

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Failed to copy backup file!" -ForegroundColor Red
        exit 1
    }
}
else {
    # ── Backup โดยตรงผ่าน sqlcmd (local SQL Server) ──
    $fullBackupPath = (Resolve-Path $BackupDir).Path + "\$backupFile"

    Write-Host "`n[1/1] Running BACKUP DATABASE..." -ForegroundColor Yellow
    $sqlCmd = "BACKUP DATABASE [$Database] TO DISK = N'$fullBackupPath' WITH FORMAT, INIT, NAME = N'FleetCarDb-Full', SKIP, NOREWIND, NOUNLOAD, COMPRESSION, STATS = 10"
    sqlcmd -S $Server -U $User -P $Password -C -Q $sqlCmd

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Backup FAILED!" -ForegroundColor Red
        exit 1
    }
}

# ── แสดงผลลัพธ์ ──
$backupFilePath = Join-Path $BackupDir $backupFile
if (Test-Path $backupFilePath) {
    $size = (Get-Item $backupFilePath).Length
    $sizeMB = [math]::Round($size / 1MB, 2)
    Write-Host "`n[OK] Backup completed successfully!" -ForegroundColor Green
    Write-Host "  File: $backupFilePath" -ForegroundColor Green
    Write-Host "  Size: $sizeMB MB" -ForegroundColor Green
}
else {
    Write-Host "`n[!] Backup file not found at $backupFilePath" -ForegroundColor Red
}
