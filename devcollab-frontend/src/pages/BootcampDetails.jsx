import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLearn } from '../hooks/useLearn';
import CurriculumView from '../components/learn/CurriculumView';
import MentorProfile from '../components/learn/MentorProfile';
import CapstoneProject from '../components/learn/CapstoneProject';
import { toast } from 'react-hot-toast';

const BootcampDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { bootcampData, loading, error, enrollInBootcamp, fetchBootcampDetails } = useLearn(id);

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading course details...</p>
      </div>
    );
  }

  if (error || !bootcampData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-error p-4 rounded-xl border border-red-200 text-sm font-semibold mb-4">
          {error || 'Bootcamp details could not be retrieved.'}
        </div>
        <Link to="/learn" className="text-primary font-bold hover:underline">
          ← Back to Learn Page
        </Link>
      </div>
    );
  }

  const { bootcamp, enrollment, lessons, exercises, assignments, guidedProject, capstone } = bootcampData;

  const isMentor = bootcamp.mentorId?._id === user?._id || bootcamp.mentorId === user?._id;
  const isEnrolled = !!enrollment;
  const studentProgress = enrollment?.progress || 0;

  const handleEnroll = async () => {
    try {
      await enrollInBootcamp(bootcamp._id);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/learn" className="text-xs font-bold text-textSecondary hover:text-primary transition-colors flex items-center gap-1 mb-6">
        <span>←</span> Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Panel */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 items-center mb-4">
              <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                {bootcamp.category}
              </span>
              <span className="bg-indigo-50 border border-indigo-200 text-primary px-3 py-0.5 rounded-full text-xs font-medium uppercase">
                {bootcamp.level}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary leading-tight">
              {bootcamp.title}
            </h1>
            <p className="text-textSecondary mt-3 text-sm sm:text-base leading-relaxed">
              {bootcamp.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-4 rounded-2xl bg-slate-50 border border-border text-center">
              <div>
                <p className="text-xs text-textSecondary uppercase tracking-wider">Duration</p>
                <p className="text-sm font-bold text-textPrimary mt-0.5">{bootcamp.duration}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary uppercase tracking-wider">Weeks</p>
                <p className="text-sm font-bold text-textPrimary mt-0.5">{bootcamp.curriculum?.length || 0}</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary uppercase tracking-wider">Limit</p>
                <p className="text-sm font-bold text-textPrimary mt-0.5">{bootcamp.maxStudents} students</p>
              </div>
              <div>
                <p className="text-xs text-textSecondary uppercase tracking-wider">Class Size</p>
                <p className="text-sm font-bold text-textPrimary mt-0.5">{bootcamp.enrolledStudents?.length || 0} enrolled</p>
              </div>
            </div>

            {bootcamp.prerequisites?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Prerequisites</h4>
                <div className="flex flex-wrap gap-1.5">
                  {bootcamp.prerequisites.map((prereq, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {bootcamp.learningOutcomes?.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Learning Outcomes</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-textSecondary">
                  {bootcamp.learningOutcomes.map((outcome, idx) => (
                    <li key={idx}>{outcome}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Curriculum Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-textPrimary">Bootcamp Curriculum Overview</h3>
            <div className="space-y-4">
              {bootcamp.curriculum?.map((week) => {
                const weekLessons = lessons?.filter(l => l.week === week.week) || [];
                const weekExercises = exercises?.filter(e => e.week === week.week) || [];
                const weekAssignment = assignments?.find(a => a.week === week.week);

                return (
                  <div key={week.week} className="p-5 border border-border rounded-2xl bg-white space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-textPrimary">Week {week.week}: {week.title}</h4>
                      {week.estimatedTime && (
                        <span className="text-[10px] text-textSecondary font-semibold">⏱️ {week.estimatedTime}</span>
                      )}
                    </div>
                    <p className="text-xs text-textSecondary">{week.description}</p>
                    
                    <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-textSecondary font-medium">
                      <span>📖 {weekLessons.length} Lessons</span>
                      <span>🛠️ {weekExercises.length} Exercises</span>
                      <span>📝 {weekAssignment ? '1 Assignment' : 'No Assignment'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {!isMentor && !isEnrolled && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-textPrimary mb-2">Enrollment Open</h3>
              <p className="text-xs text-textSecondary mb-4">
                Unlock curriculum details, complete homework, receive mentor grade reviews, and graduate to Capstone projects.
              </p>
              <button
                onClick={handleEnroll}
                className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95"
              >
                Enroll Now (+50 XP)
              </button>
            </div>
          )}

          {isEnrolled && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-textPrimary">You are Enrolled</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-textSecondary">
                  <span>Current Progress</span>
                  <span className="text-primary">{studentProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${studentProgress}%` }}></div>
                </div>
              </div>
              <Link
                to={`/learn/bootcamps/${bootcamp._id}/dashboard`}
                className="block w-full py-3 bg-primary hover:bg-primary/95 text-white text-center font-bold text-sm rounded-xl transition-all shadow-md"
              >
                Go to learning workspace
              </Link>
            </div>
          )}

          {isMentor && (
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-2">
              <h3 className="text-lg font-bold text-textPrimary">You are the Mentor</h3>
              <Link
                to={`/learn/bootcamps/${bootcamp._id}/manage`}
                className="block w-full py-3 bg-primary text-white text-center font-bold text-sm rounded-xl transition-all shadow-md"
              >
                ⚙️ Manage Curriculum
              </Link>
              <Link
                to="/learn/mentor"
                className="block w-full py-3 bg-secondary text-white text-center font-bold text-sm rounded-xl transition-all shadow-md mt-2"
              >
                Go to Mentor Dashboard
              </Link>
            </div>
          )}

          <MentorProfile mentor={bootcamp.mentorId} />
          
          <CapstoneProject capstone={capstone} />
        </div>
      </div>
    </div>
  );
};

export default BootcampDetails;
