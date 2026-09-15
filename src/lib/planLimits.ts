export type PlanFeature =
  | 'objectifs_equipe'
  | 'journal_actions'
  | 'import_csv'
  | 'stats_avancees'
  | 'rapports_personnalises';

export interface PlanLimits {
  maxCommerciaux: number;
  label: string;
  features: PlanFeature[];
  upgradeTo: string | null;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  Pro: {
    maxCommerciaux: 3,
    label: 'Pro',
    features: [],
    upgradeTo: 'Business',
  },
  Business: {
    maxCommerciaux: 10,
    label: 'Business',
    features: ['objectifs_equipe', 'journal_actions', 'import_csv', 'stats_avancees'],
    upgradeTo: 'Premium',
  },
  Premium: {
    maxCommerciaux: Infinity,
    label: 'Premium',
    features: ['objectifs_equipe', 'journal_actions', 'import_csv', 'stats_avancees', 'rapports_personnalises'],
    upgradeTo: null,
  },
};

export const DEFAULT_PLAN_LIMITS: PlanLimits = PLAN_LIMITS.Pro;

export function getPlanLimits(formuleCode?: string | null): PlanLimits {
  if (!formuleCode) return DEFAULT_PLAN_LIMITS;
  return PLAN_LIMITS[formuleCode] || DEFAULT_PLAN_LIMITS;
}

export const FEATURE_MIN_PLAN: Record<PlanFeature, string> = {
  objectifs_equipe: 'Business',
  journal_actions: 'Business',
  import_csv: 'Business',
  stats_avancees: 'Business',
  rapports_personnalises: 'Premium',
};
