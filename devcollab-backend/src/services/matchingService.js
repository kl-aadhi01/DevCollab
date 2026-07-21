const User = require('../models/User');
const Project = require('../models/Project');

/**
 * Calculates match score between a developer and a project.
 * Prioritizes skill complementarity (what team is missing that dev possesses).
 */
const calculateMatch = (developer, project, existingTeamMembers = []) => {
  if (!developer || !project) return { score: 0, reasons: [] };

  const reasons = [];
  let score = 0;

  const requiredSkills = (project.requiredSkills || []).map(s => s.toLowerCase());
  const devSkillNames = (developer.skills || []).map(s => s.name.toLowerCase());

  // Determine existing team skills
  const existingTeamSkillNames = new Set();
  existingTeamMembers.forEach(m => {
    (m.skills || []).forEach(s => existingTeamSkillNames.add(s.name.toLowerCase()));
  });

  // 1. Skill Complementarity (Max 60 pts)
  // Missing skills = skills required by project that no existing member has
  const missingSkills = requiredSkills.filter(s => !existingTeamSkillNames.has(s));
  const candidateFillsMissing = missingSkills.filter(s => devSkillNames.includes(s));

  if (missingSkills.length > 0 && candidateFillsMissing.length > 0) {
    const fillRatio = candidateFillsMissing.length / missingSkills.length;
    score += Math.round(fillRatio * 60);
    reasons.push(`Fills key missing skills: ${candidateFillsMissing.join(', ')}`);
  } else {
    // Fallback: general skill overlap
    const skillOverlap = requiredSkills.filter(s => devSkillNames.includes(s));
    if (requiredSkills.length > 0) {
      score += Math.round((skillOverlap.length / requiredSkills.length) * 40);
      if (skillOverlap.length > 0) {
        reasons.push(`Matches required skills: ${skillOverlap.join(', ')}`);
      }
    }
  }

  // 2. Working Style Alignment (Max 25 pts)
  const devWorkingStyles = (developer.workingStyle || []).map(w => w.toLowerCase());
  const projectWorkingStyles = (project.workingStyle || []).map(w => w.toLowerCase());

  if (devWorkingStyles.length > 0 && projectWorkingStyles.length > 0) {
    const styleOverlap = projectWorkingStyles.filter(w => devWorkingStyles.includes(w));
    if (styleOverlap.length > 0) {
      score += Math.round((styleOverlap.length / Math.max(1, projectWorkingStyles.length)) * 25);
      reasons.push(`Matching working style: ${styleOverlap.join(', ')}`);
    }
  } else if (devWorkingStyles.length > 0) {
    score += 15; // neutral preference boost
  }

  // 3. Reliability & Activity Boost (Max 15 pts)
  const reliability = developer.reliabilityScore?.score || 50;
  score += Math.round((reliability / 100) * 15);
  if (reliability >= 80) {
    reasons.push('High reliability score (80%+)');
  }

  const matchScore = Math.min(100, Math.max(0, score));

  return {
    score: matchScore,
    reasons
  };
};

const getRecommendedProjectsForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return [];

  // Find projects user is not already in
  const candidateProjects = await Project.find({
    status: 'active',
    ownerId: { $ne: userId },
    members: { $nin: [userId] }
  }).populate('members ownerId');

  const recommendations = candidateProjects.map(proj => {
    const match = calculateMatch(user, proj, proj.members);
    return {
      project: proj,
      matchScore: match.score,
      reasons: match.reasons
    };
  });

  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
};

const getRecommendedDevelopersForProject = async (projectId) => {
  const project = await Project.findById(projectId).populate('members');
  if (!project) return [];

  const existingMemberIds = (project.members || []).map(m => m._id.toString());

  // Find available developers not in project
  const candidateUsers = await User.find({
    _id: { $nin: existingMemberIds, $ne: project.ownerId },
    availabilityStatus: { $ne: 'not-looking' }
  });

  const recommendations = candidateUsers.map(dev => {
    const match = calculateMatch(dev, project, project.members);
    return {
      developer: dev,
      matchScore: match.score,
      reasons: match.reasons
    };
  });

  return recommendations
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10);
};

module.exports = {
  calculateMatch,
  getRecommendedProjectsForUser,
  getRecommendedDevelopersForProject
};
