import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import {
  Users,
  UserCheck,
  CreditCard,
  CalendarCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { CHART_COLORS, getChartTooltipProps } from '../../utils/chartConfig';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardService.getAdminStats();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader message="Compiling Gym Intelligence..." />;
  if (!data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto mt-10 animate-fade-up">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-600/15 dark:ring-rose-400/20 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Couldn't load dashboard analytics</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
          Check your network connection or verify server status, then try again.
        </p>
        <Button icon={RefreshCw} onClick={fetchDashboard}>
          Retry
        </Button>
      </div>
    );
  }

  const { kpis, charts, recentRegistrations, recentPayments, expiryAlerts } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Executive Command Center
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time analytics, revenue distribution, active attendance, and member retention
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse mr-2" />
            Live Sync Active
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={kpis.totalMembers}
          subtitle={`${kpis.activeMembers} currently active`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(kpis.monthlyRevenue)}
          subtitle="Collected this billing cycle"
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="Today's Attendance"
          value={kpis.todayAttendance}
          subtitle="Check-ins recorded today"
          icon={CalendarCheck}
          color="cyan"
        />
        <StatCard
          title="Expiry Alerts"
          value={kpis.expiringSoonCount}
          subtitle={`${kpis.expiredMembers} already expired`}
          icon={AlertTriangle}
          color={kpis.expiringSoonCount > 0 ? 'red' : 'purple'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
                Daily Attendance Trend
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Peak check-in frequency over the last 14 days</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.attendanceTrends}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip
                  {...getChartTooltipProps(isDark)}
                  itemStyle={{ color: '#6366F1', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="present" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Plans Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
            Plan Distribution
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 mb-4">Active subscriptions by tier</p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.membershipDistribution}
                  dataKey="count"
                  nameKey="planName"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {charts.membershipDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...getChartTooltipProps(isDark)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {charts.membershipDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} />
                  {entry.planName}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">{entry.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Recents: Registrations & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
              Recent Member Registrations
            </h3>
            <Link to="/admin/members" className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
            {recentRegistrations.map((m) => (
              <div key={m._id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-white/[0.04] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center border border-zinc-200 dark:border-white/[0.08] text-xs">
                    {m.user?.name?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">{m.user?.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{m.membershipPlan?.name || 'No Plan'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={m.status}>{m.status}</Badge>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">{formatDate(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
              Recent Transactions
            </h3>
            <Link to="/admin/payments" className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-white/[0.06]">
            {recentPayments.map((p) => (
              <div key={p._id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-white/[0.04] text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center border border-zinc-200 dark:border-white/[0.08] text-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-900 dark:text-zinc-200">{p.member?.user?.name || 'Member'}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{p.invoiceNumber} • {p.paymentMethod.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(p.amount)}</p>
                  <div className="mt-1">
                    <Badge variant={p.status}>{p.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
