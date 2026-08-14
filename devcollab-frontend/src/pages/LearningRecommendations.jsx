import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import learnService from '../services/learnService';
import BootcampCard from '../components/learn/BootcampCard';

const LearningRecommendations = () => {
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const data = await learnService.getRecommendations();
        setRecs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecs();
  }, []);

  if (loading) {
    return <div className="text-center py-24">Loading recommendations...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-textPrimary">Your Personal Learning Recommendations</h1>
        <p className="text-sm text-textSecondary mt-1">Suggested programs based on your skills, gaps, and interest fields.</p>
      </div>

      {recs.length === 0 ? (
        <p className="text-sm text-textSecondary bg-white border p-8 rounded-2xl text-center shadow-xs">
          No customized recommendations yet. Keep updating your skills or enroll in introductory courses.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recs.map(bc => (
            <BootcampCard key={bc._id} bootcamp={bc} isEnrolled={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LearningRecommendations;
