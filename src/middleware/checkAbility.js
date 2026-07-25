'use strict';

const { defineAbilitiesFor } = require('./abilities.js');
const urlWhitelist = require('./urlWhitelist.js');
const { errorLogger } = require('@/config/logger.js');

const checkAbility = async (req, res, next) => {
  const subject = req.path.split('/')[1] || req.path.split('/')[2];

  if (urlWhitelist.includes(subject)) return next();

  // Gunakan positionName sebagai superadmin check (isSuperAdmin dihapus dari model)
  const userPosition = (req.user?.positionName || '').toLowerCase();
  if (userPosition === 'superadmin') return next();

  const method = req.method.toLowerCase();
  let action;

  switch (method) {
    case 'get':    action = 'read';   break;
    case 'post':   action = 'create'; break;
    case 'put':
    case 'patch':  action = 'edit';   break;
    case 'delete': action = 'delete'; break;
    default:
      return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const ability = await defineAbilitiesFor(userPosition, req.user);
    if (ability.can(action, subject.toLowerCase())) return next();
    return res.status(403).json({ success: false, message: 'Access Denied. You do not have the required permissions.' });
  } catch (err) {
    // Jangan ekspos detail error ke client
    errorLogger.error(`[checkAbility] Error: ${err.message}`, { userId: req.user?.id, subject, action });
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memverifikasi akses.' });
  }
};

module.exports = checkAbility;
