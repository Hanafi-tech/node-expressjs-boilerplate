const { body, validationResult } = require('express-validator');

const validateUsers = [
    body('name').notEmpty().withMessage('Name is required'),
    body('status').notEmpty().withMessage('Status is required').isIn(['active', 'not-active']).withMessage('Status must be either "active" or "not-active"'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = validateUsers;
