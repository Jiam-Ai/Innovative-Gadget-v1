
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerUser } from '../services/storageService';
import { Loader2, ArrowRight, ShieldCheck, UserPlus, Lock, Smartphone, Fingerprint } from 'lucide-react';
import { Logo } from '../components/Logo';

const Register: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Bonus removed as per request
      await registerUser(phone, password, referralCode, 0); 
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Apple-style light leak */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="glass-obsidian w-full max-w-[480px] rounded-[56px] p-10 md:p-14 animate-spring-in shadow-2xl relative overflow-hidden border border-emerald-500/10">
        
        {/* Visual Header Highlights */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

        <div className="relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex p-1 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-[32px] mb-8 emerald-glow">
              <div className="bg-[#050505] p-5 rounded-[28px] border border-white/5">
                <Logo size={72} />
              </div>
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase leading-none">Create Account</h1>
            <p className="text-[10px] text-emerald-400 font-black tracking-[0.4em] uppercase opacity-60">Innovative Gadget Protocol</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Phone Number
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/40 focus:bg-black/60 transition-all font-bold text-lg"
                  placeholder="07x xxxx xxx"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Lock size={12} className="text-emerald-500" />
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white placeholder-white/10 focus:outline-none focus:border-emerald-500/40 focus:bg-black/60 transition-all font-bold text-lg"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Fingerprint size={12} className="text-emerald-500 opacity-50" />
                Invite Code (Optional)
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  readOnly={!!searchParams.get('ref')}
                  className={`w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 focus:outline-none transition-all font-bold tracking-widest ${referralCode ? 'text-emerald-400 border-emerald-500/30' : 'text-white'}`}
                  placeholder="Enter code"
                />
              </div>
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
              className="w-full h-16 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(16,185,129,0.5)] transition-all transform active:scale-[0.97] flex justify-center items-center group relative overflow-hidden btn-shine"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <span className="flex items-center gap-3 relative z-10">
                  Create Account 
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-14 text-center border-t border-white/5 pt-10">
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-white transition-all ml-1 underline decoration-emerald-500/30 underline-offset-4">
                Login Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
