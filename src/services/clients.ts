import { supabase } from '@/lib/supabase';
import type { ClientFaciloop } from '@/types/crm';

export async function getClients(organizationId: string): Promise<ClientFaciloop[]> {
  const { data, error } = await supabase
    .from('clients_faciloop')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ClientFaciloop[];
}

export async function getClientsByCommercial(commercialId: string): Promise<ClientFaciloop[]> {
  const { data, error } = await supabase
    .from('clients_faciloop')
    .select('*')
    .eq('commercial_id', commercialId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ClientFaciloop[];
}

export async function getClientById(id: string): Promise<ClientFaciloop | null> {
  const { data, error } = await supabase
    .from('clients_faciloop')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ClientFaciloop;
}

export async function createClient(client: Omit<ClientFaciloop, 'id' | 'created_at'>): Promise<ClientFaciloop> {
  const { data, error } = await supabase
    .from('clients_faciloop')
    .insert(client)
    .select()
    .single();

  if (error) throw error;
  return data as ClientFaciloop;
}

export async function updateClient(id: string, updates: Partial<ClientFaciloop>): Promise<ClientFaciloop> {
  const { data, error } = await supabase
    .from('clients_faciloop')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ClientFaciloop;
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients_faciloop')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateClientStatus(id: string, statut_compte: ClientFaciloop['statut_compte']): Promise<ClientFaciloop> {
  return updateClient(id, { statut_compte });
}
