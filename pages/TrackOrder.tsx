
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { trackOrderById } from '../services/storageService';
import { Order, OrderStatus } from '../types';
import { 
  Search, 
  Loader2, 
  Hash, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  CheckCircle, 
  Globe, 
  AlertCircle,
  Package,
  Truck,
  ArrowLeft,
  Wallet,
  HandCoins
} from 'lucide-react';

const TrackOrder: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleTrack = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(false);
    setOrder(null);
    try {
      const data = await trackOrderById(id.toUpperCase());
      if (data) {
        setOrder(data);
      } else {
        setError(true);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tid = searchParams.get('tid');
    if (tid) {
      setTrackingId(tid.toUpperCase());
      handleTrack(tid.toUpperCase());
    }
  }, [searchParams]);

  const getStepIndex = (status: OrderStatus) => {
    const steps = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Track Your Order" />
      
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-reveal">
        <div className="flex items-center gap-2 mb-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-500 hover:text-white transition-all">
                <ArrowLeft size={18} />
            </button>
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Order Tracking</h1>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Find your package status</p>
            </div>
        </div>

        {/* Search Terminal */}
        <div className="bg-[#0a0a0f] border border-white/5 rounded-[32px] p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[60px] pointer-events-none rounded-full"></div>
            
            <div className="max-w-md mx-auto text-center space-y-6 relative z-10">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-[22px] flex items-center justify-center mx-auto text-emerald-500 shadow-inner group-hover:scale-105 transition-transform duration-500">
                <Hash size={28} />
              </div>
              
              <form 
                onSubmit={(e) => { e.preventDefault(); handleTrack(trackingId); }} 
                className="flex flex-col gap-4"
              >
                  <input 
                      type="text"
                      autoFocus
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                      placeholder="TRK-XXXX-XXXX"
                      className="w-full bg-black/40 border border-white/10 rounded-[20px] py-4 px-6 text-white font-mono text-center text-xl tracking-[0.2em] focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                  />
                  <button 
                      type="submit"
                      disabled={loading || !trackingId}
                      className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 disabled:opacity-50 shadow-2xl transition-all active:scale-95"
                  >
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <><Search size={18} /> Track Now</>}
                  </button>
              </form>
            </div>
        </div>

        {error && (
            <div className="p-10 text-center animate-reveal bg-rose-500/5 border border-rose-500/10 rounded-[32px]">
                <AlertCircle className="mx-auto mb-3 text-rose-500" size={40} />
                <h4 className="text-white font-black uppercase text-xs tracking-widest">Order Not Found</h4>
                <p className="text-gray-500 text-[10px] mt-2 uppercase font-bold tracking-widest">Double check your tracking number and try again.</p>
            </div>
        )}

        {order && (
            <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-6 md:p-10 space-y-10 animate-reveal shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Globe size={140} />
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[28px] overflow-hidden bg-black/40 border border-white/10 shadow-2xl">
                            <img src={order.product_image} className="w-full h-full object-cover opacity-90" alt={order.product_name} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border w-fit ${
                                    order.status === OrderStatus.COMPLETED ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : 'text-blue-400 border-blue-500/20 bg-blue-500/10'
                                }`}>
                                    {order.status}
                                </p>
                                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${
                                  order.payment_method === 'BALANCE' 
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                  : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                }`}>
                                  {order.payment_method === 'BALANCE' ? <Wallet size={10}/> : <HandCoins size={10}/>}
                                  {order.payment_method === 'BALANCE' ? 'Paid' : 'Cash on Delivery'}
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{order.product_name}</h4>
                            <p className="text-[10px] text-gray-500 mt-2 font-mono font-black tracking-widest uppercase">{order.tracking_number}</p>
                        </div>
                    </div>
                </div>

                {/* Lifecycle Stepper - Reduced Size */}
                <div className="relative py-4 px-2">
                    <div className="absolute top-[32px] left-8 right-8 h-0.5 bg-white/5">
                        <div 
                            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                            style={{ width: `${(getStepIndex(order.status) / 4) * 100}%` }}
                        ></div>
                    </div>
                    
                    <div className="relative flex justify-between">
                        {[
                            { id: OrderStatus.PENDING, label: 'Order', icon: <Package size={14}/> },
                            { id: OrderStatus.PROCESSING, label: 'Packed', icon: <Hash size={14}/> },
                            { id: OrderStatus.SHIPPED, label: 'Shipped', icon: <Truck size={14}/> },
                            { id: OrderStatus.DELIVERED, label: 'Arrived', icon: <MapPin size={14}/> },
                            { id: OrderStatus.COMPLETED, label: 'Done', icon: <CheckCircle size={14}/> }
                        ].map((step, i) => {
                            const active = getStepIndex(order.status) >= i;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl border-2 transition-all duration-700 flex items-center justify-center ${
                                        active ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-[#050505] border-white/10 text-gray-800'
                                    }`}>
                                        {active ? step.icon : <div className="w-1 h-1 bg-current rounded-full" />}
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-gray-700'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 relative z-10">
                    <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 flex gap-4 items-start hover:bg-white/10 transition-colors group">
                        <MapPin size={20} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Shipping To</p>
                            <p className="text-xs text-white font-black leading-tight uppercase tracking-tight">{order.shipping_details || 'Main Center'}</p>
                        </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[24px] border border-white/5 flex gap-4 items-start hover:bg-white/10 transition-colors group">
                        <Clock size={20} className="text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                        <div>
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Last Update</p>
                            <p className="text-xs text-white font-black uppercase tracking-tight">{new Date(order.updated_at).toLocaleDateString()}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <ShieldCheck size={10} className="text-emerald-500" />
                                <span className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Secure Update</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
