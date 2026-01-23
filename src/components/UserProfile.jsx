import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  Mail,
  Calendar,
  CheckCircle,
  TrendingUp,
  Brain,
  Lightbulb,
  Sparkles,
  Loader2,
  LogOut,
  Flame,
  Camera,
  Lock,
} from "lucide-react";
import { themes } from "../data/themes";
import YearlyPixels from "./YearlyPixels";
import ProfilePictureModal from "./ProfilePictureModal";
import api, { getImageUrl } from "../api";
import ChangePasswordModal from "./ChangePasswordModal";

const UserProfile = ({
  currentTheme,
  setTheme,
  onBack,
  onLogout,
  user,
  token,
  logs,
  onUpdateUser,
}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPfpModalOpen, setIsPfpModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Calculate dynamic join year from user data
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  // 1. Fetch real statistics and streaks from the Backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const realUserId = user.id || user._id;
        const res = await api.get(`/entries/stats/${realUserId}`, {
          headers: { Authorization: token },
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

  // 2. Personality Analysis Logic (The Archetype Engine)
  const analysis = useMemo(() => {
    if (!stats || stats.totalLogs === 0) return null;

    const { avgRating, struggleCount, victoryCount } = stats;
    const ratingNum = parseFloat(avgRating);

    let persona = "The Blank Canvas";
    let motivation = "Start logging more details to find your drive.";
    let tip = "Consistency is key. Just log 5 minutes a day.";

    if (struggleCount > victoryCount && ratingNum > 3.5) {
      persona = "The Resilient Grinder";
      motivation =
        "You push through pain to get results. You are motivated by duty.";
      tip =
        "You get the job done, but you sound tired. Schedule mandatory 'do nothing' breaks.";
    } else if (victoryCount > struggleCount && ratingNum > 4) {
      persona = "The Flow Master";
      motivation = "You enjoy the process. Winning gives you a dopamine rush.";
      tip =
        "You are on a roll. Try increasing the difficulty of your tasks to stay in 'Flow'.";
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 w-full max-w-3xl mx-auto pb-10">
      {/* --- HEADER CARD --- */}
      <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 md:p-8 shadow-soft dark:shadow-soft-dark mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          {/* --- UPDATED AVATAR BOX --- */}
          <div
            className="relative group cursor-pointer"
            onClick={() => setIsPfpModalOpen(true)}
          >
            <div className="w-24 h-24 rounded-2xl bg-ink dark:bg-chalk text-paper-bg dark:text-night-bg flex items-center justify-center border-2 border-ink dark:border-chalk shadow-soft overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={getImageUrl(user.profilePicture)}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={40} strokeWidth={2.5} />
              )}
            </div>

            {/* Hover Edit Overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <h2 className="text-3xl font-black text-ink dark:text-chalk">
              {user?.name || "Explorer"}
            </h2>

            <div className="flex flex-col md:flex-row gap-4 text-ink/70 dark:text-chalk/70 font-bold text-sm items-center md:items-start">
              <span className="flex items-center gap-2">
                <Mail size={16} /> {user?.email}
              </span>
              <span className="flex items-center gap-2">
                <Calendar size={16} /> Member since {memberSince}
              </span>
            </div>
          </div>

          {/* Logout Button (Desktop) */}
          <div className="hidden md:block">
            <button
              onClick={onLogout}
              className="p-3 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-2xl transition-all active:scale-90"
              title="Logout"
            >
              <LogOut size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      {/* --- ADD MODAL HERE --- */}
      <ProfilePictureModal
        isOpen={isPfpModalOpen}
        onClose={() => setIsPfpModalOpen(false)}
        user={user}
        token={token}
        onUpdateUser={onUpdateUser}
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2
            className="animate-spin text-ink dark:text-chalk"
            size={48}
          />
          <p className="font-bold opacity-50 uppercase tracking-widest text-xs">
            Analyzing your journey...
          </p>
        </div>
      ) : stats ? (
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Streak Card */}
            <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 shadow-soft flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl border-2 border-ink">
                <Flame size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-xs font-bold opacity-60 uppercase tracking-widest">
                  Streak
                </h4>
                <span className="text-3xl font-black">
                  {stats.streak}{" "}
                  <span className="text-sm opacity-50 font-bold">days</span>
                </span>
              </div>
            </div>

            {/* Avg Score Card */}
            <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 shadow-soft flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl border-2 border-ink">
                <TrendingUp size={32} />
              </div>
              <div>
                <h4 className="text-xs font-bold opacity-60 uppercase tracking-widest">
                  Avg. Score
                </h4>
                <span className="text-3xl font-black">
                  {stats.avgRating}
                  <span className="text-sm opacity-50">/5</span>
                </span>
              </div>
            </div>
            {/* Total Logs Card */}
            <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 shadow-soft flex items-center gap-4">
              <div className="p-3 bg-[var(--color-accent)] text-white rounded-2xl border-2 border-ink">
                <CheckCircle size={32} />
              </div>
              <div>
                <h4 className="text-xs font-bold opacity-60 uppercase tracking-widest">
                  Total Logs
                </h4>
                <span className="text-3xl font-black">{stats.totalLogs}</span>
              </div>
            </div>
          </div>
          <div className="mb-8 animate-in slide-in-from-bottom-8 duration-500 delay-100">
            {/* It holds the graph we just made */}
            <YearlyPixels logs={logs || []} />
          </div>
          {/* AI Archetype Analysis */}
          {analysis && (
            <div className="bg-paper-card dark:bg-night-card border-3 border-ink dark:border-chalk rounded-3xl p-6 md:p-8 shadow-soft dark:shadow-soft-dark relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Brain size={150} />
              </div>

              <h3 className="text-xl font-black flex items-center gap-2 mb-6">
                <Sparkles size={20} className="text-[var(--color-accent)]" />
                Personality Archetype
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">
                    You are the
                  </span>
                  <p className="text-4xl font-black text-[var(--color-accent)] leading-tight">
                    {analysis.persona}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border-2 border-ink/5">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider opacity-70">
                      <Brain size={16} /> Motivation
                    </h4>
                    <p className="text-sm font-bold leading-relaxed">
                      {analysis.motivation}
                    </p>
                  </div>
                  <div className="bg-white/40 dark:bg-black/20 p-5 rounded-2xl border-2 border-ink/5">
                    <h4 className="font-bold flex items-center gap-2 mb-2 text-sm uppercase tracking-wider opacity-70">
                      <Lightbulb size={16} /> Growth Tip
                    </h4>
                    <p className="text-sm font-bold leading-relaxed">
                      {analysis.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center border-3 border-dashed border-ink/20 rounded-3xl mb-8 bg-black/5">
          <p className="font-bold opacity-40">
            Start logging your days to unlock deep insights and streaks!
          </p>
        </div>
      )}

      {/* --- NEW SECURITY SECTION --- */}
      <div className="flex-1 space-y-2 pb-4">
       <div className="mt-8 pt-8 border-t-2 border-ink/5 dark:border-chalk/5">
          <h4 className="font-bold text-sm uppercase tracking-widest opacity-40 mb-4">Account Settings</h4>
          
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full bg-paper-card dark:bg-night-card border-2 border-ink/10 dark:border-chalk/10 hover:border-ink/30 p-4 rounded-2xl flex items-center justify-between group transition-all"
          >
             <div className="flex items-center gap-3">
                <div className="p-2 bg-ink/5 dark:bg-chalk/5 rounded-full">
                    <Lock size={18} className="opacity-60"/>
                </div>
                <span className="font-bold">Change Password</span>
             </div>
             <div className="text-xs font-bold px-3 py-1 bg-ink/5 rounded-lg group-hover:bg-ink group-hover:text-white transition-colors">
                Edit
             </div>
          </button>
       </div>

       {/* --- RENDER MODAL --- */}
       <ChangePasswordModal 
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          userId={user._id || user.id}
          token={token}
       /> 
       </div>

      {/* --- THEME SELECTOR --- */}
      <div className="space-y-4">
        <h3 className="text-2xl font-black text-ink dark:text-chalk px-2">
          Visual Style
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(themes).map(([key, theme]) => {
            const isActive = currentTheme === key;
            return (
              <button
                key={key}
                onClick={() => setTheme(key)}
                className={`
                  relative p-5 rounded-2xl border-3 text-left transition-all duration-300 group
                  ${
                    isActive
                      ? "border-ink dark:border-chalk bg-white dark:bg-night-card shadow-soft ring-2 ring-[var(--color-accent)]/20"
                      : "border-ink/10 dark:border-chalk/10 hover:border-ink/30 dark:hover:border-chalk/30"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{
                        backgroundColor: theme.colors["--color-paper-bg"],
                      }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors["--color-ink"] }}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{
                        backgroundColor: theme.colors["--color-accent"],
                      }}
                    />
                  </div>
                  <span
                    className={`font-black text-lg ${isActive ? "text-ink dark:text-chalk" : "opacity-40 group-hover:opacity-100"}`}
                  >
                    {theme.name}
                  </span>
                  {isActive && (
                    <div className="ml-auto bg-[var(--color-accent)] text-white p-1 rounded-lg">
                      <CheckCircle size={16} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="mt-12 flex flex-col items-center gap-6">
        <button
          onClick={onBack}
          className="text-ink dark:text-chalk font-black underline decoration-4 underline-offset-8 decoration-[var(--color-accent)]/30 hover:decoration-[var(--color-accent)] transition-all"
        >
          Return to Journal
        </button>

        <button
          onClick={onLogout}
          className="md:hidden flex items-center gap-2 text-rose-500 font-black text-sm uppercase tracking-widest pt-4"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
