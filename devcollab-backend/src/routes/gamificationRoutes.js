const express = require('express');
const router = express.Router();
const gamificationController = require('../controllers/gamificationController');
const auth = require('../middleware/auth');

router.get('/profile', auth, gamificationController.getGamificationStats);
router.get('/badges', auth, gamificationController.getAllBadges);
router.get('/leaderboard', auth, gamificationController.getLeaderboard);
router.get('/achievements', auth, gamificationController.getAchievements);

module.exports = router;
