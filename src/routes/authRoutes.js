const express = require('express');
const passport = require('passport');

const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', authController.renderLoginPage);
router.get('/auth/failure', authController.authFailed);
router.get('/auth/session', authController.getSession);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/failure'
  }),
  authController.authSuccess
);
router.post('/auth/logout', authController.logout);

module.exports = router;
