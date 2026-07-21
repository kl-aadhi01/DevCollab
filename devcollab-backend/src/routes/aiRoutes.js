const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.post('/breakdown-tasks', auth, aiController.breakdownTasks);

module.exports = router;
