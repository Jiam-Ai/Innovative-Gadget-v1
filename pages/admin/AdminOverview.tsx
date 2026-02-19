
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
    Store
} from 'lucide-react';

const AdminOverview: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [u, o, p] = await Promise.all([getAllUsers(), getAllOrders(), getProducts()]);
    setUsers(u);
    setOrders(o);
    setProducts(p);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const totalSales = orders
    .filter(o => o.status === OrderStatus.COMPLETED)
    .reduce((sum, o) => sum + o.total_price, 0);

  const pendingFulfillment = orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.PROCESSING).length;
  const lowStock = products.filter(p => p.stock_quantity < 10);

  if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>;

  return (
    <div className="space-y-6 animate-reveal max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">Business Overview</h2>
          <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mt-0.5">Shop performance & sales metrics</p>
        </div>
        <button onClick={load} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/5">
            <Activity size={18} className="text-emerald-500" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Gross Revenue" value={`SLE ${totalSales.toLocaleString()}`} icon={<DollarSign size={18} className="text-blue-400" />} subtitle="Completed Sales" />
        <StatCard title="Total Customers" value={users.length.toString()} icon={<Users size={18} className="text-emerald-400" />} subtitle="Active Accounts" />
        <StatCard title="Fulfillment Queue" value={pendingFulfillment.toString()} icon={<Truck size={18} className="text-orange-400" />} subtitle="Needs Shipping" />
        <StatCard title="Catalog Size" value={products.length.toString()} icon={<Store size={18} className="text-purple-400" />} subtitle="Active Items" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-[#0a0a0f] border border-white/10 rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                    <ShoppingBag size={18} className="text-emerald-500" /> Recent Sales Activity
                  </h3>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Global Ledger</span>
              </div>
              
              <div className="space-y-4">
                  {orders.slice(0, 5).map(o => (
                      <div key={o.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/5">
                                  <img src={o.product_image} className="w-full h-full object-cover opacity-60" />
                              </div>
                              <div>
                                  <p className="text-[11px] text-white font-black uppercase tracking-tight truncate max-w-[120px]">{o.product_name}</p>
                                  <p className="text-[9px] text-gray-500 uppercase font-bold">ORD-{o.id.substring(0,8)}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <p className="text-sm font-black text-white">SLE {o.total_price.toLocaleString()}</p>
                              <p className={`text-[8px] font-black uppercase tracking-widest ${o.status === OrderStatus.COMPLETED ? 'text-emerald-500' : 'text-orange-500'}`}>{o.status}</p>
                          </div>
                      </div>
                  ))}
                  {orders.length === 0 && <p className="text-center py-10 text-gray-600 text-xs font-bold uppercase tracking-widest">No recent sales</p>}
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-[#1e1136]/40 border border-rose-500/10 rounded-[32px] p-6 backdrop-blur-xl">
                  <h3 className="text-xs font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                    <AlertTriangle size={14} className="text-rose-500" /> Inventory Alerts
                  </h3>
                  <div className="space-y-3">
                      {lowStock.length === 0 ? (
                          <div className="p-8 text-center text-gray-600">
                             <Package size={32} className="mx-auto mb-2 opacity-10" />
                             <p className="text-[9px] font-black uppercase">Stock Healthy</p>
                          </div>
                      ) : lowStock.slice(0, 4).map(p => (
                          <div key={p.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                              <span className="text-[10px] font-bold text-white uppercase truncate max-w-[100px]">{p.name}</span>
                              <span className="text-[9px] text-rose-500 font-black bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{p.stock_quantity} Left</span>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] p-6">
                  <h3 className="text-xs font-black text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-500" /> Customer Insights
                  </h3>
                  <p className="text-gray-500 text-[10px] leading-relaxed mb-4 font-medium uppercase tracking-tight">Average order value is trending up. Mobile category remains the dominant sales driver.</p>
                  <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/40 p-3 rounded-xl">
                          <p className="text-[8px] text-gray-600 font-black uppercase">Growth</p>
                          <p className="text-lg font-black text-white">+12.4%</p>
                      </div>
                      <div className="bg-black/40 p-3 rounded-xl">
                          <p className="text-[8px] text-gray-600 font-black uppercase">Retention</p>
                          <p className="text-lg font-black text-white">84%</p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, subtitle: string }> = ({ title, value, icon, subtitle }) => (
    <div className="bg-[#0a0a0f] border border-white/5 p-6 rounded-[32px] hover:bg-white/5 transition-all relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">{icon}</div>
        </div>
        <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">{title}</p>
        <p className="text-2xl font-black text-white tracking-tighter leading-none mb-1">{value}</p>
        <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">{subtitle}</p>
    </div>
);

export default AdminOverview;
