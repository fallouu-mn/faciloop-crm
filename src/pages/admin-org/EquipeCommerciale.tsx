import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, UserCheck, Shield, X, Check, Mail, Phone, MessageSquare, Power, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePlanLimits } from '../../hooks/usePlanLimits';

export const EquipeCommerciale: React.FC = () => {
  const { t, i18n } = useTranslation('admin');
  const isEn = i18n.language?.startsWith('en');
  const { commerciaux: team, addCommercial, toggleCommercialStatus } = useAuth();
  const { canAddCommercial, activeCommerciaux, plan, formuleCode } = usePlanLimits();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [telephone, setTelephone] = useState<string>('');
  const [addLoading, setAddLoading] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  const toggleStatus = (id: string) => {
    const comm = team.find(c => c.id === id);
    toggleCommercialStatus(id);
    const newStatus = comm?.statut === 'actif' ? 'désactivé' : 'activé';
    toast.success(`Commercial ${newStatus} avec succès.`);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAddCommercial) {
      setAddError(isEn
        ? `Limit reached (${plan.maxCommerciaux} sales reps on ${plan.label}).`
        : `Limite atteinte (${plan.maxCommerciaux} commerciaux sur ${plan.label}).`
      );
      return;
    }
    setAddError(null);
    setAddLoading(true);
    try {
      await addCommercial({ nom, prenom, email, telephone, statut: 'actif' });
      toast.success(`Commercial ${prenom} ${nom} créé avec succès !`);
      setIsModalOpen(false);
      setNom('');
      setPrenom('');
      setEmail('');
      setTelephone('');
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
            if (!canAddCommercial) {
              toast.error(isEn
                ? `Limit reached (${plan.maxCommerciaux} sales reps on ${plan.label}). Upgrade your plan to add more.`
                : `Limite atteinte (${plan.maxCommerciaux} commerciaux sur ${plan.label}). Passez à une offre supérieure pour en ajouter.`
              );
              return;
            }
            setIsModalOpen(true);
          }}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-lg transition-all ${
            canAddCommercial
              ? 'bg-gradient-faciloop text-white shadow-primary/25 hover:opacity-95'
              : 'bg-muted text-muted-foreground shadow-none cursor-not-allowed'
          }`}
        >
          <UserPlus className="h-4 w-4 shrink-0" />
          <span>{t('adminOrg.equipe.addBtn')}</span>
        </button>
      </div>

      {/* Plan limit banner */}
      {!canAddCommercial && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-300/50 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700/30">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
            {isEn
              ? `You have reached the limit of ${plan.maxCommerciaux} active sales reps on the ${plan.label} plan. Upgrade to add more.`
              : `Vous avez atteint la limite de ${plan.maxCommerciaux} commerciaux actifs sur l'offre ${plan.label}. Passez à une offre supérieure pour en ajouter.`}
          </p>
        </div>
      )}

      {/* Desktop Table View (Horizontal scroll wrapper) */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-xs min-w-[650px]">
          <thead className="border-b border-border/80 bg-muted/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">{t('adminOrg.equipe.col.salesRep')}</th>
              <th className="p-4">Email</th>
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
                <td className="p-4 font-semibold text-foreground">{comm.telephone}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                    comm.statut === 'actif' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {comm.statut}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => toggleStatus(comm.id)}
                    className="px-3 py-1.5 rounded-xl border border-input text-xs font-bold hover:bg-muted transition-all"
                  >
                    {comm.statut === 'actif' ? t('adminOrg.equipe.deactivate') : t('adminOrg.equipe.activate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (Solves Screenshot 1) */}
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
                {comm.statut}
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
                  title="Appeler"
                >
                  <Phone className="w-4 h-4 text-primary" />
                </a>
                <span className="font-bold text-foreground text-xs">{comm.telephone}</span>
              </div>

              <button
                onClick={() => toggleStatus(comm.id)}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 ${
                  comm.statut === 'actif'
                    ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{comm.statut === 'actif' ? t('adminOrg.equipe.deactivate') : t('adminOrg.equipe.activate')}</span>
              </button>
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
                  <input
                    type="text"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Abdoulaye"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.lastName')}</label>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Sarr"
                    className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.email')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abdoulaye@entreprise.sn"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">{t('adminOrg.equipe.modal.phone')}</label>
                <input
                  type="tel"
                  required
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  placeholder="+221 77 000 11 22"
                  className="w-full p-2.5 rounded-xl border border-input bg-background font-medium text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {addError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-medium">
                  {addError}
                </div>
              )}

              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-3 rounded-xl bg-gradient-faciloop text-white font-bold shadow-md hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
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
    </div>
  );
};
