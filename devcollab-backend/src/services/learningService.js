const User = require('../models/User');
const Bootcamp = require('../models/Bootcamp');
const Notification = require('../models/Notification');
const pointsService = require('./pointsService');
const badgeService = require('./badgeService');

// Award student milestones
const handleWeekCompletion = async (userId, bootcampId, weekNumber, io) => {
  try {
    const user = await User.findById(userId);
    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!user || !bootcamp) return;

    // Find enrolled student record
    const studentRecord = bootcamp.enrolledStudents.find(s => s.studentId.toString() === userId.toString());
    if (!studentRecord) return;

    if (studentRecord.completedWeeks.includes(weekNumber)) return;

    // Add week to completed
    studentRecord.completedWeeks.push(weekNumber);
    
    // Update progress
    studentRecord.progress = Math.round((studentRecord.completedWeeks.length / bootcamp.curriculum.length) * 100);
    
    // Save bootcamp
    await bootcamp.save();

    // Update user's progress in learningTrack.enrolledBootcamps
    const userBootcamp = user.learningTrack.enrolledBootcamps.find(b => b.bootcampId.toString() === bootcampId.toString());
    if (userBootcamp) {
      userBootcamp.progress = studentRecord.progress;
      if (studentRecord.progress >= 100) {
        userBootcamp.status = 'completed';
      }
      user.markModified('learningTrack.enrolledBootcamps');
      await user.save();
    }

    // Award points for completing week
    await pointsService.addPoints(user, 'completeWeek', io);

    // Check badges
    // 1. First Lesson (1 week completed)
    if (studentRecord.completedWeeks.length === 1) {
      await badgeService.awardBadge(user, 'First Lesson', io);
    }

    // 2. Week 1 Complete (explicitly week 1 completed)
    if (weekNumber === 1) {
      await badgeService.awardBadge(user, 'Week 1 Complete', io);
    }

    // 3. Halfway There (>= 50% progress)
    if (studentRecord.progress >= 50) {
      await badgeService.awardBadge(user, 'Halfway There', io);
    }

    // 4. Bootcamp Graduate (100% progress)
    if (studentRecord.progress >= 100) {
      studentRecord.status = 'completed';
      await bootcamp.save();

      if (!user.learningTrack.completedBootcamps.includes(bootcampId)) {
        user.learningTrack.completedBootcamps.push(bootcampId);
        user.transitionStatus.isEligible = true;
        await user.save();

        // Award graduate points & badge
        await pointsService.addPoints(user, 'completeBootcamp', io);
        await badgeService.awardBadge(user, 'Bootcamp Graduate', io);

        // Notify user they can transition to build track
        const notification = new Notification({
          userId: user._id,
          message: `🎓 Graduation! You finished "${bootcamp.title}"! You are now eligible to transition to the BUILD track and form or join teams!`,
          type: 'system',
          category: 'system',
          priority: 'high',
          link: '/transition'
        });
        await notification.save();
        if (io) {
          io.to(user._id.toString()).emit('notification', notification);
        }

        // Reward Mentor
        const mentor = await User.findById(bootcamp.mentorId);
        if (mentor) {
          await pointsService.addPoints(mentor, 'graduateStudent', io);
          // Check mentor scale badges
          await updateMentorStatsAndBadges(mentor, io);
        }
      }
    }
  } catch (error) {
    console.error("Error handling week completion:", error);
  }
};

const updateMentorStatsAndBadges = async (mentor, io) => {
  try {
    // Count unique students across all of this mentor's bootcamps
    const bootcamps = await Bootcamp.find({ mentorId: mentor._id });
    const studentIds = new Set();
    bootcamps.forEach(bc => {
      bc.enrolledStudents.forEach(s => {
        studentIds.add(s.studentId.toString());
      });
    });

    const totalStudents = studentIds.size;
    mentor.learningTrack.mentorProfile.totalStudents = totalStudents;
    mentor.markModified('learningTrack.mentorProfile');
    await mentor.save();

    // Award teacher badges
    if (totalStudents >= 10) {
      await badgeService.awardBadge(mentor, 'Teacher', io);
    }
    if (totalStudents >= 50) {
      await badgeService.awardBadge(mentor, 'Mentor of the Year', io);
    }
  } catch (error) {
    console.error("Error updating mentor stats and badges:", error);
  }
};

module.exports = {
  handleWeekCompletion,
  updateMentorStatsAndBadges
};
