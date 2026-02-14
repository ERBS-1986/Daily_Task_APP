
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
import ProfileModal from './components/ProfileModal';
import PasswordModal from './components/PasswordModal';
import { useToast } from './contexts/ToastContext';



const THEMES: { id: AppTheme, name: string, bgClass: string, sidebarClass: string, cardClass: string, color: string }[] = [
  { id: 'lavender-light', name: 'Premium Lavender', bgClass: 'bg-[#F0F2FF]', sidebarClass: 'bg-white/60', cardClass: 'bg-white/80', color: '#818CF8' },
  { id: 'default', name: 'Padrão Dark', bgClass: 'bg-slate-950', sidebarClass: 'bg-slate-900/80', cardClass: 'bg-[#434B96]', color: '#6366f1' },
  { id: 'red', name: 'Vermelho', bgClass: 'bg-red-900', sidebarClass: 'bg-black/40', cardClass: 'bg-red-950/50', color: '#ef4444' },
  { id: 'green', name: 'Verde', bgClass: 'bg-emerald-900', sidebarClass: 'bg-black/40', cardClass: 'bg-emerald-950/50', color: '#10b981' },
  { id: 'blue', name: 'Azul', bgClass: 'bg-blue-900', sidebarClass: 'bg-black/40', cardClass: 'bg-blue-950/50', color: '#3b82f6' },
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const { showToast } = useToast();


  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => (localStorage.getItem('ff_theme') as AppTheme) || 'lavender-light');
  const [isLoadingData, setIsLoadingData] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    localStorage.setItem('ff_theme', currentTheme);
    if (currentTheme === 'lavender-light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
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

  useEffect(() => {
    if (user) {
      fetchData();

      // Mostrar boas-vindas apenas na primeira vez nesta sessão
      const hasWelcomed = sessionStorage.getItem('daily_task_welcomed');
      if (!hasWelcomed) {
        setNotifications([{ id: 'welcome', title: 'Bem-vindo de volta!', message: 'Sua jornada de alta performance continua.', time: 'Agora', type: 'info', read: false }]);
        sessionStorage.setItem('daily_task_welcomed', 'true');
      }
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
      if (waterResult.data) {
        const waterData = waterResult.data;
        const lastUpdate = new Date(waterData.updated_at);
        const today = new Date();

        // Reset if date changed
        if (lastUpdate.toDateString() !== today.toDateString()) {
          console.log('[App] Dia mudou, resetando hidratação...');
          const resetWater = { ...waterData, current: 0, updated_at: today.toISOString() };
          await supabase.from('water_intake').update({ current: 0, updated_at: today.toISOString() }).eq('user_id', user.id);
          setWater(resetWater);
        } else {
          setWater(waterData);
        }
      }

      // If water data is missing (new user), create it
      if (!waterResult.data && !waterResult.error) {
        const defaultWater = {
          user_id: user.id,
          target: 2500,
          current: 0,
          unit: 'ml',
          updated_at: new Date().toISOString()
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
    const isLight = currentTheme === 'lavender-light';
    const commonProps = { cardClass: currentThemeData.cardClass, isLight };

    switch (activeTab) {
      case 'dashboard': return <Dashboard {...commonProps} tasks={tasks} habits={habits} goals={goals} water={water} workouts={workouts} onNavigate={setActiveTab} />;
      case 'tasks': return <TaskManager {...commonProps} tasks={tasks} setTasks={setTasks} />;
      case 'habits': return <HabitTracker {...commonProps} habits={habits} setHabits={setHabits} />;
      case 'goals': return <GoalsManager {...commonProps} goals={goals} setGoals={setGoals} />;
      case 'water': return <WaterManager {...commonProps} water={water} setWater={setWater} />;
      case 'gym': return <GymManager {...commonProps} workouts={workouts} setWorkouts={setWorkouts} />;
      case 'calendar': return <CalendarSync {...commonProps} />;
      case 'focus': return <FocusMode {...commonProps} tasks={tasks} isGlobalFocusActive={isFocusActive} setIsGlobalFocusActive={setIsFocusActive} />;
      default: return <Dashboard {...commonProps} tasks={tasks} habits={habits} goals={goals} water={water} workouts={workouts} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-1000 ${currentThemeData.bgClass}`}>
      {isSidebarOpen && !isFocusActive && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${currentThemeData.sidebarClass} backdrop-blur-2xl border-r border-white/20 transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen && !isFocusActive ? 'translate-x-0' : '-translate-x-full'} ${isFocusActive ? 'lg:-translate-x-full lg:hidden' : ''} shadow-2xl overflow-hidden`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header Illustration Area */}
          <div className="relative h-48 mb-4 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 z-0"></div>
            {/* Placeholder for Illustration */}
            <div className="absolute inset-0 flex items-end p-6 z-10 bg-gradient-to-t from-white/40 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                  <CalIcon className="w-8 h-8 text-indigo-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Daily Task</h1>
                  <p className="text-xs font-bold text-indigo-600/70 uppercase tracking-widest">Produtividade</p>
                </div>
              </div>
            </div>
            {/* Soft blob decor */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl"></div>
          </div>

          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
            {NAVIGATION.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-indigo-600/10 text-indigo-600 border border-indigo-600/10 shadow-sm' : 'text-slate-500 hover:bg-black/5 hover:text-slate-800'}`}
              >
                <div className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : ''}`}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: `w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`
                  })}
                </div>
                <span className={`font-bold text-sm ${activeTab === item.id ? 'translate-x-1' : ''} transition-transform`}>{item.name}</span>
                {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/50"></div>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-black/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-rose-500 w-full rounded-2xl hover:bg-rose-500/5 transition-all group font-bold text-sm"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {!isFocusActive && (
          <header className={`h-20 ${currentTheme === 'lavender-light' ? 'bg-white/20' : 'bg-white/5'} backdrop-blur-xl border-b border-black/5 flex items-center justify-between px-6 lg:px-10 z-30 animate-in slide-in-from-top-4 duration-700`}>
            <button className="lg:hidden p-2 text-slate-500 hover:text-indigo-600 transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-7 h-7" />
            </button>
            <div className="flex-1 lg:flex-none ml-4 lg:ml-0">
              <h2 className={`text-xl font-bold ${currentTheme === 'lavender-light' ? 'text-slate-800' : 'text-slate-100'} hidden md:block`}>{NAVIGATION.find(n => n.id === activeTab)?.name || 'Daily Task'}</h2>
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
                      <button
                        onClick={() => { setIsProfileModalOpen(true); setIsProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 flex items-center justify-center">
                          <UserIcon className="w-4 h-4 text-indigo-400" />
                        </div>
                        Editar Perfil
                      </button>
                      <button
                        onClick={() => { setIsPasswordModalOpen(true); setIsProfileMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/5 hover:text-white rounded-xl transition-all"
                      >
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

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        showToast={showToast}
      />
      <PasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        showToast={showToast}
      />
    </div>
  );
};

export default App;
