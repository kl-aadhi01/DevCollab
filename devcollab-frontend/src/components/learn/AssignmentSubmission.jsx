import React, { useState } from 'react';

const AssignmentSubmission = ({ submission, onSubmit, loading }) => {
  const [submissionUrl, setSubmissionUrl] = useState(submission?.submissionUrl || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return;
    onSubmit(submissionUrl);
  };

  const isGraded = submission?.status === 'graded';
  const needsResubmit = submission?.status === 'resubmit';

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-textPrimary mb-4">Your Submission</h3>

      {submission && (
        <div className="mb-6 p-4 rounded-xl border bg-slate-50 border-border">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs text-textSecondary font-semibold">
              Submitted at: {new Date(submission.submittedAt).toLocaleString()}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              submission.status === 'graded' 
                ? 'bg-emerald-100 text-emerald-800' 
                : submission.status === 'resubmit'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {submission.status.toUpperCase()}
            </span>
          </div>

          <div className="text-sm font-medium mb-2">
            Link: <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold break-all">{submission.submissionUrl}</a>
          </div>

          {isGraded && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                <span>🎯</span> Grade: {submission.grade} / 100
              </div>
              {submission.feedback && (
                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 text-xs text-slate-700 italic">
                  <strong>Mentor Feedback:</strong> "{submission.feedback}"
                </div>
              )}
            </div>
          )}

          {needsResubmit && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm font-bold text-rose-800 flex items-center gap-1.5 mb-1.5">
                <span>⚠️</span> Re-submission requested
              </div>
              {submission.feedback && (
                <div className="bg-rose-50/50 p-3 rounded-lg border border-rose-100 text-xs text-slate-700 italic">
                  <strong>Mentor Feedback:</strong> "{submission.feedback}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {(!submission || needsResubmit) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
              Submission URL (GitHub, Vercel, or document link)
            </label>
            <input
              type="url"
              id="url"
              required
              placeholder="https://github.com/username/project"
              value={submissionUrl}
              onChange={(e) => setSubmissionUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !submissionUrl.trim()}
            className="w-full py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting...' : submission ? 'Update Submission' : 'Submit Assignment'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AssignmentSubmission;
