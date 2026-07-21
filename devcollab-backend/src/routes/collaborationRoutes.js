const express = require('express');
const router = express.Router();
const collaborationController = require('../controllers/collaborationController');
const auth = require('../middleware/auth');

router.post('/request', auth, collaborationController.sendCollaborationRequest);
router.get('/requests', auth, collaborationController.getRequests);
router.get('/requests/received', auth, collaborationController.getReceivedRequests);
router.get('/requests/sent', auth, collaborationController.getSentRequests);
router.put('/:id/accept', auth, collaborationController.acceptRequest);
router.put('/:id/reject', auth, collaborationController.rejectRequest);
router.put('/:id/cancel', auth, collaborationController.cancelRequest);

module.exports = router;
