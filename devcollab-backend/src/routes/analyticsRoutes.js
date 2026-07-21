const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

router.get('/projects/:id/analytics', auth, analyticsController.getProjectAnalytics);

module.exports = router;
