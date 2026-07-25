# Changelog

Semua perubahan penting pada project ini akan didokumentasikan di file ini.

Format mengacu pada [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [2.0.0] — 2026-07-25

> **Major Release** — Versi ini adalah penulisan ulang menyeluruh dari `v1.0.0`.  
> Tidak backward-compatible. Baca [Upgrade Guide](#upgrade-dari-v100-ke-v200) sebelum migrasi.

---

### ✨ Fitur Baru

#### Auth & Keamanan
- **MFA (Multi-Factor Authentication)** — TOTP via Google Authenticator + 10 backup codes single-use
- **Brute Force Protection** — lockout per email via Redis counter (configurable: max attempts, window, lockout duration)
- **Activity Log** — rekam setiap `login_success`, `login_failed`, `login_mfa_required`, `logout`, `password_reset`, `token_refresh` beserta IP address & user agent
- **Reset password via tabel terpisah** (`reset_passwords`) — token single-use dengan field `usedAt`, auto-purge via cron
- **Request ID Middleware** — setiap request mendapat header `X-Request-ID` unik untuk tracing
- **Session secure** — cookie-session dengan `httpOnly`, `secure` (production), `sameSite: strict`
- **Session Secret wajib dari env** — throw error saat startup jika `SESSION_SECRET` tidak diset

#### RBAC
- **Permission dinamis dari DB** — tidak lagi dari file JSON statis; bisa diubah runtime tanpa restart
- **CRUD Role & Permission** via API — create, update, delete role + rebuild permissions
- **CRUD Jabatan (Positions)** via API — lengkap dengan validasi "jabatan masih dipakai user"
- **List Permission** — katalog fitur tersedia di DB, digunakan sebagai referensi UI form permission
- **Redis cache CASL** — permission di-cache 10 menit per `roleId`, invalidasi otomatis saat role diupdate

#### Email Service
- **Konfigurasi SMTP dari DB** — tidak lagi dari `mailConfig.json`; bisa diubah via API tanpa restart
- **Multiple config** — simpan beberapa konfigurasi, aktifkan salah satu
- **CRUD Email Config** — create, update, delete, activate
- **Endpoint test kirim email** — `POST /api/v1/mail/test` dengan response detail config + status
- **Template modular** — `sendResetPasswordEmail()`, `sendVerificationEmail()` siap pakai

#### Infrastruktur
- **Redis** — cache session user (5 menit), CASL permission (10 menit), app settings (5 menit)
- **Socket.io** — push notifikasi realtime ke room user + tracking user online
- **Kafka** — producer + `createConsumer()` factory, broker dari env (support multi-broker)
- **Health Check** — `GET /health` (publik): status DB, Redis, Kafka, memory usage + uptime
- **Graceful Shutdown** — handle `SIGTERM`/`SIGINT`: tutup HTTP → DB → Redis → Kafka secara berurutan, force exit 15 detik
- **Cron Jobs** aktif:
  - Purge soft-deleted users > 30 hari (jam 02:00 WIB)
  - Purge expired/used reset tokens (setiap jam)
  - Purge activity logs > 90 hari (tiap Minggu jam 03:00 WIB)

#### API & Developer Experience
- **API Versioning** — semua route pindah ke `/api/v1/`
- **Swagger JSDoc** — auto-scan dari route annotations, schema reusable (`SuccessResponse`, `ErrorResponse`, `PaginatedResponse`)
- **Response helper standar** (`lib/utils/response.js`) — `success()`, `created()`, `badRequest()`, `notFound()`, `paginated()`, dll
- **Cursor-based Pagination** (`lib/utils/pagination.js`) — efisien untuk dataset besar, tidak ada page drift
- **Offset Pagination helper** — `parsePagination()` terpusat, bukan manual di tiap controller
- **Timezone-aware Date Helper** (`lib/utils/dateHelper.js`) — support WIB/WITA/WIT: `format()`, `addDays()`, `getDayRange()`, `getMonthRange()`
- **App Settings** — key-value config di DB dengan type parsing otomatis (`string`, `number`, `boolean`, `json`); endpoint public tanpa auth
- **File Manager** — `GET /api/v1/files` (list + metadata) dan `DELETE /api/v1/files/:folder/:filename` (proteksi path traversal)
- **Audit Trail** — log otomatis semua request ke DB (method, endpoint, user, body, query, params)
- **Notifikasi** — CRUD notifikasi (list, mark read, mark all read, clear) + service `sendNotificationToUsers()`
- **Profile & MFA Management** — endpoint lengkap: get profile, update, mfa-setup, mfa-enable, mfa-disable
- **Library Samples** (`src/lib/samples/`) — 6 file contoh siap pakai: excel, pdf, AI/OpenAI, upload, HTTP client, utility

---

### 🔄 Breaking Changes

| Yang Berubah | v1.0.0 | v2.0.0 |
|---|---|---|
| Base URL API | `/api/route` | `/api/v1/route` |
| Response format | `{ message, msg }` campur | `{ success, message, data, meta }` konsisten |
| RBAC sumber | `abilities.json` (file statis) | Database (dinamis) |
| CASL action `update` | `update` | `edit` (konsisten dengan HTTP PUT) |
| Email config | `mailConfig.json` | Tabel `email_services` di DB |
| Reset password storage | Kolom di tabel `users` | Tabel `reset_passwords` terpisah |
| Reset password result | Password direset ke `'12345'` | User set password baru sendiri |
| Logout | Butuh `refreshToken` di body | Cukup JWT, invalidasi via Redis |
| Model naming | `PascalCase` (`UsersModel`) | `camelCase` (`usersModel`) |
| Table naming | `PascalCase` (`Users`) | `snake_case` (`users`) |
| Controller method naming | `PascalCase` (`Login`, `Logout`) | `camelCase` (`login`, `logout`) |
| Controller struktur | `controllers/masterdata/`, `controllers/settings/` | Flat di `controllers/` |
| Route struktur | `routes/api/masterdata/`, `routes/api/settings/` | Flat di `routes/api/` |
| Validation | Tidak terpasang di route | Terpasang via `validate()` middleware |
| CORS | `origin: "*"` | `origin` dari `ALLOWED_ORIGINS` env |
| Helmet | Partial (3 dari 15 proteksi) | Full `helmet()` |

---

### 🗃️ Model Baru

| Model | Tabel | Keterangan |
|---|---|---|
| `activityLogModel` | `activity_logs` | Riwayat aktivitas login user |
| `appSettingModel` | `app_settings` | Key-value config aplikasi |
| `audittrailModel` | `audittrails` | Log semua request API |
| `emailServiceModel` | `email_services` | Konfigurasi SMTP (ganti `mailConfig.json`) |
| `notificationModel` | `notifications` | Notifikasi realtime |
| `permissionsModel` | `rolepermissions` | Permission per role |
| `permissionActionsModel` | `rolepermissionactions` | Action (read/create/edit/delete) per subject |
| `resetPasswordModel` | `reset_passwords` | Token reset password (ganti kolom di users) |
| `rolesModel` | `roles` | Role dinamis |
| `listpermisionModel` | `listpermission` | Katalog fitur untuk UI |
| `positionModel` | `positions` | Jabatan/posisi user |

---

### 🗑️ Dihapus

| Yang Dihapus | Alasan |
|---|---|
| `config/mailConfig.json` | Digantikan oleh tabel `email_services` di DB |
| `config/nodemailer.js` | Logic dipindah ke `lib/services/emailService.js` |
| `config/casl/abilities.json` | Digantikan oleh permission dinamis dari DB |
| `config/custom-rotate-file.js` | Digantikan `winston-daily-rotate-file` langsung |
| `config/openai.js` | Dipindah sebagai sample di `lib/samples/openai.sample.js` |
| `config/axiosInstance.js` | Dipindah sebagai sample di `lib/samples/httpClient.sample.js` |
| Kolom `resetPasswordToken` di `users` | Dipindah ke tabel `reset_passwords` |
| Kolom `resetPasswordExpiresAt` di `users` | Dipindah ke tabel `reset_passwords` |
| `controllers/masterdata/` subfolder | Di-flatten ke `controllers/` |
| `controllers/settings/` subfolder | Di-flatten ke `controllers/` |
| `routes/api/masterdata/` subfolder | Di-flatten ke `routes/api/` |
| `routes/api/settings/` subfolder | Di-flatten ke `routes/api/` |
| `service/` folder | Dipindah ke `lib/services/` |
| `lib/browser.js` | Dipindah sebagai sample di `lib/samples/pdf.sample.js` |
| `lib/pdftemplate/` | Dipindah sebagai sample di `lib/samples/templates/` |
| `lib/validations/` | Dipindah ke `middleware/validators/` |
| `middleware/abilitiesbkp.js` | File backup dihapus |

---

### 🛠️ Perbaikan Bug & Security

| Bug / Issue | Status |
|---|---|
| CORS `credentials: true` + `origin: "*"` — browser modern menolak & risiko CSRF | ✅ Fixed |
| `cookieSession` keys hardcode `'your_secret_key'` | ✅ Fixed — baca dari `SESSION_SECRET` env |
| Password reset hardcode ke `'12345'` | ✅ Fixed — user set password baru |
| `req.user.position` vs `positionName` mismatch — crash di checkAbility | ✅ Fixed |
| JWT token hanya di-verify signature tanpa validasi ke DB | ✅ Fixed — query DB + Redis cache |
| Helmet partial — hanya 3 header security | ✅ Fixed — `helmet()` penuh |
| Port DB didefinisikan 2x di `database.js` | ✅ Fixed |
| Kafka hardcode IP `172.22.0.3:9092` | ✅ Fixed — baca dari `KAFKA_BROKERS` env |
| Socket.io CORS `origin: "*"` | ✅ Fixed — ikut `ALLOWED_ORIGINS` env |
| Seeder roles domain-spesifik (sales, cheker, approval) | ✅ Fixed — generic: admin, staff, viewer |
| Demo user password `'123'` | ✅ Fixed — `Dev@1234!` dengan instruksi ganti |
| `'use strict'` tidak konsisten di semua file | ✅ Fixed |
| Indentasi campur 4 spasi dan 2 spasi | ✅ Fixed — 2 spasi konsisten |
| Response format campur `{ msg }` dan `{ message }` | ✅ Fixed — satu helper standar |
| Naming controller method PascalCase (`Login`) di JS | ✅ Fixed — camelCase (`login`) |
| Circular dependency potensial `authController` ↔ `authJwt` | ✅ Fixed |
| `formatRupiah` (domain-spesifik) di helpers | ✅ Fixed — diganti `formatCurrency` (generic) |
| `isMissing()` nama tidak deskriptif | ✅ Fixed — diganti `isEmpty()` |
| `getLogoPath()` terlalu domain-spesifik | ✅ Fixed — diganti `getImagePath()` |
| `auditTrailMiddleware` tidak handle POST description dengan benar | ✅ Fixed |
| `notificationController` `markAsRead` tidak filter by `user_id` — bisa baca notif user lain | ✅ Fixed |
| Cron job `'* * * * *'` tiap menit tanpa fungsi nyata | ✅ Fixed — 3 job bermakna |

---

### 📦 Dependencies Baru

```
adm-zip          ^0.5.16   ZIP/unzip file
bcrypt           ^5.1.1    (kompatibilitas, utama: bcryptjs)
body-parser      ^2.2.1    URL-encoded body parsing
cookie-session   ^2.1.0    Secure session management
dayjs            ^1.11.11  Manipulasi tanggal ringan
ejs              ^3.1.10   Template engine untuk PDF
exceljs          ^4.4.0    Generate Excel dengan style
express-session  ^1.18.0   Alternatif session store (tersedia sebagai sample)
form-data        ^4.0.0    Multipart HTTP client
kafkajs          ^2.2.4    Message queue
mime-types       ^3.0.1    Deteksi MIME type
multer           ^1.4.5    File upload alternatif (tersedia sebagai sample)
nanoid           ^5.1.5    Generate unique ID
openai           ^6.48.0   OpenAI/LLM integration (tersedia sebagai sample)
otpauth          ^9.4.1    TOTP untuk MFA
pdf-lib          ^1.17.1   Manipulasi PDF (tersedia sebagai sample)
puppeteer        ^24.10.0  Headless Chrome untuk PDF (tersedia sebagai sample)
qrcode           ^1.5.4    Generate QR code setup MFA
qs               ^6.12.1   Query string serializer
redis            ^4.7.0    Cache client
socket.io        ^4.8.3    Realtime WebSocket
tunnel-ssh       ^5.2.0    SSH tunnel untuk DB (tersedia sebagai sample)
winston-transport ^4.7.0   Winston transport helper
xlsx             ^0.18.5   Parse Excel untuk import (tersedia sebagai sample)
xml2js           ^0.6.2    Parse XML (tersedia sebagai sample)
```

---

### ⚙️ Environment Variables Baru

```bash
# Session (WAJIB — throw error jika kosong)
SESSION_SECRET=

# CORS (pisahkan koma untuk multiple origin)
ALLOWED_ORIGINS=http://localhost:5173

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_ENABLE=false
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=backend-boilerplate

# App
APP_NAME=Backend Boilerplate

# Brute Force
LOGIN_MAX_ATTEMPTS=5
LOGIN_WINDOW_SECONDS=900
LOGIN_LOCKOUT_SECONDS=1800
```

---

### 🚀 Upgrade dari v1.0.0 ke v2.0.0

1. **Update base URL** semua request dari `/api/` ke `/api/v1/`

2. **Generate secret baru**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  # JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # SESSION_SECRET
   ```

3. **Jalankan migrasi baru**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Pindahkan konfigurasi SMTP** dari `mailConfig.json` ke DB via:
   ```
   POST /api/v1/mail/config
   ```

5. **Rebuild permission** via API karena sumber berubah dari JSON ke DB:
   ```
   POST /api/v1/data-roles  (buat ulang role + permission)
   ```

6. **Update response handler** di frontend — format berubah dari `{ message, msg }` ke `{ success, message, data, meta }`

7. **Hapus variabel env lama** yang tidak dipakai:  
   `URL_PDF`, `URL_IREPORTER`, `URL_SMAPV3`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`

---

## [1.0.0] — 2024-06-20

> Versi awal. Lihat repo GitHub: `node-expressjs-boilerplate`

### Fitur
- Auth dasar: Login, Logout, Refresh Token, Reset Password
- RBAC via CASL (permission dari file JSON statis)
- Email service (config dari `mailConfig.json`)
- Winston logging (error, warn, info + daily rotate)
- Morgan HTTP request log
- Swagger UI (manual definition)
- Rate limiting
- XSS protection, Helmet (partial)
- Sequelize ORM + PostgreSQL/MySQL
