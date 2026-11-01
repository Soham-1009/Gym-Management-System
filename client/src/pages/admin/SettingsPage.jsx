import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings, Shield, Building2, Lock, Save, CheckCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';

const SettingsPage = () => {
  const { user } = useAuth();
  const [gymSettings, setGymSettings] = useState({
    gymName: 'TitanPulse Elite Fitness Club',
    address: '742 Evergreen Fitness Plaza, Suite 400',
    phone: '+1 (555) 0199-PULSE',
    openingHours: 'Mon-Sun: 05:00 AM - 11:00 PM',
    currency: 'USD ($)',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savedSuccess, setSavedSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const handleSaveGymSettings = (e) => {
    e.preventDefault();
    setSavedSuccess('Gym facility parameters updated successfully.');
    setTimeout(() => setSavedSuccess(''), 3000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPwdError('New passwords do not match');
      return;
    }
    try {
      const res = await authService.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      if (res.success) {
        setSavedSuccess('Security credentials successfully updated.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSavedSuccess(''), 3000);
      }
    } catch (err) {
      setPwdError(err.response?.data?.message || 'Password update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          System Preferences & Configuration
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Gym organization parameters, operating hours, and administrative security credentials
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gym Identity Settings */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-white/[0.06]">
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
              Gym Facility Profile
            </h3>
          </div>

          <form onSubmit={handleSaveGymSettings} className="space-y-4 text-xs">
            <Input
              label="Gym Organization Name"
              value={gymSettings.gymName}
              onChange={(e) => setGymSettings({ ...gymSettings, gymName: e.target.value })}
            />
            <Input
              label="Headquarters Address"
              value={gymSettings.address}
              onChange={(e) => setGymSettings({ ...gymSettings, address: e.target.value })}
            />
            <Input
              label="Front Desk Telephone"
              value={gymSettings.phone}
              onChange={(e) => setGymSettings({ ...gymSettings, phone: e.target.value })}
            />
            <Input
              label="Operating Hours"
              value={gymSettings.openingHours}
              onChange={(e) => setGymSettings({ ...gymSettings, openingHours: e.target.value })}
            />

            <Button type="submit" icon={Save}>
              Save Facility Profile
            </Button>
          </form>
        </div>

        {/* Security & Access Settings */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-zinc-200 dark:border-white/[0.06]">
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
              Administrative Password & Security
            </h3>
          </div>

          {pwdError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 mb-3">
              {pwdError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <Input
              label="Current Password"
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            />

            <Button type="submit" variant="secondary" icon={Lock}>
              Update Security Credentials
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
