'use strict';

/**
 * SAMPLE: Utility Libraries (dayjs + xml2js + tunnel-ssh + express-session)
 * ──────────────────────────────────────────────────────────────────────────
 * dayjs         — manipulasi tanggal/waktu (ringan, API seperti moment.js)
 * xml2js        — parse XML → JS object, dan sebaliknya
 * tunnel-ssh    — akses DB atau service internal via SSH tunnel
 * express-session — alternatif cookie-session, simpan sesi di server
 */

// ─────────────────────────────────────────────────────────────────
// 1. DAYJS — manipulasi tanggal
// ─────────────────────────────────────────────────────────────────
const dayjs = require('dayjs');
require('dayjs/locale/id');        // locale Indonesia
const utc      = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const duration = require('dayjs/plugin/duration');
const relativeTime = require('dayjs/plugin/relativeTime');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.locale('id');

const DEFAULT_TZ = 'Asia/Jakarta';

/**
 * Helper dayjs yang sudah dikonfigurasi timezone Jakarta
 *
 * Contoh penggunaan:
 *   const { date } = require('@my_module/samples/utility.sample');
 *
 *   date.now()                          // '2026-07-25 14:30:00'
 *   date.format(someDate, 'DD MMMM YYYY')  // '25 Juli 2026'
 *   date.addDays('2026-07-25', 7)       // dayjs object +7 hari
 *   date.diffDays('2026-07-01', '2026-07-25') // 24
 *   date.fromNow('2026-07-20')          // '5 hari yang lalu'
 */
const date = {
  now:      (fmt = 'YYYY-MM-DD HH:mm:ss') => dayjs().tz(DEFAULT_TZ).format(fmt),
  today:    ()                             => dayjs().tz(DEFAULT_TZ).format('YYYY-MM-DD'),
  format:   (d, fmt = 'YYYY-MM-DD')       => dayjs(d).tz(DEFAULT_TZ).format(fmt),
  addDays:  (d, n)                         => dayjs(d).add(n, 'day'),
  addMonths:(d, n)                         => dayjs(d).add(n, 'month'),
  diffDays: (from, to)                     => dayjs(to).diff(dayjs(from), 'day'),
  fromNow:  (d)                            => dayjs(d).fromNow(),
  isAfter:  (d, ref)                       => dayjs(d).isAfter(dayjs(ref)),
  isBefore: (d, ref)                       => dayjs(d).isBefore(dayjs(ref)),
  startOfMonth: (d)                        => dayjs(d).startOf('month').format('YYYY-MM-DD'),
  endOfMonth:   (d)                        => dayjs(d).endOf('month').format('YYYY-MM-DD'),
};

// ─────────────────────────────────────────────────────────────────
// 2. XML2JS — parse XML dan build XML
// ─────────────────────────────────────────────────────────────────
const xml2js = require('xml2js');

/**
 * Parse XML string → JavaScript object
 *
 * const { parseXml } = require('@my_module/samples/utility.sample');
 *
 * const xml = `<user><name>Budi</name><role>admin</role></user>`;
 * const obj = await parseXml(xml);
 * // → { user: { name: ['Budi'], role: ['admin'] } }
 *
 * // Dengan explicitArray: false → nilai tidak dibungkus array:
 * // → { user: { name: 'Budi', role: 'admin' } }
 */
const parseXml = (xmlString, options = {}) => {
  const parser = new xml2js.Parser({ explicitArray: false, ...options });
  return parser.parseStringPromise(xmlString);
};

/**
 * Build XML dari JavaScript object
 *
 * const xml = buildXml({ user: { name: 'Budi', role: 'admin' } });
 * // → <?xml version="1.0"?><user><name>Budi</name><role>admin</role></user>
 */
const buildXml = (obj, options = {}) => {
  const builder = new xml2js.Builder({ xmldec: { version: '1.0', encoding: 'UTF-8' }, ...options });
  return builder.buildObject(obj);
};

/**
 * Contoh: controller yang terima XML dari external webhook
 *
 * const parseXmlWebhook = async (req, res) => {
 *   try {
 *     const rawXml = req.body; // perlu body-parser text: app.use(express.text({ type: 'application/xml' }))
 *     const data   = await parseXml(rawXml);
 *     return res.json({ parsed: data });
 *   } catch (err) {
 *     return res.status(400).json({ msg: 'XML tidak valid.' });
 *   }
 * };
 */

// ─────────────────────────────────────────────────────────────────
// 3. TUNNEL-SSH — koneksi ke DB via SSH jump server
// ─────────────────────────────────────────────────────────────────
/**
 * Berguna jika DB server hanya bisa diakses lewat bastion/jump host.
 *
 * const { createSshTunnel } = require('@my_module/samples/utility.sample');
 *
 * // Di app.js atau config/database.js, buka tunnel dulu sebelum Sequelize connect:
 * const tunnel = await createSshTunnel();
 * // Setelah tunnel aktif, Sequelize bisa connect ke localhost:DB_LOCAL_PORT
 *
 * Setup .env tambahan:
 *   SSH_HOST=bastion.example.com
 *   SSH_PORT=22
 *   SSH_USER=ubuntu
 *   SSH_PRIVATE_KEY_PATH=/home/user/.ssh/id_rsa
 *   SSH_DB_HOST=10.0.0.5          (IP DB di dalam network SSH)
 *   SSH_DB_PORT=5432
 *   SSH_LOCAL_PORT=15432          (port lokal yang di-forward)
 */
const createSshTunnel = async () => {
  const { createTunnel } = require('tunnel-ssh');
  const fs = require('fs');

  const tunnelOptions = {
    autoClose:  true,
  };

  const sshOptions = {
    host:       process.env.SSH_HOST,
    port:       parseInt(process.env.SSH_PORT || '22'),
    username:   process.env.SSH_USER,
    privateKey: fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH),
  };

  const forwardOptions = {
    srcAddr: '127.0.0.1',
    srcPort: parseInt(process.env.SSH_LOCAL_PORT || '15432'),
    dstAddr: process.env.SSH_DB_HOST,
    dstPort: parseInt(process.env.SSH_DB_PORT || '5432'),
  };

  const serverOptions = { port: parseInt(process.env.SSH_LOCAL_PORT || '15432') };

  const [server] = await createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions);
  console.log(`[ssh-tunnel] Aktif di port ${process.env.SSH_LOCAL_PORT}`);
  return server;
};

// ─────────────────────────────────────────────────────────────────
// 4. EXPRESS-SESSION — session di server (alternatif cookie-session)
// ─────────────────────────────────────────────────────────────────
/**
 * cookie-session (yang dipakai app.js) menyimpan data di cookie (client-side).
 * express-session menyimpan data di server (memori/Redis/DB).
 *
 * Kapan pakai express-session?
 * - Butuh store sesi di Redis (agar persist saat server restart)
 * - Butuh invalidasi sesi dari server
 * - Sesi berisi data besar (tidak cocok disimpan di cookie)
 *
 * Cara aktifkan (ganti cookie-session di app.js):
 *
 *   const session = require('express-session');
 *   // Opsional: simpan di Redis
 *   // const RedisStore = require('connect-redis').default;
 *   // const { getClient } = require('@/config/redis.js');
 *
 *   app.use(session({
 *     secret:            process.env.SESSION_SECRET,
 *     resave:            false,
 *     saveUninitialized: false,
 *     cookie: {
 *       secure:   process.env.NODE_ENV === 'production',
 *       httpOnly: true,
 *       sameSite: 'strict',
 *       maxAge:   24 * 60 * 60 * 1000, // 1 hari
 *     },
 *     // store: new RedisStore({ client: await getClient() }), // ← aktifkan untuk Redis store
 *   }));
 *
 * Penggunaan di controller:
 *   req.session.userId = user.id;          // simpan
 *   const uid = req.session.userId;        // baca
 *   req.session.destroy(() => { ... });    // hapus (logout)
 */
const getSessionMiddleware = (options = {}) => {
  const session = require('express-session');
  return session({
    secret:            process.env.SESSION_SECRET || 'change-me',
    resave:            false,
    saveUninitialized: false,
    cookie: {
      secure:   process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge:   options.maxAge || 24 * 60 * 60 * 1000,
    },
    ...options,
  });
};

module.exports = { date, parseXml, buildXml, createSshTunnel, getSessionMiddleware };
