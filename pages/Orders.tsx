
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getUserOrders, userConfirmDelivery, getCurrentUser } from '../services/storageService';
import { Order, OrderStatus } from '../types';
import { Loader2, Package, Truck, CheckCircle, Clock, Hash, MapPin, Copy, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const user = getCurrentUser();
  const navigate = useNavigate();

  const load = async () => {
    if (user) {
      setLoading(true);
      const data = await getUserOrders(user.id);
      setOrders(data);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id: string) => {
    if (!window.confirm("Click OK to confirm you have received your package.")) return;
    setConfirmingId(id);
    try {
      await userConfirmDelivery(id);
      load();
    } catch (e) {
      alert("Error confirming.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleCopyTrackId = (id: string) => {
      navigator.clipboard.writeText(id);
      alert("Track code copied!");
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock className="text-yellow-500" />;
      case OrderStatus.SHIPPED: return <Truck className="text-blue-500" />;
      case OrderStatus.DELIVERED: return <Package className="text-emerald-500" />;
      case OrderStatus.COMPLETED: return <CheckCircle className="text-gray-500" />;
      default: return <Clock />;
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="My Orders" />
      <div className="max-w-4xl mx-auto p-4 md:p-10 space-y-8">
        
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Order Status</h2>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Updates on your recent buys</p>
           </div>
           <button onClick={() => navigate('/history')} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 hover:bg-white/10">
              <ExternalLink size={20} className="text-emerald-500" />
           </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : orders.length === 0 ? (
          <div className="py-32 text-center bg-[#0a0a0f] border border-white/5 rounded-[48px]">
             <Package size={48} className="mx-auto mb-4 text-gray-800" />
             <p className="text-gray-500 font-black uppercase text-xs">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-3xl bg-black border border-white/5 overflow-hidden">
                          <img src={order.product_image} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-xl font-black text-white uppercase">{order.product_name}</h4>
                          <span className="text-emerald-500 font-black text-lg">SLE {order.total_price.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-6">
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{order.status}</p>
                          </div>
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                             {getStatusIcon(order.status)}
                          </div>
                       </div>

                       {order.status === OrderStatus.DELIVERED && (
                          <button 
                            onClick={() => handleConfirm(order.id)}
                            disabled={confirmingId === order.id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                          >
                             {confirmingId === order.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                             Received Package
                          </button>
                       )}
                    </div>
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Hash size={14} />
                        </div>
                        <div>
                            <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Track Code</p>
                            <div className="flex items-center gap-3">
                                <p className="text-[11px] text-white font-mono font-black tracking-widest uppercase">{order.tracking_number || 'WAITING...'}</p>
                                {order.tracking_number && (
                                    <button onClick={() => handleCopyTrackId(order.tracking_number!)} className="p-1 text-gray-500 hover:text-emerald-400">
                                        <Copy size={12} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <MapPin size={16} className="text-emerald-500 opacity-50" />
                       <p className="text-[10px] text-gray-400 font-bold truncate max-w-[200px]">{order.shipping_details}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
