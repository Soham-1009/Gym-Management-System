import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Dumbbell, Shield, User, ArrowRight, Lock, Mail, Phone, AlertCircle, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

const dashboardFor = (role) => {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'trainer') return '/trainer/dashboard';
  return '/member/dashboard';
};

// Single source of truth for input styling (the previous inline classes contained conflicting
// `dark:bg-white` + `dark:bg-zinc-900/60` utilities, which could render white fields in dark mode).
const fieldClass =
  'w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm shadow-sm dark:shadow-none transition-all outline-none';

const labelClass = 'block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5';

const FieldIcon = ({ icon: Icon }) => (
  <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 transition-colors peer-focus:text-indigo-500" />
);

const demoAccounts = [
  { role: 'admin', label: 'Admin', email: 'admin@gym.com', password: 'admin123', icon: Shield, tint: 'text-indigo-600 dark:text-indigo-400' },
  { role: 'trainer', label: 'Trainer', email: 'trainer.john@gym.com', password: 'trainer123', icon: Dumbbell, tint: 'text-sky-600 dark:text-sky-400' },
  { role: 'member', label: 'Member', email: 'member.mike@gym.com', password: 'member123', icon: User, tint: 'text-violet-600 dark:text-violet-400' },
];

const LoginPage = () => {
  const { login, register, user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'member',
  });
  const [loading, setLoading] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState(null);
  const [error, setError] = useState('');

  // Already signed in? Skip the login screen.
  if (!authLoading && token && user && !loading) {
    return <Navigate to={dashboardFor(user.role)} replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const switchMode = (registering) => {
    setIsRegistering(registering);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const signedIn = isRegistering
        ? await register(formData)
        : await login({ email: formData.email, password: formData.password });
      // Previously registration succeeded but never navigated, leaving users on the login form.
      navigate(dashboardFor(signedIn?.role), { replace: true });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      const detail = apiErrors && typeof apiErrors === 'object' ? Object.values(apiErrors)[0] : null;
      setError(detail || err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async ({ email, password, role }) => {
    setActiveRoleLoggingIn(role);
    setLoading(true);
    setError('');
    try {
      const signedIn = await login({ email, password });
      navigate(dashboardFor(signedIn?.role || role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
      setActiveRoleLoggingIn(null);
    }
  };

  return (
    <div className="w-full animate-fade-up">
      <div className="relative bg-white/85 dark:bg-[#101014]/85 backdrop-blur-2xl rounded-3xl border border-zinc-200/70 dark:border-white/[0.07] p-6 sm:p-8 shadow-[0_24px_64px_-24px_rgba(79,70,229,0.25)] dark:shadow-2xl overflow-hidden">
        {/* Top gradient hairline */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 ring-1 ring-inset ring-indigo-600/10 dark:ring-indigo-400/20 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-60 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </span>
            TitanPulse v1.0
          </div>
          <ThemeToggle showLabel={true} />
        </div>

        {/* Brand */}
        <div className="text-center mb-7">
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 blur-lg opacity-40" />
            <div className="relative inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg transition-transform duration-300 hover:rotate-[-8deg] hover:scale-105">
              <Dumbbell className="w-5 h-5" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {isRegistering ? (
              'Join TitanPulse and start tracking your progress'
            ) : (
              <>
                Sign in to <span className="font-semibold text-gradient-brand">TitanPulse</span> to continue
              </>
            )}
          </p>
        </div>

        {/* Segmented control */}
        <div className="relative grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900/70 border border-zinc-200/70 dark:border-white/[0.06] rounded-xl mb-6" role="tablist">
          <span
            aria-hidden="true"
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200/70 dark:ring-white/[0.06] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isRegistering ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'
            }`}
            style={{ left: 4 }}
          />
          {[
            { label: 'Sign In', value: false },
            { label: 'Register', value: true },
          ].map((tab) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isRegistering === tab.value}
              onClick={() => switchMode(tab.value)}
              className={`relative z-10 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isRegistering === tab.value
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error notification */}
        {error && (
          <div role="alert" className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-2.5 text-xs font-medium text-rose-700 dark:text-rose-300 animate-scale-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
          {isRegistering && (
            <div className="animate-fade-in">
              <label htmlFor="login-name" className={labelClass}>Full Name</label>
              <div className="relative">
                <input
                  id="login-name"
                  type="text"
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Alex Mercer"
                  value={formData.name}
                  onChange={handleChange}
                  className={`peer ${fieldClass}`}
                />
                <FieldIcon icon={User} />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="login-email" className={labelClass}>Email Address</label>
            <div className="relative">
              <input
                id="login-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className={`peer ${fieldClass}`}
              />
              <FieldIcon icon={Mail} />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className={labelClass}>Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`peer ${fieldClass} pr-10`}
              />
              <FieldIcon icon={Lock} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div className="animate-fade-in">
              <label htmlFor="login-phone" className={labelClass}>
                Phone Number <span className="text-zinc-400 dark:text-zinc-500 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <input
                  id="login-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+1 (555) 019-2834"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`peer ${fieldClass}`}
                />
                <FieldIcon icon={Phone} />
              </div>
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="group w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 bg-[length:200%_100%] bg-left hover:bg-right text-white font-semibold text-sm transition-all duration-500 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:-translate-y-px active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading && !activeRoleLoggingIn ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegistering ? 'Create Account' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo role switcher */}
        <div className="mt-7">
          <div className="relative flex items-center justify-center mb-3">
            <div className="absolute inset-x-0 h-px bg-zinc-200 dark:bg-white/[0.06]" />
            <span className="relative px-3 bg-white dark:bg-[#101014] text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              or try a demo account
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              const isActive = activeRoleLoggingIn === acc.role;
              return (
                <button
                  key={acc.role}
                  id={`demo-login-${acc.role}`}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin(acc)}
                  className={`group py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all duration-200 flex flex-col items-center justify-center gap-1.5 disabled:cursor-not-allowed ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/15 border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300'
                      : 'bg-white dark:bg-zinc-900/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 border-zinc-200 dark:border-white/[0.06] hover:border-indigo-200 dark:hover:border-indigo-500/30 text-zinc-700 dark:text-zinc-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none'
                  }`}
                >
                  {isActive ? (
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                  ) : (
                    <Icon className={`w-4 h-4 ${acc.tint} transition-transform duration-200 group-hover:scale-110`} />
                  )}
                  <span>{acc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-center gap-1.5">
          <Lock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
          <span>Secured with encrypted JWT authentication</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
