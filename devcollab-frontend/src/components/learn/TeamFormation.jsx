import React, { useState } from 'react';

const TeamFormation = ({ graduatesCount, onFormTeam, loading }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFormTeam({
      projectName: projectName.trim() || undefined,
      projectDescription: projectDescription.trim() || undefined
    });
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-textPrimary mb-4">Capstone Team Formation</h3>
      <p className="text-sm text-textSecondary mb-6 leading-relaxed">
        Form a project team in the BUILD track for graduates of this bootcamp. The system will automatically bundle graduates as members.
      </p>

      <div className="bg-slate-50 border border-border rounded-xl p-4 mb-6 flex justify-between items-center text-sm">
        <span className="font-medium text-textSecondary">Completed Graduates Available:</span>
        <span className="bg-success text-white px-3 py-1 rounded-full font-bold">{graduatesCount}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="projName" className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
            Project Name (Optional)
          </label>
          <input
            type="text"
            id="projName"
            placeholder="e.g. My Capstone Team Project"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label htmlFor="projDesc" className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
            Project Description (Optional)
          </label>
          <textarea
            id="projDesc"
            rows="3"
            placeholder="Describe the goals and details of the project team..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading || graduatesCount === 0}
          className="w-full py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>👥</span> {loading ? 'Launching Project...' : 'Form Team & Launch Project'}
        </button>
      </form>
    </div>
  );
};

export default TeamFormation;
