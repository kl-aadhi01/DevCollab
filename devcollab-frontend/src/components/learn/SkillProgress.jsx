import React from 'react';

const SkillProgress = ({ skills }) => {
  if (!skills || Object.keys(skills).length === 0) {
    return (
      <div className="bg-white border border-border p-6 rounded-2xl text-center text-xs text-textSecondary shadow-sm">
        Start completing bootcamp lessons and exercises to build skills.
      </div>
    );
  }

  const getLevelBadge = (level) => {
    switch (level) {
      case 'Demonstrated': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Practicing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Learning': return 'bg-sky-100 text-sky-800 border-sky-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-2">My Skill Progression</h3>
      <div className="space-y-3">
        {Object.entries(skills).map(([skill, data]) => (
          <div key={skill} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-b-0">
            <span className="text-sm font-bold text-textPrimary">{skill}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getLevelBadge(data.level)}`}>
              {data.level}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillProgress;
