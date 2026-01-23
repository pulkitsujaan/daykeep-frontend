import React, { useState, useMemo } from 'react';
import { 
  format, eachDayOfInterval, startOfYear, endOfYear, 
  isAfter, startOfDay, getYear, getDay, startOfWeek, endOfWeek 
} from 'date-fns';
import { ChevronDown, Filter } from 'lucide-react';

const YearlyPixels = ({ logs }) => {
  // 1. Calculate available years from logs
  const availableYears = useMemo(() => {
    const years = new Set([new Date().getFullYear()]); // Always include current year
    logs.forEach(log => {
        if (log.date) years.add(new Date(log.date).getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a); // Descending sort
  }, [logs]);

  const [selectedYear, setSelectedYear] = useState(availableYears[0]);

  // 2. Generate Grid Data (Weeks -> Days)
  const gridData = useMemo(() => {
    const start = startOfWeek(startOfYear(new Date(selectedYear, 0, 1))); // Start from the Sunday before Jan 1st
    const end = endOfWeek(endOfYear(new Date(selectedYear, 11, 31)));     // End at the Saturday after Dec 31st
    
    const allDays = eachDayOfInterval({ start, end });
    
    // Group into weeks (Arrays of 7 days)
    const weeks = [];
    let currentWeek = [];
    
    allDays.forEach(day => {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    return weeks;
  }, [selectedYear]);

  // Helper: Get Month Labels positions
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = -1;
    
    gridData.forEach((week, index) => {
        // Use the first non-null day of the week to determine month
        const firstDay = week[0]; 
        const month = firstDay.getMonth();
        
        // If month changes and the day is actually in the selected year (handle edge case of previous year days)
        if (month !== lastMonth && firstDay.getFullYear() === selectedYear) {
            labels.push({ text: format(firstDay, 'MMM'), index });
            lastMonth = month;
        }
    });
    return labels;
  }, [gridData, selectedYear]);

  // Helper to get color
  const getColor = (rating) => {
    if (!rating) return 'bg-ink/5 dark:bg-chalk/5'; 
    if (rating === 1) return 'bg-rose-400';
    if (rating === 2) return 'bg-orange-400';
    if (rating === 3) return 'bg-yellow-400';
    if (rating === 4) return 'bg-emerald-400';
    if (rating === 5) return 'bg-[var(--color-accent)]'; 
    return 'bg-ink/5';
  };

  return (
    <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 md:p-8 shadow-soft relative">
      
      {/* HEADER: Title & Filter */}
      <div className="flex flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-[var(--color-accent)]">{selectedYear}</span> Logs
            </h3>
            <p className="text-xs font-bold opacity-40">Consistency Graph</p>
        </div>

        {/* Year Selector Dropdown */}
        <div className="relative group">
            <div className="flex items-center gap-2 bg-paper-bg dark:bg-black/20 px-4 py-2 rounded-xl border-2 border-ink/10 cursor-pointer hover:border-[var(--color-accent)] transition-colors">
                <Filter size={14} className="opacity-50" />
                <span className="font-bold text-sm">{selectedYear}</span>
                <ChevronDown size={14} className="opacity-50" />
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-32 bg-paper-card dark:bg-night-card border-2 border-ink dark:border-chalk rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                {availableYears.map(year => (
                    <div 
                        key={year}
                        onClick={() => setSelectedYear(year)}
                        className={`px-4 py-2 text-sm font-bold cursor-pointer hover:bg-[var(--color-accent)] hover:text-white transition-colors
                            ${selectedYear === year ? 'bg-ink/5 dark:bg-white/5' : ''}
                        `}
                    >
                        {year}
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* GRAPH CONTAINER */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-max">
            
            {/* 1. Month Labels (X-Axis) */}
            <div className="flex mb-2 ml-8 relative h-4">
                {monthLabels.map((label, i) => (
                    <div 
                        key={i} 
                        className="absolute text-[10px] font-bold uppercase opacity-40"
                        style={{ left: `${label.index * 14}px` }} // 14px = roughly width(10) + gap(4) of a column
                    >
                        {label.text}
                    </div>
                ))}
            </div>

            <div className="flex gap-1">
                {/* 2. Weekday Labels (Y-Axis) */}
                <div className="flex flex-col gap-1 mr-2 mt-[2px]">
                    <span className="text-[9px] font-bold opacity-0 h-2 md:h-3">S</span> {/* Spacer */}
                    <span className="text-[9px] font-bold opacity-40 h-2 md:h-3 leading-3">M</span>
                    <span className="text-[9px] font-bold opacity-0 h-2 md:h-3">T</span>
                    <span className="text-[9px] font-bold opacity-40 h-2 md:h-3 leading-3">W</span>
                    <span className="text-[9px] font-bold opacity-0 h-2 md:h-3">T</span>
                    <span className="text-[9px] font-bold opacity-40 h-2 md:h-3 leading-3">F</span>
                    <span className="text-[9px] font-bold opacity-0 h-2 md:h-3">S</span>
                </div>

                {/* 3. The Grid Columns (Weeks) */}
                {gridData.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                        {week.map((day, dIdx) => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const log = logs.find(l => l.date === dateStr);
                            const isFuture = isAfter(day, startOfDay(new Date()));
                            const isSelectedYear = day.getFullYear() === selectedYear;

                            // If day belongs to prev/next year (padding), hide it or dim it
                            if (!isSelectedYear) return <div key={dIdx} className="w-2 h-2 md:w-3 md:h-3 bg-transparent" />;

                            return (
                                <div
                                    key={dIdx}
                                    title={`${format(day, 'MMM do')}: ${log?.rating ? log.rating + '/5' : 'No Log'}`}
                                    className={`
                                        w-2 h-2 md:w-3 md:h-3 rounded-[2px] transition-all hover:scale-125 hover:z-10 cursor-default
                                        ${getColor(log?.rating)}
                                        ${isFuture ? 'opacity-0' : 'opacity-100'} 
                                        ${!log && !isFuture ? 'bg-ink/5 dark:bg-chalk/10' : ''}
                                    `}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Footer Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-[10px] font-bold opacity-60">
        <span>Bad</span>
        <div className="w-2 h-2 rounded-[2px] bg-ink/5 dark:bg-chalk/10"/>
        <div className="w-2 h-2 rounded-[2px] bg-rose-400"/>
        <div className="w-2 h-2 rounded-[2px] bg-orange-400"/>
        <div className="w-2 h-2 rounded-[2px] bg-yellow-400"/>
        <div className="w-2 h-2 rounded-[2px] bg-emerald-400"/>
        <div className="w-2 h-2 rounded-[2px] bg-[var(--color-accent)]"/>
        <span>Good</span>
      </div>
    </div>
  );
};

export default YearlyPixels;