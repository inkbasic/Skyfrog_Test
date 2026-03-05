# FleetCar — Vehicle Management System

ระบบจัดการข้อมูลยานพาหนะของบริษัท พัฒนาด้วย ASP.NET Core 10 (Backend) และ React 19 (Frontend) พร้อม Docker Compose สำหรับ Deploy

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| ASP.NET Core | 10.0 | REST API Framework |
| Entity Framework Core | 10.0 | ORM / Database Access |
| SQL Server | 2022 | Database |
| JWT Bearer | 10.0 | Authentication |
| BCrypt.Net | 4.1.0 | Password Hashing |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19.2 | UI Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 7.3 | Build Tool |
| MUI (Material UI) | 7.3 | UI Components |
| Tailwind CSS | 4.2 | Utility Styling |
| Axios | 1.13 | HTTP Client |
| React Router | 7.13 | Client-side Routing |
| SweetAlert2 | 11.26 | Alert Dialogs |

### Infrastructure

| Technology | Purpose |
|---|---|
| Docker Compose | Container Orchestration |
| Nginx | Reverse Proxy / SPA Hosting |
| ngrok | Public URL Tunnel (Demo) |

---

## ฟีเจอร์หลัก

### สำหรับผู้เยี่ยมชม (Guest)
- ดู Dashboard สรุปจำนวนยานพาหนะตามสถานะ
- ดูรายการยานพาหนะ (ค้นหา, กรองสถานะ, เรียงลำดับ, แบ่งหน้า)
- ดูรายละเอียดยานพาหนะแต่ละคัน

### สำหรับผู้ใช้ที่ลงทะเบียน (Authenticated)
- เพิ่มยานพาหนะ พร้อมอัปโหลดรูปภาพ
- แก้ไขข้อมูลยานพาหนะ
- ลบยานพาหนะ (มีการยืนยันก่อนลบ)

---


## การติดตั้งและรัน

### ข้อกำหนดเบื้องต้น

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (รวม Docker Compose)
- ไม่ต้องติดตั้ง ngrok แยก — รวมอยู่ใน Docker Compose แล้ว

### Deploy ด้วย Docker Compose (แนะนำ)

```bash
# 1. Clone โปรเจค
git clone <repository-url>
cd Skyfrog_Test

# 2. Build และ Start ทุก service
docker compose up --build -d

# 3. ตรวจสอบสถานะ
docker ps

# 4. เปิดเว็บไซต์
# Local:  http://localhost:5173
# Public: https://gorilloid-invitingly-brain.ngrok-free.dev
#
# ngrok จะ start อัตโนมัติพร้อมกัน ไม่ต้องรันแยก
# ดู ngrok status ได้ที่ http://localhost:4040
```

### พัฒนาแบบ Local (Dev Mode)

```bash
# 1. รัน SQL Server ผ่าน Docker
docker compose -f docker-compose.dev.yml up -d

# 2. รัน Backend
cd backend
dotnet run

# 3. รัน Frontend (terminal ใหม่)
cd frontend
cp .env.example .env        # ตั้งค่า API URL
npm install
npm run dev
```

### คำสั่งที่ใช้บ่อย

| สถานการณ์ | คำสั่ง |
|---|---|
| Start ทุก service | `docker compose up --build -d` |
| หยุดทุก service | `docker compose down` |
| หยุด + ลบ data | `docker compose down -v` |
| ดู log backend | `docker logs fleetcar-backend` |
| ดู log realtime | `docker logs -f fleetcar-backend` |
| Rebuild เฉพาะ frontend | `docker compose up --build -d frontend` |
| Rebuild เฉพาะ backend | `docker compose up --build -d backend` |

---

## Database Backup & Restore

โปรเจคมี PowerShell script สำหรับ backup/restore ฐานข้อมูล SQL Server อยู่ที่ root ของโปรเจค

### Backup ฐานข้อมูล

```powershell
# Backup จาก Docker container (แนะนำ — ใช้กับ docker compose)
.\backup-db.ps1 -UseDocker

# Backup จาก Local SQL Server
.\backup-db.ps1
```

ไฟล์ backup จะถูกเก็บในโฟลเดอร์ `backups/` ตั้งชื่อตาม timestamp เช่น `FleetCarDb_20260302_153000.bak`

### Restore ฐานข้อมูล

```powershell
# Restore เข้า Docker container
.\restore-db.ps1 -BackupFile .\backups\FleetCarDb_20260302_153000.bak -UseDocker

# Restore เข้า Local SQL Server
.\restore-db.ps1 -BackupFile .\backups\FleetCarDb_20260302_153000.bak
```

> **หมายเหตุ:** Restore จะ OVERWRITE ข้อมูลเดิมทั้งหมด — script จะถามยืนยันก่อนดำเนินการ

### Parameters ที่ใช้ได้

| Parameter | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|
| `-Server` | `localhost` | ที่อยู่ SQL Server |
| `-Database` | `FleetCarDb` | ชื่อ Database |
| `-User` | `sa` | Username |
| `-Password` | `FleetCar@Dev123` | Password |
| `-BackupDir` | `.\backups` | โฟลเดอร์เก็บไฟล์ backup (เฉพาะ backup) |
| `-BackupFile` | — | path ไฟล์ .bak (เฉพาะ restore, **จำเป็น**) |
| `-UseDocker` | — | ใช้เมื่อ SQL Server รันผ่าน Docker container |
