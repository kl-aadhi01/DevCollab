const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const auth = require('../middleware/auth');

// Bootcamp assignment listings
router.get('/bootcamp/:bootcampId', auth, assignmentController.getAssignments);

// Assignment actions
router.post('/', auth, assignmentController.createAssignment);
router.get('/:id', auth, assignmentController.getAssignment);
router.put('/:id', auth, assignmentController.updateAssignment);
router.delete('/:id', auth, assignmentController.deleteAssignment);

// Submissions and grading
router.post('/:id/submit', auth, assignmentController.submitAssignment);
router.put('/:id/grade', auth, assignmentController.gradeAssignment);
router.get('/:id/submissions', auth, assignmentController.getSubmissions);

module.exports = router;
