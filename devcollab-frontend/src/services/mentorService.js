import API from './api';

const mentorService = {
  getDashboard: async () => {
    const res = await API.get('/mentor/dashboard');
    return res.data;
  },

  getStudents: async () => {
    const res = await API.get('/mentor/students');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await API.put('/mentor/profile', profileData);
    return res.data;
  },

  getMentorBootcamps: async (mentorId) => {
    const res = await API.get(`/mentor/${mentorId}/bootcamps`);
    return res.data;
  }
};

export default mentorService;
