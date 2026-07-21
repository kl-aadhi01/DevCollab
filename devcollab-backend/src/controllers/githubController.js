const githubService = require('../services/githubService');
const User = require('../models/User');

const getRepos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const repos = await githubService.getRepos(user.socialLinks?.github || user.username);
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRepoDetails = async (req, res) => {
  try {
    const { owner, name } = req.params;
    const details = await githubService.getRepoDetails(owner, name);
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const linkGithub = async (req, res) => {
  try {
    const { githubUsername } = req.body;
    if (!githubUsername) {
      return res.status(400).json({ message: 'GitHub username is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.socialLinks) {
      user.socialLinks = {};
    }
    user.socialLinks.github = `https://github.com/${githubUsername}`;
    await user.save();

    res.json({ message: 'GitHub account linked successfully', socialLinks: user.socialLinks });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const { calculateReliabilityScore } = require('../services/reliabilityScoreService');

const getReliabilityScore = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const scoreObj = await calculateReliabilityScore(userId);
    res.json(scoreObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getRepos,
  getRepoDetails,
  linkGithub,
  getReliabilityScore
};
