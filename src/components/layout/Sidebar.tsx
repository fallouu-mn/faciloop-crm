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
  UserCheck
} from 'lucide-react';

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
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed bottom-0 top-16 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'left-0 translate-x-0' : '-left-64 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between border-b border-border p-4 md:hidden">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Menu Navigation</span>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Org Banner */}
        <div className="p-4">
          <div className="rounded-xl bg-muted/60 p-3 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Espace de travail</div>
            <div className="mt-1 truncate font-bold text-foreground">{currentOrg?.nom || "Digit'Advisor"}</div>
            <div className="mt-0.5 text-[10px] font-medium text-primary">
              Rôle: {role === 'super_admin' ? 'Super Admin' : role === 'admin_org' ? 'Admin Entreprise' : 'Commercial'}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6 scrollbar-hide">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-faciloop text-white shadow-md'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
