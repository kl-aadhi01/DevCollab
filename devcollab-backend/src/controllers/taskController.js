const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const { awardBadge } = require('../services/badgeService');
const { updateMemberActivity } = require('../utils/activityHelper');

const createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignedTo, priority, deadline } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ message: 'Project ID and title are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const task = new Task({
      projectId,
      title,
      description,
      assignedTo: assignedTo || null,
      priority,
      deadline
    });
    await task.save();

    const creator = await User.findById(req.user.id);
    await pointsService.addPoints(creator, 'createTask', req.io);

    if (assignedTo && assignedTo.toString() !== req.user.id) {
      const notification = new Notification({
        userId: assignedTo,
        message: `📋 You have been assigned a new task: "${title}" in project: ${project.name}`,
        type: 'task',
        category: 'task',
        priority: 'medium',
        link: `/projects/${project._id}`
      });
      await notification.save();

      if (req.io) {
        req.io.to(assignedTo.toString()).emit('notification', notification);
      }
    }

    await updateMemberActivity(projectId, req.user.id);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getTasksForProject = async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.id })
      .populate('assignedTo', 'name username avatar title')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const { title, description, assignedTo, status, priority, deadline } = req.body;
    const oldStatus = task.status;
    const oldAssignee = task.assignedTo;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (deadline !== undefined) task.deadline = deadline;

    await task.save();
    await updateMemberActivity(task.projectId, req.user.id);

    if (status === 'done' && oldStatus !== 'done' && task.assignedTo) {
      const assignee = await User.findById(task.assignedTo);
      if (assignee) {
        await pointsService.addPoints(assignee, 'completeTask', req.io);

        const completedTasksCount = await Task.countDocuments({
          assignedTo: assignee._id,
          status: 'done'
        });

        if (completedTasksCount >= 10) {
          await awardBadge(assignee, 'Task Master', req.io);
        }
        if (completedTasksCount >= 50) {
          await awardBadge(assignee, 'Task Champion', req.io);
        }
      }
    }

    if (assignedTo && assignedTo.toString() !== req.user.id && (!oldAssignee || oldAssignee.toString() !== assignedTo.toString())) {
      const notification = new Notification({
        userId: assignedTo,
        message: `📋 You have been assigned a task: "${task.title}" in project: ${project.name}`,
        type: 'task',
        category: 'task',
        priority: 'medium',
        link: `/projects/${project._id}`
      });
      await notification.save();

      if (req.io) {
        req.io.to(assignedTo.toString()).emit('notification', notification);
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('projectId', 'name')
      .sort({ deadline: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createTask,
  getTasksForProject,
  updateTask,
  deleteTask,
  getMyTasks
};
