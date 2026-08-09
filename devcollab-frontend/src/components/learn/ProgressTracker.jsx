import React from 'react';
import { Link } from 'react-router-dom';

const ProgressTracker = ({ progress, completedWeeksCount, totalWeeks, isEligibleForTransition }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-textPrimary mb-4">Your Progress</h3>
      
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center bg-slate-50 border border-border rounded-full">
          <span className="text-xl font-extrabold text-primary">{progress}%</span>
        </div>
        <div>
          <h4 className="font-bold text-textPrimary text-base">Milestone Completion</h4>
          <p className="text-sm text-textSecondary mt-0.5">
            You completed {completedWeeksCount} out of {totalWeeks} weeks.
          </p>
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-6">
        <div 
          className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {isEligibleForTransition && (
        <div className="bg-emerald-50 border border-success/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h4 className="font-bold text-emerald-800 text-sm">🎓 You are ready to BUILD!</h4>
            <p className="text-xs text-emerald-700 mt-0.5">You have graduated and can now transition to the BUILD track.</p>
          </div>
          <Link
            to="/learn/transition"
            className="px-4 py-2 bg-success text-white font-bold text-xs rounded-lg hover:bg-success/90 shadow-sm transition-all"
          >
            Transition Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
