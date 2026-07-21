import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectList = ({ projects, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white border border-border rounded-2xl p-6 h-64 animate-pulse space-y-4">
            <div className="h-4 bg-slate-100 rounded w-1/4"></div>
            <div className="h-6 bg-slate-100 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          </div>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-3xl border border-border">
        <span className="text-4xl">📂</span>
        <h3 className="text-lg font-bold text-textPrimary mt-4">No projects found</h3>
        <p className="text-sm text-textSecondary mt-2">Try adjusting your filters or search terms.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project._id || project.id} project={project} />
      ))}
    </div>
  );
};

export default ProjectList;
