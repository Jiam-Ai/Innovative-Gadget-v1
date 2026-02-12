
import React, { useEffect, useState } from 'react';
import { getTransactions, getAllUsers, adminApproveDeposit, adminRejectTransaction, getAllOrders, adminUpdateOrderStatus } from '../../services/storageService';
import { Transaction, TransactionStatus, TransactionType, User, Order, OrderStatus } from '../../types';
import { 
    Check, 
    X, 
    Search, 
    Loader2, 
    ArrowDownLeft, 
    ArrowUpRight, 
    Receipt, 
    Clock, 
    Filter,
    Package,
    Truck,
    Smartphone,
    CheckCircle,
    Hash
} from 'lucide-react';

const AdminTransactions: React.FC = () => {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING_TX' | 'PENDING_ORDERS' | 'ALL_ORDERS' | 'ALL_TX'>('PENDING_ORDERS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Tracking form
  const [trackingData, setTrackingData] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
        const [t, u, o] = await Promise.all([getTransactions(), getAllUsers(), getAllOrders()]);
        setTxs(t);
        setOrders(o);
    } catch (error) {
        console.error("Load failed", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleTxAction = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setLoading(true);
    if (action === 'REJECT') await adminRejectTransaction(id);
    else await adminApproveDeposit(id);
    await load();
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
      setLoading(true);
      const tracking = trackingData[orderId] || '';
      await adminUpdateOrderStatus(orderId, status, tracking);
      await load();
  };

  const filteredOrders = orders.filter(o => {
      if (activeTab === 'PENDING_ORDERS') return o.status === OrderStatus.PENDING || o.status === OrderStatus.PROCESSING;
      if (activeTab === 'ALL_ORDERS') return true;
      return false;
  }).filter(o => o.id.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredTxs = txs.filter(t => {
      if (activeTab === 'PENDING_TX') return t.status === TransactionStatus.PENDING;
      if (activeTab === 'ALL_TX') return true;
      return false;
  }).filter(t => t.userPhone.includes(searchTerm));

  const tabs = [
      { id: 'PENDING_ORDERS', label: 'Order Queue', count: orders.filter(o => o.status === OrderStatus.PENDING).length },
      { id: 'ALL_ORDERS', label: 'Order Master', count: orders.length },
      { id: 'PENDING_TX', label: 'Deposit Approval', count: txs.filter(t => t.status === TransactionStatus.PENDING).length },
      { id: 'ALL_TX', label: 'Ledger History', count: txs.length }
  ];

  const renderList = () => {
    if (loading) {
        return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;
    }

    if (activeTab.includes('ORDERS')) {
        if (filteredOrders.length === 0) {
            return (
                <div className="text-center py-32 bg-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                    <Package className="mx-auto mb-4 text-gray-700" size={48} />
                    <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Zero Orders Found</p>
                </div>
            );
        }
        return filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#1e1136]/40 border border-white/5 rounded-[32px] p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8 hover:bg-white/5 transition-all group backdrop-blur-3xl">
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-[22px] bg-black/40 overflow-hidden border border-white/5">
                        <img src={order.product_image} className="w-full h-full object-cover opacity-60" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h4 className="font-black text-white text-xl tracking-tight uppercase">ORD-{order.id}</h4>
                            <span className={`text-[9px] font-black px-3 py-1 rounded-lg border uppercase tracking-[0.1em] ${
                                order.status === OrderStatus.PENDING ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                order.status === OrderStatus.COMPLETED ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            }`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2">
                            <Smartphone size={14} /> {(order as any).users?.phone || 'Buyer Node'}
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono mt-2 truncate max-w-sm">
                            Ship To: {order.shipping_details || 'HQ Address'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6 lg:gap-12 ml-auto xl:ml-0">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest mb-1">Total Payout</p>
                        <p className="text-3xl font-black text-white">SLE {order.total_price.toLocaleString()}</p>
                    </div>

                    {order.status !== OrderStatus.COMPLETED && (
                        <div className="flex items-center gap-3">
                            <div className="relative group/input">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                                <input 
                                    type="text" 
                                    value={trackingData[order.id] || ''}
                                    onChange={(e) => setTrackingData({...trackingData, [order.id]: e.target.value})}
                                    placeholder="Tracking ID..."
                                    className="bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none focus:border-blue-500/50"
                                />
                            </div>
                            <button 
                                onClick={() => handleUpdateStatus(order.id, OrderStatus.SHIPPED)}
                                className="h-12 bg-blue-600 text-white rounded-xl px-4 flex items-center justify-center hover:bg-blue-500 transition-all gap-2"
                            >
                                <Truck size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Ship</span>
                            </button>
                            <button 
                                onClick={() => handleUpdateStatus(order.id, OrderStatus.DELIVERED)}
                                className="h-12 bg-emerald-600 text-white rounded-xl px-4 flex items-center justify-center hover:bg-emerald-500 transition-all gap-2"
                            >
                                <CheckCircle size={16} /> <span className="text-[9px] font-black uppercase tracking-widest">Deliver</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        ));
    }

    if (filteredTxs.length === 0) {
        return (
            <div className="text-center py-32 bg-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                <Receipt className="mx-auto mb-4 text-gray-700" size={48} />
                <p className="text-gray-500 font-black uppercase tracking-[0.2em] text-xs">Zero Transactions Found</p>
            </div>
        );
    }

    return filteredTxs.map((tx) => (
        <div key={tx.id} className="bg-[#1e1136]/40 border border-white/5 rounded-[32px] p-8 flex items-center justify-between gap-8 backdrop-blur-3xl">
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    tx.type === TransactionType.DEPOSIT ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                }`}>
                    {tx.type === TransactionType.DEPOSIT ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                    <h4 className="font-black text-white text-lg tracking-tight uppercase">{tx.type}</h4>
                    <p className="text-xs text-gray-500">{tx.userPhone} • {new Date(tx.date).toLocaleDateString()}</p>
                    <p className="text-[9px] text-gray-600 mt-2 font-mono">REF: {tx.referenceId || 'N/A'}</p>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <span className="text-2xl font-black text-white">SLE {tx.amount.toLocaleString()}</span>
                {tx.status === TransactionStatus.PENDING && (
                    <div className="flex gap-2">
                        <button onClick={() => handleTxAction(tx.id, 'APPROVE')} className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 transition-all"><Check size={20} /></button>
                        <button onClick={() => handleTxAction(tx.id, 'REJECT')} className="w-12 h-12 bg-white/5 text-rose-500 rounded-xl border border-white/10 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"><X size={20} /></button>
                    </div>
                )}
            </div>
        </div>
    ));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Order Logistics</h2>
          <p className="text-gray-400 text-sm mt-1">Authorize payments and update gadget shipping statuses.</p>
        </div>
        
        <div className="relative group min-w-[300px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders or phones..."
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-black/40 rounded-[24px] border border-white/5 overflow-x-auto no-scrollbar backdrop-blur-xl">
          {tabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-3 ${
                    activeTab === tab.id 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40 border border-emerald-400/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                  {tab.label}
                  <span className={`px-2 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-600'}`}>
                      {tab.count}
                  </span>
              </button>
          ))}
      </div>

      <div className="space-y-4">
        {renderList()}
      </div>
    </div>
  );
};

export default AdminTransactions;
