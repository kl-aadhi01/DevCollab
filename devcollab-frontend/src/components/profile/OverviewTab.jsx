import React from 'react';

const OverviewTab = ({ user }) => {
  if (!user) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* About Me */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-3">About Me</h3>
          <p className="text-sm text-textSecondary leading-relaxed whitespace-pre-line">
            {user.bio || "No biography added yet."}
          </p>
        </div>

        {/* Skills Section */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {!user.skills || user.skills.length === 0 ? (
              <p className="text-xs text-textSecondary italic">No skills listed yet.</p>
            ) : (
              user.skills.map((s) => (
                <div
                  key={s.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-hoverColor border border-primary/10 text-xs font-semibold text-primary transition-all hover:scale-105"
                >
                  <span>{s.name}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-textSecondary">{s.level}</span>
                  {s.yearsOfExperience > 0 && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span className="text-[10px] text-textSecondary">{s.yearsOfExperience} yr{s.yearsOfExperience > 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Experience Section */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Work Experience</h3>
          {!user.experience || user.experience.length === 0 ? (
            <p className="text-xs text-textSecondary italic">No work experience listed yet.</p>
          ) : (
            <div className="space-y-6">
              {user.experience.map((exp) => (
                <div key={exp._id} className="border-l-2 border-slate-100 pl-4 py-1 relative">
                  <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div>
                    <h4 className="text-sm font-bold text-textPrimary">{exp.position}</h4>
                    <p className="text-xs text-textSecondary font-semibold mt-0.5">{exp.company}</p>
                    <p className="text-[10px] text-textSecondary mt-1">
                      {new Date(exp.startDate).toLocaleDateString([], { month: 'short', year: 'numeric' })} -{' '}
                      {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString([], { month: 'short', year: 'numeric' }) : 'Present'}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-textSecondary mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education Section */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Education</h3>
          {!user.education || user.education.length === 0 ? (
            <p className="text-xs text-textSecondary italic">No education details listed yet.</p>
          ) : (
            <div className="space-y-6">
              {user.education.map((edu) => (
                <div key={edu._id} className="border-l-2 border-slate-100 pl-4 py-1 relative">
                  <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-secondary" />
                  <div>
                    <h4 className="text-sm font-bold text-textPrimary">{edu.degree}</h4>
                    <p className="text-xs text-textSecondary font-semibold mt-0.5">
                      {edu.institution} {edu.field ? `• ${edu.field}` : ''}
                    </p>
                    <p className="text-[10px] text-textSecondary mt-1">
                      {edu.startDate ? new Date(edu.startDate).getFullYear() : 'N/A'} -{' '}
                      {edu.isCurrent ? 'Present' : edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Status, Level & Badges */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Status & Gamification</h3>
          <div className="space-y-4">
            <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              <div>
                <p className="text-xs text-textSecondary font-semibold">Current Level</p>
                <p className="text-base font-bold text-textPrimary">Level {user.level}</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center gap-3">
              <span className="text-3xl">👑</span>
              <div>
                <p className="text-xs text-textSecondary font-semibold">Rank Badge</p>
                <p className="text-base font-bold text-textPrimary">{user.rank}</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-border p-4 rounded-xl flex items-center gap-3">
              <span className="text-3xl">💼</span>
              <div>
                <p className="text-xs text-textSecondary font-semibold">Availability</p>
                <p className="text-base font-bold text-textPrimary capitalize">
                  {user.availabilityStatus === 'open' ? '🟢 Open to Collab' : user.availabilityStatus === 'busy' ? '🟡 Busy' : '🔴 Not Looking'}
                </p>
              </div>
            </div>
          </div>

          <h4 className="text-xs font-bold text-textSecondary uppercase tracking-wider mt-6 mb-3">Earned Badges ({user.badges?.length || 0})</h4>
          <div className="flex flex-wrap gap-2">
            {user.badges?.length === 0 ? (
              <p className="text-xs text-textSecondary italic">No badges earned yet.</p>
            ) : (
              user.badges?.map((badge) => (
                <div
                  key={badge.name}
                  className="group relative flex items-center gap-2 bg-slate-50 border border-border px-3 py-2 rounded-xl cursor-default hover:border-primary transition-colors w-full"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-textPrimary">{badge.name}</p>
                    <p className="text-[10px] text-textSecondary">{badge.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Connected Accounts */}
        <div className="bg-white p-6 rounded-2xl border border-border">
          <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Connected Accounts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-xl">
              <span className="text-xs font-semibold text-textSecondary">GitHub</span>
              {user.socialLinks?.github ? (
                <a
                  href={user.socialLinks.github.startsWith('http') ? user.socialLinks.github : `https://github.com/${user.socialLinks.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View Profile
                </a>
              ) : (
                <span className="text-xs text-textSecondary italic">Not linked</span>
              )}
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-xl">
              <span className="text-xs font-semibold text-textSecondary">LinkedIn</span>
              {user.socialLinks?.linkedin ? (
                <a
                  href={user.socialLinks.linkedin.startsWith('http') ? user.socialLinks.linkedin : `https://linkedin.com/in/${user.socialLinks.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  View Profile
                </a>
              ) : (
                <span className="text-xs text-textSecondary italic">Not linked</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
