import { supabase } from '@/lib/supabase';
import type { Relance } from '@/types/crm';

/**
 * Service pour la gestion des relances clients/prospects.
 * Filtrage par organization_id (Multi-Tenant) et par commercial_id.
 */

export async function getRelances(organizationId: string, commercialId?: string): Promise<Relance[]> {
  let query = supabase
    .from('relances')
    .select('*')
    .eq('organization_id', organizationId);

  if (commercialId) {
    query = query.eq('commercial_id', commercialId);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) throw error;
  return (data || []) as Relance[];
}

export async function createRelance(relance: Omit<Relance, 'id' | 'created_at'>): Promise<Relance> {
  const { data, error } = await supabase
    .from('relances')
    .insert(relance)
    .select()
    .single();

  if (error) throw error;
  return data as Relance;
}

export async function updateRelance(id: string, updates: Partial<Relance>): Promise<Relance> {
  const { data, error } = await supabase
    .from('relances')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Relance;
}

export async function deleteRelance(id: string): Promise<void> {
  const { error } = await supabase
    .from('relances')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function completeRelance(id: string): Promise<Relance> {
  return updateRelance(id, { statut: 'realisee' });
}
