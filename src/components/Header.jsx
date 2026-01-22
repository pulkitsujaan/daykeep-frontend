import React from "react";
import { ChevronLeft, ChevronRight, Moon, Sun, User } from "lucide-react";
import { format, setYear } from "date-fns";
import Logo from "./Logo";

const Header = ({
  currentDate,
  setCurrentDate,
  accountCreationDate,
  darkMode,
  setDarkMode,
  onProfileClick,
  onHomeClick,
  isProfileActive,
  streak
}) => {
  const currentYear = currentDate.getFullYear();
  const startYear = accountCreationDate.getFullYear();
  const years = [];

  for (let i = startYear; i <= new Date().getFullYear() + 1; i++) {
    years.push(i);
  }

  const handlePrevMonth = () => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1,
    );
    if (
      newDate >=
      new Date(
        accountCreationDate.getFullYear(),
        accountCreationDate.getMonth(),
        1,
      )
    ) {
      setCurrentDate(newDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const btnClass =
    "p-2 rounded-xl border-2 border-ink dark:border-chalk hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all";

  // 1. NEW: Handle Logo Click
  const handleLogoClick = () => {
    if (isProfileActive) {
      onHomeClick();
    } else {
      setCurrentDate(new Date()); // Reset to today if already on calendar
    }
  };

  // 2. NEW: Handle Profile Button Toggle
  const handleProfileToggle = () => {
    if (isProfileActive) {
      onHomeClick(); // If open, close it (go home)
    } else {
      onProfileClick(); // If closed, open it
    }
  };

  return (
    <div className="flex flex-col gap-6 mb-8">
      {/* TOP ROW */}
      <div className="flex justify-between items-center">
        {/* BRAND LOGO */}
        <div className="cursor-pointer" onClick={handleLogoClick}>
          <Logo />
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3">
          {/* Streak Badge */}
          {streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 border-2 border-orange-500 rounded-xl">
              <span className="text-orange-600 dark:text-orange-400 font-black text-sm">
                {streak}
              </span>
              <div className="animate-pulse">🔥</div>
            </div>
          )}
          <button
            onClick={handleProfileToggle} // <--- USE TOGGLE FUNCTION HERE
            className={`${btnClass} ${isProfileActive ? "bg-ink text-white dark:bg-chalk dark:text-night-bg" : ""}`}
            title={isProfileActive ? "Back to Calendar" : "Profile"}
          >
            <User size={20} strokeWidth={2.5} />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`${btnClass} bg-ink text-paper-bg dark:bg-chalk dark:text-night-bg border-transparent`}
            title="Toggle Theme"
          >
            {darkMode ? (
              <Sun size={20} fill="currentColor" />
            ) : (
              <Moon size={20} fill="currentColor" />
            )}
          </button>
        </div>
      </div>

      {/* NAVIGATION ROW */}
      {!isProfileActive && (
        <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-start">
            <button onClick={handlePrevMonth} className={btnClass}>
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-ink dark:text-chalk w-32 text-center select-none">
              {format(currentDate, "MMM")}
            </h2>
            <button onClick={handleNextMonth} className={btnClass}>
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="relative group w-full md:w-auto">
            <select
              value={currentYear}
              onChange={(e) =>
                setCurrentDate(setYear(currentDate, parseInt(e.target.value)))
              }
              className="w-full md:w-auto appearance-none pl-5 pr-12 py-2 border-2 border-ink dark:border-chalk rounded-xl bg-transparent font-bold cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none text-lg text-ink dark:text-chalk text-center md:text-left"
            >
              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                  className="text-ink bg-paper-card"
                >
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-ink dark:text-chalk">
              <ChevronRight className="rotate-90" size={20} strokeWidth={3} />
            </div>
          </div>
        </div>
      )}

      {isProfileActive && (
        <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-black text-center text-ink dark:text-chalk">
            Your Profile
          </h2>
        </div>
      )}
    </div>
  );
};

export default Header;
