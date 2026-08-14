import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import learnService from '../services/learnService';
import SubmissionForm from '../components/learn/SubmissionForm';
import MentorFeedback from '../components/learn/MentorFeedback';
import { toast } from 'react-hot-toast';

const GuidedProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gpData, setGpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Submission inputs
  const [repoUrl, setRepoUrl] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const data = await learnService.getGuidedProject(id);
      setGpData(data);
      if (data.submission) {
        setRepoUrl(data.submission.repoUrl || '');
        setSubmissionUrl(data.submission.submissionUrl || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load guided project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setSubmitting(true);
    try {
      await learnService.submitGuidedProject(id, { repoUrl, submissionUrl });
      toast.success('🎉 Guided Project submitted successfully! +100 XP!');
      await fetchProjectDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading project details...</p>
      </div>
    );
  }

  if (error || !gpData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-error p-4 rounded-xl border border-red-200 text-sm font-semibold mb-4">
          {error || 'Guided project not found.'}
        </div>
        <Link to="/learn" className="text-primary font-bold hover:underline">
          ← Back to Learn
        </Link>
      </div>
    );
  }

  const { guidedProject, submission } = gpData;
  const isCompleted = submission?.status === 'completed' || submission?.status === 'approved' || submission?.status === 'submitted';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <Link to={`/learn/bootcamps/${guidedProject.bootcampId}/dashboard`} className="text-xs font-bold text-textSecondary hover:text-primary transition-colors">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-textPrimary mt-2">{guidedProject.title}</h1>
          <p className="text-xs text-textSecondary mt-0.5">Capstone Guided Milestones Development</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Project requirements */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Objective</h3>
              <p className="text-sm text-textPrimary leading-relaxed">{guidedProject.objective}</p>
            </div>

            <div>
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Description / Problem Statement</h3>
              <p className="text-sm text-textSecondary leading-relaxed">{guidedProject.description}</p>
            </div>

            {guidedProject.requirements?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Technical Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-textSecondary">
                  {guidedProject.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {guidedProject.suggestedTech?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Suggested Tech Stack</h3>
                <div className="flex flex-wrap gap-1.5">
                  {guidedProject.suggestedTech.map((tech, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {guidedProject.milestones?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-3">Development Milestones</h3>
                <div className="space-y-3">
                  {guidedProject.milestones.map((m, idx) => (
                    <div key={idx} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                      <h4 className="text-xs font-bold text-textPrimary">Milestone {idx + 1}: {m.title}</h4>
                      <p className="text-xs text-textSecondary mt-1">{m.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Submit box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-textPrimary">Project Submission</h3>
            {submission && (
              <div className="space-y-1 pb-2 border-b border-slate-100">
                <span className="text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                  {submission.status.toUpperCase()}
                </span>
                <p className="text-xs text-textSecondary mt-1">Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                  GitHub Repository Link
                </label>
                <input
                  type="url"
                  required
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/your-username/repo-name"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
                  Live Deployment Link (Optional)
                </label>
                <input
                  type="url"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://your-app.vercel.app"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/95 transition-all shadow-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Guided Project'}
              </button>
            </form>
          </div>

          {submission && (
            <MentorFeedback submission={submission} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedProject;
