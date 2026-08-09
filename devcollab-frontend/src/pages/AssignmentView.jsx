import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAssignment } from '../hooks/useAssignment';
import AssignmentSubmission from '../components/learn/AssignmentSubmission';
import { toast } from 'react-hot-toast';

const AssignmentView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const { assignment, submissions, loading, fetchAssignment, submitWork, gradeWork, fetchSubmissions } = useAssignment();
  
  // Grading state for mentor
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [gradeStatus, setGradeStatus] = useState('graded');
  const [gradingLoading, setGradingLoading] = useState(false);

  useEffect(() => {
    fetchAssignment(id);
  }, [id]);

  useEffect(() => {
    if (assignment && user) {
      const isMentor = assignment.bootcampId?.mentorId === user._id || assignment.bootcampId?.mentorId?._id === user._id;
      if (isMentor) {
        fetchSubmissions(id);
      }
    }
  }, [assignment, user]);

  const handleStudentSubmit = async (submissionUrl) => {
    try {
      await submitWork(assignment._id, submissionUrl);
      toast.success('🎉 Homework submitted successfully! +20 XP awarded.');
      fetchAssignment(id); // Reload details
    } catch (err) {
      toast.error(err || 'Failed to submit assignment');
    }
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setGradingLoading(true);
    try {
      await gradeWork(assignment._id, {
        studentId: selectedSubmission.studentId?._id || selectedSubmission.studentId,
        grade: Number(grade),
        feedback,
        status: gradeStatus
      });
      toast.success('🎉 Graded successfully! Student notified.');
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
      fetchSubmissions(id); // Reload submissions list
    } catch (err) {
      toast.error(err || 'Failed to grade submission');
    } finally {
      setGradingLoading(false);
    }
  };

  if (loading || !assignment) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading assignment details...</p>
      </div>
    );
  }

  const isMentor = assignment.bootcampId?.mentorId === user?._id || assignment.bootcampId?.mentorId?._id === user?._id;
  
  // Student view: find user's submission
  const studentSubmission = isMentor 
    ? null 
    : assignment.submissions?.find(s => s.studentId === user?._id || s.studentId?._id === user?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        to={`/learn/bootcamp/${assignment.bootcampId?._id || assignment.bootcampId}`} 
        className="text-xs font-bold text-textSecondary hover:text-primary transition-colors flex items-center gap-1 mb-6"
      >
        <span>←</span> Back to Bootcamp
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <span className="bg-indigo-50 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Week {assignment.week} Assignment
            </span>
            <h1 className="text-2xl font-extrabold text-textPrimary mt-4 mb-2">{assignment.title}</h1>
            <p className="text-sm text-textSecondary mb-4">
              Deadline: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'No deadline'}
            </p>
            <div className="h-px bg-slate-100 my-4"></div>
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Instructions</h3>
            <p className="text-sm text-textSecondary leading-relaxed whitespace-pre-wrap">
              {assignment.description}
            </p>
          </div>

          {/* Mentor View: Submissions List */}
          {isMentor && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-textPrimary mb-4">Student Submissions</h3>
              
              {submissions.length === 0 ? (
                <p className="text-sm text-textSecondary text-center py-6">No submissions received yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-xs font-bold text-textSecondary uppercase tracking-wider">
                        <th className="pb-3 pr-4">Student</th>
                        <th className="pb-3 px-4">Link</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {submissions.map((sub) => (
                        <tr key={sub._id} className="hover:bg-slate-50/50">
                          <td className="py-4 pr-4">
                            <p className="font-bold text-textPrimary">{sub.studentId?.name || 'Graduated Student'}</p>
                            <p className="text-xs text-textSecondary">@{sub.studentId?.username || 'student'}</p>
                          </td>
                          <td className="py-4 px-4">
                            <a 
                              href={sub.submissionUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary hover:underline font-semibold break-all text-xs"
                            >
                              Open Submission 🔗
                            </a>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              sub.status === 'graded' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : sub.status === 'resubmit'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 pl-4">
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setGrade(sub.grade || '');
                                setFeedback(sub.feedback || '');
                                setGradeStatus(sub.status || 'graded');
                              }}
                              className="px-3 py-1 bg-slate-100 border text-xs font-bold text-textSecondary rounded-lg hover:bg-slate-200"
                            >
                              {sub.status === 'graded' ? 'Edit Grade' : 'Grade'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student View: Submission Widget */}
          {!isMentor && (
            <AssignmentSubmission
              submission={studentSubmission}
              onSubmit={handleStudentSubmit}
              loading={loading}
            />
          )}

          {/* Mentor View: Grading Dialog Form panel */}
          {isMentor && selectedSubmission && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-textPrimary">
                  Grade: {selectedSubmission.studentId?.name}
                </h3>
                <button 
                  onClick={() => setSelectedSubmission(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
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
                    Status
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
                    placeholder="Excellent work! Review topics..."
                    className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-xs resize-none"
                  ></textarea>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="px-3.5 py-1.5 border text-xs font-semibold rounded-lg text-textSecondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={gradingLoading}
                    className="px-4 py-1.5 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/95 transition-all"
                  >
                    {gradingLoading ? 'Submitting...' : 'Submit Grade'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentView;
