import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { GlobalFab } from './GlobalFab';
import { LanguageToggle } from '../common/LanguageToggle';
import { motion } from 'framer-motion';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sun, Moon } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, isDarkMode, toggleDarkMode } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  // Security Protection: Unauthenticated users are immediately redirected to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      <Navbar onOpenMobileMenu={() => setIsSidebarOpen(prev => !prev)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto max-w-7xl"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Floating Vertical Light/Dark Mode Switcher Pill (Matching Screenshot Right Edge) */}
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center p-1 rounded-full bg-card/90 border border-border/80 shadow-2xl backdrop-blur-xl gap-1">
        <button
          onClick={() => isDarkMode && toggleDarkMode()}
          className={`p-2 rounded-full transition-all ${
            !isDarkMode ? 'bg-amber-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Mode Clair"
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          onClick={() => !isDarkMode && toggleDarkMode()}
          className={`p-2 rounded-full transition-all ${
            isDarkMode ? 'bg-gradient-faciloop text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
          }`}
          title="Mode Sombre"
        >
          <Moon className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Language Switcher Pill (Matching Screenshot Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
        <LanguageToggle />
      </div>

      {/* Floating Action Button (Global 5-second Express Entry) */}
      <GlobalFab />
    </div>
  );
};
