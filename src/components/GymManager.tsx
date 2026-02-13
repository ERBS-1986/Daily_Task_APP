
import React, { useState, useEffect, useRef } from 'react';
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
}

const GymManager: React.FC<GymManagerProps> = ({ workouts, setWorkouts }) => {
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

  const currentWorkout = workouts.find(w => w.day === selectedDate) || {
    day: selectedDate,
    focus: 'Treino personalizado',
    exercises: [],
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'
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

  const handleAddOrEditExercise = () => {
    if (!formName.trim()) {
      showToast("Por favor, informe o nome do exercício.", "error");
      return;
    }

    const newExercise: Exercise = {
      id: isEditMode && editingExerciseId ? editingExerciseId : crypto.randomUUID(),
      name: formName,
      sets: formSets,
      reps: formReps,
      weight: formWeight || undefined,
      completed: false
    };

    let updatedWorkouts: DailyWorkout[];
    const existingWorkoutIdx = workouts.findIndex(w => w.day === selectedDate);

    if (existingWorkoutIdx >= 0) {
      updatedWorkouts = [...workouts];
      if (isEditMode) {
        updatedWorkouts[existingWorkoutIdx].exercises = updatedWorkouts[existingWorkoutIdx].exercises.map(ex =>
          ex.id === editingExerciseId ? { ...newExercise, completed: ex.completed } : ex
        );
      } else {
        updatedWorkouts[existingWorkoutIdx].exercises.push(newExercise);
      }
    } else {
      updatedWorkouts = [...workouts, {
        day: selectedDate,
        focus: 'Treino Personalizado',
        exercises: [newExercise],
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop'
      }];
    }

    setWorkouts(updatedWorkouts);
    localStorage.setItem('workouts', JSON.stringify(updatedWorkouts));
    setShowAddModal(false);
    resetForm();
    showToast(isEditMode ? "Exercício atualizado!" : "Exercício adicionado!", "success");
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

  const deleteExercise = (id: string) => {
    const updated = workouts.map(w => {
      if (w.day === selectedDate) {
        return { ...w, exercises: w.exercises.filter(ex => ex.id !== id) };
      }
      return w;
    });
    setWorkouts(updated);
    localStorage.setItem('workouts', JSON.stringify(updated));
    showToast("Exercício removido.", "info");
  };

  const toggleExerciseComplete = (id: string) => {
    const updated = workouts.map(w => {
      if (w.day === selectedDate) {
        return {
          ...w,
          exercises: w.exercises.map(ex => ex.id === id ? { ...ex, completed: !ex.completed } : ex)
        };
      }
      return w;
    });
    setWorkouts(updated);
    localStorage.setItem('workouts', JSON.stringify(updated));
  };

  const cloneWorkout = (targetDate: string) => {
    if (currentWorkout.exercises.length === 0) return;

    const updated = workouts.filter(w => w.day !== targetDate);
    const clonedWorkout: DailyWorkout = {
      ...currentWorkout,
      day: targetDate,
      exercises: currentWorkout.exercises.map(ex => ({ ...ex, id: crypto.randomUUID(), completed: false }))
    };

    const final = [...updated, clonedWorkout];
    setWorkouts(final);
    localStorage.setItem('workouts', JSON.stringify(final));
    showToast(`Treino clonado para ${targetDate}!`, "success");
  };

  const progress = currentWorkout.exercises.length > 0
    ? (currentWorkout.exercises.filter(ex => ex.completed).length / currentWorkout.exercises.length) * 100
    : 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Header & Weekly Navigation */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-indigo-500" />
            GymFlow Agenda
          </h2>
          <p className="text-slate-400">Gerencie seus treinos e acompanhe seu progresso diário.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {weekDays.map((item) => (
            <button
              key={item.date}
              onClick={() => setSelectedDate(item.date)}
              className={`
                flex flex-col items-center gap-1 min-w-[110px] p-4 rounded-2xl border transition-all
                ${selectedDate === item.date
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}
              `}
            >
              <span className="text-sm font-black">{item.dayName}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${workouts.find(w => w.day === item.date)?.exercises.length ? 'bg-indigo-400' : 'bg-slate-700'}`}></div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block">Treino do dia</span>
                <h3 className="text-3xl font-black text-white">{currentWorkout.focus}</h3>
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
                  <p className="text-xl font-black text-white">{Math.round(progress)}%</p>
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
                    className="mt-6 p-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
                  >
                    <Plus className="w-8 h-8" />
                  </button>
                </div>
              ) : (
                currentWorkout.exercises.map(ex => (
                  <div
                    key={ex.id}
                    className={`
                      flex items-center justify-between p-5 rounded-2xl border transition-all
                      ${ex.completed ? 'bg-indigo-600/5 border-indigo-500/30' : 'bg-slate-950/20 border-slate-800 hover:border-slate-700'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleExerciseComplete(ex.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${ex.completed ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-700 text-transparent hover:border-indigo-500'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <h5 className={`font-bold transition-colors ${ex.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{ex.name}</h5>
                        <p className="text-xs text-slate-500 font-medium">{ex.sets} séries • {ex.reps} reps {ex.weight && `• ${ex.weight}kg`}</p>
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
          <div className={`bg-slate-900 border transition-all duration-500 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 ${isResting ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-slate-800'}`}>
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
                <span className={`text-4xl font-black tabular-nums transition-colors ${isResting ? 'text-amber-500' : 'text-slate-200'}`}>
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
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] space-y-6">
            <h4 className="font-black text-lg text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-500" /> Histórico & Dicas
            </h4>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Dica de Hoje</p>
                <p className="text-sm text-slate-300 font-medium italic">"A constância supera a intensidade. Não pare até terminar todas as séries!"</p>
              </div>
              <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-500/10">
                <p className="text-[10px] text-indigo-400 font-bold uppercase mb-1">Resumo Semanal</p>
                <p className="text-sm text-slate-300 font-bold">Treinos realizados: {workouts.filter(w => w.exercises.some(ex => ex.completed)).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => { setShowAddModal(false); resetForm(); }}></div>
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white">{isEditMode ? 'Editar Exercício' : 'Novo Exercício'}</h3>
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
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Séries</label>
                  <input
                    type="number"
                    value={formSets}
                    onChange={(e) => setFormSets(parseInt(e.target.value))}
                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Repetições</label>
                  <input
                    type="text"
                    value={formReps}
                    onChange={(e) => setFormReps(e.target.value)}
                    placeholder="Ex: 12 ou 10-12"
                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleAddOrEditExercise}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
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
