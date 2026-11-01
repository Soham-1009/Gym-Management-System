import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { Users, CalendarCheck, Dumbbell, ArrowRight, Flame, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';

// Deterministic gradient per athlete so avatars are colourful but stable between renders.
const avatarGradients = [
  'from-indigo-500 to-violet-500',
  'from-sky-400 to-blue-500',
  'from-amber-400 to-orange-500',
  'from-violet-500 to-fuchsia-500',
  'from-rose-500 to-pink-500',
];
const gradientFor = (name = '') =>
  avatarGradients[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % avatarGradients.length];

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTrainerData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await dashboardService.getTrainerStats();
      if (res.success) setData(res.data);
      else setError(true);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainerData();
  }, []);

  if (loading) return <Loader message="Loading Coach HQ..." />;

  // Previously a bare red line of text with no way to recover.
  if (error || !data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto mt-10 animate-fade-up">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-600/15 dark:ring-rose-400/20 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Couldn't load coach metrics</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
          Check your connection or confirm your trainer profile is set up, then try again.
        </p>
        <Button icon={RefreshCw} onClick={fetchTrainerData}>
          Retry
        </Button>
      </div>
    );
  }

  const roster = data.assignedMembers || [];
  const firstName = user?.name?.split(' ')[0] || 'Coach';

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden animate-fade-up">
        <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-rose-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Ready to coach, <span className="text-gradient-brand">{firstName}</span>?
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Athlete performance, active workout assignments, and today's attendance at a glance.
              </p>
            </div>
          </div>
          <Link
            to="/trainer/attendance"
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all"
          >
            <CalendarCheck className="w-4 h-4" /> Mark Attendance
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Athletes"
          value={data.totalAssignedMembers ?? roster.length}
          subtitle="Athletes under your mentorship"
          icon={Users}
          color="cyan"
        />
        <StatCard
          title="Trained Today"
          value={data.todayAttendedMembers ?? 0}
          subtitle="Athletes checked in today"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Active Workout Plans"
          value={data.activeWorkoutPlansCount ?? 0}
          subtitle="Custom routines published"
          icon={Dumbbell}
          color="amber"
        />
      </div>

      {/* Assigned Members Grid */}
      <section className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
            Your Athlete Roster
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-300 tabular-nums">
              {roster.length}
            </span>
          </h2>
          <Link
            to="/trainer/members"
            className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 transition-colors group"
          >
            Manage All <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {roster.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No athletes assigned yet"
            description="Once an admin assigns members to you, they'll appear here with their plan and status."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roster.map((m) => (
              <div
                key={m._id}
                className="p-3.5 rounded-xl bg-white/70 dark:bg-white/[0.02] ring-1 ring-zinc-200/80 dark:ring-white/[0.06] hover:ring-indigo-500/30 hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradientFor(m.user?.name)} text-white font-semibold flex items-center justify-center text-xs shadow-sm flex-shrink-0`}
                  >
                    {m.user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{m.user?.name || 'Unknown athlete'}</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{m.membershipPlan?.name || 'General Access'}</p>
                  </div>
                </div>
                <Badge variant={m.status}>{m.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default TrainerDashboard;
