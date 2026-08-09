const Bootcamp = require('../models/Bootcamp');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const pointsService = require('../services/pointsService');
const { awardBadge } = require('../services/badgeService');

// Get mentor dashboard stats
const getDashboard = async (req, res) => {
  try {
    const bootcamps = await Bootcamp.find({ mentorId: req.user.id });
    const bootcampIds = bootcamps.map(b => b._id);

    // Total Students (unique Set)
    const studentIds = new Set();
    let totalProgressSum = 0;
    let totalStudentsCount = 0;

    bootcamps.forEach(bc => {
      bc.enrolledStudents.forEach(s => {
        studentIds.add(s.studentId.toString());
        totalProgressSum += s.progress;
        totalStudentsCount++;
      });
    });

    const averageProgress = totalStudentsCount > 0 ? Math.round(totalProgressSum / totalStudentsCount) : 0;

    // Pending Submissions count
    const assignments = await Assignment.find({ bootcampId: { $in: bootcampIds } });
    let pendingSubmissions = 0;
    assignments.forEach(as => {
      as.submissions.forEach(sub => {
        if (sub.status === 'pending') pendingSubmissions++;
      });
    });

    res.json({
      totalBootcamps: bootcamps.length,
      totalStudents: studentIds.size,
      pendingSubmissions,
      averageProgress
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all students across mentor bootcamps
const getStudents = async (req, res) => {
  try {
    const bootcamps = await Bootcamp.find({ mentorId: req.user.id })
      .populate('enrolledStudents.studentId', 'name username avatar email title location points level');

    const studentsMap = {};
    bootcamps.forEach(bc => {
      bc.enrolledStudents.forEach(record => {
        const student = record.studentId;
        if (!student) return;
        
        const key = student._id.toString();
        if (!studentsMap[key]) {
          studentsMap[key] = {
            studentId: student._id,
            name: student.name,
            username: student.username,
            avatar: student.avatar,
            email: student.email,
            title: student.title,
            location: student.location,
            points: student.points,
            level: student.level,
            bootcamps: []
          };
        }
        studentsMap[key].bootcamps.push({
          bootcampId: bc._id,
          bootcampTitle: bc.title,
          progress: record.progress,
          enrolledAt: record.enrolledAt,
          status: record.status
        });
      });
    });

    res.json(Object.values(studentsMap));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update mentor profile
const updateProfile = async (req, res) => {
  try {
    const { bio, expertise } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const wasMentorBefore = user.learningTrack.isMentor;
    user.learningTrack.isMentor = true;
    user.learningTrack.mentorProfile = {
      bio: bio || user.learningTrack.mentorProfile.bio || '',
      expertise: expertise || user.learningTrack.mentorProfile.expertise || [],
      rating: user.learningTrack.mentorProfile.rating || 5,
      totalStudents: user.learningTrack.mentorProfile.totalStudents || 0
    };

    user.markModified('learningTrack');
    await user.save();

    // Award rewards for newly becoming a mentor
    if (!wasMentorBefore) {
      await pointsService.addPoints(user, 'becomeMentor', req.io);
      await awardBadge(user, 'Mentor', req.io);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboard,
  getStudents,
  updateProfile
};
