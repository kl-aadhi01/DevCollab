const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.get('/profile/:userId', auth, authController.getAnyProfile);
router.put('/profile/avatar', auth, authController.uploadAvatar);
router.patch('/profile/visibility', auth, authController.updateVisibility);
router.get('/portfolio/:username', authController.getPublicPortfolio);

module.exports = router;
