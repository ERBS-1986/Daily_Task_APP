
import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, Github, Chrome, ArrowRight, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });
        if (error) throw error;
        alert('Conta criada! Verifique seu email para confirmar o cadastro (se necessário) ou faça login.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao tentar autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Google.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-premium-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-600/20 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-indigo-500/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_-12px_rgba(79,70,229,0.8)] mx-auto mb-6 transform hover:rotate-6 transition-transform">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tight drop-shadow-xl">Daily Task</h1>
          <p className="text-indigo-100/60 mt-4 font-medium text-lg tracking-wide">Sua jornada de alta performance começa aqui.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-[40px] border border-white/10 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden scale-105">
          {/* Custom Tabs from Capa 01 */}
          <div className="flex p-3 bg-white/5 border-b border-white/5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 ring-1 ring-white/20' : 'text-slate-400 hover:text-white'}`}
            >
              <ArrowRight className="w-4 h-4 rotate-0" /> Entrar
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-4 px-6 rounded-[1.5rem] text-sm font-black transition-all flex items-center justify-center gap-2 ${mode === 'signup' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 ring-1 ring-white/20' : 'text-slate-400 hover:text-white'}`}
            >
              <UserPlus className="w-4 h-4" /> Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-6">
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NOME COMPLETO</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-50 border-none rounded-[1.5rem] px-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-MAIL</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-50 border-none rounded-[1.5rem] pl-14 pr-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SENHA</label>
                {mode === 'login' && <button type="button" className="text-[10px] text-slate-500 hover:text-white font-black uppercase tracking-widest">ESQUECEU?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors z-10" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-none rounded-[1.5rem] pl-14 pr-6 py-4 text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black py-5 rounded-[1.5rem] shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)] transition-all flex items-center justify-center gap-3 mt-6 active:scale-95 border border-white/10"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <span className="text-lg">{mode === 'login' ? 'Entrar no Dashboard' : 'Criar Minha Conta'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center pb-8 px-10 text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">
            Termos de Serviço • Política de Privacidade
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
