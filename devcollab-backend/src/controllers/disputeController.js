const Dispute = require('../models/Dispute');
const Project = require('../models/Project');

const createDispute = async (req, res) => {
  try {
    const { projectId, reportedUser, reason } = req.body;
    const reportedBy = req.user.id;

    if (!projectId || !reportedUser || !reason) {
      return res.status(400).json({ message: 'Project ID, reported user, and reason are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== reportedBy) {
      return res.status(403).json({ message: 'Only the project owner can file disputes for this project' });
    }

    const dispute = new Dispute({
      projectId,
      reportedBy,
      reportedUser,
      reason
    });

    await dispute.save();

    res.status(201).json({ message: 'Dispute logged successfully for record-keeping', dispute });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDisputesForProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    const disputes = await Dispute.find({ projectId })
      .populate('reportedUser', 'name username avatar email')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createDispute,
  getDisputesForProject
};
