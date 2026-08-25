import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, CheckCircle2, Filter, Check, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsAdminPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAuth();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'unread': return notifications.filter(n => !n.lue);
      case 'read': return notifications.filter(n => n.lue);
      default: return notifications;
    }
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => !n.lue).length;

  const markAllAsRead = () => {
    notifications.filter(n => !n.lue).forEach(n => markNotificationAsRead(n.id));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'relance': return 'bg-amber-500 text-white';
      case 'paiement': return 'bg-emerald-500 text-white';
      case 'prospect': return 'bg-blue-500 text-white';
      case 'alerte': return 'bg-rose-500 text-white';
      default: return 'bg-primary text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Centre de Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Alertes, relances et événements de votre organisation
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-input text-xs font-bold text-foreground hover:bg-muted transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Tout marquer comme lu</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="inline-flex items-center rounded-full bg-muted p-1 border border-border text-sm">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'all' ? `Toutes (${notifications.length})` : f === 'unread' ? `Non lues (${unreadCount})` : 'Lues'}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.lue && markNotificationAsRead(notif.id)}
              className={`p-4 rounded-2xl border bg-card flex items-start justify-between gap-4 cursor-pointer transition-all hover:shadow-sm ${
                !notif.lue ? 'border-primary/40 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${!notif.lue ? getTypeColor(notif.type) : 'bg-muted text-muted-foreground'}`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-xs text-foreground">{notif.titre}</h3>
                    {!notif.lue && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold shrink-0">
                        Nouveau
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[9px] font-medium capitalize shrink-0">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-muted-foreground">{notif.created_at.split('T')[0]}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {notif.lue && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
                {notif.lien && (
                  <Link
                    to={notif.lien}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1.5 rounded-xl border border-input text-xs font-bold hover:bg-muted"
                  >
                    Ouvrir
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
