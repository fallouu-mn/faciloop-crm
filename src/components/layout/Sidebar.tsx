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
  FileSpreadsheet,
  Settings,
  X,
  UserCheck,
  ShieldCheck,
  Crown,
  BarChart3,
  Wallet,
  ScrollText,
  DollarSign,
  UserCircle,
  Goal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaciloopBrand } from '../common/FaciloopBrand';

import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const { user, currentOrg } = useAuth();
  const role = user?.role || 'commercial';
  const isEn = i18n.language?.startsWith('en');

  // Navigation Items per Role
  const commercialLinks = [
    { to: '/app/dashboard', label: isEn ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { to: '/app/prospects', label: isEn ? 'My Prospects' : 'Mes Prospects', icon: Users },
    { to: '/app/pipeline', label: isEn ? 'Kanban Pipeline' : 'Pipeline Kanban', icon: Kanban },
    { to: '/app/gains', label: isEn ? 'My Earnings' : 'Mes Gains', icon: DollarSign },
    { to: '/app/objectifs', label: isEn ? 'My Objectives' : 'Mes Objectifs', icon: Goal },
    { to: '/app/relances', label: isEn ? 'Follow-ups' : 'Relances', icon: CalendarClock },
    { to: '/app/notifications', label: isEn ? 'Notifications' : 'Notifications', icon: Bell },
    { to: '/app/profil', label: isEn ? 'My Profile' : 'Mon Profil', icon: UserCircle },
  ];

  const adminOrgSections = [
    {
      title: isEn ? 'Overview' : 'Pilotage',
      links: [
        { to: '/admin/dashboard', label: isEn ? 'Dashboard' : 'Dashboard', icon: BarChart3 },
      ],
    },
    {
      title: isEn ? 'Team' : 'Équipe',
      links: [
        { to: '/admin/equipe', label: isEn ? 'Sales Team' : 'Équipe commerciale', icon: Users },
        { to: '/admin/objectifs', label: isEn ? 'Sales Objectives' : 'Objectifs commerciaux', icon: Goal },
      ],
    },
    {
      title: isEn ? 'Sales Management' : 'Gestion commerciale',
      links: [
        { to: '/admin/prospects', label: isEn ? 'Prospects' : 'Prospects', icon: UserPlus },
        { to: '/admin/pipeline', label: isEn ? 'Kanban Pipeline' : 'Pipeline Kanban', icon: Kanban },
        { to: '/admin/relances', label: isEn ? 'Follow-ups' : 'Relances', icon: CalendarClock },
        { to: '/admin/clients', label: isEn ? 'Client Accounts' : 'Comptes Clients', icon: Building2 },
      ],
    },
    {
      title: isEn ? 'Revenue' : 'Revenus',
      links: [
        { to: '/admin/abonnements', label: isEn ? 'Subscriptions' : 'Abonnements', icon: Crown },
        { to: '/admin/paiements', label: isEn ? 'Payments' : 'Paiements', icon: CreditCard },
        { to: '/admin/commissions', label: isEn ? 'Commissions' : 'Commissions', icon: Wallet },
      ],
    },
    {
      title: isEn ? 'Administration' : 'Administration',
      links: [
        { to: '/admin/journal', label: isEn ? 'Action Log' : 'Journal', icon: ScrollText },
        { to: '/admin/import-export', label: isEn ? 'Import / Export' : 'Import / Export', icon: FileSpreadsheet },
        { to: '/admin/parametres', label: isEn ? 'Settings' : 'Paramètres', icon: Settings },
      ],
    },
    {
      title: isEn ? 'Alerts' : 'Alertes',
      links: [
        { to: '/admin/notifications', label: isEn ? 'Notifications' : 'Notifications', icon: Bell },
      ],
    },
  ];

  const adminOrgLinks = adminOrgSections.flatMap(s => s.links);

  const superAdminLinks = [
    { to: '/super-admin/dashboard', label: isEn ? 'Dashboard' : 'Tableau de bord', icon: LayoutDashboard },
    { to: '/super-admin/organisations', label: isEn ? 'Companies' : 'Entreprises', icon: Building2 },
    { to: '/super-admin/abonnements', label: isEn ? 'Subscriptions' : 'Abonnements', icon: Crown },
    { to: '/super-admin/facturation', label: isEn ? 'Billing' : 'Facturation', icon: CreditCard },
    { to: '/super-admin/statistiques', label: isEn ? 'Analytics' : 'Statistiques', icon: BarChart3 }
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
          {role === 'admin_org' ? (
            <div className="space-y-4">
              {adminOrgSections.map((section) => (
                <div key={section.title}>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                    {section.title}
                  </div>
                  <div className="space-y-0.5">
                    {section.links.map((link) => {
                      const Icon = link.icon;
                      return (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3.5 py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
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
                </div>
              ))}
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Footer Tenant Info */}
        {/* <div className="p-4 border-t border-border/80 bg-muted/20 text-center text-[10px] font-bold text-muted-foreground">
          <span>Faciloop CRM v2.0 • SaaS Multi-Tenant</span>
        </div> */}
      </aside>
    </>
  );
};
