import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Bell, TrendingDown, UserX, AlertCircle, CalendarX2,
  UserMinus, Ban, Target, AlertTriangle, CheckCheck,
  UserPlus, CreditCard, Trophy, Inbox,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

type Filtre = 'toutes' | 'non_lues' | 'activite' | 'paiements' | 'clients' | 'objectifs';

const FILTRES: { key: Filtre; label: string }[] = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'non_lues', label: 'Non lues' },
  { key: 'activite', label: 'Activité' },
  { key: 'paiements', label: 'Paiements' },
  { key: 'clients', label: 'Clients' },
  { key: 'objectifs', label: 'Objectifs' },
];

const FILTRE_TYPES: Record<Filtre, string[] | null> = {
  toutes: null,
  non_lues: null,
  activite: ['baisse_activite', 'prospect_non_traite'],
  paiements: ['paiement_en_retard', 'abonnement_expire', 'paiement_recu'],
  clients: ['client_inactif', 'compte_suspendu', 'nouveau_client'],
  objectifs: ['objectif_non_atteint', 'prospects_perdus_anormal', 'objectif_atteint'],
};

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; ring: string }> = {
  baisse_activite:          { icon: TrendingDown, color: 'bg-orange-500', ring: 'ring-orange-500/30' },
  prospect_non_traite:      { icon: UserX,        color: 'bg-amber-500',  ring: 'ring-amber-500/30' },
  paiement_en_retard:       { icon: AlertCircle,  color: 'bg-red-500',    ring: 'ring-red-500/30' },
  abonnement_expire:        { icon: CalendarX2,   color: 'bg-red-500',    ring: 'ring-red-500/30' },
  client_inactif:           { icon: UserMinus,    color: 'bg-gray-500',   ring: 'ring-gray-500/30' },
  compte_suspendu:          { icon: Ban,          color: 'bg-red-500',    ring: 'ring-red-500/30' },
  objectif_non_atteint:     { icon: Target,       color: 'bg-orange-500', ring: 'ring-orange-500/30' },
  prospects_perdus_anormal: { icon: AlertTriangle,color: 'bg-red-500',    ring: 'ring-red-500/30' },
  nouveau_client:           { icon: UserPlus,     color: 'bg-emerald-500',ring: 'ring-emerald-500/30' },
  paiement_recu:            { icon: CreditCard,   color: 'bg-emerald-500',ring: 'ring-emerald-500/30' },
  objectif_atteint:         { icon: Trophy,       color: 'bg-emerald-500',ring: 'ring-emerald-500/30' },
  relance:                  { icon: Bell,         color: 'bg-amber-500',  ring: 'ring-amber-500/30' },
  alerte:                   { icon: AlertCircle,  color: 'bg-rose-500',   ring: 'ring-rose-500/30' },
  prospect:                 { icon: UserPlus,     color: 'bg-blue-500',   ring: 'ring-blue-500/30' },
  paiement:                 { icon: CreditCard,   color: 'bg-emerald-500',ring: 'ring-emerald-500/30' },
};

const DEFAULT_CONFIG = { icon: Bell, color: 'bg-primary', ring: 'ring-primary/30' };

function formatDateRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffJ = Math.floor(diffH / 24);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin}min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffJ === 1) return 'hier';
  if (diffJ < 7) return `il y a ${diffJ} jours`;
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const NotificationsAdminPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const { adminNotifications, markAdminNotificationAsRead, markAllAdminNotificationsAsRead } = useAuth();
  const navigate = useNavigate();
  const [filtre, setFiltre] = useState<Filtre>('toutes');

  const nonLues = useMemo(() => adminNotifications.filter(n => !n.lue).length, [adminNotifications]);

  const filtered = useMemo(() => {
    let list = [...adminNotifications];

    if (filtre === 'non_lues') {
      list = list.filter(n => !n.lue);
    } else if (FILTRE_TYPES[filtre]) {
      list = list.filter(n => FILTRE_TYPES[filtre]!.includes(n.type));
    }

    list.sort((a, b) => {
      if (a.lue !== b.lue) return a.lue ? 1 : -1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return list;
  }, [adminNotifications, filtre]);

  function marquerToutLu() {
    markAllAdminNotificationsAsRead();
  }

  function handleClick(notif: (typeof adminNotifications)[0]) {
    if (!notif.lue) {
      markAdminNotificationAsRead(notif.id);
    }
    if (notif.lien) {
      navigate(notif.lien);
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 pt-2 pb-4">
        <div className="h-12 w-12 rounded-xl bg-red-500 flex items-center justify-center ring-2 ring-red-500/30 shrink-0">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('adminOrg.notifications.title')}</h1>
            {nonLues > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                {nonLues}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{t('adminOrg.notifications.subtitle')}</p>
        </div>
        {nonLues > 0 && (
          <button
            type="button"
            onClick={marquerToutLu}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-input text-xs font-bold text-foreground hover:bg-muted transition-all shrink-0"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {t('adminOrg.notifications.markAllRead')}
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTRES.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFiltre(f.key)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
              filtre === f.key
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {t(`adminOrg.notifications.filters.${f.key}`)}
            {f.key === 'non_lues' && nonLues > 0 && (
              <span className="ml-1 text-[10px]">({nonLues})</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {filtre === 'non_lues' ? t('adminOrg.notifications.emptyUnread') : t('adminOrg.notifications.emptyAll')}
            </p>
          </div>
        ) : (
          filtered.map(notif => {
            const config = TYPE_CONFIG[notif.type] ?? DEFAULT_CONFIG;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className={cn(
                  'rounded-2xl border bg-card transition-all hover:bg-muted/40 active:scale-[0.99] cursor-pointer',
                  !notif.lue ? 'border-primary/30 bg-blue-50 dark:bg-blue-950/20' : 'border-border',
                )}
                onClick={() => handleClick(notif)}
              >
                <div className="p-3 flex items-start gap-3">
                  <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center ring-2 shrink-0 mt-0.5', config.color, config.ring)}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      {!notif.lue && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <p className={cn('text-sm leading-tight', !notif.lue ? 'font-bold' : 'font-medium')}>
                        {notif.titre}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground/70">{formatDateRelative(notif.created_at)}</p>
                  </div>
                  {notif.lien && (
                    <span className="text-[10px] font-bold text-primary shrink-0 mt-1">Voir →</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
