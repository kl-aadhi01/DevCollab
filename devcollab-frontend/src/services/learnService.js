import API from './api';

const learnService = {
  // Bootcamps
  getBootcamps: async (filters = {}) => {
    const res = await API.get('/learn/bootcamps', { params: filters });
    return res.data;
  },
  createBootcamp: async (bootcampData) => {
    const res = await API.post('/learn/bootcamps', bootcampData);
    return res.data;
  },
  getBootcamp: async (id) => {
    const res = await API.get(`/learn/bootcamps/${id}`);
    return res.data;
  },
  updateBootcamp: async (id, bootcampData) => {
    const res = await API.put(`/learn/bootcamps/${id}`, bootcampData);
    return res.data;
  },
  deleteBootcamp: async (id) => {
    const res = await API.delete(`/learn/bootcamps/${id}`);
    return res.data;
  },
  enrollBootcamp: async (id) => {
    const res = await API.post(`/learn/bootcamps/${id}/enroll`);
    return res.data;
  },

  // Lessons
  getLesson: async (id) => {
    const res = await API.get(`/learn/lessons/${id}`);
    return res.data;
  },
  createLesson: async (lessonData) => {
    const res = await API.post('/learn/lessons', lessonData);
    return res.data;
  },
  updateLesson: async (id, lessonData) => {
    const res = await API.put(`/learn/lessons/${id}`, lessonData);
    return res.data;
  },
  deleteLesson: async (id) => {
    const res = await API.delete(`/learn/lessons/${id}`);
    return res.data;
  },
  completeLesson: async (id) => {
    const res = await API.post(`/learn/lessons/${id}/complete`);
    return res.data;
  },

  // Exercises
  getExercise: async (id) => {
    const res = await API.get(`/learn/exercises/${id}`);
    return res.data;
  },
  createExercise: async (exerciseData) => {
    const res = await API.post('/learn/exercises', exerciseData);
    return res.data;
  },
  updateExercise: async (id, exerciseData) => {
    const res = await API.put(`/learn/exercises/${id}`, exerciseData);
    return res.data;
  },
  submitExercise: async (id, submissionData) => {
    const res = await API.post(`/learn/exercises/${id}/submit`, submissionData);
    return res.data;
  },

  // Assignments
  getAssignment: async (id) => {
    const res = await API.get(`/learn/assignments/${id}`);
    return res.data;
  },
  createAssignment: async (assignmentData) => {
    const res = await API.post('/learn/assignments', assignmentData);
    return res.data;
  },
  updateAssignment: async (id, assignmentData) => {
    const res = await API.put(`/learn/assignments/${id}`, assignmentData);
    return res.data;
  },
  submitAssignment: async (id, submissionData) => {
    const res = await API.post(`/learn/assignments/${id}/submit`, submissionData);
    return res.data;
  },
  reviewAssignment: async (submissionId, reviewData) => {
    const res = await API.put(`/learn/assignments/${submissionId}/review`, reviewData);
    return res.data;
  },

  // Guided Projects
  getGuidedProject: async (id) => {
    const res = await API.get(`/learn/guided-projects/${id}`);
    return res.data;
  },
  createGuidedProject: async (gpData) => {
    const res = await API.post('/learn/guided-projects', gpData);
    return res.data;
  },
  updateGuidedProject: async (id, gpData) => {
    const res = await API.put(`/learn/guided-projects/${id}`, gpData);
    return res.data;
  },
  submitGuidedProject: async (id, submissionData) => {
    const res = await API.post(`/learn/guided-projects/${id}/submit`, submissionData);
    return res.data;
  },

  // Capstone
  getCapstone: async (id) => {
    const res = await API.get(`/learn/capstones/${id}`);
    return res.data;
  },
  createCapstone: async (capstoneData) => {
    const res = await API.post('/learn/capstones', capstoneData);
    return res.data;
  },
  updateCapstone: async (id, capstoneData) => {
    const res = await API.put(`/learn/capstones/${id}`, capstoneData);
    return res.data;
  },
  submitCapstone: async (id, submissionData) => {
    const res = await API.post(`/learn/capstones/${id}/submit`, submissionData);
    return res.data;
  },
  convertToProject: async (submissionId) => {
    const res = await API.post('/learn/capstones/convert-to-project', { submissionId });
    return res.data;
  },

  // Learning Progress
  getMyProgress: async () => {
    const res = await API.get('/learn/my-progress');
    return res.data;
  },
  getMyLearning: async () => {
    const res = await API.get('/learn/my-learning');
    return res.data;
  },
  getRecommendations: async () => {
    const res = await API.get('/learn/recommendations');
    return res.data;
  },
  getSkills: async () => {
    const res = await API.get('/learn/skills');
    return res.data;
  },

  // Mentor Workspace
  getMentorDashboard: async () => {
    const res = await API.get('/learn/mentor/dashboard');
    return res.data;
  },
  getMentorStudents: async () => {
    const res = await API.get('/learn/mentor/students');
    return res.data;
  },
  getMentorSubmissions: async () => {
    const res = await API.get('/learn/mentor/submissions');
    return res.data;
  },
  updateMentorProfile: async (profileData) => {
    const res = await API.put('/learn/mentor/profile', profileData);
    return res.data;
  },

  // Build Transition
  getBuildReadiness: async () => {
    const res = await API.get('/learn/build-readiness');
    return res.data;
  },
  getRecommendedProjects: async () => {
    const res = await API.get('/learn/recommended-projects');
    return res.data;
  },
  transitionToBuild: async () => {
    const res = await API.post('/learn/transition-to-build');
    return res.data;
  }
};

export default learnService;
