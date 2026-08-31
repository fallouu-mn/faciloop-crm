import { supabase } from '@/lib/supabase';
import type { Interaction } from '@/types/crm';

/**
 * Service pour les interactions / activités sur un prospect.
 */

export async function getInteractions(prospectId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Interaction[];
}

export async function createInteraction(interaction: Omit<Interaction, 'id' | 'created_at'>): Promise<Interaction> {
  const { data, error } = await supabase
    .from('interactions')
    .insert(interaction)
    .select()
    .single();

  if (error) throw error;
  return data as Interaction;
}
