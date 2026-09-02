import { supabase } from '@/lib/supabase';
import type { NotificationItem } from '@/types/crm';

export async function getNotifications(organizationId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications_commercial')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as NotificationItem[];
}

export async function getNotificationsByCommercial(commercialId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications_commercial')
    .select('*')
    .eq('commercial_id', commercialId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as NotificationItem[];
}

export async function getNotificationById(id: string): Promise<NotificationItem | null> {
  const { data, error } = await supabase
    .from('notifications_commercial')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as NotificationItem;
}

export async function createNotification(notification: Omit<NotificationItem, 'id' | 'created_at'>): Promise<NotificationItem> {
  const { data, error } = await supabase
    .from('notifications_commercial')
    .insert(notification)
    .select()
    .single();

  if (error) throw error;
  return data as NotificationItem;
}

export async function updateNotification(id: string, updates: Partial<NotificationItem>): Promise<NotificationItem> {
  const { data, error } = await supabase
    .from('notifications_commercial')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as NotificationItem;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications_commercial')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  return updateNotification(id, { lue: true });
}

export async function markAllNotificationsAsRead(organizationId: string, commercialId?: string): Promise<void> {
  let query = supabase
    .from('notifications_commercial')
    .update({ lue: true })
    .eq('organization_id', organizationId);

  if (commercialId) {
    query = query.eq('commercial_id', commercialId);
  }

  const { error } = await query;
  if (error) throw error;
}

// ── Admin notifications (notifications_admin_commercial) ──────────────

export async function createAdminNotification(
  notification: Omit<NotificationItem, 'id' | 'created_at' | 'commercial_id'>
): Promise<void> {
  const { error } = await supabase
    .from('notifications_admin_commercial')
    .insert(notification);
  if (error) throw error;
}

export async function getAdminNotifications(organizationId: string): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications_admin_commercial')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as NotificationItem[];
}

export async function markAdminNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications_admin_commercial')
    .update({ lue: true })
    .eq('id', id);

  if (error) throw error;
}

export async function markAllAdminNotificationsAsRead(organizationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications_admin_commercial')
    .update({ lue: true })
    .eq('organization_id', organizationId);

  if (error) throw error;
}
