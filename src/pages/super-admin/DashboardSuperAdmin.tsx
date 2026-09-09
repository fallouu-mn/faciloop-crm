import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldAlert, Globe2, TrendingUp, Clock, Crown, PieChart as PieChartIcon, AlertTriangle, UserPlus } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DateRange, isInDateRange, searchParamsToDateRange, buildFilteredUrl } from '../../lib/dateFilter';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';

interface TenantRow {
  id: string;
  nom: string;
  statut: 'en_attente' | 'actif' | 'suspendu' | 'inactif';
  formule_code?: string;
  periodicite?: string;
  prix_abonnement?: number;
  statut_abonnement?: string;
  date_fin_abonnement?: string;
  created_at: string;
}

export const DashboardSuperAdmin: React.FC = () => {
  const { t } = useTranslation('superAdmin');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState<DateRange>(() => searchParamsToDateRange(searchParams));
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgs = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .select('id, nom, statut, formule_code, periodicite, prix_abonnement, statut_abonnement, date_fin_abonnement, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) {
      const today = new Date();
      const expiredIds: string[] = [];
      const updated = data.map(row => {
        if (
          row.statut_abonnement === 'actif' &&
          row.date_fin_abonnement &&
          new Date(row.date_fin_abonnement) < today
        ) {
          expiredIds.push(row.id);
          return { ...row, statut_abonnement: 'expire' };
        }
        return row;
      });
      if (expiredIds.length > 0) {
        supabase
          .from('organizations')
          .update({ statut_abonnement: 'expire' })
          .in('id', expiredIds)
          .then(() => {});
      }
      setTenants(updated);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrgs(); }, []);
  useRefetchOnFocus(fetchOrgs);

  const filteredTenants = useMemo(() =>
    tenants.filter(row => isInDateRange(row.created_at, period)),
    [tenants, period]
  );

  const activeCount = filteredTenants.filter(row => row.statut === 'actif').length;
  const suspendedCount = filteredTenants.filter(row => row.statut === 'suspendu').length;
  const pendingCount = filteredTenants.filter(row => row.statut === 'en_attente').length;
  const totalTenants = filteredTenants.length;

  const caAbonnements = useMemo(() =>
    filteredTenants
      .filter(row => row.prix_abonnement && row.prix_abonnement > 0)
      .reduce((total, row) => total + (row.prix_abonnement || 0), 0),
    [filteredTenants]
  );

  const FORMULE_COLORS: Record<string, string> = {
    pro: '#6366f1',
    business: '#f59e0b',
    premium: '#10b981',
  };
  const DEFAULT_COLOR = '#94a3b8';

  const repartitionFormule = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTenants.forEach(row => {
      if (row.formule_code) {
        counts[row.formule_code] = (counts[row.formule_code] || 0) + 1;
      }
    });
    const sansFormule = filteredTenants.filter(row => !row.formule_code).length;
    const data = Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: FORMULE_COLORS[name.toLowerCase()] || DEFAULT_COLOR,
    }));
    if (sansFormule > 0) {
      data.push({ name: t('dashboard.pieNoFormula'), value: sansFormule, color: DEFAULT_COLOR });
    }
    return data;
  }, [filteredTenants, t]);

  const expiringBientot = useMemo(() => {
    const today = new Date();
    const in30 = new Date(today.getTime() + 30 * 86400000);
    return tenants.filter(row =>
      row.statut_abonnement === 'actif' &&
      row.date_fin_abonnement &&
      new Date(row.date_fin_abonnement) >= today &&
      new Date(row.date_fin_abonnement) <= in30
    );
  }, [tenants]);

  const dernieresInscriptions = useMemo(() =>
    [...tenants].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [tenants]
  );

  const activeSubscriptions = tenants.filter(row => row.statut_abonnement === 'actif').length;
  const expiredSubscriptions = tenants.filter(row => row.statut_abonnement === 'expire').length;

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const statusLabel = (statut: string) => {
    if (statut === 'actif') return t('status.actif');
    if (statut === 'en_attente') return t('status.en_attente');
    return t('status.suspendu');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted/60 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-muted/40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('dashboard.title')}</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {t('badge')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <CurrencyToggle value={devise} onChange={setDevise} />
      </div>

      <PeriodFilter value={period} onChange={setPeriod} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('dashboard.kpiOrgs')}</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe2 className="h-4 w-4 text-primary" />
            </div>
          </div>
          <span className="text-2xl font-bold text-foreground">{totalTenants}</span>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period, { statut: 'actif' }))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('dashboard.kpiActives')}</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-500">{activeCount}</span>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period, { statut: 'suspendu' }))}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2 text-left hover:border-destructive/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-destructive">{t('dashboard.kpiSuspended')}</span>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <span className="text-2xl font-bold text-destructive">{suspendedCount}</span>
        </button>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/facturation', period))}
          className="rounded-xl border border-border bg-card p-4 space-y-2 text-left hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('dashboard.kpiRevenue')}</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{fmt(caAbonnements)}</span>
            <p className="text-[10px] text-muted-foreground mt-0.5">{t('dashboard.kpiRevenueSub')}</p>
          </div>
        </button>
      </div>

      {/* Pending */}
      {pendingCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/super-admin/organisations?statut=en_attente')}
            className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2 text-left hover:border-amber-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-amber-600">{t('dashboard.pendingActivation')}</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
              <span className="text-xs text-muted-foreground">{t('dashboard.pendingOrg', { count: pendingCount })}</span>
            </div>
          </button>
        </div>
      )}

      {/* Pie + Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">{t('dashboard.pieTitle')}</h2>
          </div>
          {repartitionFormule.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t('dashboard.pieNoData')}</div>
          ) : (
            <div className="p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-48 h-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={repartitionFormule} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {repartitionFormule.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {repartitionFormule.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">{t('dashboard.quickAccess')}</h2>
          </div>
          <div className="p-3 space-y-2">
            {[
              { path: '/super-admin/organisations', icon: Building2, label: t('dashboard.quickOrgs'), sub: t('dashboard.quickOrgsSub'), color: 'bg-gradient-faciloop text-white' },
              { path: '/super-admin/abonnements', icon: Crown, label: t('dashboard.quickSubs'), sub: t('dashboard.quickSubsSub'), color: 'bg-amber-500/10 text-amber-500' },
              { path: '/super-admin/facturation', icon: TrendingUp, label: t('dashboard.quickBilling'), sub: t('dashboard.quickBillingSub'), color: 'bg-blue-500/10 text-blue-500' },
            ].map(({ path, icon: Icon, label, sub, color }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
              >
                <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Renewals + Latest */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-foreground">{t('dashboard.renewSection')}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-600 font-medium">{t('dashboard.renewActive', { count: activeSubscriptions })}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-destructive font-medium">{t('dashboard.renewExpired', { count: expiredSubscriptions })}</span>
            </div>
          </div>
          {expiringBientot.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t('dashboard.renewEmpty')}</div>
          ) : (
            <div className="divide-y divide-border">
              {expiringBientot.map(row => {
                const daysLeft = Math.ceil((new Date(row.date_fin_abonnement!).getTime() - Date.now()) / 86400000);
                return (
                  <button
                    key={row.id}
                    onClick={() => navigate(`/super-admin/organisations/${row.id}`)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {row.nom[0]}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-foreground truncate block">{row.nom}</span>
                        <span className="text-xs text-muted-foreground">
                          {row.formule_code} / {row.periodicite}
                          {row.prix_abonnement ? ` — ${fmt(row.prix_abonnement)}` : ''}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                      daysLeft <= 7 ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {t('dashboard.daysLeft', { count: daysLeft })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">{t('dashboard.latestSection')}</h2>
            </div>
            <button onClick={() => navigate('/super-admin/organisations')} className="text-xs text-primary hover:underline">
              {t('dashboard.seeAll')}
            </button>
          </div>
          {dernieresInscriptions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">{t('dashboard.latestEmpty')}</div>
          ) : (
            <div className="divide-y divide-border">
              {dernieresInscriptions.map(row => (
                <button
                  key={row.id}
                  onClick={() => navigate(`/super-admin/organisations/${row.id}`)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {row.nom[0]}
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-foreground truncate block">{row.nom}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleDateString()}
                        {row.formule_code ? ` · ${row.formule_code}` : ''}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    row.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-600'
                    : row.statut === 'en_attente' ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-destructive/10 text-destructive'
                  }`}>
                    {statusLabel(row.statut)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
