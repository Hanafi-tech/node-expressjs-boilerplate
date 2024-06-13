const jwt = require('jsonwebtoken');

const authenticateToken = (roles) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.split(' ')[1] || req.query.token;

        if (req.header('Authorization')?.split(' ')[0] !== 'Bearer') {
            res.status(400).json({ msg: 'Invalid Token' });
        }

        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ganti dengan secret key Anda
            req.user = decoded;

            // Periksa apakah role user ada dalam daftar role yang diperbolehkan
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
            }

            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ msg: 'Token has expired.' });
            }

            res.status(400).json({ msg: 'Invalid Token' });
        }
    }
};

module.exports = authenticateToken;