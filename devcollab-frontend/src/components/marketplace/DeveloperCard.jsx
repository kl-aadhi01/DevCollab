import React from 'react';
import Avatar from '../common/Avatar';

const DeveloperCard = ({ developer, onViewProfile, onInvite }) => {
  return (
    <div className="bg-white border border-border rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-all shadow-sm">
      <div>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar user={developer} size="lg" />
            <div>
              <h4 className="text-sm font-bold text-textPrimary leading-tight">{developer.name}</h4>
              <p className="text-xs text-textSecondary font-semibold">@{developer.username}</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            {developer.isAvailableForHire && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                For Hire
              </span>
            )}
            <span className="text-[10px] text-primary font-bold">{developer.points} XP</span>
            {developer.reliabilityScore?.score !== undefined && (
              <div className="relative group cursor-pointer">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-violet-100 text-violet-800 border border-violet-200">
                  ⚡ {developer.reliabilityScore.score}% Reliability
                </span>
                <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-48 p-2.5 bg-slate-900 text-white text-[10px] rounded-xl shadow-xl z-20 space-y-1">
                  <p className="font-bold text-violet-300 border-b border-slate-700 pb-1 mb-1">Reliability Breakdown</p>
                  <div className="flex justify-between"><span>GitHub Activity (40%):</span> <span className="font-bold">{developer.reliabilityScore.githubActivityScore || 0}%</span></div>
                  <div className="flex justify-between"><span>Completion Rate (35%):</span> <span className="font-bold">{developer.reliabilityScore.projectCompletionRate || 0}%</span></div>
                  <div className="flex justify-between"><span>Peer Rating (25%):</span> <span className="font-bold">{developer.reliabilityScore.peerRatingAvg || 5}/5</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs font-semibold text-textSecondary mb-2">{developer.title || 'Developer'}</p>
        {developer.bio && (
          <p className="text-[11px] text-textSecondary leading-relaxed line-clamp-2 mb-4">
            {developer.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-1 mb-6">
          {developer.skills?.slice(0, 4).map((s) => (
            <span key={s.name} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[9px] font-bold text-textSecondary">
              {s.name}
            </span>
          ))}
          {developer.skills?.length > 4 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold text-textSecondary">
              +{developer.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <button
          onClick={() => onViewProfile(developer)}
          className="text-center py-2 border border-border hover:border-slate-300 font-semibold text-[11px] rounded-lg text-textSecondary hover:text-textPrimary transition-all"
        >
          View Profile
        </button>
        <button
          onClick={() => onInvite(developer)}
          className="text-center py-2 bg-primary hover:bg-primary-dark text-white font-bold text-[11px] rounded-lg shadow-sm transition-all"
        >
          Invite
        </button>
      </div>
    </div>
  );
};

export default DeveloperCard;
