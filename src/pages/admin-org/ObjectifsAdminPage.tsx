import React, { useState } from 'react';
import { Target, Plus, Check, X, Users, TrendingUp, CalendarDays } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { SelectCustom } from '../../components/common/SelectCustom';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { ObjectifCommercialAdmin } from '../../lib/mockAdminOrg';

export const ObjectifsAdminPage: React.FC = () => {
  const { objectifs, addObjectif, commerciaux } = useAuth();
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [isDefineOpen, setIsDefineOpen] = useState(false);

  // Form state
  const [formCommercialId, setFormCommercialId] = useState(commerciaux[0]?.id || '');
  const [formType, setFormType] = useState<'ca' | 'ventes' | 'prospects'>('ca');
  const [formObjectif, setFormObjectif] = useState('');
  const [formPeriodeType, setFormPeriodeType] = useState<'hebdomadaire' | 'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const [formDebut, setFormDebut] = useState('2026-08-01');
  const [formFin, setFormFin] = useState('2026-08-31');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const handleDefine = () => {
    if (!formObjectif || !formDebut || !formFin) return;
    const commercial = commerciaux.find(p => p.id === formCommercialId);
    const periodeLabel = `${formDebut} → ${formFin}`;
    addObjectif({
      commercialId: formCommercialId,
      commercialNom: commercial ? `${commercial.prenom} ${commercial.nom}` : 'Inconnu',
      type: formType,
      objectif: Number(formObjectif),
      realise: 0,
      periode: periodeLabel,
    });
    setIsDefineOpen(false);
    setFormObjectif('');
    setToastMessage('Objectif défini avec succès !');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const groupedByCommercial = objectifs.reduce((acc, obj) => {
    if (!acc[obj.commercialId]) acc[obj.commercialId] = [];
    acc[obj.commercialId].push(obj);
    return acc;
  }, {} as Record<string, ObjectifCommercialAdmin[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Objectifs Commerciaux</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Définissez et suivez les objectifs de chaque commercial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={() => setIsDefineOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Définir un objectif</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Commerciaux suivis</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">{Object.keys(groupedByCommercial).length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Objectifs définis</span>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <span className="text-lg font-bold text-foreground">{objectifs.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Taux atteinte moyen</span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <span className="text-lg font-bold text-emerald-600">
            {objectifs.length > 0
              ? Math.round(objectifs.reduce((s, o) => s + Math.min(100, (o.realise / o.objectif) * 100), 0) / objectifs.length)
              : 0}%
          </span>
        </div>
      </div>

      {/* Per Commercial */}
      <div className="space-y-4">
        {Object.entries(groupedByCommercial).map(([commId, objs]) => {
          const comm = commerciaux.find(p => p.id === commId);
          const initials = objs[0]?.commercialNom.split(' ').map(n => n[0]).join('') || '?';

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
                      {comm.email} • {comm.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                {objs.map((obj) => {
                  const percent = Math.min(100, Math.round((obj.realise / obj.objectif) * 100));
                  const isCA = obj.type === 'ca';

                  return (
                    <div key={obj.id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground capitalize">
                          {obj.type === 'ca' ? 'Chiffre d\'affaires' : obj.type === 'ventes' ? 'Nombre de ventes' : 'Prospects créés'}
                        </span>
                        <span className="text-muted-foreground">{obj.periode}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {isCA ? fmt(obj.realise) : obj.realise} / {isCA ? fmt(obj.objectif) : obj.objectif}
                        </span>
                        <span className={`font-bold ${percent >= 100 ? 'text-emerald-600' : percent >= 70 ? 'text-foreground' : 'text-amber-600'}`}>
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${percent >= 100 ? 'bg-emerald-500' : percent >= 70 ? 'bg-gradient-faciloop' : 'bg-amber-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Définir un objectif Modal */}
      {isDefineOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Définir un objectif
              </h2>
              <button onClick={() => setIsDefineOpen(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <SelectCustom
                label="Commercial *"
                value={formCommercialId}
                onChange={setFormCommercialId}
                searchable={true}
                options={commerciaux.map(c => ({ value: c.id, label: `${c.prenom} ${c.nom}` }))}
              />

              <SelectCustom
                label="Type d'objectif *"
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
                  Valeur cible * {formType === 'ca' && '(en FCFA)'}
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
                  Type de période
                </label>
                <select
                  value={formPeriodeType}
                  onChange={(e) => setFormPeriodeType(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestriel</option>
                  <option value="annuel">Annuel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date début *</label>
                  <input
                    type="date"
                    value={formDebut}
                    onChange={(e) => setFormDebut(e.target.value)}
                    className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Date fin *</label>
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
                Annuler
              </button>
              <button
                onClick={handleDefine}
                disabled={!formObjectif}
                className="flex-1 py-3 rounded-xl bg-gradient-faciloop text-white text-xs font-bold hover:opacity-95 shadow-md disabled:opacity-50"
              >
                Définir l'objectif
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
