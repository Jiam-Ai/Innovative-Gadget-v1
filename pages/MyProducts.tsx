
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getAllProducts, getCurrentUser, processAutomaticEarnings } from '../services/storageService';
import { UserProduct } from '../types';
import { Clock, Cpu, ArrowRight, Activity, Zap, ShieldCheck } from 'lucide-react';

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [now, setNow] = useState(Date.now());
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const user = getCurrentUser();

  const loadData = async () => {
    if (user) {
        const prods = await getAllProducts(user.id);
        setProducts(prods);
    }
  };

  useEffect(() => {
    const init = async () => {
        await processAutomaticEarnings();
        await loadData();
    };
    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
        setSyncingId(null);
        alert("Node synchronization successful. Accuracy restored to 100%.");
    }, 2000);
  };

  const getTimeDetails = (lastRewardDate: number, expiryDate: number) => {
    if (!lastRewardDate || isNaN(lastRewardDate)) return { status: 'ERROR', label: 'IDLE' };
    const nextReward = lastRewardDate + (24 * 60 * 60 * 1000);
    if (now >= expiryDate) return { status: 'COMPLETED', label: 'EXPIRED' };
    const diff = nextReward - now;
    if (diff <= 0) return { status: 'PROCESSING', label: 'SYNC READY' };
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { 
        status: 'COUNTING', 
        timeString: `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}` 
    };
  };

  return (
    <>
      <Header title="Neural Mesh" />
      
      <div className="p-4 md:p-8 pb-24 max-w-7xl mx-auto">
         <div className="hidden md:block mb-10">
            <h1 className="text-4xl font-black text-white tracking-tighter">My Compute Portfolio</h1>
            <p className="text-gray-400 mt-2">Active Neural Sprints and real-time training telemetry.</p>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 bg-[#1e293b]/20 rounded-[40px] border-2 border-dashed border-white/5 h-64 md:h-96">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                <Cpu size={32} className="text-gray-600" />
            </div>
            <p className="text-xl font-bold text-white">No Active Neural Sprints</p>
            <button onClick={() => window.location.hash = "#/"} className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-full font-bold text-xs uppercase tracking-widest">Explore Market</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod) => {
              const daysLeft = Math.ceil((prod.expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
              const { status, timeString, label } = getTimeDetails(prod.lastRewardDate, prod.expiryDate);
              const progress = Math.min(100, Math.max(0, 100 - (daysLeft / 75) * 100));

              return (
                <div key={prod.id} className="bg-[#0f172a] rounded-[40px] p-8 border border-white/5 shadow-2xl relative overflow-hidden group">
                  
                  <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-xl font-black text-white tracking-tight">{prod.vipName}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <Activity size={12} className="text-cyan-400" />
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Active Sprint</span>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                        <Cpu size={24} className="text-gray-400" />
                      </div>
                  </div>

                  <div className="space-y-6 mb-8">
                      <div className="flex justify-between items-end">
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Training Progress</p>
                          <p className="text-xs font-black text-white">{progress.toFixed(1)}%</p>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.4)]" style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-1">
                          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Accuracy Bonus</p>
                          <p className="text-xl font-black text-emerald-400">SLE {prod.dailyRate}</p>
                      </div>
                      <div className="space-y-1 text-right">
                          <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Epochs Remaining</p>
                          <p className="text-xl font-black text-white">{Math.max(0, daysLeft)} <span className="text-[10px] text-gray-600">D</span></p>
                      </div>
                  </div>

                  <div className="bg-black/60 rounded-[32px] p-6 flex flex-col items-center justify-center border border-white/5 group-hover:border-cyan-500/20 transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                          <Zap size={14} className="text-cyan-400" />
                          <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Next Dividend Sync</span>
                      </div>
                      
                      <div className="font-mono font-black text-2xl text-white tracking-[0.2em] mb-4">
                          {status === 'COUNTING' ? timeString : label}
                      </div>

                      <button 
                        onClick={() => handleSync(prod.id)}
                        disabled={syncingId === prod.id}
                        className="w-full py-4 bg-cyan-600/10 border border-cyan-600/30 text-cyan-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-600 hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                         {syncingId === prod.id ? <ShieldCheck size={16} className="animate-bounce" /> : <><Activity size={14} /> Sync Telemetry</>}
                      </button>
                  </div>

                  {/* Aesthetic Grid Mask */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MyProducts;
