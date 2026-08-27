import { supabase } from '@/lib/supabase';
import type { Interaction } from '@/types/crm';

export async function getInteractions(organizationId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Interaction[];
}

export async function getInteractionsByCommercial(commercialId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('commercial_id', commercialId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Interaction[];
}

export async function getInteractionsByProspect(prospectId: string): Promise<Interaction[]> {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Interaction[];
}

export async function getInteractionById(id: string): Promise<Interaction | null> {
  const { data, error } = await supabase
    .from('interactions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Interaction;
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

export async function updateInteraction(id: string, updates: Partial<Interaction>): Promise<Interaction> {
  const { data, error } = await supabase
    .from('interactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Interaction;
}

export async function deleteInteraction(id: string): Promise<void> {
  const { error } = await supabase
    .from('interactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
