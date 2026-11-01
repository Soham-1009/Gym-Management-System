import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { User, Phone, Mail, Shield, Save, CheckCircle, Lock } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Badge from '../components/common/Badge';
import Loader from '../components/common/Loader';

const ProfilePage = () => {
  const { user, updateCurrentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    avatar: '',
    address: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    specialization: '',
    bio: '',
  });

  const [pwdData, setPwdData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authService.getMe();
      if (res.success) {
        setProfile(res.data);
        const u = res.data.user;
        const m = res.data.member;
        const t = res.data.trainer;

        setFormData({
          name: u.name || '',
          phone: u.phone || '',
          avatar: u.avatar || '',
          address: m?.address || '',
          emergencyName: m?.emergencyContact?.name || '',
          emergencyPhone: m?.emergencyContact?.phone || '',
          emergencyRelation: m?.emergencyContact?.relation || '',
          specialization: t?.specialization || '',
          bio: t?.bio || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        avatar: formData.avatar,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
        specialization: formData.specialization,
        bio: formData.bio,
      };

      const res = await authService.updateProfile(payload);
      if (res.success) {
        setSaveSuccess('Profile successfully updated.');
        updateCurrentUser({ name: formData.name, phone: formData.phone });
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    // Reset banners so an old success/error doesn't linger alongside the new result.
    setErrorMsg('');
    setSaveSuccess('');
    try {
      const res = await authService.updatePassword(pwdData);
      if (res.success) {
        if (res.data?.token) {
          localStorage.setItem('gym_token', res.data.token);
        }
        setSaveSuccess('Password changed successfully.');
        setPwdData({ currentPassword: '', newPassword: '' });
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Password update failed');
    }
  };

  if (loading) return <Loader message="Accessing account credentials..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
          <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          My Profile & Account Security
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage contact details, emergency information, and account authentication
        </p>
      </div>

      {saveSuccess && (
        <div role="status" className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center gap-2 text-xs font-medium text-indigo-700 dark:text-indigo-300 animate-fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {errorMsg && (
        <div role="alert" className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-300 animate-fade-in">
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Role Summary Card */}
        <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-white/[0.04] text-indigo-600 dark:text-indigo-400 font-bold text-xl flex items-center justify-center border border-indigo-100 dark:border-white/[0.08] mb-3">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">{user?.name}</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">{user?.email}</p>
          <Badge variant={user?.role}>{user?.role}</Badge>

          <div className="w-full mt-6 pt-4 border-t border-zinc-200 dark:border-white/[0.06] text-left text-xs space-y-2 text-zinc-700 dark:text-zinc-300">
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Account Role:</span>
              <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">User ID:</span>
              <span className="font-mono text-[10px] text-zinc-500 truncate max-w-[120px]">{user?.id}</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Editable Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-4 pb-2.5 border-b border-zinc-200 dark:border-white/[0.06]">
              Personal Information
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Contact Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              {user?.role === 'member' && (
                <>
                  <Input
                    label="Home Address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />

                  <div className="pt-2">
                    <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400 tracking-wider mb-2">
                      Emergency Contact Verification
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        label="Contact Name"
                        value={formData.emergencyName}
                        onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      />
                      <Input
                        label="Phone Number"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      />
                      <Input
                        label="Relationship"
                        value={formData.emergencyRelation}
                        onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                      />
                    </div>
                  </div>
                </>
              )}

              {user?.role === 'trainer' && (
                <>
                  <Input
                    label="Coaching Specialization"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                  <Input
                    label="Professional Bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </>
              )}

              <Button type="submit" icon={Save}>
                Save Profile
              </Button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight mb-4 pb-2.5 border-b border-zinc-200 dark:border-white/[0.06]">
              Account Security & Password
            </h3>

            <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  required
                  value={pwdData.currentPassword}
                  onChange={(e) => setPwdData({ ...pwdData, currentPassword: e.target.value })}
                />
                <Input
                  label="New Password"
                  type="password"
                  required
                  value={pwdData.newPassword}
                  onChange={(e) => setPwdData({ ...pwdData, newPassword: e.target.value })}
                />
              </div>

              <Button type="submit" variant="secondary" icon={Lock}>
                Change Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
