import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { GlobalFab } from './GlobalFab';
import { motion, AnimatePresence } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1] // Custom Linear / Stripe cubic-bezier easing
              }}
              className="mx-auto max-w-7xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Action Button (Global 5-second Express Entry) */}
      <GlobalFab />
    </div>
  );
};
