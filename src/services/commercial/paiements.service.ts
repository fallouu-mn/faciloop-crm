import { supabase } from '@/lib/supabase';
import type { Paiement } from '@/types/crm';

/**
 * Service pour la consultation et le suivi des encaissements / paiements clients.
 */

export async function getPaiements(organizationId: string, commercialId?: string): Promise<Paiement[]> {
  let query = supabase
    .from('paiements')
    .select('*')
    .eq('organization_id', organizationId);

  if (commercialId) {
    query = query.eq('commercial_id', commercialId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Paiement[];
}

export async function createPaiement(paiement: Omit<Paiement, 'id' | 'created_at'>): Promise<Paiement> {
  const { data, error } = await supabase
    .from('paiements')
    .insert(paiement)
    .select()
    .single();

  if (error) throw error;
  return data as Paiement;
}
