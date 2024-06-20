const { createLogger, format, transports } = require('winston');
const CustomRotateFile = require('./custom-rotate-file');

// Logger untuk error
const errorLogger = createLogger({
    level: 'error',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
    ),
    exitOnError: (process.env.NODE_ENV !== 'production'),
    defaultMeta: { service: 'user-service' },
    transports: [
        new CustomRotateFile({
            filename: 'error-%DATE%.log',
            dirname: 'logs/error',
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxFiles: 14
        })
    ]
});

// Logger untuk warn
const warnLogger = createLogger({
    level: 'warn',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.colorize(),
        format.simple()
    ),
    exitOnError: (process.env.NODE_ENV !== 'production'),
    defaultMeta: { service: 'user-service' },
    transports: [
        new CustomRotateFile({
            filename: 'warn-%DATE%.log',
            dirname: 'logs/warn',
            datePattern: 'YYYY-MM-DD',
            level: 'warn',
            maxFiles: 14
        })
    ]
});

// Logger untuk info
const infoLogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        // format.colorize(),
        format.simple()
    ),
    exitOnError: (process.env.NODE_ENV !== 'production'),
    defaultMeta: { service: 'user-service' },
    transports: [
        new CustomRotateFile({
            filename: 'info-%DATE%.log',
            dirname: 'logs/info',
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            maxFiles: 14
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    // Tambahkan transport console untuk lingkungan non-produksi
    errorLogger.add(new transports.Console());
    warnLogger.add(new transports.Console());
    infoLogger.add(new transports.Console());
}

module.exports = {
    errorLogger,
    warnLogger,
    infoLogger
};
