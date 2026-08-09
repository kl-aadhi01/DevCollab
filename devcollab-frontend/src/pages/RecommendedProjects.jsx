import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTransition } from '../hooks/useTransition';

const RecommendedProjects = () => {
  const navigate = useNavigate();
  const { recommendedProjects, loading, error, fetchRecommendations } = useTransition();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading project recommendations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary">Recommended Projects</h1>
          <p className="text-sm text-textSecondary mt-1">
            Browse planning-phase projects matching your skill sets. Apply to join a team and start building!
          </p>
        </div>
        <Link
          to="/create-project"
          className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/95 shadow-md transition-all"
        >
          ➕ Start New Project
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-error p-4 rounded-xl border border-red-200 text-sm font-semibold mb-6">
          {error}
        </div>
      )}

      {recommendedProjects.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-2xl p-8 max-w-lg mx-auto shadow-sm">
          <span className="text-5xl">📂</span>
          <h3 className="text-lg font-bold text-textPrimary mt-4">No matching projects found</h3>
          <p className="text-sm text-textSecondary mt-1 mb-6">
            There are currently no planning-phase projects. Why not initialize your own project and invite other graduates?
          </p>
          <Link
            to="/create-project"
            className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/95 transition-all shadow-sm"
          >
            Create First Project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedProjects.map((project) => (
            <div key={project._id} className="bg-white border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-textPrimary hover:text-primary transition-colors">
                    <Link to={`/projects/${project._id}`}>{project.name}</Link>
                  </h3>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase">
                    {project.status}
                  </span>
                </div>

                <p className="text-sm text-textSecondary mb-4 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>

                {project.requiredSkills && project.requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {project.requiredSkills.map((skill, idx) => (
                        <span key={idx} className="bg-indigo-50 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs uppercase text-slate-700">
                    {project.ownerId?.name?.charAt(0) || 'O'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-textPrimary leading-none">{project.ownerId?.name || 'Owner'}</p>
                    <p className="text-[10px] text-textSecondary">@{project.ownerId?.username || 'owner'}</p>
                  </div>
                </div>
                <Link
                  to={`/projects/${project._id}`}
                  className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/95 transition-all shadow-sm"
                >
                  View Workspace
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedProjects;
