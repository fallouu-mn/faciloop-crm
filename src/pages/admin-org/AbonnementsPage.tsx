import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { OrgOffer, OrgOfferPricing } from '../../lib/mockAdminOrg';
import { CurrencyToggle } from '../../components/common/CurrencyToggle';
import { DeviseCode, convertAmount, formatAmount } from '../../lib/currency';
import { Crown, Plus, Edit3, Trash2, X, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';

type Periodicite = 'mensuel' | 'trimestriel' | 'annuel';

const OFFER_COLORS = [
  'from-blue-500 to-cyan-500',
  'from-violet-500 to-purple-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-500',
];

export const AbonnementsPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const { orgOffers, addOrgOffer, updateOrgOffer, deleteOrgOffer } = useAuth();
  const [devise, setDevise] = useState<DeviseCode>('XOF');
  const [periodView, setPeriodView] = useState<Periodicite>('mensuel');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OrgOffer | null>(null);

  // Form state
  const [formNom, setFormNom] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMensuel, setFormMensuel] = useState('');
  const [formTrimestriel, setFormTrimestriel] = useState('');
  const [formAnnuel, setFormAnnuel] = useState('');
  const [formActif, setFormActif] = useState(true);

  const fmt = (amount: number) => formatAmount(convertAmount(amount, 'XOF', devise), devise);

  const openCreate = () => {
    setEditingOffer(null);
    setFormNom('');
    setFormDescription('');
    setFormMensuel('');
    setFormTrimestriel('');
    setFormAnnuel('');
    setFormActif(true);
    setModalOpen(true);
  };

  const openEdit = (offer: OrgOffer) => {
    setEditingOffer(offer);
    setFormNom(offer.nom);
    setFormDescription(offer.description);
    setFormMensuel(String(offer.tarifs.mensuel));
    setFormTrimestriel(String(offer.tarifs.trimestriel));
    setFormAnnuel(String(offer.tarifs.annuel));
    setFormActif(offer.actif);
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formNom.trim() || !formMensuel) return;
    const tarifs: OrgOfferPricing = {
      mensuel: Number(formMensuel) || 0,
      trimestriel: Number(formTrimestriel) || 0,
      annuel: Number(formAnnuel) || 0,
    };

    if (editingOffer) {
      updateOrgOffer(editingOffer.id, { nom: formNom.trim(), description: formDescription.trim(), tarifs, actif: formActif });
      toast.success(t('adminOrg.abonnements.toast.updated'));
    } else {
      addOrgOffer({ nom: formNom.trim(), description: formDescription.trim(), tarifs, actif: formActif });
      toast.success(t('adminOrg.abonnements.toast.created'));
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteOrgOffer(id);
    toast.success(t('adminOrg.abonnements.toast.deleted'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {t('adminOrg.abonnements.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('adminOrg.abonnements.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CurrencyToggle value={devise} onChange={setDevise} />
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-lg shadow-primary/25 hover:opacity-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('adminOrg.abonnements.addBtn')}</span>
          </button>
        </div>
      </div>

      {/* Period Toggle */}
      <div className="inline-flex items-center rounded-full bg-muted p-1 border border-border text-xs">
        {(['mensuel', 'trimestriel', 'annuel'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodView(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
              periodView === p ? 'bg-gradient-faciloop shadow-sm text-white' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Offers Grid */}
      {orgOffers.length === 0 ? (
        <div className="p-12 text-center space-y-3 border border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">{t('adminOrg.abonnements.empty.title')}</p>
          <p className="text-xs text-muted-foreground">{t('adminOrg.abonnements.empty.subtitle')}</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-faciloop text-white text-xs font-bold shadow-md"
          >
            <Plus className="w-4 h-4" /> {t('adminOrg.abonnements.empty.btn')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...orgOffers].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((offer, idx) => {
            const colorClass = OFFER_COLORS[idx % OFFER_COLORS.length];
            return (
              <div key={offer.id} className={`rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-md ${!offer.actif ? 'opacity-60' : 'border-border'}`}>
                <div className={`h-2 bg-gradient-to-r ${colorClass}`} />
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{offer.nom}</h3>
                      {offer.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{offer.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${offer.actif ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      {offer.actif ? t('adminOrg.abonnements.status.active') : t('adminOrg.abonnements.status.inactive')}
                    </span>
                  </div>

                  <div className="text-2xl font-black text-foreground">
                    {fmt(offer.tarifs[periodView])}
                    <span className="text-xs font-medium text-muted-foreground ml-1">
                      /{t(`adminOrg.abonnements.periodShort.${periodView}`)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('adminOrg.abonnements.period.mensuel')}</span>
                      <span className="font-bold text-foreground">{fmt(offer.tarifs.mensuel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('adminOrg.abonnements.period.trimestriel')}</span>
                      <span className="font-bold text-foreground">{fmt(offer.tarifs.trimestriel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('adminOrg.abonnements.period.annuel')}</span>
                      <span className="font-bold text-foreground">{fmt(offer.tarifs.annuel)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => openEdit(offer)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-input text-xs font-bold text-foreground hover:bg-muted transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> {t('adminOrg.abonnements.edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="p-2 rounded-xl border border-input text-rose-500 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                {editingOffer ? t('adminOrg.abonnements.modal.editTitle') : t('adminOrg.abonnements.modal.createTitle')}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-muted rounded-lg">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.abonnements.modal.name')}</label>
                <input
                  type="text"
                  value={formNom}
                  onChange={(e) => setFormNom(e.target.value)}
                  placeholder="Ex: Premium, VIP, Entreprise..."
                  className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.abonnements.modal.description')}</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Description courte de l'offre"
                  className="w-full p-3 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2.5">
                <p className="font-bold text-foreground text-xs">{t('adminOrg.abonnements.pricing')}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Mensuel *</label>
                    <input
                      type="number"
                      value={formMensuel}
                      onChange={(e) => setFormMensuel(e.target.value)}
                      placeholder="150000"
                      className="w-full p-2.5 rounded-lg border border-input bg-background font-medium text-foreground text-xs focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Trimestriel</label>
                    <input
                      type="number"
                      value={formTrimestriel}
                      onChange={(e) => setFormTrimestriel(e.target.value)}
                      placeholder="405000"
                      className="w-full p-2.5 rounded-lg border border-input bg-background font-medium text-foreground text-xs focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">Annuel</label>
                    <input
                      type="number"
                      value={formAnnuel}
                      onChange={(e) => setFormAnnuel(e.target.value)}
                      placeholder="1440000"
                      className="w-full p-2.5 rounded-lg border border-input bg-background font-medium text-foreground text-xs focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-border">
                <span className="font-semibold text-foreground">{t('adminOrg.abonnements.offerActive')}</span>
                <button
                  type="button"
                  onClick={() => setFormActif(!formActif)}
                  className="text-foreground"
                >
                  {formActif ? (
                    <ToggleRight className="w-7 h-7 text-emerald-500" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground"
              >
                {t('adminOrg.abonnements.modal.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formNom.trim() || !formMensuel}
                className="flex-1 py-3 rounded-xl bg-gradient-faciloop text-white text-xs font-bold hover:opacity-95 shadow-md disabled:opacity-50"
              >
                {editingOffer ? t('adminOrg.abonnements.modal.save') : t('adminOrg.abonnements.modal.create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
