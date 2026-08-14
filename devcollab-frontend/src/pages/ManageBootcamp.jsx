import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import learnService from '../services/learnService';
import { toast } from 'react-hot-toast';

const ManageBootcamp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bootcampData, setBootcampData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);

  // Forms overlays / states
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonDoc, setLessonDoc] = useState('');
  const [lessonDuration, setLessonDuration] = useState(15);

  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exTitle, setExTitle] = useState('');
  const [exDesc, setExDesc] = useState('');
  const [exInst, setExInst] = useState('');
  const [exType, setExType] = useState('text');
  const [exTime, setExTime] = useState(30);

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assTitle, setAssTitle] = useState('');
  const [assDesc, setAssDesc] = useState('');
  const [assInst, setAssInst] = useState('');
  const [assDeadline, setAssDeadline] = useState('');

  const [showGPForm, setShowGPForm] = useState(false);
  const [gpTitle, setGpTitle] = useState('');
  const [gpDesc, setGpDesc] = useState('');
  const [gpObjective, setGpObjective] = useState('');
  const [gpReqs, setGpReqs] = useState('');
  const [gpTech, setGpTech] = useState('');

  const [showCapstoneForm, setShowCapstoneForm] = useState(false);
  const [capTitle, setCapTitle] = useState('');
  const [capProblem, setCapProblem] = useState('');
  const [capDesc, setCapDesc] = useState('');
  const [capReqs, setCapReqs] = useState('');
  const [capTech, setCapTech] = useState('');
  const [capTeamSize, setCapTeamSize] = useState(1);

  const loadBootcampDetails = async () => {
    try {
      const data = await learnService.getBootcamp(id);
      setBootcampData(data);
      if (data.guidedProject) {
        setGpTitle(data.guidedProject.title || '');
        setGpDesc(data.guidedProject.description || '');
        setGpObjective(data.guidedProject.objective || '');
        setGpReqs(data.guidedProject.requirements?.join(', ') || '');
        setGpTech(data.guidedProject.suggestedTech?.join(', ') || '');
      }
      if (data.capstone) {
        setCapTitle(data.capstone.title || '');
        setCapProblem(data.capstone.problemStatement || '');
        setCapDesc(data.capstone.description || '');
        setCapReqs(data.capstone.requirements?.join(', ') || '');
        setCapTech(data.capstone.suggestedTech?.join(', ') || '');
        setCapTeamSize(data.capstone.teamSize || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadBootcampDetails();
    }
  }, [id]);

  const handleDeleteBootcamp = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete this bootcamp? This will permanently delete all weekly lessons, assignments, exercises, projects, and student enrollments. This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await learnService.deleteBootcamp(id);
      toast.success('🗑️ Bootcamp deleted successfully!');
      navigate('/learn/mentor');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete bootcamp');
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await learnService.createLesson({
        bootcampId: id,
        week: activeWeek,
        title: lessonTitle,
        description: lessonDesc,
        content: lessonContent,
        videoUrl: lessonVideo,
        docUrl: lessonDoc,
        duration: Number(lessonDuration)
      });
      toast.success('🎉 Lesson added successfully!');
      setShowLessonForm(false);
      // reset states
      setLessonTitle('');
      setLessonDesc('');
      setLessonContent('');
      setLessonVideo('');
      setLessonDoc('');
      await loadBootcampDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleAddExercise = async (e) => {
    e.preventDefault();
    try {
      await learnService.createExercise({
        bootcampId: id,
        week: activeWeek,
        title: exTitle,
        description: exDesc,
        instructions: exInst,
        submissionType: exType,
        estimatedTime: Number(exTime)
      });
      toast.success('🎉 Exercise added successfully!');
      setShowExerciseForm(false);
      setExTitle('');
      setExDesc('');
      setExInst('');
      await loadBootcampDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await learnService.createAssignment({
        bootcampId: id,
        week: activeWeek,
        title: assTitle,
        description: assDesc,
        instructions: assInst,
        deadline: assDeadline ? new Date(assDeadline) : undefined
      });
      toast.success('🎉 Assignment added successfully!');
      setShowAssignmentForm(false);
      setAssTitle('');
      setAssDesc('');
      setAssInst('');
      await loadBootcampDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleSaveGuidedProject = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bootcampId: id,
        title: gpTitle,
        description: gpDesc,
        objective: gpObjective,
        requirements: gpReqs.split(',').map(s => s.trim()).filter(Boolean),
        suggestedTech: gpTech.split(',').map(s => s.trim()).filter(Boolean)
      };
      if (bootcampData.guidedProject) {
        await learnService.updateGuidedProject(bootcampData.guidedProject._id, payload);
      } else {
        await learnService.createGuidedProject(payload);
      }
      toast.success('🎉 Guided Project saved!');
      setShowGPForm(false);
      await loadBootcampDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleSaveCapstone = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bootcampId: id,
        title: capTitle,
        problemStatement: capProblem,
        description: capDesc,
        requirements: capReqs.split(',').map(s => s.trim()).filter(Boolean),
        suggestedTech: capTech.split(',').map(s => s.trim()).filter(Boolean),
        teamSize: Number(capTeamSize),
        isTeamBased: Number(capTeamSize) > 1
      };
      if (bootcampData.capstone) {
        await learnService.updateCapstone(bootcampData.capstone._id, payload);
      } else {
        await learnService.createCapstone(payload);
      }
      toast.success('🎉 Capstone Project saved!');
      setShowCapstoneForm(false);
      await loadBootcampDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return <div className="text-center py-24">Loading bootcamp manager...</div>;
  }

  if (error || !bootcampData) {
    return <div className="text-center py-12 bg-red-50 text-error">{error || 'Failed to load bootcamp'}</div>;
  }

  const { bootcamp, lessons = [], exercises = [], assignments = [], guidedProject, capstone } = bootcampData;

  const weekLessons = lessons.filter(l => l.week === activeWeek);
  const weekExercises = exercises.filter(e => e.week === activeWeek);
  const weekAssignment = assignments.find(a => a.week === activeWeek);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex justify-between items-center border-b border-border pb-6">
        <div>
          <Link to="/learn/mentor" className="text-xs font-bold text-textSecondary hover:text-primary">← Mentor Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-textPrimary mt-2">Manage Bootcamp: {bootcamp.title}</h1>
          <p className="text-xs text-textSecondary">Add lessons, practical exercises, and projects week-by-week.</p>
        </div>
        <button
          onClick={handleDeleteBootcamp}
          className="px-4 py-2 bg-red-50 text-error hover:bg-red-100 border border-red-200 text-xs font-bold rounded-xl transition-all shadow-xs"
        >
          🗑️ Delete Bootcamp
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Weeks selection panel */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider px-2">Syllabus Weeks</h3>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0">
            {bootcamp.curriculum?.map((week) => (
              <button
                key={week.week}
                onClick={() => setActiveWeek(week.week)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeWeek === week.week
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-white border border-border text-textPrimary hover:bg-slate-50'
                }`}
              >
                Week {week.week}: {week.title}
              </button>
            ))}
          </div>

          <div className="pt-6 border-t border-border mt-6 space-y-2">
            <button
              onClick={() => setShowGPForm(true)}
              className="w-full py-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl hover:bg-amber-100 transition-all text-center"
            >
              ⚙️ Manage Guided Project
            </button>
            <button
              onClick={() => setShowCapstoneForm(true)}
              className="w-full py-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl hover:bg-rose-100 transition-all text-center"
            >
              🎓 Manage Capstone Evaluation
            </button>
          </div>
        </div>

        {/* Dynamic content creation panel */}
        <div className="lg:col-span-3 space-y-8">
          {/* Week Overview */}
          <div className="bg-slate-50 border border-border p-5 rounded-2xl flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-textPrimary">Week {activeWeek} Materials Editor</h3>
              <p className="text-xs text-textSecondary mt-0.5">Customize the learning resources and submissions required for this week.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLessonForm(true)}
                className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/95 shadow-xs"
              >
                ➕ Add Lesson
              </button>
              <button
                onClick={() => setShowExerciseForm(true)}
                className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 shadow-xs"
              >
                ➕ Add Exercise
              </button>
              {!weekAssignment && (
                <button
                  onClick={() => setShowAssignmentForm(true)}
                  className="px-3.5 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 shadow-xs"
                >
                  ➕ Create Assignment
                </button>
              )}
            </div>
          </div>

          {/* Form overlays */}
          {showLessonForm && (
            <form onSubmit={handleAddLesson} className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-textPrimary">Add Weekly Lesson</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Lesson Title" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="number" placeholder="Est. Duration (mins)" value={lessonDuration} onChange={e => setLessonDuration(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" placeholder="Short description" value={lessonDesc} onChange={e => setLessonDesc(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="url" placeholder="Video Link / URL" value={lessonVideo} onChange={e => setLessonVideo(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="url" placeholder="Docs Link / URL" value={lessonDoc} onChange={e => setLessonDoc(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <textarea rows="4" required placeholder="Markdown content of the lesson..." value={lessonContent} onChange={e => setLessonContent(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowLessonForm(false)} className="px-4 py-2 border text-xs font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg">Save Lesson</button>
              </div>
            </form>
          )}

          {showExerciseForm && (
            <form onSubmit={handleAddExercise} className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-textPrimary">Add Practical Exercise</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Exercise Title" value={exTitle} onChange={e => setExTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <select value={exType} onChange={e => setExType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none">
                  <option value="text">Text Response</option>
                  <option value="link">General URL / Deployment</option>
                  <option value="github">GitHub Repo URL</option>
                </select>
                <input type="text" required placeholder="Short description" value={exDesc} onChange={e => setExDesc(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <textarea rows="4" required placeholder="Step-by-step instructions for the student..." value={exInst} onChange={e => setExInst(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowExerciseForm(false)} className="px-4 py-2 border text-xs font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg">Save Exercise</button>
              </div>
            </form>
          )}

          {showAssignmentForm && (
            <form onSubmit={handleAddAssignment} className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-textPrimary">Create Homework Assignment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Assignment Title" value={assTitle} onChange={e => setAssTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="date" placeholder="Deadline" value={assDeadline} onChange={e => setAssDeadline(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" required placeholder="Overview / Description" value={assDesc} onChange={e => setAssDesc(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <textarea rows="4" placeholder="Detailed instructions, requirements, evaluation metrics..." value={assInst} onChange={e => setAssInst(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAssignmentForm(false)} className="px-4 py-2 border text-xs font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg">Save Assignment</button>
              </div>
            </form>
          )}

          {showGPForm && (
            <form onSubmit={handleSaveGuidedProject} className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-textPrimary">Manage Guided Project</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Project Title" value={gpTitle} onChange={e => setGpTitle(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" required placeholder="Objective" value={gpObjective} onChange={e => setGpObjective(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" placeholder="Required Skills (Comma separated)" value={gpReqs} onChange={e => setGpReqs(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" placeholder="Suggested Tech (Comma separated)" value={gpTech} onChange={e => setGpTech(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <textarea rows="4" required placeholder="Detailed guide specifications..." value={gpDesc} onChange={e => setGpDesc(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowGPForm(false)} className="px-4 py-2 border text-xs font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg">Save Project</button>
              </div>
            </form>
          )}

          {showCapstoneForm && (
            <form onSubmit={handleSaveCapstone} className="bg-white border border-border p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-textPrimary">Manage Capstone Evaluation</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Capstone Title" value={capTitle} onChange={e => setCapTitle(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="number" required placeholder="Optimal Team Size" min="1" value={capTeamSize} onChange={e => setCapTeamSize(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" required placeholder="Problem Statement" value={capProblem} onChange={e => setCapProblem(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" placeholder="Required Skills (Comma separated)" value={capReqs} onChange={e => setCapReqs(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <input type="text" placeholder="Suggested Tech (Comma separated)" value={capTech} onChange={e => setCapTech(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none" />
                <textarea rows="4" required placeholder="Objectives, deliverables summary..." value={capDesc} onChange={e => setCapDesc(e.target.value)} className="w-full sm:col-span-2 px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm focus:outline-none resize-none"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowCapstoneForm(false)} className="px-4 py-2 border text-xs font-bold rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg">Save Capstone</button>
              </div>
            </form>
          )}

          {/* Week Items Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Week {activeWeek} Active Items</h3>
            
            {/* Lessons */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-textSecondary uppercase">Lessons</h4>
              {weekLessons.length === 0 ? <p className="text-xs text-textSecondary italic bg-white p-3 border rounded-xl">No lessons added.</p> : (
                <div className="grid grid-cols-1 gap-2">
                  {weekLessons.map(l => (
                    <div key={l._id} className="p-3 border border-border bg-white rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-textPrimary">{l.title}</p>
                        <p className="text-textSecondary mt-0.5">{l.description}</p>
                      </div>
                      <span className="text-[10px] text-textSecondary font-semibold">⏱️ {l.duration} mins</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Exercises */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-textSecondary uppercase">Exercises</h4>
              {weekExercises.length === 0 ? <p className="text-xs text-textSecondary italic bg-white p-3 border rounded-xl">No exercises added.</p> : (
                <div className="grid grid-cols-1 gap-2">
                  {weekExercises.map(e => (
                    <div key={e._id} className="p-3 border border-border bg-white rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-textPrimary">{e.title}</p>
                        <p className="text-textSecondary mt-0.5">{e.description}</p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{e.submissionType}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assignment */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-textSecondary uppercase">Assignment</h4>
              {!weekAssignment ? <p className="text-xs text-textSecondary italic bg-white p-3 border rounded-xl">No assignment added.</p> : (
                <div className="p-4 border border-border bg-white rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-textPrimary">{weekAssignment.title}</p>
                    <p className="text-textSecondary mt-0.5">{weekAssignment.description}</p>
                  </div>
                  {weekAssignment.deadline && <span className="text-[10px] text-textSecondary">Due: {new Date(weekAssignment.deadline).toLocaleDateString()}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBootcamp;
