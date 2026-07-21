import React from 'react';

const ProfileRankBadge = ({ rank }) => {
  const rankIcons = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '👑'
  };

  const rankColors = {
    Bronze: 'text-amber-700 bg-amber-50 border-amber-200',
    Silver: 'text-slate-700 bg-slate-50 border-slate-200',
    Gold: 'text-amber-500 bg-amber-50 border-amber-300',
    Platinum: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    Diamond: 'text-purple-700 bg-purple-50 border-purple-200'
  };

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${rankColors[rank] || rankColors.Bronze}`}>
      <span>{rankIcons[rank] || '🥉'}</span>
      <span>{rank}</span>
    </span>
  );
};

export default ProfileRankBadge;
