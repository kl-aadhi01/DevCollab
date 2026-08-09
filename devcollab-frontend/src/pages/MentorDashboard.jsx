import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import mentorService from '../services/mentorService';

const MentorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [bootcamps, setBootcamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardStats = await mentorService.getDashboard();
        setStats(dashboardStats);

        const studentsList = await mentorService.getStudents();
        setStudents(studentsList);

        const bootcampsList = await mentorService.getMentorBootcamps('');
        setBootcamps(bootcampsList);
      } catch (err) {
        console.error("Failed to fetch mentor dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-24">
        <span className="inline-block animate-spin text-4xl">⌛</span>
        <p className="text-sm text-textSecondary mt-2">Loading mentor dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-textPrimary">Mentor Workspace</h1>
          <p className="text-sm text-textSecondary mt-1">Manage your curriculums, review submissions, and form graduate teams.</p>
        </div>
        <Link
          to="/learn/create-bootcamp"
          className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <span>➕</span> Create Bootcamp
        </Link>
      </div>

      {/* Stats Board */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Active Bootcamps</p>
            <p className="text-3xl font-extrabold text-textPrimary mt-2">{stats.totalBootcamps || 0}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Total Enrolled Learners</p>
            <p className="text-3xl font-extrabold text-primary mt-2">{stats.totalStudents || 0}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Pending Submissions</p>
            <p className="text-3xl font-extrabold text-warning mt-2">{stats.pendingSubmissions || 0}</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <p className="text-xs text-textSecondary font-bold uppercase tracking-wider">Average Progress</p>
            <p className="text-3xl font-extrabold text-success mt-2">{stats.averageProgress || 0}%</p>
          </div>
        </div>
      )}

      {/* Columns: Course list & Student logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bootcamp List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-textPrimary mb-4">My Bootcamps</h3>
            {bootcamps.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-textSecondary">You haven't created any bootcamps yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {bootcamps.map(bc => (
                  <div key={bc._id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-bold text-textPrimary text-sm sm:text-base hover:text-primary">
                        <Link to={`/learn/bootcamp/${bc._id}`}>{bc.title}</Link>
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-textSecondary mt-1 font-medium">
                        <span className="uppercase text-primary font-bold">{bc.category}</span>
                        <span>•</span>
                        <span>{bc.enrolledStudents?.length || 0} enrolled</span>
                        <span>•</span>
                        <span>{bc.duration}</span>
                      </div>
                    </div>
                    <Link
                      to={`/learn/bootcamp/${bc._id}`}
                      className="px-3.5 py-1.5 border border-border text-xs font-bold rounded-lg text-textSecondary hover:bg-slate-50 hover:text-primary transition-all"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Students list */}
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-textPrimary mb-4">Student Activity</h3>
            {students.length === 0 ? (
              <p className="text-sm text-textSecondary text-center py-4">No active students.</p>
            ) : (
              <div className="space-y-4">
                {students.slice(0, 5).map(student => (
                  <div key={student.studentId} className="flex gap-3 items-start text-xs border-b border-slate-50 pb-3 last:border-b-0 last:pb-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 uppercase">
                      {student.name?.charAt(0)}
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-textPrimary truncate leading-none">{student.name}</p>
                      <p className="text-[10px] text-textSecondary mt-0.5">@{student.username}</p>
                      <div className="mt-1.5 space-y-1">
                        {student.bootcamps?.map(bc => (
                          <div key={bc.bootcampId} className="flex justify-between items-center text-[10px]">
                            <span className="text-textSecondary truncate max-w-[120px]">{bc.bootcampTitle}</span>
                            <span className="font-bold text-primary">{bc.progress}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
