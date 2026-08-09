import { useState, useEffect } from 'react';
import bootcampService from '../services/bootcampService';

export const useBootcamp = (id = null) => {
  const [bootcamps, setBootcamps] = useState([]);
  const [bootcamp, setBootcamp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBootcamps = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bootcampService.getBootcamps(filters);
      setBootcamps(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch bootcamps');
    } finally {
      setLoading(false);
    }
  };

  const fetchBootcamp = async (bootcampId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bootcampService.getBootcamp(bootcampId);
      setBootcamp(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch bootcamp details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchBootcamp(id);
    }
  }, [id]);

  const enroll = async (bootcampId) => {
    setLoading(true);
    try {
      const res = await bootcampService.enrollBootcamp(bootcampId);
      if (id === bootcampId) {
        await fetchBootcamp(bootcampId);
      }
      return res;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (bootcampId, week) => {
    try {
      const result = await bootcampService.updateProgress(bootcampId, week);
      if (id === bootcampId) {
        setBootcamp(result.bootcamp);
      }
      return result;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    }
  };

  return {
    bootcamps,
    bootcamp,
    loading,
    error,
    fetchBootcamps,
    fetchBootcamp,
    enroll,
    updateProgress
  };
};

export default useBootcamp;
