import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  Goal,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaciloopBrand } from '../common/FaciloopBrand';
import { useTranslation } from 'react-i18next';
import { usePlatformSettings } from '../../hooks/usePlatformSettings';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { t, i18n } = useTranslation();
  const { t: tSA } = useTranslation('superAdmin');
  const { user, currentOrg, adminNotifications, notifications } = useAuth();
  const location = useLocation();
  const role = user?.role || 'commercial';
  const isEn = i18n.language?.startsWith('en');
  const platformSettings = usePlatformSettings();
  const adminBase = location.pathname.startsWith('/demo') ? '/demo' : '/admin';
  const adminUnread = adminNotifications?.filter(n => !n.lue).length ?? 0;
  const commercialUnread = notifications?.filter(n => !n.lue).length ?? 0;

  const commercialLinks = [
    { to: '/app/dashboard', label: isEn ? 'Dashboard' : 'Dashboard', icon: LayoutDashboard },
    { to: '/app/prospects', label: isEn ? 'My Prospects' : 'Mes Prospects', icon: Users },
    { to: '/app/pipeline', label: isEn ? 'Customer Journey' : 'Parcours Client', icon: Kanban },
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
        { to: `${adminBase}/dashboard`, label: isEn ? 'Dashboard' : 'Dashboard', icon: BarChart3 },
      ],
    },
    {
      title: isEn ? 'Team' : 'Équipe',
      links: [
        { to: `${adminBase}/equipe`, label: isEn ? 'Sales Team' : 'Équipe commerciale', icon: Users },
        { to: `${adminBase}/objectifs`, label: isEn ? 'Sales Objectives' : 'Objectifs commerciaux', icon: Goal },
      ],
    },
    {
      title: isEn ? 'Sales Management' : 'Gestion commerciale',
      links: [
        { to: `${adminBase}/prospects`, label: isEn ? 'Prospects' : 'Prospects', icon: UserPlus },
        { to: `${adminBase}/pipeline`, label: isEn ? 'Customer Journey' : 'Parcours Client', icon: Kanban },
        { to: `${adminBase}/relances`, label: isEn ? 'Follow-ups' : 'Relances', icon: CalendarClock },
        { to: `${adminBase}/clients`, label: isEn ? 'Client Accounts' : 'Comptes Clients', icon: Building2 },
      ],
    },
    {
      title: isEn ? 'Revenue' : 'Revenus',
      links: [
        { to: `${adminBase}/abonnements`, label: isEn ? 'Offers' : 'Offres', icon: Crown },
        { to: `${adminBase}/paiements`, label: isEn ? 'Payments' : 'Paiements', icon: CreditCard },
        { to: `${adminBase}/commissions`, label: isEn ? 'Commissions' : 'Commissions', icon: Wallet },
      ],
    },
    {
      title: isEn ? 'Administration' : 'Administration',
      links: [
        { to: `${adminBase}/journal`, label: isEn ? 'Action Log' : 'Journal', icon: ScrollText },
        { to: `${adminBase}/import-export`, label: isEn ? 'Import / Export' : 'Import / Export', icon: FileSpreadsheet },
        { to: `${adminBase}/parametres`, label: isEn ? 'Settings' : 'Paramètres', icon: Settings },
        { to: `${adminBase}/profil`, label: isEn ? 'My Profile' : 'Mon Profil', icon: UserCircle },
      ],
    },
    {
      title: isEn ? 'Alerts' : 'Alertes',
      links: [
        { to: `${adminBase}/notifications`, label: isEn ? 'Notifications' : 'Notifications', icon: Bell },
      ],
    },
  ];

  const adminOrgLinks = adminOrgSections.flatMap(s => s.links);

  const superAdminLinks = [
    { to: '/super-admin/dashboard', label: tSA('nav.dashboard'), icon: LayoutDashboard },
    { to: '/super-admin/organisations', label: tSA('nav.organisations'), icon: Building2 },
    { to: '/super-admin/abonnements', label: tSA('nav.abonnements'), icon: Crown },
    { to: '/super-admin/facturation', label: tSA('nav.facturation'), icon: CreditCard },
    { to: '/super-admin/parametres', label: tSA('nav.parametres'), icon: Settings },
    { to: '/super-admin/profil', label: isEn ? 'My Profile' : 'Mon Profil', icon: UserCircle },
  ];

  const currentLinks =
    role === 'super_admin' ? superAdminLinks :
    role === 'admin_org' ? adminOrgLinks : commercialLinks;

  const renderLink = (link: { to: string; label: string; icon: React.ElementType }, badge: number = 0) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={onClose}
        title={isCollapsed ? link.label : undefined}
        className={({ isActive }) =>
          `group relative flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-3.5'} py-2 sm:py-2.5 rounded-2xl text-xs font-extrabold transition-all ${
            isActive
              ? 'bg-gradient-faciloop text-white shadow-md shadow-primary/25'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`
        }
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!isCollapsed && <span className="flex-1 truncate">{link.label}</span>}
        {badge > 0 && (
          <span className={`${isCollapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shrink-0`}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
        {isCollapsed && (
          <span className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover:flex items-center whitespace-nowrap rounded-lg bg-foreground text-background px-2.5 py-1.5 text-[11px] font-bold shadow-lg">
            {link.label}
          </span>
        )}
      </NavLink>
    );
  };

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

      <aside
        className={`fixed bottom-0 top-0 sm:top-16 z-50 flex flex-col border-r border-border/80 bg-card shadow-2xl transition-all duration-300 ease-in-out font-sans
          ${isCollapsed ? 'md:w-[68px]' : 'w-[280px] sm:w-64'}
          ${isOpen ? 'left-0 translate-x-0' : '-left-[280px] -translate-x-full'}
          md:static md:translate-x-0 md:left-auto md:shadow-none
        `}
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

        {/* Workspace Card */}
        <div className={`${isCollapsed ? 'p-2' : 'p-3 sm:p-4'} hidden md:block`}>
          {isCollapsed ? (
            <div className="flex items-center justify-center py-2" title={currentOrg?.nom || (role === 'super_admin' ? 'Faciloop' : 'Mon Entreprise')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-faciloop flex items-center justify-center text-white text-sm font-black">
                {(currentOrg?.nom || (role === 'super_admin' ? 'F' : 'E'))[0].toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 space-y-1 shadow-sm">
              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Building2 className="w-3 h-3 text-primary" /> {isEn ? 'Workspace' : 'Espace de travail'}
              </div>
              <div className="text-xs font-black text-foreground truncate">
                {currentOrg?.nom || (role === 'super_admin' ? platformSettings.nom_plateforme : 'Mon Entreprise')}
              </div>
              <div className="text-[10px] font-bold text-primary capitalize flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                {role === 'super_admin' ? 'Super Admin' : role === 'admin_org' ? (isEn ? 'Management Console' : 'Console Direction') : (isEn ? 'Sales Rep' : 'Commercial')}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Workspace Card (always expanded) */}
        <div className="p-3 md:hidden">
          <div className="rounded-2xl border border-border/80 bg-muted/40 p-3 space-y-1 shadow-sm">
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3 text-primary" /> {isEn ? 'Workspace' : 'Espace de travail'}
            </div>
            <div className="text-xs font-black text-foreground truncate">
              {currentOrg?.nom || (role === 'super_admin' ? platformSettings.nom_plateforme : 'Mon Entreprise')}
            </div>
            <div className="text-[10px] font-bold text-primary capitalize flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              {role === 'super_admin' ? 'Super Admin' : role === 'admin_org' ? (isEn ? 'Management Console' : 'Console Direction') : (isEn ? 'Sales Rep' : 'Commercial')}
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3 sm:px-4'} py-2 space-y-1`}>
          {role === 'admin_org' ? (
            <div className="space-y-4">
              {adminOrgSections.map((section) => (
                <div key={section.title}>
                  {!isCollapsed && (
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-1.5">
                      {section.title}
                    </div>
                  )}
                  {isCollapsed && <div className="border-t border-border/60 my-2 mx-1" />}
                  <div className="space-y-0.5">
                    {section.links.map((link) => {
                      const isNotifLink = link.to.endsWith('/notifications');
                      const badge = isNotifLink && adminUnread > 0 ? adminUnread : 0;
                      return renderLink(link, badge);
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {!isCollapsed && (
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 mb-2">
                  {isEn ? 'Navigation Menu' : 'Menu Navigation'}
                </div>
              )}
              {currentLinks.map((link) => {
                const isNotifLink = link.to.endsWith('/notifications');
                const badge = isNotifLink && commercialUnread > 0 ? commercialUnread : 0;
                return renderLink(link, badge);
              })}
            </>
          )}
        </div>

        {/* Collapse Toggle Button (desktop only) */}
        <div className="hidden md:flex border-t border-border/80 p-2">
          <button
            onClick={onToggleCollapse}
            className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2 px-3'} py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all w-full`}
            title={isCollapsed ? (isEn ? 'Expand menu' : 'Ouvrir le menu') : (isEn ? 'Collapse menu' : 'Réduire le menu')}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!isCollapsed && <span>{isEn ? 'Collapse' : 'Réduire'}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
