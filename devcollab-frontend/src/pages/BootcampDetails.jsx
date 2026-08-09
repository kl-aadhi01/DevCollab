import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBootcamp } from '../hooks/useBootcamp';
import { useAssignment } from '../hooks/useAssignment';
import { useTransition } from '../hooks/useTransition';
import CurriculumView from '../components/learn/CurriculumView';
import ProgressTracker from '../components/learn/ProgressTracker';
import MentorProfile from '../components/learn/MentorProfile';
import StudentList from '../components/learn/StudentList';
import CapstoneProject from '../components/learn/CapstoneProject';
import TeamFormation from '../components/learn/TeamFormation';
import AssignmentCard from '../components/learn/AssignmentCard';
import { toast } from 'react-hot-toast';

const BootcampDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { bootcamp, loading, error, enroll, updateProgress } = useBootcamp(id);
  const { assignments, fetchAssignments } = useAssignment();
  const { buildTeam, loading: buildingTeam } = useTransition();

  const [activeTab, setActiveTab] = useState('curriculum'); // 'curriculum', 'assignments', 'students'
  const [graduates, setGraduates] = useState([]);

  // Fetch assignments if user is enrolled
  useEffect(() => {
    if (bootcamp) {
      fetchAssignments(bootcamp._id);
      
      // Calculate completed graduates for team creation
      const grads = bootcamp.enrolledStudents?.filter(
        s => s.status === 'completed' || s.progress >= 100
      ) || [];
      setGraduates(grads);
    }
  }, [bootcamp]);

  const handleEnroll = async () => {
    try {
      await enroll(bootcamp._id);
      toast.success('🎉 Successfully enrolled! Let\'s start week 1!');
    } catch (err) {
      toast.error(err || 'Failed to enroll');
    }
  };

  const handleCompleteWeek = async (weekNum) => {
    try {
      await updateProgress(bootcamp._id, weekNum);
      toast.success(`⚡ Week ${weekNum} marked complete! +25 XP awarded!`);
    } catch (err) {
      toast.error(err || 'Failed to update progress');
    }
  };

  const handleFormCapstoneTeam = async (teamData) => {
    try {
      const res = await buildTeam({
        bootcampId: bootcamp._id,
        ...teamData
      });
      toast.success('🎉 Team formed successfully! Capstone project is live in BUILD track.');
      navigate(`/projects/${res.project._id}`);
    } catch (err) {
      toast.error(err || 'Failed to form capstone team');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading course details...</p>
      </div>
    );
  }

  if (error || !bootcamp) {
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

  // Check roles
  const isMentor = bootcamp.mentorId?._id === user?._id || bootcamp.mentorId === user?._id;
  
  const studentEnrollmentRecord = bootcamp.enrolledStudents?.find(
    s => s.studentId?._id === user?._id || s.studentId === user?._id
  );
  const isEnrolled = !!studentEnrollmentRecord;
  const studentProgress = studentEnrollmentRecord?.progress || 0;
  const completedWeeks = studentEnrollmentRecord?.completedWeeks || [];

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
          </div>

          {/* Action Tabs */}
          <div className="border-b border-border pb-2 flex gap-4">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`pb-2.5 font-bold text-sm border-b-2 transition-all ${
                activeTab === 'curriculum'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-textSecondary hover:text-textPrimary'
              }`}
            >
              📖 Syllabus
            </button>
            
            {isEnrolled && (
              <button
                onClick={() => setActiveTab('assignments')}
                className={`pb-2.5 font-bold text-sm border-b-2 transition-all ${
                  activeTab === 'assignments'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                }`}
              >
                📝 Assignments
              </button>
            )}

            {isMentor && (
              <>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`pb-2.5 font-bold text-sm border-b-2 transition-all ${
                    activeTab === 'students'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-textSecondary hover:text-textPrimary'
                  }`}
                >
                  🧑‍🎓 Enrolled Students ({bootcamp.enrolledStudents?.length || 0})
                </button>
              </>
            )}
          </div>

          {/* Tab Render */}
          {activeTab === 'curriculum' && (
            <div>
              <CurriculumView
                curriculum={bootcamp.curriculum || []}
                completedWeeks={completedWeeks}
                onCompleteWeek={handleCompleteWeek}
                isEnrolled={isEnrolled}
                mentorView={isMentor}
              />
            </div>
          )}

          {activeTab === 'assignments' && isEnrolled && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-textPrimary mb-4">Course Homework</h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-textSecondary bg-slate-50 border p-6 text-center rounded-2xl">
                  No assignments posted for this bootcamp.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {assignments.map(ass => {
                    const studentSub = ass.submissions?.find(
                      s => s.studentId === user?._id || s.studentId?._id === user?._id
                    );
                    return (
                      <AssignmentCard
                        key={ass._id}
                        assignment={ass}
                        submission={studentSub}
                        isEnrolled={isEnrolled}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && isMentor && (
            <div className="space-y-6">
              <StudentList students={bootcamp.enrolledStudents || []} />
              
              {graduates.length > 0 && (
                <TeamFormation
                  graduatesCount={graduates.length}
                  onFormTeam={handleFormCapstoneTeam}
                  loading={buildingTeam}
                />
              )}
            </div>
          )}
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
            <ProgressTracker
              progress={studentProgress}
              completedWeeksCount={completedWeeks.length}
              totalWeeks={bootcamp.curriculum?.length || 0}
              isEligibleForTransition={studentProgress >= 100}
            />
          )}

          <MentorProfile mentor={bootcamp.mentorId} />
          
          <CapstoneProject capstone={bootcamp.capstoneProject} />
        </div>
      </div>
    </div>
  );
};

export default BootcampDetails;
