import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Sun, 
  Moon, 
  Bell, 
  LogOut, 
  Menu, 
  ShieldAlert, 
  Building2, 
  UserCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, currentOrg, currency, setCurrency, isDarkMode, toggleDarkMode, logout, notifications } = useAuth();
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.lue).length;

  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur transition-colors md:px-6">
        {/* Left section: Hamburger button & Logo/Org */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link to="/" className="flex items-center gap-2 font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-faciloop text-white shadow-md">
              <span className="text-xl font-extrabold tracking-wider">F</span>
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="text-lg font-bold tracking-tight text-gradient-faciloop">Faciloop CRM</span>
              <span className="text-[10px] font-medium text-muted-foreground">SaaS B2B Multi-Entreprises</span>
            </div>
          </Link>

          {currentOrg && (
            <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-foreground lg:flex">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>{currentOrg.nom}</span>
            </div>
          )}
        </div>

        {/* Right section: Currency, Theme toggle, Notifications & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher Pill */}
          <div className="flex rounded-lg bg-muted p-0.5 text-xs font-semibold">
            {['XOF', 'EUR', 'USD'].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-md px-2.5 py-1 transition-all ${
                  currency === c
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>

          {/* Notifications Icon with Badge */}
          {user && (
            <Link
              to={user.role === 'admin_org' ? '/admin/notifications' : '/app/notifications'}
              className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* User Info & Logout */}
          {user ? (
            <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-3">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-xs font-bold leading-tight text-foreground">
                  {user.prenom} {user.nom}
                </span>
                <span className="text-[10px] capitalize text-muted-foreground">
                  {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin_org' ? 'Admin Org' : 'Commercial'}
                </span>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {user.prenom?.[0] || 'U'}
              </div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                title="Se déconnecter"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-gradient-faciloop px-4 py-2 text-xs font-bold text-white shadow hover:opacity-90"
            >
              Connexion
            </Link>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-2.5 rounded-2xl bg-red-500/10">
                <LogOut className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-base text-foreground">Déconnexion</h3>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Voulez-vous vraiment vous déconnecter de votre espace Faciloop CRM ?
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="w-1/2 py-2.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
