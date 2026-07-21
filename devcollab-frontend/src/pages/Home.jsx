import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Globe from '../components/landing/Globe';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="bg-background min-h-[calc(100vh-64px)] flex items-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left Column: Hero Text */}
        <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl z-10">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-primary-light text-primary border border-primary/20">
            {user ? `👋 Welcome back, @${user.username}!` : '🚀 Welcome to DevCollab v2'}
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-textPrimary leading-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-2">
            Build Project Teams.
            <br />
            Collaborate in Real-Time.
          </h1>
          <p className="text-base sm:text-lg text-textSecondary leading-relaxed max-w-xl mx-auto lg:mx-0">
            The ultimate platform for developers to form teams, track roadmaps, manage task boards, and chat in real-time. Gain XP and level up your rank as you build!
          </p>

          <div className="flex justify-center lg:justify-start gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3.5 border border-border hover:border-slate-300 bg-white text-textPrimary font-bold rounded-2xl text-sm hover:shadow-sm transition-all"
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Globe Component */}
        <div className="flex-1 w-full max-w-[450px] lg:max-w-[550px] aspect-square relative flex items-center justify-center select-none z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-secondary/5 rounded-full filter blur-3xl opacity-60 animate-pulse pointer-events-none" />
          <div className="w-full h-full">
            <Globe />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
