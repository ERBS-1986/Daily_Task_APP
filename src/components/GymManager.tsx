
import React, { useState, useEffect, useRef } from 'react';
import { DailyWorkout, Exercise } from '../types';
import { Dumbbell, Plus, CheckCircle2, Circle, Calendar, Flame, Activity, ChevronRight, Save, Play, RotateCcw, Pause, Timer } from 'lucide-react';

interface GymManagerProps {
  workouts: DailyWorkout[];
  setWorkouts: React.Dispatch<React.SetStateAction<DailyWorkout[]>>;
}

const GymManager: React.FC<GymManagerProps> = ({ workouts, setWorkouts }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  // Rest Timer State
  const [restTime, setRestTime] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const timerRef = useRef<number | null>(null);

  const currentWorkout = workouts[selectedDay];
  const activeExercise = currentWorkout.exercises.find(ex => ex.id === activeExerciseId);

  // Timer Logic
  useEffect(() => {
    if (isResting && restTime > 0) {
      timerRef.current = window.setInterval(() => {
        setRestTime(prev => prev - 1);
      }, 1000);
    } else if (restTime === 0) {
      setIsResting(false);
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Descanso Finalizado! 🏋️", { body: "Hora da próxima série!" });
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isResting, restTime]);

  const toggleRest = () => setIsResting(!isResting);
  const resetRest = (seconds: number = 60) => {
    setIsResting(false);
    setRestTime(seconds);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const toggleExercise = (exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWorkouts(prev => prev.map((w, idx) => {
      if (idx === selectedDay) {
        return {
          ...w,
          exercises: w.exercises.map(ex => ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex)
        };
      }
      return w;
    }));
  };

  const handleExerciseClick = (id: string) => {
    setActiveExerciseId(id === activeExerciseId ? null : id);
  };

  const completedCount = currentWorkout.exercises.filter(ex => ex.completed).length;
  const totalCount = currentWorkout.exercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      {/* Header & Weekly Navigation */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-indigo-500" />
            GymFlow Agenda
          </h2>
          <p className="text-slate-400">Transforme consistência em resultados extraordinários.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {workouts.map((w, idx) => (
            <button
              key={w.day}
              onClick={() => {
                setSelectedDay(idx);
                setActiveExerciseId(null);
              }}
              className={`
                flex flex-col items-center gap-1 min-w-[100px] p-4 rounded-2xl border transition-all
                ${selectedDay === idx
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}
              `}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">{w.day.slice(0, 3)}</span>
              <span className="text-sm font-black">{w.day}</span>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${w.exercises.length > 0 ? 'bg-indigo-400' : 'bg-slate-700'}`}></div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Workout Details (Lado Esquerdo) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-hidden relative group">
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block">Treino de Hoje</span>
                <h3 className="text-3xl font-black text-white">{currentWorkout.focus}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-bold uppercase">Progresso</p>
                  <p className="text-xl font-black text-white">{Math.round(progress)}%</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Activity className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="h-2 w-full bg-slate-800 rounded-full mb-8 relative z-10 overflow-hidden">
              <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="space-y-4 relative z-10">
              {currentWorkout.exercises.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                  <Dumbbell className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">Nenhum exercício para {currentWorkout.day}.</p>
                  <p className="text-slate-600 text-sm mt-2">Adicione exercícios para este dia de treino.</p>
                </div>
              ) : (
                currentWorkout.exercises.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => handleExerciseClick(ex.id)}
                    className={`
                      flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all
                      ${activeExerciseId === ex.id
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/10'
                        : ex.completed ? 'bg-indigo-600/5 border-indigo-500/30' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        onClick={(e) => toggleExercise(ex.id, e)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${ex.completed ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-700 text-transparent hover:border-indigo-500'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className={`font-bold transition-colors ${ex.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{ex.name}</h5>
                        <p className="text-xs text-slate-500 font-medium">{ex.sets} séries • {ex.reps} reps {ex.weight && `• ${ex.weight}kg`}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {ex.gifUrl && <Play className={`w-4 h-4 transition-colors ${activeExerciseId === ex.id ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`} />}
                      <ChevronRight className={`w-5 h-5 ${activeExerciseId === ex.id ? 'text-indigo-400 rotate-90 transition-transform' : 'text-slate-700 transition-transform'}`} />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          </div>

          {/* Rest Timer Interface */}
          <div className={`bg-slate-900 border transition-all duration-500 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 ${isResting ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-slate-800'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isResting ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                <Timer className={`w-6 h-6 ${isResting ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Tempo de Descanso</p>
                <div className="flex gap-2 mt-1">
                  {[30, 60, 90].map(s => (
                    <button
                      key={s}
                      onClick={() => resetRest(s)}
                      className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase transition-colors"
                    >
                      {s}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="text-right">
                <span className={`text-4xl font-black tabular-nums transition-colors ${isResting ? 'text-amber-500' : 'text-slate-200'}`}>
                  {formatTime(restTime)}
                </span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Restante</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => resetRest(60)}
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

        {/* Workout Image / GIF (Lado Direito) */}
        <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit">
          <div className="relative group overflow-hidden rounded-[2.5rem] border-4 border-slate-900 shadow-2xl h-[450px] bg-slate-900">
            <img
              key={activeExercise?.gifUrl || currentWorkout.image}
              src={activeExercise?.gifUrl || currentWorkout.image}
              alt={activeExercise?.name || currentWorkout.focus}
              className="w-full h-full object-cover transition-all duration-700 animate-in fade-in"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <span className={`bg-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white ${activeExercise ? 'animate-pulse' : ''}`}>
                {activeExercise ? `Guia: ${activeExercise.name}` : 'Referência Visual'}
              </span>
              <h4 className="text-2xl font-black text-white mt-2 leading-tight">
                {activeExercise ? 'Mantenha a execução impecável' : 'Seu corpo é seu templo'}
              </h4>
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20 transition-all">
            <h4 className="font-black text-lg mb-4 flex items-center gap-2">
              <Save className="w-5 h-5" /> Dica de Execução
            </h4>
            <p className="text-sm text-indigo-100 leading-relaxed font-medium">
              {activeExercise
                ? `Ao realizar ${activeExercise.name.toLowerCase()}, concentre-se na amplitude total do movimento. Não sacrifique a técnica pelo peso.`
                : `"Para este treino de ${currentWorkout.focus.toLowerCase()}, foque na contração máxima no topo de cada repetição. O tempo sob tensão é seu melhor aliado hoje."`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymManager;
