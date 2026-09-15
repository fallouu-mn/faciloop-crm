import React from 'react';
import { Lock, ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import type { PlanFeature } from '../../lib/planLimits';

interface PlanGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
}

export function PlanGate({ feature, children }: PlanGateProps) {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const { hasFeature, getRequiredPlan, plan } = usePlanLimits();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  const requiredPlan = getRequiredPlan(feature);

  const featureLabels: Record<PlanFeature, { fr: string; en: string }> = {
    objectifs_equipe: { fr: 'Objectifs d\'équipe', en: 'Team objectives' },
    journal_actions: { fr: 'Journal des actions', en: 'Action audit log' },
    import_csv: { fr: 'Import CSV & dédoublonnage', en: 'CSV Import & deduplication' },
    stats_avancees: { fr: 'Statistiques avancées', en: 'Advanced analytics' },
    rapports_personnalises: { fr: 'Rapports personnalisés', en: 'Custom reports' },
  };

  const label = isEn ? featureLabels[feature].en : featureLabels[feature].fr;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mb-5">
          <Lock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-foreground">
          {isEn ? `${label} — ${requiredPlan} plan required` : `${label} — Offre ${requiredPlan} requise`}
        </h2>

        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          {isEn
            ? `This feature is available starting from the ${requiredPlan} plan. You are currently on the ${plan.label} plan.`
            : `Cette fonctionnalité est disponible à partir de l'offre ${requiredPlan}. Vous êtes actuellement sur l'offre ${plan.label}.`}
        </p>

        <a
          href={`https://wa.me/221711387878?text=${encodeURIComponent(
            isEn
              ? `Hello, I would like to upgrade from ${plan.label} to ${requiredPlan}.`
              : `Bonjour, je souhaite passer de l'offre ${plan.label} à l'offre ${requiredPlan}.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-faciloop text-white font-semibold text-sm shadow-md hover:opacity-90 transition-opacity"
        >
          <span>{isEn ? `Upgrade to ${requiredPlan}` : `Passer à l'offre ${requiredPlan}`}</span>
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
