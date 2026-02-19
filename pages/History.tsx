
import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { getTransactions, getCurrentUser } from '../services/storageService';
import { Transaction, TransactionStatus, TransactionType } from '../types';
import { 
  ArrowDownLeft, 
  ShoppingBag, 
  Loader2, 
  Users, 
  Clock, 
  AlertCircle
} from 'lucide-react';

const History: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  
  const user = getCurrentUser();

  useEffect(() => {
    const load = async () => {
        if (user) {
          setLoading(true);
          const txs = await getTransactions(user.id);
          // Only show ledger relevant transactions (exclude simple internal IDs if needed, but here we show all balance movements)
          setTransactions(txs.filter(t => t.type !== TransactionType.WITHDRAWAL));
          setLoading(false);
        }
    };
    load();
  }, []);

  const getIcon = (type: TransactionType) => {
    switch (type) {
        case TransactionType.DEPOSIT: return <ArrowDownLeft size={18} className="text-emerald-400" />;
        case TransactionType.PURCHASE: return <ShoppingBag size={18} className="text-blue-400" />;
        case TransactionType.REFERRAL: return <Users size={18} className="text-emerald-400" />;
        default: return <ShoppingBag size={18} />;
    }
  };

  const getStatusColor = (status: TransactionStatus) => {
      switch(status) {
          case TransactionStatus.PENDING: return 'text-yellow-500';
          case TransactionStatus.COMPLETED: 
          case TransactionStatus.APPROVED: return 'text-emerald-500';
          default: return 'text-rose-500';
      }
  };

  return (
    <div className="min-h-screen pb-20">
      <Header title="Network Activity" />
      
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-10 text-center md:text-left animate-reveal">
            <h1 className="text-4xl font-black text-white tracking-tight uppercase">Ledger History</h1>
            <p className="text-gray-500 mt-2 font-black uppercase text-[10px] tracking-widest">Global grid and vault telemetry</p>
        </div>

        <div className="space-y-4 animate-reveal">
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
            ) : transactions.length === 0 ? (
                <div className="text-center py-40 bg-[#0a0a0f] border border-white/5 rounded-[48px] shadow-2xl">
                    <ShoppingBag className="mx-auto mb-6 text-gray-800" size={64} />
                    <p className="font-black uppercase text-[11px] tracking-[0.3em] text-gray-600">Vault Ledger Empty</p>
                </div>
            ) : (
                transactions.map((tx) => (
                    <div key={tx.id} className="bg-[#0a0a0f] border border-white/10 p-6 rounded-[32px] flex items-center justify-between hover:bg-white/5 transition-all group shadow-xl">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-black/40 border border-white/10 group-hover:scale-110 transition-transform shadow-inner">
                                {getIcon(tx.type)}
                            </div>
                            <div>
                                <h4 className="text-base font-black text-white uppercase tracking-tight">{tx.type.replace('_', ' ')}</h4>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`font-black text-xl tracking-tighter ${tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFERRAL ? 'text-emerald-400' : 'text-white'}`}>
                                {tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.REFERRAL ? '+' : '-'} {tx.amount.toLocaleString()}
                             </p>
                             <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border border-current mt-1.5 inline-block ${getStatusColor(tx.status)}`}>
                                 {tx.status}
                             </span>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};

export default History;
