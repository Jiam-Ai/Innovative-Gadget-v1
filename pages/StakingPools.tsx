
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { getStakingPools, injectPoolLiquidity, refreshUserData, getCurrentUser, getUserStakes } from '../services/storageService';
import { StakingPool, UserStake } from '../types';
import { 
  Target, 
  Users, 
  Zap, 
  Loader2, 
  ArrowUpRight, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  History, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Coins
} from 'lucide-react';

const StakingPools: React.FC = () => {
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [userStakes, setUserStakes] = useState<UserStake[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState(getCurrentUser());
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
        const poolsData = await getStakingPools();
        setPools(poolsData);
        
        const updatedUser = await refreshUserData();
        setUser(updatedUser);

        if (updatedUser) {
            const stakes = await getUserStakes(updatedUser.id);
            setUserStakes(stakes);
        }
    } catch (err) {
        console.error("Failed to load pool data", err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleHistory = (poolId: string) => {
    setExpandedHistory(prev => ({ ...prev, [poolId]: !prev[poolId] }));
  };

  const handleStake = (pool: StakingPool) => {
    setError(null);
    setSelectedPool(pool);
    setStakeAmount(pool.minEntry.toString());
  };

  const processStake = async () => {
    if (!stakeAmount || !selectedPool || !user) return;
    const amount = parseFloat(stakeAmount);
    
    if (amount < selectedPool.minEntry) {
        setError(`Minimum entry for this pool is ${selectedPool.minEntry} SLE`);
        return;
    }
    
    if (user.balance < amount) {
        setError("Insufficient compute liquidity in your vault.");
        return;
    }

    setBuyingId(selectedPool.id);
    try {
        await injectPoolLiquidity(user.id, selectedPool.id, amount);
        await loadData();
        setSelectedPool(null);
        setStakeAmount('');
        alert("Liquidity Injection Successful. Your stake is now active in the compute cluster.");
    } catch (err: any) {
        setError(err.message || "Protocol Error during injection.");
    } finally {
        setBuyingId(null);
    }
  };

  return (
    <>
      <Header title="Nexus Pools" />
      <div className="p-4 space-y-6 pb-24 max-w-7xl mx-auto overflow-x-hidden">
        
        {/* Collective Intelligence Summary */}
        <div className="glass-card rounded-[32px] p-6 border-purple-500/10 relative overflow-hidden animate-spring-in">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/20">
                        <TrendingUp className="text-purple-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter text-compact">Nexus Staking</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Fractional Provisioning</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Your Balance</p>
                    <p className="text-lg font-black text-purple-400">SLE {user?.balance.toFixed(2)}</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Join massive decentralized AI clusters. Our "Fill-and-Fire" protocol ensures that hardware training epochs only begin when the pool reaches 100% capacity.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Clusters</p>
                    <p className="text-sm font-black text-white">{pools.length} Systems</p>
                </div>
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Status</p>
                    <p className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                        Synchronized
                    </p>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none rounded-full"></div>
        </div>

        {/* Pools Grid */}
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2 animate-spring-in">
                <div className="flex items-center gap-2">
                    <Target size={18} className="text-pink-400" />
                    <h2 className="text-sm font-black text-white tracking-widest uppercase">Live Pools</h2>
                </div>
                <button onClick={loadData} className="text-[9px] font-black text-gray-500 uppercase hover:text-white transition-colors">
                    Refresh Feed
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-purple-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pools.map((pool, idx) => {
                        const progress = (pool.currentLiquidity / pool.targetLiquidity) * 100;
                        const myStakes = userStakes.filter(s => s.poolId === pool.id);
                        const totalMyStake = myStakes.reduce((sum, s) => sum + s.amount, 0);
                        const isExpanded = expandedHistory[pool.id];

                        const tierStyles = {
                            ALPHA: {
                                tag: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/10',
                                bar: 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]',
                                shimmer: 'from-transparent via-cyan-200/20 to-transparent'
                            },
                            SIGMA: {
                                tag: 'border-purple-500/20 text-purple-400 bg-purple-500/10',
                                bar: 'bg-gradient-to-r from-purple-700 to-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.4)]',
                                shimmer: 'from-transparent via-purple-200/20 to-transparent'
                            },
                            OMEGA: {
                                tag: 'border-pink-500/20 text-pink-400 bg-pink-500/10',
                                bar: 'bg-gradient-to-r from-pink-700 to-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.4)]',
                                shimmer: 'from-transparent via-pink-200/20 to-transparent'
                            }
                        };

                        const style = tierStyles[pool.tier];

                        return (
                            <div 
                                key={pool.id} 
                                className="bg-[#0a0a0f]/60 backdrop-blur-xl rounded-[32px] p-6 border border-white/5 group hover:border-purple-500/30 transition-all duration-500 animate-spring-in shadow-2xl flex flex-col"
                                style={{ animationDelay: `${idx * 150}ms` }}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${style.tag}`}>
                                        {pool.tier} Tier
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                        <Users size={12} />
                                        <span className="text-[10px] font-black">{pool.participants} Nodes</span>
                                    </div>
                                </div>

                                <h4 className="text-xl font-black text-white tracking-tight mb-1">{pool.name}</h4>
                                <div className="flex items-center gap-2 mb-6">
                                    <Sparkles size={12} className="text-yellow-400" />
                                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Est. {pool.estimatedApy}% APY</span>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Allocation Status</p>
                                        <p className="text-[10px] font-black text-white">{progress.toFixed(1)}%</p>
                                    </div>
                                    <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                                        <div 
                                            className={`h-full transition-all duration-1000 relative rounded-full ${style.bar}`} 
                                            style={{ width: `${progress}%` }}
                                        >
                                            {progress > 0 && (
                                                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 blur-[2px] rounded-r-full"></div>
                                            )}
                                            <div className={`absolute inset-0 w-1/2 h-full bg-gradient-to-r ${style.shimmer} skew-x-[-20deg] animate-shimmer`}></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-[8px] font-black text-gray-600 uppercase">
                                        <span>SLE {pool.currentLiquidity.toLocaleString()}</span>
                                        <span>Goal: {pool.targetLiquidity.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* User's Contribution History - Enhanced with Individual Data */}
                                {myStakes.length > 0 && (
                                    <div className="mb-8 overflow-hidden rounded-[24px] border border-white/5 bg-black/30 transition-all duration-500">
                                        <button 
                                            onClick={() => toggleHistory(pool.id)}
                                            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors group/hist"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                                                    <History size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">My Contributions</p>
                                                    <p className="text-xs font-black text-white">SLE {totalMyStake.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                                        </button>

                                        <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[300px] border-t border-white/5 p-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="space-y-3 overflow-y-auto no-scrollbar pr-1">
                                                {myStakes.map((stake) => (
                                                    <div key={stake.id} className="bg-white/5 rounded-2xl p-3 border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-all">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                                <Coins size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-white">SLE {stake.amount.toLocaleString()}</p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <Calendar size={10} className="text-gray-600" />
                                                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                                                        {new Date(stake.stakedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Monthly Yield</p>
                                                            <p className="text-[10px] font-black text-emerald-400">+{(stake.amount * (pool.estimatedApy / 1200)).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-auto">
                                    <button 
                                        onClick={() => handleStake(pool)}
                                        className="w-full py-5 bg-white/5 hover:bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 border border-white/5 transition-all group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
                                    >
                                        Inject Liquidity <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Stake Modal */}
        {selectedPool && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-[#111827] border border-white/10 rounded-[40px] p-8 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom-5 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-white tracking-tighter">Inject Liquidity</h3>
                        <button onClick={() => setSelectedPool(null)} className="text-gray-500 hover:text-white">
                            <AlertCircle size={20} />
                        </button>
                    </div>

                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mb-6">
                        <p className="text-[8px] text-purple-400 font-black uppercase tracking-widest mb-1">Target Cluster</p>
                        <p className="text-sm font-black text-white">{selectedPool.name}</p>
                    </div>
                    
                    <div className="space-y-6 mb-8">
                        <div className="bg-black/40 rounded-3xl p-6 border border-white/5 focus-within:border-purple-500/50 transition-colors">
                            <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Injection Amount</label>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-purple-400">SLE</span>
                                <input 
                                    type="number" 
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="bg-transparent text-2xl font-black text-white outline-none w-full"
                                    autoFocus
                                />
                            </div>
                            <p className="text-[8px] text-gray-600 mt-2 font-black uppercase tracking-widest">Min entry: {selectedPool.minEntry} SLE</p>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Your Share</p>
                                <p className="text-sm font-black text-white">{(Number(stakeAmount) / selectedPool.targetLiquidity * 100 || 0).toFixed(4)}%</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Monthly Yield</p>
                                <p className="text-sm font-black text-emerald-400">SLE {(Number(stakeAmount) * (selectedPool.estimatedApy / 1200)).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={() => setSelectedPool(null)}
                            className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 bg-white/5 hover:bg-white/10"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={processStake}
                            disabled={buyingId !== null || !stakeAmount || parseFloat(stakeAmount) < selectedPool.minEntry}
                            className="flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl shadow-purple-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {buyingId ? <Loader2 size={16} className="animate-spin" /> : <><Zap size={14} /> Confirm Injection</>}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default StakingPools;
