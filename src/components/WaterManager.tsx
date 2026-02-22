
import React, { useState, useEffect } from 'react';
import { Droplet, Plus, Minus, Info, Settings2, Save, X, Clock, Bell, CalendarClock, Trash2, Music } from 'lucide-react';
import { WaterIntake } from '../types';

interface WaterManagerProps {
  water: WaterIntake;
  setWater: React.Dispatch<React.SetStateAction<WaterIntake>>;
}

import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// ... (imports)

interface WaterManagerProps {
  water: WaterIntake;
  setWater: React.Dispatch<React.SetStateAction<WaterIntake>>;
  cardClass?: string;
  isLight?: boolean;
}

const WaterManager: React.FC<WaterManagerProps> = ({ water, setWater, cardClass, isLight }) => {
  const { user } = useAuth();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState<'goal' | 'reminders'>('goal');

  // Local state for editing goal
  const [weight, setWeight] = useState<number>(70);
  const [activity, setActivity] = useState<number>(35);

  // Local state for editing reminders
  const [remindersEnabled, setRemindersEnabled] = useState(water.remindersEnabled);
  const [reminderType, setReminderType] = useState(water.reminderType);
  const [interval, setInterval] = useState(water.reminderInterval || 60);
  const [scheduledTimes, setScheduledTimes] = useState<string[]>(water.scheduledTimes || []);
  const [newTime, setNewTime] = useState('08:00');
  const [notifSound, setNotifSound] = useState(() => localStorage.getItem('ff_water_sound') || 'default');

  const updateWaterInDb = async (newWaterData: Partial<WaterIntake>) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('water_intake')
        .upsert({
          user_id: user.id,
          ...newWaterData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating water:', error);
    }
  };

  const updateProfileInDb = async (updates: any) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() });
      if (error) throw error;
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const addWater = (amount: number) => {
    const newCurrent = water.current + amount;
    setWater(prev => ({ ...prev, current: newCurrent }));
    updateWaterInDb({ current: newCurrent, updated_at: new Date().toISOString() });
  };

  const resetWater = () => {
    setWater(prev => ({ ...prev, current: 0 }));
    updateWaterInDb({ current: 0, updated_at: new Date().toISOString() });
  };

  const handleSaveAll = () => {
    const newTarget = weight * activity;
    const newSettings: WaterIntake = {
      ...water,
      target: newTarget,
      remindersEnabled,
      reminderType,
      reminderInterval: interval,
      scheduledTimes
    };

    setWater(newSettings);
    updateWaterInDb({ target: newTarget, current: water.current });
    updateProfileInDb({
      weight,
      activity_level: activity,
      water_reminders: {
        enabled: remindersEnabled,
        type: reminderType,
        interval,
        scheduledTimes
      }
    });
    localStorage.setItem('ff_water_sound', notifSound);
    setIsConfiguring(false);
  };

  const addScheduledTime = () => {
    if (!scheduledTimes.includes(newTime)) {
      setScheduledTimes([...scheduledTimes, newTime].sort());
    }
  };

  const removeScheduledTime = (time: string) => {
    setScheduledTimes(scheduledTimes.filter(t => t !== time));
  };

  const percentage = Math.min((water.current / water.target) * 100, 100);

  // Simulated Reminder Engine
  useEffect(() => {
    if (!water.remindersEnabled || Notification.permission !== 'granted') return;

    const checkReminders = setInterval(() => {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      if (water.reminderType === 'scheduled' && water.scheduledTimes?.includes(currentTimeStr)) {
        new Notification('Hora de Hidratação! 💧', {
          body: `Sua meta é ${water.target}ml. Já bebeu água agora?`,
          icon: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png'
        });
      }
      // Note: Interval logic would require tracking lastHydrationTime in state
    }, 60000);

    return () => clearInterval(checkReminders);
  }, [water]);

  return (
    <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col items-center text-center space-y-2 relative">
        <h2 className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Lembrete de Hidratação</h2>
        <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} font-medium`}>Gerencie sua meta e alertas personalizados abaixo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Visualizer */}
        <div className="flex justify-center">
          <div className={`relative w-64 h-80 border-4 rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer backdrop-blur-3xl ${isLight ? 'bg-white/40 border-white/60' : 'bg-slate-900 border-slate-800'}`} onClick={() => addWater(250)}>
            <div
              className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out ${isLight ? 'bg-sky-400' : 'bg-sky-500'}`}
              style={{ height: `${percentage}%` }}
            >
              <div className="absolute top-0 left-0 w-[200%] h-10 bg-sky-400/30 -translate-y-full animate-wave"></div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
              <span className={`text-5xl font-black drop-shadow-md group-hover:scale-110 transition-transform ${isLight ? 'text-slate-900' : 'text-white'}`}>{Math.round(percentage)}%</span>
              <span className={`font-black uppercase tracking-widest text-[10px] mt-1 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>{water.current} / {water.target}ml</span>
              {percentage < 100 && (
                <div className="mt-4 flex items-center gap-1 text-[10px] text-white/50 uppercase font-bold tracking-widest bg-black/20 px-3 py-1 rounded-full">
                  <Plus className="w-3 h-3" /> Toque para +250ml
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6 mt-8">
          <div className="grid grid-cols-2 gap-4">
            {[200, 350, 500, 1000].map(amount => (
              <button
                key={amount}
                onClick={() => addWater(amount)}
                className={`p-6 rounded-[2rem] border transition-all group relative overflow-hidden backdrop-blur-xl ${cardClass || 'bg-slate-900 border-slate-800'} ${isLight ? 'border-white/50 hover:bg-white/60' : 'border-slate-800 hover:border-sky-500'}`}
              >
                <div className="relative z-10">
                  <Plus className="w-5 h-5 text-sky-500 mb-2 group-hover:scale-125 transition-transform" />
                  <span className={`block text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{amount}ml</span>
                  <span className={`text-[10px] uppercase tracking-widest font-black ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Adicionar</span>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-sky-500/0 group-hover:bg-sky-500/50 transition-all"></div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl shadow-xl ${cardClass || 'bg-slate-900 border-slate-800'} ${isLight ? 'border-white/50' : 'border-slate-800'}`}>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Meta AguaLife</label>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Seu Peso (kg)</label>
                  <div className="flex items-center gap-4 bg-slate-800/30 border border-slate-700/50 p-2 rounded-2xl">
                    <button onClick={() => setWeight(Math.max(20, weight - 1))} className="p-3 hover:bg-slate-700/50 rounded-xl text-white transition-colors">
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Number(e.target.value))}
                      className="flex-1 bg-transparent text-center text-2xl font-black text-white focus:outline-none"
                    />
                    <button onClick={() => setWeight(weight + 1)} className="p-3 hover:bg-slate-700/50 rounded-xl text-white transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nível de Atividade</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Sedentário', value: 30 },
                      { label: 'Moderado', value: 35 },
                      { label: 'Intenso', value: 40 },
                      { label: 'Atleta', value: 45 }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setActivity(opt.value)}
                        className={`px-3 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${activity === opt.value ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-800/30 border-slate-700/50 text-slate-500'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-center">
                  <p className="text-[10px] text-indigo-400 font-black uppercase mb-1">Cálculo AguaLife</p>
                  <p className="text-3xl font-black text-white">{weight * activity}ml <span className="text-xs font-medium text-slate-500">/ dia</span></p>
                </div>
              </div>
            </div>

            <div className={`p-8 rounded-[2.5rem] border backdrop-blur-2xl shadow-xl ${cardClass || 'bg-slate-900 border-slate-800'} ${isLight ? 'border-white/50' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Notificações</label>
                <button
                  onClick={() => setRemindersEnabled(!remindersEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${remindersEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${remindersEnabled ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              {remindersEnabled ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-2 gap-2 bg-slate-800/30 p-1.5 rounded-2xl">
                    <button
                      onClick={() => setReminderType('interval')}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${reminderType === 'interval' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Intervalo
                    </button>
                    <button
                      onClick={() => setReminderType('scheduled')}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${reminderType === 'scheduled' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
                    >
                      <CalendarClock className="w-3.5 h-3.5" /> Fixos
                    </button>
                  </div>

                  {reminderType === 'interval' ? (
                    <div className="space-y-3">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">A cada {interval} min</label>
                      <input
                        type="range"
                        min="15" max="240" step="15"
                        value={interval}
                        onChange={(e) => setInterval(Number(e.target.value))}
                        className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                        />
                        <button
                          onClick={addScheduledTime}
                          className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-[10px] uppercase transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto no-scrollbar">
                        {scheduledTimes.map(time => (
                          <div key={time} className="flex items-center gap-1.5 bg-slate-800/50 border border-slate-700/50 px-2.5 py-1 rounded-full text-[10px] font-black text-white">
                            {time}
                            <button onClick={() => removeScheduledTime(time)} className="hover:text-rose-400">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-800/10 border border-dashed border-slate-700/30 rounded-2xl">
                  <Bell className="w-10 h-10 text-slate-700 mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Alertas Desativados</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleSaveAll}
              className="flex-1 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-xs rounded-3xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <Save className="w-5 h-5" />
              Salvar Configurações
            </button>
            <button
              onClick={resetWater}
              className="py-5 px-8 text-slate-500 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-colors border border-transparent hover:border-rose-400/20 rounded-3xl"
            >
              Zerar Hoje
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterManager;
