import React, { useState, useEffect } from 'react';
import { format } from 'date-fns'; // <--- Import this
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import LogModal from './components/LogModal';
import UserProfile from './components/UserProfile';
import { themes } from './data/themes';
import axios from 'axios';

const ACCOUNT_CREATION_DATE = new Date(2023, 0, 1); 

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [view, setView] = useState('calendar'); 
  const [currentTheme, setCurrentTheme] = useState('vintage'); 
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [logs, setLogs] = useState([]);
  const USER_ID = "test-user-123"; // Hardcode for now until you add Login

  // Fetch logs on load
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/entries/${USER_ID}`);
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchLogs();
  }, []);

  // Save log to backend
  const handleSaveLog = async (newLog) => {
    try {
      // Optimistic UI Update (Update screen instantly before server replies)
      setLogs(prevLogs => {
        const existing = prevLogs.filter(l => l.date !== newLog.date);
        return [...existing, newLog];
      });

      // Send to Server
      await axios.post('http://localhost:5000/api/entries', {
        userId: USER_ID,
        ...newLog
      });
      
    } catch (err) {
      console.error("Failed to save log", err);
      // Optional: Revert state if server fails
    }
  };

  // Theme Logic
  useEffect(() => {
    const themeColors = themes[currentTheme].colors;
    for (const [key, value] of Object.entries(themeColors)) {
      document.body.style.setProperty(key, value);
    }
  }, [currentTheme]);

  // Dark Mode Logic
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
  // FIX: Use format() here too to find data for the modal
  const currentModalData = logs.find(l => 
    selectedDate && l.date === format(selectedDate, 'yyyy-MM-dd')
  );

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