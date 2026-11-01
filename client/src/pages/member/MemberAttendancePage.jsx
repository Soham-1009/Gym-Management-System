import React, { useEffect, useState } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { CalendarCheck, Clock, CheckCircle2, AlertCircle, LogIn, LogOut } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatDate, formatTime } from '../../utils/formatters';

const MemberAttendancePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getMy();
      if (res.success) setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const handleSelfCheckIn = async () => {
    setErrorMsg('');
    setActionMsg('');
    try {
      const res = await attendanceService.checkIn({ notes: 'Self check-in via mobile portal' });
      if (res.success) {
        setActionMsg('Check-in logged! Enjoy your workout session.');
        fetchMyAttendance();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleSelfCheckOut = async () => {
    setErrorMsg('');
    setActionMsg('');
    try {
      const res = await attendanceService.checkOut({});
      if (res.success) {
        setActionMsg('Checked out successfully. Great work today!');
        fetchMyAttendance();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-out failed');
    }
  };

  if (loading) return <Loader message="Fetching attendance ledger..." />;

  const stats = data?.stats || { percentage: 0, presentCount: 0 };
  const records = data?.records || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            My Facility Attendance Ledger
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track your workout consistency, turnstile check-ins, and gym commitment rate
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button icon={LogIn} onClick={handleSelfCheckIn}>
            Log Daily Check-In
          </Button>
          <Button variant="secondary" icon={LogOut} onClick={handleSelfCheckOut}>
            Log Check-Out
          </Button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
          <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Consistency Score (Last 30 Days)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight">{stats.percentage}%</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">of days trained</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">High consistency leads to optimal strength progression</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
          <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Total Sessions Logged</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{stats.presentCount}</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">workouts completed</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Verified physical attendance</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-300">
            Attendance Log History
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-transparent">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">Check-Out Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
              {records.map((r) => (
                <tr key={r._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.025] transition-colors">
                  <td className="py-3 px-4 font-medium text-zinc-900 dark:text-zinc-200">{formatDate(r.date)}</td>
                  <td className="py-3 px-4 font-mono text-indigo-500 dark:text-indigo-400 font-medium">{formatTime(r.checkInTime)}</td>
                  <td className="py-3 px-4 font-mono text-zinc-500 dark:text-zinc-400">
                    {r.checkOutTime ? formatTime(r.checkOutTime) : <span className="text-amber-500 dark:text-amber-400 italic">In Gym</span>}
                  </td>
                  <td className="py-3 px-4"><Badge variant={r.status}>{r.status}</Badge></td>
                  <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 italic">{r.notes || 'Routine session'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberAttendancePage;
