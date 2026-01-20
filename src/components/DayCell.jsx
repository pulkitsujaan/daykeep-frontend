import React from 'react';
import { getDate, isSameDay } from 'date-fns';
import { clsx } from 'clsx'; 

const DayCell = ({ date, onClick, disabled, data }) => {
  if (!date) return <div className="w-full aspect-square" />;

  const isToday = isSameDay(date, new Date());
  
  // Revised Vintage-Compatible Palette
  let ratingColorClass = '';
  if (data?.rating) {
     if (data.rating >= 4) ratingColorClass = 'bg-teal-700';      // Deep Teal (Success)
     else if (data.rating >= 3) ratingColorClass = 'bg-[#ae866c]'; // Your Palette's Tan (Neutral)
     else ratingColorClass = 'bg-rose-900';    // Deep Rose (Low)
  }

  return (
    <div
      onClick={() => !disabled && onClick(date)}
      className={clsx(
        "relative w-full aspect-square p-2 border-2 transition-all duration-200 ease-out group rounded-2xl",
        
        // Disabled State
        disabled 
          ? "border-transparent opacity-20 cursor-default" 
          : "border-ink dark:border-chalk cursor-pointer bg-paper-card dark:bg-night-card",
        
        // Hover Effects
        !disabled && "hover:-translate-y-1 hover:shadow-soft dark:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] dark:hover:bg-white/10",
        
        // Today State (Using your accent color for the ring)
        isToday && !disabled && "ring-4 ring-[#ae866c]/50 dark:ring-[#ae866c]/40 border-[#ae866c]"
      )}
    >
      <div className="flex justify-between items-start z-10 relative">
        <span className={clsx(
            "font-bold text-lg", 
            // Today's text color matches the accent
            isToday ? "text-[#ae866c] dark:text-[#ead8c2]" : "text-ink dark:text-chalk"
        )}>
            {getDate(date)}
        </span>
      </div>

      {/* The Fill Indicator */}
      {data && (
        <div className={`absolute inset-3 mt-8 rounded-xl border-2 border-ink/20 dark:border-black/20 opacity-90 ${ratingColorClass}`}>
        </div>
      )}
    </div>
  );
};

export default DayCell;