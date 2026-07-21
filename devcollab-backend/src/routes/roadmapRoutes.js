const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const auth = require('../middleware/auth');

router.put('/:id', auth, roadmapController.updateRoadmap);
router.get('/:id/progress', auth, roadmapController.getProjectProgress);

module.exports = router;
