import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Routes, Route, Navigate } from 'react-router-dom'; // <--- NEW IMPORTS

import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import LogModal from './components/LogModal';
import UserProfile from './components/UserProfile';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast';
import ViewEntryModal from './components/ViewEntryModal';
import VerifyEmail from './components/VerifyEmail'; // <--- Import the new page

import { themes } from './data/themes';
import api from './api';  

const ACCOUNT_CREATION_DATE = new Date(2023, 0, 1); 

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('appTheme') || 'vintage');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(localStorage.getItem('appView') || 'calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (token && user) {
      fetchLogs();
    }
  }, [token, user]);

  useEffect(() => {
    localStorage.setItem('appView', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('appTheme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchLogs = async () => {
    if (!user) return;
    const realUserId = user.id || user._id;

    try {
      const [logsRes, statsRes] = await Promise.all([
        api.get(`/entries/${realUserId}`, { headers: { Authorization: token } }),
        api.get(`/entries/stats/${realUserId}`, { headers: { Authorization: token } })
      ]);
      setLogs(logsRes.data);
      setStreak(statsRes.data.streak);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    showToast(`Welcome back, ${newUser.name || 'Friend'}!`);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('appView');
    setToken(null);
    setUser(null);
    setLogs([]);
    setView('calendar');
    showToast('Logged out successfully.');
  };

  const handleSaveLog = async (newLog) => {
    setLogs(prevLogs => {
      const existing = prevLogs.filter(l => l.date !== newLog.date);
      return [...existing, newLog];
    });

    try {
      const realUserId = user.id || user._id; 
      if (!realUserId) {
        showToast("Error: User ID not found. Please relogin.", "error");
        return;
      }

      await api.post('/entries', {
        userId: realUserId,
        ...newLog
      }, {
        headers: { Authorization: token }
      });
      showToast("Journal entry saved!");
    } catch (err) {
      console.error("Save error:", err);
      showToast("Failed to save entry", "error");
    }
  };

  const handleEditRequest = () => {
    setIsEditing(true);
  };

  useEffect(() => {
    if (themes[currentTheme]) {
      const themeColors = themes[currentTheme].colors;
      for (const [key, value] of Object.entries(themeColors)) {
        document.body.style.setProperty(key, value);
      }
    }
  }, [currentTheme]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDayClick = (date) => {
    setSelectedDate(date);
    const existingLog = logs.find(l => l.date === format(date, 'yyyy-MM-dd'));
    if (existingLog) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    setModalOpen(true);
  };

  const currentModalData = logs.find(l => 
    selectedDate && l.date === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans ${darkMode ? 'bg-night-bg text-chalk' : 'bg-paper-bg text-ink'}`}>
      
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* --- NEW ROUTING LOGIC --- */}
      <Routes>
        
        {/* 1. If URL is /verify/123, show Verify Page */}
        <Route path="/verify/:token" element={<VerifyEmail />} />

        {/* 2. For ANY other URL (*), show your normal App logic */}
        <Route path="*" element={
          !token ? (
            <AuthPage onLoginSuccess={handleLoginSuccess} />
          ) : (
            <div className="max-w-4xl mx-auto p-4 md:p-8">
              <Header 
                currentDate={currentDate} 
                setCurrentDate={setCurrentDate}
                accountCreationDate={ACCOUNT_CREATION_DATE}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onProfileClick={() => setView('profile')} 
                isProfileActive={view === 'profile'}
                onHomeClick={() => setView('calendar')}
                streak={streak}
              />

              {view === 'calendar' ? (
                <CalendarGrid 
                  currentDate={currentDate} 
                  accountCreationDate={ACCOUNT_CREATION_DATE}
                  onDayClick={handleDayClick}
                  logs={logs}
                />
              ) : (
                <UserProfile 
                  currentTheme={currentTheme} 
                  setTheme={setCurrentTheme} 
                  onBack={() => setView('calendar')}
                  user={user}
                  token={token}
                  onLogout={handleLogout}
                  logs={logs}
                  onUpdateUser={handleUserUpdate}
                />
              )}

              {modalOpen && (
                isEditing ? (
                  <LogModal 
                    onClose={() => setModalOpen(false)}
                    date={selectedDate}
                    onSave={handleSaveLog}
                    existingData={currentModalData}
                    token={token}
                  />
                ) : (
                  <ViewEntryModal 
                    onClose={() => setModalOpen(false)}
                    date={selectedDate}
                    data={currentModalData}
                    onEdit={handleEditRequest}
                    token={token}
                  />
                )
              )}
            </div>
          )
        } />
      </Routes>
    </div>
  );
}

export default App;