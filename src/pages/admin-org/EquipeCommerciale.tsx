import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, UserCheck, Shield, X, Check, Mail, Phone, MessageSquare, Power, AlertTriangle, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import { formatPhoneNumber } from '../../utils/formatters';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { Commercial } from '../../types/crm';
import { PhoneInput } from '../../components/common/PhoneInput';
import { supabase } from '../../lib/supabase';

export const EquipeCommerciale: React.FC = () => {
  const { t } = useTranslation('admin');
  const { commerciaux: team, addCommercial, toggleCommercialStatus, updateCommercial, deleteCommercial, refreshUser, currentOrg } = useAuth();
  const { canAddCommercial, activeCommerciaux, plan, formuleCode, maxCommerciaux, hasCustomQuota } = usePlanLimits();

  // Quota initialisé immédiatement depuis currentOrg si disponible
  const [freshMaxCommerciaux, setFreshMaxCommerciaux] = useState<number | null | undefined>(
    currentOrg?.max_commerciaux !== undefined ? currentOrg.max_commerciaux : undefined
  );
  const [quotaLoading, setQuotaLoading] = useState(false);

  const fetchQuota = async () => {
    if (!currentOrg?.id) return;
    try {
      const { data } = await supabase
        .from('organizations')
        .select('max_commerciaux, formule_code')
        .eq('id', currentOrg.id)
        .single();
      if (data) {
        setFreshMaxCommerciaux(data.max_commerciaux ?? null);
      }
    } catch (err) {
      console.warn('[EquipeCommerciale] Erreur fetchQuota:', err);
    }
  };

  // ── Écoute temps réel + synchronisation immédiate du quota ─────
  // Dès que le superadmin modifie le quota en BDD, l'interface le reflète sans délai.
  useEffect(() => {
    if (!currentOrg?.id) return;

    fetchQuota();

    const channel = supabase
      .channel(`org-quota-live-${currentOrg.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organizations', filter: `id=eq.${currentOrg.id}` },
        (payload) => {
          const updated = payload.new as { max_commerciaux?: number | null };
          if (updated && 'max_commerciaux' in updated) {
            setFreshMaxCommerciaux(updated.max_commerciaux ?? null);
          }
          refreshUser?.();
        }
      )
      .subscribe();

    // Polling actif court (3s) + détection du retour sur l'onglet
    const interval = setInterval(fetchQuota, 3000);
    const onFocus = () => { fetchQuota(); };
    window.addEventListener('focus', onFocus);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [currentOrg?.id]);

  // Quota effectif : valeur fraîche BDD si disponible, sinon celle du currentOrg / hook
  const effectiveMax = (freshMaxCommerciaux != null && freshMaxCommerciaux > 0)
    ? freshMaxCommerciaux
    : (currentOrg?.max_commerciaux != null && currentOrg.max_commerciaux > 0 ? currentOrg.max_commerciaux : maxCommerciaux);
  const currentActiveCount = team.filter(c => c.statut === 'actif').length;
  const effectiveCanAdd = currentActiveCount < effectiveMax;
  const effectiveHasCustom = (freshMaxCommerciaux != null && freshMaxCommerciaux > 0) ||
    (currentOrg?.max_commerciaux != null && currentOrg.max_commerciaux > 0);

  // Debug logs
  console.log('[EquipeCommerciale] freshMaxCommerciaux:', freshMaxCommerciaux);
  console.log('[EquipeCommerciale] maxCommerciaux (hook):', maxCommerciaux);
  console.log('[EquipeCommerciale] effectiveMax:', effectiveMax);
  console.log('[EquipeCommerciale] activeCommerciaux:', activeCommerciaux);
  console.log('[EquipeCommerciale] effectiveCanAdd:', effectiveCanAdd);
  console.log('[EquipeCommerciale] quotaLoading:', quotaLoading);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fermer automatiquement le modal si le quota est atteint pendant qu'il est ouvert
  useEffect(() => {
    if (isModalOpen && !effectiveCanAdd) {
      setIsModalOpen(false);
      toast.error(`Quota atteint : ${currentActiveCount} / ${effectiveMax} commerciaux.`);
    }
  }, [isModalOpen, effectiveCanAdd, currentActiveCount, effectiveMax]);

  // Add form
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingComm, setDeletingComm] = useState<Commercial | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNom, setEditNom] = useState('');
  const [editPrenom, setEditPrenom] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editTelephone, setEditTelephone] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const openEdit = (comm: Commercial) => {
    setEditingId(comm.id);
    setEditNom(comm.nom);
    setEditPrenom(comm.prenom || '');
    setEditEmail(comm.email);
    setEditTelephone(comm.telephone);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    try {
      await updateCommercial(editingId, { nom: editNom, prenom: editPrenom, email: editEmail, telephone: editTelephone });
      toast.success(t('adminOrg.equipe.updated'));
      setEditingId(null);
    } catch {
      toast.error(t('adminOrg.equipe.updateFailed'));
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingComm) return;
    setDeleteLoading(true);
    try {
      await deleteCommercial(deletingComm.id);
      toast.success(t('adminOrg.equipe.deleted'));
    } catch {
      toast.error(t('adminOrg.equipe.deleteFailed'));
    } finally {
      setDeleteLoading(false);
      setDeletingComm(null);
    }
  };

  const toggleStatus = (id: string) => {
    const comm = team.find(c => c.id === id);
    if (comm?.statut === 'inactif' && !effectiveCanAdd) {
      toast.error(`Impossible d'activer ce commercial : le quota de ${effectiveMax} commercial${effectiveMax > 1 ? 'aux' : ''} est déjà atteint.`);
      return;
    }
    toggleCommercialStatus(id);
    const statusKey = comm?.statut === 'actif' ? 'statusDeactivated' : 'statusActivated';
    toast.success(t('adminOrg.equipe.statusChanged', { status: t(`adminOrg.equipe.${statusKey}`) }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    // Vérification locale stricte AVANT l'appel à addCommercial pour éviter les race conditions
    if (!effectiveCanAdd) {
      const msg = `Quota atteint : cette entreprise est limitée à ${effectiveMax} commercial${effectiveMax > 1 ? 'aux' : ''}.`;
      setAddError(msg);
      toast.error(msg);
      return;
    }

    setAddError(null);
    setAddLoading(true);
    try {
      await addCommercial({ nom, prenom, email, telephone, statut: 'actif' });
      toast.success(t('adminOrg.equipe.created', { name: `${prenom} ${nom}` }));
      setIsModalOpen(false);
      setNom(''); setPrenom(''); setEmail(''); setTelephone('');
    } catch (err: any) {
      const msg = err.message || t('adminOrg.equipe.modal.errorDefault');
      setAddError(msg);
      toast.error(msg);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            {t('adminOrg.equipe.title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t('adminOrg.equipe.subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            if (!effectiveCanAdd) {
              toast.error(
                effectiveHasCustom
                  ? `Quota atteint : cette entreprise est limitée à ${effectiveMax} commercial${effectiveMax > 1 ? 'aux' : ''}.`
                  : t('adminOrg.equipe.limitReachedUpgrade', { max: effectiveMax === Infinity ? '∞' : effectiveMax, plan: plan.label })
              );
              return;
            }
            setIsModalOpen(true);
          }}
          disabled={quotaLoading || !effectiveCanAdd}
          title={!effectiveCanAdd ? `Quota maximal atteint (${currentActiveCount}/${effectiveMax})` : undefined}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-lg transition-all ${
            quotaLoading || !effectiveCanAdd
              ? 'bg-muted text-muted-foreground/60 border border-border/60 opacity-60 cursor-not-allowed shadow-none'
              : 'bg-gradient-faciloop text-white shadow-primary/25 hover:opacity-95'
          }`}
        >
          {quotaLoading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <UserPlus className="h-4 w-4 shrink-0" />}
          <span>{t('adminOrg.equipe.addBtn')}</span>
        </button>
      </div>

      {/* Plan limit banner */}
      {!quotaLoading && !effectiveCanAdd && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            {effectiveHasCustom
              ? `Limite de commerciaux atteinte : cette entreprise est limitée à ${effectiveMax} commercial${effectiveMax > 1 ? 'aux' : ''}. Contactez le super administrateur pour augmenter ce quota.`
              : t('adminOrg.equipe.limitBanner', { max: effectiveMax === Infinity ? '∞' : effectiveMax, plan: plan.label })}
          </p>
        </div>
      )}

      {/* Quota counter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {currentActiveCount} / {effectiveMax === Infinity ? '∞' : effectiveMax} commercial{effectiveMax !== 1 ? 'aux' : ''}
        </span>
        {effectiveHasCustom ? (
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
            Nombre personnalisé
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-medium">
            {plan.label}
          </span>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">{t('adminOrg.equipe.col.salesRep')}</th>
              <th className="p-4">{t('adminOrg.equipe.col.email', 'Email')}</th>
              <th className="p-4">{t('adminOrg.equipe.col.phone')}</th>
              <th className="p-4">{t('adminOrg.equipe.col.status')}</th>
              <th className="p-4 text-right">{t('adminOrg.equipe.col.action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {team.map((comm) => (
              <tr key={comm.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-bold text-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs shrink-0">
                      {comm.prenom?.[0]}{comm.nom?.[0]}
                    </div>
                    <span>{comm.prenom} {comm.nom}</span>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground font-medium">{comm.email}</td>
                <td className="p-4 font-semibold text-foreground">{formatPhoneNumber(comm.telephone)}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    comm.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {comm.statut === 'actif' ? t('adminOrg.equipe.statusActive', 'Actif') : t('adminOrg.equipe.statusInactive', 'Inactif')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => toggleStatus(comm.id)}
                      className="px-3 py-1.5 rounded-xl border border-input text-xs font-bold hover:bg-muted transition-all"
                    >
                      {comm.statut === 'actif' ? t('adminOrg.equipe.deactivate') : t('adminOrg.equipe.activate')}
                    </button>
                    <button
                      onClick={() => openEdit(comm)}
                      className="p-1.5 rounded-lg border border-input hover:bg-muted transition-all"
                      title={t('adminOrg.equipe.edit')}
                    >
                      <Pencil className="w-3.5 h-3.5 text-primary" />
                    </button>
                    <button
                      onClick={() => setDeletingComm(comm)}
                      className="p-1.5 rounded-lg border border-input hover:bg-red-500/10 hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-all"
                      title={t('adminOrg.equipe.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {team.map((comm) => (
          <div key={comm.id} className="p-4 rounded-2xl border border-border/80 bg-card space-y-3 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
                  {comm.prenom?.[0]}{comm.nom?.[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">{comm.prenom} {comm.nom}</h3>
                  <p className="text-xs text-muted-foreground font-medium truncate max-w-[180px]">{comm.email}</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase shrink-0 ${
                comm.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {comm.statut === 'actif' ? t('adminOrg.equipe.statusActive', 'Actif') : t('adminOrg.equipe.statusInactive', 'Inactif')}
              </span>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/${comm.telephone.replace(/\s+/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold hover:bg-emerald-500/20 transition-all"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
                <a
                  href={`tel:${comm.telephone}`}
                  className="p-2 rounded-xl border border-input text-foreground font-bold hover:bg-muted transition-all"
                  title={t('adminOrg.equipe.call')}
                >
                  <Phone className="w-4 h-4 text-primary" />
                </a>
                <span className="font-bold text-foreground text-xs">{formatPhoneNumber(comm.telephone)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(comm)}
                  className="p-2 rounded-xl border border-input hover:bg-muted transition-all"
                  title={t('adminOrg.equipe.edit')}
                >
                  <Pencil className="w-3.5 h-3.5 text-primary" />
                </button>
                <button
                  onClick={() => toggleStatus(comm.id)}
                  className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 ${
                    comm.statut === 'actif'
                      ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeletingComm(comm)}
                  className="p-2 rounded-xl border border-input hover:bg-red-500/10 hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Commercial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-foreground">{t('adminOrg.equipe.modal.title')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.firstName')}</label>
                  <input type="text" required value={prenom} onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Abdoulaye"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.lastName')}</label>
                  <input type="text" required value={nom} onChange={(e) => setNom(e.target.value)}
                    placeholder="Sarr"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.email')}</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="abdoulaye@entreprise.sn"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.phone')}</label>
                <PhoneInput
                  value={telephone}
                  onChange={(val) => setTelephone(val)}
                  placeholder="+33 6 12 34 56 78"
                  disabled={false}
                />
              </div>

              {addError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium">
                  {addError}
                </div>
              )}

              <button type="submit" disabled={addLoading || !effectiveCanAdd}
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {addLoading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  t('adminOrg.equipe.modal.createBtn')
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingComm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t('adminOrg.equipe.deleteModal.title')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t('adminOrg.equipe.deleteModal.warning')}
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              {t('adminOrg.equipe.deleteModal.questionPre')} <span className="font-bold">{deletingComm.prenom} {deletingComm.nom}</span>{t('adminOrg.equipe.deleteModal.questionPost')}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeletingComm(null)}
                className="flex-1 py-3 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground transition-colors"
              >
                {t('adminOrg.equipe.cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-xl bg-destructive text-white text-xs font-bold hover:bg-destructive/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Trash2 className="w-3.5 h-3.5" /> {t('adminOrg.equipe.delete')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Commercial Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Pencil className="w-4 h-4 text-primary" />
                {t('adminOrg.equipe.editTitle')}
              </h2>
              <button onClick={() => setEditingId(null)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.firstName')}</label>
                  <input value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.lastName')}</label>
                  <input value={editNom} onChange={(e) => setEditNom(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.email')}</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.phone')}</label>
                <PhoneInput
                  value={editTelephone}
                  onChange={(val) => setEditTelephone(val)}
                  disabled={false}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setEditingId(null)}
                className="flex-1 py-3 rounded-xl border border-input text-xs font-bold hover:bg-muted text-foreground">
                {t('adminOrg.equipe.cancel')}
              </button>
              <button onClick={handleSaveEdit} disabled={editSaving}
                className="flex-1 py-3 rounded-xl bg-gradient-faciloop text-white text-xs font-bold hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {editSaving
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Save className="w-3.5 h-3.5" /> {t('adminOrg.equipe.save')}</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
