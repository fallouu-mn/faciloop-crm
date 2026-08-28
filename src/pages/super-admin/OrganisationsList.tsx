import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, X, Clock, Power, Search } from 'lucide-react';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { DateRange, isInDateRange, searchParamsToDateRange } from '../../lib/dateFilter';
import { formatAmount } from '../../lib/currency';
import { supabase } from '../../lib/supabase';
import { FormuleConfig, getFormules, getOfferPrice } from '../../services/formulesSaas';

const PERIODICITES = [
  { code: 'mensuel', label: 'Mensuel' },
  { code: 'trimestriel', label: 'Trimestriel' },
  { code: 'annuel', label: 'Annuel' },
];

interface OrgRow {
  id: string;
  nom: string;
  statut: 'en_attente' | 'actif' | 'suspendu' | 'inactif';
  devise_defaut: string;
  created_at: string;
}

export const OrganisationsList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialStatut = (searchParams.get('statut') as 'actif' | 'suspendu') || 'tous';

  const [tenants, setTenants] = useState<OrgRow[]>([]);
  const [formules, setFormules] = useState<FormuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'en_attente' | 'actif' | 'suspendu'>(initialStatut as any);
  const [period, setPeriod] = useState<DateRange>(() => searchParamsToDateRange(searchParams));

  const [nomOrg, setNomOrg] = useState('');
  const [formule, setFormule] = useState('');
  const [periodicite, setPeriodicite] = useState('mensuel');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [orgsRes, formulesData] = await Promise.all([
        supabase.from('organizations').select('*').order('created_at', { ascending: false }),
        getFormules(),
      ]);
      if (!orgsRes.error && orgsRes.data) setTenants(orgsRes.data);
      setFormules(formulesData);
      if (formulesData.length > 0) setFormule(formulesData[0].code);
      setLoading(false);
    };
    fetchData();
  }, []);

  const prixAuto = getOfferPrice(formules, formule, periodicite, true);
  const isPremierMois = periodicite === 'mensuel' && (() => {
    const f = formules.find(fo => fo.code === formule);
    return f?.pricing.mensuel_premier_mois != null && f.pricing.mensuel_premier_mois !== f.pricing.mensuel;
  })();
  const fmtPrice = (amount: number) => formatAmount(amount, 'XOF');

  const changeStatus = async (id: string, newStatut: 'actif' | 'suspendu') => {
    const { error } = await supabase
      .from('organizations')
      .update({ statut: newStatut })
      .eq('id', id);
    if (!error) {
      setTenants(prev => prev.map(t => t.id === id ? { ...t, statut: newStatut } : t));
    }
  };

  const toggleStatus = async (id: string) => {
    const target = tenants.find(t => t.id === id);
    if (!target) return;
    const newStatut = target.statut === 'actif' ? 'suspendu' : 'actif';
    await changeStatus(id, newStatut);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('organizations')
      .insert({
        nom: nomOrg,
        devise_defaut: 'XOF',
        statut: 'actif',
      })
      .select()
      .single();

    if (!error && data) {
      setTenants(prev => [data, ...prev]);
      setIsModalOpen(false);
      setNomOrg('');
      setAdminEmail('');
    }
  };

  const filtered = useMemo(() =>
    tenants.filter(t => {
      const matchSearch = t.nom.toLowerCase().includes(search.toLowerCase());
      const matchStatut = filterStatut === 'tous' || t.statut === filterStatut;
      const matchDate = isInDateRange(t.created_at, period);
      return matchSearch && matchStatut && matchDate;
    }),
    [tenants, search, filterStatut, period]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Organisations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gérez toutes les entreprises clientes ({filtered.length} résultat{filtered.length > 1 ? 's' : ''})
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-faciloop px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Entreprise</span>
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
            placeholder="Rechercher une organisation..."
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
              {s === 'tous' ? 'Tous' : s === 'en_attente' ? 'En attente' : s === 'actif' ? 'Actifs' : 'Suspendus'}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr className="text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Créée le</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {t.nom[0]}
                    </div>
                    <span className="font-medium text-foreground">{t.nom}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(t.created_at).toLocaleDateString('fr-FR')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    t.statut === 'actif'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : t.statut === 'en_attente'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-destructive/10 text-destructive'
                  }`}>
                    {t.statut === 'actif' ? 'Actif' : t.statut === 'en_attente' ? 'En attente' : 'Suspendu'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {t.statut === 'en_attente' ? (
                    <button
                      onClick={() => changeStatus(t.id, 'actif')}
                      className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-medium transition-colors"
                    >
                      Activer
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleStatus(t.id)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                        t.statut === 'actif'
                          ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                          : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                      }`}
                    >
                      {t.statut === 'actif' ? 'Suspendre' : 'Activer'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune organisation trouvée</div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((t) => (
          <div key={t.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {t.nom[0]}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-foreground">{t.nom}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(t.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                t.statut === 'actif'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : t.statut === 'en_attente'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-destructive/10 text-destructive'
              }`}>
                {t.statut === 'actif' ? 'Actif' : t.statut === 'en_attente' ? 'En attente' : 'Suspendu'}
              </span>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-end">
              {t.statut === 'en_attente' ? (
                <button
                  onClick={() => changeStatus(t.id, 'actif')}
                  className="px-3 py-1.5 rounded-full border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>Activer</span>
                </button>
              ) : (
                <button
                  onClick={() => toggleStatus(t.id)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    t.statut === 'actif'
                      ? 'border-destructive/30 text-destructive hover:bg-destructive/10'
                      : 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{t.statut === 'actif' ? 'Suspendre' : 'Activer'}</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune organisation trouvée</div>
        )}
      </div>

      {/* Modal Create */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Nouvelle Entreprise</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nom *</label>
                <input
                  type="text"
                  required
                  value={nomOrg}
                  onChange={(e) => setNomOrg(e.target.value)}
                  placeholder="Ex: Sénégal Distribution SA"
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                />
              </div>
              {formules.length > 0 && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Formule</label>
                    <select
                      value={formule}
                      onChange={(e) => setFormule(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    >
                      {formules.filter(f => f.isActive).map(f => (
                        <option key={f.code} value={f.code}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Période</label>
                    <select
                      value={periodicite}
                      onChange={(e) => setPeriodicite(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all"
                    >
                      {PERIODICITES.map(p => (
                        <option key={p.code} value={p.code}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {/* Prix auto-calculé */}
              {formules.length > 0 && formule && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Prix calculé automatiquement</span>
                    <div className="flex items-center gap-2">
                      {isPremierMois && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                          Prix 1er mois
                        </span>
                      )}
                      <span className="text-sm font-bold text-primary">{fmtPrice(prixAuto)}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Tarif issu de la configuration Abonnements ({formule} / {PERIODICITES.find(p => p.code === periodicite)?.label})
                  </p>
                </div>
              )}
              {formules.length === 0 && (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                  <p className="text-xs text-amber-600 font-medium">
                    Aucune formule configurée. Rendez-vous dans Abonnements pour en créer.
                  </p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email Admin *</label>
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-10 rounded-full border border-border text-sm font-medium hover:bg-muted text-foreground transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-full bg-gradient-faciloop text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
