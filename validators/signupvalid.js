const { body, validationResult } = require('express-validator');

const validateRequest = [
    body('firstName').isLength({ min: 3, max: 20 }).trim().withMessage('First name must be between 3 and 20 characters'),
    body('lastName').isLength({ min: 3, max: 20 }).trim().withMessage('Last name must be between 3 and 20 characters'),
    body('userName').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateSignupRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
const validateSignInRequest = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateSignIn = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { validateRequest, validateSignupRequest,validateSignInRequest, validateSignIn };
