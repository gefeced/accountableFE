import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('accountable-theme') || 'playful';
  });

  useEffect(() => {
    document.body.className = `theme-${theme}`;
    localStorage.setItem('accountable-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'playful' ? 'clean' : 'playful');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};