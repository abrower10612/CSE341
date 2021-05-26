const express = require('express');

const { check, body } = require('express-validator/check');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post(
    '/login', 
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .normalizeEmail(),
        body(
            'password', 
            'Please enter a valid email address and a password of 5 or more alphanumeric characters'
        )
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim()
    ], 
    authController.postLogin
);

router.post(
    '/signup', 
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email address')
            .custom((value, {req}) => {
                //     if (value === 'test@test.com') {
                //         throw new Error('This email address is forbidden');
                //     }
                //     return true;
                return User.findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject(
                                'Email already exists, please enter a different one or login'
                            );
                        }
                    })
                })
                .normalizeEmail(),
            body(
                'password', 
                'Password can only contain letters and numbers and must be at least 5 characters'
            )
                .isLength({min: 5})
                .isAlphanumeric()
                .trim(),
                body('confirmPassword').trim().custom((value, { req}) => {
                    if (value !== req.body.password) {
                        throw new Error('Passwords have to match');
                    }
                    return true;
                })
    ],
    authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;