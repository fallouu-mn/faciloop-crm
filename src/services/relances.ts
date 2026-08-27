import { supabase } from '@/lib/supabase';
import type { Relance } from '@/types/crm';

export async function getRelances(organizationId: string): Promise<Relance[]> {
  const { data, error } = await supabase
    .from('relances')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Relance[];
}

export async function getRelancesByCommercial(commercialId: string): Promise<Relance[]> {
  const { data, error } = await supabase
    .from('relances')
    .select('*')
    .eq('commercial_id', commercialId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Relance[];
}

export async function getRelancesByProspect(prospectId: string): Promise<Relance[]> {
  const { data, error } = await supabase
    .from('relances')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as Relance[];
}

export async function getRelanceById(id: string): Promise<Relance | null> {
  const { data, error } = await supabase
    .from('relances')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Relance;
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
