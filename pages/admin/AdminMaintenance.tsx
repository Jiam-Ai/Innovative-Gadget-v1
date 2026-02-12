
import React from 'react';
import { Activity, ShieldCheck, Database, Zap, Archive, Trash2, ShieldAlert, Users, Package } from 'lucide-react';

const AdminMaintenance: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter">Database Maintenance</h2>
          <p className="text-gray-400 text-sm mt-1">System backup, cleanup, and infrastructure health tools.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[40px] p-10">
          <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" size={20} /> System Health Status
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HealthCard title="Database Connection" desc="Connection to Supabase is stable" status="HEALTHY" icon={<Database size={20}/>} />
              <HealthCard title="User Data Integrity" desc="482 user records validated" status="HEALTHY" icon={<Users size={20}/>} />
              <HealthCard title="Transaction Processing" desc="0 pending sync operations" status="HEALTHY" icon={<Zap size={20}/>} />
              <HealthCard title="VIP Package System" desc="10 active hardware tiers" status="HEALTHY" icon={<Package size={20}/>} />
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ToolCard 
            title="Full System Backup" 
            desc="Complete binary backup of all system data and configurations." 
            icon={<Archive className="text-purple-500" />}
            btn="Start Backup"
          />
          <ToolCard 
            title="System Cleanup" 
            desc="Remove old audit logs and temporary session files." 
            icon={<Trash2 className="text-rose-500" />}
            btn="Trigger Cleanup"
            isDanger={true}
          />
          <ToolCard 
            title="DB Optimization" 
            desc="Optimize database indexes for enhanced query performance." 
            icon={<Database className="text-blue-500" />}
            btn="Optimize Now"
          />
      </div>

      <div className="bg-[#1e1136] border border-white/10 rounded-[40px] p-10 flex items-start gap-6">
          <ShieldAlert className="text-yellow-500 shrink-0" size={32} />
          <div>
              <h4 className="text-xl font-black text-white mb-2">Important Notice</h4>
              <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">Regular backups are essential for data security. It's recommended to perform full system backups at least weekly and before any major system updates. Store backups in cold storage for maximum redundancy.</p>
          </div>
      </div>
    </div>
  );
};

const HealthCard: React.FC<{ title: string, desc: string, status: string, icon: React.ReactNode }> = ({ title, desc, status, icon }) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{status}</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
            <div className="text-gray-500">{icon}</div>
            <h4 className="text-sm font-bold text-white">{title}</h4>
        </div>
        <p className="text-[10px] text-gray-500 leading-relaxed">{desc}</p>
    </div>
);

const ToolCard: React.FC<{ title: string, desc: string, icon: React.ReactNode, btn: string, isDanger?: boolean }> = ({ title, desc, icon, btn, isDanger }) => (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 group hover:bg-white/10 transition-all">
        <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 mb-6 group-hover:scale-110 transition-transform">{icon}</div>
        <h4 className="text-xl font-black text-white mb-2 leading-tight">{title}</h4>
        <p className="text-xs text-gray-500 mb-8 leading-relaxed">{desc}</p>
        <button className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isDanger ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>{btn}</button>
    </div>
);

export default AdminMaintenance;
