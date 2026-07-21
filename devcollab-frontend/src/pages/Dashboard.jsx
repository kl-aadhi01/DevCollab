import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import OnboardingModal from '../components/onboarding/OnboardingModal';
import ProfileRankBadge from '../components/gamification/ProfileRankBadge';
import Avatar from '../components/common/Avatar';
import API from '../services/api';
import { LEVELS } from '../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [projects, setProjects] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [growthSuggestion, setGrowthSuggestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pRes = await API.get('/projects');
        const tRes = await API.get('/tasks/assigned');

        if (user) {
          const myId = user._id || user.id;
          const myProjects = pRes.data.filter(p =>
            p.ownerId._id === myId ||
            p.ownerId === myId ||
            (p.members && p.members.some(m => m._id === myId || m === myId))
          );
          setProjects(myProjects);

          try {
            const sugRes = await API.get(`/suggestions/next-project/${myId}`);
            if (sugRes.data?.project) {
              setGrowthSuggestion(sugRes.data);
            }
          } catch (e) {
            console.error('Failed fetching growth suggestion:', e);
          }
        }
        setAssignedTasks(tRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) return null;

  const currentLvlConfig = LEVELS.find(l => l.level === user.level) || { pointsRequired: 0 };
  const nextLvlConfig = LEVELS.find(l => l.level === user.level + 1) || { pointsRequired: 4500 };
  const pointsInCurrentLevel = user.points - currentLvlConfig.pointsRequired;
  const pointsNeededForNext = nextLvlConfig.pointsRequired - currentLvlConfig.pointsRequired;
  const progressPercent = pointsNeededForNext > 0 ? Math.min(100, Math.max(0, Math.round((pointsInCurrentLevel / pointsNeededForNext) * 100))) : 100;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <OnboardingModal />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <Avatar user={user} size="xl" />
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-xl font-bold text-textPrimary">Welcome back, {user.name}! 👋</h2>
              <p className="text-xs text-textSecondary font-semibold">@{user.username}</p>
              <p className="text-sm font-semibold text-textSecondary mt-1">{user.title || 'Developer'}</p>
              <div className="pt-2">
                <ProfileRankBadge rank={user.rank} />
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-6">
            <div className="flex justify-between text-xs font-bold text-textSecondary">
              <span>Level {user.level}</span>
              <span>{user.points} / {nextLvlConfig.pointsRequired} XP</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-[10px] text-textSecondary text-right font-semibold">
              {nextLvlConfig.pointsRequired - user.points} XP until Level {user.level + 1}
            </p>
          </div>
        </div>

        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/create-project" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-hoverColor border border-border rounded-2xl transition-all">
              <span className="text-2xl mb-1">📁</span>
              <span className="text-xs font-bold text-textPrimary">Create Project</span>
            </Link>
            <Link to="/projects" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-hoverColor border border-border rounded-2xl transition-all">
              <span className="text-2xl mb-1">🔍</span>
              <span className="text-xs font-bold text-textPrimary">Find Projects</span>
            </Link>
            <Link to="/marketplace" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-hoverColor border border-border rounded-2xl transition-all">
              <span className="text-2xl mb-1">👥</span>
              <span className="text-xs font-bold text-textPrimary">Marketplace</span>
            </Link>
            <Link to="/leaderboard" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-hoverColor border border-border rounded-2xl transition-all">
              <span className="text-2xl mb-1">🏆</span>
              <span className="text-xs font-bold text-textPrimary">Leaderboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-textPrimary">Your Active Projects ({projects.length})</h3>
          
          {loading ? (
            <div className="text-center text-xs text-textSecondary py-8">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="p-8 border border-border bg-white rounded-3xl text-center">
              <span className="text-3xl">📂</span>
              <p className="text-xs text-textSecondary mt-2">You aren't active in any projects yet. Create one or apply to join!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map(p => (
                <div key={p._id} className="bg-white border border-border p-5 rounded-2xl flex flex-col justify-between shadow-sm">
                  <div>
                    <h4 className="text-sm font-bold text-textPrimary truncate">{p.name}</h4>
                    <p className="text-[11px] text-textSecondary leading-relaxed mt-1 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-textSecondary font-semibold">Progress:</span>
                      <span className="text-xs font-bold text-primary">{p.progress}%</span>
                    </div>
                    <Link to={`/projects/${p._id}`} className="text-xs font-bold text-primary hover:underline">
                      Open Board
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-textPrimary">Assigned Tasks ({assignedTasks.length})</h3>
          {loading ? (
            <div className="text-center text-xs text-textSecondary py-8">Loading tasks...</div>
          ) : assignedTasks.length === 0 ? (
            <div className="p-8 border border-border bg-white rounded-3xl text-center">
              <span className="text-3xl">📋</span>
              <p className="text-xs text-textSecondary mt-2">No tasks assigned to you right now.</p>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-3xl p-5 divide-y divide-border shadow-sm">
              {assignedTasks.map(t => (
                <div key={t._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary truncate">{t.title}</h4>
                    <p className="text-[9px] text-textSecondary font-semibold">Project: {t.projectId?.name}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${t.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Skill Growth Suggestion Card */}
          {growthSuggestion?.project && (
            <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent border border-emerald-200/80 rounded-3xl p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌱</span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Suggested Next Project</h4>
                  <p className="text-[10px] text-emerald-800 font-semibold">Skill Growth Recommendation</p>
                </div>
              </div>

              <div className="bg-white border border-emerald-100 p-4 rounded-2xl space-y-2">
                <div className="flex justify-between items-start">
                  <h5 className="text-xs font-bold text-textPrimary">{growthSuggestion.project.name}</h5>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] rounded-full uppercase">
                    + {growthSuggestion.targetGapSkill}
                  </span>
                </div>
                <p className="text-[10px] text-textSecondary leading-relaxed line-clamp-2">{growthSuggestion.project.description}</p>
                <p className="text-[9px] font-semibold text-emerald-700 pt-1">💡 {growthSuggestion.reason}</p>
                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/projects/${growthSuggestion.project._id || growthSuggestion.project.id}`}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                  >
                    View Project ↗
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
