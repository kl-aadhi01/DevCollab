import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLearn } from '../hooks/useLearn';
import learnService from '../services/learnService';
import BootcampFilter from '../components/learn/BootcampFilter';
import BootcampCard from '../components/learn/BootcampCard';
import BuildReadyCard from '../components/learn/BuildReadyCard';
import { toast } from 'react-hot-toast';

const Learn = () => {
  const { user, setUser } = useAuth();
  const { bootcamps, loading, error, myLearningList, buildReadiness, fetchExploreBootcamps, fetchStudentDashboard } = useLearn();
  
  const [activeTab, setActiveTab] = useState('explore'); // 'explore', 'learning'
  const [filters, setFilters] = useState({ category: '', level: '', search: '', duration: '' });
  
  // Become a Mentor state
  const [showMentorForm, setShowMentorForm] = useState(false);
  const [mentorBio, setMentorBio] = useState('');
  const [mentorExpertise, setMentorExpertise] = useState('');
  const [mentorTech, setMentorTech] = useState('');
  const [submittingMentor, setSubmittingMentor] = useState(false);

  // Fetch explore bootcamps whenever filters change
  useEffect(() => {
    fetchExploreBootcamps(filters);
  }, [filters]);

  // Fetch user's enrolled bootcamps & transition status
  useEffect(() => {
    if (user) {
      fetchStudentDashboard();
    }
  }, [user]);

  const handleBecomeMentor = async (e) => {
    e.preventDefault();
    if (!mentorBio.trim() || !mentorExpertise.trim()) return;

    setSubmittingMentor(true);
    try {
      const expertiseArray = mentorExpertise.split(',').map(s => s.trim()).filter(Boolean);
      const techArray = mentorTech.split(',').map(s => s.trim()).filter(Boolean);
      await learnService.updateMentorProfile({
        bio: mentorBio,
        expertise: expertiseArray,
        technologies: techArray
      });
      
      // Update local state
      setUser({
        ...user,
        learningTrack: {
          ...user.learningTrack,
          isMentor: true
        }
      });
      toast.success('🎉 Congratulations! You are now registered as a Mentor!');
      setShowMentorForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to register as mentor');
    } finally {
      setSubmittingMentor(false);
    }
  };

  const handleTransition = async () => {
    try {
      await learnService.transitionToBuild();
      toast.success('🚀 You have successfully transitioned to the BUILD track!');
      fetchStudentDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to transition');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="learn-hero bg-gradient-to-r from-primary-light to-white p-8 sm:p-12 rounded-3xl border border-border shadow-sm mb-10 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="max-w-xl">
          <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            DevCollab Learn
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-textPrimary mt-4 leading-tight">
            Learn Skills. Build Projects.<br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Grow Together.</span>
          </h1>
          <p className="text-textSecondary mt-3 text-sm sm:text-base leading-relaxed">
            Beginner friendly, mentor-led programs guiding you week-by-week. Graduate to team projects, collaborate, and accelerate your development career.
          </p>
        </div>
        <div className="flex-shrink-0 text-6xl select-none sm:text-7xl">
          🎓
        </div>
      </div>

      {/* Transition Banner */}
      {buildReadiness?.isReady && (
        <div className="mb-10">
          <BuildReadyCard 
            onTransition={handleTransition} 
            transitionedAt={buildReadiness.transitionedAt} 
          />
        </div>
      )}

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-4 mb-8 gap-4">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'explore'
                ? 'bg-white text-primary shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            🔍 Explore Bootcamps
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'learning'
                ? 'bg-white text-primary shadow-sm'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            📝 My Learning ({myLearningList.length})
          </button>
        </div>

        <div>
          {user?.learningTrack?.isMentor ? (
            <Link
              to="/learn/mentor"
              className="px-5 py-2.5 bg-secondary text-white font-bold text-sm rounded-xl hover:bg-secondary/95 transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>🧠</span> Mentor Workspace
            </Link>
          ) : (
            !showMentorForm && (
              <button
                onClick={() => setShowMentorForm(true)}
                className="px-5 py-2.5 bg-indigo-50 border border-primary/20 text-primary font-bold text-sm rounded-xl hover:bg-primary hover:text-white transition-all flex items-center gap-1.5"
              >
                <span>👨‍🏫</span> Teach Others (Become Mentor)
              </button>
            )
          )}
        </div>
      </div>

      {/* Become Mentor Form overlay */}
      {showMentorForm && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-md mb-8 max-w-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-textPrimary">Setup Your Mentor Profile</h3>
            <button 
              onClick={() => setShowMentorForm(false)}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleBecomeMentor} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                Expertise (Comma separated, e.g. React, Node.js, AWS)
              </label>
              <input
                type="text"
                required
                value={mentorExpertise}
                onChange={(e) => setMentorExpertise(e.target.value)}
                placeholder="React, Node.js, Express, MongoDB"
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                Technologies Taught (Comma separated)
              </label>
              <input
                type="text"
                required
                value={mentorTech}
                onChange={(e) => setMentorTech(e.target.value)}
                placeholder="React, HTML/CSS, Javascript"
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">
                Mentor Bio / Experience Summary
              </label>
              <textarea
                required
                rows="4"
                value={mentorBio}
                onChange={(e) => setMentorBio(e.target.value)}
                placeholder="Tell learners about your experience, teaching style, and career background..."
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              ></textarea>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowMentorForm(false)}
                className="px-4 py-2 border border-border text-xs font-bold rounded-lg text-textSecondary hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingMentor}
                className="px-5 py-2 bg-primary text-white font-bold text-xs rounded-lg hover:bg-primary/95 transition-all"
              >
                {submittingMentor ? 'Registering...' : 'Register Profile & Award 100 XP'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Tab Render */}
      {activeTab === 'explore' && (
        <div>
          <BootcampFilter filters={filters} setFilters={setFilters} />
          {loading ? (
            <div className="text-center py-12">
              <span className="inline-block animate-spin text-3xl">⌛</span>
              <p className="text-sm text-textSecondary mt-2">Loading bootcamps...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-error p-4 rounded-xl border border-red-200 text-sm font-semibold text-center">
              {error}
            </div>
          ) : bootcamps.length === 0 ? (
            <div className="text-center py-12 text-sm text-textSecondary">
              No bootcamps match your filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bootcamps.map(bc => {
                const enrolled = myLearningList.find(e => e.enrollment.bootcampId._id === bc._id);
                return (
                  <BootcampCard 
                    key={bc._id} 
                    bootcamp={bc} 
                    isEnrolled={!!enrolled} 
                    progress={enrolled ? enrolled.enrollment.progress : 0} 
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'learning' && (
        <div>
          <h2 className="text-xl font-bold text-textPrimary mb-6">My Enrolled Bootcamps</h2>
          {myLearningList.length === 0 ? (
            <div className="text-center py-12 bg-white border border-border rounded-2xl">
              <span className="text-4xl">📚</span>
              <h3 className="text-lg font-bold text-textPrimary mt-4">Not enrolled in any bootcamps</h3>
              <p className="text-sm text-textSecondary mt-1 mb-6">Browse our explore track and start learning now.</p>
              <button
                onClick={() => setActiveTab('explore')}
                className="px-6 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/95 transition-all shadow-sm"
              >
                Explore Bootcamps
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myLearningList.map(({ enrollment, nextAction, nextActionLink }) => (
                <div key={enrollment._id} className="relative">
                  <BootcampCard 
                    bootcamp={enrollment.bootcampId} 
                    isEnrolled={true} 
                    progress={enrollment.progress} 
                  />
                  <div className="mt-3 bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-[10px] uppercase font-bold text-indigo-700">What to do next</p>
                      <p className="text-xs font-semibold text-textPrimary line-clamp-1">{nextAction}</p>
                    </div>
                    <Link 
                      to={nextActionLink}
                      className="px-3 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-all shrink-0"
                    >
                      Resume
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Learn;
