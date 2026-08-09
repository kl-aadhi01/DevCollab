const express = require('express');
const router = express.Router();
const bootcampController = require('../controllers/bootcampController');
const auth = require('../middleware/auth');

// Public search/filters
router.get('/', bootcampController.getBootcamps);

// Enrolled and recommended lists for logged in user (must go before /:id)
router.get('/enrolled', auth, bootcampController.getUserEnrolledBootcamps);
router.get('/recommended', auth, bootcampController.getRecommendedBootcamps);
router.get('/mentor/:mentorId', auth, bootcampController.getMentorBootcamps);

// Individual bootcamp actions
router.get('/:id', auth, bootcampController.getBootcamp);
router.post('/', auth, bootcampController.createBootcamp);
router.put('/:id', auth, bootcampController.updateBootcamp);
router.delete('/:id', auth, bootcampController.deleteBootcamp);

// Student actions
router.post('/:id/enroll', auth, bootcampController.enrollBootcamp);
router.put('/:id/progress', auth, bootcampController.updateProgress);

// Mentor query actions
router.get('/:id/students', auth, bootcampController.getEnrolledStudents);

module.exports = router;
