import { supabase } from '@/lib/supabase';
import type { Prospect } from '@/types/crm';

/**
 * Service pour la gestion des prospects en base de données Supabase.
 * Respecte le multi-tenant via organization_id et le périmètre commercial si commercialId est fourni.
 */

export async function getProspects(organizationId: string, commercialId?: string): Promise<Prospect[]> {
  let query = supabase
    .from('prospects')
    .select('*')
    .eq('organization_id', organizationId);

  if (commercialId) {
    query = query.eq('commercial_id', commercialId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Prospect[];
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

export async function reassignProspects(
  prospectIds: string[],
  newCommercialId: string,
  newCommercialNom?: string
): Promise<void> {
  const updates: Partial<Prospect> = {
    commercial_id: newCommercialId,
  };
  if (newCommercialNom) {
    updates.commercial_nom = newCommercialNom;
  }

  const { error } = await supabase
    .from('prospects')
    .update(updates)
    .in('id', prospectIds);

  if (error) throw error;
}

export async function importProspects(prospectsData: Omit<Prospect, 'id' | 'created_at'>[]): Promise<Prospect[]> {
  const { data, error } = await supabase
    .from('prospects')
    .insert(prospectsData)
    .select();

  if (error) throw error;
  return (data || []) as Prospect[];
}
