import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLearn } from '../hooks/useLearn';
import LessonProgress from '../components/learn/LessonProgress';
import ExerciseCard from '../components/learn/ExerciseCard';
import GuidedProjectCard from '../components/learn/GuidedProjectCard';
import CapstoneCard from '../components/learn/CapstoneCard';
import SkillProgress from '../components/learn/SkillProgress';

const LearningDashboard = () => {
  const { id } = useParams();
  const { bootcampData, loading, error, fetchBootcampDetails, skillsProgress } = useLearn(id);
  const [activeWeek, setActiveWeek] = useState(1);

  useEffect(() => {
    if (id) {
      fetchBootcampDetails(id);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading learning workspace...</p>
      </div>
    );
  }

  if (error || !bootcampData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-error p-4 rounded-xl border border-red-200 text-sm font-semibold mb-4">
          {error || 'Failed to load dashboard.'}
        </div>
        <Link to="/learn/my-learning" className="text-primary font-bold hover:underline">
          ← Back to My Learning
        </Link>
      </div>
    );
  }

  const { bootcamp, enrollment, lessons = [], exercises = [], assignments = [], guidedProject, capstone } = bootcampData;

  if (!enrollment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center space-y-4">
        <h3 className="text-lg font-bold text-textPrimary">Access Denied</h3>
        <p className="text-sm text-textSecondary">You must enroll in this bootcamp to access the learning workspace.</p>
        <Link to={`/learn/bootcamp/${bootcamp._id}`} className="inline-block px-5 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/95">
          View Bootcamp Details
        </Link>
      </div>
    );
  }

  const completedLessonIds = enrollment.completedLessons?.map(l => l.toString() || l._id?.toString()) || [];
  const completedExerciseIds = enrollment.completedExercises?.map(e => e.toString() || e._id?.toString()) || [];
  const completedAssignmentIds = enrollment.completedAssignments?.map(a => a.toString() || a._id?.toString()) || [];

  // Filter items for current active week
  const weekLessons = lessons.filter(l => l.week === activeWeek);
  const weekExercises = exercises.filter(e => e.week === activeWeek);
  const weekAssignment = assignments.find(a => a.week === activeWeek);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <div>
          <Link to="/learn/my-learning" className="text-xs font-bold text-textSecondary hover:text-primary mb-2 block">
            ← Back to My Learning
          </Link>
          <h1 className="text-2xl font-extrabold text-textPrimary">{bootcamp.title}</h1>
          <p className="text-xs text-textSecondary mt-0.5">Workspace & Curriculum Progress Tracking</p>
        </div>

        <div className="w-full md:w-64 bg-slate-50 border border-border p-4 rounded-xl">
          <div className="flex justify-between items-center text-xs font-bold text-textSecondary mb-1.5">
            <span>Overall Progress</span>
            <span className="text-primary">{enrollment.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${enrollment.progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Weeks Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider px-2">Course Modules</h3>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 pb-2 lg:pb-0">
            {bootcamp.curriculum?.map((week) => (
              <button
                key={week.week}
                onClick={() => setActiveWeek(week.week)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeWeek === week.week
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white border border-border text-textPrimary hover:bg-slate-50'
                }`}
              >
                Week {week.week}: {week.title}
              </button>
            ))}
          </div>

          <div className="pt-6 hidden lg:block">
            <SkillProgress skills={skillsProgress} />
          </div>
        </div>

        {/* Weekly Content Space */}
        <div className="lg:col-span-3 space-y-6">
          {/* Week Overview */}
          {bootcamp.curriculum?.find(w => w.week === activeWeek) && (
            <div className="bg-slate-50 border border-border p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-textPrimary">
                Week {activeWeek} Description & Topics
              </h3>
              <p className="text-xs text-textSecondary mt-1">
                {bootcamp.curriculum.find(w => w.week === activeWeek).description}
              </p>
              
              {bootcamp.curriculum.find(w => w.week === activeWeek).topics?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {bootcamp.curriculum.find(w => w.week === activeWeek).topics.map((t, idx) => (
                    <span key={idx} className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Lessons */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <span>📖</span> Lessons & Resources
            </h3>
            {weekLessons.length === 0 ? (
              <p className="text-xs text-textSecondary italic bg-white p-4 border rounded-xl">No lessons listed for this week.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {weekLessons.map(lesson => {
                  const isDone = completedLessonIds.includes(lesson._id.toString());
                  return (
                    <div key={lesson._id} className={`p-4 border bg-white rounded-xl shadow-sm flex justify-between items-center ${isDone ? 'border-emerald-200' : 'border-border'}`}>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold uppercase">Lesson</span>
                          {isDone && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">Read</span>}
                        </div>
                        <h4 className="text-sm font-bold text-textPrimary">{lesson.title}</h4>
                        <p className="text-xs text-textSecondary mt-0.5 line-clamp-1">{lesson.description}</p>
                      </div>
                      <Link 
                        to={`/learn/lessons/${lesson._id}`}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isDone 
                            ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' 
                            : 'bg-primary text-white border-primary hover:bg-primary/90'
                        }`}
                      >
                        {isDone ? 'Review' : 'Read'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Exercises */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <span>🛠️</span> Practical Exercises
            </h3>
            {weekExercises.length === 0 ? (
              <p className="text-xs text-textSecondary italic bg-white p-4 border rounded-xl">No exercises listed for this week.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {weekExercises.map(ex => (
                  <ExerciseCard 
                    key={ex._id} 
                    exercise={ex} 
                    isCompleted={completedExerciseIds.includes(ex._id.toString())} 
                  />
                ))}
              </div>
            )}
          </div>

          {/* Assignment */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
              <span>📝</span> Weekly Assignment
            </h3>
            {!weekAssignment ? (
              <p className="text-xs text-textSecondary italic bg-white p-4 border rounded-xl">No assignment listed for this week.</p>
            ) : (
              <div className="p-5 border border-border bg-white rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase border border-indigo-100">Assignment</span>
                    {completedAssignmentIds.includes(weekAssignment._id.toString()) && (
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full uppercase border border-emerald-100">Graded & Complete</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-textPrimary">{weekAssignment.title}</h4>
                  <p className="text-xs text-textSecondary line-clamp-1 mt-1">{weekAssignment.description}</p>
                </div>
                <Link
                  to={`/learn/assignment/${weekAssignment._id}`}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-all text-center shrink-0 w-full sm:w-auto"
                >
                  {completedAssignmentIds.includes(weekAssignment._id.toString()) ? 'View Grade & Submission' : 'Submit Assignment'}
                </Link>
              </div>
            )}
          </div>

          {/* Guided Project & Capstones at last week */}
          {activeWeek === bootcamp.curriculum?.length && (
            <div className="pt-6 border-t border-border space-y-6">
              {guidedProject && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Guided Milestones Project</h3>
                  <GuidedProjectCard 
                    guidedProject={guidedProject} 
                    submission={enrollment.completedGuidedProject ? { status: 'completed' } : null} 
                  />
                </div>
              )}
              {capstone && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">Final Graduation Capstone</h3>
                  <CapstoneCard 
                    capstone={capstone} 
                    submission={enrollment.completedCapstone ? { status: 'completed' } : null} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard;
