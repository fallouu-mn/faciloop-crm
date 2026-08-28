import React, { useState, useEffect } from 'react';
import { Crown, Check, Pencil, X, Save, Plus, Loader2 } from 'lucide-react';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DeviseCode, convertAmount, formatAmount, getDeviseSymbol } from '../../lib/currency';
import {
  FormuleConfig,
  getFormules,
  createFormule,
  updateFormule,
  toggleFormuleActive,
} from '../../services/formulesSaas';

const PERIODICITES = [
  { code: 'mensuel', label: 'Mensuel' },
  { code: 'trimestriel', label: 'Trimestriel' },
  { code: 'annuel', label: 'Annuel' },
];

export const AbonnementsPageSuperAdmin: React.FC = () => {
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [formules, setFormules] = useState<FormuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFormule, setEditingFormule] = useState<string | null>(null);
  const [editPricing, setEditPricing] = useState<FormuleConfig['pricing'] | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMensuel, setNewMensuel] = useState(0);
  const [newPremierMois, setNewPremierMois] = useState(0);
  const [newTrimestriel, setNewTrimestriel] = useState(0);
  const [newAnnuel, setNewAnnuel] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFormules();
        setFormules(data);
      } catch (err) {
        console.error('Erreur chargement formules:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);
  const symbol = getDeviseSymbol(devise);

  const toDisplay = (xofValue: number) => convertAmount(xofValue, 'XOF', devise);
  const toXof = (displayValue: number) => convertAmount(displayValue, devise, 'XOF');

  const startEdit = (code: string) => {
    const f = formules.find(fo => fo.code === code);
    if (f) {
      setEditingFormule(code);
      setEditPricing({ ...f.pricing });
    }
  };

  const cancelEdit = () => {
    setEditingFormule(null);
    setEditPricing(null);
  };

  const saveEdit = async () => {
    if (!editingFormule || !editPricing) return;
    try {
      const updated = await updateFormule(editingFormule, {
        pricing: editPricing,
        prix_xof: editPricing.mensuel,
      });
      setFormules(prev => prev.map(f => f.code === editingFormule ? updated : f));
    } catch (err) {
      console.error('Erreur sauvegarde:', err);
    }
    setEditingFormule(null);
    setEditPricing(null);
  };

  const handleToggleActive = async (code: string) => {
    const f = formules.find(fo => fo.code === code);
    if (!f) return;
    const newActive = !f.isActive;
    try {
      await toggleFormuleActive(code, newActive);
      setFormules(prev => prev.map(fo => fo.code === code ? { ...fo, isActive: newActive } : fo));
    } catch (err) {
      console.error('Erreur toggle:', err);
    }
  };

  const handleAddOffer = () => {
    setNewLabel('');
    setNewDescription('');
    setNewMensuel(0);
    setNewPremierMois(0);
    setNewTrimestriel(0);
    setNewAnnuel(0);
    setIsAddModalOpen(true);
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const mensuelXof = toXof(newMensuel);
    const premierMoisXof = newPremierMois ? toXof(newPremierMois) : null;
    const trimestrielXof = toXof(newTrimestriel);
    const trimestrielNormal = mensuelXof * 3;
    const annuelXof = toXof(newAnnuel);
    const annuelNormal = mensuelXof * 12;

    const newFormule: FormuleConfig = {
      code: newLabel,
      label: newLabel,
      prix_xof: mensuelXof,
      isActive: true,
      description: newDescription,
      pricing: {
        mensuel: mensuelXof,
        mensuel_premier_mois: premierMoisXof,
        trimestriel: trimestrielXof,
        trimestriel_normal: trimestrielNormal,
        trimestriel_remise: trimestrielNormal > 0 ? Math.round((1 - trimestrielXof / trimestrielNormal) * 100) : 0,
        annuel: annuelXof,
        annuel_normal: annuelNormal,
        annuel_remise: annuelNormal > 0 ? Math.round((1 - annuelXof / annuelNormal) * 100) : 0,
      },
    };

    try {
      const created = await createFormule(newFormule);
      setFormules(prev => [...prev, created]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Erreur création formule:', err);
    }
  };

  const getPeriodLabel = (periodicite: string): string => {
    return PERIODICITES.find(p => p.code === periodicite)?.label || periodicite;
  };

  const updateEditField = (field: keyof FormuleConfig['pricing'], displayValue: number) => {
    if (!editPricing) return;
    const xofValue = toXof(displayValue);
    const updated = { ...editPricing, [field]: xofValue };

    if (field === 'trimestriel' || field === 'trimestriel_normal') {
      const normal = field === 'trimestriel_normal' ? xofValue : updated.trimestriel_normal;
      const forfait = field === 'trimestriel' ? xofValue : updated.trimestriel;
      updated.trimestriel_remise = normal > 0 ? Math.round((1 - forfait / normal) * 100) : 0;
    }
    if (field === 'annuel' || field === 'annuel_normal') {
      const normal = field === 'annuel_normal' ? xofValue : updated.annuel_normal;
      const forfait = field === 'annuel' ? xofValue : updated.annuel;
      updated.annuel_remise = normal > 0 ? Math.round((1 - forfait / normal) * 100) : 0;
    }

    setEditPricing(updated);
  };

  const defaultColor = { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/20', gradient: 'from-purple-500 to-purple-600' };
  const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    Pro: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/20', gradient: 'from-blue-500 to-blue-600' },
    Business: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/20', gradient: 'from-amber-500 to-amber-600' },
    Premium: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/20', gradient: 'from-emerald-500 to-emerald-600' },
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Abonnements</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              Source de référence
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configuration des offres et tarifs — {formules.length} formule{formules.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={handleAddOffer}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-faciloop px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Ajouter une offre</span>
            <span className="sm:hidden">Offre</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {formules.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Crown className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Aucune formule configurée</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Créez votre première offre d'abonnement pour commencer à facturer vos clients.
          </p>
          <button
            onClick={handleAddOffer}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-faciloop px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity mt-2"
          >
            <Plus className="h-4 w-4" />
            Créer une offre
          </button>
        </div>
      )}

      {/* Offers Grid */}
      {formules.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {formules.map((f) => {
            const color = colors[f.code] || defaultColor;
            const isEditing = editingFormule === f.code;

            return (
              <div
                key={f.code}
                className={`rounded-xl border bg-card overflow-hidden transition-all ${
                  f.isActive ? `${color.border} border` : 'border-border opacity-60'
                }`}
              >
                {/* Card Header */}
                <div className={`px-5 py-4 bg-gradient-to-r ${color.gradient} text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5" />
                      <span className="text-lg font-bold">{f.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(f.code)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          f.isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-black/20 text-white/70'
                        }`}
                      >
                        {f.isActive ? 'Actif' : 'Inactif'}
                      </button>
                      {!isEditing && (
                        <button
                          onClick={() => startEdit(f.code)}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/80 mt-1">{f.description}</p>
                </div>

                {/* Pricing Table */}
                <div className="p-4 space-y-3">
                  {/* Mensuel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {getPeriodLabel('mensuel')}
                      </span>
                      {f.pricing.mensuel_premier_mois && !isEditing && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                          1er mois: {fmt(f.pricing.mensuel_premier_mois)}
                        </span>
                      )}
                    </div>
                    {isEditing && editPricing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">Prix/mois</label>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={toDisplay(editPricing.mensuel)}
                              onChange={e => updateEditField('mensuel', Number(e.target.value))}
                              className="w-full h-8 px-2 pr-14 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{symbol}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">1er mois</label>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={editPricing.mensuel_premier_mois ? toDisplay(editPricing.mensuel_premier_mois) : ''}
                              onChange={e => setEditPricing({ ...editPricing, mensuel_premier_mois: e.target.value ? toXof(Number(e.target.value)) : null })}
                              placeholder="Optionnel"
                              className="w-full h-8 px-2 pr-14 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{symbol}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">{fmt(f.pricing.mensuel)}</span>
                        <span className="text-xs text-muted-foreground">/mois</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border" />

                  {/* Trimestriel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {getPeriodLabel('trimestriel')}
                      </span>
                      {f.pricing.trimestriel_remise > 0 && !isEditing && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                          -{f.pricing.trimestriel_remise}%
                        </span>
                      )}
                    </div>
                    {isEditing && editPricing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">Forfait</label>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={toDisplay(editPricing.trimestriel)}
                              onChange={e => updateEditField('trimestriel', Number(e.target.value))}
                              className="w-full h-8 px-2 pr-14 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{symbol}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">Normal</label>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={toDisplay(editPricing.trimestriel_normal)}
                              onChange={e => updateEditField('trimestriel_normal', Number(e.target.value))}
                              className="w-full h-8 px-2 pr-14 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{symbol}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">Remise</label>
                          <div className="flex-1 h-8 px-2 rounded-md border border-input bg-muted/50 text-xs flex items-center text-muted-foreground font-medium">
                            -{editPricing.trimestriel_remise}% <span className="ml-1 text-[10px]">(auto)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-foreground">{fmt(f.pricing.trimestriel)}</span>
                          <span className="text-xs text-muted-foreground">/3 mois</span>
                        </div>
                        {f.pricing.trimestriel_normal > f.pricing.trimestriel && (
                          <span className="text-xs text-muted-foreground line-through">
                            {fmt(f.pricing.trimestriel_normal)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border" />

                  {/* Annuel */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {getPeriodLabel('annuel')}
                      </span>
                      {f.pricing.annuel_remise > 0 && !isEditing && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                          -{f.pricing.annuel_remise}%
                        </span>
                      )}
                    </div>
                    {isEditing && editPricing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">Forfait</label>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={toDisplay(editPricing.annuel)}
                              onChange={e => updateEditField('annuel', Number(e.target.value))}
                              className="w-full h-8 px-2 pr-14 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{symbol}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">Normal</label>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={toDisplay(editPricing.annuel_normal)}
                              onChange={e => updateEditField('annuel_normal', Number(e.target.value))}
                              className="w-full h-8 px-2 pr-14 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{symbol}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">Remise</label>
                          <div className="flex-1 h-8 px-2 rounded-md border border-input bg-muted/50 text-xs flex items-center text-muted-foreground font-medium">
                            -{editPricing.annuel_remise}% <span className="ml-1 text-[10px]">(auto)</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-foreground">{fmt(f.pricing.annuel)}</span>
                          <span className="text-xs text-muted-foreground">/an</span>
                        </div>
                        {f.pricing.annuel_normal > f.pricing.annuel && (
                          <span className="text-xs text-muted-foreground line-through">
                            {fmt(f.pricing.annuel_normal)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Edit Actions */}
                  {isEditing && (
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <button
                        onClick={cancelEdit}
                        className="flex-1 h-9 rounded-full border border-border text-xs font-medium hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-1.5"
                      >
                        <X className="h-3.5 w-3.5" />
                        Annuler
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex-1 h-9 rounded-full bg-gradient-faciloop text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        Enregistrer
                      </button>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="px-4 pb-4">
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Inclus</span>
                    <div className="space-y-1.5">
                      {getFeatures(f.code, isEn).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className={`h-3.5 w-3.5 ${color.text} shrink-0`} />
                          <span className="text-xs text-foreground">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pricing Summary Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">
            {isEn ? 'Full Pricing Matrix' : 'Grille Tarifaire Complète'}
          </h2>
          <span className="text-[10px] text-muted-foreground">
            {isEn ? `Amounts in ${devise}` : `Montants en ${devise}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr className="text-xs font-medium text-muted-foreground">
                <th className="px-4 py-3">{isEn ? 'Plan' : 'Formule'}</th>
                <th className="px-4 py-3">{isEn ? 'Monthly' : 'Mensuel'}</th>
                <th className="px-4 py-3">{isEn ? '1st month' : '1er mois'}</th>
                <th className="px-4 py-3">{isEn ? 'Quarterly' : 'Trimestriel'}</th>
                <th className="px-4 py-3">{isEn ? 'Qtr. Discount' : 'Remise Trim.'}</th>
                <th className="px-4 py-3">{isEn ? 'Annual' : 'Annuel'}</th>
                <th className="px-4 py-3">{isEn ? 'Annual Discount' : 'Remise Ann.'}</th>
                <th className="px-4 py-3">{isEn ? 'Status' : 'Statut'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {formules.map((f) => {
                const color = colors[f.code] || defaultColor;
                return (
                  <tr key={f.code} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${color.gradient}`} />
                        <span className="font-semibold text-foreground">{f.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{fmt(f.pricing.mensuel)}</td>
                    <td className="px-4 py-3 text-amber-600 font-medium">
                      {f.pricing.mensuel_premier_mois ? fmt(f.pricing.mensuel_premier_mois) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{fmt(f.pricing.trimestriel)}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                        -{f.pricing.trimestriel_remise}%
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{fmt(f.pricing.annuel)}</td>
                    <td className="px-4 py-3">
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                        -{f.pricing.annuel_remise}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        f.isActive
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {f.isActive ? (isEn ? 'Active' : 'Actif') : (isEn ? 'Inactive' : 'Inactif')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ajouter une offre */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto font-sans">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {isEn ? 'New Offer' : 'Nouvelle Offre'}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{isEn ? 'Offer Name *' : "Nom de l'offre *"}</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Starter, Pro, Enterprise..."
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Description</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={isEn ? "Ex: For large enterprises" : "Ex: Pour les grandes entreprises"}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {isEn ? `Pricing (${symbol})` : `Tarification (${symbol})`}
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{isEn ? 'Monthly Price *' : 'Prix mensuel *'}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newMensuel || ''}
                      onChange={(e) => setNewMensuel(Number(e.target.value))}
                      placeholder="0"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{isEn ? '1st Month Price (optional)' : 'Prix 1er mois (optionnel)'}</label>
                    <input
                      type="number"
                      value={newPremierMois || ''}
                      onChange={(e) => setNewPremierMois(Number(e.target.value))}
                      placeholder={isEn ? "Leave empty if no promo" : "Laisser vide si pas de promo"}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{isEn ? 'Quarterly Package *' : 'Forfait trimestriel *'}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newTrimestriel || ''}
                      onChange={(e) => setNewTrimestriel(Number(e.target.value))}
                      placeholder="0"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                    {newMensuel > 0 && newTrimestriel > 0 && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        {isEn ? 'Auto discount' : 'Remise auto'}: -{Math.round((1 - toXof(newTrimestriel) / (toXof(newMensuel) * 3)) * 100)}%
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{isEn ? 'Annual Package *' : 'Forfait annuel *'}</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newAnnuel || ''}
                      onChange={(e) => setNewAnnuel(Number(e.target.value))}
                      placeholder="0"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                    {newMensuel > 0 && newAnnuel > 0 && (
                      <p className="text-[10px] text-emerald-600 font-medium">
                        {isEn ? 'Auto discount' : 'Remise auto'}: -{Math.round((1 - toXof(newAnnuel) / (toXof(newMensuel) * 12)) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-10 rounded-full border border-border text-sm font-medium hover:bg-muted text-foreground transition-colors"
                >
                  {isEn ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-full bg-gradient-faciloop text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  {isEn ? 'Create Offer' : "Créer l'offre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function getFeatures(code: string, isEn = false): string[] {
  if (isEn) {
    switch (code) {
      case 'Pro':
        return [
          'Up to 3 sales reps',
          'Kanban Pipeline',
          'Automatic follow-ups',
          'CSV Export',
        ];
      case 'Business':
        return [
          'Up to 10 sales reps',
          'All Pro features',
          'Team Objectives',
          'Action Audit Log',
          'Priority Support',
        ];
      case 'Premium':
        return [
          'Unlimited sales reps',
          'All Business features',
          'API & Integrations',
          'White label',
          'Dedicated Account Manager',
        ];
      default:
        return [];
    }
  }
  switch (code) {
    case 'Pro':
      return [
        'Jusqu\'à 3 commerciaux',
        'Pipeline Kanban',
        'Relances automatiques',
        'Export CSV',
      ];
    case 'Business':
      return [
        'Jusqu\'à 10 commerciaux',
        'Toutes les fonctionnalités Pro',
        'Objectifs d\'équipe',
        'Journal des actions',
        'Support prioritaire',
      ];
    case 'Premium':
      return [
        'Commerciaux illimités',
        'Toutes les fonctionnalités Business',
        'API & intégrations',
        'Marque blanche',
        'Account manager dédié',
      ];
    default:
      return [];
  }
}
