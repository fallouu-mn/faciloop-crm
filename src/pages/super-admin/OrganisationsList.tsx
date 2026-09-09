import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, X, Clock, Power, Search, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { DateRange, isInDateRange, searchParamsToDateRange } from '../../lib/dateFilter';
import { formatAmount } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { FormuleConfig, getFormules, getOfferPrice } from '../../services/formulesSaas';
import { useTranslation } from 'react-i18next';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';

const PERIODICITES_CODES = ['mensuel', 'trimestriel', 'annuel'] as const;

interface OrgRow {
  id: string;
  nom: string;
  statut: 'en_attente' | 'actif' | 'suspendu' | 'inactif';
  devise_defaut: string;
  pays?: string;
  ville?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  secteur?: string;
  formule_code?: string;
  periodicite?: string;
  prix_abonnement?: number;
  statut_abonnement?: string;
  responsable_nom?: string;
  responsable_prenom?: string;
  created_at: string;
}

export const OrganisationsList: React.FC = () => {
  const { t } = useTranslation('superAdmin');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatut = (searchParams.get('statut') as 'actif' | 'suspendu') || 'tous';

  const [tenants, setTenants] = useState<OrgRow[]>([]);
  const [formules, setFormules] = useState<FormuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'en_attente' | 'actif' | 'suspendu'>(initialStatut as any);
  const [period, setPeriod] = useState<DateRange>(() => searchParamsToDateRange(searchParams));

  // Modal "Nouvelle Entreprise"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [nomOrg, setNomOrg] = useState('');
  const [createFormule, setCreateFormule] = useState('');
  const [createPeriodicite, setCreatePeriodicite] = useState('mensuel');
  const [adminEmail, setAdminEmail] = useState('');

  // Modal "Activation"
  const [activatingOrg, setActivatingOrg] = useState<OrgRow | null>(null);
  const [activFormule, setActivFormule] = useState('');
  const [activPeriodicite, setActivPeriodicite] = useState('mensuel');
  const [activLoading, setActivLoading] = useState(false);
  const [activError, setActivError] = useState<string | null>(null);

  const PERIODICITES = PERIODICITES_CODES.map(code => ({ code, label: t(`period.${code}`) }));

  const fetchData = async () => {
    const [orgsRes, formulesData] = await Promise.all([
      supabase.from('organizations').select('*').order('created_at', { ascending: false }),
      getFormules(),
    ]);
    if (!orgsRes.error && orgsRes.data) setTenants(orgsRes.data);
    setFormules(formulesData);
    if (formulesData.length > 0) {
      const firstActive = formulesData.find(f => f.isActive)?.code || formulesData[0].code;
      setCreateFormule(firstActive);
      setActivFormule(firstActive);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);
  useRefetchOnFocus(fetchData);

  const fmtPrice = (amount: number) => formatAmount(amount, 'XOF');

  const createPrixAuto = getOfferPrice(formules, createFormule, createPeriodicite, true);
  const createIsPremierMois = createPeriodicite === 'mensuel' && (() => {
    const f = formules.find(fo => fo.code === createFormule);
    return f?.pricing.mensuel_premier_mois != null && f.pricing.mensuel_premier_mois !== f.pricing.mensuel;
  })();

  const activPrixAuto = getOfferPrice(formules, activFormule, activPeriodicite, true);
  const activIsPremierMois = activPeriodicite === 'mensuel' && (() => {
    const f = formules.find(fo => fo.code === activFormule);
    return f?.pricing.mensuel_premier_mois != null && f.pricing.mensuel_premier_mois !== f.pricing.mensuel;
  })();

  const openActivationModal = (org: OrgRow) => {
    setActivatingOrg(org);
    setActivError(null);
    if (org.formule_code) {
      setActivFormule(org.formule_code);
    } else {
      const firstActive = formules.find(f => f.isActive)?.code || '';
      setActivFormule(firstActive);
    }
    setActivPeriodicite(org.periodicite || 'mensuel');
  };

  const handleActivate = async () => {
    if (!activatingOrg) return;
    setActivLoading(true);
    setActivError(null);

    const prix = getOfferPrice(formules, activFormule, activPeriodicite, false);
    const durationDays = activPeriodicite === 'annuel' ? 365 : activPeriodicite === 'trimestriel' ? 90 : 30;
    const dateDebut = new Date().toISOString().split('T')[0];
    const dateFin = new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0];

    const { error } = await supabase
      .from('organizations')
      .update({
        statut: 'actif',
        formule_code: activFormule,
        periodicite: activPeriodicite,
        prix_abonnement: prix,
        date_debut_abonnement: dateDebut,
        date_fin_abonnement: dateFin,
        statut_abonnement: 'actif',
      })
      .eq('id', activatingOrg.id);

    if (error) {
      setActivError(error.message);
      setActivLoading(false);
      toast.error(`Erreur lors de l'activation : ${error.message}`);
      return;
    }

    setTenants(prev => prev.map(tenant => tenant.id === activatingOrg.id ? {
      ...tenant,
      statut: 'actif' as const,
      formule_code: activFormule,
      periodicite: activPeriodicite,
      prix_abonnement: prix,
      date_debut_abonnement: dateDebut,
      date_fin_abonnement: dateFin,
      statut_abonnement: 'actif',
    } : tenant));

    setActivLoading(false);
    setActivatingOrg(null);
    toast.success(`Organisation "${activatingOrg.nom}" activée avec succès !`);
  };

  const changeStatus = async (id: string, newStatut: 'actif' | 'suspendu') => {
    const target = tenants.find(tenant => tenant.id === id);
    const updates: Record<string, unknown> = { statut: newStatut };
    if (newStatut === 'suspendu') {
      updates.statut_abonnement = 'suspendu';
    } else if (newStatut === 'actif' && target?.formule_code) {
      updates.statut_abonnement = 'actif';
    }
    const { error } = await supabase
      .from('organizations')
      .update(updates)
      .eq('id', id);
    if (!error) {
      setTenants(prev => prev.map(tenant => tenant.id === id ? {
        ...tenant,
        statut: newStatut,
        statut_abonnement: (updates.statut_abonnement as string) || tenant.statut_abonnement,
      } : tenant));
      toast.success(
        newStatut === 'suspendu'
          ? `Organisation "${target?.nom}" suspendue.`
          : `Organisation "${target?.nom}" réactivée !`
      );
    } else {
      toast.error(`Erreur : ${error.message}`);
    }
  };

  const toggleStatus = async (id: string) => {
    const target = tenants.find(tenant => tenant.id === id);
    if (!target) return;
    const newStatut = target.statut === 'actif' ? 'suspendu' : 'actif';
    await changeStatus(id, newStatut);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const prix = getOfferPrice(formules, createFormule, createPeriodicite, false);
    const durationDays = createPeriodicite === 'annuel' ? 365 : createPeriodicite === 'trimestriel' ? 90 : 30;
    const dateDebut = new Date().toISOString().split('T')[0];
    const dateFin = new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('organizations')
      .insert({
        nom: nomOrg,
        devise_defaut: 'XOF',
        statut: 'actif',
        formule_code: createFormule || null,
        periodicite: createPeriodicite || null,
        prix_abonnement: prix,
        date_debut_abonnement: dateDebut,
        date_fin_abonnement: dateFin,
        statut_abonnement: formules.length > 0 ? 'actif' : 'inactif',
      })
      .select()
      .single();

    if (!error && data) {
      setTenants(prev => [data, ...prev]);
      setIsCreateModalOpen(false);
      setNomOrg('');
      setAdminEmail('');
      toast.success(`Organisation "${nomOrg}" créée avec succès !`);
    } else if (error) {
      toast.error(`Erreur lors de la création : ${error.message}`);
    }
  };

  const filtered = useMemo(() =>
    tenants.filter(tenant => {
      const matchSearch = tenant.nom.toLowerCase().includes(search.toLowerCase());
      const matchStatut = filterStatut === 'tous' || tenant.statut === filterStatut;
      const matchDate = isInDateRange(tenant.created_at, period);
      return matchSearch && matchStatut && matchDate;
    }),
    [tenants, search, filterStatut, period]
  );

  const activeFormules = formules.filter(f => f.isActive);

  const statusLabel = (statut: string) => {
    if (statut === 'actif') return t('status.actif');
    if (statut === 'en_attente') return t('status.en_attente');
    return t('status.suspendu');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('organisations.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('organisations.subtitle')} ({t('organisations.results', { count: filtered.length })})
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-faciloop px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span>{t('organisations.newBtn')}</span>
        </button>
      </div>

      {/* Period Filter */}
      <PeriodFilter value={period} onChange={setPeriod} />

      {/* Search + Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('organisations.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
        <div className="inline-flex items-center rounded-full bg-muted p-1 border border-border text-sm">
          {(['tous', 'en_attente', 'actif', 'suspendu'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatut === s
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'tous' ? t('organisations.filterAll')
                : s === 'en_attente' ? t('organisations.filterPending')
                : s === 'actif' ? t('organisations.filterActive')
                : t('organisations.filterSuspended')}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr className="text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">{t('organisations.colCompany')}</th>
              <th className="px-4 py-3">{t('organisations.colFormula')}</th>
              <th className="px-4 py-3">{t('organisations.colCreated')}</th>
              <th className="px-4 py-3">{t('organisations.colStatus')}</th>
              <th className="px-4 py-3 text-right">{t('organisations.colAction')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((tenant) => (
              <tr
                key={tenant.id}
                onClick={() => navigate(`/super-admin/organisations/${tenant.id}`)}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {tenant.nom[0]}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{tenant.nom}</span>
                      {tenant.telephone && <p className="text-xs text-muted-foreground">{tenant.telephone}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {tenant.formule_code ? (
                    <span className="font-medium text-foreground">{tenant.formule_code} / {tenant.periodicite || '-'}</span>
                  ) : (
                    <span className="text-muted-foreground italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(tenant.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.statut === 'actif'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : tenant.statut === 'en_attente'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-destructive/10 text-destructive'
                  }`}>
                    {statusLabel(tenant.statut)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {tenant.statut === 'en_attente' ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); openActivationModal(tenant); }}
                      className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-medium transition-colors"
                    >
                      {t('common.activate')}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleStatus(tenant.id); }}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                        tenant.statut === 'actif'
                          ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                          : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                      }`}
                    >
                      {tenant.statut === 'actif' ? t('common.suspend') : t('common.activate')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">{t('organisations.noResults')}</div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((tenant) => (
          <div
            key={tenant.id}
            onClick={() => navigate(`/super-admin/organisations/${tenant.id}`)}
            className="p-4 rounded-xl border border-border bg-card space-y-3 cursor-pointer hover:border-primary/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {tenant.nom[0]}
                </div>
                <div>
                  <span className="font-medium text-sm text-foreground">{tenant.nom}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </span>
                    {tenant.formule_code && (
                      <span className="font-medium">{tenant.formule_code}</span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                tenant.statut === 'actif'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : tenant.statut === 'en_attente'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-destructive/10 text-destructive'
              }`}>
                {statusLabel(tenant.statut)}
              </span>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-end">
              {tenant.statut === 'en_attente' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); openActivationModal(tenant); }}
                  className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{t('common.activate')}</span>
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleStatus(tenant.id); }}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    tenant.statut === 'actif'
                      ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                      : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{tenant.statut === 'actif' ? t('common.suspend') : t('common.activate')}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">{t('organisations.noResults')}</div>
        )}
      </div>

      {/* ═══════ Modal Activation ═══════ */}
      {activatingOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('organisations.activateModal.title')}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{t('organisations.activateModal.subtitle')}</p>
              </div>
              <button onClick={() => setActivatingOrg(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('organisations.activateModal.sectionInfo')}</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelName')}</span>
                  <p className="font-medium text-foreground">{activatingOrg.nom}</p>
                </div>
                {(activatingOrg.responsable_prenom || activatingOrg.responsable_nom) && (
                  <div>
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelManager')}</span>
                    <p className="font-medium text-foreground">
                      {[activatingOrg.responsable_prenom, activatingOrg.responsable_nom].filter(Boolean).join(' ')}
                    </p>
                  </div>
                )}
                {activatingOrg.telephone && (
                  <div>
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelPhone')}</span>
                    <p className="font-medium text-foreground">{activatingOrg.telephone}</p>
                  </div>
                )}
                {activatingOrg.email && (
                  <div>
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelEmail')}</span>
                    <p className="font-medium text-foreground">{activatingOrg.email}</p>
                  </div>
                )}
                {activatingOrg.pays && (
                  <div>
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelCountry')}</span>
                    <p className="font-medium text-foreground">{activatingOrg.pays}</p>
                  </div>
                )}
                {activatingOrg.ville && (
                  <div>
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelCity')}</span>
                    <p className="font-medium text-foreground">{activatingOrg.ville}</p>
                  </div>
                )}
                {activatingOrg.adresse && (
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelAddress')}</span>
                    <p className="font-medium text-foreground">{activatingOrg.adresse}</p>
                  </div>
                )}
                {activatingOrg.secteur && (
                  <div>
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelSector')}</span>
                    <p className="font-medium text-foreground">{activatingOrg.secteur}</p>
                  </div>
                )}
                {activatingOrg.site_web && (
                  <div>
                    <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelWebsite')}</span>
                    <p className="font-medium text-foreground">{activatingOrg.site_web}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-muted-foreground">{t('organisations.activateModal.labelDate')}</span>
                  <p className="font-medium text-foreground">{new Date(activatingOrg.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t('organisations.activateModal.sectionSub')}</h3>

              {activeFormules.length > 0 ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{t('organisations.activateModal.labelFormula')}</label>
                    <select
                      value={activFormule}
                      onChange={(e) => setActivFormule(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    >
                      {activeFormules.map(f => (
                        <option key={f.code} value={f.code}>{f.label} — {f.description}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{t('organisations.activateModal.labelPeriod')}</label>
                    <select
                      value={activPeriodicite}
                      onChange={(e) => setActivPeriodicite(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    >
                      {PERIODICITES.map(p => (
                        <option key={p.code} value={p.code}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{t('common.autoCalculated')}</span>
                      <div className="flex items-center gap-2">
                        {activIsPremierMois && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                            {t('organisations.activateModal.firstMonthBadge')}
                          </span>
                        )}
                        <span className="text-sm font-bold text-primary">{fmtPrice(activPrixAuto)}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {t('common.pricingFrom', { formula: activFormule, period: PERIODICITES.find(p => p.code === activPeriodicite)?.label })}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs text-amber-600 font-medium">
                    {t('common.noFormula')}
                  </p>
                </div>
              )}
            </div>

            {activError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                <p className="text-xs text-destructive font-medium">{activError}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActivatingOrg(null)}
                className="flex-1 h-10 rounded-full border border-border text-sm font-medium hover:bg-muted text-foreground transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleActivate}
                disabled={activLoading || activeFormules.length === 0}
                className="flex-1 h-10 rounded-full bg-emerald-600 text-white text-sm font-semibold shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {activLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    {t('organisations.activateModal.activateBtn')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Modal Nouvelle Entreprise ═══════ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t('organisations.createModal.title')}</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('organisations.createModal.labelName')}</label>
                <input
                  type="text"
                  required
                  value={nomOrg}
                  onChange={(e) => setNomOrg(e.target.value)}
                  placeholder="Ex: Sénégal Distribution SA"
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                />
              </div>
              {activeFormules.length > 0 && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{t('organisations.createModal.labelFormula')}</label>
                    <select
                      value={createFormule}
                      onChange={(e) => setCreateFormule(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    >
                      {activeFormules.map(f => (
                        <option key={f.code} value={f.code}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">{t('organisations.createModal.labelPeriod')}</label>
                    <select
                      value={createPeriodicite}
                      onChange={(e) => setCreatePeriodicite(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    >
                      {PERIODICITES.map(p => (
                        <option key={p.code} value={p.code}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {activeFormules.length > 0 && createFormule && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{t('common.autoCalculated')}</span>
                    <div className="flex items-center gap-2">
                      {createIsPremierMois && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                          {t('organisations.createModal.firstMonthBadge')}
                        </span>
                      )}
                      <span className="text-sm font-bold text-primary">{fmtPrice(createPrixAuto)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {t('common.pricingFrom', { formula: createFormule, period: PERIODICITES.find(p => p.code === createPeriodicite)?.label })}
                  </p>
                </div>
              )}
              {formules.length === 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs text-amber-600 font-medium">
                    {t('common.noFormula')}
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('organisations.createModal.labelAdminEmail')}</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@entreprise.sn"
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 h-10 rounded-full border border-border text-sm font-medium hover:bg-muted text-foreground transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-full bg-gradient-faciloop text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
