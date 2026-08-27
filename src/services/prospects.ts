import { supabase } from '@/lib/supabase';
import type { Prospect } from '@/types/crm';

export async function getProspects(organizationId: string): Promise<Prospect[]> {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Prospect[];
}

export async function getProspectsByCommercial(commercialId: string): Promise<Prospect[]> {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('commercial_id', commercialId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Prospect[];
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  const { data, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Prospect;
}

export async function createProspect(prospect: Omit<Prospect, 'id' | 'created_at'>): Promise<Prospect> {
  const { data, error } = await supabase
    .from('prospects')
    .insert(prospect)
    .select()
    .single();

  if (error) throw error;
  return data as Prospect;
}

export async function updateProspect(id: string, updates: Partial<Prospect>): Promise<Prospect> {
  const { data, error } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Prospect;
}

export async function deleteProspect(id: string): Promise<void> {
  const { error } = await supabase
    .from('prospects')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateProspectPipeline(id: string, statut_pipeline: string): Promise<Prospect> {
  return updateProspect(id, { statut_pipeline: statut_pipeline as Prospect['statut_pipeline'] });
}
