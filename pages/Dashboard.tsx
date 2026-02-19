
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { getCurrentUser, logoutUser, refreshUserData, getUserOrders, getWishlist } from '../services/storageService';
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
  Truck,
  Heart,
  Trophy,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [stats, setStats] = useState({ orders: 0, wishlist: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const updatedUser = await refreshUserData();
    if (updatedUser) {
        setUser(updatedUser);
        const [orders, wishlist] = await Promise.all([
            getUserOrders(updatedUser.id),
            getWishlist(updatedUser.id)
        ]);
        setStats({ orders: orders.length, wishlist: wishlist.length });
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = async () => {
      setRefreshing(true);
      await loadData();
      setTimeout(() => setRefreshing(false), 800);
  };

  if (!user) return null;

  const refinedMenu = [
    { name: 'CART', icon: <ShoppingBag size={22} />, path: '/cart' },
    { name: 'ORDERS', icon: <Package size={22} />, path: '/orders' },
    { name: 'WISHLIST', icon: <Heart size={22} />, path: '/wishlist' },
    { name: 'TRACKING', icon: <Truck size={22} />, path: '/track' },
    { name: 'TOP UP', icon: <Wallet size={22} />, path: '/recharge' },
    { name: 'HISTORY', icon: <FileText size={22} />, path: '/history' },
    { name: 'PROFILE', icon: <UserCircle size={22} />, path: '/profile' },
    { name: 'SECURITY', icon: <Lock size={22} />, path: '/security' },
  ];

  return (
    <>
      <Header title="Account Overview" />
      <div className="pb-24 p-4 md:p-8 animate-reveal max-w-3xl mx-auto space-y-6">
          
          {/* Identity & Level */}
          <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-[32px]">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-3xl overflow-hidden border border-white/10 bg-black shadow-xl shrink-0">
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                        {user.full_name}
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-widest">{user.member_level || 'BRONZE'} MEMBER</span>
                        {user.member_level !== 'BRONZE' && <ShieldCheck size={12} className="text-emerald-500" />}
                    </div>
                 </div>
              </div>
              <button onClick={handleRefresh} disabled={refreshing} className="p-3 bg-white/5 rounded-2xl hover:text-emerald-500 transition-all active:scale-90">
                  <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
              </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
              <StatWidget label="Orders" value={stats.orders} icon={<Package size={14}/>} onClick={() => navigate('/orders')} />
              <StatWidget label="Wishlist" value={stats.wishlist} icon={<Heart size={14}/>} onClick={() => navigate('/wishlist')} />
              <StatWidget label="Bag" value="Active" icon={<ShoppingBag size={14}/>} onClick={() => navigate('/cart')} />
          </div>

          {/* Wallet Block */}
          <div className="relative w-full bg-[#0a0a0f] p-8 rounded-[40px] border border-emerald-500/40 shadow-2xl overflow-hidden">
            <div className="relative z-10 space-y-4">
                <Wallet size={32} className="text-emerald-500" />
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Available Balance</h3>
                  <p className="text-4xl font-black text-white tracking-tighter">
                    SLE {Math.floor(user.balance ?? 0).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => navigate('/recharge')} className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">
                    Fast Top-up <ChevronRight size={14} />
                </button>
            </div>
            <Trophy size={100} className="absolute -right-8 -bottom-8 opacity-5 text-emerald-500" />
          </div>

          {/* Navigation Grid */}
          <div className="bg-white/5 border border-white/5 rounded-[40px] p-8">
              <h3 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8 ml-2">Node Menu</h3>
              <div className="grid grid-cols-4 gap-y-10 gap-x-2">
                  {refinedMenu.map((node) => (
                      <div 
                        key={node.name} 
                        onClick={() => navigate(node.path)}
                        className="flex flex-col items-center gap-3 cursor-pointer group"
                      >
                          <div className="w-12 h-12 bg-white/5 rounded-[18px] flex items-center justify-center text-gray-500 border border-white/5 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300">
                              {node.icon}
                          </div>
                          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest text-center group-hover:text-white transition-colors">
                              {node.name}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          <button 
            onClick={() => { logoutUser(); navigate('/login'); }} 
            className="w-full h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          >
            <LogOut size={18} /> TERMINATE SESSION
          </button>
      </div>
    </>
  );
};

const StatWidget = ({ label, value, icon, onClick }: any) => (
    <button onClick={onClick} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-white/10 transition-all">
        <div className="text-emerald-500">{icon}</div>
        <p className="text-xl font-black text-white leading-none">{value}</p>
        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{label}</p>
    </button>
);

export default Dashboard;
