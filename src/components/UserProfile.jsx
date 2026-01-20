import React from 'react';
import { User, Mail, Calendar, CheckCircle } from 'lucide-react';
import { themes } from '../data/themes';

const UserProfile = ({ currentTheme, setTheme, onBack }) => {
  const user = {
    name: "Study Master",
    email: "student@example.com",
    joined: "Jan 1, 2023",
    streak: 12
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-2xl mx-auto">
      
      {/* Profile Header Card */}
      <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 md:p-8 shadow-soft dark:shadow-soft-dark mb-8 relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="w-24 h-24 rounded-2xl bg-ink dark:bg-chalk text-paper-bg dark:text-night-bg flex items-center justify-center border-2 border-ink dark:border-chalk shadow-soft">
            <User size={40} strokeWidth={2.5} />
          </div>

          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-black text-ink dark:text-chalk">{user.name}</h2>
            
            <div className="flex flex-col md:flex-row gap-4 text-ink/70 dark:text-chalk/70 font-bold text-sm items-center md:items-start">
              <span className="flex items-center gap-2">
                <Mail size={16} /> {user.email}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} /> Joined {user.joined}
              </span>
            </div>
          </div>

          {/* FIX: Use dynamic CSS variable for background color */}
          <div className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-xl border-2 border-ink shadow-sm rotate-3">
            <span className="block text-xs font-bold uppercase tracking-wider opacity-90">Current Streak</span>
            <span className="flex items-center justify-center gap-2 text-2xl font-black">
              <CheckCircle size={20} fill="currentColor" className="text-white" /> {user.streak}
            </span>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-ink dark:text-chalk px-2">Choose Your Look</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(themes).map(([key, theme]) => {
            const isActive = currentTheme === key;
            
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`
                  relative p-4 rounded-2xl border-3 text-left transition-all duration-200 group
                  ${isActive 
                    ? 'border-ink dark:border-chalk bg-white/50 dark:bg-black/20 ring-2 ring-offset-2 ring-[var(--color-accent)]' 
                    : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.colors['--color-paper-bg'] }} />
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.colors['--color-ink'] }} />
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.colors['--color-accent'] }} />
                  </div>
                  
                  <span className={`font-bold text-lg ${isActive ? 'text-ink dark:text-chalk' : 'opacity-60'}`}>
                    {theme.name}
                  </span>
                  
                  {isActive && (
                    <div className="ml-auto bg-ink dark:bg-chalk text-paper-bg dark:text-night-bg p-1 rounded-full">
                        <CheckCircle size={16} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

        <div className="mt-8 flex justify-center">
            <button 
                onClick={onBack}
                className="text-ink dark:text-chalk font-bold underline decoration-2 underline-offset-4 opacity-60 hover:opacity-100"
            >
                Back to Calendar
            </button>
        </div>
    </div>
  );
};

export default UserProfile;