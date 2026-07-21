import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import OverviewTab from './OverviewTab';
import SkillsManager from './SkillsManager';
import ExperienceSection from './ExperienceSection';
import EducationSection from './EducationSection';
import PortfolioSection from './PortfolioSection';
import ProfileSettings from './ProfileSettings';
import Avatar from '../common/Avatar';

const ProfileLayout = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  if (!user) return null;

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'skills', name: 'Skills' },
    { id: 'experience', name: 'Experience' },
    { id: 'education', name: 'Education' },
    { id: 'portfolio', name: 'Portfolio' },
    { id: 'settings', name: 'Settings' }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-border rounded-3xl p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar user={user} size="xxl" />

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-2xl font-bold text-textPrimary">{user.name}</h2>
              <span className="text-sm text-textSecondary font-semibold">@{user.username}</span>
              {user.isAvailableForHire && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-center">
                  🟢 Available for Hire
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-textSecondary">{user.title || 'Developer'}</p>
            <p className="text-xs text-textSecondary">{user.location || 'Location unspecified'}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2 text-xs">
              <span className="bg-slate-100 px-3 py-1 rounded-lg font-bold text-textSecondary">LVL {user.level}</span>
              <span className="bg-slate-100 px-3 py-1 rounded-lg font-bold text-textSecondary">{user.points} XP</span>
              <span className="bg-indigo-50 text-primary font-bold px-3 py-1 rounded-lg">{user.rank}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border mb-8 overflow-x-auto">
        <nav className="flex space-x-8 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-bold text-sm transition-all whitespace-nowrap focus:outline-none ${tab.id === activeTab ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-slate-300'}`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'overview' && <OverviewTab user={user} />}
        {activeTab === 'skills' && <SkillsManager />}
        {activeTab === 'experience' && <ExperienceSection />}
        {activeTab === 'education' && <EducationSection />}
        {activeTab === 'portfolio' && <PortfolioSection />}
        {activeTab === 'settings' && <ProfileSettings />}
      </div>
    </div>
  );
};

export default ProfileLayout;
