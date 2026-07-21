const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const auth = require('../middleware/auth');

router.get('/next-project/:userId', auth, suggestionController.getNextProject);

module.exports = router;
