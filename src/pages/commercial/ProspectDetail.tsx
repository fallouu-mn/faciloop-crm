import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Prospect, MotifPerte } from '../../types/crm';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CalendarClock, 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  UserCheck, 
  X, 
  Check, 
  History,
  PhoneCall,
  Video,
  Send,
  Sparkles,
  ArrowUpRight,
  Clock,
  Briefcase
} from 'lucide-react';
import { WhatsAppActionModal } from '../../components/common/WhatsAppActionModal';
import { WhatsAppIcon } from '../../components/common/WhatsAppIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useProspectDetail, useInteractions, useRelances } from '@/hooks/commercial';

export const ProspectDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, prospects, interactions: authInteractions, relances: authRelances, addInteraction, convertProspectToClient, orgOffers } = useAuth();
  const { prospect: dbProspect } = useProspectDetail(id);
  const { interactions: apiInteractions, createInteraction: apiCreateInteraction } = useInteractions(id);
  const { relances: apiRelances } = useRelances();

  const prospect = dbProspect || prospects.find(p => p.id === id);
  const prospectInteractions = apiInteractions.length > 0 ? apiInteractions : (authInteractions || []).filter((i: any) => i.prospect_id === id);
  const prospectRelances = apiRelances.length > 0 ? apiRelances.filter(r => r.prospect_id === id) : (authRelances || []).filter((r: any) => r.prospect_id === id);
  const prospectsListPath = user?.role === 'admin_org' ? '/admin/prospects' : '/app/prospects';
  const [activeTab, setActiveTab] = useState<'timeline' | 'relances' | 'infos'>('timeline');

  // Interaction Modal State
  const [isInterModalOpen, setIsInterModalOpen] = useState<boolean>(false);
  const [interType, setInterType] = useState<any>('appel');
  const [interComment, setInterComment] = useState<string>('');
  const [interNextAction, setInterNextAction] = useState<string>('');

  // Conversion Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState<boolean>(false);
  const activeOrgOffers = orgOffers.filter(o => o.actif);
  const [formuleSouscrite, setFormuleSouscrite] = useState<string>(activeOrgOffers[0]?.nom || '');
  const [convFrequence, setConvFrequence] = useState<'mensuel' | 'trimestriel' | 'annuel'>('mensuel');
  const [convMontant, setConvMontant] = useState<string>(() => {
    const first = orgOffers.filter(o => o.actif)[0];
    return first ? String(first.tarifs.mensuel) : '';
  });

  const getOfferTarif = (offerNom: string, freq: 'mensuel' | 'trimestriel' | 'annuel') => {
    const offer = activeOrgOffers.find(o => o.nom === offerNom);
    if (!offer) return '';
    return String(offer.tarifs[freq] || 0);
  };

  const handleOfferChange = (nom: string) => {
    setFormuleSouscrite(nom);
    setConvMontant(getOfferTarif(nom, convFrequence));
  };

  const handleFrequenceChange = (freq: 'mensuel' | 'trimestriel' | 'annuel') => {
    setConvFrequence(freq);
    setConvMontant(getOfferTarif(formuleSouscrite, freq));
  };

  // WhatsApp Action Modal State
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);

  const handleWhatsAppClick = () => {
    window.open(
      `https://wa.me/${prospect?.telephone.replace(/\s+/g, '')}?text=${encodeURIComponent(
        isEn
          ? `Hello ${prospect?.prenom || prospect?.nom}, I am Moussa from Faciloop CRM.`
          : `Bonjour ${prospect?.prenom || prospect?.nom}, je suis Moussa de Faciloop CRM.`
      )}`,
      '_blank'
    );
    setIsWhatsAppModalOpen(true);
  };

  if (!prospect) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <p className="text-sm font-extrabold text-muted-foreground">{isEn ? 'Prospect not found.' : 'Prospect introuvable.'}</p>
        <Link to={prospectsListPath} className="text-xs font-extrabold text-primary hover:underline">
          {isEn ? '← Back to prospects list' : '← Retour à la liste des prospects'}
        </Link>
      </div>
    );
  }

  // Generate Prospect Initials
  const initials = `${prospect.prenom?.[0] || ''}${prospect.nom?.[0] || ''}`.toUpperCase() || 'P';

  const handleAddInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    addInteraction({
      prospect_id: prospect.id,
      type: interType,
      statut: 'realisee',
      date: new Date().toISOString().split('T')[0],
      heure: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      commentaire: interComment,
      prochaine_action: interNextAction
    });
    setIsInterModalOpen(false);
    setInterComment('');
    setInterNextAction('');
    toast.success(isEn ? 'Interaction added!' : 'Interaction ajoutée !');
  };

  const handleConvert = () => {
    convertProspectToClient(prospect.id, formuleSouscrite, {
      frequence: convFrequence,
      montant: convMontant ? Number(convMontant) : undefined,
    });
    setIsConvertModalOpen(false);
    toast.success(isEn ? 'Prospect converted to client!' : 'Prospect converti en client !');
    navigate(clientsPath);
  };

  const getStageTitle = (st: string) => {
    if (!isEn) return st.replace('_', ' ');
    const map: Record<string, string> = {
      nouveau: 'New',
      a_contacter: 'To Contact',
      contacte: 'Contacted',
      interesse: 'Interested',
      rdv_programme: 'Meeting Set',
      demo_realisee: 'Demo Done',
      essai_en_cours: 'Trial Ongoing',
      proposition: 'Proposal',
      paiement_att: 'Payment Pending',
      gagne: 'Won Client',
      a_relancer: 'To Follow-up',
      perdu: 'Lost',
    };
    return map[st] || st;
  };

  return (
    <div className="space-y-0 font-sans">
      {/* Full-page detail panel */}
      <div className="w-full max-w-4xl mx-auto bg-card border border-border/80 rounded-2xl shadow-sm flex flex-col overflow-hidden">

        {/* Page Header */}
        <div className="border-b border-border/60 bg-muted/30 px-4 sm:px-6 py-2.5">
          <Link to={prospectsListPath} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            {isEn ? 'Back to prospects list' : 'Retour à la liste des prospects'}
          </Link>
        </div>

        {/* Drawer Header (High Visibility Typography) */}
        <div className="sticky top-0 z-20 border-b border-border/80 bg-card/95 backdrop-blur-xl p-4 sm:p-6 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar Pill with Gradient */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-faciloop text-white flex items-center justify-center font-black text-lg sm:text-xl shadow-lg shadow-primary/20 shrink-0">
              {initials}
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-black text-foreground">{prospect.prenom} {prospect.nom}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary">
                  {getStageTitle(prospect.statut_pipeline)}
                </span>
              </div>
              <p className="text-xs font-bold text-muted-foreground flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {prospect.entreprise}
                </span>
                <span>•</span>
                <span>{prospect.secteur_activite || (isEn ? 'General' : 'Général')}</span>
              </p>
            </div>
          </div>

          {/* Back Button */}
          <Link
            to={prospectsListPath}
            className="w-10 h-10 rounded-xl border border-input text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-all shrink-0 active:scale-95"
            title={isEn ? "Back to list" : "Retour à la liste"}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Quick Action Bar (Generous Touch Paddings for Walking Commercials) */}
        <div className="p-3.5 sm:p-6 border-b border-border/60 bg-muted/20 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppClick}
              title="WhatsApp Direct"
              className="p-2.5 rounded-2xl bg-[#25D366] text-white shadow-md shadow-emerald-500/20 hover:bg-[#1ebe5d] flex items-center justify-center transition-all active:scale-95"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </button>

            <a
              href={`tel:${prospect.telephone}`}
              className="p-3 rounded-2xl border border-input bg-card text-foreground hover:bg-muted text-xs font-extrabold transition-all active:scale-95"
              title={isEn ? "Call" : "Appeler"}
            >
              <Phone className="w-4 h-4 text-primary" />
            </a>

            <a
              href={`mailto:${prospect.email || ''}`}
              className="p-3 rounded-2xl border border-input bg-card text-foreground hover:bg-muted text-xs font-extrabold transition-all active:scale-95"
              title={isEn ? "Send email" : "Envoyer un e-mail"}
            >
              <Mail className="w-4 h-4 text-primary" />
            </a>
          </div>

          {prospect.statut_pipeline !== 'gagne' && (
            <button
              onClick={() => setIsConvertModalOpen(true)}
              className="px-4 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-faciloop text-white text-xs font-extrabold shadow-lg shadow-primary/25 hover:opacity-95 flex items-center gap-1.5 transition-all ml-auto sm:ml-0 active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden sm:inline">{isEn ? 'Convert to Client' : 'Convertir en Client'}</span>
              <span className="sm:hidden">{isEn ? 'Convert' : 'Convertir'}</span>
            </button>
          )}
        </div>

        {/* Fluid Tab Switcher */}
        <div className="px-3 sm:px-6 pt-3 border-b border-border/80 bg-card overflow-x-auto">
          <div className="relative flex gap-1 sm:gap-2 text-xs font-extrabold min-w-max">
            {[
              { id: 'timeline', label: `${isEn ? 'History' : 'Historique'} (${prospectInteractions.length})` },
              { id: 'relances', label: `${isEn ? 'Follow-ups' : 'Relances'} (${prospectRelances.length})` },
              { id: 'infos', label: isEn ? 'Information' : 'Informations' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className="relative z-10 px-3.5 sm:px-4 py-3 text-foreground transition-colors"
              >
                {activeTab === t.id && (
                  <motion.div
                    layoutId="prospect-tab-pill"
                    className="absolute inset-0 border-b-2 border-primary -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={activeTab === t.id ? 'text-primary font-black' : 'text-muted-foreground'}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Contents Area */}
        <div className="p-4 sm:p-6 flex-1 space-y-4 sm:space-y-6">
          {/* Tab 1: Vertical Timeline of Interactions */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {isEn ? 'TIMELINE OF EXCHANGES' : 'Frise Chronologique des Échanges'}
                </h3>
                <button
                  onClick={() => setIsInterModalOpen(true)}
                  className="px-3 py-2 rounded-xl bg-primary text-white font-extrabold text-xs shadow-md shadow-primary/20 hover:opacity-95 flex items-center gap-1 active:scale-95 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Log an interaction' : 'Consigner un échange'}</span>
                </button>
              </div>

              {prospectInteractions.length === 0 ? (
                <div className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-border text-center space-y-2">
                  <History className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs font-black text-foreground">
                    {isEn ? 'No interaction logged yet.' : 'Aucune interaction consignée pour le moment.'}
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {isEn 
                      ? 'Record your calls, demos or WhatsApp exchanges to maintain a smooth history.' 
                      : 'Enregistrez vos appels, démos ou échanges WhatsApp pour conserver un historique fluide.'}
                  </p>
                </div>
              ) : (
                <div className="relative pl-5 sm:pl-6 space-y-4 sm:space-y-6 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-border">
                  {prospectInteractions.map((inter) => {
                    const getIcon = () => {
                      if (inter.type === 'whatsapp') return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
                      if (inter.type === 'demonstration') return <Video className="w-3.5 h-3.5 text-purple-500" />;
                      if (inter.type === 'email') return <Send className="w-3.5 h-3.5 text-blue-500" />;
                      return <PhoneCall className="w-3.5 h-3.5 text-amber-500" />;
                    };

                    return (
                      <div key={inter.id} className="relative flex items-start gap-3 sm:gap-4 group">
                        {/* Timeline Circle Node */}
                        <div className="absolute -left-[26px] sm:-left-[30px] top-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-card bg-muted flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          {getIcon()}
                        </div>

                        <div className="flex-1 p-3.5 sm:p-4 rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md transition-all space-y-1.5 sm:space-y-2">
                          <div className="flex flex-wrap items-center justify-between text-xs gap-1">
                            <span className="font-black text-foreground capitalize flex items-center gap-1.5">
                              {isEn && inter.type === 'appel' ? 'Phone Call' : isEn && inter.type === 'demonstration' ? 'Demonstration' : isEn && inter.type === 'visite' ? 'Client Visit' : inter.type}
                            </span>
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {inter.date} {isEn ? 'at' : 'à'} {inter.heure}
                            </span>
                          </div>

                          <p className="text-xs text-foreground font-semibold leading-relaxed">{inter.commentaire}</p>

                          {inter.prochaine_action && (
                            <div className="pt-2 border-t border-border/50 text-xs font-extrabold text-amber-500 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span>{isEn ? 'Next action' : 'Prochaine action'} : {inter.prochaine_action}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Planned Relances */}
          {activeTab === 'relances' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {isEn ? 'Scheduled Commercial Follow-ups' : 'Relances Commerciales Programmées'}
              </h3>

              {prospectRelances.length === 0 ? (
                <div className="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-border text-center text-xs font-semibold text-muted-foreground">
                  {isEn ? 'No follow-up scheduled for this prospect.' : 'Aucune relance programmée pour ce prospect.'}
                </div>
              ) : (
                prospectRelances.map((rel) => (
                  <div key={rel.id} className="p-3.5 sm:p-4 rounded-2xl border border-border bg-card flex justify-between items-center text-xs shadow-sm">
                    <div className="space-y-1">
                      <div className="font-extrabold text-foreground">{rel.motif || (isEn ? 'Commercial follow-up' : 'Relance suivi commercial')}</div>
                      <div className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" />
                        {rel.date} {isEn ? 'at' : 'à'} {rel.heure}
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-black uppercase text-xs ${
                      rel.statut === 'en_retard' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {isEn && rel.statut === 'en_retard' ? 'Overdue' : isEn && rel.statut === 'en_cours' ? 'Pending' : rel.statut.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Detailed Prospect Information Card */}
          {activeTab === 'infos' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                {isEn ? 'Commercial Profile Summary' : "Fiche d'Identité Commerciale"}
              </h3>

              <div className="p-4 sm:p-5 rounded-3xl border border-border bg-card space-y-4 shadow-sm text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="block text-muted-foreground font-extrabold">{isEn ? 'Primary Phone' : 'Téléphone Principal'}</span>
                    <span className="font-black text-foreground text-sm">{prospect.telephone}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-extrabold">{isEn ? 'Email Address' : 'Adresse Email'}</span>
                    <span className="font-black text-foreground">{prospect.email || (isEn ? 'Not provided' : 'Non renseigné')}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-extrabold">{isEn ? 'Company' : 'Entreprise'}</span>
                    <span className="font-black text-foreground">{prospect.entreprise}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-extrabold">{isEn ? 'Industry / Sector' : "Secteur d'Activité"}</span>
                    <span className="font-black text-foreground">{prospect.secteur_activite || (isEn ? 'General' : 'Général')}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-extrabold">{isEn ? 'Acquisition Source' : "Source d'Acquisition"}</span>
                    <span className="font-black text-foreground capitalize">{prospect.source.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground font-extrabold">{isEn ? 'Estimated Budget' : 'Budget Estimé'}</span>
                    <span className="font-black text-emerald-500 text-sm">
                      {prospect.budget_estime ? `${prospect.budget_estime.toLocaleString()} FCFA` : (isEn ? 'Not defined' : 'Non défini')}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  <span className="block text-muted-foreground font-extrabold mb-0.5">{isEn ? 'Assigned Sales Rep' : 'Commercial Responsable'}</span>
                  <span className="font-black text-primary text-sm">{prospect.commercial_nom || (isEn ? 'Assigned to me' : 'Attribué à moi')}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Interaction Bottom Sheet Modal on Mobile */}
      <AnimatePresence>
        {isInterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans relative"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                  {isEn ? 'Log an Interaction' : 'Consigner une Interaction'}
                </h2>
                <button onClick={() => setIsInterModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddInteraction} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-foreground">{isEn ? 'Interaction type' : "Type d'interaction"}</label>
                  <select
                    value={interType}
                    onChange={(e) => setInterType(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-input bg-background font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="appel">{isEn ? 'Phone Call' : 'Appel Téléphonique'}</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="demonstration">{isEn ? 'Demonstration' : 'Démonstration'}</option>
                    <option value="visite">{isEn ? 'Client Visit' : 'Visite Client'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-foreground">{isEn ? 'Report / Comment' : 'Compte-rendu / Commentaire'}</label>
                  <textarea
                    required
                    rows={3}
                    value={interComment}
                    onChange={(e) => setInterComment(e.target.value)}
                    placeholder={isEn ? "Key points discussed during exchange..." : "Points clés abordés lors de l'échange..."}
                    className="w-full p-3 rounded-2xl border border-input bg-background font-semibold text-foreground"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-foreground">{isEn ? 'Next Action' : 'Prochaine Action'}</label>
                  <input
                    type="text"
                    value={interNextAction}
                    onChange={(e) => setInterNextAction(e.target.value)}
                    placeholder={isEn ? "Ex: Send proposal" : "Ex: Envoyer la proposition commerciale"}
                    className="w-full p-3 rounded-2xl border border-input bg-background font-semibold text-foreground"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setIsInterModalOpen(false)}
                    className="w-full sm:w-1/3 py-3 rounded-2xl border border-input font-bold hover:bg-muted text-foreground"
                  >
                    {isEn ? 'Cancel' : 'Annuler'}
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-2/3 py-3 rounded-2xl bg-gradient-faciloop text-white font-extrabold shadow-md hover:opacity-95"
                  >
                    {isEn ? 'Save interaction' : "Enregistrer l'interaction"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Convert to Client Bottom Sheet Modal on Mobile */}
      <AnimatePresence>
        {isConvertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm font-sans">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-card border-t sm:border border-border/80 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 font-sans relative"
            >
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto sm:hidden mb-1" />

              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  {isEn ? 'Convert to Client' : 'Conversion en Client'}
                </h2>
                <button onClick={() => setIsConvertModalOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground font-semibold">
                {isEn
                  ? `Converting ${prospect.entreprise} to an official client.`
                  : `Conversion de ${prospect.entreprise} en client officiel.`}
              </p>

              <div className="space-y-3 text-xs">
                {/* Offre */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">{isEn ? 'Subscription plan' : "Offre d'abonnement *"}</label>
                  {activeOrgOffers.length === 0 ? (
                    <p className="text-xs text-amber-600 p-3 rounded-xl border border-amber-500/30 bg-amber-500/5">
                      {isEn ? 'No active offer configured. Go to Subscriptions to create one.' : 'Aucune offre active. Configurez vos offres dans Abonnements.'}
                    </p>
                  ) : (
                    <select
                      value={formuleSouscrite}
                      onChange={(e) => handleOfferChange(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-input bg-background font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {activeOrgOffers.map(offer => (
                        <option key={offer.id} value={offer.nom}>{offer.nom}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Période */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">{isEn ? 'Billing period *' : 'Périodicité *'}</label>
                  <div className="flex gap-2">
                    {(['mensuel', 'trimestriel', 'annuel'] as const).map(freq => {
                      const selectedOffer = activeOrgOffers.find(o => o.nom === formuleSouscrite);
                      const tarif = selectedOffer?.tarifs[freq] || 0;
                      return (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => handleFrequenceChange(freq)}
                          className={`flex-1 py-2.5 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                            convFrequence === freq
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'border-input bg-background text-foreground hover:border-primary/50'
                          }`}
                        >
                          <div className="capitalize">{freq === 'mensuel' ? 'Mensuel' : freq === 'trimestriel' ? 'Trimestriel' : 'Annuel'}</div>
                          {tarif > 0 && (
                            <div className="text-[10px] font-semibold opacity-80 mt-0.5">
                              {tarif.toLocaleString('fr-FR')} FCFA
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Montant */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">{isEn ? 'Amount (FCFA) *' : 'Montant (FCFA) *'}</label>
                  <input
                    type="number"
                    value={convMontant}
                    onChange={(e) => setConvMontant(e.target.value)}
                    placeholder="0"
                    className="w-full p-3 rounded-2xl border border-input bg-background font-bold text-foreground hover:border-primary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Modifiable — pré-rempli depuis le tarif de l'offre</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={() => setIsConvertModalOpen(false)}
                  className="w-full sm:w-1/2 py-3 rounded-2xl border border-input text-xs font-bold hover:bg-muted text-foreground"
                >
                  {isEn ? 'Cancel' : 'Annuler'}
                </button>
                <button
                  onClick={handleConvert}
                  disabled={activeOrgOffers.length === 0}
                  className="w-full sm:w-1/2 py-3 rounded-2xl bg-emerald-500 text-white font-extrabold text-xs hover:bg-emerald-600 shadow-md shadow-emerald-500/25 disabled:opacity-50"
                >
                  {isEn ? 'Confirm sale' : '✓ Confirmer la vente'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WhatsApp Feedback Action Modal */}
      <WhatsAppActionModal
        isOpen={isWhatsAppModalOpen}
        prospectId={prospect.id}
        prospectNom={`${prospect.prenom} ${prospect.nom}`}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </div>
  );
};
