
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import {
  Bell,
  Menu,
  X,
  Plus,
  ChevronRight,
  Settings,
  LogOut,
  Calendar as CalIcon,
  Search,
  Palette,
  Check,
  Clock,
  Trash2,
  User as UserIcon,
  Lock,
  ChevronDown,
  ShieldCheck
} from 'lucide-react';
import { Task, Habit, WeeklyGoal, WaterIntake, Category, TaskPriority, DailyWorkout, NotificationItem, AppTheme, User } from './types';
import { NAVIGATION } from './constants';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import HabitTracker from './components/HabitTracker';
import GoalsManager from './components/GoalsManager';
import WaterManager from './components/WaterManager';
import CalendarSync from './components/CalendarSync';
import FocusMode from './components/FocusMode';
import GymManager from './components/GymManager';
import Auth from './components/Auth';


const THEMES: { id: AppTheme, name: string, bgClass: string, sidebarClass: string, color: string }[] = [
  { id: 'default', name: 'Padrão', bgClass: 'bg-slate-50 dark:bg-slate-950', sidebarClass: 'bg-slate-100/80 dark:bg-slate-900/80', color: '#64748b' },
  { id: 'red', name: 'Vermelho', bgClass: 'bg-red-950', sidebarClass: 'bg-black/40', color: '#b91c1c' },
  { id: 'green', name: 'Verde', bgClass: 'bg-emerald-950', sidebarClass: 'bg-black/40', color: '#065f46' },
  { id: 'blue', name: 'Azul', bgClass: 'bg-blue-950', sidebarClass: 'bg-black/40', color: '#1e40af' },
  { id: 'pink', name: 'Rosa', bgClass: 'bg-pink-950', sidebarClass: 'bg-black/40', color: '#be185d' },
  { id: 'purple', name: 'Roxo', bgClass: 'bg-violet-950', sidebarClass: 'bg-black/40', color: '#6d28d9' },
];

import { supabase } from './lib/supabase';

// ... (imports)

const App: React.FC = () => {
  const { user, signOut, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFocusActive, setIsFocusActive] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => (localStorage.getItem('ff_theme') as AppTheme) || 'default');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'Bem-vindo!', message: 'Comece adicionando suas primeiras tarefas.', time: 'Agora', type: 'info', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    localStorage.setItem('ff_theme', currentTheme);
    document.documentElement.classList.add('dark');
  }, [currentTheme]);

  // Click outside to close profile menu
  // ... (keep existing click outside logic) ...

  // Workout state - will be populated by user through suggestions
  const [workouts, setWorkouts] = useState<DailyWorkout[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [water, setWater] = useState<WaterIntake>({
    target: 2500,
    current: 0,
    unit: 'ml',
    remindersEnabled: true,
    reminderType: 'interval',
    reminderInterval: 60,
    scheduledTimes: ["09:00", "12:00", "15:00", "18:00", "21:00"]
  });

  // Fetch Data from Supabase
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      // Clear data on logout
      setTasks([]);
      setHabits([]);
      setGoals([]);
      // setWater defaults...
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setIsLoadingData(true);

    try {
      const [tasksResult, habitsResult, goalsResult, waterResult] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('habits').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('water_intake').select('*').eq('user_id', user.id).single()
      ]);

      if (tasksResult.data) setTasks(tasksResult.data);
      if (habitsResult.data) setHabits(habitsResult.data);
      if (goalsResult.data) setGoals(goalsResult.data);
      if (waterResult.data) setWater(waterResult.data);

      // If water data is missing (new user), create it
      if (!waterResult.data && !waterResult.error) { // basic check
        // Insert default water settings
        const defaultWater = {
          user_id: user.id,
          target: 2500,
          current: 0,
          unit: 'ml'
        };
        const { error } = await supabase.from('water_intake').insert(defaultWater);
        if (!error) setWater(prev => ({ ...prev, ...defaultWater }));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Sync to Supabase (Optimistic UI updates should be handled in specific components, 
  // but for now we can rely on fetching or individual update functions passed down)
  // NOTE: The previous code synced to localStorage on every change. 
  // Moving forward, we should update Supabase directly in the add/edit functions 
  // instead of using a refined effect for everything, to avoid infinite loops or race conditions.
  // For this step, I am REMOVING the auto-sync effects.

  /* 
  useEffect(() => {
    // localStorage.setItem... REMOVED
  }, [tasks, habits, goals, water, workouts]);
  */

  const handleLogout = async () => {
    await signOut();
    setIsProfileMenuOpen(false);
    setActiveTab('dashboard');
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const currentThemeData = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  console.log('[App] Renderizando. isAuthLoading:', isAuthLoading, 'User:', user ? 'Sim' : 'Não');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard tasks={tasks} habits={habits} goals={goals} water={water} workouts={workouts} onNavigate={setActiveTab} />;
      case 'tasks': return <TaskManager tasks={tasks} setTasks={setTasks} />;
      case 'habits': return <HabitTracker habits={habits} setHabits={setHabits} />;
      case 'goals': return <GoalsManager goals={goals} setGoals={setGoals} />;
      case 'water': return <WaterManager water={water} setWater={setWater} />;
      case 'gym': return <GymManager workouts={workouts} setWorkouts={setWorkouts} />;
      case 'calendar': return <CalendarSync />;
      case 'focus': return <FocusMode tasks={tasks} isGlobalFocusActive={isFocusActive} setIsGlobalFocusActive={setIsFocusActive} />;
      default: return <Dashboard tasks={tasks} habits={habits} goals={goals} water={water} workouts={workouts} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-1000 ${currentThemeData.bgClass}`}>
      {isSidebarOpen && !isFocusActive && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 ${currentThemeData.sidebarClass} backdrop-blur-xl border-r border-white/5 transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen && !isFocusActive ? 'translate-x-0' : '-translate-x-full'} ${isFocusActive ? 'lg:-translate-x-full lg:hidden' : ''}`}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <CalIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Daily Task</h1>
                <p className="text-xs text-slate-400">Produtividade</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {NAVIGATION.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-white/10 text-white border border-white/10 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 w-full rounded-xl hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!isFocusActive && (
          <header className="h-16 bg-white/5 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 lg:px-8 z-40 animate-in slide-in-from-top-4 duration-500">
            <button className="lg:hidden p-2 text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:flex-none">
              <h2 className="text-lg font-semibold text-slate-100 hidden md:block">{NAVIGATION.find(n => n.id === activeTab)?.name || 'Daily Task'}</h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Color Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => { setIsThemeOpen(!isThemeOpen); setIsNotificationsOpen(false); setIsProfileMenuOpen(false); }}
                  className={`p-2 rounded-xl transition-all ${isThemeOpen ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'}`}
                >
                  <Palette className="w-6 h-6" />
                </button>
                {isThemeOpen && (
                  <div className="absolute top-12 right-0 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 animate-in zoom-in-95 z-50">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest p-2 border-b border-slate-800 mb-1">Cor de Fundo</p>
                    <div className="grid grid-cols-1 gap-0.5">
                      {THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => { setCurrentTheme(theme.id); setIsThemeOpen(false); }}
                          className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${currentTheme === theme.id ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400 hover:bg-white/5'}`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full border border-white/20`} style={{ backgroundColor: theme.color }}></div>
                          {theme.name}
                          {currentTheme === theme.id && <Check className="w-3 h-3 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>


              {/* Notifications Bell */}
              <div className="relative">
                <button
                  onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsThemeOpen(false); setIsProfileMenuOpen(false); markNotificationsAsRead(); }}
                  className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-400 hover:bg-white/5'}`}
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-slate-900 text-[10px] font-black flex items-center justify-center text-white animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute top-12 right-0 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 z-50">
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">Notificações</h4>
                      <button className="text-[10px] text-slate-500 hover:text-white uppercase font-bold">Limpar tudo</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b border-slate-800/50 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-indigo-600/5' : ''}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'alert' ? 'bg-rose-500' : 'bg-indigo-500'}`}></div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-slate-100">{n.title}</p>
                              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                                <Clock className="w-3 h-3" />
                                {n.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block"></div>

              {/* Profile Interactive Button */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => { setIsProfileMenuOpen(!isProfileMenuOpen); setIsNotificationsOpen(false); setIsThemeOpen(false); }}
                  className={`flex items-center gap-3 p-1.5 pl-3 rounded-2xl transition-all border ${isProfileMenuOpen ? 'bg-indigo-600/20 border-indigo-500/50' : 'hover:bg-white/5 border-transparent'}`}
                >
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-slate-200">{user.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.plan} Plan</p>
                  </div>
                  <div className="relative">
                    <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-xl border-2 border-indigo-500/30 shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 border-2 border-slate-950 rounded-full p-0.5">
                      <ChevronDown className={`w-2.5 h-2.5 text-white transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-14 right-0 w-64 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 z-50">
                    <div className="p-4 bg-slate-800/30 border-b border-slate-800">
                      <div className="flex items-center gap-3 mb-1">
                        <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-2xl border border-white/5" />
                        <div>
                          <p className="text-sm font-bold text-white">{user.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[120px]">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      <p className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Configurações</p>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        Editar Perfil
                      </button>
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        Alterar palavra-passe
                      </button>
                    </div>

                    <div className="p-2 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-rose-600/10 flex items-center justify-center">
                          <LogOut className="w-4 h-4" />
                        </div>
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}
        <div className={`flex-1 overflow-y-auto p-4 lg:p-8 transition-all duration-700 ${isFocusActive ? 'flex items-center justify-center' : ''}`}>
          <div className={`${isFocusActive ? 'w-full' : 'max-w-6xl mx-auto space-y-8'}`}>{renderContent()}</div>
        </div>
      </main>
    </div>
  );
};

export default App;
