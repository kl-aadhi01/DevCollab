import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all shadow-sm">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${project.status === 'active' ? 'bg-indigo-100 text-indigo-800' : project.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
            {project.status}
          </span>
          <span className="text-xs text-textSecondary font-semibold">
            {project.members?.length || 0} / {project.teamSize} members
          </span>
        </div>

        <h3 className="text-lg font-bold text-textPrimary mb-2 leading-snug">
          {project.name}
        </h3>
        <p className="text-xs text-textSecondary mb-4 line-clamp-3 leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.requiredSkills?.map((skill) => (
            <span key={skill} className="px-2 py-0.5 rounded-lg bg-slate-50 text-textSecondary text-[10px] font-bold border border-slate-100">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-[10px] font-bold text-textSecondary">
            <span>Roadmap Progress</span>
            <span>{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${project.progress || 0}%` }} />
          </div>
        </div>

        <Link
          to={`/projects/${project._id || project.id}`}
          className="block w-full text-center py-2.5 bg-primary/5 hover:bg-primary hover:text-white border border-primary/10 text-primary font-bold text-xs rounded-xl transition-all"
        >
          View Project Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
