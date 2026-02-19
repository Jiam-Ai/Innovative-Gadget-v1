
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { registerUser } from '../services/storageService';
import { Loader2, ArrowRight, Smartphone, Lock, Fingerprint, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Logo } from '../components/Logo';

const Register: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Real-time validation states
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [passValid, setPassValid] = useState<boolean | null>(null);
  const [matchValid, setMatchValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (phone.length > 0) setPhoneValid(phone.length >= 8);
    else setPhoneValid(null);
  }, [phone]);

  useEffect(() => {
    if (password.length > 0) setPassValid(password.length >= 6);
    else setPassValid(null);
    if (confirmPass.length > 0) setMatchValid(password === confirmPass);
    else setMatchValid(null);
  }, [password, confirmPass]);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone || phone.length < 8) {
      setError('A valid phone number is required (min 8 digits).');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await registerUser(phone, password, referralCode, 0); 
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      
      {/* Header with Background Image & Curved Bottom */}
      <div className="relative w-full h-[320px] shrink-0 mb-6">
        <div 
            className="absolute inset-0 bg-cover bg-center opacity-60"
            style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2001&auto=format&fit=crop")',
                clipPath: 'ellipse(110% 80% at 50% 0%)'
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black"></div>
        </div>
        
        {/* Logo and Headings */}
        <div className="relative z-10 flex flex-col items-center pt-20 animate-spring-in">
          <div className="mb-6 bg-black p-2 rounded-[32px] border border-white/5 shadow-2xl">
            <Logo size={85} className="relative z-10" />
          </div>
          
          <h1 className="text-5xl font-serif font-black text-white mb-2 tracking-tight uppercase">Join Us</h1>
          <p className="text-[11px] text-emerald-500 font-black uppercase tracking-[0.4em]">Create your account</p>
        </div>
      </div>

      <div className="w-full max-w-[460px] px-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-4">
            <div className="group relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Smartphone size={20} />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full h-16 bg-[#0a0a0f] border rounded-full pl-16 pr-6 text-white text-sm font-bold focus:outline-none transition-all placeholder:text-gray-600 shadow-inner ${phoneValid === false ? 'border-rose-500/50' : 'border-white/10 focus:border-white/30'}`}
                placeholder="Phone Number"
                required
              />
            </div>

            <div className="group relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full h-16 bg-[#0a0a0f] border rounded-full pl-16 pr-16 text-white text-sm font-bold focus:outline-none transition-all placeholder:text-gray-600 shadow-inner ${passValid === false ? 'border-rose-500/50' : 'border-white/10 focus:border-white/30'}`}
                placeholder="Secure Password (Min 6)"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="group relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Lock size={20} className="opacity-50" />
              </div>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className={`w-full h-16 bg-[#0a0a0f] border rounded-full pl-16 pr-16 text-white text-sm font-bold focus:outline-none transition-all placeholder:text-gray-600 shadow-inner ${matchValid === false ? 'border-rose-500/50' : 'border-white/10 focus:border-white/30'}`}
                placeholder="Confirm Password"
                required
              />
            </div>

            <div className="group relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                <Fingerprint size={20} />
              </div>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full h-16 bg-[#0a0a0f] border border-white/10 rounded-full pl-16 pr-6 text-white text-sm font-bold focus:outline-none focus:border-white/30 transition-all placeholder:text-gray-600 shadow-inner"
                placeholder="Invite Code (Optional)"
              />
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 py-4 px-6 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
              <AlertCircle className="inline-block mr-2" size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-18 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] flex justify-center items-center gap-3 transition-all active:scale-[0.97] group shadow-[0_10px_30px_rgba(16,185,129,0.3)] disabled:opacity-50 mt-4"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-auto w-full relative pt-20">
          <div 
              className="absolute inset-x-0 bottom-0 h-48 bg-emerald-950/20"
              style={{ 
                  clipPath: 'ellipse(100% 100% at 50% 100%)',
                  backgroundImage: 'url("https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=2001&auto=format&fit=crop")',
                  backgroundPosition: 'bottom center',
                  backgroundSize: 'cover',
                  opacity: 0.15
              }}
          ></div>
          <div className="relative z-10 text-center pb-12 pt-6">
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">
                Already registered?{' '}
                <Link to="/login" className="text-emerald-500 hover:underline underline-offset-4 ml-1">
                  Sign In
                </Link>
              </p>
          </div>
      </div>
    </div>
  );
};

export default Register;
