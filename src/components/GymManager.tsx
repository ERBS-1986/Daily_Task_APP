
import React, { useState, useEffect, useRef } from 'react';
import Checkbox from './Checkbox';
import { DailyWorkout, Exercise } from '../types';
import {
  Dumbbell, Plus, CheckCircle2, Circle, Calendar,
  Flame, Activity, ChevronRight, Save, Play,
  RotateCcw, Pause, Timer, X, Pencil, Trash2,
  Sparkles, History, Copy
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GymManagerProps {
  workouts: DailyWorkout[];
  setWorkouts: React.Dispatch<React.SetStateAction<DailyWorkout[]>>;
  cardClass?: string;
  isLight?: boolean;
}

const GymManager: React.FC<GymManagerProps> = ({ workouts, setWorkouts, cardClass, isLight }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSets, setFormSets] = useState(3);
  const [formReps, setFormReps] = useState('12');
  const [formWeight, setFormWeight] = useState('');

  // Rest Timer State
  const [restTime, setRestTime] = useState(60);
  const [maxRestTime, setMaxRestTime] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate 7 days starting from today
  const [weekDays, setWeekDays] = useState<{ dayName: string, date: string }[]>([]);

  useEffect(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '');
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const fullDate = d.toISOString().split('T')[0];
      days.push({ dayName: `${dayName} ${dateStr}`, date: fullDate });
    }
    setWeekDays(days);
  }, []);

  const [currentWorkout, setCurrentWorkout] = useState<DailyWorkout>({
    day: selectedDate,
    focus: 'Treino personalizado',
    exercises: [],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'
  });

  useEffect(() => {
    if (user) {
      fetchWorkout(selectedDate);
    }
  }, [selectedDate, user]);

  const fetchWorkout = async (date: string) => {
    try {
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select(`
          id,
          day,
          focus,
          image,
          exercises (*)
        `)
        .eq('user_id', user?.id)
        .eq('day', date)
        .single();

      if (workoutError && workoutError.code !== 'PGRST116') throw workoutError;

      if (workoutData) {
        setCurrentWorkout({
          ...workoutData,
          exercises: workoutData.exercises || []
        });
      } else {
        setCurrentWorkout({
          day: date,
          focus: 'Treino personalizado',
          exercises: [],
          image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'
        });
      }
    } catch (err) {
      console.error('Error fetching workout:', err);
    }
  };

  // Timer Sound logic
  useEffect(() => {
    if (isResting && restTime > 0) {
      timerRef.current = window.setInterval(() => {
        setRestTime(prev => prev - 1);
      }, 1000);
    } else if (restTime === 0 && isResting) {
      handleTimerEnd();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isResting, restTime]);

  const handleTimerEnd = () => {
    setIsResting(false);
    playAlertSound();
    showToast("Descanso Finalizado! 🏋️", "success");
    setRestTime(maxRestTime);
  };

  const playAlertSound = () => {
    try {
      // Beep sound alternative if no file
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.type = 'sine';
      oscillator.frequency.value = 440;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.1);
      oscillator.start(context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 3);
      oscillator.stop(context.currentTime + 3);
    } catch (e) {
      console.warn("Could not play sound", e);
    }
  };

  const toggleRest = () => setIsResting(!isResting);
  const resetRest = () => {
    setIsResting(false);
    setRestTime(maxRestTime);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddOrEditExercise = async () => {
    if (!formName.trim() || !user) {
      showToast("Por favor, informe o nome do exercício.", "error");
      return;
    }

    try {
      let workoutId = (currentWorkout as any).id;

      // 1. Create workout if not exists
      if (!workoutId) {
        const { data: newWorkout, error: wError } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            day: selectedDate,
            focus: currentWorkout.focus || 'Treino Personalizado',
            image: currentWorkout.image
          })
          .select()
          .single();

        if (wError) throw wError;
        workoutId = newWorkout.id;
      }

      // 2. Insert/Update exercise
      const exercisePayload = {
        workout_id: workoutId,
        name: formName,
        sets: formSets,
        reps: formReps,
        weight: formWeight || null,
        completed: false
      };

      if (isEditMode && editingExerciseId) {
        const { error } = await supabase
          .from('exercises')
          .update(exercisePayload)
          .eq('id', editingExerciseId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert(exercisePayload);
        if (error) throw error;
      }

      await fetchWorkout(selectedDate);
      setShowAddModal(false);
      resetForm();
      showToast(isEditMode ? "Exercício atualizado!" : "Exercício adicionado!", "success");
    } catch (err) {
      console.error('Error saving exercise:', err);
      showToast("Erro ao salvar exercício.", "error");
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormSets(3);
    setFormReps('12');
    setFormWeight('');
    setIsEditMode(false);
    setEditingExerciseId(null);
  };

  const openEditModal = (ex: Exercise) => {
    setFormName(ex.name);
    setFormSets(ex.sets);
    setFormReps(ex.reps);
    setFormWeight(ex.weight || '');
    setIsEditMode(true);
    setEditingExerciseId(ex.id);
    setShowAddModal(true);
  };

  const deleteExercise = async (id: string) => {
    if (!confirm('Deseja remover este exercício?')) return;
    try {
      const { error } = await supabase.from('exercises').delete().eq('id', id);
      if (error) throw error;
      await fetchWorkout(selectedDate);
      showToast("Exercício removido.", "info");
    } catch (err) {
      showToast("Erro ao remover exercício.", "error");
    }
  };

  const toggleExerciseComplete = async (id: string, currentCompleted: boolean) => {
    try {
      const { error } = await supabase.from('exercises').update({ completed: !currentCompleted }).eq('id', id);
      if (error) throw error;
      await fetchWorkout(selectedDate);
    } catch (err) {
      showToast("Erro ao atualizar exercício.", "error");
    }
  };

  const cloneWorkout = async (targetDate: string) => {
    if (currentWorkout.exercises.length === 0 || !user) return;

    try {
      showToast("Clonando treino...", "info");

      // 1. Criar o novo treino para o dia alvo
      const { data: newWorkout, error: wError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          day: targetDate,
          focus: currentWorkout.focus || 'Treino Personalizado',
          image: currentWorkout.image
        })
        .select()
        .single();

      if (wError) throw wError;

      // 2. Clonar todos os exercícios para o novo workout_id
      const exercisePayloads = currentWorkout.exercises.map(ex => ({
        workout_id: newWorkout.id,
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight || null,
        completed: false
      }));

      const { error: eError } = await supabase
        .from('exercises')
        .insert(exercisePayloads);

      if (eError) throw eError;

      showToast(`Treino clonado para ${targetDate}!`, "success");
      // Opcional: navegar para o dia alvo ou atualizar a lista global se necessário
      // fetchWorkout(selectedDate); // Se quiser atualizar o dia atual
    } catch (err) {
      console.error('Error cloning workout:', err);
      showToast("Erro ao clonar treino.", "error");
    }
  };

  const progress = currentWorkout.exercises.length > 0
    ? (currentWorkout.exercises.filter(ex => ex.completed).length / currentWorkout.exercises.length) * 100
    : 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Header & Weekly Navigation */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className={`text-3xl font-black flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Dumbbell className="w-8 h-8 text-indigo-500" />
            GymFlow Agenda
          </h2>
          <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} font-medium`}>Gerencie seus treinos e acompanhe seu progresso diário.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {weekDays.map((item) => (
            <button
              key={item.date}
              onClick={() => setSelectedDate(item.date)}
              className={`
                flex flex-col items-center gap-1 min-w-[110px] p-4 rounded-2xl border transition-all backdrop-blur-md
                ${selectedDate === item.date
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/30'
                  : `${isLight ? 'bg-white/50 border-white/20 text-slate-500 hover:border-indigo-200' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
              `}
            >
              <span className="text-sm font-black uppercase tracking-widest">{item.dayName}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${workouts.find(w => w.day === item.date)?.exercises.length ? 'bg-indigo-400' : (isLight ? 'bg-indigo-100' : 'bg-slate-700')}`}></div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className={`${cardClass || 'bg-slate-900 border-slate-800'} border p-8 rounded-[3rem] relative overflow-hidden group backdrop-blur-2xl shadow-xl ${isLight ? 'border-white/50' : 'border-slate-800'}`}>
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <span className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-1 block">Treino do dia</span>
                <h3 className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{currentWorkout.focus}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition-all"
                  title="Adicionar Exercício"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <div className="text-right ml-4">
                  <p className="text-xs text-slate-500 font-bold uppercase">Progresso</p>
                  <p className={`text-xl font-black ${document.documentElement.classList.contains('dark') ? 'text-black' : (isLight ? 'text-indigo-600' : 'text-white')}`}>{Math.round(progress)}%</p>
                </div>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full mb-8 relative z-10 overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-4 relative z-10">
              {currentWorkout.exercises.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/50 rounded-3xl border border-dashed border-slate-800">
                  <Dumbbell className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold text-lg">Nenhum treino encontrado</p>
                  <p className="text-slate-600 text-sm mt-2 max-w-xs mx-auto">Não encontramos treinos para este dia. Adicione um novo treino para começar.</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-6 p-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                </div>
              ) : (
                currentWorkout.exercises.map(ex => (
                  <div
                    key={ex.id}
                    className={`
                        flex items-center justify-between p-5 rounded-2xl border transition-all backdrop-blur-md
                        ${ex.completed
                        ? 'opacity-60 bg-indigo-500/5 border-indigo-500/20'
                        : `${isLight ? 'bg-white/40 border-white/60 hover:border-indigo-200' : 'bg-slate-950/20 border-slate-800 hover:border-slate-700'}`}
                      `}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={ex.completed}
                        onChange={() => toggleExerciseComplete(ex.id, ex.completed)}
                      />
                      <div>
                        <h5 className={`font-bold transition-colors ${ex.completed ? 'text-slate-500 line-through' : (document.documentElement.classList.contains('dark') ? 'text-black' : 'text-slate-100')}`}>{ex.name}</h5>
                        <p className={`text-xs font-medium ${document.documentElement.classList.contains('dark') ? 'text-black/60' : 'text-slate-500'}`}>{ex.sets} séries • {ex.reps} reps {ex.weight && `• ${ex.weight}kg`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(ex)} className="p-2 text-slate-600 hover:text-indigo-400 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteExercise(ex.id)} className="p-2 text-slate-600 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {currentWorkout.exercises.length > 0 && (
              <div className="mt-8 flex items-center justify-between p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                <div className="flex items-center gap-2 text-indigo-400">
                  <History className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Reutilizar treino</span>
                </div>
                <select
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  onChange={(e) => cloneWorkout(e.target.value)}
                  value=""
                >
                  <option value="" disabled>Copiar para...</option>
                  {weekDays.filter(d => d.date !== selectedDate).map(d => (
                    <option key={d.date} value={d.date}>{d.dayName}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Rest Timer Interface */}
          <div className={`border transition-all duration-500 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-2xl shadow-xl ${isResting ? 'border-amber-500/50 shadow-amber-500/10' : (isLight ? 'bg-white/60 border-white/50 shadow-indigo-100/10' : 'bg-slate-900 border-slate-800')}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isResting ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                <Timer className={`w-6 h-6 ${isResting ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1 min-w-[150px]">
                <p className="text-sm font-bold text-white">Descanso Regressivo</p>
                <input
                  type="range"
                  min="5"
                  max="600"
                  step="5"
                  value={maxRestTime}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMaxRestTime(val);
                    if (!isResting) setRestTime(val);
                  }}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <span className={`text-5xl font-black tabular-nums transition-colors ${isResting ? 'text-amber-500' : (isLight ? 'text-slate-900' : 'text-slate-200')}`}>
                  {formatTime(restTime)}
                </span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tempo</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={resetRest}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all active:scale-90"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleRest}
                  className={`p-4 rounded-2xl transition-all active:scale-95 shadow-lg ${isResting ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-amber-500 text-slate-900 shadow-amber-500/20'}`}
                >
                  {isResting ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit">
          <div className={`border p-8 rounded-[3rem] space-y-6 backdrop-blur-2xl shadow-xl ${cardClass || 'bg-slate-900 border-slate-800'} ${isLight ? 'border-white/50' : 'border-slate-800'}`}>
            <h4 className={`font-black text-xl flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <History className="w-6 h-6 text-indigo-500" /> Histórico
            </h4>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              {workouts.filter(w => w.day < selectedDate && w.exercises.length > 0).length > 0 ? (
                workouts.filter(w => w.day < selectedDate && w.exercises.length > 0).sort((a, b) => b.day.localeCompare(a.day)).map(w => (
                  <div key={w.day} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer" onClick={() => setSelectedDate(w.day)}>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">{new Date(w.day).toLocaleDateString('pt-BR')}</p>
                    <p className={`text-sm font-bold ${document.documentElement.classList.contains('dark') ? 'text-black' : 'text-slate-200'}`}>{w.focus}</p>
                    <p className={`text-[10px] mt-1 ${document.documentElement.classList.contains('dark') ? 'text-black/60' : 'text-slate-500'}`}>{w.exercises.filter(e => e.completed).length}/{w.exercises.length} concluídos</p>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-sm text-slate-500 italic">Nenhum treino passado encontrado no sistema.</p>
                </div>
              )}

              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mt-4">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Dica de Hoje</p>
                <p className="text-sm text-slate-300 font-medium italic">"A constância supera a intensidade. Não pare até terminar todas as séries!"</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => { setShowAddModal(false); resetForm(); }}></div>
          <div className={`relative w-full max-w-md border rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 backdrop-blur-2xl ${isLight ? 'bg-white/90 border-white/20' : 'bg-slate-900 border-slate-800'}`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isEditMode ? 'Editar Exercício' : 'Novo Exercício'}</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome do Exercício</label>
                <input
                  autoFocus
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Supino Reto, Agachamento..."
                  className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Séries</label>
                  <input
                    type="number"
                    value={formSets}
                    onChange={(e) => setFormSets(parseInt(e.target.value))}
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Repetições</label>
                  <input
                    type="text"
                    value={formReps}
                    onChange={(e) => setFormReps(e.target.value)}
                    placeholder="Ex: 12 ou 10-12"
                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Peso (kg) - Opcional</label>
                <input
                  type="text"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  placeholder="Ex: 40"
                  className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleAddOrEditExercise}
                  className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Salvar Alterações' : 'Adicionar ao Treino'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymManager;
