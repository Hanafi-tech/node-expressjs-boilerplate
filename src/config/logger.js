'use strict';

const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

const isProd = process.env.NODE_ENV === 'production';

const fileTransport = (level, dirname) => new transports.DailyRotateFile({
  filename:    `${level}-%DATE%.log`,
  dirname:     `logs/${dirname}`,
  datePattern: 'YYYY-MM-DD',
  level,
  maxFiles:    '14d',
  zippedArchive: true,
});

const baseFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const makeLogger = (level, dirname) => {
  const logger = createLogger({
    level,
    format:      baseFormat,
    exitOnError: !isProd,
    defaultMeta: { service: 'app' },
    transports:  [fileTransport(level, dirname)],
  });

  if (!isProd) {
    logger.add(new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }));
  }

  return logger;
};

const errorLogger = makeLogger('error', 'error');
const warnLogger  = makeLogger('warn',  'warn');
const infoLogger  = makeLogger('info',  'info');

module.exports = { errorLogger, warnLogger, infoLogger };
