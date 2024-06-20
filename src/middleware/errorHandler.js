const { errorLogger, warnLogger } = require('@/config/logger');

const handle404Error = (req, res, next) => {
    const err = new Error('URL not found. Please check your request.');
    err.status = 404;
    const message = `[${req.method}] ${req.originalUrl} ${err.status} - ${err.message}`

    warnLogger.warn({
        message: message,
        metadata: {
            stack: 'No stack trace',
            method: req.method,
            url: req.originalUrl,
            status: 404
        }
    });

    res.status(404).json({
        message: message,
    });
};

const handleOtherErrors = (err, req, res, next) => {
    console.error(err.status);

    const status = err.status || 500;
    const message = `[${req.method}] ${req.originalUrl} ${err.status} - ${err.message || 'Something went wrong. Please try again later.'}`

    // Log the error
    errorLogger.error({
        message: message,
        metadata: {
            stack: err.stack || 'No stack trace',
            method: req.method,
            url: req.originalUrl,
            status: status
        }
    });

    // Respond with error status and message
    res.status(status).json({ message: message });
};

module.exports = { handle404Error, handleOtherErrors };