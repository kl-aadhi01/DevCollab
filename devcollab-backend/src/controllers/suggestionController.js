const { getNextProjectSuggestion } = require('../services/growthSuggestionService');

const getNextProject = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const suggestion = await getNextProjectSuggestion(userId);
    res.json(suggestion || {});
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNextProject
};
