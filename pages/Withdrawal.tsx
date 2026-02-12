
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { createWithdrawal, getCurrentUser, refreshUserData } from '../services/storageService';
import { 
  Loader2, 
  ArrowLeft, 
  Wallet, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  Info, 
  X, 
  CheckCircle,
  ShieldCheck,
  Zap,
  ArrowDownToLine,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Withdrawal: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Orange Money');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
  const [isOutsideHours, setIsOutsideHours] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.withdrawalAccount) {
      setAccountNumber(user.withdrawalAccount);
    }
    checkOperatingHours();
  }, [user]);

  const checkOperatingHours = () => {
    const now = new Date();
    const day = now.getDay(); 
    const hour = now.getHours();

    const isSunday = day === 0;
    const isClosedHours = hour >= 20; 
    
    if (isSunday) {
        setIsOutsideHours(true);
        setMessage({ type: 'error', text: 'System Closed. Withdrawals available Mon-Sat.' });
    } else if (isClosedHours) {
        setIsOutsideHours(true);
        setMessage({ type: 'error', text: 'Daily cutoff time is 8:00 PM. Please try again tomorrow.' });
    } else {
        setIsOutsideHours(false);
    }
  };

  const handleInitiateWithdrawal = async () => {
    checkOperatingHours();
    if (isOutsideHours) return; 

    setMessage(null);

    const withdrawAmount = parseFloat(amount);
    if (!amount || !accountNumber) {
        setMessage({ type: 'error', text: 'Protocol Error: All data slots must be filled.' });
        return;
    }
    
    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
        setMessage({ type: 'error', text: 'Threshold Error: Minimum extraction is 100 SLE.' });
        return;
    }

    if (!user || user.balance < withdrawAmount) {
        setMessage({ type: 'error', text: 'Liquidity Error: Insufficient funds in neural vault.' });
        return;
    }

    setShowConfirmModal(true);
  };

  const processWithdrawal = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      await createWithdrawal(user.id, parseFloat(amount), `${method} - ${accountNumber}`);
      await refreshUserData();
      setUser(getCurrentUser());
      
      setShowConfirmModal(false);
      setMessage({ type: 'success', text: `Extraction Logged. SLE ${amount} deducted from grid.` });
      setTimeout(() => navigate('/history'), 2500);
    } catch (err: any) {
      setShowConfirmModal(false);
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Header title="Extraction Terminal" />
      
      <div className="max-w-xl mx-auto p-4 md:p-0 pt-4">
        {/* Back Navigation - Compact */}
        <div className="hidden md:flex items-center gap-2 mb-6 text-gray-500 hover:text-white cursor-pointer w-fit transition group" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[9px] uppercase tracking-widest">Core Return</span>
        </div>

        {/* Available Liquidity Card - Compacted emerald accent */}
        <div className="relative overflow-hidden bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[32px] p-6 border border-emerald-500/10 shadow-2xl mb-6 group transition-all duration-500">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-[50px] pointer-events-none rounded-full"></div>
            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1.5">Extractable Balance</p>
                    <h2 className="text-3xl font-black text-white tracking-tighter">
                        SLE {(user?.balance ?? 0).toLocaleString()}
                    </h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-105 transition-transform">
                    <Wallet size={24} />
                </div>
            </div>
        </div>

        {message && (
            <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 border ${
                message.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
                <div className={`p-1.5 rounded-lg ${message.type === 'error' ? 'bg-rose-500/20' : 'bg-emerald-500/20'}`}>
                    {message.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                </div>
                <span className="font-black text-[9px] uppercase tracking-widest leading-relaxed">{message.text}</span>
            </div>
        )}

        {/* Input Terminal Area - Compacted padding */}
        <div className={`space-y-3 ${isOutsideHours ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <div className="bg-[#0a0a0f]/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 transition-all focus-within:border-emerald-500/30 group">
                <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                    <Hash size={12} className="text-emerald-500" />
                    Account (Orange Money)
                </label>
                <input 
                    type="text" 
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter Account Number"
                    className="w-full bg-transparent text-lg font-black text-white placeholder-white/5 focus:outline-none tracking-widest font-mono"
                />
            </div>

            <div className="bg-[#0a0a0f]/60 backdrop-blur-xl p-6 rounded-[32px] border border-white/5 transition-all focus-within:border-emerald-500/30 group">
                <label className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full group-focus-within:animate-ping"></div>
                    Cash Out (Min 100)
                </label>
                <div className="flex items-baseline gap-3">
                    <span className="text-xl font-black text-emerald-500">SLE</span>
                    <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-transparent text-4xl font-black text-white placeholder-white/5 focus:outline-none tracking-tighter"
                    />
                </div>
            </div>
        </div>

        {/* Submit Action - Compacted height */}
        <button 
            onClick={handleInitiateWithdrawal}
            disabled={loading || isOutsideHours}
            className={`mt-8 w-full h-16 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 transform active:scale-95 relative overflow-hidden group ${
                isOutsideHours 
                ? 'bg-gray-800 text-gray-600 border border-white/5' 
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_15px_30px_-10px_rgba(16,185,129,0.4)]'
            }`}
        >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            {loading ? (
                <Loader2 className="animate-spin" size={20} />
            ) : (
                <>
                  {isOutsideHours ? <Clock size={18} /> : <ArrowDownToLine size={18} />}
                  {isOutsideHours ? 'System Offline' : 'Submit Withdrawal'}
                </>
            )}
        </button>

        {/* Professional Guidelines Block - More compact grid */}
        <div className="mt-8 bg-emerald-500/5 rounded-[32px] p-6 border border-emerald-500/10 space-y-4">
            <div className="flex items-center gap-2.5 pl-1">
                <Info size={14} className="text-emerald-400" />
                <h4 className="text-white font-black text-[9px] uppercase tracking-widest">Protocol Directives</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <GuidelineItem icon={<Calendar size={12} />} label="Days" value="Mon - Sat" />
                <GuidelineItem icon={<Clock size={12} />} label="Cutoff" value="8:00 PM" />
                <GuidelineItem icon={<AlertTriangle size={12} />} label="Min Limit" value="100 SLE" />
                <GuidelineItem icon={<ShieldCheck size={12} />} label="Security" value="Secure Sync" />
            </div>
        </div>

        <p className="text-center mt-8 text-[8px] text-gray-600 font-black uppercase tracking-[0.2em]">
            Auth Protocol: RSA-4096 Extraction Key
        </p>
      </div>

      {/* Confirmation Overlay - Compacted */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#0f172a] border border-white/10 rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Confirmation</h3>
                    <button onClick={() => setShowConfirmModal(false)} className="p-2 text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="space-y-4 mb-8">
                    <div className="bg-black/60 rounded-3xl p-6 border border-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Amount</span>
                            <span className="text-emerald-400 font-black text-xl tracking-tighter">SLE {parseFloat(amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/5">
                            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">Account</span>
                            <span className="text-white font-mono font-bold text-xs tracking-widest">{accountNumber}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-4 rounded-2xl font-black text-[9px] uppercase tracking-widest text-gray-500 bg-white/5"
                    >
                        Abort
                    </button>
                    <button 
                        onClick={processWithdrawal}
                        disabled={loading}
                        className="flex-[2] py-4 rounded-2xl font-black text-[9px] uppercase tracking-[0.2em] text-white bg-emerald-600 shadow-xl shadow-emerald-900/40 flex justify-center items-center gap-2 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16}/> : (
                            <><CheckCircle size={16} /> Confirm</>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

const GuidelineItem: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <div>
            <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-0.5">{label}</p>
            <p className="text-[9px] text-white font-black uppercase tracking-widest">{value}</p>
        </div>
    </div>
);

export default Withdrawal;
