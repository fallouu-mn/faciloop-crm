import { supabase } from '@/lib/supabase';
import type { ObjectifCommercial } from '@/types/crm';

export async function getObjectifs(organizationId: string): Promise<ObjectifCommercial[]> {
  const { data, error } = await supabase
    .from('objectifs_commerciaux')
    .select('*')
    .eq('organization_id', organizationId)
    .order('date_debut', { ascending: false });

  if (error) throw error;
  return data as ObjectifCommercial[];
}

export async function getObjectifsByCommercial(commercialId: string): Promise<ObjectifCommercial[]> {
  const { data, error } = await supabase
    .from('objectifs_commerciaux')
    .select('*')
    .eq('commercial_id', commercialId)
    .order('date_debut', { ascending: false });

  if (error) throw error;
  return data as ObjectifCommercial[];
}

export async function getObjectifById(id: string): Promise<ObjectifCommercial | null> {
  const { data, error } = await supabase
    .from('objectifs_commerciaux')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ObjectifCommercial;
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

export async function deleteObjectif(id: string): Promise<void> {
  const { error } = await supabase
    .from('objectifs_commerciaux')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateObjectifProgression(id: string, valeur_actuelle: number, statut?: ObjectifCommercial['statut']): Promise<ObjectifCommercial> {
  const updates: Partial<ObjectifCommercial> = { valeur_actuelle };
  if (statut) updates.statut = statut;
  return updateObjectif(id, updates);
}
