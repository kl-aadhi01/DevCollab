import React from 'react';

const MentorProfile = ({ mentor }) => {
  if (!mentor) return null;

  const { name, username, avatar, learningTrack } = mentor;
  const mentorProfile = learningTrack?.mentorProfile || {};

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-textPrimary mb-4">Meet Your Mentor</h3>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-lg text-primary uppercase">
          {name?.charAt(0) || 'M'}
        </div>
        <div>
          <h4 className="font-bold text-textPrimary leading-none">{name}</h4>
          <p className="text-xs text-textSecondary mt-0.5">@{username}</p>
        </div>
      </div>

      {mentorProfile.bio && (
        <p className="text-sm text-textSecondary leading-relaxed mb-4 italic">
          "{mentorProfile.bio}"
        </p>
      )}

      {/* Expertise */}
      {mentorProfile.expertise && mentorProfile.expertise.length > 0 && (
        <div className="mb-4">
          <h5 className="text-[10px] font-bold text-textSecondary uppercase tracking-wider mb-1.5">Expertise</h5>
          <div className="flex flex-wrap gap-1">
            {mentorProfile.expertise.map((exp, idx) => (
              <span key={idx} className="bg-indigo-50 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {exp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-center">
        <div>
          <p className="text-xs text-textSecondary uppercase tracking-wider">Rating</p>
          <p className="text-base font-extrabold text-amber-500 mt-0.5">
            ⭐ {mentorProfile.rating || '5.0'}
          </p>
        </div>
        <div>
          <p className="text-xs text-textSecondary uppercase tracking-wider">Students</p>
          <p className="text-base font-extrabold text-primary mt-0.5">
            {mentorProfile.totalStudents || 0}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MentorProfile;
