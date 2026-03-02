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
- [ngrok](https://ngrok.com/) (เฉพาะกรณีต้องการเผยแพร่ URL สาธารณะ)

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
# http://localhost:5173
```

### เผยแพร่ด้วย ngrok (สำหรับ Demo)

```bash
# หลังจาก docker compose up แล้ว
ngrok http 5173

# จะได้ URL เช่น https://xxxx.ngrok-free.app
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
