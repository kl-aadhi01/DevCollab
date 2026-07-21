const Application = require('../models/Application');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const { awardBadge } = require('../services/badgeService');

const applyToProject = async (req, res) => {
  try {
    const { projectId, message } = req.body;
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this project' });
    }

    const existingApplication = await Application.findOne({ projectId, applicantId: req.user.id, status: 'pending' });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have a pending application for this project' });
    }

    const application = new Application({
      projectId,
      applicantId: req.user.id,
      message
    });
    await application.save();

    const applicant = await User.findById(req.user.id);
    const notification = new Notification({
      userId: project.ownerId,
      message: `🔔 ${applicant.name} applied to join your project: ${project.name}`,
      type: 'application',
      category: 'collaboration',
      priority: 'medium',
      link: `/projects/${project._id}`
    });
    await notification.save();

    if (req.io) {
      req.io.to(project.ownerId.toString()).emit('notification', notification);
    }

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getApplicationsForProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const applications = await Application.find({ projectId: req.params.id })
      .populate('applicantId', 'name username avatar email title bio skills location socialLinks points level rank');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const acceptApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const project = await Project.findById(application.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application has already been processed' });
    }

    if (project.members.includes(application.applicantId)) {
      application.status = 'accepted';
      await application.save();
      return res.status(400).json({ message: 'Applicant is already a member' });
    }

    project.members.push(application.applicantId);
    await project.save();

    const applicant = await User.findById(application.applicantId);
    applicant.projectsJoined.push(project._id);
    await applicant.save();

    application.status = 'accepted';
    await application.save();

    await pointsService.addPoints(applicant, 'joinProject', req.io);
    await awardBadge(applicant, 'Team Player', req.io);

    if (project.members.length >= 3) {
      const owner = await User.findById(project.ownerId);
      await awardBadge(owner, 'Team Builder', req.io);
    }

    const notification = new Notification({
      userId: application.applicantId,
      message: `🎉 Your application to join project "${project.name}" was accepted!`,
      type: 'application',
      category: 'project',
      priority: 'high',
      link: `/projects/${project._id}`
    });
    await notification.save();

    if (req.io) {
      req.io.to(application.applicantId.toString()).emit('notification', notification);
    }

    res.json({ message: 'Application accepted successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rejectApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const project = await Project.findById(application.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application has already been processed' });
    }

    application.status = 'rejected';
    await application.save();

    const notification = new Notification({
      userId: application.applicantId,
      message: `😔 Your application to join "${project.name}" was declined.`,
      type: 'application',
      category: 'project',
      priority: 'low'
    });
    await notification.save();

    if (req.io) {
      req.io.to(application.applicantId.toString()).emit('notification', notification);
    }

    res.json({ message: 'Application declined successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  applyToProject,
  getApplicationsForProject,
  acceptApplication,
  rejectApplication
};
