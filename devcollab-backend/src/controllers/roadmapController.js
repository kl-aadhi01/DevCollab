const projectController = require('./projectController');

module.exports = {
  updateRoadmap: projectController.updateRoadmap,
  getProjectProgress: projectController.getProjectProgress
};
