const User = require('../models/User');
const Project = require('../models/Project');

const getNextProjectSuggestion = async (userId) => {
  try {
    const user = await User.findById(userId).populate('projectsOwned projectsJoined');
    if (!user) return null;

    // 1. Compute user's skill-tag distribution across all past projects
    const allUserProjects = [...(user.projectsOwned || []), ...(user.projectsJoined || [])];
    const skillCountsInProjects = {};

    allUserProjects.forEach(proj => {
      (proj.requiredSkills || []).forEach(skill => {
        const lowerSkill = skill.toLowerCase();
        skillCountsInProjects[lowerSkill] = (skillCountsInProjects[lowerSkill] || 0) + 1;
      });
    });

    // 2. Identify gap skills
    const userSkills = (user.skills || []).map(s => s.name.toLowerCase());
    
    // Find registered skills user has NOT used much in projects, or complementary tech gaps
    const gapSkills = [];

    // Check user's registered skills that have low project history
    userSkills.forEach(s => {
      if (!skillCountsInProjects[s] || skillCountsInProjects[s] < 2) {
        gapSkills.push(s);
      }
    });

    // If no specific gap, suggest complementary domain skills (e.g. if frontend heavy, suggest backend/DevOps)
    const frontendTechs = ['react', 'vue', 'angular', 'css', 'tailwind', 'html', 'next.js'];
    const backendTechs = ['node.js', 'express', 'mongodb', 'postgresql', 'python', 'docker', 'graphql'];

    const frontendCount = Object.keys(skillCountsInProjects).filter(s => frontendTechs.includes(s)).length;
    const backendCount = Object.keys(skillCountsInProjects).filter(s => backendTechs.includes(s)).length;

    if (frontendCount > backendCount) {
      gapSkills.push(...backendTechs);
    } else {
      gapSkills.push(...frontendTechs);
    }

    // 3. Search open active projects matching the gap skills where user is not member or owner
    const openProjects = await Project.find({
      status: 'active',
      ownerId: { $ne: userId },
      members: { $nin: [userId] }
    }).populate('ownerId', 'name username avatar');

    if (openProjects.length === 0) return null;

    let bestProject = null;
    let maxGapMatch = -1;
    let matchedGapSkill = '';

    for (const proj of openProjects) {
      const projSkills = (proj.requiredSkills || []).map(s => s.toLowerCase());
      for (const gapSkill of gapSkills) {
        if (projSkills.includes(gapSkill)) {
          bestProject = proj;
          maxGapMatch += 1;
          matchedGapSkill = gapSkill;
          break;
        }
      }
      if (bestProject) break;
    }

    // Fallback: return the first available open project if no exact gap match
    if (!bestProject && openProjects.length > 0) {
      bestProject = openProjects[0];
      matchedGapSkill = (bestProject.requiredSkills?.[0]) || 'general development';
    }

    if (!bestProject) return null;

    return {
      project: bestProject,
      reason: `Expand your skill set with ${matchedGapSkill.toUpperCase()} in a real project environment.`,
      targetGapSkill: matchedGapSkill
    };
  } catch (error) {
    console.error('Error fetching growth suggestion:', error.message);
    return null;
  }
};

module.exports = {
  getNextProjectSuggestion
};
