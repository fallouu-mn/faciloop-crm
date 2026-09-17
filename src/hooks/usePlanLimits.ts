import { useAuth } from '../contexts/AuthContext';
import { getPlanLimits, FEATURE_MIN_PLAN } from '../lib/planLimits';
import type { PlanFeature } from '../lib/planLimits';

export function usePlanLimits() {
  const { currentOrg, commerciaux } = useAuth();

  const limits = getPlanLimits(currentOrg?.formule_code);
  const activeCommerciaux = commerciaux.filter(c => c.statut === 'actif').length;

  const hasFeature = (feature: PlanFeature): boolean =>
    limits.features.includes(feature);

  const getRequiredPlan = (feature: PlanFeature): string =>
    FEATURE_MIN_PLAN[feature] || 'Business';

  return {
    plan: limits,
    activeCommerciaux,
    canAddCommercial: activeCommerciaux < limits.maxCommerciaux,
    commerciauxRemaining: limits.maxCommerciaux === Infinity
      ? Infinity
      : limits.maxCommerciaux - activeCommerciaux,
    formuleCode: currentOrg?.formule_code || null,
    hasFeature,
    getRequiredPlan,
  };
}
