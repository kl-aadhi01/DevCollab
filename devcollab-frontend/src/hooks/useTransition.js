import { useState } from 'react';
import transitionService from '../services/transitionService';

export const useTransition = () => {
  const [status, setStatus] = useState(null);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transitionService.getStatus();
      setStatus(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch transition status');
    } finally {
      setLoading(false);
    }
  };

  const executeTransition = async () => {
    setLoading(true);
    try {
      const res = await transitionService.transitionToBuild();
      return res;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transitionService.getRecommendedProjects();
      setRecommendedProjects(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch recommended projects');
    } finally {
      setLoading(false);
    }
  };

  const buildTeam = async (teamData) => {
    setLoading(true);
    try {
      const res = await transitionService.createTeam(teamData);
      return res;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    recommendedProjects,
    loading,
    error,
    fetchStatus,
    executeTransition,
    fetchRecommendations,
    buildTeam
  };
};

export default useTransition;
