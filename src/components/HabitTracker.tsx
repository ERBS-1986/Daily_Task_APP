
import React, { useState } from 'react';
import { Habit } from '../types';
import { Plus, Flame, CheckCircle2, Circle, TrendingUp, X, Loader2, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface HabitTrackerProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, setHabits }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddHabit = async () => {
    if (!newTitle.trim() || !user) return;
    setIsSubmitting(true);

    try {
      const newHabitPayload = {
        user_id: user.id,
        title: newTitle,
        frequency: newFrequency,
        streak: 0,
        history: [],
        last_completed: null
      };

      const { data, error } = await supabase
        .from('habits')
        .insert(newHabitPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newHabit: Habit = {
          id: data.id,
          title: data.title,
          frequency: data.frequency,
          streak: data.streak,
          history: data.history || [],
          lastCompleted: data.last_completed
        };
        setHabits([...habits, newHabit]);
        setNewTitle('');
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      showToast('Erro ao criar hábito.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeHabit = async (id: string) => {
    const habitIndex = habits.findIndex(h => h.id === id);
    if (habitIndex === -1) return;

    const habit = habits[habitIndex];
    const today = new Date().toISOString().split('T')[0];

    if (habit.lastCompleted === today) return; // Already completed today

    const updatedHabit = {
      ...habit,
      streak: habit.streak + 1,
      lastCompleted: today,
      history: [...habit.history, today]
    };

    // Optimistic Update
    const newHabits = [...habits];
    newHabits[habitIndex] = updatedHabit;
    setHabits(newHabits);

    try {
      const { error } = await supabase
        .from('habits')
        .update({
          streak: updatedHabit.streak,
          last_completed: today,
          history: updatedHabit.history
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating habit:', error);
      // Revert
      newHabits[habitIndex] = habit;
      setHabits([...newHabits]);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!confirm('Deseja excluir este hábito?')) return;

    // Optimistic
    const prevHabits = [...habits];
    setHabits(habits.filter(h => h.id !== id));

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting habit:', error);
      setHabits(prevHabits);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Hábitos Ativos</h2>
          <p className="text-slate-400 text-sm">Consistência é a chave para o sucesso.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl transition-colors shadow-lg shadow-slate-900/20"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map(habit => {
          const isCompletedToday = habit.lastCompleted === new Date().toISOString().split('T')[0];

          return (
            <div key={habit.id} className="group relative bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all shadow-sm">
              <button
                onClick={() => deleteHabit(habit.id)}
                className="absolute top-4 right-4 p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`
                    p-3 rounded-2xl flex items-center justify-center transition-colors
                    ${isCompletedToday ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}
                  `}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">{habit.title}</h4>
                    <p className="text-xs text-slate-500 uppercase font-semibold">{habit.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full text-sm font-bold">
                  <Flame className="w-4 h-4" />
                  {habit.streak}
                </div>
              </div>

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {[...Array(7)].map((_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - (6 - i));
                  const dateStr = date.toISOString().split('T')[0];
                  const done = habit.history.includes(dateStr);
                  const isToday = i === 6;

                  return (
                    <div key={i} className="flex flex-col items-center gap-2 min-w-[40px]">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">
                        {date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}
                      </span>
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                        ${done ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-800 bg-slate-950/50'}
                        ${isToday && !done ? 'border-indigo-500' : ''}
                      `}>
                        {done && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                disabled={isCompletedToday}
                onClick={() => completeHabit(habit.id)}
                className={`
                  w-full py-3 rounded-xl font-bold transition-all
                  ${isCompletedToday
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}
                `}
              >
                {isCompletedToday ? 'Concluído Hoje' : 'Marcar como Feito'}
              </button>
            </div>
          );
        })}

        {habits.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">Nenhum hábito ativo.</p>
            <button onClick={() => setShowAddModal(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold mt-2">
              + Criar meu primeiro hábito
            </button>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6">Novo Hábito</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Beber Água, Ler Livro..."
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frequência</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as 'daily' | 'weekly')}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddHabit}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
