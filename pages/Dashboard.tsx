
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getCurrentUser, logoutUser, refreshUserData } from '../services/storageService';
import { User } from '../types';
import { 
  ShoppingBag, 
  Package, 
  Wallet, 
  FileText, 
  Lock, 
  LogOut,
  RefreshCw,
  UserCircle,
  CreditCard
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const updatedUser = await refreshUserData();
    if (updatedUser) setUser(updatedUser);
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
      setRefreshing(true);
      await loadData();
      setTimeout(() => setRefreshing(false), 800);
  };

  if (!user) return null;

  const refinedMenu = [
    { name: 'SHOPPING BAG', icon: <ShoppingBag size={24} />, path: '/cart' },
    { name: 'MY ORDERS', icon: <Package size={24} />, path: '/orders' },
    { name: 'ADD MONEY', icon: <Wallet size={24} />, path: '/recharge' },
    { name: 'MY HISTORY', icon: <FileText size={24} />, path: '/history' },
    { name: 'MY PROFILE', icon: <UserCircle size={24} />, path: '/profile' },
    { name: 'SECURITY', icon: <Lock size={24} />, path: '/security' },
  ];

  return (
    <>
      <Header title="Account" />
      <div className="pb-24 p-4 md:p-8 animate-spring-in max-w-2xl mx-auto space-y-8">
          
          {/* Top Profile Header */}
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-[24px] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0f] shadow-xl shrink-0">
                <img src={user.avatar_url || 'https://images.unsplash.com/photo-1633332755-1ba8b97f60c1?w=200&q=80'} alt="" className="w-full h-full object-cover" />
             </div>
             <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">
                    {user.full_name || 'CUSTOMER'}
                </h2>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase tracking-widest">PREMIUM MEMBER</p>
             </div>
          </div>

          {/* Wallet Balance Card (Formerly Neural Vault) */}
          <div className="relative w-full bg-[#0a0a0f] p-8 rounded-[48px] border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.1)] group overflow-hidden">
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-emerald-500">
                    <Wallet size={32} />
                  </div>
                  <button 
                      onClick={handleRefresh} 
                      disabled={refreshing}
                      className="p-2 text-emerald-500/40 hover:text-emerald-400 transition-all active:scale-90"
                  >
                      <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                  </button>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-emerald-500 uppercase tracking-tighter">WALLET BALANCE</h3>
                  <p className="text-emerald-500/70 font-bold text-sm">
                    Balance: SLE {Math.floor(user.balance ?? 0).toLocaleString()}
                  </p>
                </div>
            </div>
            {/* Visual Flare */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] pointer-events-none rounded-full"></div>
          </div>

          {/* Menu Tools */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-400 dark:text-gray-600 uppercase tracking-widest ml-1">Quick Tools</h3>
            <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/5 rounded-[48px] p-10 shadow-xl dark:shadow-2xl">
                <div className="grid grid-cols-3 gap-y-12 gap-x-4">
                    {refinedMenu.map((node) => (
                        <div 
                          key={node.name} 
                          onClick={() => navigate(node.path)}
                          className="flex flex-col items-center gap-3 cursor-pointer group"
                        >
                            <div className="w-16 h-16 bg-slate-50 dark:bg-[#111111] rounded-[28px] flex items-center justify-center text-emerald-600 dark:text-emerald-500 border border-slate-100 dark:border-white/5 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-md">
                                {node.icon}
                            </div>
                            <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest text-center group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {node.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <button 
            onClick={() => { logoutUser(); navigate('/login'); }} 
            className="w-full h-20 bg-slate-100 hover:bg-rose-50 dark:bg-[#111111] dark:hover:bg-rose-950/20 border border-slate-200 dark:border-white/5 rounded-[32px] text-slate-500 hover:text-rose-600 dark:text-gray-600 dark:hover:text-rose-500 font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg"
          >
            <LogOut size={20} /> EXIT ACCOUNT
          </button>
      </div>
    </>
  );
};

export default Dashboard;
