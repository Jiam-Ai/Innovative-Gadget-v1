
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getTransactions, getCurrentUser, trackOrderById } from '../services/storageService';
import { Transaction, TransactionStatus, TransactionType, Order, OrderStatus } from '../types';
import { ArrowDownLeft, ShoppingBag, Filter, Loader2, Users, Search, Truck, Package, Clock, CheckCircle, MapPin, Hash, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'TRACK'>('ALL');
  const [loading, setLoading] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState(false);
  
  const user = getCurrentUser();

  useEffect(() => {
    const load = async () => {
        if (user && activeTab === 'ALL') {
          setLoading(true);
          const txs = await getTransactions(user.id);
          setTransactions(txs.filter(t => t.type !== TransactionType.WITHDRAWAL));
          setLoading(false);
        }
    };
    load();
  }, [activeTab]);

  const handleTrackSearch = async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!trackingId.trim()) return;
      setLoading(true);
      setTrackError(false);
      setTrackedOrder(null);
      try {
          const order = await trackOrderById(trackingId.trim());
          if (order) {
              setTrackedOrder(order);
          } else {
              setTrackError(true);
          }
      } catch (e) {
          setTrackError(true);
      } finally {
          setLoading(false);
      }
  };

  const getIcon = (type: TransactionType) => {
    switch (type) {
        case TransactionType.DEPOSIT: return <ArrowDownLeft size={20} className="text-emerald-400" />;
        case TransactionType.PURCHASE: return <ShoppingBag size={20} className="text-purple-400" />;
        case TransactionType.REFERRAL: return <Users size={20} className="text-blue-400" />;
        default: return <ShoppingBag size={20} />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
      switch(status) {
          case TransactionStatus.PENDING: return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/10';
          case TransactionStatus.COMPLETED: 
          case TransactionStatus.APPROVED: return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/10';
          default: return 'bg-red-500/20 text-red-500 border-red-500/10';
      }
  };

  const getOrderStep = (status: OrderStatus) => {
      const steps = [OrderStatus.PENDING, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.COMPLETED];
      return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header title="My History" />
      
      <div className="max-w-3xl mx-auto p-4 md:p-0 pt-4">
        <div className="hidden md:block mb-8">
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Activity</h1>
            <p className="text-gray-400">Check your payments and track your orders.</p>
        </div>

        {/* Simple Tabs */}
        <div className="flex gap-2 mb-6">
            <button 
                onClick={() => setActiveTab('ALL')}
                className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab === 'ALL' ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5'}`}
            >
                My Payments
            </button>
            <button 
                onClick={() => setActiveTab('TRACK')}
                className={`flex-1 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${activeTab === 'TRACK' ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-white/5 text-gray-500 border-white/5'}`}
            >
                <Truck size={14} /> Track My Order
            </button>
        </div>

        {activeTab === 'TRACK' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-8 md:p-10 shadow-2xl">
                    <h3 className="text-xl font-black text-white uppercase mb-2">Order Search</h3>
                    <p className="text-xs text-gray-500 mb-8">Enter your track code to see where your gadget is.</p>
                    
                    <form onSubmit={handleTrackSearch} className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                            <input 
                                type="text"
                                value={trackingId}
                                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                                placeholder="TRK-XXXX-XXXX"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white font-mono text-lg tracking-widest focus:outline-none focus:border-emerald-500/50"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={loading || !trackingId}
                            className="h-16 md:w-40 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Search'}
                        </button>
                    </form>
                </div>

                {trackError && (
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-8 text-center animate-in zoom-in duration-300">
                        <AlertCircle className="mx-auto mb-4 text-rose-500" size={40} />
                        <h4 className="text-white font-black uppercase text-lg">Not Found</h4>
                        <p className="text-gray-500 text-xs mt-1">We couldn't find an order with that code. Please check your Orders page.</p>
                    </div>
                )}

                {trackedOrder && (
                    <div className="bg-white/5 border border-white/5 rounded-[48px] p-8 md:p-12 space-y-10 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-black overflow-hidden border border-white/10">
                                    <img src={trackedOrder.product_image} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white uppercase">{trackedOrder.product_name}</h4>
                                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">In Progress</p>
                                </div>
                            </div>
                            <span className="px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest w-fit">
                                {trackedOrder.status}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative pt-10 pb-4">
                            <div className="absolute top-[48px] left-0 right-0 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" 
                                    style={{ width: `${(getOrderStep(trackedOrder.status) / 4) * 100}%` }}
                                ></div>
                            </div>
                            
                            <div className="relative flex justify-between">
                                {[
                                    { id: OrderStatus.PENDING, label: 'Ordered' },
                                    { id: OrderStatus.PROCESSING, label: 'Packed' },
                                    { id: OrderStatus.SHIPPED, label: 'On Way' },
                                    { id: OrderStatus.DELIVERED, label: 'Arrived' },
                                    { id: OrderStatus.COMPLETED, label: 'Done' }
                                ].map((step, i) => {
                                    const active = getOrderStep(trackedOrder.status) >= i;
                                    return (
                                        <div key={step.id} className="flex flex-col items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-4 transition-all duration-700 relative z-10 ${
                                                active ? 'bg-emerald-500 border-emerald-900 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-[#050505] border-white/10'
                                            }`}></div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-gray-700'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                            <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Location</p>
                                <p className="text-xs text-white font-bold">Logistics Hub - Station 7</p>
                                <p className="text-[10px] text-gray-500 mt-1 italic">Last Check: {new Date(trackedOrder.updated_at).toLocaleString()}</p>
                            </div>
                            <div className="bg-black/40 p-6 rounded-3xl border border-white/5">
                                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-2">Shipping Details</p>
                                <p className="text-xs text-white font-bold">Standard Delivery</p>
                                <p className="text-[10px] text-gray-500 mt-1 truncate">Address: {trackedOrder.shipping_details}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="space-y-3">
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-32 text-gray-700 bg-white/5 rounded-[40px] border-2 border-dashed border-white/5">
                        <Filter className="mx-auto mb-4 opacity-30" size={48} />
                        <p className="font-black uppercase text-[10px] tracking-widest">No payments yet.</p>
                    </div>
                ) : (
                    transactions.map((tx) => (
                        <div key={tx.id} className="bg-white/5 border border-white/5 p-5 rounded-[28px] flex items-center justify-between hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black border border-white/5">
                                    {getIcon(tx.type)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase">{tx.type.replace('_', ' ')}</h4>
                                    <p className="text-[10px] text-gray-500 mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                 <p className={`font-black text-base ${tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFERRAL ? 'text-emerald-400' : 'text-white'}`}>
                                    {tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFERRAL ? '+' : '-'} SLE {tx.amount.toLocaleString()}
                                 </p>
                                 <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-widest ${getStatusColor(tx.status)}`}>
                                     {tx.status}
                                 </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default History;
