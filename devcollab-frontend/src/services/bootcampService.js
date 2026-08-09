import API from './api';

const bootcampService = {
  getBootcamps: async (filters = {}) => {
    const res = await API.get('/bootcamps', { params: filters });
    return res.data;
  },

  createBootcamp: async (bootcampData) => {
    const res = await API.post('/bootcamps', bootcampData);
    return res.data;
  },

  getBootcamp: async (id) => {
    const res = await API.get(`/bootcamps/${id}`);
    return res.data;
  },

  updateBootcamp: async (id, bootcampData) => {
    const res = await API.put(`/bootcamps/${id}`, bootcampData);
    return res.data;
  },

  deleteBootcamp: async (id) => {
    const res = await API.delete(`/bootcamps/${id}`);
    return res.data;
  },

  enrollBootcamp: async (id) => {
    const res = await API.post(`/bootcamps/${id}/enroll`);
    return res.data;
  },

  updateProgress: async (id, week) => {
    const res = await API.put(`/bootcamps/${id}/progress`, { week });
    return res.data;
  },

  getEnrolledStudents: async (id) => {
    const res = await API.get(`/bootcamps/${id}/students`);
    return res.data;
  },

  getMentorBootcamps: async (mentorId = '') => {
    const url = mentorId ? `/bootcamps/mentor/${mentorId}` : '/bootcamps/mentor/me';
    const res = await API.get(url);
    return res.data;
  },

  getUserEnrolledBootcamps: async () => {
    const res = await API.get('/bootcamps/enrolled');
    return res.data;
  },

  getRecommendedBootcamps: async () => {
    const res = await API.get('/bootcamps/recommended');
    return res.data;
  }
};

export default bootcampService;
