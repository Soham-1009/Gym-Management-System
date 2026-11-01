import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Bell,
  Send,
  CheckCircle,
  AlertTriangle,
  Info,
  CreditCard,
  Dumbbell,
  CheckCheck,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res.data.success) setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/notifications', formData);
      if (res.data.success) {
        setIsModalOpen(false);
        setFormData({ title: '', message: '', type: 'info' });
        fetchNotifications();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending announcement');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'workout':
        return <Dumbbell className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System Broadcasts & Member Alerts
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Dispatch announcements, facility maintenance alerts, and membership updates
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" icon={CheckCheck} onClick={handleMarkAllRead}>
            Mark All Read
          </Button>
          <Button icon={Send} onClick={() => setIsModalOpen(true)}>
            New Broadcast
          </Button>
        </div>
      </div>

      {/* Notifications Feed */}
      {loading ? (
        <Loader message="Loading communication feeds..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications logged"
          description="Create a global announcement to notify athletes and staff."
          actionText="Create Broadcast"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`glass-card rounded-2xl p-5 border flex items-start gap-4 transition-all duration-200 ${
                n.isRead ? 'border-zinc-200 dark:border-white/[0.06] bg-white/[0.015] opacity-75' : 'border-indigo-500/25 bg-indigo-500/[0.02]'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center flex-shrink-0">
                {getTypeIcon(n.type)}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                    {n.title}
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                    )}
                  </h4>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed font-normal">{n.message}</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <Badge variant={n.type}>{n.type}</Badge>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {n.recipient ? 'Direct Member Alert' : 'System-Wide Broadcast'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast System Announcement"
      >
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <Input
            label="Announcement Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Holiday Hours & Facility Upgrades"
          />

          <Select
            label="Notification Category"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="info">General Info</option>
            <option value="alert">Urgent Alert / Maintenance</option>
            <option value="payment">Billing Update</option>
            <option value="workout">Training & Classes</option>
          </Select>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-white/[0.14] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 text-xs transition-all"
              placeholder="Type announcement details for the gym dashboard..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Send}>
              Dispatch Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;
