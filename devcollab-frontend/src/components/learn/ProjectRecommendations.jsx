import React from 'react';
import { Link } from 'react-router-dom';

const ProjectRecommendations = ({ projects }) => {
  if (!projects || projects.length === 0) {
    return (
      <div className="bg-white border border-border p-6 rounded-2xl text-center text-xs text-textSecondary shadow-sm">
        No matching collaborative projects found. Visit the Explorer to browse all projects.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-textPrimary">Recommended Projects for You</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project._id} className="bg-white border border-border rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-bold text-textPrimary line-clamp-1">{project.name}</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-textSecondary line-clamp-2 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-1 mb-4">
                {project.requiredSkills?.map((skill) => (
                  <span key={skill} className="text-[9px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-50">
              <span className="text-[10px] text-textSecondary">
                Team limit: {project.teamSize} members
              </span>
              <Link
                to={`/projects/${project._id}`}
                className="text-xs font-bold text-primary hover:underline"
              >
                View Workspace →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectRecommendations;
