import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { format } from 'date-fns';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import LogModal from './components/LogModal';
import UserProfile from './components/UserProfile';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast'; // <--- Import Toast
import { themes } from './data/themes';

const ACCOUNT_CREATION_DATE = new Date(2023, 0, 1); 

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // --- FIX 1: Default to Light Mode (false) ---
  const [darkMode, setDarkMode] = useState(false); 
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('calendar'); 
  const [currentTheme, setCurrentTheme] = useState('vintage'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);

  // --- NEW: Toast State ---
  const [toast, setToast] = useState(null); // { message: string, type: 'success' | 'error' }

  // Show a notification helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (token && user) {
      fetchLogs();
    }
  }, [token, user]);

  const fetchLogs = async () => {
    // 1. Safety Check: Ensure we have a user object
    if (!user) return;

    // 2. Robust ID: Check both 'id' and '_id'
    const realUserId = user.id || user._id;

    if (!realUserId) {
      console.error("Cannot fetch logs: Missing User ID");
      return;
    }

    try {
      // 3. Use the robust ID in the URL
      const res = await axios.get(`http://localhost:5000/api/entries/${realUserId}`, {
        headers: { Authorization: token }
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    // --- FIX 2: Show Success Toast ---
    showToast(`Welcome back, ${newUser.name || 'Friend'}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLogs([]);
    setView('calendar');
    // --- FIX 2: Show Logout Toast ---
    showToast('Logged out successfully.');
  };
// Inside src/App.jsx

// Find the handleSaveLog function and update it:
const handleSaveLog = async (newLog) => {
  setLogs(prevLogs => {
    const existing = prevLogs.filter(l => l.date !== newLog.date);
    return [...existing, newLog];
  });

  try {
    // FIX: MongoDB uses '_id', but some parts of your app might use 'id'.
    // We check for both to be safe.
    const realUserId = user.id || user._id; 

    if (!realUserId) {
      console.error("User ID missing from state!");
      showToast("Error: User ID not found. Please relogin.", "error");
      return;
    }

    await axios.post('http://localhost:5000/api/entries', {
      userId: realUserId, // <--- Use the robust variable
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

  useEffect(() => {
    const themeColors = themes[currentTheme].colors;
    for (const [key, value] of Object.entries(themeColors)) {
      document.body.style.setProperty(key, value);
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
    setModalOpen(true);
  };

  const currentModalData = logs.find(l => 
    selectedDate && l.date === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans ${darkMode ? 'bg-night-bg text-chalk' : 'bg-paper-bg text-ink'}`}>
      
      {/* Toast Notification Container */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Auth View */}
      {!token ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        /* Main App View */
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Header 
            currentDate={currentDate} 
            setCurrentDate={setCurrentDate}
            accountCreationDate={ACCOUNT_CREATION_DATE}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onProfileClick={() => setView('profile')} 
            isProfileActive={view === 'profile'}
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
            />
          )}

          {modalOpen && (
            <LogModal 
              onClose={() => setModalOpen(false)}
              date={selectedDate}
              onSave={handleSaveLog}
              existingData={currentModalData}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;