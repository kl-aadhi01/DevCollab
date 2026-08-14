import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import learnService from '../services/learnService';
import { toast } from 'react-hot-toast';

const MentorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grading modal state
  const [selectedSub, setSelectedSub] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeStatus, setGradeStatus] = useState('graded');
  const [gradingLoading, setGradingLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [dStats, dStudents, dSubmissions, dBootcamps] = await Promise.all([
        learnService.getMentorDashboard(),
        learnService.getMentorStudents(),
        learnService.getMentorSubmissions(),
        learnService.getBootcamps() // Let's fetch all bootcamps to filter down to own
      ]);
      setStats(dStats);
      setStudents(dStudents);
      setSubmissions(dSubmissions);
      // Filter bootcamps where mentor is the current user (the service returns populated mentorId)
      setBootcamps(dBootcamps);
    } catch (err) {
      console.error("Failed to fetch mentor dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;

    setGradingLoading(true);
    try {
      await learnService.reviewAssignment(selectedSub._id, {
        grade: Number(grade),
        feedback,
        status: gradeStatus
      });
      toast.success('🎉 Graded successfully! Student notified.');
      setSelectedSub(null);
      setGrade('');
      setFeedback('');
      await fetchDashboardData(); // Refresh logs
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to submit grade');
    } finally {
      setGradingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading mentor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary">Mentor Workspace</h1>
          <p className="text-sm text-textSecondary mt-1">Manage bootcamps, review student submissions, and grade weekly assignments.</p>
        </div>
        <Link
          to="/learn/create-bootcamp"
          className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <span>➕</span> Create Bootcamp
        </Link>
      </div>

      {/* Stats Board */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">My Programs</p>
            <p className="text-3xl font-extrabold text-textPrimary mt-2">{stats.totalBootcamps || 0}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Active Programs</p>
            <p className="text-3xl font-extrabold text-primary mt-2">{stats.activeBootcamps || 0}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Active Learners</p>
            <p className="text-3xl font-extrabold text-teal-600 mt-2">{stats.totalLearners || 0}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Review Queue</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-2">{stats.pendingSubmissions || 0}</p>
          </div>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Bootcamps list & grading queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bootcamp list */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-textPrimary mb-4">My Bootcamp Programs</h3>
            {bootcamps.length === 0 ? (
              <p className="text-sm text-textSecondary text-center py-6">You haven't created any bootcamps yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {bootcamps.map(bc => (
                  <div key={bc._id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-textPrimary text-sm sm:text-base hover:text-primary">
                        <Link to={`/learn/bootcamp/${bc._id}`}>{bc.title}</Link>
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-textSecondary mt-1 font-medium">
                        <span className="uppercase text-primary font-bold">{bc.category}</span>
                        <span>•</span>
                        <span>{bc.enrolledStudents?.length || 0} enrolled</span>
                        <span>•</span>
                        <span>{bc.duration}</span>
                      </div>
                    </div>
                    <Link
                      to={`/learn/bootcamps/${bc._id}/manage`}
                      className="px-3.5 py-1.5 border border-border text-xs font-bold rounded-lg text-textSecondary hover:bg-slate-50 hover:text-primary transition-all"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submissions Grading Queue */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Grading Feedback Queue</h3>
            {submissions.length === 0 ? (
              <p className="text-sm text-textSecondary text-center py-6">All assignments graded! The queue is empty.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div key={sub._id} className="p-4 border border-border rounded-xl flex justify-between items-center gap-4 bg-slate-50/50">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase">Week {sub.assignmentId?.week} Assignment</h4>
                      <p className="text-sm font-bold text-textPrimary">{sub.assignmentId?.title}</p>
                      <p className="text-xs text-textSecondary">
                        Submitted by: {sub.studentId?.name} (@{sub.studentId?.username})
                      </p>
                      <a href={sub.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline font-semibold flex items-center gap-1 mt-1">
                        Open Work link 🔗
                      </a>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setGrade(sub.grade || '');
                        setFeedback(sub.feedback || '');
                        setGradeStatus(sub.status || 'graded');
                      }}
                      className="px-4 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-bold rounded-xl shadow-xs shrink-0"
                    >
                      Evaluate
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Enrolled Student Log & Grading Dialogue */}
        <div className="lg:col-span-1 space-y-6">
          {/* Grading Wizard Overlay Panel */}
          {selectedSub && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <h3 className="text-base font-bold text-textPrimary">Grade: {selectedSub.studentId?.name}</h3>
                <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleGradeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="grade" className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                    Score (0 - 100)
                  </label>
                  <input
                    type="number"
                    id="grade"
                    required
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="85"
                    className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label htmlFor="gradeStatus" className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                    Evaluation Status
                  </label>
                  <select
                    id="gradeStatus"
                    value={gradeStatus}
                    onChange={(e) => setGradeStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none"
                  >
                    <option value="graded">Graded (Accept)</option>
                    <option value="resubmit">Resubmit (Revision Required)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="feedback" className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                    Feedback / Comments
                  </label>
                  <textarea
                    id="feedback"
                    rows="3"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide constructive review guidelines..."
                    className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-3.5 py-1.5 border text-xs font-semibold rounded-lg text-textSecondary hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={gradingLoading}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-xs"
                  >
                    {gradingLoading ? 'Submitting...' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Student activity log list */}
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Learner Activity Logs</h3>
            {students.length === 0 ? (
              <p className="text-sm text-textSecondary text-center py-4">No active students enrolled.</p>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student._id} className="flex gap-3 items-start text-xs border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-primary uppercase">
                      {student.studentId?.name?.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-textPrimary truncate leading-none">{student.studentId?.name}</p>
                      <p className="text-[10px] text-textSecondary mt-0.5">@{student.studentId?.username}</p>
                      <div className="mt-1.5 flex justify-between items-center text-[10px]">
                        <span className="text-textSecondary truncate max-w-[120px]">{student.bootcampId?.title}</span>
                        <span className="font-bold text-primary">{student.progress}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
