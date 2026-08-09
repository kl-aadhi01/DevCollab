import API from './api';

const transitionService = {
  getStatus: async () => {
    const res = await API.get('/transition/status');
    return res.data;
  },

  transitionToBuild: async () => {
    const res = await API.post('/transition/to-build');
    return res.data;
  },

  getRecommendedProjects: async () => {
    const res = await API.get('/transition/recommended-projects');
    return res.data;
  },

  createTeam: async (teamData) => {
    // teamData: { bootcampId, projectName, projectDescription }
    const res = await API.post('/transition/create-team', teamData);
    return res.data;
  }
};

export default transitionService;
