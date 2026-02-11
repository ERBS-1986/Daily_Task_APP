
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, BellOff, Volume2, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';

interface FocusModeProps {
  tasks: Task[];
  isGlobalFocusActive: boolean;
  setIsGlobalFocusActive: (active: boolean) => void;
}

type SessionType = 'focus' | 'shortBreak' | 'longBreak';

const SESSION_CONFIG: Record<SessionType, { time: number; label: string; color: string; icon: React.ReactNode }> = {
  focus: { time: 25 * 60, label: 'Foco Total', color: 'text-indigo-500', icon: <Zap className="w-5 h-5" /> },
  shortBreak: { time: 5 * 60, label: 'Pausa Curta', color: 'text-emerald-500', icon: <Coffee className="w-5 h-5" /> },
  longBreak: { time: 15 * 60, label: 'Pausa Longa', color: 'text-sky-500', icon: <Volume2 className="w-5 h-5" /> },
};

const FocusMode: React.FC<FocusModeProps> = ({ tasks, isGlobalFocusActive, setIsGlobalFocusActive }) => {
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(SESSION_CONFIG.focus.time);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Fix: Use number for timer ID in browser environment to avoid 'NodeJS' namespace error
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      // Use window.setInterval to ensure returning a number ID in the browser
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionEnd();
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleSessionEnd = () => {
    setIsActive(false);
    if (Notification.permission === 'granted') {
      new Notification('Tempo esgotado!', {
        body: sessionType === 'focus' ? 'Bom trabalho! Hora de uma pausa.' : 'Pausa encerrada. Vamos voltar ao foco?',
      });
    }
    // Auto-switch to next logical session
    if (sessionType === 'focus') setSessionType('shortBreak');
    else setSessionType('focus');
  };

  useEffect(() => {
    setTimeLeft(SESSION_CONFIG[sessionType].time);
    setIsActive(false);
  }, [sessionType]);

  useEffect(() => {
    // Silencing logic: When active, tell the parent to hide sidebar/header
    setIsGlobalFocusActive(isActive && sessionType === 'focus');
  }, [isActive, sessionType]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(SESSION_CONFIG[sessionType].time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <div className={`space-y-8 flex flex-col items-center transition-all duration-700 ${isGlobalFocusActive ? 'justify-center min-h-[70vh]' : ''}`}>
      {/* Session Type Selectors */}
      <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
        {(Object.keys(SESSION_CONFIG) as SessionType[]).map(type => (
          <button
            key={type}
            onClick={() => setSessionType(type)}
            className={`
              px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2
              ${sessionType === type ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}
            `}
          >
            {SESSION_CONFIG[type].icon}
            {SESSION_CONFIG[type].label}
          </button>
        ))}
      </div>

      {/* Main Timer Display */}
      <div className="relative group">
        <div className={`
          relative w-72 h-72 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center transition-all duration-500
          ${isActive ? 'scale-110 shadow-[0_0_60px_-15px_rgba(99,102,241,0.3)] border-indigo-500/20' : ''}
        `}>
          <div className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">
            {SESSION_CONFIG[sessionType].label}
          </div>
          <div className="text-7xl font-black text-white tracking-tighter tabular-nums">
            {formatTime(timeLeft)}
          </div>
          <div className={`mt-4 ${SESSION_CONFIG[sessionType].color}`}>
            {isActive ? <BellOff className="w-5 h-5 animate-pulse" /> : <Volume2 className="w-5 h-5" />}
          </div>
          
          {/* Progress Ring Simulation */}
          <svg className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none">
            <circle
              cx="144" cy="144" r="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className={`${SESSION_CONFIG[sessionType].color} opacity-20`}
              strokeDasharray="880"
              strokeDashoffset={880 - (880 * (timeLeft / SESSION_CONFIG[sessionType].time))}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
        </div>
      </div>

      {/* Task Selection */}
      {!isGlobalFocusActive && (
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Focar na tarefa:</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none"
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">Nenhuma tarefa selecionada</option>
            {tasks.filter(t => !t.completed).map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Active Focus Task Banner */}
      {isGlobalFocusActive && selectedTask && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
           <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span className="text-white font-medium italic">"{selectedTask.title}"</span>
           </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button 
          onClick={resetTimer}
          className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-2xl transition-all active:scale-90"
        >
          <RotateCcw className="w-6 h-6" />
        </button>

        <button 
          onClick={toggleTimer}
          className={`
            p-8 rounded-[2rem] transition-all transform active:scale-95 shadow-xl
            ${isActive ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20'}
          `}
        >
          {isActive ? <Pause className="w-8 h-8 text-white fill-white" /> : <Play className="w-8 h-8 text-white fill-white" />}
        </button>

        <div className="p-4 w-14"></div> {/* Spacer for symmetry */}
      </div>

      {isGlobalFocusActive && (
        <p className="text-slate-500 text-xs font-medium animate-pulse">
          Notificações não essenciais silenciadas. Concentre-se.
        </p>
      )}
    </div>
  );
};

export default FocusMode;
