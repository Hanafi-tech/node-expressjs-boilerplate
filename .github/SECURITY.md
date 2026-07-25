# Security Policy

## Versi yang Didukung

| Versi | Didukung |
|---|---|
| 2.x.x | ✅ Ya |
| 1.x.x | ❌ Tidak — upgrade ke v2 |

## Melaporkan Kerentanan

Jika Anda menemukan celah keamanan, **jangan buat GitHub Issue publik**.

Laporkan secara privat melalui:
- **GitHub Security Advisories** — [Report a vulnerability](../../security/advisories/new)
- **Email** — hanzcreative1@gmail.com

### Yang perlu disertakan dalam laporan:
1. Deskripsi kerentanan dan dampaknya
2. Langkah-langkah untuk mereproduksi
3. Versi yang terdampak
4. Saran perbaikan (jika ada)

### Proses penanganan:
- Laporan akan direspons dalam **3 hari kerja**
- Fix akan dirilis dalam **14 hari** untuk kerentanan kritis
- Reporter akan dicantumkan di CHANGELOG (jika bersedia)

## Security Features

Boilerplate ini sudah menerapkan:

| Fitur | Status |
|---|---|
| Helmet (15 HTTP security headers) | ✅ Aktif |
| CORS strict (whitelist origin) | ✅ Aktif |
| Rate limiting (per IP) | ✅ Aktif |
| Brute force protection (per email, via Redis) | ✅ Aktif |
| XSS protection (`xss-clean`) | ✅ Aktif |
| JWT + Refresh Token | ✅ Aktif |
| MFA (TOTP + Backup Codes) | ✅ Aktif |
| Password hashing (bcryptjs, cost 10) | ✅ Aktif |
| Session secure (httpOnly, sameSite, secure) | ✅ Aktif |
| Redis session cache + invalidasi | ✅ Aktif |
| Soft delete (data tidak langsung hilang) | ✅ Aktif |
| Audit trail semua request | ✅ Aktif |
| Activity log login history | ✅ Aktif |
| Reset password single-use token | ✅ Aktif |
| Path traversal protection (file manager) | ✅ Aktif |
| Graceful shutdown | ✅ Aktif |
| Secret scanning (GitHub) | ✅ Aktif |
| Dependabot alerts | ✅ Aktif |
| CodeQL analysis | ✅ Aktif |
