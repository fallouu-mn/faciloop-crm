import { supabase } from '@/lib/supabase';

export interface SourceOption {
  value: string;
  label: string;
  actif: boolean;
  ordre: number;
  isDefault?: boolean;
}

export interface SourceCustomRow {
  id: string;
  organization_id: string;
  value: string;
  label: string;
  actif: boolean;
  ordre: number;
  created_at: string;
}

export const DEFAULT_SOURCES: SourceOption[] = [
  { value: 'prospection_directe', label: 'Prospection directe', actif: true, ordre: 0, isDefault: true },
  { value: 'site_web',            label: 'Site web',            actif: true, ordre: 1, isDefault: true },
  { value: 'recommandation',      label: 'Recommandation',      actif: true, ordre: 2, isDefault: true },
  { value: 'reseaux_sociaux',     label: 'Réseaux sociaux',     actif: true, ordre: 3, isDefault: true },
  { value: 'whatsapp',            label: 'WhatsApp',            actif: true, ordre: 4, isDefault: true },
  { value: 'evenement',           label: 'Événement',           actif: true, ordre: 5, isDefault: true },
  { value: 'autre',               label: 'Autre',               actif: true, ordre: 99, isDefault: true },
];

export async function getCustomSources(organizationId: string): Promise<SourceCustomRow[]> {
  const { data, error } = await supabase
    .from('sources_custom')
    .select('*')
    .eq('organization_id', organizationId)
    .order('ordre', { ascending: true });

  if (error) throw error;
  return (data || []) as SourceCustomRow[];
}

export async function addCustomSource(source: Omit<SourceCustomRow, 'id' | 'created_at'>): Promise<SourceCustomRow> {
  const { data, error } = await supabase
    .from('sources_custom')
    .insert(source)
    .select()
    .single();

  if (error) throw error;
  return data as SourceCustomRow;
}

export async function updateCustomSource(id: string, updates: Partial<Pick<SourceCustomRow, 'label' | 'actif' | 'ordre'>>): Promise<SourceCustomRow> {
  const { data, error } = await supabase
    .from('sources_custom')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SourceCustomRow;
}

export async function deleteCustomSource(id: string): Promise<void> {
  const { error } = await supabase
    .from('sources_custom')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
