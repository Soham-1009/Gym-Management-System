import React from 'react';

// Each variant has light-mode (700) and dark-mode (300) text so labels stay readable in both themes.
const variants = {
  active: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',
  present: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',
  paid: 'bg-indigo-50 text-indigo-700 ring-indigo-600/15 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20',
  expired: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  failed: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  inactive: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15 dark:bg-zinc-500/10 dark:text-zinc-300 dark:ring-zinc-400/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  admin: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20',
  trainer: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  member: 'bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-400/20',
  beginner: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20',
  intermediate: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20',
  advanced: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20',
  default: 'bg-zinc-100 text-zinc-700 ring-zinc-500/15 dark:bg-white/[0.06] dark:text-zinc-300 dark:ring-white/10',
};

const dots = {
  active: 'bg-indigo-500', present: 'bg-indigo-500', paid: 'bg-indigo-500',
  expired: 'bg-rose-500', failed: 'bg-rose-500', inactive: 'bg-zinc-400',
  pending: 'bg-amber-500', admin: 'bg-violet-500', trainer: 'bg-sky-500',
  member: 'bg-blue-500', beginner: 'bg-sky-500', intermediate: 'bg-amber-500',
  advanced: 'bg-rose-500', default: 'bg-zinc-400',
};

// Statuses that represent a "live" state get a soft pulsing dot.
const pulsing = new Set(['active', 'present', 'pending']);

const Badge = ({ variant = 'default', children, className = '' }) => {
  const key = String(variant).toLowerCase();
  const style = variants[key] || variants.default;
  const dot = dots[key] || dots.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide capitalize ring-1 ring-inset whitespace-nowrap ${style} ${className}`}
    >
      <span className="relative flex w-1.5 h-1.5">
        {pulsing.has(key) && (
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping ${dot}`} />
        )}
        <span className={`relative inline-flex w-1.5 h-1.5 rounded-full ${dot}`} />
      </span>
      {children || variant}
    </span>
  );
};

export default Badge;
