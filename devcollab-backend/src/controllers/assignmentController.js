const Assignment = require('../models/Assignment');
const Bootcamp = require('../models/Bootcamp');
const User = require('../models/User');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const { awardBadge } = require('../services/badgeService');

// Get assignments for bootcamp
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ bootcampId: req.params.bootcampId })
      .sort({ week: 1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create assignment (Mentor only)
const createAssignment = async (req, res) => {
  try {
    const { bootcampId, week, title, description, resources, deadline } = req.body;

    if (!bootcampId || !week || !title || !description) {
      return res.status(400).json({ message: 'Missing required assignment fields' });
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const assignment = new Assignment({
      bootcampId,
      week,
      title,
      description,
      resources: resources || [],
      deadline
    });

    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single assignment
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('bootcampId', 'title mentorId');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update assignment (Mentor only)
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const bootcamp = await Bootcamp.findById(assignment.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const { title, description, resources, deadline } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (resources) assignment.resources = resources;
    if (deadline) assignment.deadline = deadline;

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete assignment (Mentor only)
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const bootcamp = await Bootcamp.findById(assignment.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  try {
    const { submissionUrl } = req.body;
    if (!submissionUrl) {
      return res.status(400).json({ message: 'Missing submission URL' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const bootcamp = await Bootcamp.findById(assignment.bootcampId);
    if (!bootcamp) {
      return res.status(404).json({ message: 'Associated bootcamp not found' });
    }

    // Verify enrollment
    const isEnrolled = bootcamp.enrolledStudents.some(s => s.studentId.toString() === req.user.id);
    if (!isEnrolled) {
      return res.status(403).json({ message: 'You are not enrolled in this bootcamp' });
    }

    const submissionIndex = assignment.submissions.findIndex(s => s.studentId.toString() === req.user.id);
    if (submissionIndex > -1) {
      assignment.submissions[submissionIndex].submissionUrl = submissionUrl;
      assignment.submissions[submissionIndex].submittedAt = new Date();
      assignment.submissions[submissionIndex].status = 'pending';
    } else {
      assignment.submissions.push({
        studentId: req.user.id,
        submissionUrl,
        submittedAt: new Date(),
        status: 'pending'
      });
    }

    await assignment.save();

    // Award submission points
    const user = await User.findById(req.user.id);
    await pointsService.addPoints(user, 'submitAssignment', req.io);

    // Notify mentor
    const notification = new Notification({
      userId: bootcamp.mentorId,
      message: `📝 student "${user.username}" submitted week ${assignment.week} assignment: "${assignment.title}".`,
      type: 'system',
      category: 'system',
      priority: 'low',
      link: `/assignments/${assignment._id}`
    });
    await notification.save();

    if (req.io) {
      req.io.to(bootcamp.mentorId.toString()).emit('notification', notification);
    }

    res.json({ message: 'Assignment submitted successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Grade assignment (Mentor only)
const gradeAssignment = async (req, res) => {
  try {
    const { studentId, grade, feedback, status } = req.body;
    if (!studentId || grade === undefined || !status) {
      return res.status(400).json({ message: 'Missing grading details' });
    }

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const bootcamp = await Bootcamp.findById(assignment.bootcampId);
    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const sub = assignment.submissions.find(s => s.studentId.toString() === studentId.toString());
    if (!sub) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const oldStatus = sub.status;
    sub.grade = Number(grade);
    sub.feedback = feedback;
    sub.status = status; // 'graded' or 'resubmit'

    await assignment.save();

    // Add graded assignment ID to Bootcamp's student record
    const studentRecord = bootcamp.enrolledStudents.find(s => s.studentId.toString() === studentId.toString());
    if (studentRecord && status === 'graded' && !studentRecord.assignmentsCompleted.includes(assignment._id)) {
      studentRecord.assignmentsCompleted.push(assignment._id);
      await bootcamp.save();
    }

    // Award student points and check badges if newly graded and passed (grade >= 50)
    const student = await User.findById(studentId);
    if (student) {
      if (status === 'graded' && oldStatus !== 'graded' && grade >= 50) {
        await pointsService.addPoints(student, 'passAssignment', req.io);

        // Check if all bootcamp assignments are complete
        const allAssignments = await Assignment.find({ bootcampId: bootcamp._id });
        let passedAll = true;
        for (const ass of allAssignments) {
          const studentSub = ass.submissions.find(s => s.studentId.toString() === studentId.toString());
          if (!studentSub || studentSub.status !== 'graded' || studentSub.grade < 50) {
            passedAll = false;
            break;
          }
        }

        if (passedAll && allAssignments.length > 0) {
          await awardBadge(student, 'Assignment Master', req.io);
        }
      }

      // Notify student
      const feedbackMessage = status === 'graded' 
        ? `📝 Your assignment for week ${assignment.week} ("${assignment.title}") has been graded! Grade: ${grade}%.`
        : `⚠️ Your assignment for week ${assignment.week} ("${assignment.title}") needs revision (Resubmit).`;

      const notification = new Notification({
        userId: student._id,
        message: feedbackMessage,
        type: 'system',
        category: 'system',
        priority: 'high',
        link: `/assignments/${assignment._id}`
      });
      await notification.save();

      if (req.io) {
        req.io.to(student._id.toString()).emit('notification', notification);
      }
    }

    res.json({ message: 'Assignment graded successfully', assignment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get submissions for assignment (Mentor only)
const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions.studentId', 'name username avatar email title location points level');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const bootcamp = await Bootcamp.findById(assignment.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    res.json(assignment.submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
  getSubmissions
};
