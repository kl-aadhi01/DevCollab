const Project = require('../models/Project');

const updateMemberActivity = async (projectId, userId) => {
  if (!projectId || !userId) return;
  try {
    const project = await Project.findById(projectId);
    if (!project) return;

    if (!project.memberActivity) {
      project.memberActivity = [];
    }

    const activityIdx = project.memberActivity.findIndex(a => a.userId.toString() === userId.toString());
    if (activityIdx > -1) {
      project.memberActivity[activityIdx].lastActivityAt = new Date();
    } else {
      project.memberActivity.push({
        userId,
        lastActivityAt: new Date()
      });
    }

    await project.save();
  } catch (error) {
    console.error(`Error updating member activity for project ${projectId}, user ${userId}:`, error.message);
  }
};

module.exports = {
  updateMemberActivity
};
