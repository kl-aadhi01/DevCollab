import React from 'react';
import { Link } from 'react-router-dom';

const CapstoneCard = ({ capstone, submission }) => {
  if (!capstone) return null;

  const isCompleted = submission?.status === 'completed' || submission?.status === 'approved';
  const isConverted = !!submission?.devcollabProjectId;

  return (
    <div className={`p-6 border rounded-2xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ${isCompleted ? 'border-emerald-200' : 'border-border'}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full uppercase border border-rose-200">Capstone Project</span>
          {isCompleted && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase border border-emerald-200">Completed</span>
          )}
          {isConverted && (
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase border border-indigo-200">Live on BUILD</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-textPrimary">{capstone.title}</h3>
        <p className="text-sm text-textSecondary">{capstone.description}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
        <Link 
          to={`/learn/capstones/${capstone._id}`}
          className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all text-center ${
            isCompleted 
              ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100' 
              : 'bg-primary text-white hover:bg-primary/95'
          }`}
        >
          {isCompleted ? 'View Submission' : 'Start Capstone'}
        </Link>
        {isConverted && (
          <Link
            to={`/projects/${submission.devcollabProjectId}`}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all text-center"
          >
            Go to Project Space
          </Link>
        )}
      </div>
    </div>
  );
};

export default CapstoneCard;
