import React, { useEffect, useState } from 'react';
import { progressService } from '../../services/progressService';
import { Activity, Plus, Scale, TrendingUp, Sparkles, ChevronRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, getBMICategory } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { getChartTooltipProps } from '../../utils/chartConfig';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MemberProgressPage = () => {
  const { isDark } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await progressService.getMy();
      if (res.success) setHistory(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleRecord = async (e) => {
    e.preventDefault();
    try {
      const payload = {
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
        fetchProgress();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording biometrics');
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
            Physical Progress & Biometrics
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track body composition trajectory, weight progression, and calculated BMI trends
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
          Log New Bodyweight
        </Button>
      </div>

      {/* Latest Metrics Summary */}
      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium tracking-wider text-zinc-500 dark:text-zinc-400">Current Weight</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1 tracking-tight">{latest.weightKg} kg</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Recorded: {formatDate(latest.date)}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium tracking-wider text-zinc-500 dark:text-zinc-400">Body Mass Index</p>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 tracking-tight">{latest.bmi}</p>
            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-1 ${getBMICategory(latest.bmi).bg} ${getBMICategory(latest.bmi).color}`}>
              {getBMICategory(latest.bmi).label}
            </span>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08]">
            <p className="text-[10px] uppercase font-medium tracking-wider text-zinc-500 dark:text-zinc-400">Waist & Torso</p>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">{latest.measurements?.waistCm || 0} cm</p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Chest: {latest.measurements?.chestCm || 0} cm</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
              Weight Trajectory Curve
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Monitoring mass trends across training blocks</p>
          </div>
        </div>

        {loading ? (
          <Loader message="Loading transformation history..." />
        ) : chartData.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No progress logged yet"
            description="Log your first weight entry to initiate your transformation trend line."
            actionText="Log Weight"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#6366F1" fontSize={11} unit=" kg" tickLine={false} axisLine={false} />
                <Tooltip {...getChartTooltipProps(isDark)} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight (kg)"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366F1', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#818CF8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Bodyweight & Measurements"
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
              placeholder="e.g. 82.5"
            />
            <Input
              label="Height (cm)"
              type="number"
              step="0.1"
              required
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
              placeholder="e.g. 180"
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
              label="Arms (cm)"
              type="number"
              step="0.5"
              value={formData.armsCm}
              onChange={(e) => setFormData({ ...formData, armsCm: e.target.value })}
            />
          </div>

          <Input
            label="Workout & Recovery Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="e.g. Strong energy, recovery feeling optimal"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Log Assessment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MemberProgressPage;
