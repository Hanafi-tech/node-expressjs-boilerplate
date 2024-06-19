const fs = require('fs');
const { createMongoAbility, AbilityBuilder } = require('@casl/ability');
const path = require('path');
const roleConfigPath = path.resolve(__dirname, '..', 'config', 'casl', 'abilities.json');
const rolesData = JSON.parse(fs.readFileSync(roleConfigPath, 'utf8'));

const defineAbilitiesFor = (role, user) => {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
    const rolePermissions = rolesData[role] || rolesData['guest']; // Default ke 'guest' jika role tidak ditemukan

    if (rolePermissions) {
        rolePermissions.can.forEach(permission => {
            if (permission.conditions) {
                can(permission.action, permission.subject, permission.conditions);
            } else {
                can(permission.action, permission.subject);
            }
        });

        rolePermissions.cannot.forEach(permission => {
            cannot(permission.action, permission.subject);
        });
    } else {
        can('read', 'public');
    }

    return build();
};

module.exports = { defineAbilitiesFor };