import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Centre de Notifications
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Historique de vos alertes et relances
        </p>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => markNotificationAsRead(notif.id)}
            className={`p-4 rounded-2xl border bg-card flex items-start justify-between gap-4 cursor-pointer transition-all ${
              !notif.lue ? 'border-primary bg-primary/5' : 'border-border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${!notif.lue ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs text-foreground">{notif.titre}</h3>
                  {!notif.lue && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[9px] font-bold">
                      Non lue
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{notif.message}</p>
                <span className="text-[10px] text-muted-foreground">{notif.created_at.split('T')[0]}</span>
              </div>
            </div>

            {notif.lien && (
              <Link
                to={notif.lien}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold hover:bg-muted shrink-0"
              >
                Ouvrir
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
