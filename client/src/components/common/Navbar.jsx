import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, User, Dumbbell, ChevronDown } from 'lucide-react';
import Badge from './Badge';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const menuRef = useRef(null);

  // Close the profile menu on outside click / Escape (previously it only closed on mouse-leave,
  // so on touch devices it stayed open).
  useEffect(() => {
    if (!showDropdown) return undefined;
    const handlePointer = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowDropdown(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [showDropdown]);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/70 dark:border-white/[0.06] bg-white/75 dark:bg-[#09090b]/75 px-4 md:px-6 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-200">
      {/* Left: Mobile hamburger & branding */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
          className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-glow-primary transition-transform duration-300 group-hover:rotate-[-8deg] group-hover:scale-105">
            <Dumbbell className="w-4 h-4" />
          </div>
          <div className="leading-tight">
            <span className="block font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white">
              TITAN<span className="text-gradient-brand">PULSE</span>
            </span>
            <span className="hidden sm:block text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
              Gym Management
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Theme Toggle, Role indicator & user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <div className="hidden sm:block">
          <Badge variant={user?.role}>{user?.role}</Badge>
        </div>

        <div className="h-6 w-px bg-zinc-200 dark:bg-white/[0.08] hidden sm:block" />

        {/* Profile menu dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowDropdown((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={showDropdown}
            className="flex items-center gap-2.5 p-1 pr-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.04] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900 shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                {initial}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">{user?.email}</p>
            </div>
            <ChevronDown
              className={`hidden md:block w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
            />
          </button>

          {showDropdown && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl bg-white/95 dark:bg-[#121215]/95 backdrop-blur-xl border border-zinc-200/80 dark:border-white/[0.08] shadow-lift p-1.5 z-50 animate-scale-in"
            >
              <div className="flex items-center gap-3 px-3 py-2.5 border-b border-zinc-100 dark:border-white/[0.06] mb-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {initial}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{user?.name}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/profile"
                role="menuitem"
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.05] rounded-lg transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User className="w-4 h-4 text-zinc-400" />
                My Profile
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors text-left mt-0.5"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
