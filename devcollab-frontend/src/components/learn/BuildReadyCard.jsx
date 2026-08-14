import React from 'react';
import { Link } from 'react-router-dom';

const BuildReadyCard = ({ onTransition, transitionedAt }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-8 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="space-y-2">
        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Milestone Achieved 👑
        </span>
        <h2 className="text-2xl font-extrabold">Ready for DevCollab BUILD!</h2>
        <p className="text-sm text-emerald-100 max-w-xl">
          Congratulations! You completed all the required learning milestones. You are now eligible to transition to the BUILD track, participate in team formations, work on real projects, and build your automated contribution portfolio.
        </p>
      </div>

      <div className="shrink-0 w-full md:w-auto text-center">
        {transitionedAt ? (
          <Link
            to="/learn/recommended-projects"
            className="inline-block w-full md:w-auto px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl text-sm hover:bg-slate-50 transition-all shadow-sm"
          >
            Explore Projects & Teams →
          </Link>
        ) : (
          <button
            onClick={onTransition}
            className="w-full md:w-auto px-8 py-3 bg-white text-emerald-700 font-extrabold rounded-xl text-sm hover:bg-slate-50 transition-all shadow-sm uppercase tracking-wider"
          >
            Transition to BUILD Track 🚀
          </button>
        )}
      </div>
    </div>
  );
};

export default BuildReadyCard;
