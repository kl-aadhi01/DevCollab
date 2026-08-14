const express = require('express');
const router = express.Router();
const learnController = require('../controllers/learnController');
const auth = require('../middleware/auth');

// ==========================================
// BOOTCAMPS ROUTES
// ==========================================
router.get('/bootcamps', learnController.getBootcamps);
router.post('/bootcamps', auth, learnController.createBootcamp);
router.get('/bootcamps/:id', auth, learnController.getBootcamp);
router.put('/bootcamps/:id', auth, learnController.updateBootcamp);
router.delete('/bootcamps/:id', auth, learnController.deleteBootcamp);
router.post('/bootcamps/:id/enroll', auth, learnController.enrollBootcamp);

// ==========================================
// LESSONS ROUTES
// ==========================================
router.get('/lessons/:id', auth, learnController.getLesson);
router.post('/lessons', auth, learnController.createLesson);
router.put('/lessons/:id', auth, learnController.updateLesson);
router.delete('/lessons/:id', auth, learnController.deleteLesson);
router.post('/lessons/:id/complete', auth, learnController.completeLesson);

// ==========================================
// EXERCISES ROUTES
// ==========================================
router.get('/exercises/:id', auth, learnController.getExercise);
router.post('/exercises', auth, learnController.createExercise);
router.put('/exercises/:id', auth, learnController.updateExercise);
router.post('/exercises/:id/submit', auth, learnController.submitExercise);

// ==========================================
// ASSIGNMENTS ROUTES
// ==========================================
router.get('/assignments/:id', auth, learnController.getAssignment);
router.post('/assignments', auth, learnController.createAssignment);
router.put('/assignments/:id', auth, learnController.updateAssignment);
router.post('/assignments/:id/submit', auth, learnController.submitAssignment);
router.put('/assignments/:id/review', auth, learnController.reviewAssignment);

// ==========================================
// GUIDED PROJECTS ROUTES
// ==========================================
router.get('/guided-projects/:id', auth, learnController.getGuidedProject);
router.post('/guided-projects', auth, learnController.createGuidedProject);
router.put('/guided-projects/:id', auth, learnController.updateGuidedProject);
router.post('/guided-projects/:id/submit', auth, learnController.submitGuidedProject);

// ==========================================
// CAPSTONE ROUTES
// ==========================================
router.get('/capstones/:id', auth, learnController.getCapstone);
router.post('/capstones', auth, learnController.createCapstone);
router.put('/capstones/:id', auth, learnController.updateCapstone);
router.post('/capstones/:id/submit', auth, learnController.submitCapstone);
router.post('/capstones/:id/convert-to-project', auth, learnController.convertToProject);

// ==========================================
// LEARNING PROGRESS ROUTES
// ==========================================
router.get('/my-progress', auth, learnController.getMyProgress);
router.get('/my-learning', auth, learnController.getMyLearning);
router.get('/recommendations', auth, learnController.getRecommendations);
router.get('/skills', auth, learnController.getSkills);

// ==========================================
// MENTOR ROUTES
// ==========================================
router.get('/mentor/dashboard', auth, learnController.getMentorDashboard);
router.get('/mentor/students', auth, learnController.getMentorStudents);
router.get('/mentor/submissions', auth, learnController.getMentorSubmissions);
router.put('/mentor/profile', auth, learnController.updateMentorProfile);

// ==========================================
// BUILD TRANSITION ROUTES
// ==========================================
router.get('/build-readiness', auth, learnController.getBuildReadiness);
router.get('/recommended-projects', auth, learnController.getRecommendedProjects);
router.post('/transition-to-build', auth, learnController.transitionToBuild);

module.exports = router;
