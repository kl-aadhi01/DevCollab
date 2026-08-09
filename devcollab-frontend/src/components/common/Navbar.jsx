import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../notifications/NotificationBell';
import Avatar from './Avatar';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 bg-white border-b border-border z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">DevCollab</span>
              </Link>
            </div>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-transparent text-textSecondary hover:border-primary hover:text-textPrimary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/learn"
                  className="border-transparent text-textSecondary hover:border-primary hover:text-textPrimary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all"
                >
                  Learn
                </Link>
                <Link
                  to="/projects"
                  className="border-transparent text-textSecondary hover:border-primary hover:text-textPrimary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all"
                >
                  Projects
                </Link>
                <Link
                  to="/marketplace"
                  className="border-transparent text-textSecondary hover:border-primary hover:text-textPrimary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all"
                >
                  Marketplace
                </Link>
                <Link
                  to="/leaderboard"
                  className="border-transparent text-textSecondary hover:border-primary hover:text-textPrimary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-semibold transition-all"
                >
                  Leaderboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-3 text-xs bg-slate-50 px-3 py-1.5 rounded-full border border-border shadow-sm">
                  <span className="font-bold text-textSecondary">LVL {user.level}</span>
                  <span className="h-3 w-px bg-border"></span>
                  <span className="font-extrabold text-primary">{user.points} XP</span>
                  <span className="h-3 w-px bg-border"></span>
                  <span className="font-semibold text-secondary">{user.rank}</span>
                </div>

                <NotificationBell />

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
                  >
                    <Avatar user={user} size="sm" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white shadow-lg z-50 overflow-hidden py-1">
                      <div className="px-4 py-2 border-b border-border bg-slate-50">
                        <p className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Signed in as</p>
                        <p className="text-sm font-bold text-textPrimary truncate">{user.username}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-textSecondary hover:bg-hoverColor hover:text-primary transition-colors"
                      >
                        Your Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-textSecondary hover:text-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 shadow-sm transition-all hover:scale-[1.02]"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
