
import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, BrainCircuit, Lightbulb } from 'lucide-react';
import { Task, Habit, WeeklyGoal } from '../types';
import { optimizeSchedule } from '../services/gemini';

interface AIAssistantProps {
  tasks: Task[];
  habits: Habit[];
  goals: WeeklyGoal[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ tasks, habits, goals }) => {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', text: string }[]>([
    { role: 'ai', text: 'Olá! Sou seu Assistente de Foco. Como posso ajudar a otimizar sua rotina hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // In a real app, we'd send the conversation context to Gemini
    // For this demo, we use a simple trigger
    setTimeout(async () => {
      const response = await optimizeSchedule(tasks);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* AI Header */}
      <div className="p-6 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Focus AI Mentor</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Online & Analisando</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-400 hover:text-indigo-400 bg-slate-900 rounded-xl transition-colors">
            <BrainCircuit className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-400 hover:text-amber-400 bg-slate-900 rounded-xl transition-colors">
            <Lightbulb className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-slate-800 border border-slate-700'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
              </div>
              <div className={`
                p-4 rounded-2xl text-sm leading-relaxed
                ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none'}
              `}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-slate-600 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Pergunte algo sobre sua produtividade..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button 
            onClick={handleSendMessage}
            className="absolute right-2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-3 uppercase tracking-widest font-bold">
          Powered by Gemini AI • Seu parceiro de evolução
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
