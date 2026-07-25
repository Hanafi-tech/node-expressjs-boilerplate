'use strict';

/**
 * URL segments (path[1]) yang dikecualikan dari JWT auth, RBAC, dan audit trail.
 *
 * PENTING: entry di sini harus se-spesifik mungkin — hanya segment pertama setelah /api/v1/.
 * Jangan tambahkan kata generik seperti 'public', 'data', 'list' karena bisa
 * membypass auth untuk route lain yang kebetulan memiliki segment yang sama.
 *
 * Untuk route publik yang lebih kompleks (misal: GET /settings/public),
 * gunakan pendekatan middleware per-route di file route masing-masing.
 */
module.exports = [
  'login',
  'logout',
  'register',
  'resetpassword',
  'verifyreset',
  'refreshtoken',
];
