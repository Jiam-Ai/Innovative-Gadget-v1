
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getUserOrders, userConfirmDelivery, getCurrentUser } from '../services/storageService';
import { Order, OrderStatus } from '../types';
import { 
  Loader2, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Hash, 
  MapPin, 
  Filter, 
  Calendar, 
  Wallet, 
  HandCoins,
  Search,
  RefreshCcw,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const user = getCurrentUser();
  const navigate = useNavigate();

  const load = async () => {
    if (user) {
      setLoading(true);
      const data = await getUserOrders(user.id);
      setOrders(data);
      setFilteredOrders(data);
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = [...orders];
    if (statusFilter !== 'ALL') result = result.filter(o => o.status === statusFilter);
    if (startDate) result = result.filter(o => o.created_at >= new Date(startDate).getTime());
    if (endDate) result = result.filter(o => o.created_at <= new Date(endDate).getTime() + 86400000);
    setFilteredOrders(result);
  }, [statusFilter, startDate, endDate, orders]);

  const handleConfirm = async (id: string) => {
    if (!window.confirm("Confirm you received this order?")) return;
    setConfirmingId(id);
    try {
      await userConfirmDelivery(id);
      await load();
    } catch (e) {
      alert("Error confirming order.");
    } finally {
      setConfirmingId(null);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    const steps = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="My Orders" />
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 animate-reveal">
           <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Order History</h2>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">Real-time gadget tracking</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg py-2.5 pl-8 pr-6 text-[9px] font-black uppercase text-white outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                >
                  <option value="ALL">ALL STATUS</option>
                  <option value={OrderStatus.PENDING}>PENDING</option>
                  <option value={OrderStatus.SHIPPED}>SHIPPED</option>
                  <option value={OrderStatus.DELIVERED}>ARRIVED</option>
                  <option value={OrderStatus.COMPLETED}>FINALIZED</option>
                </select>
              </div>
              <button onClick={load} className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-emerald-500 hover:bg-white/10 transition-all"><RefreshCcw size={14}/></button>
           </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center bg-[#0a0a0f] border border-white/5 rounded-[40px] animate-reveal">
             <Package size={48} className="mx-auto mb-4 text-gray-800" />
             <p className="text-gray-500 font-black uppercase text-[10px] tracking-widest">No matching orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden group hover:border-emerald-500/30 transition-all duration-500 animate-reveal shadow-2xl">
                   
                   {/* Card Header: Product & Payment Type */}
                   <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-white/[0.02] to-transparent">
                      <div className="flex items-center gap-6">
                         <div className="w-20 h-20 rounded-[28px] bg-black border border-white/5 overflow-hidden shadow-2xl shrink-0">
                            <img src={order.product_image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-2">
                               <span className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
                                  order.payment_method === 'BALANCE' 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                               }`}>
                                  {order.payment_method === 'BALANCE' ? <Wallet size={10}/> : <HandCoins size={10}/>}
                                  {order.payment_method === 'BALANCE' ? 'Pre-Paid (Balance)' : 'Cash On Delivery'}
                               </span>
                            </div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{order.product_name}</h4>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                <Clock size={10} className="text-emerald-500" /> {new Date(order.created_at).toLocaleDateString()}
                            </p>
                         </div>
                      </div>

                      <div className="text-left md:text-right space-y-1">
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">Total Payout</p>
                          <p className="text-3xl font-black text-white tracking-tighter">SLE {order.total_price.toLocaleString()}</p>
                      </div>
                   </div>

                   {/* Lifecycle Visualization */}
                   <div className="px-8 py-4 bg-black/20 border-y border-white/5 relative">
                      <div className="absolute top-[36px] left-12 right-12 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                              className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                              style={{ width: `${(getStepIndex(order.status) / 4) * 100}%` }}
                          ></div>
                      </div>
                      <div className="relative flex justify-between">
                         {['Pending', 'Packed', 'Shipped', 'Arrived', 'Done'].map((label, i) => {
                            const active = getStepIndex(order.status) >= i;
                            return (
                                <div key={label} className="flex flex-col items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border-2 transition-all duration-500 flex items-center justify-center ${
                                        active ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-[#050505] border-white/10 text-gray-800'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-black animate-pulse' : 'bg-current'}`} />
                                    </div>
                                    <span className={`text-[7px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-gray-700'}`}>{label}</span>
                                </div>
                            );
                         })}
                      </div>
                   </div>

                   {/* Footer Actions */}
                   <div className="p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-4 w-full sm:w-auto">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 border border-white/5">
                                    <Hash size={18} />
                                </div>
                                <div>
                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Tracking Number</p>
                                    <p className="text-xs font-mono font-black text-white tracking-widest">{order.tracking_number || 'WAITING FOR HUB...'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className="text-emerald-500" />
                                <div>
                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Shipping Target</p>
                                    <p className="text-[10px] text-gray-400 font-bold max-w-xs truncate">{order.shipping_details}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {order.status !== OrderStatus.COMPLETED && order.tracking_number && (
                                <button 
                                    onClick={() => navigate(`/track?tid=${order.tracking_number}`)}
                                    className="h-14 px-8 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Track
                                </button>
                            )}
                            {(order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) && (
                                <button 
                                    onClick={() => handleConfirm(order.id)}
                                    disabled={confirmingId === order.id}
                                    className="h-14 flex-1 sm:flex-none px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    {confirmingId === order.id ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                    Finalize & Confirm Receipt
                                </button>
                            )}
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
