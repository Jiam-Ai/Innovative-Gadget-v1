
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { changePassword, getCurrentUser } from '../services/storageService';
import { Loader2, ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChangePassword: React.FC = () => {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    
    if (newPass !== confirmPass) {
        setError("New passwords do not match");
        return;
    }

    if (newPass.length < 6) {
        setError("Password must be at least 6 characters");
        return;
    }

    setLoading(true);
    try {
      await changePassword(user.id, oldPass, newPass);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header title="Security" />
      
      <div className="max-w-md mx-auto p-4 md:p-0 pt-4">
        <div className="hidden md:flex items-center gap-2 mb-6 text-gray-400 hover:text-white cursor-pointer w-fit transition" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
        </div>

        <div className="glass-card rounded-[32px] p-8">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <Lock size={32} />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-white mb-2">Change Password</h2>
            <p className="text-gray-400 text-center text-sm mb-8">Create a strong password to protect your assets.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-2">Current Password</label>
                    <input 
                        type="password"
                        value={oldPass}
                        onChange={(e) => setOldPass(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition"
                        placeholder="••••••"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-2">New Password</label>
                    <input 
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition"
                        placeholder="••••••"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase ml-2">Confirm New Password</label>
                    <input 
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 transition"
                        placeholder="••••••"
                        required
                    />
                </div>

                {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={loading || success}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all mt-4 ${
                        success ? 'bg-emerald-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : success ? <><CheckCircle2 /> Updated</> : 'Update Password'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
