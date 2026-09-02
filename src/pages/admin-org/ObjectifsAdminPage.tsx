import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X, Users, TrendingUp, CalendarDays, Goal, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { SelectCustom } from '../../components/common/SelectCustom';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { ObjectifCommercialAdmin } from '../../lib/mockAdminOrg';

function getMonthRange(): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}


export const ObjectifsAdminPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const { objectifs, addObjectif, deleteObjectif, commerciaux, paiements, clients, prospects } = useAuth();

  const PERIODE_LABELS: Record<string, string> = {
    hebdomadaire: t('adminOrg.objectifs.period.hebdomadaire'),
    mensuel: t('adminOrg.objectifs.period.mensuel'),
    trimestriel: t('adminOrg.objectifs.period.trimestriel'),
    annuel: t('adminOrg.objectifs.period.annuel'),
  };
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [isDefineOpen, setIsDefineOpen] = useState(false);

  const { start: defaultStart, end: defaultEnd } = getMonthRange();

  const [formCommercialId, setFormCommercialId] = useState(commerciaux[0]?.id || '');
  const [formType, setFormType] = useState<'ca' | 'ventes' | 'prospects'>('ca');
  const [formObjectif, setFormObjectif] = useState('');
  const [formPeriodeType, setFormPeriodeType] = useState<'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const [formDebut, setFormDebut] = useState(defaultStart);
  const [formFin, setFormFin] = useState(defaultEnd);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  function autoFillDates(type: 'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel') {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    if (type === 'hebdomadaire') {
      const day = now.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      setFormDebut(monday.toISOString().split('T')[0]);
      setFormFin(sunday.toISOString().split('T')[0]);
    } else if (type === 'mensuel') {
      setFormDebut(`${y}-${String(m + 1).padStart(2, '0')}-01`);
      setFormFin(`${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`);
    } else if (type === 'trimestriel') {
      const qStart = Math.floor(m / 3) * 3;
      const qEnd = qStart + 2;
      setFormDebut(`${y}-${String(qStart + 1).padStart(2, '0')}-01`);
      setFormFin(`${y}-${String(qEnd + 1).padStart(2, '0')}-${String(new Date(y, qEnd + 1, 0).getDate()).padStart(2, '0')}`);
    } else if (type === 'annuel') {
      setFormDebut(`${y}-01-01`);
      setFormFin(`${y}-12-31`);
    }
  }

  function computeRealise(
    type: 'ca' | 'ventes' | 'prospects',
    commercialId: string,
    dateDebut: string,
    dateFin: string,
  ): number {
    if (!dateDebut || !dateFin) return 0;
    // Normalize timestamps to YYYY-MM-DD before comparing
    const norm = (d: string) => (d || '').split('T')[0];
    const inRange = (d: string) => norm(d) >= dateDebut && norm(d) <= dateFin;
    if (type === 'ca') {
      return paiements
        .filter(
          (p) =>
            p.commercial_id === commercialId &&
            p.statut === 'valide' &&
            inRange(p.date_paiement),
        )
        .reduce((sum, p) => sum + (p.montant_paye || 0), 0);
    }
    if (type === 'ventes') {
      return clients.filter(
        (c) => c.commercial_id === commercialId && inRange(c.created_at),
      ).length;
    }
    if (type === 'prospects') {
      return prospects.filter(
        (p) => p.commercial_id === commercialId && inRange(p.created_at || ''),
      ).length;
    }
    return 0;
  }

  function progressColor(pct: number) {
    if (pct >= 100) return 'bg-emerald-500';
    if (pct >= 80) return 'bg-blue-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

  function progressTextColor(pct: number) {
    if (pct >= 100) return 'text-emerald-600';
    if (pct >= 80) return 'text-blue-600';
    if (pct >= 50) return 'text-amber-600';
    return 'text-red-600';
  }

  const handleDefine = () => {
    if (!formObjectif || !formDebut || !formFin) return;
    const commercial = commerciaux.find((p) => p.id === formCommercialId);
    const periodeLabel = `${formDebut} → ${formFin}`;
    addObjectif({
      commercialId: formCommercialId,
      commercialNom: commercial ? `${commercial.prenom} ${commercial.nom}` : 'Inconnu',
      type: formType,
      objectif: Number(formObjectif),
      realise: 0,
      periode: periodeLabel,
      date_debut: formDebut,
      date_fin: formFin,
    });
    setIsDefineOpen(false);
    setFormObjectif('');
    toast.success(t('adminOrg.objectifs.toast'));
  };

  const groupedByCommercial = objectifs.reduce(
    (acc, obj) => {
      if (!acc[obj.commercialId]) acc[obj.commercialId] = [];
      acc[obj.commercialId].push(obj);
      return acc;
    },
    {} as Record<string, ObjectifCommercialAdmin[]>,
  );

  const avgAtteinte =
    objectifs.length > 0
      ? Math.round(
          objectifs.reduce((s, o) => {
            const realise = computeRealise(o.type, o.commercialId, o.date_debut || '', o.date_fin || '');
            return s + (o.objectif > 0 ? (realise / o.objectif) * 100 : 0);
          }, 0) / objectifs.length,
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('adminOrg.objectifs.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('adminOrg.objectifs.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={() => setIsDefineOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('adminOrg.objectifs.defineBtn')}</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('adminOrg.objectifs.kpi.tracked')}</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">{Object.keys(groupedByCommercial).length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('adminOrg.objectifs.kpi.defined')}</span>
            <Goal className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">{objectifs.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('adminOrg.objectifs.kpi.avgRate')}</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-lg font-bold text-emerald-600">{avgAtteinte}%</span>
        </div>
      </div>

      {/* Per Commercial */}
      <div className="space-y-4">
        {Object.entries(groupedByCommercial).map(([commId, objs]) => {
          const comm = commerciaux.find((p) => p.id === commId);
          const initials = objs[0]?.commercialNom.split(' ').map((n) => n[0]).join('') || '?';

          // Summary: total CA and total ventes for this commercial across all their objectifs
          const totalCAComm = objs
            .filter((o) => o.type === 'ca')
            .reduce((sum, o) => sum + computeRealise('ca', commId, o.date_debut || '', o.date_fin || ''), 0);
          const totalVentesComm = objs
            .filter((o) => o.type === 'ventes')
            .reduce((sum, o) => sum + computeRealise('ventes', commId, o.date_debut || '', o.date_fin || ''), 0);

          return (
            <div key={commId} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-faciloop text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{objs[0]?.commercialNom}</p>
                  {comm && (
                    <p className="text-xs text-muted-foreground">
                      {comm.email} · {comm.telephone}
                    </p>
                  )}
                </div>
                {/* Per-commercial summary */}
                <div className="hidden sm:flex items-center gap-4 text-xs">
                  {objs.some((o) => o.type === 'ca') && (
                    <div className="text-right">
                      <p className="text-muted-foreground font-medium">{t('adminOrg.objectifs.caEncaisse')}</p>
                      <p className="font-extrabold text-emerald-600">{fmt(totalCAComm)}</p>
                    </div>
                  )}
                  {objs.some((o) => o.type === 'ventes') && (
                    <div className="text-right">
                      <p className="text-muted-foreground font-medium">{t('adminOrg.objectifs.ventes')}</p>
                      <p className="font-extrabold text-foreground">{totalVentesComm}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {objs.map((obj) => {
                  const realise = computeRealise(obj.type, obj.commercialId, obj.date_debut || '', obj.date_fin || '');
                  // displayPercent = real ratio (can exceed 100 when objective is surpassed)
                  const displayPercent = obj.objectif > 0 ? Math.round((realise / obj.objectif) * 100) : 0;
                  // barPercent = capped at 100 so the bar never overflows
                  const barPercent = Math.min(100, displayPercent);
                  const isCA = obj.type === 'ca';
                  const periodeLabel = obj.date_debut && obj.date_fin
                    ? `${obj.date_debut} → ${obj.date_fin}`
                    : obj.periode;

                  return (
                    <div key={obj.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground capitalize">
                          {t(`adminOrg.objectifs.types.${obj.type}`)}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{periodeLabel}</span>
                          <button
                            onClick={() => { deleteObjectif(obj.id); toast.success('Objectif supprimé.'); }}
                            className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                            title={t('adminOrg.objectifs.deleteTitle')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {isCA ? fmt(realise) : realise} / {isCA ? fmt(obj.objectif) : obj.objectif}
                        </span>
                        <span className={`font-bold ${progressTextColor(displayPercent)}`}>
                          {displayPercent}%
                          {displayPercent >= 100 && (
                            <span className="ml-1 text-[10px] text-emerald-500">✓</span>
                          )}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${progressColor(displayPercent)}`}
                          style={{ width: `${barPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {objectifs.length === 0 && (
          <div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground text-sm">
            {t('adminOrg.objectifs.empty')}
          </div>
        )}
      </div>

      {/* Modal */}
      {isDefineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Goal className="w-5 h-5 text-primary" /> {t('adminOrg.objectifs.modal.title')}
              </h2>
              <button onClick={() => setIsDefineOpen(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <SelectCustom
                label={t('adminOrg.objectifs.modal.commercial')}
                value={formCommercialId}
                onChange={setFormCommercialId}
                searchable={true}
                options={commerciaux.map((c) => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))}
              />

              <SelectCustom
                label={t('adminOrg.objectifs.modal.type')}
                value={formType}
                onChange={(v) => setFormType(v as any)}
                options={[
                  { value: 'ca', label: "Chiffre d'affaires (FCFA)" },
                  { value: 'ventes', label: 'Nombre de ventes' },
                  { value: 'prospects', label: 'Nombre de prospects' },
                ]}
              />

              <div>
                <label className="block font-semibold mb-1">
                  {t('adminOrg.objectifs.modal.target')} {formType === 'ca' && '(en FCFA)'}
                </label>
                <input
                  type="number"
                  value={formObjectif}
                  onChange={(e) => setFormObjectif(e.target.value)}
                  placeholder={formType === 'ca' ? '5000000' : '10'}
                  className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-primary" />
                  {t('adminOrg.objectifs.modal.periodType')}
                </label>
                <select
                  value={formPeriodeType}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setFormPeriodeType(val);
                    autoFillDates(val);
                  }}
                  className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  {Object.entries(PERIODE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {t('adminOrg.objectifs.modal.startDate')}
                  </label>
                  <input
                    type="date"
                    value={formDebut}
                    onChange={(e) => setFormDebut(e.target.value)}
                    className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    {t('adminOrg.objectifs.modal.endDate')}
                  </label>
                  <input
                    type="date"
                    value={formFin}
                    onChange={(e) => setFormFin(e.target.value)}
                    className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsDefineOpen(false)}
                className="flex-1 py-3 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground"
              >
                {t('adminOrg.objectifs.modal.cancel')}
              </button>
              <button
                onClick={handleDefine}
                disabled={!formObjectif}
                className="flex-1 py-3 rounded-xl bg-gradient-faciloop text-white text-xs font-bold hover:opacity-95 shadow-md disabled:opacity-50"
              >
                {t('adminOrg.objectifs.modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
