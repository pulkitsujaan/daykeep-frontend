import React from 'react';
import { Feather } from 'lucide-react';

const Logo = ({ size = "normal" }) => {
  const isLarge = size === "large";

  return (
    <div className={`flex items-center gap-2 select-none ${isLarge ? 'flex-col' : 'flex-row'}`}>
      <div className={`
        flex items-center justify-center rounded-xl bg-ink text-paper-bg dark:bg-chalk dark:text-night-bg
        ${isLarge ? 'w-16 h-16 shadow-soft' : 'w-10 h-10 shadow-sm'}
      `}>
        <Feather size={isLarge ? 32 : 20} strokeWidth={2.5} />
      </div>
      
      <div className={`font-black tracking-tight text-ink dark:text-chalk ${isLarge ? 'text-center' : 'text-left'}`}>
        <h1 className={`${isLarge ? 'text-4xl mt-4' : 'text-2xl'}`}>
          DayKeep<span className="text-[var(--color-accent)]">.</span>
        </h1>
        {isLarge && (
            <span className="block text-sm opacity-60 font-bold uppercase tracking-widest mt-1">
                Est. 2026
            </span>
        )}
      </div>
    </div>
  );
};

export default Logo;