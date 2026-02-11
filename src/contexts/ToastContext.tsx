import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-rose-500" />;
            case 'info':
                return <AlertCircle className="w-5 h-5 text-indigo-500" />;
        }
    };

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-emerald-500/10 border-emerald-500/20';
            case 'error':
                return 'bg-rose-500/10 border-rose-500/20';
            case 'info':
                return 'bg-indigo-500/10 border-indigo-500/20';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`${getStyles(toast.type)} pointer-events-auto border backdrop-blur-sm rounded-2xl p-4 shadow-2xl flex items-center gap-3 min-w-[300px] animate-in slide-in-from-bottom-4 duration-300`}
                    >
                        {getIcon(toast.type)}
                        <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
