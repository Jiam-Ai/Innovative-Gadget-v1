
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { changePassword, getCurrentUser } from '../services/storageService';
import { Loader2, ArrowLeft, Lock, ShieldCheck, AlertTriangle, Key, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Security: React.FC = () => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) return setError("Passwords mismatch.");
    if (newPass.length < 6) return setError("Minimum 6 characters.");
    
    setLoading(true);
    try {
      await changePassword(user!.id, oldPass, newPass);
      alert("Password protocol updated successfully.");
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message || "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="Security Protocols" />
      <div className="max-w-xl mx-auto p-4 md:p-10 space-y-10">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-widest">Back</span>
        </button>

        <div className="bg-[#0a0a0f] border border-white/5 rounded-[48px] p-10 md:p-14 shadow-2xl">
            <div className="flex flex-col items-center mb-10">
               <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20 mb-6">
                  <Lock size={32} />
               </div>
               <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Vault Security</h3>
               <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mt-1">Manage Login Credentials</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2">Current Cipher</label>
                    <input 
                      type="password" 
                      value={oldPass}
                      onChange={(e) => setOldPass(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="••••••••"
                      required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2">New Access Cipher</label>
                    <input 
                      type="password" 
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="••••••••"
                      required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest ml-2">Confirm Cipher</label>
                    <input 
                      type="password" 
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:outline-none focus:border-blue-500/50"
                      placeholder="••••••••"
                      required
                    />
                </div>

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-black uppercase tracking-widest text-center">
                        <AlertTriangle size={14} className="inline mr-2" /> {error}
                    </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Update Security</>}
                </button>
            </form>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-all">
           <div className="flex items-center gap-4">
              <Key size={20} className="text-emerald-500" />
              <div>
                 <p className="text-white font-black text-xs uppercase tracking-widest">2-Factor Auth</p>
                 <p className="text-[10px] text-gray-500">Enable additional device sync</p>
              </div>
           </div>
           <ChevronRight size={18} className="text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default Security;
