import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, FileText, Building2, BarChart3, ArrowUpRight } from 'lucide-react';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DateRange, isInDateRange, searchParamsToDateRange, buildFilteredUrl } from '../../lib/dateFilter';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { FormuleConfig, getFormules } from '../../services/formulesSaas';

interface TenantData {
  id: string;
  nom: string;
  formule: string;
  statut: 'actif' | 'suspendu';
  users_count: number;
  created_at: string;
}

interface FactureData {
  id: string;
  tenant_id: string;
  tenant_nom: string;
  formule: string;
  montant_xof: number;
  statut: 'payee' | 'en_attente' | 'impayee';
  date_emission: string;
  date_echeance: string;
}

const mockTenants: TenantData[] = [];
const mockFactures: FactureData[] = [];

export const StatistiquesPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = Boolean(i18n.language?.startsWith('en'));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState<DateRange>(() => searchParamsToDateRange(searchParams));
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [formules, setFormules] = useState<FormuleConfig[]>([]);

  React.useEffect(() => {
    getFormules().then(setFormules).catch(() => {});
  }, []);

  const filteredFactures = useMemo(() =>
    mockFactures.filter(f => isInDateRange(f.date_emission, period)),
    [period]
  );

  const filteredTenants = useMemo(() =>
    mockTenants.filter(t => isInDateRange(t.created_at, period)),
    [period]
  );

  const totalRevenu = filteredFactures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montant_xof, 0);
  const activeOrgs = filteredTenants.filter(t => t.statut === 'actif').length;
  const totalFactures = filteredFactures.length;
  const impayeRate = filteredFactures.length > 0
    ? ((filteredFactures.filter(f => f.statut === 'impayee').length / filteredFactures.length) * 100).toFixed(1)
    : '0';

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const revenueByMonth = useMemo(() => {
    const map = new Map<string, number>();
    filteredFactures
      .filter(f => f.statut === 'payee')
      .forEach(f => {
        const month = f.date_emission.substring(0, 7);
        map.set(month, (map.get(month) || 0) + f.montant_xof);
      });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, montant]) => ({
        mois: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
        montant,
      }));
  }, [filteredFactures]);

  const maxRevenue = Math.max(...revenueByMonth.map(r => r.montant), 1);

  const topTenants = useMemo(() => {
    const map = new Map<string, { nom: string; formule: string; total: number }>();
    filteredFactures
      .filter(f => f.statut === 'payee')
      .forEach(f => {
        const existing = map.get(f.tenant_id);
        if (existing) {
          existing.total += f.montant_xof;
        } else {
          map.set(f.tenant_id, { nom: f.tenant_nom, formule: f.formule, total: f.montant_xof });
        }
      });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [filteredFactures]);

  const formulaDistribution = useMemo(() => {
    return formules.map(f => ({
      ...f,
      count: filteredTenants.filter(t => t.formule === f.code).length,
      revenu: filteredFactures
        .filter(fa => fa.formule === f.code && fa.statut === 'payee')
        .reduce((s, fa) => s + fa.montant_xof, 0),
    }));
  }, [formules, filteredTenants, filteredFactures]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Statistiques Plateforme</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Métriques globales et performance SaaS
          </p>
        </div>
        <CurrencyToggle value={devise} onChange={setDevise} />
      </div>

      {/* Period Filter */}
      <PeriodFilter value={period} onChange={setPeriod} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/facturation', period))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Revenus</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{fmt(totalRevenu)}</span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">période sélectionnée</span>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period, { statut: 'actif' }))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Orgs Actives</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{activeOrgs}</span>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/facturation', period))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Factures</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{totalFactures}</span>
        </button>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{isEn ? 'Unpaid Rate' : 'Taux Impayé'}</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{impayeRate}%</span>
        </div>
      </div>

      {/* Revenue Chart + Top Tenants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">
              {isEn ? 'Revenue Trend' : 'Évolution des Revenus'}
            </h2>
          </div>
          <div className="p-4">
            {revenueByMonth.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                {isEn ? 'No data during this period' : 'Aucune donnée sur cette période'}
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2 h-40">
                {revenueByMonth.map((r) => (
                  <div key={r.mois} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {fmt(r.montant)}
                    </span>
                    <div className="w-full flex justify-center">
                      <div
                        className="w-full max-w-8 bg-gradient-faciloop rounded-t-md transition-all"
                        style={{ height: `${(r.montant / maxRevenue) * 100}px` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground capitalize">{r.mois}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Top Tenants</h2>
            <button
              onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period))}
              className="text-xs text-primary hover:underline"
            >
              {isEn ? 'View all' : 'Voir tout'}
            </button>
          </div>
          <div className="divide-y divide-border">
            {topTenants.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">{isEn ? 'No data' : 'Aucune donnée'}</div>
            ) : (
              topTenants.map((t, idx) => (
                <div key={t.nom} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-5">{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {t.nom[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.nom}</p>
                    <span className="text-xs text-muted-foreground">{t.formule}</span>
                  </div>
                  <span className="text-xs font-bold text-foreground shrink-0">{fmt(t.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Répartition par Formule */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">
            {isEn ? 'Distribution by Plan' : 'Répartition par Formule'}
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {formulaDistribution.map((f) => {
              const colors: Record<string, string> = {
                Pro: 'bg-blue-500',
                Business: 'bg-amber-500',
                Premium: 'bg-emerald-500',
              };
              const color = colors[f.code] || 'bg-slate-500';
              return (
                <div key={f.code} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm font-semibold text-foreground">{f.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{fmt(f.prix_xof)}{isEn ? '/mo' : '/mois'}</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold text-foreground">{f.count}</span>
                      <span className="text-xs text-muted-foreground ml-1">tenant{f.count > 1 ? 's' : ''}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{fmt(f.revenu)}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all`}
                      style={{ width: `${filteredTenants.length > 0 ? (f.count / filteredTenants.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
