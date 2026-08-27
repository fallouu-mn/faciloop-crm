import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, CheckCircle2, BellOff, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, notifications, markNotificationAsRead } = useAuth();

  const isEn = i18n.language?.startsWith('en');

  // Backend-ready: filter notifications for current commercial only
  const myNotifications = useMemo(() => {
    if (!user) return [];
    return notifications.filter(n => n.commercial_id === user.id);
  }, [notifications, user]);

  const unreadCount = myNotifications.filter(n => !n.lue).length;

  const handleMarkAllRead = () => {
    myNotifications.filter(n => !n.lue).forEach(n => markNotificationAsRead(n.id));
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            {isEn ? 'Notifications' : 'Notifications'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
            {isEn ? 'History of your alerts and follow-ups' : 'Historique de vos alertes et relances'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-input bg-card text-xs font-bold text-foreground hover:bg-muted transition-all shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isEn ? `Mark all as read (${unreadCount})` : `Tout marquer lu (${unreadCount})`}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {myNotifications.length === 0 ? (
        <div className="rounded-2xl border border-border p-8 text-center space-y-3">
          <BellOff className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">
            {isEn ? 'No notifications' : 'Aucune notification'}
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isEn ? 'Your overdue follow-up alerts, assigned prospect notifications, and updates will appear here.' : 'Vos alertes de relances en retard, nouveaux prospects attribués et autres notifications apparaîtront ici.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.lue && markNotificationAsRead(notif.id)}
              className={`p-4 rounded-2xl border bg-card flex items-start justify-between gap-4 transition-all ${
                !notif.lue
                  ? 'border-primary/50 bg-primary/5 shadow-sm cursor-pointer hover:bg-primary/10'
                  : 'border-border hover:border-border/80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  !notif.lue ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {notif.type === 'relance_retard' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-extrabold text-xs text-foreground">{notif.titre}</h3>
                    {!notif.lue && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-black shrink-0">
                        Nouvelle
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {notif.lien && (
                <Link
                  to={notif.lien}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3 py-1.5 rounded-xl border border-input text-xs font-bold hover:bg-muted shrink-0 transition-all"
                >
                  Ouvrir
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
