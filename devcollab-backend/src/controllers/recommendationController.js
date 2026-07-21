const { getRecommendedProjectsForUser, getRecommendedDevelopersForProject } = require('../services/matchingService');

const getProjectRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const recommendations = await getRecommendedProjectsForUser(userId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getDeveloperRecommendations = async (req, res) => {
  try {
    const { projectId } = req.params;
    const recommendations = await getRecommendedDevelopersForProject(projectId);
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProjectRecommendations,
  getDeveloperRecommendations
};
