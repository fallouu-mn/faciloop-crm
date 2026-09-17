import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, Check, Pencil, X, Save, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DeviseCode, convertAmount, formatAmount, getDeviseSymbol, detectDevise } from '../../lib/currency';
import {
  FormuleConfig,
  getFormules,
  createFormule,
  updateFormule,
  toggleFormuleActive,
} from '../../services/formulesSaas';
import { translateText } from '../../lib/translate';
import { useRefetchOnFocus } from '../../hooks/useRefetchOnFocus';

export const AbonnementsPageSuperAdmin: React.FC = () => {
  const { t, i18n } = useTranslation('superAdmin');
  const isEn = i18n.language?.startsWith('en');
  const [devise, setDevise] = useState<DeviseCode>(detectDevise());
  const [formules, setFormules] = useState<FormuleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [enDescriptions, setEnDescriptions] = useState<Record<string, string>>({});
  const translatingCodes = useRef<Set<string>>(new Set());
  const [editingFormule, setEditingFormule] = useState<string | null>(null);
  const [editPricing, setEditPricing] = useState<FormuleConfig['pricing'] | null>(null);
  const [editLabel, setEditLabel] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMensuel, setNewMensuel] = useState(0);
  const [newPremierMois, setNewPremierMois] = useState(0);
  const [newTrimestriel, setNewTrimestriel] = useState(0);
  const [newAnnuel, setNewAnnuel] = useState(0);

  const loadFormules = async () => {
    try {
      const data = await getFormules();
      setFormules(data);
    } catch (err) {
      console.error('Erreur chargement formules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFormules(); }, []);
  useRefetchOnFocus(loadFormules);

  useEffect(() => {
    if (!isEn || formules.length === 0) return;
    const missing = formules.filter(
      f => f.description && !enDescriptions[f.code] && !translatingCodes.current.has(f.code)
    );
    if (missing.length === 0) return;

    missing.forEach(f => translatingCodes.current.add(f.code));

    Promise.all(
      missing.map(async f => {
        const en = await translateText(f.description, 'fr', 'en');
        return [f.code, en] as const;
      })
    ).then(results => {
      setEnDescriptions(prev => ({ ...prev, ...Object.fromEntries(results) }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEn, formules.length]);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);
  const symbol = getDeviseSymbol(devise);

  const toDisplay = (xofValue: number) => convertAmount(xofValue, 'XOF', devise);
  const toXof = (displayValue: number) => convertAmount(displayValue, devise, 'XOF');

  const startEdit = (code: string) => {
    const f = formules.find(fo => fo.code === code);
    if (f) {
      setEditingFormule(code);
      setEditPricing({ ...f.pricing });
      setEditLabel(f.label);
      setEditDescription(f.description || '');
    }
  };

  const cancelEdit = () => {
    setEditingFormule(null);
    setEditPricing(null);
    setEditLabel('');
    setEditDescription('');
  };

  const saveEdit = async () => {
    if (!editingFormule || !editPricing) return;
    try {
      const updated = await updateFormule(editingFormule, {
        label: editLabel,
        description: editDescription,
        pricing: editPricing,
        prix_xof: editPricing.mensuel,
      });
      setFormules(prev => prev.map(f => f.code === editingFormule ? updated : f));
      toast.success(`Formule "${editingFormule}" mise à jour !`);
    } catch (err: any) {
      console.error('Erreur sauvegarde:', err);
      toast.error(`Erreur lors de la mise à jour : ${err?.message || 'Erreur inconnue'}`);
    }
    setEditingFormule(null);
    setEditPricing(null);
    setEditLabel('');
    setEditDescription('');
  };

  const handleToggleActive = async (code: string) => {
    const f = formules.find(fo => fo.code === code);
    if (!f) return;
    const newActive = !f.isActive;
    try {
      await toggleFormuleActive(code, newActive);
      setFormules(prev => prev.map(fo => fo.code === code ? { ...fo, isActive: newActive } : fo));
      toast.success(newActive ? `Formule "${code}" activée !` : `Formule "${code}" désactivée.`);
    } catch (err: any) {
      console.error('Erreur toggle:', err);
      toast.error(`Erreur : ${err?.message || 'Erreur inconnue'}`);
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
      toast.success(`Formule "${newLabel}" créée avec succès !`);
    } catch (err: any) {
      console.error('Erreur création formule:', err);
      toast.error(`Erreur lors de la création : ${err?.message || 'Erreur inconnue'}`);
    }
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

  const defaultColor = { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/20', gradient: 'from-orange-500 to-orange-600' };
  const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
    Pro: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-400/30', gradient: 'from-amber-400 to-amber-500' },
    Business: { bg: 'bg-orange-500/10', text: 'text-orange-600', border: 'border-orange-500/30', gradient: 'from-orange-500 to-amber-500' },
    Premium: { bg: 'bg-orange-600/10', text: 'text-orange-700', border: 'border-orange-600/30', gradient: 'from-orange-600 to-orange-700' },
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
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('abonnements.title')}</h1>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {t('abonnements.badgeRef')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('abonnements.subtitle')} — {t('abonnements.count', { count: formules.length })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={handleAddOffer}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-faciloop px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('abonnements.addBtn')}</span>
            <span className="sm:hidden">{t('abonnements.addBtnShort')}</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {formules.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <Crown className="h-10 w-10 text-muted-foreground mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">{t('abonnements.emptyTitle')}</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {t('abonnements.emptySubtitle')}
          </p>
          <button
            onClick={handleAddOffer}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-faciloop px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity mt-2"
          >
            <Plus className="h-4 w-4" />
            {t('abonnements.createFirstBtn')}
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
                      <Crown className="h-5 w-5 shrink-0" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="bg-white/20 text-white placeholder-white/50 text-lg font-bold px-2 py-0.5 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 w-full"
                        />
                      ) : (
                        <span className="text-lg font-bold">{f.label}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(f.code)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          f.isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-black/20 text-white/70'
                        }`}
                      >
                        {f.isActive ? t('abonnements.statusActive') : t('abonnements.statusInactive')}
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
                  {isEditing ? (
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full mt-2 bg-white/20 text-white placeholder-white/50 text-xs px-2 py-1.5 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                      placeholder={isEn ? 'Offer description...' : 'Description de l\'offre...'}
                    />
                  ) : (
                    <p className="text-xs text-white/80 mt-1">
                      {isEn ? (enDescriptions[f.code] || f.description) : f.description}
                    </p>
                  )}
                </div>

                {/* Pricing Table */}
                <div className="p-4 space-y-3">
                  {/* Monthly */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t('period.mensuel')}
                      </span>
                      {f.pricing.mensuel_premier_mois && !isEditing && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-bold">
                          {t('abonnements.firstMonthBadge', { price: fmt(f.pricing.mensuel_premier_mois) })}
                        </span>
                      )}
                    </div>
                    {isEditing && editPricing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelMonthly')}</label>
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
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelFirst')}</label>
                          <div className="flex-1 relative">
                            <input
                              type="number"
                              value={editPricing.mensuel_premier_mois ? toDisplay(editPricing.mensuel_premier_mois) : ''}
                              onChange={e => setEditPricing({ ...editPricing, mensuel_premier_mois: e.target.value ? toXof(Number(e.target.value)) : null })}
                              placeholder={t('common.optional')}
                              className="w-full h-8 px-2 pr-14 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium">{symbol}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">{fmt(f.pricing.mensuel)}</span>
                        <span className="text-xs text-muted-foreground">{t('period.perMonth')}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border" />

                  {/* Quarterly */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t('period.trimestriel')}
                      </span>
                      {f.pricing.trimestriel_remise > 0 && !isEditing && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                          {t('abonnements.autoDiscount', { pct: f.pricing.trimestriel_remise })}
                        </span>
                      )}
                    </div>
                    {isEditing && editPricing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelPackage')}</label>
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
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelNormal')}</label>
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
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelDiscount')}</label>
                          <div className="flex-1 h-8 px-2 rounded-md border border-input bg-muted/50 text-xs flex items-center text-muted-foreground font-medium">
                            {t('abonnements.autoDiscount', { pct: editPricing.trimestriel_remise })} <span className="ml-1 text-[10px]">{t('common.auto')}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-foreground">{fmt(f.pricing.trimestriel)}</span>
                          <span className="text-xs text-muted-foreground">{t('period.per3Months')}</span>
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

                  {/* Annual */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {t('period.annuel')}
                      </span>
                      {f.pricing.annuel_remise > 0 && !isEditing && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                          {t('abonnements.autoDiscount', { pct: f.pricing.annuel_remise })}
                        </span>
                      )}
                    </div>
                    {isEditing && editPricing ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelPackage')}</label>
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
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelNormal')}</label>
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
                          <label className="text-[10px] text-muted-foreground w-16 shrink-0">{t('abonnements.editLabelDiscount')}</label>
                          <div className="flex-1 h-8 px-2 rounded-md border border-input bg-muted/50 text-xs flex items-center text-muted-foreground font-medium">
                            {t('abonnements.autoDiscount', { pct: editPricing.annuel_remise })} <span className="ml-1 text-[10px]">{t('common.auto')}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-bold text-foreground">{fmt(f.pricing.annuel)}</span>
                          <span className="text-xs text-muted-foreground">{t('period.perYear')}</span>
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
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={saveEdit}
                        className="flex-1 h-9 rounded-full bg-gradient-faciloop text-white text-xs font-semibold shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                      >
                        <Save className="h-3.5 w-3.5" />
                        {t('common.save')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pricing Summary Table */}
      {formules.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{t('abonnements.tableTitle')}</h2>
            <span className="text-[10px] text-muted-foreground">{t('abonnements.tableAmountIn', { devise })}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr className="text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3">{t('abonnements.tableColFormula')}</th>
                  <th className="px-4 py-3">{t('abonnements.tableColMonthly')}</th>
                  <th className="px-4 py-3">{t('abonnements.tableColFirst')}</th>
                  <th className="px-4 py-3">{t('abonnements.tableColQuarterly')}</th>
                  <th className="px-4 py-3">{t('abonnements.tableColDiscQ')}</th>
                  <th className="px-4 py-3">{t('abonnements.tableColAnnual')}</th>
                  <th className="px-4 py-3">{t('abonnements.tableColDiscA')}</th>
                  <th className="px-4 py-3">{t('abonnements.tableColStatus')}</th>
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
                          {t('abonnements.autoDiscount', { pct: f.pricing.trimestriel_remise })}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{fmt(f.pricing.annuel)}</td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                          {t('abonnements.autoDiscount', { pct: f.pricing.annuel_remise })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          f.isActive
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {f.isActive ? t('abonnements.statusActive') : t('abonnements.statusInactive')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Offer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">{t('abonnements.modal.title')}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOffer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('abonnements.modal.labelName')}</label>
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
                <label className="text-sm font-medium text-foreground">{t('abonnements.modal.labelDesc')}</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Pour les grandes entreprises"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                />
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  {t('abonnements.modal.pricingSection', { symbol })}
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('abonnements.modal.labelMonthly')}</label>
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
                    <label className="text-xs font-medium text-foreground">{t('abonnements.modal.labelFirstMonth')}</label>
                    <input
                      type="number"
                      value={newPremierMois || ''}
                      onChange={(e) => setNewPremierMois(Number(e.target.value))}
                      placeholder={t('abonnements.modal.labelFirstMonthPlaceholder')}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('abonnements.modal.labelQuarterly')}</label>
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
                        {t('abonnements.modal.autoDiscount', { pct: Math.round((1 - toXof(newTrimestriel) / (toXof(newMensuel) * 3)) * 100) })}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">{t('abonnements.modal.labelAnnual')}</label>
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
                        {t('abonnements.modal.autoDiscount', { pct: Math.round((1 - toXof(newAnnuel) / (toXof(newMensuel) * 12)) * 100) })}
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
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-full bg-gradient-faciloop text-white text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                >
                  {t('abonnements.modal.createBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
