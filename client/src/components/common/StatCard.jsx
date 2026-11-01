import React from 'react';

// Gradient icon chips; light mode uses darker accent text for contrast.
const colorMap = {
  indigo: {
    chip: 'from-indigo-500 to-violet-500 shadow-indigo-500/30',
    glow: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    bar: 'from-indigo-500 to-violet-500',
  },
  amber: {
    chip: 'from-amber-400 to-orange-500 shadow-amber-500/30',
    glow: 'bg-amber-500/10 dark:bg-amber-500/15',
    bar: 'from-amber-400 to-orange-500',
  },
  cyan: {
    chip: 'from-sky-400 to-blue-500 shadow-sky-500/30',
    glow: 'bg-sky-500/10 dark:bg-sky-500/15',
    bar: 'from-sky-400 to-blue-500',
  },
  purple: {
    chip: 'from-violet-500 to-fuchsia-500 shadow-violet-500/30',
    glow: 'bg-violet-500/10 dark:bg-violet-500/15',
    bar: 'from-violet-500 to-fuchsia-500',
  },
  red: {
    chip: 'from-rose-500 to-pink-500 shadow-rose-500/30',
    glow: 'bg-rose-500/10 dark:bg-rose-500/15',
    bar: 'from-rose-500 to-pink-500',
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) => {
  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className="glass-card rounded-2xl p-5 lg:p-6 relative overflow-hidden group animate-fade-up">
      {/* Decorative corner glow */}
      <div
        className={`pointer-events-none absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl ${scheme.glow} transition-transform duration-500 group-hover:scale-125`}
      />
      {/* Accent bar revealed on hover */}
      <div
        className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${scheme.bar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-1.5 min-w-0">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
          <h3 className="text-2xl lg:text-[28px] leading-tight font-bold tracking-tight text-zinc-900 dark:text-white tabular-nums truncate">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">{subtitle}</p>
          )}
          {trend && (
            <div className="pt-1">
              <span
                className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ${
                  trend.positive
                    ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 ring-indigo-600/15 dark:ring-indigo-400/20'
                    : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 ring-rose-600/15 dark:ring-rose-400/20'
                }`}
              >
                {trend.positive ? '+' : ''}
                {trend.value}
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${scheme.chip} shadow-lg text-white flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
