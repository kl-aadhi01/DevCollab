import React, { useState, useEffect } from 'react';
import ProjectList from '../components/projects/ProjectList';
import ProjectCard from '../components/projects/ProjectCard';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [status, setStatus] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (skill) params.skill = skill;
      if (status) params.status = status;

      const res = await API.get('/projects', { params });
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user) return;
    try {
      const res = await API.get(`/recommendations/projects/${user._id || user.id}`);
      setRecommendations(res.data || []);
    } catch (err) {
      console.error('Failed fetching recommendations:', err);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, skill, status]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-textPrimary">Discover Projects</h2>
          <p className="text-xs text-textSecondary mt-1">Browse active developer projects and apply to join teams.</p>
        </div>
      </div>

      {/* Recommended for You Section */}
      {recommendations.length > 0 && !search && !skill && (
        <div className="p-6 bg-gradient-to-r from-violet-900/10 via-purple-900/5 to-transparent border border-violet-200/80 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <div>
              <h3 className="text-sm font-bold text-violet-950">Recommended for You</h3>
              <p className="text-xs text-textSecondary">Projects computed based on skill complementarity & working style.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.project._id || rec.project.id} className="relative group">
                <div className="absolute -top-2.5 right-3 z-10 px-2.5 py-0.5 bg-violet-600 text-white text-[10px] font-extrabold rounded-full shadow-sm">
                  ⚡ {rec.matchScore}% Match
                </div>
                <ProjectCard project={rec.project} />
                {rec.reasons?.length > 0 && (
                  <p className="text-[10px] text-violet-700 font-semibold px-2 pt-1 line-clamp-1">
                    💡 {rec.reasons[0]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-border p-4 rounded-2xl shadow-sm">
        <div>
          <label className="block text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1.5">Search by name</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
            placeholder="e.g. Chat app"
          />
        </div>
        <div>
          <label className="block text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1.5">Required Skill</label>
          <input
            type="text"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
            placeholder="e.g. React"
          />
        </div>
        <div>
          <label className="block text-[10px] text-textSecondary font-bold uppercase tracking-wider mb-1.5">Project Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs bg-white"
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <ProjectList projects={projects} loading={loading} />
    </div>
  );
};

export default Projects;
