
import React from 'react';
import { WeeklyGoal } from '../types';
import { Target, Plus, ChevronRight, Award } from 'lucide-react';

interface GoalsManagerProps {
  goals: WeeklyGoal[];
  setGoals: React.Dispatch<React.SetStateAction<WeeklyGoal[]>>;
}

const GoalsManager: React.FC<GoalsManagerProps> = ({ goals, setGoals }) => {
  const updateProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, current: Math.min(g.current + amount, g.target) };
      }
      return g;
    }));
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
        <button className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl transition-all flex items-center gap-2">
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
                {[5, 10, 25].map(amt => (
                  <button 
                    key={amt}
                    onClick={() => updateProgress(goal.id, amt)}
                    disabled={isFinished}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-colors disabled:opacity-50"
                  >
                    +{amt} {goal.unit}
                  </button>
                ))}
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsManager;
