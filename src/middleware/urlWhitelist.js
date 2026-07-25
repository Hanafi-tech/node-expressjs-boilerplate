'use strict';

/**
 * URL segments yang dikecualikan dari JWT auth, RBAC check, dan audit trail.
 * Tambahkan route publik baru di sini.
 */
module.exports = [
  'login',
  'logout',
  'register',
  'resetpassword',
  'verifyreset',
  'refreshtoken',
  'plans',
  'public',   // GET /settings/public
];
