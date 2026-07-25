'use strict';
const { defineAbilitiesFor } = require('./abilities.js');
const urlWhitelist = require('./urlWhitelist.js');

const checkAbility = async (req, res, next) => {
  const subject = req.path.split('/')[1] || req.path.split('/')[2];

  if (urlWhitelist.includes(subject)) {
    return next();
  }

  // Super admin platform melewati RBAC
  if (req.user && req.user.isSuperAdmin) {
    return next();
  }

  // Gunakan positionName (konsisten dengan JWT payload)
  const userPosition = (req.user.positionName || req.user.position || '').toLowerCase();
  if (userPosition === 'superadmin') {
    return next();
  }

  const method = req.method.toLowerCase();
  let action;

  switch (method) {
    case 'get':    action = 'read';   break;
    case 'post':   action = 'create'; break;
    case 'put':
    case 'patch':  action = 'edit';   break;
    case 'delete': action = 'delete'; break;
    default:
      return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const ability = await defineAbilitiesFor(userPosition, req.user);
    if (ability.can(action, subject.toLowerCase())) {
      return next();
    }
    return res.status(403).json({ message: 'Access Denied. You do not have the required permissions.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error defining abilities', error: error.message });
  }
};

module.exports = checkAbility;
