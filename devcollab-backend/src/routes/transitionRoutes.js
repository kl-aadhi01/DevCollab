const express = require('express');
const router = express.Router();
const transitionController = require('../controllers/transitionController');
const auth = require('../middleware/auth');

router.post('/to-build', auth, transitionController.transitionToBuild);
router.get('/recommended-projects', auth, transitionController.getRecommendedProjects);
router.post('/create-team', auth, transitionController.createTeam);
router.get('/status', auth, transitionController.getStatus);

module.exports = router;
