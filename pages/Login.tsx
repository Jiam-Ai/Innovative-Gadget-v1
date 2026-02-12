
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/storageService';
import { Loader2, ArrowRight, ShieldCheck, Lock, Smartphone } from 'lucide-react';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(phone, password);
      if (user.isAdmin) {
          navigate('/admin/overview');
      } else {
          navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="glass-obsidian w-full max-w-[460px] rounded-[56px] p-10 md:p-14 animate-spring-in shadow-2xl relative overflow-hidden border border-emerald-500/10">
        <div className="relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex p-1 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-[32px] mb-8 emerald-glow">
              <div className="bg-[#050505] p-5 rounded-[28px] border border-white/5">
                <Logo size={72} />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase leading-none">Welcome Back</h1>
            <p className="text-[10px] text-emerald-400 font-black tracking-[0.4em] uppercase opacity-60">Safe & Secure Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Smartphone size={12} className="text-emerald-500" />
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/60 transition-all font-bold text-lg"
                placeholder="000 000 000"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} className="text-emerald-500" />
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-emerald-500/40 focus:bg-black/60 transition-all font-bold text-lg"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-rose-400 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 py-4 px-6 rounded-2xl border border-rose-500/10 text-center animate-pulse flex items-center justify-center gap-2">
                <ShieldCheck size={14} className="opacity-50" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex justify-center items-center group relative overflow-hidden btn-shine"
            >
              {loading ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-3">Login Now <ArrowRight size={18} /></span>}
            </button>
          </form>

          <div className="mt-14 text-center border-t border-white/5 pt-10">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
              First time here?{' '}
              <Link to="/register" className="text-emerald-400 hover:text-white transition-all ml-1">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
