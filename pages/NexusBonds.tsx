
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getBondTemplates, purchaseBond, refreshUserData, getCurrentUser, getUserBonds } from '../services/storageService';
import { BondTemplate, UserBond } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  Calendar, 
  TrendingUp, 
  Zap, 
  Loader2, 
  ArrowUpRight, 
  AlertCircle, 
  GanttChart,
  Clock,
  Sparkles
} from 'lucide-react';

const NexusBonds: React.FC = () => {
  const [templates, setTemplates] = useState<BondTemplate[]>([]);
  const [userBonds, setUserBonds] = useState<UserBond[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [bondAmount, setBondAmount] = useState<string>('');
  const [selectedBond, setSelectedBond] = useState<BondTemplate | null>(null);
  const [user, setUser] = useState(getCurrentUser());
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const bondTemplates = await getBondTemplates();
    setTemplates(bondTemplates);
    
    const updatedUser = await refreshUserData();
    setUser(updatedUser);

    if (updatedUser) {
        const bonds = await getUserBonds(updatedUser.id);
        setUserBonds(bonds);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBondSelect = (bond: BondTemplate) => {
    setError(null);
    setSelectedBond(bond);
    setBondAmount(bond.minInvestment.toString());
  };

  const processPurchase = async () => {
    if (!bondAmount || !selectedBond || !user) return;
    const amount = parseFloat(bondAmount);
    
    if (amount < selectedBond.minInvestment) {
        setError(`Min investment is ${selectedBond.minInvestment} SLE`);
        return;
    }
    
    if (user.balance < amount) {
        setError("Insufficient liquidity in your vault.");
        return;
    }

    setBuyingId(selectedBond.id);
    try {
        await purchaseBond(user.id, selectedBond.id, amount);
        await loadData();
        setSelectedBond(null);
        setBondAmount('');
        alert("Bond Contract Activated. Capital is now locked in the secure epoch vault.");
    } catch (err: any) {
        setError(err.message || "Protocol Error.");
    } finally {
        setBuyingId(null);
    }
  };

  return (
    <>
      <Header title="Nexus Bonds" />
      <div className="p-4 space-y-6 pb-24 max-w-7xl mx-auto overflow-x-hidden">
        
        {/* Institutional Summary */}
        <div className="glass-card rounded-[32px] p-6 border-blue-500/10 relative overflow-hidden animate-spring-in">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                        <Lock className="text-blue-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter">Nexus Bonds</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fixed-Term Security</p>
                    </div>
                </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Institutional-grade leasing. Secure higher returns by locking capital for fixed durations. All bonds are backed by high-density hardware contracts.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Your Portfolio</p>
                    <p className="text-sm font-black text-white">{userBonds.length} Active Contracts</p>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Average Yield</p>
                    <p className="text-sm font-black text-blue-400">High Tier</p>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full"></div>
        </div>

        {/* Bond List */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2 animate-spring-in">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-emerald-400" />
                    <h2 className="text-sm font-black text-white tracking-widest uppercase">Bond Tiers</h2>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {templates.map((bond, idx) => (
                        <div 
                            key={bond.id} 
                            className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/5 group hover:border-blue-500/30 transition-all duration-500 animate-spring-in shadow-2xl"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-blue-500/20 text-blue-400 bg-blue-500/10">
                                    {bond.tierLabel} Tier
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500">
                                    <Clock size={12} />
                                    <span className="text-[10px] font-black">{bond.durationDays} Days</span>
                                </div>
                            </div>

                            <h4 className="text-xl font-black text-white tracking-tight mb-1">{bond.name}</h4>
                            <p className="text-xs text-gray-500 mb-6">{bond.description}</p>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Maturity APY</p>
                                    <p className="text-lg font-black text-emerald-400">+{bond.interestRatePercent}%</p>
                                </div>
                                <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Min Entry</p>
                                    <p className="text-lg font-black text-white">SLE {bond.minInvestment}</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleBondSelect(bond)}
                                className="w-full py-4 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-blue-500/20 transition-all"
                            >
                                Secure Bond <ArrowUpRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* User Active Bonds History */}
        {userBonds.length > 0 && (
            <div className="space-y-4 pt-6">
                <div className="flex items-center gap-2 px-2 animate-spring-in">
                    <GanttChart size={18} className="text-blue-400" />
                    <h2 className="text-sm font-black text-white tracking-widest uppercase">My Active Contracts</h2>
                </div>
                
                <div className="space-y-3">
                    {userBonds.map((bond) => {
                        const remaining = Math.ceil((bond.endDate - Date.now()) / 86400000);
                        return (
                            <div key={bond.id} className="bg-white/5 border border-white/5 rounded-[24px] p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <Lock size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white uppercase tracking-tight">{bond.bondName}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar size={10} className="text-gray-500" />
                                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Expires in {Math.max(0, remaining)} days</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-400">SLE {bond.totalReturn.toLocaleString()}</p>
                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Expected Payout</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* Bond Selection Modal */}
        {selectedBond && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-[#111827] border border-white/10 rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-white tracking-tighter">Contract Activation</h3>
                        <button onClick={() => setSelectedBond(null)} className="text-gray-500 hover:text-white">
                            <AlertCircle size={20} />
                        </button>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
                        <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">Bond Template</p>
                        <p className="text-sm font-black text-white">{selectedBond.name}</p>
                    </div>
                    
                    <div className="space-y-6 mb-8">
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 focus-within:border-blue-500/50 transition-colors">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Investment Amount</label>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-blue-400">SLE</span>
                                <input 
                                    type="number" 
                                    value={bondAmount}
                                    onChange={(e) => setBondAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-transparent text-2xl font-black text-white outline-none w-full"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Duration</p>
                                <p className="text-sm font-black text-white">{selectedBond.durationDays} Days</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Total Return</p>
                                <p className="text-sm font-black text-emerald-400">SLE {(parseFloat(bondAmount) + (parseFloat(bondAmount) * selectedBond.interestRatePercent / 100) || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSelectedBond(null)}
                            className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 bg-white/5"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={processPurchase}
                            disabled={buyingId !== null || !bondAmount || parseFloat(bondAmount) < selectedBond.minInvestment}
                            className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 shadow-xl shadow-blue-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {buyingId ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Buy Bond</>}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default NexusBonds;
