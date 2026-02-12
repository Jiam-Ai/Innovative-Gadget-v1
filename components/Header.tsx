
import React from 'react';
import { MessageSquareMore, Moon, Sun } from 'lucide-react';
import { useUI } from '../contexts/UIContext';
import { NotificationCenter } from './NotificationCenter';
import { Logo } from './Logo';

interface HeaderProps {
  title?: string;
  showSupport?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title = "Innovative Gadget", showSupport = true }) => {
  const { openChat, theme, toggleTheme } = useUI();
  
  return (
    <header className="sticky top-0 z-40 w-full md:hidden">
      <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-black/5 dark:border-white/5"></div>
      <div className="relative px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <h1 className="font-black text-base text-slate-900 dark:text-white tracking-tighter uppercase">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full hover:bg-emerald-500/20 transition border border-emerald-500/20"
            >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationCenter />
            {showSupport && (
            <button 
                onClick={openChat}
                className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-full hover:bg-emerald-500/20 transition border border-emerald-500/20"
            >
                <MessageSquareMore size={18} />
            </button>
            )}
        </div>
      </div>
    </header>
  );
};
