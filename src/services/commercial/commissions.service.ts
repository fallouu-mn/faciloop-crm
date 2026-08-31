import { supabase } from '@/lib/supabase';
import type { Commission } from '@/types/crm';

/**
 * Service pour le suivi des commissions et des gains du commercial.
 */

export async function getCommissions(organizationId: string, commercialId?: string): Promise<Commission[]> {
  let query = supabase
    .from('commissions')
    .select('*')
    .eq('organization_id', organizationId);

  if (commercialId) {
    query = query.eq('commercial_id', commercialId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Commission[];
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
