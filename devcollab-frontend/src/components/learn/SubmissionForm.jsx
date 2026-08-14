import React, { useState } from 'react';

const SubmissionForm = ({ onSubmit, submissionType, existingSubmission }) => {
  const [submissionUrl, setSubmissionUrl] = useState(existingSubmission?.submissionUrl || '');
  const [textContent, setTextContent] = useState(existingSubmission?.textContent || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submissionType !== 'text' && !submissionUrl.trim()) return;
    if (submissionType === 'text' && !textContent.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ submissionUrl, textContent });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submissionType !== 'text' && (
        <div>
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
            {submissionType === 'github' ? 'GitHub Repository URL' : 'Link / URL'}
          </label>
          <input
            type="url"
            required
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            placeholder={submissionType === 'github' ? 'https://github.com/your-username/repo-name' : 'https://example.com/project'}
            className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
          Notes / Comments (Optional)
        </label>
        <textarea
          rows="4"
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="Include details about your implementation or any comments for your mentor..."
          className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting...' : 'Submit Work'}
      </button>
    </form>
  );
};

export default SubmissionForm;
