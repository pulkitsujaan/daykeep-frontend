import React from 'react';
import { ChevronLeft, ChevronRight, Moon, Sun, User } from 'lucide-react';
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

  const btnClass = "p-2 md:p-2.5 rounded-xl md:rounded-2xl border-2 border-ink dark:border-chalk hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all";

  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 p-4 md:p-5 border-3 border-ink dark:border-chalk rounded-3xl shadow-soft dark:shadow-soft-dark bg-paper-card dark:bg-night-card transition-all gap-4">
      
      {/* TOP ROW (Mobile): Profile & Theme Toggles for quick access */}
      <div className="flex md:hidden w-full justify-between items-center">
         <button 
            onClick={onProfileClick}
            className={`${btnClass} ${isProfileActive ? 'bg-ink text-white dark:bg-chalk dark:text-night-bg' : ''}`}
         >
            <User size={20} strokeWidth={2.5} />
         </button>

         <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`${btnClass} bg-ink text-paper-bg dark:bg-chalk dark:text-night-bg border-transparent`}
        >
            {darkMode ? <Sun size={20} fill="currentColor" /> : <Moon size={20} fill="currentColor" />}
        </button>
      </div>

      {/* DESKTOP LEFT: Profile Button */}
      <div className="hidden md:block">
         <button 
            onClick={onProfileClick}
            className={`${btnClass} ${isProfileActive ? 'bg-ink text-white dark:bg-chalk dark:text-night-bg' : ''}`}
         >
            <User size={24} strokeWidth={2.5} />
         </button>
      </div>

      {/* CENTER: Month Navigation */}
      {!isProfileActive ? (
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6">
            <button onClick={handlePrevMonth} className={btnClass}>
              <ChevronLeft size={20} md:size={24} strokeWidth={2.5} />
            </button>
            
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-center select-none text-ink dark:text-chalk">
              {format(currentDate, 'MMMM')}
            </h2>

            <button onClick={handleNextMonth} className={btnClass}>
              <ChevronRight size={20} md:size={24} strokeWidth={2.5} />
            </button>
        </div>
      ) : (
         <h2 className="text-3xl font-black tracking-tight">Profile</h2>
      )}

      {/* RIGHT: Year Select & Desktop Theme Toggle */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-end">
        {!isProfileActive && (
            <div className="relative group w-full md:w-auto">
                <select 
                    value={currentYear} 
                    onChange={(e) => setCurrentDate(setYear(currentDate, parseInt(e.target.value)))}
                    className="w-full md:w-auto appearance-none pl-5 pr-12 py-2 md:py-2.5 border-2 border-ink dark:border-chalk rounded-xl md:rounded-2xl bg-transparent font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none transition-colors text-lg text-ink dark:text-chalk text-center md:text-left"
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
            className={`hidden md:flex ${btnClass} items-center gap-2 bg-ink text-paper-bg dark:bg-chalk dark:text-night-bg border-transparent`}
        >
            {darkMode ? <Sun size={20} fill="currentColor" /> : <Moon size={20} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
};

export default Header;