import React from 'react';

const Avatar = ({ user, size = 'md' }) => {
  if (!user) return null;

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-semibold',
    lg: 'h-12 w-12 text-base font-semibold',
    xl: 'h-16 w-16 text-xl font-bold',
    xxl: 'h-24 w-24 text-3xl font-extrabold'
  };

  const name = user.name || user.username || '?';
  const firstLetter = name.charAt(0).toUpperCase();

  // Premium professional color selections matching general style rules
  const colors = [
    'bg-indigo-600 text-white',
    'bg-purple-600 text-white',
    'bg-pink-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-cyan-600 text-white',
    'bg-rose-600 text-white',
    'bg-sky-600 text-white',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colorClass = colors[Math.abs(hash) % colors.length];

  const hasAvatarImg = user.avatar && 
                       user.avatar !== 'default-avatar.png' && 
                       !user.avatar.includes('dicebear.com') && 
                       !user.avatar.includes('default');

  if (hasAvatarImg) {
    return (
      <img
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover border border-border shadow-sm`}
        src={user.avatar}
        alt={name}
        onError={(e) => {
          // If image fails to load, fallback to initial style
          e.target.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full flex items-center justify-center tracking-wider uppercase border border-white shadow-sm select-none ${colorClass}`}>
      {firstLetter}
    </div>
  );
};

export default Avatar;
