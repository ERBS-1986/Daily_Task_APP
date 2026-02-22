
import React, { useState, useMemo } from 'react';
import { Habit } from '../types';
import { Plus, Flame, TrendingUp, X, Loader2, Trash2, Pencil, History, Filter, CheckCircle2 } from 'lucide-react';
import Checkbox from './Checkbox';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface HabitTrackerProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  cardClass?: string;
  isLight?: boolean;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, setHabits, cardClass, isLight }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newFrequency, setNewFrequency] = useState<'daily' | 'weekly'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [historyFilter, setHistoryFilter] = useState<string>('all');

  const handleAddOrEditHabit = async () => {
    if (!newTitle.trim() || !user) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && editingHabitId) {
        const { error } = await supabase
          .from('habits')
          .update({ title: newTitle, frequency: newFrequency })
          .eq('id', editingHabitId);

        if (error) throw error;

        setHabits(habits.map(h => h.id === editingHabitId ? { ...h, title: newTitle, frequency: newFrequency } : h));
        showToast('Hábito atualizado!', 'success');
      } else {
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
          showToast('Hábito criado!', 'success');
        }
      }
      resetForm();
    } catch (error) {
      console.error('Error saving habit:', error);
      showToast('Erro ao salvar hábito.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewFrequency('daily');
    setIsEditMode(false);
    setEditingHabitId(null);
    setShowAddModal(false);
  };

  const openEditModal = (habit: Habit) => {
    setNewTitle(habit.title);
    setNewFrequency(habit.frequency);
    setIsEditMode(true);
    setEditingHabitId(habit.id);
    setShowAddModal(true);
  };

  const toggleHabitCompletion = async (id: string, dateStr: string) => {
    const habitIndex = habits.findIndex(h => h.id === id);
    if (habitIndex === -1) return;

    const habit = habits[habitIndex];
    const isDone = habit.history.includes(dateStr);
    const today = new Date().toISOString().split('T')[0];

    let newHistory: string[];
    let newStreak = habit.streak;
    let newLastCompleted = habit.lastCompleted;

    if (isDone) {
      newHistory = habit.history.filter(d => d !== dateStr);
      if (dateStr === today) {
        newStreak = Math.max(0, habit.streak - 1);
        // Find previous last completed
        const sortedHistory = [...newHistory].sort((a, b) => b.localeCompare(a));
        newLastCompleted = sortedHistory[0] || undefined;
      }
    } else {
      newHistory = [...habit.history, dateStr];
      if (dateStr === today) {
        newStreak = habit.streak + 1;
        newLastCompleted = today;
      }
    }

    const updatedHabit = {
      ...habit,
      streak: newStreak,
      lastCompleted: newLastCompleted,
      history: newHistory
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
          last_completed: updatedHabit.lastCompleted || null,
          history: updatedHabit.history
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating habit:', error);
      // Revert
      newHabits[habitIndex] = habit;
      setHabits([...newHabits]);
      showToast('Erro ao atualizar hábito.', 'error');
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
      showToast('Hábito removido.', 'info');
    } catch (error) {
      console.error('Error deleting habit:', error);
      setHabits(prevHabits);
      showToast('Erro ao remover hábito.', 'error');
    }
  };

  const historyDays = useMemo(() => {
    const days = [];
    const allHistoryDates = habits.flatMap(h => h.history) as string[];
    const uniqueDates = Array.from(new Set(allHistoryDates)).sort((a, b) => b.localeCompare(a));

    return uniqueDates.map(date => {
      const logs = habits
        .filter(h => h.history.includes(date))
        .filter(h => historyFilter === 'all' || h.id === historyFilter);

      if (logs.length === 0 && historyFilter !== 'all') return null;
      if (logs.length === 0) return null;

      return { date, logs };
    }).filter(Boolean);
  }, [habits, historyFilter]);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>Hábitos Ativos</h2>
          <p className={`${isLight ? 'text-black/60' : 'text-white/60'} text-sm`}>Consistência é a chave para o sucesso.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistoryModal(true)}
            className={`p-3 rounded-2xl transition-colors shadow-lg ${isLight ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}
            title="Histórico"
          >
            <History className="w-6 h-6" />
          </button>
          <button
            onClick={() => { setShowAddModal(true); setIsEditMode(false); }}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-colors shadow-lg shadow-indigo-900/20"
            title="Adicionar Hábito"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map(habit => {
          const todayStr = new Date().toISOString().split('T')[0];
          const isCompletedToday = habit.history.includes(todayStr);

          return (
            <div key={habit.id} className={`group relative p-6 rounded-[2.5rem] border transition-all shadow-xl backdrop-blur-2xl ${cardClass || 'bg-slate-900 border-slate-800'} ${isLight ? 'border-white/50 shadow-indigo-100/20' : 'border-slate-800 shadow-black/20'}`}>
              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={() => openEditModal(habit)}
                  className={`p-2 opacity-0 group-hover:opacity-100 transition-all ${isLight ? 'text-slate-400 hover:text-indigo-500' : 'text-slate-600 hover:text-indigo-400'}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className={`p-2 opacity-0 group-hover:opacity-100 transition-all ${isLight ? 'text-slate-400 hover:text-rose-500' : 'text-slate-600 hover:text-rose-500'}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`
                    p-3 rounded-2xl flex items-center justify-center transition-colors
                    ${isCompletedToday ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}
                  `}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className={`font-black text-lg ${isLight ? 'text-black' : 'text-white'}`}>{habit.title}</h4>
                    <p className={`text-xs uppercase font-black tracking-widest ${isLight ? 'text-indigo-600/60' : 'text-white/40'}`}>
                      {habit.frequency === 'daily' ? 'Diariamente' : 'Semanalmente'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full text-sm font-bold">
                  <Flame className="w-4 h-4" />
                  {habit.streak}
                </div>
              </div>

              <div className="flex gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
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
                        w-10 h-10 rounded-2xl flex items-center justify-center border transition-all duration-500
                        ${done
                          ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                          : `${isLight ? 'border-indigo-100 bg-white/50' : 'border-slate-800 bg-slate-950/50'}`}
                        ${isToday && !done ? 'border-indigo-500 ring-2 ring-indigo-500/20' : ''}
                      `}>
                        <Checkbox
                          checked={done}
                          onChange={() => toggleHabitCompletion(habit.id, dateStr)}
                          className={done ? 'bg-transparent border-transparent' : ''}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
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

      {/* Add/Edit Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={resetForm}></div>
          <div className={`relative w-full max-w-sm border shadow-2xl p-8 animate-in zoom-in-95 duration-200 backdrop-blur-[40px] rounded-[2.5rem] ${isLight ? 'bg-white/90 border-white/40' : 'bg-slate-900/90 border-slate-700/50'}`}>
            <h3 className={`text-2xl font-black mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isEditMode ? 'Editar Hábito' : 'Novo Hábito'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: Beber Água, Ler Livro..."
                  className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Frequência</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value as 'daily' | 'weekly')}
                  className={`w-full px-5 py-4 border rounded-2xl focus:outline-none transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                >
                  <option value="daily">Diariamente</option>
                  <option value="weekly">Semanalmente</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={resetForm}
                  className={`flex-1 py-3 font-bold rounded-xl transition-colors ${isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddOrEditHabit}
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowHistoryModal(false)}></div>
          <div className={`relative w-full max-w-lg border shadow-2xl p-8 animate-in zoom-in-95 duration-200 backdrop-blur-[40px] rounded-[2.5rem] flex flex-col max-h-[80vh] ${isLight ? 'bg-white/90 border-white/40' : 'bg-slate-900/90 border-slate-700/50'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Histórico de Hábitos</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 bg-slate-800/20 p-2 rounded-2xl border border-white/5">
              <Filter className="w-4 h-4 text-slate-500 ml-2" />
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-400 focus:outline-none flex-1"
              >
                <option value="all">Todos os Hábitos</option>
                {habits.map(h => (
                  <option key={h.id} value={h.id}>{h.title}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar space-y-6">
              {historyDays.length > 0 ? (
                historyDays.map((day: any) => (
                  <div key={day.date} className="space-y-3">
                    <p className="text-xs font-black text-indigo-500 uppercase tracking-widest pl-2">
                      {new Date(day.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="space-y-2">
                      {day.logs.map((habit: Habit) => (
                        <div key={habit.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                            </div>
                            <span className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>{habit.title}</span>
                          </div>
                          <div className="flex items-center gap-1 text-rose-500 text-[10px] font-bold">
                            <Flame className="w-3 h-3" />
                            {habit.streak}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 opacity-50">
                  <History className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                  <p className="text-sm font-bold">Nenhum registro encontrado para o filtro selecionado.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
