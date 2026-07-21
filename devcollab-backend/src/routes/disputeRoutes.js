const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const auth = require('../middleware/auth');

router.post('/', auth, disputeController.createDispute);
router.get('/:projectId', auth, disputeController.getDisputesForProject);

module.exports = router;
