import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoadmapSection from '../components/projects/RoadmapSection';
import TaskBoard from '../components/tasks/TaskBoard';
import ChatContainer from '../components/chat/ChatContainer';
import RatingModal from '../components/ratings/RatingModal';
import TeamHealthTab from '../components/projects/TeamHealthTab';
import Avatar from '../components/common/Avatar';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);

  const [recommendedDevs, setRecommendedDevs] = useState([]);
  const [reportMember, setReportMember] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);

      const myId = user._id || user.id;
      if (res.data.ownerId?._id === myId || res.data.ownerId === myId) {
        const appRes = await API.get(`/applications/project/${id}`);
        setApplications(appRes.data);

        try {
          const devRecRes = await API.get(`/recommendations/developers/${id}`);
          setRecommendedDevs(devRecRes.data || []);
        } catch (e) {
          console.error('Failed to fetch recommended devs:', e);
        }
      }
    } catch (err) {
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchProjectDetails();
    }
  }, [id, user]);

  if (loading) {
    return <div className="text-center py-12 text-xs text-textSecondary">Loading project details...</div>;
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-textPrimary">Project not found</h3>
      </div>
    );
  }

  const myId = user._id || user.id;
  const isOwner = project.ownerId?._id === myId || project.ownerId === myId;
  const isMember = project.members?.some((m) => m._id === myId || m === myId || m?._id === myId);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await API.post('/applications', { projectId: project._id, message: applyMessage });
      toast.success('Join request sent successfully!');
      setApplyMessage('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleAcceptApplication = async (appId) => {
    try {
      await API.put(`/applications/${appId}/accept`);
      toast.success('Applicant accepted to team!');
      await fetchProjectDetails();
    } catch (err) {
      toast.error('Failed to accept application');
    }
  };

  const handleRejectApplication = async (appId) => {
    try {
      await API.put(`/applications/${appId}/reject`);
      toast.success('Application declined');
      await fetchProjectDetails();
    } catch (err) {
      toast.error('Failed to reject application');
    }
  };

  const handleUpdateRoadmap = async (updatedRoadmap) => {
    const res = await API.put(`/projects/${project._id}/roadmap`, { roadmap: updatedRoadmap });
    setProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        roadmap: res.data.roadmap,
        progress: res.data.progress
      };
    });
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    isMember && { id: 'roadmap', name: 'Roadmap' },
    isMember && { id: 'tasks', name: 'Tasks' },
    isMember && { id: 'chat', name: 'Chat' },
    isOwner && { id: 'analytics', name: 'Health Analytics' }
  ].filter(Boolean);

  const handleFileDispute = async (e) => {
    e.preventDefault();
    if (!reportMember || !reportReason) return;

    setSubmittingDispute(true);
    try {
      await API.post('/disputes', {
        projectId: project._id,
        reportedUser: reportMember._id || reportMember.id,
        reason: reportReason
      });
      toast.success(`Dispute report logged for member ${reportMember.name}`);
      setReportMember(null);
      setReportReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file dispute');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project? Your uncompleted tasks will be set to unassigned.')) return;
    try {
      await API.post(`/projects/${project._id}/leave`);
      toast.success('You have left the project');
      window.location.href = '/dashboard';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave project');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${project.status === 'active' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>
                {project.status}
              </span>
              <h2 className="text-2xl font-bold text-textPrimary leading-none">{project.name}</h2>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">{project.description}</p>
          </div>

          <div className="w-full md:w-64 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold text-textSecondary">
                <span>Roadmap Progress</span>
                <span>{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-300" style={{ width: `${project.progress || 0}%` }} />
              </div>
            </div>

            {project.status === 'completed' && isMember && (
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                ★ Rate Teammates
              </button>
            )}

            {isMember && !isOwner && (
              <button
                onClick={handleLeaveProject}
                className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all border border-rose-200 flex items-center justify-center gap-1.5"
              >
                🚪 Leave Project
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-border">
        <nav className="flex space-x-8 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap focus:outline-none ${tab.id === activeTab ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'}`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Required Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {project.requiredSkills?.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-hoverColor border border-primary/10 rounded-xl text-xs font-bold text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {!isMember && (
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-2">Apply to Join</h3>
                  <p className="text-xs text-textSecondary mb-4">Tell the owner why you are a good fit for this project team.</p>
                  
                  <form onSubmit={handleApply} className="space-y-4">
                    <textarea
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                      rows="3"
                      className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-none"
                      placeholder="Hi, I am experienced in React and would love to build..."
                      required
                    />
                    <button
                      type="submit"
                      disabled={applying}
                      className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {applying ? 'Sending...' : 'Submit Request'}
                    </button>
                  </form>
                </div>
              )}

              {isOwner && (
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Pending Join Requests ({applications.filter(a => a.status === 'pending').length})</h3>
                  <div className="divide-y divide-border">
                    {applications.filter(a => a.status === 'pending').length === 0 ? (
                      <p className="text-xs text-textSecondary italic py-3">No pending join requests.</p>
                    ) : (
                      applications.filter(a => a.status === 'pending').map((app) => (
                        <div key={app._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Avatar user={app.applicantId} size="xs" />
                              <p className="text-xs font-bold text-textPrimary">{app.applicantId?.name} (@{app.applicantId?.username})</p>
                            </div>
                            <p className="text-xs text-textSecondary font-semibold leading-relaxed">Message: "{app.message}"</p>
                          </div>
                          <div className="flex items-center gap-2 self-end md:self-center">
                            <button
                              type="button"
                              onClick={() => handleAcceptApplication(app._id)}
                              className="px-3 py-1.5 bg-success hover:bg-success/90 text-white font-bold text-[10px] rounded-lg shadow-sm"
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectApplication(app._id)}
                              className="px-3 py-1.5 border border-border hover:bg-slate-50 text-textSecondary font-bold text-[10px] rounded-lg"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Developers for Project (Owner view) */}
              {isOwner && recommendedDevs.length > 0 && (
                <div className="bg-gradient-to-r from-violet-900/10 via-purple-900/5 to-transparent border border-violet-200 p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-violet-950">✨ Recommended Developers for Team</h3>
                    <p className="text-xs text-textSecondary">Candidates matching your project's missing skills & team needs.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendedDevs.slice(0, 4).map((rec) => (
                      <div key={rec.developer._id || rec.developer.id} className="p-3 bg-white border border-violet-100 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={rec.developer} size="md" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-textPrimary leading-none">{rec.developer.name}</h4>
                              <span className="px-1.5 py-0.5 bg-violet-100 text-violet-800 text-[9px] font-extrabold rounded-full">
                                {rec.matchScore}% Match
                              </span>
                            </div>
                            <p className="text-[10px] text-textSecondary mt-0.5">@{rec.developer.username} • {rec.developer.title || 'Dev'}</p>
                            {rec.reasons?.length > 0 && (
                              <p className="text-[9px] font-semibold text-violet-700 mt-1">{rec.reasons[0]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'roadmap' && isMember && (
            <RoadmapSection
              project={project}
              onUpdateRoadmap={handleUpdateRoadmap}
              isEditable={isMember}
            />
          )}

          {activeTab === 'tasks' && isMember && (
            <TaskBoard projectId={project._id} members={project.members} />
          )}

          {activeTab === 'chat' && isMember && (
            <ChatContainer projectId={project._id} />
          )}

          {activeTab === 'analytics' && isOwner && (
            <TeamHealthTab projectId={project._id} />
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4">Project Owner</h3>
            <div className="flex items-center gap-3">
              <Avatar user={project.ownerId} size="md" />
              <div>
                <h4 className="text-xs font-bold text-textPrimary leading-tight">{project.ownerId?.name}</h4>
                <p className="text-[10px] text-textSecondary">@{project.ownerId?.username}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider">Team Members ({project.members?.length || 0})</h3>
            <div className="space-y-3">
              {project.members?.map((m) => {
                const isMemberOwner = (m._id || m.id).toString() === (project.ownerId._id || project.ownerId).toString();
                return (
                  <div key={m._id || m.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={m} size="sm" />
                      <div>
                        <h4 className="text-xs font-bold text-textPrimary leading-tight">{m.name}</h4>
                        <p className="text-[9px] text-textSecondary">@{m.username}</p>
                      </div>
                    </div>
                    {isOwner && !isMemberOwner && (
                      <button
                        onClick={() => setReportMember(m)}
                        className="text-[10px] text-rose-500 hover:text-rose-700 font-bold px-2 py-0.5 rounded border border-rose-100 hover:bg-rose-50 transition-all"
                      >
                        ⚠️ Report
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {project.githubRepo && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Repository Link</h3>
              <a
                href={project.githubRepo}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-primary hover:underline break-all"
              >
                {project.githubRepo}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Report Member Dispute Modal */}
      {reportMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4 py-6">
          <div className="w-full max-w-md bg-white rounded-3xl border border-border shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="text-base font-bold text-rose-700">Report Member: {reportMember.name}</h3>
              <button onClick={() => setReportMember(null)} className="text-textSecondary hover:text-textPrimary font-bold text-lg">&times;</button>
            </div>
            <form onSubmit={handleFileDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1.5">Reason for Report *</label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2 border border-border rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-xs resize-none"
                  placeholder="Describe the issue (e.g. repeated unresponsiveness, inappropriate conduct, abandoned tasks)..."
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReportMember(null)}
                  className="px-4 py-2 border border-border rounded-xl text-xs font-semibold text-textSecondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDispute}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                >
                  {submittingDispute ? 'Logging...' : 'File Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRatingModal && (
        <RatingModal
          project={project}
          currentUser={user}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
