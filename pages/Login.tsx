import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err: any) {
      setError('Falha ao entrar. Verifique suas credenciais.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs specific for login page */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-75"></div>

      <div className="max-w-md w-full bg-slate-900/40 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden relative z-10 animate-fade-in">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg shadow-primary-500/40">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">Bem-vindo de volta</h2>
          <p className="text-center text-slate-400 mb-8">Acesse sua conta para gerenciar seus pacientes</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 mb-6 rounded-xl backdrop-blur-sm">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all hover:bg-slate-950/70"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-primary-400 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all hover:bg-slate-950/70"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Entrando...' : (
                <>
                  Entrar no Sistema <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
        <div className="px-8 py-4 bg-slate-950/50 border-t border-white/5 flex justify-center backdrop-blur-md">
          <p className="text-sm text-slate-400">
            Não tem uma conta?{' '}
            <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-semibold hover:underline decoration-primary-400/30">
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;