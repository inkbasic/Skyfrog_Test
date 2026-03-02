# ─── FleetCar Database Restore Script ───
# Usage:  .\restore-db.ps1 -BackupFile .\backups\FleetCarDb_20260302_120000.bak

param(
    [Parameter(Mandatory = $true)]
    [string]$BackupFile,                        # Path ไปยังไฟล์ .bak
    [string]$Server      = "localhost",
    [string]$Database    = "FleetCarDb",
    [string]$User        = "sa",
    [string]$Password    = "FleetCar@Dev123",
    [switch]$UseDocker                          # ใช้ -UseDocker ถ้ารัน SQL Server ผ่าน Docker
)

if (!(Test-Path $BackupFile)) {
    Write-Host "[!] Backup file not found: $BackupFile" -ForegroundColor Red
    exit 1
}

$fileName = Split-Path $BackupFile -Leaf

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FleetCar Database Restore" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Server  : $Server"
Write-Host "  Database: $Database"
Write-Host "  File    : $fileName"
Write-Host "============================================" -ForegroundColor Cyan

Write-Host "`n[!] WARNING: This will OVERWRITE the existing '$Database' database!" -ForegroundColor Red
$confirm = Read-Host "Type 'YES' to confirm"
if ($confirm -ne "YES") {
    Write-Host "Restore cancelled." -ForegroundColor Yellow
    exit 0
}

if ($UseDocker) {
    # ── Restore ภายใน Docker container ──
    $containerName = "fleetcar-sqlserver"
    $containerRestorePath = "/var/opt/mssql/backup/$fileName"

    Write-Host "`n[1/3] Copying backup file into container..." -ForegroundColor Yellow
    docker exec $containerName mkdir -p /var/opt/mssql/backup
    docker cp $BackupFile "${containerName}:${containerRestorePath}"

    Write-Host "[2/3] Setting database to SINGLE_USER..." -ForegroundColor Yellow
    $sqlSingle = "IF DB_ID('$Database') IS NOT NULL ALTER DATABASE [$Database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;"
    docker exec $containerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U $User -P $Password -C -Q $sqlSingle

    Write-Host "[3/3] Restoring database..." -ForegroundColor Yellow
    $sqlRestore = "RESTORE DATABASE [$Database] FROM DISK = N'$containerRestorePath' WITH REPLACE, STATS = 10; ALTER DATABASE [$Database] SET MULTI_USER;"
    docker exec $containerName /opt/mssql-tools18/bin/sqlcmd -S localhost -U $User -P $Password -C -Q $sqlRestore

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Restore FAILED!" -ForegroundColor Red
        exit 1
    }
}
else {
    # ── Restore โดยตรงผ่าน sqlcmd (local SQL Server) ──
    $fullPath = (Resolve-Path $BackupFile).Path

    Write-Host "`n[1/2] Setting database to SINGLE_USER..." -ForegroundColor Yellow
    $sqlSingle = "IF DB_ID('$Database') IS NOT NULL ALTER DATABASE [$Database] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;"
    sqlcmd -S $Server -U $User -P $Password -C -Q $sqlSingle

    Write-Host "[2/2] Restoring database..." -ForegroundColor Yellow
    $sqlRestore = "RESTORE DATABASE [$Database] FROM DISK = N'$fullPath' WITH REPLACE, STATS = 10; ALTER DATABASE [$Database] SET MULTI_USER;"
    sqlcmd -S $Server -U $User -P $Password -C -Q $sqlRestore

    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] Restore FAILED!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n[OK] Database restored successfully!" -ForegroundColor Green
