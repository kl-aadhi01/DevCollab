import React from 'react';

const LessonProgress = ({ total, completed }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white border border-border p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Lessons Completed</span>
        <span className="text-sm font-bold text-primary">{completed} / {total} ({percentage}%)</span>
      </div>
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LessonProgress;
