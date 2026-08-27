import { supabase } from '@/lib/supabase';
import type { Abonnement } from '@/types/crm';

export async function getAbonnements(organizationId: string): Promise<Abonnement[]> {
  const { data, error } = await supabase
    .from('abonnements')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Abonnement[];
}

export async function getAbonnementById(id: string): Promise<Abonnement | null> {
  const { data, error } = await supabase
    .from('abonnements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Abonnement;
}

export async function getAbonnementByClient(clientId: string): Promise<Abonnement | null> {
  const { data, error } = await supabase
    .from('abonnements')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as Abonnement | null;
}

export async function createAbonnement(abonnement: Omit<Abonnement, 'id' | 'created_at'>): Promise<Abonnement> {
  const { data, error } = await supabase
    .from('abonnements')
    .insert(abonnement)
    .select()
    .single();

  if (error) throw error;
  return data as Abonnement;
}

export async function updateAbonnement(id: string, updates: Partial<Abonnement>): Promise<Abonnement> {
  const { data, error } = await supabase
    .from('abonnements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Abonnement;
}

export async function deleteAbonnement(id: string): Promise<void> {
  const { error } = await supabase
    .from('abonnements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateAbonnementStatut(id: string, statut: Abonnement['statut']): Promise<Abonnement> {
  return updateAbonnement(id, { statut });
}
