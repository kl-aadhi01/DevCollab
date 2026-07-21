const User = require('../models/User');
const { BADGES } = require('../utils/constants');

const getGamificationStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('points level rank badges');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllBadges = (req, res) => {
  res.json(BADGES);
};

const getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find({})
      .select('name username avatar points level rank title badges')
      .sort({ points: -1 })
      .limit(10);
    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('badges');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.badges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getGamificationStats,
  getAllBadges,
  getLeaderboard,
  getAchievements
};
