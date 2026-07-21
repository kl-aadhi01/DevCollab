import React, { useState } from 'react';
import Avatar from '../common/Avatar';

const DeveloperProfilePublic = ({ developer, onClose }) => {
  const [activeTab, setActiveTab] = useState('about');

  if (!developer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-full">
        
        <div className="p-6 md:p-8 border-b border-border bg-slate-50 relative">
          <button onClick={onClose} className="absolute right-6 top-6 text-textSecondary hover:text-textPrimary font-bold text-xl">&times;</button>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar user={developer} size="xl" />
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-xl font-bold text-textPrimary">{developer.name}</h2>
              <p className="text-xs text-textSecondary font-semibold">@{developer.username}</p>
              <p className="text-sm font-semibold text-textSecondary">{developer.title || 'Developer'}</p>
              <p className="text-xs text-textSecondary">{developer.location || 'Location unspecified'}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-border px-6 md:px-8 overflow-x-auto bg-white">
          <nav className="flex space-x-6 pb-px">
            {['about', 'skills', 'experience', 'education', 'portfolio', 'badges'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 pt-3 px-1 border-b-2 font-bold text-xs capitalize transition-all whitespace-nowrap focus:outline-none ${tab === activeTab ? 'border-primary text-primary' : 'border-transparent text-textSecondary hover:text-textPrimary'}`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto flex-grow max-h-[300px]">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <p className="text-xs text-textSecondary leading-relaxed whitespace-pre-line">
                {developer.bio || "No bio added yet."}
              </p>
              
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="p-3 bg-slate-50 border border-border rounded-xl">
                  <p className="text-[10px] text-textSecondary font-semibold">Rank & level</p>
                  <p className="text-xs font-bold text-textPrimary">Level {developer.level} ({developer.rank})</p>
                </div>
                <div className="p-3 bg-slate-50 border border-border rounded-xl">
                  <p className="text-[10px] text-textSecondary font-semibold">Availability</p>
                  <p className="text-xs font-bold text-textPrimary capitalize">{developer.availabilityStatus}</p>
                </div>
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl relative group cursor-pointer">
                  <p className="text-[10px] text-violet-700 font-semibold">Reliability Score</p>
                  <p className="text-xs font-extrabold text-violet-900">⚡ {developer.reliabilityScore?.score || 0}%</p>
                  <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-30 space-y-1">
                    <p className="font-bold text-violet-300 border-b border-slate-700 pb-1 mb-1">Reliability Breakdown</p>
                    <div className="flex justify-between"><span>GitHub Activity (40%):</span> <span className="font-bold">{developer.reliabilityScore?.githubActivityScore || 0}%</span></div>
                    <div className="flex justify-between"><span>Completion Rate (35%):</span> <span className="font-bold">{developer.reliabilityScore?.projectCompletionRate || 0}%</span></div>
                    <div className="flex justify-between"><span>Peer Rating (25%):</span> <span className="font-bold">{developer.reliabilityScore?.peerRatingAvg || 5}/5</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="flex flex-wrap gap-2">
              {developer.skills?.length === 0 ? (
                <p className="text-xs text-textSecondary italic">No skills listed.</p>
              ) : (
                developer.skills?.map((s) => (
                  <span key={s.name} className="px-3 py-1 bg-hoverColor border border-primary/10 rounded-full text-xs font-semibold text-primary">
                    {s.name} ({s.level})
                  </span>
                ))
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-4">
              {developer.experience?.length === 0 ? (
                <p className="text-xs text-textSecondary italic">No experience added.</p>
              ) : (
                developer.experience?.map((exp) => (
                  <div key={exp._id} className="border-l-2 border-slate-100 pl-4 py-1">
                    <h4 className="text-sm font-bold text-textPrimary">{exp.position}</h4>
                    <p className="text-xs text-textSecondary font-semibold">{exp.company}</p>
                    <p className="text-[10px] text-textSecondary">
                      {new Date(exp.startDate).getFullYear()} -{' '}
                      {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : 'N/A'}
                    </p>
                    {exp.description && <p className="text-xs text-textSecondary mt-1 leading-relaxed">{exp.description}</p>}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4">
              {developer.education?.length === 0 ? (
                <p className="text-xs text-textSecondary italic">No education details added.</p>
              ) : (
                developer.education?.map((edu) => (
                  <div key={edu._id} className="border-l-2 border-slate-100 pl-4 py-1">
                    <h4 className="text-sm font-bold text-textPrimary">{edu.degree}</h4>
                    <p className="text-xs text-textSecondary font-semibold">{edu.institution} {edu.field ? `- ${edu.field}` : ''}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {developer.portfolio?.length === 0 ? (
                <p className="col-span-2 text-xs text-textSecondary italic">No projects showcase.</p>
              ) : (
                developer.portfolio?.map((proj) => (
                  <div key={proj._id} className="border border-border p-4 bg-slate-50 rounded-xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-textPrimary">{proj.title}</h4>
                      <p className="text-[10px] text-textSecondary mt-1.5 leading-relaxed">{proj.description}</p>
                    </div>
                    <div className="flex gap-2 mt-3 text-[10px] font-semibold text-primary">
                      {proj.url && <a href={proj.url} target="_blank" rel="noreferrer" className="hover:underline">Demo</a>}
                      {proj.githubRepo && <a href={proj.githubRepo} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="flex flex-wrap gap-3">
              {developer.badges?.length === 0 ? (
                <p className="text-xs text-textSecondary italic">No badges earned yet.</p>
              ) : (
                developer.badges?.map((badge) => (
                  <div key={badge.name} className="flex items-center gap-2 border border-border p-2 rounded-xl bg-slate-50">
                    <span className="text-lg">{badge.icon}</span>
                    <div>
                      <p className="text-[10px] font-bold text-textPrimary">{badge.name}</p>
                      <p className="text-[9px] text-textSecondary">{badge.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfilePublic;
