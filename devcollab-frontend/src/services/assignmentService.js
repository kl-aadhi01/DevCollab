import API from './api';

const assignmentService = {
  getAssignments: async (bootcampId) => {
    const res = await API.get(`/assignments/bootcamp/${bootcampId}`);
    return res.data;
  },

  createAssignment: async (assignmentData) => {
    const res = await API.post('/assignments', assignmentData);
    return res.data;
  },

  getAssignment: async (id) => {
    const res = await API.get(`/assignments/${id}`);
    return res.data;
  },

  updateAssignment: async (id, assignmentData) => {
    const res = await API.put(`/assignments/${id}`, assignmentData);
    return res.data;
  },

  deleteAssignment: async (id) => {
    const res = await API.delete(`/assignments/${id}`);
    return res.data;
  },

  submitAssignment: async (id, submissionUrl) => {
    const res = await API.post(`/assignments/${id}/submit`, { submissionUrl });
    return res.data;
  },

  gradeAssignment: async (id, gradeData) => {
    // gradeData: { studentId, grade, feedback, status }
    const res = await API.put(`/assignments/${id}/grade`, gradeData);
    return res.data;
  },

  getSubmissions: async (id) => {
    const res = await API.get(`/assignments/${id}/submissions`);
    return res.data;
  }
};

export default assignmentService;
