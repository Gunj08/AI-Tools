import React from 'react';

const Avatar = ({ user, className = 'w-8 h-8 text-xs', onClick }) => {
  const username = user?.username || 'User';
  const avatar = user?.avatar;

  // Treat missing, empty, or default Dicebear URLs as default (no avatar uploaded)
  const isDefaultAvatar = !avatar || avatar.includes('dicebear.com') || avatar.trim() === '';

  if (isDefaultAvatar) {
    const firstLetter = username.charAt(0).toUpperCase();

    // Hashed premium gradient color options matching AIFinder's aesthetic
    const gradients = [
      'from-purple-600/30 to-pink-500/30 border-purple-500/20 text-purple-300',
      'from-blue-600/30 to-cyan-500/30 border-blue-500/20 text-blue-300',
      'from-emerald-600/30 to-teal-500/30 border-emerald-500/20 text-emerald-300',
      'from-amber-600/30 to-orange-500/30 border-amber-500/20 text-amber-300',
      'from-indigo-600/30 to-purple-500/30 border-indigo-500/20 text-indigo-300',
      'from-rose-600/30 to-pink-500/30 border-rose-500/20 text-rose-300',
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const gradientClass = gradients[Math.abs(hash) % gradients.length];

    return (
      <div 
        onClick={onClick}
        className={`${className} rounded-full bg-gradient-to-tr ${gradientClass} border flex items-center justify-center font-bold font-display uppercase tracking-wider select-none transition-all duration-300`}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={avatar}
      alt={username}
      onClick={onClick}
      className={`${className} rounded-full object-cover border border-white/10 transition-all duration-300`}
    />
  );
};

export default Avatar;
