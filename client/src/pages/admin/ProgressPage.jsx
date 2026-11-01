import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { progressService } from '../../services/progressService';
import { memberService } from '../../services/memberService';
import {
  LineChart,
  Plus,
  Scale,
  Ruler,
  TrendingDown,
  TrendingUp,
  Activity,
  Calendar,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, getBMICategory } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { getChartTooltipProps } from '../../utils/chartConfig';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ProgressPage = () => {
  const { isDark } = useTheme();
  const { user, isTrainer } = useAuth();
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    weightKg: '',
    heightCm: '180',
    chestCm: '',
    waistCm: '',
    hipsCm: '',
    armsCm: '',
    thighsCm: '',
    notes: '',
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await memberService.getAll({ status: 'active' });
        if (res.success && res.data.length > 0) {
          const sorted = [...res.data].sort((a, b) => {
            if (isTrainer) {
              const aMine = a.trainer?._id === user?.trainerId || a.trainer?.user?._id === user?.id;
              const bMine = b.trainer?._id === user?.trainerId || b.trainer?.user?._id === user?.id;
              if (aMine && !bMine) return -1;
              if (!aMine && bMine) return 1;
            }
            return 0;
          });
          setMembers(sorted);
          setSelectedMemberId(sorted[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMembers();
  }, [isTrainer, user?.trainerId, user?.id]);

  const fetchHistory = async (memberId) => {
    if (!memberId) return;
    try {
      setLoading(true);
      const res = await progressService.getMemberHistory(memberId);
      if (res.success) setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMemberId) {
      fetchHistory(selectedMemberId);
    }
  }, [selectedMemberId]);

  const handleRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        memberId: selectedMemberId,
        weightKg: formData.weightKg,
        heightCm: formData.heightCm,
        measurements: {
          chestCm: formData.chestCm ? parseFloat(formData.chestCm) : 0,
          waistCm: formData.waistCm ? parseFloat(formData.waistCm) : 0,
          hipsCm: formData.hipsCm ? parseFloat(formData.hipsCm) : 0,
          armsCm: formData.armsCm ? parseFloat(formData.armsCm) : 0,
          thighsCm: formData.thighsCm ? parseFloat(formData.thighsCm) : 0,
        },
        notes: formData.notes,
      };

      const res = await progressService.record(payload);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          weightKg: '',
          heightCm: '180',
          chestCm: '',
          waistCm: '',
          hipsCm: '',
          armsCm: '',
          thighsCm: '',
          notes: '',
        });
        fetchHistory(selectedMemberId);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording progress');
    }
  };

  const chartData = history.map((item) => ({
    date: formatDate(item.date),
    weight: item.weightKg,
    bmi: item.bmi,
  }));

  const latest = history[history.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Biometrics & Physical Progress Tracking
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Body composition analytics, weight trajectory, and automated BMI classification
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Log Biometric Assessment
        </Button>
      </div>

      {/* Member Selector Bar */}
      <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-3 w-full max-w-md">
          <label className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
            Athlete:
          </label>
          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            {members.map((m) => {
              const isMyAthlete = isTrainer && (m.trainer?._id === user?.trainerId || m.trainer?.user?._id === user?.id);
              return (
                <option key={m._id} value={m._id} className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">
                  {m.user?.name} {isMyAthlete ? '★ (Your Athlete)' : ''} ({m.membershipPlan?.name || 'No Plan'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Latest Metrics Summary Cards */}
      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Current Weight</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1 tracking-tight">{latest.weightKg} kg</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Height: {latest.heightCm} cm</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Body Mass Index (BMI)</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 tracking-tight">{latest.bmi}</p>
            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${getBMICategory(latest.bmi).bg} ${getBMICategory(latest.bmi).color}`}>
              {getBMICategory(latest.bmi).label}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Waist Measurement</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">{latest.measurements?.waistCm || 0} cm</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Chest: {latest.measurements?.chestCm || 0} cm</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Last Assessment</p>
            <p className="text-sm font-semibold text-zinc-900 dark:text-white mt-1.5">{formatDate(latest.date)}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">Evaluated by staff</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-0.5">
          Bodyweight & BMI Trajectory
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Historical progression over recent evaluations</p>

        {loading ? (
          <Loader message="Fetching biometric records..." />
        ) : chartData.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No progress records logged"
            description="Log an initial biometric assessment to start charting athlete fitness curves."
            actionText="Record Assessment"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#6366F1" fontSize={11} unit=" kg" tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip {...getChartTooltipProps(isDark)} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#6366F1' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="bmi"
                  name="BMI"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Biometric & Progress Assessment"
      >
        <form onSubmit={handleRecord} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (kg)"
              type="number"
              step="0.1"
              required
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
              placeholder="e.g. 78.5"
            />
            <Input
              label="Height (cm)"
              type="number"
              step="0.1"
              required
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
              placeholder="e.g. 178"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Chest (cm)"
              type="number"
              step="0.5"
              value={formData.chestCm}
              onChange={(e) => setFormData({ ...formData, chestCm: e.target.value })}
            />
            <Input
              label="Waist (cm)"
              type="number"
              step="0.5"
              value={formData.waistCm}
              onChange={(e) => setFormData({ ...formData, waistCm: e.target.value })}
            />
            <Input
              label="Hips (cm)"
              type="number"
              step="0.5"
              value={formData.hipsCm}
              onChange={(e) => setFormData({ ...formData, hipsCm: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Arms (cm)"
              type="number"
              step="0.5"
              value={formData.armsCm}
              onChange={(e) => setFormData({ ...formData, armsCm: e.target.value })}
            />
            <Input
              label="Thighs (cm)"
              type="number"
              step="0.5"
              value={formData.thighsCm}
              onChange={(e) => setFormData({ ...formData, thighsCm: e.target.value })}
            />
          </div>

          <Input
            label="Evaluation Notes & Observations"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Visual lean definition in deltoids, increased stamina"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Assessment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProgressPage;
