import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import * as notificationsService from '@/services/notifications';
import type { NotificationItem } from '@/types/crm';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = user.commercialId
        ? await notificationsService.getNotificationsByCommercial(user.commercialId)
        : await notificationsService.getNotifications(user.organizationId);
      setNotifications(data);
    } catch (e: any) {
      setError(e.message || 'Erreur chargement notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.commercialId) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications_commercial',
          filter: `commercial_id=eq.${user.commercialId}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as NotificationItem, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id: string) => {
    const updated = await notificationsService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? updated : n));
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await notificationsService.markAllNotificationsAsRead(user.organizationId, user.commercialId);
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
  };

  const unreadCount = notifications.filter(n => !n.lue).length;

  return { notifications, unreadCount, loading, error, refetch: fetch, markAsRead, markAllAsRead };
}
