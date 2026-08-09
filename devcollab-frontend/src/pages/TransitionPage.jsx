import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransition } from '../hooks/useTransition';
import { toast } from 'react-hot-toast';

const TransitionPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { status, fetchStatus, executeTransition } = useTransition();
  const [transitioning, setTransitioning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTransition = async () => {
    setTransitioning(true);
    try {
      const res = await executeTransition();
      setUser(res.user);
      toast.success('🚀 You successfully transitioned to the BUILD track! +50 XP and Ready to Build badge awarded!');
      setSuccess(true);
    } catch (err) {
      toast.error(err || 'Failed to transition');
    } finally {
      setTransitioning(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <span className="text-7xl animate-bounce inline-block">🚀</span>
        <h1 className="text-3xl font-extrabold text-textPrimary">Welcome to the BUILD Track!</h1>
        <p className="text-sm text-textSecondary leading-relaxed">
          You are officially a Developer on DevCollab. You can now build team projects, invite collaborators, chat in real-time, create task boards, and join the developer marketplace!
        </p>
        <button
          onClick={() => navigate('/learn/recommended-projects')}
          className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl hover:opacity-95 shadow-md transition-all hover:scale-[1.02]"
        >
          Explore Recommended Projects 📂
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm text-center space-y-6">
        <span className="text-6xl select-none">🎓</span>
        <h1 className="text-2xl font-extrabold text-textPrimary">Your Graduation & Transition</h1>
        <p className="text-sm text-textSecondary leading-relaxed max-w-lg mx-auto">
          Completing a bootcamp marks the end of your LEARN track journey. You are now prepared to build real-world software on DevCollab.
        </p>

        {/* Transition Checklist */}
        <div className="bg-slate-50 border border-border rounded-2xl p-5 text-left space-y-3 max-w-md mx-auto">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <span>✅</span> Completed Bootcamp Course (100% Progress)
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
            <span>✅</span> Weekly Assignments Checked & Graded
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-800">
            <span>💡</span> Capstone Project Team Eligible
          </div>
        </div>

        <div className="pt-4 max-w-sm mx-auto">
          <button
            onClick={handleTransition}
            disabled={transitioning}
            className="w-full py-4 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/95 shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {transitioning ? 'Processing Transition...' : 'Launch into BUILD Track 🚀'}
          </button>
          <p className="text-[10px] text-textSecondary mt-2">
            This action awards 50 XP, unlocks BUILD privileges, and awards your "Ready to Build" badge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransitionPage;
