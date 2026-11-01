import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/reportService';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  Printer,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { getChartTooltipProps } from '../../utils/chartConfig';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ReportsPage = () => {
  const { isDark } = useTheme();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportService.getAnalytics({ startDate, endDate });
      if (res.success) setReport(res.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [startDate, endDate]);

  if (loading) return <Loader message="Generating Strategic Reports..." />;
  if (!report) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center max-w-lg mx-auto mt-10 animate-fade-up">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-600/15 dark:ring-rose-400/20 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-zinc-900 dark:text-white">Couldn't load strategic reports</h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
          Verify date filters and server connectivity, then try again.
        </p>
        <Button icon={RefreshCw} onClick={fetchReports}>
          Retry
        </Button>
      </div>
    );
  }

  const monthlyRevenue = report.revenue?.monthlyRevenue || [];
  const memberGrowth = report.memberGrowth || [];
  const methodBreakdown = report.revenue?.methodBreakdown || [];
  const expiringSoon = report.expiryAlerts?.expiringSoon || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Executive Reports & Financial Auditing
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Historical revenue breakdowns, member acquisition velocity, and retention audits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={Printer} onClick={() => window.print()}>
            Print Report
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Filter Date Range:
        </span>
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-xl px-3 py-1.5 text-zinc-900 dark:text-white focus:outline-none"
          />
          <span className="text-zinc-500">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-xl px-3 py-1.5 text-zinc-900 dark:text-white focus:outline-none"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-0.5">
            Monthly Gross Revenue
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Total membership receipts per calendar month</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} />
                <Tooltip
                  {...getChartTooltipProps(isDark)}
                  formatter={(val) => [formatCurrency(val), 'Revenue']}
                />
                <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Acquisition Velocity */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-0.5">
            Member Acquisition Velocity
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">New athlete enrollments per month</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip {...getChartTooltipProps(isDark)} />
                <Bar dataKey="newMembers" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment Method Distribution Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-3">
            Revenue by Payment Channel
          </h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/[0.06] text-[10px] uppercase text-zinc-400">
                <th className="py-2.5">Method</th>
                <th className="py-2.5 text-center">Transactions</th>
                <th className="py-2.5 text-right">Gross Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
              {methodBreakdown.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 uppercase font-medium text-zinc-900 dark:text-zinc-200 tracking-wider text-[11px]">
                    {item.method}
                  </td>
                  <td className="py-3 text-center text-zinc-500 dark:text-zinc-400">{item.count}</td>
                  <td className="py-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Expired & At-Risk Members */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              Upcoming Expirations (Next 7 Days)
            </h3>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {expiringSoon.length} Members
            </span>
          </div>

          {expiringSoon.length === 0 ? (
            <p className="text-xs text-zinc-500 italic py-4">No memberships expiring within the next 7 days.</p>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-white/[0.04] text-xs">
              {expiringSoon.map((m) => (
                <div key={m._id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-200">{m.user?.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{m.membershipPlan?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-amber-600 dark:text-amber-400 font-medium">{formatDate(m.expiryDate)}</p>
                    <p className="text-[10px] text-zinc-500">{m.user?.phone}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
