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
import { FaciloopBrand } from '../common/FaciloopBrand';

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
    { to: '/admin/relances', label: 'Relances Équipe', icon: CalendarClock },
    { to: '/admin/abonnements', label: 'Abonnements SaaS', icon: CreditCard },
    { to: '/admin/paiements', label: 'Comptabilité & Reçus', icon: Receipt },
    { to: '/admin/import-export', label: 'Import / Export CSV', icon: FileSpreadsheet },
    { to: '/admin/journal', label: 'Journal des Actions', icon: History },
    { to: '/admin/parametres', label: 'Paramètres Entreprise', icon: Settings },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell }
  ];

  const superAdminLinks = [
    { to: '/super-admin/dashboard', label: 'Console Super-Admin', icon: LayoutDashboard },
    { to: '/super-admin/organisations', label: 'Toutes les Entreprises', icon: Building2 },
    { to: '/super-admin/parametres', label: 'Configuration Plateforme', icon: Settings }
  ];

  const currentLinks = 
    role === 'super_admin' ? superAdminLinks : 
    role === 'admin_org' ? adminOrgLinks : commercialLinks;

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
            <FaciloopBrand className="h-7" />
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
              <Building2 className="w-3 h-3 text-primary" /> Espace de travail
            </div>
            <div className="text-xs font-black text-foreground truncate">
              {currentOrg?.nom || 'Teranga Logistique SA'}
            </div>
            <div className="text-[10px] font-bold text-primary capitalize flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {role === 'super_admin' ? 'Super Admin' : role === 'admin_org' ? 'Console Direction' : 'Commercial'}
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-2 space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-2">
            Menu Navigation
          </div>

          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 sm:py-3 rounded-2xl text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-gradient-faciloop text-white shadow-md shadow-primary/25'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Tenant Info */}
        <div className="p-4 border-t border-border/80 bg-muted/20 text-center text-[10px] font-bold text-muted-foreground">
          <span>Faciloop CRM v2.0 • SaaS Multi-Tenant</span>
        </div>
      </aside>
    </>
  );
};
