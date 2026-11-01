import React, { useEffect, useState } from 'react';
import { trainerService } from '../../services/trainerService';
import {
  UserCheck,
  UserPlus,
  Search,
  Star,
  Clock,
  Dumbbell,
  Users,
  Edit,
  Trash2,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const TrainersPage = () => {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'trainer123',
    specialization: '',
    experienceYears: 1,
    bio: '',
    availability: 'full-time',
  });

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await trainerService.getAll({ search });
      if (res.success) setTrainers(res.data);
    } catch (err) {
      console.error('Error fetching trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [search]);

  const handleOpenModal = (trainer = null) => {
    if (trainer) {
      setSelectedTrainer(trainer);
      setFormData({
        name: trainer.user?.name || '',
        email: trainer.user?.email || '',
        phone: trainer.phone || '',
        specialization: trainer.specialization || '',
        experienceYears: trainer.experienceYears || 1,
        bio: trainer.bio || '',
        availability: trainer.availability || 'full-time',
      });
    } else {
      setSelectedTrainer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: 'trainer123',
        specialization: '',
        experienceYears: 1,
        bio: '',
        availability: 'full-time',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (selectedTrainer) {
        await trainerService.update(selectedTrainer._id, formData);
      } else {
        await trainerService.create(formData);
      }
      setIsModalOpen(false);
      fetchTrainers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving trainer profile');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Toggle status for this trainer?')) {
      try {
        await trainerService.delete(id);
        fetchTrainers();
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
            <UserCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Certified Fitness Coaches & Trainers
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage fitness professionals, coaching specializations, and assigned athletes
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => handleOpenModal(null)}>
          Add Coach / Trainer
        </Button>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-4 border border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by trainer name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/[0.08] hover:border-white/[0.14] rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <Loader message="Loading certified coaches..." />
      ) : trainers.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No trainers found"
          description="Register your personal trainers to start assigning members."
          actionText="Add Trainer"
          onAction={() => handleOpenModal(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainers.map((tr) => (
            <div key={tr._id} className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between hover:border-white/[0.14] transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-zinc-50/80 dark:bg-white/[0.04] text-cyan-600 dark:text-cyan-400 font-semibold flex items-center justify-center text-sm border border-zinc-200 dark:border-white/[0.08]">
                      {tr.user?.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">{tr.user?.name}</h3>
                      <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400 mt-0.5">{tr.specialization}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{tr.user?.email}</p>
                    </div>
                  </div>
                  <Badge variant={tr.status}>{tr.status}</Badge>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4 font-normal">
                  "{tr.bio || 'Dedicated to helping members unlock peak physical potential.'}"
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs py-3 border border-zinc-200 dark:border-white/[0.06] mb-4 bg-zinc-50 dark:bg-white/[0.02] rounded-xl px-3">
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>{tr.experienceYears} Years Exp</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                    <span>{tr.assignedMembers?.length || 0} Members</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400" />
                    <span>{tr.rating || 5.0} Rating</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 uppercase text-[10px] font-medium">
                    <span>Shift: {tr.availability}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button size="sm" variant="secondary" icon={Edit} onClick={() => handleOpenModal(tr)}>
                  Edit Coach
                </Button>
                <button
                  onClick={() => handleDelete(tr._id)}
                  className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                    tr.status === 'inactive'
                      ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  {tr.status === 'inactive' ? 'Activate' : 'Deactivate'}
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
        title={selectedTrainer ? 'Edit Trainer Profile' : 'Onboard New Coach'}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
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
            {!selectedTrainer && (
              <Input
                label="Account Password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Specialization (e.g., Strength, HIIT, Yoga)"
              required
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            />
            <Input
              label="Years of Experience"
              type="number"
              min="0"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />
          </div>

          <Select
            label="Shift Availability"
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
          >
            <option value="full-time">Full-Time (All Day)</option>
            <option value="morning">Morning Shift (6 AM - 2 PM)</option>
            <option value="evening">Evening Shift (2 PM - 10 PM)</option>
          </Select>

          <Input
            label="Coach Biography"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="Specializations, coaching philosophy, certifications..."
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.08]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedTrainer ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainersPage;
