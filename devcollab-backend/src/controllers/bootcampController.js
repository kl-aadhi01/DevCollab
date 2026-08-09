const Bootcamp = require('../models/Bootcamp');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const badgeService = require('../services/badgeService');
const { handleWeekCompletion } = require('../services/learningService');

// Get all bootcamps with filters
const getBootcamps = async (req, res) => {
  try {
    const { category, level, search } = req.query;
    let query = { isActive: true };

    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const bootcamps = await Bootcamp.find(query)
      .populate('mentorId', 'name username avatar learningTrack.mentorProfile')
      .sort({ createdAt: -1 });

    res.json(bootcamps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new bootcamp (Mentor only)
const createBootcamp = async (req, res) => {
  try {
    const { title, description, category, level, duration, prerequisites, curriculum, capstoneProject, maxStudents, startDate, endDate } = req.body;

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
      curriculum: curriculum || [],
      capstoneProject: capstoneProject || { teamSize: 4 },
      maxStudents: maxStudents || 30,
      startDate,
      endDate
    });

    await bootcamp.save();

    // Create Assignment documents automatically for curriculum weeks containing assignment descriptions
    if (curriculum && Array.isArray(curriculum)) {
      for (const item of curriculum) {
        if (item.assignment && item.assignment.title) {
          const assignment = new Assignment({
            bootcampId: bootcamp._id,
            week: item.week,
            title: item.assignment.title,
            description: item.assignment.description,
            deadline: item.assignment.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 * item.week), // Default deadline based on week
            resources: item.resources || []
          });
          await assignment.save();
        }
      }
    }

    res.status(201).json(bootcamp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single bootcamp by ID
const getBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id)
      .populate('mentorId', 'name username avatar learningTrack.mentorProfile')
      .populate('enrolledStudents.studentId', 'name username avatar title location points level');

    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    res.json(bootcamp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update bootcamp (Mentor only)
const updateBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const fieldsToUpdate = [
      'title', 'description', 'category', 'level', 'duration',
      'prerequisites', 'curriculum', 'capstoneProject', 'maxStudents',
      'startDate', 'endDate', 'isActive'
    ];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        bootcamp[field] = req.body[field];
      }
    });

    await bootcamp.save();

    // Re-sync assignments if curriculum is updated
    if (req.body.curriculum) {
      // Find existing assignments
      const existingAssignments = await Assignment.find({ bootcampId: bootcamp._id });
      
      for (const item of req.body.curriculum) {
        if (item.assignment && item.assignment.title) {
          const match = existingAssignments.find(a => a.week === item.week);
          if (match) {
            match.title = item.assignment.title;
            match.description = item.assignment.description;
            if (item.assignment.deadline) match.deadline = item.assignment.deadline;
            match.resources = item.resources || [];
            await match.save();
          } else {
            const assignment = new Assignment({
              bootcampId: bootcamp._id,
              week: item.week,
              title: item.assignment.title,
              description: item.assignment.description,
              deadline: item.assignment.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 * item.week),
              resources: item.resources || []
            });
            await assignment.save();
          }
        }
      }
    }

    res.json(bootcamp);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete bootcamp (Mentor only)
const deleteBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Delete associated assignments
    await Assignment.deleteMany({ bootcampId: bootcamp._id });
    await bootcamp.deleteOne();

    res.json({ message: 'Bootcamp deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Enroll in bootcamp
const enrollBootcamp = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    if (!bootcamp.isActive) {
      return res.status(400).json({ message: 'This bootcamp is currently not active' });
    }

    // Check if student is already enrolled
    const alreadyEnrolled = bootcamp.enrolledStudents.some(s => s.studentId.toString() === req.user.id);
    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'You are already enrolled in this bootcamp' });
    }

    if (bootcamp.enrolledStudents.length >= bootcamp.maxStudents) {
      return res.status(400).json({ message: 'This bootcamp is full' });
    }

    // Enroll student
    bootcamp.enrolledStudents.push({
      studentId: req.user.id,
      enrolledAt: new Date(),
      progress: 0,
      completedWeeks: [],
      status: 'active'
    });

    await bootcamp.save();

    // Update user profile
    const user = await User.findById(req.user.id);
    user.learningTrack.enrolledBootcamps.push({
      bootcampId: bootcamp._id,
      enrolledAt: new Date(),
      progress: 0,
      status: 'active'
    });
    user.markModified('learningTrack.enrolledBootcamps');
    await user.save();

    // Award enrollment points
    await pointsService.addPoints(user, 'enrollBootcamp', req.io);

    // Create Notification
    const notification = new Notification({
      userId: user._id,
      message: `🎉 Successfully enrolled in bootcamp: "${bootcamp.title}"! Start your learning journey now.`,
      type: 'system',
      category: 'system',
      priority: 'medium',
      link: `/bootcamps/${bootcamp._id}`
    });
    await notification.save();

    if (req.io) {
      req.io.to(user._id.toString()).emit('notification', notification);
    }

    // Notify mentor
    const mentorNotification = new Notification({
      userId: bootcamp.mentorId,
      message: `🧑‍🎓 A new student (${user.username}) has enrolled in your bootcamp: "${bootcamp.title}".`,
      type: 'system',
      category: 'system',
      priority: 'low',
      link: `/bootcamps/${bootcamp._id}`
    });
    await mentorNotification.save();
    if (req.io) {
      req.io.to(bootcamp.mentorId.toString()).emit('notification', mentorNotification);
    }

    res.json({ message: 'Successfully enrolled', bootcamp });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update student progress (week completion)
const updateProgress = async (req, res) => {
  try {
    const { week } = req.body;
    const bootcampId = req.params.id;

    if (week === undefined) {
      return res.status(400).json({ message: 'Missing week number' });
    }

    await handleWeekCompletion(req.user.id, bootcampId, Number(week), req.io);

    const updatedBootcamp = await Bootcamp.findById(bootcampId)
      .populate('mentorId', 'name username avatar')
      .populate('enrolledStudents.studentId', 'name username avatar points level');

    res.json({ message: 'Progress updated successfully', bootcamp: updatedBootcamp });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get enrolled students (Mentor only)
const getEnrolledStudents = async (req, res) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id).populate('enrolledStudents.studentId', 'name username avatar email title location points level');
    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    res.json(bootcamp.enrolledStudents);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get bootcamps by mentor
const getMentorBootcamps = async (req, res) => {
  try {
    const mentorId = req.params.mentorId || req.user.id;
    const bootcamps = await Bootcamp.find({ mentorId }).sort({ createdAt: -1 });
    res.json(bootcamps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user enrolled bootcamps
const getUserEnrolledBootcamps = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const bootcampIds = user.learningTrack.enrolledBootcamps.map(b => b.bootcampId);
    
    const bootcamps = await Bootcamp.find({ _id: { $in: bootcampIds } })
      .populate('mentorId', 'name username avatar learningTrack.mentorProfile');

    res.json(bootcamps);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommended bootcamps based on user skills
const getRecommendedBootcamps = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const enrolledIds = user.learningTrack.enrolledBootcamps.map(b => b.bootcampId.toString());

    // Extract user skill names
    const skillNames = user.skills.map(s => s.name.toLowerCase());

    // Find bootcamps excluding enrolled, active only, and not owned
    let query = {
      _id: { $nin: enrolledIds },
      mentorId: { $ne: req.user.id },
      isActive: true
    };

    const allBootcamps = await Bootcamp.find(query).populate('mentorId', 'name username avatar');
    
    // Sort recommendations: those matching user skills first, otherwise beginner/intermediate courses
    const recommended = allBootcamps.sort((a, b) => {
      const aMatches = a.prerequisites.some(p => skillNames.includes(p.toLowerCase())) || skillNames.includes(a.category.toLowerCase());
      const bMatches = b.prerequisites.some(p => skillNames.includes(p.toLowerCase())) || skillNames.includes(b.category.toLowerCase());
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });

    res.json(recommended.slice(0, 6));
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
  updateProgress,
  getEnrolledStudents,
  getMentorBootcamps,
  getUserEnrolledBootcamps,
  getRecommendedBootcamps
};
