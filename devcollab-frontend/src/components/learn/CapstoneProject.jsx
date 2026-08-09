import React from 'react';

const CapstoneProject = ({ capstone }) => {
  if (!capstone) return null;

  const { title, description, requiredSkills, teamSize } = capstone;

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <span className="text-2xl">🚀</span>
        <h3 className="text-lg font-bold text-textPrimary">Capstone Project</h3>
      </div>
      
      <h4 className="font-bold text-textPrimary text-base mb-2">{title || 'Final Capstone Project'}</h4>
      <p className="text-sm text-textSecondary leading-relaxed mb-4">
        {description || 'No description provided.'}
      </p>

      {requiredSkills && requiredSkills.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Required Skills</p>
          <div className="flex flex-wrap gap-1">
            {requiredSkills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-textSecondary">
        <span>Team Size Limit</span>
        <span className="font-bold text-textPrimary">{teamSize || 4} Members</span>
      </div>
    </div>
  );
};

export default CapstoneProject;
