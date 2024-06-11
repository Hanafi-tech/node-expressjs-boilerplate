require('dotenv').config();
require('module-alias/register');

const cron = require('node-cron');
const cors = require("cors");
const express = require('express')
const FileUpload = require('express-fileupload');
const router = require('./routes/index.js')
const bodyParser = require("body-parser")
const path = require('path');
const xssClean = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authenticateToken = require('./middleware/auth.js');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swaggerConfig.js');

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

app.use('/img', authenticateToken(['user', 'administrator']), express.static(path.join(__dirname, 'public', 'image')));
app.use("/api", router);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});