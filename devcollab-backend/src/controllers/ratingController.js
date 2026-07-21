const Rating = require('../models/Rating');
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const { calculateReliabilityScore } = require('../services/reliabilityScoreService');

const createRating = async (req, res) => {
  try {
    const { projectId, ratedUserId, reliability, codeQuality, communication, comment } = req.body;
    const raterId = req.user.id;

    if (!projectId || !ratedUserId || !reliability || !codeQuality || !communication) {
      return res.status(400).json({ message: 'Missing required rating fields' });
    }

    if (raterId === ratedUserId) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check existing rating
    let rating = await Rating.findOne({ projectId, raterId, ratedUserId });
    if (rating) {
      rating.reliability = reliability;
      rating.codeQuality = codeQuality;
      rating.communication = communication;
      rating.comment = comment || '';
      await rating.save();
    } else {
      rating = new Rating({
        projectId,
        raterId,
        ratedUserId,
        reliability,
        codeQuality,
        communication,
        comment: comment || ''
      });
      await rating.save();
    }

    // Recalculate peer rating average and reliability score for rated user
    await calculateReliabilityScore(ratedUserId);

    // Create notification for rated user
    const notification = new Notification({
      userId: ratedUserId,
      message: `⭐ You received a post-project peer rating for "${project.name}"!`,
      type: 'system',
      category: 'rating',
      priority: 'medium',
      link: `/profile`
    });
    await notification.save();

    if (req.io) {
      req.io.to(ratedUserId.toString()).emit('notification', notification);
    }

    res.status(201).json(rating);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ ratedUserId: req.params.userId })
      .populate('raterId', 'name username avatar')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProjectRatingsForUser = async (req, res) => {
  try {
    const ratings = await Rating.find({
      projectId: req.params.projectId,
      raterId: req.user.id
    });
    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createRating,
  getUserRatings,
  getProjectRatingsForUser
};
