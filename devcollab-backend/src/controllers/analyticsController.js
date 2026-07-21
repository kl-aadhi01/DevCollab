const Project = require('../models/Project');
const Task = require('../models/Task');
const Message = require('../models/Message');
const User = require('../models/User');

const getProjectAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate('members ownerId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project owners can view health analytics' });
    }

    const tasks = await Task.find({ projectId: id });
    const messages = await Message.find({ projectId: id });

    // 1. Per-member Contribution & Overload Analysis
    const memberContributions = [];

    for (const member of project.members) {
      const mIdStr = member._id.toString();
      const memberTasks = tasks.filter(t => t.assignedTo?.toString() === mIdStr);
      const completedTasks = memberTasks.filter(t => t.status === 'done').length;
      const totalAssigned = memberTasks.length;
      const messagesSent = messages.filter(m => m.senderId?.toString() === mIdStr).length;

      // Overload check: distinct active projects with open tasks
      const activeProjectIds = await Task.distinct('projectId', {
        assignedTo: member._id,
        status: { $ne: 'done' }
      });
      const activeProjectsCount = activeProjectIds.length;
      const isOverloaded = activeProjectsCount > 3;

      memberContributions.push({
        userId: member._id,
        name: member.name,
        username: member.username,
        avatar: member.avatar,
        completedTasks,
        totalAssigned,
        messagesSent,
        reliabilityScore: member.reliabilityScore?.score || 50,
        activeProjectsCount,
        isOverloaded
      });
    }

    // 2. Task Status Breakdown
    const statusCounts = {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      review: tasks.filter(t => t.status === 'review').length,
      done: tasks.filter(t => t.status === 'done').length
    };

    // 3. Simple Burndown Timeline (7-day task completion timeline)
    const now = new Date();
    const burndownTimeline = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Tasks created on/before date that were not done on that date
      const tasksCreatedByDate = tasks.filter(t => new Date(t.createdAt) <= date).length;
      const tasksCompletedByDate = tasks.filter(t => t.status === 'done' && new Date(t.updatedAt) <= date).length;
      const remainingTasks = Math.max(0, tasksCreatedByDate - tasksCompletedByDate);

      burndownTimeline.push({
        date: dateLabel,
        totalTasks: tasksCreatedByDate,
        completedTasks: tasksCompletedByDate,
        remainingTasks
      });
    }

    res.json({
      projectId: project._id,
      projectName: project.name,
      totalTasks: tasks.length,
      totalMessages: messages.length,
      memberContributions,
      statusCounts,
      burndownTimeline
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching analytics', error: error.message });
  }
};

module.exports = {
  getProjectAnalytics
};
