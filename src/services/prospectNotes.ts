import { supabase } from '@/lib/supabase';

export interface ProspectNote {
  id: string;
  prospect_id: string;
  organization_id: string;
  author_id: string;
  author_nom: string;
  contenu: string;
  mentioned_user_ids: string[];
  created_at: string;
}

export async function getNotesByProspect(prospectId: string): Promise<ProspectNote[]> {
  const { data, error } = await supabase
    .from('prospect_notes')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ProspectNote[];
}

export async function createNote(note: Omit<ProspectNote, 'id' | 'created_at'>): Promise<ProspectNote> {
  const { data, error } = await supabase
    .from('prospect_notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data as ProspectNote;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('prospect_notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
