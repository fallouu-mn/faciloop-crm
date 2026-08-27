import { supabase } from '@/lib/supabase';
import type { Paiement } from '@/types/crm';

export async function getPaiements(organizationId: string): Promise<Paiement[]> {
  const { data, error } = await supabase
    .from('paiements')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Paiement[];
}

export async function getPaiementsByClient(clientId: string): Promise<Paiement[]> {
  const { data, error } = await supabase
    .from('paiements')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Paiement[];
}

export async function getPaiementById(id: string): Promise<Paiement | null> {
  const { data, error } = await supabase
    .from('paiements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Paiement;
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

export async function updatePaiement(id: string, updates: Partial<Paiement>): Promise<Paiement> {
  const { data, error } = await supabase
    .from('paiements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Paiement;
}

export async function deletePaiement(id: string): Promise<void> {
  const { error } = await supabase
    .from('paiements')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function validatePaiement(id: string, reference_transaction?: string): Promise<Paiement> {
  return updatePaiement(id, { statut: 'valide', reference_transaction });
}
