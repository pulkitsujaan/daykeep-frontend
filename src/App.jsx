import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import LogModal from './components/LogModal';
import UserProfile from './components/UserProfile';
import AuthPage from './components/AuthPage';
import Toast from './components/Toast'; // <--- Import Toast
import ViewEntryModal from './components/ViewEntryModal'; // <--- Import new component
import { themes } from './data/themes';
import api from './api';  

const ACCOUNT_CREATION_DATE = new Date(2023, 0, 1); 

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // --- FIX 1: Default to Light Mode (false) ---
  const [currentTheme, setCurrentTheme] = useState(
    localStorage.getItem('appTheme') || 'vintage'
  );
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' // LocalStorage saves strings, so we convert to boolean
  );
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(localStorage.getItem('appView') || 'calendar');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [streak, setStreak] = useState(0);

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
      // Fetch both Logs AND Stats (where the streak is calculated)
      const [logsRes, statsRes] = await Promise.all([
        api.get(`/entries/${realUserId}`, {
          headers: { Authorization: token }
        }),
        api.get(`/entries/stats/${realUserId}`, {
          headers: { Authorization: token }
        })
      ]);

      setLogs(logsRes.data);
      setStreak(statsRes.data.streak); // Set the streak here
    } catch (err) {
      console.error("Fetch error:", err);
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
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser)); // Persist change
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Optional: Decide if you want to keep the view preference or reset it.
    // Usually, on logout, it's cleaner to reset to default.
    localStorage.removeItem('appView'); // <--- Clear the saved view
    
    setToken(null);
    setUser(null);
    setLogs([]);
    setView('calendar'); // Reset state locally
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

    await api.post('/entries', {
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
    
    // Check if data exists for this day
    const existingLog = logs.find(l => l.date === format(date, 'yyyy-MM-dd'));

    if (existingLog) {
      setIsEditing(false); // Open in VIEW mode
    } else {
      setIsEditing(true);  // Open in EDIT mode (New Entry)
    }
    
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

          {/* CONDITIONAL MODAL RENDERING */}
       {modalOpen && (
          isEditing ? (
            // SHOW EDIT MODAL
            <LogModal 
              onClose={() => setModalOpen(false)}
              date={selectedDate}
              onSave={handleSaveLog}
              existingData={currentModalData}
              token={token}
            />
          ) : (
            // SHOW VIEW MODAL
            <ViewEntryModal 
              onClose={() => setModalOpen(false)}
              date={selectedDate}
              data={currentModalData}
              onEdit={handleEditRequest} // Pass the switch function
              token={token}
            />
          )
       )}
        </div>
      )}
    </div>
  );
}

export default App;