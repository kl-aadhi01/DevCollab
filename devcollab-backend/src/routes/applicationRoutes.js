const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

router.post('/', auth, applicationController.applyToProject);
router.get('/project/:id', auth, applicationController.getApplicationsForProject);
router.put('/:id/accept', auth, applicationController.acceptApplication);
router.put('/:id/reject', auth, applicationController.rejectApplication);

module.exports = router;
