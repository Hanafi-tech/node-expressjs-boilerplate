'use strict';

const jwt     = require('jsonwebtoken');
const urlWhitelist = require('./urlWhitelist.js');
const Users   = require('@/database/models/usersModel.js');
const redis   = require('@/config/redis.js');

const SESSION_TTL = 60 * 5;
const sessionKey  = (userId) => `session:user:${userId}`;

const invalidateUserSession = async (userId) => {
  await redis.del(sessionKey(userId));
};

const authenticateToken = () => {
  return async (req, res, next) => {
    const subject = req.path.split('/')[1] || '';
    if (urlWhitelist.includes(subject)) return next();

    const authHeader = req.header('Authorization');

    // Token HANYA dari Authorization header — TIDAK dari query string
    // (token di URL ter-log di access log server, browser history, referer header)
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Coba ambil dari cache Redis
      const cached = await redis.get(sessionKey(decoded.id));
      if (cached) {
        try {
          req.user = JSON.parse(cached);
          return next();
        } catch {
          // Cache corrupt — lanjut ke DB
        }
      }

      // Ambil dari DB
      const user = await Users.findOne({ where: { id: decoded.id } });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      if (user.status !== 'active') {
        return res.status(401).json({ success: false, message: 'Your account is not active' });
      }
      if (user.refreshTokenExpiresAt && new Date() > new Date(user.refreshTokenExpiresAt)) {
        return res.status(401).json({ success: false, message: 'Session has expired. Please login again.' });
      }

      const userSession = {
        ...decoded,
        positionName: user.positionName,
        roleName:     user.roleName,
        status:       user.status,
      };

      await redis.set(sessionKey(decoded.id), JSON.stringify(userSession), SESSION_TTL);
      req.user = userSession;
      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token has expired.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
  };
};

module.exports = authenticateToken;
module.exports.invalidateUserSession = invalidateUserSession;
