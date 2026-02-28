import { body, validationResult } from 'express-validator';

export const validateUserRegistration = [
    body('username')
        .isString()
        .withMessage('Username must be a string')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters long'),
    body('email')
        .isEmail()
        .withMessage('Email must be a valid email address'),
    body('password')
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateUserUpdate = [
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be a valid email address'),
    body('password')
        .optional()
        .isString()
        .withMessage('Password must be a string')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateEventCreation = [
    body('title')
        .isString()
        .withMessage('Title must be a string')
        .isLength({ min: 1 })
        .withMessage('Title is required'),
    body('date')
        .isISO8601()
        .withMessage('Date must be a valid ISO 8601 date'),
    body('location')
        .isString()
        .withMessage('Location must be a string'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];