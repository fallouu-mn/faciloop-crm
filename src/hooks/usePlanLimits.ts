import { useAuth } from '../contexts/AuthContext';
import { getPlanLimits, FEATURE_MIN_PLAN } from '../lib/planLimits';
import type { PlanFeature } from '../lib/planLimits';

export function usePlanLimits() {
  const { currentOrg, commerciaux } = useAuth();

  const limits = getPlanLimits(currentOrg?.formule_code);
  const activeCommerciaux = commerciaux.filter(c => c.statut === 'actif').length;

  // Le quota personnalisé défini par le superadmin prend la priorité sur la limite du plan.
  // null / undefined / 0 → on retombe sur la limite du plan.
  const effectiveMax: number =
    currentOrg?.max_commerciaux != null && currentOrg.max_commerciaux > 0
      ? currentOrg.max_commerciaux
      : limits.maxCommerciaux;

  const hasFeature = (feature: PlanFeature): boolean =>
    limits.features.includes(feature);

  const getRequiredPlan = (feature: PlanFeature): string =>
    FEATURE_MIN_PLAN[feature] || 'Business';

  return {
    plan: limits,
    activeCommerciaux,
    canAddCommercial: activeCommerciaux < effectiveMax,
    commerciauxRemaining: effectiveMax === Infinity
      ? Infinity
      : effectiveMax - activeCommerciaux,
    /** Quota effectif (custom superadmin ou limite du plan). */
    maxCommerciaux: effectiveMax,
    /** true si un quota personnalisé superadmin est actif sur cette org. */
    hasCustomQuota: currentOrg?.max_commerciaux != null && currentOrg.max_commerciaux > 0,
    formuleCode: currentOrg?.formule_code || null,
    hasFeature,
    getRequiredPlan,
  };
}
