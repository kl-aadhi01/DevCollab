import { useState } from 'react';
import assignmentService from '../services/assignmentService';

export const useAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAssignments = async (bootcampId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getAssignments(bootcampId);
      setAssignments(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignment = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getAssignment(id);
      setAssignment(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch assignment details');
    } finally {
      setLoading(false);
    }
  };

  const submitWork = async (id, submissionUrl) => {
    setLoading(true);
    try {
      const res = await assignmentService.submitAssignment(id, submissionUrl);
      return res;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    } finally {
      setLoading(false);
    }
  };

  const gradeWork = async (id, gradeData) => {
    setLoading(true);
    try {
      const res = await assignmentService.gradeAssignment(id, gradeData);
      return res;
    } catch (err) {
      throw err.response?.data?.message || err.message;
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getSubmissions(id);
      setSubmissions(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  return {
    assignments,
    assignment,
    submissions,
    loading,
    error,
    fetchAssignments,
    fetchAssignment,
    submitWork,
    gradeWork,
    fetchSubmissions
  };
};

export default useAssignment;
