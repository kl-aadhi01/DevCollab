import React from 'react';
import { Link } from 'react-router-dom';

const AssignmentCard = ({ assignment, submission, isEnrolled }) => {
  const { _id, week, title, description, deadline } = assignment;

  const getStatusBadge = () => {
    if (!submission) return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">Not Submitted</span>;
    switch (submission.status) {
      case 'pending': return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">Pending Grade</span>;
      case 'graded': 
        return (
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold">
            Graded: {submission.grade}/100
          </span>
        );
      case 'resubmit': return <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full text-xs font-semibold">Need Revision</span>;
      default: return null;
    }
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:border-primary transition-all">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="bg-indigo-50 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            Week {week}
          </span>
          <h4 className="text-base font-bold text-textPrimary mt-1.5">{title}</h4>
        </div>
        {isEnrolled && getStatusBadge()}
      </div>

      <p className="text-sm text-textSecondary line-clamp-2 mb-4 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
        <span className="text-textSecondary">
          📅 Deadline: {deadline ? new Date(deadline).toLocaleDateString() : 'No deadline'}
        </span>
        {isEnrolled && (
          <Link
            to={`/learn/assignment/${_id}`}
            className="text-primary hover:text-primary-dark font-bold flex items-center gap-1"
          >
            {submission ? 'View Submission' : 'Submit Assignment'} <span>→</span>
          </Link>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
