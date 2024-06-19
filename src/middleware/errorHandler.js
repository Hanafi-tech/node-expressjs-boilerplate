const handle404Error = (req, res, next) => {
    res.status(404).json({
        message: 'URL not found. Please check your request.'
    });
};

const handleOtherErrors = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong. Please try again later.'
    });
};

module.exports = { handle404Error, handleOtherErrors };