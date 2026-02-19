
import React, { useState } from 'react';
import { 
  Shield, 
  DollarSign, 
  Truck,
  Store,
  CreditCard,
  Lock,
  LayoutGrid
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Store Settings');

  const tabs = [
    { name: 'Store Settings', icon: <Store size={16} /> },
    { name: 'Logistics', icon: <Truck size={16} /> },
    { name: 'Financials', icon: <DollarSign size={16} /> },
    { name: 'Security', icon: <Shield size={16} /> },
  ];

  const renderSettings = () => {
    switch(activeTab) {
      case 'Store Settings':
        return (
          <div className="space-y-4">
            <SettingItem title="Shop Name" desc="Branding title displayed across the app" value="Innovative Gadget" />
            <SettingItem title="Support Email" desc="Contact address for customer inquiries" value="support@innovative.io" />
            <ToggleItem title="Maintenance Mode" desc="Take the shop offline for catalog updates" enabled={false} />
          </div>
        );
      case 'Logistics':
        return (
          <div className="space-y-4">
            <SettingItem title="Base Shipping Fee" desc="Flat rate charge for all orders" value="50" />
            <SettingItem title="Free Shipping Threshold" desc="Minimum order value for free delivery" value="1000" />
            <ToggleItem title="Enable Tracking Alerts" desc="Send automated tracking updates to customers" enabled={true} />
          </div>
        );
      case 'Financials':
        return (
          <div className="space-y-4">
            <SettingItem title="Minimum Top-up" desc="Minimum wallet deposit allowed" value="100" />
            <SettingItem title="Max Daily Withdrawal" desc="Daily limit for wallet cash-outs" value="5000" />
            <ToggleItem title="Manual Deposit Review" desc="Require admin approval for all wallet funding" enabled={true} />
          </div>
        );
      case 'Security':
        return (
          <div className="space-y-4">
            <SettingItem title="Admin Access Code" desc="Secondary verification for sensitive data" value="****" />
            <ToggleItem title="Session Expiry" desc="Force logout after 24 hours of inactivity" enabled={true} />
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-10 animate-reveal">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter">System Configuration</h2>
          <p className="text-gray-500 text-sm mt-1">Manage global shop parameters and shipping rules.</p>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-black/40 rounded-[24px] border border-white/5 overflow-x-auto no-scrollbar backdrop-blur-md">
          {tabs.map((tab) => (
              <button 
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.name 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/40' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                  {tab.icon}
                  {tab.name}
              </button>
          ))}
      </div>

      <div className="bg-[#0a0a0f] border border-white/5 rounded-[40px] p-4 md:p-8 animate-reveal">
        {renderSettings()}
      </div>
    </div>
  );
};

const SettingItem: React.FC<{ title: string, desc: string, value: string }> = ({ title, desc, value }) => (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/10 transition-all">
        <div>
            <h4 className="font-black text-white text-base uppercase tracking-tight">{title}</h4>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest leading-relaxed">{desc}</p>
        </div>
        <input 
            type="text" 
            defaultValue={value}
            className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 text-white font-black text-sm outline-none focus:border-emerald-500/50 w-full md:w-64"
        />
    </div>
);

const ToggleItem: React.FC<{ title: string, desc: string, enabled: boolean }> = ({ title, desc, enabled }) => (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 flex items-center justify-between group hover:bg-white/10 transition-all">
        <div>
            <h4 className="font-black text-white text-base uppercase tracking-tight">{title}</h4>
            <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">{desc}</p>
        </div>
        <div className={`w-12 h-6 rounded-full p-1 relative cursor-pointer transition-colors ${enabled ? 'bg-emerald-600' : 'bg-gray-700'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'translate-x-6' : 'translate-x-0 shadow-md'}`}></div>
        </div>
    </div>
);

export default AdminSettings;
