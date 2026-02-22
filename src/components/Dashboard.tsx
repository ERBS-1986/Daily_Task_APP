
import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Trophy,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Droplet,
  Dumbbell,
  Calendar as CalIcon,
  Clock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Task, Habit, WeeklyGoal, WaterIntake, DailyWorkout } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface DashboardProps {
  tasks: Task[];
  habits: Habit[];
  goals: WeeklyGoal[];
  water: WaterIntake;
  workouts: DailyWorkout[];
  onNavigate: (tab: string) => void;
  cardClass?: string;
}

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  habits,
  goals,
  water,
  workouts,
  onNavigate,
  cardClass = 'bg-slate-900'
}) => {
  const todayObj = new Date();
  const todayDateLocal = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
  const todayTasks = tasks.filter(t => {
    if (!t.dueDate) return false;
    const taskDate = new Date(t.dueDate);
    const taskDateLocal = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;
    return taskDateLocal === todayDateLocal;
  });
  const completedTodayTasks = todayTasks.filter(t => t.completed).length;
  const taskProgress = todayTasks.length > 0 ? (completedTodayTasks / todayTasks.length) * 100 : 0;
  const waterProgress = (water.current / water.target) * 100;

  const todayWorkout = workouts.find(w => w.day === todayDateLocal);


  // Calcular dados reais da semana baseado nas tarefas
  const weeklyData = [
    { day: 'Seg', tasks: 0 },
    { day: 'Ter', tasks: 0 },
    { day: 'Qua', tasks: 0 },
    { day: 'Qui', tasks: 0 },
    { day: 'Sex', tasks: 0 },
    { day: 'Sáb', tasks: 0 },
    { day: 'Dom', tasks: 0 },
  ];

  // Verificar se há dados reais para mostrar o gráfico
  const hasWeeklyData = weeklyData.some(d => d.tasks > 0);

  const isLight = !document.documentElement.classList.contains('dark');

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-2">
      {/* Top Banner - Hero Section */}
      {/* Daily Tasks Hero Section */}
      <section className={`${cardClass} border rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl backdrop-blur-[40px] ${isLight ? 'border-indigo-100 shadow-indigo-100/30' : 'border-white/10 shadow-black/40'}`}>
        <div className="flex flex-col md:flex-row justify-between gap-10 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-600 rounded-[1.5rem] shadow-lg shadow-indigo-600/30">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className={`text-3xl font-black tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>Todas as Tarefas</h3>
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${isLight ? 'text-black/60' : 'text-white/80'}`}>Progresso Geral</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayTasks.length > 0 ? (
                todayTasks.slice(0, 4).map(task => (
                  <div key={task.id} className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${isLight ? 'bg-white border-slate-100 text-slate-900 shadow-sm' : 'bg-slate-800/50 border-white/5 text-white'}`}>
                    <div className={`w-3 h-3 rounded-full ${task.completed ? 'bg-indigo-500 shadow-lg shadow-indigo-500/50' : (isLight ? 'bg-slate-200' : 'bg-slate-700')}`}></div>
                    <span className={`font-black truncate ${task.completed ? 'opacity-40 italic' : ''}`}>{task.title}</span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 px-8 bg-indigo-500/5 rounded-[2rem] border border-dashed border-indigo-500/20 text-center">
                  <p className={`font-bold italic ${isLight ? 'text-black/40' : 'text-white'}`}>Tudo em ordem por hoje!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('tasks')}
              className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white py-4 px-10 rounded-2xl flex items-center gap-3 transition-all font-black text-sm shadow-xl shadow-indigo-600/30 active:scale-95 group w-fit"
            >
              <span>VER DETALHES</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>

          <div className="hidden lg:flex w-64 h-64 bg-indigo-600/5 rounded-[3rem] border border-indigo-500/10 items-center justify-center relative">
            <div className="text-center">
              <p className={`text-6xl font-black ${isLight ? 'text-black' : 'text-white'}`}>{Math.round(taskProgress)}%</p>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isLight ? 'text-black/40' : 'text-white/60'}`}>Concluído</p>
            </div>
          </div>
        </div>

        {/* Premium background blur effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className={`${cardClass} border border-white/50 dark:border-white/10 p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100/10 group overflow-hidden relative backdrop-blur-2xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="p-4 bg-emerald-500/10 rounded-2xl shadow-inner">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="w-12 h-12 bg-emerald-500/5 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-500/40" />
            </div>
          </div>
          <p className={`${isLight ? 'text-black/60' : 'text-white/60'} text-xs font-black uppercase tracking-[0.2em] mb-3 relative z-10`}>Tarefas de Hoje</p>
          <p className={`text-3xl font-black ${isLight ? 'text-black' : 'text-white'} relative z-10`}>{completedTodayTasks}/{todayTasks.length}</p>
          <div className="mt-6 w-full bg-slate-100 dark:bg-white/5 h-3 rounded-full overflow-hidden relative z-10 p-0.5 border border-white/50">
            <div className="bg-gradient-to-r from-emerald-300 to-emerald-500 h-full rounded-full transition-all duration-1000 shadow-lg shadow-emerald-400/50" style={{ width: `${taskProgress}%` }}></div>
          </div>
        </div>

        <div className={`${cardClass} border border-white/50 dark:border-white/10 p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100/10 group overflow-hidden relative backdrop-blur-2xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="p-4 bg-indigo-500/10 rounded-2xl shadow-inner">
              <Dumbbell className="w-7 h-7 text-indigo-500" />
            </div>
          </div>
          <p className={`${isLight ? 'text-black/60' : 'text-slate-400 dark:text-slate-400'} text-xs font-black uppercase tracking-[0.2em] mb-3 relative z-10`}>Treino de Hoje</p>
          <p className={`text-2xl font-black ${isLight ? 'text-black' : 'text-white'} line-clamp-1 relative z-10`}>{todayWorkout?.focus || 'Descanso'}</p>
          <button onClick={() => onNavigate('gym')} className={`mt-6 text-xs font-black flex items-center gap-2 hover:translate-x-1 transition-all relative z-10 group ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
            ACESSAR TREINO <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <div className={`${cardClass} border border-white/50 dark:border-white/10 p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100/10 group overflow-hidden relative backdrop-blur-2xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-sky-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="p-4 bg-sky-500/10 rounded-2xl shadow-inner">
              <Droplet className="w-7 h-7 text-sky-500" />
            </div>
          </div>
          <p className={`${isLight ? 'text-black/60' : 'text-slate-400 dark:text-slate-400'} text-sm font-black uppercase tracking-widest mb-2 relative z-10`}>Hidratação</p>
          <p className={`text-3xl font-black ${isLight ? 'text-black' : 'text-white'} relative z-10`}>{water.current}ml</p>
          <div className="mt-4 w-full bg-slate-100 dark:bg-white/5 h-3 rounded-full overflow-hidden relative z-10 p-0.5 border border-white/50">
            <div className="bg-gradient-to-r from-sky-300 to-sky-500 h-full rounded-full transition-all duration-1000 shadow-lg shadow-sky-400/50" style={{ width: `${Math.min(waterProgress, 100)}%` }}></div>
          </div>
          <button
            onClick={() => onNavigate('water')}
            className={`mt-6 text-xs font-black flex items-center gap-2 hover:translate-x-1 transition-all relative z-10 group ${isLight ? 'text-sky-600' : 'text-sky-400'}`}
          >
            VER DETALHES <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <div className={`${cardClass} border border-white/50 dark:border-white/10 p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100/10 group overflow-hidden relative backdrop-blur-2xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="p-4 bg-amber-500/10 rounded-2xl shadow-inner">
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>
          </div>
          <p className={`${isLight ? 'text-black/60' : 'text-slate-400 dark:text-slate-400'} text-xs font-black uppercase tracking-[0.2em] mb-3 relative z-10`}>Metas Ativas</p>
          <p className={`text-3xl font-black ${isLight ? 'text-black' : 'text-white'} relative z-10`}>{goals.length}</p>
          <button
            onClick={() => onNavigate('goals')}
            className={`mt-6 text-xs font-black flex items-center gap-2 hover:translate-x-1 transition-all relative z-10 group ${isLight ? 'text-amber-600' : 'text-amber-400'}`}
          >
            VER DETALHES <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Quick Task List */}
        <div className={`${cardClass} border border-white/50 dark:border-white/10 p-10 rounded-[3rem] flex flex-col shadow-2xl shadow-indigo-100/10 backdrop-blur-2xl relative overflow-hidden`}>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
              <h3 className={`text-2xl font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>Foco Imediato</h3>
            </div>
            <button onClick={() => onNavigate('tasks')} className="text-xs font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest bg-indigo-50 py-2 px-4 rounded-full transition-all">Ver Todas</button>
          </div>
          <div className="space-y-4 flex-1 relative z-10">
            {todayTasks.filter(t => !t.completed).slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group border border-transparent hover:border-white/50 cursor-pointer shadow-sm hover:shadow-md">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all"></div>
                </div>
                <span className={`text-base font-black ${isLight ? 'text-slate-700' : 'text-slate-200'} group-hover:text-indigo-600 transition-colors`}>{task.title}</span>
                <ChevronRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
            {todayTasks.filter(t => !t.completed).length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold italic">Sua lista está limpa! Aproveite o momento.</p>
              </div>
            )}
          </div>

          {/* Decorative blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-400/5 rounded-full blur-[120px] pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
