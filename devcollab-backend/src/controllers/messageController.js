const Message = require('../models/Message');
const Project = require('../models/Project');
const { updateMemberActivity } = require('../utils/activityHelper');

const getChatHistory = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'You must be a member to view messages' });
    }

    const messages = await Message.find({ projectId: req.params.id })
      .populate('senderId', 'name username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { projectId, content } = req.body;
    if (!projectId || !content) {
      return res.status(400).json({ message: 'Project ID and content are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!project.members.map(m => m.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'You must be a member to send messages' });
    }

    const message = new Message({
      projectId,
      senderId: req.user.id,
      content
    });
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name username avatar');

    if (req.io) {
      req.io.to(projectId.toString()).emit('receive_message', populatedMessage);
    }

    await updateMemberActivity(projectId, req.user.id);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getChatHistory,
  sendMessage
};
