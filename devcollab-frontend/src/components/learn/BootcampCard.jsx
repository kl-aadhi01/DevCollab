import React from 'react';
import { Link } from 'react-router-dom';

const BootcampCard = ({ bootcamp, isEnrolled, progress = 0 }) => {
  const { _id, title, description, category, level, duration, enrolledStudents, mentorId } = bootcamp;

  // Level badge styling
  const getLevelColor = (lvl) => {
    switch (lvl) {
      case 'beginner': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'intermediate': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'advanced': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <Link to={`/learn/bootcamp/${_id}`} className="block group">
      <div className="bg-white border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:border-primary hover:-translate-y-1">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            {category}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelColor(level)}`}>
            {level}
          </span>
        </div>

        <h3 className="text-lg font-bold text-textPrimary group-hover:text-primary transition-colors mb-2 line-clamp-1">
          {title}
        </h3>
        
        <p className="text-sm text-textSecondary mb-4 line-clamp-2 h-10">
          {description}
        </p>

        <div className="flex items-center gap-4 mb-4 text-xs text-textSecondary font-medium">
          <div className="flex items-center gap-1">
            <span>⏱️</span> {duration}
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span> {enrolledStudents?.length || 0} Learners
          </div>
        </div>

        {isEnrolled && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-textSecondary mb-1.5">
              <span>Your Progress</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-sm text-primary uppercase">
              {mentorId?.name?.charAt(0) || 'M'}
            </div>
            <div>
              <p className="text-xs font-bold text-textPrimary leading-none">{mentorId?.name || 'Mentor'}</p>
              <p className="text-[10px] text-textSecondary">@{mentorId?.username || 'mentor'}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View details <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BootcampCard;
