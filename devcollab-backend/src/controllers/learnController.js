const Bootcamp = require('../models/Bootcamp');
const Lesson = require('../models/Lesson');
const PracticalExercise = require('../models/PracticalExercise');
const ExerciseSubmission = require('../models/ExerciseSubmission');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const GuidedProject = require('../models/GuidedProject');
const GuidedProjectSubmission = require('../models/GuidedProjectSubmission');
const Capstone = require('../models/Capstone');
const CapstoneSubmission = require('../models/CapstoneSubmission');
const LearningEnrollment = require('../models/LearningEnrollment');
const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const badgeService = require('../services/badgeService');

// Utility: Recalculate progress for enrollment
const recalculateProgress = async (enrollmentId, io) => {
  const enrollment = await LearningEnrollment.findById(enrollmentId);
  if (!enrollment) return 0;

  const bootcampId = enrollment.bootcampId;
  const studentId = enrollment.studentId;

  // Count total required activities
  const lessonsCount = await Lesson.countDocuments({ bootcampId });
  const exercisesCount = await PracticalExercise.countDocuments({ bootcampId });
  const assignmentsCount = await Assignment.countDocuments({ bootcampId });
  const guidedProjectsCount = await GuidedProject.countDocuments({ bootcampId });
  const capstonesCount = await Capstone.countDocuments({ bootcampId });

  const totalActivities = lessonsCount + exercisesCount + assignmentsCount + guidedProjectsCount + capstonesCount;
  if (totalActivities === 0) return 0;

  // Count completed activities
  const completedLessons = enrollment.completedLessons.length;
  const completedExercises = enrollment.completedExercises.length;
  const completedAssignments = enrollment.completedAssignments.length;
  const completedGP = enrollment.completedGuidedProject ? guidedProjectsCount : 0;
  const completedCap = enrollment.completedCapstone ? capstonesCount : 0;

  const completedActivities = completedLessons + completedExercises + completedAssignments + completedGP + completedCap;
  const progressPercentage = Math.round((completedActivities / totalActivities) * 100);

  enrollment.progress = progressPercentage;
  if (progressPercentage >= 100) {
    enrollment.status = 'completed';
  } else if (enrollment.status === 'enrolled') {
    enrollment.status = 'in-progress';
  }

  await enrollment.save();

  // Keep compatibility with Bootcamp.enrolledStudents & User.learningTrack.enrolledBootcamps
  const bootcamp = await Bootcamp.findById(bootcampId);
  if (bootcamp) {
    const studentRecord = bootcamp.enrolledStudents.find(s => s.studentId.toString() === studentId.toString());
    if (studentRecord) {
      studentRecord.progress = progressPercentage;
      if (progressPercentage >= 100) {
        studentRecord.status = 'completed';
      }
      await bootcamp.save();
    }
  }

  const user = await User.findById(studentId);
  if (user) {
    const userBC = user.learningTrack.enrolledBootcamps.find(b => b.bootcampId.toString() === bootcampId.toString());
    if (userBC) {
      userBC.progress = progressPercentage;
      if (progressPercentage >= 100) {
        userBC.status = 'completed';
        if (!user.learningTrack.completedBootcamps.includes(bootcampId)) {
          user.learningTrack.completedBootcamps.push(bootcampId);
        }
        user.transitionStatus.isEligible = true;
      }
      user.markModified('learningTrack.enrolledBootcamps');
      user.markModified('transitionStatus');
      await user.save();
    }
  }

  return progressPercentage;
};

// ==========================================
// BOOTCAMPS CONTROLLERS
// ==========================================

// Utility: sync nested curriculum week array to dynamic collections for backward compatibility
const syncCurriculumToCollections = async (bootcamp) => {
  if (!bootcamp.curriculum || !Array.isArray(bootcamp.curriculum)) return;

  for (const week of bootcamp.curriculum) {
    // 1. Sync resources as Lessons
    if (week.resources && Array.isArray(week.resources)) {
      for (const res of week.resources) {
        if (!res.title || !res.url) continue;
        const lessonExists = await Lesson.findOne({
          bootcampId: bootcamp._id,
          week: week.week,
          title: res.title
        });
        if (!lessonExists) {
          const lesson = new Lesson({
            bootcampId: bootcamp._id,
            week: week.week,
            title: res.title,
            description: `Study materials for Week ${week.week}: ${week.title}`,
            content: `Please study the resource: [${res.title}](${res.url}). This resource is of type "${res.type}". Make sure to read and review the materials fully.`,
            videoUrl: res.type === 'video' ? res.url : undefined,
            docUrl: res.type !== 'video' ? res.url : undefined,
            duration: 30,
            difficulty: bootcamp.level || 'beginner'
          });
          await lesson.save();
        }
      }
    }

    // 2. Sync Assignment
    if (week.assignment && week.assignment.title) {
      const assignmentExists = await Assignment.findOne({
        bootcampId: bootcamp._id,
        week: week.week
      });
      if (!assignmentExists) {
        const assignment = new Assignment({
          bootcampId: bootcamp._id,
          week: week.week,
          title: week.assignment.title,
          description: week.assignment.description || `Assignment for Week ${week.week}: ${week.title}`,
          instructions: `Complete the week assignment and submit your project repository URL.`,
          deadline: week.assignment.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 * week.week)
        });
        await assignment.save();
      }
    }
  }

  // 3. Sync Capstone
  if (bootcamp.capstoneProject && bootcamp.capstoneProject.title) {
    const capstoneExists = await Capstone.findOne({
      bootcampId: bootcamp._id
    });
    if (!capstoneExists) {
      const capstone = new Capstone({
        bootcampId: bootcamp._id,
        title: bootcamp.capstoneProject.title,
        problemStatement: bootcamp.capstoneProject.description || 'Capstone evaluation problem statement.',
        description: bootcamp.capstoneProject.description || 'Capstone evaluation final project.',
        requiredSkills: bootcamp.capstoneProject.requiredSkills || [],
        teamSize: bootcamp.capstoneProject.teamSize || 4,
        isTeamBased: (bootcamp.capstoneProject.teamSize || 4) > 1
      });
      await capstone.save();
    }
  }
};

// ==========================================
// BOOTCAMPS CONTROLLERS
// ==========================================

const getBootcamps = async (req, res) => {
  try {
    const { category, level, search, duration } = req.query;
    let query = { status: 'published', isActive: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (duration) query.duration = duration;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const bootcamps = await Bootcamp.find(query)
      .populate('mentorId', 'name username avatar')
      .sort({ createdAt: -1 });

    res.json(bootcamps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createBootcamp = async (req, res) => {
  try {
    const { title, description, category, level, duration, prerequisites, learningOutcomes, skillsCovered, curriculum, capstoneProject, maxStudents, startDate, endDate, status } = req.body;

    if (!title || !description || !duration) {
      return res.status(400).json({ message: 'Missing required bootcamp details' });
    }

    const bootcamp = new Bootcamp({
      title,
      description,
      mentorId: req.user.id,
      category,
      level,
      duration,
      prerequisites: prerequisites || [],
      learningOutcomes: learningOutcomes || [],
      skillsCovered: skillsCovered || [],
      curriculum: curriculum || [],
      capstoneProject: capstoneProject || { teamSize: 4 },
      maxStudents: maxStudents || 30,
      startDate,
      endDate,
      status: status || 'published'
    });

    await bootcamp.save();
    await syncCurriculumToCollections(bootcamp);
    res.status(201).json(bootcamp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)
      .populate('mentorId', 'name username avatar');

    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    // Auto-migrate legacy curriculum data on the fly
    await syncCurriculumToCollections(bootcamp);

    // Populate lessons, exercises, assignments, guided-projects, capstones
    const lessons = await Lesson.find({ bootcampId: bootcamp._id }).sort({ week: 1 });
    const exercises = await PracticalExercise.find({ bootcampId: bootcamp._id }).sort({ week: 1 });
    const assignments = await Assignment.find({ bootcampId: bootcamp._id }).sort({ week: 1 });
    const guidedProject = await GuidedProject.findOne({ bootcampId: bootcamp._id });
    const capstone = await Capstone.findOne({ bootcampId: bootcamp._id });

    // Check if logged in user is enrolled
    let enrollment = null;
    if (req.user) {
      enrollment = await LearningEnrollment.findOne({ bootcampId: bootcamp._id, studentId: req.user.id })
        .populate('completedLessons')
        .populate('completedExercises')
        .populate('completedAssignments');
    }

    res.json({
      bootcamp,
      lessons,
      exercises,
      assignments,
      guidedProject,
      capstone,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const fields = [
      'title', 'description', 'category', 'level', 'duration',
      'prerequisites', 'learningOutcomes', 'skillsCovered', 'curriculum',
      'capstoneProject', 'maxStudents', 'startDate', 'endDate', 'status', 'isActive'
    ];

    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        bootcamp[field] = req.body[field];
      }
    });

    await bootcamp.save();
    await syncCurriculumToCollections(bootcamp);
    res.json(bootcamp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await Lesson.deleteMany({ bootcampId: bootcamp._id });
    await PracticalExercise.deleteMany({ bootcampId: bootcamp._id });
    await Assignment.deleteMany({ bootcampId: bootcamp._id });
    await GuidedProject.deleteMany({ bootcampId: bootcamp._id });
    await Capstone.deleteMany({ bootcampId: bootcamp._id });
    await LearningEnrollment.deleteMany({ bootcampId: bootcamp._id });
    await bootcamp.deleteOne();

    res.json({ message: 'Bootcamp and all materials deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const enrollBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });

    if (!bootcamp.isActive) return res.status(400).json({ message: 'Bootcamp is not active' });

    // Check existing enrollment
    const existing = await LearningEnrollment.findOne({ bootcampId: bootcamp._id, studentId: req.user.id });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = new LearningEnrollment({
      bootcampId: bootcamp._id,
      studentId: req.user.id,
      status: 'enrolled'
    });
    await enrollment.save();

    // Compatibility update
    bootcamp.enrolledStudents.push({
      studentId: req.user.id,
      progress: 0,
      status: 'active'
    });
    await bootcamp.save();

    const user = await User.findById(req.user.id);
    if (user) {
      user.learningTrack.enrolledBootcamps.push({
        bootcampId: bootcamp._id,
        progress: 0,
        status: 'active'
      });
      await user.save();

      // Points and notification
      await pointsService.addPoints(user, 'enrollBootcamp', req.io);

      const notification = new Notification({
        userId: user._id,
        message: `📚 Enrolled! Welcome to "${bootcamp.title}". Let's start learning!`,
        type: 'system',
        category: 'system',
        priority: 'high',
        link: `/learn/bootcamps/${bootcamp._id}`
      });
      await notification.save();
      if (req.io) {
        req.io.to(user._id.toString()).emit('notification', notification);
      }
    }

    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// LESSONS CONTROLLERS
// ==========================================

const getLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Verify enrollment
    const enrollment = await LearningEnrollment.findOne({ bootcampId: lesson.bootcampId, studentId: req.user.id });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this bootcamp' });

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createLesson = async (req, res) => {
  try {
    const { bootcampId, week, title, description, content, videoUrl, docUrl, duration, topics, difficulty } = req.body;
    
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized action' });

    const lesson = new Lesson({
      bootcampId, week, title, description, content, videoUrl, docUrl, duration, topics, difficulty
    });
    await lesson.save();

    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const bootcamp = await Bootcamp.findById(lesson.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized action' });

    const fields = ['title', 'description', 'content', 'videoUrl', 'docUrl', 'duration', 'topics', 'difficulty', 'week'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) lesson[field] = req.body[field];
    });

    await lesson.save();
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const bootcamp = await Bootcamp.findById(lesson.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized action' });

    await lesson.deleteOne();
    res.json({ message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const completeLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const enrollment = await LearningEnrollment.findOne({ bootcampId: lesson.bootcampId, studentId: req.user.id });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this bootcamp' });

    if (!enrollment.completedLessons.includes(lesson._id)) {
      enrollment.completedLessons.push(lesson._id);
      await enrollment.save();

      // Recalculate progress
      await recalculateProgress(enrollment._id, req.io);

      // Check first lesson badge
      if (enrollment.completedLessons.length === 1) {
        const user = await User.findById(req.user.id);
        if (user) {
          await badgeService.awardBadge(user, 'First Lesson', req.io);
        }
      }
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// EXERCISES CONTROLLERS
// ==========================================

const getExercise = async (req, res) => {
  try {
    const exercise = await PracticalExercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

    const enrollment = await LearningEnrollment.findOne({ bootcampId: exercise.bootcampId, studentId: req.user.id });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });

    // Find submission
    const submission = await ExerciseSubmission.findOne({ exerciseId: exercise._id, studentId: req.user.id });

    res.json({ exercise, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createExercise = async (req, res) => {
  try {
    const { bootcampId, week, title, description, requiredSkills, instructions, difficulty, estimatedTime, expectedOutput, submissionType, evaluationCriteria } = req.body;
    
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized action' });

    const exercise = new PracticalExercise({
      bootcampId, week, title, description, requiredSkills, instructions, difficulty, estimatedTime, expectedOutput, submissionType, evaluationCriteria
    });
    await exercise.save();

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateExercise = async (req, res) => {
  try {
    const exercise = await PracticalExercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

    const bootcamp = await Bootcamp.findById(exercise.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const fields = ['title', 'description', 'requiredSkills', 'instructions', 'difficulty', 'estimatedTime', 'expectedOutput', 'submissionType', 'evaluationCriteria', 'week'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) exercise[field] = req.body[field];
    });

    await exercise.save();
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const submitExercise = async (req, res) => {
  try {
    const exercise = await PracticalExercise.findById(req.params.id);
    if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

    const enrollment = await LearningEnrollment.findOne({ bootcampId: exercise.bootcampId, studentId: req.user.id });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });

    const { textContent, submissionUrl } = req.body;

    let submission = await ExerciseSubmission.findOne({ exerciseId: exercise._id, studentId: req.user.id });
    if (submission) {
      submission.textContent = textContent;
      submission.submissionUrl = submissionUrl;
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = new ExerciseSubmission({
        exerciseId: exercise._id,
        studentId: req.user.id,
        textContent,
        submissionUrl
      });
      await submission.save();
    }

    if (!enrollment.completedExercises.includes(exercise._id)) {
      enrollment.completedExercises.push(exercise._id);
      await enrollment.save();

      // Recalculate progress
      await recalculateProgress(enrollment._id, req.io);

      // Award Points
      const user = await User.findById(req.user.id);
      if (user) {
        // Complete exercise could award custom points or daily points
        await pointsService.addPoints(user, 'submitAssignment', req.io); // standard submit action
      }
    }

    res.json({ enrollment, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// ASSIGNMENTS CONTROLLERS
// ==========================================

const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const submission = await AssignmentSubmission.findOne({ assignmentId: assignment._id, studentId: req.user.id });

    res.json({ assignment, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { bootcampId, week, title, description, instructions, resources, deadline, evaluationCriteria, submissionRequirements } = req.body;
    
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized action' });

    const assignment = new Assignment({
      bootcampId, week, title, description, instructions, resources, deadline, evaluationCriteria, submissionRequirements
    });
    await assignment.save();

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const bootcamp = await Bootcamp.findById(assignment.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const fields = ['title', 'description', 'instructions', 'resources', 'deadline', 'evaluationCriteria', 'submissionRequirements', 'week'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) assignment[field] = req.body[field];
    });

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const { submissionUrl, textContent } = req.body;
    if (!submissionUrl) return res.status(400).json({ message: 'Submission link required' });

    let submission = await AssignmentSubmission.findOne({ assignmentId: assignment._id, studentId: req.user.id });
    if (submission) {
      submission.submissionUrl = submissionUrl;
      submission.textContent = textContent;
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = new AssignmentSubmission({
        assignmentId: assignment._id,
        studentId: req.user.id,
        submissionUrl,
        textContent,
        status: 'submitted'
      });
      await submission.save();
    }

    // Award Points
    const user = await User.findById(req.user.id);
    if (user) {
      await pointsService.addPoints(user, 'submitAssignment', req.io);
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reviewAssignment = async (req, res) => {
  try {
    const { submissionId, grade, feedback, status } = req.body; // status: 'graded', 'resubmit', 'completed'

    const submission = await AssignmentSubmission.findById(submissionId).populate('assignmentId');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const bootcamp = await Bootcamp.findById(submission.assignmentId.bootcampId);
    if (!bootcamp || bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized review' });
    }

    submission.grade = grade;
    submission.feedback = feedback;
    submission.status = status;
    await submission.save();

    const studentEnrollment = await LearningEnrollment.findOne({
      bootcampId: bootcamp._id,
      studentId: submission.studentId
    });

    if (studentEnrollment) {
      if ((status === 'graded' && grade >= 60) || status === 'completed') {
        if (!studentEnrollment.completedAssignments.includes(submission.assignmentId._id)) {
          studentEnrollment.completedAssignments.push(submission.assignmentId._id);
          await studentEnrollment.save();
          await recalculateProgress(studentEnrollment._id, req.io);

          // Award Points for passing assignment
          const student = await User.findById(submission.studentId);
          if (student) {
            await pointsService.addPoints(student, 'passAssignment', req.io);

            // Award badge if first assignment passed
            if (studentEnrollment.completedAssignments.length === 1) {
              await badgeService.awardBadge(student, 'Assignment Completed', req.io);
            }
          }
        }
      }
    }

    // Send Notification to learner
    const notification = new Notification({
      userId: submission.studentId,
      message: `📝 Your assignment "${submission.assignmentId.title}" has been graded: ${grade}/100! Status: ${status.toUpperCase()}`,
      type: 'task',
      category: 'task',
      priority: 'high',
      link: `/learn/assignments/${submission.assignmentId._id}`
    });
    await notification.save();
    if (req.io) {
      req.io.to(submission.studentId.toString()).emit('notification', notification);
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// GUIDED PROJECTS CONTROLLERS
// ==========================================

const getGuidedProject = async (req, res) => {
  try {
    const guidedProject = await GuidedProject.findById(req.params.id);
    if (!guidedProject) return res.status(404).json({ message: 'Guided project not found' });

    const submission = await GuidedProjectSubmission.findOne({ guidedProjectId: guidedProject._id, studentId: req.user.id });

    res.json({ guidedProject, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createGuidedProject = async (req, res) => {
  try {
    const { bootcampId, title, description, objective, requiredSkills, requirements, suggestedTech, milestones, expectedDeliverables } = req.body;

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const guidedProject = new GuidedProject({
      bootcampId, title, description, objective, requiredSkills, requirements, suggestedTech, milestones, expectedDeliverables
    });
    await guidedProject.save();

    res.status(201).json(guidedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateGuidedProject = async (req, res) => {
  try {
    const guidedProject = await GuidedProject.findById(req.params.id);
    if (!guidedProject) return res.status(404).json({ message: 'Guided project not found' });

    const bootcamp = await Bootcamp.findById(guidedProject.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const fields = ['title', 'description', 'objective', 'requiredSkills', 'requirements', 'suggestedTech', 'milestones', 'expectedDeliverables'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) guidedProject[field] = req.body[field];
    });

    await guidedProject.save();
    res.json(guidedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const submitGuidedProject = async (req, res) => {
  try {
    const guidedProject = await GuidedProject.findById(req.params.id);
    if (!guidedProject) return res.status(404).json({ message: 'Guided project not found' });

    const { submissionUrl, repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ message: 'Repository URL is required' });

    let submission = await GuidedProjectSubmission.findOne({ guidedProjectId: guidedProject._id, studentId: req.user.id });
    if (submission) {
      submission.submissionUrl = submissionUrl;
      submission.repoUrl = repoUrl;
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = new GuidedProjectSubmission({
        guidedProjectId: guidedProject._id,
        studentId: req.user.id,
        submissionUrl,
        repoUrl,
        status: 'submitted'
      });
      await submission.save();
    }

    const enrollment = await LearningEnrollment.findOne({ bootcampId: guidedProject.bootcampId, studentId: req.user.id });
    if (enrollment) {
      enrollment.completedGuidedProject = true;
      await enrollment.save();
      await recalculateProgress(enrollment._id, req.io);

      const student = await User.findById(req.user.id);
      if (student) {
        await badgeService.awardBadge(student, 'Guided Project Completed', req.io);
      }
    }

    res.json({ submission, enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// CAPSTONE CONTROLLERS
// ==========================================

const getCapstone = async (req, res) => {
  try {
    const capstone = await Capstone.findById(req.params.id);
    if (!capstone) return res.status(404).json({ message: 'Capstone not found' });

    const submission = await CapstoneSubmission.findOne({ capstoneId: capstone._id, submitterId: req.user.id });

    res.json({ capstone, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createCapstone = async (req, res) => {
  try {
    const { bootcampId, title, problemStatement, description, objectives, requiredSkills, suggestedTech, requirements, modules, milestones, deliverables, teamSize, evaluationCriteria, isTeamBased } = req.body;

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) return res.status(404).json({ message: 'Bootcamp not found' });
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const capstone = new Capstone({
      bootcampId, title, problemStatement, description, objectives, requiredSkills, suggestedTech, requirements, modules, milestones, deliverables, teamSize, evaluationCriteria, isTeamBased
    });
    await capstone.save();

    res.status(201).json(capstone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateCapstone = async (req, res) => {
  try {
    const capstone = await Capstone.findById(req.params.id);
    if (!capstone) return res.status(404).json({ message: 'Capstone not found' });

    const bootcamp = await Bootcamp.findById(capstone.bootcampId);
    if (bootcamp.mentorId.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });

    const fields = ['title', 'problemStatement', 'description', 'objectives', 'requiredSkills', 'suggestedTech', 'requirements', 'modules', 'milestones', 'deliverables', 'teamSize', 'evaluationCriteria', 'isTeamBased'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) capstone[field] = req.body[field];
    });

    await capstone.save();
    res.json(capstone);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const submitCapstone = async (req, res) => {
  try {
    const capstone = await Capstone.findById(req.params.id);
    if (!capstone) return res.status(404).json({ message: 'Capstone not found' });

    const { submissionUrl, repoUrl, teamMembers = [] } = req.body;
    if (!repoUrl) return res.status(400).json({ message: 'Repository URL required' });

    let submission = await CapstoneSubmission.findOne({ capstoneId: capstone._id, submitterId: req.user.id });
    if (submission) {
      submission.submissionUrl = submissionUrl;
      submission.repoUrl = repoUrl;
      submission.teamMembers = teamMembers;
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = new CapstoneSubmission({
        capstoneId: capstone._id,
        submitterId: req.user.id,
        teamMembers,
        submissionUrl,
        repoUrl,
        status: 'submitted'
      });
      await submission.save();
    }

    const enrollment = await LearningEnrollment.findOne({ bootcampId: capstone.bootcampId, studentId: req.user.id });
    if (enrollment) {
      enrollment.completedCapstone = true;
      await enrollment.save();
      await recalculateProgress(enrollment._id, req.io);

      // Award points & badge
      const student = await User.findById(req.user.id);
      if (student) {
        await pointsService.addPoints(student, 'completeCapstone', req.io);
        await badgeService.awardBadge(student, 'Capstone Completed', req.io);
      }
    }

    res.json({ submission, enrollment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const convertToProject = async (req, res) => {
  try {
    const { submissionId } = req.body;
    const submission = await CapstoneSubmission.findById(submissionId).populate('capstoneId');
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    if (submission.submitterId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (submission.devcollabProjectId) {
      return res.status(400).json({ message: 'Capstone already converted to DevCollab project' });
    }

    const capstone = submission.capstoneId;
    const bootcamp = await Bootcamp.findById(capstone.bootcampId);

    // Create a new normal DevCollab project using capstone data
    const project = new Project({
      name: `${bootcamp.title} - ${capstone.title}`,
      description: capstone.description + `\n\n**Problem Statement:**\n${capstone.problemStatement}`,
      requiredSkills: capstone.requiredSkills,
      teamSize: capstone.teamSize,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // Default 60 days
      githubRepo: submission.repoUrl,
      ownerId: req.user.id,
      members: submission.teamMembers || [],
      status: 'planning',
      progress: 0,
      roadmap: capstone.milestones.map(m => ({
        phase: m.title,
        description: m.description,
        milestones: []
      }))
    });
    await project.save();

    // Create Tasks from capstone modules
    if (capstone.modules && capstone.modules.length > 0) {
      for (const mod of capstone.modules) {
        const task = new Task({
          projectId: project._id,
          title: mod.title,
          description: mod.description,
          assignedTo: req.user.id,
          priority: 'medium',
          status: 'todo'
        });
        await task.save();
      }
    }

    // Link project back to capstone submission
    submission.devcollabProjectId = project._id;
    await submission.save();

    // Create notification
    const notification = new Notification({
      userId: req.user.id,
      message: `🚀 Capstone project "${capstone.title}" successfully converted to real DevCollab project!`,
      type: 'project',
      category: 'project',
      priority: 'high',
      link: `/projects/${project._id}`
    });
    await notification.save();
    if (req.io) {
      req.io.to(req.user.id).emit('notification', notification);
    }

    res.status(201).json({ project, submission });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// LEARNING PROGRESS CONTROLLERS
// ==========================================

const getMyProgress = async (req, res) => {
  try {
    const enrollments = await LearningEnrollment.find({ studentId: req.user.id })
      .populate('bootcampId', 'title description category level duration');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyLearning = async (req, res) => {
  try {
    const enrollments = await LearningEnrollment.find({ studentId: req.user.id })
      .populate({
        path: 'bootcampId',
        populate: { path: 'mentorId', select: 'name username avatar' }
      });

    // Build "what to do next" recommendations
    const data = await Promise.all(enrollments.map(async (en) => {
      const bootcampId = en.bootcampId._id;

      // Get first uncompleted lesson
      const completedLessons = en.completedLessons;
      const nextLesson = await Lesson.findOne({
        bootcampId,
        _id: { $nin: completedLessons }
      }).sort({ week: 1, createdAt: 1 });

      // Get first uncompleted exercise
      const completedExercises = en.completedExercises;
      const nextExercise = await PracticalExercise.findOne({
        bootcampId,
        _id: { $nin: completedExercises }
      }).sort({ week: 1, createdAt: 1 });

      // Get first uncompleted assignment
      const completedAssignments = en.completedAssignments;
      const nextAssignment = await Assignment.findOne({
        bootcampId,
        _id: { $nin: completedAssignments }
      }).sort({ week: 1, createdAt: 1 });

      let nextAction = 'Browse Curriculum';
      let nextActionLink = `/learn/bootcamps/${bootcampId}`;

      if (nextLesson) {
        nextAction = `Study Lesson: ${nextLesson.title}`;
        nextActionLink = `/learn/lessons/${nextLesson._id}`;
      } else if (nextExercise) {
        nextAction = `Practice Exercise: ${nextExercise.title}`;
        nextActionLink = `/learn/exercises/${nextExercise._id}`;
      } else if (nextAssignment) {
        nextAction = `Submit Assignment: ${nextAssignment.title}`;
        nextActionLink = `/learn/assignments/${nextAssignment._id}`;
      } else if (!en.completedGuidedProject) {
        const gp = await GuidedProject.findOne({ bootcampId });
        if (gp) {
          nextAction = `Build Guided Project: ${gp.title}`;
          nextActionLink = `/learn/guided-project/${gp._id}`;
        }
      } else if (!en.completedCapstone) {
        const cap = await Capstone.findOne({ bootcampId });
        if (cap) {
          nextAction = `Work on Capstone Project: ${cap.title}`;
          nextActionLink = `/learn/capstone/${cap._id}`;
        }
      }

      return {
        enrollment: en,
        nextAction,
        nextActionLink
      };
    }));

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Exclude bootcamps user is already enrolled in
    const enrolled = await LearningEnrollment.find({ studentId: req.user.id }).select('bootcampId');
    const enrolledIds = enrolled.map(e => e.bootcampId.toString());

    // Basic rule-based recommendations: suggest bootcamps matching user interest skills
    const userSkillNames = user.skills.map(s => s.name.toLowerCase());

    const allBootcamps = await Bootcamp.find({
      status: 'published',
      isActive: true,
      _id: { $nin: enrolledIds }
    }).populate('mentorId', 'name username avatar');

    const recommended = allBootcamps.map(bc => {
      let score = 0;
      if (bc.skillsCovered) {
        bc.skillsCovered.forEach(s => {
          if (userSkillNames.includes(s.toLowerCase())) score += 2;
        });
      }
      // Boost match if bootcamp category matches user title/profile
      if (user.title && bc.category && user.title.toLowerCase().includes(bc.category.toLowerCase())) {
        score += 3;
      }
      return { bootcamp: bc, score };
    }).sort((a, b) => b.score - a.score);

    res.json(recommended.slice(0, 4).map(r => r.bootcamp));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Find all completed activities for user to count skill progression
    const enrollments = await LearningEnrollment.find({ studentId: req.user.id });

    // Sum skill hits
    const skillProgress = {};

    for (const en of enrollments) {
      const bootcamp = await Bootcamp.findById(en.bootcampId);
      if (bootcamp && bootcamp.skillsCovered) {
        bootcamp.skillsCovered.forEach(s => {
          if (!skillProgress[s]) {
            skillProgress[s] = { count: 0, level: 'Started' };
          }
          // Progress level logic based on enrollment progress
          if (en.progress >= 100) {
            skillProgress[s].count += 10;
          } else if (en.progress >= 50) {
            skillProgress[s].count += 5;
          } else {
            skillProgress[s].count += 2;
          }
        });
      }
    }

    // Convert counts to levels
    Object.keys(skillProgress).forEach(skill => {
      const count = skillProgress[skill].count;
      if (count >= 15) skillProgress[skill].level = 'Demonstrated';
      else if (count >= 8) skillProgress[skill].level = 'Practicing';
      else if (count >= 3) skillProgress[skill].level = 'Learning';
      else skillProgress[skill].level = 'Started';
    });

    res.json(skillProgress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// MENTOR WORKSPACE CONTROLLERS
// ==========================================

const getMentorDashboard = async (req, res) => {
  try {
    const bootcamps = await Bootcamp.find({ mentorId: req.user.id });
    const bootcampIds = bootcamps.map(b => b._id);

    const totalBootcamps = bootcamps.length;
    const activeBootcamps = bootcamps.filter(b => b.isActive).length;

    // Enrollments
    const enrollments = await LearningEnrollment.find({ bootcampId: { $in: bootcampIds } });
    const totalLearners = enrollments.length;
    const completedLearners = enrollments.filter(e => e.status === 'completed').length;
    const completionRate = totalLearners > 0 ? Math.round((completedLearners / totalLearners) * 100) : 0;

    // Submissions requiring review
    const assignments = await Assignment.find({ bootcampId: { $in: bootcampIds } });
    const assignmentIds = assignments.map(a => a._id);

    const pendingSubmissions = await AssignmentSubmission.countDocuments({
      assignmentId: { $in: assignmentIds },
      status: { $in: ['submitted', 'under-review'] }
    });

    res.json({
      totalBootcamps,
      activeBootcamps,
      totalLearners,
      completionRate,
      pendingSubmissions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMentorStudents = async (req, res) => {
  try {
    const bootcamps = await Bootcamp.find({ mentorId: req.user.id });
    const bootcampIds = bootcamps.map(b => b._id);

    const enrollments = await LearningEnrollment.find({ bootcampId: { $in: bootcampIds } })
      .populate('studentId', 'name username avatar email')
      .populate('bootcampId', 'title category');

    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMentorSubmissions = async (req, res) => {
  try {
    const bootcamps = await Bootcamp.find({ mentorId: req.user.id });
    const bootcampIds = bootcamps.map(b => b._id);

    const assignments = await Assignment.find({ bootcampId: { $in: bootcampIds } });
    const assignmentIds = assignments.map(a => a._id);

    const submissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignmentIds },
      status: { $in: ['submitted', 'under-review'] }
    })
      .populate('studentId', 'name username avatar')
      .populate('assignmentId', 'title week');

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateMentorProfile = async (req, res) => {
  try {
    const { bio, expertise, technologies, experienceSummary } = req.body;
    if (!bio) return res.status(400).json({ message: 'Bio is required' });

    let profile = await MentorProfile.findOne({ userId: req.user.id });
    if (profile) {
      profile.bio = bio;
      profile.expertise = expertise || [];
      profile.technologies = technologies || [];
      profile.experienceSummary = experienceSummary;
      await profile.save();
    } else {
      profile = new MentorProfile({
        userId: req.user.id,
        bio,
        expertise: expertise || [],
        technologies: technologies || [],
        experienceSummary
      });
      await profile.save();
    }

    // Set User.learningTrack.isMentor
    const user = await User.findById(req.user.id);
    if (user) {
      user.learningTrack.isMentor = true;
      user.learningTrack.mentorProfile = {
        bio,
        expertise: expertise || [],
        rating: profile.rating,
        totalStudents: profile.totalStudents
      };
      await user.save();

      // Award mentor points
      await pointsService.addPoints(user, 'becomeMentor', req.io);
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==========================================
// BUILD TRANSITION CONTROLLERS
// ==========================================

const getBuildReadiness = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const enrollments = await LearningEnrollment.find({ studentId: req.user.id });
    const completedCount = enrollments.filter(e => e.status === 'completed').length;

    const isReady = completedCount > 0;

    res.json({
      isReady,
      completedCount,
      transitionedAt: user.transitionStatus?.transitionedAt || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRecommendedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const skillNames = user.skills.map(s => s.name.toLowerCase());

    const projects = await Project.find({
      ownerId: { $ne: req.user.id },
      members: { $ne: req.user.id },
      status: 'planning'
    }).populate('ownerId', 'name username avatar');

    const recommended = projects.sort((a, b) => {
      const aMatches = a.requiredSkills.filter(s => skillNames.includes(s.toLowerCase())).length;
      const bMatches = b.requiredSkills.filter(s => skillNames.includes(s.toLowerCase())).length;
      return bMatches - aMatches;
    });

    res.json(recommended.slice(0, 6));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const transitionToBuild = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate readiness
    const enrollments = await LearningEnrollment.find({ studentId: req.user.id });
    const completedCount = enrollments.filter(e => e.status === 'completed').length;
    if (completedCount === 0) {
      return res.status(400).json({ message: 'You must graduate from at least one bootcamp before transitioning.' });
    }

    user.transitionStatus.isEligible = false;
    user.transitionStatus.transitionedAt = new Date();
    user.markModified('transitionStatus');
    await user.save();

    await pointsService.addPoints(user, 'transitionToBuild', req.io);
    await badgeService.awardBadge(user, 'Ready to Build', req.io);

    const notification = new Notification({
      userId: user._id,
      message: `🚀 Transition Completed! You are now in the BUILD track. Form team projects or join the explorer board!`,
      type: 'system',
      category: 'system',
      priority: 'high',
      link: '/projects'
    });
    await notification.save();
    if (req.io) {
      req.io.to(user._id.toString()).emit('notification', notification);
    }

    res.json({ message: 'Transitioned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  enrollBootcamp,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  completeLesson,
  getExercise,
  createExercise,
  updateExercise,
  submitExercise,
  getAssignment,
  createAssignment,
  updateAssignment,
  submitAssignment,
  reviewAssignment,
  getGuidedProject,
  createGuidedProject,
  updateGuidedProject,
  submitGuidedProject,
  getCapstone,
  createCapstone,
  updateCapstone,
  submitCapstone,
  convertToProject,
  getMyProgress,
  getMyLearning,
  getRecommendations,
  getSkills,
  getMentorDashboard,
  getMentorStudents,
  getMentorSubmissions,
  updateMentorProfile,
  getBuildReadiness,
  getRecommendedProjects,
  transitionToBuild
};
