'use strict';

require('dotenv').config();
require('module-alias/register');
require('@/database/models/associations.js')();

const express    = require('express');
const cors       = require('cors');
const FileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path       = require('path');
const xssClean   = require('xss-clean');
const helmet     = require('helmet');
const cookieSession = require('cookie-session');
const rateLimit  = require('express-rate-limit');
const swaggerUi  = require('swagger-ui-express');
const swaggerDocument = require('@/config/swaggerConfig.js');
const http = require('http');

const db     = require('@/config/database.js');
const router = require('@/routes/index.js');

const { handle404Error, handleOtherErrors } = require('@/middleware/errorHandler.js');
const authenticateToken = require('@/middleware/authJwt.js');
const checkAbility      = require('@/middleware/checkAbility.js');
const requestId         = require('@/middleware/requestId.js');
const { errorLogger, infoLogger } = require('@/config/logger.js');
const { morganDevMiddleware, morganProdMiddleware } = require('@/middleware/morganLogsEvent.js');
const { runCron }    = require('@/cron/index.js');
const { initSocket } = require('@/lib/socket.js');
const { getClient: initRedis } = require('@/config/redis.js');
const { check: healthCheck } = require('@/controllers/healthController.js');
const { getPublicSettings }  = require('@/routes/api/settingRoute.js');

const port = process.env.PORT || 3000;
const morganMiddleware = process.env.NODE_ENV === 'development' ? morganDevMiddleware : morganProdMiddleware;

// ── DB Connection ─────────────────────────────────────────────────
db.authenticate()
  .then(() => infoLogger.info('Database connection established.'))
  .catch(err => errorLogger.error(`Unable to connect to database: ${err}`));

const app    = express();
const server = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────
initSocket(server);

// ── Trust Proxy ───────────────────────────────────────────────────
app.set('trust proxy', 1);

// ── Request ID ────────────────────────────────────────────────────
app.use(requestId);

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  credentials: true,
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
}));

// ── Rate Limiting (global) ────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders:   false,
}));

// ── Session ───────────────────────────────────────────────────────
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || (() => { throw new Error('SESSION_SECRET wajib diset di .env'); })()],
  maxAge:   24 * 60 * 60 * 1000,
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict',
}));

// ── Security Headers ──────────────────────────────────────────────
app.use(xssClean());
app.use(helmet());

// ── Body Parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(FileUpload({ limits: { fileSize: 10 * 1024 * 1024 }, abortOnLimit: true }));

// ── Static Files ──────────────────────────────────────────────────
app.use('/file', express.static(path.join(__dirname, 'public', 'upload')));
app.use('/img',  express.static(path.join(__dirname, 'public', 'image')));

// ── Cron Jobs ─────────────────────────────────────────────────────
runCron();

// ── Public Routes (TANPA auth) ────────────────────────────────────
app.get('/health', healthCheck);
app.get('/api/v1/settings/public', getPublicSettings);   // dikecualikan dari auth
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ── API Routes (dengan auth + RBAC + versioning) ──────────────────
app.use('/api/v1', authenticateToken(), checkAbility, morganMiddleware, router);

// ── Error Handlers ────────────────────────────────────────────────
app.use(handle404Error);
app.use(handleOtherErrors);

// ── Start Server ──────────────────────────────────────────────────
server.listen(port, async () => {
  await initRedis();

  if (process.env.KAFKA_ENABLE === 'true') {
    const { producer } = require('@/config/kafka.js');
    await producer.connect();
  }

  console.log(`Server     → http://localhost:${port}/`);
  console.log(`Health     → http://localhost:${port}/health`);
  console.log(`Swagger    → http://localhost:${port}/api-docs`);
  console.log(`API        → http://localhost:${port}/api/v1`);
  infoLogger.info(`Server running at http://localhost:${port}/`);
});

// ── Graceful Shutdown ─────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n[${signal}] Graceful shutdown dimulai...`);
  infoLogger.info(`[${signal}] Graceful shutdown initiated`);

  server.close(async () => {
    try { await db.close();   console.log('[shutdown] Database closed'); }
    catch (e) { errorLogger.error(`[shutdown] DB error: ${e.message}`); }

    try {
      const { getClient } = require('@/config/redis.js');
      const redisClient = await getClient();
      await redisClient.quit();
      console.log('[shutdown] Redis closed');
    } catch (e) { errorLogger.error(`[shutdown] Redis error: ${e.message}`); }

    if (process.env.KAFKA_ENABLE === 'true') {
      try {
        const { producer } = require('@/config/kafka.js');
        await producer.disconnect();
        console.log('[shutdown] Kafka disconnected');
      } catch (e) { errorLogger.error(`[shutdown] Kafka error: ${e.message}`); }
    }

    infoLogger.info('[shutdown] All connections closed. Exiting.');
    process.exit(0);
  });

  setTimeout(() => {
    errorLogger.error('[shutdown] Force exit setelah 15 detik timeout');
    process.exit(1);
  }, 15000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException',  (err) => { errorLogger.error(`uncaughtException: ${err.message}`, { stack: err.stack }); process.exit(1); });
process.on('unhandledRejection', (reason) => { errorLogger.error(`unhandledRejection: ${reason}`); });
