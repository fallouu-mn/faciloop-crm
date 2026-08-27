import { supabase } from '@/lib/supabase';
import type { Commission } from '@/types/crm';

export async function getCommissions(organizationId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Commission[];
}

export async function getCommissionsByCommercial(commercialId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('commercial_id', commercialId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Commission[];
}

export async function getCommissionById(id: string): Promise<Commission | null> {
  const { data, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Commission;
}

export async function createCommission(commission: Omit<Commission, 'id' | 'created_at'>): Promise<Commission> {
  const { data, error } = await supabase
    .from('commissions')
    .insert(commission)
    .select()
    .single();

  if (error) throw error;
  return data as Commission;
}

export async function updateCommission(id: string, updates: Partial<Commission>): Promise<Commission> {
  const { data, error } = await supabase
    .from('commissions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Commission;
}

export async function deleteCommission(id: string): Promise<void> {
  const { error } = await supabase
    .from('commissions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateCommissionStatut(id: string, statut: Commission['statut']): Promise<Commission> {
  return updateCommission(id, { statut });
}
