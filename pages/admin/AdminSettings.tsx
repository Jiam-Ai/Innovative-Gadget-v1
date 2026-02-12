
import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Server, 
  FileOutput, 
  Database, 
  DollarSign, 
  Zap,
  LayoutGrid
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All Settings');

  const tabs = [
    { name: 'All Settings', icon: <LayoutGrid size={16} /> },
    { name: 'Financial', icon: <DollarSign size={16} /> },
    { name: 'Automation', icon: <Zap size={16} /> },
    { name: 'User Management', icon: <Users size={16} /> },
    { name: 'Security', icon: <Shield size={16} /> },
    { name: 'System', icon: <Server size={16} /> },
  ];

  const renderSettings = () => {
    const showAll = activeTab === 'All Settings';

    return (
      <div className="space-y-4">
        {/* Financial Settings */}
        {(showAll || activeTab === 'Financial') && (
          <>
            <div className="mb-2 px-4 py-2 bg-emerald-500/10 rounded-xl w-fit">
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Financial Controls</span>
            </div>
            <SettingItem 
              title="Minimum Deposit Amount" 
              desc="Minimum amount users can deposit in a single transaction" 
              value="100" 
            />
            <SettingItem 
              title="Maximum Deposit Amount" 
              desc="Maximum amount users can deposit in a single transaction" 
              value="50000" 
            />
            <SettingItem 
              title="Minimum Withdrawal Amount" 
              desc="Minimum amount users can withdraw in a single transaction" 
              value="100" 
            />
            <SettingItem 
              title="Withdrawal Fee Percentage" 
              desc="Percentage fee charged on withdrawals" 
              value="0" 
            />
          </>
        )}

        {/* Automation Settings */}
        {(showAll || activeTab === 'Automation') && (
          <>
            <div className="mt-8 mb-2 px-4 py-2 bg-blue-500/10 rounded-xl w-fit">
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Automation Rules</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div>
                    <h4 className="font-black text-white text-lg">Auto-Approve Deposits</h4>
                    <p className="text-xs text-gray-500 mt-1">Automatically approve deposit transactions without manual review.</p>
                </div>
                <div className="w-14 h-8 bg-gray-700 rounded-full p-1 relative cursor-pointer">
                    <div className="w-6 h-6 bg-white/20 rounded-full transition-all"></div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div>
                    <h4 className="font-black text-white text-lg">Daily Earnings System</h4>
                    <p className="text-xs text-gray-500 mt-1">Enable automatic daily yield distribution for active vault nodes.</p>
                </div>
                <div className="w-14 h-8 bg-emerald-600 rounded-full p-1 relative cursor-pointer">
                    <div className="w-6 h-6 bg-white rounded-full translate-x-6 transition-all shadow-md"></div>
                </div>
            </div>
          </>
        )}

        {/* User Management Settings */}
        {(showAll || activeTab === 'User Management') && (
          <>
            <div className="mt-8 mb-2 px-4 py-2 bg-purple-500/10 rounded-xl w-fit">
               <span className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Growth & Referrals</span>
            </div>
            <SettingItem 
              title="Registration Bonus" 
              desc="Bonus SLE credited to new users upon registration" 
              value="25" 
            />
            <SettingItem 
              title="Referral Commission %" 
              desc="Direct percentage earned by inviter on purchases" 
              value="5" 
            />
          </>
        )}

        {/* Security Settings */}
        {(showAll || activeTab === 'Security') && (
          <>
            <div className="mt-8 mb-2 px-4 py-2 bg-orange-500/10 rounded-xl w-fit">
               <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Security Protocol</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div>
                    <h4 className="font-black text-white text-lg">Enforce SMS Verification</h4>
                    <p className="text-xs text-gray-500 mt-1">Require SMS verification for sensitive account changes.</p>
                </div>
                <div className="w-14 h-8 bg-gray-700 rounded-full p-1 relative cursor-pointer">
                    <div className="w-6 h-6 bg-white/20 rounded-full transition-all"></div>
                </div>
            </div>
            <SettingItem 
              title="Withdrawal Cutoff Time" 
              desc="Hour of day (24h) when withdrawals are disabled" 
              value="20" 
            />
          </>
        )}

        {/* System Settings */}
        {(showAll || activeTab === 'System') && (
          <>
            <div className="mt-8 mb-2 px-4 py-2 bg-gray-500/10 rounded-xl w-fit">
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Core Infrastructure</span>
            </div>
            <SettingItem 
              title="Platform Name" 
              desc="Main branding name displayed across the app" 
              value="Innovative Gadget" 
            />
            <SettingItem 
              title="API Version" 
              desc="Current running infrastructure version" 
              value="2.5.1-GADGET" 
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">System Settings</h2>
          <p className="text-gray-400 text-sm mt-1">Configure global platform parameters and yield rules.</p>
        </div>
        
        <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3">
            <FileOutput size={18} /> Export Config
        </button>
      </div>

      <div className="flex gap-2 p-1.5 bg-black/40 rounded-[24px] border border-white/5 overflow-x-auto no-scrollbar backdrop-blur-md">
          {tabs.map((tab) => (
              <button 
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.name 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40 border border-emerald-400/20' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                  {tab.icon}
                  {tab.name}
              </button>
          ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {renderSettings()}
      </div>
    </div>
  );
};

const SettingItem: React.FC<{ title: string, desc: string, value: string }> = ({ title, desc, value }) => (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:bg-white/10 transition-all border-l-4 border-l-transparent hover:border-l-emerald-500">
        <div className="max-w-md">
            <h4 className="font-black text-white text-lg">{title}</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        </div>
        <div className="relative w-full md:w-48">
            <input 
                type="text" 
                defaultValue={value}
                className="bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-right outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all w-full"
            />
        </div>
    </div>
);

export default AdminSettings;
