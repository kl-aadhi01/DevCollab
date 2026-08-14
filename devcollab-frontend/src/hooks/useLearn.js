import { useState, useEffect } from 'react';
import learnService from '../services/learnService';
import { toast } from 'react-hot-toast';

export const useLearn = (bootcampId = null) => {
  const [bootcamps, setBootcamps] = useState([]);
  const [bootcampData, setBootcampData] = useState(null); // bootcamp details + enrollment + lessons + exercises
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [myProgress, setMyProgress] = useState([]);
  const [myLearningList, setMyLearningList] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [skillsProgress, setSkillsProgress] = useState({});
  const [buildReadiness, setBuildReadiness] = useState(null);

  const fetchExploreBootcamps = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await learnService.getBootcamps(filters);
      setBootcamps(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch explore bootcamps');
    } finally {
      setLoading(false);
    }
  };

  const fetchBootcampDetails = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await learnService.getBootcamp(id);
      setBootcampData(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch bootcamp details');
    } finally {
      setLoading(false);
    }
  };

  const enrollInBootcamp = async (id) => {
    setLoading(true);
    try {
      const enrollment = await learnService.enrollBootcamp(id);
      toast.success('🎉 Enrolled successfully! Happy learning!');
      await fetchBootcampDetails(id);
      return enrollment;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to enroll';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDashboard = async () => {
    setLoading(true);
    try {
      const [prog, learn, rec, skills, readiness] = await Promise.all([
        learnService.getMyProgress(),
        learnService.getMyLearning(),
        learnService.getRecommendations(),
        learnService.getSkills(),
        learnService.getBuildReadiness()
      ]);
      setMyProgress(prog);
      setMyLearningList(learn);
      setRecommendations(rec);
      setSkillsProgress(skills);
      setBuildReadiness(readiness);
    } catch (err) {
      console.error('Error fetching student dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bootcampId) {
      fetchBootcampDetails(bootcampId);
    }
  }, [bootcampId]);

  return {
    bootcamps,
    bootcampData,
    loading,
    error,
    myProgress,
    myLearningList,
    recommendations,
    skillsProgress,
    buildReadiness,
    fetchExploreBootcamps,
    fetchBootcampDetails,
    enrollInBootcamp,
    fetchStudentDashboard
  };
};

export default useLearn;
