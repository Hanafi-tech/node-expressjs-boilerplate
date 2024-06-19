const { defineAbilitiesFor } = require('./abilities.js');
const accessControlConfig = require('@/config/casl/accessControl.js'); // Require untuk file konfigurasi
const urlWhitelist = require('./urlWhitelist.js');

const checkAbility = (req, res, next) => {
    console.log(req.path);
    if (urlWhitelist.includes(req.path)) {
        return next();
    }

    const userRole = req.user.role; // Mengasumsikan role pengguna tersedia di req.user.role
    const accessConfig = accessControlConfig[req.path];

    console.log(userRole);

    if (!accessConfig) {
        return res.status(404).json({ message: 'Access Control Not Found' }); // Jika konfigurasi akses tidak ditemukan
    }

    const { action, subject, allowedRoles } = accessConfig;

    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access Denied' });
    }

    const ability = defineAbilitiesFor(userRole);

    if (ability.can(action, subject)) {
        return next();
    } else {
        return res.status(403).json({ message: 'Access Denied. You do not have the required permissions.' });
    }
};

module.exports = checkAbility;