import React from 'react';
import { Link } from 'react-router-dom';

const TransitionCard = ({ bootcampTitle }) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div>
        <div className="flex items-center gap-2 mb-2 text-primary">
          <span className="text-2xl">🎉</span>
          <h3 className="text-lg font-bold">Bootcamp Completed!</h3>
        </div>
        <p className="text-sm text-textSecondary max-w-xl">
          Congratulations on completing <strong>{bootcampTitle}</strong>! You've unlocked transition access to the BUILD track, where you can join/form development teams and collaborate on real-world projects.
        </p>
      </div>
      <Link
        to="/learn/transition"
        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-95 shadow-md transition-all hover:scale-105"
      >
        Go to Transition 🚀
      </Link>
    </div>
  );
};

export default TransitionCard;
