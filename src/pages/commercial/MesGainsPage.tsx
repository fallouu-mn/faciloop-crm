import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DollarSign, Award, Wallet, Calendar, Info,
  Calculator, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCommissions } from '@/hooks/commercial/useCommissions';
import { cn } from '../../lib/utils';

type Currency = 'XOF' | 'EUR' | 'USD';

const EXCHANGE_RATES: Record<Currency, number> = {
  XOF: 1,
  EUR: 1 / 655.957,
  USD: 1 / 600,
};

const CURRENCY_LABELS: Record<Currency, string> = {
  XOF: 'FCFA',
  EUR: 'EUR',
  USD: 'USD',
};

function formatMoney(amount: number, curr: Currency): string {
  const converted = Math.round(amount * EXCHANGE_RATES[curr]);
  return converted.toLocaleString('fr-FR') + ' ' + CURRENCY_LABELS[curr];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMonthKey(dateStr: string): string {
  if (!dateStr) return 'inconnu';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonthLabel(monthKey: string, isEn = false): string {
  if (monthKey === 'inconnu') return isEn ? 'Unknown Date' : 'Date inconnue';
  const [year, month] = monthKey.split('-');
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  return d.toLocaleDateString(isEn ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' });
}

function getCommissionRate(periodicite: string): number {
  if (periodicite === 'trimestriel') return 0.08;
  if (periodicite === 'annuel') return 0.10;
  return 0.05;
}

export function MesGainsPage() {
  const { t, i18n } = useTranslation();
  const { user, commissions, orgOffers, currency: globalCurrency, setCurrency: setGlobalCurrency } = useAuth();
  const { commissions: apiCommissions } = useCommissions();
  const currency = (Object.entries(CURRENCY_LABELS).find(([, v]) => v === globalCurrency)?.[0] || 'XOF') as Currency;
  const setCurrency = (c: Currency) => setGlobalCurrency(CURRENCY_LABELS[c]);
  const [activeTab, setActiveTab] = useState<'apercu' | 'simulateur' | 'historique'>('apercu');

  const isEn = i18n.language?.startsWith('en');

  // Filter commissions for current commercial
  const myCommissions = useMemo(() => {
    if (apiCommissions.length > 0) {
      return apiCommissions.map(c => ({
        id: c.id,
        commercialId: c.commercial_id,
        commercialNom: c.commercial_nom || 'Moi',
        clientNom: c.client_nom || 'Client',
        formule: c.formule || 'Pro',
        periodicite: c.periodicite || 'mensuel',
        montantVente: c.montant_vente,
        tauxCommission: c.taux_commission,
        montantCommission: c.montant_commission,
        dateVente: c.date_vente,
        statut: c.statut
      }));
    }
    return commissions.filter(c => c.commercialId === user?.id || user?.role === 'super_admin');
  }, [apiCommissions, commissions, user]);

  // Global Stats
  const stats = useMemo(() => {
    let caMensuel = 0, caTrimestriel = 0, caAnnuel = 0;
    let gainMensuel = 0, gainTrimestriel = 0, gainAnnuel = 0;
    let countMensuel = 0, countTrimestriel = 0, countAnnuel = 0;

    myCommissions.forEach(c => {
      if (c.periodicite === 'mensuel') {
        caMensuel += c.montantVente;
        gainMensuel += c.montantCommission;
        countMensuel++;
      } else if (c.periodicite === 'trimestriel') {
        caTrimestriel += c.montantVente;
        gainTrimestriel += c.montantCommission;
        countTrimestriel++;
      } else if (c.periodicite === 'annuel') {
        caAnnuel += c.montantVente;
        gainAnnuel += c.montantCommission;
        countAnnuel++;
      }
    });

    return {
      caMensuel, caTrimestriel, caAnnuel,
      gainMensuel, gainTrimestriel, gainAnnuel,
      countMensuel, countTrimestriel, countAnnuel,
      caTotal: caMensuel + caTrimestriel + caAnnuel,
      gainTotal: gainMensuel + gainTrimestriel + gainAnnuel,
      countTotal: countMensuel + countTrimestriel + countAnnuel,
    };
  }, [myCommissions]);

  // Group by month
  const gainsByMonth = useMemo(() => {
    const grouped: Record<string, { ca: number; gain: number; count: number; items: CommissionEntry[] }> = {};

    myCommissions.forEach((c) => {
      const mk = getMonthKey(c.dateVente);
      if (!grouped[mk]) grouped[mk] = { ca: 0, gain: 0, count: 0, items: [] };
      grouped[mk].ca += c.montantVente;
      grouped[mk].gain += c.montantCommission;
      grouped[mk].count += 1;
      grouped[mk].items.push(c);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, data]) => ({ monthKey, label: formatMonthLabel(monthKey, isEn), ...data }));
  }, [myCommissions, isEn]);

  // Simulator: use orgOffers for real prices
  const simPrices = useMemo(() => {
    if (orgOffers.length === 0) {
      return { mensuel: 150000, trimestriel: 405000, annuel: 1440000 };
    }
    const avgM = Math.round(orgOffers.reduce((a, o) => a + o.tarifs.mensuel, 0) / orgOffers.length);
    const avgT = Math.round(orgOffers.reduce((a, o) => a + o.tarifs.trimestriel, 0) / orgOffers.length);
    const avgA = Math.round(orgOffers.reduce((a, o) => a + o.tarifs.annuel, 0) / orgOffers.length);
    return { mensuel: avgM, trimestriel: avgT, annuel: avgA };
  }, [orgOffers]);

  const [simCountMensuel, setSimCountMensuel] = useState(5);
  const [simCountTrimestriel, setSimCountTrimestriel] = useState(3);
  const [simCountAnnuel, setSimCountAnnuel] = useState(2);

  const simResults = useMemo(() => {
    const caM = simCountMensuel * simPrices.mensuel;
    const caT = simCountTrimestriel * simPrices.trimestriel;
    const caA = simCountAnnuel * simPrices.annuel;
    return {
      caSimMensuel: caM, caSimTrimestriel: caT, caSimAnnuel: caA,
      gainSimMensuel: Math.round(caM * 0.05),
      gainSimTrimestriel: Math.round(caT * 0.08),
      gainSimAnnuel: Math.round(caA * 0.10),
      caSimTotal: caM + caT + caA,
      gainSimTotal: Math.round(caM * 0.05) + Math.round(caT * 0.08) + Math.round(caA * 0.10),
      countTotal: simCountMensuel + simCountTrimestriel + simCountAnnuel,
    };
  }, [simCountMensuel, simCountTrimestriel, simCountAnnuel, simPrices]);

  const tabs = [
    { key: 'apercu', label: isEn ? 'Overview' : 'Aperçu' },
    { key: 'simulateur', label: isEn ? 'Simulator' : 'Simulateur' },
    { key: 'historique', label: `${isEn ? 'Sales' : 'Ventes'} (${stats.countTotal})` },
  ] as const;

  return (
    <div className="space-y-4 font-sans">
      {/* Header & Currency selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            {isEn ? 'My Earnings & Commissions' : 'Mes gains & commissions'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {isEn ? 'Rates and commissions on subscriptions' : 'Barème et commissions sur abonnements'}
          </p>
        </div>
        <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
          {(['XOF', 'EUR', 'USD'] as Currency[]).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                currency === c
                  ? 'bg-gradient-faciloop text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {CURRENCY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Commission structure card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-lg overflow-hidden relative p-4">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Award className="h-40 w-40 text-white" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-orange-400" />
              </div>
              <span className="text-xs font-semibold tracking-wide uppercase text-orange-300">
                {isEn ? 'COMMISSION STRUCTURE' : 'BARÊME DE COMMISSION'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white font-bold">
              {isEn ? 'Automatic' : 'Automatique'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-medium mb-0.5">{isEn ? 'Monthly' : 'Mensuel'}</div>
              <div className="text-xl font-black text-emerald-400">5%</div>
              <div className="text-[9px] text-slate-400">{isEn ? 'per month' : 'sur chaque mois'}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-medium mb-0.5">{isEn ? 'Quarterly' : 'Trimestriel'}</div>
              <div className="text-xl font-black text-cyan-400">8%</div>
              <div className="text-[9px] text-slate-400">{isEn ? 'per quarter' : 'sur le trimestre'}</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-md p-2.5 border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-medium mb-0.5">{isEn ? 'Annual' : 'Annuel'}</div>
              <div className="text-xl font-black text-amber-400">10%</div>
              <div className="text-[9px] text-slate-400">{isEn ? 'per year' : "sur l'année"}</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-snug">
            {isEn ? 'Your earnings are calculated on the revenue generated by subscriptions subscribed by your clients.' : "Vos gains sont calculés sur le chiffre d'affaires généré par les abonnements souscrits par vos clients."}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-muted rounded-xl p-1 gap-0.5">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={cn(
              'flex-1 py-2 rounded-lg text-xs font-bold transition-all text-center',
              activeTab === t.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: APERÇU */}
      {activeTab === 'apercu' && (
        <div className="space-y-3">
          {/* Total Gains */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">{isEn ? 'Total Accumulated Earnings' : 'Gains totaux accumulés'}</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {formatMoney(stats.gainTotal, currency)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isEn 
                  ? `On a total revenue of ${formatMoney(stats.caTotal, currency)} (${stats.countTotal} sale${stats.countTotal > 1 ? 's' : ''})`
                  : `Sur un CA total de ${formatMoney(stats.caTotal, currency)} (${stats.countTotal} vente${stats.countTotal > 1 ? 's' : ''})`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Wallet className="h-6 w-6" />
            </div>
          </div>

          {/* Gains par mois */}
          {gainsByMonth.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> {isEn ? 'Earnings by period' : 'Gains par période'}
              </h4>
              {gainsByMonth.slice(0, 3).map((month) => (
                <div key={month.monthKey} className="rounded-xl border border-border p-3 flex items-center justify-between hover:border-primary/30 transition-colors">
                  <div>
                    <p className="text-xs font-semibold text-foreground capitalize">{month.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {isEn 
                        ? `${month.count} sale${month.count > 1 ? 's' : ''} • Rev: ${formatMoney(month.ca, currency)}`
                        : `${month.count} vente${month.count > 1 ? 's' : ''} • CA: ${formatMoney(month.ca, currency)}`}
                    </p>
                  </div>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatMoney(month.gain, currency)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Info versement */}
          <div className="rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {isEn 
                ? 'Commissions are credited at the subscription creation date and paid out at the end of the following month.'
                : "Les commissions sont attribuées à la date de création de l'abonnement et versées en fin de mois suivant."}
            </p>
          </div>

          {/* Breakdown par périodicité */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="rounded-xl border border-border p-3 space-y-1.5 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 font-bold">
                  {isEn ? 'Monthly (5%)' : 'Mensuel (5%)'}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">{stats.countMensuel} {isEn ? 'sub' : 'abo'}</span>
              </div>
              <p className="text-base font-extrabold text-foreground tabular-nums">{formatMoney(stats.gainMensuel, currency)}</p>
              <p className="text-[10px] text-muted-foreground">{isEn ? 'Rev: ' : 'CA: '}{formatMoney(stats.caMensuel, currency)}</p>
            </div>

            <div className="rounded-xl border border-border p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-400 border border-cyan-200 font-bold">
                  {isEn ? 'Quarterly (8%)' : 'Trimestriel (8%)'}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">{stats.countTrimestriel} {isEn ? 'sub' : 'abo'}</span>
              </div>
              <p className="text-base font-extrabold text-foreground tabular-nums">{formatMoney(stats.gainTrimestriel, currency)}</p>
              <p className="text-[10px] text-muted-foreground">{isEn ? 'Rev: ' : 'CA: '}{formatMoney(stats.caTrimestriel, currency)}</p>
            </div>

            <div className="rounded-xl border border-border p-3 space-y-1.5 hover:border-amber-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 font-bold">
                  {isEn ? 'Annual (10%)' : 'Annuel (10%)'}
                </span>
                <span className="text-[10px] text-muted-foreground font-semibold">{stats.countAnnuel} {isEn ? 'sub' : 'abo'}</span>
              </div>
              <p className="text-base font-extrabold text-foreground tabular-nums">{formatMoney(stats.gainAnnuel, currency)}</p>
              <p className="text-[10px] text-muted-foreground">{isEn ? 'Rev: ' : 'CA: '}{formatMoney(stats.caAnnuel, currency)}</p>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-xl border border-border p-3.5 space-y-2">
            <h4 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
              <Info className="h-3.5 w-3.5 text-primary" /> {isEn ? 'How to maximize your earnings?' : 'Comment maximiser vos gains ?'}
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
              <li>
                {isEn 
                  ? <>Focus on <strong>annual subscriptions (10%)</strong> to maximize your immediate commission.</>
                  : <>Privilégiez les <strong>abonnements annuels (10%)</strong> pour maximiser votre commission immédiate.</>}
              </li>
              <li>
                {isEn 
                  ? <>A quarterly subscription gives you <strong>8%</strong> on an amount 3× higher than a single month.</>
                  : <>Un abonnement trimestriel vous rapporte <strong>8%</strong> sur un montant 3× plus élevé qu'un mois unique.</>}
              </li>
              <li>
                {isEn 
                  ? <>Follow up on your clients renewals to maintain recurring commissions.</>
                  : <>Assurez le suivi du renouvellement de vos clients pour pérenniser vos commissions.</>}
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB: SIMULATEUR */}
      {activeTab === 'simulateur' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">{isEn ? 'Commission simulator' : 'Simulateur de commission'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 text-primary font-bold">
                {isEn ? 'Real-time offers' : 'Offres en temps réel'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {isEn 
                ? 'Calculate your earnings based on real pricing of available subscription plans.'
                : "Calculez vos gains selon les prix réels des formules d'abonnements disponibles."}
            </p>

            {/* Unit price breakdown */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-2 text-center space-y-0.5">
                <span className="text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-400 block">{isEn ? 'Monthly (5%)' : 'Mensuel (5%)'}</span>
                <span className="text-xs font-extrabold block tabular-nums text-foreground">{formatMoney(simPrices.mensuel, currency)}</span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block tabular-nums">+{formatMoney(Math.round(simPrices.mensuel * 0.05), currency)}/unit</span>
              </div>
              <div className="rounded-xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 p-2 text-center space-y-0.5">
                <span className="text-[9px] font-bold uppercase text-cyan-700 dark:text-cyan-400 block">{isEn ? 'Quarterly (8%)' : 'Trimestriel (8%)'}</span>
                <span className="text-xs font-extrabold block tabular-nums text-foreground">{formatMoney(simPrices.trimestriel, currency)}</span>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 block tabular-nums">+{formatMoney(Math.round(simPrices.trimestriel * 0.08), currency)}/unit</span>
              </div>
              <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-2 text-center space-y-0.5">
                <span className="text-[9px] font-bold uppercase text-amber-700 dark:text-amber-400 block">{isEn ? 'Annual (10%)' : 'Annuel (10%)'}</span>
                <span className="text-xs font-extrabold block tabular-nums text-foreground">{formatMoney(simPrices.annuel, currency)}</span>
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block tabular-nums">+{formatMoney(Math.round(simPrices.annuel * 0.10), currency)}/unit</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{isEn ? 'Monthly subscription sales' : "Ventes d'abonnements Mensuels"}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{simCountMensuel} × 5%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={simCountMensuel}
                    onChange={(e) => setSimCountMensuel(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 w-20 text-xs font-bold text-center rounded-lg border border-border bg-background px-2"
                  />
                  <div className="text-[11px] text-muted-foreground flex-1 flex justify-between">
                    <span>{isEn ? 'Rev: ' : 'CA: '}{formatMoney(simResults.caSimMensuel, currency)}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {isEn ? 'Gain: +' : 'Gain: +'}{formatMoney(simResults.gainSimMensuel, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{isEn ? 'Quarterly subscription sales' : "Ventes d'abonnements Trimestriels"}</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{simCountTrimestriel} × 8%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={simCountTrimestriel}
                    onChange={(e) => setSimCountTrimestriel(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 w-20 text-xs font-bold text-center rounded-lg border border-border bg-background px-2"
                  />
                  <div className="text-[11px] text-muted-foreground flex-1 flex justify-between">
                    <span>{isEn ? 'Rev: ' : 'CA: '}{formatMoney(simResults.caSimTrimestriel, currency)}</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400">
                      {isEn ? 'Gain: +' : 'Gain: +'}{formatMoney(simResults.gainSimTrimestriel, currency)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{isEn ? 'Annual subscription sales' : "Ventes d'abonnements Annuels"}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{simCountAnnuel} × 10%</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={simCountAnnuel}
                    onChange={(e) => setSimCountAnnuel(Math.max(0, parseInt(e.target.value) || 0))}
                    className="h-8 w-20 text-xs font-bold text-center rounded-lg border border-border bg-background px-2"
                  />
                  <div className="text-[11px] text-muted-foreground flex-1 flex justify-between">
                    <span>{isEn ? 'Rev: ' : 'CA: '}{formatMoney(simResults.caSimAnnuel, currency)}</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {isEn ? 'Gain: +' : 'Gain: +'}{formatMoney(simResults.gainSimAnnuel, currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulation result */}
            <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 p-3.5 space-y-1 text-center">
              <p className="text-xs text-muted-foreground font-medium">
                {isEn ? `Total estimated earnings (${simResults.countTotal} sales)` : `Gain estimé total (${simResults.countTotal} ventes)`}
              </p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                +{formatMoney(simResults.gainSimTotal, currency)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isEn 
                  ? `For a total revenue generated of ${formatMoney(simResults.caSimTotal, currency)}`
                  : `Pour un chiffre d'affaires total généré de ${formatMoney(simResults.caSimTotal, currency)}`}
              </p>
            </div>

            {/* Comparative grid */}
            {orgOffers.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold text-foreground">
                  {isEn ? 'Earnings comparison matrix by plan' : 'Grille comparative des gains par formule'}
                </h4>
                <div className="rounded-xl border border-border overflow-hidden text-xs">
                  <div className="grid grid-cols-4 bg-muted/60 p-2 font-bold text-[10px] text-muted-foreground">
                    <div>{isEn ? 'Plan' : 'Formule'}</div>
                    <div className="text-center">{isEn ? 'Monthly (5%)' : 'Mensuel (5%)'}</div>
                    <div className="text-center">{isEn ? 'Quarterly (8%)' : 'Trimestriel (8%)'}</div>
                    <div className="text-center">{isEn ? 'Annual (10%)' : 'Annuel (10%)'}</div>
                  </div>
                  {orgOffers.filter(o => o.actif).map(off => (
                    <div key={off.id} className="grid grid-cols-4 p-2 border-t border-border/40 items-center">
                      <div className="font-bold text-foreground truncate">{off.nom}</div>
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+{formatMoney(Math.round(off.tarifs.mensuel * 0.05), currency)}</span>
                        <span className="block text-[9px] text-muted-foreground">{formatMoney(off.tarifs.mensuel, currency)}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-cyan-600 dark:text-cyan-400">+{formatMoney(Math.round(off.tarifs.trimestriel * 0.08), currency)}</span>
                        <span className="block text-[9px] text-muted-foreground">{formatMoney(off.tarifs.trimestriel, currency)}</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">+{formatMoney(Math.round(off.tarifs.annuel * 0.10), currency)}</span>
                        <span className="block text-[9px] text-muted-foreground">{formatMoney(off.tarifs.annuel, currency)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: HISTORIQUE */}
      {activeTab === 'historique' && (
        <div className="space-y-4">
          {myCommissions.length === 0 ? (
            <div className="rounded-2xl border border-border p-8 text-center space-y-2">
              <Wallet className="h-10 w-10 text-muted-foreground mx-auto" />
              <h4 className="text-sm font-bold text-foreground">{isEn ? 'No commission recorded' : 'Aucune commission enregistrée'}</h4>
              <p className="text-xs text-muted-foreground">
                {isEn 
                  ? 'Your sold subscriptions and calculated commissions will appear here.'
                  : "Vos abonnements vendus et vos commissions calculées s'afficheront ici."}
              </p>
            </div>
          ) : (
            gainsByMonth.map((month) => (
              <div key={month.monthKey} className="space-y-2">
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground capitalize">{month.label}</span>
                    <span className="text-[9px] px-1.5 py-0 rounded-full bg-muted border border-border text-muted-foreground font-bold">
                      {month.count} {isEn ? `sale${month.count > 1 ? 's' : ''}` : `vente${month.count > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{formatMoney(month.gain, currency)}
                  </span>
                </div>

                {month.items.map((c) => (
                  <div key={c.id} className="rounded-xl border border-border p-3 flex items-center justify-between gap-2 ml-2 hover:border-primary/40 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground truncate">{c.clientNom}</span>
                        <span className={cn(
                          'text-[9px] px-1.5 py-0 rounded-full font-bold border',
                          c.periodicite === 'annuel' && 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
                          c.periodicite === 'trimestriel' && 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-200',
                          c.periodicite === 'mensuel' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
                        )}>
                          {isEn && c.periodicite === 'annuel' ? 'Annual' : isEn && c.periodicite === 'trimestriel' ? 'Quarterly' : isEn && c.periodicite === 'mensuel' ? 'Monthly' : c.periodicite} ({c.tauxCommission}%)
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {isEn ? 'Plan ' : 'Formule '}{c.formule} • {formatMoney(c.montantVente, currency)} • {formatDate(c.dateVente)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-muted-foreground block">Commission</span>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        +{formatMoney(c.montantCommission, currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
