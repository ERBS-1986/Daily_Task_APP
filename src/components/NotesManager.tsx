import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Note } from '../types';
import {
    StickyNote, Plus, Pencil, Trash2, X, Save,
    Copy, CheckSquare, Target, Activity
} from 'lucide-react';

interface NotesManagerProps {
    cardClass?: string;
    isLight?: boolean;
    themeId?: string;
    onConvertToTask?: (title: string) => void;
    onConvertToHabit?: (title: string) => void;
    onConvertToGoal?: (title: string) => void;
}

const NotesManager: React.FC<NotesManagerProps> = ({
    cardClass,
    isLight,
    themeId,
    onConvertToTask,
    onConvertToHabit,
    onConvertToGoal
}) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [notes, setNotes] = useState<Note[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form State
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formContent, setFormContent] = useState('');

    // Dropdown state for Convert
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchNotes();
        }
    }, [user]);

    const fetchNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('notes')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (err) {
            console.error('Error fetching notes:', err);
        }
    };

    const handleSaveNote = async () => {
        if (!formTitle.trim() || !user) {
            showToast('O título da nota é obrigatório.', 'error');
            return;
        }

        try {
            if (isEditMode && currentNoteId) {
                const { error } = await supabase
                    .from('notes')
                    .update({ title: formTitle, content: formContent })
                    .eq('id', currentNoteId);

                if (error) throw error;
                showToast('Nota atualizada!', 'success');
            } else {
                const { error } = await supabase
                    .from('notes')
                    .insert({
                        user_id: user.id,
                        title: formTitle,
                        content: formContent
                    });

                if (error) throw error;
                showToast('Nota criada!', 'success');
            }

            await fetchNotes();
            closeModal();
        } catch (err) {
            console.error('Error saving note:', err);
            showToast('Erro ao salvar nota.', 'error');
        }
    };

    const deleteNote = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta nota?')) return;
        try {
            const { error } = await supabase.from('notes').delete().eq('id', id);
            if (error) throw error;

            await fetchNotes();
            showToast('Nota excluída.', 'info');
        } catch (err) {
            console.error('Error deleting note:', err);
            showToast('Erro ao excluir nota.', 'error');
        }
    };

    const openNewModal = () => {
        setIsEditMode(false);
        setCurrentNoteId(null);
        setFormTitle('');
        setFormContent('');
        setShowModal(true);
    };

    const openEditModal = (note: Note) => {
        setIsEditMode(true);
        setCurrentNoteId(note.id);
        setFormTitle(note.title);
        setFormContent(note.content || '');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormTitle('');
        setFormContent('');
        setCurrentNoteId(null);
        setIsEditMode(false);
    };

    const handleConvert = (noteTitle: string, type: 'task' | 'habit' | 'goal') => {
        setOpenDropdownId(null);
        if (type === 'task' && onConvertToTask) {
            onConvertToTask(noteTitle);
        } else if (type === 'habit' && onConvertToHabit) {
            onConvertToHabit(noteTitle);
        } else if (type === 'goal' && onConvertToGoal) {
            onConvertToGoal(noteTitle);
        } else {
            showToast('Função de conversão não configurada.', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className={`text-3xl font-black flex items-center gap-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <StickyNote className="w-8 h-8 text-amber-500" />
                        Minhas Notas
                    </h2>
                    <p className={`${isLight ? 'text-slate-600' : 'text-slate-400'} font-medium`}>Anote ideias e converta-as em tarefas, hábitos ou metas.</p>
                </div>

                <button
                    onClick={openNewModal}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nova Nota
                </button>
            </div>

            {/* List of Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length === 0 ? (
                    <div className={`col-span-full border p-12 text-center rounded-[2.5rem] backdrop-blur-2xl shadow-xl ${cardClass || 'bg-slate-900 border-slate-800'} ${isLight ? 'border-white/50' : 'border-slate-800'}`}>
                        <StickyNote className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold text-lg">Nenhuma nota encontrada</p>
                        <p className="text-slate-600 text-sm mt-2">Crie sua primeira nota para começar a organizar suas ideias.</p>
                    </div>
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            className={`p-6 border rounded-3xl backdrop-blur-xl shadow-lg relative group transition-all hover:-translate-y-1 ${cardClass || 'bg-slate-900 border-slate-800'} ${isLight ? 'border-white/50 bg-white/60' : 'border-slate-800'}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className={`font-bold text-lg truncate pr-8 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                    {note.title}
                                </h3>

                                {/* Actions */}
                                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-inherit pl-2">
                                    <button
                                        onClick={() => openEditModal(note)}
                                        className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors rounded-lg"
                                        title="Editar Nota"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteNote(note.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"
                                        title="Excluir Nota"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Convert Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setOpenDropdownId(openDropdownId === note.id ? null : note.id)}
                                            className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors rounded-lg"
                                            title="Converter em..."
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>

                                        {openDropdownId === note.id && (
                                            <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border p-2 z-20 ${isLight ? 'bg-white border-slate-200' : 'bg-slate-800 border-slate-700'}`}>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase px-3 py-1 mb-1">Converter para</p>
                                                <button
                                                    onClick={() => handleConvert(note.title, 'task')}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${isLight ? 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-600' : 'hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-400'}`}
                                                >
                                                    <CheckSquare className="w-4 h-4" /> Tarefa
                                                </button>
                                                <button
                                                    onClick={() => handleConvert(note.title, 'habit')}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${isLight ? 'hover:bg-amber-50 text-slate-700 hover:text-amber-600' : 'hover:bg-amber-500/20 text-slate-300 hover:text-amber-400'}`}
                                                >
                                                    <Activity className="w-4 h-4" /> Hábito
                                                </button>
                                                <button
                                                    onClick={() => handleConvert(note.title, 'goal')}
                                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${isLight ? 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-600' : 'hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400'}`}
                                                >
                                                    <Target className="w-4 h-4" /> Meta
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={`text-sm whitespace-pre-wrap ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                {note.content ? (
                                    note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content
                                ) : (
                                    <span className="italic opacity-50">Sem conteúdo...</span>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-500/20">
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {new Date(note.created_at).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={closeModal}></div>
                    <div className={`relative w-full max-w-2xl border rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 backdrop-blur-2xl ${isLight ? 'bg-white/90 border-white/20' : 'bg-slate-900 border-slate-800'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {isEditMode ? 'Editar Nota' : 'Nova Nota'}
                            </h3>
                            <button onClick={closeModal} className="text-slate-500 hover:text-rose-500 transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Título da Nota</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Ex: Ideias para o projeto..."
                                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all font-bold ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Conteúdo (Opcional)</label>
                                <textarea
                                    value={formContent}
                                    onChange={(e) => setFormContent(e.target.value)}
                                    placeholder="Escreva os detalhes da nota aqui..."
                                    rows={8}
                                    className={`w-full px-5 py-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none ${isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-800/50 border-slate-700 text-white'}`}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-4">
                                <button
                                    onClick={closeModal}
                                    className={`px-6 py-4 rounded-2xl font-bold transition-all ${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    {isEditMode ? 'Salvar Alterações' : 'Criar Nota'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesManager;
