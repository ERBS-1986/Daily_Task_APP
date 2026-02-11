
import React, { useState } from 'react';
import { Calendar as CalIcon, RefreshCcw, ExternalLink, ShieldCheck, Check } from 'lucide-react';

const CalendarSync: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const mockEvents = [
    { id: '1', title: 'Reunião Trimestral', time: '14:00 - 15:30', date: 'Hoje' },
    { id: '2', title: 'Sync de Projeto', time: '10:00 - 11:00', date: 'Amanhã' },
    { id: '3', title: 'Consultoria de Design', time: '16:00 - 17:00', date: 'Amanhã' }
  ];

  const handleConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsConnected(true);
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shrink-0 shadow-xl shadow-blue-500/10">
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-16 h-16" />
          </div>
          
          <div className="text-center md:text-left space-y-2 flex-1">
            <h3 className="text-2xl font-bold text-white">Integração com Google Agenda</h3>
            <p className="text-slate-400 max-w-lg">
              Sincronize seus eventos e compromissos automaticamente para ter uma visão unificada do seu dia e nunca perder um prazo importante.
            </p>
          </div>

          <button 
            onClick={handleConnect}
            className={`
              px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all
              ${isConnected 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'}
            `}
          >
            {isSyncing ? (
              <>
                <RefreshCcw className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : isConnected ? (
              <>
                <Check className="w-5 h-5" />
                Conectado
              </>
            ) : (
              'Conectar Agora'
            )}
          </button>
        </div>
        
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl"></div>
      </div>

      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-100 flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-indigo-400" />
                Eventos Sincronizados
              </h4>
              <span className="text-xs text-slate-500">Última atualização: há 2 min</span>
            </div>
            
            {mockEvents.map(event => (
              <div key={event.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-blue-500 rounded-full"></div>
                  <div>
                    <h5 className="font-bold text-slate-200">{event.title}</h5>
                    <p className="text-xs text-slate-500">{event.time} • {event.date}</p>
                  </div>
                </div>
                <button className="p-2 text-slate-500 hover:text-indigo-400">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl h-fit space-y-4">
            <h4 className="font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Segurança
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Seus dados de agenda são criptografados e acessados apenas em modo de leitura. Não armazenamos informações confidenciais fora do seu navegador.
            </p>
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors">
              Gerenciar Permissões
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSync;
