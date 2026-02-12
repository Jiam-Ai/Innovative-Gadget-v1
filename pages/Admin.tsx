
import React, { useEffect, useState } from 'react';
import { 
    getTransactions, 
    getAllUsers, 
    adminApproveDeposit, 
    adminRejectTransaction, 
    adminApproveWithdrawal, 
    processAutomaticEarnings
} from '../services/storageService';
import { Transaction, TransactionStatus, TransactionType, User } from '../types';
import { Check, X, DollarSign, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<'deposits' | 'withdrawals' | 'users'>('deposits');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const txs = await getTransactions();
    const usrs = await getAllUsers();
    setTransactions(txs);
    setUsers(usrs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveDeposit = async (id: string) => {
    setLoading(true);
    await adminApproveDeposit(id);
    await loadData();
    setLoading(false);
  };

  const handleReject = async (id: string) => {
    setLoading(true);
    await adminRejectTransaction(id);
    await loadData();
    setLoading(false);
  };

  const handlePayWithdrawal = async (id: string) => {
      setLoading(true);
      await adminApproveWithdrawal(id);
      await loadData();
      setLoading(false);
  };

  const handleRunEarnings = async () => {
      setLoading(true);
      // Fixed: triggerDailyEarnings was not exported from storageService, 
      // used processAutomaticEarnings which is the intended logic.
      await processAutomaticEarnings();
      alert(`Daily earnings process triggered.`);
      await loadData();
      setLoading(false);
  };

  const filteredTx = transactions.filter(t => {
      if (tab === 'deposits') return t.type === TransactionType.DEPOSIT;
      if (tab === 'withdrawals') return t.type === TransactionType.WITHDRAWAL;
      return false;
  });

  return (
    <div className="min-h-screen bg-black/90 text-white pb-20">
      <div className="glass-panel p-4 sticky top-0 z-50 flex justify-between items-center border-b border-white/10">
        <h1 className="font-bold text-xl">Admin Console</h1>
        <div className="flex gap-3">
            <button onClick={handleRunEarnings} className="text-xs bg-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-500 flex items-center gap-2 font-bold transition">
                <DollarSign size={14} /> Run Pay
            </button>
            <button onClick={() => navigate('/')} className="text-xs bg-white/10 px-4 py-2 rounded-lg hover:bg-white/20 transition">
                Exit
            </button>
        </div>
      </div>

      <div className="p-4 max-w-5xl mx-auto">
        {/* Tabs */}
        <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/5">
            {['deposits', 'withdrawals', 'users'].map((t) => (
                <button 
                    key={t}
                    onClick={() => setTab(t as any)} 
                    className={`flex-1 py-3 text-sm font-bold rounded-lg capitalize transition ${tab === t ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                >
                    {t}
                </button>
            ))}
        </div>

        {loading && <div className="flex justify-center my-10"><Loader2 className="animate-spin text-emerald-500" /></div>}

        {!loading && tab !== 'users' ? (
            <div className="space-y-3">
                {filteredTx.length === 0 && <p className="text-center text-gray-500 py-10">No pending records.</p>}
                {filteredTx.map(tx => (
                    <div key={tx.id} className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                                    tx.status === TransactionStatus.PENDING ? 'bg-yellow-500/20 text-yellow-500' : 
                                    tx.status === TransactionStatus.APPROVED || tx.status === TransactionStatus.COMPLETED ? 'bg-emerald-500/20 text-emerald-500' : 
                                    'bg-red-500/20 text-red-500'
                                }`}>
                                    {tx.status}
                                </span>
                                <span className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-white">SLE {tx.amount}</span>
                                <span className="text-sm text-gray-400 mb-1">from {tx.userPhone}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 font-mono">{tx.referenceId || tx.details}</div>
                        </div>

                        {tx.status === TransactionStatus.PENDING && (
                            <div className="flex gap-2">
                                {tab === 'deposits' ? (
                                    <button onClick={() => handleApproveDeposit(tx.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black p-3 rounded-xl transition">
                                        <Check size={20} />
                                    </button>
                                ) : (
                                    <button onClick={() => handlePayWithdrawal(tx.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black p-3 rounded-xl transition">
                                        <Check size={20} />
                                    </button>
                                )}
                                <button onClick={() => handleReject(tx.id)} className="bg-red-500/20 hover:bg-red-500/40 text-red-500 p-3 rounded-xl transition">
                                    <X size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : !loading && (
            <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Balance</th>
                            <th className="p-4">Code</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition">
                                <td className="p-4 font-medium text-white">{u.phone} {u.isAdmin && <span className="text-emerald-500">(Admin)</span>}</td>
                                <td className="p-4 text-emerald-400 font-bold">SLE {u.balance.toFixed(2)}</td>
                                <td className="p-4 font-mono text-xs text-gray-500">{u.verificationCode}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
