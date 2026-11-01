import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import {
  Award,
  CalendarCheck,
  Dumbbell,
  Activity,
  UserCheck,
  Clock,
  Flame,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatDate, getBMICategory } from '../../utils/formatters';

const MemberDashboard = () => {
  const { user: authUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberDashboard = async () => {
      try {
        const res = await dashboardService.getMemberStats();
        if (res.success) setData(res.data);
      } catch (err) {
        console.error('Member dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemberDashboard();
  }, []);

  if (loading) return <Loader message="Loading Athlete Portal..." />;
  if (!data || !data.member) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-zinc-200 dark:border-white/[0.08] text-center max-w-lg mx-auto mt-10">
        <Activity className="w-10 h-10 text-amber-600 dark:text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Member Profile Unavailable</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
          Unable to access member dashboard data. Please verify your membership enrollment.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition-all"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  const { member, daysRemaining = 0, activeWorkoutPlan, latestProgress } = data;
  const attendanceStats = data.attendanceStats || { percentage: 0, presentCount: 0 };
  const memberName = member.user?.name || authUser?.name || 'Athlete';

  // Banner previously claimed "subscription is active" even for expired/frozen members.
  const isActive = member.status === 'active' && daysRemaining > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden animate-fade-up">
        <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-sky-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 w-56 h-56 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ring-inset ${
                isActive
                  ? 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 ring-indigo-600/15 dark:ring-indigo-400/20'
                  : 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 ring-amber-600/20 dark:ring-amber-400/20'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'}`} />
              {isActive ? 'Active Gym Member' : `Membership ${member.status || 'inactive'}`}
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mt-3">
              Welcome back, <span className="text-gradient-brand">{memberName}</span>!
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
              {isActive
                ? "Your subscription is active. Keep your momentum going and hit today's training milestones!"
                : 'Your subscription needs attention. Please contact the front desk to renew and keep training.'}
            </p>
          </div>

          <div className="text-left md:text-right rounded-2xl px-5 py-4 bg-white/70 dark:bg-white/[0.03] ring-1 ring-zinc-200/80 dark:ring-white/[0.06]">
            <p className="text-[10px] uppercase font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">Subscription Status</p>
            <div className="flex items-baseline md:justify-end gap-2 mt-1">
              <span className={`text-3xl font-extrabold tracking-tight tabular-nums ${isActive ? 'text-gradient-brand' : 'text-amber-600 dark:text-amber-400'}`}>
                {Math.max(daysRemaining, 0)}
              </span>
              <span className="text-xs text-zinc-600 dark:text-zinc-300">Days Remaining</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Expires: {formatDate(member.expiryDate)}</p>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Current Plan"
          value={member.membershipPlan?.name || 'Standard Tier'}
          subtitle={`Enrolled: ${formatDate(member.startDate)}`}
          icon={Award}
          color="amber"
        />
        <StatCard
          title="Attendance (30d)"
          value={`${attendanceStats.percentage}%`}
          subtitle={`${attendanceStats.presentCount} sessions logged`}
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Personal Coach"
          value={member.trainer?.user ? member.trainer.user.name : 'Self-Guided'}
          subtitle={member.trainer?.specialization || 'Open Gym Access'}
          icon={UserCheck}
          color="cyan"
        />
        <StatCard
          title="Latest Bodyweight"
          value={latestProgress ? `${latestProgress.weightKg} kg` : '--'}
          subtitle={latestProgress ? `BMI: ${latestProgress.bmi}` : 'No scan on file'}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Two Column: Active Workout & Biometrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Workout Program */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
                  Assigned Training Program
                </h3>
              </div>
              {activeWorkoutPlan && <Badge variant={activeWorkoutPlan.level}>{activeWorkoutPlan.level}</Badge>}
            </div>

            {activeWorkoutPlan ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06]">
                  <h4 className="font-semibold text-zinc-900 dark:text-white text-sm tracking-tight">{activeWorkoutPlan.name}</h4>
                  <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mt-0.5">{activeWorkoutPlan.goal}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{activeWorkoutPlan.notes}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                    Prescribed Movements ({activeWorkoutPlan.exercises?.length || 0})
                  </p>
                  <div className="divide-y divide-zinc-200 dark:divide-white/[0.04] rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.02] text-xs">
                    {activeWorkoutPlan.exercises?.slice(0, 4).map((ex, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between">
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{ex.name}</span>
                        <span className="font-mono text-indigo-500 dark:text-indigo-400 font-medium">
                          {ex.sets} × {ex.reps} ({ex.restSeconds}s)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">
                No active workout routine currently assigned. Request your trainer for a routine.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.06] mt-4">
            <Link
              to="/member/workout"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              View Full Regimen & Exercise Execution <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Biometrics & Body Scan */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
                  Physical Assessment Summary
                </h3>
              </div>
              {latestProgress && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getBMICategory(latestProgress.bmi).bg} ${getBMICategory(latestProgress.bmi).color}`}>
                  {getBMICategory(latestProgress.bmi).label}
                </span>
              )}
            </div>

            {latestProgress ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06]">
                    <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Recorded Weight</p>
                    <p className="text-xl font-extrabold text-zinc-900 dark:text-white mt-1 tracking-tight">{latestProgress.weightKg} kg</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06]">
                    <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">BMI Metric</p>
                    <p className="text-xl font-extrabold text-indigo-500 dark:text-indigo-400 mt-1 tracking-tight">{latestProgress.bmi}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06]">
                  <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400 mb-2">Circumference Metrics (cm)</p>
                  <div className="grid grid-cols-3 gap-2 text-center text-zinc-700 dark:text-zinc-300">
                    <div className="bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] p-2 rounded-lg">
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Chest</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{latestProgress.measurements?.chestCm || '--'}</p>
                    </div>
                    <div className="bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] p-2 rounded-lg">
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Waist</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{latestProgress.measurements?.waistCm || '--'}</p>
                    </div>
                    <div className="bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06] p-2 rounded-lg">
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Arms</p>
                      <p className="font-semibold text-zinc-900 dark:text-white">{latestProgress.measurements?.armsCm || '--'}</p>
                    </div>
                  </div>
                </div>

                {latestProgress.notes && (
                  <p className="text-zinc-500 dark:text-zinc-400 italic font-normal">"{latestProgress.notes}"</p>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-4">No biometric scans recorded yet.</p>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.06] mt-4">
            <Link
              to="/member/progress"
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              Update Self Biometrics & Log Weight <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboard;
