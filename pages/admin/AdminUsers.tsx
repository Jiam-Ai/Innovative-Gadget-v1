
import React, { useEffect, useState } from 'react';
import { getAllUsers, updateUserBalance } from '../../services/storageService';
import { User } from '../../types';
import { Search, Loader2, ShieldCheck, User as UserIcon, Edit2, Check, X, AlertCircle } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpdateBalance = async (userId: string) => {
      const num = parseFloat(editBalance);
      if (isNaN(num)) return;
      setUpdating(true);
      try {
          await updateUserBalance(userId, num);
          await load();
          setEditingUserId(null);
      } catch (e) {
          alert("Update failed");
      } finally {
          setUpdating(false);
      }
  };

  const filtered = users.filter(u => 
    u.phone.includes(searchTerm) || u.verificationCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 lg:space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter">User Management</h2>
          <p className="text-gray-400 text-xs lg:text-sm mt-1">Audit and manage the global member registry.</p>
        </div>
        
        <div className="relative group w-full lg:min-w-[300px] lg:w-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search phone or code..."
                className="bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all w-full focus:bg-white/10"
            />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-3xl shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[800px] lg:min-w-full">
                <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                    <tr>
                        <th className="px-6 lg:px-10 py-6 lg:py-8">Identity</th>
                        <th className="px-6 lg:px-10 py-6 lg:py-8">Verification</th>
                        <th className="px-6 lg:px-10 py-6 lg:py-8">Lifecycle</th>
                        <th className="px-6 lg:px-10 py-6 lg:py-8">Wallet Balance</th>
                        <th className="px-6 lg:px-10 py-6 lg:py-8 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {loading ? (
                        <tr><td colSpan={5} className="p-20 lg:p-32 text-center"><Loader2 className="animate-spin text-emerald-500 mx-auto" size={40} /></td></tr>
                    ) : filtered.length === 0 ? (
                        <tr><td colSpan={5} className="p-20 lg:p-32 text-center text-gray-500 font-black uppercase tracking-widest">Zero Matches Found</td></tr>
                    ) : (
                        filtered.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 lg:px-10 py-5 lg:py-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${u.isAdmin ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-white/5 text-gray-500'}`}>
                                            {u.isAdmin ? <ShieldCheck size={20} className="lg:w-6 lg:h-6" /> : <UserIcon size={20} className="lg:w-6 lg:h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white">{u.phone}</p>
                                            <p className="text-[9px] text-gray-500 font-mono tracking-tighter">UID: #{u.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 lg:px-10 py-5 lg:py-6">
                                    <span className="bg-black/40 border border-white/5 px-3 py-1 lg:px-4 lg:py-1.5 rounded-lg lg:rounded-xl font-mono text-[10px] lg:text-xs text-blue-400 font-bold tracking-widest">{u.verificationCode}</span>
                                </td>
                                <td className="px-6 lg:px-10 py-5 lg:py-6">
                                    <p className="text-[10px] lg:text-xs text-gray-400 font-bold">{new Date(u.registeredAt).toLocaleDateString()}</p>
                                    <p className="text-[8px] lg:text-[10px] text-gray-600 uppercase font-black tracking-widest mt-1">Active Member</p>
                                </td>
                                <td className="px-6 lg:px-10 py-5 lg:py-6">
                                    {editingUserId === u.id ? (
                                        <div className="flex items-center gap-2">
                                            <input 
                                                autoFocus
                                                type="number"
                                                value={editBalance}
                                                onChange={(e) => setEditBalance(e.target.value)}
                                                className="bg-black/40 border border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs text-emerald-400 w-24 outline-none"
                                            />
                                            <button onClick={() => handleUpdateBalance(u.id)} disabled={updating} className="text-emerald-500 hover:scale-110 transition"><Check size={18} /></button>
                                            <button onClick={() => setEditingUserId(null)} className="text-rose-500 hover:scale-110 transition"><X size={18} /></button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 group/bal">
                                            <span className="text-base lg:text-lg font-black text-emerald-400 tracking-tighter">SLE {(u.balance ?? 0).toLocaleString()}</span>
                                            <button 
                                                onClick={() => { setEditingUserId(u.id); setEditBalance((u.balance ?? 0).toString()); }}
                                                className="p-1 text-gray-500 hover:text-white transition lg:opacity-0 lg:group-hover/bal:opacity-100"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 lg:px-10 py-5 lg:py-6 text-right">
                                    <button className="text-[8px] lg:text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 px-4 py-2 lg:px-5 lg:py-2.5 rounded-xl transition-all">
                                        View Logs
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
      
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl lg:rounded-3xl p-4 lg:p-6 flex items-start gap-4">
          <AlertCircle className="text-orange-500 shrink-0" size={20} />
          <div>
              <p className="text-xs lg:text-sm font-bold text-orange-200">Security Note</p>
              <p className="text-[10px] lg:text-xs text-orange-200/60 mt-1">All balance adjustments are audited. Ensure bank receipts match requested adjustments.</p>
          </div>
      </div>
    </div>
  );
};

export default AdminUsers;
