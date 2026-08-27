import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle2, Search, Download } from 'lucide-react';
import { PeriodFilter } from '../../components/common/PeriodFilter';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DateRange, isInDateRange, searchParamsToDateRange, buildFilteredUrl } from '../../lib/dateFilter';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';

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

const mockFactures: FactureData[] = [];
import { downloadCsv } from '../../lib/exportCsv';

export const FacturationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [period, setPeriod] = useState<DateRange>(() => searchParamsToDateRange(searchParams));
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<'tous' | 'payee' | 'en_attente' | 'impayee'>('tous');

  const filtered = useMemo(() =>
    mockFactures.filter(f => {
      const matchSearch = f.tenant_nom.toLowerCase().includes(search.toLowerCase());
      const matchStatut = filterStatut === 'tous' || f.statut === filterStatut;
      const matchDate = isInDateRange(f.date_emission, period);
      return matchSearch && matchStatut && matchDate;
    }),
    [search, filterStatut, period]
  );

  const totalRevenu = filtered.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montant_xof, 0);
  const payeesCount = filtered.filter(f => f.statut === 'payee').length;
  const enAttenteCount = filtered.filter(f => f.statut === 'en_attente').length;
  const impayeesCount = filtered.filter(f => f.statut === 'impayee').length;

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const statutLabel = (s: FactureData['statut']) => {
    if (s === 'payee') return 'Payée';
    if (s === 'en_attente') return 'En attente';
    return 'Impayée';
  };

  const statutClass = (s: FactureData['statut']) => {
    if (s === 'payee') return 'bg-emerald-500/10 text-emerald-600';
    if (s === 'en_attente') return 'bg-amber-500/10 text-amber-600';
    return 'bg-destructive/10 text-destructive';
  };

  const handleExportCsv = () => {
    const headers = ['Entreprise', 'Formule', 'Montant', 'Devise', 'Émission', 'Échéance', 'Statut'];
    const rows = filtered.map(f => [
      f.tenant_nom,
      f.formule,
      String(convertAmount(f.montant_xof, 'XOF', devise)),
      devise,
      f.date_emission,
      f.date_echeance,
      statutLabel(f.statut),
    ]);
    const date = new Date().toISOString().split('T')[0];
    downloadCsv(`facturation_${date}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Facturation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Suivi des abonnements et paiements ({filtered.length} facture{filtered.length > 1 ? 's' : ''})
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <PeriodFilter value={period} onChange={setPeriod} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Revenus</span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold text-foreground">{fmt(totalRevenu)}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Payées</span>
            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <span className="text-xl font-bold text-emerald-500">{payeesCount}</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">En attente</span>
            <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <span className="text-xl font-bold text-amber-500">{enAttenteCount}</span>
        </div>

        <button
          onClick={() => navigate(buildFilteredUrl('/super-admin/organisations', period, { statut: 'suspendu' }))}
          className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2 text-left hover:border-destructive/40 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-destructive">Impayées</span>
            <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <span className="text-xl font-bold text-destructive">{impayeesCount}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>
        <div className="inline-flex items-center rounded-full bg-muted p-1 border border-border text-sm">
          {(['tous', 'payee', 'en_attente', 'impayee'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatut(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterStatut === s
                  ? 'bg-card shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'tous' ? 'Tous' : statutLabel(s)}
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
              <th className="px-4 py-3">Formule</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3">Émission</th>
              <th className="px-4 py-3">Échéance</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((f) => (
              <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {f.tenant_nom[0]}
                    </div>
                    <span className="font-medium text-foreground">{f.tenant_nom}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {f.formule}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{fmt(f.montant_xof)}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.date_emission}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.date_echeance}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statutClass(f.statut)}`}>
                    {statutLabel(f.statut)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune facture trouvée</div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filtered.map((f) => (
          <div key={f.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {f.tenant_nom[0]}
                </div>
                <div>
                  <h3 className="font-medium text-sm text-foreground">{f.tenant_nom}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                    {f.formule}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statutClass(f.statut)}`}>
                {statutLabel(f.statut)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
              <span className="font-bold text-foreground">{fmt(f.montant_xof)}</span>
              <span className="text-xs text-muted-foreground">Éch. {f.date_echeance}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">Aucune facture trouvée</div>
        )}
      </div>
    </div>
  );
};
