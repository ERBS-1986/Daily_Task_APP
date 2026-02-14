
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
    <div className="min-h-screen w-full bg-[#3580BB] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30 mx-auto mb-4">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Daily Task</h1>
          <p className="text-slate-400 mt-2 font-medium">Sua jornada de alta performance começa aqui.</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex p-2 bg-white/5 border-b border-white/5">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === 'signup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              <UserPlus className="w-4 h-4" /> Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Senha</label>
                {mode === 'login' && <button type="button" className="text-[10px] text-indigo-400 hover:underline font-bold uppercase">Esqueceu?</button>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Entrar no Dashboard' : 'Criar Minha Conta'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Temporariamente removido - Login Social
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest"><span className="bg-slate-900/0 px-2 text-slate-500">ou continuar com</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-xs transition-all shadow-lg"
              >
                <Chrome className="w-4 h-4 text-rose-500" /> Google
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs transition-all border border-slate-700 shadow-lg"
              >
                <Github className="w-4 h-4" /> Github
              </button>
            </div>
            */}
          </form>
        </div>

        <p className="text-center mt-8 text-xs text-slate-500 font-medium">
          Ao continuar, você concorda com nossos <br />
          <span className="text-slate-300 hover:underline cursor-pointer">Termos de Serviço</span> e <span className="text-slate-300 hover:underline cursor-pointer">Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
};

export default Auth;
