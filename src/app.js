require('dotenv').config();
require('module-alias/register');

const express = require('express');
const cron = require('node-cron');
const cors = require("cors");
const FileUpload = require('express-fileupload');
const router = require('./routes/index.js');
const bodyParser = require("body-parser");
const path = require('path');
const xssClean = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swaggerConfig.js');

const db = require('@/config/database.js');

const { handle404Error, handleOtherErrors } = require('@/middleware/errorHandler.js');
const authenticateToken = require('@/middleware/authJwt.js');
const checkAbility = require('@/middleware/checkAbility.js');
const { errorLogger, infoLogger } = require('./config/logger.js');
const { morganDevMiddleware, morganProdMiddleware } = require('@/middleware/morganLogsEvent.js');
const morganMiddleware = process.env.NODE_ENV === 'development' ? morganDevMiddleware : morganProdMiddleware;

db.authenticate().then(() => { infoLogger.info('Connection has been established to database.'); }).catch(err => { errorLogger.error(`Unable to connect to the database: ${err}`); });

// const hostname = process.env.HOSTNAME || '127.0.0.1';
const port = process.env.PORT || 3000;

const app = express();

// Konfigurasi rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // batasi setiap IP untuk 100 permintaan per windowMs
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi setelah 15 menit',
    standardHeaders: true, // Mengembalikan informasi rate limit dalam header `RateLimit-*`
    legacyHeaders: false, // Menonaktifkan header rate limit `X-RateLimit-*`
});

app.use(limiter);

app.use(
    cors({
        credentials: true,
        origin: "*",
    })
);

app.use(xssClean())

// app.use(helmet());
app.use(helmet.frameguard({ action: 'sameorigin' })); // X-Frame-Options
app.use(helmet.noSniff()); // X-Content-Type-Options
app.use(helmet.xssFilter()); // X-XSS-Protection

app.use(express.json()) // for parsing application/json
app.use(FileUpload())
app.use(bodyParser.urlencoded({ extended: true }))

// Cron job ini akan berjalan setiap menit
cron.schedule('* * * * *', () => {
    console.log('Running cron')
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/img', express.static(path.join(__dirname, 'public', 'image')));
app.use("/api", authenticateToken(), checkAbility, morganMiddleware, router);

// Middleware untuk menangani 404 error (URL tidak ditemukan) dan error 500
app.use(handle404Error);
app.use(handleOtherErrors);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    infoLogger.info(`Server running at http://localhost:${port}/`);
});