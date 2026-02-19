
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/storageService';
import { Loader2, ArrowRight, Smartphone, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewState, setViewState] = useState<'login' | 'forgot'>('login');
  const navigate = useNavigate();

  // Real-time validation
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [passValid, setPassValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (phone.length > 0) setPhoneValid(phone.length >= 8);
    else setPhoneValid(null);
  }, [phone]);

  useEffect(() => {
    if (password.length > 0) setPassValid(password.length >= 6);
    else setPassValid(null);
  }, [password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneValid === false || passValid === false) {
      setError('Please fix the errors above.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await loginUser(phone, password);
      if (user.isAdmin) navigate('/admin/overview');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your phone and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Header with Background Image & Curved Bottom */}
      <div className="relative w-full h-[300px] shrink-0 mb-4">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=2000&auto=format&fit=crop")',
                clipPath: 'ellipse(110% 80% at 50% 0%)'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
        </div>
        
        {/* Logo and Headings */}
        <div className="relative z-10 flex flex-col items-center pt-16 animate-spring-in">
          <div className="mb-4 bg-black p-2 rounded-[28px] border border-white/5 shadow-2xl">
            <Logo size={75} className="relative z-10" />
          </div>
          
          <h1 className="text-4xl font-serif font-black text-white mb-1 tracking-tight uppercase">Login</h1>
          <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em]">Access your account</p>
        </div>
      </div>

      <div className="w-full max-w-[420px] px-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {viewState === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-3">
              <div className="group relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <Smartphone size={18} />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 bg-[#0a0a0f] border border-white/10 rounded-full pl-14 pr-6 text-white text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 shadow-inner"
                  placeholder="Phone Number"
                  required
                />
              </div>

              <div className="group relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 bg-[#0a0a0f] border border-white/10 rounded-full pl-14 pr-14 text-white text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 shadow-inner"
                  placeholder="Password"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end px-4">
              <button 
                type="button" 
                onClick={() => setViewState('forgot')}
                className="text-[9px] font-black text-gray-500 hover:text-emerald-500 uppercase tracking-widest transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 py-3 px-5 rounded-xl text-rose-500 text-[9px] font-black uppercase tracking-widest text-center animate-shake">
                <AlertCircle className="inline-block mr-2" size={12} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-3 transition-all active:scale-[0.97] group shadow-[0_10px_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
            <div className="p-8 bg-[#0a0a0f] border border-white/5 rounded-[32px] text-center space-y-4">
              <ShieldCheck className="mx-auto text-emerald-500" size={40} />
              <div className="space-y-1">
                <h3 className="text-white font-black uppercase text-xs tracking-widest">Reset Password</h3>
                <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                  Please contact our support team to help you reset your password.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setViewState('login')}
              className="w-full py-2 text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] hover:text-white flex items-center justify-center gap-2"
            >
              <ArrowLeft size={12} /> Back to Sign In
            </button>
          </div>
        )}
      </div>

      {/* Stylized Background Image Footer */}
      <div className="mt-auto w-full relative pt-20">
          <div 
              className="absolute inset-x-0 bottom-0 h-48 bg-emerald-950/20"
              style={{ 
                  clipPath: 'ellipse(100% 100% at 50% 100%)',
                  backgroundImage: 'url("https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=2000&auto=format&fit=crop")',
                  backgroundPosition: 'bottom center',
                  backgroundSize: 'cover',
                  opacity: 0.15
              }}
          >
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 text-center pb-12 pt-6">
              <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">
                New here?{' '}
                <Link to="/register" className="text-emerald-500 hover:underline underline-offset-4 ml-1">
                  Create Account
                </Link>
              </p>
          </div>
      </div>
    </div>
  );
};

export default Login;
