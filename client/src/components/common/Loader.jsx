import React from 'react';

export const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-9 h-9 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in" role="status" aria-live="polite">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-indigo-500/25 blur-md animate-pulse" />
        <div
          className={`relative ${sizeMap[size] || sizeMap.md} rounded-full border-indigo-100 dark:border-white/10 border-t-indigo-600 dark:border-t-indigo-400 animate-spin`}
        />
      </div>
      {message && (
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 tracking-wide">{message}</p>
      )}
    </div>
  );
};

/** Shimmering placeholder block for skeleton layouts. */
export const Skeleton = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-xl bg-zinc-200/70 dark:bg-white/[0.05] ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.06] to-transparent" />
  </div>
);

export default Loader;
