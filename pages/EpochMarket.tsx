
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getTrainingEpochs, investInEpoch, refreshUserData, getCurrentUser, getUserEpochInvestments } from '../services/storageService';
import { TrainingEpoch, UserEpochInvestment } from '../types';
import { BrainCircuit, Loader2, ArrowUpRight, Sparkles, AlertCircle, Layers, Activity } from 'lucide-react';

const EpochMarket: React.FC = () => {
  const [epochs, setEpochs] = useState<TrainingEpoch[]>([]);
  const [investments, setInvestments] = useState<UserEpochInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [selectedEpoch, setSelectedEpoch] = useState<TrainingEpoch | null>(null);
  const [user, setUser] = useState(getCurrentUser());
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const epochData = await getTrainingEpochs();
    setEpochs(epochData);
    const updatedUser = await refreshUserData();
    setUser(updatedUser);
    if (updatedUser) {
        const invs = await getUserEpochInvestments(updatedUser.id);
        setInvestments(invs);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSelectEpoch = (epoch: TrainingEpoch) => {
    setError(null);
    setSelectedEpoch(epoch);
    setAmount(epoch.minInvestment.toString());
  };

  const processInvestment = async () => {
    if (!amount || !selectedEpoch || !user) return;
    const invAmount = parseFloat(amount);
    if (invAmount < selectedEpoch.minInvestment) {
        setError(`Min investment is ${selectedEpoch.minInvestment} SLE`);
        return;
    }
    if (user.balance < invAmount) {
        setError("Not enough money in your wallet.");
        return;
    }
    setBuyingId(selectedEpoch.id);
    try {
        await investInEpoch(user.id, selectedEpoch.id, invAmount);
        await loadData();
        setSelectedEpoch(null);
        setAmount('');
        alert("Success! Your plan is now active.");
    } catch (err: any) {
        setError("Something went wrong. Please try again.");
    } finally {
        setBuyingId(null);
    }
  };

  return (
    <>
      <Header title="Earn Money" />
      <div className="p-4 space-y-6 pb-24 max-w-7xl mx-auto overflow-x-hidden">
        <div className="glass-card rounded-[40px] p-8 border-emerald-500/10 relative overflow-hidden animate-spring-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-emerald-600/20 rounded-[28px] flex items-center justify-center border border-emerald-500/30">
                        <BrainCircuit className="text-emerald-400" size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Investment Plans</h2>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Grow your money with us</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mt-6 max-w-2xl font-medium">
                Pick a plan and start earning daily. Each plan has a fixed time and a guaranteed reward at the end.
            </p>
        </div>

        <div className="space-y-5">
            <div className="flex items-center justify-between px-2 animate-spring-in">
                <div className="flex items-center gap-2">
                    <Layers size={18} className="text-emerald-400" />
                    <h2 className="text-xs font-black text-white tracking-widest uppercase">Best Deals</h2>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {epochs.map((epoch, idx) => {
                        const progress = (epoch.currentFilled / epoch.totalTarget) * 100;
                        return (
                            <div key={epoch.id} className="bg-[#0a0a0f]/60 rounded-[40px] p-8 border border-white/5 group hover:border-emerald-500/30 transition-all duration-500 animate-spring-in shadow-2xl relative overflow-hidden">
                                <h4 className="text-2xl font-black text-white tracking-tighter mb-2">{epoch.name}</h4>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Profit</p>
                                        <p className="text-2xl font-black text-emerald-400">x{epoch.rewardMultiplier}</p>
                                    </div>
                                    <div className="bg-black/40 p-5 rounded-3xl border border-white/5">
                                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Min Start</p>
                                        <p className="text-2xl font-black text-white">SLE {epoch.minInvestment}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleSelectEpoch(epoch)}
                                    className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    Invest Now <ArrowUpRight size={18} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default EpochMarket;
