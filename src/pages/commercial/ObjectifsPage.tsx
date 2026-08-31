import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useObjectifs } from '@/hooks/commercial/useObjectifs';
import { Target, TrendingUp, Award, Info, Goal } from 'lucide-react';

type Currency = 'XOF' | 'EUR' | 'USD';
const CURRENCY_LABELS: Record<Currency, string> = { XOF: 'FCFA', EUR: 'EUR', USD: 'USD' };
const EXCHANGE_RATES: Record<Currency, number> = { XOF: 1, EUR: 1 / 655.957, USD: 1 / 600 };

function formatMoney(amount: number, curr: Currency): string {
  return Math.round(amount * EXCHANGE_RATES[curr]).toLocaleString('fr-FR') + ' ' + CURRENCY_LABELS[curr];
}

function getProgressColor(pct: number): string {
  if (pct >= 100) return 'bg-emerald-500';
  if (pct >= 80) return 'bg-blue-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}

function getProgressText(pct: number, isEn: boolean): string {
  if (pct >= 100) return isEn ? 'Goal reached!' : 'Objectif atteint !';
  if (pct >= 80) return isEn ? 'Almost reached' : 'Presque atteint';
  if (pct >= 50) return isEn ? 'On track' : 'En bonne voie';
  return isEn ? 'Behind schedule' : 'En retard';
}

const TYPE_LABELS: Record<string, Record<string, string>> = {
  ca: { fr: 'Chiffre d\'affaires', en: 'Turnover / Revenue' },
  ventes: { fr: 'Ventes conclues', en: 'Closed Deals' },
  prospects: { fr: 'Prospects créés', en: 'Prospects Created' },
  rdv: { fr: 'RDV réalisés', en: 'Completed Meetings' },
};

const TYPE_ICONS: Record<string, string> = {
  ca: 'FCFA',
  ventes: 'ventes',
  prospects: 'prospects',
  rdv: 'RDV',
};

export const ObjectifsPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const { user, objectifs, currency, setCurrency } = useAuth();
  const { objectifs: apiObjectifs } = useObjectifs();
  const activeCurrency = (Object.entries(CURRENCY_LABELS).find(([, v]) => v === currency)?.[0] || 'XOF') as Currency;

  // Backend-ready: filter objectifs for current commercial only
  const myObjectifs = useMemo(() => {
    if (apiObjectifs.length > 0) {
      return apiObjectifs.map(o => ({
        id: o.id,
        commercialId: o.commercial_id,
        commercialNom: o.commercial_nom || 'Moi',
        periode: o.periode,
        type: o.type,
        objectif: o.objectif,
        realise: o.realise,
        statut: o.statut,
        description: `Objectif ${o.periode} ${o.type}`
      }));
    }
    if (!user) return [];
    return objectifs.filter(o => o.commercialId === user.id);
  }, [apiObjectifs, objectifs, user]);

  // Summary stats
  const summary = useMemo(() => {
    const total = myObjectifs.length;
    const atteints = myObjectifs.filter(o => o.realise >= o.objectif).length;
    const enCours = total - atteints;
    const avgProgress = total > 0
      ? Math.round(myObjectifs.reduce((sum, o) => sum + Math.min(100, Math.round((o.realise / o.objectif) * 100)), 0) / total)
      : 0;
    return { total, atteints, enCours, avgProgress };
  }, [myObjectifs]);

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Mes Objectifs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
            Objectifs définis par votre responsable commercial
          </p>
        </div>

        <div className="flex items-center rounded-2xl bg-muted/80 p-1 border border-border/80 text-xs font-black shrink-0">
          {(['XOF', 'EUR', 'USD'] as Currency[]).map(c => (
            <button
              key={c}
              onClick={() => setCurrency(CURRENCY_LABELS[c])}
              className={`rounded-xl px-2.5 py-1 text-[10px] sm:text-xs font-black transition-all ${
                currency === CURRENCY_LABELS[c]
                  ? 'bg-gradient-faciloop text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {CURRENCY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      {myObjectifs.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm text-center space-y-1">
            <Goal className="w-5 h-5 text-primary mx-auto" />
            <p className="text-2xl font-black text-foreground">{summary.total}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Objectifs</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm text-center space-y-1">
            <Award className="w-5 h-5 text-emerald-500 mx-auto" />
            <p className="text-2xl font-black text-emerald-600">{summary.atteints}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Atteints</p>
          </div>
          <div className="p-4 rounded-2xl border border-border bg-card shadow-sm text-center space-y-1">
            <TrendingUp className="w-5 h-5 text-blue-500 mx-auto" />
            <p className="text-2xl font-black text-blue-600">{summary.avgProgress}%</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Progression moy.</p>
          </div>
        </div>
      )}

      {/* Objectifs list */}
      {myObjectifs.length === 0 ? (
        <div className="rounded-2xl border border-border p-8 text-center space-y-3">
          <Goal className="w-12 h-12 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-bold text-foreground">Aucun objectif défini</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Vos objectifs seront définis par votre administrateur d'organisation.
            Ils apparaîtront ici dès qu'ils seront configurés.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {myObjectifs.map(obj => {
            const pct = obj.objectif > 0 ? Math.min(100, Math.round((obj.realise / obj.objectif) * 100)) : 0;
            const isCA = obj.type === 'ca';
            const valueText = isCA
              ? `${formatMoney(obj.realise, activeCurrency)} / ${formatMoney(obj.objectif, activeCurrency)}`
              : `${obj.realise} / ${obj.objectif} ${TYPE_ICONS[obj.type] || ''}`;

            return (
              <div
                key={obj.id}
                className="p-4 sm:p-5 rounded-2xl border border-border bg-card shadow-sm space-y-3 hover:border-primary/30 transition-all"
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      pct >= 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                    }`}>
                      <Goal className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-foreground">
                        {TYPE_LABELS[obj.type]?.[isEn ? 'en' : 'fr'] || obj.type}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        {isEn ? 'Period' : 'Période'} : {obj.periode}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    pct >= 100 ? 'bg-emerald-500/10 text-emerald-600' :
                    pct >= 80 ? 'bg-blue-500/10 text-blue-600' :
                    pct >= 50 ? 'bg-amber-500/10 text-amber-600' :
                    'bg-rose-500/10 text-rose-600'
                  }`}>
                    {getProgressText(pct, isEn)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground tabular-nums">{valueText}</span>
                    <span className="font-black text-foreground tabular-nums">{pct}%</span>
                  </div>
                  <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getProgressColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {isEn
            ? 'Objectives are set and updated by your organization administrator. Your progress is calculated automatically from your sales and activities.'
            : "Les objectifs sont définis et mis à jour par votre administrateur d'organisation. Votre progression est calculée automatiquement à partir de vos ventes et activités."}
        </p>
      </div>
    </div>
  );
};
