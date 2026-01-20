import React from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun, User } from 'lucide-react'; // Import User icon
import { format, setYear } from 'date-fns';

const Header = ({ 
  currentDate, setCurrentDate, accountCreationDate, 
  darkMode, setDarkMode, 
  onProfileClick, isProfileActive 
}) => {
  const currentYear = currentDate.getFullYear();
  const startYear = accountCreationDate.getFullYear();
  const years = [];
  
  for (let i = startYear; i <= new Date().getFullYear() + 1; i++) {
    years.push(i);
  }

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    if (newDate >= new Date(accountCreationDate.getFullYear(), accountCreationDate.getMonth(), 1)) {
      setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const btnClass = "p-2.5 rounded-2xl border-2 border-ink dark:border-chalk hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all";

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-10 p-5 border-3 border-ink dark:border-chalk rounded-3xl shadow-soft dark:shadow-soft-dark bg-paper-card dark:bg-night-card transition-all">
      
      {/* LEFT: Profile Button (New) */}
      <div className="hidden md:block">
         <button 
            onClick={onProfileClick}
            className={`${btnClass} ${isProfileActive ? 'bg-ink text-white dark:bg-chalk dark:text-night-bg' : ''}`}
         >
            <User size={24} strokeWidth={2.5} />
         </button>
      </div>

      {/* CENTER: Navigation */}
      {/* We hide nav if we are on profile page to keep it clean, or you can keep it */}
      {!isProfileActive ? (
        <div className="flex items-center gap-6 mb-4 md:mb-0">
            <button onClick={handlePrevMonth} className={btnClass}>
            <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            
            <h2 className="text-3xl md:text-4xl font-black tracking-tight w-48 text-center select-none text-ink dark:text-chalk">
            {format(currentDate, 'MMMM')}
            </h2>

            <button onClick={handleNextMonth} className={btnClass}>
            <ChevronRight size={24} strokeWidth={2.5} />
            </button>
        </div>
      ) : (
         <h2 className="text-3xl font-black tracking-tight mb-4 md:mb-0">Profile</h2>
      )}

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-4">
        
        {/* Only show Year/Nav on Calendar view */}
        {!isProfileActive && (
            <div className="relative group">
                <select 
                    value={currentYear} 
                    onChange={(e) => setCurrentDate(setYear(currentDate, parseInt(e.target.value)))}
                    className="appearance-none pl-5 pr-12 py-2.5 border-2 border-ink dark:border-chalk rounded-2xl bg-transparent font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none transition-colors text-lg text-ink dark:text-chalk"
                >
                    {years.map((year) => (
                    <option key={year} value={year} className="text-ink bg-paper-card">{year}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink dark:text-chalk">
                    <ChevronRight className="rotate-90" size={20} strokeWidth={3}/>
                </div>
            </div>
        )}

        <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`${btnClass} flex items-center gap-2 bg-ink text-paper-bg dark:bg-chalk dark:text-night-bg border-transparent`}
        >
            {darkMode ? <Sun size={20} fill="currentColor" /> : <Moon size={20} fill="currentColor" />}
        </button>
        
        {/* Mobile Profile Button (Visible only on small screens) */}
        <div className="md:hidden">
            <button onClick={onProfileClick} className={btnClass}>
                <User size={24} strokeWidth={2.5} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Header;