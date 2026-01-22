import React from 'react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, 
  eachDayOfInterval, isBefore, isAfter, format // <--- Import isAfter
} from 'date-fns';
import DayCell from './DayCell';

const CalendarGrid = ({ currentDate, accountCreationDate, onDayClick, logs }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart); 
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get "Right Now" to compare against
  const today = startOfDay(new Date());

  return (
    <div className="w-full">
      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2 md:mb-4 text-center">
        {daysOfWeek.map(day => (
          <div key={day} className="text-[10px] md:text-sm font-black uppercase tracking-wider opacity-70 text-ink dark:text-chalk">
            {day}
          </div>
        ))}
      </div>
      
      {/* The Grid */}
      <div className="grid grid-cols-7 gap-1 md:gap-4">
        {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === monthStart.getMonth();
            const dayString = format(day, 'yyyy-MM-dd');
            const dayLog = logs.find(l => l.date === dayString);

            // 1. Logic: Is this day in the future?
            const isFuture = isAfter(day, today);
            
            // 2. Logic: Only disable days BEFORE account creation
            // We REMOVED "|| isAfter(day, today)" so future days are clickable
            const isDisabled = isBefore(day, accountCreationDate);
            
            return (
                <DayCell 
                    key={index}
                    date={isCurrentMonth ? day : null}
                    disabled={isDisabled}
                    onClick={onDayClick}
                    data={dayLog}
                    isFuture={isFuture} // <--- Pass this new prop
                />
            );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;