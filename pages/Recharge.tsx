
import React, { useState } from 'react';
import { Header } from '../components/Header.tsx';
import { ORANGE_MONEY_NUMBER, ORANGE_MONEY_DIAL_CODE } from '../constants.tsx';
import { createDeposit, getCurrentUser } from '../services/storageService.ts';
import { Copy, Loader2, Smartphone, Hash, ShieldCheck, Zap, QrCode, ArrowDownRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Recharge: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const handleSubmit = async () => {
    if (!amount || !txId) return alert('Please fill in all fields.');
    if(!user) return;
    setLoading(true);
    try {
      await createDeposit(user.id, parseFloat(amount), txId);
      setSuccess(true);
    } catch (error) {
      alert('Failed to send request.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505]">
             <div className="w-24 h-24 bg-emerald-500/20 rounded-[40px] flex items-center justify-center mb-8 border border-emerald-500/20">
                <ShieldCheck size={72} className="text-emerald-400" />
             </div>
             <h2 className="text-3xl font-black text-white mb-3 tracking-tighter uppercase">Protocol Sent</h2>
             <p className="text-gray-500 mb-10 max-w-xs leading-relaxed font-medium">Your payment is being validated by the neural network. Funds will appear in your wallet shortly.</p>
             <button onClick={() => navigate('/dashboard')} className="w-full max-w-xs h-16 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Back to Dashboard</button>
        </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 bg-[#050505]">
      <Header title="Add Money" />
      <div className="max-w-xl mx-auto p-4 space-y-6">
        
        {/* Orange Money Kotoku Flyer Replica */}
        <div className="bg-[#f35201] rounded-[48px] p-8 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(243,82,1,0.3)] border border-white/10 group">
            {/* Visual Accents from Flyer */}
            <div className="absolute top-4 left-4 opacity-20">
                <div className="w-2 h-2 bg-white rounded-full mb-1"></div>
                <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-80">Innovative Gadget</h3>
                <div className="flex flex-col items-center gap-1">
                    <h2 className="text-4xl font-black tracking-tighter leading-none">Orange Money</h2>
                    <p className="text-sm font-bold opacity-90 tracking-tight">Scan and Pay na mi Kotoku</p>
                </div>

                {/* QR Block Simulation */}
                <div className="bg-white p-6 rounded-[32px] mx-auto w-48 aspect-square flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <QrCode size={120} className="text-[#f35201]" />
                </div>

                <div className="space-y-4 pt-2">
                    <p className="text-xs font-black uppercase tracking-widest opacity-60">or</p>
                    <div className="space-y-1">
                        <p className="text-2xl font-black tracking-tighter">Dial {ORANGE_MONEY_DIAL_CODE}</p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex items-center justify-between border border-white/20 group/num hover:bg-white/20 transition-all">
                        <span className="text-3xl font-black tracking-widest text-white drop-shadow-lg">{ORANGE_MONEY_NUMBER}</span>
                        <button onClick={() => handleCopy(ORANGE_MONEY_NUMBER)} className="p-3 bg-white text-[#f35201] rounded-xl active:scale-90 transition-all shadow-lg"><Copy size={20}/></button>
                    </div>
                </div>
            </div>
            
            {/* Rainbow Accent from bottom corner of flyer */}
            <div className="absolute bottom-[-10px] left-[-10px] w-24 h-24 opacity-40">
                <div className="absolute inset-0 rounded-full border-[10px] border-emerald-500 scale-100"></div>
                <div className="absolute inset-0 rounded-full border-[10px] border-yellow-500 scale-75"></div>
                <div className="absolute inset-0 rounded-full border-[10px] border-red-500 scale-50"></div>
            </div>
            
            {/* Logo Accent from Flyer */}
            <div className="absolute bottom-8 right-8 opacity-40 flex items-center gap-2">
                 <div className="w-6 h-6 border-4 border-white rotate-45"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest">Orange Money</span>
            </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 px-2">
                <ArrowDownRight size={16} className="text-emerald-500" />
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Submit Transaction Data</h4>
            </div>

            <div className="bg-[#0a0a0f] p-6 rounded-[32px] border border-white/5 focus-within:border-emerald-500/40 transition-all shadow-2xl">
                <label className="text-[9px] font-black text-gray-500 uppercase block mb-3 tracking-widest">Amount (SLE)</label>
                <div className="flex items-baseline gap-3">
                    <span className="text-xl font-black text-emerald-500">SLE</span>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="0.00" 
                        className="bg-transparent text-4xl font-black text-white w-full outline-none placeholder-white/5" 
                    />
                </div>
            </div>

            <div className="bg-[#0a0a0f] p-6 rounded-[32px] border border-white/5 focus-within:border-emerald-500/40 transition-all shadow-2xl">
                <label className="text-[9px] font-black text-gray-500 uppercase block mb-3 tracking-widest flex items-center gap-2">
                    <Hash size={12} className="text-emerald-500" /> Transaction SMS ID
                </label>
                <input 
                    type="text" 
                    value={txId} 
                    onChange={(e) => setTxId(e.target.value)} 
                    placeholder="Enter message ID" 
                    className="bg-transparent text-lg font-black text-white w-full outline-none placeholder-white/5 tracking-widest uppercase" 
                />
            </div>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex items-start gap-4">
            <Info size={20} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                Payments are usually verified within <span className="text-blue-400">5-15 minutes</span>. If your balance doesn't update after an hour, contact our live technical concierge via the Support button.
            </p>
        </div>

        <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.97] flex items-center justify-center gap-4 disabled:opacity-50 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>
                    <Zap size={20} fill="currentColor" /> 
                    <span className="mt-0.5">VERIFY PAYMENT PROTOCOL</span>
                </>
            )}
        </button>
      </div>
    </div>
  );
};

export default Recharge;
