import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, CheckCircle, TrendingUp, Brain, Lightbulb, Sparkles, Loader2, LogOut } from 'lucide-react';
import { themes } from '../data/themes';

const UserProfile = ({ currentTheme, setTheme, onBack, onLogout, user, token }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to format join date
  // --- FIX 3: Dynamic Member Since Date ---
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).getFullYear() 
    : new Date().getFullYear();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/entries/stats/${user.id}`, {
          headers: { Authorization: token }
        });
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && token) fetchStats();
  }, [user, token]);

  const analysis = useMemo(() => {
    if (!stats || stats.totalLogs === 0) return null;
    const { avgRating, struggleCount, victoryCount } = stats;
    const ratingNum = parseFloat(avgRating);

    let persona = "The Blank Canvas";
    let motivation = "Start logging more details to find your drive.";
    let tip = "Consistency is key. Just log 5 minutes a day.";

    if (struggleCount > victoryCount && ratingNum > 3.5) {
      persona = "The Resilient Grinder";
      motivation = "You push through pain to get results. You are motivated by duty.";
      tip = "You get the job done, but you sound tired. Schedule mandatory 'do nothing' breaks.";
    } else if (victoryCount > struggleCount && ratingNum > 4) {
      persona = "The Flow Master";
      motivation = "You enjoy the process. Winning gives you a dopamine rush.";
      tip = "You are on a roll. Try increasing the difficulty of your tasks to stay in 'Flow'.";
    } else if (ratingNum < 2.5) {
      persona = "The Rough Patch";
      motivation = "Right now, you are struggling to find rhythm.";
      tip = "Lower the bar. Set a goal so small it's impossible to fail.";
    } else {
      persona = "The Balanced Builder";
      motivation = "You have a healthy mix of wins and challenges.";
      tip = "Try to document one specific lesson you learned each day.";
    }

    return { persona, motivation, tip };
  }, [stats]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-2xl mx-auto pb-10">
      
      {/* Header Card */}
      <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 md:p-8 shadow-soft dark:shadow-soft-dark mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          
          <div className="w-24 h-24 rounded-2xl bg-ink dark:bg-chalk text-paper-bg dark:text-night-bg flex items-center justify-center border-2 border-ink dark:border-chalk shadow-soft">
            <User size={40} strokeWidth={2.5} />
          </div>

          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-black text-ink dark:text-chalk">{user?.name || "User"}</h2>
            
            <div className="flex flex-col md:flex-row gap-4 text-ink/70 dark:text-chalk/70 font-bold text-sm items-center md:items-start">
              <span className="flex items-center gap-2">
                <Mail size={16} /> {user?.email}
              </span>
              <span className="flex items-center gap-2">
                {/* Displaying dynamic year */}
                <Calendar size={16} /> Member since {memberSince}
              </span>
            </div>
          </div>

           <div className="hidden md:block">
              <button onClick={onLogout} className="p-2 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors">
                <LogOut size={24} />
              </button>
           </div>
        </div>
      </div>

      {/* Stats Section */}
      {loading ? (
        <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-ink dark:text-chalk" size={40} />
        </div>
      ) : stats && analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            
            <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 shadow-soft dark:shadow-soft-dark flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl border-2 border-ink">
                    <TrendingUp size={32} />
                </div>
                <div>
                    <h4 className="text-sm font-bold opacity-60 uppercase tracking-widest">Avg. Score</h4>
                    <span className="text-4xl font-black">{stats.avgRating}<span className="text-lg opacity-50">/5</span></span>
                </div>
            </div>

            <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 shadow-soft dark:shadow-soft-dark flex items-center gap-4">
                <div className="p-3 bg-[var(--color-accent)] text-white rounded-2xl border-2 border-ink">
                    <CheckCircle size={32} />
                </div>
                <div>
                    <h4 className="text-sm font-bold opacity-60 uppercase tracking-widest">Total Logs</h4>
                    <span className="text-4xl font-black">{stats.totalLogs}</span>
                </div>
            </div>

            <div className="md:col-span-2 bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 md:p-8 shadow-soft dark:shadow-soft-dark mt-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain size={120} />
                </div>
                <h3 className="text-xl font-black flex items-center gap-2 mb-6">
                    <Sparkles size={20} className="text-[var(--color-accent)]" /> 
                    Journal Analysis
                </h3>
                <div className="space-y-6 relative z-10">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-60">Your Archetype</span>
                        <p className="text-3xl font-black text-[var(--color-accent)]">{analysis.persona}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border-2 border-ink/10">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><Brain size={16}/> What Drives You</h4>
                            <p className="text-sm font-medium opacity-80 leading-relaxed">{analysis.motivation}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border-2 border-ink/10">
                            <h4 className="font-bold flex items-center gap-2 mb-2"><Lightbulb size={16}/> Productivity Tip</h4>
                            <p className="text-sm font-medium opacity-80 leading-relaxed">{analysis.tip}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        <div className="p-8 text-center border-3 border-dashed border-ink/30 rounded-3xl mb-8">
            <p className="font-bold opacity-50">Log some days to see your statistics and personality analysis!</p>
        </div>
      )}

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

      <div className="mt-8 flex flex-col items-center gap-4">
          <button onClick={onBack} className="text-ink dark:text-chalk font-bold underline decoration-2 underline-offset-4 opacity-60 hover:opacity-100">
              Back to Calendar
          </button>
          <button onClick={onLogout} className="md:hidden text-rose-500 font-black text-sm uppercase tracking-widest hover:text-rose-600 transition-colors">
              Log Out
          </button>
      </div>
    </div>
  );
};

export default UserProfile;