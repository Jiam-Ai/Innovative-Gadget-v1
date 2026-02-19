
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Truck, 
  Package, 
  Settings, 
  LogOut,
  Bell,
  Shield,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { logoutUser } from '../../services/storageService';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', path: 'overview', icon: <LayoutDashboard size={18} /> },
    { name: 'Customers', path: 'users', icon: <Users size={18} /> },
    { name: 'Logistics', path: 'transactions', icon: <Truck size={18} /> },
    { name: 'Inventory', path: 'packages', icon: <Package size={18} /> },
    { name: 'Settings', path: 'settings', icon: <Settings size={18} /> },
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[#050505] flex overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden" onClick={closeSidebar}></div>
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-[70] w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
               <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tighter leading-none uppercase">Manager</h1>
              <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-1">Innovative Hub</p>
            </div>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeSidebar}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group font-bold text-xs ${
                  isActive 
                  ? 'bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 shadow-sm' 
                  : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 hover:bg-rose-600/10 text-gray-500 hover:text-rose-500 transition-all font-black text-[9px] uppercase tracking-widest"
          >
            <LogOut size={14} /> Exit Admin
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="lg:hidden h-14 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-50">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400"><Menu size={18} /></button>
          <span className="text-xs font-black text-white tracking-tighter uppercase">Admin Panel</span>
          <Bell size={18} className="text-emerald-500" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
