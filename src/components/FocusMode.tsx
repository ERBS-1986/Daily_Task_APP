
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, BellOff, Volume2, CheckCircle2, Settings2, X, Save } from 'lucide-react';
import { Task } from '../types';
import { useToast } from '../contexts/ToastContext';

interface FocusModeProps {
  tasks: Task[];
  isGlobalFocusActive: boolean;
  setIsGlobalFocusActive: (active: boolean) => void;
  cardClass?: string;
  isLight?: boolean;
}

type SessionType = 'focus' | 'shortBreak' | 'longBreak';

const SESSION_LABELS: Record<SessionType, { label: string; color: string; icon: React.ReactNode }> = {
  focus: { label: 'Foco Total', color: 'text-indigo-500', icon: <Zap className="w-5 h-5" /> },
  shortBreak: { label: 'Pausa Curta', color: 'text-emerald-500', icon: <Coffee className="w-5 h-5" /> },
  longBreak: { label: 'Pausa Longa', color: 'text-sky-500', icon: <Volume2 className="w-5 h-5" /> },
};

const FocusMode: React.FC<FocusModeProps> = ({ tasks, isGlobalFocusActive, setIsGlobalFocusActive, cardClass, isLight }) => {
  const { showToast } = useToast();
  const [sessionType, setSessionType] = useState<SessionType>('focus');
  const [durations, setDurations] = useState<Record<SessionType, number>>({
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
  });

  const [timeLeft, setTimeLeft] = useState(durations.focus);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Timer settings form state
  const [tempDurations, setTempDurations] = useState({ focus: 25, shortBreak: 5, longBreak: 15 });

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionEnd();
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [isActive, timeLeft]);

  const handleSessionEnd = () => {
    setIsActive(false);
    if ("Notification" in window && Notification.permission === 'granted') {
      new Notification('Tempo esgotado!', {
        body: sessionType === 'focus' ? 'Bom trabalho! Hora de uma pausa.' : 'Pausa encerrada. Vamos voltar ao foco?',
      });
    }
    showToast("Tempo esgotado! Bom trabalho!", "success");

    // Auto-switch
    if (sessionType === 'focus') setSessionType('shortBreak');
    else setSessionType('focus');
  };

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(durations[sessionType]);
    }
  }, [sessionType, durations]);

  useEffect(() => {
    setIsGlobalFocusActive(isActive && sessionType === 'focus');
  }, [isActive, sessionType, setIsGlobalFocusActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(durations[sessionType]);
  };

  const saveSettings = () => {
    const newDurations = {
      focus: tempDurations.focus * 60,
      shortBreak: tempDurations.shortBreak * 60,
      longBreak: tempDurations.longBreak * 60
    };
    setDurations(newDurations);
    if (!isActive) setTimeLeft(newDurations[sessionType]);
    setShowSettings(false);
    showToast("Configurações salvas!", "success");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);
  const currentConfig = SESSION_LABELS[sessionType];

  return (
    <div className={`space-y-8 flex flex-col items-center transition-all duration-700 ${isGlobalFocusActive ? 'justify-center min-h-[70vh]' : ''}`}>
      {/* Session Type Selectors */}
      <div className={`p-1 rounded-2xl border backdrop-blur-md relative transition-opacity duration-500 ${isLight ? 'bg-white/40 border-white/40 shadow-xl' : 'bg-slate-900/50 border-slate-800'}`} style={{ opacity: isGlobalFocusActive ? 0.2 : 1 }}>
        {(Object.keys(SESSION_LABELS) as SessionType[]).map(type => (
          <button
            key={type}
            disabled={isActive}
            onClick={() => setSessionType(type)}
            className={`
              px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2
              ${sessionType === type
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : `${isLight ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-500 hover:text-slate-300'}`}
              ${isActive ? 'cursor-not-allowed' : ''}
            `}
          >
            {SESSION_LABELS[type].icon}
            {SESSION_LABELS[type].label}
          </button>
        ))}
      </div>

      {/* Main Timer Display */}
      <div className="relative group">
        <div className={`
          relative w-80 h-80 rounded-full border-8 transition-all duration-700 backdrop-blur-3xl shadow-2xl
          ${isActive ? 'scale-110 shadow-indigo-500/20' : (isLight ? 'bg-white/40 shadow-indigo-100/10' : 'bg-slate-900/30')}
          ${isLight ? 'border-white/50' : 'border-slate-800'}
        `}>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mb-3">
            {currentConfig.label}
          </div>
          <div className="text-8xl font-black tracking-tighter tabular-nums leading-none drop-shadow-lg">
            <span className={isLight ? 'text-slate-900' : 'text-white'}>{formatTime(timeLeft)}</span>
          </div>
          <div className={`mt-6 transition-transform duration-500 ${isActive ? 'scale-125' : ''}`}>
            {isActive ? <BellOff className={`w-6 h-6 animate-pulse ${currentConfig.color}`} /> : <Volume2 className="w-6 h-6 text-slate-600" />}
          </div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 -rotate-90 w-full h-full pointer-events-none">
            <circle
              cx="160" cy="160" r="152"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className={`${currentConfig.color} opacity-20`}
              strokeDasharray="955"
              strokeDashoffset={955 - (955 * (timeLeft / durations[sessionType]))}
              style={{ transition: 'stroke-dashoffset 1s linear' }}
              strokeLinecap="round"
            />
          </svg>

          {!isActive && (
            <button
              onClick={() => setShowSettings(true)}
              className="absolute top-4 right-4 p-2 text-slate-600 hover:text-indigo-400 transition-colors"
            >
              <Settings2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Task Selection */}
      {!isGlobalFocusActive && (
        <div className={`w-full max-w-sm p-6 rounded-[2.5rem] border backdrop-blur-3xl shadow-xl space-y-4 ${cardClass || 'bg-slate-900/50 border-slate-800'} ${isLight ? 'border-white/50 shadow-indigo-100/10' : 'border-slate-800 shadow-black/20'}`}>
          <label className={`text-[10px] font-black uppercase tracking-widest block text-center ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>Focar em:</label>
          <select
            disabled={isActive}
            className={`w-full border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all appearance-none text-center font-black ${isLight ? 'bg-white/50 border-indigo-100 text-slate-900' : 'bg-slate-800/50 border-slate-700/50 text-white'}`}
            value={selectedTaskId || ''}
            onChange={(e) => setSelectedTaskId(e.target.value)}
          >
            <option value="">🍀 Fluxo Livre</option>
            {tasks.filter(t => !t.completed).map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        </div>
      )}

      {/* Active Focus Task Banner */}
      {isGlobalFocusActive && selectedTask && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span className="text-white font-black text-lg">"{selectedTask.title}"</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-10">
        <button
          onClick={resetTimer}
          className={`p-6 border rounded-[2rem] transition-all active:scale-90 shadow-lg backdrop-blur-md ${isLight ? 'bg-white/60 border-white/50 text-slate-400 hover:text-indigo-500' : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-white'}`}
        >
          <RotateCcw className="w-7 h-7" />
        </button>

        <button
          onClick={toggleTimer}
          className={`
            p-10 rounded-[3rem] transition-all transform active:scale-95 shadow-2xl
            ${isActive ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/30' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'}
          `}
        >
          {isActive ? <Pause className="w-10 h-10 text-white fill-current" /> : <Play className="w-10 h-10 text-white fill-current" />}
        </button>

        <div className="w-16"></div> {/* Spacer */}
      </div>

      {isGlobalFocusActive && (
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Modo Imersivo Ativo
        </p>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowSettings(false)}></div>
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white">Configurar Tempos</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {[
                { key: 'focus', label: 'Foco (min)', color: 'text-indigo-400' },
                { key: 'shortBreak', label: 'Pausa Curta (min)', color: 'text-emerald-400' },
                { key: 'longBreak', label: 'Pausa Longa (min)', color: 'text-sky-400' },
              ].map(item => (
                <div key={item.key}>
                  <label className={`block text-xs font-black uppercase tracking-widest mb-2 ${item.color}`}>
                    {item.label}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={tempDurations[item.key as keyof typeof tempDurations]}
                    onChange={(e) => setTempDurations({ ...tempDurations, [item.key]: parseInt(e.target.value) || 1 })}
                    className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              ))}

              <div className="pt-4">
                <button
                  onClick={saveSettings}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvar Preferências
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
