
import React, { useState } from 'react';
import { WeeklyGoal } from '../types';
import { Target, Plus, ChevronRight, Award, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface GoalsManagerProps {
  goals: WeeklyGoal[];
  setGoals: React.Dispatch<React.SetStateAction<WeeklyGoal[]>>;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ goals, setGoals }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState<number>(10);
  const [newUnit, setNewUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddGoal = async () => {
    if (!newTitle.trim() || !user) return;
    setIsSubmitting(true);

    try {
      const newGoalPayload = {
        user_id: user.id,
        title: newTitle,
        target: newTarget,
        current: 0,
        unit: newUnit || 'unidades'
      };

      const { data, error } = await supabase
        .from('goals')
        .insert(newGoalPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setGoals([...goals, data as WeeklyGoal]);
        setNewTitle('');
        setNewTarget(10);
        setNewUnit('');
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding goal:', error);
      showToast('Erro ao criar meta.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateProgress = async (id: string, amount: number) => {
    const goalIndex = goals.findIndex(g => g.id === id);
    if (goalIndex === -1) return;

    const goal = goals[goalIndex];
    const newCurrent = Math.min(goal.current + amount, goal.target);

    // Optimistic Update
    const updatedGoal = { ...goal, current: newCurrent };
    const newGoals = [...goals];
    newGoals[goalIndex] = updatedGoal;
    setGoals(newGoals);

    try {
      const { error } = await supabase
        .from('goals')
        .update({ current: newCurrent })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating goal:', error);
      // Revert
      newGoals[goalIndex] = goal;
      setGoals([...newGoals]);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!confirm('Deseja excluir esta meta?')) return;

    const prevGoals = [...goals];
    setGoals(goals.filter(g => g.id !== id));

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting goal:', error);
      setGoals(prevGoals);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
            <Target className="w-7 h-7 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Metas Semanais</h2>
            <p className="text-slate-400 text-sm">Grandes objetivos divididos em pequenos passos.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-amber-500/5"
        >
          <Plus className="w-5 h-5" />
          Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map(goal => {
          const progress = (goal.current / goal.target) * 100;
          const isFinished = goal.current >= goal.target;

          return (
            <div key={goal.id} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl space-y-6 relative overflow-hidden group hover:border-amber-500/30 transition-colors">
              <button
                onClick={() => deleteGoal(goal.id)}
                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all z-20"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h4 className="text-xl font-bold text-slate-100 mb-1">{goal.title}</h4>
                  <p className="text-sm text-slate-400">Objetivo para esta semana</p>
                </div>
                {isFinished && (
                  <div className="p-2 bg-amber-500/20 rounded-xl">
                    <Award className="w-6 h-6 text-amber-500" />
                  </div>
                )}
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-black text-slate-100">
                    {goal.current} <span className="text-sm font-bold text-slate-500 uppercase">{goal.unit}</span>
                  </span>
                  <span className="text-slate-400 font-bold">de {goal.target}</span>
                </div>

                <div className="h-4 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-1000 ease-out rounded-full ${isFinished ? 'bg-amber-500' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2 relative z-10">
                {[1, 5, 10].map(amt => (
                  <button
                    key={amt}
                    onClick={() => updateProgress(goal.id, amt)}
                    disabled={isFinished}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    +{amt}
                  </button>
                ))}
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">Nenhuma meta definida para esta semana.</p>
            <button onClick={() => setShowAddModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold mt-2">
              + Criar nova meta
            </button>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6">Nova Meta Semanal</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Ler Livros, Correr..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Meta (Númerica)</label>
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Unidade</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Ex: km, pgs..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddGoal}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Meta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsManager;
