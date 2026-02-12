
import React from 'react';
import { Header } from '../components/Header';
import { getCurrentUser } from '../services/storageService';
import { SOCIAL_LINKS } from '../constants';
import { 
  Copy, 
  Users, 
  Share2, 
  Sparkles, 
  Trophy, 
  Target, 
  MessageCircle, 
  Facebook, 
  Youtube,
  Globe
} from 'lucide-react';

const Invite: React.FC = () => {
  const user = getCurrentUser();
  const inviteLink = `${window.location.origin}/#/register?ref=${user?.verificationCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard!");
  }

  const openSocial = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <>
      <Header title="Refer & Earn" />
      
      <div className="max-w-4xl mx-auto p-4 md:p-0 space-y-8">
        <div className="hidden md:block">
            <h1 className="text-4xl font-bold text-white tracking-tight">Referral Program</h1>
            <p className="text-gray-400 mt-2">Grow your gadget network and earn passive commission from every invite.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
            
            {/* High Impact Bonus Card */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-[40px] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[40px] p-10 text-white text-center shadow-2xl overflow-hidden flex flex-col justify-center items-center min-h-[400px] border border-white/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/10 rounded-full -ml-16 -mb-16 blur-3xl"></div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-2 backdrop-blur-md shadow-inner border border-white/30 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                             <Trophy size={48} className="text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]" />
                        </div>
                        <div>
                            <h2 className="text-5xl font-black mb-2 tracking-tighter">5% BONUS</h2>
                            <p className="text-blue-100 font-medium text-lg opacity-90">Instant Referral Rewards</p>
                        </div>
                        <p className="opacity-80 text-sm leading-relaxed max-w-xs mx-auto">
                            Earn <span className="text-white font-bold">5% of the purchase value</span> every time a friend buys a gadget from the store.
                        </p>
                        
                        <div className="flex gap-2 justify-center">
                            <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-1">
                                <Sparkles size={10} /> Secure Earnings
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link & Code Controls */}
            <div className="space-y-6 flex flex-col justify-center">
                <div className="glass-card p-8 rounded-[40px] space-y-8 border border-white/10">
                    <div className="text-center">
                        <label className="inline-flex items-center gap-2 text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em]">
                            <Target size={14} className="text-blue-500" />
                            Exclusive Invitation
                        </label>
                        
                        <div 
                            className="bg-black/40 p-8 rounded-3xl border border-white/5 text-center flex flex-col items-center justify-center gap-3 hover:bg-black/60 hover:border-blue-500/30 transition-all cursor-pointer group" 
                            onClick={handleCopy}
                        >
                            <span className="font-mono text-5xl font-black tracking-[0.15em] text-white group-hover:scale-105 transition-transform duration-300">
                                {user?.verificationCode}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">
                                <Copy size={12} />
                                Tap to copy code
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button 
                            onClick={handleCopy} 
                            className="w-full bg-white text-black py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-xl hover:bg-blue-50 hover:shadow-white/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                             <Share2 size={18} /> Copy Invite Link
                        </button>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="glass-card p-6 rounded-[32px] flex items-center gap-5 border border-white/5">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Innovative Network</p>
                        <p className="text-lg font-bold text-white">Verified Tech Community</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Official Community Section */}
        <div className="glass-card rounded-[40px] p-8 border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <Globe size={120} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-md">
                    <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                        <MessageCircle className="text-emerald-500" /> Join Our Community
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Stay updated with real-time news, hardware releases, and earn extra bonuses by joining our official groups.
                    </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <SocialBtn icon={<MessageCircle size={22} />} label="WhatsApp" color="bg-emerald-500" onClick={() => openSocial(SOCIAL_LINKS.WHATSAPP)} />
                    <SocialBtn icon={<Facebook size={22} />} label="Facebook" color="bg-blue-600" onClick={() => openSocial(SOCIAL_LINKS.FACEBOOK)} />
                    <SocialBtn icon={<Youtube size={22} />} label="YouTube" color="bg-red-600" onClick={() => openSocial(SOCIAL_LINKS.YOUTUBE)} />
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

const SocialBtn: React.FC<{ icon: React.ReactNode, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
    <div className="flex flex-col items-center gap-2 group/btn">
        <button 
            onClick={onClick}
            title={label}
            className={`w-12 h-12 md:w-14 md:h-14 ${color} rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/40 hover:scale-110 transition-all active:scale-95`}
        >
            {icon}
        </button>
        <span className="text-[8px] font-black uppercase tracking-widest text-gray-500 group-hover/btn:text-white transition-colors">{label}</span>
    </div>
);

export default Invite;
