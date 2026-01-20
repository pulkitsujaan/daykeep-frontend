import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isBefore, format } from 'date-fns';
import DayCell from './DayCell';

const CalendarGrid = ({ currentDate, accountCreationDate, onDayClick, logs }) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart); 
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 mb-4 text-center">
        {daysOfWeek.map(day => (
          <div key={day} className="font-black uppercase tracking-wider opacity-70 text-ink dark:text-chalk">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {calendarDays.map((day, index) => {
            const isCurrentMonth = day.getMonth() === monthStart.getMonth();
            const isDisabled = isBefore(day, accountCreationDate);
            
            // FIX: Use format() ensures we match the local string saved by LogModal
            // instead of converting to UTC which might shift the day back/forward
            const dayString = format(day, 'yyyy-MM-dd');
            const dayLog = logs.find(l => l.date === dayString);

            return (
                <DayCell 
                    key={index}
                    date={isCurrentMonth ? day : null}
                    disabled={isDisabled}
                    onClick={onDayClick}
                    data={dayLog}
                />
            );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;