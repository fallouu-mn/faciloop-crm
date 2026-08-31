import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ClientFaciloop } from '../../types/crm';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { SelectCustom } from '../../components/common/SelectCustom';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Search,
  Users,
  Crown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  X,
  AlertTriangle,
} from 'lucide-react';

function normalize(str: string): string {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysSince(dateStr?: string): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function renewalBadge(days: number | null): { label: string; color: string } | null {
  if (days === null) return null;
  if (days < 0) return { label: 'Expiré', color: 'text-red-500 bg-red-500/10 border-red-500/30' };
  if (days <= 7) return { label: `${days}j`, color: 'text-red-500 bg-red-500/10 border-red-500/30' };
  if (days <= 15) return { label: `${days}j`, color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' };
  return null;
}

export const ClientsListAdmin: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { clients, commerciaux, paiements } = useAuth();
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [search, setSearch] = useState('');
  const [filterStatutCompte, setFilterStatutCompte] = useState<string>('all');
  const [filterStatutAbo, setFilterStatutAbo] = useState<string>('all');
  const [filterFormule, setFilterFormule] = useState<string>('all');
  const [filterCommercial, setFilterCommercial] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<ClientFaciloop | null>(null);

  const isEn = i18n.language?.startsWith('en');

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const filtered = useMemo(() => {
    const q = normalize(search);
    return clients.filter(c => {
      const matchSearch = !q ||
        normalize(c.entreprise).includes(q) ||
        normalize(c.nom_responsable).includes(q) ||
        c.telephone.includes(search);
      const matchCompte = filterStatutCompte === 'all' || c.statut_compte === filterStatutCompte;
      const matchAbo = filterStatutAbo === 'all' || c.statut_abonnement === filterStatutAbo;
      const matchFormule = filterFormule === 'all' || c.formule_souscrite === filterFormule;
      const matchCommercial = filterCommercial === 'all' || c.commercial_id === filterCommercial;
      return matchSearch && matchCompte && matchAbo && matchFormule && matchCommercial;
    });
  }, [clients, search, filterStatutCompte, filterStatutAbo, filterFormule, filterCommercial]);

  // Real CA from validated paiements
  const totalCA = useMemo(
    () => paiements.filter(p => p.statut === 'valide').reduce((s, p) => s + (p.montant_paye || 0), 0),
    [paiements],
  );

  const actifs = clients.filter(c => c.statut_compte === 'actif').length;
  const renewalsSoon = clients.filter(c => {
    const d = daysUntil(c.prochain_renouvellement);
    return d !== null && d >= 0 && d <= 30;
  }).length;

  const formules = useMemo(() => [...new Set(clients.map(c => c.formule_souscrite))], [clients]);

  const hasActiveFilters = filterStatutCompte !== 'all' || filterStatutAbo !== 'all' || filterFormule !== 'all' || filterCommercial !== 'all' || search !== '';

  const resetFilters = () => {
    setSearch('');
    setFilterStatutCompte('all');
    setFilterStatutAbo('all');
    setFilterFormule('all');
    setFilterCommercial('all');
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-emerald-500/10 text-emerald-600';
      case 'suspendu': return 'bg-amber-500/10 text-amber-600';
      case 'inactif': return 'bg-rose-500/10 text-rose-600';
      case 'en_attente': return 'bg-blue-500/10 text-blue-600';
      case 'expire': return 'bg-rose-500/10 text-rose-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isEn ? 'Client Accounts' : 'Comptes Clients'} ({clients.length})
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {isEn ? 'Converted Prospects' : 'Prospects convertis'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEn ? 'Clients resulting from prospect conversion — active accounts & subscriptions' : 'Clients issus de la conversion de prospects — abonnements et comptes actifs'}
          </p>
        </div>
        <CurrencyToggle value={devise} onChange={setDevise} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{isEn ? 'Total clients' : 'Total clients'}</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </div>
          <span className="text-lg font-bold text-foreground">{clients.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{isEn ? 'Active accounts' : 'Comptes actifs'}</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <span className="text-lg font-bold text-emerald-600">{actifs}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{isEn ? 'Total Revenue' : 'CA total'}</span>
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Crown className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <span className="text-sm font-bold text-foreground truncate">{fmt(totalCA)}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{isEn ? 'Upcoming Renewals' : 'Renouvellements (30j)'}</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <span className="text-lg font-bold text-foreground">{renewalsSoon}</span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par entreprise, responsable ou téléphone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            />
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2.5 rounded-xl border border-input bg-card text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 shrink-0"
            >
              <X className="w-3.5 h-3.5" /> Réinitialiser
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SelectCustom
            value={filterStatutCompte}
            onChange={setFilterStatutCompte}
            placeholder="Statut compte"
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'actif', label: 'Actif' },
              { value: 'suspendu', label: 'Suspendu' },
              { value: 'inactif', label: 'Inactif' },
            ]}
          />
          <SelectCustom
            value={filterStatutAbo}
            onChange={setFilterStatutAbo}
            placeholder="Statut abonnement"
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'actif', label: 'Actif' },
              { value: 'en_attente', label: 'En attente' },
              { value: 'expire', label: 'Expiré' },
              { value: 'suspendu', label: 'Suspendu' },
            ]}
          />
          <SelectCustom
            value={filterFormule}
            onChange={setFilterFormule}
            placeholder="Formule"
            options={[
              { value: 'all', label: 'Toutes' },
              ...formules.map(f => ({ value: f, label: f })),
            ]}
          />
          <SelectCustom
            value={filterCommercial}
            onChange={setFilterCommercial}
            placeholder="Commercial"
            searchable={true}
            options={[
              { value: 'all', label: 'Tous' },
              ...commerciaux.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` })),
            ]}
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr className="text-xs font-medium text-muted-foreground">
              <th className="px-4 py-3">Entreprise</th>
              <th className="px-4 py-3">Responsable</th>
              <th className="px-4 py-3">Formule</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Abonnement</th>
              <th className="px-4 py-3">Renouvellement</th>
              <th className="px-4 py-3">Inactivité</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                  Aucun client trouvé. Les clients apparaissent après conversion d'un prospect.
                </td>
              </tr>
            ) : filtered.map((client) => {
              const renewal = renewalBadge(daysUntil(client.prochain_renouvellement));
              const inactive = daysSince(client.derniere_connexion);
              return (
                <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{client.entreprise}</div>
                    <div className="text-xs text-muted-foreground">{client.ville}{client.pays ? `, ${client.pays}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-foreground text-xs">{client.nom_responsable}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {client.formule_souscrite}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(client.statut_compte)}`}>
                      {client.statut_compte}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatutBadge(client.statut_abonnement)}`}>
                      {client.statut_abonnement}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{client.prochain_renouvellement || '—'}</span>
                      {renewal && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${renewal.color}`}>
                          {renewal.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {inactive !== null && inactive > 30 ? (
                      <span className="flex items-center gap-1 text-amber-500 font-bold text-[11px]">
                        <AlertTriangle className="w-3 h-3" />{inactive}j
                      </span>
                    ) : (
                      <span className="text-muted-foreground">{inactive !== null ? `${inactive}j` : '—'}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedClient(client)}
                      className="p-2 rounded-lg border border-input hover:bg-muted transition-colors"
                    >
                      <Eye className="w-4 h-4 text-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucun client trouvé.</div>
        )}
        {filtered.map((client) => {
          const renewal = renewalBadge(daysUntil(client.prochain_renouvellement));
          const inactive = daysSince(client.derniere_connexion);
          return (
            <div key={client.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{client.entreprise}</h3>
                  <p className="text-xs text-muted-foreground">{client.nom_responsable}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${getStatutBadge(client.statut_compte)}`}>
                    {client.statut_compte}
                  </span>
                  {renewal && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${renewal.color}`}>
                      Renouvellement {renewal.label}
                    </span>
                  )}
                  {inactive !== null && inactive > 30 && (
                    <span className="flex items-center gap-1 text-amber-500 font-bold text-[10px]">
                      <AlertTriangle className="w-3 h-3" />Inactif {inactive}j
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {client.formule_souscrite}
                </span>
                <span className="font-bold text-foreground">{fmt(client.montant_paye)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                <div className="flex items-center gap-2">
                  <a href={`tel:${client.telephone}`} className="p-1.5 rounded-lg bg-muted hover:bg-primary/10 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </a>
                  {client.whatsapp && (
                    <a href={`https://wa.me/${client.whatsapp.replace(/\s+/g, '')}`} target="_blank" rel="noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setSelectedClient(client)}
                  className="px-3 py-1.5 rounded-lg border border-input text-xs font-bold hover:bg-muted"
                >
                  Détails
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Detail Sheet */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-card border-t sm:border border-border rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">Fiche Client</h2>
              <button onClick={() => setSelectedClient(null)} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
            </div>

            {/* Renewal / inactivity alerts in detail panel */}
            {(() => {
              const renewal = renewalBadge(daysUntil(selectedClient.prochain_renouvellement));
              const inactive = daysSince(selectedClient.derniere_connexion);
              return (
                <>
                  {renewal && (
                    <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${renewal.color}`}>
                      <Calendar className="w-4 h-4 shrink-0" />
                      Renouvellement dans {renewal.label} — {selectedClient.prochain_renouvellement}
                    </div>
                  )}
                  {inactive !== null && inactive > 30 && (
                    <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Inactif depuis {inactive} jours
                    </div>
                  )}
                </>
              );
            })()}

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="font-bold text-sm text-foreground">{selectedClient.entreprise}</span>
                </div>
                <p className="text-xs text-muted-foreground">{selectedClient.nom_responsable}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Téléphone</span>
                  <p className="font-medium text-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{selectedClient.telephone}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium text-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{selectedClient.email || '—'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Localisation</span>
                  <p className="font-medium text-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedClient.ville}{selectedClient.pays ? `, ${selectedClient.pays}` : ''}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Secteur</span>
                  <p className="font-medium text-foreground">{selectedClient.secteur_activite || '—'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-card space-y-2">
                <h4 className="text-xs font-bold text-foreground">Abonnement</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Formule</span>
                    <p className="font-bold text-primary">{selectedClient.formule_souscrite}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Montant payé</span>
                    <p className="font-bold text-foreground">{fmt(selectedClient.montant_paye)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Statut compte</span>
                    <p className={`font-bold capitalize ${selectedClient.statut_compte === 'actif' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {selectedClient.statut_compte}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Renouvellement</span>
                    <p className="font-bold text-foreground">{selectedClient.prochain_renouvellement || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Utilisateurs</span>
                    <p className="font-bold text-foreground">{selectedClient.nombre_utilisateurs}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dernière connexion</span>
                    <p className="font-medium text-foreground">{selectedClient.derniere_connexion?.split('T')[0] || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedClient(null)}
              className="w-full py-3 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground transition-all"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
