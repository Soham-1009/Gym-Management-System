import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CreditCard,
  CalendarCheck,
  Dumbbell,
  LineChart,
  BarChart3,
  Bell,
  Settings,
  Shield,
  LogOut,
  Sparkles,
  Award,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Trainers', path: '/admin/trainers', icon: UserCheck },
    { name: 'Membership Plans', path: '/admin/plans', icon: Award },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Payments & Billing', path: '/admin/payments', icon: CreditCard },
    { name: 'Workout Plans', path: '/admin/workouts', icon: Dumbbell },
    { name: 'Progress Tracking', path: '/admin/progress', icon: LineChart },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const trainerNav = [
    { name: 'Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Members', path: '/trainer/members', icon: Users },
    { name: 'Workout Plans', path: '/trainer/workouts', icon: Dumbbell },
    { name: 'Progress Tracking', path: '/trainer/progress', icon: LineChart },
    { name: 'Attendance Logs', path: '/trainer/attendance', icon: CalendarCheck },
  ];

  const memberNav = [
    { name: 'My Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/member/attendance', icon: CalendarCheck },
    { name: 'My Workout Plan', path: '/member/workout', icon: Dumbbell },
    { name: 'My Progress & BMI', path: '/member/progress', icon: LineChart },
    { name: 'Payment History', path: '/member/payments', icon: CreditCard },
  ];

  let currentNav = [];
  if (user?.role === 'admin') currentNav = adminNav;
  else if (user?.role === 'trainer') currentNav = trainerNav;
  else if (user?.role === 'member') currentNav = memberNav;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-zinc-200/70 dark:border-white/[0.06] bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-2xl flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl md:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5" aria-label="Main navigation">
          <div className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            {user?.role} Portal
          </div>

          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-50 to-violet-50/40 dark:from-indigo-500/[0.14] dark:to-transparent text-indigo-700 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-white/[0.04]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    <span
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-gradient-to-b from-indigo-500 to-violet-500 transition-all duration-300 ${
                        isActive ? 'h-6 opacity-100' : 'h-0 opacity-0'
                      }`}
                    />
                    <span
                      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30'
                          : 'text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 group-hover:bg-white dark:group-hover:bg-white/[0.06]'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                    </span>
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom footer badge & sign out */}
        <div className="p-3 border-t border-zinc-200/80 dark:border-white/[0.06]">
          <div className="relative overflow-hidden rounded-xl p-3 mb-2 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <div className="pointer-events-none absolute -right-6 -top-6 w-20 h-20 rounded-full bg-white/15 blur-xl" />
            <div className="relative flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-[11px] leading-tight">
                <p className="font-semibold">TitanPulse v1.0</p>
                <p className="text-white/75">Enterprise Edition</p>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
