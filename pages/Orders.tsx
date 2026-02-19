
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
  RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  
  // Filter States
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

    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter(o => o.created_at >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000;
      result = result.filter(o => o.created_at <= end);
    }

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

  const resetFilters = () => {
    setStatusFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="My Orders" />
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Simplified Filter Bar */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 animate-reveal">
           <div>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Order History</h2>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">See your past and active orders</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-2">
              <div className="relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg py-2 pl-8 pr-6 text-[9px] font-black uppercase text-white outline-none focus:border-emerald-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                >
                  <option value="ALL">ALL ORDERS</option>
                  <option value={OrderStatus.PENDING}>PENDING</option>
                  <option value={OrderStatus.PROCESSING}>PROCESSING</option>
                  <option value={OrderStatus.SHIPPED}>SHIPPED</option>
                  <option value={OrderStatus.DELIVERED}>DELIVERED</option>
                  <option value={OrderStatus.COMPLETED}>COMPLETED</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Calendar size={12} className="text-gray-500" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-[9px] font-black text-white outline-none uppercase w-24"
                />
                <span className="text-gray-800">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-[9px] font-black text-white outline-none uppercase w-24"
                />
              </div>

              {(statusFilter !== 'ALL' || startDate || endDate) && (
                  <button onClick={resetFilters} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                      <RefreshCcw size={14} />
                  </button>
              )}
           </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center bg-[#0a0a0f] border border-white/5 rounded-[32px] animate-reveal shadow-2xl">
             <Package size={48} className="mx-auto mb-4 text-gray-800" />
             <p className="text-gray-500 font-black uppercase text-[10px] tracking-[0.2em]">No Orders Found</p>
             <button onClick={() => navigate('/')} className="mt-6 text-emerald-500 font-black text-[10px] uppercase tracking-widest hover:underline">Start Shopping</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order, idx) => (
              <div 
                key={order.id} 
                className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-6 md:p-8 shadow-2xl relative overflow-hidden group animate-reveal"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 rounded-[22px] bg-black border border-white/5 overflow-hidden shrink-0">
                            <img src={order.product_image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         </div>
                         <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                               <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none">{order.product_name}</h4>
                               <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[7px] font-black uppercase tracking-widest shadow-sm ${
                                  order.payment_method === 'BALANCE' 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                               }`}>
                                  {order.payment_method === 'BALANCE' ? <Wallet size={9}/> : <HandCoins size={9}/>}
                                  {order.payment_method === 'BALANCE' ? 'Paid' : 'Cash on Delivery'}
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Total Price</span>
                               <span className="font-black text-lg text-white tracking-tighter">SLE {order.total_price.toLocaleString()}</span>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col lg:items-end gap-2">
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Status</p>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${
                                    order.status === OrderStatus.COMPLETED ? 'text-gray-500' : 
                                    order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED ? 'text-blue-400' : 'text-emerald-400'
                                }`}>{order.status}</p>
                            </div>
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                                <Clock size={18} className={order.status === OrderStatus.COMPLETED ? 'text-gray-600' : 'text-emerald-500'} />
                            </div>
                        </div>
                      </div>
                   </div>

                   {/* Progressive Stepper Lifecycle */}
                   <div className="relative py-4 mb-6 px-2">
                      <div className="absolute top-[32px] left-8 right-8 h-0.5 bg-white/5">
                        <div 
                          className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                          style={{ width: `${(Math.max(0, getStepIndex(order.status)) / 4) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="relative flex justify-between">
                         {[
                            { id: OrderStatus.PENDING, label: 'Order', icon: <Package size={12}/> },
                            { id: OrderStatus.PROCESSING, label: 'Packed', icon: <RefreshCcw size={12}/> },
                            { id: OrderStatus.SHIPPED, label: 'Shipped', icon: <Truck size={12}/> },
                            { id: OrderStatus.DELIVERED, label: 'Arrived', icon: <MapPin size={12}/> },
                            { id: OrderStatus.COMPLETED, label: 'Delivered', icon: <CheckCircle size={12}/> }
                         ].map((step, i) => {
                            const active = getStepIndex(order.status) >= i;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-700 ${
                                        active ? 'bg-emerald-500 border-emerald-500 text-black' : 'bg-[#050505] border-white/10 text-gray-700'
                                    }`}>
                                        {step.icon}
                                    </div>
                                    <span className={`text-[7px] font-black uppercase tracking-widest text-center max-w-[50px] leading-tight ${
                                        active ? 'text-white' : 'text-gray-700'
                                    }`}>{step.label}</span>
                                </div>
                            );
                         })}
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Hash size={14} />
                            </div>
                            <div>
                                <p className="text-[7px] text-gray-600 font-black uppercase mb-0.5">Tracking No</p>
                                <p className="text-xs font-mono font-black text-white tracking-widest uppercase">{order.tracking_number || 'WAITING...'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin size={16} className="text-gray-700" />
                            <div>
                                <p className="text-[7px] text-gray-600 font-black uppercase mb-0.5">Shipping Address</p>
                                <p className="text-[10px] text-gray-400 font-bold max-w-xs line-clamp-1">{order.shipping_details}</p>
                            </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.status !== OrderStatus.COMPLETED && order.tracking_number && (
                            <button 
                                onClick={() => navigate(`/track?tid=${order.tracking_number}`)}
                                className="h-12 px-6 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.1em] transition-all flex items-center gap-2"
                            >
                                <Search size={14} /> Track
                            </button>
                        )}
                        {(order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) && (
                            <button 
                                onClick={() => handleConfirm(order.id)}
                                disabled={confirmingId === order.id}
                                className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.1em] shadow-lg transition-all active:scale-95 flex items-center gap-2"
                            >
                                {confirmingId === order.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                                I Received It
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
