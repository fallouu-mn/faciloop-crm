import { supabase } from '@/lib/supabase';

export interface EtapePipeline {
  id: string;
  organization_id: string;
  nom: string;
  label: string;
  ordre: number;
  couleur: string;
  badge_bg: string;
  icone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export async function getEtapesPipeline(organizationId: string): Promise<EtapePipeline[]> {
  const { data, error } = await supabase
    .from('etapes_pipeline')
    .select('*')
    .eq('organization_id', organizationId)
    .order('ordre', { ascending: true });

  if (error) throw error;
  return data as EtapePipeline[];
}

export async function createEtape(
  etape: Pick<EtapePipeline, 'organization_id' | 'nom' | 'label' | 'ordre' | 'couleur' | 'badge_bg' | 'icone'>
): Promise<EtapePipeline> {
  const { data, error } = await supabase
    .from('etapes_pipeline')
    .insert({ ...etape, is_default: false })
    .select()
    .single();

  if (error) throw error;
  return data as EtapePipeline;
}

export async function updateEtape(id: string, updates: Partial<Pick<EtapePipeline, 'label' | 'ordre' | 'couleur' | 'badge_bg' | 'icone'>>): Promise<EtapePipeline> {
  const { data, error } = await supabase
    .from('etapes_pipeline')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as EtapePipeline;
}

export async function deleteEtape(id: string): Promise<void> {
  const { error } = await supabase
    .from('etapes_pipeline')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function reorderEtapes(etapes: { id: string; ordre: number }[]): Promise<void> {
  for (const e of etapes) {
    const { error } = await supabase
      .from('etapes_pipeline')
      .update({ ordre: e.ordre })
      .eq('id', e.id);

    if (error) throw error;
  }
}
