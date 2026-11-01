import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { memberService } from '../../services/memberService';
import { membershipService } from '../../services/membershipService';
import { trainerService } from '../../services/trainerService';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Award,
  UserCheck,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatCurrency } from '../../utils/formatters';

const MembersPage = () => {
  const { user, isAdmin, isTrainer } = useAuth();
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onlyMyAthletes, setOnlyMyAthletes] = useState(false);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetailData, setMemberDetailData] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'member123',
    gender: 'male',
    dob: '',
    address: '',
    membershipPlan: '',
    trainer: '',
    notes: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { search, status: statusFilter };
      if (isTrainer && onlyMyAthletes && user?.trainerId) {
        params.trainer = user.trainerId;
      }
      const [membersRes, plansRes, trainersRes] = await Promise.all([
        memberService.getAll(params),
        membershipService.getAll(),
        trainerService.getAll(),
      ]);

      if (membersRes.success) setMembers(membersRes.data);
      if (plansRes.success) setPlans(plansRes.data);
      if (trainersRes.success) setTrainers(trainersRes.data);
    } catch (err) {
      console.error('Error fetching members data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, onlyMyAthletes]);

  const handleOpenAddModal = (memberToEdit = null) => {
    if (memberToEdit) {
      setSelectedMember(memberToEdit);
      setFormData({
        name: memberToEdit.user?.name || '',
        email: memberToEdit.user?.email || '',
        phone: memberToEdit.user?.phone || '',
        gender: memberToEdit.gender || 'male',
        dob: memberToEdit.dob ? memberToEdit.dob.split('T')[0] : '',
        address: memberToEdit.address || '',
        membershipPlan: memberToEdit.membershipPlan?._id || '',
        trainer: memberToEdit.trainer?._id || '',
        notes: memberToEdit.notes || '',
      });
    } else {
      setSelectedMember(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: 'member123',
        gender: 'male',
        dob: '',
        address: '',
        membershipPlan: plans[0]?._id || '',
        trainer: '',
        notes: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (selectedMember) {
        await memberService.update(selectedMember._id, formData);
      } else {
        await memberService.create(formData);
      }
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving member');
    }
  };

  const handleDeleteMember = async (id) => {
    if (window.confirm('Are you sure you want to toggle activation for this member?')) {
      try {
        await memberService.delete(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Action failed');
      }
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await memberService.getById(id);
      if (res.success) {
        setMemberDetailData(res.data);
        setIsDetailModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load member profile');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {isTrainer ? 'Athlete Directory & Coaching Roster' : 'Member Directory & Subscriptions'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {isTrainer
              ? 'Review athlete profiles, active training status, and subscription packages'
              : 'Manage memberships, profiles, trainer assignments, and subscription expiries'}
          </p>
        </div>
        {isAdmin && (
          <Button icon={UserPlus} onClick={() => handleOpenAddModal(null)}>
            Enroll New Member
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {isTrainer && (
            <button
              type="button"
              onClick={() => setOnlyMyAthletes(!onlyMyAthletes)}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all border ${
                onlyMyAthletes
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 shadow-sm'
                  : 'bg-white dark:bg-zinc-900/60 text-zinc-400 border-zinc-200 dark:border-white/[0.08] hover:border-white/[0.14] hover:text-zinc-200'
              }`}
            >
              {onlyMyAthletes ? '★ Showing My Athletes' : 'Show Only My Athletes'}
            </button>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-xl px-3 py-2.5 text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all"
          >
            <option value="" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">All Statuses</option>
            <option value="active" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Active Members</option>
            <option value="expired" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Expired Members</option>
            <option value="inactive" className="bg-white dark:bg-[#121215] text-zinc-900 dark:text-zinc-100">Inactive</option>
          </select>
        </div>
      </div>

      {/* Member Table */}
      {loading ? (
        <Loader message="Fetching member records..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members found"
          description={isTrainer ? 'No athletes match the current filter criteria.' : 'Try modifying search filters or register a new gym member.'}
          actionText={isAdmin ? 'Add Member' : undefined}
          onAction={isAdmin ? () => handleOpenAddModal(null) : undefined}
        />
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/[0.08]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Membership Plan</th>
                  <th className="py-3.5 px-4">Assigned Trainer</th>
                  <th className="py-3.5 px-4">Expiry Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs">
                {members.map((m) => (
                  <tr key={m._id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-zinc-50/80 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-center font-semibold text-indigo-600 dark:text-indigo-400 text-xs">
                          {m.user?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-200">{m.user?.name}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{m.user?.email}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{m.user?.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-300">
                        <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                        {m.membershipPlan?.name || <span className="text-zinc-400">Unassigned</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500 dark:text-zinc-400">
                      {m.trainer?.user ? (
                        <div className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-300">
                          <UserCheck className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                          <span>{m.trainer.user?.name || 'Assigned Coach'}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 italic">Self-Guided</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {formatDate(m.expiryDate)}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={m.status}>{m.status}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleViewDetails(m._id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenAddModal(m)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m._id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                m.status === 'inactive'
                                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10'
                                  : 'text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10'
                              }`}
                              title={m.status === 'inactive' ? 'Activate' : 'Deactivate'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={selectedMember ? 'Update Member Profile' : 'Enroll New Gym Member'}
      >
        <form onSubmit={handleSaveMember} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            {!selectedMember && (
              <Input
                label="Account Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>

            <Input
              label="Date of Birth"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            />

            <Select
              label="Membership Plan"
              value={formData.membershipPlan}
              onChange={(e) => setFormData({ ...formData, membershipPlan: e.target.value })}
            >
              <option value="">Select Plan...</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.durationMonths}m - ${p.price})
                </option>
              ))}
            </Select>
          </div>

          <Select
            label="Assigned Personal Trainer"
            value={formData.trainer}
            onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
          >
            <option value="">None (Self-Guided)</option>
            {trainers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.user?.name} — {t.specialization}
              </option>
            ))}
          </Select>

          <Input
            label="Home Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedMember ? 'Save Changes' : 'Complete Enrollment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Member Profile Modal */}
      {memberDetailData && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Member Profile: ${memberDetailData.member.user?.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Top overview card */}
            <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-zinc-50/80 dark:bg-white/[0.04] text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center text-base border border-zinc-200 dark:border-white/[0.08]">
                  {memberDetailData.member.user?.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{memberDetailData.member.user?.name}</h4>
                  <p className="text-zinc-500 dark:text-zinc-400">{memberDetailData.member.user?.email}</p>
                  <p className="text-zinc-500 dark:text-zinc-400">{memberDetailData.member.user?.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={memberDetailData.member.status}>{memberDetailData.member.status}</Badge>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Joined: {formatDate(memberDetailData.member.joinDate)}</p>
              </div>
            </div>

            {/* Plan & Trainer Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06]">
                <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Membership Tier</p>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {memberDetailData.member.membershipPlan?.name || 'No Plan'}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">Expires: {formatDate(memberDetailData.member.expiryDate)}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06]">
                <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400">Assigned Trainer</p>
                <p className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 mt-1">
                  {memberDetailData.member.trainer?.user?.name || 'Self-Guided'}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {memberDetailData.member.trainer?.specialization || 'General Access'}
                </p>
              </div>
            </div>

            {/* Recent Attendance */}
            <div>
              <h5 className="font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">Recent Attendance</h5>
              {memberDetailData.recentAttendance.length === 0 ? (
                <p className="text-zinc-500 italic">No attendance records logged.</p>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-white/[0.04] border border-zinc-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
                  {memberDetailData.recentAttendance.slice(0, 5).map((att) => (
                    <div key={att._id} className="p-2.5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
                      <span className="text-zinc-700 dark:text-zinc-300">{formatDate(att.date)}</span>
                      <span className="text-indigo-500 dark:text-indigo-400 font-medium">{att.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments (Admin) or Biometrics (Trainer) */}
            {isTrainer ? (
              <div>
                <h5 className="font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">Biometrics & Assessment History</h5>
                {!memberDetailData.latestProgress || memberDetailData.latestProgress.length === 0 ? (
                  <p className="text-zinc-500 italic">No biometric assessments logged yet.</p>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-white/[0.04] border border-zinc-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
                    {memberDetailData.latestProgress.slice(0, 5).map((prog) => (
                      <div key={prog._id} className="p-2.5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
                        <div>
                          <span className="font-medium text-zinc-900 dark:text-zinc-200">{prog.weightKg} kg</span>
                          <span className="text-zinc-500 dark:text-zinc-400 ml-2">BMI: {prog.bmi} ({formatDate(prog.date)})</span>
                        </div>
                        <span className="text-cyan-500 dark:text-cyan-400 font-medium">Waist: {prog.measurements?.waistCm || '--'} cm</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h5 className="font-semibold text-zinc-900 dark:text-white tracking-tight mb-2">Billing History</h5>
                {!memberDetailData.recentPayments || memberDetailData.recentPayments.length === 0 ? (
                  <p className="text-zinc-500 italic">No payments on file.</p>
                ) : (
                  <div className="divide-y divide-zinc-200 dark:divide-white/[0.04] border border-zinc-200 dark:border-white/[0.06] rounded-xl overflow-hidden">
                    {memberDetailData.recentPayments.slice(0, 5).map((p) => (
                      <div key={p._id} className="p-2.5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
                        <div>
                          <span className="font-medium text-zinc-900 dark:text-zinc-200">{p.invoiceNumber}</span>
                          <span className="text-zinc-500 dark:text-zinc-400 ml-2">({formatDate(p.paymentDate)})</span>
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{formatCurrency(p.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MembersPage;
