const accessControlConfig = {
    '/mail': { action: 'read', subject: 'Mail', allowedRoles: ['administrator'] },
    '/articles': { action: 'read', subject: 'Article', allowedRoles: ['administrator', 'editor', 'user', 'guest'] },
    '/articles/create': { action: 'create', subject: 'Article', allowedRoles: ['administrator', 'editor'] },
    '/articles/update': { action: 'update', subject: 'Article', allowedRoles: ['administrator', 'editor'] },
    '/articles/delete': { action: 'delete', subject: 'Article', allowedRoles: ['administrator', 'editor'] },
    '/comments': { action: 'read', subject: 'Comment', allowedRoles: ['administrator', 'editor', 'user', 'guest'] },
    '/comments/create': { action: 'create', subject: 'Comment', allowedRoles: ['user'] },
    '/comments/update': { action: 'update', subject: 'Comment', allowedRoles: ['administrator', 'editor', 'user'] },
    '/comments/delete': { action: 'delete', subject: 'Comment', allowedRoles: ['administrator', 'editor', 'user'] }
};

module.exports = accessControlConfig;