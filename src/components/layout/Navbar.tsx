import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Sun, Moon, Bell, Menu, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaciloopBrand } from '../common/FaciloopBrand';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { user, logout, currency, setCurrency } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login', { replace: true });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/85 px-3.5 sm:px-6 backdrop-blur-xl transition-all font-sans">
        {/* Left: Mobile Menu Toggle & Compact Icon Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden active:scale-95 transition-all"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Compact Icon Logo "F" to keep top header clean & un-cluttered */}
          <Link to="/app/dashboard" className="flex items-center gap-2 group">
            <FaciloopBrand variant="icon" className="h-8 w-8 sm:h-9 sm:w-9 group-hover:scale-105 transition-transform" />
          </Link>

          {/* Role restriction badge */}
          {user?.role === 'commercial' && (
            <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold border border-emerald-500/20">
              <Shield className="w-3 h-3" /> Vue restreinte à votre portefeuille personnel
            </span>
          )}
        </div>

        {/* Right: Currency Toggle, Dark Mode & Compact Profile Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Currency Switcher */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border/60">
            <button
              onClick={() => setCurrency('XOF')}
              className={`rounded-lg px-2 py-1 text-[10px] sm:text-xs font-black transition-all ${
                currency === 'XOF' ? 'bg-gradient-faciloop text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              XOF
            </button>
            <button
              onClick={() => setCurrency('EUR')}
              className={`rounded-lg px-2 py-1 text-[10px] sm:text-xs font-black transition-all ${
                currency === 'EUR' ? 'bg-gradient-faciloop text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              EUR
            </button>
          </div>

          {/* Dark Mode Switcher */}
          <button
            onClick={toggleDarkMode}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0 active:scale-95"
            aria-label="Basculer le mode sombre"
          >
            {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>

          {/* Notifications Trigger */}
          <Link
            to={user?.role === 'admin_org' ? '/admin/notifications' : '/app/notifications'}
            className="relative rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all shrink-0 active:scale-95"
          >
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          </Link>

          {/* User Profile Badge & Logout Trigger */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-border/80">
              <div className="hidden md:flex flex-col text-right leading-tight">
                <span className="text-xs font-extrabold text-foreground">{user.prenom} {user.nom}</span>
                <span className="text-[10px] font-bold capitalize text-primary">
                  {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin_org' ? 'Admin Org' : 'Commercial'}
                </span>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-faciloop text-white font-black text-xs shadow-md shrink-0">
                {user.prenom?.[0] || 'U'}
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="rounded-xl p-2 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-gradient-faciloop px-3.5 py-2 text-xs font-extrabold text-white shadow-md hover:opacity-90"
            >
              Connexion
            </Link>
          )}
        </div>
      </header>

      {/* Logout Confirmation Bottom Sheet Modal on Mobile, Centered on PC */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans text-center relative"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center justify-center gap-2 text-rose-500 font-extrabold text-base">
                <div className="p-2.5 rounded-2xl bg-rose-500/10">
                  <LogOut className="w-6 h-6 text-rose-500" />
                </div>
                <span>Déconnexion</span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground font-semibold leading-relaxed">
                Voulez-vous vraiment vous déconnecter de votre espace Faciloop CRM ?
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="w-full sm:w-1/2 py-3 rounded-2xl border border-input text-xs font-bold text-foreground hover:bg-muted transition-all active:scale-95"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmLogout}
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-rose-500 text-white text-xs font-extrabold hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all active:scale-95"
                >
                  Se déconnecter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
