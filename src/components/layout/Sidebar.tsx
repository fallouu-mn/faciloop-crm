import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Kanban, 
  CalendarClock, 
  Target, 
  Bell, 
  Building2, 
  UserPlus, 
  CreditCard, 
  Receipt, 
  FileSpreadsheet, 
  History, 
  Settings, 
  X,
  UserCheck,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, currentOrg } = useAuth();
  const role = user?.role || 'commercial';

  // Navigation Items per Role
  const commercialLinks = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/prospects', label: 'Mes Prospects', icon: Users },
    { to: '/app/pipeline', label: 'Pipeline Kanban', icon: Kanban },
    { to: '/app/relances', label: 'Relances', icon: CalendarClock },
    { to: '/app/objectifs', label: 'Mes Objectifs', icon: Target },
    { to: '/app/notifications', label: 'Notifications', icon: Bell }
  ];

  const adminOrgLinks = [
    { to: '/admin/dashboard', label: 'Dashboard Org', icon: LayoutDashboard },
    { to: '/admin/prospects', label: 'Tous les Prospects', icon: Users },
    { to: '/admin/clients', label: 'Clients Faciloop', icon: UserCheck },
    { to: '/admin/pipeline', label: 'Pipeline Kanban', icon: Kanban },
    { to: '/admin/equipe', label: 'Gestion Équipe', icon: UserPlus },
    { to: '/admin/objectifs', label: 'Objectifs Équipe', icon: Target },
    { to: '/admin/relances', label: 'Suivi Relances', icon: CalendarClock },
    { to: '/admin/abonnements', label: 'Abonnements', icon: CreditCard },
    { to: '/admin/paiements', label: 'Paiements', icon: Receipt },
    { to: '/admin/import-export', label: 'Import / Export', icon: FileSpreadsheet },
    { to: '/admin/journal', label: 'Journal RGPD & Audit', icon: History },
    { to: '/admin/parametres', label: 'Paramètres Entreprise', icon: Settings },
    { to: '/admin/notifications', label: 'Notifications Admin', icon: Bell }
  ];

  const superAdminLinks = [
    { to: '/super-admin/dashboard', label: 'Dashboard SaaS', icon: LayoutDashboard },
    { to: '/super-admin/organisations', label: 'Organisations (Tenants)', icon: Building2 },
    { to: '/super-admin/parametres', label: 'Paramètres Plateforme', icon: Settings }
  ];

  const links = role === 'super_admin' ? superAdminLinks : role === 'admin_org' ? adminOrgLinks : commercialLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* World-Class Mobile Drawer & Desktop Sidebar */}
      <aside
        className={`fixed bottom-0 top-0 sm:top-16 z-50 flex w-[280px] sm:w-64 flex-col border-r border-border/80 bg-card shadow-2xl transition-transform duration-300 md:static md:translate-x-0 font-sans ${
          isOpen ? 'left-0 translate-x-0' : '-left-[280px] -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header Close & Brand */}
        <div className="flex items-center justify-between border-b border-border/80 p-4 md:hidden bg-card">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-sm shadow-md">
              F
            </div>
            <span className="text-base font-extrabold text-gradient-faciloop">Faciloop Menu</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Workspace Card */}
        <div className="p-3 sm:p-4">
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 space-y-1 shadow-sm">
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3 text-primary" />
              <span>Espace de travail</span>
            </div>
            <div className="truncate font-extrabold text-xs sm:text-sm text-foreground">
              {currentOrg?.nom || "Digit'Advisor"}
            </div>
            <div className="text-[10px] font-bold text-primary flex items-center gap-1 pt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>{role === 'super_admin' ? 'Super Admin' : role === 'admin_org' ? 'Admin Entreprise' : 'Commercial'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Section Title */}
        <div className="px-4 pb-1">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {role === 'admin_org' ? 'Console Administration' : 'Menu Navigation'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6 text-xs font-sans scrollbar-hide">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3.5 py-3 sm:py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-faciloop text-white shadow-lg shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
