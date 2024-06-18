const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const fs = require('fs');
const path = require('path');
const { redBright, blue, yellow } = require('colorette');
const moment = require('moment');

morgan.token('email', (req) => (req.user ? req.user.email : 'Not Authenticated'));

const statusColor = (status) => {
    const statusNumber = parseInt(status, 10);
    if (statusNumber >= 500) return redBright(status);
    if (statusNumber >= 400) return yellow(status);
    return status; // Default color for other statuses
};

const logDirectory = path.join(__dirname, '../logs');
const httpLogDirectory = path.join(logDirectory, 'http');

// Ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
fs.existsSync(httpLogDirectory) || fs.mkdirSync(httpLogDirectory);

// Function to generate a daily rotating stream with formatted date
const createDailyRotateStream = (filename) => {
    return rfs.createStream((time, index) => {
        if (!time) return filename; // filename-%DATE%.log
        const today = moment().format('DD-MM-YYYY');
        return `http-request[${today}].log`;
    }, {
        interval: '1d', // rotate daily
        path: httpLogDirectory,
        compress: 'gzip', // compress rotated files
        maxSize: '5M', // max size per file
    });
};

// Morgan middleware for development environment
const morganDevMiddleware = morgan(
    `[HTTP]: ${redBright(':date[web]')} >>> [:email] ${blue('[:method]')} ${yellow(':url')} (${statusColor(':status')}) - :response-time ms`
);

// Morgan middleware for production environment
const morganProdMiddleware = morgan(
    '[:date[clf]] [:email] [:method] :url (:status) - :response-time ms',
    {
        stream: createDailyRotateStream('http-request.log'),
    }
);

module.exports = {
    morganDevMiddleware,
    morganProdMiddleware,
};
