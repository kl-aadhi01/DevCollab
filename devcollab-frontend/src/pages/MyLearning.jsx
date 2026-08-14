import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import BootcampCard from '../components/learn/BootcampCard';
import learnService from '../services/learnService';

const MyLearning = () => {
  const { user } = useAuth();
  const [learningList, setLearningList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyLearning = async () => {
      try {
        const data = await learnService.getMyLearning();
        setLearningList(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchMyLearning();
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

      {learningList.length === 0 ? (
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
          {learningList.map(({ enrollment, nextAction, nextActionLink }) => (
            <div key={enrollment._id} className="relative bg-white border border-border rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
              <div className="p-6 pb-2">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {enrollment.bootcampId.category}
                  </span>
                  <span className="bg-indigo-50 border border-indigo-200 text-primary px-2.5 py-0.5 rounded-full text-xs font-medium uppercase">
                    {enrollment.bootcampId.level}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-textPrimary mb-2 line-clamp-1">
                  {enrollment.bootcampId.title}
                </h3>
                
                <p className="text-sm text-textSecondary mb-4 line-clamp-2 h-10">
                  {enrollment.bootcampId.description}
                </p>

                <div className="mb-4">
                  <div className="flex justify-between text-xs font-bold text-textSecondary mb-1.5">
                    <span>Progress</span>
                    <span className="text-primary">{enrollment.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300" 
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-2 bg-slate-50 border-t border-border flex flex-col gap-3">
                <div className="bg-white border border-border/80 p-3 rounded-xl flex justify-between items-center shadow-xs">
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-bold text-indigo-700">What to do next</p>
                    <p className="text-xs font-semibold text-textPrimary line-clamp-1">{nextAction}</p>
                  </div>
                  <Link 
                    to={nextActionLink}
                    className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all shrink-0"
                  >
                    Resume
                  </Link>
                </div>
                <Link
                  to={`/learn/bootcamps/${enrollment.bootcampId._id}/dashboard`}
                  className="w-full text-center py-2 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
                >
                  View Workspace Dashboard
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLearning;
