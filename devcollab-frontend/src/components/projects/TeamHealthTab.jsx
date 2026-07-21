import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Avatar from '../common/Avatar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#6366f1', '#3b82f6', '#f59e0b', '#10b981'];

const TeamHealthTab = ({ projectId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/projects/${projectId}/analytics`);
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load team health analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchAnalytics();
    }
  }, [projectId]);

  if (loading) {
    return <div className="text-center py-12 text-xs text-textSecondary animate-pulse">Calculating team health metrics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-12 text-xs text-textSecondary">Unable to load analytics data.</div>;
  }

  const { memberContributions = [], statusCounts = {}, burndownTimeline = [] } = analytics;

  const pieData = [
    { name: 'To Do', value: statusCounts.todo || 0 },
    { name: 'In Progress', value: statusCounts.inProgress || 0 },
    { name: 'In Review', value: statusCounts.review || 0 },
    { name: 'Completed', value: statusCounts.done || 0 }
  ].filter(d => d.value > 0);

  const overloadedMembers = memberContributions.filter(m => m.isOverloaded);

  return (
    <div className="space-y-8">
      {/* Overload Alert Bar if applicable */}
      {overloadedMembers.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-900 text-xs">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="font-bold">Overload Warning Detected</h4>
            <p className="text-[11px] text-amber-800">
              The following member(s) are currently assigned tasks across more than 3 active projects: {' '}
              <span className="font-bold">{overloadedMembers.map(m => `@${m.username}`).join(', ')}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Member Contribution Breakdown */}
      <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-textPrimary">Per-Member Contribution Breakdown</h3>
          <p className="text-xs text-textSecondary">Tasks completed vs chat engagement per team member.</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memberContributions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="completedTasks" name="Completed Tasks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="messagesSent" name="Chat Messages Sent" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member Overload Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {memberContributions.map((m) => (
            <div key={m.userId} className="p-3 bg-slate-50 border border-border rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar user={m} size="sm" />
                <div>
                  <h4 className="text-xs font-bold text-textPrimary leading-tight">{m.name}</h4>
                  <p className="text-[10px] text-textSecondary">⚡ {m.reliabilityScore}% Reliability</p>
                </div>
              </div>
              <div>
                {m.isOverloaded ? (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded-full border border-amber-200">
                    Overloaded ({m.activeProjectsCount} Projs)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-full">
                    Balanced
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Completion Burndown & Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Burndown Line Chart */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-textPrimary">Project Burndown Chart</h3>
            <p className="text-xs text-textSecondary">Remaining open tasks over the last 7 days.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={burndownTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="remainingTasks" name="Remaining Tasks" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="completedTasks" name="Completed Tasks" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Status Pie Chart */}
        <div className="bg-white border border-border rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-textPrimary">Task Status Distribution</h3>
            <p className="text-xs text-textSecondary">Breakdown of current task board states.</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-textSecondary italic">No tasks created yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHealthTab;
