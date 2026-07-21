const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

router.get('/projects/:userId', auth, recommendationController.getProjectRecommendations);
router.get('/developers/:projectId', auth, recommendationController.getDeveloperRecommendations);

module.exports = router;
