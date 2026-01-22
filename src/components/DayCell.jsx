import React from 'react';
import { getDate, isSameDay } from 'date-fns';
import { clsx } from 'clsx'; 

const DayCell = ({ date, onClick, disabled, data, isFuture }) => { // <--- Added isFuture
  if (!date) return <div className="w-full aspect-square" />;

  const isToday = isSameDay(date, new Date());
  
  let ratingColorClass = '';
  if (data?.rating) {
     if (data.rating >= 4) ratingColorClass = 'bg-[var(--color-rating-high)]'; 
     else if (data.rating >= 3) ratingColorClass = 'bg-[var(--color-rating-mid)]';
     else ratingColorClass = 'bg-[var(--color-rating-low)]';
  } else if (data && !data.rating) {
     // Optional: Color for "Plans" (entries with no rating)
     ratingColorClass = 'bg-ink/10 dark:bg-chalk/10';
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
        
        // --- VISUAL CUE FOR FUTURE ---
        // If it's future and has no data yet, show it as dashed and slightly transparent
        !disabled && isFuture && !data && "border-dashed opacity-60 hover:opacity-100",
        
        !disabled && "active:scale-95 md:hover:-translate-y-1 md:hover:shadow-soft",
        
        isToday && !disabled && "ring-2 md:ring-4 ring-[var(--color-accent)]/50 border-[var(--color-accent)]"
      )}
    >
      <div className="flex justify-between items-start z-10 relative">
        <span className={clsx(
            "font-bold text-sm md:text-lg", 
            isToday ? "text-[var(--color-accent)]" : "text-ink dark:text-chalk"
        )}>
            {getDate(date)}
        </span>
        
        {data?.images?.length > 0 && (
            <div className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-ink/30 dark:bg-chalk/50" />
        )}
      </div>

      {data && (
        <div className={`
            absolute left-1 right-1 bottom-1 md:left-2 md:right-2 md:bottom-2 top-6 md:top-8 
            rounded-lg md:rounded-xl 
            border border-ink/10 dark:border-black/10 
            opacity-90 
            ${ratingColorClass}
        `}>
          {/* Optional: Show 'Plan' text or icon inside the cell if rating is 0 */}
          {!data.rating && (
            <div className="w-full h-full flex items-center justify-center opacity-50 text-[10px] font-bold uppercase tracking-widest">
                Plan
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DayCell;