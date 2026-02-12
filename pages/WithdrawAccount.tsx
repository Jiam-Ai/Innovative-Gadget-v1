
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { updateWithdrawalAccount, getCurrentUser, refreshUserData } from '../services/storageService';
import { Loader2, ArrowLeft, Wallet, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WithdrawAccount: React.FC = () => {
  const [account, setAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
      if(user && user.withdrawalAccount) {
          setAccount(user.withdrawalAccount);
      }
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateWithdrawalAccount(user.id, account);
      refreshUserData();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      alert('Failed to update');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header title="Withdrawal Settings" />
      
      <div className="max-w-md mx-auto p-4 md:p-0 pt-4">
        <div className="hidden md:flex items-center gap-2 mb-6 text-gray-400 hover:text-white cursor-pointer w-fit transition" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
        </div>

        <div className="glass-card rounded-[32px] p-8 relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Payment Method</h2>
                        <p className="text-gray-400 text-sm">Set your default receiving account</p>
                    </div>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center text-[10px] font-bold text-white">OM</div>
                        <span className="font-bold text-white">Orange Money</span>
                    </div>
                    <p className="text-xs text-gray-500">Only Orange Money is currently supported for automatic withdrawals.</p>
                </div>

                <div className="space-y-2 mb-6">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-2">Phone Number / Account</label>
                    <input 
                        type="text"
                        value={account}
                        onChange={(e) => setAccount(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition font-mono"
                        placeholder="+232 ..."
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || success}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                        success ? 'bg-emerald-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : success ? <><CheckCircle2 /> Saved</> : 'Save Account'}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawAccount;
