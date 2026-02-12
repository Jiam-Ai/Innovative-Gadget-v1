
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/storageService';
import { Shield, Mail, Lock, AlertTriangle, Loader2 } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await loginUser(phone, password);
      if (user.isAdmin) {
        navigate('/admin/overview');
      } else {
        setError('Unauthorized Access Attempt. Credentials do not have root privilege.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
      setPhone('admin');
      setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#1a0b2e] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-[500px] bg-[#1e1136]/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
        
        <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 bg-emerald-500 rounded-[28px] flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-8 animate-bounce-subtle">
                <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SuperAdmin Portal</h1>
            <p className="text-gray-400 font-bold tracking-widest text-sm uppercase opacity-60">Innovative Gadget Administration</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Username / Access Phone</label>
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="admin@innovativegadget.io"
                        className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/20 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-gray-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold"
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-3">
                    <AlertTriangle size={16} /> {error}
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(5,150,105,0.3)] hover:shadow-[0_10px_40px_rgba(5,150,105,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3"
            >
                {loading ? <Loader2 className="animate-spin" /> : 'Access Dashboard'}
            </button>
        </form>

        <div className="mt-12">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-center justify-center gap-3">
                <AlertTriangle size={16} className="text-yellow-500" />
                <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Restricted Access - Authorized Personnel Only</span>
            </div>
            
            <button 
                onClick={handleDemo}
                className="w-full mt-4 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
            >
                Quick Fill Demo Credential
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
