import React, { useState } from 'react';
import { X, Lock, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type: 'success' | 'alert' | 'info') => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, showToast }) => {
    const { updatePassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('As palavras-passe não coincidem.', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('A palavra-passe deve ter pelo menos 6 caracteres.', 'error');
            return;
        }

        setIsSaving(true);

        try {
            const { error } = await updatePassword(password);

            if (error) throw error;

            showToast('Palavra-passe alterada com sucesso!', 'success');
            onClose();
            setPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Alterar palavra-passe</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nova Palavra-passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Confirmar Nova Palavra-passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <CheckCircle2 className={`h-4 w-4 ${password && password === confirmPassword ? 'text-emerald-500' : 'text-slate-500'}`} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`block w-full pl-11 pr-4 py-3 bg-slate-800/50 border rounded-2xl text-slate-200 focus:outline-none focus:ring-2 transition-all font-medium ${confirmPassword && password !== confirmPassword
                                        ? 'border-rose-500/50 focus:ring-rose-500/40 focus:border-rose-500/50'
                                        : 'border-slate-700/50 focus:ring-emerald-500/40 focus:border-emerald-500/50'
                                        }`}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            {confirmPassword && password !== confirmPassword && (
                                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-tight px-1 mt-1">As palavras-passe não coincidem</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-2xl">
                        <p className="text-[11px] text-emerald-400 font-medium leading-relaxed">
                            Dica: Use uma combinação de letras, números e símbolos para uma palavra-passe mais segura.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !password || password !== confirmPassword}
                            className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
