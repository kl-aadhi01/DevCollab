import React, { useEffect } from 'react';
import { useGamification } from '../context/GamificationContext';
import ProfileRankBadge from '../components/gamification/ProfileRankBadge';
import Avatar from '../components/common/Avatar';

const Leaderboard = () => {
  const { leaderboard, fetchLeaderboard, loadingLeaderboard } = useGamification();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white border border-border px-6 py-4 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-textPrimary">Leaderboard Rankings</h2>
        <p className="text-xs text-textSecondary mt-0.5">Top contributors in the DevCollab developer community.</p>
      </div>

      {loadingLeaderboard ? (
        <div className="text-center text-xs text-textSecondary py-8">Loading rankings...</div>
      ) : (
        <div className="bg-white border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 px-6 py-3 border-b border-border bg-slate-50 text-[10px] font-bold text-textSecondary uppercase tracking-wider">
            <span className="col-span-2 text-center">Rank</span>
            <span className="col-span-6">Developer</span>
            <span className="col-span-2 text-center">Badge</span>
            <span className="col-span-2 text-right">Points</span>
          </div>

          <div className="divide-y divide-border">
            {leaderboard.map((user, idx) => (
              <div key={user._id || user.id} className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors">
                <span className="col-span-2 text-center text-sm font-black text-textPrimary">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                </span>

                <div className="col-span-6 flex items-center gap-3">
                  <Avatar user={user} size="sm" />
                  <div>
                    <h4 className="text-xs font-bold text-textPrimary">{user.name}</h4>
                    <p className="text-[10px] text-textSecondary font-semibold font-medium">@{user.username}</p>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <ProfileRankBadge rank={user.rank} />
                </div>

                <span className="col-span-2 text-right text-xs font-bold text-primary font-bold">
                  {user.points} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
