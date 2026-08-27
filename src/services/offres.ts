import { supabase } from '@/lib/supabase';
import type { Offre } from '@/types/crm';

export async function getOffres(organizationId: string): Promise<Offre[]> {
  const { data, error } = await supabase
    .from('offres_organisation')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Offre[];
}

export async function getOffreById(id: string): Promise<Offre | null> {
  const { data, error } = await supabase
    .from('offres_organisation')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Offre;
}

export async function createOffre(offre: Omit<Offre, 'id' | 'created_at'>): Promise<Offre> {
  const { data, error } = await supabase
    .from('offres_organisation')
    .insert(offre)
    .select()
    .single();

  if (error) throw error;
  return data as Offre;
}

export async function updateOffre(id: string, updates: Partial<Offre>): Promise<Offre> {
  const { data, error } = await supabase
    .from('offres_organisation')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Offre;
}

export async function deleteOffre(id: string): Promise<void> {
  const { error } = await supabase
    .from('offres_organisation')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function toggleOffreActif(id: string, actif: boolean): Promise<Offre> {
  return updateOffre(id, { actif });
}
