
export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Category {
  WORK = 'Trabalho',
  PERSONAL = 'Pessoal',
  HEALTH = 'Saúde',
  STUDY = 'Estudos',
  FINANCE = 'Finanças'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'Free' | 'Premium';
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  subTasks: SubTask[];
  reminder?: string;
}

export interface Habit {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  lastCompleted?: string;
  history: string[]; // dates of completion
}

export interface WeeklyGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface WaterIntake {
  target: number;
  current: number;
  unit: 'ml';
  remindersEnabled: boolean;
  reminderType: 'interval' | 'scheduled';
  reminderInterval?: number; // em minutos
  scheduledTimes?: string[]; // ["08:00", "10:00", ...]
  updated_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  completed: boolean;
  gifUrl?: string; // URL para o GIF do exercício
}

export interface DailyWorkout {
  day: string;
  focus: string;
  exercises: Exercise[];
  image: string;
}

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'alert' | 'info';
  read: boolean;
}

export type AppTheme = 'default' | 'red' | 'green' | 'blue' | 'pink' | 'purple' | 'lavender-light';
