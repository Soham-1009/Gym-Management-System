import React, { useEffect, useState } from 'react';
import { membershipService } from '../../services/membershipService';
import { Award, Plus, Check, Edit, Trash2, ShieldCheck, Zap } from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatters';

const MembershipPlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    durationMonths: 1,
    price: 49,
    description: '',
    features: '',
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await membershipService.getAll();
      if (res.success) setPlans(res.data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setSelectedPlan(plan);
      setFormData({
        name: plan.name,
        durationMonths: plan.durationMonths,
        price: plan.price,
        description: plan.description || '',
        features: plan.features ? plan.features.join(', ') : '',
      });
    } else {
      setSelectedPlan(null);
      setFormData({
        name: '',
        durationMonths: 1,
        price: 49,
        description: '',
        features: 'Locker access, Free weights area, Cardio zone',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        await membershipService.update(selectedPlan._id, formData);
      } else {
        await membershipService.create(formData);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving membership plan');
    }
  };

  const handleToggle = async (id) => {
    if (window.confirm('Toggle status of this membership plan?')) {
      try {
        await membershipService.delete(id);
        fetchPlans();
      } catch (err) {
        alert('Action failed');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            Membership Packages & Tiers
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure subscription packages with automated month-based expiry calculation
          </p>
        </div>
        <Button icon={Plus} onClick={() => handleOpenModal(null)}>
          Create Membership Tier
        </Button>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-center gap-3 text-xs text-indigo-700 dark:text-indigo-300/90">
        <Zap className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
        <span>
          <strong>Automated Lifecycle Management:</strong> When a member subscribes or renews, their expiry date is calculated instantaneously based on the package duration.
        </span>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <Loader message="Loading membership tiers..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p._id}
              className={`glass-card rounded-2xl p-6 border flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:border-white/[0.14] ${
                p.durationMonths >= 12
                  ? 'border-indigo-500/30 bg-indigo-500/[0.02]'
                  : 'border-zinc-200 dark:border-white/[0.08]'
              }`}
            >
              {p.durationMonths >= 12 && (
                <div className="absolute top-3.5 right-3.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-indigo-500 text-zinc-950">
                    VIP Best Value
                  </span>
                </div>
              )}

              <div>
                <Badge variant={p.status}>{p.status}</Badge>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-3 tracking-tight">{p.name}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 min-h-[32px]">{p.description}</p>

                <div className="my-5">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">{formatCurrency(p.price)}</span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1.5">/ {p.durationMonths} month{p.durationMonths > 1 ? 's' : ''}</span>
                </div>

                <div className="space-y-2 py-3 border-t border-zinc-200 dark:border-white/[0.06] text-xs">
                  {p.features && p.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                      <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.06] flex items-center justify-between">
                <Button size="sm" variant="secondary" icon={Edit} onClick={() => handleOpenModal(p)}>
                  Edit
                </Button>
                <button
                  onClick={() => handleToggle(p._id)}
                  className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
                    p.status === 'inactive'
                      ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  {p.status === 'inactive' ? 'Activate' : 'Deactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPlan ? 'Update Plan' : 'Create New Membership Plan'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <Input
            label="Plan Title"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Yearly VIP Platinum"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Duration (Months)"
              type="number"
              min="1"
              required
              value={formData.durationMonths}
              onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
            />
            <Input
              label="Price ($ USD)"
              type="number"
              min="0"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <Input
            label="Short Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Key target audience or inclusions..."
          />

          <Input
            label="Features (comma-separated)"
            value={formData.features}
            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
            placeholder="Locker reservation, Sauna access, Free personal training"
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedPlan ? 'Save Changes' : 'Publish Plan'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MembershipPlansPage;
