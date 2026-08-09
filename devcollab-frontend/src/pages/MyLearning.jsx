import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import BootcampCard from '../components/learn/BootcampCard';
import bootcampService from '../services/bootcampService';

const MyLearning = () => {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolled = async () => {
      try {
        const data = await bootcampService.getUserEnrolledBootcamps();
        setEnrolled(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchEnrolled();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading enrolled courses...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-textPrimary">My Learning Dashboard</h1>
        <p className="text-sm text-textSecondary mt-1">Track your course milestones and complete assignments to graduate.</p>
      </div>

      {enrolled.length === 0 ? (
        <div className="text-center py-16 bg-white border rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
          <span className="text-5xl">📚</span>
          <h3 className="text-lg font-bold text-textPrimary mt-4">Not enrolled in any bootcamps</h3>
          <p className="text-sm text-textSecondary mt-1 mb-6">Browse our bootcamps and start learning development skills now.</p>
          <Link
            to="/learn"
            className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/95 transition-all shadow-sm"
          >
            Explore Bootcamps
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolled.map(bootcamp => {
            const enrollment = user?.learningTrack?.enrolledBootcamps?.find(
              e => e.bootcampId === bootcamp._id || e.bootcampId?._id === bootcamp._id
            );
            return (
              <BootcampCard 
                key={bootcamp._id} 
                bootcamp={bootcamp} 
                isEnrolled={true} 
                progress={enrollment ? enrollment.progress : 0} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
