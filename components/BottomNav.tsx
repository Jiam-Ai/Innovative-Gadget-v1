
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, User, ReceiptText } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const navItems = [
    { name: 'HOME', path: '/', icon: <Home size={20} /> },
    { name: 'BAG', path: '/cart', icon: <ShoppingBag size={20} /> },
    { name: 'ORDERS', path: '/orders', icon: <ReceiptText size={20} /> },
    { name: 'ACCOUNT', path: '/dashboard', icon: <User size={20} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="w-full bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 pointer-events-auto shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-md mx-auto flex justify-around items-center px-2 py-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const isBag = item.name === 'BAG';

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className="relative flex flex-col items-center justify-center w-full py-1 transition-all duration-300 group"
              >
                <div className={`
                    mb-1 transition-all duration-300 relative
                    ${isActive ? 'text-emerald-500 scale-110' : 'text-gray-500 group-hover:text-gray-300'}
                `}>
                  {item.icon}
                  {isBag && cartCount > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center bg-emerald-500 text-[10px] text-white font-black rounded-full border-2 border-[#050505] px-1 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-in zoom-in duration-300">
                        {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className={`
                    text-[10px] font-black uppercase tracking-widest transition-all duration-300
                    ${isActive ? 'text-emerald-500' : 'text-gray-600'}
                `}>
                  {item.name}
                </span>
                {isActive && (
                   <div className="absolute -top-[13px] w-10 h-[3px] bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-[env(safe-area-inset-bottom)] bg-[#050505]"></div>
    </div>
  );
};
