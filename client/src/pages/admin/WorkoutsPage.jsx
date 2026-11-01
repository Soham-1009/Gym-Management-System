import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { workoutService } from '../../services/workoutService';
import { memberService } from '../../services/memberService';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit,
  Clock,
  Repeat,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const WorkoutsPage = () => {
  const { user, isAdmin, isTrainer } = useAuth();
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExerciseCatalogOpen, setIsExerciseCatalogOpen] = useState(false);
  const [filterMine, setFilterMine] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    member: '',
    goal: 'Muscle Hypertrophy & Strength',
    level: 'intermediate',
    notes: '',
    exercises: [
      { name: 'Barbell Bench Press', sets: 4, reps: 8, restSeconds: 90, instructions: 'RPE 8' },
    ],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, exercisesRes, membersRes] = await Promise.all([
        workoutService.getAllPlans(),
        workoutService.getExercises(),
        memberService.getAll({ status: 'active' }),
      ]);
      if (plansRes.success) setPlans(plansRes.data);
      if (exercisesRes.success) setExercises(exercisesRes.data);
      if (membersRes.success) setMembers(membersRes.data);
    } catch (err) {
      console.error('Error fetching workout data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExerciseRow = () => {
    setFormData({
      ...formData,
      exercises: [
        ...formData.exercises,
        { name: exercises[0]?.name || 'Exercise', sets: 3, reps: 10, restSeconds: 60, instructions: '' },
      ],
    });
  };

  const handleRemoveExerciseRow = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, idx) => idx !== index),
    });
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...formData.exercises];
    updated[index][field] = value;
    setFormData({ ...formData, exercises: updated });
  };

  const handleSavePlan = async (e) => {
    e.preventDefault();
    try {
      const res = await workoutService.createPlan(formData);
      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving workout routine');
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm('Delete this workout regimen?')) {
      try {
        await workoutService.deletePlan(id);
        fetchData();
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
            <Dumbbell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Training Routines & Exercise Library
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Build custom periodized workout regimens and assign exercises to athletes
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {isTrainer && (
            <button
              type="button"
              onClick={() => setFilterMine(!filterMine)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
                filterMine
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 shadow-sm'
                  : 'bg-white dark:bg-zinc-900/60 text-zinc-400 border-zinc-200 dark:border-white/[0.08] hover:border-white/[0.14] hover:text-zinc-200'
              }`}
            >
              {filterMine ? '★ Showing My Plans' : 'Show Only My Plans'}
            </button>
          )}
          <Button variant="secondary" icon={BookOpen} onClick={() => setIsExerciseCatalogOpen(true)}>
            Exercise Library ({exercises.length})
          </Button>
          <Button icon={Plus} onClick={() => setIsModalOpen(true)}>
            Create Workout Plan
          </Button>
        </div>
      </div>

      {/* Workout Plans Grid */}
      {loading ? (
        <Loader message="Loading training plans..." />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No workout plans created yet"
          description="Design targeted strength or cardio workout programs for your members."
          actionText="Create Routine"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans
            .filter((p) => {
              if (isTrainer && filterMine) {
                return p.trainer?._id === user?.trainerId || p.trainer?.user?._id === user?.id;
              }
              return true;
            })
            .map((p) => (
            <div key={p._id} className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between hover:border-white/[0.14] transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Badge variant={p.level}>{p.level}</Badge>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white tracking-tight mt-1.5">{p.name}</h3>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">{p.goal}</p>
                  </div>
                  {(isAdmin || (isTrainer && (p.trainer?._id === user?.trainerId || p.trainer?.user?._id === user?.id))) && (
                    <button
                      onClick={() => handleDeletePlan(p._id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete Routine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 py-2.5 border-y border-zinc-200 dark:border-white/[0.06] mb-3">
                  <span>
                    Assigned to: <strong className="text-zinc-900 dark:text-zinc-200">{p.member?.user?.name || 'Athlete'}</strong>
                  </span>
                  {p.trainer && (
                    <span>
                      Coach: <strong className="text-cyan-500 dark:text-cyan-400">{p.trainer.user?.name}</strong>
                    </span>
                  )}
                </div>

                {/* Exercises list */}
                <div className="space-y-2 mt-2">
                  <p className="text-[10px] uppercase font-medium text-zinc-500 dark:text-zinc-400 tracking-wider">
                    Routine Exercises ({p.exercises?.length || 0})
                  </p>
                  <div className="divide-y divide-zinc-200 dark:divide-white/[0.04] bg-zinc-50 dark:bg-white/[0.02] rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.06]">
                    {p.exercises?.map((ex, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-200">{ex.name}</p>
                          {ex.instructions && (
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 italic">{ex.instructions}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-zinc-400 text-[11px] font-mono">
                          <span>{ex.sets} Sets</span>
                          <span>×</span>
                          <span>{ex.reps} Reps</span>
                          <span>({ex.restSeconds}s rest)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Construct Workout Regimen"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
          <Input
            label="Workout Plan Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. 5-Day Push/Pull/Legs Hypertrophy"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Assign to Member"
              required
              value={formData.member}
              onChange={(e) => setFormData({ ...formData, member: e.target.value })}
            >
              <option value="">Select Member...</option>
              {members.map((m) => {
                const isMyAthlete = isTrainer && (m.trainer?._id === user?.trainerId || m.trainer?.user?._id === user?.id);
                return (
                  <option key={m._id} value={m._id}>
                    {m.user?.name} {isMyAthlete ? '★ (Your Athlete)' : ''} ({m.membershipPlan?.name || 'No Plan'})
                  </option>
                );
              })}
            </Select>

            <Input
              label="Primary Goal"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="Fat Loss, Hypertrophy, Strength"
            />

            <Select
              label="Difficulty Tier"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
          </div>

          {/* Exercise Builder Repeater */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Exercises & Prescription
              </label>
              <Button size="sm" variant="secondary" onClick={handleAddExerciseRow}>
                + Add Exercise
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {formData.exercises.map((ex, index) => (
                <div key={index} className="p-3 bg-white dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-white/[0.08] flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Exercise Name"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      placeholder="Sets"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      value={ex.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      placeholder="Reps"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      value={ex.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Rest(s)"
                      className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.14] rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500"
                      value={ex.restSeconds}
                      onChange={(e) => handleExerciseChange(index, 'restSeconds', e.target.value)}
                    />
                  </div>
                  {formData.exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveExerciseRow(index)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-white/[0.06]">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign Regimen</Button>
          </div>
        </form>
      </Modal>

      {/* Exercise Catalog Modal */}
      <Modal
        isOpen={isExerciseCatalogOpen}
        onClose={() => setIsExerciseCatalogOpen(false)}
        title="Movement & Exercise Encyclopedia"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto">
          {exercises.map((ex) => (
            <div key={ex._id} className="p-3.5 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/[0.06] rounded-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-zinc-900 dark:text-white text-sm tracking-tight">{ex.name}</h4>
                <Badge variant={ex.category}>{ex.category}</Badge>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">Muscle Target: <span className="text-zinc-900 dark:text-zinc-200">{ex.targetMuscle}</span> • Equipment: <span className="text-zinc-900 dark:text-zinc-200">{ex.equipment}</span></p>
              <p className="text-zinc-600 dark:text-zinc-300 mt-1.5 font-normal">{ex.description}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default WorkoutsPage;
