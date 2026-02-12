
import React, { useEffect, useState } from 'react';
import { getAllUsers, getTransactions, getAllOrders, getProducts } from '../../services/storageService';
import { User, Transaction, Order, OrderStatus, Product } from '../../types';
import { 
    Users, 
    Activity, 
    DollarSign, 
    Loader2, 
    ShoppingBag,
    TrendingUp,
    Truck,
    Package,
    ArrowUpRight,
    AlertTriangle,
    Inbox,
    Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminOverview: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const [u, t, o, p] = await Promise.all([getAllUsers(), getTransactions(), getAllOrders(), getProducts()]);
    setUsers(u);
    setTxs(t);
    setOrders(o);
    setProducts(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalSales = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + o.total_price, 0);

  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const lowStock = products.filter(p => p.stock_quantity < 10);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter">Owner's Panel</h2>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Real-time Node Telemetry</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => navigate('/admin/settings')} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/5">
                <Settings size={18} className="text-gray-400" />
            </button>
            <button onClick={load} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/5">
                <Activity size={18} className="text-emerald-500" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`SLE ${totalSales.toLocaleString()}`} icon={<DollarSign size={18} className="text-blue-400" />} trend="+14%" trendUp={true} />
        <StatCard title="Active Users" value={users.length.toString()} icon={<Users size={18} className="text-emerald-400" />} trend="+5" trendUp={true} />
        <StatCard title="Open Orders" value={pendingOrders.toString()} icon={<Package size={18} className="text-orange-400" />} trend="Fix" trendUp={false} />
        <StatCard title="System Health" value="Active" icon={<TrendingUp size={18} className="text-purple-400" />} trend="Safe" trendUp={true} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sales chart reduced in scale */}
          <div className="xl:col-span-3 bg-white/5 border border-white/10 rounded-[32px] p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <Activity size={18} className="text-emerald-500" /> Cycle Performance
                  </h3>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Last 30 Days</span>
              </div>
              
              <div className="h-40 flex items-end gap-2 px-1 relative z-10">
                 {[30, 50, 40, 70, 60, 80, 100, 75, 90, 85, 110, 120].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-emerald-600/5 to-emerald-500/40 rounded-t-lg transition-all duration-700 hover:to-emerald-400" style={{ height: `${h}%` }}></div>
                 ))}
              </div>
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/5 blur-[80px] pointer-events-none"></div>
          </div>

          <div className="space-y-4">
              <div className="bg-[#1e1136]/40 border border-white/10 rounded-[24px] p-5 backdrop-blur-xl">
                  <h3 className="text-xs font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <AlertTriangle size={14} className="text-orange-500" /> Low Stock
                  </h3>
                  <div className="space-y-2">
                      {lowStock.length === 0 ? (
                          <p className="text-gray-600 text-[10px] font-bold text-center py-2">Inventory Sync OK</p>
                      ) : lowStock.slice(0, 3).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                              <span className="text-[10px] font-bold text-white uppercase truncate max-w-[80px]">{p.name}</span>
                              <span className="text-[9px] text-rose-500 font-black">{p.stock_quantity} left</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-black/20 border border-white/10 rounded-[24px] p-5">
                  <h3 className="text-xs font-black text-white mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <Inbox size={14} className="text-blue-500" /> Recent
                  </h3>
                  <div className="space-y-4">
                      {orders.slice(0, 3).map(o => (
                          <div key={o.id} className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-black/40 border border-white/5 shrink-0">
                                  <img src={o.product_image} className="w-full h-full object-cover opacity-50" />
                              </div>
                              <div className="min-w-0">
                                  <p className="text-[10px] text-white font-bold truncate uppercase">{o.product_name}</p>
                                  <p className="text-[8px] text-gray-500">SLE {o.total_price.toLocaleString()}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }> = ({ title, value, icon, trend, trendUp }) => (
    <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] hover:bg-white/10 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">{icon}</div>
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${trendUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' : 'bg-orange-500/10 text-orange-400 border-orange-500/10'}`}>
                {trend}
            </span>
        </div>
        <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-0.5">{title}</p>
        <p className="text-xl font-black text-white tracking-tight">{value}</p>
    </div>
);

export default AdminOverview;
