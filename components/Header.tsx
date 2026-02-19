
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquareMore, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { NotificationCenter } from './NotificationCenter';
import { Logo } from './Logo';

interface HeaderProps {
  title?: string;
  showSupport?: boolean;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showSupport = true, showBack }) => {
  const { openChat, theme, toggleTheme } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically show back button if not on primary landing pages
  const isRoot = location.pathname === '/' || location.pathname === '/dashboard';
  const displayBack = showBack ?? !isRoot;

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5"></div>
      <div className="relative px-4 py-3.5 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {displayBack ? (
            <button 
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-slate-900 dark:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90"
              aria-label="Navigate back"
            >
              <ArrowLeft size={22} />
            </button>
          ) : (
            <div className="md:hidden">
              <Logo size={32} />
            </div>
          )}
          <div className="flex flex-col">
            <h1 className="font-black text-[13px] md:text-base text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              {title || "Innovative Gadget"}
            </h1>
            <span className="text-[7px] md:text-[8px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-[0.2em] mt-1">
              Verified Retail Node
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="text-slate-600 dark:text-emerald-500 bg-black/5 dark:bg-emerald-500/10 p-2 rounded-xl hover:bg-black/10 dark:hover:bg-emerald-500/20 transition border border-transparent dark:border-emerald-500/20 shadow-sm"
                title="Toggle UI Mode"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationCenter />
            {showSupport && (
            <button 
                onClick={openChat}
                className="text-slate-600 dark:text-emerald-500 bg-black/5 dark:bg-emerald-500/10 p-2 rounded-xl hover:bg-black/10 dark:hover:bg-emerald-500/20 transition border border-transparent dark:border-emerald-500/20 shadow-sm"
                title="Retail Assistance"
            >
                <MessageSquareMore size={18} />
            </button>
            )}
        </div>
      </div>
    </header>
  );
};
