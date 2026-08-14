import React from 'react';

const MentorFeedback = ({ submission }) => {
  if (!submission || !submission.feedback) {
    return (
      <div className="bg-slate-50 border border-border p-4 rounded-xl text-center text-xs text-textSecondary">
        Waiting for mentor review and feedback.
      </div>
    );
  }

  const isApproved = submission.status === 'completed' || submission.status === 'graded' || submission.status === 'approved';

  return (
    <div className={`p-5 rounded-2xl border ${isApproved ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}>
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-bold text-textPrimary flex items-center gap-1.5">
          <span>👨‍🏫</span> Mentor Feedback
        </h4>
        {submission.grade !== undefined && (
          <span className={`px-3 py-1 rounded-lg text-xs font-bold ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            Grade: {submission.grade}/100
          </span>
        )}
      </div>
      <p className="text-sm text-textSecondary leading-relaxed italic">
        "{submission.feedback}"
      </p>
      {submission.status === 'resubmit' && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-700 font-bold">
          <span>⚠️</span> Resubmission requested by your mentor.
        </div>
      )}
    </div>
  );
};

export default MentorFeedback;
