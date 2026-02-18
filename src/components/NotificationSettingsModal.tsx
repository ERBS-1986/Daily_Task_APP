import React, { useState } from 'react';
import { X, Volume2, Music, Bell } from 'lucide-react';

interface NotificationSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToast: (message: string, type: 'success' | 'alert' | 'info') => void;
}

const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose, showToast }) => {
    const [notifSound, setNotifSound] = useState(() => localStorage.getItem('ff_notif_sound') || 'default');
    const [notifVolume, setNotifVolume] = useState(() => parseInt(localStorage.getItem('ff_notif_volume') || '80'));

    if (!isOpen) return null;

    const handleSave = () => {
        localStorage.setItem('ff_notif_sound', notifSound);
        localStorage.setItem('ff_notif_volume', notifVolume.toString());
        showToast('Configurações de som salvas!', 'success');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-500" /> Configuração de Alertas
                    </h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                            <Music className="w-4 h-4 text-indigo-400" /> Toque das Notificações
                        </label>
                        <select
                            value={notifSound}
                            onChange={(e) => setNotifSound(e.target.value)}
                            className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium"
                        >
                            <option value="default">Padrão Digital</option>
                            <option value="soft">Suave e Calmo</option>
                            <option value="energy">Energético</option>
                            <option value="minimal">Minimalista</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-indigo-400" /> Volume</span>
                            <span className="font-black text-indigo-400">{notifVolume}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={notifVolume}
                            onChange={(e) => setNotifVolume(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>Mudo</span>
                            <span>Máximo</span>
                        </div>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/10 p-5 rounded-[1.5rem] flex items-start gap-4">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 animate-pulse"></div>
                        <p className="text-xs text-indigo-300 font-medium leading-relaxed">
                            Estas configurações afetam todos os alertas do sistema, incluindo lembretes de hidratação e tarefas.
                        </p>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-2xl transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/30"
                        >
                            Salvar Alterações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettingsModal;
