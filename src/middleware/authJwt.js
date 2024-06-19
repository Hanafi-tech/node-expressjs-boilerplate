const jwt = require('jsonwebtoken');
const urlWhitelist = require('./urlWhitelist.js');

const authenticateToken = () => {
    return (req, res, next) => {
        const noAuth = req.headers['x-no-authorization'];
        if (noAuth && urlWhitelist.includes(req.path) || !noAuth && urlWhitelist.includes(req.path)) {
            next();
        } else if (req.header('Authorization') && req.header('Authorization').split(' ')[0] === 'Bearer') {
            const token = req.header('Authorization')?.split(' ')[1] || req.query.token;
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    req.user = decoded;

                    next();
                } catch (err) {
                    if (err.name === 'TokenExpiredError') {
                        return res.status(401).json({ msg: 'Token has expired.' });
                    }

                    res.status(400).json({ msg: 'Invalid Token' });
                }
            } else {
                res.status(401).json({
                    status: false,
                    message: 'Token malformed',
                });
            }
        } else {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
    };
};

module.exports = authenticateToken;