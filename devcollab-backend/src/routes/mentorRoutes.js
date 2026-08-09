const express = require('express');
const router = express.Router();
const mentorController = require('../controllers/mentorController');
const bootcampController = require('../controllers/bootcampController');
const auth = require('../middleware/auth');

router.get('/dashboard', auth, mentorController.getDashboard);
router.get('/students', auth, mentorController.getStudents);
router.put('/profile', auth, mentorController.updateProfile);
router.get('/:mentorId/bootcamps', auth, bootcampController.getMentorBootcamps);

module.exports = router;
