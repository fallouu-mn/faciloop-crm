import { supabase } from '@/lib/supabase';
import type { Commercial } from '@/types/crm';

export async function getCommerciaux(organizationId: string): Promise<Commercial[]> {
  const { data, error } = await supabase
    .from('commerciaux')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Commercial[];
}

export async function getCommercialById(id: string): Promise<Commercial | null> {
  const { data, error } = await supabase
    .from('commerciaux')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Commercial;
}

export async function createCommercial(commercial: Omit<Commercial, 'id' | 'created_at'>): Promise<Commercial> {
  const { data, error } = await supabase
    .from('commerciaux')
    .insert(commercial)
    .select()
    .single();

  if (error) throw error;
  return data as Commercial;
}

export async function updateCommercial(id: string, updates: Partial<Commercial>): Promise<Commercial> {
  const { data, error } = await supabase
    .from('commerciaux')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Commercial;
}

export async function deleteCommercial(id: string): Promise<void> {
  const { error } = await supabase
    .from('commerciaux')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
