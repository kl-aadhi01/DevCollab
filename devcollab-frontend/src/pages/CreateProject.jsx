import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { toast } from 'react-hot-toast';

const CreateProject = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectIdea, setProjectIdea] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [teamSize, setTeamSize] = useState(3);
  const [deadline, setDeadline] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Task Breakdown State
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiTasks, setAiTasks] = useState([]);

  const handleGenerateAITasks = async () => {
    const textToAnalyze = projectIdea || description;
    if (!textToAnalyze) {
      return toast.error('Please enter a description or project idea first to generate tasks!');
    }

    setGeneratingAI(true);
    try {
      const requiredSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const res = await API.post('/ai/breakdown-tasks', {
        description: textToAnalyze,
        requiredSkills,
        teamSize: Number(teamSize)
      });
      setAiTasks(res.data || []);
      toast.success('AI task breakdown generated! Review and edit tasks below.');
    } catch (err) {
      toast.error('Failed to generate AI tasks');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...aiTasks];
    updated[index][field] = value;
    setAiTasks(updated);
  };

  const handleRemoveTask = (index) => {
    setAiTasks(aiTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !skillsText || !deadline) {
      return toast.error('Please enter all required fields');
    }

    setLoading(true);
    try {
      const requiredSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean);

      // Create roadmap phases from AI tasks if present
      let roadmapPayload = [];
      if (aiTasks.length > 0) {
        const milestones = aiTasks.map(t => ({
          title: t.title,
          description: t.description,
          status: 'pending'
        }));
        roadmapPayload = [
          {
            phase: 'AI-Generated Milestone Roadmap',
            description: 'Core tasks generated during project setup',
            milestones
          }
        ];
      }

      const res = await API.post('/projects', {
        name,
        description,
        requiredSkills,
        teamSize: Number(teamSize),
        deadline: new Date(deadline),
        githubRepo,
        roadmap: roadmapPayload
      });

      const projectId = res.data._id || res.data.id;

      // Save AI tasks to Task collection
      if (aiTasks.length > 0) {
        for (const task of aiTasks) {
          try {
            await API.post('/tasks', {
              projectId,
              title: task.title,
              description: task.description,
              priority: task.priority || 'medium',
              aiGenerated: true
            });
          } catch (taskErr) {
            console.error('Failed saving task:', taskErr);
          }
        }
      }

      toast.success('Project created successfully! +100 XP');
      navigate(`/projects/${projectId}`);
    } catch (err) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Create a Project</h2>
          <p className="text-xs text-textSecondary mt-1">Start a new project as an owner, define requirements, and invite developers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              placeholder="e.g. Chat app with socket.io"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm resize-none"
              placeholder="Detailed explanation of the goals, features, and stack..."
              required
            />
          </div>

          {/* Optional AI Task Breakdown input */}
          <div className="p-4 bg-violet-50/60 border border-violet-200/80 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-violet-900">✨ AI-Assisted Task Breakdown</h4>
                <p className="text-[11px] text-violet-700">Describe your project idea to automatically generate structured tasks and roadmap milestones.</p>
              </div>
              <button
                type="button"
                onClick={handleGenerateAITasks}
                disabled={generatingAI}
                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap disabled:opacity-50"
              >
                {generatingAI ? 'Generating...' : 'Generate AI Breakdown'}
              </button>
            </div>

            <div>
              <textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                rows="2"
                className="w-full px-3.5 py-2 border border-violet-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-xs bg-white resize-none"
                placeholder="Describe your project idea in detail (or leave blank to use the description above)..."
              />
            </div>

            {/* AI Tasks Review List */}
            {aiTasks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-violet-200/80">
                <p className="text-[11px] font-bold text-violet-900 uppercase">Review & Edit Generated Tasks ({aiTasks.length}):</p>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {aiTasks.map((task, idx) => (
                    <div key={idx} className="p-3 bg-white border border-violet-200 rounded-xl space-y-2 relative group">
                      <div className="flex justify-between items-start gap-2">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleTaskChange(idx, 'title', e.target.value)}
                          className="font-bold text-xs text-textPrimary w-full outline-none border-b border-transparent focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveTask(idx)}
                          className="text-slate-400 hover:text-rose-500 font-bold text-xs"
                        >
                          &times;
                        </button>
                      </div>
                      <textarea
                        value={task.description}
                        onChange={(e) => handleTaskChange(idx, 'description', e.target.value)}
                        rows="2"
                        className="w-full text-[11px] text-textSecondary outline-none border border-slate-100 rounded-lg p-1.5 resize-none focus:border-primary"
                      />
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-violet-100 text-violet-800 font-bold">✨ AI Generated</span>
                        <select
                          value={task.priority || 'medium'}
                          onChange={(e) => handleTaskChange(idx, 'priority', e.target.value)}
                          className="px-2 py-0.5 border border-slate-200 rounded bg-white font-semibold text-textSecondary outline-none"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Required Skills * (comma-separated)</label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                placeholder="e.g. React, Node.js, Socket.io"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">GitHub Repository URL</label>
              <input
                type="url"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                placeholder="https://github.com/username/repo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Target Team Size *</label>
              <input
                type="number"
                min="2"
                max="50"
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">Target Deadline *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-semibold rounded-xl text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
