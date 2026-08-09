const User = require('../models/User');
const Project = require('../models/Project');
const Bootcamp = require('../models/Bootcamp');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const { awardBadge } = require('../services/badgeService');

// Check transition status
const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      isEligible: user.transitionStatus?.isEligible || false,
      recommendedProjects: user.transitionStatus?.recommendedProjects || [],
      completedBootcampsCount: user.learningTrack?.completedBootcamps?.length || 0,
      transitionedAt: user.transitionStatus?.transitionedAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Transition learner to BUILD track
const transitionToBuild = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hasCompletedBootcamps = user.learningTrack.completedBootcamps.length > 0;
    const isEligible = user.transitionStatus.isEligible;

    if (!isEligible && !hasCompletedBootcamps) {
      return res.status(400).json({ message: 'You are not eligible to transition yet. Complete a bootcamp first.' });
    }

    // Set transition status
    user.transitionStatus.isEligible = false;
    user.transitionStatus.transitionedAt = new Date();
    user.markModified('transitionStatus');
    await user.save();

    // Award transition points and badge
    await pointsService.addPoints(user, 'transitionToBuild', req.io);
    await awardBadge(user, 'Ready to Build', req.io);

    // Create system notification
    const notification = new Notification({
      userId: user._id,
      message: `🚀 Welcome to the BUILD track! You can now participate in real project collaboration, form teams, and use the developer marketplace.`,
      type: 'system',
      category: 'system',
      priority: 'high',
      link: '/projects'
    });
    await notification.save();

    if (req.io) {
      req.io.to(user._id.toString()).emit('notification', notification);
    }

    res.json({ message: 'Successfully transitioned to BUILD track', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recommended projects for transitioning learners
const getRecommendedProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract user skill names
    const skillNames = user.skills.map(s => s.name.toLowerCase());

    // Recommend projects looking for collaborators
    const projects = await Project.find({
      ownerId: { $ne: req.user.id },
      members: { $ne: req.user.id },
      status: 'planning'
    }).populate('ownerId', 'name username avatar');

    // Sort by skill match
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

// Create capstone team/project from bootcamp graduates (Mentor only)
const createTeam = async (req, res) => {
  try {
    const { bootcampId, projectName, projectDescription } = req.body;
    if (!bootcampId) {
      return res.status(400).json({ message: 'Missing bootcamp ID' });
    }

    const bootcamp = await Bootcamp.findById(bootcampId);
    if (!bootcamp) {
      return res.status(404).json({ message: 'Bootcamp not found' });
    }

    if (bootcamp.mentorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Find completed graduates (enrolled students who completed course or status is 'completed')
    const graduates = bootcamp.enrolledStudents.filter(s => s.status === 'completed' || s.progress >= 100);
    if (graduates.length === 0) {
      return res.status(400).json({ message: 'No graduates found for this bootcamp to form a team' });
    }

    const graduateIds = graduates.map(g => g.studentId);

    // Create the capstone project
    const project = new Project({
      name: projectName || `${bootcamp.title} Capstone Project`,
      description: projectDescription || bootcamp.capstoneProject.description || `Capstone project for graduates of ${bootcamp.title}`,
      requiredSkills: bootcamp.capstoneProject.requiredSkills || bootcamp.prerequisites || [],
      teamSize: bootcamp.capstoneProject.teamSize || 4,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // Default 45 days deadline
      ownerId: graduateIds[0], // First graduate is the initial project owner
      members: graduateIds,
      bootcampId: bootcamp._id,
      status: 'planning'
    });

    await project.save();

    // Link project to each graduate's profile and notify them
    for (const gradId of graduateIds) {
      const student = await User.findById(gradId);
      if (student) {
        student.projectsJoined.push(project._id);
        if (gradId.toString() === graduateIds[0].toString()) {
          student.projectsOwned.push(project._id);
        }
        
        student.transitionStatus.isEligible = true;
        if (!student.transitionStatus.recommendedProjects.includes(project._id)) {
          student.transitionStatus.recommendedProjects.push(project._id);
        }
        
        student.markModified('projectsJoined');
        student.markModified('projectsOwned');
        student.markModified('transitionStatus');
        await student.save();

        // Create Notification
        const notification = new Notification({
          userId: student._id,
          message: `👥 Capstone Team Formed! You have been added to "${project.name}" as part of your bootcamp graduation!`,
          type: 'system',
          category: 'project',
          priority: 'high',
          link: `/projects/${project._id}`
        });
        await notification.save();

        if (req.io) {
          req.io.to(student._id.toString()).emit('notification', notification);
        }
      }
    }

    res.status(201).json({ message: 'Capstone team project created successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStatus,
  transitionToBuild,
  getRecommendedProjects,
  createTeam
};
