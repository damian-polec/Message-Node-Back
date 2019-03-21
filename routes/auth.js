const express = require('express');
const { body } = require('express-validator/check');
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.put('/signup', [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .custom((value, { req }) => {
        return User.findOne({email: value})
        .then(userDoc => {
          if (userDoc) {
            return Promise.reject('User with that email already exists');
          }
        });
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({min: 5}),
  body('name')
    .trim()
    .not()
    .isEmpty()
], authController.createUser)

router.post('/login', [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .custom((value, { req }) => {
        return User.findOne({email: value})
        .then(userDoc => {
          if (!userDoc) {
            return Promise.reject('User with that email doesn\'t exists. Please use different one or sing up');
          }
        });
    })
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({min: 5}),
], authController.loginUser)

module.exports = router;