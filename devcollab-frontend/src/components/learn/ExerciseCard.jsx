import React from 'react';
import { Link } from 'react-router-dom';

const ExerciseCard = ({ exercise, isCompleted }) => {
  return (
    <div className={`p-4 border rounded-xl shadow-sm transition-all bg-white hover:border-primary flex justify-between items-center ${isCompleted ? 'border-emerald-200' : 'border-border'}`}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase">Practice</span>
          {isCompleted && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Completed</span>
          )}
        </div>
        <h4 className="text-sm font-bold text-textPrimary">{exercise.title}</h4>
        <p className="text-xs text-textSecondary line-clamp-1 mt-1">{exercise.description}</p>
      </div>
      <Link 
        to={`/learn/exercises/${exercise._id}`}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
          isCompleted 
            ? 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100' 
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {isCompleted ? 'Review' : 'Start'}
      </Link>
    </div>
  );
};

export default ExerciseCard;
