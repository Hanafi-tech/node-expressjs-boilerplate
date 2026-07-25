# Backend Boilerplate

Production-ready REST API boilerplate berbasis **Express.js + Sequelize + PostgreSQL**.  
Dilengkapi Auth, RBAC, Redis Cache, Socket.io, Kafka, Audit Trail, dan banyak lagi — langsung siap pakai.

---

## Tech Stack

| Kategori | Library |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4 |
| ORM | Sequelize 6 |
| Database | PostgreSQL (default) / MySQL |
| Cache | Redis 4 |
| Auth | JWT + Refresh Token + MFA (TOTP) |
| RBAC | CASL Ability (permission dari DB) |
| Realtime | Socket.io |
| Queue | Kafka (opsional) |
| Logging | Winston + Morgan + Daily Rotate |
| Validation | express-validator |
| API Docs | Swagger UI |
| Scheduler | node-cron |

---

## Fitur Lengkap

### 🔐 Autentikasi & Keamanan
- Login / Logout / Refresh Token
- MFA (TOTP via Google Authenticator + Backup Codes)
- Reset Password via email (token tabel terpisah, single-use)
- **Brute Force Protection** — lockout per email via Redis
- **Activity Log** — catat setiap login sukses/gagal, logout, reset password
- Session secure (cookie-session, httpOnly, sameSite strict)
- Helmet, XSS-clean, CORS strict dari env
- Rate limiting 1000 req / 15 menit per IP
- **Request ID** — setiap request punya `X-Request-ID` unik

### 👥 User & RBAC
- CRUD User lengkap (dengan upload foto)
- CRUD Role + Permission dinamis dari DB (bukan file JSON)
- CRUD Jabatan (Positions)
- CASL Ability dengan **Redis cache 10 menit** + invalidasi otomatis
- List Permission sebagai katalog fitur RBAC

### 📧 Email Service
- Konfigurasi SMTP **tersimpan di DB** — bisa diubah via API tanpa restart
- Multiple config, aktifkan salah satu
- Endpoint **test kirim email** langsung dari API
- Template: Reset Password, Verifikasi Email

### 🔔 Notifikasi
- Push realtime via **Socket.io** ke room user
- Simpan ke DB (baca, tandai dibaca, hapus semua)
- Service `sendNotificationToUsers()` siap pakai di controller manapun
- Tracking user online (join_portal, disconnect)

### 📊 Monitoring & Audit
- **Health Check** (`GET /health`) — status DB, Redis, Kafka, memory
- **Audit Trail** — log otomatis semua request ke DB
- **Activity Log** — riwayat login per user + IP address + user agent
- Winston logging: error, warn, info (daily rotate, 14 hari)
- Morgan HTTP request log (dev: console, prod: file rotating)

### ⚙️ App Settings
- Key-value config di DB (`app_settings`)
- Type parsing otomatis: `string`, `number`, `boolean`, `json`
- **Redis cache 5 menit** + invalidasi saat update
- Endpoint public `GET /api/v1/settings/public` (tanpa auth)

### 🗂️ File Manager
- List file di folder `upload/` dan `image/` dengan metadata
- Hapus file via API (dilindungi dari path traversal)

### ⏰ Cron Jobs
- Purge soft-deleted users > 30 hari (jam 02:00 WIB)
- Purge expired reset tokens (setiap jam)
- Purge activity logs > 90 hari (tiap Minggu jam 03:00 WIB)

### 🔧 Developer Experience
- **Graceful Shutdown** (SIGTERM/SIGINT) — tutup DB, Redis, Kafka, Socket.io
- **API Versioning** — semua route di `/api/v1/`
- **Swagger UI** auto-docs dari JSDoc (`/api-docs`)
- Response helper standar `{ success, message, data, meta }`
- Pagination: offset-based + cursor-based
- Timezone-aware Date Helper (WIB/WITA/WIT)
- Module alias (`@`, `@my_module`, `@root`)
- Library samples lengkap di `src/lib/samples/`

---

## Struktur Folder

```
src/
├── app.js                    # Entry point, middleware stack, graceful shutdown
├── config/
│   ├── config.js             # Sequelize database config (dev/test/prod)
│   ├── database.js           # Sequelize instance
│   ├── kafka.js              # Kafka producer & consumer factory
│   ├── logger.js             # Winston logger (error, warn, info)
│   ├── redis.js              # Redis singleton client
│   └── swaggerConfig.js      # Swagger JSDoc config
├── controllers/
│   ├── activityLogController.js
│   ├── appSettingController.js
│   ├── auditTrailController.js
│   ├── authController.js
│   ├── healthController.js
│   ├── listpermissionController.js
│   ├── mailController.js
│   ├── notificationController.js
│   ├── positionController.js
│   ├── profileController.js
│   ├── rolesController.js
│   └── usersController.js
├── cron/
│   └── index.js              # Registrasi semua cron job
├── database/
│   ├── migrations/           # Sequelize migrations (urut timestamp)
│   ├── models/               # Sequelize models
│   │   ├── activityLogModel.js
│   │   ├── appSettingModel.js
│   │   ├── associations.js   # Definisi relasi antar model
│   │   ├── audittrailModel.js
│   │   ├── emailServiceModel.js
│   │   ├── notificationModel.js
│   │   ├── permissionActionsModel.js
│   │   ├── permissionsModel.js
│   │   ├── positionModel.js
│   │   ├── resetPasswordModel.js
│   │   ├── rolesModel.js
│   │   └── usersModel.js
│   └── seeders/              # Data awal (roles, permissions, settings)
├── helpers/
│   └── helpers.js            # parseNumber, formatCurrency, parsePagination, dll
├── lib/
│   ├── samples/              # Contoh implementasi library (baca README di dalamnya)
│   │   ├── excel.sample.js
│   │   ├── httpClient.sample.js
│   │   ├── openai.sample.js
│   │   ├── pdf.sample.js
│   │   ├── upload.sample.js
│   │   └── utility.sample.js
│   ├── services/
│   │   ├── activityLogService.js   # Fire-and-forget activity logging
│   │   ├── appSettingService.js    # getAll(), get(), invalidate() dengan Redis cache
│   │   ├── emailService.js         # sendEmail, sendResetPasswordEmail, dst (config dari DB)
│   │   └── notificationService.js  # sendNotificationToUsers(), sendNotificationByFilter()
│   ├── socket.js             # Socket.io init, room management, online tracking
│   └── utils/
│       ├── dateHelper.js     # Timezone-aware: format, addDays, getDayRange, dll
│       ├── pagination.js     # offsetPagination + cursorPagination + buildCursorResponse
│       └── response.js       # success, created, error, badRequest, paginated, dll
├── middleware/
│   ├── abilities.js          # CASL defineAbilitiesFor + Redis cache + invalidateRoleCache
│   ├── auditTrailMiddleware.js
│   ├── authJwt.js            # JWT verify + Redis session cache + invalidateUserSession
│   ├── bruteForce.js         # checkBruteForce, recordFailedAttempt, resetAttempts
│   ├── checkAbility.js       # RBAC check per request
│   ├── errorHandler.js       # handle404Error, handleOtherErrors
│   ├── morganLogsEvent.js    # HTTP request logging
│   ├── requestId.js          # X-Request-ID header
│   ├── tenantMiddleware.js   # Pass-through stub (siap untuk multi-tenant)
│   ├── urlWhitelist.js       # Route publik yang skip auth & RBAC
│   └── validators/
│       ├── authValidator.js
│       ├── index.js          # validate() middleware runner
│       ├── mailValidator.js
│       ├── positionValidator.js
│       ├── roleValidator.js
│       └── userValidator.js
├── public/
│   ├── image/                # Gambar yang diupload
│   └── upload/               # File dokumen yang diupload
├── routes/
│   ├── api/
│   │   ├── activityLogRoute.js
│   │   ├── auditTrailRoute.js
│   │   ├── authRoute.js
│   │   ├── fileManagerRoute.js
│   │   ├── healthRoute.js
│   │   ├── listpermissionRoute.js
│   │   ├── mailRoute.js
│   │   ├── notificationRoute.js
│   │   ├── positionRoute.js
│   │   ├── profileRoute.js
│   │   ├── rolesRoute.js
│   │   ├── settingRoute.js
│   │   └── usersRoute.js
│   └── index.js              # Router utama (semua route di-mount di sini)
└── service/                  # (folder legacy, lihat lib/services/)
```

---

## Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd backend-boilerplate
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Wajib diisi di `.env`:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable | Keterangan |
|---|---|
| `JWT_SECRET` | Secret key JWT — **wajib** diganti |
| `SESSION_SECRET` | Secret key cookie session — **wajib** diganti |
| `ALLOWED_ORIGINS` | URL frontend, pisahkan koma jika lebih dari satu |
| `DEV_DB_*` | Konfigurasi database PostgreSQL |
| `REDIS_URL` | URL Redis (default: `redis://localhost:6379`) |
| `FRONTEND_URL` | URL frontend untuk link reset password |

### 3. Database Setup

```bash
# Jalankan semua migrasi
npm run db:migrate

# Isi data awal (roles, permissions, settings, email config)
npm run db:seed
```

### 4. Jalankan Server

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

Server akan berjalan di:
- API: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/health`
- Swagger: `http://localhost:3000/api-docs`

---

## API Reference

> Base URL: `/api/v1`  
> Semua endpoint (kecuali yang ditandai 🔓) membutuhkan header:  
> `Authorization: Bearer <token>`

### 🔓 Public (tanpa auth)

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/health` | Health check (DB, Redis, Kafka, memory) |
| `GET` | `/api-docs` | Swagger UI |
| `GET` | `/api/v1/settings/public` | App settings yang dipublikasi |

### Auth

| Method | Endpoint | Keterangan |
|---|---|---|
| `POST` | `/api/v1/login` | Login (email, password, mfaCode?) |
| `POST` | `/api/v1/logout` | Logout + invalidasi session |
| `POST` | `/api/v1/refreshtoken` | Perbarui JWT token |
| `POST` | `/api/v1/resetpassword` | Request link reset password via email |
| `POST` | `/api/v1/verifyreset` | Verifikasi token & set password baru |

### Master Data

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/data-users` | Daftar user (paginated, search, filter status) |
| `GET` | `/api/v1/data-users/additional-data` | Data tambahan untuk form (roles, positions, code) |
| `GET` | `/api/v1/data-users/:id` | Detail user |
| `POST` | `/api/v1/data-users` | Buat user baru |
| `PUT` | `/api/v1/data-users` | Update user |
| `DELETE` | `/api/v1/data-users/:id` | Hapus user (soft delete) |
| `GET` | `/api/v1/data-roles` | Daftar role |
| `GET` | `/api/v1/data-roles/:id` | Detail role + permissions |
| `POST` | `/api/v1/data-roles` | Buat role baru |
| `PUT` | `/api/v1/data-roles` | Update role + rebuild permissions |
| `DELETE` | `/api/v1/data-roles/:id` | Hapus role |
| `GET` | `/api/v1/positions` | Daftar jabatan |
| `GET` | `/api/v1/positions/:id` | Detail jabatan |
| `POST` | `/api/v1/positions` | Buat jabatan baru |
| `PUT` | `/api/v1/positions/:id` | Update jabatan |
| `DELETE` | `/api/v1/positions/:id` | Hapus jabatan |
| `GET` | `/api/v1/listpermission` | Katalog permission tersedia |

### Profile & MFA

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/profile` | Profil user yang sedang login |
| `PUT` | `/api/v1/profile/update` | Update nama, email, atau password |
| `POST` | `/api/v1/profile/mfa-setup` | Generate secret + QR code MFA |
| `PUT` | `/api/v1/profile/mfa-enable` | Aktifkan MFA (verifikasi token dulu) |
| `PUT` | `/api/v1/profile/mfa-disable` | Nonaktifkan MFA |

### Email Service

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/mail/config` | Daftar konfigurasi SMTP (password disensor) |
| `POST` | `/api/v1/mail/config` | Tambah konfigurasi SMTP |
| `PUT` | `/api/v1/mail/config/:id` | Update konfigurasi |
| `DELETE` | `/api/v1/mail/config/:id` | Hapus konfigurasi |
| `POST` | `/api/v1/mail/config/:id/activate` | Aktifkan konfigurasi ini |
| `POST` | `/api/v1/mail/test` | Test kirim email menggunakan config aktif |

### App Settings

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/settings` | Semua setting (admin) |
| `POST` | `/api/v1/settings` | Tambah setting baru |
| `PUT` | `/api/v1/settings/:key` | Update nilai setting |
| `DELETE` | `/api/v1/settings/:key` | Hapus setting |

### Notifikasi

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/notifications` | Daftar notifikasi user |
| `POST` | `/api/v1/notifications/mark-as-read` | Tandai satu sebagai dibaca |
| `POST` | `/api/v1/notifications/mark-all-read` | Tandai semua sebagai dibaca |
| `POST` | `/api/v1/notifications/clear` | Hapus semua notifikasi |

### File Manager

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/files` | List semua file (image + upload) dengan metadata |
| `DELETE` | `/api/v1/files/:folder/:filename` | Hapus file |

### System & Monitoring

| Method | Endpoint | Keterangan |
|---|---|---|
| `GET` | `/api/v1/audit-trails` | Log semua request (search, paginated) |
| `GET` | `/api/v1/activity-logs` | Riwayat aktivitas login semua user |
| `GET` | `/api/v1/activity-logs/me` | Riwayat aktivitas login milik sendiri |

---

## Redis Cache Strategy

| Data | Key Pattern | TTL |
|---|---|---|
| Session user | `session:user:{userId}` | 5 menit |
| CASL permission per role | `casl:role:{roleId}` | 10 menit |
| App settings | `app:settings` | 5 menit |
| Brute force counter | `brute:attempts:{email}` | 15 menit |
| Brute force lockout | `brute:lockout:{email}` | 30 menit |

Cache diinvalidasi otomatis saat:
- User logout / password berubah → `session:user:{id}` dihapus
- Role diupdate / dihapus → `casl:role:{id}` dihapus
- App setting diupdate → `app:settings` dihapus

---

## Socket.io Events

### Client → Server

| Event | Payload | Keterangan |
|---|---|---|
| `join` | `userId` | Masuk ke room notifikasi personal |
| `join_portal` | `{ userId, userName, role, currentPage }` | Daftar sebagai user online |

### Server → Client

| Event | Payload | Keterangan |
|---|---|---|
| `new_notification` | `{ title, message }` | Notifikasi baru |
| `update_online_status` | `{ total, users[] }` | Update daftar user online |

---

## Cron Jobs

| Job | Schedule | Keterangan |
|---|---|---|
| Purge soft-deleted users | `0 2 * * *` (jam 02:00) | Hapus permanen user yang soft-deleted > 30 hari |
| Purge expired reset tokens | `0 * * * *` (setiap jam) | Hapus token kadaluarsa / sudah dipakai |
| Purge old activity logs | `0 3 * * 0` (Minggu 03:00) | Hapus activity log > 90 hari |

Semua job menggunakan timezone `Asia/Jakarta`.

---

## Menambah Fitur Domain Baru

1. **Model** — buat di `src/database/models/namaModel.js`
2. **Migration** — buat di `src/database/migrations/` (format: `YYYYMMDDHHMMSS-create-nama.js`)
3. **Controller** — buat di `src/controllers/namaController.js`
4. **Validator** — buat di `src/middleware/validators/namaValidator.js`
5. **Route** — buat di `src/routes/api/namaRoute.js`
6. **Daftarkan** di `src/routes/index.js`
7. **Permission** — tambah entry di seeder `listpermission` jika butuh RBAC

### Contoh controller minimal

```js
'use strict';

const Model = require('@/database/models/namaModel');
const res_  = require('@/lib/utils/response.js');
const { parsePagination } = require('@/helpers/helpers');

const getList = async (req, res) => {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const count = await Model.count();
    const rows  = await Model.findAll({ limit, offset });
    return res_.paginated(res, rows, count, page, limit);
  } catch (err) {
    return res_.serverError(res, err.message);
  }
};

module.exports = { getList };
```

### Mengirim notifikasi dari controller

```js
const { sendNotificationToUsers } = require('@my_module/services/notificationService');

// Kirim ke user tertentu
await sendNotificationToUsers([userId1, userId2], 'Judul', 'Pesan', { data: 'tambahan' }, req.user.id);
```

### Menggunakan app setting di controller

```js
const { get } = require('@my_module/services/appSettingService');

const maxUpload = await get('max_upload_size_mb', 10); // default 10 jika tidak ada
const appName  = await get('app_name', 'My App');
```

---

## Library Samples

File contoh implementasi library tersedia di `src/lib/samples/`:

| File | Library |
|---|---|
| `httpClient.sample.js` | `axios`, `qs`, `form-data` |
| `excel.sample.js` | `exceljs`, `xlsx`, `adm-zip` |
| `pdf.sample.js` | `puppeteer`, `pdf-lib`, `ejs` |
| `openai.sample.js` | `openai` |
| `upload.sample.js` | `multer`, `mime-types`, `nanoid` |
| `utility.sample.js` | `dayjs`, `xml2js`, `tunnel-ssh`, `express-session` |

Baca `src/lib/samples/README.md` untuk contoh kode lengkap.

---

## Docker

```bash
# Build & jalankan
docker-compose up -d

# Jalankan migrasi di dalam container
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

---

## Default Credentials (Development Only)

> ⚠️ **Ganti sebelum deploy ke production!**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Dev@1234!` |

---

## Scripts

```bash
npm run dev            # Development dengan nodemon
npm start              # Production
npm run db:migrate     # Jalankan semua migration
npm run db:migrate:undo  # Rollback migration terakhir
npm run db:seed        # Jalankan semua seeder
npm run db:seed:undo   # Rollback semua seeder
```
