import React from 'react';
import { getDate, isSameDay } from 'date-fns';
import { clsx } from 'clsx'; 

const DayCell = ({ date, onClick, disabled, data }) => {
  if (!date) return <div className="w-full aspect-square" />;

  const isToday = isSameDay(date, new Date());
  
  // --- UPDATED LOGIC ---
  // We now use the CSS variables we defined in themes.js
  let ratingColorClass = '';
  if (data?.rating) {
     if (data.rating >= 4) ratingColorClass = 'bg-[var(--color-rating-high)]'; 
     else if (data.rating >= 3) ratingColorClass = 'bg-[var(--color-rating-mid)]';
     else ratingColorClass = 'bg-[var(--color-rating-low)]';
  }

  return (
    <div
      onClick={() => !disabled && onClick(date)}
      className={clsx(
        "relative w-full aspect-square transition-all duration-200 ease-out group",
        "border md:border-2 p-1 md:p-2 rounded-xl md:rounded-2xl",
        
        disabled 
          ? "border-transparent opacity-20 cursor-default" 
          : "border-ink dark:border-chalk cursor-pointer bg-paper-card dark:bg-night-card",
        
        !disabled && "active:scale-95 md:hover:-translate-y-1 md:hover:shadow-soft md:dark:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]",
        
        isToday && !disabled && "ring-2 md:ring-4 ring-[#ae866c]/50 dark:ring-[#ae866c]/40 border-[#ae866c]"
      )}
    >
      <div className="flex justify-between items-start z-10 relative">
        <span className={clsx(
            "font-bold text-sm md:text-lg", 
            isToday ? "text-[#ae866c] dark:text-[#ead8c2]" : "text-ink dark:text-chalk"
        )}>
            {getDate(date)}
        </span>
        
        {/* Tiny Dot for Images */}
        {data?.images?.length > 0 && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-ink/30 dark:bg-chalk/50" />
        )}
      </div>

      {/* The Fill Indicator - Now follows the Theme! */}
      {data && (
        <div className={`
            absolute left-1 right-1 bottom-1 md:left-2 md:right-2 md:bottom-2 top-6 md:top-8 
            rounded-lg md:rounded-xl 
            border border-ink/10 dark:border-black/10 
            opacity-90 
            ${ratingColorClass}
        `}>
        </div>
      )}
    </div>
  );
};

export default DayCell;