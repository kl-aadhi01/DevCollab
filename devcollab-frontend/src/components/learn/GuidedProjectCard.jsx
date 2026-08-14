import React from 'react';
import { Link } from 'react-router-dom';

const GuidedProjectCard = ({ guidedProject, submission }) => {
  if (!guidedProject) return null;

  const isCompleted = submission?.status === 'completed' || submission?.status === 'approved';

  return (
    <div className={`p-6 border rounded-2xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isCompleted ? 'border-emerald-200' : 'border-border'}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full uppercase border border-amber-200">Guided Project</span>
          {isCompleted && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase border border-emerald-200">Passed</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-textPrimary">{guidedProject.title}</h3>
        <p className="text-sm text-textSecondary">{guidedProject.description}</p>
      </div>

      <Link 
        to={`/learn/guided-projects/${guidedProject._id}`}
        className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all text-center shrink-0 w-full md:w-auto ${
          isCompleted 
            ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100' 
            : 'bg-primary text-white hover:bg-primary/95'
        }`}
      >
        {isCompleted ? 'View Submission' : 'Start Guided Project'}
      </Link>
    </div>
  );
};

export default GuidedProjectCard;
