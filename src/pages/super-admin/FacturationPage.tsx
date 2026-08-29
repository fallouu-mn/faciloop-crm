import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CreditCard, TrendingUp, Search, Download, Clock, Crown } from 'lucide-react';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DateRange, isInDateRange, searchParamsToDateRange } from '../../lib/dateFilter';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { downloadCsv } from '../../lib/exportCsv';
import { supabase } from '../../lib/supabase';

interface OrgPaiement {
  id: string;
  nom: string;
  formule_code: string | null;
  periodicite: string | null;
  prix_abonnement: number | null;
  date_debut_abonnement: string | null;
  date_fin_abonnement: string | null;
  statut_abonnement: string | null;
  statut: string;
  created_at: string;
}

type FilterStatut = 'tous' | 'actif' | 'expire' | 'suspendu' | 'inactif';

export const FacturationPage: React.FC = () => {
  const { t } = useTranslation('superAdmin');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState<DateRange>(() => searchParamsToDateRange(searchParams));
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<FilterStatut>('tous');
  const [orgs, setOrgs] = useState<OrgPaiement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, nom, formule_code, periodicite, prix_abonnement, date_debut_abonnement, date_fin_abonnement, statut_abonnement, statut, created_at')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const today = new Date();
        const expiredIds: string[] = [];
        const updated = data.map(o => {
          if (o.statut_abonnement === 'actif' && o.date_fin_abonnement && new Date(o.date_fin_abonnement) < today) {
            expiredIds.push(o.id);
            return { ...o, statut_abonnement: 'expire' };
          }
          return o;
        });
        if (expiredIds.length > 0) {
          supabase.from('organizations').update({ statut_abonnement: 'expire' }).in('id', expiredIds).then(() => {});
        }
        setOrgs(updated);
      }
      setLoading(false);
    };
    fetchOrgs();
  }, []);

  const withAbonnement = useMemo(() => orgs.filter(o => o.prix_abonnement && o.prix_abonnement > 0), [orgs]);

  const filtered = useMemo(() =>
    withAbonnement.filter(o => {
      const matchSearch = o.nom.toLowerCase().includes(search.toLowerCase());
      const matchStatut = filterStatut === 'tous' || o.statut_abonnement === filterStatut;
      const matchDate = isInDateRange(o.date_debut_abonnement || o.created_at, period);
      return matchSearch && matchStatut && matchDate;
    }),
    [withAbonnement, search, filterStatut, period]
  );

  const caTotal = filtered.reduce((s, o) => s + (o.prix_abonnement || 0), 0);
  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const statutLabel = (s: string | null) => {
    if (s === 'actif') return t('facturation.statusActif');
    if (s === 'expire') return t('facturation.statusExpire');
    if (s === 'suspendu') return t('facturation.statusSuspendu');
    return t('facturation.statusInactif');
  };

  const statutClass = (s: string | null) => {
    if (s === 'actif') return 'bg-emerald-500/10 text-emerald-600';
    if (s === 'expire') return 'bg-destructive/10 text-destructive';
    if (s === 'suspendu') return 'bg-amber-500/10 text-amber-600';
    return 'bg-muted text-muted-foreground';
  };

  const handleExportCsv = () => {
    const headers = [
      t('facturation.csvCompany'),
      t('facturation.csvFormula'),
      t('facturation.csvPeriod'),
      t('facturation.csvAmount', { devise }),
      t('facturation.csvStart'),
      t('facturation.csvEnd'),
      t('facturation.csvStatus'),
    ];
    const rows = filtered.map(o => [
      o.nom,
      o.formule_code || '-',
      o.periodicite || '-',
      String(convertAmount(o.prix_abonnement || 0, 'XOF', devise)),
      o.date_debut_abonnement || '-',
      o.date_fin_abonnement || '-',
      statutLabel(o.statut_abonnement),
    ]);
    downloadCsv(`paiements_abonnements_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted/60 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-muted/40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('facturation.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('facturation.subtitle')} ({t('facturation.subscriptions', { count: filtered.length })})
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{t('facturation.exportCsv')}</span>
          </button>
        </div>
      </div>

      <PeriodFilter value={period} onChange={setPeriod} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('facturation.kpiRevenue')}</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <span className="text-lg font-bold text-foreground">{fmt(caTotal)}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('facturation.kpiTransactions')}</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <span className="text-lg font-bold text-foreground">{filtered.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('facturation.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground transition-all"
          />
        </div>
        <div className="inline-flex items-center rounded-full bg-muted p-1 border border-border text-sm">
          {(['tous', 'actif', 'expire', 'suspendu'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatut === s ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'tous' ? t('facturation.filterAll') : statutLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr className="text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">{t('facturation.colCompany')}</th>
              <th className="px-4 py-3">{t('facturation.colFormula')}</th>
              <th className="px-4 py-3">{t('facturation.colPeriod')}</th>
              <th className="px-4 py-3">{t('facturation.colAmount')}</th>
              <th className="px-4 py-3">{t('facturation.colStart')}</th>
              <th className="px-4 py-3">{t('facturation.colEnd')}</th>
              <th className="px-4 py-3">{t('facturation.colStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((o) => {
              const isExpiringSoon = o.statut_abonnement === 'actif' &&
                o.date_fin_abonnement &&
                new Date(o.date_fin_abonnement).getTime() - Date.now() < 30 * 86400000;
              return (
                <tr
                  key={o.id}
                  onClick={() => navigate(`/super-admin/organisations/${o.id}`)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {o.nom[0]}
                      </div>
                      <span className="font-medium text-foreground">{o.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1 w-fit">
                      <Crown className="h-3 w-3" />
                      {o.formule_code || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs capitalize">{o.periodicite || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{fmt(o.prix_abonnement || 0)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {o.date_debut_abonnement ? new Date(o.date_debut_abonnement).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      {isExpiringSoon && <Clock className="h-3 w-3" />}
                      {o.date_fin_abonnement ? new Date(o.date_fin_abonnement).toLocaleDateString() : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutClass(o.statut_abonnement)}`}>
                      {statutLabel(o.statut_abonnement)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">{t('facturation.noResults')}</div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((o) => {
          const isExpiringSoon = o.statut_abonnement === 'actif' &&
            o.date_fin_abonnement &&
            new Date(o.date_fin_abonnement).getTime() - Date.now() < 30 * 86400000;
          return (
            <div
              key={o.id}
              onClick={() => navigate(`/super-admin/organisations/${o.id}`)}
              className="p-4 rounded-xl border border-border bg-card space-y-3 cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {o.nom[0]}
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-foreground">{o.nom}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium text-[10px] flex items-center gap-0.5">
                        <Crown className="h-2.5 w-2.5" />
                        {o.formule_code || '-'}
                      </span>
                      <span className="capitalize">{o.periodicite || '-'}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statutClass(o.statut_abonnement)}`}>
                  {statutLabel(o.statut_abonnement)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
                <span className="font-bold text-foreground">{fmt(o.prix_abonnement || 0)}</span>
                <span className={`text-xs flex items-center gap-1 ${isExpiringSoon ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                  {isExpiringSoon && <Clock className="h-3 w-3" />}
                  {t('facturation.mobileEnd')} {o.date_fin_abonnement ? new Date(o.date_fin_abonnement).toLocaleDateString() : '-'}
                </span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">{t('facturation.noResults')}</div>
        )}
      </div>
    </div>
  );
};
