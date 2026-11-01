import React, { useEffect, useState } from 'react';
import { workoutService } from '../../services/workoutService';
import { Dumbbell, Clock, Flame, Repeat, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';

const MemberWorkoutPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        setLoading(true);
        const res = await workoutService.getMyPlan();
        if (res.success) setPlans(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkout();
  }, []);

  if (loading) return <Loader message="Accessing prescribed routine..." />;

  const activePlan = plans.length > 0 ? plans[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
          <Dumbbell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          My Workout Regimen
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Prescribed biomechanics, sets, repetition targets, and rest intervals
        </p>
      </div>

      {!activePlan ? (
        <EmptyState
          icon={Dumbbell}
          title="No Active Workout Regimen"
          description="Your personal trainer has not assigned a custom routine yet. Speak with your coach during your next training session."
        />
      ) : (
        <div className="space-y-6">
          {/* Plan Header Card */}
          <div className="glass-card rounded-2xl p-6 border border-zinc-200 dark:border-white/[0.08]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <Badge variant={activePlan.level}>{activePlan.level}</Badge>
                  <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">{activePlan.goal}</span>
                </div>
                <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white mt-2 tracking-tight">{activePlan.name}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">{activePlan.notes}</p>
              </div>

              {activePlan.trainer && (
                <div className="p-3.5 bg-zinc-50/80 dark:bg-white/[0.03] rounded-xl border border-zinc-200 dark:border-white/[0.08] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/20">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="text-zinc-500 text-[10px] uppercase font-semibold tracking-wider">Prescribing Coach</p>
                    <p className="font-semibold text-zinc-900 dark:text-white mt-0.5">{activePlan.trainer?.user?.name || 'Staff Coach'}</p>
                    <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">{activePlan.trainer?.specialization || 'General Fitness'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlan.exercises?.map((ex, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-5 border border-zinc-200 dark:border-white/[0.08] flex flex-col justify-between hover:border-white/[0.14] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-white/[0.06] text-indigo-600 dark:text-zinc-300 font-bold flex items-center justify-center text-xs border border-indigo-100 dark:border-white/[0.08]">
                        {index + 1}
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">{ex.name}</h3>
                    </div>
                  </div>

                  {ex.instructions && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-white/[0.02] p-3 rounded-xl border border-zinc-200 dark:border-white/[0.06] mb-4 leading-relaxed">
                      {ex.instructions}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-3 border-t border-zinc-200 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.01] rounded-xl p-2.5">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 block tracking-wider">Sets</span>
                    <span className="text-base font-extrabold text-zinc-900 dark:text-white mt-0.5 block">{ex.sets}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 block tracking-wider">Reps</span>
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 block">{ex.reps}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-zinc-500 block tracking-wider">Rest</span>
                    <span className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5 block">{ex.restSeconds}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberWorkoutPage;
