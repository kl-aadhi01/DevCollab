const CollaborationRequest = require('../models/CollaborationRequest');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const pointsService = require('../services/pointsService');
const { awardBadge } = require('../services/badgeService');

const sendCollaborationRequest = async (req, res) => {
  try {
    const { receiverId, projectId, message, proposedRole } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    if (receiverId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot send a collaboration request to yourself' });
    }

    if (projectId) {
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      if (project.ownerId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You must own the project to invite collaboration' });
      }
      if (project.members.includes(receiverId)) {
        return res.status(400).json({ message: 'Receiver is already a member of this project' });
      }
    }

    const request = new CollaborationRequest({
      senderId: req.user.id,
      receiverId,
      projectId: projectId || null,
      message,
      proposedRole
    });
    await request.save();

    const sender = await User.findById(req.user.id);
    await pointsService.addPoints(sender, 'sendInvitation', req.io);

    const sentCount = await CollaborationRequest.countDocuments({ senderId: req.user.id });
    if (sentCount >= 10) {
      await awardBadge(sender, 'Networker', req.io);
    }

    const notification = new Notification({
      userId: receiverId,
      message: `📩 You received a collaboration invitation from ${sender.name}`,
      type: 'invitation',
      category: 'collaboration',
      priority: 'high',
      link: '/marketplace'
    });
    await notification.save();

    if (req.io) {
      req.io.to(receiverId.toString()).emit('notification', notification);
    }

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({
      $or: [{ senderId: req.user.id }, { receiverId: req.user.id }]
    })
      .populate('senderId', 'name username avatar title location')
      .populate('receiverId', 'name username avatar title location')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ receiverId: req.user.id })
      .populate('senderId', 'name username avatar title location')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({ senderId: req.user.id })
      .populate('receiverId', 'name username avatar title location')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const acceptRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    if (request.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation has already been processed' });
    }

    request.status = 'accepted';
    request.respondedAt = new Date();
    await request.save();

    if (request.projectId) {
      const project = await Project.findById(request.projectId);
      if (project && !project.members.includes(request.receiverId)) {
        project.members.push(request.receiverId);
        await project.save();

        const receiver = await User.findById(request.receiverId);
        receiver.projectsJoined.push(project._id);
        await receiver.save();
      }
    }

    const receiver = await User.findById(request.receiverId);
    await pointsService.addPoints(receiver, 'acceptInvitation', req.io);

    const sender = await User.findById(request.senderId);
    await pointsService.addPoints(sender, 'collaborate', req.io);

    const senderProjects = await Project.find({ members: sender._id });
    let senderCollaborators = new Set();
    senderProjects.forEach(p => {
      p.members.forEach(m => {
        if (m.toString() !== sender._id.toString()) {
          senderCollaborators.add(m.toString());
        }
      });
    });
    if (senderCollaborators.size >= 5) {
      await awardBadge(sender, 'Collaborator', req.io);
    }

    const receiverProjects = await Project.find({ members: receiver._id });
    let receiverCollaborators = new Set();
    receiverProjects.forEach(p => {
      p.members.forEach(m => {
        if (m.toString() !== receiver._id.toString()) {
          receiverCollaborators.add(m.toString());
        }
      });
    });
    if (receiverCollaborators.size >= 5) {
      await awardBadge(receiver, 'Collaborator', req.io);
    }

    const notification = new Notification({
      userId: request.senderId,
      message: `🎉 ${receiver.name} accepted your collaboration invitation!`,
      type: 'invitation',
      category: 'collaboration',
      priority: 'high',
      link: request.projectId ? `/projects/${request.projectId}` : '/marketplace'
    });
    await notification.save();

    if (req.io) {
      req.io.to(request.senderId.toString()).emit('notification', notification);
    }

    res.json({ message: 'Request accepted successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    await request.save();

    const receiver = await User.findById(request.receiverId);

    const notification = new Notification({
      userId: request.senderId,
      message: `😔 ${receiver.name} declined your collaboration invitation.`,
      type: 'invitation',
      category: 'collaboration',
      priority: 'low'
    });
    await notification.save();

    if (req.io) {
      req.io.to(request.senderId.toString()).emit('notification', notification);
    }

    res.json({ message: 'Request declined successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const cancelRequest = async (req, res) => {
  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.senderId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({ message: 'Request cancelled successfully', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  sendCollaborationRequest,
  getRequests,
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest
};
