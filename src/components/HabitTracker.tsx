
import React from 'react';
import { Habit } from '../types';
import { Plus, Flame, CheckCircle2, Circle, TrendingUp } from 'lucide-react';

interface HabitTrackerProps {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, setHabits }) => {
  const completeHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const today = new Date().toISOString().split('T')[0];
        if (h.lastCompleted === today) return h;
        return {
          ...h,
          streak: h.streak + 1,
          lastCompleted: today,
          history: [...h.history, today]
        };
      }
      return h;
    }));
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Hábitos Ativos</h2>
          <p className="text-slate-400 text-sm">Consistência é a chave para o sucesso.</p>
        </div>
        <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-2xl transition-colors">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map(habit => {
          const isCompletedToday = habit.lastCompleted === new Date().toISOString().split('T')[0];
          
          return (
            <div key={habit.id} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-all shadow-sm">
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

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
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
      </div>
    </div>
  );
};

export default HabitTracker;
