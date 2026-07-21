import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import API from '../../services/api';

const PortfolioSection = () => {
  const { user, setUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      return toast.error('Please enter title and description');
    }

    setSaving(true);
    try {
      const newPortfolio = {
        title,
        description,
        url,
        githubRepo,
        technologies: [],
        image: ''
      };

      const updatedPortfolio = [...user.portfolio, newPortfolio];
      const res = await API.put('/auth/profile', { portfolio: updatedPortfolio });
      setUser(res.data);
      toast.success('Portfolio item added successfully!');
      
      setTitle('');
      setDescription('');
      setUrl('');
      setGithubRepo('');
      setShowAddForm(false);
    } catch (err) {
      toast.error('Failed to add portfolio item');
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePortfolio = async (id) => {
    setSaving(true);
    try {
      const updatedPortfolio = user.portfolio.filter(p => p._id !== id);
      const res = await API.put('/auth/profile', { portfolio: updatedPortfolio });
      setUser(res.data);
      toast.success('Portfolio item removed');
    } catch (err) {
      toast.error('Failed to remove portfolio item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-textPrimary">Portfolio Projects</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-xs font-bold text-primary hover:underline focus:outline-none"
        >
          {showAddForm ? 'Cancel' : '+ Add Project'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPortfolio} className="space-y-4 mb-6 p-4 border border-border bg-slate-50 rounded-xl">
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Project Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
              placeholder="e.g. Chat application"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white resize-none"
              placeholder="Briefly describe the project stack and goal..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Live Demo URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">GitHub Repository URL</label>
              <input
                type="url"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm bg-white"
                placeholder="https://github.com/your-username/repo"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? 'Adding...' : 'Add Project'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user.portfolio.length === 0 ? (
          <p className="col-span-2 text-xs text-textSecondary italic">No portfolio projects added yet.</p>
        ) : (
          user.portfolio.map((project) => (
            <div key={project._id} className="border border-border p-5 rounded-2xl flex flex-col justify-between hover:shadow-sm transition-all bg-slate-50/50">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-textPrimary">{project.title}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemovePortfolio(project._id)}
                    disabled={saving}
                    className="text-[10px] text-error font-medium hover:underline focus:outline-none"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-textSecondary mt-2 leading-relaxed">{project.description}</p>
              </div>

              <div className="flex items-center gap-3 mt-4 text-[10px] font-semibold">
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    🔗 Demo
                  </a>
                )}
                {project.githubRepo && (
                  <a href={project.githubRepo} target="_blank" rel="noopener noreferrer" className="text-textSecondary hover:text-textPrimary hover:underline flex items-center gap-1">
                    📁 GitHub
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PortfolioSection;
