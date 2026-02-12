
import React, { useState } from 'react';
import { Header } from '../components/Header';
import { getCurrentUser, refreshUserData, updateUserInfo, updateProfilePicture } from '../services/storageService';
import { User } from '../types';
import { Loader2, Camera, Save, ArrowLeft, User as UserIcon, Info, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | any>(getCurrentUser());
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || 'https://images.unsplash.com/photo-1633332755-1ba8b97f60c1?w=200&q=80'
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdating(true);
    setSuccess(false);
    try {
      await updateUserInfo(user.id, formData.full_name, formData.bio);
      await updateProfilePicture(user.id, formData.avatar_url);
      const updated = await refreshUserData();
      setUser(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert("Error saving profile. Check your internet.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="My Profile" />
      <div className="max-w-2xl mx-auto p-4 md:p-10 space-y-8">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-widest">Go Back</span>
        </button>

        <div className="bg-[#0a0a0f] border border-white/5 rounded-[56px] p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
          
          <form onSubmit={handleUpdate} className="space-y-10">
            {/* Photo Edit */}
            <div className="flex flex-col items-center">
                <div className="relative group mb-4">
                    <div className="w-32 h-32 rounded-[36px] overflow-hidden border-2 border-emerald-500/20 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                        <img src={formData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-[#0a0a0f]">
                        <Camera size={20} />
                    </div>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{formData.full_name || 'My Name'}</h3>
                <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Verified User Account</p>
            </div>

            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-emerald-400 text-[10px] font-black uppercase tracking-widest text-center animate-in zoom-in duration-300 flex items-center justify-center gap-2">
                    <CheckCircle size={14} /> Profile Saved Successfully!
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                       Full Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:border-emerald-500/40 transition-all font-bold"
                      placeholder="Your Name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                       About Me
                    </label>
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-white focus:outline-none focus:border-emerald-500/40 transition-all font-bold min-h-[100px]"
                      placeholder="Describe yourself..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2 flex items-center gap-2">
                       Photo Link (URL)
                    </label>
                    <div className="relative">
                        <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-500/40" size={18} />
                        <input 
                          type="text" 
                          value={formData.avatar_url}
                          onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-3xl py-6 pl-14 pr-6 text-white focus:outline-none focus:border-emerald-500/40 transition-all text-xs font-medium"
                          placeholder="https://image-link.com/photo.jpg"
                        />
                    </div>
                </div>
            </div>

            <button 
              type="submit" 
              disabled={updating}
              className="w-full h-20 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
            >
                {updating ? <Loader2 className="animate-spin" /> : <><Save size={20} /> SAVE PROFILE</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
