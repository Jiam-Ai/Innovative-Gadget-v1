
import React from 'react';
import { Header } from '../components/Header';
import { getCurrentUser } from '../services/storageService';
import { Gift, Users, TrendingUp, Share2, Copy, Trophy, Target } from 'lucide-react';

const Rewards: React.FC = () => {
  const user = getCurrentUser();
  const inviteLink = `${window.location.origin}/#/register?ref=${user?.verificationCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Share link copied!");
  };

  return (
    <>
      <Header title="Reward Center" />
      <div className="p-4 space-y-6 pb-24 max-w-4xl mx-auto animate-spring-in">
        
        {/* Banner */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Get Paid to Share</h2>
                <p className="text-xs opacity-80 max-w-xs mb-6">Earn a 5% commission when your friends buy gadgets through your link.</p>
                <div className="flex gap-2">
                    <div className="bg-white/10 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">Active Program</div>
                </div>
            </div>
            <Trophy size={140} className="absolute -right-8 -bottom-8 opacity-20 rotate-12" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[28px] flex flex-col items-center text-center">
                <Users size={20} className="text-blue-400 mb-3" />
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Your Team</p>
                <p className="text-xl font-black text-white">0 People</p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[28px] flex flex-col items-center text-center">
                <TrendingUp size={20} className="text-emerald-400 mb-3" />
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Earned</p>
                <p className="text-xl font-black text-white">SLE 0.00</p>
            </div>
        </div>

        {/* Share Section */}
        <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[32px] space-y-6">
            <div className="flex items-center gap-3">
                <Target size={18} className="text-blue-500" />
                <h3 className="text-xs font-black text-white uppercase tracking-widest">Share My Link</h3>
            </div>
            
            <div 
                onClick={handleCopy}
                className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col items-center gap-2 cursor-pointer hover:bg-black/60 transition-all group"
            >
                <span className="text-2xl font-mono font-black text-white tracking-[0.2em]">{user?.verificationCode}</span>
                <p className="text-[8px] text-gray-600 font-bold uppercase flex items-center gap-2">
                    <Copy size={10} /> Tap to copy invite code
                </p>
            </div>

            <button 
                onClick={handleCopy}
                className="w-full h-16 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
            >
                <Share2 size={18} /> Copy Share Link
            </button>
        </div>

        {/* Guidelines */}
        <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[28px] space-y-4">
             <div className="flex items-center gap-2">
                <Gift size={16} className="text-blue-400" />
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Commission Levels</h4>
             </div>
             <div className="space-y-2">
                 <div className="flex justify-between p-3 bg-black/20 rounded-xl">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Level 1 (Direct)</span>
                    <span className="text-[10px] text-blue-400 font-black">5% Pay</span>
                 </div>
                 <div className="flex justify-between p-3 bg-black/20 rounded-xl opacity-60">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Level 2 (Indirect)</span>
                    <span className="text-[10px] text-gray-400 font-black">1% Pay</span>
                 </div>
             </div>
        </div>
      </div>
    </>
  );
};

export default Rewards;
