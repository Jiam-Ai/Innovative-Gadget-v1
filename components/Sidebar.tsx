
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, User, LogOut, MessageSquareMore, Sun, Moon, ReceiptText, LayoutGrid, Truck } from 'lucide-react';
import { logoutUser } from '../services/storageService';
import { useUI } from '../contexts/UIContext';
import { useCart } from '../contexts/CartContext';
import { Logo } from './Logo';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { openChat, theme, toggleTheme } = useUI();
  const { cartCount } = useCart();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navItems = [
    { name: 'SHOP', path: '/', icon: <LayoutGrid size={22} /> },
    { name: 'CART', path: '/cart', icon: <ShoppingBag size={22} />, badge: true },
    { name: 'MY ORDERS', path: '/orders', icon: <ReceiptText size={22} /> },
    { name: 'TRACKING', path: '/track', icon: <Truck size={22} /> },
    { name: 'ACCOUNT', path: '/dashboard', icon: <Home size={22} /> },
    { name: 'PROFILE', path: '/profile', icon: <User size={22} /> },
  ];

  return (
    <div className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 z-50 border-r border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-2xl">
      <div className="p-8 flex items-center gap-3">
        <Logo size={48} />
        <div>
          <h1 className="font-black text-xl text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Innovative</h1>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-widest font-black mt-1">Tech Store</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 font-black text-xs tracking-widest relative ${
                isActive
                  ? 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-500/20'
                  : 'text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.name}
            {item.badge && cartCount > 0 && (
                <span className="ml-auto bg-emerald-600 text-white text-[10px] min-w-[20px] h-[20px] flex items-center justify-center rounded-full font-black animate-in zoom-in duration-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    {cartCount}
                </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 space-y-2">
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-4 px-4 py-3 w-full text-left text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-white rounded-2xl transition-all font-black text-xs tracking-widest"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
        </button>
        <button 
          onClick={openChat}
          className="flex items-center gap-4 px-4 py-3 w-full text-left text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-emerald-600 dark:hover:text-white rounded-2xl transition-all font-black text-xs tracking-widest"
        >
          <MessageSquareMore size={20} />
          HELP
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full text-left text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 rounded-2xl transition-all font-black text-xs tracking-widest"
        >
          <LogOut size={20} />
          LOGOUT
        </button>
      </div>
    </div>
  );
};
