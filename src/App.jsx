import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { format } from 'date-fns';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import LogModal from './components/LogModal';
import UserProfile from './components/UserProfile';
import AuthPage from './components/AuthPage'; // <--- Import AuthPage
import { themes } from './data/themes';

const ACCOUNT_CREATION_DATE = new Date(2023, 0, 1); 

function App() {
  // --- AUTH STATE ---
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  // --- APP STATE ---
  const [darkMode, setDarkMode] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('calendar'); 
  const [currentTheme, setCurrentTheme] = useState('vintage'); 
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);

  // 1. Initial Data Fetch (Only if logged in)
  useEffect(() => {
    if (token && user) {
      fetchLogs();
    }
  }, [token, user]);

  const fetchLogs = async () => {
    try {
      // Pass the token in the header
      const res = await axios.get(`http://localhost:5000/api/entries/${user.id}`, {
        headers: { Authorization: token }
      });
      setLogs(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      // If 401 Unauthorized, log the user out
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  // 2. Handle Login Success
  const handleLoginSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // 3. Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setLogs([]); // Clear sensitive data
    setView('calendar'); // Reset view
  };

  // 4. Handle Saving Logs (With Auth)
  const handleSaveLog = async (newLog) => {
    // Optimistic Update
    setLogs(prevLogs => {
      const existing = prevLogs.filter(l => l.date !== newLog.date);
      return [...existing, newLog];
    });

    try {
      await axios.post('http://localhost:5000/api/entries', {
        userId: user.id, // Ensure backend uses this or extracts from token
        ...newLog
      }, {
        headers: { Authorization: token }
      });
    } catch (err) {
      console.error("Save error:", err);
      // Optional: Revert optimistic update here on fail
    }
  };

  // Theme & Dark Mode Effects (Same as before)
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

  // --- CONDITIONAL RENDERING ---
  
  // If not logged in, show Auth Page
  if (!token) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in, show Main App
  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans ${darkMode ? 'bg-night-bg text-chalk' : 'bg-paper-bg text-ink'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        
        <Header 
          currentDate={currentDate} 
          setCurrentDate={setCurrentDate}
          accountCreationDate={ACCOUNT_CREATION_DATE}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onProfileClick={() => setView('profile')} 
          isProfileActive={view === 'profile'}
          // Add a logout button inside header or profile later if you want
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
            
            // --- NEW PROPS ADDED HERE ---
            user={user}         // Pass the logged-in user object
            token={token}       // Pass the auth token
            onLogout={handleLogout}
            // ----------------------------
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
    </div>
  );
}

export default App;