
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40, showText = false }) => {
  const logoUrl = "https://files.catbox.moe/xl3z0v.jpeg";
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div 
        className="shrink-0 relative flex items-center justify-center rounded-2xl overflow-hidden bg-white dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all duration-500 hover:scale-110 active:scale-95 group"
        style={{ width: size, height: size }}
      >
        <img 
          src={logoUrl} 
          alt="Innovative Gadget Logo" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Optical Lens Flare Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/5 to-white/10 pointer-events-none rounded-2xl"></div>
      </div>
      {showText && (
        <span className="font-black text-slate-900 dark:text-white tracking-tighter uppercase" style={{ fontSize: size * 0.45 }}>
          Innovative
        </span>
      )}
    </div>
  );
};
