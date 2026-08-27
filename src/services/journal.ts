import { supabase } from '@/lib/supabase';
import type { ActionLog } from '@/types/crm';

export async function getActionLogs(organizationId: string): Promise<ActionLog[]> {
  const { data, error } = await supabase
    .from('journal_actions_commercial')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ActionLog[];
}

export async function getActionLogsByUser(utilisateurId: string): Promise<ActionLog[]> {
  const { data, error } = await supabase
    .from('journal_actions_commercial')
    .select('*')
    .eq('utilisateur_id', utilisateurId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ActionLog[];
}

export async function getActionLogById(id: string): Promise<ActionLog | null> {
  const { data, error } = await supabase
    .from('journal_actions_commercial')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ActionLog;
}

export async function createActionLog(log: Omit<ActionLog, 'id' | 'created_at'>): Promise<ActionLog> {
  const { data, error } = await supabase
    .from('journal_actions_commercial')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data as ActionLog;
}

export async function deleteActionLog(id: string): Promise<void> {
  const { error } = await supabase
    .from('journal_actions_commercial')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
