import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, ShieldAlert, Globe2, TrendingUp, Activity } from 'lucide-react';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DateRange, isInDateRange, searchParamsToDateRange, buildFilteredUrl } from '../../lib/dateFilter';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { mockTenants, mockFactures, mockActivity } from '../../lib/mockSuperAdmin';

export const DashboardSuperAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState<DateRange>(() => searchParamsToDateRange(searchParams));
  const [devise, setDevise] = useState<DeviseCode>('XOF');

  const filteredTenants = useMemo(() =>
    mockTenants.filter(t => isInDateRange(t.created_at, period)),
    [period]
  );

  const filteredFactures = useMemo(() =>
    mockFactures.filter(f => isInDateRange(f.date_emission, period)),
    [period]
  );

  const filteredActivity = useMemo(() =>
    mockActivity.filter(a => isInDateRange(a.date, period)),
    [period]
  );

  const activeCount = filteredTenants.filter(t => t.statut === 'actif').length;
  const suspendedCount = filteredTenants.filter(t => t.statut === 'suspendu').length;
  const totalTenants = filteredTenants.length;
  const mrrXof = filteredFactures
    .filter(f => f.statut === 'payee')
    .reduce((sum, f) => sum + f.montant_xof, 0);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Super-Admin
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Vue globale de la plateforme SaaS Multi-Tenant
          </p>
        </div>
        <CurrencyToggle value={devise} onChange={setDevise} />
      </div>

      {/* Period Filter */}
      <PeriodFilter value={period} onChange={setPeriod} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period, { statut: 'actif' }))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Actives</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-500">{activeCount}</span>
            <span className="text-xs text-muted-foreground">organisations</span>
          </div>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period, { statut: 'suspendu' }))}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2 text-left hover:border-destructive/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-destructive">Suspendues</span>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-destructive">{suspendedCount}</span>
            <span className="text-xs text-muted-foreground">impayés</span>
          </div>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe2 className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">{totalTenants}</span>
            <span className="text-xs text-muted-foreground">tenants</span>
          </div>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/facturation', period))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Revenus</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{fmt(mrrXof)}</span>
          </div>
        </button>
      </div>

      {/* Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Activité Récente</h2>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-y-auto">
            {filteredActivity.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">Aucune activité sur cette période</div>
            ) : (
              filteredActivity.map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    item.type === 'success' ? 'bg-emerald-500' :
                    item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{item.text}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accès Rapides */}
        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Accès Rapides</h2>
          </div>
          <div className="p-3 space-y-2">
            <button
              onClick={() => navigate('/super-admin/organisations')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Organisations</span>
                <p className="text-xs text-muted-foreground">Gérer les tenants</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/super-admin/facturation')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Facturation</span>
                <p className="text-xs text-muted-foreground">Paiements & abonnements</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/super-admin/statistiques')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <Globe2 className="h-4 w-4" />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">Statistiques</span>
                <p className="text-xs text-muted-foreground">Métriques plateforme</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Top Organisations */}
      <div className="rounded-xl border border-border bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Top Organisations</h2>
          <button
            onClick={() => navigate('/super-admin/organisations')}
            className="text-xs text-primary hover:underline"
          >
            Voir tout
          </button>
        </div>
        <div className="divide-y divide-border">
          {mockTenants.filter(t => t.statut === 'actif').slice(0, 4).map((t) => {
            const tenantMrr = filteredFactures
              .filter(f => f.tenant_id === t.id && f.statut === 'payee')
              .reduce((sum, f) => sum + f.montant_xof, 0);
            return (
              <div key={t.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {t.nom[0]}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{t.nom}</span>
                    <p className="text-xs text-muted-foreground">{t.formule}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-foreground">{fmt(tenantMrr)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
