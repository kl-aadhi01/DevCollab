const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const { awardBadge } = require('../services/badgeService');
const { calculateReliabilityScore } = require('../services/reliabilityScoreService');

const getProjects = async (req, res) => {
  try {
    const { search, skill, status } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (skill) {
      query.requiredSkills = { $in: [skill] };
    }
    if (status) {
      query.status = status;
    }

    const projects = await Project.find(query)
      .populate('ownerId', 'name username avatar title location')
      .populate('members', 'name username avatar title')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, requiredSkills, teamSize, deadline, githubRepo, roadmap } = req.body;
    
    if (!name || !description || !requiredSkills || !teamSize || !deadline) {
      return res.status(400).json({ message: 'Missing required project details' });
    }

    const project = new Project({
      name,
      description,
      requiredSkills,
      teamSize,
      deadline,
      githubRepo,
      roadmap: roadmap || [],
      ownerId: req.user.id,
      members: [req.user.id]
    });

    await project.save();

    const user = await User.findById(req.user.id);
    user.projectsOwned.push(project._id);
    user.projectsJoined.push(project._id);
    await user.save();

    await pointsService.addPoints(user, 'createProject', req.io);
    await awardBadge(user, 'Project Creator', req.io);

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('ownerId', 'name username avatar email title bio location socialLinks')
      .populate('members', 'name username avatar email title bio location socialLinks points level rank badges');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const { name, description, requiredSkills, teamSize, deadline, githubRepo, status } = req.body;
    const oldStatus = project.status;

    if (name) project.name = name;
    if (description) project.description = description;
    if (requiredSkills) project.requiredSkills = requiredSkills;
    if (teamSize) project.teamSize = teamSize;
    if (deadline) project.deadline = deadline;
    if (githubRepo !== undefined) project.githubRepo = githubRepo;
    if (status) project.status = status;

    await project.save();

    if (status === 'completed' && oldStatus !== 'completed') {
      const owner = await User.findById(project.ownerId);
      await pointsService.addPoints(owner, 'completeProject', req.io);
      await awardBadge(owner, 'Project Completer', req.io);

      const completedOwnedProjectsCount = await Project.countDocuments({
        ownerId: owner._id,
        status: 'completed'
      });
      if (completedOwnedProjectsCount >= 3) {
        await awardBadge(owner, 'Leader', req.io);
      }
      if (completedOwnedProjectsCount >= 5) {
        await awardBadge(owner, 'Project Master', req.io);
      }

      for (const memberId of project.members) {
        if (memberId.toString() !== project.ownerId.toString()) {
          const member = await User.findById(memberId);
          if (member) {
            await pointsService.addPoints(member, 'completeProject', req.io);
            await awardBadge(member, 'Project Completer', req.io);
          }
        }

        // Notify all members to rate teammates
        const notification = new Notification({
          userId: memberId,
          message: `🏆 Project "${project.name}" marked as completed! Rate your teammates to update reliability scores.`,
          type: 'info',
          category: 'rating',
          priority: 'high',
          link: `/projects/${project._id}`
        });
        await notification.save();

        if (req.io) {
          req.io.to(memberId.toString()).emit('notification', notification);
          req.io.to(memberId.toString()).emit('rating_prompt', { projectId: project._id, projectName: project.name });
        }

        // Recalculate reliability score on completion
        await calculateReliabilityScore(memberId);
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await User.updateMany(
      { _id: { $in: project.members } },
      { $pull: { projectsJoined: project._id, projectsOwned: project._id } }
    );

    await project.deleteOne();
    res.json({ message: 'Project removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateRoadmap = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const { roadmap } = req.body;
    if (!roadmap) {
      return res.status(400).json({ message: 'Roadmap payload missing' });
    }

    let completedMilestonesIncrement = 0;
    const oldRoadmap = project.roadmap;
    
    roadmap.forEach(phase => {
      if (phase.milestones) {
        phase.milestones.forEach(m => {
          if (m.status === 'completed') {
            let wasCompleted = false;
            if (oldRoadmap) {
              oldRoadmap.forEach(oldPhase => {
                if (oldPhase.milestones) {
                  oldPhase.milestones.forEach(oldM => {
                    if (oldM.title === m.title && oldM.status === 'completed') {
                      wasCompleted = true;
                    }
                  });
                }
              });
            }
            if (!wasCompleted) {
              completedMilestonesIncrement++;
              m.completedAt = new Date();
            }
          }
        });
      }
    });

    project.roadmap = roadmap;

    let totalMilestones = 0;
    let completedMilestones = 0;
    roadmap.forEach(phase => {
      if (phase.milestones) {
        phase.milestones.forEach(m => {
          totalMilestones++;
          if (m.status === 'completed') completedMilestones++;
        });
      }
    });

    project.progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    await project.save();

    if (completedMilestonesIncrement > 0) {
      for (const memberId of project.members) {
        const member = await User.findById(memberId);
        if (member) {
          for (let c = 0; c < completedMilestonesIncrement; c++) {
            await pointsService.addPoints(member, 'completeMilestone', req.io);
          }
        }
      }
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjectProgress = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ progress: project.progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const leaveProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'Project owners cannot leave their project. Transfer ownership or delete project.' });
    }

    const isMember = project.members.some(m => m.toString() === req.user.id);
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this project' });
    }

    // 1. Remove member from Project
    project.members = project.members.filter(m => m.toString() !== req.user.id);
    if (project.memberActivity) {
      project.memberActivity = project.memberActivity.filter(a => a.userId.toString() !== req.user.id);
    }
    await project.save();

    // 2. Remove project from User's joined projects
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { projectsJoined: project._id }
    });

    // 3. Reassign open tasks to Unassigned (null)
    const Task = require('../models/Task');
    await Task.updateMany(
      { projectId: project._id, assignedTo: req.user.id, status: { $ne: 'done' } },
      { $set: { assignedTo: null } }
    );

    // 4. Notify Owner
    const leavingUser = await User.findById(req.user.id);
    const notification = new Notification({
      userId: project.ownerId,
      message: `👋 Member ${leavingUser?.name || 'A developer'} left project "${project.name}". Their uncompleted tasks are now unassigned.`,
      type: 'info',
      category: 'collaboration',
      priority: 'medium',
      link: `/projects/${project._id}`
    });
    await notification.save();

    if (req.io) {
      req.io.to(project.ownerId.toString()).emit('notification', notification);
    }

    res.json({ message: 'Successfully left the project', projectId: project._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  updateRoadmap,
  getProjectProgress,
  leaveProject
};
