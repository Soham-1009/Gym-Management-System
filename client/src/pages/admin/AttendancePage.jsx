import React, { useEffect, useState } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { memberService } from '../../services/memberService';
import {
  CalendarCheck,
  UserCheck,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  LogOut,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/formatters';

const AttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getDaily({ date: selectedDate, search });
      if (res.success) setRecords(res.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, search]);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const res = await memberService.getAll({ status: 'active' });
        if (res.success) setMembers(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    loadMembers();
  }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await attendanceService.checkIn({
        memberId: selectedMemberId,
        notes,
      });
      if (res.success) {
        setIsCheckInModalOpen(false);
        setSelectedMemberId('');
        setNotes('');
        fetchAttendance();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (record) => {
    const memberId = record.member?._id || record.member;
    try {
      const res = await attendanceService.checkOut({
        attendanceId: record._id,
        memberId: memberId,
      });
      if (res.success) {
        fetchAttendance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Turnstile & Daily Attendance
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time access logs with automated duplicate attendance prevention
          </p>
        </div>
        <Button icon={Plus} onClick={() => { setErrorMsg(''); setIsCheckInModalOpen(true); }}>
          Log Member Check-In
        </Button>
      </div>

      {/* Filter and Date Bar */}
      <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search attendee by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200">
            <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-zinc-900 dark:text-white focus:outline-none text-xs"
            />
          </div>
          <span className="text-xs font-medium px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
            {records.length} Present
          </span>
        </div>
      </div>

      {/* Records Table */}
      {loading ? (
        <Loader message="Loading attendance logs..." />
      ) : records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No check-ins logged for this date"
          description="Members checking in at the front desk or mobile portal will appear here."
          actionText="Log Check-in"
          onAction={() => setIsCheckInModalOpen(true)}
        />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50 dark:bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4">Membership Plan</th>
                  <th className="py-3.5 px-4">Check-In Time</th>
                  <th className="py-3.5 px-4">Check-Out Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/[0.04] text-xs">
                {records.map((r) => (
                  <tr key={r._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.025] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-zinc-900 dark:text-zinc-200">
                      {r.member?.user?.name || 'Unknown Member'}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-400">
                      {r.member?.membershipPlan?.name || 'Basic'}
                    </td>
                    <td className="py-3.5 px-4 text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                      {formatTime(r.checkInTime)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      {r.checkOutTime ? (
                        formatTime(r.checkOutTime)
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 italic">Currently Training</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={r.status}>{r.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!r.checkOutTime && (
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={LogOut}
                          onClick={() => handleCheckOut(r)}
                        >
                          Check Out
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Check In Modal */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="Check-In Member (Turnstile Access)"
      >
        <form onSubmit={handleCheckIn} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Select
            label="Select Active Member"
            required
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">Choose a member...</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.user?.name} ({m.membershipPlan?.name || 'No Plan'}) - {m.status.toUpperCase()}
              </option>
            ))}
          </Select>

          <Input
            label="Workout Note / Locker Assigned"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Locker #42, Chest & Triceps"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06]">
            <Button variant="secondary" onClick={() => setIsCheckInModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Verify & Check-In</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
