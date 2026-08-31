import { supabase } from '@/lib/supabase';
import type { ObjectifCommercial } from '@/types/crm';

/**
 * Service pour la gestion des objectifs commerciaux.
 */

export async function getObjectifs(organizationId: string, commercialId?: string): Promise<ObjectifCommercial[]> {
  let query = supabase
    .from('objectifs_commerciaux')
    .select('*')
    .eq('organization_id', organizationId);

  if (commercialId) {
    query = query.eq('commercial_id', commercialId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ObjectifCommercial[];
}

export async function createObjectif(objectif: Omit<ObjectifCommercial, 'id' | 'created_at'>): Promise<ObjectifCommercial> {
  const { data, error } = await supabase
    .from('objectifs_commerciaux')
    .insert(objectif)
    .select()
    .single();

  if (error) throw error;
  return data as ObjectifCommercial;
}

export async function updateObjectif(id: string, updates: Partial<ObjectifCommercial>): Promise<ObjectifCommercial> {
  const { data, error } = await supabase
    .from('objectifs_commerciaux')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ObjectifCommercial;
}
