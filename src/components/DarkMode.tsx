import React, { useState, useEffect } from 'react';

interface DarkModeProps {
  children: React.ReactNode;
}

const DarkMode: React.FC<DarkModeProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOledMode, setIsOledMode] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    
    // Listen for system preference changes
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    // Check for saved preference in localStorage
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference) {
      setIsDarkMode(savedPreference === 'dark');
    }
    
    // Check for OLED mode preference
    const oledPreference = localStorage.getItem('oledMode');
    if (oledPreference) {
      setIsOledMode(oledPreference === 'true');
    }
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
      if (isOledMode) {
        document.documentElement.classList.add('oled-mode');
      } else {
        document.documentElement.classList.remove('oled-mode');
      }
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.documentElement.classList.remove('oled-mode');
    }
    
    // Save preference
    localStorage.setItem('darkMode', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('oledMode', isOledMode.toString());
  }, [isDarkMode, isOledMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleOledMode = () => {
    setIsOledMode(!isOledMode);
  };

  return (
    <>
      {children}
      <div className="dark-mode-toggle">
        <button 
          onClick={toggleDarkMode}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          className={isDarkMode ? "dark" : "light"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        {isDarkMode && (
          <button 
            onClick={toggleOledMode}
            aria-label={isOledMode ? "Switch to normal dark mode" : "Switch to OLED dark mode"}
            className={`oled-toggle ${isOledMode ? "active" : ""}`}
          >
            OLED
          </button>
        )}
      </div>
      
      <style>{`
        .dark-mode-toggle {
          position: fixed;
          bottom: 80px;
          left: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .dark-mode-toggle button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: var(--background-color, #ffffff);
          color: var(--text-primary, #1f2937);
          font-size: 1.2rem;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        
        .dark-mode-toggle button:hover {
          transform: scale(1.1);
        }
        
        .oled-toggle {
          font-size: 0.7rem;
          height: 30px;
        }
        
        .oled-toggle.active {
          background: #000000;
          color: #ffffff;
        }
        
        /* Dark mode styles */
        .dark-mode {
          --background-color: #1f2937;
          --grid-color: #374151;
          --text-primary: #f9fafb;
          --text-secondary: #d1d5db;
          --accent-color: #60a5fa;
        }
        
        .dark-mode .mobile-app,
        .dark-mode .app-header,
        .dark-mode .sync-status,
        .dark-mode .section-tabs,
        .dark-mode .tab,
        .dark-mode .event-item,
        .dark-mode .task-item,
        .dark-mode .sticker-item {
          background-color: #1f2937;
          color: #f9fafb;
        }
        
        .dark-mode .status-indicator.online {
          background: #166534;
          color: #dcfce7;
        }
        
        .dark-mode .status-indicator.offline {
          background: #7f1d1d;
          color: #fecaca;
        }
        
        .dark-mode .mobile-bottom-nav {
          background: #111827;
        }
        
        .dark-mode .nav-item {
          color: #9ca3af;
        }
        
        .dark-mode .nav-item.active {
          color: #60a5fa;
        }
        
        /* OLED mode styles */
        .oled-mode {
          --background-color: #000000;
          --grid-color: #111111;
          --text-primary: #ffffff;
          --text-secondary: #e5e5e5;
        }
        
        .oled-mode .mobile-app,
        .oled-mode .app-header,
        .oled-mode .sync-status,
        .oled-mode .section-tabs,
        .oled-mode .tab,
        .oled-mode .event-item,
        .oled-mode .task-item,
        .oled-mode .sticker-item {
          background-color: #000000;
          color: #ffffff;
        }
        
        @media (max-width: 768px) {
          .dark-mode-toggle {
            bottom: 100px;
          }
        }
      `}</style>
    </>
  );
};

export default DarkMode;