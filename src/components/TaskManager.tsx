
import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Calendar as CalIcon,
  Tag,
  Trash2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { Task, Category, TaskPriority } from '../types';
import { CATEGORY_ICONS, PRIORITY_COLORS } from '../constants';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface TaskManagerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  cardClass?: string;
  isLight?: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ tasks, setTasks, cardClass, isLight }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'ALL'>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Category>(Category.WORK);
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);

  const handleAddTask = async () => {
    if (!newTitle.trim() || !user) return;
    setIsSubmitting(true);

    try {
      const newTaskPayload = {
        user_id: user.id,
        title: newTitle,
        category: newCategory,
        priority: newPriority,
        completed: false,
        subtasks: []
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(newTaskPayload)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Map back to App Task type
        const newTask: Task = {
          id: data.id,
          title: data.title,
          category: data.category as Category,
          priority: data.priority as TaskPriority,
          completed: data.completed,
          subTasks: data.subtasks || [],
          dueDate: data.due_date,
          reminder: data.reminder
        };
        setTasks([newTask, ...tasks]);
        setNewTitle('');
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      showToast('Erro ao criar tarefa. Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTask = async (id: string, currentStatus: boolean) => {
    // Optimistic Update
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert on error
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: currentStatus } : t));
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    // Optimistic Update
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert on error
      setTasks(previousTasks);
      alert('Erro ao excluir tarefa.');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || task.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Pesquisar tarefas..."
            className={`w-full pl-12 pr-4 py-3 border rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isLight ? 'bg-white/50 border-white/20 text-slate-900 placeholder-slate-400' : 'bg-slate-900 border-slate-800 text-slate-200'}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            className={`border py-3 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isLight ? 'bg-white/50 border-white/20 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-300'}`}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as Category | 'ALL')}
          >
            <option value="ALL">Todas Categorias</option>
            {Object.values(Category).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-2xl transition-colors shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-5 h-5" />
            Adicionar
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map(task => (
          <div
            key={task.id}
            className={`
              group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 backdrop-blur-xl
              ${task.completed
                ? 'opacity-60 grayscale-[0.5]'
                : `${cardClass || 'bg-slate-900 border-slate-800'} hover:scale-[1.01] hover:border-indigo-500/30 shadow-lg shadow-indigo-500/5`}
              ${isLight ? 'border-white/40' : 'border-slate-800'}
            `}
          >
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => toggleTask(task.id, task.completed)}
                className="transition-transform active:scale-90"
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-indigo-500" />
                ) : (
                  <Circle className="w-6 h-6 text-slate-600 group-hover:text-indigo-400" />
                )}
              </button>

              <div className="flex flex-col">
                <span className={`font-bold ${task.completed ? 'line-through text-slate-500' : (isLight ? 'text-slate-900' : 'text-slate-100')}`}>
                  {task.title}
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    {CATEGORY_ICONS[task.category]}
                    {task.category}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-500 hover:text-indigo-400 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {filteredTasks.length === 0 && (
          <div className={`${cardClass || 'bg-slate-900/50'} backdrop-blur-xl text-center py-20 rounded-[2.5rem] border border-dashed ${isLight ? 'border-indigo-200' : 'border-slate-800'}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-indigo-50' : 'bg-slate-800'}`}>
              <Search className={`w-8 h-8 ${isLight ? 'text-indigo-400' : 'text-slate-600'}`} />
            </div>
            <h4 className={`font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Nenhuma tarefa encontrada</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
              Não encontramos tarefas para os filtros aplicados. Tente buscar por outros termos ou crie uma nova.
            </p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-6">Nova Tarefa</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="O que precisa ser feito?"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoria</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Category)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {Object.values(Category).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Prioridade</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                  >
                    {Object.values(TaskPriority).map(prio => (
                      <option key={prio} value={prio}>{prio}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTask}
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;
