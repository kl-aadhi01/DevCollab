const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const auth = require('../middleware/auth');

router.post('/', auth, ratingController.createRating);
router.get('/user/:userId', auth, ratingController.getUserRatings);
router.get('/project/:projectId', auth, ratingController.getProjectRatingsForUser);

module.exports = router;
