import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { GlobalFab } from './GlobalFab';
import { DemoBanner } from './DemoBanner';
import { LanguageToggle } from '../common/LanguageToggle';
import { motion } from 'framer-motion';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isDemoMode = location.pathname.startsWith('/demo');

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    setIsSidebarCollapsed(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsSidebarCollapsed(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Route guards — redirect to correct space based on role
  const roleDefaults: Record<string, string> = {
    super_admin: '/super-admin/dashboard',
    admin_org: '/admin/dashboard',
    commercial: '/app/dashboard',
  };
  const pathRoles = [
    { prefix: '/super-admin', role: 'super_admin' },
    { prefix: '/admin', role: 'admin_org' },
    { prefix: '/app', role: 'commercial' },
  ];
  const requiredRole = pathRoles.find(r => location.pathname.startsWith(r.prefix))?.role;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={roleDefaults[user.role] || '/login'} replace />;
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {isDemoMode && <DemoBanner />}
      <Navbar onOpenMobileMenu={() => setIsSidebarOpen(prev => !prev)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        />
        
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

      {/* Floating Language Switcher Pill (Matching Screenshot Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
        <LanguageToggle />
      </div>

      {/* Floating Action Button (Global 5-second Express Entry) */}
      <GlobalFab />
    </div>
  );
};
