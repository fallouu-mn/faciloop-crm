import { supabase } from '@/lib/supabase';

export interface FormuleSaasRow {
  id: string;
  code: string;
  label: string;
  description: string;
  prix_xof: number;
  is_active: boolean;
  pricing_mensuel: number;
  pricing_mensuel_premier_mois: number | null;
  pricing_trimestriel: number;
  pricing_trimestriel_normal: number;
  pricing_trimestriel_remise: number;
  pricing_annuel: number;
  pricing_annuel_normal: number;
  pricing_annuel_remise: number;
  created_at: string;
}

export interface FormuleConfig {
  code: string;
  label: string;
  prix_xof: number;
  pricing: {
    mensuel: number;
    mensuel_premier_mois: number | null;
    trimestriel: number;
    trimestriel_normal: number;
    trimestriel_remise: number;
    annuel: number;
    annuel_normal: number;
    annuel_remise: number;
  };
  isActive: boolean;
  description: string;
}

export function rowToFormuleConfig(row: FormuleSaasRow): FormuleConfig {
  return {
    code: row.code,
    label: row.label,
    prix_xof: row.prix_xof,
    isActive: row.is_active,
    description: row.description,
    pricing: {
      mensuel: row.pricing_mensuel,
      mensuel_premier_mois: row.pricing_mensuel_premier_mois,
      trimestriel: row.pricing_trimestriel,
      trimestriel_normal: row.pricing_trimestriel_normal,
      trimestriel_remise: row.pricing_trimestriel_remise,
      annuel: row.pricing_annuel,
      annuel_normal: row.pricing_annuel_normal,
      annuel_remise: row.pricing_annuel_remise,
    },
  };
}

function formuleConfigToRow(config: FormuleConfig): Omit<FormuleSaasRow, 'id' | 'created_at'> {
  return {
    code: config.code,
    label: config.label,
    description: config.description,
    prix_xof: config.prix_xof,
    is_active: config.isActive,
    pricing_mensuel: config.pricing.mensuel,
    pricing_mensuel_premier_mois: config.pricing.mensuel_premier_mois,
    pricing_trimestriel: config.pricing.trimestriel,
    pricing_trimestriel_normal: config.pricing.trimestriel_normal,
    pricing_trimestriel_remise: config.pricing.trimestriel_remise,
    pricing_annuel: config.pricing.annuel,
    pricing_annuel_normal: config.pricing.annuel_normal,
    pricing_annuel_remise: config.pricing.annuel_remise,
  };
}

export async function getFormules(): Promise<FormuleConfig[]> {
  const { data, error } = await supabase
    .from('formules_saas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as FormuleSaasRow[]).map(rowToFormuleConfig);
}

export async function createFormule(config: FormuleConfig): Promise<FormuleConfig> {
  const row = formuleConfigToRow(config);
  const { data, error } = await supabase
    .from('formules_saas')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return rowToFormuleConfig(data as FormuleSaasRow);
}

export async function updateFormule(code: string, config: Partial<FormuleConfig>): Promise<FormuleConfig> {
  const updates: Record<string, unknown> = {};
  if (config.label !== undefined) updates.label = config.label;
  if (config.description !== undefined) updates.description = config.description;
  if (config.prix_xof !== undefined) updates.prix_xof = config.prix_xof;
  if (config.isActive !== undefined) updates.is_active = config.isActive;
  if (config.pricing) {
    updates.pricing_mensuel = config.pricing.mensuel;
    updates.pricing_mensuel_premier_mois = config.pricing.mensuel_premier_mois;
    updates.pricing_trimestriel = config.pricing.trimestriel;
    updates.pricing_trimestriel_normal = config.pricing.trimestriel_normal;
    updates.pricing_trimestriel_remise = config.pricing.trimestriel_remise;
    updates.pricing_annuel = config.pricing.annuel;
    updates.pricing_annuel_normal = config.pricing.annuel_normal;
    updates.pricing_annuel_remise = config.pricing.annuel_remise;
  }

  const { data, error } = await supabase
    .from('formules_saas')
    .update(updates)
    .eq('code', code)
    .select()
    .single();

  if (error) throw error;
  return rowToFormuleConfig(data as FormuleSaasRow);
}

export async function toggleFormuleActive(code: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('formules_saas')
    .update({ is_active: isActive })
    .eq('code', code);

  if (error) throw error;
}

export async function deleteFormule(code: string): Promise<void> {
  const { error } = await supabase
    .from('formules_saas')
    .delete()
    .eq('code', code);

  if (error) throw error;
}

export function getOfferPrice(formules: FormuleConfig[], formuleCode: string, periodicite: string, isFirstMonth = false): number {
  const f = formules.find(fo => fo.code === formuleCode);
  if (!f) return 0;
  if (periodicite === 'mensuel') {
    return isFirstMonth && f.pricing.mensuel_premier_mois
      ? f.pricing.mensuel_premier_mois
      : f.pricing.mensuel;
  }
  if (periodicite === 'trimestriel') return f.pricing.trimestriel;
  return f.pricing.annuel;
}
