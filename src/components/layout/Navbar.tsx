import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaciloopBrand } from '../common/FaciloopBrand';

import { useTranslation } from 'react-i18next';

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const isEn = i18n.language?.startsWith('en');

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/login', { replace: true });
  };

  const getRoleTitle = () => {
    if (user?.role === 'super_admin') return isEn ? 'Faciloop Admin' : 'Administration Faciloop';
    if (user?.role === 'admin_org') return isEn ? 'Faciloop Management' : 'Direction Faciloop';
    return isEn ? 'Faciloop Sales' : 'Commercial Faciloop';
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-card/85 px-3.5 sm:px-6 backdrop-blur-xl transition-all font-sans">
        {/* Left: Mobile Menu Trigger + Clean Icon Brand + Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenMobileMenu}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden active:scale-95 transition-all"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Clean Icon Logo "F" + Role Title matching screenshot model */}
          <Link to="/app/dashboard" className="flex items-center gap-2 group shrink-0">
            <FaciloopBrand variant="icon" className="h-8 w-8 sm:h-9 sm:w-9 group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-sm sm:text-base text-foreground tracking-tight">
              {getRoleTitle()}
            </span>
          </Link>
        </div>

        {/* Right: Only Clean Logout Button matching screenshot model */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="rounded-xl p-2.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-95 flex items-center justify-center"
            title="Se déconnecter"
          >
            <LogOut className="h-5 w-5" />
          </button>
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
