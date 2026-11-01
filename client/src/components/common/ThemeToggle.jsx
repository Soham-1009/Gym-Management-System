import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`inline-flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
        isDark
          ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-amber-300 border border-white/[0.08] shadow-sm'
          : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 border border-zinc-200/80 shadow-sm'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12 text-zinc-600" />
      )}
      {showLabel && (
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 select-none">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
