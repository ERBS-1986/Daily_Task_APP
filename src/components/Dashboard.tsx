
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
  ExternalLink
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Google Calendar Section - Top Highlight */}
      <section className={`${cardClass} border border-slate-800 rounded-3xl p-8 relative overflow-hidden group shadow-sm`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl">
                <CalIcon className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Sua Agenda de Hoje</h3>
                <p className="text-xs text-slate-500">Sincronizado com Google Calendar</p>
              </div>
              <button
                onClick={() => onNavigate('calendar')}
                className="ml-auto md:ml-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Empty State for Calendar Events */}
              <div className="col-span-1 md:col-span-3 bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center group/card">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                  <CalIcon className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-sm font-bold text-slate-300">Nenhum evento agendado</p>
                <p className="text-xs text-slate-500 mt-1">Conecte seu Google Calendar para ver sua agenda.</p>
              </div>

              <button
                onClick={() => onNavigate('tasks')}
                className="col-span-1 md:col-span-3 bg-indigo-600/5 border border-dashed border-indigo-600/30 p-4 rounded-2xl flex items-center justify-center gap-2 text-indigo-400 hover:bg-indigo-600/10 transition-all font-bold text-sm"
              >
                <Plus className="w-4 h-4" /> Nova Atividade
              </button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-colors"></div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${cardClass} border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Tarefas de Hoje</p>
          <p className="text-2xl font-bold text-slate-100">{completedTasks}/{tasks.length}</p>
          <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${taskProgress}%` }}></div>
          </div>
        </div>

        <div className={`${cardClass} border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Dumbbell className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Treino de Hoje</p>
          <p className="text-xl font-bold text-slate-100 line-clamp-1">{todayWorkout?.focus || 'Descanso'}</p>
          <button onClick={() => onNavigate('gym')} className="mt-4 text-xs text-indigo-400 font-semibold flex items-center gap-1 hover:text-indigo-300 transition-colors">
            Ver treino <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <div className={`${cardClass} border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-sky-500/10 rounded-2xl">
              <Droplet className="w-6 h-6 text-sky-500" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Hidratação</p>
          <p className="text-2xl font-bold text-slate-100">{water.current}ml / {water.target}ml</p>
          <div className="mt-4 w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-sky-500 h-full transition-all duration-1000" style={{ width: `${Math.min(waterProgress, 100)}%` }}></div>
          </div>
        </div>

        <div className={`${cardClass} border border-slate-800 p-6 rounded-3xl hover:border-slate-700 transition-colors shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl">
              <Trophy className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <p className="text-slate-400 text-sm mb-1">Metas Semanais</p>
          <p className="text-2xl font-bold text-slate-100">{goals.length} ativas</p>
          <button
            onClick={() => onNavigate('goals')}
            className="mt-4 text-xs text-indigo-400 font-semibold flex items-center gap-1 hover:text-indigo-300 transition-colors"
          >
            Ver detalhes <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Quick Task List */}
        <div className={`${cardClass} border border-slate-800 p-8 rounded-3xl flex flex-col shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-100">Próximas Tarefas</h3>
            <button onClick={() => onNavigate('tasks')} className="text-xs text-indigo-400 font-bold hover:underline">Ver tudo</button>
          </div>
          <div className="space-y-4 flex-1">
            {tasks.filter(t => !t.completed).slice(0, 4).map(task => (
              <div key={task.id} className="flex items-center gap-3 group">
                <Circle className="w-5 h-5 text-slate-600 group-hover:text-indigo-500 transition-colors cursor-pointer" />
                <span className="text-slate-300 text-sm font-medium line-clamp-1">{task.title}</span>
              </div>
            ))}
            {tasks.filter(t => !t.completed).length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm">Nada por aqui!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
