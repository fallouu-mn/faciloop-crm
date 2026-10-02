import { supabase } from '@/lib/supabase';
import type { CustomFieldDef, OrganizationSettings } from '@/types/crm';

/** Sources proposées par défaut (retour client n°6 — liste de base). */
export const DEFAULT_SOURCES: { value: string; label: string }[] = [
  { value: 'prospection_directe', label: 'Prospection directe' },
  { value: 'site_web', label: 'Site web' },
  { value: 'recommandation', label: 'Recommandation' },
  { value: 'reseaux_sociaux', label: 'Réseaux sociaux' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'evenement', label: 'Événement' },
  { value: 'autre', label: 'Autre' },
];

/** Libellés anglais des sources par défaut (les sources custom restent telles quelles). */
const DEFAULT_SOURCES_EN: Record<string, string> = {
  prospection_directe: 'Direct outreach',
  site_web: 'Website',
  recommandation: 'Referral',
  reseaux_sociaux: 'Social media',
  whatsapp: 'WhatsApp',
  evenement: 'Event',
  autre: 'Other',
};

/** Libellé d'une source selon la langue, sans casser les sources custom (identiques en fr/en). */
export function sourceLabel(
  option: { value: string; label: string },
  isEn?: boolean,
): string {
  if (!isEn) return option.label;
  return DEFAULT_SOURCES_EN[option.value] ?? option.label;
}

export const DEFAULT_SETTINGS: Pick<
  OrganizationSettings,
  'prospect_custom_fields_schema' | 'custom_sources'
> = {
  prospect_custom_fields_schema: [],
  custom_sources: [],
};

/**
 * Slug technique dérivé du libellé : « Taille de l'entreprise » → `taille_de_l_entreprise`.
 * Utilisé comme clé dans `prospects.custom_fields`.
 */
export function slugifyFieldKey(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || `champ_${Date.now()}`;
}

export async function getOrganizationSettings(
  organizationId: string,
): Promise<OrganizationSettings> {
  const { data, error } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('organization_id', organizationId)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    return {
      id: '',
      organization_id: organizationId,
      ...DEFAULT_SETTINGS,
      created_at: new Date().toISOString(),
    } as OrganizationSettings;
  }
  return {
    ...data,
    prospect_custom_fields_schema: data.prospect_custom_fields_schema || [],
    custom_sources: data.custom_sources || [],
  } as OrganizationSettings;
}

/** Upsert d'une ligne unique par organisation. */
export async function saveOrganizationSettings(
  organizationId: string,
  updates: Partial<Pick<OrganizationSettings, 'prospect_custom_fields_schema' | 'custom_sources'>>,
): Promise<OrganizationSettings> {
  const { data, error } = await supabase
    .from('organization_settings')
    .upsert(
      { organization_id: organizationId, ...updates },
      { onConflict: 'organization_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    prospect_custom_fields_schema: data.prospect_custom_fields_schema || [],
    custom_sources: data.custom_sources || [],
  } as OrganizationSettings;
}

/**
 * Liste combinée : options par défaut + options custom de l'organisation.
 * Retourne des entrées `{ value, label }` prêtes pour un `<select>`.
 */
export function buildSourceOptions(customSources: string[] = []) {
  const defaults = [...DEFAULT_SOURCES];
  const known = new Set(defaults.map((s) => s.value));
  const extra = customSources
    .map((raw) => (raw || '').trim())
    .filter(Boolean)
    .map((label) => ({ value: slugifyFieldKey(label), label }));
  const seen = new Set<string>();
  return [...defaults, ...extra].filter((s) => {
    if (known.has(s.value) && extra.some((e) => e.value === s.value)) return false;
    if (seen.has(s.value)) return false;
    seen.add(s.value);
    return true;
  });
}

/** Supprime les accents/espaces pour comparer une saisie libre à une source existante. */
export function matchExistingSource(
  raw: string,
  options: { value: string; label: string }[],
): string {
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[\s_-]+/g, '');
  const needle = norm(raw);
  return options.find((o) => norm(o.value) === needle || norm(o.label) === needle)?.value ?? '';
}

/**
 * Sources effectivement présentes dans les données mais absentes de `options`
 * (prospects créés avant l'ajout d'une source custom, données héritées…).
 * Sert à ne jamais masquer une valeur existante dans un filtre ou un `<select>`.
 */
export function usedSourceOptions(
  options: { value: string; label: string }[],
  prospects: { source?: string | null }[],
): { value: string; label: string }[] {
  const known = new Set(options.map((o) => o.value));
  const extra = new Map<string, string>();
  for (const p of prospects) {
    const value = (p.source || '').trim();
    if (!value || known.has(value) || extra.has(value)) continue;
    extra.set(value, value.replace(/[_-]+/g, ' '));
  }
  return [...extra].map(([value, label]) => ({ value, label }));
}

export type { CustomFieldDef, OrganizationSettings };
