const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middleware/auth');

router.get('/', auth, projectController.getProjects);
router.post('/', auth, projectController.createProject);
router.get('/:id', auth, projectController.getProject);
router.put('/:id', auth, projectController.updateProject);
router.delete('/:id', auth, projectController.deleteProject);
router.put('/:id/roadmap', auth, projectController.updateRoadmap);
router.get('/:id/progress', auth, projectController.getProjectProgress);
router.post('/:id/leave', auth, projectController.leaveProject);

module.exports = router;
