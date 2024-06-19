const { defineAbilitiesFor } = require('./abilities.js');
const urlWhitelist = require('./urlWhitelist.js');

const checkAbility = (req, res, next) => {
    if (urlWhitelist.includes(req.path)) {
        return next();
    }

    const userRole = req.user.role;
    const method = req.method.toLowerCase();
    let action;

    switch (method) {
        case 'get':
            action = 'read';
            break;
        case 'post':
            action = 'create';
            break;
        case 'put':
        case 'patch':
            action = 'update';
            break;
        case 'delete':
            action = 'delete';
            break;
        default:
            return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const ability = defineAbilitiesFor(userRole);
    const subject = req.path.split('/')[2] || req.path.split('/')[1];

    if (ability.can(action, subject.toLowerCase())) {
        return next();
    } else {
        return res.status(403).json({ message: 'Access Denied. You do not have the required permissions.' });
    }
};

module.exports = checkAbility;