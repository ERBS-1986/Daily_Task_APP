
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
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskProgress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  const waterProgress = (water.current / water.target) * 100;

  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = days[new Date().getDay()];
  const todayWorkout = workouts.find(w => w.day === todayName);


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
      <section className={`${cardClass} border border-white/40 rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-indigo-200/20 backdrop-blur-3xl`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 relative z-10 text-center md:text-left">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
              <div className="p-3 bg-indigo-500/10 rounded-2xl shadow-inner">
                <CalIcon className="w-8 h-8 text-indigo-500" />
              </div>
              <div>
                <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>Sua Agenda de Hoje</h3>
                <p className="text-sm font-bold text-indigo-700/60 uppercase tracking-widest">Google Calendar Sync</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white/30 dark:bg-black/20 border border-white/50 dark:border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center group/card transition-all hover:bg-white/40">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-indigo-100">
                  <CalIcon className="w-8 h-8 text-indigo-300" />
                </div>
                <p className={`text-lg font-black ${isLight ? 'text-slate-800' : 'text-white'}`}>Tudo limpo por aqui!</p>
                <p className="text-sm text-slate-500 mt-1 font-medium italic">Conecte sua agenda para otimizar seu tempo.</p>
              </div>

              <button
                onClick={() => onNavigate('tasks')}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-5 rounded-2xl flex items-center justify-center gap-3 transition-all font-black text-sm shadow-xl shadow-indigo-600/20 active:scale-95 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>PLANEJAR NOVA ATIVIDADE</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:block w-72 h-72 relative animate-pulse-slow">
            <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-[80px]"></div>
            <div className="relative z-10 w-full h-full bg-white/20 rounded-[3rem] border border-white/40 flex items-center justify-center">
              <TrendingUp className="w-32 h-32 text-indigo-400/50" />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-400/10 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
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
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2 relative z-10">Tarefas de Hoje</p>
          <p className={`text-3xl font-black ${isLight ? 'text-slate-800' : 'text-white'} relative z-10`}>{completedTasks}/{tasks.length}</p>
          <div className="mt-6 w-full bg-slate-100 dark:bg-white/5 h-3 rounded-full overflow-hidden relative z-10 p-0.5 border border-white/50">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-full rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/50" style={{ width: `${taskProgress}%` }}></div>
          </div>
        </div>

        <div className={`${cardClass} border border-white/50 dark:border-white/10 p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100/10 group overflow-hidden relative backdrop-blur-2xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="p-4 bg-indigo-500/10 rounded-2xl shadow-inner">
              <Dumbbell className="w-7 h-7 text-indigo-500" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2 relative z-10">Treino de Hoje</p>
          <p className={`text-2xl font-black ${isLight ? 'text-slate-800' : 'text-white'} line-clamp-1 relative z-10`}>{todayWorkout?.focus || 'Descanso'}</p>
          <button onClick={() => onNavigate('gym')} className="mt-6 text-sm text-indigo-500 font-black flex items-center gap-2 hover:translate-x-1 transition-all relative z-10 group">
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
          <p className="text-slate-600 dark:text-slate-400 text-sm font-black uppercase tracking-widest mb-2 relative z-10">Hidratação</p>
          <p className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'} relative z-10`}>{water.current}ml</p>
          <div className="mt-6 w-full bg-slate-100 dark:bg-white/5 h-3 rounded-full overflow-hidden relative z-10 p-0.5 border border-white/50">
            <div className="bg-gradient-to-r from-sky-400 to-sky-600 h-full rounded-full transition-all duration-1000 shadow-lg shadow-sky-500/50" style={{ width: `${Math.min(waterProgress, 100)}%` }}></div>
          </div>
        </div>

        <div className={`${cardClass} border border-white/50 dark:border-white/10 p-8 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-100/10 group overflow-hidden relative backdrop-blur-2xl`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="p-4 bg-amber-500/10 rounded-2xl shadow-inner">
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2 relative z-10">Metas Ativas</p>
          <p className={`text-3xl font-black ${isLight ? 'text-slate-800' : 'text-white'} relative z-10`}>{goals.length}</p>
          <button
            onClick={() => onNavigate('goals')}
            className="mt-6 text-sm text-amber-600 font-black flex items-center gap-2 hover:translate-x-1 transition-all relative z-10 group"
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
            {tasks.filter(t => !t.completed).slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 transition-all group border border-transparent hover:border-white/50 cursor-pointer shadow-sm hover:shadow-md">
                <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all"></div>
                </div>
                <span className={`text-base font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'} group-hover:text-indigo-600 transition-colors`}>{task.title}</span>
                <ChevronRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
            {tasks.filter(t => !t.completed).length === 0 && (
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
