
import React from 'react';
import { 
  Briefcase, 
  User, 
  Heart, 
  Book, 
  DollarSign,
  LayoutDashboard,
  CheckSquare,
  Repeat,
  Target,
  Droplets,
  Calendar as CalendarIcon,
  Sparkles,
  Timer,
  Dumbbell
} from 'lucide-react';
import { Category } from './types';

export const CATEGORY_ICONS: Record<Category, React.ReactNode> = {
  [Category.WORK]: <Briefcase className="w-4 h-4" />,
  [Category.PERSONAL]: <User className="w-4 h-4" />,
  [Category.HEALTH]: <Heart className="w-4 h-4" />,
  [Category.STUDY]: <Book className="w-4 h-4" />,
  [Category.FINANCE]: <DollarSign className="w-4 h-4" />
};

export const NAVIGATION = [
  { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'tasks', name: 'Tarefas', icon: <CheckSquare className="w-5 h-5" /> },
  { id: 'focus', name: 'Modo Foco', icon: <Timer className="w-5 h-5" /> },
  { id: 'gym', name: 'Treino', icon: <Dumbbell className="w-5 h-5" /> },
  { id: 'habits', name: 'Hábitos', icon: <Repeat className="w-5 h-5" /> },
  { id: 'goals', name: 'Metas', icon: <Target className="w-5 h-5" /> },
  { id: 'water', name: 'Hidratação', icon: <Droplets className="w-5 h-5" /> },
  { id: 'calendar', name: 'Calendário', icon: <CalendarIcon className="w-5 h-5" /> },
  { id: 'ai', name: 'IA Assistente', icon: <Sparkles className="w-5 h-5" /> }
];

export const PRIORITY_COLORS = {
  LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
};
