import React from 'react';
import { getDate, isSameDay } from 'date-fns';
import { clsx } from 'clsx'; 

const DayCell = ({ date, onClick, disabled, data }) => {
  // Return a transparent box to keep grid alignment if date is null
  if (!date) return <div className="w-full aspect-square" />;

  const isToday = isSameDay(date, new Date());
  
  let ratingColorClass = '';
  if (data?.rating) {
     if (data.rating >= 4) ratingColorClass = 'bg-teal-700';
     else if (data.rating >= 3) ratingColorClass = 'bg-[#ae866c]';
     else ratingColorClass = 'bg-rose-900';
  }

  return (
    <div
      onClick={() => !disabled && onClick(date)}
      className={clsx(
        "relative w-full aspect-square transition-all duration-200 ease-out group",
        "border md:border-2 p-1 md:p-2 rounded-xl md:rounded-2xl", // Responsive borders and padding
        
        disabled 
          ? "border-transparent opacity-20 cursor-default" 
          : "border-ink dark:border-chalk cursor-pointer bg-paper-card dark:bg-night-card",
        
        !disabled && "active:scale-95 md:hover:-translate-y-1 md:hover:shadow-soft md:dark:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]",
        
        isToday && !disabled && "ring-2 md:ring-4 ring-[#ae866c]/50 dark:ring-[#ae866c]/40 border-[#ae866c]"
      )}
    >
      <div className="flex justify-between items-start z-10 relative">
        <span className={clsx(
            "font-bold text-sm md:text-lg", // Smaller text on mobile
            isToday ? "text-[#ae866c] dark:text-[#ead8c2]" : "text-ink dark:text-chalk"
        )}>
            {getDate(date)}
        </span>
      </div>

      {/* Responsive Indicator Box */}
      {data && (
        <div className={`absolute left-1 right-1 bottom-1 md:left-2 md:right-2 md:bottom-2 top-6 md:top-8 rounded-lg md:rounded-xl border border-ink/20 dark:border-black/20 opacity-90 ${ratingColorClass}`}>
        </div>
      )}
      {data?.images?.length > 0 && (
    <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white border border-ink shadow-sm z-20" />
)}
    </div>
  );
};

export default DayCell;