import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bootcampService from '../services/bootcampService';
import { toast } from 'react-hot-toast';

const CreateBootcamp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Core Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('frontend');
  const [level, setLevel] = useState('beginner');
  const [duration, setDuration] = useState('4 weeks');
  const [prerequisites, setPrerequisites] = useState('');
  const [maxStudents, setMaxStudents] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Capstone Project
  const [capstoneTitle, setCapstoneTitle] = useState('');
  const [capstoneDescription, setCapstoneDescription] = useState('');
  const [capstoneSkills, setCapstoneSkills] = useState('');
  const [capstoneTeamSize, setCapstoneTeamSize] = useState(4);

  // Curriculum Builder (Start with 1 week)
  const [curriculum, setCurriculum] = useState([
    {
      week: 1,
      title: 'Introduction & Setup',
      description: 'Understanding the fundamentals and setting up developer tools.',
      topicsInput: 'HTML, CSS, Git',
      resources: [{ title: 'Official Docs', url: 'https://developer.mozilla.org', type: 'documentation' }],
      assignment: { title: 'First Web Page', description: 'Build and deploy a simple HTML page.', deadline: '' }
    }
  ]);

  const addWeek = () => {
    const nextWeek = curriculum.length + 1;
    setCurriculum(prev => [
      ...prev,
      {
        week: nextWeek,
        title: '',
        description: '',
        topicsInput: '',
        resources: [],
        assignment: { title: '', description: '', deadline: '' }
      }
    ]);
  };

  const handleWeekChange = (index, field, value) => {
    setCurriculum(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleAssignmentChange = (index, field, value) => {
    setCurriculum(prev => {
      const updated = [...prev];
      updated[index].assignment = {
        ...updated[index].assignment,
        [field]: value
      };
      return updated;
    });
  };

  const addResource = (weekIndex) => {
    setCurriculum(prev => {
      const updated = [...prev];
      updated[weekIndex].resources.push({ title: '', url: '', type: 'video' });
      return updated;
    });
  };

  const handleResourceChange = (weekIndex, resIndex, field, value) => {
    setCurriculum(prev => {
      const updated = [...prev];
      updated[weekIndex].resources[resIndex][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !duration.trim()) {
      return toast.error('Please enter the core details of the bootcamp');
    }

    setLoading(true);
    try {
      // Parse prerequisites
      const prereqsArray = prerequisites.split(',').map(s => s.trim()).filter(Boolean);
      const capstoneSkillsArray = capstoneSkills.split(',').map(s => s.trim()).filter(Boolean);

      // Parse curriculum
      const parsedCurriculum = curriculum.map(c => ({
        week: Number(c.week),
        title: c.title,
        description: c.description,
        topics: c.topicsInput.split(',').map(s => s.trim()).filter(Boolean),
        resources: c.resources.filter(r => r.title.trim() && r.url.trim()),
        assignment: c.assignment.title.trim() ? {
          title: c.assignment.title,
          description: c.assignment.description,
          deadline: c.assignment.deadline ? new Date(c.assignment.deadline) : undefined
        } : undefined
      }));

      const bootcampData = {
        title,
        description,
        category,
        level,
        duration,
        prerequisites: prereqsArray,
        maxStudents: Number(maxStudents),
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        capstoneProject: {
          title: capstoneTitle || undefined,
          description: capstoneDescription || undefined,
          requiredSkills: capstoneSkillsArray,
          teamSize: Number(capstoneTeamSize)
        },
        curriculum: parsedCurriculum
      };

      await bootcampService.createBootcamp(bootcampData);
      toast.success('🎉 Bootcamp created successfully!');
      navigate('/learn');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to create bootcamp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-textPrimary">Create Bootcamp</h1>
        <p className="text-sm text-textSecondary mt-1">Design a comprehensive, milestone-based program to guide beginners.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core details card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-textPrimary border-b border-slate-100 pb-3">1. General Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Bootcamp Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend Development Crash Course"
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Description</label>
              <textarea
                required
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline what students will learn, the objectives, and project milestones..."
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="fullstack">Fullstack</option>
                <option value="mobile">Mobile</option>
                <option value="devops">DevOps</option>
                <option value="data-science">Data Science</option>
                <option value="cloud">Cloud</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Difficulty level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Duration</label>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 6 weeks"
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Max Students Limit</label>
              <input
                type="number"
                required
                min="1"
                value={maxStudents}
                onChange={(e) => setMaxStudents(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Prerequisites (Comma separated, e.g. HTML, CSS, JavaScript)</label>
              <input
                type="text"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                placeholder="Basic Javascript, Git command line"
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Capstone details card */}
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-textPrimary border-b border-slate-100 pb-3">2. Capstone Project Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Capstone Project Title</label>
              <input
                type="text"
                value={capstoneTitle}
                onChange={(e) => setCapstoneTitle(e.target.value)}
                placeholder="e.g. Fullstack E-Commerce Application"
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Capstone Project Description</label>
              <textarea
                rows="3"
                value={capstoneDescription}
                onChange={(e) => setCapstoneDescription(e.target.value)}
                placeholder="Describe the final capstone project requirements, objectives, and deliverables..."
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Capstone Skills Required (Comma separated)</label>
              <input
                type="text"
                value={capstoneSkills}
                onChange={(e) => setCapstoneSkills(e.target.value)}
                placeholder="React, REST APIs, Authentication"
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Optimal Team Size</label>
              <input
                type="number"
                min="2"
                max="8"
                value={capstoneTeamSize}
                onChange={(e) => setCapstoneTeamSize(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        {/* Curriculum section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-textPrimary">3. Dynamic Curriculum builder</h3>
            <button
              type="button"
              onClick={addWeek}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 border border-border transition-all"
            >
              ➕ Add Week
            </button>
          </div>

          {curriculum.map((weekItem, wIdx) => (
            <div key={weekItem.week} className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-6 relative">
              <span className="absolute top-4 right-4 bg-indigo-50 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase">
                Week {weekItem.week}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Week Title</label>
                  <input
                    type="text"
                    required
                    value={weekItem.title}
                    onChange={(e) => handleWeekChange(wIdx, 'title', e.target.value)}
                    placeholder="e.g. Master the DOM API"
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Week Description</label>
                  <textarea
                    rows="2"
                    required
                    value={weekItem.description}
                    onChange={(e) => handleWeekChange(wIdx, 'description', e.target.value)}
                    placeholder="Outline this week's content goals..."
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  ></textarea>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Topics (Comma separated)</label>
                  <input
                    type="text"
                    value={weekItem.topicsInput}
                    onChange={(e) => handleWeekChange(wIdx, 'topicsInput', e.target.value)}
                    placeholder="DOM, Events, LocalStorage"
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Resources */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">Weekly Learning Links</h4>
                  <button
                    type="button"
                    onClick={() => addResource(wIdx)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    + Add Link
                  </button>
                </div>

                {weekItem.resources.map((res, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Resource Title (e.g. Grid Crash Course)"
                      required
                      value={res.title}
                      onChange={(e) => handleResourceChange(wIdx, rIdx, 'title', e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-border rounded-lg text-xs"
                    />
                    <input
                      type="url"
                      placeholder="Resource URL"
                      required
                      value={res.url}
                      onChange={(e) => handleResourceChange(wIdx, rIdx, 'url', e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-border rounded-lg text-xs"
                    />
                    <select
                      value={res.type}
                      onChange={(e) => handleResourceChange(wIdx, rIdx, 'type', e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-border rounded-lg text-xs"
                    >
                      <option value="video">Video</option>
                      <option value="article">Article</option>
                      <option value="documentation">Documentation</option>
                      <option value="github">GitHub</option>
                    </select>
                  </div>
                ))}
              </div>

              {/* Assignment Outline */}
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider">Week Assignment (Submit Form Generated)</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Assignment Title</label>
                    <input
                      type="text"
                      value={weekItem.assignment.title}
                      onChange={(e) => handleAssignmentChange(wIdx, 'title', e.target.value)}
                      placeholder="e.g. Build dynamic calculator"
                      className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Deadline</label>
                    <input
                      type="date"
                      value={weekItem.assignment.deadline}
                      onChange={(e) => handleAssignmentChange(wIdx, 'deadline', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-textSecondary font-bold mb-1.5">Assignment Requirements Description</label>
                    <textarea
                      rows="2"
                      value={weekItem.assignment.description}
                      onChange={(e) => handleAssignmentChange(wIdx, 'description', e.target.value)}
                      placeholder="Outline instructions, APIs to use, and deliverables..."
                      className="w-full px-3 py-2 bg-slate-50 border border-border rounded-lg text-xs resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/learn')}
            className="px-6 py-3 border border-border rounded-xl text-sm font-bold text-textSecondary hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/95 transition-all shadow-md"
          >
            {loading ? 'Publishing...' : 'Publish Bootcamp'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBootcamp;
