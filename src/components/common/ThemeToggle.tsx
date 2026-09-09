import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isDarkMode, toggleDarkMode } = useAuth();

  return (
    <div className={`flex items-center p-1 rounded-full bg-muted border border-border gap-0.5 ${className}`}>
      <button
        onClick={() => isDarkMode && toggleDarkMode()}
        className={`p-1.5 rounded-full transition-all ${
          !isDarkMode ? 'bg-amber-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => !isDarkMode && toggleDarkMode()}
        className={`p-1.5 rounded-full transition-all ${
          isDarkMode ? 'bg-gradient-faciloop text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
