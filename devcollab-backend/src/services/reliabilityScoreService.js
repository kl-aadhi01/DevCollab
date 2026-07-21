const User = require('../models/User');
const Project = require('../models/Project');
const Rating = require('../models/Rating');
const { getGitHubMetrics } = require('./githubService');

const calculateReliabilityScore = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 1. GitHub Activity Score (40%)
    let githubActivityScore = 60; // neutral default
    const githubUsername = user.socialLinks?.github || user.username;
    if (githubUsername) {
      const metrics = await getGitHubMetrics(githubUsername);
      const commitPoints = metrics.commitsLast90Days * 1.5;
      const prPoints = (metrics.prMergeRate || 80) * 0.4;
      const repoPoints = (metrics.repoCount || 0) * 2;
      githubActivityScore = Math.min(100, Math.max(0, Math.round(commitPoints + prPoints + repoPoints)));
      if (githubActivityScore === 0) githubActivityScore = 50;
    }

    // 2. Project Completion Rate (35%)
    const allUserProjects = await Project.find({
      $or: [{ ownerId: userId }, { members: userId }]
    });

    let projectCompletionRate = 100;
    if (allUserProjects.length > 0) {
      const completedCount = allUserProjects.filter(p => p.status === 'completed').length;
      projectCompletionRate = Math.round((completedCount / allUserProjects.length) * 100);
    }

    // 3. Peer Rating Average (25%)
    let peerRatingAvg = user.reliabilityScore?.peerRatingAvg || 5;
    try {
      const Rating = require('../models/Rating');
      const ratings = await Rating.find({ ratedUserId: userId });
      if (ratings.length > 0) {
        const totalRatingSum = ratings.reduce((sum, r) => sum + ((r.reliability + r.codeQuality + r.communication) / 3), 0);
        peerRatingAvg = parseFloat((totalRatingSum / ratings.length).toFixed(2));
      }
    } catch (err) {
      // Rating model might not be initialized yet
    }

    const peerScorePercent = (peerRatingAvg / 5) * 100;

    // Weighted formula: GitHub 40%, Completion 35%, Peer 25%
    const score = Math.round(
      (githubActivityScore * 0.40) +
      (projectCompletionRate * 0.35) +
      (peerScorePercent * 0.25)
    );

    user.reliabilityScore = {
      score,
      githubActivityScore,
      projectCompletionRate,
      peerRatingAvg,
      lastCalculated: new Date()
    };

    await user.save();
    return user.reliabilityScore;
  } catch (error) {
    console.error(`Error calculating reliability score for user ${userId}:`, error.message);
    throw error;
  }
};

const recalculateAllUsers = async () => {
  try {
    const users = await User.find({});
    console.log(`[Cron] Recalculating reliability scores for ${users.length} users...`);
    for (const user of users) {
      await calculateReliabilityScore(user._id);
    }
  } catch (error) {
    console.error('[Cron] Error in recalculateAllUsers cron:', error.message);
  }
};

module.exports = {
  calculateReliabilityScore,
  recalculateAllUsers
};
